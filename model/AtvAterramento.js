const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AtvAterramento = new Schema({
    proposta: {
        type: Schema.Types.ObjectId,
        ref: 'proposta',
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
    caminhoFoto:{
        type: Array,
        require: false,
    },
    aprova: {
        type: Boolean,
        require: false,
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
    ins3: {
        type: Schema.Types.ObjectId,
        ref: 'pessoa',
        require: true
    },    
    ins4: {
        type: Schema.Types.ObjectId,
        ref: 'pessoa',
        require: true
    },        
    ins5: {
        type: Schema.Types.ObjectId,
        ref: 'pessoa',
        require: true
    },             
})

mongoose.model('atvAterramento', AtvAterramento)