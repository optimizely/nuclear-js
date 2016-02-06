import { each } from './utils'

/**
 * Returns a mapping of the getDataBinding keys to
 * the reactor values
 */
function getState(reactor, data) {
  let state = {}
  each(data, (value, key) => {
    state[key] = reactor.evaluate(value)
  })
  return state
}

/**
 * @param {Reactor} reactor
 */
export default function(reactor) {
  return {
    getInitialState() {
      return getState(reactor, this.getDataBindings())
    },

    componentDidMount() {
      const bindings = this.getDataBindings()
      let keys = Object.keys(bindings)
      const args = keys.map((k) => { return bindings[k] })
      args.push((...vals) => { return vals })

      this.__unwatchFn = reactor.observe(args, (vals) => {
        let state = {}
        each(vals, (val, i) => { state[keys[i]] = val })
        this.setState(state)
      })
    },

    componentWillUnmount() {
      if (this.__unwatchFn) {
        this.__unwatchFn()
      }
    },
  }
}
