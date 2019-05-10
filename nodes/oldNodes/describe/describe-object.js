function NodeConstruction(RED) {
	const jsforce = require('jsforce');
	function CustomNode(config) {
		RED.nodes.createNode(this,config);
		let node = this;

		node.on('input', function(msg) {
			node.status({fill:"blue",shape:"ring",text:"working..."});
			let conn = new jsforce.Connection({
				instanceUrl : msg.salesforce.instanceUrl,
				accessToken : msg.salesforce.accessToken
			});
			conn.describe(config.objectName, function(err, meta) {
				if (err) {
					node.status({fill:"red",shape:"dot",text:"failed"});
					node.error(err, msg);
				}
				msg.payload = meta;
				node.status({fill:"green",shape:"dot",text:"done"});
				node.send(msg);
			});
		});

		node.on('close', function(done){
			return done();
		});
	}

	let nodeDefinition = {
	};

	RED.nodes.registerType("describe-object", CustomNode, nodeDefinition);
}

module.exports = NodeConstruction;
