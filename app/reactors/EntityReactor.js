var Mutator = require('../../src/Mutator')
var isArray = require('../../src/utils').isArray

class EntityReactor extends Reactor {
  initialize() {
    this.on('entityLoaded', this.__loadEntity)
  }

  __loadEntity(state, payload) {
    var entity = payload.entity
    var data = payload.data
    if (!isArray(data)) {
      data = [data]
    }
    return state.withMutations(state => {
      data.forEach(item => {
        var keyPath = [entity, item.id]
        this.update(state, keyPath, item)
      })
    })
  }
}

module.exports = EntityMutator
