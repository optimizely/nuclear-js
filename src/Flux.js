var DispatchStream = require('./DispatchStream');

class Flux {
  constructor() {
    this.stores = {}
    this.actionGroups = {}
    this.dispatchStream = new DispatchStream(this)
  }

  registerStore(id, store) {
    this.stores[id] = store
  }

  registerActionGroup(id, actionGroup) {
    this.actionGroups[id] = actionGroup
  }
}

module.exports = Flux
