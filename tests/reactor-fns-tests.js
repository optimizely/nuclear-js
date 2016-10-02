/*eslint-disable one-var, comma-dangle*/
import { Map, Set, OrderedSet, List, is } from 'immutable'
import { Store } from '../src/main'
import * as fns from '../src/reactor/fns'
import * as KeypathTracker from '../src/reactor/keypath-tracker'
import { ReactorState, ObserverState } from '../src/reactor/records'
import { toImmutable } from '../src/immutable-helpers'

const status = KeypathTracker.status

describe('reactor fns', () => {
  describe('#registerStores', () => {
    let reactorState
    let store1
    let store2
    let nextReactorState

    beforeEach(() => {
      reactorState = new ReactorState()
      store1 = new Store({
        getInitialState() {
          return toImmutable({
            foo: 'bar',
          })
        },
      })
      store2 = new Store({
        getInitialState() {
          return 2
        },
      })

      nextReactorState = fns.registerStores(reactorState, {
        store1,
        store2,
      })
    })

    it('should update reactorState.stores', () => {
      const expectedStores = Map({
        store1,
        store2,
      })
      expect(is(nextReactorState.get('stores'), expectedStores)).toBe(true)
    })

    it('should update reactorState.state with the store initial state', () => {
      const result = nextReactorState.get('state')
      const expected = Map({
        store1: Map({
          foo: 'bar',
        }),
        store2: 2,
      })
      expect(is(result, expected)).toBe(true)
    })

    it('should update keypathStates', () => {
      const result = nextReactorState.get('keypathStates')
      const expected = new KeypathTracker.RootNode({
        changedPaths: Set.of(List(['store1']), List(['store2'])),
        state: 3,
        status: status.DIRTY,
        children: toImmutable({
          store1: {
            state: 1,
            status: status.DIRTY,
            children: {},
          },
          store2: {
            state: 1,
            status: status.DIRTY,
            children: {},
          },
        }),
      })
      expect(is(result, expected)).toBe(true)
    })

    it('should increment reactorState.dispatchId', () => {
      const result = nextReactorState.get('dispatchId')
      const expected = 1
      expect(result).toBe(expected)
    })
  })

  describe('#replaceStores', () => {
    let reactorState
    let store1
    let store2
    let newStore1
    let originalReactorState
    let nextReactorState

    beforeEach(() => {
      reactorState = new ReactorState()
      store1 = new Store({
        getInitialState() {
          return toImmutable({
            foo: 'bar',
          })
        },
      })
      store2 = new Store({
        getInitialState() {
          return 2
        },
      })

      newStore1 = new Store({
        getInitialState() {
          return toImmutable({
            foo: 'newstore',
          })
        },
      })

      originalReactorState = fns.registerStores(reactorState, {
        store1,
        store2,
      })

      nextReactorState = fns.replaceStores(originalReactorState, {
        store1: newStore1
      })
    })

    it('should update reactorState.stores', () => {
      const expectedReactorState = originalReactorState.set('stores', Map({
        store1: newStore1,
        store2: store2,
      }))
      expect(is(nextReactorState, expectedReactorState)).toBe(true)
    })
  })

  describe('#dispatch', () => {
    let initialReactorState, store1, store2
    let nextReactorState

    beforeEach(() => {
      const reactorState = new ReactorState()
      store1 = new Store({
        getInitialState() {
          return toImmutable({
            foo: 'bar',
          })
        },
        initialize() {
          this.on('set1', (state, payload) => state.set('foo', payload))
        },
      })
      store2 = new Store({
        getInitialState() {
          return 2
        },
        initialize() {
          this.on('set2', (state, payload) => payload)
        },
      })

      initialReactorState = fns.registerStores(reactorState, { store1, store2 })
          .update('keypathStates', KeypathTracker.incrementAndClean)
    })

    describe('when dispatching an action that updates 1 store', () => {
      beforeEach(() => {
        nextReactorState = fns.dispatch(initialReactorState, 'set2', 3)
      })

      it('should increment reactorState.dispatchId', () => {
        const result = nextReactorState.get('dispatchId')
        const expected = 2
        expect(result).toBe(expected)
      })

      it('should update state', () => {
        const result = nextReactorState.get('state')
        const expected = Map({
          store1: Map({
            foo: 'bar',
          }),
          store2: 3,
        })
        expect(is(result, expected)).toBe(true)
      })

      it('should update keypathStates', () => {
        const result = nextReactorState.get('keypathStates')
        const expected = new KeypathTracker.RootNode({
          changedPaths: Set.of(List(['store2'])),
          state: 4,
          status: status.DIRTY,
          children: toImmutable({
            store1: {
              state: 1,
              status: status.CLEAN,
              children: {},
            },
            store2: {
              state: 2,
              status: status.DIRTY,
              children: {},
            },
          }),
        })

        expect(is(result, expected)).toBe(true)
      })
    })

    describe('when dispatching an action that doesn\'t update stores', () => {
      beforeEach(() => {
        nextReactorState = fns.dispatch(initialReactorState, 'noop', {})
      })

      it('should not increment reactorState.dispatchId', () => {
        const result = nextReactorState.get('dispatchId')
        const expected = 2
        expect(result).toBe(expected)
      })

      it('should not update state', () => {
        const result = nextReactorState.get('state')
        const expected = Map({
          store1: Map({
            foo: 'bar',
          }),
          store2: 2,
        })
        expect(is(result, expected)).toBe(true)
      })

      it('should update keypathStates', () => {
        const result = nextReactorState.get('keypathStates')
        const expected = new KeypathTracker.RootNode({
          state: 3,
          status: status.CLEAN,
          children: toImmutable({
            store1: {
              state: 1,
              status: status.CLEAN,
              children: {},
            },
            store2: {
              state: 1,
              status: status.CLEAN,
              children: {},
            },
          }),
        })
        expect(is(result, expected)).toBe(true)
      })
    })

    describe('when a deep keypathState exists and dispatching an action that changes non-leaf node', () => {
      beforeEach(() => {
        // add store2, prop1, prop2 entries to the keypath state
        // this is similiar to someone observing this keypath before it's defined
        const newReactorState = initialReactorState.update('keypathStates', k => {
          return KeypathTracker.unchanged(k, ['store2', 'prop1', 'prop2'])
        })
        nextReactorState = fns.dispatch(newReactorState, 'set2', 3)
      })

      it('should update keypathStates', () => {
        const result = nextReactorState.get('keypathStates')
        const expected = new KeypathTracker.RootNode({
          changedPaths: Set.of(List(['store2'])),
          state: 4,
          status: status.DIRTY,
          children: toImmutable({
            store1: {
              state: 1,
              status: status.CLEAN,
              children: {},
            },
            store2: {
              state: 2,
              status: status.DIRTY,
              children: {
                prop1: {
                  state: 1,
                  status: status.UNKNOWN,
                  children: {
                    prop2: {
                      state: 1,
                      status: status.UNKNOWN,
                      children: {},
                    },
                  },
                },
              },
            },
          }),
        })
        expect(is(result, expected)).toBe(true)
      })
    })
  })

  describe('#loadState', () => {
    let initialReactorState, nextReactorState, store1, store2

    beforeEach(() => {
      const stateToLoad = {
        store1: {
          foo: 'baz',
        },
        // invalid storekey -> ignore
        store3: 'wtf',
      }

      const reactorState = new ReactorState()
      store1 = new Store({
        getInitialState() {
          return toImmutable({
            foo: 'bar',
          })
        },

        deserialize(state) {
          return toImmutable(state)
        },
      })
      store2 = new Store({
        getInitialState() {
          return 2
        },
      })

      initialReactorState = fns.registerStores(reactorState, { store1, store2 })
        .update('keypathStates', KeypathTracker.incrementAndClean)

      nextReactorState = fns.loadState(initialReactorState, stateToLoad)
    })

    it('should update state', () => {
      const result = nextReactorState.get('state')
      const expected = Map({
        store1: Map({
          foo: 'baz',
        }),
        store2: 2,
      })
      expect(is(expected, result)).toBe(true)
    })

    it('should update keypathStates', () => {
      const result = nextReactorState.get('keypathStates')
      const expected = new KeypathTracker.RootNode({
        changedPaths: Set.of(List(['store1'])),
        state: 4,
        status: status.DIRTY,
        children: toImmutable({
          store1: {
            state: 2,
            status: status.DIRTY,
            children: {},
          },
          store2: {
            state: 1,
            status: status.CLEAN,
            children: {},
          },
        }),
      })
      expect(is(result, expected)).toBe(true)
    })

  })

  describe('#reset', () => {
    let initialReactorState, nextReactorState, store1, store2

    beforeEach(() => {
      const reactorState = new ReactorState()
      store1 = new Store({
        getInitialState() {
          return toImmutable({
            foo: 'bar',
          })
        },
        initialize() {
          this.on('set1', (state, payload) => state.set('foo', payload))
        },
      })
      store2 = new Store({
        getInitialState() {
          return 2
        },
        handleReset() {
          // override reset method and return different value
          return 3
        },
      })

      initialReactorState = fns.registerStores(reactorState, { store1, store2, })
        .update('keypathStates', KeypathTracker.incrementAndClean)

      // perform a dispatch then reset
      nextReactorState = fns.reset(
        fns.dispatch(initialReactorState, 'set1', 'baz')
      )
    })

    it('should return state back to its reset value', () => {
      const result = nextReactorState.get('state')
      const expected = Map({
        store1: Map({
          foo: 'bar',
        }),
        store2: 3,
      })
      expect(is(expected, result)).toBe(true)
    })

    it('should update keypathStates', () => {
      const result = nextReactorState.get('keypathStates')
      const expected = new KeypathTracker.RootNode({
        changedPaths: Set.of(List(['store1']), List(['store2'])),
        state: 6,
        status: status.DIRTY,
        children: toImmutable({
          store1: {
            state: 3,
            status: status.DIRTY,
            children: {},
          },
          store2: {
            state: 2,
            status: status.DIRTY,
            children: {},
          },
        }),
      })
      expect(is(result, expected)).toBe(true)
    })
  })

  describe('#getDebugOption', () => {
    it('should parse the option value in a reactorState', () => {
      const reactorState = new ReactorState({
        options: Map({
          throwOnUndefinedDispatch: true,
        }),
      })

      const result = fns.getOption(reactorState, 'throwOnUndefinedDispatch')
      expect(result).toBe(true)
    })

    it('should throw an error if the option doesn\'t', () => {
      const reactorState = new ReactorState({
        options: Map({
          throwOnUndefinedDispatch: true,
        }),
      })

      expect(function() {
        fns.getOption(reactorState, 'unknownOption')
      }).toThrow()
    })
  })
})
/*eslint-enable one-var, comma-dangle*/
