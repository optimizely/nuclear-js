import Immutable, { List } from 'immutable'
import { isFunction, isArray, toFactory } from './utils'
import { isKeyPath } from './key-path'

const CACHE_OPTIONS = ['default', 'always', 'never']

/**
 * Getter helper functions
 * A getter is an array with the form:
 * [<KeyPath>, ...<KeyPath>, <function>]
 */
const identity = (x) => x

class GetterClass {
  constructor(getter, config = {}) {

    if (!isKeyPath(getter) && !isGetter(getter)) {
      throw new Error('Getter must be passed a keyPath or Getter')
    }

    this.getter = getter
    this.cache = CACHE_OPTIONS.indexOf(config.cache) > -1 ? config.cache : 'default'
    this.cacheKey = config.cacheKey !== undefined ? config.cacheKey : null
  }
}

const Getter = toFactory(GetterClass)

/**
 * Checks if something is a getter literal, ex: ['dep1', 'dep2', function(dep1, dep2) {...}]
 * @param {*} toTest
 * @return {boolean}
 */
function isGetter(toTest) {
  return (isArray(toTest) && isFunction(toTest[toTest.length - 1]))
}

/**
 * Checks if something is a getter object, ie created with the Getter function
 * @param {*} toTest
 * @return {boolean}
 */
function isGetterObject(toTest) {
  return toTest instanceof GetterClass
}

/**
 * Returns the compute function from a getter
 * @param {Getter} getter
 * @return {function}
 */
function getComputeFn(getter) {
  getter = convertToGetterLiteral(getter)
  return getter[getter.length - 1]
}

/**
 * Returns an array of deps from a getter
 * @param {Getter} getter
 * @return {function}
 */
function getDeps(getter) {
  getter = convertToGetterLiteral(getter)
  return getter.slice(0, getter.length - 1)
}

/**
 * Returns an array of deps from a getter and all its deps
 * @param {Getter} getter
 * @param {Immutable.Set} existing
 * @return {Immutable.Set}
 */
function getFlattenedDeps(getter, existing) {
  getter = convertToGetterLiteral(getter)
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
  getter = convertToGetterLiteral(getter)
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

/**
 * If the function is an instance of GetterClass, return the getter property
 * @param {*} getter
 * returns {*}
 */
function convertToGetterLiteral(getter) {
  if (isGetterObject(getter)) {
    return getter.getter
  } else if (isKeyPath(getter) || isGetter(getter)) {
    return getter
  } else {
    throw new Error('Getter must be passed a keyPath or Getter')
  }
}

export default {
  isGetter,
  getComputeFn,
  getFlattenedDeps,
  getStoreDeps,
  getDeps,
  fromKeyPath,
  isGetterObject,
  Getter,
  convertToGetterLiteral,
}
