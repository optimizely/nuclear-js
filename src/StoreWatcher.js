var through = require('through')
var createTransformStream = require('./create-transform-stream')
var Immutable = require('immutable')
var coerceKeyPath = require('./utils').keyPath

class StoreWatcher {
  constructor(changeStream) {
    this.prevState = Immutable.Map({})
    changeStream.pipe(through(state => {
      console.log('handling state change', state.toString())
      this.__tick(this.prevState, state)
      this.prevState = state
    }))
    this.__subscribers = []
  }

  /**
   * @param {array.<string>} keyPaths array of 'StoreId.keypart1.keypart2'
   */
  subscribe(keyPaths) {
    var stream = createTransformStream()
    var keyPaths = keyPaths.map(coerceKeyPath)
    this.__subscribers.push({
      keyPaths: keyPaths,
      stream: stream
    })

    var values = keyPaths.map(path => {
      return this.prevState.getIn(path)
    })
    var isReady = values.every(v => {
      v !== undefined
    })
    if (isReady) {
      console.log('notifying subscribers', paths)
      stream.write(values)
    }
    return stream
  }

  /**
   * Unpipes all the streams that are routed to this watcher
   */
  destroy() {
    for (storeId in this.__watchedStores) {
      this.__subscribers[storeId].stream.end()
    }
  }

  __tick(prevState, currState) {
    this.__notifySubscribers(prevState, currState)
  }

  __notifySubscribers(prevState, currState) {
    this.__subscribers.forEach(subscriber => {
      var paths = subscriber.keyPaths
      var prevValues = this.__resolvePathValues(prevState, paths)
      var currValues = this.__resolvePathValues(currState, paths)
      var hasChanged = prevValues.some((val, ind) => {
        return val !== currValues[ind]
      })
      var notUndefined = currValues.every(x => {
        return x !== undefined
      })
      if (hasChanged && notUndefined) {
        console.log('notifying subscribers', paths)
        subscriber.stream.write(currValues)
      }
    })
  }

  __resolvePathValues(state, paths) {
    return paths.map(path => {
      return state.getIn(path)
    })
  }
}

module.exports = StoreWatcher
