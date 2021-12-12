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
    responsavel: {
        type: Schema.Types.ObjectId,
        ref: 'pessoa',
        require: false,
    },
    programacao: {
        type: Schema.Types.ObjectId,
        ref: 'programacao',
        require: false,
    },
    servico:{
        type: Schema.Types.ObjectId,
        ref: 'atividade',
        require: false,
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
    },
    preco:{
        type: Number,
        require:false        
    },    
    caminhofotos:{
        type: String,
        require:false  
    },
})

mongoose.model('tarefas', Tarefas)