const assert = require('assert');
const fs = require('fs');
const mongodb = require('mongodb');
const mongoose = require('mongoose')

console.log('salva arquivo')

var salvarArquivo = function (type, path) {

  var bucket = new mongodb.GridFSBucket(mongoose.connection.db);

  console.log('path=>' + path)
  console.log('type=>' + type)

  fs.createReadStream(path).
    pipe(bucket.openUploadStream(type)).
    on('error', function (error) {
      assert.ifError(error);
    }).
    on('finish', function () {
      console.log('done!');
      process.exit(0);
    });
}

module.exports = salvarArquivo