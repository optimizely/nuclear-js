jest.autoMockOff()

var Immutable = require('immutable')
var Getter = require('../src/getter')
//var GetterRecord = require('../src/getter').GetterRecord

describe('Getters', () => {
  it('should create an Immutable GetterRecord with coerced deps', () => {
    var getter = Getter({
      deps: ['dep1', 'dep2.val'],
      compute(val1, val2) {
        return val1 + val2;
      }
    })

    var expected = [['dep1'], ['dep2', 'val']]
    expect(Immutable.is(getter.deps, expected))
  })

  it("should properly evaluate", () => {
    var state = Immutable.Map({
      dep1: 1,
      dep2: 2,
    })

    var getter = Getter({
      deps: ['dep1', 'dep2'],
      compute(val1, val2) {
        return val1 + val2;
      }
    })

    var result = getter.evaluate(state)

    expect(result).toBe(3)
  })

  it("should recursively evaluate", () => {
    var state = Immutable.Map({
      dep1: 1,
      dep2: 2,
      multi: 3,
    })

    var getter1 = Getter({
      deps: ['dep1', 'dep2'],
      compute(val1, val2) {
        return val1 + val2;
      }
    })

    var getter2 = Getter({
      deps: [getter1, 'multi'],
      compute(total, multi) {
        return multi * total
      }
    })

    var result = getter2.evaluate(state)

    expect(result).toBe(9)
  })
})
