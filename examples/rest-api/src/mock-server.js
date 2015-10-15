/**
 * Simulates a server with a database
 */
var _ = require('lodash')
var Promise = require('es6-promise').Promise

var DATA = {
  user: {
    1: {
      id: 1,
      name: 'jordan',
      email: 'jordan@nuclear.com',
    },
    2: {
      id: 2,
      name: 'jane',
      email: 'jane@nuclear.com',
    },
  },
}

/**
 * Stubable function to get data
 */
exports.__getData = function(entity) {
  return DATA[entity]
}

exports.create = function(entity, instance) {
  var entityMap = exports.__getData(entity)
  var lastEntity = _(entityMap)
    .toArray()
    .sortBy(function(entry) {
      return entry.id
    })
    .last()

  var savedInstance = _.cloneDeep(instance)
  savedInstance.id = lastEntity.id + 1

  entityMap[savedInstance.id] = savedInstance

  return new Promise(function(resolve, reject) {
    setTimeout(() => resolve(savedInstance), 2000)
  })
}

exports.update = function(entity, instance) {
  return new Promise(function(resolve, reject) {
    var entityMap = exports.__getData(entity)
    if (!entityMap[instance.id]) {
      reject('No entity with id=' + instance.id)
      return
    }

    entityMap[instance.id] = instance
    setTimeout(() => resolve(instance), 2000)
  })
}

exports.fetch = function(entity, id) {
  return new Promise(function(resolve, reject) {
    var entityMap = exports.__getData(entity)
    if (!entityMap[id]) {
      reject('No entity with id=' + id)
      return
    }

    resolve(entityMap[id])
  })
}

exports.fetchAll = function(entity, params) {
  return new Promise(function(resolve, reject) {
    var entityMap = exports.__getData(entity)
    var results = _(entityMap)
      .filter(params)
      .toArray()
      .value()

    setTimeout(() => resolve(results), 2000)
  })
}

exports.delete = function(entity, instance) {
  return new Promise(function(resolve, reject) {
    var entityMap = exports.__getData(entity)
    if (!entityMap[instance.id]) {
      reject('No entity with id=' + instance.id)
      return
    }

    delete entityMap[instance.id]

    setTimeout(() => resolve(instance), 2000)
  })
}
