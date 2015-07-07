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

In this tutorial we'll create a Nuclear flux system to show a list of products and add them to a shopping cart.  Here's the plan:

1. Create a **Reactor**

2. Create **Actions** to fetch products from a server and to add a product to the shopping cart

3. Create a **ProductStore** and **ShoppingCartStore**

4. Create **Getters** to transform and compose our store data into a consumable format for the UI

5. Hook everything up to React

### A few things to do know before we start

1. Although the example code is written using ES6, this is totally optional.  NuclearJS fully supports ES5 out of the box.

2. Nuclear stores work best when using ImmutableJS data structures.  You will see `toImmutable` quite often, this is simply sugar
to convert plain JavaScript arrays into [`Immutable.List`](http://facebook.github.io/immutable-js/docs/#/List) and objects to
[`Immutable.Map`](http://facebook.github.io/immutable-js/docs/#/Map).  The use of `toImmutable` is optional, you are free to use
any ImmutableJS data structure with no penalty.


## Creating a `Reactor`

To get started, we'll create a Nuclear `Reactor`.  In Nuclear, the `Reactor` is the brains of the system and in some ways analogous
to the traditional Flux `dispatcher` (though it works differently under the hood and provides a few extra features, which we'll
cover later).

Generally you'll only have one reactor for your application, however they are instanceable for server-side rendering.

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
This is completely optional, but very useful for keeping tracking of dispatched actions and subsequest changes in state._

Now that we have our reactor, let's create some actions.

## Creating Actions

Actions (sometimes called action creators) are functions that you call to send data into the system. In Nuclear, any function that calls
`reactor.dispatch(actionType: string, payload: any)` is categorized as an action.

For our example, we'll start by creating an action to fetch products from a server and another action to add a product to the user's shopping cart.

In order to correctly reference actions throughout the system, we'll create an `actionTypes.js` file, which is simply a collection of constants.
We're using React's keyMirror utility to create the constants, but that's just a convenience — you can create action types in any way you'd like.
They're not even required to be in a separate file, though that's certainly recommended.

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

We've now created two actions that we can use to send data into the system.

`addToCart` is a simple, synchronous action that takes in a product and dispatches `"ADD_TO_CART"` with the product in the payload.

While synchronous actions are great, often you'll need to perform an asynchronous operation before dispatching an action. Nuclear
fully supports creating actions asynchronously, as we're doing in `fetchProducts`.  This is a common pattern you'll use as your application grows,
and Nuclear has no opinion on how you perform your operations: callbacks, Promises, Generators, ES7 async functions — they'll all work just fine!

If you'd like to jump ahead, you can read more about [async actions](./04-async-actions-and-optimistic-updates.html).

Now let's build a few stores.

## Creating Stores

In Flux, stores are used for managing application state, but they don't represent a single record of data like resource models do.

More than simply managing ORM-style objects, **stores manage the state for a particular domain within the application**.

Unlike many other Flux libraries, Nuclear stores hold no state. Instead, they provide a collection of functions that transform current state into new state.

Stores provide a `getInitialState` method, which returns the initial state value that a store will manage, and an `initialize` hook, which is used to define what
actions a store will respond to by attaching handlers.

Each attached handler takes in current state, transforms it according to the action and its payload,
then returns new state. Handlers have the following signature: `handler(currentState: any, payload: any)`. In Nucler, state can only be an ImmutableJS data type,
such as an `Immutable.Map` or an `Immutable.List`, or a JavaScript primitive.

Because stores in Nuclear don't hold state — they simply receive state, transform it, and return new state — there is no need to worry about stores knowing
about other stores. That means no confusing `store.waitsFor` and no cross-pollution of data.  In Nuclear, the sole responsibility of a store is to return a portion
of existing or transformed application state.  The responsibility of reading application state falls on **Getters**, which we'll cover later.

Let's continue by creating stores for managing products and the user's shopping cart. Create a `stores/ProductStore.js` file and a `stores/CartStore.js` file.


#### `stores/ProductStore.js`

```javascript
import { Store, toImmutable } from 'nuclear-js'
import { RECEIVE_PRODUCTS, ADD_TO_CART } from '../actionTypes'

// example product:
// {"id": 1, "title": "iPad 4 Mini", "price": 500.01, "inventory": 2, "image": "../common/assets/ipad-mini.png"}

export default Store({
  getInitialState() {
    return toImmutable({})
  },

  initialize() {
    this.on(RECEIVE_PRODUCTS, receiveProducts)
    this.on(ADD_TO_CART, decrementInventory)
  }
})

// All store handlers transform `(currentState, payload) => (newState)`

/**
 * Transforms an array of products to a map keyed by product.id, and merges it
 * with the current state.
 */
function receiveProducts(state, { products }) {
  let newProducts = toImmutable(products)
    .toMap()
    .mapKeys((k, v) => v.get('id'))
  return state.merge(newProducts)
}

/**
 * Decrements the inventory for a product by 1, unless that product has no more
 * inventory.
 */
function decrementInventory(state, { product }) {
  return state.update(product.id, product => {
    let currentInventory = product.get('inventory')
    let newInventory = currentInventory > 0 ? currentInventory - 1 : 0;
    return product.set('inventory', newInventory)
  })
}
```

#### `stores/CartStore.js`

```javascript
import { Store, toImmutable } from 'nuclear-js'
import { ADD_TO_CART } from '../actionTypes'

/**
 * CartStores holds the mapping of productId => quantity within itemQty
 * and also maintains rollback information for the checkout process
 */
export default Store({
  getInitialState() {
    return toImmutable({ itemQty: {} })
  },

  initialize() {
    this.on(ADD_TO_CART, addToCart)
  }
})

/**
 * Increments the quantity for an existing item by 1, or sets the quantity for
 * a new item to 1.
 */
function addToCart(state, { product }) {
  let id = product.id
  return (state.hasIn(['itemQty', id]))
    ? state.updateIn(['itemQty', id], quantity => quantity + 1)
    : state.setIn(['itemQty', id], 1)
}
```

### Registering our stores

Finally, we'll need to register our stores with the reactor we created at the very beginning.

Registering the store with a reactor does two things:

1. Passes every dispatched action to the store
2. Binds the state a store manages to the application state by the key used for registration

Let's register the stores inside of `main.js`.

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

The above stores can be now be accessed with the following keypaths: `['products']` and `['cart']`. We'll cover keypaths in the Getters section.

But first, a recap:

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

// by passing a keypath, `evaluate` will return a more granular piece of app state
reactor.evaluate(['cart'])
// result
Map {
  itemQty: Map {}
}
```

The application state is rather empty; each top level key is currently populated by its store's `getInitialState()` method.

Let's see what our application state looks like after we fetch some products.

```javascript
actions.fetchProducts()
```

After the products have been fetched, our app state looks like this:

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

Now let's add a product to our shopping cart using the `addToCart` action we created earlier:

```javascript
actions.addToCart({ id: 3 })
```

Notice that two things occurred:

1. There is an entry in the `itemQty` map
2. The inventory for **Charli XCX - Sucker CD** went from 5 to 4

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

Those two things happened, because our store handlers responded to the `addToCart` action and transformed the app state.

You might think that the information associated with our stores is pretty minimal. For example, the `CartStore` doesn't actually know anything about the product,
such as its title, price or images — all information that we'd need if we were to build a cart component. It only knows that there is a mapping between 3 and 1,
which refers to `<id> => <qty>`.

Minimal data management within our stores is in fact a good practice, because it helps encapsulate and minimize the scope of data management for a particular store.
Remember, each store is supposed to manages only a single particular domain. In the case of the `CartStore`, it only cares about item quantities, so it doesn't need
anything more than an item's id and its quantity count.

However, if stores are limited in scope, how can you read substantive data from the app state?

It's actually quite simple: **composition**.

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

// result
List [
  Map {
    product: Map { id: 3, title: "Charli XCX - Sucker CD", price: 19.99, inventory: 4, image: "../common/assets/sucker.png" },
    quantity: 1
  }
}
```

If you completely understand the above, that's great! If not, don't worry, this is probably the first **Getter** you've ever seen,
and just in time too!  The next section is all about getters, one of the most powerful abstractions in Nuclear.

#### [Next: Getters](./02-getters.html)

