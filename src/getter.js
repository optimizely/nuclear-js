var coerceKeyPath = require('./utils').keyPath
var Immutable = require('immutable')
var Record = Immutable.Record

var BaseGetterRecord = Record({
  deps: null,
  compute: null,
})

class GetterRecord extends BaseGetterRecord {
  evaluate(state) {
    return this.compute.apply(null, this.deps.map(dep => {
      if (dep instanceof GetterRecord) {
        // recursively evaluate
        return dep.evaluate(state)
      }
      return state.getIn(dep)
    }))
  }
}

/**
 * Wrap the GetterRecord in a function that coerces args
 */
function Getter(args) {
  var deps = args.deps.map(dep => {
    if (dep instanceof GetterRecord) {
      // if the dep is an nested GetterRecord simply return
      return dep
    }
    return coerceKeyPath(dep)
  })

  return new GetterRecord({
    deps: deps,
    compute: args.compute
  });
}

module.exports = Getter
