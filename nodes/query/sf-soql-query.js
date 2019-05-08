const log = require('fancy-log'); // eslint-disable-line no-unused-vars

const ConnectionReceiver = require('../connection/sf-connection-receiver');

require('../Types');

/**
 * Node Red Node to run a SOQL Query
 * @class SfSoqlQuery
 * @extends NodeRedNodeClass
 * @property {RED} RED - Node Red instance
 * @property {RED_CONFIG} config - configuration sent for the node
 * @property {NODE_RED_NODE} nodeRedNode
 */
class SoqlQueryNode extends ConnectionReceiver {

  /** Constructor */
  constructor() {
    super();

    //-- initialize component properties
  }
  
  /**
   * Initialize the node red node
   * @param {RED} RED - Node Red framework
   * @param {RED_CONFIG} config - configuration for module from the node red editor
   * @param {NODE_RED_NODE} nodeRedNode - the node red instance
   */
  initialize(RED, config, nodeRedNode) {
    super.initialize(RED, config, nodeRedNode);
    this.RED = RED;
    this.config = config;
    this.nodeRedNode = nodeRedNode;

    //-- capture information from the nodeRedNode
    this.name = nodeRedNode.name;

    return this;
  }

  handleNewConnection(connection){
    super.handleNewConnection(connection);

    //-- handle events on the nodeRedNode
    this.nodeRedNode.removeAllListeners('input');
    this.nodeRedNode.on('input', (msg) => {
      
      let queryToRun = this.RED.util.evaluateNodeProperty(this.config.query, this.config.queryType, this.nodeRedNode, msg);
      // this.RED.util.setMessageProperty(msg, this.config.target, 'results from:' + msg.query);
      let totalRecords = [];

      //-- callback used for both query / queryMore
      const queryCallback = (err, result) => {
        if (err) {
          this.nodeRedNode.error(err);
          return;
        }

        //-- combine to a set of all records retrieved...
        totalRecords = [...totalRecords, ...result.records];

        if (!result.done){
          connection.queryMore(result.nextRecordsUrl, queryCallback);
        } else {
          result.records = totalRecords;
          result.totalSize = result.records.length;

          this.RED.util.setMessageProperty(msg, this.config.target, result);

          this.nodeRedNode.send(msg);
        }
      };
      
      connection.query(queryToRun, queryCallback);
    });
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
      .initialize(RED, config, this)
      .listenToConnection('sfconn');
  });
}

//-- because it seems we cannot export the class outright...
setupNodeRed.infoClass = SoqlQueryNode;

module.exports = setupNodeRed;