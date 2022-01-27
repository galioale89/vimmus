const Mongoose = require("mongoose")
const Schema = Mongoose.Schema

const Vistoria = new Schema({
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
    projeto: {
        type: Schema.Types.ObjectId,
        ref: 'projeto',
        require: false,
    },
    tecnico: {
        type: Schema.Types.ObjectId,
        ref: 'pessoa',
        require: false,
    },
    caminhoInsi: [{
        desc: {
            type: String,
            require: false,
        },
        data: {
            type: String,
            require: false,
        }
    }],
    caminhoInsa: [{
        desc: {
            type: String,
            require: false,
        },
        data: {
            type: String,
            require: false,
        }        
    }],
    caminhoSomb: [{
        desc: {
            type: String,
            require: false,
        },
        data: {
            type: String,
            require: false,
        }           
    }],
    caminhoArea: [{
        desc: {
            type: String,
            require: false,
        },
        data: {
            type: String,
            require: false,
        }           
    }],
    aprovaInsi: {
        type: Boolean,
        require: false
    },
    aprovaInsa: {
        type: Boolean,
        require: false
    },    
    aprovaSomb: {
        type: Boolean,
        require: false
    },      
    aprovaArea: {
        type: Boolean,
        require: false
    },       
    feito: {
        type: Boolean,
        require: false
    },
    dtvisita: {
        type: String,
        require: false
    },    
})

Mongoose.model('vistoria', Vistoria)