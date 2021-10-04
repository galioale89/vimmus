const Mongoose = require("mongoose")
const Schema = Mongoose.Schema

const Plano = new Schema({  
    user: {
        type: Schema.Types.ObjectId,
        ref: 'usuario',
        require: false,
    },  
    nome:{
        type: String,
        require: false  
    }, 
    mensalidade:{
        type: Number,
        require: false  
    },  
    fidelidade:{
        type: Number,
        require: false  
    },
    qtdini:{
        type: Number,
        require: false  
    }, 
    qtdfim:{
        type: Number,
        require: false          
    }
})

Mongoose.model('plano', Plano)