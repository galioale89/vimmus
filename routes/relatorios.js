const express = require('express')
const router = express.Router()

const mongoose = require('mongoose')
require('../model/Realizado')
require('../model/Projeto')
const Projetos = mongoose.model('projeto')
const Realizado = mongoose.model('realizado')

const { ehAdmin } = require('../helpers/ehAdmin')

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
        var soma_custo = 0
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
            soma_lb = parseFloat(soma_lb) + parseFloat(lucroBruto)
            //soma_lb = soma_valor.toFixed(2)
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
        perMedCusto = ((parseFloat(soma_custo) / parseFloat(soma_valor)) * 100).toFixed(2)
        perMedLL = (parseFloat(soma_ll) / parseFloat(soma_valor) * 100).toFixed(2)
        perMedTrb = (parseFloat(soma_tributos) / parseFloat(soma_valor) * 100).toFixed(2)

        res.render('relatorios/listarealizados', { realizado: realizado, dataemissao: dataemissao, nome_usuario: nome_usuario, tempo: tempo, qtdprj: qtdprj, soma_valor: soma_valor, soma_vlrnfs: soma_vlrnfs, soma_custo: soma_custo, soma_lb: soma_lb, soma_ll: soma_ll, soma_tributos: soma_tributos, perMedCusto: perMedCusto, perMedLL: perMedLL, perMedTrb: perMedTrb })

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
            soma_lb = parseFloat(soma_lb) + parseFloat(lucroBruto)
            //soma_lb = soma_valor.toFixed(2)
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
        perMedCusto = ((parseFloat(soma_custo) / parseFloat(soma_valor)) * 100).toFixed(2)
        perMedLL = (parseFloat(soma_ll) / parseFloat(soma_valor) * 100).toFixed(2)
        perMedTrb = (parseFloat(soma_tributos) / parseFloat(soma_valor) * 100).toFixed(2)

        res.render('relatorios/listarabertos', { projetos: projetos, dataemissao: dataemissao, nome_usuario: nome_usuario, tempo: tempo, qtdprj: qtdprj, soma_valor: soma_valor, soma_vlrnfs: soma_vlrnfs, soma_custo: soma_custo, soma_lb: soma_lb, soma_ll: soma_ll, soma_tributos: soma_tributos, perMedCusto: perMedCusto, perMedLL: perMedLL, perMedTrb: perMedTrb })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro para encontrar projetos realizados')
        res.redirect('/menu')
    })
})

router.get('/dashboardcustos', ehAdmin, (req, res) => {
    const { _id } = req.user
    var soma_kwp = 0
    var soma_totcop = 0
    var soma_totadm = 0
    var soma_totint = 0
    var soma_totpro = 0
    var soma_totges = 0
    var soma_totdes = 0
    var soma_totali = 0
    var soma_totcmb = 0
    var soma_tothtl = 0
    var soma_totimp = 0
    var soma_tottrb = 0
    var soma_totkit = 0
    var soma_totfat = 0
    var soma_totcom = 0
    var soma_total = 0
    var soma_totliq = 0
    var soma_cercamento = 0
    var soma_postecond = 0
    var soma_ocp = 0
    var medkwp_totcop = 0
    var medkwp_totint = 0
    var medkwp_totpro = 0
    var medkwp_totges = 0
    var medkwp_totdes = 0
    var medkwp_totali = 0
    var medkwp_totimp = 0
    var medkwp_totkit = 0
    var medkwp_totfat = 0
    var medkwp_totcom = 0
    var medkwp_total = 0
    var medkwp_cercamento = 0
    var medkwp_postecond = 0
    var medkwp_ocp = 0

    var per_totcop = 0
    var per_totint = 0
    var per_totpro = 0
    var per_totges = 0
    var per_totdes = 0
    var per_totali = 0
    var per_totimp = 0
    var per_totkit = 0
    var per_totcom = 0
    var per_cercamento = 0
    var per_postecond = 0
    var per_ocp = 0

    var prjjan = 0
    var prjfev = 0
    var prjmar = 0
    var prjabr = 0
    var prjmai = 0
    var prjjun = 0
    var prjjul = 0
    var prjago = 0
    var prjset = 0
    var prjout = 0
    var prjnov = 0
    var prjdez = 0
    Projetos.find({ user: _id, foiRealizado: true }).lean().then((projetos) => {
        Realizado.find({ user: _id }).lean().then((realizado) => {
            var numprj = projetos.length

            for (i = 0; i < projetos.length; i++) {

                //Contar projetos por mês
                const { datareg } = realizado[i]
                //console.log('datareg=>' + datareg)

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

                const { potencia } = projetos[i]
                const { custoPlano } = realizado[i]
                const { desAdm } = realizado[i]
                const { totint } = realizado[i]
                const { totpro } = realizado[i]
                const { totges } = realizado[i]
                const { totdes } = realizado[i]
                const { totali } = realizado[i]
                const { totcmb } = realizado[i]
                const { tothtl } = realizado[i]
                const { totalImposto } = realizado[i]
                const { totalTributos } = realizado[i]
                const { vlrkit } = realizado[i]
                const { valor } = realizado[i]
                const { vlrcom } = realizado[i]
                const { cercamento } = realizado[i]
                const { postecond } = realizado[i]
                const { ocp } = realizado[i]
                const { lucroLiquido } = realizado[i]


                soma_kwp = (parseFloat(soma_kwp) + parseFloat(potencia)).toFixed(2)
                soma_totcop = (parseFloat(soma_totcop) + parseFloat(custoPlano)).toFixed(2)
                if (desAdm != undefined) {
                    soma_totadm = (parseFloat(soma_totadm) + parseFloat(desAdm)).toFixed(2)
                    console.log('desAdm=>' + desAdm)
                } else {
                    soma_totadm = (parseFloat(soma_totadm) + 0).toFixed(2)
                }
                soma_totint = (parseFloat(soma_totint) + parseFloat(totint)).toFixed(2)
                soma_totpro = (parseFloat(soma_totpro) + parseFloat(totpro)).toFixed(2)
                soma_totges = (parseFloat(soma_totges) + parseFloat(totges)).toFixed(2)
                soma_totdes = (parseFloat(soma_totdes) + parseFloat(totdes)).toFixed(2)
                soma_totali = (parseFloat(soma_totali) + parseFloat(totali)).toFixed(2)
                soma_totcmb = (parseFloat(soma_totcmb) + parseFloat(totcmb)).toFixed(2)
                soma_tothtl = (parseFloat(soma_tothtl) + parseFloat(tothtl)).toFixed(2)
                soma_tottrb = (parseFloat(soma_tottrb) + parseFloat(totalTributos)).toFixed(2)
                soma_totimp = (parseFloat(soma_totimp) + parseFloat(totalImposto)).toFixed(2)
                soma_totkit = (parseFloat(soma_totkit) + parseFloat(vlrkit)).toFixed(2)
                soma_totfat = (parseFloat(soma_totfat) + parseFloat(valor)).toFixed(2)
                soma_totcom = (parseFloat(soma_totcom) + parseFloat(vlrcom)).toFixed(2)
                soma_cercamento = (parseFloat(soma_cercamento) + parseFloat(cercamento)).toFixed(2)
                soma_postecond = (parseFloat(soma_postecond) + parseFloat(postecond)).toFixed(2)
                soma_ocp = (parseFloat(soma_ocp) + parseFloat(ocp)).toFixed(2)
                soma_totliq = (parseFloat(soma_totliq) + parseFloat(lucroLiquido)).toFixed(2)

            }
            console.log('soma_totadm=>' + soma_totadm)

            soma_total = (parseFloat(soma_totcop) + parseFloat(soma_totkit) + parseFloat(soma_totcom) + parseFloat(soma_tottrb) + parseFloat(soma_totadm)).toFixed(2)
            medkwp_total = (parseFloat(soma_total) / parseFloat(soma_kwp)).toFixed(2)

            medkwp_totcop = (parseFloat(soma_totcop) / parseFloat(soma_kwp)).toFixed(2)
            medkwp_totint = (parseFloat(soma_totint) / parseFloat(soma_kwp)).toFixed(2)
            medkwp_totpro = (parseFloat(soma_totpro) / parseFloat(soma_kwp)).toFixed(2)
            medkwp_totges = (parseFloat(soma_totges) / parseFloat(soma_kwp)).toFixed(2)
            medkwp_totdes = ((parseFloat(soma_totdes) + parseFloat(soma_totcmb) + parseFloat(soma_tothtl)) / parseFloat(soma_kwp)).toFixed(2)
            medkwp_totali = (parseFloat(soma_totali) / parseFloat(soma_kwp)).toFixed(2)
            medkwp_totimp = (parseFloat(soma_totimp) / parseFloat(soma_kwp)).toFixed(2)
            medkwp_totkit = (parseFloat(soma_totkit) / parseFloat(soma_kwp)).toFixed(2)
            medkwp_totcom = (parseFloat(soma_totcom) / parseFloat(soma_kwp)).toFixed(2)
            medkwp_cercamento = (parseFloat(soma_cercamento) / parseFloat(soma_kwp)).toFixed(2)
            medkwp_postecond = (parseFloat(soma_postecond) / parseFloat(soma_kwp)).toFixed(2)
            medkwp_ocp = (parseFloat(soma_ocp) / parseFloat(soma_kwp)).toFixed(2)
            medkwp_totfat = (parseFloat(soma_totfat) / parseFloat(soma_kwp)).toFixed(2)

            per_totcop = (parseFloat(medkwp_totcop) / parseFloat(medkwp_totfat) * 100).toFixed(2)
            per_totint = (parseFloat(medkwp_totint) / parseFloat(medkwp_totfat) * 100).toFixed(2)
            per_totpro = (parseFloat(medkwp_totpro) / parseFloat(medkwp_totfat) * 100).toFixed(2)
            per_totges = (parseFloat(medkwp_totges) / parseFloat(medkwp_totfat) * 100).toFixed(2)
            per_totdes = (parseFloat(medkwp_totdes) / parseFloat(medkwp_totfat) * 100).toFixed(2)
            per_totali = (parseFloat(medkwp_totali) / parseFloat(medkwp_totfat) * 100).toFixed(2)
            per_totimp = (parseFloat(medkwp_totimp) / parseFloat(medkwp_totfat) * 100).toFixed(2)
            per_totkit = (parseFloat(medkwp_totkit) / parseFloat(medkwp_totfat) * 100).toFixed(2)
            per_totcom = (parseFloat(medkwp_totcom) / parseFloat(medkwp_totfat) * 100).toFixed(2)
            per_cercamento = (parseFloat(medkwp_cercamento) / parseFloat(medkwp_totfat) * 100).toFixed(2)
            per_postecond = (parseFloat(medkwp_postecond) / parseFloat(medkwp_totfat) * 100).toFixed(2)
            per_ocp = (parseFloat(medkwp_ocp) / parseFloat(medkwp_totfat) * 100).toFixed(2)

            var per_deducao = (parseFloat(medkwp_total) / parseFloat(medkwp_totfat) * 100).toFixed(2)
            var per_LL = (100 - per_deducao).toFixed(2)
            //var soma_custoTotal = parseFloat(soma_totcop) + parseFloat(soma_totadm)

            res.render('relatorios/dashboardcustos', { prjjan: prjjan, prjfev: prjfev, prjmar: prjmar, prjabr: prjabr, prjmai: prjmai, prjjun: prjjun, prjjul: prjjul, prjago: prjago, prjset: prjset, prjout: prjout, prjnov: prjnov, prjdez: prjdez, numprj: numprj, soma_kwp: soma_kwp, soma_totcop: soma_totcop, soma_totint: soma_totint, soma_totpro: soma_totpro, soma_totges: soma_totges, soma_totdes: soma_totdes, soma_totali: soma_totali, soma_totimp: soma_totimp, soma_totkit: soma_totkit, soma_totcom: soma_totcom, soma_totao: soma_total, medkwp_totcop: medkwp_totcop, medkwp_totint: medkwp_totint, medkwp_totpro: medkwp_totpro, medkwp_totges: medkwp_totges, medkwp_totdes: medkwp_totdes, medkwp_totali: medkwp_totali, medkwp_totimp: medkwp_totimp, medkwp_totkit: medkwp_totkit, medkwp_totcom: medkwp_totcom, medkwp_totfat: medkwp_totfat, medkwp_total: medkwp_total, per_totcop: per_totcop, per_totint: per_totint, per_totpro: per_totpro, per_totges: per_totges, per_totali: per_totali, per_totimp: per_totimp, per_totdes: per_totdes, per_totkit: per_totkit, per_totcom: per_totcom, per_deducao: per_deducao, per_LL: per_LL, soma_cercamento: soma_cercamento, soma_postecond: soma_postecond, soma_ocp: soma_ocp, medkwp_cercamento: medkwp_cercamento, medkwp_postecond: medkwp_postecond, medkwp_ocp: medkwp_ocp, per_cercamento: per_cercamento, per_postecond: per_postecond, per_ocp: per_ocp, soma_totfat: soma_totfat, soma_totadm: soma_totadm, soma_totliq: soma_totliq, soma_tottrb: soma_tottrb })
        })
    })

})

router.post('/filtradash', ehAdmin, (req, res) => {
    const { _id } = req.user
    var ano = req.body.mesano
    var dataini
    var datafim
    var mestitulo

    console.log('req.body.messel=>' + req.body.messel)

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

    console.log('dataini=>' + dataini)
    console.log('datafim=>' + datafim)

    var soma_kwp = 0
    var soma_totcop = 0
    var soma_totadm = 0
    var soma_totint = 0
    var soma_totpro = 0
    var soma_totges = 0
    var soma_totdes = 0
    var soma_totali = 0
    var soma_totcmb = 0
    var soma_tothtl = 0
    var soma_totimp = 0
    var soma_tottrb = 0
    var soma_totkit = 0
    var soma_totfat = 0
    var soma_totcom = 0
    var soma_total = 0
    var soma_totliq = 0
    var soma_cercamento = 0
    var soma_postecond = 0
    var soma_ocp = 0
    var medkwp_totcop = 0
    var medkwp_totint = 0
    var medkwp_totpro = 0
    var medkwp_totges = 0
    var medkwp_totdes = 0
    var medkwp_totali = 0
    var medkwp_totimp = 0
    var medkwp_totkit = 0
    var medkwp_totfat = 0
    var medkwp_totcom = 0
    var medkwp_total = 0
    var medkwp_cercamento = 0
    var medkwp_postecond = 0
    var medkwp_ocp = 0

    var per_totcop = 0
    var per_totint = 0
    var per_totpro = 0
    var per_totges = 0
    var per_totdes = 0
    var per_totali = 0
    var per_totimp = 0
    var per_totkit = 0
    var per_totcom = 0
    var per_cercamento = 0
    var per_postecond = 0
    var per_ocp = 0

    Realizado.find({ 'datareg': { $lte: datafim, $gte: dataini }, user: _id }).lean().then((realizado) => {

        var numprj = realizado.length

        for (i = 0; i < realizado.length; i++) {

            /*
            //Contar projetos por mês
            const { datareg } = realizado[i]
            //console.log('datareg=>' + datareg)
            
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

            const { custoPlano } = realizado[i]
            const {potencia} = realizado[i]
            const { desAdm } = realizado[i]
            const { totint } = realizado[i]
            const { totpro } = realizado[i]
            const { totges } = realizado[i]
            const { totdes } = realizado[i]
            const { totali } = realizado[i]
            const { totcmb } = realizado[i]
            const { tothtl } = realizado[i]
            const { totalImposto } = realizado[i]
            const { totalTributos } = realizado[i]
            const { vlrkit } = realizado[i]
            const { valor } = realizado[i]
            const { vlrcom } = realizado[i]
            const { cercamento } = realizado[i]
            const { postecond } = realizado[i]
            const { ocp } = realizado[i]
            const { lucroLiquido } = realizado[i]

            soma_totcop = (parseFloat(soma_totcop) + parseFloat(custoPlano)).toFixed(2)
            if (desAdm != undefined) {
                soma_totadm = (parseFloat(soma_totadm) + parseFloat(desAdm)).toFixed(2)
                //console.log('desAdm=>' + desAdm)
            } else {
                soma_totadm = (parseFloat(soma_totadm) + 0).toFixed(2)
            }
            soma_kwp = (parseFloat(soma_kwp) + parseFloat(potencia)).toFixed(2)
            soma_totint = (parseFloat(soma_totint) + parseFloat(totint)).toFixed(2)
            soma_totpro = (parseFloat(soma_totpro) + parseFloat(totpro)).toFixed(2)
            soma_totges = (parseFloat(soma_totges) + parseFloat(totges)).toFixed(2)
            soma_totdes = (parseFloat(soma_totdes) + parseFloat(totdes)).toFixed(2)
            soma_totali = (parseFloat(soma_totali) + parseFloat(totali)).toFixed(2)
            soma_totcmb = (parseFloat(soma_totcmb) + parseFloat(totcmb)).toFixed(2)
            soma_tothtl = (parseFloat(soma_tothtl) + parseFloat(tothtl)).toFixed(2)
            soma_tottrb = (parseFloat(soma_tottrb) + parseFloat(totalTributos)).toFixed(2)
            soma_totimp = (parseFloat(soma_totimp) + parseFloat(totalImposto)).toFixed(2)
            soma_totkit = (parseFloat(soma_totkit) + parseFloat(vlrkit)).toFixed(2)
            soma_totfat = (parseFloat(soma_totfat) + parseFloat(valor)).toFixed(2)
            soma_totcom = (parseFloat(soma_totcom) + parseFloat(vlrcom)).toFixed(2)
            soma_cercamento = (parseFloat(soma_cercamento) + parseFloat(cercamento)).toFixed(2)
            soma_postecond = (parseFloat(soma_postecond) + parseFloat(postecond)).toFixed(2)
            soma_ocp = (parseFloat(soma_ocp) + parseFloat(ocp)).toFixed(2)
            soma_totliq = (parseFloat(soma_totliq) + parseFloat(lucroLiquido)).toFixed(2)
        }
        //console.log('soma_totadm=>' + soma_totadm)

        soma_total = (parseFloat(soma_totcop) + parseFloat(soma_totkit) + parseFloat(soma_totcom) + parseFloat(soma_tottrb) + parseFloat(soma_totadm)).toFixed(2)
        medkwp_total = (parseFloat(soma_total) / parseFloat(soma_kwp)).toFixed(2)

        medkwp_totcop = (parseFloat(soma_totcop) / parseFloat(soma_kwp)).toFixed(2)
        medkwp_totint = (parseFloat(soma_totint) / parseFloat(soma_kwp)).toFixed(2)
        medkwp_totpro = (parseFloat(soma_totpro) / parseFloat(soma_kwp)).toFixed(2)
        medkwp_totges = (parseFloat(soma_totges) / parseFloat(soma_kwp)).toFixed(2)
        medkwp_totdes = ((parseFloat(soma_totdes) + parseFloat(soma_totcmb) + parseFloat(soma_tothtl)) / parseFloat(soma_kwp)).toFixed(2)
        medkwp_totali = (parseFloat(soma_totali) / parseFloat(soma_kwp)).toFixed(2)
        medkwp_totimp = (parseFloat(soma_totimp) / parseFloat(soma_kwp)).toFixed(2)
        medkwp_totkit = (parseFloat(soma_totkit) / parseFloat(soma_kwp)).toFixed(2)
        medkwp_totcom = (parseFloat(soma_totcom) / parseFloat(soma_kwp)).toFixed(2)
        medkwp_cercamento = (parseFloat(soma_cercamento) / parseFloat(soma_kwp)).toFixed(2)
        medkwp_postecond = (parseFloat(soma_postecond) / parseFloat(soma_kwp)).toFixed(2)
        medkwp_ocp = (parseFloat(soma_ocp) / parseFloat(soma_kwp)).toFixed(2)
        medkwp_totfat = (parseFloat(soma_totfat) / parseFloat(soma_kwp)).toFixed(2)

        per_totcop = (parseFloat(medkwp_totcop) / parseFloat(medkwp_totfat) * 100).toFixed(2)
        per_totint = (parseFloat(medkwp_totint) / parseFloat(medkwp_totfat) * 100).toFixed(2)
        per_totpro = (parseFloat(medkwp_totpro) / parseFloat(medkwp_totfat) * 100).toFixed(2)
        per_totges = (parseFloat(medkwp_totges) / parseFloat(medkwp_totfat) * 100).toFixed(2)
        per_totdes = (parseFloat(medkwp_totdes) / parseFloat(medkwp_totfat) * 100).toFixed(2)
        per_totali = (parseFloat(medkwp_totali) / parseFloat(medkwp_totfat) * 100).toFixed(2)
        per_totimp = (parseFloat(medkwp_totimp) / parseFloat(medkwp_totfat) * 100).toFixed(2)
        per_totkit = (parseFloat(medkwp_totkit) / parseFloat(medkwp_totfat) * 100).toFixed(2)
        per_totcom = (parseFloat(medkwp_totcom) / parseFloat(medkwp_totfat) * 100).toFixed(2)
        per_cercamento = (parseFloat(medkwp_cercamento) / parseFloat(medkwp_totfat) * 100).toFixed(2)
        per_postecond = (parseFloat(medkwp_postecond) / parseFloat(medkwp_totfat) * 100).toFixed(2)
        per_ocp = (parseFloat(medkwp_ocp) / parseFloat(medkwp_totfat) * 100).toFixed(2)

        var per_deducao = (parseFloat(medkwp_total) / parseFloat(medkwp_totfat) * 100).toFixed(2)
        var per_LL = (100 - per_deducao).toFixed(2)
        //var soma_custoTotal = parseFloat(soma_totcop) + parseFloat(soma_totadm)

        res.render('relatorios/dashboardcustos', { mestitulo: mestitulo,ano:ano,numprj: numprj, soma_kwp: soma_kwp, soma_totcop: soma_totcop, soma_totint: soma_totint, soma_totpro: soma_totpro, soma_totges: soma_totges, soma_totdes: soma_totdes, soma_totali: soma_totali, soma_totimp: soma_totimp, soma_totkit: soma_totkit, soma_totcom: soma_totcom, soma_totao: soma_total, medkwp_totcop: medkwp_totcop, medkwp_totint: medkwp_totint, medkwp_totpro: medkwp_totpro, medkwp_totges: medkwp_totges, medkwp_totdes: medkwp_totdes, medkwp_totali: medkwp_totali, medkwp_totimp: medkwp_totimp, medkwp_totkit: medkwp_totkit, medkwp_totcom: medkwp_totcom, medkwp_totfat: medkwp_totfat, medkwp_total: medkwp_total, per_totcop: per_totcop, per_totint: per_totint, per_totpro: per_totpro, per_totges: per_totges, per_totali: per_totali, per_totimp: per_totimp, per_totdes: per_totdes, per_totkit: per_totkit, per_totcom: per_totcom, per_deducao: per_deducao, per_LL: per_LL, soma_cercamento: soma_cercamento, soma_postecond: soma_postecond, soma_ocp: soma_ocp, medkwp_cercamento: medkwp_cercamento, medkwp_postecond: medkwp_postecond, medkwp_ocp: medkwp_ocp, per_cercamento: per_cercamento, per_postecond: per_postecond, per_ocp: per_ocp, soma_totfat: soma_totfat, soma_totadm: soma_totadm, soma_totliq: soma_totliq, soma_tottrb: soma_tottrb })
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
            soma_lb = parseFloat(soma_lb) + parseFloat(lucroBruto)
            //soma_lb = soma_valor.toFixed(2)
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
        perMedCusto = ((parseFloat(soma_custo) / parseFloat(soma_valor)) * 100).toFixed(2)
        perMedLL = (parseFloat(soma_ll) / parseFloat(soma_valor) * 100).toFixed(2)
        perMedTrb = (parseFloat(soma_tributos) / parseFloat(soma_valor) * 100).toFixed(2)

        res.render('relatorios/listarealizados', { realizado: realizado, dataemissao: dataemissao, nome_usuario: nome_usuario, tempo: tempo, qtdprj: qtdprj, soma_valor: soma_valor, soma_vlrnfs: soma_vlrnfs, soma_custo: soma_custo, soma_lb: soma_lb, soma_ll: soma_ll, soma_tributos: soma_tributos, perMedCusto: perMedCusto, perMedLL: perMedLL, perMedTrb: perMedTrb })
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
            soma_lb = parseFloat(soma_lb) + parseFloat(lucroBruto)
            //soma_lb = soma_valor.toFixed(2)
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
        perMedCusto = ((parseFloat(soma_custo) / parseFloat(soma_valor)) * 100).toFixed(2)
        perMedLL = (parseFloat(soma_ll) / parseFloat(soma_valor) * 100).toFixed(2)
        perMedTrb = (parseFloat(soma_tributos) / parseFloat(soma_valor) * 100).toFixed(2)

        var diaIni = dataini.substring(6, 8)
        var mesIni = dataini.substring(4, 6)
        var anoIni = dataini.substring(0, 4)
        dataInicio = diaIni + '/' + mesIni + '/' + anoIni
        var diaFim = datafim.substring(6, 8)
        var mesFim = datafim.substring(4, 6)
        var anoFim = datafim.substring(0, 4)
        dataFim = diaFim + '/' + mesFim + '/' + anoFim

        res.render('relatorios/listarabertos', { projetos: projetos, dataemissao: dataemissao, nome_usuario: nome_usuario, tempo: tempo, qtdprj: qtdprj, soma_valor: soma_valor, soma_vlrnfs: soma_vlrnfs, soma_custo: soma_custo, soma_lb: soma_lb, soma_ll: soma_ll, soma_tributos: soma_tributos, perMedCusto: perMedCusto, perMedLL: perMedLL, perMedTrb: perMedTrb, dataInicio: dataInicio, dataFim: dataFim })
    })

})

module.exports = router