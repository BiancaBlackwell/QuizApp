import io from "socket.io-client";

const SOCKET_URL = "http://quizzically.app:5000"
let socket = io.connect(`${SOCKET_URL}`);

export default socket;