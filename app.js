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

const Proposta = mongoose.model('proposta')
const Cliente = mongoose.model('cliente')
const Pessoa = mongoose.model('pessoa')
const Projeto = mongoose.model('projeto')
const Realizado = mongoose.model('realizado')
const Configuracao = mongoose.model('configuracao')
const Empresa = mongoose.model('empresa')
const Documento = mongoose.model('documento')
const Compra = mongoose.model('compra')
const Vistoria = mongoose.model('vistoria')
const Equipe = mongoose.model('equipe')

//Chamando função de validação de autenticação do usuário pela função passport
const passport = require("passport")
require("./config/auth")(passport)
global.projeto_id
global.configuracao_id
global.user_id

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
  const { ehAdmin } = req.user
  var numprj = 0

  var q = 0
  var lista = []
  var status = ''
  var dtcadastro = ''
  var dtvalidade = ''
  var qtdpro = 0
  var qtdvis = 0
  var qtdass = 0
  var qtdnot = 0
  var qtdped = 0
  var qtdtrt = 0
  var qtdpcl= 0
  var qtdequ = 0
  var qtdfin = 0

  if (ehAdmin == 0) {
    ehMaster = true
  } else {
    ehMaster = false
  }

  Proposta.find({ user: _id }).sort({ data: 'asc' }).then((todasProposta) => {
    if (todasProposta != '') {
      todasProposta.forEach((element) => {
        q++
        Proposta.findOne({ _id: element._id }).then((proposta) => {
          Cliente.findOne({ _id: element.cliente }).then((cliente) => {
            Pessoa.findOne({ _id: element.responsavel }).then((pessoa) => {
              Documento.findOne({ proposta: element._id }).then((documento) => {
                Compra.findOne({ proposta: element._id }).then((compra) => {
                  Vistoria.findOne({ proposta: element._id }).then((vistoria) => {
                    Equipe.findOne({ _id: element.equipe }).then((equipe) => {

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

                      if (equipe.feito == true) {
                        status = 'Equipe'
                        qtdequ++
                      } else {
                        if (documento.protocolado == true) {
                          status = 'Protocolado'
                          qtdpcl++
                        } else {
                          if (documento.feitotrt == true) {
                            status = 'TRT'
                            qtdtrt++
                          } else {
                            if (compra.feitonota == true) {
                              status = 'NF'
                              qtdnot++
                            } else {
                              if (compra.feitopedido == true) {
                                status = 'Pedido'
                                qtdped++
                              } else {
                                if (proposta.assinado == true) {
                                  status = 'Assinado'
                                  qtdass++
                                } else {
                                  if (vistoria.feito == true) {
                                    status = 'Vistoria'
                                    qtdvis++
                                  } else {
                                    status = 'Proposta Enviada'
                                    qtdpro++
                                  }
                                }
                              }
                            }
                          }
                        }
                      }

                      console.log('qtdequ=>'+qtdequ)
                      console.log('qtdpro=>'+qtdpro)
                      // console.log('dtvalidade1=>'+dtvalidade)
                      numprj = todasProposta.length

                      lista.push({ status, id: proposta._id, cliente: cliente.nome, responsavel: pessoa.nome, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade)})

                      if (q == todasProposta.length) {
                        res.render('menuproposta', { lista, ehMaster, numprj, qtdpro, qtdvis, qtdass, qtdped, qtdnot, qtdtrt, qtdpcl, qtdequ, qtdfin})
                      }
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
      console.log('entrou')
      res.render('menuproposta', { ehMaster })
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