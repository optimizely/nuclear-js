import React from 'react'

export default React.createClass({
  render() {
    var className = 'example-step';

    let push = this.props.push
    if (push === 'right') {
      className += ' example-step__push-right'
    }

    return <div className={className}>
        {this.props.children}
    </div>
  }
})
