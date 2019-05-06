const log = require('fancy-log'); // eslint-disable-line no-unused-vars

const ConnectionReceiver = require('../connection/sf-connection-receiver');

/**
 * Node Red Node that subscribes to platform events and dispatches event messages.
 */
class PlatformEventPublisher extends ConnectionReceiver {
  
  /** Constructor */
  constructor(){
    super();
  }

  /**
   * Initialize the node red node
   * @param {object} RED - Node Red framework
   * @param {object} config - configuration for module from the node red editor
   * @param {object} nodeRedNode - the node red node instance
   */
  initialize(RED, config, nodeRedNode){
    super.initialize(RED, config, nodeRedNode);

    //-- capture information from the config
    this.eventObject = config.eventobject;

    return this;
  }

  /**
   * Handler for when a new connection has been established
   * @param {jsforce.connection} connection - updated connection
   */
  handleNewConnection(connection){
    super.handleNewConnection(connection);

    this.nodeRedNode.removeAllListeners('input');
    this.nodeRedNode.on('input', (msg) => {
      // log('object to create:', JSON.stringify(msg.payload));
      connection.sobject(this.eventObject).create(msg.payload, (err, result) => {
        if (err) {
          this.nodeRedNode.error(`Error occurred when creating Platform Event:${JSON.stringify(err)}`);
          return;
        } else {
          msg.payload = result;
          this.nodeRedNode.send(msg);
        }
      });
    });
  }

  //-- use the existing method for now
  // handleClose(done){
  //   super.handleClose(done);
  // }
}

/**
 * Initialize node-red node module
 * @param {NodeRed} RED - Node Red framework instance
 */
function setupNodeRed(RED){
  RED.nodes.registerType('sf-platform-event-pub', function(config){
    RED.nodes.createNode(this, config);

    //-- @TODO: the create node to the class.

    //-- capture information from the config
    this.eventObject = config.eventobject;

    this.info = new PlatformEventPublisher()
      .initialize(RED, config, this)
      .listenToConnection('sfconn');
  });
}

//-- because it seems we cannot export the class outright...
setupNodeRed.infoClass = PlatformEventPublisher;

module.exports = setupNodeRed;
