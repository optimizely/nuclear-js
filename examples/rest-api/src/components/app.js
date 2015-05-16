/**
 * @jsx React.DOM
 */
var React = require('react')
var Flux = require('../flux')

var UserManagementComponent = require('./user-management')

module.exports = React.createClass({
  render() {
    var containerStyle = {
      marginTop: 20
    }

    return <div className="container" style={containerStyle}>
      <UserManagementComponent />
    </div>
  },
})
