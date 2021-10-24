const { Double } = require('bson')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Componente = new Schema({
    projeto: {
        type: Schema.Types.ObjectId,
        ref: 'projeto',
        require: true
    },
    componente: {
        type: Schema.Types.ObjectId,
        ref: 'componente',
        require: true
    },   
    quantidade: {
        type: Number,
        require: true,
    },
    data: {
        type: new Date(),
        require: true
    },
})

mongoose.model('componente', Componente)