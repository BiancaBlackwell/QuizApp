# QuizApp
QuizApp is a Trivia WebApp. It is highly responsive, as all client-to-client interactions have been implemented with flask_socketio.

##Installation##
1) Install nodejs and npm
  Install npm and nodejs from the NodeSource repo:
  ```bash
  curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
  sudo apt install nodejs
  ```
  Or, Install npm and nodejs from Ubuntu repository:
  ```bash
  sudo apt update
  sudo apt install nodejs npm
  sudo apt install build-essential
  ```
2) Install Flask
  ```bash
  pip install Flask
  ```
3) Install other dependencies
  ```bash
  npm install axios
  npm install CORS
  npm install socket.io -client@2.3.0 --save (IMPORTANT: DO THIS EXACTLY!)
  ```
4) Initialize node_modules folder in ~/frontend-react
  ```bash
  npm init
  ```
  note: if you do not have node_modules in ~/frontend-react, it will not run

##Running the Servers##
We have a frontend React server, and a backend Flask webserver. Open two consoles.

In ~/backend run
```bash
flask run
```
In ~/frontend-react run
```bash
npm start
```

Now you should be able to access the site on localhost:3000.

##In-Progress Issues##

Issue  | Details
------------- | -------------
disconnectUser  | The event disconnectUser isn't always fired, so the DB contains users who should no longer exist.
roomid duplicates  | It is possible to have non-unique roomid's, however unlikely. The DB isn't deleting Roomid's at any point.
categories | Choice of categories is not currently implemented, but the front-end component is shown.
timer | Time settings is not currently implemented, but the front-end component is shown. 
joinUrl | You cannot join by cicking the url/roomid yet. You must go through the main page and enter a valid roomid.

##Dependencies##
Frontend: React, axios, socket.io
Backend: Flask, Sqlite3, CORS, flask_socketio

##Contributors##
Austin Mager, Bianca Blackwell, Cameron Egger, John Dikeman

