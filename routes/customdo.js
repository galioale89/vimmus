//const { reduce } = require("async")
const express = require("express")
const router = express.Router()
const mongoose = require('mongoose')


require('../model/Projeto')
require('../model/Configuracao')
require('../model/Regime')
require('../model/Pessoa')
require('../model/Objetos')

const Projeto = mongoose.model('projeto')
const Configuracao = mongoose.model('configuracao')
const Regime = mongoose.model('regime')
const Pessoa = mongoose.model('pessoa')

const { ehAdmin } = require('../helpers/ehAdmin')


global.projeto_id
var rp
var p

require('../app')

router.get('/projetista/:id', ehAdmin, (req, res) => {
     var pp
     Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
          Pessoa.findOne({ _id: projeto.funpro }).lean().then((projeto_pro) => {
               pp = projeto_pro
          }).catch((err) => {
               req.flash('error_msg', 'Houve um erro ao encontrar o instalador.')
               res.redirect('/consulta')
          })
          Pessoa.find({ funpro: 'checked' }).lean().then((projetista) => {
               //projeto_id = projeto._id
               res.render('projeto/customdo/projetista', { projeto: projeto, projetista: projetista, pp: pp })
          }).catch((err) => {
               req.flash('error_msg', 'Nenhum regime encontrado')
               res.redirect('/pessoa/consulta')
          })
     }).catch((err) => {
          req.flash('error_msg', 'Nenhum projeto encontrado')
          res.redirect('/')
     })

})

router.get('/gestao/:id', ehAdmin, (req, res) => {

     Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
          Pessoa.findOne({ _id: projeto.funres }).lean().then((projeto_res) => {
               pr = projeto_res
          }).catch((err) => {
               req.flash('error_msg', 'Houve um erro ao encontrar o instalador.')
               res.redirect('/consulta')
          })
          Pessoa.findOne({ _id: projeto.funres }).lean().then((responsavel) => {
               projeto_id = projeto._id
               res.render('projeto/customdo/gestao', { projeto: projeto, responsavel: responsavel, pr: pr })
          }).catch((err) => {
               req.flash('error_msg', 'Nenhum responsável encontrado')
               res.redirect('/')
          })
     }).catch((err) => {
          req.flash('error_msg', 'Nenhum projeto encontrado')
          res.redirect('/')
     })
})

router.get('/instalacao/:id', ehAdmin, (req, res) => {
     var pi
     Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
          Pessoa.findOne({ _id: projeto.funins }).lean().then((projeto_ins) => {
               pi = projeto_ins
          }).catch((err) => {
               req.flash('error_msg', 'Houve um erro ao encontrar o instalador.')
               res.redirect('/consulta')
          })
          Pessoa.find({ funins: 'checked' }).lean().then((instalador) => {
               projeto_id = projeto._id
               res.render('projeto/customdo/instalacao', { projeto: projeto, instalador: instalador, pi: pi })
          }).catch((err) => {
               req.flash('error_msg', 'Nenhum regime encontrado')
               res.redirect('/pessoa/consulta')
          })
     }).catch((err) => {
          req.flash('error_msg', 'Nenhum projeto encontrado')
          res.redirect('/')
     })
})

router.get('/editar/gestao/:id', ehAdmin, (req, res) => {

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


          Pessoa.find({ funres: 'checked' }).lean().then((responsavel) => {
               Regime.find().lean().then((regime) => {
                    res.render('projeto/customdo/editgestao', { projeto: projeto, regime: regime, rp: rp, responsavel: responsavel, pr: pr })
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
     var pi
     Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
          projeto_id = projeto._id
          Pessoa.findOne({ _id: projeto.funins }).lean().then((pessoa_ins) => {
               pi = pessoa_ins
          }).catch((err) => {
               req.flash('error_msg', 'Houve uma falha ao encontrar o instalador')
               res.redirect('/pessoa/consulta')
          })
          Pessoa.find({ funins: 'checked' }).lean().then((instalador) => {
               res.render('projeto/customdo/editinstalacao', { projeto: projeto, instalador: instalador, pi: pi })
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

     Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {

          projeto_id = projeto._id

          Pessoa.findOne({ _id: projeto.funpro }).lean().then((pessoa_pro) => {
               pp = pessoa_pro
          }).catch((err) => {
               req.flash('error_msg', 'Houve uma falha ao encontrar o projetista')
               res.redirect('/pessoa/consulta')
          })

          Pessoa.find({ funpro: 'checked' }).lean().then((projetista) => {
               res.render('projeto/customdo/editprojetista', { projeto: projeto, projetista: projetista, pp: pp })
          }).catch((err) => {
               req.flash('error_msg', 'Houve uma falha ao encontrar um projetista')
               res.redirect('/pessoa/consulta')
          })
     }).catch((err) => {
          req.flash('error_msg', 'Houve uma falha ao encontrar o projeto')
          res.redirect('/projeto/consulta')
     })
})

router.post('/projetista/', ehAdmin, (req, res) => {

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
     if (!req.body.trbmem || req.body.trbmem == null || typeof req.body.trbmem == undefined) {
          erros.push({ texto: 'Preencer o tempo de elaboração do Memorial descritivo' })
     }
     if (!req.body.vlrhrp || req.body.vlrhrp == null) {
          erros.push({ texto: 'Preencer o valor R$/hora dos projetistas' })
     }

     if (erros.length > 0) {
          Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {
               Pessoa.find({ funpro: 'checked' }).lean().then((projetista) => {
                    res.render('projeto/customdo/projetista', { erros: erros, projeto: projeto, projetista: projetista })
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
               var totsit = trbsit * req.body.vlrhrp
               var totuni = trbuni * req.body.vlrhrp
               var totdis = trbdis * req.body.vlrhrp
               var totate = trbate * req.body.vlrhrp
               var totart = trbart * req.body.vlrhrp
               var totmem = trbmem * req.body.vlrhrp

               var totpro = parseFloat(totsit) + parseFloat(totuni) + parseFloat(totdis) + parseFloat(totate) + parseFloat(totart) + parseFloat(totmem)

               var trbpro = parseFloat(trbsit) + parseFloat(trbuni) + parseFloat(trbdis) + parseFloat(trbate) + parseFloat(trbart) + parseFloat(trbmem)

               var sucesso = []

               projeto_id = projeto._id

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
                              req.flash('error_msg', 'Hove uma falha interna')
                              res.redirect('/pessoa/consulta')
                         })
                         Regime.find({ funpro: 'checked' }).lean().then((regime) => {
                              projeto_id = projeto._id
                              res.render('projeto/customdo/projetista', { sucesso: sucesso, projeto: projeto, regime: regime, pp: pp })
                         }).catch((err) => {
                              req.flash('error_msg', 'Hove uma falha interna')
                              res.redirect('/configuracao/consultaregime')
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

router.post('/instalacao/', ehAdmin, (req, res) => {

     var erros = []

     if (!req.body.uniest || req.body.uniest == "" || typeof req.body.uniest == undefined) {
          erros.push({ texto: 'Preencer o valor de unidades dos equipamentos' })
     }
     if (!req.body.unimod || req.body.unimod == null || typeof req.body.unimod == undefined) {
          erros.push({ texto: 'Preencer o valor de unidades dos modulos' })
     }
     if (!req.body.uniinv || req.body.uniinv == null || typeof req.body.uniinv == undefined) {
          erros.push({ texto: 'Preencer o valor de unidades dos inversores' })
     }

     if (!req.body.vlrhri || req.body.vlrhri == null) {
          erros.push({ texto: 'Preencer o valor R$/hora dos instaladores' })
     }

     if (erros.length > 0) {
          Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {
               Pessoa.find({ funins: 'checked' }).lean(); then((instalador) => {
                    projeto_id = projeto._id
                    res.render('projeto/customdo/instalacao', { erros: erros, projeto: projeto, instalador: instalador })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro interno.')
                    res.redirect('/projeto/consulta')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Houve um erro interno.')
               res.redirect('/projeto/onsulta')
          })
     } else {

          Projeto.findOne({ _id: req.body.id }).then((projeto) => {

               Configuracao.findOne({ _id: projeto.configuracao }).then((config) => {

                    var trbest = req.body.uniest * (config.minest / 60)
                    var trbmod = req.body.unimod * (config.minmod / 60)
                    var trbinv = req.body.uniinv * (config.mininv / 60)

                    var totest = trbest * req.body.vlrhri
                    var totmod = trbmod * req.body.vlrhri
                    var totinv = trbinv * req.body.vlrhri

                    var totint = parseFloat(totest) + parseFloat(totmod) + parseFloat(totinv)

                    var trbint = parseFloat(trbest) + parseFloat(trbmod) + parseFloat(trbinv)

                    var sucesso = []

                    projeto_id = projeto._id

                    projeto.vlrhri = req.body.vlrhri
                    projeto.uniest = req.body.uniest
                    projeto.trbest = trbest
                    projeto.unimod = req.body.unimod
                    projeto.trbmod = trbmod
                    projeto.uniinv = req.body.uniinv
                    projeto.trbinv = trbinv
                    projeto.totest = totest
                    projeto.totmod = totmod
                    projeto.totinv = totinv
                    projeto.totint = totint
                    projeto.trbint = trbint
                    if (req.body.pinome == null) {
                         projeto.funins = req.body.funins
                    }

                    projeto.save().then(() => {
                         sucesso.push({ texto: 'Custo de instalação aplicado com sucesso' })
                         Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {
                              Pessoa.findOne({ _id: projeto.funins }).lean().then((pessoa_funins) => {
                                   pi = pessoa_funins
                              }).catch((err) => {
                                   req.flash('error_msg', 'Hove uma falha interna')
                                   res.redirect('/pessoa/consulta')
                              })
                              Regime.find({ funins: 'checked' }).lean().then((regime) => {
                                   projeto_id = projeto._id
                                   res.render('projeto/customdo/instalacao', { sucesso: sucesso, projeto: projeto, regime: regime, pi: pi })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Hove uma falha interna')
                                   res.redirect('/projeto/consulta')
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

router.post('/gestao/', ehAdmin, (req, res) => {

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
               projeto_id = projeto._id
               res.render('projeto/customdo/gestao', { erros: erros, projeto: projeto })
          }).catch((err) => {
               req.flash('error_msg', 'Houve um erro interno.')
               res.redirect('/projeto/novo')
          })
     } else {

          Projeto.findOne({ _id: req.body.id }).then((projeto) => {

               var totesc = req.body.trbesc * req.body.vlrhrg
               var totvis = req.body.trbvis * req.body.vlrhrg
               var totcom = req.body.trbcom * req.body.vlrhrg
               var totcro = req.body.trbcro * req.body.vlrhrg
               var totaqi = req.body.trbaqi * req.body.vlrhrg
               var totrec = req.body.trbrec * req.body.vlrhrg

               var totges = parseFloat(totvis) + parseFloat(totcom) + parseFloat(totcro) + parseFloat(totaqi) + parseFloat(totrec) + parseFloat(totesc)

               var trbges = parseFloat(req.body.trbvis) + parseFloat(req.body.trbcom) + parseFloat(req.body.trbcro) + parseFloat(req.body.trbaqi) + parseFloat(req.body.trbrec) + parseFloat(req.body.trbesc)

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
                              responsavel = pessoa_funres
                         }).catch((err) => {
                              req.flash('error_msg', 'Hove uma falha interna')
                              res.redirect('/pessoa/consulta')
                         })
                         Regime.find({ funins: 'checked' }).lean().then((regime) => {
                              projeto_id = projeto._id
                              res.render('projeto/customdo/gestao', { sucesso: sucesso, projeto: projeto, regime: regime, responsavel: responsavel })
                         }).catch((err) => {
                              req.flash('error_msg', 'Hove uma falha interna')
                              res.redirect('/projeto/consulta')
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

router.post('/editar/projetista/', ehAdmin, (req, res) => {

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

               Pessoa.find({ funpro: 'checked' }).lean().then((projetista) => {
                    res.render('projeto/customdo/editprojetista', { erros: erros, projeto: projeto, projetista: projetista, p: p })
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
               var totsit = trbsit * req.body.vlrhrp
               var totuni = trbuni * req.body.vlrhrp
               var totdis = trbdis * req.body.vlrhrp
               var totate = trbate * req.body.vlrhrp
               var totart = trbart * req.body.vlrhrp
               var totmem = trbmem * req.body.vlrhrp

               var totpro = parseFloat(totsit) + parseFloat(totuni) + parseFloat(totdis) + parseFloat(totate) + parseFloat(totart) + parseFloat(totmem)

               var trbpro = parseFloat(trbsit) + parseFloat(trbuni) + parseFloat(trbdis) + parseFloat(trbate) + parseFloat(trbart) + parseFloat(trbmem)

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
                         Pessoa.find({ funpro: 'checked' }).lean().then((projetista) => {

                              Regime.find().lean().then((regime) => {
                                   projeto_id = projeto._id
                                   res.render('projeto/customdo/editprojetista', { sucesso: sucesso, projeto: projeto, projetista: projetista, regime: regime, pp: pp })
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

router.post('/editar/instalacao/', ehAdmin, (req, res) => {

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

               Pessoa.find({ funins: 'checked' }).lean().then((instalador) => {
                    projeto_id = projeto._id
                    res.render('projeto/customdo/editinstalacao', { erros: erros, projeto: projeto, instalador: instalador, pi: pi })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro interno.')
                    res.redirect('/projeto/consulta')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Houve um erro interno.')
               res.redirect('/projeto/onsulta')
          })
     } else {

          Projeto.findOne({ _id: req.body.id }).then((projeto) => {

               Configuracao.findOne({ _id: projeto.configuracao }).then((config) => {
                    7

                    var tothrs

                    projeto_id = projeto._id

                    //Edição dos Custos de Instalação
                    var trbest = parseFloat(req.body.uniest) * (parseFloat(config.minest) / 60)
                    var trbmod = parseFloat(req.body.unimod) * (parseFloat(config.minmod) / 60)
                    var trbinv = parseFloat(req.body.uniinv) * (parseFloat(config.mininv) / 60)

                    var totest = parseFloat(trbest) * parseFloat(req.body.vlrhri)
                    var totmod = parseFloat(trbmod) * parseFloat(req.body.vlrhri)
                    var totinv = parseFloat(trbinv) * parseFloat(req.body.vlrhri)
                    var totint = parseFloat(totest) + parseFloat(totmod) + parseFloat(totinv)

                    var trbint = parseFloat(trbest) + parseFloat(trbmod) + parseFloat(trbinv)

                    tothrs = parseFloat(trbint)
                    if (projeto.trbpro != null) {
                         tothrs = tothrs + parseFloat(projeto.trbpro)
                    }
                    if (projeto.trbges != null) {
                         tothrs = tothrs + parseFloat(projeto.trbges)
                    }

                    projeto.vlrhri = req.body.vlrhri
                    projeto.uniest = req.body.uniest
                    projeto.trbest = trbest
                    projeto.unimod = req.body.unimod
                    projeto.trbmod = trbmod
                    projeto.uniinv = req.body.uniinv
                    projeto.trbinv = trbinv

                    projeto.totest = totest
                    projeto.totmod = totmod
                    projeto.totinv = totinv
                    projeto.totint = totint

                    projeto.trbint = trbint
                    projeto.tothrs = tothrs

                    if (req.body.checkIns != null) {
                         projeto.funins = req.body.funins
                    }

                    projeto.save().then(() => {
                         sucesso.push({ texto: 'Custo de instalação aplicado com sucesso. Aplicar o gerenciamento e os tributos' })
                         var pi
                         Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {
                              projeto_id = projeto._id

                              Pessoa.findOne({ _id: projeto.funins }).lean().then((pessoa_ins) => {
                                   pi = pessoa_ins
                              }).catch((err) => {
                                   req.flash('error_msg', 'Hove uma falha interna')
                                   res.redirect('/pessoa/consulta')
                              })

                              Pessoa.find({ funins: 'checked' }).lean().then((instalador) => {
                                   Regime.find().lean().then((regime) => {
                                        res.render('projeto/customdo/editinstalacao', { sucesso: sucesso, projeto: projeto, regime: regime, instalador: instalador, pi: pi })
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
                    req.flash('error_msg', 'Falha ao encontrar a configuração')
                    res.redirect('/configuracao/consulta')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Falha ao encontrar o projeto')
               res.redirect('/projeto/consulta')
          })
     }

})

router.post('/editar/gestao/', ehAdmin, (req, res) => {

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

               Regime.findOne().lean().then((regime) => {

                    req.flash('error_msg', 'Houve um erro interno.')
                    res.render('projeto/customdo/editgestao', { erros: erros, projeto: projeto, regime: regime })

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
               var totesc = req.body.trbesc * req.body.vlrhrg
               var totvis = req.body.trbvis * req.body.vlrhrg
               var totcom = req.body.trbcom * req.body.vlrhrg
               var totcro = req.body.trbcro * req.body.vlrhrg
               var totaqi = req.body.trbaqi * req.body.vlrhrg
               var totrec = req.body.trbrec * req.body.vlrhrg

               var totges = parseFloat(totvis) + parseFloat(totcom) + parseFloat(totcro) + parseFloat(totaqi) + parseFloat(totrec) + parseFloat(totesc)

               var trbges = parseFloat(req.body.trbvis) + parseFloat(req.body.trbcom) + parseFloat(req.body.trbcro) + parseFloat(req.body.trbaqi) + parseFloat(req.body.trbrec) + parseFloat(req.body.trbesc)

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
                         }).catch((err) => {
                              req.flash('error_msg', 'Hove uma falha interna')
                              res.redirect('/pessoa/consulta')
                         })

                         Regime.find().lean().then((regime) => {

                              Pessoa.find({ funges: 'checked' }).lean().then((responsavel) => {
                                   res.render('projeto/customdo/editgestao', { sucesso: sucesso, projeto: projeto, regime: regime, pr: pr, responsavel: responsavel })
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
