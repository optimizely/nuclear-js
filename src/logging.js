/**
 * Wraps a Reactor.react invocation in a console.group
*/
exports.dispatchStart = function(type, payload) {
  console.groupCollapsed('Dispatch: %s', type)
  console.group('payload')
  console.log(payload)
  console.groupEnd()
}

exports.coreReact = function(id, before, after) {
  if (before !== after) {
    console.log('Core changed: ' + id)
  }
}

exports.dispatchEnd = function(state) {
  console.log('Dispatch done, new state: ', state.toJS())

  console.groupEnd()
}
