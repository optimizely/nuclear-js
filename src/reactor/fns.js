import Immutable from 'immutable'
import { CacheEntry } from './cache'
import { isImmutableValue } from '../immutable-helpers'
import { toImmutable } from '../immutable-helpers'
import { fromKeyPath, getStoreDeps, getComputeFn, getDeps, isGetter, getCanonicalKeypathDeps } from '../getter'
import { isEqual, isKeyPath } from '../key-path'
import * as KeypathTracker from './keypath-tracker'
import { each } from '../utils'

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
        .update('keypathStates', keypathStates => {
          return KeypathTracker.changed(keypathStates, [id])
        })
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
  let dirtyStores = []

  const nextState = currState.withMutations(state => {
    getLoggerFunction(reactorState, 'dispatchStart')(reactorState, actionType, payload)

    // let each store handle the message
    reactorState.get('stores').forEach((store, id) => {
      const currState = state.get(id)
      let newState

      try {
        newState = store.handle(currState, actionType, payload)
      } catch(e) {
        // ensure console.group is properly closed
        getLoggerFunction(reactorState, 'dispatchError')(reactorState, e.message)
        throw e
      }

      if (newState === undefined && getOption(reactorState, 'throwOnUndefinedStoreReturnValue')) {
        const errorMsg = 'Store handler must return a value, did you forget a return statement'
        getLoggerFunction(reactorState, 'dispatchError')(reactorState, errorMsg)
        throw new Error(errorMsg)
      }

      state.set(id, newState)

      if (currState !== newState) {
        // if the store state changed add store to list of dirty stores
        dirtyStores.push(id)
      }
    })

    getLoggerFunction(reactorState, 'dispatchEnd')(reactorState, state, toImmutable(dirtyStores), currState)
  })

  const nextReactorState = reactorState
    .set('state', nextState)
    .update('keypathStates', k => k.withMutations(keypathStates => {
      dirtyStores.forEach(storeId => {
        KeypathTracker.changed(keypathStates, [storeId])
      })
    }))

  return incrementId(nextReactorState)
}

/**
 * @param {ReactorState} reactorState
 * @param {Immutable.Map} state
 * @return {ReactorState}
 */
export function loadState(reactorState, state) {
  reactorState = reactorState.asMutable()
  let dirtyStores = Immutable.Set().asMutable()

  const stateToLoad = Immutable.Map({}).withMutations(stateToLoad => {
    each(state, (serializedStoreState, storeId) => {
      const store = reactorState.getIn(['stores', storeId])
      if (store) {
        const storeState = store.deserialize(serializedStoreState)
        if (storeState !== undefined) {
          stateToLoad.set(storeId, storeState)
          dirtyStores.add(storeId)
        }
      }
    })
  })

  reactorState
    .update('state', state => state.merge(stateToLoad))
    .update('keypathStates', k => k.withMutations(keypathStates => {
      dirtyStores.forEach(storeId => {
        KeypathTracker.changed(keypathStates, [storeId])
      })
    }))

  return reactorState.asImmutable()
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
 * @param {ReactorState} reactorState
 * @return {ReactorState}
 */
export function reset(reactorState) {
  const storeMap = reactorState.get('stores')

  return reactorState.withMutations(reactorState => {
    // update state
    reactorState.update('state', s => s.withMutations(state => {
      storeMap.forEach((store, id) => {
        const storeState = state.get(id)
        const resetStoreState = store.handleReset(storeState)
        if (resetStoreState === undefined && getOption(reactorState, 'throwOnUndefinedStoreReturnValue')) {
          throw new Error('Store handleReset() must return a value, did you forget a return statement')
        }
        if (getOption(reactorState, 'throwOnNonImmutableStore') && !isImmutableValue(resetStoreState)) {
          throw new Error('Store reset state must be an immutable value, did you forget to call toImmutable')
        }
        state.set(id, resetStoreState)
      })
    }))

    reactorState.set('keypathStates', new KeypathTracker.RootNode())
    reactorState.set('dispatchId', 1)
    reactorState.update('cache', cache => cache.empty())
  })
}

/**
 * @param {ReactorState} prevReactorState
 * @param {ReactorState} currReactorState
 * @param {Array<KeyPath>} keyPathOrGetter
 * @return {Object}
 */
export function resolveDirtyKeypathStates(prevReactorState, currReactorState, keypaths, cleanAll = false) {
  const prevState = prevReactorState.get('state')
  const currState = currReactorState.get('state')

  // TODO(jordan): allow store define a comparator function
  function equals(a, b) {
    return Immutable.is(a, b)
  }

  let changedKeypaths = [];

  currReactorState.update('keypathStates', k => k.withMutations(keypathStates => {
    keypaths.forEach(keypath => {
      if (KeypathTracker.isClean(keypathStates, keypath)) {
        return
      }

      if (equals(prevState.getIn(keypath), currState.getIn(keypath))) {
        KeypathTracker.unchanged(keypathStates, keypath)
      } else {
        KeypathTracker.changed(keypathStates, keypath)
        changedKeypaths.push(keypath)
      }
    })

    if (cleanAll) {
      // TODO(jordan): this can probably be a single traversal
      KeypathTracker.incrementAndClean(keypathStates)
    }
  }))

  return changedKeypaths
}

/**
 * This function must be called with mutable reactorState for performance reasons
 * @param {ReactorState} reactorState
 * @param {KeyPath|Gettter} keyPathOrGetter
 * @return {*}
 */
export function evaluate(reactorState, keyPathOrGetter) {
  const state = reactorState.get('state')

  if (isKeyPath(keyPathOrGetter)) {
    // if its a keyPath simply return
    return state.getIn(keyPathOrGetter);
  } else if (!isGetter(keyPathOrGetter)) {
    throw new Error('evaluate must be passed a keyPath or Getter')
  }
  // Must be a Getter

  const cache = reactorState.get('cache')
  let cacheEntry = cache.lookup(keyPathOrGetter)
  const isCacheMiss = !cacheEntry || isDirtyCacheEntry(reactorState, cacheEntry)
  if (isCacheMiss) {
    cacheEntry = createCacheEntry(reactorState, keyPathOrGetter)
  }

  // TODO(jordan): respect the Getter's `shouldCache` setting
  reactorState.update('cache', cache => {
    return isCacheMiss
      ? cache.miss(keyPathOrGetter, cacheEntry)
      : cache.hit(keyPathOrGetter)
  })

  return cacheEntry.get('value')
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

export function getLoggerFunction(reactorState, fnName) {
  const logger = reactorState.get('logger')
  if (!logger) {
    return noop
  }
  const fn = logger[fnName]
  return (fn)
    ? fn.bind(logger)
    : noop
}

/**
 * @param {ReactorState} reactorState
 * @param {CacheEntry} cacheEntry
 * @return {boolean}
 */
function isDirtyCacheEntry(reactorState, cacheEntry) {
  if (reactorState.get('dispatchId') === cacheEntry.get('dispatchId')) {
    return false
  }

  const cacheStates = cacheEntry.get('states')
  const keypathStates = reactorState.get('keypathStates')

  return cacheEntry.get('states').some((value, keypath) => {
    return !KeypathTracker.isEqual(keypathStates, keypath, value)
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
  const args = getDeps(getter).reduce((memo, dep) => {
    memo.push(evaluate(reactorState, dep))
    return memo
  }, [])

  const value = getComputeFn(getter).apply(null, args)

  const maxCacheDepth = getOption(reactorState, 'maxCacheDepth')
  const keypathDeps = getCanonicalKeypathDeps(getter, maxCacheDepth)
  const keypathStates = reactorState.get('keypathStates')

  const cacheStates = Immutable.Map({}).withMutations(map => {
    keypathDeps.forEach(keypath => {
      const keypathState = KeypathTracker.get(keypathStates, keypath)
      // The -1 case happens when evaluating soemthing against a previous reactorState
      // where the getter's keypaths were never registered and the old keypathState is undefined
      // for particular keypaths, this shouldn't matter because we can cache hit by dispatchId
      map.set(keypath, keypathState ? keypathState : -1)
    })
  })

  return CacheEntry({
    value,
    states: cacheStates,
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

function noop() {}
