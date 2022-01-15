const Mongoose = require("mongoose")
const Schema = Mongoose.Schema

const Documento = new Schema({  
    user: {
        type: Schema.Types.ObjectId,
        ref: 'usuario',
        require: false,
    },  
    proposta: {
        type: Schema.Types.ObjectId,
        ref: 'proposta',
        require: false,
    },     
    assinatura:{
        type: String,
        require: false
    },
    dtassinatura:{
        type: String,
        require: false
    },      
    prazo:{
        type: Number,
        require: false
    },       
    deadline:{
        type: Number,
        require: false
    },      
    contrato:{
        type: String,
        require:false  
    },
    dtcontrato:{
        type: String,
        require: false
    },      
    trt:{
        type: String,
        require: false
    },
    dttrt:{
        type: String,
        require: false
    },      
    memorial:{
        type: String,
        require: false
    },
    dtmemorial:{
        type: String,
        require: false
    },   
    sitauacao:{
        type: String,
        require: false
    },
    dtsitauacao:{
        type: String,
        require: false
    },    
    unifilar:{
        type: String,
        require: false
    },
    dtunifilar:{
        type: String,
        require: false
    },
    trifilar:{
        type: String,
        require: false
    },
    dttrifilar:{
        type: String,
        require: false
    },    
    parecer:{
        type: String,
        require: false
    },
    dtparecer:{
        type: String,
        require: false
    },    
    situacao:{
        type: String,
        require: false
    },
    dtsituacao:{
        type: String,
        require: false
    }, 
    feitotrt:{
        type: Boolean,
        require: false
    },
    protocolado:{
        type: Boolean,
        require: false
    },
    dtprotocolo:{
        type: String,
        require: false    
    },
    dtdeadline:{
        type: String,
        require: false  
    },
    aceite:{
        type: String,
        require: false
    },
    dtaceite:{
        type: String,
        require: false
    },  
    feitoaceite:{
        type: Boolean,
        require: false
    },          
    clins:{
        type: String,
        require: false
    },
    dtclins:{
        type: String,
        require: false
    },   
    vistoria:{
        type: String,
        require: false
    },
    dtvistoria:{
        type: String,
        require: false
    },    
    almoxarifado:{
        type: String,
        require: false
    },
    dtalmoxarifado:{
        type: String,
        require: false
    },  
    feitoalmox: {
        type: Boolean,
        require: false
    }, 
    enviaalmox:{
        type: Boolean,
        require: false
    },
    faturado:{
        type: Array,
        require: false,
    },
    dtfaturado:{
        type: String,
        require: false
    },  
    feitofaturado:{
        type: Boolean,
        require: false
    },  
    comprovante:{
        type: Array,
        require: false,
    },
    dtcomprovante:{
        type: String,
        require: false
    },  
    feitocomprovante:{
        type: Boolean,
        require: false
    },  
    data:{
        type: String,
        require: false
    },

})

Mongoose.model('documento', Documento)