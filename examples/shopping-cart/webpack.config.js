module.exports = {
  entry: {
    'bundle': './src/main.js',
  },

  output: {
    path: './dist',
    filename: 'bundle.js',
  },

  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'},
      { test: /\.json/, loader: 'json-loader'},
    ]
  },
}
