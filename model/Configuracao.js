const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Config = new Schema({
    user:{
        type: Schema.Types.ObjectId,
        require: false,
    },
    slug:{
         type: String,
         require: true
    },
    potencia: {
        type: String,
        require: true,  
    },
    hrstrb: {
        type: String,
        require: true
    },       
    minatr: {
        type: Number,
        require: true
    },    
    minest: {
        type: Number,
        require: true
    },
    mininv: {
        type: Number,
        require: true
    },
    minmod: {
        type: Number,
        require: true
    },
    minstb: {
        type: Number,
        require: true
    },  
    minpnl: {
        type: Number,
        require: true
    },    
    mineae: {
        type: Number,
        require: true
    },     
    medkmh: {
        type: Number,
        require: false
    },
    markup:{
        type: Number,
        require: false
    },
    data: {
        type: Date,
        default: Date.now()
    },
    vlrhrp:{
        type: Number,
        require: false       
    },
    vlrhri:{
        type: Number,
        require: false       
    },
    vlrhrg:{
        type: Number,
        require: false    
    },
    vlrdrp:{
        type: Number,
        require: false       
    },
    vlrdri:{
        type: Number,
        require: false       
    },
    vlrdrg:{
        type: Number,
        require: false    
    },    
})

mongoose.model('configuracao', Config)