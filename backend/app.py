from flask import Flask, abort, render_template, request, send_from_directory
import sqlite3
import random
import uuid
import string
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room, send
from werkzeug.datastructures import auth_property

"""How to use: flask run"""

app = Flask(__name__, static_folder="build", static_url_path="/")
app.config['SECRET_KEY'] = 'mysecret'
app.debug = False
app.host = 'localhost'

CORS(app)
DATABASE = 'trivia.db'
socketio = SocketIO(app, cors_allowed_origins="*")


@app.route('/')
def index():
	print('INDEX')
	return app.send_static_file('index.html')


# To Do: Add try-catches for any access to data
# Handler for message recieved on 'connect' channel. Called after user has gotten id and roomid (successfully joined room)
# JoinRoom function. Establish Socket Connection.
@socketio.on('connect')
def test_connect():
	print(f"Socket Connected {request.sid}")


# To Do: disconnect takes a minute to register on the backend once the page is closed
# maybe instead send a event when the component on the front end is going to be unmounted
# JoinRoom function. Establish Socket Connection.
@socketio.on('disconnect')
def test_disconnect():
	print(f"Socket Disconnected {request.sid}")


# JoinRoom function. Add socketid to the user in the Users table. Broadcast update to users.
@socketio.on('identify')
def identify(data):
	print(data)
	roomid = data["roomid"]
	userid = data["userid"]
	if not verifyUser(userid) or not verifyRoom(roomid):
		return
	print(f'Identifying User... Room ID: {roomid}')

	socketid = request.sid
	cur = get_db().cursor()

	#Add the user to the socket's room and update the other players in that room
	join_room(roomid)
	dbSetSocketId(userid, socketid)
	emit('message', {"message":'Player ' + getNicknameFromUserid(userid) + ' has joined!', "userid":'server'}, broadcast=True, room=roomid)
	emit('updatePlayers', getPlayers(roomid), broadcast=True, room=roomid)

	#set up host if this is a new room and one doesn't exist
	print(f'Checking for Host in room {roomid}')
	query = f'SELECT hostid FROM rooms WHERE roomid = "{roomid}"'
	cur.execute(query)
	hostid = cur.fetchone()[0]
	if hostid == None:
		print(f'No Host Found. Setting {userid} as Host.')
		query2 = f'UPDATE rooms SET hostid = "{userid}" WHERE roomid = "{roomid}"'
		cur.execute(query2)
		#tell the players's there's a new host (just the creator since this is a new room)
		emit('newHost', {"userid":userid}, broadcast=True, room=roomid)
		#tell the host they can start the game (since the lobby just has one player, the host)
		emit('yesStart', broadcast=True, room=roomid)
	else:
		#tell the host he cannot start the game since another player was added to an existing room and therefore isn't ready
		emit('noStart', broadcast=True, room=roomid)


# Chat function. Validate message sender, broadcast message to room.
@socketio.on('sendMessage')
def recvMessage(data):
	roomid = data["roomid"]
	userid = data["userid"]
	message = data["message"]
	if not verifyUser(userid) or not verifyRoom(roomid):
		return
	print(f'Recieved Message for room "{roomid}": {message} from {userid}')

	#emit the message to every player in the room grabbing the sender's nickname from the database
	emit('message', {"message":message, "userid":getNicknameFromUserid(userid)}, broadcast=True, room=roomid)


# UserStatistic function. Update nickname in Users table. Broadcast update to room.
# Use first eight characters of userID for now
@socketio.on('nameChange')
def nameChange(data):
	roomid = data["roomid"]
	userid = data["userid"]
	if not verifyUser(userid) or not verifyRoom(roomid):
		return

	# WIP


# RoomSettings function. Verify userID is host of room. Store changes in DB. Broadcast update to room.
# Set to default values
@socketio.on('updateRoomSettings')
def updateRoomSettings(data):
	roomid = data["roomid"]
	userid = data["userid"]

	#Room Settings...
	numquestions = data["numquestions"]
	categories = data["categories"]
	if not verifyUser(userid) or not verifyRoom(roomid):
		return
	print(f'Updating Setting for Room {roomid} with ({numquestions}, {categories})')

	#ensure the host is the only one who can update the settings
	if(isHost(userid,roomid)):
		updateDBSettings(numquestions,categories,roomid)
		#tell the players thee settings have changed. even non-hosts will have a component showing them the current settings
		emit('updateRoomSettings', {"numquestions":numquestions, "categories":categories}, broadcast=True, room=roomid)
	else:
		print(f'ERROR: {userid} is not host.')


# ReadyButton function. Update counter in Rooms table, check room condition, broadcast update to room.
@socketio.on('readyUser')
def readyUser(data):
	roomid = data["roomid"]
	userid = data["userid"]
	if not verifyUser(userid) or not verifyRoom(roomid):
		return
	print(f'Ready user {userid} in room {roomid}')

	#update the player's ready status with True and tell the lobby, changing that player's background to green
	result = dbUpdateReady(userid, roomid, True)
	emit('updatePlayers', getPlayers(roomid), broadcast=True, room=roomid)

	#All users are ready. Enables start button for host
	if result == 1:
		emit('yesStart', broadcast=True, room=roomid)

	#Host Clicked Start Button. Initialize all questions in DB, get first question, broadcast to room.
	if result == 2:
		dbResetReady(roomid)
		fetchQuestions(roomid)
		firstquestion = getFirstQuestion(roomid)
		emit('noStart', broadcast=True, room=roomid)
		emit('updatePlayers', getPlayers(roomid, True), broadcast=True, room=roomid)
		emit("trivia", firstquestion, broadcast=True, room=roomid)


@socketio.on('unreadyUser')
def unreadyUser(data):
	#ReadyButton function. Update counter in Rooms table, broadcast update to room.
	roomid = data["roomid"]
	userid = data["userid"]
	if not verifyUser(userid) or not verifyRoom(roomid):
		return
	print(f'Unready user {userid} in room {roomid}')

	#update the player's ready status with False and tell the lobby, changing that player's background to default, and telling the host they cannot start
	dbUpdateReady(userid, roomid, False)
	emit('noStart', broadcast=True, room=roomid)
	emit('updatePlayers', getPlayers(roomid), broadcast=True, room=roomid)


# UserGameState function. Update time recieved in list in Room table. Update answer submited in Rooms table. Check game condition (kill timer thread if met). 
# Emit update to user who sent you data (right/wrong), Update Points, Broadcast update to room.
# Frontend call: socket.emit("submitAnswer", {"roomid":props.roomid, "userid":props.userid, "answer":choice});
@socketio.on('submitAnswer')
def submitAnswer(data):
	roomid = data["roomid"]
	userid = data["userid"]
	answerChoice = data["answer"]
	if not verifyUser(userid) or not verifyRoom(roomid):
		return
	print(f'Recieved answer {answerChoice} from [{userid} in room {roomid}]')

	#Check if user has answered before, return if so.
	cur = get_db().cursor()
	query = f'SELECT answered FROM users WHERE userid = "{userid}"'
	cur.execute(query)
	status = cur.fetchone()[0]
	if status >= 1:
		print(f"user {userid} has already answered this question!")
		return
	
	#check the player's answer and update score if correct, and update the other player's sidebars
	query1 = f'UPDATE users SET answered = 1 WHERE userid = "{userid}"'
	if validateAnswerChoice(roomid,userid,answerChoice):
		#Set answered = true for userid
		query1 = f'UPDATE users SET answered = 2 WHERE userid = "{userid}"'
	cur.execute(query1)

	# could move this to the end of the function and save on one emit per round but then the next question is displayed before the ready is cleared and that just looks sloppy
	emit('updatePlayers', getPlayers(roomid, True), broadcast=True, room=roomid)

	#Set answered = true for userid
	#query1 = f'UPDATE users SET answered = 1 WHERE userid = "{userid}"'
	#cur.execute(query1)

	#Check if all players have answered
	questionstatus = checkAllPlayersAnswered(roomid)
	if questionstatus == True:
		#go to next question
		#dbResetReady(roomid)
		emit('updatePlayers', getPlayers(roomid, True), broadcast=True, room=roomid)
		nextQuestion(roomid)



"""
server: emits 'trivia' with the first question as data (check)

client: sets question and changes page to trivia (check)

client: emits 'submitAnswer' with their answer (check)

server: gets answer, adjusts score, 
--emits 'updateplayers' to adjust on clients (we can do this on each answer to be more real time or at the end of the round), 
--waits for everyone to answer, by checking a counter incrementing in the DB similar to ready, once everyone's answered (could update scores here at the end of round) 
--then emit 'displayNextQuestion' with the next question as data, 
--if last question emit something to tell players to got to victory page, passing in victory stats as data.
"""
# GameState function. Spawn new timer thread, Broadcast update to room.
def nextQuestion(roomid):
	incrementQuestionIndex(roomid)
	questionlist = getQuestionList(roomid)
	questionindex = getQuestionIndex(roomid)
	maxquestions = getNumQuestions(roomid)

	#if we've reached the last question
	if questionindex == maxquestions:
		#this would be a greaaaaaaat place to put a emit that puts the user on the victory screen
		
		#move players to the victory page, giving them the needed stats
		emit('outOfQuestions', {"podium":getVictoryStats(roomid), "questions":getVictoryQuestions(roomid)}, broadcast=True, room=roomid)

		#reset DB for the next game
		changeGameState(roomid)
		resetAllPlayersAnswered(roomid)
		emit('updatePlayers', getPlayers(roomid, True), broadcast=True, room=roomid)
		resetQuestions(roomid)
		resetScores(roomid)


		#if the room only has the host, have them beable to start
		if checkReady(roomid) >= 1:
			emit('yesStart', broadcast=True, room=roomid)
		return

	#grab the next question and display
	nextquestionid = questionlist[questionindex]
	mydict = getQuestionDetails(nextquestionid)
	mydict["number"] = questionindex + 1
	resetAllPlayersAnswered(roomid)
	emit('updatePlayers', getPlayers(roomid, True), broadcast=True, room=roomid)
	emit('displayNextQuestion',mydict, broadcast=True, room=roomid)


# GameState function. Update.
@socketio.on('clearScores')
def clearScores(data):
	roomid = data["roomid"]
	if not verifyRoom(roomid):
		return
	emit('updatePlayers', getPlayers(roomid), broadcast=True, room=request.sid)



# GameState function. Verify all questions have been served. Update scores in Room table, Broadcast update to room.
@socketio.on('endGame')
def endGame(data):
	roomid = data["roomid"]
	userid = data["userid"]
	if not verifyUser(userid) or not verifyRoom(roomid):
		return

	# WIP


# GameState function. Toggle 'in game' in Room table. Emit update to user who sent you data. Check reset lobby condition. Reset ready status to 0
@socketio.on('returnLobby')
def returnLobby(data):
	roomid = data["roomid"]
	userid = data["userid"]
	if not verifyUser(userid) or not verifyRoom(roomid):
		return

	# WIP


# Disconnect function. Toggle 'connected' in user table. Broadcast update to room.
@socketio.on('disconnectUser')
def disconnectUser(data):
	roomid = data["roomid"]
	userid = data["userid"]
	if not verifyUser(userid) or not verifyRoom(roomid):
		return
	print(f'Disconnecting Player {userid} from room {roomid}')

	#Check if disconnected user is the host, is so switch control
	cur = get_db().cursor()
	query = f'SELECT COUNT(hostid) FROM rooms WHERE hostid = "{userid}" AND roomid = "{roomid}"'
	cur.execute(query)
	count = cur.fetchone()[0]
	if count > 0:
		switch_host(roomid)

	#update the lobby and remove the user from the DB along with any dependencies
	emit('message', {"message":'Player ' + getNicknameFromUserid(userid) + ' has disconnected!', "userid":'server'}, broadcast=True, room=roomid)
	removeUser(userid)
	emit('updatePlayers', getPlayers(roomid), broadcast=True, room=roomid)


# Disconnect function. Toggle 'connected' in Room table. Broadcast update to room
@socketio.on('reconnectUser')
def reconnectUser(data):
	roomid = data["roomid"]
	userid = data["userid"]
	if not verifyUser(userid) or not verifyRoom(roomid):
		return

	# WIP


#####~~~~~~~~~~~~~~~ Questions ~~~~~~~~~~~~~~~#####


@app.route('/backend/getQuestion')
def getQuestion():
	size = 0
	cur = get_db().cursor()
	cur.execute('SELECT COUNT(id) FROM complete')
	size = cur.fetchone()[0]
	return getFromComplete(random.randint(1, size-1), cur)


@app.route('/backend/getQuestion/<category>')
def getQuestionWithCategory(category):
	size = 0
	cur = get_db().cursor()	
	for row in cur.execute('SELECT COUNT(id) FROM ' + category):
		size = row[0]
	for row in cur.execute('SELECT * FROM ' + category + ' WHERE id = ' + str(random.randint(1, size - 1))):
		cur.close()
		return getFromComplete(row[0], cur)
	cur.close()
	return "ToDo " + str(category)


#####~~~~~~~~~~~~~~~ Rooms and Userss ~~~~~~~~~~~~~~~#####


@app.route('/backend/createUser')
def createUser():
	#Generate UserID (Randomly)
	userid = str(uuid.uuid1())
	print(userid)
	
	#Save it in the users table of the DB
	db = get_db()
	cur = db.cursor()
	query = f'INSERT INTO users VALUES (null, "{userid}", null, null, "{userid[0:8]}", 0, 0, 1, 0);'
	cur.execute(query)

	cur.close()
	db.commit()
	return userid


#Add user to room or generate room
@app.route('/backend/joinRoom/<userid>=<roomid>')
def joinRoom(userid, roomid):
	print("userid: {userid} and roomid {roomid}")
	if not verifyUser(userid) or not verifyRoom(roomid):
		abort(500)

	db = get_db()
	cur = db.cursor()
	query = f'UPDATE users SET roomid = "{roomid}" WHERE userid = "{userid}";'
	cur.execute(query)
	query = f'UPDATE rooms SET partysize = partysize + 1 WHERE roomid = "{roomid}";'
	cur.execute(query)

	cur.close()
	db.commit()
	return "True"


@app.route('/backend/createRoom')
def createRoom():
	#create a unique roomid
	roomid = getRandomString(8)
	while verifyRoom(roomid):
		roomid = getRandomString(8)

	#add room to database
	db = get_db()
	cur = db.cursor()
	query = f'INSERT INTO rooms VALUES ("{roomid}", 0, 0, null, 10, "",0,"",-1);'
	cur.execute(query)

	# close cursor and commit change
	cur.close()
	db.commit()
	return roomid


@app.route('/backend/removeRoom/<roomid>')
def removeRoom(roomid):
	#verify the room exists
	if not verifyRoom(roomid):
		abort(500)

	#remove room to database
	db = get_db()
	cur = db.cursor()
	query = f'DELETE FROM rooms WHERE roomid = "{roomid}";'
	cur.execute(query)
	query = f'DELETE FROM users WHERE roomid = "{roomid}";'
	cur.execute(query)

	# close cursor and commit change
	cur.close()
	db.commit()
	return "True"


@app.route('/backend/removeUser/<userid>')
def removeUser(userid):
	#verify the room exists
	if not verifyUser(userid):
		abort(500)

	#remove room to database
	db = get_db()
	cur = db.cursor()

	query = f'SELECT roomid FROM users WHERE userid = "{userid}";'
	cur.execute(query)
	roomid = cur.fetchone()[0]

	query = f'DELETE FROM users WHERE userid = "{userid}";'
	cur.execute(query)

	query = f'UPDATE rooms SET partysize = partysize - 1 WHERE roomid = "{roomid}";'
	cur.execute(query)

	query = f'DELETE FROM rooms WHERE partysize = 0;'
	cur.execute(query)

	# close cursor and commit change
	cur.close()
	db.commit()
	return "True"


#####~~~~~~~~~~~~~~~ Helper Methods ~~~~~~~~~~~~~~~#####


# Returns a db object that we can use to access the database
def get_db():
	db = getattr(Flask, '_database', None)
	if db is None:
		db = Flask._database = sqlite3.connect(DATABASE, check_same_thread=False)
	return db


# Returns a tuple containing the full question data for a question with a given id
def getFromComplete(id, cur):
	for row in cur.execute('SELECT * FROM complete WHERE id = ' + str(id)):
		cur.close()
		return row
		

# Verify that a userid exists in the DB
def verifyUser(userid):
	cur = get_db().cursor()
	query = f'SELECT COUNT(userid) FROM users WHERE userid = "{userid}";'
	cur.execute(query)
	count = cur.fetchone()[0]
	cur.close()
	return (count > 0)


# Verify that a roomid exists in the DB
def verifyRoom(roomid):
	cur = get_db().cursor()
	query = f'SELECT COUNT(roomid) FROM rooms WHERE roomid = "{roomid}";'
	cur.execute(query)
	count = cur.fetchone()[0]
	cur.close()
	return (count > 0)


# Verify that a socketid exists in the DB
def verifySocketid(socketid):
	cur = get_db().cursor()
	query = f'SELECT COUNT(socketid) FROM users WHERE socketid = "{socketid}";'
	cur.execute(query)
	count = cur.fetchone()[0]
	cur.close()
	return (count > 0)


# Returns a list of player objects containing the name, and isReady status, and possiibly scores for use in displaying the player sidebar
def getPlayers(roomid, scores=False):
	cur = get_db().cursor()
	query = f'SELECT nickname, isReady, score, answered FROM users WHERE roomid = "{roomid}";'
	cur.execute(query)

	#for each player in a room add them to the list with the requested info
	players = []
	for player in cur.fetchall():

		print(f'({player[1]}, {player[3]})')

		backgroundColor = "#85c3cf"
		if player[3] == 1:
			backgroundColor = "#eb4034"
		elif player[1] == 1 or player [3] == 2:
			backgroundColor = "#2ec949"

		if scores:
			players.append({"name":player[0],"backgroundColor":backgroundColor, "score":player[2]})
		else:
			players.append({"name":player[0],"backgroundColor":backgroundColor})
	cur.close()
	return players


# Set the players ready status for use in the player sidebar and triggering the game's start
def dbUpdateReady(userid, roomid, isReady):
	cur = get_db().cursor()
	query = f'UPDATE users SET isReady = {1 if isReady else 0} WHERE userid = "{userid}" AND roomid = "{roomid}";'
	cur.execute(query)

	#updates the room's ready count
	query = f'UPDATE rooms SET numReady = numReady {"+ 1" if isReady else "- 1"} WHERE roomid = "{roomid}";'
	cur.execute(query)
	cur.close()
	return checkReady(roomid)


# Checks the ready status of the room 
def checkReady(roomid):
	cur = get_db().cursor()
	query = f'SELECT partysize, numReady FROM rooms WHERE roomid = "{roomid}";'
	cur.execute(query)
	room = cur.fetchone()
	cur.close()

	print(f'CheckReady: room {roomid} has {room[0]} players and {room[1]} ready')

	#if everyone is ready then the host has started
	if(room[0] == room[1]):
		return 2

	#if all but host is ready then host can start
	if(room[0] == room[1] + 1):
		return 1

	#else room is not yet ready
	return 0


# Resets the ready status of all users in a room as well as the room
def dbResetReady(roomid):
	cur = get_db().cursor()
	query = f'UPDATE users SET isReady = 0 WHERE roomid = "{roomid}";'
	cur.execute(query)
	query = f'UPDATE rooms SET numReady = 0 WHERE roomid = "{roomid}";'
	cur.execute(query)
	cur.close()


# Return the nickname for a given userid
def getNicknameFromUserid(userid):
	cur = get_db().cursor()
	query = f'SELECT nickname FROM users WHERE userid = "{userid}";'
	cur.execute(query)
	name = cur.fetchone()[0]
	cur.close()
	return name


# Sets the socketid to a given userid
def dbSetSocketId(userid, socketid):
	cur = get_db().cursor()
	query = f'UPDATE users SET socketid = "{socketid}" WHERE userid = "{userid}";'
	cur.execute(query)
	cur.close()
	

# Returns the userid associated with a given socketid
def getUseridFromSocketid(socketid):
	cur = get_db().cursor()
	query = f'SELECT userid FROM users WHERE socketid = "{socketid}";'
	cur.execute(query)
	userid = cur.fetchone()[0]
	cur.close()
	return userid


# Returns the roomid associated with a given socketid
def getRoomidFromSocketid(socketid):
	cur = get_db().cursor()
	query = f'SELECT roomid FROM users WHERE socketid = "{socketid}";'
	cur.execute(query)
	roomid = cur.fetchone()[0]
	cur.close()
	return roomid


# Returns a random string of a given length with upper and lowercase letters, for use as a roomid
def getRandomString(length):
	letters = string.ascii_lowercase + string.ascii_uppercase
	result_str = ''.join(random.choice(letters) for i in range(length))
	return result_str


# Handles disconnect user when user is host
def switch_host(roomid):
	cur = get_db().cursor()
	query = f'SELECT COUNT(userid) FROM users WHERE roomid = "{roomid}"'
	cur.execute(query)
	count = cur.fetchone()[0]

	# if there are still users in the room, switch host
	if count >= 2:
		query2 = f'SELECT userid FROM users WHERE roomid = "{roomid}" LIMIT 1'
		cur.execute(query2)
		nextHost = cur.fetchone()[0]
		query3 = f'UPDATE rooms SET hostid = {nextHost} WHERE roomid = {roomid}'
		cur.execute(query3)

		#update the other players in the room
		emit('newHost', {"userid":nextHost}, broadcast=True, room=roomid)
		emit('message', {"message":'Player ' + getNicknameFromUserid(nextHost) + ' is now Host!', "userid":'server'}, broadcast=True, room=roomid)
	cur.close()

		
# Increments the party size of the given room
def incrementRoom(roomid):
	cur = get_db().cursor()
	query = f'UPDATE rooms SET partysize = partysize + 1 WHERE roomid = "{roomid}"'
	cur.execute(query)
	cur.close()


# Updates the current game settings of the given room
def updateDBSettings(numquestions,categories,roomid):
	cur = get_db().cursor()
	query = f'UPDATE rooms SET numquestions = "{numquestions}", categories = "{categories}" WHERE roomid = "{roomid}"'
	cur.execute(query)
	cur.close()


# Checks if a user is the host of a given room
def isHost(userid,roomid):
	cur = get_db().cursor()
	query = f'SELECT hostid FROM rooms WHERE roomid = "{roomid}"'
	cur.execute(query)
	hostid = cur.fetchone()[0]
	cur.close()
	return (hostid == userid)


# Toggles current ingame state. 0 = not in game, 1 = in game
def changeGameState(roomid):
	cur = get_db().cursor()
	#query = f'SELECT ingame from rooms WHERE roomid = "{roomid}"'
	#cur.execute(query)
	#ingame = cur.fetchone()[0]
	#ingame = abs(ingame + 1)
	#query1 = f'UPDATE rooms SET ingame = "{ingame}" WHERE roomid = "{roomid}"'
	query1 = f'UPDATE rooms SET ingame = (ingame + 1) % 2 WHERE roomid = "{roomid}"'
	cur.execute(query1)
	cur.close()


# Resets the questionlist and index for a given roomid, used to reset for the next game
def resetQuestions(roomid):
	cur = get_db().cursor()
	query = f'UPDATE rooms SET questionlist = "", questionindex = -1 WHERE roomid = "{roomid}"'
	cur.execute(query)
	cur.close()


# Resets the scores for all players with a given roomid, used to reset for the next game
def resetScores(roomid):
	cur = get_db().cursor()
	query = f'UPDATE users SET score = 0 WHERE roomid = "{roomid}"'
	cur.execute(query)
	cur.close()


# Given a question list, stores it in the DB (in both full list and nextQuestionList)
def storeQuestionList(questionlist,roomid):
	print(f"MY QUESTIONNTY QUESTION LIST IS {questionlist}")
	mylist = ' '.join([str(elem) for elem in questionlist])
	print(f"AFTER JOINING MY QUESTIONTY QUESION LIST IS {mylist}")
	cur = get_db().cursor()
	query = f'UPDATE rooms SET questionlist = "{mylist}" WHERE roomid = "{roomid}"'
	cur.execute(query)
	cur.close()
	print(f"SETTING QUESTION LIST FOR ROOM TO : {mylist}")


# Fetchess a set of questions for a given room
def fetchQuestions(roomid):
	count = getNumQuestions(roomid)
	questionlist = list()
	print(f"Starting the Game for room {roomid}")
	changeGameState(roomid)
	print(f"Fetching questions for Room {roomid}")
	for i in range(count):
		newquestion = getRandomQuestionId()
		questionlist.append(newquestion)
	storeQuestionList(questionlist,roomid)


# Gets details of a single question returns in dict
# Expected output: { "question":"Hello", "answers":["1", "2"] }
def getQuestionDetails(nextquestionid):
	cur = get_db().cursor()
	query = f'SELECT * FROM complete WHERE id = "{nextquestionid}"'
	cur.execute(query)
	row = cur.fetchone()
	cur.close()
	question = row[1]
	answers = []
	TFcount = 0
	for i in range(4):
		newans = row[i+2]
		if TFcount == 2:
			break
		if(newans == "False" or newans == "True" or newans == "Yes" or newans == "No"):
			TFcount = TFcount + 1
		answers.append(newans)
		
	mydict = {"question":question, "answers":answers}
	print(F"THESE ARE THE ANSWERSSSSSSSS: {answers}")
	return mydict


# Returns the numquestions setting for a given room 
def getNumQuestions(roomid):
	cur = get_db().cursor()
	query = f'SELECT numquestions FROM rooms WHERE roomid = "{roomid}"'
	cur.execute(query)
	count = cur.fetchone()[0]
	cur.close()
	return count


# Special call for when the lobby starts.
def getFirstQuestion(roomid):
	cur = get_db().cursor()
	query = f'SELECT questionlist FROM rooms WHERE roomid = "{roomid}"'
	cur.execute(query)
	questionlist = cur.fetchone()[0]
	cur.close()

	print(f"MY QUESTION STRING IS: {questionlist}")
	mylist = list(questionlist.split(" "))
	print(f"MY QUESTION LIST IS: {mylist}")
	incrementQuestionIndex(roomid)
	mydict = getQuestionDetails(mylist[0])
	mydict["number"] = 1
	return mydict


def incrementQuestionIndex(roomid):
	cur = get_db().cursor()
	query = f'UPDATE rooms SET questionindex = questionindex + 1 WHERE roomid = "{roomid}"'
	cur.execute(query)
	cur.close()


# Get questionid from questionlist and questionindex in rooms, then lookup in complete for the correct answer and check. If correct, update score. if not, don't.
def validateAnswerChoice(roomid,userid,answerChoice):
	cur = get_db().cursor()
	query = f'SELECT questionlist, questionindex FROM rooms WHERE roomid = "{roomid}"'
	cur.execute(query)
	row = cur.fetchone()
	questionstr = row[0]
	questionlist = list(questionstr.split(" "))
	questionindex = row[1]
	print(f'***Question index {questionindex}')
	answer = getQuestionAnswer(questionlist[questionindex])

	print(f'User entered {answerChoice} the Correct Answer is: {answer}')

	#Update points
	if(answer == answerChoice):
		print('Updating Score')
		query2 = f'UPDATE users SET score = score + 1 WHERE userid = "{userid}"'
		cur.execute(query2)
		cur.close()
		return True
	cur.close()
	return False


# Gets answer to the question given the id in complete
def getQuestionAnswer(questionid):
	cur = get_db().cursor()
	query = f'SELECT correct_answer FROM complete WHERE id = "{questionid}"'
	cur.execute(query)
	answer = cur.fetchone()[0]
	cur.close()
	return answer


# Checks if everyone in a room (and connected) has answered the question. if they have return true.
def checkAllPlayersAnswered(roomid):
	cur = get_db().cursor()
	query = f'SELECT COUNT(userid) FROM users WHERE roomid = "{roomid}" AND connected = 1'
	cur.execute(query)
	countconnected = cur.fetchone()[0]
	print(f"THIS IS HOW MANY PEOPLE ARE CONNECTED {countconnected}")
	query2 = f'SELECT COUNT(userid) FROM users WHERE roomid = "{roomid}" AND connected = 1 AND answered >= 1'
	cur.execute(query2)
	countanswered = cur.fetchone()[0]
	cur.close()
	print(f"THIS IS HOW MANY PEOPLE HAVE ANSSWWWEEERRRED {countanswered}")
	if(countconnected == countanswered):
		return True
	return False


# Checks the questionlist from DB for rooms, returns it as a list
def getQuestionList(roomid):
	cur = get_db().cursor()
	query = f'SELECT questionlist FROM rooms WHERE roomid = "{roomid}"'
	cur.execute(query)
	questionstr = cur.fetchone()[0]
	cur.close()
	questionlist = list(questionstr.split(" "))	
	return questionlist


# Returns the questionindex for a given roomid
def getQuestionIndex(roomid):
	cur = get_db().cursor()
	query = f'SELECT questionindex FROM rooms WHERE roomid = "{roomid}"'
	cur.execute(query)
	questionindex = cur.fetchone()[0]
	cur.close()
	return questionindex


# Resets the answered status for all users in a given room
def resetAllPlayersAnswered(roomid):
	cur = get_db().cursor()
	query = f'UPDATE users SET answered = 0 WHERE roomid = "{roomid}"'
	cur.execute(query)
	cur.close()


# Returns the 3 players with the highest score in a given room
def getVictoryStats(roomid):
	players = getPlayers(roomid, True)
	#sort by score
	players = sorted(players, key = lambda name: name['score'])
	#reverse
	list.reverse(players)
	#take top 3
	players = players[0:3]
	maxScore = max(players[0]["score"], 1)
	for ind in range(len(players)):
		players[ind]["height"] = round(players[ind]["score"] / maxScore * 125)
		players[ind]["place"] = ind

	#swap the first and second place players to correctly display on the podium
	if len(players) == 3:
		temp = players[1]
		players[1] = players[0]
		players[0] = temp
	return {"topPlayers":players}


# Returns every question shown to a room for use on the final victory page
def getVictoryQuestions(roomid):
	victoryList = []
	i = 1
	for qid in getQuestionList(roomid):
		question = getQuestionDetails(qid)
		question["number"] = i
		question["correct_answer"] = getQuestionAnswer(qid)
		victoryList.append(question)
		i += 1
	return victoryList


# Returns a random questionid from the complete table of questions
def getRandomQuestionId():
	cur = get_db().cursor()
	cur.execute('SELECT COUNT(id) FROM complete')
	size = cur.fetchone()[0]
	return random.randint(1, size-1)

if __name__ == '__main__':
	socketio.run(app)	