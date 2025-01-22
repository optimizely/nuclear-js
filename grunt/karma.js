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

  chrome: {
    frameworks: ['jasmine'],
    reporters: ['progress', 'html'],
    browsers: ['ChromeHeadless'], // Use ChromeHeadless instead of Chrome or PhantomJS
    customLaunchers: {
      HeadlessChrome: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu'], // Required for CI environments
      },
    },
    autoWatch: false,
    singleRun: true,
  },

  coverage: {
    frameworks: ['jasmine'],
    reporters: ['progress', 'coverage'],
    browsers: ['ChromeHeadless'],
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
