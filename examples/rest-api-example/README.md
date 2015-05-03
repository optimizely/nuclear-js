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

#### Functional creation of entity actions

This patterns relies on the `createApiActions(model)` function which takes a generic model object that defines how to do `save`, `fetch`, `fetchAll` and `delete`
and then wraps each of those functions with the appropriate `Flux.dispatch` calls.

See the [Example User Model](./src/modules/user/model.js) in the code or checkout the following:

**Example model**

```js
var $ = require('jquery')
var sprintf = require('util').format
var BASE_URL = 'https://www.optimizelyapis.com/experiment/v1'
var ENTITY = 'projects'

exports.entity = ENTITY

/**
 * @param {Number} id
 * @return {Promise}
 */
exports.fetch = function(id) {
  return $.ajax({
    url: sprintf('%s/%s/%s', BASE_URL, ENTITY, id),
    method: 'GET',
    contentType: 'application/json',
  })
}

/**
 * @return {Promise}
 */
exports.fetchAll = function() {
  return $.ajax({
    url: sprintf('%s/%s', BASE_URL, ENTITY),
    method: 'GET',
    contentType: 'application/json',
  })
}

/**
 * @param {Project} instance
 * @return {Promise}
 */
exports.save = function(instance) {
  if (instance.id) {
    return $.ajax({
      url: sprintf('%s/%s/%s', BASE_URL, ENTITY, instance.id),
      method: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify(instance),
      dataType: 'json'
    })
  } else {
    return $.ajax({
      url: sprintf('%s/%s', BASE_URL, ENTITY),
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(instance),
      dataType: 'json'
    })
  }
}

/**
 * @param {Project} instance
 * @return {Promise}
 */
exports.delete = function(instance) {
  return $.ajax({
    url: sprintf('%s/%s/%s', BASE_URL, ENTITY, instance.id),
    method: 'DELETE',
    contentType: 'application/json',
  })
}
```

**Creating Project actions**

```js
var RestApi = require('../rest-api')
var model = require('./model')

var projectApiActions = RestApi.createApiActions(model)

module.exports = _.extend({}, projectApiActions, {
  // additional project actions go here
})
```

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

#### Model interface

The following interface is required for a model to properly work with `createApiActions`

**`Model.entity : String`**

**`Model.fetch(params : any) : Promise`**

**`Model.fetchAll(params : any) : Promise`**

**`Model.save(instance : Object) : Promise`**

**`Model.delete(instance : Object) : Promise`**

## TODO

### v1

- [x] Complete testing the `createApiActions` method 100%
- [ ] Implement travis.ci badge for coverage
- [x] add example entity module
- [x] Update rest-api-example README with architecture overview
- [x] Update rest-api-example README example model
- [ ] Update rest-api-example README with getter pattern for rest api modules
- [ ] Link to README / example in main NuclearJS README
- [x] Cleanup components / gulp / webpack configs

### v2

- [ ] Create module for e2e example
- [ ] Add components that use API actions
- [ ] Create express server that serves dummy data

