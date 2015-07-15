import React from 'react'
import { PrismCode } from 'react-prism'

export default React.createClass({
  render() {
    var languageClass = 'language-' + this.props.lang
    return (
      <div className="highlighted-code">
        <pre className={languageClass}>
          <PrismCode className={languageClass} async={false}>
            {this.props.children}
          </PrismCode>
        </pre>
      </div>
    )
  }
})
