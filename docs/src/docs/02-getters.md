---
title: "Getters"
section: "Guide"
---

# Getters

In the [previous section](./01-getting-started.html) we created stores and actions for our shopping application. At the very end we introduced the concept of getters.
This section will explain the details behind getters and how they can used, combined and observed to build a rich user interface.

### Definition

Getters can take 2 forms:

1. A KeyPath - such as `['products']` or `['cart', 'itemQty']` which the latter equates to a `state.getIn(['cart', 'itemQty'])` on the app state `Immutable.Map`.

2. An array of Getters or KeyPaths and a combine function.
  ```javascript
  [[KeyPath | Getter], [KeyPath | Getter], ..., combineFunction]
  ```

## Back to our example

Recall our application state looks something like after we've fetched the products and the user added something to their cart':

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

If you recall, the `CartStore` does keeping track of entire items, only the id and quantity.  

Nuclear allows us to use the `ProductStore` as the singular source of truth for products by composing the the `ProductStore` and `CartStore` with **Getters**.  This also eliminates any issues with state
becoming out of sync between stores.


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

### Binding application state to components

Every Nuclear Reactor comes with `reactor.ReactMixin` to easily create an alway-in-sync binding between any KeyPath or Getter value
and a React component's state.

The ability to observe any piece of composite data is immensely powerful and trivializes a lot of what other frameworks work hard to solve.

To use simply include the `reactor.ReactMixin` and implement the `getDataBindings()` function that returns an object of state properties
to `KeyPath` or `Getter`.  Nuclear will take care of the initial sync, observation and destroying the subscription when on `componentWillUnmount`.

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

#### `components/ProductsContainer.jsx`

```javascript
import React from 'react'

import ProductItem from '../../../common/components/ProductItem.jsx'
import ProductsList from '../../../common/components/ProductsList.jsx'

import reactor from '../reactor'
import getters from '../getters'
import actions from '../actions'

const ProductItemContainer = React.createClass({
  onAddToCartClicked() {
    // we will implement this in the next section
  },

  render() {
    return (
      <ProductItem product={this.props.product} onAddToCartClicked={this.onAddToCartClicked} />
    )
  }
})

export default React.createClass({
  mixins: [reactor.ReactMixin],

  getDataBindings() {
    return {
      products: getters.products,
    }
  },

  render: function () {
    return (
      <ProductsList title="Flux Shop Demo (NuclearJS)">
        {this.state.products.map(product => {
          return <ProductItemContainer key={product.get('id')} product={product.toJS()} />
        })}
      </ProductsList>
    )
  },
})
```

## Final thoughts

There you have it, we've created a fully functioning Nuclear Reactor to manage our application's state.  By this point the power of
NuclearJS should be apparent.

So go start building something, or if you want to see more examples checkout the next section [Async Actions and Optimistic Updates](./docs/02-optimistic-updates.html).

