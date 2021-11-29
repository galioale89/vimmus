const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Fornecedor = new Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: 'usuario',
        require: false
    },
    nome: {
        type: String,
        require: true
    },
    razao: {
        type: String,
        require: true,
    },
    cnpj: {
        type: String,
        require: true,
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
    cep: {
        type: Number,
        require: true
    },            
    contato: {
        type: String,
        require: true,
    },
    telefone: {
        type: String,
        require: true
    },
    observacao: {
        type: String,
        require: true,
    },
    prazo: {
        type: Number,
        require: true,
    },
    data: {
        type: Date,
        default: Date.now()
    },
})

mongoose.model('fornecedor', Fornecedor)