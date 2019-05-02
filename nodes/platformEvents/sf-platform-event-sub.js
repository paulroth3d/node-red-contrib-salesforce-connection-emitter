const log = require('fancy-log');
// const jsforce = require('jsforce');

const STATUS_CONNECTED = 'CONNECTED';
const STATUS_DISCONNECTED = 'DISCONNECTED';

module.exports = function(RED) {
  'use strict';

  function SalesforcePlatformEventSubscriber(n){
    RED.nodes.createNode(this, n);

    //-- @TODO: investigate mixin / inheritance

    /**
     * Set the status on the node
     * @param {string} statusType - (connected|disconnected)
     */
    this.setStatus = (statusType) => {
      if (statusType === STATUS_CONNECTED) {
        this.status({fill:"green",shape:"dot",text:"connected"});
      } else if (statusType === STATUS_DISCONNECTED) {
        this.status({fill:"red",shape:"ring",text:"disconnected"});
      } else {
        log.error(`Unknown status on the platform-event-sub node: ${statusType}`);
      }
    }

    this.loggerExtension = {
      incoming: (message, callback) => {
        log('extension messageReceived', message);
        log(`replayId:${this.replayId}`);
        callback(message);
      }
    }

    /**
     * Handler if a connection has been captured
     * @param {jsforce.Connection} connection - the new jsForce Connection
     */
    this.handleNewConnection = (connection) => {
      log('connection found:' + connection.accessToken);
      this.setStatus(STATUS_CONNECTED);

      if (this.subscription){
        this.subscription.cancel();
      }

      this.replayId = 200;

      log('loggerExtension:' + this.loggerExtension);
      const fayeClient = connection.streaming.createClient([this.loggerExtension]);

      const channel = `/event/ltng_Req_Hello__e`;
      this.subscription = fayeClient.subscribe(channel, (data) => {
        log('topic recieved data', data);

        this.send({payload:data});
      })
    };

    if (n.sfconn){
      const connectionEmitter = RED.nodes.getNode(n.sfconn);

      if (!connectionEmitter.emitter){
        log.error('sf-platform-event-sub: no connection / emitter found.');
        return;
      }

      if (connectionEmitter.connection){
        this.handleNewConnection(connectionEmitter.connection);
      } else {
        log.error('no initial connection found.');
        this.setStatus(STATUS_DISCONNECTED);
      }

      connectionEmitter.emitter.on('newConnection', (connection) => {
        this.handleNewConnection(connection);
      });
    }
  }

  RED.nodes.registerType('sf-platform-event-sub', SalesforcePlatformEventSubscriber);
};