
jest.autoMockOff()

var Immutable = require('immutable')
var ReactorCore = require('../src/reactor-core')
var Reactor = require('../src/reactor')
var remove = require('../src/immutable-helpers').remove
var update = require('../src/immutable-helpers').update

describe('Reactor', () => {
  var exp1 = { id: 1, proj_id: 10 }
  var exp2 = { id: 2, proj_id: 10 }
  var exp3 = { id: 3, proj_id: 11 }

  var onExperimentAdd = function(state, payload) {
    var data = payload.data

    return state.withMutations(state => {
      data.forEach(item => {
        state.updateIn(['experiments', item.id], x => item)
      })
      return state
    })
  }

  var onExperimentRemove = function(state, payload) {
    return remove(state, ['experiments', payload.id])
  }

  var onCurrentProjectChange = function(state, payload) {
    return state.set('id', payload.id)
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

      reactor.cycle({
        type: 'addExperiments',
        payload: {
          data: experiments
        }
      })

      var results = reactor.getImmutable('ExperimentCore.experiments').toVector().toJS()
      expect(experiments).toEqual(results)
    })
  })

  describe("when attaching a core with computeds", () => {
    beforeEach(() => {
      var computedCore = new ReactorCore()
      computedCore.initialize = function() {
        return {
          foo: 'bar'
        }
      }
      computedCore.computed('baz', ['foo'], (val) => {
        return val + 'baz'
      })

      reactor.attachCore('computed', computedCore)
    })

    it("should initialize with the computed", () => {
      expect(reactor.get('computed.baz')).toBe('barbaz')
    })
  })

  describe('#get', () => {
    it('should return the value if passed a string', () => {
      reactor.state = Immutable.fromJS({
        foo: {
          bar: 'baz'
        }
      })

      expect(reactor.get('foo.bar')).toBe('baz')
    })

    it('should return the value if passed an array', () => {
      reactor.state = Immutable.fromJS({
        foo: {
          bar: 'baz'
        }
      })

      expect(reactor.get(['foo', 'bar'])).toBe('baz')
    })

    it('should respect numbers if passed an array', () => {
      var inner = Immutable.Map([[123, 'baz']])

      reactor.state = Immutable.Map({
        foo: inner
      })

      expect(reactor.get(['foo', 123])).toBe('baz')
    })

    it('should not coerce to numbers if passed a string', () => {
      var inner = Immutable.Map([[123, 'baz']])

      reactor.state = Immutable.Map({
        foo: inner
      })

      expect(reactor.get('foo.123')).toBe(undefined)
    })

    it("should not throw an error when called on a `null` value", () => {
      reactor.state = Immutable.Map({
        foo: null
      })

      expect(reactor.get('foo')).toBe(null)
    })
  })
})
