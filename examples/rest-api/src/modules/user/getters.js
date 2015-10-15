var RestApi = require('../rest-api')
var model = require('./model')

exports.entityMap = RestApi.createEntityMapGetter(model)

exports.byId = RestApi.createByIdGetter(model)

exports.userList = [
  exports.entityMap,
  map => map.toList(),
]
