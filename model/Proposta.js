const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Proposta = new Schema({
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
    fatura:{
        type: String,
        require: false
    },
    valor:{
        type: Number,
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
    encerrado:{
        type: Boolean,
        require:false        
    },    
    baixada:{
        type: Boolean,
        require:false        
    },   
    aceite:{
        type: Boolean,
        require:false
    },   
    dtbaixa:{
        type: String,
        require:false        
    },   
    motivo:{
        type: String,
        require:false        
    },       
    descmot:{
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
    datacad:{
        type: Number,
        require: false   
    },  
    ref: {
        type: Boolean,
        require: false   
    },
    data:{
        type: Number,
        require: false   
    }       
})

mongoose.model('proposta', Proposta)