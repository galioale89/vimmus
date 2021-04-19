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
     Projeto.find({ user: _id }).sort({ dataprev: 'desc' }).lean().then((projetos) => {
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
                    //var temEstSolo
                    var temOcp
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
                    if (parseFloat(detalhe.valorOcp) > 0) {
                         temOcp = true
                    } else {
                         temOcp = false
                    }
                    console.log('temCercamento=>' + temCercamento)
                    console.log('temPosteCond=>' + temPosteCond)
                    console.log('temOcp=>' + temOcp)

                    if (realizado) {
                         var varCP = false
                         var varLB = false
                         var varLAI = false
                         var varLL = false
                         var varCustoPlano = (realizado.custoPlano - projeto.totcop).toFixed(2)
                         if (varCustoPlano > 1) {
                              varCP = false
                         } else {
                              varCP = true
                         }
                         var varLucroBruto = (realizado.lucroBruto - projeto.lucroBruto).toFixed(2)
                         if (varLucroBruto > 1) {
                              varLB = true
                         } else {
                              varLB = false
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
                         res.render('projeto/realizado', { projeto: projeto, realizado: realizado, detalhe: detalhe, varCustoPlano: varCustoPlano, varLucroBruto: varLucroBruto, varlbaimp: varlbaimp, varLucroLiquido: varLucroLiquido, varCustoPlano: varCustoPlano, varLucroBruto: varLucroBruto, varlbaimp: varlbaimp, varLucroLiquido: varLucroLiquido, varLB: varLB, varLL: varLL, varLAI: varLAI, varCP: varCP, temCercamento: temCercamento, temPosteCond: temPosteCond, temOcp: temOcp })
                    } else {
                         res.render('projeto/realizado', { projeto: projeto, detalhe: detalhe, temCercamento: temCercamento, temPosteCond: temPosteCond, temOcp: temOcp })
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
          Pessoa.find({ funges: 'checked', user: _id }).lean().then((pessoas) => {
               Pessoa.find({ ehVendedor: true, user: _id }).lean().then((vendedor) => {
                    Cliente.find({ user: _id, sissolar: 'checked' }).lean().then((clientes) => {
                         res.render("projeto/addprojeto", { regime: regime, pessoas: pessoas, vendedor: vendedor, clientes: clientes })
                    }).catch((err) => {
                         req.flash('error_msg', 'houve um erro ao encontrar um cliente')
                         res.redirect('/cliente/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'houve um erro ao encontrar um vendedor')
                    res.redirect('/configuracao/consultaregime')
               })
          }).catch((err) => {
               req.flash('error_msg', 'houve um erro ao encontrar a pessoa')
               res.redirect('/configuracao/consultaregime')
          })
     }).catch((err) => {
          req.flash('error_msg', 'houve um erro ao encontrar o regime')
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
                              res.render('projeto/editcustosdiretos', { projeto: projeto, rp: rp, pi: pi, pp: pp, instalador: instalador, projetista: projetista, projetista: projetista, ehSimples: ehSimples, ehLP: ehLP, ehLR: ehLR, cliente: cliente })
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
                    res.redirect('/pressoa/consulta')
               })

               Pessoa.findOne({ _id: projeto.funres }).lean().then((projeto_funres) => {
                    pr = projeto_funres
               }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao encontrar o vendedor')
                    res.redirect('/pressoa/consulta')
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
          var valor
          var vlrequ
          var vlrkit

          //--Rotina do cadastro dos detalhes
          var unidadeEqu
          var unidadeEst
          var unidadeCer
          var unidadePos
          var unidadeDis
          var unidadeDPS
          var unidadeCab
          var unidadeOcp
          var vlrUniEqu
          var vlrUniEst
          var vlrUniCer
          var vlrUniPos
          var vlrUniDis
          var vlrUniDPS
          var vlrUniCab
          var vlrUniOcp
          var valorEqu = 0
          var valorEst = 0
          var valorCer = 0
          var valorPos = 0
          var valorDis = 0
          var valorDPS = 0
          var valorCab = 0
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
          //Valida valor Cercamento Detalhado
          if (req.body.temCercamento != null) {
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
          //Valida valor Postes Detalhado
          if (req.body.temPosteCond != null) {
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
          //Valida valor Disjuntores Detalhado
          if (req.body.valorDis != '') {
               unidadeDis = 0
               vlrUniDis = 0
               valorDis = req.body.valorDis
          } else {
               if (req.body.unidadeDis != '' && req.body.vlrUniDis != '') {
                    unidadeDis = req.body.unidadeDis
                    vlrUniDis = req.body.vlrUniDis
                    valorDis = parseFloat(unidadeDis) * parseFloat(vlrUniDis)
                    checkUni = 'checked'
               }
          }
          //Valida valor DPS Detalhado
          if (req.body.valorDPS != '') {
               unidadeDPS = 0
               vlrUniDPS = 0
               valorDPS = req.body.valorDPS
          } else {
               if (req.body.unidadeDPS != '' && req.body.vlrUniDPS != '') {
                    unidadeDPS = req.body.unidadeDPS
                    vlrUniDPS = req.body.vlrUniDPS
                    valorDPS = parseFloat(unidadeDPS) * parseFloat(vlrUniDPS)
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
          /*
           //console.log('valorEqu=>'+valorEqu)
           //console.log('valorEst=>'+valorEst)
           //console.log('valorCer=>'+valorCer)
           //console.log('valorPos=>'+valorPos)
           //console.log('valorDis=>'+valorDis)
           //console.log('valorDPS=>'+valorDPS)
           //console.log('valorCab=>'+valorCab)
           //console.log('valorOcp=>'+valorOcp)
           */


          var vlrTotal = parseFloat(valorEqu) + parseFloat(valorEst) + parseFloat(valorCer) + parseFloat(valorPos) + parseFloat(valorDis) + parseFloat(valorDPS) + parseFloat(valorCab) + parseFloat(valorOcp)
          valor = req.body.valor

          //Valida valor do equipameento
          if (req.body.equipamento == '' || parseFloat(req.body.equipamento) == 0) {
               vlrequ = vlrTotal
               vlrkit = parseFloat(valorEqu) + parseFloat(valorEst) + parseFloat(valorDis) + parseFloat(valorDPS) + parseFloat(valorCab)
          } else {
               vlrequ = parseFloat(req.body.equipamento) + parseFloat(valorEst) + parseFloat(valorCer) + parseFloat(valorPos) + parseFloat(valorDis) + parseFloat(valorDPS) + parseFloat(valorCab) + parseFloat(valorOcp)
               vlrkit = parseFloat(req.body.equipamento) + parseFloat(valorEst) + parseFloat(valorDis) + parseFloat(valorDPS) + parseFloat(valorCab)
          }

          //console.log(vlrequ)

          valor = req.body.valor
          if (parseFloat(valor) == parseFloat(vlrequ) || parseFloat(valor) < parseFloat(vlrequ)) {
               erros.push({ texto: 'O valor do orçamento deve ser maior que o valor do equipamento.' })
          }
          //------------------------------------------------------------------
          if (req.body.dataini == '' || req.body.dataprev == '') {
               erros.push({ texto: 'É necessário informar as data de inicio e de previsão de entrega do projeto.' })
          }

          if (validaCampos(req.body.potencia).length > validaCampos(req.body.nome).length > 0 || validaCampos(req.body.cidade).length > 0 || validaCampos(req.body.uf).length > 0 || validaCampos(req.body.valor).length > 0) {
               erros.push({ texto: 'O preenchimento de todos os campos é obrigatório. Exceto o valor da comissão e os checkbox.' })
          }
          if (erros.length > 0) {
               Regime.find({ user: _id }).lean().then((regime) => {
                    Pessoa.find({ funges: 'checked', user: _id }).lean().then((pessoas) => {
                         Pessoa.find({ ehVendedor: true, user: _id }).lean().then((vendedor) => {
                              Cliente.find({ user: _id, sissolar: 'checked' }).lean().then((clientes) => {
                                   res.render("projeto/addprojeto", { erros: erros, regime: regime, pessoas: pessoas, vendedor: vendedor, clientes: clientes })
                              }).catch((err) => {
                                   req.flash('error_msg', 'houve um erro ao encontrar um cliente')
                                   res.redirect('/cliente/consulta')
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Houve um erro ao encontrar a pessoa')
                              res.redirect('/configuracao/consultaregime')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve um erro ao encontrar um vendedor')
                         res.redirect('/configuracao/consultaregime')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro ao encontrar o regime')
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
               var fatequ
               var vlrfat
               if (req.body.checkFatura != null) {
                    fatequ = true
                    vlrfat = req.body.valor
               } else {
                    fatequ = false
                    vlrfat = parseFloat(req.body.valor) - parseFloat(vlrkit)
               }
               //console.log('vlrfat=>' + vlrfat)
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
                    ////console.log('percom=>' + percom)

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

                    const projeto = {
                         user: _id,
                         nome: req.body.nome,
                         cidade: cidade,
                         uf: uf,
                         valor: req.body.valor,
                         data: dia + '/' + mes + '/' + ano,
                         datareg: datareg,
                         potencia: req.body.potencia,
                         ehDireto: tipocusto,
                         vlrequ: vlrequ,
                         vlrkit: vlrkit,
                         fatequ: fatequ,
                         vlrfat: vlrfat,
                         percom: percom,
                         vendedor: req.body.vendedor,
                         regime: req.body.regime,
                         funres: req.body.pessoa,
                         cliente: req.body.cliente,
                         temCercamento: cercamento,
                         temPosteCond: poste,
                         temEstSolo: estsolo,
                         obstxt: req.body.obstxt,
                         vrskwp: (parseFloat(req.body.valor) / parseFloat(req.body.potencia)).toFixed(2),
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

                         Projeto.findOne({ user: _id }).sort({ field: 'asc', _id: -1 }).lean().then((projeto) => {
                              Configuracao.find({ user: _id }).lean().then((configuracao) => {
                                   configuracao_id = configuracao._id
                                   Regime.findOne({ _id: projeto.regime }).lean().then((rp) => {
                                        //Busca instalador par listar
                                        Pessoa.find({ funins: 'checked', user: _id }).lean().then((instalador) => {
                                             //Busca projetista para listar                         
                                             Pessoa.find({ funpro: 'checked', user: _id }).lean().then((projetista) => {
                                                  Pessoa.find({ vendedor: true, user: _id }).lean().then((vendedor) => {

                                                       const detalhado = {
                                                            projeto: projeto._id,
                                                            vlrTotal: vlrequ,
                                                            unidadeEqu: unidadeEqu,
                                                            unidadeEst: unidadeEst,
                                                            unidadeCer: unidadeCer,
                                                            unidadePos: unidadePos,
                                                            unidadeDis: unidadeDis,
                                                            unidadeDPS: unidadeDPS,
                                                            unidadeCab: unidadeCab,
                                                            unidadeOcp: unidadeOcp,
                                                            vlrUniEqu: vlrUniEqu,
                                                            vlrUniEst: vlrUniEst,
                                                            vlrUniCer: vlrUniCer,
                                                            vlrUniPos: vlrUniPos,
                                                            vlrUniDis: vlrUniDis,
                                                            vlrUniDPS: vlrUniDPS,
                                                            vlrUniCab: vlrUniCab,
                                                            vlrUniOcp: vlrUniOcp,
                                                            valorEqu: valorEqu,
                                                            valorEst: valorEst,
                                                            valorCer: valorCer,
                                                            valorPos: valorPos,
                                                            valorDis: valorDis,
                                                            valorDPS: valorDPS,
                                                            valorCab: valorCab,
                                                            valorOcp: valorOcp
                                                       }
                                                       new Detalhado(detalhado).save().then(() => {
                                                            sucesso.push({ texto: 'Detalhes dos custos orçados lançados com sucesso.' })
                                                            Detalhado.findOne({ _id: projeto._id }).lean().then((custodetalhado) => {
                                                                 Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                                                                      if (req.body.tipocusto == 'Diretos') {
                                                                           res.render('projeto/custosdiretos', { projeto: projeto, sucesso: sucesso, rp: rp, instalador: instalador, projetista: projetista, custodetalhado: custodetalhado, vendedor: vendedor, cliente: cliente })
                                                                      } else {
                                                                           res.render('projeto/custosporhora', { projeto: projeto, sucesso: sucesso, configuracao: configuracao, rp: rp, vendedor: vendedor, cliente: cliente })
                                                                      }
                                                                 }).catch(() => {
                                                                      req.flash('error_msg', 'Houve um erro ao encontrar o cliente.')
                                                                      res.redirect('/menu')
                                                                 })
                                                            }).catch(() => {
                                                                 req.flash('error_msg', 'Houve um erro ao encontrar os detalhes de custos do projeto.')
                                                                 res.redirect('/menu')
                                                            })
                                                       }).catch(() => {
                                                            req.flash('error_msg', 'Houve um erro ao salvar os detalhes de custos do projeto')
                                                            res.redirect('/menu')
                                                       })

                                                  }).catch((err) => {
                                                       req.flash('error_msg', 'Houve uma falha ao encontrar um vendedor')
                                                       res.redirect('/pressoa/consulta')
                                                  })
                                             }).catch((err) => {
                                                  req.flash('error_msg', 'Houve uma falha ao encontrar o instalador')
                                                  res.redirect('/pressoa/consulta')
                                             })
                                        }).catch((err) => {
                                             req.flash('error_msg', 'Ocorreu um erro interno<Tributos>')
                                             res.redirect('/menu')
                                        })
                                   }).catch((err) => {
                                        req.flash('error_msg', 'Ocorreu um erro interno<Configuracao>')
                                        res.redirect('/menu')
                                   })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Ocorreu um erro interno<Configuracao>')
                                   res.redirect('/menu')
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Nenhum projeto encontrado')
                              res.redirect('/menu')
                         })
                    }).catch(() => {
                         req.flash('error_msg', 'Houve um erro ao criar o projeto')
                         res.redirect('/menu')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro ao encontrar o vendedor')
                    res.redirect('/configuracao/consultaregime')
               })
          }

     })

})

router.post('/configurar/:id', ehAdmin, (req, res) => {
     const { _id } = req.user

     Projeto.findOne({ _id: req.params.id }).then((projeto) => {
          Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {

               projeto.configuracao = req.body.configuracao
               projeto.aliquotaImposto = req.body.aliquotaImposto
               //console.log('nomecliente=>' + cliente.nome)
               projeto.nomecliente = cliente.nome

               projeto.save().then(() => {
                    var sucesso = []
                    sucesso.push({ texto: 'Projeto configurado com sucesso.' })

                    Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
                         Pessoa.find({ funins: 'checked', user: _id }).lean().then((instalador) => {

                              res.render("projeto/customdo/instalacao", { sucesso: sucesso, projeto: projeto, instalador: instalador, cliente: cliente })

                         }).catch((err) => {
                              req.flash('error_msg', 'Houve um problema interno.')
                              res.redirect('/menu')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve um problema interno.')
                         res.redirect('/menu')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve um problema ao configurar o projeto.')
                    res.redirect('/menu')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Houve um erro ao encontrar um cliente.')
               res.redirect('/cliente/consulta')
          })
     }).catch((err) => {
          req.flash('error_msg', 'Não foi possível encontrar o projeto.')
          res.redirect('/menu')
     })
})

router.post('/edicao', ehAdmin, (req, res) => {
     const { _id } = req.user
     var erros = []
     var aviso = []
     var sucesso = []
     var vlrequ
     var vlrkit
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
                         res.redirect('/pressoa/consulta')
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
                    req.flash('error_msg', 'Houve uma falha ao encontrar os detalhes do projeto')
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

                         //projeto_id = projeto._id

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
                         //--Rotina do cadastro dos detalhes
                         var unidadeEqu
                         var unidadeEst
                         var unidadeCer
                         var unidadePos
                         var unidadeDis
                         var unidadeDPS
                         var unidadeCab
                         var unidadeOcp
                         var vlrUniEqu
                         var vlrUniEst
                         var vlrUniCer
                         var vlrUniPos
                         var vlrUniDis
                         var vlrUniDPS
                         var vlrUniCab
                         var vlrUniOcp
                         var valorEqu = 0
                         var valorEst = 0
                         var valorCer = 0
                         var valorPos = 0
                         var valorDis = 0
                         var valorDPS = 0
                         var valorCab = 0
                         var valorOcp = 0

                         //Valida valor Equipamento Detalhado
                         var checkUni
                         if (req.body.checkUni == null) {
                              checkUni = 'unchecked'
                         } else {
                              checkUni = 'checked'
                         }
                         //console.log('checkUni=>' + checkUni)

                         if (req.body.valorEqu != '' && req.body.checkUni == null) {
                              unidadeEqu = 0
                              vlrUniEqu = 0
                              valorEqu = req.body.valorEqu
                         } else {
                              if (req.body.unidadeEqu != '' && req.body.vlrUniEqu != '') {
                                   unidadeEqu = req.body.unidadeEqu
                                   vlrUniEqu = req.body.vlrUniEqu
                                   valorEqu = parseFloat(unidadeEqu) * parseFloat(vlrUniEqu)
                              }
                         }

                         if (req.body.valorEst != '' && req.body.checkUni == null) {
                              unidadeEst = 0
                              vlrUniEst = 0
                              valorEst = req.body.valorEst
                         } else {
                              if (req.body.unidadeEst != '' && req.body.vlrUniEst != '') {
                                   unidadeEst = req.body.unidadeEst
                                   vlrUniEst = req.body.vlrUniEst
                                   valorEst = parseFloat(unidadeEst) * parseFloat(vlrUniEst)
                              }
                         }

                         //Valida valor Cercamento Detalhado
                         if (req.body.temCercamento != null) {
                              if (req.body.valorCer != '' && req.body.checkUni == null) {
                                   unidadeCer = 0
                                   vlrUniCer = 0
                                   valorCer = req.body.valorCer
                              } else {
                                   if (req.body.unidadeCer != '' && req.body.vlrUniCer != '') {
                                        unidadeCer = req.body.unidadeCer
                                        vlrUniCer = req.body.vlrUniCer
                                        valorCer = parseFloat(unidadeCer) * parseFloat(vlrUniCer)
                                   }
                              }
                         }

                         //Valida valor Postes Detalhado
                         if (req.body.temPosteCond != null) {
                              if (req.body.valorPos != '' && req.body.checkUni == null) {
                                   unidadePos = 0
                                   vlrUniPos = 0
                                   valorPos = req.body.valorPos
                              } else {
                                   if (req.body.unidadePos != '' && req.body.vlrUniPos != '') {
                                        unidadePos = req.body.unidadePos
                                        vlrUniPos = req.body.vlrUniPos
                                        valorPos = parseFloat(unidadePos) * parseFloat(vlrUniPos)
                                   }
                              }
                         }
                         //Valida valor Disjuntores Detalhado
                         if (req.body.valorDis != '' && req.body.checkUni == null) {
                              unidadeDis = 0
                              vlrUniDis = 0
                              valorDis = req.body.valorDis
                         } else {
                              if (req.body.unidadeDis != '' && req.body.vlrUniDis != '') {
                                   unidadeDis = req.body.unidadeDis
                                   vlrUniDis = req.body.vlrUniDis
                                   valorDis = parseFloat(unidadeDis) * parseFloat(vlrUniDis)
                              }
                         }
                         //Valida valor DPS Detalhado
                         if (req.body.valorDPS != '' && req.body.checkUni == null) {
                              unidadeDPS = 0
                              vlrUniDPS = 0
                              valorDPS = req.body.valorDPS
                         } else {
                              if (req.body.unidadeDPS != '' && req.body.vlrUniDPS != '') {
                                   unidadeDPS = req.body.unidadeDPS
                                   vlrUniDPS = req.body.vlrUniDPS
                                   valorDPS = parseFloat(unidadeDPS) * parseFloat(vlrUniDPS)
                              }
                         }
                         //Valida valor Cabos Detalhado
                         if (req.body.valorCab != '' && req.body.checkUni == null) {
                              unidadeCab = 0
                              vlrUniCab = 0
                              valorCab = req.body.valorCab
                         } else {
                              if (req.body.unidadeCab != '' && req.body.vlrUniCab != '') {
                                   unidadeCab = req.body.unidadeCab
                                   vlrUniCab = req.body.vlrUniCab
                                   valorCab = parseFloat(unidadeCab) * parseFloat(vlrUniCab)
                              }
                         }
                         //Valida valor Outros Componentes Detalhado
                         if (req.body.valorOcp != '' && req.body.checkUni == null) {
                              unidadeOcp = 0
                              vlrUniOcp = 0
                              valorOcp = req.body.valorOcp
                         } else {
                              if (req.body.unidadeOcp != '' && req.body.vlrUniOcp != '') {
                                   unidadeOcp = req.body.unidadeOcp
                                   vlrUniOcp = req.body.vlrUniOcp
                                   valorOcp = parseFloat(unidadeOcp) * parseFloat(vlrUniOcp)
                              }
                         }
                         //console.log('valorEqu=>' + valorEqu)
                         //console.log('valorEst=>' + valorEst)
                         //console.log('valorCer=>' + valorCer)
                         //console.log('valorPos=>' + valorPos)
                         //console.log('valorDis=>' + valorDis)
                         //console.log('valorDPS=>' + valorDPS)
                         //console.log('valorCab=>' + valorCab)
                         //console.log('valorOcp=>' + valorOcp)

                         var validaequant
                         var validaequfut

                         var vlrTotal = parseFloat(valorEqu) + parseFloat(valorEst) + parseFloat(valorCer) + parseFloat(valorPos) + parseFloat(valorDis) + parseFloat(valorDPS) + parseFloat(valorCab) + parseFloat(valorOcp)

                         //Valida valor do equipameento
                         if (req.body.valorEqu != 0) {
                              vlrequ = vlrTotal
                              vlrkit = parseFloat(valorEqu) + parseFloat(valorEst) + parseFloat(valorDis) + parseFloat(valorDPS) + parseFloat(valorCab)
                         } else {
                              console.log('não tem lançamento manual de kit.')
                              validaequant = parseFloat(projeto.vlrkit) - (parseFloat(detalhe.valorEst) + parseFloat(detalhe.valorDis) + parseFloat(detalhe.valorDPS) + parseFloat(detalhe.valorCab))
                              console.log('validaequant=>' + validaequant)
                              validaequfut = parseFloat(req.body.equipamento) - (parseFloat(valorEst) + parseFloat(valorDis) + parseFloat(valorDPS) + parseFloat(valorCab))
                              console.log('validaequfut=>' + validaequfut)
                              if (parseFloat(validaequant) != parseFloat(validaequfut)) {
                                   console.log('Os valores dos kits são difentes')
                                   if (req.body.equipamento == projeto.vlrkit) {
                                        vlrequ = parseFloat(validaequant) + parseFloat(valorEst) + parseFloat(valorCer) + parseFloat(valorPos) + parseFloat(valorDis) + parseFloat(valorDPS) + parseFloat(valorCab) + parseFloat(valorOcp)
                                        vlrkit = parseFloat(validaequant) + parseFloat(valorEst) + parseFloat(valorDis) + parseFloat(valorDPS) + parseFloat(valorCab)
                                   } else {
                                        vlrequ = parseFloat(req.body.equipamento) + parseFloat(valorEst) + parseFloat(valorCer) + parseFloat(valorPos) + parseFloat(valorDis) + parseFloat(valorDPS) + parseFloat(valorCab) + parseFloat(valorOcp)
                                        vlrkit = parseFloat(req.body.equipamento) + parseFloat(valorEst) + parseFloat(valorDis) + parseFloat(valorDPS) + parseFloat(valorCab)
                                   }
                              } else {
                                   console.log('Os valores dos kits são iguais')
                                   vlrequ = projeto.vlrequ
                                   vlrkit = projeto.vlrkit
                              }
                         }
                         //console.log('vlrequ=>' + projeto.vlrequ)

                         valor = projeto.valor

                         //Definie os valores dos detalhes de custo dos equipamentos do projeto
                         detalhe.vlrTotal = vlrequ
                         detalhe.checkUni = checkUni
                         detalhe.unidadeEqu = unidadeEqu
                         detalhe.unidadeEst = unidadeEst
                         detalhe.unidadeCer = unidadeCer
                         detalhe.unidadePos = unidadePos
                         detalhe.unidadeDis = unidadeDis
                         detalhe.unidadeDPS = unidadeDPS
                         detalhe.unidadeCab = unidadeCab
                         detalhe.unidadeOcp = unidadeOcp
                         detalhe.vlrUniEqu = vlrUniEqu
                         detalhe.vlrUniEst = vlrUniEst
                         detalhe.vlrUniCer = vlrUniCer
                         detalhe.vlrUniPos = vlrUniPos
                         detalhe.vlrUniDis = vlrUniDis
                         detalhe.vlrUniDPS = vlrUniDPS
                         detalhe.vlrUniCab = vlrUniCab
                         detalhe.vlrUniOcp = vlrUniOcp
                         detalhe.valorEqu = valorEqu
                         detalhe.valorEst = valorEst
                         detalhe.valorCer = valorCer
                         detalhe.valorPos = valorPos
                         detalhe.valorDis = valorDis
                         detalhe.valorDPS = valorDPS
                         detalhe.valorCab = valorCab
                         detalhe.valorOcp = valorOcp

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
                         }
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

                         var vlrfat
                         if (projeto.fatequ == true) {
                              vlrfat = parseFloat(req.body.valor)
                         } else {
                              vlrfat = parseFloat(req.body.valor) - parseFloat(vlrkit)
                         }
                         if (req.body.checkLocal != null && req.body.uf != '' && req.body.cidade != '') {
                              projeto.nome = req.body.nome
                              if (req.body.uf != projeto.uf && req.body.uf != projeto.cidade) {
                                   projeto.uf = req.body.uf
                                   projeto.cidade = req.body.cidade
                              }
                         }
                         if (req.body.valor != projeto.valor || req.body.vlrequ != projeto.vlrequ) {
                              aviso.push({ texto: 'Aplique as alterações na aba de gerenciamento e de tributos para recalcular o valor da nota de serviço e valor dos tributos estimados.' })
                         }

                         projeto.valor = req.body.valor
                         projeto.vlrequ = vlrequ
                         projeto.vlrkit = vlrkit
                         projeto.vlrfat = vlrfat
                         projeto.potencia = req.body.potencia
                         projeto.percom = vendedor
                         projeto.percom = percom
                         projeto.temCercamento = cercamento
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
                                             res.redirect('/pressoa/consulta')
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
                                        req.flash('error_msg', 'Houve uma falha ao encontrar os detalhes do projeto')
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
                         req.flash('error_msg', 'Houve uma falha ao encontrar os detalhes do projeto')
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
     var ehLP = false
     var ehLR = false
     var erros = []
     var rp

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
          erros.push({ texto: 'Deve ter no mínimo 1 instalador registrado para o projeto.' })
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
                         res.redirect('/pressoa/consulta')
                    })
                    Pessoa.findOne({ _id: projeto.funins }).lean().then((projeto_funins) => {
                         pi = projeto_funins
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao encontrar o instalador')
                         res.redirect('/pressoa/consulta')
                    })
                    Pessoa.findOne({ _id: projeto.funpro }).lean().then((projeto_funpro) => {
                         pp = projeto_funpro
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao encontrar o projetista')
                         res.redirect('/pressoa/consulta')
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
                              res.redirect('/pressoa/consulta')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao encontrar o responsável')
                         res.redirect('/pressoa/consulta')
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
                                        var hrsequ = parseFloat(req.body.equipe) * 6
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
                                   vlrcom = parseFloat(projeto.vlrfat) * (parseFloat(projeto.percom) / 100)
                                   projeto.vlrcom = vlrcom.toFixed(2)
                              }

                              var totcop = parseFloat(totint) + parseFloat(totpro) + parseFloat(vlrart) + parseFloat(totges) + parseFloat(totdes) + parseFloat(totali)

                              console.log('totint=>' + totint)
                              console.log('totpro=>' + totpro)
                              console.log('totges=>' + totges)
                              console.log('totali=>' + totali)
                              console.log('detalhe.valorOcp=>' + detalhe.valorOcp)
                              console.log('detalhe.valorCer=>' + detalhe.valorCer)
                              console.log('detalhe.valorPos=>' + detalhe.valorPos)

                              projeto.totcop = totcop.toFixed(2)

                              var rescon = parseFloat(impele) + parseFloat(seguro) + parseFloat(outcer) + parseFloat(outpos)
                              rescon = parseFloat(rescon) + parseFloat(conadd)
                              projeto.rescon = rescon.toFixed(2)

                              var reserva = parseFloat(resger) + parseFloat(rescon)
                              projeto.reserva = reserva.toFixed(2)

                              var custoPlano = parseFloat(totcop) + parseFloat(reserva) + parseFloat(detalhe.valorCer) + parseFloat(detalhe.valorPos) + parseFloat(detalhe.valorOcp)
                              projeto.custoPlano = custoPlano.toFixed(2)

                              var custoTotal = parseFloat(custoPlano) + parseFloat(projeto.vlrkit)
                              projeto.custoTotal = custoTotal.toFixed(2)

                              //Definindo o Lucro Bruto
                              var lucroBruto = parseFloat(projeto.valor) - parseFloat(custoTotal)
                              projeto.lucroBruto = lucroBruto.toFixed(2)

                              //Definindo o imposto ISS
                              var vlrNFS = parseFloat(projeto.vlrfat)
                              var impNFS = parseFloat(vlrNFS) * (parseFloat(rp.alqNFS) / 100)
                              projeto.vlrNFS = vlrNFS.toFixed(2)
                              projeto.impNFS = impNFS.toFixed(2)

                              //Validar ICMS
                              var impostoICMS
                              if (projeto.fatequ == true) {
                                   if (rp.alqICMS != null) {
                                        impostoICMS = parseFloat(projeto.vlrkit) * (parseFloat(rp.alqICMS) / 100)
                                        projeto.impostoICMS = impostoICMS.toFixed(2)
                                   }
                              } else {
                                   impostoICMS = 0
                                   projeto.impostoICMS = impostoICMS.toFixed(2)
                              }

                              console.log('vlrNFS=>' + vlrNFS)
                              console.log('vlrcom=>' + vlrcom)
                              console.log('totcop=>' + totcop)
                              console.log('reserva=>' + reserva)
                              console.log('custoPlano=>' + custoPlano)
                              console.log('custoTotal=>' + custoTotal)
                              console.log('lucroBruto=>' + lucroBruto)

                              //Deduzindo as comissões do Lucro Antes dos Impostos
                              var lbaimp = 0
                              if (vlrcom == 0 || vlrcom == '') {
                                   lbaimp = parseFloat(lucroBruto)
                              } else {
                                   lbaimp = parseFloat(lucroBruto) - parseFloat(vlrcom)
                              }
                              projeto.lbaimp = lbaimp.toFixed(2)

                              var totalSimples
                              var impostoIRPJ
                              var impostoIRPJAdd
                              var impostoCSLL
                              var impostoPIS
                              var impostoCOFINS
                              var totalImpGrafico
                              var totalImposto

                              var fatadd
                              var fataju
                              var aux
                              var prjLR = rp.prjLR
                              var prjLP = rp.prjLP
                              var prjFat = rp.prjFat

                              if (rp.regime == 'Simples') {
                                   var alqEfe = ((parseFloat(prjFat) * (parseFloat(rp.alqDAS) / 100)) - (parseFloat(rp.vlrred))) / parseFloat(prjFat)
                                   totalSimples = parseFloat(vlrNFS) * (parseFloat(alqEfe))
                                   totalImpGrafico = totalSimples.toFixed(2)
                                   projeto.impostoSimples = totalImpGrafico.toFixed(2)
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
                                        //console.log('impostoIRPJ=>'+impostoIRPJ)
                                        projeto.impostoIRPJ = impostoIRPJ.toFixed(2)

                                        impostoCSLL = parseFloat(lbaimp) * (parseFloat(rp.alqCSLL) / 100)
                                        //console.log('impostoIRPJ=>'+impostoIRPJ)
                                        projeto.impostoCSLL = impostoCSLL.toFixed(2)
                                        impostoPIS = parseFloat(vlrNFS) * 0.5 * (parseFloat(rp.alqPIS) / 100)
                                        //console.log('impostoPIS=>'+impostoPIS)
                                        projeto.impostoPIS = impostoPIS.toFixed(2)
                                        impostoCOFINS = parseFloat(vlrNFS) * 0.5 * (parseFloat(rp.alqCOFINS) / 100)
                                        //console.log('impostoCOFINS=>'+impostoCOFINS)
                                        projeto.impostoCOFINS = impostoCOFINS.toFixed(2)
                                        if (parseFloat(impostoIRPJAdd) > 0) {
                                             totalImposto = parseFloat(impostoIRPJ) + parseFloat(impostoIRPJAdd) + parseFloat(impostoCSLL) + parseFloat(impostoPIS) + parseFloat(impostoCOFINS)
                                        } else {
                                             totalImposto = parseFloat(impostoIRPJ) + parseFloat(impostoCSLL) + parseFloat(impostoPIS) + parseFloat(impostoCOFINS)
                                        }
                                        totalImpGrafico = totalImposto.toFixed(2)
                                        //console.log('totalImposto=>'+totalImposto)
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
                                        totalImpGrafico = totalImposto.toFixed(2)
                                   }
                              }

                              if (impostoICMS > 0) {
                                   totalImposto = parseFloat(totalImpGrafico) + parseFloat(impNFS) + parseFloat(impostoICMS)
                              } else {
                                   totalImposto = parseFloat(totalImpGrafico) + parseFloat(impNFS)
                              }

                              console.log('IRPJ=>' + impostoIRPJ)
                              console.log('CSLL=>' + impostoCSLL)
                              console.log('COFINS=>' + impostoCOFINS)
                              console.log('PIS=>' + impostoPIS)

                              //Lucro Líquido após descontar os impostos
                              projeto.totalImposto = parseFloat(totalImposto).toFixed(2)

                              var lucroLiquido = parseFloat(lbaimp) - parseFloat(totalImposto)
                              projeto.lucroLiquido = lucroLiquido.toFixed(2)

                              //Dashboard              
                              //Participação sobre o Faturamento  

                              var parLiqNfs = parseFloat(lucroLiquido) / parseFloat(vlrNFS) * 100
                              projeto.parLiqNfs = parseFloat(parLiqNfs).toFixed(2)
                              var parIntNfs = parseFloat(totint) / parseFloat(vlrNFS) * 100
                              projeto.parIntNfs = parseFloat(parIntNfs).toFixed(2)
                              var parGesNfs = parseFloat(totges) / parseFloat(vlrNFS) * 100
                              projeto.parGesNfs = parseFloat(parGesNfs).toFixed(2)
                              var parProNfs = parseFloat(totpro) / parseFloat(vlrNFS) * 100
                              projeto.parProNfs = parseFloat(parProNfs).toFixed(2)
                              var parDesNfs = parseFloat(totdes) / parseFloat(vlrNFS) * 100
                              projeto.parDesNfs = parseFloat(parDesNfs).toFixed(2)
                              var parAliNfs = parseFloat(totali) / parseFloat(vlrNFS) * 100
                              projeto.parAliNfs = parseFloat(parAliNfs).toFixed(2)
                              var parResNfs = parseFloat(reserva) / parseFloat(vlrNFS) * 100
                              projeto.parResNfs = parseFloat(parResNfs).toFixed(2)
                              var parDedNfs = parseFloat(custoPlano) / parseFloat(vlrNFS) * 100
                              projeto.parDedNfs = parseFloat(parDedNfs).toFixed(2)
                              var parISSNfs = parseFloat(impNFS) / parseFloat(vlrNFS) * 100
                              projeto.parISSNfs = parseFloat(parISSNfs).toFixed(2)
                              var parImpNfs = parseFloat(totalImposto) / parseFloat(vlrNFS) * 100
                              projeto.parImpNfs = parseFloat(parImpNfs).toFixed(2)
                              if (vlrcom > 0) {
                                   var parComNfs = parseFloat(vlrcom) / parseFloat(vlrNFS) * 100
                                   projeto.parComNfs = parseFloat(parComNfs).toFixed(2)
                              }

                              //Participação sobre o valor total do projeto
                              var parLiqVlr = parseFloat(lucroLiquido) / parseFloat(projeto.valor) * 100
                              projeto.parLiqVlr = parseFloat(parLiqVlr).toFixed(2)
                              var parEquVlr = parseFloat(projeto.vlrequ) / parseFloat(projeto.valor) * 100
                              projeto.parEquVlr = parseFloat(parEquVlr).toFixed(2)
                              var parIntVlr = parseFloat(totint) / parseFloat(projeto.valor) * 100
                              projeto.parIntVlr = parseFloat(parIntVlr).toFixed(2)
                              var parGesVlr = parseFloat(totges) / parseFloat(projeto.valor) * 100
                              projeto.parGesVlr = parseFloat(parGesVlr).toFixed(2)
                              var parProVlr = parseFloat(totpro) / parseFloat(projeto.valor) * 100
                              projeto.parProVlr = parseFloat(parProVlr).toFixed(2)
                              var parDesVlr = parseFloat(totdes) / parseFloat(projeto.valor) * 100
                              projeto.parDesVlr = parseFloat(parDesVlr).toFixed(2)
                              var parAliVlr = parseFloat(totali) / parseFloat(projeto.valor) * 100
                              projeto.parAliVlr = parseFloat(parAliVlr).toFixed(2)
                              var parResVlr = parseFloat(reserva) / parseFloat(projeto.valor) * 100
                              projeto.parResVlr = parseFloat(parResVlr).toFixed(2)
                              var parDedVlr = parseFloat(custoPlano) / parseFloat(projeto.valor) * 100
                              projeto.parDedVlr = parseFloat(parDedVlr).toFixed(2)
                              var parISSVlr = parseFloat(impNFS) / parseFloat(projeto.valor) * 100
                              projeto.parISSVlr = parseFloat(parISSVlr).toFixed(2)
                              var parImpVlr = parseFloat(totalImposto) / parseFloat(projeto.valor) * 100
                              projeto.parImpVlr = parseFloat(parImpVlr).toFixed(2)
                              if (vlrcom > 0) {
                                   var parComVlr = parseFloat(vlrcom) / parseFloat(projeto.valor) * 100
                                   projeto.parComVlr = parseFloat(parComVlr).toFixed(2)
                              }

                              projeto.save().then(() => {
                                   var sucesso = []
                                   sucesso.push({ texto: 'Projeto salvo com sucesso' })
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
                                                  res.redirect('/pressoa/consulta')
                                             })
                                             Pessoa.findOne({ _id: projeto.funins }).lean().then((projeto_funins) => {
                                                  pi = projeto_funins
                                             }).catch((err) => {
                                                  req.flash('error_msg', 'Houve uma falha ao encontrar o instalador')
                                                  res.redirect('/pressoa/consulta')
                                             })
                                             Pessoa.findOne({ _id: projeto.funpro }).lean().then((projeto_funpro) => {
                                                  pp = projeto_funpro
                                             }).catch((err) => {
                                                  req.flash('error_msg', 'Houve uma falha ao encontrar o projetista')
                                                  res.redirect('/pressoa/consulta')
                                             })
                                             //Buscar gestor responsável
                                             Pessoa.find({ funges: 'checked', user: _id }).lean().then((responsavel) => {
                                                  //Busca instalador para listar
                                                  Pessoa.find({ funins: 'checked', user: _id }).lean().then((instalador) => {
                                                       //Busca projetista para listar
                                                       Pessoa.find({ funpro: 'checked', user: _id }).lean().then((projetista) => {
                                                            Regime.find({ user: _id }).lean().then((regime) => {
                                                                 switch (regime.regime) {
                                                                      case "Simples": ehSimples = true
                                                                           break;
                                                                      case "Lucro Presumido": ehLP = true
                                                                           break;
                                                                      case "Lucro Real": ehLR = true
                                                                           break;
                                                                 }
                                                                 res.render('projeto/custosdiretos', { sucesso: sucesso, projeto: projeto, regime: regime, rp: rp, instalador: instalador, projetista: projetista, responsavel: responsavel, pr: pr, pi: pi, pp: pp, detalhe: detalhe, ehLP: ehLP, ehLR: ehLR, cliente: cliente })
                                                            }).catch((err) => {
                                                                 req.flash('error_msg', 'Nenhum regime encontrado.')
                                                                 res.redirect('/menu')
                                                            })

                                                       }).catch((err) => {
                                                            req.flash('error_msg', 'Houve uma falha ao encontrar o projestista.')
                                                            res.redirect('/pessoa/consulta')
                                                       })
                                                  }).catch((err) => {
                                                       req.flash('error_msg', 'Houve uma falha ao encontrar o instalador.')
                                                       res.redirect('/pressoa/consulta')
                                                  })
                                             }).catch((err) => {
                                                  req.flash('error_msg', 'Houve uma falha ao encontrar o responsável.')
                                                  res.redirect('/pressoa/consulta')
                                             })
                                        }).catch((err) => {
                                             req.flash('error_msg', 'Não foi possível encontrar os detalhes do projeto.')
                                             res.redirect('/projeto/consulta')
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
          erros.push({ texto: 'Deve ter no mínimo 1 instalador registrado para o projeto.' })
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
                         res.redirect('/pressoa/consulta')
                    })
                    Pessoa.findOne({ _id: projeto.funins }).lean().then((projeto_funins) => {
                         pi = projeto_funins
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao encontrar o instalador')
                         res.redirect('/pressoa/consulta')
                    })
                    Pessoa.findOne({ _id: projeto.funpro }).lean().then((projeto_funpro) => {
                         pp = projeto_funpro
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao encontrar o projetista')
                         res.redirect('/pressoa/consulta')
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
                              res.redirect('/pressoa/consulta')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao encontrar o responsável')
                         res.redirect('/pressoa/consulta')
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
                                   if (req.body.equipe != '' && req.body.equipe > 0) {
                                        var hrsequ = parseFloat(req.body.equipe) * 6
                                        if (req.body.trbint != '' && req.body.trbint > 0) {
                                             projeto.qtdequipe = req.body.equipe
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

                              var vlrcom = 0
                              //Validando a comissão
                              if (projeto.percom != null) {
                                   vlrcom = parseFloat(projeto.vlrfat) * (parseFloat(projeto.percom) / 100)
                                   projeto.vlrcom = vlrcom.toFixed(2)
                              }

                              var totcop = parseFloat(totint) + parseFloat(totpro) + parseFloat(vlrart) + parseFloat(totges) + parseFloat(totdes) + parseFloat(totali)
                              console.log('totint=>' + totint)
                              console.log('totpro=>' + totpro)
                              console.log('totges=>' + totges)
                              console.log('totali=>' + totali)
                              console.log('detalhe.valorOcp=>' + detalhe.valorOcp)
                              console.log('detalhe.valorCer=>' + detalhe.valorCer)
                              console.log('detalhe.valorPos=>' + detalhe.valorPos)

                              projeto.totcop = totcop.toFixed(2)

                              var rescon = parseFloat(impele) + parseFloat(seguro) + parseFloat(outcer) + parseFloat(outpos)
                              rescon = parseFloat(rescon) + parseFloat(conadd)
                              projeto.rescon = rescon.toFixed(2)

                              var reserva = parseFloat(resger) + parseFloat(rescon)
                              projeto.reserva = reserva.toFixed(2)

                              var custoPlano = parseFloat(totcop) + parseFloat(reserva) + parseFloat(detalhe.valorCer) + parseFloat(detalhe.valorPos) + parseFloat(detalhe.valorOcp)
                              projeto.custoPlano = custoPlano.toFixed(2)

                              var custoTotal = parseFloat(custoPlano) + parseFloat(projeto.vlrkit)
                              projeto.custoTotal = custoTotal.toFixed(2)

                              //Definindo o Lucro Bruto
                              var lucroBruto = parseFloat(projeto.valor) - parseFloat(custoTotal)
                              projeto.lucroBruto = lucroBruto.toFixed(2)

                              //Definindo o imposto ISS
                              var vlrNFS = parseFloat(projeto.vlrfat)
                              var impNFS = parseFloat(vlrNFS) * (parseFloat(regime_prj.alqNFS) / 100)
                              projeto.vlrNFS = vlrNFS.toFixed(2)
                              projeto.impNFS = impNFS.toFixed(2)
                              /*
                              //console.log('vlrNFS=>' + vlrNFS)
                              //console.log('vlrcom=>' + vlrcom)
                              //console.log('totcop=>' + totcop)
                              //console.log('reserva=>' + reserva)
                              //console.log('custoPlano=>' + custoPlano)
                              //console.log('custoTotal=>' + custoTotal)
                              //console.log('lucroBruto=>' + lucroBruto)
                               */

                              var impostoICMS
                              //Validar ICMS
                              if (projeto.fatequ == true) {
                                   if (regime_prj.alqICMS != null) {
                                        impostoICMS = parseFloat(projeto.vlrequ) * (parseFloat(regime_prj.alqICMS) / 100)
                                        projeto.impostoICMS = impostoICMS.toFixed(2)
                                   } else {
                                        impostoICMS = 0
                                        projeto.impostoICMS = 0
                                   }
                              } else {
                                   impostoICMS = 0
                                   projeto.impostoICMS = impostoICMS.toFixed(2)
                              }
                              ////console.log('ICMS=>', impostoICMS)

                              var lbaimp
                              //Deduzindo as comissões do Lucro Antes dos Impostos
                              if (vlrcom == 0 || vlrcom == '') {
                                   lbaimp = parseFloat(lucroBruto)
                              } else {
                                   lbaimp = parseFloat(lucroBruto) - parseFloat(vlrcom)
                              }
                              projeto.lbaimp = parseFloat(lbaimp).toFixed(2)

                              var fatadd
                              var fataju
                              var aux
                              var prjLR = regime_prj.prjLR
                              var prjLP = regime_prj.prjLP
                              var prjFat = regime_prj.prjFat

                              var totalSimples
                              var impostoIRPJ
                              var impostoIRPJAdd
                              var impostoCSLL
                              var impostoPIS
                              var impostoCOFINS
                              var totalImposto
                              var totalImpGrafico

                              if (regime_prj.regime == 'Simples') {
                                   var alqEfe = ((parseFloat(prjFat) * (parseFloat(regime_prj.alqDAS) / 100)) - (parseFloat(regime_prj.vlrred))) / parseFloat(prjFat)
                                   totalSimples = parseFloat(vlrNFS) * (parseFloat(alqEfe))
                                   totalImpGrafico = parseFloat(totalSimples).toFixed(2)
                                   projeto.impostoSimples = parseFloat(totalImpGrafico).toFixed(2)
                              }

                              else {
                                   if (regime_prj.regime == 'Lucro Real') {
                                        //Imposto Adicional de IRPJ
                                        if ((parseFloat(prjLR) / 12) > 20000) {
                                             fatadd = (parseFloat(prjLR) / 12) - 20000
                                             fataju = parseFloat(fatadd) * (parseFloat(regime_prj.alqIRPJAdd) / 100)
                                             aux = parseFloat(fatadd) / parseFloat(lbaimp)
                                             impostoIRPJAdd = parseFloat(fataju) / parseFloat(aux)
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
                                        totalImpGrafico = totalImposto.toFixed(2)

                                        console.log('IRPJ=>' + impostoIRPJ)
                                        console.log('CSLL=>' + impostoCSLL)
                                        console.log('COFINS=>' + impostoCOFINS)
                                        console.log('PIS=>' + impostoPIS)

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

                                        totalImpGrafico = totalImposto.toFixed(2)

                                   }
                              }

                              if (impostoICMS > 0) {
                                   totalImposto = parseFloat(totalImpGrafico) + parseFloat(impNFS) + parseFloat(impostoICMS)
                              } else {
                                   totalImposto = parseFloat(totalImpGrafico) + parseFloat(impNFS)
                              }
                              //console.log('totalImpGrafico=>' + totalImpGrafico)
                              //console.log('impNFS=>' + impNFS)
                              //console.log('Total Imposto=>' + totalImposto)

                              //Lucro Líquido após descontar os impostos
                              projeto.totalImposto = totalImposto.toFixed(2)

                              var lucroLiquido = parseFloat(lbaimp) - parseFloat(totalImposto)
                              projeto.lucroLiquido = lucroLiquido.toFixed(2)

                              //Dashboard              
                              //Participação sobre o Faturamento  
                              var parLiqNfs = parseFloat(lucroLiquido) / parseFloat(vlrNFS) * 100
                              projeto.parLiqNfs = parseFloat(parLiqNfs).toFixed(2)
                              var parIntNfs = parseFloat(totint) / parseFloat(vlrNFS) * 100
                              projeto.parIntNfs = parseFloat(parIntNfs).toFixed(2)
                              var parGesNfs = parseFloat(totges) / parseFloat(vlrNFS) * 100
                              projeto.parGesNfs = parseFloat(parGesNfs).toFixed(2)
                              var parProNfs = parseFloat(totpro) / parseFloat(vlrNFS) * 100
                              projeto.parProNfs = parseFloat(parProNfs).toFixed(2)
                              var parDesNfs = parseFloat(totdes) / parseFloat(vlrNFS) * 100
                              projeto.parDesNfs = parseFloat(parDesNfs).toFixed(2)
                              var parAliNfs = parseFloat(totali) / parseFloat(vlrNFS) * 100
                              projeto.parAliNfs = parseFloat(parAliNfs).toFixed(2)
                              var parResNfs = parseFloat(reserva) / parseFloat(vlrNFS) * 100
                              projeto.parResNfs = parseFloat(parResNfs).toFixed(2)
                              var parDedNfs = parseFloat(custoPlano) / parseFloat(vlrNFS) * 100
                              projeto.parDedNfs = parseFloat(parDedNfs).toFixed(2)
                              var parISSNfs = parseFloat(impNFS) / parseFloat(vlrNFS) * 100
                              projeto.parISSNfs = parseFloat(parISSNfs).toFixed(2)
                              var parImpNfs = parseFloat(totalImposto) / parseFloat(vlrNFS) * 100
                              projeto.parImpNfs = parseFloat(parImpNfs).toFixed(2)
                              if (vlrcom > 0) {
                                   var parComNfs = parseFloat(vlrcom) / parseFloat(vlrNFS) * 100
                                   projeto.parComNfs = parseFloat(parComNfs).toFixed(2)
                              }

                              //Participação sobre o valor total do projeto
                              var parLiqVlr = parseFloat(lucroLiquido) / parseFloat(projeto.valor) * 100
                              projeto.parLiqVlr = parseFloat(parLiqVlr).toFixed(2)
                              var parEquVlr = parseFloat(projeto.vlrequ) / parseFloat(projeto.valor) * 100
                              projeto.parEquVlr = parseFloat(parEquVlr).toFixed(2)
                              var parIntVlr = parseFloat(totint) / parseFloat(projeto.valor) * 100
                              projeto.parIntVlr = parseFloat(parIntVlr).toFixed(2)
                              var parGesVlr = parseFloat(totges) / parseFloat(projeto.valor) * 100
                              projeto.parGesVlr = parseFloat(parGesVlr).toFixed(2)
                              var parProVlr = parseFloat(totpro) / parseFloat(projeto.valor) * 100
                              projeto.parProVlr = parseFloat(parProVlr).toFixed(2)
                              var parDesVlr = parseFloat(totdes) / parseFloat(projeto.valor) * 100
                              projeto.parDesVlr = parseFloat(parDesVlr).toFixed(2)
                              var parAliVlr = parseFloat(totali) / parseFloat(projeto.valor) * 100
                              projeto.parAliVlr = parseFloat(parAliVlr).toFixed(2)
                              var parResVlr = parseFloat(reserva) / parseFloat(projeto.valor) * 100
                              projeto.parResVlr = parseFloat(parResVlr).toFixed(2)
                              var parDedVlr = parseFloat(custoPlano) / parseFloat(projeto.valor) * 100
                              projeto.parDedVlr = parseFloat(parDedVlr).toFixed(2)
                              var parISSVlr = parseFloat(impNFS) / parseFloat(projeto.valor) * 100
                              projeto.parISSVlr = parseFloat(parISSVlr).toFixed(2)
                              var parImpVlr = parseFloat(totalImposto) / parseFloat(projeto.valor) * 100
                              projeto.parImpVlr = parseFloat(parImpVlr).toFixed(2)
                              if (vlrcom > 0) {
                                   var parComVlr = parseFloat(vlrcom) / parseFloat(projeto.valor) * 100
                                   projeto.parComVlr = parseFloat(parComVlr).toFixed(2)
                              }

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
                                                            res.render('projeto/editcustosdiretos', { sucesso: sucesso, projeto: projeto, rp: rp, pi: pi, pp: pp, instalador: instalador, projetista: projetista, projetista: projetista, ehLP: ehLP, ehLR: ehLR, cliente: cliente })
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
                         var varLB = false
                         var varLAI = false
                         var varLL = false
                         var varCustoPlano = (realizado.custoPlano - projeto.totcop).toFixed(2)
                         if (varCustoPlano > 1) {
                              varCP = false
                         } else {
                              varCP = true
                         }
                         var varLucroBruto = (realizado.lucroBruto - projeto.lucroBruto).toFixed(2)
                         if (varLucroBruto > 1) {
                              varLB = true
                         } else {
                              varLB = false
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
                         var temOcp
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

                         if (parseFloat(detalhe.valorOcp) > 0) {
                              temOcp = true
                         } else {
                              temOcp = false
                         }
                         sucesso.push({ texto: 'Projeto realizado com sucesso.' })
                         res.render('projeto/realizado', { sucesso: sucesso, projeto: projeto, realizado: realizado, detalhe: detalhe, varCustoPlano: varCustoPlano, varLucroBruto: varLucroBruto, varlbaimp: varlbaimp, varLucroLiquido: varLucroLiquido, varLB: varLB, varLL: varLL, varLAI: varLAI, varCP: varCP, temCercamento: temCercamento, temPosteCond: temPosteCond, temOcp: temOcp })
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
                         var prjCusto = projeto.totcop
                         var prjValor = projeto.valor
                         var projeto_lucroBruto = projeto.lucroBruto
                         var projeto_lbaimp = projeto.lbaimp
                         var projeto_lucroLiquido = projeto.lucroLiquido

                         var totint
                         var totges
                         var totpro
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
                         if (req.body.totali != '') {
                              totali = req.body.totali
                         } else {
                              totali = 0
                         }
                         if (projeto.ehDireto == true) {
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

                         var cercamento = 0
                         var ocp = 0
                         var postecond = 0

                         console.log('projeto.temCercamento=>' + projeto.temCercamento)

                         console.log('projeto.temPosteCond=>' + projeto.temPosteCond)

                         if (projeto.temCercamento == 'checked') {
                              if (req.body.cercamento != '') {
                                   cercamento = req.body.cercamento
                              }
                         }

                         if (parseFloat(detalhe.valorOcp) > 0) {
                              if (req.body.ocp != '') {
                                   ocp = req.body.ocp

                              }
                         }

                         if (projeto.temPosteCond == 'checked') {
                              if (req.body.postecond != '') {
                                   postecond = req.body.postecond
                              }
                         }
                         console.log('totint=>' + totint)
                         console.log('totges=>' + totges)
                         console.log('totpro=>' + totpro)
                         console.log('totdes=>' + totdes)
                         console.log('totali=>' + totali)
                         console.log('totcmb=>' + totcmb)
                         console.log('tothtl=>' + tothtl)
                         console.log('totali=>' + totali)
                         console.log('cercamento=>' + cercamento)
                         console.log('ocp=>' + ocp)
                         console.log('postecond=>' + postecond)

                         totalPlano = parseFloat(totint) + parseFloat(totges) + parseFloat(totpro) + parseFloat(totali) + parseFloat(totdes) + parseFloat(totcmb) + parseFloat(tothtl) + parseFloat(cercamento) + parseFloat(postecond) + parseFloat(ocp)
                         console.log('totalPlano=>' + totalPlano)

                         var vlrequ
                         var vlrFaturado
                         var impISSNfs
                         var vlrPrjNFS
                         if (req.body.vlrequ != '') {
                              vlrequ = req.body.vlrequ
                              vlrkit = projeto.vlrkit
                              if (projeto.fatequ == false) {
                                   vlrFaturado = parseFloat(projeto.valor) - parseFloat(vlrequ)
                                   impISSNfs = parseFloat(vlrFaturado) * (parseFloat(rp.alqNFS) / 100)
                                   if (projeto.vlrfat == projeto.vlrNFS) {
                                        vlrPrjNFS = projeto.vlrfat
                                   } else {
                                        vlrPrjNFS = vlrFaturado.toFixed(2)
                                   }
                              } else {
                                   vlrPrjNFS = projeto.vlrNFS
                              }
                         } else {
                              vlrequ = projeto.vlrequ
                              vlrkit = projeto.vlrkit
                              if (projeto.vlrNFS != '') {
                                   vlrPrjNFS = projeto.vlrNFS
                              } else {
                                   vlrPrjNFS = 0
                              }
                         }

                         console.log('vlrequ=>' + vlrequ)
                         console.log('vlrPrjNFS=>' + vlrPrjNFS)

                         var prjLucroBruto = parseFloat(vlrPrjNFS) - parseFloat(totalPlano)
                         prjLucroBruto = prjLucroBruto.toFixed(2)

                         //Valida a comissão e calcula o lucroBruto
                         var vlrcom
                         if (req.body.vlrcom == '') {
                              vlrcom = 0
                         } else {
                              vlrcom = req.body.vlrcom
                         }
                         console.log('vlrcom=>' + vlrcom)
                         var lbaimp
                         lbaimp = parseFloat(prjLucroBruto) - parseFloat(vlrcom)
                         lbaimp = lbaimp.toFixed(2)
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
                         var totalImpGrafico

                         if (req.body.impmanual != null) {
                              //LANÇAMENTO DIRETO/MANUAL DE IMPOSTOS
                              impmanual = 'checked'
                              if (req.body.impISS == '' || parseFloat(req.body.impISS) == null) {
                                   impISS = 0
                              } else {
                                   impISS = req.body.impISS
                              }
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
                                   totalImpGrafico = parseFloat(impSimples).toFixed(2)
                              } else {
                                   totalImpGrafico = (parseFloat(impIRPJ) + parseFloat(impIRPJAdd) + parseFloat(impCSLL) + parseFloat(impPIS) + parseFloat(impCOFINS)).toFixed(2)
                              }
                              //---------------------
                         } else {
                              impmanual = 'unchecked'
                              //CÁLCULO AUTOMÁTICO DOS IMPOSTOS

                              if (!impISSNfs) {
                                   if (!projeto.impNFS || projeto.impNFS != '') {
                                        impISS = projeto.impNFS
                                   } else {
                                        impISS = 0
                                   }
                              } else {
                                   impISS = impISSNfs.toFixed(2)
                              }

                              if (projeto.fatequ == true) {
                                   if (rp.alqICMS == '' || rp.alqICMS == null) {
                                        impICMS = 0
                                   } else {
                                        impostoICMS = parseFloat(vlrkit) * (parseFloat(rp.alqICMS) / 100)
                                        impICMS = impostoICMS.toFixed(2)
                                   }
                              } else {
                                   impostoICMS = 0
                                   projeto.impostoICMS = impostoICMS.toFixed(2)
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
                                   totalImpGrafico = impSimples.toFixed(2)
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
                                             console.log('fatadd=>' + fatadd)
                                             fataju = parseFloat(fatadd) * (parseFloat(rp.alqIRPJAdd) / 100)
                                             console.log('fataju=>' + fataju)
                                             console.log('lbaimp=>' + lbaimp)
                                             aux = Math.round(parseFloat(fatadd) / parseFloat(lbaimp))
                                             console.log('aux=>' + aux)
                                             impIRPJAdd = parseFloat(fataju) / parseFloat(aux)
                                             projeto.impIRPJAdd = impIRPJAdd.toFixed(2)
                                        }

                                        impIRPJ = parseFloat(lbaimp) * (parseFloat(rp.alqIRPJ) / 100)
                                        impIRPJ = impIRPJ.toFixed(2)

                                        impCSLL = parseFloat(lbaimp) * (parseFloat(rp.alqCSLL) / 100)
                                        impCSLL = impCSLL.toFixed(2)
                                        impPIS = parseFloat(vlrPrjNFS) * 0.5 * (parseFloat(rp.alqPIS) / 100)
                                        impPIS = impPIS.toFixed(2)
                                        impCOFINS = parseFloat(vlrPrjNFS) * 0.5 * (parseFloat(rp.alqCOFINS) / 100)
                                        impCOFINS = impCOFINS.toFixed(2)

                                   } else {
                                        //Imposto adicional de IRPJ
                                        if (((parseFloat(prjLP) * 0.32) / 3) > 20000) {
                                             fatadd = ((parseFloat(prjLP) * 0.32) / 3) - 20000
                                             fataju = parseFloat(fatadd) / 20000
                                             impIRPJAdd = (parseFloat(vlrPrjNFS) * 0.32) * parseFloat(fataju).toFixed(2) * (parseFloat(rp.alqIRPJAdd) / 100)
                                             impIRPJAdd = impIRPJAdd.toFixed(2)
                                        }

                                        impIRPJ = parseFloat(vlrPrjNFS) * 0.32 * (parseFloat(rp.alqIRPJ) / 100)
                                        impIRPJ = impIRPJ.toFixed(2)
                                        impCSLL = parseFloat(vlrPrjNFS) * 0.32 * (parseFloat(rp.alqCSLL) / 100)
                                        impCSLL = impCSLL.toFixed(2)

                                        impCOFINS = parseFloat(vlrPrjNFS) * (parseFloat(rp.alqCOFINS) / 100)
                                        impCOFINS = impCOFINS.toFixed(2)

                                        impPIS = parseFloat(vlrPrjNFS) * (parseFloat(rp.alqPIS) / 100)
                                        impPIS = impPIS.toFixed(2)
                                   }
                              }
                         }
                         //----------------------------

                         var totalImposto
                         if (rp.regime == 'Lucro Real' || rp.regime == 'Lucro Presumido') {
                              if (parseFloat(impIRPJAdd) > 0) {
                                   totalImposto = parseFloat(impIRPJ) + parseFloat(impIRPJAdd) + parseFloat(impCSLL) + parseFloat(impPIS) + parseFloat(impCOFINS)
                              } else {
                                   totalImposto = parseFloat(impIRPJ) + parseFloat(impCSLL) + parseFloat(impPIS) + parseFloat(impCOFINS)
                                   impIRPJAdd = 0
                              }
                              totalImpGrafico = totalImposto.toFixed(2)
                              impSimples = 0
                         }

                         if (impICMS > 0) {
                              totalImposto = parseFloat(totalImpGrafico) + parseFloat(impISS) + parseFloat(impICMS)
                         } else {
                              totalImposto = parseFloat(totalImpGrafico) + parseFloat(impISS)
                         }
                         totalImposto = totalImposto.toFixed(2)

                         var lucroLiquido = (parseFloat(lbaimp) - parseFloat(totalImposto))
                         lucroLiquido = lucroLiquido.toFixed(2)

                         //CÁLCULO DAS VARIAÇÕES
                         var varCusto = - (((parseFloat(prjCusto) - parseFloat(totalPlano)) / parseFloat(prjCusto)) * 100)
                         varCusto = varCusto.toFixed(2)
                         var varLB = -(((parseFloat(projeto_lucroBruto) - parseFloat(prjLucroBruto)) / parseFloat(projeto_lucroBruto)) * 100)
                         varLB = varLB.toFixed(2)
                         var varLAI = -(((parseFloat(projeto_lbaimp) - parseFloat(lbaimp)) / parseFloat(projeto_lbaimp)) * 100)
                         varLAI = varLAI.toFixed(2)
                         var varLL = -(((parseFloat(projeto_lucroLiquido) - parseFloat(lucroLiquido)) / parseFloat(projeto_lucroLiquido)) * 100)
                         varLL = varLL.toFixed(2)

                         //CÁLCULO DAS PARTES

                         var parLiqVlr = (parseFloat(lucroLiquido) / parseFloat(prjValor)) * 100
                         parLiqVlr = parLiqVlr.toFixed(2)

                         var parIntVlr = (parseFloat(totint) / parseFloat(prjValor)) * 100
                         parIntVlr = parIntVlr.toFixed(2)

                         var parGesVlr = (parseFloat(totges) / parseFloat(prjValor)) * 100
                         parGesVlr = parGesVlr.toFixed(2)
                         var parProVlr = (parseFloat(totpro) / parseFloat(prjValor)) * 100
                         parProVlr = parProVlr.toFixed(2)
                         var parDesVlr = (parseFloat(totdes) / parseFloat(prjValor)) * 100
                         parDesVlr = parDesVlr.toFixed(2)
                         var parCmbVlr
                         if (projeto.ehDireto == false) {
                              parCmbVlr = (parseFloat(totcmb) / parseFloat(projeto.valor)) * 100
                         } else {
                              parCmbVlr = 0
                         }
                         parCmbVlr = parCmbVlr.toFixed(2)

                         var parAliVlr = (parseFloat(totali) / parseFloat(prjValor)) * 100
                         parAliVrl = parseFloat(parAliVlr).toFixed(2)

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
                         var parIntNfs = (parseFloat(totint) / parseFloat(vlrPrjNFS)) * 100
                         parIntNfs = parIntNfs.toFixed(2)
                         var parGesNfs = (parseFloat(totges) / parseFloat(vlrPrjNFS)) * 100
                         parGesNfs = parGesNfs.toFixed(2)
                         var parProNfs = (parseFloat(totpro) / parseFloat(vlrPrjNFS)) * 100
                         parProNfs = parProNfs.toFixed(2)
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
                         var parImpNfs = ((parseFloat(totalImposto) - parseFloat(impISS)) / parseFloat(projeto.vlrNFS)) * 100
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
                         console.log('user=>' + _id)
                         console.log('projeto=>' + prj_id)
                         console.log('foiRealizado=>' + false)
                         console.log('nome=>' + projeto.nome)
                         console.log('cliente=>' + projeto.cliente)
                         console.log('dataini=>' + projeto.dataini)
                         console.log('datafim=>' + datafim)
                         console.log('valor=>' + projeto.valor)
                         console.log('data=>' + dia + '/' + mes + '/' + ano)
                         console.log('datareg=>' + datareg)
                         console.log('totint=>' + totint)
                         console.log('totges=>' + totges)
                         console.log('totpro=>' + totpro)
                         console.log('totali=>' + totali)
                         console.log('totdes=>' + totdes)
                         console.log('tothtl=>' + tothtl)
                         console.log('cercamento=>' + cercamento)
                         console.log('ocp=>' + ocp)
                         console.log('postecond=>' + postecond)
                         console.log('custoPlano=>' + totalPlano)
                         console.log('vlrequ=>' + vlrequ)
                         console.log('vlrNFS=>' + vlrPrjNFS)
                         console.log('lucroBruto=>' + prjLucroBruto)
                         console.log('vlrcom=>' + vlrcom)
                         console.log('lbaimp=>' + lbaimp)

                         console.log('impmanual=>' + impmanual)
                         console.log('impISS=>' + impISS)
                         console.log('impICMS=>' + impICMS)
                         console.log('impSimples=>' + impSimples)
                         console.log('impIRPJ=>' + impIRPJ)
                         console.log('impIRPJAdd=>' + impIRPJAdd)
                         console.log('impCSLL=>' + impCSLL)
                         console.log('impPIS=>' + impPIS)
                         console.log('impCOFINS=>' + impCOFINS)

                         console.log('totalImposto=>' + totalImposto)
                         console.log('lucroLiquido=>' + lucroLiquido)

                         console.log('varCusto=>' + varCusto)
                         console.log('varLB=>' + varLB)
                         console.log('varLAI=>' + varLAI)
                         console.log('varLL=>' + varLL)

                         console.log('parLiqVlr=>' + parLiqVlr)
                         console.log('parIntVlr=>' + parIntVlr)
                         console.log('parGesVlr=>' + parGesVlr)
                         console.log('parProVlr=>' + parProVlr)
                         console.log('parDesVlr=>' + parDesVlr)
                         console.log('parAliVlr=>' + parAliVlr)

                         console.log('parCmbVlr=>' + parCmbVlr)
                         console.log('parEstVlr=>' + parEstVlr)
                         console.log('parDedVlr=>' + parDedVlr)
                         console.log('parISSVlr=>' + parISSVlr)
                         console.log('parImpVlr=>' + parImpVlr)
                         console.log('parComVlr=>' + parComVlr)

                         console.log('parLiqNfs=>' + parLiqNfs)
                         console.log('parIntNfs=>' + parIntNfs)
                         console.log('parGesNfs=>' + parGesNfs)
                         console.log('parProNfs=>' + parProNfs)
                         console.log('parDesNfs=>' + parDesNfs)
                         console.log('parAliNfs=>' + parAliNfs)
                         console.log('parCmbNfs=>' + parEstNfs)
                         console.log('parEstNfs=>' + parEstNfs)
                         console.log('parDedNfs=>' + parDedNfs)
                         console.log('parISSNfs=>' + parISSNfs)
                         console.log('parImpNfs=>' + parImpNfs)
                         console.log('parComNfs=>' + parComNfs)

                         console.log('parNfsRlz=>' + parNfsRlz)
                         console.log('parVlrRlz=>' + parVlrRlz)
                         console.log('varLucRlz=>' + varLucRlz)


                         const realizado = {
                              user: _id,
                              projeto: prj_id,
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
                              totali: totali,
                              totdes: totdes,
                              tothtl: tothtl,
                              totcmb: totcmb,
                              cercamento: cercamento,
                              postecond: postecond,
                              ocp: ocp,
                              custoPlano: totalPlano,
                              vlrequ: vlrequ,
                              vlrkit: vlrkit,
                              vlrNFS: vlrPrjNFS,
                              lucroBruto: prjLucroBruto,
                              vlrcom: vlrcom,
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
                              lucroLiquido: lucroLiquido,

                              varCusto: varCusto,
                              varLB: varLB,
                              varLAI: varLAI,
                              varLL: varLL,

                              parLiqVlr: parLiqVlr,
                              parIntVlr: parIntVlr,
                              parGesVlr: parGesVlr,
                              parProVlr: parProVlr,
                              parDesVlr: parDesVlr,
                              parAliVlr: parAliVlr,

                              parCmbVlr: parCmbVlr,
                              parEstVlr: parEstVlr,
                              parDedVlr: parDedVlr,
                              parISSVlr: parISSVlr,
                              parImpVlr: parImpVlr,
                              parComVlr: parComVlr,

                              parLiqNfs: parLiqNfs,
                              parIntNfs: parIntNfs,
                              parGesNfs: parGesNfs,
                              parProNfs: parProNfs,
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
                                                  var varLB = false
                                                  var varLAI = false
                                                  var varLL = false
                                                  var varCustoPlano = (realizado.custoPlano - projeto.totcop).toFixed(2)
                                                  if (varCustoPlano > 1) {
                                                       varCP = false
                                                  } else {
                                                       varCP = true
                                                  }
                                                  var varLucroBruto = (realizado.lucroBruto - projeto.lucroBruto).toFixed(2)
                                                  if (varLucroBruto > 1) {
                                                       varLB = true
                                                  } else {
                                                       varLB = false
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
                                                  var temOcp
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

                                                  if (parseFloat(detalhe.valorOcp) > 0) {
                                                       temOcp = true
                                                  } else {
                                                       temOcp = false
                                                  }
                                                  sucesso.push({ texto: 'Projeto realizado com sucesso.' })
                                                  res.render('projeto/realizado', { sucesso: sucesso, projeto: projeto, realizado: realizado, detalhe: detalhe, varCustoPlano: varCustoPlano, varLucroBruto: varLucroBruto, varlbaimp: varlbaimp, varLucroLiquido: varLucroLiquido, varLB: varLB, varLL: varLL, varLAI: varLAI, varCP: varCP, temCercamento: temCercamento, temPosteCond: temPosteCond, temOcp: temOcp })
                                             }).catch((err) => {
                                                  req.flash('error_msg', 'Detalhe não encontrado.')
                                                  res.redirect('/projeto/consulta')
                                             })
                                        }).catch((err) => {
                                             req.flash('error_msg', 'Realizado não encontrado.')
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
                    var varLB = false
                    var varLAI = false
                    var varLL = false
                    var varCustoPlano = (realizado.custoPlano - projeto.totcop).toFixed(2)
                    if (varCustoPlano > 1) {
                         varCP = false
                    } else {
                         varCP = true
                    }
                    var varLucroBruto = (realizado.lucroBruto - projeto.lucroBruto).toFixed(2)
                    if (varLucroBruto > 1) {
                         varLB = true
                    } else {
                         varLB = false
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
                    res.render('projeto/realizado', { erros: erros, projeto: projeto, realizado: realizado, varCustoPlano: varCustoPlano, varLucroBruto: varLucroBruto, varlbaimp: varlbaimp, varLucroLiquido: varLucroLiquido, varLB: varLB, varLL: varLL, varLAI: varLAI, varCP: varCP })
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
                              var varLB = false
                              var varLAI = false
                              var varLL = false
                              var varCustoPlano = (realizado.custoPlano - projeto.totcop).toFixed(2)
                              if (varCustoPlano > 1) {
                                   varCP = false
                              } else {
                                   varCP = true
                              }
                              var varLucroBruto = (realizado.lucroBruto - projeto.lucroBruto).toFixed(2)
                              if (varLucroBruto > 1) {
                                   varLB = true
                              } else {
                                   varLB = false
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
                              var temOcp
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

                              if (parseFloat(detalhe.valorOcp) > 0) {
                                   temOcp = true
                              } else {
                                   temOcp = false
                              }
                              sucesso.push({ texto: 'Projeto finalizado com sucesso.' })
                              res.render('projeto/realizado', { sucesso: sucesso, projeto: projeto, realizado: realizado, detalhe: detalhe, varCustoPlano: varCustoPlano, varLucroBruto: varLucroBruto, varlbaimp: varlbaimp, varLucroLiquido: varLucroLiquido, varLB: varLB, varLL: varLL, varLAI: varLAI, varCP: varCP, temCercamento: temCercamento, temPosteCond: temPosteCond, temOcp: temOcp })
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
                         res.redirect('/pressoa/consulta')
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

router.get('/parar/:id', ehAdmin, (req, res) => {
     var aviso = []
     var pv
     var pr
     var rp
     const { _id } = req.user

     Projeto.findOne({ _id: req.params.id }).then((projeto_para) => {
          projeto_para.executando = false
          projeto_para.parado = true
          projeto_para.save().then(() => {
               Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
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
                         res.redirect('/pressoa/consulta')
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
                         res.redirect('/pressoa/consulta')
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