var path = require('path')
var webpack = require('webpack')

module.exports = {
  entry: {
    'app': './src/main.js',
  },

  output: {
    path: './',
    filename: '[name].js',
  },

  resolve: {
    root: [
      // when requiring a non-relative path resolve to optly directory first then node_modules
      path.resolve(__dirname, './src'),
      path.resolve(__dirname, './node_modules'),
    ],
  },

  module: {
    loaders: [
      { test: /\.js|\.jsx$/, exclude: /node_modules/, loader: 'babel-loader'},
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      __DEV__: true,
    }),
  ],
}
