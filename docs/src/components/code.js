import React from 'react'
import Highlight from 'react-highlight'

export default React.createClass({
  render() {
    var languageClass = 'language-' + this.props.lang
    return (
      <div className="highlighted-code">
        <pre className={languageClass}>
          <code className={languageClass}>
            {this.props.children}
          </code>
        </pre>
      </div>
    )
  }
})
