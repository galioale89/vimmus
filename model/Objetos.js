const { ObjectId } = require('bson')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Objetos = new Schema({

    projeto:{
        type: Schema.Types.ObjectId,
        ref: 'projeto',
        require: false
    },
    regime_lista:{
       type: Schema.Types.ObjectId,
       ref: 'regime',
       require: false
    },
    regime_atual:{
        type: Schema.Types.ObjectId,
        ref: 'regime',
        require: false 
    },
    configuracao:{
        type: Schema.Types.ObjectId,
        ref: 'configuracao',
        require: false
    },
    pessoa_lista:{
        type: Schema.Types.ObjectId,
        ref: 'pessoa',
        require: false
    },
    pessoa_atual:{
         type: Schema.Types.ObjectId,
         ref: 'pessoa',
         require: false
    },
    realizado:{
        type: Schema.Types.ObjectId,
        ref: 'realziado',
        require: false
    }
})

mongoose.model('objetos', Objetos)