//-- logger
const log = require('fancy-log'); // eslint-disable-line no-unused-vars
//-- asserts for mocha tests / others are also available.
const {assert,expects} = require('chai'); // eslint-disable-line no-unused-vars

const UniversalDescribe = require('../nodes/describe/sf-universal-describe').infoClass;

//-- helper for node red
// const helper = require('node-red-node-test-helper');

const testUtils = require('./util/TestUtils');

//-- mock connection
let CONNECTION_EMITTER_MOCK;
let CONNECTION_MOCK;  // eslint-disable-line no-unused-vars
//-- mock node red
let RED_MOCK; //-- to be reset each test, because each test should have its own unique getNode stub
//-- mock the config passed to the node
let CONFIG_MOCK;
//-- mock the node red node it will work with
let NODE_MOCK;
//-- mock an example message sent
let MSG_MOCK;

describe('sf-universal-describe', () => {
  beforeEach((done) => {
    //-- reset the red mock to ensure the getNode is specific to this test
    RED_MOCK = testUtils.createNodeRedMock('sfconn-id', CONNECTION_EMITTER_MOCK);
    NODE_MOCK = testUtils.createNodeRedNodeMock();
    CONNECTION_EMITTER_MOCK = testUtils.createConnectionEmitterMock();
    CONNECTION_MOCK = CONNECTION_EMITTER_MOCK.info.connection;
    MSG_MOCK = {
      payload: {
        query: 'some query to execute'
      }
    };
    CONFIG_MOCK = {
      name: 'node',
      api: 'soql',
      sfconn: 'sfconn-id',
      describeAll: true,
      objectName: '',
      objectNameType: 'msg',
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
  it('can initialize', () => {
    const testPromise = new Promise((resolve, reject) => {
      const describeNode = new UniversalDescribe();
      describeNode.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);
      resolve();
    });
    return testPromise;
  });
  it('can determine whether to describe All', () => {
    const testPromise = new Promise((resolve, reject) => {
      const describeNode = new UniversalDescribe();
      CONFIG_MOCK.describeAll = true;
      describeNode.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);
      const targetResult = describeNode.determineDescribeAll(MSG_MOCK);
      const targetExpected = true;
      assert.equal(targetResult, targetExpected);
      resolve();
    });
    return testPromise;
  });
  it('can determine the objectName from the config', () => {
    const testPromise = new Promise((resolve, reject) => {
      CONFIG_MOCK.objectName = 'payload.objectName';
      CONFIG_MOCK.objectNameType = 'msg';
      MSG_MOCK.payload.objectName = 'some example query';
      const describeNode = new UniversalDescribe()
        .initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK)
      const queryResult = describeNode.determineObjectName(MSG_MOCK);
      const queryExpected = MSG_MOCK.payload.objectName;
      assert.equal(queryResult, queryExpected);
      resolve();
    });
    return testPromise;
  });
  it('can determine the objectName from a str', () => {
    const testPromise = new Promise((resolve, reject) => {
      const describeNode = new UniversalDescribe();
      CONFIG_MOCK.objectName = 'some object name';
      CONFIG_MOCK.objectNameType = 'str';
      describeNode.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);
      const queryResult = describeNode.determineObjectName(MSG_MOCK);
      const queryExpected = CONFIG_MOCK.objectName;
      assert.equal(queryResult, queryExpected);
      resolve();
    });
    return testPromise;
  });
  it('can determine the target', () => {
    const testPromise = new Promise((resolve, reject) => {
      const describeNode = new UniversalDescribe();
      CONFIG_MOCK.target = 'payload.some.results';
      describeNode.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);
      const targetResult = describeNode.determineTarget(MSG_MOCK);
      const targetExpected = CONFIG_MOCK.target;
      assert.equal(targetResult, targetExpected);
      resolve();
    });
    return testPromise;
  });
  it('can find the metadata query processor', () => {
    const testPromise = new Promise((resolve, reject) => {
      const describeNode = new UniversalDescribe()
        .initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK)
      const describeProcessor = describeNode.determineDescribeProcessor(describeNode.PROCESSOR_TYPE_METADATA);
      assert.notEqual(describeProcessor, null);
      assert.equal(describeProcessor.type, 'metadata');
      resolve();
    });
    return testPromise;
  });
  it('can find the tooling query processor', () => {
    const testPromise = new Promise((resolve, reject) => {
      const describeNode = new UniversalDescribe()
        .initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK)
        const describeProcessor = describeNode.determineDescribeProcessor(describeNode.PROCESSOR_TYPE_TOOLING);
        assert.notEqual(describeProcessor, null);
      assert.equal(describeProcessor.type, 'tooling');
      resolve();
    });
    return testPromise;
  });
  it('can find the soap query processor', () => {
    const testPromise = new Promise((resolve, reject) => {
      const describeNode = new UniversalDescribe()
        .initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK)
        const describeProcessor = describeNode.determineDescribeProcessor(describeNode.PROCESSOR_TYPE_SOAP);
        assert.notEqual(describeProcessor, null);
      assert.equal(describeProcessor.type, 'soap');
      resolve();
    });
    return testPromise;
  });
});