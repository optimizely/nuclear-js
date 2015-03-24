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
})
