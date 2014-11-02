var toJS = require('./immutable-helpers').toJS
var toImmutable = require('./immutable-helpers').toImmutable
var isImmutable = require('./immutable-helpers').isImmutable
var coerceKeyPath = require('./utils').keyPath
var each = require('./utils').each
var partial = require('./utils').partial
var Immutable = require('immutable')
var logging = require('./logging')
var ChangeObserver = require('./change-observer')
var calculateComputed = require('./calculate-computed')
var ChangeEmitter = require('./change-emitter')

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
     * Event bus that emits a change event anytime the state
     * of the system changes
     */
    this.changeEmitter = new ChangeEmitter()
    /**
     * Holds a map of id => reactor instance
     */
    this.__reactorCores = Immutable.Map({})
    /**
     * Holds a map of stringified keyPaths => GetterRecords
     */
    this.__computeds = Immutable.Map({})
    /**
     * Holds a map of action group names => action functions
     */
    this.__actions = Immutable.Map({})

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
      this.__reactorCores.forEach((core, keyPath) => {
        // dont let the reactor mutate by reference
        var reactorState = state.getIn(keyPath)
        var newState = core.react(reactorState, messageType, payload)
        state.updateIn(keyPath, oldState => newState)

        logging.coreReact(keyPath, reactorState, newState)
      })

      // execute the computed after the cores have reacted
      this.__computeds.forEach((getter, keyPath) => {
        calculateComputed(prevState, state, keyPath, getter)
      })

      logging.dispatchEnd(state)

      return state
    })

    // write the new state to the output stream if changed
    if (this.state !== prevState) {
      this.changeEmitter.emitChange(this.state, messageType, payload)
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

    var state

    this.__reactorCores.forEach(core => {
      core.initialize()
    })

    if (initialState) {
      state = initialState
    } else {
      state = Immutable.Map()
      this.__reactorCores.forEach((core, keyPath) => {
        var coreInitialState = toImmutable(core.getInitialState())
        state = state.updateIn(keyPath, curr => coreInitialState)
      })
    }

    var blankState = Immutable.Map()

    // calculate core computeds
    this.__reactorCores.forEach((core, keyPath) => {
      var computedCoreState = core.executeComputeds(blankState, state.getIn(keyPath))
      state = state.updateIn(keyPath, oldState => computedCoreState)
    })

    // initialize the reactor level computeds
    this.__computeds.forEach((getter, keyPath) => {
      state = state.updateIn(keyPath, curr => getter.evaluate(state))
    })

    this.state = state

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
   * @param {string|array} path
   * @param {ReactorCore} Core
   */
  defineState(path, core) {
    var keyPath = coerceKeyPath(path)
    if (this.__reactorCores.get(keyPath)) {
      throw new Error("Already a ReactorCore registered at " + keyPath)
    }
    if (!(core instanceof ReactorCore)) {
      core = new core()
    }
    this.__reactorCores = this.__reactorCores.set(keyPath, core)
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
    return new ChangeObserver(this.state, this.changeEmitter)
  }

  /**
   * Registers a computed with at a certain keyPath
   * @param {array|string} keyPath to register the computed
   * @param {GetterRecord} getter to calculate the computed
   */
  defineComputed(path, getter) {
    var keyPath = coerceKeyPath(path)
    if (this.__computeds.get(keyPath)) {
      throw new Error("Already a computed at " + keyPath)
    }
    this.__computeds = this.__computeds.set(keyPath, getter)
  }

  /**
   * Binds a map of actions to this specific reactor
   * can be invoked via reactor.action(name).createItem(...)
   */
  bindActions(name, actions) {
    if (this.__actions.get(name)) {
      throw new Error("Actions already defined for " + name)
    }
    var actionGroup = {}
    each(actions, (fn, fnName) => {
      actionGroup[fnName] = partial(fn, this)
    })

    this.__actions = this.__actions.set(name, actionGroup)
  }

  /**
   * Invokes a registered actionGroup's action
   */
  action(group) {
    if (!this.__actions.get(group)) {
      throw new Error("Actions not defined for " + group)
    }
    return this.__actions.get(group)
  }
}

module.exports = Reactor
