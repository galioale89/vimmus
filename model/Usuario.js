const Mongoose = require("mongoose")
const Schema = Mongoose.Schema

const Usuario = new Schema({
    razao: {
        type: String,
        require: false
    },
    fantasia: {
        type: String,
        require: false
    },
    nome: {
        type: String,
        require: false
    },
    usuario: {
        type: String,
        require: false
    },
    cnpj: {
        type: String,
        require: false
    },
    endereco: {
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
    telefone: {
        type: String,
        require: false
    },
    email: {
        type: String,
        require: false
    },
    senha: {
        type: String,
        require: false
    },
    ehAdmin: {
        type: Number,
        default: 3
    },
    owner: {
        type: Boolean,
        default: false,
    },    
    data: {
        type: String,
        require: false
    },
    datalib: {
        type: String,
        require: false
    },
    dataexp: {
        type: String,
        require: false
    },
    pgto: {
        type: String,
        require: false
    },
    pricont:{
        type: String,
        require: false
    },
    pricont:{
        type: String,
        require: false
    },
    ultimate:{
        type: Boolean,
        require: false
    },
    obra:{
        type: Boolean,
        require: false
    },
    processo:{
        type: Boolean,
        require: false
    }    
})

Mongoose.model("usuario", Usuario)
