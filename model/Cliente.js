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
        require: false
    },
    sobrenome: {
        type: String,
        require: false  
    },
    endereco: {
        type: String,
        require: false
    },
    numero:{
        type: String,
        require: false
    },
    bairro: {
        type: String,
        require: false
    },
    cep: {
        type: String,
        require: false
    },
    complemento: {
        type: String,
        require: false
    },
    cidade: {
        type: String,
        require: false
    },
    uf: {
        type: String,
        require: false
    },
    cnpj: {
        type: String,
        require: false
    },
    cpf: {
        type: String,
        require: false
    },
    contato: {
        type: String,
        require: false
    },
    celular: {
        type: String,
        require: false
    },
    financeiro: {
        type: String,
        require: false
    },    
    email: {
        type: String,
        require: false
    }
})

mongoose.model('cliente', Cliente)