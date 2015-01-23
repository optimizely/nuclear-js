var Immutable = require('immutable')
var Evaluator = require('../src/evaluator')
var toImmutable = require('../src/immutable-helpers').toImmutable
var Map = require('immutable').Map

describe('Evaluator', () => {
  var evaluator

  beforeEach(() => {
    if (!evaluator) {
      evaluator = new Evaluator()
    }
  })

  describe("evaluating a keyPath", () => {
    var state = toImmutable({
      top: 123,
      foo: {
        bar: 'baz'
      },
      arr: ['zero', 'one']
    })

    it("return entire map when passed `[]`", () => {
      var result = evaluator.evaluate(state, [])
      expect(Immutable.is(state, result)).toBe(true)
    })

    it("['top']", () => {
      var result = evaluator.evaluate(state, ['top'])
      expect(result).toBe(123)
    })

    it("['foo', 'bar']", () => {
      var result = evaluator.evaluate(state, ['foo', 'bar'])
      expect(result).toBe('baz')
    })

    it("['foo']", () => {
      var result = evaluator.evaluate(state, ['foo'])
      var expected = toImmutable({ bar: 'baz' })
      expect(Immutable.is(result, expected)).toBe(true)
    })

    it("['arr', 0]", () => {
      var result = evaluator.evaluate(state, ['arr', 0])
      expect(result).toBe('zero')
    })

    it("['baz'] => undefined", () => {
      var result = evaluator.evaluate(state, ['baz'])
      expect(result).toBe(undefined)
    })

    it("['crazy', 'keypath'] => undefined", () => {
      var result = evaluator.evaluate(state, ['baz'])
      expect(result).toBe(undefined)
    })
  })

  describe("evaluating a Getter", () => {
    var proj1 = toImmutable({ id: 1, description: 'proj 1' })
    var proj2 = toImmutable({ id: 2, description: 'proj 2' })
    var proj3 = toImmutable({ id: 3, description: 'proj 3' })

    var projects = Immutable.Map([
      [1, proj1],
      [2, proj2],
      [3, proj3],
    ])

    var state = toImmutable({
      projects: projects,
      session: {
        currentProjectId: 1
      },
    })
    var currentProjectGetter
    var currentProjectSpy

    var currentProjectDescriptionGetter
    var currentProjectDescriptionSpy

    beforeEach(() => {
      currentProjectSpy = jasmine.createSpy('currentProject')
      currentProjectDescriptionSpy = jasmine.createSpy('currentProjectDescription')

      currentProjectGetter = [
        ['projects'],
        ['session', 'currentProjectId'],
        (projects, currentProjectId) => {
          currentProjectSpy()
          return projects.get(currentProjectId)
        }
      ]
      currentProjectDescriptionGetter = [
        currentProjectGetter,
        (project) => {
          currentProjectDescriptionSpy()
          return project.get('description')
        }
      ]
    })

    it("should evaluate", () => {
      var result = evaluator.evaluate(state, currentProjectGetter)
      expect(Immutable.is(result, proj1)).toBe(true)
    })

    it("should cache the value", () => {
      var result1 = evaluator.evaluate(state, currentProjectGetter, true)
      var result2 = evaluator.evaluate(state, currentProjectGetter, true)
      expect(currentProjectSpy.calls.count()).toBe(1)
    })

    it("should only evaluate the getter if its underlying args change", () => {
      var result1 = evaluator.evaluate(state, currentProjectDescriptionGetter, true)

      var newState = state.updateIn(['projects', 2], project => {
        return project.set('description', 'new desc')
      })
      var result2 = evaluator.evaluate(newState, currentProjectDescriptionGetter, true)
      expect(currentProjectSpy.calls.count()).toBe(2)
      expect(currentProjectDescriptionSpy.calls.count()).toBe(1)
    })
  })
})
