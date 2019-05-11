const log = require('fancy-log'); // eslint-disable-line no-unused-defs

require('../../Types');

/** @type {NODE_RED_NODE} */

/**
 * Base class for processing queries.
 * @class
 */
class AbstractDescribeProcessor {

  /** @constructor */
  constructor(RED, config, nodeRedNode){
    /** @property {RED} RED - the node red server */
    this.RED = RED;
    /** @property {RED_CONFIG} config - the configuration for the node */
    this.config = config;
    /** @property {NODE_RED_NODE} nodeRedNode - the node red node this works against */
    this.nodeRedNode = nodeRedNode;
    /** @property {string} type - the type of processor */
    this.type = 'abstract';
  }

  /**
   * Validates the inputs to be sent to the query
   * @param {boolean} describeAll - whether to describe everything
   * @param {string} describeObject - the object to describe
   * @param {string} target - the path on the msg to set the value on ther msg
   * @param {object} msg - the current message
   * @returns {string} - error message if one should be shown, or null if passed validation
   */
  validateInput(describeAll, describeObject, target, msg){
    if (describeAll && describeObject){
      return(`Cannot describe everything and describe an object[${describeObject}] at the same time`);
    } else if (!describeAll && !describeObject){
      return(`If not describing all, you must specify an object to describe`);
    } else if (!target){
      return('Target is undefined');
    }
    return null;
  }

  /**
   * Validates the inputs to be sent to the query
   * @param {boolean} describeAll - whether to describe everything
   * @param {string} describeObject - the object to describe
   * @param {string} target - the path on the msg to set the value on ther msg
   * @param {import('jsforce').Connection} connection - the jsforce connection to use
   * @param {object} msg - the current message
   * @returns {Promise} - a promise for the completion of the query.
   */
  execute(describeAll, describeObject, target, connection, msg){
    const resultPromise = new Promise((resolve, reject) => {
      this.showError('Abstract describe used. This method must be overridden');
      reject();
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

module.exports = AbstractDescribeProcessor;