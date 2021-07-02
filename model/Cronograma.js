const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Cronograma = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'usuario',
        require: false,
    },
    projeto: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: 'projeto'
    },
    dateplaini: {
        type: String,
        require: true
    },
    dateateini: {
        type: String,
        require: true
    },
    dateprjini: {
        type: String,
        require: true
    },
    dateestini: {
        type: String,
        require: true
    },
    dateinvini: {
        type: String,
        require: true
    },
    datemodini: {
        type: String,
        require: true
    },
    dateeaeini: {
        type: String,
        require: true
    },
    datestbini: {
        type: String,
        require: true
    },
    datepnlini: {
        type: String,
        require: true
    },
    datevisini: {
        type: String,
        require: true
    },
    dateplafim: {
        type: String,
        require: true
    },
    dateatefim: {
        type: String,
        require: true
    },
    dateprjfim: {
        type: String,
        require: true
    },
    dateestfim: {
        type: String,
        require: true
    },
    dateinvfim: {
        type: String,
        require: true
    },
    datemodfim: {
        type: String,
        require: true
    },
    dateeaefim: {
        type: String,
        require: true
    },
    datestbfim: {
        type: String,
        require: true
    },
    datepnlfim: {
        type: String,
        require: true
    },
    datevisfim: {
        type: String,
        require: true
    },
    dateentrega: {
        type: String,
        require: true
    },
    checkPla: {
        type: String,
        require: true
    },
    checkPrj: {
        type: String,
        require: true
    },
    checkAte: {
        type: String,
        require: true
    },
    checkInv: {
        type: String,
        require: true
    },
    checkMod: {
        type: String,
        require: true
    },
    checkEst: {
        type: String,
        require: true
    },
    checkEae: {
        type: String,
        require: true
    },
    checkStb: {
        type: String,
        require: true
    },
    checkPnl: {
        type: String,
        require: true
    },
    checkVis: {
        type: String,
        require: true
    },
    datepla: {
        type: String,
        require: true
    },
    dateate: {
        type: String,
        require: true
    },
    dateprj: {
        type: String,
        require: true
    },
    dateest: {
        type: String,
        require: true
    },
    dateinv: {
        type: String,
        require: true
    },
    datemod: {
        type: String,
        require: true
    },
    dateeae: {
        type: String,
        require: true
    },
    datestb: {
        type: String,
        require: true
    },
    datepnl: {
        type: String,
        require: true
    },
    datevis: {
        type: String,
        require: true
    },
    dateEntregaReal: {
        type: String,
        require: true
    },
    atrasouPla: {
        type: Boolean,
        require: true
    },
    atrasouPrj: {
        type: Boolean,
        require: true
    },
    atrasouAte: {
        type: Boolean,
        require: true
    },    
    atrasouEst: {
        type: Boolean,
        require: true
    },    
    atrasouMod: {
        type: Boolean,
        require: true
    },    
    atrasouInv: {
        type: Boolean,
        require: true
    },    
    atrasouEae: {
        type: Boolean,
        require: true
    },    
    atrasouStb: {
        type: Boolean,
        require: true
    },    
    atrasouPnl: {
        type: Boolean,
        require: true
    },    
    atrasouVis: {
        type: Boolean,
        require: true
    },    
})

mongoose.model('cronograma', Cronograma)