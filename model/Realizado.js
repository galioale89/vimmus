const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Realizado = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'usuario',
        require: true
    },
    projeto: {
        type: Schema.Types.ObjectId,
        ref: 'projeto',
        require: true
    },
    potencia: {
        type: Number,
        require:false        
    },
    nome: {
      type: String,
      require:false
    },
    cliente: {
        type: String,
        require:false
    },    
    dataini: {
        type: String,
        require:false
    },   
    datafim: {
        type: String,
        require:false
    },
    valDataFim: {
        type: String,
        require:false
    },    
    valor: {
        type: Number,
        require: false
    },    
    recLiquida:{
        type: Number,
        require: false
    }, 
    fatequ: {
        type: Boolean,
        require: true
    },
    vlrNFS: {
        type: Number,
        require: false
    },
    vlrequ: {
        type: Number,
        require: false
    },
    vlrkit: {
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
    valorEbt: {
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
    totint: {
        type: Number,
        require: false
    },
    toteng: {
        type: Number,
        require: false
    },    
    totges: {
        type: Number,
        require: false
    },
    totpro: {
        type: Number,
        require: false
    },
    vlrart: {
        type: Number,
        require: false
    },    
    totdes: {
        type: Number,
        require: false
    },
    totali: {
        type: Number,
        require: false
    },
    tothtl: {
        type: Number,
        require: false
    },
    totcmb: {
        type: Number,
        require: false
    },    
    totpnl:{
        type: Number,
        require: false
    },    
    toteae:{
        type: Number,
        require: false
    },  
    matate:{
        type: Number,
        require: false
    },
    vlremp:{
        type: Number,
        require: false
    },   
    compon:{
        type: Number,
        require: false
    },        
    custofix: {
        type: Number,
        require: false
    },
    custovar: {
        type: Number,
        require: false
    },
    custoest: {
        type: Number,
        require: false
    },         
    custoPlano: {
        type: Number,
        require: false
    },
    impmanual: {
        type: String,
        require: false
    },
    impISS: {
        type: Number,
        require: false
    },
    impSimples: {
        type: Number,
        require: false
    },
    impIRPJ: {
        type: Number,
        require: false
    },
    impIRPJAdd: {
        type: Number,
        require: false
    },
    impCSLL: {
        type: Number,
        require: false
    },
    impPIS: {
        type: Number,
        require: false
    },
    impCOFINS: {
        type: Number,
        require: false
    },
    impICMS: {
        type: Number,
        require: false
    },
    totalTributos: {
        type: Number,
        require: false
    },    
    totalImposto: {
        type: Number,
        require: false
    },
    vlrcom: {
        type: Number,
        require: false
    },
    lucroBruto: {
        type: Number,
        require: false
    },
    desAdm: {
        type: Number,
        require: false
    },    
    lbaimp: {
        type: Number,
        require: false
    },
    lucroLiquido: {
        type: Number,
        require: false
    },
    parLiqVlr: {
        type: Number,
        require: false
    },
    parKitVlr: {
        type: Number,
        require: false
    },
    parIntVlr: {
        type: Number,
        require: false
    },
    parGesVlr: {
        type: Number,
        require: false
    },
    parProVlr: {
        type: Number,
        require: false
    },
    parArtVlr: {
        type: Number,
        require: false
    },    
    parDesVlr: {
        type: Number,
        require: false
    },
    parCmbVlr: {
        type: Number,
        require: false
    },
    parAliVlr: {
        type: Number,
        require: false
    },
    parEstVlr: {
        type: Number,
        require: false
    },
    parDedVlr: {
        type: Number,
        require: false
    },
    parComVlr: {
        type: Number,
        require: false
    },
    parISSVlr: {
        type: Number,
        require: false
    },
    parImpVlr: {
        type: Number,
        require: false
    },
    parLiqNfs: {
        type: Number,
        require: false
    },
    parKitNfs: {
        type: Number,
        require: false
    },    
    parIntNfs: {
        type: Number,
        require: false
    },
    parGesNfs: {
        type: Number,
        require: false
    },
    parProNfs: {
        type: Number,
        require: false
    },
    parArtNfs: {
        type: Number,
        require: false
    },    
    parDesNfs: {
        type: Number,
        require: false
    },
    parCmbNfs: {
        type: Number,
        require: false
    },
    parAliNfs: {
        type: Number,
        require: false
    },
    parEstNfs: {
        type: Number,
        require: false
    },
    parDedNfs: {
        type: Number,
        require: false
    },
    parComNfs: {
        type: Number,
        require: false
    },
    parISSNfs: {
        type: Number,
        require: false
    },
    parImpNfs: {
        type: Number,
        require: false
    },
    parVlrRlz: {
        type: Boolean,
        require: false,
    },
    parNfsRlz: {
        type: Boolean,
        require: false,
    },
    varLucRlz: {
        type: Boolean,
        require: false,
    },
    varCusto: {
        type: Number,
        require: true
    },
    varTI: {
        type: Number,
        require: true
    },    
    varLAI: {
        type: Number,
        require: true
    },
    varLL: {
        type: Number,
        require: true
    },
    foiRealizado: {
        type: Boolean,
        require: true
    },
    datapadrao: {
        type: Date,
        default: Date.now()
     },    
    datareg: {
        type: Number,
        require: false
    },
    data: {
        type: String,
        require: false
    }
})

mongoose.model('realizado', Realizado)