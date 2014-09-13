jest.autoMockOff();

var extend = require('../src/utils').extend
var through = require('through')
// Real shit
var EntityStore = require('./mocks/EntityStore');
var Flux = require('../src/Flux');
// transforms
var toJS = require('../src/transforms/to-js');
var flatten = require('../src/transforms/flatten-map-contents');
var first = require('../src/transforms/first-element');
var getIn = require('../src/transforms/get-in');

describe("EntityStore", () => {
  var flux
  var entityStore
  var exp1 = { id: 1, val: 'exp 1', project_id: 10 }
  var exp2 = { id: 2, val: 'exp 2', project_id: 10 }
  var exp3 = { id: 3, val: 'exp 3', project_id: 11 }

  beforeEach(() => {
    entityStore = new EntityStore()
    flux = new Flux()
    flux.registerStore('Entity', entityStore)
  })

  describe("responding to `entityUpdated`", () => {
    it('should update the state of the stores', () => {
      flux.dispatch('entityUpdated', {
        entity: 'experiments',
        data: [exp1, exp2]
      })
      var exp1Result = flux.getState('Entity.experiments.1').toJS()
      var exp2Result = flux.getState('Entity.experiments.2').toJS()
      expect(exp1).toEqual(exp1Result)
      expect(exp2).toEqual(exp2Result)
    })
  })

  describe("responding to `entityFetched`", () => {
    beforeEach(() => {
      flux.dispatch('entityFetched', {
        entity: 'experiments',
        data: [exp1, exp2]
      })
    })

    it('should update the state of the store', () => {
      var exp1Result = flux.getState('Entity.experiments.1').toJS()
      var exp2Result = flux.getState('Entity.experiments.2').toJS()
      expect(exp1).toEqual(exp1Result)
      expect(exp2).toEqual(exp2Result)
    })

    it("unsyncedEntities computed", function() {
      var mockFn = jest.genMockFn()

      var unsyncedExperiments = flux.createComputedStream('Entity.__unsynced')
        .transform(first)
        .transform(function(data) {
          console.log('after first | ', data.toString())
          return data;
        })
        .transform(flatten)
        .transform(function(data) {
          console.log('after flatten | ', data.toString())
          return data;
        })
        .transform(getIn('experiments'))
        .transform(function(data) {
          console.log('after getIn | ', data.toString())
          return data;
        })
        .transform(toJS)
        .pipe(through(mockFn))

      flux.registerComputed("unsyncedExperiments", unsyncedExperiments)

      var updatedExp1 = extend(exp1, {
        val: 'new value'
      })

      flux.dispatch('entityUpdated', {
        entity: 'experiments',
        data: [exp1]
      })

      expect(mockFn.mock.calls[0][0]).toEqual([updatedExp1])
    })
  })
})
