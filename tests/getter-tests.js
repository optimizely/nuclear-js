var Immutable = require('immutable')
var Getter = require('../src/getter')
var evaluate = require('../src/evaluate')

describe('Getter', () => {
  it('should create an Immutable Getter Record with coerced deps', () => {
    var computed = Getter(
      ['dep1', 'dep2.val'],
      (val1, val2) => {
        return val1 + val2;
      }
    )

    var expected = [['dep1'], ['dep2', 'val']]
    expect(Immutable.is(computed.deps, expected))
  })

  it("should properly evaluate", () => {
    var state = Immutable.Map({
      dep1: 1,
      dep2: 2,
    })

    var computed = Getter(
      ['dep1', 'dep2'],
      (val1, val2) => {
        return val1 + val2;
      }
    )

    var result = evaluate(state, computed)

    expect(result).toBe(3)
  })

  describe("recurive getters", () => {
    var getter1
    var getter2

    beforeEach(() => {
      getter1 = Getter(
        ['dep1', 'dep2'],
        (val1, val2) => {
          return val1 + val2;
        }
      )

      getter2 = Getter(
        [getter1, 'multi'],
        (total, multi) => {
          return multi * total
        }
      )
    })

    it("should recursively evaluate", () => {
      var state = Immutable.Map({
        dep1: 1,
        dep2: 2,
        multi: 3,
      })

      var result = evaluate(state, getter2)

      expect(result).toBe(9)
    })

    it('#flattenDeps', () => {
      expect(getter2.flatDeps).toEqual([['dep1'], ['dep2'], ['multi']])
    })
  })
})
