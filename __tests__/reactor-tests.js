jest.autoMockOff()

var Immutable = require('immutable')
var Nuclear = require('../src/facade')
var ReactorCore = require('../src/reactor-core')
var Reactor = require('../src/reactor')
var Getter = require('../src/getter')

// reactor cores
var MultiplierCore = Nuclear.createCore({
  initialize() {
    this.on('setMulti', (state, payload) => {
      return state.set('multiplier', payload.value)
    })

  },

  getInitialState() {
    return {
      multiplier: 1,
      power: 2
    }
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

    this.computed('total', Getter({
      deps: ['values'],
      compute(values) {
        return values.reduce((value, total) => total + value, 0)
      }
   }))
  },

  getInitialState() {
    return {
      values: [],
    }
  }
})

var getMultipliedTotal = Getter({
  deps: ['aggregate.total', 'multi.multiplier'],
  compute(total, multi) {
    return total * multi
  }
})

// getter that depends on a getter
var getPowerTotal = Getter({
  deps: [getMultipliedTotal, 'multi.power'],
  compute(total, power) {
    console.log('get power total', total, power)
    return Math.pow(total, power)
  }
})

var basicActions = {
  setMultiplier(reactor, val) {
    reactor.dispatch('setMulti', {
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
      reactor.changeEmitter.addChangeListener(mockFn)

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
      reactor.changeEmitter.addChangeListener(mockFn)

      reactor.action('basic').setMultiplier(123)

      expect(mockFn.mock.calls.length).toEqual(0)
    })

    it("should create a ChangeObserver properly", () => {
      var mockFn = jest.genMockFn()

      var changeObserver = reactor.createChangeObserver()
      changeObserver.onChange('aggregate.total', mockFn)

      reactor.action('basic').pushValue(69)

      expect(mockFn.mock.calls.length).toEqual(1)
      expect(mockFn.mock.calls[0][0]).toEqual(69)

      // this isn't working yet
      changeObserver.destroy()

      reactor.action('basic').pushValue(1)
      expect(mockFn.mock.calls.length).toEqual(1)
    })
  })

  describe("Reactor level computed", () => {
    beforeEach(() => {
      reactor = Nuclear.createReactor()
      reactor.attachCore('aggregate', AggregateCore)
      reactor.attachCore('multi', MultiplierCore)

      reactor.bindActions('basic', basicActions)

      reactor.computed('multipliedTotal', getMultipliedTotal)
      reactor.computed('powerTotal', getPowerTotal)

      reactor.initialize()
    })

    it('should initialize the reactor level computed after initialization', () => {
      expect(reactor.get('multipliedTotal')).toBe(0)
    })

    it('should recompute after a dependency changes', () => {
      reactor.action('basic').pushValue(10)

      expect(reactor.get('multipliedTotal')).toBe(10)
      expect(reactor.get('powerTotal')).toBe(100)

      reactor.action('basic').setMultiplier(2)

      expect(reactor.get('multipliedTotal')).toBe(20)
      expect(reactor.get('powerTotal')).toBe(400)
    })
  })

  describe("Reactor level computed + initial state", () => {
    beforeEach(() => {
      reactor = Nuclear.createReactor()
      reactor.attachCore('aggregate', AggregateCore)
      reactor.attachCore('multi', MultiplierCore)

      reactor.bindActions('basic', basicActions)

      reactor.computed('multipliedTotal', getMultipliedTotal)
      reactor.computed('powerTotal', getPowerTotal)
    })

    it.only('should initialize with some initialState and execute the computeds', () => {
      var initialState = Immutable.fromJS({
        multi: {
          multiplier: 2,
          power: 2
        },

        aggregate: {
          values: [1, 2, 3, 4]
        }
      })

      reactor.initialize(initialState)

      expect(reactor.get('multipliedTotal')).toBe(20)
      expect(reactor.get('powerTotal')).toBe(400)
    })
  })
})
