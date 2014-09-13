var Flux = require('../src/Flux')
var EntityStore = require('./stores/EntityStore')
var CurrentProjectStore = require('./stores/CurrentProjectStore')

var instance = new Flux()

instance.registerStore('Entity', EntityStore)
instance.registerStore('CurrentProject', CurrentProjectStore)
