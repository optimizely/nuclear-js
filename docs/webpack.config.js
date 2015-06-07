var path = require('path')

module.exports = {
  entry: {
    'app': './js/main.js',
  },

  output: {
    path: './',
    filename: "[name].js",
  },

  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'},
    ]
  },

  resolve: {
    alias: {
      'nuclear-js': path.join(__dirname, '../dist/nuclear.js'),
    },
  },
}
