const ws = require('nodejs-websocket')
const jwt = require('jsonwebtoken')
const cache = require('memory-cache')
const auth = require('./auth')
const mdb = require('./db')

function json(str) {
  let data
  try{
    data = JSON.parse(str)
  }catch(err) {
    data = null
  }
  return data
}

function broadcast(server, msg, connect) {
  server.connections.forEach(function(conn) {
    if(connect.key == conn.key) {
      conn.sendText(msg)
      return
    }
    conn.sendText(msg)
  })
}

// Scream server example: "hi" -> "HI!!!"
const server = ws.createServer(function(conn) {
  console.log('New connection')
  let firstConnect = true

  // const token = jwt.sign({ uid: data.uid, username: data.username, password: data.password }, 'access_token', {expiresIn: 1000});
  // cache.put('access_token_last_' + data.uid, Date.now(), TIMEOUT * 1000);

  conn.on('text', function(str) {
    // const loginStatus = auth(conn)
    const data = json(str)
    const nick = data.nick

    if(firstConnect) {
      firstConnect = false

      mdb.MongoClient.connect(mdb.CONNECTSTR, function(err, db) {
        if(err) {
          console.error('连接数据库chat失败！')
          conn.sendText(JSON.stringify({code: 500, message: '服务器偷懒了，请稍后重试'}))
          return
        }

        if(!nick) {
          mdb.sortData(db, 'user', {create: -1}, function(result) {
            const lastUser = result[0] || {}
            conn.sendText(JSON.stringify({code: 401, nick: lastUser.id + 1}))
            db.close()
          })
          return
        }

        mdb.selectData(db, 'user', {nick}, function(result) {
          const user = result[0] || {}
          conn.sendText(JSON.stringify({code: 401, nick: user.nick || lastUser.id + 1}))
          db.close()
        })
      })

      return
    }

    broadcast(server, str, conn)
    // conn.sendText(JSON.stringify({code: 200, login: true, nick: nick}))
    // console.log('Received '+str)
    // conn.sendText(str.toUpperCase()+'!!!')
    // broadcast(server, str)
  })

  conn.on('close', function(code, reason) {
    console.log('Connection closed')
  })
  conn.on('error', function(code, reason) {
    console.log('Connection error')
  })
}).listen(8001)
