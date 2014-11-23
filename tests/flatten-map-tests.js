jest.autoMockOff()

var Immutable = require('immutable')
var Map = require('immutable').Map
var List = require('immutable').List

var flattenMap = require('../src/flatten-map')

describe('flattenMap', () => {
  it('should flatten a shallow map', () => {
    var testMap = {
      key1: 1,
      key2: 2,
      key3: 3,
    }

    var result = flattenMap(testMap, function(val) {
      return (typeof val !== 'object')
    })
    var expected = Map([
      [List(['key1']), 1],
      [List(['key2']), 2],
      [List(['key3']), 3],
    ])

    expect(Immutable.is(result, expected)).toBe(true)
  })

  it('should return an empty map', () => {
    var testMap = {}

    var result = flattenMap(testMap, function(val) {
      return (typeof val !== 'object')
    })
    var expected = Map()

    expect(Immutable.is(result, expected)).toBe(true)
  })

  it('should flatten a deep map', () => {
    var testMap = {
      lev1: {
        lev2: {
          lev3Key: 3
        },
        lev2Key: 2
      }
    }

    var result = flattenMap(testMap, function(val) {
      return (typeof val !== 'object')
    })
    var expected = Map([
      [List(['lev1', 'lev2', 'lev3Key']), 3],
      [List(['lev1', 'lev2Key']), 2],
    ])

    expect(Immutable.is(result, expected)).toBe(true)
  })
})
