var mascaraDecimal = function (numero) {

    var x
    var params
    var decimais

    var vlrstring = numero.toString()
    if (vlrstring.indexOf(',') != -1) {
        params = vlrstring.split(',')
        x = params[0].length
        decimais = params[1]
    } else {
        x = vlrstring.length
        decimais = '00'
    }
    if (x < 3) {
        var primeiros = vlrstring
        var total = primeiros + ',' + decimais
    } else {
        if (x > 2 && x < 6) {
            var i = x - 3
            var ultimos = vlrstring.slice(i, x)
            var primeiros = vlrstring.slice(0, i)
            var total = primeiros + '.' + ultimos + ',' + decimais
        } else {
            if (x > 2 && x < 9) {
                var i = x - 3
                var y = i - 3
                var ultimos = vlrstring.slice(i, x)
                var milhares = vlrstring.slice(y, i)
                var primeiros = vlrstring.slice(0, y)
                var total = primeiros + '.' + milhares + '.' + ultimos + ',' + decimais
            }
        }
    }

    return total
}

module.exports = mascaraDecimal
