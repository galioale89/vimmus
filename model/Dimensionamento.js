const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Dimensionamento = new Schema({

    user: {
        type: Schema.Types.ObjectId,
        ref: 'usuario',
        require: false,
    },
    irradiacao:{
        type: Number,
        require: false
    },
    te: {
        type: Number,
        require: false
    },
    tusd: {
        type: Number,
        require: false
    },
    vlrkwm:{
        type: Number,
        require: false
    },
    icms: {
        type: Number,
        require: false
    },
    pis: {
        type: Number,
        require: false
    },
    cofins: {
        type: Number,
        require: false
    },
    cosip: {
        type: Number,
        require: false
    },
    ajuste: {
        type: Number,
        require: false
    },
    qtduce: {
        type: Number,
        require: false
    },
    uc11: {
        type: Number,
        require: false
    },
    uc12: {
        type: Number,
        require: false
    },
    uc13: {
        type: Number,
        require: false
    },
    uc14: {
        type: Number,
        require: false
    },
    uc15: {
        type: Number,
        require: false
    },
    uc16: {
        type: Number,
        require: false
    },
    uc17: {
        type: Number,
        require: false
    },
    uc18: {
        type: Number,
        require: false
    },
    uc19: {
        type: Number,
        require: false
    },
    uc110: {
        type: Number,
        require: false
    },
    uc111: {
        type: Number,
        require: false
    },
    uc112: {
        type: Number,
        require: false
    },
    uc21: {
        type: Number,
        require: false
    },
    uc22: {
        type: Number,
        require: false
    },
    uc23: {
        type: Number,
        require: false
    },
    uc24: {
        type: Number,
        require: false
    },
    uc25: {
        type: Number,
        require: false
    },
    uc26: {
        type: Number,
        require: false
    },
    uc27: {
        type: Number,
        require: false
    },
    uc28: {
        type: Number,
        require: false
    },
    uc29: {
        type: Number,
        require: false
    },
    uc210: {
        type: Number,
        require: false
    },
    uc211: {
        type: Number,
        require: false
    },
    uc212: {
        type: Number,
        require: false
    },
    uc31: {
        type: Number,
        require: false
    },
    uc32: {
        type: Number,
        require: false
    },
    uc33: {
        type: Number,
        require: false
    },
    uc34: {
        type: Number,
        require: false
    },
    uc35: {
        type: Number,
        require: false
    },
    uc36: {
        type: Number,
        require: false
    },
    uc37: {
        type: Number,
        require: false
    },
    uc38: {
        type: Number,
        require: false
    },
    uc39: {
        type: Number,
        require: false
    },
    uc310: {
        type: Number,
        require: false
    },
    uc311: {
        type: Number,
        require: false
    },
    uc312: {
        type: Number,
        require: false
    },
    add1: {
        type: Number,
        require: false
    },
    add2: {
        type: Number,
        require: false
    },
    add3: {
        type: Number,
        require: false
    },
    add4: {
        type: Number,
        require: false
    },
    add5: {
        type: Number,
        require: false
    },
    add6: {
        type: Number,
        require: false
    },
    add7: {
        type: Number,
        require: false
    },
    add8: {
        type: Number,
        require: false
    },
    add9: {
        type: Number,
        require: false
    },
    add10: {
        type: Number,
        require: false
    },
    add11: {
        type: Number,
        require: false
    },    
    add12: {
        type: Number,
        require: false
    },
    total1: {
        type: Number,
        require: false
    },
    total2: {
        type: Number,
        require: false
    },
    total3: {
        type: Number,
        require: false
    },
    total4: {
        type: Number,
        require: false
    },
    total5: {
        type: Number,
        require: false
    },
    total6: {
        type: Number,
        require: false
    },
    total7: {
        type: Number,
        require: false
    },
    total8: {
        type: Number,
        require: false
    },
    total9: {
        type: Number,
        require: false
    },
    total10: {
        type: Number,
        require: false
    },
    total11: {
        type: Number,
        require: false
    },    
    total12: {
        type: Number,
        require: false
    },
    consumo1: {
        type: Number,
        require: false
    },
    consumo2: {
        type: Number,
        require: false
    },
    consumo3: {
        type: Number,
        require: false
    },
    consumo4: {
        type: Number,
        require: false
    },
    consumo5: {
        type: Number,
        require: false
    },
    consumo6: {
        type: Number,
        require: false
    },
    consumo7: {
        type: Number,
        require: false
    },
    consumo8: {
        type: Number,
        require: false
    },
    consumo9: {
        type: Number,
        require: false
    },
    consumo10: {
        type: Number,
        require: false
    },
    consumo11: {
        type: Number,
        require: false
    },
    consumo12: {
        type: Number,
        require: false
    },
    totaluc1:{
        type: Number,
        require: false
    },
    totaluc2:{
        type: Number,
        require: false
    },    
    totaluc3:{
        type: Number,
        require: false
    },    
    totaladd:{
        type: Number,
        require: false
    },    
    totconsumo:{
        type: Number,
        require: false
    },   
    totfatura:{
        type: Number,
        require: false
    },     
    potencia: {
        type: Number,
        require: false        
    },
    ajupot:{
        type: Number,
        require: false                
    },
    tammod:{
        type: Number,
        require: false                
    },
    qtdmod:{
        type: Number,
        require: false                
    },
    watmod:{
        type: Number,
        require: false                
    },
    geranual:{
        type: Number,
        require: false                
    }    
})

mongoose.model('dimensionamento', Dimensionamento)