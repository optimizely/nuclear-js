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
})
