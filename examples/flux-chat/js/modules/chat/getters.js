// it is idiomatic to facade all data access through getters, that way a component only has to subscribe to a getter making it agnostic
// to the underlying stores / data transformation that is taking place
exports.threadsMap = ['threads']

exports.threads = [
  exports.threadsMap,
  threadsMap => threadsMap.toList(),
]

exports.currentThread = [
  ['currentThreadID'],
  exports.threadsMap,
  (currentThreadID, threadsMap) => threadsMap.get(currentThreadID),
]

exports.latestThread = [
  exports.threads,
  threads => {
    return threads
      .sortBy(thread => {
        thread.get('messages').last().get('timestamp')
      })
      .last()
  },
]


exports.currentThreadID = [
  exports.currentThread,
  thread => thread ? thread.get('threadID') : null,
]

exports.unreadCount = [
  exports.threads,
  threads => {
    return threads.reduce((accum, thread) => {
      if (!thread.get('messages').last().get('isRead')) {
        accum++
      }
      return accum
    }, 0)
  },
]
