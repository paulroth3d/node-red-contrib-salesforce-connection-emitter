//-- sample code for testing node red

require('../../nodes/Types');

const RED = require('node-red');

const sinon = require('sinon');

const EventEmitter = require('events').EventEmitter;

/**
 * Creates a mock Node Red server
 * @param {string} connectionConfigId - the id of the node that the connection should be found under
 * @returns {RED} - a node red mock
 */
function createNodeRedMock(connectionConfigId, connectionConfigMock){
  try {
    RED.nodes.getNode.revert();
  } catch(err){} // eslint-disable-line

  try {
  RED.nodes.getNode.restore();
  RED.nodes.getNode = null;
  } catch(err){}
  RED.nodes.getNode = sinon.stub();
  RED.nodes.getNode.withArgs(connectionConfigId).returns(connectionConfigMock);

  return RED;
}

/**
 * Creates a mock for the salesforce connection config
 * @returns {object} - 
 */
function createConnectionEmitterMock(jsForceConnection){
  if (!jsForceConnection){
    jsForceConnection = createJsForceConnectionMock();
  }
  const config = {
    info: new EventEmitter()
  };
  config.info.connection = jsForceConnection;

  return config;
}

/**
 * Creates a mock JS Force Connection
 * @returns {JsForceConnection} - jsForce Connection
 */
function createJsForceConnectionMock(){
  return {
    query: sinon.stub(),
    queryMore: sinon.stub(),
    streaming: {
      createClient: sinon.stub().returns({
        subscribe: sinon.stub()
      })
    },
    sobject: sinon.stub()
  };
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