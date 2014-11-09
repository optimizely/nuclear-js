var List = require('immutable').List
var Map = require('immutable').Map
var each = require('./utils').each

/**
 * Recursively iterates through a deep map of a state config
 * and flattens to a format of
 *
 * var obj = {
 *   level1: {
 *     level2: {
 *       lev3Key: 3
 *     },
 *     lev2Key: 2
 *   }
 * }
 * into
 * {
 *   ['level1', 'level2', 'lev3Key']: 3,
 *   ['level1', 'lev2Key']: 2,
 * }
 *
 *
 * instance of ReactiveState or ComputedState
 *
 * @param {object} config
 * @param {Immutable.List?} keyAccum key accumulator for recursion
 * @param {Immutable.Map?} flatMap accumulator for the flattened map
 *
 * @return {Immutable.Map}
 */
function flattenMap(config, keyAccum, flatMap) {
  var keyAccum = keyAccum || List()
  var flatMap = flatMap || Map()

  each(config, (val, key) => {
    if (typeof val === "object") {
      flatMap = flattenMap(val, keyAccum.push(key), flatMap)
    } else {
      flatMap = flatMap.set(keyAccum.push(key), val)
    }
  })

  return flatMap
}

module.exports = flattenMap
