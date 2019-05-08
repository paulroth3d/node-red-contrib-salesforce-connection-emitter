/* global describe it */

//-- logger
const log = require('fancy-log'); // eslint-disable-line

const {assert, expect} = require('chai'); // eslint-disable-line no-unused-vars

// const connectionEmitter = require('../nodes/connection/sf-connection-emitter');
const SoqlQueryNode = require('../nodes/query/sf-soql-query').infoClass;

//-- helper for node red
//-- can't get this to work yet
const helper = require('node-red-node-test-helper');

const mockUtils = require('./util/TestUtils');

//-- mocks / spies / etc
const queryFinishedResponse = mockUtils.createSoqlQueryResponse([{id:1,type:'Account'},{id:2,type:'Account'}], true);
const queryNotFinishedResponse = mockUtils.createSoqlQueryResponse([{id:3,type:'Account'}], false);

//-- mock connection
const CONNECTION_CONFIG_MOCK = mockUtils.createConnectionEmitterMock();
const CONNECTION_MOCK = CONNECTION_CONFIG_MOCK.info.connection;
CONNECTION_MOCK.query.withArgs('select * from Account')
  .callsArgWith(1, null, queryFinishedResponse);
CONNECTION_MOCK.query.withArgs('select * from Account order by id')
  .callsArgWith(1, null, queryNotFinishedResponse);
CONNECTION_MOCK.queryMore.callsArgWith(1, null, queryFinishedResponse);

//-- mock node red
const RED_MOCK = mockUtils.createNodeRedMock('sfconn-id', CONNECTION_CONFIG_MOCK);

//-- mock the config passed to the node
const CONFIG_MOCK = {
  sfconn: 'sfconn-id',
  query: 'payload.query', queryType: 'msg',
  target: 'payload.result'
};

//-- mock the node red node it will work with
const NODE_MOCK = mockUtils.createNodeRedNodeMock();

//-- init helper

helper.init(require.resolve('node-red'));

describe('soql-query', () => {

  beforeEach(function (done) {
    // helper.startServer(done);
    done();
  });

  afterEach(function (done) {
    // helper.unload();
    // helper.stopServer(done);

    NODE_MOCK.send.resetHistory();
    CONNECTION_MOCK.query.resetHistory();

    done();
  });
  
  it('should be running mocha tests', (done) => {
    assert.equal(1+2,3,'Tests are running in mocha');
    done();
  });

  it('can set status', () => {
    const testPromise = new Promise((resolve, reject) => {
      const soqlQuery = new SoqlQueryNode();
      soqlQuery.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);
      soqlQuery.setStatus(soqlQuery.STATUS_CONNECTED);
      resolve();
    });
    return testPromise;
  });

  it('can listen for incoming connection and events', () => {
    const testPromise = new Promise((resolve, reject) => {
      const soqlQuery = new SoqlQueryNode();
      soqlQuery.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);
      soqlQuery.listenToConnection('sfconn');

      NODE_MOCK.emit('input', {
        payload: {
          query: 'select * from Account'
        }
      });

      assert(CONNECTION_MOCK.query.calledOnce, 'connection mock must have been called');
      //-- we match the results to the query up above
      // log(CONNECTION_MOCK.query.lastCall.args[0]);
      assert(NODE_MOCK.send.calledOnce, 'send should only be called once');
      const callArgs = NODE_MOCK.send.lastCall.args[0];
      const sendResults = callArgs.payload.result;
      // log(`callArgs:${JSON.stringify(callArgs)}`);
      // log(`callResult:${JSON.stringify(sendResults)}`);
      assert.notEqual(sendResults, null, 'call results must be set');
      assert.equal(sendResults.records.length, 2, 'should have two results');
      assert.equal(sendResults.totalSize, 2, 'should have two results');

      resolve();
    });
    return testPromise;
  });

  it('can listen for incoming connection and events with query more', () => {
    const testPromise = new Promise((resolve, reject) => {
      const soqlQuery = new SoqlQueryNode();
      soqlQuery.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);
      soqlQuery.listenToConnection('sfconn');

      NODE_MOCK.emit('input', {
        payload: {
          query: 'select * from Account order by id'
        }
      });

      assert(CONNECTION_MOCK.query.calledOnce, 'connection mock must have been called');
      //-- we match the results to the query up above
      // log(CONNECTION_MOCK.query.lastCall.args[0]);
      assert(NODE_MOCK.send.calledOnce, 'send should only be called once');
      const callArgs = NODE_MOCK.send.lastCall.args[0];
      // log(`callArgs:${JSON.stringify(callArgs)}`);
      assert.notEqual(callArgs.payload.result, null, 'call results must be set');

      //-- note this is the property defined in the config node: CONFIG_MOCK.target
      const sendResults = callArgs.payload.result;
      assert.notEqual(sendResults, null, 'should have results returned');
      assert.equal(sendResults.records.length, 3, 'should have 3 results');
      assert.equal(sendResults.totalSize, 3, 'totalSize should have 3 results');

      resolve();
    });
    return testPromise;
  });

  /*
  //-- currently failing saying that n1 is undefined
  //-- unable to get test working with the nodeJsTestHelper...
  //-- for more information, please visit:
  //-- https://discourse.nodered.org/t/unit-testing-with-config-nodes/10863
  it('should load/query/sf-soql-query', () => {
    const flow = [
      {id:'n1', type:'sf-soql-query', name:'Custom_Name', sfconn:'n2'},
      {id:'n2', type:'sf-connection-emitter', host:'SF_HOST', username:'SF_USERNAME', password:'SF_PASSWORD', token:'SF_TOKEN'}
    ];
    const testPromise = new Promise((resolve, reject) => {
      helper.load([connectionEmitter, SoqlQueryNode], flow, () => {
        try {
          const n1 = helper.getNode('n1');
          assert.notEqual(n1, null, 'n1 should not be null');
          resolve();
        } catch(err){
          reject(err);
        }
      });
    });
    return testPromise;
  });
  */
});