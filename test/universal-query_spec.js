//-- logger
const log = require('fancy-log'); // eslint-disable-line no-unused-vars
//-- asserts for mocha tests / others are also available.
const {assert,expect} = require('chai'); // eslint-disable-line no-unused-vars

const UniversalQuery = require('../nodes/query/sf-universal-query').infoClass;

const SoqlQueryProcessor = require('../nodes/query/queryProcessor/SoqlQueryProcessor');
const ToolingQueryProcessor = require('../nodes/query/queryProcessor/ToolingQueryProcessor');

//-- helper for node red
// const helper = require('node-red-node-test-helper');

const testUtils = require('./util/TestUtils');

let CONNECTION_EMITTER_MOCK;
let CONNECTION_MOCK;

//-- mock node red
let RED_MOCK; //-- to be reset each test, because each test should have its own unique getNode stub

//-- mock the config passed to the node
let CONFIG_MOCK;

const EXAMPLE_SOQL_QUERY = 'SELECT ID from Account';
const EXAMPLE_SOQL_QUERY_RESULTS = testUtils.createSoqlQueryResponse([{id:1, type:'Account'}],true);
const EXAMPLE_SOQL_QUERY2 = 'SELECT ID from Account limit 0';
const EXAMPLE_SOQL_QUERY2_RESULTS = testUtils.createSoqlQueryResponse([{id:2, type:'Account'}],true);
const EXAMPLE_TOOLING_QUERY = 'SELECT ID from Account';
const EXAMPLE_TOOLING_QUERY_RESULTS = testUtils.createSoqlQueryResponse([{id:3, type:'Account'}],true);
const EXAMPLE_TOOLING_QUERY2 = 'SELECT ID from Account limit 1';
const EXAMPLE_TOOLING_QUERY2_RESULTS = testUtils.createSoqlQueryResponse([{id:4, type:'Account'}],true);

//-- mock the node red node it will work with
let NODE_MOCK;
//-- mock an example message sent
let MSG_MOCK;

describe('SoqlQueryProcessor', () => {
  beforeEach((done) => {
    //-- reset the red mock to ensure the getNode is specific to this test
    RED_MOCK = testUtils.createNodeRedMock('sfconn-id', CONNECTION_EMITTER_MOCK);
    NODE_MOCK = testUtils.createNodeRedNodeMock();
    CONNECTION_EMITTER_MOCK = testUtils.createConnectionEmitterMock();
    CONNECTION_MOCK = CONNECTION_EMITTER_MOCK.info.connection;
    CONNECTION_MOCK.query.withArgs(EXAMPLE_SOQL_QUERY)
      .callsArgWith(1, null, EXAMPLE_SOQL_QUERY_RESULTS);
    CONNECTION_MOCK.query.withArgs(EXAMPLE_SOQL_QUERY2)
      .callsArgWith(1, null, EXAMPLE_SOQL_QUERY2_RESULTS);
    MSG_MOCK = {
      payload: {
        query: 'some query to execute'
      }
    };
    CONFIG_MOCK = {
      name: 'node',
      api: 'soql',
      sfconn: 'sfconn-id',
      query: 'payload.query',
      queryType: 'msg',
      target: 'payload.results',
      limit: '10'
    };
    done();
  });
  afterEach((done) => {
    CONNECTION_MOCK.query.resetHistory();
    done();
  });
  it('executes soql with a valid query', () => {
    const testPromise = new Promise((resolve, reject) => {
      try {
        const soql = new SoqlQueryProcessor(RED_MOCK,CONFIG_MOCK,NODE_MOCK);
        //-- return the execute as the test promise
        return soql.execute(
          EXAMPLE_SOQL_QUERY,
          CONFIG_MOCK.target,
          CONNECTION_MOCK,
          MSG_MOCK
        ).then(results => {
          try {
          assert.equal(NODE_MOCK.error.called, false, 'Error should not have been called with a valid execute');
          assert.equal(NODE_MOCK.send.called, true, 'Send should be called with a valid execute');
          resolve();
          } catch(err){
            reject(err);
          }
        })
        .catch(err => {
          reject(err);
        });
      } catch(err){
        reject(err);
      }
    });
    return testPromise;
  });
  it('throws an error if the soql query is not sent', () => {
    const testPromise = new Promise((resolve, reject) => {
      try {
        const soql = new SoqlQueryProcessor(RED_MOCK,CONFIG_MOCK,NODE_MOCK);
        //-- return the execute as the test promise
        return soql.execute(
          null,
          CONFIG_MOCK.target,
          CONNECTION_MOCK,
          MSG_MOCK
        ).then(results => {
          reject(new Error(`Error should be thrown if query is empty, but did not`));
        })
        .catch(err => {
          try {
            expect(NODE_MOCK.error.called, 'error should be called if there was an error').to.be.true;
            expect(NODE_MOCK.send.called, 'send should not be called if there was an error').not.to.be.true;
            resolve();
          } catch(err){
            reject(err);
          }
        });
      } catch(err){
        reject(err);
      }
    });
    return testPromise;
  });
});

describe('ToolingQueryProcessor', () => {
  beforeEach((done) => {
    //-- reset the red mock to ensure the getNode is specific to this test
    RED_MOCK = testUtils.createNodeRedMock('sfconn-id', CONNECTION_EMITTER_MOCK);
    NODE_MOCK = testUtils.createNodeRedNodeMock();
    CONNECTION_EMITTER_MOCK = testUtils.createConnectionEmitterMock();
    CONNECTION_MOCK = CONNECTION_EMITTER_MOCK.info.connection;
    CONNECTION_MOCK.query.withArgs(EXAMPLE_SOQL_QUERY)
      .callsArgWith(1, null, EXAMPLE_SOQL_QUERY_RESULTS);
    CONNECTION_MOCK.query.withArgs(EXAMPLE_SOQL_QUERY2)
      .callsArgWith(1, null, EXAMPLE_SOQL_QUERY2_RESULTS);
    MSG_MOCK = {
      payload: {
        query: 'some query to execute'
      }
    };
    CONFIG_MOCK = {
      name: 'node',
      api: 'soql',
      sfconn: 'sfconn-id',
      query: 'payload.query',
      queryType: 'msg',
      target: 'payload.results',
      limit: '10'
    };
    done();
  });
  afterEach((done) => {
    done();
  });
  it('executes tooling with a valid query', () => {
    const testPromise = new Promise((resolve, reject) => {
      try {
        const tooling = new ToolingQueryProcessor(RED_MOCK,CONFIG_MOCK,NODE_MOCK);
        //-- return the execute as the test promise
        return tooling.execute(
          EXAMPLE_SOQL_QUERY,
          CONFIG_MOCK.target,
          CONNECTION_MOCK,
          MSG_MOCK
        ).then(results => {
          try {
          assert.equal(NODE_MOCK.error.called, false, 'Error should not have been called with a valid execute');
          assert.equal(NODE_MOCK.send.called, true, 'Send should be called with a valid execute');
          resolve();
          } catch(err){
            reject(err);
          }
        })
        .catch(err => {
          reject(err);
        });
      } catch(err){
        reject(err);
      }
    });
    return testPromise;
  });
  it('throws an error if the tooling query is not sent', () => {
    const testPromise = new Promise((resolve, reject) => {
      try {
        const tooling = new ToolingQueryProcessor(RED_MOCK,CONFIG_MOCK,NODE_MOCK);
        //-- return the execute as the test promise
        return tooling.execute(
          null,
          CONFIG_MOCK.target,
          CONNECTION_MOCK,
          MSG_MOCK
        ).then(results => {
          reject(new Error(`Error should be thrown if query is empty, but did not`));
        })
        .catch(err => {
          try {
            expect(NODE_MOCK.error.called, 'error should be called if there was an error').to.be.true;
            expect(NODE_MOCK.send.called, 'send should not be called if there was an error').not.to.be.true;
            resolve();
          } catch(err){
            reject(err);
          }
        });
      } catch(err){
        reject(err);
      }
    });
    return testPromise;
  });
});

describe('sf-universal-query', () => {
  beforeEach((done) => {
    //-- reset the red mock to ensure the getNode is specific to this test
    RED_MOCK = testUtils.createNodeRedMock('sfconn-id', CONNECTION_EMITTER_MOCK);
    NODE_MOCK = testUtils.createNodeRedNodeMock();
    CONNECTION_EMITTER_MOCK = testUtils.createConnectionEmitterMock();
    CONNECTION_MOCK = CONNECTION_EMITTER_MOCK.info.connection;
    CONNECTION_MOCK.query.withArgs(EXAMPLE_SOQL_QUERY)
      .callsArgWith(1, null, EXAMPLE_SOQL_QUERY_RESULTS);
    CONNECTION_MOCK.query.withArgs(EXAMPLE_SOQL_QUERY2)
      .callsArgWith(1, null, EXAMPLE_SOQL_QUERY2_RESULTS);
    MSG_MOCK = {
      payload: {
        query: 'some query to execute'
      }
    };
    CONFIG_MOCK = {
      name: 'node',
      api: 'soql',
      sfconn: 'sfconn-id',
      query: 'payload.query',
      queryType: 'msg',
      target: 'payload.results',
      limit: '10'
    };
    done();
  });
  afterEach((done) => {
    done();
  });
  it('should be running', (done) => {
    assert.equal(1+2,3,'Tests are running in mocha');
    done();
  });
  it('can determine the query from a msg', () => {
    const testPromise = new Promise((resolve, reject) => {
      CONFIG_MOCK.query = 'payload.query';
      CONFIG_MOCK.queryType = 'msg';
      MSG_MOCK.payload.query = 'some example query';
      const queryNode = new UniversalQuery()
        .initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK)
      const queryResult = queryNode.determineQuery(MSG_MOCK);
      const queryExpected = MSG_MOCK.payload.query;
      assert.equal(queryResult, queryExpected);
      resolve();
    });
    return testPromise;
  });
  it('can determine the query from a str', () => {
    const testPromise = new Promise((resolve, reject) => {
      const queryNode = new UniversalQuery();
      CONFIG_MOCK.query = 'some literal query';
      CONFIG_MOCK.queryType = 'str';
      queryNode.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);
      const queryResult = queryNode.determineQuery(MSG_MOCK);
      const queryExpected = CONFIG_MOCK.query;
      assert.equal(queryResult, queryExpected);
      resolve();
    });
    return testPromise;
  });
  it('can determine the target', () => {
    const testPromise = new Promise((resolve, reject) => {
      const queryNode = new UniversalQuery();
      CONFIG_MOCK.target = 'payload.some.results';
      queryNode.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);
      const targetResult = queryNode.determineTarget(MSG_MOCK);
      const targetExpected = CONFIG_MOCK.target;
      assert.equal(targetResult, targetExpected);
      resolve();
    });
    return testPromise;
  });
  it('can initialize', () => {
    const testPromise = new Promise((resolve, reject) => {
      const queryNode = new UniversalQuery();
      queryNode.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);
      resolve();
    });
    return testPromise;
  });
  it('can find the soql query processor', () => {
    const testPromise = new Promise((resolve, reject) => {
      const queryNode = new UniversalQuery()
        .initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK)
      const queryProcessor = queryNode.determineQueryProcessor(queryNode.PROCESSOR_TYPE_SOQL);
      assert.notEqual(queryProcessor, null);
      assert.equal(queryProcessor.type, 'soql');
      resolve();
    });
    return testPromise;
  });
  it('can find the tooling query processor', () => {
    const testPromise = new Promise((resolve, reject) => {
      const queryNode = new UniversalQuery()
        .initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK)
      const queryProcessor = queryNode.determineQueryProcessor(queryNode.PROCESSOR_TYPE_TOOLING);
      assert.notEqual(queryProcessor, null);
      assert.equal(queryProcessor.type, 'tooling');
      resolve();
    });
    return testPromise;
  });
  it('can run a soql query', () => {
    const testPromise = new Promise((resolve, reject) => {
      CONFIG_MOCK.query = 'payload.query';
      CONFIG_MOCK.queryType = 'msg';
      CONFIG_MOCK.results = ''
      CONFIG_MOCK.target = 'payload.some.results';
      MSG_MOCK.payload.query = EXAMPLE_SOQL_QUERY;

      const queryNode = new UniversalQuery()
        .initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK)
        .listenToConnection('sfconn');
      
      assert.equal(CONNECTION_MOCK.query.called, false, 'initialize: query should not be called');
      assert.equal(NODE_MOCK.error.called, false, 'initialize: error should not be called');
      assert.equal(NODE_MOCK.send.called, false, 'initialize: send should not be called');

      NODE_MOCK.emit('input', MSG_MOCK);
      
      assert.equal(NODE_MOCK.error.called, false, 'no error should be called');
      assert.equal(NODE_MOCK.send.called, true, 'send should be called');

      const sendInfo = NODE_MOCK.send.lastCall.args[0];

      // log(`Connection.query.args:${JSON.stringify(CONNECTION_MOCK.query.lastCall.args)}`);
      assert.notEqual(sendInfo, null, 'something should have been sent');
      assert.notEqual(sendInfo.payload.some.results, null, 'target should be set on the msg');
      assert.equal(sendInfo.payload.some.results.totalSize, EXAMPLE_SOQL_QUERY_RESULTS.records.length, 'total size should match');
      assert.equal(sendInfo.payload.some.results.records.length, EXAMPLE_SOQL_QUERY_RESULTS.records.length, 'results should match');
      assert.equal(sendInfo.payload.some.results.records[0].id, EXAMPLE_SOQL_QUERY_RESULTS.records[0].id, 'results should match');

      resolve();
    });
    return testPromise;
  });
  it('can run a tooling query', () => {
    const testPromise = new Promise((resolve, reject) => {
      const queryNode = new UniversalQuery();
      queryNode.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);
      const toolingProcessor = queryNode.determineQueryProcessor(queryNode.PROCESSOR_TYPE_TOOLING);
      assert.notEqual(toolingProcessor, null);
      resolve();
    });
    return testPromise;
  });
});