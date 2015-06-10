var CMD = 'node_modules/.bin/node-sass sass/main.scss dist/assets/css/output.css'
var WATCH_CMD = CMD + ' -w'

module.exports = {
  'watch-sass':  WATCH_CMD,
  'sass': CMD,
}
