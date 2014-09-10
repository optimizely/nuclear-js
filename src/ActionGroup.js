class ActionGroup {
  /**
   * @param {Flux} flux
   */
  constructor(flux) {
    this.flux = flux
  }

  dispatch(action) {
    this.flux.dispatchStream.write(action)
  }
}

module.exports = Store
