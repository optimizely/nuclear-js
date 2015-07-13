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
    const homeLink = this.props.includeLogo
      ? <li className="hide-on-large-only"><a href={urlize("")}>Home</a></li>
      : null

    return <div className="navbar-fixed">
      <nav className="nav">
        <div className="hide-on-large-only">
          <ul className="right">
            {homeLink}
            <li><a href={urlize("docs/01-getting-started.html")}>Docs</a></li>
            <li><a href={urlize("docs/07-api.html")}>API</a></li>
            <li><a href="https://github.com/optimizely/nuclear-js">Github</a></li>
          </ul>
        </div>
        <div className="nav-wrapper hide-on-med-and-down">
          {logo}
          <ul className="right">
            <li><a href={urlize("docs/01-getting-started.html")}>Docs</a></li>
            <li><a href={urlize("docs/07-api.html")}>API</a></li>
            <li><a href="https://github.com/optimizely/nuclear-js">Github</a></li>
          </ul>
        </div>
      </nav>
    </div>
  }
})
