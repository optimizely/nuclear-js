import { Store } from 'nuclear-js'

export default new Store({
  getInitialState() {
    return 0
  },
  initialize() {
    this.on('increment', (state) => state + 1)
    this.on('decrement', (state) => state - 1)
  }
})
