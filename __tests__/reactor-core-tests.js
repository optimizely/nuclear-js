jest.autoMockOff()

var Immutable = require('immutable')
var ReactorCore = require('../src/reactor-core')
var remove = require('../src/immutable-helpers').remove
var update = require('../src/immutable-helpers').update

describe('ReactorCore', () => {
  var exp1 = { id: 1, proj_id: 10 }
  var exp2 = { id: 2, proj_id: 10 }
  var exp3 = { id: 3, proj_id: 11 }

  var onExperimentAdd = function(state, payload) {
    var data = payload.data
    return state.withMutations(state => {
      data.forEach(item => {
        update(state, ['experiments', item.id], item)
      })
      return state
    })
  }

  var onExperimentRemove = function(state, payload) {
    var idToRemove = payload.id
    return remove(state, ['experiments', payload.id])
  }

  var initial = Immutable.Map({})

  var core

  beforeEach(() => {
    core = new ReactorCore()
    core.on('addExperiments', onExperimentAdd)
    core.on('removeExperiment', onExperimentRemove)
    core.computed('project10', ['experiments'], function(exps) {
      return exps.filter(exp => {
        return exp.get('proj_id') === 10
      })
    })
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
