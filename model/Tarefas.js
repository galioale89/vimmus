const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Tarefas = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'usuario',
        require: false,
    },  
    usina: {
        type: Schema.Types.ObjectId,
        ref: 'usina',
        require: false,
    },
    equipe: {
        type: Schema.Types.ObjectId,
        ref: 'equipe',
        require: false,
    },    
    servico:{
        type: String,
        require:false
    },
    concluido: {
        type: Boolean,
        require:false        
    },
    dataini:{
        type: String,
        require:false        
    },
    buscadataini:{
        type: Number,
        require: false
    },
    datafim:{
        type: String,
        require:false        
    },    
    buscadatafim:{
        type: Number,
        require: false
    },
    cadastro:{
        type: String,
        require:false        
    }    
})

mongoose.model('tarefas', Tarefas)