const log = require('fancy-log'); // eslint-disable-line

const assert = require('assert');

const EmitterNodes = require('../index');

/**
 * Ensure that the mocha tests run
 */
describe('index', () => {
  it('should be running', (done) => {
    assert.equal(1+2,3,'Tests are running in mocha');
    done();
  });

  it('can load Receiver from require:', () => {
    const testPromise = new Promise((resolve, reject) => {
      const receiver = EmitterNodes.connection.SfConnectionReceiver;
      assert.notEqual(receiver, null, 'receiver should be there');
      
      const receiverInstance = new EmitterNodes.connection.SfConnectionReceiver();
      assert.notEqual(receiverInstance, null, 'receiver should be created based on the class');
      resolve();
    });
    return testPromise;
  });

  it('can be destructured at multiple levels', (done) => {
    const emitters = require('../index');
    assert.notEqual(emitters, null, 'emitters should be found');
    const {connection: {SfConnectionReceiver, SfConnectionEmitter}} = require('../index');
    const receiver = new SfConnectionReceiver();
    assert.notEqual(receiver, null, 'receiver should be created');
    assert.notEqual(SfConnectionEmitter, null, 'SfConnectionEmitter should also be found');
    done();
  });

  it('can destructure the info class', (done) => {
    const {connection: {SfConnectionEmitter}} = require('../index');
    //-- alternatively
    //const emitter = new SfConnectionEmitter.infoClass(RED);
    const emitter = new SfConnectionEmitter();
    assert.notEqual(emitter, null, 'emitter should be created');
    done();
  });
});

