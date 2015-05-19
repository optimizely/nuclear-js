var Immutable = require('immutable')
var immutableHelpers = require('../src/immutable-helpers')
var isImmutableValue = immutableHelpers.isImmutableValue

describe('Immutable Helpers', () => {
  describe('isImmutableValue', () => {
    it('should return true for ImmutableJS data structures', () => {
      expect(isImmutableValue(Immutable.Map({}))).toBe(true)
      expect(isImmutableValue(Immutable.List([]))).toBe(true)
    })

    it('should return true for immutable JS values', () => {
      expect(isImmutableValue('')).toBe(true)
      expect(isImmutableValue('hey')).toBe(true)
      expect(isImmutableValue(123)).toBe(true)
    })
  })
})
