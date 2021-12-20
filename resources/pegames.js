var pegames = function(meshoje) {
    
    var mestitulo

    switch (String(meshoje)) {
        case '01':
            mestitulo = 'Janeiro '
            break;
        case '02':
            mestitulo = 'Fevereiro '
            break;
        case '03':
            mestitulo = 'Março '
            break;
        case '04':
            mestitulo = 'Abril '
            break;
        case '05':
            mestitulo = 'Maio '
            break;
        case '06':
            mestitulo = 'Junho '
            break;
        case '07':
            mestitulo = 'Julho '
            break;
        case '08':
            mestitulo = 'Agosto '
            break;
        case '09':
            mestitulo = 'Setembro '
            break;
        case '10':
            mestitulo = 'Outubro '
            break;
        case '11':
            mestitulo = 'Novembro '
            break;
        case '12':
            mestitulo = 'Dezembro '
            break;
    }
    return mestitulo
}

module.exports = pegames
