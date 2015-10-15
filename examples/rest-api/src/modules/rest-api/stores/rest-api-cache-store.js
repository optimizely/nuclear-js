/**
 * Stores cached entities for the Rest API
 */
var _ = require('lodash')
var Nuclear = require('nuclear-js')
var toImmutable = Nuclear.toImmutable
var actionTypes = require('../action-types')

module.exports = new Nuclear.Store({
  getInitialState: function() {
    return toImmutable({})
  },

  initialize: function() {
    this.on(actionTypes.API_FETCH_SUCCESS, loadData)
    this.on(actionTypes.API_SAVE_SUCCESS, loadData)
    this.on(actionTypes.API_DELETE_SUCCESS, removeData)
  },
})

/**
 * @param {Immutable.Map} state
 * @param {Object} payload
 * @param {Model} payload.model
 * @param {any} payload.params
 * @param {Object|Array} payload.result
 */
function loadData(state, payload) {
  var entity = payload.model.entity
  var data = payload.result

  if (!data) {
    // no-op if no real data was returned
    return state
  }

  if (!_.isArray(data)) {
    data = [data]
  }

  return state.withMutations(function(state) {
    data.forEach(function(entry) {
      state.setIn([entity, entry.id], toImmutable(entry))
    })
  })
}

/**
 * @param {Immutable.Map} state
 * @param {Object} payload
 * @param {Model} payload.model
 * @param {any} payload.params
 * @param {Object|Array} payload.result
 */
function removeData(state, payload) {
  var entity = payload.model.entity
  // we assume that params is the instance with an `id` property
  var id = payload.params.id

  return state.removeIn([entity, id])
}
