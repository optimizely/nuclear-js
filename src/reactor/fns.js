import Immutable from 'immutable'
import logging from '../logging'
import { isImmutableValue } from '../immutable-helpers'
import { toImmutable } from '../immutable-helpers'
import { fromKeyPath, getStoreDeps, getComputeFn, getDeps, isGetter } from '../getter'
import { isKeyPath } from '../key-path'
import { each } from '../utils'
import isEqual from '../is-equal'

/**
 * Immutable Types
 */
var ObserveResult = Immutable.Record({
  observerStoreMap: null,
  unwatchEntry: null
})

function observeResult(observerStoreMap, unwatchEntry) {
  return new ObserveResult({
    observerStoreMap,
    unwatchEntry,
  })
}

var EvaluateResult = Immutable.Record({ result: null, reactorState: null})

function evaluateResult(result, reactorState) {
  return new EvaluateResult({
    result: result,
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
  var dirtyStores = reactorState.get('dirtyStores')

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

      if (currState !== newState) {
        // if the store state changed add store to list of dirty stores
        dirtyStores = dirtyStores.add(id)
      }

      if (debug) {
        logging.storeHandled(id, currState, newState)
      }
    })

    if (debug) {
      logging.dispatchEnd(state)
    }
  })

  const nextReactorState = reactorState
    .set('state', nextState)
    .set('dirtyStores', dirtyStores);

  return incrementId(nextReactorState)
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
        .update('dirtyStores', state => state.add(id))

    })
    incrementId(reactorState)
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
 * @param {ObserverStoreMap} observerStoreMap
 * @param {KeyPath|Getter} getter
 * @param {function} handler
 * @return {ObserveResult}
 */
exports.addObserver = function(observerStoreMap, getter, handler) {
  // use the passed in getter as the key so we can rely on a byreference call for unobserve
  const getterKey = getter
  if (isKeyPath(getter)) {
    getter = fromKeyPath(getter)
  }

  const currId = observerStoreMap.get('nextId')
  const storeDeps = getStoreDeps(getter)
  const entry = Immutable.Map({
    storeDeps: storeDeps,
    getterKey: getterKey,
    getter: getter,
    handler: handler,
    unwatched: false,
  })

  let updatedObserverStoreMap
  if (storeDeps.size === 0) {
    updatedObserverStoreMap = observerStoreMap.setIn(['any', getterKey, handler], currId)
  } else {
    updatedObserverStoreMap = observerStoreMap.withMutations(map => {
      storeDeps.forEach(storeId => {
        map.setIn(['stores', storeId, getterKey, handler], currId);
      })
    })
  }

  updatedObserverStoreMap = updatedObserverStoreMap
    .set('nextId', currId + 1)
    .update('observersMap', entries => {
      return entries.set(currId, entry)
    })

  return {
    observerStoreMap: updatedObserverStoreMap,
    unwatchEntry: entry,
  }
}

/**
 * Use cases
 * removeObserver(observerStoreMap, [])
 * removeObserver(observerStoreMap, [], handler)
 * removeObserver(observerStoreMap, ['keyPath'])
 * removeObserver(observerStoreMap, ['keyPath'], handler)
 * removeObserver(observerStoreMap, getter)
 * removeObserver(observerStoreMap, getter, handler)
 * @param {ObserverStoreMap} observerStoreMap
 * @param {KeyPath|Getter} getter
 * @param {function} handler
 * @return {ObserverStoreMap}
 */
exports.removeObserver = function(observerStoreMap, getter, handler) {
  debugger;
  const getterKey = getter
  if (isKeyPath(getter)) {
    getter = fromKeyPath(getter)
  }
  const storeDeps = getStoreDeps(getter)
  let pathsToRemove = []

  if (storeDeps.size === 0) {
    let path = ['any', getterKey]
    if (handler) {
      path.push(handler)
    }
    pathsToRemove.push(path)
  } else {
    storeDeps.forEach(storeId => {
      let path = ['stores', storeId, getterKey]
      if (handler) {
        path.push(handler)
      }
      pathsToRemove.push(path)
    })
  }

  return observerStoreMap.withMutations(map => {
    pathsToRemove.forEach(path => {
      var observerId = observerStoreMap.getIn(path)

      map.removeIn(path)
      if (observerId) {
        map.removeIn(['observersMap', observerId])
      }
    })
  })
}

/**
 * Given the current observerStoreMap and a store/getter/handler checks if still active
 */
exports.isValidHandler = function(observerStoreMap, storeId, getter, handler) {
  return !!observerStoreMap.getIn([storeId, getter, handler]);
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
  })
}

/**
 * @param {ReactorState} reactorState
 * @param {KeyPath|Gettter} keyPathOrGetter
 * @return {EvaluateResult}
 */
exports.evaluate = function evaluate(reactorState, keyPathOrGetter) {
  var state = reactorState.get('state')

  if (isKeyPath(keyPathOrGetter)) {
    // if its a keyPath simply return
    return evaluateResult(
      state.getIn(keyPathOrGetter),
      reactorState
    )
  } else if (!isGetter(keyPathOrGetter)) {
    throw new Error('evaluate must be passed a keyPath or Getter')
  }

  // Must be a Getter
  // if the value is cached for this dispatch cycle, return the cached value
  if (isCached(reactorState, keyPathOrGetter)) {
    // Cache hit
    return evaluateResult(
      reactorState.getIn(['cache', keyPathOrGetter, 'value']),
      reactorState
    )
  }

  // evaluate dependencies
  var args = getDeps(keyPathOrGetter).map(dep => evaluate(reactorState, dep).result)

  if (hasStaleValue(reactorState, keyPathOrGetter)) {
    // getter deps could still be unchanged since we only looked at the unwrapped (keypath, bottom level) deps
    var prevArgs = reactorState.getIn(['cache', keyPathOrGetter, 'args'])

    // since Getter is a pure functions if the args are the same its a cache hit
    if (Immutable.is(prevArgs, toImmutable(args))) {
      var prevValue = reactorState.getIn(['cache', keyPathOrGetter, 'value'])
      return evaluateResult(
        prevValue,
        cacheValue(reactorState, keyPathOrGetter, args, prevValue)
      )
    }
  }

  var evaluatedValue = getComputeFn(keyPathOrGetter).apply(null, args)

  return evaluateResult(
    evaluatedValue,
    cacheValue(reactorState, keyPathOrGetter, args, evaluatedValue)
  )
}

/**
 * @param {ReactorState} reactorState
 * @param {Getter} getter
 * @return {Boolean}
 */
function isCached(reactorState, keyPathOrGetter) {
  return (
    reactorState.hasIn(['cache', keyPathOrGetter, 'value']) &&
    reactorState.getIn(['cache', keyPathOrGetter, 'dispatchId']) === reactorState.get('dispatchId')
  )
}

/**
 * @param {ReactorState} reactorState
 * @param {Getter} getter
 * @return {Boolean}
 */
function hasStaleValue(reactorState, getter) {
  var cache = reactorState.get('cache')
  var dispatchId = reactorState.get('dispatchId')
  return (
    cache.has(getter) &&
    cache.getIn([getter, 'dispatchId']) === dispatchId
  )
}

/**
 * Caches the value of a getter given state, getter, args, value
 * @param {ReactorState} reactorState
 * @param {Getter} getter
 * @param {Array} args
 * @param {any} value
 * @return {ReactorState}
 */
function cacheValue(reactorState, getter, args, value) {
  var dispatchId = reactorState.get('dispatchId')
  return reactorState.setIn(['cache', getter], Immutable.Map({
    value: value,
    args: toImmutable(args),
    dispatchId: dispatchId,
  }))
}

/**
 * @param {ReactorState} reactorState
 * @return {ReactorState}
 */
function incrementId(reactorState) {
  return reactorState.update('dispatchId', id => id + 1)
}
