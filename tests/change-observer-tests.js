var ChangeEmitter = require('../src/change-emitter')
var ChangeObserver = require('../src/change-observer')
var Immutable = require('immutable')
var Map = require('immutable').Map

describe('ChangeObserver', () => {
  var observer
  var changeEmitter
  var initialState

  describe('no prefix', function() {
    beforeEach(() => {
      changeEmitter = new ChangeEmitter()

      initialState = Immutable.fromJS({
        'foo': {
          'bar': 1
        }
      })
      observer = new ChangeObserver(initialState, changeEmitter)
    })
    afterEach(() => {
      observer.destroy()
      changeEmitter.removeAllListeners()
    })

    describe('registering change handlers', () => {
      it('should allow registration of a single string key', () => {
        var mockFn = jasmine.createSpy()
        observer.onChange('foo', mockFn)

        changeEmitter.emitChange(initialState.updateIn(['foo', 'bar'], x => 2))

        var mockCallArg = mockFn.calls.argsFor(0)[1]
        var expected = Map({'bar': 2})

        expect(Immutable.is(mockCallArg, expected))
      })
      it('should allow registration of a non-deep string key', () => {
        var mockFn = jasmine.createSpy()
        observer.onChange(['foo'], mockFn)

        changeEmitter.emitChange(initialState.updateIn(['foo', 'bar'], x => 2))

        var mockCallArg = mockFn.calls.argsFor(0)[1]
        var expected = Map({'bar': 2})

        expect(Immutable.is(mockCallArg, expected))
      })
      it('should allow registration of a deep string key', () => {
        var mockFn = jasmine.createSpy()
        observer.onChange(['foo.bar'], mockFn)

        changeEmitter.emitChange(initialState.updateIn(['foo', 'bar'], x => {
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
        observer.onChange(['foo'], mockFn)

        changeEmitter.emitChange(initialState.set('baz', x => 2))

        expect(mockFn.calls.count()).toBe(0)
      })
    })
  }) // no prefix

  describe('prefix', function() {
    beforeEach(() => {
      changeEmitter = new ChangeEmitter()

      initialState = Immutable.fromJS({
        'foo': {
          'bar': 1,
          'baz': 1
        },
        'other': {
          val: 1
        }
      })
      observer = new ChangeObserver(initialState, changeEmitter, 'foo')
    })

    afterEach(() => {
      observer.destroy()
      changeEmitter.removeAllListeners()
    })

    it('should scope the deps by the prefix', () => {
      var mockFn = jasmine.createSpy()
      observer.onChange(['bar'], mockFn)

      changeEmitter.emitChange(initialState.setIn(['foo', 'bar'], 2))

      expect(mockFn.calls.count()).toBe(1)
      expect(mockFn.calls.argsFor(0)).toEqual([2])
    })

    it('should scope the deps by the prefix given an array of multiple deps', () => {
      var mockFn = jasmine.createSpy()
      observer.onChange(['bar', 'baz'], mockFn)

      changeEmitter.emitChange(initialState.setIn(['foo', 'baz'], 2))

      expect(mockFn.calls.count()).toBe(1)
      expect(mockFn.calls.argsFor(0)).toEqual([1, 2])
    })

    it('should not call the handler function if an out of scope value changes', () => {
      var mockFn = jasmine.createSpy()
      observer.onChange(['bar', 'baz'], mockFn)

      changeEmitter.emitChange(initialState.setIn(['other', 'val'], 2))

      expect(mockFn.calls.count()).toBe(0)
    })
  })
})
