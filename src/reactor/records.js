import Immutable from 'immutable'

const ReactorState = Immutable.Record({
  dispatchId: 0,
  state: Immutable.Map(),
  stores: Immutable.Map(),
  cache: Immutable.Map(),
  dirtyStores: Immutable.Set(),
  debug: false,
})

const ObserverStoreMap = Immutable.Record({
  // observers registered to any store change
  any: Immutable.Map({}),
  // observers registered to specific store changes
  stores: Immutable.Map({}),

  observersMap: Immutable.Map({}),

  nextId: 1,
})

export {
  ReactorState,
  ObserverStoreMap,
}
