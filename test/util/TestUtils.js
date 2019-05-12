//-- sample code for testing node red

require('../../nodes/Types');

const RED = require('node-red');

const sinon = require('sinon');

const EventEmitter = require('events').EventEmitter;

const ConnectionEmitter = require('../../nodes/connection/sf-connection-emitter');

/**
 * Creates a mock Node Red server
 * @param {string} connectionConfigId - the id of the node that the connection should be found under
 * @returns {RED} - a node red mock
 */
function createNodeRedMock(connectionConfigId, connectionConfigMock){

  //-- revert if the method is already stubbed
  if (RED.nodes.getNode.revert){
    RED.nodes.getNode.revert();
  }

  RED.nodes.getNode = sinon.stub();
  RED.nodes.getNode.withArgs(connectionConfigId).returns(connectionConfigMock);

  return RED;
}

/**
 * Creates a mock for the salesforce connection config
 * @returns {NodeRedClassNode} - A connection emitter node red node
 */
function createConnectionEmitterMock(jsForceConnection){
  if (!jsForceConnection){
    jsForceConnection = createJsForceConnectionMock();
  }
  const config = {
    info: new EventEmitter(),
    infoClass: ConnectionEmitter
  };
  config.info.connection = jsForceConnection;

  return config;
}

/**
 * Creates a mock JS Force Connection
 * @returns {import('jsforce').Connection} - jsForce Connection
 */
function createJsForceConnectionMock(){
  const result = {
    query: sinon.stub(),
    queryMore: sinon.stub(),
    request: sinon.stub(),
    requestGet: sinon.stub(),
    requestDelete: sinon.stub(),
    requestPatch: sinon.stub(),
    requestPost: sinon.stub(),
    requestPut: sinon.stub(),
    tooling: {
      query: sinon.stub(),
      queryMore: sinon.stub()
    },
    streaming: {
      createClient: sinon.stub().returns({
        subscribe: sinon.stub()
      })
    },
    sobject: sinon.stub(),
    sobject_create: sinon.stub()
  };
  result.sobject.returns({
    create: result.sobject_create
  });
  return result;
}

/**
 * Creates a mock streaming client for jsforce
 * @returns {object}
 */
function createJsForceStreamingClient(){
  const result = {};
  result.subscribe = sinon.stub();

  return result;
}

/**
 * Generates a mock response common for soql.query from jsforce
 * @param {array[]} resultRecords - collection of sobjects for the records property
 * @param {boolean} isDone - whether the query is done (true) or not (false)
 */
function createSoqlQueryResponse(resultRecords, isDone){
  if (!resultRecords){
    resultRecords = [];
  }
  if (isDone !== false){
    isDone = true;
  }
  return {
    done: isDone,
    totalSize: resultRecords.length,
    records: resultRecords
  };
}

/**
 * Generates a Mock for a Node Red Node
 * @returns {NODE_RED_NODE} - Mock for a Node Red Node
 */
function createNodeRedNodeMock(){
  const results = new EventEmitter();
  results.status = sinon.spy();
  results.send = sinon.spy();
  results.error = sinon.stub();

  results.context_get = sinon.stub();
  results.context_set = sinon.stub();
  results.context_node_get = sinon.stub();
  results.context_node_set = sinon.stub();
  results.context_global_get = sinon.stub();
  results.context_global_set = sinon.stub();

  results.context = sinon.stub().returns({
    get: results.context_get,
    set: results.context_set,
    flow: {
      get: results.context_node_get,
      set: results.context_node_set
    }
  });

  //-- yay for setting a property to a reserved word...
  //-- @see https://nodered.org/docs/creating-nodes/context
  results.context["global"] = {
    get: results.context_global_get,
    set: results.context_global_set
  };

  return results;
}

module.exports = {
  createNodeRedMock,
  createConnectionEmitterMock,
  createJsForceConnectionMock,
  createJsForceStreamingClient,
  createSoqlQueryResponse,
  createNodeRedNodeMock
};

// /Users/proth/Documents/work/tools/node-red-contrib-salesforce-connection-emitter/test/util/TestUtils.js