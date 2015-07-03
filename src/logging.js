/* eslint-disable no-console */
/**
 * Wraps a Reactor.react invocation in a console.group
*/
exports.dispatchStart = function(type, payload) {
  if (console.group) {
    console.groupCollapsed('Dispatch: %s', type)
    console.group('payload')
    console.debug(payload)
    console.groupEnd()
  }
}

exports.dispatchError = function(error) {
  if (console.group) {
    console.debug('Dispatch error: ' + error)
    console.groupEnd()
  }
}

exports.storeHandled = function(id, before, after) {
  if (console.group) {
    if (before !== after) {
      console.debug('Store ' + id + ' handled action')
    }
  }
}

exports.dispatchEnd = function(state) {
  if (console.group) {
    console.debug('Dispatch done, new state: ', state.toJS())
    console.groupEnd()
  }
}
/* eslint-enable no-console */
