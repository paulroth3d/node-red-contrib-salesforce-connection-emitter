const log = require('fancy-log'); // eslint-disable-line no-unused-vars

const ConnectionReceiver = require('../connection/sf-connection-receiver');

/**
 * Node Red Node that subscribes to platform events and dispatches event messages.
 */
class PlatformEventSubscriber extends ConnectionReceiver {
  
  /** Constructor */
  constructor(){
    super();

    this.subscription = null;

    //-- define the logger extension
    this.loggerExtension = {
      incoming: (message, callback) => {
        //log('extension messageReceived', message);
        if (message.channel === this.channel && message.data && message.data.event && message.data.event.replayId ){
          this.replayId = parseInt(message.data.event.replayId, 10);
        }
        callback(message);
      }
    };
  }

  /**
   * Initialize the node red node
   * @param {object} RED - Node Red framework
   * @param {object} config - configuration for module from the node red editor
   * @param {object} nodeRedNode - the node red node instance
   */
  initialize(RED, config, nodeRedNode){
    super.initialize(RED, config, nodeRedNode);

    this.channel = `/event/${this.eventobject}`;
    this.replayId = nodeRedNode.replayId;

    return this;
  }

  /**
   * Handler for when a new connection has been established
   * @param {jsforce.connection} connection - updated connection
   */
  handleNewConnection(connection){
    super.handleNewConnection(connection);

    if (this.subscription){
      this.subscription.cancel();
    }

    //-- @TODO, use the connection failure plugin and the durable connection plugin

    // log('loggerExtension:' + this.loggerExtension);
    const fayeClient = connection.streaming.createClient([this.loggerExtension]);
    // const fayeClient = connection.streaming.createClient([this.loggerReplayExtension]);
    
    this.subscription = fayeClient.subscribe(this.channel, (data) => {
      // log('topic recieved data', data);
      // log(`replayId:${this.replayId}`);
      this.nodeRedNode.send({payload:data});
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
  RED.nodes.registerType('sf-platform-event-sub', function(config){
    RED.nodes.createNode(this, config);

    //-- capture information from the config
    this.eventobject = config.eventobject;
    this.replayId = parseInt(config.replayid, 10);

    this.info = new PlatformEventSubscriber()
      .initialize(RED, config, this)
      .listenToConnection('sfconn');
  });
}

//-- because it seems we cannot export the class outright...
setupNodeRed.infoClass = PlatformEventSubscriber;

module.exports = setupNodeRed;
