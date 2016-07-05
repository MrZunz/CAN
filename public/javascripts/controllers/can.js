angular.module('app.controllers').controller('canController', function ($scope, socket, cfpLoadingBar) {
	//cfpLoadingBar.start();

	$scope.messages = {};
	$scope.blacklist = localStorage.getItem("blacklist") != null ? JSON.parse(localStorage.getItem("blacklist")) : new Array();
	$scope.queue = localStorage.getItem("queue") != null ? JSON.parse(localStorage.getItem("queue")) : new Array();
	$scope.newMessage = { id: null, bytes: new Array() };

	$scope.scan = { type: "Changed", messages: {} };

	socket.on('can msg', function(channel, msg) {
		
		// convert the id to hex
		var id = msg.id.toString(16);											

		// dont add it to the list if it is blacklist
		if($scope.blacklist.indexOf(id) > -1) {
			return;
		}

		// object to be added to the $scope.messages;
		var message = { id: id, data: msg.data, bytes: [msg.data.byteLength], count: 1, changed:  false, changeCount: 0, datetime: new Date() }; 

		// check if the message has ever changed
		if($scope.messages[id]) {
			message.changed = $scope.messages[id].changed;
			message.changeCount = $scope.messages[id].changeCount;
		}

		// raw message data
		var buffer = new Uint8Array(msg.data);	

		// loop through the bytes in the raw data
		for (var i = buffer.length - 1; i >= 0; i--) {

			// convert the byte to hex format from the raw buffer
			var value = ("0" + buffer[i].toString(16)).substr(-2); 					

			// check if the byte has been changed
			var changed = false;
			if($scope.messages[id] && $scope.messages[id].bytes[i]) {
				//debugger;
				var saved = ("0" + $scope.messages[id].bytes[i].value).substr(-2);
				changed = saved != value;
			}

			if(changed) {
				message.changed = true;
			}

			// add the hex value and if it has changed to the message object
			message.bytes[i] = { value: value, changed: changed };
		}

		// Count the amount of times we've seen this id
		if($scope.messages[id]) {
			message.count = $scope.messages[id].count + 1;
		}

		// if one of the bytes has changed, up the changeCount
		var bytesChanged = 0;
		for (var i = 0; i < message.bytes.length; i++) {
			if(message.bytes[i].changed) {
				bytesChanged++;
			}
		}

		if($scope.messages[id] && bytesChanged > 0) {
			message.changeCount = $scope.messages[id].changeCount + 1;
		}

		// check the interval between messages
		if($scope.messages[id]) {
			var interval = new Date() - $scope.messages[id].datetime;
			message.interval = interval;
			// /debugger;
		}

		// Add the message object to the array
		$scope.messages[message.id] = message;

		//console.log(message);
	});

	$scope.addToBlacklist = function(id) {
		if($scope.blacklist.indexOf(id) == -1) {
			$scope.blacklist.push(id);
			$scope.messages[id] = undefined;
		}
		
		localStorage.setItem("blacklist", JSON.stringify($scope.blacklist));
	}

	$scope.clearBlacklist = function() {
		localStorage.clear();
		$scope.blacklist = new Array();
	}

	$scope.moveToQueue = function(msg) {
		var m = { id: msg.id, bytes: new Array() };

		for (var i = 0; i < msg.bytes.length; i++) {
			var byte = msg.bytes[i];
			m.bytes[i] = byte.value;
		}

		$scope.queue.push(m);
		$scope.saveQueue();
	}

	$scope.addToQueue = function() {
		if($scope.newMessage.id) {
			$scope.queue.push($scope.newMessage);
			$scope.saveQueue();
			scope.newMessage = { id: null, bytes: new Array() };
		}

	}

	$scope.removeFromQueue = function(index) {
		$scope.queue.splice(index, 1);
		$scope.saveQueue();
	}

	$scope.saveQueue = function() {
		localStorage.setItem("queue", JSON.stringify($scope.queue));
	}

	$scope.moveUpInQueue = function(index) {
		$scope.queue.move(index, index - 1);
		$scope.saveQueue();
	}

	$scope.moveDownInQueue = function(index) {
		$scope.queue.move(index, index + 1);
		$scope.saveQueue();
	}

	$scope.processQueue = function() {

		for (var m = 0; m < $scope.queue.length; m++) {
			var message = $scope.queue[m];

			var data = new Uint8Array(message.bytes.length);

			// create normal arraybuffer from bytesarray
			for (var b = 0; b < message.bytes.length; b++) {
				var byte = message.bytes[b];
				data[b] = parseInt(byte, 16);
			}
			//debugger;
			$scope.send(parseInt(message.id, 16), data.buffer);

		}
	}

	$scope.send = function(id, data) {
		socket.emit('can send', {id: id, data: data});
	}

	$scope.startScan = function() {

		$scope.scan.state = "started";

		// Make copy of the current state of messages
		if(Object.keys($scope.scan.messages).length == 0) {
			for(var i in $scope.messages) {
				var message = JSON.parse(JSON.stringify($scope.messages[i]));
				$scope.scan.messages[i] = message;
			}
		}
	}

	$scope.restartScan = function() {

		$scope.scan.state = "";

		// Make copy of the current state of messages
		if(Object.keys($scope.scan.messages).length > 0) {
			for(var i in $scope.scan.messages) {
				delete $scope.scan.messages[i];
			}
		}

		$scope.startScan();
	}

	$scope.nextScan = function() {

		// Loop over current messages stored in the scan
		for(var m in $scope.scan.messages) {
			var storedMessage = $scope.scan.messages[m];
			var currentMessage = $scope.messages[m];
			storedMessage.changed = false;
			
			// Check if the data has been changed or not
			for(var sb = 0; sb < storedMessage.bytes.length; sb++) {

				if(sb >= currentMessage.bytes.length) {
					continue;
				}

				var storedByte = parseInt(storedMessage.bytes[sb].value, 16);
				var currentByte = parseInt(currentMessage.bytes[sb].value, 16);

				// Reset the changed flag so we can use it for the scan
				storedMessage.bytes[sb].changed = false;
				currentMessage.bytes[sb].changed = false;

				if(storedByte != currentByte) {
					storedMessage.bytes[sb].changed = true;
				}

				switch($scope.scan.type) {
					case "Increased":
						if(storedByte > currentByte) {
	
						}
						else {
							delete $scope.scan.messages[m];
						}
						break;

					case "Decreased":
						if(storedByte < currentByte) {

						}
						else {
							delete $scope.scan.messages[m];
						}
						break;

					case "Changed":
						if(storedMessage.changed == false && storedMessage.bytes[sb].changed == true) {
							storedMessage.changed = true;
						}
						
						break;
					
					case "Unchanged":
						if(storedMessage.changed == false && storedMessage.bytes[sb].changed == true) {
							storedMessage.changed = true;
						}
						break;
				}

				storedMessage.bytes[sb].value = currentMessage.bytes[sb].value;
			}

		}

		switch($scope.scan.type) {
			case "Changed":
				// delete every message that is not marked as changed
				for(var m in $scope.scan.messages) {
					var storedMessage = $scope.scan.messages[m];
					//debugger;
					if(!storedMessage.changed) {
						delete $scope.scan.messages[m];
					}
					else {
						//debugger;
					}
				}
				break;

			case "Unchanged":
				// delete every message that is marked as changed
				for(var m in $scope.scan.messages) {
					var storedMessage = $scope.scan.messages[m];
					//debugger;
					if(storedMessage.changed) {
						delete $scope.scan.messages[m];
					}
				}
				break;
		}

	
	}
});
