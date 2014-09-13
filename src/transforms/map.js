/**
 * Immutable map transform
 */
module.exports = function(fn) {
  return function(data) {
    return data.map(fn)
  }
}
