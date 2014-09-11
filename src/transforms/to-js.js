var isArray = require('../utils').isArray

function toJS(arg) {
  return (typeof arg === 'object' && arg.toJS)
    ? arg.toJS()
    : arg;
}

module.exports = toJS
