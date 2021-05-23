let socket = io();
socket.on('log', function(array){
    console.log.apply(console, array);
});