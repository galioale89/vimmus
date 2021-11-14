//Modulos
const express = require('express')
const app = express()

const handlebars = require('express-handlebars')
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

const validaCampos = require('./resources/validaCampos')
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
// const Projeto = mongoose.model('projeto')
// const Realizado = mongoose.model('realizado')
// const Configuracao = mongoose.model('configuracao')
// const Empresa = mongoose.model('empresa')

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
  res.locals.error = req.flash("error")
  res.locals.user = req.user || null
  next()
})

//Body-Parser
app.use(bodyParser.urlencoded({ extends: true }))
app.use(bodyParser.json())
//Handlebars
app.engine('handlebars', handlebars({ defaulLayout: "main" }))
app.set('view engine', 'handlebars')

//Configurando pasta de imagens 
app.use(express.static('public/'))

//Mongoose DB
mongoose.Promise = global.Promise
mongoose.connect('mongodb://alegaliotto:3rdn4x3L4@mongo_vimmus:27017/vimmus', {
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
});
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
  const { owner } = req.user

  var numprj = 0

  var q = 0
  var listaOrcado = []
  var listaAberto = []
  var listaEncerrado = []
  var notpro = []
  var atrasado = []
  var status = ''
  var dtcadastro = ''
  var dtvalidade = ''
  var qtdorcado = 0
  var qtdaberto = 0
  var qtdencerrado = 0
  var qtdfim = 0
  var qtdfat = 0
  var qtdalx = 0
  var qtdenv = 0
  var qtdpos = 0
  var qtdpro = 0
  var qtdvis = 0
  var qtdass = 0
  var qtdnot = 0
  var qtdped = 0
  var qtdtrt = 0
  var qtdpcl = 0
  var qtdequ = 0

  if (ehAdmin == 0) {
    ehMaster = true
  } else {
    ehMaster = false
  }

  console.log(user)

  Proposta.find({ user: _id }).sort({ data: 'asc' }).then((todasProposta) => {
    if (todasProposta != '') {
      todasProposta.forEach((element) => {
        Proposta.findOne({ _id: element._id }).then((proposta) => {
          Cliente.findOne({ _id: element.cliente }).then((cliente) => {
            Pessoa.findOne({ _id: element.responsavel }).then((pessoa) => {
              Documento.findOne({ proposta: element._id }).then((documento) => {
                Compra.findOne({ proposta: element._id }).then((compra) => {
                  Vistoria.findOne({ proposta: element._id }).then((vistoria) => {
                    Equipe.findOne({ _id: element.equipe }).then((equipe) => {
                      Posvenda.findOne({ proposta: element._id }).then((posvenda) => {
                        //console.log('element._id=>' + element._id)
                        if (typeof proposta.proposta6 != 'undefined') {
                          dtcadastro = proposta.dtcadastro6
                          dtvalidade = proposta.dtvalidade6
                        } else {
                          if (typeof proposta.proposta5 != 'undefined') {
                            dtcadastro = proposta.dtcadastro5
                            dtvalidade = proposta.dtvalidade5
                          } else {
                            if (typeof proposta.proposta4 != 'undefined') {
                              dtcadastro = proposta.dtcadastro4
                              dtvalidade = proposta.dtvalidade4
                            } else {
                              if (typeof proposta.proposta3 != 'undefined') {
                                dtcadastro = proposta.dtcadastro3
                                dtvalidade = proposta.dtvalidade3
                              } else {
                                if (typeof proposta.proposta2 != 'undefined') {
                                  dtcadastro = proposta.dtcadastro2
                                  dtvalidade = proposta.dtvalidade2
                                } else {
                                  dtcadastro = proposta.dtcadastro1
                                  dtvalidade = proposta.dtvalidade1
                                }
                              }
                            }
                          }
                        }


                        if (proposta.ganho == true) {
                          if (proposta.encerrado == true) {
                            status = 'Encerrado'
                            qtdfim++
                            qtdencerrado++
                            listaEncerrado.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                          } else {
                            if (posvenda.feito == true) {
                              status = 'Pós-Venda'
                              qtdpos++
                              qtdaberto++
                              listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                            } else {
                              if (documento.feitofaturado == true) {
                                status = 'Faturado'
                                qtdfat++
                                qtdaberto++
                                listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                              } else {
                                if (documento.feitofaturado == true) {
                                  status = 'Almoxarifado Fechado'
                                  qtdalx++
                                  qtdaberto++
                                  listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                } else {
                                  if (documento.feitofaturado == true) {
                                    status = 'Almoxarifado em Aberto'
                                    qtdenv++
                                    qtdaberto++
                                    listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                  } else {
                                    if (equipe.feito == true) {
                                      status = 'Execução a Campo'
                                      qtdequ++
                                      qtdaberto++
                                      listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                    } else {
                                      if (documento.protocolado == true) {
                                        status = 'Protocolado'
                                        qtdpcl++
                                        qtdaberto++
                                        listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                      } else {
                                        if (documento.feitotrt == true) {
                                          status = 'TRT'
                                          qtdtrt++
                                          qtdaberto++
                                          listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                        } else {
                                          if (compra.feitonota == true) {
                                            status = 'NF'
                                            qtdnot++
                                            qtdaberto++
                                            listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                          } else {
                                            if (compra.feitopedido == true) {
                                              status = 'Pedido'
                                              qtdped++
                                              qtdaberto++
                                              listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                            } else {
                                              if (proposta.assinado == true) {
                                                status = 'Assinado'
                                                qtdass++
                                                qtdaberto++
                                                listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                              } else {
                                                if (vistoria.feito == true) {
                                                  status = 'Vistoria'
                                                  qtdvis++
                                                  qtdaberto++
                                                  listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                                } else {
                                                  status = 'Preparado para a Vistoria'
                                                  qtdpro++
                                                  qtdaberto++
                                                  listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
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
                          status = 'Proposta Enviada'
                          qtdpro++
                          qtdorcado++
                          listaOrcado.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                        }

                        if (typeof documento != undefined || documento !=''){
                          var hoje = dataHoje()      
                          var dtnovo = setData(dtcadastro,7)
                          var data1 = dataBusca(dtnovo)           
                          var data2 = dataBusca(hoje)      
                          var compara = parseFloat(data1) - parseFloat(data2)
                          if (compara == 3){
                            notpro.push({id: proposta._id, cliente: cliente.nome, cadastro: dataMensagem(dtcadastro), validade: dataMensagem(dtnovo)})
                          }else{
                            if (compara < 0){
                              atrasado.push({id: proposta._id, cliente: cliente.nome, cadastro: dataMensagem(dtcadastro), validade: dataMensagem(dtnovo)})
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
                          res.render('menuproposta', {id: _id, owner: owner, listaAberto, listaOrcado, listaEncerrado, ehMaster, numprj, qtdpro, qtdvis, qtdass, qtdped, qtdnot, qtdtrt, qtdpcl, qtdequ, qtdfim, qtdpos, qtdaberto, qtdencerrado, qtdorcado, notpro, atrasado })
                        }
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
              req.flash('error_msg', 'Houve um erro ao encontrar as pessoas.')
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
      if (user != ''&& typeof user !='undefined')  {
        var instalador = ''
        
        console.log('user=>'+user)
        console.log('funges=>'+funges)

        Proposta.find({ user: user }).sort({ data: 'asc' }).then((todasProposta) => {
          if (todasProposta) {
            todasProposta.forEach((element) => {
              if (funges == true) {
                console.log(element)
                Proposta.findOne({ _id: element._id }).then((proposta) => {
                  Cliente.findOne({ _id: element.cliente }).then((cliente) => {
                    Pessoa.findOne({ _id: element.responsavel }).then((pessoa) => {
                      Documento.findOne({ proposta: element._id }).then((documento) => {
                        Compra.findOne({ proposta: element._id }).then((compra) => {
                          Vistoria.findOne({ proposta: element._id }).then((vistoria) => {
                            Equipe.findOne({ _id: element.equipe }).then((equipe) => {
                              Posvenda.findOne({ proposta: element._id }).then((posvenda) => {
                                //console.log('element._id=>' + element._id)
                                if (typeof proposta.proposta6 != 'undefined') {
                                  dtcadastro = proposta.dtcadastro6
                                  dtvalidade = proposta.dtvalidade6
                                } else {
                                  if (typeof proposta.proposta5 != 'undefined') {
                                    dtcadastro = proposta.dtcadastro5
                                    dtvalidade = proposta.dtvalidade5
                                  } else {
                                    if (typeof proposta.proposta4 != 'undefined') {
                                      dtcadastro = proposta.dtcadastro4
                                      dtvalidade = proposta.dtvalidade4
                                    } else {
                                      if (typeof proposta.proposta3 != 'undefined') {
                                        dtcadastro = proposta.dtcadastro3
                                        dtvalidade = proposta.dtvalidade3
                                      } else {
                                        if (typeof proposta.proposta2 != 'undefined') {
                                          dtcadastro = proposta.dtcadastro2
                                          dtvalidade = proposta.dtvalidade2
                                        } else {
                                          dtcadastro = proposta.dtcadastro1
                                          dtvalidade = proposta.dtvalidade1
                                        }
                                      }
                                    }
                                  }
                                }


                                if (proposta.ganho == true) {
                                  if (proposta.encerrado == true) {
                                    status = 'Encerrado'
                                    qtdfim++
                                    qtdencerrado++
                                    listaEncerrado.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                  } else {
                                    if (posvenda.feito == true) {
                                      status = 'Pós-Venda'
                                      qtdpos++
                                      qtdaberto++
                                      listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                    } else {
                                      if (documento.feitofaturado == true) {
                                        status = 'Faturado'
                                        qtdfat++
                                        qtdaberto++
                                        listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                      } else {
                                        if (documento.feitofaturado == true) {
                                          status = 'Almoxarifado Fechado'
                                          qtdalx++
                                          qtdaberto++
                                          listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                        } else {
                                          if (documento.feitofaturado == true) {
                                            status = 'Almoxarifado em Aberto'
                                            qtdenv++
                                            qtdaberto++
                                            listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                          } else {
                                            if (equipe.feito == true) {
                                              status = 'Execução a Campo'
                                              qtdequ++
                                              qtdaberto++
                                              listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                            } else {
                                              if (documento.protocolado == true) {
                                                status = 'Protocolado'
                                                qtdpcl++
                                                qtdaberto++
                                                listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                              } else {
                                                if (documento.feitotrt == true) {
                                                  status = 'TRT'
                                                  qtdtrt++
                                                  qtdaberto++
                                                  listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                                } else {
                                                  if (compra.feitonota == true) {
                                                    status = 'NF'
                                                    qtdnot++
                                                    qtdaberto++
                                                    listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                                  } else {
                                                    if (compra.feitopedido == true) {
                                                      status = 'Pedido'
                                                      qtdped++
                                                      qtdaberto++
                                                      listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                                    } else {
                                                      if (proposta.assinado == true) {
                                                        status = 'Assinado'
                                                        qtdass++
                                                        qtdaberto++
                                                        listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                                      } else {
                                                        if (vistoria.feito == true) {
                                                          status = 'Vistoria'
                                                          qtdvis++
                                                          qtdaberto++
                                                          listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                                        } else {
                                                          status = 'Preparado para a Vistoria'
                                                          qtdpro++
                                                          qtdaberto++
                                                          listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
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
                                  status = 'Proposta Enviada'
                                  qtdpro++
                                  qtdorcado++
                                  listaOrcado.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                }
                                if (proposta.ganho != true){
                                  var hoje = dataHoje()      
                                  // var dtnovo = setData(dtcadastro,7)
                                  var dtnovo = dtvalidade
                                  var data1 = dataBusca(dtnovo)           
                                  var data2 = dataBusca(hoje)      
                                  var compara = parseFloat(data1) - parseFloat(data2)
                                  if (compara == 1){
                                    notpro.push({id: proposta._id, cliente: cliente.nome, cadastro: dataMensagem(dtcadastro), validade: dataMensagem(dtnovo)})
                                  }else{
                                    if (compara < 0){
                                      atrasado.push({id: proposta._id, cliente: cliente.nome, cadastro: dataMensagem(dtcadastro), validade: dataMensagem(dtnovo)})
                                    }
                                  }
                                }

                                console.log('status=>' + status)
                                q++
                                console.log('q=>' + q)
                                if (q == todasProposta.length) {
                                  numprj = todasProposta.length
                                  //console.log('numprj=>' + numprj)
                                  //console.log('qtdorcado=>' + qtdorcado)
                                  //console.log('qtdaberto=>' + qtdaberto)
                                  //console.log('qtdencerrado=>' + qtdencerrado)
                                  res.render('menuproposta', {id: _id, owner: owner, listaAberto, listaOrcado, listaEncerrado, ehMaster, numprj, qtdpro, qtdvis, qtdass, qtdped, qtdnot, qtdtrt, qtdpcl, qtdequ, qtdfim, qtdpos, qtdaberto, qtdencerrado, qtdorcado, notpro, atrasado})
                                }
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
                      req.flash('error_msg', 'Houve um erro ao encontrar as pessoas.')
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
                console.log('element.equipe=>'+element.equipe)
                console.log('pessoa=>'+pessoa)
                Equipe.findOne({ _id: element.equipe }).then((equipe) => {
                  Pessoa.findOne({ _id: pessoa }).then((usuario) => {
                    // //console.log('pessoa=>' + pessoa)
                    // //console.log('usuario.nome=>' + usuario.nome)
                    // //console.log('equipe.ins0=>' + equipe.ins0)
                    // //console.log('equipe.ins1=>' + equipe.ins1)
                    // //console.log('equipe.ins2=>' + equipe.ins2)
                    // //console.log('equipe.ins3=>' + equipe.ins3)
                    // //console.log('equipe.ins4=>' + equipe.ins4)
                    // //console.log('equipe.ins5=>' + equipe.ins5)
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
                    // //console.log('instalador=>' + instalador)
                    if (instalador != '') {
                      numprj++
                      Proposta.findOne({ _id: element._id }).then((proposta) => {
                        Cliente.findOne({ _id: element.cliente }).then((cliente) => {
                          Pessoa.findOne({ _id: element.responsavel }).then((pessoa) => {
                            Documento.findOne({ proposta: element._id }).then((documento) => {
                              Compra.findOne({ proposta: element._id }).then((compra) => {
                                Vistoria.findOne({ proposta: element._id }).then((vistoria) => {
                                  Equipe.findOne({ _id: element.equipe }).then((equipe) => {
                                    Posvenda.findOne({ proposta: element._id }).then((posvenda) => {
                                      // //console.log('entrou')
                                      if (typeof proposta.proposta6 != 'undefined') {
                                        dtcadastro = proposta.dtcadastro6
                                        dtvalidade = proposta.dtvalidade6
                                      } else {
                                        if (typeof proposta.proposta5 != 'undefined') {
                                          dtcadastro = proposta.dtcadastro5
                                          dtvalidade = proposta.dtvalidade5
                                        } else {
                                          if (typeof proposta.proposta4 != 'undefined') {
                                            dtcadastro = proposta.dtcadastro4
                                            dtvalidade = proposta.dtvalidade4
                                          } else {
                                            if (typeof proposta.proposta3 != 'undefined') {
                                              dtcadastro = proposta.dtcadastro3
                                              dtvalidade = proposta.dtvalidade3
                                            } else {
                                              if (typeof proposta.proposta2 != 'undefined') {
                                                dtcadastro = proposta.dtcadastro2
                                                dtvalidade = proposta.dtvalidade2
                                              } else {
                                                dtcadastro = proposta.dtcadastro1
                                                dtvalidade = proposta.dtvalidade1
                                              }
                                            }
                                          }
                                        }
                                      }

                                      if (proposta.ganho == true) {
                                        if (proposta.encerrado == true) {
                                          status = 'Encerrado'
                                          qtdfim++
                                          qtdencerrado++
                                          listaEncerrado.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade),  block: true })
                                        } else {
                                          if (posvenda.feito == true) {
                                            status = 'Pós-Venda'
                                            qtdpos++
                                            qtdaberto++
                                            listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade),  block: true })
                                          } else {
                                            if (documento.feitofaturado == true) {
                                              status = 'Faturado'
                                              qtdfat++
                                              qtdaberto++
                                              listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade),  block: true })
                                            } else {
                                              if (documento.feitofaturado == true) {
                                                status = 'Almoxarifado Fechado'
                                                qtdalx++
                                                qtdaberto++
                                                listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade),  block: true })
                                              } else {
                                                if (documento.feitofaturado == true) {
                                                  status = 'Almoxarifado em Aberto'
                                                  qtdenv++
                                                  qtdaberto++
                                                  listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade),  block: true })
                                                } else {
                                                  if (equipe.feito == true) {
                                                    status = 'Execução a Campo'
                                                    qtdequ++
                                                    qtdaberto++
                                                    listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade),  block: true })
                                                  } else {
                                                    if (documento.protocolado == true) {
                                                      status = 'Protocolado'
                                                      qtdpcl++
                                                      qtdaberto++
                                                      listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade),  block: true })
                                                    } else {
                                                      if (documento.feitotrt == true) {
                                                        status = 'TRT'
                                                        qtdtrt++
                                                        qtdaberto++
                                                        listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade),  block: true })
                                                      } else {
                                                        if (compra.feitonota == true) {
                                                          status = 'NF'
                                                          qtdnot++
                                                          qtdaberto++
                                                          listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade),  block: true })
                                                        } else {
                                                          if (compra.feitopedido == true) {
                                                            status = 'Pedido'
                                                            qtdped++
                                                            qtdaberto++
                                                            listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade),  block: true })
                                                          } else {
                                                            if (proposta.assinado == true) {
                                                              status = 'Assinado'
                                                              qtdass++
                                                              qtdaberto++
                                                              listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade),  block: true })
                                                            } else {
                                                              if (vistoria.feito == true) {
                                                                status = 'Vistoria'
                                                                qtdvis++
                                                                qtdaberto++
                                                                listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade),  block: true})
                                                              } else {
                                                                status = 'Preparado para a Vistoria'
                                                                qtdpro++
                                                                qtdorcado++
                                                                listaAberto.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade), block: true })
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
                                        status = 'Proposta Enviada'
                                        qtdpro++
                                        qtdorcado++
                                        listaOrcado.push({ status, id: proposta._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.telefone, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade), block: true })
                                      }
                                      if (proposta.ganho != true){
                                        var hoje = dataHoje()      
                                        // var dtnovo = setData(dtcadastro,7)
                                        var dtnovo = dtvalidade
                                        var data1 = dataBusca(dtnovo)           
                                        var data2 = dataBusca(hoje)      
                                        var compara = parseFloat(data1) - parseFloat(data2)
                                        if (compara == 1){
                                          notpro.push({id: proposta._id, cliente: cliente.nome, cadastro: dataMensagem(dtcadastro), validade: dataMensagem(dtnovo)})
                                        }else{
                                          if (compara < 0){
                                            atrasado.push({id: proposta._id, cliente: cliente.nome, cadastro: dataMensagem(dtcadastro), validade: dataMensagem(dtnovo)})
                                          }
                                        }
                                      }
                                      q++

                                      if (q == todasProposta.length) {

                                        console.log(listaAberto)
                                        numprj = numprj
                                        res.render('menuproposta', { id: _id, owner: owner, listaOrcado, listaAberto, listaEncerrado, ehMaster, numprj, qtdpro, qtdvis, qtdass, qtdped, qtdnot, qtdtrt, qtdpcl, qtdequ, qtdfim, qtdpos, qtdorcado, qtdaberto, qtdencerrado, block: true})
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
            res.render('menuproposta', {id: _id, owner: owner, ehMaster, qtdpro, qtdvis, qtdass, qtdped, qtdnot, qtdtrt, qtdpcl, qtdequ, numprj, qtdorcado, qtdaberto, qtdencerrado, block: true})
          }
        })
      } else {
        console.log('entrou')
        res.render('menuproposta', { id: _id, owner: owner, ehMaster, qtdpro, qtdvis, qtdass, qtdped, qtdnot, qtdtrt, qtdpcl, qtdequ, numprj, qtdaberto, qtdorcado, qtdencerrado})
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

//Outros
//Acesso ao localhost
var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('Umbler listening on port %s', port);
});