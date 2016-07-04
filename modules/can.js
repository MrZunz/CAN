var can = require('socketcan');
var sockets = require("./sockets");

function CAN() {
	sockets.on('connection', this.onSocketConnection.bind(this));

	this.channel = can.createRawChannel("can0", true);
	this.channel.addListener("onMessage", this.onCAN0Message.bind(this));
	this.channel.start();

	this.virtualChannel = can.createRawChannel("vcan0", true);
	this.virtualChannel.addListener("onMessage", this.onVCAN0Message.bind(this));
	this.virtualChannel.start();
}

CAN.prototype.onSocketConnection = function(socket) {
	socket.on('can send', this.send.bind(this));
}

CAN.prototype.onCAN0Message = function(msg) {
	sockets.io.emit("can msg", "can0", msg);
}

CAN.prototype.onVCAN0Message = function(msg) {
	sockets.io.emit("can msg", "vcan0", msg);
}

CAN.prototype.send = function(msg) {
	console.log("CAN: Sending", msg);
	this.channel.send(msg);
}

module.exports = exports = new CAN();