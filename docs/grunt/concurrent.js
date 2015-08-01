module.exports = {
  dev: {
    options: {
      logConcurrentOutput: true,
    },
    tasks: ['exec:watch-sass', 'watch:build-site'],
  },
}
