var http = require('http')
var fs = require('fs')
var path = require('path')
var args = require('yargs').argv

var opts = {
  encoding: 'utf8',
}

var js = fs.readFileSync(path.join(__dirname, 'client.bundle.js'), opts)
var index = fs.readFileSync(path.join(__dirname, 'index.html'), opts)

var port = args.port || 1337

/**
 * Interesting part
 */
var mockData = require('./mock/messages')
var React = require('react')
var Nuclear = require('nuclear-js')
var provideReactor = require('nuclear-js-react-addons/provideReactor')
var Chat = require('./modules/chat')
var ChatApp = require('./components/ChatApp.jsx')
ChatApp = provideReactor(ChatApp)

http.createServer(function(req, res) {
  if (req.url === '/') {
    var reactor = new Nuclear.Reactor()

    /**
     * Factorize all the modules registration in a bootstrap file for the server ?
     */
    Chat.register(reactor)

    /**
     * Async data loading is not the purpose of this demo ... but as always
     * React.renderToString is sync, so find a way to populate your reactor
     * before calling it
     */
    Chat.actions.receiveAll(reactor, mockData)

    /**
     * Meh, maybe move this to the MessageSection render method ?
     * By putting this here, in the main it's not necessary anymore
     * as long as server side is ok ^^ because of dehydrate/rehydrate of state
     */
    if (!reactor.evaluate(Chat.getters.currentThread)) {
      var latestThread = reactor.evaluate(Chat.getters.latestThread)
      Chat.actions.clickThread(reactor, latestThread.get('threadID'))
    }

    /**
     * Generate markup
     */
    var reactMarkup = React.renderToString(<ChatApp reactor={reactor}/>)
    var returnHtml = index.replace('id="react"><', 'id="react">' + reactMarkup + '<')

    /**
     * Dehydrate reactor
     */
    var _state = JSON.stringify(reactor.serialize())
    returnHtml = returnHtml.replace('window.reactor_state = null', 'window.reactor_state = ' + _state)

    /**
     * Send it however you want
     */
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end(returnHtml)
  } else if (req.url === '/client.bundle.js') {
    res.writeHead(200, {'Content-Type': 'text/javascript'})
    res.end(js)
  }
}).listen(port, function() {
  console.log('Listening on port ' + port)
})
