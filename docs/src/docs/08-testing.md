---
title: "Testing"
section: "Guide"
---

# Testing

The most valuable and easy to write tests for NuclearJS are unit tests.  **The unit in NuclearJS is the action.** The key assertion we want to make
is that a particular action or set of actions properly transforms the Reactor from **State A** to **State B**.

This is done by setting up the reactor with the proper state, using actions, executing the action under test and asserting proper state via **Getters**.

## Example

In our testing example we will test our Project module which contains two stores, the `currentProjectIdStore` and the `projectStore` as well as
actions and getters.

#### `index.js`

```javascript
import reactor from '../reactor'
import projectStore from './stores/projectStore'
import currentProjectIdStore from './stores/currentProjectIdStore'
import actions from './actions'
import getters from './getters'

reactor.registerStores({
  currentProjectId: currentProjectIdStore,
  projects: projectStore,
})

export default { getters, actions }
```

#### `stores/currentProjectIdStore.js`

```javascript
import { Store } from 'nuclear-js'
import { CHANGE_CURRENT_PROJECT_ID } from '../actionTypes'

export default Store({
  getInitialState() {
    return null
  },

  initialize() {
    this.on(CHANGE_CURRENT_PROJECT_ID, (currentId, newId) => newId)
  },
})
```

#### `stores/projectStore.js`

```javascript
import { Store, toImmutable } from 'nuclear-js'
import { LOAD_PROJECTS } from '../actionTypes'

export default Store({
  getInitialState() {
    // will maintain a map of project id => project object
    return toImmutable({})
  },

  initialize() {
    this.on(LOAD_PROJECTS, loadProjects)
  },
})

/**
 * @param {Immutable.Map} state
 * @param {Object} payload
 * @param {Object[]} payload.data
 * @return {Immutable.Map} state
 */
function loadProjects(state, payload) {
  return state.withMutations(state => {
    payload.data.forEach(function(project) {
      state.set(project.id, project)
    })
  })
}
```

#### `actions.js`

```javascript
import Api from '../utils/api'
import reactor from '../reactor'
import { LOAD_PROJECTS } from './actionTypes'

export default {
  fetchProjects() {
    return Api.fetchProjects.then(projects => {
      reactor.dispatch(LOAD_PROJECTS, {
        data: projects,
      })
    })
  },

  /**
   * @param {String} id
   */
  setCurrentProjectId(id) {
    reactor.dispatch(CHANGE_CURRENT_PROJECT_ID, id)
  },
}
```

#### `getters.js`

```javascript
const projectsMap = ['projects']

const currentProjectId = ['currentProjectId']

const currentProject = [
  currentProjectId,
  projectsMap,
  (id, projects) => projects.get(id)
]

export default { projectsMap, currentProject, currentProjectId }
```

### Tests

Given our module we want to test the following:

- Using `actions.setCurrentProjectId()` sets the correct id using the `currentProjectId` getter.

- When `Api.fetchProducts` is stubbed with mock data, calling `actions.fetchProjects` properly populates
  the projects store by using the `projectsMap` getter.

- When projects have been loaded and currentProjectId set, `currentProject` getter works.

**Testing Tools**

We will use the following tools: **mocha**, **sinon**, and **expect.js**.  The same testing ideas can be implemented with a variety of tools.

#### `tests.js`

```javascript
import reactor from '../reactor'
import Api from '../utils/api'
import expect from 'expect'

// module under test
import Project from './index'

let mockProjects = [
  { id: '123-abc', name: 'project 1' },
  { id: '456-cdf', name: 'project 2' },
]

describe('modules/Project', () => {
  afterEach(() => {
    reactor.reset()
  })

  describe('actions', () => {
    describe('#setCurrentProjectId', () => {
      it('should set the current project id', () => {
        Project.actions.setCurrentProjectId('123-abc')

        expect(reactor.evaluate(Project.getters.currentProjectId)).to.be('123-abc')
      })
    })

    describe('#fetchProjects', () => {
      beforeEach(() => {
        let fetchProjectsPromise = new Promise((resolve, reject) => {
          resolve(mockProjects)
        })

        sinon.stub(Api, 'fetchProjects').returns(fetchProjectsPromise)
      })

      afterEach(() => {
        Api.fetchProjects.restore()
      })

      it('should load projects into the project store', (done) => {
        Project.actions.fetchProjects().then(() => {
          projectsMap = reactor.evaluateToJS(Project.getters.projectMap)
          expect(projectsMap).to.eql({
            '123-abc': { id: '123-abc', name: 'project 1' },
            '456-cdf': { id: '456-cdf', name: 'project 2' },
          })
          done()
        })
      })
    })
  })

  describe('getters', () => {
    describe('#currentProject', () => {
      beforeEach((done) => {
        let fetchProjectsPromise = new Promise((resolve, reject) => {
          resolve(mockProjects)
        })
        sinon.stub(Api, 'fetchProjects').returns(fetchProjectsPromise)

        // wait for the projects to be fetched / loaded into store before test
        Project.actions.fetchProjects().then(() => {
          done()
        })
      })

      afterEach(() => {
        Api.fetchProjects.restore()
      })

      it('should evaluate to the current project when the currentProjectId is set', () => {
        expect(reactor.evaluate(Project.getters.currentProject)).to.be(undefined)

        Project.actions.setCurrentProjectId('123-abc')

        expect(reactor.evaluateToJS(Project.getters.currentProject)).to.eql({
          id: '123-abc',
          name: 'project 1',
        })
      })
    })
  })
})
```

## Recap

When testing NuclearJS code it makes sense to test around actions by asserting proper state updates via getters.  While these tests may seem simple, they are
testing that our stores, actions and getters are all working together in a cohesive manner.  As your codebase scales, these tests can be the foundation of unit tests
for all your data flow and state logic.

Another thing to note is that we did not stub or mock any part of the NuclearJS system.  While testing in isolation is good for a variety of reasons,
isolating too much will cause your tests to be unrealistic and more prone to breakage after refactoring.  By testing the entire module as a unit
you are able to keep the test high level with limited stubs.
