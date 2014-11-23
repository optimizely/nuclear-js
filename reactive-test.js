var _ = require('lodash')
var Nuclear = require('./dist/nuclear')
var ReactiveState = Nuclear.ReactiveState

var invoke = function(f) { return f() }

var Computed = function(entry) {
  var deps = entry.slice(0, entry.length - 1)
  var computeFn = entry[entry.length - 1]

  var listeners = []
  var unwatchFns = []

  var isDirty = true
  var cachedValue

  // initialize deps watcher
  deps.forEach(function(dep) {
    unwatchFns.push(dep.$watch(function() {
      // TODO: can this listener invocation be async and batched
      listeners.forEach(invoke)
      isDirty = true
    }))
  })

  var computed = function() {
    if (isDirty) {
      var args = deps.map(invoke)
      console.log('compute')
      cachedValue = computeFn.apply(null, args)
      isDirty = false
    }
    return cachedValue
  }

  computed.$destroy = function() {
    while (unwatchFns.length) {
      unwatchFns.shift()()
    }
  }

  /**
   * Adds change listener
   * @return {function} handler
   * @return {function} unwatch
   */
  computed.$watch = function(handler) {
    listeners.push(handler)
    return unwatch = function unwatch() {
      var ind = listeners.indexOf(handler)
      listeners.splice(ind, 1)
    }
  }

  return computed
}

var reactor = Nuclear.Reactor({
  state: {
    list: ReactiveState({
      getInitialState: function() {
        return []
      },
      initialize: function() {
        this.on('addItem', function(items, item) {
          return items.push(item)
        })
      }
    })
  }
})

reactor.$listeners = []
reactor.createChangeObserver().onChange('list', function() {
  reactor.$listeners.forEach(invoke)
})

reactor.initialize()

/**
 * Makes some function watchable
 */
function makeWatchable(onChange, computeFn) {
}

reactor.items()


// proxy a listReactor until Reactor is Refactored
var listReactor = function() {
  return reactor.getJS('list')
}

listReactor.$dispatch = reactor.dispatch.bind(reactor)

listReactor.$watch = function(f) {
  reactor.$listeners.push(f)
}

var count = Computed([listReactor, function(list) {
  return list.length
}])

var isTooHigh = Computed([count, function(count) {
  return count > 5
}])
var isTooHigh2 = Computed([count, function(count) {
  return count > 5
}])

var unwatch1 = isTooHigh.$watch(function() {
  console.log('too high 1')
})
var unwatch2 = isTooHigh2.$watch(function() {
  console.log('too high 2')
})

console.log('1')
console.assert(count() === 0)
console.log('2')
console.assert(!isTooHigh())
console.log('3')

_.range(10).forEach(function(i) {
  listReactor.$dispatch('addItem', {
    id: i
  })
})

console.assert(count() == 10)
console.assert(isTooHigh())

var api = {
  list: listReactor,
  count: count,
  isTooHigh: isTooHigh
}

console.log(api.list())
console.log(api.count())
