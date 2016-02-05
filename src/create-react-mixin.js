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
      this.__unwatchFns = []
      each(this.getDataBindings(), (getter, key) => {
        const unwatchFn = reactor.observe(getter, (val) => {
          this.setState({
            [key]: val,
          })
        })

        this.__unwatchFns.push(unwatchFn)
      })
    },

    componentWillUnmount() {
      while (this.__unwatchFns.length) {
        this.__unwatchFns.shift()()
      }
    },
  }
}

