var Store = require('../../src/Store')

class CurrentProjectStore extends Store {
  initialize() {
    this.on('changeCurrentProject', this.__changeCurrentProject)
  }

  __changeCurrentProject(payload) {
    this.mutate(['id'], payload.project.id)
  }
}

module.exports = CurrentProjectStore
