jest.autoMockOff();

var Flux = require('../src/Flux');
var Store = require('../src/Store');

describe("instantiation", () => {
  it('should expose stores and actionGroups as objects', () => {
    var flux = new Flux();
    expect(flux.stores).toEqual({});
    expect(flux.actionGroups).toEqual({});
  })

  describe('streams', () => {
    var flux, store1, store2;

    beforeEach(() => {
      flux = new Flux()

      store1 = new Store()
      store1.handle = function(action) {
        this.state = action
        this.emitState()
      }

      store2 = new Store()
      store2.handle = function(action) {
        this.state = action
        this.emitState()
      }

      flux.registerStore('store1', store1)
      flux.registerStore('store2', store2)
    })

    it('should pipe actions to all registered stores', () => {
      var action = {
        foo: 'bar'
      };

      expect(store1.getState()).toBe(null)
      expect(store2.getState()).toBe(null)

      flux.dispatchStream.write(action)

      expect(store1.getState()).toBe(action)
      expect(store2.getState()).toBe(action)
    })
  })
})
