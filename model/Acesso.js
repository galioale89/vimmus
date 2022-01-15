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
    }
})

Mongoose.model("acesso", Acesso)
