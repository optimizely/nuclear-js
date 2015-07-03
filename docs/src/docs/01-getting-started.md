---
title: "Getting Started"
section: "Guide"
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
registering with a reactor to define what actions they respond to.

In Nuclear there is no need to worry about stores knowing about other stores or `store.waitsFor`.  The sole responsibility of stores is to write or mutate application
state, and the responsibility of reading application state falls on Getters.


#### `stores/ProductStore.js`

```javascript
import { Store, toImmutable } from 'nuclear-js'
import { RECEIVE_PRODUCTS, ADD_TO_CART } from '../actionTypes'

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

// store handlers transform `(currentState, payload) => (newState)`
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
2. Binds a store's state to the application state by the key used for registration

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

## Recap

At this point we've created actions for fetching products and adding an item to the cart.  We also have the `ProductStore` and `CartStore` registered on the reactor.

Let's see what our application state looks like by using the `reactor.evaluate` function:

```javascript
// providing an empty array to `evaluate` will return a snapshot of the entire app state
reactor.evaluate([])
// result
Map {
  cart: Map {
    itemQty: Map {}
  },
  products: Map {}
}

reactor.evaluate(['cart'])
// result
Map {
  itemQty: Map {}
}
```

The application state is rather empty, each top level key is populated by the store's `getInitialState()` method.

Let's see what our application state looks like after we fetch some products.

```javascript
actions.fetchProducts()
```

After the products have been fetched:

```javascript
Map {
  cart: Map {
    itemQty: Map {}
  },
  products: Map {
    1: Map { id: 1, title: "iPad 4 Mini", price: 500.01, inventory: 2, image: "../common/assets/ipad-mini.png" },
    2: Map { id: 2, title: "H&M T-Shirt White", price: 10.99, inventory: 10, image: "../common/assets/t-shirt.png" },
    3: Map { id: 3, title: "Charli XCX - Sucker CD", price: 19.99, inventory: 5, image: "../common/assets/sucker.png" }
  }
}
```

Now let's add a product to our shopping cart:

```javascript
actions.addToCart({ id: 3 })
```

Notice there is an entry in the `itemQty` map as well as the inventory for **Charli XCX - Sucker CD** went from 5 to 4.

```javascript
Map {
  cart: Map {
    itemQty: Map {
      3: 1
    }
  },
  products: Map {
    1: Map { id: 1, title: "iPad 4 Mini", price: 500.01, inventory: 2, image: "../common/assets/ipad-mini.png" },
    2: Map { id: 2, title: "H&M T-Shirt White", price: 10.99, inventory: 10, image: "../common/assets/t-shirt.png" },
    3: Map { id: 3, title: "Charli XCX - Sucker CD", price: 19.99, inventory: 4, image: "../common/assets/sucker.png" }
  }
}
```

The information in our stores are pretty minimal, the cart store doesn't actually know anything about the product, like its title, price or images -
all information that we would need if we were to build a cart component.

Nuclear allows you to combine data from stores in a non-destructive manner, check it out:

```javascript
reactor.evaluate([
  ['cart', 'itemQty'],
  ['products'],
  (itemQty, products) => {
    return itemQty.map((qty, itemId) => {
      return toImmutable({
        product: products.get(itemId),
        quantity: qty
      })
    }).toList()
  }
])
```

```javascript
List [
  Map {
    product: Map { id: 3, title: "Charli XCX - Sucker CD", price: 19.99, inventory: 4, image: "../common/assets/sucker.png" },
    quantity: 1,
  }
}
```

You've just seen your first **Getter**, and just in time too!  The next section is all about getters, one of the most powerful abstractions in Nuclear.

#### [Next: Getters](./02-getters.html)

