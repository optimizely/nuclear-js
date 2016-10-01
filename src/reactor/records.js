import { Map, Set, Record } from 'immutable'
import { DefaultCache } from './cache'
import { RootNode as KeypathTrackerNode } from './keypath-tracker'

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
  // how many levels deep should getter keypath dirty states be tracked
  maxCacheDepth: 3,
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
  // how many levels deep should getter keypath dirty states be tracked
  maxCacheDepth: 3,
})

export const ReactorState = Record({
  dispatchId: 0,
  state: Map(),
  stores: Map(),
  cache: DefaultCache(),
  logger: {},
  keypathStates: new KeypathTrackerNode(),
  debug: false,
  // production defaults
  options: PROD_OPTIONS,
})

export const ObserverState = Record({
  /*
  {
    <Keypath>: Set<ObserverEntry>
  }
  */
  keypathToEntries: Map({}).asMutable(),

  /*
  {
    <GetterKey>: {
      <handler>: <ObserverEntry>
    }
  }
  */
  observersMap: Map({}).asMutable(),

  trackedKeypaths: Set().asMutable(),

  // keep a flat set of observers to know when one is removed during a handler
  observers: Set().asMutable(),
})

