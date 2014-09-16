/**
 * Input:
 *  prevState
 *  currState,
 *  ['Entity.path.1', 'CurrentProject.id']
 *
 * Returns [{ id: 1, val: 1}, 1] or null
 *
 * @param {Immutable.Map} prev
 * @param {Immutable.Map} curr
 * @param {Array<Array<String>>} pathArr array of arrays of keyPaths
 */
function getChanges(prev, curr, pathArr) {
  var prevValues = resolvePathValues(prev, pathArr)
  var currValues = resolvePathValues(curr, pathArr)
  var hasChanged = prevValues.some((val, ind) => {
    return val !== currValues[ind]
  })
  if (hasChanged) {
    return currValues
  } else {
    return null
  }
}

function resolvePathValues(state, paths) {
  return paths.map(path => {
    return state.getIn(path)
  })
}

module.exports = getChanges
