var coerceKeyPath = require('./utils').keyPath
var Immutable = require('immutable')
var Record = Immutable.Record

var Computed = Record({
  deps: null,
  flatDeps: null,
  compute: null,
})

/**
 * Checks if something is a ComputedRecord
 */
function isComputed(toTest) {
  return (toTest instanceof Computed)
}

/**
 * Coerce string deps to be array dep keyPaths
 * ex: 'foo1.foo2' => ['foo1', 'foo2']
 *
 * @param {array<string|array<string>>}
 * @return {<array<array<string>>}
 */
function coerceDeps(deps){
  return deps.map(dep => {
    if (isComputed(dep)) {
      // if the dep is an nested Computed simply return
      return dep
    }
    return coerceKeyPath(dep)
  })
}

/**
 * Recursive function to flatten deps of a getter
 * @param {array<array<string>|Computed>} deps
 * @return {array<array<string>>} unique flatten deps
 */
function flattenDeps(deps) {
  var accum = Immutable.Set()

  var coercedDeps = coerceDeps(deps)

  accum = accum.withMutations(accum => {
    coercedDeps.forEach((dep) => {
      if (isComputed(dep)) {
        accum.union(flattenDeps(dep.deps))
      } else {
        accum = accum.add(dep)
      }
    })

    return accum
  })

  return accum.toJS()
}

/**
 * Wrap the Computed in a function that coerces args
 * @param {array} deps
 * @param {function} computeFn
 *
 * @return {ComputedRecord}
 */
function createComputed(deps, computeFn) {
  // compute the flatten deps, and cache since deps are immutable
  // once they enter the record
  var flatDeps = flattenDeps(deps)
  var deps = coerceDeps(deps)

  return new Computed({
    deps: deps,
    flatDeps: flatDeps,
    compute: computeFn
  })
}

module.exports = createComputed

module.exports.isComputed = isComputed
