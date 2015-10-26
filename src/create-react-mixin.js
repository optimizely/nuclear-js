import { each } from './utils'

/**
 * @param {Reactor} reactor
 */
export default function(reactor) {
  return {
    getInitialState: function() {
      return getState(reactor, this.getDataBindings())
    },

    componentDidMount: function() {
      var component = this
      component.__unwatchFns = []
      each(this.getDataBindings(), function(getter, key) {
        var unwatchFn = reactor.observe(getter, function(val) {
          var newState = {}
          newState[key] = val
          component.setState(newState)
        })

        component.__unwatchFns.push(unwatchFn)
      })
    },

    componentWillUnmount: function() {
      while (this.__unwatchFns.length) {
        this.__unwatchFns.shift()()
      }
    },
  }
}

/**
 * Returns a mapping of the getDataBinding keys to
 * the reactor values
 */
function getState(reactor, data) {
  var state = {}
  each(data, function(value, key) {
    state[key] = reactor.evaluate(value)
  })
  return state
}
