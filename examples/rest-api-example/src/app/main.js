/**
 * Main entry point
 */
var React = require('react')
var App = require('components/app')
var Node = require('modules/node')
var Workspace = require('modules/workspace')
var CurrentWorkspace = require('modules/current-workspace')

var workspace = Workspace.actions.create({
  name: 'workspace #1'
})

CurrentWorkspace.actions.setCurrentWorkspaceId(workspace.get('id'))

CurrentWorkspace.actions.addNode({
  title: 'node #1',
})

CurrentWorkspace.actions.addNode({
  title: 'node #2',
})

var mountNode = document.getElementById('app')
React.render(<App />, mountNode)
