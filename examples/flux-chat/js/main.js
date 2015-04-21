var Chat = require('./modules/chat')
var mockData = require('./mock-data')
var flux = require('./flux')
var ChatApp = require('./components/ChatApp.react');

Chat.actions.receiveAll(mockData)
// if there is no current thread select the latest
if (!flux.evaluate(Chat.getters.currentThread)) {
  var latestThread = flux.evaluate(Chat.getters.latestThread)
  Chat.actions.clickThread(latestThread.get('threadID'));
}

var React = require('react');
window.React = React; // export for http://fb.me/react-devtools

React.render(
  <ChatApp />,
  document.getElementById('react')
);
