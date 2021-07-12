var dataBusca = function(date) {
    var ano = 0
    var mes = 0
    var dia = 0

    ano = date.substring(0, 4)
    mes = date.substring(5, 7)
    dia = date.substring(8, 11)
    var data = ano + mes + dia

    return data
}

module.exports = dataBusca
