var dataMensagem = function(date) {

    var ano = date.substring(0, 4)
    var mes = date.substring(5, 7)
    var dia = date.substring(8, 11)

    return dia + '/' + mes + '/' + ano
}

module.exports = dataMensagem
