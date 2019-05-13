const {ErrorMatcherAdvanced, ErrorGuidance} = require('../../ErrorGuide');

const ENOTFOUND = 'ENOTFOUND';

/**
 * Matcher to check if the user could not login
 */
module.exports = function(loginKey){
  return new ErrorMatcherAdvanced(
    loginKey,
    (key, errorObj) => {
      if (key === loginKey && errorObj){
        //-- check the error object
        if (
          (typeof errorObj.errno != 'undefined' && errorObj.errno === ENOTFOUND) ||
          (typeof errorObj.code != 'undefined' && errorObj.code === ENOTFOUND)
        ){
          let host = '';
          if (typeof errorObj.host != 'undefined') host = errorObj.host;
          return new ErrorGuidance(
            'Could not connect to login host',
            `Host Address was not found[${host}]. Is the address correct? Is the user online?`
          );
        }
      }
      return null;
    }
  );
}