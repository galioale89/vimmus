const { ObjectId } = require('bson')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Realizado = new Schema({
    projeto:{
        type: Schema.Types.ObjectId,
        ref: 'projeto',
        require: true 
    },
    vlrNFS:{
        type: Number,
        require: false
    },
    vlrequ:{
        type: Number,
        require: false
    },
    totint:{
        type: Number,
        require: false
    },
    totges:{
        type: Number,
        require: false
    },
    totpro:{
        type: Number,
        require: false
    },
    totdes:{
        type: Number,
        require: false
    },
    totali:{
        type: Number,
        require: false
    },
    tothtl:{
        type: Number,
        require: false
    },
    reserva:{
        type: Number,
        require: false
    },
    custoPlano:{
        type: Number,
        require: false
    },
    impmanual:{
        type: String,
        require: false
    },    
    impISS:{
        type: Number,
        require: false
    },
    impSimples:{
        type: Number,
        require: false
    },
    impIRPJ:{
        type: Number,
        require: false
    },
    impIRPJAdd:{
        type: Number,
        require: false
    },
    impCSLL:{
        type: Number,
        require: false
    },
    impPIS:{
        type: Number,
        require: false
    },
    impCOFINS:{
        type: Number,
        require: false
    },
    impICMS:{
        type: Number,
        require: false
    },
    totalImposto:{
        type: Number,
        require: false
    },
    vlrcom:{
        type: Number,
        require: false
    },
    lucroBruto: {
        type: Number,
        require: false
    },
    lbaimp:{
        type: Number,
        require:false
    },
    lucroLiquido: {
        type: Number,
        require: false
    },
    parLiqVlr:{
        type: Number,
        require: false
    },
    parIntVlr:{
        type: Number,
        require: false
    },
    parGesVlr:{
        type: Number,
        require: false
    },
    parProVlr:{
        type: Number,
        require: false
    },
    parDesVlr:{
        type: Number,
        require: false
    },
    parCmbVlr:{
        type: Number,
        require: false
    },
    parAliVlr:{
        type: Number,
        require: false
    },
    parEstVlr:{
        type: Number,
        require: false
    },
    parDedVlr:{
        type: Number,
        require: false
    },    
    parComVlr:{
        type: Number,
        require: false
    },
    parISSVlr:{
        type: Number,
        require: false
    },
    parImpVlr:{
        type: Number,
        require: false
    },    
    parLiqNfs:{
        type: Number,
        require: false
    },    
    parIntNfs:{
        type: Number,
        require: false
    },
    parGesNfs:{
        type: Number,
        require: false
    },
    parProNfs:{
        type: Number,
        require: false
    },
    parDesNfs:{
        type: Number,
        require: false
    },
    parCmbNfs:{
        type: Number,
        require: false
    },
    parAliNfs:{
        type: Number,
        require: false
    },
    parEstNfs:{
        type: Number,
        require: false
    },
    parDedNfs:{
        type: Number,
        require: false
    },     
    parComNfs:{
        type: Number,
        require: false
    },    
    parISSNfs:{
        type: Number,
        require: false
    },
    parImpNfs:{
        type: Number,
        require: false
    },
    parVlrRlz:{
       type: Boolean,
       require: false,
    },
    parNfsRlz:{
        type: Boolean,
        require: false,
    },
    varLucRlz:{
        type: Boolean,
        require: false,
    },
    varCusto:{
        type: Number,
        require: true
    },
    varLB:{
        type: Number,
        require: true
    },
    varLAI:{
        type: Number,
        require: true
    },
    varLL:{
        type: Number,
        require: true
    },
    foiRealizado:{
        type: Boolean,
        require: true
    },
    data:{
        type: String,
        require:false
    }
})

mongoose.model('realizado', Realizado)