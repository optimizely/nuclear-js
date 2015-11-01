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
        set.add(List(dep))
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
    .map(keyPath => keyPath.first())
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
  getStoreDeps,
  getDeps,
  fromKeyPath,
}
