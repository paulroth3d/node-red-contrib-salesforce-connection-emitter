const log = require('fancy-log');
// const jsforce = require('jsforce');

module.exports = function(RED) {
  'use strict';

  function SalesforcePlatformEventSubscriber(n){
    RED.nodes.createNode(this, n);

    log('connection', n.sfconn);

    const node = this;

    if (n.sfconn){
      const connectionEmitter = RED.nodes.getNode(n.sfconn);
      log('found connectionEmitter:', connectionEmitter);
      log('connectionEmitter.host:', connectionEmitter.host);
      log('emitter:', connectionEmitter.emitter);

      if (connectionEmitter.emitter){
        connectionEmitter.emitter.on('newEvent', (msg) => {
          log('connectionEmitter.emitter:', msg);
        });

        this.handleNewConnection = (connection) => {
          log('connection found:' + connection.accessToken);
        };

        if (connectionEmitter.connection){
          this.handleNewConnection(connectionEmitter.connection);
        } else {
          log('connection not found');
        }

        connectionEmitter.emitter.on('newConnection', (connection) => {
          log('platform event sub.newConnection:' + connection.accessToken);
          this.handleNewConnection(connection);
        });
      }
    }

    node.on("input", (msg) => {
      msg.payload = msg.payload || {};
      msg.payload.subscribeMessage = 'Some message from the publish node';
      node.send(msg);
    });
  }

  // log('hello');
  // console.log('hello');

  RED.nodes.registerType('sf-platform-event-sub', SalesforcePlatformEventSubscriber);
};