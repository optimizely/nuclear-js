var Store = require('../../src/Store')
var Immutable = require('immutable')

class EntityStore extends Store {
  initialize() {
    this.state = Immutable.fromJS({
      experiments: {},
      projects: {}
    })
    this.bindActions('projectsFetched', this.__loadProjects)
    this.bindActions('experimentsFetched', this.__loadExperiments)
  }

  __loadExperiments(payload) {
    var exps = {}

    payload.experiments.forEach(exp => {
      exps[exp.id] = exp
    })
    this.state = this.state.set('experiments', Immutable.fromJS(exps))
  }

  __loadProjects(payload) {
    this.state = this.state.withMutations(state => {
      payload.projects.forEach(project => {
        state.set(project.id, project)
      })
    })
  }
}

module.exports = EntityStore
