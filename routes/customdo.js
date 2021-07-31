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


require('../app')
//Configurando pasta de imagens 
router.use(express.static('imagens'))


router.get('/gestao/:id', ehAdmin, (req, res) => {
     const { _id } = req.user
     Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
          Pessoa.findOne({ _id: projeto.funres }).lean().then((gestor) => {
               Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                    Configuracao.findOne({ _id: projeto.configuracao }).lean().then((configuracao) => {
                         var typeGes = 'hidden'
                         var checkHora = 'unchecked'
                         var checkDia = 'unchecked'
                         var typeHrg = 'hidden'
                         var typeDrg = 'hidden'
                         var displayHrs = 'none'
                         var displayDia = 'none'
                         var displayTda = 'none'
                         var escopo = 'enabled'
                         var cronograma = 'enabled'
                         var comunicacao = 'enabled'
                         var vistoria = 'enabled'
                         var alocacao = 'enabled'
                         var aquisicao = 'enabled'
                         var mostraHora = false
                         console.log('projeto.tipoCustoGes=>' + projeto.tipoCustoGes)
                         if (projeto.tipoCustoGes == 'hora') {
                              checkHora = 'checked'
                              typeHrg = 'text'
                              displayHrs = 'inline'
                              mostraHora = true
                         } else {
                              typeGes = 'text'
                              checkDia = 'checked'
                              typeDrg = 'text'
                              displayDia = 'inline'
                              displayTda = 'inline'
                              escopo = 'disabled'
                              cronograma = 'disabled'
                              comunicacao = 'disabled'
                              vistoria = 'disabled'
                              alocacao = 'disabled'
                              aquisicao = 'disabled'
                              mostraHora = false
                         }
                         console.log('checkHora=>' + checkHora)
                         res.render('projeto/customdo/gestao', { projeto, gestor, configuracao, cliente, checkHora, checkDia, typeHrg, typeDrg, typeGes, displayHrs, displayDia, displayTda, escopo, cronograma, vistoria, comunicacao, aquisicao, alocacao, mostraHora })
                    }).catch((err) => {
                         req.flash('error_msg', 'Nenhum cliente encontrado.')
                         res.redirect('/customdo/gestao/' + req.params.id)
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Nenhum cliente encontrado.')
                    res.redirect('/customdo/gestao/' + req.params.id)
               })
          }).catch((err) => {
               req.flash('error_msg', 'Houve uma falha ao encontrar a pessoa')
               res.redirect('/customdo/gestao/' + req.params.id)
          })

     }).catch((err) => {
          req.flash('error_msg', 'Houve uma falha ao encontrar o projeto')
          res.redirect('/customdo/gestao/' + req.params.id)
     })
})

router.get('/instalacao/:id', ehAdmin, (req, res) => {
     const { _id } = req.user
     Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
          Pessoa.findOne({ _id: projeto.funins }).lean().then((instalador) => {
               Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                    Configuracao.findOne({ _id: projeto.configuracao }).lean().then((configuracao) => {
                         var checkHora = 'unchecked'
                         var checkDia = 'unchecked'
                         var typeHri = 'hidden'
                         var typeDri = 'hidden'
                         var typeIns = 'hidden'
                         var displayHrs = 'none'
                         var displayDia = 'none'
                         var displayTda = 'none'
                         var displayTempo = 'none'
                         var mostraHora = false
                         var disabledAtr = ''
                         var disabledInv = ''
                         var disabledStb = ''
                         var disabledEae = ''
                         var disabledPnl = ''
                         var disabledEst = ''
                         var disabledMod = ''
                         if (projeto.tipoCustoIns == 'hora') {
                              checkHora = 'checked'
                              typeHri = 'text'
                              displayHrs = 'inline'
                              mostraHora = true
                              disabledAtr = 'disabled'
                              disabledInv = 'disabled'
                              disabledStb = 'disabled'
                              disabledEae = 'disabled'
                              disabledPnl = 'disabled'
                              disabledEst = 'disabled'
                              disabledMod = 'disabled'
                         } else {
                              checkDia = 'checked'
                              typeDri = 'text'
                              displayDia = 'inline'
                              displayTda = 'inline'
                              displayTempo = 'inline'
                              mostraHora = false
                              typeIns = 'text'
                         }
                         res.render('projeto/customdo/instalacao', { projeto, instalador, configuracao, cliente, checkHora, checkDia, typeHri, typeIns, typeDri, displayHrs, displayDia, displayTda, displayTempo, mostraHora, disabledAtr, disabledInv, disabledStb, disabledEae, disabledPnl, disabledEst, disabledMod })
                    }).catch((err) => {
                         req.flash('error_msg', 'Nenhum cliente encontrado.')
                         res.redirect('/customdo/instalacao/' + req.params.id)
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Nenhum cliente encontrado.')
                    res.redirect('/customdo/instalacao/' + req.params.id)
               })
          }).catch((err) => {
               req.flash('error_msg', 'Houve uma falha ao encontrar a pessoa')
               res.redirect('/customdo/instalacao/' + req.params.id)
          })
     }).catch((err) => {
          req.flash('error_msg', 'Houve uma falha ao encontrar o projeto')
          res.redirect('/customdo/instalacao/' + req.params.id)
     })
})

router.get('/projetista/:id', ehAdmin, (req, res) => {
     const { _id } = req.user
     Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
          Pessoa.findOne({ _id: projeto.funres }).lean().then((projetista) => {
               Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                    Configuracao.findOne({ _id: projeto.configuracao }).lean().then((configuracao) => {
                         var typePro = 'hidden'
                         var checkHora = 'unchecked'
                         var checkDia = 'unchecked'
                         var typeHrp = 'hidden'
                         var typeDrp = 'hidden'
                         var displayHrs = 'none'
                         var displayDia = 'none'
                         var displayTda = 'none'
                         var memorial = 'enabled'
                         var art = 'enabled'
                         var aterramento = 'enabled'
                         var distribuicao = 'enabled'
                         var unifilar = 'enabled'
                         var situacao = 'enabled'
                         var mostraHora = false
                         if (projeto.tipoCustoPro == 'hora') {
                              checkHora = 'checked'
                              typeHrp = 'text'
                              displayHrs = 'inline'
                              mostraHora = true
                         } else {
                              typePro = 'text'
                              checkDia = 'checked'
                              typeDrp = 'text'
                              displayDia = 'inline'
                              displayTda = 'inline'
                              memorial = 'disabled'
                              art = 'disabled'
                              aterramento = 'disabled'
                              distribuicao = 'disabled'
                              unifilar = 'disabled'
                              situacao = 'disabled'
                              mostraHora = false
                         }
                         res.render('projeto/customdo/projetista', { projeto, projetista, configuracao, cliente, checkHora, checkDia, typeHrp, typeDrp, typePro, displayHrs, displayDia, displayTda, memorial, art, aterramento, distribuicao, unifilar, situacao, mostraHora })
                    }).catch((err) => {
                         req.flash('error_msg', 'Nenhuma configuração encontrada.')
                         res.redirect('/customdo/projetista/' + req.params.id)
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Nenhum cliente encontrado.')
                    res.redirect('/customdo/projetista/' + req.params.id)
               })
          }).catch((err) => {
               req.flash('error_msg', 'Houve uma falha ao encontrar a pessoa')
               res.redirect('/customdo/projetista/' + req.params.id)
          })
     }).catch((err) => {
          req.flash('error_msg', 'Houve uma falha ao encontrar o projeto')
          res.redirect('/customdo/projetista/' + req.params.id)
     })
})

router.post('/instalacao/', ehAdmin, (req, res) => {

     var erros = ''

     Projeto.findOne({ _id: req.body.id }).then((projeto) => {
          Configuracao.findOne({ _id: projeto.configuracao }).then((config) => {

               var tothrs = 0
               var hrsprj = 0
               var totatr
               var totinv
               var totstb
               var totpnl
               var toteae
               var totest
               var totmod
               var trbatr
               var trbinv
               var trbstb
               var trbpnl
               var trbeae
               var trbest
               var trbmod
               var trbint
               var conhrs = config.hrstrb

          //console.log('req.body.selecionado=>' + req.body.selecionado)

          if (req.body.selecionado == 'dia') {

                    if (req.body.vlrdri == '' || typeof req.body.vlrdri == 'undefined' || req.body.vldri == 0) {
                         erros = erros + 'Preencher o valor R$/dia do instalador.'
                         req.flash('error_msg', erros)
                         res.redirect('/customdo/instalacao/' + req.body.id)
                    } else {
                         trbatr = parseFloat(req.body.trbatr) * conhrs
                         trbinv = parseFloat(req.body.trbinv) * conhrs
                         trbstb = parseFloat(req.body.trbstb) * conhrs
                         //console.log('projeto.temPainel=>' + projeto.temPainel)
                         if (projeto.temPainel == 'checked') {
                              trbpnl = parseFloat(req.body.trbpnl) * conhrs
                         } else {
                              trbpnl = 0
                         }
                         //console.log('projeto.temArmazenamento=>' + projeto.temArmazenamento)
                         if (projeto.temArmazenamento == 'checked') {
                              trbeae = parseFloat(req.body.trbeae) * conhrs
                         } else {
                              trbeae = 0
                         }
                         trbest = parseFloat(req.body.trbest) * conhrs
                         trbmod = parseFloat(req.body.trbmod) * conhrs
                         trbint = Math.round(parseFloat(trbatr) + parseFloat(trbinv) + parseFloat(trbstb) + parseFloat(trbpnl) + parseFloat(trbeae) + parseFloat(trbest) + parseFloat(trbmod))

                         tothrs = trbint
                         //console.log('trbint=>' + trbint)
                         //console.log('projeto.trbges=>' + projeto.trbges)
                         //console.log('projeto.trbpro=>' + projeto.trbpro)
                         if (projeto.trbges != null) {
                              tothrs = parseFloat(tothrs) + parseFloat(projeto.trbges)
                              //console.log('tothrs=>' + tothrs)
                         }
                         if (projeto.trbrpo != null) {
                              tothrs = parseFloat(tothrs) + parseFloat(projeto.trbpro)
                              //console.log('tothrs=>' + tothrs)
                         }
                         projeto.tothrs = Math.round(tothrs)
                         hrsprj = parseFloat(projeto.trbmod) + parseFloat(projeto.trbest) + parseFloat(projeto.trbpro) + parseFloat(projeto.trbges)
                         projeto.hrsprj = hrsprj

                         totatr = parseFloat(req.body.trbatr) * parseFloat(req.body.vlrdri) * parseFloat(req.body.equatr)
                         totinv = parseFloat(req.body.trbinv) * parseFloat(req.body.vlrdri) * parseFloat(req.body.trbinv)
                         totstb = parseFloat(req.body.trbstb) * parseFloat(req.body.vlrdri) * parseFloat(req.body.trbstb)

                         if (projeto.temPainel == 'checked') {
                              totpnl = parseFloat(req.body.trbpnl) * parseFloat(req.body.vlrdri) * parseFloat(req.body.trbpnl)
                              projeto.unipnl = req.body.unipnl
                              projeto.trbpnl = req.body.trbpnl
                              projeto.diasPnl = req.body.trbpnl
                              projeto.equpnl = req.body.equpnl
                         } else {
                              totpnl = 0
                         }
                         if (projeto.temArmazenamento == 'checked') {
                              toteae = parseFloat(req.body.trbeae) * parseFloat(req.body.vlrdri) * parseFloat(req.body.trbeae)
                              projeto.unieae = req.body.unieae
                              projeto.trbeae = req.body.trbeae
                              projeto.diasEae = req.body.trbeae
                              projeto.equeae = req.body.equeae
                         } else {
                              toteae = 0
                         }
                         totest = parseFloat(req.body.trbest) * parseFloat(req.body.vlrdri) * parseFloat(req.body.trbest)
                         totmod = parseFloat(req.body.trbmod) * parseFloat(req.body.vlrdri) * parseFloat(req.body.trbmod)
                         totint = parseFloat(totatr) + parseFloat(totinv) + parseFloat(totstb) + parseFloat(totpnl) + parseFloat(toteae) + parseFloat(totest) + parseFloat(totmod)
                         //console.log('totatr=>' + totatr)
                         //console.log('totinv=>' + totinv)
                         //console.log('totstb=>' + totstb)
                         //console.log('totpnl=>' + totpnl)
                         //console.log('toteae=>' + toteae)
                         //console.log('totest=>' + totest)
                         //console.log('totmod=>' + totmod)                    
                         //console.log('totint=>' + totint)

                         projeto.uniatr = req.body.uniatr
                         projeto.uniinv = req.body.uniinv
                         projeto.unistb = req.body.unistb
                         projeto.unipnl = req.body.unipnl
                         projeto.unistb = req.body.unistb
                         projeto.uniest = req.body.uniest
                         projeto.unimod = req.body.unimod

                         projeto.trbatr = req.body.trbatr
                         projeto.trbinv = req.body.trbinv
                         projeto.trbstb = req.body.trbstb
                         projeto.trbest = req.body.trbest
                         projeto.trbmod = req.body.trbmod
                         projeto.trbint = trbint

                         projeto.diasAte = req.body.trbatr
                         projeto.diasInv = req.body.trbinv
                         projeto.diasStb = req.body.trbstb
                         projeto.diasEst = req.body.trbest
                         projeto.diasMod = req.body.trbmod

                         projeto.equatr = req.body.equatr
                         projeto.equinv = req.body.equinv
                         projeto.equstb = req.body.equstb
                         projeto.equest = req.body.equest
                         projeto.equmod = req.body.equmod

                         projeto.totatr = totatr
                         projeto.totinv = totinv
                         projeto.totstb = totstb
                         projeto.toteae = toteae
                         projeto.totpnl = totpnl
                         projeto.totest = totest
                         projeto.totmod = totmod
                         projeto.totint = totint

                         projeto.tipoCustoIns = req.body.selecionado
                         projeto.diasIns = req.body.diasIns
                         projeto.qtdins = req.body.equmod
                         projeto.vlrdri = req.body.vlrdri

                         projeto.save().then(() => {
                              req.flash('success_msg', 'Projeto salvo com sucesso. Aplicar o gerenciamento e os tributos.')
                              res.redirect('/customdo/instalacao/' + req.body.id)
                         }).catch((err) => {
                              req.flash('error_msg', 'Falha ao aplicar os custos do projeto')
                              res.redirect('/customdo/instalacao/' + req.body.id)
                         })
                    }

               } else {

                    if (req.body.uniest == '' || typeof req.body.uniest == 'undefined') {
                         erros = erros + 'Preencher o valor de unidades dos equipamentos.'
                    }
                    if (req.body.unimod == '' || typeof req.body.unimod == 'undefined') {
                         erros = erros + 'Preencher o valor de unidades dos modulos.'
                    }
                    if (req.body.uniinv == '' || typeof req.body.uniinv == 'undefined') {
                         erros = erros + 'Preencher o valor de unidades dos inversores.'
                    }
                    if (req.body.uniatr == '' || typeof req.body.uniatr == 'undefined') {
                         erros = erros + 'Preencher o valor de unidades do aterramento.'
                    }
                    if (req.body.unistb == '' || typeof req.body.unistb == 'undefined') {
                         erros = erros + 'Preencher o valor de unidades do aterramento.'
                    }
                    if (req.body.temPainel == 'checked') {
                         if (req.body.unipnl == '' || typeof req.body.unipnl == 'undefined') {
                              erros = erros + 'Preencher o valor de unidades do painél elétrico.'
                         }
                    }
                    //console.log('req.body.temArmazenamento=>'+req.body.temArmazenamento)
                    //console.log('req.body.temPainel=>'+req.body.temPainel)
                    if (req.body.temArmazenamento == 'checked') {
                         if (req.body.unieae == '' || typeof req.body.unieae == 'undefined') {
                              erros = erros + 'Preencher o valor de unidades da estação de armazenamento.'
                         }
                    }
                    if (req.body.vlrhri == '' || typeof req.body.vlrhri == 'undefined' || req.body.vlrhri == 0) {
                         erros = erros + 'Preencher o valor R$/hora dos instaladores.'
                    }

                    if (erros == '') {

                         Configuracao.findOne({ _id: projeto.configuracao }).then((config) => {

                              trbatr = Math.round(parseFloat(req.body.uniatr) * (parseFloat(config.minatr) / 60))
                              //console.log('trbatr=>'+trbatr)
                              totatr = Math.round(parseFloat(trbatr) * parseFloat(req.body.equatr) * parseFloat(req.body.vlrhri))
                              //console.log('totatr=>'+totatr)
                              trbinv = Math.round(parseFloat(req.body.uniinv) * (parseFloat(config.mininv) / 60))
                              //console.log('trbinv=>'+trbinv)
                              totinv = Math.round(parseFloat(trbinv) * parseFloat(req.body.equinv) * parseFloat(req.body.vlrhri))
                              //console.log('totinv=>'+totinv)
                              trbstb = Math.round(parseFloat(req.body.unistb) * (parseFloat(config.minstb) / 60))
                              //console.log('trbstb=>'+trbstb)
                              totstb = Math.round(parseFloat(trbstb) * parseFloat(req.body.equstb) * parseFloat(req.body.vlrhri))
                              //console.log('totstb=>'+totstb)

                              var qtdins = req.body.equmod
                              if (qtdins == 0 || qtdins == '' || typeof qtdins == 'undefined') {
                                   qtdins = 2
                              }
                              projeto.qtdins = qtdins

                              if (parseFloat(req.body.unimod) > 13 && parseFloat(req.body.uniest) > 3 && parseFloat(qtdins) > 3) {
                                   trbest = Math.round(parseFloat(req.body.uniest) * (parseFloat(config.minest) * 2 / (parseFloat(qtdins)) / 60))
                                   trbmod = Math.round(parseFloat(req.body.unimod) * (parseFloat(config.minmod) * 2 / (parseFloat(qtdins)) / 60))
                                   totest = (parseFloat(trbest) * parseFloat(req.body.vlrhri) * (parseFloat(qtdins))).toFixed(2)
                                   totmod = (parseFloat(trbmod) * parseFloat(req.body.vlrhri) * (parseFloat(qtdins))).toFixed(2)
                              } else {
                                   trbest = Math.round(parseFloat(req.body.uniest) * (parseFloat(config.minest) / 60))
                                   trbmod = Math.round(parseFloat(req.body.unimod) * (parseFloat(config.minmod) / 60))
                                   if (qtdins > 2) {
                                        insadd = (parseFloat(qtdins) - 2)
                                        totest = ((parseFloat(trbest) * parseFloat(req.body.vlrhri) * 2) + (parseFloat(trbest) * parseFloat(req.body.vlrhri) * insadd)).toFixed(2)
                                        totmod = ((parseFloat(trbmod) * parseFloat(req.body.vlrhri) * 2) + (parseFloat(trbmod) * parseFloat(req.body.vlrhri) * insadd)).toFixed(2)
                                   } else {
                                        //console.log('entrou')
                                        totest = (parseFloat(trbest) * parseFloat(req.body.vlrhri) * 2).toFixed(2)
                                        totmod = (parseFloat(trbmod) * parseFloat(req.body.vlrhri) * 2).toFixed(2)
                                   }
                              }

                              //console.log('projeto.temPainel=>' + projeto.temPainel)
                              //console.log('projeto.temPainel=>' + projeto.temPainel)
                              if (projeto.temPainel == 'checked') {
                                   if (req.body.unipnl != '' || req.body.unipnl != 0) {
                                        trbpnl = Math.round(parseFloat(req.body.unipnl) * (parseFloat(config.minpnl) / 60))
                                        totpnl = Math.round(parseFloat(trbpnl) * parseFloat(req.body.equpnl) * parseFloat(req.body.vlrhri))
                                   } else {
                                        trbpnl = 0
                                        totpnl = 0
                                   }
                                   projeto.unipnl = req.body.unipnl
                                   projeto.trbpnl = trbpnl
                                   projeto.totpnl = totpnl
                              } else {
                                   trbpnl = 0
                                   totpnl = 0
                              }
                              if (projeto.temArmazenamento == 'checked') {
                                   if (req.body.unieae != '' || req.body.unieae != 0) {
                                        trbeae = Math.round(parseFloat(req.body.unieae) * (parseFloat(config.mineae) / 60))
                                        toteae = Math.round(parseFloat(trbeae) * parseFloat(req.body.equeae) * parseFloat(req.body.vlrhri))
                                   } else {
                                        trbeae = 0
                                        toteae = 0
                                   }
                                   projeto.unipnl = req.body.unieae
                                   projeto.trbeae = trbeae
                                   projeto.toteae = toteae
                              } else {
                                   trbeae = 0
                                   toteae = 0
                              }

                              var totint = (parseFloat(totest) + parseFloat(totmod) + parseFloat(totinv) + parseFloat(totatr) + parseFloat(totstb) + parseFloat(totpnl) + parseFloat(toteae)).toFixed(2)
                              var trbint = Math.round(parseFloat(trbest) + parseFloat(trbmod) + parseFloat(trbinv) + parseFloat(trbatr) + parseFloat(trbstb) + parseFloat(trbpnl) + parseFloat(trbeae))

                              tothrs = trbint
                              console.log('trbint=>' + trbint)
                              //console.log('projeto.trbges=>' + projeto.trbges)
                              //console.log('projeto.trbpro=>' + projeto.trbpro)
                              if (projeto.trbges != null) {
                                   tothrs = parseFloat(tothrs) + parseFloat(projeto.trbges)
                                   //console.log('tothrs=>' + tothrs)
                              }
                              if (projeto.trbrpo != null) {
                                   tothrs = parseFloat(tothrs) + parseFloat(projeto.trbpro)
                                   //console.log('tothrs=>' + tothrs)
                              }
                              projeto.tothrs = Math.round(tothrs)
                              hrsprj = parseFloat(projeto.trbmod) + parseFloat(projeto.trbest) + parseFloat(projeto.trbpro) + parseFloat(projeto.trbges)
                              projeto.hrsprj = hrsprj


                              projeto.vlrhri = req.body.vlrhri

                              projeto.uniest = req.body.uniest
                              projeto.uniatr = req.body.uniatr
                              projeto.unimod = req.body.unimod
                              projeto.uniinv = req.body.uniinv
                              projeto.unistb = req.body.unistb
                              projeto.unieae = req.body.unieae

                              projeto.trbest = trbest
                              projeto.trbatr = trbatr
                              projeto.trbmod = trbmod
                              projeto.trbinv = trbinv
                              projeto.trbint = trbint
                              projeto.trbstb = trbstb

                              projeto.diasAte = Math.round(parseFloat(trbatr) / parseFloat(conhrs), -1)
                              projeto.diasInv = Math.round(parseFloat(trbinv) / parseFloat(conhrs), -1)
                              projeto.diasStb = Math.round(parseFloat(trbstb) / parseFloat(conhrs), -1)
                              projeto.diasPnl = Math.round(parseFloat(trbpnl) / parseFloat(conhrs), -1)
                              projeto.diasEae = Math.round(parseFloat(trbeae) / parseFloat(conhrs), -1)
                              projeto.diasEst = Math.round(parseFloat(trbest) / parseFloat(conhrs), -1)
                              projeto.diasMod = Math.round(parseFloat(trbmod) / parseFloat(conhrs), -1)

                              projeto.totest = totest
                              projeto.totmod = totmod
                              projeto.totinv = totinv
                              projeto.totatr = totatr
                              projeto.totstb = totstb

                              projeto.totint = totint
                              projeto.equatr = req.body.equatr
                              projeto.equinv = req.body.equinv
                              projeto.equstb = req.body.equstb
                              projeto.equpnl = req.body.equpnl
                              projeto.equeae = req.body.equeae
                              projeto.equest = req.body.equest
                              projeto.equmod = req.body.equmod

                              projeto.tipoCustoIns = req.body.selecionado

                              projeto.save().then(() => {
                                   req.flash('success_msg', 'Projeto salvo com sucesso. Aplicar o gerenciamento e os tributos.')
                                   res.redirect('/customdo/instalacao/' + req.body.id)
                              }).catch((err) => {
                                   req.flash('error_msg', 'Falha ao aplicar os custos do projeto.')
                                   res.redirect('/customdo/instalacao/' + req.body.id)
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Falha ao encontrar a configuração.')
                              res.redirect('/customdo/instalacao/' + req.body.id)
                         })
                    } else {
                         req.flash('error_msg', erros)
                         res.redirect('/customdo/instalacao/' + req.body.id)
                    }
               }
          }).catch((err) => {
               req.flash('error_msg', 'Falha ao encontrar a configuração.')
               res.redirect('/customdo/instalacao/' + req.body.id)
          })
     }).catch((err) => {
          req.flash('error_msg', 'Falha ao encontrar o projeto')
          res.redirect('/customdo/instalacao/' + req.body.id)
     })
})

router.post('/projetista/', ehAdmin, (req, res) => {

     var erros = ''

     Projeto.findOne({ _id: req.body.id }).then((projeto) => {

          var tothrs = 0
          var totmem
          var totart
          var totate
          var totdis
          var totuni
          var totsit
          var trbpro
          var totpro

          //console.log('req.body.selecionado=>' + req.body.selecionado)

          if (req.body.diasPro != '' && req.body.diasPro != 0 && req.body.selecionado == 'dia') {

               if (!req.body.vlrdrp || req.body.vlrdrp == null) {
                    erros = erros + 'Preencher o valor R$/dia do projetista.'
                    req.flash('error_msg', erros)
                    res.redirect('/customdo/projetista/' + req.body.id)
               } else {

                    trbpro = parseFloat(req.body.diasPro) * conhrs
                    tothrs = trbpro
                    //console.log('projeto.trbges=>' + projeto.trbges)
                    //console.log('projeto.trbint=>' + projeto.trbint)
                    if (projeto.trbges != null) {
                         tothrs = parseFloat(tothrs) + parseFloat(projeto.trbges)
                         //console.log('tothrs=>' + tothrs)
                    }
                    if (projeto.trbint != null) {
                         tothrs = parseFloat(tothrs) + parseFloat(projeto.trbint)
                         //console.log('tothrs=>' + tothrs)
                    }

                    totpro = parseFloat(req.body.diasPro) * parseFloat(req.body.vlrdrp)
                    projeto.trbpro = trbpro
                    //console.log('trbpro=>' + trbpro)
                    projeto.totpro = totpro
                    //console.log('totpro=>' + totpro)
                    projeto.tothrs = tothrs
                    //console.log('tothrs=>' + tothrs)
                    projeto.tipoCustoPro = req.body.selecionado
                    projeto.diasPro = req.body.diasPro
                    //console.log('req.body.diasPro=>' + req.body.diasPro)
                    projeto.vlrdrp = req.body.vlrdrp
                    //console.log('req.body.vlrdrp=>' + req.body.vlrdrp)
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
                    projeto.vlrart = req.body.vlrart
                    //console.log('req.body.vlrart=>' + req.body.vlrart)
                    projeto.totpro_art = parseFloat(totpro) + parseFloat(req.body.vlrart)

                    projeto.save().then(() => {
                         req.flash('success_msg', 'Projeto salvo com sucesso. Aplicar o gerenciamento e os tributos.')
                         res.redirect('/customdo/projetista/' + req.body.id)
                    }).catch((err) => {
                         req.flash('error_msg', 'Falha ao aplicar os custos do projeto')
                         res.redirect('/customdo/projetista/' + req.body.id)
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

                    totmem = (parseFloat(req.body.trbmem) * parseFloat(req.body.vlrhrp)).toFixed(2)
                    //console.log('totmem=>' + totmem)
                    totart = (parseFloat(req.body.trbart) * parseFloat(req.body.vlrhrp)).toFixed(2)
                    //console.log('totart=>' + totart)
                    totate = (parseFloat(req.body.trbate) * parseFloat(req.body.vlrhrp)).toFixed(2)
                    //console.log('totate=>' + totate)
                    totdis = (parseFloat(req.body.trbdis) * parseFloat(req.body.vlrhrp)).toFixed(2)
                    //console.log('totdis=>' + totdis)
                    totuni = (parseFloat(req.body.trbuni) * parseFloat(req.body.vlrhrp)).toFixed(2)
                    //console.log('totuni=>' + totuni)
                    totsit = (parseFloat(req.body.trbsit) * parseFloat(req.body.vlrhrp)).toFixed(2)
                    //console.log('totsit=>' + totsit)

                    totpro = (parseFloat(totmem) + parseFloat(totart) + parseFloat(totate) + parseFloat(totdis) + parseFloat(totuni) + parseFloat(totsit)).toFixed(2)
                    trbpro = Math.round(parseFloat(req.body.trbmem) + parseFloat(req.body.trbart) + parseFloat(req.body.trbate) + parseFloat(req.body.trbdis) + parseFloat(req.body.trbuni) + parseFloat(req.body.trbsit))
                    //console.log('totpro=>' + totpro)
                    //console.log('trbpro=>' + trbpro)

                    tothrs = parseFloat(trbpro)
                    //console.log('tothrs=>' + tothrs)
                    //console.log('projeto.trbges=>' + projeto.trbges)
                    //console.log('projeto.trbint=>' + projeto.trbint)
                    if (projeto.trbges != null) {
                         tothrs = parseFloat(tothrs) + parseFloat(projeto.trbges)
                         //console.log('tothrs=>' + tothrs)
                    }
                    if (projeto.trbint != null) {
                         tothrs = parseFloat(tothrs) + parseFloat(projeto.trbint)
                         //console.log('tothrs=>' + tothrs)
                    }

                    projeto.trbpro = trbpro
                    //console.log('totpro=>' + totpro)
                    projeto.totpro = totpro
                    //console.log('tothrs=>' + tothrs)
                    projeto.tothrs = tothrs
                    projeto.tipoCustoPro = req.body.selecionado
                    projeto.vlrhrp = req.body.vlrhrp
                    projeto.trbmem = req.body.trbmem
                    projeto.trbart = req.body.trbart
                    projeto.trbate = req.body.trbate
                    projeto.trbdis = req.body.trbdis
                    projeto.trbuni = req.body.trbuni
                    projeto.trbsit = req.body.trbsit
                    projeto.totmem = totmem
                    projeto.totart = totart
                    projeto.totate = totate
                    projeto.totdis = totdis
                    projeto.totuni = totuni
                    projeto.totsit = totsit
                    projeto.vlrart = req.body.vlrart
                    projeto.totpro_art = parseFloat(totpro) + parseFloat(+req.body.vlrart)

                    projeto.save().then(() => {
                         req.flash('success_msg', 'Projeto salvo com sucesso. Aplicar o gerenciamento e os tributos.')
                         res.redirect('/customdo/projetista/' + req.body.id)
                    }).catch((err) => {
                         req.flash('error_msg', 'Falha ao aplicar os custos do projeto.')
                         res.redirect('/customdo/projetista/' + req.body.id)
                    })
               } else {
                    req.flash('error_msg', erros)
                    res.redirect('/customdo/projetista/' + req.body.id)
               }
          }
     }).catch((err) => {
          req.flash('error_msg', 'Falha ao encontrar o projeto')
          res.redirect('/customdo/projetista/' + req.body.id)
     })
})

router.post('/gestao/', ehAdmin, (req, res) => {
     var erros = ''

     Projeto.findOne({ _id: req.body.id }).then((projeto) => {

          var tothrs
          var totesc
          var totvis
          var totcom
          var totcro
          var totaqi
          var totrec
          var trbges
          var totges

          if (req.body.diasGes != '' && req.body.diasGes != 0 && (req.body.selecionado == 'dia')) {

               if (!req.body.vlrdrg || req.body.vlrdrg == null) {
                    erros = erros + 'Preencher o valor R$/dia da gestão.'
                    req.flash('error_msg', erros)
                    res.redirect('/customdo/gestao/' + req.body.id)
               } else {

                    trbges = parseFloat(req.body.diasGes) * conhrs
                    tothrs = trbges
                    if (projeto.trbpro != null) {
                         tothrs = tothrs + parseFloat(projeto.trbpro)
                    }
                    if (projeto.trbint != null) {
                         tothrs = tothrs + parseFloat(projeto.trbint)
                    }

                    projeto.trbges = trbges
                    projeto.totges = parseFloat(req.body.diasGes) * parseFloat(req.body.vlrdrg)
                    projeto.tothrs = tothrs
                    projeto.tipoCustoGes = req.body.selecionado
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
                         req.flash('success_msg', 'Projeto salvo com sucesso. Aplicar o gerenciamento e os tributos.')
                         res.redirect('/customdo/gestao/' + req.body.id)
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
                    projeto.tipoCustoGes = req.body.selecionado
                    projeto.totesc = totesc
                    projeto.totvis = totvis
                    projeto.totcom = totcom
                    projeto.totcro = totcro
                    projeto.totaqi = totaqi
                    projeto.totrec = totrec
                    projeto.trbges = trbges
                    projeto.totges = totges
                    projeto.save().then(() => {
                         req.flash('success_msg', 'Projeto salvo com sucesso. Aplicar o gerenciamento e os tributos.')
                         res.redirect('/customdo/gestao/' + req.body.id)
                    }).catch((err) => {
                         req.flash('error_msg', 'Falha ao aplicar os custos do projeto')
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

module.exports = router
