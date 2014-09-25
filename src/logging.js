/**
 * Wraps a Reactor.react invocation in a console.group
*/
exports.cycleStart = function(message) {
  console.groupCollapsed('React: %s', message.type)
  console.group('payload')
  console.log(message.payload)
  console.groupEnd()
}

exports.coreReact = function(id, before, after) {
  if (before !== after) {
    console.log('Core changed: ' + id)
  }
}

exports.cycleEnd = function(state) {
  console.log('React done, new state: ', state.toJS())

  console.groupEnd()
}
