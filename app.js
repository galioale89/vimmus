const express = require('express')
const app = express()

var AWS = require('aws-sdk');
// import AWS object without services
var AWS = require('aws-sdk/global');
// import individual service
var S3 = require('aws-sdk/clients/s3');

// // Enable CORS
// app.use(function(req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//   next();
// });

//const handlebars = require('express-handlebars')
const { engine } = require( 'express-handlebars' )
const bodyParser = require('body-parser')
const path = require("path")
const mongoose = require('mongoose')

const session = require('express-session')
const flash = require('connect-flash')

const customdo = require("./routes/customdo")
const configuracao = require("./routes/configuracao")
const projeto = require('./routes/projeto')
const gerenciamento = require('./routes/gerenciamento')
const pessoa = require('./routes/pessoa')
const cliente = require('./routes/cliente')
const usuario = require('./routes/usuario')
const administrador = require('./routes/administrador')
const relatorios = require('./routes/relatorios')
const componente = require('./routes/componente')
const fornecedor = require('./routes/fornecedor')

const naoVazio = require('./resources/naoVazio')
const dataBusca = require('./resources/dataBusca')
const comparaDatas = require('./resources/comparaDatas')
const validaCronograma = require('./resources/validaCronograma')
const liberaRecursos = require('./resources/liberaRecursos')
const setData = require('./resources/setData')
const dataMensagem = require('./resources/dataMensagem')
const dataHoje = require('./resources/dataHoje')
const { ehAdmin } = require('./helpers/ehAdmin')
require('./model/Posvenda')


const Proposta = mongoose.model('proposta')
const Cliente = mongoose.model('cliente')
const Pessoa = mongoose.model('pessoa')
const Documento = mongoose.model('documento')
const Compra = mongoose.model('compra')
const Vistoria = mongoose.model('vistoria')
const Equipe = mongoose.model('equipe')
const Posvenda = mongoose.model('posvenda')

//Chamando função de validação de autenticação do usuário pela função passport
const passport = require("passport")
require("./config/auth")(passport)
//Configuração
//Sessions
app.use(session({
  secret: "vimmusapp",
  resave: true,
  saveUninitialized: true
}))
//Inicializa passport - login
app.use(passport.initialize())
app.use(passport.session())

//Flash
app.use(flash())

//Middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.aviso_msg = req.flash('aviso_msg')
  res.locals.error = req.flash("error")
  res.locals.user = req.user || null
  next()
})

//Body-Parser
app.use(express.json())
app.use(express.urlencoded({ 
  extended: true 
}))
//Handlebars
app.disable( 'x-powered-by' )
app.engine( 'handlebars', engine({defaultLayout: 'main'}))
 //app.engine('handlebars', handlebars({ defaulLayout: "main" }))
 app.set('view engine', 'handlebars')


// Essa linha faz o servidor disponibilizar o acesso às imagens via URL!
app.use(express.static('public/'))

//Mongoose DB
mongoose.Promise = global.Promise
mongoose.connect('mongodb://vimmus01:64l10770@mongo71-farm10.kinghost.net/vimmus01', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Sucesso ao se conectar no Mongo")
}).catch((errr) => {
  console.log("Falha ao se conectar no Mongo")
})

//Public para CSS do bootstrap
app.use(express.static(path.join(__dirname, 'public')))

//Função passport para logout
app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
})

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/politica', (req, res) => {
  res.render('politica')
})

app.get('/termo', (req, res) => {
  res.render('termo')
})

//Direcionando para página principal
app.get('/menu', ehAdmin, (req, res) => {

  const { _id } = req.user
  const { user } = req.user
  const { ehAdmin } = req.user
  const { funges } = req.user
  const { pessoa } = req.user
  const { nome } = req.user
  const { owner } = req.user

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }

  var saudacao

  var hoje = dataHoje()
  var data1 = 0
  var data2 = 0
  var compara = 0
  var days = 0
  var dif = 0
  //console.log('owner=>'+owner)

  var numprj = 0

  //console.log(id)
  var q = 0
  var listaOrcado = []
  var listaAberto = []
  var listaEncerrado = []
  var notpro = []
  var atrasado = []
  var deadlineIns = []
  var status = ''
  var dtcadastro = ''
  var dtvalidade = ''
  var qtdorcado = 0
  var qtdaberto = 0
  var qtdencerrado = 0
  var qtdbaixado = 0

  var qtdfim = 0
  var qtdpos = 0
  var qtdfat = 0
  var qtdalx = 0
  var qtdass = 0
  var qtdequ = 0
  var qtdpcl = 0
  var qtdtrt = 0
  var qtdnot = 0
  var qtdped = 0
  var qtdvis = 0
  var qtdpro = 0
  var saudacao
  var responsavel

  if (ehAdmin == 0) {
    ehMaster = true
  } else {
    ehMaster = false
  }

  var data = new Date()
  var hora = data.getHours()

  if (hora >= 18 && hora <= 24) {
    saudacao = 'Boa Noite '
  }
  if (hora >= 12 && hora < 18) {
    saudacao = 'Boa tarde '
  }
  if (hora >= 0 && hora < 12) {
    saudacao = 'Bom dia '
  }

  Proposta.find({ user: id }).sort({ data: 'asc' }).then((todasProposta) => {
    if (todasProposta != '') {
      todasProposta.forEach((e) => {
        dtcadastro = ''
        dtvalidade = ''
        status = ''
        Proposta.findOne({ _id: e._id }).then((proposta) => {
          Cliente.findOne({ _id: e.cliente }).then((cliente) => {
            Documento.findOne({ proposta: e._id }).then((documento) => {
              Compra.findOne({ proposta: e._id }).then((compra) => {
                Vistoria.findOne({ proposta: e._id }).then((vistoria) => {
                  Equipe.findOne({ _id: e.equipe }).then((equipe) => {
                    Posvenda.findOne({ proposta: e._id }).then((posvenda) => {
                      Pessoa.findOne({ _id: e.responsavel }).then((pesso_res) => {
                        q++
                        //console.log('e._id=>' + e._id)
                        if (naoVazio(proposta.dtcadastro6)) {
                          dtcadastro = proposta.dtcadastro6
                          dtvalidade = proposta.dtvalidade6
                        } else {
                          if (naoVazio(proposta.dtcadastro5)) {
                            dtcadastro = proposta.dtcadastro5
                            dtvalidade = proposta.dtvalidade5
                          } else {
                            if (naoVazio(proposta.dtcadastro4)) {
                              dtcadastro = proposta.dtcadastro4
                              dtvalidade = proposta.dtvalidade4
                            } else {
                              if (naoVazio(proposta.dtcadastro3)) {
                                dtcadastro = proposta.dtcadastro3
                                dtvalidade = proposta.dtvalidade3
                              } else {
                                if (naoVazio(proposta.dtcadastro2)) {
                                  dtcadastro = proposta.dtcadastro2
                                  dtvalidade = proposta.dtvalidade2
                                } else {
                                  if (naoVazio(proposta.dtcadastro1)) {
                                    dtcadastro = proposta.dtcadastro1
                                    dtvalidade = proposta.dtvalidade1
                                  } else {
                                    dtcadastro = '0000-00-00'
                                    dtvalidade = '0000-00-00'
                                  }
                                }
                              }
                            }
                          }
                        }

                        //console.log('documento.protocolado=>' + documento.protocolado)
                        //console.log('posvenda.feito=>' + posvenda.feito)
                        //console.log('documento.feitofaturado=>' + documento.feitofaturado)
                        //console.log('documento.feitoalmox=>' + documento.feitoalmox)
                        //console.log('documento.enviaalmox=>' + documento.enviaalmox)
                        //console.log('equipe.feito=>' + equipe.feito)
                        //console.log('documento.feitotrt=>' + documento.feitotrt)
                        //console.log('compra.feitonota=>' + compra.feitonota)
                        //console.log('compra.feitopedido=>' + compra.feitopedido)
                        //console.log('proposta.assinado=>' + proposta.assinado)
                        //console.log('vistoria.feito=>' + vistoria.feito)



                        if (pesso_res != null && typeof pesso_res != 'undefined') {
                          responsavel = pesso_res.nome
                        } else {
                          responsavel = ''
                        }
                        //console.log('responsavel=>'+responsavel)
                        //console.log('pessoa responsavel=>' + pessoa)
                        if (proposta.ganho == true) {
                          if (proposta.encerrado == true) {
                            status = 'Encerrado'
                            qtdfim++
                            qtdencerrado++
                            listaEncerrado.push({ proposta: proposta.seq, status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                          } else {
                            if (posvenda.feito == true) {
                              status = 'Pós-Venda'
                              qtdpos++
                              qtdaberto++
                              listaAberto.push({proposta: proposta.seq, status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                            } else {
                              if (documento.feitofaturado == true) {
                                status = 'Faturado'
                                qtdfat++
                                qtdaberto++
                                listaAberto.push({ proposta: proposta.seq, status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                              } else {
                                if (documento.feitoalmox == true) {
                                  status = 'Almoxarifado Fechado'
                                  qtdalx++
                                  listaAberto.push({ proposta: proposta.seq, status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                } else {
                                  if (documento.enviaalmox == true) {
                                    status = 'Almoxarifado Em Aberto'
                                    qtdalx++
                                    qtdaberto++
                                    listaAberto.push({ proposta: proposta.seq, status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                  } else {
                                    if (equipe.feito == true) {
                                      status = 'Execução a Campo'
                                      qtdequ++
                                      qtdaberto++
                                      listaAberto.push({ proposta: proposta.seq, status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                    } else {
                                      if (documento.protocolado == true) {
                                        status = 'Protocolado'
                                        qtdpcl++
                                        qtdaberto++
                                        listaAberto.push({ proposta: proposta.seq, status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                      } else {
                                        if (documento.feitotrt == true) {
                                          status = 'TRT'
                                          qtdtrt++
                                          qtdaberto++
                                          listaAberto.push({ proposta: proposta.seq, status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                        } else {
                                          if (compra.feitonota == true) {
                                            status = 'NF'
                                            qtdnot++
                                            qtdaberto++
                                            listaAberto.push({ proposta: proposta.seq, status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                          } else {
                                            if (compra.feitopedido == true) {
                                              status = 'Pedido'
                                              qtdped++
                                              qtdaberto++
                                              listaAberto.push({ proposta: proposta.seq, status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                            } else {
                                              if (proposta.assinado == true) {
                                                status = 'Assinado'
                                                qtdass++
                                                qtdaberto++
                                                listaAberto.push({ proposta: proposta.seq, status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                              } else {
                                                if (vistoria.feito == true) {
                                                  status = 'Visita'
                                                  qtdvis++
                                                  qtdaberto++
                                                  listaAberto.push({ proposta: proposta.seq, status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                                } else {
                                                  status = 'Preparado para a Visita'
                                                  qtdpro++
                                                  qtdaberto++
                                                  listaAberto.push({ proposta: proposta.seq, status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        } else {
                          if (proposta.baixada == false) {
                            status = 'Proposta Enviada'
                            qtdpro++
                            qtdorcado++
                            listaOrcado.push({ proposta: proposta.seq, status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                          }else{
                            qtdbaixado++
                          }
                        }


                        //console.log('proposta.ganho=>' + proposta.ganho)
                        //console.log('e._id=>' + e._id)
                        if (proposta.ganho == false && proposta.baixada == false) {
                          //console.log('dtvalidade=>' + dtvalidade)
                          if (dtvalidade != '0000-00-00') {
                            data1 = new Date(dtvalidade)
                            data2 = new Date(hoje)
                            //console.log('data1=>' + data1)
                            //console.log('data2=>' + data2)
                            dif = Math.abs(data2.getTime() - data1.getTime())
                            // //console.log('dif=>'+dif)
                            days = Math.ceil(dif / (1000 * 60 * 60 * 24))
                            if (data1.getTime() < data2.getTime()){
                              days = days * -1
                            }
                            // //console.log('days=>' + days)
                            if (days == 1 || days == 0) {
                              notpro.push({ proposta: proposta.seq, id: proposta._id, status: proposta.status, cliente: cliente.nome, telefone: cliente.celular, cadastro: dataMensagem(dtcadastro), validade: dataMensagem(dtvalidade) })
                            } else {
                              if (days < 0) {
                                atrasado.push({ proposta: proposta.seq, id: proposta._id, status: proposta.status, cliente: cliente.nome, telefone: cliente.celular, cadastro: dataMensagem(dtcadastro), validade: dataMensagem(dtvalidade) })
                              }
                            }
                          }

                        } else {
                          // //console.log('proposta._id=>'+proposta._id)
                          if (proposta.ganho == true && proposta.encerrado == false) {
                            var dtassinatura
                            if (naoVazio(proposta.dtassinatura)){
                              dtassinatura = proposta.dtassinatura
                            }else{
                              dtassinatura = '0000-00-00'
                            }
                            
                            //console.log('dtdlassinado=>' + dtdlassinado)
                            data2 = new Date(equipe.dtfim)
                            data1 = new Date(hoje)
                            // //console.log('data1=>' + data1)
                            // //console.log('data2=>' + data2)
                            dif = Math.abs(data2.getTime() - data1.getTime())
                            //console.log('dif=>'+dif)
                            days = Math.ceil(dif / (1000 * 60 * 60 * 24))
                            // //console.log('days=>'+days)
                            //console.log('compara=>'+compara)
                            if (days < 30) {
                              deadlineIns.push({ id: proposta._id, proposta: proposta.seq, cliente: cliente.nome, cadastro: dataMensagem(dtcadastro), inicio: dataMensagem(equipe.dtinicio), dliins: dataMensagem(equipe.dtfim) })
                            }
                          }
                        }
                        //console.log('status=>' + status)
                        //console.log('q=>' + q)
                        if (q == todasProposta.length) {
                          numprj = todasProposta.length
                          //console.log('numprj=>' + numprj)
                          //console.log('qtdorcado=>' + qtdorcado)
                          //console.log('qtdaberto=>' + qtdaberto)
                          //console.log('qtdencerrado=>' + qtdencerrado)
                          res.render('menuproposta', { id: _id, owner: owner, listaAberto, listaOrcado, listaEncerrado, saudacao, nome_lista: nome, ehMaster, numprj, qtdpro, qtdvis, qtdass, qtdped, qtdnot, qtdalx, qtdtrt, qtdpcl, qtdequ, qtdfim, qtdpos, qtdaberto, qtdencerrado, qtdorcado, qtdbaixado, deadlineIns, notpro, atrasado })
                        }
                      }).catch((err) => {
                        req.flash('error_msg', 'Houve um erro ao encontrar as pessoas<1>.')
                        res.redirect('/')
                      })
                    }).catch((err) => {
                      req.flash('error_msg', 'Houve um erro ao encontrar o pós venda.')
                      res.redirect('/')
                    })
                  }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro ao encontrar a equipe.')
                    res.redirect('/')
                  })
                }).catch((err) => {
                  req.flash('error_msg', 'Houve um erro ao encontrar a vistoria.')
                  res.redirect('/')
                })
              }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao encontrar a compra.')
                res.redirect('/')
              })
            }).catch((err) => {
              req.flash('error_msg', 'Houve um erro ao encontrar o documento.')
              res.redirect('/')
            })
          }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao encontrar os clientes.')
            res.redirect('/')
          })
        }).catch((err) => {
          req.flash('error_msg', 'Houve um erro ao encontrar a proposta.')
          res.redirect('/')
        })
      })
    } else {
      //console.log('user=>'+user)
      if (user != '' && typeof user != 'undefined') {
        var instalador = ''
        //console.log('funges=>'+funges)
        Proposta.find({ user: user }).sort({ data: 'asc' }).then((todasProposta) => {
          //console.log('todasProposta=>'+todasProposta)
          if (todasProposta != '') {
            todasProposta.forEach((e) => {
              if (funges == true) {
                //console.log(e)
                Proposta.findOne({ _id: e._id }).then((proposta) => {
                  Cliente.findOne({ _id: e.cliente }).then((cliente) => {
                    Documento.findOne({ proposta: e._id }).then((documento) => {
                      Compra.findOne({ proposta: e._id }).then((compra) => {
                        Vistoria.findOne({ proposta: e._id }).then((vistoria) => {
                          Equipe.findOne({ _id: e.equipe }).then((equipe) => {
                            Posvenda.findOne({ proposta: e._id }).then((posvenda) => {
                              Pessoa.findOne({ _id: e.responsavel }).then((pessoa_res) => {
                                //console.log('e._id=>' + e._id)
                                if (naoVazio(proposta.dtcadastro6)) {
                                  dtcadastro = proposta.dtcadastro6
                                  dtvalidade = proposta.dtvalidade6
                                } else {
                                  if (naoVazio(proposta.dtcadastro5)) {
                                    dtcadastro = proposta.dtcadastro5
                                    dtvalidade = proposta.dtvalidade5
                                  } else {
                                    if (naoVazio(proposta.dtcadastro4)) {
                                      dtcadastro = proposta.dtcadastro4
                                      dtvalidade = proposta.dtvalidade4
                                    } else {
                                      if (naoVazio(proposta.dtcadastro3)) {
                                        dtcadastro = proposta.dtcadastro3
                                        dtvalidade = proposta.dtvalidade3
                                      } else {
                                        if (naoVazio(proposta.dtcadastro2)) {
                                          dtcadastro = proposta.dtcadastro2
                                          dtvalidade = proposta.dtvalidade2
                                        } else {
                                          if (naoVazio(proposta.dtcadastro1)) {
                                            dtcadastro = proposta.dtcadastro1
                                            dtvalidade = proposta.dtvalidade1
                                          } else {
                                            dtcadastro = '0000-00-00'
                                            dtvalidade = '0000-00-00'
                                          }
                                        }
                                      }
                                    }
                                  }
                                }


                                if (pessoa_res != null) {
                                  responsavel = pessoa_res.nome
                                } else {
                                  responsavel = ''
                                }
                                if (proposta.ganho == true) {
                                  if (proposta.encerrado == true) {
                                    status = 'Encerrado'
                                    qtdfim++
                                    qtdencerrado++
                                    listaEncerrado.push({ proposta: proposta.seq, status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                  } else {
                                    if (posvenda.feito == true) {
                                      status = 'Pós-Venda'
                                      qtdpos++
                                      qtdaberto++
                                      listaAberto.push({ proposta: proposta.seq, status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                    } else {
                                      if (documento.feitofaturado == true) {
                                        status = 'Faturado'
                                        qtdfat++
                                        qtdaberto++
                                        listaAberto.push({ proposta: proposta.seq, status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                      } else {
                                        if (documento.feitoalmox == true) {
                                          status = 'Almoxarifado Fechado'
                                          qtdaberto++
                                          listaAberto.push({ proposta: proposta.seq, status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                        } else {
                                          if (documento.enviaalmox == true) {
                                            status = 'Almoxarifado Em Aberto'
                                            qtdaberto++
                                            listaAberto.push({ proposta: proposta.seq, status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                          } else {
                                            if (equipe.feito == true) {
                                              status = 'Execução a Campo'
                                              qtdequ++
                                              qtdaberto++
                                              listaAberto.push({ proposta: proposta.seq, status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                            } else {
                                              if (documento.protocolado == true) {
                                                status = 'Protocolado'
                                                qtdpcl++
                                                qtdaberto++
                                                listaAberto.push({ proposta: proposta.seq, status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                              } else {
                                                if (documento.feitotrt == true) {
                                                  status = 'TRT'
                                                  qtdtrt++
                                                  qtdaberto++
                                                  listaAberto.push({ proposta: proposta.seq, status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                                } else {
                                                  if (compra.feitonota == true) {
                                                    status = 'NF'
                                                    qtdnot++
                                                    qtdaberto++
                                                    listaAberto.push({ proposta: proposta.seq, status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                                  } else {
                                                    if (compra.feitopedido == true) {
                                                      status = 'Pedido'
                                                      qtdped++
                                                      qtdaberto++
                                                      listaAberto.push({ proposta: proposta.seq, status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                                    } else {
                                                      if (proposta.assinado == true) {
                                                        status = 'Assinado'
                                                        qtdass++
                                                        qtdaberto++
                                                        listaAberto.push({ proposta: proposta.seq, status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                                      } else {
                                                        if (vistoria.feito == true) {
                                                          status = 'Visita'
                                                          qtdvis++
                                                          qtdaberto++
                                                          listaAberto.push({ proposta: proposta.seq, status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                                        } else {
                                                          status = 'Preparado para a Visita'
                                                          qtdpro++
                                                          qtdaberto++
                                                          listaAberto.push({ proposta: proposta.seq, status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                } else {
                                  if (proposta.baixada == false) {
                                    status = 'Proposta Enviada'
                                    qtdpro++
                                    qtdorcado++
                                    listaOrcado.push({ proposta: proposta.seq, saudacao, status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                  }else{
                                    qtdbaixado++
                                  }
                                }

                                if (proposta.ganho == false && proposta.baixada == false) {
                                  if (dtvalidade != '0000-00-00') {
                                    data1 = new Date(dtvalidade)
                                    data2 = new Date(hoje)
                                    //console.log('data1=>'+data1)
                                    //console.log('data2=>'+data2)
                                    dif = Math.abs(data1.getTime() - data2.getTime())
                                    //console.log('dif=>'+dif)
                                    days = Math.ceil(dif / (1000 * 60 * 60 * 24))
                                    if (data1.getTime() < data2.getTime()){
                                      days = days * -1
                                    }
                                    if (days == 1 || days == 0) {
                                      notpro.push({ id: proposta._id, proposta: proposta.seq, status: proposta.status, cliente: cliente.nome, telefone: cliente.celular, cadastro: dataMensagem(dtcadastro), validade: dataMensagem(dtnovo) })
                                    } else {
                                      if (days < 0) {
                                        atrasado.push({ id: proposta._id, proposta: proposta.seq, status: proposta.status, cliente: cliente.nome, telefone: cliente.celular, cadastro: dataMensagem(dtcadastro), validade: dataMensagem(dtnovo) })
                                      }
                                    }
                                  }
                                }
                                //console.log('status=>' + status)
                                q++
                                //console.log('q=>' + q)
                                if (q == todasProposta.length) {
                                  numprj = todasProposta.length
                                  //console.log('numprj=>' + numprj)
                                  //console.log('qtdorcado=>' + qtdorcado)
                                  //console.log('qtdaberto=>' + qtdaberto)
                                  //console.log('qtdencerrado=>' + qtdencerrado)
                                  Pessoa.findOne({ _id: pessoa }).lean().then((nome_pessoa) => {
                                    res.render('menuproposta', { id: _id, owner: owner, saudacao, nome_lista: nome_pessoa.nome, listaAberto, listaOrcado, listaEncerrado, ehMaster, numprj, qtdpro, qtdvis, qtdass, qtdped, qtdnot, qtdtrt, qtdpcl, qtdequ, qtdfim, qtdpos, qtdaberto, qtdencerrado, qtdorcado, qtdbaixado, notpro, atrasado })
                                  }).catch((err) => {
                                    req.flash('error_msg', 'Houve um erro ao encontrar o nome do usuário.')
                                    res.redirect('/')
                                  })
                                }
                              }).catch((err) => {
                                req.flash('error_msg', 'Houve um erro ao encontrar as pessoas<2>.')
                                res.redirect('/')
                              })
                            }).catch((err) => {
                              req.flash('error_msg', 'Houve um erro ao encontrar o pós venda.')
                              res.redirect('/')
                            })
                          }).catch((err) => {
                            req.flash('error_msg', 'Houve um erro ao encontrar a equipe.')
                            res.redirect('/')
                          })
                        }).catch((err) => {
                          req.flash('error_msg', 'Houve um erro ao encontrar a vistoria.')
                          res.redirect('/')
                        })
                      }).catch((err) => {
                        req.flash('error_msg', 'Houve um erro ao encontrar a compra.')
                        res.redirect('/')
                      })
                    }).catch((err) => {
                      req.flash('error_msg', 'Houve um erro ao encontrar o documento.')
                      res.redirect('/')
                    })
                  }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro ao encontrar os clientes.')
                    res.redirect('/')
                  })
                }).catch((err) => {
                  req.flash('error_msg', 'Houve um erro ao encontrar a proposta.')
                  res.redirect('/')
                })
              } else {
                //console.log('e.equipe=>'+e.equipe)
                //console.log('pessoa=>'+pessoa)
                Equipe.findOne({ _id: e.equipe }).then((equipe) => {
                  Pessoa.findOne({ _id: pessoa }).then((usuario) => {
                    //console.log('pessoa=>' + pessoa)
                    //console.log('usuario.nome=>' + usuario.nome)
                    //console.log('equipe.ins0=>' + equipe.ins0)
                    //console.log('equipe.ins1=>' + equipe.ins1)
                    //console.log('equipe.ins2=>' + equipe.ins2)
                    //console.log('equipe.ins3=>' + equipe.ins3)
                    //console.log('equipe.ins4=>' + equipe.ins4)
                    //console.log('equipe.ins5=>' + equipe.ins5)
                    instalador = ''
                    if (equipe.ins0 == usuario.nome) {
                      instalador = equipe.ins0
                    }
                    if (equipe.ins1 == usuario.nome) {
                      instalador = equipe.ins1
                    }
                    if (equipe.ins2 == usuario.nome) {
                      instalador = equipe.ins2
                    }
                    if (equipe.ins3 == usuario.nome) {
                      instalador = equipe.ins3
                    }
                    if (equipe.ins4 == usuario.nome) {
                      instalador = equipe.ins4
                    }
                    if (equipe.ins5 == usuario.nome) {
                      instalador = equipe.ins5
                    }
                    //console.log('instalador=>' + instalador)
                    if (instalador != '') {
                      numprj++
                      Proposta.findOne({ _id: e._id }).then((proposta) => {
                        Cliente.findOne({ _id: e.cliente }).then((cliente) => {
                          Documento.findOne({ proposta: e._id }).then((documento) => {
                            Compra.findOne({ proposta: e._id }).then((compra) => {
                              Vistoria.findOne({ proposta: e._id }).then((vistoria) => {
                                Equipe.findOne({ _id: e.equipe }).then((equipe) => {
                                  Posvenda.findOne({ proposta: e._id }).then((posvenda) => {
                                    Pessoa.findOne({ _id: e.responsavel }).then((pessoa_res) => {
                                      //console.log('entrou')
                                      if (naoVazio(proposta.dtcadastro6)) {
                                        dtcadastro = proposta.dtcadastro6
                                        dtvalidade = proposta.dtvalidade6
                                      } else {
                                        if (naoVazio(proposta.dtcadastro5)) {
                                          dtcadastro = proposta.dtcadastro5
                                          dtvalidade = proposta.dtvalidade5
                                        } else {
                                          if (naoVazio(proposta.dtcadastro4)) {
                                            dtcadastro = proposta.dtcadastro4
                                            dtvalidade = proposta.dtvalidade4
                                          } else {
                                            if (naoVazio(proposta.dtcadastro3)) {
                                              dtcadastro = proposta.dtcadastro3
                                              dtvalidade = proposta.dtvalidade3
                                            } else {
                                              if (naoVazio(proposta.dtcadastro2)) {
                                                dtcadastro = proposta.dtcadastro2
                                                dtvalidade = proposta.dtvalidade2
                                              } else {
                                                if (naoVazio(proposta.dtcadastro1)) {
                                                  dtcadastro = proposta.dtcadastro1
                                                  dtvalidade = proposta.dtvalidade1
                                                } else {
                                                  dtcadastro = '0000-00-00'
                                                  dtvalidade = '0000-00-00'
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }


                                      if (pessoa_res != null) {
                                        responsavel = pessoa_res.nome
                                      } else {
                                        responsavel = ''
                                      }
                                      if (proposta.ganho == true) {
                                        if (proposta.encerrado == true) {
                                          status = 'Encerrado'
                                          qtdfim++
                                          qtdencerrado++
                                          listaEncerrado.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade), block: true })
                                        } else {
                                          if (posvenda.feito == true) {
                                            status = 'Pós-Venda'
                                            qtdpos++
                                            qtdaberto++
                                            listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade), block: true })
                                          } else {
                                            if (documento.feitofaturado == true) {
                                              status = 'Faturado'
                                              qtdfat++
                                              qtdaberto++
                                              listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade), block: true })
                                            } else {
                                              if (documento.feitofaturado == true) {
                                                status = 'Almoxarifado Fechado'
                                                qtdalx++
                                                qtdaberto++
                                                listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade), block: true })
                                              } else {
                                                if (documento.feitofaturado == true) {
                                                  status = 'Almoxarifado em Aberto'
                                                  qtdenv++
                                                  qtdaberto++
                                                  listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade), block: true })
                                                } else {
                                                  if (equipe.feito == true) {
                                                    status = 'Execução a Campo'
                                                    qtdequ++
                                                    qtdaberto++
                                                    listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade), block: true })
                                                  } else {
                                                    if (documento.protocolado == true) {
                                                      status = 'Protocolado'
                                                      qtdpcl++
                                                      qtdaberto++
                                                      listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade), block: true })
                                                    } else {
                                                      if (documento.feitotrt == true) {
                                                        status = 'TRT'
                                                        qtdtrt++
                                                        qtdaberto++
                                                        listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade), block: true })
                                                      } else {
                                                        if (compra.feitonota == true) {
                                                          status = 'NF'
                                                          qtdnot++
                                                          qtdaberto++
                                                          listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade), block: true })
                                                        } else {
                                                          if (compra.feitopedido == true) {
                                                            status = 'Pedido'
                                                            qtdped++
                                                            qtdaberto++
                                                            listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade), block: true })
                                                          } else {
                                                            if (proposta.assinado == true) {
                                                              status = 'Assinado'
                                                              qtdass++
                                                              qtdaberto++
                                                              listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade), block: true })
                                                            } else {
                                                              if (vistoria.feito == true) {
                                                                status = 'Visita'
                                                                qtdvis++
                                                                qtdaberto++
                                                                listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade), block: true })
                                                              } else {
                                                                status = 'Preparado para a Visita'
                                                                qtdpro++
                                                                qtdorcado++
                                                                listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade), block: true })
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      } else {
                                        if (proposta.baixada == false) {
                                          status = 'Proposta Enviada'
                                          qtdpro++
                                          qtdorcado++
                                          listaOrcado.push({ status, saudacao, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade), block: true })
                                        }else{
                                          qtdbaixado++
                                        }
                                      }

                                      q++

                                      if (q == todasProposta.length) {

                                        //console.log(listaAberto)
                                        numprj = numprj
                                        res.render('menuproposta', { id: _id, owner: owner, saucadacao, listaOrcado, listaAberto, listaEncerrado, ehMaster, numprj, qtdpro, qtdvis, qtdass, qtdped, qtdnot, qtdtrt, qtdpcl, qtdequ, qtdfim, qtdpos, qtdorcado, qtdaberto, qtdencerrado, qtdbaixado, block: true })
                                      }
                                    })
                                  })
                                })
                              })
                            })
                          })
                        })
                      })
                    }
                  })
                })
              }
            })
          } else {
            //console.log('sem registro')
            res.render('menuproposta', { id: _id, owner: owner, saudacao, nome_lista: nome, ehMaster, qtdpro, qtdvis, qtdass, qtdped, qtdnot, qtdtrt, qtdpcl, qtdequ, numprj, qtdorcado, qtdaberto, qtdencerrado, qtdbaixado })
          }
        })
      } else {
        //console.log('sem registro')
        res.render('menuproposta', { id: _id, owner: owner, saudacao, nome_lista: nome, ehMaster, qtdpro, qtdvis, qtdass, qtdped, qtdnot, qtdtrt, qtdpcl, qtdequ, numprj, qtdorcado, qtdaberto, qtdencerrado, qtdbaixado })
      }
    }
  }).catch((err) => {
    req.flash("error_msg", "Ocorreu uma falha interna para encontrar a proposta.")
    res.redirect("/")
  })
})

//Rotas
app.use('/customdo', customdo)
app.use('/configuracao', configuracao)
app.use('/projeto', projeto)
app.use('/gerenciamento', gerenciamento)
app.use('/pessoa', pessoa)
app.use('/cliente', cliente)
app.use('/usuario', usuario)
app.use('/administrador', administrador)
app.use('/relatorios/', relatorios)
app.use('/componente/', componente)
app.use('/fornecedor/', fornecedor)

//Outros

const APP_PORT = process.env.APP_PORT || 3000

app.listen(APP_PORT, () => {
  console.log(`Running app at port:${APP_PORT}`)
})