import React from 'react'
import { toJS } from 'nuclear-js'
import Code from './code'

function formatState(state) {
  return JSON.stringify(toJS(state), null, '  ').replace(/\{([^{}]+)\}/g, function(match, contents, index, all) {
    return match.replace(/\n\s+/g, '')
  })
}

export default React.createClass({

  componentWillMount() {
    let reactor = this.props.reactor
    let getter = this.props.getter || []

    var stateGetter = [getter, formatState]

    this._unobserve = reactor.observe(stateGetter, appState => {
      this.setState({ appState })
    })

    const appState = reactor.evaluate(stateGetter)
    this.setState({ appState })
  },

  componentWillUnmount() {
    this._unobserve();
  },

  render() {
    let codeString = ''
    if (this.props.title) {
      codeString += this.props.title + ' '
    }
    codeString += this.state.appState

    return <Code lang="javascript">
      {codeString}
    </Code>
  }
})
