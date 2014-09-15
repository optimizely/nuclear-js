var Immutable = require('immutable')

var watchFn = function() {
  console.log('onChange', arguments)
}
var exp = { id: 1, val: 'exp 1' }

var Map = Immutable.Map({})

var cursor = Map.cursor(['Entity'], watchFn)
cursor.withMutations(function(state) {
  return state.updateIn(['experiments', exp.id], function(e) {
    return Immutable.fromJS(exp)
  })
})

//var c1 = cursor.updateIn(['experiments', exp.id], function(e) {
  //return Immutable.fromJS(exp)
//})

console.log('map', Map)

console.log(cursor)

//var m1 = Map.updateIn(['Entity', 'experiments'], Immutable.Map(), function(experiments) {
  //console.log(experiments)
  //return experiments.set(exp.id, Immutable.fromJS(exp))
//})

//var m2 = Map.updateIn(['Entity', 'experiments', exp.id], function(e) {
  //return Immutable.fromJS(exp)
//})

//console.log(m1)
//console.log(m2)
