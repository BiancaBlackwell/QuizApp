import io from "socket.io-client";

//const SOCKET_URL = "https://quizzicalquizapp.herokuapp.com:5000"
const PORT = process.env.PORT || 5000;
//const SOCKET_URL = "http://localhost:"+PORT;
const SOCKET_URL = "https://quizzicalquizapp.herokuapp.com:"+PORT;

let socket = io.connect(`${SOCKET_URL}`);

export default socket;