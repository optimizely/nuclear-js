var React = require('react')
var Nuclear = require('../src/main')
var toImmutable = require('../src/main').toImmutable
var NuclearReactMixin = require('../src/addons/react-mixin')
var provideReactor = require('../src/addons/provide-reactor')

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

describe('Addons', () => {
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


  describe('when rendering a component with the NuclearReactMixin', () => {
    var component
    beforeEach(() => {
      mountNode = document.createElement('div')
      document.body.appendChild(mountNode)
      var Component = React.createClass({
        mixins: [NuclearReactMixin],

        getDataBindings() {
          return {
            count: countGetter,
            multiplied: multipliedGetter,
            key1: key1Getter,
            key2: key2Getter,
          }
        },

        render() {
          return React.DOM.div(null, JSON.stringify(this.state))
        },
      })

      Component = provideReactor(Component)

      component = React.render(React.createElement(Component, {reactor: reactor}), mountNode)
    })

    afterEach(() => {
      React.unmountComponentAtNode(mountNode)
      document.body.removeChild(mountNode)
    })

    it('should set the component initialState from `getDataBindings()`', () => {
      var state = JSON.parse(component.getDOMNode().innerHTML)
      expect(state.count).toBe(0)
      expect(state.multiplied).toBe(0)
      expect(state.key1).toBe('value1')
      expect(state.key2).toBe(undefined)
    })

    it('should update the state automatically when the underyling getters change', () => {
      reactor.dispatch('increment')

      var state = JSON.parse(component.getDOMNode().innerHTML)
      expect(state.count).toBe(1)
      expect(state.multiplied).toBe(2)
      expect(state.key1).toBe('value1')
      expect(state.key2).toBe(undefined)

      reactor.dispatch('set', {
        key: 'key2',
        value: 'value2',
      })

      state = JSON.parse(component.getDOMNode().innerHTML)

      expect(state.count).toBe(1)
      expect(state.multiplied).toBe(2)
      expect(state.key1).toBe('value1')
      expect(state.key2).toBe('value2')
    })
  })

  describe('when rendering a component with a getInitialState() method', () => {
    var component
    beforeEach(() => {
      mountNode = document.createElement('div')
      document.body.appendChild(mountNode)
      var Component = React.createClass({
        mixins: [NuclearReactMixin],

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
          return React.DOM.div(null, JSON.stringify(this.state))
        },
      })

      Component = provideReactor(Component)

      component = React.render(React.createElement(Component, {reactor: reactor}), mountNode)
    })

    afterEach(() => {
      React.unmountComponentAtNode(mountNode)
      document.body.removeChild(mountNode)
    })

    it('should set the component initialState from `getDataBindings()` and getInitialState', () => {
      var state = JSON.parse(component.getDOMNode().innerHTML)
      expect(state.foo).toBe('bar')
      expect(state.count).toBe(0)
      expect(state.multiplied).toBe(0)
      expect(state.key1).toBe('value1')
      expect(state.key2).toBe(undefined)
    })
  })

  describe('after unmounting the component', () => {
    beforeEach(() => {
      mountNode = document.createElement('div')
      document.body.appendChild(mountNode)
      var Component = React.createClass({
        mixins: [NuclearReactMixin],

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

      Component = provideReactor(Component)

      React.render(React.createElement(Component, {reactor: reactor}), mountNode)
    })

    afterEach(() => {
      document.body.removeChild(mountNode)
    })

    it('should unobserve all getters', () => {
      React.unmountComponentAtNode(mountNode)
      expect(reactor.__changeObserver.__observers.length).toBe(0)
    })
  })

  describe('provideReactor', () => {
    it('should not throw if no getDataBindings', () => {
      mountNode = document.createElement('div')
      document.body.appendChild(mountNode)

      var Component = React.createClass({
        mixins: [NuclearReactMixin],

        render() {
          return React.DOM.div(null, '')
        },
      })

      Component = provideReactor(Component)

      React.render(React.createElement(Component, {
        reactor: reactor,
      }), mountNode)

      document.body.removeChild(mountNode)
    })

    it('should allow passing additional context types', () => {
      mountNode = document.createElement('div')
      document.body.appendChild(mountNode)

      var Component = React.createClass({
        contextTypes: {
          foo: React.PropTypes.string,
        },

        render() {
          return React.DOM.div(null, this.context.foo)
        },
      })

      Component = provideReactor(Component, {
        foo: React.PropTypes.string,
      })

      var component = React.render(React.createElement(Component, {
        reactor: reactor,
        foo: 'bar',
      }), mountNode)

      expect(component.getDOMNode().innerHTML).toBe('bar')

      document.body.removeChild(mountNode)
    })
  })
})
