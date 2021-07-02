
var validaCronograma = function (campo, tipoData) {

    var mensagem

    if (typeof campo == 'undefined' || campo == '') {        
        switch (tipoData) {
            case 'plaini': mensagem = 'Preencher data inicial de planejamento no cronograma. ' 
            break;
            case 'plafim': mensagem = 'Preencher data final de planejamento no cronograma. '
            break;
            case 'prjini': mensagem = 'Preencher data inicial de projeto no cronograma. '
            break;
            case 'prjfim': mensagem = 'Preencher data final de projeto no cronograma. '
            break;
            case 'ateini': mensagem = 'Preencher data inicial de aterramento no cronograma. '
            break;
            case 'atefim': mensagem = 'Preencher data final de aterramento no cronograma. '
            break;
            case 'estini': mensagem = 'Preencher data inicial de instalação das estruturas no cronograma. '
            break;
            case 'estfim': mensagem = 'Preencher data final de instalação das estruturas no cronograma. '
            break;
            case 'modini': mensagem = 'Preencher data inicial de instalação dos módulos no cronograma. '
            break;
            case 'modfim': mensagem = 'Preencher data final de instalação dos módulos no cronograma. '
            break;
            case 'invini': mensagem = 'Preencher data inicial de instalação do inversor no cronograma. '
            break;
            case 'invfim': mensagem = 'Preencher data final de instalação do inversor no cronograma. '
            break;
            case 'eaeini': mensagem = 'Preencher data inicial de instalação da estação de armazenamento no cronograma. '
            break;
            case 'eaefim': mensagem = 'Preencher data final de instalação da estação de armazenamento no cronograma. '
            break;
            case 'stbini': mensagem = 'Preencher data inicial de instalação da estação da stringbox no cronograma. '
            break;
            case 'stbfim': mensagem = 'Preencher data final de instalação da estação da stringbox no cronograma. '
            break;
            case 'pnlini': mensagem = 'Preencher data inicial de instalação do painél elétrico no cronograma. '
            break;
            case 'pnlfim': mensagem = 'Preencher data final de instalação do painél elétrico no cronograma. '
            break;
            case 'visini': mensagem = 'Preencher data inicial da vistoria no cronograma. '
            break;
            case 'visfim': mensagem = 'Preencher data final da vistoria no cronograma. '
            break;
            case 'dataentrega': mensagem = 'Preencher data de entrega prevista.'
            break;            
            default: mensagem = ''
        }
    }else{
        mensagem = ''
    }

    return mensagem
}

module.exports = validaCronograma