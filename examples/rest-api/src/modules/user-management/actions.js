const Flux = require('../../flux')
const Form = require('../form')
const User = require('../user')

const actionTypes = require('./action-types')
const getters = require('./getters')
const { EDIT_USER_FORM } = require('./constants')

/**
 * Semantic action to edit a user, will bring up the edit user form
 * @param {User} user
 */
exports.editUser = function(user) {
  const currentlyEditingUser = Flux.evaluate(getters.currentlyEditingUser)
  if (currentlyEditingUser === user) {
    return
  }

  if (isEditing() && isDirty()) {
    // show confirm and do something
    return
  }

  Form.actions.register(EDIT_USER_FORM, {
    name: user.get('name'),
    email: user.get('email'),
  })

  Flux.dispatch(actionTypes.SET_CURRENTLY_EDITING_USER_ID, user.get('id'));
}

/**
 * Updates the currently editing user form data for a specific user field
 * @param {String} fieldName
 * @param {String} value
 */
exports.updateUserField = function(fieldName, value) {
  Form.actions.setFieldValue(EDIT_USER_FORM, fieldName, value);
}

/**
 * Updates the currently editing user form data for a specific user field
 * @param {String} fieldName
 * @param {String} value
 */
exports.submitEditForm = function() {
  const formValues = Flux.evaluate(getters.editUserFormValues)
  const editingUser = Flux.evaluate(getters.currentlyEditingUser)

  const toSave = formValues.merge({
    id: editingUser.get('id'),
  })

  return User.actions.save(toSave)
    .then(function() {
      exports.cancelEdit()
    })
}

/**
 * Cancels the current editing user process and clears the form
 */
exports.cancelEdit = function() {
  Flux.dispatch(actionTypes.SET_CURRENTLY_EDITING_USER_ID, null);
  Form.actions.unregister(EDIT_USER_FORM)
}

function isEditing() {
  return Flux.evaluate(Form.getters.formExists(EDIT_USER_FORM))
}

function isDirty() {
  return Flux.evaluate(Form.getters.isDirty(EDIT_USER_FORM))
}
