jest.autoMockOff()

var Immutable = require('immutable')
var Map = require('immutable').Map
var List = require('immutable').List
var Nuclear = require('../src/facade')

var itemsState = Nuclear.ReactiveState({
  getInitialState() {
    return {
      all: [],
    }
  },

  initialize() {
    this.on('addItem', (state, payload) => {
      return state.update('all', items => {
        return items.push(Map({
          name: payload.name,
          price: payload.price,
        }))
      })
    })

    this.computed('subtotal', ['all'], (items) => {
      return items.reduce((total, item) => {
        return total + item.get('price')
      }, 0)
    })
  },
})

var taxPercentageState = Nuclear.ReactiveState({
  getInitialState() {
    return 0
  },

  initialize() {
    this.on('setTax', (state, payload) => {
      return payload
    })
  }
})

var taxComputed = Nuclear.Computed(
  ['items.subtotal', 'taxPercent'],
  (subtotal, taxPercent) => {
    return (subtotal * (taxPercent / 100))
  }
)

var totalComputed = Nuclear.Computed(
  ['items.subtotal', taxComputed],
  (subtotal, tax) => {
    var total = subtotal + tax
    return Math.round(total, 2)
  }
)

var checkoutActions = {
  addItem(reactor, name, price) {
    reactor.dispatch('addItem', {
      name: name,
      price: price
    })
  },

  setTaxPercent(reactor, percent) {
    reactor.dispatch('setTax', percent)
  }
}

var reactorConfig = {
  state: {
    items: itemsState,
    taxPercent: taxPercentageState,

    tax: taxComputed,
    total: totalComputed,
  },

  actions: {
    checkout: checkoutActions
  }
}



describe('Reactor', () => {
  var reactor

  describe('Reactor with no initial state', () => {
    beforeEach(() => {
      reactor = Nuclear.Reactor(reactorConfig)
      reactor.initialize()
    })

    describe('initialization', () => {
      it('should initialize with the core level computeds', () => {
        expect(reactor.getJS('items.all')).toEqual([])

        expect(reactor.get('items.subtotal')).toBe(0)
        expect(reactor.get('taxPercent')).toEqual(0)
        expect(reactor.get('tax')).toEqual(0)
        expect(reactor.get('total')).toEqual(0)
      })
    })

    describe('when dispatching a relevant action', () => {
      var item = {
        name: 'item 1',
        price: 10,
      }

      it('should update all state', () => {
        reactor.actions('checkout').addItem(item.name, item.price)
        expect(reactor.getJS('items.all')).toEqual([item])

        expect(reactor.get('items.subtotal')).toBe(10)
        expect(reactor.get('taxPercent')).toEqual(0)
        expect(reactor.get('tax')).toEqual(0)
        expect(reactor.get('total')).toEqual(10)
      })

      it('should update all computed after another action', () => {
        reactor.actions('checkout').addItem(item.name, item.price)
        reactor.actions('checkout').setTaxPercent(10)

        expect(reactor.getJS('items.all')).toEqual([item])

        expect(reactor.get('items.subtotal')).toBe(10)
        expect(reactor.get('taxPercent')).toEqual(10)
        expect(reactor.get('tax')).toEqual(1)
        expect(reactor.get('total')).toEqual(11)
      })

      it("should emit the state of the reactor on the outputStream", () => {
        var mockFn = jest.genMockFn()
        reactor.changeEmitter.addChangeListener(mockFn)

        reactor.actions('checkout').addItem(item.name, item.price)

        var expected = Immutable.fromJS({
          items: {
            all: [
              item
            ],
            subtotal: 10
          },
          taxPercent: 0,
          tax: 0,
          total: 10,
        })

        var firstCallArg = mockFn.mock.calls[0][0]

        expect(mockFn.mock.calls.length).toEqual(1)
        expect(Immutable.is(firstCallArg, expected))
      })

      it("should not emit to the outputStream if state does not change after a dispatch", () => {
        var mockFn = jest.genMockFn()
        reactor.changeEmitter.addChangeListener(mockFn)

        reactor.dispatch('noop', {})

        expect(mockFn.mock.calls.length).toEqual(0)
      })
    }) // when dispatching a relevant action

    it("should create a ChangeObserver properly", () => {
      var mockFn = jest.genMockFn()

      var changeObserver = reactor.createChangeObserver()
      changeObserver.onChange('items.subtotal', mockFn)

      reactor.actions('checkout').addItem('item', 10)

      expect(mockFn.mock.calls.length).toEqual(1)
      expect(mockFn.mock.calls[0][0]).toEqual(10)

      changeObserver.destroy()

      reactor.actions('checkout').addItem('item 2', 20)
      expect(mockFn.mock.calls.length).toEqual(1)
    })
  }) // Reactor with no initial state

  describe("Reactor level computed + initial state", () => {
    var initialState = Map({
      items: Map({
        all: List([
          Map({
            name: 'item 1',
            price: 10,
          }),
          Map({
            name: 'item 2',
            price: 90,
          }),
        ]),
      }),

      taxPercent: 20
    })

    beforeEach(() => {
      reactor = Nuclear.Reactor(reactorConfig)
      reactor.initialize(initialState)
    })

    it('should initialize with some initialState and execute the computeds', () => {
      var expected = Immutable.fromJS({
        items: {
          all: [
            { name: 'item 1', price: 10 },
            { name: 'item 2', price: 90 },
          ],
          subtotal: 100
        },
        taxPercent: 20,
        tax: 20,
        total: 120,
      })

      expect(Immutable.is(reactor.state, expected)).toBe(true)
    })
  })
})
