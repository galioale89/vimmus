const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Obra = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'usuario',
        require: false,
    },
    seq: {
        type: String,
        require: false
    },
    cliente: {
        type: Schema.Types.ObjectId,
        ref: 'cliente',
        require: false,
    },
    tarefa: [{
        idtarefa: {
            type: Schema.Types.ObjectId,
            ref: 'tarefa',
            require: false,
        }
    }],    
    responsavel: {
        type: Schema.Types.ObjectId,
        ref: 'pessoa',
        require: false,
    },             
    empresa: {
        type: Schema.Types.ObjectId,
        ref: 'empresa',
        require: false,
    },
    endereco:{
        type: String,
        require: false
    },
    uf:{
        type: String,
        require: false
    },
    cidade:{
        type: String,
        require: false
    },     
    encerrado:{
        type: Boolean,
        require:false        
    },    
    status:{
        type: String,
        require:false  
    },
    datacad:{
        type: Number,
        require: false   
    },
    dtini:{
        type: String,
        require:false   
    },
    dtfim:{
        type: String,
        require:false   
    },        
    data:{
        type: Number,
        require:false   
    }       
})

mongoose.model('obra', Obra)