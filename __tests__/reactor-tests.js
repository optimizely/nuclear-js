
jest.autoMockOff()

var Immutable = require('immutable')
var ReactorCore = require('../src/ReactorCore')
var Reactor = require('../src/Reactor')
var remove = require('../src/immutable-helpers').remove
var mutate = require('../src/immutable-helpers').mutate
var update = require('../src/immutable-helpers').update

describe('ReactorCore', () => {
  var exp1 = { id: 1, proj_id: 10 }
  var exp2 = { id: 2, proj_id: 10 }
  var exp3 = { id: 3, proj_id: 11 }

  var onExperimentAdd = function(state, payload) {
    var data = payload.data
    return mutate(state, state => {
      data.forEach(item => {
        update(state, ['experiments', item.id], item)
      })
    })
  }

  var onExperimentRemove = function(state, payload) {
    var idToRemove = payload.id
    return remove(state, ['experiments', payload.id])
  }

  var onCurrentProjectChange = function(state, payload) {
    return update(state, ['id'], payload.id)
  }

  var ExperimentCore
  var CurrentProjectCore

  var reactor

  beforeEach(() => {
    ExperimentCore = new ReactorCore()
    ExperimentCore.on('addExperiments', onExperimentAdd)
    ExperimentCore.on('removeExperiment', onExperimentRemove)

    CurrentProjectCore = new ReactorCore()
    CurrentProjectCore.on('changeCurrentProject', onCurrentProjectChange)

    reactor = new Reactor()
    reactor.attachCore('ExperimentCore', ExperimentCore)
    reactor.attachCore('CurrentProjectCore', CurrentProjectCore)
  })

  describe('writing actions to the inputStream', () => {
    it("should successfully read 'ExperimentCore.experiments'", () => {
      var experiments = [exp1, exp2, exp3]

      reactor.inputStream.write({
        type: 'addExperiments',
        payload: {
          data: experiments
        }
      })

      var results = reactor.getImmutable('ExperimentCore.experiments').toVector().toJS()
      expect(experiments).toEqual(results)
    })
  })
})
