//-- NOTE: CONSTANT_CASE for external classes mocked here, until TS can be found.
//-- @TODO: correct for the rest of them.

/**
 * Collection of Node Red Nodes
 * @typedef RED_NODES
 * @property {(nodeId:String) => NODE_RED_NODE} getNode - Finds a Node Red Node by Id
 */

/**
 * Node Red Server
 * @typedef RED
 * @property {RED_NODES} nodes - Collection of Nodes
 */

/**
 * Configuration for a Node Red Node
 * @typedef RED_CONFIG
 * @property {string} name - the name of the node
 */

/**
 * JS Force Connection
 * @typedef JsForceConnection
 */

/**
 * Node Event Emitter
 * @typedef EventEmitter
 * @property {string} name - the name of the cuca
 * @property {() => Array<string | number>} eventNames -
 * @property {(n: number) => this} setMaxListeners -
 * @property {() => number} getMaxListeners -
 * @property {(type: string | number, ...args: any[]) => boolean} emit -
 * @property {(type: string | number, listener: Listener) => this} addListener -
 * @property {(type: string | number, listener: Listener) => this} on -
 * @property {(type: string | number, listener: Listener) => this} once -
 * @property {(type: string | number, listener: Listener) => this} prependListener -
 * @property {(type: string | number, listener: Listener) => this} prependOnceListener -
 * @property {(type: string | number, listener: Listener) => this} removeListener -
 * @property {(type: string | number, listener: Listener) => this} off -
 * @property {(type?: string | number) => this} removeAllListeners -
 * @property {(type: string | number) => Listener[]} listeners -
 * @property {(type: string | number) => number} listenerCount -
 * @property {(type: string | number) => Listener[]} rawListeners -
 */

/**
 * Custom Emitter
 * @typedef _CustomEmitterType
 * @property {() => string} doSomething - does something
 * 
 * @typedef {EventEmitter & _CustomEmitterType} CustomEmitter
 */

/**
 * A status object accepted by a NodeRedNode
 * @typedef NODE_RED_STATUS
 * @property {string} fill - The color to use (red|green|...)
 * @property {string} shape - (dot|ring|circle|square|...)
 * @property {string} text - The label shown next to the status
 */

/**
 * A Node Red Node
 * @typedef _NODE_RED_NODE_TYPE
 * @property {(NODE_RED_STATUS) => void} status - Sets the status on the node
 * @property {(object) => boolean} send - Sends a message to the next node via wires.
 * 
 * @typedef {EventEmitter & _NODE_RED_NODE_TYPE} NODE_RED_NODE
 */

/**
 * One of our es6 classes that work with node red
 * @typedef NodeRedNodeClass
 * @property {string} cuca - cuca
 */

/**
 * Our custom node red nodes with es6 classes
 * @typedef _NodeRedClassNodeType
 * @property {object} info - The es6 class instance backing the node
 * @property {class} infoClass - The es6 class that has the logic for the node.
 * 
 * @typedef {_NodeRedClassNodeType & NODE_RED_NODE} NodeRedClassNode
 **/

//-- @TODO: use @types/events
//-- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/events/index.d.ts
