const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AtvInversor = new Schema({
    proposta: {
        type: Schema.Types.ObjectId,
        ref: 'proposta',
        require: true
    },    
    ins0: {
        type: Schema.Types.ObjectId,
        ref: 'pessoa',
        require: true
    },
    ins1: {
        type: Schema.Types.ObjectId,
        ref: 'pessoa',
        require: true
    },
    ins2: {
        type: Schema.Types.ObjectId,
        ref: 'pessoa',
        require: true
    },        
    feito: {
        type: Boolean,
        require: false
    },
    hora:{
        type: String,
        require: false
    },    
    caminhoFoto:{
        type: Array,
        require: false,
    },
})

mongoose.model('atvInversor', AtvInversor)