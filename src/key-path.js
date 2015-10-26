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

/**
 * Checks if two keypaths are equal by value
 * @param {KeyPath} a
 * @param {KeyPath} a
 * @return {Boolean}
 */
export function isEqual(a, b) {
  const iA = Immutable.List(a)
  const iB = Immutable.List(b)

  return Immutable.is(iA, iB)
}
