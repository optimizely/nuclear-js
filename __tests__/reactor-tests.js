jest.autoMockOff()

var Immutable = require('immutable')
var through = require('through')
var Nuclear = require('../src/facade')
var ReactorCore = require('../src/reactor-core')
var Reactor = require('../src/reactor')
var remove = require('../src/immutable-helpers').remove

// reactor cores
var MapCore = Nuclear.createCore({
  initialize() {
    this.on('set', (state, payload) => {
      return state.set(payload.key, payload.value)
    })

    return {}
  }
})

// the aggregate core takes values via the 'push' message
// and computes the total
var AggregateCore = Nuclear.createCore({
  initialize() {
    this.on('push', (state, payload) => {
      return state.update('values', vect => {
        return vect.push(payload.value)
      })
    })

    this.computed('total', ['values'], values => {
      return values.reduce((value, total) => total + value, 0)
    })

    return {
      values: [],
    }
  }
})

var basicActions = {
  setMap(reactor, key, val) {
    reactor.dispatch('set', {
      key: key,
      value: val,
    })
  },

  pushValue(reactor, val) {
    reactor.dispatch('push', {
      value: val,
    })
  }
}

describe('Reactor', () => {
  var reactor

  describe("Basic - no initial state, no computeds", () => {
    beforeEach(() => {
      reactor = Nuclear.createReactor()
      reactor.attachCore('aggregate', AggregateCore)

      reactor.bindActions('basic', basicActions)

      reactor.initialize()
    })

    it("should initialize with the core level computeds", () => {
      expect(reactor.get('aggregate.total')).toBe(0)
    })

    it("should update when dispatching a relevant action", () => {
      reactor.action('basic').pushValue(123)

      expect(reactor.get('aggregate.total')).toEqual(123)
      expect(Immutable.is(reactor.get('aggregate.values'), Immutable.Vector(123)))
      // js tests
      expect(reactor.getJS('aggregate.total')).toEqual(123)
      expect(reactor.getJS('aggregate.values')).toEqual([123])
    })

    it("should emit the state of the reactor on the outputStream", () => {
      var mockFn = jest.genMockFn()
      reactor.outputStream.pipe(through(mockFn))

      reactor.action('basic').pushValue(1)

      var expected = Immutable.fromJS({
        aggregate: {
          values: [1],
          total: 1,
        }
      })

      var firstCallArg = mockFn.mock.calls[0][0]

      expect(mockFn.mock.calls.length).toEqual(1)
      expect(Immutable.is(firstCallArg, expected))
    })

    it("should not emit to the outputStream if state does not change after a dispatch", () => {
      var mockFn = jest.genMockFn()
      reactor.outputStream.pipe(through(mockFn))

      reactor.action('basic').setMap('val', 123)

      expect(mockFn.mock.calls.length).toEqual(0)
    })

    it("should create a ChangeObserver properly", () => {
      var mockFn = jest.genMockFn()

      var changeObserver = reactor.createChangeObserver()
      changeObserver.onChange('aggregate.total', mockFn)

      reactor.action('basic').pushValue(69)

      expect(mockFn.mock.calls.length).toEqual(1)
      expect(mockFn.mock.calls[0][0]).toEqual(69)

      changeObserver.destroy()

      reactor.action('basic').pushValue(1)
      expect(mockFn.mock.calls.length).toEqual(1)
    })
  })
})
