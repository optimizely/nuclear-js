var mockData = require('./mock-data')
var Nuclear = require('nuclear-js')
var reactor = new Nuclear.Reactor({
  debug: true,
})
window.reactor = reactor
var Chat = require('./modules/chat')

var ChatApp = require('./components/ChatApp.react')
ChatApp = Nuclear.provideReactor(ChatApp)

Chat.register(reactor)

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
