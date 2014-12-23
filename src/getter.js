var Immutable = require('immutable')
var isFunction = require('./utils').isFunction
var isArray = require('./utils').isArray
var isKeyPath = require('./key-path').isKeyPath

/**
 * Getter helper functions
 * A getter is an array with the form:
 * [<KeyPath>, ...<KeyPath>, <function>]
 */
var identity = (x) => x

/**
 * Checks if something is a getter literal, ex: ['dep1', 'dep2', function(dep1, dep2) {...}]
 * @param {*} toTest
 * @return {boolean}
 */
function isGetter(toTest) {
  return (isArray(toTest) && isFunction(toTest[toTest.length - 1]))
}


/**
 * Recursive function to flatten deps of a getter
 * @param {Getter} getter
 * @return {Array.<KeyPath>} unique flatten deps
 */
function unwrapDeps(getter) {
  var accum = Immutable.Set()
  var deps = getter.slice(0, getter.length - 1)

  return accum.withMutations(accum => {
    deps.forEach((dep) => {
      isGetter(dep)
        ? accum.union(unwrapDeps(dep))
        : accum.add(dep)
    })
    return accum
  })
}

/**
 * Returns the compute function from a getter
 * @param {Getter} getter
 * @return {function}
 */
function getComputeFn(getter) {
  return getter[getter.length - 1]
}

/**
 * Returns an array of deps from a getter
 * @param {Getter} getter
 * @return {function}
 */
function getDeps(getter) {
  return getter.slice(0, getter.length - 1)
}

/**
 * @param {KeyPath}
 * @return {Getter}
 */
function fromKeyPath(keyPath) {
  if (!isKeyPath(keyPath)) {
    throw new Error("Cannot create Getter from KeyPath: " + keyPath)
  }

  return [keyPath, identity]
}


module.exports = {
  unwrapDeps: unwrapDeps,
  isGetter: isGetter,
  getComputeFn: getComputeFn,
  getDeps: getDeps,
  fromKeyPath: fromKeyPath,
}
