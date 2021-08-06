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

const Projeto = mongoose.model('projeto')
const Realizado = mongoose.model('realizado')
const Configuracao = mongoose.model('configuracao')
const Empresa = mongoose.model('empresa')

//Chamando função de validação de autenticação do usuário pela função passport
const passport = require("passport")
require("./config/auth")(passport)
const { ehAdmin } = require('./helpers/ehAdmin')
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
app.use(express.static('public/img'))

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
  var perVlr = 0
  var somaLL = 0
  var somaVF = 0
  var somaVT = 0
  var perRealizado = 0
  var aviso = []

  const { _id } = req.user
  const { ehAdmin } = req.user

  Projeto.find({ user: _id }).then((projetos) => {
    Realizado.find({ user: _id }).then((prj_vlr) => {
      for (i = 0; i < prj_vlr.length; i++) {
        perVlr = prj_vlr[i]
        if (perVlr.parLiqVlr != undefined && perVlr.parLiqNfs != undefined) {
          somaLL = parseFloat(somaLL) + parseFloat(perVlr.lucroLiquido)
          somaVF = parseFloat(somaVF) + parseFloat(perVlr.vlrNFS)
          somaVT = parseFloat(somaVT) + parseFloat(perVlr.valor)
        }
      }
      var perVlrMed = (parseFloat(somaLL) / parseFloat(somaVT) * 100).toFixed(1)
      var perNfsMed = (parseFloat(somaLL) / parseFloat(somaVF) * 100).toFixed(1)
      if (isNaN(perNfsMed)){
        perNfsMed = 0
      }
      const { _id } = req.user
      aviso.push({texto: 'Para todos os campos de valor utilizar ponto para separar os decimais e não usar ponto para separar os milhares.'})
      Projeto.find({ foiRealizado: false, user: _id }).sort({ dataord: 'asc' }).lean().then((dataord) => {
        var numprj = projetos.length
        Projeto.find({ foiRealizado: true, user: _id }).then((foiRealizado) => {
          var numprjrlz = foiRealizado.length
          Projeto.find({ foiRealizado: false, user: _id }).then((naoRealizado) => {
            var numprjnrl = naoRealizado.length
            Projeto.find({ orcado: true, user: _id }).lean().then((aberto) => {
              var qtdAberto = aberto.length
              Projeto.find({ executando: true, user: _id }).lean().then((executando) => {
                var qtdExecucao = executando.length
                Projeto.find({ parado: true, user: _id }).lean().then((parado) => {
                  var qtdParado = parado.length
                  Projeto.find({ homologado: true, user: _id }).lean().then((homologado) => {
                    var qtdHomologado = homologado.length
                    Realizado.find({ user: _id, foiRealizado: true }).lean().then((foiEntregue) => {
                      var qtdEntregue = foiEntregue.length
                      perRealizado = ((parseFloat(numprjrlz) / parseFloat(projetos.length)) * 100).toFixed(2)
                      var perEntregue = ((parseFloat(qtdEntregue) / parseFloat(projetos.length)) * 100).toFixed(2)
                      if (ehAdmin == 0) {
                        ehMaster = true
                      } else {
                        ehMaster = false
                      }
                      if (isNaN(perRealizado)){
                        perRealizado = 0
                      }
                      if (isNaN(perEntregue)){
                        perEntregue = 0
                      }                      
                      var totLista = parseFloat(qtdAberto) + parseFloat(qtdExecucao) + parseFloat(qtdParado) + parseFloat(qtdHomologado)

                      Configuracao.findOne({ user: _id, slug: 'Padrão' }).then((config) => {
                        console.log('encontrou algo')
                        if (!config) {
                          const configuracao = {
                            user: _id,
                            slug: 'Padrão',
                            potencia: 'Todas',
                            minatr: 120,
                            minest: 60,
                            minmod: 60,
                            mininv: 60,
                            hrstrb: '6.5',
                            /*
                            minart: req.body.minart,
                            minmem: req.body.minmem,
                            minsit: req.body.minsit,
                            minuni: req.body.minuni,
                            mindis: req.body.mindis,
                            minate: req.body.minate,
                            */
                            medkmh: 12
                          }
                    
                          new Configuracao(configuracao).save().then(() => {
                            res.render("menu", { aviso:aviso, numprjrlz: numprjrlz, numprjnrl: numprjnrl, numprj: numprj, foiRealizado: foiRealizado, naoRealizado: naoRealizado, dataord: dataord, perVlrMed: perVlrMed, perNfsMed: perNfsMed, perRealizado: perRealizado, id: _id, ehMaster: ehMaster, qtdAberto: qtdAberto, qtdExecucao: qtdExecucao, qtdParado: qtdParado, qtdHomologado: qtdHomologado, qtdEntregue: qtdEntregue, perEntregue: perEntregue, totLista: totLista })
                          }).catch((err) => {
                            req.flash('error_msg', 'Houve um erro ao salvar as configurações.')
                            res.redirect('/configuracao/novo')
                          })
                        }else{
                          res.render("menu", { aviso: aviso, numprjrlz: numprjrlz, numprjnrl: numprjnrl, numprj: numprj, foiRealizado: foiRealizado, naoRealizado: naoRealizado, dataord: dataord, perVlrMed: perVlrMed, perNfsMed: perNfsMed, perRealizado: perRealizado, id: _id, ehMaster: ehMaster, qtdAberto: qtdAberto, qtdExecucao: qtdExecucao, qtdParado: qtdParado, qtdHomologado: qtdHomologado, qtdEntregue: qtdEntregue, perEntregue: perEntregue, totLista: totLista })
                        }
                      })       
                      Empresa.findOne({ user: _id, nome: 'Padrão' }).then((empresa) => {
                        if (!empresa) {
                          const empresa = {
                            user: _id,
                            nome: 'Padrão',
                            cnpj: '',
                            empresa: '',
                            regime: 'Simples',
                            tipo: '',
                            alqDAS: '19.5',
                            alqICMS: 0,
                            alqIRPJ: 0,
                            alqIRPJAdd: 0,
                            alqCSLL: 0,
                            alqPIS: 0,
                            alqCOFINS: 0,
                            alqNFS: 4,
                            vlrred: 9900,
                            prjLR: 0,
                            prjFat: 500000,
                            prjLP: 0,
                            alqINSS: 0,
                            vlrDAS: 0,
                            tipodesp: 'potencia',
                            desadm: 15000,
                            perdes: 0,
                            estkwp: 200,
                          }

                          new Empresa(empresa).save().then(() => {
                            Empresa.findOne({ user: _id }).sort({ field: 'asc', _id: -1 }).then((empresa) => {
                              req.flash('success_msg', 'Configurações de tributos salvas com sucesso')
                              res.redirect('/configuracao/editempresa/' + empresa._id)
                            }).catch((err) => {
                              req.flash('error_msg', 'Houve um erro ao encontrar a empresa.')
                              res.redirect('/configuracao/empresa')
                            })
                          }).catch((err) => {
                            req.flash('error_msg', 'Houve um erro ao salvar a empresa.')
                            res.redirect('/configuracao/empresa')
                          })
                        }
                      })                                     
                      
                    }).catch((err) => {
                      req.flash("error_msg", "Ocorreu uma falha interna<Homologado>")
                      res.redirect("/")
                    })
                  }).catch((err) => {
                    req.flash("error_msg", "Ocorreu uma falha interna<Homologado>")
                    res.redirect("/")
                  })
                }).catch((err) => {
                  req.flash("error_msg", "Ocorreu uma falha interna<Parado>")
                  res.redirect("/")
                })
              }).catch((err) => {
                req.flash("error_msg", "Ocorreu uma falha interna<Executando>")
                res.redirect("/")
              })
            }).catch((err) => {
              req.flash("error_msg", "Ocorreu uma falha interna<Aberto>")
              res.redirect("/")
            })
          }).catch((err) => {
            req.flash("error_msg", "Ocorreu uma falha interna<Não foi Realizado>")
            res.redirect("/")
          })
        }).catch((err) => {
          req.flash("error_msg", "Ocorreu uma falha interna<Foi Realizado>")
          res.redirect("/")
        })
      }).catch((err) => {
        req.flash("error_msg", "Ocorreu uma falha interna<Realizado por Data>")
        res.redirect("/")
      })
    }).catch((err) => {
      req.flash("error_msg", "Ocorreu uma falha interna<Realizado Percentuais>")
      res.redirect("/")
    })
  }).catch((err) => {
    req.flash("error_msg", "Ocorreu uma falha interna par aencontrar projetos")
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

//Outros
//Acesso ao localhost
var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('Umbler listening on port %s', port);
});