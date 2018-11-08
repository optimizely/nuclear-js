/*eslint-disable one-var, comma-dangle*/
import { Map, Set, OrderedSet, List, is } from 'immutable'
import { Store } from '../src/main'
import * as fns from '../src/reactor/fns'
import * as KeypathTracker from '../src/reactor/keypath-tracker'
import { ReactorState } from '../src/reactor/records'
import ObserverState from '../src/reactor/observer-state'
import { toImmutable } from '../src/immutable-helpers'

describe('ObserverState', () => {
  beforeEach(() => {
    jasmine.addCustomEqualityTester(is)
  })

  describe('#addObserver', () => {
    let observerState, entry, handler, getter

    describe('when observing the identity getter', () => {
      beforeEach(() => {
        getter = [[], x => x]
        handler = function() {}
        const reactorState = new ReactorState()

        observerState = new ObserverState()
        entry = observerState.addObserver(reactorState, getter, handler)
      })

      it('should properly update the observer state', () => {
        expect(observerState.trackedKeypaths).toEqual(Set.of(List([])))

        expect(observerState.observersMap).toEqual(Map().setIn(
          [toImmutable(getter), handler],
          Map({ getter, handler })
        ))

        expect(observerState.keypathToEntries).toEqual(Map([
          [toImmutable([]), Set.of(entry)]
        ]))

        expect()
        expect(observerState.observers).toEqual(Set.of(entry))
      })

      it('should return a valid entry', () => {
        expect(entry).toEqual(Map({
          getter: getter,
          handler: handler,
        }))
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

        observerState = new ObserverState()
        entry = observerState.addObserver(reactorState, getter, handler)
      })
      it('should properly update the observer state', () => {
        expect(observerState.trackedKeypaths).toEqual(Set.of(
          List(['store1', 'prop1', 'prop2']),
          List(['store2'])
        ))

        expect(observerState.observersMap).toEqual(Map().setIn(
          [toImmutable(getter), handler],
          Map({ getter, handler })
        ))

        expect(observerState.keypathToEntries).toEqual(Map([
          [toImmutable(['store1', 'prop1', 'prop2']), Set.of(entry)],
          [toImmutable(['store2']), Set.of(entry)],
        ]))

        expect(observerState.observers).toEqual(Set.of(entry))
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
    let reactorState, observerState, getter1, getter2, handler1, handler2, handler3

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
      observerState = new ObserverState()
      observerState.addObserver(reactorState, getter1, handler1)
      observerState.addObserver(reactorState, getter1, handler2)
      observerState.addObserver(reactorState, getter2, handler3)
    })

    describe('when removing by getter', () => {
      it('should return a new ObserverState with all entries containing the getter removed', () => {
        observerState.removeObserver(reactorState, getter1)

        expect(observerState.observersMap).toEqual(Map().setIn(
          [toImmutable(getter2), handler3],
          Map({ getter: getter2, handler: handler3 })
        ))

        const entry = Map({
          getter: getter2,
          handler: handler3,
        })
        expect(observerState.keypathToEntries).toEqual(Map().set(toImmutable([]), Set.of(entry)))

        expect(observerState.trackedKeypaths).toEqual(Set.of(toImmutable([])))

        expect(observerState.observers).toEqual(Set.of(entry))
      })
    })

    describe('when removing by getter / handler', () => {
      it('should return a new ObserverState with all entries containing the getter removed', () => {
        observerState.removeObserver(reactorState, getter1, handler1)

        const entry1 = Map({ getter: getter2, handler: handler3 })
        const entry2 = Map({ getter: getter1, handler: handler2 })
        expect(observerState.observersMap).toEqual(Map()
          .setIn(
            [toImmutable(getter2), handler3],
            entry1
          )
          .setIn(
            [toImmutable(getter1), handler2],
            entry2
          ))



        const expectedKeypathToEntries = Map()
          .set(toImmutable(['store1', 'prop1', 'prop2']), Set.of(Map({ getter: getter1, handler: handler2 })))
          .set(toImmutable(['store2']), Set.of(Map({ getter: getter1, handler: handler2 })))
          .set(toImmutable([]), Set.of(Map({ getter: getter2, handler: handler3 })))
        expect(observerState.keypathToEntries).toEqual(expectedKeypathToEntries)

        expect(observerState.trackedKeypaths).toEqual(Set.of(
          toImmutable([]),
          toImmutable(['store1', 'prop1', 'prop2']),
          toImmutable(['store2'])
        ))

        expect(observerState.observers).toEqual(Set.of(entry1, entry2))
      })
    })
  })
})
/*eslint-enable one-var, comma-dangle*/
