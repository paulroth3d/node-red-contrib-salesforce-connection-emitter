const log = require('fancy-log'); // eslint-disable-line no-unused-vars

/**
 * Node Red Module that creates an array of the keys to loop over
 */
class GenerateLoopKeys {

  /** Constructor */
  constructor() {
    // super();

    //-- initialize component properties
  }
  
  /**
   * Initialize the node red node
   * @param {object} RED - Node Red framework
   * @param {object} config - configuration for module from the node red editor
   * @param {object} nodeRedNode - the node red instance
   */
  initialize(RED, config, nodeRedNode) {
    // super.initialize(RED, config, nodeRedNode);

    //-- capture Node Red info
    this.RED = RED;
    this.config = config;
    this.nodeRedNode = nodeRedNode;

    //-- capture information from the nodeRedNode
    this.name = nodeRedNode.name;

    //-- handle events on the nodeRedNode
    nodeRedNode.on('input', (msg) => {
      // msg.payload = node.query;

      let arrayToIterate;
      let arrayValue;
      const results = [];

      //-- ensure the array to iterate is found.
      try {
        arrayToIterate = this.RED.util.getObjectProperty(msg, this.config.arrayPath);
      } catch(err){
        this.nodeRedNode.error({
          error: `unable to generate keys: array could not be found at:${this.config.arrayPath}`,
          msg: msg
        });
        return;
      }

      if (!arrayToIterate){
        this.nodeRedNode.error({
          error: `unable to generate keys: array could not be found at:${this.config.arrayPath}`,
          msg: msg
        });
        return;
      }

      log(`arrayToIterate:${JSON.stringify(arrayToIterate)}`);
      log(`msg:${JSON.stringify(msg)}`);
      log(`config.arrayPath:${JSON.stringify(config.arrayPath)}`);

      //-- ensure it is an array
      if (typeof arrayToIterate.forEach !== 'function'){
        this.nodeRedNode.error({
          error: `unable to generate keys: not an array at path:${this.config.arrayPath}`,
          array: arrayToIterate,
          msg: msg
        });
        return;
      }

      arrayToIterate.forEach((val, index) => {
        //-- determine the value
        if (!config.valuePath){
          arrayValue = val;
        } else {
          arrayValue = this.RED.util.getObjectProperty(val, config.valuePath);
        }
        //-- validate the value
        if (!arrayValue){
          this.nodeRedNode.error({
            error: `unable to generate keys: unable to find value at path:${config.valuePath}`,
            array: arrayToIterate,
            currentObject: val,
            valuePath: config.valuePath,
            msg: msg
          });
        } else {
          results.push(arrayValue);
        }
      });

      //-- assign the results
      this.RED.util.setMessageProperty(msg, this.config.targetPath, results);

      nodeRedNode.send(msg);
    });

    return this;
  }

  /**
   * Determine the key from a message
   * @param {object} obj - the message
   * @param {string} keyPath - the path to the unique identifier on the object (null if we should use the object)
   * @return {any}
   */
  determineObjectKey(obj, keyPath){
    if (keyPath){
      return this.RED.util.getObjectProperty(obj, keyPath);
    } else {
      return obj;
    }
  }
}

/**
 * Initialize node-red node module
 * @param {NodeRed} RED - Node Red framework instance
 */
function setupNodeRed(RED){
  RED.nodes.registerType('generate-loop-keys', function(config){
    RED.nodes.createNode(this, config);

    //-- capture information from the config
    this.name = config.name;

    this.info = new GenerateLoopKeys()
      .initialize(RED, config, this);
  });
}

//-- because it seems we cannot export the class outright...
setupNodeRed.infoClass = GenerateLoopKeys;

module.exports = setupNodeRed;