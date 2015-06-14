---
title: "Getting Started"
section: "Getting Started"
---

# Getting Started

This guide will take you through the process of install NuclearJS and familiarize you with the concepts found in Nuclear to build Flux systems.

## Installation

```sh
npm install --save nuclear-js
```



## Overview

In this tutorial we will create a Nuclear flux system to show a list of products and add them to a shopping cart.

Here's the plan:

1. Create a **Reactor**

2. Create **actions** to fetch products from a server and to add a product to the shopping cart

3. Create a **ProductStore** and **ShoppingCartStore**

4. Create **getters** to transform and compose our store data into a consumable format for the UI

5. Hook everything up to React


**Note:** although the example code is written using ES6, this is totally optional.  NuclearJS fully supports ES5 out of the box 


## Creating a `Reactor`

In NuclearJS the `Reactor` is the brains of the system.  Each reactor is an instance, and generally you will only have one even in the largest of systems.
The reactor holds the application state in the form of an `Immutable.Map`.  We will touch more on this later once we create stores.

#### `reactor.js`

```js
import { Reactor } from 'nuclear-js'

const reactor = new Reactor({
  debug: true
})

export default reactor
```

## ProductStore and ShoppingCartStore

Stores in NuclearJS are a bit different than most Flux implementations.  One, stores are stateless and aren't referencible, instead all interaction goes through the reactor.  Second all action handlers within
a store are pure functions that transform the `(currentState, action) => (newState)`.

This may sound like a strange departure, but check out the examples and keep an open mind, in the end it turns out to be a much cleaner data model.
