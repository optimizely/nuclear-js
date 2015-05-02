var Flux = require('../../flux')

// register stores with Flux system
Flux.registerStores({
  restApiCache: require('./stores/rest-api-cache-store'),
})

exports.createApiActions = require('./create-api-actions')
