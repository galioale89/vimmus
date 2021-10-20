const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Investimento = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'usuario',
        require: false,
    },
    projeto: {
        type: Schema.Types.ObjectId,
        ref: 'projeto',
        require: false,
    },    
    ano1: {
        type: Number,
        require: false
    },
    ano2: {
        type: Number,
        require: false
    },
    ano3: {
        type: Number,
        require: false
    },
    ano4: {
        type: Number,
        require: false
    },
    ano5: {
        type: Number,
        require: false
    },
    ano6: {
        type: Number,
        require: false
    },
    ano7: {
        type: Number,
        require: false
    },
    ano8: {
        type: Number,
        require: false
    },
    ano9: {
        type: Number,
        require: false
    },
    ano10: {
        type: Number,
        require: false
    },
    ano11: {
        type: Number,
        require: false
    },
    ano12: {
        type: Number,
        require: false
    },
    ano13: {
        type: Number,
        require: false
    },
    ano14: {
        type: Number,
        require: false
    },
    ano15: {
        type: Number,
        require: false
    },
    ano16: {
        type: Number,
        require: false
    },
    ano17: {
        type: Number,
        require: false
    },
    ano18: {
        type: Number,
        require: false
    },
    ano19: {
        type: Number,
        require: false
    },
    ano20: {
        type: Number,
        require: false
    },
    ano21: {
        type: Number,
        require: false
    },
    ano22: {
        type: Number,
        require: false
    },
    ano23: {
        type: Number,
        require: false
    },
    ano24: {
        type: Number,
        require: false
    },
    ano25: {
        type: Number,
        require: false
    },
    parcelas: {
        type: Number,
        require: false
    },
    txjuros: {
        type: Number,
        require: false
    },    
    tma: {
        type: Number,
        require: false
    },    
    financia: {
        type: Number,
        require: false
    },
    depreciacao:{
        type: Number,
        require: false
    },
    ipca:{
        type: Number,
        require: false
    }
})

mongoose.model('investimento', Investimento)