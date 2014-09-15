var Store = require('../../src/Store')
var ActionTypes = require('../ActionTypes')

class CurrentProjectStore extends Store {
  constructor() {
    super({
      id: null
    })
    this.on(ActionTypes.CHANGE_CURRENT_PROJECT, this.__changeCurrentProject)
  }

  __changeCurrentProject(payload) {
    this.update(['id'], payload.project.id)
  }
}

module.exports = CurrentProjectStore
