var coerceKeyPath = require('./utils').keyPath
var Immutable = require('immutable')
var Record = Immutable.Record
var BaseGetterRecord = Record({
  deps: null,
  flatDeps: null,
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
 * Recursive function to flatten deps of a getter
 * @param {array<array<string>|GetterRecord>} deps
 * @return {array<array<string>>} unique flatten deps
 */
function flattenDeps(deps) {
  var accum = Immutable.Set()

  accum = accum.withMutations(accum => {
    deps.forEach((dep) => {
      if (dep instanceof GetterRecord) {
        accum.union(flattenDeps(dep.deps))
      } else {
        accum = accum.add(dep)
      }
    })

    return accum
  })

  return accum
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

  // compute the flatten deps, and cache since deps are immutable
  // once they enter the record
  var flatDeps = flattenDeps(deps).valueSeq().toJS()

  return new GetterRecord({
    deps: deps,
    flatDeps: flatDeps,
    compute: args.compute
  });
}

module.exports = Getter
