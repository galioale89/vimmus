var dataMsgNum = function(date) {

    date = String(date)
    var ano = date.substring(0, 4)
    var mes = date.substring(4, 6)
    var dia = date.substring(6, 10)

    return dia + '/' + mes + '/' + ano
}

module.exports = dataMsgNum
