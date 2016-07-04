// Required modules
var SocketIO = require("socket.io");
var util = require('util');
var EventEmitter = require('events').EventEmitter;

// Constructor
function Sockets() {
	this.io = null;
	this.connections = {};
}

// Inherit 'on' and 'emit' functions
util.inherits(Sockets, EventEmitter);

// The rest of our own functions
Sockets.prototype.listen = function(server) {
	var self = this;
	this.io = SocketIO.listen(server);

	this.io.sockets.on('connection', this.onConnection.bind(this));
	this.io.sockets.on('disconnect', this.onDisconnect.bind(this));
}

Sockets.prototype.onConnection = function(socket) {
	console.log("Sockets:", "Someone connected");
	this.emit("connection", socket);
	this.connections[socket.id] = socket;
}

Sockets.prototype.onDisconnect = function(socket) {
	console.log("Sockets:", "Someone disconnected");
	this.emit("disconnect");
	delete this.connections[socket.id];
}

// Export the class as singleton
module.exports = exports = new Sockets();