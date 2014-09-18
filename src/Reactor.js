var stream = require('through')
var get = require('./immutable-helpers').get
var toJS = require('./immutable-helpers').toJS
var mutate = require('./immutable-helpers').mutate
var coerceKeyPath = require('./utils').keyPath
var each = require('./utils').each
var Immutable = require('immutable')

var ReactorCore = require('./ReactorCore')

/**
 * In Nuclear Reactors are where state is stored.  Reactors
 * contain a "state" object which is an Immutable.Map
 *
 * The only way Reactors can change state is by reacting to
 * actions.  To update staet, Reactor's dispatch actions to
 * all registered cores, and the core returns it's new
 * state based on the action
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
     * Actions are written to this input stream and flushed
     * whenever the `react` method is called
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
   * Gets the coerced state (to JS object) of the reactor by keyPath
   * @param {array|string} keyPath
   * @return {*}
   */
  get(keyPath) {
    return toJS(this.getImmutable(keyPath))
  }

  /**
   * Gets the Immutable state at the keyPath
   * @param {array|string} keyPath
   * @return {*}
   */
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
   * Cores represent distinct "silos" in your Reactor state
   * When a core is attached the `initialize` method is called
   * and the core's initial state is returned.
   *
   * Anytime a Reactor.react happens all of the cores are passed
   * the action have the opportunity to return a "new state" to
   * the Reactor
   *
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
