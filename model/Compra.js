const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Compra = new Schema({
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
    fornecedor: {
        type: String,
        require: false
    },      
    pedido: {
        type: String,
        require: false
    },  
    dtcadastro:{
        type: String,
        require: false
    },
    nota: {
        type: String,
        require: false
    },  
    dtrecebimento:{
        type: String,
        require: false
    }, 
    data:{
        type: String,
        require: false        
    },
    feitopedido:{
        type: Boolean,
        require: false
    },
    feitonota:{
        type: Boolean,
        require: false
    }
})

mongoose.model('compra', Compra)