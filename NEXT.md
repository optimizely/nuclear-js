# Plans for 0.4.0

#### Immutable first API

- `reactor.get` returns immutable version
- `reactor.getJS` returns coerced toJS version
- `changeObserver.onChange` passes the handler function the immutable versions
- Expose `Nuclear.toJS()` method to coerce Immutable value to JS

#### Rename to use flux jargon (maybe)

- `Nuclear.createCore()` => `Nuclear.createStore()`
- `Reactor.attachCore()` => `Nuclear.registerStore()`
- `Reactor.cycle()` => `Reactor.dispatch()`
- `ReactorCore.react()` => `ReactorCore.handle()`
