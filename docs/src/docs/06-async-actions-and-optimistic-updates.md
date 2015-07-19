---
title: "Async Actions and Optimistic Updates"
section: "Guide"
---

# Async Actions and Optimistic Updates

When creating async actions there are generally three action types that we need

1. **`<ACTION>_STARTED`** represents the action happening client side but has not been verified by the server.  When doing optimistic updates
stores can respond to this action type as if the transaction will be successful, while maintaining enough state to rollback if it eventually fails.

2. **`<ACTION>_SUCCESS`** happens after the server has verified that the optimistic update is valid, at this point stores can discard rollback information without worry.

3. **`<ACTION>_FAILED`** the server has rejected the update and stores need to rollback.

### Implementing an optimistic `cartCheckout()` action

The first step is to track checkout rollback information in the **CartStore**

#### `stores/CartStore.js`

```javascript
import { Store, toImmutable } from 'nuclear-js'
import {
  CHECKOUT_START,
  CHECKOUT_SUCCESS,
  CHECKOUT_FAILED,
  ADD_TO_CART,
} from '../action-types'

const initialState = toImmutable({
  itemQty: {},
  pendingCheckout: {},
})

/**
 * CartStore holds the mapping of productId => quantity
 * and also maintains rollback information for the checkout process
 */
export default Store({
  getInitialState() {
    return initialState
  },

  initialize() {
    this.on(CHECKOUT_START, beginCheckout)
    this.on(CHECKOUT_SUCCESS, finishCheckout)
    this.on(CHECKOUT_FAILED, rollback)
    this.on(ADD_TO_CART, addToCart)
  }
})

function addToCart(state, { product }) {
  return (state.hasIn(['itemQty', product.id]))
    ? state.updateIn(['itemQty', product.id], quantity => quantity + 1)
    : state.setIn(['itemQty', product.id], 1)
}

function beginCheckout(state) {
  // snapshot the current itemQty map for a potential rollback
  const currentItems = state.get('itemQty')

  return state
    .set('itemQty', toImmutable({}))
    .set('pendingCheckout', currentItems)
}

function finishCheckout(state) {
  // on success revert CartStore to its initial state
  // discarding now unneeded rollback state
  return initialState
}

function rollback(state) {
  // in the case of rollback restore the cart contents
  // and discard rollback information
  return state
    .set('itemQty', state.get('pendingCheckout'))
    .set('pendingCheckout', toImmutable({}))
}
```

### Now lets create the `cartCheckout` action

#### `actions.js`

```javascript
import shop from '../../common/api/shop'
import reactor from './reactor'
import getters from './getters'
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

  cartCheckout() {
    let productsInCart = reactor.evaluateToJS(getters.cartProducts)

    reactor.dispatch(CHECKOUT_START)

    shop.buyProducts(productsInCart, () => {
      console.log("YOU BOUGHT: ", productsInCart)

      reactor.dispatch(CHECKOUT_SUCCESS)
    });
  },
}
```

### Hooking it up to the CartContainer component

#### `components/CartContainer.jsx`

```javascript
import React from 'react'

import Cart from '../../common/components/Cart'
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
    actions.cartCheckout()
  },

  render: function () {
    return (
      <Cart products={this.state.products.toJS()} total={this.state.total} onCheckoutClicked={this.onCheckoutClicked} />
    )
  },
})
```

## Further Reading

This ends our getting started example, for a more in depth look all of the above example code lives [here](https://github.com/optimizely/nuclear-js/tree/master/examples/shopping-cart).

For additional documentation and resources checkout the following:

- [API Documentation](./07-api.html)
- [Flux Chat Example](https://github.com/optimizely/nuclear-js/tree/master/examples/flux-chat) - A classic Facebook flux chat example written in NuclearJS.
- [Rest API Example](https://github.com/optimizely/nuclear-js/tree/master/examples/rest-api) - Shows how to deal with fetching data from an API using NuclearJS conventions.

More coming soon...
