const log = require('fancy-log');

// const jsforce = require('jsforce');

const ConnectionReceiver = require('../connection/sf-connection-receiver');

class PlatformEventSubscriber extends ConnectionReceiver {
  
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

  initialize(RED, config, nodeRedNode){
    super.initialize(RED, config, nodeRedNode);

    this.channel = `/event/${this.eventobject}`;
    this.replayId = nodeRedNode.replayId;

    return this;
  }

  handleNewConnection(connection){
    super.handleNewConnection(connection);

    if (this.subscription){
      this.subscription.cancel();
    }

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
