jest.autoMockOff()

var Immutable = require('immutable')
var Computed = require('../src/computed')

describe('Computed', () => {
  it('should create an Immutable Computed Record with coerced deps', () => {
    var computed = Computed(
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

    var computed = Computed(
      ['dep1', 'dep2'],
      (val1, val2) => {
        return val1 + val2;
      }
    )

    var result = Computed.evaluate(state, computed)

    expect(result).toBe(3)
  })

  describe("recurive getters", () => {
    var getter1
    var getter2

    beforeEach(() => {
      getter1 = Computed(
        ['dep1', 'dep2'],
        (val1, val2) => {
          return val1 + val2;
        }
      )

      getter2 = Computed(
        [getter1, 'multi'],
        (total, multi) => {
          return multi * total
        }
      )
    })

    it.only("should recursively evaluate", () => {
      var state = Immutable.Map({
        dep1: 1,
        dep2: 2,
        multi: 3,
      })

      var result = Computed.evaluate(state, getter2)

      expect(result).toBe(9)
    })

    it('#flattenDeps', () => {
      expect(getter2.flatDeps).toEqual([['dep1'], ['dep2'], ['multi']])
    })
  })
})
