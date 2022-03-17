var dataInput = function(date) {
    var ano = 0
    var mes = 0
    var dia = 0

    ano = date.substring(0, 4)
    mes = date.substring(4, 6)
    dia = date.substring(6, 10)
    var data = ano + '-' + mes + '-' + dia

    return data
}

module.exports = dataInput
