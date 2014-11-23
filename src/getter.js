var coerceKeyPath = require('./utils').keyPath
var Immutable = require('immutable')
var Record = Immutable.Record

var Getter = Record({
  deps: null,
  flatDeps: null,
  computeFn: null,
})

/**
 * Checks if something is a GetterRecord
 */
function isGetter(toTest) {
  return (toTest instanceof Getter)
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
    if (isGetter(dep)) {
      // if the dep is an nested Getter simply return
      return dep
    }
    return coerceKeyPath(dep)
  })
}

/**
 * Recursive function to flatten deps of a getter
 * @param {array<array<string>|Getter>} deps
 * @return {array<array<string>>} unique flatten deps
 */
function flattenDeps(deps) {
  var accum = Immutable.Set()

  var coercedDeps = coerceDeps(deps)

  accum = accum.withMutations(accum => {
    coercedDeps.forEach((dep) => {
      if (isGetter(dep)) {
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
 * Wrap the Getter in a function that coerces args
 * @param {array} deps
 * @param {function} computeFn
 *
 * @return {GetterRecord}
 */
function createGetter(deps, computeFn) {
  // compute the flatten deps, and cache since deps are immutable
  // once they enter the record
  var flatDeps = flattenDeps(deps)
  var deps = coerceDeps(deps)

  return new Getter({
    deps: deps,
    flatDeps: flatDeps,
    computeFn: computeFn
  })
}

module.exports = createGetter

module.exports.isGetter = isGetter
