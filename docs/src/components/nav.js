import React from 'react'
import { BASE_URI } from '../globals'

export default React.createClass({
  render() {
    const logo = this.props.includeLogo
      ? <a href={BASE_URI} class="brand-logo">NuclearJS</a>
      : null

    return <div className="navbar-fixed">
      <nav className="nav">
        <div className="nav-wrapper">
          {logo}
          <ul id="nav-mobile" className="right hide-on-med-and-down">
            <li><a href="docs/01-getting-started.html">Docs</a></li>
            <li><a href="examples/">Examples</a></li>
            <li><a href="api/">API</a></li>
            <li><a href="https://github.com/optimizely/nuclear-js">Github</a></li>
          </ul>
        </div>
      </nav>
    </div>
  }
})
