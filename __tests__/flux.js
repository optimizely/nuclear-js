jest.autoMockOff();

var Flux = require('../src/flux');

describe("instantiation", () => {
  it('should expose stores and actionGroups as objects', () => {
    var flux = new Flux();
    expect(flux.stores).toEqual({});
    expect(flux.actionGroups).toEqual({});
  })
})
