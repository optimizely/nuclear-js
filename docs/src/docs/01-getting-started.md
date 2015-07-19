---
title: "Getting Started"
section: "Guide"
---

# Getting Started

This guide will take you through the process of installing NuclearJS and familiarize you with the concepts that will allow you
to build Flux systems.

## Installation

```shell
npm install --save nuclear-js
```


## Overview

In this tutorial we'll create a NuclearJS flux system to show a list of products and add them to a shopping cart.  Here's the plan:

1. Create a **Reactor**

2. Create **Actions** to fetch products from a server and to add a product to the shopping cart

3. Create a **ProductStore** and **ShoppingCartStore**

4. Create **Getters** to transform and compose our store data into a consumable format for the UI

5. Hook everything up to React

### A few things to do know before we start

1. Although the example code is written using ES6, this is totally optional.  NuclearJS fully supports ES5 out of the box.

2. NuclearJS stores work best when using ImmutableJS data structures.  You will see `toImmutable` quite often, this is simply sugar
to convert plain JavaScript arrays into [`Immutable.List`](https://facebook.github.io/immutable-js/docs/#/List) and objects to
[`Immutable.Map`](https://facebook.github.io/immutable-js/docs/#/Map).  The use of `toImmutable` is optional, you are free to use
any ImmutableJS data structure with no penalty.


## Creating a `Reactor`

To get started, we'll create a NuclearJS `Reactor`.  In Nuclear, the `Reactor` is the brains of the system and in some ways analogous
to the traditional Flux `dispatcher` (though it works differently under the hood and provides a few extra features, which we'll
cover later).

Generally you'll only have one reactor for your application, however they are instance-able for server-side rendering.

The reactor has two main jobs:

1. It holds the entire application state in the form of an `Immutable.Map`
2. It dispatches actions to transform the application state

Let's begin by creating a `reactor.js` file.

#### `reactor.js`

```javascript
import { Reactor } from 'nuclear-js'

const reactor = new Reactor({
  debug: true
})

export default reactor
```

_* If you pass a `debug: true` option when instantiating a reactor, you'll get great debugging tools that print to your browser console.
This is completely optional, but very useful for keeping tracking of dispatched actions and subsequent changes in state._

Now that we have our reactor, let's create some actions.

#### [Next: Creating Actions](./02-creating-actions.html)
