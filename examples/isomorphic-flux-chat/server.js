var http = require('http')
var fs = require('fs')
var path = require('path')
var args = require('yargs').argv

var opts = {
  encoding: 'utf8',
}

var css = fs.readFileSync(path.join(__dirname, 'css/chatapp.css'), opts)
var js = fs.readFileSync(path.join(__dirname, 'bundle.js'), opts)
var index = fs.readFileSync(path.join(__dirname, 'index.html'), opts)

var port = args.port || 1337

/**
 * Interesting part
 */
var mockData = require('./js/mock-data')
var React = require('react')
var Nuclear = require('nuclear-js')
var Chat = require('./js/modules/chat')
var ChatApp = require('./js/components/ChatApp.react')
ChatApp = Nuclear.provideReactor(ChatApp)

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
     *Dehydrate reactor
     */
    var _state = JSON.stringify(reactor.__state.toJS())
    returnHtml = returnHtml.replace('window.reactor_state = null', 'window.reactor_state = ' + _state)

    /**
     * Send it however you want
     */
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end(returnHtml)
  } else if (req.url === '/bundle.js') {
    res.writeHead(200, {'Content-Type': 'text/javascript'})
    res.end(js)
  } else if (req.url === '/chatapp.css') {
    res.writeHead(200, {'Content-Type': 'text/css'})
    res.end(css)
  }
}).listen(port, function() {
  console.log('Listening on port ' + port)
})
