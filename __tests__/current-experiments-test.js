jest.autoMockOff();

var Flux = require('../src/Flux');
var Store = require('../src/Store');
var through = require('through');
var Immutable = require('immutable');
var CurrentProjectStore = require('./mocks/CurrentProjectStore')
var ExperimentStore = require('./mocks/ExperimentStore')

describe("CurrentProject + Experiments", () => {
  var flux;
  beforeEach(() => {
    flux = new Flux();
    flux.registerStore('Experiment', ExperimentStore)
    flux.registerStore('CurrentProject', CurrentProjectStore)
  })

  describe("changeCurrentProject action", () => {
    it("should change the currentProject store and emit change", () => {
      flux.dispatch('changeCurrentProject', {
        project: {
          id: 1
        }
      });
      expect(flux.getStore('CurrentProject').getState('id')).toBe(1)
    })
  })
})
