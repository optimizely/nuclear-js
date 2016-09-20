import Immutable from 'immutable'
import { CacheEntry } from './cache'
import { isImmutableValue } from '../immutable-helpers'
import { toImmutable } from '../immutable-helpers'
import { fromKeyPath, getStoreDeps, getComputeFn, getDeps, isGetter, getCanonicalKeypathDeps } from '../getter'
import { isEqual, isKeyPath } from '../key-path'
import * as KeypathTracker from './keypath-tracker'
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
    .update('keypathStates', k => k.withMutations(keypathStates => {
      dirtyStoresSet.forEach(storeId => {
        KeypathTracker.changed(keypathStates, [storeId])
      })
    }))
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
 * @param {ObserverState} observerState
 * @param {KeyPath|Getter} getter
 * @param {function} handler
 * @return {ObserveResult}
 */
export function addObserver(reactorState, observerState, getter, handler) {
  // use the passed in getter as the key so we can rely on a byreference call for unobserve
  const rawGetter = getter
  if (isKeyPath(getter)) {
    getter = fromKeyPath(getter)
  }

  const maxCacheDepth = getOption(reactorState, 'maxCacheDepth')
  const keypathDeps = getCanonicalKeypathDeps(getter, maxCacheDepth)
  const entry = Immutable.Map({
    getter: getter,
    handler: handler,
  })

  let updatedObserverState = observerState.withMutations(map => {
    keypathDeps.forEach(keypath => {
      map.updateIn(['keypathToEntries', keypath], entries => {
        return (entries)
          ? entries.add(entry)
          : Immutable.Set().add(entry)
      })
    })
  })

  const getterKey = createGetterKey(getter);

  const finalObserverState = updatedObserverState
    .update('trackedKeypaths', keypaths => keypaths.union(keypathDeps))
    .setIn(['observersMap', getterKey, handler], entry)
    .update('observers', observers => observers.add(entry))

  return {
    observerState: finalObserverState,
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
export function removeObserver(reactorState, observerState, getter, handler) {
  if (isKeyPath(getter)) {
    getter = fromKeyPath(getter)
  }
  let entriesToRemove;
  const getterKey = createGetterKey(getter)
  const maxCacheDepth = getOption(reactorState, 'maxCacheDepth')
  const keypathDeps = getCanonicalKeypathDeps(getter, maxCacheDepth)

  if (handler) {
    entriesToRemove = Immutable.List([
      observerState.getIn(['observersMap', getterKey, handler]),
    ])
  } else {
    entriesToRemove = observerState.getIn(['observersMap', getterKey], Immutable.Map({})).toList()
  }

  return observerState.withMutations(map => {
    entriesToRemove.forEach(entry => removeObserverByEntry(reactorState, map, entry, keypathDeps))
  })
}

/**
 * Removes an observer entry by id from the observerState
 * @param {ObserverState} observerState
 * @param {Immutable.Map} entry
 * @return {ObserverState}
 */
export function removeObserverByEntry(reactorState, observerState, entry, keypathDeps = null) {
  return observerState.withMutations(map => {
    const getter = entry.get('getter')
    if (!keypathDeps) {
      const maxCacheDepth = getOption(reactorState, 'maxCacheDepth')
      keypathDeps = getCanonicalKeypathDeps(getter, maxCacheDepth)
    }

    map.update('observers', observers => observers.remove(entry))

    // update the keypathToEntries
    keypathDeps.forEach(keypath => {
      const kp = ['keypathToEntries', keypath]
      map.updateIn(kp, entries => {
        // check for observers being present because reactor.reset() can be called before an unwatch fn
        return (entries)
          ? entries.remove(entry)
          : entries
      })
      // protect against unwatch after reset
      if (map.hasIn(kp) &&
          map.getIn(kp).size === 0) {
        map.removeIn(kp)
        map.update('trackedKeypaths', keypaths => keypaths.remove(keypath))
      }
    })

    // remove entry from observersMap
    const getterKey = createGetterKey(getter)
    const handler = entry.get('handler')
    map.removeIn(['observersMap', getterKey, handler])
    // protect against unwatch after reset
    if (map.hasIn(['observersMap', getterKey]) &&
        map.getIn(['observersMap', getterKey]).size === 0) {
      map.removeIn(['observersMap', getterKey])
    }
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

    reactorState.update('keypathStates', k => k.withMutations(keypathStates => {
      storeIds.forEach(id => {
        KeypathTracker.changed(keypathStates, [id])
      })
    }))
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

  const newReactorState = currReactorState.update('keypathStates', k => k.withMutations(keypathStates => {
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

  return {
    changedKeypaths,
    reactorState: newReactorState,
  }
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
  let cacheEntry = cache.lookup(keyPathOrGetter)
  const isCacheMiss = !cacheEntry || isDirtyCacheEntry(reactorState, cacheEntry)
  if (isCacheMiss) {
    const cacheResult = createCacheEntry(reactorState, keyPathOrGetter)
    cacheEntry = cacheResult.entry
    reactorState = cacheResult.reactorState
  }

  return evaluateResult(
    cacheEntry.get('value'),
    reactorState.update('cache', cache => {
      return isCacheMiss
        ? cache.miss(keyPathOrGetter, cacheEntry)
        : cache.hit(keyPathOrGetter)
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
 * Creates an immutable key for a getter
 * @param {Getter} getter
 * @return {Immutable.List}
 */
function createGetterKey(getter) {
  return toImmutable(getter)
}

/**
 * Evaluates getter for given reactorState and returns CacheEntry
 * @param {ReactorState} reactorState
 * @param {Getter} getter
 * @return {CacheEntry}
 */
function createCacheEntry(reactorState, getter) {
  // evaluate dependencies
  const initial = {
    reactorState: reactorState,
    args: [],
  }
  // reduce here and capture updates to the ReactorState
  const argResults = getDeps(getter).reduce((memo, dep) => {
    const evaluateResult = evaluate(memo.reactorState, dep)
    return {
      reactorState: evaluateResult.get('reactorState'),
      args: memo.args.concat(evaluateResult.get('result')),
    }
  }, initial)
  const args = argResults.args
  const newReactorState = argResults.reactorState

  const value = getComputeFn(getter).apply(null, args)

  const maxCacheDepth = getOption(reactorState, 'maxCacheDepth')
  const keypathDeps = getCanonicalKeypathDeps(getter, maxCacheDepth)
  const keypathStates = reactorState.get('keypathStates')

  const cacheStates = toImmutable({}).withMutations(map => {
    keypathDeps.forEach(keypath => {
      const keypathState = KeypathTracker.get(keypathStates, keypath)
      // The -1 case happens when evaluating soemthing against a previous reactorState
      // where the getter's keypaths were never registered and the old keypathState is undefined
      // for particular keypaths, this shouldn't matter because we can cache hit by dispatchId
      map.set(keypath, keypathState ? keypathState : -1)
    })
  })

  return {
    reactorState: newReactorState,
    entry: CacheEntry({
      value: value,
      states: cacheStates,
      dispatchId: reactorState.get('dispatchId'),
    })
  }
}

/**
 * @param {ReactorState} reactorState
 * @return {ReactorState}
 */
function incrementId(reactorState) {
  return reactorState.update('dispatchId', id => id + 1)
}

function noop() {}
