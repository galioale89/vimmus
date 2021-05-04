const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Regime = new Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: 'usuario',
        require: false,
    },
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
        type: String,
        require: false
    },
    fatmed:{
        type: String,
        require: false
    },
    alqDAS: {
        type: String,
        require: false
    },
    alqICMS: {
        type: String,
        require: false
    },
    alqPIS: {
        type: String,
        require: false
    },
    alqCOFINS: {
        type: String,
        require: false
    },
    alqIRPJ: {
        type: String,
        require: false
    },
    alqIRPJAdd: {
        type: String,
        require: false
    },
    alqCSLL: {
        type: String,
        require: false
    },
    alqNFS:{
        type: String,
        require: false
    },
    alqINSS:{
        type: String,
        require: false
    },
    prjLR:{
        type: String,
        require: false
    },
    prjLP:{
        type: String,
        require: false
    },
    prjFat:{
        type: String,
        require: false
    },
    vlrDAS:{
        type: String,
        require: false
    },
    data: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model('regime', Regime)