jest.autoMockOff()

var Flux = require('../src/Flux')
var EntityMutator = require('./mocks/EntityMutator')
var CurrentProjectMutator = require('./mocks/CurrentProjectMutator')
var through = require('through')
var toJS = require('../src/transforms/to-js')

describe("StoreWatcher", () => {
  var flux
  // mock data
  var experiments = [
    { id: 1, value: 'exp 1', project_id: 3 },
    { id: 2, value: 'exp 2', project_id: 4 }
  ]
  var projects = [
    { id: 3, value: 'proj 1' },
    { id: 4, value: 'proj 2' }
  ]

  beforeEach(() => {
    flux = new Flux()
    flux.registerMutator('CurrentProject', CurrentProjectMutator)
    flux.registerMutator('Entity', EntityMutator)
  })

  describe("subscribing to CurrentProject", () => {
    it("should emit anytime the store changes", () => {
      var mockFn = jest.genMockFn()

      flux.dispatch('changeCurrentProjectId', {
        id: 123
      })

      var stream = flux.subscribe('CurrentProject')
      .transform(toJS)
      .pipe(through(mockFn))

      expect(mockFn.mock.calls[0][0]).toEqual({
        id: 123
      })
    })
  })

  describe("subscribing to Entity", () => {
    it("should not emit on the stream if a different part of the store changes", () => {
      var mockFn = jest.genMockFn()

      flux.subscribe('Entity.projects')
        .transform(x => {
          return x.toVector()
        })
        .transform(toJS)
        .pipe(through(mockFn))

      flux.dispatch('entityLoaded', {
        entity: 'experiemnts',
        data: experiments
      })

      flux.dispatch('entityLoaded', {
        entity: 'projects',
        data: projects
      })

      expect(mockFn.mock.calls.length).toEqual(1)
      expect(mockFn.mock.calls[0][0]).toEqual(projects)
    })
  })

  describe("subscribing to two Stores", () => {
    it.only("should get events when either changes", () => {
      var mockFn = jest.genMockFn()

      flux.subscribe('Entity.experiments', 'CurrentProject.id')
        .transform(function(experiments, id) {
          if (!id) return

          /** @type {Immutable.Map} */
          return experiments.filter(exp => {
            return exp.get('project_id') === id
          }).toVector()
        })
        .transform(toJS)
        .pipe(through(mockFn))

      flux.dispatch('entityLoaded', {
        entity: 'experiments',
        data: experiments
      })

      flux.dispatch('changeCurrentProjectId', {
        id: 3
      })

      expect(mockFn.mock.calls[0][0]).toEqual([experiments[0]])
    })
  })
})
