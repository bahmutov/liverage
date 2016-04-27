// mock coverage information that just sends
// random "line covered" events to every listener

// const join = require('path').join
// const justName = require('path').basename
// const read = require('fs').readFileSync
const WebSocketServer = require('ws').Server

function sourceMessage (source, filename) {
  return JSON.stringify({source, filename})
}

function coverageMessage (coverage) {
  return JSON.stringify({coverage: JSON.stringify(coverage)})
}

function statementMessage (filename, line, counter) {
  return JSON.stringify({line, filename, counter})
}

function startServer (port) {
  port = parseInt(port) || 3032

  return new Promise(function (resolve, reject) {
    const wss = new WebSocketServer({ port: port })

    // function sendCoverage (send) {
    //   const filename = join(__dirname, './coverage.json')
    //   const coverage = read(filename, 'utf8')
    //   console.log('resetting code coverage', filename)
    //   send({coverage})
    // }

    // function sendSource (send) {
    //   const sourceName = join(__dirname, '../examples/calc.js')
    //   const source = read(sourceName, 'utf8')
    //   console.log('resetting source code', sourceName)
    //   const filename = justName(sourceName) // for now
    //   send(sourceMessage(source, filename))
    // }

    wss.broadcast = function broadcast (data) {
      console.log('sending message to %d clients', wss.clients.length)
      wss.clients.forEach(function each (client) {
        client.send(data)
      })
    }

    // setInterval(function () {
    //   const randomLine = parseInt(Math.random() * 20)
    //   console.log('sending random line', randomLine)
    //   wss.broadcast(JSON.stringify({line: randomLine}))
    // }, 1000)

    console.log('running ws at port %d', port)
    resolve(wss)
  })
}

function start () {
  const messages = []

  var wss
  var _sourceMessage
  var _coverage

  const api = {
    setSource: function (source, filename) {
      _sourceMessage = sourceMessage(source, filename)
      if (wss) {
        console.log('broadcasting new source to clients', filename)
        wss.broadcast(_sourceMessage)
      } else {
        messages.push(_sourceMessage)
      }
    },
    setCoverage: function (coverage) {
      _coverage = coverageMessage(coverage)
      if (wss) {
        console.log('broadcasting new coverage to clients')
        wss.broadcast(_coverage)
      } else {
        messages.push(_coverage)
      }
    },
    statementCovered: function (filename, statement, counter) {
      const s = statementMessage(filename, statement, counter)
      if (wss) {
        wss.broadcast(s)
      } else {
        messages.push(s)
      }
    }
  }

  startServer().then((_wss) => {
    if (messages.length) {
      // is this synchronous?
      console.log('sending %d messages to clients', messages.length)
      messages.forEach(_wss.broadcast)
    }
    messages.length = 0
    wss = _wss

    wss.on('connection', function connection (ws) {
      console.log('new connection!')
      if (_sourceMessage) {
        ws.send(_sourceMessage)
      }
      if (_coverage) {
        ws.send(_coverage)
      }
    })
  }, (err) => {
    console.error('could not start ws server')
    console.error(err.stack || err)
  })

  return api
}

module.exports = start
