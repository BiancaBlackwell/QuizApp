from flask import Flask
import sqlite3
import random
import uuid

"""How to use: flask run"""

#cur.execute('''CREATE TABLE questions (id INTEGER PRIMARY KEY AUTOINCREMENT, question TEXT, answer_one TEXT, answer_two TEXT, answer_three TEXT, answer_four TEXT, correct_answer INT)''')
app = Flask(__name__)
DATABASE = 'trivia.db'

def get_db():
	db = getattr(Flask, '_database', None)
	if db is None:
		db = Flask._database = sqlite3.connect(DATABASE, check_same_thread=False)
	return db

@app.route('/')
def index():
	return 'Hello World'

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
        return getFromComplete(row[0], cur)
    return "ToDo " + str(category);

@app.route('/backend/getUserid')
def getUserid():
	#Generate UserID (Randomly)
	userid = uuid.uuid1()
	#Save it in the users table of the DB
	cur = get_db().cursor()
	query = f'INSERT INTO {users} VALUES ({userid}, null);'
    cur.execute(query)
	return userid

#Add user to room or generate room
@app.route('/backend/joinRoom')
def joinRoom(userid, roomid):
	if not verifyUser:
		return False
	if not verifyRoom:
		return False
	cur = get_db().cursor()
	query = f'UPDATE users SET roomid = {roomid} WHERE userid = {userid};'
	cur.execute(query)
	return True

@app.route('/backend/createRoom')
def createRoom(userid):


def getFromComplete(id, cur):
    for row in cur.execute('SELECT * FROM complete WHERE id = ' + str(id)):
        cur.close()
        return str(row)

def verifyUser(userid):
	cur = get_db().cursor()
	query = f'SELECT COUNT(userid) FROM users WHERE userid = {userid};'
	count = cur.execute(query)
	if count > 0:
		return True
	else
		return False

def verifyRoom(roomid):
	cur = get_db().cursor()
	query = f'SELECT COUNT(roomid) FROM rooms WHERE roomid = {roomid};'
	count = cur.execute(query)
	if count > 0:
		return True
	else
		return False 

if __name__ == '__main__':
	app.run(debug=True)