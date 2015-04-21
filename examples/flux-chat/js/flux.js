// create the Nuclear reactor instance, this will act as our dispatcher and interface for data fetching
var Nuclear = require('nuclear-js')

module.exports = new Nuclear.Reactor({
  debug: true,
})
