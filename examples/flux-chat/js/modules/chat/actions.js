var flux = require('../../flux')
var actionTypes = require('./action-types')
var getters = require('./getters')

/**
 * Handles the receiving of messages into the flux system
 * @param {Message[]} messages
 */
exports.receiveAll = function(messages) {
  messages.forEach(message => {
    flux.dispatch(actionTypes.ADD_MESSAGE, { message })
  })
}

/**
 * Creates a message
 * @param {String} text
 * @param {GUID} threadName
 */
exports.createMessage = function(text, threadID) {
  var timestamp = Date.now()
  var id = 'm_' + timestamp
  var threadName = flux.evaluate([
    getters.threadsMap,
    threadsMap => threadsMap.getIn([threadID, 'threadName']),
  ])
  var authorName = 'Jordan'

  flux.dispatch(actionTypes.ADD_MESSAGE, {
    message: { id, threadID, threadName, authorName, timestamp, text },
  })
}

exports.clickThread = function(threadID) {
  flux.dispatch(actionTypes.CLICK_THREAD, { threadID })
}
