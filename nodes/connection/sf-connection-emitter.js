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

class ConnectionEmitter {

  initialize(RED, config, nodeRedModule){
    this.RED = RED;
    this.config = config;
    this.nodeRedModule = nodeRedModule;

    this.connection = null;
    this.emitter = null;

    this.host = config.host;
    this.username = config.username;
    this.password = config.password;
    if (config.token) {
      this.password += config.token;
    }

    // log(`host:${this.host}`);
    // log(`username:${this.username}`);
    // log(`password:${this.password}`);

    this.expandConfigEnvironmentVariables();

    this.resetEmitter();

    // Nodes are closed when a new flow is deployed.
		nodeRedModule.on('close', function(done){
			if (this.connection){
				this.connection.logout(() => {
					return done();
				});
			}else{
				return done();
			}
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
   * @return {node.EventEmitter}
   */
  resetEmitter(){
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
  }
}

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

//-- because it seems we cannot export the class outright...
setupNodeRed.infoClass = ConnectionEmitter;

module.exports = setupNodeRed;
