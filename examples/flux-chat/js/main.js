var Message = require('./modules/message')
var mockData = require('./mock-data')
var flux = require('./flux')
var ChatApp = require('./components/ChatApp.react');

Message.actions.receiveAll(mockData)
// if there is no current thread select the latest
if (!flux.evaluate(Message.getters.currentThread)) {
  var latestThread = flux.evaluate(Message.getters.latestThread)
  Message.actions.clickThread(latestThread.get('threadID'));
}

var React = require('react');
window.React = React; // export for http://fb.me/react-devtools

React.render(
  <ChatApp />,
  document.getElementById('react')
);
