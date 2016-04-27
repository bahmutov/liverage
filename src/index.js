'use strict'

console.log('real time code coverage')
const glob = require('glob')
const path = require('path')
// TODO how to exclude node_modules right away?
const toFull = (name) => path.resolve(name)
const jsFiles = glob.sync('{src,examples}/**/*.js')
  .map(toFull)
console.log('preparing for possible coverage of %d source js files', jsFiles.length)

const liveStatementCoverage = require('real-time-coverage')
const statementCovered = (options) => {
  console.log('%s s %s covered %d', options.name, options.s, options.counter)
}

var cover

Object.defineProperty(global, '__coverage__', {
  configurable: true,
  enumerable: true,
  get: () => {
    // console.log('getting coverage')
    // console.log(cover)
    return cover
  },
  set: (value) => {
    console.log('setting new coverage object')
    // console.log(value)
    // happens once
    // prepare for every source file ;)
    jsFiles.forEach((filename) => {
      var fileCoverage
      // usually each file coverage object is something like
      // { path: '/Users/gleb/git/training/node/test-nyc-require/foo.js',
      //     s: { '1': 1 },
      //     b: {},
      //     f: {},
      //     fnMap: {},
      //     statementMap: { '1': [Object] },
      //     branchMap: {} } }
      Object.defineProperty(value, filename, {
        configurable: true,
        enumerable: true,
        get: () => fileCoverage,
        set: (coverage) => {
          console.log('setting file coverage for', filename)
          fileCoverage = liveStatementCoverage(statementCovered, filename, coverage)
        }
      })
    })
    cover = value
  }
})
