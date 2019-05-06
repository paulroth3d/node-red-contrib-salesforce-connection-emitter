const log = require('fancy-log'); // eslint-disable-line no-unused-vars

/**
 * Node Red Node to run a SOQL Query
 */
class SoqlQueryNode {

  /** Constructor */
  constructor() {
    // super();

    //-- initialize component properties
  }
  
  /**
   * Initialize the node red node
   * @param {object} RED - Node Red framework
   * @param {object} config - configuration for module from the node red editor
   * @param {object} nodeRedNode - the node red instance
   */
  initialize(RED, config, nodeRedNode) {
    // super.initialize(RED, config, nodeRedNode);

    //-- capture information from the nodeRedNode
    this.name = nodeRedNode.name;

    //-- handle events on the nodeRedNode
    nodeRedNode.on('input', (msg) => {
      // msg.payload = node.query;

      msg.query = RED.util.evaluateNodeProperty(config.query, config.queryType, nodeRedNode, msg); 

      nodeRedNode.send(msg);
    });

    return this;
  }
}

/**
 * Initialize node-red node module
 * @param {NodeRed} RED - Node Red framework instance
 */
function setupNodeRed(RED){
  RED.nodes.registerType('sf-soql-query', function(config){
    RED.nodes.createNode(this, config);

    this.info = new SoqlQueryNode()
      .initialize(RED, config, this);
  });
}

//-- because it seems we cannot export the class outright...
setupNodeRed.infoClass = SoqlQueryNode;

module.exports = setupNodeRed;