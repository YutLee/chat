const MongoClient = require('mongodb').MongoClient
const CONNECTSTR = 'mongodb://localhost:27017/chat'

const insertData = function(db, tb, data, callback) {
  //连接到表 user
  const collection = db.collection(tb)
  //插入数据
  collection.insert(data, function(err, result) {
    if(err) {
      console.error('Error:', err)
      return
    }
    callback(result)
  })
}

const selectData = function(db, tb, whereStr, callback) {
  const collection = db.collection(tb)

  //查询数据
  collection.find(whereStr).toArray(function(err, result) {
    if(err) {
      console.error('Error:', err)
      return
    }
    callback(result)
  })
}

const sortData = function(db, tb, data, callback) {
  const collection = db.collection(tb)

  //排序数据
  collection.find().sort(data).toArray(function(err, result) {
    if(err) {
      console.error('Error:', err)
      return
    }
    callback(result)
  })
}

module.exports = {
  MongoClient,
  CONNECTSTR,
  insertData,
  selectData,
  sortData
}
