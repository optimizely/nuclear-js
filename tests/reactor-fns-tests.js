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
      const expected = new KeypathTracker.Node({
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
        const expected = new KeypathTracker.Node({
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
        const expected = new KeypathTracker.Node({
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
        const expected = new KeypathTracker.Node({
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
      const expected = new KeypathTracker.Node({
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
      const expected = new KeypathTracker.Node({
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

  describe('#addObserver', () => {
    let initialObserverState, nextObserverState, entry, handler, getter, nextReactorState

    describe('when observing the identity getter', () => {
      beforeEach(() => {
        getter = [[], x => x]
        handler = function() {}
        const reactorState = new ReactorState()

        initialObserverState = new ObserverState()
        const result = fns.addObserver(reactorState, initialObserverState, getter, handler)
        nextObserverState = result.observerState
        entry = result.entry
      })
      it('should properly update the observer state', () => {
        const expectedTrackedKeypaths = Set.of(List([]))
        expect(is(expectedTrackedKeypaths, nextObserverState.get('trackedKeypaths'))).toBe(true)

        const expectedObserversMap = Map().setIn(
          [toImmutable(getter), handler],
          Map({ getter, handler })
        )
        expect(is(expectedObserversMap, nextObserverState.get('observersMap'))).toBe(true)

        const expectedKeypathToEntries = Map([
          [toImmutable([]), Set.of(entry)]
        ])

        expect(is(expectedKeypathToEntries, nextObserverState.get('keypathToEntries'))).toBe(true)

        const expectedObservers = Set.of(entry)
        expect(is(expectedObservers, nextObserverState.get('observers'))).toBe(true)
      })
      it('should return a valid entry', () => {
        const expected = Map({
          getter: getter,
          handler: handler,
        })
        expect(is(expected, entry)).toBe(true)
      })
    })

    describe('when observing a store backed getter', () => {
      beforeEach(() => {
        getter = [
          ['store1', 'prop1', 'prop2', 'prop3'],
          ['store2'],
          (a, b) => a + b
        ]
        handler = function() {}

        const reactorState = new ReactorState()
        initialObserverState = new ObserverState()
        const result = fns.addObserver(reactorState, initialObserverState, getter, handler)
        nextObserverState = result.observerState
        entry = result.entry
      })
      it('should properly update the observer state', () => {
        const expectedTrackedKeypaths = Set.of(
          List(['store1', 'prop1', 'prop2']),
          List(['store2'])
        )
        expect(is(expectedTrackedKeypaths, nextObserverState.get('trackedKeypaths'))).toBe(true)

        const expectedObserversMap = Map().setIn(
          [toImmutable(getter), handler],
          Map({ getter, handler })
        )
        expect(is(expectedObserversMap, nextObserverState.get('observersMap'))).toBe(true)

        const expectedKeypathToEntries = Map([
          [toImmutable(['store1', 'prop1', 'prop2']), Set.of(entry)],
          [toImmutable(['store2']), Set.of(entry)],
        ])
        expect(is(expectedKeypathToEntries, nextObserverState.get('keypathToEntries'))).toBe(true)

        const expectedObservers = Set.of(entry)
        expect(is(expectedObservers, nextObserverState.get('observers'))).toBe(true)
      })
      it('should return a valid entry', () => {
        const expected = Map({
          getter: getter,
          handler: handler,
        })
        expect(is(expected, entry)).toBe(true)
      })
    })
  })

  describe('#removeObserver', () => {
    let reactorState, initialObserverState, nextObserverState, getter1, getter2, handler1, handler2, handler3

    beforeEach(() => {
      handler1 = () => 1
      handler2 = () => 2
      handler3 = () => 3

      getter1 = [
        ['store1', 'prop1', 'prop2', 'prop3'],
        ['store2'],
        (a, b) => a + b
      ]
      getter2 = [[], x => x]

      reactorState = new ReactorState()
      const initialObserverState1 = new ObserverState()
      const result1 = fns.addObserver(reactorState, initialObserverState1, getter1, handler1)
      const initialObserverState2 = result1.observerState
      const result2 = fns.addObserver(reactorState,initialObserverState2, getter1, handler2)
      const initialObserverState3 = result2.observerState
      const result3 = fns.addObserver(reactorState,initialObserverState3, getter2, handler3)
      initialObserverState = result3.observerState
    })

    describe('when removing by getter', () => {
      it('should return a new ObserverState with all entries containing the getter removed', () => {
        const result = fns.removeObserver(reactorState, initialObserverState, getter1)

        const expectedObserversMap = Map().setIn(
          [toImmutable(getter2), handler3],
          Map({ getter: getter2, handler: handler3 })
        )
        expect(is(expectedObserversMap, result.get('observersMap'))).toBe(true)

        const entry = Map({
          getter: getter2,
          handler: handler3,
        })
        const expectedKeypathToEntries = Map().set(toImmutable([]), Set.of(entry))
        expect(is(expectedKeypathToEntries, result.get('keypathToEntries'))).toBe(true)

        const expectedTrackedKeypaths = Set.of(toImmutable([]))
        expect(is(expectedTrackedKeypaths, result.get('trackedKeypaths'))).toBe(true)

        const expectedObservers = Set.of(entry)
        expect(is(expectedObservers, result.get('observers'))).toBe(true)
      })
    })

    describe('when removing by getter / handler', () => {
      it('should return a new ObserverState with all entries containing the getter removed', () => {
        const result = fns.removeObserver(reactorState, initialObserverState, getter1, handler1)

        const entry1 = Map({ getter: getter2, handler: handler3 })
        const entry2 = Map({ getter: getter1, handler: handler2 })
        const expectedObserversMap = Map()
          .setIn(
            [toImmutable(getter2), handler3],
            entry1
          )
          .setIn(
            [toImmutable(getter1), handler2],
            entry2
          )
        expect(is(expectedObserversMap, result.get('observersMap'))).toBe(true)

        const expectedKeypathToEntries = Map()
          .set(toImmutable(['store1', 'prop1', 'prop2']), Set.of(Map({ getter: getter1, handler: handler2 })))
          .set(toImmutable(['store2']), Set.of(Map({ getter: getter1, handler: handler2 })))
          .set(toImmutable([]), Set.of(Map({ getter: getter2, handler: handler3 })))
        expect(is(expectedKeypathToEntries, result.get('keypathToEntries'))).toBe(true)

        const expectedTrackedKeypaths = Set.of(
          toImmutable([]),
          toImmutable(['store1', 'prop1', 'prop2']),
          toImmutable(['store2'])
        )
        expect(is(expectedTrackedKeypaths, result.get('trackedKeypaths'))).toBe(true)

        const expectedObservers = Set.of(entry1, entry2)
        expect(is(expectedObservers, result.get('observers'))).toBe(true)
      })
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
