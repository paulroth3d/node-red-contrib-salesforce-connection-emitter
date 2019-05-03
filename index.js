/**
 * Facade to access the other classes
 */


module.exports = {
  connection : {
    SfConnectionEmitter: require('nodes/connection/sf-connection-emitter'),
    SfConnectionReceiver: require('nodes/connection/sf-connection-receiver')
  },
  platformEvents: {
    SfPlatformEventPublisher: require('nodes/platformEvents/sf-platfrom-event-pub'),
    SfPlatformEventSubscriber: require('nodes/platformEvents/sf-platfrom-event-sub')
  }
};