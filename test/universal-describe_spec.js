//-- logger
const log = require('fancy-log'); // eslint-disable-line no-unused-vars
//-- asserts for mocha tests / others are also available.
const {assert,expects} = require('chai'); // eslint-disable-line no-unused-vars

const yourModule = require('../nodes/describe/sf-universal-describe');

//-- helper for node red
const helper = require('node-red-node-test-helper');

describe('sf-universal-describe', () => {
  it('should be running', (done) => {
    assert.equal(1+2,3,'Tests are running in mocha');
    done();
  });
  it('should load sf-universal-describe', () => {
    it('with a name', (done) => {
      const flow = [{id:'n1', type:'sf-universal-describe', name:'Custom_Name'}];
      helper.load(yourModule, flow, () => {
        const n1 = helper.getNode('n1');
        n1.should.have.property('name', 'Custom_Name');
        assert.equal(n1.name, 'Custom_Name', 'The default name should be passed to sf-universal-describe');
        done();
      });
    });
  });
});