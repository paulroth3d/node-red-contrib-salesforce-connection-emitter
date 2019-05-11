const log = require('fancy-log'); // eslint-disable-line no-unused-defs

const AbstractQueryProcessor = require('./AbstractQueryProcessor');

/**
 * Class that processes SOQL queries from a salesforce connection.
 */
class SoqlQueryProcessor extends AbstractQueryProcessor {
  constructor(RED, config, nodeRedNode){
    super(RED, config, nodeRedNode);
    this.type = 'soql';
  }
  
  /**
   * Validates the inputs to be sent to the query
   * @param {string} queryStr - the query to execute
   * @param {string} target - the path on the msg to set the value on ther msg
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
   * @param {object} msg - the current message
   * @returns {Promise} - a promise for the completion of the query.
   */
  execute(queryStr, target, connection, msg){
    const resultPromise = new Promise((resolve, reject) => {
      const validateMsg = this.validateInput(queryStr, target, msg)
      if (validateMsg){
        this.showError(validateMsg);
        reject(new Error(validateMsg));
        return;
      }

      let totalRecords = [];

      //-- callback used for both query / queryMore
      const queryCallback = (err, result) => {
        if (err) {
          this.nodeRedNode.error(err);
          return;
        }

        //-- combine to a set of all records retrieved...
        totalRecords = [...totalRecords, ...result.records];

        if (!result.done){
          connection.queryMore(result.nextRecordsUrl, queryCallback);
        } else {
          result.records = totalRecords;
          result.totalSize = totalRecords.length;

          this.sendResults(result, target, msg);
          resolve(result);
        }
      };
      
      connection.query(queryStr, queryCallback);
    });
    return resultPromise;
  }
}

module.exports = SoqlQueryProcessor;
