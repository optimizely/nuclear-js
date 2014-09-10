var through = require('through')
var Immutable = require('immutable')

class Store {
  constructor() {
    this.state = null
    this.stream = through(
     (action) => {
        this.handle(action)
        this.emitState()
      }
    )
  }

  // extending classes implement
  initialize() {
  }

  // state getter/setter
  getState() {
    return this.state
  }

  setState(state) {
    this.state = state;
  }

  emitState() {
    if (!this.stream) {
      throw new Error("Cannot emit state until the store is initialized")
    }
    this.stream.queue(this.getState())
  }

  handle(action) {
    // Stores must implement
  }
}

module.exports = Store
