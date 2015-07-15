/**
 * Main entry point
 */
var User = require('./modules/user')
var App = require('./components/app')

var React = require('react');
window.React = React; // export for http://fb.me/react-devtools

React.render(
  <App />,
  document.getElementById('app')
);
