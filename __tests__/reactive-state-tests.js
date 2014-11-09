jest.autoMockOff()

var Immutable = require('immutable')
var List = require('immutable').List
var Map = require('immutable').Map
var Computed = require('../src/computed')
var ReactiveState = require('../src/reactive-state')

describe('ReactiveState', () => {
  describe("Immutable ReactiveState", () => {
    var exp1 = { id: 1, proj_id: 10 }
    var exp2 = { id: 2, proj_id: 10 }
    var exp3 = { id: 3, proj_id: 11 }

    var handler = new ReactiveState({
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
      }
    })

    var initial = handler.getInitialState()
    handler.initialize()

    it('should react to addExperiments', function() {
      var experiments = [exp1, exp2, exp3]
      var newState = handler.react(initial, 'addExperiments', {
        data: experiments
      })
      var results = newState.get('experiments').toList().toJS()
      expect(results).toEqual(experiments)
    })

    it('should react to removeExperiments', function() {
      var experiments = [exp1, exp2, exp3]
      var newState = handler.react(initial, 'addExperiments', {
        data: experiments
      })
      var finalState = handler.react(newState, 'removeExperiment', {
        id: 2
      })
      var expected = [exp1, exp3]

      var results = finalState.get('experiments').toList().toJS()
      expect(results).toEqual(expected)
    })

    describe('computeds', () => {
      it('should evaluate the computeds at every react', () => {
        var experiments = [exp1, exp2, exp3]
        var newState = handler.react(initial, 'addExperiments', {
          data: experiments
        })
        var results = newState.get('project10').toList().toJS()
        var expected = [exp1, exp2]
        expect(expected).toEqual(results)
      })
    })
  })

  describe("primitive ReactiveState", () => {
    var handler = ReactiveState({
      getInitialState() {
        return 1
      },

      initialize() {
        this.on('increment', (state) => {
          return state + 1
        })
      }
    })

    var initialState = handler.getInitialState()
    handler.initialize()

    it('should be able to manage primitive state', () => {
      var newState = handler.react(initialState, 'increment');
      expect(newState).toBe(2);
    })

    it('should no-op when a message is passed that isn\'t registered', () => {
      var newState = handler.react(initialState, 'noop');
      expect(newState).toBe(1);
    })
  })
})
