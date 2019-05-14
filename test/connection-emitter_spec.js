/* global describe it beforeEach */

//-- logger
const log = require('fancy-log'); // eslint-disable-line no-unused-vars

//-- asserts for mocha tests / others are also available.
const {assert,expect} = require('chai');

const ConnectionEmitter = require('../nodes/connection/sf-connection-emitter').infoClass;

const jsforce = require('jsforce');

const sinon = require('sinon');

const testUtils = require('./util/TestUtils');


const LOGIN = 'login';
const ERROR_ERRNO_OBJ = {"errno":"ENOTFOUND","code":"ENOTFOUND","syscall":"getaddrinfo","hostname":"test.salesforce.com","host":"test.salesforce.com","port":443};
const ErrorHostNotFound = require('../nodes/connection/errorMatchers/connection-host-not-found')(LOGIN);

let RED_MOCK; //-- to be reset each test, because each test may have different nodes

const CONFIG_MOCK = {
  host: 'https://test.salesforce.com',
  hostType:'str',
  username: 'john@example.com',
  usernameType:'str',
  password: 'password',
  passwordType:'str',
  token: 'TOKEN',
  tokenType:'str'
};

const NODE_MOCK = testUtils.createNodeRedNodeMock();

describe('Connection-Emitter', () => {

  beforeEach( () => {
    //-- stub out jsforce connection
    try {
      jsforce.Connection.prototype.login.restore();
    } catch(err){} // eslint-disable-line no-empty
    sinon.stub(jsforce.Connection.prototype,'login').callsArgWith(2,null, {});

    RED_MOCK = testUtils.createNodeRedMock(null,null);
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
    connectionEmitter.initialize(RED_MOCK, CONFIG_MOCK, NODE_MOCK);

    assert.equal(connectionEmitter.host, 'https://test.salesforce.com');
    assert.equal(connectionEmitter.username, CONFIG_MOCK.username);
    assert.equal(connectionEmitter.password, CONFIG_MOCK.password + CONFIG_MOCK.token);

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
    connectionEmitter.initialize(RED_MOCK, CONFIG_MOCK, {on:function(){}});
    connectionEmitter.resetEmitter();

    assert.equal(connectionEmitter.host, 'https://test.salesforce.com');
    assert.notEqual(connectionEmitter.connection, null);

    done();
  });
});

describe('ConnectionEmitter.ConnectionNotFoundGuidance', () => {
  it('Detects ENOTFOUND from Login', (done) => {
    const guidance = ErrorHostNotFound.matches(LOGIN, ERROR_ERRNO_OBJ);
    expect(guidance).not.to.be.null;
    // let expectedMsg = 'Could not connect to login host';
    expect(guidance.userFriendlyError).to.contain('Could not connect');
    expect(guidance.developerError).to.contain('test.salesforce.com');
    done();
  });
  it('Does not match other login errors', (done) => {
    const userGuidance = ErrorHostNotFound.matches(LOGIN, {});
    expect(userGuidance).to.be.null;
    done();
  });
  it('Does not match other types of errors', (done) => {
    const userGuidance = ErrorHostNotFound.matches('NoMatch', {});
    expect(userGuidance).to.be.null;
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