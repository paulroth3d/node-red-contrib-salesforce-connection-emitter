/* global describe it beforeEach */

const log = require('fancy-log'); // eslint-disable-line no-unused-vars

const {assert,expect} = require('chai'); // eslint-disable-line no-unused-vars

const sinon = require('sinon');

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
let CONFIG_MOCK;

//-- mock the node red node
const NODE_MOCK = testUtils.createNodeRedNodeMock();

/**
 * Ensure that the mocha tests run
 */
describe('platform-event-subscriber', () => {
  beforeEach(() => {
    NODE_MOCK.status.resetHistory();

    //-- reset the context
    NODE_MOCK.context_get.reset();
    NODE_MOCK.context_get = sinon.stub();
    NODE_MOCK.context_set.reset();
    NODE_MOCK.context_set = sinon.stub();

    CONFIG_MOCK = {
      sfconn: 'sfconn',
      eventobject: 'ltng_some_event__e',
      replayid: "-2"
    };
    
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

  //-- replay id tests

  it('uses default if neither serialized or config replay id are sent', () => {
    const testPromise = new Promise((resolve, reject) => {

      CONFIG_MOCK.replayid = null;

      const subscriber = new PlatformEventSubClass();
      sinon.stub(subscriber,'getNodeContext').returns(null);

      subscriber.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);
      subscriber.listenToConnection('sfconn');

      assert(subscriber.replayId === -1 || subscriber.replayId === -2, 'replayId should be defaulted even though we didnt send anything');

      resolve();
    });
    return testPromise;
  });

  it('uses serialized if serialized but nothing sent', () => {
    const testPromise = new Promise((resolve, reject) => {

      const expectedReplayId = 242;
      const serializedReplayId = 242;
      const configReplayId = null;
      CONFIG_MOCK.replayid = configReplayId;

      const subscriber = new PlatformEventSubClass();

      sinon.stub(subscriber,'getNodeContext').returns(serializedReplayId);

      subscriber.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);
      subscriber.listenToConnection('sfconn');

      assert.equal(subscriber.replayId, expectedReplayId);

      resolve();
    });
    return testPromise;
  });

  it('uses config if nothing serialized but config sent', () => {
    const testPromise = new Promise((resolve, reject) => {

      const expectedReplayId = 242;
      const serializedReplayId = null;
      const configReplayId = "242";
      CONFIG_MOCK.replayid = configReplayId;

      const subscriber = new PlatformEventSubClass();
      
      sinon.stub(subscriber,'getNodeContext').returns(serializedReplayId);

      subscriber.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);
      subscriber.listenToConnection('sfconn');

      assert.equal(subscriber.replayId, expectedReplayId);

      resolve();
    });
    return testPromise;
  });

  it('uses serialized if both are there but ! not in config', () => {
    const testPromise = new Promise((resolve, reject) => {

      const expectedReplayId = 242;
      const serializedReplayId = 242;
      const configReplayId = "12";
      CONFIG_MOCK.replayid = configReplayId;

      const subscriber = new PlatformEventSubClass();
      
      sinon.stub(subscriber,'getNodeContext').returns(serializedReplayId);

      subscriber.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);
      subscriber.listenToConnection('sfconn');

      assert.equal(subscriber.replayId, expectedReplayId);

      resolve();
    });
    return testPromise;
  });

  it('uses config if both are there but ! is in config', () => {
    const testPromise = new Promise((resolve, reject) => {

      const expectedReplayId = 12;
      const serializedReplayId = 242;
      const configReplayId = "12!";
      CONFIG_MOCK.replayid = configReplayId;

      const subscriber = new PlatformEventSubClass();
      
      sinon.stub(subscriber,'getNodeContext').returns(serializedReplayId);

      subscriber.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);
      subscriber.listenToConnection('sfconn');

      assert.equal(subscriber.replayId, expectedReplayId);

      resolve();
    });
    return testPromise;
  });
});