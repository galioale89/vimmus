const { Double } = require('bson')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Componente = new Schema({
    nome: {
        type: String,
        require: true
    },
    fornecedor: {
        type: String,
        require: true
    },
    preco: {
        type: Number,
        require: true,
    },
    tipo: {
        type: String,
        require: true,
    },
    classificacao: {
        type: String,
        require: true
    },
    observacao: {
        type: String,
        require: true,
    },
    data: {
        type: Date,
        default: Date.now()
    },
})

mongoose.model('componente', Componente)