'use strict';

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
    );
  }
});
