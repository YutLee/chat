const PORT = 8888;
const http = require('http');
const url=require('url');
const fs=require('fs');
const path=require('path');
const jwt = require('jsonwebtoken')
const cache = require('memory-cache')
const auth = require('./auth')
const mdb = require('./db')

// const mine=require('./mine').types;
const types = {
  "css": "text/css",
  "gif": "image/gif",
  "html": "text/html",
  "ico": "image/x-icon",
  "jpeg": "image/jpeg",
  "jpg": "image/jpeg",
  "js": "text/javascript",
  "json": "application/json",
  "pdf": "application/pdf",
  "png": "image/png",
  "svg": "image/svg+xml",
  "swf": "application/x-shockwave-flash",
  "tiff": "image/tiff",
  "txt": "text/plain",
  "wav": "audio/x-wav",
  "wma": "audio/x-ms-wma",
  "wmv": "video/x-ms-wmv",
  "xml": "text/xml"
};

const server = http.createServer(function (request, response) {

  const loginStatus = auth(conn)
  const nick = conn.headers.nick || ''

  if(loginStatus.code == 401) {
    mdb.MongoClient.connect(mdb.DB_CONN_STR, function(err, db) {
      if(err) {
        console.error('连接数据库chat失败！')
        // conn.sendText(JSON.stringify({code: 500, message: '服务器偷懒了，请稍后重试'}))
        return
      }

      if(!nick) {
        mdb.sortData(db, 'user', {create: -1}, function(result) {
          const lastUser = result[0] || {}
          conn.sendText(JSON.stringify({...loginStatus, nick: lastUser.id + 1}))
          db.close()
        })
        return
      }

      mdb.selectData(db, 'user', {nick}, function(result) {
        const user = result[0] || {}
        conn.sendText(JSON.stringify({...loginStatus, nick: user.nick || lastUser.id + 1}))
        db.close()
      })
    })
  }

  let pathname = url.parse(request.url).pathname;

  pathname = pathname == '/' || !/\..*/.test(pathname) ? '/index.html' : pathname;
  const realPath = path.join(__dirname, pathname);
  console.log(pathname, realPath);
  let ext = path.extname(realPath);
  ext = ext ? ext.slice(1) : 'unknown';
  fs.exists(realPath, function (exists) {
    if (!exists) {
      response.writeHead(404, {
        'Content-Type': 'text/plain'
      });

      response.write('This request URL ' + pathname + ' was not found on this server.');
      response.end();
    } else {
      fs.readFile(realPath, 'binary', function (err, file) {
        if (err) {
          response.writeHead(500, {
            'Content-Type': 'text/plain'
          });
          response.end(err);
        } else {
          const contentType = types[ext] || 'text/plain';
          response.writeHead(200, {
            'Content-Type': contentType
          });
          response.write(file, 'binary');
          response.end();
        }
      });
    }
  });
});
server.listen(PORT);
console.log('Server runing at port: ' + PORT + '.');
