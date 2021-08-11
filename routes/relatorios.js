const express = require('express')
const router = express.Router()

const mongoose = require('mongoose')
require('../model/Realizado')
require('../model/Projeto')
const Projetos = mongoose.model('projeto')
const Realizado = mongoose.model('realizado')

const { ehAdmin } = require('../helpers/ehAdmin')

router.get('/analisegeral/', ehAdmin, (req, res) => {
    const { _id } = req.user
    var potencia = 0
    var valor = 0
    var totint = 0
    var qtdmod = 0
    var custoPlano = 0
    var q = 0
    Realizado.find({ user: _id }).sort({ datafim: 'asc' }).lean().then((realizado) => {
        realizado.forEach((element) => {
            Projetos.findOne({ _id: element.projeto }).then((projeto) => {
                if (projeto.ehDireto) {
                    if (projeto.qtdmod > 0) {
                        qtdmod = qtdmod + projeto.qtdmod
                    } else {
                        qtdmod = qtdmod + 0
                    }
                } else {
                    qtdmod = qtdmod + projeto.unimod
                }
                potencia = parseFloat(potencia) + parseFloat(element.potencia)
                valor = valor + element.valor
                totint = totint + element.totint
                custoPlano = custoPlano + element.custoPlano

                q = q + 1
                if (q == realizado.length) {
                    var rspmod = (parseFloat(valor) / parseFloat(qtdmod)).toFixed(2)
                    var rspkwp = (parseFloat(valor) / parseFloat(potencia)).toFixed(2)
                    var rsimod = (parseFloat(totint) / parseFloat(qtdmod)).toFixed(2)
                    var rsikwp = (parseFloat(totint) / parseFloat(potencia)).toFixed(2)
                    var custoPorModulo = (parseFloat(custoPlano) / parseFloat(qtdmod)).toFixed(2)
                    var custoPorKwp = (parseFloat(custoPlano) / parseFloat(potencia)).toFixed(2)
                    res.render('relatorios/analisegeral', { potencia, qtdmod, valor, rspkwp, rspmod, rsimod, rsikwp, custoPorModulo,custoPorKwp })
                }
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro para encontrar projetos realizados')
                res.redirect('/menu')
            })
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro para encontrar projetos realizados')
        res.redirect('/menu')
    })
})

router.get('/listarealizados', ehAdmin, (req, res) => {
    const { _id } = req.user
    Realizado.find({ user: _id }).sort({ datafim: 'asc' }).lean().then((realizado) => {
        //Definindo data e hora da emissão do relatório
        var data = new Date()
        var dia = parseFloat(data.getDate())
        if (dia < 10) {
            dia = '0' + dia
        }
        var mes = parseFloat(data.getMonth()) + 1
        if (mes < 10) {
            mes = '0' + mes
        }
        var ano = data.getFullYear()
        var dataemissao = dia + '/' + mes + '/' + ano
        var hora_emissao = data.getHours()
        var min_emissao = data.getMinutes()
        if (min_emissao < 10) {
            min_emissao = '0' + min_emissao
        }
        var tempo = hora_emissao + ':' + min_emissao
        //Definindo nome do usuário
        const { nome } = req.user
        var nome_usuario = nome
        //Definindo número total de projeto
        var qtdprj = realizado.length

        var soma_valor = 0
        var soma_vlrnfs = 0
        var soma_lbaimp = 0
        var soma_custo = 0
        var soma_lb = 0
        var soma_ll = 0
        var soma_tributos = 0

        for (i = 0; i < realizado.length; i++) {
            const { valor } = realizado[i]
            const { vlrNFS } = realizado[i]
            const { custoPlano } = realizado[i]
            const { lbaimp } = realizado[i]
            const { lucroBruto } = realizado[i]
            const { lucroLiquido } = realizado[i]
            const { totalImposto } = realizado[i]
            soma_valor = parseFloat(soma_valor) + parseFloat(valor)
            soma_valor = soma_valor.toFixed(2)
            soma_vlrnfs = parseFloat(soma_vlrnfs) + parseFloat(vlrNFS)
            soma_vlrnfs = soma_vlrnfs.toFixed(2)
            soma_custo = parseFloat(soma_custo) + parseFloat(custoPlano)
            soma_custo = soma_custo.toFixed(2)
            soma_lbaimp = parseFloat(soma_lbaimp) + parseFloat(lbaimp)
            soma_lbaimp = soma_lbaimp.toFixed(2)
            soma_lb = parseFloat(soma_lb) + parseFloat(lucroBruto)
            soma_lb = soma_lb.toFixed(2)
            soma_ll = parseFloat(soma_ll) + parseFloat(lucroLiquido)
            soma_ll = soma_ll.toFixed(2)
            soma_tributos = parseFloat(soma_tributos) + parseFloat(totalImposto)
            soma_tributos = soma_tributos.toFixed(2)
        }
        var perMedCusto
        var perMedLL
        var perMedTrb
        perMedCusto = ((parseFloat(soma_custo) / parseFloat(soma_vlrnfs)) * 100).toFixed(2)
        perMedLL = (parseFloat(soma_ll) / parseFloat(soma_vlrnfs) * 100).toFixed(2)
        perMedTrb = (parseFloat(soma_tributos) / parseFloat(soma_vlrnfs) * 100).toFixed(2)

        res.render('relatorios/listarealizados', { realizado: realizado, dataemissao: dataemissao, nome_usuario: nome_usuario, tempo: tempo, qtdprj: qtdprj, soma_valor: soma_valor, soma_vlrnfs: soma_vlrnfs, soma_custo: soma_custo, soma_lbaimp: soma_lbaimp, soma_lb: soma_lb, soma_ll: soma_ll, soma_tributos: soma_tributos, perMedLL: perMedLL, perMedTrb: perMedTrb, perMedCusto: perMedCusto })

    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro para encontrar projetos realizados')
        res.redirect('/menu')
    })
})

router.get('/listarabertos', ehAdmin, (req, res) => {
    const { _id } = req.user
    Projetos.find({ user: _id, foiRealizado: false }).sort({ dataprev: 'desc' }).lean().then((projetos) => {
        //Definindo data e hora da emissão do relatório
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
        var dataemissao = dia + '/' + mes + '/' + ano
        var hora_emissao = data.getHours()
        var min_emissao = data.getMinutes()
        if (min_emissao < 10) {
            min_emissao = '0' + min_emissao
        }
        var tempo = hora_emissao + ':' + min_emissao
        //Definindo nome do usuário
        const { nome } = req.user
        var nome_usuario = nome
        //Definindo número total de projeto
        var qtdprj = projetos.length

        var soma_valor = 0
        var soma_vlrnfs = 0
        var soma_custo = 0
        var soma_lbaimp = 0
        var soma_lb = 0
        var soma_ll = 0
        var soma_tributos = 0
        for (i = 0; i < projetos.length; i++) {
            const { valor } = projetos[i]
            //console.log('valor=>'+valor)
            const { vlrNFS } = projetos[i]
            //console.log('valor=>'+vlrNFS)
            const { custoPlano } = projetos[i]
            //console.log('custoPlano=>'+custoPlano)
            const { lbaimp } = projetos[i]
            //console.log('lucroBruto=>'+lucroBruto)            
            const { lucroBruto } = projetos[i]
            //console.log('lucroBruto=>'+lucroBruto)
            const { lucroLiquido } = projetos[i]
            //console.log('lucroLiquido=>'+lucroLiquido)
            const { totalImposto } = projetos[i]
            //console.log('totalImposto=>'+totalImposto)
            soma_valor = parseFloat(soma_valor) + parseFloat(valor)
            soma_valor = soma_valor.toFixed(2)
            soma_vlrnfs = parseFloat(soma_vlrnfs) + parseFloat(vlrNFS)
            soma_vlrnfs = soma_vlrnfs.toFixed(2)
            soma_custo = parseFloat(soma_custo) + parseFloat(custoPlano)
            soma_custo = soma_custo.toFixed(2)
            soma_lbaimp = parseFloat(soma_lbaimp) + parseFloat(lbaimp)
            soma_lbaimp = soma_lbaimp.toFixed(2)
            soma_lb = parseFloat(soma_lb) + parseFloat(lucroBruto)
            soma_lb = soma_lb.toFixed(2)
            soma_ll = parseFloat(soma_ll) + parseFloat(lucroLiquido)
            soma_ll = soma_ll.toFixed(2)
            soma_tributos = parseFloat(soma_tributos) + parseFloat(totalImposto)
            soma_tributos = soma_tributos.toFixed(2)
            /*
            //console.log('soma_valor=>'+soma_valor)
            //console.log('soma_vlrnfs=>'+soma_vlrnfs)
            //console.log('soma_custo=>'+soma_custo)
            //console.log('soma_lb=>'+soma_lb)
            //console.log('soma_ll=>'+soma_ll)
            //console.log('soma_tributos=>'+soma_tributos)
            */
        }
        var perMedCusto
        var perMedLL
        var perMedTrb
        perMedCusto = ((parseFloat(soma_custo) / parseFloat(soma_vlrnfs)) * 100).toFixed(2)
        perMedLL = (parseFloat(soma_ll) / parseFloat(soma_vlrnfs) * 100).toFixed(2)
        perMedTrb = (parseFloat(soma_tributos) / parseFloat(soma_vlrnfs) * 100).toFixed(2)

        res.render('relatorios/listarabertos', { projetos: projetos, dataemissao: dataemissao, nome_usuario: nome_usuario, tempo: tempo, qtdprj: qtdprj, soma_valor: soma_valor, soma_vlrnfs: soma_vlrnfs, soma_custo: soma_custo, soma_lb: soma_lb, soma_lbaimp: soma_lbaimp, soma_ll: soma_ll, soma_tributos: soma_tributos, perMedCusto: perMedCusto, perMedLL: perMedLL, perMedTrb: perMedTrb })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro para encontrar projetos realizados')
        res.redirect('/menu')
    })
})

router.get('/dashboardcustos', ehAdmin, (req, res) => {
    const { _id } = req.user

    var soma_kitfat = 0
    var soma_serfat = 0
    var soma_totfat = 0

    var soma_totcop = 0
    var soma_totkit = 0
    var soma_totprj = 0
    var soma_totliq = 0
    var soma_totser = 0

    var soma_totkwp = 0
    var soma_equkwp = 0
    var soma_varkwp = 0
    var soma_estkwp = 0

    //Custos Fixos
    var soma_custoFix = 0
    //Serviço
    var soma_totint = 0
    var soma_totpro = 0
    var soma_totges = 0
    var soma_totart = 0
    //Despesas Administrativas
    var soma_totadm = 0
    //Comissões
    var soma_totcom = 0
    //Tributos
    var soma_tottrb = 0
    //Custos Variáveis
    var soma_varfat = 0
    var soma_custoVar = 0
    var soma_totdes = 0
    var soma_totali = 0
    var soma_totcmb = 0
    var soma_tothtl = 0
    //Custos Variáveis Estruturais
    var soma_estfat = 0
    var soma_custoEst = 0
    var soma_totcer = 0
    var soma_totcen = 0
    var soma_totpos = 0

    //Custos Fixos
    var medkwp_custoFix = 0
    //Serviço
    var medkwp_totint = 0
    var medkwp_totpro = 0
    var medkwp_totges = 0
    var medkwp_totart = 0
    //Despesas Administrativas
    var medkwp_totadm = 0
    //Comissões
    var medkwp_totcom = 0
    //Tributos
    var medkwp_tottrb = 0
    //Despesas Variáveis
    var medkwp_totdes = 0
    var medkwp_totali = 0
    var medkwp_tothtl = 0
    var medkwp_totcmb = 0
    var medkwp_custoVar = 0
    var medkwp_varfat = 0
    //Despesas Variáveis Estruturais
    var medkwp_custoEst = 0
    var medkwp_totcer = 0
    var medkwp_totcen = 0
    var medkwp_totpos = 0

    var per_totliq
    var per_dispendio
    var per_kitfat
    var per_comfat
    var per_cusfat
    var per_desfat
    var per_trbfat

    //Percentuais Componentes
    var soma_modequ = 0
    var soma_invequ = 0
    var soma_estequ = 0
    var soma_cabequ = 0
    var soma_dpsequ = 0
    var soma_disequ = 0
    var soma_sbxequ = 0
    var soma_ocpequ = 0

    var soma_totequ = 0
    var per_modequ = 0
    var per_invequ = 0
    var per_estequ = 0
    var per_cabequ = 0
    var per_dpsequ = 0
    var per_disequ = 0
    var per_sbxequ = 0
    var per_ocpequ = 0
    var med_modequ = 0
    var med_invequ = 0
    var med_estequ = 0
    var med_cabequ = 0
    var med_dpsequ = 0
    var med_disequ = 0
    var med_sbxequ = 0
    var med_ocpequ = 0
    var med_totequ = 0

    //----------------------------------------
    //Média ponderada da participação 
    //----------------------------------------
    var soma_totfat_com = 0
    var soma_totfat_sem = 0

    var soma_totcop_com = 0
    var soma_totcop_sem = 0
    var soma_totkit_com = 0

    var soma_totkwp_com = 0
    var soma_totkwp_sem = 0
    var soma_varkwp_com = 0
    var soma_varkwp_sem = 0
    var soma_estkwp_com = 0
    var soma_estkwp_sem = 0

    //Custos Fixos
    var soma_totcus_com = 0
    var soma_totcus_sem = 0
    //Serviço
    var soma_totint_com = 0
    var soma_totint_sem = 0
    var soma_totpro_com = 0
    var soma_totpro_sem = 0
    var soma_totges_com = 0
    var soma_totges_sem = 0
    var soma_totart_com = 0
    var soma_totart_sem = 0
    //Despesas Administrativas
    var soma_totadm_com = 0
    var soma_totadm_sem = 0
    //Comissões
    var soma_totcom_com = 0
    var soma_totcom_sem = 0
    //Tributos
    var soma_tottrb_com = 0
    var soma_tottrb_sem = 0
    //Custos Variáveis
    var soma_totvar_com = 0
    var soma_totvar_sem = 0
    var soma_varfat_com = 0
    var soma_varfat_sem = 0
    var soma_totdes_com = 0
    var soma_totdes_sem = 0
    var soma_totali_com = 0
    var soma_totali_sem = 0
    var soma_totcmb_com = 0
    var soma_totcmb_sem = 0
    var soma_tothtl_com = 0
    var soma_tothtl_sem = 0
    //Custos Variáveis Estruturais
    var soma_totest_com = 0
    var soma_totest_sem = 0
    var soma_estfat_com = 0
    var soma_estfat_sem = 0
    var soma_totcer_com = 0
    var soma_totcer_sem = 0
    var soma_totcen_com = 0
    var soma_totcen_sem = 0
    var soma_totpos_com = 0
    var soma_totpos_sem = 0
    //----------------------------------------
    var ticketkwp = 0


    Realizado.find({ user: _id }).lean().then((realizado) => {
        var numprj = realizado.length

        for (i = 0; i < realizado.length; i++) {

            const { potencia } = realizado[i]
            const { fatequ } = realizado[i]
            const { vlrkit } = realizado[i]
            const { valor } = realizado[i]
            const { vlrNFS } = realizado[i]
            const { custoPlano } = realizado[i]
            const { lucroLiquido } = realizado[i]

            //Custos Fixos
            const { custofix } = realizado[i]
            //Serviços
            const { totpro } = realizado[i]
            const { totges } = realizado[i]
            const { totint } = realizado[i]
            const { vlrart } = realizado[i]
            //Administrativo
            const { desAdm } = realizado[i]
            //Comissão
            const { vlrcom } = realizado[i]
            //Tributos
            const { totalTributos } = realizado[i]
            //Custo Variável
            const { custovar } = realizado[i]
            const { totdes } = realizado[i]
            const { totali } = realizado[i]
            const { totcmb } = realizado[i]
            const { tothtl } = realizado[i]
            //Custo Variavel Estrutural
            const { custoest } = realizado[i]
            const { valorCer } = realizado[i]
            const { valorCen } = realizado[i]
            const { valorPos } = realizado[i]

            //Percentuais Conmponentes
            const { valorMod } = realizado[i]
            const { valorInv } = realizado[i]
            const { valorEst } = realizado[i]
            const { valorCab } = realizado[i]
            const { valorDis } = realizado[i]
            const { valorDPS } = realizado[i]
            const { valorSB } = realizado[i]
            const { valorOcp } = realizado[i]

            //-------------------------------
            //Média ponderada da participação do gastos- INÍCIO
            //-------------------------------
            if (fatequ == true) {
                soma_totkwp_com = (parseFloat(soma_totkwp_com) + parseFloat(potencia)).toFixed(2)
                soma_totcop_com = (parseFloat(soma_totcop_com) + parseFloat(custoPlano)).toFixed(2)
                //Totalizador de Faturamento            
                soma_totfat_com = parseFloat(soma_totfat_com) + parseFloat(vlrNFS)
                //Totalizador de Kit   
                soma_totkit_com = parseFloat(soma_totkit_com) + parseFloat(vlrkit)

                //Custos Fixos 
                if (custofix > 0) {
                    soma_totcus_com = (parseFloat(soma_totcus_com) + parseFloat(custofix)).toFixed(2)
                }
                //Serviços
                if (totint > 0) {
                    soma_totint_com = (parseFloat(soma_totint_com) + parseFloat(totint)).toFixed(2)
                }
                if (totpro > 0) {
                    soma_totpro_com = (parseFloat(soma_totpro_com) + parseFloat(totpro)).toFixed(2)
                }
                if (totges > 0) {
                    soma_totges_com = (parseFloat(soma_totges_com) + parseFloat(totges)).toFixed(2)
                }
                if (vlrart > 0) {
                    soma_totart_com = (parseFloat(soma_totart_com) + parseFloat(vlrart)).toFixed(2)
                }
                //Tributos
                if (totalTributos > 0) {
                    soma_tottrb_com = (parseFloat(soma_tottrb_com) + parseFloat(totalTributos)).toFixed(2)
                }
                //Comissão
                if (vlrcom > 0) {
                    soma_totcom_com = (parseFloat(soma_totcom_com) + parseFloat(vlrcom)).toFixed(2)
                }
                //Despesas Administrativas
                if (desAdm != undefined) {
                    soma_totadm_com = (parseFloat(soma_totadm_com) + parseFloat(desAdm)).toFixed(2)
                }

                //Custos Variáveis
                if (totdes > 0 || totali > 0 || totcmb > 0 || tothtl > 0) {
                    soma_varkwp_com = parseFloat(soma_varkwp_com) + parseFloat(potencia)
                    //console.log('soma_varkwp=>' + soma_varkwp)
                    soma_varfat_com = parseFloat(soma_varfat_com) + parseFloat(vlrNFS)
                    soma_totvar_com = (parseFloat(soma_totvar_com) + parseFloat(custovar)).toFixed(2)
                }

                if (totdes > 0) {
                    soma_totdes_com = (parseFloat(soma_totdes_com) + parseFloat(totdes)).toFixed(2)
                }
                if (totali > 0) {
                    soma_totali_com = (parseFloat(soma_totali_com) + parseFloat(totali)).toFixed(2)
                }
                if (totcmb > 0) {
                    soma_totcmb_com = (parseFloat(soma_totcmb_com) + parseFloat(totcmb)).toFixed(2)
                }
                if (tothtl > 0) {
                    soma_tothtl_com = (parseFloat(soma_tothtl_com) + parseFloat(tothtl)).toFixed(2)
                }

                //Custos Variáveis Estruturais
                if (valorCer > 0 || valorCen > 0 || valorPos > 0) {
                    soma_estkwp_com = parseFloat(soma_estkwp_com) + parseFloat(potencia)
                    soma_estfat_com = parseFloat(soma_estfat_com) + parseFloat(vlrNFS)
                    soma_totest_com = (parseFloat(soma_totest_com) + parseFloat(custoest)).toFixed(2)
                } else {
                    soma_totest_com = (parseFloat(soma_totest_com) + 0).toFixed(2)
                }
                if (valorCer > 0) {
                    soma_totcer_com = (parseFloat(soma_totcer_com) + parseFloat(valorCer)).toFixed(2)
                } else {
                    soma_totcer_com = (parseFloat(soma_totcer_com) + 0).toFixed(2)
                }
                if (valorCen > 0) {
                    soma_totcen_com = (parseFloat(soma_totcen_com) + parseFloat(valorCen)).toFixed(2)
                } else {
                    soma_totcen_com = (parseFloat(soma_totcen_com) + 0).toFixed(2)
                }
                if (valorPos > 0) {
                    soma_totpos_com = (parseFloat(soma_totpos_com) + parseFloat(valorPos)).toFixed(2)
                } else {
                    soma_totpos_com = (parseFloat(soma_totpos_com) + 0).toFixed(2)
                }

            } else {
                //numprj_sem++

                soma_totkwp_sem = (parseFloat(soma_totkwp_sem) + parseFloat(potencia)).toFixed(2)
                soma_totcop_sem = (parseFloat(soma_totcop_sem) + parseFloat(custoPlano)).toFixed(2)
                //Totalizador de Faturamento            
                soma_totfat_sem = parseFloat(soma_totfat_sem) + parseFloat(vlrNFS)

                //Custos Fixos 
                soma_totcus_sem = (parseFloat(soma_totcus_sem) + parseFloat(custofix)).toFixed(2)
                //Serviços
                soma_totint_sem = (parseFloat(soma_totint_sem) + parseFloat(totint)).toFixed(2)
                soma_totpro_sem = (parseFloat(soma_totpro_sem) + parseFloat(totpro)).toFixed(2)
                soma_totges_sem = (parseFloat(soma_totges_sem) + parseFloat(totges)).toFixed(2)
                soma_totart_sem = (parseFloat(soma_totart_sem) + parseFloat(vlrart)).toFixed(2)
                //Tributos
                soma_tottrb_sem = (parseFloat(soma_tottrb_sem) + parseFloat(totalTributos)).toFixed(2)
                //Comissão
                soma_totcom_sem = (parseFloat(soma_totcom_sem) + parseFloat(vlrcom)).toFixed(2)
                //Despesas Administrativas
                if (desAdm != undefined) {
                    soma_totadm_sem = (parseFloat(soma_totadm_sem) + parseFloat(desAdm)).toFixed(2)
                }

                //Custos Variáveis
                if (totdes > 0 || totali > 0 || totcmb > 0 || tothtl > 0) {
                    soma_varkwp_sem = parseFloat(soma_varkwp_sem) + parseFloat(potencia)
                    //console.log('soma_varkwp=>' + soma_varkwp)
                    soma_varfat_sem = parseFloat(soma_varfat_sem) + parseFloat(vlrNFS)
                    soma_totvar_sem = (parseFloat(soma_totvar_sem) + parseFloat(custovar)).toFixed(2)
                }

                soma_totdes_sem = (parseFloat(soma_totdes_sem) + parseFloat(totdes)).toFixed(2)
                soma_totali_sem = (parseFloat(soma_totali_sem) + parseFloat(totali)).toFixed(2)
                soma_totcmb_sem = (parseFloat(soma_totcmb_sem) + parseFloat(totcmb)).toFixed(2)
                soma_tothtl_sem = (parseFloat(soma_tothtl_sem) + parseFloat(tothtl)).toFixed(2)

                //Custos Variáveis Estruturais
                if (valorCer > 0 || valorCen > 0 || valorPos > 0) {
                    soma_estkwp_sem = parseFloat(soma_estkwp_sem) + parseFloat(potencia)
                    soma_estfat_sem = parseFloat(soma_estfat_sem) + parseFloat(vlrNFS)
                    soma_totest_sem = (parseFloat(soma_totest_sem) + parseFloat(custoest)).toFixed(2)
                } else {
                    soma_totest_sem = (parseFloat(soma_totest_sem) + 0).toFixed(2)
                }
                if (valorCer > 0) {
                    soma_totcer_sem = (parseFloat(soma_totcer_sem) + parseFloat(valorCer)).toFixed(2)
                } else {
                    soma_totcer_sem = (parseFloat(soma_totcer_sem) + 0).toFixed(2)
                }
                if (valorCen > 0) {
                    soma_totcen_sem = (parseFloat(soma_totcen_sem) + parseFloat(valorCen)).toFixed(2)
                } else {
                    soma_totcen_sem = (parseFloat(soma_totcen_sem) + 0).toFixed(2)
                }
                if (valorPos > 0) {
                    soma_totpos_sem = (parseFloat(soma_totpos_sem) + parseFloat(valorPos)).toFixed(2)
                } else {
                    soma_totpos_sem = (parseFloat(soma_totpos_sem) + 0).toFixed(2)
                }
            }

            //----------------------------------------
            //Média ponderada da paticipação dos gastos- FIM
            //----------------------------------------

            //console.log('valor=>' + valor)
            //console.log('potencia=>' + potencia)
            soma_totkwp = (parseFloat(soma_totkwp) + parseFloat(potencia)).toFixed(2)
            soma_totcop = (parseFloat(soma_totcop) + parseFloat(custoPlano)).toFixed(2)
            //Totalizador de Faturamento            
            if (fatequ == true) {
                soma_kitfat = parseFloat(soma_kitfat) + parseFloat(vlrNFS)
                soma_totkit = parseFloat(soma_totkit) + parseFloat(vlrkit)
            } else {
                soma_serfat = parseFloat(soma_serfat) + parseFloat(vlrNFS)
            }

            //Custos Fixos 
            //Serviços
            if (totint > 0) {
                soma_totint = (parseFloat(soma_totint) + parseFloat(totint)).toFixed(2)
            } else {
                soma_totint = (parseFloat(soma_totint) + 0).toFixed(2)
            }
            if (totpro > 0) {
                soma_totpro = (parseFloat(soma_totpro) + parseFloat(totpro)).toFixed(2)
            } else {
                soma_totpro = (parseFloat(soma_totpro) + 0).toFixed(2)
            }
            if (totges > 0) {
                soma_totges = (parseFloat(soma_totges) + parseFloat(totges)).toFixed(2)
            } else {
                soma_totges = (parseFloat(soma_totges) + 0).toFixed(2)
            }
            if (vlrart > 0) {
                soma_totart = (parseFloat(soma_totart) + parseFloat(vlrart)).toFixed(2)
            } else {
                soma_totart = (parseFloat(soma_totart) + 0).toFixed(2)
            }
            //Tributos
            soma_tottrb = (parseFloat(soma_tottrb) + parseFloat(totalTributos)).toFixed(2)
            //Comissão
            soma_totcom = (parseFloat(soma_totcom) + parseFloat(vlrcom)).toFixed(2)
            //Despesas Administrativas
            if (desAdm != undefined) {
                soma_totadm = (parseFloat(soma_totadm) + parseFloat(desAdm)).toFixed(2)
            }

            //Custos Variáveis
            if (totdes > 0 || totali > 0 || totcmb > 0 || tothtl > 0) {
                soma_varkwp = parseFloat(soma_varkwp) + parseFloat(potencia)
                //console.log('soma_varkwp=>' + soma_varkwp)
                soma_varfat = parseFloat(soma_varfat) + parseFloat(vlrNFS)
            }
            if (totdes > 0) {
                soma_totdes = (parseFloat(soma_totdes) + parseFloat(totdes)).toFixed(2)
            } else {
                soma_totdes = (parseFloat(soma_totdes) + 0).toFixed(2)
            }
            if (totali > 0) {
                soma_totali = (parseFloat(soma_totali) + parseFloat(totali)).toFixed(2)
            } else {
                soma_totali = (parseFloat(soma_totali) + 0).toFixed(2)
            }
            if (totcmb > 0) {
                soma_totcmb = (parseFloat(soma_totcmb) + parseFloat(totcmb)).toFixed(2)
            } else {
                soma_totcmb = (parseFloat(soma_totcmb) + 0).toFixed(2)
            }
            if (tothtl > 0) {
                soma_tothtl = (parseFloat(soma_tothtl) + parseFloat(tothtl)).toFixed(2)
            } else {
                soma_tothtl = (parseFloat(soma_tothtl) + 0).toFixed(2)
            }

            //Custos Variáveis Estruturais
            if (valorCer > 0 || valorCen > 0 || valorPos > 0) {
                soma_estkwp = parseFloat(soma_estkwp) + parseFloat(potencia)
                soma_estfat = parseFloat(soma_estfat) + parseFloat(vlrNFS)
            } else {
                soma_estkwp = parseFloat(soma_estkwp) + 0
                soma_estfat = parseFloat(soma_estfat) + 0
            }
            if (valorCer > 0) {
                soma_totcer = (parseFloat(soma_totcer) + parseFloat(valorCer)).toFixed(2)
            } else {
                soma_totcer = (parseFloat(soma_totcer) + 0).toFixed(2)
            }
            if (valorCen > 0) {
                soma_totcen = (parseFloat(soma_totcen) + parseFloat(valorCen)).toFixed(2)
            } else {
                soma_totcen = (parseFloat(soma_totcen) + 0).toFixed(2)
            }
            if (valorPos > 0) {
                soma_totpos = (parseFloat(soma_totpos) + parseFloat(valorPos)).toFixed(2)
            } else {
                soma_totpos = (parseFloat(soma_totpos) + 0).toFixed(2)
            }

            if (parseFloat(valorMod) > 0) {
                soma_equkwp = parseFloat(soma_equkwp) + parseFloat(potencia)
            }
            //console.log('soma_equkwp=>'+soma_equkwp)
            //Soma percentuais componentes
            //console.log('valorMod=>' + valorMod)
            if (valorMod != undefined) {
                soma_modequ = (parseFloat(soma_modequ) + parseFloat(valorMod)).toFixed(2)
            }
            //console.log('soma_modequ=>' + soma_modequ)
            //console.log('valorInv=>' + valorInv)
            if (valorInv != undefined) {
                soma_invequ = (parseFloat(soma_invequ) + parseFloat(valorInv)).toFixed(2)
            }
            //console.log('soma_invequ=>' + soma_invequ)
            //console.log('valorEst=>' + valorEst)
            if (valorEst != undefined) {
                soma_estequ = (parseFloat(soma_estequ) + parseFloat(valorEst)).toFixed(2)
            }
            //console.log('soma_estequ=>' + soma_estequ)
            //console.log('valorCab=>' + valorCab)
            if (valorCab != undefined) {
                soma_cabequ = (parseFloat(soma_cabequ) + parseFloat(valorCab)).toFixed(2)
            }
            //console.log('soma_cabequ=>' + soma_cabequ)
            //console.log('valorDis=>' + valorDis)
            if (valorDis != undefined) {
                soma_disequ = (parseFloat(soma_disequ) + parseFloat(valorDis)).toFixed(2)
            }
            //console.log('soma_disequ=>' + soma_disequ)
            //console.log('valorDPS=>' + valorDPS)
            if (valorDPS != undefined) {
                soma_dpsequ = (parseFloat(soma_dpsequ) + parseFloat(valorDPS)).toFixed(2)
            }
            //console.log('soma_dpsequ=>' + soma_dpsequ)
            //console.log('valorSB=>' + valorSB)
            if (valorSB != undefined) {
                soma_sbxequ = (parseFloat(soma_sbxequ) + parseFloat(valorSB)).toFixed(2)
            }
            //console.log('soma_sbxequ=>' + soma_sbxequ)
            //console.log('valorOcp=>' + valorOcp)
            if (valorOcp != undefined) {
                soma_ocpequ = (parseFloat(soma_ocpequ) + parseFloat(valorOcp)).toFixed(2)
            }
            //console.log('soma_ocpequ=>' + soma_ocpequ)

            //Totais: Projetos Vendidos, Faturamento e Lucro Líquido
            soma_totprj = (parseFloat(soma_totprj) + parseFloat(valor)).toFixed(2)
            soma_totliq = (parseFloat(soma_totliq) + parseFloat(lucroLiquido)).toFixed(2)
        }

        //Média Ponderada projetista
        var per_totpro_com = parseFloat(soma_totpro_com) / parseFloat(soma_totfat_com) * 100
        if (isNaN(per_totpro_com)) {
            per_totpro_com = 0
        }
        var per_totpro_sem = parseFloat(soma_totpro_sem) / parseFloat(soma_totfat_sem) * 100
        if (isNaN(per_totpro_sem)) {
            per_totpro_sem = 0
        }
        var medkwp_totpro_com = parseFloat(soma_totpro_com) / parseFloat(soma_totkwp_com)
        if (isNaN(medkwp_totpro_com)) {
            medkwp_totpro_com = 0
        }
        var medkwp_totpro_sem = parseFloat(soma_totpro_sem) / parseFloat(soma_totkwp_sem)
        if (isNaN(medkwp_totpro_sem)) {
            medkwp_totpro_sem = 0
        }
        var per_totpro = (((parseFloat(soma_totkwp_com) * parseFloat(per_totpro_com)) + (parseFloat(soma_totkwp_sem) * parseFloat(per_totpro_sem))) / (parseFloat(soma_totkwp_com) + parseFloat(soma_totkwp_sem))).toFixed(2)
        if (isNaN(per_totpro)) {
            per_totpro = 0
        }
        //Média Ponderada ART
        var per_totart_com = parseFloat(soma_totart_com) / parseFloat(soma_totfat_com) * 100
        if (isNaN(per_totart_com)) {
            per_totart_com = 0
        }
        var per_totart_sem = parseFloat(soma_totart_sem) / parseFloat(soma_totfat_sem) * 100
        if (isNaN(per_totart_sem)) {
            per_totart_sem = 0
        }
        var medkwp_totart_com = parseFloat(soma_totart_com) / parseFloat(soma_totkwp_com)
        if (isNaN(medkwp_totart_com)) {
            medkwp_totart_com = 0
        }
        var medkwp_totart_sem = parseFloat(soma_totart_sem) / parseFloat(soma_totkwp_sem)
        if (isNaN(medkwp_totart_sem)) {
            medkwp_totart_sem = 0
        }
        var per_totart = (((parseFloat(medkwp_totart_com) * parseFloat(per_totart_com)) + (parseFloat(medkwp_totart_sem) * parseFloat(per_totart_sem))) / (parseFloat(medkwp_totart_com) + parseFloat(medkwp_totart_sem))).toFixed(2)
        if (isNaN(per_totart)) {
            per_totart = 0
        }
        //Média Ponderada Gestão
        var per_totges_com = parseFloat(soma_totges_com) / parseFloat(soma_totfat_com) * 100
        if (isNaN(per_totges_com)) {
            per_totges_com = 0
        }
        var per_totges_sem = parseFloat(soma_totges_sem) / parseFloat(soma_totfat_sem) * 100
        if (isNaN(per_totges_sem)) {
            per_totges_sem = 0
        }
        var medkwp_totges_com = parseFloat(soma_totges_com) / parseFloat(soma_totkwp_com)
        if (isNaN(medkwp_totges_com)) {
            medkwp_totges_com = 0
        }
        var medkwp_totges_sem = parseFloat(soma_totges_sem) / parseFloat(soma_totkwp_sem)
        if (isNaN(medkwp_totges_sem)) {
            medkwp_totges_sem = 0
        }
        var per_totges = (((parseFloat(soma_totkwp_com) * parseFloat(per_totges_com)) + (parseFloat(soma_totkwp_sem) * parseFloat(per_totges_sem))) / (parseFloat(soma_totkwp_com) + parseFloat(soma_totkwp_sem))).toFixed(2)
        if (isNaN(per_totges)) {
            per_totges = 0
        }
        //Média Ponderada instalação
        var per_totint_com = parseFloat(soma_totint_com) / parseFloat(soma_totfat_com) * 100
        if (isNaN(per_totint_com)) {
            per_totint_com = 0
        }
        var per_totint_sem = parseFloat(soma_totint_sem) / parseFloat(soma_totfat_sem) * 100
        if (isNaN(per_totint_sem)) {
            per_totint_sem = 0
        }
        var medkwp_totint_com = parseFloat(soma_totint_com) / parseFloat(soma_totkwp_com)
        if (isNaN(medkwp_totint_com)) {
            medkwp_totint_com = 0
        }
        var medkwp_totint_sem = parseFloat(soma_totint_sem) / parseFloat(soma_totkwp_sem)
        if (isNaN(medkwp_totint_sem)) {
            medkwp_totint_sem = 0
        }
        var per_totint = (((parseFloat(soma_totkwp_com) * parseFloat(per_totint_com)) + (parseFloat(soma_totkwp_sem) * parseFloat(per_totint_sem))) / (parseFloat(soma_totkwp_com) + parseFloat(soma_totkwp_sem))).toFixed(2)
        if (isNaN(per_totint)) {
            per_totint = 0
        }
        //Média Ponderada Administração
        var per_totadm_com = parseFloat(soma_totadm_com) / parseFloat(soma_totfat_com) * 100
        if (isNaN(per_totadm_com)) {
            per_totadm_com = 0
        }
        var per_totadm_sem = parseFloat(soma_totadm_sem) / parseFloat(soma_totfat_sem) * 100
        if (isNaN(per_totadm_sem)) {
            per_totadm_sem = 0
        }
        var medkwp_totadm_com = parseFloat(soma_totadm_com) / parseFloat(soma_totkwp_com)
        if (isNaN(medkwp_totadm_com)) {
            medkwp_totadm_com = 0
        }
        var medkwp_totadm_sem = parseFloat(soma_totadm_sem) / parseFloat(soma_totkwp_sem)
        if (isNaN(medkwp_totadm_sem)) {
            medkwp_totadm_sem = 0
        }
        var per_totadm = (((parseFloat(soma_totkwp_com) * parseFloat(per_totadm_com)) + (parseFloat(soma_totkwp_sem) * parseFloat(per_totadm_sem))) / (parseFloat(soma_totkwp_com) + parseFloat(soma_totkwp_sem))).toFixed(2)
        if (isNaN(per_totadm)) {
            per_totadm = 0
        }
        //Média Ponderada Comissão
        var per_totcom_com = parseFloat(soma_totcom_com) / parseFloat(soma_totfat_com) * 100
        if (isNaN(per_totcom_com)) {
            per_totcom_com = 0
        }
        var per_totcom_sem = parseFloat(soma_totcom_sem) / parseFloat(soma_totfat_sem) * 100
        if (isNaN(per_totcom_sem)) {
            per_totcom_sem = 0
        }
        var medkwp_totcom_com = parseFloat(soma_totcom_com) / parseFloat(soma_totkwp_com)
        if (isNaN(medkwp_totcom_com)) {
            medkwp_totcom_com = 0
        }
        var medkwp_totcom_sem = parseFloat(soma_totcom_sem) / parseFloat(soma_totkwp_sem)
        if (isNaN(medkwp_totcom_sem)) {
            medkwp_totcom_sem = 0
        }
        var per_totcom = (((parseFloat(soma_totkwp_com) * parseFloat(per_totcom_com)) + (parseFloat(soma_totkwp_sem) * parseFloat(per_totcom_sem))) / (parseFloat(soma_totkwp_com) + parseFloat(soma_totkwp_sem))).toFixed(2)
        if (isNaN(per_totcom)) {
            per_totcom = 0
        }
        //Média Ponderada Tributos
        var per_tottrb_com = parseFloat(soma_tottrb_com) / parseFloat(soma_totfat_com) * 100
        if (isNaN(per_tottrb_com)) {
            per_tottrb_com = 0
        }
        var per_tottrb_sem = parseFloat(soma_tottrb_sem) / parseFloat(soma_totfat_sem) * 100
        if (isNaN(per_tottrb_sem)) {
            per_tottrb_sem = 0
        }
        var medkwp_tottrb_com = parseFloat(soma_tottrb_com) / parseFloat(soma_totkwp_com)
        if (isNaN(medkwp_tottrb_com)) {
            medkwp_tottrb_com = 0
        }
        var medkwp_tottrb_sem = parseFloat(soma_tottrb_sem) / parseFloat(soma_totkwp_sem)
        if (isNaN(medkwp_tottrb_sem)) {
            medkwp_tottrb_sem = 0
        }
        var per_tottrb = (((parseFloat(soma_totkwp_com) * parseFloat(per_tottrb_com)) + (parseFloat(soma_totkwp_sem) * parseFloat(per_tottrb_sem))) / (parseFloat(soma_totkwp_com) + parseFloat(soma_totkwp_sem))).toFixed(2)
        if (isNaN(per_tottrb)) {
            per_tottrb = 0
        }
        //Total Custos
        var custoFix_com = parseFloat(soma_totcus_com) + parseFloat(soma_totadm_com) + parseFloat(soma_totcom_com) + parseFloat(soma_tottrb_com)
        var custoFix_sem = parseFloat(soma_totcus_sem) + parseFloat(soma_totadm_sem) + parseFloat(soma_totcom_sem) + parseFloat(soma_tottrb_sem)
        var per_totcus_com = parseFloat(custoFix_com) / parseFloat(soma_totfat_com) * 100
        if (isNaN(per_totcus_com)) {
            per_totcus_com = 0
        }
        var per_totcus_sem = parseFloat(custoFix_sem) / parseFloat(soma_totfat_sem) * 100
        if (isNaN(per_totcus_sem)) {
            per_totcus_sem = 0
        }
        var medkwp_totcus_com = parseFloat(custoFix_com) / parseFloat(soma_totkwp_com)
        if (isNaN(medkwp_totcus_com)) {
            medkwp_totcus_com = 0
        }
        var medkwp_totcus_sem = parseFloat(custoFix_sem) / parseFloat(soma_totkwp_sem)
        if (isNaN(medkwp_totcus_sem)) {
            medkwp_totcus_sem = 0
        }
        var per_totcus = (((parseFloat(soma_totkwp_com) * parseFloat(per_totcus_com)) + (parseFloat(soma_totkwp_sem) * parseFloat(per_totcus_sem))) / (parseFloat(soma_totkwp_com) + parseFloat(soma_totkwp_sem))).toFixed(2)
        if (isNaN(per_totcus)) {
            per_totcus = 0
        }
        //Média Ponderada Custos Variáveis Alimentação
        var per_totali_com = parseFloat(soma_totali_com) / parseFloat(soma_varfat_com) * 100
        if (isNaN(per_totali_com)) {
            per_totali_com = 0
        }
        var per_totali_sem = parseFloat(soma_totali_sem) / parseFloat(soma_varfat_sem) * 100
        if (isNaN(per_totali_sem)) {
            per_totali_sem = 0
        }
        var medkwp_totali_com = parseFloat(soma_totali_com) / parseFloat(soma_varkwp_com)
        if (isNaN(medkwp_totali_com)) {
            medkwp_totali_com = 0
        }
        var medkwp_totali_sem = parseFloat(soma_totali_sem) / parseFloat(soma_varkwp_sem)
        if (isNaN(medkwp_totali_sem)) {
            medkwp_totali_sem = 0
        }
        var per_totali = (((parseFloat(soma_varkwp_com) * parseFloat(per_totali_com)) + (parseFloat(soma_varkwp_sem) * parseFloat(per_totali_sem))) / (parseFloat(soma_varkwp_sem) + parseFloat(soma_varkwp_com))).toFixed(2)
        if (isNaN(per_totali)) {
            per_totali = 0
        }
        //Média Ponderada Custos Variáveis Deslocamento
        var per_totdes_com = parseFloat(soma_totdes_com) / parseFloat(soma_varfat_com) * 100
        if (isNaN(per_totdes_com)) {
            per_totdes_com = 0
        }
        var per_totdes_sem = parseFloat(soma_totdes_sem) / parseFloat(soma_varfat_sem) * 100
        if (isNaN(per_totdes_sem)) {
            per_totdes_sem = 0
        }
        var medkwp_totdes_com = parseFloat(soma_totdes_com) / parseFloat(soma_varkwp_com)
        if (isNaN(medkwp_totdes_com)) {
            medkwp_totdes_com = 0
        }
        var medkwp_totdes_sem = parseFloat(soma_totdes_sem) / parseFloat(soma_varkwp_sem)
        if (isNaN(medkwp_totdes_sem)) {
            medkwp_totdes_sem = 0
        }
        var per_totdes = (((parseFloat(soma_varkwp_com) * parseFloat(per_totdes_com)) + (parseFloat(soma_varkwp_sem) * parseFloat(per_totdes_sem))) / (parseFloat(soma_varkwp_com) + parseFloat(soma_varkwp_sem))).toFixed(2)
        if (isNaN(per_totdes)) {
            per_totdes = 0
        }
        //Média Ponderada Custos Variáveis Combustível
        var per_totcmb_com = parseFloat(soma_totcmb_com) / parseFloat(soma_varfat_com) * 100
        if (isNaN(per_totcmb_com)) {
            per_totcmb_com = 0
        }
        var per_totcmb_sem = parseFloat(soma_totcmb_sem) / parseFloat(soma_varfat_sem) * 100
        if (isNaN(per_totcmb_sem)) {
            per_totcmb_sem = 0
        }
        var medkwp_totcmb_com = parseFloat(soma_totcmb_com) / parseFloat(soma_varkwp_com)
        if (isNaN(medkwp_totcmb_com)) {
            medkwp_totcmb_com = 0
        }
        var medkwp_totcmb_sem = parseFloat(soma_totcmb_sem) / parseFloat(soma_varkwp_sem)
        if (isNaN(medkwp_totcmb_sem)) {
            medkwp_totcmb_sem = 0
        }
        var per_totcmb = (((parseFloat(soma_varkwp_com) * parseFloat(per_totcmb_com)) + (parseFloat(soma_varkwp_sem) * parseFloat(per_totcmb_sem))) / (parseFloat(soma_varkwp_com) + parseFloat(soma_varkwp_sem))).toFixed(2)
        if (isNaN(per_totcmb)) {
            per_totcmb = 0
        }
        //Média Ponderada Custos Variáveis Hotel
        var per_tothtl_com = parseFloat(soma_tothtl_com) / parseFloat(soma_varfat_com) * 100
        if (isNaN(per_tothtl_com)) {
            per_tothtl_com = 0
        }
        var per_tothtl_sem = parseFloat(soma_tothtl_sem) / parseFloat(soma_varfat_sem) * 100
        if (isNaN(per_tothtl_sem)) {
            per_tothtl_sem = 0
        }
        var medkwp_tothtl_com = parseFloat(soma_tothtl_com) / parseFloat(soma_varkwp_com)
        if (isNaN(medkwp_tothtl_com)) {
            medkwp_tothtl_com = 0
        }
        var medkwp_tothtl_sem = parseFloat(soma_tothtl_sem) / parseFloat(soma_varkwp_sem)
        if (isNaN(medkwp_tothtl_sem)) {
            medkwp_tothtl_sem = 0
        }
        var per_tothtl = (((parseFloat(soma_varkwp_com) * parseFloat(per_tothtl_com)) + (parseFloat(soma_varkwp_sem) * parseFloat(per_tothtl_sem))) / (parseFloat(soma_varkwp_com) + parseFloat(soma_varkwp_sem))).toFixed(2)
        if (isNaN(per_tothtl)) {
            per_tothtl = 0
        }
        //Total Custos Variáveis
        var custoVar_com = parseFloat(soma_totvar_com)
        var custoVar_sem = parseFloat(soma_totvar_sem)
        var per_totvar_com = parseFloat(custoVar_com) / parseFloat(soma_varfat_com) * 100
        if (isNaN(per_totvar_com)) {
            per_totvar_com = 0
        }
        var per_totvar_sem = parseFloat(custoVar_sem) / parseFloat(soma_varfat_sem) * 100
        if (isNaN(per_totvar_sem)) {
            per_totvar_sem = 0
        }
        var medkwp_totvar_com = parseFloat(custoVar_com) / parseFloat(soma_varkwp_com)
        if (isNaN(medkwp_totvar_com)) {
            medkwp_totvar_com = 0
        }
        var medkwp_totvar_sem = parseFloat(custoVar_sem) / parseFloat(soma_varkwp_sem)
        if (isNaN(medkwp_totvar_sem)) {
            medkwp_totvar_sem = 0
        }
        var per_totvar = (((parseFloat(soma_varkwp_com) * parseFloat(per_totvar_com)) + (parseFloat(soma_varkwp_sem) * parseFloat(per_totvar_sem))) / (parseFloat(soma_varkwp_com) + parseFloat(soma_varkwp_sem))).toFixed(2)
        if (isNaN(per_totvar)) {
            per_totvar = 0
        }
        //Média Ponderada Variáveis Estruturais Cercamento  
        var per_totcer_com = parseFloat(soma_totcer_com) / parseFloat(soma_estfat_com) * 100
        if (isNaN(per_totcer_com)) {
            per_totcer_com = 0
        }
        var per_totcer_sem = parseFloat(soma_totcer_sem) / parseFloat(soma_estfat_sem) * 100
        if (isNaN(per_totcer_sem)) {
            per_totcer_sem = 0
        }
        var medkwp_totcer_com = parseFloat(soma_totcer_com) / parseFloat(soma_estkwp_com)
        if (isNaN(medkwp_totcer_com)) {
            medkwp_totcer_com = 0
        }
        var medkwp_totcer_sem = parseFloat(soma_totcer_sem) / parseFloat(soma_estkwp_sem)
        if (isNaN(medkwp_totcer_sem)) {
            medkwp_totcer_sem = 0
        }
        var per_totcer = (((parseFloat(soma_estkwp_com) * parseFloat(per_totcer_com)) + (parseFloat(soma_estkwp_sem) * parseFloat(soma_estkwp_com))) / (parseFloat(soma_estkwp_sem) + parseFloat(soma_varkwp_sem))).toFixed(2)
        if (isNaN(per_totcer)) {
            per_totcer = 0
        }
        //Média Ponderada Variáveis Estruturais Central
        var per_totcen_com = parseFloat(soma_totcen_com) / parseFloat(soma_estfat_com) * 100
        if (isNaN(per_totcen_com)) {
            per_totcen_com = 0
        }
        var per_totcen_sem = parseFloat(soma_totcen_sem) / parseFloat(soma_estfat_sem) * 100
        if (isNaN(per_totcen_sem)) {
            per_totcen_sem = 0
        }
        var medkwp_totcen_com = parseFloat(soma_totcen_com) / parseFloat(soma_estkwp_com)
        if (isNaN(medkwp_totcen_com)) {
            medkwp_totcen_com = 0
        }
        var medkwp_totcen_sem = parseFloat(soma_totcen_sem) / parseFloat(soma_estkwp_sem)
        if (isNaN(medkwp_totcen_sem)) {
            medkwp_totcen_sem = 0
        }
        var per_totcen = (((parseFloat(soma_estkwp_com) * parseFloat(per_totcen_com)) + (parseFloat(soma_estkwp_sem) * parseFloat(per_totcen_sem))) / (parseFloat(soma_estkwp_com) + parseFloat(soma_estkwp_sem))).toFixed(2)
        if (isNaN(per_totcen)) {
            per_totcen = 0
        }
        //Média Ponderada Variáveis Estruturais Postes
        var per_totpos_com = parseFloat(soma_totpos_com) / parseFloat(soma_estfat_com) * 100
        if (isNaN(per_totpos_com)) {
            per_totpos_com = 0
        }
        var per_totpos_sem = parseFloat(soma_totpos_sem) / parseFloat(soma_estfat_sem) * 100
        if (isNaN(per_totpos_sem)) {
            per_totpos_sem = 0
        }
        var medkwp_totpos_com = parseFloat(soma_totpos_com) / parseFloat(soma_estkwp_com)
        if (isNaN(medkwp_totpos_com)) {
            medkwp_totpos_com = 0
        }
        var medkwp_totpos_sem = parseFloat(soma_totpos_sem) / parseFloat(soma_estkwp_sem)
        if (isNaN(medkwp_totpos_sem)) {
            medkwp_totpos_sem = 0
        }
        var per_totpos = (((parseFloat(soma_estkwp_com) * parseFloat(per_totpos_com)) + (parseFloat(soma_estkwp_sem) * parseFloat(per_totpos_sem))) / (parseFloat(soma_estkwp_com) + parseFloat(soma_estkwp_sem))).toFixed(2)
        if (isNaN(per_totpos)) {
            per_totpos = 0
        }
        //Total Custos Variáveis Estruturais
        var custoEst_com = parseFloat(soma_totest_com)
        if (isNaN(custoEst_com)) {
            custoEst_com = 0
        }
        var custoEst_sem = parseFloat(soma_totest_sem)
        if (isNaN(custoEst_sem)) {
            custoEst_sem = 0
        }
        var per_totest_com = parseFloat(custoEst_com) / parseFloat(soma_estfat_com) * 100
        if (isNaN(per_totest_com)) {
            per_totest_com = 0
        }
        var per_totest_sem = parseFloat(custoEst_sem) / parseFloat(soma_estfat_sem) * 100
        if (isNaN(per_totest_sem)) {
            per_totest_sem = 0
        }
        var medkwp_totest_com = parseFloat(custoEst_com) / parseFloat(soma_estkwp_com)
        if (isNaN(medkwp_totest_com)) {
            medkwp_totest_com = 0
        }
        var medkwp_totest_sem = parseFloat(custoEst_sem) / parseFloat(soma_estkwp_sem)
        if (isNaN(medkwp_totest_sem)) {
            medkwp_totest_sem = 0
        }
        var per_totest = (((parseFloat(soma_estkwp_com) * parseFloat(per_totest_com)) + (parseFloat(soma_estkwp_sem) * parseFloat(per_totest_sem))) / (parseFloat(soma_estkwp_com) + parseFloat(soma_estkwp_sem))).toFixed(2)
        if (isNaN(per_totest)) {
            per_totest = 0
        }

        soma_custoFix = parseFloat(soma_totint) + parseFloat(soma_totpro) + parseFloat(soma_totart) + parseFloat(soma_totges) + parseFloat(soma_tottrb) + parseFloat(soma_totcom) + parseFloat(soma_totadm)
        soma_custoVar = parseFloat(soma_totali) + parseFloat(soma_totdes)
        soma_custoEst = parseFloat(soma_totcer) + parseFloat(soma_totcen) + parseFloat(soma_totpos)
        soma_totfat = parseFloat(soma_kitfat) + parseFloat(soma_serfat)

        //Soma Total Componentes
        soma_totequ = parseFloat(soma_modequ) + parseFloat(soma_invequ) + parseFloat(soma_estequ) + parseFloat(soma_cabequ) + parseFloat(soma_disequ) + parseFloat(soma_dpsequ) + parseFloat(soma_sbxequ) + parseFloat(soma_ocpequ)

        //Custos Fixos 
        medkwp_custoFix = (parseFloat(soma_custoFix) / parseFloat(soma_totkwp)).toFixed(2)
        if (isNaN(medkwp_custoFix)) {
            medkwp_custoFix = 0
        }
        //Serviço
        medkwp_totint = (parseFloat(soma_totint) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totpro = (parseFloat(soma_totpro) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totges = (parseFloat(soma_totges) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totart = (parseFloat(soma_totart) / parseFloat(soma_totkwp)).toFixed(2)
        //Tributos
        medkwp_tottrb = (parseFloat(soma_tottrb) / parseFloat(soma_totkwp)).toFixed(2)
        //Comissão
        medkwp_totcom = (parseFloat(soma_totcom) / parseFloat(soma_totkwp)).toFixed(2)
        //Despesas Administrativas
        medkwp_totadm = (parseFloat(soma_totadm) / parseFloat(soma_totkwp)).toFixed(2)
        //Custos Variáveis
        medkwp_custoVar = (parseFloat(soma_custoVar) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_custoVar)) {
            medkwp_custoVar = 0
        }
        medkwp_varfat = (parseFloat(soma_varfat) / parseFloat(soma_varkwp)).toFixed(2)
        medkwp_totdes = (parseFloat(soma_totdes) / parseFloat(soma_varkwp)).toFixed(2)
        medkwp_totali = (parseFloat(soma_totali) / parseFloat(soma_varkwp)).toFixed(2)
        medkwp_tothtl = (parseFloat(soma_tothtl) / parseFloat(soma_varkwp)).toFixed(2)
        medkwp_totcmb = (parseFloat(soma_totcmb) / parseFloat(soma_varkwp)).toFixed(2)
        //Custos Variáveis Estruturais
        medkwp_custoEst = (parseFloat(soma_custoEst) / parseFloat(soma_estkwp)).toFixed(2)
        if (isNaN(medkwp_custoEst)) {
            medkwp_custoEst = 0
        }
        medkwp_totcer = (parseFloat(soma_totcer) / parseFloat(soma_estkwp)).toFixed(2)
        if (isNaN(medkwp_totcer)) {
            medkwp_totcer = 0
        }
        medkwp_totcen = (parseFloat(soma_totcen) / parseFloat(soma_estkwp)).toFixed(2)
        if (isNaN(medkwp_totcen)) {
            medkwp_totcen = 0
        }
        medkwp_totpos = (parseFloat(soma_totpos) / parseFloat(soma_estkwp)).toFixed(2)
        if (isNaN(medkwp_totpos)) {
            medkwp_totpos = 0
        }
        //Médias de total faturado por kit e por serviços
        soma_totser = (parseFloat(medkwp_custoFix) + parseFloat(medkwp_custoVar) + parseFloat(medkwp_custoEst)).toFixed(2)

        //medkwp_serfat = parseFloat(soma_serfat) / parseFloat(soma_serkwp)
        per_totliq = ((parseFloat(soma_totliq) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_dispendio = (100 - parseFloat(per_totliq)).toFixed(2)
        per_kitfat = ((parseFloat(soma_totkit) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_comfat = ((parseFloat(soma_totcom) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_cusfat = ((parseFloat(soma_totcop) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_desfat = ((parseFloat(soma_totadm) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_trbfat = ((parseFloat(soma_tottrb) / parseFloat(soma_totfat)) * 100).toFixed(2)
        //Média componentes
        med_modequ = (parseFloat(soma_modequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_invequ = (parseFloat(soma_invequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_estequ = (parseFloat(soma_estequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_cabequ = (parseFloat(soma_cabequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_dpsequ = (parseFloat(soma_dpsequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_disequ = (parseFloat(soma_disequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_sbxequ = (parseFloat(soma_sbxequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_ocpequ = (parseFloat(soma_ocpequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_totequ = (parseFloat(soma_totequ) / parseFloat(soma_equkwp)).toFixed(2)
        //Percentual componentes
        per_modequ = ((parseFloat(soma_modequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_invequ = ((parseFloat(soma_invequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_estequ = ((parseFloat(soma_estequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_cabequ = ((parseFloat(soma_cabequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_disequ = ((parseFloat(soma_disequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_dpsequ = ((parseFloat(soma_dpsequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_sbxequ = ((parseFloat(soma_sbxequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_ocpequ = ((parseFloat(soma_ocpequ) / parseFloat(soma_totequ)) * 100).toFixed(2)

        //ticket médio de kwp instalados
        ticketwkp = (parseFloat(soma_totkwp) / parseFloat(numprj)).toFixed(2)

        //console.log('soma_totkwp=>' + soma_totkwp)

        res.render('relatorios/dashboardcustos', {
            soma_totkwp, soma_varkwp, soma_estkwp,
            soma_totfat, soma_totcop, ticketkwp,

            soma_totint, soma_totpro, soma_totges, soma_totadm, soma_totcom, soma_tottrb, soma_totart,
            soma_custoFix, soma_totdes, soma_totali, soma_totcmb, soma_tothtl, soma_custoVar,
            soma_varfat, soma_totcer, soma_totcen, soma_totpos, soma_custoEst, soma_estfat,

            soma_totkit, soma_totprj, soma_totliq, soma_totser,

            medkwp_totint, medkwp_totpro, medkwp_totges, medkwp_totadm, medkwp_totcom, medkwp_totart,
            medkwp_tottrb, medkwp_custoFix, medkwp_totdes, medkwp_totali, medkwp_tothtl, medkwp_totcmb,
            medkwp_custoVar, medkwp_varfat, medkwp_totcer, medkwp_totcen, medkwp_totpos,
            medkwp_custoEst,

            per_totint, per_totpro, per_totart, per_totges, per_totadm, per_tottrb, per_totcom, per_totcus, per_totvar,
            per_totali, per_totdes, per_tothtl, per_totcmb, per_totvar,
            per_totcer, per_totcen, per_totpos, per_totest,

            numprj, per_totliq, per_dispendio, per_kitfat, per_comfat, per_cusfat, per_desfat, per_trbfat,

            soma_modequ, soma_invequ, soma_estequ, soma_cabequ, soma_dpsequ, soma_disequ, soma_sbxequ, soma_ocpequ, soma_totequ,
            per_modequ, per_invequ, per_estequ, per_cabequ, per_dpsequ, per_disequ, per_sbxequ, per_ocpequ,
            med_modequ, med_invequ, med_estequ, med_cabequ, med_dpsequ, med_disequ, med_sbxequ, med_ocpequ, med_totequ
        })

    })

})

router.get('/dashboardcustoscomkit', ehAdmin, (req, res) => {
    const { _id } = req.user

    var numprj = 0
    var soma_totfat = 0

    var soma_totcop = 0
    var soma_totkit = 0
    var soma_totprj = 0
    var soma_totliq = 0
    var soma_totser = 0

    var soma_totkwp = 0
    var soma_equkwp = 0
    var soma_varkwp = 0
    var soma_estkwp = 0

    //Custos Fixos
    var soma_custoFix = 0
    //Serviço
    var soma_totint = 0
    var soma_totpro = 0
    var soma_totges = 0
    var soma_totart = 0
    //Despesas Administrativas
    var soma_totadm = 0
    //Comissões
    var soma_totcom = 0
    //Tributos
    var soma_tottrb = 0
    //Custos Variáveis
    var soma_varfat = 0
    var soma_custoVar = 0
    var soma_totdes = 0
    var soma_totali = 0
    var soma_totcmb = 0
    var soma_tothtl = 0
    //Custos Variáveis Estruturais
    var soma_estfat = 0
    var soma_custoEst = 0
    var soma_totcer = 0
    var soma_totcen = 0
    var soma_totpos = 0

    //Médias
    var medkwp_totfat = 0
    var medkwp_totcop = 0
    //Custos Fixos
    var medkwp_cusfat = 0
    var medkwp_custoFix = 0
    //Serviço
    var medkwp_totint = 0
    var medkwp_totpro = 0
    var medkwp_totges = 0
    var medkwp_totart = 0
    //Despesas Administrativas
    var medkwp_totadm = 0
    //Comissões
    var medkwp_totcom = 0
    //Tributos
    var medkwp_tottrb = 0
    //Despesas Variáveis
    var medkwp_totdes = 0
    var medkwp_totali = 0
    var medkwp_tothtl = 0
    var medkwp_totcmb = 0
    var medkwp_custoVar = 0
    var medkwp_varfat = 0
    //Despesas Variáveis Estruturais
    var medkwp_estfat = 0
    var medkwp_custoEst = 0
    var medkwp_totcer = 0
    var medkwp_totcen = 0
    var medkwp_totpos = 0

    //Custos Fixos
    var per_custoFix = 0
    //Serviço
    var per_totint = 0
    var per_totpro = 0
    var per_totges = 0
    var per_totart = 0
    //Despesas Administrativas
    var per_totadm = 0
    //Comissões
    var per_totcom = 0
    //Tributos
    var per_tottrb = 0
    //Despesas Variáveis
    var per_totdes = 0
    var per_totali = 0
    var per_tothtl = 0
    var per_totcmb = 0
    var per_custoVar = 0
    //Despesas Variáveis Estruturais
    var per_custoEst = 0
    var per_totcer = 0
    var per_totcen = 0
    var per_totpos = 0

    var per_totliq
    var per_dispendio
    var per_kitfat
    var per_comfat
    var per_cusfat
    var per_desfat
    var per_trbfat

    //Percentuais Componentes
    var soma_modequ = 0
    var soma_invequ = 0
    var soma_estequ = 0
    var soma_cabequ = 0
    var soma_dpsequ = 0
    var soma_disequ = 0
    var soma_sbxequ = 0
    var soma_ocpequ = 0

    var soma_totequ = 0
    var per_modequ = 0
    var per_invequ = 0
    var per_estequ = 0
    var per_cabequ = 0
    var per_dpsequ = 0
    var per_disequ = 0
    var per_sbxequ = 0
    var per_ocpequ = 0
    var med_modequ = 0
    var med_invequ = 0
    var med_estequ = 0
    var med_cabequ = 0
    var med_dpsequ = 0
    var med_disequ = 0
    var med_sbxequ = 0
    var med_ocpequ = 0
    var med_totequ = 0

    Realizado.find({ user: _id }).lean().then((realizado) => {

        for (i = 0; i < realizado.length; i++) {

            const { potencia } = realizado[i]
            const { fatequ } = realizado[i]
            const { vlrkit } = realizado[i]
            const { valor } = realizado[i]
            const { vlrNFS } = realizado[i]
            const { custoPlano } = realizado[i]
            const { lucroLiquido } = realizado[i]

            //Custos Fixos
            //Serviços
            const { totpro } = realizado[i]
            const { totges } = realizado[i]
            const { totint } = realizado[i]
            const { vlrart } = realizado[i]
            //Administrativo
            const { desAdm } = realizado[i]
            //Comissão
            const { vlrcom } = realizado[i]
            //Tributos
            const { totalTributos } = realizado[i]
            //Custo Variável
            const { totdes } = realizado[i]
            const { totali } = realizado[i]
            const { totcmb } = realizado[i]
            const { tothtl } = realizado[i]
            //Custo Variavel Estrutural
            const { valorCer } = realizado[i]
            const { valorCen } = realizado[i]
            const { valorPos } = realizado[i]

            //Percentuais Conmponentes
            const { valorMod } = realizado[i]
            const { valorInv } = realizado[i]
            const { valorEst } = realizado[i]
            const { valorCab } = realizado[i]
            const { valorDis } = realizado[i]
            const { valorDPS } = realizado[i]
            const { valorSB } = realizado[i]
            const { valorOcp } = realizado[i]


            if (fatequ == true) {

                numprj++

                soma_totkwp = (parseFloat(soma_totkwp) + parseFloat(potencia)).toFixed(2)
                soma_totcop = (parseFloat(soma_totcop) + parseFloat(custoPlano)).toFixed(2)
                //Totalizador de Faturamento            
                soma_totfat = parseFloat(soma_totfat) + parseFloat(vlrNFS)
                //Totalizador de Kit   
                soma_totkit = parseFloat(soma_totkit) + parseFloat(vlrkit)

                //Custos Fixos 
                //Serviços
                if (totint > 0) {
                    soma_totint = (parseFloat(soma_totint) + parseFloat(totint)).toFixed(2)
                } else {
                    soma_totint = (parseFloat(soma_totint) + 0).toFixed(2)
                }
                if (totpro > 0) {
                    soma_totpro = (parseFloat(soma_totpro) + parseFloat(totpro)).toFixed(2)
                } else {
                    soma_totpro = (parseFloat(soma_totpro) + 0).toFixed(2)
                }
                if (totges > 0) {
                    soma_totges = (parseFloat(soma_totges) + parseFloat(totges)).toFixed(2)
                } else {
                    soma_totges = (parseFloat(soma_totges) + 0).toFixed(2)
                }
                if (vlrart > 0) {
                    soma_totart = (parseFloat(soma_totart) + parseFloat(vlrart)).toFixed(2)
                } else {
                    soma_totart = (parseFloat(soma_totart) + 0).toFixed(2)
                }
                //Tributos
                if (totalTributos > 0) {
                    soma_tottrb = (parseFloat(soma_tottrb) + parseFloat(totalTributos)).toFixed(2)
                }
                //Comissão
                if (vlrcom > 0) {
                    soma_totcom = (parseFloat(soma_totcom) + parseFloat(vlrcom)).toFixed(2)
                }
                //Despesas Administrativas
                if (desAdm != undefined) {
                    soma_totadm = (parseFloat(soma_totadm) + parseFloat(desAdm)).toFixed(2)
                }

                //Custos Variáveis
                if (totdes > 0 || totali > 0 || totcmb > 0 || tothtl > 0) {
                    soma_varkwp = parseFloat(soma_varkwp) + parseFloat(potencia)
                    //console.log('soma_varkwp=>' + soma_varkwp)
                    soma_varfat = parseFloat(soma_varfat) + parseFloat(vlrNFS)
                }
                if (totdes > 0) {
                    soma_totdes = (parseFloat(soma_totdes) + parseFloat(totdes)).toFixed(2)
                } else {
                    soma_totdes = (parseFloat(soma_totdes) + 0).toFixed(2)
                }
                if (totali > 0) {
                    soma_totali = (parseFloat(soma_totali) + parseFloat(totali)).toFixed(2)
                } else {
                    soma_totali = (parseFloat(soma_totali) + 0).toFixed(2)
                }
                if (totcmb > 0) {
                    soma_totcmb = (parseFloat(soma_totcmb) + parseFloat(totcmb)).toFixed(2)
                } else {
                    soma_totcmb = (parseFloat(soma_totcmb) + 0).toFixed(2)
                }
                if (tothtl > 0) {
                    soma_tothtl = (parseFloat(soma_tothtl) + parseFloat(tothtl)).toFixed(2)
                } else {
                    soma_tothtl = (parseFloat(soma_tothtl) + 0).toFixed(2)
                }

                //Custos Variáveis Estruturais
                if (valorCer > 0 || valorCen > 0 || valorPos > 0) {
                    soma_estkwp = parseFloat(soma_estkwp) + parseFloat(potencia)
                    soma_estfat = parseFloat(soma_estfat) + parseFloat(vlrNFS)
                } else {
                    soma_estkwp = parseFloat(soma_estkwp) + 0
                    soma_estfat = parseFloat(soma_estfat) + 0
                }
                if (valorCer > 0) {
                    soma_totcer = (parseFloat(soma_totcer) + parseFloat(valorCer)).toFixed(2)
                } else {
                    soma_totcer = (parseFloat(soma_totcer) + 0).toFixed(2)
                }
                if (valorCen > 0) {
                    soma_totcen = (parseFloat(soma_totcen) + parseFloat(valorCen)).toFixed(2)
                } else {
                    soma_totcen = (parseFloat(soma_totcen) + 0).toFixed(2)
                }
                if (valorPos > 0) {
                    soma_totpos = (parseFloat(soma_totpos) + parseFloat(valorPos)).toFixed(2)
                } else {
                    soma_totpos = (parseFloat(soma_totpos) + 0).toFixed(2)
                }

                if (parseFloat(valorMod) > 0) {
                    soma_equkwp = parseFloat(soma_equkwp) + parseFloat(potencia)
                }
                //Soma percentuais componentes
                //console.log('valorMod=>' + valorMod)
                if (valorMod != undefined) {
                    soma_modequ = (parseFloat(soma_modequ) + parseFloat(valorMod)).toFixed(2)
                }
                //console.log('soma_modequ=>' + soma_modequ)
                //console.log('valorInv=>' + valorInv)
                if (valorInv != undefined) {
                    soma_invequ = (parseFloat(soma_invequ) + parseFloat(valorInv)).toFixed(2)
                }
                //console.log('soma_invequ=>' + soma_invequ)
                //console.log('valorEst=>' + valorEst)
                if (valorEst != undefined) {
                    soma_estequ = (parseFloat(soma_estequ) + parseFloat(valorEst)).toFixed(2)
                }
                //console.log('soma_estequ=>' + soma_estequ)
                //console.log('valorCab=>' + valorCab)
                if (valorCab != undefined) {
                    soma_cabequ = (parseFloat(soma_cabequ) + parseFloat(valorCab)).toFixed(2)
                }
                //console.log('soma_cabequ=>' + soma_cabequ)
                //console.log('valorDis=>' + valorDis)
                if (valorDis != undefined) {
                    soma_disequ = (parseFloat(soma_disequ) + parseFloat(valorDis)).toFixed(2)
                }
                //console.log('soma_disequ=>' + soma_disequ)
                //console.log('valorDPS=>' + valorDPS)
                if (valorDPS != undefined) {
                    soma_dpsequ = (parseFloat(soma_dpsequ) + parseFloat(valorDPS)).toFixed(2)
                }
                //console.log('soma_dpsequ=>' + soma_dpsequ)
                //console.log('valorSB=>' + valorSB)
                if (valorSB != undefined) {
                    soma_sbxequ = (parseFloat(soma_sbxequ) + parseFloat(valorSB)).toFixed(2)
                }
                //console.log('soma_sbxequ=>' + soma_sbxequ)
                //console.log('valorOcp=>' + valorOcp)
                if (valorOcp != undefined) {
                    soma_ocpequ = (parseFloat(soma_ocpequ) + parseFloat(valorOcp)).toFixed(2)
                }
                //console.log('soma_ocpequ=>' + soma_ocpequ)

                //Totais: Projetos Vendidos, Faturamento e Lucro Líquido
                soma_totprj = (parseFloat(soma_totprj) + parseFloat(valor)).toFixed(2)
                soma_totliq = (parseFloat(soma_totliq) + parseFloat(lucroLiquido)).toFixed(2)
            }
        }


        if (isNaN(soma_totcer)) {
            soma_totcer = 0
        }
        if (isNaN(soma_totcen)) {
            soma_totcen = 0
        }
        if (isNaN(soma_totpos)) {
            soma_totpos = 0
        }

        soma_custoFix = parseFloat(soma_totint) + parseFloat(soma_totpro) + parseFloat(soma_totart) + parseFloat(soma_totges) + parseFloat(soma_tottrb) + parseFloat(soma_totcom) + parseFloat(soma_totadm)
        soma_custoVar = parseFloat(soma_totali) + parseFloat(soma_totdes) + parseFloat(soma_tothtl) + parseFloat(soma_totcmb)
        soma_custoEst = parseFloat(soma_totcer) + parseFloat(soma_totcen) + parseFloat(soma_totpos)

        //Soma Total Componentes
        soma_totequ = parseFloat(soma_modequ) + parseFloat(soma_invequ) + parseFloat(soma_estequ) + parseFloat(soma_cabequ) + parseFloat(soma_disequ) + parseFloat(soma_dpsequ) + parseFloat(soma_sbxequ) + parseFloat(soma_ocpequ)
        //Médias
        medkwp_totfat = (parseFloat(soma_totfat) / parseFloat(soma_totkwp)).toFixed(2)
        if (isNaN(medkwp_totfat)) {
            medkwp_totfat = 0
        }
        medkwp_totkit = (parseFloat(soma_totkit) / parseFloat(soma_totkwp)).toFixed(2)
        if (isNaN(medkwp_totkit)) {
            medkwp_totkit = 0
        }
        medkwp_totcop = (parseFloat(soma_totcop) / parseFloat(soma_totkwp)).toFixed(2)
        if (isNaN(medkwp_totcop)) {
            medkwp_totcop = 0
        }

        //Custos Fixos 
        medkwp_custoFix = (parseFloat(soma_custoFix) / parseFloat(soma_totkwp)).toFixed(2)
        if (isNaN(medkwp_custoFix)) {
            medkwp_custoFix = 0
        }
        medkwp_cusfat = (parseFloat(soma_totfat) / parseFloat(soma_totkwp)).toFixed(2)
        if (isNaN(medkwp_cusfat)) {
            medkwp_cusfat = 0
        }
        //Serviço
        medkwp_totint = (parseFloat(soma_totint) / parseFloat(soma_totkwp)).toFixed(2)
        if (isNaN(medkwp_totint)) {
            medkwp_totint = 0
        }
        medkwp_totpro = (parseFloat(soma_totpro) / parseFloat(soma_totkwp)).toFixed(2)
        if (isNaN(medkwp_totpro)) {
            medkwp_totpro = 0
        }
        medkwp_totges = (parseFloat(soma_totges) / parseFloat(soma_totkwp)).toFixed(2)
        if (isNaN(medkwp_totges)) {
            medkwp_totges = 0
        }
        medkwp_totart = (parseFloat(soma_totart) / parseFloat(soma_totkwp)).toFixed(2)
        if (isNaN(medkwp_totart)) {
            medkwp_totart = 0
        }
        //Tributos
        medkwp_tottrb = (parseFloat(soma_tottrb) / parseFloat(soma_totkwp)).toFixed(2)
        if (isNaN(medkwp_tottrb)) {
            medkwp_tottrb = 0
        }
        //Comissão
        medkwp_totcom = (parseFloat(soma_totcom) / parseFloat(soma_totkwp)).toFixed(2)
        if (isNaN(medkwp_totcom)) {
            medkwp_totcom = 0
        }
        //Despesas Administrativas
        medkwp_totadm = (parseFloat(soma_totadm) / parseFloat(soma_totkwp)).toFixed(2)
        if (isNaN(medkwp_totadm)) {
            medkwp_totadm = 0
        }
        //Custos Variáveis
        medkwp_custoVar = (parseFloat(soma_custoVar) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_custoVar)) {
            medkwp_custoVar = 0
        }
        medkwp_varfat = (parseFloat(soma_varfat) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_varfat)) {
            medkwp_varfat = 0
        }
        medkwp_totdes = ((parseFloat(soma_totdes) + parseFloat(soma_tothtl) + parseFloat(soma_totcmb)) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_totdes)) {
            medkwp_totdes = 0
        }
        medkwp_totali = (parseFloat(soma_totali) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_totali)) {
            medkwp_totali = 0
        }
        medkwp_tothtl = (parseFloat(soma_tothtl) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_tothtl)) {
            medkwp_tothtl = 0
        }
        medkwp_totcmb = (parseFloat(soma_totcmb) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_totcmb)) {
            medkwp_totcmb = 0
        }

        //Custos Variáveis Estruturais
        if (parseFloat(soma_estkwp) > 0) {
            medkwp_custoEst = (parseFloat(soma_custoEst) / parseFloat(soma_estkwp)).toFixed(2)
            medkwp_estfat = (parseFloat(soma_estfat) / parseFloat(soma_estkwp)).toFixed(2)
            medkwp_totcer = (parseFloat(soma_totcer) / parseFloat(soma_estkwp)).toFixed(2)
            medkwp_totcen = (parseFloat(soma_totcen) / parseFloat(soma_estkwp)).toFixed(2)
            medkwp_totpos = (parseFloat(soma_totpos) / parseFloat(soma_estkwp)).toFixed(2)
        }

        //Custos Fixos
        per_totpro = (parseFloat(medkwp_totpro) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_totpro)) {
            per_totpro = 0
        }
        per_totart = (parseFloat(medkwp_totart) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_totart)) {
            per_totart = 0
        }
        per_totges = (parseFloat(medkwp_totges) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_totges)) {
            per_totges = 0
        }
        per_totint = (parseFloat(medkwp_totint) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_totint)) {
            per_totint = 0
        }
        per_totadm = (parseFloat(medkwp_totadm) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_totadm)) {
            per_totadm = 0
        }
        per_totcom = (parseFloat(medkwp_totcom) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_totcom)) {
            per_totcom = 0
        }
        per_tottrb = (parseFloat(medkwp_tottrb) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_tottrb)) {
            per_tottrb = 0
        }
        per_custoFix = (parseFloat(medkwp_custoFix) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_custoFix)) {
            per_custoFix = 0
        }
        //Custos Variáveis
        per_totali = (parseFloat(medkwp_totali) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_totali)) {
            per_totali = 0
        }
        per_totdes = (parseFloat(medkwp_totdes) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_totdes)) {
            per_totdes = 0
        }
        per_tothtl = (parseFloat(medkwp_tothtl) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_tothtl)) {
            per_tothtl = 0
        }
        per_totcmb = (parseFloat(medkwp_totcmb) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_totcmb)) {
            per_totcmb = 0
        }
        per_custoVar = (parseFloat(medkwp_custoVar) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_custoVar)) {
            per_custoVar = 0
        }
        //Custos Variáveis Estruturais
        per_totcen = (parseFloat(medkwp_totcen) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_totcen)) {
            per_totcen = 0
        }
        per_totcer = (parseFloat(medkwp_totcer) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_totcer)) {
            per_totcer = 0
        }
        per_totpos = (parseFloat(medkwp_totpos) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_totpos)) {
            per_totpos = 0
        }
        per_custoEst = (parseFloat(medkwp_custoEst) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_custoEst)) {
            per_custoEst = 0
        }

        //Médias de total faturado por kit e por serviços
        soma_totser = (parseFloat(medkwp_custoFix) + parseFloat(medkwp_custoVar) + parseFloat(medkwp_custoEst)).toFixed(2)
        //Lucro Liquido x Gastos
        per_totliq = ((parseFloat(soma_totliq) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_dispendio = (100 - parseFloat(per_totliq)).toFixed(2)
        //Participação dos equipamento, custos e despesas
        per_kitfat = ((parseFloat(soma_totkit) / parseFloat(soma_totfat)) * 100).toFixed(2)
        if (isNaN(per_kitfat)) {
            per_kitfat = 0
        }
        per_comfat = ((parseFloat(soma_totcom) / parseFloat(soma_totfat)) * 100).toFixed(2)
        if (isNaN(per_comfat)) {
            per_comfat = 0
        }
        per_cusfat = ((parseFloat(soma_totcop) / parseFloat(soma_totfat)) * 100).toFixed(2)
        if (isNaN(per_cusfat)) {
            per_cusfat = 0
        }
        per_desfat = ((parseFloat(soma_totadm) / parseFloat(soma_totfat)) * 100).toFixed(2)
        if (isNaN(per_desfat)) {
            per_desfat = 0
        }
        per_trbfat = ((parseFloat(soma_tottrb) / parseFloat(soma_totfat)) * 100).toFixed(2)
        if (isNaN(per_trbfat)) {
            per_trbfat = 0
        }
        //Média componentes
        med_modequ = (parseFloat(soma_modequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_invequ = (parseFloat(soma_invequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_estequ = (parseFloat(soma_estequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_cabequ = (parseFloat(soma_cabequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_dpsequ = (parseFloat(soma_dpsequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_disequ = (parseFloat(soma_disequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_sbxequ = (parseFloat(soma_sbxequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_ocpequ = (parseFloat(soma_ocpequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_totequ = (parseFloat(soma_totequ) / parseFloat(soma_equkwp)).toFixed(2)
        //Percentual componentes
        per_modequ = ((parseFloat(soma_modequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_invequ = ((parseFloat(soma_invequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_estequ = ((parseFloat(soma_estequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_cabequ = ((parseFloat(soma_cabequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_disequ = ((parseFloat(soma_disequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_dpsequ = ((parseFloat(soma_dpsequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_sbxequ = ((parseFloat(soma_sbxequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_ocpequ = ((parseFloat(soma_ocpequ) / parseFloat(soma_totequ)) * 100).toFixed(2)

        res.render('relatorios/dashboardcustoscomkit', {
            soma_totkwp, soma_varkwp, soma_estkwp,
            soma_totfat, soma_totcop,

            soma_totint, soma_totpro, soma_totges, soma_totadm, soma_totcom, soma_tottrb, soma_totart,
            soma_custoFix, soma_totdes, soma_totali, soma_totcmb, soma_tothtl, soma_custoVar,
            soma_varfat, soma_totcer, soma_totcen, soma_totpos, soma_custoEst, soma_estfat,

            soma_totkit, soma_totprj, soma_totliq, soma_totser,

            medkwp_totint, medkwp_totpro, medkwp_totges, medkwp_totadm, medkwp_totcom, medkwp_totart,
            medkwp_tottrb, medkwp_custoFix, medkwp_cusfat, medkwp_totdes, medkwp_totali, medkwp_totcmb, medkwp_tothtl,
            medkwp_custoVar, medkwp_varfat, medkwp_totcer, medkwp_totcen, medkwp_totpos, medkwp_totcop,
            medkwp_custoEst, medkwp_estfat, medkwp_totfat, medkwp_totkit,

            per_totpro, per_totart, per_totges, per_totint, per_totadm, per_totcom, per_tottrb, per_custoFix,
            per_totali, per_totdes, per_totcmb, per_tothtl, per_custoVar, per_totcen, per_totcer, per_totpos, per_custoEst,

            numprj, per_totliq, per_dispendio, per_kitfat, per_comfat, per_cusfat, per_desfat, per_trbfat,

            soma_modequ, soma_invequ, soma_estequ, soma_cabequ, soma_dpsequ, soma_disequ, soma_sbxequ, soma_ocpequ, soma_totequ,
            per_modequ, per_invequ, per_estequ, per_cabequ, per_dpsequ, per_disequ, per_sbxequ, per_ocpequ,
            med_modequ, med_invequ, med_estequ, med_cabequ, med_dpsequ, med_disequ, med_sbxequ, med_ocpequ, med_totequ
        })

    })
})

router.get('/dashboardcustossemkit', ehAdmin, (req, res) => {
    const { _id } = req.user

    var numprj = 0
    var soma_totfat = 0

    var soma_totcop = 0
    var soma_totkit = 0
    var soma_totprj = 0
    var soma_totliq = 0
    var soma_totser = 0

    var soma_totkwp = 0
    var soma_equkwp = 0
    var soma_varkwp = 0
    var soma_estkwp = 0

    //Custos Fixos
    var soma_custoFix = 0
    //Serviço
    var soma_totint = 0
    var soma_totpro = 0
    var soma_totges = 0
    var soma_totart = 0
    //Despesas Administrativas
    var soma_totadm = 0
    //Comissões
    var soma_totcom = 0
    //Tributos
    var soma_tottrb = 0
    //Custos Variáveis
    var soma_varfat = 0
    var soma_custoVar = 0
    var soma_totdes = 0
    var soma_totali = 0
    var soma_totcmb = 0
    var soma_tothtl = 0
    //Custos Variáveis Estruturais
    var soma_estfat = 0
    var soma_custoEst = 0
    var soma_totcer = 0
    var soma_totcen = 0
    var soma_totpos = 0

    //Médias
    var medkwp_totfat = 0
    var medkwp_totcop = 0
    //Custos Fixos
    var medkwp_cusfat = 0
    var medkwp_custoFix = 0
    //Serviço
    var medkwp_totint = 0
    var medkwp_totpro = 0
    var medkwp_totges = 0
    var medkwp_totart = 0
    //Despesas Administrativas
    var medkwp_totadm = 0
    //Comissões
    var medkwp_totcom = 0
    //Tributos
    var medkwp_tottrb = 0
    //Despesas Variáveis
    var medkwp_totdes = 0
    var medkwp_totali = 0
    var medkwp_tothtl = 0
    var medkwp_totcmb = 0
    var medkwp_custoVar = 0
    var medkwp_varfat = 0
    //Despesas Variáveis Estruturais
    var medkwp_estfat = 0
    var medkwp_custoEst = 0
    var medkwp_totcer = 0
    var medkwp_totcen = 0
    var medkwp_totpos = 0

    //Custos Fixos
    var per_custoFix = 0
    //Serviço
    var per_totint = 0
    var per_totpro = 0
    var per_totges = 0
    var per_totart = 0
    //Despesas Administrativas
    var per_totadm = 0
    //Comissões
    var per_totcom = 0
    //Tributos
    var per_tottrb = 0
    //Despesas Variáveis
    var per_totdes = 0
    var per_totali = 0
    var per_tothtl = 0
    var per_totcmb = 0
    var per_custoVar = 0
    //Despesas Variáveis Estruturais
    var per_custoEst = 0
    var per_totcer = 0
    var per_totcen = 0
    var per_totpos = 0

    var per_totliq
    var per_dispendio
    var per_kitfat
    var per_comfat
    var per_cusfat
    var per_desfat
    var per_trbfat

    //Percentuais Componentes
    var soma_modequ = 0
    var soma_invequ = 0
    var soma_estequ = 0
    var soma_cabequ = 0
    var soma_dpsequ = 0
    var soma_disequ = 0
    var soma_sbxequ = 0
    var soma_ocpequ = 0

    var soma_totequ = 0
    var per_modequ = 0
    var per_invequ = 0
    var per_estequ = 0
    var per_cabequ = 0
    var per_dpsequ = 0
    var per_disequ = 0
    var per_sbxequ = 0
    var per_ocpequ = 0
    var med_modequ = 0
    var med_invequ = 0
    var med_estequ = 0
    var med_cabequ = 0
    var med_dpsequ = 0
    var med_disequ = 0
    var med_sbxequ = 0
    var med_ocpequ = 0
    var med_totequ = 0

    Realizado.find({ user: _id }).lean().then((realizado) => {

        for (i = 0; i < realizado.length; i++) {

            //Contar projetos por mês
            /*
            const { datareg } = realizado[i]

            if (datareg != undefined) {
                //Janeiro
                if (datareg >= 20210101 && datareg <= 20210131) {
                    prjjan += 1
                }
                //Fevereiro
                if (datareg >= 20210201 && datareg <= 20210228) {
                    prjfev += 1
                }
                //Março
                if (datareg >= 20210301 && datareg <= 20210331) {
                    prjmar += 1
                }
                //Abril
                if (datareg >= 20210401 && datareg <= 20210430) {
                    prjabr += 1
                }
                //Maio
                if (datareg >= 20210501 && datareg <= 20210530) {
                    prjmai = +1
                }
                //Junho
                if (datareg >= 20210601 && datareg <= 20210631) {
                    prjjun = +1
                }
                //Julho
                if (datareg >= 20210701 && datareg <= 20210730) {
                    prjjul = +1
                }
                //Agosto
                if (datareg >= 20210801 && datareg <= 20210831) {
                    prjago = +1
                }
                //Setembro
                if (datareg >= 20210901 && datareg <= 20210930) {
                    prjset = +1
                }
                //Outubro
                if (datareg >= 20211001 && datareg <= 20211031) {
                    prjout = +1
                }
                //Novembro
                if (datareg >= 20211101 && datareg <= 20211130) {
                    prjnov = +1
                }
                //Dezembro
                if (datareg >= 20211201 && datareg <= 20211231) {
                    prjdez = +1
                }
            }
            */

            const { potencia } = realizado[i]
            const { fatequ } = realizado[i]
            const { vlrkit } = realizado[i]
            const { valor } = realizado[i]
            const { vlrNFS } = realizado[i]
            const { custoPlano } = realizado[i]
            const { lucroLiquido } = realizado[i]

            //Custos Fixos
            //Serviços
            const { totpro } = realizado[i]
            const { totges } = realizado[i]
            const { totint } = realizado[i]
            const { vlrart } = realizado[i]
            //Administrativo
            const { desAdm } = realizado[i]
            //Comissão
            const { vlrcom } = realizado[i]
            //Tributos
            const { totalTributos } = realizado[i]
            //Custo Variável
            const { totdes } = realizado[i]
            const { totali } = realizado[i]
            const { totcmb } = realizado[i]
            const { tothtl } = realizado[i]
            //Custo Variavel Estrutural
            const { valorCer } = realizado[i]
            const { valorCen } = realizado[i]
            const { valorPos } = realizado[i]

            //Percentuais Conmponentes
            const { valorMod } = realizado[i]
            const { valorInv } = realizado[i]
            const { valorEst } = realizado[i]
            const { valorCab } = realizado[i]
            const { valorDis } = realizado[i]
            const { valorDPS } = realizado[i]
            const { valorSB } = realizado[i]
            const { valorOcp } = realizado[i]
            const { foiRealizado } = realizado[i]


            if (fatequ == false) {

                numprj++

                soma_totkwp = (parseFloat(soma_totkwp) + parseFloat(potencia)).toFixed(2)
                soma_totcop = (parseFloat(soma_totcop) + parseFloat(custoPlano)).toFixed(2)
                //Totalizador de Faturamento            
                soma_totfat = parseFloat(soma_totfat) + parseFloat(vlrNFS)
                //Totalizador de Kit   
                soma_totkit = parseFloat(soma_totkit) + parseFloat(vlrkit)

                //Custos Fixos 
                //Serviços
                if (totint > 0) {
                    soma_totint = (parseFloat(soma_totint) + parseFloat(totint)).toFixed(2)
                } else {
                    soma_totint = (parseFloat(soma_totint) + 0).toFixed(2)
                }
                if (totpro > 0) {
                    soma_totpro = (parseFloat(soma_totpro) + parseFloat(totpro)).toFixed(2)
                } else {
                    soma_totpro = (parseFloat(soma_totpro) + 0).toFixed(2)
                }
                if (totges > 0) {
                    soma_totges = (parseFloat(soma_totges) + parseFloat(totges)).toFixed(2)
                } else {
                    soma_totges = (parseFloat(soma_totges) + 0).toFixed(2)
                }
                if (vlrart > 0) {
                    soma_totart = (parseFloat(soma_totart) + parseFloat(vlrart)).toFixed(2)
                } else {
                    soma_totart = (parseFloat(soma_totart) + 0).toFixed(2)
                }
                //Tributos
                soma_tottrb = (parseFloat(soma_tottrb) + parseFloat(totalTributos)).toFixed(2)
                //Comissão
                soma_totcom = (parseFloat(soma_totcom) + parseFloat(vlrcom)).toFixed(2)
                //Despesas Administrativas
                if (desAdm != undefined) {
                    soma_totadm = (parseFloat(soma_totadm) + parseFloat(desAdm)).toFixed(2)
                }

                //Custos Variáveis
                if (totdes > 0 || totali > 0 || totcmb > 0 || tothtl > 0) {
                    soma_varkwp = parseFloat(soma_varkwp) + parseFloat(potencia)
                    //console.log('soma_varkwp=>' + soma_varkwp)
                    soma_varfat = parseFloat(soma_varfat) + parseFloat(vlrNFS)
                }
                if (totdes > 0) {
                    soma_totdes = (parseFloat(soma_totdes) + parseFloat(totdes)).toFixed(2)
                } else {
                    soma_totdes = (parseFloat(soma_totdes) + 0).toFixed(2)
                }
                if (totali > 0) {
                    soma_totali = (parseFloat(soma_totali) + parseFloat(totali)).toFixed(2)
                } else {
                    soma_totali = (parseFloat(soma_totali) + 0).toFixed(2)
                }
                if (totcmb > 0) {
                    soma_totcmb = (parseFloat(soma_totcmb) + parseFloat(totcmb)).toFixed(2)
                } else {
                    soma_totcmb = (parseFloat(soma_totcmb) + 0).toFixed(2)
                }
                if (tothtl > 0) {
                    soma_tothtl = (parseFloat(soma_tothtl) + parseFloat(tothtl)).toFixed(2)
                } else {
                    soma_tothtl = (parseFloat(soma_tothtl) + 0).toFixed(2)
                }

                //Custos Variáveis Estruturais
                if (valorCer > 0 || valorCen > 0 || valorPos > 0) {
                    soma_estkwp = parseFloat(soma_estkwp) + parseFloat(potencia)
                    soma_estfat = parseFloat(soma_estfat) + parseFloat(vlrNFS)
                } else {
                    soma_estkwp = parseFloat(soma_estkwp) + 0
                    soma_estfat = parseFloat(soma_estfat) + 0
                }
                if (valorCer > 0) {
                    soma_totcer = (parseFloat(soma_totcer) + parseFloat(valorCer)).toFixed(2)
                } else {
                    soma_totcer = (parseFloat(soma_totcer) + 0).toFixed(2)
                }
                if (valorCen > 0) {
                    soma_totcen = (parseFloat(soma_totcen) + parseFloat(valorCen)).toFixed(2)
                } else {
                    soma_totcen = (parseFloat(soma_totcen) + 0).toFixed(2)
                }
                if (valorPos > 0) {
                    soma_totpos = (parseFloat(soma_totpos) + parseFloat(valorPos)).toFixed(2)
                } else {
                    soma_totpos = (parseFloat(soma_totpos) + 0).toFixed(2)
                }


                if (parseFloat(valorMod) > 0) {
                    soma_equkwp = parseFloat(soma_equkwp) + parseFloat(potencia)
                }
                //Soma percentuais componentes
                //console.log('valorMod=>' + valorMod)
                if (valorMod != undefined) {
                    soma_modequ = (parseFloat(soma_modequ) + parseFloat(valorMod)).toFixed(2)
                }
                //console.log('soma_modequ=>' + soma_modequ)
                //console.log('valorInv=>' + valorInv)
                if (valorInv != undefined) {
                    soma_invequ = (parseFloat(soma_invequ) + parseFloat(valorInv)).toFixed(2)
                }
                //console.log('soma_invequ=>' + soma_invequ)
                //console.log('valorEst=>' + valorEst)
                if (valorEst != undefined) {
                    soma_estequ = (parseFloat(soma_estequ) + parseFloat(valorEst)).toFixed(2)
                }
                //console.log('soma_estequ=>' + soma_estequ)
                //console.log('valorCab=>' + valorCab)
                if (valorCab != undefined) {
                    soma_cabequ = (parseFloat(soma_cabequ) + parseFloat(valorCab)).toFixed(2)
                }
                //console.log('soma_cabequ=>' + soma_cabequ)
                //console.log('valorDis=>' + valorDis)
                if (valorDis != undefined) {
                    soma_disequ = (parseFloat(soma_disequ) + parseFloat(valorDis)).toFixed(2)
                }
                //console.log('soma_disequ=>' + soma_disequ)
                //console.log('valorDPS=>' + valorDPS)
                if (valorDPS != undefined) {
                    soma_dpsequ = (parseFloat(soma_dpsequ) + parseFloat(valorDPS)).toFixed(2)
                }
                //console.log('soma_dpsequ=>' + soma_dpsequ)
                //console.log('valorSB=>' + valorSB)
                if (valorSB != undefined) {
                    soma_sbxequ = (parseFloat(soma_sbxequ) + parseFloat(valorSB)).toFixed(2)
                }
                //console.log('soma_sbxequ=>' + soma_sbxequ)
                //console.log('valorOcp=>' + valorOcp)
                if (valorOcp != undefined) {
                    soma_ocpequ = (parseFloat(soma_ocpequ) + parseFloat(valorOcp)).toFixed(2)
                }
                //console.log('soma_ocpequ=>' + soma_ocpequ)

                //Totais: Projetos Vendidos, Faturamento e Lucro Líquido
                soma_totprj = (parseFloat(soma_totprj) + parseFloat(valor)).toFixed(2)
                soma_totliq = (parseFloat(soma_totliq) + parseFloat(lucroLiquido)).toFixed(2)
            }
        }

        if (isNaN(soma_totcer)) {
            soma_totcer = 0
        }
        if (isNaN(soma_totcen)) {
            soma_totcen = 0
        }
        if (isNaN(soma_totpos)) {
            soma_totpos = 0
        }
        soma_custoFix = parseFloat(soma_totint) + parseFloat(soma_totpro) + parseFloat(soma_totart) + parseFloat(soma_totges) + parseFloat(soma_tottrb) + parseFloat(soma_totcom) + parseFloat(soma_totadm)
        soma_custoVar = parseFloat(soma_totali) + parseFloat(soma_totdes) + parseFloat(soma_tothtl) + parseFloat(soma_totcmb)
        soma_custoEst = parseFloat(soma_totcer) + parseFloat(soma_totcen) + parseFloat(soma_totpos)

        //Soma Total Componentes
        soma_totequ = parseFloat(soma_modequ) + parseFloat(soma_invequ) + parseFloat(soma_estequ) + parseFloat(soma_cabequ) + parseFloat(soma_disequ) + parseFloat(soma_dpsequ) + parseFloat(soma_sbxequ) + parseFloat(soma_ocpequ)
        //Médias
        medkwp_totfat = (parseFloat(soma_totfat) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totcop = (parseFloat(soma_totcop) / parseFloat(soma_totkwp)).toFixed(2)
        //Custos Fixos 
        medkwp_custoFix = (parseFloat(soma_custoFix) / parseFloat(soma_totkwp)).toFixed(2)
        if (isNaN(medkwp_custoFix)) {
            medkwp_custoFix = 0
        }
        medkwp_cusfat = (parseFloat(soma_totfat) / parseFloat(soma_totkwp)).toFixed(2)
        //Serviço
        medkwp_totint = (parseFloat(soma_totint) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totpro = (parseFloat(soma_totpro) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totges = (parseFloat(soma_totges) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totart = (parseFloat(soma_totart) / parseFloat(soma_totkwp)).toFixed(2)
        //Tributos
        medkwp_tottrb = (parseFloat(soma_tottrb) / parseFloat(soma_totkwp)).toFixed(2)
        //Comissão
        medkwp_totcom = (parseFloat(soma_totcom) / parseFloat(soma_totkwp)).toFixed(2)
        //Despesas Administrativas
        medkwp_totadm = (parseFloat(soma_totadm) / parseFloat(soma_totkwp)).toFixed(2)
        //Custos Variáveis
        medkwp_custoVar = (parseFloat(soma_custoVar) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_custoVar)) {
            medkwp_custoVar = 0
        }
        medkwp_varfat = (parseFloat(soma_varfat) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_varfat)) {
            medkwp_varfat = 0
        }
        medkwp_totdes = ((parseFloat(soma_totdes) + parseFloat(soma_tothtl) + parseFloat(soma_totcmb)) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_totdes)) {
            medkwp_totdes = 0
        }
        medkwp_totali = (parseFloat(soma_totali) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_totali)) {
            medkwp_totali = 0
        }
        medkwp_tothtl = (parseFloat(soma_tothtl) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_tothtl)) {
            medkwp_tothtl = 0
        }
        medkwp_totcmb = (parseFloat(soma_totcmb) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_totcmb)) {
            medkwp_totcmb = 0
        }

        //Custos Variáveis Estruturais
        if (parseFloat(soma_estkwp) > 0) {
            medkwp_custoEst = (parseFloat(soma_custoEst) / parseFloat(soma_estkwp)).toFixed(2)
            medkwp_estfat = (parseFloat(soma_estfat) / parseFloat(soma_estkwp)).toFixed(2)
            medkwp_totcer = (parseFloat(soma_totcer) / parseFloat(soma_estkwp)).toFixed(2)
            medkwp_totcen = (parseFloat(soma_totcen) / parseFloat(soma_estkwp)).toFixed(2)
            medkwp_totpos = (parseFloat(soma_totpos) / parseFloat(soma_estkwp)).toFixed(2)
        }
        //Custos Fixos
        per_totpro = (parseFloat(medkwp_totpro) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_totpro)) {
            per_totpro = 0
        }
        per_totart = (parseFloat(medkwp_totart) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_totart)) {
            per_totart = 0
        }
        per_totges = (parseFloat(medkwp_totges) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_totges)) {
            per_totges = 0
        }
        per_totint = (parseFloat(medkwp_totint) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_totint)) {
            per_totint = 0
        }
        per_totadm = (parseFloat(medkwp_totadm) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_totadm)) {
            per_totadm = 0
        }
        per_totcom = (parseFloat(medkwp_totcom) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_totcom)) {
            per_totcom = 0
        }
        per_tottrb = (parseFloat(medkwp_tottrb) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_tottrb)) {
            per_tottrb = 0
        }
        per_custoFix = (parseFloat(medkwp_custoFix) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        if (isNaN(per_custoFix)) {
            per_custoFix = 0
        }
        //Custos Variáveis
        per_totali = (parseFloat(medkwp_totali) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totdes = (parseFloat(medkwp_totdes) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_tothtl = (parseFloat(medkwp_tothtl) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totcmb = (parseFloat(medkwp_totcmb) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_custoVar = (parseFloat(medkwp_custoVar) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        //Custos Variáveis Estruturais
        per_totcen = (parseFloat(medkwp_totcen) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totcer = (parseFloat(medkwp_totcer) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totpos = (parseFloat(medkwp_totpos) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_custoEst = (parseFloat(medkwp_custoEst) / parseFloat(medkwp_cusfat) * 100).toFixed(2)

        //Médias de total faturado por kit e por serviços
        soma_totser = (parseFloat(medkwp_custoFix) + parseFloat(medkwp_custoVar) + parseFloat(medkwp_custoEst)).toFixed(2)
        //Lucro Liquido x Gastos
        per_totliq = ((parseFloat(soma_totliq) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_dispendio = (100 - parseFloat(per_totliq)).toFixed(2)
        //Participação dos equipamento, custos e despesas
        per_kitfat = ((parseFloat(soma_totkit) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_comfat = ((parseFloat(soma_totcom) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_cusfat = ((parseFloat(soma_totcop) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_desfat = ((parseFloat(soma_totadm) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_trbfat = ((parseFloat(soma_tottrb) / parseFloat(soma_totfat)) * 100).toFixed(2)
        //Média componentes
        med_modequ = (parseFloat(soma_modequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_invequ = (parseFloat(soma_invequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_estequ = (parseFloat(soma_estequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_cabequ = (parseFloat(soma_cabequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_dpsequ = (parseFloat(soma_dpsequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_disequ = (parseFloat(soma_disequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_sbxequ = (parseFloat(soma_sbxequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_ocpequ = (parseFloat(soma_ocpequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_totequ = (parseFloat(soma_totequ) / parseFloat(soma_equkwp)).toFixed(2)
        //Percentual componentes
        per_modequ = ((parseFloat(soma_modequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_invequ = ((parseFloat(soma_invequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_estequ = ((parseFloat(soma_estequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_cabequ = ((parseFloat(soma_cabequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_disequ = ((parseFloat(soma_disequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_dpsequ = ((parseFloat(soma_dpsequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_sbxequ = ((parseFloat(soma_sbxequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_ocpequ = ((parseFloat(soma_ocpequ) / parseFloat(soma_totequ)) * 100).toFixed(2)

        res.render('relatorios/dashboardcustossemkit', {
            soma_totkwp, soma_varkwp, soma_estkwp,
            soma_totfat, soma_totcop,

            soma_totint, soma_totpro, soma_totges, soma_totadm, soma_totcom, soma_tottrb, soma_totart,
            soma_custoFix, soma_totdes, soma_totali, soma_totcmb, soma_tothtl, soma_custoVar,
            soma_varfat, soma_totcer, soma_totcen, soma_totpos, soma_custoEst, soma_estfat,

            soma_totkit, soma_totprj, soma_totliq, soma_totser,

            medkwp_totint, medkwp_totpro, medkwp_totges, medkwp_totadm, medkwp_totcom, medkwp_totart,
            medkwp_tottrb, medkwp_custoFix, medkwp_cusfat, medkwp_totdes, medkwp_totali, medkwp_totcmb,
            medkwp_tothtl, medkwp_custoVar, medkwp_varfat, medkwp_totcer, medkwp_totcen, medkwp_totpos,
            medkwp_totcop, medkwp_custoEst, medkwp_estfat, medkwp_totfat,

            per_totpro, per_totart, per_totges, per_totint, per_totadm, per_totcom, per_tottrb, per_custoFix,
            per_totali, per_totdes, per_tothtl, per_totcmb, per_custoVar, per_totcen, per_totcer, per_totpos, per_custoEst,

            numprj, per_totliq, per_dispendio, per_kitfat, per_comfat, per_cusfat, per_desfat, per_trbfat,

            soma_modequ, soma_invequ, soma_estequ, soma_cabequ, soma_dpsequ, soma_disequ, soma_sbxequ, soma_ocpequ, soma_totequ,
            per_modequ, per_invequ, per_estequ, per_cabequ, per_dpsequ, per_disequ, per_sbxequ, per_ocpequ,
            med_modequ, med_invequ, med_estequ, med_cabequ, med_dpsequ, med_disequ, med_sbxequ, med_ocpequ, med_totequ
        })

    })
})

router.get('/dashboardbi', ehAdmin, (req, res) => {
    const { _id } = req.user
    var checkKwp
    var checkQtd
    var checkFat
    var fatrural = 0
    var fatresid = 0
    var fatcomer = 0
    var fatindus = 0
    var fatmono = 0
    var fatbifa = 0
    var fattrif = 0
    var fatnivel1 = 0
    var fatnivel2 = 0
    var fatnivel3 = 0
    var fatnivel4 = 0
    var fatnivel5 = 0
    var fatnivel6 = 0
    var fatsolo = 0
    var fattelhado = 0

    checkFat = 'checked'
    checkKwp = 'unchecked'
    checkQtd = 'unchecked'
    Projetos.find({ user: _id, $or: [{ 'classUsina': 'Rural' }, { 'classUsina': 'Rural Residencial' }, { 'classUsina': 'Rural Granja' }, { 'classUsina': 'Rural Irrigação' }] }).then((rural) => {
        for (i = 0; i < rural.length; i++) {
            fatrural = fatrural + parseFloat(rural[i].vlrNFS)
        }
        Projetos.find({ user: _id, classUsina: 'Residencial' }).then((residencial) => {
            for (i = 0; i < residencial.length; i++) {
                fatresid = fatresid + parseFloat(residencial[i].vlrNFS)
            }
            Projetos.find({ user: _id, classUsina: 'Comercial' }).then((comercial) => {
                for (i = 0; i < comercial.length; i++) {
                    fatcomer = fatcomer + parseFloat(comercial[i].vlrNFS)
                }
                Projetos.find({ user: _id, classUsina: 'Industrial' }).then((industrial) => {
                    for (i = 0; i < industrial.length; i++) {
                        fatindus = fatindus + parseFloat(industrial[i].vlrNFS)
                    }
                    Projetos.find({ user: _id, $or: [{ 'tipoUsina': 'Solo Concreto' }, { 'tipoUsina': 'Solo Metal' }, { 'tipoUsina': 'Laje' }] }).then((solo) => {
                        for (i = 0; i < solo.length; i++) {
                            fatsolo = fatsolo + parseFloat(solo[i].vlrNFS)
                        }
                        Projetos.find({ user: _id, $or: [{ 'tipoUsina': 'Telhado Fibrocimento' }, { 'tipoUsina': 'Telhado Madeira' }, { 'tipoUsina': 'Telhado Cerâmica' }, { 'tipoUsina': 'Telhado Gambrel' }, { 'tipoUsina': 'Telhado Metálico' }] }).then((telhado) => {
                            for (i = 0; i < telhado.length; i++) {
                                fattelhado = fattelhado + parseFloat(telhado[i].vlrNFS)
                            }
                            Projetos.find({ user: _id, $or: [{ 'tipoConexao': 'Monofásico 127V' }, { 'tipoConexao': 'Monofásico 220V' }] }).then((monofasico) => {
                                for (i = 0; i < monofasico.length; i++) {
                                    fatmono = fatmono + parseFloat(monofasico[i].vlrNFS)
                                }
                                Projetos.find({ user: _id, tipoConexao: 'Bifásico 220V' }).then((bifasico) => {
                                    for (i = 0; i < bifasico.length; i++) {
                                        fatbifa = fatbifa + parseFloat(bifasico[i].vlrNFS)
                                    }
                                    Projetos.find({ user: _id, $or: [{ 'tipoConexao': 'Trifásico 220V' }, { 'tipoConexao': 'Trifásico 380V' }] }).then((trifasico) => {
                                        for (i = 0; i < trifasico.length; i++) {
                                            fattrif = fattrif + parseFloat(trifasico[i].vlrNFS)
                                        }
                                        Projetos.find({ user: _id, 'potencia': { $lte: 10 } }).then((nivel1) => {
                                            for (i = 0; i < nivel1.length; i++) {
                                                fatnivel1 = fatnivel1 + parseFloat(nivel1[i].vlrNFS)
                                            }
                                            Projetos.find({ user: _id, 'potencia': { $lte: 30, $gte: 11 } }).then((nivel2) => {
                                                for (i = 0; i < nivel2.length; i++) {
                                                    fatnivel2 = fatnivel2 + parseFloat(nivel2[i].vlrNFS)
                                                }
                                                Projetos.find({ user: _id, 'potencia': { $lte: 50, $gte: 31 } }).then((nivel3) => {
                                                    for (i = 0; i < nivel3.length; i++) {
                                                        fatnivel3 = fatnivel3 + parseFloat(nivel3[i].vlrNFS)
                                                    }
                                                    Projetos.find({ user: _id, 'potencia': { $lte: 100, $gte: 51 } }).then((nivel4) => {
                                                        for (i = 0; i < nivel4.length; i++) {
                                                            fatnivel4 = fatnivel4 + parseFloat(nivel4[i].vlrNFS)
                                                        }
                                                        Projetos.find({ user: _id, 'potencia': { $lte: 150, $gte: 101 } }).then((nivel5) => {
                                                            for (i = 0; i < nivel5.length; i++) {
                                                                fatnivel5 = fatnivel5 + parseFloat(nivel5[i].vlrNFS)
                                                            }
                                                            Projetos.find({ user: _id, 'potencia': { $lte: 200, $gte: 151 } }).then((nivel6) => {
                                                                for (i = 0; i < nivel6.length; i++) {
                                                                    fatnivel6 = fatnivel6 + parseFloat(nivel6[i].vlrNFS)
                                                                }
                                                                res.render('relatorios/dashboardbi', { checkFat, checkKwp, checkQtd, fatrural, fatresid, fatcomer, fatindus, fatsolo, fattelhado, fatmono, fatbifa, fattrif, fatnivel1, fatnivel2, fatnivel3, fatnivel4, fatnivel5, fatnivel6 })
                                                            }).catch((err) => {
                                                                req.flash('error_msg', 'Falha ao encontrar usinas nivel 6.')
                                                                res.redirect('/relatorios/dashboardbi')
                                                            })
                                                        }).catch((err) => {
                                                            req.flash('error_msg', 'Falha ao encontrar usinas nivel 5.')
                                                            res.redirect('/relatorios/dashboardbi')
                                                        })
                                                    }).catch((err) => {
                                                        req.flash('error_msg', 'Falha ao encontrar usinas nivel 4.')
                                                        res.redirect('/relatorios/dashboardbi')
                                                    })
                                                }).catch((err) => {
                                                    req.flash('error_msg', 'Falha ao encontrar usinas nivel 3.')
                                                    res.redirect('/relatorios/dashboardbi')
                                                })
                                            }).catch((err) => {
                                                req.flash('error_msg', 'Falha ao encontrar usinas nivel 2.')
                                                res.redirect('/relatorios/dashboardbi')
                                            })
                                        }).catch((err) => {
                                            req.flash('error_msg', 'Falha ao encontrar usinas nivel 1.')
                                            res.redirect('/relatorios/dashboardbi')
                                        })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Falha ao encontrar usinas trifásicas.')
                                        res.redirect('/relatorios/dashboardbi')
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Falha ao encontrar usinas bifásicas.')
                                    res.redirect('/relatorios/dashboardbi')
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Falha ao encontrar usinas monofásicas.')
                                res.redirect('/relatorios/dashboardbi')
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Falha ao encontrar usinas telhado.')
                            res.redirect('/relatorios/dashboardbi')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Falha ao encontrar usinas solo.')
                        res.redirect('/relatorios/dashboardbi')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Falha ao encontrar usinas industriais.')
                    res.redirect('/relatorios/dashboardbi')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao encontrar usinas comerciais.')
                res.redirect('/relatorios/dashboardbi')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao encontrar usinas residenciais.')
            res.redirect('/relatorios/dashboardbi')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar usinas rurais.')
        res.redirect('/relatorios/dashboardbi')
    })
})

router.post('/aplicar', ehAdmin, (req, res) => {
    const { _id } = req.user

    var checkKwp
    var checkQtd
    var checkFat
    var fatrural = 0
    var fatresid = 0
    var fatcomer = 0
    var fatindus = 0
    var fatmono = 0
    var fatbifa = 0
    var fattrif = 0
    var fatnivel1 = 0
    var fatnivel2 = 0
    var fatnivel3 = 0
    var fatnivel4 = 0
    var fatnivel5 = 0
    var fatnivel6 = 0
    var qtdrural = 0
    var qtdresid = 0
    var qtdcomer = 0
    var qtdindus = 0
    var qtdmono = 0
    var qtdbifa = 0
    var qtdtrif = 0
    var qtdnivel1 = 0
    var qtdnivel2 = 0
    var qtdnivel3 = 0
    var qtdnivel4 = 0
    var qtdnivel5 = 0
    var qtdnivel6 = 0
    var kwprural = 0
    var kwpresid = 0
    var kwpcomer = 0
    var kwpindus = 0
    var kwpmono = 0
    var kwpbifa = 0
    var kwptrif = 0
    var kwpnivel1 = 0
    var kwpnivel2 = 0
    var kwpnivel3 = 0
    var kwpnivel4 = 0
    var kwpnivel5 = 0
    var kwpnivel6 = 0
    var fatsolo = 0
    var fattelhado = 0
    var qtdsolo = 0
    var qtdtelhado = 0
    var kwpsolo = 0
    var kwptelhado = 0

    var dataini
    var datafim
    var mestitulo = ''
    var ano = req.body.mesano
    switch (req.body.messel) {
        case 'Janeiro':
            dataini = ano + '01' + '01'
            datafim = ano + '01' + '31'
            mestitulo = 'Janeiro de '
            break;
        case 'Fevereiro':
            dataini = ano + '02' + '01'
            datafim = ano + '02' + '28'
            mestitulo = 'Fevereiro de '
            break;
        case 'Março':
            dataini = ano + '03' + '01'
            datafim = ano + '03' + '31'
            mestitulo = 'Março /'
            break;
        case 'Abril':
            dataini = ano + '04' + '01'
            datafim = ano + '04' + '30'
            mestitulo = 'Abril de '
            break;
        case 'Maio':
            dataini = ano + '05' + '01'
            datafim = ano + '05' + '31'
            mestitulo = 'Maio de '
            break;
        case 'Junho':
            dataini = ano + '06' + '01'
            datafim = ano + '06' + '30'
            mestitulo = 'Junho de '
            break;
        case 'Julho':
            dataini = ano + '07' + '01'
            datafim = ano + '07' + '31'
            mestitulo = 'Julho de '
            break;
        case 'Agosto':
            dataini = ano + '08' + '01'
            datafim = ano + '08' + '30'
            mestitulo = 'Agosto de '
            break;
        case 'Setembro':
            dataini = ano + '09' + '01'
            datafim = ano + '09' + '31'
            mestitulo = 'Setembro de '
            break;
        case 'Outubro':
            dataini = ano + '10' + '01'
            datafim = ano + '10' + '31'
            mestitulo = 'Outubro de '
            break;
        case 'Novembro':
            dataini = ano + '11' + '01'
            datafim = ano + '11' + '30'
            mestitulo = 'Novembro de '
            break;
        case 'Dezembro':
            dataini = ano + '12' + '01'
            datafim = ano + '12' + '31'
            mestitulo = 'Dezembro de '
            break;
        default:
            dataini = ano + '01' + '01'
            datafim = ano + '12' + '31'
            mestitulo = 'Todo ano de '
    }

    var selecionado = req.body.selecionado
    console.log('selecionado=>' + selecionado)

    console.log('dataini=>' + dataini)
    console.log('datafim=>' + datafim)

    if (selecionado == 'faturamento') {
        checkFat = 'checked'
        checkKwp = 'unchecked'
        checkQtd = 'unchecked'
        Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, $or: [{ 'classUsina': 'Rural' }, { 'classUsina': 'Rural Residencial' }, { 'classUsina': 'Rural Granja' }, { 'classUsina': 'Rural Irrigação' }] }).then((rural) => {
            for (i = 0; i < rural.length; i++) {
                fatrural = fatrural + parseFloat(rural[i].vlrNFS)
            }
            Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, classUsina: 'Residencial' }).then((residencial) => {
                for (i = 0; i < residencial.length; i++) {
                    fatresid = fatresid + parseFloat(residencial[i].vlrNFS)
                }
                Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, classUsina: 'Comercial' }).then((comercial) => {
                    for (i = 0; i < comercial.length; i++) {
                        fatcomer = fatcomer + parseFloat(comercial[i].vlrNFS)
                    }
                    Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, classUsina: 'Industrial' }).then((industrial) => {
                        for (i = 0; i < industrial.length; i++) {
                            fatindus = fatindus + parseFloat(industrial[i].vlrNFS)
                        }
                        Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, $or: [{ 'tipoUsina': 'Solo Concreto' }, { 'tipoUsina': 'Solo Metal' }, { 'tipoUsina': 'Laje' }] }).then((solo) => {
                            for (i = 0; i < solo.length; i++) {
                                fatsolo = fatsolo + parseFloat(solo[i].vlrNFS)
                            }
                            Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, $or: [{ 'tipoUsina': 'Telhado Fibrocimento' }, { 'tipoUsina': 'Telhado Madeira' }, { 'tipoUsina': 'Telhado Cerâmica' }, { 'tipoUsina': 'Telhado Gambrel' }] }).then((telhado) => {
                                for (i = 0; i < telhado.length; i++) {
                                    fattelhado = fattelhado + parseFloat(telhado[i].vlrNFS)
                                }
                                Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, $or: [{ 'tipoConexao': 'Monofásico 127V' }, { 'tipoConexao': 'Monofásico 220V' }] }).then((monofasico) => {
                                    for (i = 0; i < monofasico.length; i++) {
                                        fatmono = fatmono + parseFloat(monofasico[i].vlrNFS)
                                    }
                                    Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, tipoConexao: 'Bifásico 220V' }).then((bifasico) => {
                                        for (i = 0; i < bifasico.length; i++) {
                                            fatbifa = fatbifa + parseFloat(bifasico[i].vlrNFS)
                                        }
                                        Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, $or: [{ 'tipoConexao': 'Trifásico 220V' }, { 'tipoConexao': 'Trifásico 380V' }] }).then((trifasico) => {
                                            for (i = 0; i < trifasico.length; i++) {
                                                fattrif = fattrif + parseFloat(trifasico[i].vlrNFS)
                                            }
                                            Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, 'potencia': { $lte: 10 } }).then((nivel1) => {
                                                for (i = 0; i < nivel1.length; i++) {
                                                    fatnivel1 = fatnivel1 + parseFloat(nivel1[i].vlrNFS)
                                                }
                                                Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, 'potencia': { $lte: 30, $gte: 11 } }).then((nivel2) => {
                                                    for (i = 0; i < nivel2.length; i++) {
                                                        fatnivel2 = fatnivel2 + parseFloat(nivel2[i].vlrNFS)
                                                    }
                                                    Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, 'potencia': { $lte: 50, $gte: 31 } }).then((nivel3) => {
                                                        for (i = 0; i < nivel3.length; i++) {
                                                            fatnivel3 = fatnivel3 + parseFloat(nivel3[i].vlrNFS)
                                                        }
                                                        Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, 'potencia': { $lte: 100, $gte: 51 } }).then((nivel4) => {
                                                            for (i = 0; i < nivel4.length; i++) {
                                                                fatnivel4 = fatnivel4 + parseFloat(nivel4[i].vlrNFS)
                                                            }
                                                            Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, 'potencia': { $lte: 150, $gte: 101 } }).then((nivel5) => {
                                                                for (i = 0; i < nivel5.length; i++) {
                                                                    fatnivel5 = fatnivel5 + parseFloat(nivel5[i].vlrNFS)
                                                                }
                                                                Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, 'potencia': { $lte: 200, $gte: 151 } }).then((nivel6) => {
                                                                    for (i = 0; i < nivel6.length; i++) {
                                                                        fatnivel6 = fatnivel6 + parseFloat(nivel6[i].vlrNFS)
                                                                    }
                                                                    res.render('relatorios/dashboardbi', { checkFat, checkKwp, checkQtd, fatrural, fatresid, fatcomer, fatindus, fatsolo, fattelhado, fatmono, fatbifa, fattrif, fatnivel1, fatnivel2, fatnivel3, fatnivel4, fatnivel5, fatnivel6, mestitulo, ano })
                                                                }).catch((err) => {
                                                                    req.flash('error_msg', 'Falha ao encontrar usinas nivel 6.')
                                                                    res.redirect('/relatorios/dashboardbi')
                                                                })
                                                            }).catch((err) => {
                                                                req.flash('error_msg', 'Falha ao encontrar usinas nivel 5.')
                                                                res.redirect('/relatorios/dashboardbi')
                                                            })
                                                        }).catch((err) => {
                                                            req.flash('error_msg', 'Falha ao encontrar usinas nivel 4.')
                                                            res.redirect('/relatorios/dashboardbi')
                                                        })
                                                    }).catch((err) => {
                                                        req.flash('error_msg', 'Falha ao encontrar usinas nivel 3.')
                                                        res.redirect('/relatorios/dashboardbi')
                                                    })
                                                }).catch((err) => {
                                                    req.flash('error_msg', 'Falha ao encontrar usinas nivel 2.')
                                                    res.redirect('/relatorios/dashboardbi')
                                                })
                                            }).catch((err) => {
                                                req.flash('error_msg', 'Falha ao encontrar usinas nivel 1.')
                                                res.redirect('/relatorios/dashboardbi')
                                            })
                                        }).catch((err) => {
                                            req.flash('error_msg', 'Falha ao encontrar usinas trifásicas.')
                                            res.redirect('/relatorios/dashboardbi')
                                        })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Falha ao encontrar usinas bifásicas.')
                                        res.redirect('/relatorios/dashboardbi')
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Falha ao encontrar usinas monofásicas.')
                                    res.redirect('/relatorios/dashboardbi')
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Falha ao encontrar usinas telhado.')
                                res.redirect('/relatorios/dashboardbi')
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Falha ao encontrar usinas solo.')
                            res.redirect('/relatorios/dashboardbi')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Falha ao encontrar usinas industriais.')
                        res.redirect('/relatorios/dashboardbi')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Falha ao encontrar usinas comerciais.')
                    res.redirect('/relatorios/dashboardbi')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao encontrar usinas residenciais.')
                res.redirect('/relatorios/dashboardbi')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao encontrar usinas rurais.')
            res.redirect('/relatorios/dashboardbi')
        })

    } else {
        if (selecionado == 'quantidade') {
            checkQtd = 'checked'
            checkKwp = 'unchecked'
            checkFat = 'unchecked'
            Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, $or: [{ 'classUsina': 'Rural' }, { 'classUsina': 'Rural Residencial' }, { 'classUsina': 'Rural Granja' }, { 'classUsina': 'Rural Irrigação' }] }).then((rural) => {
                qtdrural = rural.length
                Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, classUsina: 'Residencial' }).then((residencial) => {
                    qtdresid = residencial.length
                    Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, classUsina: 'Comercial' }).then((comercial) => {
                        qtdcomer = comercial.length
                        Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, classUsina: 'Industrial' }).then((industrial) => {
                            qtdindus = industrial.length
                            Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, $or: [{ 'tipoUsina': 'Solo Concreto' }, { 'tipoUsina': 'Solo Metal' }, { 'tipoUsina': 'Laje' }] }).then((solo) => {
                                qtdsolo = solo.length
                                Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, $or: [{ 'tipoUsina': 'Telhado Fibrocimento' }, { 'tipoUsina': 'Telhado Madeira' }, { 'tipoUsina': 'Telhado Cerâmica' }, { 'tipoUsina': 'Telhado Gambrel' }] }).then((telhado) => {
                                    qtdtelhado = telhado.length
                                    Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, $or: [{ 'tipoConexao': 'Monofásico 127V' }, { 'tipoConexao': 'Monofásico 220V' }] }).then((monofasico) => {
                                        qtdmono = monofasico.length
                                        Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, tipoConexao: 'Bifásico 220V' }).then((bifasico) => {
                                            qtdbifa = bifasico.length
                                            Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, $or: [{ 'tipoConexao': 'Trifásico 220V' }, { 'tipoConexao': 'Trifásico 380V' }] }).then((trifasico) => {
                                                qtdtrif = trifasico.length
                                                Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, 'potencia': { $lte: 10 } }).then((nivel1) => {
                                                    qtdnivel1 = nivel1.length
                                                    Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, 'potencia': { $lte: 30, $gte: 11 } }).then((nivel2) => {
                                                        qtdnivel2 = nivel2.length
                                                        Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, 'potencia': { $lte: 50, $gte: 31 } }).then((nivel3) => {
                                                            qtdnivel3 = nivel3.length
                                                            Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, 'potencia': { $lte: 100, $gte: 51 } }).then((nivel4) => {
                                                                qtdnivel4 = nivel4.length
                                                                Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, 'potencia': { $lte: 150, $gte: 101 } }).then((nivel5) => {
                                                                    qtdnivel5 = nivel5.length
                                                                    Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, 'potencia': { $lte: 200, $gte: 151 } }).then((nivel6) => {
                                                                        qtdnivel6 = nivel6.length
                                                                        res.render('relatorios/dashboardbi', { checkFat, checkKwp, checkQtd, qtdrural, qtdresid, qtdcomer, qtdindus, qtdsolo, qtdtelhado, qtdmono, qtdbifa, qtdtrif, qtdnivel1, qtdnivel2, qtdnivel3, qtdnivel4, qtdnivel5, qtdnivel6, mestitulo, ano })
                                                                    }).catch((err) => {
                                                                        req.flash('error_msg', 'Falha ao encontrar usinas nivel 6.')
                                                                        res.redirect('/relatorios/dashboardbi')
                                                                    })
                                                                }).catch((err) => {
                                                                    req.flash('error_msg', 'Falha ao encontrar usinas nivel 5.')
                                                                    res.redirect('/relatorios/dashboardbi')
                                                                })
                                                            }).catch((err) => {
                                                                req.flash('error_msg', 'Falha ao encontrar usinas nivel 4.')
                                                                res.redirect('/relatorios/dashboardbi')
                                                            })
                                                        }).catch((err) => {
                                                            req.flash('error_msg', 'Falha ao encontrar usinas nivel 3.')
                                                            res.redirect('/relatorios/dashboardbi')
                                                        })
                                                    }).catch((err) => {
                                                        req.flash('error_msg', 'Falha ao encontrar usinas nivel 2.')
                                                        res.redirect('/relatorios/dashboardbi')
                                                    })
                                                }).catch((err) => {
                                                    req.flash('error_msg', 'Falha ao encontrar usinas nivel 1.')
                                                    res.redirect('/relatorios/dashboardbi')
                                                })
                                            }).catch((err) => {
                                                req.flash('error_msg', 'Falha ao encontrar usinas trifásicas.')
                                                res.redirect('/relatorios/dashboardbi')
                                            })
                                        }).catch((err) => {
                                            req.flash('error_msg', 'Falha ao encontrar usinas bifásicas.')
                                            res.redirect('/relatorios/dashboardbi')
                                        })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Falha ao encontrar usinas monofásicas.')
                                        res.redirect('/relatorios/dashboardbi')
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Falha ao encontrar usinas telhado.')
                                    res.redirect('/relatorios/dashboardbi')
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Falha ao encontrar usinas solo.')
                                res.redirect('/relatorios/dashboardbi')
                            })

                        }).catch((err) => {
                            req.flash('error_msg', 'Falha ao encontrar usinas industriais.')
                            res.redirect('/relatorios/dashboardbi')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Falha ao encontrar usinas comerciais.')
                        res.redirect('/relatorios/dashboardbi')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Falha ao encontrar usinas residenciais.')
                    res.redirect('/relatorios/dashboardbi')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao encontrar usinas rurais.')
                res.redirect('/relatorios/dashboardbi')
            })
        } else {
            if (selecionado == 'potencia') {
                checkKwp = 'checked'
                checkFat = 'unchecked'
                checkQtd = 'unchecked'
                Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, $or: [{ 'classUsina': 'Rural' }, { 'classUsina': 'Rural Residencial' }, { 'classUsina': 'Rural Granja' }, { 'classUsina': 'Rural Irrigação' }] }).then((rural) => {
                    for (i = 0; i < rural.length; i++) {
                        kwprural = kwprural + parseFloat(rural[i].potencia)
                    }
                    Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, classUsina: 'Residencial' }).then((residencial) => {
                        for (i = 0; i < residencial.length; i++) {
                            kwpresid = kwpresid + parseFloat(residencial[i].potencia)
                        }
                        Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, classUsina: 'Comercial' }).then((comercial) => {
                            for (i = 0; i < comercial.length; i++) {
                                kwpcomer = kwpcomer + parseFloat(comercial[i].potencia)
                            }
                            Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, classUsina: 'Industrial' }).then((industrial) => {
                                for (i = 0; i < industrial.length; i++) {
                                    kwpindus = kwpindus + parseFloat(industrial[i].potencia)
                                }
                                Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, $or: [{ 'tipoUsina': 'Solo Concreto' }, { 'tipoUsina': 'Solo Metal' }, { 'tipoUsina': 'Laje' }] }).then((solo) => {
                                    for (i = 0; i < solo.length; i++) {
                                        kwpsolo = kwpsolo + parseFloat(solo[i].potencia)
                                    }
                                    Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, $or: [{ 'tipoUsina': 'Telhado Fibrocimento' }, { 'tipoUsina': 'Telhado Madeira' }, { 'tipoUsina': 'Telhado Cerâmica' }, { 'tipoUsina': 'Telhado Gambrel' }] }).then((telhado) => {
                                        for (i = 0; i < telhado.length; i++) {
                                            kwptelhado = kwptelhado + parseFloat(telhado[i].potencia)
                                        }
                                        Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, $or: [{ 'tipoConexao': 'Monofásico 127V' }, { 'tipoConexao': 'Monofásico 220V' }] }).then((monofasico) => {
                                            for (i = 0; i < monofasico.length; i++) {
                                                kwpmono = kwpmono + parseFloat(monofasico[i].potencia)
                                            }
                                            Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, tipoConexao: 'Bifásico 220V' }).then((bifasico) => {
                                                for (i = 0; i < bifasico.length; i++) {
                                                    kwpbifa = kwpbifa + parseFloat(bifasico[i].potencia)
                                                }
                                                Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, $or: [{ 'tipoConexao': 'Trifásico 220V' }, { 'tipoConexao': 'Trifásico 380V' }] }).then((trifasico) => {
                                                    for (i = 0; i < trifasico.length; i++) {
                                                        kwptrif = kwptrif + parseFloat(trifasico[i].potencia)
                                                    }
                                                    Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, 'potencia': { $lte: 10 } }).then((nivel1) => {
                                                        for (i = 0; i < nivel1.length; i++) {
                                                            kwpnivel1 = kwpnivel1 + parseFloat(nivel1[i].potencia)
                                                        }
                                                        Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, 'potencia': { $lte: 30, $gte: 11 } }).then((nivel2) => {
                                                            for (i = 0; i < nivel2.length; i++) {
                                                                kwpnivel2 = kwpnivel2 + parseFloat(nivel2[i].potencia)
                                                            }
                                                            Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, 'potencia': { $lte: 50, $gte: 31 } }).then((nivel3) => {
                                                                for (i = 0; i < nivel3.length; i++) {
                                                                    kwpnivel3 = kwpnivel3 + parseFloat(nivel3[i].potencia)
                                                                }
                                                                Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, 'potencia': { $lte: 100, $gte: 51 } }).then((nivel4) => {
                                                                    for (i = 0; i < nivel4.length; i++) {
                                                                        kwpnivel4 = kwpnivel4 + parseFloat(nivel4[i].potencia)
                                                                    }
                                                                    Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, 'potencia': { $lte: 150, $gte: 101 } }).then((nivel5) => {
                                                                        for (i = 0; i < nivel5.length; i++) {
                                                                            kwpnivel5 = kwpnivel5 + parseFloat(nivel5[i].potencia)
                                                                        }
                                                                        Projetos.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }, 'potencia': { $lte: 200, $gte: 151 } }).then((nivel6) => {
                                                                            for (i = 0; i < nivel6.length; i++) {
                                                                                kwpnivel6 = kwpnivel6 + parseFloat(nivel6[i].potencia)
                                                                            }
                                                                            res.render('relatorios/dashboardbi', { checkFat, checkKwp, checkQtd, kwprural, kwpresid, kwpcomer, kwpindus, kwpsolo, kwptelhado, kwpmono, kwpbifa, kwptrif, kwpnivel1, kwpnivel2, kwpnivel3, kwpnivel4, kwpnivel5, kwpnivel6, mestitulo, ano })
                                                                        }).catch((err) => {
                                                                            req.flash('error_msg', 'Falha ao encontrar usinas nivel 6.')
                                                                            res.redirect('/relatorios/dashboardbi')
                                                                        })
                                                                    }).catch((err) => {
                                                                        req.flash('error_msg', 'Falha ao encontrar usinas nivel 5.')
                                                                        res.redirect('/relatorios/dashboardbi')
                                                                    })
                                                                }).catch((err) => {
                                                                    req.flash('error_msg', 'Falha ao encontrar usinas nivel 4.')
                                                                    res.redirect('/relatorios/dashboardbi')
                                                                })
                                                            }).catch((err) => {
                                                                req.flash('error_msg', 'Falha ao encontrar usinas nivel 3.')
                                                                res.redirect('/relatorios/dashboardbi')
                                                            })
                                                        }).catch((err) => {
                                                            req.flash('error_msg', 'Falha ao encontrar usinas nivel 2.')
                                                            res.redirect('/relatorios/dashboardbi')
                                                        })
                                                    }).catch((err) => {
                                                        req.flash('error_msg', 'Falha ao encontrar usinas nivel 1.')
                                                        res.redirect('/relatorios/dashboardbi')
                                                    })
                                                }).catch((err) => {
                                                    req.flash('error_msg', 'Falha ao encontrar usinas trifásicas.')
                                                    res.redirect('/relatorios/dashboardbi')
                                                })
                                            }).catch((err) => {
                                                req.flash('error_msg', 'Falha ao encontrar usinas bifásicas.')
                                                res.redirect('/relatorios/dashboardbi')
                                            })
                                        }).catch((err) => {
                                            req.flash('error_msg', 'Falha ao encontrar usinas monofásicas.')
                                            res.redirect('/relatorios/dashboardbi')
                                        })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Falha ao encontrar usinas telhado.')
                                        res.redirect('/relatorios/dashboardbi')
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Falha ao encontrar usinas solo.')
                                    res.redirect('/relatorios/dashboardbi')
                                })

                            }).catch((err) => {
                                req.flash('error_msg', 'Falha ao encontrar usinas industriais.')
                                res.redirect('/relatorios/dashboardbi')
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Falha ao encontrar usinas comerciais.')
                            res.redirect('/relatorios/dashboardbi')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Falha ao encontrar usinas residenciais.')
                        res.redirect('/relatorios/dashboardbi')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Falha ao encontrar usinas rurais.')
                    res.redirect('/relatorios/dashboardbi')
                })
            } else {
                var aviso = []
                aviso.push({ texto: 'Nenhum registro encontrado.' })
                if (selecionado == 'faturamento') {
                    checkFat = 'checked'
                    checkQtd = 'unchecked'
                    checkKwp = 'unchecked'
                } else {
                    if (selecionado == 'quantidade') {
                        checkQtd = 'checked'
                        checkFat = 'unchecked'
                        checkKwp = 'unchecked'
                    } else {
                        checkKwp = 'checked'
                        checkQtd = 'unchecked'
                        checkFat = 'unchecked'
                    }
                }
                res.render('relatorios/dashboardbi/', { aviso, mestitulo, ano, checkFat, checkQtd, checkKwp })
            }
        }
    }
})

router.post('/analiseGeral', ehAdmin, (req, res) => {
    const { _id } = req.user
    var potencia = 0
    var valor = 0
    var totint = 0
    var qtdmod = 0
    var custoPlano = 0
    var q = 0

    var dataini
    var datafim
    var mestitulo = ''
    var ano = req.body.mesano
    switch (req.body.messel) {
        case 'Janeiro':
            dataini = ano + '01' + '01'
            datafim = ano + '01' + '31'
            mestitulo = 'Janeiro de '
            break;
        case 'Fevereiro':
            dataini = ano + '02' + '01'
            datafim = ano + '02' + '28'
            mestitulo = 'Fevereiro de '
            break;
        case 'Março':
            dataini = ano + '03' + '01'
            datafim = ano + '03' + '31'
            mestitulo = 'Março /'
            break;
        case 'Abril':
            dataini = ano + '04' + '01'
            datafim = ano + '04' + '30'
            mestitulo = 'Abril de '
            break;
        case 'Maio':
            dataini = ano + '05' + '01'
            datafim = ano + '05' + '31'
            mestitulo = 'Maio de '
            break;
        case 'Junho':
            dataini = ano + '06' + '01'
            datafim = ano + '06' + '30'
            mestitulo = 'Junho de '
            break;
        case 'Julho':
            dataini = ano + '07' + '01'
            datafim = ano + '07' + '31'
            mestitulo = 'Julho de '
            break;
        case 'Agosto':
            dataini = ano + '08' + '01'
            datafim = ano + '08' + '30'
            mestitulo = 'Agosto de '
            break;
        case 'Setembro':
            dataini = ano + '09' + '01'
            datafim = ano + '09' + '31'
            mestitulo = 'Setembro de '
            break;
        case 'Outubro':
            dataini = ano + '10' + '01'
            datafim = ano + '10' + '31'
            mestitulo = 'Outubro de '
            break;
        case 'Novembro':
            dataini = ano + '11' + '01'
            datafim = ano + '11' + '30'
            mestitulo = 'Novembro de '
            break;
        case 'Dezembro':
            dataini = ano + '12' + '01'
            datafim = ano + '12' + '31'
            mestitulo = 'Dezembro de '
            break;
        default:
            dataini = ano + '01' + '01'
            datafim = ano + '12' + '31'
            mestitulo = 'Todo ano de '
    }

    Realizado.find({ user: _id, 'datareg': { $lte: datafim, $gte: dataini }}).sort({ datafim: 'asc' }).lean().then((realizado) => {
        realizado.forEach((element) => {
            Projetos.findOne({ _id: element.projeto}).then((projeto) => {
                if (projeto.ehDireto) {
                    if (projeto.qtdmod > 0) {
                        qtdmod = qtdmod + projeto.qtdmod
                    } else {
                        qtdmod = qtdmod + 0
                    }
                } else {
                    qtdmod = qtdmod + projeto.unimod
                }
                potencia = parseFloat(potencia) + parseFloat(element.potencia)

                valor = valor + element.valor
                totint = totint + element.totint
                custoPlano = custoPlano + element.custoPlano

                console.log('q=>'+q)
                q = q + 1
                if (q == realizado.length) {
                    var rspmod = (parseFloat(valor) / parseFloat(qtdmod)).toFixed(2)
                    var rspkwp = (parseFloat(valor) / parseFloat(potencia)).toFixed(2)
                    var rsimod = (parseFloat(totint) / parseFloat(qtdmod)).toFixed(2)
                    var rsikwp = (parseFloat(totint) / parseFloat(potencia)).toFixed(2)
                    var custoPorModulo = (parseFloat(custoPlano) / parseFloat(qtdmod)).toFixed(2)
                    var custoPorKwp = (parseFloat(custoPlano) / parseFloat(potencia)).toFixed(2)
                    res.render('relatorios/analisegeral', { potencia, qtdmod, valor, rspkwp, rspmod, rsimod, rsikwp, custoPorModulo,custoPorKwp, mestitulo, ano })
                }
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro para encontrar projetos.')
                res.redirect('/menu')
            })
        })
        if (realizado.length == 0){
            aviso = []
            aviso.push({texto: 'Nenhum projeto realizado no período de: ' + mestitulo + ' de ' + ano})
            res.render('relatorios/analisegeral', {aviso, mestitulo, ano })            
        }
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro para encontrar projetos realizados.')
        res.redirect('/menu')
    })
})

router.post('/filtradash', ehAdmin, (req, res) => {
    const { _id } = req.user
    var ano = req.body.mesano
    var dataini
    var datafim
    var mestitulo

    //console.log('req.body.messel=>' + req.body.messel)

    switch (req.body.messel) {
        case 'Janeiro':
            dataini = ano + '01' + '01'
            datafim = ano + '01' + '31'
            mestitulo = 'Janeiro de '
            break;
        case 'Fevereiro':
            dataini = ano + '02' + '01'
            datafim = ano + '02' + '28'
            mestitulo = 'Fevereiro de '
            break;
        case 'Março':
            dataini = ano + '03' + '01'
            datafim = ano + '03' + '31'
            mestitulo = 'Março /'
            break;
        case 'Abril':
            dataini = ano + '04' + '01'
            datafim = ano + '04' + '30'
            mestitulo = 'Abril de '
            break;
        case 'Maio':
            dataini = ano + '05' + '01'
            datafim = ano + '05' + '31'
            mestitulo = 'Maio de '
            break;
        case 'Junho':
            dataini = ano + '06' + '01'
            datafim = ano + '06' + '30'
            mestitulo = 'Junho de '
            break;
        case 'Julho':
            dataini = ano + '07' + '01'
            datafim = ano + '07' + '31'
            mestitulo = 'Julho de '
            break;
        case 'Agosto':
            dataini = ano + '08' + '01'
            datafim = ano + '08' + '30'
            mestitulo = 'Agosto de '
            break;
        case 'Setembro':
            dataini = ano + '09' + '01'
            datafim = ano + '09' + '31'
            mestitulo = 'Setembro de '
            break;
        case 'Outubro':
            dataini = ano + '10' + '01'
            datafim = ano + '10' + '31'
            mestitulo = 'Outubro de '
            break;
        case 'Novembro':
            dataini = ano + '11' + '01'
            datafim = ano + '11' + '30'
            mestitulo = 'Novembro de '
            break;
        case 'Dezembro':
            dataini = ano + '12' + '01'
            datafim = ano + '12' + '31'
            mestitulo = 'Dezembro de '
            break;
        default:
            dataini = ano + '01' + '01'
            datafim = ano + '12' + '31'
            mestitulo = 'Todo ano de '
    }

    //console.log('dataini=>' + dataini)
    //console.log('datafim=>' + datafim)

    var soma_kitfat = 0
    var soma_serfat = 0
    var soma_totfat = 0

    var soma_totcop = 0
    var soma_totkit = 0
    var soma_totprj = 0
    var soma_totliq = 0
    var soma_totser = 0

    var soma_totkwp = 0
    var soma_equkwp = 0
    var soma_varkwp = 0
    var soma_estkwp = 0

    //Custos Fixos
    var soma_custoFix = 0
    //Serviço
    var soma_totint = 0
    var soma_totpro = 0
    var soma_totges = 0
    var soma_totart = 0
    //Despesas Administrativas
    var soma_totadm = 0
    //Comissões
    var soma_totcom = 0
    //Tributos
    var soma_tottrb = 0
    //Custos Variáveis
    var soma_varfat = 0
    var soma_custoVar = 0
    var soma_totdes = 0
    var soma_totali = 0
    var soma_totcmb = 0
    var soma_tothtl = 0
    //Custos Variáveis Estruturais
    var soma_estfat = 0
    var soma_custoEst = 0
    var soma_totcer = 0
    var soma_totcen = 0
    var soma_totpos = 0

    //Custos Fixos
    var medkwp_custoFix = 0
    //Serviço
    var medkwp_totint = 0
    var medkwp_totpro = 0
    var medkwp_totges = 0
    var medkwp_totart = 0
    //Despesas Administrativas
    var medkwp_totadm = 0
    //Comissões
    var medkwp_totcom = 0
    //Tributos
    var medkwp_tottrb = 0
    //Despesas Variáveis
    var medkwp_totdes = 0
    var medkwp_totali = 0
    var medkwp_tothtl = 0
    var medkwp_totcmb = 0
    var medkwp_custoVar = 0
    var medkwp_varfat = 0
    //Despesas Variáveis Estruturais
    var medkwp_custoEst = 0
    var medkwp_totcer = 0
    var medkwp_totcen = 0
    var medkwp_totpos = 0

    var per_totliq
    var per_dispendio
    var per_kitfat
    var per_comfat
    var per_cusfat
    var per_desfat
    var per_trbfat

    //Percentuais Componentes
    var soma_modequ = 0
    var soma_invequ = 0
    var soma_estequ = 0
    var soma_cabequ = 0
    var soma_dpsequ = 0
    var soma_disequ = 0
    var soma_sbxequ = 0
    var soma_ocpequ = 0

    var soma_totequ = 0
    var per_modequ = 0
    var per_invequ = 0
    var per_estequ = 0
    var per_cabequ = 0
    var per_dpsequ = 0
    var per_disequ = 0
    var per_sbxequ = 0
    var per_ocpequ = 0
    var med_modequ = 0
    var med_invequ = 0
    var med_estequ = 0
    var med_cabequ = 0
    var med_dpsequ = 0
    var med_disequ = 0
    var med_sbxequ = 0
    var med_ocpequ = 0
    var med_totequ = 0

    //----------------------------------------
    //Média ponderada da participação 
    //----------------------------------------
    var soma_totfat_com = 0
    var soma_totfat_sem = 0

    var soma_totcop_com = 0
    var soma_totcop_sem = 0
    var soma_totkit_com = 0

    var soma_totkwp_com = 0
    var soma_totkwp_sem = 0
    var soma_varkwp_com = 0
    var soma_varkwp_sem = 0
    var soma_estkwp_com = 0
    var soma_estkwp_sem = 0

    //Custos Fixos
    var soma_totcus_com = 0
    var soma_totcus_sem = 0
    //Serviço
    var soma_totint_com = 0
    var soma_totint_sem = 0
    var soma_totpro_com = 0
    var soma_totpro_sem = 0
    var soma_totges_com = 0
    var soma_totges_sem = 0
    var soma_totart_com = 0
    var soma_totart_sem = 0
    //Despesas Administrativas
    var soma_totadm_com = 0
    var soma_totadm_sem = 0
    //Comissões
    var soma_totcom_com = 0
    var soma_totcom_sem = 0
    //Tributos
    var soma_tottrb_com = 0
    var soma_tottrb_sem = 0
    //Custos Variáveis
    var soma_totvar_com = 0
    var soma_totvar_sem = 0
    var soma_varfat_com = 0
    var soma_varfat_sem = 0
    var soma_totdes_com = 0
    var soma_totdes_sem = 0
    var soma_totali_com = 0
    var soma_totali_sem = 0
    var soma_totcmb_com = 0
    var soma_totcmb_sem = 0
    var soma_tothtl_com = 0
    var soma_tothtl_sem = 0
    //Custos Variáveis Estruturais
    var soma_totest_com = 0
    var soma_totest_sem = 0
    var soma_estfat_com = 0
    var soma_estfat_sem = 0
    var soma_totcer_com = 0
    var soma_totcer_sem = 0
    var soma_totcen_com = 0
    var soma_totcen_sem = 0
    var soma_totpos_com = 0
    var soma_totpos_sem = 0
    //----------------------------------------

    Realizado.find({ 'datareg': { $lte: datafim, $gte: dataini }, user: _id }).lean().then((realizado) => {

        var numprj = realizado.length

        for (i = 0; i < realizado.length; i++) {

            const { potencia } = realizado[i]
            const { fatequ } = realizado[i]
            const { vlrkit } = realizado[i]
            const { valor } = realizado[i]
            const { vlrNFS } = realizado[i]
            const { custoPlano } = realizado[i]
            const { lucroLiquido } = realizado[i]

            //Custos Fixos
            const { custofix } = realizado[i]
            //Serviços
            const { totpro } = realizado[i]
            const { totges } = realizado[i]
            const { totint } = realizado[i]
            const { vlrart } = realizado[i]
            //Administrativo
            const { desAdm } = realizado[i]
            //Comissão
            const { vlrcom } = realizado[i]
            //Tributos
            const { totalTributos } = realizado[i]
            //Custo Variável
            const { custovar } = realizado[i]
            const { totdes } = realizado[i]
            const { totali } = realizado[i]
            const { totcmb } = realizado[i]
            const { tothtl } = realizado[i]
            //Custo Variavel Estrutural
            const { custoest } = realizado[i]
            const { valorCer } = realizado[i]
            const { valorCen } = realizado[i]
            const { valorPos } = realizado[i]

            //Percentuais Conmponentes
            const { valorMod } = realizado[i]
            const { valorInv } = realizado[i]
            const { valorEst } = realizado[i]
            const { valorCab } = realizado[i]
            const { valorDis } = realizado[i]
            const { valorDPS } = realizado[i]
            const { valorSB } = realizado[i]
            const { valorOcp } = realizado[i]

            //-------------------------------
            //Média ponderada da participação do gastos- INÍCIO
            //-------------------------------
            if (fatequ == true) {

                //numprj_com++

                soma_totkwp_com = (parseFloat(soma_totkwp_com) + parseFloat(potencia)).toFixed(2)
                soma_totcop_com = (parseFloat(soma_totcop_com) + parseFloat(custoPlano)).toFixed(2)
                //Totalizador de Faturamento            
                soma_totfat_com = parseFloat(soma_totfat_com) + parseFloat(vlrNFS)
                //Totalizador de Kit   
                soma_totkit_com = parseFloat(soma_totkit_com) + parseFloat(vlrkit)

                //Custos Fixos 
                soma_totcus_com = (parseFloat(soma_totcus_com) + parseFloat(custofix)).toFixed(2)
                //Serviços
                soma_totint_com = (parseFloat(soma_totint_com) + parseFloat(totint)).toFixed(2)
                soma_totpro_com = (parseFloat(soma_totpro_com) + parseFloat(totpro)).toFixed(2)
                soma_totges_com = (parseFloat(soma_totges_com) + parseFloat(totges)).toFixed(2)
                soma_totart_com = (parseFloat(soma_totart_com) + parseFloat(vlrart)).toFixed(2)
                //Tributos
                soma_tottrb_com = (parseFloat(soma_tottrb_com) + parseFloat(totalTributos)).toFixed(2)
                //Comissão
                soma_totcom_com = (parseFloat(soma_totcom_com) + parseFloat(vlrcom)).toFixed(2)
                //Despesas Administrativas
                if (desAdm != undefined) {
                    soma_totadm_com = (parseFloat(soma_totadm_com) + parseFloat(desAdm)).toFixed(2)
                }

                //Custos Variáveis
                if (totdes > 0 || totali > 0 || totcmb > 0 || tothtl > 0) {
                    soma_varkwp_com = parseFloat(soma_varkwp_com) + parseFloat(potencia)
                    //console.log('soma_varkwp=>' + soma_varkwp)
                    soma_varfat_com = parseFloat(soma_varfat_com) + parseFloat(vlrNFS)
                    soma_totvar_com = (parseFloat(soma_totvar_com) + parseFloat(custovar)).toFixed(2)
                }

                soma_totdes_com = (parseFloat(soma_totdes_com) + parseFloat(totdes)).toFixed(2)
                soma_totali_com = (parseFloat(soma_totali_com) + parseFloat(totali)).toFixed(2)
                soma_totcmb_com = (parseFloat(soma_totcmb_com) + parseFloat(totcmb)).toFixed(2)
                soma_tothtl_com = (parseFloat(soma_tothtl_com) + parseFloat(tothtl)).toFixed(2)

                //Custos Variáveis Estruturais
                if (valorCer > 0 || valorCen > 0 || valorPos > 0) {
                    soma_estkwp_com = parseFloat(soma_estkwp_com) + parseFloat(potencia)
                    soma_estfat_com = parseFloat(soma_estfat_com) + parseFloat(vlrNFS)
                    soma_totest_com = (parseFloat(soma_totest_com) + parseFloat(custoest)).toFixed(2)
                } else {
                    soma_totest_com = (parseFloat(soma_totest_com) + 0).toFixed(2)
                }
                if (valorCer > 0) {
                    soma_totcer_com = (parseFloat(soma_totcer_com) + parseFloat(valorCer)).toFixed(2)
                } else {
                    soma_totcer_com = (parseFloat(soma_totcer_com) + 0).toFixed(2)
                }
                if (valorCen > 0) {
                    soma_totcen_com = (parseFloat(soma_totcen_com) + parseFloat(valorCen)).toFixed(2)
                } else {
                    soma_totcen_com = (parseFloat(soma_totcen_com) + 0).toFixed(2)
                }
                if (valorPos > 0) {
                    soma_totpos_com = (parseFloat(soma_totpos_com) + parseFloat(valorPos)).toFixed(2)
                } else {
                    soma_totpos_com = (parseFloat(soma_totpos_com) + 0).toFixed(2)
                }

            } else {
                //numprj_sem++

                soma_totkwp_sem = (parseFloat(soma_totkwp_sem) + parseFloat(potencia)).toFixed(2)
                soma_totcop_sem = (parseFloat(soma_totcop_sem) + parseFloat(custoPlano)).toFixed(2)
                //Totalizador de Faturamento            
                soma_totfat_sem = parseFloat(soma_totfat_sem) + parseFloat(vlrNFS)

                //Custos Fixos 
                soma_totcus_sem = (parseFloat(soma_totcus_sem) + parseFloat(custofix)).toFixed(2)
                //Serviços
                soma_totint_sem = (parseFloat(soma_totint_sem) + parseFloat(totint)).toFixed(2)
                soma_totpro_sem = (parseFloat(soma_totpro_sem) + parseFloat(totpro)).toFixed(2)
                soma_totges_sem = (parseFloat(soma_totges_sem) + parseFloat(totges)).toFixed(2)
                soma_totart_sem = (parseFloat(soma_totart_sem) + parseFloat(vlrart)).toFixed(2)
                //Tributos
                soma_tottrb_sem = (parseFloat(soma_tottrb_sem) + parseFloat(totalTributos)).toFixed(2)
                //Comissão
                soma_totcom_sem = (parseFloat(soma_totcom_sem) + parseFloat(vlrcom)).toFixed(2)
                //Despesas Administrativas
                if (desAdm != undefined) {
                    soma_totadm_sem = (parseFloat(soma_totadm_sem) + parseFloat(desAdm)).toFixed(2)
                }

                //Custos Variáveis
                if (totdes > 0 || totali > 0 || totcmb > 0 || tothtl > 0) {
                    soma_varkwp_sem = parseFloat(soma_varkwp_sem) + parseFloat(potencia)
                    //console.log('soma_varkwp=>' + soma_varkwp)
                    soma_varfat_sem = parseFloat(soma_varfat_sem) + parseFloat(vlrNFS)
                    soma_totvar_sem = (parseFloat(soma_totvar_sem) + parseFloat(custovar)).toFixed(2)
                }

                soma_totdes_sem = (parseFloat(soma_totdes_sem) + parseFloat(totdes)).toFixed(2)
                soma_totali_sem = (parseFloat(soma_totali_sem) + parseFloat(totali)).toFixed(2)
                soma_totcmb_sem = (parseFloat(soma_totcmb_sem) + parseFloat(totcmb)).toFixed(2)
                soma_tothtl_sem = (parseFloat(soma_tothtl_sem) + parseFloat(tothtl)).toFixed(2)

                //Custos Variáveis Estruturais
                if (valorCer > 0 || valorCen > 0 || valorPos > 0) {
                    soma_estkwp_sem = parseFloat(soma_estkwp_sem) + parseFloat(potencia)
                    soma_estfat_sem = parseFloat(soma_estfat_sem) + parseFloat(vlrNFS)
                    soma_totest_sem = (parseFloat(soma_totest_sem) + parseFloat(custoest)).toFixed(2)
                } else {
                    soma_totest_sem = (parseFloat(soma_totest_sem) + 0).toFixed(2)
                }
                if (valorCer > 0) {
                    soma_totcer_sem = (parseFloat(soma_totcer_sem) + parseFloat(valorCer)).toFixed(2)
                } else {
                    soma_totcer_sem = (parseFloat(soma_totcer_sem) + 0).toFixed(2)
                }
                if (valorCen > 0) {
                    soma_totcen_sem = (parseFloat(soma_totcen_sem) + parseFloat(valorCen)).toFixed(2)
                } else {
                    soma_totcen_sem = (parseFloat(soma_totcen_sem) + 0).toFixed(2)
                }
                if (valorPos > 0) {
                    soma_totpos_sem = (parseFloat(soma_totpos_sem) + parseFloat(valorPos)).toFixed(2)
                } else {
                    soma_totpos_sem = (parseFloat(soma_totpos_sem) + 0).toFixed(2)
                }
            }

            //----------------------------------------
            //Média ponderada da paticipação dos gastos- FIM
            //----------------------------------------

            soma_totkwp = (parseFloat(soma_totkwp) + parseFloat(potencia)).toFixed(2)
            soma_totcop = (parseFloat(soma_totcop) + parseFloat(custoPlano)).toFixed(2)
            //Totalizador de Faturamento            
            if (fatequ == true) {
                soma_kitfat = parseFloat(soma_kitfat) + parseFloat(vlrNFS)
                soma_totkit = parseFloat(soma_totkit) + parseFloat(vlrkit)
            } else {
                soma_serfat = parseFloat(soma_serfat) + parseFloat(vlrNFS)
            }

            //Custos Fixos 
            //Serviços
            if (totint > 0) {
                soma_totint = (parseFloat(soma_totint) + parseFloat(totint)).toFixed(2)
            } else {
                soma_totint = (parseFloat(soma_totint) + 0).toFixed(2)
            }
            if (totpro > 0) {
                soma_totpro = (parseFloat(soma_totpro) + parseFloat(totpro)).toFixed(2)
            } else {
                soma_totpro = (parseFloat(soma_totpro) + 0).toFixed(2)
            }
            if (totges > 0) {
                soma_totges = (parseFloat(soma_totges) + parseFloat(totges)).toFixed(2)
            } else {
                soma_totges = (parseFloat(soma_totges) + 0).toFixed(2)
            }
            if (vlrart > 0) {
                soma_totart = (parseFloat(soma_totart) + parseFloat(vlrart)).toFixed(2)
            } else {
                soma_totart = (parseFloat(soma_totart) + 0).toFixed(2)
            }
            //Tributos
            soma_tottrb = (parseFloat(soma_tottrb) + parseFloat(totalTributos)).toFixed(2)
            //Comissão
            soma_totcom = (parseFloat(soma_totcom) + parseFloat(vlrcom)).toFixed(2)
            //Despesas Administrativas
            if (desAdm != undefined) {
                soma_totadm = (parseFloat(soma_totadm) + parseFloat(desAdm)).toFixed(2)
            }

            //Custos Variáveis
            if (totdes > 0 || totali > 0 || totcmb > 0 || tothtl > 0) {
                soma_varkwp = parseFloat(soma_varkwp) + parseFloat(potencia)
                //console.log('soma_varkwp=>' + soma_varkwp)
                soma_varfat = parseFloat(soma_varfat) + parseFloat(vlrNFS)
            }
            if (totdes > 0) {
                soma_totdes = (parseFloat(soma_totdes) + parseFloat(totdes)).toFixed(2)
            } else {
                soma_totdes = (parseFloat(soma_totdes) + 0).toFixed(2)
            }
            if (totali > 0) {
                soma_totali = (parseFloat(soma_totali) + parseFloat(totali)).toFixed(2)
            } else {
                soma_totali = (parseFloat(soma_totali) + 0).toFixed(2)
            }
            if (totcmb > 0) {
                soma_totcmb = (parseFloat(soma_totcmb) + parseFloat(totcmb)).toFixed(2)
            } else {
                soma_totcmb = (parseFloat(soma_totcmb) + 0).toFixed(2)
            }
            if (tothtl > 0) {
                soma_tothtl = (parseFloat(soma_tothtl) + parseFloat(tothtl)).toFixed(2)
            } else {
                soma_tothtl = (parseFloat(soma_tothtl) + 0).toFixed(2)
            }

            //Custos Variáveis Estruturais
            if (valorCer > 0 || valorCen > 0 || valorPos > 0) {
                soma_estkwp = parseFloat(soma_estkwp) + parseFloat(potencia)
                soma_estfat = parseFloat(soma_estfat) + parseFloat(vlrNFS)
            }

            soma_totcer = (parseFloat(soma_totcer) + parseFloat(valorCer)).toFixed(2)
            soma_totcen = (parseFloat(soma_totcen) + parseFloat(valorCen)).toFixed(2)
            soma_totpos = (parseFloat(soma_totpos) + parseFloat(valorPos)).toFixed(2)

            if (parseFloat(valorMod) > 0) {
                soma_equkwp = parseFloat(soma_equkwp) + parseFloat(potencia)
            }
            //console.log('soma_equkwp=>'+soma_equkwp)
            //Soma percentuais componentes
            //console.log('valorMod=>' + valorMod)
            if (valorMod != undefined) {
                soma_modequ = (parseFloat(soma_modequ) + parseFloat(valorMod)).toFixed(2)
            }
            //console.log('soma_modequ=>' + soma_modequ)
            //console.log('valorInv=>' + valorInv)
            if (valorInv != undefined) {
                soma_invequ = (parseFloat(soma_invequ) + parseFloat(valorInv)).toFixed(2)
            }
            //console.log('soma_invequ=>' + soma_invequ)
            //console.log('valorEst=>' + valorEst)
            if (valorEst != undefined) {
                soma_estequ = (parseFloat(soma_estequ) + parseFloat(valorEst)).toFixed(2)
            }
            //console.log('soma_estequ=>' + soma_estequ)
            //console.log('valorCab=>' + valorCab)
            if (valorCab != undefined) {
                soma_cabequ = (parseFloat(soma_cabequ) + parseFloat(valorCab)).toFixed(2)
            }
            //console.log('soma_cabequ=>' + soma_cabequ)
            //console.log('valorDis=>' + valorDis)
            if (valorDis != undefined) {
                soma_disequ = (parseFloat(soma_disequ) + parseFloat(valorDis)).toFixed(2)
            }
            //console.log('soma_disequ=>' + soma_disequ)
            //console.log('valorDPS=>' + valorDPS)
            if (valorDPS != undefined) {
                soma_dpsequ = (parseFloat(soma_dpsequ) + parseFloat(valorDPS)).toFixed(2)
            }
            //console.log('soma_dpsequ=>' + soma_dpsequ)
            //console.log('valorSB=>' + valorSB)
            if (valorSB != undefined) {
                soma_sbxequ = (parseFloat(soma_sbxequ) + parseFloat(valorSB)).toFixed(2)
            }
            //console.log('soma_sbxequ=>' + soma_sbxequ)
            //console.log('valorOcp=>' + valorOcp)
            if (valorOcp != undefined) {
                soma_ocpequ = (parseFloat(soma_ocpequ) + parseFloat(valorOcp)).toFixed(2)
            }
            //console.log('soma_ocpequ=>' + soma_ocpequ)

            //Totais: Projetos Vendidos, Faturamento e Lucro Líquido
            soma_totprj = (parseFloat(soma_totprj) + parseFloat(valor)).toFixed(2)
            soma_totliq = (parseFloat(soma_totliq) + parseFloat(lucroLiquido)).toFixed(2)
        }


        //Média Ponderada projetista
        var per_totpro_com = parseFloat(soma_totpro_com) / parseFloat(soma_totfat_com) * 100
        if (isNaN(per_totpro_com)) {
            per_totpro_com = 0
        }
        var per_totpro_sem = parseFloat(soma_totpro_sem) / parseFloat(soma_totfat_sem) * 100
        if (isNaN(per_totpro_sem)) {
            per_totpro_sem = 0
        }
        var medkwp_totpro_com = parseFloat(soma_totpro_com) / parseFloat(soma_totkwp_com)
        if (isNaN(medkwp_totpro_com)) {
            medkwp_totpro_com = 0
        }
        var medkwp_totpro_sem = parseFloat(soma_totpro_sem) / parseFloat(soma_totkwp_sem)
        if (isNaN(medkwp_totpro_sem)) {
            medkwp_totpro_sem = 0
        }
        var per_totpro = (((parseFloat(medkwp_totpro_com) * parseFloat(per_totpro_com)) + (parseFloat(medkwp_totpro_sem) * parseFloat(per_totpro_sem))) / (parseFloat(medkwp_totpro_com) + parseFloat(medkwp_totpro_sem))).toFixed(2)
        if (isNaN(per_totpro)) {
            per_totpro = 0
        }
        //Média Ponderada ART
        var per_totart_com = parseFloat(soma_totart_com) / parseFloat(soma_totfat_com) * 100
        if (isNaN(per_totart_com)) {
            per_totart_com = 0
        }
        var per_totart_sem = parseFloat(soma_totart_sem) / parseFloat(soma_totfat_sem) * 100
        if (isNaN(per_totart_sem)) {
            per_totart_sem = 0
        }
        var medkwp_totart_com = parseFloat(soma_totart_com) / parseFloat(soma_totkwp_com)
        if (isNaN(medkwp_totart_com)) {
            medkwp_totart_com = 0
        }
        var medkwp_totart_sem = parseFloat(soma_totart_sem) / parseFloat(soma_totkwp_sem)
        if (isNaN(medkwp_totart_sem)) {
            medkwp_totart_sem = 0
        }
        var per_totart = (((parseFloat(medkwp_totart_com) * parseFloat(per_totart_com)) + (parseFloat(medkwp_totart_sem) * parseFloat(per_totart_sem))) / (parseFloat(medkwp_totart_com) + parseFloat(medkwp_totart_sem))).toFixed(2)
        if (isNaN(per_totart)) {
            per_totart = 0
        }
        //Média Ponderada Gestão
        var per_totges_com = parseFloat(soma_totges_com) / parseFloat(soma_totfat_com) * 100
        if (isNaN(per_totges_com)) {
            per_totges_com = 0
        }
        var per_totges_sem = parseFloat(soma_totges_sem) / parseFloat(soma_totfat_sem) * 100
        if (isNaN(per_totges_sem)) {
            per_totges_sem = 0
        }
        var medkwp_totges_com = parseFloat(soma_totges_com) / parseFloat(soma_totkwp_com)
        if (isNaN(medkwp_totges_com)) {
            medkwp_totges_com = 0
        }
        var medkwp_totges_sem = parseFloat(soma_totges_sem) / parseFloat(soma_totkwp_sem)
        if (isNaN(medkwp_totges_sem)) {
            medkwp_totges_sem = 0
        }
        var per_totges = (((parseFloat(medkwp_totges_com) * parseFloat(per_totges_com)) + (parseFloat(medkwp_totges_sem) * parseFloat(per_totges_sem))) / (parseFloat(medkwp_totges_com) + parseFloat(medkwp_totges_sem))).toFixed(2)
        if (isNaN(per_totges)) {
            per_totges = 0
        }
        //Média Ponderada instalação
        var per_totint_com = parseFloat(soma_totint_com) / parseFloat(soma_totfat_com) * 100
        if (isNaN(per_totint_com)) {
            per_totint_com = 0
        }
        var per_totint_sem = parseFloat(soma_totint_sem) / parseFloat(soma_totfat_sem) * 100
        if (isNaN(per_totint_sem)) {
            per_totint_sem = 0
        }
        var medkwp_totint_com = parseFloat(soma_totint_com) / parseFloat(soma_totkwp_com)
        if (isNaN(medkwp_totint_com)) {
            medkwp_totint_com = 0
        }
        var medkwp_totint_sem = parseFloat(soma_totint_sem) / parseFloat(soma_totkwp_sem)
        if (isNaN(medkwp_totint_sem)) {
            medkwp_totint_sem = 0
        }
        var per_totint = (((parseFloat(medkwp_totint_com) * parseFloat(per_totint_com)) + (parseFloat(medkwp_totint_sem) * parseFloat(per_totint_sem))) / (parseFloat(medkwp_totint_com) + parseFloat(medkwp_totint_sem))).toFixed(2)
        if (isNaN(per_totint)) {
            per_totint = 0
        }
        //Média Ponderada Administração
        var per_totadm_com = parseFloat(soma_totadm_com) / parseFloat(soma_totfat_com) * 100
        if (isNaN(per_totadm_com)) {
            per_totadm_com = 0
        }
        var per_totadm_sem = parseFloat(soma_totadm_sem) / parseFloat(soma_totfat_sem) * 100
        if (isNaN(per_totadm_sem)) {
            per_totadm_sem = 0
        }
        var medkwp_totadm_com = parseFloat(soma_totadm_com) / parseFloat(soma_totkwp_com)
        if (isNaN(medkwp_totadm_com)) {
            medkwp_totadm_com = 0
        }
        var medkwp_totadm_sem = parseFloat(soma_totadm_sem) / parseFloat(soma_totkwp_sem)
        if (isNaN(medkwp_totadm_sem)) {
            medkwp_totadm_sem = 0
        }
        var per_totadm = (((parseFloat(medkwp_totadm_com) * parseFloat(per_totadm_com)) + (parseFloat(medkwp_totadm_sem) * parseFloat(per_totadm_sem))) / (parseFloat(medkwp_totadm_com) + parseFloat(medkwp_totadm_sem))).toFixed(2)
        if (isNaN(per_totadm)) {
            per_totadm = 0
        }
        //Média Ponderada Comissão
        var per_totcom_com = parseFloat(soma_totcom_com) / parseFloat(soma_totfat_com) * 100
        if (isNaN(per_totcom_com)) {
            per_totcom_com = 0
        }
        var per_totcom_sem = parseFloat(soma_totcom_sem) / parseFloat(soma_totfat_sem) * 100
        if (isNaN(per_totcom_sem)) {
            per_totcom_sem = 0
        }
        var medkwp_totcom_com = parseFloat(soma_totcom_com) / parseFloat(soma_totkwp_com)
        if (isNaN(medkwp_totcom_com)) {
            medkwp_totcom_com = 0
        }
        var medkwp_totcom_sem = parseFloat(soma_totcom_sem) / parseFloat(soma_totkwp_sem)
        if (isNaN(medkwp_totcom_sem)) {
            medkwp_totcom_sem = 0
        }
        var per_totcom = (((parseFloat(medkwp_totcom_com) * parseFloat(per_totcom_com)) + (parseFloat(medkwp_totcom_sem) * parseFloat(per_totcom_sem))) / (parseFloat(medkwp_totcom_com) + parseFloat(medkwp_totcom_sem))).toFixed(2)
        if (isNaN(per_totcom)) {
            per_totcom = 0
        }
        //Média Ponderada Tributos
        var per_tottrb_com = parseFloat(soma_tottrb_com) / parseFloat(soma_totfat_com) * 100
        if (isNaN(per_tottrb_com)) {
            per_tottrb_com = 0
        }
        var per_tottrb_sem = parseFloat(soma_tottrb_sem) / parseFloat(soma_totfat_sem) * 100
        if (isNaN(per_tottrb_sem)) {
            per_tottrb_sem = 0
        }
        var medkwp_tottrb_com = parseFloat(soma_tottrb_com) / parseFloat(soma_totkwp_com)
        if (isNaN(medkwp_tottrb_com)) {
            medkwp_tottrb_com = 0
        }
        var medkwp_tottrb_sem = parseFloat(soma_tottrb_sem) / parseFloat(soma_totkwp_sem)
        if (isNaN(medkwp_tottrb_sem)) {
            medkwp_tottrb_sem = 0
        }
        var per_tottrb = (((parseFloat(medkwp_tottrb_com) * parseFloat(per_tottrb_com)) + (parseFloat(medkwp_tottrb_sem) * parseFloat(per_tottrb_sem))) / (parseFloat(medkwp_tottrb_com) + parseFloat(medkwp_tottrb_sem))).toFixed(2)
        if (isNaN(per_tottrb)) {
            per_tottrb = 0
        }
        //Total Custos
        var custoFix_com = parseFloat(soma_totcus_com) + parseFloat(soma_totadm_com) + parseFloat(soma_totcom_com) + parseFloat(soma_tottrb_com)
        var custoFix_sem = parseFloat(soma_totcus_sem) + parseFloat(soma_totadm_sem) + parseFloat(soma_totcom_sem) + parseFloat(soma_tottrb_sem)
        var per_totcus_com = parseFloat(custoFix_com) / parseFloat(soma_totfat_com) * 100
        if (isNaN(per_totcus_com)) {
            per_totcus_com = 0
        }
        var per_totcus_sem = parseFloat(custoFix_sem) / parseFloat(soma_totfat_sem) * 100
        if (isNaN(per_totcus_sem)) {
            per_totcus_sem = 0
        }
        var medkwp_totcus_com = parseFloat(custoFix_com) / parseFloat(soma_totkwp_com)
        if (isNaN(medkwp_totcus_com)) {
            medkwp_totcus_com = 0
        }
        var medkwp_totcus_sem = parseFloat(custoFix_sem) / parseFloat(soma_totkwp_sem)
        if (isNaN(medkwp_totcus_sem)) {
            medkwp_totcus_sem = 0
        }
        var per_totcus = (((parseFloat(medkwp_totcus_com) * parseFloat(per_totcus_com)) + (parseFloat(medkwp_totcus_sem) * parseFloat(per_totcus_sem))) / (parseFloat(medkwp_totcus_com) + parseFloat(medkwp_totcus_sem))).toFixed(2)
        if (isNaN(per_totcus)) {
            per_totcus = 0
        }
        //Média Ponderada Custos Variáveis Alimentação
        var per_totali_com = parseFloat(soma_totali_com) / parseFloat(soma_varfat_com) * 100
        if (isNaN(per_totali_com)) {
            per_totali_com = 0
        }
        var per_totali_sem = parseFloat(soma_totali_sem) / parseFloat(soma_varfat_sem) * 100
        if (isNaN(per_totali_sem)) {
            per_totali_sem = 0
        }
        var medkwp_totali_com = parseFloat(soma_totali_com) / parseFloat(soma_varkwp_com)
        if (isNaN(medkwp_totali_com)) {
            medkwp_totali_com = 0
        }
        var medkwp_totali_sem = parseFloat(soma_totali_sem) / parseFloat(soma_varkwp_sem)
        if (isNaN(medkwp_totali_sem)) {
            medkwp_totali_sem = 0
        }
        var per_totali = (((parseFloat(medkwp_totali_com) * parseFloat(per_totali_com)) + (parseFloat(medkwp_totali_sem) * parseFloat(per_totali_sem))) / (parseFloat(medkwp_totali_com) + parseFloat(medkwp_totali_sem))).toFixed(2)
        if (isNaN(per_totali)) {
            per_totali = 0
        }
        //Média Ponderada Custos Variáveis Deslocamento
        var per_totdes_com = parseFloat(soma_totdes_com) / parseFloat(soma_varfat_com) * 100
        if (isNaN(per_totdes_com)) {
            per_totdes_com = 0
        }
        var per_totdes_sem = parseFloat(soma_totdes_sem) / parseFloat(soma_varfat_sem) * 100
        if (isNaN(per_totdes_sem)) {
            per_totdes_sem = 0
        }
        var medkwp_totdes_com = parseFloat(soma_totdes_com) / parseFloat(soma_varkwp_com)
        if (isNaN(medkwp_totdes_com)) {
            medkwp_totdes_com = 0
        }
        var medkwp_totdes_sem = parseFloat(soma_totdes_sem) / parseFloat(soma_varkwp_sem)
        if (isNaN(medkwp_totdes_sem)) {
            medkwp_totdes_sem = 0
        }
        var per_totdes = (((parseFloat(medkwp_totdes_com) * parseFloat(per_totdes_com)) + (parseFloat(medkwp_totdes_sem) * parseFloat(per_totdes_sem))) / (parseFloat(medkwp_totdes_com) + parseFloat(medkwp_totdes_sem))).toFixed(2)
        if (isNaN(per_totdes)) {
            per_totdes = 0
        }
        //Média Ponderada Custos Variáveis Combustível
        var per_totcmb_com = parseFloat(soma_totcmb_com) / parseFloat(soma_varfat_com) * 100
        if (isNaN(per_totcmb_com)) {
            per_totcmb_com = 0
        }
        var per_totcmb_sem = parseFloat(soma_totcmb_sem) / parseFloat(soma_varfat_sem) * 100
        if (isNaN(per_totcmb_sem)) {
            per_totcmb_sem = 0
        }
        var medkwp_totcmb_com = parseFloat(soma_totcmb_com) / parseFloat(soma_varkwp_com)
        if (isNaN(medkwp_totcmb_com)) {
            medkwp_totcmb_com = 0
        }
        var medkwp_totcmb_sem = parseFloat(soma_totcmb_sem) / parseFloat(soma_varkwp_sem)
        if (isNaN(medkwp_totcmb_sem)) {
            medkwp_totcmb_sem = 0
        }
        var per_totcmb = (((parseFloat(medkwp_totcmb_com) * parseFloat(per_totcmb_com)) + (parseFloat(medkwp_totcmb_sem) * parseFloat(per_totcmb_sem))) / (parseFloat(medkwp_totcmb_com) + parseFloat(medkwp_totcmb_sem))).toFixed(2)
        if (isNaN(per_totcmb)) {
            per_totcmb = 0
        }
        //Média Ponderada Custos Variáveis Hotel
        var per_tothtl_com = parseFloat(soma_tothtl_com) / parseFloat(soma_varfat_com) * 100
        if (isNaN(per_tothtl_com)) {
            per_tothtl_com = 0
        }
        var per_tothtl_sem = parseFloat(soma_tothtl_sem) / parseFloat(soma_varfat_sem) * 100
        if (isNaN(per_tothtl_sem)) {
            per_tothtl_sem = 0
        }
        var medkwp_tothtl_com = parseFloat(soma_tothtl_com) / parseFloat(soma_varkwp_com)
        if (isNaN(medkwp_tothtl_com)) {
            medkwp_tothtl_com = 0
        }
        var medkwp_tothtl_sem = parseFloat(soma_tothtl_sem) / parseFloat(soma_varkwp_sem)
        if (isNaN(medkwp_tothtl_sem)) {
            medkwp_tothtl_sem = 0
        }
        var per_tothtl = (((parseFloat(medkwp_tothtl_com) * parseFloat(per_tothtl_com)) + (parseFloat(medkwp_tothtl_sem) * parseFloat(per_tothtl_sem))) / (parseFloat(medkwp_tothtl_com) + parseFloat(medkwp_tothtl_sem))).toFixed(2)
        if (isNaN(per_tothtl)) {
            per_tothtl = 0
        }
        //Total Custos Variáveis
        var custoVar_com = parseFloat(soma_totvar_com)
        var custoVar_sem = parseFloat(soma_totvar_sem)
        var per_totvar_com = parseFloat(custoVar_com) / parseFloat(soma_varfat_com) * 100
        if (isNaN(per_totvar_com)) {
            per_totvar_com = 0
        }
        var per_totvar_sem = parseFloat(custoVar_sem) / parseFloat(soma_varfat_sem) * 100
        if (isNaN(per_totvar_sem)) {
            per_totvar_sem = 0
        }
        var medkwp_totvar_com = parseFloat(custoVar_com) / parseFloat(soma_varkwp_com)
        if (isNaN(medkwp_totvar_com)) {
            medkwp_totvar_com = 0
        }
        var medkwp_totvar_sem = parseFloat(custoVar_sem) / parseFloat(soma_varkwp_sem)
        if (isNaN(medkwp_totvar_sem)) {
            medkwp_totvar_sem = 0
        }
        var per_totvar = (((parseFloat(medkwp_totvar_com) * parseFloat(per_totvar_com)) + (parseFloat(medkwp_totvar_sem) * parseFloat(per_totvar_sem))) / (parseFloat(medkwp_totvar_com) + parseFloat(medkwp_totvar_sem))).toFixed(2)
        if (isNaN(per_totvar)) {
            per_totvar = 0
        }
        //Média Ponderada Variáveis Estruturais Cercamento  
        var per_totcer_com = parseFloat(soma_totcer_com) / parseFloat(soma_estfat_com) * 100
        if (isNaN(per_totcer_com)) {
            per_totcer_com = 0
        }
        var per_totcer_sem = parseFloat(soma_totcer_sem) / parseFloat(soma_estfat_sem) * 100
        if (isNaN(per_totcer_sem)) {
            per_totcer_sem = 0
        }
        var medkwp_totcer_com = parseFloat(soma_totcer_com) / parseFloat(soma_estkwp_com)
        if (isNaN(medkwp_totcer_com)) {
            medkwp_totcer_com = 0
        }
        var medkwp_totcer_sem = parseFloat(soma_totcer_sem) / parseFloat(soma_estkwp_sem)
        if (isNaN(medkwp_totcer_sem)) {
            medkwp_totcer_sem = 0
        }
        var per_totcer = (((parseFloat(medkwp_totcer_com) * parseFloat(per_totcer_com)) + (parseFloat(medkwp_totcer_sem) * parseFloat(per_totcer_sem))) / (parseFloat(medkwp_totcer_com) + parseFloat(medkwp_totcer_sem))).toFixed(2)
        if (isNaN(per_totcer)) {
            per_totcer = 0
        }
        //Média Ponderada Variáveis Estruturais Central
        var per_totcen_com = parseFloat(soma_totcen_com) / parseFloat(soma_estfat_com) * 100
        if (isNaN(per_totcen_com)) {
            per_totcen_com = 0
        }
        var per_totcen_sem = parseFloat(soma_totcen_sem) / parseFloat(soma_estfat_sem) * 100
        if (isNaN(per_totcen_sem)) {
            per_totcen_sem = 0
        }
        var medkwp_totcen_com = parseFloat(soma_totcen_com) / parseFloat(soma_estkwp_com)
        if (isNaN(medkwp_totcen_com)) {
            medkwp_totcen_com = 0
        }
        var medkwp_totcen_sem = parseFloat(soma_totcen_sem) / parseFloat(soma_estkwp_sem)
        if (isNaN(medkwp_totcen_sem)) {
            medkwp_totcen_sem = 0
        }
        var per_totcen = (((parseFloat(medkwp_totcen_com) * parseFloat(per_totcen_com)) + (parseFloat(medkwp_totcen_sem) * parseFloat(per_totcen_sem))) / (parseFloat(medkwp_totcen_com) + parseFloat(medkwp_totcen_sem))).toFixed(2)
        if (isNaN(per_totcen)) {
            per_totcen = 0
        }
        //Média Ponderada Variáveis Estruturais Postes
        var per_totpos_com = parseFloat(soma_totpos_com) / parseFloat(soma_estfat_com) * 100
        if (isNaN(per_totpos_com)) {
            per_totpos_com = 0
        }
        var per_totpos_sem = parseFloat(soma_totpos_sem) / parseFloat(soma_estfat_sem) * 100
        if (isNaN(per_totpos_sem)) {
            per_totpos_sem = 0
        }
        var medkwp_totpos_com = parseFloat(soma_totpos_com) / parseFloat(soma_estkwp_com)
        if (isNaN(medkwp_totpos_com)) {
            medkwp_totpos_com = 0
        }
        var medkwp_totpos_sem = parseFloat(soma_totpos_sem) / parseFloat(soma_estkwp_sem)
        if (isNaN(medkwp_totpos_sem)) {
            medkwp_totpos_sem = 0
        }
        var per_totpos = (((parseFloat(medkwp_totpos_com) * parseFloat(per_totpos_com)) + (parseFloat(medkwp_totpos_sem) * parseFloat(per_totpos_sem))) / (parseFloat(medkwp_totpos_com) + parseFloat(medkwp_totpos_sem))).toFixed(2)
        if (isNaN(per_totpos)) {
            per_totpos = 0
        }
        //Total Custos Variáveis Estruturais
        var custoEst_com = parseFloat(soma_totest_com)
        if (isNaN(custoEst_com)) {
            custoEst_com = 0
        }
        var custoEst_sem = parseFloat(soma_totest_sem)
        if (isNaN(custoEst_sem)) {
            custoEst_sem = 0
        }
        var per_totest_com = parseFloat(custoEst_com) / parseFloat(soma_estfat_com) * 100
        if (isNaN(per_totest_com)) {
            per_totest_com = 0
        }
        var per_totest_sem = parseFloat(custoEst_sem) / parseFloat(soma_estfat_sem) * 100
        if (isNaN(per_totest_sem)) {
            per_totest_sem = 0
        }
        var medkwp_totest_com = parseFloat(custoEst_com) / parseFloat(soma_estkwp_com)
        if (isNaN(medkwp_totest_com)) {
            medkwp_totest_com = 0
        }
        var medkwp_totest_sem = parseFloat(custoEst_sem) / parseFloat(soma_estkwp_sem)
        if (isNaN(medkwp_totest_sem)) {
            medkwp_totest_sem = 0
        }
        var per_totest = (((parseFloat(medkwp_totest_com) * parseFloat(per_totest_com)) + (parseFloat(medkwp_totest_sem) * parseFloat(per_totest_sem))) / (parseFloat(medkwp_totest_com) + parseFloat(medkwp_totest_sem))).toFixed(2)
        if (isNaN(per_totest)) {
            per_totest = 0
        }

        soma_custoFix = parseFloat(soma_totint) + parseFloat(soma_totpro) + parseFloat(soma_totart) + parseFloat(soma_totges) + parseFloat(soma_tottrb) + parseFloat(soma_totcom) + parseFloat(soma_totadm)
        soma_custoVar = parseFloat(soma_totali) + parseFloat(soma_totdes) + parseFloat(soma_tothtl) + parseFloat(soma_totcmb)
        soma_custoEst = parseFloat(soma_totcer) + parseFloat(soma_totcen) + parseFloat(soma_totpos)
        soma_totfat = parseFloat(soma_kitfat) + parseFloat(soma_serfat)

        //Soma Total Componentes
        soma_totequ = parseFloat(soma_modequ) + parseFloat(soma_invequ) + parseFloat(soma_estequ) + parseFloat(soma_cabequ) + parseFloat(soma_disequ) + parseFloat(soma_dpsequ) + parseFloat(soma_sbxequ) + parseFloat(soma_ocpequ)

        //Custos Fixos 
        medkwp_custoFix = (parseFloat(soma_custoFix) / parseFloat(soma_totkwp)).toFixed(2)
        if (isNaN(medkwp_custoFix)) {
            medkwp_custoFix = 0
        }
        medkwp_cusfat = (parseFloat(soma_totfat) / parseFloat(soma_totkwp)).toFixed(2)
        //Serviço
        medkwp_totint = (parseFloat(soma_totint) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totpro = (parseFloat(soma_totpro) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totges = (parseFloat(soma_totges) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totart = (parseFloat(soma_totart) / parseFloat(soma_totkwp)).toFixed(2)
        //Tributos
        medkwp_tottrb = (parseFloat(soma_tottrb) / parseFloat(soma_totkwp)).toFixed(2)
        //Comissão
        medkwp_totcom = (parseFloat(soma_totcom) / parseFloat(soma_totkwp)).toFixed(2)
        //Despesas Administrativas
        medkwp_totadm = (parseFloat(soma_totadm) / parseFloat(soma_totkwp)).toFixed(2)
        //Custos Variáveis
        medkwp_custoVar = (parseFloat(soma_custoVar) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_custoVar)) {
            medkwp_custoVar = 0
        }
        medkwp_varfat = (parseFloat(soma_varfat) / parseFloat(soma_varkwp)).toFixed(2)
        medkwp_totdes = ((parseFloat(soma_totdes) + parseFloat(soma_tothtl) + parseFloat(soma_totcmb)) / parseFloat(soma_varkwp)).toFixed(2)
        medkwp_totali = (parseFloat(soma_totali) / parseFloat(soma_varkwp)).toFixed(2)
        medkwp_tothtl = (parseFloat(soma_tothtl) / parseFloat(soma_varkwp)).toFixed(2)
        medkwp_totcmb = (parseFloat(soma_totcmb) / parseFloat(soma_varkwp)).toFixed(2)
        //Custos Variáveis Estruturais
        medkwp_custoEst = (parseFloat(soma_custoEst) / parseFloat(soma_estkwp)).toFixed(2)
        if (isNaN(medkwp_custoEst)) {
            medkwp_custoEst = 0
        }
        medkwp_totcer = (parseFloat(soma_totcer) / parseFloat(soma_estkwp)).toFixed(2)
        medkwp_totcen = (parseFloat(soma_totcen) / parseFloat(soma_estkwp)).toFixed(2)
        medkwp_totpos = (parseFloat(soma_totpos) / parseFloat(soma_estkwp)).toFixed(2)
        //Médias de total faturado por kit e por serviços
        soma_totser = (parseFloat(medkwp_custoFix) + parseFloat(medkwp_custoVar) + parseFloat(medkwp_custoEst)).toFixed(2)

        //medkwp_serfat = parseFloat(soma_serfat) / parseFloat(soma_serkwp)
        per_totliq = ((parseFloat(soma_totliq) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_dispendio = (100 - parseFloat(per_totliq)).toFixed(2)
        per_kitfat = ((parseFloat(soma_totkit) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_comfat = ((parseFloat(soma_totcom) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_cusfat = ((parseFloat(soma_totcop) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_desfat = ((parseFloat(soma_totadm) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_trbfat = ((parseFloat(soma_tottrb) / parseFloat(soma_totfat)) * 100).toFixed(2)
        //Média componentes
        med_modequ = (parseFloat(soma_modequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_invequ = (parseFloat(soma_invequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_estequ = (parseFloat(soma_estequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_cabequ = (parseFloat(soma_cabequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_dpsequ = (parseFloat(soma_dpsequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_disequ = (parseFloat(soma_disequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_sbxequ = (parseFloat(soma_sbxequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_ocpequ = (parseFloat(soma_ocpequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_totequ = (parseFloat(soma_totequ) / parseFloat(soma_equkwp)).toFixed(2)
        //Percentual componentes
        per_modequ = ((parseFloat(soma_modequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_invequ = ((parseFloat(soma_invequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_estequ = ((parseFloat(soma_estequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_cabequ = ((parseFloat(soma_cabequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_disequ = ((parseFloat(soma_disequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_dpsequ = ((parseFloat(soma_dpsequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_sbxequ = ((parseFloat(soma_sbxequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_ocpequ = ((parseFloat(soma_ocpequ) / parseFloat(soma_totequ)) * 100).toFixed(2)

        res.render('relatorios/dashboardcustos', {
            mestitulo, ano,
            soma_totkwp, soma_varkwp, soma_estkwp,
            soma_totfat, soma_totcop,

            soma_totint, soma_totpro, soma_totges, soma_totadm, soma_totcom, soma_tottrb, soma_totart,
            soma_custoFix, soma_totdes, soma_totali, soma_totcmb, soma_tothtl, soma_custoVar,
            soma_varfat, soma_totcer, soma_totcen, soma_totpos, soma_custoEst, soma_estfat,

            soma_totkit, soma_totprj, soma_totliq, soma_totser,

            medkwp_totint, medkwp_totpro, medkwp_totges, medkwp_totadm, medkwp_totcom, medkwp_totart,
            medkwp_tottrb, medkwp_custoFix, medkwp_totdes, medkwp_totali, medkwp_tothtl, medkwp_totcmb,
            medkwp_custoVar, medkwp_varfat, medkwp_totcer, medkwp_totcen, medkwp_totpos,
            medkwp_custoEst,

            per_totint, per_totpro, per_totart, per_totges, per_totadm, per_tottrb, per_totcom, per_totcus, per_totvar,
            per_totali, per_totdes, per_tothtl, per_totcmb, per_totvar,
            per_totcer, per_totcen, per_totpos, per_totest,

            numprj, per_totliq, per_dispendio, per_kitfat, per_comfat, per_cusfat, per_desfat, per_trbfat,

            soma_modequ, soma_invequ, soma_estequ, soma_cabequ, soma_dpsequ, soma_disequ, soma_sbxequ, soma_ocpequ, soma_totequ,
            per_modequ, per_invequ, per_estequ, per_cabequ, per_dpsequ, per_disequ, per_sbxequ, per_ocpequ,
            med_modequ, med_invequ, med_estequ, med_cabequ, med_dpsequ, med_disequ, med_sbxequ, med_ocpequ, med_totequ,
        })
    })
})

router.post('/filtradashcomkit', ehAdmin, (req, res) => {
    const { _id } = req.user
    var ano = req.body.mesano
    var dataini
    var datafim
    var mestitulo

    //console.log('req.body.messel=>' + req.body.messel)

    switch (req.body.messel) {
        case 'Janeiro':
            dataini = ano + '01' + '01'
            datafim = ano + '01' + '31'
            mestitulo = 'Janeiro de '
            break;
        case 'Fevereiro':
            dataini = ano + '02' + '01'
            datafim = ano + '02' + '28'
            mestitulo = 'Fevereiro de '
            break;
        case 'Março':
            dataini = ano + '03' + '01'
            datafim = ano + '03' + '31'
            mestitulo = 'Março /'
            break;
        case 'Abril':
            dataini = ano + '04' + '01'
            datafim = ano + '04' + '30'
            mestitulo = 'Abril de '
            break;
        case 'Maio':
            dataini = ano + '05' + '01'
            datafim = ano + '05' + '31'
            mestitulo = 'Maio de '
            break;
        case 'Junho':
            dataini = ano + '06' + '01'
            datafim = ano + '06' + '30'
            mestitulo = 'Junho de '
            break;
        case 'Julho':
            dataini = ano + '07' + '01'
            datafim = ano + '07' + '31'
            mestitulo = 'Julho de '
            break;
        case 'Agosto':
            dataini = ano + '08' + '01'
            datafim = ano + '08' + '30'
            mestitulo = 'Agosto de '
            break;
        case 'Setembro':
            dataini = ano + '09' + '01'
            datafim = ano + '09' + '31'
            mestitulo = 'Setembro de '
            break;
        case 'Outubro':
            dataini = ano + '10' + '01'
            datafim = ano + '10' + '31'
            mestitulo = 'Outubro de '
            break;
        case 'Novembro':
            dataini = ano + '11' + '01'
            datafim = ano + '11' + '30'
            mestitulo = 'Novembro de '
            break;
        case 'Dezembro':
            dataini = ano + '12' + '01'
            datafim = ano + '12' + '31'
            mestitulo = 'Dezembro de '
            break;
        default:
            dataini = ano + '01' + '01'
            datafim = ano + '12' + '31'
            mestitulo = 'Todo ano de '
    }

    //console.log('dataini=>' + dataini)
    //console.log('datafim=>' + datafim)

    var numprj = 0
    var soma_totfat = 0

    var soma_totcop = 0
    var soma_totkit = 0
    var soma_totprj = 0
    var soma_totliq = 0
    var soma_totser = 0

    var soma_totkwp = 0
    var soma_equkwp = 0
    var soma_varkwp = 0
    var soma_estkwp = 0

    //Custos Fixos
    var soma_custoFix = 0
    //Serviço
    var soma_totint = 0
    var soma_totpro = 0
    var soma_totges = 0
    var soma_totart = 0
    //Despesas Administrativas
    var soma_totadm = 0
    //Comissões
    var soma_totcom = 0
    //Tributos
    var soma_tottrb = 0
    //Custos Variáveis
    var soma_varfat = 0
    var soma_custoVar = 0
    var soma_totdes = 0
    var soma_totali = 0
    var soma_totcmb = 0
    var soma_tothtl = 0
    //Custos Variáveis Estruturais
    var soma_estfat = 0
    var soma_custoEst = 0
    var soma_totcer = 0
    var soma_totcen = 0
    var soma_totpos = 0

    //Médias
    var medkwp_totfat = 0
    var medkwp_totcop = 0
    //Custos Fixos
    var medkwp_cusfat = 0
    var medkwp_custoFix = 0
    //Serviço
    var medkwp_totint = 0
    var medkwp_totpro = 0
    var medkwp_totges = 0
    var medkwp_totart = 0
    //Despesas Administrativas
    var medkwp_totadm = 0
    //Comissões
    var medkwp_totcom = 0
    //Tributos
    var medkwp_tottrb = 0
    //Despesas Variáveis
    var medkwp_totdes = 0
    var medkwp_totali = 0
    var medkwp_tothtl = 0
    var medkwp_totcmb = 0
    var medkwp_custoVar = 0
    var medkwp_varfat = 0
    //Despesas Variáveis Estruturais
    var medkwp_estfat = 0
    var medkwp_custoEst = 0
    var medkwp_totcer = 0
    var medkwp_totcen = 0
    var medkwp_totpos = 0

    //Custos Fixos
    var per_custoFix = 0
    //Serviço
    var per_totint = 0
    var per_totpro = 0
    var per_totges = 0
    var per_totart = 0
    //Despesas Administrativas
    var per_totadm = 0
    //Comissões
    var per_totcom = 0
    //Tributos
    var per_tottrb = 0
    //Despesas Variáveis
    var per_totdes = 0
    var per_totali = 0
    var per_custoVar = 0
    //Despesas Variáveis Estruturais
    var per_custoEst = 0
    var per_totcer = 0
    var per_totcen = 0
    var per_totpos = 0

    var per_totliq
    var per_dispendio
    var per_kitfat
    var per_comfat
    var per_cusfat
    var per_desfat
    var per_trbfat

    //Percentuais Componentes
    var soma_modequ = 0
    var soma_invequ = 0
    var soma_estequ = 0
    var soma_cabequ = 0
    var soma_dpsequ = 0
    var soma_disequ = 0
    var soma_sbxequ = 0
    var soma_ocpequ = 0

    var soma_totequ = 0
    var per_modequ = 0
    var per_invequ = 0
    var per_estequ = 0
    var per_cabequ = 0
    var per_dpsequ = 0
    var per_disequ = 0
    var per_sbxequ = 0
    var per_ocpequ = 0
    var med_modequ = 0
    var med_invequ = 0
    var med_estequ = 0
    var med_cabequ = 0
    var med_dpsequ = 0
    var med_disequ = 0
    var med_sbxequ = 0
    var med_ocpequ = 0
    var med_totequ = 0

    Realizado.find({ 'datareg': { $lte: datafim, $gte: dataini }, user: _id }).lean().then((realizado) => {

        for (i = 0; i < realizado.length; i++) {

            const { potencia } = realizado[i]
            const { fatequ } = realizado[i]
            const { vlrkit } = realizado[i]
            const { valor } = realizado[i]
            const { vlrNFS } = realizado[i]
            const { custoPlano } = realizado[i]
            const { lucroLiquido } = realizado[i]

            //Custos Fixos
            //Serviços
            const { totpro } = realizado[i]
            const { totges } = realizado[i]
            const { totint } = realizado[i]
            const { vlrart } = realizado[i]
            //Administrativo
            const { desAdm } = realizado[i]
            //Comissão
            const { vlrcom } = realizado[i]
            //Tributos
            const { totalTributos } = realizado[i]
            //Custo Variável
            const { totdes } = realizado[i]
            const { totali } = realizado[i]
            const { totcmb } = realizado[i]
            const { tothtl } = realizado[i]
            //Custo Variavel Estrutural
            const { valorCer } = realizado[i]
            const { valorCen } = realizado[i]
            const { valorPos } = realizado[i]

            //Percentuais Conmponentes
            const { valorMod } = realizado[i]
            const { valorInv } = realizado[i]
            const { valorEst } = realizado[i]
            const { valorCab } = realizado[i]
            const { valorDis } = realizado[i]
            const { valorDPS } = realizado[i]
            const { valorSB } = realizado[i]
            const { valorOcp } = realizado[i]

            if (fatequ == true) {

                numprj++

                soma_totkwp = (parseFloat(soma_totkwp) + parseFloat(potencia)).toFixed(2)
                soma_totcop = (parseFloat(soma_totcop) + parseFloat(custoPlano)).toFixed(2)
                //Totalizador de Faturamento            
                soma_totfat = parseFloat(soma_totfat) + parseFloat(vlrNFS)
                //Totalizador de Kit   
                soma_totkit = parseFloat(soma_totkit) + parseFloat(vlrkit)

                //Custos Fixos 
                //Serviços
                if (totint > 0) {
                    soma_totint = (parseFloat(soma_totint) + parseFloat(totint)).toFixed(2)
                } else {
                    soma_totint = (parseFloat(soma_totint) + 0).toFixed(2)
                }
                if (totpro > 0) {
                    soma_totpro = (parseFloat(soma_totpro) + parseFloat(totpro)).toFixed(2)
                } else {
                    soma_totpro = (parseFloat(soma_totpro) + 0).toFixed(2)
                }
                if (totges > 0) {
                    soma_totges = (parseFloat(soma_totges) + parseFloat(totges)).toFixed(2)
                } else {
                    soma_totges = (parseFloat(soma_totges) + 0).toFixed(2)
                }
                if (vlrart > 0) {
                    soma_totart = (parseFloat(soma_totart) + parseFloat(vlrart)).toFixed(2)
                } else {
                    soma_totart = (parseFloat(soma_totart) + 0).toFixed(2)
                }
                //Tributos
                soma_tottrb = (parseFloat(soma_tottrb) + parseFloat(totalTributos)).toFixed(2)
                //Comissão
                soma_totcom = (parseFloat(soma_totcom) + parseFloat(vlrcom)).toFixed(2)
                //Despesas Administrativas
                if (desAdm != undefined) {
                    soma_totadm = (parseFloat(soma_totadm) + parseFloat(desAdm)).toFixed(2)
                }

                //Custos Variáveis
                if (totdes > 0 || totali > 0 || totcmb > 0 || tothtl > 0) {
                    soma_varkwp = parseFloat(soma_varkwp) + parseFloat(potencia)
                    //console.log('soma_varkwp=>' + soma_varkwp)
                    soma_varfat = parseFloat(soma_varfat) + parseFloat(vlrNFS)
                }
                if (totdes > 0) {
                    soma_totdes = (parseFloat(soma_totdes) + parseFloat(totdes)).toFixed(2)
                } else {
                    soma_totdes = (parseFloat(soma_totdes) + 0).toFixed(2)
                }
                if (totali > 0) {
                    soma_totali = (parseFloat(soma_totali) + parseFloat(totali)).toFixed(2)
                } else {
                    soma_totali = (parseFloat(soma_totali) + 0).toFixed(2)
                }
                if (totcmb > 0) {
                    soma_totcmb = (parseFloat(soma_totcmb) + parseFloat(totcmb)).toFixed(2)
                } else {
                    soma_totcmb = (parseFloat(soma_totcmb) + 0).toFixed(2)
                }
                if (tothtl > 0) {
                    soma_tothtl = (parseFloat(soma_tothtl) + parseFloat(tothtl)).toFixed(2)
                } else {
                    soma_tothtl = (parseFloat(soma_tothtl) + 0).toFixed(2)
                }

                //Custos Variáveis Estruturais
                if (valorCer > 0 || valorCen > 0 || valorPos > 0) {
                    soma_estkwp = parseFloat(soma_estkwp) + parseFloat(potencia)
                    soma_estfat = parseFloat(soma_estfat) + parseFloat(vlrNFS)
                } else {
                    soma_estkwp = parseFloat(soma_estkwp) + 0
                    soma_estfat = parseFloat(soma_estfat) + 0
                }
                if (valorCer > 0) {
                    soma_totcer = (parseFloat(soma_totcer) + parseFloat(valorCer)).toFixed(2)
                } else {
                    soma_totcer = (parseFloat(soma_totcer) + 0).toFixed(2)
                }
                if (valorCen > 0) {
                    soma_totcen = (parseFloat(soma_totcen) + parseFloat(valorCen)).toFixed(2)
                } else {
                    soma_totcen = (parseFloat(soma_totcen) + 0).toFixed(2)
                }
                if (valorPos > 0) {
                    soma_totpos = (parseFloat(soma_totpos) + parseFloat(valorPos)).toFixed(2)
                } else {
                    soma_totpos = (parseFloat(soma_totpos) + 0).toFixed(2)
                }

                if (parseFloat(valorMod) > 0) {
                    soma_equkwp = parseFloat(soma_equkwp) + parseFloat(potencia)
                }
                //Soma percentuais componentes
                //console.log('valorMod=>' + valorMod)
                if (valorMod != undefined) {
                    soma_modequ = (parseFloat(soma_modequ) + parseFloat(valorMod)).toFixed(2)
                }
                //console.log('soma_modequ=>' + soma_modequ)
                //console.log('valorInv=>' + valorInv)
                if (valorInv != undefined) {
                    soma_invequ = (parseFloat(soma_invequ) + parseFloat(valorInv)).toFixed(2)
                }
                //console.log('soma_invequ=>' + soma_invequ)
                //console.log('valorEst=>' + valorEst)
                if (valorEst != undefined) {
                    soma_estequ = (parseFloat(soma_estequ) + parseFloat(valorEst)).toFixed(2)
                }
                //console.log('soma_estequ=>' + soma_estequ)
                //console.log('valorCab=>' + valorCab)
                if (valorCab != undefined) {
                    soma_cabequ = (parseFloat(soma_cabequ) + parseFloat(valorCab)).toFixed(2)
                }
                //console.log('soma_cabequ=>' + soma_cabequ)
                //console.log('valorDis=>' + valorDis)
                if (valorDis != undefined) {
                    soma_disequ = (parseFloat(soma_disequ) + parseFloat(valorDis)).toFixed(2)
                }
                //console.log('soma_disequ=>' + soma_disequ)
                //console.log('valorDPS=>' + valorDPS)
                if (valorDPS != undefined) {
                    soma_dpsequ = (parseFloat(soma_dpsequ) + parseFloat(valorDPS)).toFixed(2)
                }
                //console.log('soma_dpsequ=>' + soma_dpsequ)
                //console.log('valorSB=>' + valorSB)
                if (valorSB != undefined) {
                    soma_sbxequ = (parseFloat(soma_sbxequ) + parseFloat(valorSB)).toFixed(2)
                }
                //console.log('soma_sbxequ=>' + soma_sbxequ)
                //console.log('valorOcp=>' + valorOcp)
                if (valorOcp != undefined) {
                    soma_ocpequ = (parseFloat(soma_ocpequ) + parseFloat(valorOcp)).toFixed(2)
                }
                //console.log('soma_ocpequ=>' + soma_ocpequ)

                //Totais: Projetos Vendidos, Faturamento e Lucro Líquido
                soma_totprj = (parseFloat(soma_totprj) + parseFloat(valor)).toFixed(2)
                soma_totliq = (parseFloat(soma_totliq) + parseFloat(lucroLiquido)).toFixed(2)
            }

        }

        soma_custoFix = parseFloat(soma_totint) + parseFloat(soma_totpro) + parseFloat(soma_totart) + parseFloat(soma_totges) + parseFloat(soma_tottrb) + parseFloat(soma_totcom) + parseFloat(soma_totadm)
        soma_custoVar = parseFloat(soma_totali) + parseFloat(soma_totdes) + parseFloat(soma_tothtl) + parseFloat(soma_totcmb)
        soma_custoEst = parseFloat(soma_totcer) + parseFloat(soma_totcen) + parseFloat(soma_totpos)

        //Soma Total Componentes
        soma_totequ = parseFloat(soma_modequ) + parseFloat(soma_invequ) + parseFloat(soma_estequ) + parseFloat(soma_cabequ) + parseFloat(soma_disequ) + parseFloat(soma_dpsequ) + parseFloat(soma_sbxequ) + parseFloat(soma_ocpequ)
        //Médias
        medkwp_totfat = (parseFloat(soma_totfat) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totkit = (parseFloat(soma_totkit) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totcop = (parseFloat(soma_totcop) / parseFloat(soma_totkwp)).toFixed(2)

        //Custos Fixos 
        medkwp_custoFix = (parseFloat(soma_custoFix) / parseFloat(soma_totkwp)).toFixed(2)
        if (isNaN(medkwp_custoFix)) {
            medkwp_custoFix = 0
        }
        medkwp_cusfat = (parseFloat(soma_totfat) / parseFloat(soma_totkwp)).toFixed(2)
        //Serviço
        medkwp_totint = (parseFloat(soma_totint) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totpro = (parseFloat(soma_totpro) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totges = (parseFloat(soma_totges) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totart = (parseFloat(soma_totart) / parseFloat(soma_totkwp)).toFixed(2)
        //Tributos
        medkwp_tottrb = (parseFloat(soma_tottrb) / parseFloat(soma_totkwp)).toFixed(2)
        //Comissão
        medkwp_totcom = (parseFloat(soma_totcom) / parseFloat(soma_totkwp)).toFixed(2)
        //Despesas Administrativas
        medkwp_totadm = (parseFloat(soma_totadm) / parseFloat(soma_totkwp)).toFixed(2)
        //Custos Variáveis
        medkwp_custoVar = (parseFloat(soma_custoVar) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_custoVar)) {
            medkwp_custoVar = 0
        }
        medkwp_varfat = (parseFloat(soma_varfat) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_varfat)) {
            medkwp_varfat = 0
        }
        medkwp_totdes = ((parseFloat(soma_totdes) + parseFloat(soma_tothtl) + parseFloat(soma_totcmb)) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_totdes)) {
            medkwp_totdes = 0
        }
        medkwp_totali = (parseFloat(soma_totali) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_totdes)) {
            medkwp_totdes = 0
        }
        medkwp_tothtl = (parseFloat(soma_tothtl) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_tothtl)) {
            medkwp_tothtl = 0
        }
        medkwp_totcmb = (parseFloat(soma_totcmb) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_totcmb)) {
            medkwp_totcmb = 0
        }

        //Custos Variáveis Estruturais
        if (parseFloat(soma_estkwp) > 0) {
            medkwp_custoEst = (parseFloat(soma_custoEst) / parseFloat(soma_estkwp)).toFixed(2)
            medkwp_estfat = (parseFloat(soma_estfat) / parseFloat(soma_estkwp)).toFixed(2)
            medkwp_totcer = (parseFloat(soma_totcer) / parseFloat(soma_estkwp)).toFixed(2)
            medkwp_totcen = (parseFloat(soma_totcen) / parseFloat(soma_estkwp)).toFixed(2)
            medkwp_totpos = (parseFloat(soma_totpos) / parseFloat(soma_estkwp)).toFixed(2)
        }

        //Custos Fixos
        per_totpro = (parseFloat(medkwp_totpro) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totart = (parseFloat(medkwp_totart) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totges = (parseFloat(medkwp_totges) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totint = (parseFloat(medkwp_totint) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totadm = (parseFloat(medkwp_totadm) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totcom = (parseFloat(medkwp_totcom) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_tottrb = (parseFloat(medkwp_tottrb) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_custoFix = (parseFloat(medkwp_custoFix) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        //Custos Variáveis
        per_totali = (parseFloat(medkwp_totali) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totdes = (parseFloat(medkwp_totdes) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_tothtl = (parseFloat(medkwp_tothtl) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totcmb = (parseFloat(medkwp_totcmb) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_custoVar = (parseFloat(medkwp_custoVar) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        //Custos Variáveis Estruturais
        per_totcen = (parseFloat(medkwp_totcen) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totcer = (parseFloat(medkwp_totcer) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totpos = (parseFloat(medkwp_totpos) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_custoEst = (parseFloat(medkwp_custoEst) / parseFloat(medkwp_cusfat) * 100).toFixed(2)

        //Médias de total faturado por kit e por serviços
        soma_totser = (parseFloat(medkwp_custoFix) + parseFloat(medkwp_custoVar) + parseFloat(medkwp_custoEst)).toFixed(2)
        //Lucro Liquido x Gastos
        per_totliq = ((parseFloat(soma_totliq) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_dispendio = (100 - parseFloat(per_totliq)).toFixed(2)
        //Participação dos equipamento, custos e despesas
        per_kitfat = ((parseFloat(soma_totkit) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_comfat = ((parseFloat(soma_totcom) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_cusfat = ((parseFloat(soma_totcop) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_desfat = ((parseFloat(soma_totadm) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_trbfat = ((parseFloat(soma_tottrb) / parseFloat(soma_totfat)) * 100).toFixed(2)
        //Média componentes
        med_modequ = (parseFloat(soma_modequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_invequ = (parseFloat(soma_invequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_estequ = (parseFloat(soma_estequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_cabequ = (parseFloat(soma_cabequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_dpsequ = (parseFloat(soma_dpsequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_disequ = (parseFloat(soma_disequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_sbxequ = (parseFloat(soma_sbxequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_ocpequ = (parseFloat(soma_ocpequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_totequ = (parseFloat(soma_totequ) / parseFloat(soma_equkwp)).toFixed(2)
        //Percentual componentes
        per_modequ = ((parseFloat(soma_modequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_invequ = ((parseFloat(soma_invequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_estequ = ((parseFloat(soma_estequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_cabequ = ((parseFloat(soma_cabequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_disequ = ((parseFloat(soma_disequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_dpsequ = ((parseFloat(soma_dpsequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_sbxequ = ((parseFloat(soma_sbxequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_ocpequ = ((parseFloat(soma_ocpequ) / parseFloat(soma_totequ)) * 100).toFixed(2)

        res.render('relatorios/dashboardcustoscomkit', {
            soma_totkwp, soma_varkwp, soma_estkwp,
            soma_totfat, soma_totcop,

            soma_totint, soma_totpro, soma_totges, soma_totadm, soma_totcom, soma_tottrb, soma_totart,
            soma_custoFix, soma_totdes, soma_totali, soma_totcmb, soma_tothtl, soma_custoVar,
            soma_varfat, soma_totcer, soma_totcen, soma_totpos, soma_custoEst, soma_estfat,

            soma_totkit, soma_totprj, soma_totliq, soma_totser,

            medkwp_totint, medkwp_totpro, medkwp_totges, medkwp_totadm, medkwp_totcom, medkwp_totart,
            medkwp_tottrb, medkwp_custoFix, medkwp_cusfat, medkwp_totdes, medkwp_totali, medkwp_tothtl, medkwp_totcmb,
            medkwp_custoVar, medkwp_varfat, medkwp_totcer, medkwp_totcen, medkwp_totpos, medkwp_totcop,
            medkwp_custoEst, medkwp_estfat, medkwp_totfat, medkwp_totkit,

            per_totpro, per_totart, per_totges, per_totint, per_totadm, per_totcom, per_tottrb, per_custoFix,
            per_totali, per_totdes, per_tothtl, per_totcmb, per_custoVar, per_totcen, per_totcer, per_totpos, per_custoEst,

            mestitulo, ano,
            numprj, per_totliq, per_dispendio, per_kitfat, per_comfat, per_cusfat, per_desfat, per_trbfat,

            soma_modequ, soma_invequ, soma_estequ, soma_cabequ, soma_dpsequ, soma_disequ, soma_sbxequ, soma_ocpequ, soma_totequ,
            per_modequ, per_invequ, per_estequ, per_cabequ, per_dpsequ, per_disequ, per_sbxequ, per_ocpequ,
            med_modequ, med_invequ, med_estequ, med_cabequ, med_dpsequ, med_disequ, med_sbxequ, med_ocpequ, med_totequ
        })
    })
})

router.post('/filtradashsemkit', ehAdmin, (req, res) => {
    const { _id } = req.user
    var ano = req.body.mesano
    var dataini
    var datafim
    var mestitulo

    //console.log('req.body.messel=>' + req.body.messel)

    switch (req.body.messel) {
        case 'Janeiro':
            dataini = ano + '01' + '01'
            datafim = ano + '01' + '31'
            mestitulo = 'Janeiro de '
            break;
        case 'Fevereiro':
            dataini = ano + '02' + '01'
            datafim = ano + '02' + '28'
            mestitulo = 'Fevereiro de '
            break;
        case 'Março':
            dataini = ano + '03' + '01'
            datafim = ano + '03' + '31'
            mestitulo = 'Março /'
            break;
        case 'Abril':
            dataini = ano + '04' + '01'
            datafim = ano + '04' + '30'
            mestitulo = 'Abril de '
            break;
        case 'Maio':
            dataini = ano + '05' + '01'
            datafim = ano + '05' + '31'
            mestitulo = 'Maio de '
            break;
        case 'Junho':
            dataini = ano + '06' + '01'
            datafim = ano + '06' + '30'
            mestitulo = 'Junho de '
            break;
        case 'Julho':
            dataini = ano + '07' + '01'
            datafim = ano + '07' + '31'
            mestitulo = 'Julho de '
            break;
        case 'Agosto':
            dataini = ano + '08' + '01'
            datafim = ano + '08' + '30'
            mestitulo = 'Agosto de '
            break;
        case 'Setembro':
            dataini = ano + '09' + '01'
            datafim = ano + '09' + '31'
            mestitulo = 'Setembro de '
            break;
        case 'Outubro':
            dataini = ano + '10' + '01'
            datafim = ano + '10' + '31'
            mestitulo = 'Outubro de '
            break;
        case 'Novembro':
            dataini = ano + '11' + '01'
            datafim = ano + '11' + '30'
            mestitulo = 'Novembro de '
            break;
        case 'Dezembro':
            dataini = ano + '12' + '01'
            datafim = ano + '12' + '31'
            mestitulo = 'Dezembro de '
            break;
        default:
            dataini = ano + '01' + '01'
            datafim = ano + '12' + '31'
            mestitulo = 'Todo ano de '
    }

    //console.log('dataini=>' + dataini)
    //console.log('datafim=>' + datafim)

    var numprj = 0
    var soma_totfat = 0

    var soma_totcop = 0
    var soma_totkit = 0
    var soma_totprj = 0
    var soma_totliq = 0
    var soma_totser = 0

    var soma_totkwp = 0
    var soma_equkwp = 0
    var soma_varkwp = 0
    var soma_estkwp = 0

    //Custos Fixos
    var soma_custoFix = 0
    //Serviço
    var soma_totint = 0
    var soma_totpro = 0
    var soma_totges = 0
    var soma_totart = 0
    //Despesas Administrativas
    var soma_totadm = 0
    //Comissões
    var soma_totcom = 0
    //Tributos
    var soma_tottrb = 0
    //Custos Variáveis
    var soma_varfat = 0
    var soma_custoVar = 0
    var soma_totdes = 0
    var soma_totali = 0
    var soma_totcmb = 0
    var soma_tothtl = 0
    //Custos Variáveis Estruturais
    var soma_estfat = 0
    var soma_custoEst = 0
    var soma_totcer = 0
    var soma_totcen = 0
    var soma_totpos = 0

    //Médias
    var medkwp_totfat = 0
    var medkwp_totcop = 0
    //Custos Fixos
    var medkwp_cusfat = 0
    var medkwp_custoFix = 0
    //Serviço
    var medkwp_totint = 0
    var medkwp_totpro = 0
    var medkwp_totges = 0
    var medkwp_totart = 0
    //Despesas Administrativas
    var medkwp_totadm = 0
    //Comissões
    var medkwp_totcom = 0
    //Tributos
    var medkwp_tottrb = 0
    //Despesas Variáveis
    var medkwp_totdes = 0
    var medkwp_totali = 0
    var medkwp_tothtl = 0
    var medkwp_totcmb = 0
    var medkwp_custoVar = 0
    var medkwp_varfat = 0
    //Despesas Variáveis Estruturais
    var medkwp_estfat = 0
    var medkwp_custoEst = 0
    var medkwp_totcer = 0
    var medkwp_totcen = 0
    var medkwp_totpos = 0

    //Custos Fixos
    var per_custoFix = 0
    //Serviço
    var per_totint = 0
    var per_totpro = 0
    var per_totges = 0
    var per_totart = 0
    //Despesas Administrativas
    var per_totadm = 0
    //Comissões
    var per_totcom = 0
    //Tributos
    var per_tottrb = 0
    //Despesas Variáveis
    var per_totdes = 0
    var per_totali = 0
    var per_custoVar = 0
    //Despesas Variáveis Estruturais
    var per_custoEst = 0
    var per_totcer = 0
    var per_totcen = 0
    var per_totpos = 0

    var per_totliq
    var per_dispendio
    var per_kitfat
    var per_comfat
    var per_cusfat
    var per_desfat
    var per_trbfat

    //Percentuais Componentes
    var soma_modequ = 0
    var soma_invequ = 0
    var soma_estequ = 0
    var soma_cabequ = 0
    var soma_dpsequ = 0
    var soma_disequ = 0
    var soma_sbxequ = 0
    var soma_ocpequ = 0

    var soma_totequ = 0
    var per_modequ = 0
    var per_invequ = 0
    var per_estequ = 0
    var per_cabequ = 0
    var per_dpsequ = 0
    var per_disequ = 0
    var per_sbxequ = 0
    var per_ocpequ = 0
    var med_modequ = 0
    var med_invequ = 0
    var med_estequ = 0
    var med_cabequ = 0
    var med_dpsequ = 0
    var med_disequ = 0
    var med_sbxequ = 0
    var med_ocpequ = 0
    var med_totequ = 0

    Realizado.find({ 'datareg': { $lte: datafim, $gte: dataini }, user: _id }).lean().then((realizado) => {

        for (i = 0; i < realizado.length; i++) {

            //Contar projetos por mês
            /*
            const { datareg } = realizado[i]

            if (datareg != undefined) {
                //Janeiro
                if (datareg >= 20210101 && datareg <= 20210131) {
                    prjjan += 1
                }
                //Fevereiro
                if (datareg >= 20210201 && datareg <= 20210228) {
                    prjfev += 1
                }
                //Março
                if (datareg >= 20210301 && datareg <= 20210331) {
                    prjmar += 1
                }
                //Abril
                if (datareg >= 20210401 && datareg <= 20210430) {
                    prjabr += 1
                }
                //Maio
                if (datareg >= 20210501 && datareg <= 20210530) {
                    prjmai = +1
                }
                //Junho
                if (datareg >= 20210601 && datareg <= 20210631) {
                    prjjun = +1
                }
                //Julho
                if (datareg >= 20210701 && datareg <= 20210730) {
                    prjjul = +1
                }
                //Agosto
                if (datareg >= 20210801 && datareg <= 20210831) {
                    prjago = +1
                }
                //Setembro
                if (datareg >= 20210901 && datareg <= 20210930) {
                    prjset = +1
                }
                //Outubro
                if (datareg >= 20211001 && datareg <= 20211031) {
                    prjout = +1
                }
                //Novembro
                if (datareg >= 20211101 && datareg <= 20211130) {
                    prjnov = +1
                }
                //Dezembro
                if (datareg >= 20211201 && datareg <= 20211231) {
                    prjdez = +1
                }
            }
            */

            const { potencia } = realizado[i]
            const { fatequ } = realizado[i]
            const { vlrkit } = realizado[i]
            const { valor } = realizado[i]
            const { vlrNFS } = realizado[i]
            const { custoPlano } = realizado[i]
            const { lucroLiquido } = realizado[i]

            //Custos Fixos
            //Serviços
            const { totpro } = realizado[i]
            const { totges } = realizado[i]
            const { totint } = realizado[i]
            const { vlrart } = realizado[i]
            //Administrativo
            const { desAdm } = realizado[i]
            //Comissão
            const { vlrcom } = realizado[i]
            //Tributos
            const { totalTributos } = realizado[i]
            //Custo Variável
            const { totdes } = realizado[i]
            const { totali } = realizado[i]
            const { totcmb } = realizado[i]
            const { tothtl } = realizado[i]
            //Custo Variavel Estrutural
            const { valorCer } = realizado[i]
            const { valorCen } = realizado[i]
            const { valorPos } = realizado[i]

            //Percentuais Conmponentes
            const { valorMod } = realizado[i]
            const { valorInv } = realizado[i]
            const { valorEst } = realizado[i]
            const { valorCab } = realizado[i]
            const { valorDis } = realizado[i]
            const { valorDPS } = realizado[i]
            const { valorSB } = realizado[i]
            const { valorOcp } = realizado[i]

            if (fatequ == false) {

                numprj++

                soma_totkwp = (parseFloat(soma_totkwp) + parseFloat(potencia)).toFixed(2)
                soma_totcop = (parseFloat(soma_totcop) + parseFloat(custoPlano)).toFixed(2)
                //Totalizador de Faturamento            
                soma_totfat = parseFloat(soma_totfat) + parseFloat(vlrNFS)
                //Totalizador de Kit   
                soma_totkit = parseFloat(soma_totkit) + parseFloat(vlrkit)

                //Custos Fixos 
                //Serviços
                if (totint > 0) {
                    soma_totint = (parseFloat(soma_totint) + parseFloat(totint)).toFixed(2)
                } else {
                    soma_totint = (parseFloat(soma_totint) + 0).toFixed(2)
                }
                if (totpro > 0) {
                    soma_totpro = (parseFloat(soma_totpro) + parseFloat(totpro)).toFixed(2)
                } else {
                    soma_totpro = (parseFloat(soma_totpro) + 0).toFixed(2)
                }
                if (totges > 0) {
                    soma_totges = (parseFloat(soma_totges) + parseFloat(totges)).toFixed(2)
                } else {
                    soma_totges = (parseFloat(soma_totges) + 0).toFixed(2)
                }
                if (vlrart > 0) {
                    soma_totart = (parseFloat(soma_totart) + parseFloat(vlrart)).toFixed(2)
                } else {
                    soma_totart = (parseFloat(soma_totart) + 0).toFixed(2)
                }
                //Tributos
                soma_tottrb = (parseFloat(soma_tottrb) + parseFloat(totalTributos)).toFixed(2)
                //Comissão
                soma_totcom = (parseFloat(soma_totcom) + parseFloat(vlrcom)).toFixed(2)
                //Despesas Administrativas
                if (desAdm != undefined) {
                    soma_totadm = (parseFloat(soma_totadm) + parseFloat(desAdm)).toFixed(2)
                }

                //Custos Variáveis
                if (totdes > 0 || totali > 0 || totcmb > 0 || tothtl > 0) {
                    soma_varkwp = parseFloat(soma_varkwp) + parseFloat(potencia)
                    //console.log('soma_varkwp=>' + soma_varkwp)
                    soma_varfat = parseFloat(soma_varfat) + parseFloat(vlrNFS)
                }
                if (totdes > 0) {
                    soma_totdes = (parseFloat(soma_totdes) + parseFloat(totdes)).toFixed(2)
                } else {
                    soma_totdes = (parseFloat(soma_totdes) + 0).toFixed(2)
                }
                if (totali > 0) {
                    soma_totali = (parseFloat(soma_totali) + parseFloat(totali)).toFixed(2)
                } else {
                    soma_totali = (parseFloat(soma_totali) + 0).toFixed(2)
                }
                if (totcmb > 0) {
                    soma_totcmb = (parseFloat(soma_totcmb) + parseFloat(totcmb)).toFixed(2)
                } else {
                    soma_totcmb = (parseFloat(soma_totcmb) + 0).toFixed(2)
                }
                if (tothtl > 0) {
                    soma_tothtl = (parseFloat(soma_tothtl) + parseFloat(tothtl)).toFixed(2)
                } else {
                    soma_tothtl = (parseFloat(soma_tothtl) + 0).toFixed(2)
                }

                //Custos Variáveis Estruturais
                if (valorCer > 0 || valorCen > 0 || valorPos > 0) {
                    soma_estkwp = parseFloat(soma_estkwp) + parseFloat(potencia)
                    soma_estfat = parseFloat(soma_estfat) + parseFloat(vlrNFS)
                } else {
                    soma_estkwp = parseFloat(soma_estkwp) + 0
                    soma_estfat = parseFloat(soma_estfat) + 0
                }
                if (valorCer > 0) {
                    soma_totcer = (parseFloat(soma_totcer) + parseFloat(valorCer)).toFixed(2)
                } else {
                    soma_totcer = (parseFloat(soma_totcer) + 0).toFixed(2)
                }
                if (valorCen > 0) {
                    soma_totcen = (parseFloat(soma_totcen) + parseFloat(valorCen)).toFixed(2)
                } else {
                    soma_totcen = (parseFloat(soma_totcen) + 0).toFixed(2)
                }
                if (valorPos > 0) {
                    soma_totpos = (parseFloat(soma_totpos) + parseFloat(valorPos)).toFixed(2)
                } else {
                    soma_totpos = (parseFloat(soma_totpos) + 0).toFixed(2)
                }

                if (parseFloat(valorMod) > 0) {
                    soma_equkwp = parseFloat(soma_equkwp) + parseFloat(potencia)
                }
                //Soma percentuais componentes
                //console.log('valorMod=>' + valorMod)
                if (valorMod != undefined) {
                    soma_modequ = (parseFloat(soma_modequ) + parseFloat(valorMod)).toFixed(2)
                }
                //console.log('soma_modequ=>' + soma_modequ)
                //console.log('valorInv=>' + valorInv)
                if (valorInv != undefined) {
                    soma_invequ = (parseFloat(soma_invequ) + parseFloat(valorInv)).toFixed(2)
                }
                //console.log('soma_invequ=>' + soma_invequ)
                //console.log('valorEst=>' + valorEst)
                if (valorEst != undefined) {
                    soma_estequ = (parseFloat(soma_estequ) + parseFloat(valorEst)).toFixed(2)
                }
                //console.log('soma_estequ=>' + soma_estequ)
                //console.log('valorCab=>' + valorCab)
                if (valorCab != undefined) {
                    soma_cabequ = (parseFloat(soma_cabequ) + parseFloat(valorCab)).toFixed(2)
                }
                //console.log('soma_cabequ=>' + soma_cabequ)
                //console.log('valorDis=>' + valorDis)
                if (valorDis != undefined) {
                    soma_disequ = (parseFloat(soma_disequ) + parseFloat(valorDis)).toFixed(2)
                }
                //console.log('soma_disequ=>' + soma_disequ)
                //console.log('valorDPS=>' + valorDPS)
                if (valorDPS != undefined) {
                    soma_dpsequ = (parseFloat(soma_dpsequ) + parseFloat(valorDPS)).toFixed(2)
                }
                //console.log('soma_dpsequ=>' + soma_dpsequ)
                //console.log('valorSB=>' + valorSB)
                if (valorSB != undefined) {
                    soma_sbxequ = (parseFloat(soma_sbxequ) + parseFloat(valorSB)).toFixed(2)
                }
                //console.log('soma_sbxequ=>' + soma_sbxequ)
                //console.log('valorOcp=>' + valorOcp)
                if (valorOcp != undefined) {
                    soma_ocpequ = (parseFloat(soma_ocpequ) + parseFloat(valorOcp)).toFixed(2)
                }
                //console.log('soma_ocpequ=>' + soma_ocpequ)

                //Totais: Projetos Vendidos, Faturamento e Lucro Líquido
                soma_totprj = (parseFloat(soma_totprj) + parseFloat(valor)).toFixed(2)
                soma_totliq = (parseFloat(soma_totliq) + parseFloat(lucroLiquido)).toFixed(2)
            }

        }

        soma_custoFix = parseFloat(soma_totint) + parseFloat(soma_totpro) + parseFloat(soma_totart) + parseFloat(soma_totges) + parseFloat(soma_tottrb) + parseFloat(soma_totcom) + parseFloat(soma_totadm)
        soma_custoVar = parseFloat(soma_totali) + parseFloat(soma_totdes) + parseFloat(soma_tothtl) + parseFloat(soma_totcmb)
        soma_custoEst = parseFloat(soma_totcer) + parseFloat(soma_totcen) + parseFloat(soma_totpos)

        //Soma Total Componentes
        soma_totequ = parseFloat(soma_modequ) + parseFloat(soma_invequ) + parseFloat(soma_estequ) + parseFloat(soma_cabequ) + parseFloat(soma_disequ) + parseFloat(soma_dpsequ) + parseFloat(soma_sbxequ) + parseFloat(soma_ocpequ)
        //Médias
        medkwp_totfat = (parseFloat(soma_totfat) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totkit = (parseFloat(soma_totkit) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totcop = (parseFloat(soma_totcop) / parseFloat(soma_totkwp)).toFixed(2)

        //Custos Fixos 
        medkwp_custoFix = (parseFloat(soma_custoFix) / parseFloat(soma_totkwp)).toFixed(2)
        if (isNaN(medkwp_custoFix)) {
            medkwp_custoFix = 0
        }
        medkwp_cusfat = (parseFloat(soma_totfat) / parseFloat(soma_totkwp)).toFixed(2)
        //Serviço
        medkwp_totint = (parseFloat(soma_totint) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totpro = (parseFloat(soma_totpro) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totges = (parseFloat(soma_totges) / parseFloat(soma_totkwp)).toFixed(2)
        medkwp_totart = (parseFloat(soma_totart) / parseFloat(soma_totkwp)).toFixed(2)
        //Tributos
        medkwp_tottrb = (parseFloat(soma_tottrb) / parseFloat(soma_totkwp)).toFixed(2)
        //Comissão
        medkwp_totcom = (parseFloat(soma_totcom) / parseFloat(soma_totkwp)).toFixed(2)
        //Despesas Administrativas
        medkwp_totadm = (parseFloat(soma_totadm) / parseFloat(soma_totkwp)).toFixed(2)
        //Custos Variáveis
        medkwp_custoVar = (parseFloat(soma_custoVar) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_custoVar)) {
            medkwp_custoVar = 0
        }
        medkwp_varfat = (parseFloat(soma_varfat) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_varfat)) {
            medkwp_varfat = 0
        }
        medkwp_totdes = ((parseFloat(soma_totdes) + parseFloat(soma_tothtl) + parseFloat(soma_totcmb)) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_totdes)) {
            medkwp_totdes = 0
        }
        medkwp_totali = (parseFloat(soma_totali) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_totdes)) {
            medkwp_totdes = 0
        }
        medkwp_tothtl = (parseFloat(soma_tothtl) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_tothtl)) {
            medkwp_tothtl = 0
        }
        medkwp_totcmb = (parseFloat(soma_totcmb) / parseFloat(soma_varkwp)).toFixed(2)
        if (isNaN(medkwp_totcmb)) {
            medkwp_totcmb = 0
        }

        //Custos Variáveis Estruturais
        if (parseFloat(soma_estkwp) > 0) {
            medkwp_custoEst = (parseFloat(soma_custoEst) / parseFloat(soma_estkwp)).toFixed(2)
            medkwp_estfat = (parseFloat(soma_estfat) / parseFloat(soma_estkwp)).toFixed(2)
            medkwp_totcer = (parseFloat(soma_totcer) / parseFloat(soma_estkwp)).toFixed(2)
            medkwp_totcen = (parseFloat(soma_totcen) / parseFloat(soma_estkwp)).toFixed(2)
            medkwp_totpos = (parseFloat(soma_totpos) / parseFloat(soma_estkwp)).toFixed(2)
        }

        //Custos Fixos
        per_totpro = (parseFloat(medkwp_totpro) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totart = (parseFloat(medkwp_totart) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totges = (parseFloat(medkwp_totges) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totint = (parseFloat(medkwp_totint) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totadm = (parseFloat(medkwp_totadm) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totcom = (parseFloat(medkwp_totcom) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_tottrb = (parseFloat(medkwp_tottrb) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_custoFix = (parseFloat(medkwp_custoFix) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        //Custos Variáveis
        per_totali = (parseFloat(medkwp_totali) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totdes = (parseFloat(medkwp_totdes) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_tothtl = (parseFloat(medkwp_tothtl) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totcmb = (parseFloat(medkwp_totcmb) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_custoVar = (parseFloat(medkwp_custoVar) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        //Custos Variáveis Estruturais
        per_totcen = (parseFloat(medkwp_totcen) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totcer = (parseFloat(medkwp_totcer) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_totpos = (parseFloat(medkwp_totpos) / parseFloat(medkwp_cusfat) * 100).toFixed(2)
        per_custoEst = (parseFloat(medkwp_custoEst) / parseFloat(medkwp_cusfat) * 100).toFixed(2)

        //Médias de total faturado por kit e por serviços
        soma_totser = (parseFloat(medkwp_custoFix) + parseFloat(medkwp_custoVar) + parseFloat(medkwp_custoEst)).toFixed(2)
        //Lucro Liquido x Gastos
        per_totliq = ((parseFloat(soma_totliq) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_dispendio = (100 - parseFloat(per_totliq)).toFixed(2)
        //Participação dos equipamento, custos e despesas
        per_kitfat = ((parseFloat(soma_totkit) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_comfat = ((parseFloat(soma_totcom) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_cusfat = ((parseFloat(soma_totcop) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_desfat = ((parseFloat(soma_totadm) / parseFloat(soma_totfat)) * 100).toFixed(2)
        per_trbfat = ((parseFloat(soma_tottrb) / parseFloat(soma_totfat)) * 100).toFixed(2)
        //Média componentes
        med_modequ = (parseFloat(soma_modequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_invequ = (parseFloat(soma_invequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_estequ = (parseFloat(soma_estequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_cabequ = (parseFloat(soma_cabequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_dpsequ = (parseFloat(soma_dpsequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_disequ = (parseFloat(soma_disequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_sbxequ = (parseFloat(soma_sbxequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_ocpequ = (parseFloat(soma_ocpequ) / parseFloat(soma_equkwp)).toFixed(2)
        med_totequ = (parseFloat(soma_totequ) / parseFloat(soma_equkwp)).toFixed(2)
        //Percentual componentes
        per_modequ = ((parseFloat(soma_modequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_invequ = ((parseFloat(soma_invequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_estequ = ((parseFloat(soma_estequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_cabequ = ((parseFloat(soma_cabequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_disequ = ((parseFloat(soma_disequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_dpsequ = ((parseFloat(soma_dpsequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_sbxequ = ((parseFloat(soma_sbxequ) / parseFloat(soma_totequ)) * 100).toFixed(2)
        per_ocpequ = ((parseFloat(soma_ocpequ) / parseFloat(soma_totequ)) * 100).toFixed(2)

        res.render('relatorios/dashboardcustossemkit', {
            soma_totkwp, soma_varkwp, soma_estkwp,
            soma_totfat, soma_totcop,

            soma_totint, soma_totpro, soma_totges, soma_totadm, soma_totcom, soma_tottrb, soma_totart,
            soma_custoFix, soma_totdes, soma_totali, soma_totcmb, soma_tothtl, soma_custoVar,
            soma_varfat, soma_totcer, soma_totcen, soma_totpos, soma_custoEst, soma_estfat,

            soma_totkit, soma_totprj, soma_totliq, soma_totser,

            medkwp_totint, medkwp_totpro, medkwp_totges, medkwp_totadm, medkwp_totcom, medkwp_totart,
            medkwp_tottrb, medkwp_custoFix, medkwp_cusfat, medkwp_totdes, medkwp_totali, medkwp_custoVar,
            medkwp_varfat, medkwp_totcer, medkwp_totcen, medkwp_totpos, medkwp_totcop,
            medkwp_custoEst, medkwp_estfat, medkwp_totfat,

            per_totpro, per_totart, per_totges, per_totint, per_totadm, per_totcom, per_tottrb, per_custoFix,
            per_totali, per_totdes, per_custoVar, per_totcen, per_totcer, per_totpos, per_custoEst,

            mestitulo, ano,
            numprj, per_totliq, per_dispendio, per_kitfat, per_comfat, per_cusfat, per_desfat, per_trbfat,

            soma_modequ, soma_invequ, soma_estequ, soma_cabequ, soma_dpsequ, soma_disequ, soma_sbxequ, soma_ocpequ, soma_totequ,
            per_modequ, per_invequ, per_estequ, per_cabequ, per_dpsequ, per_disequ, per_sbxequ, per_ocpequ,
            med_modequ, med_invequ, med_estequ, med_cabequ, med_dpsequ, med_disequ, med_sbxequ, med_ocpequ, med_totequ
        })
    })
})

router.post('/filtrarReal', ehAdmin, (req, res) => {
    const { _id } = req.user
    var data = new Date()
    var ano = data.getFullYear()
    var dataini
    var datafim

    if (req.body.dataini == '' && req.body.dataini == '') {

        switch (req.body.filtromes) {
            case 'Janeiro':
                dataini = ano + '01' + '01'
                datafim = ano + '01' + '31'
                break;
            case 'Fevereiro':
                dataini = ano + '02' + '01'
                datafim = ano + '02' + '28'
                break;
            case 'Março':
                dataini = ano + '03' + '01'
                datafim = ano + '03' + '31'
                break;
            case 'Abril':
                dataini = ano + '04' + '01'
                datafim = ano + '04' + '30'
                break;
            case 'Maio':
                dataini = ano + '05' + '01'
                datafim = ano + '05' + '31'
                break;
            case 'Junho':
                dataini = ano + '06' + '01'
                datafim = ano + '06' + '30'
                break;
            case 'Julho':
                dataini = ano + '07' + '01'
                datafim = ano + '07' + '31'
                break;
            case 'Agosto':
                dataini = ano + '08' + '01'
                datafim = ano + '08' + '30'
                break;
            case 'Setembro':
                dataini = ano + '09' + '01'
                datafim = ano + '09' + '31'
                break;
            case 'Outubro':
                dataini = ano + '10' + '01'
                datafim = ano + '10' + '31'
                break;
            case 'Novembro':
                dataini = ano + '11' + '01'
                datafim = ano + '11' + '30'
                break;
            case 'Dezembro':
                dataini = ano + '12' + '01'
                datafim = ano + '12' + '31'
                break;
            default:
                dataini = ano + '01' + '01'
                datafim = ano + '12' + '31'
        }
    } else {

        var dataini = req.body.dataini
        var diaini = dataini.substring(0, 2)
        var mesini = dataini.substring(3, 5)
        var anoini = dataini.substring(6, 10)
        dataini = anoini + mesini + diaini
        //console.log('diaini=>'+dataini)
        var datafim = req.body.datafim
        var diafim = datafim.substring(0, 2)
        var mesfim = datafim.substring(3, 5)
        var anofim = datafim.substring(6, 10)
        datafim = anofim + mesfim + diafim
        //console.log('datafim=>'+datafim)
    }

    Realizado.find({ 'datareg': { $lte: datafim, $gte: dataini }, user: _id }).lean().then((realizado) => {

        var dia = parseFloat(data.getDate())
        if (dia < 10) {
            dia = '0' + dia
        }
        var mes = parseFloat(data.getMonth()) + 1
        if (mes < 10) {
            mes = '0' + mes
        }
        var ano = data.getFullYear()
        var dataemissao = dia + '/' + mes + '/' + ano
        var hora_emissao = data.getHours()
        var min_emissao = data.getMinutes()
        if (min_emissao < 10) {
            min_emissao = '0' + min_emissao
        }
        var tempo = hora_emissao + ':' + min_emissao
        //Definindo nome do usuário
        const { nome } = req.user
        var nome_usuario = nome
        //Definindo número total de projeto
        var qtdprj = realizado.length

        var soma_valor = 0
        var soma_vlrnfs = 0
        var soma_custo = 0
        var soma_lbaimp = 0
        var soma_lb = 0
        var soma_ll = 0
        var soma_tributos = 0
        for (i = 0; i < realizado.length; i++) {
            const { valor } = realizado[i]
            //console.log('valor=>'+valor)
            const { vlrNFS } = realizado[i]
            //console.log('valor=>'+vlrNFS)
            const { custoPlano } = realizado[i]
            //console.log('custoPlano=>'+custoPlano)
            const { lbaimp } = realizado[i]
            //console.log('lucroBruto=>'+lucroBruto)
            const { lucroBruto } = realizado[i]
            //console.log('lucroBruto=>'+lucroBruto)
            const { lucroLiquido } = realizado[i]
            //console.log('lucroLiquido=>'+lucroLiquido)
            const { totalImposto } = realizado[i]
            //console.log('totalImposto=>'+totalImposto)
            soma_valor = parseFloat(soma_valor) + parseFloat(valor)
            soma_valor = soma_valor.toFixed(2)
            soma_vlrnfs = parseFloat(soma_vlrnfs) + parseFloat(vlrNFS)
            soma_vlrnfs = soma_vlrnfs.toFixed(2)
            soma_custo = parseFloat(soma_custo) + parseFloat(custoPlano)
            soma_custo = soma_custo.toFixed(2)
            soma_lbaimp = parseFloat(soma_lbaimp) + parseFloat(lbaimp)
            soma_lbaimp = soma_lbaimp.toFixed(2)
            soma_lb = parseFloat(soma_lb) + parseFloat(lucroBruto)
            soma_lb = soma_lb.toFixed(2)
            soma_ll = parseFloat(soma_ll) + parseFloat(lucroLiquido)
            soma_ll = soma_ll.toFixed(2)
            soma_tributos = parseFloat(soma_tributos) + parseFloat(totalImposto)
            soma_tributos = soma_tributos.toFixed(2)
            /*
            //console.log('soma_valor=>'+soma_valor)
            //console.log('soma_vlrnfs=>'+soma_vlrnfs)
            //console.log('soma_custo=>'+soma_custo)
            //console.log('soma_lb=>'+soma_lb)
            //console.log('soma_ll=>'+soma_ll)
            //console.log('soma_tributos=>'+soma_tributos)
            */
        }
        var perMedCusto
        var perMedLL
        var perMedTrb
        perMedCusto = ((parseFloat(soma_custo) / parseFloat(soma_vlrnfs)) * 100).toFixed(2)
        perMedLL = (parseFloat(soma_ll) / parseFloat(soma_vlrnfs) * 100).toFixed(2)
        perMedTrb = (parseFloat(soma_tributos) / parseFloat(soma_vlrnfs) * 100).toFixed(2)

        var diaIni = dataini.substring(6, 8)
        var mesIni = dataini.substring(4, 6)
        var anoIni = dataini.substring(0, 4)
        dataInicio = diaIni + '/' + mesIni + '/' + anoIni
        var diaFim = datafim.substring(6, 8)
        var mesFim = datafim.substring(4, 6)
        var anoFim = datafim.substring(0, 4)
        dataFim = diaFim + '/' + mesFim + '/' + anoFim

        res.render('relatorios/listarealizados', { realizado: realizado, dataemissao: dataemissao, nome_usuario: nome_usuario, tempo: tempo, qtdprj: qtdprj, soma_valor: soma_valor, soma_vlrnfs: soma_vlrnfs, soma_custo: soma_custo, soma_lb: soma_lb, soma_lbaimp: soma_lbaimp, soma_ll: soma_ll, soma_tributos: soma_tributos, perMedCusto: perMedCusto, perMedLL: perMedLL, perMedTrb: perMedTrb, dataInicio: dataInicio, dataFim: dataFim })
    })

})

router.post('/filtrarAberto', ehAdmin, (req, res) => {

    const { _id } = req.user
    var data = new Date()
    var ano = data.getFullYear()
    var dataini
    var datafim

    if (req.body.dataini == '' && req.body.dataini == '') {

        switch (req.body.filtromes) {
            case 'Janeiro':
                dataini = ano + '01' + '01'
                datafim = ano + '01' + '31'
                break;
            case 'Fevereiro':
                dataini = ano + '02' + '01'
                datafim = ano + '02' + '28'
                break;
            case 'Março':
                dataini = ano + '03' + '01'
                datafim = ano + '03' + '31'
                break;
            case 'Abril':
                dataini = ano + '04' + '01'
                datafim = ano + '04' + '30'
                break;
            case 'Maio':
                dataini = ano + '05' + '01'
                datafim = ano + '05' + '31'
                break;
            case 'Junho':
                dataini = ano + '06' + '01'
                datafim = ano + '06' + '30'
                break;
            case 'Julho':
                dataini = ano + '07' + '01'
                datafim = ano + '07' + '31'
                break;
            case 'Agosto':
                dataini = ano + '08' + '01'
                datafim = ano + '08' + '30'
                break;
            case 'Setembro':
                dataini = ano + '09' + '01'
                datafim = ano + '09' + '31'
                break;
            case 'Outubro':
                dataini = ano + '10' + '01'
                datafim = ano + '10' + '31'
                break;
            case 'Novembro':
                dataini = ano + '11' + '01'
                datafim = ano + '11' + '30'
                break;
            case 'Dezembro':
                dataini = ano + '12' + '01'
                datafim = ano + '12' + '31'
                break;
            default:
                dataini = ano + '01' + '01'
                datafim = ano + '12' + '31'
        }
    } else {
        dataini = req.body.dataini
        var diaini = dataini.substring(0, 2)
        var mesini = dataini.substring(3, 5)
        var anoini = dataini.substring(6, 10)
        dataini = anoini + mesini + diaini
        //console.log('diaini=>'+dataini)
        datafim = req.body.datafim
        var diafim = datafim.substring(0, 2)
        var mesfim = datafim.substring(3, 5)
        var anofim = datafim.substring(6, 10)
        datafim = anofim + mesfim + diafim
        //console.log('datafim=>'+datafim)
    }

    //console.log('datafim=>' + datafim)
    //console.log('dataini=>' + dataini)
    Projetos.find({ 'dataord': { $lte: datafim, $gte: dataini }, user: _id, foiRealizado: false }).lean().then((projetos) => {

        var dia = data.getDate()
        if (dia < 10) {
            dia = '0' + dia
        }
        var mes = parseFloat(data.getMonth()) + 1
        if (mes < 10) {
            mes = '0' + mes
        }

        var dataemissao = dia + '/' + mes + '/' + ano
        var hora_emissao = data.getHours()
        var min_emissao = data.getMinutes()
        if (min_emissao < 10) {
            min_emissao = '0' + min_emissao
        }
        var tempo = hora_emissao + ':' + min_emissao
        //Definindo nome do usuário
        const { nome } = req.user
        var nome_usuario = nome
        //Definindo número total de projeto
        var qtdprj = projetos.length

        var soma_valor = 0
        var soma_vlrnfs = 0
        var soma_custo = 0
        var soma_lbaimp = 0
        var soma_lb = 0
        var soma_ll = 0
        var soma_tributos = 0
        for (i = 0; i < projetos.length; i++) {
            const { valor } = projetos[i]
            //console.log('valor=>'+valor)
            const { vlrNFS } = projetos[i]
            //console.log('valor=>'+vlrNFS)
            const { custoPlano } = projetos[i]
            //console.log('custoPlano=>'+custoPlano)
            const { lbaimp } = projetos[i]
            //console.log('lucroBruto=>'+lucroBruto)            
            const { lucroBruto } = projetos[i]
            //console.log('lucroBruto=>'+lucroBruto)
            const { lucroLiquido } = projetos[i]
            //console.log('lucroLiquido=>'+lucroLiquido)
            const { totalImposto } = projetos[i]
            //console.log('totalImposto=>'+totalImposto)
            soma_valor = parseFloat(soma_valor) + parseFloat(valor)
            soma_valor = soma_valor.toFixed(2)
            soma_vlrnfs = parseFloat(soma_vlrnfs) + parseFloat(vlrNFS)
            soma_vlrnfs = soma_vlrnfs.toFixed(2)
            soma_custo = parseFloat(soma_custo) + parseFloat(custoPlano)
            soma_custo = soma_custo.toFixed(2)
            soma_lbaimp = parseFloat(soma_lbaimp) + parseFloat(lbaimp)
            soma_lbaimp = soma_lbaimp.toFixed(2)
            soma_lb = parseFloat(soma_lb) + parseFloat(lucroBruto)
            soma_lb = soma_lb.toFixed(2)
            soma_ll = parseFloat(soma_ll) + parseFloat(lucroLiquido)
            soma_ll = soma_ll.toFixed(2)
            soma_tributos = parseFloat(soma_tributos) + parseFloat(totalImposto)
            soma_tributos = soma_tributos.toFixed(2)
            /*
            //console.log('soma_valor=>'+soma_valor)
            //console.log('soma_vlrnfs=>'+soma_vlrnfs)
            //console.log('soma_custo=>'+soma_custo)
            //console.log('soma_lb=>'+soma_lb)
            //console.log('soma_ll=>'+soma_ll)
            //console.log('soma_tributos=>'+soma_tributos)
            */
        }
        var perMedCusto
        var perMedLL
        var perMedTrb
        perMedCusto = ((parseFloat(soma_custo) / parseFloat(soma_vlrnfs)) * 100).toFixed(2)
        perMedLL = (parseFloat(soma_ll) / parseFloat(soma_vlrnfs) * 100).toFixed(2)
        perMedTrb = (parseFloat(soma_tributos) / parseFloat(soma_vlrnfs) * 100).toFixed(2)

        var diaIni = dataini.substring(6, 8)
        var mesIni = dataini.substring(4, 6)
        var anoIni = dataini.substring(0, 4)
        dataInicio = diaIni + '/' + mesIni + '/' + anoIni
        var diaFim = datafim.substring(6, 8)
        var mesFim = datafim.substring(4, 6)
        var anoFim = datafim.substring(0, 4)
        dataFim = diaFim + '/' + mesFim + '/' + anoFim

        res.render('relatorios/listarabertos', { projetos: projetos, dataemissao: dataemissao, nome_usuario: nome_usuario, tempo: tempo, qtdprj: qtdprj, soma_valor: soma_valor, soma_vlrnfs: soma_vlrnfs, soma_custo: soma_custo, soma_lb: soma_lb, soma_ll: soma_ll, soma_lbaimp: soma_lbaimp, soma_tributos: soma_tributos, perMedCusto: perMedCusto, perMedLL: perMedLL, perMedTrb: perMedTrb, dataInicio: dataInicio, dataFim: dataFim })
    })

})

module.exports = router