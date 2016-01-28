import { isGetter, getFlattenedDeps, fromKeyPath, isGetterObject, Getter, convertToGetterLiteral } from '../src/getter'
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

  describe('#isGetterObject', () => {
    it('should return false for getter literal and primitives', () => {
      expect(isGetterObject(1)).toBe(false)
      expect(isGetterObject('foo')).toBe(false)
      expect(isGetterObject(false)).toBe(false)
      expect(isGetterObject(null)).toBe(false)
      expect(isGetterObject([['foo'], (x) => x])).toBe(false)
      expect(isGetterObject([['foo', 'bar'], (x) => x])).toBe(false)
    })

    it('should return true for Getter instances', () => {
      const getter = Getter(['test'])
      expect(isGetterObject(getter)).toBe(true)
    })
  })

  describe('#convertToGetterLiteral', () => {
    it('should return supplied getter if not a getter object', () => {
      const getter = ['test']
      const getter2 = [['test'], x => x]
      const getterObject = Getter(getter)
      expect(convertToGetterLiteral(getter)).toBe(getter)
      expect(convertToGetterLiteral(getter2)).toBe(getter2)
      expect(convertToGetterLiteral(getterObject)).toBe(getter)
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

  describe('#Getter', () => {
    it('should throw an error if not passed a getter', () => {
      expect(() => { Getter(false) }).toThrow()
    })

    it('should accept a keyPath as a getter argument', () => {
      const keyPath = ['test']
      expect(Getter(keyPath).getter).toBe(keyPath)
    })

    it('should accept a getter as a getter argument', () => {
      const getter = ['test', () => 1]
      expect(Getter(getter).getter).toBe(getter)
    })


    it('should use "default" as the default cache option', () => {
      const getter = ['test']
      const getterObject = Getter(getter, {})
      expect(getterObject.cache).toBe('default')
      const getterObject1 = Getter(getter, { cache: 'fakeOption' })
      expect(getterObject1.cache).toBe('default')
    })

    it('should set "always" and "never" as cache options', () => {
      const getter = ['test']
      const getterObject = Getter(getter, { cache: 'never' })
      expect(getterObject.cache).toBe('never')
      const getterObject1 = Getter(getter, { cache: 'always' })
      expect(getterObject1.cache).toBe('always')
    })

    it('should default cacheKey to null', () => {
      const getter = ['test']
      const getterObject = Getter(getter, {})
      expect(getterObject.cacheKey).toBe(null)
    })

    it('should set cacheKey to supplied value', () => {
      const getter = ['test']
      const getterObject = Getter(getter, { cacheKey: getter })
      expect(getterObject.cacheKey).toBe(getter)
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
