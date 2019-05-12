
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

describe('generate-loop-keys', () => {
  beforeEach((done) => {
    //-- reset the red mock to ensure the getNode is specific to this test
    RED_MOCK = testUtils.createNodeRedMock();
    NODE_MOCK = testUtils.createNodeRedNodeMock();
    CONFIG_MOCK = {
      name:'node'
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
      const soqlQuery = new GenerateLoopKeys();
      soqlQuery.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);
      resolve();
    });
    return testPromise;
  });
});