var Immutable = require('immutable')
var List = require('immutable').List
var Map = require('immutable').Map
var Computed = require('../src/computed')
var Store = require('../src/store')

describe('Store', () => {
  describe("Immutable Store", () => {
    var exp1 = { id: 1, proj_id: 10 }
    var exp2 = { id: 2, proj_id: 10 }
    var exp3 = { id: 3, proj_id: 11 }

    var store = new Store({
      getInitialState() {
        return Map({
          experiments: Map()
        })
      },

      initialize: function() {
        this.on('addExperiments', (state, payload) => {
          return state.withMutations(state => {
            payload.data.forEach(item => {
              state.setIn(['experiments', item.id], Map(item))
            })
            return state
          })
        })

        this.on('removeExperiment', (state, payload) => {
          return state.update('experiments', exps => {
            return exps.remove(payload.id)
          })
        })

        this.computed('project10', ['experiments'], (exps) => {
          return exps.filter(exp => {
            return exp.get('proj_id') === 10
          })
        })

        this.computed('length', ['experiments'], (exps) => {
          return exps.size
        })
      }
    })

    var initial = store.getInitialState()
    store.initialize()

    it('getInitialStateWithComputeds should execute computeds', () => {
      var initialComputedState = store.getInitialStateWithComputeds()

      var expected = Map({
        experiments: Map(),
        length: 0,
        project10: Map(),
      })
      expect(Immutable.is(expected, initialComputedState)).toBe(true)
    })

    it('should handle to addExperiments', function() {
      var experiments = [exp1, exp2, exp3]
      var newState = store.handle(initial, 'addExperiments', {
        data: experiments
      })
      var results = newState.get('experiments').toList().toJS()
      expect(results).toEqual(experiments)
    })

    it('should handle to removeExperiments', function() {
      var experiments = [exp1, exp2, exp3]
      var newState = store.handle(initial, 'addExperiments', {
        data: experiments
      })
      var finalState = store.handle(newState, 'removeExperiment', {
        id: 2
      })
      var expected = [exp1, exp3]

      var results = finalState.get('experiments').toList().toJS()
      expect(results).toEqual(expected)
    })

    describe('computeds', () => {
      it('should evaluate the computeds at every handle', () => {
        var experiments = [exp1, exp2, exp3]
        var newState = store.handle(initial, 'addExperiments', {
          data: experiments
        })
        var results = newState.get('project10').toList().toJS()
        var expected = [exp1, exp2]
        expect(expected).toEqual(results)
        expect(newState.get('length')).toEqual(3)
      })
    })
  })

  describe("primitive Store", () => {
    var store = Store({
      getInitialState() {
        return 1
      },

      initialize() {
        this.on('increment', (state) => {
          return state + 1
        })
      }
    })

    var initialState = store.getInitialState()
    store.initialize()

    it('should be able to manage primitive state', () => {
      var newState = store.handle(initialState, 'increment');
      expect(newState).toBe(2);
    })

    it('should no-op when a message is passed that isn\'t registered', () => {
      var newState = store.handle(initialState, 'noop');
      expect(newState).toBe(1);
    })
  })
})
