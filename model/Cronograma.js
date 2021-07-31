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
    nome: {
        type: String,
        require: true
    },
    dateplaini: {
        type: String,
        require: true
    },
    agendaPlaIni: {
        type: Number,
        require: true
    },
    dateateini: {
        type: String,
        require: true
    },
    agendaAteIni: {
        type: Number,
        require: true
    },
    dateprjini: {
        type: String,
        require: true
    },
    agendaPrjIni: {
        type: Number,
        require: true
    },
    dateestini: {
        type: String,
        require: true
    },
    agendaEstIni: {
        type: Number,
        require: true
    },
    dateinvini: {
        type: String,
        require: true
    },
    agendaInvIni: {
        type: Number,
        require: true
    },
    datemodini: {
        type: String,
        require: true
    },
    agendaModIni: {
        type: Number,
        require: true
    },
    dateeaeini: {
        type: String,
        require: true
    },
    agendaEaeIni: {
        type: Number,
        require: true
    },    
    datestbini: {
        type: String,
        require: true
    },
    agendaStbIni: {
        type: Number,
        require: true
    },    
    datepnlini: {
        type: String,
        require: true
    },
    agendaPnlIni: {
        type: Number,
        require: true
    },
    datevisini: {
        type: String,
        require: true
    },
    agendaVisIni: {
        type: Number,
        require: true
    },    
    dateplafim: {
        type: String,
        require: true
    },
    plafim: {
        type: Number,
        require: true
    },    
    agendaPlaFim: {
        type: Number,
        require: true        
    },
    agendaPrjFim: {
        type: Number,
        require: true        
    },
    agendaAteFim: {
        type: Number,
        require: true        
    },
    agendaEstFim: {
        type: Number,
        require: true        
    },
    agendaModFim: {
        type: Number,
        require: true        
    },
    agendaInvFim: {
        type: Number,
        require: true        
    },
    agendaEaeFim: {
        type: Number,
        require: true        
    },
    agendaStbFim: {
        type: Number,
        require: true        
    },
    agendaPnlFim: {
        type: Number,
        require: true        
    },
    agendaVisFim: {
        type: Number,
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
    atrasado:{
        type: Boolean,
        require: true
    },
    perGes:{
        type: Number,
        require: true
    },
    perKit:{
        type: Number,
        require: true
    },
    perIns:{
        type: Number,
        require: true
    },
    perPro:{
        type: Number,
        require: true
    },
    perArt:{
        type: Number,
        require: true
    },
    perAli:{
        type: Number,
        require: true
    },
    perDes:{
        type: Number,
        require: true
    },
    perHtl:{
        type: Number,
        require: true
    },
    perCmb:{
        type: Number,
        require: true
    },
    perCer:{
        type: Number,
        require: true
    }, 
    perCen:{
        type: Number,
        require: true
    },
    perPos:{
        type: Number,
        require: true
    }
})

mongoose.model('cronograma', Cronograma)