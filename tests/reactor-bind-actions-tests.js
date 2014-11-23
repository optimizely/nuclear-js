var Nuclear = require('../src/main')

describe('Reactor - bindActions', () => {
  var reactor
  var actionGroup

  beforeEach(() => {
    reactor = Nuclear.Reactor({
      state: {},
    })

    actionGroup = reactor.bindActions({
      doit(reactor, id) {
        reactor.dispatch('type', {
          id: id
        })
      }
    })

  })

  it('should partial every action with the reactor', () => {
    spyOn(reactor, 'dispatch')

    actionGroup.doit(123)

    expect(reactor.dispatch.calls.argsFor(0)).toEqual(['type', { id: 123 }])
  })
})
