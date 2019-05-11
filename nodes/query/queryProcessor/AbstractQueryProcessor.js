const log = require('fancy-log'); // eslint-disable-line no-unused-defs

require('../../Types');

/** @type {NODE_RED_NODE} */

/**
 * Base class for processing queries.
 * @class
 */
class AbstractQueryProcessor {

  /** @constructor */
  constructor(RED, config, nodeRedNode){
    /** @property {RED} RED - the node red server */
    this.RED = RED;
    /** @property {RED_CONFIG} config - the configuration for the node */
    this.config = config;
    /** @property {NODE_RED_NODE} nodeRedNode - the node red node this works against */
    this.nodeRedNode = nodeRedNode;
  }

  /**
   * Validates the inputs to be sent to the query
   * @param {string} queryStr - the query to execute
   * @param {string} target - the path on the msg to set the value on ther msg
   * @param {object} msg - the current message
   * @returns {string} - error message if one should be shown, or null if passed validation
   */
  validateInput(queryStr, target, msg){
    if (!queryStr){
      return('Query is undefined');
    } else if (!target){
      return('Target is undefined');
    }
    return null;
  }

  /**
   * Validates the inputs to be sent to the query
   * @param {string} queryStr - the query to execute
   * @param {string} target - the path on the msg to set the value on ther msg
   * @param {import('jsforce').Connection} connection - the jsforce connection to use
   * @param {object} msg - the current message
   * @returns {Promise} - a promise for the completion of the query.
   */
  execute(queryStr, target, connection, msg){
    const resultPromise = new Promise((resolve, reject) => {
      resolve();
    });
    return resultPromise;
  }

  /**
   * Applies the results to the msg (at the target path), and sending the msg on the node red node.
   * @param {any} results - the results to apply
   * @param {string} target - the path on the message to apply the results
   * @param {object} msg - the message to apply the results to
   */
  sendResults(results, target, msg){
    this.RED.util.setMessageProperty(msg, target, results);
    this.nodeRedNode.send(msg);
  }

  /**
   * Throw an error on the nodeRedNode
   * @param {NODE_RED_NODE} nodeRedNode - the node red node to provide the error on.
   * @param {string} errMsg - the error message to provide.
   */
  showError(errMsg){
    this.nodeRedNode.error(errMsg);
  }
}

module.exports = AbstractQueryProcessor;