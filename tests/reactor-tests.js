var Immutable = require('immutable')
var Map = require('immutable').Map
var List = require('immutable').List
var Nuclear = require('../src/main')
var Reactor = require('../src/main').Reactor
var Store = require('../src/main').Store
var Getter = require('../src/main').Getter


describe('Reactor', () => {
  var checkoutActions, reactor, tax, total

  beforeEach(() => {

    var itemStore = Store({
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

        this.computed('subtotal', ['all', (items) => {
          return items.reduce((total, item) => {
            return total + item.get('price')
          }, 0)
        }])
      },
    })

    var taxPercentStore = Store({
      getInitialState() {
        return 0
      },

      initialize() {
        this.on('setTax', (state, payload) => {
          return payload
        })
      }
    })

    reactor = Reactor({
      stores: {
        'items': itemStore,
        'taxPercent': taxPercentStore,
      }
    })

    tax = Getter(
      'items.subtotal',
      'taxPercent',
      (subtotal, taxPercent) => {
        return (subtotal * (taxPercent / 100))
      }
    )

    total = Getter(
      'items.subtotal',
      tax,
      (subtotal, tax) => {
        var total = subtotal + tax
        return Math.round(total, 2)
      }
    )

    checkoutActions = reactor.bindActions({
      addItem(reactor, name, price) {
        reactor.dispatch('addItem', {
          name: name,
          price: price
        })
      },

      setTaxPercent(reactor, percent) {
        reactor.dispatch('setTax', percent)
      }
    })
  })

  describe('Reactor with no initial state', () => {
    afterEach(() => {
      reactor.reset()
    })

    describe('initialization', () => {
      it('should initialize with the core level computeds', () => {
        expect(reactor.getJS('items.all')).toEqual([])

        expect(reactor.get('items.subtotal')).toBe(0)
        expect(reactor.get('taxPercent')).toEqual(0)
      })

      it('should return the whole state when calling reactor.get()', () => {
        var state = reactor.get()
        var expected = Map({
          items: Map({
            all: List(),
            subtotal: 0,
          }),
          taxPercent: 0,
        })

        expect(Immutable.is(state, expected)).toBe(true)
      })

      it('should return the whole state coerced to JS when calling reactor.getJS()', () => {
        var state = reactor.getJS()
        var expected = {
          items: {
            all: [],
            subtotal: 0,
          },
          taxPercent: 0,
        }

        expect(state).toEqual(expected)
      })
    })

    describe('when dispatching a relevant action', () => {
      var item = {
        name: 'item 1',
        price: 10,
      }

      it('should update all state', () => {
        checkoutActions.addItem(item.name, item.price)
        expect(reactor.getJS('items.all')).toEqual([item])

        expect(reactor.get('items.subtotal')).toBe(10)
        expect(reactor.get('taxPercent')).toEqual(0)
        expect(reactor.get(tax)).toEqual(0)
        expect(reactor.get(total)).toEqual(10)
      })

      it('should update all computed after another action', () => {
        checkoutActions.addItem(item.name, item.price)
        checkoutActions.setTaxPercent(10)

        expect(reactor.getJS('items.all')).toEqual([item])

        expect(reactor.get('items.subtotal')).toBe(10)
        expect(reactor.get('taxPercent')).toEqual(10)
        expect(reactor.get(tax)).toEqual(1)
        expect(reactor.get(total)).toEqual(11)
      })

      it("should emit the state of the reactor to a handler registered with observe()", () => {
        var mockFn = jasmine.createSpy()
        reactor.observe(mockFn)

        checkoutActions.addItem(item.name, item.price)

        var expected = Immutable.fromJS({
          items: {
            all: [
              item
            ],
            subtotal: 10
          },
          taxPercent: 0,
          total: 10,
        })

        var firstCallArg = mockFn.calls.argsFor(0)

        expect(mockFn.calls.count()).toBe(1)
        expect(Immutable.is(firstCallArg, expected))
      })

      it("should not emit to the outputStream if state does not change after a dispatch", () => {
        var mockFn = jasmine.createSpy()
        reactor.observe(mockFn)

        reactor.dispatch('noop', {})

        expect(mockFn.calls.count()).toEqual(0)
      })
    }) // when dispatching a relevant action

    describe('#observe', () => {
      it('should invoke a change handler if the specific keypath changes', () => {
        var mockFn = jasmine.createSpy()
        reactor.observe('taxPercent', mockFn)

        checkoutActions.setTaxPercent(5)

        expect(mockFn.calls.count()).toEqual(1)
        expect(mockFn.calls.argsFor(0)).toEqual([5])
      })
      it('should not invoke a change handler if another keypath changes', () => {
        var mockFn = jasmine.createSpy()
        reactor.observe('taxPercent', mockFn)

        checkoutActions.addItem('item', 1)

        expect(mockFn.calls.count()).toEqual(0)
      })
      it('should invoke a change handler if a getter value changes', () => {
        var mockFn = jasmine.createSpy()
        checkoutActions.addItem('item', 100)

        reactor.observe(total, mockFn)

        checkoutActions.setTaxPercent(5)

        expect(mockFn.calls.count()).toEqual(1)
        expect(mockFn.calls.argsFor(0)).toEqual([105])
      })

      it('should not invoke a change handler if a getters deps dont change', () => {
        var mockFn = jasmine.createSpy()
        var doubleTax = Getter('taxPercent', x => 2*x)
        reactor.observe(doubleTax, mockFn)

        checkoutActions.addItem('item', 100)

        expect(mockFn.calls.count()).toEqual(0)
      })

      it('should return an unwatch function', () => {
        var mockFn = jasmine.createSpy()
        checkoutActions.addItem('item', 100)

        var unwatch = reactor.observe(total, mockFn)

        unwatch()

        checkoutActions.setTaxPercent(5)

        expect(mockFn.calls.count()).toEqual(0)
      })
    })
  }) // Reactor with no initial state

  describe("#loadState", () => {
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

    it('should load the entire app state and call any changeObservers', () => {
      var mockFn = jasmine.createSpy()
      reactor.observe(mockFn)

      reactor.loadState(initialState)

      expect(mockFn.calls.count()).toEqual(1)

      var expected = Map({
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
          subtotal: 100
        }),

        taxPercent: 20
      })

      expect(mockFn.calls.argsFor(0)[0]).toEqual(expected)

      expect(reactor.get('items.subtotal')).toBe(100)
    })

    it('should load state for specific store', () => {
      reactor.loadState(initialState)

      var mockFn = jasmine.createSpy()
      reactor.observe('taxPercent', mockFn)


      reactor.loadState('taxPercent', 30)

      expect(mockFn.calls.count()).toEqual(1)
      expect(mockFn.calls.argsFor(0)).toEqual([30])

      expect(reactor.get(total)).toBe(130)
    })
  })
})
