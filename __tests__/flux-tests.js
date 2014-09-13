jest.autoMockOff();

var Flux = require('../src/Flux');
var Store = require('../src/Store');

describe("instantiation", () => {
  it('should expose stores and actionGroups as objects', () => {
    var flux = new Flux();
    expect(flux.stores).toEqual({});
    expect(flux.actionGroups).toEqual({});
  })
})
