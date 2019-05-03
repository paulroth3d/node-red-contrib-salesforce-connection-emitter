/**
 * Simple base class that receives the sf-connection
 */

const log = require('fancy-log');

const STATUS_CONNECTED = 'CONNECTED';
const STATUS_DISCONNECTED = 'DISCONNECTED';

class SfConnectionReceiver {

  /**
   * 
   * @param {any} RED - Node Red Instance
   * @param {any} config - config module passed from node red
   * @param {any} nodeRedNode - the current node red node
   */
  initialize(RED, config, nodeRedNode){
    this.RED = RED;
    this.config = config;
    this.nodeRedNode = nodeRedNode;

    this.connectionEmitter = null;
    this.connection = null;

    this.STATUS_CONNECTED = STATUS_CONNECTED;
    this.STATUS_DISCONNECTED = STATUS_DISCONNECTED;

    // nodeRedNode.on('close', (done) => {
    //   this.handleClose(done);
    // });

    return this;
  }

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

    this.connectionEmitter.emitter.on('newConnection', (connection) => {
      this.handleNewConnection(connection);
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

  handleNewConnection(connection){
    this.connection = connection;
    this.setStatus(STATUS_CONNECTED);
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