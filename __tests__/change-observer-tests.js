jest.autoMockOff()


var ChangeEmitter = require('../src/change-emitter')
var ChangeObserver = require('../src/change-observer')
var Immutable = require('immutable')
var Map = require('immutable').Map

describe('ChangeObserver', () => {
  var observer
  var changeEmitter
  var initialState

  beforeEach(() => {
    changeEmitter = new ChangeEmitter()

    initialState = Immutable.fromJS({
      'foo': {
        'bar': 1
      }
    })
    observer = new ChangeObserver(initialState, changeEmitter)
  })

  describe('registering change handlers', () => {
    it('should allow registration of a single string key', () => {
      var mockFn = jest.genMockFn()
      observer.onChange('foo', mockFn)

      changeEmitter.emitChange(initialState.updateIn(['foo', 'bar'], x => 2))

      var mockCallArg = mockFn.mock.calls[0][0]
      var expected = Map({'bar': 2})

      expect(Immutable.is(mockCallArg, expected))
    })
    it('should allow registration of a non-deep string key', () => {
      var mockFn = jest.genMockFn()
      observer.onChange(['foo'], mockFn)

      changeEmitter.emitChange(initialState.updateIn(['foo', 'bar'], x => 2))

      var mockCallArg = mockFn.mock.calls[0][0]
      var expected = Map({'bar': 2})

      expect(Immutable.is(mockCallArg, expected))
    })
    it('should allow registration of a deep string key', () => {
      var mockFn = jest.genMockFn()
      observer.onChange(['foo.bar'], mockFn)

      changeEmitter.emitChange(initialState.updateIn(['foo', 'bar'], x => {
        return {
          'baz': 2
        }
      }))

      var mockCallArg = mockFn.mock.calls[0][0]
      var expected = Map({'baz': 2})

      expect(Immutable.is(mockCallArg, expected))
    })
    it('should not call the handler if another part of the map changes', () => {
      var mockFn = jest.genMockFn()
      observer.onChange(['foo'], mockFn)

      changeEmitter.emitChange(initialState.set('baz', x => 2))

      expect(mockFn.mock.calls.length).toBe(0)
    })
  })
})
