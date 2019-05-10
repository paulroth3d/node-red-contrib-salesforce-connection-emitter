/**
 * Simple base class that receives the sf-connection
 */

const log = require('fancy-log');

//-- support typedefs
require('../Types');

// require('./sf-connection-emitter');

const STATUS_CONNECTED = 'CONNECTED';
const STATUS_DISCONNECTED = 'DISCONNECTED';

/**
 * Base Class for Node Red Nodes that should utilize the SfConnectionEmitter.
 * @class SfConnectionReceiver
 * @property {} connectionEmitter - the current connection
 * @property {RED} RED - the node red server
 * @property {RED_CONFIG} config - the configuration for the node
 * @property {NODE_RED_NODE} nodeRedNode - the node red node this will be working with.
 */
class SfConnectionReceiver {

  /**
   * Initialize the Receiver
   * @param {RED} RED - Node Red Instance
   * @param {RED_CONFIG} config - config module passed from node red
   * @param {NODE_RED_NODE} nodeRedNode - the current node red node
   * @returns {SfConnectionReceiver} -
   */
  initialize(RED, config, nodeRedNode){
    /** @property {import('node-red')} RED - the Node Red server */
    this.RED = RED;
    /** @property {RED_CONFIG} config - the configuration sent to this node */
    this.config = config;
    /** @property {NODE_RED_NODE} nodeRedNode - the Node Red Node instance this class manages */
    this.nodeRedNode = nodeRedNode;

    /** @property {import('./sf-platform-connection-emitter').infoClass} connectionEmitter - the connection emitter this listens to */
    this.connectionEmitter = null;
    /** @property {import('jsforce').Connection} connection - the current connection to salesforce @deprecated */
    this.connection = null;

    /** @property {string} STATUS_CONNECTED - provide this status to the nodeRedNode.status to mark connected */
    this.STATUS_CONNECTED = STATUS_CONNECTED;
    /** @property {string} STATUS_DISCONNECTED - provide this status to the nodeRedNode.status to mark disconnected */
    this.STATUS_DISCONNECTED = STATUS_DISCONNECTED;

    // nodeRedNode.on('close', (done) => {
    //   this.handleClose(done);
    // });

    return this;
  }

  /**
   * Given the name of the config property, this listens to the Sf
   * @param {string} connectionPropName - the name of the connection
   */
  listenToConnection(connectionPropName){
    if (!this.RED){
      log.error('RED not found'); return;
    } else if (!this.config){
      log.error('Config not found'); return;
    } else if (!this.config.hasOwnProperty(connectionPropName)){
      log.error('Config does not have property:' + connectionPropName);
    }

    if (typeof this.config[connectionPropName] === 'undefined'){
      log.error('unable to find config[' + connectionPropName + ']');
      return;
    }

    const connectionKey = this.config[connectionPropName];
    this.connectionEmitter = this.RED.nodes.getNode(connectionKey).info;

    if (this.connectionEmitter.connection){
      this.handleNewConnection(this.connectionEmitter.connection);
    } else {
      this.setStatus(STATUS_DISCONNECTED);
    }

    this.connectionEmitter.on('newConnection', (connection) => {
      this.handleNewConnection(connection);
    });

    this.connectionEmitter.on('connectionLost', (connection) => {
      this.handleConnectionLost(connection);
    });

    return this;
  }

  /**
   * Set the status on the Node Red Node
   * @param {string} statusType (this.STATUS_CONNECTED|STATUS_DISCONNECTED)
   */
  setStatus(statusType){
    if (statusType === STATUS_CONNECTED) {
      this.nodeRedNode.status({fill:"green",shape:"dot",text:"connected"});
    } else if (statusType === STATUS_DISCONNECTED) {
      this.nodeRedNode.status({fill:"red",shape:"ring",text:"disconnected"});
    } else {
      log.error(`Unknown status on the platform-event-sub node: ${statusType}`);
    }
  }

  /**
   * Handle when the connection is established
   * @param {import('jsforce').Connection} connection - connection that was opened
   */
  handleNewConnection(connection){
    this.connection = connection;
    this.setStatus(STATUS_CONNECTED);
  }

  /**
   * Handle when the connection is lost
   * <p>Likely this isn't as needed as much as handling new connections</p>
   * @param {import('jsforce').Connection} connection - connection that was lost
   */
  handleConnectionLost(connection){ // eslint-disable-line
    this.connection = null;
  }

  /**
   * Handler for when the node is closed
   * @param {function} done - called when close
   */
  handleClose(done){
    done();
  }
}

module.exports = SfConnectionReceiver;