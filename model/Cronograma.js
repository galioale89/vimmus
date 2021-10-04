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
        require: false,
        ref: 'projeto'
    },
    tarefa: {
        type: Schema.Types.ObjectId,
        require: false,
        ref: 'tarefas'
    },
    ehManutencao: {
        type: Boolean,
        require: false
    },
    nome: {
        type: String,
        require: false
    },    
    dateplaini: {
        type: String,
        require: false
    },
    agendaPlaIni: {
        type: Number,
        require: false
    },
    dateateini: {
        type: String,
        require: false
    },
    agendaAteIni: {
        type: Number,
        require: false
    },
    dateprjini: {
        type: String,
        require: false
    },
    agendaPrjIni: {
        type: Number,
        require: false
    },
    dateestini: {
        type: String,
        require: false
    },
    agendaEstIni: {
        type: Number,
        require: false
    },
    dateinvini: {
        type: String,
        require: false
    },
    agendaInvIni: {
        type: Number,
        require: false
    },
    datemodini: {
        type: String,
        require: false
    },
    agendaModIni: {
        type: Number,
        require: false
    },
    dateeaeini: {
        type: String,
        require: false
    },
    agendaEaeIni: {
        type: Number,
        require: false
    },    
    datestbini: {
        type: String,
        require: false
    },
    agendaStbIni: {
        type: Number,
        require: false
    },    
    datepnlini: {
        type: String,
        require: false
    },
    agendaPnlIni: {
        type: Number,
        require: false
    },
    datevisini: {
        type: String,
        require: false
    },
    agendaVisIni: {
        type: Number,
        require: false
    },    
    dateplafim: {
        type: String,
        require: false
    },
    plafim: {
        type: Number,
        require: false
    },    
    agendaPlaFim: {
        type: Number,
        require: false        
    },
    agendaPrjFim: {
        type: Number,
        require: false        
    },
    agendaAteFim: {
        type: Number,
        require: false        
    },
    agendaEstFim: {
        type: Number,
        require: false        
    },
    agendaModFim: {
        type: Number,
        require: false        
    },
    agendaInvFim: {
        type: Number,
        require: false        
    },
    agendaEaeFim: {
        type: Number,
        require: false        
    },
    agendaStbFim: {
        type: Number,
        require: false        
    },
    agendaPnlFim: {
        type: Number,
        require: false        
    },
    agendaVisFim: {
        type: Number,
        require: false        
    },
    dateatefim: {
        type: String,
        require: false
    },
    dateprjfim: {
        type: String,
        require: false
    },
    dateestfim: {
        type: String,
        require: false
    },
    dateinvfim: {
        type: String,
        require: false
    },
    datemodfim: {
        type: String,
        require: false
    },
    dateeaefim: {
        type: String,
        require: false
    },
    datestbfim: {
        type: String,
        require: false
    },
    datepnlfim: {
        type: String,
        require: false
    },
    datevisfim: {
        type: String,
        require: false
    },
    dateentrega: {
        type: String,
        require: false
    },
    checkPla: {
        type: String,
        require: false
    },
    checkPrj: {
        type: String,
        require: false
    },
    checkAte: {
        type: String,
        require: false
    },
    checkInv: {
        type: String,
        require: false
    },
    checkMod: {
        type: String,
        require: false
    },
    checkEst: {
        type: String,
        require: false
    },
    checkEae: {
        type: String,
        require: false
    },
    checkStb: {
        type: String,
        require: false
    },
    checkPnl: {
        type: String,
        require: false
    },
    checkVis: {
        type: String,
        require: false
    },
    datepla: {
        type: String,
        require: false
    },
    dateate: {
        type: String,
        require: false
    },
    dateprj: {
        type: String,
        require: false
    },
    dateest: {
        type: String,
        require: false
    },
    dateinv: {
        type: String,
        require: false
    },
    datemod: {
        type: String,
        require: false
    },
    dateeae: {
        type: String,
        require: false
    },
    datestb: {
        type: String,
        require: false
    },
    datepnl: {
        type: String,
        require: false
    },
    datevis: {
        type: String,
        require: false
    },
    dateEntregaReal: {
        type: String,
        require: false
    },
    atrasouPla: {
        type: Boolean,
        require: false
    },
    atrasouPrj: {
        type: Boolean,
        require: false
    },
    atrasouAte: {
        type: Boolean,
        require: false
    },    
    atrasouEst: {
        type: Boolean,
        require: false
    },    
    atrasouMod: {
        type: Boolean,
        require: false
    },    
    atrasouInv: {
        type: Boolean,
        require: false
    },    
    atrasouEae: {
        type: Boolean,
        require: false
    },    
    atrasouStb: {
        type: Boolean,
        require: false
    },    
    atrasouPnl: {
        type: Boolean,
        require: false
    },    
    atrasouVis: {
        type: Boolean,
        require: false
    },    
    atrasado:{
        type: Boolean,
        require: false
    },
    perGes:{
        type: Number,
        require: false
    },
    perKit:{
        type: Number,
        require: false
    },
    perIns:{
        type: Number,
        require: false
    },
    perPro:{
        type: Number,
        require: false
    },
    perArt:{
        type: Number,
        require: false
    },
    perAli:{
        type: Number,
        require: false
    },
    perDes:{
        type: Number,
        require: false
    },
    perHtl:{
        type: Number,
        require: false
    },
    perCmb:{
        type: Number,
        require: false
    },
    perCer:{
        type: Number,
        require: false
    }, 
    perCen:{
        type: Number,
        require: false
    },
    perPos:{
        type: Number,
        require: false
    }
})

mongoose.model('cronograma', Cronograma)