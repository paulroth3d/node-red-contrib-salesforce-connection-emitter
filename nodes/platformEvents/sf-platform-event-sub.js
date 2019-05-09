const log = require('fancy-log'); // eslint-disable-line no-unused-vars

const ConnectionReceiver = require('../connection/sf-connection-receiver');

const jsforce = require('jsforce');

/**
 * Node Red Node that subscribes to platform events and dispatches event messages.
 */
class PlatformEventSubscriber extends ConnectionReceiver {
  
  /** Constructor */
  constructor(){
    super();

    /** @property {any} subscription - the current subscription to the stream */
    this.subscription = null;

    //-- define the logger extension
    /** Simple extension to capture the last replayId captured */
    this.loggerExtension = null;
    /** Extension to provide durability for working with platform events */
    this.replayExtension = null;
    /** Extension for capturing when the subscription fails */
    this.authFailureExtension = null;

    /** @property {string} channel - the channel to listen for streams on **/
    this.channel = null;
    /** @property {integer} replayId - The replayId to start listening to platform events from */
    this.replayId = -1;
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
    this.channel = `/event/${config.eventobject}`;

    let preservedReplayId = this.getNodeContext('replayId');
    let configReplayId = parseInt(config.replayid, 10) || null;
    let forceConfigReplayId = config.replayid && config.replayid.includes('!');

    this.replayId = -1;
    if (preservedReplayId){
      this.replayId = preservedReplayId;
    }
    if (configReplayId && (!preservedReplayId || forceConfigReplayId)){
      this.replayId = configReplayId;
    }
    // log(`flow preserved flowReplayId:${preservedReplayId}, configReplay:${configReplayId}, forceConfig:${forceConfigReplayId?'true':'false'}`);
    // log(`final replayId:${this.replayId}`);

    return this;
  }

  /**
   * Retrieves a value in the node context
   * @see https://nodered.org/docs/creating-nodes/context
   * @param {string} prop - name of the prop to store
   */
  getNodeContext(prop){
    return this.nodeRedNode.context().get(prop);
    // return this.nodeRedNode.context().flow.get(prop);
    // return this.nodeRedNode.context().global.get(prop);
  }
  /**
   * Stores a value in the node context
   * @see https://nodered.org/docs/creating-nodes/context
   * @param {string} prop - prop to store
   * @param {any} val - value to store
   */
  setNodeContext(prop, val){
    this.nodeRedNode.context().set(prop, val);
    // this.nodeRedNode.context().flow.set(prop, val);
    // this.nodeRedNode.context().global.set(prop, val);
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

    this.loggerExtension = {
      incoming: (message, callback) => {
        // log(`message received in logger extension:`, JSON.stringify(message));
        if (message.channel === this.channel && message.data && message.data.event && message.data.event.replayId ){
          this.replayId = parseInt(message.data.event.replayId, 10);
          this.setNodeContext('replayId', this.replayId);
          this.nodeRedNode.status({fill:"green",shape:"dot",text:`connected[replayId:${this.replayId}]`});
        } else if (message.channel === '/meta/subscribe' && message.successful === true){
          this.nodeRedNode.status({fill:"green",shape:"dot",text:`connected[replayId:${this.replayId}]`});
        }
        callback(message);
      }
    };

    this.replayExtension = new jsforce.StreamingExtension.Replay(this.channel, this.replayId);

    this.authFailureExtension = new jsforce.StreamingExtension.AuthFailure(() => {
      log('failure occurred when streaming with salesforce.. Requesting reconnect...');
      if (connection){
        connection.emit('refresh');
      }
    });

    const fayeClient = connection.streaming.createClient(
      // [this.loggerExtension, this.replayExtension, this.authFailureExtension]
      [this.loggerExtension]
    );

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

    this.info = new PlatformEventSubscriber()
      .initialize(RED, config, this)
      .listenToConnection('sfconn');
  });
}

//-- because it seems we cannot export the class outright...
setupNodeRed.infoClass = PlatformEventSubscriber;

module.exports = setupNodeRed;
