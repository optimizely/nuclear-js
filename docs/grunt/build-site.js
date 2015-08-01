var mkdirp = require('mkdirp')
var path = require('path')
var glob = require('glob')
var async = require('async')
var fm = require('front-matter')
var fs = require('fs')
var marked = require('marked')

require('babel/register')({
  only: [
    'src/',
    'node_modules/highlight.js',
    'node_modules/react-highlight',
  ],
})

var React = require('react')

var OUT = path.join(process.cwd(), 'dist/')

module.exports = function(grunt) {
  grunt.registerTask('build-site', function() {
    var done = this.async()

    async.parallel([
      buildPages.bind(null, '**/*.js', { cwd: 'src/pages' }),
      buildDocs.bind(null, 'docs/**/*.md', { cwd: 'src/' }),
    ], done)
  })
}

/**
 * @param {glob} pagesGlob
 * @param {Object} opts
 * @param {String} opts.cwd
 * @param {Function} cb
 */
function buildPages(pagesGlob, opts, cb) {
  var cwd = path.join(process.cwd(), opts.cwd)
  console.log('buildPages, cwd=%s', cwd) // eslint-disable-line no-console

  glob(pagesGlob, opts, function(err, files) { // eslint-disable-line handle-callback-err
    async.each(files, function(item, cb) {
      var componentPath = path.relative(__dirname, path.join(cwd, item))
      var destFilepath = changeExtension(path.join(OUT, item), '.html')

      var Component = require(componentPath)
      var html = React.renderToStaticMarkup(React.createElement(Component))

      writeFile(destFilepath, html, cb)
    }, cb)
  })
}

/**
 * @param {glob} globPattern
 * @param {Object} opts
 * @param {String} opts.cwd
 * @param {Function} cb
 */
function buildDocs(globPattern, opts, cb) {
  var DocWrapper = require('../src/layouts/doc-wrapper')
  parseDocs(globPattern, opts, function(err, docs) { // eslint-disable-line handle-callback-err
    var navData = docs.map(function(doc) {
      return {
        title: doc.attributes.title,
        relative: doc.relative,
      }
    })
    console.log('navdata', navData) // eslint-disable-line no-console

    async.each(docs, function(doc, cb) {
      fs.readFile(doc.src, 'utf8')
      var props = {
        title: doc.attributes.title,
        contents: doc.body,
        navData: navData,
      }
      var html = React.renderToStaticMarkup(React.createElement(DocWrapper, props))
      writeFile(path.join(OUT, doc.relative), html, cb)
    }, cb)
  })
}

/**
 * @param {glob} globPattern
 * @param {Object} opts
 * @param {String} opts.cwd
 * @param {Function} cb
 */
function parseDocs(globPattern, opts, cb) {
  var cwd = path.join(process.cwd(), opts.cwd)

  glob(globPattern, opts, function(err, files) { // eslint-disable-line handle-callback-err
    async.map(files, function(item, cb) {
      var filepath = path.join(cwd, item)
      var relativeFilepath = changeExtension(item, '.html')

      fs.readFile(filepath, 'utf8', function(err, data) {
        if (err) {
          cb(err)
        }

        var fmData = fm(data)
        fmData.body = marked(fmData.body)
        fmData.src = filepath
        fmData.relative = relativeFilepath

        cb(null, fmData)
      })
    }, cb)
  })
}

// Util Functions
function filenameOnly(filepath) {
  return path.basename(filepath, path.extname(filepath))
}

function changeExtension(filepath, newExt) {
  var newFilename = filenameOnly(filepath) + newExt
  return path.join(path.dirname(filepath), newFilename)
}


function writeFile(p, contents, cb) {
  mkdirp(path.dirname(p), function(err) {
    console.log('writing file: [%s]', p) // eslint-disable-line no-console
    if (err) {
      return cb(err)
    }
    fs.writeFile(p, contents, cb)
  })
}

