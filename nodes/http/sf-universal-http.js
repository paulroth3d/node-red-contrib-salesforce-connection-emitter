const log = require('fancy-log'); // eslint-disable-line no-unused-vars

const ConnectionReceiver = require('../connection/sf-connection-receiver');

require('../Types');

/**
 * Node Red Node for requesting a salesforce GET/POST/etc. call from a jsForce connection.
 */
class UniversalHttp extends ConnectionReceiver {

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

    return this;
  }

  /**
   * Handle when the connection is established
   * @param {import('jsforce').Connection} connection - connection that was opened
   */
  handleNewConnection(connection){
    super.handleNewConnection(connection);

    let url;
    // let targetPath = config.target;

    //-- handle events on the nodeRedNode
    this.nodeRedNode.on('input', (msg) => {
      // msg.payload = node.query;

      url = this.RED.util.evaluateNodeProperty(this.config.url, this.config.urlType, this.nodeRedNode, msg);
      connection.requestGet(url, null, (err, result) => {
        if (err){
          this.nodeRedNode.error({
            status:'error',
            request:url,
            err: err
          });
          return;
        }
        this.RED.util.setMessageProperty(msg, this.config.target, {
          url: url,
          response: result
        });
        this.nodeRedNode.send(msg);
      });
    });
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
  RED.nodes.registerType('sf-universal-http', function(config){
    RED.nodes.createNode(this, config);

    //-- capture information from the config
    this.name = config.name;

    this.info = new UniversalHttp()
      .initialize(RED, config, this)
      .listenToConnection('sfconn');
  });
}

//-- because it seems we cannot export the class outright...
setupNodeRed.infoClass = UniversalHttp;

module.exports = setupNodeRed;