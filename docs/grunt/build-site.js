var path = require('path');
var webpack = require('webpack')
var webpackConfig = require('../webpack.config.js')

require('babel/register')({
  only: [
    'src/',
    'node_modules/highlight.js',
    'node_modules/react-highlight',
  ]
})

var React = require('react')

var OUT = 'dist/'

module.exports = function(grunt) {
  grunt.registerTask('build-site', function() {
    var done = this.async()

    var files = grunt.file.expand({
      cwd: 'src/pages',
    }, '**.js')

    files.forEach(function(f) {
      var Component = require('../src/pages/' + f)

      var html = React.renderToStaticMarkup(React.createElement(Component));
      var outfile = path.join(OUT, f.replace('\.js', '.html'));

      grunt.file.write(outfile, html);
    });

  });

  grunt.registerTask('build-js', function() {
    var done = this.async()
    webpackConfig.output = {
      path: OUT,
      filename: '[name].js',
    }

    webpack(webpackConfig, function(err, stats) {
      done(err)
    })
  });
}
