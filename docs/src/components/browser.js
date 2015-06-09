import React from 'react'

export default React.createClass({
  render() {
    var className = 'browser-component';

    if (this.props.size) {
      className += " browser-component__" + this.props.size
    }


    var contentClassName = "browser-component--content"

    return <div className={className}>
      <div className="browser-component--top">
        <div className="browser-component--top-left"></div>
        <div className="browser-component--top-middle"></div>
        <div className="browser-component--top-right"></div>
      </div>

      <div className={contentClassName}>
        {this.props.children}
      </div>
    </div>
  }
})
