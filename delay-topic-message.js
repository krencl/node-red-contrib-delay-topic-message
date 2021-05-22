module.exports = function(RED) {
	function updateStatus(node) {
		node.status({
			fill: node.messagesCount > 0 ? 'green' : 'grey',
			shape: 'dot',
			text: 'Running timers: ' + node.messagesCount,
		});
	}

	function delayTimer(config) {
		RED.nodes.createNode(this, config);

		var node = this;
		node.delay = config.delay;
		node.messages = {};
		node.messagesCount = 0;
		updateStatus(node);

		node.on('input', function (msg) {
			var topic = msg.topic || '__notopic';

			if (node.messages[topic]) {
				node.messagesCount--;
				clearTimeout(node.messages[topic].timeout);
			}

			if (msg.stopTimer && msg.stopTimer === true) {
				delete node.messages[topic];
				updateStatus(node);
				return;
			}

			node.messagesCount++;
			updateStatus(node);

			node.messages[topic] = {
				timeout: setTimeout(function () {
					node.send(node.messages[topic].msg);
					delete node.messages[topic];
					node.messagesCount--;
					updateStatus(node);
				}, (msg.delay || node.delay) * 1000),
				msg: msg,
			};
		});
	}

	RED.nodes.registerType('delay-topic-message', delayTimer);
}
