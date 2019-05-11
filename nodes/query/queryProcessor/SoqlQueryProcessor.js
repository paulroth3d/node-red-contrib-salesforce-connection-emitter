const log = require('fancy-log'); // eslint-disable-line no-unused-defs

const AbstractQueryProcessor = require('./AbstractQueryProcessor');



/**
 * Class that processes SOQL queries from a salesforce connection.
 */
class SoqlQueryProcessor extends AbstractQueryProcessor {
  /**
   * Validates the inputs to be sent to the query
   * @param {string} queryStr - the query to execute
   * @param {string} target - the path on the msg to set the value on ther msg
   * @param {object} config - the configuration of the node
   * @param {object} msg - the current message
   * @returns {string} - error message if one should be shown, or null if passed validation
   */
  // validateInput(queryStr, target, config, msg){
  //   return super.validateInput(queryStr, target, config, msg);
  // }

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
    const resultPromise = new Promise((resolve, reject) => {
      const validateMsg = this.validateInput(queryStr, target, config, msg)
      if (validateMsg){
        this.showError(nodeRedNode, validateMsg);
        reject(new Error(validateMsg));
        return;
      }
      nodeRedNode.send(msg);
      resolve();
    });
    return resultPromise;
  }
}

module.exports = SoqlQueryProcessor;
