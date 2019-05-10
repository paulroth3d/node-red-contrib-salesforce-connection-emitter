const log = require('fancy-log'); // eslint-disable-line no-unused-vars

const ConnectionReceiver = require('../connection/sf-connection-receiver');

require('../Types');


const SoqlQueryProcessor = require('./queryProcessor/SoqlQueryProcessor');
const ToolingQueryProcessor = require('./queryProcessor/ToolingQueryProcessor');
/**
 * Node Red Node that can query SOQL or Tooling APIs from Salesforce
 */
class SfUniversalQuery extends ConnectionReceiver {

  /** Constructor */
  constructor() {
    super();

    /** Indicates the tooling type */
    this.PROCESSOR_TYPE_TOOLING = 'tooling';
    /** Indicates the soql type */
    this.PROCESSOR_TYPE_SOQL = 'soql';

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
   * Determines the processor to use
   * @param {string} api - (soql|tooling)
   */
  determineQueryProcessor(api){
    if (api === this.PROCESSOR_TYPE_TOOLING){
      return new ToolingQueryProcessor();
    } else if( api === this.PROCESSOR_TYPE_SOQL){
      return new SoqlQueryProcessor();
    } else {
      this.error(`Unknown query processor type:${api}`);
      return null;
    }
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
  // handleConnectionLost(connection){
  //   super.handleConnectionLost(connection);
  // }

}

/**
 * Initialize node-red node module
 * @param {NodeRed} RED - Node Red framework instance
 */
function setupNodeRed(RED){
  RED.nodes.registerType('sf-universal-query', function(config){
    RED.nodes.createNode(this, config);

    //-- capture information from the config
    this.name = config.name;

    this.info = new SfUniversalQuery()
      .initialize(RED, config, this)
      .listenToConnection('sfconn');
  });
}

//-- because it seems we cannot export the class outright...
setupNodeRed.infoClass = SfUniversalQuery;

module.exports = setupNodeRed;