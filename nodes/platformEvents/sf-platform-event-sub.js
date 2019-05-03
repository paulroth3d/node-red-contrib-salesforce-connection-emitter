const log = require('fancy-log');

// const jsforce = require('jsforce');

const ConnectionReceiver = require('../connection/sf-connection-receiver');

debugger;
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
      log(`replayId:${this.replayId}`);
      this.nodeRedNode.send({payload:data});
    })
  }

  //-- use the existing method for now
  // handleClose(done){
  //   super.handleClose(done);
  // }
}

function setupNodeRed(RED){
  RED.nodes.registerType('sf-platform-event-sub', function(config){

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



//---

/*
module.exports = function(RED) {
  'use strict';

  function SalesforcePlatformEventSubscriber(n){
    RED.nodes.createNode(this, n);

    //-- capture information from the config
    this.eventobject = n.eventobject;
    this.replayId = parseInt(n.replayid, 10);
    this.channel = `/event/${this.eventobject}`;


    //-- @TODO: investigate mixin / inheritance

    /#*
     * Set the status on the node
     * @param {string} statusType - (connected|disconnected)
     #/
    this.setStatus = (statusType) => {
      if (statusType === STATUS_CONNECTED) {
        this.status({fill:"green",shape:"dot",text:"connected"});
      } else if (statusType === STATUS_DISCONNECTED) {
        this.status({fill:"red",shape:"ring",text:"disconnected"});
      } else {
        log.error(`Unknown status on the platform-event-sub node: ${statusType}`);
      }
    }

    this.loggerExtension = {
      incoming: (message, callback) => {
        //log('extension messageReceived', message);
        if (message.channel === this.channel && message.data && message.data.event && message.data.event.replayId ){
          this.replayId = parseInt(message.data.event.replayId, 10);
        }
        callback(message);
      }
    }

    //-- @TODO: need a bit more help getting this to work, because it isn't pushing them through...
    // this.loggerReplayExtension = new jsforce.StreamingExtension.Replay(channel); //-- , replayId);

    /#*
     * Handler if a connection has been captured
     * @param {jsforce.Connection} connection - the new jsForce Connection
     #/
    this.handleNewConnection = (connection) => {
      // log('connection found:' + connection.accessToken);
      this.setStatus(STATUS_CONNECTED);

      if (this.subscription){
        this.subscription.cancel();
      }

      // log('loggerExtension:' + this.loggerExtension);
      const fayeClient = connection.streaming.createClient([this.loggerExtension]);
      // const fayeClient = connection.streaming.createClient([this.loggerReplayExtension]);
      
      this.subscription = fayeClient.subscribe(this.channel, (data) => {
        // log('topic recieved data', data);
        log(`replayId:${this.replayId}`);
        this.send({payload:data});
      })
    };

    if (n.sfconn){
      this.connectionEmitter = RED.nodes.getNode(n.sfconn).info;

      if (!this.connectionEmitter.emitter){
        log.error('sf-platform-event-sub: no connection / emitter found.');
        return;
      }

      if (this.connectionEmitter.connection){
        this.handleNewConnection(this.connectionEmitter.connection);
      } else {
        // log.error('no initial connection found.');
        this.setStatus(STATUS_DISCONNECTED);
      }

      this.connectionEmitter.emitter.on('newConnection', (connection) => {
        this.handleNewConnection(connection);
      });
    }
  }

  RED.nodes.registerType('sf-platform-event-sub', SalesforcePlatformEventSubscriber);
};
*/