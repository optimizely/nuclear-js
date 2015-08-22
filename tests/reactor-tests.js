var Immutable = require('immutable')
var Map = require('immutable').Map
var List = require('immutable').List
var Reactor = require('../src/main').Reactor
var Store = require('../src/main').Store
var toImmutable = require('../src/immutable-helpers').toImmutable
var logging = require('../src/logging')


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
          this.on('storeError', (state, payload) => {
            throw new Error('Store Error')
          })
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

        var firstCallArg = mockFn.calls.argsFor(0)[0]

        expect(mockFn.calls.count()).toBe(1)
        expect(Immutable.is(firstCallArg, expected)).toBe(true)
      })

      it('should not emit to the outputStream if state does not change after a dispatch', () => {
        var mockFn = jasmine.createSpy()
        reactor.observe(mockFn)

        reactor.dispatch('noop', {})

        expect(mockFn.calls.count()).toEqual(0)
      })

      it('should raise an error if already dispatching another action', () => {
        reactor.observe([], state => reactor.dispatch('noop', {}))

        expect(() => checkoutActions.setTaxPercent(5)).toThrow(
          new Error('Dispatch may not be called while a dispatch is in progress'))
      })

      it('should keep working after it raised for dispatching while dispatching', () => {
        var unWatchFn = reactor.observe([], state => reactor.dispatch('noop', {}))

        expect(() => checkoutActions.setTaxPercent(5)).toThrow(
          new Error('Dispatch may not be called while a dispatch is in progress'))

        unWatchFn()

        expect(() => checkoutActions.setTaxPercent(5)).not.toThrow(
          new Error('Dispatch may not be called while a dispatch is in progress'))
      })

      it('should allow subsequent dispatches if a store throws an error', () => {
        try {
          reactor.dispatch('storeError')
        } catch (e) {} // eslint-disable-line

        expect(() => reactor.dispatch('setTax', 5)).not.toThrow()
      })

      it('should allow subsequent dispatches if a dispatched action doesnt cause state change', () => {
        reactor.dispatch('noop')

        expect(() => reactor.dispatch('setTax', 5)).not.toThrow()
      })

      it('should allow subsequent dispatches if an observer throws an error', () => {
        var unWatchFn = reactor.observe([], state => {
          throw new Error('observer error')
        })

        try {
          checkoutActions.setTaxPercent(1)
        } catch (e) {} // eslint-disable-line

        unWatchFn()

        expect(() => {
          checkoutActions.setTaxPercent(2)
        }).not.toThrow()
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

  describe('when debug is true and a store has a handler for an action but throws', () => {
    var reactor

    beforeEach(() => {
      spyOn(logging, 'dispatchError')
      var throwingStore = new Store({
        getInitialState() {
          return 1
        },
        initialize() {
          this.on('set', (_, val) => {throw new Error('Error during action handling')})
        },
      })

      reactor = new Reactor({
        debug: true,
      })
      reactor.registerStores({
        test: throwingStore,
      })
    })

    afterEach(() => {
      reactor.reset()
    })

    it('should log and throw an error', function() {
      expect(function() {
        reactor.dispatch('set', 'foo')
      }).toThrow(new Error('Error during action handling'))
      expect(logging.dispatchError).toHaveBeenCalledWith('Error during action handling')
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

  describe('serialize/loadState', () => {
    var reactor
    var stores

    beforeEach(() => {
      reactor = new Reactor({
        debug: true,
      })

      stores = {
        mapStore: Store({
          getInitialState() {
            return Immutable.Map([
              [1, 'one'],
              [2, 'two'],
            ])
          },
          initialize() {
            this.on('clear', state => null)
          },
          serialize(state) {
            if (!state) {
              return state
            }
            return state.entrySeq().toJS()
          },
          deserialize(state) {
            return Immutable.Map(state)
          },
        }),

        stringStore: Store({
          getInitialState() {
            return 'foo'
          },
          initialize() {
            this.on('clear', state => null)
          },
        }),

        listStore: Store({
          getInitialState() {
            return toImmutable([1, 2, 'three'])
          },
          initialize() {
            this.on('clear', state => null)
          },
        }),

        booleanStore: Store({
          getInitialState() {
            return true
          },
          initialize() {
            this.on('clear', state => null)
          },
        }),
      }

      reactor.registerStores(stores)
    })

    afterEach(() => {
      reactor.reset()
    })

    it('should serialize -> loadState effectively', () => {
      var serialized = reactor.serialize()
      var reactor2 = new Reactor()
      reactor2.registerStores(stores)
      reactor2.dispatch('clear')

      expect(Immutable.is(reactor.evaluate([]), reactor2.evaluate([]))).toBe(false)

      reactor2.loadState(serialized)
      expect(Immutable.is(reactor.evaluate([]), reactor2.evaluate([]))).toBe(true)
    })

    it('should allow loading of state from outside source', () => {
      reactor.loadState({
        stringStore: 'bar',
        listStore: [4, 5, 6],
      })

      expect(reactor.evaluateToJS([])).toEqual({
        mapStore: {
          1: 'one',
          2: 'two',
        },
        stringStore: 'bar',
        listStore: [4, 5, 6],
        booleanStore: true,
      })
    })

    it('should notify observer', () => {
      var mockFn = jasmine.createSpy()
      var serialized = reactor.serialize()
      var reactor2 = new Reactor()
      reactor2.registerStores(stores)
      reactor2.dispatch('clear')

      reactor2.observe(['stringStore'], mockFn)

      reactor2.loadState(serialized)

      var firstCallArg = mockFn.calls.argsFor(0)

      expect(mockFn.calls.count()).toBe(1)
      expect(Immutable.is(firstCallArg, 'foo'))
    })

    describe('when extending Reactor#serialize and Reactor#loadState', () => {
      var loadStateSpy = jasmine.createSpy('loadState')
      var serializeSpy = jasmine.createSpy('serialize')

      it('should respect the extended methods', () => {
        class MyReactor extends Reactor {
          constructor() {
            super(arguments)
          }

          serialize(state) {
            serializeSpy(state)
            var serialized = super(state)
            return JSON.stringify(serialized)
          }

          loadState(state) {
            loadStateSpy(state)
            super(JSON.parse(state))
          }
        }
        var reactor1 = new MyReactor()
        reactor1.registerStores(stores)
        var reactor2 = new MyReactor()
        reactor2.registerStores(stores)

        var serialized = reactor1.serialize()

        reactor2.dispatch('clear')

        expect(Immutable.is(reactor1.evaluate([]), reactor2.evaluate([]))).toBe(false)

        reactor2.loadState(serialized)
        expect(Immutable.is(reactor.evaluate([]), reactor2.evaluate([]))).toBe(true)

        expect(serializeSpy.calls.count()).toBe(1)
        expect(loadStateSpy.calls.count()).toBe(1)
      })
    })

    describe('when a store returns undefined from serialize/deserialize', () => {
      beforeEach(() => {
        reactor = new Reactor()
        reactor.registerStores({
          serializableStore: Store({
            getInitialState() {
              return 'real'
            },
          }),

          ignoreStore: Store({
            getInitialState() {
              return 'ignore'
            },
            serialize() {
              return
            },
            deserialize() {
              return
            },
          }),
        })
      })

      it('should not have an entry in the serialized app state', () => {
        var serialized = reactor.serialize()
        expect(serialized).toEqual({
          serializableStore: 'real',
        })
      })

      it('should not load state for a store where deserialize returns undefined', () => {
        var serialized = {
          serializableStore: 'changed',
          ignoreStore: 'changed',
        }
        reactor.loadState(serialized)
        expect(reactor.evaluateToJS([])).toEqual({
          serializableStore: 'changed',
          ignoreStore: 'ignore',
        })
      })
    })
  })

  describe('#batch', () => {
    var reactor

    beforeEach(() => {
      reactor = new Reactor({
        debug: true,
      })
      reactor.registerStores({
        listStore: Store({
          getInitialState() {
            return toImmutable([])
          },
          initialize() {
            this.on('add', (state, item) => state.push(toImmutable(item)))
            this.on('error', (state, payload) => {
              throw new Error('store error')
            })
          },
        }),
      })
    })

    afterEach(() => {
      reactor.reset()
    })

    it('should execute multiple dispatches within the queue function', () => {
      reactor.batch(() => {
        reactor.dispatch('add', 'one')
        reactor.dispatch('add', 'two')
      })

      expect(reactor.evaluateToJS(['listStore'])).toEqual(['one', 'two'])
    })

    it('should notify observers only once', () => {
      var observeSpy = jasmine.createSpy()

      reactor.observe(['listStore'], list => observeSpy(list.toJS()))

      reactor.batch(() => {
        reactor.dispatch('add', 'one')
        reactor.dispatch('add', 'two')
      })

      expect(observeSpy.calls.count()).toBe(1)

      var firstCallArg = observeSpy.calls.argsFor(0)[0]

      expect(observeSpy.calls.count()).toBe(1)
      expect(firstCallArg).toEqual(['one', 'two'])
    })

    it('should allow nested batches and only notify observers once', () => {
      var observeSpy = jasmine.createSpy()

      reactor.observe(['listStore'], list => observeSpy(list.toJS()))

      reactor.batch(() => {
        reactor.dispatch('add', 'one')
        reactor.batch(() => {
          reactor.dispatch('add', 'two')
          reactor.dispatch('add', 'three')
        })
      })

      expect(observeSpy.calls.count()).toBe(1)

      var firstCallArg = observeSpy.calls.argsFor(0)[0]

      expect(observeSpy.calls.count()).toBe(1)
      expect(firstCallArg).toEqual(['one', 'two', 'three'])
    })

    it('should not allow dispatch to be called from an observer', () => {
      reactor.observe([], state => reactor.dispatch('noop', {}))

      expect(() => {
        reactor.batch(() => {
          reactor.dispatch('add', 'one')
          reactor.dispatch('add', 'two')
        })
      }).toThrow(
        new Error('Dispatch may not be called while a dispatch is in progress'))
    })

    it('should keep working after it raised for dispatching while dispatching', () => {
      var unWatchFn = reactor.observe([], state => reactor.dispatch('noop', {}))

      expect(() => {
        reactor.batch(() => {
          reactor.dispatch('add', 'one')
          reactor.dispatch('add', 'two')
        })
      }).toThrow(
        new Error('Dispatch may not be called while a dispatch is in progress'))

      unWatchFn()

      expect(() => {
        reactor.batch(() => {
          reactor.dispatch('add', 'one')
          reactor.dispatch('add', 'two')
        })
      }).not.toThrow(
        new Error('Dispatch may not be called while a dispatch is in progress'))
    })

    it('should allow subsequent dispatches if an error is raised by a store handler', () => {
      expect(() => {
        reactor.batch(() => {
          reactor.dispatch('add', 'one')
          reactor.dispatch('error')
        })
      }).toThrow(new Error('store error'))

      expect(() => {
        reactor.dispatch('add', 'three')
      }).not.toThrow()
    })

    it('should allow subsequent dispatches if batched action doesnt cause state change', () => {
      reactor.batch(() => {
        reactor.dispatch('noop')
      })

      expect(() => reactor.dispatch('add', 'one')).not.toThrow()
    })

    it('should allow subsequent dispatches if an error is raised in an observer', () => {
      var unWatchFn = reactor.observe([], state => {
        throw new Error('observe error')
      })

      expect(() => {
        reactor.batch(() => {
          reactor.dispatch('add', 'one')
          reactor.dispatch('add', 'two')
        })
      }).toThrow(
        new Error('observe error'))

      unWatchFn()

      expect(() => {
        reactor.dispatch('add', 'three')
      }).not.toThrow()
    })
  })

  describe('issue #140 - change observer error case dealing with hashCode collisions', () => {
    it('observer should be called correctly', () => {
      var SET_YEAR_GROUP = 'SET_YEAR_GROUP'
      var LOADED = 'LOADED'

      var store = Store({
        getInitialState: function() {
          return toImmutable({
            yearGroup: 0,
            shouldLoaded: true,
          })
        },

        initialize: function() {
          this.on(SET_YEAR_GROUP, setYearGroup)
          this.on(LOADED, loaded)
        },
      })

      function setYearGroup(store, payload) {
        return store
          .set('yearGroup', payload.yearGroup)
          .set('shouldLoad', true)
      }

      function loaded(store) {
        return store.set('shouldLoad', false)
      }

      var reactor = new Reactor()

      reactor.registerStores({ uiStore: store })

      var output = []
      // Record changes to yearGroup
      reactor.observe(['uiStore', 'yearGroup'], function(y) { output.push(y) })

      reactor.dispatch(SET_YEAR_GROUP, {yearGroup: 6})
      reactor.dispatch(LOADED)
      reactor.dispatch(SET_YEAR_GROUP, {yearGroup: 5})

      expect(output).toEqual([6, 5])
    })
  })
})
