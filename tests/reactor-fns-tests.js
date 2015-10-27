/*eslint-disable one-var, comma-dangle*/
import { Map, Set, is } from 'immutable'
import { Store } from '../src/main'
import fns from '../src/reactor/fns'
import { ReactorState, ObserverState } from '../src/reactor/records'
import { toImmutable } from '../src/immutable-helpers'

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

    it('should update reactorState.dirtyStores', () => {
      const result = nextReactorState.get('dirtyStores')
      const expected = Set.of('store1', 'store2')
      expect(is(result, expected)).toBe(true)
    })

    it('should update reactorState.dirtyStores', () => {
      const result = nextReactorState.get('storeStates')
      const expected = Map({
        store1: 1,
        store2: 1,
      })
      expect(is(result, expected)).toBe(true)
    })

    it('should increment reactorState.dispatchId', () => {
      const result = nextReactorState.get('dispatchId')
      const expected = 1
      expect(result).toBe(expected)
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

      initialReactorState = fns.resetDirtyStores(
        fns.registerStores(reactorState, { store1, store2 })
      )
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

      it('should update dirtyStores', () => {
        const result = nextReactorState.get('dirtyStores')
        const expected = Set.of('store2')
        expect(is(result, expected)).toBe(true)
      })

      it('should update storeStates', () => {
        const result = nextReactorState.get('storeStates')
        const expected = Map({
          store1: 1,
          store2: 2,
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

      it('should not update dirtyStores', () => {
        const result = nextReactorState.get('dirtyStores')
        const expected = Set()
        expect(is(result, expected)).toBe(true)
      })

      it('should not update storeStates', () => {
        const result = nextReactorState.get('storeStates')
        const expected = Map({
          store1: 1,
          store2: 1,
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

      initialReactorState = fns.resetDirtyStores(
        fns.registerStores(reactorState, { store1, store2 })
      )

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

    it('should update dirtyStores', () => {
      const result = nextReactorState.get('dirtyStores')
      const expected = Set.of('store1')
      expect(is(expected, result)).toBe(true)
    })

    it('should update storeStates', () => {
      const result = nextReactorState.get('storeStates')
      const expected = Map({
        store1: 2,
        store2: 1,
      })
      expect(is(expected, result)).toBe(true)
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

      initialReactorState = fns.resetDirtyStores(
        fns.registerStores(reactorState, { store1, store2, })
      )

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

    it('should reset dirtyStores', () => {
      const result = nextReactorState.get('dirtyStores')
      const expected = Set()
      expect(is(expected, result)).toBe(true)
    })

    it('should update storeStates', () => {
      const result = nextReactorState.get('storeStates')
      const expected = Map({
        store1: 3,
        store2: 2,
      })
      expect(is(expected, result)).toBe(true)
    })
  })

  describe('#addObserver', () => {
    let initialObserverState, nextObserverState, entry, handler, getter

    describe('when observing the identity getter', () => {
      beforeEach(() => {
        getter = [[], x => x]
        handler = function() {}

        initialObserverState = new ObserverState()
        const result = fns.addObserver(initialObserverState, getter, handler)
        nextObserverState = result.observerState
        entry = result.entry

      })
      it('should update the "any" observers', () => {
        const expected = Set.of(1)
        const result = nextObserverState.get('any')
        expect(is(expected, result)).toBe(true)
      })
      it('should not update the "store" observers', () => {
        const expected = Map({})
        const result = nextObserverState.get('stores')
        expect(is(expected, result)).toBe(true)
      })
      it('should increment the nextId', () => {
        const expected = 2
        const result = nextObserverState.get('nextId')
        expect(is(expected, result)).toBe(true)
      })
      it('should update the observerMap', () => {
        const expected = Map([
          [1, Map({
            id: 1,
            storeDeps: Set(),
            getterKey: getter,
            getter: getter,
            handler: handler,
          })],
        ])
        const result = nextObserverState.get('observersMap')
        expect(is(expected, result)).toBe(true)
      })
      it('should return a valid entry', () => {
        const expected = Map({
          id: 1,
          storeDeps: Set(),
          getterKey: getter,
          getter: getter,
          handler: handler,
        })
        expect(is(expected, entry)).toBe(true)
      })
    })

    describe('when observing a store backed getter', () => {
      beforeEach(() => {
        getter = [
          ['store1'],
          ['store2'],
          (a, b) => a + b
        ]
        handler = function() {}

        initialObserverState = new ObserverState()
        const result = fns.addObserver(initialObserverState, getter, handler)
        nextObserverState = result.observerState
        entry = result.entry
      })
      it('should not update the "any" observers', () => {
        const expected = Set.of()
        const result = nextObserverState.get('any')
        expect(is(expected, result)).toBe(true)
      })
      it('should not update the "store" observers', () => {
        const expected = Map({
          store1: Set.of(1),
          store2: Set.of(1),
        })

        const result = nextObserverState.get('stores')
        expect(is(expected, result)).toBe(true)
      })
      it('should increment the nextId', () => {
        const expected = 2
        const result = nextObserverState.get('nextId')
        expect(is(expected, result)).toBe(true)
      })
      it('should update the observerMap', () => {
        const expected = Map([
          [1, Map({
            id: 1,
            storeDeps: Set.of('store1', 'store2'),
            getterKey: getter,
            getter: getter,
            handler: handler,
          })]
        ])
        const result = nextObserverState.get('observersMap')
        expect(is(expected, result)).toBe(true)
      })
      it('should return a valid entry', () => {
        const expected = Map({
          id: 1,
          storeDeps: Set.of('store1', 'store2'),
          getterKey: getter,
          getter: getter,
          handler: handler,
        })
        expect(is(expected, entry)).toBe(true)
      })
    })
  })

  describe('#removeObserver', () => {
    let initialObserverState, nextObserverState, getter1, getter2, handler1, handler2, handler3

    beforeEach(() => {
      handler1 = () => 1
      handler2 = () => 2
      handler3 = () => 3

      getter1 = [
        ['store1'],
        ['store2'],
        (a, b) => a + b
      ]
      getter2 = [[], x => x]

      const initialObserverState1 = new ObserverState()
      const result1 = fns.addObserver(initialObserverState1, getter1, handler1)
      const initialObserverState2 = result1.observerState
      const result2 = fns.addObserver(initialObserverState2, getter1, handler2)
      const initialObserverState3 = result2.observerState
      const result3 = fns.addObserver(initialObserverState3, getter2, handler3)
      initialObserverState = result3.observerState
    })

    describe('when removing by getter', () => {
      it('should return a new ObserverState with all entries containing the getter removed', () => {
        nextObserverState = fns.removeObserver(initialObserverState, getter1)
        const expected = Map({
          any: Set.of(3),
          stores: Map({
            store1: Set(),
            store2: Set(),
          }),
          nextId: 4,
          observersMap: Map([
            [3, Map({
              id: 3,
              storeDeps: Set(),
              getterKey: getter2,
              getter: getter2,
              handler: handler3,
            })]
          ])
        })
        const result = nextObserverState
        expect(is(expected, result)).toBe(true)
      })
    })

    describe('when removing by getter / handler', () => {
      it('should return a new ObserverState with all entries containing the getter removed', () => {
        nextObserverState = fns.removeObserver(initialObserverState, getter2, handler3)
        const expected = Map({
          any: Set(),
          stores: Map({
            store1: Set.of(1, 2),
            store2: Set.of(1, 2),
          }),
          nextId: 4,
          observersMap: Map([
            [1, Map({
              id: 1,
              storeDeps: Set.of('store1', 'store2'),
              getterKey: getter1,
              getter: getter1,
              handler: handler1,
            })],
            [2, Map({
              id: 2,
              storeDeps: Set.of('store1', 'store2'),
              getterKey: getter1,
              getter: getter1,
              handler: handler2,
            })]
          ])
        })
        const result = nextObserverState
        expect(is(expected, result)).toBe(true)
      })
    })
  })
})
/*eslint-enable one-var, comma-dangle*/
