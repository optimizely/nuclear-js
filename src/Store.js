var through = require('through')

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

  // state getter/setter
  getState() {
    return this.state
  }

  setState(state) {
    this.state = state;
  }

  emitState() {
    this.stream.queue(this.getState())
  }

  handle(action) {
    // Stores must implement
  }
}

module.exports = Store
