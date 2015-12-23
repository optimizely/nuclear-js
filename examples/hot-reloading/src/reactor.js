import { Reactor } from 'nuclear-js'
import * as stores from './stores'

const reactor = new Reactor({
  debug: true,
})
reactor.registerStores(stores)

if (module.hot) {
  // Enable Webpack hot module replacement for stores
  module.hot.accept('./stores', () => {
    reactor.replaceStores(require('./stores'))
  })
}

export default reactor
