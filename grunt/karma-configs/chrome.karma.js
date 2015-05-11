var path = require('path');

module.exports = function(config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: path.join(__dirname, '../../'),

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'es5-shim'],

    // list of files / patterns to load in the browser
    files: [
      'tests/*-tests.js',
    ],

    // list of files to exclude
    exclude: [],

    reporters: ['html'],

    preprocessors: {
      'tests/*-tests.js': ['webpack'],
    },

    webpack: {
      module: {
        loaders: [
          { test: /\.js$/, loader: 'jstransform-loader' },
        ],
      },
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_ERROR,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,
  })
}
