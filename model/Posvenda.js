const Mongoose = require("mongoose")
const Schema = Mongoose.Schema

const Posvenda = new Schema({  
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
    config:{
        type: String,
        require: false
    },    
    demo:{
        type: String,
        require: false
    },    
    leitura:{
        type: String,
        require: false
    },   
    laudo:{
        type: String,
        require: false
    }, 
    feito: {
        type: Boolean,
        require: false
    },
    data:{
        type: String,
        require: false
    }
})

Mongoose.model('posvenda', Posvenda)