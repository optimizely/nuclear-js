var flux = require('../../flux')

flux.registerStores({
  currentThreadID: require('./stores/current-thread-id-store'),
  threads: require('./stores/thread-store'),
})

module.exports = {
  actions: require('./actions'),

  getters: require('./getters'),
}
