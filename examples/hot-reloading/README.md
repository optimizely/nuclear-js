NuclearJS Hot Reloading
===

NuclearJS supports hot reloading of stores.  Using the webpack Hot Module Replacement simply code like this to wherever your stores are registered.


```js
import { Reactor } from 'nuclear-js'
import * as stores from './stores'

const reactor = new Reactor({
  debug: true,
})
reactor.registerStores(stores)

if (module.hot) {
  // Enable webpack hot module replacement for stores
  module.hot.accept('./stores', () => {
    reactor.replaceStores(require('./stores'))
  })
}

export default reactor
```

## Running Example

```
npm install
npm start
```

Go to [http://localhost:3000](http://localhost:3000)

## Inpsiration & Thanks

Big thanks to [redux](https://github.com/rackt/redux) and [react-redux](https://github.com/rackt/react-redux) for proving out this architecture
and creating simple APIs to accomplish hot reloading.
