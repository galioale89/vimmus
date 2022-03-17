const Mongoose = require("mongoose")
const Schema = Mongoose.Schema

const Acesso = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'usuario',
        require: false
    },   
    pessoa: {
        type: Schema.Types.ObjectId,
        ref: 'pessoa',
        require: false
    },      
    usuario: {
        type: String,
        require: false
    },
    senha: {
        type: String,
        require: false
    },
    ehAdmin: {
        type: Number,
        default: 3
    },
    funges:{
        type: Boolean,
        require: false
    },
    orcamentista:{
        type: Boolean,
        require: false
    },
    vendedor:{
        type: Boolean,
        require: false
    },
    instalador:{
        type: Boolean,
        require: false
    },    
    data: {
        type: String,
        require: false
    },
    datalib: {
        type: String,
        require: false
    },
    dataexp: {
        type: String,
        require: false
    },
    notpro: {
        type: String,
        require: false
    },
    notobs: {
        type: String,
        require: false
    },
    notvis: {
        type: String,
        require: false
    },     
    notorc: {
        type: String,
        require: false
    },  
    notins: {
        type: String,
        require: false
    },  
    notgan: {
        type: String,
        require: false
    },   
    notped: {
        type: String,
        require: false
    },   
})

Mongoose.model("acesso", Acesso)
