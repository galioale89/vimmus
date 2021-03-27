const express = require('express')
const router = express.Router()
const chart = require('chart')

require('../app')
require('../model/Regime')

const mongoose = require('mongoose')
const Projeto = mongoose.model('projeto')
const Configuracao = mongoose.model('configuracao')
const Regime = mongoose.model('regime')
const Realizado = mongoose.model('realizado')
const Pessoa = mongoose.model('pessoa')

const { ehAdmin } = require('../helpers/ehAdmin')

global.projeto_id
var rp
var p

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
            req.flash('error_msg', 'Falha interna')
            res.redirect('/projeto/consulta')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar o projeto realizado')
        res.redirect('/projeto/consulta')
    })
})

router.get('/dashboardrealliquido/:id', ehAdmin, (req, res) => {

    Realizado.findOne({ _id: req.params.id }).lean().then((realizado) => {

        Projeto.findOne({ _id: realizado.projeto }).lean().then((projeto) => {

            res.render('projeto/gerenciamento/dashboardrealliquido', { projeto: projeto, realizado: realizado })

        }).catch((err) => {
            req.flash('error_msg', 'Falha interna')
            res.redirect('/projeto/consulta')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar o projeto realizado')
        res.redirect('/projeto/consulta')
    })
})

router.get('/:id', ehAdmin, (req, res) => {

    Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
        projeto_id = projeto._id
        res.render('projeto/gerenciamento/gerenciamento', { projeto: projeto })

    }).catch((err) => {

        req.flash('error_msg', 'Houve uma flaha ao buscar o projeto.')
        res.redirect('/projeto')
    })

})

router.get('/tributos/:id', ehAdmin, (req, res) => {

    Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {

        projeto_id = projeto._id

        Regime.findOne({ _id: projeto.regime }).lean().then((regime) => {
            res.render('projeto/gerenciamento/tributos', { projeto: projeto, regime: regime })
        })
    }).catch((err) => {
        req.flash('error_msg', 'Nenhum projeto encontrado')
        res.redirect('/')
    })
})

router.get('/editar/tributos/:id', ehAdmin, (req, res) => {
    var ehSimples = false
    var ehLP = false
    var ehLR = false
    Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {

        projeto_id = projeto._id

        Regime.findOne({ _id: projeto.regime }).lean().then((regime) => {
            switch (regime.regime){
                case "Simples": ehSimples = true 
                break;
                case "Lucro Presumido": ehLP = true
                break;
                case "Lucro Real": ehLR = true
                break;
            }
            res.render('projeto/gerenciamento/edittributos', { projeto: projeto, regime: regime, ehSimples:ehSimples, ehLP:ehLP, ehLR:ehLR })
        }).catch((err) => {
            req.flash('error_msg', 'Houve uma falha ao encontrar o regime')
            res.redirect('/configuracao/consulta')
        })

    }).catch((err) => {
        req.flash('error_msg', 'Houve uma falha ao encontrar o projeto')
        res.redirect('/projeto/consulta')
    })
})

router.get('/editar/gerenciamento/:id', ehAdmin, (req, res) => {
    Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
        projeto_id = projeto._id

        res.render('projeto/gerenciamento/editgerenciamento', { projeto: projeto })

    }).catch((err) => {
        req.flash('error_msg', 'Houve uma falha ao encontrar o projeto')
        res.redirect('/projeto/consulta')
    })
})

router.post('/', ehAdmin, (req, res) => {

    var erros = []

    if (req.body.equipe == '') {
        erros.push({ texto: 'Prencheer valor de equipe de instalação de no mínimo 1 integrante' })
    }
    //Valida campos já salvos
    Projeto.findOne({ _id: req.body.id }).then((projeto) => {
        if (parseFloat(projeto.trbint) == 0 || projeto.trbint == null) {
            erros.push({ texto: 'Realizar ao menos um custo de instalação' })
        }
        if (parseFloat(projeto.trbpro) == 0 || projeto.trbpro == null) {
            erros.push({ texto: 'Realizar ao menos um custo de projetista' })
        }
        if (parseFloat(projeto.trbges) == 0 || projeto.trbges == null) {
            erros.push({ texto: 'Realizar ao menos um custos de gestão' })
        }
    })

    if (erros.length > 0) {

        Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {

            Regime.find().lean().then((regime) => {

                res.render('projeto/gerenciamento/gerenciamento', { erros: erros, projeto: projeto, regime: regime })

            }).catch((err) => {
                req.flash('error_msg', 'Hove uma falha interna')
                res.redirect('/configuracao/consultaregime')
            })

        }).catch((err) => {
            req.flash('error_msg', 'Hove uma falha interna')
            res.redirect('/projeto/consulta')
        })

    } else {

        Projeto.findOne({ _id: req.body.id }).then((projeto) => {

            var sucesso = []

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
                var equipe = req.body.equipe
                projeto.equipe = equipe
                var hrsequ = parseFloat(equipe) * 8
                var diastr = Math.round(parseFloat(projeto.trbint) / parseFloat(hrsequ))
                projeto.diastr = diastr

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

                var tothtl
                var totcmb
                var totali
                //Definindo custo hotel
                if (parseFloat(vlrdia) > 0) {
                    tothtl = parseFloat(vlrdia) * parseFloat(diastr)
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

                var rescon = parseFloat(impele) + parseFloat(seguro) + parseFloat(outcer) + parseFloat(outpos)
                rescon = parseFloat(rescon) + parseFloat(conadd)
                projeto.rescon = rescon.toFixed(2)
                var reserva = parseFloat(resger) + parseFloat(rescon)
                projeto.reserva = reserva.toFixed(2)

                //Validando a comissão
                var vlrcom
                if (projeto.percom != null) {
                    vlrcom = parseFloat(projeto.valor) * (parseFloat(projeto.percom) / 100)
                    projeto.vlrcom = vlrcom.toFixed(2)
                } else {

                    vlrcom = 0
                }

                var totcop = parseFloat(projeto.totint) + parseFloat(projeto.totpro) + parseFloat(projeto.totges) + parseFloat(totdes)
                projeto.totcop = totcop.toFixed(2)

                var custoPlano = parseFloat(totcop) + parseFloat(reserva)
                projeto.custoPlano = custoPlano.toFixed(2)

                custoTotal = parseFloat(custoPlano) + parseFloat(projeto.vlrequ)
                projeto.custoTotal = custoTotal.toFixed(2)

                //Lucro Bruto
                var lucroBruto = parseFloat(projeto.valor) - parseFloat(custoTotal)
                projeto.lucroBruto = lucroBruto.toFixed(2)

                //Comissão e Lucro Antes dos Impostos
                if (vlrcom == 0) {
                    lbaimp = parseFloat(lucroBruto)
                } else {
                    lbaimp = parseFloat(lucroBruto) - parseFloat(vlrcom)
                }
                projeto.lbaimp = lbaimp.toFixed(2)


                projeto.save().then(() => {

                    sucesso.push({ texto: 'Custo de gerenciamento aplicado com sucesso' })

                    Projeto.findOne({ _id: projeto_id }).lean().then((projeto) => {

                        projeto_id = projeto._id

                        Regime.find().lean().then((regime) => {

                            res.render('projeto/gerenciamento/gerenciamento', { sucesso: sucesso, projeto: projeto, regime: regime })

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
                req.flash('error_msg', 'Houve um erro ao encontrar as configurações')
                res.redirect('/configuracao/consulta')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao encontrar o projeto')
            res.redirect('/projeto/consulta')
        })
    }
})

router.post('/tributos/', ehAdmin, (req, res) => {

    var erros = []
    var ehSimples = false
    var ehLP = false
    var ehLR = false

    Projeto.findOne({ _id: projeto_id }).then((projeto) => {

        //Inserir calculo dos impostos
        Regime.findOne({ _id: projeto.regime }).lean().then((regime) => {

            if (parseFloat(projeto.trbint) == 0 || projeto.trbint == null) {
                erros.push({ texto: 'Realizar ao menos um custo de instalação' })
            }
            if (parseFloat(projeto.trbpro) == 0 || projeto.trbpro == null) {
                erros.push({ texto: 'Realizar ao menos um custo de projetista' })
            }

            if (parseFloat(projeto.trbges) == 0 || projeto.trbges == null) {
                erros.push({ texto: 'Realizar ao menos um custos de gestão' })
            }

            if (parseFloat(projeto.custoTotal) == 0 || projeto.custoTotal == null) {
                erros.push({ texto: 'Aplicar os custos na aba de gerenciamemnto' })
            }

            if (erros.length > 0) {

                res.render('projeto/gerenciamento/tributos', { projeto: projeto, regime: regime, erros: erros })

            } else {

                projeto_id = projeto._id

                var prjFat = regime.prjFat
                var prjLR = regime.prjLR
                var prjLP = regime.prjLP
                var vlrDAS = regime.vlrDAS

                var impostoIRPJ = 0
                var impostoIRPJAdd = 0
                var impostoCSLL = 0
                var impostoPIS = 0
                var impostoCOFINS = 0
                var impostoICMS = 0
                var totalImposto = 0

                var fatadd
                var fataju

                var totalImpGrafico = 0

                //Validar calculos dos impostos
                var vlrNFS = parseFloat(projeto.valor) - parseFloat(projeto.vlrequ)
                var impNFS = parseFloat(vlrNFS) * (parseFloat(regime.alqNFS) / 100)
                projeto.vlrNFS = vlrNFS
                projeto.impNFS = impNFS

                if (regime.alqICMS != null) {
                    impostoICMS = parseFloat(projeto.vlrequ) * (parseFloat(regime.alqICMS) / 100)
                    projeto.impostoICMS = impostoICMS.toFixed(2)
                }

                if (regime.regime == 'Simples') {
                    var alqEfe = ((parseFloat(prjFat) * (parseFloat(regime.alqDAS) / 100)) - (parseFloat(regime.vlrred))) / parseFloat(prjFat)
                    var totalSimples = parseFloat(vlrNFS) * (parseFloat(alqEfe))
                    totalImpGrafico = totalSimples.toFixed(2)
                    projeto.impostoSimples = totalImpGrafico.toFixed(2)
                } else {
                    if (regime.regime == 'Lucro Real') {
                        projeto.impostoIRPJ = parseFloat(projeto.lbaimp) * parseFloat(regime.alqIRPJ)

                        if ((parseFloat(prjLR) / 12) > 20000) {
                            fatadd = (parseFloat(prjLR) / 12) - 20000
                            fataju = parseFloat(fatadd) / 20000
                            impostoIRPJAdd = parseFloat(projeto.lbaimp) * parseFloat(fataju).toFixed(2) * (parseFloat(regime.alqIRPJAdd) / 100)
                            projeto.impostoAdd = impostoIRPJAdd.toFixed(2)
                        }

                        impostoIRPJ = parseFloat(projeto.lbaimp) * (parseFloat(regime.alqIRPJ) / 100)
                        projeto.impostoIRPJ = impostoIRPJ.toFixed(2)

                        impostoCSLL = parseFloat(projeto.lbaimp) * (parseFloat(regime.alqCSLL) / 100)
                        projeto.impostoCSLL = impostoCSLL.toFixed(2)
                        impostoPIS = parseFloat(vlrNFS) * 0.5 * (parseFloat(regime.alqPIS) / 100)
                        projeto.impostoPIS = impostoPIS.toFixed(2)
                        impostoCOFINS = parseFloat(vlrNFS) * 0.5 * (parseFloat(regime.alqCOFINS) / 100)
                        projeto.impostoCOFINS = impostoCOFINS.toFixed(2)
                        totalImposto = parseFloat(impostoIRPJ) + parseFloat(impostoIRPJAdd) + parseFloat(impostoCSLL) + parseFloat(impostoPIS) + parseFloat(impostoCOFINS)
                        totalImpGrafico = totalImposto.toFixed(2)

                    } else {

                        if (((parseFloat(prjLP) * 0.32) / 3) > 20000) {
                            fatadd = ((parseFloat(prjLP) * 0.32) / 3) - 20000
                            fataju = parseFloat(fatadd) / 20000
                            impostoIRPJAdd = (parseFloat(vlrNFS) * 0.32) * parseFloat(fataju).toFixed(2) * (parseFloat(regime.alqIRPJAdd) / 100)
                            projeto.impostoAdd = impostoIRPJAdd.toFixed(2)
                        }

                        impostoIRPJ = parseFloat(vlrNFS) * 0.32 * (parseFloat(regime.alqIRPJ) / 100)
                        projeto.impostoIRPJ = impostoIRPJ.toFixed(2)
                        impostoCSLL = parseFloat(vlrNFS) * 0.32 * (parseFloat(regime.alqCSLL) / 100)
                        projeto.impostoCSLL = impostoCSLL.toFixed(2)
                        impostoCOFINS = parseFloat(vlrNFS) * (parseFloat(regime.alqCOFINS) / 100)
                        projeto.impostoCOFINS = impostoCOFINS.toFixed(2)
                        impostoPIS = parseFloat(vlrNFS) * (parseFloat(regime.alqPIS) / 100)
                        projeto.impostoPIS = impostoPIS.toFixed(2)
                        totalImposto = parseFloat(impostoIRPJ) + parseFloat(impostoIRPJAdd) + parseFloat(impostoCSLL) + parseFloat(impostoPIS) + parseFloat(impostoCOFINS)
                        totalImpGrafico = totalImposto.toFixed(2)
                    }
                }

                if (impostoICMS > 0) {
                    totalImposto = parseFloat(totalImpGrafico) + parseFloat(impNFS) + parseFloat(impostoICMS)
                } else {
                    totalImposto = parseFloat(totalImpGrafico) + parseFloat(impNFS)
                }

                //projeto.totalImposto = totalImposto
                projeto.totalImposto = totalImposto.toFixed(2)

                var lucroLiquido = parseFloat(projeto.lbaimp) - parseFloat(totalImposto)
                projeto.lucroLiquido = lucroLiquido.toFixed(2)

                //Dashboard
                //Participação sobre o lucro total
                var parLiqVlr = parseFloat(lucroLiquido) / parseFloat(projeto.valor) * 100
                projeto.parLiqVlr = parLiqVlr.toFixed(2)
                var parEquVlr = parseFloat(projeto.vlrequ) / parseFloat(projeto.valor) * 100
                projeto.parEquVlr = parEquVlr.toFixed(2)
                var parIntVlr = parseFloat(projeto.totint) / parseFloat(projeto.valor) * 100
                projeto.parIntVlr = parIntVlr.toFixed(2)
                var parGesVlr = parseFloat(projeto.totges) / parseFloat(projeto.valor) * 100
                projeto.parGesVlr = parGesVlr.toFixed(2)
                var parProVlr = parseFloat(projeto.totpro) / parseFloat(projeto.valor) * 100
                projeto.parProVlr = parProVlr.toFixed(2)
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
                var parISSVlr = parseFloat(impNFS) / parseFloat(projeto.valor) * 100
                projeto.parISSVlr = parISSVlr.toFixed(2)
                var parImpVlr = parseFloat(totalImpGrafico) / parseFloat(projeto.valor) * 100
                projeto.parImpVlr = parImpVlr.toFixed(2)
                if (projeto.vlrcom > 0) {
                    var parComVlr = parseFloat(projeto.vlrcom) / parseFloat(projeto.valor) * 100
                    projeto.parComVlr = parComVlr.toFixed(2)
                }

                //Participação sobre o Faturamento      
                var parLiqNfs = parseFloat(lucroLiquido) / parseFloat(vlrNFS) * 100
                projeto.parLiqNfs = parseFloat(parLiqNfs).toFixed(2)
                var parIntNfs = parseFloat(projeto.totint) / parseFloat(vlrNFS) * 100
                projeto.parIntNfs = parseFloat(parIntNfs).toFixed(2)
                var parGesNfs = parseFloat(projeto.totges) / parseFloat(vlrNFS) * 100
                projeto.parGesNfs = parseFloat(parGesNfs).toFixed(2)
                var parProNfs = parseFloat(projeto.totpro) / parseFloat(vlrNFS) * 100
                projeto.parProNfs = parseFloat(parProNfs).toFixed(2)
                if (parseFloat(projeto.totcmb) > 0) {
                    var parCmbNfs = parseFloat(projeto.totcmb) / parseFloat(vlrNFS) * 100
                    projeto.parCmbNfs = parseFloat(parCmbNfs).toFixed(2)
                }
                if (parseFloat(projeto.totali) > 0) {
                    var parAliNfs = parseFloat(projeto.totali) / parseFloat(vlrNFS) * 100
                    projeto.parAliNfs = parseFloat(parAliNfs).toFixed(2)
                }
                if (parseFloat(projeto.tothtl) > 0) {
                    var parEstNfs = parseFloat(projeto.tothtl) / parseFloat(vlrNFS) * 100
                    projeto.parEstNfs = parEstNfs.toFixed(2)
                }
                if (parseFloat(projeto.reserva) > 0) {
                    var parResNfs = parseFloat(projeto.reserva) / parseFloat(vlrNFS) * 100
                    projeto.parResNfs = parseFloat(parResNfs).toFixed(2)
                }
                var parDedNfs = parseFloat(projeto.custoPlano) / parseFloat(vlrNFS) * 100
                projeto.parDedNfs = parseFloat(parDedNfs).toFixed(2)
                var parISSNfs = parseFloat(impNFS) / parseFloat(vlrNFS) * 100
                projeto.parISSNfs = parseFloat(parISSNfs).toFixed(2)
                var parImpNfs = parseFloat(totalImpGrafico) / parseFloat(vlrNFS) * 100
                projeto.parImpNfs = parseFloat(parImpNfs).toFixed(2)
                if (projeto.vlrcom > 0) {
                    var parComNfs = parseFloat(projeto.vlrcom) / parseFloat(vlrNFS) * 100
                    projeto.parComNfs = parseFloat(parComNfs).toFixed(2)
                }

                projeto.save().then(() => {
                    var sucesso = []
                    sucesso.push({ texto: 'Projeto criado com sucesso' })

                    Projeto.findOne({ _id: projeto_id }).lean().then((projeto) => {

                        Regime.findOne({ _id: projeto.regime }).lean().then((regime) => {
                                switch (regime.regime){
                                    case "Simples": ehSimples = true 
                                    break;
                                    case "Lucro Presumido": ehLP = true
                                    break;
                                    case "Lucro Real": ehLR = true
                                    break;
                                }
                            var sucesso = []

                            projeto_id = projeto._id

                            sucesso.push({ texto: 'Projeto salvo com sucesso' })
                            res.render('projeto/gerenciamento/tributos', { projeto: projeto, sucesso: sucesso, regime: regime, ehSimples:ehSimples, ehLP:ehLP, ehLR: ehLR })
                        }).catch((err) => {
                            req.flash('error_msg', 'Nenhum regime encontrado')
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
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível encontrar o regime')
            res.redirect('/configuracao/consultaregime')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar o projeto')
        res.redirect('/projeto/consulta')
    })
})

router.post('/editar/tributos/', ehAdmin, (req, res) => {

    Projeto.findOne({ _id: projeto_id }).then((projeto) => {

        //Inserir calculo dos impostos
        Regime.findOne({ _id: projeto.regime }).then((regime) => {

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

            var fatadd
            var fataju

            var totalImpGrafico = 0

            //Validar calculos dos impostos
            var vlrNFS = parseFloat(projeto.valor) - parseFloat(projeto.vlrequ)
            var impNFS = parseFloat(vlrNFS) * (parseFloat(regime.alqNFS) / 100)
            projeto.vlrNFS = vlrNFS.toFixed(2)
            projeto.impNFS = impNFS.toFixed(2)

            if (regime.alqICMS != null) {
                impostoICMS = parseFloat(projeto.vlrequ) * (parseFloat(regime.alqICMS) / 100)
                projeto.impostoICMS = impostoICMS.toFixed(2)
            }

            if (regime.regime == 'Simples') {
                var alqEfe = ((parseFloat(prjFat) * (parseFloat(regime.alqDAS) / 100)) - (parseFloat(regime.vlrred))) / parseFloat(prjFat)
                var totalSimples = parseFloat(vlrNFS) * (parseFloat(alqEfe))
                totalImpGrafico = totalSimples
                projeto.impostoSimples = totalImpGrafico.toFixed(2)
            } else {
                if (regime.regime == 'Lucro Real') {
                    projeto.impostoIRPJ = parseFloat(projeto.lbaimp) * parseFloat(regime.alqIRPJ)

                    if ((parseFloat(prjLR) / 12) > 20000) {
                        fatadd = (parseFloat(prjLR) / 12) - 20000
                        fataju = parseFloat(fatadd) / 20000
                        impostoIRPJAdd = parseFloat(projeto.lbaimp) * parseFloat(fataju).toFixed(2) * (parseFloat(regime.alqIRPJAdd) / 100)
                        projeto.impostoAdd = impostoIRPJAdd.toFixed(2)
                    }

                    impostoIRPJ = parseFloat(projeto.lbaimp) * (parseFloat(regime.alqIRPJ) / 100)
                    projeto.impostoIRPJ = impostoIRPJ.toFixed(2)

                    impostoCSLL = parseFloat(projeto.lbaimp) * (parseFloat(regime.alqCSLL) / 100)
                    projeto.impostoCSLL = impostoCSLL.toFixed(2)
                    impostoPIS = parseFloat(vlrNFS) * 0.5 * (parseFloat(regime.alqPIS) / 100)
                    projeto.impostoPIS = impostoPIS.toFixed(2)
                    impostoCOFINS = parseFloat(vlrNFS) * 0.5 * (parseFloat(regime.alqCOFINS) / 100)
                    projeto.impostoCOFINS = impostoCOFINS.toFixed(2)
                    totalImposto = parseFloat(impostoIRPJ) + parseFloat(impostoIRPJAdd) + parseFloat(impostoCSLL) + parseFloat(impostoPIS) + parseFloat(impostoCOFINS)
                    totalImpGrafico = totalImposto.toFixed(2)

                } else {

                    if (((parseFloat(prjLP) * 0.32) / 3) > 20000) {
                        fatadd = ((parseFloat(prjLP) * 0.32) / 3) - 20000
                        fataju = parseFloat(fatadd) / 20000
                        impostoIRPJAdd = (parseFloat(vlrNFS) * 0.32) * parseFloat(fataju) * (parseFloat(regime.alqIRPJAdd) / 100)
                        projeto.impostoAdd = impostoIRPJAdd.toFixed(2)
                    }

                    impostoIRPJ = parseFloat(vlrNFS) * 0.32 * (parseFloat(regime.alqIRPJ) / 100)
                    projeto.impostoIRPJ = impostoIRPJ.toFixed(2)
                    impostoCSLL = parseFloat(vlrNFS) * 0.32 * (parseFloat(regime.alqCSLL) / 100)
                    projeto.impostoCSLL = impostoCSLL.toFixed(2)
                    impostoCOFINS = parseFloat(vlrNFS) * (parseFloat(regime.alqCOFINS) / 100)
                    projeto.impostoCOFINS = impostoCOFINS.toFixed(2)
                    impostoPIS = parseFloat(vlrNFS) * (parseFloat(regime.alqPIS) / 100)
                    projeto.impostoPIS = impostoPIS.toFixed(2)
                    totalImposto = parseFloat(impostoIRPJ) + parseFloat(impostoIRPJAdd) + parseFloat(impostoCSLL) + parseFloat(impostoPIS) + parseFloat(impostoCOFINS)
                    totalImpGrafico = totalImposto.toFixed(2)
                }
            }

            if (impostoICMS > 0) {
                totalImposto = parseFloat(totalImpGrafico) + parseFloat(impNFS) + parseFloat(impostoICMS)
            } else {
                totalImposto = parseFloat(totalImpGrafico) + parseFloat(impNFS)
            }

            //Lucro Líquido descontados os impostos
            projeto.totalImposto = totalImposto.toFixed(2)

            var lucroLiquido = parseFloat(projeto.lbaimp) - parseFloat(totalImposto)
            projeto.lucroLiquido = lucroLiquido.toFixed(2)

            //Dashboard
            //Participação sobre o lucro total
            var parLiqVlr = parseFloat(lucroLiquido) / parseFloat(projeto.valor) * 100
            projeto.parLiqVlr = parLiqVlr.toFixed(2)
            var parEquVlr = parseFloat(projeto.vlrequ) / parseFloat(projeto.valor) * 100
            projeto.parEquVlr = parEquVlr.toFixed(2)
            var parIntVlr = parseFloat(projeto.totint) / parseFloat(projeto.valor) * 100
            projeto.parIntVlr = parIntVlr.toFixed(2)
            var parGesVlr = parseFloat(projeto.totges) / parseFloat(projeto.valor) * 100
            projeto.parGesVlr = parGesVlr.toFixed(2)
            var parProVlr = parseFloat(projeto.totpro) / parseFloat(projeto.valor) * 100
            projeto.parProVlr = parProVlr.toFixed(2)
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
            var parISSVlr = parseFloat(impNFS) / parseFloat(projeto.valor) * 100
            projeto.parISSVlr = parISSVlr.toFixed(2)
            var parImpVlr = parseFloat(totalImpGrafico) / parseFloat(projeto.valor) * 100
            projeto.parImpVlr = parImpVlr.toFixed(2)
            if (projeto.vlrcom > 0) {
                var parComVlr = parseFloat(projeto.vlrcom) / parseFloat(projeto.valor) * 100
                projeto.parComVlr = parComVlr.toFixed(2)
            }

            //Participação sobre o Faturamento      
            var parLiqNfs = parseFloat(lucroLiquido) / parseFloat(vlrNFS) * 100
            projeto.parLiqNfs = parseFloat(parLiqNfs).toFixed(2)
            var parIntNfs = parseFloat(projeto.totint) / parseFloat(vlrNFS) * 100
            projeto.parIntNfs = parseFloat(parIntNfs).toFixed(2)
            var parGesNfs = parseFloat(projeto.totges) / parseFloat(vlrNFS) * 100
            projeto.parGesNfs = parseFloat(parGesNfs).toFixed(2)
            var parProNfs = parseFloat(projeto.totpro) / parseFloat(vlrNFS) * 100
            projeto.parProNfs = parseFloat(parProNfs).toFixed(2)
            if (parseFloat(projeto.totcmb) > 0) {
                var parCmbNfs = parseFloat(projeto.totcmb) / parseFloat(vlrNFS) * 100
                projeto.parCmbNfs = parseFloat(parCmbNfs).toFixed(2)
            }
            if (parseFloat(projeto.totali) > 0) {
                var parAliNfs = parseFloat(projeto.totali) / parseFloat(vlrNFS) * 100
                projeto.parAliNfs = parseFloat(parAliNfs).toFixed(2)
            }
            if (parseFloat(projeto.tothtl) > 0) {
                var parEstNfs = parseFloat(projeto.tothtl) / parseFloat(vlrNFS) * 100
                projeto.parEstNfs = parEstNfs.toFixed(2)
            }
            if (parseFloat(projeto.reserva) > 0) {
                var parResNfs = parseFloat(projeto.reserva) / parseFloat(vlrNFS) * 100
                projeto.parResNfs = parseFloat(parResNfs).toFixed(2)
            }
            var parDedNfs = parseFloat(projeto.custoPlano) / parseFloat(vlrNFS) * 100
            projeto.parDedNfs = parseFloat(parDedNfs).toFixed(2)
            var parISSNfs = parseFloat(impNFS) / parseFloat(vlrNFS) * 100
            projeto.parISSNfs = parseFloat(parISSNfs).toFixed(2)
            var parImpNfs = parseFloat(totalImpGrafico) / parseFloat(vlrNFS) * 100
            projeto.parImpNfs = parseFloat(parImpNfs).toFixed(2)
            if (projeto.vlrcom > 0) {
                var parComNfs = parseFloat(projeto.vlrcom) / parseFloat(vlrNFS) * 100
                projeto.parComNfs = parseFloat(parComNfs).toFixed(2)
            }

            projeto.save().then(() => {
                var sucesso = []
                sucesso.push({ texto: 'Projeto criado com sucesso' })

                Projeto.findOne({ _id: projeto_id }).lean().then((projeto) => {

                    Regime.findOne({ _id: projeto.regime }).lean().then((regime) => {

                        var sucesso = []

                        projeto_id = projeto._id

                        sucesso.push({ texto: 'Projeto salvo com sucesso' })
                        res.render('projeto/gerenciamento/edittributos', { projeto: projeto, sucesso: sucesso, regime: regime })

                    }).catch((err) => {
                        req.flash('error_msg', 'Nenhum regime encontrado')
                        res.redirect('/')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Nenhum projeto encontrado')
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
    })
})

router.post('/editar/gerenciamento/', ehAdmin, (req, res) => {

    var erros = []

    if (req.body.equipe == '') {
        erros.push({ texto: 'Prencheer valor de equipe de instalação de no mínimo 1 integrante' })
    }

    //Valida total dos custos já salvos para aplicar as informações de gerenciamento
    Projeto.findOne({ _id: req.body.id }).then((projeto) => {
        if (parseFloat(projeto.trbint) == 0 || projeto.trbint == null) {
            erros.push({ texto: 'Realizar ao menos um custo de instalação' })
        }
        if (parseFloat(projeto.trbpro) == 0 || projeto.trbpro == null) {
            erros.push({ texto: 'Realizar ao menos um custo de projetista' })
        }
        if (parseFloat(projeto.trbges) == 0 || projeto.trbges == null) {
            erros.push({ texto: 'Realizar ao menos um custos de gestão' })
        }
    })

    if (erros.length > 0) {

        Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {

            Regime.find().lean().then((regime) => {

                res.render('projeto/gerenciamento/editgerenciamento', { erros: erros, projeto: projeto, regime: regime })

            }).catch((err) => {
                req.flash('error_msg', 'Hove uma falha interna')
                res.redirect('/configuracao/consultaregime')
            })

        }).catch((err) => {
            req.flash('error_msg', 'Hove uma falha interna')
            res.redirect('/projeto/consulta')
        })

    } else {

        Projeto.findOne({ _id: req.body.id }).then((projeto) => {

            var sucesso = []

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
                var equipe = req.body.equipe
                projeto.equipe = equipe
                var hrsequ = parseFloat(equipe) * 8
                var diastr = Math.round(parseFloat(projeto.trbint) / parseFloat(hrsequ))
                projeto.diastr = diastr

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

                var tothtl
                var totcmb
                var totali
                //Definindo custo hotel
                if (parseFloat(vlrdia) > 0) {
                    tothtl = parseFloat(vlrdia) * parseFloat(diastr)
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

                var rescon = parseFloat(impele) + parseFloat(seguro) + parseFloat(outcer) + parseFloat(outpos)
                rescon = parseFloat(rescon) + parseFloat(conadd)
                projeto.rescon = rescon.toFixed(2)
                var reserva = parseFloat(resger) + parseFloat(rescon)
                projeto.reserva = reserva.toFixed(2)

                //Validando a comissão
                var vlrcom
                if (projeto.percom != null) {
                    vlrcom = parseFloat(projeto.valor) * (parseFloat(projeto.percom) / 100)
                    projeto.vlrcom = vlrcom.toFixed(2)
                } else {
                    vlrcom = 0
                }

                var totcop = parseFloat(projeto.totint) + parseFloat(projeto.totpro) + parseFloat(projeto.totges) + parseFloat(totdes)
                projeto.totcop = totcop.toFixed(2)

                var custoPlano = parseFloat(totcop) + parseFloat(reserva)
                projeto.custoPlano = custoPlano.toFixed(2)

                custoTotal = parseFloat(custoPlano) + parseFloat(projeto.vlrequ)
                projeto.custoTotal = custoTotal.toFixed(2)

                //Lucro Bruto
                var lucroBruto = parseFloat(projeto.valor) - parseFloat(custoTotal)
                projeto.lucroBruto = lucroBruto.toFixed(2)

                //Comissão e Lucro Antes dos Impostos
                var lbaimp
                if (vlrcom == 0) {
                    lbaimp = lucroBruto.toFixed(2)
                } else {
                    lbaimp = parseFloat(lucroBruto) - parseFloat(vlrcom)
                }
                projeto.lbaimp = lbaimp.toFixed(2)


                projeto.save().then(() => {

                    sucesso.push({ texto: 'Custo de gerenciamento aplicado com sucesso' })

                    Projeto.findOne({ _id: projeto_id }).lean().then((projeto) => {

                        projeto_id = projeto._id

                        Regime.find().lean().then((regime) => {

                            res.render('projeto/gerenciamento/editgerenciamento', { sucesso: sucesso, projeto: projeto, regime: regime })

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
                req.flash('error_msg', 'Houve um erro ao encontrar as configurações')
                res.redirect('/configuracao')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao encontrar o projeto')
            res.redirect('/projeto/consulta')
        })
    }
})

module.exports = router