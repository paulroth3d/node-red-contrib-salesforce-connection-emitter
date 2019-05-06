/**
 * Facade to access the other classes
 */


module.exports = {
  connection : {
    SfConnectionEmitter: require('./nodes/connection/sf-connection-emitter'),
    SfConnectionReceiver: require('./nodes/connection/sf-connection-receiver')
  },
  explorer: {
    SfSoqlQuery: require('./nodes/explorer/sf-soql-query')
  },
  platformEvents: {
    SfPlatformEventPublisher: require('./nodes/platformEvents/sf-platform-event-pub'),
    SfPlatformEventSubscriber: require('./nodes/platformEvents/sf-platform-event-sub')
  }
};