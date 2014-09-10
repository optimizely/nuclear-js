jest.autoMockOff();

var Flux = require('../src/Flux');
var Store = require('../src/Store');
var through = require('through');

class MockStore extends Store {
  initialize() {
    this.bindActions('actionA', this.__handleA)
  }

  __handleA(payload) {
    this.setState('test', payload)
  }
}

describe("instantiation", () => {
  var state = {
    id: 'store',
    coll: [1,2,3]
  }

  it("should set the initial state at construction", () => {
    var store = new Store(state)
    expect(store.getState().toJS()).toEqual(state)
  })
})

describe("#setState", () => {
  var store;
  beforeEach(() => {
    store = new Store();
  })

  describe("without the keypath argument", () => {
    it("it should set this.state to whatever value is provided", () => {
      var state = {
        id: 1,
        coll: [1, 2, 3]
      }

      store.setState(state)

      var result = store.getState().toJS()
      expect(result).toEqual(state)
    })
  })

  describe("keypath is a string", () => {
    it("it should set this.state to whatever value is provided", () => {
      var id = 123
      var coll = [1,2,3]

      store.setState('id', id)
      store.setState('coll', coll)

      var result = store.getState().toJS()
      expect(result).toEqual({
        id: id,
        coll: coll
      })
    })
  })

  describe("keypath is an array", () => {
    it("it should set this.state to whatever value is provided", () => {
      var keypath = ['entities', 123]
      var entity = {
        id: 123,
        val: 'entity'
      }

      store.setState(keypath, entity)

      var result = store.getState().toJS()
      expect(result).toEqual({
        entities: {
          123: entity
        }
      })
    })
  })
})

describe("#getState", () => {
  var store
  var state = {
    id: 'store',
    coll: [1,2,3],
    entities: {
      1: {
        id: 1,
        val: 'entity 1'
      }
    }
  }

  beforeEach(() => {
    store = new Store(state);
  })

  it("calling `getState()` without arguments returns the entire store state", () => {
    var result = store.getState().toJS()
    expect(result).toEqual(state)
  })

  it("calling getState with a string key", () => {
    var result = store.getState('id')
    expect(result).toEqual('store')
  })

  it("calling getState with an array key", () => {
    var result = store.getState(['id'])
    expect(result).toEqual('store')
  })

  it("calling getState with a deep array key", () => {
    var result = store.getState(['entities', 1, 'val'])
    expect(result).toEqual(state.entities[1].val)
  })

  it("calling getState that returns an immutable value", () => {
    var result = store.getState('coll').toJS()
    expect(result).toEqual(state.coll)
  })
})

describe("binding action handlers", () => {
  var store
  beforeEach(() => {
    store = new MockStore()
    store.initialize()
  })

  it('should respond to `actionA`', () => {
    var payload = [1,2,3]

    store.stream.write({
      type: 'actionA',
      payload: payload
    })

    expect(store.getState('test').toJS()).toEqual(payload)
  })
})
