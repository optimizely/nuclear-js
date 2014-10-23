var Immutable = require('immutable')


var map = Immutable.fromJS({
  dep1: {
    dep2: 123
  }
})

var vect = Immutable.Vector('dep1', 'dep2')

var res= map.getIn(vect)
var res2= map.getIn(['dep1', 'dep2'])
console.log(res)
console.log(res2)
