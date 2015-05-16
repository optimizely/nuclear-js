const User = require('../user')
const Form = require('../form')
const { EDIT_USER_FORM } = require('./constants')

exports.currentlyEditingUser = [
  User.getters.entityMap,
  ['currentlyEditingUserId'],
  (userMap, userId) => userMap.get(userId)
]

exports.editUserFormValues = Form.getters.currentValues(EDIT_USER_FORM)

exports.isEditUserFormDirty = Form.getters.isDirty(EDIT_USER_FORM)

exports.editUserDirtyFields = Form.getters.dirtyFields(EDIT_USER_FORM)
