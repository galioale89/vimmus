const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Imagem = new Schema({
    filename: {
        type: String,
        required: true
    },
    originalname: {
        type: String,
        require: true
    },
},
    {
        timestamps: true
    })

    mongoose.model('imagem', Imagem)
