const express = require('express')
const router = express.Router()

require('../app')
require('../model/Regime')
require('../model/Cliente')
require('../model/CustoDetalhado')

const mongoose = require('mongoose')
const Projeto = mongoose.model('projeto')
const Configuracao = mongoose.model('configuracao')
const Regime = mongoose.model('regime')
const Realizado = mongoose.model('realizado')
const Cliente = mongoose.model('cliente')
const Detalhado = mongoose.model('custoDetalhado')

const { ehAdmin } = require('../helpers/ehAdmin')

//Configurando pasta de imagens 
router.use(express.static('imagens'))

global.projeto_id

router.get('/dashboard/:id', ehAdmin, (req, res) => {
    Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
        res.render('projeto/gerenciamento/dashboard', { projeto: projeto })
    })

})

router.get('/dashboardliquido/:id', ehAdmin, (req, res) => {
    Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
        res.render('projeto/gerenciamento/dashboardliquido', { projeto: projeto })
    })
})

router.get('/dashboardreal/:id', ehAdmin, (req, res) => {

    Realizado.findOne({ _id: req.params.id }).lean().then((realizado) => {

        Projeto.findOne({ _id: realizado.projeto }).lean().then((projeto) => {

            res.render('projeto/gerenciamento/dashboardreal', { projeto: projeto, realizado: realizado })

        }).catch((err) => {
            req.flash('error_msg', 'Falha interna.')
            res.redirect('/projeto/consulta')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar o projeto realizado.')
        res.redirect('/projeto/consulta')
    })
})

router.get('/dashboardrealliquido/:id', ehAdmin, (req, res) => {

    Realizado.findOne({ _id: req.params.id }).lean().then((realizado) => {

        Projeto.findOne({ _id: realizado.projeto }).lean().then((projeto) => {

            res.render('projeto/gerenciamento/dashboardrealliquido', { projeto: projeto, realizado: realizado })

        }).catch((err) => {
            req.flash('error_msg', 'Falha interna.')
            res.redirect('/projeto/consulta')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar o projeto realizado')
        res.redirect('/projeto/consulta')
    })
})

router.get('/:id', ehAdmin, (req, res) => {
    const { _id } = req.user
    Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
        Regime.findOne({ _id: projeto.regime }).lean().then((regime) => {
            Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                res.render('projeto/gerenciamento/gerenciamento', { projeto: projeto, cliente: cliente, regime: regime })
            }).catch((err) => {
                req.flash('error_msg', 'Nenhum cliente encontrado.')
                res.redirect('/cliente/consulta')
            })
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve uma flaha ao buscar o projeto.')
        res.redirect('/projeto')
    })
})

router.get('/tributos/:id', ehAdmin, (req, res) => {
    const { _id } = req.user
    Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {

        projeto_id = projeto._id

        Regime.findOne({ _id: projeto.regime }).lean().then((regime) => {
            Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                res.render('projeto/gerenciamento/tributos', { projeto: projeto, cliente: cliente, regime: regime })
            }).catch((err) => {
                req.flash('error_msg', 'Nenhum cliente encontrado.')
                res.redirect('/cliente/consulta')
            })
        })
    }).catch((err) => {
        req.flash('error_msg', 'Nenhum projeto encontrado.')
        res.redirect('/menu')
    })
})

router.get('/editar/tributos/:id', ehAdmin, (req, res) => {
    const { _id } = req.user
    var ehSimples = false
    var ehLP = false
    var ehLR = false
    Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {

        projeto_id = projeto._id

        Regime.findOne({ _id: projeto.regime }).lean().then((regime) => {
            switch (regime.regime) {
                case "Simples": ehSimples = true
                    break;
                case "Lucro Presumido": ehLP = true
                    break;
                case "Lucro Real": ehLR = true
                    break;
            }
            Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                res.render('projeto/gerenciamento/edittributos', { projeto: projeto, regime: regime, ehSimples: ehSimples, ehLP: ehLP, ehLR: ehLR, cliente: cliente })
            }).catch((err) => {
                req.flash('error_msg', 'Nenhum cliente encontrado.')
                res.redirect('/cliente/consulta')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Houve uma falha ao encontrar o regime.')
            res.redirect('/configuracao/consulta')
        })

    }).catch((err) => {
        req.flash('error_msg', 'Houve uma falha ao encontrar o projeto.')
        res.redirect('/projeto/consulta')
    })
})

router.get('/editar/gerenciamento/:id', ehAdmin, (req, res) => {
    const { _id } = req.user
    Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
        Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
            res.render('projeto/gerenciamento/editgerenciamento', { projeto: projeto, cliente: cliente })
        }).catch((err) => {
            req.flash('error_msg', 'Nenhum cliente encontrado.')
            res.redirect('/cliente/consulta')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve uma falha ao encontrar o projeto.')
        res.redirect('/projeto/consulta')
    })
})

router.post('/', ehAdmin, (req, res) => {
    const { _id } = req.user
    var erros = []
    /*
    if (req.body.equipe == '') {
        erros.push({ texto: 'Prencheer valor de equipe de instalação de no mínimo 1 integrante.' })
    }
    */
    //Valida campos já salvos
    Projeto.findOne({ _id: req.body.id }).then((projeto) => {
        if (parseFloat(projeto.trbint) == 0 || projeto.trbint == null) {
            erros.push({ texto: 'Realizar ao menos um custo de instalação.' })
        }
        if (parseFloat(projeto.trbpro) == 0 || projeto.trbpro == null) {
            erros.push({ texto: 'Realizar ao menos um custo de projetista.' })
        }
        if (parseFloat(projeto.trbges) == 0 || projeto.trbges == null) {
            erros.push({ texto: 'Realizar ao menos um custos de gestão.' })
        }
    })

    if (erros.length > 0) {
        Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {
            Regime.find({ user: _id }).lean().then((regime) => {
                Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                    res.render('projeto/gerenciamento/gerenciamento', { erros: erros, projeto: projeto, regime: regime, cliente: cliente })
                }).catch((err) => {
                    req.flash('error_msg', 'Nenhum cliente encontrado.')
                    res.redirect('/cliente/consulta')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Hove uma falha interna.')
                res.redirect('/configuracao/consultaregime')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Hove uma falha interna.')
            res.redirect('/projeto/consulta')
        })
    } else {
        Projeto.findOne({ _id: req.body.id }).then((projeto) => {
            Detalhado.findOne({ projeto: req.body.id }).then((detalhe) => {
                Regime.findOne({ _id: projeto.regime }).then((regime) => {
                    //console.log('entrou')
                    //Edição dos Custos de Deslocamento
                    //var medkmh = 10
                    var medkmh
                    Configuracao.findOne({ _id: projeto.configuracao }).then((config) => {
                        if (parseFloat(config.medkmh) > 0) {
                            medkmh = config.medkmh
                        } else {
                            medkmh = 10
                        }

                        //Definindo o número de dias de obras
                        var equipe = projeto.qtdequipe
                        projeto.qtdequipe = equipe

                        var diastr = Math.round(parseFloat((projeto.trbmod) + parseFloat(projeto.trbest)) / parseFloat(config.hrstrb))
                        projeto.diastr = diastr

                        //console.log('equipe=>' + equipe)
                        //console.log('hrsequ=>' + hrsequ)
                        //console.log('projeto.trbint=>' + projeto.trbint)
                        //console.log('diastr=>' + diastr)

                        var vlrali
                        var discmb
                        var ltocmb
                        var vlrdia
                        if (req.body.vlrali == '') {
                            vlrali = 0
                        } else {
                            vlrali = req.body.vlrali
                        }
                        if (req.body.discmb == '') {
                            discmb = 0
                        } else {
                            discmb = req.body.discmb
                        }
                        if (req.body.ltocmb == '') {
                            ltocmb = 0
                        } else {
                            ltocmb = req.body.ltocmb
                        }
                        if (req.body.vlrdia == '') {
                            vlrdia = 0
                        } else {
                            vlrdia = req.body.vlrdia
                        }
                        projeto.vlrali = vlrali
                        projeto.discmb = discmb
                        projeto.ltocmb = ltocmb
                        projeto.vlrdia = vlrdia
                        //console.log('vlrali=>' + vlrali)
                        //console.log('discmb=>' + discmb)
                        //console.log('ltocmb=>' + ltocmb)
                        //console.log('vlrdia=>' + vlrdia)
                        var tothtl
                        var totcmb
                        var totali
                        //Definindo custo hotel
                        if (parseFloat(vlrdia) > 0) {
                            tothtl = parseFloat(vlrdia) * parseFloat(diastr) * parseFloat(equipe)
                        } else {
                            tothtl = 0
                        }

                        //Definindo custo deslocamento
                        if (parseFloat(discmb) > 0 && parseFloat(ltocmb)) {
                            autmed = parseFloat(req.body.discmb) / parseFloat(medkmh)
                            totcmb = parseFloat(autmed) * parseFloat(req.body.ltocmb)
                        } else {
                            totcmb = 0
                        }

                        //Definindo custo deslocamento
                        if (parseFloat(vlrali) > 0) {
                            totali = parseFloat(req.body.vlrali) * parseFloat(equipe)
                        } else {
                            totali = 0
                        }
                        projeto.tothtl = tothtl.toFixed(2)
                        projeto.totcmb = totcmb.toFixed(2)
                        projeto.totali = totali.toFixed(2)

                        var totdes = parseFloat(totali) + parseFloat(totcmb) + parseFloat(tothtl)
                        projeto.totdes = totdes.toFixed(2)
                        //--------------------------------------------   

                        var tothrs = parseFloat(projeto.trbint) + parseFloat(projeto.trbpro) + parseFloat(projeto.trbges)
                        projeto.tothrs = tothrs

                        //console.log('totcmb=>' + totcmb)
                        //console.log('tothtl=>' + tothtl)
                        //console.log('totali=>' + totali)
                        //console.log('totdes=>' + totdes)
                        //console.log('tothrs=>' + tothrs)

                        //Custo de Reserva
                        var resger
                        var conadd
                        var impele
                        var seguro
                        var outcer
                        var outpos
                        if (req.body.resger == '') {
                            resger = 0
                        } else {
                            resger = req.body.resger
                        }
                        if (req.body.conadd == '') {
                            conadd = 0
                        } else {
                            conadd = req.body.conadd
                        }
                        if (req.body.impele == '') {
                            impele = 0
                        } else {
                            impele = req.body.impele
                        }
                        if (req.body.seguro == '') {
                            seguro = 0
                        } else {
                            seguro = req.body.seguro
                        }
                        if (req.body.outcer == '') {
                            outcer = 0
                        } else {
                            outcer = req.body.outcer
                        }
                        if (req.body.outpos == '') {
                            outpos = 0
                        } else {
                            outpos = req.body.outpos
                        }
                        projeto.resger = resger
                        projeto.conadd = conadd
                        projeto.impele = impele
                        projeto.seguro = seguro
                        projeto.outcer = outcer
                        projeto.outpos = outpos

                        //console.log('resger=>' + resger)
                        //console.log('conadd=>' + conadd)
                        //console.log('impele=>' + impele)
                        //console.log('seguro=>' + seguro)
                        //console.log('outcer=>' + outcer)
                        //console.log('outpos=>' + outpos)

                        var rescon = parseFloat(impele) + parseFloat(seguro) + parseFloat(outcer) + parseFloat(outpos)
                        rescon = parseFloat(rescon) + parseFloat(conadd)
                        projeto.rescon = rescon.toFixed(2)
                        var reserva = parseFloat(resger) + parseFloat(rescon)
                        projeto.reserva = reserva.toFixed(2)

                        //console.log('rescon=>' + rescon)
                        //console.log('reserva=>' + reserva)
                        //console.log('valorCer=>' + detalhe.valorCer)
                        //console.log('valorPos=>' + detalhe.valorPos)
                        var vlrcom = 0
                        //Validando a comissão
                        if (projeto.percom != null) {
                            vlrcom = parseFloat(projeto.vlrfat) * (parseFloat(projeto.percom) / 100)
                            projeto.vlrcom = vlrcom.toFixed(2)
                        }

                        var custoFix = parseFloat(projeto.totint) + parseFloat(projeto.totpro) + parseFloat(projeto.vlrart) + parseFloat(projeto.totges)
                        var custoVar = parseFloat(totdes)
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

                        var custoPlano = parseFloat(totcop) + parseFloat(reserva)
                        projeto.custoPlano = custoPlano.toFixed(2)
                        //console.log('custoPlano=>' + custoPlano)
                        custoTotal = parseFloat(custoPlano) + parseFloat(projeto.vlrkit)
                        projeto.custoTotal = custoTotal.toFixed(2)
                        //console.log('custoTotal=>'+custoTotal)
                        //console.log('projeto.vlrfat=>' + projeto.vlrfat)
                        var vlrNFS = parseFloat(projeto.vlrfat)
                        //console.log('regime.alqNFS=>' + regime.alqNFS)
                        var impNFS = parseFloat(vlrNFS) * (parseFloat(regime.alqNFS) / 100)
                        projeto.vlrNFS = vlrNFS
                        projeto.impNFS = impNFS
                        //console.log('impNFS=>' + impNFS)
                        //console.log('projeto.valor=>' + projeto.valor)

                        //Definindo o Lucro Bruto
                        var recLiquida = parseFloat(projeto.valor) - parseFloat(impNFS)
                        projeto.recLiquida = recLiquida.toFixed(2)

                        var lucroBruto = parseFloat(recLiquida) - parseFloat(projeto.vlrkit)
                        projeto.lucroBruto = lucroBruto.toFixed(2)

                        //console.log('lucroBruto=>' + lucroBruto)

                        var desAdm = 0
                        var lbaimp = 0
                        if (parseFloat(regime.desadm) > 0) {
                            if (regime.tipodesp == 'Percentual') {
                                desAdm = (parseFloat(regime.desadm) * (parseFloat(regime.perdes) / 100)).toFixed(2)
                            } else {
                                desAdm = ((parseFloat(regime.desadm) / parseFloat(regime.estkwp)) * parseFloat(projeto.potencia)).toFixed(2)
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
                        //console.log('lbaimp=>' + lbaimp)

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

                        projeto.save().then(() => {
                            var sucesso = []
                            sucesso.push({ texto: 'Custo de gerenciamento aplicado com sucesso.' })

                            Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {

                                Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                                    res.render('projeto/gerenciamento/gerenciamento', { sucesso: sucesso, projeto: projeto, cliente: cliente })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Nenhum cliente encontrado.')
                                    res.redirect('/cliente/consulta')
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
                        req.flash('error_msg', 'Houve um erro ao encontrar as configurações.')
                        res.redirect('/configuracao/consulta')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Falha ao encontrar o regime.')
                    res.redirect('/menu')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao encontrar os detalhes.')
                res.redirect('/menu')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao encontrar o projeto.')
            res.redirect('/projeto/consulta')
        })
    }
})

router.post('/editar/gerenciamento/', ehAdmin, (req, res) => {
    const { _id } = req.user
    var erros = []
    var sucesso = []
    /*
    if (req.body.equipe == '') {
        erros.push({ texto: 'Prencheer valor de equipe de instalação de no mínimo 1 integrante.' })
    }
    */
    //Valida total dos custos já salvos para aplicar as informações de gerenciamento
    Projeto.findOne({ _id: req.body.id }).then((projeto_valida) => {
        if (parseFloat(projeto_valida.trbint) == 0 || projeto_valida.trbint == null) {
            erros.push({ texto: 'Realizar ao menos um custo de instalação.' })
        }
        if (parseFloat(projeto_valida.trbpro) == 0 || projeto_valida.trbpro == null) {
            erros.push({ texto: 'Realizar ao menos um custo de projetista.' })
        }
        if (parseFloat(projeto_valida.trbges) == 0 || projeto_valida.trbges == null) {
            erros.push({ texto: 'Realizar ao menos um custos de gestão.' })
        }
    })

    if (erros.length > 0) {

        Projeto.findOne({ _id: req.body.id }).lean().then((projeto_erro) => {
            Regime.find({ user: _id }).lean().then((regime) => {
                Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                    res.render('projeto/gerenciamento/editgerenciamento', { erros: erros, projeto: projeto_erro, regime: regime, cliente: cliente })
                }).catch((err) => {
                    req.flash('error_msg', 'Nenhum cliente encontrado.')
                    res.redirect('/cliente/consulta')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Hove uma falha interna.')
                res.redirect('/configuracao/consultaregime')
            })

        }).catch((err) => {
            req.flash('error_msg', 'Hove uma falha interna.')
            res.redirect('/projeto/consulta')
        })

    } else {

        Projeto.findOne({ _id: req.body.id }).then((projeto) => {
            Detalhado.findOne({ projeto: req.body.id }).then((detalhe) => {
                Regime.findOne({ _id: projeto.regime }).then((regime) => {
                    //console.log('entrou')
                    //Edição dos Custos de Deslocamento
                    //var medkmh = 10
                    var medkmh
                    Configuracao.findOne({ _id: projeto.configuracao }).then((config) => {
                        if (parseFloat(config.medkmh) > 0) {
                            medkmh = config.medkmh
                        } else {
                            medkmh = 10
                        }

                        //Definindo o número de dias de obras
                        var equipe = projeto.qtdequipe
                        projeto.qtdequipe = equipe

                        /*
                        var hrsequ
                        if (parseFloat(projeto.unimod) > 22 && parseFloat(projeto.uniest) > 7 && parseFloat(projeto.qtdequipe) > 4) {
                            hrsequ = (parseFloat(equipe) - 2) * 6
                        } else {
                            hrsequ = (parseFloat(equipe) -1) * 6
                        }
                        var diastr = Math.round(parseFloat(projeto.trbint) / parseFloat(hrsequ))
                        if (diastr == 0) {
                            diastr = 1
                        }
                        projeto.diastr = diastr
                        */
                        var diastr = Math.round(parseFloat((projeto.trbmod) + parseFloat(projeto.trbest)) / parseFloat(config.hrstrb))
                        projeto.diastr = diastr

                        //console.log('equipe=>' + equipe)

                        var vlrali
                        var discmb
                        var ltocmb
                        var vlrdia
                        if (req.body.vlrali == '') {
                            vlrali = 0
                        } else {
                            vlrali = req.body.vlrali
                        }
                        if (req.body.discmb == '') {
                            discmb = 0
                        } else {
                            discmb = req.body.discmb
                        }
                        if (req.body.ltocmb == '') {
                            ltocmb = 0
                        } else {
                            ltocmb = req.body.ltocmb
                        }
                        if (req.body.vlrdia == '') {
                            vlrdia = 0
                        } else {
                            vlrdia = req.body.vlrdia
                        }
                        projeto.vlrali = vlrali
                        projeto.discmb = discmb
                        projeto.ltocmb = ltocmb
                        projeto.vlrdia = vlrdia
                        //console.log('vlrali=>'+vlrali)
                        //console.log('discmb=>'+discmb)
                        //console.log('ltocmb=>'+ltocmb)
                        //console.log('vlrdia=>'+vlrdia)

                        var tothtl
                        var totcmb
                        var totali
                        //Definindo custo hotel
                        if (parseFloat(vlrdia) > 0) {
                            tothtl = parseFloat(vlrdia) * parseFloat(diastr) * parseFloat(equipe)
                        } else {
                            tothtl = 0
                        }

                        //Definindo custo deslocamento
                        if (parseFloat(discmb) > 0 && parseFloat(ltocmb)) {
                            autmed = parseFloat(req.body.discmb) / parseFloat(medkmh)
                            totcmb = parseFloat(autmed) * parseFloat(req.body.ltocmb)
                        } else {
                            totcmb = 0
                        }

                        //Definindo custo deslocamento
                        if (parseFloat(vlrali) > 0) {
                            totali = parseFloat(req.body.vlrali) * parseFloat(equipe)
                        } else {
                            totali = 0
                        }
                        projeto.tothtl = tothtl.toFixed(2)
                        projeto.totcmb = totcmb.toFixed(2)
                        projeto.totali = totali.toFixed(2)

                        var totdes = parseFloat(totali) + parseFloat(totcmb) + parseFloat(tothtl)
                        projeto.totdes = totdes.toFixed(2)
                        //--------------------------------------------   

                        var tothrs = parseFloat(projeto.trbint) + parseFloat(projeto.trbpro) + parseFloat(projeto.trbges)
                        projeto.tothrs = tothrs

                        //console.log('totcmb=>'+totcmb)
                        //console.log('tothtl=>'+tothtl)
                        //console.log('totali=>'+totali)
                        //console.log('totdes=>'+totdes)
                        //console.log('tothrs=>'+tothrs)

                        //Custo de Reserva
                        var resger
                        var conadd
                        var impele
                        var seguro
                        var outcer
                        var outpos
                        if (req.body.resger == '') {
                            resger = 0
                        } else {
                            resger = req.body.resger
                        }
                        if (req.body.conadd == '') {
                            conadd = 0
                        } else {
                            conadd = req.body.conadd
                        }
                        if (req.body.impele == '') {
                            impele = 0
                        } else {
                            impele = req.body.impele
                        }
                        if (req.body.seguro == '') {
                            seguro = 0
                        } else {
                            seguro = req.body.seguro
                        }
                        if (req.body.outcer == '') {
                            outcer = 0
                        } else {
                            outcer = req.body.outcer
                        }
                        if (req.body.outpos == '') {
                            outpos = 0
                        } else {
                            outpos = req.body.outpos
                        }
                        projeto.resger = resger
                        projeto.conadd = conadd
                        projeto.impele = impele
                        projeto.seguro = seguro
                        projeto.outcer = outcer
                        projeto.outpos = outpos

                        //console.log('resger=>'+resger)
                        //console.log('conadd=>'+conadd)
                        //console.log('impele=>'+impele)
                        //console.log('seguro=>'+seguro)
                        //console.log('outcer=>'+outcer)
                        //console.log('outpos=>'+outpos)

                        var rescon = parseFloat(impele) + parseFloat(seguro) + parseFloat(outcer) + parseFloat(outpos)
                        rescon = parseFloat(rescon) + parseFloat(conadd)
                        projeto.rescon = rescon.toFixed(2)
                        var reserva = parseFloat(resger) + parseFloat(rescon)
                        projeto.reserva = reserva.toFixed(2)

                        //console.log('rescon=>'+rescon)
                        //console.log('reserva=>'+reserva)   
                        //console.log('projeto.totint=>'+projeto.totint)
                        //console.log('projeto.totpro=>'+projeto.totpro) 
                        //console.log('projeto.totges=>'+projeto.totges) 
                        //console.log('projeto.valorCer=>'+projeto.valorCer)
                        //console.log('projeto.valorPos=>'+projeto.valorPos)
                        //console.log('projeto.valorOcp=>'+projeto.valorOcp)

                        var custoFix = parseFloat(projeto.totint) + parseFloat(projeto.totpro) + parseFloat(projeto.vlrart) + parseFloat(projeto.totges)
                        var custoVar = parseFloat(totdes)
                        var custoEst = parseFloat(detalhe.valorCer) + parseFloat(detalhe.valorPos) + parseFloat(detalhe.valorCen)
                        var totcop = parseFloat(custoFix) + parseFloat(custoVar) + parseFloat(custoEst)

                        //console.log('totint=>' + totint)
                        //console.log('totpro=>' + totpro)
                        //console.log('totges=>' + totges)
                        //console.log('totali=>' + totali)
                        //console.log('detalhe.valorOcp=>' + detalhe.valorOcp)
                        //console.log('detalhe.valorCer=>' + detalhe.valorCer)
                        //console.log('detalhe.valorPos=>' + detalhe.valorPos)
                        var vlrcom = 0
                        //Validando a comissão
                        if (projeto.percom != null) {
                            vlrcom = parseFloat(projeto.vlrfat) * (parseFloat(projeto.percom) / 100)
                            projeto.vlrcom = vlrcom.toFixed(2)
                        }
                        projeto.custofix = custoFix.toFixed(2)
                        projeto.custovar = custoVar.toFixed(2)
                        projeto.custoest = custoEst.toFixed(2)
                        projeto.totcop = totcop.toFixed(2)
                        //console.log('totcop=>'+totcop)
                        var custoPlano = parseFloat(totcop) + parseFloat(reserva)
                        projeto.custoPlano = custoPlano.toFixed(2)
                        //console.log('custoPlano=>'+custoPlano)
                        custoTotal = parseFloat(custoPlano) + parseFloat(projeto.vlrkit)
                        projeto.custoTotal = custoTotal.toFixed(2)
                        console.log('custoTotal=>' + custoTotal)

                        console.log('projeto.vlrfat=>' + projeto.vlrfat)
                        var vlrNFS = parseFloat(projeto.vlrfat)
                        //console.log('regime.alqNFS=>' + regime.alqNFS)
                        var impNFS = parseFloat(vlrNFS) * (parseFloat(regime.alqNFS) / 100)
                        projeto.vlrNFS = vlrNFS
                        projeto.impNFS = impNFS
                        console.log('impNFS=>' + impNFS)
                        console.log('projeto.valor=>' + projeto.valor)

                        //Definindo o Lucro Bruto
                        var recLiquida = parseFloat(projeto.valor) - parseFloat(impNFS)
                        projeto.recLiquida = recLiquida.toFixed(2)

                        var lucroBruto = parseFloat(recLiquida) - parseFloat(projeto.vlrkit)
                        projeto.lucroBruto = lucroBruto.toFixed(2)

                        console.log('vlrcom=>' + vlrcom)
                        console.log('lucroBruto=>' + lucroBruto)

                        var desAdm = 0
                        var lbaimp = 0
                        if (parseFloat(regime.desadm) > 0) {
                            if (regime.tipodesp == 'Percentual') {
                                desAdm = (parseFloat(regime.desadm) * (parseFloat(regime.perdes) / 100)).toFixed(2)
                            } else {
                                desAdm = ((parseFloat(regime.desadm) / parseFloat(regime.estkwp)) * parseFloat(projeto.potencia)).toFixed(2)
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
                        //Inserir Proteção CA
                        //Cercamento
                        var parCerEqu = parseFloat(detalhe.valorCer) / parseFloat(detalhe.vlrTotal) * 100
                        projeto.parCerEqu = parseFloat(parCerEqu).toFixed(2)
                        //Central
                        var parCenEqu = parseFloat(detalhe.valorCen) / parseFloat(detalhe.vlrTotal) * 100
                        projeto.parCenEqu = parseFloat(parCenEqu).toFixed(2)
                        //Postes de Condução
                        var parPosEqu = parseFloat(detalhe.valorPos) / parseFloat(detalhe.vlrTotal) * 100
                        projeto.parPosEqu = parseFloat(parPosEqu).toFixed(2)

                        projeto.save().then(() => {

                            sucesso.push({ texto: 'Custo de gerenciamento aplicado com sucesso.' })

                            Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {

                                Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                                    res.render('projeto/gerenciamento/editgerenciamento', { sucesso: sucesso, projeto: projeto, cliente: cliente })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Nenhum cliente encontrado.')
                                    res.redirect('/cliente/consulta')
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
                        req.flash('error_msg', 'Houve um erro ao encontrar o regime.')
                        res.redirect('/configuracao/consulta')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro ao encontrar as configurações.')
                    res.redirect('/configuracao/consulta')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao encontrar os detalhes.')
                res.redirect('/menu')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao encontrar o projeto.')
            res.redirect('/projeto/consulta')
        })
    }
})

router.post('/tributos/', ehAdmin, (req, res) => {
    const { _id } = req.user
    var erros = []
    var ehSimples = false
    var ehLP = false
    var ehLR = false

    Projeto.findOne({ _id: projeto_id }).then((projeto) => {

        //Inserir calculo dos impostos
        Regime.findOne({ _id: projeto.regime }).lean().then((regime) => {

            if (parseFloat(projeto.trbint) == 0 || projeto.trbint == null) {
                erros.push({ texto: 'Realizar ao menos um custo de instalação.' })
            }
            if (parseFloat(projeto.trbpro) == 0 || projeto.trbpro == null) {
                erros.push({ texto: 'Realizar ao menos um custo de projetista.' })
            }

            if (parseFloat(projeto.trbges) == 0 || projeto.trbges == null) {
                erros.push({ texto: 'Realizar ao menos um custos de gestão.' })
            }

            if (parseFloat(projeto.custoTotal) == 0 || projeto.custoTotal == null) {
                erros.push({ texto: 'Aplicar os custos na aba de gerenciamemnto.' })
            }

            if (erros.length > 0) {

                res.render('projeto/gerenciamento/tributos', { projeto: projeto, regime: regime, erros: erros })

            } else {

                projeto_id = projeto._id

                var prjFat = regime.prjFat
                var prjLR = regime.prjLR
                var prjLP = regime.prjLP
                //var vlrDAS = regime.vlrDAS

                var impostoIRPJ = 0
                var impostoIRPJAdd = 0
                var impostoCSLL = 0
                var impostoPIS = 0
                var impostoCOFINS = 0
                var impostoICMS = 0
                var totalImposto = 0
                var totalTributos = 0

                var fatadd
                var fataju
                var aux

                //Validar calculos dos impostos
                if (regime.regime == 'Simples') {
                    //console.log('Regime=>Simples')
                    var alqEfe = ((parseFloat(prjFat) * (parseFloat(regime.alqDAS) / 100)) - (parseFloat(regime.vlrred))) / parseFloat(prjFat)
                    var totalSimples = parseFloat(projeto.vlrNFS) * (parseFloat(alqEfe))
                    totalImposto = parseFloat(totalSimples).toFixed(2)
                    projeto.impostoSimples = parseFloat(totalImposto).toFixed(2)
                } else {
                    if (regime.regime == 'Lucro Real') {
                        //console.log('lucro real')
                        if ((parseFloat(prjLR) / 12) > 20000) {
                            //console.log('prjLR=>' + prjLR)
                            fatadd = (parseFloat(prjLR) / 12) - 20000
                            //console.log('fatadd=>' + fatadd)
                            fataju = parseFloat(fatadd) * (parseFloat(regime.alqIRPJAdd) / 100)
                            //console.log('fataju=>' + fataju)
                            aux = parseFloat(fatadd) / parseFloat(projeto.lbaimp)
                            //console.log('aux=>' + aux)
                            impostoIRPJAdd = parseFloat(fataju) / parseFloat(aux)
                            //console.log('impostoIRPJAdd=>' + impostoIRPJAdd)
                            projeto.impostoAdd = impostoIRPJAdd.toFixed(2)
                        } else {
                            impostoIRPJAdd = 0
                            projeto.impostoAdd = 0
                        }

                        impostoIRPJ = parseFloat(projeto.lbaimp) * (parseFloat(regime.alqIRPJ) / 100)
                        projeto.impostoIRPJ = impostoIRPJ.toFixed(2)
                        //console.log('impostoIRPJ=>' + impostoIRPJ)
                        impostoCSLL = parseFloat(projeto.lbaimp) * (parseFloat(regime.alqCSLL) / 100)
                        projeto.impostoCSLL = impostoCSLL.toFixed(2)
                        //console.log('impostoCSLL=>' + impostoCSLL)
                        impostoPIS = parseFloat(projeto.vlrNFS) * 0.5 * (parseFloat(regime.alqPIS) / 100)
                        projeto.impostoPIS = impostoPIS.toFixed(2)
                        //console.log('impostoPIS=>' + impostoPIS)
                        impostoCOFINS = parseFloat(projeto.vlrNFS) * 0.5 * (parseFloat(regime.alqCOFINS) / 100)
                        projeto.impostoCOFINS = impostoCOFINS.toFixed(2)
                        //console.log('impostoCOFINS=>' + impostoCOFINS)
                        totalImposto = parseFloat(impostoIRPJ) + parseFloat(impostoIRPJAdd) + parseFloat(impostoCSLL) + parseFloat(impostoPIS) + parseFloat(impostoCOFINS)

                    } else {

                        if (((parseFloat(prjLP) * 0.32) / 3) > 20000) {
                            fatadd = ((parseFloat(prjLP) * 0.32) / 3) - 20000
                            fataju = parseFloat(fatadd) / 20000
                            impostoIRPJAdd = (parseFloat(projeto.vlrNFS) * 0.32) * parseFloat(fataju).toFixed(2) * (parseFloat(regime.alqIRPJAdd) / 100)
                            projeto.impostoAdd = impostoIRPJAdd.toFixed(2)
                        } else {
                            impostoIRPJAdd = 0
                            projeto.impostoAdd = 0
                        }

                        impostoIRPJ = parseFloat(projeto.vlrNFS) * 0.32 * (parseFloat(regime.alqIRPJ) / 100)
                        projeto.impostoIRPJ = impostoIRPJ.toFixed(2)
                        impostoCSLL = parseFloat(projeto.vlrNFS) * 0.32 * (parseFloat(regime.alqCSLL) / 100)
                        projeto.impostoCSLL = impostoCSLL.toFixed(2)
                        impostoCOFINS = parseFloat(projeto.vlrNFS) * (parseFloat(regime.alqCOFINS) / 100)
                        projeto.impostoCOFINS = impostoCOFINS.toFixed(2)
                        impostoPIS = parseFloat(projeto.vlrNFS) * (parseFloat(regime.alqPIS) / 100)
                        projeto.impostoPIS = impostoPIS.toFixed(2)
                        totalImposto = parseFloat(impostoIRPJ) + parseFloat(impostoIRPJAdd) + parseFloat(impostoCSLL) + parseFloat(impostoPIS) + parseFloat(impostoCOFINS)
                    }
                }

                //console.log('impNFS=>'+impNFS)
                //console.log('impostoICMS=>'+impostoICMS)

                //Validar ICMS
                if (projeto.fatequ == true) {
                    if (regime.alqICMS != null) {
                        impostoICMS = parseFloat(projeto.vlrkit) * (1 - (parseFloat(regime.alqICMS) / 100)) * (parseFloat(regime.alqICMS) / 100)
                        totalTributos = parseFloat(totalImposto) + parseFloat(projeto.impNFS) + parseFloat(impostoICMS)
                        totalImposto = parseFloat(totalImposto) + parseFloat(impostoICMS)
                    }
                } else {
                    impostoICMS = 0
                    totalTributos = parseFloat(totalImposto) + parseFloat(projeto.impNFS)
                }
                projeto.impostoICMS = impostoICMS.toFixed(2)
                //console.log('totalImposto=>' + totalImposto)
                projeto.totalImposto = parseFloat(totalImposto).toFixed(2)
                //console.log('totalTributos=>' + totalTributos)
                projeto.totalTributos = parseFloat(totalTributos).toFixed(2)

                //Lucro Líquido descontados os impostos
                var lucroLiquido = 0
                lucroLiquido = parseFloat(projeto.lbaimp) - parseFloat(totalImposto)
                projeto.lucroLiquido = parseFloat(lucroLiquido).toFixed(2)

                //Dashboard
                //Participação sobre o lucro total
                //console.log('projeto.vlrNFS=>' + projeto.vlrNFS)
                //console.log('lucroLiquido=>' + lucroLiquido)
                //console.log('projeto.valor=>' + projeto.valor)

                var parLiqVlr = parseFloat(lucroLiquido) / parseFloat(projeto.valor) * 100
                projeto.parLiqVlr = parLiqVlr.toFixed(2)
                //console.log('parLiqVlr=>' + parLiqVlr)
                var parKitVlr = parseFloat(projeto.vlrkit) / parseFloat(projeto.valor) * 100
                projeto.parKitVlr = parKitVlr.toFixed(2)
                //console.log('parKitVlr=>' + parKitVlr)
                var parIntVlr = parseFloat(projeto.totint) / parseFloat(projeto.valor) * 100
                projeto.parIntVlr = parIntVlr.toFixed(2)
                //console.log('parIntVlr=>' + parIntVlr)
                var parGesVlr = parseFloat(projeto.totges) / parseFloat(projeto.valor) * 100
                projeto.parGesVlr = parGesVlr.toFixed(2)
                //console.log('parGesVlr=>' + parGesVlr)
                var parProVlr = parseFloat(projeto.totpro) / parseFloat(projeto.valor) * 100
                projeto.parProVlr = parProVlr.toFixed(2)
                //console.log('parProVlr=>' + parProVlr)
                var parArtVlr = parseFloat(projeto.vlrart) / parseFloat(projeto.valor) * 100
                projeto.parArtVlr = parArtVlr.toFixed(2)
                //console.log('parArtVlr=>' + parArtVlr)
                if (parseFloat(projeto.totcmb) > 0) {
                    var parCmbVlr = parseFloat(projeto.totcmb) / parseFloat(projeto.valor) * 100
                    projeto.parCmbVlr = parseFloat(parCmbVlr).toFixed(2)
                    //console.log('parCmbVlr=>' + parCmbVlr)
                }
                if (parseFloat(projeto.totali) > 0) {
                    var parAliVlr = parseFloat(projeto.totali) / parseFloat(projeto.valor) * 100
                    projeto.parAliVlr = parseFloat(parAliVlr).toFixed(2)
                    //console.log('parAliVlr=>' + parAliVlr)
                }
                if (parseFloat(projeto.tothtl) > 0) {
                    var parEstVlr = parseFloat(projeto.tothtl) / parseFloat(projeto.valor) * 100
                    projeto.parEstVlr = parEstVlr.toFixed(2)
                    //console.log('parEstVlr=>' + parEstVlr)
                }
                if (parseFloat(projeto.reserva) > 0) {
                    var parResVlr = parseFloat(projeto.reserva) / parseFloat(projeto.valor) * 100
                    projeto.parResVlr = parseFloat(parResVlr).toFixed(2)
                    //console.log('parResVlr=>' + parResVlr)
                }
                var parDedVlr = parseFloat(projeto.custoPlano) / parseFloat(projeto.valor) * 100
                projeto.parDedVlr = parDedVlr.toFixed(2)
                //console.log('parDedVlr=>' + parDedVlr)
                var parISSVlr = parseFloat(projeto.impNFS) / parseFloat(projeto.valor) * 100
                projeto.parISSVlr = parISSVlr.toFixed(2)
                //console.log('parISSVlr=>' + parISSVlr)
                var parImpVlr = (parseFloat(totalImposto) / parseFloat(projeto.valor)) * 100
                projeto.parImpVlr = parImpVlr.toFixed(2)
                //console.log('parImpVlr=>' + parImpVlr)
                if (projeto.vlrcom > 0) {
                    var parComVlr = parseFloat(projeto.vlrcom) / parseFloat(projeto.valor) * 100
                    projeto.parComVlr = parComVlr.toFixed(2)
                    //console.log('parComVlr=>' + parComVlr)
                }

                //Participação sobre o Faturamento      
                var parLiqNfs = parseFloat(lucroLiquido) / parseFloat(projeto.vlrNFS) * 100
                projeto.parLiqNfs = parseFloat(parLiqNfs).toFixed(2)
                //console.log('parLiqNfs=>' + parLiqNfs)
                if (projeto.fatequ == true) {
                    var parKitNfs = parseFloat(projeto.vlrkit) / parseFloat(projeto.vlrNFS) * 100
                    projeto.parKitNfs = parseFloat(parKitNfs).toFixed(2)
                    //console.log('parKitNfs=>' + parKitNfs)
                }
                var parIntNfs = parseFloat(projeto.totint) / parseFloat(projeto.vlrNFS) * 100
                projeto.parIntNfs = parseFloat(parIntNfs).toFixed(2)
                //console.log('parIntNfs=>' + parIntNfs)
                var parGesNfs = parseFloat(projeto.totges) / parseFloat(projeto.vlrNFS) * 100
                projeto.parGesNfs = parseFloat(parGesNfs).toFixed(2)
                //console.log('parGesNfs=>' + parGesNfs)
                var parProNfs = parseFloat(projeto.totpro) / parseFloat(projeto.vlrNFS) * 100
                projeto.parProNfs = parseFloat(parProNfs).toFixed(2)
                //console.log('parProNfs=>' + parProNfs)
                var parArtNfs = parseFloat(projeto.vlrart) / parseFloat(projeto.vlrNFS) * 100
                projeto.parArtNfs = parseFloat(parArtNfs).toFixed(2)
                //console.log('parArtNfs=>' + parArtNfs)
                if (parseFloat(projeto.totcmb) > 0) {
                    var parCmbNfs = parseFloat(projeto.totcmb) / parseFloat(projeto.vlrNFS) * 100
                    projeto.parCmbNfs = parseFloat(parCmbNfs).toFixed(2)
                    //console.log('parCmbNfs=>' + parEstNfs)
                }
                if (parseFloat(projeto.totali) > 0) {
                    var parAliNfs = parseFloat(projeto.totali) / parseFloat(projeto.vlrNFS) * 100
                    projeto.parAliNfs = parseFloat(parAliNfs).toFixed(2)
                    //console.log('parAliNfs=>' + parAliNfs)
                }
                if (parseFloat(projeto.tothtl) > 0) {
                    var parEstNfs = parseFloat(projeto.tothtl) / parseFloat(projeto.vlrNFS) * 100
                    projeto.parEstNfs = parEstNfs.toFixed(2)
                    //console.log('parEstNfs=>' + parEstNfs)

                }
                if (parseFloat(projeto.reserva) > 0) {
                    var parResNfs = parseFloat(projeto.reserva) / parseFloat(projeto.vlrNFS) * 100
                    projeto.parResNfs = parseFloat(parResNfs).toFixed(2)
                    //console.log('parResNfs=>' + parResNfs)
                }
                var parDedNfs = parseFloat(projeto.custoPlano) / parseFloat(projeto.vlrNFS) * 100
                projeto.parDedNfs = parseFloat(parDedNfs).toFixed(2)
                //console.log('parDedNfs=>' + parDedNfs)
                var parISSNfs = parseFloat(projeto.impNFS) / parseFloat(projeto.vlrNFS) * 100
                projeto.parISSNfs = parseFloat(parISSNfs).toFixed(2)
                //console.log('parISSNfs=>' + parISSNfs)
                var parImpNfs = (parseFloat(totalImposto) / parseFloat(projeto.vlrNFS)) * 100
                projeto.parImpNfs = parseFloat(parImpNfs).toFixed(2)
                //console.log('parImpNfs=>' + parImpNfs)
                if (projeto.vlrcom > 0) {
                    var parComNfs = parseFloat(projeto.vlrcom) / parseFloat(projeto.vlrNFS) * 100
                    projeto.parComNfs = parseFloat(parComNfs).toFixed(2)
                    //console.log('parComNfs=>' + parComNfs)
                }

                projeto.save().then(() => {
                    var sucesso = []
                    sucesso.push({ texto: 'Projeto criado com sucesso.' })

                    Projeto.findOne({ _id: projeto_id }).lean().then((projeto) => {

                        Regime.findOne({ _id: projeto.regime }).lean().then((regime) => {
                            switch (regime.regime) {
                                case "Simples": ehSimples = true
                                    break;
                                case "Lucro Presumido": ehLP = true
                                    break;
                                case "Lucro Real": ehLR = true
                                    break;
                            }
                            var sucesso = []

                            sucesso.push({ texto: 'Projeto salvo com sucesso.' })
                            Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                                res.render('projeto/gerenciamento/tributos', { sucesso: sucesso, projeto: projeto, regime: regime, ehSimples: ehSimples, ehLP: ehLP, ehLR: ehLR, cliente: cliente })
                            }).catch((err) => {
                                req.flash('error_msg', 'Nenhum cliente encontrado.')
                                res.redirect('/cliente/consulta')
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Nenhum regime encontrado.')
                            res.redirect('/gerencimento/consultaregime')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Nenhum projeto encontrado.')
                        res.redirect('/projeto/consulta')
                    })
                }).catch(() => {
                    req.flash('error_msg', 'Houve um erro ao criar o projeto.')
                    res.redirect('/menu')
                })
            }
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível encontrar o regime.')
            res.redirect('/configuracao/consultaregime')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar o projeto.')
        res.redirect('/projeto/consulta')
    })
})

router.post('/editar/tributos/', ehAdmin, (req, res) => {
    const { _id } = req.user
    var ehSimples = false
    var ehLP = false
    var ehLR = false
    Projeto.findOne({ _id: projeto_id }).then((projeto) => {

        //Inserir calculo dos impostos
        Regime.findOne({ _id: projeto.regime }).then((regime) => {

            projeto_id = projeto._id

            var prjFat = regime.prjFat
            var prjLR = regime.prjLR
            var prjLP = regime.prjLP
            //var vlrDAS = regime.vlrDAS
            //console.log('prjFat=>'+prjFat)
            //console.log('prjLR=>'+prjLR)
            //console.log('prjLP=>'+prjLP)

            var impostoIRPJ = 0
            var impostoIRPJAdd = 0
            var impostoCSLL = 0
            var impostoPIS = 0
            var impostoCOFINS = 0
            var impostoICMS = 0
            var totalImposto = 0
            var totalTributos = 0

            var fatadd
            var fataju
            var aux

            //console.log('projeto.vlrNFS=>' + projeto.vlrNFS)

            if (regime.regime == 'Simples') {
                //console.log('Regime=>Simples')
                var alqEfe = ((parseFloat(prjFat) * (parseFloat(regime.alqDAS) / 100)) - (parseFloat(regime.vlrred))) / parseFloat(prjFat)
                var totalSimples = parseFloat(projeto.vlrNFS) * (parseFloat(alqEfe))
                totalImposto = parseFloat(totalSimples).toFixed(2)
                projeto.impostoSimples = parseFloat(totalImposto).toFixed(2)
            } else {
                if (regime.regime == 'Lucro Real') {
                    if ((parseFloat(prjLR) / 12) > 20000) {
                        fatadd = (parseFloat(prjLR) / 12) - 20000
                        //console.log('fatadd=>' + fatadd)
                        fataju = parseFloat(fatadd) * (parseFloat(regime.alqIRPJAdd) / 100)
                        //console.log('fataju=>' + fataju)
                        aux = parseFloat(fatadd) / parseFloat(projeto.lbaimp)
                        //console.log('aux=>' + aux)
                        impostoIRPJAdd = parseFloat(fataju) / parseFloat(aux)
                        projeto.impostoAdd = impostoIRPJAdd.toFixed(2)
                    } else {
                        impostoIRPJAdd = 0
                        projeto.impostoAdd = 0
                    }

                    impostoIRPJ = parseFloat(projeto.lbaimp) * (parseFloat(regime.alqIRPJ) / 100)
                    projeto.impostoIRPJ = impostoIRPJ.toFixed(2)
                    impostoCSLL = parseFloat(projeto.lbaimp) * (parseFloat(regime.alqCSLL) / 100)
                    projeto.impostoCSLL = impostoCSLL.toFixed(2)
                    impostoPIS = parseFloat(projeto.vlrNFS) * 0.5 * (parseFloat(regime.alqPIS) / 100)
                    projeto.impostoPIS = impostoPIS.toFixed(2)
                    impostoCOFINS = parseFloat(projeto.vlrNFS) * 0.5 * (parseFloat(regime.alqCOFINS) / 100)
                    projeto.impostoCOFINS = impostoCOFINS.toFixed(2)
                    totalImposto = parseFloat(impostoIRPJ) + parseFloat(impostoIRPJAdd) + parseFloat(impostoCSLL) + parseFloat(impostoPIS) + parseFloat(impostoCOFINS)
                } else {
                    //console.log('Regime=>Lucro Presumido')
                    if (((parseFloat(prjLP) * 0.32) / 3) > 20000) {
                        fatadd = ((parseFloat(prjLP) * 0.32) / 3) - 20000
                        fataju = parseFloat(fatadd) / 20000
                        impostoIRPJAdd = (parseFloat(projeto.vlrNFS) * 0.32) * (parseFloat(fataju) / 100) * (parseFloat(regime.alqIRPJAdd) / 100)
                        projeto.impostoAdd = impostoIRPJAdd.toFixed(2)
                    } else {
                        impostoIRPJAdd = 0
                        projeto.impostoAdd = 0
                    }
                    //console.log('impostoIRPJAdd=>' + impostoIRPJAdd)
                    impostoIRPJ = parseFloat(projeto.vlrNFS) * 0.32 * (parseFloat(regime.alqIRPJ) / 100)
                    projeto.impostoIRPJ = impostoIRPJ.toFixed(2)
                    //console.log('impostoIRPJ=>' + impostoIRPJ)
                    impostoCSLL = parseFloat(projeto.vlrNFS) * 0.32 * (parseFloat(regime.alqCSLL) / 100)
                    projeto.impostoCSLL = impostoCSLL.toFixed(2)
                    //console.log('impostoCSLL=>' + impostoCSLL)
                    impostoCOFINS = parseFloat(projeto.vlrNFS) * (parseFloat(regime.alqCOFINS) / 100)
                    projeto.impostoCOFINS = impostoCOFINS.toFixed(2)
                    //console.log('impostoCOFINS=>' + impostoCOFINS)
                    impostoPIS = parseFloat(projeto.vlrNFS) * (parseFloat(regime.alqPIS) / 100)
                    projeto.impostoPIS = impostoPIS.toFixed(2)
                    //console.log('impostoPIS=>' + impostoPIS)
                    totalImposto = parseFloat(impostoIRPJ) + parseFloat(impostoIRPJAdd) + parseFloat(impostoCSLL) + parseFloat(impostoPIS) + parseFloat(impostoCOFINS)
                    //console.log('totalImposto=>' + totalImposto)
                }
            }
            //Validar ICMS
            if (projeto.fatequ == true) {
                if (regime.alqICMS != null) {
                    impostoICMS = parseFloat(projeto.vlrkit) * (1 - (parseFloat(regime.alqICMS) / 100)) * (parseFloat(regime.alqICMS) / 100)
                    totalTributos = parseFloat(totalImposto) + parseFloat(projeto.impNFS) + parseFloat(impostoICMS)
                    totalImposto = parseFloat(totalImposto) + parseFloat(impostoICMS)
                }
            } else {
                impostoICMS = 0
                totalTributos = parseFloat(totalImposto) + parseFloat(projeto.impNFS)
            }
            projeto.impostoICMS = impostoICMS.toFixed(2)
            //console.log('totalImposto=>' + totalImposto)
            projeto.totalImposto = parseFloat(totalImposto).toFixed(2)
            //console.log('totalTributos=>' + totalTributos)
            projeto.totalTributos = parseFloat(totalTributos).toFixed(2)

            //Lucro Líquido descontados os impostos
            var lucroLiquido = 0
            lucroLiquido = parseFloat(projeto.lbaimp) - parseFloat(totalImposto)
            projeto.lucroLiquido = parseFloat(lucroLiquido).toFixed(2)

            //Dashboard
            //Participação sobre o lucro total
            var parLiqVlr = parseFloat(lucroLiquido) / parseFloat(projeto.valor) * 100
            projeto.parLiqVlr = parLiqVlr.toFixed(2)
            var parKitVlr = parseFloat(projeto.vlrkit) / parseFloat(projeto.valor) * 100
            projeto.parKitVlr = parKitVlr.toFixed(2)
            var parIntVlr = parseFloat(projeto.totint) / parseFloat(projeto.valor) * 100
            projeto.parIntVlr = parIntVlr.toFixed(2)
            var parGesVlr = parseFloat(projeto.totges) / parseFloat(projeto.valor) * 100
            projeto.parGesVlr = parGesVlr.toFixed(2)
            var parProVlr = parseFloat(projeto.totpro) / parseFloat(projeto.valor) * 100
            projeto.parProVlr = parProVlr.toFixed(2)
            var parArtVlr = parseFloat(projeto.vlrart) / parseFloat(projeto.valor) * 100
            projeto.parArtVlr = parArtVlr.toFixed(2)
            if (parseFloat(projeto.totcmb) > 0) {
                var parCmbVlr = parseFloat(projeto.totcmb) / parseFloat(projeto.valor) * 100
                projeto.parCmbVlr = parseFloat(parCmbVlr).toFixed(2)
            }
            if (parseFloat(projeto.totali) > 0) {
                var parAliVlr = parseFloat(projeto.totali) / parseFloat(projeto.valor) * 100
                projeto.parAliVlr = parseFloat(parAliVlr).toFixed(2)
            }
            if (parseFloat(projeto.tothtl) > 0) {
                var parEstVlr = parseFloat(projeto.tothtl) / parseFloat(projeto.valor) * 100
                projeto.parEstVlr = parEstVlr.toFixed(2)
            }
            if (parseFloat(projeto.reserva) > 0) {
                var parResVlr = parseFloat(projeto.reserva) / parseFloat(projeto.valor) * 100
                projeto.parResVlr = parseFloat(parResVlr).toFixed(2)
            }
            var parDedVlr = parseFloat(projeto.custoPlano) / parseFloat(projeto.valor) * 100
            projeto.parDedVlr = parDedVlr.toFixed(2)
            var parISSVlr = parseFloat(projeto.impNFS) / parseFloat(projeto.valor) * 100
            projeto.parISSVlr = parISSVlr.toFixed(2)
            var parImpVlr = (parseFloat(totalImposto) / parseFloat(projeto.valor)) * 100
            projeto.parImpVlr = parImpVlr.toFixed(2)
            if (projeto.vlrcom > 0) {
                var parComVlr = parseFloat(projeto.vlrcom) / parseFloat(projeto.valor) * 100
                projeto.parComVlr = parComVlr.toFixed(2)
            }

            //Participação sobre o Faturamento      
            var parLiqNfs = parseFloat(lucroLiquido) / parseFloat(projeto.vlrNFS) * 100
            projeto.parLiqNfs = parseFloat(parLiqNfs).toFixed(2)
            if (projeto.fatequ == true) {
                var parKitNfs = parseFloat(projeto.vlrkit) / parseFloat(projeto.vlrNFS) * 100
                projeto.parKitNfs = parseFloat(parKitNfs).toFixed(2)
            }
            var parIntNfs = parseFloat(projeto.totint) / parseFloat(projeto.vlrNFS) * 100
            projeto.parIntNfs = parseFloat(parIntNfs).toFixed(2)
            var parGesNfs = parseFloat(projeto.totges) / parseFloat(projeto.vlrNFS) * 100
            projeto.parGesNfs = parseFloat(parGesNfs).toFixed(2)
            var parProNfs = parseFloat(projeto.totpro) / parseFloat(projeto.vlrNFS) * 100
            projeto.parProNfs = parseFloat(parProNfs).toFixed(2)
            var parArtNfs = parseFloat(projeto.vlrart) / parseFloat(projeto.vlrNFS) * 100
            projeto.parArtNfs = parseFloat(parArtNfs).toFixed(2)
            if (parseFloat(projeto.totcmb) > 0) {
                var parCmbNfs = parseFloat(projeto.totcmb) / parseFloat(projeto.vlrNFS) * 100
                projeto.parCmbNfs = parseFloat(parCmbNfs).toFixed(2)
            }
            if (parseFloat(projeto.totali) > 0) {
                var parAliNfs = parseFloat(projeto.totali) / parseFloat(projeto.vlrNFS) * 100
                projeto.parAliNfs = parseFloat(parAliNfs).toFixed(2)
            }
            if (parseFloat(projeto.tothtl) > 0) {
                var parEstNfs = parseFloat(projeto.tothtl) / parseFloat(projeto.vlrNFS) * 100
                projeto.parEstNfs = parEstNfs.toFixed(2)
            }
            if (parseFloat(projeto.reserva) > 0) {
                var parResNfs = parseFloat(projeto.reserva) / parseFloat(projeto.vlrNFS) * 100
                projeto.parResNfs = parseFloat(parResNfs).toFixed(2)
            }
            var parDedNfs = parseFloat(projeto.custoPlano) / parseFloat(projeto.vlrNFS) * 100
            projeto.parDedNfs = parseFloat(parDedNfs).toFixed(2)
            var parISSNfs = parseFloat(projeto.impNFS) / parseFloat(projeto.vlrNFS) * 100
            projeto.parISSNfs = parseFloat(parISSNfs).toFixed(2)
            var parImpNfs = (parseFloat(totalImposto) / parseFloat(projeto.vlrNFS)) * 100
            projeto.parImpNfs = parseFloat(parImpNfs).toFixed(2)
            if (projeto.vlrcom > 0) {
                var parComNfs = parseFloat(projeto.vlrcom) / parseFloat(projeto.vlrNFS) * 100
                projeto.parComNfs = parseFloat(parComNfs).toFixed(2)
            }

            projeto.save().then(() => {
                var sucesso = []
                sucesso.push({ texto: 'Projeto criado com sucesso.' })

                Projeto.findOne({ _id: projeto_id }).lean().then((projeto) => {

                    Regime.findOne({ _id: projeto.regime }).lean().then((regime) => {
                        switch (regime.regime) {
                            case "Simples": ehSimples = true
                                break;
                            case "Lucro Presumido": ehLP = true
                                break;
                            case "Lucro Real": ehLR = true
                                break;
                        }

                        var sucesso = []

                        sucesso.push({ texto: 'Projeto salvo com sucesso.' })
                        Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                            res.render('projeto/gerenciamento/edittributos', { sucesso: sucesso, projeto: projeto, regime: regime, ehSimples: ehSimples, ehLP: ehLP, ehLR: ehLR, cliente: cliente })
                        }).catch((err) => {
                            req.flash('error_msg', 'Nenhum cliente encontrado.')
                            res.redirect('/cliente/consulta')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Nenhum regime encontrado.')
                        res.redirect('/menu')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Nenhum projeto encontrado.')
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
    })
})

module.exports = router