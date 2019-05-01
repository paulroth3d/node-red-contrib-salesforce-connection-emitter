const log = require('fancy-log');
// const jsforce = require('jsforce');

module.exports = function(RED) {
  'use strict';

  function SalesforcePlatformEventPublisher(n){
    RED.nodes.createNode(this, n);

    const node = this;

    node.on("input", (msg) => {
      msg.payload = msg.payload || {};
      msg.payload.publishMessage = 'Some message from the publish node';
      node.send(msg);
    });
  }

  log('hello');
  // console.log('hello');

  RED.nodes.registerType('sf-platform-event-pub', SalesforcePlatformEventPublisher);
};