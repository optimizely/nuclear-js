jest.autoMockOff()

var Immutable = require('immutable')
var Map = require('immutable').Map

var Store = require('../src/store');
var Reactor = require('../src/reactor');
var evaluate = require('../src/evaluate')

var store1 = Store({
  getInitialState() {
    return {}
  },

  getDoubleValue() {
    return this.get('foo.bar') * 2
  }
})

var reactor = Reactor({
  stores: {
    store1: store1
  }
})

describe("#get", function() {
  var state = Immutable.fromJS({
    store1: {
      foo: {
        bar: 1,
      }
    },

    baz: {
      tah: 2
    },

    bar: {
      baz: {
        tah: [0, 1, 2]
      }
    }
  })

  it('null - should return whole state', () => {
    var result = evaluate(state, null)

    expect(Immutable.is(result, state)).toBe(true)
  })

  it('undefined - should return whole state', () => {
    var result = evaluate(state, undefined)

    expect(Immutable.is(result, state)).toBe(true)
  })

  it('false - should return whole state', () => {
    var result = evaluate(state, false)

    expect(Immutable.is(result, state)).toBe(true)
  })

  it('0 - return undefined', () => {
    var result = evaluate(state, 0)
    expect(result).toBe(undefined)
  })

  describe("Non computed tests", () => {
    it("[store1, 'foo', 'bar']", () => {
      var getter = [store1, 'foo', 'bar']
      var result = evaluate(state, getter)
      expect(result).toBe(1)
    })

    it("[store1]", () => {
      var getter = [store1]
      var result = evaluate(state, getter)
      expect(result).toBe(store1)
    })

    it("['baz', 'tah']", () => {
      var getter = ['baz', 'tah']
      var result = evaluate(state, getter)
      expect(result).toBe(2)
    })

    it("['bar', 'baz', 'tah']", () => {
      var getter = ['bar', 'baz', 'tah']
      var result = evaluate(state, getter)
      var expected = List([0, 1, 2])

      expect(Immutable.is(result, expected)).toBe(true)
    })

    it("['bar', 'baz', 'tah', 1]", () => {
      var getter = ['bar', 'baz', 'tah', 1]
      var result = evaluate(state, getter)
      expect(result).toBe(1)
    })
  })

  describe("computed tests", () => {
    var dbl = (x => 2*x)

    it("should double - ['baz', 'tah', dbl]", () => {
      var result = evaluate(state, ['baz.tah', dbl])
      expect(result).toBe(4)
    })

    it("should double - [['baz','tah'], dbl]", () => {
      var result = evaluate(state, [['baz','tah'], dbl])
      expect(result).toBe(4)
    })

    it("should double - [[store1, 'foo', 'bar'], dbl]", () => {
      var getter = [store1, 'foo', 'bar', dbl]
      var result = evaluate(state, getter)
      expect(result).toBe(2)
    })

    it("should compose computeds", function() {
      var computed1 = ['baz.tah', dbl]
      var computed2 = [store1, 'foo', 'bar', dbl]

      var composed = [computed1, computed2, (a, b) => a + b]

      var result = evaluate(state, composed)
      expect(result).toBe(6)
    })
  })
})


