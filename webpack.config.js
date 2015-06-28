var webpack = require('webpack')

var genFilename = function(isMin) {
  return [
    './dist/nuclear', (isMin ? '.min' : ''),
    '.js',
  ].join('')
}

var uglifyJsPlugin = new webpack.optimize.UglifyJsPlugin()

var externals = [{
  'react': {
    root: 'React',
    commonjs2: 'react',
    commonjs: 'react',
    amd: 'react',
  },
}]

module.exports = [{
  entry: './src/main.js',
  output: {
    library: 'Nuclear',
    libraryTarget: 'umd',
    filename: genFilename(false),
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'jstransform-loader',
    }],
  },
}, {
  entry: './src/main.js',
  output: {
    library: 'Nuclear',
    libraryTarget: 'umd',
    filename: genFilename(true),
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'jstransform-loader',
    }],
  },
  plugins: [uglifyJsPlugin],
}, {
  entry: './src/addons/react-mixin',
  output: {
    library: 'Nuclear/addons/react-mixin',
    libraryTarget: 'umd',
    filename: './addons/react-mixin.js',
  },
  externals: externals,
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'jstransform-loader',
    }],
  },
}, {
  entry: './src/addons/provide-reactor',
  output: {
    library: 'Nuclear/addons/provide-reactor',
    libraryTarget: 'umd',
    filename: './addons/provide-reactor.js',
  },
  externals: externals,
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'jstransform-loader',
    }],
  },
}]
