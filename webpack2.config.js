module.exports = {
  entry: './__tests__/mocks/EntityStore.js',
  output: {
    filename: './dist/EntityStore.js'
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
