var Flux = require('../../flux')

Flux.registerStores({
  currentlyEditingUserId: require('./stores/currently-editing-user-id-store'),
})

module.exports = {
  actions: require('./actions'),

  getters: require('./getters'),
}
