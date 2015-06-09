require('highlight.js/styles/github.css')

import React from 'react'
import Highlight from 'react-highlight'

export default React.createClass({
  render() {
    return (
      <div className="highlighted-code">
        <Highlight className={this.props.lang}>
          {this.props.children}
        </Highlight>
      </div>
    )
  }
})
