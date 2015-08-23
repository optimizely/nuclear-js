var Immutable = require('immutable')
var logging = require('../logging')
var isImmutableValue = require('../immutable-helpers').isImmutableValue
var Getter = require('../getter')
var KeyPath = require('../key-path')
var evaluate = require('./evaluate')
var each = require('../utils').each

var ObserveResult = Immutable.Record({ unwatchFn: null, reactorState: null})

function observeResult(unwatchFn, reactorState) {
  return new ObserveResult({
    unwatchFn: unwatchFn,
    reactorState: reactorState,
  })
}

/**
 * @param {ReactorState} reactorState
 * @param {String} actionType
 * @param {*} payload
 * @return {ReactorState}
 */
exports.dispatch = function(reactorState, actionType, payload) {
  var currState = reactorState.get('state')
  var debug = reactorState.get('debug')

  var nextState = currState.withMutations(state => {
    if (debug) {
      logging.dispatchStart(actionType, payload)
    }

    // let each store handle the message
    reactorState.get('stores').forEach((store, id) => {
      var currState = state.get(id)
      var newState

      try {
        newState = store.handle(currState, actionType, payload)
      } catch(e) {
        // ensure console.group is properly closed
        logging.dispatchError(e.message)
        throw e
      }

      if (debug && newState === undefined) {
        var errorMsg = 'Store handler must return a value, did you forget a return statement'
        logging.dispatchError(errorMsg)
        throw new Error(errorMsg)
      }

      state.set(id, newState)

      if (debug) {
        logging.storeHandled(id, currState, newState)
      }
    })

    if (debug) {
      logging.dispatchEnd(state)
    }
  })

  return incrementId(reactorState.set('state', nextState))
}

/**
 * @param {ReactorState} reactorState
 * @param {Immutable.Map} state
 * @return {ReactorState}
 */
exports.loadState = function(reactorState, state) {
  var stateToLoad = toImmutable({}).withMutations(stateToLoad => {
    each(state, (serializedStoreState, storeId) => {
      var store = reactorState.getIn(['stores', storeId])
      if (store) {
        var storeState = store.deserialize(serializedStoreState)
        if (storeState !== undefined) {
          stateToLoad.set(storeId, storeState)
        }
      }
    })
  })

  var newState = reactorState.get('state').merge(stateToLoad)
  return reactorState.set('state', newState)
}

/**
 * @param {ReactorState} reactorState
 * @param {Object<String, Store>} stores
 * @return {ReactorState}
 */
exports.registerStores = function(reactorState, stores) {
  var debug = reactorState.get('debug')

  return reactorState.withMutations((reactorState) => {
    each(stores, (store, id) => {
      if (reactorState.getIn(['stores', id])) {
        /* eslint-disable no-console */
        console.warn('Store already defined for id = ' + id)
        /* eslint-enable no-console */
      }

      var initialState = store.getInitialState()

      if (debug && !isImmutableValue(initialState)) {
        throw new Error('Store getInitialState() must return an immutable value, did you forget to call toImmutable')
      }

      reactorState
        .update('stores', stores => stores.set(id, store))
        .update('state', state => state.set(id, initialState))

      incrementId(reactorState)
    })
  })
}

/**
 * Adds a change observer whenever a certain part of the reactor state changes
 *
 * 1. observe(handlerFn) - 1 argument, called anytime reactor.state changes
 * 2. observe(keyPath, handlerFn) same as above
 * 3. observe(getter, handlerFn) called whenever any getter dependencies change with
 *    the value of the getter
 *
 * Adds a change handler whenever certain deps change
 * If only one argument is passed invoked the handler whenever
 * the reactor state changes
 *
 * @param {ReactorState} reactorState
 * @param {KeyPath|Getter} getter
 * @param {function} handler
 * @return {ObserveResult}
 */
exports.addObserver = function(reactorState, getter, handler) {
  // TODO: make observers a map of <Getter> => { handlers }
  var entry = {
    getter: getter,
    handler: handler,
    unwatched: false,
  }
  var observers = reactorState.get('observers')
  observers.push(entry)
  // return unwatch function
  var unwatchFn = () => {
    debugger;
    // TODO: untrack from change emitter
    var ind = observers.indexOf(entry)
    if (ind > -1) {
      entry.unwatched = true
      observers.splice(ind, 1)
      debugger;
    }
  }

  return observeResult(unwatchFn, reactorState)
}

/**
 * @param {ReactorState} prevReactorState
 * @param {ReactorState} prevReactorState
 * @return {ReactorState}
 */
exports.notify = function(prevReactorState, reactorState) {
  var observers = reactorState.get('observers')

  if (observers.length > 0) {
    var currentValues = Immutable.Map()

    observers.slice(0).forEach(entry => {
      if (entry.unwatched) {
        return
      }
      var getter = entry.getter
      var prevEvaluateResult = evaluate(prevReactorState, getter)
      var currEvaluateResult = evaluate(reactorState, getter)

      var prevValue = prevEvaluateResult.result
      var currValue = currEvaluateResult.result

      if (!Immutable.is(prevValue, currValue)) {
        entry.handler.call(null, currValue)
      }

      // update prevReactorState / reactorState
      reactorState = currEvaluateResult.reactorState
      prevReactorState = prevEvaluateResult.reactorState
    })
  }
  return reactorState
}

/**
 * @param {ReactorState} reactorState
 * @return {ReactorState}
 */
exports.reset = function(reactorState) {
  var debug = reactorState.get('debug')
  var prevState = reactorState.get('state')

  return reactorState.withMutations(reactorState => {
    reactorState.get('stores').forEach((store, id) => {
      var storeState = prevState.get(id)
      var resetStoreState = store.handleReset(storeState)
      if (debug && resetStoreState === undefined) {
        throw new Error('Store handleReset() must return a value, did you forget a return statement')
      }
      if (debug && !isImmutableValue(resetStoreState)) {
        throw new Error('Store reset state must be an immutable value, did you forget to call toImmutable')
      }
      reactorState.setIn(['state', id], resetStoreState)
    })

    reactorState.set('observers', [])
  })
}


/**
 * @param {ReactorState} reactorState
 * @return {ReactorState}
 */
function incrementId(reactorState) {
  return reactorState.update('dispatchId', id => id + 1)
}
