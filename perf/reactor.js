var Reactor = Nuclear.Reactor
var Store = Nuclear.Store
var toImmutable = Nuclear.toImmutable
var Immutable = Nuclear.Immutable
var Map = Nuclear.Immutable.Map

function pausecomp(millis) {
  var date = new Date();
  var curDate = null;
  do { curDate = new Date(); }
  while(curDate-date < millis);
}

function dotimes(times, fn) {
  for (var i = 0; i < times; i++) {
    fn(i)
  }
}

describe('Reactor', () => {
  //describe('registering stores', () => {
    //function registerStores(count) {
      //var reactor = new Reactor()

      //var storeMap = {}

      //for (var i = 0; i < count; i++) {
        //storeMap['store' + i] = new Store({
          //getInitialState: function() {
            //return toImmutable({
              //foo: 'bar',
            //})
          //},
        //})
      //}

      //reactor.registerStores(storeMap)
    //}

    //it('1 store', () => {
      //registerStores(1)
    //})

    //it('10 store', () => {
      //registerStores(10)
    //})

    //it('100 stores', () => {
      //registerStores(100)
    //})
  //})

  //describe('dispatching action', () => {
    //describe('1 store', () => {
      //var reactor

      //beforeEach(() => {
        //reactor = new Reactor()

        //reactor.registerStores({
          //store1: new Store({
            //getInitialState: function() {
              //return Map({
                //data: Map({})
              //})
            //},

            //initialize: function() {
              //this.on('set', function(state, params) {
                //return state.update('data', data => data.set(params.key, toImmutable(params.value)))
              //})
            //},
          //})
        //})
      //})

      //it('1 dispatch', () => {
        //reactor.dispatch('set', {
          //key: 'key',
          //value: { foo: 'bar' },
        //})
      //})

      //it('10 dispatch', () => {
        //for (var i = 0; i < 10; i++) {
          //reactor.dispatch('set', {
            //key: 'key' + i,
            //value: { foo: 'bar' },
          //})
        //}
      //})
    //})

    //describe('10 stores', () => {
      //var reactor

      //beforeEach(() => {
        //reactor = new Reactor()

        //var storeMap = {}
        //for (var i = 0; i < 10; i++) {
          //storeMap['store' + i] = new Store({
            //getInitialState: function() {
              //return Map({
                //data: Map({})
              //})
            //},
            //initialize: function() {
              //this.on('set', function(state, params) {
                //return state.update('data', data => data.set(params.key, toImmutable(params.value)))
              //})
            //},
          //})
        //}

        //reactor.registerStores(storeMap)
      //})

      //it('1 dispatch', () => {
        //reactor.dispatch('set', {
          //key: 'key',
          //value: { foo: 'bar' },
        //})
      //})

      //it('10 dispatch', () => {
        //for (var i = 0; i < 10; i++) {
          //reactor.dispatch('set', {
            //key: 'key' + i,
            //value: { foo: 'bar' },
          //})
        //}
      //})
    //})
  //})

  describe('observe', () => {
    describe('100 stores', () => {
      var reactor

      beforeEach(() => {
        reactor = new Reactor()

        var storeMap = {}
        dotimes(100, (i) => {
          storeMap['store' + i] = new Store({
            getInitialState: function() {
              return Map({
                data: Map({})
              })
            },

            initialize: function() {
              this.on('set' + i, function(state, params) {
                return state.update('data', data => data.set(params.key, params.value))
              })
            },
          })
        })

        reactor.registerStores(storeMap)
      })

      it('setup 1 observers', () => {
        var counter = 0
        reactor.observe(['store1'], (val) => {
          counter += 1
        })
      })

      it('setup 100 observers', () => {
        var counter = 0
        dotimes(100, (index) => {
          reactor.observe(['store' + index], (val) => {
            counter += 1
          })
        })
      })

      describe('1 observer', () => {
        var counter = 0
        beforeEach(() => {
          reactor.observe(['store1'], (val) => {
            counter += val
          })
        })

        it('keypath observe, immutable value', () => {
          dotimes(6, (index) => {
            var value = (index % 2)
              ? Map({ foo: 'bar' })
              : Map({ foo: 'baz' })

            reactor.dispatch('set1', {
              key: 'key',
              value: value,
            })
          })
        })
      })

      describe('100 observers', () => {
        var counter = 0
        beforeEach(() => {
          dotimes(100, (index) => {
            reactor.observe(['store' + index], (val) => {
              counter += 1
            })
          })
        })

        it('keypath observe, immutable value', () => {
          var counter = 0

          dotimes(6, (index) => {
            var value = (index % 2)
              ? Map({ foo: 'bar' })
              : Map({ foo: 'baz' })

            reactor.dispatch('set1', {
              key: 'key',
              value: value,
            })
          })
        })
      })

      describe('100 complex observers', () => {
        var counter = 0
        var currentProject
        var projectGetter

        beforeEach(() => {
          dotimes(100, (index) => {
            reactor.observe(['store1', 'data', 'prop' + index], (val) => {
              //pausecomp(100)
              counter += 1
            })
          })

          var store1Projects = [
            ['store1', 'data', 'projects'],
            (projects) => {
              return projects ? projects : Map({})
            },
          ]

          var store2ProjectId = [
            ['store2', 'data', 'projectId'],
            (id) => {
              return id ? id : 1
            },
          ]

          projectGetter = [
            store1Projects,
            store2ProjectId,
            (projects, id) => {
              var res = projects.get(String(id))
              return res
            },
          ]

          reactor.dispatch('set1', {
            key: 'projects',
            value: Map({
              1: Map({ id: 1, name :'proj1' }),
              2: Map({ id: 2, name :'proj2' }),
              3: Map({ id: 3, name :'proj3' }),
              4: Map({ id: 4, name :'proj4' }),
            })
          })

          reactor.dispatch('set2', {
            key: 'projectId',
            value: 2,
          })

          reactor.observe(projectGetter, () => {
            //pausecomp(10)
          })
        })

        it('getter observe, composition', () => {
          var counter = 0

          dotimes(10, (index) => {
            reactor.dispatch('set1', {
              key: 'key' + index,
              value: index,
            })
          })
          reactor.dispatch('set2', {
            key: 'projectId',
            value: counter,
          })
          // set other stores
          dotimes(10, (index) => {
            reactor.dispatch('set' + (index + 3), {
              key: 'key' + index,
              value: index,
            })
          })
          reactor.dispatch('set2', {
            key: 'projectId',
            value: 3,
          })
        })
      })
    })
  })
})
