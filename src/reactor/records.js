import { Map, Set, Record } from 'immutable'

export const ReactorState = Record({
  dispatchId: 0,
  state: Map(),
  stores: Map(),
  cache: Map(),
  // maintains a mapping of storeId => state id (monotomically increasing integer whenever store state changes)
  storeStates: Map(),
  dirtyStores: Set(),
  debug: false,
  // production defaults
  options: Map({}),
})

export const ObserverState = Record({
  // observers registered to any store change
  any: Set(),
  // observers registered to specific store changes
  stores: Map({}),

  observersMap: Map({}),

  nextId: 1,
})

export const DEBUG_OPTIONS = Map({
  // logs information for each dispatch
  logDispatches: true,
  // log the entire app state after each dispatch
  logAppState: true,
  // logs what stores changed after a dispatch
  logDirtyStores: true,
  // if false, throw an error if a store returns undefined
  allowUndefinedDispatch: false,
  // if false, throw an error if a store returns undefined
  allowNonImmutableStores: false,
  // if false throw when dispatching in dispatch
  allowDispatchInDispatch: false,
})

export const PROD_OPTIONS = Map({
  // logs information for each dispatch
  logDispatches: false,
  // log the entire app state after each dispatch
  logAppState: false,
  // logs what stores changed after a dispatch
  logDirtyStores: false,
  // if false, throw an error if a store returns undefined
  allowUndefinedDispatch: true,
  // if false, throw an error if a store returns undefined
  allowNonImmutableStores: true,
  // if false throw when dispatching in dispatch
  allowDispatchInDispatch: true,
})
