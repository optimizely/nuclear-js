var Writable = require('stream').Writable;

class DispatchStream extends Writable {
  /**
   * @param {Flux} flux
   */
  constructor(flux) {
    this.flux = flux

    super()
  }

  _write(action) {
    this.flux.dispatch(action)
  }
}

module.exports = DispatchStream
