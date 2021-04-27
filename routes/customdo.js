const express = require("express")
const router = express.Router()
const mongoose = require('mongoose')

require('../model/Projeto')
require('../model/Configuracao')
require('../model/Regime')
require('../model/Pessoa')
require('../model/Cliente')

const Projeto = mongoose.model('projeto')
const Configuracao = mongoose.model('configuracao')
const Regime = mongoose.model('regime')
const Pessoa = mongoose.model('pessoa')
const Cliente = mongoose.model('cliente')

const { ehAdmin } = require('../helpers/ehAdmin')

global.projeto_id
var rp
var p

require('../app')
//Configurando pasta de imagens 
router.use(express.static('imagens'))

router.get('/instalacao/:id', ehAdmin, (req, res) => {
     const { _id } = req.user
     var pi
     Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
          Pessoa.findOne({ _id: projeto.funins }).lean().then((projeto_ins) => {
               pi = projeto_ins
          }).catch((err) => {
               req.flash('error_msg', 'Houve um erro ao encontrar o instalador.')
               res.redirect('/consulta')
          })
          Pessoa.find({ funins: 'checked', user: _id }).lean().then((instalador) => {
               Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                    res.render('projeto/customdo/instalacao', { projeto: projeto, instalador: instalador, pi: pi, cliente: cliente })
               }).catch((err) => {
                    req.flash('error_msg', 'Nenhum cliente encontrado.')
                    res.redirect('/pessoa/consulta')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Nenhum regime encontrado')
               res.redirect('/pessoa/consulta')
          })
     }).catch((err) => {
          req.flash('error_msg', 'Nenhum projeto encontrado')
          res.redirect('/')
     })
})

router.get('/projetista/:id', ehAdmin, (req, res) => {
     const { _id } = req.user
     var pp
     Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
          Pessoa.findOne({ _id: projeto.funpro }).lean().then((projeto_pro) => {
               pp = projeto_pro
          }).catch((err) => {
               req.flash('error_msg', 'Houve um erro ao encontrar o instalador.')
               res.redirect('/consulta')
          })
          Pessoa.find({ funpro: 'checked', user: _id }).lean().then((projetista) => {
               Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                    res.render('projeto/customdo/projetista', { projeto: projeto, projetista: projetista, pp: pp, cliente: cliente })
               }).catch((err) => {
                    req.flash('error_msg', 'Nenhum cliente encontrado.')
                    res.redirect('/pessoa/consulta')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Nenhum regime encontrado.')
               res.redirect('/pessoa/consulta')
          })
     }).catch((err) => {
          req.flash('error_msg', 'Nenhum projeto encontrado.')
          res.redirect('/')
     })

})

router.get('/gestao/:id', ehAdmin, (req, res) => {
     const { _id } = req.user
     Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
          Pessoa.findOne({ _id: projeto.funres }).lean().then((projeto_res) => {
               pr = projeto_res
          }).catch((err) => {
               req.flash('error_msg', 'Houve um erro ao encontrar o instalador.')
               res.redirect('/consulta')
          })
          Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
               res.render('projeto/customdo/gestao', { projeto: projeto, pr: pr, cliente: cliente })
          }).catch((err) => {
               req.flash('error_msg', 'Nenhum cliente encontrado.')
               res.redirect('/pessoa/consulta')
          })
     }).catch((err) => {
          req.flash('error_msg', 'Nenhum projeto encontrado.')
          res.redirect('/')
     })
})

router.get('/editar/gestao/:id', ehAdmin, (req, res) => {
     const { _id } = req.user
     Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
          projeto_id = projeto._id

          //Busca regime cadastrado no projeto
          Regime.findOne({ _id: projeto.regime }).lean().then((regime_projeto) => {
               rp = regime_projeto
          }).catch((err) => {
               req.flash('error_msg', 'Houve uma falha ao encontrar o regime')
               res.redirect('/configuracao/consulta')
          })

          //Busca pessoa responsável pelo projeto
          Pessoa.findOne({ _id: projeto.funres }).lean().then((pessoa_res) => {
               pr = pessoa_res
          }).catch((err) => {
               req.flash('error_msg', 'Houve uma falha ao encontrar o regime')
               res.redirect('/configuracao/consulta')
          })

          Pessoa.find({ funres: 'checked', user: _id }).lean().then((responsavel) => {
               Regime.find({ user: _id }).lean().then((regime) => {
                    Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                         res.render('projeto/customdo/editgestao', { projeto: projeto, regime: regime, rp: rp, responsavel: responsavel, pr: pr, cliente: cliente })
                    }).catch((err) => {
                         req.flash('error_msg', 'Nenhum cliente encontrado.')
                         res.redirect('/pessoa/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao encontrar o regime')
                    res.redirect('/configuracao/consulta')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Houve uma falha ao encontrar a pessoa')
               res.redirect('/pessoa/consulta')
          })

     }).catch((err) => {
          req.flash('error_msg', 'Houve uma falha ao encontrar o projeto')
          res.redirect('/projeto/consulta')
     })

})

router.get('/editar/instalacao/:id', ehAdmin, (req, res) => {
     const { _id } = req.user
     var pi
     Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
          projeto_id = projeto._id
          Pessoa.findOne({ _id: projeto.funins }).lean().then((pessoa_ins) => {
               pi = pessoa_ins
          }).catch((err) => {
               req.flash('error_msg', 'Houve uma falha ao encontrar o instalador')
               res.redirect('/pessoa/consulta')
          })
          Pessoa.find({ funins: 'checked', user: _id }).lean().then((instalador) => {
               Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                    res.render('projeto/customdo/editinstalacao', { projeto: projeto, instalador: instalador, pi: pi, cliente: cliente })
               }).catch((err) => {
                    req.flash('error_msg', 'Nenhum cliente encontrado.')
                    res.redirect('/pessoa/consulta')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Houve uma falha ao encontrar um instalador')
               res.redirect('/pessoa/consulta')
          })
     }).catch((err) => {
          req.flash('error_msg', 'Houve uma falha ao encontrar o projeto')
          res.redirect('/projeto/consulta')
     })

})

router.get('/editar/projetista/:id', ehAdmin, (req, res) => {
     const { _id } = req.user
     Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {

          projeto_id = projeto._id

          Pessoa.findOne({ _id: projeto.funpro }).lean().then((pessoa_pro) => {
               pp = pessoa_pro
          }).catch((err) => {
               req.flash('error_msg', 'Houve uma falha ao encontrar o projetista')
               res.redirect('/pessoa/consulta')
          })

          Pessoa.find({ funpro: 'checked', user: _id }).lean().then((projetista) => {
               Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                    res.render('projeto/customdo/editprojetista', { projeto: projeto, projetista: projetista, pp: pp, cliente: cliente })
               }).catch((err) => {
                    req.flash('error_msg', 'Nenhum cliente encontrado.')
                    res.redirect('/pessoa/consulta')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Houve uma falha ao encontrar um projetista')
               res.redirect('/pessoa/consulta')
          })
     }).catch((err) => {
          req.flash('error_msg', 'Houve uma falha ao encontrar o projeto')
          res.redirect('/projeto/consulta')
     })
})

router.post('/instalacao/', ehAdmin, (req, res) => {
     const { _id } = req.user
     var erros = []

     if (!req.body.uniest || req.body.uniest == "" || typeof req.body.uniest == undefined) {
          erros.push({ texto: 'Preencer o valor de unidades dos equipamentos.' })
     }
     if (!req.body.unimod || req.body.unimod == null || typeof req.body.unimod == undefined) {
          erros.push({ texto: 'Preencer o valor de unidades dos modulos.' })
     }
     if (!req.body.uniinv || req.body.uniinv == null || typeof req.body.uniinv == undefined) {
          erros.push({ texto: 'Preencer o valor de unidades dos inversores.' })
     }
     if (!req.body.uniatr || req.body.uniatr == null || typeof req.body.uniatr == undefined) {
          erros.push({ texto: 'Preencer o valor de unidades do aterramento.' })
     }
     if (!req.body.vlrhri || req.body.vlrhri == null) {
          erros.push({ texto: 'Preencer o valor R$/hora dos instaladores.' })
     }

     if (erros.length > 0) {
          Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {
               Pessoa.find({ funins: 'checked', user: _id }).lean(); then((instalador) => {
                    Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                         res.render('projeto/customdo/instalacao', { erros: erros, projeto: projeto, instalador: instalador, cliente: cliente })
                    }).catch((err) => {
                         req.flash('error_msg', 'Nenhum cliente encontrado.')
                         res.redirect('/pessoa/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro interno.')
                    res.redirect('/projeto/consulta')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Houve um erro interno.')
               res.redirect('/projeto/consulta')
          })
     } else {

          Projeto.findOne({ _id: req.body.id }).then((projeto) => {

               Configuracao.findOne({ _id: projeto.configuracao }).then((config) => {

                    var trbatr = Math.round(parseFloat(req.body.uniatr) * (parseFloat(config.minatr) / 60))
                    var trbest = Math.round(parseFloat(req.body.uniest) * (parseFloat(config.minest) / 60))
                    var trbmod = Math.round(parseFloat(req.body.unimod) * (parseFloat(config.minmod) / 60))
                    var trbinv = Math.round(parseFloat(req.body.uniinv) * (parseFloat(config.mininv) / 60))

                    var totatr = Math.round(parseFloat(trbatr) * parseFloat(req.body.vlrhri))
                    var totest = Math.round((parseFloat(trbest) / 3) * parseFloat(req.body.vlrhri) * 3)
                    var totmod = Math.round((parseFloat(trbmod) / 3) * parseFloat(req.body.vlrhri) * 3)
                    var totinv = Math.round(parseFloat(trbinv) * parseFloat(req.body.vlrhri))

                    var totint = (parseFloat(totest) + parseFloat(totmod) + parseFloat(totinv) + parseFloat(totatr)).toFixed(2)

                    var trbint = Math.round(parseFloat(trbest) + parseFloat(trbmod) + parseFloat(trbinv) + parseFloat(trbatr))

                    var sucesso = []

                    projeto.qtdequipe = 3
                    projeto.vlrhri = req.body.vlrhri
                    projeto.uniatr = req.body.uniatr
                    projeto.trbatr = trbatr
                    projeto.uniest = req.body.uniest
                    projeto.trbest = trbest
                    projeto.unimod = req.body.unimod
                    projeto.trbmod = trbmod
                    projeto.uniinv = req.body.uniinv
                    projeto.trbinv = trbinv
                    projeto.totest = totest
                    projeto.totmod = totmod
                    projeto.totatr = totatr
                    projeto.totinv = totinv
                    projeto.totint = totint
                    projeto.trbint = trbint
                    if (req.body.pinome == null) {
                         projeto.funins = req.body.funins
                    }
                    console.log('vlrhri=>'+req.body.vlrhri)
                    console.log('uniatr=>'+req.body.uniatr)
                    console.log('trbatr=>'+trbatr)
                    console.log('uniest=>'+req.body.uniest)
                    console.log('trbest=>'+trbest)
                    console.log('unimod=>'+req.body.unimod)
                    console.log('trbmod=>'+trbmod)
                    console.log('uniinv=>'+trbinv)
                    console.log('trbinv=>'+totest)
                    console.log('totest=>'+totmod)
                    console.log('totmod=>'+totatr)
                    console.log('totatr=>'+totinv)
                    console.log('totinv=>'+totint)
                    console.log('totest=>'+totint)
                    console.log('trbint=>'+trbint)
                    console.log('funins=>'+req.body.funins)



                    projeto.save().then(() => {
                         sucesso.push({ texto: 'Custo de instalação aplicado com sucesso' })
                         Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {
                              Pessoa.findOne({ _id: projeto.funins }).lean().then((pessoa_funins) => {
                                   pi = pessoa_funins
                              }).catch((err) => {
                                   req.flash('error_msg', 'Hove uma falha interna')
                                   res.redirect('/pessoa/consulta')
                              })
                              Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                                   res.render('projeto/customdo/instalacao', { sucesso: sucesso, projeto: projeto, pi: pi, cliente: cliente })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Nenhum cliente encontrado.')
                                   res.redirect('/pessoa/consulta')
                              })

                         }).catch((err) => {
                              req.flash('error_msg', 'Hove uma falha interna')
                              res.redirect('/projeto/consulta')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Falha ao aplicar os custos do projeto')
                         res.redirect('/projeto/consulta')
                    })

               }).catch((err) => {
                    req.flash('error_msg', 'Falha ao encontrar as configurações')
                    res.redirect('/configuracao/consulta')
               })

          }).catch((err) => {
               req.flash('error_msg', 'Falha ao encontrar o projeto')
               res.redirect('/projeto/consulta')
          })
     }

})

router.post('/projetista/', ehAdmin, (req, res) => {
     const { _id } = req.user
     var erros = []

     if (!req.body.trbsit || req.body.trbsit == null || typeof req.body.trbsit == undefined) {
          erros.push({ texto: 'Preencer o tempo de elaboração do diagrama de situação.' })
     }
     if (!req.body.trbuni || req.body.trbuni == null || typeof req.body.trbuni == undefined) {
          erros.push({ texto: 'Preencer o tempo de elaboração do diagrama unifiliares.' })
     }
     if (!req.body.trbdis || req.body.trbdis == null || typeof req.body.trbdis == undefined) {
          erros.push({ texto: 'Preencer o tempo de elaboração do diagrama de distribuição dos módulos.' })
     }
     if (!req.body.trbate || req.body.trbate == null || typeof req.body.trbate == undefined) {
          erros.push({ texto: 'Preencer o tempo de elaboração do diagrama de aterramento.' })
     }
     if (!req.body.trbart || req.body.trbart == null || typeof req.body.trbart == undefined) {
          erros.push({ texto: 'Preencer o tempo de elaboração do ART.' })
     }

     if (!req.body.vlrart || req.body.vlrart == null) {
          erros.push({ texto: 'Preencer o valor da ART.' })
     }

     if (!req.body.trbmem || req.body.trbmem == null || typeof req.body.trbmem == undefined) {
          erros.push({ texto: 'Preencer o tempo de elaboração do Memorial descritivo.' })
     }
     if (!req.body.vlrhrp || req.body.vlrhrp == null) {
          erros.push({ texto: 'Preencer o valor R$/hora dos projetistas.' })
     }

     if (erros.length > 0) {
          Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {
               Pessoa.find({ funpro: 'checked', user: _id }).lean().then((projetista) => {
                    Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                         res.render('projeto/customdo/projetista', { erros: erros, projeto: projeto, projetista: projetista, cliente: cliente })
                    }).catch((err) => {
                         req.flash('error_msg', 'Nenhum cliente encontrado.')
                         res.redirect('/pessoa/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro interno.')
                    res.redirect('projeto/consulta')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Houve um erro interno.')
               res.redirect('projeto/consulta')
          })
     } else {

          Projeto.findOne({ _id: req.body.id }).then((projeto) => {

               var trbsit = req.body.trbsit
               var trbuni = req.body.trbuni
               var trbdis = req.body.trbdis
               var trbate = req.body.trbate
               var trbart = req.body.trbart
               var trbmem = req.body.trbmem
               var totsit = (parseFloat(trbsit) * parseFloat(req.body.vlrhrp)).toFixed(2)
               var totuni = (parseFloat(trbuni) * parseFloat(req.body.vlrhrp)).toFixed(2)
               var totdis = (parseFloat(trbdis) * parseFloat(req.body.vlrhrp)).toFixed(2)
               var totate = (parseFloat(trbate) * parseFloat(req.body.vlrhrp)).toFixed(2)
               var totart = (parseFloat(trbart) * parseFloat(req.body.vlrhrp)).toFixed(2)
               var totmem = (parseFloat(trbmem) * parseFloat(req.body.vlrhrp)).toFixed(2)

               var vlrart = req.body.vlrart

               var totpro = parseFloat(totsit) + parseFloat(totuni) + parseFloat(totdis) + parseFloat(totate) + parseFloat(totart) + parseFloat(totmem) + parseFloat(vlrart)

               var trbpro = Math.round(parseFloat(trbsit) + parseFloat(trbuni) + parseFloat(trbdis) + parseFloat(trbate) + parseFloat(trbart) + parseFloat(trbmem))

               var sucesso = []

               projeto.vlrhrp = req.body.vlrhrp
               //projeto.unisit = req.body.unisit
               projeto.trbsit = trbsit
               //projeto.uniuni = req.body.uniuni
               projeto.trbuni = trbuni
               //projeto.unidis = req.body.unidis
               projeto.trbdis = trbdis
               //projeto.uniate = req.body.uniate
               projeto.trbate = trbate
               //projeto.uniart = req.body.uniart
               projeto.trbart = trbart
               //projeto.unimem = req.body.unimem
               projeto.vlrart = vlrart
               projeto.trbmem = trbmem
               projeto.totsit = totsit
               projeto.totuni = totuni
               projeto.totdis = totdis
               projeto.totate = totate
               projeto.totart = totart
               projeto.totmem = totmem
               projeto.trbpro = trbpro
               projeto.totpro = totpro
               if (req.body.ppnome == null) {
                    projeto.funpro = req.body.funpro
               }

               projeto.save().then(() => {
                    sucesso.push({ texto: 'Custo de projetistas aplicado com sucesso' })
                    Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {
                         Pessoa.findOne({ _id: projeto.funpro }).lean().then((pessoa_funpro) => {
                              pp = pessoa_funpro
                         }).catch((err) => {
                              req.flash('error_msg', 'Hove uma falha interna.')
                              res.redirect('/pessoa/consulta')
                         })
                         Regime.find({ user: _id }).lean().then((regime) => {
                              Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                                   res.render('projeto/customdo/projetista', { sucesso: sucesso, projeto: projeto, regime: regime, pp: pp, cliente: cliente })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Nenhum cliente encontrado.')
                                   res.redirect('/pessoa/consulta')
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Hove uma falha interna.')
                              res.redirect('/configuracao/consultaregime')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Hove uma falha interna.')
                         res.redirect('/projeto/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Falha ao aplicar os custos do projeto.')
                    res.redirect('/projeto/consulta')
               })

          }).catch((err) => {
               req.flash('error_msg', 'Falha ao encontrar o projeto.')
               res.redirect('/projeto/consulta')
          })
     }

})

router.post('/gestao/', ehAdmin, (req, res) => {
     const { _id } = req.user
     var erros = []

     if (!req.body.trbvis || req.body.trbvis == null || typeof req.body.trbvis == undefined) {
          erros.push({ texto: 'Preencer as horas de vistoria' })
     }
     if (!req.body.trbcom || req.body.trbcom == null || typeof req.body.trbcom == undefined) {
          erros.push({ texto: 'Preencer as horas de comunicação' })
     }
     if (!req.body.trbcro || req.body.trbcro == null || typeof req.body.trbcro == undefined) {
          erros.push({ texto: 'Preencer as horas de cronograma' })
     }
     if (!req.body.trbrec || req.body.trbrec == null || typeof req.body.trbrec == undefined) {
          erros.push({ texto: 'Preencer as horas de alocação de recursos' })
     }
     if (!req.body.trbaqi || req.body.trbaqi == null || typeof req.body.trbaqi == undefined) {
          erros.push({ texto: 'Preencer as horas de aquisições' })
     }
     if (!req.body.vlrhrg || req.body.vlrhrg == null) {
          erros.push({ texto: 'Preencer o valor R$/hora da gestão' })
     }

     if (erros.length > 0) {
          Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {
               Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                    res.render('projeto/customdo/gestao', { erros: erros, projeto: projeto, cliente: cliente })
               }).catch((err) => {
                    req.flash('error_msg', 'Nenhum cliente encontrado.')
                    res.redirect('/pessoa/consulta')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Houve um erro interno.')
               res.redirect('/projeto/novo')
          })
     } else {

          Projeto.findOne({ _id: req.body.id }).then((projeto) => {

               var totesc = (parseFloat(req.body.trbesc) * parseFloat(req.body.vlrhrg)).toFixed(2)
               var totvis = (parseFloat(req.body.trbvis) * parseFloat(req.body.vlrhrg)).toFixed(2)
               var totcom = (parseFloat(req.body.trbcom) * parseFloat(req.body.vlrhrg)).toFixed(2)
               var totcro = (parseFloat(req.body.trbcro) * parseFloat(req.body.vlrhrg)).toFixed(2)
               var totaqi = (parseFloat(req.body.trbaqi) * parseFloat(req.body.vlrhrg)).toFixed(2)
               var totrec = (parseFloat(req.body.trbrec) * parseFloat(req.body.vlrhrg)).toFixed(2)

               var totges = (parseFloat(totvis) + parseFloat(totcom) + parseFloat(totcro) + parseFloat(totaqi) + parseFloat(totrec) + parseFloat(totesc)).toFixed(2)

               var trbges = Math.round(parseFloat(req.body.trbvis) + parseFloat(req.body.trbcom) + parseFloat(req.body.trbcro) + parseFloat(req.body.trbaqi) + parseFloat(req.body.trbrec) + parseFloat(req.body.trbesc))

               var sucesso = []

               projeto_id = projeto._id

               projeto.vlrhrg = req.body.vlrhrg
               projeto.trbvis = req.body.trbvis
               projeto.trbcom = req.body.trbcom
               projeto.trbcro = req.body.trbcro
               projeto.trbaqi = req.body.trbaqi
               projeto.trbrec = req.body.trbrec
               projeto.trbesc = req.body.trbesc
               projeto.totvis = totvis
               projeto.totcom = totcom
               projeto.totcro = totcro
               projeto.totaqi = totaqi
               projeto.totrec = totrec
               projeto.totesc = totesc
               projeto.totges = totges
               projeto.trbges = trbges

               projeto.save().then(() => {
                    sucesso.push({ texto: 'Custo de gestão aplicado com sucesso' })
                    projeto_id = projeto._id
                    Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {
                         Pessoa.findOne({ _id: projeto.funres }).lean().then((pessoa_funres) => {
                              pr = pessoa_funres

                              Regime.find({ user: _id }).lean().then((regime) => {
                                   Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                                        //projeto_id = projeto._id
                                        res.render('projeto/customdo/gestao', { sucesso: sucesso, projeto: projeto, regime: regime, cliente: cliente, pr:pr })
                                   }).catch((err) => {
                                        req.flash('error_msg', 'Nenhum cliente encontrado.')
                                        res.redirect('/pessoa/consulta')
                                   })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Hove uma falha interna')
                                   res.redirect('/projeto/consulta')
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Hove uma falha interna')
                              res.redirect('/pessoa/consulta')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Hove uma falha interna')
                         res.redirect('/projeto')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Falha ao aplicar os custos do projeto')
                    res.redirect('/projeto')
               })
          })
     }
})

router.post('/editar/instalacao/', ehAdmin, (req, res) => {
     const { _id } = req.user
     var erros = []
     var sucesso = []

     if (!req.body.uniest || req.body.uniest == "" || typeof req.body.uniest == undefined) {
          erros.push({ texto: 'Preencer o valor de unidades dos equipamentos' })
     }
     if (!req.body.unimod || req.body.unimod == null || typeof req.body.unimod == undefined) {
          erros.push({ texto: 'Preencer o valor de unidades dos modulos' })
     }
     if (!req.body.uniinv || req.body.uniinv == null || typeof req.body.uniinv == undefined) {
          erros.push({ texto: 'Preencer o valor de unidades dos inversores' })
     }
     if (!req.body.uniatr || req.body.uniatr == null || typeof req.body.uniatr == undefined) {
          erros.push({ texto: 'Preencer o valor de unidades do aterramento.' })
     }
     if (!req.body.vlrhri || req.body.vlrhri == null) {
          erros.push({ texto: 'Preencer o valor R$/hora dos instaladores' })
     }

     if (erros.length > 0) {
          Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {

               Pessoa.findOne({ _id: projeto.funins }).lean().then((pessoa_funins) => {
                    pi = pessoa_funins
               }).catch((err) => {
                    req.flash('error_msg', 'Hove uma falha interna')
                    res.redirect('/pessoa/consulta')
               })

               Pessoa.find({ funins: 'checked', user: _id }).lean().then((instalador) => {
                    Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                         res.render('projeto/customdo/editinstalacao', { erros: erros, projeto: projeto, instalador: instalador, pp: pp, cliente: cliente })
                    }).catch((err) => {
                         req.flash('error_msg', 'Nenhum cliente encontrado.')
                         res.redirect('/pessoa/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro interno.')
                    res.redirect('/projeto/consulta')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Houve um erro interno.')
               res.redirect('/projeto/consulta')
          })
     } else {

          Projeto.findOne({ _id: req.body.id }).then((projeto) => {

               Configuracao.findOne({ _id: projeto.configuracao }).then((config) => {

                    var tothrs

                    projeto_id = projeto._id

                    //Edição dos Custos de Instalação
                    var totest
                    var totmod
                    var trbatr = Math.round(parseFloat(req.body.uniatr) * (parseFloat(config.minatr) / 60))
                    var totatr = Math.round(parseFloat(trbatr) * parseFloat(req.body.vlrhri))

                    if (parseFloat(projeto.unimod) > 13 && parseFloat(projeto.uniest) > 3 && parseFloat(projeto.qtdequipe) > 5){
                         var trbest = Math.round(parseFloat(req.body.uniest) * (parseFloat(config.minest) * 2 / (parseFloat(projeto.qtdequipe)-2) / 60))
                         var trbmod = Math.round(parseFloat(req.body.unimod) * (parseFloat(config.minmod) * 2 / (parseFloat(projeto.qtdequipe)-2) / 60))                         
                         totest = (parseFloat(trbest) * parseFloat(req.body.vlrhri)).toFixed(2)
                         totmod = (parseFloat(trbmod) * parseFloat(req.body.vlrhri)).toFixed(2)                         
                    }else{
                         var trbest = Math.round(parseFloat(req.body.uniest) * (parseFloat(config.minest) / 60))
                         var trbmod = Math.round(parseFloat(req.body.unimod) * (parseFloat(config.minmod) / 60))
                         if (projeto.qtdequipe > 3) {
                              var insadd  = (parseFloat(projeto.qtdequipe) - 3)
                              console.log('insadd=>'+insadd)
                              var vlrins = (6 * parseFloat(req.body.vlrhri) * insadd)
                              console.log('vlrins=>'+vlrins)
     
                              totest = ((parseFloat(trbest) * parseFloat(req.body.vlrhri)) + parseFloat(vlrins)).toFixed(2)
                              totmod = ((parseFloat(trbmod) * parseFloat(req.body.vlrhri)) + parseFloat(vlrins)).toFixed(2)
                         }else{
                              totest = (parseFloat(trbest) * parseFloat(req.body.vlrhri)).toFixed(2)
                              totmod = (parseFloat(trbmod) * parseFloat(req.body.vlrhri)).toFixed(2)
                         }                         
                    }

                    var trbinv = Math.round(parseFloat(req.body.uniinv) * (parseFloat(config.mininv) / 60))
                    var totinv = Math.round(parseFloat(trbinv) * parseFloat(req.body.vlrhri))

                    var totint = (parseFloat(totest) + parseFloat(totmod) + parseFloat(totinv) + parseFloat(totatr)).toFixed(2)
                    var trbint = Math.round(parseFloat(trbest) + parseFloat(trbmod) + parseFloat(trbinv) + parseFloat(trbatr))

                    tothrs = parseFloat(trbint)
                    if (projeto.trbpro != null) {
                         tothrs = tothrs + parseFloat(projeto.trbpro)
                    }
                    if (projeto.trbges != null) {
                         tothrs = tothrs + parseFloat(projeto.trbges)
                    }

                    projeto.vlrhri = req.body.vlrhri
                    projeto.uniatr = req.body.uniatr
                    projeto.trbatr = trbatr
                    projeto.uniest = req.body.uniest
                    projeto.trbest = trbest
                    projeto.unimod = req.body.unimod
                    projeto.trbmod = trbmod
                    projeto.uniinv = req.body.uniinv
                    projeto.trbinv = trbinv
                    projeto.totest = totest
                    projeto.totmod = totmod
                    projeto.totinv = totinv
                    projeto.totatr = totatr
                    projeto.totint = totint
                    projeto.trbint = trbint

                    if (req.body.checkIns != null) {
                         projeto.funins = req.body.funins
                    }

                    projeto.save().then(() => {
                         sucesso.push({ texto: 'Custo de instalação aplicado com sucesso. Aplicar o gerenciamento e os tributos' })
                         var pi
                         Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {

                              Pessoa.findOne({ _id: projeto.funins }).lean().then((pessoa_ins) => {
                                   pi = pessoa_ins
                              }).catch((err) => {
                                   req.flash('error_msg', 'Hove uma falha interna')
                                   res.redirect('/pessoa/consulta')
                              })

                              Pessoa.find({ funins: 'checked', user: _id }).lean().then((instalador) => {

                                   Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                                        res.render('projeto/customdo/editinstalacao', { sucesso: sucesso, projeto: projeto, pi: pi, instalador: instalador, cliente: cliente })
                                   }).catch((err) => {
                                        req.flash('error_msg', 'Nenhum cliente encontrado.')
                                        res.redirect('/pessoa/consulta')
                                   })

                              }).catch((err) => {
                                   req.flash('error_msg', 'Hove uma falha interna')
                                   res.redirect('/pessoa/consulta')
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Hove uma falha interna')
                              res.redirect('/projeto/consulta')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Falha ao aplicar os custos do projeto')
                         res.redirect('/projeto/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Falha ao encontrar a configuração')
                    res.redirect('/configuracao/consulta')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Falha ao encontrar o projeto')
               res.redirect('/projeto/consulta')
          })
     }

})

router.post('/editar/projetista/', ehAdmin, (req, res) => {
     const { _id } = req.user
     var erros = []

     if (!req.body.trbsit || req.body.trbsit == null || typeof req.body.trbsit == undefined) {
          erros.push({ texto: 'Preencer o tempo de elaboração do diagrama de situação' })
     }
     if (!req.body.trbuni || req.body.trbuni == null || typeof req.body.trbuni == undefined) {
          erros.push({ texto: 'Preencer o tempo de elaboração do diagrama unifiliares' })
     }
     if (!req.body.trbdis || req.body.trbdis == null || typeof req.body.trbdis == undefined) {
          erros.push({ texto: 'Preencer o tempo de elaboração do diagrama de distribuição dos módulos' })
     }
     if (!req.body.trbate || req.body.trbate == null || typeof req.body.trbate == undefined) {
          erros.push({ texto: 'Preencer o tempo de elaboração do diagrama de aterramento' })
     }
     if (!req.body.trbart || req.body.trbart == null || typeof req.body.trbart == undefined) {
          erros.push({ texto: 'Preencer o tempo de elaboração do ART' })
     }
     if (!req.body.vlrart || req.body.vlrart == null) {
          erros.push({ texto: 'Preencer o valor da ART' })
     }
     if (!req.body.trbmem || req.body.trbmem == null || typeof req.body.trbmem == undefined) {
          erros.push({ texto: 'Preencer o tempo de elaboração do Memorial descritivo' })
     }
     if (!req.body.vlrhrp || req.body.vlrhrp == null) {
          erros.push({ texto: 'Preencer o valor R$/hora dos projetistas' })
     }

     if (erros.length > 0) {
          Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {

               Pessoa.findOne({ _id: projeto.funpro }).lean().then((pessoa_funpro) => {
                    pp = pessoa_funpro
               }).catch((err) => {
                    req.flash('error_msg', 'Hove uma falha interna')
                    res.redirect('/pessoa/consulta')
               })

               Pessoa.find({ funpro: 'checked', user: _id }).lean().then((projetista) => {
                    Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                         res.render('projeto/customdo/editprojetista', { erros: erros, projeto: projeto, projetista: projetista, pp: pp, cliente: cliente })
                    }).catch((err) => {
                         req.flash('error_msg', 'Nenhum cliente encontrado.')
                         res.redirect('/pessoa/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro interno.')
                    res.redirect('projeto/consulta')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Houve um erro interno.')
               res.redirect('projeto/consulta')
          })
     } else {

          Projeto.findOne({ _id: req.body.id }).then((projeto) => {

               var sucesso = []
               var tothrs

               projeto_id = projeto._id

               //Edição dos Custos do Projetista
               var trbsit = req.body.trbsit
               var trbuni = req.body.trbuni
               var trbdis = req.body.trbdis
               var trbate = req.body.trbate
               var trbart = req.body.trbart
               var trbmem = req.body.trbmem
               var totsit = (parseFloat(trbsit) * parseFloat(req.body.vlrhrp)).toFixed(2)
               var totuni = (parseFloat(trbuni) * parseFloat(req.body.vlrhrp)).toFixed(2)
               var totdis = (parseFloat(trbdis) * parseFloat(req.body.vlrhrp)).toFixed(2)
               var totate = (parseFloat(trbate) * parseFloat(req.body.vlrhrp)).toFixed(2)
               var totart = (parseFloat(trbart) * parseFloat(req.body.vlrhrp)).toFixed(2)
               var totmem = (parseFloat(trbmem) * parseFloat(req.body.vlrhrp)).toFixed(2)

               var vlrart = req.body.vlrart

               var totpro = (parseFloat(totsit) + parseFloat(totuni) + parseFloat(totdis) + parseFloat(totate) + parseFloat(totart) + parseFloat(totmem) + parseFloat(vlrart)).toFixed(2)

               var trbpro = Math.round(parseFloat(trbsit) + parseFloat(trbuni) + parseFloat(trbdis) + parseFloat(trbate) + parseFloat(trbart) + parseFloat(trbmem))

               tothrs = parseFloat(trbpro)
               if (projeto.trbint != null) {
                    tothrs = tothrs + parseFloat(projeto.trbint)
               }
               if (projeto.trbges != null) {
                    tothrs = tothrs + parseFloat(projeto.trbges)
               }

               projeto.vlrhrp = req.body.vlrhrp
               projeto.trbsit = trbsit
               projeto.trbuni = trbuni
               projeto.trbdis = trbdis
               projeto.trbate = trbate
               projeto.trbart = trbart
               projeto.vlrart = vlrart
               projeto.trbmem = trbmem
               projeto.totsit = totsit
               projeto.totuni = totuni
               projeto.totdis = totdis
               projeto.totate = totate
               projeto.totart = totart
               projeto.totmem = totmem
               projeto.trbpro = trbpro
               projeto.totpro = totpro
               projeto.tothrs = tothrs
               if (req.body.checkPro != null) {
                    projeto.funpro = req.body.funpro
               }

               projeto.save().then(() => {

                    sucesso.push({ texto: 'Custo de projetistas aplicado com sucesso. Aplicar o gerenciamento e os tributos' })

                    Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {
                         Pessoa.findOne({ _id: projeto.funpro }).lean().then((pessoa_funpro) => {
                              pp = pessoa_funpro
                         }).catch((err) => {
                              req.flash('error_msg', 'Hove uma falha interna')
                              res.redirect('/pessoa/consulta')
                         })
                         Pessoa.find({ funpro: 'checked', user: _id }).lean().then((projetista) => {

                              Regime.find({ user: _id }).lean().then((regime) => {
                                   Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                                        res.render('projeto/customdo/editprojetista', { sucesso: sucesso, projeto: projeto, projetista: projetista, regime: regime, pp: pp, cliente: cliente })
                                   }).catch((err) => {
                                        req.flash('error_msg', 'Nenhum cliente encontrado.')
                                        res.redirect('/pessoa/consulta')
                                   })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Hove uma falha interna')
                                   res.redirect('/projeto/consulta')
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Hove uma falha interna')
                              res.redirect('/pessoa/consulta')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Hove uma falha interna')
                         res.redirect('/projeto/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Falha ao aplicar os custos do projeto')
                    res.redirect('/projeto/consulta')
               })

          }).catch((err) => {
               req.flash('error_msg', 'Falha ao encontrar o projeto')
               res.redirect('/projeto/consulta')
          })
     }

})

router.post('/editar/gestao/', ehAdmin, (req, res) => {
     const { _id } = req.user
     var erros = []

     if (!req.body.trbvis || req.body.trbvis == null || typeof req.body.trbvis == undefined) {
          erros.push({ texto: 'Preencer as horas de vistoria' })
     }
     if (!req.body.trbcom || req.body.trbcom == null || typeof req.body.trbcom == undefined) {
          erros.push({ texto: 'Preencer as horas de comunicação' })
     }
     if (!req.body.trbcro || req.body.trbcro == null || typeof req.body.trbcro == undefined) {
          erros.push({ texto: 'Preencer as horas de cronograma' })
     }
     if (!req.body.trbrec || req.body.trbrec == null || typeof req.body.trbrec == undefined) {
          erros.push({ texto: 'Preencer as horas de alocação de recursos' })
     }
     if (!req.body.trbaqi || req.body.trbaqi == null || typeof req.body.trbaqi == undefined) {
          erros.push({ texto: 'Preencer as horas de aquisições' })
     }
     if (!req.body.vlrhrg || req.body.vlrhrg == null) {
          erros.push({ texto: 'Preencer o valor R$/hora da gestão' })
     }

     if (erros.length > 0) {
          Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {
               Regime.findOne({ user: _id }).lean().then((regime) => {
                    Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                         res.render('projeto/customdo/editgestao', { erros: erros, projeto: projeto, regime: regime, rp: rp, responsavel: responsavel, pr: pr, cliente: cliente })
                    }).catch((err) => {
                         req.flash('error_msg', 'Nenhum cliente encontrado.')
                         res.redirect('/pessoa/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro interno.')
                    res.redirect('projeto/consulta', { erros: erros, projeto: projeto })
               })
          }).catch((err) => {
               req.flash('error_msg', 'Houve um erro interno.')
               res.redirect('projeto/consulta', { erros: erros, projeto: projeto })
          })
     } else {

          Projeto.findOne({ _id: req.body.id }).then((projeto) => {

               var sucesso = []
               var tothrs

               projeto_id = projeto._id

               //Validação de check box  
               var cercamento
               var poste
               var estsolo

               if (req.body.cercamento != null) {
                    cercamento = 'checked'
               }
               if (req.body.poste != null) {
                    poste = 'checked'
               }
               if (req.body.estsolo != null) {
                    estsolo = 'checked'
               }

               //Edição dos Custos de Gestão
               var totesc = (parseFloat(req.body.trbesc) * parseFloat(req.body.vlrhrg)).toFixed(2)
               var totvis = (parseFloat(req.body.trbvis) * parseFloat(req.body.vlrhrg)).toFixed(2)
               var totcom = (parseFloat(req.body.trbcom) * parseFloat(req.body.vlrhrg)).toFixed(2)
               var totcro = (parseFloat(req.body.trbcro) * parseFloat(req.body.vlrhrg)).toFixed(2)
               var totaqi = (parseFloat(req.body.trbaqi) * parseFloat(req.body.vlrhrg)).toFixed(2)
               var totrec = (parseFloat(req.body.trbrec) * parseFloat(req.body.vlrhrg)).toFixed(2)

               var totges = (parseFloat(totvis) + parseFloat(totcom) + parseFloat(totcro) + parseFloat(totaqi) + parseFloat(totrec) + parseFloat(totesc)).toFixed(2)

               var trbges = Math.round(parseFloat(req.body.trbvis) + parseFloat(req.body.trbcom) + parseFloat(req.body.trbcro) + parseFloat(req.body.trbaqi) + parseFloat(req.body.trbrec) + parseFloat(req.body.trbesc))

               tothrs = parseFloat(trbges)
               if (projeto.trbpro != null) {
                    tothrs = tothrs + parseFloat(projeto.trbpro)
               }
               if (projeto.trbint != null) {
                    tothrs = tothrs + parseFloat(projeto.trbint)
               }

               projeto.vlrhrg = req.body.vlrhrg
               projeto.trbvis = req.body.trbvis
               projeto.trbcom = req.body.trbcom
               projeto.trbcro = req.body.trbcro
               projeto.trbaqi = req.body.trbaqi
               projeto.trbrec = req.body.trbrec
               projeto.trbesc = req.body.trbesc
               projeto.totvis = totvis
               projeto.totcom = totcom
               projeto.totcro = totcro
               projeto.totaqi = totaqi
               projeto.totrec = totrec
               projeto.totesc = totesc
               projeto.totges = totges
               projeto.trbges = trbges
               projeto.tothrs = tothrs

               projeto.save().then(() => {

                    sucesso.push({ texto: 'Custo de gestão aplicado com sucesso. Aplicar o gerenciamento e os tributos' })

                    Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {

                         projeto_id = projeto._id

                         Pessoa.findOne({ _id: projeto.funres }).lean().then((pessoa_res) => {
                              pr = pessoa_res

                              Regime.find({ user: _id }).lean().then((regime) => {
                                   Pessoa.find({ funges: 'checked', user: _id }).lean().then((responsavel) => {
                                        Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                                             res.render('projeto/customdo/editgestao', { sucesso: sucesso, projeto: projeto, regime: regime, rp: rp, responsavel: responsavel, pr: pr, cliente: cliente })
                                        }).catch((err) => {
                                             req.flash('error_msg', 'Nenhum cliente encontrado.')
                                             res.redirect('/pessoa/consulta')
                                        })
                                   }).catch((err) => {
                                        req.flash('error_msg', 'Hove uma falha interna')
                                        res.redirect('/pessoa/consulta')
                                   })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Hove uma falha interna')
                                   res.redirect('/configuracao/consultaregime')
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Hove uma falha interna')
                              res.redirect('/pessoa/consulta')
                         })

                    }).catch((err) => {
                         req.flash('error_msg', 'Hove uma falha interna')
                         res.redirect('/projeto/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Falha ao aplicar os custos do projeto')
                    res.redirect('/projeto/consulta')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Falha ao encontrar o projeto')
               res.redirect('/projeto/consulta')
          })
     }
})


module.exports = router
