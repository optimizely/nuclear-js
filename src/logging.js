import { getOption } from './reactor/fns'

/* eslint-disable no-console */
/**
 * Wraps a Reactor.react invocation in a console.group
 */
export const ConsoleGroupLogger = {
  /**
   * @param {ReactorState} reactorState
   * @param {String} type
   * @param {*} payload
   */
  dispatchStart: function(reactorState, type, payload) {
    if (!getOption(reactorState, 'logDispatches')) {
      return
    }

    if (console.group) {
      console.groupCollapsed('Dispatch: %s', type)
      console.group('payload')
      console.debug(payload)
      console.groupEnd()
    }
  },
  /**
   * @param {ReactorState} reactorState
   * @param {Error} error
   */
  dispatchError: function(reactorState, error) {
    if (!getOption(reactorState, 'logDispatches')) {
      return
    }

    if (console.group) {
      console.debug('Dispatch error: ' + error)
      console.groupEnd()
    }
  },
  /**
   * @param {ReactorState} reactorState
   * @param {Map} state
   * @param {List} dirtyStores
   * @param {Map} previousState
   */
  dispatchEnd: function(reactorState, state, dirtyStores, previousState) {
    if (!getOption(reactorState, 'logDispatches')) {
      return
    }

    if (console.group) {
      if (getOption(reactorState, 'logDirtyStores')) {
        console.log('Stores updated:', dirtyStores.toList().toJS())
      }

      if (getOption(reactorState, 'logAppState')) {
        console.debug('Dispatch done, new state: ', state.toJS())
      }
      console.groupEnd()
    }
  },
  /**
   * @param {ReactorState} reactorState
   * @param {ObserverState} observerState
   */
  notifyStart: function(reactorState, observerState) {
  },
  /**
   * @param {ReactorState} reactorState
   * @param {Getter} getter
   */
  notifyEvaluateStart: function(reactorState, getter) {
  },
  /**
   * @param {ReactorState} reactorState
   * @param {Getter} getter
   * @param {Boolean} didCall
   * @param {*} currValue
   */
  notifyEvaluateEnd: function(reactorState, getter, didCall, currValue) {
  },
  /**
   * @param {ReactorState} reactorState
   * @param {ObserverState} observerState
   */
  notifyEnd: function(reactorState, observerState) {
  },
}

/* eslint-enable no-console */

