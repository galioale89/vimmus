const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ImagensTarefa = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'usuario',
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
    data: {
        type: String,
        require: false
    },
    hora: {
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

mongoose.model('imgTarefa', ImagensTarefa)