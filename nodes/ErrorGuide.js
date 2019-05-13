const log = require('fancy-log');  // eslint-disable-line no-unused-vars

/**
 * Singleton to provide gudiance to developers and end users
 * for errors in network and other libraries.
 * 
 * We want to keep our libraries extensible and usable,
 * even though other libraries we use (like JSForce)
 * or network APIs (like a salesforce platform API)
 * can change.
 * 
 * Use this library to add matchers so if an error occurrs,
 * and possibly the error condition matches,
 * we can at least give guidance to the end user.
 * 
 * If there are errors from this library,
 * this module is not needed and should be handled separately.
 * This is intended ONLY for handling errors from external systems.
 * 
 * @class
 */
class ErrorGuide {

  /** @constructor */
  constructor(){
    /**
     * collection of matchers
     * @type {ErrorMatcher[]}
     */
    this.matchers = [];

    /** Specifies Developer */
    this.DEVELOPER = 'developer';
    /** Specifies User */
    this.USER = 'user';

    this.clear();
  }

  /**
   * Adds a matcher to the list
   * @param {ErrorMatcher} matcher - matcher to add
   */
  addMatcher(matcher){
    this.matchers.push(matcher);
  }

  /**
   * Adds a collection of matchers
   * @param {ErrorMatcher[]} matchers - matchers to add
   */
  addMatchers(matchers){
    if (matchers){
      this.matchers = [...this.matchers, ...matchers];
    }
  }

  /**
   * Clears all the matchers
   */
  clear(){
    this.matchers = [];
  }

  /**
   * Determines any guidance available - base on a key or error object -
   * from any of the matchers available.
   * 
   * This guidance includes user clean and developer clean messages
   * @param {string} key - string sent from where the error was captured
   * @param {*} errorObj - the error that was captured
   * @returns {ErrorGuidance[]} - Whether the key or error matches this (true) or not (false)
   */
  getGuidance(key, errorObj){
    let results = [];
    this.matchers.forEach(matcher => {
      let matchResult = matcher.matches(key, errorObj);
      if (matchResult){
        matchResult.applyMatchArgs(key, errorObj);
        results.push(matchResult);
      }
    });
    return results;
  }

  /**
   * Determines any user appropriate guidance - based on a key or error object.
   * @see getGuidance(string,*)
   * @param {string} key - string sent from where the error was captured
   * @param {*} errorObj - the error that was captured
   * @param {string} guidanceType - the type of guidance to provide (DEVELOPER|USER)
   * @param {string} defaultGuidance - What guidance to provide if no matchers matched.
   * @returns {string} - A string with all the user appropriate guidance
   */
  getGuidanceStr(key, errorObj, guidanceType, defaultGuidance){
    let results = '';

    //-- default guidance type
    if (guidanceType !== this.DEVELOPER &&
      guidanceType !== this.USER
    ){
      guidanceType = this.USER;
    }

    const guidance = this.getGuidance(key, errorObj);
    if (guidance && guidance.length > 0){
      results = guidance.reduce((previousValue, currentValue, currentIndex) => {
        let msg = '';
        if (guidanceType === this.DEVELOPER){
          msg = currentValue.developerError;
        } else if (guidanceType === this.USER){
          msg = currentValue.userFriendlyError;
        }

        if (!previousValue){
          return msg;
        } else {
          return previousValue + ' OR ' + msg;
        }
      }, '');
    }
    if (!results){
      results = defaultGuidance;
    }
    return results;
  }
}

/**
 * Represents guidance to provide to the end user
 * @class
 */
class ErrorGuidance {
  
  /**
   * @constructor
   * @param {string} userFriendlyError - Friendly error for end users
   * @param {string} developerError - Error to provide to the developer
   */
  constructor(userFriendlyError, developerError){
    /** Friendly error for end users */
    this.userFriendlyError = userFriendlyError;
    /** Error to provide to the developer */
    this.developerError = developerError;

    /**
     * Key provided on the match
     * @type {string}
     */
    this.key = null;

    /**
     * Error object provided to the match
     * @type {*}
     **/
    this.errorObj = null;
  }

  /**
   * Apply the conditions that were sent on the match
   * 
   * Called for you by the ErrorGuide
   * @param {string} key -
   * @param {*} errorObj - 
   */
  applyMatchArgs(key, errorObj){
    this.key = key;
    this.errorObj = errorObj;
  }
}

/**
 * Something that can provide developer and end-user guidance
 * based on some pre-defined key or error (object or string)
 * @class
 */
class ErrorMatcher {
  /**
   * @param {string} key? - Some pre-defined error key
   * @param {string} userFriendlyError - Message to give to the user if the error matches.
   * @param {string} developerError - Message to give to the developer if this error occurs.
   */
  constructor(key, userFriendlyError, developerError){
    this.key = key;
    this.userFriendlyError = userFriendlyError;
    this.developerError = developerError;
  }

  /**
   * Determines whether the key matches for this error obj
   * @param {string} key - string sent from where the error was captured
   * @returns {boolean} - whether the key matches
   */
  matchesKey(key){
    return this.key === key;
  }

  /**
   * Attempts to match based on a key or error object -
   * and provide a string if it does.
   * @param {string} key - string sent from where the error was captured
   * @param {*} errorObj - the error that was captured
   * @returns {ErrorGuidance} - Whether the key or error matches this (true) or not (false)
   */
  matches(key, errorObj){ // eslint-disable-line no-unused-vars
    let result = null;
    if(this.matchesKey(key)){
      result = new ErrorGuidance(this.userFriendlyError, this.developerError);
    }
    return result;
  }
}

/**
 * An advanced version of the matcher
 * where we match the string and/or an error object
 * and provide ErrorGuidance.
 * @class
 */
class ErrorMatcherAdvanced extends ErrorMatcher {
  /**
   * @param {string} key? - Some pre-defined error key
   * @param {(key:string, errorObj:*) => ErrorGuidance} matcherFn - matching function
   * @constructor
   **/
  constructor(key, matcherFn){
    super(key, null, null);
    /** Matching function */
    this.matcherFn = matcherFn;
    if (!this.matcherFn){
      this.matcherFn = () => null;
    }
  }

  /**
   * Attempts to match based on a key or error object -
   * and provide a string if it does.
   * @param {string} key - string sent from where the error was captured
   * @param {*} errorObj - the error that was captured
   * @returns {ErrorGuidance} - Whether the key or error matches this (true) or not (false)
   */
  matches(key, errorObj){ // eslint-disable-line no-unused-vars
    let result = null;
    if (this.matcherFn){
      result = this.matcherFn(key, errorObj);
    }
    return result;
  }
}

module.exports = {
  ErrorGuide: new ErrorGuide(),
  ErrorGuidance: ErrorGuidance,
  ErrorMatcher: ErrorMatcher,
  ErrorMatcherAdvanced: ErrorMatcherAdvanced
};