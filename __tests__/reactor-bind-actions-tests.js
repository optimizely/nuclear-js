jest.autoMockOff()

var Nuclear = require('../src/main')

describe('reactor#bindActions', () => {
  var reactor

  beforeEach(() => {
    var actionGroup = {
      doit(reactor, id) {
        reactor.dispatch('type', {
          id: id
        })
      }
    }

    reactor = Nuclear.Reactor({
      state: {},
      actions: {
        'group': actionGroup
      }
    })
  })

  it('should partial every action with the reactor', () => {
    spyOn(reactor, 'dispatch')

    reactor.actions('group').doit(123)

    expect(reactor.dispatch).toHaveBeenCalledWith('type', { id: 123 })
  })
})
