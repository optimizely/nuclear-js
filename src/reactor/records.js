import { Map, Set, Record, OrderedMap } from 'immutable'

export const PROD_OPTIONS = Map({
  // logs information for each dispatch
  logDispatches: false,
  // log the entire app state after each dispatch
  logAppState: false,
  // logs what stores changed after a dispatch
  logDirtyStores: false,
  // if true, throws an error when dispatching an `undefined` actionType
  throwOnUndefinedActionType: false,
  // if true, throws an error if a store returns undefined
  throwOnUndefinedStoreReturnValue: false,
  // if true, throws an error if a store.getInitialState() returns a non immutable value
  throwOnNonImmutableStore: false,
  // if true, throws when dispatching in dispatch
  throwOnDispatchInDispatch: false,
})

export const DEBUG_OPTIONS = Map({
  // logs information for each dispatch
  logDispatches: true,
  // log the entire app state after each dispatch
  logAppState: true,
  // logs what stores changed after a dispatch
  logDirtyStores: true,
  // if true, throws an error when dispatching an `undefined` actionType
  throwOnUndefinedActionType: true,
  // if true, throws an error if a store returns undefined
  throwOnUndefinedStoreReturnValue: true,
  // if true, throws an error if a store.getInitialState() returns a non immutable value
  throwOnNonImmutableStore: true,
  // if true, throws when dispatching in dispatch
  throwOnDispatchInDispatch: true,
})

export const ReactorState = Record({
  dispatchId: 0,
  state: Map(),
  stores: Map(),
  cache: Map(),
  cacheRecency: OrderedMap(),
  // maintains a mapping of storeId => state id (monotomically increasing integer whenever store state changes)
  storeStates: Map(),
  dirtyStores: Set(),
  debug: false,
  maxItemsToCache: null,
  // production defaults
  options: PROD_OPTIONS,
  useCache: true,
})

export const ObserverState = Record({
  // observers registered to any store change
  any: Set(),
  // observers registered to specific store changes
  stores: Map({}),

  observersMap: Map({}),

  nextId: 1,
})
