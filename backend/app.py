from flask import Flask, abort, render_template
import sqlite3
import random
import uuid
import string
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room, send

"""How to use: flask run"""

#cur.execute('''CREATE TABLE questions (id INTEGER PRIMARY KEY AUTOINCREMENT, question TEXT, answer_one TEXT, answer_two TEXT, answer_three TEXT, answer_four TEXT, correct_answer INT)''')
app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecret'
app.debug = True
app.host = 'localhost'

CORS(app)
DATABASE = 'trivia.db'
socketio = SocketIO(app, cors_allowed_origins="*")

values = {
	'slider1':25,
	'slider2':0, 
}

@app.route('/')
def index():
	return render_template('lobby.html',**values)

#To Do: Add try-catches for any access to data
#Handler for message recieved on 'connect' channel. Called after user has gotten id and roomid (successfully joined room)
@socketio.on('connect')
def test_connect():
	#JoinRoom function. Establish Socket Connection.
	print("Socket Connected")

@socketio.on('identify')
def identify(data):
	#JoinRoom function. Add socketid to the user in the Users table. Broadcast update to users.
	roomid = data["roomId"]
	userid = data["userId"]
	socketid = request.sid
	print(f'Identifying User... Room ID: {data["roomId"]}')
	join_room(data["roomId"])
	#values[message['who']] = message['data']
	#emit('update value', message, broadcast=True)

@socketio.on('sendMessage')
def recvMessage(data):
	#Chat function. Validate message sender, broadcast message to room.
	roomid = data["roomId"]
	message = data["message"]
	print(f'Recieved Message for room "{roomid}": {message}')
	#emit('message', message, broadcast=True)
	emit('message', message, broadcast=True, room=roomid)

@socketio.on('nameChange')
def nameChange(data):
	#UserStatistic function. Update nickname in Users table. Broadcast update to room.
	#Use first eight characters of userID for now
	roomid = data["roomId"]
	userid = data["userId"]

@socketio.on('updateRoomSettings')
def updateRoomSettings(data):
	#RoomSettings function. Verify userID is host of room. Store changes in DB. Broadcast update to room.
	#Set to default values
	roomid = data["roomId"]
	userid = data["userId"]

@socketio.on('readyUser')
def readyUser(data):
	#ReadyButton function. Update counter in Rooms table, check room condition, broadcast update to room.
	roomid = data["roomId"]
	userid = data["userId"]

@socketio.on('unreadyUser')
def unreadyUser(data):
	#ReadyButton function. Update counter in Rooms table, broadcast update to room.
	roomid = data["roomId"]
	userid = data["userId"]

@socketio.on('startGame')
def startGame(data):
	#GameState function. Validate userid as host. Broadcast update to room.
	roomid = data["roomId"]
	userid = data["userId"]

@socketio.on('submitAnswer')
def submitAnswer(data):
	#UserGameState function. Update time recieved in list in Room table. Update answer submited in Rooms table. Check game condition (kill timer thread if met). 
	#Emit update to user who sent you data (right/wrong), Broadcast update to room.
	roomid = data["roomId"]
	userid = data["userId"]

@socketio.on('nextQuestion')
def nextQuestion(data):
	#GameState function. Update points in DB, Spawn new timer thread, Broadcast update to room.
	roomid = data["roomId"]
	userid = data["userId"]

@socketio.on('endGame')
def endGame(data):
	#GameState function. Verify all questions have been served. Update scores in Room table, Broadcast update to room.
	roomid = data["roomId"]
	userid = data["userId"]

@socketio.on('returnLobby')
def returnLobby(data):
	#GameState function. Toggle 'in game' in Room table. Emit update to user who sent you data. Check reset lobby condition.
	roomid = data["roomId"]
	userid = data["userId"]

@socketio.on('disconnectUser')
def disconnectUser(data):
	#Disconnect function. Toggle 'connected' in Room table. Broadcast update to room.
	roomid = data["roomId"]
	userid = data["userId"]

@socketio.on('reconnectUser')
def reconnectUser(data):
	#Disconnect function. Toggle 'connected' in Room table. Broadcast update to room
	roomid = data["roomId"]
	userid = data["userId"]


#####~~~~~~~~~~~~~~~ Questions ~~~~~~~~~~~~~~~#####


@app.route('/backend/getQuestion')
def getQuestion():
	size = 0
	cur = get_db().cursor()
	for row in cur.execute('SELECT COUNT(id) FROM complete'):
		size = row[0]
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
	return "ToDo " + str(category);




#####~~~~~~~~~~~~~~~ Rooms and Userss ~~~~~~~~~~~~~~~#####


@app.route('/backend/createUser')
def createUser():
	#Generate UserID (Randomly)
	userid = str(uuid.uuid1())
	print(userid)
	#Save it in the users table of the DB
	db = get_db()
	cur = db.cursor()
	query = f'INSERT INTO users VALUES (null,"{userid}",null,null,null);'
	cur.execute(query)

	cur.close()
	db.commit()
	return userid

#Add user to room or generate room
@app.route('/backend/joinRoom/<userid>=<roomid>')
def joinRoom(userid, roomid):
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
	query = f'INSERT INTO rooms VALUES ("{roomid}", 0);'
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


def get_db():
	db = getattr(Flask, '_database', None)
	if db is None:
		db = Flask._database = sqlite3.connect(DATABASE, check_same_thread=False)
	return db

def getFromComplete(id, cur):
	for row in cur.execute('SELECT * FROM complete WHERE id = ' + str(id)):
		cur.close()
		return str(row)

def verifyUser(userid):
	cur = get_db().cursor()
	query = f'SELECT COUNT(userid) FROM users WHERE userid = "{userid}";'
	cur.execute(query)
	count = cur.fetchone()[0]
	cur.close()
	if count > 0:
		return True
	return False

def verifyRoom(roomid):
	cur = get_db().cursor()
	query = f'SELECT COUNT(roomid) FROM rooms WHERE roomid = "{roomid}";'
	cur.execute(query)
	count = cur.fetchone()[0]
	cur.close()
	if count > 0:
		return True
	return False 

def getRandomString(length):
	letters = string.ascii_lowercase + string.ascii_uppercase
	result_str = ''.join(random.choice(letters) for i in range(length))
	return result_str


if __name__ == '__main__':
	socketio.run(app)	