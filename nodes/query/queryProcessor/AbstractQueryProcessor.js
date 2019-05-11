const log = require('fancy-log'); // eslint-disable-line no-unused-defs

require('../../Types');

/** @type {NODE_RED_NODE} */

/**
 * Base class for processing queries.
 * @class
 */
class AbstractQueryProcessor {

  /**
   * Validates the inputs to be sent to the query
   * @param {string} queryStr - the query to execute
   * @param {string} target - the path on the msg to set the value on ther msg
   * @param {object} config - the configuration of the node
   * @param {object} msg - the current message
   * @returns {string} - error message if one should be shown, or null if passed validation
   */
  validateInput(queryStr, target, config, msg){
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
   * @param {NODE_RED_NODE} nodeRedNode - the node red node to submit the response on.
   * @param {object} config - the configuration of the node
   * @param {object} msg - the current message
   * @returns {Promise} - a promise for the completion of the query.
   */
  execute(queryStr, target, connection, nodeRedNode, config, msg){
  }

  /**
   * Throw an error on the nodeRedNode
   * @param {NODE_RED_NODE} nodeRedNode - the node red node to provide the error on.
   * @param {string} errMsg - the error message to provide.
   */
  showError(nodeRedNode, errMsg){
    nodeRedNode.error(errMsg);
  }
}

module.exports = AbstractQueryProcessor;