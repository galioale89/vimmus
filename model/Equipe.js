const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Equipe = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'usuario',
    require: false
  },
  projeto: {
    type: Schema.Types.ObjectId,
    ref: 'projeto',
    require: true
  },
  ativo:{
    type: Boolean,
    require: false,
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
  },
  ins3: {
    type: String,
    require: false
  },
  ins4: {
    type: String,
    require: false
  },
  ins5: {
    type: String,
    require: false
  }
})

mongoose.model('equipe', Equipe)