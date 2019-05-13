//-- logger
const log = require('fancy-log'); // eslint-disable-line no-unused-vars
//-- asserts for mocha tests / others are also available.
const {assert,expect} = require('chai'); // eslint-disable-line no-unused-vars

const UniversalHttp = require('../nodes/http/sf-universal-http').infoClass;

//-- helper for node red
// const helper = require('node-red-node-test-helper');

const testUtils = require('./util/TestUtils');

//-- mock the connection
let CONNECTION_EMITTER_MOCK;
let CONNECTION_MOCK;
//-- mock the node red node it will work with
let NODE_MOCK;
//-- mock node red
let RED_MOCK; //-- to be reset each test, because each test should have its own unique getNode stub
//-- mock the config passed to the node
let CONFIG_MOCK;
//-- mock the message
let MSG_MOCK;

const EXAMPLE_URL = '/services/data/v42.0/sobjects/AcceptedEventRelation';
const EXAMPLE_URL_RESPONSE = {
  id:1
};

describe('sf-universal-http', () => {
  beforeEach((done) => {
    //-- reset the red mock to ensure the getNode is specific to this test
    CONNECTION_EMITTER_MOCK = testUtils.createConnectionEmitterMock();
    CONNECTION_MOCK = CONNECTION_EMITTER_MOCK.info.connection;
    RED_MOCK = testUtils.createNodeRedMock('sfconn-id', CONNECTION_EMITTER_MOCK);
    CONNECTION_MOCK.requestGet.withArgs(EXAMPLE_URL)
      .callsArgWith(2, null, EXAMPLE_URL_RESPONSE);
    NODE_MOCK = testUtils.createNodeRedNodeMock();
    CONFIG_MOCK = {
      name:'node',
      sfconn: 'sfconn-id',
      url: 'msg.url',
      urlType: 'msg',
      target: 'payload.http'
    };
    MSG_MOCK = {
      payload: {
        url: EXAMPLE_URL
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
      const node = new UniversalHttp();
      node.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);
      resolve();
    });
    return testPromise;
  });
  it('can load an http GET', () => {
    const testPromise = new Promise((resolve, reject) => {
      CONFIG_MOCK.url = 'payload.url';
      CONFIG_MOCK.urlType = 'msg';
      CONFIG_MOCK.target = 'payload.call';
      const node = new UniversalHttp()
        .initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK)
        .listenToConnection('sfconn');
      NODE_MOCK.emit('input', MSG_MOCK);
      assert.equal(CONNECTION_MOCK, node.connection, 'the connection should be the same');
      assert(CONNECTION_MOCK.requestGet.called, 'requestGet should be called');

      assert(NODE_MOCK.send.called,'send should be called');
      const sendVal = NODE_MOCK.send.lastCall.args[0];
      // log(sendVal);
      assert.equal(sendVal.payload.call.url, EXAMPLE_URL);
      assert.equal(sendVal.payload.call.response.id, EXAMPLE_URL_RESPONSE.id);
      resolve();
    });
    return testPromise;
  });
});