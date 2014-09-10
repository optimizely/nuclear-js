var jstransform = require('jstransform');
var _ = require('underscore');

var visitors = _.flatten([
  require('jstransform/visitors/es6-arrow-function-visitors').visitorList,
  require('jstransform/visitors/es6-class-visitors').visitorList,
  require('jstransform/visitors/es6-object-concise-method-visitors').visitorList,
  require('jstransform/visitors/es6-rest-param-visitors').visitorList,
]);

module.exports = function(sourceText) {
  return jstransform.transform(
    visitors,
    sourceText
  ).code;
}
