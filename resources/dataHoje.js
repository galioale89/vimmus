var dataHoje = function () {
    var ano = 0
    var mes = 0
    var dia = 0
    var date = new Date()

    ano = date.getFullYear()
    mes = date.getMonth() + 1
    if (mes < 10) {
        mes = '0' + mes
    }
    dia = date.getDate()
    if (dia < 10) {
        dia = '0' + dia
    }
    var dataFinal = ano + '-' + mes + '-' + dia

    return dataFinal
}

module.exports = dataHoje
