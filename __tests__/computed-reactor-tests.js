jest.autoMockOff()

var Nuclear = require('../src/facade')

describe('ComputedReactor', () => {
  var reactor

  var SelectedElementCore = Nuclear.createCore({
    initialize: function() {
      this.on('selectElement', this.selectElement)
    },

    selectElement: function(state, payload) {
      return payload
    }
  })

  beforeEach(() => {
    reactor = Nuclear.createReactor()
    reactor.attachCore('SelectedElement', SelectedElementCore)
  })

  it.only('should call a function when the computed changes', () => {
    var mockFn = jest.genMockFn()

    reactor.onChange('SelectedElement.foo', mockFn)

    reactor.inputStream.write({
      type: 'selectElement',
      payload: {
        foo: 'bar'
      }
    })

    reactor.react()

    expect(reactor.get('SelectedElement')).toEqual({
      foo: 'bar'
    })

    expect(mockFn.mock.calls[0][0]).toBe('bar')
  })
})

