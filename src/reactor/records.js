import Immutable from 'immutable'

const ReactorState = Immutable.Record({
  dispatchId: 0,
  state: Immutable.Map(),
  stores: Immutable.Map(),
  cache: Immutable.Map(),
  // maintains a mapping of storeId => state id (monotomically increasing integer whenever store state changes)
  storeStates: Immutable.Map(),
  dirtyStores: Immutable.Set(),
  debug: false,
})

const ObserverState = Immutable.Record({
  // getters registered to any store change
  any: Immutable.Set([]),
  // getters registered to specific store changes
  stores: Immutable.Map({}),

  gettersMap: Immutable.Map({}),

  observersMap: Immutable.Map({}),

  nextId: 1,
})

export default {
  ReactorState,
  ObserverState,
}
