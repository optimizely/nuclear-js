import Immutable from 'immutable'
import { isObject } from './utils'

/**
 * A collection of helpers for the ImmutableJS library
 */

/**
 * @param {*} obj
 * @return {boolean}
 */
export function isImmutable(obj) {
  return Immutable.Iterable.isIterable(obj)
}

/**
 * Returns true if the value is an ImmutableJS data structure
 * or a JavaScript primitive that is immutable (string, number, etc)
 * @param {*} obj
 * @return {boolean}
 */
export function isImmutableValue(obj) {
  return (
    isImmutable(obj) ||
    !isObject(obj)
  )
}

/**
 * Converts an Immutable Sequence to JS object
 * Can be called on any type
 */
export function toJS(arg) {
  // arg instanceof Immutable.Sequence is unreliable
  return (isImmutable(arg))
    ? arg.toJS()
    : arg
}

/**
 * Converts a JS object to an Immutable object, if it's
 * already Immutable its a no-op
 */
export function toImmutable(arg) {
  return (isImmutable(arg))
    ? arg
    : Immutable.fromJS(arg)
}

