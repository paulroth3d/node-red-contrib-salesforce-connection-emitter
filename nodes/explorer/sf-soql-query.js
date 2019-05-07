const log = require('fancy-log'); // eslint-disable-line no-unused-vars

const ConnectionReceiver = require('../connection/sf-connection-receiver');

/**
 * Node Red Node to run a SOQL Query
 */
class SoqlQueryNode extends ConnectionReceiver {

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
      // msg.payload = node.query;

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
          this.RED.util.setMessageProperty(msg, this.config.target, result);
          // console.log("total : " + result.totalSize);
          // console.log("fetched : " + result.records.length);
          this.nodeRedNode.send(msg);
        }
      };

      //-- @TODO: promisify
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