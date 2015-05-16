var Flux = require('../../flux')

Flux.registerStores({
  form: require('./stores/form-store'),
})

module.exports = {
  actions: require('./actions'),

  getters: require('./getters'),
}
