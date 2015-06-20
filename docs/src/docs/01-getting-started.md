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

In this tutorial we will create a Nuclear flux system to show a list of products and add them to a shopping cart.  Here's the plan:

1. Create a **Reactor**

2. Create **actions** to fetch products from a server and to add a product to the shopping cart

3. Create a **ProductStore** and **ShoppingCartStore**

4. Create **getters** to transform and compose our store data into a consumable format for the UI

5. Hook everything up to React

### A few things to do know before we start

1. Although the example code is written using ES6, this is totally optional.  NuclearJS fully supports ES5 out of the box 

2. Nuclear stores work best when using ImmutableJS data structures.  You will see `toImmutable` quite often, this is simply sugar
to convert plain javascript arrays into [`Immutable.List`](http://facebook.github.io/immutable-js/docs/#/List) and objects to
[`Immutable.Map`](http://facebook.github.io/immutable-js/docs/#/Map).  The use of `toImmutable` is optional, you are free to use
any ImmutableJS data structure with no penalty.


## Creating a `Reactor`

In Nuclear the `Reactor` is the brains of the system.  Generally you will only have one reactor for your application, however they are instanceable
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
} from './actionTypes'

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

In Nuclear there is no need to worry about stores knowing about other stores or `store.waitsFor`.  The sole responsibility of stores is to write or mutate application
state, the responsibility of reading application state falls on Getters.


#### `stores/ProductStore.js`

```javascript
import { Store, toImmutable } from 'nuclear-js'
import { RECEIVE_PRODUCTS, ADD_TO_CART } from '../action-types'

// example product:
// {{"id": 1, "title": "iPad 4 Mini", "price": 500.01, "inventory": 2, "image": "../common/assets/ipad-mini.png"},"id": 1, "title": "iPad 4 Mini", "price": 500.01, "inventory": 2, "image": "../common/assets/ipad-mini.png"},

export default Store({
  getInitialState() {
    return toImmutable({})
  },

  initialize() {
    this.on(RECEIVE_PRODUCTS, receiveProducts)
    this.on(ADD_TO_CART, decrementInventory)
  }
})

// store handlers transforms `(currentState, payload) => (newState)`
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

#### `stores/CartStore.js`

```javascript
import { Store, toImmutable } from 'nuclear-js'
import { ADD_TO_CART } from '../actionTypes'

const initialState = toImmutable({
  // mapping of product.id to quantity
  itemQty: {},
})

/**
 * CartStores holds the mapping of productId => quantity
 * and also maintains rollback information for the checkout process
 */
export default Store({
  getInitialState() {
    return initialState
  },

  initialize() {
    this.on(ADD_TO_CART, addToCart)
  }
})

function addToCart(state, { product }) {
  let id = product.id
  return (state.hasIn(['itemQty', id]))
    ? state.updateIn(['itemQty', id], quantity => quantity + 1)
    : state.setIn(['itemQty', id], 1)
}
```

### Registering our stores

Registering the store with a reactor does two things:

1. Passes every dispatched action to the store
2. Binds a stores state to the application state by the key used for registration

#### `main.js`

```javascript
import reactor from './reactor'
import ProductStore from './stores/ProductStore'
import CartStore from './stores/CartStore'

reactor.registerStores({
  'products': ProductStore,
  'cart': CartStore,
})
```


## Getters

Notice that the above `CartStore` does keeping track of entire items, only the id and quantity.  

Nuclear allows us to use the `ProductStore` as the singular source of truth for products by composing the the `ProductStore` and `CartStore` with **Getters**.  This also eliminates any issues with state
becoming out of sync between stores.

Getters can take 2 forms:

1. A KeyPath - such as `['products']` or `['cart', 'itemQty']` which the latter equates to a `state.getIn(['cart', 'itemQty'])` on the app state `Immutable.Map`.

2. A Getter of the form:
  ```javascript
  [[KeyPath | Getter], [KeyPath | Getter], ..., tranformFunction]
  ```

#### `getters.js`

```javascript
// it is idiomatic to facade all data access through getters, that way a component only has to subscribe to a getter making it agnostic
// to the underlying stores / data transformation that is taking place
const products = ['products']

const cartProducts = [
  ['products'],
  ['cart', 'productQuantities'],
  (products, quantities) => {
    return quantities.map((quantity, productId) => {
      let product = products.get(productId)
      return product
        .set('quantity', quantity)
        .remove('inventory') // inventory shouldnt be known in cart
    })
  }
]

const cartTotal = [
  cartProducts,
  (items) => {
    const total = items.reduce((total, item) => {
      return total + (item.get('quantity') * item.get('price'))
    }, 0) || 0
    return total.toFixed(2)
  }
]

export default { products, cartProducts, cartTotal }
```

## Putting it all together

First lets expand our main file to initiate the fetch for products.

#### `main.js`

```javascript
import reactor from './reactor'
import actions from './actions'
import ProductStore from './stores/ProductStore'
import CartStore from './stores/CartStore'

reactor.registerStores({
  'products': ProductStore,
  'cart': CartStore,
})

actions.fetchProducts()
```

#### `components/App.jsx`

```javascript
import React from 'react'
import CartContainer from './CartContainer.jsx'
import ProductsContainer from './ProductsContainer.jsx'

export default React.createClass({
  render() {
    return (
      <div>
        <ProductsContainer />
        <CartContainer />
      </div>
    )
  }
});
```

#### `components/CartContainer.jsx`

```javascript
import React from 'react'

import Cart from '../../../common/components/Cart.jsx'
import reactor from '../reactor'
import getters from '../getters'
import actions from '../actions'

export default React.createClass({
  mixins: [reactor.ReactMixin],

  getDataBindings() {
    return {
      products: getters.cartProducts,
      total: getters.cartTotal,
    }
  },

  onCheckoutClicked: function () {
    // we will fill this in a bit later
    if (!this.state.products.length) {
      return;
    }
  },

  render: function () {
    return (
      <Cart products={this.state.products} total={this.state.total} onCheckoutClicked={this.onCheckoutClicked} />
    )
  },
})
```


