jest.autoMockOff()

var Immutable = require('immutable')
var Getter = require('../src/getter')
var ReactorCore = require('../src/reactor-core')

describe('ReactorCore', () => {
  describe("Immutable state ReactorCore", () => {
    var exp1 = { id: 1, proj_id: 10 }
    var exp2 = { id: 2, proj_id: 10 }
    var exp3 = { id: 3, proj_id: 11 }

    var onExperimentAdd = function(state, payload) {
      var data = payload.data
      return state.withMutations(state => {
        data.forEach(item => {
          var immutableExp = Immutable.Map(item)
          state.updateIn(['experiments', item.id], old => immutableExp);
        })
        return state
      })
    }

    var onExperimentRemove = function(state, payload) {
      return state.update('experiments', exps => {
        return exps.remove(payload.id)
      })
    }

    var initial = Immutable.Map({})

    var core

    beforeEach(() => {
      core = new ReactorCore()
      core.on('addExperiments', onExperimentAdd)
      core.on('removeExperiment', onExperimentRemove)
      core.computed('project10', Getter({
        deps: ['experiments'],
        compute(exps) {
          return exps.filter(exp => {
            return exp.get('proj_id') === 10
          })
        }
      }))
    })

    it('should react to addExperiments', function() {
      var experiments = [exp1, exp2, exp3]
      var newState = core.react(initial, 'addExperiments', {
        data: experiments
      })
      var results = newState.get('experiments').toVector().toJS()
      expect(results).toEqual(experiments)
    })

    it('should react to removeExperiments', function() {
      var experiments = [exp1, exp2, exp3]
      var newState = core.react(initial, 'addExperiments', {
        data: experiments
      })
      var finalState = core.react(newState, 'removeExperiment', {
        id: 2
      })
      var expected = [exp1, exp3]

      var results = finalState.get('experiments').toVector().toJS()
      expect(results).toEqual(expected)
    })

    describe('computeds', () => {
      it('should evaluate the computeds at every react', () => {
        var experiments = [exp1, exp2, exp3]
        var newState = core.react(initial, 'addExperiments', {
          data: experiments
        })
        var results = newState.get('project10').toVector().toJS()
        var expected = [exp1, exp2]
        expect(expected).toEqual(results)
      })
    })
  })

  describe("primitive state ReactorCore", () => {
    var initialState
    var core

    beforeEach(() => {
      initialState = 1;
      core = new ReactorCore()
      core.on('increment', (state, payload) => {
        return state + 1
      });
    })

    it('should be able to manage primitive state', () => {
      var newState = core.react(initialState, 'increment');
      expect(newState).toBe(2);
    })

    it('should no-op when a message is passed that isn\'t registered', () => {
      var newState = core.react(initialState, 'noop');
      expect(newState).toBe(1);
    })
  })
})
