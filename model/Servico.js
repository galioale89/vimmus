const Mongoose = require("mongoose")
const Schema = Mongoose.Schema

const Servico = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'usuario',
        require: false
    },   
    descricao: {
        type: String,
        require: false
    },      
    classe:{
        type: String,
        require: false
    },
    data: {
        type: String,
        require: false
    },
})

Mongoose.model("servico", Servico)
