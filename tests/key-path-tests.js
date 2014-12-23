var Immutable = require('immutable')
var KeyPath = require('../src/key-path')
var isKeyPath = KeyPath.isKeyPath

describe('KeyPath', () => {
  describe("isKeyPath", () => {
    it("should return false for primitives", () => {
      expect(isKeyPath(1)).toBe(false)
      expect(isKeyPath('foo')).toBe(false)
      expect(isKeyPath(false)).toBe(false)
      expect(isKeyPath(null)).toBe(false)
    })

    it("should return true for arrays without functions at end", () => {
      expect(isKeyPath([])).toBe(true)
      expect(isKeyPath([1])).toBe(true)
      expect(isKeyPath(['foo'])).toBe(true)
      expect(isKeyPath(['foo', 'bar'])).toBe(true)
      expect(isKeyPath(['foo', 1])).toBe(true)
    })

    it("should return true for array of immutable values", () => {
      var immMap = Immutable.Map({
        foo: 'bar'
      })

      expect(isKeyPath([immMap])).toBe(true)
    })
  })
})
