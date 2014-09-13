var through = require('through')
var createTransformStream = require('./create-transform-stream')
var Immutable = require('immutable')

class StoreWatcher {
  constructor(flux) {
    this.__flux = flux
    this.__cache = {}
    this.__watcherStream = through((data) => {
      this.__handleStoreChange(data)
    })
    // map storeId => store.stream
    this.__watchedStores = {}
    // maps of storePath => last state of that storePath
    // {
    //  'CurrentProjectStore.id': <number>
    //  'EntityStore.experiments': <Immutable.Map>
    //  'EntityStore.projects': <Immutable.Map>
    //  'EntityStore.audiences': <Immutable.Map>
    //  'EntityStore.experiments': <Immutable.Map>
    // }
    this.__storeStateCache = {}
    // map of storePaths => Array<Computed> that depend on the path
    this.__storePathsToComputedStreams = {}
    // map of storeId => keypaths watched on the store
    this.__watchedStorePaths = {}
    // enumeration of all computed streams
    this.__computedStreams = []
  }

  /**
   * @param {array.<string>} storePaths array of 'StoreId.keypart1.keypart2'
   */
  createComputed(storePaths) {
    var computedStream = createTransformStream()
    // bind the store paths to an instance of the transform stream
    computedStream.storePaths = storePaths
    this.__computedStreams.push(computedStream)
    storePaths.forEach(path => {
      this.__setupWatch(path, computedStream)
    })
    return computedStream
  }

  /**
   * Unpipes all the streams that are routed to this watcher
   */
  destroy() {
    for (storeId in this.__watchedStores) {
      this.__watchedStores[storeId].stream.unpipe(this.__watcherStream)
    }
  }

  /**
   * Registers a single storePath and its corresponding computedStream
   * @param {string} storePath
   * @return {ComputedStream} computedStream
   */
  __setupWatch(storePath, computedStream) {
    // destructure
    var splitStorePath = storePath.split('.')
    var storeId = splitStorePath[0]
    var keyPath = splitStorePath.slice(1)

    // if the store isn't watched
    if (!this.__watchedStores[storeId]) {
      var store = this.__flux.getStore(storeId)
      store.stream.pipe(this.__watcherStream)
      this.__watchedStores[storeId] = {
        // maintain reference to stream for unpiping
        stream: store.stream,
        // array of storePaths that are on this store
        watchedPaths: []
      }
    }

    if (!this.__storePathsToComputedStreams[storePath]) {
      this.__storePathsToComputedStreams[storePath] = []
    }
    this.__storePathsToComputedStreams[storePath].push(computedStream)
    this.__watchedStores[storeId].watchedPaths.push(storePath)
    this.__storeStateCache[storePath] = null
  }

  __handleStoreChange(data) {
    var pathsChanged = []
    var toUpdate = []

    var storeId = data.id
    var state = data.state


    // find all the paths we care about
    var watchedPaths = this.__watchedStores[storeId].watchedPaths
    watchedPaths.forEach(path => {
      var cached = this.__storeStateCache[path]
      var current = this.__flux.getState(path)
      if (cached !== current) {
        // the state has changed since last time
        pathsChanged.push(path)
        // update the cache
        this.__storeStateCache[path] = current
      }
    })

    // collect all the computedstreams that need to be updated
    pathsChanged.forEach(path => {
      this.__storePathsToComputedStreams[path].forEach(computedStream => {
        toUpdate.push(computedStream)
      })
    })

    // write to all the computed streams
    toUpdate.forEach(this.__emitOnComputedStreams.bind(this))
  }

  /**
   * Emits the dependency state on a computed stream
   * @param {ComputedStream} computedstreams
   */
  __emitOnComputedStreams(computedStream) {
    var args = computedStream.storePaths.map(path => {
      return this.__storeStateCache[path]
    })
    computedStream.write(args)
  }
}

module.exports = StoreWatcher
