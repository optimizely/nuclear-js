jest.autoMockOff()

var Nuclear = require('../src/facade')

describe('reactor#bindActions', () => {
  var reactor
  var actionGroup

  beforeEach(() => {
    reactor = Nuclear.createReactor()
    actionGroup = {
      doit(reactor, id) {
        reactor.dispatch('type', {
          id: id
        })
      }
    }

    reactor.bindActions('group', actionGroup)
  })

  it('should partial every action with the reactor', () => {
    spyOn(reactor, 'dispatch')

    reactor.action('group').doit(123)

    expect(reactor.dispatch).toHaveBeenCalledWith('type', { id: 123 })
  })
})
