/**
 * Component that represents a single connection to Salesforce.
 * <p>
 * This include the credentials - or the environment variables that store them,
 * along with the current connection to salesforce and an emitter to listen for connection changes.
 * </p>
 * @event newConnection - a new connection has been established / re-established
 * @event refresh - request to refresh the connection
 * @event logout - the connection has been logged out.
 */

const log = require('fancy-log');
const EventEmitter = require('events').EventEmitter;

const jsforce = require('jsforce');

debugger;
class ConnectionEmitter {

  constructor(RED, config, nodeRedModule){
    this.RED = RED;
    this.config = config;
    this.nodeRedModule = nodeRedModule;

    debugger;

    this.host = config.host;
    this.username = config.username;
    this.password = config.password;
    if (config.token) {
      this.password += config.token;
    }
    log(`host:${this.host}`);
    log(`username:${this.username}`);
    log(`password:${this.password}`);
  }
}

function setupNodeRed(RED){
  RED.nodes.registerType('sf-connection-emitter', function(config){
    this.c = new ConnectionEmitter(RED, config, this);
  }, {
    credentials: {
      host: { type:'text' },
      username: { type:'text' },
      password: { type:'password' },
      token: { type:'password' }
    }
  });
}
module.exports = setupNodeRed;


/*
module.exports = function(RED) {
  'use strict';

  function ConnectionEmitter(n){
    RED.nodes.createNode(this, n);

    // const node = this;

    this.host = this.credentials.host;
    this.username = this.credentials.username;
    this.password = this.credentials.password;
    if (this.credentials.token) {
      this.password += this.credentials.token;
    }
    log(`host:${host}`);
    log(`username:${username}`);
    log(`password:${password}`);
  }

  RED.nodes.registerType('sf-connection-emitter', ConnectionEmitter, {
    credentials: {
      host: { type:'text' },
      username: { type:'text' },
      password: { type:'password' },
      token: { type:'password' }
    }
  });
};
*/

/*
module.exports = function(RED) {
  'use strict';

  function ConnectionEmitter(n){
    RED.nodes.createNode(this, n);

    // const node = this;

    this.host = this.credentials.host;
    this.username = this.credentials.username;
    this.password = this.credentials.password;
    if (this.credentials.token) {
      this.password += this.credentials.token;
    }

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

    this.emitter = new EventEmitter();
    
    //-- initialize the connection to null initially.
    this.connection = null;

    this.emitter.on('refresh', () => {
      
      let host = this.host;
      if (!host){
        log.error('host was not found');
        return;
      }

      //-- verify https:// protocol
      if (host.indexOf('https://') !== 0){
        host = 'https://' + host;
      }

      // log(`refresh requested:${host}`);
      // log(`username:${this.username}`);
      // log(`password:${this.password}`);

      let conn = new jsforce.Connection({
        loginUrl: host
      });
      conn.login(this.username, this.password, (err, userInfo) => {
        if (err){
          log.error('error occurred during login:', err);
          return;
        }

        this.connection = conn;
        log('connection successful for user:' + this.username);
        this.emitter.emit('newConnection', this.connection);
      });
    });

    this.emitter.emit('refresh');

    //-- verify the info is accurate
    // log('host:', this.host);
    // log('username:', this.username);
    // log('password:', this.password);

    this.on('close', (removed, done) => {
      if (removed){
        //-- the node has been deleted
      } else {
        //-- the note is being restarted
      }
      log('close event called');
      done();
    });
  }

  RED.nodes.registerType('sf-connection-emitter', ConnectionEmitter, {
    credentials: {
      host: { type:'text' },
      username: { type:'text' },
      password: { type:'password' },
      token: { type:'password' }
    }
  });
};
*/