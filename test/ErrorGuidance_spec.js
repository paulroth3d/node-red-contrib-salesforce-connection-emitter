//-- classes to test
const {
  ErrorGuidance,
  ErrorGuide,
  ErrorMatcher,
  ErrorMatcherAdvanced
} = require('../nodes/ErrorGuide');

const {assert, expect} = require('chai');

const sinon = require('sinon');


const KEY_WITHOUT_MATCH = 'notFound';
const KEY_WITHOUT_MATCH_OBJ= {};

const LOGIN = 'login';
const ERROR_LOGIN_OBJ = {key:LOGIN};
const LOGIN_USER_ERROR = 'login user error';
const LOGIN_DEVELOPER_ERROR = 'login developer error';

const LOGOUT = 'logout';
const ERROR_LOGOUT_OBJ = {key:LOGOUT};
const LOGOUT_USER_ERROR = 'logout user error';
const LOGOUT_DEVELOPER_ERROR = 'logout developer error';

const DEFAULT_GUIDANCE = 'default guidance';

/** @type {ErrorGuide} */
//-- there is no guide, ErrorGuide is a singleton
/** @type {ErrorMatcher} */
let matcher;
/** @type {ErrorMatcherAdvanced} */
let advancedMatcher;
/** @type {ErrorMatcher[]} */
let matchers;
/** @type {ErrorGuidance} */
let guidance;
/** @type {ErrorGuidance[]} */
let guidances;
/** @type {string} */
let guidanceStr;

describe('ErrorGuide.ErrorGuidance', () => {
  beforeEach(done => {
    guidance = new ErrorGuidance(LOGIN_USER_ERROR, LOGIN_DEVELOPER_ERROR);
    done();
  });
  it('can capture the user friendly error', (done) => {
    assert.equal(guidance.userFriendlyError, LOGIN_USER_ERROR);
    done();
  });

  it('can capture the user friendly error', (done) => {
    assert.equal(guidance.developerError, LOGIN_DEVELOPER_ERROR);
    done();
  });
  

  it('can capture the key sent during the match', (done) => {
    guidance.applyMatchArgs(LOGIN, ERROR_LOGIN_OBJ);
    assert.equal(guidance.key, LOGIN);
    done();
  });

  it('can capture the error object sent during the match', (done) => {
    guidance.applyMatchArgs(LOGIN, ERROR_LOGIN_OBJ);
    assert.notEqual(guidance.errorObj, null);
    assert.equal(guidance.errorObj.key, ERROR_LOGIN_OBJ.key);
    done();
  });
});

describe('ErrorGuide.ErrorMatcher', (done) => {
  beforeEach(done => {
    guidance = null;
    matcher = new ErrorMatcher(LOGIN, LOGIN_USER_ERROR, LOGIN_DEVELOPER_ERROR);
    done();
  });
  it('matches based on the key during the match', (done) => {
    assert.equal(matcher.matchesKey(LOGIN), true);
    assert.equal(matcher.matchesKey(LOGOUT), false);
    done();
  });
  it('returns guidance if it matches during the error', done => {
    guidance = matcher.matches(LOGIN, ERROR_LOGIN_OBJ);
    expect(guidance).not.to.be.null;
    expect(guidance.userFriendlyError, LOGIN_USER_ERROR);
    expect(guidance.developerError, LOGIN_DEVELOPER_ERROR);
    done()
  });
  it('does not return guidance if the key is different when sent during the error', done => {
    guidance = matcher.matches(LOGIN, ERROR_LOGIN_OBJ);
    expect(guidance).not.to.be.null;
    expect(guidance.userFriendlyError, LOGIN_USER_ERROR);
    expect(guidance.developerError, LOGIN_DEVELOPER_ERROR);
    done()
  });
  it('includes guidance with the conditions of the error if matching', done => {
    guidance = matcher.matches(LOGIN, ERROR_LOGIN_OBJ);
    expect(guidance).not.to.be.null;
    expect(guidance.userFriendlyError, LOGIN_USER_ERROR);
    expect(guidance.userFriendlyError, LOGIN_DEVELOPER_ERROR);
    done()
  });
});

describe('ErrorGuidance.ErrorMatcherAdvanced', () => {
  beforeEach((done) => {
    guidance = null;
    advancedMatcher = new ErrorMatcherAdvanced(LOGIN, (key, errorObj) => {
      if (key === LOGIN){
        return new ErrorGuidance(LOGIN_USER_ERROR, LOGIN_DEVELOPER_ERROR);
      } else {
        return null;
      }
    });
    done();
  });
  it('returns guidance if it matches during the error', done => {
    guidance = matcher.matches(LOGIN, ERROR_LOGIN_OBJ);
    expect(guidance).not.to.be.null;
    expect(guidance.userFriendlyError, LOGIN_USER_ERROR);
    expect(guidance.developerError, LOGIN_DEVELOPER_ERROR);
    done();
  });
  it('does not return guidance if the key is different when sent during the error', done => {
    guidance = matcher.matches(LOGIN, ERROR_LOGIN_OBJ);
    expect(guidance).not.to.be.null;
    expect(guidance.userFriendlyError, LOGIN_USER_ERROR);
    expect(guidance.developerError, LOGIN_DEVELOPER_ERROR);
    done();
  });
  it('includes guidance with the conditions of the error if matching', done => {
    guidance = matcher.matches(LOGIN, ERROR_LOGIN_OBJ);
    expect(guidance).not.to.be.null;
    expect(guidance.userFriendlyError, LOGIN_USER_ERROR);
    expect(guidance.userFriendlyError, LOGIN_DEVELOPER_ERROR);
    done();
  });
});

describe('ErrorGuide.ErrorGuide', () => {
  beforeEach(done => {
    matchers = [
      new ErrorMatcher(LOGIN, LOGIN_USER_ERROR, LOGIN_DEVELOPER_ERROR),
      new ErrorMatcher(LOGOUT, LOGOUT_USER_ERROR, LOGOUT_DEVELOPER_ERROR)
    ];
    guidance = guidances = null;
    ErrorGuide.clear();
    done();
  });
  it('can match if there is a single matcher', done => {
    ErrorGuide.clear();
    ErrorGuide.addMatcher(matchers[0]);
    guidances = ErrorGuide.getGuidance(LOGIN, ERROR_LOGIN_OBJ);
    expect(guidances).not.to.be.null;
    expect(guidances.length).equals(1);

    guidances = ErrorGuide.getGuidance(KEY_WITHOUT_MATCH, KEY_WITHOUT_MATCH_OBJ);
    expect(guidances).not.to.be.null;
    expect(guidances.length).to.be.equal(0);
    done();
  });
  it('can match if there are multiple matchers', done => {
    ErrorGuide.clear();
    ErrorGuide.addMatchers([matchers[0], matchers[1]]);
    guidances = ErrorGuide.getGuidance(LOGIN, ERROR_LOGIN_OBJ);
    expect(guidances).not.to.be.null;
    expect(guidances.length).equals(1);

    guidances = ErrorGuide.getGuidance(KEY_WITHOUT_MATCH, KEY_WITHOUT_MATCH_OBJ);
    expect(guidances).not.to.be.null;
    expect(guidances.length).to.be.equal(0);
    done();
  });
  it('can provide developer guidance if something matches', done => {
    ErrorGuide.clear();
    ErrorGuide.addMatcher(matchers[0]);
    guidances = ErrorGuide.getGuidance(LOGIN, ERROR_LOGIN_OBJ);
    done();
  });

  //-- condensing the different tests
  it('can provide developer guidance strings', (done) => {
    ErrorGuide.clear();
    ErrorGuide.addMatchers([matchers[0]]);
    guidanceStr = ErrorGuide.getGuidanceStr(LOGIN, ERROR_LOGIN_OBJ,
      ErrorGuide.DEVELOPER, DEFAULT_GUIDANCE
    );
    expect(guidanceStr).to.be.equal('login developer error');
    done();
  });
  it('can provide developer guidance even if there are multiple matches', done => {
    ErrorGuide.clear();
    ErrorGuide.addMatchers([matchers[0], matchers[0]]);
    guidanceStr = ErrorGuide.getGuidanceStr(LOGIN, ERROR_LOGIN_OBJ,
      ErrorGuide.DEVELOPER, DEFAULT_GUIDANCE
    );
    expect(guidanceStr).to.be.equal('login developer error OR login developer error');
    done();
  });
  it('can provide developer matches even if there are matchers that do not match', done => {
    ErrorGuide.clear();
    ErrorGuide.addMatchers([matchers[0], matchers[0], matchers[1]]);
    guidanceStr = ErrorGuide.getGuidanceStr(LOGIN, ERROR_LOGIN_OBJ,
      ErrorGuide.DEVELOPER, DEFAULT_GUIDANCE
    );
    expect(guidanceStr).to.be.equal('login developer error OR login developer error');
    done();
  });
  it('can provide default developer guidance if nothing matches', done => {
    ErrorGuide.clear();
    guidanceStr = ErrorGuide.getGuidanceStr(LOGIN, ERROR_LOGIN_OBJ,
      ErrorGuide.DEVELOPER, DEFAULT_GUIDANCE
    );
    expect(guidanceStr).to.be.equal(DEFAULT_GUIDANCE);
    done();
  });




  it('can provide user guidance strings', (done) => {
    ErrorGuide.clear();
    ErrorGuide.addMatchers([matchers[0]]);
    guidanceStr = ErrorGuide.getGuidanceStr(LOGIN, ERROR_LOGIN_OBJ,
      null, DEFAULT_GUIDANCE
    );
    expect(guidanceStr).to.be.equal('login user error');
    done();
  });

  it('can provides the user guidance if unsure the type of guidance to provide', (done) => {
    ErrorGuide.clear();
    ErrorGuide.addMatchers([matchers[0]]);
    guidanceStr = ErrorGuide.getGuidanceStr(LOGIN, ERROR_LOGIN_OBJ,
      ErrorGuide.USER, DEFAULT_GUIDANCE
    );
    expect(guidanceStr).to.be.equal('login user error');
    done();
  });

  it('can provide user guidance even if there are multiple matches', done => {
    ErrorGuide.clear();
    ErrorGuide.addMatchers([matchers[0], matchers[0]]);
    guidanceStr = ErrorGuide.getGuidanceStr(LOGIN, ERROR_LOGIN_OBJ,
      null, DEFAULT_GUIDANCE
    );
    expect(guidanceStr).to.be.equal('login user error OR login user error');
    done();
  });
  it('can provide user matches even if there are matchers that do not match', done => {
    ErrorGuide.clear();
    ErrorGuide.addMatchers([matchers[0], matchers[0], matchers[1]]);
    guidanceStr = ErrorGuide.getGuidanceStr(LOGIN, ERROR_LOGIN_OBJ,
      null, DEFAULT_GUIDANCE
    );
    expect(guidanceStr).to.be.equal('login user error OR login user error');
    done();
  });
  it('can provide default user guidance if nothing matches', done => {
    ErrorGuide.clear();
    guidanceStr = ErrorGuide.getGuidanceStr(LOGIN, ERROR_LOGIN_OBJ,
      null, DEFAULT_GUIDANCE
    );
    expect(guidanceStr).to.be.equal(DEFAULT_GUIDANCE);
    done();
  });
});