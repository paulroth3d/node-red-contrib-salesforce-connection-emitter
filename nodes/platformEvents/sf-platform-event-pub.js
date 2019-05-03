const log = require('fancy-log');
// const jsforce = require('jsforce');

const STATUS_CONNECTED = 'CONNECTED';
const STATUS_DISCONNECTED = 'DISCONNECTED';

module.exports = function(RED) {
  'use strict';

  function SalesforcePlatformEventPublisher(n){
    RED.nodes.createNode(this, n);

    //-- get variables
    this.eventObject = n.eventobject;

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

    /**
     * Handler if a connection has been captured
     * @param {jsforce.Connection} connection - the new jsForce Connection
     */
    this.handleNewConnection = (connection) => {
      // log('connection found:' + connection.accessToken);
      this.setStatus(STATUS_CONNECTED);

      this.on('input', (msg) => {
        // log('object to create:', JSON.stringify(msg.payload));
        connection.sobject(this.eventObject).create(msg.payload, (err, result) => {
          if (err || !result.success) {
            msg.error = err;
            msg.return = result;
            this.send(msg);
          } else {
            msg.payload = result;
            this.send(msg);
          }
        });
      });
    };

    if (n.sfconn){
      const connectionEmitter = RED.nodes.getNode(n.sfconn).info;

      if (!connectionEmitter.emitter){
        log.error('sf-platform-event-sub: no connection / emitter found.');
        return;
      }

      if (connectionEmitter.connection){
        this.handleNewConnection(connectionEmitter.connection);
      } else {
        // log.error('no initial connection found.');
        this.setStatus(STATUS_DISCONNECTED);
      }

      connectionEmitter.emitter.on('newConnection', (connection) => {
        this.handleNewConnection(connection);
      });
    }
  }

  RED.nodes.registerType('sf-platform-event-pub', SalesforcePlatformEventPublisher);
};