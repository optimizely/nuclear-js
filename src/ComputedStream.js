var through = require('through')

function createTransformStream(transformFn) {
  var stream = through(function(data) {
    result = transformFn(data)
    if (result !== undefined) {
      this.queue(result)
    }
  })
  stream.transform = function(fn) {
    transformStream = createTransformStream(fn)
    stream.pipe(transformStream)
    return transformStream
  }
  return stream
}

/**
 * A wrapper around a through stream that holds its dependencies
 *
 * Has a stream-like interface that supports piping/unpiping
 *
 * Example: Current Experiments computed depends on 'CurrentProject.id' and 'Entity.experiments'
 */
class ComputedStream {
  constructor(storePaths) {
    this.storePaths = storePaths
    this.stream = through()
  }

  transform(transformFn) {
    var transformStream = createTransformStream(transformFn)
    this.stream.pipe(transformStream)
    return transformStream
  }

  pipe(stream) {
    return this.stream.pipe(stream)
  }

  unpipe(stream) {
    this.stream.unpipe(stream)
  }

  write(data) {
    this.stream.write(data)
  }
}

module.exports = ComputedStream
