const log = require('fancy-log'); // eslint-disable-line no-unused-vars

const ConnectionReceiver = require('../connection/sf-connection-receiver');

require('../Types');

const AbstractDescribeProcessor = require('./describeProcessor/AbstractDescribeProcessor')
const MetadataDescribeProcessor = require('./describeProcessor/MetadataDescribeProcessor');
const ToolingDescribeProcessor = require('./describeProcessor/ToolingDescribeProcessor');
const SoapDescribeProcessor = require('./describeProcessor/SoapDescribeProcessor');

/**
 * Node Red Node that can describe many different types of things within Salesforce.
 */
class SfUniversalDescribe extends ConnectionReceiver {

  /** Constructor */
  constructor() {
    super();

    /** Indicates the tooling type */
    this.PROCESSOR_TYPE_TOOLING = 'tooling';
    /** Indicates the soql type */
    this.PROCESSOR_TYPE_METADATA = 'meta';
    /** Indicates the soql type */
    this.PROCESSOR_TYPE_SOAP = 'soap';

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
   * @returns {AbstractDescribeProcessor} - processor
   */
  determineDescribeProcessor(api){
    if (api === this.PROCESSOR_TYPE_METADATA){
      return new MetadataDescribeProcessor(this.RED, this.config, this.nodeRedNode);
    } else if( api === this.PROCESSOR_TYPE_SOAP){
      return new SoapDescribeProcessor(this.RED, this.config, this.nodeRedNode);
    } else if( api === this.PROCESSOR_TYPE_TOOLING){
      return new ToolingDescribeProcessor(this.RED, this.config, this.nodeRedNode);
    } else {
      this.nodeRedNode.error(`Unknown query processor type:${api}`);
      return null;
    }
  }

  /**
   * Determines whether to describe all
   * @param {object} msg - the message to capture the information from
   * @return {boolean} - whether to describe all (true) or by object (false)
   */
  determineDescribeAll(msg){
    return this.config.describeAll;
  }

  /**
   * Determines the object to deescribe
   * @param {object} msg - the message to capture the information from
   * @return {string} - the object to describe
   */
  determineObjectName(msg){
    return this.RED.util.evaluateNodeProperty(this.config.objectName, this.config.objectNameType, this.nodeRedNode, msg);
  }

  /**
   * Determines the msg target path to store the results
   * @param {object} msg - the message to capture the information from
   * @return {string} - the target path
   */
  determineTarget(msg){
    return this.config.target;
  }

  /**
   * Handle when the connection is established
   * @param {import('jsforce').Connection} connection - connection that was opened
   */
  handleNewConnection(connection){
    super.handleNewConnection(connection);

    this.nodeRedNode.removeAllListeners('input');
    this.nodeRedNode.on('input', (msg) => {
      const describeAll = this.determineDescribeAll(msg);
      const objectName = this.determineObjectName(msg);
      const target = this.determineTarget(msg);

      //-- @TODO: verify there is no issue with garbage collection
      //-- we want to support multiple queries - there is a possibility of more than one running at a time
      const processor = this.determineDescribeProcessor(this.api);
      processor.execute(
        describeAll,
        objectName,
        target,
        this.connectionEmitter.connection,
        msg
      );
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