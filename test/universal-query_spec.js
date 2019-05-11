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
const CONFIG_MOCK = {
  name: 'node',
  query: 'payload.query',
  target: 'payload.results'
};

const EXAMPLE_SOQL_QUERY = 'SELECT ID from Account limit 1';
const EXAMPLE_TOOLING_QUERY = 'SELECT ID from Account limit 1';

//-- mock the node red node it will work with
let NODE_MOCK;

const MSG_MOCK = {
  payload: {
    query: 'some query to execute'
  }
};

describe('SoqlQueryProcessor', () => {
  beforeEach((done) => {
    //-- reset the red mock to ensure the getNode is specific to this test
    RED_MOCK = testUtils.createNodeRedMock('sfconn-id', CONNECTION_EMITTER_MOCK);
    NODE_MOCK = testUtils.createNodeRedNodeMock();
    CONNECTION_EMITTER_MOCK = testUtils.createConnectionEmitterMock();
    CONNECTION_MOCK = CONNECTION_EMITTER_MOCK.info.connection;
    done();
  });
  afterEach((done) => {
    done();
  });
  it('executes with a valid query', () => {
    const testPromise = new Promise((resolve, reject) => {
      try {
        const soql = new SoqlQueryProcessor();
        //-- return the execute as the test promise
        return soql.execute(
          EXAMPLE_SOQL_QUERY,
          CONFIG_MOCK.target,
          CONNECTION_MOCK,
          NODE_MOCK,
          CONFIG_MOCK,
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
  it('throws an error if the query is not sent', () => {
    const testPromise = new Promise((resolve, reject) => {
      try {
        const soql = new SoqlQueryProcessor();
        //-- return the execute as the test promise
        return soql.execute(
          null,
          CONFIG_MOCK.target,
          CONNECTION_MOCK,
          NODE_MOCK,
          CONFIG_MOCK,
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
    done();
  });
  afterEach((done) => {
    done();
  });
  it('should be running', (done) => {
    assert.equal(1+2,3,'Tests are running in mocha');
    done();
  });
  it('can initialize', () => {
    const testPromise = new Promise((resolve, reject) => {
      const queryNode = new UniversalQuery();
      queryNode.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);
      resolve();
    });
    return testPromise;
  });
  it('can run a soql query', () => {
    const testPromise = new Promise((resolve, reject) => {
      const queryNode = new UniversalQuery();
      queryNode.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);
      const queryProcessor = queryNode.determineQueryProcessor(queryNode.PROCESSOR_TYPE_SOQL);
      assert.notEqual(queryProcessor, null);
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