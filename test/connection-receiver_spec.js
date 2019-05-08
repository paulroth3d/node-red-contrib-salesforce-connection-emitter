/* global describe it beforeEach */

const log = require('fancy-log'); // eslint-disable-line no-unused-vars

const {assert,expect} = require('chai'); // eslint-disable-line no-unused-vars

const SfConnectionReceiver = require('../nodes/connection/sf-connection-receiver');
// const SfConnectionEmitter = require('../nodes/connection/sf-connection-emitter');

const mockUtils = require('./util/TestUtils');

const CONNECTION_EMITTER_MOCK = mockUtils.createConnectionEmitterMock();
// const CONNECTION_MOCK = CONNECTION_EMITTER_MOCK.info.connection;

const RED_MOCK = mockUtils.createNodeRedMock('some-connection', CONNECTION_EMITTER_MOCK);

const CONFIG_MOCK = {
  sfconn: 'some-connection'
};

const NODE_MOCK = mockUtils.createNodeRedNodeMock();

/**
 * Ensure that the mocha tests run
 */
describe('connection-receiver', () => {
  beforeEach(() => {
    // try {
    //   jsforce.Connection.prototype.login.restore();
    // } catch(err){}
    // sinon.stub(jsforce.Connection.prototype, 'login').callArgWith(2,null,{});

    NODE_MOCK.status.resetHistory();
  });
  
  it('should be running mocha tests', (done) => {
    assert.equal(1+2,3,'Tests are running in mocha');
    done();
  });

  it('Can create ConnectionReceiver without failure', (done) => {
    const receiver = new SfConnectionReceiver();
    receiver.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);
    done();
  });

  it('Can set connected status', (done) => {
    const receiver = new SfConnectionReceiver();
    receiver.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);
    receiver.setStatus(receiver.STATUS_CONNECTED);
    let connectedArg = NODE_MOCK.status.args[0][0];
    assert.equal(connectedArg.fill, 'green');
    assert.equal(connectedArg.text, 'connected');
    done();
  });

  it('can set disconnected status', (done) => {
    const receiver = new SfConnectionReceiver();
    receiver.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);
    receiver.setStatus(receiver.STATUS_DISCONNECTED);
    let connectedArg = NODE_MOCK.status.args[0][0];
    assert.equal(connectedArg.fill, 'red');
    assert.equal(connectedArg.text, 'disconnected');
    done();
  });

  it('can detect existing connection', (done) => {
    const receiver = new SfConnectionReceiver();
    receiver.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);

    receiver.listenToConnection('sfconn');

    let connectedArg = NODE_MOCK.status.args[0][0];
    assert.equal(connectedArg.text, 'connected');
    done();
  });

  it('can listen for new login connections', (done) => {
    const receiver = new SfConnectionReceiver();
    receiver.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);

    receiver.listenToConnection('sfconn');
    
    CONNECTION_EMITTER_MOCK.info.emit('newConnection', {});
    assert(NODE_MOCK.status.called,'node_mock.status should be called');

    let connectedArg = NODE_MOCK.status.lastCall.args[0];
    // log(`connectedArg:${JSON.stringify(connectedArg)}`);
    assert.equal(connectedArg.text, 'connected');
    done();
  });
});