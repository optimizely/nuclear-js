# Plans for 0.4.0

#### Immutable first API

- `reactor.get` returns immutable version
- `reactor.getJS` returns coerced toJS version
- `changeObserver.onChange` passes the handler function the immutable versions
- Expose `Nuclear.toJS()` method to coerce Immutable value to JS

#### Intruduce the concept of a Composite

This would attempt to solve the issue of where should reactor level computeds be defined.
Storing them directly on the reactor feels a little message, what is the most functional/flexible way to do this?

It may be best to treat these the same as Cores, however they receive the state of all the cores they have
declared themselves dependent on and returns a state for a new section of the map.  

By making the Composite -> Core dependency graph explicit, things like circular dependencies and Composites depending
on other Composites will become easier to manage.

#### Rename to use flux jargon (maybe)

- ~~`Nuclear.createCore()` => `Nuclear.createStore()`~~ (not doing)
- ~~`Reactor.attachCore()` => `Nuclear.registerStore()`~~ (not doing)
- `Reactor.cycle()` => `Reactor.dispatch()`
- ~~`ReactorCore.react()` => `ReactorCore.handle()`~~ (not doing)
