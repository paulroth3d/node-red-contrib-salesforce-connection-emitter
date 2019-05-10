function NodeConstruction(RED) {
	const jsforce = require('jsforce');
	function CustomNode(config) {
		RED.nodes.createNode(this,config);
		let node = this;

		node.on('input', function(msg) {
			let conn = new jsforce.Connection({
				instanceUrl : msg.salesforce.instanceUrl,
				accessToken : msg.salesforce.accessToken
			});
			node.status({fill:"blue",shape:"ring",text:"working..."});
			conn.tooling.describeGlobal(function(err, res) {
				if (err) { 
					node.status({fill:"red",shape:"dot",text:"failed"});
					node.error(err);
				}
				msg.payload = res.sobjects; 
				node.status({fill:"green",shape:"dot",text:"done"});
				node.send(msg);
			});
		});

		// Nodes are closed when a new flow is deployed.
		node.on('close', function(done){
			return done();
		});
	}

	let nodeDefinition = {
	};

	RED.nodes.registerType("describe-all-objects", CustomNode, nodeDefinition);
}

module.exports = NodeConstruction;
