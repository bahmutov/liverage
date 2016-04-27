'use strict'

const la = require('lazy-ass')
const is = require('check-more-types')
const debug = require('debug')('live')
const summarizeFileCoverage = require('istanbul').utils.summarizeFileCoverage
la(is.fn(summarizeFileCoverage), 'not a function', summarizeFileCoverage)

/*
{
  '1': { start: [Object], end: [Object] },
  '2': { start: [Object], end: [Object] }
}
*/
function getLinesForStatement (statementMap, statement) {
  la(is.unemptyString(statement), 'invalid statement index', statement)
  const map = statementMap[statement]
  la(is.object(map), 'cannot find statement map for', statement, 'in', statementMap)
  const startLine = map.start.line
  la(is.number(startLine), 'invalid start', map.start, 'for', statement)
  const endLine = map.end.line
  la(is.number(endLine), 'invalid end', map.end, 'for', statement)
  la(startLine <= endLine, 'start should be before end', map.start, map.end)

  if (startLine === endLine) {
    return [startLine]
  }

  debug('lines covered for statement', statement, 'from', startLine, 'to', endLine)

  var k = 0
  var lines = []
  for (k = startLine; k < endLine; k += 1) {
    lines.push([k])
  }
  return lines
}

/*
outputs an object like
{
  '3': 1,
  '4': 0,
  '7': 1,
  '8': 0,
  '14': 0
  ...
}
*/
function computeLineCoverage (fileCoverage) {
  la(is.object(fileCoverage), 'expected file coverage', fileCoverage)
  la(is.object(fileCoverage.s), 'missing statements', fileCoverage)
  la(is.object(fileCoverage.statementMap), 'missing statement map', fileCoverage)

  const summary = summarizeFileCoverage(fileCoverage)
  const lines = summary.linesCovered
  la(is.object(lines), 'could not compute line coverage from', fileCoverage, summary)

  la(is.fn(getLinesForStatement))

  // const lines = {}
  // Object.keys(fileCoverage.s).forEach((s, k) => {
  //   if (k > 3) {
  //     return
  //   }
  //   const statementCounter = fileCoverage.s[s]
  //   const statementLines = getLinesForStatement(fileCoverage.statementMap, s)
  //   la(is.array(statementLines), 'no lines for statement', s)
  //   debug('statement', s, 'index', k, 'counter', statementCounter)

  //   statementLines.forEach((line) => {
  //     if (!(line in lines)) {
  //       lines[line] = statementCounter
  //     } else {
  //       lines[line] += statementCounter
  //     }
  //   })
  // })

  return lines
}

module.exports = {
  compute: computeLineCoverage
}
