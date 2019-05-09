/* global describe it beforeEach */

const log = require('fancy-log'); // eslint-disable-line no-unused-vars

const {assert,expect} = require('chai'); // eslint-disable-line no-unused-vars

// const SfConnectionReceiver = require('../nodes/connection/sf-connection-receiver');
const PlatformEventPub = require('../nodes/platformEvents/sf-platform-event-pub')
const PlatformEventPubClass = PlatformEventPub.infoClass;

//-- helper for node red
// const helper = require('node-red-node-test-helper');

const testUtils = require('./util/TestUtils');

const CONNECTION_EMITTER_MOCK = testUtils.createConnectionEmitterMock();
const CONNECTION_MOCK = CONNECTION_EMITTER_MOCK.info.connection;

CONNECTION_MOCK.sobject_create.callsArgWith(1, null, {
  success:true
});

let RED_MOCK; //-- to be reset each test, because each test should have its own unique getNode stub

const CONFIG_MOCK = {
  sfconn: 'sfconn',
  eventobject: 'sf_platform_event__c'
};

const NODE_MOCK = testUtils.createNodeRedNodeMock();

/**
 * Ensure that the mocha tests run
 */
describe('platform-event-publisher', () => {
  beforeEach(() => {
    // try {
    //   jsforce.Connection.prototype.login.restore();
    // } catch(err){}
    // sinon.stub(jsforce.Connection.prototype, 'login').callArgWith(2,null,{});

    NODE_MOCK.status.resetHistory();

    RED_MOCK = testUtils.createNodeRedMock('sfconn', CONNECTION_EMITTER_MOCK);
  });
  
  it('should be running mocha tests', (done) => {
    assert.equal(1+2,3,'Tests are running in mocha');
    done();
  });

  it('can set connected status', (done) => {
    const receiver = new PlatformEventPubClass();
    receiver.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);
    receiver.setStatus(receiver.STATUS_CONNECTED);
    let connectedArg = NODE_MOCK.status.args[0][0];
    assert.equal(connectedArg.fill, 'green');
    assert.equal(connectedArg.text, 'connected');
    done();
  });

  //-- tests from inherited class - receiver
  it('Can create ConnectionReceiver without failure', (done) => {
    const receiver = new PlatformEventPubClass();
    receiver.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);
    done();
  });

  it('Can set connected status', (done) => {
    const receiver = new PlatformEventPubClass();
    receiver.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);
    receiver.setStatus(receiver.STATUS_CONNECTED);

    let connectedArg = NODE_MOCK.status.lastCall.args[0];
    assert.equal(connectedArg.fill, 'green');
    assert.equal(connectedArg.text, 'connected');
    done();
  });

  it('can set disconnected status', (done) => {
    const receiver = new PlatformEventPubClass();
    receiver.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);
    receiver.setStatus(receiver.STATUS_DISCONNECTED);
    let connectedArg = NODE_MOCK.status.lastCall.args[0];
    assert.equal(connectedArg.fill, 'red');
    assert.equal(connectedArg.text, 'disconnected');
    done();
  });

  it('can detect existing connection', (done) => {
    const receiver = new PlatformEventPubClass();
    receiver.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);

    CONFIG_MOCK.sfconn.connection = {};

    receiver.listenToConnection('sfconn');

    let connectedArg = NODE_MOCK.status.lastCall.args[0];
    assert.equal(connectedArg.text, 'connected');
    done();
  });

  it('can create a platform event', () => {
    const testPromise = new Promise((resolve, reject) => {
      const receiver = new PlatformEventPubClass();
      receiver.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);
      receiver.listenToConnection('sfconn');

      NODE_MOCK.emit('input', {
        payload: {
          msg:'did something'
        }
      });

      assert(CONNECTION_MOCK.sobject.called, 'sobject should be called');
      assert(CONNECTION_MOCK.sobject_create.called, 'sobject.create should also have been called');

      assert(NODE_MOCK.send.called, 'Send should have been called on the node');
      const sendArgs = NODE_MOCK.send.lastCall.args[0];
      expect(sendArgs).not.to.be.null;
      // log(`sendArgs:${JSON.stringify(sendArgs)}`);
      assert.equal(sendArgs.payload.success,true);

      resolve();
    });
    return testPromise;
  });
});