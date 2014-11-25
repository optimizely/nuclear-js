var Immutable = require('immutable')
var Map = require('immutable').Map
var List = require('immutable').List

var Store = require('../src/store');
var Getter = require('../src/getter');
var evaluate = require('../src/evaluate')

describe("Evaluate", function() {
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
    it("['store1', 'foo', 'bar']", () => {
      var getter = ['store1', 'foo', 'bar']
      var result = evaluate(state, getter)
      expect(result).toBe(1)
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

    it("Getter(['bar', 'baz', 'tah', 1]", () => {
      var getter = Getter(['bar', 'baz', 'tah', 1])
      var result = evaluate(state, getter)
      expect(result).toBe(1)
    })
  })

  describe("evaluating getters", () => {
    var dbl = (x => 2*x)

    it("should double - Getter('baz.tah', dbl)", () => {
      var result = evaluate(state, Getter('baz.tah', dbl))
      expect(result).toBe(4)
    })

    it("should double - Getter(['baz','tah'], dbl)", () => {
      var result = evaluate(state, Getter(['baz','tah'], dbl))
      expect(result).toBe(4)
    })

    it("should double - Getter(['store1', 'foo', 'bar'], dbl)", () => {
      var result = evaluate(state, Getter(['store1', 'foo', 'bar'], dbl))
      expect(result).toBe(2)
    })

    it("should compose getters", function() {
      var getter1 = Getter(['baz','tah'], dbl)
      var getter2 = Getter(['store1', 'foo', 'bar'], dbl)

      var composed = Getter(getter1, getter2, (a, b) => a + b)

      var result = evaluate(state, composed)
      expect(result).toBe(6)
    })
  })
})
