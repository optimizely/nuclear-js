var Immutable = require('immutable')
var Record = Immutable.Record
var Vector = Immutable.Vector

var DELIM = '.'

var KeyPathRecord = Record({
  path: null
})

function KeyPath(path) {
  var immutablePath = (isArray(path))
    ? path
    : path.split(DELIM)

  return new KeyPathRecord({
    path: Vector(path)
  })
}

module.exports = KeyPath
