/* global describe it beforeEach */

const log = require('fancy-log'); // eslint-disable-line no-unused-vars

const assert = require('assert');

const EventEmitter = require('events').EventEmitter;
const sinon = require('sinon');

//-- include for mocks later
const jsforce = require('jsforce'); // eslint-disable-line no-unused-vars

const SfConnectionReceiver = require('../nodes/connection/sf-connection-receiver');
// const SfConnectionEmitter = require('../nodes/connection/sf-connection-emitter');

const RED_MOCK = {
  nodes: {
    getNode: () => sinon.stub()
  }
};

const CONFIG_MOCK = {
  sfconn: 'some-connection'
};

const NODE_MOCK = new EventEmitter();
NODE_MOCK.status = sinon.spy();

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

    RED_MOCK.nodes.getNode = sinon.stub();
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

    RED_MOCK.nodes.getNode.returns({
      info: {
        connection: {},
        emitter: new EventEmitter()
      }
    });

    receiver.listenToConnection('sfconn');

    let connectedArg = NODE_MOCK.status.args[0][0];
    assert.equal(connectedArg.text, 'connected');
    done();
  });

  it('can listen for new login connections', (done) => {
    const receiver = new SfConnectionReceiver();
    receiver.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);

    const connectionEmitter = {
      info: {
        connection: null,
        emitter: new EventEmitter()
      }
    };

    RED_MOCK.nodes.getNode.returns(connectionEmitter);
    receiver.listenToConnection('sfconn');

    NODE_MOCK.status.resetHistory();
    
    connectionEmitter.info.emitter.emit('newConnection', {});

    let connectedArg = NODE_MOCK.status.args[0][0];
    assert.equal(connectedArg.text, 'connected');
    done();
  });
});