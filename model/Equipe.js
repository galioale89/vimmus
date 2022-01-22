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
  projeto: {
    type: Schema.Types.ObjectId,
    ref: 'projeto',
    require: false
  },
  tarefa: {
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
  ele0: {
    type: String,
    require: false
  },
  ele1: {
    type: String,
    require: false
  },
  ele2: {
    type: String,
    require: false
  },
  ele3: {
    type: String,
    require: false
  },
  ele4: {
    type: String,
    require: false
  },
  ele5: {
    type: String,
    require: false
  },
  pla0: {
    type: String,
    require: false
  },
  pla1: {
    type: String,
    require: false
  },
  pla2: {
    type: String,
    require: false
  },
  pla3: {
    type: String,
    require: false
  },
  pla4: {
    type: String,
    require: false
  },
  pla5: {
    type: String,
    require: false
  },
  pro0: {
    type: String,
    require: false
  },
  pro1: {
    type: String,
    require: false
  },
  pro2: {
    type: String,
    require: false
  },
  pro3: {
    type: String,
    require: false
  },
  pro4: {
    type: String,
    require: false
  },
  pro5: {
    type: String,
    require: false
  },
  ate0: {
    type: String,
    require: false
  },
  ate1: {
    type: String,
    require: false
  },
  ate2: {
    type: String,
    require: false
  },
  ate3: {
    type: String,
    require: false
  },
  ate4: {
    type: String,
    require: false
  },
  ate5: {
    type: String,
    require: false
  },
  inv0: {
    type: String,
    require: false
  },
  inv1: {
    type: String,
    require: false
  },
  inv2: {
    type: String,
    require: false
  },
  inv3: {
    type: String,
    require: false
  },
  inv4: {
    type: String,
    require: false
  },
  inv5: {
    type: String,
    require: false
  },
  eae0: {
    type: String,
    require: false
  },
  eae1: {
    type: String,
    require: false
  },
  eae2: {
    type: String,
    require: false
  },
  eae3: {
    type: String,
    require: false
  },
  eae4: {
    type: String,
    require: false
  },
  eae5: {
    type: String,
    require: false
  },
  pnl0: {
    type: String,
    require: false
  },
  pnl1: {
    type: String,
    require: false
  },
  pnl2: {
    type: String,
    require: false
  },
  pnl3: {
    type: String,
    require: false
  },
  pnl4: {
    type: String,
    require: false
  },
  pnl5: {
    type: String,
    require: false
  },
  vis0: {
    type: String,
    require: false
  },
  vis1: {
    type: String,
    require: false
  },
  vis2: {
    type: String,
    require: false
  },
  vis3: {
    type: String,
    require: false
  },
  vis4: {
    type: String,
    require: false
  },
  vis5: {
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