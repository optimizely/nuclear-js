var through = require('through')
var toJS = require('./immutable-helpers').toJS
var toImmutable = require('./immutable-helpers').toImmutable
var isImmutable = require('./immutable-helpers').isImmutable
var coerceKeyPath = require('./utils').keyPath
var coerceArray = require('./utils').coerceArray
var each = require('./utils').each
var partial = require('./utils').partial
var Immutable = require('immutable')
var logging = require('./logging')
var ChangeObserver = require('./change-observer')
var calculateComputed = require('./calculate-computed')
var ComputedEntry = require('./computed-entry')

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
     * Output stream that emits the state of the reactor cluster anytime
     * a cycle happens
     */
    this.outputStream = through()
    /**
     * Holds a map of id => reactor instance
     */
    this.__reactorCores = {}
    /**
     * Holds a map of stringified keyPaths => ComputedEntry
     */
    this.__computeds = {}
    /**
     * Holds a map of action group names => action functions
     */
    this.__actions = {}

    this.initialized = false
  }

  /**
   * Gets the Immutable state at the keyPath
   * @param {array|string} keyPath
   * @return {*}
   */
  get(keyPath) {
    return this.state.getIn(coerceKeyPath(keyPath))
  }

  /**
   * Gets the coerced state (to JS object) of the reactor by keyPath
   * @param {array|string} keyPath
   * @return {*}
   */
  getJS(keyPath) {
    return toJS(this.get(keyPath))
  }

  /**
   * Dispatches a single message
   * @param {string} messageType
   * @param {object|undefined} payload
   */
  dispatch(messageType, payload) {
    var prevState = this.state

    this.state = this.state.withMutations(state => {
      logging.dispatchStart(messageType, payload)

      // let each core handle the message
      each(this.__reactorCores, (core, id) => {
        // dont let the reactor mutate by reference
        var reactorState = state.get(id).asImmutable()
        var newState = core.react(reactorState, messageType, payload)
        state.set(id, newState)

        logging.coreReact(id, reactorState, newState)
      })

      // execute the computed after the cores have reacted
      each(this.__computeds, entry => {
        calculateComputed(prevState, state, entry)
      })

      logging.dispatchEnd(state)

      return state
    })

    // write the new state to the output stream if changed
    if (this.state !== prevState) {
      this.outputStream.write(this.state)
    }
  }

  /**
   * Initializes a reactor, at this point no more Cores can be attached.
   * The initial state is either determined from getting all the initial state
   * of the cores or by the passed in initialState
   *
   * @param {Immutable.Map?}
   */
  initialize(initialState) {
    if (initialState && !isImmutable(initialState)) {
      throw new Error("Initial state must be an ImmutableJS object")
    }

    this.state = this.state.withMutations(state => {
      if (!initialState) {
        each(this.__reactorCores, (core, id) => {
          state.set(id, toImmutable(core.initialize() || {}))
        })
      } else {
        state = initialState.asMutable()
      }

      var blankState = Immutable.Map()

      // calculate core computeds
      each(this.__reactorCores, (core, id) => {
        var computedCoreState = core.executeComputeds(blankState, state.get(id))
        state.set(id, computedCoreState)
      })

      // initialize the reactor level computeds
      each(this.__computeds, entry => {
        calculateComputed(blankState, state, entry)
      })

      return state
    })

    this.initialized = true
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
    if (this.__reactorCores[id]) {
      throw new Error("Only one reactor can be registered per id")
    }
    if (!(core instanceof ReactorCore)) {
      core = new core()
    }
    this.__reactorCores[id] = core
  }

  unattachCore(id) {
    delete this.__reactorCores[id]
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
    return new ChangeObserver(this.state, this.outputStream)
  }

  /**
   * Registers a computed with at a certain keyPath
   * @param {array|string} keyPath to register the computed
   * @param {array} deps to calculate the computed
   * @param {function} computeFn handed the deps and returns the computed value
   */
  computed(keyPath, deps, computeFn) {
    var keyPathString = coerceKeyPath(keyPath).join('.')

    if (this.__computeds[keyPathString]) {
      throw new Error("Already a computed at " + keyPathString)
    }
    this.__computeds[keyPathString] = new ComputedEntry(keyPath, deps, computeFn)
  }

  /**
   * Binds a map of actions to this specific reactor
   * can be invoked via reactor.action(name).createItem(...)
   */
  bindActions(name, actions) {
    if (this.__actions[name]) {
      throw new Error("Actions already defined for " + name)
    }
    var actionGroup = {}

    each(actions, (fn, fnName) => {
      actionGroup[fnName] = partial(fn, this)
    })
    this.__actions[name] = actionGroup
  }

  /**
   * Invokes a registered actionGroup's action
   */
  action(group) {
    if (!this.__actions[group]) {
      throw new Error("Actions not defined for " + group)
    }
    return this.__actions[group]
  }
}

module.exports = Reactor
