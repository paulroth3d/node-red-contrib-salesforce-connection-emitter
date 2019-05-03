/* global describe it beforeEach */

//-- logger
const log = require('fancy-log'); // eslint-disable-line no-unused-vars

//-- asserts for mocha tests / others are also available.
const assert = require('assert');

const ConnectionEmitter = require('../nodes/connection/sf-connection-emitter').infoClass;

const jsforce = require('jsforce');

const sinon = require('sinon');

const config = {
  host: 'https://test.salesforce.com',
  username: 'john@example.com',
  password: 'password',
  token: 'TOKEN'
};

/**
 * Ensure that the mocha tests run
 */
describe('connection-emmitter', () => {
  it('should be running mocha tests', (done) => {
    assert.equal(1+2,3,'Tests are running in mocha');
    done();
  });
});

describe('NodeClass', () => {

  beforeEach( () => {
    //-- stub out jsforce connection
    try {
      jsforce.Connection.prototype.login.restore();
    } catch(err){} // eslint-disable-line no-empty
    sinon.stub(jsforce.Connection.prototype,'login').callsArgWith(2,null, {});
  });

  it('Should create without throwing exceptions', (done) => {
    try {
      new ConnectionEmitter();
    } catch(error){
      assert.fail('Error occurred while creating an instance of the node class:', JSON.stringify(error));
    }
    done();
  });

  it('Should initialize with the credentials passed to it', done => {
    const connectionEmitter = new ConnectionEmitter();
    connectionEmitter.initialize({}, config, {on:function(){}});

    assert.equal(connectionEmitter.host, 'https://test.salesforce.com');
    assert.equal(connectionEmitter.username, config.username);
    assert.equal(connectionEmitter.password, config.password + config.token);

    done();
  });

  it('can use sinon.callsArgWith', (done) => {
    // sinon.stub(jsforce, 'login'.callsArgWith(1,) function(){
    const a = {};
    a.getText = function(){
      assert.fail('should never get here');
    };
    sinon.stub(a, 'getText').callsArgWith(1, null, 'SUCCESS');
    let cb = function(err, response){
      assert.equal(null, err);
      assert.equal(response, 'SUCCESS');
    }
    a.getText('abc', cb);
    done();
  });

  it('can mock resetEmitter', (done) => {
    const connectionEmitter = new ConnectionEmitter();
    connectionEmitter.initialize({}, config, {on:function(){}});
    connectionEmitter.resetEmitter();

    assert.equal(connectionEmitter.host, 'https://test.salesforce.com');
    assert.notEqual(connectionEmitter.connection, null);

    done();
  });
});

/*
describe('node-red', () => {
  it('should load the Publisher', () => {
    it('with a name', (done) => {
      const flow = [{id:'n1', type:'sf-platform-event-pub', name:'Custom_Name'}];
      helper.load(eventPublisher, flow, () => {
        const n1 = helper.getNode('n1');
        n1.should.have.property('name', 'Custom_Name');
        assert.equal(n1.name, 'Custom_Name', 'The default name should be passed to the module');
        done();
      });
    });
  });


  it('should load the Subscriber', () => {
    it('with a name', (done) => {
      const flow = [{id:'n1', type:'sf-platform-event-sub', name:'Custom_Name'}];
      helper.load(eventSubscriber, flow, () => {
        const n1 = helper.getNode('n1');
        n1.should.have.property('name', 'Custom_Name');
        assert.equal(n1.name, 'Custom_Name', 'The default name should be passed to the module');
        done();
      });
    });
  });
})
*/