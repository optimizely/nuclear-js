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
        'bar': 1,
      },
    })
    observer = new ChangeObserver(initialState, evaluator)
  })
  afterEach(() => {
    observer.reset()
    evaluator.reset()
  })

  describe('registering change handlers', () => {
    it('should allow registration of [\'foo\', identity]', () => {
      var mockFn = jasmine.createSpy()
      observer.onChange([['foo'], identity], mockFn)

      observer.notifyObservers(initialState.updateIn(['foo', 'bar'], x => 2))

      var mockCallArg = mockFn.calls.argsFor(0)[0]
      var expected = Map({'bar': 2})

      expect(Immutable.is(mockCallArg, expected)).toBe(true)
    })

    it('should allow registration of a deep string key', () => {
      var mockFn = jasmine.createSpy()
      observer.onChange([['foo', 'bar'], identity], mockFn)

      observer.notifyObservers(initialState.updateIn(['foo', 'bar'], x => {
        return Map({
          'baz': 2,
        })
      }))

      var mockCallArg = mockFn.calls.argsFor(0)[0]
      var expected = Map({'baz': 2})

      expect(Immutable.is(mockCallArg, expected)).toBe(true)
    })

    it('should not call the handler if another part of the map changes', () => {
      var mockFn = jasmine.createSpy()
      var getter = Getter.fromKeyPath(['foo'])
      observer.onChange(getter, mockFn)

      observer.notifyObservers(initialState.set('baz', x => 2))

      expect(mockFn.calls.count()).toBe(0)
    })

    describe('when two of the same getter are registered', () => {
      it('should call the handler functions of both', () => {
        var getter = [['foo'], identity]
        var mockFn1 = jasmine.createSpy()
        var mockFn2 = jasmine.createSpy()
        observer.onChange(getter, mockFn1)
        observer.onChange(getter, mockFn2)

        observer.notifyObservers(initialState.updateIn(['foo', 'bar'], x => 2))

        expect(mockFn1.calls.count()).toBe(1)
        expect(mockFn2.calls.count()).toBe(1)
      })
    })

    it('should not skip observers when handler causes unobserve', () => {
      var getter = ['foo', 'bar']
      var mockFn = jasmine.createSpy()
      var unreg = observer.onChange(getter, () => unreg())
      observer.onChange(getter, mockFn)

      observer.notifyObservers(initialState.updateIn(getter, x => 2))

      expect(mockFn.calls.count()).toBe(1)
    })

    it('should not call unwatched observers when removed during notify', () => {
      var getter = ['foo', 'bar']
      var mockFn1 = jasmine.createSpy()
      var mockFn2 = jasmine.createSpy()
      observer.onChange(getter, () => {
        mockFn1()
        unreg()
      })
      var unreg = observer.onChange(getter, mockFn2)

      observer.notifyObservers(initialState.updateIn(getter, x => 2))

      expect(mockFn1.calls.count()).toBe(1)
      expect(mockFn2.calls.count()).toBe(0)
    })

    it('should not call new observers when handlers attach them', () => {
      var getter = ['foo', 'bar']
      var mockFn1 = jasmine.createSpy()
      var mockFn2 = jasmine.createSpy()
      observer.onChange(getter, mockFn1)
      observer.onChange(getter, () => observer.onChange(getter, mockFn2))

      observer.notifyObservers(initialState.updateIn(getter, x => 2))

      expect(mockFn1.calls.count()).toBe(1)
      expect(mockFn2.calls.count()).toBe(0)
    })
  })
  // TODO: test the prevValues and registering an observable
})
