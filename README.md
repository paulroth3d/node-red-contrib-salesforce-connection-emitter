# Overview

A set of Node Red commands that allows nodes to better connect to salesforce (using environment variables, connection pools and config nodes).

Many of the connections we have seen for Salesforce rely on creating a configuration node to store the credentials.  This is then used by the various other nodes to connect to salesforce - each with their own connection.

We would instead like to ensure the following:

* Credentials are secured using best practices
  * While explicitly stating credentials to the config / resulting JSON is sill allowed, environment variables are now also supported. (Providing greater reusability, support for heroku and security)
* Connections are established at the Connection Credential and emitted to those dependent.
  * Child nodes can get notified of the current connection, when it is disconnected or request it be reset through events.
* Support for ES6 Classes and subclassing
  * By providing classes that can be extended, listening for the events can become quite simple.

# Further

* [Event Emitter](https://nodejs.org/api/events.html#events_class_eventemitter) - to support listening for connections
* [Resliliant streaming with updates available in jsforce - per Mars Hall](https://blog.heroku.com/reactive-programming-salesforce-data)
* [Alternative approach - node-red-contrib-salesforce-platform-event](https://flows.nodered.org/node/node-red-contrib-salesforce-platform-event)
* [Platform Event Considerations](https://developer.salesforce.com/docs/atlas.en-us.platform_events.meta/platform_events/platform_event_extras.htm)
* [JSForce](https://jsforce.github.io/)
* [Streaming API / Replay Extensions for JSForce](https://github.com/jsforce/jsforce/pull/740)