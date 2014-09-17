jest.autoMockOff()

var Nuclear = require('../src/facade')

describe('hey', () => {
  var nuke = Nuclear.createReactor()

  it.only('', () => {
    var SelectedElementCore = Nuclear.createCore({
      initialize: function() {
        this.on('selectElement', this.selectElement)
      },

      selectElement: function(state, payload) {
        return payload
      }
    })
    nuke.attachCore('SelectedElement', SelectedElementCore)

    var mockFn = jest.genMockFn()
    nuke.onChange('SelectedElement.foo', mockFn)

    nuke.inputStream.write({
      type: 'selectElement',
      payload: {
        foo: 'bar'
      }
    })

    nuke.react()

    expect(nuke.get('SelectedElement')).toEqual({
      foo: 'bar'
    })

    expect(mockFn.mock.calls[0][0]).toBe('bar')
  })
})

