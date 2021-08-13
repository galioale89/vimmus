const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Cliente = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'usuario',
        require: false,
    },
    nome: {
        type: String,
        require: true
    },
    endereco: {
        type: String,
        require: true
    },
    cidade: {
        type: String,
        require: true
    },
    uf: {
        type: String,
        require: true
    },
    cnpj: {
        type: String,
        require: true
    },
    cpf: {
        type: String,
        require: true
    },
    celular: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    sissolar: {
        type: String,
        require: false,
    },
    posvenda: {
        type: String,
        require: false,
    }
})

mongoose.model('cliente', Cliente)