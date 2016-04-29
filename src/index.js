'use strict'

console.log('real time code coverage')

const la = require('lazy-ass')
const is = require('check-more-types')
const glob = require('glob')
const read = require('fs').readFileSync
const path = require('path')

function findSourceFiles () {
  // TODO how grab everything BUT node_modules folder?
  const toFull = (name) => path.resolve(name)
  return glob.sync('{src,examples}/**/*.js')
    .concat(glob.sync('*.js'))
    .map(toFull)
}

const jsFiles = findSourceFiles()
console.log('preparing for possible coverage of %d source js files', jsFiles.length)

process.on('exit', function () {
  console.log('process on exit')
  if (server) {
    server.finished()
  }
})

const computeLineCoverage = require('./covered-lines').compute
const liveStatementCoverage = require('real-time-coverage')
// const statementCovered = (options) => {
//   // options.filename is also available
//   console.log('%s s %s covered %d', options.name, options.s, options.counter)
// }

var cover

const startServer = require('./ws-coverage')
const server = startServer()
console.log('have ws coverage server')

const statementCovered = (options) => {
  // console.log('%s s %s covered %d', options.name, options.s, options.counter)
  if (server && cover) {
    la(is.unemptyString(options.s), 'no covered statement', options)
    la(is.unemptyString(options.filename), 'no filename', options)
    const fileCoverage = cover[options.filename]
    if (fileCoverage) {
      const statementInfo = fileCoverage.statementMap[options.s]
      la(statementInfo, 'missing start for statement', options.s)
      const firstLine = statementInfo.start.line
      la(is.number(firstLine), 'not a number of line', statementInfo)
      console.log('line', firstLine, 'counter', options.counter)
      server.statementCovered(options.filename, firstLine, options.counter)
    }
  }
}

// usually each file coverage object is something like
// { path: '/Users/gleb/git/training/node/test-nyc-require/foo.js',
//     s: { '1': 1 },
//     b: {},
//     f: {},
//     fnMap: {},
//     statementMap: { '1': [Object] },
//     branchMap: {} } }
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
      Object.defineProperty(value, filename, {
        configurable: true,
        enumerable: true,
        get: () => fileCoverage,
        set: (coverage) => {
          console.log('setting file coverage for', filename)
          fileCoverage = liveStatementCoverage(statementCovered, filename, coverage)
          const lines = computeLineCoverage(fileCoverage)
          la(is.object(lines), 'expected line coverage', lines)
          fileCoverage.l = lines
          // const summary = summarizeFileCoverage(coverage)
          // console.log(summary)

          if (server) {
            const source = read(filename, 'utf8')
            console.log('sending code for', filename, 'to clients')
            server.setSource(source, filename)
            // for now just for a particular filename
            console.log('with line coverage', fileCoverage.l)
            server.setCoverage(fileCoverage)
          }
        }
      })
    })
    cover = value
  }
})
