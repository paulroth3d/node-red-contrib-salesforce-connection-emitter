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

## [connection.SfConnectionEmitter](nodes/connection/sf-connection-emitter.js)

**Configuration Node** - used by most (if not all of the other Salesforce commands.

When other nodes specify their type as `sf-connection-emitter`, then a drop-down dialog allows them to choose which configuration to use.

Each configuration manages the connection to salesforce, and emits events to those listening when:

* (newConnection) - a connection is established
* (connectionLost) - the connection has been disconnected
* (refresh) - the connection should be restarted (logout and re-established)
* (logout) - request the connection be severed

For nodes that subclass the [connection.SfConnectionReceiver](#connectionsfconnectionreceiver) - this is all handled for you... For more information, [please see that class](nodes/connection/sf-connection-receiver.js)

![Screenshot of ConnectionEmitter](docs/images/ConnectionEmitter.jpg)


### Configuration

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Type</th>
			<th>Description</th>
			<th>Example</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Name</td>
			<td>String</td>
			<td>Label to show in Node Red Editor</td>
			<td>SF Connection</td>
		</tr>
		<tr>
			<td>Host</td>
			<td>string</td>
			<td>Domain to login with <br />
				OR name of environment variable
			</td>
			<td>https://test.salesforce.com<br />
				or test.salesforce.com <br />
				or login.salesforce.com <br />
				or SF_HOST
			</td>
		</tr>
		<tr>
			<td>Password</td>
			<td>string</td>
			<td>Password for that user <br />
				OR name of environment variable <br />
				(note: token does not use environment variable, so include in password if using environment variable)
			</td>
			<td>t0tallyVALID! <br />
				or t0talyVALID!0abcd <br />
				or SF_PASSWORD
			</td>
		</tr>
		<tr>
			<td>Security Token</td>
			<td>string</td>
			<td><a href='https://help.salesforce.com/articleView?id=user_security_token.htm&type=5'>Security Token for user</a></td>
			<td>0abcd</td>
		</tr>
	</tbody>
</table>

### Events

The SfConnectionEmitter dispatches four types of events, automatically handled by the 

Each configuration manages the connection to salesforce, and emits events to those listening when:

* (newConnection) - a connection is established
* (connectionLost) - the connection has been disconnected
* (refresh) - the connection should be restarted (logout and re-established)
* (logout) - request the connection be severed

For nodes that subclass the [connection.SfConnectionReceiver](#connectionsfconnectionreceiver) - this is all handled for you... For more information, [please see that class](nodes/connection/sf-connection-receiver.js)

## [query.SfSoqlQuery](nodes/query/sf-soql-query.js)

Use this node to perform a SOQL query to capture information from Salesforce

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Type</th>
			<th>Description</th>
			<th>Example</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Name</td>
			<td>String</td>
			<td>Label to show in Node Red Editor</td>
			<td>Query</td>
		</tr>
		<tr>
			<td>Connection</td>
			<td> connection.SfConnectionEmitter</td>
			<td>The connection emitter configuration to use</td>
			<td>sfconn</td>
		</tr>
		<tr>
			<td>Query</td>
			<td>msg property | global variable | string | environment variable </td>
			<td>The query to execute. (msg property is recommended, as a template can easily help here)</td>
			<td>msg.info.query</td>
		</tr>
		<tr>
			<td>Target</td>
			<td>msg property</td>
			<td>The path on the msg to put the results</td>
			<td>payload.results</td>
		</tr>
	</tbody>
</table>

![Screenshot of Soql Query](docs/images/SoqlQuery.jpg)

## [platformEvents.SfPlatformEventSubscriber](nodes/platformEvents/sf-platform-event-sub.js)

Use this to listen to <a href='https://developer.salesforce.com/docs/atlas.en-us.platform_events.meta/platform_events/platform_events_intro.htm'>Salesforce Platform Events</a>

More on Platform Events can also be [found on Trailhead.Salesforce.com](https://trailhead.salesforce.com/en/content/learn/modules/platform_events_basics)

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Type</th>
			<th>Description</th>
			<th>Example</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Name</td>
			<td>String</td>
			<td>Label to show in Node Red Editor</td>
			<td>PE Subscription</td>
		</tr>
		<tr>
			<td>Connection</td>
			<td> connection.SfConnectionEmitter</td>
			<td>The connection emitter configuration to use</td>
			<td>sfconn</td>
		</tr>
		<tr>
			<td>Event API Name</td>
			<td>string</td>
			<td>Platform Event Object API Name</td>
			<td>ltng_Hello__e</td>
		</tr>
		<tr>
			<td></td>
			<td></td>
			<td>The Replay Id to start listening to messages from. 
				(-1 to only listen to those moving forward).
				<a href='https://developer.salesforce.com/docs/atlas.en-us.api_streaming.meta/api_streaming/using_streaming_api_durability.htm'>See here for more information</a><br /> <br />
				<b>NOTE: the replay Id captured is preserved for you automatically.</b> 
To force the replay Id, configure it with an exclaimation mark / bang at the end:
For example: 12!</td>
			<td></td>
		</tr>
	</tbody>
</table>

![Screenshot of subscription](docs/images/subscription.jpg)

As mentioned above, the replay Id captured is preserved for you automatically.

Note that this is preserved to be only visible to that same node, as opposed to the flow or within the whole project. [Please see Node Red's documentation on Node Context for more](https://nodered.org/docs/creating-nodes/context)

While this is a decent stop-gap, future work will allow it to be stored to external services (such as a Redis store).
 
To force the replay Id, configure it with an exclaimation mark / bang at the end:
For example: 12!



## [platformEvents.SfPlatformEventPublisher](nodes/platformEvents/sf-platform-event-pub.js)

Use this to publish <a href='https://developer.salesforce.com/docs/atlas.en-us.platform_events.meta/platform_events/platform_events_intro.htm'>Salesforce Platform Events</a>

Simply apply the object you want to publish as the msg.payload and it will handle the rest.

More on Platform Events can also be [found on Trailhead.Salesforce.com](https://trailhead.salesforce.com/en/content/learn/modules/platform_events_basics)

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Type</th>
			<th>Description</th>
			<th>Example</th>
		</tr>
	</thead>
	<tbody>
	<tbody>
		<tr>
			<td>Name</td>
			<td>String</td>
			<td>Label to show in Node Red Editor</td>
			<td>PE Subscription</td>
		</tr>
		<tr>
			<td>Connection</td>
			<td> connection.SfConnectionEmitter</td>
			<td>The connection emitter configuration to use</td>
			<td>sfconn</td>
		</tr>
		<tr>
			<td>Event API Name</td>
			<td>string</td>
			<td>Platform Event Object API Name</td>
			<td>ltng_Hello__e</td>
		</tr>
	</tbody>
</table>

![Screenshot of Publisher](docs/images/publisher.jpg)


## [query.SfUniversalQuery](nodes/nodes/query/sf-universal-query.js)

Use this to do a SOQL or Tooling API query within Salesforce.

Supports selection of the API, queries that can be (environment variables, global settings, property within a message, etc) and you can specify where the results go.

## Example Flow

	[{"id":"d2048d63.a9936","type":"tab","label":"Flow 1","disabled":false,"info":""},{"id":"802b9dc4.7cebc","type":"inject","z":"d2048d63.a9936","name":"","topic":"","payload":"{\"query\":\"select id from Apexclass\"}","payloadType":"json","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":130,"y":140,"wires":[["3251ec56.5aef64"]]},{"id":"3251ec56.5aef64","type":"sf-universal-query","z":"d2048d63.a9936","name":"","sfconn":"73000fb4.ffb8e","api":"soql","query":"payload.query","queryType":"msg","target":"payload.some.result.somewhere","limit":100,"x":360,"y":140,"wires":[["a7b76b3.b6f7c98"]]},{"id":"a7b76b3.b6f7c98","type":"debug","z":"d2048d63.a9936","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"false","x":590,"y":140,"wires":[]},{"id":"73000fb4.ffb8e","type":"sf-connection-emitter","z":"","host":"SF_HOST","hostType":"env","username":"SF_USERNAME","usernameType":"env","password":"SF_PASSWORD","passwordType":"env","token":"","tokenType":"env"}]

![Screenshot of universal query](docs/images/UniversalQuery.png)

## Properties

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Type</th>
			<th>Description</th>
			<th>Example</th>
		</tr>
	</thead>
	<tbody>
	<tbody>
		<tr>
			<td>Name</td>
			<td>String</td>
			<td>Label to show in Node Red Editor</td>
			<td>Universal Query</td>
		</tr>
		<tr>
			<td>Connection</td>
			<td> connection.SfConnectionEmitter</td>
			<td>The connection emitter configuration to use</td>
			<td>sfconn</td>
		</tr>
		<tr>
			<td>API</td>
			<td>(SOQL|Tooling)</td>
			<td>The API to run the query against</td>
			<td>SOQL</td>
		</tr>
		<tr>
			<td>Query</td>
			<td>*</td>
			<td>The query to run</td>
			<td>SELECT Id from Accounts (soql) <br /> -OR- <br /> SELECT Id,Name from ApexClass (tooling)</td>
		</tr>
		<tr>
			<td>Target</td>
			<td>String</td>
			<td>The path within the message to put the results</td>
			<td>payload.results</td>
		</tr>
		<!--
		<tr>
			<td>Limits</td>
			<td>Integer</td>
			<td>(FORWARD FACING) - the limit on the number of records to receive.</td>
			<td>payload.results</td>
		</tr>
		-->
	</tbody>
</table>




## [http.SfUniversalHttp](nodes/http/sf-universal-http)

Use this to perform an HTTP Get request to salesforce.

This is quite often used with the Universal Describe to get further information.

(Note: A common example is to use [node-red-contrib-literal-utils](https://github.com/paulroth3d/node-red-contrib-literal-utils) to pick the urls from a set of describes, and then use [node-red-contrib-serial-iterator](https://flows.nodered.org/node/node-red-contrib-serial-iterator) to then iterate through each of those values and get the results)

<b>NOTE: Currently, we are only supporting GET. If others factors are needed, please submit an issue and it can be discussed.</b>

## Example Flow

	[{"id":"d2048d63.a9936","type":"tab","label":"Flow 1","disabled":false,"info":""},{"id":"b684172.c49dfe8","type":"debug","z":"d2048d63.a9936","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"false","x":510,"y":200,"wires":[]},{"id":"67520728.547d28","type":"inject","z":"d2048d63.a9936","name":"{\"url\":\"/services/data/v42.0/sobjects/Account/describe\"}","topic":"","payload":"{\"url\":\"/services/data/v42.0/sobjects/Account/describe\"}","payloadType":"json","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":270,"y":120,"wires":[["75031448.d6721c"]]},{"id":"75031448.d6721c","type":"sf-universal-http","z":"d2048d63.a9936","name":"","sfconn":"73000fb4.ffb8e","url":"payload.url","urlType":"msg","target":"payload","x":280,"y":200,"wires":[["b684172.c49dfe8"]]},{"id":"73000fb4.ffb8e","type":"sf-connection-emitter","z":"","host":"SF_HOST","hostType":"env","username":"SF_USERNAME","usernameType":"env","password":"SF_PASSWORD","passwordType":"env","token":"","tokenType":"env"}]

![Screenshot of universal http](docs/images/UniversalHttp.png)

## Example Flow with Repeater

A great example of using the http callout is if you have a list of URLs -
such as templated from a previous describe...

	[{"id":"c9dd3425.d23d88","type":"tab","label":"Flow 2","disabled":false,"info":""},{"id":"f9b2421e.23d19","type":"inject","z":"c9dd3425.d23d88","name":"{\"urls\":[...]}","topic":"","payload":"{\"urls\":[\"/services/data/v42.0/sobjects/Account/describe/compactLayouts\",\"/services/data/v42.0/sobjects/Account/describe/approvalLayouts\",\"/services/data/v42.0/sobjects/Account/listviews\",\"/services/data/v42.0/sobjects/Account/describe\",\"https://speed-inspiration-3102-dev-ed.cs69.my.salesforce.com/001/e\",\"/services/data/v42.0/sobjects/Account/quickActions\",\"/services/data/v42.0/sobjects/Account/describe/layouts\",\"/services/data/v42.0/sobjects/Account\"]}","payloadType":"json","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":120,"y":140,"wires":[["f0240db8.37fa9"]]},{"id":"f0240db8.37fa9","type":"Serial Iterator","z":"c9dd3425.d23d88","name":"Serial Iterator","property":"payload.urls","inputFlow":"feedback","saveOutput":1,"recursive":0,"storeId":0,"x":320,"y":140,"wires":[["c545ae04.d3d54"],["36d218df.df27e8"]]},{"id":"c545ae04.d3d54","type":"sf-universal-http","z":"c9dd3425.d23d88","name":"","sfconn":"73000fb4.ffb8e","url":"payload","urlType":"msg","target":"payload","x":320,"y":220,"wires":[["f0240db8.37fa9"]]},{"id":"36d218df.df27e8","type":"debug","z":"c9dd3425.d23d88","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","x":550,"y":140,"wires":[]},{"id":"73000fb4.ffb8e","type":"sf-connection-emitter","z":"","host":"SF_HOST","hostType":"env","username":"SF_USERNAME","usernameType":"env","password":"SF_PASSWORD","passwordType":"env","token":"","tokenType":"env"}]
	
![Screenshot of http with serial](docs/images/UniversalHttpSerial.png)

## Example Flow with Describe and Repeater

(Note: A common example is to use [node-red-contrib-literal-utils](https://github.com/paulroth3d/node-red-contrib-literal-utils) to pick the urls from a set of describes, and then use [node-red-contrib-serial-iterator](https://flows.nodered.org/node/node-red-contrib-serial-iterator) to then iterate through each of those values and get the results)

	[{"id":"833f466c.8e4288","type":"tab","label":"Simple Flow","disabled":false,"info":""},{"id":"9694019f.d3cb7","type":"inject","z":"833f466c.8e4288","name":"Blank Payload","topic":"","payload":"{}","payloadType":"json","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":130,"y":80,"wires":[["abe1fcd2.d03e5"]]},{"id":"abe1fcd2.d03e5","type":"sf-universal-describe","z":"833f466c.8e4288","name":"","sfconn":"73000fb4.ffb8e","api":"soap","describeAll":true,"objectName":"","objectNameType":"msg","target":"describe","x":340,"y":80,"wires":[["740e1493.83e07c","3de2ebf4.276014"]]},{"id":"740e1493.83e07c","type":"debug","z":"833f466c.8e4288","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","x":550,"y":40,"wires":[]},{"id":"55cc2fc3.d9035","type":"debug","z":"833f466c.8e4288","name":"Complete","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","x":360,"y":420,"wires":[]},{"id":"c73609ff.5022c8","type":"Serial Iterator","z":"833f466c.8e4288","name":"","property":"describe.urls","inputFlow":"feedback","saveOutput":1,"recursive":0,"storeId":0,"x":130,"y":300,"wires":[["7bcef9d2.ed5e48"],["55cc2fc3.d9035"]]},{"id":"7bcef9d2.ed5e48","type":"sf-universal-http","z":"833f466c.8e4288","name":"","sfconn":"73000fb4.ffb8e","url":"payload","urlType":"msg","target":"payload","x":370,"y":300,"wires":[["c73609ff.5022c8"]]},{"id":"e5f2e6e5.3be2c8","type":"comment","z":"833f466c.8e4288","name":"Describe the list of objects...","info":"","x":160,"y":40,"wires":[]},{"id":"de2df7bd.d94808","type":"function","z":"833f466c.8e4288","name":"Only describe the first 3 urls","func":"msg.describe.urls = msg.describe.urls.slice(0,3);\nreturn msg;","outputs":1,"noerr":0,"x":380,"y":200,"wires":[["6db56361.e766dc","c73609ff.5022c8"]]},{"id":"3de2ebf4.276014","type":"pick-array-value","z":"833f466c.8e4288","name":"","arrayPath":"describe.sobjects","valuePath":"urls.sobject","targetPath":"describe.urls","x":150,"y":200,"wires":[["de2df7bd.d94808"]]},{"id":"6db56361.e766dc","type":"debug","z":"833f466c.8e4288","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","x":590,"y":160,"wires":[]},{"id":"5fcec93a.536a38","type":"comment","z":"833f466c.8e4288","name":"Pick the URLs from the array of objects...","info":"","x":200,"y":160,"wires":[]},{"id":"a758b017.2a287","type":"comment","z":"833f466c.8e4288","name":"Loop through the URLs one at a time...","info":"","x":210,"y":260,"wires":[]},{"id":"73000fb4.ffb8e","type":"sf-connection-emitter","z":"","host":"SF_HOST","hostType":"env","username":"SF_USERNAME","usernameType":"env","password":"SF_PASSWORD","passwordType":"env","token":"","tokenType":"env"}]

![Screenshot of describe and repeater](docs/images/UniversalQueryDescribe.png)

## Properties

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Type</th>
			<th>Description</th>
			<th>Example</th>
		</tr>
	</thead>
	<tbody>
	<tbody>
		<tr>
			<td>Name</td>
			<td>String</td>
			<td>Label to show in Node Red Editor</td>
			<td>Universal Describe</td>
		</tr>
		<tr>
			<td>Connection</td>
			<td> connection.SfConnectionEmitter</td>
			<td>The connection emitter configuration to use</td>
			<td>sfconn</td>
		</tr>
		<tr>
			<td>URL</td>
			<td>(Message property |<br /> Global Setting |<br /> Environment Variable |<br /> Literal Value)</td>
			<td>URL to request</td>
			<td>Payload (ex: serial) <br />
			-OR- <br />
			Payload.url <br />
			-OR- <br />
			/services/data/v42.0/sobjects/Account/describe <br />
			-OR- <br />
        https://speed-inspiration-3102-dev-ed.cs69.my.salesforce.com/001/e</td>
		</tr>
		<tr>
			<td>Target</td>
			<td>String</td>
			<td>The path within the message to put the results</td>
			<td>payload.results</td>
		</tr>
	</tbody>
</table>



## [platformEvents.SfPlatformEventPublisher](nodes/platformEvents/sf-platform-event-pub.js)

Use this to publish <a href='https://developer.salesforce.com/docs/atlas.en-us.platform_events.meta/platform_events/platform_events_intro.htm'>Salesforce Platform Events</a>

Simply apply the object you want to publish as the msg.payload and it will handle the rest.

More on Platform Events can also be [found on Trailhead.Salesforce.com](https://trailhead.salesforce.com/en/content/learn/modules/platform_events_basics)

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Type</th>
			<th>Description</th>
			<th>Example</th>
		</tr>
	</thead>
	<tbody>
	<tbody>
		<tr>
			<td>Name</td>
			<td>String</td>
			<td>Label to show in Node Red Editor</td>
			<td>PE Subscription</td>
		</tr>
		<tr>
			<td>Connection</td>
			<td> connection.SfConnectionEmitter</td>
			<td>The connection emitter configuration to use</td>
			<td>sfconn</td>
		</tr>
		<tr>
			<td>Event API Name</td>
			<td>string</td>
			<td>Platform Event Object API Name</td>
			<td>ltng_Hello__e</td>
		</tr>
	</tbody>
</table>

![Screenshot of Publisher](docs/images/publisher.jpg)

---


---


---

# Extending

While the request to use ES6 classes is currently underway within Node-Red modules, the following is the current structure for the nodes:

All nodes can be found by importing the module:

* connection
	* [SfConnectionEmitter](nodes/connection/sf-connection-emitter.js)
	* [SfConnectionReceiver](nodes/connection/sf-connection-receiver.js)
* query
	* [SfSoqlQuery](nodes/query/sf-soql-query.js)
* platformEvents
	* [SfPlatformEventPublisher](nodes/platformEvents/sf-platform-event-pub.js)
	* [SfPlatformEventSubscriber](nodes/platformEvents/sf-platform-event-sub.js)

Note that Node-Red gets access to the setupNodeRed function,
using require(...) directly gives access to the es6 class.

Also note, although NodeRed does not support TypeScript, care has been taken to support jsdoc / intellisense - to make extending these modules easier...

![Screenshot of intellisense](docs/images/intellisense.jpg)

## [connection.SfConnectionReceiver](nodes/connection/sf-connection-receiver.js)

Base Class for many of the other commands.

Note that this provides a couple convenience functions, such as setting the status and base methods for listening to newConnection and connectionLost events.

Simply override the handleNewConnection(JsForceConnection) and handleConnectionLost(JsForceConnection) methods - respectively...

### Properties

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Type</th>
			<th>Description</th>
			<th>Example</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>RED</td>
			<td><a href='https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/node-red/index.d.ts#L16'>@types/node-red#Red</a></td>
			<td>Node Red instance - captured during initialization</td>
			<td></td>
		</tr>
		<tr>
			<td>config</td>
			<td>object</td>
			<td>Configuration passed to the node from the node red editor</td>
			<td>{name:'query',query:'...'}</td>
		</tr>
		<tr>
			<td>nodeRedNode</td>
			<td><a href='https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/node-red/index.d.ts#L42'>@types/node-red#Node</td>
			<td>Node Red Node instance to be manipulated</td>
			<td></td>
		</tr>
		<tr>
			<td>connectionEmitter</td>
			<td>Node Red Config Id</td>
			<td>The connection emitter configuration to use</td>
			<td>sfconn</td>
		</tr>
		<tr>
			<td>STATUS_CONNECTED</td>
			<td>string</td>
			<td>Use this with the #status(string) command to set the status on the node</td>
			<td></td>
		</tr>
		<tr>
			<td>STATUS_DISCONNECTED</td>
			<td>string</td>
			<td>Use this with the #status(string) command to set the status on the node</td>
			<td></td>
		</tr>
	</tbody>
</table>

### initialize

Intitialize the node

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Type</th>
			<th>Description</th>
			<th>Example</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>RED</td>
			<td><a href='https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/node-red/index.d.ts#L16'>@types/node-red#Red</a></td>
			<td>Node Red instance - captured during initialization</td>
			<td></td>
		</tr>
		<tr>
			<td>config</td>
			<td>object</td>
			<td>Configuration passed to the node from the node red editor</td>
			<td>{name:'query',query:'...'}</td>
		</tr>
		<tr>
			<td>nodeRedNode</td>
			<td><a href='https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/node-red/index.d.ts#L42'>@types/node-red#Node</td>
			<td>Node Red Node instance to be manipulated</td>
			<td></td>
		</tr>
	</tbody>
</table>

Returns the instance, to support chaining...

### listenToConnection

Starts listening to a single salesforce connection emitter...

Just give it the name of the property on the connection that holds the value,
it will figure out the rest.

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Type</th>
			<th>Description</th>
			<th>Example</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>connectionPropName</td>
			<td>String</td>
			<td>The property of the connection to check the value for</td>
			<td>sfconn</td>
		</tr>
	</tbody>
</table>

Returns void

### setStatus

Sets the status on the node

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Type</th>
			<th>Description</th>
			<th>Example</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>status</td>
			<td>string</td>
			<td>STATUS_CONNECTED|STATUS_DISCONNECTED</td>
			<td></td>
		</tr>
	</tbody>
</table>

Sets the status on the node so it appears connected or disconnected...

![Screenshot of connected node](docs/images/connected.png)

### handleNewConnection

Overwrite this method to get notified when a connection is established.

(note that existing connections can be compared and so can also be disconnected,
or see handleConnectionLost method below)

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Type</th>
			<th>Description</th>
			<th>Example</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>connection</td>
			<td><a href='https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/jsforce/connection.d.ts'>JSForce.Connection</a></td>
			<td>The new connection established</td>
			<td></td>
		</tr>
	</tbody>
</table>

### handleConnectionLost

Overwrite this method to get notified when the connection is lost.

(This will always get called before handleNewConnection on a connectionEmitter#refresh event)

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Type</th>
			<th>Description</th>
			<th>Example</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>connection</td>
			<td><a href='https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/jsforce/connection.d.ts'>JSForce.Connection</a></td>
			<td>The new connection established</td>
			<td></td>
		</tr>
	</tbody>
</table>



---

## Subclassing

For example: to access the ConnectionReceiver (for subclassing), use the following:

	const connectionEmitter = require('node-red-contrib-salesforce-connection-emitter');
	const SfConnectionReceiver = connectionEmitter.connection.SfConnectionReceiver;
	//-- or directly through destructuring
	const {connection: {SfConnectionReceiver}} = require('node-red-contrib-salesforce-connection-emitter');
	
	class MyClass extends SfConnectionReceiver {...}
	
one further example - changing the name of the class:

	const {connection: {SfConnectionReceiver:ConnectionReceiver}} = require('node-red-contrib-salesforce-connection-emitter');
	
	class MyClass extends ConnectionReceiver {...}


## Running Tests
* To test the project run `npm run test` or `npm run test:watch` to continuously test.

## Running Linter
* To run linters on the project, run `npm run lint` or `npm run lint:watch` to continously lint.


# Further

* [Event Emitter](https://nodejs.org/api/events.html#events_class_eventemitter) - to support listening for connections
* [Resliliant streaming with updates available in jsforce - per Mars Hall](https://blog.heroku.com/reactive-programming-salesforce-data)
* [Alternative approach - node-red-contrib-salesforce-platform-event](https://flows.nodered.org/node/node-red-contrib-salesforce-platform-event)
* [Platform Event Considerations](https://developer.salesforce.com/docs/atlas.en-us.platform_events.meta/platform_events/platform_event_extras.htm)
* [JSForce](https://jsforce.github.io/)
* [Streaming API / Replay Extensions for JSForce](https://github.com/jsforce/jsforce/pull/740)