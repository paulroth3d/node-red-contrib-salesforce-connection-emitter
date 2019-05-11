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
const EXAMPLE_TOOLING_QUERY = 'SELECT ID from Objects';
const EXAMPLE_TOOLING_QUERY_RESULTS = testUtils.createSoqlQueryResponse([{id:3, type:'Account'}],true);
const EXAMPLE_TOOLING_QUERY2 = 'SELECT ID from Objects limit 1';
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
    CONNECTION_MOCK.tooling.query.withArgs(EXAMPLE_TOOLING_QUERY)
      .callsArgWith(1, null, EXAMPLE_TOOLING_QUERY_RESULTS);
    CONNECTION_MOCK.tooling.query.withArgs(EXAMPLE_TOOLING_QUERY2)
      .callsArgWith(1, null, EXAMPLE_TOOLING_QUERY2_RESULTS);
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
    CONNECTION_MOCK.tooling.query.withArgs(EXAMPLE_TOOLING_QUERY)
      .callsArgWith(1, null, EXAMPLE_TOOLING_QUERY_RESULTS);
    CONNECTION_MOCK.tooling.query.withArgs(EXAMPLE_TOOLING_QUERY2)
      .callsArgWith(1, null, EXAMPLE_TOOLING_QUERY2_RESULTS);
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
          EXAMPLE_TOOLING_QUERY,
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
          log('results passed');
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
