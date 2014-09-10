var Immutable = require('immutable');
var Store = require('./src/Store')

var store = new Store({
  id: 'store',
  coll: [1,2,3],
  entities: {
    1: {
      id: 1,
      val: 'entity 1'
    }
  }
})

var entities = store.getState(['entities'])
console.log(entities)
