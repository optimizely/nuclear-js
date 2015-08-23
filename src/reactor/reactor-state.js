var Immutable = require('immutable')
var Map = Immutable.Map

module.exports = Immutable.Record({
  dispatchId: 0,
  state: Immutable.Map(),
  stores: Immutable.Map(),
  // must be a plain array so unwatchFn can mutate be reference
  observers: [],
  cache: Immutable.Map(),
  debug: false,
})
