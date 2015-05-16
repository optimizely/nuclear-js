var _ = require('lodash')
var MockServer = require('../../mock-server')

var ENTITY = 'user'

exports.entity = ENTITY

/**
 * @param {User} instance
 * @return {Promise}
 */
exports.save = function(instance) {
  if (instance.id) {
    return MockServer.update(ENTITY, instance)
  } else {
    return MockServer.create(ENTITY, instance)
  }
}

/**
 * @param {Number} id
 * @return {Promise}
 */
exports.fetch = function(id) {
  return MockServer.fetch(ENTITY, id)
}

/**
 * @param {Object?} params
 * @return {Promise}
 */
exports.fetchAll = function(params) {
  return MockServer.fetchAll(ENTITY, params)
}

/**
 * @param {User} instance
 * @return {Promise}
 */
exports.delete = function(instance) {
  return MockServer.delete(ENTITY, instance)
}
