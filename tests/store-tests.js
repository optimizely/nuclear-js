import { Map } from 'immutable'
import Store, { isStore } from '../src/store'

describe('Store', () => {
  describe('Immutable Store', () => {
    var exp1 = { id: 1, proj_id: 10 }
    var exp2 = { id: 2, proj_id: 10 }
    var exp3 = { id: 3, proj_id: 11 }

    var store
    var initial
    beforeEach(() => {
      store = new Store({

        getInitialState() {
          return Map({
            experiments: Map(),
          })
        },

        initialize: function() {
          this.on('addExperiments', (state, payload) => {
            return state.withMutations(innerState => {
              payload.data.forEach(item => {
                innerState.setIn(['experiments', item.id], Map(item))
              })
              return innerState
            })
          })

          this.on('removeExperiment', (state, payload) => {
            return state.update('experiments', exps => {
              return exps.remove(payload.id)
            })
          })
        },
      })

      initial = store.getInitialState()
      store.initialize()
    })

    it('should handle to addExperiments', function() {
      var experiments = [exp1, exp2, exp3]
      var newState = store.handle(initial, 'addExperiments', {
        data: experiments,
      })
      var results = newState.get('experiments').toList().toJS()
      expect(results).toEqual(experiments)
    })

    it('should handle to removeExperiments', function() {
      var experiments = [exp1, exp2, exp3]
      var newState = store.handle(initial, 'addExperiments', {
        data: experiments,
      })
      var finalState = store.handle(newState, 'removeExperiment', {
        id: 2,
      })
      var expected = [exp1, exp3]

      var results = finalState.get('experiments').toList().toJS()
      expect(results).toEqual(expected)
    })
  })

  describe('primitive Store', () => {
    var store = Store({
      getInitialState() {
        return 1
      },

      initialize() {
        this.on('increment', (state) => {
          return state + 1
        })
      },
    })

    var initialState = store.getInitialState()
    store.initialize()

    it('should be able to manage primitive state', () => {
      var newState = store.handle(initialState, 'increment')
      expect(newState).toBe(2)
    })

    it('should no-op when a message is passed that isn\'t registered', () => {
      var newState = store.handle(initialState, 'noop')
      expect(newState).toBe(1)
    })
  })

  describe('store with no config', () => {
    it('should allow creation of a store without a config', () => {
      expect(function() {
        Store()
      }).not.toThrow()
    })
  })

  describe('#isStore', () => {
    it('should return true if the store is an `instanceof` Store', () => {
      var store = new Store()
      expect(isStore(store)).toBe(true)
    })

    it('should return false if the store is NOT an `instanceof` Store', () => {
      var notStore = {}
      expect(isStore(notStore)).toBe(false)
    })
  })
})
