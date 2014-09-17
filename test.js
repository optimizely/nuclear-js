var Immutable = require('immutable')

var map = Immutable.Map({})
//console.log({} instanceof Immutable.Sequence)
//return

var watchFn = function(newValue, old, path) {
}
//var exp = { id: 1, val: 'exp 1' }

var map = Immutable.Map({})

var cursor = map.cursor(null, watchFn)
var val = 123
cursor = cursor.update(function(x) {
  return {}
})

console.log('map', map)

console.log(cursor)
