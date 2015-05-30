var Immutable = require('immutable')
var Map = require('immutable').Map
var List = require('immutable').List
var Reactor = require('../src/main').Reactor
var Store = require('../src/main').Store
var toImmutable = require('../src/immutable-helpers').toImmutable


describe('Reactor', () => {
  it('should construct without \'new\'', () => {
    var reactor = Reactor()
    expect(reactor instanceof Reactor).toBe(true)
  })

  describe('Reactor with no initial state', () => {
    var checkoutActions
    var reactor
    var subtotalGetter
    var taxGetter
    var totalGetter

    beforeEach(() => {
      var itemStore = Store({
        getInitialState() {
          return toImmutable({
            all: [],
          })
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
        },
      })

      reactor = new Reactor({
        debug: true,
      })
      reactor.registerStores({
        'items': itemStore,
        'taxPercent': taxPercentStore,
      })

      subtotalGetter = [
        ['items', 'all'],
        (items) => {
          return items.reduce((total, item) => {
            return total + item.get('price')
          }, 0)
        },
      ]

      taxGetter = [
        subtotalGetter,
        ['taxPercent'],
        (subtotal, taxPercent) => {
          return (subtotal * (taxPercent / 100))
        },
      ]

      totalGetter = [
        subtotalGetter,
        taxGetter,
        (subtotal, tax) => {
          return Math.round(subtotal + tax, 2)
        },
      ]

      checkoutActions = {
        addItem(name, price) {
          reactor.dispatch('addItem', {
            name: name,
            price: price,
          })
        },

        setTaxPercent(percent) {
          reactor.dispatch('setTax', percent)
        },
      }
    })
    afterEach(() => {
      reactor.reset()
    })

    describe('initialization', () => {
      it('should initialize with the core level computeds', () => {
        expect(reactor.evaluateToJS(['items', 'all'])).toEqual([])

        expect(reactor.evaluate(['taxPercent'])).toEqual(0)
      })

      it('should return the whole state when calling reactor.evaluate([])', () => {
        var state = reactor.evaluate([])
        var expected = Map({
          items: Map({
            all: List(),
          }),
          taxPercent: 0,
        })

        expect(Immutable.is(state, expected)).toBe(true)
      })

      it('should return the whole state coerced to JS when calling reactor.evaluateToJS()', () => {
        var state = reactor.evaluateToJS([])
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

      it('should emit the state of the reactor to a handler registered with observe()', () => {
        var mockFn = jasmine.createSpy()
        reactor.observe(mockFn)

        checkoutActions.addItem(item.name, item.price)

        var expected = Immutable.fromJS({
          items: {
            all: [
              item,
            ],
          },
          taxPercent: 0,
        })

        var firstCallArg = mockFn.calls.argsFor(0)

        expect(mockFn.calls.count()).toBe(1)
        expect(Immutable.is(firstCallArg, expected))
      })

      it('should not emit to the outputStream if state does not change after a dispatch', () => {
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

  describe('reactor#reset', () => {
    var reactor

    beforeEach(() => {
      var standardStore = Store({
        getInitialState() {
          return toImmutable([])
        },

        initialize() {
          this.on('addItem', (state, item) => {
            return state.push(item)
          })
        },
      })

      var persistentStore = Store({
        getInitialState() {
          return toImmutable([])
        },

        initialize() {
          this.on('addItem', (state, item) => {
            return state.push(item)
          })
        },

        handleReset(state) {
          return state
        },
      })

      reactor = new Reactor({
        debug: true,
      })
      reactor.registerStores({
        standard: standardStore,
        persistent: persistentStore,
      })
    })

    afterEach(() => {
      reactor.reset()
    })

    it('should go back to initial state for normal stores', () => {
      var item = { foo: 'bar' }
      reactor.dispatch('addItem', item)

      expect(reactor.evaluateToJS(['standard'])).toEqual([item])

      reactor.reset()

      expect(reactor.evaluateToJS(['standard'])).toEqual([])
    })

    it('should respect the handleReset method for stores that override it', () => {
      var item = { foo: 'bar' }
      reactor.dispatch('addItem', item)

      expect(reactor.evaluateToJS(['persistent'])).toEqual([item])

      reactor.reset()

      expect(reactor.evaluateToJS(['persistent'])).toEqual([item])
    })
  })

  describe('when a reactor is observing mutable values', () => {
    var reactor
    var observeSpy

    beforeEach(() => {
      observeSpy = jasmine.createSpy('observe')

      var mapStore = Store({
        getInitialState() {
          return toImmutable({})
        },

        initialize() {
          this.on('set', (state, payload) => {
            return state.set(payload.key, payload.value)
          })
        },
      })

      var keyStore = Store({
        getInitialState() {
          return 'foo'
        },

        initialize() {
          this.on('setKey', (state, payload) => {
            return payload
          })
        },
      })

      reactor = new Reactor({
        debug: true,
      })
      reactor.registerStores({
        mapStore: mapStore,
        keyStore: keyStore,
      })
    })

    afterEach(() => {
      reactor.reset()
    })

    it('should go back to initial state for normal stores', () => {
      function Foo(val) {
        this.val = val
      }

      var item = new Foo('bar')
      var item2 = new Foo('baz')

      var getter = [
        ['mapStore'],
        ['keyStore'],
        (map, key) => {
          return map.get(key)
        },
      ]

      reactor.evaluate(getter)

      reactor.observe(getter, (fooValue) => {
        observeSpy(fooValue)
      })

      reactor.dispatch('set', {
        key: 'foo',
        value: item,
      })

      expect(observeSpy.calls.count()).toBe(1)

      reactor.dispatch('set', {
        key: 'foo',
        value: item2,
      })
      expect(observeSpy.calls.count()).toBe(2)
    })
  })

  describe('a reactor with a store that has `null` as its initial state', () => {
    var reactor

    beforeEach(() => {
      var nullStateStore = new Store({
        getInitialState() {
          return null
        },
        initialize() {
          this.on('set', (_, val) => val)
        },
      })

      reactor = new Reactor({
        debug: true,
      })
      reactor.registerStores({
        test: nullStateStore,
      })
    })

    afterEach(() => {
      reactor.reset()
    })

    it('the store should respond to a registered action', () => {
      reactor.dispatch('set', 'foo')
      expect(reactor.evaluate(['test'])).toBe('foo')
    })

    it('the store should have the same initial state for an action it doesnt handle', () => {
      reactor.dispatch('unknown', 'foo')
      expect(reactor.evaluate(['test'])).toBe(null)
    })
  })

  describe('when debug is true and a store has a handler for an action but returns undefined', () => {
    var reactor

    beforeEach(() => {
      var undefinedStore = new Store({
        getInitialState() {
          return 1
        },
        initialize() {
          this.on('set', (_, val) => undefined)
        },
      })

      reactor = new Reactor({
        debug: true,
      })
      reactor.registerStores({
        test: undefinedStore,
      })
    })

    afterEach(() => {
      reactor.reset()
    })

    it('should throw an error', function() {
      expect(function() {
        reactor.dispatch('set', 'foo')
      }).toThrow()
    })
  })

  describe('#registerStores', () => {
    var reactor

    afterEach(() => {
      reactor.reset()
    })

    describe('when another store is already registered for the same id', () => {
      var store1
      var store2

      beforeEach(() => {
        spyOn(console, 'warn')

        store1 = new Store()
        store2 = new Store()

        reactor = new Reactor({
          debug: true,
        })
        reactor.registerStores({
          store1: store1,
        })
      })

      it('should warn', function() {
        reactor.registerStores({
          store1: store2,
        })
        /* eslint-disable no-console */
        expect(console.warn).toHaveBeenCalled()
        /* eslint-enable no-console */
      })
    })

    describe('when the stores getInitialState method returns a non immutable object', () => {
      var store1

      beforeEach(() => {
        store1 = new Store({
          getInitialState() {
            return {
              foo: 'bar',
            }
          },
        })

        reactor = new Reactor({
          debug: true,
        })
      })

      it('should throw an error', function() {
        expect(function() {
          reactor.registerStores({
            store1: store1,
          })
        }).toThrow()
      })
    })

    describe('when calling registerStores with an observer', () => {
      var store1
      var observeSpy

      beforeEach(() => {
        observeSpy = jasmine.createSpy()

        store1 = new Store({
          getInitialState() {
            return 'foo'
          },
          initialize() {
            this.on('set', (_, val) => val)
          },
        })

        reactor = new Reactor({
          debug: true,
        })

        reactor.observe(['test'], observeSpy)
      })

      it('should notify observers immediately', function() {
        var notify = true
        reactor.registerStores({
          test: store1,
        }, notify)

        expect(observeSpy.calls.count()).toEqual(1)
        expect(observeSpy).toHaveBeenCalledWith('foo')
      })
    })
  })

  describe('#registerStore', () => {
    var reactor
    var store1

    beforeEach(() => {
      store1 = new Store({
        getInitialState() {
          return 'foo'
        },
      })

      reactor = new Reactor({
        debug: true,
      })
    })

    afterEach(() => {
      reactor.reset()
    })

    it('it should register a store by id', () => {
      reactor.registerStore('test', store1)
      expect(reactor.evaluate(['test'])).toBe('foo')
    })
  })

  describe('#reset', () => {
    var reactor

    describe('when a store doesnt define a handleReset method', () => {
      var store1

      beforeEach(() => {
        store1 = new Store({
          getInitialState() {
            return 'foo'
          },
          initialize() {
            this.on('set', (_, val) => val)
          },
        })

        reactor = new Reactor({
          debug: true,
        })

        reactor.registerStores({
          test: store1,
        })
      })

      it('should fallback to the getInitialState', () => {
        reactor.dispatch('set', 'bar')

        expect(reactor.evaluate(['test'])).toBe('bar')

        reactor.reset()

        expect(reactor.evaluate(['test'])).toBe('foo')
      })
    })

    describe('when a store defines a handleReset method', () => {
      var store1

      beforeEach(() => {
        store1 = new Store({
          getInitialState() {
            return 'foo'
          },
          initialize() {
            this.on('set', (_, val) => val)
          },
          handleReset() {
            return 'reset'
          },
        })

        reactor = new Reactor({
          debug: true,
        })

        reactor.registerStores({
          test: store1,
        })
      })

      it('should fallback to the getInitialState', () => {
        reactor.dispatch('set', 'bar')

        expect(reactor.evaluate(['test'])).toBe('bar')

        reactor.reset()

        expect(reactor.evaluate(['test'])).toBe('reset')
      })
    })

    describe('when the handleReset method returns undefined', () => {
      var store1

      beforeEach(() => {
        store1 = new Store({
          getInitialState() {
            return 'foo'
          },
          initialize() {
            this.on('set', (_, val) => val)
          },
          handleReset() {
          },
        })

        reactor = new Reactor({
          debug: true,
        })

        reactor.registerStores({
          test: store1,
        })
      })

      it('should throw an error', () => {
        expect(function() {
          reactor.reset()
        }).toThrow()
      })
    })

    describe('when the handleReset method returns a non immutable object', () => {
      var store1

      beforeEach(() => {
        store1 = new Store({
          getInitialState() {
            return 'foo'
          },
          initialize() {
            this.on('set', (_, val) => val)
          },
          handleReset() {
            return {
              foo: 'bar',
            }
          },
        })

        reactor = new Reactor({
          debug: true,
        })

        reactor.registerStores({
          test: store1,
        })
      })

      it('should throw an error', () => {
        expect(function() {
          reactor.reset()
        }).toThrow()
      })
    })
  })
})
