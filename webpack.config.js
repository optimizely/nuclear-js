var webpack = require('webpack')

var immutableJS = {
  immutable: {
    root: 'Immutable',
    commonjs2: 'immutable',
    commonjs: 'immutable',
    amd: 'immutable',
  }
}

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
        { test: /\.js$/, loader: 'jstransform-loader' },
      ],
    },
    externals: [
      immutableJS
    ],
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
        { test: /\.js$/, loader: 'jstransform-loader' },
      ],
    },
    externals: [
      immutableJS
    ],
    plugins: [uglifyJsPlugin],
  },
]
