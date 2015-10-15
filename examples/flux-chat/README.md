## Flux Chat Example

This is the Facebook [flux-chat](https://github.com/facebook/flux/tree/master/examples/flux-chat)
example re-written in NuclearJS to demonstate the differences in the libraries as well as to show how Getters are used.

## Running

You must have [npm](https://www.npmjs.org/) installed on your computer.
From the root project directory run these commands from the command line:

`npm install`

This will install all dependencies.

To build the project, first run this command:

`npm start`

After starting the watcher, you can open `index.html` in your browser to
open the app.

## Example Code

Let's see what the original [Flux Chat Example](https://github.com/facebook/flux/tree/master/examples/flux-chat) looks like in NuclearJS.

All of the above code lives in [examples/flux-chat](/examples/flux-chat)

##### `flux.js`

```js
// create the Nuclear reactor instance, this will act as our dispatcher and interface for data fetching
var Nuclear = require('nuclear-js')

module.exports = new Nuclear.Reactor({
  debug: true,
})
```

### Modules

The prescribed way of code organization in NuclearJS is to group all stores, actions and getters of the same domain in a module.

##### Example Module File Structure

For the flux-chat example we will create a chat module that holds all of the domain logic for the chat aspect.  For smaller projects there may only need to be one module, but for larger projects using many modules can decouple your codebase and make it much easier to manage.

```js
modules/chat
├── stores/
    └── thread-store.js
    └── current-thread-id-store.js
├── actions.js // exports functions that call flux.dispatch
├── action-types.js // constants for the flux action types
├── getters.js // getters exposed by the module providing read access to module's stores
├── index.js // MAIN ENTRY POINT - facade that exposes a public api for the module
└── tests.js // module unit tests that test the modules stores, getters, and actions
```

##### `modules/chat/index.js`

```js
var flux = require('../../flux')

flux.registerStores({
  currentThreadID: require('./stores/current-thread-id-store'),
  threads: require('./stores/thread-store'),
})

module.exports = {
  actions: require('./actions'),

  getters: require('./getters'),
}
```

- Modules expose a single public API, the `index.js` file.  It is improper for an outside piece of code to require any file within the module except the `index.js` file.

- Stores are registered lazily through the module's index.js.  This may seem weird at first, but in NuclearJS stores are more of an implementation detail and not ever directly referenceable.

- Data access to the module's store values is done entirely through the getters it exposes.  This provides a decoupling between the store implementation and how the outside world references the state that a module manages.  A getter is a contract between the outside world and the module that a particular piece of information is accessible.  The evaluator of a getter does not care about the underlying store representation.

### Stores

##### `modules/chat/stores/thread-store.js`

```js
var Nuclear = require('nuclear-js')
var toImmutable = Nuclear.toImmutable
var actionTypes = require('../action-types')

module.exports = new Nuclear.Store({
  getInitialState() {
    // for Nuclear to be so efficient all state must be immutable data
    // mapping of threadID => Thread
    return toImmutable({})
  },

  initialize() {
    // all action handlers are pure functions that take the current state and payload
    this.on(actionTypes.ADD_MESSAGE, addMessage)
    this.on(actionTypes.CLICK_THREAD, setMessagesRead)
  }
})

/**
 * @type Message
 * id {GUID}
 * threadID {GUID}
 * threadName {GUID}
 * authorName {String}
 * text {String}
 * isRead {Boolean}
 * timestamp {Timestamp}
 */

/**
 * @param {Immutable.Map}
 * @param {Object} payload
 * @param {Message} payload.message
 */
function addMessage(state, { message }) {
  var msg = toImmutable(message)
  var threadID = msg.get('threadID')

  return state.withMutations(threads => {
    // use standard ImmutableJS methods to transform state when handling an action
    if (!threads.has(threadID)) {
      threads.set(threadID, toImmutable({
        threadID: threadID,
        threadName: msg.get('threadName'),
        messages: toImmutable([]),
      }))
    }

    // push new message into thread and sort by message timestamp
    threads.update(threadID, thread => {
      var sortedMessages = thread.get('messages')
        .push(msg)
        .sortBy(msg => msg.get('timestamp'))

      return thread.set('messages', sortedMessages)
    })
  })
}

/**
 * Mark all messages for a thread as "read"
 * @param {Immutable.Map}
 * @param {Object} payload
 * @param {GUID} payload.threadID
 */
function setMessagesRead(state, { threadID }) {
  return state.updateIn([threadID, 'messages'], messages => {
    return messages.map(msg => msg.set('isRead', true))
  })
}
```

##### `modules/message/stores/current-thread-id-store.js`

```js
var Nuclear = require('nuclear-js')
var toImmutable = Nuclear.toImmutable
var actionTypes = require('../action-types')

module.exports = new Nuclear.Store({
  getInitialState() {
    // only keeps track of the current threadID
    return null
  },

  initialize() {
    // all action handlers are pure functions that take the current state and payload
    this.on(actionTypes.CLICK_THREAD, setCurrentThreadID)
  }
})

function setCurrentThreadID(state, { threadID }) {
  // return the new value of the store's state
  return threadID
}
```

At this point defined how our application manages state over time by creating and registering the thread store and currentThreadID store. When defining stores there is no need to worry about computable state like the most recent message in each thread, this is all handled through getters.

### Getters

Getters can take 2 forms:

  1. A KeyPath such as `['messages']` which equates to a `state.getIn(['messages'])` on the app state `Immutable.Map`.
  2. An array with the form `[  [keypath | getter], [keypath | getter], ..., tranformFunction]`

##### `modules/chat/getters.js`

```js
// it is idiomatic to facade all data access through getters, that way a component only has to subscribe to a getter making it agnostic
// to the underlying stores / data transformation that is taking place
exports.threadsMap = ['threads']

exports.threads = [
  exports.threadsMap,
  threadsMap => threadsMap.toList()
]

exports.currentThread = [
  ['currentThreadID'],
  exports.threadsMap,
  (currentThreadID, threadsMap) => threadsMap.get(currentThreadID)
]

exports.latestThread = [
  exports.threads,
  threads => {
    return threads
      .sortBy(thread => {
        thread.get('messages').last().get('timestamp')
      })
      .last()
  }
]


exports.currentThreadID = [
  exports.currentThread,
  thread => thread ? thread.get('threadID') : null
]

exports.unreadCount = [
  exports.threads,
  threads => {
    return threads.reduce((accum, thread) => {
      if (!thread.get('messages').last().get('isRead')) {
        accum++
      }
      return accum
    }, 0)
  }
]
```

Since stores are registered on the Nuclear Reactor by the module's index file, then a module is the only part of the system that knows the store ids, if this information need to be made public, the module will export a getter of the form `[<storeId>]`


### Actions

##### `module/chat/actions.js`

```js
var flux = require('../../flux')
var actionTypes = require('./action-types')
var getters = require('./getters')

/**
 * Handles the receiving of messages into the flux system
 * @param {Message[]} messages
 */
exports.receiveAll = function(messages) {
  messages.forEach(message => {
    flux.dispatch(actionTypes.ADD_MESSAGE, { message })
  })
}

/**
 * Creates a message
 * @param {String} text
 * @param {GUID} threadName
 */
exports.createMessage = function(text, threadID) {
  var timestamp = Date.now()
  var id = 'm_' + timestamp
  var threadName = flux.evaluate([
    getters.threadsMap,
    threadsMap => threadsMap.getIn([threadID, 'threadName'])
  ])
  var authorName = 'Jordan'

  flux.dispatch(actionTypes.ADD_MESSAGE, {
    message: { id, threadID, threadName, authorName, timestamp, text }
  })
}

exports.clickThread = function(threadID) {
  flux.dispatch(actionTypes.CLICK_THREAD, { threadID })
}
```

### Hooking it up to a component

###### `components/ThreadSection.react.js`

```js
var React = require('react');
var flux = require('../flux');
var Chat = require('../modules/chat');

var ThreadListItem = require('./ThreadListItem.react');

var ThreadSection = React.createClass({
  mixins: [flux.ReactMixin],

  getDataBindings() {
    return {
      threads: Chat.getters.threads,
      unreadCount: Chat.getters.unreadCount,
      currentThreadID: Chat.getters.currentThreadID,
    }
  },

  render: function() {
    var threadListItems = this.state.threads.map(thread => {
      return (
        <ThreadListItem
          key={thread.get('threadID')}
          thread={thread}
          currentThreadID={this.state.currentThreadID}
        />
      );
    }, this);
    var unread =
      this.state.unreadCount === 0 ?
      null :
      <span>Unread threads: {this.state.unreadCount}</span>;
    return (
      <div className="thread-section">
        <div className="thread-count">
          {unread}
        </div>
        <ul className="thread-list">
          {threadListItems}
          </ul>
      </div>
    );
  },
});

module.exports = ThreadSection;
```

`flux.ReactMixin` handles all of the pub/sub between the flux system and component and will only render the component via a `setState` call whenever any of the subscribed getters' value changes.  The mixin will also automatically unsubscribe from observation when the component is unmounted.

##### `ThreadListItem.react.js`

```js
var React = require('react');
var Chat = require('../modules/chat');
var cx = require('react/lib/cx');

var ReactPropTypes = React.PropTypes;

var ThreadListItem = React.createClass({

  propTypes: {
    thread: ReactPropTypes.object,
    currentThreadID: ReactPropTypes.string
  },

  render: function() {
    var thread = this.props.thread;
    var lastMessage = thread.get('messages').last();
    var dateString = (new Date(lastMessage.get('timestamp'))).toLocaleTimeString()
    return (
      <li
        className={cx({
          'thread-list-item': true,
          'active': thread.get('threadID') === this.props.currentThreadID
        })}
        onClick={this._onClick}>
        <h5 className="thread-name">{thread.get('threadName')}</h5>
        <div className="thread-time">
          {dateString}
        </div>
        <div className="thread-last-message">
          {lastMessage.get('text')}
        </div>
      </li>
    );
  },

  _onClick: function() {
    var threadID = this.props.thread.get('threadID')
    if (this.props.currentThreadID !== threadID) {
      Chat.actions.clickThread(threadID);
    }
  }

});

module.exports = ThreadListItem;
```
