/*
 * @event newConnection - a new connection has been established / re-established
 * @event refresh - request to refresh the connection
 * @event connectionLost - the connection has been logged out.
 */

require('../Types');

const log = require('fancy-log');
const EventEmitter = require('events').EventEmitter;

const jsforce = require('jsforce');

//-- represents the user is currently in the login phase
const SOURCE_LOGIN = 'connectionEmitter.login';

/**
 * Register the error matchers for the connection emitter.
 * (Note that this adds values to the ErrorGuide singleton / side - effect)
 */
const {ErrorGuide} = require('../ErrorGuide');
ErrorGuide.addMatcher(
  require('./errorMatchers/connection-host-not-found')(SOURCE_LOGIN)
);

//-- used only for mocking if offline.
const testUtils = require('../../test/util/TestUtils');

const MAX_LISTENER_COUNT = 50;

/**
 * @description Component that represents a single connection to Salesforce.
 * This include the credentials - or the environment variables that store them,
 * along with the current connection to salesforce and an emitter to listen for connection changes.
 * @class 
 */
class ConnectionEmitter extends EventEmitter {

  /**
   * Request to refresh the connection (logout/re-establish)
   * @event SfConnectionEmitter#refresh
   * @type {object}
   */
  /**
   * Request to disconnect from the connection
   * @event SfConnectionEmitter#logout
   * @type {object}
   */
  /**
   * Signifies a new connection has been established
   * @event SfConnectionEmitter#newConnection
   * @type {object}
   * @property {import('jsforce').Connection} connection - the new connection
   */
  /**
   * Signifies the current connection has been lost.
   * @event SfConnectionEmitter#connectionLost
   * @type {object}
   * @property {import('jsforce').Connection} connection - the old connection
   */

  /**
   * Initializes the node instance.
   * @param {NodeRed} RED - The Node Red Server
   * @param {NodeRedConfig} config - Configuration
   * @param {NodeRedNode} NodeRedNode - Current Node Red Node
   */
  initialize(RED, config, nodeRedNode){
    /** @property {NodeRed} RED - the Node Red server */
    this.RED = RED;
    /** @property {NodeRedConfig} config - the configuration sent for initializing this node */
    this.config = config;
    /** @property {NodeRedNode} NodeRedNode - the node red node that is running in the flow */
    this.NodeRedNode = nodeRedNode;

    /** @property {import('jsforce').Connection} connection - the current JS Force connection */
    this.connection = null;

    // log(`host:${config.host}, hostType:${config.hostType}`);
    // log(`username:${config.username}, usernameType:${config.usernameType}`);
    // log(`password:${config.password}, passwordType:${config.passwordType}`);

    let host = RED.util.evaluateNodeProperty(config.host, config.hostType, nodeRedNode);
    let username = RED.util.evaluateNodeProperty(config.username, config.usernameType, nodeRedNode);
    let password = RED.util.evaluateNodeProperty(config.password, config.passwordType, nodeRedNode);
    let token = RED.util.evaluateNodeProperty(config.token, config.tokenType, nodeRedNode);

    this.host = host;
    this.username = username;
    this.password = password;
    if (token) {
      this.password += token;
    }

    //-- @TODO: determine better way to allow end users to assign maxListeners
    this.setMaxListeners(MAX_LISTENER_COUNT);

    // log(`host:${this.host}`);
    // log(`username:${this.username}`);
    // log(`password:${this.password}`);

    this.resetEmitter();

    // Nodes are closed when a new flow is deployed.
		nodeRedNode.on('close', (done) => {
      this.emit('logout', done);
		});

    return this;
  }

  /**
   * If the host, username, or password evaluate to environment variables,
   * then use those values instead.
   */
  expandConfigEnvironmentVariables(){
    //-- if environment variables are provided, translate to use those instead.
    if (this.host && process.env.hasOwnProperty(this.host)){
      this.host = process.env[this.host];
    }
    if (this.username && process.env.hasOwnProperty(this.username)){
      this.username = process.env[this.username];
    }
    if (this.password && process.env.hasOwnProperty(this.password)){
      this.password = process.env[this.password];
    }
  }

  /**
   * Initialize the emitter to be used when communicating the connections.
   * @return {void} -
   */
  resetEmitter(){
    
    //-- initialize the connection to null initially.
    this.connection = null;

    this.on('refresh', () => {

      if (this.connection){
        this.emit('connectionLost');
      }
      
      let host = this.host;
      if (!host){
        log.error('host was not found');
        return;
      }

      //-- verify https:// protocol
      if (host.indexOf('https://') !== 0){
        host = 'https://' + host;
      }

      //-- support functional testing while offline.
      if (process.env.NODE_ENV === 'offline'){
        //-- mock without needing to login
        log(`--sf-connection-emitter: offline mode detected---`)
        log(`refresh requested:${host}`);
        log(`username:${this.username}`);
        log(`password:${this.password}`);
        this.connection = testUtils.createJsForceConnectionMock();
        this.emit('newConnection', this.connection);
        return;
      } else {
        let conn = new jsforce.Connection({
          loginUrl: host
        });
        conn.login(this.username, this.password, (err, userInfo) => {
          if (err){
            log.error(`SfConnectionEmitter: Error occurred during login for host[${host}]:[${this.username}]`);
            log.error( ErrorGuide.getGuidanceStr(SOURCE_LOGIN, err,
              ErrorGuide.DEVELOPER,
              `Please check the following error message:\n${JSON.stringify(err)}`
            ));
            return;
          }
  
          this.connection = conn;
          log('connection successful for user:' + this.username);
          this.emit('newConnection', this.connection);
        });
      }
    });

    this.on('logout', (done) => {
      if (this.connection){
        this.connection.logout(() => {
          this.emit('connectionLost', this.connection);
          this.connection = null;
          return done();
				});
			}else{
				return done();
			}
    });

    this.emit('refresh');
  }
}

/**
 * Necessary function as node red uses the literal function for export
 * (with no support for AMD/ES6 modules)
 * @param {NodeRed} RED - the node red server
 */
function setupNodeRed(RED){
  RED.nodes.registerType('sf-connection-emitter', function(config){
    RED.nodes.createNode(this, config);
    this.info = new ConnectionEmitter().initialize(RED, config, this);
  }, {
    credentials: {
      host: { type:'text' },
      username: { type:'text' },
      password: { type:'password' },
      token: { type:'password' }
    }
  });
}


function addErrorMatchers(){

}

//-- because it seems we cannot export the class outright...
setupNodeRed.infoClass = ConnectionEmitter;

module.exports = setupNodeRed;
