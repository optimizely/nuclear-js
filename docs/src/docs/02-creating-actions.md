---
title: "Creating Actions"
section: "Guide"
---

# Creating Actions

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
and NuclearJS has no opinion on how you perform your operations: callbacks, Promises, Generators, ES7 async functions — they'll all work just fine!

If you'd like to jump ahead, you can read more about [async actions](./06-async-actions-and-optimistic-updates.html).

Now let's build a few stores.

#### [Next: Creating Stores](./03-creating-stores.html)
