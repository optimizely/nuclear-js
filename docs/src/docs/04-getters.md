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

Recall our application state looks something like this after we've fetched the products and the user added something to their cart:

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

Let's create getters for:

1. All products with their inventories
2. Products in the shopping cart and the quantity
3. The total of all products in the shopping cart

#### `getters.js`

```javascript
// it is idiomatic to facade all data access through getters, that way a component only has to subscribe to a getter making it agnostic
// to the underlying stores and data transformation that is taking place
const products = ['products']

const cartProducts = [
  ['products'],
  ['cart', 'itemQty'],
  (products, itemQty) => {
    return itemQty.map((quantity, productId) => {
      var product = products.get(productId)
      return product
        .set('quantity', quantity)
        .remove('inventory') // inventory shouldn't be known in cart
    }).toList()
  }
]

const cartTotal = [
  cartProducts,
  (items) => {
    const total = items.reduce((total, item) => {
      return total + (item.get('quantity')* item.get('price'))
    }, 0) || 0
    return total.toFixed(2)
  }
]

export default { products, cartProducts, cartTotal }
```

Here's what our getters evaluate to:

```javascript
import reactor from './reactor'
import getters from './getters'

reactor.evaluate(getters.products);
// result
Map {
  1: Map { id: 1, title: "iPad 4 Mini", price: 500.01, inventory: 2, image: "common/assets/ipad-mini.png" },
  2: Map { id: 2, title: "H&M T-Shirt White", price: 10.99, inventory: 10, image: "common/assets/t-shirt.png" },
  3: Map { id: 3, title: "Charli XCX - Sucker CD", price: 19.99, inventory: 4, image: "common/assets/sucker.png" }
}

reactor.evaluate(getters.cartProducts);
// result
List [
  Map { id: 3, title: "Charli XCX - Sucker CD", price: 19.99, quantity: 1, image: "common/assets/sucker.png" }
]

reactor.evaluate(getters.cartTotal);
// result
19.99
```

## Recap

Getters provide an incredibly powerful mechanism to both evaluate and observe any piece of application state or
composite state.  Behind getters is a powerful caching mechanism that memoizes computation, and will only reevaluate
when the underlying dependencies change.

In the next section we will take this full circle and hook up our application state to components.

#### [Next: Hooking up to React](./05-hooking-up-to-react.html)
