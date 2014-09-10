/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var through = __webpack_require__(3)
	var Store = __webpack_require__(1);
	var utils = __webpack_require__(2)


	  function Flux() {"use strict";
	    this.stores = {}
	    this.actionGroups = {}
	    this.dispatchStream = through()
	  }

	  /**
	   * @param {string} actionType
	   * @param {object} payload
	   */
	  Flux.prototype.dispatch=function(actionType, payload) {"use strict";
	    this.dispatchStream.write({
	      type: actionType,
	      payload: payload
	    })
	  };

	  Flux.prototype.registerStore=function(id, store) {"use strict";
	    if (!(store instanceof Store)) {
	      store = new store()
	    }
	    // initialize the store's stream
	    store.initialize()
	    // save reference
	    this.stores[id] = store
	    // pipe all dispatches
	    this.dispatchStream.pipe(store.stream)
	  };

	  Flux.prototype.unregisterStore=function(id) {"use strict";
	    var store = this.getStore(id)
	    this.dispatchStream.unpipe(store.stream)
	  };

	  Flux.prototype.registerActionGroup=function(id, actionGroup) {"use strict";
	    this.actionGroups[id] = actionGroup
	  };

	  Flux.prototype.getStore=function(id) {"use strict";
	    return this.stores[id]
	  };

	  Flux.prototype.getActionGroup=function(id) {"use strict";
	    return this.actionGroups[id]
	  };


	module.exports = Flux


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var through = __webpack_require__(3)
	var Immutable = __webpack_require__(4)
	var isArray = __webpack_require__(2).isArray;


	  function Store(initialState) {"use strict";
	    this.setState(initialState || {})
	    this.__handlers = {}
	    // initialize the stream interface
	    this.stream = through(
	     function(action)  {
	        this.__handle(action)
	        this.emitState()
	      }.bind(this)
	    )
	  }

	  Store.prototype.initialize=function() {"use strict";
	    // extending classes implement to setup action handlers
	  };

	  Store.prototype.bindActions=function() {"use strict";var actions=Array.prototype.slice.call(arguments,0);
	    if (actions.length % 2 !== 0) {
	      throw new Error("bindActions must take an even number of arguments.");
	    }

	    for (var i = 0; i < actions.length; i += 2) {
	      var type = actions[i];
	      var handler = actions[i+1];
	      this.__handlers[type] = handler;
	    }
	  };

	  /**
	   * Gets the state at a keypath
	   * @param {string|array} keyPath
	   * @return {Immutable.Map}
	   */
	  Store.prototype.getState=function(keyPath) {"use strict";
	    if (keyPath === undefined) {
	      return this.state;
	    }
	    keyPath = (isArray(keyPath)) ? keyPath : [keyPath]
	    // all keys are strings
	    keyPath = keyPath.map(String)
	    console.log('getState by keypath = %j', keyPath)
	    console.log('state = %s', this.state.toString())
	    return this.state.getIn(keyPath)
	  };

	  /**
	   * Sets a property on the state
	   * @param {array|string|number} key
	   * @param {any} val
	   */
	  Store.prototype.setState=function(keyPath, val) {"use strict";
	    var args = Array.prototype.slice.call(arguments)
	    if (args.length === 1) {
	      this.state = Immutable.fromJS(args[0])
	    } else {
	      keyPath = (!isArray(keyPath)) ? [keyPath] : keyPath
	      this.state = this.state.updateIn(keyPath, function(curr)  {
	        return Immutable.fromJS(val)
	      })
	    }
	    //console.log('set state', keyPath, val, this.state.toJS())
	  };

	  Store.prototype.emitState=function() {"use strict";
	    if (!this.stream) {
	      throw new Error("Cannot emit state until the store is initialized")
	    }
	    this.stream.queue(this.getState())
	  };

	  Store.prototype.__handle=function(action) {"use strict";
	    var handler = this.__handlers[action.type];
	    if (handler && typeof handler === 'function') {
	      handler.call(this, action.payload, action.type);
	      // TODO: implelment flux logger
	    }
	  };


	module.exports = Store

	var store = new Store({
	  id: 'store',
	  coll: [1,2,3],
	  entities: {
	    1: {
	      id: 1,
	      val: 'entity 1'
	    }
	  }
	})

	var entities = store.getState(['entities', '1'])
	console.log(entities)


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(5);

	exports.extend = _.extend

	exports.isArray = _.isArray


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {var Stream = __webpack_require__(6)

	// through
	//
	// a stream that does nothing but re-emit the input.
	// useful for aggregating a series of changing but not ending streams into one stream)

	exports = module.exports = through
	through.through = through

	//create a readable writable stream.

	function through (write, end, opts) {
	  write = write || function (data) { this.queue(data) }
	  end = end || function () { this.queue(null) }

	  var ended = false, destroyed = false, buffer = [], _ended = false
	  var stream = new Stream()
	  stream.readable = stream.writable = true
	  stream.paused = false

	//  stream.autoPause   = !(opts && opts.autoPause   === false)
	  stream.autoDestroy = !(opts && opts.autoDestroy === false)

	  stream.write = function (data) {
	    write.call(this, data)
	    return !stream.paused
	  }

	  function drain() {
	    while(buffer.length && !stream.paused) {
	      var data = buffer.shift()
	      if(null === data)
	        return stream.emit('end')
	      else
	        stream.emit('data', data)
	    }
	  }

	  stream.queue = stream.push = function (data) {
	//    console.error(ended)
	    if(_ended) return stream
	    if(data == null) _ended = true
	    buffer.push(data)
	    drain()
	    return stream
	  }

	  //this will be registered as the first 'end' listener
	  //must call destroy next tick, to make sure we're after any
	  //stream piped from here.
	  //this is only a problem if end is not emitted synchronously.
	  //a nicer way to do this is to make sure this is the last listener for 'end'

	  stream.on('end', function () {
	    stream.readable = false
	    if(!stream.writable && stream.autoDestroy)
	      process.nextTick(function () {
	        stream.destroy()
	      })
	  })

	  function _end () {
	    stream.writable = false
	    end.call(stream)
	    if(!stream.readable && stream.autoDestroy)
	      stream.destroy()
	  }

	  stream.end = function (data) {
	    if(ended) return
	    ended = true
	    if(arguments.length) stream.write(data)
	    _end() // will emit or queue
	    return stream
	  }

	  stream.destroy = function () {
	    if(destroyed) return
	    destroyed = true
	    ended = true
	    buffer.length = 0
	    stream.writable = stream.readable = false
	    stream.emit('close')
	    return stream
	  }

	  stream.pause = function () {
	    if(stream.paused) return
	    stream.paused = true
	    return stream
	  }

	  stream.resume = function () {
	    if(stream.paused) {
	      stream.paused = false
	      stream.emit('resume')
	    }
	    drain()
	    //may have become paused again,
	    //as drain emits 'data'.
	    if(!stream.paused)
	      stream.emit('drain')
	    return stream
	  }
	  return stream
	}

	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 *  Copyright (c) 2014, Facebook, Inc.
	 *  All rights reserved.
	 *
	 *  This source code is licensed under the BSD-style license found in the
	 *  LICENSE file in the root directory of this source tree. An additional grant
	 *  of patent rights can be found in the PATENTS file in the same directory.
	 */
	function universalModule() {
	  var $Object = Object;

	function createClass(ctor, methods, staticMethods, superClass) {
	  var proto;
	  if (superClass) {
	    var superProto = superClass.prototype;
	    proto = $Object.create(superProto);
	  } else {
	    proto = ctor.prototype;
	  }
	  $Object.keys(methods).forEach(function (key) {
	    proto[key] = methods[key];
	  });
	  $Object.keys(staticMethods).forEach(function (key) {
	    ctor[key] = staticMethods[key];
	  });
	  proto.constructor = ctor;
	  ctor.prototype = proto;
	  return ctor;
	}

	function superCall(self, proto, name, args) {
	  return $Object.getPrototypeOf(proto)[name].apply(self, args);
	}

	function defaultSuperCall(self, proto, args) {
	  superCall(self, proto, 'constructor', args);
	}

	var $traceurRuntime = {};
	$traceurRuntime.createClass = createClass;
	$traceurRuntime.superCall = superCall;
	$traceurRuntime.defaultSuperCall = defaultSuperCall;
	"use strict";
	var SHIFT = 5;
	var SIZE = 1 << SHIFT;
	var MASK = SIZE - 1;
	var NOT_SET = {};
	var CHANGE_LENGTH = {value: false};
	var DID_ALTER = {value: false};
	function MakeRef(ref) {
	  ref.value = false;
	  return ref;
	}
	function SetRef(ref) {
	  ref && (ref.value = true);
	}
	function OwnerID() {}
	function arrCopy(arr, offset) {
	  offset = offset || 0;
	  var len = Math.max(0, arr.length - offset);
	  var newArr = new Array(len);
	  for (var ii = 0; ii < len; ii++) {
	    newArr[ii] = arr[ii + offset];
	  }
	  return newArr;
	}
	var ITER_RESULT = {
	  value: undefined,
	  done: false
	};
	function iteratorValue(value) {
	  ITER_RESULT.value = value;
	  ITER_RESULT.done = false;
	  return ITER_RESULT;
	}
	function iteratorDone() {
	  ITER_RESULT.value = undefined;
	  ITER_RESULT.done = true;
	  return ITER_RESULT;
	}
	function invariant(condition, error) {
	  if (!condition)
	    throw new Error(error);
	}
	var DELETE = 'delete';
	var ITERATOR = typeof Symbol !== 'undefined' ? Symbol.iterator : '@@iterator';
	function hash(o) {
	  if (!o) {
	    return 0;
	  }
	  if (o === true) {
	    return 1;
	  }
	  var type = typeof o;
	  if (type === 'number') {
	    if ((o | 0) === o) {
	      return o & HASH_MAX_VAL;
	    }
	    o = '' + o;
	    type = 'string';
	  }
	  if (type === 'string') {
	    return o.length > STRING_HASH_CACHE_MIN_STRLEN ? cachedHashString(o) : hashString(o);
	  }
	  if (o.hashCode) {
	    return hash(typeof o.hashCode === 'function' ? o.hashCode() : o.hashCode);
	  }
	  return hashJSObj(o);
	}
	function cachedHashString(string) {
	  var hash = STRING_HASH_CACHE[string];
	  if (hash == null) {
	    hash = hashString(string);
	    if (STRING_HASH_CACHE_SIZE === STRING_HASH_CACHE_MAX_SIZE) {
	      STRING_HASH_CACHE_SIZE = 0;
	      STRING_HASH_CACHE = {};
	    }
	    STRING_HASH_CACHE_SIZE++;
	    STRING_HASH_CACHE[string] = hash;
	  }
	  return hash;
	}
	function hashString(string) {
	  var hash = 0;
	  for (var ii = 0; ii < string.length; ii++) {
	    hash = (31 * hash + string.charCodeAt(ii)) & HASH_MAX_VAL;
	  }
	  return hash;
	}
	function hashJSObj(obj) {
	  if (obj[UID_HASH_KEY]) {
	    return obj[UID_HASH_KEY];
	  }
	  var uid = ++UID_HASH_COUNT & HASH_MAX_VAL;
	  if (!isIE8) {
	    try {
	      Object.defineProperty(obj, UID_HASH_KEY, {
	        'enumerable': false,
	        'configurable': false,
	        'writable': false,
	        'value': uid
	      });
	      return uid;
	    } catch (e) {
	      isIE8 = true;
	    }
	  }
	  obj[UID_HASH_KEY] = uid;
	  return uid;
	}
	var HASH_MAX_VAL = 0x7FFFFFFF;
	var UID_HASH_COUNT = 0;
	var UID_HASH_KEY = '__immutablehash__';
	if (typeof Symbol !== 'undefined') {
	  UID_HASH_KEY = Symbol(UID_HASH_KEY);
	}
	var isIE8 = false;
	var STRING_HASH_CACHE_MIN_STRLEN = 16;
	var STRING_HASH_CACHE_MAX_SIZE = 255;
	var STRING_HASH_CACHE_SIZE = 0;
	var STRING_HASH_CACHE = {};
	var Sequence = function Sequence(value) {
	  return $Sequence.from(arguments.length === 1 ? value : Array.prototype.slice.call(arguments));
	};
	var $Sequence = Sequence;
	($traceurRuntime.createClass)(Sequence, {
	  toString: function() {
	    return this.__toString('Seq {', '}');
	  },
	  __toString: function(head, tail) {
	    if (this.length === 0) {
	      return head + tail;
	    }
	    return head + ' ' + this.map(this.__toStringMapper).join(', ') + ' ' + tail;
	  },
	  __toStringMapper: function(v, k) {
	    return k + ': ' + quoteString(v);
	  },
	  toJS: function() {
	    return this.map((function(value) {
	      return value instanceof $Sequence ? value.toJS() : value;
	    })).__toJS();
	  },
	  toArray: function() {
	    assertNotInfinite(this.length);
	    var array = new Array(this.length || 0);
	    this.valueSeq().forEach((function(v, i) {
	      array[i] = v;
	    }));
	    return array;
	  },
	  toObject: function() {
	    assertNotInfinite(this.length);
	    var object = {};
	    this.forEach((function(v, k) {
	      object[k] = v;
	    }));
	    return object;
	  },
	  toVector: function() {
	    assertNotInfinite(this.length);
	    return Vector.from(this);
	  },
	  toMap: function() {
	    assertNotInfinite(this.length);
	    return Map.from(this);
	  },
	  toOrderedMap: function() {
	    assertNotInfinite(this.length);
	    return OrderedMap.from(this);
	  },
	  toSet: function() {
	    assertNotInfinite(this.length);
	    return Set.from(this);
	  },
	  hashCode: function() {
	    return this.__hash || (this.__hash = this.length === Infinity ? 0 : this.reduce((function(h, v, k) {
	      return (h + (hash(v) ^ (v === k ? 0 : hash(k)))) & HASH_MAX_VAL;
	    }), 0));
	  },
	  equals: function(other) {
	    if (this === other) {
	      return true;
	    }
	    if (!(other instanceof $Sequence)) {
	      return false;
	    }
	    if (this.length != null && other.length != null) {
	      if (this.length !== other.length) {
	        return false;
	      }
	      if (this.length === 0 && other.length === 0) {
	        return true;
	      }
	    }
	    if (this.__hash != null && other.__hash != null && this.__hash !== other.__hash) {
	      return false;
	    }
	    return this.__deepEquals(other);
	  },
	  __deepEquals: function(other) {
	    var entries = this.cacheResult().entrySeq().toArray();
	    var iterations = 0;
	    return other.every((function(v, k) {
	      var entry = entries[iterations++];
	      return is(k, entry[0]) && is(v, entry[1]);
	    }));
	  },
	  join: function(separator) {
	    separator = separator || ',';
	    var string = '';
	    var isFirst = true;
	    this.forEach((function(v, k) {
	      if (isFirst) {
	        isFirst = false;
	        string += v;
	      } else {
	        string += separator + v;
	      }
	    }));
	    return string;
	  },
	  count: function(predicate, thisArg) {
	    if (!predicate) {
	      if (this.length == null) {
	        this.length = this.forEach(returnTrue);
	      }
	      return this.length;
	    }
	    return this.filter(predicate, thisArg).count();
	  },
	  countBy: function(mapper, context) {
	    var seq = this;
	    return OrderedMap.empty().withMutations((function(map) {
	      seq.forEach((function(value, key, collection) {
	        map.update(mapper(value, key, collection), increment);
	      }));
	    }));
	  },
	  concat: function() {
	    for (var values = [],
	        $__1 = 0; $__1 < arguments.length; $__1++)
	      values[$__1] = arguments[$__1];
	    var sequences = [this].concat(values.map((function(value) {
	      return $Sequence(value);
	    })));
	    var concatSequence = this.__makeSequence();
	    concatSequence.length = sequences.reduce((function(sum, seq) {
	      return sum != null && seq.length != null ? sum + seq.length : undefined;
	    }), 0);
	    concatSequence.__iterateUncached = (function(fn, reverse) {
	      var iterations = 0;
	      var stoppedIteration;
	      var lastIndex = sequences.length - 1;
	      for (var ii = 0; ii <= lastIndex && !stoppedIteration; ii++) {
	        var seq = sequences[reverse ? lastIndex - ii : ii];
	        iterations += seq.__iterate((function(v, k, c) {
	          if (fn(v, k, c) === false) {
	            stoppedIteration = true;
	            return false;
	          }
	        }), reverse);
	      }
	      return iterations;
	    });
	    return concatSequence;
	  },
	  reverse: function() {
	    var sequence = this;
	    var reversedSequence = sequence.__makeSequence();
	    reversedSequence.length = sequence.length;
	    reversedSequence.__iterateUncached = (function(fn, reverse) {
	      return sequence.__iterate(fn, !reverse);
	    });
	    reversedSequence.reverse = (function() {
	      return sequence;
	    });
	    return reversedSequence;
	  },
	  keySeq: function() {
	    return this.flip().valueSeq();
	  },
	  valueSeq: function() {
	    var sequence = this;
	    var valuesSequence = makeIndexedSequence(sequence);
	    valuesSequence.length = sequence.length;
	    valuesSequence.valueSeq = returnThis;
	    valuesSequence.__iterateUncached = function(fn, reverse, flipIndices) {
	      if (flipIndices && this.length == null) {
	        return this.cacheResult().__iterate(fn, reverse, flipIndices);
	      }
	      var iterations = 0;
	      var predicate;
	      if (flipIndices) {
	        iterations = this.length - 1;
	        predicate = (function(v, k, c) {
	          return fn(v, iterations--, c) !== false;
	        });
	      } else {
	        predicate = (function(v, k, c) {
	          return fn(v, iterations++, c) !== false;
	        });
	      }
	      sequence.__iterate(predicate, reverse);
	      return flipIndices ? this.length : iterations;
	    };
	    return valuesSequence;
	  },
	  entrySeq: function() {
	    var sequence = this;
	    if (sequence._cache) {
	      return $Sequence(sequence._cache);
	    }
	    var entriesSequence = sequence.map(entryMapper).valueSeq();
	    entriesSequence.fromEntries = (function() {
	      return sequence;
	    });
	    return entriesSequence;
	  },
	  forEach: function(sideEffect, thisArg) {
	    return this.__iterate(thisArg ? sideEffect.bind(thisArg) : sideEffect);
	  },
	  reduce: function(reducer, initialReduction, thisArg) {
	    var reduction = initialReduction;
	    this.forEach((function(v, k, c) {
	      reduction = reducer.call(thisArg, reduction, v, k, c);
	    }));
	    return reduction;
	  },
	  reduceRight: function(reducer, initialReduction, thisArg) {
	    return this.reverse(true).reduce(reducer, initialReduction, thisArg);
	  },
	  every: function(predicate, thisArg) {
	    var returnValue = true;
	    this.forEach((function(v, k, c) {
	      if (!predicate.call(thisArg, v, k, c)) {
	        returnValue = false;
	        return false;
	      }
	    }));
	    return returnValue;
	  },
	  some: function(predicate, thisArg) {
	    return !this.every(not(predicate), thisArg);
	  },
	  first: function() {
	    return this.find(returnTrue);
	  },
	  last: function() {
	    return this.findLast(returnTrue);
	  },
	  rest: function() {
	    return this.slice(1);
	  },
	  butLast: function() {
	    return this.slice(0, -1);
	  },
	  has: function(searchKey) {
	    return this.get(searchKey, NOT_SET) !== NOT_SET;
	  },
	  get: function(searchKey, notSetValue) {
	    return this.find((function(_, key) {
	      return is(key, searchKey);
	    }), null, notSetValue);
	  },
	  getIn: function(searchKeyPath, notSetValue) {
	    if (!searchKeyPath || searchKeyPath.length === 0) {
	      return this;
	    }
	    return getInDeepSequence(this, searchKeyPath, notSetValue, 0);
	  },
	  contains: function(searchValue) {
	    return this.find((function(value) {
	      return is(value, searchValue);
	    }), null, NOT_SET) !== NOT_SET;
	  },
	  find: function(predicate, thisArg, notSetValue) {
	    var foundValue = notSetValue;
	    this.forEach((function(v, k, c) {
	      if (predicate.call(thisArg, v, k, c)) {
	        foundValue = v;
	        return false;
	      }
	    }));
	    return foundValue;
	  },
	  findKey: function(predicate, thisArg) {
	    var foundKey;
	    this.forEach((function(v, k, c) {
	      if (predicate.call(thisArg, v, k, c)) {
	        foundKey = k;
	        return false;
	      }
	    }));
	    return foundKey;
	  },
	  findLast: function(predicate, thisArg, notSetValue) {
	    return this.reverse(true).find(predicate, thisArg, notSetValue);
	  },
	  findLastKey: function(predicate, thisArg) {
	    return this.reverse(true).findKey(predicate, thisArg);
	  },
	  flip: function() {
	    var sequence = this;
	    var flipSequence = makeSequence();
	    flipSequence.length = sequence.length;
	    flipSequence.flip = (function() {
	      return sequence;
	    });
	    flipSequence.__iterateUncached = (function(fn, reverse) {
	      return sequence.__iterate((function(v, k, c) {
	        return fn(k, v, c) !== false;
	      }), reverse);
	    });
	    return flipSequence;
	  },
	  map: function(mapper, thisArg) {
	    var sequence = this;
	    var mappedSequence = sequence.__makeSequence();
	    mappedSequence.length = sequence.length;
	    mappedSequence.__iterateUncached = (function(fn, reverse) {
	      return sequence.__iterate((function(v, k, c) {
	        return fn(mapper.call(thisArg, v, k, c), k, c) !== false;
	      }), reverse);
	    });
	    return mappedSequence;
	  },
	  mapKeys: function(mapper, thisArg) {
	    var sequence = this;
	    var mappedSequence = sequence.__makeSequence();
	    mappedSequence.length = sequence.length;
	    mappedSequence.__iterateUncached = (function(fn, reverse) {
	      return sequence.__iterate((function(v, k, c) {
	        return fn(v, mapper.call(thisArg, k, v, c), c) !== false;
	      }), reverse);
	    });
	    return mappedSequence;
	  },
	  filter: function(predicate, thisArg) {
	    return filterFactory(this, predicate, thisArg, true, false);
	  },
	  slice: function(begin, end) {
	    if (wholeSlice(begin, end, this.length)) {
	      return this;
	    }
	    var resolvedBegin = resolveBegin(begin, this.length);
	    var resolvedEnd = resolveEnd(end, this.length);
	    if (resolvedBegin !== resolvedBegin || resolvedEnd !== resolvedEnd) {
	      return this.entrySeq().slice(begin, end).fromEntrySeq();
	    }
	    var skipped = resolvedBegin === 0 ? this : this.skip(resolvedBegin);
	    return resolvedEnd == null || resolvedEnd === this.length ? skipped : skipped.take(resolvedEnd - resolvedBegin);
	  },
	  take: function(amount) {
	    var sequence = this;
	    if (amount > sequence.length) {
	      return sequence;
	    }
	    var takeSequence = sequence.__makeSequence();
	    takeSequence.__iterateUncached = function(fn, reverse, flipIndices) {
	      if (reverse) {
	        return this.cacheResult().__iterate(fn, reverse, flipIndices);
	      }
	      var iterations = 0;
	      sequence.__iterate((function(v, k, c) {
	        if (iterations < amount && fn(v, k, c) !== false) {
	          iterations++;
	        } else {
	          return false;
	        }
	      }), reverse, flipIndices);
	      return iterations;
	    };
	    takeSequence.length = this.length && Math.min(this.length, amount);
	    return takeSequence;
	  },
	  takeLast: function(amount, maintainIndices) {
	    return this.reverse(maintainIndices).take(amount).reverse(maintainIndices);
	  },
	  takeWhile: function(predicate, thisArg) {
	    var sequence = this;
	    var takeSequence = sequence.__makeSequence();
	    takeSequence.__iterateUncached = function(fn, reverse, flipIndices) {
	      if (reverse) {
	        return this.cacheResult().__iterate(fn, reverse, flipIndices);
	      }
	      var iterations = 0;
	      sequence.__iterate((function(v, k, c) {
	        if (predicate.call(thisArg, v, k, c) && fn(v, k, c) !== false) {
	          iterations++;
	        } else {
	          return false;
	        }
	      }), reverse, flipIndices);
	      return iterations;
	    };
	    return takeSequence;
	  },
	  takeUntil: function(predicate, thisArg, maintainIndices) {
	    return this.takeWhile(not(predicate), thisArg, maintainIndices);
	  },
	  skip: function(amount, maintainIndices) {
	    var sequence = this;
	    if (amount === 0) {
	      return sequence;
	    }
	    var skipSequence = sequence.__makeSequence();
	    skipSequence.__iterateUncached = function(fn, reverse, flipIndices) {
	      if (reverse) {
	        return this.cacheResult().__iterate(fn, reverse, flipIndices);
	      }
	      var isSkipping = true;
	      var iterations = 0;
	      var skipped = 0;
	      sequence.__iterate((function(v, k, c) {
	        if (!(isSkipping && (isSkipping = skipped++ < amount))) {
	          if (fn(v, k, c) !== false) {
	            iterations++;
	          } else {
	            return false;
	          }
	        }
	      }), reverse, flipIndices);
	      return iterations;
	    };
	    skipSequence.length = this.length && Math.max(0, this.length - amount);
	    return skipSequence;
	  },
	  skipLast: function(amount, maintainIndices) {
	    return this.reverse(maintainIndices).skip(amount).reverse(maintainIndices);
	  },
	  skipWhile: function(predicate, thisArg, maintainIndices) {
	    var sequence = this;
	    var skipSequence = sequence.__makeSequence();
	    skipSequence.__iterateUncached = function(fn, reverse, flipIndices) {
	      if (reverse) {
	        return this.cacheResult().__iterate(fn, reverse, flipIndices);
	      }
	      var isSkipping = true;
	      var iterations = 0;
	      sequence.__iterate((function(v, k, c) {
	        if (!(isSkipping && (isSkipping = predicate.call(thisArg, v, k, c)))) {
	          if (fn(v, k, c) !== false) {
	            iterations++;
	          } else {
	            return false;
	          }
	        }
	      }), reverse, flipIndices);
	      return iterations;
	    };
	    return skipSequence;
	  },
	  skipUntil: function(predicate, thisArg, maintainIndices) {
	    return this.skipWhile(not(predicate), thisArg, maintainIndices);
	  },
	  groupBy: function(mapper, context) {
	    var seq = this;
	    var groups = OrderedMap.empty().withMutations((function(map) {
	      seq.forEach((function(value, key, collection) {
	        var groupKey = mapper(value, key, collection);
	        var group = map.get(groupKey, NOT_SET);
	        if (group === NOT_SET) {
	          group = [];
	          map.set(groupKey, group);
	        }
	        group.push([key, value]);
	      }));
	    }));
	    return groups.map((function(group) {
	      return $Sequence(group).fromEntrySeq();
	    }));
	  },
	  sort: function(comparator, maintainIndices) {
	    return this.sortBy(valueMapper, comparator, maintainIndices);
	  },
	  sortBy: function(mapper, comparator, maintainIndices) {
	    comparator = comparator || defaultComparator;
	    var seq = this;
	    return $Sequence(this.entrySeq().entrySeq().toArray().sort((function(indexedEntryA, indexedEntryB) {
	      return comparator(mapper(indexedEntryA[1][1], indexedEntryA[1][0], seq), mapper(indexedEntryB[1][1], indexedEntryB[1][0], seq)) || indexedEntryA[0] - indexedEntryB[0];
	    }))).fromEntrySeq().valueSeq().fromEntrySeq();
	  },
	  cacheResult: function() {
	    if (!this._cache && this.__iterateUncached) {
	      assertNotInfinite(this.length);
	      this._cache = this.entrySeq().toArray();
	      if (this.length == null) {
	        this.length = this._cache.length;
	      }
	    }
	    return this;
	  },
	  __iterate: function(fn, reverse, flipIndices) {
	    if (!this._cache) {
	      return this.__iterateUncached(fn, reverse, flipIndices);
	    }
	    var maxIndex = this.length - 1;
	    var cache = this._cache;
	    var c = this;
	    if (reverse) {
	      for (var ii = cache.length - 1; ii >= 0; ii--) {
	        var revEntry = cache[ii];
	        if (fn(revEntry[1], flipIndices ? revEntry[0] : maxIndex - revEntry[0], c) === false) {
	          break;
	        }
	      }
	    } else {
	      cache.every(flipIndices ? (function(entry) {
	        return fn(entry[1], maxIndex - entry[0], c) !== false;
	      }) : (function(entry) {
	        return fn(entry[1], entry[0], c) !== false;
	      }));
	    }
	    return this.length;
	  },
	  __makeSequence: function() {
	    return makeSequence();
	  }
	}, {from: function(value) {
	    if (value instanceof $Sequence) {
	      return value;
	    }
	    if (!Array.isArray(value)) {
	      if (value && value.constructor === Object) {
	        return new ObjectSequence(value);
	      }
	      value = [value];
	    }
	    return new ArraySequence(value);
	  }});
	var SequencePrototype = Sequence.prototype;
	SequencePrototype.toJSON = SequencePrototype.toJS;
	SequencePrototype.__toJS = SequencePrototype.toObject;
	SequencePrototype.inspect = SequencePrototype.toSource = function() {
	  return this.toString();
	};
	var IndexedSequence = function IndexedSequence() {
	  $traceurRuntime.defaultSuperCall(this, $IndexedSequence.prototype, arguments);
	};
	var $IndexedSequence = IndexedSequence;
	($traceurRuntime.createClass)(IndexedSequence, {
	  toString: function() {
	    return this.__toString('Seq [', ']');
	  },
	  toArray: function() {
	    assertNotInfinite(this.length);
	    var array = new Array(this.length || 0);
	    array.length = this.forEach((function(v, i) {
	      array[i] = v;
	    }));
	    return array;
	  },
	  fromEntrySeq: function() {
	    var sequence = this;
	    var fromEntriesSequence = makeSequence();
	    fromEntriesSequence.length = sequence.length;
	    fromEntriesSequence.entrySeq = (function() {
	      return sequence;
	    });
	    fromEntriesSequence.__iterateUncached = (function(fn, reverse, flipIndices) {
	      return sequence.__iterate((function(entry, _, c) {
	        return fn(entry[1], entry[0], c);
	      }), reverse, flipIndices);
	    });
	    return fromEntriesSequence;
	  },
	  join: function(separator) {
	    separator = separator || ',';
	    var string = '';
	    var prevIndex = 0;
	    this.forEach((function(v, i) {
	      var numSeparators = i - prevIndex;
	      prevIndex = i;
	      string += (numSeparators === 1 ? separator : repeatString(separator, numSeparators)) + v;
	    }));
	    if (this.length && prevIndex < this.length - 1) {
	      string += repeatString(separator, this.length - 1 - prevIndex);
	    }
	    return string;
	  },
	  concat: function() {
	    for (var values = [],
	        $__2 = 0; $__2 < arguments.length; $__2++)
	      values[$__2] = arguments[$__2];
	    var sequences = [this].concat(values).map((function(value) {
	      return Sequence(value);
	    }));
	    var concatSequence = this.__makeSequence();
	    concatSequence.length = sequences.reduce((function(sum, seq) {
	      return sum != null && seq.length != null ? sum + seq.length : undefined;
	    }), 0);
	    concatSequence.__iterateUncached = function(fn, reverse, flipIndices) {
	      if (flipIndices && !this.length) {
	        return this.cacheResult().__iterate(fn, reverse, flipIndices);
	      }
	      var iterations = 0;
	      var stoppedIteration;
	      var maxIndex = flipIndices && this.length - 1;
	      var maxSequencesIndex = sequences.length - 1;
	      for (var ii = 0; ii <= maxSequencesIndex && !stoppedIteration; ii++) {
	        var sequence = sequences[reverse ? maxSequencesIndex - ii : ii];
	        if (!(sequence instanceof $IndexedSequence)) {
	          sequence = sequence.valueSeq();
	        }
	        iterations += sequence.__iterate((function(v, index, c) {
	          index += iterations;
	          if (fn(v, flipIndices ? maxIndex - index : index, c) === false) {
	            stoppedIteration = true;
	            return false;
	          }
	        }), reverse);
	      }
	      return iterations;
	    };
	    return concatSequence;
	  },
	  reverse: function(maintainIndices) {
	    var sequence = this;
	    var reversedSequence = sequence.__makeSequence();
	    reversedSequence.length = sequence.length;
	    reversedSequence.__reversedIndices = !!(maintainIndices ^ sequence.__reversedIndices);
	    reversedSequence.__iterateUncached = (function(fn, reverse, flipIndices) {
	      return sequence.__iterate(fn, !reverse, flipIndices ^ maintainIndices);
	    });
	    reversedSequence.reverse = function(_maintainIndices) {
	      return maintainIndices === _maintainIndices ? sequence : IndexedSequencePrototype.reverse.call(this, _maintainIndices);
	    };
	    return reversedSequence;
	  },
	  valueSeq: function() {
	    var valuesSequence = $traceurRuntime.superCall(this, $IndexedSequence.prototype, "valueSeq", []);
	    valuesSequence.length = undefined;
	    return valuesSequence;
	  },
	  filter: function(predicate, thisArg, maintainIndices) {
	    var filterSequence = filterFactory(this, predicate, thisArg, maintainIndices, maintainIndices);
	    if (maintainIndices) {
	      filterSequence.length = this.length;
	    }
	    return filterSequence;
	  },
	  indexOf: function(searchValue) {
	    return this.findIndex((function(value) {
	      return is(value, searchValue);
	    }));
	  },
	  lastIndexOf: function(searchValue) {
	    return this.reverse(true).indexOf(searchValue);
	  },
	  findIndex: function(predicate, thisArg) {
	    var key = this.findKey(predicate, thisArg);
	    return key == null ? -1 : key;
	  },
	  findLastIndex: function(predicate, thisArg) {
	    return this.reverse(true).findIndex(predicate, thisArg);
	  },
	  slice: function(begin, end, maintainIndices) {
	    var sequence = this;
	    if (wholeSlice(begin, end, sequence.length)) {
	      return sequence;
	    }
	    var sliceSequence = sequence.__makeSequence();
	    var resolvedBegin = resolveBegin(begin, sequence.length);
	    var resolvedEnd = resolveEnd(end, sequence.length);
	    sliceSequence.length = sequence.length && (maintainIndices ? sequence.length : resolvedEnd - resolvedBegin);
	    sliceSequence.__reversedIndices = sequence.__reversedIndices;
	    sliceSequence.__iterateUncached = function(fn, reverse, flipIndices) {
	      if (reverse) {
	        return this.cacheResult().__iterate(fn, reverse, flipIndices);
	      }
	      var reversedIndices = this.__reversedIndices ^ flipIndices;
	      if (resolvedBegin !== resolvedBegin || resolvedEnd !== resolvedEnd || (reversedIndices && sequence.length == null)) {
	        var exactLength = sequence.count();
	        resolvedBegin = resolveBegin(begin, exactLength);
	        resolvedEnd = resolveEnd(end, exactLength);
	      }
	      var iiBegin = reversedIndices ? sequence.length - resolvedEnd : resolvedBegin;
	      var iiEnd = reversedIndices ? sequence.length - resolvedBegin : resolvedEnd;
	      var lengthIterated = sequence.__iterate((function(v, ii, c) {
	        return reversedIndices ? (iiEnd != null && ii >= iiEnd) || (ii >= iiBegin) && fn(v, maintainIndices ? ii : ii - iiBegin, c) !== false : (ii < iiBegin) || (iiEnd == null || ii < iiEnd) && fn(v, maintainIndices ? ii : ii - iiBegin, c) !== false;
	      }), reverse, flipIndices);
	      return this.length != null ? this.length : maintainIndices ? lengthIterated : Math.max(0, lengthIterated - iiBegin);
	    };
	    return sliceSequence;
	  },
	  splice: function(index, removeNum) {
	    var numArgs = arguments.length;
	    removeNum = Math.max(removeNum | 0, 0);
	    if (numArgs === 0 || (numArgs === 2 && !removeNum)) {
	      return this;
	    }
	    index = resolveBegin(index, this.length);
	    var spliced = this.slice(0, index);
	    return numArgs === 1 ? spliced : spliced.concat(arrCopy(arguments, 2), this.slice(index + removeNum));
	  },
	  take: function(amount) {
	    var sequence = this;
	    if (amount > sequence.length) {
	      return sequence;
	    }
	    var takeSequence = sequence.__makeSequence();
	    takeSequence.__iterateUncached = function(fn, reverse, flipIndices) {
	      if (reverse) {
	        return this.cacheResult().__iterate(fn, reverse, flipIndices);
	      }
	      var taken = 0;
	      var iterations = 0;
	      var didFinish = true;
	      var length = sequence.__iterate((function(v, ii, c) {
	        if (taken++ < amount && fn(v, ii, c) !== false) {
	          iterations = ii;
	        } else {
	          didFinish = false;
	          return false;
	        }
	      }), reverse, flipIndices);
	      return didFinish ? length : iterations + 1;
	    };
	    takeSequence.length = this.length && Math.min(this.length, amount);
	    return takeSequence;
	  },
	  takeWhile: function(predicate, thisArg, maintainIndices) {
	    var sequence = this;
	    var takeSequence = sequence.__makeSequence();
	    takeSequence.__iterateUncached = function(fn, reverse, flipIndices) {
	      if (reverse) {
	        return this.cacheResult().__iterate(fn, reverse, flipIndices);
	      }
	      var iterations = 0;
	      var didFinish = true;
	      var length = sequence.__iterate((function(v, ii, c) {
	        if (predicate.call(thisArg, v, ii, c) && fn(v, ii, c) !== false) {
	          iterations = ii;
	        } else {
	          didFinish = false;
	          return false;
	        }
	      }), reverse, flipIndices);
	      return maintainIndices ? takeSequence.length : didFinish ? length : iterations + 1;
	    };
	    if (maintainIndices) {
	      takeSequence.length = this.length;
	    }
	    return takeSequence;
	  },
	  skip: function(amount, maintainIndices) {
	    var sequence = this;
	    if (amount === 0) {
	      return sequence;
	    }
	    var skipSequence = sequence.__makeSequence();
	    if (maintainIndices) {
	      skipSequence.length = this.length;
	    }
	    skipSequence.__iterateUncached = function(fn, reverse, flipIndices) {
	      if (reverse) {
	        return this.cacheResult().__iterate(fn, reverse, flipIndices);
	      }
	      var reversedIndices = sequence.__reversedIndices ^ flipIndices;
	      var isSkipping = true;
	      var indexOffset = 0;
	      var skipped = 0;
	      var length = sequence.__iterate((function(v, ii, c) {
	        if (isSkipping) {
	          isSkipping = skipped++ < amount;
	          if (!isSkipping) {
	            indexOffset = ii;
	          }
	        }
	        return isSkipping || fn(v, flipIndices || maintainIndices ? ii : ii - indexOffset, c) !== false;
	      }), reverse, flipIndices);
	      return maintainIndices ? length : reversedIndices ? indexOffset + 1 : length - indexOffset;
	    };
	    skipSequence.length = this.length && Math.max(0, this.length - amount);
	    return skipSequence;
	  },
	  skipWhile: function(predicate, thisArg, maintainIndices) {
	    var sequence = this;
	    var skipWhileSequence = sequence.__makeSequence();
	    if (maintainIndices) {
	      skipWhileSequence.length = this.length;
	    }
	    skipWhileSequence.__iterateUncached = function(fn, reverse, flipIndices) {
	      if (reverse) {
	        return this.cacheResult().__iterate(fn, reverse, flipIndices);
	      }
	      var reversedIndices = sequence.__reversedIndices ^ flipIndices;
	      var isSkipping = true;
	      var indexOffset = 0;
	      var length = sequence.__iterate((function(v, ii, c) {
	        if (isSkipping) {
	          isSkipping = predicate.call(thisArg, v, ii, c);
	          if (!isSkipping) {
	            indexOffset = ii;
	          }
	        }
	        return isSkipping || fn(v, flipIndices || maintainIndices ? ii : ii - indexOffset, c) !== false;
	      }), reverse, flipIndices);
	      return maintainIndices ? length : reversedIndices ? indexOffset + 1 : length - indexOffset;
	    };
	    return skipWhileSequence;
	  },
	  groupBy: function(mapper, context, maintainIndices) {
	    var seq = this;
	    var groups = OrderedMap.empty().withMutations((function(map) {
	      seq.forEach((function(value, index, collection) {
	        var groupKey = mapper(value, index, collection);
	        var group = map.get(groupKey, NOT_SET);
	        if (group === NOT_SET) {
	          group = new Array(maintainIndices ? seq.length : 0);
	          map.set(groupKey, group);
	        }
	        maintainIndices ? (group[index] = value) : group.push(value);
	      }));
	    }));
	    return groups.map((function(group) {
	      return Sequence(group);
	    }));
	  },
	  sortBy: function(mapper, comparator, maintainIndices) {
	    var sortedSeq = $traceurRuntime.superCall(this, $IndexedSequence.prototype, "sortBy", [mapper, comparator]);
	    if (!maintainIndices) {
	      sortedSeq = sortedSeq.valueSeq();
	    }
	    sortedSeq.length = this.length;
	    return sortedSeq;
	  },
	  __makeSequence: function() {
	    return makeIndexedSequence(this);
	  }
	}, {}, Sequence);
	var IndexedSequencePrototype = IndexedSequence.prototype;
	IndexedSequencePrototype.__toJS = IndexedSequencePrototype.toArray;
	IndexedSequencePrototype.__toStringMapper = quoteString;
	var ObjectSequence = function ObjectSequence(object) {
	  var keys = Object.keys(object);
	  this._object = object;
	  this._keys = keys;
	  this.length = keys.length;
	};
	($traceurRuntime.createClass)(ObjectSequence, {
	  toObject: function() {
	    return this._object;
	  },
	  get: function(key, notSetValue) {
	    if (notSetValue !== undefined && !this.has(key)) {
	      return notSetValue;
	    }
	    return this._object[key];
	  },
	  has: function(key) {
	    return this._object.hasOwnProperty(key);
	  },
	  __iterate: function(fn, reverse) {
	    var object = this._object;
	    var keys = this._keys;
	    var maxIndex = keys.length - 1;
	    for (var ii = 0; ii <= maxIndex; ii++) {
	      var iteration = reverse ? maxIndex - ii : ii;
	      if (fn(object[keys[iteration]], keys[iteration], object) === false) {
	        break;
	      }
	    }
	    return ii;
	  }
	}, {}, Sequence);
	var ArraySequence = function ArraySequence(array) {
	  this._array = array;
	  this.length = array.length;
	};
	($traceurRuntime.createClass)(ArraySequence, {
	  toArray: function() {
	    return this._array;
	  },
	  __iterate: function(fn, reverse, flipIndices) {
	    var array = this._array;
	    var maxIndex = array.length - 1;
	    var lastIndex = -1;
	    if (reverse) {
	      for (var ii = maxIndex; ii >= 0; ii--) {
	        if (array.hasOwnProperty(ii) && fn(array[ii], flipIndices ? ii : maxIndex - ii, array) === false) {
	          return lastIndex + 1;
	        }
	        lastIndex = ii;
	      }
	      return array.length;
	    } else {
	      var didFinish = array.every((function(value, index) {
	        if (fn(value, flipIndices ? maxIndex - index : index, array) === false) {
	          return false;
	        } else {
	          lastIndex = index;
	          return true;
	        }
	      }));
	      return didFinish ? array.length : lastIndex + 1;
	    }
	  }
	}, {}, IndexedSequence);
	ArraySequence.prototype.get = ObjectSequence.prototype.get;
	ArraySequence.prototype.has = ObjectSequence.prototype.has;
	var SequenceIterator = function SequenceIterator() {};
	($traceurRuntime.createClass)(SequenceIterator, {toString: function() {
	    return '[Iterator]';
	  }}, {});
	var SequenceIteratorPrototype = SequenceIterator.prototype;
	SequenceIteratorPrototype[ITERATOR] = returnThis;
	SequenceIteratorPrototype.inspect = SequenceIteratorPrototype.toSource = function() {
	  return this.toString();
	};
	function makeSequence() {
	  return Object.create(SequencePrototype);
	}
	function makeIndexedSequence(parent) {
	  var newSequence = Object.create(IndexedSequencePrototype);
	  newSequence.__reversedIndices = parent ? parent.__reversedIndices : false;
	  return newSequence;
	}
	function getInDeepSequence(seq, keyPath, notSetValue, pathOffset) {
	  var nested = seq.get ? seq.get(keyPath[pathOffset], NOT_SET) : NOT_SET;
	  if (nested === NOT_SET) {
	    return notSetValue;
	  }
	  if (++pathOffset === keyPath.length) {
	    return nested;
	  }
	  return getInDeepSequence(nested, keyPath, notSetValue, pathOffset);
	}
	function wholeSlice(begin, end, length) {
	  return (begin === 0 || (length != null && begin <= -length)) && (end == null || (length != null && end >= length));
	}
	function resolveBegin(begin, length) {
	  return resolveIndex(begin, length, 0);
	}
	function resolveEnd(end, length) {
	  return resolveIndex(end, length, length);
	}
	function resolveIndex(index, length, defaultIndex) {
	  return index == null ? defaultIndex : index < 0 ? Math.max(0, length + index) : length ? Math.min(length, index) : index;
	}
	function valueMapper(v) {
	  return v;
	}
	function entryMapper(v, k) {
	  return [k, v];
	}
	function returnTrue() {
	  return true;
	}
	function returnThis() {
	  return this;
	}
	function increment(value) {
	  return (value || 0) + 1;
	}
	function filterFactory(sequence, predicate, thisArg, useKeys, maintainIndices) {
	  var filterSequence = sequence.__makeSequence();
	  filterSequence.__iterateUncached = (function(fn, reverse, flipIndices) {
	    var iterations = 0;
	    var length = sequence.__iterate((function(v, k, c) {
	      if (predicate.call(thisArg, v, k, c)) {
	        if (fn(v, useKeys ? k : iterations, c) !== false) {
	          iterations++;
	        } else {
	          return false;
	        }
	      }
	    }), reverse, flipIndices);
	    return maintainIndices ? length : iterations;
	  });
	  return filterSequence;
	}
	function not(predicate) {
	  return function() {
	    return !predicate.apply(this, arguments);
	  };
	}
	function quoteString(value) {
	  return typeof value === 'string' ? JSON.stringify(value) : value;
	}
	function repeatString(string, times) {
	  var repeated = '';
	  while (times) {
	    if (times & 1) {
	      repeated += string;
	    }
	    if ((times >>= 1)) {
	      string += string;
	    }
	  }
	  return repeated;
	}
	function defaultComparator(a, b) {
	  return a > b ? 1 : a < b ? -1 : 0;
	}
	function assertNotInfinite(length) {
	  invariant(length !== Infinity, 'Cannot perform this action with an infinite sequence.');
	}
	function iteratorMapper(iter, fn) {
	  var newIter = new SequenceIterator();
	  newIter.next = (function() {
	    var step = iter.next();
	    if (step.done)
	      return step;
	    step.value = fn(step.value);
	    return step;
	  });
	  return newIter;
	}
	var Cursor = function Cursor(rootData, keyPath, onChange, value) {
	  value = value ? value : rootData.getIn(keyPath);
	  this.length = value instanceof Sequence ? value.length : null;
	  this._rootData = rootData;
	  this._keyPath = keyPath;
	  this._onChange = onChange;
	};
	($traceurRuntime.createClass)(Cursor, {
	  deref: function(notSetValue) {
	    return this._rootData.getIn(this._keyPath, notSetValue);
	  },
	  get: function(key, notSetValue) {
	    if (Array.isArray(key) && key.length === 0) {
	      return this;
	    }
	    var value = this._rootData.getIn(this._keyPath.concat(key), NOT_SET);
	    return value === NOT_SET ? notSetValue : wrappedValue(this, key, value);
	  },
	  set: function(key, value) {
	    return updateCursor(this, (function(m) {
	      return m.set(key, value);
	    }), key);
	  },
	  remove: function(key) {
	    return updateCursor(this, (function(m) {
	      return m.remove(key);
	    }), key);
	  },
	  clear: function() {
	    return updateCursor(this, (function(m) {
	      return m.clear();
	    }));
	  },
	  update: function(keyOrFn, notSetValue, updater) {
	    return arguments.length === 1 ? updateCursor(this, keyOrFn) : updateCursor(this, (function(map) {
	      return map.update(keyOrFn, notSetValue, updater);
	    }), keyOrFn);
	  },
	  withMutations: function(fn) {
	    return updateCursor(this, (function(m) {
	      return (m || Map.empty()).withMutations(fn);
	    }));
	  },
	  cursor: function(subKey) {
	    return Array.isArray(subKey) && subKey.length === 0 ? this : subCursor(this, subKey);
	  },
	  __iterate: function(fn, reverse, flipIndices) {
	    var cursor = this;
	    var deref = cursor.deref();
	    return deref && deref.__iterate ? deref.__iterate((function(value, key, collection) {
	      return fn(wrappedValue(cursor, key, value), key, collection);
	    }), reverse, flipIndices) : 0;
	  }
	}, {}, Sequence);
	Cursor.prototype[DELETE] = Cursor.prototype.remove;
	Cursor.prototype.getIn = Cursor.prototype.get;
	function wrappedValue(cursor, key, value) {
	  return value instanceof Sequence ? subCursor(cursor, key, value) : value;
	}
	function subCursor(cursor, key, value) {
	  return new Cursor(cursor._rootData, cursor._keyPath.concat(key), cursor._onChange, value);
	}
	function updateCursor(cursor, changeFn, changeKey) {
	  var newRootData = cursor._rootData.updateIn(cursor._keyPath, changeKey ? Map.empty() : undefined, changeFn);
	  var keyPath = cursor._keyPath || [];
	  cursor._onChange && cursor._onChange.call(undefined, newRootData, cursor._rootData, changeKey ? keyPath.concat(changeKey) : keyPath);
	  return new Cursor(newRootData, cursor._keyPath, cursor._onChange);
	}
	function is(first, second) {
	  if (first instanceof Cursor) {
	    first = first.deref();
	  }
	  if (second instanceof Cursor) {
	    second = second.deref();
	  }
	  if (first === second) {
	    return first !== 0 || second !== 0 || 1 / first === 1 / second;
	  }
	  if (first !== first) {
	    return second !== second;
	  }
	  if (first instanceof Sequence) {
	    return first.equals(second);
	  }
	  return false;
	}
	var Map = function Map(sequence) {
	  var map = $Map.empty();
	  return sequence ? sequence.constructor === $Map ? sequence : map.merge(sequence) : map;
	};
	var $Map = Map;
	($traceurRuntime.createClass)(Map, {
	  toString: function() {
	    return this.__toString('Map {', '}');
	  },
	  get: function(k, notSetValue) {
	    return this._root ? this._root.get(0, hash(k), k, notSetValue) : notSetValue;
	  },
	  set: function(k, v) {
	    return updateMap(this, k, v);
	  },
	  remove: function(k) {
	    return updateMap(this, k, NOT_SET);
	  },
	  update: function(k, notSetValue, updater) {
	    return arguments.length === 1 ? this.updateIn([], null, k) : this.updateIn([k], notSetValue, updater);
	  },
	  updateIn: function(keyPath, notSetValue, updater) {
	    var $__12;
	    if (!updater) {
	      ($__12 = [notSetValue, updater], updater = $__12[0], notSetValue = $__12[1], $__12);
	    }
	    return updateInDeepMap(this, keyPath, notSetValue, updater, 0);
	  },
	  clear: function() {
	    if (this.length === 0) {
	      return this;
	    }
	    if (this.__ownerID) {
	      this.length = 0;
	      this._root = null;
	      this.__hash = undefined;
	      this.__altered = true;
	      return this;
	    }
	    return $Map.empty();
	  },
	  merge: function() {
	    return mergeIntoMapWith(this, null, arguments);
	  },
	  mergeWith: function(merger) {
	    for (var seqs = [],
	        $__3 = 1; $__3 < arguments.length; $__3++)
	      seqs[$__3 - 1] = arguments[$__3];
	    return mergeIntoMapWith(this, merger, seqs);
	  },
	  mergeDeep: function() {
	    return mergeIntoMapWith(this, deepMerger(null), arguments);
	  },
	  mergeDeepWith: function(merger) {
	    for (var seqs = [],
	        $__4 = 1; $__4 < arguments.length; $__4++)
	      seqs[$__4 - 1] = arguments[$__4];
	    return mergeIntoMapWith(this, deepMerger(merger), seqs);
	  },
	  cursor: function(keyPath, onChange) {
	    if (!onChange && typeof keyPath === 'function') {
	      onChange = keyPath;
	      keyPath = [];
	    } else if (arguments.length === 0) {
	      keyPath = [];
	    } else if (!Array.isArray(keyPath)) {
	      keyPath = [keyPath];
	    }
	    return new Cursor(this, keyPath, onChange);
	  },
	  withMutations: function(fn) {
	    var mutable = this.asMutable();
	    fn(mutable);
	    return mutable.wasAltered() ? mutable.__ensureOwner(this.__ownerID) : this;
	  },
	  asMutable: function() {
	    return this.__ownerID ? this : this.__ensureOwner(new OwnerID());
	  },
	  asImmutable: function() {
	    return this.__ensureOwner();
	  },
	  wasAltered: function() {
	    return this.__altered;
	  },
	  keys: function() {
	    return new MapIterator(this, 0);
	  },
	  values: function() {
	    return new MapIterator(this, 1);
	  },
	  entries: function() {
	    return new MapIterator(this, 2);
	  },
	  __iterator: function(reverse) {
	    return new MapIterator(this, 2, reverse);
	  },
	  __iterate: function(fn, reverse) {
	    var map = this;
	    if (!map._root) {
	      return 0;
	    }
	    var iterations = 0;
	    this._root.iterate((function(entry) {
	      if (fn(entry[1], entry[0], map) === false) {
	        return false;
	      }
	      iterations++;
	    }), reverse);
	    return iterations;
	  },
	  __deepEqual: function(other) {
	    var self = this;
	    return other.every((function(v, k) {
	      return is(self.get(k, NOT_SET), v);
	    }));
	  },
	  __ensureOwner: function(ownerID) {
	    if (ownerID === this.__ownerID) {
	      return this;
	    }
	    if (!ownerID) {
	      this.__ownerID = ownerID;
	      this.__altered = false;
	      return this;
	    }
	    return makeMap(this.length, this._root, ownerID, this.__hash);
	  }
	}, {empty: function() {
	    return EMPTY_MAP || (EMPTY_MAP = makeMap(0));
	  }}, Sequence);
	var MapPrototype = Map.prototype;
	MapPrototype[DELETE] = MapPrototype.remove;
	MapPrototype[ITERATOR] = function() {
	  return this.entries();
	};
	Map.from = Map;
	var BitmapIndexedNode = function BitmapIndexedNode(ownerID, bitmap, nodes) {
	  this.ownerID = ownerID;
	  this.bitmap = bitmap;
	  this.nodes = nodes;
	};
	var $BitmapIndexedNode = BitmapIndexedNode;
	($traceurRuntime.createClass)(BitmapIndexedNode, {
	  get: function(shift, hash, key, notSetValue) {
	    var bit = (1 << ((hash >>> shift) & MASK));
	    var bitmap = this.bitmap;
	    return (bitmap & bit) === 0 ? notSetValue : this.nodes[popCount(bitmap & (bit - 1))].get(shift + SHIFT, hash, key, notSetValue);
	  },
	  update: function(ownerID, shift, hash, key, value, didChangeLength, didAlter) {
	    var hashFrag = (hash >>> shift) & MASK;
	    var bit = 1 << hashFrag;
	    var bitmap = this.bitmap;
	    var exists = (bitmap & bit) !== 0;
	    if (!exists && value === NOT_SET) {
	      return this;
	    }
	    var idx = popCount(bitmap & (bit - 1));
	    var nodes = this.nodes;
	    var node = exists ? nodes[idx] : null;
	    var newNode = updateNode(node, ownerID, shift + SHIFT, hash, key, value, didChangeLength, didAlter);
	    if (newNode === node) {
	      return this;
	    }
	    if (!exists && newNode && nodes.length >= MAX_BITMAP_SIZE) {
	      return expandNodes(ownerID, nodes, bitmap, hashFrag, newNode);
	    }
	    if (exists && !newNode && nodes.length === 2 && isLeafNode(nodes[idx ^ 1])) {
	      return nodes[idx ^ 1];
	    }
	    if (exists && newNode && nodes.length === 1 && isLeafNode(newNode)) {
	      return newNode;
	    }
	    var isEditable = ownerID && ownerID === this.ownerID;
	    var newBitmap = exists ? newNode ? bitmap : bitmap ^ bit : bitmap | bit;
	    var newNodes = exists ? newNode ? setIn(nodes, idx, newNode, isEditable) : spliceOut(nodes, idx, isEditable) : spliceIn(nodes, idx, newNode, isEditable);
	    if (isEditable) {
	      this.bitmap = newBitmap;
	      this.nodes = newNodes;
	      return this;
	    }
	    return new $BitmapIndexedNode(ownerID, newBitmap, newNodes);
	  },
	  iterate: function(fn, reverse) {
	    var nodes = this.nodes;
	    for (var ii = 0,
	        maxIndex = nodes.length - 1; ii <= maxIndex; ii++) {
	      if (nodes[reverse ? maxIndex - ii : ii].iterate(fn, reverse) === false) {
	        return false;
	      }
	    }
	  }
	}, {});
	var ArrayNode = function ArrayNode(ownerID, count, nodes) {
	  this.ownerID = ownerID;
	  this.count = count;
	  this.nodes = nodes;
	};
	var $ArrayNode = ArrayNode;
	($traceurRuntime.createClass)(ArrayNode, {
	  get: function(shift, hash, key, notSetValue) {
	    var idx = (hash >>> shift) & MASK;
	    var node = this.nodes[idx];
	    return node ? node.get(shift + SHIFT, hash, key, notSetValue) : notSetValue;
	  },
	  update: function(ownerID, shift, hash, key, value, didChangeLength, didAlter) {
	    var idx = (hash >>> shift) & MASK;
	    var removed = value === NOT_SET;
	    var nodes = this.nodes;
	    var node = nodes[idx];
	    if (removed && !node) {
	      return this;
	    }
	    var newNode = updateNode(node, ownerID, shift + SHIFT, hash, key, value, didChangeLength, didAlter);
	    if (newNode === node) {
	      return this;
	    }
	    var newCount = this.count;
	    if (!node) {
	      newCount++;
	    } else if (!newNode) {
	      newCount--;
	      if (newCount < MIN_ARRAY_SIZE) {
	        return packNodes(ownerID, nodes, newCount, idx);
	      }
	    }
	    var isEditable = ownerID && ownerID === this.ownerID;
	    var newNodes = setIn(nodes, idx, newNode, isEditable);
	    if (isEditable) {
	      this.count = newCount;
	      this.nodes = newNodes;
	      return this;
	    }
	    return new $ArrayNode(ownerID, newCount, newNodes);
	  },
	  iterate: function(fn, reverse) {
	    var nodes = this.nodes;
	    for (var ii = 0,
	        maxIndex = nodes.length - 1; ii <= maxIndex; ii++) {
	      var node = nodes[reverse ? maxIndex - ii : ii];
	      if (node && node.iterate(fn, reverse) === false) {
	        return false;
	      }
	    }
	  }
	}, {});
	var HashCollisionNode = function HashCollisionNode(ownerID, hash, entries) {
	  this.ownerID = ownerID;
	  this.hash = hash;
	  this.entries = entries;
	};
	var $HashCollisionNode = HashCollisionNode;
	($traceurRuntime.createClass)(HashCollisionNode, {
	  get: function(shift, hash, key, notSetValue) {
	    var entries = this.entries;
	    for (var ii = 0,
	        len = entries.length; ii < len; ii++) {
	      if (is(key, entries[ii][0])) {
	        return entries[ii][1];
	      }
	    }
	    return notSetValue;
	  },
	  update: function(ownerID, shift, hash, key, value, didChangeLength, didAlter) {
	    var removed = value === NOT_SET;
	    if (hash !== this.hash) {
	      if (removed) {
	        return this;
	      }
	      SetRef(didAlter);
	      SetRef(didChangeLength);
	      return mergeIntoNode(this, ownerID, shift, hash, [key, value]);
	    }
	    var entries = this.entries;
	    var idx = 0;
	    for (var len = entries.length; idx < len; idx++) {
	      if (is(key, entries[idx][0])) {
	        break;
	      }
	    }
	    var exists = idx < len;
	    if (removed && !exists) {
	      return this;
	    }
	    SetRef(didAlter);
	    (removed || !exists) && SetRef(didChangeLength);
	    if (removed && len === 2) {
	      return new ValueNode(ownerID, this.hash, entries[idx ^ 1]);
	    }
	    var isEditable = ownerID && ownerID === this.ownerID;
	    var newEntries = isEditable ? entries : arrCopy(entries);
	    if (exists) {
	      if (removed) {
	        idx === len - 1 ? newEntries.pop() : (newEntries[idx] = newEntries.pop());
	      } else {
	        newEntries[idx] = [key, value];
	      }
	    } else {
	      newEntries.push([key, value]);
	    }
	    if (isEditable) {
	      this.entries = newEntries;
	      return this;
	    }
	    return new $HashCollisionNode(ownerID, this.hash, newEntries);
	  },
	  iterate: function(fn, reverse) {
	    var entries = this.entries;
	    for (var ii = 0,
	        maxIndex = entries.length - 1; ii <= maxIndex; ii++) {
	      if (fn(entries[reverse ? maxIndex - ii : ii]) === false) {
	        return false;
	      }
	    }
	  }
	}, {});
	var ValueNode = function ValueNode(ownerID, hash, entry) {
	  this.ownerID = ownerID;
	  this.hash = hash;
	  this.entry = entry;
	};
	var $ValueNode = ValueNode;
	($traceurRuntime.createClass)(ValueNode, {
	  get: function(shift, hash, key, notSetValue) {
	    return is(key, this.entry[0]) ? this.entry[1] : notSetValue;
	  },
	  update: function(ownerID, shift, hash, key, value, didChangeLength, didAlter) {
	    var removed = value === NOT_SET;
	    var keyMatch = is(key, this.entry[0]);
	    if (keyMatch ? value === this.entry[1] : removed) {
	      return this;
	    }
	    SetRef(didAlter);
	    if (removed) {
	      SetRef(didChangeLength);
	      return null;
	    }
	    if (keyMatch) {
	      if (ownerID && ownerID === this.ownerID) {
	        this.entry[1] = value;
	        return this;
	      }
	      return new $ValueNode(ownerID, hash, [key, value]);
	    }
	    SetRef(didChangeLength);
	    return mergeIntoNode(this, ownerID, shift, hash, [key, value]);
	  },
	  iterate: function(fn) {
	    return fn(this.entry);
	  }
	}, {});
	var MapIterator = function MapIterator(map, type, reverse) {
	  this._type = type;
	  this._reverse = reverse;
	  this._stack = map._root && mapIteratorFrame(map._root);
	};
	($traceurRuntime.createClass)(MapIterator, {next: function() {
	    var type = this._type;
	    var stack = this._stack;
	    while (stack) {
	      var node = stack.node;
	      var index = stack.index++;
	      var maxIndex;
	      if (node.entry) {
	        if (index === 0) {
	          return mapIteratorValue(type, node.entry);
	        }
	      } else if (node.entries) {
	        maxIndex = node.entries.length - 1;
	        if (index <= maxIndex) {
	          return mapIteratorValue(type, node.entries[this._reverse ? maxIndex - index : index]);
	        }
	      } else {
	        maxIndex = node.nodes.length - 1;
	        if (index <= maxIndex) {
	          var subNode = node.nodes[this._reverse ? maxIndex - index : index];
	          if (subNode) {
	            if (subNode.entry) {
	              return mapIteratorValue(type, subNode.entry);
	            }
	            stack = this._stack = mapIteratorFrame(subNode, stack);
	          }
	          continue;
	        }
	      }
	      stack = this._stack = this._stack.__prev;
	    }
	    return iteratorDone();
	  }}, {}, SequenceIterator);
	function mapIteratorValue(type, entry) {
	  return iteratorValue(type === 0 || type === 1 ? entry[type] : [entry[0], entry[1]]);
	}
	function mapIteratorFrame(node, prev) {
	  return {
	    node: node,
	    index: 0,
	    __prev: prev
	  };
	}
	function makeMap(length, root, ownerID, hash) {
	  var map = Object.create(MapPrototype);
	  map.length = length;
	  map._root = root;
	  map.__ownerID = ownerID;
	  map.__hash = hash;
	  map.__altered = false;
	  return map;
	}
	function updateMap(map, k, v) {
	  var didChangeLength = MakeRef(CHANGE_LENGTH);
	  var didAlter = MakeRef(DID_ALTER);
	  var newRoot = updateNode(map._root, map.__ownerID, 0, hash(k), k, v, didChangeLength, didAlter);
	  if (!didAlter.value) {
	    return map;
	  }
	  var newLength = map.length + (didChangeLength.value ? v === NOT_SET ? -1 : 1 : 0);
	  if (map.__ownerID) {
	    map.length = newLength;
	    map._root = newRoot;
	    map.__hash = undefined;
	    map.__altered = true;
	    return map;
	  }
	  return newRoot ? makeMap(newLength, newRoot) : Map.empty();
	}
	function updateNode(node, ownerID, shift, hash, key, value, didChangeLength, didAlter) {
	  if (!node) {
	    if (value === NOT_SET) {
	      return node;
	    }
	    SetRef(didAlter);
	    SetRef(didChangeLength);
	    return new ValueNode(ownerID, hash, [key, value]);
	  }
	  return node.update(ownerID, shift, hash, key, value, didChangeLength, didAlter);
	}
	function isLeafNode(node) {
	  return node.constructor === ValueNode || node.constructor === HashCollisionNode;
	}
	function mergeIntoNode(node, ownerID, shift, hash, entry) {
	  if (node.hash === hash) {
	    return new HashCollisionNode(ownerID, hash, [node.entry, entry]);
	  }
	  var idx1 = (node.hash >>> shift) & MASK;
	  var idx2 = (hash >>> shift) & MASK;
	  var newNode;
	  var nodes = idx1 === idx2 ? [mergeIntoNode(node, ownerID, shift + SHIFT, hash, entry)] : ((newNode = new ValueNode(ownerID, hash, entry)), idx1 < idx2 ? [node, newNode] : [newNode, node]);
	  return new BitmapIndexedNode(ownerID, (1 << idx1) | (1 << idx2), nodes);
	}
	function packNodes(ownerID, nodes, count, excluding) {
	  var bitmap = 0;
	  var packedII = 0;
	  var packedNodes = new Array(count);
	  for (var ii = 0,
	      bit = 1,
	      len = nodes.length; ii < len; ii++, bit <<= 1) {
	    var node = nodes[ii];
	    if (node != null && ii !== excluding) {
	      bitmap |= bit;
	      packedNodes[packedII++] = node;
	    }
	  }
	  return new BitmapIndexedNode(ownerID, bitmap, packedNodes);
	}
	function expandNodes(ownerID, nodes, bitmap, including, node) {
	  var count = 0;
	  var expandedNodes = new Array(SIZE);
	  for (var ii = 0; bitmap !== 0; ii++, bitmap >>>= 1) {
	    expandedNodes[ii] = bitmap & 1 ? nodes[count++] : null;
	  }
	  expandedNodes[including] = node;
	  return new ArrayNode(ownerID, count + 1, expandedNodes);
	}
	function mergeIntoMapWith(map, merger, iterables) {
	  var seqs = [];
	  for (var ii = 0; ii < iterables.length; ii++) {
	    var seq = iterables[ii];
	    seq && seqs.push(Array.isArray(seq) ? Sequence(seq).fromEntrySeq() : Sequence(seq));
	  }
	  return mergeIntoCollectionWith(map, merger, seqs);
	}
	function deepMerger(merger) {
	  return (function(existing, value) {
	    return existing && existing.mergeDeepWith ? existing.mergeDeepWith(merger, value) : merger ? merger(existing, value) : value;
	  });
	}
	function mergeIntoCollectionWith(collection, merger, seqs) {
	  if (seqs.length === 0) {
	    return collection;
	  }
	  return collection.withMutations((function(collection) {
	    var mergeIntoMap = merger ? (function(value, key) {
	      var existing = collection.get(key, NOT_SET);
	      collection.set(key, existing === NOT_SET ? value : merger(existing, value));
	    }) : (function(value, key) {
	      collection.set(key, value);
	    });
	    for (var ii = 0; ii < seqs.length; ii++) {
	      seqs[ii].forEach(mergeIntoMap);
	    }
	  }));
	}
	function updateInDeepMap(collection, keyPath, notSetValue, updater, pathOffset) {
	  var pathLen = keyPath.length;
	  if (pathOffset === pathLen) {
	    return updater(collection);
	  }
	  invariant(collection.set, 'updateIn with invalid keyPath');
	  var notSet = pathOffset === pathLen - 1 ? notSetValue : Map.empty();
	  var key = keyPath[pathOffset];
	  var existing = collection.get(key, notSet);
	  var value = updateInDeepMap(existing, keyPath, notSetValue, updater, pathOffset + 1);
	  return value === existing ? collection : collection.set(key, value);
	}
	function popCount(x) {
	  x = x - ((x >> 1) & 0x55555555);
	  x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
	  x = (x + (x >> 4)) & 0x0f0f0f0f;
	  x = x + (x >> 8);
	  x = x + (x >> 16);
	  return x & 0x7f;
	}
	function setIn(array, idx, val, canEdit) {
	  var newArray = canEdit ? array : arrCopy(array);
	  newArray[idx] = val;
	  return newArray;
	}
	function spliceIn(array, idx, val, canEdit) {
	  var newLen = array.length + 1;
	  if (canEdit && idx + 1 === newLen) {
	    array[idx] = val;
	    return array;
	  }
	  var newArray = new Array(newLen);
	  var after = 0;
	  for (var ii = 0; ii < newLen; ii++) {
	    if (ii === idx) {
	      newArray[ii] = val;
	      after = -1;
	    } else {
	      newArray[ii] = array[ii + after];
	    }
	  }
	  return newArray;
	}
	function spliceOut(array, idx, canEdit) {
	  var newLen = array.length - 1;
	  if (canEdit && idx === newLen) {
	    array.pop();
	    return array;
	  }
	  var newArray = new Array(newLen);
	  var after = 0;
	  for (var ii = 0; ii < newLen; ii++) {
	    if (ii === idx) {
	      after = 1;
	    }
	    newArray[ii] = array[ii + after];
	  }
	  return newArray;
	}
	var MAX_BITMAP_SIZE = SIZE / 2;
	var MIN_ARRAY_SIZE = SIZE / 4;
	var EMPTY_MAP;
	var Vector = function Vector() {
	  for (var values = [],
	      $__5 = 0; $__5 < arguments.length; $__5++)
	    values[$__5] = arguments[$__5];
	  return $Vector.from(values);
	};
	var $Vector = Vector;
	($traceurRuntime.createClass)(Vector, {
	  toString: function() {
	    return this.__toString('Vector [', ']');
	  },
	  get: function(index, notSetValue) {
	    index = rawIndex(index, this._origin);
	    if (index >= this._size) {
	      return notSetValue;
	    }
	    var node = vectorNodeFor(this, index);
	    var maskedIndex = index & MASK;
	    return node && (notSetValue === undefined || node.array.hasOwnProperty(maskedIndex)) ? node.array[maskedIndex] : notSetValue;
	  },
	  first: function() {
	    return this.get(0);
	  },
	  last: function() {
	    return this.get(this.length ? this.length - 1 : 0);
	  },
	  set: function(index, value) {
	    return updateVector(this, index, value);
	  },
	  remove: function(index) {
	    return updateVector(this, index, NOT_SET);
	  },
	  clear: function() {
	    if (this.length === 0) {
	      return this;
	    }
	    if (this.__ownerID) {
	      this.length = this._origin = this._size = 0;
	      this._level = SHIFT;
	      this._root = this._tail = null;
	      this.__hash = undefined;
	      this.__altered = true;
	      return this;
	    }
	    return $Vector.empty();
	  },
	  push: function() {
	    var values = arguments;
	    var oldLength = this.length;
	    return this.withMutations((function(vect) {
	      setVectorBounds(vect, 0, oldLength + values.length);
	      for (var ii = 0; ii < values.length; ii++) {
	        vect.set(oldLength + ii, values[ii]);
	      }
	    }));
	  },
	  pop: function() {
	    return setVectorBounds(this, 0, -1);
	  },
	  unshift: function() {
	    var values = arguments;
	    return this.withMutations((function(vect) {
	      setVectorBounds(vect, -values.length);
	      for (var ii = 0; ii < values.length; ii++) {
	        vect.set(ii, values[ii]);
	      }
	    }));
	  },
	  shift: function() {
	    return setVectorBounds(this, 1);
	  },
	  merge: function() {
	    return mergeIntoVectorWith(this, null, arguments);
	  },
	  mergeWith: function(merger) {
	    for (var seqs = [],
	        $__6 = 1; $__6 < arguments.length; $__6++)
	      seqs[$__6 - 1] = arguments[$__6];
	    return mergeIntoVectorWith(this, merger, seqs);
	  },
	  mergeDeep: function() {
	    return mergeIntoVectorWith(this, deepMerger(null), arguments);
	  },
	  mergeDeepWith: function(merger) {
	    for (var seqs = [],
	        $__7 = 1; $__7 < arguments.length; $__7++)
	      seqs[$__7 - 1] = arguments[$__7];
	    return mergeIntoVectorWith(this, deepMerger(merger), seqs);
	  },
	  setLength: function(length) {
	    return setVectorBounds(this, 0, length);
	  },
	  slice: function(begin, end, maintainIndices) {
	    var sliceSequence = $traceurRuntime.superCall(this, $Vector.prototype, "slice", [begin, end, maintainIndices]);
	    if (!maintainIndices && sliceSequence !== this) {
	      var vector = this;
	      var length = vector.length;
	      sliceSequence.toVector = (function() {
	        return setVectorBounds(vector, begin < 0 ? Math.max(0, length + begin) : length ? Math.min(length, begin) : begin, end == null ? length : end < 0 ? Math.max(0, length + end) : length ? Math.min(length, end) : end);
	      });
	    }
	    return sliceSequence;
	  },
	  keys: function(sparse) {
	    return new VectorIterator(this, 0, sparse);
	  },
	  values: function(sparse) {
	    return new VectorIterator(this, 1, sparse);
	  },
	  entries: function(sparse) {
	    return new VectorIterator(this, 2, sparse);
	  },
	  __iterator: function(reverse, flipIndices, sparse) {
	    return new VectorIterator(this, 2, sparse, reverse, flipIndices);
	  },
	  __iterate: function(fn, reverse, flipIndices) {
	    var vector = this;
	    var lastIndex = 0;
	    var maxIndex = vector.length - 1;
	    flipIndices ^= reverse;
	    var eachFn = (function(value, ii) {
	      if (fn(value, flipIndices ? maxIndex - ii : ii, vector) === false) {
	        return false;
	      } else {
	        lastIndex = ii;
	        return true;
	      }
	    });
	    var didComplete;
	    var tailOffset = getTailOffset(this._size);
	    if (reverse) {
	      didComplete = iterateVNode(this._tail, 0, tailOffset - this._origin, this._size - this._origin, eachFn, reverse) && iterateVNode(this._root, this._level, -this._origin, tailOffset - this._origin, eachFn, reverse);
	    } else {
	      didComplete = iterateVNode(this._root, this._level, -this._origin, tailOffset - this._origin, eachFn, reverse) && iterateVNode(this._tail, 0, tailOffset - this._origin, this._size - this._origin, eachFn, reverse);
	    }
	    return (didComplete ? maxIndex : reverse ? maxIndex - lastIndex : lastIndex) + 1;
	  },
	  __deepEquals: function(other) {
	    var iterator = this.entries(true);
	    return other.every((function(v, i) {
	      var entry = iterator.next().value;
	      return entry && entry[0] === i && is(entry[1], v);
	    }));
	  },
	  __ensureOwner: function(ownerID) {
	    if (ownerID === this.__ownerID) {
	      return this;
	    }
	    if (!ownerID) {
	      this.__ownerID = ownerID;
	      return this;
	    }
	    return makeVector(this._origin, this._size, this._level, this._root, this._tail, ownerID, this.__hash);
	  }
	}, {
	  empty: function() {
	    return EMPTY_VECT || (EMPTY_VECT = makeVector(0, 0, SHIFT));
	  },
	  from: function(sequence) {
	    if (!sequence || sequence.length === 0) {
	      return $Vector.empty();
	    }
	    if (sequence.constructor === $Vector) {
	      return sequence;
	    }
	    var isArray = Array.isArray(sequence);
	    if (sequence.length > 0 && sequence.length < SIZE) {
	      return makeVector(0, sequence.length, SHIFT, null, new VNode(isArray ? arrCopy(sequence) : Sequence(sequence).toArray()));
	    }
	    if (!isArray) {
	      sequence = Sequence(sequence);
	      if (!(sequence instanceof IndexedSequence)) {
	        sequence = sequence.valueSeq();
	      }
	    }
	    return $Vector.empty().merge(sequence);
	  }
	}, IndexedSequence);
	var VectorPrototype = Vector.prototype;
	VectorPrototype[DELETE] = VectorPrototype.remove;
	VectorPrototype[ITERATOR] = VectorPrototype.values;
	VectorPrototype.update = MapPrototype.update;
	VectorPrototype.updateIn = MapPrototype.updateIn;
	VectorPrototype.cursor = MapPrototype.cursor;
	VectorPrototype.withMutations = MapPrototype.withMutations;
	VectorPrototype.asMutable = MapPrototype.asMutable;
	VectorPrototype.asImmutable = MapPrototype.asImmutable;
	VectorPrototype.wasAltered = MapPrototype.wasAltered;
	var VNode = function VNode(array, ownerID) {
	  this.array = array;
	  this.ownerID = ownerID;
	};
	var $VNode = VNode;
	($traceurRuntime.createClass)(VNode, {
	  removeBefore: function(ownerID, level, index) {
	    if (index === level ? 1 << level : 0 || this.array.length === 0) {
	      return this;
	    }
	    var originIndex = (index >>> level) & MASK;
	    if (originIndex >= this.array.length) {
	      return new $VNode([], ownerID);
	    }
	    var removingFirst = originIndex === 0;
	    var newChild;
	    if (level > 0) {
	      var oldChild = this.array[originIndex];
	      newChild = oldChild && oldChild.removeBefore(ownerID, level - SHIFT, index);
	      if (newChild === oldChild && removingFirst) {
	        return this;
	      }
	    }
	    if (removingFirst && !newChild) {
	      return this;
	    }
	    var editable = editableVNode(this, ownerID);
	    if (!removingFirst) {
	      for (var ii = 0; ii < originIndex; ii++) {
	        delete editable.array[ii];
	      }
	    }
	    if (newChild) {
	      editable.array[originIndex] = newChild;
	    }
	    return editable;
	  },
	  removeAfter: function(ownerID, level, index) {
	    if (index === level ? 1 << level : 0 || this.array.length === 0) {
	      return this;
	    }
	    var sizeIndex = ((index - 1) >>> level) & MASK;
	    if (sizeIndex >= this.array.length) {
	      return this;
	    }
	    var removingLast = sizeIndex === this.array.length - 1;
	    var newChild;
	    if (level > 0) {
	      var oldChild = this.array[sizeIndex];
	      newChild = oldChild && oldChild.removeAfter(ownerID, level - SHIFT, index);
	      if (newChild === oldChild && removingLast) {
	        return this;
	      }
	    }
	    if (removingLast && !newChild) {
	      return this;
	    }
	    var editable = editableVNode(this, ownerID);
	    if (!removingLast) {
	      editable.array.length = sizeIndex + 1;
	    }
	    if (newChild) {
	      editable.array[sizeIndex] = newChild;
	    }
	    return editable;
	  }
	}, {});
	function iterateVNode(node, level, offset, max, fn, reverse) {
	  if (node) {
	    var ii;
	    var array = node.array;
	    var maxII = array.length - 1;
	    if (level === 0) {
	      for (ii = 0; ii <= maxII; ii++) {
	        var rawIndex = reverse ? maxII - ii : ii;
	        if (array.hasOwnProperty(rawIndex)) {
	          var index = rawIndex + offset;
	          if (index >= 0 && index < max && fn(array[rawIndex], index) === false) {
	            return false;
	          }
	        }
	      }
	    } else {
	      var step = 1 << level;
	      var newLevel = level - SHIFT;
	      for (ii = 0; ii <= maxII; ii++) {
	        var levelIndex = reverse ? maxII - ii : ii;
	        var newOffset = offset + levelIndex * step;
	        if (newOffset < max && newOffset + step > 0) {
	          var nextNode = array[levelIndex];
	          if (nextNode && !iterateVNode(nextNode, newLevel, newOffset, max, fn, reverse)) {
	            return false;
	          }
	        }
	      }
	    }
	  }
	  return true;
	}
	var VectorIterator = function VectorIterator(vector, type, sparse, reverse, flipIndices) {
	  this._type = type;
	  this._sparse = !!sparse;
	  this._reverse = !!reverse;
	  this._flipIndices = !!(flipIndices ^ reverse);
	  this._maxIndex = vector.length - 1;
	  var tailOffset = getTailOffset(vector._size);
	  var rootStack = vectIteratorFrame(vector._root && vector._root.array, vector._level, -vector._origin, tailOffset - vector._origin - 1);
	  var tailStack = vectIteratorFrame(vector._tail && vector._tail.array, 0, tailOffset - vector._origin, vector._size - vector._origin - 1);
	  this._stack = reverse ? tailStack : rootStack;
	  this._stack.__prev = reverse ? rootStack : tailStack;
	};
	($traceurRuntime.createClass)(VectorIterator, {next: function() {
	    var sparse = this._sparse;
	    var stack = this._stack;
	    while (stack) {
	      var array = stack.array;
	      var rawIndex = stack.index++;
	      if (this._reverse) {
	        rawIndex = MASK - rawIndex;
	        if (rawIndex > stack.rawMax) {
	          rawIndex = stack.rawMax;
	          stack.index = SIZE - rawIndex;
	        }
	      }
	      if (rawIndex >= 0 && rawIndex < SIZE && rawIndex <= stack.rawMax) {
	        var value = array && array[rawIndex];
	        if (stack.level === 0) {
	          if (!sparse || value != null || (array && rawIndex < array.length && array.hasOwnProperty(rawIndex))) {
	            var type = this._type;
	            var index;
	            if (type !== 1) {
	              index = stack.offset + (rawIndex << stack.level);
	              if (this._flipIndices) {
	                index = this._maxIndex - index;
	              }
	            }
	            return iteratorValue(type === 0 ? index : type === 1 ? value : [index, value]);
	          }
	        } else if (!sparse || value != null) {
	          this._stack = stack = vectIteratorFrame(value && value.array, stack.level - SHIFT, stack.offset + (rawIndex << stack.level), stack.max, stack);
	        }
	        continue;
	      }
	      stack = this._stack = this._stack.__prev;
	    }
	    return iteratorDone();
	  }}, {}, SequenceIterator);
	function vectIteratorFrame(array, level, offset, max, prevFrame) {
	  return {
	    array: array,
	    level: level,
	    offset: offset,
	    max: max,
	    rawMax: ((max - offset) >> level),
	    index: 0,
	    __prev: prevFrame
	  };
	}
	function makeVector(origin, size, level, root, tail, ownerID, hash) {
	  var vect = Object.create(VectorPrototype);
	  vect.length = size - origin;
	  vect._origin = origin;
	  vect._size = size;
	  vect._level = level;
	  vect._root = root;
	  vect._tail = tail;
	  vect.__ownerID = ownerID;
	  vect.__hash = hash;
	  vect.__altered = false;
	  return vect;
	}
	function updateVector(vector, index, value) {
	  if (index >= vector.length) {
	    return value === NOT_SET ? vector : vector.withMutations((function(vect) {
	      setVectorBounds(vect, 0, index + 1).set(index, value);
	    }));
	  }
	  index = rawIndex(index, vector._origin);
	  var newTail = vector._tail;
	  var newRoot = vector._root;
	  var didAlter = MakeRef(DID_ALTER);
	  if (index >= getTailOffset(vector._size)) {
	    newTail = updateVNode(newTail, vector.__ownerID, 0, index, value, didAlter);
	  } else {
	    newRoot = updateVNode(newRoot, vector.__ownerID, vector._level, index, value, didAlter);
	  }
	  if (!didAlter.value) {
	    return vector;
	  }
	  if (vector.__ownerID) {
	    vector._root = newRoot;
	    vector._tail = newTail;
	    vector.__hash = undefined;
	    vector.__altered = true;
	    return vector;
	  }
	  return makeVector(vector._origin, vector._size, vector._level, newRoot, newTail);
	}
	function updateVNode(node, ownerID, level, index, value, didAlter) {
	  var removed = value === NOT_SET;
	  var newNode;
	  var idx = (index >>> level) & MASK;
	  var nodeHas = node && idx < node.array.length && node.array.hasOwnProperty(idx);
	  if (removed && !nodeHas) {
	    return node;
	  }
	  if (level > 0) {
	    var lowerNode = node && node.array[idx];
	    var newLowerNode = updateVNode(lowerNode, ownerID, level - SHIFT, index, value, didAlter);
	    if (newLowerNode === lowerNode) {
	      return node;
	    }
	    newNode = editableVNode(node, ownerID);
	    newNode.array[idx] = newLowerNode;
	    return newNode;
	  }
	  if (!removed && nodeHas && node.array[idx] === value) {
	    return node;
	  }
	  SetRef(didAlter);
	  newNode = editableVNode(node, ownerID);
	  removed ? (delete newNode.array[idx]) : (newNode.array[idx] = value);
	  return newNode;
	}
	function editableVNode(node, ownerID) {
	  if (ownerID && node && ownerID === node.ownerID) {
	    return node;
	  }
	  return new VNode(node ? node.array.slice() : [], ownerID);
	}
	function vectorNodeFor(vector, rawIndex) {
	  if (rawIndex >= getTailOffset(vector._size)) {
	    return vector._tail;
	  }
	  if (rawIndex < 1 << (vector._level + SHIFT)) {
	    var node = vector._root;
	    var level = vector._level;
	    while (node && level > 0) {
	      node = node.array[(rawIndex >>> level) & MASK];
	      level -= SHIFT;
	    }
	    return node;
	  }
	}
	function setVectorBounds(vector, begin, end) {
	  var owner = vector.__ownerID || new OwnerID();
	  var oldOrigin = vector._origin;
	  var oldSize = vector._size;
	  var newOrigin = oldOrigin + begin;
	  var newSize = end == null ? oldSize : end < 0 ? oldSize + end : oldOrigin + end;
	  if (newOrigin === oldOrigin && newSize === oldSize) {
	    return vector;
	  }
	  if (newOrigin >= newSize) {
	    return vector.clear();
	  }
	  var newLevel = vector._level;
	  var newRoot = vector._root;
	  var offsetShift = 0;
	  while (newOrigin + offsetShift < 0) {
	    newRoot = new VNode(newRoot && newRoot.array.length ? [null, newRoot] : [], owner);
	    newLevel += SHIFT;
	    offsetShift += 1 << newLevel;
	  }
	  if (offsetShift) {
	    newOrigin += offsetShift;
	    oldOrigin += offsetShift;
	    newSize += offsetShift;
	    oldSize += offsetShift;
	  }
	  var oldTailOffset = getTailOffset(oldSize);
	  var newTailOffset = getTailOffset(newSize);
	  while (newTailOffset >= 1 << (newLevel + SHIFT)) {
	    newRoot = new VNode(newRoot && newRoot.array.length ? [newRoot] : [], owner);
	    newLevel += SHIFT;
	  }
	  var oldTail = vector._tail;
	  var newTail = newTailOffset < oldTailOffset ? vectorNodeFor(vector, newSize - 1) : newTailOffset > oldTailOffset ? new VNode([], owner) : oldTail;
	  if (oldTail && newTailOffset > oldTailOffset && newOrigin < oldSize && oldTail.array.length) {
	    newRoot = editableVNode(newRoot, owner);
	    var node = newRoot;
	    for (var level = newLevel; level > SHIFT; level -= SHIFT) {
	      var idx = (oldTailOffset >>> level) & MASK;
	      node = node.array[idx] = editableVNode(node.array[idx], owner);
	    }
	    node.array[(oldTailOffset >>> SHIFT) & MASK] = oldTail;
	  }
	  if (newSize < oldSize) {
	    newTail = newTail && newTail.removeAfter(owner, 0, newSize);
	  }
	  if (newOrigin >= newTailOffset) {
	    newOrigin -= newTailOffset;
	    newSize -= newTailOffset;
	    newLevel = SHIFT;
	    newRoot = null;
	    newTail = newTail && newTail.removeBefore(owner, 0, newOrigin);
	  } else if (newOrigin > oldOrigin || newTailOffset < oldTailOffset) {
	    var beginIndex,
	        endIndex;
	    offsetShift = 0;
	    do {
	      beginIndex = ((newOrigin) >>> newLevel) & MASK;
	      endIndex = ((newTailOffset - 1) >>> newLevel) & MASK;
	      if (beginIndex === endIndex) {
	        if (beginIndex) {
	          offsetShift += (1 << newLevel) * beginIndex;
	        }
	        newLevel -= SHIFT;
	        newRoot = newRoot && newRoot.array[beginIndex];
	      }
	    } while (newRoot && beginIndex === endIndex);
	    if (newRoot && newOrigin > oldOrigin) {
	      newRoot = newRoot && newRoot.removeBefore(owner, newLevel, newOrigin - offsetShift);
	    }
	    if (newRoot && newTailOffset < oldTailOffset) {
	      newRoot = newRoot && newRoot.removeAfter(owner, newLevel, newTailOffset - offsetShift);
	    }
	    if (offsetShift) {
	      newOrigin -= offsetShift;
	      newSize -= offsetShift;
	    }
	  }
	  if (vector.__ownerID) {
	    vector.length = newSize - newOrigin;
	    vector._origin = newOrigin;
	    vector._size = newSize;
	    vector._level = newLevel;
	    vector._root = newRoot;
	    vector._tail = newTail;
	    vector.__hash = undefined;
	    vector.__altered = true;
	    return vector;
	  }
	  return makeVector(newOrigin, newSize, newLevel, newRoot, newTail);
	}
	function mergeIntoVectorWith(vector, merger, iterables) {
	  var seqs = [];
	  for (var ii = 0; ii < iterables.length; ii++) {
	    var seq = iterables[ii];
	    seq && seqs.push(Sequence(seq));
	  }
	  var maxLength = Math.max.apply(null, seqs.map((function(s) {
	    return s.length || 0;
	  })));
	  if (maxLength > vector.length) {
	    vector = vector.setLength(maxLength);
	  }
	  return mergeIntoCollectionWith(vector, merger, seqs);
	}
	function rawIndex(index, origin) {
	  invariant(index >= 0, 'Index out of bounds');
	  return index + origin;
	}
	function getTailOffset(size) {
	  return size < SIZE ? 0 : (((size - 1) >>> SHIFT) << SHIFT);
	}
	var EMPTY_VECT;
	var Set = function Set() {
	  for (var values = [],
	      $__8 = 0; $__8 < arguments.length; $__8++)
	    values[$__8] = arguments[$__8];
	  return $Set.from(values);
	};
	var $Set = Set;
	($traceurRuntime.createClass)(Set, {
	  toString: function() {
	    return this.__toString('Set {', '}');
	  },
	  has: function(value) {
	    return this._map.has(value);
	  },
	  get: function(value, notSetValue) {
	    return this.has(value) ? value : notSetValue;
	  },
	  add: function(value) {
	    var newMap = this._map.set(value, null);
	    if (this.__ownerID) {
	      this.length = newMap.length;
	      this._map = newMap;
	      return this;
	    }
	    return newMap === this._map ? this : makeSet(newMap);
	  },
	  remove: function(value) {
	    var newMap = this._map.remove(value);
	    if (this.__ownerID) {
	      this.length = newMap.length;
	      this._map = newMap;
	      return this;
	    }
	    return newMap === this._map ? this : newMap.length === 0 ? $Set.empty() : makeSet(newMap);
	  },
	  clear: function() {
	    if (this.length === 0) {
	      return this;
	    }
	    if (this.__ownerID) {
	      this.length = 0;
	      this._map.clear();
	      return this;
	    }
	    return $Set.empty();
	  },
	  union: function() {
	    var seqs = arguments;
	    if (seqs.length === 0) {
	      return this;
	    }
	    return this.withMutations((function(set) {
	      for (var ii = 0; ii < seqs.length; ii++) {
	        Sequence(seqs[ii]).forEach((function(value) {
	          return set.add(value);
	        }));
	      }
	    }));
	  },
	  intersect: function() {
	    for (var seqs = [],
	        $__9 = 0; $__9 < arguments.length; $__9++)
	      seqs[$__9] = arguments[$__9];
	    if (seqs.length === 0) {
	      return this;
	    }
	    seqs = seqs.map((function(seq) {
	      return Sequence(seq);
	    }));
	    var originalSet = this;
	    return this.withMutations((function(set) {
	      originalSet.forEach((function(value) {
	        if (!seqs.every((function(seq) {
	          return seq.contains(value);
	        }))) {
	          set.remove(value);
	        }
	      }));
	    }));
	  },
	  subtract: function() {
	    for (var seqs = [],
	        $__10 = 0; $__10 < arguments.length; $__10++)
	      seqs[$__10] = arguments[$__10];
	    if (seqs.length === 0) {
	      return this;
	    }
	    seqs = seqs.map((function(seq) {
	      return Sequence(seq);
	    }));
	    var originalSet = this;
	    return this.withMutations((function(set) {
	      originalSet.forEach((function(value) {
	        if (seqs.some((function(seq) {
	          return seq.contains(value);
	        }))) {
	          set.remove(value);
	        }
	      }));
	    }));
	  },
	  isSubset: function(seq) {
	    seq = Sequence(seq);
	    return this.every((function(value) {
	      return seq.contains(value);
	    }));
	  },
	  isSuperset: function(seq) {
	    var set = this;
	    seq = Sequence(seq);
	    return seq.every((function(value) {
	      return set.contains(value);
	    }));
	  },
	  wasAltered: function() {
	    return this._map.wasAltered();
	  },
	  values: function() {
	    return this._map.keys();
	  },
	  entries: function() {
	    return iteratorMapper(this.values(), (function(key) {
	      return [key, key];
	    }));
	  },
	  hashCode: function() {
	    return this._map.hashCode();
	  },
	  equals: function(other) {
	    return this._map.equals(other._map);
	  },
	  __iterate: function(fn, reverse) {
	    var collection = this;
	    return this._map.__iterate((function(_, k) {
	      return fn(k, k, collection);
	    }), reverse);
	  },
	  __ensureOwner: function(ownerID) {
	    if (ownerID === this.__ownerID) {
	      return this;
	    }
	    var newMap = this._map.__ensureOwner(ownerID);
	    if (!ownerID) {
	      this.__ownerID = ownerID;
	      this._map = newMap;
	      return this;
	    }
	    return makeSet(newMap, ownerID);
	  }
	}, {
	  empty: function() {
	    return EMPTY_SET || (EMPTY_SET = makeSet(Map.empty()));
	  },
	  from: function(sequence) {
	    var set = $Set.empty();
	    return sequence ? sequence.constructor === $Set ? sequence : set.union(sequence) : set;
	  },
	  fromKeys: function(sequence) {
	    return $Set.from(Sequence(sequence).flip());
	  }
	}, Sequence);
	var SetPrototype = Set.prototype;
	SetPrototype[DELETE] = SetPrototype.remove;
	SetPrototype[ITERATOR] = SetPrototype.keys = SetPrototype.values;
	SetPrototype.contains = SetPrototype.has;
	SetPrototype.mergeDeep = SetPrototype.merge = SetPrototype.union;
	SetPrototype.mergeDeepWith = SetPrototype.mergeWith = function(merger) {
	  for (var seqs = [],
	      $__11 = 1; $__11 < arguments.length; $__11++)
	    seqs[$__11 - 1] = arguments[$__11];
	  return this.merge.apply(this, seqs);
	};
	SetPrototype.withMutations = MapPrototype.withMutations;
	SetPrototype.asMutable = MapPrototype.asMutable;
	SetPrototype.asImmutable = MapPrototype.asImmutable;
	SetPrototype.__toJS = IndexedSequencePrototype.__toJS;
	SetPrototype.__toStringMapper = IndexedSequencePrototype.__toStringMapper;
	function makeSet(map, ownerID) {
	  var set = Object.create(SetPrototype);
	  set.length = map ? map.length : 0;
	  set._map = map;
	  set.__ownerID = ownerID;
	  return set;
	}
	var EMPTY_SET;
	var OrderedMap = function OrderedMap(sequence) {
	  var map = $OrderedMap.empty();
	  return sequence ? sequence.constructor === $OrderedMap ? sequence : map.merge(sequence) : map;
	};
	var $OrderedMap = OrderedMap;
	($traceurRuntime.createClass)(OrderedMap, {
	  toString: function() {
	    return this.__toString('OrderedMap {', '}');
	  },
	  get: function(k, notSetValue) {
	    var index = this._map.get(k);
	    return index != null ? this._vector.get(index)[1] : notSetValue;
	  },
	  clear: function() {
	    if (this.length === 0) {
	      return this;
	    }
	    if (this.__ownerID) {
	      this.length = 0;
	      this._map.clear();
	      this._vector.clear();
	      return this;
	    }
	    return $OrderedMap.empty();
	  },
	  set: function(k, v) {
	    return updateOrderedMap(this, k, v);
	  },
	  remove: function(k) {
	    return updateOrderedMap(this, k, NOT_SET);
	  },
	  wasAltered: function() {
	    return this._map.wasAltered() || this._vector.wasAltered();
	  },
	  keys: function() {
	    return iteratorMapper(this.entries(), (function(entry) {
	      return entry[0];
	    }));
	  },
	  values: function() {
	    return iteratorMapper(this.entries(), (function(entry) {
	      return entry[1];
	    }));
	  },
	  entries: function() {
	    return this._vector.values(true);
	  },
	  __iterate: function(fn, reverse) {
	    return this._vector.fromEntrySeq().__iterate(fn, reverse);
	  },
	  __deepEqual: function(other) {
	    var iterator = this.entries();
	    return other.every((function(v, k) {
	      var entry = iterator.next().value;
	      return entry && is(entry[0], k) && is(entry[1], v);
	    }));
	  },
	  __ensureOwner: function(ownerID) {
	    if (ownerID === this.__ownerID) {
	      return this;
	    }
	    var newMap = this._map.__ensureOwner(ownerID);
	    var newVector = this._vector.__ensureOwner(ownerID);
	    if (!ownerID) {
	      this.__ownerID = ownerID;
	      this._map = newMap;
	      this._vector = newVector;
	      return this;
	    }
	    return makeOrderedMap(newMap, newVector, ownerID, this.__hash);
	  }
	}, {empty: function() {
	    return EMPTY_ORDERED_MAP || (EMPTY_ORDERED_MAP = makeOrderedMap(Map.empty(), Vector.empty()));
	  }}, Map);
	OrderedMap.from = OrderedMap;
	OrderedMap.prototype[DELETE] = OrderedMap.prototype.remove;
	function makeOrderedMap(map, vector, ownerID, hash) {
	  var omap = Object.create(OrderedMap.prototype);
	  omap.length = map ? map.length : 0;
	  omap._map = map;
	  omap._vector = vector;
	  omap.__ownerID = ownerID;
	  omap.__hash = hash;
	  return omap;
	}
	function updateOrderedMap(omap, k, v) {
	  var map = omap._map;
	  var vector = omap._vector;
	  var i = map.get(k);
	  var has = i !== undefined;
	  var removed = v === NOT_SET;
	  if ((!has && removed) || (has && v === vector.get(i)[1])) {
	    return omap;
	  }
	  if (!has) {
	    i = vector.length;
	  }
	  var newMap = removed ? map.remove(k) : has ? map : map.set(k, i);
	  var newVector = removed ? vector.remove(i) : vector.set(i, [k, v]);
	  if (omap.__ownerID) {
	    omap.length = newMap.length;
	    omap._map = newMap;
	    omap._vector = newVector;
	    omap.__hash = undefined;
	    return omap;
	  }
	  return makeOrderedMap(newMap, newVector);
	}
	var EMPTY_ORDERED_MAP;
	var Record = function Record(defaultValues, name) {
	  var RecordType = function(values) {
	    if (!(this instanceof RecordType)) {
	      return new RecordType(values);
	    }
	    this._map = Map(values);
	  };
	  defaultValues = Sequence(defaultValues);
	  var RecordTypePrototype = RecordType.prototype = Object.create(RecordPrototype);
	  RecordTypePrototype.constructor = RecordType;
	  RecordTypePrototype._name = name;
	  RecordTypePrototype._defaultValues = defaultValues;
	  var keys = Object.keys(defaultValues);
	  RecordType.prototype.length = keys.length;
	  if (Object.defineProperty) {
	    defaultValues.forEach((function(_, key) {
	      Object.defineProperty(RecordType.prototype, key, {
	        get: function() {
	          return this.get(key);
	        },
	        set: function(value) {
	          invariant(this.__ownerID, 'Cannot set on an immutable record.');
	          this.set(key, value);
	        }
	      });
	    }));
	  }
	  return RecordType;
	};
	var $Record = Record;
	($traceurRuntime.createClass)(Record, {
	  toString: function() {
	    return this.__toString((this._name || 'Record') + ' {', '}');
	  },
	  has: function(k) {
	    return this._defaultValues.has(k);
	  },
	  get: function(k, notSetValue) {
	    if (notSetValue !== undefined && !this.has(k)) {
	      return notSetValue;
	    }
	    return this._map.get(k, this._defaultValues.get(k));
	  },
	  clear: function() {
	    if (this.__ownerID) {
	      this._map.clear();
	      return this;
	    }
	    var Record = Object.getPrototypeOf(this).constructor;
	    return $Record._empty || ($Record._empty = makeRecord(this, Map.empty()));
	  },
	  set: function(k, v) {
	    if (k == null || !this.has(k)) {
	      return this;
	    }
	    var newMap = this._map.set(k, v);
	    if (this.__ownerID || newMap === this._map) {
	      return this;
	    }
	    return makeRecord(this, newMap);
	  },
	  remove: function(k) {
	    if (k == null || !this.has(k)) {
	      return this;
	    }
	    var newMap = this._map.remove(k);
	    if (this.__ownerID || newMap === this._map) {
	      return this;
	    }
	    return makeRecord(this, newMap);
	  },
	  keys: function() {
	    return this._map.keys();
	  },
	  values: function() {
	    return this._map.values();
	  },
	  entries: function() {
	    return this._map.entries();
	  },
	  wasAltered: function() {
	    return this._map.wasAltered();
	  },
	  __iterate: function(fn, reverse) {
	    var record = this;
	    return this._defaultValues.map((function(_, k) {
	      return record.get(k);
	    })).__iterate(fn, reverse);
	  },
	  __ensureOwner: function(ownerID) {
	    if (ownerID === this.__ownerID) {
	      return this;
	    }
	    var newMap = this._map && this._map.__ensureOwner(ownerID);
	    if (!ownerID) {
	      this.__ownerID = ownerID;
	      this._map = newMap;
	      return this;
	    }
	    return makeRecord(this, newMap, ownerID);
	  }
	}, {}, Sequence);
	var RecordPrototype = Record.prototype;
	RecordPrototype[DELETE] = RecordPrototype.remove;
	RecordPrototype[ITERATOR] = MapPrototype[ITERATOR];
	RecordPrototype.merge = MapPrototype.merge;
	RecordPrototype.mergeWith = MapPrototype.mergeWith;
	RecordPrototype.mergeDeep = MapPrototype.mergeDeep;
	RecordPrototype.mergeDeepWith = MapPrototype.mergeDeepWith;
	RecordPrototype.update = MapPrototype.update;
	RecordPrototype.updateIn = MapPrototype.updateIn;
	RecordPrototype.cursor = MapPrototype.cursor;
	RecordPrototype.withMutations = MapPrototype.withMutations;
	RecordPrototype.asMutable = MapPrototype.asMutable;
	RecordPrototype.asImmutable = MapPrototype.asImmutable;
	RecordPrototype.__deepEqual = MapPrototype.__deepEqual;
	function makeRecord(likeRecord, map, ownerID) {
	  var record = Object.create(Object.getPrototypeOf(likeRecord));
	  record._map = map;
	  record.__ownerID = ownerID;
	  return record;
	}
	var Range = function Range(start, end, step) {
	  if (!(this instanceof $Range)) {
	    return new $Range(start, end, step);
	  }
	  invariant(step !== 0, 'Cannot step a Range by 0');
	  start = start || 0;
	  if (end == null) {
	    end = Infinity;
	  }
	  if (start === end && __EMPTY_RANGE) {
	    return __EMPTY_RANGE;
	  }
	  step = step == null ? 1 : Math.abs(step);
	  if (end < start) {
	    step = -step;
	  }
	  this._start = start;
	  this._end = end;
	  this._step = step;
	  this.length = Math.max(0, Math.ceil((end - start) / step - 1) + 1);
	};
	var $Range = Range;
	($traceurRuntime.createClass)(Range, {
	  toString: function() {
	    if (this.length === 0) {
	      return 'Range []';
	    }
	    return 'Range [ ' + this._start + '...' + this._end + (this._step > 1 ? ' by ' + this._step : '') + ' ]';
	  },
	  has: function(index) {
	    invariant(index >= 0, 'Index out of bounds');
	    return index < this.length;
	  },
	  get: function(index, notSetValue) {
	    invariant(index >= 0, 'Index out of bounds');
	    return this.length === Infinity || index < this.length ? this._start + index * this._step : notSetValue;
	  },
	  contains: function(searchValue) {
	    var possibleIndex = (searchValue - this._start) / this._step;
	    return possibleIndex >= 0 && possibleIndex < this.length && possibleIndex === Math.floor(possibleIndex);
	  },
	  slice: function(begin, end, maintainIndices) {
	    if (wholeSlice(begin, end, this.length)) {
	      return this;
	    }
	    if (maintainIndices) {
	      return $traceurRuntime.superCall(this, $Range.prototype, "slice", [begin, end, maintainIndices]);
	    }
	    begin = resolveBegin(begin, this.length);
	    end = resolveEnd(end, this.length);
	    if (end <= begin) {
	      return __EMPTY_RANGE;
	    }
	    return new $Range(this.get(begin, this._end), this.get(end, this._end), this._step);
	  },
	  indexOf: function(searchValue) {
	    var offsetValue = searchValue - this._start;
	    if (offsetValue % this._step === 0) {
	      var index = offsetValue / this._step;
	      if (index >= 0 && index < this.length) {
	        return index;
	      }
	    }
	    return -1;
	  },
	  lastIndexOf: function(searchValue) {
	    return this.indexOf(searchValue);
	  },
	  take: function(amount) {
	    return this.slice(0, amount);
	  },
	  skip: function(amount, maintainIndices) {
	    return maintainIndices ? $traceurRuntime.superCall(this, $Range.prototype, "skip", [amount]) : this.slice(amount);
	  },
	  __iterate: function(fn, reverse, flipIndices) {
	    var reversedIndices = reverse ^ flipIndices;
	    var maxIndex = this.length - 1;
	    var step = this._step;
	    var value = reverse ? this._start + maxIndex * step : this._start;
	    for (var ii = 0; ii <= maxIndex; ii++) {
	      if (fn(value, reversedIndices ? maxIndex - ii : ii, this) === false) {
	        break;
	      }
	      value += reverse ? -step : step;
	    }
	    return reversedIndices ? this.length : ii;
	  },
	  __deepEquals: function(other) {
	    return this._start === other._start && this._end === other._end && this._step === other._step;
	  }
	}, {}, IndexedSequence);
	var RangePrototype = Range.prototype;
	RangePrototype.__toJS = RangePrototype.toArray;
	RangePrototype.first = VectorPrototype.first;
	RangePrototype.last = VectorPrototype.last;
	var __EMPTY_RANGE = Range(0, 0);
	var Repeat = function Repeat(value, times) {
	  if (times === 0 && EMPTY_REPEAT) {
	    return EMPTY_REPEAT;
	  }
	  if (!(this instanceof $Repeat)) {
	    return new $Repeat(value, times);
	  }
	  this._value = value;
	  this.length = times == null ? Infinity : Math.max(0, times);
	};
	var $Repeat = Repeat;
	($traceurRuntime.createClass)(Repeat, {
	  toString: function() {
	    if (this.length === 0) {
	      return 'Repeat []';
	    }
	    return 'Repeat [ ' + this._value + ' ' + this.length + ' times ]';
	  },
	  get: function(index, notSetValue) {
	    invariant(index >= 0, 'Index out of bounds');
	    return this.length === Infinity || index < this.length ? this._value : notSetValue;
	  },
	  first: function() {
	    return this._value;
	  },
	  contains: function(searchValue) {
	    return is(this._value, searchValue);
	  },
	  slice: function(begin, end, maintainIndices) {
	    if (maintainIndices) {
	      return $traceurRuntime.superCall(this, $Repeat.prototype, "slice", [begin, end, maintainIndices]);
	    }
	    var length = this.length;
	    begin = begin < 0 ? Math.max(0, length + begin) : Math.min(length, begin);
	    end = end == null ? length : end > 0 ? Math.min(length, end) : Math.max(0, length + end);
	    return end > begin ? new $Repeat(this._value, end - begin) : EMPTY_REPEAT;
	  },
	  reverse: function(maintainIndices) {
	    return maintainIndices ? $traceurRuntime.superCall(this, $Repeat.prototype, "reverse", [maintainIndices]) : this;
	  },
	  indexOf: function(searchValue) {
	    if (is(this._value, searchValue)) {
	      return 0;
	    }
	    return -1;
	  },
	  lastIndexOf: function(searchValue) {
	    if (is(this._value, searchValue)) {
	      return this.length;
	    }
	    return -1;
	  },
	  __iterate: function(fn, reverse, flipIndices) {
	    var reversedIndices = reverse ^ flipIndices;
	    invariant(!reversedIndices || this.length < Infinity, 'Cannot access end of infinite range.');
	    var maxIndex = this.length - 1;
	    for (var ii = 0; ii <= maxIndex; ii++) {
	      if (fn(this._value, reversedIndices ? maxIndex - ii : ii, this) === false) {
	        break;
	      }
	    }
	    return reversedIndices ? this.length : ii;
	  },
	  __deepEquals: function(other) {
	    return is(this._value, other._value);
	  }
	}, {}, IndexedSequence);
	var RepeatPrototype = Repeat.prototype;
	RepeatPrototype.last = RepeatPrototype.first;
	RepeatPrototype.has = RangePrototype.has;
	RepeatPrototype.take = RangePrototype.take;
	RepeatPrototype.skip = RangePrototype.skip;
	RepeatPrototype.__toJS = RangePrototype.__toJS;
	var EMPTY_REPEAT = new Repeat(undefined, 0);
	function fromJS(json, converter) {
	  if (converter) {
	    return _fromJSWith(converter, json, '', {'': json});
	  }
	  return _fromJSDefault(json);
	}
	function _fromJSWith(converter, json, key, parentJSON) {
	  if (json && (Array.isArray(json) || json.constructor === Object)) {
	    return converter.call(parentJSON, key, Sequence(json).map((function(v, k) {
	      return _fromJSWith(converter, v, k, json);
	    })));
	  }
	  return json;
	}
	function _fromJSDefault(json) {
	  if (json) {
	    if (Array.isArray(json)) {
	      return Sequence(json).map(_fromJSDefault).toVector();
	    }
	    if (json.constructor === Object) {
	      return Sequence(json).map(_fromJSDefault).toMap();
	    }
	  }
	  return json;
	}
	var Immutable = {
	  Sequence: Sequence,
	  Map: Map,
	  Vector: Vector,
	  Set: Set,
	  OrderedMap: OrderedMap,
	  Record: Record,
	  Range: Range,
	  Repeat: Repeat,
	  is: is,
	  fromJS: fromJS
	};

	  return Immutable;
	}
	true ? module.exports = universalModule() :
	  typeof define === 'function' && define.amd ? define(universalModule) :
	    Immutable = universalModule();


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//     Underscore.js 1.7.0
	//     http://underscorejs.org
	//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	//     Underscore may be freely distributed under the MIT license.

	(function() {

	  // Baseline setup
	  // --------------

	  // Establish the root object, `window` in the browser, or `exports` on the server.
	  var root = this;

	  // Save the previous value of the `_` variable.
	  var previousUnderscore = root._;

	  // Save bytes in the minified (but not gzipped) version:
	  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

	  // Create quick reference variables for speed access to core prototypes.
	  var
	    push             = ArrayProto.push,
	    slice            = ArrayProto.slice,
	    concat           = ArrayProto.concat,
	    toString         = ObjProto.toString,
	    hasOwnProperty   = ObjProto.hasOwnProperty;

	  // All **ECMAScript 5** native function implementations that we hope to use
	  // are declared here.
	  var
	    nativeIsArray      = Array.isArray,
	    nativeKeys         = Object.keys,
	    nativeBind         = FuncProto.bind;

	  // Create a safe reference to the Underscore object for use below.
	  var _ = function(obj) {
	    if (obj instanceof _) return obj;
	    if (!(this instanceof _)) return new _(obj);
	    this._wrapped = obj;
	  };

	  // Export the Underscore object for **Node.js**, with
	  // backwards-compatibility for the old `require()` API. If we're in
	  // the browser, add `_` as a global object.
	  if (true) {
	    if (typeof module !== 'undefined' && module.exports) {
	      exports = module.exports = _;
	    }
	    exports._ = _;
	  } else {
	    root._ = _;
	  }

	  // Current version.
	  _.VERSION = '1.7.0';

	  // Internal function that returns an efficient (for current engines) version
	  // of the passed-in callback, to be repeatedly applied in other Underscore
	  // functions.
	  var createCallback = function(func, context, argCount) {
	    if (context === void 0) return func;
	    switch (argCount == null ? 3 : argCount) {
	      case 1: return function(value) {
	        return func.call(context, value);
	      };
	      case 2: return function(value, other) {
	        return func.call(context, value, other);
	      };
	      case 3: return function(value, index, collection) {
	        return func.call(context, value, index, collection);
	      };
	      case 4: return function(accumulator, value, index, collection) {
	        return func.call(context, accumulator, value, index, collection);
	      };
	    }
	    return function() {
	      return func.apply(context, arguments);
	    };
	  };

	  // A mostly-internal function to generate callbacks that can be applied
	  // to each element in a collection, returning the desired result — either
	  // identity, an arbitrary callback, a property matcher, or a property accessor.
	  _.iteratee = function(value, context, argCount) {
	    if (value == null) return _.identity;
	    if (_.isFunction(value)) return createCallback(value, context, argCount);
	    if (_.isObject(value)) return _.matches(value);
	    return _.property(value);
	  };

	  // Collection Functions
	  // --------------------

	  // The cornerstone, an `each` implementation, aka `forEach`.
	  // Handles raw objects in addition to array-likes. Treats all
	  // sparse array-likes as if they were dense.
	  _.each = _.forEach = function(obj, iteratee, context) {
	    if (obj == null) return obj;
	    iteratee = createCallback(iteratee, context);
	    var i, length = obj.length;
	    if (length === +length) {
	      for (i = 0; i < length; i++) {
	        iteratee(obj[i], i, obj);
	      }
	    } else {
	      var keys = _.keys(obj);
	      for (i = 0, length = keys.length; i < length; i++) {
	        iteratee(obj[keys[i]], keys[i], obj);
	      }
	    }
	    return obj;
	  };

	  // Return the results of applying the iteratee to each element.
	  _.map = _.collect = function(obj, iteratee, context) {
	    if (obj == null) return [];
	    iteratee = _.iteratee(iteratee, context);
	    var keys = obj.length !== +obj.length && _.keys(obj),
	        length = (keys || obj).length,
	        results = Array(length),
	        currentKey;
	    for (var index = 0; index < length; index++) {
	      currentKey = keys ? keys[index] : index;
	      results[index] = iteratee(obj[currentKey], currentKey, obj);
	    }
	    return results;
	  };

	  var reduceError = 'Reduce of empty array with no initial value';

	  // **Reduce** builds up a single result from a list of values, aka `inject`,
	  // or `foldl`.
	  _.reduce = _.foldl = _.inject = function(obj, iteratee, memo, context) {
	    if (obj == null) obj = [];
	    iteratee = createCallback(iteratee, context, 4);
	    var keys = obj.length !== +obj.length && _.keys(obj),
	        length = (keys || obj).length,
	        index = 0, currentKey;
	    if (arguments.length < 3) {
	      if (!length) throw new TypeError(reduceError);
	      memo = obj[keys ? keys[index++] : index++];
	    }
	    for (; index < length; index++) {
	      currentKey = keys ? keys[index] : index;
	      memo = iteratee(memo, obj[currentKey], currentKey, obj);
	    }
	    return memo;
	  };

	  // The right-associative version of reduce, also known as `foldr`.
	  _.reduceRight = _.foldr = function(obj, iteratee, memo, context) {
	    if (obj == null) obj = [];
	    iteratee = createCallback(iteratee, context, 4);
	    var keys = obj.length !== + obj.length && _.keys(obj),
	        index = (keys || obj).length,
	        currentKey;
	    if (arguments.length < 3) {
	      if (!index) throw new TypeError(reduceError);
	      memo = obj[keys ? keys[--index] : --index];
	    }
	    while (index--) {
	      currentKey = keys ? keys[index] : index;
	      memo = iteratee(memo, obj[currentKey], currentKey, obj);
	    }
	    return memo;
	  };

	  // Return the first value which passes a truth test. Aliased as `detect`.
	  _.find = _.detect = function(obj, predicate, context) {
	    var result;
	    predicate = _.iteratee(predicate, context);
	    _.some(obj, function(value, index, list) {
	      if (predicate(value, index, list)) {
	        result = value;
	        return true;
	      }
	    });
	    return result;
	  };

	  // Return all the elements that pass a truth test.
	  // Aliased as `select`.
	  _.filter = _.select = function(obj, predicate, context) {
	    var results = [];
	    if (obj == null) return results;
	    predicate = _.iteratee(predicate, context);
	    _.each(obj, function(value, index, list) {
	      if (predicate(value, index, list)) results.push(value);
	    });
	    return results;
	  };

	  // Return all the elements for which a truth test fails.
	  _.reject = function(obj, predicate, context) {
	    return _.filter(obj, _.negate(_.iteratee(predicate)), context);
	  };

	  // Determine whether all of the elements match a truth test.
	  // Aliased as `all`.
	  _.every = _.all = function(obj, predicate, context) {
	    if (obj == null) return true;
	    predicate = _.iteratee(predicate, context);
	    var keys = obj.length !== +obj.length && _.keys(obj),
	        length = (keys || obj).length,
	        index, currentKey;
	    for (index = 0; index < length; index++) {
	      currentKey = keys ? keys[index] : index;
	      if (!predicate(obj[currentKey], currentKey, obj)) return false;
	    }
	    return true;
	  };

	  // Determine if at least one element in the object matches a truth test.
	  // Aliased as `any`.
	  _.some = _.any = function(obj, predicate, context) {
	    if (obj == null) return false;
	    predicate = _.iteratee(predicate, context);
	    var keys = obj.length !== +obj.length && _.keys(obj),
	        length = (keys || obj).length,
	        index, currentKey;
	    for (index = 0; index < length; index++) {
	      currentKey = keys ? keys[index] : index;
	      if (predicate(obj[currentKey], currentKey, obj)) return true;
	    }
	    return false;
	  };

	  // Determine if the array or object contains a given value (using `===`).
	  // Aliased as `include`.
	  _.contains = _.include = function(obj, target) {
	    if (obj == null) return false;
	    if (obj.length !== +obj.length) obj = _.values(obj);
	    return _.indexOf(obj, target) >= 0;
	  };

	  // Invoke a method (with arguments) on every item in a collection.
	  _.invoke = function(obj, method) {
	    var args = slice.call(arguments, 2);
	    var isFunc = _.isFunction(method);
	    return _.map(obj, function(value) {
	      return (isFunc ? method : value[method]).apply(value, args);
	    });
	  };

	  // Convenience version of a common use case of `map`: fetching a property.
	  _.pluck = function(obj, key) {
	    return _.map(obj, _.property(key));
	  };

	  // Convenience version of a common use case of `filter`: selecting only objects
	  // containing specific `key:value` pairs.
	  _.where = function(obj, attrs) {
	    return _.filter(obj, _.matches(attrs));
	  };

	  // Convenience version of a common use case of `find`: getting the first object
	  // containing specific `key:value` pairs.
	  _.findWhere = function(obj, attrs) {
	    return _.find(obj, _.matches(attrs));
	  };

	  // Return the maximum element (or element-based computation).
	  _.max = function(obj, iteratee, context) {
	    var result = -Infinity, lastComputed = -Infinity,
	        value, computed;
	    if (iteratee == null && obj != null) {
	      obj = obj.length === +obj.length ? obj : _.values(obj);
	      for (var i = 0, length = obj.length; i < length; i++) {
	        value = obj[i];
	        if (value > result) {
	          result = value;
	        }
	      }
	    } else {
	      iteratee = _.iteratee(iteratee, context);
	      _.each(obj, function(value, index, list) {
	        computed = iteratee(value, index, list);
	        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
	          result = value;
	          lastComputed = computed;
	        }
	      });
	    }
	    return result;
	  };

	  // Return the minimum element (or element-based computation).
	  _.min = function(obj, iteratee, context) {
	    var result = Infinity, lastComputed = Infinity,
	        value, computed;
	    if (iteratee == null && obj != null) {
	      obj = obj.length === +obj.length ? obj : _.values(obj);
	      for (var i = 0, length = obj.length; i < length; i++) {
	        value = obj[i];
	        if (value < result) {
	          result = value;
	        }
	      }
	    } else {
	      iteratee = _.iteratee(iteratee, context);
	      _.each(obj, function(value, index, list) {
	        computed = iteratee(value, index, list);
	        if (computed < lastComputed || computed === Infinity && result === Infinity) {
	          result = value;
	          lastComputed = computed;
	        }
	      });
	    }
	    return result;
	  };

	  // Shuffle a collection, using the modern version of the
	  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
	  _.shuffle = function(obj) {
	    var set = obj && obj.length === +obj.length ? obj : _.values(obj);
	    var length = set.length;
	    var shuffled = Array(length);
	    for (var index = 0, rand; index < length; index++) {
	      rand = _.random(0, index);
	      if (rand !== index) shuffled[index] = shuffled[rand];
	      shuffled[rand] = set[index];
	    }
	    return shuffled;
	  };

	  // Sample **n** random values from a collection.
	  // If **n** is not specified, returns a single random element.
	  // The internal `guard` argument allows it to work with `map`.
	  _.sample = function(obj, n, guard) {
	    if (n == null || guard) {
	      if (obj.length !== +obj.length) obj = _.values(obj);
	      return obj[_.random(obj.length - 1)];
	    }
	    return _.shuffle(obj).slice(0, Math.max(0, n));
	  };

	  // Sort the object's values by a criterion produced by an iteratee.
	  _.sortBy = function(obj, iteratee, context) {
	    iteratee = _.iteratee(iteratee, context);
	    return _.pluck(_.map(obj, function(value, index, list) {
	      return {
	        value: value,
	        index: index,
	        criteria: iteratee(value, index, list)
	      };
	    }).sort(function(left, right) {
	      var a = left.criteria;
	      var b = right.criteria;
	      if (a !== b) {
	        if (a > b || a === void 0) return 1;
	        if (a < b || b === void 0) return -1;
	      }
	      return left.index - right.index;
	    }), 'value');
	  };

	  // An internal function used for aggregate "group by" operations.
	  var group = function(behavior) {
	    return function(obj, iteratee, context) {
	      var result = {};
	      iteratee = _.iteratee(iteratee, context);
	      _.each(obj, function(value, index) {
	        var key = iteratee(value, index, obj);
	        behavior(result, value, key);
	      });
	      return result;
	    };
	  };

	  // Groups the object's values by a criterion. Pass either a string attribute
	  // to group by, or a function that returns the criterion.
	  _.groupBy = group(function(result, value, key) {
	    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
	  });

	  // Indexes the object's values by a criterion, similar to `groupBy`, but for
	  // when you know that your index values will be unique.
	  _.indexBy = group(function(result, value, key) {
	    result[key] = value;
	  });

	  // Counts instances of an object that group by a certain criterion. Pass
	  // either a string attribute to count by, or a function that returns the
	  // criterion.
	  _.countBy = group(function(result, value, key) {
	    if (_.has(result, key)) result[key]++; else result[key] = 1;
	  });

	  // Use a comparator function to figure out the smallest index at which
	  // an object should be inserted so as to maintain order. Uses binary search.
	  _.sortedIndex = function(array, obj, iteratee, context) {
	    iteratee = _.iteratee(iteratee, context, 1);
	    var value = iteratee(obj);
	    var low = 0, high = array.length;
	    while (low < high) {
	      var mid = low + high >>> 1;
	      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
	    }
	    return low;
	  };

	  // Safely create a real, live array from anything iterable.
	  _.toArray = function(obj) {
	    if (!obj) return [];
	    if (_.isArray(obj)) return slice.call(obj);
	    if (obj.length === +obj.length) return _.map(obj, _.identity);
	    return _.values(obj);
	  };

	  // Return the number of elements in an object.
	  _.size = function(obj) {
	    if (obj == null) return 0;
	    return obj.length === +obj.length ? obj.length : _.keys(obj).length;
	  };

	  // Split a collection into two arrays: one whose elements all satisfy the given
	  // predicate, and one whose elements all do not satisfy the predicate.
	  _.partition = function(obj, predicate, context) {
	    predicate = _.iteratee(predicate, context);
	    var pass = [], fail = [];
	    _.each(obj, function(value, key, obj) {
	      (predicate(value, key, obj) ? pass : fail).push(value);
	    });
	    return [pass, fail];
	  };

	  // Array Functions
	  // ---------------

	  // Get the first element of an array. Passing **n** will return the first N
	  // values in the array. Aliased as `head` and `take`. The **guard** check
	  // allows it to work with `_.map`.
	  _.first = _.head = _.take = function(array, n, guard) {
	    if (array == null) return void 0;
	    if (n == null || guard) return array[0];
	    if (n < 0) return [];
	    return slice.call(array, 0, n);
	  };

	  // Returns everything but the last entry of the array. Especially useful on
	  // the arguments object. Passing **n** will return all the values in
	  // the array, excluding the last N. The **guard** check allows it to work with
	  // `_.map`.
	  _.initial = function(array, n, guard) {
	    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
	  };

	  // Get the last element of an array. Passing **n** will return the last N
	  // values in the array. The **guard** check allows it to work with `_.map`.
	  _.last = function(array, n, guard) {
	    if (array == null) return void 0;
	    if (n == null || guard) return array[array.length - 1];
	    return slice.call(array, Math.max(array.length - n, 0));
	  };

	  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
	  // Especially useful on the arguments object. Passing an **n** will return
	  // the rest N values in the array. The **guard**
	  // check allows it to work with `_.map`.
	  _.rest = _.tail = _.drop = function(array, n, guard) {
	    return slice.call(array, n == null || guard ? 1 : n);
	  };

	  // Trim out all falsy values from an array.
	  _.compact = function(array) {
	    return _.filter(array, _.identity);
	  };

	  // Internal implementation of a recursive `flatten` function.
	  var flatten = function(input, shallow, strict, output) {
	    if (shallow && _.every(input, _.isArray)) {
	      return concat.apply(output, input);
	    }
	    for (var i = 0, length = input.length; i < length; i++) {
	      var value = input[i];
	      if (!_.isArray(value) && !_.isArguments(value)) {
	        if (!strict) output.push(value);
	      } else if (shallow) {
	        push.apply(output, value);
	      } else {
	        flatten(value, shallow, strict, output);
	      }
	    }
	    return output;
	  };

	  // Flatten out an array, either recursively (by default), or just one level.
	  _.flatten = function(array, shallow) {
	    return flatten(array, shallow, false, []);
	  };

	  // Return a version of the array that does not contain the specified value(s).
	  _.without = function(array) {
	    return _.difference(array, slice.call(arguments, 1));
	  };

	  // Produce a duplicate-free version of the array. If the array has already
	  // been sorted, you have the option of using a faster algorithm.
	  // Aliased as `unique`.
	  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
	    if (array == null) return [];
	    if (!_.isBoolean(isSorted)) {
	      context = iteratee;
	      iteratee = isSorted;
	      isSorted = false;
	    }
	    if (iteratee != null) iteratee = _.iteratee(iteratee, context);
	    var result = [];
	    var seen = [];
	    for (var i = 0, length = array.length; i < length; i++) {
	      var value = array[i];
	      if (isSorted) {
	        if (!i || seen !== value) result.push(value);
	        seen = value;
	      } else if (iteratee) {
	        var computed = iteratee(value, i, array);
	        if (_.indexOf(seen, computed) < 0) {
	          seen.push(computed);
	          result.push(value);
	        }
	      } else if (_.indexOf(result, value) < 0) {
	        result.push(value);
	      }
	    }
	    return result;
	  };

	  // Produce an array that contains the union: each distinct element from all of
	  // the passed-in arrays.
	  _.union = function() {
	    return _.uniq(flatten(arguments, true, true, []));
	  };

	  // Produce an array that contains every item shared between all the
	  // passed-in arrays.
	  _.intersection = function(array) {
	    if (array == null) return [];
	    var result = [];
	    var argsLength = arguments.length;
	    for (var i = 0, length = array.length; i < length; i++) {
	      var item = array[i];
	      if (_.contains(result, item)) continue;
	      for (var j = 1; j < argsLength; j++) {
	        if (!_.contains(arguments[j], item)) break;
	      }
	      if (j === argsLength) result.push(item);
	    }
	    return result;
	  };

	  // Take the difference between one array and a number of other arrays.
	  // Only the elements present in just the first array will remain.
	  _.difference = function(array) {
	    var rest = flatten(slice.call(arguments, 1), true, true, []);
	    return _.filter(array, function(value){
	      return !_.contains(rest, value);
	    });
	  };

	  // Zip together multiple lists into a single array -- elements that share
	  // an index go together.
	  _.zip = function(array) {
	    if (array == null) return [];
	    var length = _.max(arguments, 'length').length;
	    var results = Array(length);
	    for (var i = 0; i < length; i++) {
	      results[i] = _.pluck(arguments, i);
	    }
	    return results;
	  };

	  // Converts lists into objects. Pass either a single array of `[key, value]`
	  // pairs, or two parallel arrays of the same length -- one of keys, and one of
	  // the corresponding values.
	  _.object = function(list, values) {
	    if (list == null) return {};
	    var result = {};
	    for (var i = 0, length = list.length; i < length; i++) {
	      if (values) {
	        result[list[i]] = values[i];
	      } else {
	        result[list[i][0]] = list[i][1];
	      }
	    }
	    return result;
	  };

	  // Return the position of the first occurrence of an item in an array,
	  // or -1 if the item is not included in the array.
	  // If the array is large and already in sort order, pass `true`
	  // for **isSorted** to use binary search.
	  _.indexOf = function(array, item, isSorted) {
	    if (array == null) return -1;
	    var i = 0, length = array.length;
	    if (isSorted) {
	      if (typeof isSorted == 'number') {
	        i = isSorted < 0 ? Math.max(0, length + isSorted) : isSorted;
	      } else {
	        i = _.sortedIndex(array, item);
	        return array[i] === item ? i : -1;
	      }
	    }
	    for (; i < length; i++) if (array[i] === item) return i;
	    return -1;
	  };

	  _.lastIndexOf = function(array, item, from) {
	    if (array == null) return -1;
	    var idx = array.length;
	    if (typeof from == 'number') {
	      idx = from < 0 ? idx + from + 1 : Math.min(idx, from + 1);
	    }
	    while (--idx >= 0) if (array[idx] === item) return idx;
	    return -1;
	  };

	  // Generate an integer Array containing an arithmetic progression. A port of
	  // the native Python `range()` function. See
	  // [the Python documentation](http://docs.python.org/library/functions.html#range).
	  _.range = function(start, stop, step) {
	    if (arguments.length <= 1) {
	      stop = start || 0;
	      start = 0;
	    }
	    step = step || 1;

	    var length = Math.max(Math.ceil((stop - start) / step), 0);
	    var range = Array(length);

	    for (var idx = 0; idx < length; idx++, start += step) {
	      range[idx] = start;
	    }

	    return range;
	  };

	  // Function (ahem) Functions
	  // ------------------

	  // Reusable constructor function for prototype setting.
	  var Ctor = function(){};

	  // Create a function bound to a given object (assigning `this`, and arguments,
	  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
	  // available.
	  _.bind = function(func, context) {
	    var args, bound;
	    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
	    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
	    args = slice.call(arguments, 2);
	    bound = function() {
	      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
	      Ctor.prototype = func.prototype;
	      var self = new Ctor;
	      Ctor.prototype = null;
	      var result = func.apply(self, args.concat(slice.call(arguments)));
	      if (_.isObject(result)) return result;
	      return self;
	    };
	    return bound;
	  };

	  // Partially apply a function by creating a version that has had some of its
	  // arguments pre-filled, without changing its dynamic `this` context. _ acts
	  // as a placeholder, allowing any combination of arguments to be pre-filled.
	  _.partial = function(func) {
	    var boundArgs = slice.call(arguments, 1);
	    return function() {
	      var position = 0;
	      var args = boundArgs.slice();
	      for (var i = 0, length = args.length; i < length; i++) {
	        if (args[i] === _) args[i] = arguments[position++];
	      }
	      while (position < arguments.length) args.push(arguments[position++]);
	      return func.apply(this, args);
	    };
	  };

	  // Bind a number of an object's methods to that object. Remaining arguments
	  // are the method names to be bound. Useful for ensuring that all callbacks
	  // defined on an object belong to it.
	  _.bindAll = function(obj) {
	    var i, length = arguments.length, key;
	    if (length <= 1) throw new Error('bindAll must be passed function names');
	    for (i = 1; i < length; i++) {
	      key = arguments[i];
	      obj[key] = _.bind(obj[key], obj);
	    }
	    return obj;
	  };

	  // Memoize an expensive function by storing its results.
	  _.memoize = function(func, hasher) {
	    var memoize = function(key) {
	      var cache = memoize.cache;
	      var address = hasher ? hasher.apply(this, arguments) : key;
	      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
	      return cache[address];
	    };
	    memoize.cache = {};
	    return memoize;
	  };

	  // Delays a function for the given number of milliseconds, and then calls
	  // it with the arguments supplied.
	  _.delay = function(func, wait) {
	    var args = slice.call(arguments, 2);
	    return setTimeout(function(){
	      return func.apply(null, args);
	    }, wait);
	  };

	  // Defers a function, scheduling it to run after the current call stack has
	  // cleared.
	  _.defer = function(func) {
	    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
	  };

	  // Returns a function, that, when invoked, will only be triggered at most once
	  // during a given window of time. Normally, the throttled function will run
	  // as much as it can, without ever going more than once per `wait` duration;
	  // but if you'd like to disable the execution on the leading edge, pass
	  // `{leading: false}`. To disable execution on the trailing edge, ditto.
	  _.throttle = function(func, wait, options) {
	    var context, args, result;
	    var timeout = null;
	    var previous = 0;
	    if (!options) options = {};
	    var later = function() {
	      previous = options.leading === false ? 0 : _.now();
	      timeout = null;
	      result = func.apply(context, args);
	      if (!timeout) context = args = null;
	    };
	    return function() {
	      var now = _.now();
	      if (!previous && options.leading === false) previous = now;
	      var remaining = wait - (now - previous);
	      context = this;
	      args = arguments;
	      if (remaining <= 0 || remaining > wait) {
	        clearTimeout(timeout);
	        timeout = null;
	        previous = now;
	        result = func.apply(context, args);
	        if (!timeout) context = args = null;
	      } else if (!timeout && options.trailing !== false) {
	        timeout = setTimeout(later, remaining);
	      }
	      return result;
	    };
	  };

	  // Returns a function, that, as long as it continues to be invoked, will not
	  // be triggered. The function will be called after it stops being called for
	  // N milliseconds. If `immediate` is passed, trigger the function on the
	  // leading edge, instead of the trailing.
	  _.debounce = function(func, wait, immediate) {
	    var timeout, args, context, timestamp, result;

	    var later = function() {
	      var last = _.now() - timestamp;

	      if (last < wait && last > 0) {
	        timeout = setTimeout(later, wait - last);
	      } else {
	        timeout = null;
	        if (!immediate) {
	          result = func.apply(context, args);
	          if (!timeout) context = args = null;
	        }
	      }
	    };

	    return function() {
	      context = this;
	      args = arguments;
	      timestamp = _.now();
	      var callNow = immediate && !timeout;
	      if (!timeout) timeout = setTimeout(later, wait);
	      if (callNow) {
	        result = func.apply(context, args);
	        context = args = null;
	      }

	      return result;
	    };
	  };

	  // Returns the first function passed as an argument to the second,
	  // allowing you to adjust arguments, run code before and after, and
	  // conditionally execute the original function.
	  _.wrap = function(func, wrapper) {
	    return _.partial(wrapper, func);
	  };

	  // Returns a negated version of the passed-in predicate.
	  _.negate = function(predicate) {
	    return function() {
	      return !predicate.apply(this, arguments);
	    };
	  };

	  // Returns a function that is the composition of a list of functions, each
	  // consuming the return value of the function that follows.
	  _.compose = function() {
	    var args = arguments;
	    var start = args.length - 1;
	    return function() {
	      var i = start;
	      var result = args[start].apply(this, arguments);
	      while (i--) result = args[i].call(this, result);
	      return result;
	    };
	  };

	  // Returns a function that will only be executed after being called N times.
	  _.after = function(times, func) {
	    return function() {
	      if (--times < 1) {
	        return func.apply(this, arguments);
	      }
	    };
	  };

	  // Returns a function that will only be executed before being called N times.
	  _.before = function(times, func) {
	    var memo;
	    return function() {
	      if (--times > 0) {
	        memo = func.apply(this, arguments);
	      } else {
	        func = null;
	      }
	      return memo;
	    };
	  };

	  // Returns a function that will be executed at most one time, no matter how
	  // often you call it. Useful for lazy initialization.
	  _.once = _.partial(_.before, 2);

	  // Object Functions
	  // ----------------

	  // Retrieve the names of an object's properties.
	  // Delegates to **ECMAScript 5**'s native `Object.keys`
	  _.keys = function(obj) {
	    if (!_.isObject(obj)) return [];
	    if (nativeKeys) return nativeKeys(obj);
	    var keys = [];
	    for (var key in obj) if (_.has(obj, key)) keys.push(key);
	    return keys;
	  };

	  // Retrieve the values of an object's properties.
	  _.values = function(obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var values = Array(length);
	    for (var i = 0; i < length; i++) {
	      values[i] = obj[keys[i]];
	    }
	    return values;
	  };

	  // Convert an object into a list of `[key, value]` pairs.
	  _.pairs = function(obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var pairs = Array(length);
	    for (var i = 0; i < length; i++) {
	      pairs[i] = [keys[i], obj[keys[i]]];
	    }
	    return pairs;
	  };

	  // Invert the keys and values of an object. The values must be serializable.
	  _.invert = function(obj) {
	    var result = {};
	    var keys = _.keys(obj);
	    for (var i = 0, length = keys.length; i < length; i++) {
	      result[obj[keys[i]]] = keys[i];
	    }
	    return result;
	  };

	  // Return a sorted list of the function names available on the object.
	  // Aliased as `methods`
	  _.functions = _.methods = function(obj) {
	    var names = [];
	    for (var key in obj) {
	      if (_.isFunction(obj[key])) names.push(key);
	    }
	    return names.sort();
	  };

	  // Extend a given object with all the properties in passed-in object(s).
	  _.extend = function(obj) {
	    if (!_.isObject(obj)) return obj;
	    var source, prop;
	    for (var i = 1, length = arguments.length; i < length; i++) {
	      source = arguments[i];
	      for (prop in source) {
	        if (hasOwnProperty.call(source, prop)) {
	            obj[prop] = source[prop];
	        }
	      }
	    }
	    return obj;
	  };

	  // Return a copy of the object only containing the whitelisted properties.
	  _.pick = function(obj, iteratee, context) {
	    var result = {}, key;
	    if (obj == null) return result;
	    if (_.isFunction(iteratee)) {
	      iteratee = createCallback(iteratee, context);
	      for (key in obj) {
	        var value = obj[key];
	        if (iteratee(value, key, obj)) result[key] = value;
	      }
	    } else {
	      var keys = concat.apply([], slice.call(arguments, 1));
	      obj = new Object(obj);
	      for (var i = 0, length = keys.length; i < length; i++) {
	        key = keys[i];
	        if (key in obj) result[key] = obj[key];
	      }
	    }
	    return result;
	  };

	   // Return a copy of the object without the blacklisted properties.
	  _.omit = function(obj, iteratee, context) {
	    if (_.isFunction(iteratee)) {
	      iteratee = _.negate(iteratee);
	    } else {
	      var keys = _.map(concat.apply([], slice.call(arguments, 1)), String);
	      iteratee = function(value, key) {
	        return !_.contains(keys, key);
	      };
	    }
	    return _.pick(obj, iteratee, context);
	  };

	  // Fill in a given object with default properties.
	  _.defaults = function(obj) {
	    if (!_.isObject(obj)) return obj;
	    for (var i = 1, length = arguments.length; i < length; i++) {
	      var source = arguments[i];
	      for (var prop in source) {
	        if (obj[prop] === void 0) obj[prop] = source[prop];
	      }
	    }
	    return obj;
	  };

	  // Create a (shallow-cloned) duplicate of an object.
	  _.clone = function(obj) {
	    if (!_.isObject(obj)) return obj;
	    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
	  };

	  // Invokes interceptor with the obj, and then returns obj.
	  // The primary purpose of this method is to "tap into" a method chain, in
	  // order to perform operations on intermediate results within the chain.
	  _.tap = function(obj, interceptor) {
	    interceptor(obj);
	    return obj;
	  };

	  // Internal recursive comparison function for `isEqual`.
	  var eq = function(a, b, aStack, bStack) {
	    // Identical objects are equal. `0 === -0`, but they aren't identical.
	    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
	    if (a === b) return a !== 0 || 1 / a === 1 / b;
	    // A strict comparison is necessary because `null == undefined`.
	    if (a == null || b == null) return a === b;
	    // Unwrap any wrapped objects.
	    if (a instanceof _) a = a._wrapped;
	    if (b instanceof _) b = b._wrapped;
	    // Compare `[[Class]]` names.
	    var className = toString.call(a);
	    if (className !== toString.call(b)) return false;
	    switch (className) {
	      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
	      case '[object RegExp]':
	      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
	      case '[object String]':
	        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
	        // equivalent to `new String("5")`.
	        return '' + a === '' + b;
	      case '[object Number]':
	        // `NaN`s are equivalent, but non-reflexive.
	        // Object(NaN) is equivalent to NaN
	        if (+a !== +a) return +b !== +b;
	        // An `egal` comparison is performed for other numeric values.
	        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
	      case '[object Date]':
	      case '[object Boolean]':
	        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
	        // millisecond representations. Note that invalid dates with millisecond representations
	        // of `NaN` are not equivalent.
	        return +a === +b;
	    }
	    if (typeof a != 'object' || typeof b != 'object') return false;
	    // Assume equality for cyclic structures. The algorithm for detecting cyclic
	    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
	    var length = aStack.length;
	    while (length--) {
	      // Linear search. Performance is inversely proportional to the number of
	      // unique nested structures.
	      if (aStack[length] === a) return bStack[length] === b;
	    }
	    // Objects with different constructors are not equivalent, but `Object`s
	    // from different frames are.
	    var aCtor = a.constructor, bCtor = b.constructor;
	    if (
	      aCtor !== bCtor &&
	      // Handle Object.create(x) cases
	      'constructor' in a && 'constructor' in b &&
	      !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
	        _.isFunction(bCtor) && bCtor instanceof bCtor)
	    ) {
	      return false;
	    }
	    // Add the first object to the stack of traversed objects.
	    aStack.push(a);
	    bStack.push(b);
	    var size, result;
	    // Recursively compare objects and arrays.
	    if (className === '[object Array]') {
	      // Compare array lengths to determine if a deep comparison is necessary.
	      size = a.length;
	      result = size === b.length;
	      if (result) {
	        // Deep compare the contents, ignoring non-numeric properties.
	        while (size--) {
	          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
	        }
	      }
	    } else {
	      // Deep compare objects.
	      var keys = _.keys(a), key;
	      size = keys.length;
	      // Ensure that both objects contain the same number of properties before comparing deep equality.
	      result = _.keys(b).length === size;
	      if (result) {
	        while (size--) {
	          // Deep compare each member
	          key = keys[size];
	          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
	        }
	      }
	    }
	    // Remove the first object from the stack of traversed objects.
	    aStack.pop();
	    bStack.pop();
	    return result;
	  };

	  // Perform a deep comparison to check if two objects are equal.
	  _.isEqual = function(a, b) {
	    return eq(a, b, [], []);
	  };

	  // Is a given array, string, or object empty?
	  // An "empty" object has no enumerable own-properties.
	  _.isEmpty = function(obj) {
	    if (obj == null) return true;
	    if (_.isArray(obj) || _.isString(obj) || _.isArguments(obj)) return obj.length === 0;
	    for (var key in obj) if (_.has(obj, key)) return false;
	    return true;
	  };

	  // Is a given value a DOM element?
	  _.isElement = function(obj) {
	    return !!(obj && obj.nodeType === 1);
	  };

	  // Is a given value an array?
	  // Delegates to ECMA5's native Array.isArray
	  _.isArray = nativeIsArray || function(obj) {
	    return toString.call(obj) === '[object Array]';
	  };

	  // Is a given variable an object?
	  _.isObject = function(obj) {
	    var type = typeof obj;
	    return type === 'function' || type === 'object' && !!obj;
	  };

	  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
	  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
	    _['is' + name] = function(obj) {
	      return toString.call(obj) === '[object ' + name + ']';
	    };
	  });

	  // Define a fallback version of the method in browsers (ahem, IE), where
	  // there isn't any inspectable "Arguments" type.
	  if (!_.isArguments(arguments)) {
	    _.isArguments = function(obj) {
	      return _.has(obj, 'callee');
	    };
	  }

	  // Optimize `isFunction` if appropriate. Work around an IE 11 bug.
	  if (true) {
	    _.isFunction = function(obj) {
	      return typeof obj == 'function' || false;
	    };
	  }

	  // Is a given object a finite number?
	  _.isFinite = function(obj) {
	    return isFinite(obj) && !isNaN(parseFloat(obj));
	  };

	  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
	  _.isNaN = function(obj) {
	    return _.isNumber(obj) && obj !== +obj;
	  };

	  // Is a given value a boolean?
	  _.isBoolean = function(obj) {
	    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
	  };

	  // Is a given value equal to null?
	  _.isNull = function(obj) {
	    return obj === null;
	  };

	  // Is a given variable undefined?
	  _.isUndefined = function(obj) {
	    return obj === void 0;
	  };

	  // Shortcut function for checking if an object has a given property directly
	  // on itself (in other words, not on a prototype).
	  _.has = function(obj, key) {
	    return obj != null && hasOwnProperty.call(obj, key);
	  };

	  // Utility Functions
	  // -----------------

	  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
	  // previous owner. Returns a reference to the Underscore object.
	  _.noConflict = function() {
	    root._ = previousUnderscore;
	    return this;
	  };

	  // Keep the identity function around for default iteratees.
	  _.identity = function(value) {
	    return value;
	  };

	  _.constant = function(value) {
	    return function() {
	      return value;
	    };
	  };

	  _.noop = function(){};

	  _.property = function(key) {
	    return function(obj) {
	      return obj[key];
	    };
	  };

	  // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
	  _.matches = function(attrs) {
	    var pairs = _.pairs(attrs), length = pairs.length;
	    return function(obj) {
	      if (obj == null) return !length;
	      obj = new Object(obj);
	      for (var i = 0; i < length; i++) {
	        var pair = pairs[i], key = pair[0];
	        if (pair[1] !== obj[key] || !(key in obj)) return false;
	      }
	      return true;
	    };
	  };

	  // Run a function **n** times.
	  _.times = function(n, iteratee, context) {
	    var accum = Array(Math.max(0, n));
	    iteratee = createCallback(iteratee, context, 1);
	    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
	    return accum;
	  };

	  // Return a random integer between min and max (inclusive).
	  _.random = function(min, max) {
	    if (max == null) {
	      max = min;
	      min = 0;
	    }
	    return min + Math.floor(Math.random() * (max - min + 1));
	  };

	  // A (possibly faster) way to get the current timestamp as an integer.
	  _.now = Date.now || function() {
	    return new Date().getTime();
	  };

	   // List of HTML entities for escaping.
	  var escapeMap = {
	    '&': '&amp;',
	    '<': '&lt;',
	    '>': '&gt;',
	    '"': '&quot;',
	    "'": '&#x27;',
	    '`': '&#x60;'
	  };
	  var unescapeMap = _.invert(escapeMap);

	  // Functions for escaping and unescaping strings to/from HTML interpolation.
	  var createEscaper = function(map) {
	    var escaper = function(match) {
	      return map[match];
	    };
	    // Regexes for identifying a key that needs to be escaped
	    var source = '(?:' + _.keys(map).join('|') + ')';
	    var testRegexp = RegExp(source);
	    var replaceRegexp = RegExp(source, 'g');
	    return function(string) {
	      string = string == null ? '' : '' + string;
	      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
	    };
	  };
	  _.escape = createEscaper(escapeMap);
	  _.unescape = createEscaper(unescapeMap);

	  // If the value of the named `property` is a function then invoke it with the
	  // `object` as context; otherwise, return it.
	  _.result = function(object, property) {
	    if (object == null) return void 0;
	    var value = object[property];
	    return _.isFunction(value) ? object[property]() : value;
	  };

	  // Generate a unique integer id (unique within the entire client session).
	  // Useful for temporary DOM ids.
	  var idCounter = 0;
	  _.uniqueId = function(prefix) {
	    var id = ++idCounter + '';
	    return prefix ? prefix + id : id;
	  };

	  // By default, Underscore uses ERB-style template delimiters, change the
	  // following template settings to use alternative delimiters.
	  _.templateSettings = {
	    evaluate    : /<%([\s\S]+?)%>/g,
	    interpolate : /<%=([\s\S]+?)%>/g,
	    escape      : /<%-([\s\S]+?)%>/g
	  };

	  // When customizing `templateSettings`, if you don't want to define an
	  // interpolation, evaluation or escaping regex, we need one that is
	  // guaranteed not to match.
	  var noMatch = /(.)^/;

	  // Certain characters need to be escaped so that they can be put into a
	  // string literal.
	  var escapes = {
	    "'":      "'",
	    '\\':     '\\',
	    '\r':     'r',
	    '\n':     'n',
	    '\u2028': 'u2028',
	    '\u2029': 'u2029'
	  };

	  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

	  var escapeChar = function(match) {
	    return '\\' + escapes[match];
	  };

	  // JavaScript micro-templating, similar to John Resig's implementation.
	  // Underscore templating handles arbitrary delimiters, preserves whitespace,
	  // and correctly escapes quotes within interpolated code.
	  // NB: `oldSettings` only exists for backwards compatibility.
	  _.template = function(text, settings, oldSettings) {
	    if (!settings && oldSettings) settings = oldSettings;
	    settings = _.defaults({}, settings, _.templateSettings);

	    // Combine delimiters into one regular expression via alternation.
	    var matcher = RegExp([
	      (settings.escape || noMatch).source,
	      (settings.interpolate || noMatch).source,
	      (settings.evaluate || noMatch).source
	    ].join('|') + '|$', 'g');

	    // Compile the template source, escaping string literals appropriately.
	    var index = 0;
	    var source = "__p+='";
	    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
	      source += text.slice(index, offset).replace(escaper, escapeChar);
	      index = offset + match.length;

	      if (escape) {
	        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
	      } else if (interpolate) {
	        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
	      } else if (evaluate) {
	        source += "';\n" + evaluate + "\n__p+='";
	      }

	      // Adobe VMs need the match returned to produce the correct offest.
	      return match;
	    });
	    source += "';\n";

	    // If a variable is not specified, place data values in local scope.
	    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

	    source = "var __t,__p='',__j=Array.prototype.join," +
	      "print=function(){__p+=__j.call(arguments,'');};\n" +
	      source + 'return __p;\n';

	    try {
	      var render = new Function(settings.variable || 'obj', '_', source);
	    } catch (e) {
	      e.source = source;
	      throw e;
	    }

	    var template = function(data) {
	      return render.call(this, data, _);
	    };

	    // Provide the compiled source as a convenience for precompilation.
	    var argument = settings.variable || 'obj';
	    template.source = 'function(' + argument + '){\n' + source + '}';

	    return template;
	  };

	  // Add a "chain" function. Start chaining a wrapped Underscore object.
	  _.chain = function(obj) {
	    var instance = _(obj);
	    instance._chain = true;
	    return instance;
	  };

	  // OOP
	  // ---------------
	  // If Underscore is called as a function, it returns a wrapped object that
	  // can be used OO-style. This wrapper holds altered versions of all the
	  // underscore functions. Wrapped objects may be chained.

	  // Helper function to continue chaining intermediate results.
	  var result = function(obj) {
	    return this._chain ? _(obj).chain() : obj;
	  };

	  // Add your own custom functions to the Underscore object.
	  _.mixin = function(obj) {
	    _.each(_.functions(obj), function(name) {
	      var func = _[name] = obj[name];
	      _.prototype[name] = function() {
	        var args = [this._wrapped];
	        push.apply(args, arguments);
	        return result.call(this, func.apply(_, args));
	      };
	    });
	  };

	  // Add all of the Underscore functions to the wrapper object.
	  _.mixin(_);

	  // Add all mutator Array functions to the wrapper.
	  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      var obj = this._wrapped;
	      method.apply(obj, arguments);
	      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
	      return result.call(this, obj);
	    };
	  });

	  // Add all accessor Array functions to the wrapper.
	  _.each(['concat', 'join', 'slice'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      return result.call(this, method.apply(this._wrapped, arguments));
	    };
	  });

	  // Extracts the result from a wrapped and chained object.
	  _.prototype.value = function() {
	    return this._wrapped;
	  };

	  // AMD registration happens at the end for compatibility with AMD loaders
	  // that may not enforce next-turn semantics on modules. Even though general
	  // practice for AMD registration is to be anonymous, underscore registers
	  // as a named module because, like jQuery, it is a base library that is
	  // popular enough to be bundled in a third party lib, but not be part of
	  // an AMD load request. Those cases could generate an error when an
	  // anonymous define() is called outside of a loader request.
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
	      return _;
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	}.call(this));


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	module.exports = Stream;

	var EE = __webpack_require__(8).EventEmitter;
	var inherits = __webpack_require__(9);

	inherits(Stream, EE);
	Stream.Readable = __webpack_require__(10);
	Stream.Writable = __webpack_require__(11);
	Stream.Duplex = __webpack_require__(12);
	Stream.Transform = __webpack_require__(13);
	Stream.PassThrough = __webpack_require__(14);

	// Backwards-compat with node 0.4.x
	Stream.Stream = Stream;



	// old-style streams.  Note that the pipe method (the only relevant
	// part of this class) is overridden in the Readable class.

	function Stream() {
	  EE.call(this);
	}

	Stream.prototype.pipe = function(dest, options) {
	  var source = this;

	  function ondata(chunk) {
	    if (dest.writable) {
	      if (false === dest.write(chunk) && source.pause) {
	        source.pause();
	      }
	    }
	  }

	  source.on('data', ondata);

	  function ondrain() {
	    if (source.readable && source.resume) {
	      source.resume();
	    }
	  }

	  dest.on('drain', ondrain);

	  // If the 'end' option is not supplied, dest.end() will be called when
	  // source gets the 'end' or 'close' events.  Only dest.end() once.
	  if (!dest._isStdio && (!options || options.end !== false)) {
	    source.on('end', onend);
	    source.on('close', onclose);
	  }

	  var didOnEnd = false;
	  function onend() {
	    if (didOnEnd) return;
	    didOnEnd = true;

	    dest.end();
	  }


	  function onclose() {
	    if (didOnEnd) return;
	    didOnEnd = true;

	    if (typeof dest.destroy === 'function') dest.destroy();
	  }

	  // don't leave dangling pipes when there are errors.
	  function onerror(er) {
	    cleanup();
	    if (EE.listenerCount(this, 'error') === 0) {
	      throw er; // Unhandled stream error in pipe.
	    }
	  }

	  source.on('error', onerror);
	  dest.on('error', onerror);

	  // remove all the event listeners that were added.
	  function cleanup() {
	    source.removeListener('data', ondata);
	    dest.removeListener('drain', ondrain);

	    source.removeListener('end', onend);
	    source.removeListener('close', onclose);

	    source.removeListener('error', onerror);
	    dest.removeListener('error', onerror);

	    source.removeListener('end', cleanup);
	    source.removeListener('close', cleanup);

	    dest.removeListener('close', cleanup);
	  }

	  source.on('end', cleanup);
	  source.on('close', cleanup);

	  dest.on('close', cleanup);

	  dest.emit('pipe', source);

	  // Allow for unix-like usage: A.pipe(B).pipe(C)
	  return dest;
	};


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	// shim for using process in browser

	var process = module.exports = {};

	process.nextTick = (function () {
	    var canSetImmediate = typeof window !== 'undefined'
	    && window.setImmediate;
	    var canPost = typeof window !== 'undefined'
	    && window.postMessage && window.addEventListener
	    ;

	    if (canSetImmediate) {
	        return function (f) { return window.setImmediate(f) };
	    }

	    if (canPost) {
	        var queue = [];
	        window.addEventListener('message', function (ev) {
	            var source = ev.source;
	            if ((source === window || source === null) && ev.data === 'process-tick') {
	                ev.stopPropagation();
	                if (queue.length > 0) {
	                    var fn = queue.shift();
	                    fn();
	                }
	            }
	        }, true);

	        return function nextTick(fn) {
	            queue.push(fn);
	            window.postMessage('process-tick', '*');
	        };
	    }

	    return function nextTick(fn) {
	        setTimeout(fn, 0);
	    };
	})();

	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	}

	// TODO(shtylman)
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;

	  if (!this._events)
	    this._events = {};

	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      }
	      throw TypeError('Uncaught, unspecified "error" event.');
	    }
	  }

	  handler = this._events[type];

	  if (isUndefined(handler))
	    return false;

	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        len = arguments.length;
	        args = new Array(len - 1);
	        for (i = 1; i < len; i++)
	          args[i - 1] = arguments[i];
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    len = arguments.length;
	    args = new Array(len - 1);
	    for (i = 1; i < len; i++)
	      args[i - 1] = arguments[i];

	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }

	  return true;
	};

	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events)
	    this._events = {};

	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);

	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];

	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    var m;
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }

	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  var fired = false;

	  function g() {
	    this.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  g.listener = listener;
	  this.on(type, g);

	  return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events || !this._events[type])
	    return this;

	  list = this._events[type];
	  length = list.length;
	  position = -1;

	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);

	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }

	    if (position < 0)
	      return this;

	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }

	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;

	  if (!this._events)
	    return this;

	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }

	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }

	  listeners = this._events[type];

	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];

	  return this;
	};

	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  var ret;
	  if (!emitter._events || !emitter._events[type])
	    ret = 0;
	  else if (isFunction(emitter._events[type]))
	    ret = 1;
	  else
	    ret = emitter._events[type].length;
	  return ret;
	};

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(15);
	exports.Stream = __webpack_require__(6);
	exports.Readable = exports;
	exports.Writable = __webpack_require__(16);
	exports.Duplex = __webpack_require__(17);
	exports.Transform = __webpack_require__(18);
	exports.PassThrough = __webpack_require__(19);


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(16)


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(17)


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(18)


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(19)


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	module.exports = Readable;

	/*<replacement>*/
	var isArray = __webpack_require__(21);
	/*</replacement>*/


	/*<replacement>*/
	var Buffer = __webpack_require__(22).Buffer;
	/*</replacement>*/

	Readable.ReadableState = ReadableState;

	var EE = __webpack_require__(8).EventEmitter;

	/*<replacement>*/
	if (!EE.listenerCount) EE.listenerCount = function(emitter, type) {
	  return emitter.listeners(type).length;
	};
	/*</replacement>*/

	var Stream = __webpack_require__(6);

	/*<replacement>*/
	var util = __webpack_require__(25);
	util.inherits = __webpack_require__(24);
	/*</replacement>*/

	var StringDecoder;


	/*<replacement>*/
	var debug = __webpack_require__(20);
	if (debug && debug.debuglog) {
	  debug = debug.debuglog('stream');
	} else {
	  debug = function () {};
	}
	/*</replacement>*/


	util.inherits(Readable, Stream);

	function ReadableState(options, stream) {
	  var Duplex = __webpack_require__(17);

	  options = options || {};

	  // the point at which it stops calling _read() to fill the buffer
	  // Note: 0 is a valid value, means "don't call _read preemptively ever"
	  var hwm = options.highWaterMark;
	  var defaultHwm = options.objectMode ? 16 : 16 * 1024;
	  this.highWaterMark = (hwm || hwm === 0) ? hwm : defaultHwm;

	  // cast to ints.
	  this.highWaterMark = ~~this.highWaterMark;

	  this.buffer = [];
	  this.length = 0;
	  this.pipes = null;
	  this.pipesCount = 0;
	  this.flowing = null;
	  this.ended = false;
	  this.endEmitted = false;
	  this.reading = false;

	  // a flag to be able to tell if the onwrite cb is called immediately,
	  // or on a later tick.  We set this to true at first, because any
	  // actions that shouldn't happen until "later" should generally also
	  // not happen before the first write call.
	  this.sync = true;

	  // whenever we return null, then we set a flag to say
	  // that we're awaiting a 'readable' event emission.
	  this.needReadable = false;
	  this.emittedReadable = false;
	  this.readableListening = false;


	  // object stream flag. Used to make read(n) ignore n and to
	  // make all the buffer merging and length checks go away
	  this.objectMode = !!options.objectMode;

	  if (stream instanceof Duplex)
	    this.objectMode = this.objectMode || !!options.readableObjectMode;

	  // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.
	  this.defaultEncoding = options.defaultEncoding || 'utf8';

	  // when piping, we only care about 'readable' events that happen
	  // after read()ing all the bytes and not getting any pushback.
	  this.ranOut = false;

	  // the number of writers that are awaiting a drain event in .pipe()s
	  this.awaitDrain = 0;

	  // if true, a maybeReadMore has been scheduled
	  this.readingMore = false;

	  this.decoder = null;
	  this.encoding = null;
	  if (options.encoding) {
	    if (!StringDecoder)
	      StringDecoder = __webpack_require__(23).StringDecoder;
	    this.decoder = new StringDecoder(options.encoding);
	    this.encoding = options.encoding;
	  }
	}

	function Readable(options) {
	  var Duplex = __webpack_require__(17);

	  if (!(this instanceof Readable))
	    return new Readable(options);

	  this._readableState = new ReadableState(options, this);

	  // legacy
	  this.readable = true;

	  Stream.call(this);
	}

	// Manually shove something into the read() buffer.
	// This returns true if the highWaterMark has not been hit yet,
	// similar to how Writable.write() returns true if you should
	// write() some more.
	Readable.prototype.push = function(chunk, encoding) {
	  var state = this._readableState;

	  if (util.isString(chunk) && !state.objectMode) {
	    encoding = encoding || state.defaultEncoding;
	    if (encoding !== state.encoding) {
	      chunk = new Buffer(chunk, encoding);
	      encoding = '';
	    }
	  }

	  return readableAddChunk(this, state, chunk, encoding, false);
	};

	// Unshift should *always* be something directly out of read()
	Readable.prototype.unshift = function(chunk) {
	  var state = this._readableState;
	  return readableAddChunk(this, state, chunk, '', true);
	};

	function readableAddChunk(stream, state, chunk, encoding, addToFront) {
	  var er = chunkInvalid(state, chunk);
	  if (er) {
	    stream.emit('error', er);
	  } else if (util.isNullOrUndefined(chunk)) {
	    state.reading = false;
	    if (!state.ended)
	      onEofChunk(stream, state);
	  } else if (state.objectMode || chunk && chunk.length > 0) {
	    if (state.ended && !addToFront) {
	      var e = new Error('stream.push() after EOF');
	      stream.emit('error', e);
	    } else if (state.endEmitted && addToFront) {
	      var e = new Error('stream.unshift() after end event');
	      stream.emit('error', e);
	    } else {
	      if (state.decoder && !addToFront && !encoding)
	        chunk = state.decoder.write(chunk);

	      if (!addToFront)
	        state.reading = false;

	      // if we want the data now, just emit it.
	      if (state.flowing && state.length === 0 && !state.sync) {
	        stream.emit('data', chunk);
	        stream.read(0);
	      } else {
	        // update the buffer info.
	        state.length += state.objectMode ? 1 : chunk.length;
	        if (addToFront)
	          state.buffer.unshift(chunk);
	        else
	          state.buffer.push(chunk);

	        if (state.needReadable)
	          emitReadable(stream);
	      }

	      maybeReadMore(stream, state);
	    }
	  } else if (!addToFront) {
	    state.reading = false;
	  }

	  return needMoreData(state);
	}



	// if it's past the high water mark, we can push in some more.
	// Also, if we have no data yet, we can stand some
	// more bytes.  This is to work around cases where hwm=0,
	// such as the repl.  Also, if the push() triggered a
	// readable event, and the user called read(largeNumber) such that
	// needReadable was set, then we ought to push more, so that another
	// 'readable' event will be triggered.
	function needMoreData(state) {
	  return !state.ended &&
	         (state.needReadable ||
	          state.length < state.highWaterMark ||
	          state.length === 0);
	}

	// backwards compatibility.
	Readable.prototype.setEncoding = function(enc) {
	  if (!StringDecoder)
	    StringDecoder = __webpack_require__(23).StringDecoder;
	  this._readableState.decoder = new StringDecoder(enc);
	  this._readableState.encoding = enc;
	  return this;
	};

	// Don't raise the hwm > 128MB
	var MAX_HWM = 0x800000;
	function roundUpToNextPowerOf2(n) {
	  if (n >= MAX_HWM) {
	    n = MAX_HWM;
	  } else {
	    // Get the next highest power of 2
	    n--;
	    for (var p = 1; p < 32; p <<= 1) n |= n >> p;
	    n++;
	  }
	  return n;
	}

	function howMuchToRead(n, state) {
	  if (state.length === 0 && state.ended)
	    return 0;

	  if (state.objectMode)
	    return n === 0 ? 0 : 1;

	  if (isNaN(n) || util.isNull(n)) {
	    // only flow one buffer at a time
	    if (state.flowing && state.buffer.length)
	      return state.buffer[0].length;
	    else
	      return state.length;
	  }

	  if (n <= 0)
	    return 0;

	  // If we're asking for more than the target buffer level,
	  // then raise the water mark.  Bump up to the next highest
	  // power of 2, to prevent increasing it excessively in tiny
	  // amounts.
	  if (n > state.highWaterMark)
	    state.highWaterMark = roundUpToNextPowerOf2(n);

	  // don't have that much.  return null, unless we've ended.
	  if (n > state.length) {
	    if (!state.ended) {
	      state.needReadable = true;
	      return 0;
	    } else
	      return state.length;
	  }

	  return n;
	}

	// you can override either this method, or the async _read(n) below.
	Readable.prototype.read = function(n) {
	  debug('read', n);
	  var state = this._readableState;
	  var nOrig = n;

	  if (!util.isNumber(n) || n > 0)
	    state.emittedReadable = false;

	  // if we're doing read(0) to trigger a readable event, but we
	  // already have a bunch of data in the buffer, then just trigger
	  // the 'readable' event and move on.
	  if (n === 0 &&
	      state.needReadable &&
	      (state.length >= state.highWaterMark || state.ended)) {
	    debug('read: emitReadable', state.length, state.ended);
	    if (state.length === 0 && state.ended)
	      endReadable(this);
	    else
	      emitReadable(this);
	    return null;
	  }

	  n = howMuchToRead(n, state);

	  // if we've ended, and we're now clear, then finish it up.
	  if (n === 0 && state.ended) {
	    if (state.length === 0)
	      endReadable(this);
	    return null;
	  }

	  // All the actual chunk generation logic needs to be
	  // *below* the call to _read.  The reason is that in certain
	  // synthetic stream cases, such as passthrough streams, _read
	  // may be a completely synchronous operation which may change
	  // the state of the read buffer, providing enough data when
	  // before there was *not* enough.
	  //
	  // So, the steps are:
	  // 1. Figure out what the state of things will be after we do
	  // a read from the buffer.
	  //
	  // 2. If that resulting state will trigger a _read, then call _read.
	  // Note that this may be asynchronous, or synchronous.  Yes, it is
	  // deeply ugly to write APIs this way, but that still doesn't mean
	  // that the Readable class should behave improperly, as streams are
	  // designed to be sync/async agnostic.
	  // Take note if the _read call is sync or async (ie, if the read call
	  // has returned yet), so that we know whether or not it's safe to emit
	  // 'readable' etc.
	  //
	  // 3. Actually pull the requested chunks out of the buffer and return.

	  // if we need a readable event, then we need to do some reading.
	  var doRead = state.needReadable;
	  debug('need readable', doRead);

	  // if we currently have less than the highWaterMark, then also read some
	  if (state.length === 0 || state.length - n < state.highWaterMark) {
	    doRead = true;
	    debug('length less than watermark', doRead);
	  }

	  // however, if we've ended, then there's no point, and if we're already
	  // reading, then it's unnecessary.
	  if (state.ended || state.reading) {
	    doRead = false;
	    debug('reading or ended', doRead);
	  }

	  if (doRead) {
	    debug('do read');
	    state.reading = true;
	    state.sync = true;
	    // if the length is currently zero, then we *need* a readable event.
	    if (state.length === 0)
	      state.needReadable = true;
	    // call internal read method
	    this._read(state.highWaterMark);
	    state.sync = false;
	  }

	  // If _read pushed data synchronously, then `reading` will be false,
	  // and we need to re-evaluate how much data we can return to the user.
	  if (doRead && !state.reading)
	    n = howMuchToRead(nOrig, state);

	  var ret;
	  if (n > 0)
	    ret = fromList(n, state);
	  else
	    ret = null;

	  if (util.isNull(ret)) {
	    state.needReadable = true;
	    n = 0;
	  }

	  state.length -= n;

	  // If we have nothing in the buffer, then we want to know
	  // as soon as we *do* get something into the buffer.
	  if (state.length === 0 && !state.ended)
	    state.needReadable = true;

	  // If we tried to read() past the EOF, then emit end on the next tick.
	  if (nOrig !== n && state.ended && state.length === 0)
	    endReadable(this);

	  if (!util.isNull(ret))
	    this.emit('data', ret);

	  return ret;
	};

	function chunkInvalid(state, chunk) {
	  var er = null;
	  if (!util.isBuffer(chunk) &&
	      !util.isString(chunk) &&
	      !util.isNullOrUndefined(chunk) &&
	      !state.objectMode) {
	    er = new TypeError('Invalid non-string/buffer chunk');
	  }
	  return er;
	}


	function onEofChunk(stream, state) {
	  if (state.decoder && !state.ended) {
	    var chunk = state.decoder.end();
	    if (chunk && chunk.length) {
	      state.buffer.push(chunk);
	      state.length += state.objectMode ? 1 : chunk.length;
	    }
	  }
	  state.ended = true;

	  // emit 'readable' now to make sure it gets picked up.
	  emitReadable(stream);
	}

	// Don't emit readable right away in sync mode, because this can trigger
	// another read() call => stack overflow.  This way, it might trigger
	// a nextTick recursion warning, but that's not so bad.
	function emitReadable(stream) {
	  var state = stream._readableState;
	  state.needReadable = false;
	  if (!state.emittedReadable) {
	    debug('emitReadable', state.flowing);
	    state.emittedReadable = true;
	    if (state.sync)
	      process.nextTick(function() {
	        emitReadable_(stream);
	      });
	    else
	      emitReadable_(stream);
	  }
	}

	function emitReadable_(stream) {
	  debug('emit readable');
	  stream.emit('readable');
	  flow(stream);
	}


	// at this point, the user has presumably seen the 'readable' event,
	// and called read() to consume some data.  that may have triggered
	// in turn another _read(n) call, in which case reading = true if
	// it's in progress.
	// However, if we're not ended, or reading, and the length < hwm,
	// then go ahead and try to read some more preemptively.
	function maybeReadMore(stream, state) {
	  if (!state.readingMore) {
	    state.readingMore = true;
	    process.nextTick(function() {
	      maybeReadMore_(stream, state);
	    });
	  }
	}

	function maybeReadMore_(stream, state) {
	  var len = state.length;
	  while (!state.reading && !state.flowing && !state.ended &&
	         state.length < state.highWaterMark) {
	    debug('maybeReadMore read 0');
	    stream.read(0);
	    if (len === state.length)
	      // didn't get any data, stop spinning.
	      break;
	    else
	      len = state.length;
	  }
	  state.readingMore = false;
	}

	// abstract method.  to be overridden in specific implementation classes.
	// call cb(er, data) where data is <= n in length.
	// for virtual (non-string, non-buffer) streams, "length" is somewhat
	// arbitrary, and perhaps not very meaningful.
	Readable.prototype._read = function(n) {
	  this.emit('error', new Error('not implemented'));
	};

	Readable.prototype.pipe = function(dest, pipeOpts) {
	  var src = this;
	  var state = this._readableState;

	  switch (state.pipesCount) {
	    case 0:
	      state.pipes = dest;
	      break;
	    case 1:
	      state.pipes = [state.pipes, dest];
	      break;
	    default:
	      state.pipes.push(dest);
	      break;
	  }
	  state.pipesCount += 1;
	  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

	  var doEnd = (!pipeOpts || pipeOpts.end !== false) &&
	              dest !== process.stdout &&
	              dest !== process.stderr;

	  var endFn = doEnd ? onend : cleanup;
	  if (state.endEmitted)
	    process.nextTick(endFn);
	  else
	    src.once('end', endFn);

	  dest.on('unpipe', onunpipe);
	  function onunpipe(readable) {
	    debug('onunpipe');
	    if (readable === src) {
	      cleanup();
	    }
	  }

	  function onend() {
	    debug('onend');
	    dest.end();
	  }

	  // when the dest drains, it reduces the awaitDrain counter
	  // on the source.  This would be more elegant with a .once()
	  // handler in flow(), but adding and removing repeatedly is
	  // too slow.
	  var ondrain = pipeOnDrain(src);
	  dest.on('drain', ondrain);

	  function cleanup() {
	    debug('cleanup');
	    // cleanup event handlers once the pipe is broken
	    dest.removeListener('close', onclose);
	    dest.removeListener('finish', onfinish);
	    dest.removeListener('drain', ondrain);
	    dest.removeListener('error', onerror);
	    dest.removeListener('unpipe', onunpipe);
	    src.removeListener('end', onend);
	    src.removeListener('end', cleanup);
	    src.removeListener('data', ondata);

	    // if the reader is waiting for a drain event from this
	    // specific writer, then it would cause it to never start
	    // flowing again.
	    // So, if this is awaiting a drain, then we just call it now.
	    // If we don't know, then assume that we are waiting for one.
	    if (state.awaitDrain &&
	        (!dest._writableState || dest._writableState.needDrain))
	      ondrain();
	  }

	  src.on('data', ondata);
	  function ondata(chunk) {
	    debug('ondata');
	    var ret = dest.write(chunk);
	    if (false === ret) {
	      debug('false write response, pause',
	            src._readableState.awaitDrain);
	      src._readableState.awaitDrain++;
	      src.pause();
	    }
	  }

	  // if the dest has an error, then stop piping into it.
	  // however, don't suppress the throwing behavior for this.
	  function onerror(er) {
	    debug('onerror', er);
	    unpipe();
	    dest.removeListener('error', onerror);
	    if (EE.listenerCount(dest, 'error') === 0)
	      dest.emit('error', er);
	  }
	  // This is a brutally ugly hack to make sure that our error handler
	  // is attached before any userland ones.  NEVER DO THIS.
	  if (!dest._events || !dest._events.error)
	    dest.on('error', onerror);
	  else if (isArray(dest._events.error))
	    dest._events.error.unshift(onerror);
	  else
	    dest._events.error = [onerror, dest._events.error];



	  // Both close and finish should trigger unpipe, but only once.
	  function onclose() {
	    dest.removeListener('finish', onfinish);
	    unpipe();
	  }
	  dest.once('close', onclose);
	  function onfinish() {
	    debug('onfinish');
	    dest.removeListener('close', onclose);
	    unpipe();
	  }
	  dest.once('finish', onfinish);

	  function unpipe() {
	    debug('unpipe');
	    src.unpipe(dest);
	  }

	  // tell the dest that it's being piped to
	  dest.emit('pipe', src);

	  // start the flow if it hasn't been started already.
	  if (!state.flowing) {
	    debug('pipe resume');
	    src.resume();
	  }

	  return dest;
	};

	function pipeOnDrain(src) {
	  return function() {
	    var state = src._readableState;
	    debug('pipeOnDrain', state.awaitDrain);
	    if (state.awaitDrain)
	      state.awaitDrain--;
	    if (state.awaitDrain === 0 && EE.listenerCount(src, 'data')) {
	      state.flowing = true;
	      flow(src);
	    }
	  };
	}


	Readable.prototype.unpipe = function(dest) {
	  var state = this._readableState;

	  // if we're not piping anywhere, then do nothing.
	  if (state.pipesCount === 0)
	    return this;

	  // just one destination.  most common case.
	  if (state.pipesCount === 1) {
	    // passed in one, but it's not the right one.
	    if (dest && dest !== state.pipes)
	      return this;

	    if (!dest)
	      dest = state.pipes;

	    // got a match.
	    state.pipes = null;
	    state.pipesCount = 0;
	    state.flowing = false;
	    if (dest)
	      dest.emit('unpipe', this);
	    return this;
	  }

	  // slow case. multiple pipe destinations.

	  if (!dest) {
	    // remove all.
	    var dests = state.pipes;
	    var len = state.pipesCount;
	    state.pipes = null;
	    state.pipesCount = 0;
	    state.flowing = false;

	    for (var i = 0; i < len; i++)
	      dests[i].emit('unpipe', this);
	    return this;
	  }

	  // try to find the right one.
	  var i = indexOf(state.pipes, dest);
	  if (i === -1)
	    return this;

	  state.pipes.splice(i, 1);
	  state.pipesCount -= 1;
	  if (state.pipesCount === 1)
	    state.pipes = state.pipes[0];

	  dest.emit('unpipe', this);

	  return this;
	};

	// set up data events if they are asked for
	// Ensure readable listeners eventually get something
	Readable.prototype.on = function(ev, fn) {
	  var res = Stream.prototype.on.call(this, ev, fn);

	  // If listening to data, and it has not explicitly been paused,
	  // then call resume to start the flow of data on the next tick.
	  if (ev === 'data' && false !== this._readableState.flowing) {
	    this.resume();
	  }

	  if (ev === 'readable' && this.readable) {
	    var state = this._readableState;
	    if (!state.readableListening) {
	      state.readableListening = true;
	      state.emittedReadable = false;
	      state.needReadable = true;
	      if (!state.reading) {
	        var self = this;
	        process.nextTick(function() {
	          debug('readable nexttick read 0');
	          self.read(0);
	        });
	      } else if (state.length) {
	        emitReadable(this, state);
	      }
	    }
	  }

	  return res;
	};
	Readable.prototype.addListener = Readable.prototype.on;

	// pause() and resume() are remnants of the legacy readable stream API
	// If the user uses them, then switch into old mode.
	Readable.prototype.resume = function() {
	  var state = this._readableState;
	  if (!state.flowing) {
	    debug('resume');
	    state.flowing = true;
	    if (!state.reading) {
	      debug('resume read 0');
	      this.read(0);
	    }
	    resume(this, state);
	  }
	  return this;
	};

	function resume(stream, state) {
	  if (!state.resumeScheduled) {
	    state.resumeScheduled = true;
	    process.nextTick(function() {
	      resume_(stream, state);
	    });
	  }
	}

	function resume_(stream, state) {
	  state.resumeScheduled = false;
	  stream.emit('resume');
	  flow(stream);
	  if (state.flowing && !state.reading)
	    stream.read(0);
	}

	Readable.prototype.pause = function() {
	  debug('call pause flowing=%j', this._readableState.flowing);
	  if (false !== this._readableState.flowing) {
	    debug('pause');
	    this._readableState.flowing = false;
	    this.emit('pause');
	  }
	  return this;
	};

	function flow(stream) {
	  var state = stream._readableState;
	  debug('flow', state.flowing);
	  if (state.flowing) {
	    do {
	      var chunk = stream.read();
	    } while (null !== chunk && state.flowing);
	  }
	}

	// wrap an old-style stream as the async data source.
	// This is *not* part of the readable stream interface.
	// It is an ugly unfortunate mess of history.
	Readable.prototype.wrap = function(stream) {
	  var state = this._readableState;
	  var paused = false;

	  var self = this;
	  stream.on('end', function() {
	    debug('wrapped end');
	    if (state.decoder && !state.ended) {
	      var chunk = state.decoder.end();
	      if (chunk && chunk.length)
	        self.push(chunk);
	    }

	    self.push(null);
	  });

	  stream.on('data', function(chunk) {
	    debug('wrapped data');
	    if (state.decoder)
	      chunk = state.decoder.write(chunk);
	    if (!chunk || !state.objectMode && !chunk.length)
	      return;

	    var ret = self.push(chunk);
	    if (!ret) {
	      paused = true;
	      stream.pause();
	    }
	  });

	  // proxy all the other methods.
	  // important when wrapping filters and duplexes.
	  for (var i in stream) {
	    if (util.isFunction(stream[i]) && util.isUndefined(this[i])) {
	      this[i] = function(method) { return function() {
	        return stream[method].apply(stream, arguments);
	      }}(i);
	    }
	  }

	  // proxy certain important events.
	  var events = ['error', 'close', 'destroy', 'pause', 'resume'];
	  forEach(events, function(ev) {
	    stream.on(ev, self.emit.bind(self, ev));
	  });

	  // when we try to consume some more bytes, simply unpause the
	  // underlying stream.
	  self._read = function(n) {
	    debug('wrapped _read', n);
	    if (paused) {
	      paused = false;
	      stream.resume();
	    }
	  };

	  return self;
	};



	// exposed for testing purposes only.
	Readable._fromList = fromList;

	// Pluck off n bytes from an array of buffers.
	// Length is the combined lengths of all the buffers in the list.
	function fromList(n, state) {
	  var list = state.buffer;
	  var length = state.length;
	  var stringMode = !!state.decoder;
	  var objectMode = !!state.objectMode;
	  var ret;

	  // nothing in the list, definitely empty.
	  if (list.length === 0)
	    return null;

	  if (length === 0)
	    ret = null;
	  else if (objectMode)
	    ret = list.shift();
	  else if (!n || n >= length) {
	    // read it all, truncate the array.
	    if (stringMode)
	      ret = list.join('');
	    else
	      ret = Buffer.concat(list, length);
	    list.length = 0;
	  } else {
	    // read just some of it.
	    if (n < list[0].length) {
	      // just take a part of the first list item.
	      // slice is the same for buffers and strings.
	      var buf = list[0];
	      ret = buf.slice(0, n);
	      list[0] = buf.slice(n);
	    } else if (n === list[0].length) {
	      // first list is a perfect match
	      ret = list.shift();
	    } else {
	      // complex case.
	      // we have enough to cover it, but it spans past the first buffer.
	      if (stringMode)
	        ret = '';
	      else
	        ret = new Buffer(n);

	      var c = 0;
	      for (var i = 0, l = list.length; i < l && c < n; i++) {
	        var buf = list[0];
	        var cpy = Math.min(n - c, buf.length);

	        if (stringMode)
	          ret += buf.slice(0, cpy);
	        else
	          buf.copy(ret, c, 0, cpy);

	        if (cpy < buf.length)
	          list[0] = buf.slice(cpy);
	        else
	          list.shift();

	        c += cpy;
	      }
	    }
	  }

	  return ret;
	}

	function endReadable(stream) {
	  var state = stream._readableState;

	  // If we get here before consuming all the bytes, then that is a
	  // bug in node.  Should never happen.
	  if (state.length > 0)
	    throw new Error('endReadable called on non-empty stream');

	  if (!state.endEmitted) {
	    state.ended = true;
	    process.nextTick(function() {
	      // Check that we didn't get one last unshift.
	      if (!state.endEmitted && state.length === 0) {
	        state.endEmitted = true;
	        stream.readable = false;
	        stream.emit('end');
	      }
	    });
	  }
	}

	function forEach (xs, f) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    f(xs[i], i);
	  }
	}

	function indexOf (xs, x) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    if (xs[i] === x) return i;
	  }
	  return -1;
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// A bit simpler than readable streams.
	// Implement an async ._write(chunk, cb), and it'll handle all
	// the drain event emission and buffering.

	module.exports = Writable;

	/*<replacement>*/
	var Buffer = __webpack_require__(22).Buffer;
	/*</replacement>*/

	Writable.WritableState = WritableState;


	/*<replacement>*/
	var util = __webpack_require__(25);
	util.inherits = __webpack_require__(24);
	/*</replacement>*/

	var Stream = __webpack_require__(6);

	util.inherits(Writable, Stream);

	function WriteReq(chunk, encoding, cb) {
	  this.chunk = chunk;
	  this.encoding = encoding;
	  this.callback = cb;
	}

	function WritableState(options, stream) {
	  var Duplex = __webpack_require__(17);

	  options = options || {};

	  // the point at which write() starts returning false
	  // Note: 0 is a valid value, means that we always return false if
	  // the entire buffer is not flushed immediately on write()
	  var hwm = options.highWaterMark;
	  var defaultHwm = options.objectMode ? 16 : 16 * 1024;
	  this.highWaterMark = (hwm || hwm === 0) ? hwm : defaultHwm;

	  // object stream flag to indicate whether or not this stream
	  // contains buffers or objects.
	  this.objectMode = !!options.objectMode;

	  if (stream instanceof Duplex)
	    this.objectMode = this.objectMode || !!options.writableObjectMode;

	  // cast to ints.
	  this.highWaterMark = ~~this.highWaterMark;

	  this.needDrain = false;
	  // at the start of calling end()
	  this.ending = false;
	  // when end() has been called, and returned
	  this.ended = false;
	  // when 'finish' is emitted
	  this.finished = false;

	  // should we decode strings into buffers before passing to _write?
	  // this is here so that some node-core streams can optimize string
	  // handling at a lower level.
	  var noDecode = options.decodeStrings === false;
	  this.decodeStrings = !noDecode;

	  // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.
	  this.defaultEncoding = options.defaultEncoding || 'utf8';

	  // not an actual buffer we keep track of, but a measurement
	  // of how much we're waiting to get pushed to some underlying
	  // socket or file.
	  this.length = 0;

	  // a flag to see when we're in the middle of a write.
	  this.writing = false;

	  // when true all writes will be buffered until .uncork() call
	  this.corked = 0;

	  // a flag to be able to tell if the onwrite cb is called immediately,
	  // or on a later tick.  We set this to true at first, because any
	  // actions that shouldn't happen until "later" should generally also
	  // not happen before the first write call.
	  this.sync = true;

	  // a flag to know if we're processing previously buffered items, which
	  // may call the _write() callback in the same tick, so that we don't
	  // end up in an overlapped onwrite situation.
	  this.bufferProcessing = false;

	  // the callback that's passed to _write(chunk,cb)
	  this.onwrite = function(er) {
	    onwrite(stream, er);
	  };

	  // the callback that the user supplies to write(chunk,encoding,cb)
	  this.writecb = null;

	  // the amount that is being written when _write is called.
	  this.writelen = 0;

	  this.buffer = [];

	  // number of pending user-supplied write callbacks
	  // this must be 0 before 'finish' can be emitted
	  this.pendingcb = 0;

	  // emit prefinish if the only thing we're waiting for is _write cbs
	  // This is relevant for synchronous Transform streams
	  this.prefinished = false;

	  // True if the error was already emitted and should not be thrown again
	  this.errorEmitted = false;
	}

	function Writable(options) {
	  var Duplex = __webpack_require__(17);

	  // Writable ctor is applied to Duplexes, though they're not
	  // instanceof Writable, they're instanceof Readable.
	  if (!(this instanceof Writable) && !(this instanceof Duplex))
	    return new Writable(options);

	  this._writableState = new WritableState(options, this);

	  // legacy.
	  this.writable = true;

	  Stream.call(this);
	}

	// Otherwise people can pipe Writable streams, which is just wrong.
	Writable.prototype.pipe = function() {
	  this.emit('error', new Error('Cannot pipe. Not readable.'));
	};


	function writeAfterEnd(stream, state, cb) {
	  var er = new Error('write after end');
	  // TODO: defer error events consistently everywhere, not just the cb
	  stream.emit('error', er);
	  process.nextTick(function() {
	    cb(er);
	  });
	}

	// If we get something that is not a buffer, string, null, or undefined,
	// and we're not in objectMode, then that's an error.
	// Otherwise stream chunks are all considered to be of length=1, and the
	// watermarks determine how many objects to keep in the buffer, rather than
	// how many bytes or characters.
	function validChunk(stream, state, chunk, cb) {
	  var valid = true;
	  if (!util.isBuffer(chunk) &&
	      !util.isString(chunk) &&
	      !util.isNullOrUndefined(chunk) &&
	      !state.objectMode) {
	    var er = new TypeError('Invalid non-string/buffer chunk');
	    stream.emit('error', er);
	    process.nextTick(function() {
	      cb(er);
	    });
	    valid = false;
	  }
	  return valid;
	}

	Writable.prototype.write = function(chunk, encoding, cb) {
	  var state = this._writableState;
	  var ret = false;

	  if (util.isFunction(encoding)) {
	    cb = encoding;
	    encoding = null;
	  }

	  if (util.isBuffer(chunk))
	    encoding = 'buffer';
	  else if (!encoding)
	    encoding = state.defaultEncoding;

	  if (!util.isFunction(cb))
	    cb = function() {};

	  if (state.ended)
	    writeAfterEnd(this, state, cb);
	  else if (validChunk(this, state, chunk, cb)) {
	    state.pendingcb++;
	    ret = writeOrBuffer(this, state, chunk, encoding, cb);
	  }

	  return ret;
	};

	Writable.prototype.cork = function() {
	  var state = this._writableState;

	  state.corked++;
	};

	Writable.prototype.uncork = function() {
	  var state = this._writableState;

	  if (state.corked) {
	    state.corked--;

	    if (!state.writing &&
	        !state.corked &&
	        !state.finished &&
	        !state.bufferProcessing &&
	        state.buffer.length)
	      clearBuffer(this, state);
	  }
	};

	function decodeChunk(state, chunk, encoding) {
	  if (!state.objectMode &&
	      state.decodeStrings !== false &&
	      util.isString(chunk)) {
	    chunk = new Buffer(chunk, encoding);
	  }
	  return chunk;
	}

	// if we're already writing something, then just put this
	// in the queue, and wait our turn.  Otherwise, call _write
	// If we return false, then we need a drain event, so set that flag.
	function writeOrBuffer(stream, state, chunk, encoding, cb) {
	  chunk = decodeChunk(state, chunk, encoding);
	  if (util.isBuffer(chunk))
	    encoding = 'buffer';
	  var len = state.objectMode ? 1 : chunk.length;

	  state.length += len;

	  var ret = state.length < state.highWaterMark;
	  // we must ensure that previous needDrain will not be reset to false.
	  if (!ret)
	    state.needDrain = true;

	  if (state.writing || state.corked)
	    state.buffer.push(new WriteReq(chunk, encoding, cb));
	  else
	    doWrite(stream, state, false, len, chunk, encoding, cb);

	  return ret;
	}

	function doWrite(stream, state, writev, len, chunk, encoding, cb) {
	  state.writelen = len;
	  state.writecb = cb;
	  state.writing = true;
	  state.sync = true;
	  if (writev)
	    stream._writev(chunk, state.onwrite);
	  else
	    stream._write(chunk, encoding, state.onwrite);
	  state.sync = false;
	}

	function onwriteError(stream, state, sync, er, cb) {
	  if (sync)
	    process.nextTick(function() {
	      state.pendingcb--;
	      cb(er);
	    });
	  else {
	    state.pendingcb--;
	    cb(er);
	  }

	  stream._writableState.errorEmitted = true;
	  stream.emit('error', er);
	}

	function onwriteStateUpdate(state) {
	  state.writing = false;
	  state.writecb = null;
	  state.length -= state.writelen;
	  state.writelen = 0;
	}

	function onwrite(stream, er) {
	  var state = stream._writableState;
	  var sync = state.sync;
	  var cb = state.writecb;

	  onwriteStateUpdate(state);

	  if (er)
	    onwriteError(stream, state, sync, er, cb);
	  else {
	    // Check if we're actually ready to finish, but don't emit yet
	    var finished = needFinish(stream, state);

	    if (!finished &&
	        !state.corked &&
	        !state.bufferProcessing &&
	        state.buffer.length) {
	      clearBuffer(stream, state);
	    }

	    if (sync) {
	      process.nextTick(function() {
	        afterWrite(stream, state, finished, cb);
	      });
	    } else {
	      afterWrite(stream, state, finished, cb);
	    }
	  }
	}

	function afterWrite(stream, state, finished, cb) {
	  if (!finished)
	    onwriteDrain(stream, state);
	  state.pendingcb--;
	  cb();
	  finishMaybe(stream, state);
	}

	// Must force callback to be called on nextTick, so that we don't
	// emit 'drain' before the write() consumer gets the 'false' return
	// value, and has a chance to attach a 'drain' listener.
	function onwriteDrain(stream, state) {
	  if (state.length === 0 && state.needDrain) {
	    state.needDrain = false;
	    stream.emit('drain');
	  }
	}


	// if there's something in the buffer waiting, then process it
	function clearBuffer(stream, state) {
	  state.bufferProcessing = true;

	  if (stream._writev && state.buffer.length > 1) {
	    // Fast case, write everything using _writev()
	    var cbs = [];
	    for (var c = 0; c < state.buffer.length; c++)
	      cbs.push(state.buffer[c].callback);

	    // count the one we are adding, as well.
	    // TODO(isaacs) clean this up
	    state.pendingcb++;
	    doWrite(stream, state, true, state.length, state.buffer, '', function(err) {
	      for (var i = 0; i < cbs.length; i++) {
	        state.pendingcb--;
	        cbs[i](err);
	      }
	    });

	    // Clear buffer
	    state.buffer = [];
	  } else {
	    // Slow case, write chunks one-by-one
	    for (var c = 0; c < state.buffer.length; c++) {
	      var entry = state.buffer[c];
	      var chunk = entry.chunk;
	      var encoding = entry.encoding;
	      var cb = entry.callback;
	      var len = state.objectMode ? 1 : chunk.length;

	      doWrite(stream, state, false, len, chunk, encoding, cb);

	      // if we didn't call the onwrite immediately, then
	      // it means that we need to wait until it does.
	      // also, that means that the chunk and cb are currently
	      // being processed, so move the buffer counter past them.
	      if (state.writing) {
	        c++;
	        break;
	      }
	    }

	    if (c < state.buffer.length)
	      state.buffer = state.buffer.slice(c);
	    else
	      state.buffer.length = 0;
	  }

	  state.bufferProcessing = false;
	}

	Writable.prototype._write = function(chunk, encoding, cb) {
	  cb(new Error('not implemented'));

	};

	Writable.prototype._writev = null;

	Writable.prototype.end = function(chunk, encoding, cb) {
	  var state = this._writableState;

	  if (util.isFunction(chunk)) {
	    cb = chunk;
	    chunk = null;
	    encoding = null;
	  } else if (util.isFunction(encoding)) {
	    cb = encoding;
	    encoding = null;
	  }

	  if (!util.isNullOrUndefined(chunk))
	    this.write(chunk, encoding);

	  // .end() fully uncorks
	  if (state.corked) {
	    state.corked = 1;
	    this.uncork();
	  }

	  // ignore unnecessary end() calls.
	  if (!state.ending && !state.finished)
	    endWritable(this, state, cb);
	};


	function needFinish(stream, state) {
	  return (state.ending &&
	          state.length === 0 &&
	          !state.finished &&
	          !state.writing);
	}

	function prefinish(stream, state) {
	  if (!state.prefinished) {
	    state.prefinished = true;
	    stream.emit('prefinish');
	  }
	}

	function finishMaybe(stream, state) {
	  var need = needFinish(stream, state);
	  if (need) {
	    if (state.pendingcb === 0) {
	      prefinish(stream, state);
	      state.finished = true;
	      stream.emit('finish');
	    } else
	      prefinish(stream, state);
	  }
	  return need;
	}

	function endWritable(stream, state, cb) {
	  state.ending = true;
	  finishMaybe(stream, state);
	  if (cb) {
	    if (state.finished)
	      process.nextTick(cb);
	    else
	      stream.once('finish', cb);
	  }
	  state.ended = true;
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// a duplex stream is just a stream that is both readable and writable.
	// Since JS doesn't have multiple prototypal inheritance, this class
	// prototypally inherits from Readable, and then parasitically from
	// Writable.

	module.exports = Duplex;

	/*<replacement>*/
	var objectKeys = Object.keys || function (obj) {
	  var keys = [];
	  for (var key in obj) keys.push(key);
	  return keys;
	}
	/*</replacement>*/


	/*<replacement>*/
	var util = __webpack_require__(25);
	util.inherits = __webpack_require__(24);
	/*</replacement>*/

	var Readable = __webpack_require__(15);
	var Writable = __webpack_require__(16);

	util.inherits(Duplex, Readable);

	forEach(objectKeys(Writable.prototype), function(method) {
	  if (!Duplex.prototype[method])
	    Duplex.prototype[method] = Writable.prototype[method];
	});

	function Duplex(options) {
	  if (!(this instanceof Duplex))
	    return new Duplex(options);

	  Readable.call(this, options);
	  Writable.call(this, options);

	  if (options && options.readable === false)
	    this.readable = false;

	  if (options && options.writable === false)
	    this.writable = false;

	  this.allowHalfOpen = true;
	  if (options && options.allowHalfOpen === false)
	    this.allowHalfOpen = false;

	  this.once('end', onend);
	}

	// the no-half-open enforcer
	function onend() {
	  // if we allow half-open state, or if the writable side ended,
	  // then we're ok.
	  if (this.allowHalfOpen || this._writableState.ended)
	    return;

	  // no more data can be written.
	  // But allow more writes to happen in this tick.
	  process.nextTick(this.end.bind(this));
	}

	function forEach (xs, f) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    f(xs[i], i);
	  }
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.


	// a transform stream is a readable/writable stream where you do
	// something with the data.  Sometimes it's called a "filter",
	// but that's not a great name for it, since that implies a thing where
	// some bits pass through, and others are simply ignored.  (That would
	// be a valid example of a transform, of course.)
	//
	// While the output is causally related to the input, it's not a
	// necessarily symmetric or synchronous transformation.  For example,
	// a zlib stream might take multiple plain-text writes(), and then
	// emit a single compressed chunk some time in the future.
	//
	// Here's how this works:
	//
	// The Transform stream has all the aspects of the readable and writable
	// stream classes.  When you write(chunk), that calls _write(chunk,cb)
	// internally, and returns false if there's a lot of pending writes
	// buffered up.  When you call read(), that calls _read(n) until
	// there's enough pending readable data buffered up.
	//
	// In a transform stream, the written data is placed in a buffer.  When
	// _read(n) is called, it transforms the queued up data, calling the
	// buffered _write cb's as it consumes chunks.  If consuming a single
	// written chunk would result in multiple output chunks, then the first
	// outputted bit calls the readcb, and subsequent chunks just go into
	// the read buffer, and will cause it to emit 'readable' if necessary.
	//
	// This way, back-pressure is actually determined by the reading side,
	// since _read has to be called to start processing a new chunk.  However,
	// a pathological inflate type of transform can cause excessive buffering
	// here.  For example, imagine a stream where every byte of input is
	// interpreted as an integer from 0-255, and then results in that many
	// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
	// 1kb of data being output.  In this case, you could write a very small
	// amount of input, and end up with a very large amount of output.  In
	// such a pathological inflating mechanism, there'd be no way to tell
	// the system to stop doing the transform.  A single 4MB write could
	// cause the system to run out of memory.
	//
	// However, even in such a pathological case, only a single written chunk
	// would be consumed, and then the rest would wait (un-transformed) until
	// the results of the previous transformed chunk were consumed.

	module.exports = Transform;

	var Duplex = __webpack_require__(17);

	/*<replacement>*/
	var util = __webpack_require__(25);
	util.inherits = __webpack_require__(24);
	/*</replacement>*/

	util.inherits(Transform, Duplex);


	function TransformState(options, stream) {
	  this.afterTransform = function(er, data) {
	    return afterTransform(stream, er, data);
	  };

	  this.needTransform = false;
	  this.transforming = false;
	  this.writecb = null;
	  this.writechunk = null;
	}

	function afterTransform(stream, er, data) {
	  var ts = stream._transformState;
	  ts.transforming = false;

	  var cb = ts.writecb;

	  if (!cb)
	    return stream.emit('error', new Error('no writecb in Transform class'));

	  ts.writechunk = null;
	  ts.writecb = null;

	  if (!util.isNullOrUndefined(data))
	    stream.push(data);

	  if (cb)
	    cb(er);

	  var rs = stream._readableState;
	  rs.reading = false;
	  if (rs.needReadable || rs.length < rs.highWaterMark) {
	    stream._read(rs.highWaterMark);
	  }
	}


	function Transform(options) {
	  if (!(this instanceof Transform))
	    return new Transform(options);

	  Duplex.call(this, options);

	  this._transformState = new TransformState(options, this);

	  // when the writable side finishes, then flush out anything remaining.
	  var stream = this;

	  // start out asking for a readable event once data is transformed.
	  this._readableState.needReadable = true;

	  // we have implemented the _read method, and done the other things
	  // that Readable wants before the first _read call, so unset the
	  // sync guard flag.
	  this._readableState.sync = false;

	  this.once('prefinish', function() {
	    if (util.isFunction(this._flush))
	      this._flush(function(er) {
	        done(stream, er);
	      });
	    else
	      done(stream);
	  });
	}

	Transform.prototype.push = function(chunk, encoding) {
	  this._transformState.needTransform = false;
	  return Duplex.prototype.push.call(this, chunk, encoding);
	};

	// This is the part where you do stuff!
	// override this function in implementation classes.
	// 'chunk' is an input chunk.
	//
	// Call `push(newChunk)` to pass along transformed output
	// to the readable side.  You may call 'push' zero or more times.
	//
	// Call `cb(err)` when you are done with this chunk.  If you pass
	// an error, then that'll put the hurt on the whole operation.  If you
	// never call cb(), then you'll never get another chunk.
	Transform.prototype._transform = function(chunk, encoding, cb) {
	  throw new Error('not implemented');
	};

	Transform.prototype._write = function(chunk, encoding, cb) {
	  var ts = this._transformState;
	  ts.writecb = cb;
	  ts.writechunk = chunk;
	  ts.writeencoding = encoding;
	  if (!ts.transforming) {
	    var rs = this._readableState;
	    if (ts.needTransform ||
	        rs.needReadable ||
	        rs.length < rs.highWaterMark)
	      this._read(rs.highWaterMark);
	  }
	};

	// Doesn't matter what the args are here.
	// _transform does all the work.
	// That we got here means that the readable side wants more data.
	Transform.prototype._read = function(n) {
	  var ts = this._transformState;

	  if (!util.isNull(ts.writechunk) && ts.writecb && !ts.transforming) {
	    ts.transforming = true;
	    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
	  } else {
	    // mark that we need a transform, so that any data that comes in
	    // will get processed, now that we've asked for it.
	    ts.needTransform = true;
	  }
	};


	function done(stream, er) {
	  if (er)
	    return stream.emit('error', er);

	  // if there's nothing in the write buffer, then that means
	  // that nothing more will ever be provided
	  var ws = stream._writableState;
	  var ts = stream._transformState;

	  if (ws.length)
	    throw new Error('calling transform done when ws.length != 0');

	  if (ts.transforming)
	    throw new Error('calling transform done when still transforming');

	  return stream.push(null);
	}


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// a passthrough stream.
	// basically just the most minimal sort of Transform stream.
	// Every written chunk gets output as-is.

	module.exports = PassThrough;

	var Transform = __webpack_require__(18);

	/*<replacement>*/
	var util = __webpack_require__(25);
	util.inherits = __webpack_require__(24);
	/*</replacement>*/

	util.inherits(PassThrough, Transform);

	function PassThrough(options) {
	  if (!(this instanceof PassThrough))
	    return new PassThrough(options);

	  Transform.call(this, options);
	}

	PassThrough.prototype._transform = function(chunk, encoding, cb) {
	  cb(null, chunk);
	};


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	/* (ignored) */

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = Array.isArray || function (arr) {
	  return Object.prototype.toString.call(arr) == '[object Array]';
	};


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */

	var base64 = __webpack_require__(27)
	var ieee754 = __webpack_require__(26)

	exports.Buffer = Buffer
	exports.SlowBuffer = Buffer
	exports.INSPECT_MAX_BYTES = 50
	Buffer.poolSize = 8192

	/**
	 * If `TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Note:
	 *
	 * - Implementation must support adding new properties to `Uint8Array` instances.
	 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
	 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *    incorrect length in some situations.
	 *
	 * We detect these buggy browsers and set `TYPED_ARRAY_SUPPORT` to `false` so they will
	 * get the Object implementation, which is slower but will work correctly.
	 */
	var TYPED_ARRAY_SUPPORT = (function () {
	  try {
	    var buf = new ArrayBuffer(0)
	    var arr = new Uint8Array(buf)
	    arr.foo = function () { return 42 }
	    return 42 === arr.foo() && // typed array instances can be augmented
	        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
	        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
	  } catch (e) {
	    return false
	  }
	})()

	/**
	 * Class: Buffer
	 * =============
	 *
	 * The Buffer constructor returns instances of `Uint8Array` that are augmented
	 * with function properties for all the node `Buffer` API functions. We use
	 * `Uint8Array` so that square bracket notation works as expected -- it returns
	 * a single octet.
	 *
	 * By augmenting the instances, we can avoid modifying the `Uint8Array`
	 * prototype.
	 */
	function Buffer (subject, encoding, noZero) {
	  if (!(this instanceof Buffer))
	    return new Buffer(subject, encoding, noZero)

	  var type = typeof subject

	  // Find the length
	  var length
	  if (type === 'number')
	    length = subject > 0 ? subject >>> 0 : 0
	  else if (type === 'string') {
	    if (encoding === 'base64')
	      subject = base64clean(subject)
	    length = Buffer.byteLength(subject, encoding)
	  } else if (type === 'object' && subject !== null) { // assume object is array-like
	    if (subject.type === 'Buffer' && isArray(subject.data))
	      subject = subject.data
	    length = +subject.length > 0 ? Math.floor(+subject.length) : 0
	  } else
	    throw new Error('First argument needs to be a number, array or string.')

	  var buf
	  if (TYPED_ARRAY_SUPPORT) {
	    // Preferred: Return an augmented `Uint8Array` instance for best performance
	    buf = Buffer._augment(new Uint8Array(length))
	  } else {
	    // Fallback: Return THIS instance of Buffer (created by `new`)
	    buf = this
	    buf.length = length
	    buf._isBuffer = true
	  }

	  var i
	  if (TYPED_ARRAY_SUPPORT && typeof subject.byteLength === 'number') {
	    // Speed optimization -- use set if we're copying from a typed array
	    buf._set(subject)
	  } else if (isArrayish(subject)) {
	    // Treat array-ish objects as a byte array
	    if (Buffer.isBuffer(subject)) {
	      for (i = 0; i < length; i++)
	        buf[i] = subject.readUInt8(i)
	    } else {
	      for (i = 0; i < length; i++)
	        buf[i] = ((subject[i] % 256) + 256) % 256
	    }
	  } else if (type === 'string') {
	    buf.write(subject, 0, encoding)
	  } else if (type === 'number' && !TYPED_ARRAY_SUPPORT && !noZero) {
	    for (i = 0; i < length; i++) {
	      buf[i] = 0
	    }
	  }

	  return buf
	}

	// STATIC METHODS
	// ==============

	Buffer.isEncoding = function (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'binary':
	    case 'base64':
	    case 'raw':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	}

	Buffer.isBuffer = function (b) {
	  return !!(b != null && b._isBuffer)
	}

	Buffer.byteLength = function (str, encoding) {
	  var ret
	  str = str.toString()
	  switch (encoding || 'utf8') {
	    case 'hex':
	      ret = str.length / 2
	      break
	    case 'utf8':
	    case 'utf-8':
	      ret = utf8ToBytes(str).length
	      break
	    case 'ascii':
	    case 'binary':
	    case 'raw':
	      ret = str.length
	      break
	    case 'base64':
	      ret = base64ToBytes(str).length
	      break
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      ret = str.length * 2
	      break
	    default:
	      throw new Error('Unknown encoding')
	  }
	  return ret
	}

	Buffer.concat = function (list, totalLength) {
	  assert(isArray(list), 'Usage: Buffer.concat(list[, length])')

	  if (list.length === 0) {
	    return new Buffer(0)
	  } else if (list.length === 1) {
	    return list[0]
	  }

	  var i
	  if (totalLength === undefined) {
	    totalLength = 0
	    for (i = 0; i < list.length; i++) {
	      totalLength += list[i].length
	    }
	  }

	  var buf = new Buffer(totalLength)
	  var pos = 0
	  for (i = 0; i < list.length; i++) {
	    var item = list[i]
	    item.copy(buf, pos)
	    pos += item.length
	  }
	  return buf
	}

	Buffer.compare = function (a, b) {
	  assert(Buffer.isBuffer(a) && Buffer.isBuffer(b), 'Arguments must be Buffers')
	  var x = a.length
	  var y = b.length
	  for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
	  if (i !== len) {
	    x = a[i]
	    y = b[i]
	  }
	  if (x < y) {
	    return -1
	  }
	  if (y < x) {
	    return 1
	  }
	  return 0
	}

	// BUFFER INSTANCE METHODS
	// =======================

	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0
	  var remaining = buf.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }

	  // must be an even number of digits
	  var strLen = string.length
	  assert(strLen % 2 === 0, 'Invalid hex string')

	  if (length > strLen / 2) {
	    length = strLen / 2
	  }
	  for (var i = 0; i < length; i++) {
	    var byte = parseInt(string.substr(i * 2, 2), 16)
	    assert(!isNaN(byte), 'Invalid hex string')
	    buf[offset + i] = byte
	  }
	  return i
	}

	function utf8Write (buf, string, offset, length) {
	  var charsWritten = blitBuffer(utf8ToBytes(string), buf, offset, length)
	  return charsWritten
	}

	function asciiWrite (buf, string, offset, length) {
	  var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
	  return charsWritten
	}

	function binaryWrite (buf, string, offset, length) {
	  return asciiWrite(buf, string, offset, length)
	}

	function base64Write (buf, string, offset, length) {
	  var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
	  return charsWritten
	}

	function utf16leWrite (buf, string, offset, length) {
	  var charsWritten = blitBuffer(utf16leToBytes(string), buf, offset, length)
	  return charsWritten
	}

	Buffer.prototype.write = function (string, offset, length, encoding) {
	  // Support both (string, offset, length, encoding)
	  // and the legacy (string, encoding, offset, length)
	  if (isFinite(offset)) {
	    if (!isFinite(length)) {
	      encoding = length
	      length = undefined
	    }
	  } else {  // legacy
	    var swap = encoding
	    encoding = offset
	    offset = length
	    length = swap
	  }

	  offset = Number(offset) || 0
	  var remaining = this.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }
	  encoding = String(encoding || 'utf8').toLowerCase()

	  var ret
	  switch (encoding) {
	    case 'hex':
	      ret = hexWrite(this, string, offset, length)
	      break
	    case 'utf8':
	    case 'utf-8':
	      ret = utf8Write(this, string, offset, length)
	      break
	    case 'ascii':
	      ret = asciiWrite(this, string, offset, length)
	      break
	    case 'binary':
	      ret = binaryWrite(this, string, offset, length)
	      break
	    case 'base64':
	      ret = base64Write(this, string, offset, length)
	      break
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      ret = utf16leWrite(this, string, offset, length)
	      break
	    default:
	      throw new Error('Unknown encoding')
	  }
	  return ret
	}

	Buffer.prototype.toString = function (encoding, start, end) {
	  var self = this

	  encoding = String(encoding || 'utf8').toLowerCase()
	  start = Number(start) || 0
	  end = (end === undefined) ? self.length : Number(end)

	  // Fastpath empty strings
	  if (end === start)
	    return ''

	  var ret
	  switch (encoding) {
	    case 'hex':
	      ret = hexSlice(self, start, end)
	      break
	    case 'utf8':
	    case 'utf-8':
	      ret = utf8Slice(self, start, end)
	      break
	    case 'ascii':
	      ret = asciiSlice(self, start, end)
	      break
	    case 'binary':
	      ret = binarySlice(self, start, end)
	      break
	    case 'base64':
	      ret = base64Slice(self, start, end)
	      break
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      ret = utf16leSlice(self, start, end)
	      break
	    default:
	      throw new Error('Unknown encoding')
	  }
	  return ret
	}

	Buffer.prototype.toJSON = function () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	}

	Buffer.prototype.equals = function (b) {
	  assert(Buffer.isBuffer(b), 'Argument must be a Buffer')
	  return Buffer.compare(this, b) === 0
	}

	Buffer.prototype.compare = function (b) {
	  assert(Buffer.isBuffer(b), 'Argument must be a Buffer')
	  return Buffer.compare(this, b)
	}

	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function (target, target_start, start, end) {
	  var source = this

	  if (!start) start = 0
	  if (!end && end !== 0) end = this.length
	  if (!target_start) target_start = 0

	  // Copy 0 bytes; we're done
	  if (end === start) return
	  if (target.length === 0 || source.length === 0) return

	  // Fatal error conditions
	  assert(end >= start, 'sourceEnd < sourceStart')
	  assert(target_start >= 0 && target_start < target.length,
	      'targetStart out of bounds')
	  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
	  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

	  // Are we oob?
	  if (end > this.length)
	    end = this.length
	  if (target.length - target_start < end - start)
	    end = target.length - target_start + start

	  var len = end - start

	  if (len < 100 || !TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < len; i++) {
	      target[i + target_start] = this[i + start]
	    }
	  } else {
	    target._set(this.subarray(start, start + len), target_start)
	  }
	}

	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return base64.fromByteArray(buf)
	  } else {
	    return base64.fromByteArray(buf.slice(start, end))
	  }
	}

	function utf8Slice (buf, start, end) {
	  var res = ''
	  var tmp = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    if (buf[i] <= 0x7F) {
	      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
	      tmp = ''
	    } else {
	      tmp += '%' + buf[i].toString(16)
	    }
	  }

	  return res + decodeUtf8Char(tmp)
	}

	function asciiSlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i])
	  }
	  return ret
	}

	function binarySlice (buf, start, end) {
	  return asciiSlice(buf, start, end)
	}

	function hexSlice (buf, start, end) {
	  var len = buf.length

	  if (!start || start < 0) start = 0
	  if (!end || end < 0 || end > len) end = len

	  var out = ''
	  for (var i = start; i < end; i++) {
	    out += toHex(buf[i])
	  }
	  return out
	}

	function utf16leSlice (buf, start, end) {
	  var bytes = buf.slice(start, end)
	  var res = ''
	  for (var i = 0; i < bytes.length; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
	  }
	  return res
	}

	Buffer.prototype.slice = function (start, end) {
	  var len = this.length
	  start = ~~start
	  end = end === undefined ? len : ~~end

	  if (start < 0) {
	    start += len;
	    if (start < 0)
	      start = 0
	  } else if (start > len) {
	    start = len
	  }

	  if (end < 0) {
	    end += len
	    if (end < 0)
	      end = 0
	  } else if (end > len) {
	    end = len
	  }

	  if (end < start)
	    end = start

	  if (TYPED_ARRAY_SUPPORT) {
	    return Buffer._augment(this.subarray(start, end))
	  } else {
	    var sliceLen = end - start
	    var newBuf = new Buffer(sliceLen, undefined, true)
	    for (var i = 0; i < sliceLen; i++) {
	      newBuf[i] = this[i + start]
	    }
	    return newBuf
	  }
	}

	// `get` will be removed in Node 0.13+
	Buffer.prototype.get = function (offset) {
	  console.log('.get() is deprecated. Access using array indexes instead.')
	  return this.readUInt8(offset)
	}

	// `set` will be removed in Node 0.13+
	Buffer.prototype.set = function (v, offset) {
	  console.log('.set() is deprecated. Access using array indexes instead.')
	  return this.writeUInt8(v, offset)
	}

	Buffer.prototype.readUInt8 = function (offset, noAssert) {
	  if (!noAssert) {
	    assert(offset !== undefined && offset !== null, 'missing offset')
	    assert(offset < this.length, 'Trying to read beyond buffer length')
	  }

	  if (offset >= this.length)
	    return

	  return this[offset]
	}

	function readUInt16 (buf, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
	    assert(offset !== undefined && offset !== null, 'missing offset')
	    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
	  }

	  var len = buf.length
	  if (offset >= len)
	    return

	  var val
	  if (littleEndian) {
	    val = buf[offset]
	    if (offset + 1 < len)
	      val |= buf[offset + 1] << 8
	  } else {
	    val = buf[offset] << 8
	    if (offset + 1 < len)
	      val |= buf[offset + 1]
	  }
	  return val
	}

	Buffer.prototype.readUInt16LE = function (offset, noAssert) {
	  return readUInt16(this, offset, true, noAssert)
	}

	Buffer.prototype.readUInt16BE = function (offset, noAssert) {
	  return readUInt16(this, offset, false, noAssert)
	}

	function readUInt32 (buf, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
	    assert(offset !== undefined && offset !== null, 'missing offset')
	    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
	  }

	  var len = buf.length
	  if (offset >= len)
	    return

	  var val
	  if (littleEndian) {
	    if (offset + 2 < len)
	      val = buf[offset + 2] << 16
	    if (offset + 1 < len)
	      val |= buf[offset + 1] << 8
	    val |= buf[offset]
	    if (offset + 3 < len)
	      val = val + (buf[offset + 3] << 24 >>> 0)
	  } else {
	    if (offset + 1 < len)
	      val = buf[offset + 1] << 16
	    if (offset + 2 < len)
	      val |= buf[offset + 2] << 8
	    if (offset + 3 < len)
	      val |= buf[offset + 3]
	    val = val + (buf[offset] << 24 >>> 0)
	  }
	  return val
	}

	Buffer.prototype.readUInt32LE = function (offset, noAssert) {
	  return readUInt32(this, offset, true, noAssert)
	}

	Buffer.prototype.readUInt32BE = function (offset, noAssert) {
	  return readUInt32(this, offset, false, noAssert)
	}

	Buffer.prototype.readInt8 = function (offset, noAssert) {
	  if (!noAssert) {
	    assert(offset !== undefined && offset !== null,
	        'missing offset')
	    assert(offset < this.length, 'Trying to read beyond buffer length')
	  }

	  if (offset >= this.length)
	    return

	  var neg = this[offset] & 0x80
	  if (neg)
	    return (0xff - this[offset] + 1) * -1
	  else
	    return this[offset]
	}

	function readInt16 (buf, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
	    assert(offset !== undefined && offset !== null, 'missing offset')
	    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
	  }

	  var len = buf.length
	  if (offset >= len)
	    return

	  var val = readUInt16(buf, offset, littleEndian, true)
	  var neg = val & 0x8000
	  if (neg)
	    return (0xffff - val + 1) * -1
	  else
	    return val
	}

	Buffer.prototype.readInt16LE = function (offset, noAssert) {
	  return readInt16(this, offset, true, noAssert)
	}

	Buffer.prototype.readInt16BE = function (offset, noAssert) {
	  return readInt16(this, offset, false, noAssert)
	}

	function readInt32 (buf, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
	    assert(offset !== undefined && offset !== null, 'missing offset')
	    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
	  }

	  var len = buf.length
	  if (offset >= len)
	    return

	  var val = readUInt32(buf, offset, littleEndian, true)
	  var neg = val & 0x80000000
	  if (neg)
	    return (0xffffffff - val + 1) * -1
	  else
	    return val
	}

	Buffer.prototype.readInt32LE = function (offset, noAssert) {
	  return readInt32(this, offset, true, noAssert)
	}

	Buffer.prototype.readInt32BE = function (offset, noAssert) {
	  return readInt32(this, offset, false, noAssert)
	}

	function readFloat (buf, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
	    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
	  }

	  return ieee754.read(buf, offset, littleEndian, 23, 4)
	}

	Buffer.prototype.readFloatLE = function (offset, noAssert) {
	  return readFloat(this, offset, true, noAssert)
	}

	Buffer.prototype.readFloatBE = function (offset, noAssert) {
	  return readFloat(this, offset, false, noAssert)
	}

	function readDouble (buf, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
	    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
	  }

	  return ieee754.read(buf, offset, littleEndian, 52, 8)
	}

	Buffer.prototype.readDoubleLE = function (offset, noAssert) {
	  return readDouble(this, offset, true, noAssert)
	}

	Buffer.prototype.readDoubleBE = function (offset, noAssert) {
	  return readDouble(this, offset, false, noAssert)
	}

	Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
	  if (!noAssert) {
	    assert(value !== undefined && value !== null, 'missing value')
	    assert(offset !== undefined && offset !== null, 'missing offset')
	    assert(offset < this.length, 'trying to write beyond buffer length')
	    verifuint(value, 0xff)
	  }

	  if (offset >= this.length) return

	  this[offset] = value
	  return offset + 1
	}

	function writeUInt16 (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    assert(value !== undefined && value !== null, 'missing value')
	    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
	    assert(offset !== undefined && offset !== null, 'missing offset')
	    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
	    verifuint(value, 0xffff)
	  }

	  var len = buf.length
	  if (offset >= len)
	    return

	  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
	    buf[offset + i] =
	        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	            (littleEndian ? i : 1 - i) * 8
	  }
	  return offset + 2
	}

	Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
	  return writeUInt16(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
	  return writeUInt16(this, value, offset, false, noAssert)
	}

	function writeUInt32 (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    assert(value !== undefined && value !== null, 'missing value')
	    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
	    assert(offset !== undefined && offset !== null, 'missing offset')
	    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
	    verifuint(value, 0xffffffff)
	  }

	  var len = buf.length
	  if (offset >= len)
	    return

	  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
	    buf[offset + i] =
	        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
	  }
	  return offset + 4
	}

	Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
	  return writeUInt32(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
	  return writeUInt32(this, value, offset, false, noAssert)
	}

	Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
	  if (!noAssert) {
	    assert(value !== undefined && value !== null, 'missing value')
	    assert(offset !== undefined && offset !== null, 'missing offset')
	    assert(offset < this.length, 'Trying to write beyond buffer length')
	    verifsint(value, 0x7f, -0x80)
	  }

	  if (offset >= this.length)
	    return

	  if (value >= 0)
	    this.writeUInt8(value, offset, noAssert)
	  else
	    this.writeUInt8(0xff + value + 1, offset, noAssert)
	  return offset + 1
	}

	function writeInt16 (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    assert(value !== undefined && value !== null, 'missing value')
	    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
	    assert(offset !== undefined && offset !== null, 'missing offset')
	    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
	    verifsint(value, 0x7fff, -0x8000)
	  }

	  var len = buf.length
	  if (offset >= len)
	    return

	  if (value >= 0)
	    writeUInt16(buf, value, offset, littleEndian, noAssert)
	  else
	    writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
	  return offset + 2
	}

	Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
	  return writeInt16(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
	  return writeInt16(this, value, offset, false, noAssert)
	}

	function writeInt32 (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    assert(value !== undefined && value !== null, 'missing value')
	    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
	    assert(offset !== undefined && offset !== null, 'missing offset')
	    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
	    verifsint(value, 0x7fffffff, -0x80000000)
	  }

	  var len = buf.length
	  if (offset >= len)
	    return

	  if (value >= 0)
	    writeUInt32(buf, value, offset, littleEndian, noAssert)
	  else
	    writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
	  return offset + 4
	}

	Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
	  return writeInt32(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
	  return writeInt32(this, value, offset, false, noAssert)
	}

	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    assert(value !== undefined && value !== null, 'missing value')
	    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
	    assert(offset !== undefined && offset !== null, 'missing offset')
	    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
	    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
	  }

	  var len = buf.length
	  if (offset >= len)
	    return

	  ieee754.write(buf, value, offset, littleEndian, 23, 4)
	  return offset + 4
	}

	Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	}

	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    assert(value !== undefined && value !== null, 'missing value')
	    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
	    assert(offset !== undefined && offset !== null, 'missing offset')
	    assert(offset + 7 < buf.length,
	        'Trying to write beyond buffer length')
	    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
	  }

	  var len = buf.length
	  if (offset >= len)
	    return

	  ieee754.write(buf, value, offset, littleEndian, 52, 8)
	  return offset + 8
	}

	Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	}

	// fill(value, start=0, end=buffer.length)
	Buffer.prototype.fill = function (value, start, end) {
	  if (!value) value = 0
	  if (!start) start = 0
	  if (!end) end = this.length

	  assert(end >= start, 'end < start')

	  // Fill 0 bytes; we're done
	  if (end === start) return
	  if (this.length === 0) return

	  assert(start >= 0 && start < this.length, 'start out of bounds')
	  assert(end >= 0 && end <= this.length, 'end out of bounds')

	  var i
	  if (typeof value === 'number') {
	    for (i = start; i < end; i++) {
	      this[i] = value
	    }
	  } else {
	    var bytes = utf8ToBytes(value.toString())
	    var len = bytes.length
	    for (i = start; i < end; i++) {
	      this[i] = bytes[i % len]
	    }
	  }

	  return this
	}

	Buffer.prototype.inspect = function () {
	  var out = []
	  var len = this.length
	  for (var i = 0; i < len; i++) {
	    out[i] = toHex(this[i])
	    if (i === exports.INSPECT_MAX_BYTES) {
	      out[i + 1] = '...'
	      break
	    }
	  }
	  return '<Buffer ' + out.join(' ') + '>'
	}

	/**
	 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
	 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
	 */
	Buffer.prototype.toArrayBuffer = function () {
	  if (typeof Uint8Array !== 'undefined') {
	    if (TYPED_ARRAY_SUPPORT) {
	      return (new Buffer(this)).buffer
	    } else {
	      var buf = new Uint8Array(this.length)
	      for (var i = 0, len = buf.length; i < len; i += 1) {
	        buf[i] = this[i]
	      }
	      return buf.buffer
	    }
	  } else {
	    throw new Error('Buffer.toArrayBuffer not supported in this browser')
	  }
	}

	// HELPER FUNCTIONS
	// ================

	var BP = Buffer.prototype

	/**
	 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
	 */
	Buffer._augment = function (arr) {
	  arr._isBuffer = true

	  // save reference to original Uint8Array get/set methods before overwriting
	  arr._get = arr.get
	  arr._set = arr.set

	  // deprecated, will be removed in node 0.13+
	  arr.get = BP.get
	  arr.set = BP.set

	  arr.write = BP.write
	  arr.toString = BP.toString
	  arr.toLocaleString = BP.toString
	  arr.toJSON = BP.toJSON
	  arr.equals = BP.equals
	  arr.compare = BP.compare
	  arr.copy = BP.copy
	  arr.slice = BP.slice
	  arr.readUInt8 = BP.readUInt8
	  arr.readUInt16LE = BP.readUInt16LE
	  arr.readUInt16BE = BP.readUInt16BE
	  arr.readUInt32LE = BP.readUInt32LE
	  arr.readUInt32BE = BP.readUInt32BE
	  arr.readInt8 = BP.readInt8
	  arr.readInt16LE = BP.readInt16LE
	  arr.readInt16BE = BP.readInt16BE
	  arr.readInt32LE = BP.readInt32LE
	  arr.readInt32BE = BP.readInt32BE
	  arr.readFloatLE = BP.readFloatLE
	  arr.readFloatBE = BP.readFloatBE
	  arr.readDoubleLE = BP.readDoubleLE
	  arr.readDoubleBE = BP.readDoubleBE
	  arr.writeUInt8 = BP.writeUInt8
	  arr.writeUInt16LE = BP.writeUInt16LE
	  arr.writeUInt16BE = BP.writeUInt16BE
	  arr.writeUInt32LE = BP.writeUInt32LE
	  arr.writeUInt32BE = BP.writeUInt32BE
	  arr.writeInt8 = BP.writeInt8
	  arr.writeInt16LE = BP.writeInt16LE
	  arr.writeInt16BE = BP.writeInt16BE
	  arr.writeInt32LE = BP.writeInt32LE
	  arr.writeInt32BE = BP.writeInt32BE
	  arr.writeFloatLE = BP.writeFloatLE
	  arr.writeFloatBE = BP.writeFloatBE
	  arr.writeDoubleLE = BP.writeDoubleLE
	  arr.writeDoubleBE = BP.writeDoubleBE
	  arr.fill = BP.fill
	  arr.inspect = BP.inspect
	  arr.toArrayBuffer = BP.toArrayBuffer

	  return arr
	}

	var INVALID_BASE64_RE = /[^+\/0-9A-z]/g

	function base64clean (str) {
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '='
	  }
	  return str
	}

	function stringtrim (str) {
	  if (str.trim) return str.trim()
	  return str.replace(/^\s+|\s+$/g, '')
	}

	function isArray (subject) {
	  return (Array.isArray || function (subject) {
	    return Object.prototype.toString.call(subject) === '[object Array]'
	  })(subject)
	}

	function isArrayish (subject) {
	  return isArray(subject) || Buffer.isBuffer(subject) ||
	      subject && typeof subject === 'object' &&
	      typeof subject.length === 'number'
	}

	function toHex (n) {
	  if (n < 16) return '0' + n.toString(16)
	  return n.toString(16)
	}

	function utf8ToBytes (str) {
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    var b = str.charCodeAt(i)
	    if (b <= 0x7F) {
	      byteArray.push(b)
	    } else {
	      var start = i
	      if (b >= 0xD800 && b <= 0xDFFF) i++
	      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
	      for (var j = 0; j < h.length; j++) {
	        byteArray.push(parseInt(h[j], 16))
	      }
	    }
	  }
	  return byteArray
	}

	function asciiToBytes (str) {
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF)
	  }
	  return byteArray
	}

	function utf16leToBytes (str) {
	  var c, hi, lo
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    c = str.charCodeAt(i)
	    hi = c >> 8
	    lo = c % 256
	    byteArray.push(lo)
	    byteArray.push(hi)
	  }

	  return byteArray
	}

	function base64ToBytes (str) {
	  return base64.toByteArray(str)
	}

	function blitBuffer (src, dst, offset, length) {
	  for (var i = 0; i < length; i++) {
	    if ((i + offset >= dst.length) || (i >= src.length))
	      break
	    dst[i + offset] = src[i]
	  }
	  return i
	}

	function decodeUtf8Char (str) {
	  try {
	    return decodeURIComponent(str)
	  } catch (err) {
	    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
	  }
	}

	/*
	 * We have to make sure that the value is a valid integer. This means that it
	 * is non-negative. It has no fractional component and that it does not
	 * exceed the maximum allowed value.
	 */
	function verifuint (value, max) {
	  assert(typeof value === 'number', 'cannot write a non-number as a number')
	  assert(value >= 0, 'specified a negative value for writing an unsigned value')
	  assert(value <= max, 'value is larger than maximum value for type')
	  assert(Math.floor(value) === value, 'value has a fractional component')
	}

	function verifsint (value, max, min) {
	  assert(typeof value === 'number', 'cannot write a non-number as a number')
	  assert(value <= max, 'value larger than maximum allowed value')
	  assert(value >= min, 'value smaller than minimum allowed value')
	  assert(Math.floor(value) === value, 'value has a fractional component')
	}

	function verifIEEE754 (value, max, min) {
	  assert(typeof value === 'number', 'cannot write a non-number as a number')
	  assert(value <= max, 'value larger than maximum allowed value')
	  assert(value >= min, 'value smaller than minimum allowed value')
	}

	function assert (test, message) {
	  if (!test) throw new Error(message || 'Failed assertion')
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(22).Buffer))

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	var Buffer = __webpack_require__(22).Buffer;

	var isBufferEncoding = Buffer.isEncoding
	  || function(encoding) {
	       switch (encoding && encoding.toLowerCase()) {
	         case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
	         default: return false;
	       }
	     }


	function assertEncoding(encoding) {
	  if (encoding && !isBufferEncoding(encoding)) {
	    throw new Error('Unknown encoding: ' + encoding);
	  }
	}

	// StringDecoder provides an interface for efficiently splitting a series of
	// buffers into a series of JS strings without breaking apart multi-byte
	// characters. CESU-8 is handled as part of the UTF-8 encoding.
	//
	// @TODO Handling all encodings inside a single object makes it very difficult
	// to reason about this code, so it should be split up in the future.
	// @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
	// points as used by CESU-8.
	var StringDecoder = exports.StringDecoder = function(encoding) {
	  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
	  assertEncoding(encoding);
	  switch (this.encoding) {
	    case 'utf8':
	      // CESU-8 represents each of Surrogate Pair by 3-bytes
	      this.surrogateSize = 3;
	      break;
	    case 'ucs2':
	    case 'utf16le':
	      // UTF-16 represents each of Surrogate Pair by 2-bytes
	      this.surrogateSize = 2;
	      this.detectIncompleteChar = utf16DetectIncompleteChar;
	      break;
	    case 'base64':
	      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
	      this.surrogateSize = 3;
	      this.detectIncompleteChar = base64DetectIncompleteChar;
	      break;
	    default:
	      this.write = passThroughWrite;
	      return;
	  }

	  // Enough space to store all bytes of a single character. UTF-8 needs 4
	  // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
	  this.charBuffer = new Buffer(6);
	  // Number of bytes received for the current incomplete multi-byte character.
	  this.charReceived = 0;
	  // Number of bytes expected for the current incomplete multi-byte character.
	  this.charLength = 0;
	};


	// write decodes the given buffer and returns it as JS string that is
	// guaranteed to not contain any partial multi-byte characters. Any partial
	// character found at the end of the buffer is buffered up, and will be
	// returned when calling write again with the remaining bytes.
	//
	// Note: Converting a Buffer containing an orphan surrogate to a String
	// currently works, but converting a String to a Buffer (via `new Buffer`, or
	// Buffer#write) will replace incomplete surrogates with the unicode
	// replacement character. See https://codereview.chromium.org/121173009/ .
	StringDecoder.prototype.write = function(buffer) {
	  var charStr = '';
	  // if our last write ended with an incomplete multibyte character
	  while (this.charLength) {
	    // determine how many remaining bytes this buffer has to offer for this char
	    var available = (buffer.length >= this.charLength - this.charReceived) ?
	        this.charLength - this.charReceived :
	        buffer.length;

	    // add the new bytes to the char buffer
	    buffer.copy(this.charBuffer, this.charReceived, 0, available);
	    this.charReceived += available;

	    if (this.charReceived < this.charLength) {
	      // still not enough chars in this buffer? wait for more ...
	      return '';
	    }

	    // remove bytes belonging to the current character from the buffer
	    buffer = buffer.slice(available, buffer.length);

	    // get the character that was split
	    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

	    // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
	    var charCode = charStr.charCodeAt(charStr.length - 1);
	    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
	      this.charLength += this.surrogateSize;
	      charStr = '';
	      continue;
	    }
	    this.charReceived = this.charLength = 0;

	    // if there are no more bytes in this buffer, just emit our char
	    if (buffer.length === 0) {
	      return charStr;
	    }
	    break;
	  }

	  // determine and set charLength / charReceived
	  this.detectIncompleteChar(buffer);

	  var end = buffer.length;
	  if (this.charLength) {
	    // buffer the incomplete character bytes we got
	    buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
	    end -= this.charReceived;
	  }

	  charStr += buffer.toString(this.encoding, 0, end);

	  var end = charStr.length - 1;
	  var charCode = charStr.charCodeAt(end);
	  // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
	  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
	    var size = this.surrogateSize;
	    this.charLength += size;
	    this.charReceived += size;
	    this.charBuffer.copy(this.charBuffer, size, 0, size);
	    buffer.copy(this.charBuffer, 0, 0, size);
	    return charStr.substring(0, end);
	  }

	  // or just emit the charStr
	  return charStr;
	};

	// detectIncompleteChar determines if there is an incomplete UTF-8 character at
	// the end of the given buffer. If so, it sets this.charLength to the byte
	// length that character, and sets this.charReceived to the number of bytes
	// that are available for this character.
	StringDecoder.prototype.detectIncompleteChar = function(buffer) {
	  // determine how many bytes we have to check at the end of this buffer
	  var i = (buffer.length >= 3) ? 3 : buffer.length;

	  // Figure out if one of the last i bytes of our buffer announces an
	  // incomplete char.
	  for (; i > 0; i--) {
	    var c = buffer[buffer.length - i];

	    // See http://en.wikipedia.org/wiki/UTF-8#Description

	    // 110XXXXX
	    if (i == 1 && c >> 5 == 0x06) {
	      this.charLength = 2;
	      break;
	    }

	    // 1110XXXX
	    if (i <= 2 && c >> 4 == 0x0E) {
	      this.charLength = 3;
	      break;
	    }

	    // 11110XXX
	    if (i <= 3 && c >> 3 == 0x1E) {
	      this.charLength = 4;
	      break;
	    }
	  }
	  this.charReceived = i;
	};

	StringDecoder.prototype.end = function(buffer) {
	  var res = '';
	  if (buffer && buffer.length)
	    res = this.write(buffer);

	  if (this.charReceived) {
	    var cr = this.charReceived;
	    var buf = this.charBuffer;
	    var enc = this.encoding;
	    res += buf.slice(0, cr).toString(enc);
	  }

	  return res;
	};

	function passThroughWrite(buffer) {
	  return buffer.toString(this.encoding);
	}

	function utf16DetectIncompleteChar(buffer) {
	  this.charReceived = buffer.length % 2;
	  this.charLength = this.charReceived ? 2 : 0;
	}

	function base64DetectIncompleteChar(buffer) {
	  this.charReceived = buffer.length % 3;
	  this.charLength = this.charReceived ? 3 : 0;
	}


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.
	function isArray(ar) {
	  return Array.isArray(ar);
	}
	exports.isArray = isArray;

	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	exports.isBoolean = isBoolean;

	function isNull(arg) {
	  return arg === null;
	}
	exports.isNull = isNull;

	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	exports.isNullOrUndefined = isNullOrUndefined;

	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	exports.isNumber = isNumber;

	function isString(arg) {
	  return typeof arg === 'string';
	}
	exports.isString = isString;

	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}
	exports.isSymbol = isSymbol;

	function isUndefined(arg) {
	  return arg === void 0;
	}
	exports.isUndefined = isUndefined;

	function isRegExp(re) {
	  return isObject(re) && objectToString(re) === '[object RegExp]';
	}
	exports.isRegExp = isRegExp;

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	exports.isObject = isObject;

	function isDate(d) {
	  return isObject(d) && objectToString(d) === '[object Date]';
	}
	exports.isDate = isDate;

	function isError(e) {
	  return isObject(e) &&
	      (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	exports.isError = isError;

	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	exports.isFunction = isFunction;

	function isPrimitive(arg) {
	  return arg === null ||
	         typeof arg === 'boolean' ||
	         typeof arg === 'number' ||
	         typeof arg === 'string' ||
	         typeof arg === 'symbol' ||  // ES6 symbol
	         typeof arg === 'undefined';
	}
	exports.isPrimitive = isPrimitive;

	function isBuffer(arg) {
	  return Buffer.isBuffer(arg);
	}
	exports.isBuffer = isBuffer;

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(22).Buffer))

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	exports.read = function(buffer, offset, isLE, mLen, nBytes) {
	  var e, m,
	      eLen = nBytes * 8 - mLen - 1,
	      eMax = (1 << eLen) - 1,
	      eBias = eMax >> 1,
	      nBits = -7,
	      i = isLE ? (nBytes - 1) : 0,
	      d = isLE ? -1 : 1,
	      s = buffer[offset + i];

	  i += d;

	  e = s & ((1 << (-nBits)) - 1);
	  s >>= (-nBits);
	  nBits += eLen;
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

	  m = e & ((1 << (-nBits)) - 1);
	  e >>= (-nBits);
	  nBits += mLen;
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

	  if (e === 0) {
	    e = 1 - eBias;
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity);
	  } else {
	    m = m + Math.pow(2, mLen);
	    e = e - eBias;
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
	};

	exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c,
	      eLen = nBytes * 8 - mLen - 1,
	      eMax = (1 << eLen) - 1,
	      eBias = eMax >> 1,
	      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
	      i = isLE ? 0 : (nBytes - 1),
	      d = isLE ? 1 : -1,
	      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

	  value = Math.abs(value);

	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0;
	    e = eMax;
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2);
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--;
	      c *= 2;
	    }
	    if (e + eBias >= 1) {
	      value += rt / c;
	    } else {
	      value += rt * Math.pow(2, 1 - eBias);
	    }
	    if (value * c >= 2) {
	      e++;
	      c /= 2;
	    }

	    if (e + eBias >= eMax) {
	      m = 0;
	      e = eMax;
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen);
	      e = e + eBias;
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
	      e = 0;
	    }
	  }

	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

	  e = (e << mLen) | m;
	  eLen += mLen;
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

	  buffer[offset + i - d] |= s * 128;
	};


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	;(function (exports) {
		'use strict';

	  var Arr = (typeof Uint8Array !== 'undefined')
	    ? Uint8Array
	    : Array

		var PLUS   = '+'.charCodeAt(0)
		var SLASH  = '/'.charCodeAt(0)
		var NUMBER = '0'.charCodeAt(0)
		var LOWER  = 'a'.charCodeAt(0)
		var UPPER  = 'A'.charCodeAt(0)

		function decode (elt) {
			var code = elt.charCodeAt(0)
			if (code === PLUS)
				return 62 // '+'
			if (code === SLASH)
				return 63 // '/'
			if (code < NUMBER)
				return -1 //no match
			if (code < NUMBER + 10)
				return code - NUMBER + 26 + 26
			if (code < UPPER + 26)
				return code - UPPER
			if (code < LOWER + 26)
				return code - LOWER + 26
		}

		function b64ToByteArray (b64) {
			var i, j, l, tmp, placeHolders, arr

			if (b64.length % 4 > 0) {
				throw new Error('Invalid string. Length must be a multiple of 4')
			}

			// the number of equal signs (place holders)
			// if there are two placeholders, than the two characters before it
			// represent one byte
			// if there is only one, then the three characters before it represent 2 bytes
			// this is just a cheap hack to not do indexOf twice
			var len = b64.length
			placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

			// base64 is 4/3 + up to two characters of the original data
			arr = new Arr(b64.length * 3 / 4 - placeHolders)

			// if there are placeholders, only get up to the last complete 4 chars
			l = placeHolders > 0 ? b64.length - 4 : b64.length

			var L = 0

			function push (v) {
				arr[L++] = v
			}

			for (i = 0, j = 0; i < l; i += 4, j += 3) {
				tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
				push((tmp & 0xFF0000) >> 16)
				push((tmp & 0xFF00) >> 8)
				push(tmp & 0xFF)
			}

			if (placeHolders === 2) {
				tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
				push(tmp & 0xFF)
			} else if (placeHolders === 1) {
				tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
				push((tmp >> 8) & 0xFF)
				push(tmp & 0xFF)
			}

			return arr
		}

		function uint8ToBase64 (uint8) {
			var i,
				extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
				output = "",
				temp, length

			function encode (num) {
				return lookup.charAt(num)
			}

			function tripletToBase64 (num) {
				return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
			}

			// go through the array every three bytes, we'll deal with trailing stuff later
			for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
				temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
				output += tripletToBase64(temp)
			}

			// pad the end with zeros, but make sure to not forget the extra bytes
			switch (extraBytes) {
				case 1:
					temp = uint8[uint8.length - 1]
					output += encode(temp >> 2)
					output += encode((temp << 4) & 0x3F)
					output += '=='
					break
				case 2:
					temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
					output += encode(temp >> 10)
					output += encode((temp >> 4) & 0x3F)
					output += encode((temp << 2) & 0x3F)
					output += '='
					break
			}

			return output
		}

		exports.toByteArray = b64ToByteArray
		exports.fromByteArray = uint8ToBase64
	}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))


/***/ }
/******/ ])