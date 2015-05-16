var Nuclear = require('nuclear-js')
var actionTypes = require('../action-types')

module.exports = Nuclear.Store({
  getInitialState() {
    return null
  },

  initialize() {
    this.on(actionTypes.SET_CURRENTLY_EDITING_USER_ID, setUserId)
  },
})

function setUserId(state, userId) {
  return userId
}
