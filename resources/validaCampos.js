
var validaCampos = function(campo){
     
    var erros = []
    
    if (!campo || typeof campo == undefined || campo == null){
        erros.push({texto: 'Inválido'})     
    }
    
    return erros
}

module.exports = validaCampos