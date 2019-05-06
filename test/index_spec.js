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

  it('can load Receiver from require:', () => {
    const testPromise = new Promise((resolve, reject) => {
      const c = EmitterNodes.connection.SfConnectionEmitter;
      assert.notEqual(c, null, 'class should be there');
      resolve();
    });
    return testPromise;
  });
});

