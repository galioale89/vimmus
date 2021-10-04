const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Estoque = new Schema({
    componente:{
        type: Schema.Types.ObjectId,
        require: true
    },
    fornecedor:{
        type: Schema.Types.ObjectId,
        require: true
    },
    quantidade:{
        type: Decimal128,
        require: true
    },
    precomedio:{
        type: Decimal128,
        require: true,
    },
    data:{
       type: Date,
       require: true
    }
})
mongoose.model('estoque', Estoque)