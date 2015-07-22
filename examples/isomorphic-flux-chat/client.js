var mockData = require('./mock/messages')
var Nuclear = require('nuclear-js')
var NuclearAddons = require('nuclear-js-react-addons')
var reactor = new Nuclear.Reactor({
  debug: process.env.NODE_ENV,
})
window.reactor = reactor
var Chat = require('./modules/chat')

var ChatApp = require('./components/ChatApp.jsx')
ChatApp = NuclearAddons.provideReactor(ChatApp)

Chat.register(reactor)

// @todo: refactor to use new nuclear methods when 1.1 lands ?
if (window.window.reactor_state !== null) {
  reactor.__state = Nuclear.Immutable.fromJS(window.reactor_state)
} else {
  Chat.actions.receiveAll(reactor, mockData)
}

var React = require('react')
window.React = React // export for http://fb.me/react-devtools

React.render(<ChatApp reactor={reactor}/>,
  document.getElementById('react')
)
