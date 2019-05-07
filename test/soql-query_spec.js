/* global describe it */

//-- logger
const log = require('fancy-log'); // eslint-disable-line
//-- asserts for mocha tests / others are also available.
const assert = require('assert');
const sinon = require('sinon');
const EventEmitter = require('events').EventEmitter;

// const connectionEmitter = require('../nodes/connection/sf-connection-emitter');
const SoqlQueryNode = require('../nodes/query/sf-soql-query').infoClass;

//-- helper for node red
const helper = require('node-red-node-test-helper');

const RED = require('node-red');

//-- mocks / spies / etc
const connectionEmitter = new EventEmitter();
const CONNECTION_MOCK = {
  //-- note: null is the error argument, the object is the result argument
  query: sinon.stub(),
  queryMore: sinon.stub()
};

const queryFinished = {
  done: true,
  totalSize: 1,
  records: [
    {}
  ]
};
const queryNotFinished = {
  done: false,
  totalSize: 1,
  records: [
    {}
  ]
};

CONNECTION_MOCK.query.withArgs('select * from Account')
  .callsArgWith(1, null, queryFinished);
CONNECTION_MOCK.query.withArgs('select * from Account order by id')
  .callsArgWith(1, null, queryNotFinished);
CONNECTION_MOCK.queryMore.callsArgWith(1, null, queryFinished);

RED.nodes.getNode = sinon.stub().withArgs('sfconn-id').returns({
  info: {
    connection: CONNECTION_MOCK,
    emitter: connectionEmitter
  }
});

const CONFIG_MOCK = {
  sfconn: 'sfconn-id',
  query: 'payload.query', queryType: 'msg',
  target: 'payload.result'
};

const NODE_MOCK = new EventEmitter();
NODE_MOCK.status = sinon.spy();
NODE_MOCK.send = sinon.spy();

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
      soqlQuery.initialize(RED, CONFIG_MOCK, NODE_MOCK);
      soqlQuery.setStatus(soqlQuery.STATUS_CONNECTED);
      resolve();
    });
    return testPromise;
  });

  it('can listen for incoming connection and events', () => {
    const testPromise = new Promise((resolve, reject) => {
      const soqlQuery = new SoqlQueryNode();
      soqlQuery.initialize(RED, CONFIG_MOCK, NODE_MOCK);
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
      // log(`callArgs:${JSON.stringify(callArgs)}`);
      assert.notEqual(callArgs.payload.result, null, 'call results must be set');

      resolve();
    });
    return testPromise;
  });

  it('can listen for incoming connection and events with query more', () => {
    const testPromise = new Promise((resolve, reject) => {
      const soqlQuery = new SoqlQueryNode();
      soqlQuery.initialize(RED, CONFIG_MOCK, NODE_MOCK);
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

      resolve();
    });
    return testPromise;
  });

  /*
  //-- currently failing saying that n1 is undefined.
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