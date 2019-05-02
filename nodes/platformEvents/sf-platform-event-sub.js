const log = require('fancy-log');
// const jsforce = require('jsforce');

module.exports = function(RED) {
  'use strict';

  function SalesforcePlatformEventSubscriber(n){
    RED.nodes.createNode(this, n);

    log('connection', n.connection);

    const node = this;

    node.on("input", (msg) => {
      msg.payload = msg.payload || {};
      msg.payload.subscribeMessage = 'Some message from the publish node';
      node.send(msg);
    });
  }

  log('hello');
  // console.log('hello');

  RED.nodes.registerType('sf-platform-event-sub', SalesforcePlatformEventSubscriber);
};