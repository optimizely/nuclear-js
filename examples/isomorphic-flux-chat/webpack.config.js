var moduleConfig = {
  loaders: [{
    test: /\.jsx?$/,
    exclude: /node_modules/,
    loader: 'babel-loader',
  }],
}

module.exports = [{
  // build client
  entry: './js/main.js',

  output: {
    path: './',
    filename: 'bundle.js',
  },

  module: moduleConfig,

  devtool: 'eval',
}, {
  // build server
  target: 'node',
  entry: './server.js',
  output: {
    path: './',
    filename: 'server-bundle.js',
  },

  module: moduleConfig,

  node: {
      console: true,
      process: true,
      global: true,
      Buffer: true,
      __filename: true,
      __dirname: true,
  },
}]
