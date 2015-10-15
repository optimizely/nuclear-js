var Nuclear = require('nuclear-js')
var toImmutable = Nuclear.toImmutable
var actionTypes = require('../action-types')


module.exports = new Nuclear.Store({
  getInitialState: function() {
    return toImmutable({})
  },

  initialize: function() {
    this.on(actionTypes.REGISTER_FORM, registerForm)
    this.on(actionTypes.SET_FORM_VALUE, setFormValue)
    this.on(actionTypes.UNREGISTER_FORM, unregisterForm)
  },
})

/**
 * @param {Immutable.Map} state
 * @param {Object} payload
 * @param {String} payload.formId
 * @param {Object} payload.initialValues
 * @return {Immutable.Map}
 */
function registerForm(state, { formId, initialValues }) {
  var formEntry = toImmutable({
    initialValues: initialValues,
    currentValues: initialValues,
  })
  return state.set(formId, formEntry)
}

/**
 * @param {Immutable.Map} state
 * @param {Object} payload
 * @param {String} payload.formId
 * @param {String} payload.fieldName
 * @param {String} payload.value
 * @return {Immutable.Map}
 */
function setFormValue(state, { formId, fieldName, value }) {
  var formEntry = state.get(formId)

  if (!formEntry) {
    throw new Error('FormStore: cannot find form by formId=' + formId)
  }

  return state.setIn([formId, 'currentValues', fieldName], value)
}

/**
 * @param {Immutable.Map} state
 * @param {Object} payload
 * @param {String} payload.formId
 * @return {Immutable.Map}
 */
function unregisterForm(state, { formId }) {
  return state.delete(formId)
}

