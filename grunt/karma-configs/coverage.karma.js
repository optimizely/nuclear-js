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

    reporters: ['progress', 'coverage'],

    preprocessors: {
      'tests/*-tests.js': ['webpack'],
    },

    coverageReporter: {
      reporters: [
        { type: "html", dir: "coverage/" },
        { type: "lcov", dir: "coverage/" },
        { type: "text-summary" },
      ]
    },

    webpack: {
      module: {
        loaders: [
          { test: /\.js$/, loader: 'jstransform-loader' },
        ],
        postLoaders: [
          {
            test: /\.js$/,
            exclude: /(node_modules\/|-tests\.js$)/,
            loader: 'istanbul-instrumenter'
          }
        ]
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
    autoWatch: false,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,
  })
}
