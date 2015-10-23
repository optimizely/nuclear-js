var Nuclear = require("./dist/nuclear"); // v1.1.1

var SET_YEAR_GROUP = "SET_YEAR_GROUP";
var LOADED = "LOADED";

function runTest(value) {

  var store = Nuclear.Store({
    getInitialState: function() {
      return Nuclear.toImmutable({
        yearGroup: 0,
        shouldLoaded: true
      });
    },

    initialize: function() {
      this.on(SET_YEAR_GROUP, setYearGroup);
      this.on(LOADED, loaded);
    }
  });

  function setYearGroup(store, payload) {
    return store
      .set("yearGroup", payload.yearGroup)
      .set("shouldLoad", true);
  }

  function loaded(store) {
    return store.set("shouldLoad", false);
  }

  var reactor = new Nuclear.Reactor();

  reactor.registerStores({ uiStore: store });

  var output = [];
  // Record changes to yearGroup
  reactor.observe(["uiStore", "yearGroup"], function(y) { output.push(y) });

  reactor.dispatch(SET_YEAR_GROUP, {yearGroup: 6});
  reactor.dispatch(LOADED);
  reactor.dispatch(SET_YEAR_GROUP, {yearGroup: value});

  return output;
}

//var output1 = runTest(1);
//console.log(output1); // OK - logs [ 6, 1 ]

var output5 = runTest(5);
console.log(output5); // WRONG! Logs [ 6 ] instead of [ 6, 5 ] !

// Removing the reactor.dispatch("LOADED"); call seems to fix things, but why?!
