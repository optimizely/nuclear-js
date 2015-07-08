var Utils = require('../src/utils')

describe('Utils', () => {
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
      var result = Utils.isArray([])
      expect(result).toBe(true)
    })

    describe('when isArray is not defined', function() {
      var originalIsArray

      beforeEach(() => {
        originalIsArray = Array.isArray
        Array.isArray = undefined
      })

      afterEach(() => {
        Array.isArray = originalIsArray
      })

      it('correctly identifies a non-array as not an array', () => {
        var result = Utils.isArray(1)
        expect(result).toBe(false)
      })

      it('correctly identifies an array literal as an array', () => {
        var result = Utils.isArray([])
        expect(result).toBe(true)
      })

      it('correctly identifies an array instance as an array', () => {
        var result = Utils.isArray([])
        expect(result).toBe(true)
      })
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
      var result = Utils.isFunction(() => {})
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

  describe('#isObject', () => {
    it('identifies an array as an Object type', () => {
      expect(Utils.isObject([])).toBe(true)
    })

    it('identifies an object literal as an Object type', () => {
      expect(Utils.isObject({})).toBe(true)
    })

    it('identifies the arguments object as an Object type', () => {
      expect(Utils.isObject(arguments)).toBe(true)
    })

    it('identifies a function as an Object type', () => {
      expect(Utils.isObject(() => {})).toBe(true)
    })

    it('identifies a regex as an Object type', () => {
      expect(Utils.isObject(/something/)).toBe(true)
    })

    it('identifies primitives and non-objects as not of type Object', () => {
      expect(Utils.isObject(1)).not.toBe(true)
      expect(Utils.isObject('something')).not.toBe(true)
      expect(Utils.isObject(false)).not.toBe(true)
      expect(Utils.isObject(undefined)).not.toBe(true)
      expect(Utils.isObject(null)).not.toBe(true)
    })

    it('identifies instances as Object types', () => {
      /* eslint-disable no-new-wrappers */
      expect(Utils.isObject(new Number(0))).toBe(true)
      expect(Utils.isObject(new String(''))).toBe(true)
      expect(Utils.isObject(new Boolean(''))).toBe(true)
      /* eslint-enable no-new-wrappers */
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
      expect(Utils.extend({ a: 10 }, F).a).toEqual(10)
    })
  })

  describe('#clone', () => {
    it('clones a simple array', () => {
      var arr = [1, 2, 3]
      var result = Utils.clone(arr)
      expect(result).toEqual(arr)
    })

    it('clones object literals', () => {
      var obj = { a: 1, b: 2, c: 3 }
      var result = Utils.clone(obj)
      expect(result).toEqual(obj)
    })

    it('does not share shallow attributes between objects', () => {
      var obj = { a: 1 }
      var result = Utils.clone(obj)
      result.a = 10
      expect(obj.a === 1 && result.a === 10).toBe(true)
    })

    it('shares changes to deep attributes between objects', () => {
      var obj = { a: 1, b: 2, c: [1, 2, 3] }
      var result = Utils.clone(obj)
      result.c.push(4)
      expect(obj.c[obj.c.length - 1]).toBe(4)
    })

    it('does not clone non objects', () => {
      expect(Utils.clone(1)).toBe(1)
      expect(Utils.clone(undefined)).toBe(undefined)
      expect(Utils.clone('some string')).toBe('some string')
      expect(Utils.clone(null)).toBe(null)
      expect(Utils.clone(true)).toBe(true)
    })
  })

  describe('#each', () => {
    var once = ['once']

    describe('when iterating over an array', () => {
      var arr = [1, 2, 3]

      it('provides the value and iteration count to the iteratee', () => {
        var values = []
        var counts = []
        Utils.each(arr, (val, i) => {
          values.push(val)
          counts.push(++i)
        })
        expect(values).toEqual(arr)
        expect(counts).toEqual(arr)
      })

      it('accepts the context for the iteratee', () => {
        var obj = { add: 5 }
        var result = 0
        Utils.each(arr, function(val, i) {
          result += this.add
        }, obj)
        expect(result).toBe(15)
      })

      it('provides the collection to the iteratee', () => {
        Utils.each(once, (val, i, collection) => {
          expect(collection).toBe(once)
        })
      })

      it('iterates the length of the collection', () => {
        var spy = jasmine.createSpy('eachSpy')
        Utils.each(arr, (val, i) => spy())
        expect(spy.calls.count()).toBe(arr.length)
      })

      it('breaks out of iteration when `false` is returned', () => {
        var spy = jasmine.createSpy('eachSpy')

        Utils.each(arr, (val, i) => {
          spy(val)
          if (val === 2) {
            return false
          }
        })

        expect(spy.calls.count()).toBe(2)
        expect(spy).toHaveBeenCalledWith(1)
        expect(spy).toHaveBeenCalledWith(2)
        expect(spy).not.toHaveBeenCalledWith(3)
      })
    })

    describe('when iterating over an object', () => {
      var values = []
      var keys = []

      var ObjProto = {
        c: 3,
      }

      var obj = Object.create(ObjProto)
      obj.a = 1
      obj.b = 2

      Utils.each(obj, (v, k) => {
        values.push(v)
        keys.push(k)
      })

      it('provides the value and key to the iteratee', () => {
        expect(values).toEqual([1, 2])
        expect(keys).toEqual(['a', 'b'])
      })

      it('does not iterate over the inherited properites', () => {
        expect(values).not.toContain(3)
      })

      it('breaks out of iteration when `false` is returned', () => {
        var spy = jasmine.createSpy('eachSpy')

        Utils.each(obj, (val, i) => {
          spy(val)
          if (val === 1) {
            return false
          }
        })

        expect(spy.calls.count()).toBe(1)
        expect(spy).toHaveBeenCalledWith(1)
        expect(spy).not.toHaveBeenCalledWith(4)
      })
    })

    it('is resiliant to collection property changes during iteration', () => {
      var changingObj = { 0: 0, 1: 1 }
      var count = 0
      Utils.each(changingObj, (v, k, collection) => {
        if (count < 10) {
          changingObj[++count] = v + 1
        }
      })
      expect(count).toBe(2)
      expect(changingObj).toEqual({ 0: 0, 1: 1, 2: 2 })
    })

    it('is resiliant to collection length changes during iteration', () => {
      var result = []
      var count = 0
      Utils.each(once, (v, i) => {
        if (count < 10) {
          result.push(++count)
        }
      })
      expect(count).toBe(1)
      expect(result).toEqual([1])
    })

    it('exits iteration when false is explicitly returned', () => {
      var result = 0
      Utils.each([1, 2], (v, i) => {
        if (i > 0) {
          return false
        }
        result += v
      })
      expect(result).toBe(1)
    })

    it('returns the collection', () => {
      expect(Utils.each(once, () => {})).toBe(once)
    })
  })

  describe('#partial', () => {
    it('partially applies function arguments', () => {
      var func = (greeting, name) => greeting + ' ' + name
      var result = Utils.partial(func, 'hello')
      expect(result('nuclear')).toBe('hello nuclear')
    })

    it('does not alter context', () => {
      var obj = { name: 'nuclear' }
      var func = function(greeting, mark) {
        return greeting + ' ' + this.name + mark
      }
      obj.greet = Utils.partial(func, 'hello')
      expect(obj.greet('!')).toBe('hello nuclear!')
    })
  })
})
