jest.autoMockOff()

var ChangeObserver = require('../src/change-observer')
var Immutable = require('immutable')
var through = require('through')

describe('ChangeObserver', () => {
  var observer
  var changeStream
  var initialState

  beforeEach(() => {
    changeStream = through()
    initialState = Immutable.fromJS({
      'foo': {
        'bar': 1
      }
    })
    observer = new ChangeObserver(initialState, changeStream)
  })

  describe('registering change handlers', () => {
    it('should allow registration of a single string key', () => {
      var mockFn = jest.genMockFn()
      observer.onChange('foo', mockFn)

      changeStream.write(initialState.updateIn(['foo', 'bar'], x => 2))

      expect(mockFn.mock.calls[0][0]).toEqual({'bar': 2})
    })
    it('should allow registration of a non-deep string key', () => {
      var mockFn = jest.genMockFn()
      observer.onChange(['foo'], mockFn)

      changeStream.write(initialState.updateIn(['foo', 'bar'], x => 2))

      expect(mockFn.mock.calls[0][0]).toEqual({'bar': 2})
    })
    it('should allow registration of a deep string key', () => {
      var mockFn = jest.genMockFn()
      observer.onChange(['foo.bar'], mockFn)

      changeStream.write(initialState.updateIn(['foo', 'bar'], x => {
        return {
          'baz': 2
        }
      }))

      expect(mockFn.mock.calls[0][0]).toEqual({
        baz: 2
      })
    })
    it('should not call the handler if another part of the map changes', () => {
      var mockFn = jest.genMockFn()
      observer.onChange(['foo'], mockFn)

      changeStream.write(initialState.set('baz', x => 2))

      expect(mockFn.mock.calls.length).toBe(0)
    })
  })
})
