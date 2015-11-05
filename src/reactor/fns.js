import Immutable from 'immutable'
import logging from '../logging'
import { isImmutableValue } from '../immutable-helpers'
import { toImmutable } from '../immutable-helpers'
import { fromKeyPath, getStoreDeps, getComputeFn, getDeps, isGetter } from '../getter'
import { isEqual, isKeyPath } from '../key-path'
import { each } from '../utils'

/**
 * Immutable Types
 */
const EvaluateResult = Immutable.Record({ result: null, reactorState: null})

function evaluateResult(result, reactorState) {
  return new EvaluateResult({
    result: result,
    reactorState: reactorState,
  })
}

/**
 * @param {ReactorState} reactorState
 * @param {Object<String, Store>} stores
 * @return {ReactorState}
 */
exports.registerStores = function(reactorState, stores) {
  const debug = reactorState.get('debug')

  return reactorState.withMutations((reactorState) => {
    each(stores, (store, id) => {
      if (reactorState.getIn(['stores', id])) {
        /* eslint-disable no-console */
        console.warn('Store already defined for id = ' + id)
        /* eslint-enable no-console */
      }

      const initialState = store.getInitialState()

      if (debug && !isImmutableValue(initialState)) {
        throw new Error('Store getInitialState() must return an immutable value, did you forget to call toImmutable')
      }

      reactorState
        .update('stores', stores => stores.set(id, store))
        .update('state', state => state.set(id, initialState))
        .update('dirtyStores', state => state.add(id))
        .update('storeStates', storeStates => incrementStoreStates(storeStates, [id]))
    })
    incrementId(reactorState)
  })
}

/**
 * @param {ReactorState} reactorState
 * @param {String} actionType
 * @param {*} payload
 * @return {ReactorState}
 */
exports.dispatch = function(reactorState, actionType, payload) {
  const currState = reactorState.get('state')
  const debug = reactorState.get('debug')
  let dirtyStores = reactorState.get('dirtyStores')

  const nextState = currState.withMutations(state => {
    if (debug) {
      logging.dispatchStart(actionType, payload)
    }

    // let each store handle the message
    reactorState.get('stores').forEach((store, id) => {
      const currState = state.get(id)
      let newState

      try {
        newState = store.handle(currState, actionType, payload)
      } catch(e) {
        // ensure console.group is properly closed
        logging.dispatchError(e.message)
        throw e
      }

      if (debug && newState === undefined) {
        const errorMsg = 'Store handler must return a value, did you forget a return statement'
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
    .set('dirtyStores', dirtyStores)
    .update('storeStates', storeStates => incrementStoreStates(storeStates, dirtyStores))

  return incrementId(nextReactorState)
}

/**
 * @param {ReactorState} reactorState
 * @param {Immutable.Map} state
 * @return {ReactorState}
 */
exports.loadState = function(reactorState, state) {
  let dirtyStores = []
  const stateToLoad = toImmutable({}).withMutations(stateToLoad => {
    each(state, (serializedStoreState, storeId) => {
      const store = reactorState.getIn(['stores', storeId])
      if (store) {
        const storeState = store.deserialize(serializedStoreState)
        if (storeState !== undefined) {
          stateToLoad.set(storeId, storeState)
          dirtyStores.push(storeId)
        }
      }
    })
  })

  const dirtyStoresSet = Immutable.Set(dirtyStores)
  return reactorState
    .update('state', state => state.merge(stateToLoad))
    .update('dirtyStores', stores => stores.union(dirtyStoresSet))
    .update('storeStates', storeStates => incrementStoreStates(storeStates, dirtyStores))
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
 * @param {ObserverState} observerState
 * @param {KeyPath|Getter} getter
 * @param {function} handler
 * @return {ObserveResult}
 */
exports.addObserver = function(observerState, getter, handler) {
  // use the passed in getter as the key so we can rely on a byreference call for unobserve
  const getterKey = getter
  if (isKeyPath(getter)) {
    getter = fromKeyPath(getter)
  }

  const currId = observerState.get('nextId')
  const storeDeps = getStoreDeps(getter)
  const entry = Immutable.Map({
    id: currId,
    storeDeps: storeDeps,
    getterKey: getterKey,
    getter: getter,
    handler: handler,
  })

  let updatedObserverState
  if (storeDeps.size === 0) {
    // no storeDeps means the observer is dependent on any of the state changing
    updatedObserverState = observerState.update('any', observerIds => observerIds.add(currId))
  } else {
    updatedObserverState = observerState.withMutations(map => {
      storeDeps.forEach(storeId => {
        let path = ['stores', storeId]
        if (!map.hasIn(path)) {
          map.setIn(path, Immutable.Set([]))
        }
        map.updateIn(['stores', storeId], observerIds => observerIds.add(currId))
      })
    })
  }

  updatedObserverState = updatedObserverState
    .set('nextId', currId + 1)
    .setIn(['observersMap', currId], entry)

  return {
    observerState: updatedObserverState,
    entry: entry,
  }
}

/**
 * Use cases
 * removeObserver(observerState, [])
 * removeObserver(observerState, [], handler)
 * removeObserver(observerState, ['keyPath'])
 * removeObserver(observerState, ['keyPath'], handler)
 * removeObserver(observerState, getter)
 * removeObserver(observerState, getter, handler)
 * @param {ObserverState} observerState
 * @param {KeyPath|Getter} getter
 * @param {Function} handler
 * @return {ObserverState}
 */
exports.removeObserver = function(observerState, getter, handler) {
  const entriesToRemove = observerState.get('observersMap').filter(entry => {
    // use the getterKey in the case of a keyPath is transformed to a getter in addObserver
    let entryGetter = entry.get('getterKey')
    let handlersMatch = (!handler || entry.get('handler') === handler)
    if (!handlersMatch) {
      return false
    }
    // check for a by-value equality of keypaths
    if (isKeyPath(getter) && isKeyPath(entryGetter)) {
      return isEqual(getter, entryGetter)
    }
    // we are comparing two getters do it by reference
    return (getter === entryGetter)
  })

  return observerState.withMutations(map => {
    entriesToRemove.forEach(entry => exports.removeObserverByEntry(map, entry))
  })
}

/**
 * Removes an observer entry by id from the observerState
 * @param {ObserverState} observerState
 * @param {Immutable.Map} entry
 * @return {ObserverState}
 */
exports.removeObserverByEntry = function(observerState, entry) {
  return observerState.withMutations(map => {
    const id = entry.get('id')
    const storeDeps = entry.get('storeDeps')

    if (storeDeps.size === 0) {
      map.update('any', anyObsevers => anyObsevers.remove(id))
    } else {
      storeDeps.forEach(storeId => {
        map.updateIn(['stores', storeId], observers => {
          if (observers) {
            // check for observers being present because reactor.reset() can be called before an unwatch fn
            return observers.remove(id)
          }
          return observers
        })
      })
    }

    map.removeIn(['observersMap', id])
  })
}

/**
 * @param {ReactorState} reactorState
 * @return {ReactorState}
 */
exports.reset = function(reactorState) {
  const debug = reactorState.get('debug')
  const prevState = reactorState.get('state')

  return reactorState.withMutations(reactorState => {
    const storeMap = reactorState.get('stores')
    const storeIds = storeMap.keySeq().toJS()
    storeMap.forEach((store, id) => {
      const storeState = prevState.get(id)
      const resetStoreState = store.handleReset(storeState)
      if (debug && resetStoreState === undefined) {
        throw new Error('Store handleReset() must return a value, did you forget a return statement')
      }
      if (debug && !isImmutableValue(resetStoreState)) {
        throw new Error('Store reset state must be an immutable value, did you forget to call toImmutable')
      }
      reactorState.setIn(['state', id], resetStoreState)
    })

    reactorState.update('storeStates', storeStates => incrementStoreStates(storeStates, storeIds))
    exports.resetDirtyStores(reactorState)
  })
}

/**
 * @param {ReactorState} reactorState
 * @param {KeyPath|Gettter} keyPathOrGetter
 * @return {EvaluateResult}
 */
exports.evaluate = function evaluate(reactorState, keyPathOrGetter) {
  const state = reactorState.get('state')

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
      getCachedValue(reactorState, keyPathOrGetter),
      reactorState
    )
  }

  // evaluate dependencies
  const args = getDeps(keyPathOrGetter).map(dep => evaluate(reactorState, dep).result)
  const evaluatedValue = getComputeFn(keyPathOrGetter).apply(null, args)

  return evaluateResult(
    evaluatedValue,
    cacheValue(reactorState, keyPathOrGetter, evaluatedValue)
  )
}

/**
 * Returns serialized state for all stores
 * @param {ReactorState} reactorState
 * @return {Object}
 */
exports.serialize = function(reactorState) {
  let serialized = {}
  reactorState.get('stores').forEach((store, id) => {
    let storeState = reactorState.getIn(['state', id])
    let serializedState = store.serialize(storeState)
    if (serializedState !== undefined) {
      serialized[id] = serializedState
    }
  })
  return serialized
}

/**
 * Returns serialized state for all stores
 * @param {ReactorState} reactorState
 * @return {ReactorState}
 */
exports.resetDirtyStores = function(reactorState) {
  return reactorState.set('dirtyStores', Immutable.Set())
}

/**
 * Currently cache keys are always getters by reference
 * @param {Getter} getter
 * @return {Getter}
 */
function getCacheKey(getter) {
  return getter
}

/**
 * @param {ReactorState} reactorState
 * @param {Getter|KeyPath} keyPathOrGetter
 * @return {Immutable.Map}
 */
function getCacheEntry(reactorState, keyPathOrGetter) {
  const key = getCacheKey(keyPathOrGetter)
  return reactorState.getIn(['cache', key])
}

/**
 * @param {ReactorState} reactorState
 * @param {Getter} getter
 * @return {Boolean}
 */
function isCached(reactorState, keyPathOrGetter) {
  const entry = getCacheEntry(reactorState, keyPathOrGetter)
  if (!entry) {
    return false
  }

  const storeStates = entry.get('storeStates')
  if (storeStates.size === 0) {
    // if there are no store states for this entry then it was never cached before
    return false
  }

  return storeStates.every((stateId, storeId) => {
    return reactorState.getIn(['storeStates', storeId]) === stateId
  })
}

/**
 * Caches the value of a getter given state, getter, args, value
 * @param {ReactorState} reactorState
 * @param {Getter} getter
 * @param {*} value
 * @return {ReactorState}
 */
function cacheValue(reactorState, getter, value) {
  const cacheKey = getCacheKey(getter)
  const dispatchId = reactorState.get('dispatchId')
  const storeDeps = getStoreDeps(getter)
  const storeStates = toImmutable({}).withMutations(map => {
    storeDeps.forEach(storeId => {
      const stateId = reactorState.getIn(['storeStates', storeId])
      map.set(storeId, stateId)
    })
  })

  return reactorState.setIn(['cache', cacheKey], Immutable.Map({
    value: value,
    storeStates: storeStates,
    dispatchId: dispatchId,
  }))
}

/**
 * Pulls out the cached value for a getter
 */
function getCachedValue(reactorState, getter) {
  const key = getCacheKey(getter)
  return reactorState.getIn(['cache', key, 'value'])
}

/**
 * @param {ReactorState} reactorState
 * @return {ReactorState}
 */
function incrementId(reactorState) {
  return reactorState.update('dispatchId', id => id + 1)
}


/**
 * @param {Immutable.Map} storeStates
 * @param {Array} storeIds
 * @return {Immutable.Map}
 */
function incrementStoreStates(storeStates, storeIds) {
  return storeStates.withMutations(map => {
    storeIds.forEach(id => {
      const nextId = map.has(id) ? map.get(id) + 1 : 1
      map.set(id, nextId)
    })
  })
}
