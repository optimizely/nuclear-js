import Immutable from 'immutable'
import { isArray, isFunction } from './utils'

/**
 * Checks if something is simply a keyPath and not a getter
 * @param {*} toTest
 * @return {boolean}
 */
export function isKeyPath(toTest) {
  return (
    isArray(toTest) &&
    !isFunction(toTest[toTest.length - 1])
  )
}

