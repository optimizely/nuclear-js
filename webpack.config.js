module.exports = {
  entry: './src/Flux.js',
  output: {
    filename: './dist/flux.js'
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
