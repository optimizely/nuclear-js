var stream = require('through')
var each = require('./utils').each
var Immutable = require('immutable')

var mutate = require('./immutable-helpers').mutate

class ReactorCluster {
  constructor() {
    /**
     * The state for the whole cluster
     */
    this.state = Immutable.Map({})
    /**
     * Holds a map of id => reactor instance
     */
    this.reactors = {}

    /**
     * Queues an action object to be handled
     * on the next cycle
     */
    this.actionQueue = []

    /**
     * Actions are written to this input stream and handled by the reactor
     * cluster
     */
    this.inputStream = stream(action => {
      this.actionQueue.push(action)
    })

    /**
     * Output stream that emits the state of the reactor cluster anytime
     * a cycle happens
     */
    this.outputStream = stream()
  }

  /**
   * Executes all the actions in the action queue and emits the new
   * state of the cluster on the output stream
   */
  cycle() {
    var state = this.state
    var actionQueue = this.actionQueue
    var reactors = this.reactors

    this.state = mutate(state, state => {
      while (actionQueue.length > 0) {
        var action = actionQueue.shift()
        each(reactors, (reactor, id) => {
          // dont let the reactor mutate by reference
          var reactorState = state.get(id).asImmutable()
          var newState = reactor.react(
            state.get(id),
            action.type,
            action.payload
          )
          state.set(id, newState)
        })
      }
    })

    // write the new state to the output stream
    this.outputStream.write(this.state)
  }

  /**
   * @param {string} id
   * @param {Reactor} Reactor
   */
  attachReactor(id, Reactor) {
    if (this.reactors[id]) {
      throw new Error("Only one reactor can be registered per id")
    }
    if (!this.state.get(id)) {
      this.state = this.state.set(id, Immutable.Map())
    }
    var reactor = new reactor(this.state.get(id))
    reactor.initialize()
    this.reactors[id] = reactor
  }

  unattachReactor(id) {
    delete this.reactors[id]
  }
}

module.exports = ReactorCluster
