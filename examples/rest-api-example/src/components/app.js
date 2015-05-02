/**
 * @jsx React.DOM
 */
// libs
var React = require('react')
var flux = require('flux')
// components
var WorkspaceComponent = require('components/workspace')
var TopMenuComponent = require('components/top-menu')
// modules
var CurrentWorkspace = require('modules/current-workspace')

module.exports = React.createClass({
  mixins: [flux.mixin],

  getDataBindings() {
    return {
      isWorkspaceOpen: CurrentWorkspace.getters.isWorkspaceOpen,
    }
  },

  render() {
    if (this.state.isWorkspaceOpen) {
      return (
        <div>
          <TopMenuComponent />
          <WorkspaceComponent />
        </div>
      )
    } else {
      return (
        <div>
          <TopMenuComponent />
        </div>
      )
    }
  },
})
