const ws = require('nodejs-websocket')

function broadcast(server, msg) {
  console.log(server.connections)
  server.connections.forEach(function(conn) {
    conn.sendText(msg)
  })
}

// Scream server example: "hi" -> "HI!!!"
const server = ws.createServer(function(conn) {
  console.log('New connection')
  conn.on('text', function(str) {
    console.log('Received '+str)
    // conn.sendText(str.toUpperCase()+'!!!')
    broadcast(server, str)
  })
  conn.on('close', function(code, reason) {
    console.log('Connection closed')
  })
  conn.on('error', function(code, reason) {
    console.log('Connection error')
  })
}).listen(8001)
