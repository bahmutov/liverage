'use strict'

const port = 3032

const WebSocketServer = require('ws').Server

// let web socket server create itself
const wss = new WebSocketServer({ port: port })
wss._server.unref()

// create http server for web sockets
// const http = require('http')
// function dummyResponder (req, res) {
//   res.writeHead(200, {'Content-Type': 'text/plain'})
//   res.end('okay')
// }
// const webServer = http.createServer(dummyResponder).listen(port)
// webServer.unref()
// const wss = new WebSocketServer({server: webServer})

wss.on('connection', function (client) {
  console.log('new connection!')
  client._socket.unref()
})

console.log('running ws at port %d', port)

setTimeout(function () {
  console.log('done after 5 seconds')
}, 5000)
