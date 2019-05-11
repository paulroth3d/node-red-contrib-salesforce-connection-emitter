const log = require('fancy-log'); // eslint-disable-line no-unused-vars

const AbstractDescribeProcessor = require('./AbstractDescribeProcessor');

require('../../Types');

/**
 * Class that processes Tooling describes from a salesforce connection.
 */
class SoapDescribeProcessor extends AbstractDescribeProcessor {
  constructor(RED, config, nodeRedNode){
    super(RED, config, nodeRedNode);
    this.type = 'soap';
  }
  
  // validateInput(describeAll, describeObject, target, config, msg){
  //   return super.validateInput(describeAll, describeObject, target, config, msg);
  // }

  /**
   * Validates the inputs to be sent to the query
   * @param {boolean} describeAll - whether to describe everything
   * @param {string} objectName - the object to describe
   * @param {string} target - the path on the msg to set the value on ther msg
   * @param {import('jsforce').Connection} connection - the jsforce connection to use
   * @param {object} msg - the current message
   * @returns {Promise} - a promise for the completion of the query.
   */
  execute(describeAll, objectName, target, connection, msg){
    const resultPromise = new Promise((resolve, reject) => {
      const validateMsg = this.validateInput(describeAll, objectName, target, msg);
      if (validateMsg){
        this.showError(validateMsg);
        reject(new Error(validateMsg));
        return;
      }

      // log('soap/metadata describe');
      if (describeAll){
        // log('soap/metadata describe global start');
        connection.describeGlobal((error, result) => {
          // log('soap/metadata describe global start callback');
          if (error){
            // log('soap/metadata describe global error');
            this.showError(error);
            reject(new Error('Error occurred:' + JSON.stringify(error)));
            return;
          }
          
          // log('soap/metadata describe global success');
          this.sendResults(result, target, msg);
          resolve(result);
        });
      } else {
        // log(`soap/metadata describe ${objectName} start`);
        connection.describe(objectName, (error, result) => {
          // log(`soap/metadata describe ${objectName} callback`);
          if (error){
            // log(`soap/metadata describe ${objectName} error`);
            this.showError(error);
            reject(new Error('Error occurred:' + JSON.stringify(error)));
            return;
          }
  
          // log(`soap/metadata describe ${objectName} success`);
          this.sendResults(result, target, msg);
          resolve(result);
        });
      }
    });
    return resultPromise;
  }
}

module.exports = SoapDescribeProcessor;