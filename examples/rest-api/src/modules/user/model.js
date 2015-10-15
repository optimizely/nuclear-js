var MockServer = require('../../mock-server')
var { toJS } = require('nuclear-js')

var ENTITY = 'user'

exports.entity = ENTITY

/**
 * @param {User} instance
 * @return {Promise}
 */
exports.save = function(instance) {
  instance = toJS(instance)
  if (instance.id) {
    return MockServer.update(ENTITY, instance)
  }
  return MockServer.create(ENTITY, instance)
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
  instance = toJS(instance)
  return MockServer.delete(ENTITY, instance)
}
