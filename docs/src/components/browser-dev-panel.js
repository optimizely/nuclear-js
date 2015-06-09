import React from 'react'

export default React.createClass({
  render() {
    return <div className="browser-component--dev-panel">
      {this.props.children}
    </div>
  }
})
