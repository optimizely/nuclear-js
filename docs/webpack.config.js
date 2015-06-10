var path = require('path')

module.exports = {
  entry: {
    'app': './src/main.js',
  },

  output: {
    path: './',
    filename: "[name].js",
  },

  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'},
      { test: /\.jsx$/, loader: 'babel-loader'},
    ]
  },
}
