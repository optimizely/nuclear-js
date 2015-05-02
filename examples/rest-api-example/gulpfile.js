var path = require('path')
var gulp = require('gulp')
var shell = require('gulp-shell')
var connect = require('connect')
var serveStatic = require('serve-static')
var del = require('del')

var appFiles = [
  './src/app/index.html',
  './src/app/static/*.css',
];

gulp.task('default', ['dev'])

gulp.task('dev', [
  'clean',
  'copy-app',
  'serve',
  'watch',
  'webpack',
])

gulp.task('clean', function(cb) {
  del(['dist/*'], cb)
})

gulp.task('copy-app', function() {
  return gulp.src(appFiles)
    .pipe(gulp.dest('./dist/app/'))
})

gulp.task('serve', function() {
  var appPath = path.join(__dirname, 'dist', 'app')

  connect({
    root: appPath
  }).listen(4000)
})

gulp.task('webpack', shell.task([
  './node_modules/webpack/bin/webpack.js --watch --progress --colors'
]))

gulp.task('watch', function() {
  gulp.watch(appFiles, ['copy-app'])
})
