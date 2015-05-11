module.exports = {
  // single run
  phantom: {
    configFile: 'grunt/karma-configs/phantom.karma.js',
  },

  chrome: {
    configFile: 'grunt/karma-configs/chrome.karma.js',
  },

  coverage: {
    configFile: 'grunt/karma-configs/coverage.karma.js',
  },
};
