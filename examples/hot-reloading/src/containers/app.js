import React, { Component } from 'react'
import { connect } from 'nuclear-js-react-addons'
import Counter from '../components/Counter'
import { increment, decrement } from '../actions/counter'

@connect(props => ({
  counter: ['counter']
}))
export default class AppContainer extends Component {
  render() {
    let { reactor, counter } = this.props
    return <Counter
      counter={counter}
      increment={increment.bind(null, reactor)}
      decrement={decrement.bind(null, reactor)}
    />
  }
}
