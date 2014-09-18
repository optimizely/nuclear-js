var Immutable = require('immutable')
var through = require('through')
var isArray = require('./utils').isArray
var each = require('./utils').each
var Reactor = require('./Reactor')
var getChanges = require('./get-changes')
var coerceKeyPath = require('./utils').keyPath

class ComputedReactor extends Reactor {
  constructor() {
    super()

    this.changeHandlers = []

    // outputStream emits anytime state is changed
    // iterate through the change handlers and execute
    // if any of the dependencies changed
    this.outputStream.pipe(through((currState) => {
      this.changeHandlers.forEach(entry => {
        // if any dependency changed getChanges returns
        // an array of values for each keyPath in the map
        var changes = getChanges(
          this.prevState,
          currState,
          entry.deps
        )
        if (changes) {
          entry.handler.apply(null, changes)
        }
      })
      this.prevState = currState
    }))
  }

  /**
   * Specify an array of keyPaths as dependencies and
   * a changeHandler fn
   * @param {string|array<string>} deps
   * @param {Function} changeHandler
   */
  onChange(deps, changeHandler) {
    if (!isArray(deps)) {
      deps = [deps]
    }
    this.changeHandlers.push({
      deps: deps.map(coerceKeyPath),
      handler: changeHandler
    })
  }

  react() {
    // cache the prev state so we can compare computeds after the react
    this.prevState = this.state
    super.react()
  }
}

module.exports = ComputedReactor
