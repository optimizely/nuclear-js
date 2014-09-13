var ActionGroup = require('../src/ActionGroup')
var ActionTypes = require('./ActionTypes')

//var Model = require('./Model')
var Model = x => x


class EntityActions extends ActionGroup {
  /**
   * Performs a fetchAll using the Model interface and
   * dispatches the results/failure into the system
   * @param {string} entity
   * @param {object} filters
   * @return {Deferred}
   */
  fetchAll(entity, filters) {
    var requestHash = hash({ entitiy: entity, filters: filters })
    var isCached = this.flux.getState(['CachedApiRequests', requestHash])
    if (isCached) {
      return
    }
    // TODO: api request caching

    this.dispatch(ActionTypes.ENTITY_FETCH_START, {
      entity: entity,
      filters: filters,
    })

    var deferred = Model(entity)
      .fetchAll(filters)
      .then(
        results => {
          this.dispatch(ActionTypes.ENTITY_FETCH_SUCCESS, {
            entity: entity,
            data: results,
            filters: filters,
          })
        },
        error => {
          this.dispatch(ActionTypes.ENTITY_FETCH_FAIL, {
            entity: entity,
            reason: reason,
            filters: filters,
          })
        }
      )

    return deferred
  }

  /**
   * Persists an entity using the Model interface
   * @param {string} entity
   * @param {object} instance
   * @return {Deferred}
   */
  persist(entity, instance) {
    this.dispatch(ActionTypes.ENTITY_PERSIST_START, {
      entity: entity,
      filters: filters,
    })

    return Model(entity)
      .save(instance)
      .then(
        result => {
          this.dispatch(actionTypes.ENTITY_PERSIST_SUCCESS, {
            entity: entity,
            data: result
          });
        },
        error => {
          this.dispatch(actionTypes.ENTITY_PERSIST_FAIL, {
            entity: entity,
            error: error,
            id: instance.id
          });
        }
      )
  }

  /**
   * Deletes an entity using the Model interface
   * @param {string} entity
   * @param {number} id
   * @return {Deferred}
   */
  delete(entity, instance) {
    this.dispatch(ActionTypes.ENTITY_DELETE_START, {
      entity: entity,
      filters: filters,
    })

    return Model(entity)
      .delete(instance)
      .then(
        result => {
          this.dispatch(actionTypes.ENTITY_DELETE_SUCCESS, {
            entity: entity,
            id: instance.id
          });
        },
        error => {
          this.dispatch(actionTypes.ENTITY_DELETE_FAIL, {
            entity: entity,
            error: error,
            id: instance.id
          });
        }
      )
  }
}
