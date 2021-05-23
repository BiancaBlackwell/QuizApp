from flask import Flask
import sqlite3
import random

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
    for row in cur.execute('SELECT COUNT(id) FROM questions'):
        size = row[0]
    for row in cur.execute('SELECT * FROM questions WHERE id = ' + str(random.randint(1, size - 1))):
        cur.close()
        return str(row)
    return "Unexpected Failure"

@app.route('/backend/getQuestion/<category>')
def getQuestionWithCategory(category):
    return "ToDo " + str(category);

if __name__ == '__main__':
	app.run(debug=True)