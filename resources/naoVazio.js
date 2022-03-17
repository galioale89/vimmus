var naoVazio = function (campo) {
    if (campo != null && campo != '' && typeof campo != 'undefined' && campo != 'NaN') {
        return true
    } else {
        return false
    }
}

module.exports = naoVazio
