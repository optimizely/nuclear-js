var through = require('through')
var utils = require('./utils')
var each = require('./utils').each
var coerceKeyPath = require('./utils').keyPath
var StoreWatcher = require('./StoreWatcher')
var createTransformStream = require('./create-transform-stream')
var Immutable = require('immutable')


class Flux {
  constructor() {
    this.state = Immutable.Map({})
    this.mutators = {}
    this.actionGroups = {}
    this.dispatchStream = through(action => {
      return this.dispatch(action.type, action.payload)
    })

    this.changeStream = through()

    this.watcher = new StoreWatcher(this.changeStream)
  }

  /**
   * @param {string} actionType
   * @param {object} payload
   */
  dispatch(actionType, payload) {
    this.state = this.state.withMutations(state => {
      each(this.mutators,
           (mut, id) => {
             var newState = mut.handle(
               state.get(id),
               actionType,
               payload
             )
             state.set(id, newState)
           })
    })

    console.log('after dispatch, new state: %s', this.state.toString())
    this.changeStream.write(this.state)
  }

  registerMutator(id, Mutator) {
    if (this.mutators[id]) {
      throw new Error("Only one mutator can be registered per id")
    }
    if (!this.state.get(id)) {
      this.state = this.state.set(id, Immutable.Map())
    }
    var mutator = new Mutator(this.state.get(id))
    mutator.initialize()
    this.mutators[id] = mutator
  }

  unregisterMutator(id) {
    delete this.mutators[id]
  }

  registerActionGroup(id, actionGroup) {
    this.actionGroups[id] = actionGroup
  }

  subscribe(...storePaths) {
    return this.watcher.subscribe(storePaths)
  }

  getActionGroup(id) {
    return this.actionGroups[id]
  }
}

module.exports = Flux
