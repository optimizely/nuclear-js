var sauce = require('./sauce')
var path = require('path')

module.exports = {
  options: {
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: path.join(__dirname, '../'),
    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'tests/*-tests.js',
    ],

    reporters: ['progress'],

    preprocessors: {
      'tests/*-tests.js': ['webpack'],
    },

    webpack: {
      module: {
        loaders: [
          { test: /\.js$/, loader: 'babel-loader' },
        ],
      },
    },

    port: 9876,

    logLevel: 'error',

    colors: true,

    autoWatch: false,

    singleRun: true,

    client: {
      captureConsole: false,
    },
  },

  phantom: {
    frameworks: ['jasmine', 'es5-shim'],
    browsers: ['PhantomJS'],
  },

  chrome: {
    reporters: ['html'],
    browsers: ['Chrome'],
    autoWatch: true,
    singleRun: false,
  },

  coverage: {
    frameworks: ['jasmine', 'es5-shim'],
    reporters: ['progress', 'coverage'],
    browsers: ['PhantomJS'],
    coverageReporter: {
      reporters: [
        { type: 'html', dir: 'coverage/' },
        { type: 'lcov', dir: 'coverage/' },
        { type: 'text-summary' },
      ],
    },

    webpack: {
      module: {
        loaders: [
          { test: /\.js$/, loader: 'babel-loader' },
        ],
        postLoaders: [
          {
            test: /\.js$/,
            exclude: /(node_modules\/|-tests\.js$)/,
            loader: 'istanbul-instrumenter',
          },
        ],
      },
    },
  },

  sauce_modern: {
    options: sauce.modern,
  },

  sauce_ie: {
    options: sauce.ie,
  },

  sauce_mobile: {
    options: sauce.mobile,
  },
}
