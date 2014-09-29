var through = require('through')
var isArray = require('./utils').isArray
var getChanges = require('./get-changes')
var coerceKeyPath = require('./utils').keyPath
var toJS = require('./immutable-helpers').toJS

class ChangeObserver {
  constructor(initialState, changeStream) {
    this.__changeHandlers = []
    // cache the current state
    this.__prevState = initialState

    this.changeStream = changeStream

    // outputStream emits anytime state is changed
    // iterate through the change handlers and execute
    // if any of the dependencies changed
    this.__changeHandlerStream = through((currState) => {
      this.__changeHandlers.forEach(entry => {
        // if any dependency changed getChanges returns
        // an array of values for each keyPath in the map
        var changes = getChanges(
          this.__prevState,
          currState,
          entry.deps
        )
        if (changes) {
          entry.handler.apply(null, changes.map(toJS))
        }
      })
      this.__prevState = currState
    })

    changeStream.pipe(this.__changeHandlerStream)
  }

  /**
   * Specify an array of keyPaths as dependencies and
   * a changeHandler fn
   * @param {array<string|array>} deps
   * @param {Function} changeHandler
   */
  onChange(deps, changeHandler) {
    if (!isArray(deps)) {
      throw new Error("onChange must be called with an array of deps")
    }
    this.__changeHandlers.push({
      deps: deps.map(coerceKeyPath),
      handler: changeHandler
    })
  }

  /**
   * Clean up
   */
  destroy() {
    this.changeStream.unpipe(this.__changeHandlerStream)
  }
}

module.exports = ChangeObserver
