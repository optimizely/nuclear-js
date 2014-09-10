jest.autoMockOff();

var Flux = require('../src/Flux');
var Store = require('../src/Store');
var through = require('through');
var Immutable = require('immutable');

class CurrentProjectStore extends Store {
  initialize() {
    this.state = Immutable.Map({})
    this.bindActions('changeCurrentProject', this.__changeCurrentProject)
  }

  __changeCurrentProject(payload) {
    this.setState('id', payload.project.id)
  }
}

class ExperimentStore extends Store {
  initialize() {
    this.state = Immutable.Map({})
    this.bindActions('experimentsFetched', this.__loadExperiments)
  }

  __loadExperiments(payload) {
    var experiments = payload.experiments;
    this.state = this.state.withMutations(state => {
      experiments.forEach(exp => {
        state.set(exp.id, exp)
      })
    })
  }
}

describe("CurrentProject + Experiments", () => {
  var flux;
  beforeEach(() => {
    flux = new Flux();
    flux.registerStore('Experiment', ExperimentStore)
    flux.registerStore('CurrentProject', CurrentProjectStore)
  })

  describe("changeCurrentProject action", () => {
    it("should change the currentProject store and emit change", () => {
      flux.dispatch('changeCurrentProject', {
        project: {
          id: 1
        }
      });
      expect(flux.getStore('CurrentProject').getState('id')).toBe(1)
    })
  })
})
