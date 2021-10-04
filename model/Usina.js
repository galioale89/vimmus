const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Usina = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'usuario',
        require: false,
    },
    cliente: {
        type: Schema.Types.ObjectId,
        ref: 'cliente',
        require: true
    },
    nome:{
        type: String,
        require: false,
    },
    endereco:{
        type: String,
        require: false,
    },
    classificacao: {
        type: String,
        require: false,
    },
    tipo:{
        type: String,
        require: false,
    },
    cadastro: {
        type: String,
        require: false,        
    },
    area:{
        type: Number,
        require: false,                
    },
    datalimp:{
        type: String,
        require: false,      
    },
    buscalimp:{
        type: Number,
        require: false,  
    },
    datarevi:{
        type: String,
        require: false,      
    },    
    buscarevi:{
        type: Number,
        require: false, 
    },
    qtdmod:{
        type: Number,
        require: false, 
    },
    plano:{
        type: Schema.Types.ObjectId,
        ref: 'plano',
        require: false, 
    },
})

mongoose.model('usina', Usina)