jest.autoMockOff();

var through = require('through')
var Flux = require('../src/Flux');

describe("instantiation", () => {
  it('exposes a dispatch stream and change stream', () => {
    var mockFn = jest.genMockFn()
    var flux = new Flux();
    flux.changeStream.pipe(through(mockFn))

    flux.dispatch('no-op', {})
    flux.dispatch('no-op', {})

    var calls = mockFn.mock.calls
    expect(calls[0][0]).toEqual(calls[1][0])
  })
})
