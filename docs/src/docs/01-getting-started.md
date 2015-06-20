---
title: "Getting Started"
section: "Getting Started"
---

# Getting Started

This guide will take you through the process of install NuclearJS and familiarize you with the concepts found in Nuclear to build Flux systems.

## Installation

```shell
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

In NuclearJS the `Reactor` is the brains of the system.  Generally you will only have one reactor for your application, however they are instanceable
for server-side rendering.

The reactor holds the application state in the form of an `Immutable.Map`, while dispatching actions transform the application state.

#### `reactor.js`

```javascript
import { Reactor } from 'nuclear-js'

const reactor = new Reactor({
  debug: true
})

export default reactor
```

## Actions

Actions are categorized as any function that calls `reactor.dispatch(actionType, payload)`.

For our example we will start by creating actions to fetch products from a server and to add a product to the users shopping cart.

#### `actionTypes.js`

```javascript
import keyMirror from 'react/lib/keyMirror'

export default keyMirror({
    RECEIVE_PRODUCTS: null,
    ADD_TO_CART: null,
    CHECKOUT_START: null,
    CHECKOUT_SUCCESS: null,
    CHECKOUT_FAILED: null,
})
```

#### `actions.js`

```javascript
import shop from '../../common/api/shop'
import reactor from './reactor'
import {
    RECEIVE_PRODUCTS,
    ADD_TO_CART,
    CHECKOUT_START,
    CHECKOUT_SUCCESS,
    CHECKOUT_FAILED,
} from './action-types'

export default {
  fetchProducts() {
    shop.getProducts(products => {
      reactor.dispatch(RECEIVE_PRODUCTS, { products })
    });
  },

  addToCart(product) {
    reactor.dispatch(ADD_TO_CART, { product })
  },
}
```


## Creating Stores

Stores hold no state, instead they provide a collection of functions that transform current state into new state.  They provide an `initialize` hook used when
register with a reactor to define what actions they respond to.

Each store handler transforms `(currentState, payload) => (newState)`

#### `stores/ProductStore.js`

```javascript
import { Store, toImmutable } from 'nuclear-js'
import { RECEIVE_PRODUCTS, ADD_TO_CART } from '../action-types'

export default Store({
  getInitialState() {
    return toImmutable({})
  },

  initialize() {
    this.on(RECEIVE_PRODUCTS, receiveProducts)
    this.on(ADD_TO_CART, decrementInventory)
  }
})

function receiveProducts(state, { products }) {
  // transform an array of products to a map keyed by product.id
  let newProducts = toImmutable(products)
    .toMap()
    .mapKeys((k, v) => v.get('id'))
  return state.merge(newProducts)
}

function decrementInventory(state, { product }) {
  return state.update(product.id, product => {
    let currentInventory = product.get('inventory')
    let newInventory = (currentInventory > 0) ? currentInventory - 1 : 0;
    return product.set('inventory', newInventory)
  })
}
```


