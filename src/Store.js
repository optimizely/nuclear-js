var through = require('through')
var Immutable = require('immutable')
var isArray = require('./utils').isArray;

class Store {
  constructor(initialState) {
    this.setState(initialState || {})
    this.__handlers = {}
    // initialize the stream interface
    this.stream = through(
     (action) => {
        this.__handle(action)
        this.emitState()
      }
    )
  }

  initialize() {
    // extending classes implement to setup action handlers
  }

  bindActions(...actions) {
    if (actions.length % 2 !== 0) {
      throw new Error("bindActions must take an even number of arguments.");
    }

    for (var i = 0; i < actions.length; i += 2) {
      var type = actions[i];
      var handler = actions[i+1];
      this.__handlers[type] = handler;
    }
  }

  /**
   * Gets the state at a keypath
   * @param {string|array} keyPath
   * @return {Immutable.Map}
   */
  getState(keyPath) {
    if (keyPath === undefined) {
      return this.state;
    }
    keyPath = (isArray(keyPath)) ? keyPath : [keyPath]
    // all keys are strings
    keyPath = keyPath.map(String)
    return this.state.getIn(keyPath)
  }

  /**
   * Sets a property on the state
   * @param {array|string|number} key
   * @param {any} val
   */
  setState(keyPath, val) {
    var args = Array.prototype.slice.call(arguments)
    if (args.length === 1) {
      this.state = Immutable.fromJS(args[0])
    } else {
      keyPath = (!isArray(keyPath)) ? [keyPath] : keyPath
      this.state = this.state.updateIn(keyPath, curr => {
        return Immutable.fromJS(val)
      })
    }
    //console.log('set state', keyPath, val, this.state.toJS())
  }

  emitState() {
    if (!this.stream) {
      throw new Error("Cannot emit state until the store is initialized")
    }
    this.stream.queue(this.getState())
  }

  __handle(action) {
    var handler = this.__handlers[action.type];
    if (handler && typeof handler === 'function') {
      handler.call(this, action.payload, action.type);
      // TODO: implelment flux logger
    }
  }
}

module.exports = Store
