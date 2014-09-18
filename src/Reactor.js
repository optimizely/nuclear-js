var stream = require('through')
var get = require('./immutable-helpers').get
var toJS = require('./immutable-helpers').toJS
var mutate = require('./immutable-helpers').mutate
var coerceKeyPath = require('./utils').keyPath
var each = require('./utils').each
var Immutable = require('immutable')

var ReactorCore = require('./ReactorCore')

/**
 * A Reactor is made up of 
 */
class Reactor {
  constructor() {
    /**
     * The state for the whole cluster
     */
    this.state = Immutable.Map({})
    /**
     * Holds a map of id => reactor instance
     */
    this.reactorCores = {}

    /**
     * Queues an action object to be handled
     * on the next cycle
     */
    this.actionQueue = []

    /**
     * Actions are written to this input stream and handled by the reactor
     * cluster
     */
    this.inputStream = stream(action => {
      this.actionQueue.push(action)
    })

    /**
     * Output stream that emits the state of the reactor cluster anytime
     * a cycle happens
     */
    this.outputStream = stream()
  }

  /**
   * Gets the state of the reactor by keyPath
   * @param {array|string} keyPath
   * @return {*}
   */
  get(keyPath) {
    return toJS(this.getImmutable(keyPath))
  }

  getImmutable(keyPath) {
    return get(this.state, coerceKeyPath(keyPath))
  }

  /**
   * Executes all the actions in the action queue and emits the new
   * state of the cluster on the output stream
   */
  react() {
    var state = this.state
    var actionQueue = this.actionQueue
    var cores = this.reactorCores

    this.state = mutate(state, state => {
      while (actionQueue.length > 0) {
        var action = actionQueue.shift()
        each(cores, (core, id) => {
          // dont let the reactor mutate by reference
          var reactorState = state.get(id).asImmutable()
          var newState = core.react(
            state.get(id),
            action.type,
            action.payload
          )
          state.set(id, newState)
        })
      }
    })

    // write the new state to the output stream
    this.outputStream.write(this.state)
  }

  /**
   * @param {string} id
   * @param {ReactorCore} Core
   */
  attachCore(id, core) {
    if (this.reactorCores[id]) {
      throw new Error("Only one reactor can be registered per id")
    }
    if (!(core instanceof ReactorCore)) {
      core = new Core()
    }
    var initialState = core.initialize() || Immutable.Map()
    this.state = this.state.set(id, initialState)
    this.reactorCores[id] = core
  }

  unattachCore(id) {
    delete this.reactorCores[id]
  }
}

module.exports = Reactor
