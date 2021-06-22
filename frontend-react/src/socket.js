import io from "socket.io-client";

const SOCKET_URL = "http://localhost:5000"
let socket = io.connect(`${SOCKET_URL}`);

export default socket;