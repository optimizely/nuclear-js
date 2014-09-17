jest.autoMockOff();

var extend = require('../../src/utils').extend
var through = require('through')
// Real shit
var ActionTypes = require('../ActionTypes')
// transforms
var toJS = require('../../src/transforms/to-js');
var map = require('../../src/transforms/map');
var getIn = require('../../src/transforms/get-in');

xdescribe("EntityStore", () => {
  var flux
  var exp1 = { id: 1, val: 'exp 1', project_id: 10 }
  var exp2 = { id: 2, val: 'exp 2', project_id: 10 }
  var exp3 = { id: 3, val: 'exp 3', project_id: 11 }

  beforeEach(() => {
    flux = new Flux()
    flux.registerStore('Entity', EntityStore)
    flux.registerStore('CurrentProject', CurrentProjectStore)
    flux.registerComputed('UnsyncedEntities', ['Entity'], (input, output) => {
      input
        .transform(state => {
          return state.get('toSync').map(strKey => {
            return state.getIn(strKey.split('.'))
          }).toVector()
        })
        .pipe(output)
    })
  })

  describe("responding to `ActionTypes.ENTITY_FETCH_SUCCESS`", () => {
    it('should update the state of the stores', () => {
      flux.dispatch(ActionTypes.ENTITY_FETCH_SUCCESS, {
        entity: 'experiments',
        data: [exp1, exp2]
      })
      var exp1Result = flux.getState('Entity.experiments.1').toJS()
      var exp2Result = flux.getState('Entity.experiments.2').toJS()
      expect(exp1).toEqual(exp1Result)
      expect(exp2).toEqual(exp2Result)
    })

    it('should accurately keep tracked of unsynced entities', () => {
      var mockFn = jest.genMockFn()

      flux.computed('UnsyncedEntities')
        .transform(toJS)
        .pipe(through(mockFn))

      flux.dispatch(ActionTypes.ENTITY_FETCH_SUCCESS, {
        entity: 'experiments',
        data: [exp1, exp2]
      })

      expect(mockFn.mock.calls[0][0]).toEqual([])
    })
  })

  describe("responding to `ActionTypes.ENTITY_UPDATED`", () => {
    describe("when the store already contains synced entities", () => {
      var mockFn
      var updated

      beforeEach(() => {
        // pipe the computed to the mockFn
        mockFn = jest.genMockFn()
        flux.computed('UnsyncedEntities')
          .transform(toJS)
          .pipe(through(mockFn))

        // setup the existing entities
        flux.dispatch(ActionTypes.ENTITY_FETCH_SUCCESS, {
          entity: 'experiments',
          data: [exp1, exp2]
        })
        // create an update entity
        updated = extend({}, exp1, {
          val: 'exp 1 updated'
        })
        // dispatch the update
        flux.dispatch(ActionTypes.ENTITY_UPDATED, {
          entity: 'experiments',
          data: updated
        })
      })

      it('should update the entity', () => {
        var result = flux.getState(['Entity', 'experiments', exp1.id]).toJS()
        expect(updated).toEqual(result)
      })

      it('should accurately keep tracked of unsynced entities', () => {
        expect(mockFn.mock.calls[0][0]).toEqual([])
        expect(mockFn.mock.calls[1][0]).toEqual([updated])
      })
    })
  })

  describe("CurrentProject Experiments", () => {
    it("Emits data on the stream when the computed project experiments change", function() {
      var mockFn = jest.genMockFn()

      var unsyncedExperiments = flux.createComputedStream('CurrentProject.id', 'Entity.experiments')
        .transform(function(id, experimentMap) {
          if (!id) return

          return experimentMap.toVector().filter(exp => {
            return exp.get('project_id') === id
          })
        })
        .transform(toJS)
        .pipe(through(mockFn))

      flux.dispatch(ActionTypes.ENTITY_FETCH_SUCCESS, {
        entity: 'experiments',
        data: [exp1, exp2]
      })

      flux.dispatch(ActionTypes.CHANGE_CURRENT_PROJECT, {
        project: {
          id: 10
        }
      })

      expect(mockFn.mock.calls[0][0]).toEqual([exp1, exp2])
    })
  })
})
