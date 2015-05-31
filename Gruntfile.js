module.exports = function(grunt) {
  require('load-grunt-config')(grunt)
  // load npm tasks
  grunt.loadNpmTasks('grunt-karma')
  grunt.loadNpmTasks('grunt-karma-coveralls')
}
