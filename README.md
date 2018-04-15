 NuclearJS

[![Build Status](https://travis-ci.org/optimizely/nuclear-js.svg?branch=master)](https://travis-ci.org/optimizely/nuclear-js)
[![Coverage Status](https://coveralls.io/repos/optimizely/nuclear-js/badge.svg?branch=master)](https://coveralls.io/r/optimizely/nuclear-js?branch=master)
[![Join the chat at https://gitter.im/optimizely/nuclear-js](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/optimizely/nuclear-js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/nuclearjs.svg)](https://saucelabs.com/u/nuclearjs)

Traditional Flux architecture built with ImmutableJS data structures.

## Documentation

[https://optimizely.github.io/nuclear-js/](https://optimizely.github.io/nuclear-js/)

## Design Philosophy

- **Simple Over Easy** - The purpose of NuclearJS isn't to write the most expressive TodoMVC anyone's ever seen.  The goal of NuclearJS is to provide a way to model data that is easy to reason about and decouple at very large scale.

- **Immutable** - A means for less defensive programming, more predictability and better performance.

- **Functional** - The framework should be implemented functionally wherever appropriate.  This reduces incidental complexity and pairs well with Immutability.

- **Smallest Amount of State Possible** - Using NuclearJS should encourage the modeling of your application state in the most minimal way possible.

- **Decoupled** - A NuclearJS system should be able to function without any sort of UI or frontend.  It should be backend/frontend agnostic and be able to run on a NodeJS server.

## Installation

NuclearJS can be downloaded from [npm](https://www.npmjs.com/).

```
npm install nuclear-js
```

## Examples

- [Shopping Cart Example](./examples/shopping-cart) - Provides a general overview of basic NuclearJS concepts: actions, stores and getters with ReactJS.
- [Flux Chat Example](./examples/flux-chat) - A classic Facebook flux chat example written in NuclearJS.
- [Rest API Example](./examples/rest-api) - Shows how to deal with fetching data from an API using NuclearJS conventions.
- [Hot reloadable stores](./examples/hot-reloading) - Shows how to setup stores to be hot reloadable using webpack hot module replacement.

## How NuclearJS differs from other Flux implementations

1.  All app state is in a singular immutable map, like [Om](https://github.com/omcljs/om).  In development you can see your entire application state at every point in time thanks to awesome debugging tools built into NuclearJS.

2.  State is not spread out through stores, instead stores are a declarative way of describing some top-level domain of your app state. For each key in the app state map a store declares the initial state of that key and how that piece of the app state reacts over time to actions dispatched on the flux system.

3.  Stores are not reference-able nor have any `getX` methods on them.  Instead NuclearJS uses a functional lens concept called **getters**. In fact, the use of getters obviates the need for any store to know about another store, eliminating the confusing `store.waitsFor` method found in other flux implementations.

4.  NuclearJS is insanely efficient - change detection granularity is infinitesimal, you can even observe computed state where several pieces of the state map are combined together and run through a transform function.  NuclearJS is smart enough to know when the value of any computed changes and only call its observer if and only if its value changed in a way that is orders of magnitude more efficient than traditional dirty checking.  It does this by leveraging ImmutableJS data structure and using a `state1 !== state2` reference comparison which runs in constant time.

5.  Automatic data observation / rendering -- automatic re-rendering is built in for React in the form of a very lightweight mixin.  It is also easily possible to build the same functionality for any UI framework such as VueJS, AngularJS and even Backbone.

6.  NuclearJS is not a side-project, it's used as the default Flux implementation that powers all of Optimizely.  It is well tested and will continue to be maintained for the foreseeable future. Our current codebase has over dozens of stores, actions and getters, we even share our prescribed method of large scale code organization and testing strategies.

## Performance

Getters are only calculated whenever their dependencies change. So if the dependency is a keypath then it will only recalculate when that path in the app state map has changed (which can be done as a simple `state.getIn(keyPath) !== oldState.getIn(keyPath)` which is an `O(log32(n))` operation. The other case is when a getter is dependent on other getters. Since every getter is a pure function, NuclearJS will only recompute the getter if the values of its dependencies change.

## API Documentation

[API Documentation](https://optimizely.github.io/nuclear-js/docs/07-api.html)

## For Smaller Applications

NuclearJS was designed first and foremost for large scale production codebases.  For a much more lightweight Flux implementation that shares many of the same ideas and design principles check out [Microcosm](https://github.com/vigetlabs/microcosm).

## Contributing

Contributions are welcome, especially with the documentation website and examples.  See [CONTRIBUTING.md](./CONTRIBUTING.md).
