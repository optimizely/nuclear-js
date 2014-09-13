jest.autoMockOff()

var Flux = require('../src/Flux')
var CurrentProjectStore = require('./mocks/CurrentProjectStore')
var EntityStore = require('./mocks/EntityStore')
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
    flux.registerStore('EntityStore', EntityStore)
    flux.registerStore('CurrentProject', CurrentProjectStore)
  })

  describe("subscribing to EntityStore", () => {
    it("should emit the stores state on the changeStream", () => {
      var stream = flux.createComputedStream('EntityStore')

      stream.pipe(through(data => {
        var entityStoreState = flux.getStore('EntityStore').getState().toJS()
        expect(data[0].toJS()).toEqual(entityStoreState)
      }))

      flux.dispatch('experimentsFetched', {
        experiments: experiments
      })
    })

    it("should not emit on the stream if multiple change events happen but the state doesnt change", () => {
      var stream = flux.createComputedStream('EntityStore')

      var mockFn = jest.genMockFn()
      stream.pipe(through(mockFn))

      flux.dispatch('experimentsFetched', {
        experiments: experiments
      })

      var EntityStore = flux.getStore('EntityStore')
      EntityStore.stream.queue({
        id: EntityStore.id,
        state: EntityStore.getState()
      })

      expect(mockFn.mock.calls.length).toEqual(1)
    })

    it("shouldnt emit on the stream if a different part of the store changes", () => {
      var stream = flux.createComputedStream('EntityStore.experiments')

      var mockFn = jest.genMockFn()
      stream.pipe(through(mockFn))

      flux.dispatch('experimentsFetched', {
        experiments: experiments
      })

      flux.dispatch('projectsFetched', {
        projects: projects
      })

      expect(mockFn.mock.calls.length).toEqual(1)
    })
  })

  describe("subscribing to two Stores", () => {
    it.only("should get events when either changes", () => {
      var stream = flux.createComputedStream('EntityStore.experiments', 'CurrentProject.id')

      var mockFn = jest.genMockFn()

      var currentExperimentStream = stream.transform(function(data) {
        var experiments = data[0]
        var currentProjectId = data[1]

        if (!currentProjectId) return

        /** @type {Immutable.Map} */
        return experiments.filter(exp => {
          return exp.get('project_id') === currentProjectId
        }).toVector()
      }).transform(toJS).pipe(through(mockFn))

      flux.dispatch('experimentsFetched', {
        experiments: experiments
      })

      flux.dispatch('changeCurrentProject', {
        project: {
          id: 3
        }
      })

      // first call, first arg
      expect(mockFn.mock.calls[0][0]).toEqual([])
      // second call, first arg
      expect(mockFn.mock.calls[1][0]).toEqual([experiments[0]])
    })
  })
})
