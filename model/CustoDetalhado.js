const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Detalhado = new Schema({

    projeto: {
        type: Schema.Types.ObjectId,
        ref: 'projeto',
        require: true,
    },
    checkUni: {
        type: String,
        require: false,
    },
    unidadeEqu: {
        type: Number,
        require: false
    },    
    unidadeMod: {
        type: Number,
        require: false
    },    
    unidadeInv: {
        type: Number,
        require: false
    },            
    unidadeEst: {
        type: Number,
        require: false
    },
    unidadeCim: {
        type: Number,
        require: false
    },    
    unidadeCab: {
        type: Number,
        require: false
    },    
    unidadeDisCC: {
        type: Number,
        require: false
    },
    unidadeDPSCC: {
        type: Number,
        require: false
    },    
    unidadeDisCA: {
        type: Number,
        require: false
    },
    unidadeDPSCA: {
        type: Number,
        require: false
    },      
    unidadeSB: {
        type: Number,
        require: false
    }, 
    unidadeCCA: {
        type: Number,
        require: false
    },        
    unidadeOcp: {
        type: Number,
        require: false
    },    
    unidadeCer: {
        type: Number,
        require: false
    },    
    unidadeCen: {
        type: Number,
        require: false
    },    
    unidadePos: {
        type: Number,
        require: false
    },
    vlrUniEqu: {
        type: Number,
        require: false
    },
    vlrUniMod: {
        type: Number,
        require: false
    },    
    vlrUniInv: {
        type: Number,
        require: false
    },
    vlrUniEst: {
        type: Number,
        require: false
    },  
    vlrUniCim: {
        type: Number,
        require: false
    },      
    vlrUniCab: {
        type: Number,
        require: false
    },   
    vlrUniDisCC: {
        type: Number,
        require: false
    },
    vlrUniDPSCC: {
        type: Number,
        require: false
    },     
    vlrUniDisCA: {
        type: Number,
        require: false
    },
    vlrUniDPSCA: {
        type: Number,
        require: false
    },         
    vlrUniSB: {
        type: Number,
        require: false
    },  
    vlrUniCCA: {
        type: Number,
        require: false
    },             
    vlrUniOcp: {
        type: Number,
        require: false
    },
    vlrUniCer: {
        type: Number,
        require: false
    },
    vlrUniCen: {
        type: Number,
        require: false
    },     
    vlrUniPos: {
        type: Number,
        require: false
    },    
    valorEqu: {
        type: Number,
        require: false
    },
    valorMod: {
        type: Number,
        require: false
    },   
    valorInv: {
        type: Number,
        require: false
    },    
    valorEst: {
        type: Number,
        require: false
    },
    valorCim: {
        type: Number,
        require: false
    },    
    valorCab: {
        type: Number,
        require: false
    },
    valorDisCC: {
        type: Number,
        require: false
    },
    valorDPSCC: {
        type: Number,
        require: false
    },    
    valorDisCA: {
        type: Number,
        require: false
    },
    valorDPSCA: {
        type: Number,
        require: false
    },        
    valorSB: {
        type: Number,
        require: false
    },
    valorCCA: {
        type: Number,
        require: false
    },    
    valorOcp: {
        type: Number,
        require: false
    },
    valorCer: {
        type: Number,
        require: false
    },
    valorCen: {
        type: Number,
        require: false
    },    
    valorPos: {
        type: Number,
        require: false
    },    
    vlrTotal: {
        type: Number,
        require: false
    },
    unidadeEbt:{
        type: Number,
        require: false
    },
    vlrUniEbt:{
        type: Number,
        require: false
    }, 
    valorEbt:{
        type: Number,
        require: false
    },        
})

mongoose.model('custoDetalhado', Detalhado)

