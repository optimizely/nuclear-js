var { Immutable } = require('nuclear-js')
var User = require('../user')

exports.formExists = function(formId) {
  return [
    ['form', formId],
    formEntry => !!formEntry
  ]
}

exports.initialValues = function(formId) {
  return ['form', formId, 'initialValues']
}

exports.currentValues = function(formId) {
  return ['form', formId, 'currentValues']
}

exports.isDirty = function(formId) {
  return [
    exports.initialValues(formId),
    exports.currentValues(formId),
    (initial, current) => !Immutable.is(initial, current)
  ]
}

exports.dirtyFields = function(formId) {
  return [
    exports.initialValues(formId),
    exports.currentValues(formId),
    (initial, current) => {
      debugger;
      if (!initial || !current) {
        return Immutable.Map()
      }
      return initial
        .map((val, key) => val !== current.get(key))
    }
  ]
}

