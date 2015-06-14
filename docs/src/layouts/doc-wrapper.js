import React from 'react'
import Wrapper from './wrapper'
import DocSidebar from '../components/doc-sidebar'
import Nav from '../components/nav'

export default React.createClass({
  propTypes: {
    title: React.PropTypes.string.isRequired,
    contents: React.PropTypes.string.isRequired,
  },

  render() {
    return (
      <Wrapper title={this.props.title}>
        <Nav />

        <div className="container">
          <div className="docs-page row">
            <DocSidebar navData={this.props.navData} />
            <div className="docs-page--contents col l10" dangerouslySetInnerHTML={{ __html: this.props.contents }}></div>
          </div>
        </div>
      </Wrapper>
    )
  }
})
