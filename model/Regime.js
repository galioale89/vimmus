const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Regime = new Schema({

    nome: {
        type: String,
        require: true
    },
    regime: {
        type: String,
        require: false
    },
    tipo: {
        type: String,
        require: false
    },
    vlrred: {
        type: Number,
        require: false
    },
    fatmed:{
        type: Number,
        require: false
    },
    alqDAS: {
        type: Number,
        require: false
    },
    alqICMS: {
        type: Number,
        require: false
    },
    alqPIS: {
        type: Number,
        require: false
    },
    alqCOFINS: {
        type: Number,
        require: false
    },
    alqIRPJ: {
        type: Number,
        require: false
    },
    alqIRPJAdd: {
        type: Number,
        require: false
    },
    alqCSLL: {
        type: Number,
        require: false
    },
    alqNFS:{
        type: Number,
        require: false
    },
    alqINSS:{
        type: Number,
        require: false
    },
    prjLR:{
        type: Number,
        require: false
    },
    prjLP:{
        type: Number,
        require: false
    },
    prjFat:{
        type: Number,
        require: false
    },
    vlrDAS:{
        type: Number,
        require: false
    },
    data: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model('regime', Regime)