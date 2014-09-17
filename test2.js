var Nuclear = require('../src/facade')
var nuke = Nuclear.createReactor()
var SelectedElementCore = Nuclear.createCore({
  initialize: function() {
    this.on('selectElement', this.selectElement)
  },

  selectElement: function(state, payload) {
    return payload
  }
})

nuke.attachCore('SelectedElement', SelectedElementCore)

nuke.inputStream.write({
  type: 'selectElement',
  payload: {
    foo: 'bar'
  }
})
nuke.react()


console.log(nuke.state.toString())


