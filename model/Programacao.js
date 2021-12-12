const Mongoose = require("mongoose")
const Schema = Mongoose.Schema

const Programacao = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'usuario',
        require: false
    },   
    usina: {
        type: Schema.Types.ObjectId,
        ref: 'usina',
        require: false
    }, 
    atividade: {
        type: Schema.Types.ObjectId,
        ref: 'atividade',
        require: false
    },       
    tipo: {
        type: String,
        require: false
    },    
    tempo: {
        type: String,
        require: false
    },      
    intervalo:{
        type: Number,
        require: false
    },
    periodoini:{
        type: Number,
        require: false
    },    
    periodofim:{
        type: Number,
        require: false
    },        
    data: {
        type: String,
        require: false
    },
})

Mongoose.model("programacao", Programacao)
