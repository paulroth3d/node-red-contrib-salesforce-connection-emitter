const {buildErrorMsg} = require('../utils/errorHandler.js');
const jsforce = require('jsforce');

function NodeConstruction(RED) {
	const NODE_NAME = 'Universal Query';
	function CustomNode(config) {
		RED.nodes.createNode(this, config);
		let node = this;
		node.on('input', function(msg) {
			node.status({fill:"blue",shape:"ring",text:"working..."})
			let queryProcessor = selectQueryProcessor(node, config, msg);
			if (queryProcessor.validInputs()){
				queryProcessor.process();
			}else{
				node.status({fill:"red",shape:"dot",text:"failed"});
				node.error(queryProcessor.getError(NODE_NAME), msg);
			}
		});

		// Nodes are closed when a new flow is deployed.
		node.on('close', function(done){
			return done();
		});
	}

	let nodeDefinition = {};

	RED.nodes.registerType('universal-query', CustomNode, nodeDefinition);
}

function selectQueryProcessor(node, config, msg){
	let queryProcessor = null;
	switch(config.api){
		case 'soap':
			queryProcessor = new SoapQueryProcessor(node, config, msg);
			break;
		case 'tooling':
			queryProcessor = new ToolingQueryProcessor(node, config, msg);
			break;
		default:
			queryProcessor = new NullToolingQueryProcessor(node, config, msg);
	}
	return queryProcessor;
} 

class AbstractQueryProcessor{
	constructor(node, nodeConfig, msg){
		if (this.constructor === AbstractQueryProcessor){
			throw new Error('Abstract class AbstractQueryProcessor cannot be instantiated directly.');
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
		this.queryStr = (this.config.usePayload)? this.msg.payload : this.config.query;
		return typeof this.queryStr !== 'undefined' && 
			this.queryStr != null &&
			this.queryStr.trimLeft().toLowerCase().startsWith('select');
	}

	process(){
		throw new Error('Children of AbstractQueryProcessor must implement method process.');
	}

	getError(nodeName){
		throw new Error('Children of AbstractQueryProcessor must implement method getError.');
	}
}

class SoapQueryProcessor extends AbstractQueryProcessor{
	constructor(node, nodeConfig, msg){
		super(node, nodeConfig, msg);
	}

	process(){
		let conn = new jsforce.Connection({
			instanceUrl : this.msg.salesforce.instanceUrl,
			accessToken : this.msg.salesforce.accessToken
		});

		let records = [];
		conn.query(this.queryStr)
			.on("record", (record) => {
				records.push(record);
			})
			.on("end", () => {
				this.msg.payload = {
					resultName: this.config.resultName,
					records: records
				};
				this.node.status({fill:"green",shape:"dot",text:"done"});
				this.node.send(this.msg);
			})
			.on("error", (err) => {
				let errorMsg = buildErrorMsg(this.node.name, 'The query failed to run.', err);
				this.node.status({fill:"red",shape:"dot",text:"failed"});
				this.node.error(errorMsg, this.msg);
			})
			.run({ autoFetch: true, maxFetch: parseInt(this.config.limit) });
	}

	getError(nodeName){
		return buildErrorMsg(nodeName, 'A SOQL query for the SOAP API must start with select.', null);
	}
} 

class ToolingQueryProcessor extends AbstractQueryProcessor{
	constructor(node, nodeConfig, msg){
		super(node, nodeConfig, msg);
	}

	process(){
		let conn = new jsforce.Connection({
			instanceUrl : this.msg.salesforce.instanceUrl,
			accessToken : this.msg.salesforce.accessToken
		});

		conn.tooling.query(this.queryStr, (err, data) => {
			if (err) { 
				this.node.status({fill:"red",shape:"dot",text:"failed"});
				this.node.error(err, this.msg);
			}
			this.msg.payload = {
				resultName: this.config.resultName,
				records: data
			};
			this.node.status({fill:"green",shape:"dot",text:"done"});
			this.node.send(this.msg);
		});
	}

	getError(nodeName){
		return buildErrorMsg(nodeName, 'A SOQL query for the Tooling API must start with select.', null);
	}
} 

class NullToolingQueryProcessor extends AbstractQueryProcessor{
	constructor(node, nodeConfig, msg){
		super(node, nodeConfig, msg);
	}

	validInputs(){
		return false;
	}

	getError(nodeName){
		return buildErrorMsg(nodeName, 'The API specified for the query was unknown.', null);
	}
} 

module.exports = NodeConstruction;
