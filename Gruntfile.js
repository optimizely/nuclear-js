module.exports = function (grunt) {
  // Load grunt configurations
  require('load-grunt-config')(grunt, {
    configPath: require('path').join(__dirname, 'grunt'),
    init: true,
  });

  // Load npm tasks
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-karma-coveralls');

  // Default task for Chrome and Firefox
  grunt.registerTask('test', ['karma:chrome', 'karma:firefox']);

  // Separate task for Chrome only
  grunt.registerTask('test:chrome', ['karma:chrome']);

  // Separate task for Firefox only
  grunt.registerTask('test:firefox', ['karma:firefox']);
};
