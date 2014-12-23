var Evaluator = require('../src/evaluator')
var Getter = require('../src/getter')
var ChangeObserver = require('../src/change-observer')
var Immutable = require('immutable')
var Map = require('immutable').Map

describe('ChangeObserver', () => {
  var observer
  var evaluator
  var initialState
  var identity = (x) => x

  beforeEach(() => {
    evaluator = new Evaluator()

    initialState = Immutable.fromJS({
      'foo': {
        'bar': 1
      }
    })
    observer = new ChangeObserver(initialState, evaluator)
  })
  afterEach(() => {
    observer.reset()
    evaluator.reset()
  })

  describe('registering change handlers', () => {
    it("should allow registration of ['foo', identity]", () => {
      var mockFn = jasmine.createSpy()
      observer.onChange({
        getter: [['foo'], identity],
        handler: mockFn,
      })

      observer.notifyObservers(initialState.updateIn(['foo', 'bar'], x => 2))

      var mockCallArg = mockFn.calls.argsFor(0)[1]
      var expected = Map({'bar': 2})

      expect(Immutable.is(mockCallArg, expected))
    })

    it('should allow registration of a deep string key', () => {
      var mockFn = jasmine.createSpy()
      observer.onChange({
        getter: [['foo', 'bar'], identity],
        handler: mockFn,
      })

      observer.notifyObservers(initialState.updateIn(['foo', 'bar'], x => {
        return {
          'baz': 2
        }
      }))

      var mockCallArg = mockFn.calls.argsFor(0)[1]
      var expected = Map({'baz': 2})

      expect(Immutable.is(mockCallArg, expected))
    })

    it('should not call the handler if another part of the map changes', () => {
      var mockFn = jasmine.createSpy()
      observer.onChange({
        getter: Getter.fromKeyPath(['foo']),
        handler: mockFn,
      })

      observer.notifyObservers(initialState.set('baz', x => 2))

      expect(mockFn.calls.count()).toBe(0)
    })
  })
})
