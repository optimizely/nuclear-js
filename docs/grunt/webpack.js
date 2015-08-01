var webpack = require('webpack')

module.exports = {
  options: {
    entry: {
      'app': './src/main.js',
    },

    output: {
      path: './dist',
      filename: 'app.js',
    },

    module: {
      loaders: [
        { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'},
        { test: /\.jsx$/, loader: 'babel-loader'},
      ],
    },
  },

  dev: {
    watch: true,
    // keepalive: true,
  },

  prod: {
    watch: false,
    plugins: [
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          conditionals: false,
          warnings: false,
        },
        sourceMap: false,
      }),
    ],
  },
}
