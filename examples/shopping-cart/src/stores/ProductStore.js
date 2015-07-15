import { Store, toImmutable } from 'nuclear-js'
import { RECEIVE_PRODUCTS, ADD_TO_CART } from '../actionTypes'

export default Store({
  getInitialState() {
    return toImmutable({})
  },

  initialize() {
    this.on(RECEIVE_PRODUCTS, receiveProducts)
    this.on(ADD_TO_CART, decrementInventory)
  }
})

function receiveProducts(state, { products }) {
  let newProducts = toImmutable(products)
    .toMap()
    .mapKeys((k, v) => v.get('id'))
  return state.merge(newProducts)
}

function decrementInventory(state, { product }) {
  return state.update(product.id, product => {
    const currentInventory = product.get('inventory')
    const newInventory = (currentInventory > 0) ? currentInventory - 1 : 0;
    return product.set('inventory', newInventory)
  })
}

