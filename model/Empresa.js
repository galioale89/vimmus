const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Empresa = new Schema({
    
    user:{
        type: Schema.Types.ObjectId,
        ref: 'usuario',
        require: false,
    },
    nome: {
        type: String,
        require: true
    },
    razao: {
        type: String,
        require: true
    },    
    cnpj: {
       type: String,
       require: true
    },
    endereco:{
        type: String,
        require: false
    },
    cidade:{
        type: String,
        require: false
    },
    uf:{
        type: String,
        require: false
    },    
    website:{
        type: String,
        require: false
    },    
    telefone:{
        type: String,
        require: false
    },    
    celular:{
        type: String,
        require: false
    },    
    vlrmdo: {
        type: Number,
        require: false
    },
    valpro: {
        type: Number,
        require: false
    },
    seq: {
        type: Number,
        require: false
    },
    perdaleste : {
        type: String,
        require: false
    },
    perdaoeste : {
        type: String,
        require: false
    },
    perdanorte : {
        type: String,
        require: false
    },
    perdanoroeste : {
        type: String,
        require: false
    },
    perdanordeste : {
        type: String,
        require: false
    },
    logo : {
        type: String,
        require: false
    },
    data: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model('empresa', Empresa)