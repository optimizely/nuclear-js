var Mutator = require('../../src/Mutator')

class CurrentProjectMutator extends Mutator {
  initialize() {
    console.log('registering CurrentProjectMutator')
    this.on('changeCurrentProjectId', this.__changeCurrentProjectId)
  }

  __changeCurrentProjectId(state, payload) {
    return state.set('id', payload.id)
  }
}

module.exports = CurrentProjectMutator
