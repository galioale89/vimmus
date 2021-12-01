var validaCampos = function (campo) {
    if (campo != null && campo != '' && typeof campo != 'undefined') {
        return true
    } else {
        return false
    }
}

module.exports = validaCampos
