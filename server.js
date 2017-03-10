"use strict";

var http = require('http'),
    url = require('url');
var WebSocketServer = require('ws').Server;
var Router = require('node-simple-router');

var echoPort = process.argv[2],
    httpPort = process.argv[3],
    socketPort = 4011;

// --- socket ---
var wss = new WebSocketServer({ port: socketPort });

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};

// --- http ---
var router = new Router({static_route: __dirname + '/static'});

http.createServer(router)
    .listen(httpPort);

// --- echo ---
http.createServer(function (request, response) {
	writeMeta(request);
  
  if (request.method == 'OPTIONS') {
    writeCORSHeader(request, response);
    response.end();
  } else if (request.method == 'POST') {
    writeBody(request, response);
  } else {
		writeParams(request, response);
    writeCORSHeader(request, response);
    writeResponse(response);
  }
}).listen(echoPort);

function writeMeta(request) {
	var date = new Date(),
	    outStr = "\n --- New " + request.method + " Request --- \n" +
	             "date: " + date.toLocaleDateString() + " - " + date.toLocaleTimeString() + "\n" +
               "header: \n" +
	             JSON.stringify(request.headers, null, 2);

	wss.broadcast(outStr);
	console.log(outStr);
}

function writeBody(request, response) {
	var outStr = "body: \n";

	request.on('data', function(chunk) {
		outStr += chunk.toString() + "\n";
	});
	request.on('end', function() {
		wss.broadcast(outStr);
		console.log(outStr);

    writeCORSHeader(request, response);
		writeResponse(response);
	});
}

function writeParams(request, response) {
	var urlParts = url.parse(request.url, true),
	    outStr = "params: \n" +
			         JSON.stringify(urlParts.query, null, 2);

	wss.broadcast(outStr);
	console.log(outStr);
}

function writeResponse(response) {
  response.writeHead(200, "OK", { 'Content-Type': 'text/html' });
  response.end("");
}

function writeCORSHeader(request, response) {
  response.setHeader('Access-Control-Allow-Origin', request.headers.origin || "*");
	response.setHeader('Access-Control-Request-Method', '*');
	response.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, POST, PUT, DELETE, CONNECT, OPTIONS, TRACE');
	response.setHeader('Access-Control-Allow-Headers', 'authorization, content-type');
}
