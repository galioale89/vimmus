const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Pessoa = new Schema({
    user:{
        type: Schema.Types.ObjectId,
        require: false,
    },
    nome: {
        type: String,
        require: true
    },
    funges: {
        type: String,
        require: true
    },
    funpro: {
        type: String,
        require: true
    },
    funins: {
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
    iniati: {
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
    maninv: {
        type: String,
        require: false
    },
    subcom: {
        type: String,
        require: false
    },
    repequ: {
        type: String,
        require: false
    },  
    vistor: {
        type: String,
        require: false
    }, 
    dlaudo: {
        type: String,
        require: false
    }, 
    limmod: {
        type: String,
        require: false
    },    
    foto: {
        type: String,
        require: true,
        trim: true
    },
    certificado: {
        type: String,
        require: true,
        trim: true
    },    
    data:{
        type: Date,
        require: true,
    },  
    ehVendedor:{
         type: Boolean,
         require: false,
    },
    percom:{
        type: Number,
        require: false,
   }      
})

mongoose.model('pessoa', Pessoa)