const log = require('fancy-log');
const EventEmitter = require('events').EventEmitter;

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

    setTimeout(() => {
      this.emitter.emit('newEvent', 'Krunal');
    }, 2000);

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