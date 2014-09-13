/**
 * Map {
 *  experiments: Map {
 *    1: Map {
 *      id: 1
 *    },
 *    2: Map {
 *      id: 2
 *    }
 *  }
 * }
 * into
 * Map {
 *  experiments: Vector [
 *    Map { id: 1 },
 *    Map { id: 2 },
 *  ]
 * }
 */
module.exports = function(data) {
  return data.map(function(value) {
    return value.toVector()
  })
}
