var Store = require('../../src/Store')

class ExperimentStore extends Store {
  initialize() {
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

module.exports = ExperimentStore
