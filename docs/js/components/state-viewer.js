import React from 'react'
import { toJS } from 'nuclear-js'

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
    let title
    if (this.props.title) {
      title = <strong>{this.props.title} </strong>
    }

    var className = "state-viewer"

    if (this.props.active) {
      className += " active"
    }

    return <div className={className}>
      <pre className="state-viewer--contents">
      {title}
        {this.state.appState}
      </pre>
    </div>
  }
})
