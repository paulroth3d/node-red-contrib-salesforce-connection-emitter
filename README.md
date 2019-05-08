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

# Nodes

## [connection.SfConnectionEmitter](./nodes/connection/sf-connection-emitter.js)

**Configuration Node** - used by most (if not all of the other Salesforce commands.

When other nodes specify their type as `sf-connection-emitter`, then a drop-down dialog allows them to choose which configuration to use.

Each configuration manages the connection to salesforce, and emits events to those listening when:

* (newConnection) - a connection is established
* (logout) - the connection has been disconnected
* (refresh) - the connection should be restarted (logout and re-established)

For nodes that subclass the [connection.SfConnectionReceiver](./nodes/connection/sf-connection-receiver) - this is all handled for you, simply overload the following methods:



### Configuration

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Description</th>
			<th>Example</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Name</td>
			<td>Label to show in Node Red Editor</td>
			<td>SF Connection</td>
		</tr>
		<tr>
			<td>Connection</td>
			<td></td>
			<td></td>
		</tr>
		<tr>
			<td>Event API Name</td>
			<td></td>
			<td></td>
		</tr>
		<tr>
			<td>Replay ID</td>
			<td></td>
			<td></td>
		</tr>
	</tbody>
</table>

## [connection.SfConnectionReceiver](./nodes/connection/sf-connection-receiver)

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Description</th>
			<th>Example</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td></td>
			<td></td>
			<td></td>
		</tr>
		<tr>
			<td></td>
			<td></td>
			<td></td>
		</tr>
		<tr>
			<td></td>
			<td></td>
			<td></td>
		</tr>
	</tbody>
</table>

## [query.SfSoqlQuery](./nodes/query/sf-soql-query)

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Description</th>
			<th>Example</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<th></th>
			<th></th>
			<th></th>
		</tr>
	</tbody>
</table>

## [platformEvents.SfPlatformEventPublisher](./nodes/platformEvents/sf-platform-event-pub)

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Description</th>
			<th>Example</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<th></th>
			<th></th>
			<th></th>
		</tr>
	</tbody>
</table>

## [platformEvents.SfPlatformEventSubscriber](./nodes/platformEvents/sf-platform-event-sub)

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Description</th>
			<th>Example</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<th></th>
			<th></th>
			<th></th>
		</tr>
	</tbody>
</table>

# Extending

While the request to use ES6 classes is currently underway within Node-Red modules, the following is the current structure for the nodes:

All nodes can be found by importing the module:

* connection
	* [SfConnectionEmitter](./nodes/connection/sf-connection-emitter.js)
	* [SfConnectionReceiver](./nodes/connection/sf-connection-receiver)
* query
	* [SfSoqlQuery](./nodes/query/sf-soql-query)
* platformEvents
	* [SfPlatformEventPublisher](./nodes/platformEvents/sf-platform-event-pub)
	* [SfPlatformEventSubscriber](./nodes/platformEvents/sf-platform-event-sub)

Note that Node-Red gets access to the setupNodeRed function,
using require(...) directly gives access to the es6 class.

---

For example: to access the ConnectionReceiver (for subclassing), use the following:

	const connectionEmitter = require('node-red-contrib-salesforce-connection-emitter');
	const SfConnectionReceiver = connectionEmitter.connection.SfConnectionReceiver;
	//-- or directly through destructuring
	const {connection: {SfConnectionReceiver}} = require('node-red-contrib-salesforce-connection-emitter');
	
	class MyClass extends SfConnectionReceiver {...}
	
one further example - changing the name of the class:

	const {connection: {SfConnectionReceiver:ConnectionReceiver}} = require('node-red-contrib-salesforce-connection-emitter');
	
	class MyClass extends ConnectionReceiver {...}



# Further

* [Event Emitter](https://nodejs.org/api/events.html#events_class_eventemitter) - to support listening for connections
* [Resliliant streaming with updates available in jsforce - per Mars Hall](https://blog.heroku.com/reactive-programming-salesforce-data)
* [Alternative approach - node-red-contrib-salesforce-platform-event](https://flows.nodered.org/node/node-red-contrib-salesforce-platform-event)
* [Platform Event Considerations](https://developer.salesforce.com/docs/atlas.en-us.platform_events.meta/platform_events/platform_event_extras.htm)
* [JSForce](https://jsforce.github.io/)
* [Streaming API / Replay Extensions for JSForce](https://github.com/jsforce/jsforce/pull/740)