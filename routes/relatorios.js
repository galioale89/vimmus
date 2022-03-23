const express = require('express')
const router = express.Router()

const mongoose = require('mongoose')
require('../model/Pessoa')
require('../model/Cliente')
require('../model/Equipe')
require('../model/Empresa')
const Pessoa = mongoose.model('pessoa')
const Cliente = mongoose.model('cliente')
const Equipe = mongoose.model('equipe')
const Empresa = mongoose.model('empresa')

const pegames = require('../resources/pegames')
const dataBusca = require('../resources/dataBusca')
const dataMensagem = require('../resources/dataMensagem')
const dataHoje = require('../resources/dataHoje')
const filtrarProposta = require('../resources/filtrar')
const naoVazio = require('../resources/naoVazio')
const { ehAdmin } = require('../helpers/ehAdmin')
const dataMsgNum = require('../resources/dataMsgNum')

router.get('/analiseproposta', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }

    // var lista_envio = []
    var lista_ganho = []
    var lista_naoganho = []
    var lista_preco = []
    var lista_prazo = []
    var lista_finan = []
    var lista_conco = []
    var lista_smoti = []
    var lista_negoc = []
    var lista_anali = []
    var lista_compa = []
    var lista_reduc = []
    var lista_envia = []
    // var qtd_ganho = []
    // var qtd_naoganho = []
    // var qtd_envio = []
    // var qtd_preco = []
    // var qtd_prazo = []
    // var qtd_finan = []
    // var qtd_conco = []
    // var qtd_smoti = []    
    var q = 0
    var t = 0

    var baixado

    var dataini
    var datafim
    var mestitulo
    var hoje = dataHoje()
    var meshoje = hoje.substring(5, 7)
    var anotitulo = hoje.substring(0, 4)

    //console.log('meshoje=>' + meshoje)

    switch (meshoje) {
        case '01':
            dataini = anotitulo + '01' + '01'
            datafim = anotitulo + '01' + '31'
            mestitulo = 'Janeiro '
            break;
        case '02':
            dataini = anotitulo + '02' + '01'
            datafim = anotitulo + '02' + '28'
            mestitulo = 'Fevereiro '
            break;
        case '03':
            dataini = anotitulo + '03' + '01'
            datafim = anotitulo + '03' + '31'
            mestitulo = 'Março '
            break;
        case '04':
            dataini = anotitulo + '04' + '01'
            datafim = anotitulo + '04' + '30'
            mestitulo = 'Abril '
            break;
        case '05':
            dataini = anotitulo + '05' + '01'
            datafim = anotitulo + '05' + '31'
            mestitulo = 'Maio '
            break;
        case '06':
            dataini = anotitulo + '06' + '01'
            datafim = anotitulo + '06' + '30'
            mestitulo = 'Junho '
            break;
        case '07':
            dataini = anotitulo + '07' + '01'
            datafim = anotitulo + '07' + '31'
            mestitulo = 'Julho '
            break;
        case '08':
            dataini = anotitulo + '08' + '01'
            datafim = anotitulo + '08' + '30'
            mestitulo = 'Agosto '
            break;
        case '09':
            dataini = anotitulo + '09' + '01'
            datafim = anotitulo + '09' + '31'
            mestitulo = 'Setembro '
            break;
        case '10':
            dataini = anotitulo + '10' + '01'
            datafim = anotitulo + '10' + '31'
            mestitulo = 'Outubro '
            break;
        case '11':
            dataini = anotitulo + '11' + '01'
            datafim = anotitulo + '11' + '30'
            mestitulo = 'Novembro '
            break;
        case '12':
            dataini = anotitulo + '12' + '01'
            datafim = anotitulo + '12' + '31'
            mestitulo = 'Dezembro '
            break;
        default:
            dataini = anotitulo + '01' + '01'
            datafim = anotitulo + '12' + '31'
            mestitulo = 'Todo ano '
    }

    Cliente.find({ user: id }).lean().then((todos_clientes) => {
        Empresa.find({ user: id }).lean().then((todas_empresas) => {
            Proposta.find({ user: id, datacad: { $lte: datafim, $gte: dataini } }).then((proposta) => {
                if (naoVazio(proposta)) {
                    Pessoa.find({ user: id, funges: 'checked' }).lean().then((pessoa) => {
                        pessoa.forEach((e) => {
                            Proposta.find({ responsavel: e._id, datacad: { $lte: datafim, $gte: dataini } }).sort({ datacad: 'asc' }).then((pr) => {
                                pr.forEach((p) => {
                                    //console.log('proposta=>' + p.equipe)
                                    Equipe.findOne({ _id: p.equipe, 'nome_projeto': { $exists: true } }).then((equipe) => {
                                        //console.log('equipe=>' + equipe)
                                        q++
                                        if (p.baixada == true) {
                                            baixado = 'Sim'
                                        } else {
                                            baixado = 'Não'
                                        }

                                        if (naoVazio(p.motivo) && p.ganho == false) {
                                            if (p.motivo == 'Fechou com concorrente') {
                                                lista_conco.push({ responsavel: e.nome, proposta: p.seq, datacad: p.datacad, dataini: dataMensagem(equipe.dtinicio), datafim: dataMensagem(equipe.dtfim) })
                                            }
                                            if (p.motivo == 'Não conseguiu o financiamento') {
                                                lista_finan.push({ responsavel: e.nome, proposta: p.seq, datacad: p.datacad, dataini: dataMensagem(equipe.dtinicio), datafim: dataMensagem(equipe.dtfim) })
                                            }
                                            if (p.motivo == 'Preço elevado') {
                                                lista_preco.push({ responsavel: e.nome, proposta: p.seq, datacad: p.datacad, dataini: dataMensagem(equipe.dtinicio), datafim: dataMensagem(equipe.dtfim) })
                                            }
                                            if (p.motivo == 'Prazo de instalação') {
                                                lista_prazo.push({ responsavel: e.nome, proposta: p.seq, datacad: p.datacad, dataini: dataMensagem(equipe.dtinicio), datafim: dataMensagem(equipe.dtfim) })
                                            }
                                            if (p.motivo == 'Sem motivo') {
                                                lista_smoti.push({ responsavel: e.nome, proposta: p.seq, datacad: p.datacad, dataini: dataMensagem(equipe.dtinicio), datafim: dataMensagem(equipe.dtfim) })
                                            }
                                        } else {
                                            if (naoVazio(p.status) && p.ganho == false) {
                                                if (p.status == 'Enviado') {
                                                    lista_envia.push({ responsavel: e.nome, proposta: p.seq, datacad: p.datacad, dataini: dataMensagem(equipe.dtinicio), datafim: dataMensagem(equipe.dtfim) })
                                                }
                                                if (p.status == 'Negociando') {
                                                    lista_negoc.push({ responsavel: e.nome, proposta: p.seq, datacad: p.datacad, dataini: dataMensagem(equipe.dtinicio), datafim: dataMensagem(equipe.dtfim) })
                                                }
                                                if (p.status == 'Analisando Financiamento') {
                                                    lista_anali.push({ responsavel: e.nome, proposta: p.seq, datacad: p.datacad, dataini: dataMensagem(equipe.dtinicio), datafim: dataMensagem(equipe.dtfim) })
                                                }
                                                if (p.status == 'Comparando Propostas') {
                                                    lista_compa.push({ responsavel: e.nome, proposta: p.seq, datacad: p.datacad, dataini: dataMensagem(equipe.dtinicio), datafim: dataMensagem(equipe.dtfim) })
                                                }
                                                if (p.status == 'Aguardando redução de preço') {
                                                    lista_reduc.push({ responsavel: e.nome, proposta: p.seq, datacad: p.datacad, dataini: dataMensagem(equipe.dtinicio), datafim: dataMensagem(equipe.dtfim) })
                                                }
                                            }
                                        }

                                        // if (p.feito == true) {
                                        //     lista_envio.push({ responsavel: e.nome, proposta: p.seq, datacad: p.datacad, dataini: dataMensagem(equipe.dtinicio), datafim: dataMensagem(equipe.dtfim) })
                                        // }
                                        if (p.ganho == true) {
                                            lista_ganho.push({ responsavel: e.nome, proposta: p.seq, datacad: p.datacad, dataini: dataMensagem(equipe.dtinicio), datafim: dataMensagem(equipe.dtfim) })
                                        } else {
                                            lista_naoganho.push({ baixado, responsavel: e.nome, proposta: p.seq, datacad: p.datacad, dataini: dataMensagem(equipe.dtinicio), datafim: dataMensagem(equipe.dtfim) })
                                        }

                                        if (q == proposta.length) {
                                            res.render('relatorios/analiseproposta', {
                                                todos_clientes, todas_empresas, pessoa, lista_ganho, lista_naoganho,
                                                qtd_conco: lista_conco.length, qtd_finan: lista_finan.length, qtd_preco: lista_preco.length, qtd_prazo: lista_prazo.length,
                                                qtd_smoti: lista_smoti.length, qtd_negoc: lista_negoc.length, qtd_anali: lista_anali.length, qtd_compa: lista_compa.length, qtd_reduc: lista_reduc.length, qtd_envia: lista_envia.length,
                                                naoganho_total: lista_naoganho.length, ganho_total: lista_ganho.length, mestitulo, anotitulo
                                            })
                                        }
                                    })
                                })
                            })
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Nenhum responsável encontrado.')
                        res.redirect('/gerenciamento/consulta')
                    })
                } else {
                    res.render('relatorios/analiseproposta', {
                        todos_clientes, todas_empresas, pessoa, lista_ganho, lista_naoganho,
                        qtd_conco: lista_conco.length, qtd_finan: lista_finan.length, qtd_preco: lista_preco.length, qtd_prazo: lista_prazo.length,
                        qtd_smoti: lista_smoti.length, qtd_negoc: lista_negoc.length, qtd_anali: lista_anali.length, qtd_compa: lista_compa.length, qtd_reduc: lista_reduc.length, qtd_envia: lista_envia.length,
                        naoganho_total: lista_naoganho.length, ganho_total: lista_ganho.length, mestitulo, anotitulo
                    })
                }
            }).catch((err) => {
                req.flash('error_msg', 'Nenhuma proposta encontrada.')
                res.redirect('/gerenciamento/consulta')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Nenhuma empresas encontrada.')
            res.redirect('/gerenciamento/consulta')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Nenhum cliente encontrado.')
        res.redirect('/gerenciamento/consulta')
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

router.post('/analisar', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }

    var dataini
    var datafim
    var data = []
    var sql = []
    var busca = []
    var buscapessoa = []

    var mestituloinicio
    var mestitulofim
    var anotituloinicio
    var anotitulofim

    var lista_ganho = []
    var lista_naoganho = []
    var lista_preco = []
    var lista_prazo = []
    var lista_finan = []
    var lista_conco = []
    var lista_smoti = []
    var lista_negoc = []
    var lista_anali = []
    var lista_compa = []
    var lista_reduc = []
    var lista_envia = []

    var resp
    var baixado

    var q = 0

    var nomeCliente
    var nomeEmpresa
    var nomeResponsavel

    //console.log('req.body.dataini=>' + req.body.dataini)
    //console.log('req.body.datafim=>' + req.body.datafim)
    var stats = req.body.stats
    var empresa = req.body.empresa
    var cliente = req.body.cliente
    var respons = req.body.responsavel
    var motivo = 'Todos'

    if (req.body.dataini == '' || req.body.datafim == '' || (dataBusca(req.body.dataini) > dataBusca(req.body.datafim))) {
        req.flash('error_msg', 'Verificar as datas de busca escolhidas.')
        if (req.body.tipo != '') {
            res.redirect('/gerenciamento/consulta/' + req.body.tipo)
        } else {
            res.redirect('/gerenciamento/consulta/')
        }
    }
    if (cliente == 'Todos') {
        clibusca = '111111111111111111111111'
    } else {
        clibusca = cliente
    }
    if (respons == 'Todos') {
        resbusca = '111111111111111111111111'
    } else {
        resbusca = respons
    }
    if (empresa == 'Todos') {
        empbusca = '111111111111111111111111'
    } else {
        empbusca = empresa
    }
    Pessoa.find({ user: id, funges: 'checked' }).lean().then((todas_pessoas) => {
        Cliente.find({ user: id }).lean().then((todos_clientes) => {
            Empresa.find({ user: id }).lean().then((todas_empresas) => {
                Pessoa.findOne({ _id: resbusca }).then((nome_res) => {
                    Cliente.findOne({ _id: clibusca }).then((nome_cli) => {
                        Empresa.findOne({ _id: empbusca }).then((nome_emp) => {
                            // console.log('nome_cli=>' + nome_cli)
                            // console.log('nome_res=>' + nome_res)
                            // console.log('nome_emp=>' + nome_emp)
                            if (nome_cli == null) {
                                nomeCliente = 'Todos'
                            } else {
                                nomeCliente = nome_cli.nome
                            }
                            if (nome_res == null) {
                                nomeResponsavel = 'Todos'
                            } else {
                                nomeResponsavel = nome_res.nome
                            }
                            if (nome_emp == null) {
                                nomeEmpresa = 'Todos'
                            } else {
                                nomeEmpresa = nome_emp.nome
                            }

                            dataini = req.body.dataini
                            datafim = req.body.datafim
                            mestituloinicio = pegames(dataini.substring(5, 7))
                            mestitulofim = pegames(datafim.substring(5, 7))
                            anotituloinicio = dataini.substring(0, 4)
                            anotitulofim = datafim.substring(0, 4)
                            dataini = dataBusca(req.body.dataini)
                            datafim = dataBusca(req.body.datafim)

                            //console.log('dataini=>' + dataini)
                            //console.log('datafim=>' + datafim)
                            //console.log('busca=>' + busca)
                            if (req.body.responsavel == 'Todos') {
                                buscapessoa = { user: id, funges: 'checked' }
                            } else {
                                buscapessoa = { user: id, _id: respons }
                            }

                            //console.log('buscapessoa=>' + buscapessoa)
                            Proposta.find({ user: id, datacad: { $lte: datafim, $gte: dataini } }).then((proposta) => {
                                Pessoa.find(buscapessoa).then((pessoa) => {
                                    pessoa.forEach((e) => {
                                        //console.log('e=>' + e)
                                        data = { 'datacad': { $lte: datafim, $gte: dataini } }
                                        if (respons != 'Todos') {
                                            resp = e._id
                                        } else {
                                            resp = respons
                                        }

                                        sql = filtrarProposta(2, id, stats, motivo, resp, empresa, cliente, false, false, false, false)
                                        busca = Object.assign(sql, data)

                                        Proposta.find(busca).sort({ datacad: 'asc' }).then((pr) => {
                                            if (naoVazio(pr)) {
                                                pr.forEach((p) => {
                                                    //console.log('e._id=>' + e._id)
                                                    Equipe.findOne({ _id: p.equipe, 'nome_projeto': { $exists: true } }).then((equipe) => {
                                                        q++
                                                        if (p.baixada == true) {
                                                            baixado = 'Sim'
                                                        } else {
                                                            baixado = 'Não'
                                                        }

                                                        if (naoVazio(p.motivo) && p.ganho == false) {
                                                            if (p.motivo == 'Fechou com concorrente') {
                                                                lista_conco.push({ responsavel: e.nome, proposta: p.seq, datacad: p.datacad, dataini: dataMensagem(equipe.dtinicio), datafim: dataMensagem(equipe.dtfim) })
                                                            }
                                                            if (p.motivo == 'Não conseguiu o financiamento') {
                                                                lista_finan.push({ responsavel: e.nome, proposta: p.seq, datacad: p.datacad, dataini: dataMensagem(equipe.dtinicio), datafim: dataMensagem(equipe.dtfim) })
                                                            }
                                                            if (p.motivo == 'Preço elevado') {
                                                                lista_preco.push({ responsavel: e.nome, proposta: p.seq, datacad: p.datacad, dataini: dataMensagem(equipe.dtinicio), datafim: dataMensagem(equipe.dtfim) })
                                                            }
                                                            if (p.motivo == 'Prazo de instalação') {
                                                                lista_prazo.push({ responsavel: e.nome, proposta: p.seq, datacad: p.datacad, dataini: dataMensagem(equipe.dtinicio), datafim: dataMensagem(equipe.dtfim) })
                                                            }
                                                            if (p.motivo == 'Sem motivo') {
                                                                lista_smoti.push({ responsavel: e.nome, proposta: p.seq, datacad: p.datacad, dataini: dataMensagem(equipe.dtinicio), datafim: dataMensagem(equipe.dtfim) })
                                                            }
                                                        } else {
                                                            if (naoVazio(p.status) && p.ganho == false) {
                                                                if (p.status == 'Enviado') {
                                                                    lista_envia.push({ responsavel: e.nome, proposta: p.seq, datacad: p.datacad, dataini: dataMensagem(equipe.dtinicio), datafim: dataMensagem(equipe.dtfim) })
                                                                }
                                                                if (p.status == 'Negociando') {
                                                                    lista_negoc.push({ responsavel: e.nome, proposta: p.seq, datacad: p.datacad, dataini: dataMensagem(equipe.dtinicio), datafim: dataMensagem(equipe.dtfim) })
                                                                }
                                                                if (p.status == 'Analisando Financiamento') {
                                                                    lista_anali.push({ responsavel: e.nome, proposta: p.seq, datacad: p.datacad, dataini: dataMensagem(equipe.dtinicio), datafim: dataMensagem(equipe.dtfim) })
                                                                }
                                                                if (p.status == 'Comparando Propostas') {
                                                                    lista_compa.push({ responsavel: e.nome, proposta: p.seq, datacad: p.datacad, dataini: dataMensagem(equipe.dtinicio), datafim: dataMensagem(equipe.dtfim) })
                                                                }
                                                                if (p.status == 'Aguardando redução de preço') {
                                                                    lista_reduc.push({ responsavel: e.nome, proposta: p.seq, datacad: p.datacad, dataini: dataMensagem(equipe.dtinicio), datafim: dataMensagem(equipe.dtfim) })
                                                                }
                                                            }
                                                        }

                                                        // if (p.feito == true) {
                                                        //     lista_envio.push({ responsavel: e.nome, proposta: p.seq, datacad: p.datacad, dataini: dataMensagem(equipe.dtinicio), datafim: dataMensagem(equipe.dtfim) })
                                                        // }
                                                        if (p.ganho == true) {
                                                            lista_ganho.push({ responsavel: e.nome, proposta: p.seq, datacad: p.datacad, dataini: dataMensagem(equipe.dtinicio), datafim: dataMensagem(equipe.dtfim) })
                                                        } else {
                                                            lista_naoganho.push({ baixado, responsavel: e.nome, proposta: p.seq, datacad: p.datacad, dataini: dataMensagem(equipe.dtinicio), datafim: dataMensagem(equipe.dtfim) })
                                                        }

                                                        console.log('q=>' + q)
                                                        console.log('proposta.length=>' + proposta.length)
                                                        if (q == proposta.length) {
                                                            res.render('relatorios/analiseproposta', {
                                                                todos_clientes, todas_empresas, pessoa: todas_pessoas, lista_ganho, lista_naoganho,
                                                                qtd_conco: lista_conco.length, qtd_finan: lista_finan.length, qtd_preco: lista_preco.length, qtd_prazo: lista_prazo.length,
                                                                qtd_smoti: lista_smoti.length, qtd_negoc: lista_negoc.length, qtd_anali: lista_anali.length, qtd_compa: lista_compa.length, qtd_reduc: lista_reduc.length, qtd_envia: lista_envia.length,
                                                                naoganho_total: lista_naoganho.length, ganho_total: lista_ganho.length, mestituloinicio, anotituloinicio, mestitulofim, anotitulofim
                                                            })
                                                        }
                                                    })
                                                })
                                            } else {
                                                res.render('relatorios/analiseproposta', { todos_clientes, todas_empresas, pessoa: todas_pessoas, lista_ganho, lista_naoganho, lista_envio, qtd_envio, qtd_ganho, naoganho_total: lista_naoganho.length, ganho_total: lista_ganho.length, envio_total: lista_envio.length, mestituloinicio, anotituloinicio, mestitulofim, anotitulofim })
                                            }
                                        })
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Nenhuma pessoa encontrada.')
                                    res.redirect('/relatorios/analiseproposta')
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Nenhuma proposta encontrada.')
                                res.redirect('/relatorios/analiseproposta')
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Nenhuma empresas encontrada.')
                            res.redirect('/relatorios/analiseproposta')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Nenhum cliente encontrado.')
                        res.redirect('/relatorios/analiseproposta')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Nenhuma responsável encontrado.')
                    res.redirect('/relatorios/analiseproposta')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Nenhuma empresas encontrada.')
                res.redirect('/relatorios/analiseproposta')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Nenhum cliente encontrado.')
            res.redirect('/relatorios/analiseproposta')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Nenhuma responsável encontrado.')
        res.redirect('/relatorios/analiseproposta')
    })
})

router.post('/imprimir', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id
    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }

    var lista = []
    var busca = []
    var sql = []
    var data = []
    var encerrado = []
    var q = 0

    var responsavel
    var nome_insres
    var dif
    var data1
    var data2
    var dif

    var cliente = req.body.idcli
    var empresa = req.body.idemp
    var respons = req.body.idres
    var dataini = dataBusca(req.body.dataini)
    var datafim = dataBusca(req.body.datafim)
    //console.log(cliente)
    //console.log(empresa)
    //console.log(respons)
    //console.log(dataini)
    //console.log(datafim)

    data = { 'datacad': { $lte: datafim, $gte: dataini } }
    sql = filtrarProposta(2, id, 'Todos', 'Todos', respons, empresa, cliente, false, false, false, false)
    encerrado = { encerrado: true }
    busca = Object.assign(data, sql, encerrado)
    Proposta.find(busca).then((proposta) => {
        proposta.forEach((e) => {
            //console.log('e=>' + e.id)
            Cliente.findOne({ _id: e.cliente }).lean().then((lista_cliente) => {
                Equipe.findOne({ _id: e.equipe, $and: [{ 'custoins': { $ne: 0 } }, { 'custoins': { $ne: null } }] }).then((equipe) => {
                    Pessoa.findOne({ _id: e.responsavel }).then((lista_responsavel) => {
                        Pessoa.findOne({ _id: equipe.insres }).then((insres) => {
                            q++
                            if (naoVazio(lista_responsavel)) {
                                responsavel = lista_responsavel.nome
                            } else {
                                responsavel = ''
                            }

                            if (naoVazio(insres)) {
                                nome_insres = insres.nome
                            } else {
                                nome_insres = ''
                            }
                            data1 = new Date(equipe.dtfim)
                            data2 = new Date(equipe.dtinicio)
                            dif = Math.abs(data1.getTime() - data2.getTime())
                            //console.log('dif=>'+dif)
                            days = Math.ceil(dif / (1000 * 60 * 60 * 24))
                            //console.log('dif=>'+dif)
                            custototal = parseFloat(equipe.custoins) * parseFloat(days)
                            lista.push({ id: e._id, seq: e.seq, cliente: lista_cliente.nome, responsavel, nome_insres, dataini: dataMensagem(equipe.dtinicio), datafim: dataMensagem(equipe.dtfim), custo: custototal, ins0: equipe.ins0, ins1: equipe.ins1, ins2: equipe.ins2, ins3: equipe.ins3, ins4: equipe.ins4, ins5: equipe.ins5 })
                            if (q == proposta.length) {
                                Pessoa.find({ user: id, $or: [{ 'funins': 'checked' }, { 'funele': 'checked' }] }).lean().then((instalador) => {
                                    res.render('relatorios/imprimirConsulta', { lista, instalador, respons, cliente, empresa, datafim, dataini })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Falha ao encontrar os instaladores.')
                                    res.redirect('/gerenciamento/consulta/encerrado')
                                })
                            }
                        }).catch((err) => {
                            req.flash('error_msg', 'Nenhum técnico responsável encontrado.')
                            res.redirect('/gerenciamento/consulta/encerrado')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Nenhum gestor responsável encontrado')
                        res.redirect('/gerenciamento/consulta/encerrado')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao encontrar a equipe.')
                    res.redirect('/gerenciamento/consulta/encerrado')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Houve uma falha ao encontrar o cliente.')
                res.redirect('/gerenciamento/consulta/encerrado')
            })
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve uma falha ao encontrar a proposta.')
        res.redirect('/gerenciamento/consulta/encerrado')
    })
})

router.post('/filtraRelatorio', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id
    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }

    var lista = []
    var busca = []
    var sql = []
    var data = []
    var encerrado = []
    var q = 0

    var responsavel
    var nome_insres
    var dif

    var cliente = req.body.cliente
    var empresa = req.body.empresa
    var respons = req.body.responsavel
    var dataini = req.body.dataini
    var datafim = req.body.datafim
    //console.log(cliente)
    //console.log(empresa)
    //console.log(respons)
    //console.log(dataini)
    //console.log(datafim)

    data = { 'datacad': { $lte: datafim, $gte: dataini } }
    sql = filtrarProposta(2, id, 'Todos', 'Todos', respons, empresa, cliente, false, false, false, false)
    encerrado = { encerrado: true }
    busca = Object.assign(data, sql, encerrado)
    //console.log("req.body.ins=>" + req.body.ins)
    Pessoa.findOne({ _id: req.body.ins }).then((ins) => {
        Proposta.find(busca).then((proposta) => {
            proposta.forEach((e) => {
                //console.log('e=>' + e.id)
                Cliente.findOne({ _id: e.cliente }).lean().then((lista_cliente) => {
                    Equipe.findOne({ _id: e.equipe, $or: [{ 'idins0': ins }, { 'idins1': ins }, { 'idins2': ins }, { 'idins3': ins }, { 'idins4': ins }, { 'idins5': ins }], $and: [{ 'custoins': { $ne: 0 } }, { 'custoins': { $ne: null } }] }).then((equipe) => {
                        //console.log('equipe=>' + equipe)
                        Pessoa.findOne({ _id: e.responsavel }).then((lista_responsavel) => {
                            Pessoa.findOne({ _id: equipe.insres }).then((insres) => {
                                q++
                                if (naoVazio(lista_responsavel)) {
                                    responsavel = lista_responsavel.nome
                                } else {
                                    responsavel = ''
                                }

                                if (naoVazio(insres)) {
                                    nome_insres = insres.nome
                                } else {
                                    nome_insres = ''
                                }
                                dif = parseFloat(dataBusca(equipe.dtfim)) - parseFloat(dataBusca(equipe.dtinicio)) + 1
                                //console.log('dif=>'+dif)
                                custototal = parseFloat(ins.custo) * parseFloat(dif)
                                lista.push({ id: e._id, cliente: lista_cliente.nome, responsavel, nome_insres, dataini: dataMensagem(equipe.dtinicio), datafim: dataMensagem(equipe.dtfim), custo: custototal, ins0: ins.nome })
                                if (q == proposta.length) {
                                    Pessoa.find({ user: id, $or: [{ 'funins': 'checked' }, { 'funele': 'checked' }] }).lean().then((instalador) => {
                                        res.render('relatorios/imprimirConsulta', { lista, instalador, respons, cliente, empresa, datafim, dataini })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Falha ao encontrar os instaladores.')
                                        res.redirect('/gerenciamento/consulta/encerrado')
                                    })
                                }
                            }).catch((err) => {
                                req.flash('error_msg', 'Nenhum técnico responsável encontrado.')
                                res.redirect('/gerenciamento/consulta/encerrado')
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Nenhum gestor responsável encontrado')
                            res.redirect('/gerenciamento/consulta/encerrado')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Houve uma falha ao encontrar a equipe.')
                        res.redirect('/gerenciamento/consulta/encerrado')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao encontrar o cliente.')
                    res.redirect('/gerenciamento/consulta/encerrado')
                })
            })
        }).catch((err) => {
            req.flash('error_msg', 'Houve uma falha ao encontrar a proposta.')
            res.redirect('/gerenciamento/consulta/encerrado')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve uma falha ao encontrar o instalador.')
        res.redirect('/gerenciamento/consulta/encerrado')
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