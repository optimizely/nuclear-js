var Immutable = require('immutable')
var through = require('through')
var isArray = require('./utils').isArray
var each = require('./utils').each
var Reactor = require('./Reactor')
var calculateComputed = require('./computed').calculate
var ComputedEntry = require('./computed').ComputedEntry

class ComputedReactor extends Reactor {
  constructor() {
    super()
    this.prevState = Immutable.Map({})
    this.prevState
    this.changeHandlers = []
    this.outputStream.pipe(through((state) => {
      each(this.changeHandlers, entry => {
        calculateComputed(this.prevState, state, entry)
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
