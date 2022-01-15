var setData = function(date,add) {
    var ano = date.substring(0, 4)
    var mes = date.substring(5, 7)
    var dia = date.substring(8, 11)
    var data = new Date(ano, mes, dia)
    //console.log('dif=>'+dif)

    data.setDate(data.getDate() + parseFloat(add))
    ano = data.getFullYear()
    mes = data.getMonth()
    if (parseFloat(mes) < 10){
        mes = '0' + mes
    }
    dia = data.getDate()

    if (parseFloat(dia) < 10){
        dia = '0' + dia
    }
    if ((dia == '30' && mes == '02') || (dia == 30 && mes == 02)){
        dia = '01'
        mes = '03'
    }     
    if ((dia == '31' && mes == '04') || (dia == 31 && mes == 04)){
        dia = '01'
        mes = '05'
    }    
    if ((dia == '31' && mes == '06') || (dia == 31 && mes == 06)){
        dia = '01'
        mes = '07'
    } 
    if ((dia == '31' && mes == '09') || (dia == 31 && mes == 09)){
        dia = '01'
        mes = '10'
    }          
    if ((dia == '31' && mes == '11') || (dia == 31 && mes == 11)){
        dia = '01'
        mes = '12'
    }        
    data = ano+'-'+mes+'-'+dia

    return data
}

module.exports = setData
