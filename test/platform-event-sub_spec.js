/* global describe it beforeEach */

const log = require('fancy-log'); // eslint-disable-line no-unused-vars

const {assert,expect} = require('chai'); // eslint-disable-line no-unused-vars

// const SfConnectionReceiver = require('../nodes/connection/sf-connection-receiver');
const PlatformEventSub = require('../nodes/platformEvents/sf-platform-event-sub')
const PlatformEventSubClass = PlatformEventSub.infoClass;

//-- helper for node red
// const helper = require('node-red-node-test-helper');

const testUtils = require('./util/TestUtils');

//-- create mock jsforce connection
const CONNECTION_MOCK = testUtils.createJsForceConnectionMock();

//-- when someone calls subscribe, send a message
const STREAMING_CLIENT_MOCK = testUtils.createJsForceStreamingClient();
const SAMPLE_STREAM_MESSAGE = { replayId:1, msg:'success'};
STREAMING_CLIENT_MOCK.subscribe.callsArgWith(1, SAMPLE_STREAM_MESSAGE);
//-- update the stub to use our streaming mock
CONNECTION_MOCK.streaming.createClient.returns(STREAMING_CLIENT_MOCK);

//-- reset the createClient to our custom streaming client
const CONNECTION_EMITTER_MOCK = testUtils.createConnectionEmitterMock(CONNECTION_MOCK);

//-- create a mock for Node Red
let RED_MOCK; //-- to be reset each test, because each test should have its own unique getNode stub

//-- mock the configuration to be sent to the node
const CONFIG_MOCK = {
  sfconn: 'sfconn'
};

//-- mock the node red node
const NODE_MOCK = testUtils.createNodeRedNodeMock();

/**
 * Ensure that the mocha tests run
 */
describe('platform-event-subscriber', () => {
  beforeEach(() => {
    NODE_MOCK.status.resetHistory();
    
    //-- reset the red mock to ensure the getNode is specific to this test
    RED_MOCK = testUtils.createNodeRedMock('sfconn', CONNECTION_EMITTER_MOCK);
  });
  
  it('should be running mocha tests', (done) => {
    assert.equal(1+2,3,'Tests are running in mocha');
    done();
  });

  it('can set connected status', (done) => {
    const subscriber = new PlatformEventSubClass();
    subscriber.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);
    subscriber.setStatus(subscriber.STATUS_CONNECTED);
    let connectedArg = NODE_MOCK.status.lastCall.args[0];
    assert.equal(connectedArg.fill, 'green');
    assert.equal(connectedArg.text, 'connected');
    done();
  });

  

  //-- tests from inherited class - receiver
  it('Can create ConnectionReceiver without failure', (done) => {
    const subscriber = new PlatformEventSubClass();
    subscriber.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);
    done();
  });

  it('Can set connected status', (done) => {
    const subscriber = new PlatformEventSubClass();
    subscriber.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);
    subscriber.setStatus(subscriber.STATUS_CONNECTED);
    let connectedArg = NODE_MOCK.status.lastCall.args[0];
    assert.equal(connectedArg.fill, 'green');
    assert.equal(connectedArg.text, 'connected');
    done();
  });

  it('can set disconnected status', (done) => {
    const subscriber = new PlatformEventSubClass();
    subscriber.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);
    subscriber.setStatus(subscriber.STATUS_DISCONNECTED);
    let connectedArg = NODE_MOCK.status.lastCall.args[0];
    assert.equal(connectedArg.fill, 'red');
    assert.equal(connectedArg.text, 'disconnected');
    done();
  });

  it('can detect existing connection', (done) => {
    const subscriber = new PlatformEventSubClass();
    subscriber.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);

    subscriber.listenToConnection('sfconn');

    let connectedArg = NODE_MOCK.status.lastCall.args[0];
    assert.equal(connectedArg.text, 'connected');
    done();
  });

  it('can detect events from subscription', () => {
    const testPromise = new Promise((resolve, reject) => {
      const subscriber = new PlatformEventSubClass();
      subscriber.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);
      subscriber.listenToConnection('sfconn');

      //-- using the subscribe mock above
      //-- we assume when we listen to the connection, there will be a connection found
      //-- and the connection will create a client and subscribe to the channel
      //-- (this assert works, but not sure we want to test for this level)
      // assert(STREAMING_CLIENT_MOCK.subscribe.called, 'subscription should be called');
      
      //-- with the subscription callsArgWith, it will immediately call back to the subscription
      //-- calling a send on the node
      assert(NODE_MOCK.send.called, 'Node_Mock.send called');
      // log(`node.send:${JSON.stringify(NODE_MOCK.send.lastCall.args[0])}`);
      const sendArg = NODE_MOCK.send.lastCall.args[0];
      expect(sendArg).not.to.be.null;
      assert.equal(sendArg.payload.replayId,1);
      assert.equal(sendArg.payload.msg,'success');

      resolve();
    });
    return testPromise;
  });
});