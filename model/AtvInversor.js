const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AtvInversor = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'usuario',
        require: true
    },       
    proposta: {
        type: Schema.Types.ObjectId,
        ref: 'proposta',
        require: true
    },           
    equipe: {
        type: Schema.Types.ObjectId,
        ref: 'equipe',
        require: true
    },      
    feito: {
        type: Boolean,
        require: false
    },
    data:{
        type: String,
        require: false
    },    
    hora:{
        type: String,
        require: false
    },    
    caminhoFoto: [{
        desc: {
            type: String,
            require: false,
        },
        seq: {
            type: String,
            require: false,
        }      
    }],  
    aprova: {
        type: Boolean,
        require: false,
    },            
})

mongoose.model('atvInversor', AtvInversor)