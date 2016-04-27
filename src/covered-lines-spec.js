'use strict'

const la = require('lazy-ass')
const is = require('check-more-types')

/* global describe, it */
describe('compute covered lines', () => {
  const compute = require('./covered-lines').compute
  const fileCoverage = require('../test/file-coverage.json')

  it('has test statements', () => {
    la(is.object(fileCoverage.s))
  })

  it('is a function', () => {
    la(is.fn(compute))
  })

  it('computes lines covered from statements covered', () => {
    const lines = compute(fileCoverage)
    la(is.object(lines))
  // console.log(lines)
  })

  it('returns new object', () => {
    const lines = compute(fileCoverage)
    la(is.object(lines))
    la(lines !== fileCoverage, 'it is new object')
  })

  it('has a few correct lines counters', () => {
    const lines = compute(fileCoverage)
    la(lines['1'] === 1, 'first line', lines['1'])
    la(lines['4'] === 5)
    la(lines['7'] === 1, 'start of function', lines['7'])
    la(lines['8'] === 0, 'inside of function', lines['8'])
  })

  it('has line numbers as properties', () => {
    const lines = compute(fileCoverage)
    const properties = Object.keys(lines)
    la(is.not.empty(properties), properties)
  })

  it('has number for each line', () => {
    const lines = compute(fileCoverage)
    const properties = Object.keys(lines)
    properties.forEach(function (key) {
      const k = parseInt(key)
      la(is.number(k), 'not a number property', key)
      la(is.positive(k), 'not a positive number', key)
    })
  })
})
