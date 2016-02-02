import { List, Map, OrderedSet, Record } from 'immutable'

export const CacheEntry = Record({
  value: null,
  storeStates: Map(),
  dispatchId: null,
})

/*******************************************************************************
 * interface PersistentCache {
 *    has(item)
 *    lookup(item, notFoundValue)
 *    hit(item)
 *    miss(item, entry)
 *    evict(item)
 *    asMap()
 * }
 *******************************************************************************/

/**
 * Plain map-based cache
 */
export class BasicCache {

  /**
   * @param {Immutable.Map} cache
   */
  constructor(cache = Map()) {
    this.cache = cache;
  }

  /**
   * Retrieve the associated value, if it exists in this cache, otherwise
   * returns notFoundValue (or undefined if not provided)
   * @param {Object} item
   * @param {Object?} notFoundValue
   * @return {CacheEntry?}
   */
  lookup(item, notFoundValue) {
    return this.cache.get(item, notFoundValue)
  }

  /**
   * Checks if this cache contains an associated value
   * @param {Object} item
   * @return {boolean}
   */
  has(item) {
    return this.cache.has(item)
  }

  /**
   * Return cached items as map
   * @return {Immutable.Map}
   */
  asMap() {
    return this.cache
  }

  /**
   * Updates this cache when it is determined to contain the associated value
   * @param {Object} item
   * @return {BasicCache}
   */
  hit(item) {
    return this;
  }

  /**
   * Updates this cache when it is determined to **not** contain the associated value
   * @param {Object} item
   * @param {CacheEntry} entry
   * @return {BasicCache}
   */
  miss(item, entry) {
    return new BasicCache(
      this.cache.update(item, existingEntry => {
        if (existingEntry && existingEntry.dispatchId > entry.dispatchId) {
          throw new Error("Refusing to cache older value")
        }
        return entry
      })
    )
  }

  /**
   * Removes entry from cache
   * @param {Object} item
   * @return {BasicCache}
   */
  evict(item) {
    return new BasicCache(this.cache.remove(item))
  }
}

/**
 * Implements caching strategy that evicts least-recently-used items in cache
 * when an item is being added to a cache that has reached a configured size
 * limit.
 */
export class LRUCache {

  constructor(limit = 1000, cache = new BasicCache(), lru = OrderedSet()) {
    this.limit = limit;
    this.cache = cache;
    this.lru = lru;
  }

  /**
   * Retrieve the associated value, if it exists in this cache, otherwise
   * returns notFoundValue (or undefined if not provided)
   * @param {Object} item
   * @param {Object?} notFoundValue
   * @return {CacheEntry}
   */
  lookup(item, notFoundValue) {
    return this.cache.lookup(item, notFoundValue)
  }

  /**
   * Checks if this cache contains an associated value
   * @param {Object} item
   * @return {boolean}
   */
  has(item) {
    return this.cache.has(item)
  }

  /**
   * Return cached items as map
   * @return {Immutable.Map}
   */
  asMap() {
    return this.cache.asMap()
  }

  /**
   * Updates this cache when it is determined to contain the associated value
   * @param {Object} item
   * @return {LRUCache}
   */
  hit(item) {
    if (!this.cache.has(item)) {
      return this;
    }

    // remove it first to reorder in lru OrderedSet
    return new LRUCache(this.limit, this.cache, this.lru.remove(item).add(item))
  }

  /**
   * Updates this cache when it is determined to **not** contain the associated value
   * If cache has reached size limit, the LRU item is evicted.
   * @param {Object} item
   * @param {CacheEntry} entry
   * @return {LRUCache}
   */
  miss(item, entry) {
    if (this.lru.size >= this.limit) {
      // TODO add options to clear multiple items at once
      const evictItem = this.has(item) ? item : this.lru.first()

      return new LRUCache(
        this.limit,
        this.cache.evict(evictItem).miss(item, entry),
        this.lru.remove(evictItem).add(item)
      )
    } else {
      return new LRUCache(
        this.limit,
        this.cache.miss(item, entry),
        this.lru.add(item)
      )
    }
  }

  /**
   * Removes entry from cache
   * @param {Object} item
   * @return {LRUCache}
   */
  evict(item) {
    if (!this.cache.has(item)) {
      return this;
    }

    return new LRUCache(
      this.limit,
      this.cache.evict(item),
      this.lru.remove(item)
    )
  }
}

/**
 * Returns default cache strategy
 * @return {BasicCache}
 */
export function DefaultCache() {
  return new BasicCache()
}
