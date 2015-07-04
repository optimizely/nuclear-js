module.exports = {
  dev: [
    'clean',
    'copy:assets',
    'connect:dev',
    'exec:sass',
    'build-site',
    'webpack:dev',
    'concurrent:dev',
  ],

  generate: [
    'clean',
    'copy:assets',
    'exec:sass',
    'build-site',
    'webpack:prod',
  ],

  publish: [
    'exec:generate',
    'gh-pages',
    'clean:gh-pages',
  ],
}
