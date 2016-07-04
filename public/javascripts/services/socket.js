angular.module('app.services')

	.factory('socket', function (socketFactory) {
		//var socket = socketFactory();
		// socket.forward('broadcast');
		//return socket;
		return socketFactory();
	});