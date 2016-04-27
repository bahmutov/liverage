const N = parseInt(process.argv[2]) || 2

function add (a, b) {
  return a + b
}

function notUsed () { // eslint-disable-line no-unused-vars
  console.log('this function is not used')
}

// load another js file just for fun
// require('./foo')

console.log('this file runs for %d seconds', N)
console.log('every second it adds two numbers')

var k = 0
const s = setInterval(function () {
  const a = parseInt(Math.random() * 10)
  const b = parseInt(Math.random() * 10)
  console.log('%d + %d = %d', a, b, add(a, b))
  console.log('%d / %d done', k + 1, N)
  k += 1
  if (k >= N) {
    clearInterval(s)
    console.log('we are done!')
  // process.exit(0)
  }
}, 2000)
