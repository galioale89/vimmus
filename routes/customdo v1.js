const express = require("express")
const router = express.Router()
const mongoose = require('mongoose')

require('../model/Projeto')
require('../model/Configuracao')
require('../model/Empresa')
require('../model/Pessoa')
require('../model/Cliente')

const Projeto = mongoose.model('projeto')
const Configuracao = mongoose.model('configuracao')
const Empresa = mongoose.model('empresa')
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
                    Configuracao.findOne({ _id: projeto.configuracao }).lean().then((configuracao) => {
                         res.render('projeto/customdo/instalacao', { projeto: projeto, instalador: instalador, configuracao: configuracao, pi: pi, cliente: cliente })
                    }).catch((err) => {
                         req.flash('error_msg', 'Nenhuma configuração encontrada.')
                         res.redirect('/pessoa/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Nenhum cliente encontrado.')
                    res.redirect('/pessoa/consulta')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Nenhuma pessoa encontrada.')
               res.redirect('/pessoa/consulta')
          })
     }).catch((err) => {
          req.flash('error_msg', 'Nenhum projeto encontrado.')
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
                    Configuracao.findOne({ _id: projeto.configuracao }).lean().then((configuracao) => {
                         var fatura
                         if (projeto.fatequ != null) {
                              fatura = 'checked'
                         } else {
                              fatura = 'uncheked'
                         }
                         res.render('projeto/customdo/projetista', { projeto: projeto, projetista: projetista, configuracao: configuracao, pp: pp, cliente: cliente, fatura: fatura })
                    }).catch((err) => {
                         req.flash('error_msg', 'Nenhuma configuração encontrada.')
                         res.redirect('/pessoa/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Nenhum cliente encontrado.')
                    res.redirect('/pessoa/consulta')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Nenhuma pessoa encontrada.')
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
               Configuracao.findOne({ _id: projeto.configuracao }).lean().then((configuracao) => {
                    res.render('projeto/customdo/gestao', { projeto, configuracao, pr, cliente })
               }).catch((err) => {
                    req.flash('error_msg', 'Nenhuma configuração encontrada.')
                    res.redirect('/pessoa/consulta')
               })
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

          //Busca empresa cadastrado no projeto
          Empresa.findOne({ _id: projeto.empresa }).lean().then((regime_projeto) => {
               rp = regime_projeto
          }).catch((err) => {
               req.flash('error_msg', 'Houve uma falha ao encontrar o empresa')
               res.redirect('/configuracao/consulta')
          })

          //Busca pessoa responsável pelo projeto
          Pessoa.findOne({ _id: projeto.funres }).lean().then((pessoa_res) => {
               pr = pessoa_res
          }).catch((err) => {
               req.flash('error_msg', 'Houve uma falha ao encontrar o empresa')
               res.redirect('/configuracao/consulta')
          })

          Pessoa.find({ funres: 'checked', user: _id }).lean().then((responsavel) => {
               Empresa.find({ user: _id }).lean().then((empresa) => {
                    Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                         var typeGes = 'hidden'
                         var checkHora = 'unchecked'
                         var checkDia = 'unchecked'
                         var typeHrg = 'hidden'
                         var typeDrg = 'hidden'
                         var displayHrs = 'none'
                         var displayDia = 'none'
                         var escopo = 'enabled'
                         var cronograma = 'enabled'
                         var comunicacao = 'enabled'
                         var vistoria = 'enabled'
                         var alocacao = 'enabled'
                         var aquisicao = 'enabled'
                         if (projeto.tipoCusto == 'hora') {
                              checkHora = 'checked'
                              typeHrg = 'text'
                              displayHrs = 'inline'
                         } else {
                              typeGes = 'text'
                              checkDia = 'checked'
                              typeDrg = 'text'
                              displayDia = 'inline'
                              escopo = 'disabled'
                              cronograma = 'disabled'
                              comunicacao = 'disabled'
                              vistoria = 'disabled'
                              alocacao = 'disabled'
                              aquisicao = 'disabled'
                         }
                         res.render('projeto/customdo/editgestao', { projeto, empresa, responsavel, pr, cliente, checkHora, checkDia, typeHrg, typeDrg, typeGes, displayHrs, displayDia, escopo, cronograma, vistoria, comunicacao, aquisicao, alocacao })
                    }).catch((err) => {
                         req.flash('error_msg', 'Nenhum cliente encontrado.')
                         res.redirect('/pessoa/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao encontrar o empresa')
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
     var vlrhri
     Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
          Configuracao.findOne({ _id: projeto.configuracao }).lean().then((configuracao) => {
               if (typeof projeto.vlrhri == 'undefined') {
                    vlrhri = false
               } else {
                    vlrhri = true
               }
               //console.log('vlrhri=>' + vlrhri)
               Pessoa.findOne({ _id: projeto.funins }).lean().then((pessoa_ins) => {
                    pi = pessoa_ins
               }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao encontrar o instalador')
                    res.redirect('/pessoa/consulta')
               })
               Pessoa.find({ funins: 'checked', user: _id }).lean().then((instalador) => {
                    Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                         res.render('projeto/customdo/editinstalacao', { projeto, instalador, pi, cliente, configuracao, vlrhri })
                    }).catch((err) => {
                         req.flash('error_msg', 'Nenhum cliente encontrado.')
                         res.redirect('/pessoa/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao encontrar um instalador.')
                    res.redirect('/pessoa/consulta')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Houve uma falha ao encontrar a configuracação.')
               res.redirect('/projeto/consulta')
          })
     }).catch((err) => {
          req.flash('error_msg', 'Houve uma falha ao encontrar o projeto.')
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
     var erros = ''
     var sucesso = ''

     if (!req.body.uniest || req.body.uniest == "" || typeof req.body.uniest == undefined) {
          erros = erros + 'Preencher o valor de unidades dos equipamentos.'
     }
     if (!req.body.unimod || req.body.unimod == null || typeof req.body.unimod == undefined) {
          erros = erros + 'Preencher o valor de unidades dos modulos.'
     }
     if (!req.body.uniinv || req.body.uniinv == null || typeof req.body.uniinv == undefined) {
          erros = erros + 'Preencher o valor de unidades dos inversores.'
     }
     if (!req.body.uniatr || req.body.uniatr == null || typeof req.body.uniatr == undefined) {
          erros = erros + 'Preencher o valor de unidades do aterramento.'
     }
     if (!req.body.unistb || req.body.unistb == null || typeof req.body.unistb == undefined) {
          erros = erros + 'Preencher o valor de unidades de string box.'
     }
     if (!req.body.vlrhri || req.body.vlrhri == null) {
          erros = erros + 'Preencher o valor R$/hora dos instaladores.'
     }

     if (erros != '') {
          req.flash('error_msg', erros)
          res.redirect('/customdo/instalacao/' + req.body.id)
     } else {

          Projeto.findOne({ _id: req.body.id }).then((projeto) => {

               Configuracao.findOne({ _id: projeto.configuracao }).then((config) => {

                    var trbpnl
                    var totpnl
                    var trbatr = Math.round(parseFloat(req.body.uniatr) * (parseFloat(config.minatr) / 60))

                    var totatr = Math.round(parseFloat(trbatr) * parseFloat(req.body.vlrhri))

                    var qtdins
                    if (projeto.qtdins == 0 || projeto.qtdins == '' || typeof projeto.qtdins == 'undefined') {
                         qtdins = 2
                    } else {
                         qtdins = projeto.qtdins
                    }

                    if (parseFloat(projeto.unimod) > 13 && parseFloat(projeto.uniest) > 3 && parseFloat(qtdins) > 3) {
                         var trbest = Math.round(parseFloat(req.body.uniest) * (parseFloat(config.minest) * 2 / (parseFloat(qtdins)) / 60))
                         var trbmod = Math.round(parseFloat(req.body.unimod) * (parseFloat(config.minmod) * 2 / (parseFloat(qtdins)) / 60))
                         totest = (parseFloat(trbest) * parseFloat(req.body.vlrhri) * (parseFloat(qtdins))).toFixed(2)
                         totmod = (parseFloat(trbmod) * parseFloat(req.body.vlrhri) * (parseFloat(qtdins))).toFixed(2)
                    } else {
                         var trbest = Math.round(parseFloat(req.body.uniest) * (parseFloat(config.minest) / 60))
                         var trbmod = Math.round(parseFloat(req.body.unimod) * (parseFloat(config.minmod) / 60))
                         if (qtdins > 2) {
                              var insadd = (parseFloat(qtdins) - 2)
                              //console.log('insadd=>' + insadd)

                              totest = ((parseFloat(trbest) * parseFloat(req.body.vlrhri) * 2) + (parseFloat(trbest) * parseFloat(req.body.vlrhri) * insadd)).toFixed(2)
                              totmod = ((parseFloat(trbmod) * parseFloat(req.body.vlrhri) * 2) + (parseFloat(trbmod) * parseFloat(req.body.vlrhri) * insadd)).toFixed(2)
                         } else {
                              totest = (parseFloat(trbest) * parseFloat(req.body.vlrhri) * 2).toFixed(2)
                              totmod = (parseFloat(trbmod) * parseFloat(req.body.vlrhri) * 2).toFixed(2)
                         }
                    }
                    var trbinv = Math.round(parseFloat(req.body.uniinv) * (parseFloat(config.mininv) / 60))
                    var totinv = Math.round(parseFloat(trbinv) * parseFloat(req.body.vlrhri))

                    var trbstb = Math.round(parseFloat(req.body.unistb) * (parseFloat(config.minstb) / 60))
                    var totstb = Math.round(parseFloat(trbstb) * parseFloat(req.body.vlrhri))
                    var totpnl = 0
                    var trbpnl = 0
                    console.log('projeto.temPainel=>' + projeto.temPainel)
                    if (projeto.temPainel == 'checked') {
                         if (req.body.unipnl != '' || req.body.unipnl != 0) {
                              trbpnl = Math.round(parseFloat(req.body.unipnl) * (parseFloat(config.minpnl) / 60))
                              totpnl = Math.round(parseFloat(trbpnl) * parseFloat(req.body.vlrhri))
                         } else {
                              trbpnl = 0
                              totpnl = 0
                         }
                    } else {
                         trbpnl = 0
                         totpnl = 0
                    }
                    var toteae = 0
                    var trbeae = 0
                    console.log('projeto.temArmazenamento=>' + projeto.temArmazenamento)
                    if (projeto.temArmazenamento == 'checked') {
                         if (req.body.unieae != '' || req.body.unieae != 0) {
                              trbeae = Math.round(parseFloat(req.body.unieae) * (parseFloat(config.mineae) / 60))
                              toteae = Math.round(parseFloat(trbeae) * parseFloat(req.body.vlrhri))
                         } else {
                              trbeae = 0
                              toteae = 0
                         }
                    } else {
                         trbeae = 0
                         toteae = 0
                    }
                    console.log('trbeae=>' + trbeae)
                    console.log('toteae=>' + toteae)
                    console.log('trbpnl=>' + trbpnl)
                    console.log('totpnl=>' + totpnl)
                    var totint = (parseFloat(totest) + parseFloat(totmod) + parseFloat(totinv) + parseFloat(totatr) + parseFloat(totstb) + parseFloat(totpnl) + parseFloat(toteae)).toFixed(2)
                    var trbint = Math.round(parseFloat(trbest) + parseFloat(trbmod) + parseFloat(trbinv) + parseFloat(trbatr) + parseFloat(trbstb) + parseFloat(trbpnl) + parseFloat(trbeae))

                    projeto.qtdins = 3
                    projeto.vlrhri = req.body.vlrhri
                    projeto.uniest = req.body.uniest
                    projeto.uniatr = req.body.uniatr
                    projeto.unimod = req.body.unimod
                    projeto.uniinv = req.body.uniinv
                    projeto.unistb = req.body.unistb
                    projeto.unipnl = req.body.unipnl
                    projeto.unieae = req.body.unieae
                    projeto.trbest = trbest
                    projeto.trbatr = trbatr
                    projeto.trbmod = trbmod
                    projeto.trbinv = trbinv
                    projeto.trbint = trbint
                    projeto.trbstb = trbstb
                    projeto.trbpnl = trbpnl
                    projeto.trbeae = trbeae
                    projeto.totest = totest
                    projeto.totmod = totmod
                    projeto.totinv = totinv
                    projeto.totatr = totatr
                    projeto.totstb = totstb
                    projeto.totpnl = totpnl
                    projeto.toteae = toteae
                    projeto.totint = totint
                    /*
                    if (req.body.checkIns != null) {
                         projeto.funins = req.body.funins
                    }
                    */

                    //console.log('vlrhri=>'+req.body.vlrhri)
                    //console.log('uniatr=>'+req.body.uniatr)
                    //console.log('trbatr=>'+trbatr)
                    //console.log('uniest=>'+req.body.uniest)
                    //console.log('trbest=>'+trbest)
                    //console.log('unimod=>'+req.body.unimod)
                    //console.log('trbmod=>'+trbmod)
                    //console.log('uniinv=>'+trbinv)
                    //console.log('trbinv=>'+totest)
                    //console.log('totest=>'+totmod)
                    //console.log('totmod=>'+totatr)
                    //console.log('totatr=>'+totinv)
                    //console.log('totinv=>'+totint)
                    //console.log('totest=>'+totint)
                    //console.log('trbint=>'+trbint)
                    //console.log('funins=>'+req.body.funins)

                    projeto.save().then(() => {
                         sucesso = 'Custo de instalação aplicado com sucesso.'
                         req.flash('success_msg', sucesso)
                         res.redirect('/customdo/instalacao/' + req.body.id)
                    }).catch((err) => {
                         req.flash('error_msg', 'Falha ao aplicar os custos do projeto')
                         res.redirect('/customdo/instalacao/' + req.body.id)
                    })

               }).catch((err) => {
                    req.flash('error_msg', 'Falha ao encontrar as configurações')
                    res.redirect('/customdo/instalacao/' + req.body.id)
               })

          }).catch((err) => {
               req.flash('error_msg', 'Falha ao encontrar o projeto')
               res.redirect('/customdo/instalacao/' + req.body.id)
          })
     }

})

router.post('/projetista/', ehAdmin, (req, res) => {
     const { _id } = req.user
     var erros = []

     if (!req.body.trbsit || req.body.trbsit == null || typeof req.body.trbsit == undefined) {
          erros.push({ texto: 'Preencher o tempo de elaboração do diagrama de situação.' })
     }
     if (!req.body.trbuni || req.body.trbuni == null || typeof req.body.trbuni == undefined) {
          erros.push({ texto: 'Preencher o tempo de elaboração do diagrama unifiliares.' })
     }
     if (!req.body.trbdis || req.body.trbdis == null || typeof req.body.trbdis == undefined) {
          erros.push({ texto: 'Preencher o tempo de elaboração do diagrama de distribuição dos módulos.' })
     }
     if (!req.body.trbate || req.body.trbate == null || typeof req.body.trbate == undefined) {
          erros.push({ texto: 'Preencher o tempo de elaboração do diagrama de aterramento.' })
     }
     if (!req.body.trbart || req.body.trbart == null || typeof req.body.trbart == undefined) {
          erros.push({ texto: 'Preencher o tempo de elaboração do ART.' })
     }

     if (!req.body.vlrart || req.body.vlrart == null) {
          erros.push({ texto: 'Preencher o valor da ART.' })
     }

     if (!req.body.trbmem || req.body.trbmem == null || typeof req.body.trbmem == undefined) {
          erros.push({ texto: 'Preencher o tempo de elaboração do Memorial descritivo.' })
     }
     if (!req.body.vlrhrp || req.body.vlrhrp == null) {
          erros.push({ texto: 'Preencher o valor R$/hora dos projetistas.' })
     }

     if (erros.length > 0) {
          Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {
               Pessoa.find({ funpro: 'checked', user: _id }).lean().then((projetista) => {
                    Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                         Configuracao.findOne({ _id: projeto.configuracao }).lean().then((configuracao) => {
                              res.render('projeto/customdo/projetista', { erros: erros, projeto: projeto, projetista: projetista, cliente: cliente, configuracao: configuracao })
                         }).catch((err) => {
                              req.flash('error_msg', 'Nenhuma configuracao encontrada.')
                              res.redirect('/pessoa/consulta')
                         })
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

               var totpro = parseFloat(totsit) + parseFloat(totuni) + parseFloat(totdis) + parseFloat(totate) + parseFloat(totart) + parseFloat(totmem)

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
               projeto.totpro_art = parseFloat(totpro) + parseFloat(vlrart)
               /*
               if (req.body.ppnome == null) {
                    projeto.funpro = req.body.funpro
               }
               */

               projeto.save().then(() => {
                    sucesso.push({ texto: 'Custo de projetistas aplicado com sucesso' })
                    Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {
                         Pessoa.findOne({ _id: projeto.funpro }).lean().then((pessoa_funpro) => {
                              pp = pessoa_funpro
                         }).catch((err) => {
                              req.flash('error_msg', 'Hove uma falha interna.')
                              res.redirect('/pessoa/consulta')
                         })
                         Empresa.find({ user: _id }).lean().then((empresa) => {
                              Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                                   res.render('projeto/customdo/projetista', { sucesso: sucesso, projeto: projeto, empresa: empresa, pp: pp, cliente: cliente })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Nenhum cliente encontrado.')
                                   res.redirect('/pessoa/consulta')
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Hove uma falha interna.')
                              res.redirect('/configuracao/consultaempresa')
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
     var erros = ''

     Projeto.findOne({ _id: req.body.id }).then((projeto) => {

          projeto_id = projeto._id

          var tothrs
          var totesc
          var totvis
          var totcom
          var totcro
          var totaqi
          var totrec
          var trbges
          var totges

          if ((req.body.diasGes != '' || req.body.diasGes != 0) && (req.body.selecionado == 'dia')) {

               if (!req.body.vlrdrg || req.body.vlrdrg == null) {
                    erros = erros + 'Preencher o valor R$/dia da gestão.'
                    req.flash('error_msg', erros)
                    res.redirect('/customdo/gestao/' + req.body.id)
               } else {
                    projeto.trbges = trbges
                    projeto.totges = parseFloat(req.body.diasGes) * parseFloat(req.body.vlrdrg)     
                    projeto.tothrs = tothrs
                    projeto.tipoCusto = req.body.selecionado
                    projeto.diasGes = req.body.diasGes
                    projeto.vlrdrg = req.body.vlrdrg             
                    projeto.trbesc = 0
                    projeto.trbvis = 0
                    projeto.trbcom = 0
                    projeto.trbcro = 0
                    projeto.trbaqi = 0
                    projeto.trbrec = 0
                    projeto.totesc = 0
                    projeto.totvis = 0
                    projeto.totcom = 0
                    projeto.totcro = 0
                    projeto.totaqi = 0
                    projeto.totrec = 0

                    projeto.save().then(() => {
                         req.flash('Projeto salvo com sucesso. Aplicar o gerenciamento e os tributos.')
                         res.redirect('/customdo/gestao/' + req.body.id)
                    }).catch((err) => {
                         req.flash('error_msg', 'Falha ao aplicar os custos do projeto')
                         res.redirect('/customdo/gestao/' + req.body.id)
                    })
               }

          } else {

               if (!req.body.trbvis || req.body.trbvis == null || typeof req.body.trbvis == undefined) {
                    erros = erros + 'Preencher as horas de vistoria.'
               }
               if (!req.body.trbcom || req.body.trbcom == null || typeof req.body.trbcom == undefined) {
                    erros = erros + 'Preencher as horas de comunicação.'
               }
               if (!req.body.trbcro || req.body.trbcro == null || typeof req.body.trbcro == undefined) {
                    erros = erros + 'Preencher as horas de cronograma.'
               }
               if (!req.body.trbrec || req.body.trbrec == null || typeof req.body.trbrec == undefined) {
                    erros = erros + 'Preencher as horas de alocação de recursos.'
               }
               if (!req.body.trbaqi || req.body.trbaqi == null || typeof req.body.trbaqi == undefined) {
                    erros = erros + 'Preencher as horas de aquisições.'
               }
               if (!req.body.vlrhrg || req.body.vlrhrg == null) {
                    erros = erros + 'Preencher o valor R$/hora da gestão.'
               }

               if (erros == '') {
                    //Edição dos Custos de Gestão
                         totesc = (parseFloat(req.body.trbesc) * parseFloat(req.body.vlrhrg)).toFixed(2)
                         totvis = (parseFloat(req.body.trbvis) * parseFloat(req.body.vlrhrg)).toFixed(2)
                         totcom = (parseFloat(req.body.trbcom) * parseFloat(req.body.vlrhrg)).toFixed(2)
                         totcro = (parseFloat(req.body.trbcro) * parseFloat(req.body.vlrhrg)).toFixed(2)
                         totaqi = (parseFloat(req.body.trbaqi) * parseFloat(req.body.vlrhrg)).toFixed(2)
                         totrec = (parseFloat(req.body.trbrec) * parseFloat(req.body.vlrhrg)).toFixed(2)

                    totges = (parseFloat(totvis) + parseFloat(totcom) + parseFloat(totcro) + parseFloat(totaqi) + parseFloat(totrec) + parseFloat(totesc)).toFixed(2)

                    trbges = Math.round(parseFloat(req.body.trbvis) + parseFloat(req.body.trbcom) + parseFloat(req.body.trbcro) + parseFloat(req.body.trbaqi) + parseFloat(req.body.trbrec) + parseFloat(req.body.trbesc))

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
                    projeto.tothrs = tothrs
                    projeto.tipoCusto = req.body.selecionado
                    projeto.totesc = totesc
                    projeto.totvis = totvis
                    projeto.totcom = totcom
                    projeto.totcro = totcro
                    projeto.totaqi = totaqi
                    projeto.totrec = totrec
                    projeto.trbges = trbges
                    projeto.totges = totges
                    projeto.save().then(() => {
                         req.flash('Projeto salvo com sucesso. Aplicar o gerenciamento e os tributos.')
                         res.redirect('/customdo/gestao/' + req.body.id)
                    }).catch((err) => {
                         req.flash('error_msg', 'Falha ao aplicar os custos do projeto.')
                         res.redirect('/customdo/gestao/' + req.body.id)
                    })
               } else {
                    req.flash('error_msg', erros)
                    res.redirect('/customdo/gestao/' + req.body.id)
               }
          }
     }).catch((err) => {
          req.flash('error_msg', 'Falha ao encontrar o projeto')
          res.redirect('/customdo/gestao/' + req.body.id)
     })
})

router.post('/editar/instalacao/', ehAdmin, (req, res) => {
     
     var erros = ''

     if (!req.body.uniest || req.body.uniest == "" || typeof req.body.uniest == undefined) {
          erros = erros + 'Preencher o valor de unidades dos equipamentos.'
     }
     if (!req.body.unimod || req.body.unimod == null || typeof req.body.unimod == undefined) {
          erros = erros + 'Preencher o valor de unidades dos modulos.'
     }
     if (!req.body.uniinv || req.body.uniinv == null || typeof req.body.uniinv == undefined) {
          erros = erros + 'Preencher o valor de unidades dos inversores.'
     }
     if (!req.body.uniatr || req.body.uniatr == null || typeof req.body.uniatr == undefined) {
          erros = erros + 'Preencher o valor de unidades do aterramento.'
     }
     if (!req.body.vlrhri || req.body.vlrhri == null) {
          erros = erros + 'Preencher o valor R$/hora dos instaladores.'
     }
     if (erros != '') {
          req.flash('error_msg', erros)
          res.redirect('/customdo/editar/instalacao/' + req.body.id)
     } else {
          //console.log('req.body.id=>' + req.body.id)

          Projeto.findOne({ _id: req.body.id }).then((projeto) => {

               //console.log('projeto.configuracao=>' + projeto.configuracao)

               Configuracao.findOne({ _id: projeto.configuracao }).then((config) => {

                    //Edição dos Custos de Instalação
                    //console.log('encontrou')
                    //console.log('config.minatr=>' + config.minatr)
                    //console.log('config.minest=>' + config.minest)
                    //console.log('config.minmod=>' + config.minmod)
                    var totest
                    var totmod
                    var trbatr = Math.round(parseFloat(req.body.uniatr) * (parseFloat(config.minatr) / 60))
                    var totatr = Math.round(parseFloat(trbatr) * parseFloat(req.body.vlrhri))

                    var qtdins
                    if (projeto.qtdins == 0 || projeto.qtdins == '' || typeof projeto.qtdins == 'undefined') {
                         qtdins = 2
                    } else {
                         qtdins = projeto.qtdins
                    }

                    if (parseFloat(projeto.unimod) > 13 && parseFloat(projeto.uniest) > 3 && parseFloat(qtdins) > 3) {
                         var trbest = Math.round(parseFloat(req.body.uniest) * (parseFloat(config.minest) * 2 / (parseFloat(qtdins)) / 60))
                         var trbmod = Math.round(parseFloat(req.body.unimod) * (parseFloat(config.minmod) * 2 / (parseFloat(qtdins)) / 60))
                         totest = (parseFloat(trbest) * parseFloat(req.body.vlrhri) * (parseFloat(qtdins))).toFixed(2)
                         totmod = (parseFloat(trbmod) * parseFloat(req.body.vlrhri) * (parseFloat(qtdins))).toFixed(2)
                    } else {
                         var trbest = Math.round(parseFloat(req.body.uniest) * (parseFloat(config.minest) / 60))
                         var trbmod = Math.round(parseFloat(req.body.unimod) * (parseFloat(config.minmod) / 60))
                         if (qtdins > 2) {
                              var insadd = (parseFloat(qtdins) - 2)
                              //console.log('insadd=>' + insadd)

                              totest = ((parseFloat(trbest) * parseFloat(req.body.vlrhri) * 2) + (parseFloat(trbest) * parseFloat(req.body.vlrhri) * insadd)).toFixed(2)
                              totmod = ((parseFloat(trbmod) * parseFloat(req.body.vlrhri) * 2) + (parseFloat(trbmod) * parseFloat(req.body.vlrhri) * insadd)).toFixed(2)
                         } else {
                              totest = (parseFloat(trbest) * parseFloat(req.body.vlrhri) * 2).toFixed(2)
                              totmod = (parseFloat(trbmod) * parseFloat(req.body.vlrhri) * 2).toFixed(2)
                         }
                    }

                    var trbinv = Math.round(parseFloat(req.body.uniinv) * (parseFloat(config.mininv) / 60))
                    var totinv = Math.round(parseFloat(trbinv) * parseFloat(req.body.vlrhri))

                    var trbstb = Math.round(parseFloat(req.body.unistb) * (parseFloat(config.minstb) / 60))
                    var totstb = Math.round(parseFloat(trbstb) * parseFloat(req.body.vlrhri))

                    //console.log('projeto.temPainel=>' + projeto.temPainel)
                    var totpnl = 0
                    var trbpnl = 0
                    console.log('projeto.temPainel=>' + projeto.temPainel)
                    if (projeto.temPainel == 'checked') {
                         if (req.body.unipnl != '' || req.body.unipnl != 0) {
                              trbpnl = Math.round(parseFloat(req.body.unipnl) * (parseFloat(config.minpnl) / 60))
                              totpnl = Math.round(parseFloat(trbpnl) * parseFloat(req.body.vlrhri))
                         } else {
                              trbpnl = 0
                              totpnl = 0
                         }
                    } else {
                         trbpnl = 0
                         totpnl = 0
                    }
                    var toteae = 0
                    var trbeae = 0
                    console.log('projeto.temArmazenamento=>' + projeto.temArmazenamento)
                    if (projeto.temArmazenamento == 'checked') {
                         if (req.body.unieae != '' || req.body.unieae != 0) {
                              trbeae = Math.round(parseFloat(req.body.unieae) * (parseFloat(config.mineae) / 60))
                              toteae = Math.round(parseFloat(trbeae) * parseFloat(req.body.vlrhri))
                         } else {
                              trbeae = 0
                              toteae = 0
                         }
                    } else {
                         trbeae = 0
                         toteae = 0
                    }
                    console.log('trbeae=>' + trbeae)
                    console.log('toteae=>' + toteae)
                    console.log('trbpnl=>' + trbpnl)
                    console.log('totpnl=>' + totpnl)
                    var totint = (parseFloat(totest) + parseFloat(totmod) + parseFloat(totinv) + parseFloat(totatr) + parseFloat(totstb) + parseFloat(totpnl) + parseFloat(toteae)).toFixed(2)
                    var trbint = Math.round(parseFloat(trbest) + parseFloat(trbmod) + parseFloat(trbinv) + parseFloat(trbatr) + parseFloat(trbstb) + parseFloat(trbpnl) + parseFloat(trbeae))

                    /*
                    tothrs = parseFloat(trbint)
                    if (projeto.trbpro != null) {
                         tothrs = tothrs + parseFloat(projeto.trbpro)
                    }
                    if (projeto.trbges != null) {
                         tothrs = tothrs + parseFloat(projeto.trbges)
                    }
                    */

                    //console.log('req.body.vlrhri=>' + req.body.vlrhri)
                    //console.log('req.body.uniatr=>' + req.body.uniatr)
                    //console.log('trbatr=>' + trbatr)
                    //console.log('req.body.uniest=>' + req.body.uniest)
                    //console.log('trbest=>' + trbest)
                    //console.log('req.body.unimod=>' + req.body.unimod)
                    //console.log('trbmod=>' + trbmod)
                    //console.log('req.body.uniinv=>' + req.body.uniinv)
                    //console.log('trbinv=>' + trbinv)
                    //console.log('totest=>' + totest)
                    //console.log('totmod=>' + totmod)
                    //console.log('totinv=>' + totinv)
                    //console.log('totatr=>' + totatr)
                    //console.log('totint=>' + totint)
                    //console.log('trbint=>' + trbint)

                    projeto.vlrhri = req.body.vlrhri
                    projeto.uniest = req.body.uniest
                    projeto.uniatr = req.body.uniatr
                    projeto.unimod = req.body.unimod
                    projeto.uniinv = req.body.uniinv
                    projeto.unistb = req.body.unistb
                    projeto.unipnl = req.body.unipnl
                    projeto.unieae = req.body.unieae
                    projeto.trbest = trbest
                    projeto.trbatr = trbatr
                    projeto.trbmod = trbmod
                    projeto.trbinv = trbinv
                    projeto.trbint = trbint
                    projeto.trbstb = trbstb
                    projeto.trbpnl = trbpnl
                    projeto.trbeae = trbeae
                    projeto.totest = totest
                    projeto.totmod = totmod
                    projeto.totinv = totinv
                    projeto.totatr = totatr
                    projeto.totstb = totstb
                    projeto.totpnl = totpnl
                    projeto.toteae = toteae
                    projeto.totint = totint
                    /*
                    if (req.body.checkIns != null) {
                         projeto.funins = req.body.funins
                    }
                    */

                    projeto.save().then(() => {
                         sucesso = 'Custo de instalação aplicado com sucesso. Aplicar o gerenciamento e os tributos.'
                         req.flash('success_msg', sucesso)
                         res.redirect('/customdo/editar/instalacao/' + req.body.id)
                    }).catch((err) => {
                         req.flash('error_msg', 'Falha ao aplicar os custos do projeto.')
                         res.redirect('/customdo/editar/instalacao/' + req.body.id)
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Falha ao encontrar a configuração.')
                    res.redirect('/customdo/editar/instalacao/' + req.body.id)
               })
          }).catch((err) => {
               req.flash('error_msg', 'Falha ao encontrar o projeto.')
               res.redirect('/customdo/editar/instalacao/' + req.body.id)
          })
     }

})

router.post('/editar/projetista/', ehAdmin, (req, res) => {

     var erros = ''

     Projeto.findOne({ _id: req.body.id }).then((projeto) => {

          projeto_id = projeto._id

          var tothrs
          var totmem
          var totart
          var totate
          var totdis
          var totuni
          var totsit
          var trbpro
          var totpro

          if ((req.body.diasPro != '' || req.body.diasPro != 0) && (req.body.selecionado == 'dia')) {

               if (!req.body.vlrdrp || req.body.vlrdrp == null) {
                    erros = erros + 'Preencher o valor R$/dia do projetista.'
                    req.flash('error_msg', erros)
                    res.redirect('/customdo/editar/projetista/' + req.body.id)
               } else {

                    trbpro = req.body.diasPro * 8
                    if (projeto.trbges != null) {
                         tothrs = tothrs + parseFloat(projeto.trbges)
                    }
                    if (projeto.trbint != null) {
                         tothrs = tothrs + parseFloat(projeto.trbint)
                    }

                    projeto.trbpro = trbpro
                    projeto.totpro = parseFloat(req.body.diasPro) * parseFloat(req.body.vlrdrp)     
                    projeto.tothrs = tothrs
                    projeto.tipoCusto = req.body.selecionado
                    projeto.diasPro = req.body.diasPro
                    projeto.vlrdrp = req.body.vlrdrp
                    projeto.trbmem = 0
                    projeto.trbart = 0
                    projeto.trbate = 0
                    projeto.trbdis = 0
                    projeto.trbuni = 0
                    projeto.trbsit = 0
                    projeto.totmem = 0
                    projeto.totart = 0
                    projeto.totate = 0
                    projeto.totdis = 0
                    projeto.totuni = 0
                    projeto.totsit = 0

                    projeto.save().then(() => {
                         req.flash('Projeto salvo com sucesso. Aplicar o gerenciamento e os tributos.')
                         res.redirect('/customdo/editar/projetista/' + req.body.id)
                    }).catch((err) => {
                         req.flash('error_msg', 'Falha ao aplicar os custos do projeto')
                         res.redirect('/customdo/editar/projetista/' + req.body.id)
                    })
               }

          } else {

               if (!req.body.trbmem || req.body.trbmem == null || typeof req.body.trbmem == undefined) {
                    erros = erros + 'Preencher a unidade de tempo do memorial descritivo.'
               }  
               if (!req.body.trbart || req.body.trbart == null || typeof req.body.trbart == undefined) {
                    erros = erros + 'Preencher a unidade de tempo da emissão da ART.'
               }        
               if (!req.body.trbate || req.body.trbate == null || typeof req.body.trbate == undefined) {
                    erros = erros + 'Preencher a unidade de tempo do diagrama de aterramento.'
               }        
               if (!req.body.trbdis || req.body.trbdis == null || typeof req.body.trbdis == undefined) {
                    erros = erros + 'Preencher a unidade de tempo do diagrama de distribuição dos módulos.'
               }
               if (!req.body.trbuni || req.body.trbuni == null || typeof req.body.trbuni == undefined) {
                    erros = erros + 'Preencher a unidade de tempo do diagrama unifilar.'
               }
               if (!req.body.trbsit || req.body.trbsit == "" || typeof req.body.trbsit == undefined) {
                    erros = erros + 'Preencher a unidade de tempo do diagrama de situação.'
               }
               if (!req.body.vlrart || req.body.vlrart == null) {
                    erros = erros + 'Preencher o custo para a emissão da ART.'
               }
               if (!req.body.vlrhrp || req.body.vlrhrp == null) {
                    erros = erros + 'Preencher o valor R$/hora do projetista.'
               }     

               if (erros == '') {
                    //Edição dos Custos de Gestão
                         totmem = (parseFloat(req.body.totmem) * parseFloat(req.body.vlrhrp)).toFixed(2)
                         totart = (parseFloat(req.body.totart) * parseFloat(req.body.vlrhrp)).toFixed(2)
                         totate = (parseFloat(req.body.totate) * parseFloat(req.body.vlrhrp)).toFixed(2)
                         totdis = (parseFloat(req.body.totdis) * parseFloat(req.body.vlrhrp)).toFixed(2)
                         totuni = (parseFloat(req.body.totuni) * parseFloat(req.body.vlrhrp)).toFixed(2)
                         totsit = (parseFloat(req.body.totsit) * parseFloat(req.body.vlrhrp)).toFixed(2)
               
                    totges = (parseFloat(totmem) + parseFloat(totart) + parseFloat(totate) + parseFloat(totdis) + parseFloat(totuni) + parseFloat(totsit)).toFixed(2)
                    trbges = Math.round(parseFloat(req.body.trbmem) + parseFloat(req.body.trbart) + parseFloat(req.body.trbate) + parseFloat(req.body.trbdis) + parseFloat(req.body.trbuni) + parseFloat(req.body.trbsit))

                    tothrs = parseFloat(trbpro)
                    if (projeto.trbges != null) {
                         tothrs = tothrs + parseFloat(projeto.trbges)
                    }
                    if (projeto.trbint != null) {
                         tothrs = tothrs + parseFloat(projeto.trbint)
                    }

                    projeto.trbpro = trbpro
                    projeto.totpro = totpro
                    projeto.tothrs = tothrs
                    projeto.tipoCusto = req.body.selecionado
                    projeto.vlrhrg = req.body.vlrhrp
                    projeto.trbmem = req.body.trbmem
                    projeto.trbart = req.body.trbart
                    projeto.trbate = req.body.trbate
                    projeto.trbdis = req.body.trbdis
                    projeto.trbuni = req.body.trbuni
                    projeto.trbsit = req.body.trbsit
                    projeto.totesc = totmem
                    projeto.totart = totart
                    projeto.totate = totate
                    projeto.totdis = totdis
                    projeto.totuni = totuni
                    projeto.totsit = totsit
                    projeto.save().then(() => {
                         req.flash('Projeto salvo com sucesso. Aplicar o gerenciamento e os tributos.')
                         res.redirect('/customdo/editar/projetista/' + req.body.id)
                    }).catch((err) => {
                         req.flash('error_msg', 'Falha ao aplicar os custos do projeto.')
                         res.redirect('/customdo/editar/projetista/' + req.body.id)
                    })
               } else {
                    req.flash('error_msg', erros)
                    res.redirect('/customdo/editar/projetista/' + req.body.id)
               }
          }
     }).catch((err) => {
          req.flash('error_msg', 'Falha ao encontrar o projeto')
          res.redirect('/customdo/editar/projetista/' + req.body.id)
     })
})

router.post('/editar/gestao/', ehAdmin, (req, res) => {
     var erros = ''

     Projeto.findOne({ _id: req.body.id }).then((projeto) => {

          projeto_id = projeto._id

          var tothrs
          var totesc
          var totvis
          var totcom
          var totcro
          var totaqi
          var totrec
          var trbges
          var totges

          if ((req.body.diasGes != '' || req.body.diasGes != 0) && (req.body.selecionado == 'dia')) {

               if (!req.body.vlrdrg || req.body.vlrdrg == null) {
                    erros = erros + 'Preencher o valor R$/dia da gestão.'
                    req.flash('error_msg', erros)
                    res.redirect('/customdo/editar/gestao/' + req.body.id)
               } else {

                    projeto.trbges = trbges
                    projeto.totges = parseFloat(req.body.diasGes) * parseFloat(req.body.vlrdrg)     
                    projeto.tothrs = tothrs
                    projeto.tipoCusto = req.body.selecionado
                    projeto.diasGes = req.body.diasGes
                    projeto.vlrdrg = req.body.vlrdrg             
                    projeto.trbesc = 0
                    projeto.trbvis = 0
                    projeto.trbcom = 0
                    projeto.trbcro = 0
                    projeto.trbaqi = 0
                    projeto.trbrec = 0
                    projeto.totesc = 0
                    projeto.totvis = 0
                    projeto.totcom = 0
                    projeto.totcro = 0
                    projeto.totaqi = 0
                    projeto.totrec = 0

                    projeto.save().then(() => {
                         req.flash('Projeto salvo com sucesso. Aplicar o gerenciamento e os tributos.')
                         res.redirect('/customdo/editar/gestao/' + req.body.id)
                    }).catch((err) => {
                         req.flash('error_msg', 'Falha ao aplicar os custos do projeto')
                         res.redirect('/projeto/consulta')
                    })
               }

          } else {

               if (!req.body.trbvis || req.body.trbvis == null || typeof req.body.trbvis == undefined) {
                    erros = erros + 'Preencher as horas de vistoria.'
               }
               if (!req.body.trbcom || req.body.trbcom == null || typeof req.body.trbcom == undefined) {
                    erros = erros + 'Preencher as horas de comunicação.'
               }
               if (!req.body.trbcro || req.body.trbcro == null || typeof req.body.trbcro == undefined) {
                    erros = erros + 'Preencher as horas de cronograma.'
               }
               if (!req.body.trbrec || req.body.trbrec == null || typeof req.body.trbrec == undefined) {
                    erros = erros + 'Preencher as horas de alocação de recursos.'
               }
               if (!req.body.trbaqi || req.body.trbaqi == null || typeof req.body.trbaqi == undefined) {
                    erros = erros + 'Preencher as horas de aquisições.'
               }
               if (!req.body.vlrhrg || req.body.vlrhrg == null) {
                    erros = erros + 'Preencher o valor R$/hora da gestão.'
               }

               if (erros == '') {
                    //Edição dos Custos de Gestão
                         totesc = (parseFloat(req.body.trbesc) * parseFloat(req.body.vlrhrg)).toFixed(2)
                         totvis = (parseFloat(req.body.trbvis) * parseFloat(req.body.vlrhrg)).toFixed(2)
                         totcom = (parseFloat(req.body.trbcom) * parseFloat(req.body.vlrhrg)).toFixed(2)
                         totcro = (parseFloat(req.body.trbcro) * parseFloat(req.body.vlrhrg)).toFixed(2)
                         totaqi = (parseFloat(req.body.trbaqi) * parseFloat(req.body.vlrhrg)).toFixed(2)
                         totrec = (parseFloat(req.body.trbrec) * parseFloat(req.body.vlrhrg)).toFixed(2)

                    totges = (parseFloat(totvis) + parseFloat(totcom) + parseFloat(totcro) + parseFloat(totaqi) + parseFloat(totrec) + parseFloat(totesc)).toFixed(2)

                    trbges = Math.round(parseFloat(req.body.trbvis) + parseFloat(req.body.trbcom) + parseFloat(req.body.trbcro) + parseFloat(req.body.trbaqi) + parseFloat(req.body.trbrec) + parseFloat(req.body.trbesc))

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
                    projeto.tothrs = tothrs
                    projeto.tipoCusto = req.body.selecionado
                    projeto.totesc = totesc
                    projeto.totvis = totvis
                    projeto.totcom = totcom
                    projeto.totcro = totcro
                    projeto.totaqi = totaqi
                    projeto.totrec = totrec
                    projeto.trbges = trbges
                    projeto.totges = totges
                    projeto.save().then(() => {
                         req.flash('Projeto salvo com sucesso. Aplicar o gerenciamento e os tributos.')
                         res.redirect('/customdo/editar/gestao/' + req.body.id)
                    }).catch((err) => {
                         req.flash('error_msg', 'Falha ao aplicar os custos do projeto')
                         res.redirect('/customdo/editar/gestao/' + req.body.id)
                    })
               } else {
                    req.flash('error_msg', erros)
                    res.redirect('/customdo/editar/gestao/' + req.body.id)
               }
          }
     }).catch((err) => {
          req.flash('error_msg', 'Falha ao encontrar o projeto')
          res.redirect('/customdo/editar/gestao/' + req.body.id)
     })
})

module.exports = router
