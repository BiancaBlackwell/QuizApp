let static = require('node-static');
let http = require('http');

let port = 8080;
let directory = './public';

let file = new static.Server(directory);

let app = http.createServer(
    function(request, response){
        request.addListener('end',
        function(){
            file.serve(request, response);
        }
        ).resume();
    }
).listen(port);

console.log('The Server is running');

const { server } = require("socket.io");
const io = new http.Server(app);

io.on("connection", (socket) => {

    function serverLog(...messages){
        io.emit('log', ["**** Message from the server:\n"]);
        messages.forEach((item) => {
            io.emit('log',['****\t'+item]);
        })
    }

    serverLog('a page connected to the server: '+socket.id);

    socket.on('disconnect', () => {
        serverLog('a page disconencted from the server: '+socket.id);
    })
});