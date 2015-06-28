var React = require('react')
var hoistNonReactStatics = require('hoist-non-react-statics')
var objectAssign = require('object-assign')

/**
 * Provide reactor prop as React context to all children
 * @param  {React.Component} Component component to wrap
 * @return {React.Component} wrapped component
 */
module.exports = function provideReactor(Component, additionalContextTypes) {
  var childContextTypes = objectAssign({
    reactor: React.PropTypes.object.isRequired,
  }, additionalContextTypes || {})

  var ReactorProvider = React.createClass({
    displayName: 'ReactorProvider',

    propTypes: {
      reactor: React.PropTypes.object.isRequired,
    },

    childContextTypes: childContextTypes,

    getChildContext: function() {
      var childContext = {
        reactor: this.props.reactor,
      }
      if (additionalContextTypes) {
        Object.keys(additionalContextTypes).forEach(function(key) {
          childContext[key] = this.props[key]
        }, this)
      }
      return childContext
    },

    render: function() {
      return React.createElement(Component, this.props)
    },
  })

  hoistNonReactStatics(ReactorProvider, Component)

  return ReactorProvider
}
