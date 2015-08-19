# Rest API Example

This example shows how to build a generic Rest API module for NuclearJS's flux architecture.

## Running

You must have [npm](https://www.npmjs.org/) installed on your computer.
From the root project directory run these commands from the command line:

`npm install`

This will install all dependencies.

To build the project, first run this command:

`npm start`

After starting the watcher, you can open `index.html` in your browser to
open the app.

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
                                                     ┌────────────────────┐
                                                     │  Nuclear AppState  │
                                         ┌───────────┴────────────────────┴───────────┐
                                         │  {                                         │
                                         │    restApiCache: {                         │
                                         │      experiments: {                        │
                                         │        1: { id: 1, project_id: 45, ... },  │
                  ┌─────────────────────▶│        2: { id: 2, project_id: 123, ... }, │
        ┌─────────┴─────────┐            │      }                                     │
        │ Response updates  │            │    },                                      │
        │ global app state  │            │  }                                         │
        └─────────┬─────────┘            └────────────────────────────────────────────┘
                  │                                             │
           ┌─────────────┐                                      │
           │             │                                      │
           │  Rest API   │                                      │
           │  (server)   │                                      ▼
           │             │                          ┌───────────────────────┐
           └─────────────┘                          │   Updated App State   │
                  ▲                                 │   Recomputes Getter   │
                  │                                 └───────────────────────┘
      ┌───────────┴────────────┐                                │
      │ Module action triggers │                                │
      │      API request       │                   ┌────────────┴────────────┐
      └───────────┬────────────┘                   │                         │
                  │                                │                         │
                  │                                ▼                         ▼
  ┌───────────────────────────────┐      ┌───────────────────┐     ┌──────────────────┐
  │ Experiment.actions.fetchAll({ │      │                   │     │                  │
  │   project_id: 123             │      │    Component A    │     │   Component B    │
  │ });                           │      │                   │     │                  │
  └───────────────────────────────┘      └───────────────────┘     └──────────────────┘
```

**component A** is saving some entity to the server, the response then dispatches an action that updates the `restApiCache` store causing both **component A**
and **component B** to be updated.  The pattern ensures all components are in sync because the source of truth is completely external to all components.

## A RestApi Entity Module

#### Functional creation of entity actions

This patterns relies on the `createApiActions(model)` function which takes a generic model object that defines how to do `save`, `fetch`, `fetchAll` and `delete`
and then wraps each of those functions with the appropriate `Flux.dispatch` calls.

`./modules/project/actions.js`

```js
var RestApi = require('../rest-api')
var model = require('./model')

var projectApiActions = RestApi.createApiActions(model)

module.exports = _.extend({}, projectApiActions, {
  // additional project actions go here
})
```

See the [Example User Model](./src/modules/user/model.js) in the code or the following:

`./modules/project/model.js`

```js
var request = require('superagent-promise')
var sprintf = require('util').format
var BASE_URL = 'https://www.optimizelyapis.com/experiment/v1'
var ENTITY = 'projects'

exports.entity = ENTITY

/**
 * @param {Number} id
 * @return {Promise}
 */
exports.fetch = function(id) {
  return request
    .get(sprintf('%s/%s/%s', BASE_URL, ENTITY, id))
    .accept('json')
    .end()
}

/**
 * @return {Promise}
 */
exports.fetchAll = function() {
  return request
    .get(sprintf('%s/%s', BASE_URL, ENTITY))
    .accept('json')
    .end()
}

/**
 * @param {Project} instance
 * @return {Promise}
 */
exports.save = function(instance) {
  if (instance.id) {
    return request
      .put(sprintf('%s/%s/%s', BASE_URL, ENTITY, instance.id))
      .type('json')
      .send(instance)
      .end()
  } else {
    return request
      .post(sprintf('%s/%s', BASE_URL, ENTITY))
      .type('json')
      .send(instance)
      .end()
  }
}

/**
 * @param {Project} instance
 * @return {Promise}
 */
exports.delete = function(instance) {
  return request
    .del(sprintf('%s/%s/%s', BASE_URL, ENTITY, instance.id))
    .type('json')
    .end()
  })
}
```

`./modules/project/getters.js`

```js
var RestApi = require('../rest-api')
var model = require('./model')

exports.entityMap = RestApi.createEntityMapGetter(model)

exports.byId = RestApi.createByIdGetter(model)
```

#### Putting everything together


`./modules/project/index.js`

```js
exports.actions = require('./actions')

exports.getters = require('./getters')
```

index file provides the modules public interface

**Usage**

```js
var Flux = require('./flux')
var Project = require('./modules/project')

// fetch all projects and automatically ingest into restApiCache store
Project.actions.fetchAll().then(function() {
  // access them via the auto generated entityMap getter
  var projectsMap = Flux.evaluateToJS(Project.getters.entityMap)
})

Project.actions.delete({ id: 123 }).then(function() {
  // project delete on server and in the restApiCache
  // all subscribed components will be automatically updated
})

var newProject = {
  name: 'new project',
}

Project.actions.save(newProject).then(function() {
  // server saves new project and assigns it an id.  The newly created project now exists
  // in the restApiCache and any component that is subscribing will be updated
})
```

## Model Interface

The following interface is required for a model to properly work with `createApiActions`

**`Model.entity : String`**

**`Model.fetch( params : any ) : Promise`**

**`Model.fetchAll( params : any ) : Promise`**

**`Model.save( instance : Object ) : Promise`**

**`Model.delete( instance : Object ) : Promise`**


## Entity Getters

**`RestApi.createEntityMapGetter( model ) : Getter`**

Creates a getter for a specific model that references the `restApiCache` map of entity id => entity.

**`RestApi.createByIdGetter( model ) : function`**

Creates a function that returns a getter that references a specific entity by id in the `restApiCache` map.

**Usage**

```js
Project.actions.fetchAll()

flux.observe(Project.getters.entityMap, projectMap => {
  console.log('project rest api cache changed', projectMap.toJS())
})

flux.observe(Project.getters.byId(123), project123 => {
  console.log('project with id=123 changed', project123)
})
```


## TODO

### v1

- [x] Complete testing the `createApiActions` method 100%
- [x] add example entity module
- [x] Update rest-api-example README with architecture overview
- [x] Update rest-api-example README example model
- [x] Update rest-api-example README with getter pattern for rest api modules
- [x] Link to README / example in main NuclearJS README
- [x] Cleanup components / gulp / webpack configs

### v2

- [ ] Create module for e2e example
- [ ] Add components that use API actions
- [ ] Create express server that serves dummy data

