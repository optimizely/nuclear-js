if (typeof process.env.NODE_ENV === 'undefined') {
  process.env.NODE_ENV = 'development'
}

var webpack = require('webpack')
var pluginsConfig = [
  new webpack.NoErrorsPlugin(),
  new webpack.DefinePlugin({
    'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
    },
  }),
]

module.exports = [{
  // build client
  entry: './client.js',

  output: {
    path: './',
    filename: 'client.bundle.js',
  },

  plugins: pluginsConfig,

  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
    }, {
      test: /\.css$/,
      loader: 'style!css',
    }],
  },

  devtool: 'eval',
}, {
  // build server
  target: 'node',
  entry: './server.js',
  output: {
    path: './',
    filename: 'server.bundle.js',
  },

  plugins: pluginsConfig,

  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
    }, {
      // don't try to load them ... just make the require calls not break
      test: /\.css$/,
      loader: 'css',
    }, {
      test: /\.json$/,
      loader: "json-loader"
    }],
  },

  node: {
      console: true,
      process: true,
      global: true,
      Buffer: true,
      __filename: true,
      __dirname: true,
  },
}]
