/**
 * Facade to access the other classes
 */


module.exports = {
  connection : {
    SfConnectionEmitter: require('./nodes/connection/sf-connection-emitter').infoClass,
    SfConnectionReceiver: require('./nodes/connection/sf-connection-receiver')
  },
  query: {
    SfSoqlQuery: require('./nodes/query/sf-soql-query').infoClass
  },
  platformEvents: {
    SfPlatformEventPublisher: require('./nodes/platformEvents/sf-platform-event-pub').infoClass,
    SfPlatformEventSubscriber: require('./nodes/platformEvents/sf-platform-event-sub').infoClass
  }
};