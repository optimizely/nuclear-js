var Store = require('../../src/Store')

class CurrentProjectStore extends Store {
  initialize() {
    this.bindActions('changeCurrentProject', this.__changeCurrentProject)
  }

  __changeCurrentProject(payload) {
    this.setState('id', payload.project.id)
  }
}

module.exports = CurrentProjectStore
