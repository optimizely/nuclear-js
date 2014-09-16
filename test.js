var Immutable = require('immutable')

var watchFn = function(newValue, old, path) {
  map = map.updateIn(path, function() {
    return newValue
  })
  return newValue
}
var exp = { id: 1, val: 'exp 1' }

var map = Immutable.Map({})

var cursor = map.cursor(['Entity'], watchFn)
var val = 123
cursor = cursor.update(function(x) {
  return val
})

console.log('map', map)

console.log(cursor)
