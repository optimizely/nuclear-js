var Flux = require('../../flux')
var actionTypes = require('./action-types')

/**
 * Registers a form to be tracked in the form store
 * @param {String} formId
 * @param {Object} initialValues
 */
exports.register = function(formId, initialValues) {
  Flux.dispatch(actionTypes.REGISTER_FORM, {
    formId,
    initialValues,
  })
}

/**
 * Registers a form to be tracked in the form store
 * @param {String} formId
 * @param {String} fieldName
 * @param {String|Number} value
 */
exports.setFieldValue = function(formId, fieldName, value) {
  Flux.dispatch(actionTypes.SET_FORM_VALUE, {
    formId,
    fieldName,
    value,
  })
}

exports.unregister = function(formId) {
  Flux.dispatch(actionTypes.UNREGISTER_FORM, {
    formId,
  })
}
