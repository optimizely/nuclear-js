# Rest API Example

This example shows how to build a generic Rest API module for NuclearJS's flux architecture.

## Architecture

#### A client-side source of truth

Component architecture, being inherently portable, draws stricter boundaries between components sharing state.  This leaves a need
for a client-side source of truth when synchronizing entities across the network and across components.

Using the server directly as a source of truth means any component that persists some state server side needs to tell every other component
that the app state has changed, this type of component-to-component communications get very messy very quickly.

In this architecture a `restApiCache` store is used as the client-side source of truth for the state of server-side entities.  Components subscribe
to the entities they care about using **getters**.  This does a great thing, it decouples the writes and reads of state.  It no longer matters which
components subscribe to some piece of state.  If **component A** saves something then it will be updated in the `restApiCache` and **component B** will receive
the new state automatically by subscribing to a getter.

**Unidirectional data flow**

```
     +--------->[restApiCache store]
     |               |        |
  [server]           |        |
     |               |        | *getter*
     |               |        |
     |              /          \
     |             /            \
     | **save**   /              \
     +------[component A]  [component B]
```

**component A** is saving some entity to the server, the response then dispatches an action that updates the `restApiCache` store causing both **component A**
and **component B** to be updated.  The pattern ensures all components are in sync because the source of truth is completely external to all components.


## TODO

### v1

- [x] Complete testing the `createApiActions` method 100%
- [ ] Implement travis.ci badge for coverage
- [ ] add example entity module
- [ ] Write readme and document the api actions pattern an
- [ ] Link to README / example in main NuclearJS README
- [x] Cleanup components / gulp / webpack configs

### v2

- [ ] Create module for e2e example
- [ ] Add components that use API actions
- [ ] Create express server that serves dummy data

