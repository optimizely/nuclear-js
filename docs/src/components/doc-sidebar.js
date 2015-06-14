import React from 'react'
import { BASE_HOST } from '../globals'

export default React.createClass({
  //propTypes: {
    //navStructure: React.PropTypes.objectOf(React.PropTypes.shape({


    //}))
  //},

  render() {
    return (
      <div className="docs-page--sidebar col l2">
        <ul>
          {this.props.navData.map(function(navItem) {
            var href = BASE_HOST + navItem.relative
            return <li><a href={href}>{navItem.title}</a></li>
          })}
        </ul>
      </div>
    )
  }
})
