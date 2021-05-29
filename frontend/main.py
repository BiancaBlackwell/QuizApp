
from flask import Flask, render_template
from flask_socketio import SocketIO
import uuid

app = Flask(__name__)
app.config['SECRET_KEY'] = 'vnkdjnfjknfl1232#'
socketio = SocketIO(app)



@app.route('/')
def home():
    return render_template('home.html')

@app.route('/lobby')
<<<<<<< HEAD
def sessions():
    userid = uuid.uuid1()
    return render_template('lobby.html', userid=userid)
=======
def lobby():
    return render_template('lobby.html')
>>>>>>> bianca

@app.route('/trivia')
def trivia():
    return render_template('trivia.html')

@app.route('/victory')
def  victory():
	return render_template('victory.html')


def messageReceived(methods=['GET', 'POST']):
    print('message was received!!!')

@socketio.on('my event')
def handle_my_custom_event(json, methods=['GET', 'POST']):
    print('received my event: ' + str(json))
    socketio.emit('my response', json, callback=messageReceived)

if __name__ == '__main__':
    socketio.run(app, debug=True)