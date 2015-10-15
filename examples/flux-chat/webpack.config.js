var path = require('path')

module.exports = {
  entry: {
    'bundle': './js/main.js',
  },

  output: {
    path: './',
    filename: '[name].js',
  },

  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'},
      // required for react jsx
      { test: /\.react.js$/, loader: 'jsx-loader' },
    ],
  },

  resolve: {
    alias: {
      'nuclear-js': path.join(__dirname, '../../dist/nuclear.js'),
    },
  },
}
