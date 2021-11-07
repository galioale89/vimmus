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
    trt:{
        type: String,
        require: false
    },
    dttrt:{
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
        type: String,
        require: false
    },
    dtfaturado:{
        type: String,
        require: false
    },  
    feitofaturado:{
        type: Boolean,
        require: false
    },         
    data:{
        type: String,
        require: false
    },

})

Mongoose.model('documento', Documento)