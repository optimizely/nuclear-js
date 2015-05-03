var _ = require('lodash')
var RestApi = require('../rest-api')
var model = require('./model')

var userApiActions = RestApi.createApiActions(model)

module.exports = _.extend({}, userApiActions, {
  // User specific actions go in here
})
