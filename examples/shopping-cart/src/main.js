'use strict';

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
);
