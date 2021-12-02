var naoVazio = function (campo) {
    if (campo != null && campo != '' && typeof campo != 'undefined') {
        return true
    } else {
        return false
    }
}

module.exports = naoVazio
