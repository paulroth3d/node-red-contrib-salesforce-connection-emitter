//-- logger
const log = require('fancy-log');
//-- asserts for mocha tests / others are also available.
const assert = require('assert');

//-- helper for node red
const helper = require('node-red-node-test-helper');

/**
 * Ensure that the mocha tests run
 */
describe('Mocha Tests', () => {
  it('should be running', (done) => {
    assert.equal(1+2,3,'Tests are running in mocha');
    done();
  });
});
