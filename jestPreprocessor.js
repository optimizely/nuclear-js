var es5ify = require('./es5ify');

exports.process = function(sourceText, sourcePath) {
  return es5ify(sourceText);
};
