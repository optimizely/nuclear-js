jest.autoMockOff()

var Immutable = require('immutable')
var Map = require('immutable').Map
var List = require('immutable').List
var Nuclear = require('../src/main')

var itemsState = Nuclear.ReactiveState({
  getInitialState() {
    return {
      all: {},
    }
  },

  initialize() {
    this.on('addItem', (state, item) => {
      return state.update('all', items => {
        return items.set(item.id, Map(item))
      })
    })

    this.on('updateItem', (state, updated) => {
      return state.updateIn(['all', updated.id], item => {
        return item.set('val', updated.val)
      })
    })

    this.computed('count', ['all'], (items) => {
      return items.size
    })
  },
})

var reactorConfig = {
  state: {
    items: itemsState,
  }
}

describe('Reactor', () => {
  var reactor
  var cursor
  var item1 = {
    id: 1,
    val: 'a'
  }
  var item2 = {
    id: 2,
    val: 'b'
  }

  describe('Reactor with no initial state', () => {
    beforeEach(() => {
      reactor = Nuclear.Reactor(reactorConfig)
      reactor.initialize()

      reactor.dispatch('addItem', item1)
      reactor.dispatch('addItem', item2)
    })

    it('should create a cursor pointing to an item in a map', () => {
      var item1Cursor = reactor.cursor(['items', 'all', item1.id])

      expect(item1Cursor.get('id')).toBe(1)
      expect(item1Cursor.get('val')).toBe('a')

      var expected = Map({
        id: 1,
        val: 'a'
      })

      var state = item1Cursor.get()

      expect(Immutable.is(expected, state))
    })

    it('should allow dispatching to the entire reactor', () => {
      var item3 = {
        id: 3,
        val: 'c'
      }
      var item1Cursor = reactor.cursor(['items', 'all', item1.id])

      item1Cursor.dispatch('addItem', item3)

      var result = reactor.get(['items', 'all', item3.id])
      expect(Immutable.is(result, Map(item3))).toBe(true)
    })

    it('onChange should scope to the cursor prefix', () => {
      var mockFn = jest.genMockFn()
      var item1Cursor = reactor.cursor(['items', 'all', item1.id])
      item1Cursor.onChange(mockFn)

      item1Cursor.dispatch('updateItem', {
        id: 1,
        val: 'new'
      })

      var firstCallArg = mockFn.mock.calls[0][0]
      var expected = Map({
        id: 1,
        val: 'new'
      })

      expect(mockFn.mock.calls.length).toEqual(1)
      expect(Immutable.is(firstCallArg, expected)).toBe(true)
    })

    it('onChange should to be scoped to prefix + keyPath', () => {
      var mockFn = jest.genMockFn()
      var item1Cursor = reactor.cursor(['items', 'all', item1.id])
      item1Cursor.onChange('val', mockFn)

      item1Cursor.dispatch('updateItem', {
        id: 1,
        val: 'new'
      })

      expect(mockFn.mock.calls.length).toEqual(1)
      var firstCallArg = mockFn.mock.calls[0][0]
      expect(firstCallArg).toEqual('new')
    })
  })
})

