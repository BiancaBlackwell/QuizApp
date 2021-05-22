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