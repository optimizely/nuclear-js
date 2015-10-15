var toImmutable = require('nuclear-js').toImmutable
var Flux = require('../../flux')

// register stores with Flux system
Flux.registerStores({
  restApiCache: require('./stores/rest-api-cache-store'),
})

exports.createApiActions = require('./create-api-actions')

/**
 * Creates a getter to the restApiCache store for a particular entity
 * This decouples the implementation details of the RestApi module's caching
 * to consumers of the cached data
 * @param {Model} model
 */
exports.createEntityMapGetter = function(model) {
  return [
    ['restApiCache', model.entity],
    /**
     * @return {Immutable.Map}
     */
    function(entityMap) {
      // protect the entityMap here from being undefined, there are cases
      // where an entity type isn't loaded yet, so we need to always to
      // return an Immutable.Map for getters downstream
      if (!entityMap) {
        return toImmutable({})
      }
      return entityMap
    },
  ]
}

/**
 * Creates a function that creates a getter that looks up the entity in the restApiCache by ID
 * @param {Model} model
 */
exports.createByIdGetter = function(model) {
  return function(id) {
    return ['restApiCache', model.entity, id]
  }
}
