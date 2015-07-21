---
title: "Hooking up to React"
section: "Guide"
---

# Hooking up to React

### Binding application state to components

Every NuclearJS Reactor comes with `reactor.ReactMixin` to easily create an always-in-sync binding between any KeyPath or Getter value
and a React component's state.

The ability to observe any piece of composite data is immensely powerful and trivializes a lot of what other frameworks work hard to solve.

To use simply include the `reactor.ReactMixin` and implement the `getDataBindings()` function that returns an object of state properties
to `KeyPath` or `Getter`.  NuclearJS will take care of the initial sync, observation and destroying the subscription when on `componentWillUnmount`.

**First let's expand our main file to initiate the fetch for products.**

#### `main.js`

```javascript
import React from 'react'

import App from './components/App'
import reactor from './reactor'
import actions from './actions'
import CartStore from './stores/CartStore'
import ProductStore from './stores/ProductStore'

reactor.registerStores({
  cart: CartStore,
  products: ProductStore,
})

actions.fetchProducts()

React.render(
  React.createElement(App, null),
  document.getElementById('flux-app')
)
```

#### `components/App.jsx`

```javascript
import React from 'react'
import CartContainer from './CartContainer'
import ProductsContainer from './ProductsContainer'

export default React.createClass({
  render() {
    return (
      <div>
        <ProductsContainer />
        <CartContainer />
      </div>
    )
  }
})
```

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
    // we will implement this in the next section
  },

  render: function () {
    return (
      <Cart products={this.state.products.toJS()} total={this.state.total} onCheckoutClicked={this.onCheckoutClicked} />
    )
  },
})
```

#### `components/ProductsContainer.jsx`

```javascript
import React from 'react'

import ProductItem from '../../common/components/ProductItem'
import ProductsList from '../../common/components/ProductsList'

import reactor from '../reactor'
import getters from '../getters'
import actions from '../actions'


const ProductItemContainer = React.createClass({
  onAddToCartClicked() {
    actions.addToCart(this.props.product)
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
        }).toList()}
      </ProductsList>
    )
  },
})
```

## Recap

Once you have a functioning NuclearJS Reactor, hooking it up to a React application is very easy using the `reactor.ReactMixin` + `getDataBindings()` method.

NuclearJS will automatically sync the value of a getter to your component via `this.setState` whenever the underlying getter value changes.  Meaning you never
have to explicitly call `this.setState` to re-render a component.

In the next section we will cover hooking up actions to our react components.

#### [Next: Async Actions and Optimistic Updates](./06-async-actions-and-optimistic-updates.html)


