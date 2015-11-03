var webpack = require('webpack')

var genFilename = function(isMin) {
  return [
    './dist/nuclear',
    (isMin ? '.min' : ''),
    '.js',
  ].join('')
}

var uglifyJsPlugin = new webpack.optimize.UglifyJsPlugin()

module.exports = [
  {
    entry: './src/main.js',
    output: {
      library: 'Nuclear',
      libraryTarget: 'umd',
      filename: genFilename(false),
    },
    module: {
      loaders: [
        { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' },
      ],
    },
  },
  {
    entry: './src/main.js',
    output: {
      library: 'Nuclear',
      libraryTarget: 'umd',
      filename: genFilename(true),
    },
    module: {
      loaders: [
        { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' },
      ],
    },
    plugins: [uglifyJsPlugin],
  },
]
