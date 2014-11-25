# Reactor Interface

Anything that implements the following can be arbitrarily swapped out in any system that uses a Nuclear Reactor.

## KeyPaths

In NuclearJS keyPaths are used everywhere as a pointer to a value in a map

**`'foo.bar'`** is equivalent to **`['foo', 'bar']`**

Use the array syntax when you need to specify a dynamic keyPath or a keyPath with an number.

ex: `['projects', projectId]` or `['projects', 123]`


## Reactor Interface

### reactor.dispatch(messageType, payload)

- **messageType** `string`
- **payload** `any` *optional*

**Usage**

```js
reactor.dispatch('login', {
  userId: 123,
})
```


### reactor.get(...keyPaths, getFn)

- **...keyPaths** `string|array` any number of keyPaths
- **getFn** `function` *optional* called with `map.getIn(keyPath)` as arguments.  Defaults to the identity function

**Usage**

Given some app state that looks like:

```js
{
  foo: {
    bar: 64
  },

  multiplier: 4,

  projects: {
    1: { id: 1, name: 'project 1' },
    2: { id: 2, name: 'project 2' },
  }
}
```

```js
reactor.get('foo.bar') // returns 64
reactor.get(['foo', 'bar']) // returns 64

var double = function(x) { return x * 2; }
reactor.get('foo.bar', double) // returns 128
reactor.get(['foo', 'bar'], double) // returns 128

// a computed based on two values

reactor.get('foo.bar', 'multiplier', function(foobarValue, multiplier) {
  return foobarValue * multiplier;
}) // returns 256

reactor.get(['foo', 'bar'], ['multiplier'], function(foobarValue, multiplier) {
  return foobarValue * multiplier;
}) // returns 256
```

### reactor.observe(getter, handler)

- **getter** `array|Getter` any array or arguments that can be passed to `reactor.get`
- **handler** `function` called with the value of `reactor.get(getter)`
- Returns an unobserve function that when called stops observation and removes any listeners

**Usage**

```js
var unobserve = reactor.observe(['foo.bar'], function(val) {
  console.log(val);
}); // will console log the value of reactor.get('foo.bar') anytime it changes

var getter = [
  ['foo', 'bar'],
  ['multiplier'],
  function(foobarVal, multiplier) {
    return foobarValue * multiplier;
  }
];

var unobserve = reactor.observe(getter, function(val) {
  console.log(val);
}); // will console log the value of reactor.get.apply(reactor, getter)
```
