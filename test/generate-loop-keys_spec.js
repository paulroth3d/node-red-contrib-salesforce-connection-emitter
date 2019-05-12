//-- logger
const log = require('fancy-log'); // eslint-disable-line no-unused-vars
//-- asserts for mocha tests / others are also available.
const {assert,expect} = require('chai'); // eslint-disable-line no-unused-vars

const GenerateLoopKeys = require('../nodes/iterate/generate-loop-keys').infoClass;

//-- helper for node red
// const helper = require('node-red-node-test-helper');

const testUtils = require('./util/TestUtils');

//-- mock the node red node it will work with
let NODE_MOCK;
//-- mock node red
let RED_MOCK; //-- to be reset each test, because each test should have its own unique getNode stub
//-- mock the config passed to the node
let CONFIG_MOCK;
//-- mock the msg
let MSG_MOCK;

describe('generate-loop-keys', () => {
  beforeEach((done) => {
    RED_MOCK = testUtils.createNodeRedMock();
    NODE_MOCK = testUtils.createNodeRedNodeMock();
    CONFIG_MOCK = {
      name:'node',
      arrayPath: 'payload.results.sobjects',
      valuePath: 'urls.sobject',
      targetPath: 'payload.objectUrls'
    };
    MSG_MOCK = {
      "payload": {
        "results": {
          "sobjects": [
            {
              "name": "AcceptedEventRelation",
              "urls": {
                "sobject": "/services/data/v42.0/sobjects/AcceptedEventRelation"
              }
            },
            {
              "name": "Account",
              "urls": {
                "sobject": "/services/data/v42.0/sobjects/Account"
              }
            },
            {
              "name": "AccountChangeEvent",
              "urls": {
                "sobject": "/services/data/v42.0/sobjects/AccountChangeEvent"
              }
            },
            {
              "name": "AccountCleanInfo",
              "urls": {
                "sobject": "/services/data/v42.0/sobjects/AccountCleanInfo"
              }
            }
          ]
        }
      }
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
      const node = new GenerateLoopKeys();
      node.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);
      resolve();
    });
    return testPromise;
  });
  it('can find a key on an array of literals', () => {
    const testPromise = new Promise((resolve, reject) => {
      const keyPath = null;
      const obj = 1;
      const node = new GenerateLoopKeys();
      node.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);

      const resultKey = node.determineObjectKey(obj, keyPath);
      const expectedKey = 1;
      assert.equal(resultKey, expectedKey, 'sending null should use the literal sent');

      resolve();
    });
    return testPromise;
  });
  it('can find a key on an object', () => {
    const testPromise = new Promise((resolve, reject) => {
      const keyPath = 'prop';
      const obj = {prop: 'something'};
      const node = new GenerateLoopKeys();
      node.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);

      const resultKey = node.determineObjectKey(obj, keyPath);
      const expectedKey = 'something';
      assert.equal(resultKey, expectedKey, 'key should be the same regardless of being on the base of the object');

      resolve();
    });
    return testPromise;
  });
  it('can find a key deep in an object', () => {
    const testPromise = new Promise((resolve, reject) => {
      const keyPath = 'payload.prop';
      const obj = { payload: {prop: 'something'}};
      const node = new GenerateLoopKeys();
      node.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);

      const resultKey = node.determineObjectKey(obj, keyPath);
      const expectedKey = 'something';
      assert.equal(resultKey, expectedKey, 'key should be the same regardless of being on the base of the object');

      resolve();
    });
    return testPromise;
  });
  it('can calculate keys off a list of objects', () => {
    const testPromise = new Promise((resolve, reject) => {
      
      CONFIG_MOCK.arrayPath= 'payload.results.sobjects';
      CONFIG_MOCK.valuePath= 'urls.sobject';
      CONFIG_MOCK.targetPath= 'payload.objectUrls';
      
      const node = new GenerateLoopKeys();
      node.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);

      NODE_MOCK.emit('input', MSG_MOCK);

      assert.equal(NODE_MOCK.send.called, true);

      const sendArgs = NODE_MOCK.send.lastCall.args[0];
      // log(`sendArgs`, JSON.stringify(sendArgs));

      assert.notEqual(sendArgs.payload.objectUrls, null, 'because we put the target path to payload.objectUrls, we should get results there');

      //-- the array path + valuePath
      expect(sendArgs.payload.objectUrls).contains(MSG_MOCK.payload.results.sobjects[0].urls.sobject);
      expect(sendArgs.payload.objectUrls).contains(MSG_MOCK.payload.results.sobjects[1].urls.sobject);
      expect(sendArgs.payload.objectUrls).contains(MSG_MOCK.payload.results.sobjects[2].urls.sobject);
      expect(sendArgs.payload.objectUrls).contains(MSG_MOCK.payload.results.sobjects[3].urls.sobject);
      
      resolve();
    });
    return testPromise;
  });
});