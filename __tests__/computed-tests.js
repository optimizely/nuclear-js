jest.autoMockOff()

var Immutable = require('immutable')

var calculateComputed = require('../src/calculate-computed')
var Getter = require('../src/getter')

describe('calculating a computed', () => {
  var computeMock
  var simpleGetter
  var simpleState
  var blankState = Immutable.Map({})

  beforeEach(() => {
    computeMock = jest.genMockFn()

    simpleGetter = Getter({
      deps: ['val1', 'val2'],
      compute(val1, val2) {
        computeMock()

        return val1 + val2
      }
    })

    simpleState = Immutable.Map({
      val1: 1,
      val2: 2,
    })
  })

  it('should calculate when the inital values are undefined', () => {
    var keyPath = ['total']

    var newState = calculateComputed(blankState, simpleState, keyPath, simpleGetter)

    expect(newState.get('total')).toBe(3)
  })

  it('should not recompute if the dep values dont change', () => {
    var sameState = Immutable.Map({
      val1: 1,
      val2: 2,
    })

    var keyPath = ['total']

    var newState = calculateComputed(simpleState, sameState, keyPath, simpleGetter)

    expect(computeMock.mock.calls.length).toBe(0)
  })

  it('should recompute when the value of the deps change', () => {
    var updatedState = Immutable.Map({
      val1: 2,
      val2: 2,
    })

    var keyPath = ['total']

    var newState = calculateComputed(simpleState, updatedState, keyPath, simpleGetter)

    expect(newState.get('total')).toBe(4)
    expect(computeMock.mock.calls.length).toBe(1)
  })
})
