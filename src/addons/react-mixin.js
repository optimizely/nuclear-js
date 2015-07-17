var React = require('react')

function each(obj, fn) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      fn(obj[key], key)
    }
  }
}

/**
 * Mixin expecting a context.reactor on the component
 *
 * Should be used if a higher level component has been
 * wrapped with provideReactor
 * @type {Object}
 */
module.exports = {
  contextTypes: {
    reactor: React.PropTypes.object.isRequired,
  },

  getInitialState: function() {
    if (!this.getDataBindings) {
      return null
    }
    return getState(this.context.reactor, this.getDataBindings())
  },

  componentDidMount: function() {
    if (!this.getDataBindings) {
      return
    }
    var component = this
    component.__unwatchFns = []
    each(this.getDataBindings(), function(getter, key) {
      var unwatchFn = component.context.reactor.observe(getter, function(val) {
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
