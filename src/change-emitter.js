var EventEmitter = require('events').EventEmitter

var CHANGE_EVENT = 'change'

class ChangeEmitter extends EventEmitter {
  constructor() {
    super()
  }

  emitChange(state, messageType, payload) {
    this.emit(CHANGE_EVENT, state, messageType, payload)
  }

  /**
   * Adds a change listener to the emitter listener registry
   * Returns the unlisten function
   */
  addChangeListener(fn) {
    var emitter = this
    emitter.on(CHANGE_EVENT, fn)
    return function unwatch() {
      emitter.removeChangeListener(fn)
    }
  }

  /**
   * Removes a change listener by fn
   */
  removeChangeListener(fn) {
    emitter.removeListener(CHANGE_EVENT, fn)
  }
}

module.exports = ChangeEmitter
