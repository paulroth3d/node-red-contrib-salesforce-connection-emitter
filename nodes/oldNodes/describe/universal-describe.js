const {buildErrorMsg} = require('./../../utils/errorHandler.js');
const jsforce = require('jsforce');

function NodeConstruction(RED) {
	const NODE_NAME = 'Universal Describe';
	
	function CustomNode(config) {
		RED.nodes.createNode(this, config);
		let node = this;

		node.on('input', function(msg) {
			node.status({fill:"blue",shape:"ring",text:"working..."})
			let processor = selectProcessor(node, config, msg);
			if (processor.validInputs()){
				processor.process();
			}else{
				node.status({fill:"red",shape:"dot",text:"failed"});
				node.error(processor.getError(NODE_NAME), msg);
			}
		});

		// Nodes are closed when a new flow is deployed.
		node.on('close', function(done){
			return done();
		});
	}

	let nodeDefinition = {
	};

	RED.nodes.registerType("universal-describe", CustomNode, nodeDefinition);
}

function selectProcessor(node, config, msg){
	let processor = null;
	switch(config.api){
		case 'soap':
		processor = new SoapProcessor(node, config, msg);
			break;
		case 'tooling':
		processor = new ToolingProcessor(node, config, msg);
			break;
		case 'metadata':
		processor = new MetadataProcessor(node, config, msg);
			break;
		default:
		processor = new NullProcessor(node, config, msg);
	}
	return processor;
} 

class AbstractProcessor{
	constructor(node, nodeConfig, msg){
		if (this.constructor === AbstractProcessor){
			throw new Error('Abstract class AbstractProcessor cannot be instantiated directly.');
		}
		this.node = node;
		this.config = nodeConfig;
		this.msg = msg;
	}

	/**
	 * Verify that there is a query to execute.
	 * @param {object} config - The Node's configuration.
	 * @param {object} msg - The message to process..
	 */
	validInputs(){
		let valid = false;
		if(!this.config.describeAll){
			valid = this.config.objectName.length > 0 || this.config.usePayload;
		}else{
			valid = true;
		}
		return valid
	}

	process(){
		throw new Error('Children of AbstractProcessor must implement method: process()');
	}

	getError(nodeName){
		throw new Error('Children of AbstractProcessor must implement method: getError()');
	}

	getConnection(){
		return new jsforce.Connection({
			instanceUrl : this.msg.salesforce.instanceUrl,
			accessToken : this.msg.salesforce.accessToken
		});
	}

	done(payload){
		this.msg.payload = payload;
		this.node.status({fill:"green",shape:"dot",text:"done"});
		this.node.send(this.msg);
	}

	error(err){
		this.node.status({fill:"red",shape:"dot",text:"failed"});
		this.node.error(err);
	}

	getObjectName(){
		return (this.config.usePayload)? this.msg.payload : this.config.objectName;
	}
}

class SoapProcessor extends AbstractProcessor{
	constructor(node, nodeConfig, msg){
		super(node, nodeConfig, msg);
	}

	process(){
		this.node.status({fill:"green",shape:"dot",text:"done"});
		let conn = this.getConnection();
		if(this.config.describeAll){
			conn.describeGlobal((err, res) => {
				if(err){
					this.error(err);	
				}
				this.done(res);
			});
		}else{
			conn.describe(this.getObjectName(),(err, res) => {
				if(err){
					this.error(err);	
				}
				this.done(res);
			});
		}
	}

	getError(nodeName){
		throw new Error('Children of AbstractProcessor must implement method: getError()');
	}
}

class ToolingProcessor extends AbstractProcessor{
	constructor(node, nodeConfig, msg){
		super(node, nodeConfig, msg);
	}

	process(){
		this.node.status({fill:"green",shape:"dot",text:"done"});
		let conn = this.getConnection();
		if(this.config.describeAll){
			conn.tooling.describeGlobal((err, res) => {
				if(err){
					this.error(err);	
				}
				this.done(res);
			});
		}else{
			conn.tooling.describeSObject(this.getObjectName(),(err, res) => {
				if(err){
					this.error(err);	
				}
				this.done(res);
			});
		}
	}

	getError(nodeName){
		throw new Error('Children of AbstractProcessor must implement method: getError()');
	}
}

class MetadataProcessor extends AbstractProcessor{
	constructor(node, nodeConfig, msg){
		super(node, nodeConfig, msg);
	}

	process(){
		this.node.status({fill:"green",shape:"dot",text:"done"});
		let conn = this.getConnection();
		conn.metadata.describe((err, res) => {
			if(err){
				this.error(err);
			}
			this.done(res);
		});
	}

	getError(nodeName){
		throw new Error('Children of AbstractProcessor must implement method: getError()');
	}
}

class NullProcessor extends AbstractProcessor{
	constructor(node, nodeConfig, msg){
		super(node, nodeConfig, msg);
	}

	validInputs(){
		return true;
	}

	getError(nodeName){
		return buildErrorMsg(nodeName, 'The API specified for the query was unknown.', null);
	}
} 

module.exports = NodeConstruction;
