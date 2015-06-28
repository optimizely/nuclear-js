// Difference with classic suggested architecture in flux-chat example:
// Do not require the flux singleton, pass it in as the first argument of
// every actions

var actionTypes = require('./action-types')
var getters = require('./getters')

/**
 * Handles the receiving of messages into the flux system
 * @param {Message[]} messages
 */
exports.receiveAll = function(reactor, messages) {
  messages.forEach(message => {
    reactor.dispatch(actionTypes.ADD_MESSAGE, { message })
  })
}

/**
 * Creates a message
 * @param {String} text
 * @param {GUID} threadName
 */
exports.createMessage = function(reactor, text, threadID) {
  var timestamp = Date.now()
  var id = 'm_' + timestamp
  var threadName = reactor.evaluate([
    getters.threadsMap,
    threadsMap => threadsMap.getIn([threadID, 'threadName']),
  ])
  var authorName = 'Jordan'

  reactor.dispatch(actionTypes.ADD_MESSAGE, {
    message: { id, threadID, threadName, authorName, timestamp, text },
  })
}

exports.clickThread = function(reactor, threadID) {
  reactor.dispatch(actionTypes.CLICK_THREAD, { threadID })
}
