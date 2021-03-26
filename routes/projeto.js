const { sum } = require('d3-array')
const { render } = require('ejs')
const express = require('express')
const router = express.Router()

require('../model/Regime')
require('../model/Pessoa')
require('../model/Realizado')
require('../model/CustoDetalhado')

const mongoose = require('mongoose')
const { parse } = require('path')
const { config } = require('process')
const Projeto = mongoose.model('projeto')
const Configuracao = mongoose.model('configuracao')
const Regime = mongoose.model('regime')
const Pessoa = mongoose.model('pessoa')
const Realizado = mongoose.model('realizado')
const Detalhado = mongoose.model('custoDetalhado')

const validaCampos = require('../resources/validaCampos')
const { ehAdmin } = require('../helpers/ehAdmin')

var tipocusto = false
global.projeto_id

router.use(express.static('imagens'))

router.get('/menu', ehAdmin,(req, res) => {
     var cont = 0
     var perVlr = 0
     var perVlrMed = 0
     var perNfsMed = 0
     var perRealizado = 0

     Projeto.find().then((projetos) => {
          Realizado.find().then((prj_vlr) => {
               for (i = 0; i < prj_vlr.length; i++) {
                    perVlr = prj_vlr[i]
                    if (perVlr.parLiqVlr != undefined && perVlr.parLiqNfs != undefined ) {
                         perVlrMed = parseFloat(perVlrMed) + parseFloat(perVlr.parLiqVlr)
                         perNfsMed = parseFloat(perNfsMed) + parseFloat(perVlr.parLiqNfs)
                         cont++
                    }
               }
               perVlrMed = (parseFloat(perVlrMed) / parseFloat(cont)).toFixed(2)
               perNfsMed = (parseFloat(perNfsMed) / parseFloat(cont)).toFixed(2)
               const {_id} = req.user
               const {fantasia} = req.user
          Projeto.find({ foiRealizado: false }).sort({ dataord: 'desc' }).lean().then((dataord) => {
               var numprj = projetos.length
               Projeto.find({ foiRealizado: true }).then((foiRealizado) => {
                    var numprjrlz = foiRealizado.length
                    Projeto.find({ foiRealizado: false }).then((naoRealizado) => {
                         var numprjnrl = naoRealizado.length
                         perRealizado = ((parseFloat(numprjrlz)/ parseFloat(projetos.length))*100).toFixed(2)
                         res.render("projeto/menu", { numprjrlz: numprjrlz, numprjnrl: numprjnrl, numprj: numprj, foiRealizado: foiRealizado, naoRealizado: naoRealizado, dataord: dataord, perVlrMed:perVlrMed, perNfsMed: perNfsMed, perRealizado: perRealizado, id:_id})
                    })
               })
          })
     })
     })
})

router.get("/consulta", ehAdmin, (req, res) => {
     Projeto.find().sort({ datareg: 'desc' }).lean().then((projetos) => {
          Pessoa.find({ funges: 'checked' }).lean().then((responsavel) => {
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
               if (realizado) {
                    res.render('projeto/realizado', { projeto: projeto, realizado: realizado })
               } else {
                    res.render('projeto/realizado', { projeto: projeto })
               }
          }).catch((err) => {
               req.flash('error_msg', 'Falha interna')
               res.redirect('/projeto/consulta')
          })
     }).catch((err) => {
          req.flash('error_msg', 'Não foi possível encontrar o projeto')
          res.redirect('/projeto/consulta')
     })
})

router.get('/novo', ehAdmin, (req, res) => {

     Regime.find().lean().then((regime) => {
          Pessoa.find({ funges: 'checked' }).lean().then((pessoas) => {
               res.render("projeto/addprojeto", { regime: regime, pessoas: pessoas })
          }).catch((err) => {
               req.flash('error_msg', 'houve um erro ao encontrar a pessoa')
               res.redirect('/configuracao/consultaregime')
          })
     }).catch((err) => {
          req.flash('error_msg', 'houve um erro ao encontrar o regime')
          res.redirect('/configuracao/consultaregime')
     })

})

router.get('/direto/', ehAdmin, (req, res) => {
     var rp
     var pi
     var pp
     var pr

     Projeto.findOne({ _id: projeto_id }).lean().then((projeto) => {
          projeto_id = projeto._id
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
               Pessoa.find({ funges: 'checked' }).lean().then((responsavel) => {
                    //Busca instalador para listar
                    Pessoa.find({ funins: 'checked' }).lean().then((instalador) => {
                         //Busca projetista para listar
                         Pessoa.find({ funpro: 'checked' }).lean().then((projetista) => {
                              Regime.find().lean().then((regime) => {
                                   res.render('projeto/custosdiretos', { projeto: projeto, regime: regime, rp: rp, instalador: instalador, projetista: projetista, responsavel: responsavel, rp: rp, pr: pr, pi: pi, pp: pp, detalhe: detalhe })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Nenhum regime encontrado')
                                   res.redirect('/')
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
               req.flash('error_msg', 'Não foi possível encontrar os detlhes do projeto')
               res.redirect('/projeto/consulta')
          })

     }).catch((err) => {
          req.flash('error_msg', 'Nenhum projeto encontrado')
          res.redirect('/')
     })

})

router.get('/edicao/:id', ehAdmin, (req, res) => {

     Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {

          projeto_id = projeto._id
          var pr

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
                    req.flash('error_msg', 'Houve uma falha ao encontrar a pessoa')
                    res.redirect('/pessoa/consulta')
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
               Pessoa.find({ funges: 'checked' }).lean().then((responsavel) => {
                    Pessoa.find({ funins: 'checked' }).lean().then((instalador) => {
                         Pessoa.find({ funpro: 'checked' }).lean().then((projetista) => {

                              Regime.find().lean().then((regime) => {
                                   if (projeto.ehDireto == false) {
                                        res.render('projeto/editprojeto', { projeto: projeto, regime: regime, responsavel: responsavel, instalador: instalador, projetista: projetista, rp: rp, pr: pr, detalhe: detalhe })
                                   } else {
                                        res.render('projeto/editcustosdiretos', { projeto: projeto, regime: regime, responsavel: responsavel, instalador: instalador, projetista: projetista, rp: rp, pr: pr, pi: pi, pp: pp, detalhe: detalhe })
                                   }
                              }).catch((err) => {
                                   req.flash('error_msg', 'Houve uma falha ao encontrar o regime')
                                   res.redirect('/configuracao/consulta')
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Não foi possível encontrar o projetista')
                              res.redirect('/pessoa/consulta')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Não foi possível encontrar o instalador')
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
          if (projeto.foiRealizado == false) {
               Projeto.findOneAndRemove({ _id: req.params.id }).then(() => {
                    Detalhado.findOneAndRemove({ projeto: req.params.id }).then(() => {
                         Realizado.findOneAndRemove({ projeto: req.params.id }).then(() => {
                              req.flash('success_msg', 'Projeto removido com sucesso')
                              res.redirect('/projeto/consulta')
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
               req.flash('error_msg', 'O projeto não pode ser excluido porque já esta realizado')
               res.redirect('/projeto/consulta')
          }
     })
})

router.post("/novo", ehAdmin, (req, res) => {

     var prj_id

     //Validação se o projeto já existe
     var nome = req.body.nome
     Projeto.findOne({ nome: nome }).then((projeto) => {
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
          var valorEqu
          var valorEst
          var valorCer
          var valorPos
          var valorDis
          var valorDPS
          var valorCab
          var valorOcp

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
               }
          }
          if (req.body.valorEst != '') {
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
          if (req.body.valorCer != '') {
               unidadeCer = 0
               vlrUniCer = 0
               valorCer = req.body.valorCer
          } else {
               if (req.body.unidadeCer != '' && req.body.vlrUniCer != '') {
                    unidadeCer = req.body.unidadeCe
                    vlrUniCer = req.body.vlrUniCer
                    valorCer = parseFloat(unidadeCer) * parseFloat(vlrUniCer)
               }
          }
          //Valida valor Postes Detalhado
          if (req.body.valorPos != '') {
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
               }
          }
          //Valida valor Outros Componentes Detalhado
          if (req.body.valorOcp != '') {
               unidadeOcp = 0
               vlrUniocp = 0
               valorOcp = req.body.valorOcp
          } else {
               if (req.body.unidadeOcp != '' && req.body.vlrUniOcp != '') {
                    unidadeOcp = req.body.unidadeOcp
                    vlrUniOcp = req.body.vlrUniOcp
                    valorOcp = parseFloat(unidadeOcp) * parseFloat(vlrUniOcp)
               }
          }
          //Validando os campos dos lnaçamentos detalhado para não ficarem vazios
          if (req.body.valorEqu == '') {
               valorEqu = 0
          }
          if (req.body.valorEst == '') {
               valorEst = 0
          }
          if (req.body.valorCer == '') {
               valorCer = 0
          }
          if (req.body.valorPos == '') {
               valorPos = 0
          }
          if (req.body.valorDis == '') {
               valorDis = 0
          }
          if (req.body.valorDPS == '') {
               valorDPS = 0
          }
          if (req.body.valorCab == '') {
               valorCab = 0
          }
          if (req.body.valorOcp == '') {
               valorOcp = 0
          }

          var vlrTotal = parseFloat(valorEqu) + parseFloat(valorEst) + parseFloat(valorPos) + parseFloat(valorDis) + parseFloat(valorDPS) + parseFloat(valorDPS) + parseFloat(valorCab) + parseFloat(valorOcp)

          //Valida valor do equipameento
          if (req.body.equipamento == '' || parseFloat(req.body.equipamento) == 0) {
               vlrequ = vlrTotal
          } else {
               vlrequ = req.body.equipamento
          }

          valor = req.body.valor
          if (parseFloat(valor) == parseFloat(vlrequ) || parseFloat(valor) < parseFloat(vlrequ)) {
               erros.push({ texto: 'Valor do orçamento deve ser maior que o valor do equipamento' })
          }
          //------------------------------------------------------------------
          if (req.body.dataini == '' || req.body.dataprev == '') {
               erros.push({ texto: 'É necessário informar as data de inicio e de previsão de entrega do projeto' })
          }

          if (validaCampos(req.body.potencia).length > validaCampos(req.body.nome).length > 0 || 0 || validaCampos(req.body.valor).length > 0) {
               erros.push({ texto: 'O preenchimento de todos os campos é obrigatório. Exceto o valor da comissão e os checkbox.' })
          }
          if (erros.length > 0) {
               Regime.find().lean().then((regime) => {
                    Pessoa.find({ funges: 'checked' }).lean().then((pessoas) => {
                         res.render("projeto/orcamento/addprojeto", { regime: regime, pessoas: pessoas, erros: erros })
                    }).catch((err) => {
                         req.flash('error_msg', 'houve um erro ao encontrar a pessoa')
                         res.redirect('/configuracao/consultaregime')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'houve um erro ao encontrar o regime')
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

               var data = new Date()
               var dia = data.getDate()
               var mes = parseFloat(data.getMonth()) + 1
               var ano = data.getFullYear()

               const projeto = {
                    nome: req.body.nome,
                    valor: req.body.valor,
                    data: dia + '/' + mes + '/' + ano,
                    potencia: req.body.potencia,
                    ehDireto: tipocusto,
                    vlrequ: vlrequ,
                    percom: req.body.comissao,
                    regime: req.body.regime,
                    funres: req.body.pessoa,
                    cliente: req.body.cliente,
                    temCercamento: cercamento,
                    temPosteCond: poste,
                    temEstSolo: estsolo,
                    obstxt: req.body.obstxt,
                    vrskwp: parseFloat(req.body.valor) / parseFloat(req.body.potencia),
                    dataini: req.body.dataini,
                    dataprev: req.body.dataprev,
                    dataord: req.body.dataord,
                    foiRealizado: false
               }

               new Projeto(projeto).save().then(() => {

                    sucesso.push({ texto: 'Projeto criado com sucesso' })

                    Projeto.findOne().sort({ field: 'asc', _id: -1 }).lean().then((projeto) => {
                         Configuracao.find().lean().then((configuracao) => {
                              configuracao_id = configuracao._id
                              Regime.findOne({ _id: projeto.regime }).lean().then((rp) => {
                                   //Busca instalador par listar
                                   Pessoa.find({ funins: 'checked' }).lean().then((instalador) => {
                                        //Busca projetista para listar                         
                                        Pessoa.find({ funpro: 'checked' }).lean().then((projetista) => {

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
                                                  valorOcp: valorOcp,

                                             }
                                             new Detalhado(detalhado).save().then(() => {
                                                  sucesso.push({ texto: 'Detalhes dos custos orçados lançados com sucesso' })

                                                  Detalhado.findOne({ _id: projeto._id }).lean().then((custodetalhado) => {
                                                       if (req.body.tipocusto == 'Diretos') {
                                                            res.render('projeto/custosdiretos', { projeto: projeto, sucesso: sucesso, rp: rp, instalador: instalador, projetista: projetista, custodetalhado: custodetalhado })
                                                       } else {
                                                            res.render('projeto/custosporhora', { projeto: projeto, sucesso: sucesso, configuracao: configuracao, rp: rp })
                                                       }
                                                  }).catch(() => {
                                                       req.flash('error_msg', 'Houve um erro ao encontrar os detalhes de custos do projeto')
                                                       res.redirect('/')
                                                  })
                                             }).catch(() => {
                                                  req.flash('error_msg', 'Houve um erro ao salvar os detalhes de custos do projeto')
                                                  res.redirect('/')
                                             })


                                        }).catch((err) => {
                                             req.flash('error_msg', 'Houve uma falha ao encontrar o instalador')
                                             res.redirect('/pressoa/consulta')
                                        })
                                   }).catch((err) => {
                                        req.flash('error_msg', 'Ocorreu um erro interno<Tributos>')
                                        res.redirect('/')
                                   })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Ocorreu um erro interno<Configuracao>')
                                   res.redirect('/')
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Ocorreu um erro interno<Configuracao>')
                              res.redirect('/')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Nenhum projeto encontrado')
                         res.redirect('/')
                    })
               }).catch(() => {
                    req.flash('error_msg', 'Houve um erro ao criar o projeto')
                    res.redirect('/')
               })
          }

     })

})

router.post('/configurar/:id', ehAdmin, (req, res) => {
     Projeto.findOne({ _id: req.params.id }).then((projeto) => {

          projeto.configuracao = req.body.configuracao
          projeto.aliquotaImposto = req.body.aliquotaImposto

          projeto.save().then(() => {
               var sucesso = []
               sucesso.push({ texto: 'Projeto configurado com sucesso.' })

               Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
                    Pessoa.find({ funins: 'checked' }).lean().then((instalador) => {
                         projeto_id = projeto._id
                         res.render('projeto/customdo/instalacao', { sucesso: sucesso, projeto: projeto, instalador: instalador })
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve um problema interno')
                         res.redirect('/')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve um problema interno')
                    res.redirect('/')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Houve um problema ao configurar o projeto.')
               res.redirect('/')
          })

     }).catch((err) => {
          req.flash('error_msg', 'Não foi possível encontrar o projeto')
          res.redirect('/')
     })
})

router.post('/edicao', ehAdmin, (req, res) => {
     var erros = []
     var aviso = []
     var sucesso = []
     var valor
     var vlrequ

     if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
          erros.push('Nome inválido')
     }
     if (req.body.checkDatPrev == null && req.body.motivo == '' && req.body.dataprev == '') {
          erros.push({ texto: 'Para aletar a data de previsão é necessário informar um motivo.' })
     }
     if (erros.length > 0) {

          Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {

               Detalhado.find({ projeto: projeto._id }).then((detalhe) => {

                    projeto_id = projeto._id

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

                    Pessoa.find({ funges: 'checked' }).lean().then((responsavel) => {

                         Regime.find().lean().then((regime) => {

                              var sucesso = []
                              sucesso.push({ texto: 'Projeto salvo com sucesso!' })
                              sucesso.push({ texto: 'Aplicar o gerenciamento e os tributos' })
                              res.render('projeto/editprojeto', { projeto: projeto, error: erros, regime: regime, rp: rp, pr: pr, responsavel: responsavel, detalhe: detalhe })

                         }).catch((err) => {
                              req.flash('error_msg', 'Falha interna para encontrar o regime.')
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
               res.redirect('/')
          })

     } else {

          Projeto.findOne({ _id: req.body.id }).then((projeto) => {

               Detalhado.findOne({ projeto: projeto._id }).then((detalhe) => {

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
                    var valorEqu
                    var valorEst
                    var valorCer
                    var valorPos
                    var valorDis
                    var valorDPS
                    var valorCab
                    var valorOcp

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
                         }
                    }
                    if (req.body.valorEst != '') {
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
                    if (req.body.valorCer != '') {
                         unidadeCer = 0
                         vlrUniCer = 0
                         valorCer = req.body.valorCer
                    } else {
                         if (req.body.unidadeCer != '' && req.body.vlrUniCer != '') {
                              unidadeCer = req.body.unidadeCe
                              vlrUniCer = req.body.vlrUniCer
                              valorCer = parseFloat(unidadeCer) * parseFloat(vlrUniCer)
                         }
                    }
                    //Valida valor Postes Detalhado
                    if (req.body.valorPos != '') {
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
                         }
                    }
                    //Valida valor Outros Componentes Detalhado
                    if (req.body.valorOcp != '') {
                         unidadeOcp = 0
                         vlrUniocp = 0
                         valorOcp = req.body.valorOcp
                    } else {
                         if (req.body.unidadeOcp != '' && req.body.vlrUniOcp != '') {
                              unidadeOcp = req.body.unidadeOcp
                              vlrUniOcp = req.body.vlrUniOcp
                              valorOcp = parseFloat(unidadeOcp) * parseFloat(vlrUniOcp)
                         }
                    }
                    //Validando os campos dos lnaçamentos detalhado para não ficarem vazios
                    if (req.body.valorEqu == '') {
                         valorEqu = 0
                    }
                    if (req.body.valorEst == '') {
                         valorEst = 0
                    }
                    if (req.body.valorCer == '') {
                         valorCer = 0
                    }
                    if (req.body.valorPos == '') {
                         valorPos = 0
                    }
                    if (req.body.valorDis == '') {
                         valorDis = 0
                    }
                    if (req.body.valorDPS == '') {
                         valorDPS = 0
                    }
                    if (req.body.valorCab == '') {
                         valorCab = 0
                    }
                    if (req.body.valorOcp == '') {
                         valorOcp = 0
                    }

                    var vlrTotal = parseFloat(valorEqu) + parseFloat(valorEst) + parseFloat(valorPos) + parseFloat(valorDis) + parseFloat(valorDPS) + parseFloat(valorDPS) + parseFloat(valorCab) + parseFloat(valorOcp)

                    //Valida valor do equipameento
                    if (parseFloat(vlrTotal) > 0) {
                         vlrequ = vlrTotal
                    } else {
                         vlrequ = req.body.equipamento
                    }

                    //Valida o valor tota do projeto com o valores dos equipamentos
                    valor = req.body.valor
                    if (parseFloat(valor) == parseFloat(vlrequ) || parseFloat(valor) < parseFloat(vlrequ)) {
                         valor = projeto.valor
                         vrlequ = projeo.vlrequ
                         aviso.push({ texto: 'O valor do projeto está menor que o valor dos equipamentos.' })

                    }

                    //Definie os valores dos detalhes de custo dos equipamentos do projeto
                    detalhe.vlrTotal = vlrequ
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
                         projeto.ultdat = projeto.dataprev
                    }

                    projeto.nome = req.body.nome
                    projeto.cliente = req.body.cliente
                    projeto.valor = req.body.valor
                    projeto.vlrequ = vlrequ
                    projeto.potencia = req.body.potencia
                    projeto.percom = req.body.comissao
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

                         Projeto.findOne({ _id: projeto_id }).lean().then((projeto) => {
                              projeto_id = projeto._id
                              sucesso.push({ texto: 'Projeto salvo com sucesso!' })

                              Detalhado.findOne({ projeto: projeto._id }).lean().then((detalhe) => {

                                   Pessoa.findOne({ _id: projeto.funres }).lean().then((pessoa_res) => {
                                        pr = pessoa_res
                                   }).catch((err) => {
                                        req.flash('error_msg', 'Hove uma falha interna')
                                        res.redirect('/pessoa/consulta')
                                   })

                                   Pessoa.find({ funges: 'checked' }).lean().then((responsavel) => {

                                        Regime.find().lean().then((regime) => {

                                             sucesso.push({ texto: 'Aplicar o gerenciamento e os tributos' })
                                             res.render('projeto/editprojeto', { projeto: projeto, aviso: aviso, sucesso: sucesso, regime: regime, rp: rp, pr: pr, responsavel: responsavel, detalhe: detalhe })

                                        }).catch((err) => {
                                             req.flash('error_msg', 'Falha interna para encontrar o regime.')
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
                              req.flash('error_msg', 'Falha interna para encontrar o projeto.')
                              res.redirect('/')
                         })
                    }).catch(() => {
                         req.flash('error_msg', 'Não foi possível salvar o projeto.')
                         res.redirect('/')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao encontrar os detalhes do projeto')
                    res.redirect('/configuracao/consulta')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Não foi possivel encontrar o projeto.')
               res.redirect('/')
          })
     }
})

router.post('/direto', ehAdmin, (req, res) => {

     var erros = []
     var rp

     if (req.body.trbpro != '' && req.body.trbint == '') {
          erros.push({ texto: 'Prencheer valor de horas de instalação' })
     }
     if (req.body.trbpro == '' && req.body.trbint != '') {
          erros.push({ texto: 'Prencheer valor de horas de projetista' })
     }

     if (erros.length > 0) {

          Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {
               projeto_id = projeto._id
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
                    Pessoa.find({ funges: 'checked' }).lean().then((responsavel) => {
                         //Busca instalador para listar
                         Pessoa.find({ funins: 'checked' }).lean().then((instalador) => {
                              //Busca projetista para listar
                              Pessoa.find({ funpro: 'checked' }).lean().then((projetista) => {
                                   Regime.find().lean().then((regime) => {
                                        res.render('projeto/custosdiretos', { erros: erros, projeto: projeto, regime: regime, rp: rp, instalador: instalador, projetista: projetista, responsavel: responsavel, pr: pr, pi: pi, pp: pp, detalhe: detalhe })
                                   }).catch((err) => {
                                        req.flash('error_msg', 'Nenhum regime encontrado')
                                        res.redirect('/')
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
               res.redirect('/')
          })

     } else {

          Projeto.findOne({ _id: req.body.id }).then((projeto) => {

               Regime.findOne({ _id: projeto.regime }).lean().then((rp) => {

                    projeto_id = projeto._id

                    var vlrcom = 0
                    var lbaimp = 0
                    var impostoICMS = 0
                    var totalImposto = 0
                    var fatadd = 0
                    var fataju = 0
                    var prjLR = rp.prjLR
                    var prjLP = rp.prjLP
                    var prjFat = rp.prjFat

                    if (req.body.diastr == '' || req.body.diastr == 0) {
                         if (req.body.equipe != '' && req.body.equipe > 0) {
                              var hrsequ = parseFloat(req.body.equipe) * 8
                              if (req.body.trbint != '' && req.body.trbint > 0) {
                                   projeto.equipe = req.body.equipe
                                   var dias = Math.round(parseFloat(req.body.trbint) / parseFloat(hrsequ))
                                   if (dias == 0) { dias = 1 }
                                   projeto.diastr = dias
                              } else {
                                   projeto.diastr = req.body.diastr
                              }
                         }
                    } else {
                         projeto.equipe = req.body.equipe
                         projeto.diastr = req.body.diastr
                    }
                    //var vlrDAS = regime.vlrDAS

                    //Determina o valor da horas trablhadas - individual e total
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
                    //if (req.body.pinome == null) {
                    projeto.funins = req.body.funins
                    //}
                    //if (req.body.ppnome == null) {
                    projeto.funpro = req.body.funpro
                    //}

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
                    projeto.totpro = totpro
                    projeto.totges = totges
                    projeto.totdes = totdes

                    //Validando a comissão
                    if (projeto.percom != null) {
                         vlrcom = parseFloat(projeto.valor) * (parseFloat(projeto.percom) / 100)
                         projeto.vlrcom = vlrcom.toFixed(2)
                    }

                    var totcop = parseFloat(totint) + parseFloat(totpro) + parseFloat(totges) + parseFloat(totdes) + parseFloat(totali)
                    projeto.totcop = totcop.toFixed(2)

                    var rescon = parseFloat(impele) + parseFloat(seguro) + parseFloat(outcer) + parseFloat(outpos)
                    rescon = parseFloat(rescon) + parseFloat(conadd)
                    projeto.rescon = rescon.toFixed(2)

                    var reserva = parseFloat(resger) + parseFloat(rescon)
                    projeto.reserva = reserva.toFixed(2)

                    var custoPlano = parseFloat(totcop) + parseFloat(reserva)
                    projeto.custoPlano = custoPlano.toFixed(2)

                    var custoTotal = parseFloat(custoPlano) + parseFloat(projeto.vlrequ)
                    projeto.custoTotal = custoTotal.toFixed(2)

                    //Definindo o Lucro Bruto
                    var lucroBruto = parseFloat(projeto.valor) - parseFloat(custoTotal)
                    projeto.lucroBruto = lucroBruto.toFixed(2)

                    //Definindo o imposto ISS

                    var vlrNFS = parseFloat(projeto.valor) - parseFloat(projeto.vlrequ)
                    var impNFS = parseFloat(vlrNFS) * (parseFloat(rp.alqNFS) / 100)
                    projeto.vlrNFS = vlrNFS.toFixed(2)
                    projeto.impNFS = impNFS.toFixed(2)

                    //Validar ICMS

                    if (rp.alqICMS != null) {
                         impostoICMS = parseFloat(projeto.vlrequ) * (parseFloat(rp.alqICMS) / 100)
                         projeto.impostoICMS = impostoICMS.toFixed(2)
                    }

                    //Deduzindo as comissões do Lucro Antes dos Impostos
                    if (vlrcom == 0 || vlrcom == null) {
                         lbaimp = parseFloat(lucroBruto)
                    } else {
                         lbaimp = parseFloat(lucroBruto) - parseFloat(vlrcom)
                    }
                    projeto.lbaimp = parseFloat(lbaimp).toFixed(2)


                    if (rp.regime == 'Simples') {
                         var alqEfe = ((parseFloat(prjFat) * (parseFloat(rp.alqDAS) / 100)) - (parseFloat(rp.vlrred))) / parseFloat(prjFat)
                         var totalSimples = parseFloat(vlrNFS) * (parseFloat(alqEfe))
                         totalImpGrafico = parseFloat(totalSimples).toFixed(2)
                         projeto.impostoSimples = parseFloat(totalImpGrafico).toFixed(2)
                    }

                    else {
                         if (rp.regime == 'Lucro Real') {
                              //Imposto Adicional de IRPJ
                              if ((parseFloat(prjLR) / 12) > 20000) {
                                   fatadd = (parseFloat(prjLR) / 12) - 20000
                                   fataju = parseFloat(fatadd) / 20000
                                   impostoIRPJAdd = parseFloat(lbaimp) * parseFloat(fataju).toFixed(2) * (parseFloat(rp.alqIRPJAdd) / 100)
                                   projeto.impostoAdd = parseFloat(impostoIRPJAdd).toFixed(2)
                              }

                              impostoIRPJ = parseFloat(lbaimp) * (parseFloat(rp.alqIRPJ) / 100)
                              projeto.impostoIRPJ = parseFloat(impostoIRPJ).toFixed(2)

                              impostoCSLL = parseFloat(lbaimp) * (parseFloat(rp.alqCSLL) / 100)
                              projeto.impostoCSLL = parseFloat(impostoCSLL).toFixed(2)
                              impostoPIS = parseFloat(vlrNFS) * 0.5 * (parseFloat(rp.alqPIS) / 100)
                              projeto.impostoPIS = parseFloat(impostoPIS).toFixed(2)
                              impostoCOFINS = parseFloat(vlrNFS) * 0.5 * (parseFloat(rp.alqCOFINS) / 100)
                              projeto.impostoCOFINS = parseFloat(impostoCOFINS).toFixed(2)
                              totalImposto = parseFloat(impostoIRPJ) + parseFloat(impostoIRPJAdd) + parseFloat(impostoCSLL) + parseFloat(impostoPIS) + parseFloat(impostoCOFINS)
                              totalImpGrafico = parseFloat(totalImposto).toFixed(2)

                         } else {
                              //Imposto adicional de IRPJ
                              if (((parseFloat(prjLP) * 0.32) / 3) > 20000) {
                                   fatadd = ((parseFloat(prjLP) * 0.32) / 3) - 20000
                                   fataju = parseFloat(fatadd) / 20000
                                   impostoIRPJAdd = (parseFloat(vlrNFS) * 0.32) * parseFloat(fataju).toFixed(2) * (parseFloat(rp.alqIRPJAdd) / 100)
                                   projeto.impostoAdd = parseFloat(impostoIRPJAdd).toFixed(2)
                              }
                              impostoIRPJ = parseFloat(vlrNFS) * 0.32 * (parseFloat(rp.alqIRPJ) / 100)
                              projeto.impostoIRPJ = parseFloat(impostoIRPJ).toFixed(2)
                              impostoCSLL = parseFloat(vlrNFS) * 0.32 * (parseFloat(rp.alqCSLL) / 100)
                              projeto.impostoCSLL = parseFloat(impostoCSLL).toFixed(2)
                              impostoCOFINS = parseFloat(vlrNFS) * (parseFloat(rp.alqCOFINS) / 100)
                              projeto.impostoCOFINS = parseFloat(impostoCOFINS).toFixed(2)
                              impostoPIS = parseFloat(vlrNFS) * (parseFloat(rp.alqPIS) / 100)
                              projeto.impostoPIS = parseFloat(impostoPIS).toFixed(2)
                              totalImposto = parseFloat(impostoIRPJ) + parseFloat(impostoIRPJAdd) + parseFloat(impostoCSLL) + parseFloat(impostoPIS) + parseFloat(impostoCOFINS)
                              totalImpGrafico = parseFloat(totalImposto).toFixed(2)
                         }
                    }


                    if (impostoICMS > 0) {
                         totalImposto = parseFloat(totalImpGrafico) + parseFloat(impNFS) + parseFloat(impostoICMS)
                    } else {
                         totalImposto = parseFloat(totalImpGrafico) + parseFloat(impNFS)
                    }

                    //Lucro Líquido após descontar os impostos
                    projeto.totalImposto = parseFloat(totalImposto).toFixed(2)

                    var lucroLiquido = parseFloat(lbaimp) - parseFloat(totalImposto)
                    projeto.lucroLiquido = parseFloat(lucroLiquido).toFixed(2)

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
                    var parImpNfs = parseFloat(totalImpGrafico) / parseFloat(vlrNFS) * 100
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
                    var parImpVlr = parseFloat(totalImpGrafico) / parseFloat(projeto.valor) * 100
                    projeto.parImpVlr = parseFloat(parImpVlr).toFixed(2)
                    if (vlrcom > 0) {
                         var parComVlr = parseFloat(vlrcom) / parseFloat(projeto.valor) * 100
                         projeto.parComVlr = parseFloat(parComVlr).toFixed(2)
                    }

                    projeto.save().then(() => {
                         var sucesso = []
                         sucesso.push({ texto: 'Projeto salvo com sucesso' })
                         Projeto.findOne({ _id: projeto_id }).lean().then((projeto) => {
                              projeto_id = projeto._id
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
                                   Pessoa.find({ funges: 'checked' }).lean().then((responsavel) => {
                                        //Busca instalador para listar
                                        Pessoa.find({ funins: 'checked' }).lean().then((instalador) => {
                                             //Busca projetista para listar
                                             Pessoa.find({ funpro: 'checked' }).lean().then((projetista) => {
                                                  Regime.find().lean().then((regime) => {
                                                       res.render('projeto/custosdiretos', { sucesso: sucesso, projeto: projeto, regime: regime, rp: rp, instalador: instalador, projetista: projetista, responsavel: responsavel, pr: pr, pi: pi, pp: pp, detalhe: detalhe })
                                                  }).catch((err) => {
                                                       req.flash('error_msg', 'Nenhum regime encontrado')
                                                       res.redirect('/')
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
                              }).catch(() => {
                                   req.flash('error_msg', 'Houve um erro ao encontrar o projeto')
                                   res.redirect('/')
                              })

                         }).catch(() => {
                              req.flash('error_msg', 'Houve um erro ao salvar o projeto')
                              res.redirect('/')
                         })

                    }).catch((err) => {
                         req.flash('error_msg', 'Não foi possível encontrar o regime')
                         res.redirect('/configuracao/consultaregime')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Não foi possível encontrar os detalhes do projeto')
                    res.redirect('/projeto/consulta')
               })

          }).catch(() => {
               req.flash('error_msg', 'Houve um erro ao encontrar o projeto')
               res.redirect('/')
          })
     }
})

router.post('/editar/direto', ehAdmin, (req, res) => {
     var sucesso = []
     var erros = []
     var aviso = []
     var valor
     var vlrequ
     var rp

     if (req.body.checkDatPrev == null && req.body.motivo == '' && req.body.dataprev == '') {
          erros.push({ texto: 'Para aletar a data de previsão é necessário informar um motivo.' })
     }
     if (erros.length > 0) {

          Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {
               projeto_id = projeto._id

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
                    Pessoa.find({ funges: 'checked' }).lean().then((responsavel) => {
                         //Busca instalador para listar
                         Pessoa.find({ funins: 'checked' }).lean().then((instalador) => {
                              //Busca projetista para listar
                              Pessoa.find({ funpro: 'checked' }).lean().then((projetista) => {
                                   Regime.find().lean().then((regime) => {
                                        res.render('projeto/editcustosdiretos', { erros: erros, projeto: projeto, regime: regime, rp: rp, instalador: instalador, projetista: projetista, responsavel: responsavel, pr: pr, pi: pi, pp: pp, detalhe: detalhe })
                                   }).catch((err) => {
                                        req.flash('error_msg', 'Nenhum regime encontrado')
                                        res.redirect('/')
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
                    req.flash('error_msg', 'Não foi possível encontrar os detalhes do projeto')
                    res.redirect('/projeto/consulta')
               })
          }).catch(() => {
               req.flash('error_msg', 'Houve um erro ao encontrar o projeto')
               res.redirect('/')
          })

     } else {

          Projeto.findOne({ _id: req.body.id }).then((projeto) => {

               Detalhado.findOne({ projeto: projeto._id }).then((detalhe) => {

                    Regime.findOne({ _id: projeto.regime }).lean().then((rp) => {

                         projeto_id = projeto._id
                         //Editar alterações das informações do cabeçalho do projeto
                         var cercamento
                         var poste
                         var estsolo
                         //-> checkbox
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
                         var valorEqu
                         var valorEst
                         var valorCer
                         var valorPos
                         var valorDis
                         var valorDPS
                         var valorCab
                         var valorOcp

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
                              }
                         }
                         if (req.body.valorEst != '') {
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
                         if (req.body.valorCer != '') {
                              unidadeCer = 0
                              vlrUniCer = 0
                              valorCer = req.body.valorCer
                         } else {
                              if (req.body.unidadeCer != '' && req.body.vlrUniCer != '') {
                                   unidadeCer = req.body.unidadeCe
                                   vlrUniCer = req.body.vlrUniCer
                                   valorCer = parseFloat(unidadeCer) * parseFloat(vlrUniCer)
                              }
                         }
                         //Valida valor Postes Detalhado
                         if (req.body.valorPos != '') {
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
                              }
                         }
                         //Valida valor Outros Componentes Detalhado
                         if (req.body.valorOcp != '') {
                              unidadeOcp = 0
                              vlrUniocp = 0
                              valorOcp = req.body.valorOcp
                         } else {
                              if (req.body.unidadeOcp != '' && req.body.vlrUniOcp != '') {
                                   unidadeOcp = req.body.unidadeOcp
                                   vlrUniOcp = req.body.vlrUniOcp
                                   valorOcp = parseFloat(unidadeOcp) * parseFloat(vlrUniOcp)
                              }
                         }
                         //Validando os campos dos lnaçamentos detalhado para não ficarem vazios
                         if (req.body.valorEqu == '') {
                              valorEqu = 0
                         }
                         if (req.body.valorEst == '') {
                              valorEst = 0
                         }
                         if (req.body.valorCer == '') {
                              valorCer = 0
                         }
                         if (req.body.valorPos == '') {
                              valorPos = 0
                         }
                         if (req.body.valorDis == '') {
                              valorDis = 0
                         }
                         if (req.body.valorDPS == '') {
                              valorDPS = 0
                         }
                         if (req.body.valorCab == '') {
                              valorCab = 0
                         }
                         if (req.body.valorOcp == '') {
                              valorOcp = 0
                         }

                         var vlrTotal = parseFloat(valorEqu) + parseFloat(valorEst) + parseFloat(valorPos) + parseFloat(valorDis) + parseFloat(valorDPS) + parseFloat(valorDPS) + parseFloat(valorCab) + parseFloat(valorOcp)

                         //Valida valor do equipameento
                         if (parseFloat(vlrTotal) > 0) {
                              vlrequ = vlrTotal
                         } else {
                              vlrequ = req.body.equipamento
                         }

                         //Valida o valor tota do projeto com o valores dos equipamentos
                         valor = req.body.valor
                         if (parseFloat(valor) == parseFloat(vlrequ) || parseFloat(valor) < parseFloat(vlrequ)) {
                              valor = projeto.valor
                              vrlequ = projeo.vlrequ
                              aviso.push({ texto: 'O valor do projeto está menor que o valor dos equipamentos.' })

                         }

                         //Definie os valores dos detalhes de custo dos equipamentos do projeto
                         detalhe.vlrTotal = vlrequ
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

                         //->validar alteração na data de previsão de entrega
                         if (req.body.checkDatPrev != null && req.body.motivo != '' && req.body.dataprev != '') {
                              projeto.motivo = req.body.motivo
                              projeto.dataprev = req.body.dataprev
                              projeto.ultdat = projeto.dataprev
                         }

                         //->informações básicas
                         projeto.nome = req.body.nome
                         projeto.cliente = req.body.cliente
                         projeto.valor = req.body.valor
                         projeto.vlrequ = vlrequ
                         projeto.potencia = req.body.potencia
                         projeto.percom = req.body.comissao
                         projeto.temCercamento = cercamento
                         projeto.temPosteCond = poste
                         projeto.temEstSolo = estsolo
                         //--> Altera o responsável do projeto
                         if (req.body.checkRegime != null) {
                              projeto.regime = req.body.regime
                         }

                         //Altera os profissionais de cada função
                         if (req.body.checkRes != null) {
                              projeto.funres = req.body.funres
                         }
                         if (req.body.checkIns != null) {
                              projeto.funins = req.body.funins
                         }
                         if (req.body.checkPro != null) {
                              projeto.funpro = req.body.funpro
                         }

                         //Valida informações para o cálculo dos impostos e lucros
                         var vlrcom = 0
                         var lbaimp = 0
                         var impostoICMS = 0
                         var totalImposto = 0
                         var fatadd = 0
                         var fataju = 0
                         var prjLR = rp.prjLR
                         var prjLP = rp.prjLP
                         var prjFat = rp.prjFat
                         //--> cálculo automático dos dias de obra
                         if (req.body.diastr == '' || req.body.diastr == 0) {
                              if (req.body.equipe != '' && req.body.equipe > 0) {
                                   var hrsequ = parseFloat(req.body.equipe) * 8
                                   if (req.body.trbint != '' && req.body.trbint > 0) {
                                        projeto.equipe = req.body.equipe
                                        var dias = Math.round(parseFloat(req.body.trbint) / parseFloat(hrsequ))
                                        if (dias == 0) { dias = 1 }
                                        projeto.diastr = dias
                                   } else {
                                        projeto.diastr = req.body.diastr
                                   }
                              }
                         } else {
                              projeto.equipe = req.body.equipe
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
                         if (req.body.pinome == null) {
                              projeto.funins = req.body.funins
                         }
                         if (req.body.ppnome == null) {
                              projeto.funpro = req.body.funpro
                         }

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
                         projeto.totpro = totpro
                         projeto.totges = totges
                         projeto.totdes = totdes

                         //Validando a comissão
                         if (projeto.percom != null) {
                              vlrcom = parseFloat(projeto.valor) * (parseFloat(projeto.percom) / 100)
                              projeto.vlrcom = vlrcom.toFixed(2)
                         }

                         //Salvando informações dos totais 
                         var totcop = parseFloat(totint) + parseFloat(totpro) + parseFloat(totges) + parseFloat(totdes) + parseFloat(totali)
                         projeto.totcop = totcop.toFixed(2)

                         var rescon = parseFloat(impele) + parseFloat(seguro) + parseFloat(outcer) + parseFloat(outpos)
                         rescon = parseFloat(rescon) + parseFloat(conadd)
                         projeto.rescon = rescon.toFixed(2)

                         var reserva = parseFloat(resger) + parseFloat(rescon)
                         projeto.reserva = reserva.toFixed(2)

                         var custoPlano = parseFloat(totcop) + parseFloat(reserva)
                         projeto.custoPlano = custoPlano.toFixed(2)

                         var custoTotal = parseFloat(custoPlano) + parseFloat(projeto.vlrequ)
                         projeto.custoTotal = custoTotal.toFixed(2)

                         //Definindo o Lucro Bruto
                         var lucroBruto = parseFloat(projeto.valor) - parseFloat(custoTotal)
                         projeto.lucroBruto = lucroBruto.toFixed(2)

                         //Definindo o imposto ISS

                         var vlrNFS = parseFloat(projeto.valor) - parseFloat(projeto.vlrequ)
                         var impNFS = parseFloat(vlrNFS) * (parseFloat(rp.alqNFS) / 100)
                         projeto.vlrNFS = vlrNFS.toFixed(2)
                         projeto.impNFS = impNFS.toFixed(2)

                         //Validar ICMS

                         if (rp.alqICMS != null) {
                              impostoICMS = parseFloat(projeto.vlrequ) * (parseFloat(rp.alqICMS) / 100)
                              projeto.impostoICMS = impostoICMS.toFixed(2)
                         }

                         //Deduzindo as comissões do Lucro Antes dos Impostos
                         if (vlrcom == 0 || vlrcom == null) {
                              lbaimp = parseFloat(lucroBruto)
                         } else {
                              lbaimp = parseFloat(lucroBruto) - parseFloat(vlrcom)
                         }
                         projeto.lbaimp = parseFloat(lbaimp).toFixed(2)


                         if (rp.regime == 'Simples') {
                              var alqEfe = ((parseFloat(prjFat) * (parseFloat(rp.alqDAS) / 100)) - (parseFloat(rp.vlrred))) / parseFloat(prjFat)
                              var totalSimples = parseFloat(vlrNFS) * (parseFloat(alqEfe))
                              totalImpGrafico = parseFloat(totalSimples).toFixed(2)
                              projeto.impostoSimples = parseFloat(totalImpGrafico).toFixed(2)
                         }

                         else {
                              if (rp.regime == 'Lucro Real') {
                                   //Imposto Adicional de IRPJ
                                   if ((parseFloat(prjLR) / 12) > 20000) {
                                        fatadd = (parseFloat(prjLR) / 12) - 20000
                                        fataju = parseFloat(fatadd) / 20000
                                        impostoIRPJAdd = parseFloat(lbaimp) * parseFloat(fataju).toFixed(2) * (parseFloat(rp.alqIRPJAdd) / 100)
                                        projeto.impostoAdd = parseFloat(impostoIRPJAdd).toFixed(2)
                                   }

                                   impostoIRPJ = parseFloat(lbaimp) * (parseFloat(rp.alqIRPJ) / 100)
                                   projeto.impostoIRPJ = parseFloat(impostoIRPJ).toFixed(2)

                                   impostoCSLL = parseFloat(lbaimp) * (parseFloat(rp.alqCSLL) / 100)
                                   projeto.impostoCSLL = parseFloat(impostoCSLL).toFixed(2)
                                   impostoPIS = parseFloat(vlrNFS) * 0.5 * (parseFloat(rp.alqPIS) / 100)
                                   projeto.impostoPIS = parseFloat(impostoPIS).toFixed(2)
                                   impostoCOFINS = parseFloat(vlrNFS) * 0.5 * (parseFloat(rp.alqCOFINS) / 100)
                                   projeto.impostoCOFINS = parseFloat(impostoCOFINS).toFixed(2)
                                   totalImposto = parseFloat(impostoIRPJ) + parseFloat(impostoIRPJAdd) + parseFloat(impostoCSLL) + parseFloat(impostoPIS) + parseFloat(impostoCOFINS)
                                   totalImpGrafico = parseFloat(totalImposto).toFixed(2)

                              } else {
                                   //Imposto adicional de IRPJ
                                   if (((parseFloat(prjLP) * 0.32) / 3) > 20000) {
                                        fatadd = ((parseFloat(prjLP) * 0.32) / 3) - 20000
                                        fataju = parseFloat(fatadd) / 20000
                                        impostoIRPJAdd = (parseFloat(vlrNFS) * 0.32) * parseFloat(fataju).toFixed(2) * (parseFloat(rp.alqIRPJAdd) / 100)
                                        projeto.impostoAdd = parseFloat(impostoIRPJAdd).toFixed(2)
                                   }
                                   impostoIRPJ = parseFloat(vlrNFS) * 0.32 * (parseFloat(rp.alqIRPJ) / 100)
                                   projeto.impostoIRPJ = parseFloat(impostoIRPJ).toFixed(2)
                                   impostoCSLL = parseFloat(vlrNFS) * 0.32 * (parseFloat(rp.alqCSLL) / 100)
                                   projeto.impostoCSLL = parseFloat(impostoCSLL).toFixed(2)
                                   impostoCOFINS = parseFloat(vlrNFS) * (parseFloat(rp.alqCOFINS) / 100)
                                   projeto.impostoCOFINS = parseFloat(impostoCOFINS).toFixed(2)
                                   impostoPIS = parseFloat(vlrNFS) * (parseFloat(rp.alqPIS) / 100)
                                   projeto.impostoPIS = parseFloat(impostoPIS).toFixed(2)
                                   totalImposto = parseFloat(impostoIRPJ) + parseFloat(impostoIRPJAdd) + parseFloat(impostoCSLL) + parseFloat(impostoPIS) + parseFloat(impostoCOFINS)
                                   totalImpGrafico = parseFloat(totalImposto).toFixed(2)
                              }
                         }


                         if (impostoICMS > 0) {
                              totalImposto = parseFloat(totalImpGrafico) + parseFloat(impNFS) + parseFloat(impostoICMS)
                         } else {
                              totalImposto = parseFloat(totalImpGrafico) + parseFloat(impNFS)
                         }

                         //Lucro Líquido após descontar os impostos
                         projeto.totalImposto = parseFloat(totalImposto).toFixed(2)

                         var lucroLiquido = parseFloat(lbaimp) - parseFloat(totalImposto)
                         projeto.lucroLiquido = parseFloat(lucroLiquido).toFixed(2)

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
                         var parImpNfs = parseFloat(totalImpGrafico) / parseFloat(vlrNFS) * 100
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
                         var parImpVlr = parseFloat(totalImpGrafico) / parseFloat(projeto.valor) * 100
                         projeto.parImpVlr = parseFloat(parImpVlr).toFixed(2)
                         if (vlrcom > 0) {
                              var parComVlr = parseFloat(vlrcom) / parseFloat(projeto.valor) * 100
                              projeto.parComVlr = parseFloat(parComVlr).toFixed(2)
                         }

                         projeto.save().then(() => {
                              sucesso.push({ texto: 'Projeto salvo com sucesso' })
                              Projeto.findOne({ _id: projeto_id }).lean().then((projeto) => {
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
                                        Pessoa.find({ funges: 'checked' }).lean().then((responsavel) => {
                                             //Busca instalador para listar
                                             Pessoa.find({ funins: 'checked' }).lean().then((instalador) => {
                                                  //Busca projetista para listar
                                                  Pessoa.find({ funpro: 'checked' }).lean().then((projetista) => {
                                                       Regime.find().lean().then((regime) => {
                                                            res.render('projeto/editcustosdiretos', { aviso: aviso, sucesso: sucesso, projeto: projeto, regime: regime, rp: rp, instalador: instalador, projetista: projetista, responsavel: responsavel, pr: pr, pi: pi, pp: pp, detalhe: detalhe })
                                                       }).catch((err) => {
                                                            req.flash('error_msg', 'Nenhum regime encontrado')
                                                            res.redirect('/')
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
                                   }).catch(() => {
                                        req.flash('error_msg', 'Houve um erro ao encontrar o projeto')
                                        res.redirect('/')
                                   })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Não foi possível encontrar o regime')
                                   res.redirect('/configuracao/consultaregime')
                              })
                         }).catch(() => {
                              req.flash('error_msg', 'Houve um erro ao salvar o projeto')
                              res.redirect('/')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Não foi possível encontrar o regime do projeto')
                         res.redirect('/configuracao/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Não foi possível encontrar os detalhes do projeto')
                    res.redirect('/projeto/consulta')
               })

          }).catch(() => {
               req.flash('error_msg', 'Houve um erro ao encontrar o projeto')
               res.redirect('/')
          })
     }
})

router.post('/realizar', ehAdmin, (req, res) => {

     var erros = []

     /*
          if (req.body.totint == '' || !req.body.totint || req.body.totint == null || typeof req.body.totint == undefined) {
               erros.push({ texto: 'Preencher valor de instalação com no mínimo R$ 0' })
          }
          if (req.body.totpro == '' || !req.body.totpro || req.body.totpro == null || typeof req.body.totpro == undefined) {
               erros.push({ texto: 'Preencher valor de projetista com no mínimo R$ 0' })
          }
          if (req.body.totges == '' || !req.body.totges || req.body.totges == null || typeof req.body.totges == undefined) {
               erros.push({ texto: 'Preencher valor de gestão com no mínimo R$ 0' })
          }
          if (req.body.totdes == '' || !req.body.totdes || req.body.totdes == null || typeof req.body.totdes == undefined) {
               erros.push({ texto: 'Preencher valor de deslocamento com no mínimo R$ 0' })
          }
          if (req.body.totali == '' || !req.body.totali || req.body.totali == null || typeof req.body.totali == undefined) {
               erros.push({ texto: 'Preencher valor de alimentação com no mínimo R$ 0' })
          }
     
     if (toString(req.body.ehDireto) == 'false') {
          if (req.body.tothtl == '' || !req.body.tothtl || req.body.tothtl == null || typeof req.body.tothtl == undefined) {
               erros.push({ texto: 'Preencher valor de estadia com no mínimo R$ 0' })
          }
     }
     */

     if (erros.length > 0) {

          Projeto.findOne({ _id: req.body.id }).then((projeto) => {
               Realizado.findOne({ projeto: projeto._id }).lean().then((realizado) => {
                    projeto_id = realizado.projeto
                    res.render('projeto/realizado', { projeto: projeto, realizado: realizado, erros: erros })
               }).catch((err) => {
                    req.flash('error_msg', 'Projeto não encontrado 1')
                    res.render('projeto/realizado', { projeto: projeto, erros: erros })
               })
          }).catch((err) => {
               req.flash('error_msg', 'Realizado não encontrado 2')
               res.redirect('/projeto/consulta')
          })

     } else {

          Projeto.findOne({ _id: req.body.id }).then((projeto) => {

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
                    var projeto_lucroBruto = projeto.lucroBruto
                    var projeto_lbaimp = projeto.lbaimp
                    var projeto_lucroLiquido = projeto.lucroLiquido

                    var totint
                    var totges
                    var totpro
                    var totali
                    var totdes
                    var tothtl
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
                    if (req.body.totdes != '') {
                         totdes = req.body.totdes
                    } else {
                         totdes = 0
                    }
                    tothtl = 0
                    if (projeto.ehDireto == false) {
                         if (req.body.tothtl != '') {
                              tothtl = req.body.tothtl
                         } else {
                              tothtl = 0
                         }
                    }
                    totalPlano = parseFloat(totint) + parseFloat(totges) + parseFloat(totpro) + parseFloat(totali) + parseFloat(totdes) + parseFloat(tothtl)

                    var vlrequ
                    var vlrFaturado
                    var impISSNfs
                    var vlrPrjNFS
                    if (req.body.vlrequ != '') {
                         vlrequ = req.body.vlrequ
                         vlrFaturado = parseFloat(projeto.valor) - parseFloat(vlrequ)
                         impISSNfs = parseFloat(vlrFaturado) * (parseFloat(rp.alqNFS) / 100)
                         vlrPrjNFS = vlrFaturado.toFixed(2)
                    } else {
                         vlrequ = projeto.vlrequ
                         if (!projeto.vlrNFS || projeto.vlrNFS != '') {
                              vlrPrjNFS = projeto.vlrNFS
                         } else {
                              vlrPrjNFS = 0
                         }
                    }
                    var prjLucroBruto = parseFloat(vlrPrjNFS) - parseFloat(totalPlano)
                    prjLucroBruto = prjLucroBruto.toFixed(2)

                    //Valida a comissão e calcula o lucroBruto
                    var vlrcom
                    if (req.body.vlrcom == '') {
                         vlrcom = 0
                    } else {
                         vlrcom = req.body.vlrcom
                    }
                    var lbaimp
                    lbaimp = parseFloat(prjLucroBruto) - parseFloat(vlrcom)
                    lbaimp = lbaimp.toFixed(2)
                    //-------------------------------------

                    var impmanual = ''
                    var impISS = 0
                    var impSimples = 0
                    var impIRPJ = 0
                    var impIRPJAdd = 0
                    var impCSLL = 0
                    var impPIS = 0
                    var impCOFINS = 0
                    var impostoICMS = 0
                    var impICMS = 0
                    var totalImpGrafico = 0

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
                         console.log(impISS)

                         if (!rp.alqICMS) {
                              impICMS = 0
                         } else {
                              impostoICMS = parseFloat(req.body.vlrequ) * (parseFloat(rp.alqICMS) / 100)
                              impICMS = impostoICMS.toFixed(2)
                         }

                         var totalImposto
                         var fatadd
                         var fataju
                         var prjLR = rp.prjLR
                         var prjLP = rp.prjLP
                         var prjFat = rp.prjFat

                         if (rp.regime == 'Simples') {
                              var alqEfe = ((parseFloat(prjFat) * (parseFloat(rp.alqDAS) / 100)) - (parseFloat(rp.vlrred))) / parseFloat(prjFat)
                              impSimples = parseFloat(vlrPrjNFS) * (parseFloat(alqEfe))
                              impSimples = totalImpGrafico.toFixed(2)
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
                                        fataju = parseFloat(fatadd) / 20000
                                        impIRPJAdd = parseFloat(lbaimp) * parseFloat(fataju) * (parseFloat(rp.alqIRPJAdd) / 100)
                                        impIRPJAdd = impIRPJAdd.toFixed(2)
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
                                   impCOFINS = parseFloat(vlrNFS) * (parseFloat(rp.alqCOFINS) / 100)
                                   impCOFINS = impCOFINS.toFixed(2)
                                   impPIS = parseFloat(vlrPrjNFS) * (parseFloat(rp.alqPIS) / 100)
                                   impPIS = impPIS.toFixed(2)
                              }
                         }
                    }                    
                    //----------------------------
                    
                    if (rp.regime == 'Lucro Real' || rp.regime == 'Luro Presumido') {
                         totalImposto = parseFloat(impIRPJ) + parseFloat(impIRPJAdd) + parseFloat(impCSLL) + parseFloat(impPIS) + parseFloat(impCOFINS)
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
                    //var parCmbVlr = (parseFloat(totcmb) / parseFloat(projeto.valor)) * 100
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
                    var parIntNfs = (parseFloat(totint) / parseFloat(vlrPrjNFS)) * 100
                    parIntNfs = parIntNfs.toFixed(2)
                    var parGesNfs = (parseFloat(totges) / parseFloat(vlrPrjNFS)) * 100
                    parGesNfs = parGesNfs.toFixed(2)
                    var parProNfs = (parseFloat(totpro) / parseFloat(vlrPrjNFS)) * 100
                    parProNfs = parProNfs.toFixed(2)
                    var parDesNfs = (parseFloat(totdes) / parseFloat(vlrPrjNFS)) * 100
                    parDesNfs = parDesNfs.toFixed(2)
                    //var parCmbNfs = (parseFloat(totcmb) / parseFloat(vlrPrjNFS)) * 100
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
                         parDedNfs = parDedNfs.toFixed(2)
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
                    var mes = parseFloat(data.getMonth()) + 1
                    var ano = data.getFullYear()

                    //if (projeto.custoPlano > 0){

                    const realizado = {
                         projeto: prj_id,
                         foiRealizado: true,
                         data: dia + '/' + mes + '/' + ano,
                         totint: totint,
                         totges: totges,
                         totpro: totpro,
                         totali: totali,
                         totdes: totdes,
                         tothtl: tothtl,

                         custoPlano: totalPlano,
                         vlrequ: vlrequ,
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
                         if (req.body.datafim != '') {
                              projeto.datafim = req.body.datafim
                         }
                         projeto.save().then(() => {
                              Projeto.findOne({ _id: req.body.id }).lean().then((projeto_find) => {
                                   Realizado.findOne({ projeto: projeto_find._id }).lean().then((realizado) => {
                                        sucesso.push({ texto: 'Projeto realizado com sucesso' })
                                        res.render('projeto/realizado', { sucesso: sucesso, projeto: projeto_find, realizado: realizado })
                                   }).catch((err) => {
                                        req.flash('error_msg', 'Realizado não encontrado')
                                        res.redirect('/projeto/consulta')
                                   })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Não foi possível encontrar o projeto')
                                   res.redirect('/projeto/consulta')
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Não foi possível salvar o projeto')
                              res.redirect('/projeto/consulta')
                         })


                    }).catch((err) => {
                         req.flash('error_msg', 'Não foi posível realizar o projeto')
                         res.redirect('/projeto/consulta')
                    })
                    /*
                    }else{
                         req.flash('error_msg', 'Não foi possível realizar o projeto pois não há custos lançados')
                         res.redirect('/projeto/consulta')
                    }
                    */
               }).catch((err) => {
                    req.flash('error_msg', 'Regime não encontrado')
                    res.redirect('/projeto/consulta')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Projeto não encontrado')
               res.redirect('/projeto/consulta')
          })
     }

})

router.post('/filtrar', ehAdmin, (req, res) => {
     var foirealizado
     var ehdireto
     var funres = req.body.funres
     var direto = req.body.direto
     var realizado = req.body.realizado

     if (realizado == 'Todos' && direto == 'Todos' && funres == 'Todos') {
          Projeto.find().lean().then((projetos) => {
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
                    Projeto.find({ ehDireto: ehdireto }).lean().then((projetos) => {
                         Pessoa.find({ funges: 'checked' }).lean().then((responsavel) => {
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
                         Projeto.find({ foiRealizado: foirealizado }).lean().then((projetos) => {
                              Pessoa.find({ funges: 'checked' }).lean().then((responsavel) => {
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
                         Projeto.find({ ehDireto: ehdireto, foiRealizado: foirealizado }).lean().then((projetos) => {
                              Pessoa.find({ funges: 'checked' }).lean().then((responsavel) => {
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
                         Pessoa.findOne({ nome: funres }).lean().then((pr) => {
                              Projeto.find({ funres: pr._id }).lean().then((projetos) => {
                                   Pessoa.find({ funges: 'checked' }).lean().then((responsavel) => {
                                        res.render('projeto/findprojetos', { projetos: projetos, responsavel: responsavel, pr:pr, filDireto: direto, filReal: realizado })
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
                              Pessoa.findOne({ nome: funres }).lean().then((pr) => {
                                   Projeto.find({ funres: pr._id, ehDireto: ehdireto }).lean().then((projetos) => {
                                        Pessoa.find({ funges: 'checked' }).lean().then((responsavel) => {
                                             res.render('projeto/findprojetos', { projetos: projetos, responsavel: responsavel, pr:pr, filDireto: direto, filReal: realizado })
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
                                   Pessoa.findOne({ nome: funres }).lean().then((pr) => {
                                        Projeto.find({ funres: pr._id, foiRealizado: foirealizado }).lean().then((projetos) => {
                                             Pessoa.find({ funges: 'checked' }).lean().then((responsavel) => {
                                                  res.render('projeto/findprojetos', { projetos: projetos, responsavel: responsavel, pr:pr, filDireto: direto, filReal: realizado })
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
                                   Pessoa.findOne({ nome: funres }).lean().then((pr) => {
                                        Projeto.find({ funres: pr._id, ehDireto: ehdireto, foiRealizado: foirealizado }).lean().then((projetos) => {
                                             Pessoa.find({ funges: 'checked' }).lean().then((responsavel) => {
                                                  res.render('projeto/findprojetos', { projetos: projetos, responsavel: responsavel, pr:pr, filDireto: direto, filReal: realizado })
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

module.exports = router