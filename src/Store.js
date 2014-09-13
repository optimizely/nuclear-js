var through = require('through')
var Immutable = require('immutable')
var State = require('./State')
var isArray = require('./utils').isArray;

class Store extends State {
  constructor(initialState) {
    super(initialState)
    this.__handlers = {}
    // initialize the stream interface
    this.stream = through(
     (action) => {
        this.__handle(action)
      }
    )
  }

  initialize() {
    // extending classes implement to setup action handlers
  }

  /**
   * Binds an action type => handler
   */
  on(...actions) {
    if (actions.length % 2 !== 0) {
      throw new Error("on must take an even number of arguments.");
    }

    for (var i = 0; i < actions.length; i += 2) {
      var type = actions[i];
      var handler = actions[i+1];
      this.__handlers[type] = handler;
    }
  }

  __handle(action) {
    var handler = this.__handlers[action.type];
    if (!handler) return

    if (typeof handler === 'function') {
      console.log('%s: handling action %s', this.id, action)
      handler.call(this, action.payload, action.type);
      this.stream.queue({
        id: this.id,
        state: this.get()
      })
      // TODO: implelment flux logger
    }
  }
}

module.exports = Store
