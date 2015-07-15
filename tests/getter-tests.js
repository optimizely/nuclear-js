var Getter = require('../src/getter')
var isGetter = Getter.isGetter

describe('Getter', () => {
  describe('isGetter', () => {

    it('should return false for primitives', () => {
      expect(isGetter(1)).toBe(false)
      expect(isGetter('foo')).toBe(false)
      expect(isGetter(false)).toBe(false)
      expect(isGetter(null)).toBe(false)
    })

    it('should return true for arrays with a functions at end', () => {
      expect(isGetter([['foo'], (x) => x])).toBe(true)
      expect(isGetter([['foo', 'bar'], (x) => x])).toBe(true)
      expect(isGetter([['foo', 'bar'], ['bar', 'baz'], (a, b) => a + b])).toBe(true)
    })

    it('should return true nested getters', () => {
      var getter1 = [['foo'], (x) => x]
      expect(isGetter([getter1, ['foo'], (a, b) => a + b])).toBe(true)
    })
  })

  describe('fromKeyPath', () => {
    it('should throw an Error for a nonvalid KeyPath', () => {
      var invalidKeypath = 'foo.bar'
      expect(function() {
        Getter.fromKeyPath(invalidKeypath)
      }).toThrow()
    })
  })
})
