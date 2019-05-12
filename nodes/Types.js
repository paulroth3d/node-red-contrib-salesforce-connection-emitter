//-- NOTE: CONSTANT_CASE for external classes mocked here, until TS can be found.
//-- @TODO: correct for the rest of them.

/**
 * Node Red Server
 * @typedef {import('node-red').Red} NodeRed
 */

/**
 * Node Red Node
 * @typedef {import('node-red').Node} NodeRedNode
 */

/**
 * Configuration for a Node Red Node
 * @typedef NodeRedConfig
 * @property {string} name - the name of the node
 */

/**
 * One of our es6 classes that work with node red
 * @typedef NodeRedNodeClass
 */

/**
 * Message sent from node red
 * @typedef NodeRedMessage
 */

/**
 * Our custom node red nodes with es6 classes
 * @typedef _NodeRedClassNodeType
 * @property {object} info - The es6 class instance backing the node
 * @property {class} infoClass - The es6 class that has the logic for the node.
 * 
 * @typedef {_NodeRedClassNodeType & NodeRedNode} NodeRedClassNode
 **/

/**
 * Node Event Emitter
 * @typedef {import('events').EventEmitter} EventEmitter
 */

//-- specific

/**
 * JS Force
 * @typedef {import('jsforce')} JSForce
 */

/**
 * JS Force Connection
 * @typedef {import('jsforce').Connection} JSForceConnection
 */

//-- because of a limitation
//-- that we cannot use AMD Modules
//-- and the choice of keeping the class in the same file
//-- visual studio code cannot allow us to use the existing es6 class for types
//-- so we mock them up here.

//-- @TODO - either move the classes to another file
//-- or figure out how to make visual studio code make use of them from the module

/**
 * Represents a Node Red Connection Emitter
 * @typedef ConnectionEmitterType
 * @property {JSForceConnection} connection - the connection to use
 * 
 * @typedef {EventEmitter & ConnectionEmitterType} ConnectionEmitter
 */

/**
 * Represents a Node Red Connection Emitter Node
 * @typedef ConnectionEmitterNodeType
 * @property {ConnectionEmitter} info - The connection emitter for this node red node
 * @property {class} infoClass - the es6 class for the connection emitter.
 * 
 * @typedef {NodeRedNode & ConnectionEmitterNodeType} ConnectionEmitterNode
 */

/**
 * Represents a Connection Receiver
 * @typedef ConnectionReceiverType
 * @property {NodeRed} RED - the node red server
 * @property {NodeRedConfig} config - the config sent for the node
 * @property {NodeRedNode} nodeRedNode - the current node red node this operates on.
 * @property {ConnectionEmitter} connectionEmitter -
 * @property {import('jsforce').Connection} connection - current connection
 * 
 * @typedef {EventEmitter & ConnectionReceiverType} ConnectionReceiver
 **/

//-- @TODO: use @types/events
//-- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/events/index.d.ts
