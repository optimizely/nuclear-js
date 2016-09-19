import Immutable, { Map } from 'immutable'
import { LRUCache } from '../src/reactor/cache'


describe('Cache', () => {
  describe('LRUCache', () => {
    var cache

    beforeEach(() => {
      jasmine.addCustomEqualityTester(Immutable.is)
    })

    it('should evict least recently used', () => {
      cache = new LRUCache(3)

      expect(cache.asMap().isEmpty()).toBe(true)

      var a = {foo: 'bar'}
      var b = {bar: 'baz'}
      var c = {baz: 'foo'}

      cache = cache.miss('a', a)

      expect(cache.asMap()).toEqual(Map({a: a}))
      expect(cache.has('a')).toBe(true)
      expect(cache.lookup('a')).toBe(a)

      cache = cache.miss('b', b)
      expect(cache.asMap()).toEqual(Map({a: a, b: b}))
      expect(cache.has('b')).toBe(true)
      expect(cache.lookup('b')).toBe(b)

      cache = cache.miss('c', c)
      expect(cache.asMap()).toEqual(Map({a: a, b: b, c: c}))
      expect(cache.has('c')).toBe(true)
      expect(cache.lookup('c')).toBe(c)

      expect(cache.has('d')).toBe(false)
      expect(cache.lookup('d')).not.toBeDefined()

      var notFound = {found: false}
      expect(cache.lookup('d', notFound)).toBe(notFound)

      cache = cache.miss('d', 4)

      expect(cache.asMap()).toEqual(Map({b: b, c: c, d: 4}), 'a should have been evicted')

      cache = cache.hit('b') // Touch b so its not LRU

      expect(cache.asMap()).toEqual(Map({b: b, c: c, d: 4}), 'should not have have changed')

      cache = cache.miss('e', 5)

      expect(cache.asMap()).toEqual(Map({b: b, d: 4, e: 5}), 'should have changed')

      cache = cache.hit('b')
      .hit('e')
      .hit('d')
      .miss('a', 1)

      expect(cache.asMap()).toEqual(Map({a: 1, d: 4, e: 5}), 'should have changed')
    })

    it('should maintain LRU after manual evict', () => {
      cache = new LRUCache(3)
      .miss('a', 'A')
      .miss('b', 'B')
      .miss('c', 'C')

      expect(cache.asMap()).toEqual(Map({a: 'A', b: 'B', c: 'C'}))

      cache = cache.evict('a')
      expect(cache.asMap()).toEqual(Map({b: 'B', c: 'C'}))

      cache = cache.miss('d', 'D')
      expect(cache.asMap()).toEqual(Map({b: 'B', c: 'C', d: 'D'}))
    })

    it('should not evict if under limit', () => {
      cache = new LRUCache(2)
      .miss('a', 1)
      .miss('b', 2)
      .miss('b', 3)

      expect(cache.asMap()).toEqual(Map({a: 1, b: 3}))
      cache = cache.miss('a', 4)
      expect(cache.asMap()).toEqual(Map({a: 4, b: 3}))

      cache = new LRUCache(3)
      .miss('a', 1)
      .miss('b', 2)
      .miss('b', 3)
      .miss('c', 4)
      .miss('d', 5)
      .miss('e', 6)

      expect(cache.asMap()).toEqual(Map({e: 6, d: 5, c: 4}))
    })

    it('should not evict if hitting unknown items', () => {
      cache = new LRUCache(2)
      .hit('x')
      .hit('y')
      .hit('z')
      .miss('a', 1)
      .miss('b', 2)
      .miss('c', 3)
      .miss('d', 4)
      .miss('e', 5)

      expect(cache.asMap()).toEqual(Map({d: 4, e: 5}))

      cache = new LRUCache(2)
      .hit('x')
      .hit('y')
      .miss('a', 1)
      .miss('b', 2)
      .miss('y', 3)
      .miss('x', 4)
      .miss('e', 5)

      expect(cache.asMap()).toEqual(Map({x: 4, e: 5}))
    })

    it('should be able to evict multiple LRU items at once', () => {
      cache = new LRUCache(4, 2)
      .miss('a', 1)
      .miss('b', 2)
      .miss('c', 3)
      .miss('d', 4)
      .miss('e', 5)

      expect(cache.asMap()).toEqual(Map({c: 3, d: 4, e: 5}))
      expect(cache.miss('f', 6).asMap()).toEqual(Map({c: 3, d: 4, e: 5, f: 6}))
      expect(cache.miss('f', 6).miss('g', 7).asMap()).toEqual(Map({e: 5, f: 6, g: 7}))
    })
  })
})
