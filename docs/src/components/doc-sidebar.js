import React from 'react'
import { BASE_URL } from '../globals'

export default React.createClass({
  //propTypes: {
    //navStructure: React.PropTypes.objectOf(React.PropTypes.shape({
    //}))
  //},

  render() {
    return (
      <div className="docs-page--sidebar col l2">
        <h3>{this.props.sectionTitle}</h3>
        <ul className="sidebar-links">
          {this.props.navData.map(function(navItem) {
            var href = BASE_URL + navItem.relative
            return <li className="sidebar-links--item">
              <a href={href}>{navItem.title}</a>
            </li>
          })}
        </ul>
      </div>
    )
  }
})
