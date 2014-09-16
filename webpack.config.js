module.exports = {
  entry: './src/exports.js',
  output: {
    filename: './dist/nuclear.js'
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'jstransform-loader' }
    ]
  },
  resolve: {
    // you can now require('file') instead of require('file.coffee')
    extensions: ['', '.js', '.json', '.coffee'] 
  }
};
