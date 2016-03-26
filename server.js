var http = require('http');
var url = require('url');

var port = process.argv[2];

function writeResponse(response) {
	response.writeHead(200, "OK", {'Content-Type': 'text/html'});
	response.end("");
}

var server = http.createServer(function (request, response) {
	console.log("Request: " + request.method);
	console.log(request.headers);
	
	if (request.method == 'POST') {
		request.on('data', function(chunk) {
			console.log("Received body data:");
			console.log(chunk.toString());
		});
		request.on('end', function() {
			writeResponse(response);
		});
	} else {
		writeResponse(response);
	}
});

server.listen(port);

