var through = require('through')
var isArray = require('./utils').isArray

module.exports = function createTransformStream(transformFn) {
  var stream = through(function(data) {
    if (!isArray(data)) {
      data = [data]
    }

    if (transformFn === undefined) {
      // if there is no transform functon it should behave like through()
      this._prevValue = data
      this.queue(data)
    } else {
      result = transformFn.apply(null, data)
      if (result !== undefined) {
        this._prevValue = result
        this.queue(result)
      }
    }
  })
  var origPipe = stream.pipe;
  stream.pipe = function(dest, opts) {
    origPipe.call(stream, dest, opts)
    if (this._prevValue !== undefined) {
      dest.write(this._prevValue)
    }
  }

  stream.transform = function(fn) {
    transformStream = createTransformStream(fn)
    stream.pipe(transformStream)
    return transformStream
  }
  return stream
}
