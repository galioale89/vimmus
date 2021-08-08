const express = require('express')
const router = express.Router()

require('../model/Empresa')
require('../model/Pessoa')
require('../model/Realizado')
require('../model/CustoDetalhado')
require('../model/Cliente')
require('../model/Equipe')
require('../model/Cronograma')
require('../model/Dimensionamento')

const mongoose = require('mongoose')
const Projeto = mongoose.model('projeto')
const Configuracao = mongoose.model('configuracao')
const Empresa = mongoose.model('empresa')
const Pessoa = mongoose.model('pessoa')
const Realizado = mongoose.model('realizado')
const Detalhado = mongoose.model('custoDetalhado')
const Cliente = mongoose.model('cliente')
const Equipe = mongoose.model('equipe')
const Cronograma = mongoose.model('cronograma')
const Dimensionamento = mongoose.model('dimensionamento')

const validaCampos = require('../resources/validaCampos')
const comparaDatas = require('../resources/comparaDatas')
const validaCronograma = require('../resources/validaCronograma')
const liberaRecursos = require('../resources/liberaRecursos')
const setData = require('../resources/setData')
const { ehAdmin } = require('../helpers/ehAdmin')

var tipoEntrada = false
//global.projeto_id


//Configurando envio de SMS
/*
const Nexmo = require('nexmo')

const nexmo = new Nexmo({
     apiKey: "db9a4e8d",
     apiSecret: "JAONfDZDLw5t3Uqh"
})
*/
//const TextMessageService = require('comtele-sdk').TextMessageService
//const apiKey = "8dbd4fb5-79af-45d6-a0b7-583a3c2c7d30"


router.use(express.static('/public'))

router.get("/consulta", ehAdmin, (req, res) => {
     const { _id } = req.user
     Projeto.find({ user: _id }).sort({ dataord: 'asc' }).lean().then((projetos) => {
          Pessoa.find({ funges: 'checked', user: _id }).lean().then((responsavel) => {
               res.render('projeto/findprojetos', { projetos: projetos, responsavel: responsavel, filDireto: 'Todos', filReal: 'Todos' })
          }).catch((err) => {
               req.flash('error_msg', 'Nenhum responsável encontrado')
               res.redirect('/projeto/consulta')
          })

     }).catch((err) => {
          req.flash('error_msg', 'Nenhum projeto encontrado')
          res.redirect('/projeto/consulta')
     })
})

router.get('/dimensionamento/:id', ehAdmin, (req, res) => {
     var th2 = 'white'
     var td2 = 'none'
     var th3 = 'white'
     var td3 = 'none'
     console.log('req.body.id_dime=>' + req.params.id)
     Dimensionamento.findOne({ _id: req.params.id }).lean().then((dimensionamento) => {
          res.render('projeto/dimensionamento', { dimensionamento, th2, td2, th3, td3 })
     }).catch((err) => {
          req.flash('error_msg', 'Huve um erro ao encontrar o dimensionamento.')
          res.redirect('/projeto/novo')
     })
})

router.get('/dimensionamento/', ehAdmin, (req, res) => {
     var td2 = 'none'
     var td3 = 'none'
     res.render('projeto/dimensionamento', { td2, td3 })
})

router.post('/dimensionar', ehAdmin, (req, res) => {
     const { _id } = req.user
     Dimensionamento.findOneAndRemove({ _id: req.body.id_dime }).then(() => {
     }).catch((err) => {
          var dime1
          var dime2
          dime2 = {
               user: _id,
               te: req.body.te,
               tusd: req.body.te,
               icms: req.body.icms,
               pis: req.body.pis,
               cofins: req.body.cofins,
               cosip: req.body.ilupub,
               inflacao: req.body.inflacao,
               tma: req.body.tma,
               ajuste: req.body.ajuste,
               uc11: req.body.uc11,
               uc12: req.body.uc12,
               uc13: req.body.uc13,
               uc14: req.body.uc14,
               uc15: req.body.uc15,
               uc16: req.body.uc16,
               uc17: req.body.uc17,
               uc18: req.body.uc18,
               uc19: req.body.uc19,
               uc110: req.body.uc110,
               uc111: req.body.uc111,
               uc112: req.body.uc112,
               uc21: req.body.uc21,
               uc22: req.body.uc22,
               uc23: req.body.uc23,
               uc24: req.body.uc24,
               uc25: req.body.uc25,
               uc26: req.body.uc26,
               uc27: req.body.uc27,
               uc28: req.body.uc28,
               uc29: req.body.uc29,
               uc210: req.body.uc210,
               uc211: req.body.uc211,
               uc212: req.body.uc212,
               uc31: req.body.uc31,
               uc32: req.body.uc32,
               uc33: req.body.uc33,
               uc34: req.body.uc34,
               uc35: req.body.uc35,
               uc36: req.body.uc36,
               uc37: req.body.uc37,
               uc38: req.body.uc38,
               uc39: req.body.uc39,
               uc310: req.body.uc310,
               uc311: req.body.uc311,
               uc312: req.body.uc312,
               add1: req.body.add1,
               add2: req.body.add2,
               add3: req.body.add3,
               add4: req.body.add4,
               add5: req.body.add5,
               add6: req.body.add6,
               add7: req.body.add7,
               add8: req.body.add8,
               add9: req.body.add9,
               add10: req.body.add10,
               add11: req.body.add11,
               add12: req.body.add12,
               potencia: 1
          }          
          if (req.body.qtduce == 1) {
               dime1 = {
                    consumo1: req.body.uc11,
                    consumo2: req.body.uc12,
                    consumo3: req.body.uc13,
                    consumo4: req.body.uc14,
                    consumo5: req.body.uc15,
                    consumo6: req.body.uc16,
                    consumo7: req.body.uc17,
                    consumo8: req.body.uc18,
                    consumo9: req.body.uc19,
                    consumo10: req.body.uc110,
                    consumo11: req.body.uc111,
                    consumo12: req.body.uc112,
               }
          } else {
               if (req.body.qtduce == 2) {
                    dime1 = {
                         consumo1: parseFloat(req.body.uc11) + parseFloat(req.body.uc21),
                         consumo2: parseFloat(req.body.uc12) + parseFloat(req.body.uc22),
                         consumo3: parseFloat(req.body.uc13) + parseFloat(req.body.uc23),
                         consumo4: parseFloat(req.body.uc14) + parseFloat(req.body.uc24),
                         consumo5: parseFloat(req.body.uc15) + parseFloat(req.body.uc25),
                         consumo6: parseFloat(req.body.uc16) + parseFloat(req.body.uc26),
                         consumo7: parseFloat(req.body.uc17) + parseFloat(req.body.uc27),
                         consumo8: parseFloat(req.body.uc18) + parseFloat(req.body.uc28),
                         consumo9: parseFloat(req.body.uc19) + parseFloat(req.body.uc29),
                         consumo10: parseFloat(req.body.uc110) + parseFloat(req.body.uc210),
                         consumo11: parseFloat(req.body.uc111) + parseFloat(req.body.uc211),
                         consumo12: parseFloat(req.body.uc112) + parseFloat(req.body.uc2112)
                    }
               } else {
                    dime1 = {
                         consumo1: parseFloat(req.body.uc11) + parseFloat(req.body.uc21) + parseFloat(req.body.uc31),
                         consumo2: parseFloat(req.body.uc12) + parseFloat(req.body.uc22) + parseFloat(req.body.uc32),
                         consumo3: parseFloat(req.body.uc13) + parseFloat(req.body.uc23) + parseFloat(req.body.uc33),
                         consumo4: parseFloat(req.body.uc14) + parseFloat(req.body.uc24) + parseFloat(req.body.uc34),
                         consumo5: parseFloat(req.body.uc15) + parseFloat(req.body.uc25) + parseFloat(req.body.uc35),
                         consumo6: parseFloat(req.body.uc16) + parseFloat(req.body.uc26) + parseFloat(req.body.uc36),
                         consumo7: parseFloat(req.body.uc17) + parseFloat(req.body.uc27) + parseFloat(req.body.uc37),
                         consumo8: parseFloat(req.body.uc18) + parseFloat(req.body.uc28) + parseFloat(req.body.uc38),
                         consumo9: parseFloat(req.body.uc19) + parseFloat(req.body.uc29) + parseFloat(req.body.uc39),
                         consumo10: parseFloat(req.body.uc110) + parseFloat(req.body.uc210) + parseFloat(req.body.uc310),
                         consumo11: parseFloat(req.body.uc111) + parseFloat(req.body.uc211) + parseFloat(req.body.uc311),
                         consumo12: parseFloat(req.body.uc112) + parseFloat(req.body.uc212 + parseFloat(req.body.uc312))
                    }
               }
          }
          var dime = Object.assign(dime2, dime1)
          console.log('dime=>' + dime)
                    
          new Dimensionamento(dime).save().then(() => {
               Dimensionamento.findOne().sort({ field: 'asc', _id: -1 }).lean().then((dimensionamento) => {
                    var sucesso = []
                    Projeto.findOne({ dimensionamento: dimensionamento._id }).lean().then((existe_projeto) => {
                         console.log('existe_projeto=>' + existe_projeto)
                         if (existe_projeto != null) {
                              existe_projeto.dimensionamento = dimensionamento._id
                              existe_projeto.save().then(() => {
                                   Empresa.find({ user: _id }).lean().then((empresa) => {
                                        Configuracao.find({ user: _id }).lean().then((configuracao) => {
                                             Pessoa.find({ ehVendedor: true, user: _id }).lean().then((vendedor) => {
                                                  Pessoa.find({ user: _id, funges: 'checked' }).lean().then((responsavel) => {
                                                       Cliente.find({ user: _id, sissolar: 'checked' }).lean().then((clientes) => {
                                                            sucesso.push({ texto: 'Dimensionamento realizado com sucesso!' })
                                                            res.render('projeto/addprojeto', { projeto: existe_projeto, dimensionamento, sucesso, empresa, configuracao, vendedor, responsavel, clientes, troca_dim: 'checked' })
                                                       }).catch((err) => {
                                                            req.flash('error_msg', 'Houve um erro ao encontrar um cliente.')
                                                            res.redirect('/cliente/consulta')
                                                       })
                                                  }).catch((err) => {
                                                       req.flash('error_msg', 'Houve um erro ao encontrar um responsável.')
                                                       res.redirect('/cliente/consulta')
                                                  })
                                             }).catch((err) => {
                                                  req.flash('error_msg', 'Houve um erro ao encontrar um vendedor.')
                                                  res.redirect('/configuracao/consultaempresa')
                                             })
                                        }).catch((err) => {
                                             req.flash('error_msg', 'Houve um erro ao encontrar a configuração.')
                                             res.redirect('/configuracao/consultaempresa')
                                        })

                                   }).catch((err) => {
                                        req.flash('error_msg', 'houve um erro ao encontrar a empresa.')
                                        res.redirect('/configuracao/consultaempresa')
                                   })
                              })
                         } else {
                              console.log('novo projeto')
                              const novo_projeto = {
                                   dimensionamento: dimensionamento._id,
                                   user: _id
                              }
                              new Projeto(novo_projeto).save().then(() => {
                                   Projeto.findOne().sort({ field: 'asc', _id: -1 }).lean().then((projeto) => {
                                        Empresa.find({ user: _id }).lean().then((empresa) => {
                                             Configuracao.find({ user: _id }).lean().then((configuracao) => {
                                                  Pessoa.find({ ehVendedor: true, user: _id }).lean().then((vendedor) => {
                                                       Pessoa.find({ user: _id, funges: 'checked' }).lean().then((responsavel) => {
                                                            Cliente.find({ user: _id, sissolar: 'checked' }).lean().then((clientes) => {
                                                                 sucesso.push({ texto: 'Dimensionamento realizado com sucesso!' })
                                                                 res.render('projeto/addprojeto', { projeto, dimensionamento, sucesso, empresa, configuracao, vendedor, responsavel, clientes, troca_dim: 'checked' })
                                                            }).catch((err) => {
                                                                 req.flash('error_msg', 'Houve um erro ao encontrar um cliente.')
                                                                 res.redirect('/cliente/consulta')
                                                            })
                                                       }).catch((err) => {
                                                            req.flash('error_msg', 'Houve um erro ao encontrar um responsável.')
                                                            res.redirect('/cliente/consulta')
                                                       })
                                                  }).catch((err) => {
                                                       req.flash('error_msg', 'Houve um erro ao encontrar um vendedor.')
                                                       res.redirect('/configuracao/consultaempresa')
                                                  })
                                             }).catch((err) => {
                                                  req.flash('error_msg', 'Houve um erro ao encontrar a configuração.')
                                                  res.redirect('/configuracao/consultaempresa')
                                             })

                                        }).catch((err) => {
                                             req.flash('error_msg', 'Houve um erro ao encontrar a empresa.')
                                             res.redirect('/configuracao/consultaempresa')
                                        })
                                   }).catch((err) => {
                                        req.flash('error_msg', 'Houve um erro ao encontrar o projeto.')
                                        res.redirect('/configuracao/consultaempresa')
                                   })
                              })
                         }
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao buscar o dimensionemnto.')
                         res.redirect('/menu')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao buscar o projeto.')
                    res.redirect('/menu')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Houve uma falha ao salvar o dimensionemnto.')
               res.redirect('/menu')
          })
     })
})

router.get('/vermais/:id', ehAdmin, (req, res) => {
     Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
          Realizado.findOne({ projeto: projeto._id }).lean().then((realizado) => {
               Pessoa.findOne({ _id: projeto.funins }).lean().then((responsavel) => {
                    Cliente.findOne({ _id: projeto.cliente }).lean().then((cliente) => {
                         Empresa.findOne({ _id: projeto.empresa }).lean().then((empresa) => {
                              res.render('projeto/vermais', { projeto, responsavel, empresa, realizado, cliente })
                         }).catch((err) => {
                              req.flash('error_msg', 'Nenhum empresa encontrado')
                              res.redirect('/configuracao/consultaempresa.')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Nenhum cliente encontrado.')
                         res.redirect('/projeto/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Nenhum responsável encontrado.')
                    res.redirect('/pessoa/consulta')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Projeto não realizado.')
               res.redirect('/pessoa/consulta')
          })
     }).catch((err) => {
          req.flash('error_msg', 'Nenhum projeto encontrado.')
          res.redirect('/projeto/consulta')
     })
})

router.get('/realizar/:id', ehAdmin, (req, res) => {
     Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
          Realizado.findOne({ projeto: projeto._id }).lean().then((realizado) => {
               Detalhado.findOne({ projeto: projeto._id }).lean().then((detalhe) => {
                    var temCercamento
                    var temPosteCond
                    var temCentral
                    if (projeto.temCercamento == 'checked') {
                         temCercamento = true
                    } else {
                         temCercamento = false
                    }
                    if (projeto.temPosteCond == 'checked') {
                         temPosteCond = true
                    } else {
                         temPosteCond = false
                    }
                    if (projeto.temCentral == 'checked') {
                         temCentral = true
                    } else {
                         temCentral = false
                    }

                    //console.log('temCercamento=>' + temCercamento)
                    //console.log('temPosteCond=>' + temPosteCond)

                    if (realizado) {
                         var varCP = false
                         var varTI = false
                         var varLAI = false
                         var varLL = false
                         var varCustoPlano = (realizado.custoPlano - projeto.custoPlano).toFixed(2)
                         if (varCustoPlano > 1) {
                              varCP = false
                         } else {
                              varCP = true
                         }
                         var varTotalImposto = (parseFloat(realizado.totalImposto) - parseFloat(projeto.totalImposto)).toFixed(2)
                         if (varTotalImposto > 1) {
                              varTI = true
                         } else {
                              varTI = false
                         }
                         var varlbaimp = (realizado.lbaimp - projeto.lbaimp).toFixed(2)
                         if (varlbaimp > 1) {
                              varLAI = true
                         } else {
                              varLAI = false
                         }
                         var varLucroLiquido = (realizado.lucroLiquido - projeto.lucroLiquido).toFixed(2)
                         if (varLucroLiquido > 1) {
                              varLL = true
                         } else {
                              varLL = false
                         }
                         res.render('projeto/realizado', { projeto, realizado, detalhe, varCustoPlano, varlbaimp, varLucroLiquido, varCustoPlano, varlbaimp, varLucroLiquido, varTotalImposto, varTI, varLL, varLAI, varCP, temCercamento, temPosteCond, temCentral })
                    } else {
                         res.render('projeto/realizado', { projeto, detalhe, temCercamento, temPosteCond, temCentral })
                    }
               }).catch((err) => {
                    req.flash('error_msg', 'Falha interna.')
                    res.redirect('/projeto/consulta')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Falha interna.')
               res.redirect('/projeto/consulta')
          })
     }).catch((err) => {
          req.flash('error_msg', 'Não foi possível encontrar o projeto.')
          res.redirect('/projeto/consulta')
     })
})

router.get('/novo', ehAdmin, (req, res) => {
     const { _id } = req.user
     Empresa.find({ user: _id }).lean().then((empresa) => {
          Configuracao.find({ user: _id }).lean().then((configuracao) => {
               Pessoa.find({ ehVendedor: true, user: _id }).lean().then((vendedor) => {
                    Pessoa.find({ user: _id, funges: 'checked' }).lean().then((responsavel) => {
                         Cliente.find({ user: _id, sissolar: 'checked' }).lean().then((clientes) => {
                              res.render("projeto/addprojeto", { empresa, configuracao, responsavel, vendedor, clientes, troca_dim: 'checked' })
                         }).catch((err) => {
                              req.flash('error_msg', 'Houve um erro ao encontrar um cliente.')
                              res.redirect('/projeto/novo')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve um erro ao encontrar um responsável.')
                         res.redirect('/projeto/novo')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro ao encontrar um vendedor.')
                    res.redirect('/projeto/novo')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Houve um erro ao encontrar a configuração.')
               res.redirect('/projeto/novo')
          })

     }).catch((err) => {
          req.flash('error_msg', 'houve um erro ao encontrar a empresa.')
          res.redirect('/projeto/novo')
     })
})

router.get('/direto/:id', ehAdmin, (req, res) => {
     const { _id } = req.user
     var ehSimples = false
     var ehLP = false
     var ehLR = false

     Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
          //console.log('encontrou projeto')
          Empresa.findOne({ _id: projeto.empresa }).lean().then((empresa) => {
               //console.log('empresa=>' + empresa)
               Cronograma.findOne({ projeto: req.params.id }).then((cronograma) => {
                    //console.log('encontrou cronograma')
                    //console.log('empresa.regime=>' + empresa.regime)
                    switch (empresa.regime) {
                         case "Simples": ehSimples = true
                              break;
                         case "Lucro Presumido": ehLP = true
                              break;
                         case "Lucro Real": ehLR = true
                              break;
                    }
                    //console.log('ehSimples=>' + ehSimples)
                    //console.log('ehLP=>' + ehLP)
                    //console.log('ehLR=>' + ehLR)
                    //console.log('projeto.cliente=>' + projeto.cliente)
                    Cliente.findOne({ _id: projeto.cliente }).lean().then((cliente) => {
                         //console.log('encontrou cliente')
                         var fatura
                         var checkHora
                         if (projeto.fatequ == true) {
                              fatura = 'checked'
                         } else {
                              fatura = 'uncheked'
                         }
                         //console.log('tipoCustoIns=>'+projeto.tipoCustoIns)

                         if (projeto.tipoCustoIns == 'hora') {
                              checkHora = 'checked'
                         } else {
                              checkHora = 'unchecked'
                         }
                         var libRecursos = liberaRecursos(cronograma.dateplaini, cronograma.dateplafim, cronograma.dateprjini, cronograma.dateprjfim,
                              cronograma.dateateini, cronograma.dateatefim, cronograma.dateinvini, cronograma.dateinvfim,
                              cronograma.datestbini, cronograma.datestbfim, cronograma.dateestini, cronograma.dateestfim,
                              cronograma.datemodini, cronograma.datemodfim, cronograma.datevisini, cronograma.datevisfim)
                         if (projeto.qtdins == '' || typeof projeto.qtdins == 'undefined' || projeto.qtdins == 0) {
                              libRecursos = false
                         } else {
                              libRecursos = true
                         }
                         res.render('projeto/custosdiretos', { projeto, empresa, ehSimples, ehLP, ehLR, cliente, fatura, checkHora, libRecursos })
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve um erro ao encontrar um cliente.')
                         res.redirect('/direto/' + req.params.id)
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao encontrar o cronograma.')
                    res.redirect('/direto/' + req.params.id)
               })
          }).catch((err) => {
               req.flash('error_msg', 'Houve uma falha ao encontrar a empresa.')
               res.redirect('/direto/' + req.params.id)
          })
     }).catch((err) => {
          req.flash('error_msg', 'Nenhum projeto encontrado.')
          res.redirect('/direto/' + req.params.id)
     })
})

router.get('/edicao/:id', ehAdmin, (req, res) => {
     const { _id } = req.user
     Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {

          //projeto_id = projeto._id
          var rp
          var pr
          var pv

          Detalhado.findOne({ projeto: projeto._id }).lean().then((detalhe) => {
               Empresa.findOne({ _id: projeto.empresa }).lean().then((empresa_projeto) => {
                    rp = empresa_projeto
               }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao encontrar a empresa')
                    res.redirect('/configuracao/consulta')
               })

               Pessoa.findOne({ _id: projeto.vendedor }).lean().then((prj_vendedor) => {
                    pv = prj_vendedor
               }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao encontrar o vendedor')
                    res.redirect('/pessoa/consulta')
               })

               Pessoa.findOne({ _id: projeto.funres }).lean().then((projeto_funres) => {
                    pr = projeto_funres
               }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao encontrar o vendedor')
                    res.redirect('/pessoa/consulta')
               })

               Pessoa.find({ funges: 'checked', user: _id }).lean().then((responsavel) => {
                    Pessoa.find({ ehVendedor: true, user: _id }).lean().then((vendedor) => {
                         Empresa.find({ user: _id }).lean().then((empresa) => {
                              Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                                   if (projeto.ehDireto == false) {
                                        res.render('projeto/editprojeto', { projeto, empresa, responsavel, rp, pr, detalhe, pv, vendedor, cliente })
                                   } else {
                                        res.render('projeto/editdiretoprincipal', { projeto, empresa, responsavel, rp, pr, detalhe, pv, vendedor, cliente })
                                   }
                              }).catch((err) => {
                                   req.flash('error_msg', 'Houve uma falha ao encontrar o cliente')
                                   res.redirect('/configuracao/consulta')
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Houve uma falha ao encontrar a empresa')
                              res.redirect('/configuracao/consulta')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Não foi possível encontrar o vendedor')
                         res.redirect('/pessoa/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Não foi possível encontrar o responsável')
                    res.redirect('/pessoa/consulta')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Não foi possível encontrar os detalhes do projeto')
               res.redirect('/projeto/consulta')
          })
     }).catch((err) => {
          req.flash('error_msg', 'Houve uma falha ao encontrar o projeto')
          res.redirect('/projeto/consulta')
     })

})

router.get('/confirmaexclusao/:id', ehAdmin, (req, res) => {
     Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
          res.render('projeto/confirmaexclusao', { projeto: projeto })
     }).catch((err) => {
          req.flash('error_msg', 'Não foi possível encontrar o projeto')
          res.redirect('/projeto/consulta')
     })
})

router.get('/remover/:id', ehAdmin, (req, res) => {
     var erros = []

     Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
          if (projeto.orcado == true) {
               Projeto.findOneAndRemove({ _id: req.params.id }).then(() => {
                    Detalhado.findOneAndRemove({ projeto: req.params.id }).then(() => {
                         Realizado.findOneAndRemove({ projeto: req.params.id }).then(() => {
                              Equipe.findOneAndRemove({ projeto: req.params.id }).then(() => {
                                   Cronograma.findOneAndRemove({ projeto: req.params.id }).then(() => {
                                        Dimensionamento.findOneAndRemove({ _id: projeto.dimensionamento }).then(() => {
                                             req.flash('success_msg', 'Projeto removido com sucesso')
                                             res.redirect('/projeto/consulta')
                                        }).catch(() => {
                                             req.flash('error_msg', 'Não foi possível remover o dimensionamento do projeto.')
                                             res.redirect('/projeto/consulta')
                                        })
                                   }).catch(() => {
                                        req.flash('error_msg', 'Não foi possível remover o cronograma do projeto.')
                                        res.redirect('/projeto/consulta')
                                   })
                              }).catch(() => {
                                   req.flash('error_msg', 'Não foi possível remover o realizado projeto.')
                                   res.redirect('/projeto/consulta')
                              })
                         }).catch(() => {
                              req.flash('error_msg', 'Não foi possível remover o realizado projeto.')
                              res.redirect('/projeto/consulta')
                         })
                    }).catch(() => {
                         req.flash('error_msg', 'Não foi possível remover os detalhes deste projeto.')
                         res.redirect('/projeto/consulta')
                    })
               }).catch(() => {
                    req.flash('error_msg', 'Não foi possível remover este projeto.')
                    res.redirect('/projeto/consulta')
               })
          } else {
               req.flash('error_msg', 'O projeto não pode ser excluido porque já esta em execução')
               res.redirect('/projeto/consulta')
          }
     })
})

router.post("/novo", ehAdmin, (req, res) => {
     const { _id } = req.user
     var prj_id
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

     //Validação se o projeto já existe
     var nome = req.body.nome
     Projeto.findOne({ nome: nome, user: _id }).then((projeto) => {
          prj_id = projeto._id

          if (!prj_id || typeof prj_id != undefined) {
               req.flash('error_msg', 'Projeto: ' + nome + ' já existe')
               res.redirect('/projeto/novo')
          }
     }).catch(() => {
          var erros = []
          var erros_semdim = ''
          var sucesso = []
          var vlrequ = 0
          var vlrkit = 0

          var unidadeEqu = 0
          var unidadeMod = 0
          var unidadeInv = 0
          var unidadeEst = 0
          var unidadeCim = 0
          var unidadeCab = 0
          var unidadeEbt = 0
          var unidadeDisCC = 0
          var unidadeDPSCC = 0
          var unidadeDisCA = 0
          var unidadeDPSCA = 0
          var unidadeSB = 0
          var unidadeCCA = 0
          var unidadeOcp = 0
          var unidadeCer = 0
          var unidadeCen = 0
          var unidadePos = 0
          var vlrUniEqu = 0
          var vlrUniMod = 0
          var vlrUniInv = 0
          var vlrUniEst = 0
          var vlrUniCim = 0
          var vlrUniCab = 0
          var vlrUniEbt = 0
          var vlrUniDisCC = 0
          var vlrUniDPSCC = 0
          var vlrUniDisCA = 0
          var vlrUniDPSCA = 0
          var vlrUniSB = 0
          var vlrUniCCA = 0
          var vlrUniOcp = 0
          var vlrUniCer = 0
          var vlrUniCen = 0
          var vlrUniPos = 0
          var valorEqu = 0
          var valorMod = 0
          var valorInv = 0
          var valorEst = 0
          var valorCim = 0
          var valorCab = 0
          var valorEbt = 0
          var valorDisCC = 0
          var valorDPSCC = 0
          var valorDisCA = 0
          var valorDPSCA = 0
          var valorSB = 0
          var valorCCA = 0
          var valorOcp = 0
          var valorCer = 0
          var valorCen = 0
          var valorPos = 0

          var valorOcp = 0

          var checkUni = 'unckeched'

          //Valida valor Equipamento Detalhado
          if (req.body.valorEqu != '') {
               unidadeEqu = 0
               vlrUniEqu = 0
               valorEqu = req.body.valorEqu
          } else {
               if (req.body.unidadeEqu != '' && req.body.vlrUniEqu != '') {
                    unidadeEqu = req.body.unidadeEqu
                    vlrUniEqu = req.body.vlrUniEqu
                    valorEqu = parseFloat(unidadeEqu) * parseFloat(vlrUniEqu)
                    checkUni = 'checked'
               }
          }
          //Valida valor Módulo Detalhado
          //console.log('req.body.valorMod =>' + req.body.valorMod)
          if (req.body.valorMod != '') {
               unidadeMod = 0
               vlrUniMod = 0
               valorMod = req.body.valorMod
          } else {
               if (req.body.unidadeMod != '' && req.body.vlrUniMod != '') {
                    unidadeMod = req.body.unidadeMod
                    vlrUniMod = req.body.vlrUniMod
                    valorMod = parseFloat(unidadeMod) * parseFloat(vlrUniMod)
                    checkUni = 'checked'
               }
          }
          //console.log('unidadeMod=>' + unidadeMod)
          //console.log('vlrUniMod=>' + vlrUniMod)
          //console.log('valorMod=>' + valorMod)
          //Valida valor Inversor Detalhado
          if (req.body.valorInv != '') {
               unidadeInv = 0
               vlrUniInv = 0
               valorInv = req.body.valorInv
          } else {
               if (req.body.unidadeInv != '' && req.body.vlrUniInv != '') {
                    unidadeInv = req.body.unidadeInv
                    vlrUniInv = req.body.vlrUniInv
                    valorInv = parseFloat(unidadeInv) * parseFloat(vlrUniInv)
                    checkUni = 'checked'
               }
          }
          //Valida valor Estrutura Detalhado
          if (req.body.valorEst != '') {
               unidadeEst = 0
               vlrUniEst = 0
               valorEst = req.body.valorEst
          } else {
               if (req.body.unidadeEst != '' && req.body.vlrUniEst != '') {
                    unidadeEst = req.body.unidadeEst
                    vlrUniEst = req.body.vlrUniEst
                    valorEst = parseFloat(unidadeEst) * parseFloat(vlrUniEst)
                    checkUni = 'checked'
               }
          }
          //Valida valor Concretagem
          if (req.body.valorCim != '') {
               unidadeCim = 0
               vlrUniCim = 0
               valorCim = req.body.valorCim
          } else {
               if (req.body.unidadeCim != '' && req.body.vlrUniCim != '') {
                    unidadeCim = req.body.unidadeCim
                    vlrUniCim = req.body.vlrUniCim
                    valorCim = parseFloat(unidadeCim) * parseFloat(vlrUniCim)
                    checkUni = 'checked'
               }
          }
          //Valida valor Cabos Detalhado
          if (req.body.valorCab != '') {
               unidadeCab = 0
               vlrUniCab = 0
               valorCab = req.body.valorCab
          } else {
               if (req.body.unidadeCab != '' && req.body.vlrUniCab != '') {
                    unidadeCab = req.body.unidadeCab
                    vlrUniCab = req.body.vlrUniCab
                    valorCab = parseFloat(unidadeCab) * parseFloat(vlrUniCab)
                    checkUni = 'checked'
               }
          }
          //Valida valor Armazenagem Detalhado
          if (req.body.valorEbt != '') {
               unidadeEbt = 0
               vlrUniEbt = 0
               valorEbt = req.body.valorEbt
          } else {
               if (req.body.unidadeEbt != '' && req.body.vlrUniEbt != '') {
                    unidadeEbt = req.body.unidadeEbt
                    vlrUniEbt = req.body.vlrUniEbt
                    valorEbt = parseFloat(unidadeEbt) * parseFloat(vlrUniEbt)
                    checkEbt = 'checked'
               }
          }
          //Valida valor Disjuntores Detalhado
          if (req.body.valorDisCC != '') {
               unidadeDisCC = 0
               vlrUniDisCC = 0
               valorDisCC = req.body.valorDisCC
          } else {
               if (req.body.unidadeDisCC != '' && req.body.vlrUniDisCC != '') {
                    unidadeDisCC = req.body.unidadeDisCC
                    vlrUniDisCC = req.body.vlrUniDisCC
                    valorDisCC = parseFloat(unidadeDisCC) * parseFloat(vlrUniDisCC)
                    checkUni = 'checked'
               }
          }
          if (req.body.valorDisCA != '') {
               unidadeDisCA = 0
               vlrUniDisCA = 0
               valorDisCA = req.body.valorDisCA
          } else {
               if (req.body.unidadeDisCA != '' && req.body.vlrUniDisCA != '') {
                    unidadeDisCA = req.body.unidadeDisCA
                    vlrUniDisCA = req.body.vlrUniDisCA
                    valorDisCA = parseFloat(unidadeDisCA) * parseFloat(vlrUniDisCA)
                    checkUni = 'checked'
               }
          }
          //Valida valor DPS Detalhado
          if (req.body.valorDPSCC != '') {
               unidadeDPSCC = 0
               vlrUniDPSCC = 0
               valorDPSCC = req.body.valorDPSCC
          } else {
               if (req.body.unidadeDPSCC != '' && req.body.vlrUniDPSCC != '') {
                    unidadeDPSCC = req.body.unidadeDPSCC
                    vlrUniDPSCC = req.body.vlrUniDPSCC
                    valorDPSCC = parseFloat(unidadeDPSCC) * parseFloat(vlrUniDPSCC)
                    checkUni = 'checked'
               }
          }
          if (req.body.valorDPSCA != '') {
               unidadeDPSCA = 0
               vlrUniDPSCA = 0
               valorDPSCA = req.body.valorDPSCA
          } else {
               if (req.body.unidadeDPSCA != '' && req.body.vlrUniDPSCA != '') {
                    unidadeDPSCA = req.body.unidadeDPSCA
                    vlrUniDPSCA = req.body.vlrUniDPSCA
                    valorDPSCA = parseFloat(unidadeDPSCA) * parseFloat(vlrUniDPSCA)
                    checkUni = 'checked'
               }
          }
          //Valida valor StringBox Detalhado
          if (req.body.valorSB != '') {
               unidadeSB = 0
               vlrUniSB = 0
               valorSB = req.body.valorSB
          } else {
               if (req.body.unidadeSB != '' && req.body.vlrUniSB != '') {
                    unidadeSB = req.body.unidadeSB
                    vlrUniSB = req.body.vlrUniSB
                    valorSB = parseFloat(unidadeSB) * parseFloat(vlrUniSB)
                    checkUni = 'checked'
               }
          }
          //Valida valor Caixa Proteção CA Detalhado
          if (req.body.valorCCA != '') {
               unidadeCCA = 0
               vlrUniCCA = 0
               valorCCA = req.body.valorCCA
          } else {
               if (req.body.unidadeCCA != '' && req.body.vlrUniCCA != '') {
                    unidadeCCA = req.body.unidadeCCA
                    vlrUniCCA = req.body.vlrUniCCA
                    valorCCA = parseFloat(unidadeCCA) * parseFloat(vlrUniCCA)
                    checkUni = 'checked'
               }
          }
          //Valida valor Outros Componentes Detalhado
          if (req.body.valorOcp != '') {
               unidadeOcp = 0
               vlrUniOcp = 0
               valorOcp = req.body.valorOcp
          } else {
               if (req.body.unidadeOcp != '' && req.body.vlrUniOcp != '') {
                    unidadeOcp = req.body.unidadeOcp
                    vlrUniOcp = req.body.vlrUniOcp
                    valorOcp = parseFloat(unidadeOcp) * parseFloat(vlrUniOcp)
                    checkUni = 'checked'
               }
          }
          //Valida valor Cercamento Detalhado
          if (req.body.cercamento != null) {
               if (req.body.valorCer != '') {
                    unidadeCer = 0
                    vlrUniCer = 0
                    valorCer = req.body.valorCer
               } else {
                    if (req.body.unidadeCer != '' && req.body.vlrUniCer != '') {
                         unidadeCer = req.body.unidadeCer
                         vlrUniCer = req.body.vlrUniCer
                         valorCer = parseFloat(unidadeCer) * parseFloat(vlrUniCer)
                         checkUni = 'checked'
                    }
               }
          }
          //Valida valor Central Detalhado
          //console.log('req.body.unidadeCen=>'+req.body.unidadeCen)
          //console.log('req.body.vlrUniCen=>'+req.body.vlrUniCen)
          //console.log('req.body.valorCen=>'+req.body.valorCen)
          if (req.body.central != null) {
               if (req.body.valorCen != '') {
                    unidadeCen = 0
                    vlrUniCen = 0
                    valorCen = req.body.valorCen
               } else {
                    if (req.body.unidadeCen != '' && req.body.vlrUniCen != '') {
                         unidadeCen = req.body.unidadeCen
                         vlrUniCen = req.body.vlrUniCen
                         valorCen = parseFloat(unidadeCen) * parseFloat(vlrUniCen)
                         checkUni = 'checked'
                    }
               }
          }
          //console.log('unidadeCen=>'+unidadeCen)
          //console.log('vlrUniCen=>'+vlrUniCen)
          //console.log('valorCen=>'+valorCen)          
          //Valida valor Postes Detalhado
          if (req.body.poste != null) {
               if (req.body.valorPos != '') {
                    unidadePos = 0
                    vlrUniPos = 0
                    valorPos = req.body.valorPos
               } else {
                    if (req.body.unidadePos != '' && req.body.vlrUniPos != '') {
                         unidadePos = req.body.unidadePos
                         vlrUniPos = req.body.vlrUniPos
                         valorPos = parseFloat(unidadePos) * parseFloat(vlrUniPos)
                         checkUni = 'checked'
                    }
               }
          }

          //console.log('valorEqu=>'+valorEqu)
          //console.log('valorEst=>'+valorEst)
          //console.log('valorCim=>'+valorCim)
          //console.log('valorCer=>'+valorCer)
          //console.log('valorPos=>'+valorPos)
          //console.log('valorDisCC=>'+valorDisCC)
          //console.log('valorDPSCC=>'+valorDPSCC)
          //console.log('valorDisCA=>'+valorDisCA)
          //console.log('valorDPSCA=>'+valorDPSCA)          
          //console.log('valorCab=>'+valorCab)
          //console.log('valorOcp=>'+valorOcp)

          var vlrTotal = parseFloat(valorEqu) + parseFloat(valorMod) + parseFloat(valorInv) + parseFloat(valorEst) + parseFloat(valorCim) + parseFloat(valorCab) + parseFloat(valorEbt) + parseFloat(valorDisCC) + parseFloat(valorDPSCC) + parseFloat(valorDisCA) + parseFloat(valorDPSCA) + parseFloat(valorSB) + parseFloat(valorCCA) + parseFloat(valorOcp) + parseFloat(valorCer) + parseFloat(valorCen) + parseFloat(valorPos)

          //Valida valor do equipameento
          if (parseFloat(valorEqu) != 0 || parseFloat(valorMod) != 0) {
               vlrequ = vlrTotal
               vlrkit = parseFloat(valorEqu) + parseFloat(valorMod) + parseFloat(valorInv) + parseFloat(valorEst) + parseFloat(valorCim) + parseFloat(valorCab) + parseFloat(valorEbt) + parseFloat(valorDisCC) + parseFloat(valorDPSCC) + parseFloat(valorDisCA) + parseFloat(valorDPSCA) + parseFloat(valorSB) + parseFloat(valorCCA)
          } else {
               vlrequ = parseFloat(req.body.equipamento) + parseFloat(valorEst) + parseFloat(valorCim) + parseFloat(valorCab) + parseFloat(valorEbt) + parseFloat(valorDisCC) + parseFloat(valorDPSCC) + parseFloat(valorDisCA) + parseFloat(valorDPSCA) + parseFloat(valorSB) + parseFloat(valorCCA) + parseFloat(valorOcp) + parseFloat(valorCer) + parseFloat(valorCen) + parseFloat(valorPos)
               vlrkit = parseFloat(req.body.equipamento) + parseFloat(valorEst) + parseFloat(valorCim) + parseFloat(valorDisCC) + parseFloat(valorDPSCC) + parseFloat(valorDisCA) + parseFloat(valorDPSCA) + parseFloat(valorSB) + parseFloat(valorCCA) + parseFloat(valorCab) + parseFloat(valorEbt)
          }

          //console.log(vlrequ)
          /*
          valor = req.body.valor
          if (parseFloat(valor) == parseFloat(vlrequ) || parseFloat(valor) < parseFloat(vlrequ)) {
               erros.push({ texto: 'O valor do orçamento deve ser maior que o valor do equipamento.' })
          }
          */
          //console.log(req.body.dataini)
          //------------------------------------------------------------------
          if (req.body.dataini == '' || req.body.dataprev == '') {
               erros.push({ texto: 'É necessário informar as data de inicio e de previsão de entrega do projeto.' })
               erros_semdim = erros_semdim + 'É necessário informar as data de inicio e de previsão de entrega do projeto.'
          }
          console.log('req.body.id_dimensionamento=>' + req.body.id_dime)
          if (!req.body.id_dime) {
               if (validaCampos(req.body.potencia).length > 0 || validaCampos(req.body.nome).length > 0) {
                    erros.push({ texto: 'O preenchimento dos campos de nome e potencia são obrigatórios.' })
                    erros_semdim = erros_semdim + 'O preenchimento dos campos de nome e potencia são obrigatórios.'
               }
          }
          console.log('erros=>' + erros)
          if (erros.length > 0) {
               console.log('id_prj=>' + req.body.id_prj)
               console.log('id_dime=>' + req.body.id_dime)
               if (req.body.id_dime != '' && req.body.id_prj != '') {
                    console.log('Já tem dimensionamento')
                    Projeto.findOne({ _id: req.body.id_prj }).lean().then((projeto) => {
                         console.log('projeto=>' + projeto)
                         Dimensionamento.findOne({ _id: req.body.id_dime }).lean().then((dimensionamento) => {
                              console.log('dimensionamento=>' + dimensionamento)
                              Empresa.find({ user: _id }).lean().then((empresa) => {
                                   Configuracao.find({ user: _id }).lean().then((configuracao) => {
                                        Pessoa.find({ ehVendedor: true, user: _id }).lean().then((vendedor) => {
                                             Pessoa.find({ user: _id, funges: 'checked' }).lean().then((responsavel) => {
                                                  Cliente.find({ user: _id, sissolar: 'checked' }).lean().then((clientes) => {
                                                       res.render("projeto/addprojeto", { erros, empresa, projeto, dimensionamento, configuracao, responsavel, vendedor, clientes, troca_dim: 'checked' })
                                                  }).catch((err) => {
                                                       req.flash('error_msg', 'Houve um erro ao encontrar o cliente.')
                                                       res.redirect('/projeto/novo')
                                                  })
                                             }).catch((err) => {
                                                  req.flash('error_msg', 'Houve um erro ao encontrar um responsável.')
                                                  res.redirect('/projeto/novo')
                                             })
                                        }).catch((err) => {
                                             req.flash('error_msg', 'Houve um erro ao encontrar um vendedor.')
                                             res.redirect('/projeto/novo')
                                        })
                                   }).catch((err) => {
                                        req.flash('error_msg', 'Houve um erro ao encontrar a configuração.')
                                        res.redirect('/projeto/novo')
                                   })

                              }).catch((err) => {
                                   req.flash('error_msg', 'houve um erro ao encontrar a empresa.')
                                   res.redirect('/projeto/novo')
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Houve um erro interno<dimensionamento>.')
                              res.redirect('/projeto/novo')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve um erro interno<dimensionamento>.')
                         res.redirect('/projeto/novo')
                    })
               } else {
                    req.flash('error_msg', erros_semdim)
                    res.redirect('/projeto/novo')
               }

          } else {
               //Define variável booleana de acordo com o tipo do custo
               if (req.body.tipoEntrada == 'Terceirizado') {
                    tipoEntrada = true
               } else {
                    tipoEntrada = false
               }
               //Validação de check box  
               var cercamento
               var central
               var poste
               var estsolo
               var armazenamento
               var painel

               if (req.body.cercamento != null) {
                    cercamento = 'checked'
               }
               if (req.body.central != null) {
                    central = 'checked'
               }
               if (req.body.poste != null) {
                    poste = 'checked'
               }
               if (req.body.estsolo != null) {
                    estsolo = 'checked'
               }
               if (req.body.armazenamento != null) {
                    armazenamento = 'checked'
               }
               if (req.body.painel != null) {
                    painel = 'checked'
               }
               //console.log('vlrNFS=>' + vlrNFS)
               var cidade
               if (req.body.cidade == '') {
                    cidade = 0
               } else {
                    cidade = req.body.cidade
               }
               var uf
               if (req.body.uf == '') {
                    uf = 0
               } else {
                    uf = req.body.uf
               }
               var percom
               Pessoa.findOne({ _id: req.body.vendedor }).then((vendedor) => {
                    percom = vendedor.percom
                    //console.log('percom=>' + percom)

                    var data = new Date()
                    var dia = data.getDate()
                    //console.log('dia=>' + dia)
                    if (dia < 10) {
                         dia = '0' + dia
                         //console.log('dia_novo=>' + dia)
                    }
                    var mes = parseFloat(data.getMonth()) + 1
                    //console.log('mes=>' + mes)
                    if (mes < 10) {
                         mes = '0' + mes
                         //console.log('mes_novo=>' + mes)
                    }
                    var ano = data.getFullYear()
                    var datareg = ano + mes + dia

                    //Definindo valor do projeto pelo markup
                    var valorProjeto = 0
                    var fatequ
                    var vlrNFS = 0
                    var tipoCustoGes
                    var tipoCustoPro
                    var tipoCustoIns
                    Configuracao.findOne({ _id: req.body.configuracao }).then((config) => {
                         Cliente.findOne({ _id: req.body.cliente }).then((cliente) => {
                              //console.log('config.id=>' + config._id)
                              //console.log('config.markup=>' + config.markup)
                              if (req.body.valor == '' || req.body.valor == 0 || req.body.valor == null) {
                                   if (req.body.equipamento != '' || req.body.equipamento != 0) {
                                        valorProjeto = (parseFloat(req.body.equipamento) / (1 - (parseFloat(config.markup) / 100))).toFixed(2)
                                   } else {
                                        valorProjeto = 0
                                   }
                              } else {
                                   valorProjeto = req.body.valor
                              }
                              //console.log('valorProjeto=>' + valorProjeto)
                              if (req.body.checkFatura != null) {
                                   fatequ = true
                                   vlrNFS = valorProjeto
                              } else {
                                   fatequ = false
                                   vlrNFS = parseFloat(valorProjeto) - parseFloat(vlrkit)
                              }
                              //console.log('cliente.nome=>' + cliente.nome)
                              if (req.body.tipoCusto == 'hora') {
                                   tipoCustoGes = 'hora'
                                   tipoCustoPro = 'hora'
                                   tipoCustoIns = 'hora'
                                   checkHora = 'checked'
                              } else {
                                   tipoCustoGes = 'dia'
                                   tipoCustoPro = 'dia'
                                   tipoCustoIns = 'dia'
                                   checkDia = 'checked'
                                   typeGes = 'text'
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

                              console.log('req.body.id_prj=>' + req.body.id_prj)

                              Projeto.find({ user: _id }).then((exclui_projeto) => {

                                   for (var i = 0; i < exclui_projeto.length; i++) {
                                        if (exclui_projeto._id == req.body.id_prj) {
                                             req.exclui_projeto.remove()
                                        }
                                   }

                                   var potencia
                                   var dime
                                   var corpo
                                   var projeto
                                   if (req.body.potencia_dime == '') {
                                        potencia = req.body.potencia
                                   } else {
                                        potencia = req.body.potencia_dime
                                   }

                                   console.log('novo projeto')
                                   console.log('potencia=>' + potencia)

                                   corpo = {
                                        user: _id,
                                        nome: req.body.nome,
                                        nomecliente: cliente.nome,
                                        configuracao: req.body.configuracao,
                                        markup: config.markup,
                                        requisitos: req.body.requisitos,
                                        grupoUsina: req.body.grupoUsina,
                                        tipoConexao: req.body.tipoConexao,
                                        classUsina: req.body.classUsina,
                                        tipoUsina: req.body.tipoUsina,
                                        tipoCustoGes: tipoCustoGes,
                                        tipoCustoPro: tipoCustoPro,
                                        tipoCustoIns: tipoCustoIns,
                                        cidade: cidade,
                                        uf: uf,
                                        valor: valorProjeto,
                                        vlrnormal: valorProjeto,
                                        data: dia + '/' + mes + '/' + ano,
                                        datareg: datareg,
                                        potencia: potencia,
                                        ehDireto: tipoEntrada,
                                        vlrequ: vlrequ,
                                        vlrkit: vlrkit,
                                        fatequ: fatequ,
                                        vlrNFS: vlrNFS,
                                        percom: percom,
                                        vendedor: req.body.vendedor,
                                        empresa: req.body.empresa,
                                        cliente: req.body.cliente,
                                        temCercamento: cercamento,
                                        temCentral: central,
                                        temPosteCond: poste,
                                        temEstSolo: estsolo,
                                        temArmazenamento: armazenamento,
                                        temPainel: painel,
                                        premissas: req.body.premissas,
                                        vrskwp: (parseFloat(valorProjeto) / parseFloat(potencia)).toFixed(2),
                                        dataini: req.body.dataini,
                                        valDataIni: req.body.valDataIni,
                                        dataprev: req.body.dataprev,
                                        valDataPrev: req.body.valDataPrev,
                                        dataord: req.body.dataord,
                                        foiRealizado: false,
                                        executando: false,
                                        parado: false,
                                        orcado: true,
                                   }
                                   if (req.body.id_dime != '') {
                                        dime = {
                                             dimensionamento: req.body.id_dime
                                        }
                                        projeto = Object.assign(corpo,dime)
                                   }else{
                                        projeto = corpo
                                   }

                                   new Projeto(projeto).save().then(() => {

                                        Projeto.findOne({ user: _id }).sort({ field: 'asc', _id: -1 }).lean().then((projeto) => {
                                             Empresa.findOne({ _id: projeto.empresa }).lean().then((rp) => {
                                                  //Busca instalador par listar
                                                  Pessoa.find({ funins: 'checked', user: _id }).lean().then((instalador) => {
                                                       //Busca projetista para listar                         
                                                       Pessoa.find({ funpro: 'checked', user: _id }).lean().then((projetista) => {
                                                            Pessoa.find({ vendedor: true, user: _id }).lean().then((vendedor) => {

                                                                 //console.log('projeto=>' + projeto._id)
                                                                 //console.log('vlrTotal=>' + vlrequ)
                                                                 //console.log('checkUni=>' + checkUni)
                                                                 //console.log('unidadeEqu=>' + unidadeEqu)
                                                                 //console.log('unidadeMod=>' + unidadeMod)
                                                                 //console.log('unidadeInv=>' + unidadeInv)
                                                                 //console.log('unidadeEst=>' + unidadeEst)
                                                                 //console.log('unidadeCab=>' + unidadeCab)
                                                                 //console.log('unidadeDis=>' + unidadeDis)
                                                                 //console.log('unidadeDPS=>' + unidadeDPS)
                                                                 //console.log('unidadeSB=>' + unidadeSB)
                                                                 //console.log('unidadeCer=>' + unidadeCer)
                                                                 //console.log('unidadeCen=>' + unidadeCen)
                                                                 //console.log('unidadePos=>' + unidadePos)
                                                                 //console.log('unidadeOcp=>' + unidadeOcp)
                                                                 //console.log('vlrUniEqu=>' + vlrUniEqu)
                                                                 //console.log('vlrUniMod=>' + vlrUniMod)
                                                                 //console.log('vlrUniInv=>' + vlrUniInv)
                                                                 //console.log('vlrUniEst=>' + vlrUniEst)
                                                                 //console.log('vlrUniCab=>' + vlrUniCab)
                                                                 //console.log('vlrUniDis=>' + vlrUniDis)
                                                                 //console.log('vlrUniDPS=>' + vlrUniDPS)
                                                                 //console.log('vlrUniSB=>' + vlrUniSB)
                                                                 //console.log('vlrUniCer=>' + vlrUniCer)
                                                                 //console.log('vlrUniCen=>' + vlrUniCen)
                                                                 //console.log('vlrUniPos=>' + vlrUniPos)
                                                                 //console.log('vlrUniOcp=>' + vlrUniOcp)
                                                                 //console.log('valorEqu=>' + valorEqu)
                                                                 //console.log('valorMod=>' + valorMod)
                                                                 //console.log('valorInv=>' + valorInv)
                                                                 //console.log('valorEst=>' + valorEst)
                                                                 //console.log('valorCim=>' + valorCim)
                                                                 //console.log('valorCab=>' + valorCab)
                                                                 //console.log('valorDisCC=>' + valorDisCC)
                                                                 //console.log('valorDPSCC=>' + valorDPSCC)
                                                                 //console.log('valorDisCA=>' + valorDisCA)
                                                                 //console.log('valorDPSCA=>' + valorDPSCA)                                                       
                                                                 //console.log('valorSB=>' + valorSB)
                                                                 //console.log('valorCCA=>' + valorCCA)
                                                                 //console.log('valorCer=>' + valorCer)
                                                                 //console.log('valorCen=>' + valorCen)
                                                                 //console.log('valorPos=>' + valorPos)
                                                                 //console.log('valorOcp=>' + valorOcp)

                                                                 const detalhado = {
                                                                      projeto: projeto._id,
                                                                      vlrTotal: vlrequ,
                                                                      checkUni: checkUni,
                                                                      unidadeEqu: unidadeEqu,
                                                                      unidadeMod: unidadeMod,
                                                                      unidadeInv: unidadeInv,
                                                                      unidadeEst: unidadeEst,
                                                                      unidadeCim: unidadeCim,
                                                                      unidadeCab: unidadeCab,
                                                                      unidadeEbt: unidadeEbt,
                                                                      unidadeDisCC: unidadeDisCC,
                                                                      unidadeDPSCC: unidadeDPSCC,
                                                                      unidadeDisCA: unidadeDisCA,
                                                                      unidadeDPSCA: unidadeDPSCA,
                                                                      unidadeSB: unidadeSB,
                                                                      unidadeCCA: unidadeCCA,
                                                                      unidadeCer: unidadeCer,
                                                                      unidadeCen: unidadeCen,
                                                                      unidadePos: unidadePos,
                                                                      unidadeOcp: unidadeOcp,
                                                                      vlrUniEqu: vlrUniEqu,
                                                                      vlrUniMod: vlrUniMod,
                                                                      vlrUniInv: vlrUniInv,
                                                                      vlrUniEst: vlrUniEst,
                                                                      vlrUniCim: vlrUniCim,
                                                                      vlrUniCab: vlrUniCab,
                                                                      vlrUniEbt: vlrUniEbt,
                                                                      vlrUniDisCC: vlrUniDisCC,
                                                                      vlrUniDPSCC: vlrUniDPSCC,
                                                                      vlrUniDisCA: vlrUniDisCA,
                                                                      vlrUniDPSCA: vlrUniDPSCA,
                                                                      vlrUniSB: vlrUniSB,
                                                                      vlrUniCCA: vlrUniCCA,
                                                                      vlrUniCer: vlrUniCer,
                                                                      vlrUniCen: vlrUniCen,
                                                                      vlrUniPos: vlrUniPos,
                                                                      vlrUniOcp: vlrUniOcp,
                                                                      valorEqu: valorEqu,
                                                                      valorMod: valorMod,
                                                                      valorInv: valorInv,
                                                                      valorEst: valorEst,
                                                                      valorCim: valorCim,
                                                                      valorCab: valorCab,
                                                                      valorEbt: valorEbt,
                                                                      valorDisCC: valorDisCC,
                                                                      valorDPSCC: valorDPSCC,
                                                                      valorDisCA: valorDisCA,
                                                                      valorDPSCA: valorDPSCA,
                                                                      valorSB: valorSB,
                                                                      valorCCA: valorCCA,
                                                                      valorCer: valorCer,
                                                                      valorCen: valorCen,
                                                                      valorPos: valorPos,
                                                                      valorOcp: valorOcp
                                                                 }
                                                                 new Detalhado(detalhado).save().then(() => {

                                                                      var cronograma_novo = {
                                                                           user: _id,
                                                                           projeto: projeto._id,
                                                                           nome: projeto.nome,
                                                                           dateplaini: req.body.valDataIni,
                                                                           dateentrega: req.body.valDataPrev,
                                                                      }
                                                                      new Cronograma(cronograma_novo).save().then(() => {
                                                                           Configuracao.findOne({ _id: req.body.configuracao }).lean().then((configuracao) => {
                                                                                Cliente.findOne({ _id: req.body.cliente }).lean().then((cliente) => {
                                                                                     Pessoa.findOne({ _id: req.body.gestor }).lean().then((gestao) => {
                                                                                          //console.log('salva pessoa')
                                                                                          new Equipe({
                                                                                               projeto: projeto._id,
                                                                                               user: _id,
                                                                                               nome_projeto: projeto.nome,
                                                                                          }).save().then(() => {
                                                                                               sucesso.push({ texto: 'Projeto criado com sucesso' })
                                                                                               var fatura
                                                                                               if (req.body.checkFatura != null) {
                                                                                                    fatura = 'checked'
                                                                                               } else {
                                                                                                    fatura = 'uncheked'
                                                                                               }

                                                                                               if (req.body.tipoEntrada == 'Proprio') {
                                                                                                    res.render("projeto/customdo/gestao", {
                                                                                                         projeto, sucesso, configuracao, gestao, cliente, checkHora,
                                                                                                         typeHrg, displayHrs, mostraHora, typeGes, checkDia, displayTda, escopo, cronograma, comunicacao,
                                                                                                         vistoria, alocacao, aquisicao, typeDrg, displayDia
                                                                                                    })
                                                                                               } else {
                                                                                                    res.render('projeto/custosdiretos', {
                                                                                                         projeto, sucesso, configuracao, rp, vendedor, instalador, cliente, fatura, checkHora,
                                                                                                         typeHrg, displayHrs, mostraHora, typeGes, checkDia, displayTda, escopo, cronograma, comunicacao,
                                                                                                         vistoria, alocacao, aquisicao,
                                                                                                    })
                                                                                               }
                                                                                               //console.log('fatura=>' + fatura)
                                                                                          }).catch(() => {
                                                                                               req.flash('error_msg', 'Houve um erro ao salvar a equipe.')
                                                                                               res.redirect('/menu')
                                                                                          })
                                                                                     }).catch(() => {
                                                                                          req.flash('error_msg', 'Houve um erro ao encontrar o gestor.')
                                                                                          res.redirect('/menu')
                                                                                     })
                                                                                }).catch(() => {
                                                                                     req.flash('error_msg', 'Houve um erro ao encontrar o cliente.')
                                                                                     res.redirect('/menu')
                                                                                })
                                                                           }).catch(() => {
                                                                                req.flash('error_msg', 'Houve um erro ao encontrar os detalhes de custos do projeto.')
                                                                                res.redirect('/menu')
                                                                           })
                                                                      }).catch(() => {
                                                                           req.flash('error_msg', 'Houve um erro ao salvar o cronograma.')
                                                                           res.redirect('/menu')
                                                                      })
                                                                 }).catch(() => {
                                                                      req.flash('error_msg', 'Houve um erro ao salvar os detalhes de custos do projeto.')
                                                                      res.redirect('/menu')
                                                                 })

                                                            }).catch((err) => {
                                                                 req.flash('error_msg', 'Houve uma falha ao encontrar um vendedor<detalhe>.')
                                                                 res.redirect('/pessoa/consulta')
                                                            })
                                                       }).catch((err) => {
                                                            req.flash('error_msg', 'Houve uma falha ao encontrar o instalador.')
                                                            res.redirect('/pessoa/consulta')
                                                       })
                                                  }).catch((err) => {
                                                       req.flash('error_msg', 'Ocorreu um erro interno<Configuracao>.')
                                                       res.redirect('/menu')
                                                  })
                                             }).catch((err) => {
                                                  req.flash('error_msg', 'Ocorreu um erro interno<Configuracao>.')
                                                  res.redirect('/menu')
                                             })
                                        }).catch((err) => {
                                             req.flash('error_msg', 'Nenhum projeto encontrado.')
                                             res.redirect('/menu')
                                        })
                                   }).catch(() => {
                                        req.flash('error_msg', 'Houve um erro ao criar o projeto.')
                                        res.redirect('/menu')
                                   })
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Houve um erro ao encontrar o cliente.')
                              res.redirect('/configuracao/consultaempresa')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve um erro ao encontrar a configuração.')
                         res.redirect('/configuracao/consultaempresa')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro ao encontrar o vendedor<projeto>.')
                    res.redirect('/configuracao/consultaempresa')
               })
          }

     })

})

router.post('/salvar_prereq', ehAdmin, (req, res) => {
     var sucesso = []
     Projeto.findOne({ _id: req.body.id }).then((projeto) => {
          //console.timeLog('req.body.premissas=>' + req.body.premissas)
          //console.timeLog('req.body.requisitos=>' + req.body.requisitos)
          projeto.premissas = req.body.premissas
          projeto.requisitos = req.body.requisitos
          projeto.save().then(() => {
               //console.log('salvou projeto')
               Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {
                    Realizado.findOne({ projeto: projeto._id }).lean().then((realizado) => {
                         Pessoa.findOne({ _id: projeto.funres }).lean().then((responsavel) => {
                              Empresa.findOne({ _id: projeto.empresa }).lean().then((empresa) => {
                                   sucesso.push({ texto: 'Premissas e requisitos salvos com sucesso.' })
                                   res.render('projeto/vermais', { sucesso: sucesso, projeto: projeto, responsavel: responsavel, empresa: empresa, realizado: realizado })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Nenhum empresa encontrado')
                                   res.redirect('/configuracao/consultaempresa')
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Nenhum responsável encontrado')
                              res.redirect('/pessoa/consulta')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Projeto não realizado')
                         res.redirect('/pessoa/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Nenhum projeto encontrado')
                    res.redirect('/projeto/consulta')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Houve um erro ao salvar as premissas e')
               res.redirect('/configuracao/consultaempresa')
          })
     }).catch((err) => {
          req.flash('error_msg', 'Houve um erro ao encontrar o projeto')
          res.redirect('/configuracao/consultaempresa')
     })
})

router.post('/edicao', ehAdmin, (req, res) => {
     const { _id } = req.user
     var erros = ''
     var redirect = '/projeto/edicao/' + req.body.id

     if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
          erros = erros + 'Nome do projeto deve ser preenchido.'
     }
     if (!req.body.equipamento || typeof req.body.equipamento == undefined || req.body.equipamento == null) {
          erros = erros + 'O valor do equipamento ser preenchido.'

     }

     if (erros != '') {

          req.flash('error_msg', erros)
          res.redirect(redirect)

     } else {
          Projeto.findOne({ _id: req.body.id }).then((projeto) => {
               console.log('req.body.vendedor=>'+req.body.vendedor)
               Pessoa.findOne({ nome: req.body.vendedor }).then((prj_vendedor) => {
                    Detalhado.findOne({ projeto: projeto._id }).then((detalhe) => {
                         console.log('projeto._id=>'+projeto._id)
                         Cronograma.findOne({ projeto: projeto._id }).then((cronograma) => {
                              console.log('encontrou cronograma')

                              var sucesso = ''
                              var aviso = ''
                              var checkUni = 'unchecked'

                              //Validação de check box  
                              var cercamento
                              var poste
                              var estsolo
                              var central
                              var armazenamento
                              var painel

                              projeto.nome = req.body.nome

                              if (req.body.cercamento != null) {
                                   cercamento = 'checked'
                              }
                              if (req.body.poste != null) {
                                   poste = 'checked'
                              }
                              if (req.body.estsolo != null) {
                                   estsolo = 'checked'
                              }
                              if (req.body.central != null) {
                                   central = 'checked'
                              }
                              if (req.body.armazenamento != null) {
                                   armazenamento = 'checked'
                              }
                              if (req.body.painel != null) {
                                   painel = 'checked'
                              }
                              //--Rotina do cadastro dos detalhes
                              var unidadeEqu = 0
                              var unidadeMod = 0
                              var unidadeInv = 0
                              var unidadeEst = 0
                              var unidadeCim = 0
                              var unidadeCab = 0
                              var unidadeEbt = 0
                              var unidadeDisCC = 0
                              var unidadeDPSCC = 0
                              var unidadeDisCA = 0
                              var unidadeDPSCA = 0
                              var unidadeSB = 0
                              var unidadeCCA = 0
                              var unidadeOcp = 0
                              var unidadeCer = 0
                              var unidadeCen = 0
                              var unidadePos = 0
                              var vlrUniEqu = 0
                              var vlrUniMod = 0
                              var vlrUniInv = 0
                              var vlrUniEst = 0
                              var vlrUniCim = 0
                              var vlrUniCab = 0
                              var vlrUniEbt = 0
                              var vlrUniDisCC = 0
                              var vlrUniDPSCC = 0
                              var vlrUniDisCA = 0
                              var vlrUniDPSCA = 0
                              var vlrUniSB = 0
                              var vlrUniCCA = 0
                              var vlrUniOcp = 0
                              var vlrUniCer = 0
                              var vlrUniCen = 0
                              var vlrUniPos = 0
                              var valorEqu = 0
                              var valorMod = 0
                              var valorInv = 0
                              var valorEst = 0
                              var valorCim = 0
                              var valorCab = 0
                              var valorEbt = 0
                              var valorDisCC = 0
                              var valorDPSCC = 0
                              var valorDisCA = 0
                              var valorDPSCA = 0
                              var valorSB = 0
                              var valorCCA = 0
                              var valorOcp = 0
                              var valorCer = 0
                              var valorCen = 0
                              var valorPos = 0

                              //Valida valor Equipamento Detalhado
                              if (req.body.valorMod == 0) {
                                   if (req.body.valorEqu != 0 && req.body.unidadeEqu == 0 && req.body.vlrUniEqu == 0) {
                                        valorEqu = req.body.valorEqu
                                   } else {
                                        if (req.body.unidadeEqu != 0 && req.body.vlrUniEqu != 0) {
                                             unidadeEqu = req.body.unidadeEqu
                                             vlrUniEqu = req.body.vlrUniEqu
                                             valorEqu = parseFloat(unidadeEqu) * parseFloat(vlrUniEqu)
                                             checkUni = 'checked'
                                        }
                                   }
                              }
                              //Valida valor Módulo Detalhado
                              if (req.body.valorMod != 0 && req.body.unidadeMod == 0 && req.body.vlrUniMod == 0) {
                                   valorMod = req.body.valorMod
                              } else {
                                   if (req.body.unidadeMod != 0 && req.body.vlrUniMod != 0) {
                                        unidadeMod = req.body.unidadeMod
                                        vlrUniMod = req.body.vlrUniMod
                                        valorMod = parseFloat(unidadeMod) * parseFloat(vlrUniMod)
                                        checkUni = 'checked'
                                   }
                              }
                              //Valida valor Inversor Detalhado
                              if (req.body.valorInv != 0 && req.body.unidadeInv == 0 && req.body.vlrUniInv == 0) {
                                   valorInv = req.body.valorInv
                              } else {
                                   if (req.body.unidadeInv != 0 && req.body.vlrUniInv != 0) {
                                        unidadeInv = req.body.unidadeInv
                                        vlrUniInv = req.body.vlrUniInv
                                        valorInv = parseFloat(unidadeInv) * parseFloat(vlrUniInv)
                                        checkUni = 'checked'
                                   }
                              }
                              //Valida valor Estrutura Detalhado
                              if (req.body.valorEst != 0 && req.body.unidadeEst == 0 && req.body.vlrUniEst == 0) {
                                   valorEst = req.body.valorEst
                              } else {
                                   if (req.body.unidadeEst != 0 && req.body.vlrUniEst != 0) {
                                        unidadeEst = req.body.unidadeEst
                                        vlrUniEst = req.body.vlrUniEst
                                        valorEst = parseFloat(unidadeEst) * parseFloat(vlrUniEst)
                                        checkUni = 'checked'
                                   }
                              }
                              //Valida valor Concretagem
                              if (req.body.valorCim != 0 && req.body.unidadeCim == 0 && req.body.vlrUniCim == 0) {
                                   unidadeCim = 0
                                   vlrUniCim = 0
                                   valorCim = req.body.valorCim
                              } else {
                                   if (req.body.unidadeCim != '' && req.body.vlrUniCim != '') {
                                        unidadeCim = req.body.unidadeCim
                                        vlrUniCim = req.body.vlrUniCim
                                        valorCim = parseFloat(unidadeCim) * parseFloat(vlrUniCim)
                                        checkUni = 'checked'
                                   }
                              }
                              //Valida valor Cabos Detalhado
                              if (req.body.valorCab != 0 && req.body.unidadeCab == 0 && req.body.vlrUniCab == 0) {
                                   unidadeCab = 0
                                   vlrUniCab = 0
                                   valorCab = req.body.valorCab
                              } else {
                                   if (req.body.unidadeCab != '' && req.body.vlrUniCab != '') {
                                        unidadeCab = req.body.unidadeCab
                                        vlrUniCab = req.body.vlrUniCab
                                        valorCab = parseFloat(unidadeCab) * parseFloat(vlrUniCab)
                                        checkUni = 'checked'
                                   }
                              }
                              //Valida valor Armazenagem Detalhado
                              if (req.body.valorEbt != 0 && req.body.unidadeEbt == 0 && req.body.vlrUniEbt == 0) {
                                   unidadeEbt = 0
                                   vlrUniEbt = 0
                                   valorEbt = req.body.valorEbt
                              } else {
                                   if (req.body.unidadeEbt != '' && req.body.vlrUniEbt != '') {
                                        unidadeEbt = req.body.unidadeEbt
                                        vlrUniEbt = req.body.vlrUniEbt
                                        valorEbt = parseFloat(unidadeEbt) * parseFloat(vlrUniEbt)
                                        checkUni = 'checked'
                                   }
                              }
                              //Valida valor Disjuntores Detalhado
                              if (req.body.valorDisCC != 0 && req.body.unidadeDisCC == 0 && req.body.vlrUniDisCC == 0) {
                                   unidadeDisCC = 0
                                   vlrUniDisCC = 0
                                   valorDisCC = req.body.valorDisCC
                              } else {
                                   if (req.body.unidadeDisCC != '' && req.body.vlrUniDisCC != '') {
                                        unidadeDisCC = req.body.unidadeDisCC
                                        vlrUniDisCC = req.body.vlrUniDisCC
                                        valorDisCC = parseFloat(unidadeDisCC) * parseFloat(vlrUniDisCC)
                                        checkUni = 'checked'
                                   }
                              }
                              if (req.body.valorDisCA != 0 && req.body.unidadeDisCA == 0 && req.body.vlrUniDisCA == 0) {
                                   unidadeDisCA = 0
                                   vlrUniDisCA = 0
                                   valorDisCA = req.body.valorDisCA
                              } else {
                                   if (req.body.unidadeDisCA != '' && req.body.vlrUniDisCA != '') {
                                        unidadeDisCA = req.body.unidadeDisCA
                                        vlrUniDisCA = req.body.vlrUniDisCA
                                        valorDisCA = parseFloat(unidadeDisCA) * parseFloat(vlrUniDisCA)
                                        checkUni = 'checked'
                                   }
                              }
                              //Valida valor DPS Detalhado
                              if (req.body.valorDPSCC != 0 && req.body.unidadeDPSCC == 0 && req.body.vlrUniDPSCC == 0) {
                                   unidadeDPSCC = 0
                                   vlrUniDPSCC = 0
                                   valorDPSCC = req.body.valorDPSCC
                              } else {
                                   if (req.body.unidadeDPSCC != '' && req.body.vlrUniDPSCC != '') {
                                        unidadeDPSCC = req.body.unidadeDPSCC
                                        vlrUniDPSCC = req.body.vlrUniDPSCC
                                        valorDPSCC = parseFloat(unidadeDPSCC) * parseFloat(vlrUniDPSCC)
                                        checkUni = 'checked'
                                   }
                              }
                              if (req.body.valorDPSCA != 0 && req.body.unidadeDPSCA == 0 && req.body.vlrUniDPSCA == 0) {
                                   unidadeDPSCA = 0
                                   vlrUniDPSCA = 0
                                   valorDPSCA = req.body.valorDPSCA
                              } else {
                                   if (req.body.unidadeDPSCA != '' && req.body.vlrUniDPSCA != '') {
                                        unidadeDPSCA = req.body.unidadeDPSCA
                                        vlrUniDPSCA = req.body.vlrUniDPSCA
                                        valorDPSCA = parseFloat(unidadeDPSCA) * parseFloat(vlrUniDPSCA)
                                        checkUni = 'checked'
                                   }
                              }
                              //Valida valor StringBox Detalhado
                              if (req.body.valorSB != 0 && req.body.unidadeSB == 0 && req.body.vlrUniSB == 0) {
                                   unidadeSB = 0
                                   vlrUniSB = 0
                                   valorSB = req.body.valorSB
                              } else {
                                   if (req.body.unidadeSB != '' && req.body.vlrUniSB != '') {
                                        unidadeSB = req.body.unidadeSB
                                        vlrUniSB = req.body.vlrUniSB
                                        valorSB = parseFloat(unidadeSB) * parseFloat(vlrUniSB)
                                        checkUni = 'checked'
                                   }
                              }
                              //Valida valor Caixa Proteção CA Detalhado
                              if (req.body.valorCCA != 0 && req.body.unidadeCCA == 0 && req.body.vlrUniCCA == 0) {
                                   unidadeCCA = 0
                                   vlrUniCCA = 0
                                   valorCCA = req.body.valorCCA
                              } else {
                                   if (req.body.unidadeCCA != '' && req.body.vlrUniCCA != '') {
                                        unidadeCCA = req.body.unidadeCCA
                                        vlrUniCCA = req.body.vlrUniCCA
                                        valorCCA = parseFloat(unidadeCCA) * parseFloat(vlrUniCCA)
                                        checkUni = 'checked'
                                   }
                              }
                              //Valida valor Outros Componentes Detalhado
                              if (req.body.valorOcp != 0 && req.body.unidadeOcp == 0 && req.body.vlrUniOcp == 0) {
                                   valorOcp = req.body.valorOcp
                              } else {
                                   if (req.body.unidadeOcp != 0 && req.body.vlrUniOcp != 0) {
                                        unidadeOcp = req.body.unidadeOcp
                                        vlrUniOcp = req.body.vlrUniOcp
                                        valorOcp = parseFloat(unidadeOcp) * parseFloat(vlrUniOcp)
                                        checkUni = 'checked'
                                   }
                              }
                              //Valida valor Cercamento Detalhado
                              if (req.body.cercamento != null) {
                                   if (req.body.valorCer != 0 && req.body.unidadeCer == 0 && req.body.vlrUniCer == 0) {
                                        valorCer = req.body.valorCer
                                   } else {
                                        if (req.body.unidadeCer != 0 && req.body.vlrUniCer != 0) {
                                             unidadeCer = req.body.unidadeCer
                                             vlrUniCer = req.body.vlrUniCer
                                             valorCer = parseFloat(unidadeCer) * parseFloat(vlrUniCer)
                                             checkUni = 'checked'
                                        }
                                   }
                              }
                              //Valida valor Central Detalhado
                              if (req.body.central != null) {
                                   if (req.body.valorCen != 0 && req.body.unidadeCen == 0 && req.body.vlrUniCen == 0) {
                                        valorCen = req.body.valorCen
                                   } else {
                                        if (req.body.unidadeCen != 0 && req.body.vlrUniCen != 0) {
                                             unidadeCen = req.body.unidadeCen
                                             vlrUniCen = req.body.vlrUniCen
                                             valorCen = parseFloat(unidadeCen) * parseFloat(vlrUniCen)
                                             checkUni = 'checked'
                                        }
                                   }
                              }
                              //Valida valor Postes Detalhado
                              if (req.body.poste != null) {
                                   if (req.body.valorPos != 0 && req.body.unidadePos == 0 && req.body.vlrUniPos == 0) {
                                        valorPos = req.body.valorPos
                                   } else {
                                        if (req.body.unidadePos != 0 && req.body.vlrUniPos != 0) {
                                             unidadePos = req.body.unidadePos
                                             vlrUniPos = req.body.vlrUniPos
                                             valorPos = parseFloat(unidadePos) * parseFloat(vlrUniPos)
                                             checkUni = 'checked'
                                        }
                                   }
                              }

                              //console.log('checkUni=>' + checkUni)
                              //console.log('unidadeEqu=>', +unidadeEqu)
                              //console.log('unidadeMod=>', +unidadeMod)
                              //console.log('unidadeInv=>', +unidadeInv)
                              //console.log('unidadeEst=>', +unidadeEst)
                              //console.log('unidadeCim=>', +unidadeCim)
                              //console.log('unidadeCab=>', +unidadeCab)
                              //console.log('unidadeDisCC=>', +unidadeDisCC)
                              //console.log('unidadeDPSCC=>', +unidadeDPSCC)
                              //console.log('unidadeDisCA=>', +unidadeDisCA)
                              //console.log('unidadeDPSCA=>', +unidadeDPSCA)
                              //console.log('unidadeSB=>', +unidadeSB)
                              //console.log('unidadeCCA=>', +unidadeCCA)
                              //console.log('unidadeOcp=>', +unidadeOcp)
                              //console.log('unidadeCer=>', +unidadeCer)
                              //console.log('unidadeCen=>', +unidadeCen)
                              //console.log('unidadePos=>', +unidadePos)
                              //console.log('vlrUniEqu=>', +vlrUniEqu)
                              //console.log('vlrUniMod=>', +vlrUniMod)
                              //console.log('vlrUniInv=>', +vlrUniInv)
                              //console.log('vlrUniEst=>', +vlrUniEst)
                              //console.log('vlrUniCim=>', +vlrUniCim)
                              //console.log('vlrUniCab=>', +vlrUniCab)
                              //console.log('vlrUniDisCC=>', +vlrUniDisCC)
                              //console.log('vlrUniDPSCC=>', +vlrUniDPSCC)
                              //console.log('vlrUniDisCA=>', +vlrUniDisCA)
                              //console.log('vlrUniDPSCA=>', +vlrUniDPSCA)
                              //console.log('vlrUniSB=>', +vlrUniSB)                         
                              //console.log('vlrUniCCA=>', +vlrUniCCA)                         
                              //console.log('vlrUniOcp=>', +vlrUniOcp)
                              //console.log('vlrUniCer=>', +vlrUniCer)
                              //console.log('vlrUniCen=>', +vlrUniCen)
                              //console.log('vlrUniPos=>', +vlrUniPos)
                              //console.log('valorEqu=>', +valorEqu)
                              //console.log('valorMod=>', +valorMod)
                              //console.log('valorInv=>', +valorInv)
                              //console.log('valorEst=>', +valorEst)
                              //console.log('valorCim=>', +valorCim)
                              //console.log('valorCab=>', +valorCab)
                              //console.log('valorDisCC=>', +valorDisCC)
                              //console.log('valorDPSCC=>', +valorDPSCC)
                              //console.log('valorDisCA=>', +valorDisCA)
                              //console.log('valorDPSCA=>', +valorDPSCA)                         
                              //console.log('valorSB=>', +valorSB)
                              //console.log('valorCCA=>', +valorCCA)
                              //console.log('valorOcp=>', +valorOcp)
                              //console.log('valorCer=>', +valorCer)
                              //console.log('valorCen=>', +valorCen)
                              //console.log('valorPos=>', +valorPos)

                              var validaequant = 0
                              var validaequfut = 0
                              var vlrequ = 0
                              var vlrkit = 0

                              var vlrTotal = parseFloat(valorEqu) + parseFloat(valorMod) + parseFloat(valorInv) + parseFloat(valorEst) + parseFloat(valorCim) + parseFloat(valorCab) + parseFloat(valorEbt) + parseFloat(valorDisCC) + parseFloat(valorDPSCC) + parseFloat(valorDisCA) + parseFloat(valorDPSCA) + parseFloat(valorSB) + parseFloat(valorCCA) + parseFloat(valorOcp) + parseFloat(valorCer) + parseFloat(valorCen) + parseFloat(valorPos)
                              console.log('vlrTotal=>' + vlrTotal)

                              //Valida valor do equipameento
                              if (parseFloat(valorEqu) != 0 || parseFloat(valorMod) != 0) {
                                   //console.log('valorEqu != 0')
                                   vlrequ = vlrTotal
                                   vlrkit = parseFloat(valorEqu) + parseFloat(valorMod) + parseFloat(valorInv) + parseFloat(valorEst) + parseFloat(valorCim) + parseFloat(valorCab) + parseFloat(valorEbt) + parseFloat(valorDisCC) + parseFloat(valorDPSCC) + parseFloat(valorDisCA) + parseFloat(valorDPSCA) + parseFloat(valorSB) + parseFloat(valorCCA) + parseFloat(valorOcp)
                              } else {
                                   console.log('não tem lançamento manual de kit.')
                                   validaequant = parseFloat(projeto.vlrkit) - (parseFloat(detalhe.valorEst) + parseFloat(detalhe.valorCim) + parseFloat(detalhe.valorDisCC) + parseFloat(detalhe.valorDPSCC) + parseFloat(detalhe.valorDisCA) + parseFloat(detalhe.valorDPSCA) + parseFloat(detalhe.valorSB) + parseFloat(detalhe.valorCCA) + parseFloat(detalhe.valorCab) + parseFloat(detalhe.valorEbt))
                                   console.log('validaequant=>' + validaequant)
                                   validaequfut = parseFloat(req.body.equipamento) - (parseFloat(valorEst) + parseFloat(valorCim) + parseFloat(valorDisCC) + parseFloat(valorDPSCC) + parseFloat(valorDisCA) + parseFloat(valorDPSCA) + parseFloat(valorSB) + parseFloat(valorCCA) + parseFloat(valorCab) + parseFloat(valorEbt))
                                   console.log('validaequfut=>' + validaequfut)
                                   if (parseFloat(validaequant) != parseFloat(validaequfut)) {
                                        console.log('Os valores dos kits são difentes')
                                        if (req.body.equipamento == projeto.vlrkit) {
                                             vlrequ = parseFloat(validaequant) + parseFloat(valorEst) + parseFloat(valorCim) + parseFloat(valorCer) + parseFloat(valorPos) + parseFloat(valorCen) + parseFloat(valorDisCC) + parseFloat(valorDPSCC) + parseFloat(valorDisCA) + parseFloat(valorDPSCA) + parseFloat(valorCab) + parseFloat(valorEbt) + parseFloat(valorOcp)
                                             vlrkit = parseFloat(validaequant) + parseFloat(valorEst) + parseFloat(valorCim) + parseFloat(valorDisCC) + parseFloat(valorDPSCC) + parseFloat(valorDisCA) + parseFloat(valorDPSCA) + parseFloat(valorCab) + parseFloat(valorEbt)
                                        } else {
                                             vlrequ = parseFloat(req.body.equipamento) + parseFloat(valorEst) + parseFloat(valorCim) + parseFloat(valorCer) + parseFloat(valorCen) + parseFloat(valorPos) + parseFloat(valorDisCC) + parseFloat(valorDPSCC) + parseFloat(valorDisCA) + parseFloat(valorDPSCA) + parseFloat(valorCab) + parseFloat(valorEbt) + parseFloat(valorOcp)
                                             vlrkit = parseFloat(req.body.equipamento) + parseFloat(valorEst) + parseFloat(valorCim) + parseFloat(valorDisCC) + parseFloat(valorDPSCC) + parseFloat(valorDisCA) + parseFloat(valorDPSCA) + parseFloat(valorSB) + parseFloat(valorCCA) + parseFloat(valorCab) + parseFloat(valorEbt)
                                        }
                                   } else {
                                        console.log('Os valores dos kits são iguais')
                                        vlrequ = projeto.vlrequ
                                        vlrkit = projeto.vlrkit
                                   }
                              }
                              //console.log('vlrequ=>' + vlrequ)
                              //console.log('vlrkit=>' + vlrkit)

                              //Definie os valores dos detalhes de custo dos equipamentos do projeto

                              detalhe.vlrTotal = vlrequ
                              detalhe.checkUni = checkUni
                              detalhe.unidadeEqu = unidadeEqu
                              detalhe.unidadeMod = unidadeMod
                              detalhe.unidadeInv = unidadeInv
                              detalhe.unidadeEst = unidadeEst
                              detalhe.unidadeCim = unidadeCim
                              detalhe.unidadeCab = unidadeCab
                              detalhe.unidadeEbt = unidadeEbt
                              detalhe.unidadeDisCC = unidadeDisCC
                              detalhe.unidadeDPSCC = unidadeDPSCC
                              detalhe.unidadeDisCA = unidadeDisCA
                              detalhe.unidadeDPSCA = unidadeDPSCA
                              detalhe.unidadeSB = unidadeSB
                              detalhe.unidadeCCA = unidadeCCA
                              detalhe.unidadeOcp = unidadeOcp
                              detalhe.unidadeCer = unidadeCer
                              detalhe.unidadeCen = unidadeCen
                              detalhe.unidadePos = unidadePos
                              detalhe.vlrUniEqu = vlrUniEqu
                              detalhe.vlrUniMod = vlrUniMod
                              detalhe.vlrUniInv = vlrUniInv
                              detalhe.vlrUniEst = vlrUniEst
                              detalhe.vlrUniCim = vlrUniCim
                              detalhe.vlrUniCab = vlrUniCab
                              detalhe.vlrUniEbt = vlrUniEbt
                              detalhe.vlrUniDisCC = vlrUniDisCC
                              detalhe.vlrUniDPSCC = vlrUniDPSCC
                              detalhe.vlrUniDisCA = vlrUniDisCA
                              detalhe.vlrUniDPSCA = vlrUniDPSCA
                              detalhe.vlrUniSB = vlrUniSB
                              detalhe.vlrUniCCA = vlrUniCCA
                              detalhe.vlrUniOcp = vlrUniOcp
                              detalhe.vlrUniCer = vlrUniCer
                              detalhe.vlrUniCen = vlrUniCen
                              detalhe.vlrUniPos = vlrUniPos
                              detalhe.valorEqu = valorEqu
                              detalhe.valorMod = valorMod
                              detalhe.valorInv = valorInv
                              detalhe.valorEst = valorEst
                              detalhe.valorCim = valorCim
                              detalhe.valorCab = valorCab
                              detalhe.valorEbt = valorEbt
                              detalhe.valorDisCC = valorDisCC
                              detalhe.valorDPSCC = valorDPSCC
                              detalhe.valorDisCA = valorDisCA
                              detalhe.valorDPSCA = valorDPSCA
                              detalhe.valorSB = valorSB
                              detalhe.valorCCA = valorCCA
                              detalhe.valorOcp = valorOcp
                              detalhe.valorCer = valorCer
                              detalhe.valorCen = valorCen
                              detalhe.valorPos = valorPos

                              detalhe.save().then(() => {
                                   sucesso = 'Detalhes salvos com sucesso. '
                              }).catch(() => {
                                   req.flash('error_msg', 'Houve um erro ao salvar os detalhes do projeto')
                                   res.redirect('/projeto/consulta')
                              })

                              //------------------------------------------------------------------
                              //---------Validação da data de entrega do projeto----------------//
                              var ano
                              var mes
                              var dia
                              var datavis
                              var dataprev
                              if (projeto.valDataPrev != req.body.valDataPrev) {
                                   //console.log('req.body.checkDatPrev=>' + req.body.checkDatPrev)
                                   //console.log('req.body.motivo=>' + req.body.motivo)
                                   if (typeof req.body.checkDatPrev == 'undefined') {
                                        erros = 'Para alterar a data prevista de entrega do projeto deve-se marcar o checkbox ALTERAR. '
                                   } else {
                                        //console.log('req.body.motivo=>' + req.body.motivo)
                                        if (req.body.motivo != '') {
                                             //console.log('tem motivo')
                                             //console.log('cronograma.datevis=>' + cronograma.datevis)
                                             //---Validando datas para comparação----//
                                             if (cronograma.datevis != '' && typeof cronograma.datevis != 'undefined') {
                                                  datavis = cronograma.datevis
                                                  ano = datavis.substring(0, 4)
                                                  mes = datavis.substring(5, 7)
                                                  dia = datavis.substring(8, 11)
                                                  datavis = ano + mes + dia
                                             } else {
                                                  datavis = req.body.dataprev
                                             }

                                             dataprev = req.body.valDataPrev
                                             ano = dataprev.substring(0, 4)
                                             mes = dataprev.substring(5, 7)
                                             dia = dataprev.substring(8, 11)
                                             dataprev = ano + mes + dia
                                             console.log('dataprev=>' + dataprev)
                                             //---Validando datas para comparação----//

                                             if (parseFloat(datavis) <= parseFloat(dataprev) && req.body.dataprev != '') {
                                                  //console.log('req.body.dataprev=>' + req.body.dataprev)
                                                  projeto.motivo = req.body.motivo
                                                  projeto.dataprev = req.body.dataprev
                                                  projeto.valDataPrev = req.body.valDataPrev
                                                  projeto.ultdat = projeto.dataprev
                                                  projeto.dataord = dataprev
                                                  cronograma.dateentrega = req.body.valDataPrev
                                                  //console.log('A data de entrega foi alterada.')
                                             } else {
                                                  erros = erros + 'A data de entrega do projeto deve ser maior que a data de finalização da vistoria. '
                                             }
                                        } else {
                                             erros = erros + 'Para alterar a data prevista de entrega do projeto deve-se discriminar um motivo. '
                                        }

                                   }

                              }

                              //---------Validação da data de entrega do projeto----------------//


                              //Alterar data de Início da Instalação
                              projeto.dataIns = req.body.datains
                              projeto.valDataIns = req.body.valDataIns
                              //Altera o vendedor                          
                              var percom
                              var vendedor
                              if (req.body.checkVendedor != null) {
                                   vendedor = req.body.vendedor
                                   percom = prj_vendedor.percom
                              } else {
                                   vendedor = projeto.vendedor
                                   percom = projeto.percom
                              }
                              console.log('vendedor=>'+vendedor)
                              console.log('percom=>'+percom)
                              //Altera a empresa 
                              console.log('checkEmpresa=>'+req.body.checkEmpresa)                         
                              if (req.body.checkEmpresa != null) {
                                   projeto.empresa = req.body.empresa
                              }

                              var vlrNFS = 0
                              if (projeto.fatequ == true) {
                                   vlrNFS = (parseFloat(req.body.valor)).toFixed(2)
                              } else {
                                   vlrNFS = (parseFloat(req.body.valor) - parseFloat(vlrkit)).toFixed(2)
                              }

                              if (req.body.checkLocal != null && req.body.uf != '' && req.body.cidade != '') {
                                   if (req.body.uf != projeto.uf && req.body.uf != projeto.cidade) {
                                        projeto.uf = req.body.uf
                                        projeto.cidade = req.body.cidade
                                   }
                              }
                              if (req.body.valor != projeto.valor || req.body.vlrequ != projeto.vlrequ) {
                                   aviso = 'Aplique as alterações na aba de gerenciamento e de tributos para recalcular o valor da nota de serviço e valor dos tributos estimados.'
                                   //Validando o markup
                              }

                              if (req.body.valor != projeto.valor) {
                                   projeto.markup = (((parseFloat(req.body.valor) - parseFloat(vlrkit) - parseFloat(projeto.custoPlano) - parseFloat(projeto.desAdm) + parseFloat(projeto.reserva)) / parseFloat(req.body.valor)) * 100).toFixed(4)
                              }


                              projeto.valor = req.body.valor
                              projeto.vlrnormal = req.body.valor
                              projeto.vlrequ = vlrequ
                              projeto.vlrkit = vlrkit
                              projeto.vlrNFS = vlrNFS
                              projeto.potencia = req.body.potencia
                              projeto.vendedor = vendedor
                              projeto.percom = percom
                              projeto.temCercamento = cercamento
                              projeto.temCentral = central
                              projeto.temPosteCond = poste
                              projeto.temEstSolo = estsolo
                              projeto.temArmazenamento = armazenamento
                              projeto.temPainel = painel

                              projeto.save().then(() => {
                                   cronograma.save().then(() => {
                                        sucesso = sucesso + 'Projeto salvo com sucesso.'
                                        req.flash('error_msg', erros)
                                        req.flash('success_msg', sucesso)
                                        req.flash('aviso', aviso)
                                        res.redirect(redirect)
                                   }).catch(() => {
                                        req.flash('error_msg', 'Não foi possível salvar o cronorgrama.')
                                        res.redirect('/menu')
                                   })
                              }).catch(() => {
                                   req.flash('error_msg', 'Não foi possível salvar o projeto.')
                                   res.redirect('/menu')
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Houve uma falha ao encontrar o cronograma do projeto.')
                              res.redirect('/configuracao/consulta')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao encontrar os detalhes do projeto.')
                         res.redirect('/configuracao/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Não foi possivel encontrar um vendedor.')
                    res.redirect('/menu')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Não foi possivel encontrar o projeto.')
               res.redirect('/menu')
          })
     }
})

router.post('/direto', ehAdmin, (req, res) => {
     const { _id } = req.user
     var redirect
     var erros = ''
     var fatequ

     if (req.body.vlrart == '' || req.body.vlrart == 0) {
          erros = erros + 'Prencheer valor de custo da ART. ' + '\n'
     }
     if (req.body.totint == '' || req.body.totint == 0) {
          erros = erros + 'Prencheer valor de custo do instalador. ' + '\n'
     }
     if (req.body.totpro == '' || req.body.totpro == 0) {
          erros = erros + 'Prencheer valor de custo do projetista. ' + '\n'
     }
     /*
     if (req.body.equipe == '' || req.body.equipe == 0) {
          erros = erros + 'Deve ter no mínimo 3 instaladores registrado para o projeto. '
     }
     */

     if (erros != '') {
          redirect = '/projeto/direto/' + req.body.id
          req.flash('error_msg', erros)
          res.redirect(redirect)
     } else {

          Projeto.findOne({ _id: req.body.id }).then((projeto) => {
               Cronograma.findOne({ projeto: projeto._id }).then((cronograma) => {
                    Detalhado.findOne({ projeto: req.body.id }).then((detalhe) => {
                         Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                              Empresa.findOne({ _id: projeto.empresa }).lean().then((empresa_prj) => {
                                   Configuracao.findOne({ _id: projeto.configuracao }).then((config) => {
                                        //console.log('entrou')
                                        //Valida informações para o cálculo dos impostos e lucros
                                        //--> cálculo automático dos dias de obra
                                        projeto.nomecliente = cliente.nome
                                        //projeto.qtdequipe = req.body.equipe
                                        /*
                                        if (req.body.diastr == '' || req.body.diastr == 0) {
                                             //console.log('dias de obra igual a zero')
                                             if (projeto.qtdequipe != '' && projeto.qtdequipe > 0) {
                                                  var hrsequ = (parseFloat(projeto.qtdequipe) - 1) * 6
                                                  if (req.body.trbint != '' && req.body.trbint > 0) {
                                                       //projeto.qtdequipe = req.body.equipe
                                                       var dias = Math.round(parseFloat(req.body.trbint) / parseFloat(hrsequ))
                                                       if (dias == 0) { dias = 1 }
                                                       //console.log('dias=>' + dis)
                                                       projeto.diastr = dias
                                                  }
                                             }
                                        } else {
                                             //console.log('dias de obra preenchido=>' + req.body.diastr)
                                             projeto.diastr = req.body.diastr
                                        }
                                        */
                                        //var vlrDAS = empresa.vlrDAS

                                        if (projeto.qtinds == '' || typeof projeto.qtinds == 'undefined' || isNaN(projeto.qtdins)) {
                                             projeto.qtdins = 2
                                        }

                                        //--> cálculo das horas totais trabalhadas a partir de lançamento manual
                                        var conhrs = 8
                                        var trbint = req.body.trbint
                                        if (trbint == '' || typeof trbint == 'undefined' || isNaN(trbint)) {
                                             trbint = 0
                                        }
                                        var trbpro = req.body.trbpro
                                        if (trbpro == '' || typeof trbpro == 'undefined' || isNaN(trbpro)) {
                                             trbpro = 0
                                        }
                                        var trbges = req.body.trbges
                                        if (trbint == '' || typeof trbint == 'undefined' || isNaN(trbint)) {
                                             trbges = 0
                                        }
                                        var tipoCustoIns
                                        var tempoTotal = parseFloat(trbint) + parseFloat(trbpro) + parseFloat(trbges)
                                        //console.log('tempoTotal=>' + tempoTotal)
                                        //console.log('req.body.lancaHora=>' + req.body.lancaHora)
                                        if (req.body.lancaHora != null) {
                                             tipoCustoIns = 'hora'
                                             projeto.diastr = Math.round(parseFloat(tempoTotal) / conhrs)
                                             projeto.tothrs = Math.round(tempoTotal)
                                             //console.log('config.hrstrb=>' + config.hrstrb)
                                             projeto.diasObra = Math.round(parseFloat(trbint) / parseFloat(config.hrstrb))
                                             projeto.diasGes = (parseFloat(trbges) / parseFloat(config.hrstrb))
                                             projeto.diasPro = Math.round(parseFloat(trbpro) / parseFloat(config.hrstrb), -1)
                                             projeto.diasGes = Math.round(parseFloat(trbges) / parseFloat(config.hrstrb), -1)
                                             projeto.diasIns = Math.round(parseFloat(trbint) / parseFloat(config.hrstrb), -1)
                                        } else {
                                             tipoCustoIns = 'dia'
                                             projeto.diastr = tempoTotal
                                             projeto.tothrs = Math.round(parseFloat(tempoTotal) * conhrs)
                                             projeto.diasObra = trbint
                                             projeto.diasGes = trbges
                                             projeto.diasPro = trbpro
                                             projeto.diasIns = trbint
                                        }
                                        projeto.tipoCustoIns = tipoCustoIns
                                        projeto.trbges = trbges
                                        projeto.trbpro = trbpro
                                        projeto.trbint = trbint


                                        var plafim
                                        var prjfim
                                        var ateini
                                        var atefim
                                        var invini
                                        var invfim
                                        var stbini
                                        var stbfim
                                        var estini
                                        var estfim
                                        var eaeini
                                        var eaefim
                                        var pnlini
                                        var pnlfim
                                        var valplafim
                                        var valprjfim
                                        var aux
                                        if (tipoCustoIns == 'hora') {
                                             if (cronograma.dateplafim == '' || typeof cronograma.dateplafim == 'undefined' || isNaN(cronograma.dateplafim)) {
                                                  plafim = Math.trunc(trbges / conhrs)
                                                  valplafim = setData(projeto.valDataIni, plafim)
                                                  cronograma.dateplafim = valplafim
                                             }
                                             //console.log('plafim=>'+plafim)
                                             //console.log('valplafim=>'+valplafim)
                                             if (cronograma.dateprjini == '' || typeof cronograma.dateprjini == 'undefined' || isNaN(cronograma.dateprjini)) {
                                                  if ((parseFloat(trbges) + parseFloat(trbpro)) > 8) {
                                                       prjfim = Math.round((trbpro / conhrs), -1)
                                                  } else {
                                                       prjfim = Math.trunc(trbpro / conhrs)
                                                  }
                                                  //console.log('prjfim=>'+prjfim)
                                                  cronograma.dateprjini = valplafim
                                                  valprjfim = setData(valplafim, prjfim)
                                                  //console.log('valprjfim=>'+valprjfim)
                                                  if (cronograma.dateprjfim == '' || typeof cronograma.dateprjfim == 'undefined' || isNaN(cronograma.dateprjfim)) {
                                                       cronograma.dateprjfim = valprjfim
                                                  }
                                             }
                                        } else {
                                             if (cronograma.dateplafim == '' || typeof cronograma.dateplafim == 'undefined' || isNaN(cronograma.dateplafim)) {
                                                  if (trbges > 1) {
                                                       plafim = parseFloat(trbges) - 1
                                                  } else {
                                                       plafim = 0
                                                  }
                                                  //console.log('plafim=>'+plafim)
                                                  valplafim = setData(projeto.valDataIni, plafim)
                                                  cronograma.dateplafim = valplafim
                                             }
                                             if (cronograma.dateprjini == '' || typeof cronograma.dateprjini == 'undefined' || isNaN(cronograma.dateprjini)) {
                                                  if ((parseFloat(trbges) + parseFloat(trbpro)) > 1) {
                                                       aux = Math.trunc(parseFloat(trbges) + parseFloat(trbpro))
                                                       if ((parseFloat(trbges) + parseFloat(trbpro) >= aux)) {
                                                            prjfim = trbpro - 1
                                                       } else {
                                                            prjfim = trbpro
                                                       }
                                                  } else {
                                                       prjfim = 0
                                                  }
                                                  //console.log('prjfim=>'+prjfim)
                                                  cronograma.dateprjini = valplafim
                                                  valprjfim = setData(valplafim, prjfim)
                                                  if (cronograma.dateprjfim == '' || typeof cronograma.dateprjfim == 'undefined' || isNaN(cronograma.dateprjfim)) {
                                                       cronograma.dateprjfim = valprjfim
                                                  }
                                             }
                                        }
                                        //console.log('valplafim=>'+valplafim)
                                        //console.log('valprjfim=>'+valprjfim)
                                        if (cronograma.dateateini == '' || typeof cronograma.dateateini == 'undefined' || isNaN(cronograma.dateateini)) {
                                             ateini = setData(valprjfim, 1)
                                             cronograma.dateateini = ateini
                                             atefim = setData(ateini, 1)
                                             cronograma.dateatefim = atefim
                                             //console.log('atefim=>'+atefim)
                                        }

                                        if (cronograma.dateinvini == '' || typeof cronograma.dateinvini == 'undefined' || isNaN(cronograma.dateinvini)) {
                                             invini = setData(valprjfim, 1)
                                             cronograma.dateinvini = invini
                                             invfim = setData(invini, 1)
                                             cronograma.dateinvfim = invfim
                                             //console.log('invfim=>'+invfim)
                                        }
                                        if (cronograma.datestbini == '' || typeof cronograma.datestbini == 'undefined' || isNaN(cronograma.datestbini)) {
                                             stbini = setData(valprjfim, 1)
                                             cronograma.datestbini = stbini
                                             stbfim = setData(stbini, 1)
                                             cronograma.datestbfim = stbfim
                                             //console.log('stbfim=>'+stbfim)
                                        }
                                        if (projeto.temArmazenamento == 'checked' && ((cronograma.dateeaeini == '' || typeof cronograma.dateeaeini == 'undefined' || isNaN(cronograma.dateeaeini)))) {
                                             //console.log('tem armazenamento')
                                             eaeini = setData(valprjfim, 1)
                                             cronograma.dateeaeini = eaeini
                                             eaefim = setData(eaeini, 1)
                                             cronograma.dateeaefim = eaefim
                                             //console.log('eaefim=>'+eaefim)
                                        }
                                        if (projeto.temPainel == 'checked' && (cronograma.datepnlini == '' || typeof cronograma.dateini == 'undefined' || isNaN(cronograma.datepnlini))) {
                                             //console.log('tem painel')
                                             pnlini = setData(valprjfim, 1)
                                             cronograma.datepnlini = pnlini
                                             pnlfim = setData(eaeini, 1)
                                             cronograma.datepnlfim = pnlfim
                                             //console.log('pnlfim=>'+pnlfim)
                                        }
                                        if (cronograma.dateestini == '' || typeof cronograma.dateestini == 'undefined' || isNaN(cronograma.dateestini)) {
                                             estini = setData(valprjfim, 1)
                                             cronograma.dateestini = estini
                                             estfim = setData(estini, 1)
                                             cronograma.dateestfim = estfim
                                             //console.log('estfim=>'+estfim)
                                        }
                                        if (cronograma.datemodini == '' || typeof cronograma.datemodini == 'undefined' || isNaN(cronograma.datemodini)) {
                                             modini = estfim
                                             cronograma.datemodini = modini
                                             modfim = setData(modini, projeto.diasIns)
                                             cronograma.datemodfim = modfim
                                             //console.log('modfim=>'+modfim)
                                        }

                                        //------------------------------
                                        /*
                                        //ALTERANDO AS FUNÇÕES DE RESPONSÁVEIS
                                        if (req.body.pinome == '') {
                                             projeto.funins = req.body.funins
                                        }
                                        if (req.body.checkIns != null) {
                                             projeto.funins = req.body.funins
                                        }
                                        //}
                                        if (req.body.ppnome == '') {
                                             projeto.funpro = req.body.funpro
                                        }
                                        if (req.body.checkPro != null) {
                                             projeto.funpro = req.body.funpro
                                        }
                                        //}
                                        */
                                        //-----------------------------------
                                        //--> validação das informações de custos e de reservas
                                        var resger = req.body.resger
                                        var conadd = req.body.conadd
                                        var impele = req.body.impele
                                        var seguro = req.body.seguro

                                        var outcer = req.body.outcer
                                        var outpos = req.body.outpos

                                        var totint = req.body.totint
                                        var totpro = req.body.totpro
                                        var totges = req.body.totges
                                        var totali = req.body.totali
                                        var totdes = req.body.totdes

                                        //--> se for vazio salva zero(0)
                                        if (req.body.resger == '') {
                                             resger = 0
                                        }
                                        if (req.body.conadd == '') {
                                             conadd = 0
                                        }
                                        if (req.body.impele == '') {
                                             impele = 0
                                        }
                                        if (req.body.seguro == '') {
                                             seguro = 0
                                        }
                                        if (req.body.outcer == '') {
                                             outcer = 0
                                        }
                                        if (req.body.outpos == '') {
                                             outpos = 0
                                        }
                                        if (req.body.totali == '') {
                                             totali = 0
                                        }
                                        if (req.body.totint == '') {
                                             totint = 0
                                        }
                                        if (req.body.totpro == '') {
                                             totpro = 0
                                        }
                                        if (req.body.totges == '') {
                                             totges = 0
                                        }
                                        if (req.body.totdes == '') {
                                             totdes = 0
                                        }

                                        projeto.resger = resger
                                        projeto.conadd = conadd
                                        projeto.impele = impele
                                        projeto.seguro = seguro

                                        projeto.outcer = outcer
                                        projeto.outpos = outpos

                                        projeto.totali = totali
                                        projeto.totint = totint

                                        var vlrart
                                        vlrart = req.body.vlrart
                                        projeto.vlrart = vlrart
                                        projeto.totpro = parseFloat(totpro)

                                        projeto.totges = totges
                                        projeto.totdes = totdes

                                        var custoFix = parseFloat(totint) + parseFloat(totpro) + parseFloat(vlrart) + parseFloat(totges)
                                        var custoVar = parseFloat(totdes) + parseFloat(totali)
                                        var custoEst = parseFloat(detalhe.valorCer) + parseFloat(detalhe.valorPos) + parseFloat(detalhe.valorCen)
                                        var totcop = parseFloat(custoFix) + parseFloat(custoVar) + parseFloat(custoEst)

                                        //console.log('totint=>' + totint)
                                        //console.log('totpro=>' + totpro)
                                        //console.log('totges=>' + totges)
                                        //console.log('totali=>' + totali)
                                        //console.log('detalhe.valorOcp=>' + detalhe.valorOcp)
                                        //console.log('detalhe.valorCer=>' + detalhe.valorCer)
                                        //console.log('detalhe.valorPos=>' + detalhe.valorPos)
                                        projeto.custofix = custoFix.toFixed(2)
                                        projeto.custovar = custoVar.toFixed(2)
                                        projeto.custoest = custoEst.toFixed(2)
                                        projeto.totcop = totcop.toFixed(2)

                                        var rescon = parseFloat(impele) + parseFloat(seguro) + parseFloat(outcer) + parseFloat(outpos)
                                        rescon = parseFloat(rescon) + parseFloat(conadd)
                                        projeto.rescon = rescon.toFixed(2)

                                        var reserva = parseFloat(resger) + parseFloat(rescon)
                                        projeto.reserva = reserva.toFixed(2)

                                        var custoPlano = parseFloat(totcop) + parseFloat(reserva)
                                        projeto.custoPlano = custoPlano.toFixed(2)

                                        var custoTotal = parseFloat(custoPlano) + parseFloat(projeto.vlrkit)
                                        projeto.custoTotal = custoTotal.toFixed(2)

                                        var desAdm = 0
                                        if (parseFloat(empresa_prj.desadm) > 0) {
                                             if (empresa_prj.tipodesp == 'Percentual') {
                                                  desAdm = (parseFloat(empresa_prj.desadm) * (parseFloat(empresa_prj.perdes) / 100)).toFixed(2)
                                             } else {
                                                  desAdm = ((parseFloat(empresa_prj.desadm) / parseFloat(empresa_prj.estkwp)) * parseFloat(projeto.potencia)).toFixed(2)
                                             }
                                        }                                       

                                        //console.log('custoTotal=>'+custoTotal)
                                        //Definindo o imposto ISS
                                        //console.log('empresa_prj.alqNFS=>' + empresa_prj.alqNFS)
                                        var vlrNFS = 0
                                        var impNFS = 0
                                        var vlrMarkup = 0
                                        var prjValor = 0
                                        if (req.body.markup == '' || req.body.markup == 0) {
                                             //console.log('markup igual a zero')
                                             //console.log('projeto.vlrnormal=>'+projeto.vlrnormal)
                                             if (req.body.checkFatura != null) {
                                                  fatequ = true
                                                  vlrNFS = parseFloat(projeto.vlrnormal).toFixed(2)
                                                  impNFS = 0
                                             } else {
                                                  fatequ = false
                                                  vlrNFS = (parseFloat(projeto.vlrnormal) - parseFloat(projeto.vlrkit)).toFixed(2)
                                                  impNFS = (parseFloat(vlrNFS) * (parseFloat(empresa_prj.alqNFS) / 100)).toFixed(2)
                                             }
                                             vlrMarkup = ((parseFloat(custoTotal) + parseFloat(desAdm) - parseFloat(reserva)) / (1 -(parseFloat(req.body.markup))/ 100)).toFixed(2)
                                             projeto.valor = parseFloat(vlrMarkup).toFixed(2)
                                             projeto.markup = config.markup
                                             prjValor = vlrMarkup
                                        } else {
                                             //console.log('custoTotal=>'+custoTotal)
                                             //console.log('req.body.markup=>'+req.body.markup)
                                             vlrMarkup = ((parseFloat(custoTotal) + parseFloat(desAdm) - parseFloat(reserva)) / (1 -(parseFloat(req.body.markup))/100)).toFixed(2)
                                             //console.log('vlrMarkup=>' + vlrMarkup)
                                             if (req.body.checkFatura != null) {
                                                  fatequ = true
                                                  vlrNFS = parseFloat(vlrMarkup).toFixed(2)
                                                  impNFS = 0
                                             } else {
                                                  fatequ = false
                                                  vlrNFS = (parseFloat(vlrMarkup) - parseFloat(projeto.vlrkit)).toFixed(2)
                                                  impNFS = (parseFloat(vlrNFS) * (parseFloat(empresa_prj.alqNFS) / 100)).toFixed(2)
                                             }
                                             projeto.markup = req.body.markup
                                             projeto.valor = vlrMarkup
                                             prjValor = parseFloat(vlrMarkup).toFixed(2)
                                        }
                                        //kWp médio
                                        projeto.vrskwp = (parseFloat(prjValor) / parseFloat(projeto.potencia)).toFixed(2)
                                        projeto.fatequ = fatequ

                                        var vlrcom = 0
                                        //Validando a comissão
                                        //console.log('projeto.percom=>'+projeto.percom)
                                        if (projeto.percom != null) {
                                             vlrcom = parseFloat(vlrNFS) * (parseFloat(projeto.percom) / 100)
                                             projeto.vlrcom = vlrcom.toFixed(2)
                                        }
                                        //console.log('prjValor=>'+prjValor)
                                        //console.log('vlrcom=>'+vlrcom)
                                        //console.log('impNFS=>' + impNFS)
                                        //console.log('vlrNFS=>'+vlrNFS)
                                        //console.log('totcop=>' + totcop)
                                        //console.log('reserva=>' + reserva)
                                        //console.log('custoPlano=>' + custoPlano)
                                        //console.log('custoTotal=>' + custoTotal)                              
                                        //console.log('projeto.vlrkit=>'+projeto.vlrkit)

                                        projeto.vlrNFS = parseFloat(vlrNFS).toFixed(2)
                                        projeto.impNFS = parseFloat(impNFS).toFixed(2)
                                        //console.log('savlou imposto NFS')

                                        //Definindo o Lucro Bruto
                                        var recLiquida = 0
                                        var lucroBruto = 0
                                        recLiquida = parseFloat(prjValor) - parseFloat(impNFS)
                                        //console.log('recLiquida=>'+recLiquida)
                                        projeto.recLiquida = parseFloat(recLiquida).toFixed(2)
                                        lucroBruto = parseFloat(recLiquida) - parseFloat(projeto.vlrkit)
                                        projeto.lucroBruto = parseFloat(lucroBruto).toFixed(2)
                                        //console.log('lucroBruto=>'+lucroBruto)

                                        var lbaimp = 0
                                        if (parseFloat(empresa_prj.desadm) > 0) {
                                             lbaimp = parseFloat(lucroBruto) - parseFloat(custoPlano) - parseFloat(desAdm)
                                             projeto.desAdm = parseFloat(desAdm).toFixed(2)
                                        } else {
                                             lbaimp = parseFloat(lbaimp) - parseFloat(custoPlano)
                                             projeto.desAdm = 0
                                        }
                                        //Deduzindo as comissões do Lucro Antes dos Impostos
                                        if (vlrcom == 0 || vlrcom == '') {
                                             lbaimp = parseFloat(lbaimp)
                                        } else {
                                             lbaimp = parseFloat(lbaimp) - parseFloat(vlrcom)
                                        }
                                        projeto.lbaimp = parseFloat(lbaimp).toFixed(2)
                                        //console.log('lbaimp=>' + lbaimp)

                                        var fatadd
                                        var fataju
                                        var aux
                                        var prjLR = empresa_prj.prjLR
                                        var prjLP = empresa_prj.prjLP
                                        var prjFat = empresa_prj.prjFat

                                        var totalSimples
                                        var impostoIRPJ
                                        var impostoIRPJAdd
                                        var impostoPIS
                                        var impostoCOFINS
                                        var totalImposto

                                        if (empresa_prj.regime == 'Simples') {
                                             //console.log('entrou simples')
                                             var alqEfe = ((parseFloat(prjFat) * (parseFloat(empresa_prj.alqDAS) / 100)) - (parseFloat(empresa_prj.vlrred))) / parseFloat(prjFat)
                                             totalSimples = parseFloat(vlrNFS) * (parseFloat(alqEfe))
                                             //console.log('totalSimples=>' + totalSimples)
                                             totalImposto = parseFloat(totalSimples).toFixed(2)
                                             //console.log('totalImposto=>' + totalImposto)
                                             projeto.impostoSimples = parseFloat(totalImposto).toFixed(2)
                                        }

                                        else {
                                             if (empresa_prj.regime == 'Lucro Real') {
                                                  //Imposto Adicional de IRPJ
                                                  if ((parseFloat(prjLR) / 12) > 20000) {
                                                       fatadd = (parseFloat(prjLR) / 12) - 20000
                                                       //console.log('fatadd=>' + fatadd)
                                                       fataju = parseFloat(fatadd) * (parseFloat(empresa_prj.alqIRPJAdd) / 100)
                                                       //console.log('fataju=>' + fataju)
                                                       aux = parseFloat(fatadd) / parseFloat(lbaimp)
                                                       //console.log('aux=>' + aux)
                                                       impostoIRPJAdd = parseFloat(fataju) / parseFloat(aux)
                                                       //console.log('impostoIRPJAdd=>' + impostoIRPJAdd)
                                                       projeto.impostoAdd = impostoIRPJAdd.toFixed(2)
                                                  }

                                                  impostoIRPJ = parseFloat(lbaimp) * (parseFloat(empresa_prj.alqIRPJ) / 100)
                                                  projeto.impostoIRPJ = impostoIRPJ.toFixed(2)

                                                  impostoCSLL = parseFloat(lbaimp) * (parseFloat(empresa_prj.alqCSLL) / 100)
                                                  projeto.impostoCSLL = impostoCSLL.toFixed(2)
                                                  impostoPIS = parseFloat(vlrNFS) * 0.5 * (parseFloat(empresa_prj.alqPIS) / 100)
                                                  projeto.impostoPIS = impostoPIS.toFixed(2)
                                                  impostoCOFINS = parseFloat(vlrNFS) * 0.5 * (parseFloat(empresa_prj.alqCOFINS) / 100)
                                                  projeto.impostoCOFINS = impostoCOFINS.toFixed(2)
                                                  if (parseFloat(impostoIRPJAdd) > 0) {
                                                       totalImposto = parseFloat(impostoIRPJ) + parseFloat(impostoIRPJAdd) + parseFloat(impostoCSLL) + parseFloat(impostoPIS) + parseFloat(impostoCOFINS)
                                                  } else {
                                                       totalImposto = parseFloat(impostoIRPJ) + parseFloat(impostoCSLL) + parseFloat(impostoPIS) + parseFloat(impostoCOFINS)
                                                  }
                                                  //console.log('IRPJ=>' + impostoIRPJ)
                                                  //console.log('CSLL=>' + impostoCSLL)
                                                  //console.log('COFINS=>' + impostoCOFINS)
                                                  //console.log('PIS=>' + impostoPIS)

                                             } else {
                                                  //Imposto adicional de IRPJ
                                                  if (((parseFloat(prjLP) * 0.32) / 3) > 20000) {
                                                       fatadd = ((parseFloat(prjLP) * 0.32) / 3) - 20000
                                                       fataju = parseFloat(fatadd) / 20000
                                                       impostoIRPJAdd = (parseFloat(vlrNFS) * 0.32) * (parseFloat(fataju) / 100) * (parseFloat(empresa_prj.alqIRPJAdd) / 100)
                                                       projeto.impostoAdd = impostoIRPJAdd.toFixed(2)
                                                  }
                                                  //console.log('Lucro Presumido')

                                                  impostoIRPJ = parseFloat(vlrNFS) * 0.32 * (parseFloat(empresa_prj.alqIRPJ) / 100)
                                                  projeto.impostoIRPJ = impostoIRPJ.toFixed(2)
                                                  //console.log('IRPJ=>' + impostoIRPJ)
                                                  impostoCSLL = parseFloat(vlrNFS) * 0.32 * (parseFloat(empresa_prj.alqCSLL) / 100)
                                                  projeto.impostoCSLL = impostoCSLL.toFixed(2)
                                                  //console.log('CSLL=>' + impostoCSLL)
                                                  impostoCOFINS = parseFloat(vlrNFS) * (parseFloat(empresa_prj.alqCOFINS) / 100)
                                                  projeto.impostoCOFINS = impostoCOFINS.toFixed(2)
                                                  //console.log('COFINS=>' + impostoCOFINS)
                                                  impostoPIS = parseFloat(vlrNFS) * (parseFloat(empresa_prj.alqPIS) / 100)
                                                  projeto.impostoPIS = impostoPIS.toFixed(2)
                                                  //console.log('PIS=>' + impostoPIS)
                                                  if (parseFloat(impostoIRPJAdd) > 0) {
                                                       totalImposto = parseFloat(impostoIRPJ) + parseFloat(impostoIRPJAdd) + parseFloat(impostoCSLL) + parseFloat(impostoPIS) + parseFloat(impostoCOFINS)
                                                  } else {
                                                       totalImposto = parseFloat(impostoIRPJ) + parseFloat(impostoCSLL) + parseFloat(impostoPIS) + parseFloat(impostoCOFINS)
                                                  }
                                             }
                                        }

                                        //Validar ICMS
                                        var impostoICMS
                                        if (req.body.checkFatura != null) {
                                             if (empresa_prj.alqICMS != null) {
                                                  impostoICMS = (parseFloat(prjValor)) * (parseFloat(empresa_prj.alqICMS) / 100)
                                                  totalTributos = parseFloat(totalImposto) + parseFloat(impNFS) + parseFloat(impostoICMS)
                                                  totalImposto = parseFloat(totalImposto) + parseFloat(impostoICMS)
                                             }
                                        } else {
                                             impostoICMS = 0
                                             totalTributos = parseFloat(totalImposto) + parseFloat(impNFS)
                                        }
                                        projeto.impostoICMS = impostoICMS.toFixed(2)

                                        //console.log('totalImposto=>' + totalImposto)
                                        projeto.totalImposto = parseFloat(totalImposto).toFixed(2)
                                        //console.log('totalTributos=>' + totalTributos)
                                        projeto.totalTributos = parseFloat(totalTributos).toFixed(2)

                                        //Lucro Líquido descontados os impostos
                                        var lucroLiquido = 0
                                        lucroLiquido = parseFloat(lbaimp) - parseFloat(totalImposto)
                                        projeto.lucroLiquido = parseFloat(lucroLiquido).toFixed(2)
                                        //console.log('lucroLiquido=>' + lucroLiquido)

                                        //Dashboard              
                                        //Participação dos componentes
                                        //Kit
                                        var parKitEqu = parseFloat(detalhe.valorEqu) / parseFloat(detalhe.vlrTotal) * 100
                                        projeto.parKitEqu = parseFloat(parKitEqu).toFixed(2)
                                        //Módulos
                                        var parModEqu = parseFloat(detalhe.valorMod) / parseFloat(detalhe.vlrTotal) * 100
                                        projeto.parModEqu = parseFloat(parModEqu).toFixed(2)
                                        //Inversor
                                        var parInvEqu = parseFloat(detalhe.valorInv) / parseFloat(detalhe.vlrTotal) * 100
                                        projeto.parInvEqu = parseFloat(parInvEqu).toFixed(2)
                                        //Estrutura
                                        var parEstEqu = (parseFloat(detalhe.valorEst) + parseFloat(detalhe.valorCim)) / parseFloat(detalhe.vlrTotal) * 100
                                        projeto.parEstEqu = parseFloat(parEstEqu).toFixed(2)
                                        //Cabos
                                        var parCabEqu = parseFloat(detalhe.valorCab) / parseFloat(detalhe.vlrTotal) * 100
                                        projeto.parCabEqu = parseFloat(parCabEqu).toFixed(2)
                                        //Armazenagem
                                        var parEbtEqu = parseFloat(detalhe.valorEbt) / parseFloat(detalhe.vlrTotal) * 100
                                        projeto.parEbtEqu = parseFloat(parEbtEqu).toFixed(2)
                                        //DPS CC + CA
                                        var parDpsEqu = (parseFloat(detalhe.valorDPSCC) + parseFloat(detalhe.valorDPSCA)) / parseFloat(detalhe.vlrTotal) * 100
                                        projeto.parDpsEqu = parseFloat(parDpsEqu).toFixed(2)
                                        //Disjuntores CC + CA
                                        var parDisEqu = (parseFloat(detalhe.valorDisCC) + parseFloat(detalhe.valorDisCA)) / parseFloat(detalhe.vlrTotal) * 100
                                        projeto.parDisEqu = parseFloat(parDisEqu).toFixed(2)
                                        //StringBox
                                        var parSbxEqu = parseFloat(detalhe.valorSB) / parseFloat(detalhe.vlrTotal) * 100
                                        projeto.parSbxEqu = parseFloat(parSbxEqu).toFixed(2)
                                        //Cercamento
                                        var parCerEqu = parseFloat(detalhe.valorCer) / parseFloat(detalhe.vlrTotal) * 100
                                        projeto.parCerEqu = parseFloat(parCerEqu).toFixed(2)
                                        //Central
                                        var parCenEqu = parseFloat(detalhe.valorCen) / parseFloat(detalhe.vlrTotal) * 100
                                        projeto.parCenEqu = parseFloat(parCenEqu).toFixed(2)
                                        //Postes de Condução
                                        var parPosEqu = parseFloat(detalhe.valorPos) / parseFloat(detalhe.vlrTotal) * 100
                                        projeto.parPosEqu = parseFloat(parPosEqu).toFixed(2)

                                        //console.log('prjValor=>'+prjValor)
                                        //Participação sobre o valor total do projeto
                                        var parLiqVlr = parseFloat(lucroLiquido) / parseFloat(prjValor) * 100
                                        projeto.parLiqVlr = parseFloat(parLiqVlr).toFixed(2)
                                        var parKitVlr = parseFloat(projeto.vlrkit) / parseFloat(prjValor) * 100
                                        projeto.parKitVlr = parseFloat(parKitVlr).toFixed(2)
                                        //console.log('parKitVlr=>' + parKitVlr)
                                        var parIntVlr = parseFloat(totint) / parseFloat(prjValor) * 100
                                        projeto.parIntVlr = parseFloat(parIntVlr).toFixed(2)
                                        var parGesVlr = parseFloat(totges) / parseFloat(prjValor) * 100
                                        projeto.parGesVlr = parseFloat(parGesVlr).toFixed(2)
                                        var parProVlr = parseFloat(totpro) / parseFloat(prjValor) * 100
                                        projeto.parProVlr = parseFloat(parProVlr).toFixed(2)
                                        var parArtVlr = parseFloat(vlrart) / parseFloat(prjValor) * 100
                                        projeto.parArtVlr = parseFloat(parArtVlr).toFixed(2)
                                        var parDesVlr = parseFloat(totdes) / parseFloat(prjValor) * 100
                                        projeto.parDesVlr = parseFloat(parDesVlr).toFixed(2)
                                        var parAliVlr = parseFloat(totali) / parseFloat(prjValor) * 100
                                        projeto.parAliVlr = parseFloat(parAliVlr).toFixed(2)
                                        var parResVlr = parseFloat(reserva) / parseFloat(prjValor) * 100
                                        projeto.parResVlr = parseFloat(parResVlr).toFixed(2)
                                        var parDedVlr = parseFloat(custoPlano) / parseFloat(prjValor) * 100
                                        projeto.parDedVlr = parseFloat(parDedVlr).toFixed(2)
                                        var parISSVlr
                                        if (impNFS > 0) {
                                             parISSVlr = parseFloat(impNFS) / parseFloat(prjValor) * 100
                                        } else {
                                             parISSVlr = 0
                                        }
                                        projeto.parISSVlr = parseFloat(parISSVlr).toFixed(2)
                                        var parImpVlr = parseFloat(totalImposto) / parseFloat(prjValor) * 100
                                        projeto.parImpVlr = parseFloat(parImpVlr).toFixed(2)
                                        //console.log('parImpVlr=>' + parImpVlr)
                                        if (vlrcom > 0) {
                                             var parComVlr = parseFloat(vlrcom) / parseFloat(prjValor) * 100
                                             projeto.parComVlr = parseFloat(parComVlr).toFixed(2)
                                             //console.log('parComVlr=>' + parComVlr)
                                        }

                                        //Participação sobre o Faturamento  
                                        var parLiqNfs = parseFloat(lucroLiquido) / parseFloat(vlrNFS) * 100
                                        projeto.parLiqNfs = parseFloat(parLiqNfs).toFixed(2)
                                        //console.log('parLiqNfs=>' + parLiqNfs)
                                        //console.log('projeto.fatequ=>' + projeto.fatequ)
                                        var parKitNfs
                                        if (req.body.checkFatura != null) {
                                             parKitNfs = parseFloat(projeto.vlrkit) / parseFloat(vlrNFS) * 100
                                             //console.log('parKitNfs=>' + parKitNfs)
                                             projeto.parKitNfs = parseFloat(parKitNfs).toFixed(2)
                                        } else {
                                             parKitNfs = 0
                                             projeto.parKitNfs = 0
                                        }
                                        //console.log('parKitNfs=>' + parKitNfs)
                                        var parIntNfs = parseFloat(totint) / parseFloat(vlrNFS) * 100
                                        projeto.parIntNfs = parseFloat(parIntNfs).toFixed(2)
                                        //console.log('parIntNfs=>' + parIntNfs)
                                        var parGesNfs = parseFloat(totges) / parseFloat(vlrNFS) * 100
                                        projeto.parGesNfs = parseFloat(parGesNfs).toFixed(2)
                                        //console.log('parGesNfs=>' + parGesNfs)
                                        var parProNfs = parseFloat(totpro) / parseFloat(vlrNFS) * 100
                                        projeto.parProNfs = parseFloat(parProNfs).toFixed(2)
                                        //console.log('parProNfs=>' + parProNfs)
                                        var parArtNfs = parseFloat(vlrart) / parseFloat(vlrNFS) * 100
                                        projeto.parArtNfs = parseFloat(parArtNfs).toFixed(2)
                                        //console.log('parArtNfs=>' + parArtNfs)
                                        var parDesNfs = parseFloat(totdes) / parseFloat(vlrNFS) * 100
                                        projeto.parDesNfs = parseFloat(parDesNfs).toFixed(2)
                                        //console.log('parDesNfs=>' + parDesNfs)
                                        var parAliNfs = parseFloat(totali) / parseFloat(vlrNFS) * 100
                                        projeto.parAliNfs = parseFloat(parAliNfs).toFixed(2)
                                        //console.log('parAliNfs=>' + parAliNfs)
                                        var parResNfs = parseFloat(reserva) / parseFloat(vlrNFS) * 100
                                        projeto.parResNfs = parseFloat(parResNfs).toFixed(2)
                                        //console.log('parResNfs=>' + parResNfs)
                                        var parDedNfs = parseFloat(custoPlano) / parseFloat(vlrNFS) * 100
                                        projeto.parDedNfs = parseFloat(parDedNfs).toFixed(2)
                                        //console.log('parDedNfs=>' + parDedNfs)
                                        var parISSNfs
                                        if (impNFS > 0) {
                                             parISSNfs = parseFloat(impNFS) / parseFloat(vlrNFS) * 100
                                        } else {
                                             parISSNfs = 0
                                        }
                                        projeto.parISSNfs = parseFloat(parISSNfs).toFixed(2)
                                        //console.log('parISSNfs=>' + parISSNfs)
                                        var parImpNfs = (parseFloat(totalImposto) / parseFloat(vlrNFS)) * 100
                                        projeto.parImpNfs = parseFloat(parImpNfs).toFixed(2)
                                        //console.log('parImpNfs=>' + parImpNfs)
                                        if (vlrcom > 0) {
                                             var parComNfs = parseFloat(vlrcom) / parseFloat(vlrNFS) * 100
                                             projeto.parComNfs = parseFloat(parComNfs).toFixed(2)
                                             //console.log('parComNfs=>' + parComNfs)
                                        }
                                        var fatura
                                        if (req.body.checkFatura != null) {
                                             fatura = 'checked'
                                        } else {
                                             fatura = 'uncheked'
                                        }
                                        //console.log('fatura=>' + fatura)
                                        cronograma.save().then(() => {
                                             projeto.save().then(() => {
                                                  //console.log('salvou')
                                                  req.flash('success_msg', 'Projeto Salvo com sucesso')
                                                  res.redirect('/projeto/direto/' + req.body.id)
                                             }).catch(() => {
                                                  req.flash('error_msg', 'Houve um erro ao salvar o cronograma.')
                                                  res.redirect('/projeto/direto/' + req.body.id)
                                             })
                                        }).catch(() => {
                                             req.flash('error_msg', 'Houve um erro ao salvar o projeto.')
                                             res.redirect('/projeto/direto/' + req.body.id)
                                        })
                                   }).catch((err) => {
                                        req.flash('error_msg', 'Não foi possível encontrar a configuração do projeto.')
                                        res.redirect('/projeto/direto/' + req.body.id)
                                   })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Não foi possível encontrar a empresa do projeto.')
                                   res.redirect('/projeto/direto/' + req.body.id)
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Houve um erro ao encontrar um cliente.')
                              res.redirect('/projeto/direto/' + req.body.id)
                         })
                    }).catch(() => {
                         req.flash('error_msg', 'Houve um erro ao encontrar os detalhes.')
                         res.redirect('/projeto/direto/' + req.body.id)
                    })
               }).catch(() => {
                    req.flash('error_msg', 'Houve um erro ao encontrar o cronograma.')
                    res.redirect('/projeto/direto/' + req.body.id)
               })
          }).catch(() => {
               req.flash('error_msg', 'Houve um erro ao encontrar o projeto.')
               res.redirect('/projeto/direto/' + req.body.id)
          })
     }
})

router.post('/realizar', ehAdmin, (req, res) => {
     const { _id } = req.user
     var erros = ''
     var sucesso = ''

     if (parseFloat(req.body.orcCP) == 0) {
          erros = 'Para realizar o projeto é necessário que os custos orçados sejam maiores que zero.'
          req.flash('error_msg', erros)
          res.redirect('/projetos/realizar/' + req.body.id)

     } else {

          Projeto.findOne({ _id: req.body.id }).then((projeto) => {
               Detalhado.findOne({ projeto: req.body.id }).then((detalhe) => {
                    Empresa.findOne({ _id: projeto.empresa }).then((rp) => {
                         Cronograma.findOne({ projeto: projeto._id }).then((cronograma) => {
                              Realizado.findOne({ projeto: req.body.id }).then((realizado) => {
                                   var prj_id = projeto._id
                                   var prjCusto = projeto.custoPlano
                                   var prjValor = projeto.valor
                                   var projeto_totalImposto = projeto.totalImposto
                                   var projeto_lbaimp = projeto.lbaimp
                                   var projeto_lucroLiquido = projeto.lucroLiquido
                                   var totint
                                   var totges
                                   var totpro
                                   var vlrart
                                   var totali
                                   var totdes
                                   var tothtl
                                   var totcmb
                                   var totalPlano
                                   if (req.body.totint != '') {
                                        totint = req.body.totint
                                   } else {
                                        totint = projeto.totint
                                   }
                                   //console.log('totint=>' + totint)
                                   if (req.body.totges != '') {
                                        totges = req.body.totges
                                   } else {
                                        totges = projeto.totges
                                   }
                                   if (req.body.totpro != '') {
                                        totpro = req.body.totpro
                                   } else {
                                        totpro = projeto.totpro
                                   }
                                   if (req.body.vlrart != '') {
                                        vlrart = req.body.vlrart
                                   } else {
                                        vlrart = projeto.vlrart
                                   }
                                   if (req.body.totali != '') {
                                        totali = req.body.totali
                                   } else {
                                        totali = projeto.totali
                                   }
                                   //console.log('projeto.ehDireto=>'+projeto.ehDireto)
                                   if (projeto.ehDireto == true) {
                                        tothtl = 0
                                        totcmb = 0
                                        if (req.body.totdes != '') {
                                             totdes = req.body.totdes
                                        } else {
                                             totdes = projeto.totdes
                                        }
                                   } else {
                                        totdes = projeto.totdes

                                        tothtl = 0
                                        if (projeto.ehDireto == false) {
                                             if (req.body.tothtl != '') {
                                                  tothtl = req.body.tothtl
                                             } else {
                                                  tothtl = projeto.tothtl
                                             }
                                        }
                                        totcmb = projeto.totcmb
                                        if (projeto.ehDireto == false) {
                                             if (req.body.totcmb != '') {
                                                  totcmb = req.body.totcmb
                                             } else {
                                                  totcmb = projeto.totcmb
                                             }
                                        }
                                   }
                                   //console.log('totdes=>'+totdes)
                                   //Definir valores tatais de armazenagem e inslação de painéis elétricos
                                   var totpnl = 0
                                   var toteae = 0
                                   if (projeto.temPainel == 'checked') {
                                        totpnl = 0
                                        if (req.body.totpnl != '') {
                                             totpnl = req.body.totpnl
                                        } else {
                                             totpnl = projeto.totpnl
                                        }

                                   }
                                   if (projeto.temArmazenamento == 'checked') {
                                        toteae = 0
                                        if (req.body.toteae != '') {
                                             toteae = req.body.toteae
                                        } else {
                                             toteae = projeto.toteae
                                        }
                                   }

                                   var valorCer = 0
                                   var valorCen = 0
                                   var valorPos = 0
                                   if (projeto.temCercamento == 'checked') {
                                        if (req.body.cercamento != '') {
                                             valorCer = req.body.cercamento
                                        }
                                   }
                                   if (projeto.temCentral == 'checked') {
                                        if (req.body.central != '') {
                                             valorCen = req.body.central
                                        }
                                   }
                                   if (projeto.temPosteCond == 'checked') {
                                        if (req.body.postecond != '') {
                                             valorPos = req.body.postecond
                                        }
                                   }

                                   if ((valorPos == 0 || valorPos == '') && detalhe.valorPos != 0) {
                                        valorPos = detalhe.valorPos
                                   }
                                   if ((valorCer == 0 || valorCer == '') && detalhe.valorCer != 0) {
                                        valorCer = detalhe.valorCer
                                   }
                                   if ((valorCen == 0 || valorCen == '') && detalhe.valorCen != 0) {
                                        valorCen = detalhe.valorCen
                                   }

                                   var custoFix = parseFloat(totint) + parseFloat(totges) + parseFloat(totpro) + parseFloat(vlrart) + parseFloat(toteae) + parseFloat(totpnl)
                                   var custoVar
                                   if (projeto.ehDireto == true) {
                                        custoVar = (parseFloat(totali) + parseFloat(totdes)).toFixed(2)
                                   } else {
                                        custoVar = (parseFloat(totali) + parseFloat(totcmb) + parseFloat(tothtl)).toFixed(2)
                                   }

                                   var custoEst = parseFloat(valorCer) + parseFloat(valorPos) + parseFloat(valorCen)
                                   totalPlano = parseFloat(custoFix) + parseFloat(custoVar) + parseFloat(custoEst)

                                   var vlrequ
                                   var impISSNfs
                                   var vlrPrjNFS

                                   if (req.body.vlrequ != '') {
                                        vlrequ = req.body.vlrequ
                                        vlrkit = req.body.vlrequ
                                   } else {
                                        vlrequ = projeto.vlrequ
                                        vlrkit = projeto.vlrkit
                                   }

                                   if (projeto.fatequ == true) {
                                        vlrPrjNFS = parseFloat(projeto.valor).toFixed(2)
                                   } else {
                                        vlrPrjNFS = (parseFloat(projeto.valor) - parseFloat(vlrkit)).toFixed(2)
                                   }

                                   //console.log('vlrequ=>' + vlrequ)
                                   //console.log('vlrPrjNFS=>' + vlrPrjNFS)

                                   //-------------------------------------
                                   var impmanual
                                   var impISS
                                   var impostoICMS
                                   var impICMS
                                   var impSimples
                                   var impIRPJ
                                   var impIRPJAdd
                                   var impCSLL
                                   var impPIS
                                   var impCOFINS
                                   var totalImposto

                                   if (req.body.impmanual != null) {
                                        //LANÇAMENTO DIRETO/MANUAL DE IMPOSTOS
                                        impmanual = 'checked'
                                        if (req.body.impISS == '' || req.body.impISS == 0 || parseFloat(req.body.impISS) == null) {
                                             impISS = 0
                                        } else {
                                             impISS = req.body.impISS
                                        }
                                   } else {
                                        if (!impISSNfs) {
                                             if (!projeto.impNFS || projeto.impNFS != '') {
                                                  impISS = projeto.impNFS
                                             } else {
                                                  impISS = 0
                                             }
                                        } else {
                                             impISS = impISSNfs.toFixed(2)
                                        }
                                   }

                                   var prjrecLiquida = parseFloat(projeto.valor) - parseFloat(impISS)
                                   prjrecLiquida = parseFloat(prjrecLiquida).toFixed(2)

                                   var prjLucroBruto = parseFloat(prjrecLiquida) - parseFloat(vlrkit)
                                   prjLucroBruto = parseFloat(prjLucroBruto).toFixed(2)

                                   //Valida a comissão e calcula o lucroBruto
                                   var vlrcom
                                   if (req.body.vlrcom == '') {
                                        vlrcom = projeto.vlrcom
                                   } else {
                                        vlrcom = req.body.vlrcom
                                   }

                                   var lbaimp = 0
                                   if (parseFloat(projeto.desAdm) > 0) {
                                        lbaimp = (parseFloat(prjLucroBruto) - parseFloat(totalPlano) - parseFloat(projeto.desAdm) - parseFloat(vlrcom)).toFixed(2)
                                   } else {
                                        lbaimp = (parseFloat(prjLucroBruto) - parseFloat(totalPlano) - parseFloat(vlrcom)).toFixed(2)
                                   }
                                   lbaimp = parseFloat(lbaimp).toFixed(2)

                                   if (impmanual == 'checked') {
                                        //LANÇAMENTO DIRETO/MANUAL DE IMPOSTOS
                                        if (req.body.impICMS == '') {
                                             impICMS = 0
                                        } else {
                                             impICMS = req.body.impICMS
                                        }
                                        if (req.body.impSimples == '') {
                                             impSimples = 0
                                        } else {
                                             impSimples = req.body.impSimples
                                        }
                                        if (req.body.impIRPJ == '') {
                                             impIRPJ = 0
                                        } else {
                                             impIRPJ = req.body.impIRPJ
                                        }
                                        if (req.body.impIRPJAdd == '') {
                                             impIRPJAdd = 0
                                        } else {
                                             impIRPJAdd = req.body.impIRPJAdd
                                        }
                                        if (req.body.impCSLL == '') {
                                             impCSLL = 0
                                        } else {
                                             impCSLL = req.body.impCSLL
                                        }
                                        if (req.body.impPIS == '') {
                                             impPIS = 0
                                        } else {
                                             impPIS = req.body.impPIS
                                        }
                                        if (req.body.impCOFINS == '') {
                                             impCOFINS = 0
                                        } else {
                                             impCOFINS = req.body.impCOFINS
                                        }
                                        if (rp.regime = 'Simples') {
                                             totalImposto = parseFloat(impSimples).toFixed(2)
                                        } else {
                                             totalImposto = (parseFloat(impIRPJ) + parseFloat(impIRPJAdd) + parseFloat(impCSLL) + parseFloat(impPIS) + parseFloat(impCOFINS)).toFixed(2)
                                        }
                                        //---------------------
                                   } else {
                                        //CÁLCULO AUTOMÁTICO DOS IMPOSTOS
                                        if (projeto.fatequ == true) {
                                             if (rp.alqICMS == '' || rp.alqICMS == null) {
                                                  impICMS = 0
                                             } else {
                                                  impostoICMS = (parseFloat(vlrkit) / (1 - (parseFloat(rp.alqICMS) / 100))) * (parseFloat(rp.alqICMS) / 100)
                                                  impICMS = impostoICMS.toFixed(2)
                                             }
                                        } else {
                                             impICMS = 0
                                        }

                                        var fatadd
                                        var fataju
                                        var aux
                                        var prjLR = rp.prjLR
                                        var prjLP = rp.prjLP
                                        var prjFat = rp.prjFat

                                        if (rp.regime == 'Simples') {
                                             var alqEfe = ((parseFloat(prjFat) * (parseFloat(rp.alqDAS) / 100)) - (parseFloat(rp.vlrred))) / parseFloat(prjFat)
                                             impSimples = parseFloat(vlrPrjNFS) * (parseFloat(alqEfe))
                                             totalImposto = parseFloat(impSimples).toFixed(2)
                                             impIRPJ = 0
                                             impIRPJAdd = 0
                                             impCSLL = 0
                                             impPIS = 0
                                             impCOFINS = 0
                                        } else {
                                             if (rp.regime == 'Lucro Real') {
                                                  //Imposto Adicional de IRPJ
                                                  if ((parseFloat(prjLR) / 12) > 20000) {
                                                       fatadd = (parseFloat(prjLR) / 12) - 20000
                                                       fataju = parseFloat(fatadd) * (parseFloat(rp.alqIRPJAdd) / 100)
                                                       aux = Math.round(parseFloat(fatadd) / parseFloat(lbaimp))
                                                       impIRPJAdd = (parseFloat(fataju) / parseFloat(aux)).toFixed(2)

                                                  } else {
                                                       impIRPJAdd = 0
                                                  }
                                                  impIRPJ = parseFloat(lbaimp) * (parseFloat(rp.alqIRPJ) / 100)
                                                  impIRPJ = impIRPJ.toFixed(2)
                                                  impCSLL = parseFloat(lbaimp) * (parseFloat(rp.alqCSLL) / 100)
                                                  impCSLL = impCSLL.toFixed(2)
                                                  impPIS = parseFloat(vlrPrjNFS) * 0.5 * (parseFloat(rp.alqPIS) / 100)
                                                  impPIS = impPIS.toFixed(2)
                                                  impCOFINS = parseFloat(vlrPrjNFS) * 0.5 * (parseFloat(rp.alqCOFINS) / 100)
                                                  impCOFINS = impCOFINS.toFixed(2)
                                                  totalImposto = (parseFloat(impIRPJAdd) + parseFloat(impIRPJ) + parseFloat(impCSLL) + parseFloat(impCOFINS) + parseFloat(impPIS)).toFixed(2)

                                             } else {
                                                  //Imposto adicional de IRPJ
                                                  if (((parseFloat(prjLP) * 0.32) / 3) > 20000) {
                                                       fatadd = ((parseFloat(prjLP) * 0.32) / 3) - 20000
                                                       fataju = parseFloat(fatadd) / 20000
                                                       impIRPJAdd = (parseFloat(vlrPrjNFS) * 0.32) * parseFloat(fataju).toFixed(2) * (parseFloat(rp.alqIRPJAdd) / 100)
                                                       impIRPJAdd = impIRPJAdd.toFixed(2)
                                                  } else {
                                                       impIRPJAdd = 0
                                                  }

                                                  impIRPJ = parseFloat(vlrPrjNFS) * 0.32 * (parseFloat(rp.alqIRPJ) / 100)
                                                  impIRPJ = impIRPJ.toFixed(2)
                                                  impCSLL = parseFloat(vlrPrjNFS) * 0.32 * (parseFloat(rp.alqCSLL) / 100)
                                                  impCSLL = impCSLL.toFixed(2)

                                                  impCOFINS = parseFloat(vlrPrjNFS) * (parseFloat(rp.alqCOFINS) / 100)
                                                  impCOFINS = impCOFINS.toFixed(2)

                                                  impPIS = parseFloat(vlrPrjNFS) * (parseFloat(rp.alqPIS) / 100)
                                                  impPIS = impPIS.toFixed(2)

                                                  totalImposto = (parseFloat(impIRPJAdd) + parseFloat(impIRPJ) + parseFloat(impCSLL) + parseFloat(impCOFINS) + parseFloat(impPIS)).toFixed(2)
                                             }
                                        }
                                   }

                                   //----------------------------

                                   var totalTributos = 0
                                   if (parseFloat(impICMS) > 0) {
                                        totalTributos = (parseFloat(totalImposto) + parseFloat(impISS) + parseFloat(impICMS)).toFixed(2)
                                        totalImposto = (parseFloat(totalImposto) + parseFloat(impICMS)).toFixed(2)
                                   } else {
                                        totalTributos = (parseFloat(totalImposto) + parseFloat(impISS)).toFixed(2)
                                   }

                                   var lucroLiquido = (parseFloat(lbaimp) - parseFloat(totalImposto)).toFixed(2)

                                   //CÁLCULO DAS VARIAÇÕES
                                   var varCusto = - (((parseFloat(prjCusto) - parseFloat(totalPlano)) / parseFloat(prjCusto)) * 100)
                                   varCusto = varCusto.toFixed(2)
                                   var varTI = - (((parseFloat(projeto_totalImposto) - parseFloat(totalImposto)) / parseFloat(projeto_totalImposto)) * 100)
                                   varTI = varTI.toFixed(2)
                                   var varLAI = -(((parseFloat(projeto_lbaimp) - parseFloat(lbaimp)) / parseFloat(projeto_lbaimp)) * 100)
                                   varLAI = varLAI.toFixed(2)
                                   var varLL = -(((parseFloat(projeto_lucroLiquido) - parseFloat(lucroLiquido)) / parseFloat(projeto_lucroLiquido)) * 100)
                                   varLL = varLL.toFixed(2)

                                   //CÁLCULO DAS PARTES

                                   var parLiqVlr = (parseFloat(lucroLiquido) / parseFloat(prjValor)) * 100
                                   parLiqVlr = parLiqVlr.toFixed(2)
                                   var parKitVlr = (parseFloat(vlrkit) / parseFloat(prjValor)) * 100
                                   parKitVlr = parKitVlr.toFixed(2)
                                   var parIntVlr = (parseFloat(totint) / parseFloat(prjValor)) * 100
                                   parIntVlr = parIntVlr.toFixed(2)
                                   var parGesVlr = (parseFloat(totges) / parseFloat(prjValor)) * 100
                                   parGesVlr = parGesVlr.toFixed(2)
                                   var parProVlr = (parseFloat(totpro) / parseFloat(prjValor)) * 100
                                   parProVlr = parProVlr.toFixed(2)
                                   var parArtVlr = (parseFloat(vlrart) / parseFloat(prjValor)) * 100
                                   parArtVlr = parArtVlr.toFixed(2)
                                   var parDesVlr = (parseFloat(totdes) / parseFloat(prjValor)) * 100
                                   parDesVlr = parDesVlr.toFixed(2)
                                   var parCmbVlr
                                   if (projeto.ehDireto == false) {
                                        parCmbVlr = (parseFloat(totcmb) / parseFloat(prjValor)) * 100
                                   } else {
                                        parCmbVlr = 0
                                   }
                                   parCmbVlr = parCmbVlr.toFixed(2)
                                   var parAliVlr = (parseFloat(totali) / parseFloat(prjValor)) * 100
                                   parAliVrl = parAliVlr.toFixed(2)
                                   var parEstVlr
                                   if (projeto.ehDireto == false) {
                                        parEstVlr = (parseFloat(tothtl) / parseFloat(prjValor)) * 100
                                   } else {
                                        parEstVlr = 0
                                   }
                                   parEstVlr = parEstVlr.toFixed(2)
                                   var parDedVlr = (parseFloat(totalPlano) / parseFloat(prjValor)) * 100
                                   parDedVlr = parDedVlr.toFixed(2)
                                   var parISSVlr
                                   if (impISS > 0) {
                                        parISSVlr = (parseFloat(impISS) / parseFloat(prjValor)) * 100
                                   } else {
                                        parISSVlr = 0
                                   }

                                   parISSVlr = parISSVlr.toFixed(2)
                                   var parImpVlr = (parseFloat(totalImposto) / parseFloat(prjValor)) * 100
                                   parImpVlr = parImpVlr.toFixed(2)
                                   var parComVlr = (parseFloat(vlrcom) / parseFloat(projeto.valor)) * 100
                                   parComVlr = parComVlr.toFixed(2)

                                   var parLiqNfs = (parseFloat(lucroLiquido) / parseFloat(vlrPrjNFS)) * 100
                                   parLiqNfs = parLiqNfs.toFixed(2)
                                   if (projeto.fatequ == true) {
                                        var parKitNfs = (parseFloat(vlrkit) / parseFloat(vlrPrjNFS)) * 100
                                        parKitNfs = parKitNfs.toFixed(2)
                                   } else {
                                        parKitNfs = 0
                                   }
                                   var parIntNfs = (parseFloat(totint) / parseFloat(vlrPrjNFS)) * 100
                                   parIntNfs = parIntNfs.toFixed(2)
                                   var parGesNfs = (parseFloat(totges) / parseFloat(vlrPrjNFS)) * 100
                                   parGesNfs = parGesNfs.toFixed(2)
                                   var parProNfs = (parseFloat(totpro) / parseFloat(vlrPrjNFS)) * 100
                                   parProNfs = parProNfs.toFixed(2)
                                   var parArtNfs = (parseFloat(vlrart) / parseFloat(vlrPrjNFS)) * 100
                                   parArtNfs = parArtNfs.toFixed(2)
                                   var parDesNfs = (parseFloat(totdes) / parseFloat(vlrPrjNFS)) * 100
                                   parDesNfs = parDesNfs.toFixed(2)
                                   var parCmbNfs
                                   if (projeto.ehDireto == false) {
                                        parCmbNfs = (parseFloat(totcmb) / parseFloat(vlrPrjNFS)) * 100
                                   } else {
                                        parCmbNfs = 0
                                   }
                                   parCmbNfs = parCmbNfs.toFixed(2)
                                   var parAliNfs = (parseFloat(totali) / parseFloat(vlrPrjNFS)) * 100
                                   parAliNfs = parAliNfs.toFixed(2)
                                   var parEstNfs
                                   if (projeto.ehDireto == false) {
                                        parEstNfs = (parseFloat(tothtl) / parseFloat(vlrPrjNFS)) * 100
                                   } else {
                                        parEstNfs = 0
                                   }
                                   parEstNfs = parEstNfs.toFixed(2)
                                   if (parseFloat(totalPlano) > 0) {
                                        var parDedNfs = (parseFloat(totalPlano) / parseFloat(vlrPrjNFS)) * 100
                                        parDedNfs = parseFloat(parDedNfs).toFixed(2)
                                   } else {
                                        parDedNfs = 0
                                   }
                                   var parISSNfs
                                   if (impISS > 0) {
                                        parISSNfs = (parseFloat(impISS) / parseFloat(vlrPrjNFS)) * 100
                                   } else {
                                        parISSNfs = 0
                                   }

                                   parISSNfs = parISSNfs.toFixed(2)
                                   var parImpNfs = (parseFloat(totalImposto) / parseFloat(projeto.vlrNFS)) * 100
                                   parImpNfs = parImpNfs.toFixed(2)
                                   var parComNfs = (parseFloat(vlrcom) / parseFloat(vlrPrjNFS)) * 100
                                   parComNfs = parComNfs.toFixed(2)

                                   //Define percentua do realizado foi maoir ou menor que do orçado
                                   var parVlrRlz
                                   var parNfsRlz
                                   var varLucRlz
                                   if (parLiqVlr > projeto.parLiqVlr) {
                                        parVlrRlz = true
                                   } else {
                                        parVlrRlz = false
                                   }
                                   if (parLiqNfs > projeto.parLiqNfs) {
                                        parNfsRlz = true
                                   } else {
                                        parNfsRlz = false
                                   }
                                   if (lucroLiquido > projeto.lucroLiquido) {
                                        varLucRlz = true
                                   } else {
                                        varLucRlz = false
                                   }

                                   //Define data atual
                                   var data = new Date()
                                   var dia = data.getDate()
                                   if (dia < 10) {
                                        dia = '0' + dia
                                   }
                                   var mes = parseFloat(data.getMonth()) + 1
                                   if (mes < 10) {
                                        mes = '0' + mes
                                   }
                                   var ano = data.getFullYear()

                                   //validar a data de entrega do projeto
                                   var datafim = 0
                                   var dataFimPrj
                                   var valDataFim
                                   var datavis = 0
                                   var ano
                                   var mes
                                   var dia
                                   if (req.body.valDataFim != '' && typeof req.body.valDataFim != 'undefined') {
                                        //console.log('data diferente de vazio')
                                        //console.log('req.body.valDataFim=>' + req.body.valDataFim)
                                        datafim = req.body.valDataFim
                                        ano = datafim.substring(0, 4)
                                        mes = datafim.substring(5, 7)
                                        dia = datafim.substring(8, 11)
                                        datafim = ano + mes + dia
                                        dataFimPrj = dia + '/' + mes + '/' + ano
                                        //console.log('datafim=>' + datafim)
                                        //console.log('dataFimPrj=>' + dataFimPrj)
                                        datavis = cronograma.datevis
                                        ano = datavis.substring(0, 4)
                                        mes = datavis.substring(5, 7)
                                        dia = datavis.substring(8, 11)
                                        datavis = ano + mes + dia
                                        //console.log('datavis=>' + datavis)
                                        if (parseFloat(datavis) <= parseFloat(datafim)) {
                                             //console.log('data final maior que data de vistoria')
                                             valDataFim = req.body.valDataFim
                                             projeto.datafim = dataFimPrj
                                             projeto.valDataFim = valDataFim
                                             cronograma.dateEntregaReal = valDataFim
                                             projeto.atrasado = comparaDatas(cronograma.dateentrega, req.body.valDataFim)

                                        } else {
                                             valDataFim = projeto.valDataFim
                                             dataFimPrj = projeto.datafim
                                             erros.push({ texto: 'A data de entrega do projeto deve ser maior ou igual a data de finalização da vistoria.' })
                                        }
                                   } else {
                                        dataFimPrj = 0
                                        valDataFim = 0
                                   }

                                   var datareg = ano + mes + dia
                                   if (realizado != null) {
                                        realizado.foiRealizado = false
                                        realizado.nome = projeto.nome
                                        realizado.potencia = projeto.potencia
                                        realizado.cliente = projeto.nomecliente
                                        realizado.dataini = projeto.dataini
                                        realizado.datafim = dataFimPrj
                                        realizado.valDataFim = valDataFim
                                        realizado.valor = projeto.valor
                                        realizado.data = dia + '/' + mes + '/' + ano
                                        realizado.datareg = datareg
                                        realizado.totint = totint
                                        realizado.totges = totges
                                        realizado.totpro = totpro
                                        realizado.vlrart = vlrart
                                        realizado.totali = totali
                                        realizado.totdes = totdes
                                        realizado.tothtl = tothtl
                                        realizado.totpnl = totpnl
                                        realizado.toteae = toteae
                                        realizado.totcmb = totcmb
                                        realizado.valorCer = valorCer
                                        realizado.valorCen = valorCen
                                        realizado.valorPos = valorPos

                                        realizado.custofix = custoFix
                                        realizado.custovar = custoVar
                                        realizado.custoest = custoEst
                                        realizado.custoPlano = totalPlano
                                        realizado.fatequ = projeto.fatequ
                                        realizado.vlrequ = vlrequ
                                        realizado.vlrkit = vlrkit
                                        realizado.valorMod = detalhe.valorMod
                                        realizado.valorInv = detalhe.valorInv
                                        realizado.valorEst = detalhe.valorEst
                                        realizado.valorCim = detalhe.valorCim
                                        realizado.valorCab = detalhe.valorCab
                                        realizado.valorEbt = detalhe.valorEbt
                                        realizado.valorDisCC = detalhe.valorDisCC
                                        realizado.valorDPSCC = detalhe.valorDPSCC
                                        realizado.valorDisCA = detalhe.valorDisCA
                                        realizado.valorDPSCA = detalhe.valorDPSCA
                                        realizado.valorCCA = detalhe.valorCCA
                                        realizado.valorSB = detalhe.valorSB
                                        realizado.valorOcp = detalhe.valorOcp

                                        realizado.vlrNFS = vlrPrjNFS
                                        realizado.recLiquida = prjrecLiquida
                                        realizado.lucroBruto = prjLucroBruto
                                        realizado.vlrcom = vlrcom
                                        realizado.desAdm = projeto.desAdm
                                        realizado.lbaimp = lbaimp

                                        realizado.impmanual = impmanual
                                        realizado.impISS = impISS
                                        realizado.impICMS = impICMS
                                        realizado.impSimples = impSimples
                                        realizado.impIRPJ = impIRPJ
                                        realizado.impIRPJAdd = impIRPJAdd
                                        realizado.impCSLL = impCSLL
                                        realizado.impPIS = impPIS
                                        realizado.impCOFINS = impCOFINS

                                        realizado.totalImposto = totalImposto
                                        realizado.totalTributos = totalTributos
                                        realizado.lucroLiquido = lucroLiquido

                                        realizado.varCusto = varCusto
                                        realizado.varTI = varTI
                                        realizado.varLAI = varLAI
                                        realizado.varLL = varLL

                                        realizado.parLiqVlr = parLiqVlr
                                        realizado.parKitVlr = parKitVlr
                                        realizado.parIntVlr = parIntVlr
                                        realizado.parGesVlr = parGesVlr
                                        realizado.parProVlr = parProVlr
                                        realizado.parArtVlr = parArtVlr
                                        realizado.parDesVlr = parDesVlr
                                        realizado.parAliVlr = parAliVlr
                                        realizado.parCmbVlr = parCmbVlr
                                        realizado.parEstVlr = parEstVlr
                                        realizado.parDedVlr = parDedVlr
                                        realizado.parISSVlr = parISSVlr
                                        realizado.parImpVlr = parImpVlr
                                        realizado.parComVlr = parComVlr

                                        realizado.parLiqNfs = parLiqNfs
                                        realizado.parKitNfs = parKitNfs
                                        realizado.parIntNfs = parIntNfs
                                        realizado.parGesNfs = parGesNfs
                                        realizado.parProNfs = parProNfs
                                        realizado.parArtNfs = parArtNfs
                                        realizado.parDesNfs = parDesNfs
                                        realizado.parAliNfs = parAliNfs
                                        realizado.parEstNfs = parEstNfs
                                        realizado.parCmbNfs = parCmbNfs
                                        realizado.parDedNfs = parDedNfs
                                        realizado.parISSNfs = parISSNfs
                                        realizado.parImpNfs = parImpNfs
                                        realizado.parComNfs = parComNfs

                                        realizado.parNfsRlz = parNfsRlz
                                        realizado.parVlrRlz = parVlrRlz
                                        realizado.varLucRlz = varLucRlz

                                        realizado.save().then(() => {
                                             projeto.foiRealizado = true
                                             projeto.homologado = false
                                             projeto.save().then(() => {
                                                  sucesso = sucesso + 'Projeto realizado com sucesso.'
                                                  //console.log('sucesso=>' + sucesso)
                                                  req.flash('success_msg', sucesso)
                                                  res.redirect('/projeto/realizar/' + req.body.id)
                                             }).catch((err) => {
                                                  req.flash('error_msg', 'Não foi possível salvar o projeto.')
                                                  res.redirect('/projeto/consulta')
                                             })
                                        }).catch((err) => {
                                             req.flash('error_msg', 'Não foi possível realizar o preojto.')
                                             res.redirect('/realizar/' + req.body.id)
                                        })
                                   } else {
                                        const realizado = {
                                             user: _id,
                                             projeto: prj_id,
                                             potencia: projeto.potencia,
                                             foiRealizado: false,
                                             nome: projeto.nome,
                                             cliente: projeto.nomecliente,
                                             dataini: projeto.dataini,
                                             datafim: dataFimPrj,
                                             valDataFim: valDataFim,
                                             valor: projeto.valor,
                                             data: dia + '/' + mes + '/' + ano,
                                             datareg: datareg,
                                             totint: totint,
                                             totges: totges,
                                             totpro: totpro,
                                             vlrart: vlrart,
                                             totali: totali,
                                             totdes: totdes,
                                             tothtl: tothtl,
                                             totcmb: totcmb,
                                             valorCer: valorCer,
                                             valorCen: valorCen,
                                             valorPos: valorPos,

                                             custofix: custoFix,
                                             custovar: custoVar,
                                             custoest: custoEst,
                                             custoPlano: totalPlano,
                                             fatequ: projeto.fatequ,
                                             vlrequ: vlrequ,
                                             vlrkit: vlrkit,
                                             valorMod: detalhe.valorMod,
                                             valorInv: detalhe.valorInv,
                                             valorEst: detalhe.valorEst,
                                             valorCim: detalhe.valorCim,
                                             valorCab: detalhe.valorCab,
                                             valorEbt: detalhe.valorEbt,
                                             valorDisCC: detalhe.valorDisCC,
                                             valorDPSCC: detalhe.valorDPSCC,
                                             valorDisCA: detalhe.valorDisCA,
                                             valorDPSCA: detalhe.valorDPSCA,
                                             valorCCA: detalhe.valorCCA,
                                             valorSB: detalhe.valorSB,
                                             valorOcp: detalhe.valorOcp,

                                             vlrNFS: vlrPrjNFS,
                                             recLiquida: prjrecLiquida,
                                             lucroBruto: prjLucroBruto,
                                             vlrcom: vlrcom,
                                             desAdm: projeto.desAdm,
                                             lbaimp: lbaimp,

                                             impmanual: impmanual,
                                             impISS: impISS,
                                             impICMS: impICMS,
                                             impSimples: impSimples,
                                             impIRPJ: impIRPJ,
                                             impIRPJAdd: impIRPJAdd,
                                             impCSLL: impCSLL,
                                             impPIS: impPIS,
                                             impCOFINS: impCOFINS,

                                             totalImposto: totalImposto,
                                             totalTributos: totalTributos,
                                             lucroLiquido: lucroLiquido,

                                             varCusto: varCusto,
                                             varTI: varTI,
                                             varLAI: varLAI,
                                             varLL: varLL,

                                             parLiqVlr: parLiqVlr,
                                             parKitVlr: parKitVlr,
                                             parIntVlr: parIntVlr,
                                             parGesVlr: parGesVlr,
                                             parProVlr: parProVlr,
                                             parArtVlr: parArtVlr,
                                             parDesVlr: parDesVlr,
                                             parAliVlr: parAliVlr,
                                             parCmbVlr: parCmbVlr,
                                             parEstVlr: parEstVlr,
                                             parDedVlr: parDedVlr,
                                             parISSVlr: parISSVlr,
                                             parImpVlr: parImpVlr,
                                             parComVlr: parComVlr,

                                             parLiqNfs: parLiqNfs,
                                             parKitNfs: parKitNfs,
                                             parIntNfs: parIntNfs,
                                             parGesNfs: parGesNfs,
                                             parProNfs: parProNfs,
                                             parArtNfs: parArtNfs,
                                             parDesNfs: parDesNfs,
                                             parAliNfs: parAliNfs,
                                             parEstNfs: parEstNfs,
                                             parCmbNfs: parCmbNfs,
                                             parDedNfs: parDedNfs,
                                             parISSNfs: parISSNfs,
                                             parImpNfs: parImpNfs,
                                             parComNfs: parComNfs,

                                             parNfsRlz: parNfsRlz,
                                             parVlrRlz: parVlrRlz,
                                             varLucRlz: varLucRlz,
                                        }

                                        new Realizado(realizado).save().then(() => {

                                             projeto.foiRealizado = true
                                             projeto.homologado = false
                                             cronograma.save().then(() => {
                                                  projeto.save().then(() => {
                                                       //console.log('sucesso=>' + sucesso)
                                                       req.flash('success_msg', sucesso)
                                                       res.redirect('/projeto/realizar/' + req.body.id)
                                                  }).catch((err) => {
                                                       req.flash('error_msg', 'Não foi possível salvar o projeto.')
                                                       res.redirect('/projeto/consulta')
                                                  })
                                             }).catch((err) => {
                                                  req.flash('error_msg', 'Não foi possível salvar o cronograma.')
                                                  res.redirect('/projeto/consulta')
                                             })
                                        }).catch((err) => {
                                             req.flash('error_msg', 'Não foi posível realizar o projeto.')
                                             res.redirect('/projeto/consulta')
                                        })
                                   }

                              }).catch((err) => {
                                   req.flash('error_msg', 'Realizado não encontrado')
                                   res.redirect('/projeto/consulta')
                              })


                              //Para verificar alguma falha quando salva o registro do realizado
                              //console.log('user=>' + _id)
                              //console.log('projeto=>' + prj_id)
                              //console.log('nome=>' + projeto.nome)
                              //console.log('cliente=>' + projeto.cliente)
                              //console.log('dataini=>' + projeto.dataini)
                              //console.log('datafim=>' + datafim)
                              //console.log('valor=>' + projeto.valor)
                              //console.log('data=>' + dia + '/' + mes + '/' + ano)
                              //console.log('datareg=>' + datareg)
                              //console.log('totint=>' + totint)
                              //console.log('totges=>' + totges)
                              //console.log('totpro=>' + totpro)
                              //console.log('totali=>' + totali)
                              //console.log('totdes=>' + totdes)
                              //console.log('tothtl=>' + tothtl)
                              //console.log('cercamento=>' + valorCer)
                              //console.log('central=>' + valorCen)
                              //console.log('postecond=>' + valorPos)
                              //console.log('custoPlano=>' + totalPlano)
                              //console.log('vlrequ=>' + vlrequ)
                              //console.log('vlrNFS=>' + vlrPrjNFS)
                              //console.log('lucroBruto=>' + prjLucroBruto)
                              //console.log('vlrcom=>' + vlrcom)
                              //console.log('lbaimp=>' + lbaimp)

                              //console.log('impmanual=>' + impmanual)
                              //console.log('impISS=>' + impISS)
                              //console.log('impICMS=>' + impICMS)
                              //console.log('impSimples=>' + impSimples)
                              //console.log('impIRPJ=>' + impIRPJ)
                              //console.log('impIRPJAdd=>' + impIRPJAdd)
                              //console.log('impCSLL=>' + impCSLL)
                              //console.log('impPIS=>' + impPIS)
                              //console.log('impCOFINS=>' + impCOFINS)

                              //console.log('totalImposto=>' + totalImposto)
                              //console.log('lucroLiquido=>' + lucroLiquido)

                              //console.log('varCusto=>' + varCusto)
                              //console.log('varTI=>' + varTI)
                              //console.log('varLAI=>' + varLAI)
                              //console.log('varLL=>' + varLL)

                              //console.log('parLiqVlr=>' + parLiqVlr)
                              //console.log('parIntVlr=>' + parIntVlr)
                              //console.log('parGesVlr=>' + parGesVlr)
                              //console.log('parProVlr=>' + parProVlr)
                              //console.log('parDesVlr=>' + parDesVlr)
                              //console.log('parAliVlr=>' + parAliVlr)

                              //console.log('parCmbVlr=>' + parCmbVlr)
                              //console.log('parEstVlr=>' + parEstVlr)
                              //console.log('parDedVlr=>' + parDedVlr)
                              //console.log('parISSVlr=>' + parISSVlr)
                              //console.log('parImpVlr=>' + parImpVlr)
                              //console.log('parComVlr=>' + parComVlr)

                              //console.log('parLiqNfs=>' + parLiqNfs)
                              //console.log('parIntNfs=>' + parIntNfs)
                              //console.log('parGesNfs=>' + parGesNfs)
                              //console.log('parProNfs=>' + parProNfs)
                              //console.log('parDesNfs=>' + parDesNfs)
                              //console.log('parAliNfs=>' + parAliNfs)
                              //console.log('parCmbNfs=>' + parEstNfs)
                              //console.log('parEstNfs=>' + parEstNfs)
                              //console.log('parDedNfs=>' + parDedNfs)
                              //console.log('parISSNfs=>' + parISSNfs)
                              //console.log('parImpNfs=>' + parImpNfs)
                              //console.log('parComNfs=>' + parComNfs)

                              //console.log('parNfsRlz=>' + parNfsRlz)
                              //console.log('parVlrRlz=>' + parVlrRlz)
                              //console.log('varLucRlz=>' + varLucRlz)
                         }).catch((err) => {
                              req.flash('error_msg', 'Cronograma não encontrado.')
                              res.redirect('/projeto/consulta')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Empresa não encontrado.')
                         res.redirect('/projeto/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Detalhe não encontrado.')
                    res.redirect('/menu')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Projeto não encontrado<2>.')
               res.redirect('/projeto/consulta')
          })
     }
})

router.post('/filtrar', ehAdmin, (req, res) => {
     const { _id } = req.user
     var emaberto = false
     var emexecucao = false
     var parado = false
     var homologado = false
     var realizado = false
     var funres = req.body.funres
     var classificacao = req.body.classificacao
     var status = req.body.status

     //console.log('realizado=>' + realizado)
     //console.log('classificacao=>' + classificacao)
     //console.log('funres=>' + funres)
     if (status == 'Todos' && classificacao == 'Todos' && funres == 'Todos') {
          Projeto.find({ user: _id }).lean().then((projetos) => {
               Pessoa.find({ funges: 'checked' }).lean().then((responsavel) => {
                    res.render('projeto/findprojetos', { projetos, responsavel, classificacao: 'Todos', filStatus: 'Todos' })
               }).catch((err) => {
                    req.flash('error_msg', 'Nenhum projeto encontrado.')
                    res.redirect('/projeto/consulta')
               })
          })
     } else {
          if (funres == 'Todos') {
               if (status == 'Todos') {
                    //console.log('classificacao=>' + classificacao)
                    Projeto.find({ classUsina: classificacao, user: _id }).lean().then((projetos) => {
                         Pessoa.find({ funges: 'checked', user: _id }).lean().then((responsavel) => {
                              res.render('projeto/findprojetos', { projetos, classificacao, responsavel, filStatus: status })
                         }).catch((err) => {
                              req.flash('error_msg', 'Nenhum projeto encontrado.')
                              res.redirect('/projeto/consulta')
                         })
                    })
               } else {
                    if (classificacao == 'Todos') {
                         switch (status) {
                              case 'Em Aberto': emaberto = true
                                   break;
                              case 'Em Execução': emexecucao = true
                                   break;
                              case 'Parado': parado = true
                                   break;
                              case 'Homologado': homologado = true
                                   break;
                              case 'Realizado': realizado = true
                                   break;
                         }
                         Projeto.find({ foiRealizado: realizado, orcado: emaberto, executando: emexecucao, parado: parado, user: _id }).lean().then((projetos) => {
                              Pessoa.find({ funges: 'checked', user: _id }).lean().then((responsavel) => {
                                   res.render('projeto/findprojetos', { projetos, responsavel, classificacao, filStatus: status })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Nenhum projeto encontrado.')
                                   res.redirect('/projeto/consulta')
                              })
                         })
                    } else {
                         switch (status) {
                              case 'Em Aberto': emaberto = true
                                   break;
                              case 'Em Execução': emexecucao = true
                                   break;
                              case 'Parado': parado = true
                                   break;
                              case 'Homologado': homologado = true
                                   break;
                              case 'Realizado': realizado = true
                                   break;
                         }
                         Projeto.find({ classUsina: classificacao, foiRealizado: foirealizado, orcado: emaberto, executando: emexecucao, parado: parado, user: _id }).lean().then((projetos) => {
                              Pessoa.find({ funges: 'checked', user: _id }).lean().then((responsavel) => {
                                   res.render('projeto/findprojetos', { projetos, responsavel, classificacao, filStatus: status })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Nenhum projeto encontrado.')
                                   res.redirect('/projeto/consulta')
                              })
                         })
                    }
               }
          } else {
               if (funres != 'Todos') {
                    if (realizado == 'Todos' && classificacao == 'Todos') {
                         Pessoa.findOne({ nome: funres, user: _id }).lean().then((pr) => {
                              Projeto.find({ funres: pr._id }).lean().then((projetos) => {
                                   Pessoa.find({ funges: 'checked', user: _id }).lean().then((responsavel) => {
                                        res.render('projeto/findprojetos', { projetos, responsavel, pr, classificacao, filStatus: status })
                                   }).catch((err) => {
                                        req.flash('error_msg', 'Nenhum projeto encontrado.')
                                        res.redirect('/projeto/consulta')
                                   })

                              })
                         })
                    } else {
                         if (realizado == 'Todos') {
                              Pessoa.findOne({ nome: funres, user: _id }).lean().then((pr) => {
                                   Projeto.find({ funres: pr._id, classUsina: classificacao, }).lean().then((projetos) => {
                                        Pessoa.find({ funges: 'checked', user: _id }).lean().then((responsavel) => {
                                             res.render('projeto/findprojetos', { projetos, responsavel, pr, classificacao, filStatus: status })
                                        }).catch((err) => {
                                             req.flash('error_msg', 'Nenhum projeto encontrado.')
                                             res.redirect('/projeto/consulta')
                                        })
                                   })
                              })
                         } else {
                              if (classificacao == 'Todos') {
                                   switch (status) {
                                        case 'Em Aberto': emaberto = true
                                             break;
                                        case 'Em Execução': emexecucao = true
                                             break;
                                        case 'Parado': parado = true
                                             break;
                                        case 'Homologado': homologado = true
                                             break;
                                        case 'Realizado': realizado = true
                                             break;
                                   }
                                   Pessoa.findOne({ nome: funres, user: _id }).lean().then((pr) => {
                                        Projeto.find({ funres: pr._id, foiRealizado: foirealizado, orcado: emaberto, executando: emexecucao, parado: parado }).lean().then((projetos) => {
                                             Pessoa.find({ funges: 'checked', user: _id }).lean().then((responsavel) => {
                                                  res.render('projeto/findprojetos', { projetos, responsavel, pr, classificacao, filStatus: status })
                                             }).catch((err) => {
                                                  req.flash('error_msg', 'Nenhum projeto encontrado.')
                                                  res.redirect('/projeto/consulta')
                                             })
                                        })
                                   })
                              } else {
                                   switch (status) {
                                        case 'Em Aberto': emaberto = true
                                             break;
                                        case 'Em Execução': emexecucao = true
                                             break;
                                        case 'Parado': parado = true
                                             break;
                                        case 'Homologado': homologado = true
                                             break;
                                        case 'Realizado': realizado = true
                                             break;
                                   }
                                   Pessoa.findOne({ nome: funres, user: _id }).lean().then((pr) => {
                                        Projeto.find({ funres: pr._id, classUsina: classificacao, foiRealizado: foirealizado, orcado: emaberto, executando: emexecucao, parado: parado }).lean().then((projetos) => {
                                             Pessoa.find({ funges: 'checked', user: _id }).lean().then((responsavel) => {
                                                  res.render('projeto/findprojetos', { projetos, responsavel, pr, classificacao, filStatus: status })
                                             }).catch((err) => {
                                                  req.flash('error_msg', 'Nenhum projeto encontrado.')
                                                  res.redirect('/projeto/consulta')
                                             })
                                        })
                                   })
                              }
                         }
                    }
               }
          }
     }

})

router.get('/confirmafinalizar/:id', ehAdmin, (req, res) => {
     var erros = []
     Realizado.findOne({ _id: req.params.id }).lean().then((realizado) => {
          Projeto.findOne({ _id: realizado.projeto }).lean().then((projeto) => {
               if (realizado.datafim == '' || typeof realizado.datafim == 'undefined') {
                    erros.push({ texto: 'É necessário preenher a data de entrega para finalizaro projeto. Preencha a data de entrega, calcule o projeto e finalize.' })
                    var varCP = false
                    var varTI = false
                    var varLAI = false
                    var varLL = false
                    var varCustoPlano = (realizado.custoPlano - projeto.custoPlano).toFixed(2)
                    if (varCustoPlano > 1) {
                         varCP = false
                    } else {
                         varCP = true
                    }
                    var varTotalImposto = parseFloat(realizado.totalImposto) - parseFloat(projeto.totalImposto).toFixed(2)
                    if (varTotalImposto > 1) {
                         varTI = true
                    } else {
                         varTI = false
                    }
                    var varlbaimp = (realizado.lbaimp - projeto.lbaimp).toFixed(2)
                    if (varlbaimp > 1) {
                         varLAI = true
                    } else {
                         varLAI = false
                    }
                    var varLucroLiquido = (realizado.lucroLiquido - projeto.lucroLiquido).toFixed(2)
                    if (varLucroLiquido > 1) {
                         varLL = true
                    } else {
                         varLL = false
                    }
                    res.render('projeto/realizado', { erros, projeto, realizado, varCustoPlano, varlbaimp, varLucroLiquido, varTotalImposto, varTI, varLL, varLAI, varCP })
               } else {
                    res.render('projeto/confirmafinalizar', { realizado })
               }
          }).catch((err) => {
               req.flash('error_msg', 'Não foi possível encontrar o projeto<Projeto>.')
               res.redirect('/projeto/consulta')
          })
     }).catch((err) => {
          req.flash('error_msg', 'Não foi possível encontrar o projeto<Realizado>.')
          res.redirect('/projeto/consulta')
     })

})

router.get('/finalizar/:id', ehAdmin, (req, res) => {
     var sucesso = []
     Realizado.findOne({ _id: req.params.id }).then((foiRealizado) => {
          foiRealizado.foiRealizado = true
          const idRlz = foiRealizado._id
          //console.log(idRlz)
          foiRealizado.save().then(() => {
               Realizado.findOne({ _id: idRlz }).lean().then((realizado) => {
                    Projeto.findOne({ _id: realizado.projeto }).lean().then((projeto) => {
                         Detalhado.findOne({ projeto: projeto._id }).lean().then((detalhe) => {
                              var varCP = false
                              var varTI = false
                              var varLAI = false
                              var varLL = false
                              var varCustoPlano = (realizado.custoPlano - projeto.custoPlano).toFixed(2)
                              if (varCustoPlano > 1) {
                                   varCP = false
                              } else {
                                   varCP = true
                              }
                              var varTotalImposto = parseFloat(realizado.totalImposto) - parseFloat(projeto.totalImposto).toFixed(2)
                              if (varTotalImposto > 1) {
                                   varTI = true
                              } else {
                                   varTI = false
                              }
                              var varlbaimp = (realizado.lbaimp - projeto.lbaimp).toFixed(2)
                              if (varlbaimp > 1) {
                                   varLAI = true
                              } else {
                                   varLAI = false
                              }
                              var varLucroLiquido = (realizado.lucroLiquido - projeto.lucroLiquido).toFixed(2)
                              if (varLucroLiquido > 1) {
                                   varLL = true
                              } else {
                                   varLL = false
                              }
                              var temCercamento
                              var temPosteCond
                              var temCentral
                              if (projeto.temCercamento == 'checked') {
                                   temCercamento = true
                              } else {
                                   temCercamento = false
                              }
                              if (projeto.temPosteCond == 'checked') {
                                   temPosteCond = true
                              } else {
                                   temPosteCond = false
                              }

                              if (projeto.temCentral == 'checked') {
                                   temCentral = true
                              } else {
                                   temCentral = false
                              }
                              sucesso.push({ texto: 'Projeto finalizado com sucesso.' })
                              res.render('projeto/realizado', { sucesso, projeto, realizado, detalhe, varCustoPlano, varlbaimp, varTotalImposto, varLucroLiquido, varTI, varLL, varLAI, varCP, temCercamento, temPosteCond, temCentral })
                         }).catch((err) => {
                              req.flash('error_msg', 'Detalhe não encontrado.')
                              res.redirect('/projeto/consulta')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Nenhum projeto encontrado.')
                         res.redirect('/projeto/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Nenhum projeto encontrado.')
                    res.redirect('/projeto/consulta')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Houve um problema ao finalizar o projeto.')
               res.redirect('/projeto/consulta')
          })
     }).catch((err) => {
          req.flash('error_msg', 'Houve um problema ao encontrar o projeto.')
          res.redirect('/projeto/consulta')
     })
})

router.get('/executar/:id', ehAdmin, (req, res) => {
     var aviso
     const { fantasia } = req.user
     var aux
     var msg

     Cronograma.findOne({ projeto: req.params.id }).then((cronograma) => {

          //---Valida se todas as datas de entrega das atividade principais foram preenchidas--//
          aux = 'plaini'
          msg = validaCronograma(cronograma.dateplaini, aux)
          aux = 'plafim'
          msg = msg + validaCronograma(cronograma.dateplafim, aux)
          aux = 'prjini'
          msg = msg + validaCronograma(cronograma.dateprjini, aux)
          aux = 'prjfim'
          msg = msg + validaCronograma(cronograma.dateprjfim, aux)
          aux = 'ateini'
          msg = msg + validaCronograma(cronograma.dateateini, aux)
          aux = 'atefim'
          msg = msg + validaCronograma(cronograma.dateatefim, aux)
          aux = 'estini'
          msg = msg + validaCronograma(cronograma.dateestini, aux)
          aux = 'estfim'
          msg = msg + validaCronograma(cronograma.dateestfim, aux)
          aux = 'modini'
          msg = msg + validaCronograma(cronograma.datemodini, aux)
          aux = 'modfim'
          msg = msg + validaCronograma(cronograma.datemodfim, aux)
          aux = 'invini'
          msg = msg + validaCronograma(cronograma.dateinvini, aux)
          aux = 'invfim'
          msg = msg + validaCronograma(cronograma.dateinvfim, aux)
          aux = 'stbini'
          msg = msg + validaCronograma(cronograma.datestbini, aux)
          aux = 'stbfim'
          msg = msg + validaCronograma(cronograma.datestbfim, aux)
          aux = 'visini'
          msg = msg + validaCronograma(cronograma.datevisfim, aux)
          aux = 'visfim'
          msg = msg + validaCronograma(cronograma.datevisfim, aux)
          aux = 'dataentrega'
          msg = msg + validaCronograma(cronograma.dateentrega, aux)
          /*
          if (comparaDatas(req.body.valDataIns, req.body.valDataIni) == true){
               msg = msg + 'Data de inicio das instalações deve ser maior que a data de inicio do projeto.'
          }
          */
          //------------------------------------------------------//
          if (msg == '') {
               Projeto.findOne({ _id: req.params.id }).then((prj_sms) => {
                    if (parseFloat(prj_sms.custoTotal) > 0) {
                         Cliente.findOne({ _id: prj_sms.cliente }).then((cliente) => {
                              var redirect = '/projeto/edicao/' + req.params.id
                              //Parâmentros do SMS
                              //const from = "VIMMUS"
                              const to = cliente.celular
                              const mensagem = 'Ola tudo bem? Aqui e da: ' + fantasia + '. Seu projeto sera iniciado no dia: ' + prj_sms.dataini + '. Em breve entraremos em contato. Abraco e ate logo!'
                              //Enviando SMS                              
                              //var textMessageService = new TextMessageService(apiKey)
                              //textMessageService.send('Vimmus', mensagem, [to], result => {
                              //     //console.log(result)
                              //     if (result == false) {
                              //         req.flash('error_msg', 'Falha interna. Não foi possível enviar a mensagem.')
                              //          res.redirect(redirect)
                              //     } else {                                
                              prj_sms.executando = true
                              prj_sms.parado = false
                              prj_sms.orcado = false
                              prj_sms.save().then(() => {
                                   aviso = 'Projeto em execução!'
                                   req.flash('success_msg', aviso)
                                   res.redirect(redirect)
                              }).catch((err) => {
                                   req.flash('error_msg', 'Não foi possível salvar o projeto.')
                                   res.redirect('/projeto/consulta')
                              })
                              //}
                              //})
                              /*
                              nexmo.message.sendSms(from, to, mensagem, (err, responseData) => {
                                   if (err) {
                                        //console.log(err);

                                   } else {
                                        if (responseData.messages[0]['status'] === "0") {
                                             //console.log("Message sent successfully.");
                                            
                                        } else {
                                             //console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
                                             req.flash('error_msg', 'Mensagem não enviada.')
                                             res.redirect(redirect)
                                        }
                                   }
                              })
                              */
                         }).catch((err) => {
                              req.flash('error_msg', 'Não foi possível encontrar o cliente.')
                              res.redirect('/projeto/consulta')
                         })
                    } else {
                         aviso = 'Os custos do projeto devem ser preenchidos para executar o projeto!'
                         res.redirect(redirect)
                    }
               }).catch((err) => {
                    req.flash('error_msg', 'Não foi possível encontrar o projeto.')
                    res.redirect('/projeto/consulta')
               })
          } else {
               var redirect = '/projeto/edicao/' + req.params.id
               req.flash('error_msg', msg)
               res.redirect(redirect)
          }
     }).catch((err) => {
          req.flash('error_msg', 'Não foi possível encontrar o cronograma.')
          res.redirect(redirect)
     })
})

router.get('/motivoParar/:id', ehAdmin, (req, res) => {
     const { _id } = req.user
     Projeto.findOne({ _id: req.params.id, user: _id }).lean().then((projeto) => {
          var currenTime = new Date()
          var hoje = currenTime.toLocaleDateString()
          res.render('projeto/motivoparar', { projeto: projeto, datahoje: hoje })
     }).catch((err) => {
          req.flash('error_msg', 'Não foi possível encontrar o projeto')
          res.redirect('/projeto/consulta')
     })
})

router.post('/parar', ehAdmin, (req, res) => {
     var aviso
     const { _id } = req.user

     Projeto.findOne({ _id: req.body.id }).then((projeto_para) => {
          projeto_para.executando = false
          projeto_para.parado = true
          if (projeto_para.tipoParado == '') {
               projeto_para.tipoParado = req.body.tipoParado
               projeto_para.motivoParado = req.body.tipoParado + ': ' + req.body.motivoParado
          } else {
               if (req.body.cbTipo != null) {
                    var textoParado = req.body.tipoParado
                    projeto_para.tipoParado = req.body.tipoParado
                    projeto_para.motivoParado = textoParado + ': ' + req.body.motivoParado
               } else {
                    //console.log('checkbox desmarcado')
                    //console.log('tipo_para=>' + projeto_para.tipoParado)
                    //console.log('texto motivo parado=>' + req.body.motivoParado)
                    projeto_para.motivoParado = projeto_para.tipoParado + ': ' + req.body.motivoParado
               }
          }

          projeto_para.dataParado = req.body.dataParado
          projeto_para.save().then(() => {
               aviso = 'Projeto parado.'
               var redirect = '/projeto/edicao/' + req.body.id
               req.flash('error_msg', aviso)
               res.redirect(redirect)
          }).catch((err) => {
               req.flash('error_msg', 'Não foi possível salvar o projeto')
               res.redirect('/projeto/consulta')
          })
     }).catch((err) => {
          req.flash('error_msg', 'Não foi possível encontrar o projeto')
          res.redirect('/projeto/consulta')
     })
})

router.get('/homologar/:id', ehAdmin, (req, res) => {
     var aviso
     var texto
     //const { fantasia } = req.user
     var redirect
     Cronograma.findOne({ projeto: req.params.id }).then((cronograma) => {
          //console.log('cronograma.dateEntregaReal=>' + cronograma.dateEntregaReal)
          if (cronograma.dateEntregaReal != '' && typeof cronograma.dateEntregaReal != 'undefined') {
               Projeto.findOne({ _id: req.params.id }).then((projeto) => {
                    //console.log('')
                    Cliente.findOne({ _id: projeto.cliente }).then((cliente) => {

                         var date = new Date()
                         var dia = parseFloat(date.getDate())
                         if (dia < 10) {
                              dia = '0' + dia
                         }
                         var mes = parseFloat(date.getMonth()) + 1
                         if (mes < 10) {
                              mes = '0' + mes
                         }
                         var hoje = dia + '/' + mes + '/' + date.getFullYear()
                         //Parâmentros do SMS
                         //const to = '55' + cliente.celular
                         //const mensagem = 'Ola tudo bem? Aqui e da: ' + fantasia + '. Seu projeto entro em fase de homologacao no dia: ' + hoje + '. Em breve entraremos em contato. Abraco e ate logo!'
                         //Enviando SMS                              
                         //var textMessageService = new TextMessageService(apiKey)
                         //textMessageService.send('Vimmus', mensagem, [to], result => {
                         //     //console.log(result)
                         //     if (result == false) {
                         //         req.flash('error_msg', 'Falha interna. Não foi possível enviar a mensagem.')
                         //          res.redirect(redirect)
                         //     } else {
                         //console.log('hoje=>'+hoje)
                         var valida = new Date()
                         valida.setDate(date.getDate() + 7)
                         var validaano = valida.getFullYear()
                         var validames = valida.getMonth() + parseFloat(1)
                         if (validames < 10) {
                              validames = '0' + validames
                         }
                         var validadia = valida.getDate()
                         if (validadia < 10) {
                              validadia = '0' + validadia
                         }
                         var validaHoje = validaano + '-' + validames + '-' + validadia
                         //console.log('projeto.valDataFim=>' + projeto.valDataFim)
                         //console.log('validaHoje=>' + validaHoje)
                         if (comparaDatas(projeto.valDataFim, validaHoje)) {
                              var dataValida = validadia + '/' + validames + '/' + validaano
                              redirect = '/gerenciamento/cronograma/' + req.params.id
                              texto = 'Data de entrega de finalização deve ser maior ou igual que ' + dataValida + '.'
                         } else {
                              aviso = 'Projeto em homologação!'
                              redirect = '/projeto/edicao/' + req.params.id
                              projeto.dataVisto = hoje
                              projeto.executando = false
                              projeto.parado = false
                              projeto.orcado = false
                              projeto.homologado = true
                         }
                         projeto.save().then(() => {
                              req.flash('success_msg', aviso)
                              req.flash('error_msg', texto)
                              res.redirect(redirect)
                         }).catch((err) => {
                              req.flash('error_msg', 'Não foi possível salvar o projeto.')
                              res.redirect('/projeto/consulta')
                         })
                         //}
                         //})
                         //Enviando SMS
                         /*
                         nexmo.message.sendSms(from, to, mensagem, (err, responseData) => {
                              if (err) {
                                   //console.log(err);
                                   req.flash('error_msg', 'Falha interna. Não foi possível enviar a mensagem.')
                                   res.redirect(redirect)
                              } else {
                                   if (responseData.messages[0]['status'] === "0") {
                                        //console.log("Message sent successfully.");

                                   } else {
                                        //console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
                                        req.flash('error_msg', 'Mensagem não enviada.')
                                        res.redirect(redirect)
                                   }
                              }
                         })
                         */

                    }).catch((err) => {
                         req.flash('error_msg', 'Falha interna para encontrar o cliente.')
                         res.redirect('/pessoa/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Falha interna para encontrar o projeto.')
                    res.redirect('/menu')
               })
          } else {
               req.flash('error_msg', 'Não foi encontrado a data de entrega da finalização do projeto.')
               res.redirect(redirect)
          }
     }).catch((err) => {
          req.flash('error_msg', 'Falha interna para encontrar o cronograma.')
          res.redirect('/menu')
     })

})

module.exports = router