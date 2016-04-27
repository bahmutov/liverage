'use strict'

const la = require('lazy-ass')
const is = require('check-more-types')
// const debug = require('debug')('live')
const summarizeFileCoverage = require('istanbul').utils.summarizeFileCoverage
la(is.fn(summarizeFileCoverage), 'not a function', summarizeFileCoverage)

/*
{
  '1': { start: [Object], end: [Object] },
  '2': { start: [Object], end: [Object] }
}
only use the start line?
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

  return [startLine]
}

la(is.fn(getLinesForStatement))

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

  // const summary = summarizeFileCoverage(fileCoverage)
  // const lines = summary.linesCovered
  // la(is.object(lines), 'could not compute line coverage from', fileCoverage, summary)

  const lines = {}
  Object.keys(fileCoverage.s).forEach((s, k) => {
    const statementCounter = fileCoverage.s[s]
    const statementLines = getLinesForStatement(fileCoverage.statementMap, s)
    la(is.array(statementLines), 'no lines for statement', s)
    // debug('statement', s, 'index', k, 'counter', statementCounter)

    statementLines.forEach((line) => {
      const prevValue = line[lines]
      if (typeof prevValue === 'undefined' || prevValue < statementCounter) {
        lines[line] = statementCounter
      }
    })
  })

  return lines
}

module.exports = {
  compute: computeLineCoverage
}
