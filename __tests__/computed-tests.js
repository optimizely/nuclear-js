jest.autoMockOff()

var Immutable = require('immutable')
var remove = require('../src/immutable-helpers').remove

var calculateComputed = require('../src/calculate-computed')
var ComputedEntry = require('../src/computed-entry')

describe('calculating a computed', () => {
  var exp1 = { id: 1, proj_id: 10 }
  var exp2 = { id: 2, proj_id: 10 }
  var exp3 = { id: 3, proj_id: 11 }
  var initial = Immutable.fromJS({
    Entity: {
      experiments: {
        1: exp1,
        2: exp2,
        3: exp3,
      }
    },
  })

  var next = initial.updateIn(['CurrentProject', 'id'], x => {
    return 10
  })

  describe("calcuating current project experiments", () => {
    var computedEntry
    beforeEach(() => {
      var keyPath = ['CurrentProject', 'experiments']
      var deps = ['Entity.experiments', 'CurrentProject.id']
      var compute = function(experiments, id) {
        return experiments.filter(exp => {
          return exp.get('proj_id') === id
        })
      }

      computedEntry = new ComputedEntry(keyPath, deps, compute)
    })

    it('should evaluate the computed and emit a new state', () => {
      var newState = calculateComputed(initial, next, computedEntry)

      var result = newState.getIn(['CurrentProject', 'experiments']).toVector().toJS()
      expect(result).toEqual([exp1, exp2])
    })

    it('shoud not affect other parts of the tree that haven\'t changed', () => {
      var newState = calculateComputed(initial, next, computedEntry)
      expect(newState.get('experiments')).toBe(initial.get('experiments'))
    })

    it("should compute if the last state was empty", () => {
      var lastState = Immutable.Map({})
      var newState = calculateComputed(lastState, next, computedEntry)


      var result = newState.getIn(['CurrentProject', 'experiments']).toVector().toJS()
      expect(result).toEqual([exp1, exp2])
    })

    it('should not compute if any value is undefined', () => {
      var removedState = next.remove('CurrentProject')
      var newState = calculateComputed(initial, removedState, computedEntry)

      var result = newState.getIn(['CurrentProject', 'experiments'])
      expect(result).toEqual(undefined)
    })

    describe('if a value was already computed and then becomes undefined', () => {
      it('should set the computed keyPath as undefined', () => {
        var newState = calculateComputed(initial, next, computedEntry)
        var removedState = remove(newState, ['CurrentProject', 'id'])

        var finalState = calculateComputed(newState, removedState, computedEntry)

        var result = finalState.getIn(['CurrentProject', 'experiments'])
        expect(result).toEqual(undefined)
      })
    })
  })
})
