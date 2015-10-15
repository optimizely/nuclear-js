var Promise = require('es6-promise').Promise
var Flux = require('../../flux')
var actionTypes = require('./action-types')

/**
 * @param {Object} model
 * @param {String} model.entity
 * @param {Function} model.save
 * @param {Function} model.fetch
 * @param {Function} model.fetchAll
 * @param {Function} model.delete
 * @return {Object}
 */
module.exports = function(model) {
  var entity = model.entity;
  var apiActions = {}

  apiActions.fetch = function(params) {
    Flux.dispatch(actionTypes.API_FETCH_START, {
      model: model,
      method: 'fetch',
      params: params,
    })
    return model.fetch(params).then(
      onFetchSuccess.bind(null, model, params),
      onFetchFail.bind(null, model, params)
    )
  }

  apiActions.fetchAll = function(params) {
    Flux.dispatch(actionTypes.API_FETCH_START, {
      model: model,
      method: 'fetchAll',
      params: params,
    })
    return model.fetchAll(params).then(
      onFetchSuccess.bind(null, model, params),
      onFetchFail.bind(null, model, params)
    )
  }

  apiActions.save = function(params) {
    Flux.dispatch(actionTypes.API_SAVE_START, {
      params: params,
    })
    return model.save(params).then(
      onSaveSuccess.bind(null, model, params),
      onSaveFail.bind(null, model, params)
    )
  }

  apiActions['delete'] = function(params) {
    Flux.dispatch(actionTypes.API_DELETE_START, {
      params: params,
    })
    return model['delete'](params).then(
      onDeleteSuccess.bind(null, model, params),
      onDeleteFail.bind(null, model, params)
    )
  }

  return apiActions
}

/**
 * Handler for API fetch success, dispatches flux action to store the fetched
 * result in the api cache
 * @param {Model} model
 * @param {*} params used to call the `model.fetch(params)`
 * @param {Object} result
 * @return {Object}
 */
function onFetchSuccess(model, params, result) {
  Flux.dispatch(actionTypes.API_FETCH_SUCCESS, {
    model: model,
    params: params,
    result: result,
  })
  return result
}

/**
 * Handler for API fetch success, dispatches flux action to store the fetched
 * result in the api cache
 * @param {Model} model
 * @param {*} params used to call the `model.fetch(params)`
 * @param {*} reason
 * @return {Object}
 */
function onFetchFail(model, params, reason) {
  Flux.dispatch(actionTypes.API_FETCH_FAIL, {
    model: model,
    params: params,
    reason: reason,
  })
  return Promise.reject(reason)
}

/**
 * Handler for API save success, dispatches flux action to update the store with the
 * saved instance
 * @param {Model} model
 * @param {*} params used to call the `model.save(params)`
 * @param {Object} result
 * @return {Object}
 */
function onSaveSuccess(model, params, result) {
  Flux.dispatch(actionTypes.API_SAVE_SUCCESS, {
    model: model,
    params: params,
    result: result,
  })
  return result
}

/**
 * Handler for API save success, dispatches flux action to update the store with the
 * saved instance
 * @param {Model} model
 * @param {*} params used to call the `model.save(params)`
 * @param {*} reason
 * @return {Object}
 */
function onSaveFail(model, params, reason) {
  Flux.dispatch(actionTypes.API_SAVE_FAIL, {
    model: model,
    params: params,
    reason: reason,
  })
  return Promise.reject(reason)
}

/**
 * Handler for API delete success, dispatches flux action to remove the instance from the stores
 * @param {Model} model
 * @param {*} params used to call the `model.delete(params)`
 * @param {Object} result
 * @return {Object}
 */
function onDeleteSuccess(model, params, result) {
  Flux.dispatch(actionTypes.API_DELETE_SUCCESS, {
    model: model,
    params: params,
    result: result,
  })
  return result
}

/**
 * Handler for API delete fail
 * @param {Model} model
 * @param {*} params used to call the `model.delete(params)`
 * @param {Object} result
 * @return {Object}
 */
function onDeleteFail(model, params, reason) {
  Flux.dispatch(actionTypes.API_DELETE_FAIL, {
    model: model,
    params: params,
    reason: reason,
  })
  return Promise.reject(reason)
}
