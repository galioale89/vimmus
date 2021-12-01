const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Proposta = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'usuario',
        require: false,
    },
    cliente: {
        type: Schema.Types.ObjectId,
        ref: 'cliente',
        require: false,
    },    
    responsavel: {
        type: Schema.Types.ObjectId,
        ref: 'pessoa',
        require: false,
    },   
    resins: {
        type: Schema.Types.ObjectId,
        ref: 'pessoa',
        require: false,
    },         
    equipe: {
        type: Schema.Types.ObjectId,
        ref: 'equipe',
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
    assinatura:{
        type: String,
        require: false
    },
    dtassinatura:{
        type: String,
        require: false
    },    
    proposta1:{
        type: String,
        require: false
    },
    dtcadastro1:{
        type: String,
        require:false
    },
    dtvalidade1:{
        type: String,
        require:false
    },    
    proposta2:{
        type: String,
        require: false
    },
    dtcadastro2:{
        type: String,
        require:false
    },
    dtvalidade2:{
        type: String,
        require:false
    },       
    proposta3:{
        type: String,
        require: false
    },
    dtcadastro3:{
        type: String,
        require:false
    },
    dtvalidade3:{
        type: String,
        require:false
    },       
    proposta4:{
        type: String,
        require: false
    },
    dtcadastro4:{
        type: String,
        require:false
    },
    dtvalidade4:{
        type: String,
        require:false
    },       
    proposta5:{
        type: String,
        require: false
    },
    dtcadastro5:{
        type: String,
        require:false
    },
    dtvalidade5:{
        type: String,
        require:false
    },       
    proposta6:{
        type: String,
        require: false
    },   
    dtcadastro6:{
        type: String,
        require:false
    },
    dtvalidade6:{
        type: String,
        require:false
    },      
    feito:{
        type: Boolean,
        require:false
    },
    ganho: {
        type: Boolean,
        require:false
    },
    assinado:{
        type: Boolean,
        require:false        
    },
    contrato:{
        type: String,
        require:false  
    },
    dtcontrato:{
        type: String,
        require: false
    },    
    deadline:{
        type: String,
        require: false
    },
    encerrado:{
        type: Boolean,
        require:false        
    },    
    datacad:{
        type: Number,
        require:false   
    },    
    data:{
        type: Number,
        require:false   
    }       
})

mongoose.model('proposta', Proposta)