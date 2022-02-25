const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Equipe = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'usuario',
    require: true 
  },
  ehpadrao: {
    type: Boolean,
    require: false,
  },
  tarefa: {
    type: Schema.Types.ObjectId,
    ref: 'tarefas',
    require: false
  },
  obra: {
    type: Schema.Types.ObjectId,
    ref: 'tarefas',
    require: false
  },  
  insres: {
    type: Schema.Types.ObjectId,
    ref: 'pessoa',
    require: false
  },
  nome_projeto: {
    type: String,
    require: false
  },
  ativo: {
    type: Boolean,
    require: false,
  },
  nome: {
    type: String,
    require: false
  },
  nome_equipe: {
    type: String,
    require: false
  }, 
  placa: [{
    desc :{
      type: String,
      require: false
    },
    dtdes :{
      type: String,
      require: false
    },
  }],

  custoins: {
    type: Number,
    require: false
  },
  custoele: {
    type: Number,
    require: false
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
  },
  idins0: {
    type: Schema.Types.ObjectId,
    ref: 'pessoa',
    require: false
  },
  idins1: {
    type: Schema.Types.ObjectId,
    ref: 'pessoa',
    require: false
  },
  idins2: {
    type: Schema.Types.ObjectId,
    ref: 'pessoa',
    require: false
  },
  idins3: {
    type: Schema.Types.ObjectId,
    ref: 'pessoa',
    require: false
  },
  idins4: {
    type: Schema.Types.ObjectId,
    ref: 'pessoa',
    require: false
  },
  idins5: {
    type: Schema.Types.ObjectId,
    ref: 'pessoa',
    require: false
  },  
  email: {
    type: String,
    require: false
  },
  feito: {
    type: Boolean,
    require: false    
  },
  liberar: {
    type: Boolean,
    require: false    
  },
  parado: {
    type: Boolean,
    require: false    
  },
  prjfeito: {
    type: Boolean,
    require: false    
  },
  dtinicio:{
    type: String,
    require: false   
  },
  dtfim:{
    type: String,
    require: false   
  },
  dtinibusca:{
    type: Number,
    require: false   
  },  
  dtfimbusca:{
    type: Number,
    require: false   
  },
})

mongoose.model('equipe', Equipe)