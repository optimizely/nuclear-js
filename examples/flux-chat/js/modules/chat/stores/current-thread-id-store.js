var Nuclear = require('nuclear-js')
var actionTypes = require('../action-types')

module.exports = new Nuclear.Store({
  getInitialState() {
    // only keeps track of the current threadID
    return null
  },

  initialize() {
    // all action handlers are pure functions that take the current state and payload
    this.on(actionTypes.CLICK_THREAD, setCurrentThreadID)
  },
})

function setCurrentThreadID(state, { threadID }) {
  // return the new value of the store's state
  return threadID
}
