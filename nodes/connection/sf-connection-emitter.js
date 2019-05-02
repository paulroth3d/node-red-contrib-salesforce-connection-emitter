// const log = require('fancy-log');

module.exports = function(RED) {
  'use strict';

  function ConnectionEmitter(n){
    RED.nodes.createNode(this, n);

    //const node = this;

    this.host = n.host;
    this.username = n.username;
    this.password = n.password;
    if (n.token) {
      this.password += n.token;
    }

    /*
    this.on('close', (removed, done) => {
      if (removed){
        //-- the node has been deleted
      } else {
        //-- the note is being restarted
      }
      done();
    });
    */

    /*
    this.host = this.credentials.host;
    this.username = this.credentials.username;
    this.password = this.credentials.password;
    if (this.credentials.token) {
      this.password += this.credentials.token;
    }
    */
  }

  RED.nodes.registerType('sf-connection-emitter', ConnectionEmitter, {
    credentials: {
      host: { value: 'test.salesforce.com', required:true },
      username: { value: '', required:true },
      password: { value: '', required:true },
      token: { value: '', required:false }
    }
  });
};