import { Store, toImmutable } from 'nuclear-js'
import {
  CHECKOUT_START,
  CHECKOUT_SUCCESS,
  CHECKOUT_FAILED,
  ADD_TO_CART,
} from '../actionTypes'

const initialState = toImmutable({
  itemQty: {},
  pendingCheckout: {}
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
  const currentItems = state.get('itemQty')

  return state
  .set('itemQty', toImmutable({}))
  .set('pendingCheckout', currentItems)
}

function finishCheckout(state) {
  return initialState
}

function rollback(state) {
  return state
  .set('itemQty', state.get('pendingCheckout'))
  .set('pendingCheckout', toImmutable({}))
}
