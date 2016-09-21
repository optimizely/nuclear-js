import Immutable from 'immutable'
import { CacheEntry } from './cache'
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
  let logging = reactorState.get('logger')

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

    logging.dispatchEnd(reactorState, state, dirtyStores, currState)
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
export function removeObserver(observerState, getter, handler) {
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
    entriesToRemove.forEach(entry => removeObserverByEntry(map, entry))
  })
}

/**
 * Removes an observer entry by id from the observerState
 * @param {ObserverState} observerState
 * @param {Immutable.Map} entry
 * @return {ObserverState}
 */
export function removeObserverByEntry(observerState, entry) {
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
  })
}

/**
 * @param {ReactorState} reactorState
 * @param {KeyPath|Gettter} keyPathOrGetter
 * @return {EvaluateResult}
 */
export function evaluate(reactorState, keyPathOrGetter) {
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

  const cache = reactorState.get('cache')
  var cacheEntry = cache.lookup(keyPathOrGetter)
  const isCacheMiss = !cacheEntry || isDirtyCacheEntry(reactorState, cacheEntry)
  if (isCacheMiss) {
    cacheEntry = createCacheEntry(reactorState, keyPathOrGetter)
  }

  return evaluateResult(
    cacheEntry.get('value'),
    reactorState.update('cache', cache => {
      return isCacheMiss ?
        cache.miss(keyPathOrGetter, cacheEntry) :
        cache.hit(keyPathOrGetter)
    })
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
 * @param {ReactorState} reactorState
 * @param {CacheEntry} cacheEntry
 * @return {boolean}
 */
function isDirtyCacheEntry(reactorState, cacheEntry) {
  const storeStates = cacheEntry.get('storeStates')

  // if there are no store states for this entry then it was never cached before
  return !storeStates.size || storeStates.some((stateId, storeId) => {
    return reactorState.getIn(['storeStates', storeId]) !== stateId
  })
}

/**
 * Evaluates getter for given reactorState and returns CacheEntry
 * @param {ReactorState} reactorState
 * @param {Getter} getter
 * @return {CacheEntry}
 */
function createCacheEntry(reactorState, getter) {
  // evaluate dependencies
  const args = getDeps(getter).map(dep => evaluate(reactorState, dep).result)
  const value = getComputeFn(getter).apply(null, args)

  const storeDeps = getStoreDeps(getter)
  const storeStates = toImmutable({}).withMutations(map => {
    storeDeps.forEach(storeId => {
      const stateId = reactorState.getIn(['storeStates', storeId])
      map.set(storeId, stateId)
    })
  })

  return CacheEntry({
    value: value,
    storeStates: storeStates,
    dispatchId: reactorState.get('dispatchId'),
  })
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
