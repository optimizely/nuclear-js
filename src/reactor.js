var Immutable = require('immutable')
var logging = require('./logging')
var flattenMap = require('./flatten-map')
var ChangeObserver = require('./change-observer')
var ChangeEmitter = require('./change-emitter')
var ReactiveState = require('./reactive-state')
var Computed = require('./computed')
var hasChanged = require('./has-changed')

// helper fns
var toJS = require('./immutable-helpers').toJS
var toImmutable = require('./immutable-helpers').toImmutable
var isImmutable = require('./immutable-helpers').isImmutable
var coerceKeyPath = require('./utils').keyPath
var each = require('./utils').each
var partial = require('./utils').partial


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
  constructor(config) {
    if (!(this instanceof Reactor)) {
      return new Reactor(config)
    }

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
    this.__stateHandlers = Immutable.Map({})
    /**
     * Holds a map of stringified keyPaths => GetterRecords
     */
    this.__computeds = Immutable.Map({})
    /**
     * Holds a map of action group names => action functions
     */
    this.__actions = Immutable.Map({})

    // parse the config, which populates the __stateHandlers,
    // __computeds and __actions
    this.__parseConfig(config)
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
      this.__stateHandlers.forEach((handler, keyPath) => {
        var currState = state.getIn(keyPath)
        var newState = handler.react(currState, messageType, payload)
        state.setIn(keyPath, newState)

        logging.coreReact(keyPath, currState, newState)
      })

      // execute the computed after the cores have reacted
      this.__computeds.forEach((computed, keyPath) => {
        if (hasChanged(prevState, state, computed.flatDeps)) {
          state.setIn(keyPath, Computed.evaluate(state, computed))
        }
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

    // reset the state
    this.state = Immutable.Map()

    var state

    this.__stateHandlers.forEach(handler => {
      handler.initialize()
    })

    if (initialState) {
      state = initialState
    } else {
      // create the initial state by populating from the ReactiveState definitions
      state = Immutable.Map()
      this.__stateHandlers.forEach((handler, keyPath) => {
        var handlerState = toImmutable(handler.getInitialState())
        state = state.setIn(keyPath, handlerState)
      })
    }

    var blankState = Immutable.Map()

    // calculate ReactiveState level computeds
    this.__stateHandlers.forEach((handler, keyPath) => {
      var computedState = handler.executeComputeds(blankState, state.getIn(keyPath))
      state = state.setIn(keyPath, computedState)
    })

    // initialize the reactor level computeds
    this.__computeds.forEach((computed, keyPath) => {
      state = state.setIn(keyPath, Computed.evaluate(state, computed))
    })

    this.state = state
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
   * Parses the constructor config for a reactor.
   *
   * The config has the schema of:
   *
   * Reactor({
   *   state: {
   *     stateKey: <ReactiveState|Computed>,
   *     substate: {
   *       substateKey: <ReactiveState|Computed>
   *     }
   *   },
   *
   *   actions: {
   *     actionGroupName: <Object>
   *   }
   * })
   *
   * State can be nested within a map
   *
   * @param {object} config
   */
  __parseConfig(config) {
    // flatten a deep state map into a flat map of <List of keys> => <ReactiveState|Computed>
    var flatState = flattenMap(config.state, (val) => {
      return (
        ReactiveState.isReactiveState(val) ||
        Computed.isComputed(val)
      )
    })

    var stateHandlers = this.__stateHandlers.asMutable()
    var computeds = this.__computeds.asMutable()

    flatState.forEach((val, keyPath) => {
      if (ReactiveState.isReactiveState(val)) {
        stateHandlers.set(keyPath.toJS(), val)
      } else if (Computed.isComputed(val)) {
        computeds.set(keyPath.toJS(), val)
      } else {
        throw new Error("State definitions must be instances of " +
                        "ReactiveState or Computed")
      }
    })

    this.__stateHandlers = stateHandlers.asImmutable()
    this.__computeds = computeds.asImmutable()

    if (config.actions) {
      // register the actions for this reactor
      each(config.actions, this.__bindActions.bind(this))
    }
  }

  /**
   * Binds a map of actions to this specific reactor
   * can be invoked via reactor.action(name).createItem(...)
   */
  __bindActions(actions, name) {
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
  actions(group) {
    if (!this.__actions.get(group)) {
      throw new Error("Actions not defined for " + group)
    }
    return this.__actions.get(group)
  }
}

module.exports = Reactor
