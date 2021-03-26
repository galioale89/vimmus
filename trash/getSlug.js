const mongoose = require('mongoose')
const Configuracao = mongoose.model('configuracao')

var getSlug = function (id_projeto) {

    

    Configuracao.findOne({ _id: id_projeto }).lean().then((config) = {
 
                    

    }).catch((err) => {
        req.flash('error_msg', 'Houve uma falha ao encontrar a configuracao')
        res.require('/configuracao/consultar')
    })

    return config
}
