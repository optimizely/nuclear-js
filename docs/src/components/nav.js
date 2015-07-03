import React from 'react'
import { BASE_URL } from '../globals'

function urlize(uri) {
  return BASE_URL + uri
}

export default React.createClass({
  render() {
    const logo = this.props.includeLogo
      ? <a href={BASE_URL} className="brand-logo">NuclearJS</a>
      : null

    return <div className="navbar-fixed">
      <nav className="nav">
        <div className="nav-wrapper">
          {logo}
          <ul id="nav-mobile" className="right hide-on-med-and-down">
            <li><a href={urlize("docs/01-getting-started.html")}>Docs</a></li>
            <li><a href={urlize("examples/")}>Examples</a></li>
            <li><a href={urlize("api/")}>API</a></li>
            <li><a href="https://github.com/optimizely/nuclear-js">Github</a></li>
          </ul>
        </div>
      </nav>
    </div>
  }
})
