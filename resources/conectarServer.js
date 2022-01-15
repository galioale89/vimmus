var conectarServer = function() {
    const documentServer = express()
    var port = process.env.PORT || 21169
    documentServer.listen(port, function () {
      console.log('KingHost listening on port %s', port);
    })
}

module.exports = conectarServer
