var liberaRecuros = function(plaini,plafim,proini,profim,ateini,atefim,invini,invfim,stbini,stbfim,estini,estfim,modini,modfim,visini,visfim) {
    if (plaini == '' || typeof plaini == 'undefined' || plafim == '' || typeof plafim == 'undefined' 
     || proini == '' || typeof proini == 'undefined' || profim == '' || typeof profim == 'undefined' 
     || ateini == '' || typeof ateini == 'undefined' || atefim == '' || typeof atefim == 'undefined'
     || invini == '' || typeof invini == 'undefined' || invfim == '' || typeof invfim == 'undefined'
     || stbini == '' || typeof stbini == 'undefined' || stbfim == '' || typeof stbfim == 'undefined' 
     || estini == '' || typeof estini == 'undefined' || estfim == '' || typeof estfim == 'undefined'
     || modini == '' || typeof modini == 'undefined' || modfim == '' || typeof modfim == 'undefined' 
     || visini == '' || typeof visini == 'undefined' || visfim == '' || typeof visfim == 'undefined'){
        return false
    }else{
        return true
    }
}

module.exports = liberaRecuros
