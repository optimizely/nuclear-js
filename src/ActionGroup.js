/**
 * Base class for action groups to extend to get referenced
 * with the injected flux instance
 */
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
