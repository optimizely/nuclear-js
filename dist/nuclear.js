(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("immutable"));
	else if(typeof define === 'function' && define.amd)
		define(["immutable"], factory);
	else if(typeof exports === 'object')
		exports["Nuclear"] = factory(require("immutable"));
	else
		root["Nuclear"] = factory(root["Immutable"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	var helpers = __webpack_require__(1)

	/**
	 * @return {Reactor}
	 */
	exports.Reactor = __webpack_require__(4)

	/**
	 * @return {Store}
	 */
	exports.Store = __webpack_require__(13)

	// export the immutable library
	exports.Immutable = __webpack_require__(2)

	/**
	 * @return {boolean}
	 */
	exports.isKeyPath = __webpack_require__(10).isKeyPath

	/**
	 * @return {boolean}
	 */
	exports.isGetter = __webpack_require__(9).isGetter

	// expose helper functions
	exports.toJS = helpers.toJS
	exports.toImmutable = helpers.toImmutable
	exports.isImmutable = helpers.isImmutable

	exports.createReactMixin = __webpack_require__(12)


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	var Immutable = __webpack_require__(2)
	var isObject = __webpack_require__(3).isObject

	/**
	 * A collection of helpers for the ImmutableJS library
	 */

	/**
	 * @param {*} obj
	 * @return {boolean}
	 */
	function isImmutable(obj) {
	  return Immutable.Iterable.isIterable(obj)
	}

	/**
	 * Returns true if the value is an ImmutableJS data structure
	 * or a JavaScript primitive that is immutable (string, number, etc)
	 * @param {*} obj
	 * @return {boolean}
	 */
	function isImmutableValue(obj) {
	  return (
	    isImmutable(obj) ||
	    !isObject(obj)
	  )
	}

	/**
	 * Converts an Immutable Sequence to JS object
	 * Can be called on any type
	 */
	function toJS(arg) {
	  // arg instanceof Immutable.Sequence is unreliable
	  return (isImmutable(arg))
	    ? arg.toJS()
	    : arg
	}

	/**
	 * Converts a JS object to an Immutable object, if it's
	 * already Immutable its a no-op
	 */
	function toImmutable(arg) {
	  return (isImmutable(arg))
	    ? arg
	    : Immutable.fromJS(arg)
	}

	exports.toJS = toJS
	exports.toImmutable = toImmutable
	exports.isImmutable = isImmutable
	exports.isImmutableValue = isImmutableValue


/***/ }),
/* 2 */
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	/**
	 * Checks if the passed in value is a string
	 * @param {*} val
	 * @return {boolean}
	 */
	exports.isString = function(val) {
	  return typeof val === 'string' || objectToString(val) === '[object String]'
	}

	/**
	 * Checks if the passed in value is an array
	 * @param {*} val
	 * @return {boolean}
	 */
	exports.isArray = Array.isArray /* istanbul ignore next */|| function(val) {
	  return objectToString(val) === '[object Array]'
	}

	// taken from underscore source to account for browser discrepancy
	/* istanbul ignore if  */
	if (typeof /./ !== 'function' && typeof Int8Array !== 'object') {
	  /**
	   * Checks if the passed in value is a function
	   * @param {*} val
	   * @return {boolean}
	   */
	  exports.isFunction = function(obj) {
	    return typeof obj === 'function' || false
	  }
	} else {
	  /**
	   * Checks if the passed in value is a function
	   * @param {*} val
	   * @return {boolean}
	   */
	  exports.isFunction = function(val) {
	    return toString.call(val) === '[object Function]'
	  }
	}

	/**
	 * Checks if the passed in value is of type Object
	 * @param {*} val
	 * @return {boolean}
	 */
	exports.isObject = function(obj) {
	  var type = typeof obj
	  return type === 'function' || type === 'object' && !!obj
	}

	/**
	 * Extends an object with the properties of additional objects
	 * @param {object} obj
	 * @param {object} objects
	 * @return {object}
	 */
	exports.extend = function(obj) {
	  var length = arguments.length

	  if (!obj || length < 2) {
	    return obj || {}
	  }

	  for (var index = 1; index < length; index++) {
	    var source = arguments[index]
	    var keys = Object.keys(source)
	    var l = keys.length

	    for (var i = 0; i < l; i++) {
	      var key = keys[i]
	      obj[key] = source[key]
	    }
	  }

	  return obj
	}

	/**
	 * Creates a shallow clone of an object
	 * @param {object} obj
	 * @return {object}
	 */
	exports.clone = function(obj) {
	  if (!exports.isObject(obj)) {
	    return obj
	  }
	  return exports.isArray(obj) ? obj.slice() : exports.extend({}, obj)
	}

	/**
	 * Iterates over a collection of elements yielding each iteration to an
	 * iteratee. The iteratee may be bound to the context argument and is invoked
	 * each time with three arguments (value, index|key, collection). Iteration may
	 * be exited early by explicitly returning false.
	 * @param {array|object|string} collection
	 * @param {function} iteratee
	 * @param {*} context
	 * @return {array|object|string}
	 */
	exports.each = function(collection, iteratee, context) {
	  var length = collection ? collection.length : 0
	  var i = -1
	  var keys
	  var origIteratee

	  if (context) {
	    origIteratee = iteratee
	    iteratee = function(value, index, innerCollection) {
	      return origIteratee.call(context, value, index, innerCollection)
	    }
	  }

	  if (isLength(length)) {
	    while (++i < length) {
	      if (iteratee(collection[i], i, collection) === false) {
	        break
	      }
	    }
	  } else {
	    keys = Object.keys(collection)
	    length = keys.length
	    while (++i < length) {
	      if (iteratee(collection[keys[i]], keys[i], collection) === false) {
	        break
	      }
	    }
	  }

	  return collection
	}

	/**
	 * Returns a new function the invokes `func` with `partialArgs` prepended to
	 * any passed into the new function. Acts like `Array.prototype.bind`, except
	 * it does not alter `this` context.
	 * @param {function} func
	 * @param {*} partialArgs
	 * @return {function}
	 */
	exports.partial = function(func) {
	  var slice = Array.prototype.slice
	  var partialArgs = slice.call(arguments, 1)

	  return function() {
	    return func.apply(this, partialArgs.concat(slice.call(arguments)))
	  }
	}

	/**
	 * Returns the text value representation of an object
	 * @private
	 * @param {*} obj
	 * @return {string}
	 */
	function objectToString(obj) {
	  return obj && typeof obj === 'object' && toString.call(obj)
	}

	/**
	 * Checks if the value is a valid array-like length.
	 * @private
	 * @param {*} val
	 * @return {bool}
	 */
	function isLength(val) {
	  return typeof val === 'number'
	    && val > -1
	    && val % 1 === 0
	    && val <= Number.MAX_VALUE
	}


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	var Immutable = __webpack_require__(2)
	var logging = __webpack_require__(5)
	var ChangeObserver = __webpack_require__(6)
	var Getter = __webpack_require__(9)
	var KeyPath = __webpack_require__(10)
	var Evaluator = __webpack_require__(11)
	var createReactMixin = __webpack_require__(12)

	// helper fns
	var toJS = __webpack_require__(1).toJS
	var toImmutable = __webpack_require__(1).toImmutable
	var isImmutableValue = __webpack_require__(1).isImmutableValue
	var each = __webpack_require__(3).each


	/**
	 * State is stored in NuclearJS Reactors.  Reactors
	 * contain a 'state' object which is an Immutable.Map
	 *
	 * The only way Reactors can change state is by reacting to
	 * messages.  To update state, Reactor's dispatch messages to
	 * all registered cores, and the core returns it's new
	 * state based on the message
	 */

	  function Reactor(config) {"use strict";
	    if (!(this instanceof Reactor)) {
	      return new Reactor(config)
	    }
	    config = config || {}

	    this.debug = !!config.debug

	    this.ReactMixin = createReactMixin(this)
	    /**
	     * The state for the whole cluster
	     */
	    this.state = Immutable.Map({})
	    /**
	     * Holds a map of id => store instance
	     */
	    this.__stores = Immutable.Map({})

	    this.__evaluator = new Evaluator()
	    /**
	     * Change observer interface to observe certain keypaths
	     * Created after __initialize so it starts with initialState
	     */
	    this.__changeObserver = new ChangeObserver(this.state, this.__evaluator)

	    // keep track of the depth of batch nesting
	    this.__batchDepth = 0
	    // number of dispatches in the top most batch cycle
	    this.__batchDispatchCount = 0

	    // keep track if we are currently dispatching
	    this.__isDispatching = false
	  }

	  /**
	   * Evaluates a KeyPath or Getter in context of the reactor state
	   * @param {KeyPath|Getter} keyPathOrGetter
	   * @return {*}
	   */
	  Object.defineProperty(Reactor.prototype,"evaluate",{writable:true,configurable:true,value:function(keyPathOrGetter) {"use strict";
	    return this.__evaluator.evaluate(this.state, keyPathOrGetter)
	  }});

	  /**
	   * Gets the coerced state (to JS object) of the reactor.evaluate
	   * @param {KeyPath|Getter} keyPathOrGetter
	   * @return {*}
	   */
	  Object.defineProperty(Reactor.prototype,"evaluateToJS",{writable:true,configurable:true,value:function(keyPathOrGetter) {"use strict";
	    return toJS(this.evaluate(keyPathOrGetter))
	  }});

	  /**
	   * Adds a change observer whenever a certain part of the reactor state changes
	   *
	   * 1. observe(handlerFn) - 1 argument, called anytime reactor.state changes
	   * 2. observe(keyPath, handlerFn) same as above
	   * 3. observe(getter, handlerFn) called whenever any getter dependencies change with
	   *    the value of the getter
	   *
	   * Adds a change handler whenever certain deps change
	   * If only one argument is passed invoked the handler whenever
	   * the reactor state changes
	   *
	   * @param {KeyPath|Getter} getter
	   * @param {function} handler
	   * @return {function} unwatch function
	   */
	  Object.defineProperty(Reactor.prototype,"observe",{writable:true,configurable:true,value:function(getter, handler) {"use strict";
	    if (arguments.length === 1) {
	      handler = getter
	      getter = Getter.fromKeyPath([])
	    } else if (KeyPath.isKeyPath(getter)) {
	      getter = Getter.fromKeyPath(getter)
	    }
	    return this.__changeObserver.onChange(getter, handler)
	  }});


	  /**
	   * Dispatches a single message
	   * @param {string} actionType
	   * @param {object|undefined} payload
	   */
	  Object.defineProperty(Reactor.prototype,"dispatch",{writable:true,configurable:true,value:function(actionType, payload) {"use strict";
	    if (this.__batchDepth === 0) {
	      if (this.__isDispatching) {
	        this.__isDispatching = false
	        throw new Error('Dispatch may not be called while a dispatch is in progress')
	      }
	      this.__isDispatching = true
	    }

	    var prevState = this.state

	    try {
	      this.state = this.__handleAction(prevState, actionType, payload)
	    } catch (e) {
	      this.__isDispatching = false
	      throw e
	    }


	    if (this.__batchDepth > 0) {
	      this.__batchDispatchCount++
	    } else {
	      if (this.state !== prevState) {
	        try {
	          this.__notify()
	        } catch (e) {
	          this.__isDispatching = false
	          throw e
	        }
	      }
	      this.__isDispatching = false
	    }
	  }});

	  /**
	   * Allows batching of dispatches before notifying change observers
	   * @param {Function} fn
	   */
	  Object.defineProperty(Reactor.prototype,"batch",{writable:true,configurable:true,value:function(fn) {"use strict";
	    this.__batchStart()
	    fn()
	    this.__batchEnd()
	  }});

	  /**
	   * @deprecated
	   * @param {String} id
	   * @param {Store} store
	   */
	  Object.defineProperty(Reactor.prototype,"registerStore",{writable:true,configurable:true,value:function(id, store) {"use strict";
	    /* eslint-disable no-console */
	    console.warn('Deprecation warning: `registerStore` will no longer be supported in 1.1, use `registerStores` instead')
	    /* eslint-enable no-console */
	    var stores = {}
	    stores[id] = store
	    this.registerStores(stores)
	  }});

	  /**
	   * @param {Store[]} stores
	   */
	  Object.defineProperty(Reactor.prototype,"registerStores",{writable:true,configurable:true,value:function(stores) {"use strict";
	    each(stores, function(store, id)  {
	      if (this.__stores.get(id)) {
	        /* eslint-disable no-console */
	        console.warn('Store already defined for id = ' + id)
	        /* eslint-enable no-console */
	      }

	      var initialState = store.getInitialState()

	      if (this.debug && !isImmutableValue(initialState)) {
	        throw new Error('Store getInitialState() must return an immutable value, did you forget to call toImmutable')
	      }

	      this.__stores = this.__stores.set(id, store)
	      this.state = this.state.set(id, initialState)
	    }.bind(this))

	    this.__notify()
	  }});

	  /**
	   * Returns a plain object representing the application state
	   * @return {Object}
	   */
	  Object.defineProperty(Reactor.prototype,"serialize",{writable:true,configurable:true,value:function() {"use strict";
	    var serialized = {}
	    this.__stores.forEach(function(store, id)  {
	      var storeState = this.state.get(id)
	      var serializedState = store.serialize(storeState)
	      if (serializedState !== undefined) {
	        serialized[id] = serializedState
	      }
	    }.bind(this))
	    return serialized
	  }});

	  /**
	   * @param {Object} state
	   */
	  Object.defineProperty(Reactor.prototype,"loadState",{writable:true,configurable:true,value:function(state) {"use strict";
	    var stateToLoad = toImmutable({}).withMutations(function(stateToLoad)  {
	      each(state, function(serializedStoreState, storeId)  {
	        var store = this.__stores.get(storeId)
	        if (store) {
	          var storeState = store.deserialize(serializedStoreState)
	          if (storeState !== undefined) {
	            stateToLoad.set(storeId, storeState)
	          }
	        }
	      }.bind(this))
	    }.bind(this))

	    this.state = this.state.merge(stateToLoad)
	    this.__notify()
	  }});

	  /**
	   * Resets the state of a reactor and returns back to initial state
	   */
	  Object.defineProperty(Reactor.prototype,"reset",{writable:true,configurable:true,value:function() {"use strict";
	    var debug = this.debug
	    var prevState = this.state

	    this.state = Immutable.Map().withMutations(function(state)  {
	      this.__stores.forEach(function(store, id)  {
	        var storeState = prevState.get(id)
	        var resetStoreState = store.handleReset(storeState)
	        if (debug && resetStoreState === undefined) {
	          throw new Error('Store handleReset() must return a value, did you forget a return statement')
	        }
	        if (debug && !isImmutableValue(resetStoreState)) {
	          throw new Error('Store reset state must be an immutable value, did you forget to call toImmutable')
	        }
	        state.set(id, resetStoreState)
	      })
	    }.bind(this))

	    this.__evaluator.reset()
	    this.__changeObserver.reset(this.state)
	  }});

	  /**
	   * Notifies all change observers with the current state
	   * @private
	   */
	  Object.defineProperty(Reactor.prototype,"__notify",{writable:true,configurable:true,value:function() {"use strict";
	    this.__changeObserver.notifyObservers(this.state)
	  }});

	  /**
	   * Reduces the current state to the new state given actionType / message
	   * @param {string} actionType
	   * @param {object|undefined} payload
	   * @return {Immutable.Map}
	   */
	  Object.defineProperty(Reactor.prototype,"__handleAction",{writable:true,configurable:true,value:function(state, actionType, payload) {"use strict";
	    return state.withMutations(function(state)  {
	      if (this.debug) {
	        logging.dispatchStart(actionType, payload)
	      }

	      // let each store handle the message
	      this.__stores.forEach(function(store, id)  {
	        var currState = state.get(id)
	        var newState

	        try {
	          newState = store.handle(currState, actionType, payload)
	        } catch(e) {
	          // ensure console.group is properly closed
	          logging.dispatchError(e.message)
	          throw e
	        }

	        if (this.debug && newState === undefined) {
	          var errorMsg = 'Store handler must return a value, did you forget a return statement'
	          logging.dispatchError(errorMsg)
	          throw new Error(errorMsg)
	        }

	        state.set(id, newState)

	        if (this.debug) {
	          logging.storeHandled(id, currState, newState)
	        }
	      }.bind(this))

	      if (this.debug) {
	        logging.dispatchEnd(state)
	      }
	    }.bind(this))
	  }});

	  Object.defineProperty(Reactor.prototype,"__batchStart",{writable:true,configurable:true,value:function() {"use strict";
	    this.__batchDepth++
	  }});

	  Object.defineProperty(Reactor.prototype,"__batchEnd",{writable:true,configurable:true,value:function() {"use strict";
	    this.__batchDepth--

	    if (this.__batchDepth <= 0) {
	      if (this.__batchDispatchCount > 0) {
	        // set to true to catch if dispatch called from observer
	        this.__isDispatching = true
	        try {
	          this.__notify()
	        } catch (e) {
	          this.__isDispatching = false
	          throw e
	        }
	        this.__isDispatching = false
	      }
	      this.__batchDispatchCount = 0
	    }
	  }});


	module.exports = Reactor


/***/ }),
/* 5 */
/***/ (function(module, exports) {

	/* eslint-disable no-console */
	/**
	 * Wraps a Reactor.react invocation in a console.group
	*/
	exports.dispatchStart = function(type, payload) {
	  if (console.group) {
	    console.groupCollapsed('Dispatch: %s', type)
	    console.group('payload')
	    console.debug(payload)
	    console.groupEnd()
	  }
	}

	exports.dispatchError = function(error) {
	  if (console.group) {
	    console.debug('Dispatch error: ' + error)
	    console.groupEnd()
	  }
	}

	exports.storeHandled = function(id, before, after) {
	  if (console.group) {
	    if (before !== after) {
	      console.debug('Store ' + id + ' handled action')
	    }
	  }
	}

	exports.dispatchEnd = function(state) {
	  if (console.group) {
	    console.debug('Dispatch done, new state: ', state.toJS())
	    console.groupEnd()
	  }
	}
	/* eslint-enable no-console */


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	var Immutable = __webpack_require__(2)
	var hashCode = __webpack_require__(7)
	var isEqual = __webpack_require__(8)

	/**
	 * ChangeObserver is an object that contains a set of subscriptions
	 * to changes for keyPaths on a reactor
	 *
	 * Packaging the handlers together allows for easier cleanup
	 */

	  /**
	   * @param {Immutable.Map} initialState
	   * @param {Evaluator} evaluator
	   */
	  function ChangeObserver(initialState, evaluator) {"use strict";
	    this.__prevState = initialState
	    this.__evaluator = evaluator
	    this.__prevValues = Immutable.Map()
	    this.__observers = []
	  }

	  /**
	   * @param {Immutable.Map} newState
	   */
	  Object.defineProperty(ChangeObserver.prototype,"notifyObservers",{writable:true,configurable:true,value:function(newState) {"use strict";
	    if (this.__observers.length > 0) {
	      var currentValues = Immutable.Map()

	      this.__observers.slice(0).forEach(function(entry)  {
	        if (entry.unwatched) {
	          return
	        }
	        var getter = entry.getter
	        var code = hashCode(getter)
	        var prevState = this.__prevState
	        var prevValue

	        if (this.__prevValues.has(code)) {
	          prevValue = this.__prevValues.get(code)
	        } else {
	          prevValue = this.__evaluator.evaluate(prevState, getter)
	          this.__prevValues = this.__prevValues.set(code, prevValue)
	        }

	        var currValue = this.__evaluator.evaluate(newState, getter)

	        if (!isEqual(prevValue, currValue)) {
	          entry.handler.call(null, currValue)
	          currentValues = currentValues.set(code, currValue)
	        }
	      }.bind(this))

	      this.__prevValues = currentValues
	    }
	    this.__prevState = newState
	  }});

	  /**
	   * Specify a getter and a change handler function
	   * Handler function is called whenever the value of the getter changes
	   * @param {Getter} getter
	   * @param {function} handler
	   * @return {function} unwatch function
	   */
	  Object.defineProperty(ChangeObserver.prototype,"onChange",{writable:true,configurable:true,value:function(getter, handler) {"use strict";
	    // TODO: make observers a map of <Getter> => { handlers }
	    var entry = {
	      getter: getter,
	      handler: handler,
	      unwatched: false,
	    }
	    this.__observers.push(entry)
	    // return unwatch function
	    return function()  {
	      // TODO: untrack from change emitter
	      var ind = this.__observers.indexOf(entry)
	      if (ind > -1) {
	        entry.unwatched = true
	        this.__observers.splice(ind, 1)
	      }
	    }.bind(this)
	  }});

	  /**
	   * Resets and clears all observers and reinitializes back to the supplied
	   * previous state
	   * @param {Immutable.Map} prevState
	   *
	   */
	  Object.defineProperty(ChangeObserver.prototype,"reset",{writable:true,configurable:true,value:function(prevState) {"use strict";
	    this.__prevState = prevState
	    this.__prevValues = Immutable.Map()
	    this.__observers = []
	  }});


	module.exports = ChangeObserver


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	var Immutable = __webpack_require__(2)

	/**
	 * Takes a getter and returns the hash code value
	 *
	 * If cache argument is true it will freeze the getter
	 * and cache the hashed value
	 *
	 * @param {Getter} getter
	 * @param {boolean} dontCache
	 * @return {number}
	 */
	module.exports = function(getter, dontCache) {
	  if (getter.hasOwnProperty('__hashCode')) {
	    return getter.__hashCode
	  }

	  var hashCode = Immutable.fromJS(getter).hashCode()

	  if (!dontCache) {
	    Object.defineProperty(getter, '__hashCode', {
	      enumerable: false,
	      configurable: false,
	      writable: false,
	      value: hashCode,
	    })

	    Object.freeze(getter)
	  }

	  return hashCode
	}


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	var Immutable = __webpack_require__(2)
	/**
	 * Is equal by value check
	 */
	module.exports = function(a, b) {
	  return Immutable.is(a, b)
	}


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	var isFunction = __webpack_require__(3).isFunction
	var isArray = __webpack_require__(3).isArray
	var isKeyPath = __webpack_require__(10).isKeyPath

	/**
	 * Getter helper functions
	 * A getter is an array with the form:
	 * [<KeyPath>, ...<KeyPath>, <function>]
	 */
	var identity = function(x)  {return x;}

	/**
	 * Checks if something is a getter literal, ex: ['dep1', 'dep2', function(dep1, dep2) {...}]
	 * @param {*} toTest
	 * @return {boolean}
	 */
	function isGetter(toTest) {
	  return (isArray(toTest) && isFunction(toTest[toTest.length - 1]))
	}

	/**
	 * Returns the compute function from a getter
	 * @param {Getter} getter
	 * @return {function}
	 */
	function getComputeFn(getter) {
	  return getter[getter.length - 1]
	}

	/**
	 * Returns an array of deps from a getter
	 * @param {Getter} getter
	 * @return {function}
	 */
	function getDeps(getter) {
	  return getter.slice(0, getter.length - 1)
	}

	/**
	 * @param {KeyPath}
	 * @return {Getter}
	 */
	function fromKeyPath(keyPath) {
	  if (!isKeyPath(keyPath)) {
	    throw new Error('Cannot create Getter from KeyPath: ' + keyPath)
	  }

	  return [keyPath, identity]
	}


	module.exports = {
	  isGetter: isGetter,
	  getComputeFn: getComputeFn,
	  getDeps: getDeps,
	  fromKeyPath: fromKeyPath,
	}


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	var isArray = __webpack_require__(3).isArray
	var isFunction = __webpack_require__(3).isFunction

	/**
	 * Checks if something is simply a keyPath and not a getter
	 * @param {*} toTest
	 * @return {boolean}
	 */
	exports.isKeyPath = function(toTest) {
	  return (
	    isArray(toTest) &&
	    !isFunction(toTest[toTest.length - 1])
	  )
	}


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	var Immutable = __webpack_require__(2)
	var toImmutable = __webpack_require__(1).toImmutable
	var hashCode = __webpack_require__(7)
	var isEqual = __webpack_require__(8)
	var getComputeFn = __webpack_require__(9).getComputeFn
	var getDeps = __webpack_require__(9).getDeps
	var isKeyPath = __webpack_require__(10).isKeyPath
	var isGetter = __webpack_require__(9).isGetter

	// Keep track of whether we are currently executing a Getter's computeFn
	var __applyingComputeFn = false


	  function Evaluator() {"use strict";
	    /**
	     * {
	     *   <hashCode>: {
	     *     stateHashCode: number,
	     *     args: Immutable.List,
	     *     value: any,
	     *   }
	     * }
	     */
	    this.__cachedGetters = Immutable.Map({})
	  }

	  /**
	   * Takes either a KeyPath or Getter and evaluates
	   *
	   * KeyPath form:
	   * ['foo', 'bar'] => state.getIn(['foo', 'bar'])
	   *
	   * Getter form:
	   * [<KeyPath>, <KeyPath>, ..., <function>]
	   *
	   * @param {Immutable.Map} state
	   * @param {string|array} getter
	   * @return {any}
	   */
	  Object.defineProperty(Evaluator.prototype,"evaluate",{writable:true,configurable:true,value:function(state, keyPathOrGetter) {"use strict";
	    if (isKeyPath(keyPathOrGetter)) {
	      // if its a keyPath simply return
	      return state.getIn(keyPathOrGetter)
	    } else if (!isGetter(keyPathOrGetter)) {
	      throw new Error('evaluate must be passed a keyPath or Getter')
	    }

	    // Must be a Getter
	    var code = hashCode(keyPathOrGetter)

	    // if the value is cached for this dispatch cycle, return the cached value
	    if (this.__isCached(state, keyPathOrGetter)) {
	      // Cache hit
	      return this.__cachedGetters.getIn([code, 'value'])

	    }

	    // evaluate dependencies
	    var args = getDeps(keyPathOrGetter).map(function(dep)  {return this.evaluate(state, dep);}.bind(this))

	    if (this.__hasStaleValue(state, keyPathOrGetter)) {
	      // getter deps could still be unchanged since we only looked at the unwrapped (keypath, bottom level) deps
	      var prevArgs = this.__cachedGetters.getIn([code, 'args'])

	      // since Getter is a pure functions if the args are the same its a cache hit
	      if (isEqual(prevArgs, toImmutable(args))) {
	        var prevValue = this.__cachedGetters.getIn([code, 'value'])
	        this.__cacheValue(state, keyPathOrGetter, prevArgs, prevValue)
	        return prevValue
	      }
	    }

	    // This indicates that we have called evaluate within the body of a computeFn.
	    // Throw an error as this will lead to inconsistent caching
	    if (__applyingComputeFn === true) {
	      __applyingComputeFn = false
	      throw new Error('Evaluate may not be called within a Getters computeFn')
	    }

	    var evaluatedValue
	    __applyingComputeFn = true
	    try {
	      evaluatedValue = getComputeFn(keyPathOrGetter).apply(null, args)
	      __applyingComputeFn = false
	    } catch (e) {
	      __applyingComputeFn = false
	      throw e
	    }

	    this.__cacheValue(state, keyPathOrGetter, args, evaluatedValue)

	    return evaluatedValue
	  }});

	  /**
	   * @param {Immutable.Map} state
	   * @param {Getter} getter
	   */
	  Object.defineProperty(Evaluator.prototype,"__hasStaleValue",{writable:true,configurable:true,value:function(state, getter) {"use strict";
	    var code = hashCode(getter)
	    var cache = this.__cachedGetters
	    return (
	      cache.has(code) &&
	      cache.getIn([code, 'stateHashCode']) !== state.hashCode()
	    )
	  }});

	  /**
	   * Caches the value of a getter given state, getter, args, value
	   * @param {Immutable.Map} state
	   * @param {Getter} getter
	   * @param {Array} args
	   * @param {any} value
	   */
	  Object.defineProperty(Evaluator.prototype,"__cacheValue",{writable:true,configurable:true,value:function(state, getter, args, value) {"use strict";
	    var code = hashCode(getter)
	    this.__cachedGetters = this.__cachedGetters.set(code, Immutable.Map({
	      value: value,
	      args: toImmutable(args),
	      stateHashCode: state.hashCode(),
	    }))
	  }});

	  /**
	   * Returns boolean whether the supplied getter is cached for a given state
	   * @param {Immutable.Map} state
	   * @param {Getter} getter
	   * @return {boolean}
	   */
	  Object.defineProperty(Evaluator.prototype,"__isCached",{writable:true,configurable:true,value:function(state, getter) {"use strict";
	    var code = hashCode(getter)
	    return (
	      this.__cachedGetters.hasIn([code, 'value']) &&
	      this.__cachedGetters.getIn([code, 'stateHashCode']) === state.hashCode()
	    )
	  }});

	  /**
	   * Removes all caching about a getter
	   * @param {Getter}
	   */
	  Object.defineProperty(Evaluator.prototype,"untrack",{writable:true,configurable:true,value:function(getter) {"use strict";
	    // TODO: untrack all dependencies
	  }});

	  Object.defineProperty(Evaluator.prototype,"reset",{writable:true,configurable:true,value:function() {"use strict";
	    this.__cachedGetters = Immutable.Map({})
	  }});


	module.exports = Evaluator


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

	var each = __webpack_require__(3).each
	/**
	 * @param {Reactor} reactor
	 */
	module.exports = function(reactor) {
	  return {
	    getInitialState: function() {
	      return getState(reactor, this.getDataBindings())
	    },

	    componentDidMount: function() {
	      var component = this
	      component.__unwatchFns = []
	      each(this.getDataBindings(), function(getter, key) {
	        var unwatchFn = reactor.observe(getter, function(val) {
	          var newState = {}
	          newState[key] = val
	          component.setState(newState)
	        })

	        component.__unwatchFns.push(unwatchFn)
	      })
	    },

	    componentWillUnmount: function() {
	      while (this.__unwatchFns.length) {
	        this.__unwatchFns.shift()()
	      }
	    },
	  }
	}

	/**
	 * Returns a mapping of the getDataBinding keys to
	 * the reactor values
	 */
	function getState(reactor, data) {
	  var state = {}
	  each(data, function(value, key) {
	    state[key] = reactor.evaluate(value)
	  })
	  return state
	}


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	var Map = __webpack_require__(2).Map
	var extend = __webpack_require__(3).extend
	var toJS = __webpack_require__(1).toJS
	var toImmutable = __webpack_require__(1).toImmutable

	/**
	 * Stores define how a certain domain of the application should respond to actions
	 * taken on the whole system.  They manage their own section of the entire app state
	 * and have no knowledge about the other parts of the application state.
	 */

	  function Store(config) {"use strict";
	    if (!(this instanceof Store)) {
	      return new Store(config)
	    }

	    this.__handlers = Map({})

	    if (config) {
	      // allow `MyStore extends Store` syntax without throwing error
	      extend(this, config)
	    }

	    this.initialize()
	  }

	  /**
	   * This method is overridden by extending classes to setup message handlers
	   * via `this.on` and to set up the initial state
	   *
	   * Anything returned from this function will be coerced into an ImmutableJS value
	   * and set as the initial state for the part of the ReactorCore
	   */
	  Object.defineProperty(Store.prototype,"initialize",{writable:true,configurable:true,value:function() {"use strict";
	    // extending classes implement to setup action handlers
	  }});

	  /**
	   * Overridable method to get the initial state for this type of store
	   */
	  Object.defineProperty(Store.prototype,"getInitialState",{writable:true,configurable:true,value:function() {"use strict";
	    return Map()
	  }});

	  /**
	   * Takes a current reactor state, action type and payload
	   * does the reaction and returns the new state
	   */
	  Object.defineProperty(Store.prototype,"handle",{writable:true,configurable:true,value:function(state, type, payload) {"use strict";
	    var handler = this.__handlers.get(type)

	    if (typeof handler === 'function') {
	      return handler.call(this, state, payload, type)
	    }

	    return state
	  }});

	  /**
	   * Pure function taking the current state of store and returning
	   * the new state after a NuclearJS reactor has been reset
	   *
	   * Overridable
	   */
	  Object.defineProperty(Store.prototype,"handleReset",{writable:true,configurable:true,value:function(state) {"use strict";
	    return this.getInitialState()
	  }});

	  /**
	   * Binds an action type => handler
	   */
	  Object.defineProperty(Store.prototype,"on",{writable:true,configurable:true,value:function(actionType, handler) {"use strict";
	    this.__handlers = this.__handlers.set(actionType, handler)
	  }});

	  /**
	   * Serializes store state to plain JSON serializable JavaScript
	   * Overridable
	   * @param {*}
	   * @return {*}
	   */
	  Object.defineProperty(Store.prototype,"serialize",{writable:true,configurable:true,value:function(state) {"use strict";
	    return toJS(state)
	  }});

	  /**
	   * Deserializes plain JavaScript to store state
	   * Overridable
	   * @param {*}
	   * @return {*}
	   */
	  Object.defineProperty(Store.prototype,"deserialize",{writable:true,configurable:true,value:function(state) {"use strict";
	    return toImmutable(state)
	  }});


	function isStore(toTest) {
	  return (toTest instanceof Store)
	}

	module.exports = Store

	module.exports.isStore = isStore


/***/ })
/******/ ])
});
;