import Immutable from 'immutable'
import logging from '../logging'
import { isImmutableValue } from '../immutable-helpers'
import { toImmutable } from '../immutable-helpers'
import { fromKeyPath, getStoreDeps, getComputeFn, getDeps, isGetter, isGetterObject, convertToGetterLiteral } from '../getter'
import { isEqual, isKeyPath } from '../key-path'
import { each } from '../utils'

/**
 * Immutable Types
 */
const EvaluateResult = Immutable.Record({ result: null, reactorState: null})
export const CACHE_CLEAR_RATIO = 0.8

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
export function registerStores(reactorState, stores) {
  return reactorState.withMutations((reactorState) => {
    each(stores, (store, id) => {
      if (reactorState.getIn(['stores', id])) {
        /* eslint-disable no-console */
        console.warn('Store already defined for id = ' + id)
        /* eslint-enable no-console */
      }

      const initialState = store.getInitialState()

      if (initialState === undefined && getOption(reactorState, 'throwOnUndefinedStoreReturnValue')) {
        throw new Error('Store getInitialState() must return a value, did you forget a return statement')
      }
      if (getOption(reactorState, 'throwOnNonImmutableStore') && !isImmutableValue(initialState)) {
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
 * Overrides the store implementation without resetting the value of that particular part of the app state
 * this is useful when doing hot reloading of stores.
 * @param {ReactorState} reactorState
 * @param {Object<String, Store>} stores
 * @return {ReactorState}
 */
export function replaceStores(reactorState, stores) {
  return reactorState.withMutations((reactorState) => {
    each(stores, (store, id) => {
      reactorState.update('stores', stores => stores.set(id, store))
    })
  })
}

/**
 * @param {ReactorState} reactorState
 * @param {String} actionType
 * @param {*} payload
 * @return {ReactorState}
 */
export function dispatch(reactorState, actionType, payload) {
  if (actionType === undefined && getOption(reactorState, 'throwOnUndefinedActionType')) {
    throw new Error('`dispatch` cannot be called with an `undefined` action type.')
  }

  const currState = reactorState.get('state')
  let dirtyStores = reactorState.get('dirtyStores')

  const nextState = currState.withMutations(state => {
    logging.dispatchStart(reactorState, actionType, payload)

    // let each store handle the message
    reactorState.get('stores').forEach((store, id) => {
      const currState = state.get(id)
      let newState

      try {
        newState = store.handle(currState, actionType, payload)
      } catch(e) {
        // ensure console.group is properly closed
        logging.dispatchError(reactorState, e.message)
        throw e
      }

      if (newState === undefined && getOption(reactorState, 'throwOnUndefinedStoreReturnValue')) {
        const errorMsg = 'Store handler must return a value, did you forget a return statement'
        logging.dispatchError(reactorState, errorMsg)
        throw new Error(errorMsg)
      }

      state.set(id, newState)

      if (currState !== newState) {
        // if the store state changed add store to list of dirty stores
        dirtyStores = dirtyStores.add(id)
      }
    })

    logging.dispatchEnd(reactorState, state, dirtyStores)
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
export function loadState(reactorState, state) {
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
export function addObserver(observerState, getter, handler) {
  // use the passed in getter as the key so we can rely on a byreference call for unobserve
  const getterKey = getter

  getter = convertToGetterLiteral(getter)
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
          map.setIn(path, Immutable.Set())
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
 * @param {ReactorState} reactorState
 * @param {String} option
 * @return {Boolean}
 */
export function getOption(reactorState, option) {
  const value = reactorState.getIn(['options', option])
  if (value === undefined) {
    throw new Error('Invalid option: ' + option)
  }
  return value
}

/**
 * Use cases
 * removeObserver(observerState, reactorState, [])
 * removeObserver(observerState, reactorState, [], handler)
 * removeObserver(observerState, reactorState, ['keyPath'])
 * removeObserver(observerState, reactorState, ['keyPath'], handler)
 * removeObserver(observerState, reactorState, getter)
 * removeObserver(observerState, reactorState, getter, handler)
 * @param {ObserverState} observerState
 * @param {ReactorState} reactorState
 * @param {KeyPath|Getter} getter
 * @param {Function} handler
 * @return {Array}
 */
export function removeObserver(observerState, reactorState, getter, handler) {
  const entriesToRemove = observerState.get('observersMap').filter(entry => {
    // use the getterKey in the case of a keyPath is transformed to a getter in addObserver
    const entryGetter = entry.get('getterKey')
    const entryGetterLiteral = convertToGetterLiteral(entryGetter)
    let handlersMatch = (!handler || entry.get('handler') === handler)
    if (!handlersMatch) {
      return false
    }
    // check for a by-value equality of keypaths
    if (isKeyPath(getter) && isKeyPath(entryGetterLiteral)) {
      return isEqual(getter, entryGetterLiteral)
    }
    // we are comparing two getters do it by reference
    return (getter === entryGetter)
  })

  // Update both observer and reactor state
  observerState = observerState.withMutations(oState => {
    reactorState = reactorState.withMutations(rState => {
      entriesToRemove.forEach(entry => { removeObserverByEntry(oState, rState, entry) })
    })
  })
  return [
    observerState,
    reactorState,
  ]
}

/**
 * Removes an observer entry by id from the observerState
 * @param {ObserverState} observerState
 * @param {ReactorState} reactorState
 * @param {Immutable.Map} entry
 * @return {Array}
 */
export function removeObserverByEntry(observerState, reactorState, entry) {
  return [
    observerState.withMutations(map => {
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
    }),
    // remove cache values for getter
    removeCacheValue(reactorState, entry.get('getterKey')),
  ]
}

/**
 * @param {ReactorState} reactorState
 * @return {ReactorState}
 */
export function reset(reactorState) {
  const prevState = reactorState.get('state')

  return reactorState.withMutations(reactorState => {
    const storeMap = reactorState.get('stores')
    const storeIds = storeMap.keySeq().toJS()
    storeMap.forEach((store, id) => {
      const storeState = prevState.get(id)
      const resetStoreState = store.handleReset(storeState)
      if (resetStoreState === undefined && getOption(reactorState, 'throwOnUndefinedStoreReturnValue')) {
        throw new Error('Store handleReset() must return a value, did you forget a return statement')
      }
      if (getOption(reactorState, 'throwOnNonImmutableStore') && !isImmutableValue(resetStoreState)) {
        throw new Error('Store reset state must be an immutable value, did you forget to call toImmutable')
      }
      reactorState.setIn(['state', id], resetStoreState)
    })

    reactorState.update('storeStates', storeStates => incrementStoreStates(storeStates, storeIds))
    resetDirtyStores(reactorState)
    reactorState.set('cache', Immutable.Map())
    reactorState.set('cacheRecency', Immutable.OrderedMap())
  })
}

/**
 * @param {ReactorState} reactorState
 * @param {KeyPath|Gettter} keyPathOrGetter
 * @return {EvaluateResult}
 */
export function evaluate(reactorState, keyPathOrGetter) {
  const state = reactorState.get('state')
  const getter = convertToGetterLiteral(keyPathOrGetter)

  if (isKeyPath(getter)) {
    // if its a keyPath simply return
    return evaluateResult(
      state.getIn(getter),
      reactorState
    )
  } else if (!isGetter(keyPathOrGetter) && !isGetterObject(keyPathOrGetter)) {
    throw new Error('evaluate must be passed a keyPath or Getter')
  }

  // if the value is cached for this dispatch cycle, return the cached value
  if (isCached(reactorState, keyPathOrGetter)) {
    // Cache hit
    return evaluateResult(
      getCachedValue(reactorState, keyPathOrGetter),
      updateCacheRecency(reactorState, keyPathOrGetter)
    )
  }

  // evaluate dependencies
  const args = getDeps(getter).map(dep => evaluate(reactorState, dep).result)
  const evaluatedValue = getComputeFn(getter).apply(null, args)
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
export function serialize(reactorState) {
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
export function resetDirtyStores(reactorState) {
  return reactorState.set('dirtyStores', Immutable.Set())
}

/**
 * Currently cache keys are always getters by reference
 * @param {Getter} getter
 * @return {Getter}
 */
function getCacheKey(getter) {
  if (isGetterObject(getter) && getter.cacheKey !== null) {
    return getter.cacheKey
  }
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

  // Check global cache settings
  const globalCacheEnabled = !!reactorState.get('useCache')
  let useCache = globalCacheEnabled

  // Check cache settings on a getter basis
  if (isGetterObject(getter) && getter.cache !== 'default') {
    useCache = getter.cache === 'always' ? true : false
  }

  if (!useCache) {
    return reactorState
  }

  const cacheKey = getCacheKey(getter)
  const dispatchId = reactorState.get('dispatchId')
  const storeDeps = getStoreDeps(getter)
  const storeStates = toImmutable({}).withMutations(map => {
    storeDeps.forEach(storeId => {
      const stateId = reactorState.getIn(['storeStates', storeId])
      map.set(storeId, stateId)
    })
  })

  const maxItemsToCache = reactorState.get('maxItemsToCache')
  const itemsToCache = maxItemsToCache * CACHE_CLEAR_RATIO

  return reactorState.withMutations(state => {
    if (maxItemsToCache && maxItemsToCache <= state.get('cache').size) {
      do {
        let key = state.get('cacheRecency').first()
        state.deleteIn(['cache', key])
        state.deleteIn(['cacheRecency', key])
      } while (itemsToCache < state.get('cache').size)
    }

    state.setIn(['cacheRecency', cacheKey], cacheKey)
    state.setIn(['cache', cacheKey], Immutable.Map({
      value: value,
      storeStates: storeStates,
      dispatchId: dispatchId,
    }))
  })
}

/**
 * Remove getter cache value from cache and recency cache
 * @param {ReactorState} reactorState
 * @param {getter} getter
 * @return {ReactorState}
 */
function removeCacheValue(reactorState, getter) {
  const cacheKey = getCacheKey(getter)
  return reactorState.withMutations(rState => {
    rState.deleteIn(['cache', cacheKey])
    rState.deleteIn(['cacheRecency', cacheKey])
  })
}

/**
 * Readds the key for the item in cache to update recency
 * @param {ReactorState} reactorState
 * @param {getter} getter
 * @return {ReactorState}
 */
function updateCacheRecency(reactorState, getter) {
  const cacheKey = getCacheKey(getter)
  return reactorState.withMutations(state => {
    state.deleteIn(['cacheRecency', cacheKey])
    state.setIn(['cacheRecency', cacheKey], cacheKey)
  })
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
