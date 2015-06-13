import React from 'react'

export default React.createClass({
  render() {
    return <div className="navbar-fixed">
      <nav className="nav">
        <div className="nav-wrapper">
          <ul id="nav-mobile" className="right hide-on-med-and-down">
            <li><a href="docs/overview.html">Docs</a></li>
            <li><a href="examples/">Examples</a></li>
            <li><a href="api/">API</a></li>
            <li><a href="https://github.com/optimizely/nuclear-js">Github</a></li>
          </ul>
        </div>
      </nav>
    </div>
  }
})
