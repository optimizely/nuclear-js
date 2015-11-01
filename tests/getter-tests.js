import { isGetter, getFlattenedDeps, fromKeyPath } from '../src/getter'
import { Set, List, is } from 'immutable'

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
        fromKeyPath(invalidKeypath)
      }).toThrow()
    })
  })

  describe('getFlattenedDeps', function() {
    describe('when passed the identity getter', () => {
      it('should return a set with only an empty list', () => {
        var getter = [[], (x) => x]
        var result = getFlattenedDeps(getter)
        var expected = Set().add(List())
        expect(is(result, expected)).toBe(true)
      })
    })

    describe('when passed a flat getter', () => {
      it('return all keypaths', () => {
        var getter = [
          ['store1', 'key1'],
          ['store2', 'key2'],
          (a, b) => 1,
        ]
        var result = getFlattenedDeps(getter)
        var expected = Set()
          .add(List(['store1', 'key1']))
          .add(List(['store2', 'key2']))
        expect(is(result, expected)).toBe(true)
      })
    })

    describe('when passed getter with a getter dependency', () => {
      it('should return flattened keypaths', () => {
        var getter1 = [
          ['store1', 'key1'],
          ['store2', 'key2'],
          (a, b) => 1,
        ]
        var getter2 = [
          getter1,
          ['store3', 'key3'],
          (a, b) => 1,
        ]
        var result = getFlattenedDeps(getter2)
        var expected = Set()
          .add(List(['store1', 'key1']))
          .add(List(['store2', 'key2']))
          .add(List(['store3', 'key3']))
        expect(is(result, expected)).toBe(true)
      })
    })
  })
})
