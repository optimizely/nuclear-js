jest.autoMockOff()

var Nuclear = require('../src/facade')

describe('reactor#bindActions', () => {
  var reactor
  var actionGroup

  beforeEach(() => {
    reactor = Nuclear.createReactor()
    actionGroup = {
      doit(reactor, id) {
        reactor.cycle({
          type: 'type',
          payload: {
            id: id
          }
        })
      }
    }

    reactor.bindActions('group', actionGroup)
  })

  it('should partial every action with the reactor', () => {
    spyOn(reactor, 'cycle')

    reactor.action('group').doit(123)

    expect(reactor.cycle).toHaveBeenCalledWith({
      type: 'type',
      payload: {
        id: 123
      }
    })
  })
})
