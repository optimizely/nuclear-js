var React = require('react')
var Nuclear = require('../src/main')
var toImmutable = require('../src/main').toImmutable

var testStore = new Nuclear.Store({
  getInitialState() {
    return toImmutable({
      count: 0,

      map: {
        key1: 'value1',
        multi: 2,
      },
    })
  },

  initialize() {
    this.on('increment', state => {
      var nextCount = state.get('count')
      return state.set('count', ++nextCount)
    })

    this.on('set', (state, payload) => {
      return state.setIn(['map', payload.key], toImmutable(payload.value))
    })
  },
})

describe('reactor.ReactMixin', () => {
  var mountNode
  var reactor
  var countGetter = ['test', 'count']
  var key1Getter = ['test', 'map', 'key1']
  var key2Getter = ['test', 'map', 'key2']
  var multipliedGetter = [
    countGetter,
    ['test', 'map', 'multi'],
    (count, multi) => count * multi,
  ]

  beforeEach(() => {
    reactor = new Nuclear.Reactor({
      debug: true,
    })
    reactor.registerStores({
      test: testStore,
    })
  })


  describe('when rendering a component with the flux.ReactMixin', () => {
    var component
    beforeEach(() => {
      mountNode = document.createElement('div')
      document.body.appendChild(mountNode)
      // var componentWillMountSpy = jasmine.createSpy()
      var Component = React.createClass({
        mixins: [reactor.ReactMixin],

        getDataBindings() {
          return {
            count: countGetter,
            multiplied: multipliedGetter,
            key1: key1Getter,
            key2: key2Getter,
          }
        },

        render() {
          return React.DOM.div(null, '')
        },
      })

      component = React.render(React.createElement(Component, null), mountNode)
    })

    afterEach(() => {
      React.unmountComponentAtNode(mountNode)
      document.body.removeChild(mountNode)
    })

    it('should set the component initialState from `getDataBindings()`', () => {
      expect(component.state.count).toBe(0)
      expect(component.state.multiplied).toBe(0)
      expect(component.state.key1).toBe('value1')
      expect(component.state.key2).toBe(undefined)
    })

    it('should update the state automatically when the underyling getters change', () => {
      reactor.dispatch('increment')

      expect(component.state.count).toBe(1)
      expect(component.state.multiplied).toBe(2)
      expect(component.state.key1).toBe('value1')
      expect(component.state.key2).toBe(undefined)

      reactor.dispatch('set', {
        key: 'key2',
        value: 'value2',
      })

      expect(component.state.count).toBe(1)
      expect(component.state.multiplied).toBe(2)
      expect(component.state.key1).toBe('value1')
      expect(component.state.key2).toBe('value2')
    })
  })

  describe('when rendering a component with a getInitialState() method', () => {
    var component
    beforeEach(() => {
      mountNode = document.createElement('div')
      document.body.appendChild(mountNode)
      // var componentWillMountSpy = jasmine.createSpy()
      var Component = React.createClass({
        mixins: [reactor.ReactMixin],

        getInitialState() {
          return {
            foo: 'bar',
          }
        },

        getDataBindings() {
          return {
            count: countGetter,
            multiplied: multipliedGetter,
            key1: key1Getter,
            key2: key2Getter,
          }
        },

        render() {
          return React.DOM.div(null, '')
        },
      })

      component = React.render(React.createElement(Component, null), mountNode)
    })

    afterEach(() => {
      React.unmountComponentAtNode(mountNode)
      document.body.removeChild(mountNode)
    })

    it('should set the component initialState from `getDataBindings()` and getInitialState', () => {
      expect(component.state.foo).toBe('bar')
      expect(component.state.count).toBe(0)
      expect(component.state.multiplied).toBe(0)
      expect(component.state.key1).toBe('value1')
      expect(component.state.key2).toBe(undefined)
    })
  })

  describe('after unmounting the component', () => {
    beforeEach(() => {
      mountNode = document.createElement('div')
      document.body.appendChild(mountNode)
      // var componentWillMountSpy = jasmine.createSpy()
      var Component = React.createClass({
        mixins: [reactor.ReactMixin],

        getInitialState() {
          return {
            foo: 'bar',
          }
        },

        getDataBindings() {
          return {
            count: countGetter,
            multiplied: multipliedGetter,
            key1: key1Getter,
            key2: key2Getter,
          }
        },

        render() {
          return React.DOM.div(null, '')
        },
      })

      React.render(React.createElement(Component, null), mountNode)
    })

    afterEach(() => {
      document.body.removeChild(mountNode)
    })

    it('should unobserve all getters', () => {
      React.unmountComponentAtNode(mountNode)
      expect(reactor.observerState.get('observersMap').size).toBe(0)
    })
  })
})
