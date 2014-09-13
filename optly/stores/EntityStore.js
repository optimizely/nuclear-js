var Store = require('../../src/Store')
var isArray = require('../../src/utils').isArray
var Immutable = require('immutable')

var ActionTypes = require('../ActionTypes')

class EntityStore extends Store {
  constructor() {
    // initial state
    super({
      outOfSync: {},
      toSync: Immutable.Set(),
      toDelete: Immutable.Set()
    })
    this.on(ActionTypes.ENTITY_FETCH_SUCCESS, this.__loadEntity)
    this.on(ActionTypes.ENTITY_PERSIST_SUCCESS, this.__loadEntity)
    this.on(ActionTypes.ENTITY_PERSIST_FAIL, this.__rollbackPersist)
    this.on(ActionTypes.ENTITY_DELETE_SUCCESS, this.__syncDeletedEntity)
    this.on(ActionTypes.ENTITY_DELETE_FAIL, this.__rollbackDelete)

    this.on(ActionTypes.ENTITY_UPDATED, this.__updateEntity)
    this.on(ActionTypes.ENTITY_DELETED, this.__queueDelete)
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
        this.__markSynced(keyPath)
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
        this.__queueSync(keyPath)
        // write the update
        this.update(keyPath, item)
      })
    })
  }

  /**
   * Updates the store after a deleted entity has been synced successfully
   */
  __syncDeletedEntity(payload) {
    var keyPath = [payload.entity, payload.id]
    this.__resolveDelete(keyPath)
    this.remove(keyPath)
  }

  /**
   * Rolls back an entity to its last known "synced" state
   */
  __rollbackPersist(payload) {
    var keyPath = [payload.entity, payload.id]
    var lastCleanState = this.__getLastSyncedState(keyPath)
    if (lastCleanState) {
      this.update(keyPath, lastCleanState)
    }
    this.__markSynced(keyPath)
  }

  /**
   * Rolls back an entity to its last known "synced" state
   * And also handles the toDelete logic
   */
  __rollbackDelete(payload) {
    var keyPath = [payload.entity, payload.id]
    var lastCleanState = this.get(['outOfSync'].concat(keyPath))
    if (lastCleanState) {
      this.update(keyPath, lastCleanState)
    }
    this.__markSynced(keyPath)
  }

  /**
   * Deletes an entry by keyPath from the state but does not sync
   */
  __deleteEntity(payload) {
    var keyPath = [payload.entity, payload.id]
    // mark as out of sync and maintain the last clean state
    this.__queueDelete(keyPath)
    // queue up for deletion
    this.remove(keyPath)
    // queue up for deletion
  }

  /**
   * Marks an item as being queued for deletion
   * @param {array} keyPath
   */
  __queueDelete(keyPath) {
    this.__markUnsynced(keyPath)
    // remove from the actual store state
    var keyPathString = keyPath.join('.')
    this.update('toDelete', set => {
      return set.add(keyPathString)
    })
  }

  /**
   * Marks the entity as being deleted and cleans up
   * out of sync tracking state
   * @param {array} keyPath
   */
  __resolveDelete(keyPath) {
    this.update(['toDelete'], deleteKeys => {
      return deleteKeys.remove(keyPath.join('.'))
    })
    this.__markSynced(keyPath)
  }

  /**
   * Queues a item to be synced
   * @param {array} keyPath
   */
  __queueSync(keyPath) {
    this.__markUnsynced(keyPath)
    var keyPathString = keyPath.join('.')
    this.update('toSync', set => {
      return set.add(keyPathString)
    })
  }

  /**
   * Marks an entity as being synced and cleans up
   * out of sync tracking state
   * @param {array} keyPath
   */
  __resolveSync(keyPath) {
    this.update(['toSync'], syncKeys => {
      return syncKeys.remove(keyPath.join('.'))
    })
    this.__markSynced(keyPath)
  }

  /**
   * Marks an item as being out of sync, if there is not a last clean state
   * it will store one
   * @param {array} keyPath
   * @param {object} item
   */
  __markUnsynced(keyPath) {
    // marked as unsynced
    var outOfSyncPath = ['outOfSync'].concat(keyPath)
    if (!this.get(outOfSyncPath)) {
      this.update(outOfSyncPath, this.get(keyPath))
    }
  }

  /**
   * Marks an item as being in sync, will clean up reference to the last
   * clean state
   * @param {array} keyPath
   */
  __markSynced(keyPath) {
    // ex: outOfSync.expeririments.123
    var path = ['outOfSync'].concat(keyPath)
    if (this.get(path)) {
      this.remove(path)
    }
  }

  /**
   * Gets the last clean state of a path on the system
   */
  __getLastSyncedState(keyPath) {
    var outOfSyncPath = ['outOfSync'].concat(keyPath)
    return this.get(outOfSyncPath)
  }
}

module.exports = EntityStore
