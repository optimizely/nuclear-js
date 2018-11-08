import { Map, List, Set } from 'immutable'
import { getOption } from './fns'
import { fromKeyPath, getDeps, isGetter, getCanonicalKeypathDeps } from '../getter'
import { toImmutable } from '../immutable-helpers'
import { isKeyPath } from '../key-path'

export default class ObserverState {
  constructor() {
    /*
    {
      <Keypath>: Set<ObserverEntry>
    }
    */
    this.keypathToEntries = Map({}).asMutable()

    /*
    {
      <GetterKey>: {
        <handler>: <ObserverEntry>
      }
    }
    */
    this.observersMap = Map({}).asMutable()

    this.trackedKeypaths = Set().asMutable()

    // keep a flat set of observers to know when one is removed during a handler
    this.observers = Set().asMutable()
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
  addObserver(reactorState, getter, handler) {
    // use the passed in getter as the key so we can rely on a byreference call for unobserve
    const rawGetter = getter
    if (isKeyPath(getter)) {
      // TODO(jordan): add a `dontCache` flag here so we dont waste caching overhead on simple keypath lookups
      getter = fromKeyPath(getter)
    }

    const maxCacheDepth = getOption(reactorState, 'maxCacheDepth')
    const keypathDeps = getCanonicalKeypathDeps(getter, maxCacheDepth)
    const entry = Map({
      getter: getter,
      handler: handler,
    })

    keypathDeps.forEach(keypath => {
      if (!this.keypathToEntries.has(keypath)) {
        this.keypathToEntries.set(keypath, Set().asMutable().add(entry))
      } else {
        this.keypathToEntries.get(keypath).add(entry)
      }
    })

    const getterKey = createGetterKey(getter);

    // union doesn't work with asMutable
    this.trackedKeypaths = this.trackedKeypaths.union(keypathDeps)
    this.observersMap.setIn([getterKey, handler], entry)
    this.observers.add(entry)

    return entry
  }

  /**
   * Use cases
   * removeObserver(observerState, [])
   * removeObserver(observerState, [], handler)
   * removeObserver(observerState, ['keyPath'])
   * removeObserver(observerState, ['keyPath'], handler)
   * removeObserver(observerState, getter)
   * removeObserver(observerState, getter, handler)
   * @param {ReactorState} reactorState
   * @param {KeyPath|Getter} getter
   * @param {Function} handler
   * @return {ObserverState}
   */
  removeObserver(reactorState, getter, handler) {
    if (isKeyPath(getter)) {
      getter = fromKeyPath(getter)
    }
    let entriesToRemove;
    const getterKey = createGetterKey(getter)
    const maxCacheDepth = getOption(reactorState, 'maxCacheDepth')
    const keypathDeps = getCanonicalKeypathDeps(getter, maxCacheDepth)

    if (handler) {
      entriesToRemove = List([
        this.observersMap.getIn([getterKey, handler]),
      ])
    } else {
      entriesToRemove = this.observersMap.get(getterKey, Map({})).toList()
    }

    entriesToRemove.forEach(entry => {
      this.removeObserverByEntry(reactorState, entry, keypathDeps)
    })
  }

  /**
   * Removes an observer entry
   * @param {ReactorState} reactorState
   * @param {Immutable.Map} entry
   * @param {Immutable.List|null} keypathDeps
   * @return {ObserverState}
   */
  removeObserverByEntry(reactorState, entry, keypathDeps = null) {
    const getter = entry.get('getter')
    if (!keypathDeps) {
      const maxCacheDepth = getOption(reactorState, 'maxCacheDepth')
      keypathDeps = getCanonicalKeypathDeps(getter, maxCacheDepth)
    }

    this.observers.remove(entry)

    // update the keypathToEntries
    keypathDeps.forEach(keypath => {
      const entries = this.keypathToEntries.get(keypath)

      if (entries) {
        // check for observers being present because reactor.reset() can be called before an unwatch fn
        entries.remove(entry)
        if (entries.size === 0) {
          this.keypathToEntries.remove(keypath)
          this.trackedKeypaths.remove(keypath)
        }
      }
    })

    // remove entry from observersobserverState
    const getterKey = createGetterKey(getter)
    const handler = entry.get('handler')

    this.observersMap.removeIn([getterKey, handler])
    // protect against unwatch after reset
    if (this.observersMap.has(getterKey) &&
        this.observersMap.get(getterKey).size === 0) {
      this.observersMap.remove(getterKey)
    }
  }

  getTrackedKeypaths() {
    return this.trackedKeypaths.asImmutable()
  }

  /**
   * @param {Immutable.List} changedKeypaths
   * @return {Entries[]}
   */
  getObserversToNotify(changedKeypaths) {
    return Set().withMutations(set => {
      changedKeypaths.forEach(keypath => {
        const entries = this.keypathToEntries.get(keypath)
        if (entries && entries.size > 0) {
          set.union(entries)
        }
      })
    })
  }

  hasObserver(observer) {
    return this.observers.has(observer)
  }
}

/**
 * Creates an immutable key for a getter
 * @param {Getter} getter
 * @return {Immutable.List}
 */
function createGetterKey(getter) {
  return toImmutable(getter)
}
