const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Tarefas = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'usuario',
        require: false,
    },  
    empresa: {
        type: Schema.Types.ObjectId,
        ref: 'empresa',
        require: false,
    },    
    seq: {
        type: Number,
        require: false
    },
    usina: {
        type: Schema.Types.ObjectId,
        ref: 'usina',
        require: false,
    },
    cliente: {
        type: Schema.Types.ObjectId,
        ref: 'cliente',
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
    gestor: {
        type: Schema.Types.ObjectId,
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
    databaixa: {
        type: String,
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
    dias: [{
        dia: {
            type: Number,
            require: false
        },
        feito: {
            type: Boolean,
            require: false
        }        
    }],
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
    status:{
        type: String,
        require:false  
    },
    descstatus: {
        type: String,
        require:false  
    },
    datastatus: {
        type: String,
        require:false  
    }, 
    tipo: {
        type: String,
        require:false  
    }    
})

mongoose.model('tarefas', Tarefas)