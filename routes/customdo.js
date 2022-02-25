require('../admin')
var express = require("express")
var multer = require('multer')
const router = express.Router()

// app.set('view engine', 'ejs')
const storage = multer.diskStorage({
     destination: function (req, file, cb) {
          cb(null, 'public/arquivos/')
     },
     filename: (req, file, cb) => {
          cb(null, file.originalname)
     }
})

require('../model/Projeto')
require('../model/Configuracao')
require('../model/Pessoa')
require('../model/Cliente')

const mongoose = require('mongoose')

const Projeto = mongoose.model('projeto')
const Configuracao = mongoose.model('configuracao')
const Pessoa = mongoose.model('pessoa')
const Cliente = mongoose.model('cliente')

const { ehAdmin } = require('../helpers/ehAdmin')

//Configurando pasta de imagens 
router.use(express.static('public/'))
router.use(express.static('public/arquivos/'))


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
                         var lblDes
                         var selecionado = ''
                         //console.log('projeto.tipoCustoGes=>'+projeto.tipoCustoGes)
                         if (projeto.tipoCustoGes == 'hora') {
                              checkHora = 'checked'
                              typeHrg = 'text'
                              displayHrs = 'inline'
                              mostraHora = true
                              lblDes = 'Horas:'
                              selecionado = 'hora'
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
                              lblDes = 'Dias:'
                              selecionado = 'dia'
                         }
                         //console.log('selecionado=>'+selecionado)
                         res.render('projeto/customdo/gestao', { projeto, gestor, configuracao, cliente, checkHora, checkDia, typeHrg, typeDrg, typeGes, displayHrs, displayDia, displayTda, escopo, cronograma, vistoria, comunicacao, aquisicao, alocacao, mostraHora, lblDes, selecionado })
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
                         var lblDes = ''
                         var selecionado = ''
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
                              lblDes = 'Horas:'
                              selecionado = 'hora'
                         } else {
                              checkDia = 'checked'
                              typeDri = 'text'
                              displayDia = 'inline'
                              displayTda = 'inline'
                              displayTempo = 'inline'
                              mostraHora = false
                              typeIns = 'text'
                              lblDes = 'Dias:'
                              selecionado = 'dia'
                         }
                         res.render('projeto/customdo/instalacao', { projeto, instalador, configuracao, cliente, checkHora, checkDia, typeHri, typeIns, typeDri, displayHrs, displayDia, displayTda, displayTempo, mostraHora, disabledAtr, disabledInv, disabledStb, disabledEae, disabledPnl, disabledEst, disabledMod, lblDes, selecionado })
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
                         var lblDes = ''
                         var selecionado = ''
                         if (projeto.tipoCustoPro == 'hora') {
                              checkHora = 'checked'
                              typeHrp = 'text'
                              displayHrs = 'inline'
                              mostraHora = true
                              lblDes = 'Horas:'
                              selecionado = 'hora'
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
                              lblDes = 'Dias:'
                              selecionado = 'dia'
                         }
                         res.render('projeto/customdo/projetista', { projeto, projetista, configuracao, cliente, checkHora, checkDia, typeHrp, typeDrp, typePro, displayHrs, displayDia, displayTda, memorial, art, aterramento, distribuicao, unifilar, situacao, mostraHora, lblDes, selecionado })
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
               var totatr = 0
               var totinv = 0
               var totstb = 0
               var totpnl = 0
               var toteae = 0
               var totest = 0
               var totmod = 0
               var trbatr = 0
               var trbinv = 0
               var trbstb = 0
               var trbpnl = 0
               var trbeae = 0
               var trbest = 0
               var trbmod = 0
               var trbint = 0
               var totdes = 0
               var conhrs = 0
               if (config.hrstrb > 0) {
                    conhrs = config.hrstrb
               } else {
                    conhrs = 8
               }
               var desIns

               //console.log('req.body.selecionado=>' + req.body.selecionado)

               if (req.body.selecionado == 'dia') {

                    if (req.body.vlrdri == '' || typeof req.body.vlrdri == 'undefined' || req.body.vldri == 0) {
                         erros = erros + 'Preencher o valor R$/dia do instalador.'
                         req.flash('error_msg', erros)
                         res.redirect('/customdo/instalacao/' + req.body.id)
                    } else {

                         //console.log('conhrs=>' + conhrs)

                         trbatr = parseFloat(req.body.trbatr) * parseFloat(conhrs)
                         trbinv = parseFloat(req.body.trbinv) * parseFloat(conhrs)
                         trbstb = parseFloat(req.body.trbstb) * parseFloat(conhrs)
                         //console.log('projeto.temPainel=>' + projeto.temPainel)
                         if (projeto.temPainel == 'checked') {
                              trbpnl = parseFloat(req.body.trbpnl) * parseFloat(conhrs)
                         } else {
                              trbpnl = 0
                         }
                         //console.log('projeto.temArmazenamento=>' + projeto.temArmazenamento)
                         if (projeto.temArmazenamento == 'checked') {
                              trbeae = parseFloat(req.body.trbeae) * parseFloat(conhrs)
                         } else {
                              trbeae = 0
                         }
                         trbest = parseFloat(req.body.trbest) * parseFloat(conhrs)
                         trbmod = parseFloat(req.body.trbmod) * parseFloat(conhrs)
                         //console.log('trbatr=>' + trbatr)
                         //console.log('trbinv=>' + trbinv)
                         //console.log('trbstb=>' + trbstb)
                         //console.log('trbpnl=>' + trbpnl)
                         //console.log('trbeae=>' + trbeae)
                         //console.log('trbest=>' + trbest)
                         //console.log('trbmod=>' + trbmod)
                         if (req.body.desIns != 0 && req.body.desIns != '' && typeof req.body.desIns != 'undefined') {
                              desIns = parseFloat(req.body.desIns)
                              totdes = parseFloat(req.body.desIns) * parseFloat(req.body.vlrdri)
                         } else {
                              desIns = 0
                              totdes = 0
                         }
                         trbint = Math.round(parseFloat(trbatr) + parseFloat(trbinv) + parseFloat(trbstb) + parseFloat(trbpnl) + parseFloat(trbeae) + parseFloat(trbest) + parseFloat(trbmod) + (parseFloat(req.body.desIns) * parseFloat(conhrs)))

                         //console.log('trbint=>' + trbint)

                         //console.log('trbint=>' + trbint)
                         //console.log('projeto.trbges=>' + projeto.trbges)
                         //console.log('projeto.trbpro=>' + projeto.trbpro)
                         tothrs = trbint
                         //console.log('tothrs=>' + tothrs)
                         //console.log('projeto.trbges=>' + projeto.trbges)
                         if (projeto.trbges != null) {
                              tothrs = parseFloat(tothrs) + parseFloat(projeto.trbges)
                              //console.log('tothrs=>' + tothrs)
                         }
                         //console.log('projeto.trbpro=>' + projeto.trbpro)
                         if (projeto.trbpro != null) {
                              tothrs = parseFloat(tothrs) + parseFloat(projeto.trbpro)
                              //console.log('tothrs=>' + tothrs)
                         }
                         //console.log('tothrs=>' + tothrs)
                         projeto.tothrs = Math.round(tothrs)
                         var trbpro = 0
                         var trbges = 0
                         if (projeto.trbpro != '' && typeof projeto.trbpro != 'undefined') {
                              trbpro = projeto.trbpro
                         }
                         if (projeto.trbges != '' && typeof projeto.trbges != 'undefined') {
                              trbges = projeto.trbges
                         }
                         hrsprj = parseFloat(trbmod) + parseFloat(trbest) + parseFloat(trbpro) + parseFloat(trbges)
                         projeto.hrsprj = hrsprj
                         //console.log('hrsprj=>' + hrsprj)

                         var diasObra
                         var diastr
                         diasObra = projeto.diasIns
                         diastr = parseFloat(projeto.diasGes) + parseFloat(projeto.diasPro) + parseFloat(req.body.diasIns) + parseFloat(projeto.desGes) + parseFloat(projeto.desPro) + parseFloat(req.body.desIns)
                         projeto.diasObra = diasObra
                         projeto.diastr = diastr

                         totatr = parseFloat(req.body.trbatr) * parseFloat(req.body.vlrdri) * parseFloat(req.body.equatr)
                         totinv = parseFloat(req.body.trbinv) * parseFloat(req.body.vlrdri) * parseFloat(req.body.trbinv)
                         totstb = parseFloat(req.body.trbstb) * parseFloat(req.body.vlrdri) * parseFloat(req.body.trbstb)

                         if (projeto.temPainel == 'checked') {
                              //console.log('entrou painel')
                              totpnl = parseFloat(req.body.trbpnl) * parseFloat(req.body.vlrdri) * parseFloat(req.body.trbpnl)
                              projeto.unipnl = req.body.unipnl
                              projeto.trbpnl = req.body.trbpnl
                              projeto.diasPnl = req.body.trbpnl
                              projeto.equpnl = req.body.equpnl
                              projeto.totpnl = totpnl
                         } else {
                              totpnl = 0
                         }
                         if (projeto.temArmazenamento == 'checked') {
                              //console.log('entrou armazenamento')
                              toteae = parseFloat(req.body.trbeae) * parseFloat(req.body.vlrdri) * parseFloat(req.body.trbeae)
                              projeto.unieae = req.body.unieae
                              projeto.trbeae = req.body.trbeae
                              projeto.diasEae = req.body.trbeae
                              projeto.equeae = req.body.equeae
                              projeto.toteae = toteae
                         } else {
                              toteae = 0
                         }
                         totest = parseFloat(req.body.trbest) * parseFloat(req.body.vlrdri) * parseFloat(req.body.trbest)
                         totmod = parseFloat(req.body.trbmod) * parseFloat(req.body.vlrdri) * parseFloat(req.body.trbmod)
                         totint = parseFloat(totatr) + parseFloat(totinv) + parseFloat(totstb) + parseFloat(totpnl) + parseFloat(toteae) + parseFloat(totest) + parseFloat(totmod) + parseFloat(totdes)

                         //console.log('totatr=>' + totatr)
                         //console.log('totinv=>' + totinv)
                         //console.log('totstb=>' + totstb)
                         //console.log('totest=>' + totest)
                         //console.log('totmod=>' + totmod)
                         //console.log('totint=>' + totint)

                         projeto.uniatr = req.body.uniatr
                         projeto.uniinv = req.body.uniinv
                         projeto.unistb = req.body.unistb
                         projeto.uniest = req.body.uniest
                         projeto.unimod = req.body.unimod

                         projeto.trbatr = req.body.trbatr
                         projeto.trbinv = req.body.trbinv
                         projeto.trbstb = req.body.trbstb
                         projeto.trbest = req.body.trbest
                         projeto.trbmod = req.body.trbmod
                         projeto.trbint = trbint
                         //console.log('trbint=>' + trbint)

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
                         projeto.totest = totest
                         projeto.totmod = totmod
                         projeto.totint = totint

                         projeto.tipoCustoIns = req.body.selecionado
                         //console.log('req.body.selecionado=>' + req.body.selecionado)
                         projeto.diasIns = parseFloat(req.body.diasIns)
                         //console.log('req.body.diasIns=>' + req.body.diasIns)
                         projeto.qtdins = req.body.equmod
                         //console.log('req.body.equmod=>' + req.body.equmod)
                         projeto.vlrdri = req.body.vlrdri
                         //console.log('req.body.vlrdri=>' + req.body.vlrdri)
                         projeto.desIns = desIns
                         projeto.vlrDin = totdes

                         projeto.save().then(() => {
                              req.flash('success_msg', 'Projeto salvo com sucesso. Aplicar o gerenciamento e os tributos.')
                              res.redirect('/customdo/instalacao/' + req.body.id)
                         }).catch((err) => {
                              req.flash('error_msg', 'Falha ao aplicar os custos do projeto.')
                              res.redirect('/customdo/instalacao/' + req.body.id)
                         })
                    }

               } else {

                    if (projeto.tipoCustoIns == 'hora') {

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
                                   projeto.equpnl = req.body.equpnl
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
                                   projeto.equeae = req.body.equeae
                              } else {
                                   trbeae = 0
                                   toteae = 0
                              }
                              if (req.body.desIns != 0 && req.body.desIns != '' && typeof req.body.desIns != 'undefined') {
                                   desIns = req.body.desIns
                                   totdes = parseFloat(req.body.desIns) * parseFloat(req.body.vlrdri)
                              } else {
                                   desIns = 0
                                   totdes = 0
                              }

                              var totint = (parseFloat(totest) + parseFloat(totmod) + parseFloat(totinv) + parseFloat(totatr) + parseFloat(totstb) + parseFloat(totpnl) + parseFloat(toteae) + parseFloat(totdes)).toFixed(2)
                              var trbint = Math.round(parseFloat(trbest) + parseFloat(trbmod) + parseFloat(trbinv) + parseFloat(trbatr) + parseFloat(trbstb) + parseFloat(trbpnl) + parseFloat(trbeae))

                              tothrs = trbint
                              //console.log('trbint=>' + trbint)
                              //console.log('projeto.trbges=>' + projeto.trbges)
                              //console.log('projeto.trbpro=>' + projeto.trbpro)
                              if (projeto.trbges != null) {
                                   tothrs = parseFloat(tothrs) + parseFloat(projeto.trbges)
                                   //console.log('tothrs=>' + tothrs)
                              }
                              if (projeto.trbpro != null) {
                                   tothrs = parseFloat(tothrs) + parseFloat(projeto.trbpro)
                                   //console.log('tothrs=>' + tothrs)
                              }
                              projeto.tothrs = Math.round(tothrs)
                              if (projeto.trbpro != '' && typeof projeto.trbpro != 'undefined') {
                                   trbpro = projeto.trbpro
                              }
                              if (projeto.trbges != '' && typeof projeto.trbges != 'undefined') {
                                   trbges = projeto.trbges
                              }
                              hrsprj = parseFloat(trbmod) + parseFloat(trbest) + parseFloat(trbpro) + parseFloat(trbges)
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
                              projeto.equest = req.body.equest
                              projeto.equmod = req.body.equmod

                              projeto.tipoCustoIns = req.body.selecionado

                              projeto.desIns = desIns
                              projeto.vlrDin = totdes

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
          var hrsprj = 0
          var totmem
          var totart
          var totate
          var totdis
          var totuni
          var totsit
          var trbpro
          var totpro
          var toteng = 0
          // var totdes

          //console.log('req.body.selecionado=>' + req.body.selecionado)

          Configuracao.findOne({ _id: projeto.configuracao }).then((configuracao) => {

               var conhrs = configuracao.hrstrb

               //console.log('req.body.diasPro=>' + req.body.diasPro)

               if (req.body.diasPro != '' && req.body.diasPro != 0 && req.body.selecionado == 'dia') {

                    if (!req.body.vlrdrp || req.body.vlrdrp == null) {
                         erros = erros + 'Preencher o valor R$/dia do projetista.'
                         req.flash('error_msg', erros)
                         res.redirect('/customdo/projetista/' + req.body.id)
                    } else {

                         trbpro = parseFloat(req.body.diasPro) * parseFloat(conhrs)

                         if (req.body.desPro != '' && req.body.desPro != 0 && typeof req.body.desPro != 'undefined') {
                              tothrs = parseFloat(trbpro) //+ parseFloat(req.body.desPro)
                              //totdes = (parseFloat(req.body.desPro) * parseFloat(req.body.vlrdrp)).toFixed(2)
                              //projeto.desPro = req.body.desPro
                         } else {
                              tothrs = trbpro
                              projeto.desPro = 0
                         }
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

                         var diasObra
                         var diastr

                         if (projeto.diasIns != '' && typeof projeto.diasIns != 'undefined') {
                              //console.log('projeto.diasIns=>' + projeto.diasIns)
                              diasObra = projeto.diasIns
                              diastr = parseFloat(projeto.diasGes) + parseFloat(req.body.diasPro) + parseFloat(projeto.diasIns) + parseFloat(projeto.desGes) + parseFloat(projeto.desIns)
                              projeto.diasObra = diasObra
                              projeto.diastr = diastr
                         }


                         //console.log('req.body.toteng=>' + req.body.toteng)
                         if (req.body.toteng != '' && typeof req.body.toteng != 'undefined') {
                              toteng = parseFloat(req.body.toteng)
                         } else {
                              toteng = 0
                         }
                         //console.log('toteng=>' + toteng)
                         totpro = (parseFloat(req.body.diasPro) * parseFloat(req.body.vlrdrp)) + parseFloat(toteng)//+ parseFloat(totdes)
                         //console.log('totpro=>' + totpro)
                         projeto.trbpro = trbpro
                         //console.log('trbpro=>' + trbpro)
                         projeto.totpro = totpro
                         //console.log('totpro=>' + totpro)
                         projeto.tothrs = tothrs
                         //console.log('tothrs=>' + tothrs)
                         projeto.tipoCustoPro = req.body.selecionado
                         projeto.diasPro = parseFloat(req.body.diasPro)
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

                         projeto.toteng = toteng
                         //console.log('req.body.vlrart=>' + req.body.vlrart)
                         projeto.totpro_art = parseFloat(totpro) + parseFloat(req.body.vlrart)

                         // projeto.vlrDpr = totdes

                         projeto.save().then(() => {
                              req.flash('success_msg', 'Projeto salvo com sucesso. Aplicar o gerenciamento e os tributos.')
                              res.redirect('/customdo/projetista/' + req.body.id)
                         }).catch((err) => {
                              req.flash('error_msg', 'Falha ao aplicar os custos do projeto')
                              res.redirect('/customdo/projetista/' + req.body.id)
                         })
                    }

               } else {
                    //console.log('tipoCustoPro=>'+projeto.tipoCustoPro)
                    if (projeto.tipoCustoPro == 'hora') {
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
                    }

                    if (erros == '') {

                         var desPro

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
                         // if (req.body.diasPro != ''){
                         //      trbpro = parseFloat(req.body.diasPro) * conhrs
                         // }else{
                         //      trbpro = 0
                         // }
                         

                         // if (req.body.desPro != '' && req.body.desPro != 0 && typeof req.body.desPro != 'undefined') {
                         //      totdes = (parseFloat(req.body.desPro) * parseFloat(req.body.vlrhrp)).toFixed(2)
                         //      desPro = parseFloat(req.body.desPro)
                         // } else {
                         //      desPro = 0
                         // }

                         if (req.body.toteng != '' && typeof req.body.toteng != 'undefined') {
                              toteng = parseFloat(req.body.toteng)
                         } else {
                              toteng = 0
                         }
                         totpro = (parseFloat(totmem) + parseFloat(totart) + parseFloat(totate) + parseFloat(totdis) + parseFloat(totuni) + parseFloat(totsit) + parseFloat(toteng)).toFixed(2)
                         trbpro = Math.round(parseFloat(req.body.trbmem) + parseFloat(req.body.trbart) + parseFloat(req.body.trbate) + parseFloat(req.body.trbdis) + parseFloat(req.body.trbuni) + parseFloat(req.body.trbsit))
                         //console.log('totpro=>' + totpro)
                         //console.log('trbpro=>' + trbpro)

                         tothrs = parseFloat(trbpro)
                         //console.log('tothrs=>' + tothrs)
                         //console.log('projeto.trbges=>' + projeto.trbges)
                         
                         //console.log('projeto.trbmod=>' + projeto.trbmod)

                         if (projeto.trbmod != null && projeto.trbmod != '' ) {     
                              hrsprj = parseFloat(hrsprj) + parseFloat(projeto.trbmod)
                              tothrs = parseFloat(tothrs) + parseFloat(projeto.trbmod)
                         }else{
                              hrsprj = parseFloat(hrsprj) + 0
                              tothrs = parseFloat(tothrs) + 0
                         }
                         if (projeto.trbest != null && projeto.trbest != '') {
                              hrsprj = parseFloat(hrsprj) + parseFloat(projeto.trbest)
                              tothrs = parseFloat(tothrs) + parseFloat(projeto.trbest)
                              //console.log('tothrs=>' + tothrs)
                         }else{
                              hrsprj = parseFloat(hrsprj) + 0
                              tothrs = parseFloat(tothrs) + 0                              
                         }
                         if (projeto.trbinv != null && projeto.trbinv != '') {
                              tothrs = parseFloat(tothrs) + parseFloat(projeto.trbinv)
                              //console.log('tothrs=>' + tothrs)
                         }else{
                              tothrs = parseFloat(tothrs) + 0
                         }
                         if (projeto.trbatr != null && projeto.trbatr != '') {
                              tothrs = parseFloat(tothrs) + parseFloat(projeto.trbatr)
                              //console.log('tothrs=>' + tothrs)
                         }else{
                              tothrs = parseFloat(tothrs) + 0
                         }                                                         
                         if (projeto.trbges != null && projeto.trbges != '') {
                              hrsprj = parseFloat(hrsprj) + parseFloat(projeto.trbges)
                              tothrs = parseFloat(tothrs) + parseFloat(projeto.trbges)
                              //console.log('tothrs=>' + tothrs)
                         }else{
                              hrsprj = parseFloat(hrsprj) + 0
                              tothrs = parseFloat(tothrs) + 0
                         }

                         
                         //console.log('tothrs=>' + tothrs)
                         //console.log('hrsprj=>' + hrsprj)

                         projeto.tothrs = Math.round(tothrs)
                         projeto.hrsprj = Math.round(hrsprj)


                         projeto.trbpro = trbpro
                         
                         projeto.totpro = totpro
                         
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
                         projeto.totpro_art = parseFloat(totpro) + parseFloat(req.body.vlrart)
                         // projeto.desPro = desPro
                         // projeto.vlrDpr = totdes

                         //console.log('req.body.fileMemo=>' + fileMemo)
                         // salvaArquivo('memorial', req.body.fileMemo)

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
               req.flash('error_msg', 'Falha ao encontrar a configuração.')
               res.redirect('/customdo/projetista/' + req.body.id)
          })
     }).catch((err) => {
          req.flash('error_msg', 'Falha ao encontrar o projeto.')
          res.redirect('/customdo/projetista/' + req.body.id)
     })
})

router.post('/gestao/', ehAdmin, (req, res) => {
     var erros = ''

     Projeto.findOne({ _id: req.body.id }).then((projeto) => {

          var tothrs = 0
          var hrsprj = 0
          var totesc
          var totvis
          var totcom
          var totcro
          var totaqi
          var totrec
          var trbges
          var totges
          var totdes
          var desGes = 0

          Configuracao.findOne({ _id: projeto.configuracao }).then((configuracao) => {

               var conhrs = configuracao.hrstrb
               //console.log('req.body.selecionado=>' + req.body.selecionado)
               //console.log('req.body.diasGes=>' + req.body.diasGes)

               if (req.body.diasGes != '' && req.body.diasGes != 0 && (req.body.selecionado == 'dia')) {

                    //console.log('é dia')

                    if (!req.body.vlrdrg || req.body.vlrdrg == null) {
                         erros = erros + 'Preencher o valor R$/dia da gestão.'
                         req.flash('error_msg', erros)
                         res.redirect('/customdo/gestao/' + req.body.id)
                    } else {
                         if (req.body.desGes != '' && req.body.desGes != 0 && typeof req.body.desGes != 'undefined') {
                              desGes = parseFloat(req.body.desGes)
                              totdes = parseFloat(req.body.desGes) * parseFloat(req.body.vlrdrg)
                         } else {
                              desGes = 0
                              totdes = 0
                         }
                         trbges = (parseFloat(req.body.diasGes) + parseFloat(desGes)) * parseFloat(conhrs)
                         tothrs = trbges
                         //console.log('trbges=>' + trbges)
                         if (projeto.trbpro != null) {
                              tothrs = tothrs + parseFloat(projeto.trbpro)
                         }
                         if (projeto.trbint != null) {
                              tothrs = tothrs + parseFloat(projeto.trbint)
                         }

                         projeto.trbges = trbges
                         projeto.totges = (parseFloat(req.body.diasGes) * parseFloat(req.body.vlrdrg)) + parseFloat(totdes)
                         projeto.tothrs = parseFloat(tothrs)
                         //console.log('tothrs=>' + tothrs)
                         //console.log('req.body.selecionado=>'+req.body.selecionado)
                         projeto.tipoCustoGes = req.body.selecionado
                         projeto.diasGes = parseFloat(req.body.diasGes)
                         //console.log('req.body.diasGes=>' + req.body.diasGes)
                         projeto.vlrdrg = req.body.vlrdrg
                         //console.log('req.body.vlrdrg=>' + req.body.vlrdrg)
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
                         projeto.desGes = desGes
                         projeto.vlrDge = totdes

                         projeto.save().then(() => {
                              //console.log('salvou projeto')
                              req.flash('success_msg', 'Projeto salvo com sucesso. Aplicar o gerenciamento e os tributos.')
                              res.redirect('/customdo/gestao/' + req.body.id)
                         }).catch((err) => {
                              req.flash('error_msg', 'Falha ao aplicar os custos do projeto')
                              res.redirect('/projeto/consulta')
                         })
                    }

               } else {

                         //console.log('é hora')
                    
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
                         if (req.body.desGes != '' && req.body.desGes != 0 && typeof req.body.desGes != 'undefined') {
                              desGes = parseFloat(req.body.desGes)
                              totdes = (parseFloat(req.body.desGes) * parseFloat(req.body.vlrhrg)).toFixed(2)
                         } else {
                              desGes = 0
                              totdes = 0
                         }

                         //console.log('totvis=>'+totvis)
                         //console.log('totcom=>'+totcom)
                         //console.log('totcro=>'+totcro)
                         //console.log('totaqi=>'+totaqi)
                         //console.log('totrec=>'+totrec)
                         //console.log('totesc=>'+totesc)
                         //console.log('totdes=>'+totdes)
                         totges = (parseFloat(totvis) + parseFloat(totcom) + parseFloat(totcro) + parseFloat(totaqi) + parseFloat(totrec) + parseFloat(totesc) + parseFloat(totdes)).toFixed(2)
                         trbges = Math.round(parseFloat(req.body.trbvis) + parseFloat(req.body.trbcom) + parseFloat(req.body.trbcro) + parseFloat(req.body.trbaqi) + parseFloat(req.body.trbrec) + parseFloat(req.body.trbesc))

                         tothrs = parseFloat(trbges)

                         //console.log('tothrs=>'+tothrs)

                         if (projeto.trbmod != null && projeto.trbmod != '' ) {
                              hrsprj = parseFloat(hrsprj) + parseFloat(projeto.trbmod)
                              tothrs = parseFloat(tothrs) + parseFloat(projeto.trbmod)
                              //console.log('tothrs=>' + tothrs)
                         }else{
                              hrsprj = parseFloat(hrsprj) + parseFloat(0)
                              tothrs = parseFloat(tothrs) + parseFloat(0)
                         }
                         if (projeto.trbest != null && projeto.trbest != '') {
                              hrsprj = parseFloat(hrsprj) + parseFloat(projeto.trbest)
                              tothrs = parseFloat(tothrs) + parseFloat(projeto.trbest)
                              //console.log('tothrs=>' + tothrs)
                         }else{
                              hrsprj = parseFloat(hrsprj) + parseFloat(0)
                              tothrs = parseFloat(tothrs) + parseFloat(0)                              
                         }
                         if (projeto.trbinv != null && projeto.trbinv != '') {
                              tothrs = parseFloat(tothrs) + parseFloat(projeto.trbinv)
                              //console.log('tothrs=>' + tothrs)
                         }else{
                              tothrs = parseFloat(tothrs) + parseFloat(0)
                         }
                         if (projeto.trbatr != null && projeto.trbatr != '') {
                              tothrs = parseFloat(tothrs) + parseFloat(projeto.trbatr)
                              //console.log('tothrs=>' + tothrs)
                         }else{
                              tothrs = parseFloat(tothrs) + parseFloat(0)
                         }                                                         
                         if (projeto.trbpro != null && projeto.trbpro != '') {
                              hrsprj = parseFloat(hrsprj) + parseFloat(projeto.trbpro)
                              tothrs = parseFloat(tothrs) + parseFloat(projeto.trbpro)
                              //console.log('tothrs=>' + tothrs)
                         }else{
                              hrsprj = parseFloat(hrsprj) + parseFloat(0)
                              tothrs = parseFloat(tothrs) + parseFloat(0)
                         }

                         //console.log('tothrs=>'+tothrs)
                         //console.log('hrsprj=>'+hrsprj)
                         
                         projeto.tothrs = Math.round(tothrs)
                         projeto.hrsprj = Math.round(hrsprj)

                         projeto.vlrhrg = req.body.vlrhrg
                         projeto.trbvis = req.body.trbvis
                         projeto.trbcom = req.body.trbcom
                         projeto.trbcro = req.body.trbcro
                         projeto.trbaqi = req.body.trbaqi
                         projeto.trbrec = req.body.trbrec
                         projeto.trbesc = req.body.trbesc
                         //console.log('req.body.selecionado=>'+req.body.selecionado)
                         projeto.tipoCustoGes = req.body.selecionado
                         projeto.totesc = totesc
                         projeto.totvis = totvis
                         projeto.totcom = totcom
                         projeto.totcro = totcro
                         projeto.totaqi = totaqi
                         projeto.totrec = totrec
                         projeto.trbges = trbges
                         projeto.totges = totges
                         projeto.desGes = desGes
                         projeto.vlrDge = totdes

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
               req.flash('error_msg', 'Falha ao encontrar a configuracão.')
               res.redirect('/customdo/gestao/' + req.body.id)
          })
     }).catch((err) => {
          req.flash('error_msg', 'Falha ao encontrar o projeto')
          res.redirect('/customdo/gestao/' + req.body.id)
     })
})

router.post('/salvarMemorial/', ehAdmin, (req, res) => {
     var upload = multer({ storage }).single('memo')
     upload(req, res, function (err) {
          if (err) {
               return res.end("Error uploading file.");
          } else {
               //console.log('req.body.id=>' + req.body.id)
               Projeto.findOne({ _id: req.body.id }).then((projeto) => {
                    var memorial
                    //console.log('req.file=>' + req.file)
                    if (req.file != null) {
                         memorial = req.file.filename
                    } else {
                         memorial = ''
                    }
                    //console.log('memorial=>' + memorial)
                    projeto.memorial = memorial
                    projeto.save().then(() => {
                         if (projeto.ehVinculo == false) {
                              if (projeto.ehDireto) {
                                   res.redirect('/projeto/direto/' + req.body.id)
                              } else {
                                   res.redirect('/customdo/projetista/' + req.body.id)
                              }
                         } else {
                              res.redirect('/gerenciamento/documentos/' + req.body.id)
                         }
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao salvar o projeto.')
                         res.redirect('/customdo/projetista/' + req.body.id)
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao encontrar o projeto.')
                    res.redirect('/customdo/projetista/' + req.body.id)
               })
          }
     })

})

router.post('/salvarDistribuicao/', ehAdmin, (req, res) => {
     var upload = multer({ storage }).single('dist')
     upload(req, res, function (err) {
          if (err) {
               return res.end("Error uploading file.");
          } else {
               //console.log('req.body.id=>' + req.body.id)
               Projeto.findOne({ _id: req.body.id }).then((projeto) => {
                    var distribuicao
                    if (req.file != null) {
                         distribuicao = req.file.filename
                    } else {
                         distribuicao = ''
                    }
                    projeto.distribuicao = distribuicao
                    projeto.save().then(() => {
                         if (projeto.ehVinculo == false) {
                              if (projeto.ehDireto) {
                                   res.redirect('/projeto/direto/' + req.body.id)
                              } else {
                                   res.redirect('/customdo/projetista/' + req.body.id)
                              }
                         } else {
                              res.redirect('/gerenciamento/documentos/' + req.body.id)
                         }
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao salvar o projeto.')
                         res.redirect('/customdo/projetista/' + req.body.id)
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao encontrar o projeto.')
                    res.redirect('/customdo/projetista/' + req.body.id)
               })
          }
     })

})

router.post('/salvarArt/', ehAdmin, (req, res) => {
     var upload = multer({ storage }).single('art')
     upload(req, res, function (err) {
          if (err) {
               return res.end("Error uploading file.");
          } else {
               //console.log('req.body.id=>' + req.body.id)
               Projeto.findOne({ _id: req.body.id }).then((projeto) => {
                    var art
                    if (req.file != null) {
                         art = req.file.filename
                    } else {
                         art = ''
                    }
                    projeto.art = art
                    projeto.save().then(() => {
                         if (projeto.ehVinculo == false) {
                              if (projeto.ehDireto) {
                                   res.redirect('/projeto/direto/' + req.body.id)
                              } else {
                                   res.redirect('/customdo/projetista/' + req.body.id)
                              }
                         } else {
                              res.redirect('/gerenciamento/documentos/' + req.body.id)
                         }
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao salvar o projeto.')
                         res.redirect('/customdo/projetista/' + req.body.id)
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao encontrar o projeto.')
                    res.redirect('/customdo/projetista/' + req.body.id)
               })
          }
     })
})

router.post('/salvarUnifilar/', ehAdmin, (req, res) => {
     var upload = multer({ storage }).single('unif')
     upload(req, res, function (err) {
          if (err) {
               return res.end("Error uploading file.");
          } else {
               Projeto.findOne({ _id: req.body.id }).then((projeto) => {
                    var unifilar
                    if (req.file != null) {
                         unifilar = req.file.filename
                    } else {
                         unifilar = ''
                    }
                    projeto.unifilar = unifilar
                    projeto.save().then(() => {
                         if (projeto.ehVinculo == false) {
                              if (projeto.ehDireto) {
                                   res.redirect('/projeto/direto/' + req.body.id)
                              } else {
                                   res.redirect('/customdo/projetista/' + req.body.id)
                              }
                         } else {
                              res.redirect('/gerenciamento/documentos/' + req.body.id)
                         }
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao salvar o projeto.')
                         res.redirect('/customdo/projetista/' + req.body.id)
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao encontrar o projeto.')
                    res.redirect('/customdo/projetista/' + req.body.id)
               })
          }
     })

})

router.post('/salvarAterramento/', ehAdmin, (req, res) => {
     var upload = multer({ storage }).single('ater')
     upload(req, res, function (err) {
          if (err) {
               return res.end("Error uploading file.");
          } else {
               //console.log('req.body.id=>' + req.body.id)
               Projeto.findOne({ _id: req.body.id }).then((projeto) => {
                    var aterramento
                    if (req.file != null) {
                         aterramento = req.file.filename
                    } else {
                         aterramento = ''
                    }
                    projeto.aterramento = aterramento
                    projeto.save().then(() => {
                         if (projeto.ehVinculo == false) {
                              if (projeto.ehDireto) {
                                   res.redirect('/projeto/direto/' + req.body.id)
                              } else {
                                   res.redirect('/customdo/projetista/' + req.body.id)
                              }
                         } else {
                              res.redirect('/gerenciamento/documentos/' + req.body.id)
                         }
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao salvar o projeto.')
                         res.redirect('/customdo/projetista/' + req.body.id)
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao encontrar o projeto.')
                    res.redirect('/customdo/projetista/' + req.body.id)
               })
          }
     })

})

router.post('/salvarSituacao/', ehAdmin, (req, res) => {
     var upload = multer({ storage }).single('situ')
     upload(req, res, function (err) {
          if (err) {
               return res.end("Error uploading file.");
          } else {
               //console.log('req.body.id=>' + req.body.id)
               Projeto.findOne({ _id: req.body.id }).then((projeto) => {
                    var situacao
                    if (req.file != null) {
                         situacao = req.file.filename
                    } else {
                         situacao = ''
                    }
                    projeto.situacao = situacao
                    projeto.save().then(() => {
                         if (projeto.ehVinculo == false) {
                              if (projeto.ehDireto) {
                                   res.redirect('/projeto/direto/' + req.body.id)
                              } else {
                                   res.redirect('/customdo/projetista/' + req.body.id)
                              }
                         } else {
                              res.redirect('/gerenciamento/documentos/' + req.body.id)
                         }
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao salvar o projeto.')
                         res.redirect('/customdo/projetista/' + req.body.id)
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao encontrar o projeto.')
                    res.redirect('/customdo/projetista/' + req.body.id)
               })
          }
     })

})

router.get('/mostrarMemorial/:id', ehAdmin, (req, res) => {
     Projeto.findOne({ _id: req.params.id }).then((projeto) => {
          var doc = projeto.memorial
          var path = __dirname
          //console.log(path)
          path = path.replace('routes', '')
          res.sendFile(path + '/public/arquivos/' + doc)
     })
})

router.get('/mostrarDistribuicao/:id', ehAdmin, (req, res) => {
     Projeto.findOne({ _id: req.params.id }).then((projeto) => {
          var doc = projeto.distribuicao
          var path = __dirname
          path = path.replace('routes', '')
          res.sendFile(path + '/public/arquivos/' + doc)
     })
})

router.get('/mostrarArt/:id', ehAdmin, (req, res) => {
     Projeto.findOne({ _id: req.params.id }).then((projeto) => {
          var doc = projeto.art
          var path = __dirname
          //console.log(path)
          path = path.replace('routes', '')
          res.sendFile(path + '/public/arquivos/' + doc)
     })
})

router.get('/mostrarUnifilar/:id', ehAdmin, (req, res) => {
     Projeto.findOne({ _id: req.params.id }).then((projeto) => {
          var doc = projeto.unifilar
          var path = __dirname
          path = path.replace('routes', '')
          res.sendFile(path + '/public/arquivos/' + doc)
     })
})

router.get('/mostrarAterramento/:id', ehAdmin, (req, res) => {
     Projeto.findOne({ _id: req.params.id }).then((projeto) => {
          var doc = projeto.aterramento
          var path = __dirname
          //console.log(path)
          path = path.replace('routes', '')
          res.sendFile(path + '/public/arquivos/' + doc)
     })
})

router.get('/mostrarSituacao/:id', ehAdmin, (req, res) => {
     Projeto.findOne({ _id: req.params.id }).then((projeto) => {
          var doc = projeto.situacao
          var path = __dirname
          path = path.replace('routes', '')
          res.sendFile(path + '/public/arquivos/' + doc)
     })
})


module.exports = router
