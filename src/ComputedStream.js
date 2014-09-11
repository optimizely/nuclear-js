var through = require('through')

/**
 * A wrapper around a through stream that holds its dependencies
 *
 * Example: Current Experiments computed depends on 'CurrentProject.id' and 'Entity.experiments'
 */
class ComputedStream {
  constructor(storePaths) {
    this.storePaths = storePaths
    this.stream = through()
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
