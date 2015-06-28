module.exports = {
  actions: require('./actions'),

  getters: require('./getters'),

  // Difference with classic suggested architecture:
  // provide a register method for the reactor instance to register
  // your stores
  register: function(reactor) {
    reactor.registerStores({
      currentThreadID: require('./stores/current-thread-id-store'),
      threads: require('./stores/thread-store'),
    })
  },
}
