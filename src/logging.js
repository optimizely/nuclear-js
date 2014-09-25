/**
 * Wraps a Reactor.react invocation in a console.group
*/
exports.beginReact = function(action) {
  console.groupCollapsed('React: %s', action.type)
  console.group('payload')
  console.log(action.payload)
  console.groupEnd()
}

exports.coreReact = function(id, before, after) {
  if (before !== after) {
    console.log('Core changed: ' + id)
  }
}

exports.finishReact = function(state) {
  console.log('React done, new state: ', state.toJS())

  console.groupEnd()
}
