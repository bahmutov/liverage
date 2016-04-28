'use strict'

const la = require('lazy-ass')
const is = require('check-more-types')
const pluralize = require('pluralize')

// mock coverage information that just sends
// random "line covered" events to every listener

// const join = require('path').join
// const justName = require('path').basename
// const read = require('fs').readFileSync
const WebSocketServer = require('ws').Server

function stringify (o) {
  la(arguments.length === 1, 'expected single object', arguments)
  la(is.object(o), 'expected an object', o)
  return JSON.stringify(o)
}

function sourceMessage (source, filename) {
  return stringify({source, filename})
}

function coverageMessage (coverage) {
  return stringify({coverage: stringify(coverage)})
}

function statementMessage (filename, line, counter) {
  return stringify({line, filename, counter})
}

function startServer (port) {
  port = parseInt(port) || 3032

  return new Promise(function (resolve, reject) {
    const wss = new WebSocketServer({ port: port })

    // allow the Node process exit without waiting for this server
    // or any existing client connection to close
    wss._server.unref()
    wss.on('connection', function (client) {
      client._socket.unref()
    })

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
      console.log('sending message to', pluralize('client', wss.clients.length, true))
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
      }
      messages.push(_sourceMessage)
    },
    setCoverage: function (coverage) {
      _coverage = coverageMessage(coverage)
      if (wss) {
        console.log('broadcasting new coverage to clients')
        wss.broadcast(_coverage)
      }
      messages.push(_coverage)
    },
    statementCovered: function (filename, statement, counter) {
      const s = statementMessage(filename, statement, counter)
      if (wss) {
        wss.broadcast(s)
      }
      messages.push(s)
    },
    finished: function () {
      console.log('ws server is finished')
      // setTimeout(function cleanup () {
      _sourceMessage = null
      _coverage = null
      messages.length = 0
      // }, 100)
      wss.broadcast(stringify({done: true}))
      wss.close((err) => {
        if (err) {
          console.error('Error trying to close web socket server')
          console.error(err.stack || err)
        }
        console.log('closed the web socket server')
      })
    }
  }

  startServer().then((_wss) => {
    if (messages.length) {
      // is this synchronous?
      console.log('sending %s to %s',
        pluralize('message', messages.length, true),
        pluralize('client', _wss.clients.length, true)
      )
      messages.forEach(_wss.broadcast)
    }
    // messages.length = 0
    wss = _wss

    wss.on('connection', function connection (ws) {
      console.log('new connection, replaying messages')
      messages.forEach((m) => ws.send(m))
    // if (_sourceMessage) {
    //   ws.send(_sourceMessage)
    // }
    // if (_coverage) {
    //   ws.send(_coverage)
    // }
    })
  }, (err) => {
    console.error('could not start ws server')
    console.error(err.stack || err)
  })

  return api
}

module.exports = start
