var Nuclear = require('nuclear-js')
var toImmutable = Nuclear.toImmutable
var actionTypes = require('../action-types')

module.exports = new Nuclear.Store({
  getInitialState() {
    // for Nuclear to be so efficient all state must be immutable data
    // mapping of threadID => Thread
    return toImmutable({})
  },

  initialize() {
    // all action handlers are pure functions that take the current state and payload
    this.on(actionTypes.ADD_MESSAGE, addMessage)
    this.on(actionTypes.CLICK_THREAD, setMessagesRead)
  },
})

/**
 * @type Message
 * id {GUID}
 * threadID {GUID}
 * threadName {GUID}
 * authorName {String}
 * text {String}
 * isRead {Boolean}
 * timestamp {Timestamp}
 */

/**
 * @param {Immutable.Map}
 * @param {Object} payload
 * @param {Message} payload.message
 */
function addMessage(state, { message }) {
  var msg = toImmutable(message)
  var threadID = msg.get('threadID')

  return state.withMutations(threads => {
    // use standard ImmutableJS methods to transform state when handling an action
    if (!threads.has(threadID)) {
      threads.set(threadID, toImmutable({
        threadID: threadID,
        threadName: msg.get('threadName'),
        messages: toImmutable([]),
      }))
    }

    // push new message into thread and sort by message timestamp
    threads.update(threadID, thread => {
      var sortedMessages = thread.get('messages')
        .push(msg)
        .sortBy(msg => msg.get('timestamp'))

      return thread.set('messages', sortedMessages)
    })
  })
}

/**
 * Mark all messages for a thread as "read"
 * @param {Immutable.Map}
 * @param {Object} payload
 * @param {GUID} payload.threadID
 */
function setMessagesRead(state, { threadID }) {
  return state.updateIn([threadID, 'messages'], messages => {
    return messages.map(msg => msg.set('isRead', true))
  })
}
