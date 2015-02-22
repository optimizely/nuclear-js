var KeyPath = require('./key-path')
var Immutable = require('immutable')
var Record = Immutable.Record
var isFunction = require('./utils').isFunction
var isArray = require('./utils').isArray

var identity = x => x

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
 * Checks if something is a getter literal, ex: ['dep1', 'dep2', function(dep1, dep2) {...}]
 * @param {*} toTest
 * @return {boolean}
 */
function isGetterLike(toTest) {
  return (isArray(toTest) && isFunction(toTest[toTest.length - 1]))
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
    return KeyPath(dep)
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

  coercedDeps.forEach((dep) => {
    if (isGetter(dep)) {
      accum = accum.union(flattenDeps(dep.deps))
    } else {
      accum = accum.add(dep)
    }
  })

  return accum.toJS()
}

/**
 * Wrap the Getter in a function that coerces args
 *
 * Takes the form createGetter('dep1', 'dep2', computeFn)
 * or
 * Takes the form createGetter('dep1', 'dep2') // identity function is used
 *
 * @return {GetterRecord}
 */
function createGetter() {
  // createGetter() returns a blank getter
  if (arguments.length === 0) {
    return createGetter([])
  }
  var len = arguments.length
  var deps
  var computeFn
  if (isFunction(arguments[len - 1])) {
    // computeFn is provided
    deps = Array.prototype.slice.call(arguments, 0, len - 1)
    computeFn = arguments[len - 1]
  } else {
    // computeFn isnt provided use identity
    deps = Array.prototype.slice.call(arguments, 0)
    computeFn = identity
  }

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

/**
 * Returns a getter from arguments
 * @param {array} args or arguments
 * @return {Getter}
 */
function fromArgs(args) {
  if (args.length === 1 && isGetter(args[0])) {
    // was passed a Getter
    return args[0]
  }
  return createGetter.apply(null, args)
}

module.exports = createGetter

module.exports.isGetter = isGetter

module.exports.fromArgs = fromArgs
