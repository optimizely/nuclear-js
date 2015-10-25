var Immutable = require('immutable')
var Map = Immutable.Map

module.exports = Immutable.Record({
  dispatchId: 0,
  state: Immutable.Map(),
  stores: Immutable.Map(),
  cache: Immutable.Map(),
  debug: false,
})
