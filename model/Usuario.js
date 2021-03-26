const Mongoose = require("mongoose")
const Schema = Mongoose.Schema

const Usuario = new Schema({
    razao: {
        type: String,
        require: true
    },
    fantasia: {
        type: String,
        require: true
    },
    usuario: {
        type: String,
        require: true
    },
    cnpj: {
        type: String,
        require: true
    },
    endereco:{
        type: String,
        require: true        
    },
    cidade:{
        type: String,
        require: true        
    },
    uf:{
        type: String,
        require: true        
    },        
    telefone:{
        type: String,
        require: true        
    },
    email: {
        type: String,
        require: true
    },
    senha: {
        type: String,
        require: true
    },
    
    ehAdmin:{
      type: Number,
      default: 0
    }
})

Mongoose.model ("usuario", Usuario)
