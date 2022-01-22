var comparaDatas = function(dateFim,dateReal) {
    var dataFinal = 0
    var dataRealizado = 0
    var ano = 0
    var mes = 0
    var dia = 0

    dataFinal = dateFim
    ano = dataFinal.substring(0, 4)
    mes = dataFinal.substring(5, 7)
    dia = dataFinal.substring(8, 11)
    dataFinal = ano + mes + dia

    dataRealizado = dateReal
    ano = dataRealizado.substring(0, 4)
    mes = dataRealizado.substring(5, 7)
    dia = dataRealizado.substring(8, 11)
    dataRealizado = ano + mes + dia

    if (dataRealizado > dataFinal){
        return true
    }else{
        return false
    }
}

module.exports = comparaDatas
