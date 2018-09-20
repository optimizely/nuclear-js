import Immutable, { List } from 'immutable'
import { isFunction, isArray } from './utils'
import { isKeyPath } from './key-path'

/**
 * Getter helper functions
 * A getter is an array with the form:
 * [<KeyPath>, ...<KeyPath>, <function>]
 */
const identity = (x) => x

/**
 * Checks if something is a getter literal, ex: ['dep1', 'dep2', function(dep1, dep2) {...}]
 * @param {*} toTest
 * @return {boolean}
 */
function isGetter(toTest) {
  return (isArray(toTest) && isFunction(toTest[toTest.length - 1]))
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
 * Returns an array of deps from a getter and all its deps
 * @param {Getter} getter
 * @param {Immutable.Set} existing
 * @return {Immutable.Set}
 */
function getFlattenedDeps(getter, existing) {
  if (!existing) {
    existing = Immutable.Set()
  }

  const toAdd = Immutable.Set().withMutations(set => {
    if (!isGetter(getter)) {
      throw new Error('getFlattenedDeps must be passed a Getter')
    }

    getDeps(getter).forEach(dep => {
      if (isKeyPath(dep)) {
        set.add(Immutable.List(dep))
      } else if (isGetter(dep)) {
        set.union(getFlattenedDeps(dep))
      } else {
        throw new Error('Invalid getter, each dependency must be a KeyPath or Getter')
      }
    })
  })

  return existing.union(toAdd)
}

/**
 * Returns a set of deps that have been flattened and expanded
 * expanded ex: ['store1', 'key1'] => [['store1'], ['store1', 'key1']]
 *
 * Note: returns a keypath as an Immutable.List(['store1', 'key1')
 * @param {Getter} getter
 * @param {Number} maxDepth
 * @return {Immutable.Set}
 */
function getCanonicalKeypathDeps(getter, maxDepth) {
  if (maxDepth === undefined) {
    throw new Error('Must supply maxDepth argument')
  }

  const cacheKey = `__storeDeps_${maxDepth}`
  if (getter.hasOwnProperty(cacheKey)) {
    return getter[cacheKey]
  }

  const deps = Immutable.Set().withMutations(set => {
    getFlattenedDeps(getter).forEach(keypath => {
      if (keypath.size <= maxDepth) {
        set.add(keypath)
      } else {
        set.add(keypath.slice(0, maxDepth))
      }
    })
  })

  Object.defineProperty(getter, cacheKey, {
    enumerable: false,
    configurable: false,
    writable: false,
    value: deps,
  })

  return deps
}

/**
 * @param {KeyPath}
 * @return {Getter}
 */
function fromKeyPath(keyPath) {
  if (!isKeyPath(keyPath)) {
    throw new Error('Cannot create Getter from KeyPath: ' + keyPath)
  }

  return [keyPath, identity]
}

/**
 * Adds non enumerated __storeDeps property
 * @param {Getter}
 */
function getStoreDeps(getter) {
  if (getter.hasOwnProperty('__storeDeps')) {
    return getter.__storeDeps
  }

  const storeDeps = getFlattenedDeps(getter)
    .filter(x => !!x)


  Object.defineProperty(getter, '__storeDeps', {
    enumerable: false,
    configurable: false,
    writable: false,
    value: storeDeps,
  })

  return storeDeps
}

export default {
  isGetter,
  getComputeFn,
  getFlattenedDeps,
  getCanonicalKeypathDeps,
  getStoreDeps,
  getDeps,
  fromKeyPath,
}
