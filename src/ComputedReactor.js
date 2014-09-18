var Immutable = require('immutable')
var through = require('through')
var isArray = require('./utils').isArray
var each = require('./utils').each
var Reactor = require('./Reactor')
var getChanges = require('./get-changes')
var ComputedEntry = require('./ComputedEntry')

class ComputedReactor extends Reactor {
  constructor() {
    super()
    this.prevState = Immutable.Map({})
    this.prevState
    this.changeHandlers = []
    this.outputStream.pipe(through((state) => {
      each(this.changeHandlers, entry => {
        var changes = getChanges(this.prevState, state, entry.deps)
        if (changes) {
          entry.computeFn.apply(null, changes)
        }
      })
      this.prevState = state
    }))
  }

  /**
   * Specify an array of keyPaths as dependencies and a
   */
  onChange(deps, changeHandler) {
    if (!isArray(deps)) {
      deps = [deps]
    }
    // onchange doesnt put the computed value on a new keypath
    // just executes the computeFn
    this.changeHandlers.push(new ComputedEntry(null, deps, changeHandler))
  }

  react() {
    // cache the prev state so we can compare computeds after the react
    this.prevState = this.state
    super.react()
  }
}

module.exports = ComputedReactor
