var Utils = require('../src/utils')

describe('Utils', () => {
  describe('#isNumber', () => {
    it('correctly identifies number strings as not numbers', () => {
      var result = Utils.isNumber('1')
      expect(result).toBe(false)
    })

    it('correctly identifies integers as numbers', () => {
      var result = Utils.isNumber(1)
      expect(result).toBe(true)
    })

    it('correctly identifies floats as numbers', () => {
      var result = Utils.isNumber(1.5)
      expect(result).toBe(true)
    })

    it('correctly identifies NaN as a number', () => {
      var result = Utils.isNumber(NaN)
      expect(result).toBe(true)
    })

    it('correctly identifies number instances as numbers', () => {
      var result = Utils.isNumber(new Number(1))
      expect(result).toBe(true)
    })

    it('correctly identifies scientific notation as a number', () => {
      var result = Utils.isNumber(10e2)
      expect(result).toBe(true)
    })

    it('correctly identifies hexadecimals as numbers', () => {
      var result = Utils.isNumber(0xff)
      expect(result).toBe(true)
    })
  })

  describe('#isString', () => {
    it('correctly identifies a non-string as not a string', () => {
      var result = Utils.isString(1)
      expect(result).toBe(false)
    })

    it('correctly identifies a string as a string', () => {
      var result = Utils.isString('string')
      expect(result).toBe(true)
    })
  })

  describe('#isArray', () => {
    it('correctly identifies a non-array as not an array', () => {
      var result = Utils.isArray(1)
      expect(result).toBe(false)
    })

    it('correctly identifies an array literal as an array', () => {
      var result = Utils.isArray([])
      expect(result).toBe(true)
    })

    it('correctly identifies an array instance as an array', () => {
      var result = Utils.isArray(new Array())
      expect(result).toBe(true)
    })
  })

  describe('#isFunction', () => {
    it('correctly identifies a non-function as not a function', () => {
      var result = Utils.isFunction(1)
      expect(result).toBe(false)
    })

    it('correctly identifies a RegEx as not a function', () => {
      var result = Utils.isFunction(/something/)
      expect(result).toBe(false)
    })

    it('correctly identifies a function decleration as a function', () => {
      var result = Utils.isFunction(()=>{})
      expect(result).toBe(true)
    })

    it('correctly identifies a function expression as a function', () => {
      var testCase = () => {}
      var result = Utils.isFunction(testCase)
      expect(result).toBe(true)
    })

    it('correctly identifies a method as a function', () => {
      var result = Utils.isFunction(Utils.isFunction)
      expect(result).toBe(true)
    })
  })

  describe('#extend', () => {
    it('extends an object with the attributes of another', () => {
      expect(Utils.extend({}, { a: 1 })).toEqual({ a: 1 })
    })

    it('overrides source properties with destination properties', () => {
      expect(Utils.extend({ a: 1 }, { a: 2 }).a).toBe(2)
    })

    it('maintains destination properties not in source', () => {
      expect(Utils.extend({ a: 1 }, { b: 2 }).a).toBeDefined()
    })

    it('can extend from multiple sources', () => {
      var result = Utils.extend({ a: 1 }, { b: 2 }, { c: 3})
      expect(result).toEqual({ a: 1, b: 2, c: 3})
    })

    it('sets property priority from right to left', () => {
      var result = Utils.extend({ a: 1 }, { a: 2, b: 2 }, { b: 3 })
      expect(result).toEqual({ a: 2, b: 3 })
    })

    it('skips over non-plain objects', () => {
      var result = Utils.extend({ a: 1 }, /something/, { b: 2 })
      expect(result).toEqual({ a: 1, b: 2 })
    })

    it('returns an empty object when arguments are not defined', () => {
      expect(Utils.extend()).toEqual({})
    })

    it('returns the original object when only one argument is passed', () => {
      var obj = {}
      expect(Utils.extend(obj)).toBe(obj)
    })

    it('copies all properties from source', () => {
      var obj = { a: 1 }
      obj.b = 2
      expect(Utils.extend({}, obj).a).toBe(1)
      expect(Utils.extend({}, obj).b).toBe(2)
    })

    it('does not extend inherited properties', () => {
      var F = function() {}
      F.prototype = { a: 1 }
      var obj = new F()
      expect(Utils.extend({ a: 10 }).a).toEqual(10)
    })
  })
})
