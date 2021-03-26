const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Equipe = new Schema({
  projeto: {
    type: Schema.Types.ObjectId,
    ref: 'projeto',
    require: true
  },
  nome: {
    type: String,
    require: true
  },
  ins0: {
    type: String,
    require: false
  },
  ins1: {
    type: String,
    require: false
  },
  ins2: {
    type: String,
    require: false
  }  
  /*
  ins0: {
    type: Schema.Types.ObjectId,
    ref: 'pessoa',
    require: false
  },
  ins1: {
    type: Schema.Types.ObjectId,
    ref: 'pessoa',
    require: false
  },
  ins2: {
    type: Schema.Types.ObjectId,
    ref: 'pessoa',
    require: false
  }
  */
})

mongoose.model('equipe', Equipe)