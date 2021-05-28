
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
def sessions():
    userid = uuid.uuid1()
    return render_template('session.html', userid=userid)

@app.route('/trivia')
def game():
    return render_template('trivia.html')

def messageReceived(methods=['GET', 'POST']):
    print('message was received!!!')

@socketio.on('my event')
def handle_my_custom_event(json, methods=['GET', 'POST']):
    print('received my event: ' + str(json))
    socketio.emit('my response', json, callback=messageReceived)

if __name__ == '__main__':
    socketio.run(app, debug=True)