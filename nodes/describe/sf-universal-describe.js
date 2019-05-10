const log = require('fancy-log'); // eslint-disable-line no-unused-vars

const ConnectionReceiver = require('../connection/sf-connection-receiver');

require('../Types');

/**
 * Node Red Node that can describe many different types of things within Salesforce.
 */
class SfUniversalDescribe extends ConnectionReceiver {

  /** Constructor */
  constructor() {
    super();

    //-- initialize component properties
  }
  
  /**
   * Initialize the node red node
   * @param {object} RED - Node Red framework
   * @param {object} config - configuration for module from the node red editor
   * @param {object} nodeRedNode - the node red instance
   */
  initialize(RED, config, nodeRedNode) {
    super.initialize(RED, config, nodeRedNode);

    //-- capture Node Red info
    this.RED = RED;
    this.config = config;
    this.nodeRedNode = nodeRedNode;

    //-- capture information from the nodeRedNode
    this.name = config.name;

    //-- handle events on the nodeRedNode
    nodeRedNode.on('input', (msg) => {
      // msg.payload = node.query;

      nodeRedNode.send(msg);
    });

    return this;
  }

  /**
   * Handle when the connection is established
   * @param {import('jsforce').Connection} connection - connection that was opened
   */
  handleNewConnection(connection){
    super.handleNewConnection(connection);
  }

  /**
   * Handle when the connection is lost
   * @param {import('jsforce').Connection} connection - connection that was lost
   */
  handleConnectionLost(connection){
    super.handleConnectionLost(connection);
  }

}

/**
 * Initialize node-red node module
 * @param {NodeRed} RED - Node Red framework instance
 */
function setupNodeRed(RED){
  RED.nodes.registerType('sf-universal-describe', function(config){
    RED.nodes.createNode(this, config);

    //-- capture information from the config
    this.name = config.name;

    this.info = new SfUniversalDescribe()
      .initialize(RED, config, this)
      .listenToConnection('sfconn');
  });
}

//-- because it seems we cannot export the class outright...
setupNodeRed.infoClass = SfUniversalDescribe;

module.exports = setupNodeRed;