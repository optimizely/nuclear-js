var through = require('through')
var toJS = require('./immutable-helpers').toJS
var toImmutable = require('./immutable-helpers').toImmutable
var coerceKeyPath = require('./utils').keyPath
var coerceArray = require('./utils').coerceArray
var each = require('./utils').each
var Immutable = require('immutable')
var logging = require('./logging')
var ChangeObserver = require('./change-observer')

var ReactorCore = require('./reactor-core')

/**
 * In Nuclear Reactors are where state is stored.  Reactors
 * contain a "state" object which is an Immutable.Map
 *
 * The only way Reactors can change state is by reacting to
 * messages.  To update staet, Reactor's dispatch messages to
 * all registered cores, and the core returns it's new
 * state based on the message
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
     * Output stream that emits the state of the reactor cluster anytime
     * a cycle happens
     */
    this.outputStream = through()
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
    return this.state.getIn(coerceKeyPath(keyPath))
  }

  /**
   * Executes all the messages in the message queue and emits the new
   * state of the cluster on the output stream
   * @param {array} messages
   */
  cycle(messages) {
    messages = coerceArray(messages)
    var state = this.state
    var cores = this.reactorCores

    this.state = state.withMutations(state => {
      while (messages.length > 0) {
        var message = messages.shift()

        logging.cycleStart(message)

        // let each core handle the message
        each(cores, (core, id) => {
          // dont let the reactor mutate by reference
          var reactorState = state.get(id).asImmutable()
          var newState = core.react(
            reactorState,
            message.type,
            message.payload
          )
          state.set(id, newState)

          logging.coreReact(id, reactorState, newState)
        })

        logging.cycleEnd(state)
      }
      return state
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
   * the message have the opportunity to return a "new state" to
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
      core = new core()
    }
    var initialState = toImmutable(core.initialize() || {})
    // execute the computeds after initialization since no react() takes place
    initialState = core.executeComputeds(Immutable.Map(), initialState)
    this.state = this.state.set(id, initialState)
    this.reactorCores[id] = core
  }

  unattachCore(id) {
    delete this.reactorCores[id]
  }

  /**
   * Creates an instance of the ChangeObserver for this reactor
   *
   * Allows the creation of changeHandlers for a keyPath on this reactor,
   * while providing a single method call to destroy and cleanup
   *
   * @return {ChangeOBserver}
   */
  createChangeObserver() {
    return new ChangeObserver(this)
  }
}

module.exports = Reactor
