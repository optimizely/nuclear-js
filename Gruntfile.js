module.exports = function(grunt) {
  // Load grunt configurations
  require('load-grunt-config')(grunt, {
    configPath: require('path').join(__dirname, 'grunt'),
    init: true,
  });

  // Load npm tasks
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-karma-coveralls');

  // Default task
  grunt.registerTask('test', ['karma:chrome']);
};
