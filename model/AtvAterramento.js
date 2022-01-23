const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AtvAterramento = new Schema({
    proposta: {
        type: Schema.Types.ObjectId,
        ref: 'proposta',
        require: true
    },    
    tarefa: {
        type: Schema.Types.ObjectId,
        ref: 'tarefa',
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
    caminhoFoto:{
        type: Array,
        require: false,
    },
    aprova: {
        type: Boolean,
        require: false,
    },

})

mongoose.model('atvAterramento', AtvAterramento)