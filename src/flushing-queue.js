var clone = require('./utils').clone

class FlushingQueue {
  constructor(size, onFlush) {
    this.SIZE = size
    this.__queue = []
    this.onFlush = onFlush || function() {}
  }

  push(item) {
    if (this.__queue.length === this.SIZE) {
      this.onFlush(this.flush())
    }

    this.__queue.push(item)
  }

  flush() {
    var toFlush = clone(this.__queue)
    this.__queue = []
    return toFlush
  }
}

module.exports = function(size, onFlush) {
  return new FlushingQueue(size, onFlush)
}
