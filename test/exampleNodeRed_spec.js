/* global describe it */

//-- logger
// const log = require('fancy-log');
//-- asserts for mocha tests / others are also available.
const assert = require('assert');

const eventPublisher = require('../nodes/platformEvents/sf-platform-event-pub');
const eventSubscriber = require('../nodes/platformEvents/sf-platform-event-sub');

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