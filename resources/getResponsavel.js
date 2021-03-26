require ('../model/Pessoa')
const mongoose = require('mongoose')
const Pessoa = mongoose.model('pessoa')

var getResponsavel = function(id) {

    Pessoa.findOne({ _id: id }).lean().then((pessoa_projeto) => {
        var num = 1
        return num
    }).catch((err) => {
        mensagem = 'Houve uma falha ao encontrar a pessoa'
        return mensagem
    })

}

module.exports = getResponsavel
