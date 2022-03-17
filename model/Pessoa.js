const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Pessoa = new Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: 'usuario',
        require: false,
    },
    nome: {
        type: String,
        require: true
    },
    custo: {
        type: Number,
        require: true
    },
    seq: {
        type: Number,
        require: true
    },
    const: {
        type: String,
        require: true
    },    
    funges: {
        type: String,
        require: true
    },
    funins: {
        type: String,
        require: true
    }, 
    funorc: {
        type: String,
        require: true
    },     
    vendedor: {
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
    foto: {
        type: String,
        require: true,
        trim: true
    },      
    data:{
        type: Date,
        require: true,
    },  
})

mongoose.model('pessoa', Pessoa)