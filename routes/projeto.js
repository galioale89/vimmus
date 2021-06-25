const express = require('express')
const router = express.Router()

require('../model/Regime')
require('../model/Pessoa')
require('../model/Realizado')
require('../model/CustoDetalhado')
require('../model/Cliente')
require('../model/Equipe')

const mongoose = require('mongoose')
const Projeto = mongoose.model('projeto')
const Configuracao = mongoose.model('configuracao')
const Regime = mongoose.model('regime')
const Pessoa = mongoose.model('pessoa')
const Realizado = mongoose.model('realizado')
const Detalhado = mongoose.model('custoDetalhado')
const Cliente = mongoose.model('cliente')
const Equipe = mongoose.model('equipe')

const validaCampos = require('../resources/validaCampos')
const { ehAdmin } = require('../helpers/ehAdmin')

var tipocusto = false
//global.projeto_id

router.use(express.static('/imagens'))

router.get("/consulta", ehAdmin, (req, res) => {
     const { _id } = req.user
     Projeto.find({ user: _id }).sort({ dataprev: 'asc' }).lean().then((projetos) => {
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

router.get('/vermais/:id', ehAdmin, (req, res) => {
     Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
          Realizado.findOne({ projeto: projeto._id }).lean().then((realizado) => {
               Pessoa.findOne({ _id: projeto.funres }).lean().then((responsavel) => {
                    Regime.findOne({ _id: projeto.regime }).lean().then((regime) => {
                         res.render('projeto/vermais', { projeto: projeto, responsavel: responsavel, regime: regime, realizado: realizado })
                    }).catch((err) => {
                         req.flash('error_msg', 'Nenhum regime encontrado')
                         res.redirect('/configuracao/consultaregime')
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
                         var varLucroBruto = (realizado.lucroBruto - projeto.lucroBruto).toFixed(2)
                         if (varLucroBruto > 1) {
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
                         res.render('projeto/realizado', { projeto: projeto, realizado: realizado, detalhe: detalhe, varCustoPlano: varCustoPlano, varLucroBruto: varLucroBruto, varlbaimp: varlbaimp, varLucroLiquido: varLucroLiquido, varCustoPlano: varCustoPlano, varLucroBruto: varLucroBruto, varlbaimp: varlbaimp, varLucroLiquido: varLucroLiquido, varTI: varTI, varLL: varLL, varLAI: varLAI, varCP: varCP, temCercamento: temCercamento, temPosteCond: temPosteCond, temCentral: temCentral })
                    } else {
                         res.render('projeto/realizado', { projeto: projeto, detalhe: detalhe, temCercamento: temCercamento, temPosteCond: temPosteCond, temCentral: temCentral })
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
     Regime.find({ user: _id }).lean().then((regime) => {
          Configuracao.find({ user: _id }).lean().then((configuracao) => {
               Pessoa.find({ funges: 'checked', user: _id }).lean().then((pessoas) => {
                    Pessoa.find({ ehVendedor: true, user: _id }).lean().then((vendedor) => {
                         Cliente.find({ user: _id, sissolar: 'checked' }).lean().then((clientes) => {
                              res.render("projeto/addprojeto", { regime: regime, configuracao, pessoas: pessoas, vendedor: vendedor, clientes: clientes })
                         }).catch((err) => {
                              req.flash('error_msg', 'houve um erro ao encontrar um cliente.')
                              res.redirect('/cliente/consulta')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'houve um erro ao encontrar um vendedor.')
                         res.redirect('/configuracao/consultaregime')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'houve um erro ao encontrar a pessoa.')
                    res.redirect('/configuracao/consultaregime')
               })
          }).catch((err) => {
               req.flash('error_msg', 'houve um erro ao encontrar a configuração.')
               res.redirect('/configuracao/consultaregime')
          })

     }).catch((err) => {
          req.flash('error_msg', 'houve um erro ao encontrar o regime.')
          res.redirect('/configuracao/consultaregime')
     })

})

router.get('/direto/:id', ehAdmin, (req, res) => {
     const { _id } = req.user
     var rp
     var pi
     var pp
     var ehSimples = false
     var ehLP = false
     var ehLR = false

     Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
          Pessoa.findOne({ _id: projeto.funins, user: _id }).lean().then((pessoa_ins) => {
               pi = pessoa_ins
          }).catch((err) => {
               req.flash('error_msg', 'Houve uma falha ao encontrar a pessoa')
               res.redirect('/pessoa/consulta')
          })
          Pessoa.findOne({ _id: projeto.funpro, user: _id }).lean().then((pessoa_pro) => {
               pp = pessoa_pro
          }).catch((err) => {
               req.flash('error_msg', 'Houve uma falha ao encontrar a pessoa')
               res.redirect('/pessoa/consulta')
          })
          Pessoa.find({ funins: 'checked', user: _id }).lean().then((instalador) => {
               Pessoa.find({ funpro: 'checked', user: _id }).lean().then((projetista) => {
                    Regime.findOne({ _id: projeto.regime }).lean().then((regime_projeto) => {
                         switch (regime_projeto.regime) {
                              case "Simples": ehSimples = true
                                   break;
                              case "Lucro Presumido": ehLP = true
                                   break;
                              case "Lucro Real": ehLR = true
                                   break;
                         }
                         rp = regime_projeto
                         Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                              var fatura
                              if (projeto.fatequ == true) {
                                   fatura = 'checked'
                              } else {
                                   fatura = 'uncheked'
                              }
                              res.render('projeto/editcustosdiretos', { projeto: projeto, rp: rp, pi: pi, pp: pp, instalador: instalador, projetista: projetista, projetista: projetista, ehSimples: ehSimples, ehLP: ehLP, ehLR: ehLR, cliente: cliente, fatura: fatura })
                         }).catch((err) => {
                              req.flash('error_msg', 'Houve um erro ao encontrar um cliente.')
                              res.redirect('/cliente/consulta')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao encontrar o regime.')
                         res.redirect('/configuracao/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao encontrar a pessoa.')
                    res.redirect('/pessoa/consulta')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Houve uma falha ao encontrar a pessoa.')
               res.redirect('/pessoa/consulta')
          })
     }).catch((err) => {
          req.flash('error_msg', 'Nenhum projeto encontrado.')
          res.redirect('/menu')
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
               Regime.findOne({ _id: projeto.regime }).lean().then((regime_projeto) => {
                    rp = regime_projeto
               }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao encontrar o regime')
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
                         Regime.find({ user: _id }).lean().then((regime) => {
                              Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                                   if (projeto.ehDireto == false) {
                                        res.render('projeto/editprojeto', { projeto: projeto, regime: regime, responsavel: responsavel, rp: rp, pr: pr, detalhe: detalhe, pv: pv, vendedor: vendedor, cliente: cliente })
                                   } else {
                                        res.render('projeto/editdiretoprincipal', { projeto: projeto, regime: regime, responsavel: responsavel, rp: rp, pr: pr, detalhe: detalhe, pv: pv, vendedor: vendedor, cliente: cliente })
                                   }
                              }).catch((err) => {
                                   req.flash('error_msg', 'Houve uma falha ao encontrar o cliente')
                                   res.redirect('/configuracao/consulta')
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Houve uma falha ao encontrar o regime')
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
                                   req.flash('success_msg', 'Projeto removido com sucesso')
                                   res.redirect('/projeto/consulta')
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
          var sucesso = []
          var vlrequ = 0
          var vlrkit = 0

          var unidadeEqu = 0
          var unidadeMod = 0
          var unidadeInv = 0
          var unidadeEst = 0
          var unidadeCim = 0
          var unidadeCab = 0
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

          var vlrTotal = parseFloat(valorEqu) + parseFloat(valorMod) + parseFloat(valorInv) + parseFloat(valorEst) + parseFloat(valorCim) + parseFloat(valorCab) + parseFloat(valorDisCC) + parseFloat(valorDPSCC) + parseFloat(valorDisCA) + parseFloat(valorDPSCA) + parseFloat(valorSB) + parseFloat(valorCCA) + parseFloat(valorOcp) + parseFloat(valorCer) + parseFloat(valorCen) + parseFloat(valorPos)

          //Valida valor do equipameento
          if (parseFloat(valorEqu) != 0 || parseFloat(valorMod) != 0) {
               vlrequ = vlrTotal
               vlrkit = parseFloat(valorEqu) + parseFloat(valorMod) + parseFloat(valorInv) + parseFloat(valorEst) + parseFloat(valorCim) + parseFloat(valorCab) + parseFloat(valorDisCC) + parseFloat(valorDPSCC) + parseFloat(valorDisCA) + parseFloat(valorDPSCA) + parseFloat(valorSB) + parseFloat(valorCCA)
          } else {
               vlrequ = parseFloat(req.body.equipamento) + parseFloat(valorEst) + parseFloat(valorCim) + parseFloat(valorCab) + parseFloat(valorDisCC) + parseFloat(valorDPSCC) + parseFloat(valorDisCA) + parseFloat(valorDPSCA) + parseFloat(valorSB) + parseFloat(valorCCA) + parseFloat(valorOcp) + parseFloat(valorCer) + parseFloat(valorCen) + parseFloat(valorPos)
               vlrkit = parseFloat(req.body.equipamento) + parseFloat(valorEst) + parseFloat(valorCim) + parseFloat(valorDisCC) + parseFloat(valorDPSCC) + parseFloat(valorDisCA) + parseFloat(valorDPSCA) + parseFloat(valorSB) + parseFloat(valorCCA) + parseFloat(valorCab)
          }

          //console.log(vlrequ)
          /*
          valor = req.body.valor
          if (parseFloat(valor) == parseFloat(vlrequ) || parseFloat(valor) < parseFloat(vlrequ)) {
               erros.push({ texto: 'O valor do orçamento deve ser maior que o valor do equipamento.' })
          }
          */
          //------------------------------------------------------------------
          if (req.body.dataini == '' || req.body.dataprev == '') {
               erros.push({ texto: 'É necessário informar as data de inicio e de previsão de entrega do projeto.' })
          }

          if (validaCampos(req.body.potencia).length > validaCampos(req.body.nome).length > 0) {
               erros.push({ texto: 'O preenchimento dos campos de nome e potencia são obrigatórios.' })
          }
          if (erros.length > 0) {
               Regime.find({ user: _id }).lean().then((regime) => {
                    Pessoa.find({ funges: 'checked', user: _id }).lean().then((pessoas) => {
                         Pessoa.find({ ehVendedor: true, user: _id }).lean().then((vendedor) => {
                              Cliente.find({ user: _id, sissolar: 'checked' }).lean().then((clientes) => {
                                   res.render("projeto/addprojeto", { erros: erros, regime: regime, pessoas: pessoas, vendedor: vendedor, clientes: clientes })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Houve um erro ao encontrar um cliente.')
                                   res.redirect('/cliente/consulta')
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Houve um erro ao encontrar a pessoa.')
                              res.redirect('/configuracao/consultaregime')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve um erro ao encontrar um vendedor<erro>.')
                         res.redirect('/configuracao/consultaregime')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro ao encontrar o regime.')
                    res.redirect('/configuracao/consultaregime')
               })
          } else {
               //Define variável booleana de acordo com o tipo do custo
               if (req.body.tipocusto == 'Diretos') {
                    tipocusto = true
               } else {
                    tipocusto = false
               }
               //Validação de check box  
               var cercamento
               var central
               var poste
               var estsolo

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
                    Configuracao.findOne({ _id: req.body.configuracao }).then((config) => {
                         Cliente.findOne({ _id: req.body.cliente }).then((cliente) => {
                              console.log('config.id=>' + config._id)
                              console.log('config.markup=>' + config.markup)
                              if (req.body.valor == '' || req.body.valor == 0 || req.body.valor == null) {
                                   valorProjeto = (parseFloat(req.body.equipamento) / (1 - (parseFloat(config.markup) / 100))).toFixed(2)
                              } else {
                                   valorProjeto = req.body.valor
                              }
                              console.log('valorProjeto=>' + valorProjeto)
                              if (req.body.checkFatura != null) {
                                   fatequ = true
                                   vlrNFS = valorProjeto
                              } else {
                                   fatequ = false
                                   vlrNFS = parseFloat(valorProjeto) - parseFloat(vlrkit)
                              }
                              console.log('cliente.nome=>'+cliente.nome)
                              const projeto = {
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
                                   cidade: cidade,
                                   uf: uf,
                                   valor: valorProjeto,
                                   vlrnormal: valorProjeto,
                                   data: dia + '/' + mes + '/' + ano,
                                   datareg: datareg,
                                   potencia: req.body.potencia,
                                   ehDireto: tipocusto,
                                   vlrequ: vlrequ,
                                   vlrkit: vlrkit,
                                   fatequ: fatequ,
                                   vlrNFS: vlrNFS,
                                   percom: percom,
                                   vendedor: req.body.vendedor,
                                   regime: req.body.regime,
                                   funres: req.body.gestor,
                                   cliente: req.body.cliente,
                                   temCercamento: cercamento,
                                   temCentral: central,
                                   temPosteCond: poste,
                                   temEstSolo: estsolo,
                                   premissas: req.body.premissas,
                                   vrskwp: (parseFloat(valorProjeto) / parseFloat(req.body.potencia)).toFixed(2),
                                   dataini: req.body.dataini,
                                   dataprev: req.body.dataprev,
                                   valDataPrev: req.body.valDataPrev,
                                   dataord: req.body.dataord,
                                   foiRealizado: false,
                                   executando: false,
                                   parado: false,
                                   orcado: true,
                              }

                              new Projeto(projeto).save().then(() => {

                                   sucesso.push({ texto: 'Projeto criado com sucesso' })
                                   console.log('projeto criado com sucesso')

                                   Projeto.findOne({ user: _id }).sort({ field: 'asc', _id: -1 }).lean().then((projeto) => {
                                        Regime.findOne({ _id: projeto.regime }).lean().then((rp) => {
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
                                                                 sucesso.push({ texto: 'Detalhes dos custos orçados lançados com sucesso.' })
                                                                 Configuracao.findOne({ _id: req.body.configuracao }).lean().then((configuracao) => {
                                                                      Cliente.findOne({ _id: req.body.cliente }).lean().then((cliente) => {
                                                                           Pessoa.findOne({ _id: req.body.gestor }).lean().then((gestao) => {
                                                                                var fatura
                                                                                if (req.body.checkFatura != null) {
                                                                                     fatura = 'checked'
                                                                                } else {
                                                                                     fatura = 'uncheked'
                                                                                }
                                                                                if (req.body.tipocusto == 'Por Hora') {
                                                                                     res.render("projeto/customdo/gestao", { projeto: projeto, sucesso: sucesso, configuracao: configuracao, gestao: gestao, cliente: cliente })
                                                                                } else {
                                                                                     res.render('projeto/custosdiretos', { projeto: projeto, sucesso: sucesso, configuracao: configuracao, rp: rp, vendedor: vendedor, instalador, projetista, cliente: cliente, fatura: fatura })
                                                                                }
                                                                                console.log('fatura=>'+fatura)
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
                         }).catch((err) => {
                              req.flash('error_msg', 'Houve um erro ao encontrar o cliente.')
                              res.redirect('/configuracao/consultaregime')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve um erro ao encontrar a configuração.')
                         res.redirect('/configuracao/consultaregime')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro ao encontrar o vendedor<projeto>.')
                    res.redirect('/configuracao/consultaregime')
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
                              Regime.findOne({ _id: projeto.regime }).lean().then((regime) => {
                                   sucesso.push({ texto: 'Premissas e requisitos salvos com sucesso.' })
                                   res.render('projeto/vermais', { sucesso: sucesso, projeto: projeto, responsavel: responsavel, regime: regime, realizado: realizado })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Nenhum regime encontrado')
                                   res.redirect('/configuracao/consultaregime')
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
               res.redirect('/configuracao/consultaregime')
          })
     }).catch((err) => {
          req.flash('error_msg', 'Houve um erro ao encontrar o projeto')
          res.redirect('/configuracao/consultaregime')
     })
})

router.post('/edicao', ehAdmin, (req, res) => {
     const { _id } = req.user
     var erros = []
     var aviso = []
     var sucesso = []
     var pv
     var rp
     var pr

     if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
          erros.push('Nome inválido')
     }
     if (req.body.checkDatPrev == null && req.body.motivo == '' && req.body.valDataprev == '') {
          erros.push({ texto: 'Para aletar a data de previsão é necessário informar um motivo.' })
     }
     if (erros.length > 0) {

          Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {

               Detalhado.find({ projeto: projeto._id }).then((detalhe) => {

                    Regime.findOne({ _id: projeto.regime }).lean().then((regime_projeto) => {
                         rp = regime_projeto
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao encontrar o regime')
                         res.redirect('/configuracao/consulta')
                    })

                    Pessoa.findOne({ _id: projeto.vendedor }).lean().then((prj_vendedor) => {
                         pv = prj_vendedor
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao encontrar um vendedor')
                         res.redirect('/pessoa/consulta')
                    })

                    Pessoa.findOne({ _id: projeto.funres }).lean().then((pessoa_res) => {
                         pr = pessoa_res
                    }).catch((err) => {
                         req.flash('error_msg', 'Hove uma falha interna')
                         res.redirect('/pessoa/consulta')
                    })

                    Pessoa.find({ funges: 'checked', user: _id }).lean().then((responsavel) => {
                         Pessoa.find({ ehVendedor: true, user: _id }).lean().then((vendedor) => {
                              Regime.find({ user: _id }).lean().then((regime) => {
                                   Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                                        if (projeto.ehDireto == false) {
                                             res.render('projeto/editprojeto', { erros: erros, projeto: projeto, error: erros, regime: regime, rp: rp, pr: pr, responsavel: responsavel, detalhe: detalhe, vendedor: vendedor, pv: pv, cliente: cliente })
                                        } else {
                                             res.render('projeto/editdiretoprincipal', { erros: erros, projeto: projeto, error: erros, regime: regime, rp: rp, pr: pr, responsavel: responsavel, detalhe: detalhe, vendedor: vendedor, pv: pv, cliente: cliente })
                                        }
                                   }).catch((err) => {
                                        req.flash('error_msg', 'Falha interna para encontrar o cliente.')
                                        res.redirect('/pessoa/consulta')
                                   })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Falha interna para encontrar o regime.')
                                   res.redirect('/pessoa/consulta')
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Falha interna para encontrar o vendedor.')
                              res.redirect('/pessoa/consulta')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Falha interna para encontrar um responsável.')
                         res.redirect('/configuracao/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao encontrar os detalhes do projeto<erro>.')
                    res.redirect('/configuracao/consulta')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Não foi possível encontrar o projeto.')
               res.redirect('/menu')
          })

     } else {
          Projeto.findOne({ _id: req.body.id }).then((projeto) => {

               Pessoa.findOne({ _id: req.body.vendedor }).then((prj_vendedor) => {

                    Detalhado.findOne({ projeto: projeto._id }).then((detalhe) => {

                         var checkUni = 'unchecked'

                         //Validação de check box  
                         var cercamento
                         var poste
                         var estsolo
                         var central

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
                         //--Rotina do cadastro dos detalhes
                         var unidadeEqu = 0
                         var unidadeMod = 0
                         var unidadeInv = 0
                         var unidadeEst = 0
                         var unidadeCim = 0
                         var unidadeCab = 0
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

                         var vlrTotal = parseFloat(valorEqu) + parseFloat(valorMod) + parseFloat(valorInv) + parseFloat(valorEst) + parseFloat(valorCim) + parseFloat(valorCab) + parseFloat(valorDisCC) + parseFloat(valorDPSCC) + parseFloat(valorDisCA) + parseFloat(valorDPSCA) + parseFloat(valorSB) + parseFloat(valorCCA) + parseFloat(valorOcp) + parseFloat(valorCer) + parseFloat(valorCen) + parseFloat(valorPos)
                         //console.log('vlrTotal=>' + vlrTotal)

                         //Valida valor do equipameento
                         if (parseFloat(valorEqu) != 0 || parseFloat(valorMod) != 0) {
                              //console.log('valorEqu != 0')
                              vlrequ = vlrTotal
                              vlrkit = parseFloat(valorEqu) + parseFloat(valorMod) + parseFloat(valorInv) + parseFloat(valorEst) + parseFloat(valorCim) + parseFloat(valorCab) + parseFloat(valorDisCC) + parseFloat(valorDPSCC) + parseFloat(valorDisCA) + parseFloat(valorDPSCA) + parseFloat(valorSB) + parseFloat(valorCCA) + parseFloat(valorOcp)
                         } else {
                              //console.log('não tem lançamento manual de kit.')
                              validaequant = parseFloat(projeto.vlrkit) - (parseFloat(detalhe.valorEst) + parseFloat(detalhe.valorCim) + parseFloat(detalhe.valorDisCC) + parseFloat(detalhe.valorDPSCC) + parseFloat(detalhe.valorDisCA) + parseFloat(detalhe.valorDPSCA) + parseFloat(detalhe.valorSB) + parseFloat(detalhe.valorCCA) + parseFloat(detalhe.valorCab))
                              //console.log('validaequant=>' + validaequant)
                              validaequfut = parseFloat(req.body.equipamento) - (parseFloat(valorEst) + parseFloat(valorCim) + parseFloat(valorDisCC) + parseFloat(valorDPSCC) + parseFloat(valorDisCA) + parseFloat(valorDPSCA) + parseFloat(valorSB) + parseFloat(valorCCA) + parseFloat(valorCab))
                              //console.log('validaequfut=>' + validaequfut)
                              if (parseFloat(validaequant) != parseFloat(validaequfut)) {
                                   //console.log('Os valores dos kits são difentes')
                                   if (req.body.equipamento == projeto.vlrkit) {
                                        vlrequ = parseFloat(validaequant) + parseFloat(valorEst) + parseFloat(valorCim) + parseFloat(valorCer) + parseFloat(valorPos) + parseFloat(valorCen) + parseFloat(valorDisCC) + parseFloat(valorDPSCC) + parseFloat(valorDisCA) + parseFloat(valorDPSCA) + parseFloat(valorCab) + parseFloat(valorOcp)
                                        vlrkit = parseFloat(validaequant) + parseFloat(valorEst) + parseFloat(valorCim) + parseFloat(valorDisCC) + parseFloat(valorDPSCC) + parseFloat(valorDisCA) + parseFloat(valorDPSCA) + parseFloat(valorCab)
                                   } else {
                                        vlrequ = parseFloat(req.body.equipamento) + parseFloat(valorEst) + parseFloat(valorCim) + parseFloat(valorCer) + parseFloat(valorCen) + parseFloat(valorPos) + parseFloat(valorDisCC) + parseFloat(valorDPSCC) + parseFloat(valorDisCA) + parseFloat(valorDPSCA) + parseFloat(valorCab) + parseFloat(valorOcp)
                                        vlrkit = parseFloat(req.body.equipamento) + parseFloat(valorEst) + parseFloat(valorCim) + parseFloat(valorDisCC) + parseFloat(valorDPSCC) + parseFloat(valorDisCA) + parseFloat(valorDPSCA) + parseFloat(valorSB) + parseFloat(valorCCA) + parseFloat(valorCab)
                                   }
                              } else {
                                   //console.log('Os valores dos kits são iguais')
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
                              sucesso.push({ texto: 'Detalhes salvos com sucesso.' })
                         }).catch(() => {
                              req.flash('error_msg', 'Houve um erro ao salvar os detalhes do projeto')
                              res.redirect('/projeto/consulta')
                         })

                         //------------------------------------------------------------------
                         if (req.body.checkDatPrev != null && req.body.motivo != '' && req.body.dataprev != '') {
                              projeto.motivo = req.body.motivo
                              projeto.dataprev = req.body.dataprev
                              projeto.valDataPrev = req.body.valDataPrev
                              projeto.ultdat = projeto.dataprev
                              projeto.dataord = projeto.datord
                         }

                         //Alterar data de Início da Instalação
                         projeto.dataIns = req.body.datains
                         projeto.valDataIns = req.body.valDataIns
                         //Altera o vendedor                          
                         var percom
                         var vendedor
                         if (req.body.checkVende != null) {
                              vendedor = req.body.vendedor
                              percom = prj_vendedor.percom
                         } else {
                              vendedor = projeto.vendedor
                              percom = projeto.percom
                         }

                         var vlrNFS = 0
                         if (projeto.fatequ == true) {
                              vlrNFS = parseFloat(req.body.valor)
                         } else {
                              vlrNFS = parseFloat(req.body.valor) - parseFloat(vlrkit)
                         }

                         if (req.body.checkLocal != null && req.body.uf != '' && req.body.cidade != '') {
                              if (req.body.uf != projeto.uf && req.body.uf != projeto.cidade) {
                                   projeto.uf = req.body.uf
                                   projeto.cidade = req.body.cidade
                              }
                         }
                         if (req.body.valor != projeto.valor || req.body.vlrequ != projeto.vlrequ) {
                              aviso.push({ texto: 'Aplique as alterações na aba de gerenciamento e de tributos para recalcular o valor da nota de serviço e valor dos tributos estimados.' })
                              //Validando o markup
                         }
                         if (req.body.valor != projeto.valor) {
                              projeto.markup = 0
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

                         if (req.body.checkRegime != null) {
                              projeto.regime = req.body.regime
                         }
                         if (req.body.checkRes != null) {
                              projeto.funres = req.body.funres
                         }

                         Regime.findOne({ _id: projeto.regime }).lean().then((regime_projeto) => {
                              rp = regime_projeto
                         }).catch((err) => {
                              req.flash('error_msg', 'Houve uma falha ao encontrar o regime')
                              res.redirect('/configuracao/consulta')
                         })

                         projeto.save().then(() => {
                              Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {
                                   //projeto_id = projeto._id
                                   sucesso.push({ texto: 'Projeto salvo com sucesso!' })
                                   Detalhado.findOne({ projeto: projeto._id }).lean().then((detalhe) => {

                                        Regime.findOne({ _id: projeto.regime }).lean().then((regime_projeto) => {
                                             rp = regime_projeto
                                        }).catch((err) => {
                                             req.flash('error_msg', 'Houve uma falha ao encontrar o regime')
                                             res.redirect('/configuracao/consulta')
                                        })
                                        Pessoa.findOne({ _id: projeto.funres }).lean().then((pessoa_res) => {
                                             pr = pessoa_res
                                        }).catch((err) => {
                                             req.flash('error_msg', 'Hove uma falha interna')
                                             res.redirect('/pessoa/consulta')
                                        })
                                        Pessoa.findOne({ _id: projeto.vendedor }).lean().then((prj_vendedor) => {
                                             pv = prj_vendedor
                                        }).catch((err) => {
                                             req.flash('error_msg', 'Houve uma falha ao encontrar um vendedor')
                                             res.redirect('/pessoa/consulta')
                                        })


                                        Pessoa.find({ funges: 'checked', user: _id }).lean().then((responsavel) => {
                                             Pessoa.find({ ehVendedor: true, user: _id }).lean().then((vendedor) => {
                                                  Regime.find({ user: _id }).lean().then((regime) => {
                                                       Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                                                            if (projeto.ehDireto == false) {
                                                                 res.render('projeto/editprojeto', { aviso: aviso, sucesso: sucesso, projeto: projeto, error: erros, regime: regime, rp: rp, pr: pr, responsavel: responsavel, detalhe: detalhe, vendedor: vendedor, pv: pv, cliente: cliente })
                                                            } else {
                                                                 res.render('projeto/editdiretoprincipal', { aviso: aviso, sucesso: sucesso, projeto: projeto, error: erros, regime: regime, rp: rp, pr: pr, responsavel: responsavel, detalhe: detalhe, vendedor: vendedor, pv: pv, cliente: cliente })
                                                            }
                                                       }).catch((err) => {
                                                            req.flash('error_msg', 'Falha interna para encontrar o cliente.')
                                                            res.redirect('/pessoa/consulta')
                                                       })
                                                  }).catch((err) => {
                                                       req.flash('error_msg', 'Falha interna para encontrar o regime.')
                                                       res.redirect('/pessoa/consulta')
                                                  })
                                             }).catch((err) => {
                                                  req.flash('error_msg', 'Falha interna para encontrar um vendedor.')
                                                  res.redirect('/configuracao/consulta')
                                             })
                                        }).catch((err) => {
                                             req.flash('error_msg', 'Falha interna para encontrar um responsável.')
                                             res.redirect('/configuracao/consulta')
                                        })
                                   }).catch((err) => {
                                        req.flash('error_msg', 'Houve uma falha ao encontrar os detalhes do projeto<salvar>.')
                                        res.redirect('/configuracao/consulta')
                                   })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Falha interna para encontrar o projeto.')
                                   res.redirect('/menu')
                              })
                         }).catch(() => {
                              req.flash('error_msg', 'Não foi possível salvar o projeto.')
                              res.redirect('/menu')
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
     var sucesso = []
     var ehSimples = false
     var ehLP = false
     var ehLR = false
     var erros = []
     var rp
     var pi
     var pp

     if (req.body.vlrart == '' || req.body.vlrart == 0) {
          erros.push({ texto: 'Prencheer valor de custo da ART.' })
     }
     if (req.body.totint == '' || req.body.totint == 0) {
          erros.push({ texto: 'Prencheer valor de custo do instalador.' })
     }
     if (req.body.totpro == '' || req.body.totpro == 0) {
          erros.push({ texto: 'Prencheer valor de custo do projetista.' })
     }
     if (req.body.equipe == '' || req.body.equipe == 0) {
          erros.push({ texto: 'Deve ter no mínimo 3 instaladores registrado para o projeto.' })
     }

     if (erros.length > 0) {

          Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {
               //projeto_id = projeto._id
               Detalhado.findOne({ projeto: projeto._id }).lean().then((detalhe) => {
                    Regime.findOne({ _id: projeto.regime }).lean().then((regime_projeto) => {
                         rp = regime_projeto
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao encontrar o regime')
                         res.redirect('/configuracao/consulta')
                    })

                    Pessoa.findOne({ _id: projeto.funres }).lean().then((projeto_funres) => {
                         pr = projeto_funres
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao encontrar o responsável')
                         res.redirect('/pessoa/consulta')
                    })
                    Pessoa.findOne({ _id: projeto.funins }).lean().then((projeto_funins) => {
                         pi = projeto_funins
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao encontrar o instalador')
                         res.redirect('/pessoa/consulta')
                    })
                    Pessoa.findOne({ _id: projeto.funpro }).lean().then((projeto_funpro) => {
                         pp = projeto_funpro
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao encontrar o projetista')
                         res.redirect('/pessoa/consulta')
                    })
                    //Buscar gestor responsável
                    Pessoa.find({ funges: 'checked', user: _id }).lean().then((responsavel) => {
                         //Busca instalador para listar
                         Pessoa.find({ funins: 'checked', user: _id }).lean().then((instalador) => {
                              //Busca projetista para listar
                              Pessoa.find({ funpro: 'checked', user: _id }).lean().then((projetista) => {
                                   Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                                        Regime.find({ user: _id }).lean().then((regime) => {
                                             switch (regime.regime) {
                                                  case "Simples": ehSimples = true
                                                       break;
                                                  case "Lucro Presumido": ehLP = true
                                                       break;
                                                  case "Lucro Real": ehLR = true
                                                       break;
                                             }
                                             res.render('projeto/custosdiretos', { erros: erros, projeto: projeto, regime: regime, rp: rp, instalador: instalador, projetista: projetista, responsavel: responsavel, pr: pr, pi: pi, pp: pp, detalhe: detalhe, ehLP: ehLP, ehLR: ehLR, cliente: cliente })
                                        }).catch((err) => {
                                             req.flash('error_msg', 'Nenhum regime encontrado.')
                                             res.redirect('/menu')
                                        })
                                   }).catch((err) => {
                                        req.flash('error_msg', 'Nenhum cliente encontrado.')
                                        res.redirect('/menu')
                                   })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Houve uma falha ao encontrar o projestista')
                                   res.redirect('/pessoa/consulta')
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Houve uma falha ao encontrar o instalador')
                              res.redirect('/pessoa/consulta')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao encontrar o responsável')
                         res.redirect('/pessoa/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Não foi possíel encontrar os detalhes do projeto')
                    res.redirect('/projeto/consulta')
               })

          }).catch(() => {
               req.flash('error_msg', 'Houve um erro ao encontrar o projeto')
               res.redirect('/menu')
          })

     } else {

          Projeto.findOne({ _id: req.body.id }).then((projeto) => {

               Detalhado.findOne({ projeto: req.body.id }).then((detalhe) => {

                    Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {

                         Regime.findOne({ _id: projeto.regime }).lean().then((rp) => {

                              //projeto_id = projeto._id
                              projeto.qtdequipe = req.body.equipe
                              projeto.nomecliente = cliente.nome

                              if (req.body.diastr == '' || req.body.diastr == 0) {
                                   if (req.body.equipe != '') {
                                        var hrsequ = (parseFloat(req.body.equipe) - 1) * 6
                                        if (req.body.trbint != '' && req.body.trbint > 0) {
                                             var dias = Math.round(parseFloat(req.body.trbint) / parseFloat(hrsequ))
                                             if (dias == 0) { dias = 1 }
                                             projeto.diastr = dias
                                        } else {
                                             projeto.diastr = req.body.diastr
                                        }
                                   }
                              } else {
                                   projeto.diastr = req.body.diastr
                              }
                              //console.log(req.body.equipe)
                              //var vlrDAS = regime.vlrDAS

                              //Determina o valor da horas trabalhadas - individual e total
                              var trbint = req.body.trbint
                              var trbpro = req.body.trbpro
                              var trbger = req.body.tothrs

                              if (trbpro != '' && trbpro > 0 && trbint != '' && trbint > 0) {
                                   projeto.tothrs = parseFloat(trbpro) + parseFloat(trbint)
                              } else {
                                   projeto.tothrs = trbger
                              }
                              projeto.trbint = trbint
                              projeto.trbpro = trbpro
                              //---------------------

                              //Seta os profissionais
                              if (req.body.pinome == '') {
                                   projeto.funins = req.body.funins
                              } else {
                                   if (req.body.checkIns != null) {
                                        projeto.funins = req.body.funins
                                   }
                              }
                              if (req.body.ppnome == '') {
                                   projeto.funpro = req.body.funpro
                              } else {
                                   if (req.body.checkPro != null) {
                                        projeto.funpro = req.body.funpro
                                   }
                              }

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

                              var vlrcom = 0
                              //Validando a comissão
                              if (projeto.percom != null) {
                                   vlrcom = parseFloat(projeto.vlrNFS) * (parseFloat(projeto.percom) / 100)
                                   projeto.vlrcom = vlrcom.toFixed(2)
                              }

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

                              //Definindo o imposto ISS
                              //console.log('regime_prj.alqNFS=>' + regime_prj.alqNFS)
                              var vlrNFS = 0
                              var impNFS = 0
                              var vlrMarkup = 0
                              var prjValor = 0
                              if (req.body.markup == '' || req.body.markup == 0) {
                                   console.log('markup igual a zero')
                                   console.log('projeto.vlrnormal=>' + projeto.vlrnormal)
                                   if (req.body.checkFatura != null) {
                                        fatequ = true
                                        vlrNFS = parseFloat(projeto.vlrnormal)
                                   } else {
                                        fatequ = false
                                        vlrNFS = parseFloat(projeto.vlrnormal) - parseFloat(projeto.vlrkit)
                                   }
                                   prjValor = parseFloat(projeto.vlrnormal).toFixed(2)
                                   projeto.valor = parseFloat(projeto.vlrnormal).toFixed(2)
                                   projeto.markup = 0
                              } else {
                                   console.log('custoTotal=>' + custoTotal)
                                   console.log('req.body.markup=>' + req.body.markup)
                                   vlrMarkup = (custoTotal / (1 - (parseFloat(req.body.markup) / 100))).toFixed(2)
                                   console.log('vlrMarkup=>' + vlrMarkup)
                                   if (req.body.checkFatura != null) {
                                        fatequ = true
                                        vlrNFS = parseFloat(vlrMarkup)
                                   } else {
                                        fatequ = false
                                        vlrNFS = parseFloat(vlrMarkup) - parseFloat(projeto.vlrkit)
                                   }
                                   projeto.markup = req.body.markup
                                   projeto.valor = vlrMarkup
                                   prjValor = parseFloat(vlrMarkup).toFixed(2)
                              }
                              //kWp médio
                              projeto.vrskwp = (parseFloat(prjValor) / parseFloat(projeto.potencia)).toFixed(2)
                              projeto.fatequ = fatequ
                              impNFS = parseFloat(vlrNFS) * (parseFloat(rp.alqNFS) / 100)
                              var vlrcom = 0
                              //Validando a comissão
                              if (projeto.percom != null) {
                                   vlrcom = parseFloat(vlrNFS) * (parseFloat(projeto.percom) / 100)
                                   projeto.vlrcom = vlrcom.toFixed(2)
                              }

                              projeto.vlrNFS = vlrNFS.toFixed(2)
                              projeto.impNFS = impNFS.toFixed(2)

                              console.log('impNFS=>' + impNFS)

                              //Definindo o Lucro Bruto
                              var recLiquida = parseFloat(prjValor) - parseFloat(impNFS)
                              projeto.recLiquida = recLiquida.toFixed(2)

                              var lucroBruto = parseFloat(recLiquida) - parseFloat(projeto.vlrkit)
                              projeto.lucroBruto = lucroBruto.toFixed(2)

                              console.log('vlrNFS=>' + vlrNFS)
                              console.log('vlrcom=>' + vlrcom)
                              console.log('totcop=>' + totcop)
                              console.log('reserva=>' + reserva)
                              console.log('custoPlano=>' + custoPlano)
                              console.log('custoTotal=>' + custoTotal)
                              console.log('lucroBruto=>' + lucroBruto)

                              var desAdm = 0
                              var lbaimp = 0
                              if (parseFloat(rp.desadm) > 0) {
                                   if (rp.tipodesp == 'Percentual') {
                                        desAdm = (parseFloat(rp.desadm) * (parseFloat(rp.perdes) / 100)).toFixed(2)
                                   } else {
                                        desAdm = ((parseFloat(rp.desadm) / parseFloat(rp.estkwp)) * parseFloat(projeto.potencia)).toFixed(2)
                                   }
                                   //console.log('desAdm=>' + desAdm)
                                   lbaimp = (parseFloat(lucroBruto) - parseFloat(custoPlano) - parseFloat(desAdm)).toFixed(2)
                                   projeto.desAdm = parseFloat(desAdm).toFixed(2)
                              } else {
                                   lbaimp = (parseFloat(lbaimp) - parseFloat(custoPlano))
                                   projeto.desAdm = 0
                              }
                              //Deduzindo as comissões do Lucro Antes dos Impostos
                              if (vlrcom == 0 || vlrcom == '') {
                                   lbaimp = parseFloat(lbaimp)
                              } else {
                                   lbaimp = parseFloat(lbaimp) - parseFloat(vlrcom)
                              }
                              projeto.lbaimp = lbaimp.toFixed(2)
                              console.log('lbaimp=>' + lbaimp)

                              var totalSimples = 0
                              var impostoIRPJ
                              var impostoIRPJAdd
                              var impostoCSLL
                              var impostoPIS
                              var impostoCOFINS
                              var totalImposto = 0

                              var fatadd
                              var fataju
                              var aux
                              var prjLR = rp.prjLR
                              var prjLP = rp.prjLP
                              var prjFat = rp.prjFat

                              //console.log('rp.regime=>' + rp.regime)

                              if (rp.regime == 'Simples') {
                                   //console.log('encontrou regime')
                                   //console.log('prjFat=>'+prjFat)
                                   //console.log('rp.alqDAS=>'+rp.alqDAS)
                                   //console.log('rp.vlrred=>'+rp.vlrred)

                                   var alqEfe = ((parseFloat(prjFat) * (parseFloat(rp.alqDAS) / 100)) - (parseFloat(rp.vlrred))) / parseFloat(prjFat)
                                   //console.log('alqEfe=>'+alqEfe)                   
                                   totalSimples = parseFloat(vlrNFS) * (parseFloat(alqEfe))
                                   //console.log('totalSimples=>'+totalSimples)
                                   totalImposto = parseFloat(totalSimples).toFixed()
                                   projeto.impostoSimples = totalSimples.toFixed(2)
                              }

                              else {
                                   if (rp.regime == 'Lucro Real') {
                                        //Imposto Adicional de IRPJ
                                        if ((parseFloat(prjLR) / 12) > 20000) {
                                             fatadd = (parseFloat(prjLR) / 12) - 20000
                                             //console.log('fatadd=>'+fatadd)
                                             fataju = parseFloat(fatadd) * (parseFloat(rp.alqIRPJAdd) / 100)
                                             //console.log('fataju=>'+fataju)
                                             aux = Math.round(parseFloat(fatadd) / parseFloat(lbaimp))
                                             //console.log('aux=>'+aux)
                                             impostoIRPJAdd = parseFloat(fataju) / parseFloat(aux)
                                             //console.log('impostoIRPJAdd=>'+impostoIRPJAdd)
                                             projeto.impostoAdd = impostoIRPJAdd.toFixed(2)
                                        }

                                        impostoIRPJ = parseFloat(lbaimp) * (parseFloat(rp.alqIRPJ) / 100)
                                        console.log('impostoIRPJ=>' + impostoIRPJ)
                                        projeto.impostoIRPJ = impostoIRPJ.toFixed(2)

                                        impostoCSLL = parseFloat(lbaimp) * (parseFloat(rp.alqCSLL) / 100)
                                        console.log('impostoIRPJ=>' + impostoIRPJ)
                                        projeto.impostoCSLL = impostoCSLL.toFixed(2)
                                        impostoPIS = parseFloat(vlrNFS) * 0.5 * (parseFloat(rp.alqPIS) / 100)
                                        console.log('impostoPIS=>' + impostoPIS)
                                        projeto.impostoPIS = impostoPIS.toFixed(2)
                                        impostoCOFINS = parseFloat(vlrNFS) * 0.5 * (parseFloat(rp.alqCOFINS) / 100)
                                        console.log('impostoCOFINS=>' + impostoCOFINS)
                                        projeto.impostoCOFINS = impostoCOFINS.toFixed(2)
                                        if (parseFloat(impostoIRPJAdd) > 0) {
                                             totalImposto = parseFloat(impostoIRPJ) + parseFloat(impostoIRPJAdd) + parseFloat(impostoCSLL) + parseFloat(impostoPIS) + parseFloat(impostoCOFINS)
                                        } else {
                                             totalImposto = parseFloat(impostoIRPJ) + parseFloat(impostoCSLL) + parseFloat(impostoPIS) + parseFloat(impostoCOFINS)
                                        }
                                        console.log('totalImposto=>' + totalImposto)
                                   } else {
                                        //Imposto adicional de IRPJ
                                        if (((parseFloat(prjLP) * 0.32) / 3) > 20000) {
                                             fatadd = ((parseFloat(prjLP) * 0.32) / 3) - 20000
                                             fataju = parseFloat(fatadd) / 20000
                                             impostoIRPJAdd = (parseFloat(vlrNFS) * 0.32) * (parseFloat(fataju) / 100) * (parseFloat(rp.alqIRPJAdd) / 100)
                                             projeto.impostoAdd = impostoIRPJAdd.toFixed(2)
                                        }
                                        impostoIRPJ = parseFloat(vlrNFS) * 0.32 * (parseFloat(rp.alqIRPJ) / 100)
                                        projeto.impostoIRPJ = impostoIRPJ.toFixed(2)
                                        impostoCSLL = parseFloat(vlrNFS) * 0.32 * (parseFloat(rp.alqCSLL) / 100)
                                        projeto.impostoCSLL = impostoCSLL.toFixed(2)
                                        impostoCOFINS = parseFloat(vlrNFS) * (parseFloat(rp.alqCOFINS) / 100)
                                        projeto.impostoCOFINS = impostoCOFINS.toFixed(2)
                                        impostoPIS = parseFloat(vlrNFS) * (parseFloat(rp.alqPIS) / 100)
                                        projeto.impostoPIS = impostoPIS.toFixed(2)
                                        if (parseFloat(impostoIRPJAdd) > 0) {
                                             totalImposto = parseFloat(impostoIRPJ) + parseFloat(impostoIRPJAdd) + parseFloat(impostoCSLL) + parseFloat(impostoPIS) + parseFloat(impostoCOFINS)
                                        } else {
                                             totalImposto = parseFloat(impostoIRPJ) + parseFloat(impostoCSLL) + parseFloat(impostoPIS) + parseFloat(impostoCOFINS)
                                        }
                                   }
                              }

                              //Validar ICMS
                              var impostoICMS
                              if (projeto.fatequ == true) {
                                   if (rp.alqICMS != null) {
                                        impostoICMS = (parseFloat(projeto.vlrkit) / (1 - (parseFloat(rp.alqICMS) / 100))) * (parseFloat(rp.alqICMS) / 100)
                                        projeto.impostoICMS = impostoICMS.toFixed(2)
                                        totalTributos = parseFloat(totalImposto) + parseFloat(impNFS) + parseFloat(impostoICMS)
                                        totalImposto = parseFloat(totalImposto) + parseFloat(impostoICMS)
                                   }
                              } else {
                                   impostoICMS = 0
                                   projeto.impostoICMS = impostoICMS.toFixed(2)
                                   totalTributos = parseFloat(totalImposto) + parseFloat(impNFS)
                              }

                              console.log('totalImposto=>' + totalImposto)
                              projeto.totalImposto = parseFloat(totalImposto).toFixed(2)
                              console.log('totalTributos=>' + totalTributos)
                              projeto.totalTributos = parseFloat(totalTributos).toFixed(2)

                              //Lucro Líquido descontados os impostos
                              var lucroLiquido = 0
                              console.log('lbaimp=>' + lbaimp)
                              console.log('totalTributos=>' + totalTributos)
                              lucroLiquido = parseFloat(lbaimp) - parseFloat(totalImposto)
                              projeto.lucroLiquido = parseFloat(lucroLiquido).toFixed(2)
                              console.log('lucroLiquido=>' + lucroLiquido)

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

                              //Participação sobre o valor total do projeto
                              var parLiqVlr = parseFloat(lucroLiquido) / parseFloat(prjValor) * 100
                              projeto.parLiqVlr = parseFloat(parLiqVlr).toFixed(2)
                              console.log('parLiqVlr=>' + parLiqVlr)
                              var parKitVlr = parseFloat(projeto.vlrkit) / parseFloat(prjValor) * 100
                              projeto.parKitVlr = parseFloat(parKitVlr).toFixed(2)
                              console.log('parKitVlr=>' + parKitVlr)
                              var parIntVlr = parseFloat(totint) / parseFloat(prjValor) * 100
                              projeto.parIntVlr = parseFloat(parIntVlr).toFixed(2)
                              console.log('parIntVlr=>' + parIntVlr)
                              var parGesVlr = parseFloat(totges) / parseFloat(prjValor) * 100
                              projeto.parGesVlr = parseFloat(parGesVlr).toFixed(2)
                              console.log('parGesVlr=>' + parGesVlr)
                              var parProVlr = parseFloat(totpro) / parseFloat(prjValor) * 100
                              projeto.parProVlr = parseFloat(parProVlr).toFixed(2)
                              console.log('parProVlr=>' + parProVlr)
                              var parArtVlr = parseFloat(vlrart) / parseFloat(prjValor) * 100
                              projeto.parArtVlr = parseFloat(parArtVlr).toFixed(2)
                              console.log('parArtVlr=>' + parArtVlr)
                              var parDesVlr = parseFloat(totdes) / parseFloat(prjValor) * 100
                              projeto.parDesVlr = parseFloat(parDesVlr).toFixed(2)
                              console.log('parDesVlr=>' + parDesVlr)
                              var parAliVlr = parseFloat(totali) / parseFloat(prjValor) * 100
                              projeto.parAliVlr = parseFloat(parAliVlr).toFixed(2)
                              console.log('parAliVlr=>' + parAliVlr)
                              var parResVlr = parseFloat(reserva) / parseFloat(prjValor) * 100
                              projeto.parResVlr = parseFloat(parResVlr).toFixed(2)
                              console.log('parResVlr=>' + parResVlr)
                              var parDedVlr = parseFloat(custoPlano) / parseFloat(prjValor) * 100
                              projeto.parDedVlr = parseFloat(parDedVlr).toFixed(2)
                              console.log('parDedVlr=>' + parDedVlr)
                              var parISSVlr = parseFloat(impNFS) / parseFloat(prjValor) * 100
                              projeto.parISSVlr = parseFloat(parISSVlr).toFixed(2)
                              console.log('parISSVlr=>' + parISSVlr)
                              var parImpVlr = parseFloat(totalImposto) / parseFloat(prjValor) * 100
                              projeto.parImpVlr = parseFloat(parImpVlr).toFixed(2)
                              console.log('parImpVlr=>' + parImpVlr)
                              if (vlrcom > 0) {
                                   var parComVlr = parseFloat(vlrcom) / parseFloat(prjValor) * 100
                                   projeto.parComVlr = parseFloat(parComVlr).toFixed(2)
                                   //console.log('parComVlr=>' + parComVlr)
                              }

                              //Participação sobre o Faturamento  
                              var parLiqNfs = parseFloat(lucroLiquido) / parseFloat(vlrNFS) * 100
                              projeto.parLiqNfs = parseFloat(parLiqNfs).toFixed(2)
                              console.log('parLiqNfs=>' + parLiqNfs)
                              console.log('projeto.fatequ=>' + projeto.fatequ)
                              var parKitNfs
                              if (projeto.fatequ == true) {
                                   parKitNfs = parseFloat(projeto.vlrkit) / parseFloat(vlrNFS) * 100
                                   console.log('parKitNfs=>' + parKitNfs)
                                   projeto.parKitNfs = parseFloat(parKitNfs).toFixed(2)
                              } else {
                                   parKitNfs = 0
                                   projeto.parKitNfs = 0
                              }
                              console.log('parKitNfs=>' + parKitNfs)
                              var parIntNfs = parseFloat(totint) / parseFloat(vlrNFS) * 100
                              projeto.parIntNfs = parseFloat(parIntNfs).toFixed(2)
                              console.log('parIntNfs=>' + parIntNfs)
                              var parGesNfs = parseFloat(totges) / parseFloat(vlrNFS) * 100
                              projeto.parGesNfs = parseFloat(parGesNfs).toFixed(2)
                              console.log('parGesNfs=>' + parGesNfs)
                              var parProNfs = parseFloat(totpro) / parseFloat(vlrNFS) * 100
                              projeto.parProNfs = parseFloat(parProNfs).toFixed(2)
                              console.log('parProNfs=>' + parProNfs)
                              var parArtNfs = parseFloat(vlrart) / parseFloat(vlrNFS) * 100
                              projeto.parArtNfs = parseFloat(parArtNfs).toFixed(2)
                              console.log('parArtNfs=>' + parArtNfs)
                              var parDesNfs = parseFloat(totdes) / parseFloat(vlrNFS) * 100
                              projeto.parDesNfs = parseFloat(parDesNfs).toFixed(2)
                              console.log('parDesNfs=>' + parDesNfs)
                              var parAliNfs = parseFloat(totali) / parseFloat(vlrNFS) * 100
                              projeto.parAliNfs = parseFloat(parAliNfs).toFixed(2)
                              console.log('parAliNfs=>' + parAliNfs)
                              var parResNfs = parseFloat(reserva) / parseFloat(vlrNFS) * 100
                              projeto.parResNfs = parseFloat(parResNfs).toFixed(2)
                              console.log('parResNfs=>' + parResNfs)
                              var parDedNfs = parseFloat(custoPlano) / parseFloat(vlrNFS) * 100
                              projeto.parDedNfs = parseFloat(parDedNfs).toFixed(2)
                              console.log('parDedNfs=>' + parDedNfs)
                              var parISSNfs = parseFloat(impNFS) / parseFloat(vlrNFS) * 100
                              projeto.parISSNfs = parseFloat(parISSNfs).toFixed(2)
                              console.log('parISSNfs=>' + parISSNfs)
                              var parImpNfs = (parseFloat(totalImposto) - parseFloat(impNFS)) / parseFloat(vlrNFS) * 100
                              projeto.parImpNfs = parseFloat(parImpNfs).toFixed(2)
                              console.log('parImpNfs=>' + parImpNfs)
                              if (vlrcom > 0) {
                                   var parComNfs = parseFloat(vlrcom) / parseFloat(vlrNFS) * 100
                                   projeto.parComNfs = parseFloat(parComNfs).toFixed(2)
                                   console.log('parComNfs=>' + parComNfs)
                              }
                              var fatura
                              if (req.body.checkFatura != null) {
                                   fatura = 'checked'
                              } else {
                                   fatura = 'uncheked'
                              }
                              //console.log('fatura=>'+fatura)                                

                              projeto.save().then(() => {
                                   sucesso.push({ texto: 'Projeto salvo com sucesso' })
                                   Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {
                                        Pessoa.findOne({ _id: projeto.funins, user: _id }).lean().then((pessoa_ins) => {
                                             pi = pessoa_ins
                                        }).catch((err) => {
                                             req.flash('error_msg', 'Houve uma falha ao encontrar a pessoa')
                                             res.redirect('/pessoa/consulta')
                                        })
                                        Pessoa.findOne({ _id: projeto.funpro, user: _id }).lean().then((pessoa_pro) => {
                                             pp = pessoa_pro
                                        }).catch((err) => {
                                             req.flash('error_msg', 'Houve uma falha ao encontrar a pessoa')
                                             res.redirect('/pessoa/consulta')
                                        })
                                        Pessoa.find({ funins: 'checked', user: _id }).lean().then((instalador) => {
                                             Pessoa.find({ funpro: 'checked', user: _id }).lean().then((projetista) => {
                                                  Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                                                       Regime.findOne({ _id: projeto.regime }).lean().then((regime_projeto) => {
                                                            switch (regime_projeto.regime) {
                                                                 case "Simples": ehSimples = true
                                                                      break;
                                                                 case "Lucro Presumido": ehLP = true
                                                                      break;
                                                                 case "Lucro Real": ehLR = true
                                                                      break;
                                                            }
                                                            rp = regime_projeto
                                                            console.log('sucesso=>' + sucesso)
                                                            console.log('projeto=>' + projeto)
                                                            console.log('rp=>' + rp)
                                                            console.log('pi=>' + pi)
                                                            console.log('pp=>' + pp)
                                                            console.log('instalador=>' + instalador)
                                                            console.log('projetista=>' + projetista)
                                                            console.log('cliente=>' + cliente)
                                                            console.log('fatura=>' + fatura)
                                                            console.log('ehLR=>' + ehLR)
                                                            console.log('ehLP=>' + ehLP)
                                                            console.log('ehSimples=>' + ehSimples)
                                                            console.log('regime_projeto.regime=>' + regime_projeto.regime)


                                                            res.render('projeto/custosdiretos', { sucesso: sucesso, projeto: projeto, rp: rp, pi: pi, pp: pp, instalador: instalador, projetista: projetista, ehLP: ehLP, ehLR: ehLR, ehSimples: ehSimples, cliente: cliente, fatura: fatura })
                                                       }).catch((err) => {
                                                            req.flash('error_msg', 'Houve uma falha ao encontrar o regime.')
                                                            res.redirect('/configuracao/consulta')
                                                       })
                                                  }).catch((err) => {
                                                       req.flash('error_msg', 'Houve uma falha ao encontrar o cliente.')
                                                       res.redirect('/configuracao/consulta')
                                                  })
                                             }).catch((err) => {
                                                  req.flash('error_msg', 'Houve uma falha ao encontrar a pessoa.')
                                                  res.redirect('/pessoa/consulta')
                                             })
                                        }).catch((err) => {
                                             req.flash('error_msg', 'Houve uma falha ao encontrar a pessoa.')
                                             res.redirect('/pessoa/consulta')
                                        })
                                   }).catch(() => {
                                        req.flash('error_msg', 'Houve um erro ao encontrar o projeto.')
                                        res.redirect('/menu')
                                   })

                              }).catch(() => {
                                   req.flash('error_msg', 'Houve um erro ao salvar o projeto.')
                                   res.redirect('/menu')
                              })

                         }).catch((err) => {
                              req.flash('error_msg', 'Não foi possível encontrar o regime.')
                              res.redirect('/configuracao/consultaregime')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve um erro ao encontrar um cliente.')
                         res.redirect('/cliente/consulta')
                    })
               }).catch(() => {
                    req.flash('error_msg', 'Houve um erro ao encontrar os detalhes.')
                    res.redirect('/menu')
               })
          }).catch(() => {
               req.flash('error_msg', 'Houve um erro ao encontrar o projeto.')
               res.redirect('/menu')
          })
     }
})

router.post('/editar/direto', ehAdmin, (req, res) => {
     const { _id } = req.user
     var ehLP = false
     var ehLR = false
     var sucesso = []
     var erros = []
     var fatequ

     if (req.body.vlrart == '' || req.body.vlrart == 0) {
          erros.push({ texto: 'Prencheer valor de custo da ART.' })
     }
     if (req.body.totint == '' || req.body.totint == 0) {
          erros.push({ texto: 'Prencheer valor de custo do instalador.' })
     }
     if (req.body.totpro == '' || req.body.totpro == 0) {
          erros.push({ texto: 'Prencheer valor de custo do projetista.' })
     }
     if (req.body.equipe == '' || req.body.equipe == 0) {
          erros.push({ texto: 'Deve ter no mínimo 3 instaladores registrado para o projeto.' })
     }

     if (erros.length > 0) {

          Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {
               //projeto_id = projeto._id
               Detalhado.findOne({ projeto: projeto._id }).lean().then((detalhe) => {
                    Regime.findOne({ _id: projeto.regime }).lean().then((regime_projeto) => {
                         rp = regime_projeto
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao encontrar o regime')
                         res.redirect('/configuracao/consulta')
                    })

                    Pessoa.findOne({ _id: projeto.funres }).lean().then((projeto_funres) => {
                         pr = projeto_funres
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao encontrar o responsável')
                         res.redirect('/pessoa/consulta')
                    })
                    Pessoa.findOne({ _id: projeto.funins }).lean().then((projeto_funins) => {
                         pi = projeto_funins
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao encontrar o instalador')
                         res.redirect('/pessoa/consulta')
                    })
                    Pessoa.findOne({ _id: projeto.funpro }).lean().then((projeto_funpro) => {
                         pp = projeto_funpro
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao encontrar o projetista')
                         res.redirect('/pessoa/consulta')
                    })
                    //Buscar gestor responsável
                    Pessoa.find({ funges: 'checked', user: _id }).lean().then((responsavel) => {
                         //Busca instalador para listar
                         Pessoa.find({ funins: 'checked', user: _id }).lean().then((instalador) => {
                              //Busca projetista para listar
                              Pessoa.find({ funpro: 'checked', user: _id }).lean().then((projetista) => {
                                   Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                                        Regime.find({ user: _id }).lean().then((regime) => {
                                             switch (regime.regime) {
                                                  case "Simples": ehSimples = true
                                                       break;
                                                  case "Lucro Presumido": ehLP = true
                                                       break;
                                                  case "Lucro Real": ehLR = true
                                                       break;
                                             }
                                             res.render('projeto/custosdiretos', { erros: erros, projeto: projeto, regime: regime, rp: rp, instalador: instalador, projetista: projetista, responsavel: responsavel, pr: pr, pi: pi, pp: pp, detalhe: detalhe, ehLP: ehLP, ehLR: ehLR, cliente: cliente })
                                        }).catch((err) => {
                                             req.flash('error_msg', 'Nenhum regime encontrado.')
                                             res.redirect('/menu')
                                        })
                                   }).catch((err) => {
                                        req.flash('error_msg', 'Nenhum cliente encontrado.')
                                        res.redirect('/menu')
                                   })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Houve uma falha ao encontrar o projestista')
                                   res.redirect('/pessoa/consulta')
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Houve uma falha ao encontrar o instalador')
                              res.redirect('/pessoa/consulta')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao encontrar o responsável')
                         res.redirect('/pessoa/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Não foi possíel encontrar os detalhes do projeto')
                    res.redirect('/projeto/consulta')
               })

          }).catch(() => {
               req.flash('error_msg', 'Houve um erro ao encontrar o projeto')
               res.redirect('/menu')
          })

     } else {

          Projeto.findOne({ _id: req.body.id }).then((projeto) => {

               Detalhado.findOne({ projeto: req.body.id }).then((detalhe) => {

                    Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {

                         Regime.findOne({ _id: projeto.regime }).lean().then((regime_prj) => {
                              //console.log('entrou')
                              //Valida informações para o cálculo dos impostos e lucros
                              //--> cálculo automático dos dias de obra
                              projeto.nomecliente = cliente.nome
                              projeto.qtdequipe = req.body.equipe
                              if (req.body.diastr == '' || req.body.diastr == 0) {
                                   //console.log('dias de obra igual a zero')
                                   if (req.body.equipe != '' && req.body.equipe > 0) {
                                        var hrsequ = (parseFloat(req.body.equipe) - 1) * 6
                                        if (req.body.trbint != '' && req.body.trbint > 0) {
                                             projeto.qtdequipe = req.body.equipe
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
                              //var vlrDAS = regime.vlrDAS

                              //--> cálculo das horas totais trabalhadas a partir de lançamento manual
                              var trbint = req.body.trbint
                              var trbpro = req.body.trbpro
                              var trbger = req.body.tothrs

                              if (trbpro != '' && trbpro > 0 && trbint != '' && trbint > 0) {
                                   projeto.tothrs = parseFloat(trbpro) + parseFloat(trbint)
                              } else {
                                   projeto.tothrs = trbger
                              }
                              projeto.trbint = trbint
                              projeto.trbpro = trbpro
                              //------------------------------
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

                              //Definindo o imposto ISS
                              //console.log('regime_prj.alqNFS=>' + regime_prj.alqNFS)
                              var vlrNFS = 0
                              var impNFS = 0
                              var vlrMarkup = 0
                              var prjValor = 0
                              if (req.body.markup == '' || req.body.markup == 0) {
                                   //console.log('markup igual a zero')
                                   //console.log('projeto.vlrnormal=>'+projeto.vlrnormal)
                                   if (req.body.checkFatura != null) {
                                        fatequ = true
                                        vlrNFS = parseFloat(projeto.vlrnormal)
                                   } else {
                                        fatequ = false
                                        vlrNFS = parseFloat(projeto.vlrnormal) - parseFloat(projeto.vlrkit)
                                   }
                                   prjValor = parseFloat(projeto.vlrnormal).toFixed(2)
                                   projeto.valor = parseFloat(projeto.vlrnormal).toFixed(2)
                                   projeto.markup = 0
                              } else {
                                   //console.log('custoTotal=>'+custoTotal)
                                   //console.log('req.body.markup=>'+req.body.markup)
                                   vlrMarkup = (custoTotal / (1 - (parseFloat(req.body.markup) / 100))).toFixed(2)
                                   //console.log('vlrMarkup=>' + vlrMarkup)
                                   if (req.body.checkFatura != null) {
                                        fatequ = true
                                        vlrNFS = parseFloat(vlrMarkup)
                                   } else {
                                        fatequ = false
                                        vlrNFS = parseFloat(vlrMarkup) - parseFloat(projeto.vlrkit)
                                   }
                                   projeto.markup = req.body.markup
                                   projeto.valor = vlrMarkup
                                   prjValor = parseFloat(vlrMarkup).toFixed(2)
                              }
                              //kWp médio
                              projeto.vrskwp = (parseFloat(prjValor) / parseFloat(projeto.potencia)).toFixed(2)
                              projeto.fatequ = fatequ
                              impNFS = parseFloat(vlrNFS) * (parseFloat(regime_prj.alqNFS) / 100)
                              var vlrcom = 0
                              //Validando a comissão
                              if (projeto.percom != null) {
                                   vlrcom = parseFloat(vlrNFS) * (parseFloat(projeto.percom) / 100)
                                   projeto.vlrcom = vlrcom.toFixed(2)
                              }

                              projeto.vlrNFS = vlrNFS.toFixed(2)
                              projeto.impNFS = impNFS.toFixed(2)

                              //console.log('impNFS=>' + impNFS)
                              //console.log('projeto.valor=>' + projeto.valor)

                              //Definindo o Lucro Bruto
                              var recLiquida = parseFloat(prjValor) - parseFloat(impNFS)
                              projeto.recLiquida = recLiquida.toFixed(2)

                              var lucroBruto = parseFloat(recLiquida) - parseFloat(projeto.vlrkit)
                              projeto.lucroBruto = lucroBruto.toFixed(2)

                              //console.log('vlrNFS=>' + vlrNFS)
                              //console.log('vlrcom=>' + vlrcom)
                              //console.log('totcop=>' + totcop)
                              //console.log('reserva=>' + reserva)
                              //console.log('custoPlano=>' + custoPlano)
                              //console.log('custoTotal=>' + custoTotal)
                              //console.log('lucroBruto=>' + lucroBruto)

                              var desAdm = 0
                              var lbaimp = 0
                              if (parseFloat(regime_prj.desadm) > 0) {
                                   if (regime_prj.tipodesp == 'Percentual') {
                                        desAdm = (parseFloat(regime_prj.desadm) * (parseFloat(regime_prj.perdes) / 100)).toFixed(2)
                                   } else {
                                        desAdm = ((parseFloat(regime_prj.desadm) / parseFloat(regime_prj.estkwp)) * parseFloat(projeto.potencia)).toFixed(2)
                                   }
                                   //console.log('desAdm=>' + desAdm)
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
                              var prjLR = regime_prj.prjLR
                              var prjLP = regime_prj.prjLP
                              var prjFat = regime_prj.prjFat

                              var totalSimples
                              var impostoIRPJ
                              var impostoIRPJAdd
                              var impostoPIS
                              var impostoCOFINS
                              var totalImposto

                              if (regime_prj.regime == 'Simples') {
                                   //console.log('entrou simples')
                                   var alqEfe = ((parseFloat(prjFat) * (parseFloat(regime_prj.alqDAS) / 100)) - (parseFloat(regime_prj.vlrred))) / parseFloat(prjFat)
                                   totalSimples = parseFloat(vlrNFS) * (parseFloat(alqEfe))
                                   //console.log('totalSimples=>' + totalSimples)
                                   totalImposto = parseFloat(totalSimples).toFixed(2)
                                   //console.log('totalImposto=>' + totalImposto)
                                   projeto.impostoSimples = parseFloat(totalImposto).toFixed(2)
                              }

                              else {
                                   if (regime_prj.regime == 'Lucro Real') {
                                        //Imposto Adicional de IRPJ
                                        if ((parseFloat(prjLR) / 12) > 20000) {
                                             fatadd = (parseFloat(prjLR) / 12) - 20000
                                             //console.log('fatadd=>' + fatadd)
                                             fataju = parseFloat(fatadd) * (parseFloat(regime_prj.alqIRPJAdd) / 100)
                                             //console.log('fataju=>' + fataju)
                                             aux = parseFloat(fatadd) / parseFloat(lbaimp)
                                             //console.log('aux=>' + aux)
                                             impostoIRPJAdd = parseFloat(fataju) / parseFloat(aux)
                                             //console.log('impostoIRPJAdd=>' + impostoIRPJAdd)
                                             projeto.impostoAdd = impostoIRPJAdd.toFixed(2)
                                        }

                                        impostoIRPJ = parseFloat(lbaimp) * (parseFloat(regime_prj.alqIRPJ) / 100)
                                        projeto.impostoIRPJ = impostoIRPJ.toFixed(2)

                                        impostoCSLL = parseFloat(lbaimp) * (parseFloat(regime_prj.alqCSLL) / 100)
                                        projeto.impostoCSLL = impostoCSLL.toFixed(2)
                                        impostoPIS = parseFloat(vlrNFS) * 0.5 * (parseFloat(regime_prj.alqPIS) / 100)
                                        projeto.impostoPIS = impostoPIS.toFixed(2)
                                        impostoCOFINS = parseFloat(vlrNFS) * 0.5 * (parseFloat(regime_prj.alqCOFINS) / 100)
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
                                             impostoIRPJAdd = (parseFloat(vlrNFS) * 0.32) * (parseFloat(fataju) / 100) * (parseFloat(regime_prj.alqIRPJAdd) / 100)
                                             projeto.impostoAdd = impostoIRPJAdd.toFixed(2)
                                        }
                                        //console.log('Lucro Presumido')

                                        impostoIRPJ = parseFloat(vlrNFS) * 0.32 * (parseFloat(regime_prj.alqIRPJ) / 100)
                                        projeto.impostoIRPJ = impostoIRPJ.toFixed(2)
                                        //console.log('IRPJ=>' + impostoIRPJ)
                                        impostoCSLL = parseFloat(vlrNFS) * 0.32 * (parseFloat(regime_prj.alqCSLL) / 100)
                                        projeto.impostoCSLL = impostoCSLL.toFixed(2)
                                        //console.log('CSLL=>' + impostoCSLL)
                                        impostoCOFINS = parseFloat(vlrNFS) * (parseFloat(regime_prj.alqCOFINS) / 100)
                                        projeto.impostoCOFINS = impostoCOFINS.toFixed(2)
                                        //console.log('COFINS=>' + impostoCOFINS)
                                        impostoPIS = parseFloat(vlrNFS) * (parseFloat(regime_prj.alqPIS) / 100)
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
                                   if (regime_prj.alqICMS != null) {
                                        impostoICMS = (parseFloat(projeto.vlrkit) / (1 - (parseFloat(regime_prj.alqICMS) / 100))) * (parseFloat(regime_prj.alqICMS) / 100)
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
                              var parISSVlr = parseFloat(impNFS) / parseFloat(prjValor) * 100
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
                              var parISSNfs = parseFloat(impNFS) / parseFloat(vlrNFS) * 100
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
                              //console.log('fatura=>'+fatura)                              

                              projeto.save().then(() => {
                                   sucesso.push({ texto: 'Projeto salvo com sucesso' })
                                   Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {
                                        Pessoa.findOne({ _id: projeto.funins, user: _id }).lean().then((pessoa_ins) => {
                                             pi = pessoa_ins
                                        }).catch((err) => {
                                             req.flash('error_msg', 'Houve uma falha ao encontrar a pessoa')
                                             res.redirect('/pessoa/consulta')
                                        })
                                        Pessoa.findOne({ _id: projeto.funpro, user: _id }).lean().then((pessoa_pro) => {
                                             pp = pessoa_pro
                                        }).catch((err) => {
                                             req.flash('error_msg', 'Houve uma falha ao encontrar a pessoa')
                                             res.redirect('/pessoa/consulta')
                                        })
                                        Pessoa.find({ funins: 'checked', user: _id }).lean().then((instalador) => {
                                             Pessoa.find({ funpro: 'checked', user: _id }).lean().then((projetista) => {
                                                  Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                                                       Regime.findOne({ _id: projeto.regime }).lean().then((regime_projeto) => {
                                                            switch (regime_projeto.regime) {
                                                                 case "Simples": ehSimples = true
                                                                      break;
                                                                 case "Lucro Presumido": ehLP = true
                                                                      break;
                                                                 case "Lucro Real": ehLR = true
                                                                      break;
                                                            }
                                                            rp = regime_projeto

                                                            res.render('projeto/editcustosdiretos', { sucesso: sucesso, projeto: projeto, rp: rp, pi: pi, pp: pp, instalador: instalador, projetista: projetista, ehLP: ehLP, ehLR: ehLR, cliente: cliente, fatura: fatura })
                                                       }).catch((err) => {
                                                            req.flash('error_msg', 'Houve uma falha ao encontrar o regime.')
                                                            res.redirect('/configuracao/consulta')
                                                       })
                                                  }).catch((err) => {
                                                       req.flash('error_msg', 'Houve uma falha ao encontrar o cliente.')
                                                       res.redirect('/configuracao/consulta')
                                                  })
                                             }).catch((err) => {
                                                  req.flash('error_msg', 'Houve uma falha ao encontrar a pessoa.')
                                                  res.redirect('/pessoa/consulta')
                                             })
                                        }).catch((err) => {
                                             req.flash('error_msg', 'Houve uma falha ao encontrar a pessoa.')
                                             res.redirect('/pessoa/consulta')
                                        })
                                   }).catch(() => {
                                        req.flash('error_msg', 'Houve um erro ao encontrar o projeto.')
                                        res.redirect('/menu')
                                   })
                              }).catch(() => {
                                   req.flash('error_msg', 'Houve um erro ao salvar o projeto.')
                                   res.redirect('/menu')
                              })

                         }).catch((err) => {
                              req.flash('error_msg', 'Não foi possível encontrar o regime do projeto.')
                              res.redirect('/configuracao/consulta')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve um erro ao encontrar um cliente.')
                         res.redirect('/cliente/consulta')
                    })
               }).catch(() => {
                    req.flash('error_msg', 'Houve um erro ao encontrar os detalhes.')
                    res.redirect('/menu')
               })
          }).catch(() => {
               req.flash('error_msg', 'Houve um erro ao encontrar o projeto.')
               res.redirect('/menu')
          })
     }
})

router.post('/realizar', ehAdmin, (req, res) => {
     const { _id } = req.user
     var erros = []

     if (parseFloat(req.body.orcCP) == 0) {
          erros.push({ texto: 'Para realizar o projeto é necessário que os custos orçados sejam maiores que zero.' })

          Projeto.findOne({ _id: req.body.id }).then((projeto) => {
               Realizado.findOne({ projeto: projeto._id }).lean().then((realizado) => {
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
                         var varTI = (realizado.totalImposto - projeto.totalImposto).toFixed(2)
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
                         sucesso.push({ texto: 'Projeto realizado com sucesso.' })
                         res.render('projeto/realizado', { sucesso: sucesso, projeto: projeto, realizado: realizado, detalhe: detalhe, varCustoPlano: varCustoPlano, varLucroBruto: varLucroBruto, varlbaimp: varlbaimp, varLucroLiquido: varLucroLiquido, varTI: varTI, varLL: varLL, varLAI: varLAI, varCP: varCP, temCercamento: temCercamento, temPosteCond: temPosteCond, temCentral: temCentral })
                    }).catch((err) => {
                         req.flash('error_msg', 'Detalhe não encontrado.')
                         res.redirect('/projeto/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Realizado não encontrado.')
                    res.redirect('/projeto/consulta')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Projeto não encontrado.')
               res.render('projeto/realizado', { projeto: projeto, erros: erros })
          })

     } else {

          Projeto.findOne({ _id: req.body.id }).then((projeto) => {
               Detalhado.findOne({ projeto: req.body.id }).then((detalhe) => {
                    Regime.findOne({ _id: projeto.regime }).then((rp) => {
                         Realizado.findOne({ projeto: req.body.id }).then((realizado) => {
                              if (realizado != null) {
                                   realizado.remove()
                              }

                         }).catch((err) => {
                              req.flash('error_msg', 'Realizado não encontrado')
                              res.redirect('/projeto/consulta')
                         })

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
                              totint = 0
                         }
                         if (req.body.totges != '') {
                              totges = req.body.totges
                         } else {
                              totges = 0
                         }
                         if (req.body.totpro != '') {
                              totpro = req.body.totpro
                         } else {
                              totpro = 0
                         }
                         if (req.body.vlrart != '') {
                              vlrart = req.body.vlrart
                         } else {
                              vlrart = 0
                         }
                         if (req.body.totali != '') {
                              totali = req.body.totali
                         } else {
                              totali = 0
                         }
                         if (projeto.ehDireto == true) {
                              tothtl = 0
                              totcmb = 0
                              if (req.body.totdes != '') {
                                   totdes = req.body.totdes
                              } else {
                                   totdes = 0
                              }
                         } else {
                              totdes = 0

                              tothtl = 0
                              if (projeto.ehDireto == false) {
                                   if (req.body.tothtl != '') {
                                        tothtl = req.body.tothtl
                                   } else {
                                        tothtl = 0
                                   }
                              }
                              totcmb = 0
                              if (projeto.ehDireto == false) {
                                   if (req.body.totcmb != '') {
                                        totcmb = req.body.totcmb
                                   } else {
                                        totcmb = 0
                                   }
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
                         //console.log('valorPos=>' + valorPos)
                         //console.log('valorCer=>' + valorCer)
                         //console.log('valorCen=>' + valorCen)

                         var custoFix = parseFloat(totint) + parseFloat(totges) + parseFloat(totpro) + parseFloat(vlrart)
                         //console.log('custoFix=>' + custoFix)
                         var custoVar = parseFloat(totali) + parseFloat(totdes) + parseFloat(totcmb) + parseFloat(tothtl)
                         //console.log('custoVar=>' + custoVar)
                         var custoEst = parseFloat(valorCer) + parseFloat(valorPos) + parseFloat(valorCen)
                         //console.log('custoEst=>' + custoEst)
                         totalPlano = parseFloat(custoFix) + parseFloat(custoVar) + parseFloat(custoEst)
                         //console.log('totalPlano=>' + totalPlano)
                         //console.log('totalPlano=>' + totalPlano)

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
                              vlrPrjNFS = parseFloat(projeto.valor)
                         } else {
                              vlrPrjNFS = parseFloat(projeto.valor) - parseFloat(vlrkit)
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
                              if (req.body.impISS == '' || parseFloat(req.body.impISS) == null) {
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
                              vlrcom = 0
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
                         var parISSVlr = (parseFloat(impISS) / parseFloat(prjValor)) * 100
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
                         var parISSNfs = (parseFloat(impISS) / parseFloat(vlrPrjNFS)) * 100
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
                         var datafim
                         var valDataFim
                         if (req.body.datafim != '') {
                              datafim = req.body.datafim
                              valDataFim = req.body.valDataFim
                         } else {
                              datafim = 0
                              valDataFim = 0
                         }
                         projeto.datafim = datafim
                         projeto.valDataFim = valDataFim

                         var datareg = ano + mes + dia
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


                         const realizado = {
                              user: _id,
                              projeto: prj_id,
                              potencia: projeto.potencia,
                              foiRealizado: false,
                              nome: projeto.nome,
                              cliente: projeto.nomecliente,
                              dataini: projeto.dataini,
                              datafim: datafim,
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
                              var sucesso = []

                              projeto.foiRealizado = true
                              projeto.homologado = false

                              projeto.save().then(() => {
                                   Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {
                                        Realizado.findOne({ projeto: projeto._id }).lean().then((realizado) => {
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
                                                  var varTotalImposto = (realizado.totalImposto - projeto.totalImposto).toFixed(2)
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

                                                  sucesso.push({ texto: 'Projeto realizado com sucesso.' })
                                                  res.render('projeto/realizado', { sucesso: sucesso, projeto: projeto, realizado: realizado, detalhe: detalhe, varCustoPlano: varCustoPlano, varTotalImposto: varTotalImposto, varlbaimp: varlbaimp, varLucroLiquido: varLucroLiquido, varTI: varTI, varLL: varLL, varLAI: varLAI, varCP: varCP, temCercamento: temCercamento, temPosteCond: temPosteCond, temCentral: temCentral })
                                             }).catch((err) => {
                                                  req.flash('error_msg', 'Nenhum regime encontrado.')
                                                  res.redirect('/menu')
                                             })
                                        }).catch((err) => {
                                             req.flash('error_msg', 'Detalhe não encontrado.')
                                             res.redirect('/projeto/consulta')
                                        })

                                   }).catch((err) => {
                                        req.flash('error_msg', 'Não foi possível encontrar o projeto.')
                                        res.redirect('/projeto/consulta')
                                   })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Não foi possível salvar o projeto.')
                                   res.redirect('/projeto/consulta')
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Não foi posível realizar o projeto.')
                              res.redirect('/projeto/consulta')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Regime não encontrado.')
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
     var foirealizado
     var ehdireto
     var funres = req.body.funres
     var direto = req.body.direto
     var realizado = req.body.realizado

     if (realizado == 'Todos' && direto == 'Todos' && funres == 'Todos') {
          Projeto.find({ user: _id }).lean().then((projetos) => {
               Pessoa.find({ funges: 'checked' }).lean().then((responsavel) => {
                    res.render('projeto/findprojetos', { projetos: projetos, responsavel: responsavel, filDireto: 'Todos', filReal: 'Todos' })
               }).catch((err) => {
                    req.flash('error_msg', 'Nenhum responsável encontrado')
                    res.redirect('/projeto/consulta')
               })
          })
     } else {
          if (funres == 'Todos') {
               if (realizado == 'Todos') {
                    if (direto == 'Direto') {
                         ehdireto = true
                    } else {
                         ehdireto = false
                    }
                    Projeto.find({ ehDireto: ehdireto, user: _id }).lean().then((projetos) => {
                         Pessoa.find({ funges: 'checked', user: _id }).lean().then((responsavel) => {
                              res.render('projeto/findprojetos', { projetos: projetos, responsavel: responsavel, filDireto: direto, filReal: realizado })
                         }).catch((err) => {
                              req.flash('error_msg', 'Nenhum responsável encontrado')
                              res.redirect('/projeto/consulta')
                         })
                    })
               } else {
                    if (direto == 'Todos') {
                         if (realizado == 'Sim') {
                              foirealizado = true
                         } else {
                              foirealizado = false
                         }
                         Projeto.find({ foiRealizado: foirealizado, user: _id }).lean().then((projetos) => {
                              Pessoa.find({ funges: 'checked', user: _id }).lean().then((responsavel) => {
                                   res.render('projeto/findprojetos', { projetos: projetos, responsavel: responsavel, filDireto: direto, filReal: realizado })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Nenhum responsável encontrado')
                                   res.redirect('/projeto/consulta')
                              })
                         })
                    } else {
                         if (realizado == 'Sim') {
                              foirealizado = true
                         } else {
                              foirealizado = false
                         }
                         if (direto == 'Direto') {
                              ehdireto = true
                         } else {
                              ehdireto = false
                         }
                         Projeto.find({ ehDireto: ehdireto, foiRealizado: foirealizado, user: _id }).lean().then((projetos) => {
                              Pessoa.find({ funges: 'checked', user: _id }).lean().then((responsavel) => {
                                   res.render('projeto/findprojetos', { projetos: projetos, responsavel: responsavel, filDireto: direto, filReal: realizado })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Nenhum responsável encontrado')
                                   res.redirect('/projeto/consulta')
                              })
                         })
                    }
               }
          } else {
               if (funres != 'Todos') {
                    if (realizado == 'Todos' && direto == 'Todos') {
                         Pessoa.findOne({ nome: funres, user: _id }).lean().then((pr) => {
                              Projeto.find({ funres: pr._id }).lean().then((projetos) => {
                                   Pessoa.find({ funges: 'checked', user: _id }).lean().then((responsavel) => {
                                        res.render('projeto/findprojetos', { projetos: projetos, responsavel: responsavel, pr: pr, filDireto: direto, filReal: realizado })
                                   }).catch((err) => {
                                        req.flash('error_msg', 'Nenhum responsável encontrado')
                                        res.redirect('/projeto/consulta')
                                   })

                              })
                         })
                    } else {
                         if (realizado == 'Todos') {
                              if (direto == 'Direto') {
                                   ehdireto = true
                              } else {
                                   ehdireto = false
                              }
                              Pessoa.findOne({ nome: funres, user: _id }).lean().then((pr) => {
                                   Projeto.find({ funres: pr._id, ehDireto: ehdireto }).lean().then((projetos) => {
                                        Pessoa.find({ funges: 'checked', user: _id }).lean().then((responsavel) => {
                                             res.render('projeto/findprojetos', { projetos: projetos, responsavel: responsavel, pr: pr, filDireto: direto, filReal: realizado })
                                        }).catch((err) => {
                                             req.flash('error_msg', 'Nenhum responsável encontrado')
                                             res.redirect('/projeto/consulta')
                                        })
                                   })
                              })
                         } else {
                              if (direto == 'Todos') {
                                   if (realizado == 'Sim') {
                                        foirealizado = true
                                   } else {
                                        foirealizado = false
                                   }
                                   Pessoa.findOne({ nome: funres, user: _id }).lean().then((pr) => {
                                        Projeto.find({ funres: pr._id, foiRealizado: foirealizado }).lean().then((projetos) => {
                                             Pessoa.find({ funges: 'checked', user: _id }).lean().then((responsavel) => {
                                                  res.render('projeto/findprojetos', { projetos: projetos, responsavel: responsavel, pr: pr, filDireto: direto, filReal: realizado })
                                             }).catch((err) => {
                                                  req.flash('error_msg', 'Nenhum responsável encontrado')
                                                  res.redirect('/projeto/consulta')
                                             })
                                        })
                                   })
                              } else {
                                   if (realizado == 'Sim') {
                                        foirealizado = true
                                   } else {
                                        foirealizado = false
                                   }
                                   if (direto == 'Direto') {
                                        ehdireto = true
                                   } else {
                                        ehdireto = false
                                   }
                                   Pessoa.findOne({ nome: funres, user: _id }).lean().then((pr) => {
                                        Projeto.find({ funres: pr._id, ehDireto: ehdireto, foiRealizado: foirealizado }).lean().then((projetos) => {
                                             Pessoa.find({ funges: 'checked', user: _id }).lean().then((responsavel) => {
                                                  res.render('projeto/findprojetos', { projetos: projetos, responsavel: responsavel, pr: pr, filDireto: direto, filReal: realizado })
                                             }).catch((err) => {
                                                  req.flash('error_msg', 'Nenhum responsável encontrado')
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
               if (realizado.datafim == 0) {
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
                    var varLucroBruto = (realizado.lucroBruto - projeto.lucroBruto).toFixed(2)
                    if (varLucroBruto > 1) {
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
                    res.render('projeto/realizado', { erros: erros, projeto: projeto, realizado: realizado, varCustoPlano: varCustoPlano, varLucroBruto: varLucroBruto, varlbaimp: varlbaimp, varLucroLiquido: varLucroLiquido, varTI: varTI, varLL: varLL, varLAI: varLAI, varCP: varCP })
               } else {
                    res.render('projeto/confirmafinalizar', { realizado: realizado })
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
                              var varLucroBruto = (realizado.lucroBruto - projeto.lucroBruto).toFixed(2)
                              if (varLucroBruto > 1) {
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
                              res.render('projeto/realizado', { sucesso: sucesso, projeto: projeto, realizado: realizado, detalhe: detalhe, varCustoPlano: varCustoPlano, varLucroBruto: varLucroBruto, varlbaimp: varlbaimp, varLucroLiquido: varLucroLiquido, varTI: varTI, varLL: varLL, varLAI: varLAI, varCP: varCP, temCercamento: temCercamento, temPosteCond: temPosteCond, temCentral: temCentral })
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
     var aviso = []
     var pv
     var pr
     var rp
     const { _id } = req.user

     Projeto.findOne({ _id: req.params.id }).then((projeto_executa) => {
          if (parseFloat(projeto_executa.custoTotal) > 0) {
               projeto_executa.executando = true
               projeto_executa.parado = false
               projeto_executa.orcado = false
               aviso.push({ texto: 'Projeto em execução!' })
          } else {
               aviso.push({ texto: 'Os custos do projeto devem ser preenchidos para executar o projeto!' })
          }
          projeto_executa.save().then(() => {
               Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {

                    Regime.findOne({ _id: projeto.regime }).lean().then((regime_projeto) => {
                         rp = regime_projeto
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao encontrar o regime')
                         res.redirect('/configuracao/consulta')
                    })
                    Pessoa.findOne({ _id: projeto.funres }).lean().then((pessoa_res) => {
                         pr = pessoa_res
                    }).catch((err) => {
                         req.flash('error_msg', 'Hove uma falha interna')
                         res.redirect('/pessoa/consulta')
                    })
                    Pessoa.findOne({ _id: projeto.vendedor }).lean().then((prj_vendedor) => {
                         pv = prj_vendedor
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao encontrar um vendedor')
                         res.redirect('/pessoa/consulta')
                    })
                    Detalhado.findOne({ projeto: req.params.id }).lean().then((detalhe) => {
                         Pessoa.find({ funges: 'checked', user: _id }).lean().then((responsavel) => {
                              Pessoa.find({ ehVendedor: true, user: _id }).lean().then((vendedor) => {
                                   Regime.find({ user: _id }).lean().then((regime) => {
                                        Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                                             if (projeto.ehDireto == false) {
                                                  res.render('projeto/editprojeto', { aviso: aviso, projeto: projeto, regime: regime, rp: rp, pr: pr, responsavel: responsavel, detalhe: detalhe, vendedor: vendedor, pv: pv, cliente: cliente })
                                             } else {
                                                  res.render('projeto/editdiretoprincipal', { aviso: aviso, projeto: projeto, regime: regime, rp: rp, pr: pr, responsavel: responsavel, detalhe: detalhe, vendedor: vendedor, pv: pv, cliente: cliente })
                                             }
                                        }).catch((err) => {
                                             req.flash('error_msg', 'Falha interna para encontrar o cliente.')
                                             res.redirect('/pessoa/consulta')
                                        })
                                   }).catch((err) => {
                                        req.flash('error_msg', 'Falha interna para encontrar o regime.')
                                        res.redirect('/pessoa/consulta')
                                   })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Falha interna para encontrar um vendedor.')
                                   res.redirect('/configuracao/consulta')
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Falha interna para encontrar um responsável.')
                              res.redirect('/configuracao/consulta')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao encontrar os detalhes do projeto.')
                         res.redirect('/configuracao/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Falha interna para encontrar o projeto.')
                    res.redirect('/menu')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Não foi possível salvar o projeto')
               res.redirect('/projeto/consulta')
          })
     }).catch((err) => {
          req.flash('error_msg', 'Não foi possível encontrar o projeto')
          res.redirect('/projeto/consulta')
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
     var aviso = []
     var pv
     var pr
     var rp
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
               Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {
                    aviso.push({ texto: 'Projeto parado.' })
                    Regime.findOne({ _id: projeto.regime }).lean().then((regime_projeto) => {
                         rp = regime_projeto
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao encontrar o regime')
                         res.redirect('/configuracao/consulta')
                    })
                    Pessoa.findOne({ _id: projeto.funres }).lean().then((pessoa_res) => {
                         pr = pessoa_res
                    }).catch((err) => {
                         req.flash('error_msg', 'Hove uma falha interna')
                         res.redirect('/pessoa/consulta')
                    })
                    Pessoa.findOne({ _id: projeto.vendedor }).lean().then((prj_vendedor) => {
                         pv = prj_vendedor
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao encontrar um vendedor')
                         res.redirect('/pessoa/consulta')
                    })
                    Detalhado.findOne({ projeto: req.params.id }).lean().then((detalhe) => {

                         Pessoa.find({ funges: 'checked', user: _id }).lean().then((responsavel) => {
                              Pessoa.find({ ehVendedor: true, user: _id }).lean().then((vendedor) => {
                                   Regime.find({ user: _id }).lean().then((regime) => {
                                        Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                                             if (projeto.ehDireto == false) {
                                                  res.render('projeto/editprojeto', { aviso: aviso, projeto: projeto, regime: regime, rp: rp, pr: pr, responsavel: responsavel, detalhe: detalhe, vendedor: vendedor, pv: pv, cliente: cliente })
                                             } else {
                                                  res.render('projeto/editdiretoprincipal', { aviso: aviso, projeto: projeto, regime: regime, rp: rp, pr: pr, responsavel: responsavel, detalhe: detalhe, vendedor: vendedor, pv: pv, cliente: cliente })
                                             }
                                        }).catch((err) => {
                                             req.flash('error_msg', 'Falha interna para encontrar o cliente.')
                                             res.redirect('/pessoa/consulta')
                                        })
                                   }).catch((err) => {
                                        req.flash('error_msg', 'Falha interna para encontrar o regime.')
                                        res.redirect('/pessoa/consulta')
                                   })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Falha interna para encontrar um vendedor.')
                                   res.redirect('/configuracao/consulta')
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Falha interna para encontrar um responsável.')
                              res.redirect('/configuracao/consulta')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao encontrar os detalhes do projeto')
                         res.redirect('/configuracao/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Falha interna para encontrar o projeto.')
                    res.redirect('/menu')
               })
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
     var aviso = []
     var pv
     var pr
     var rp
     const { _id } = req.user

     Projeto.findOne({ _id: req.params.id }).then((projeto_homologa) => {
          projeto_homologa.executando = false
          projeto_homologa.parado = false
          projeto_homologa.orcado = false
          projeto_homologa.homologado = true
          projeto_homologa.save().then(() => {
               Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
                    aviso.push({ texto: 'Projeto aguardando distribuidora.' })
                    Regime.findOne({ _id: projeto.regime }).lean().then((regime_projeto) => {
                         rp = regime_projeto
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao encontrar o regime')
                         res.redirect('/configuracao/consulta')
                    })
                    Pessoa.findOne({ _id: projeto.funres }).lean().then((pessoa_res) => {
                         pr = pessoa_res
                    }).catch((err) => {
                         req.flash('error_msg', 'Hove uma falha interna')
                         res.redirect('/pessoa/consulta')
                    })
                    Pessoa.findOne({ _id: projeto.vendedor }).lean().then((prj_vendedor) => {
                         pv = prj_vendedor
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao encontrar um vendedor')
                         res.redirect('/pessoa/consulta')
                    })
                    Detalhado.findOne({ projeto: req.params.id }).lean().then((detalhe) => {
                         Pessoa.find({ funges: 'checked', user: _id }).lean().then((responsavel) => {
                              Pessoa.find({ ehVendedor: true, user: _id }).lean().then((vendedor) => {
                                   Regime.find({ user: _id }).lean().then((regime) => {
                                        Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                                             if (projeto.ehDireto == false) {
                                                  res.render('projeto/editprojeto', { aviso: aviso, projeto: projeto, regime: regime, rp: rp, pr: pr, responsavel: responsavel, detalhe: detalhe, vendedor: vendedor, pv: pv, cliente: cliente })
                                             } else {
                                                  res.render('projeto/editdiretoprincipal', { aviso: aviso, projeto: projeto, regime: regime, rp: rp, pr: pr, responsavel: responsavel, detalhe: detalhe, vendedor: vendedor, pv: pv, cliente: cliente })
                                             }
                                        }).catch((err) => {
                                             req.flash('error_msg', 'Falha interna para encontrar o cliente.')
                                             res.redirect('/pessoa/consulta')
                                        })
                                   }).catch((err) => {
                                        req.flash('error_msg', 'Falha interna para encontrar o regime.')
                                        res.redirect('/pessoa/consulta')
                                   })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Falha interna para encontrar um vendedor.')
                                   res.redirect('/configuracao/consulta')
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Falha interna para encontrar um responsável.')
                              res.redirect('/configuracao/consulta')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao encontrar os detalhes do projeto')
                         res.redirect('/configuracao/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Falha interna para encontrar o projeto.')
                    res.redirect('/menu')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Não foi possível salvar o projeto')
               res.redirect('/projeto/consulta')
          })
     }).catch((err) => {
          req.flash('error_msg', 'Não foi possível encontrar o projeto')
          res.redirect('/projeto/consulta')
     })
})

module.exports = router