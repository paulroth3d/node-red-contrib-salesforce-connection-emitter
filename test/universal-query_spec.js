//-- logger
const log = require('fancy-log'); // eslint-disable-line no-unused-vars
//-- asserts for mocha tests / others are also available.
const {assert,expects} = require('chai'); // eslint-disable-line no-unused-vars

const UniversalQuery = require('../nodes/query/sf-universal-query').infoClass;

//-- helper for node red
// const helper = require('node-red-node-test-helper');

const testUtils = require('./util/TestUtils');

const CONNECTION_EMITTER_MOCK = testUtils.createConnectionEmitterMock();

//-- mock node red
let RED_MOCK; //-- to be reset each test, because each test should have its own unique getNode stub

//-- mock the config passed to the node
const CONFIG_MOCK = {
  name: 'node'
};

//-- mock the node red node it will work with
const NODE_MOCK = testUtils.createNodeRedNodeMock();

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