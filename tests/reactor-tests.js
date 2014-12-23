var Immutable = require('immutable')
var Map = require('immutable').Map
var List = require('immutable').List
var Nuclear = require('../src/main')
var Reactor = require('../src/main').Reactor
var Store = require('../src/main').Store
var Getter = require('../src/main').Getter


describe('Reactor', () => {
  var checkoutActions, reactor, taxPercentGetter, subtotalGetter, taxGetter, totalGetter

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

    reactor = new Reactor()
    reactor.attachStores({
      'items': itemStore,
      'taxPercent': taxPercentStore,
    })

    subtotalGetter = [
      ['items', 'all'],
      (items) => {
        return items.reduce((total, item) => {
          return total + item.get('price')
        }, 0)
      }
    ]

    taxGetter = [
      subtotalGetter,
      ['taxPercent'],
      (subtotal, taxPercent) => {
        return (subtotal * (taxPercent / 100))
      }
    ]

    totalGetter = [
      subtotalGetter,
      taxGetter,
      (subtotal, tax) => {
        return Math.round(subtotal + tax, 2)
      }
    ]

    checkoutActions = {
      addItem(name, price) {
        reactor.dispatch('addItem', {
          name: name,
          price: price
        })
      },

      setTaxPercent(percent) {
        reactor.dispatch('setTax', percent)
      }
    }
  })

  describe('Reactor with no initial state', () => {
    afterEach(() => {
      reactor.reset()
    })

    describe('initialization', () => {
      it('should initialize with the core level computeds', () => {
        expect(reactor.evaluateToJS(['items', 'all'])).toEqual([])

        expect(reactor.evaluate(['taxPercent'])).toEqual(0)
      })

      it('should return the whole state when calling reactor.evaluate()', () => {
        var state = reactor.evaluate()
        var expected = Map({
          items: Map({
            all: List(),
          }),
          taxPercent: 0,
        })

        expect(Immutable.is(state, expected)).toBe(true)
      })

      it('should return the whole state coerced to JS when calling reactor.evaluateToJS()', () => {
        var state = reactor.evaluateToJS()
        var expected = {
          items: {
            all: [],
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
        expect(reactor.evaluateToJS(['items', 'all'])).toEqual([item])

        expect(reactor.evaluate(['taxPercent'])).toEqual(0)
        expect(reactor.evaluate(taxGetter)).toEqual(0)
        expect(reactor.evaluate(totalGetter)).toEqual(10)
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
          },
          taxPercent: 0,
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
        reactor.observe(['taxPercent'], mockFn)

        checkoutActions.setTaxPercent(5)

        expect(mockFn.calls.count()).toEqual(1)
        expect(mockFn.calls.argsFor(0)).toEqual([5])
      })
      it('should not invoke a change handler if another keypath changes', () => {
        var mockFn = jasmine.createSpy()
        reactor.observe(['taxPercent'], mockFn)

        checkoutActions.addItem('item', 1)

        expect(mockFn.calls.count()).toEqual(0)
      })
      it('should invoke a change handler if a getter value changes', () => {
        var mockFn = jasmine.createSpy()
        checkoutActions.addItem('item', 100)

        reactor.observe(totalGetter, mockFn)

        checkoutActions.setTaxPercent(5)

        expect(mockFn.calls.count()).toEqual(1)
        expect(mockFn.calls.argsFor(0)).toEqual([105])
      })

      it('should not invoke a change handler if a getters deps dont change', () => {
        var mockFn = jasmine.createSpy()
        reactor.observe(['taxPercent'], mockFn)

        checkoutActions.addItem('item', 100)

        expect(mockFn.calls.count()).toEqual(0)
      })

      it('should return an unwatch function', () => {
        var mockFn = jasmine.createSpy()
        checkoutActions.addItem('item', 100)

        var unwatch = reactor.observe(totalGetter, mockFn)

        unwatch()

        checkoutActions.setTaxPercent(5)

        expect(mockFn.calls.count()).toEqual(0)
      })
    })
  }) // Reactor with no initial state
})
