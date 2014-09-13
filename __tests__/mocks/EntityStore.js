var Store = require('../../src/Store')
var isArray = require('../../src/utils').isArray
var Immutable = require('immutable')

class EntityStore extends Store {
  constructor() {
    // initial state
    super({
      __lastClean: {},
      __unsynced: {},
      __deletedIds: []
    })
    this.on('entityUpdated', this.__updateEntity)
    this.on('entityFetched', this.__loadEntity)
  }

  /**
   * Loading an entity corresponds to receiving the canonical version
   * of the entity and will mark as clean/synced
   */
  __loadEntity(payload) {
    var entity = payload.entity
    var data = payload.data

    if (!isArray(data)) {
      data = [data]
    }
    this.mutate(() => {
      data.forEach(item => {
        var keyPath = [entity, item.id]
        this.update(keyPath, item)
        // lookup if there is an entry in the __unsynced entity state
        // ex: __unsynced.expeririments.123
        var unsyncedPath = ['__unsynced'].concat(keyPath)
        // ex: __lastClean.expeririments.123
        var lastCleanPath = ['__lastClean'].concat(keyPath)
        if (this.get(unsyncedPath)) {
          this.remove(unsyncedPath)
        }
        if (this.get(lastCleanPath)) {
          this.remove(lastCleanPath)
        }
      })
    })
  }

  /**
   * Represents a change in an entity state that has not yet been synced
   */
  __updateEntity(payload) {
    var entity = payload.entity
    var data = payload.data

    if (!isArray(data)) {
      data = [data]
    }
    this.mutate(() => {
      data.forEach(item => {
        var keyPath = [entity, item.id]
        // marked as unsynced
        var unsyncedPath = ['__unsynced'].concat(keyPath)
        var lastCleanPath = ['__lastClean'].concat(keyPath)
        if (!this.get(lastCleanPath)) {
          this.update(lastCleanPath, item)
        }
        // write the update
        this.update(keyPath, item)
        this.update(unsyncedPath, item)
      })
    })
  }
}

module.exports = EntityStore
