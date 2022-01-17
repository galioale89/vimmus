const express = require('express')
const router = express.Router()

require('../app')
require('../model/Empresa')
require('../model/Cliente')
require('../model/CustoDetalhado')
require('../model/Cronograma')


const mongoose = require('mongoose')
const Projeto = mongoose.model('projeto')
const Configuracao = mongoose.model('configuracao')
const Empresa = mongoose.model('empresa')
const Equipe = mongoose.model('equipe')
const Pessoa = mongoose.model('pessoa')
const Realizado = mongoose.model('realizado')
const Cliente = mongoose.model('cliente')
const Detalhado = mongoose.model('custoDetalhado')
const Cronograma = mongoose.model('cronograma')
const comparaDatas = require('../resources/comparaDatas')
const dataBusca = require('../resources/dataBusca')
const liberaRecursos = require('../resources/liberaRecursos')


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

router.get('/gerenciamento/:id', ehAdmin, (req, res) => {
    const { _id } = req.user
    var fatura
    Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
        Empresa.findOne({ _id: projeto.empresa }).lean().then((empresa) => {
            Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                if (projeto.fatequ == true) {
                    fatura = 'checked'
                } else {
                    fatura = 'unchecked'
                }
                var libAplicar = liberaRecursos(cronograma.dateplaini, cronograma.dateplafim, cronograma.dateprjini, cronograma.dateprjfim,
                    cronograma.dateateini, cronograma.dateatefim, cronograma.dateinvini, cronograma.dateinvfim,
                    cronograma.datestbini, cronograma.datestbfim, cronograma.dateestini, cronograma.dateestfim,
                    cronograma.datemodini, cronograma.datemodfim, cronograma.datevisini, cronograma.datevisfim)
                if (projeto.qtdins == '' || typeof projeto.qtdins == 'undefined' || projeto.qtdins == 0){
                    libAplicar = false
                }else{
                    libAplicar = true
                }                
                res.render('projeto/gerenciamento/gerenciamento', { projeto: projeto, cliente: cliente, empresa: empresa, fatura, libAplicar })
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

        Empresa.findOne({ _id: projeto.empresa }).lean().then((empresa) => {
            Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                res.render('projeto/gerenciamento/tributos', { projeto: projeto, cliente: cliente, empresa: empresa })
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

        Empresa.findOne({ _id: projeto.empresa }).lean().then((empresa) => {
            switch (empresa.regime) {
                case "Simples": ehSimples = true
                    break;
                case "Lucro Presumido": ehLP = true
                    break;
                case "Lucro Real": ehLR = true
                    break;
            }
            Cliente.findOne({ user: _id, _id: projeto.cliente }).lean().then((cliente) => {
                res.render('projeto/gerenciamento/edittributos', { projeto: projeto, empresa: empresa, ehSimples: ehSimples, ehLP: ehLP, ehLR: ehLR, cliente: cliente })
            }).catch((err) => {
                req.flash('error_msg', 'Nenhum cliente encontrado.')
                res.redirect('/cliente/consulta')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Houve uma falha ao encontrar o empresa.')
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
            Cronograma.findOne({ projeto: req.params.id }).then((cronograma) => {
                var fatura
                if (projeto.fatequ == true) {
                    fatura = 'checked'
                } else {
                    fatura = 'uncheked'
                }
                var libAplicar = liberaRecursos(cronograma.dateplaini, cronograma.dateplafim, cronograma.dateprjini, cronograma.dateprjfim,
                    cronograma.dateateini, cronograma.dateatefim, cronograma.dateinvini, cronograma.dateinvfim,
                    cronograma.datestbini, cronograma.datestbfim, cronograma.dateestini, cronograma.dateestfim,
                    cronograma.datemodini, cronograma.datemodfim, cronograma.datevisini, cronograma.datevisfim)
                if (projeto.qtdins == '' || typeof projeto.qtdins == 'undefined' || projeto.qtdins == 0){
                    libAplicar = false
                }else{
                    libAplicar = true
                }
                res.render('projeto/gerenciamento/editgerenciamento', { projeto: projeto, cliente: cliente, fatura, libAplicar })
            }).catch((err) => {
                req.flash('error_msg', 'Nenhum cronograma encontrado.')
                res.redirect('/cliente/consulta')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Nenhum cliente encontrado.')
            res.redirect('/cliente/consulta')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve uma falha ao encontrar o projeto.')
        res.redirect('/projeto/consulta')
    })
})

router.get('/cronograma/:id', ehAdmin, (req, res) => {
    Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
        Cronograma.findOne({ projeto: req.params.id }).lean().then((cronograma) => {
            Realizado.findOne({ projeto: req.params.id }).lean().then((realizado) => {
                var evPerGes = (parseFloat(projeto.totges)) * (parseFloat(cronograma.perGes) / 100)
                if (isNaN(evPerGes)) {
                    evPerGes = 0
                }
                var evPerKit = (parseFloat(projeto.vlrkit)) * (parseFloat(cronograma.perKit) / 100)
                if (isNaN(evPerKit)) {
                    evPerKit = 0
                }
                var evPerIns = (parseFloat(projeto.totint)) * (parseFloat(cronograma.perIns) / 100)
                if (isNaN(evPerIns)) {
                    evPerIns = 0
                }
                var evPerPro = (parseFloat(projeto.totpro)) * (parseFloat(cronograma.perPro) / 100)
                if (isNaN(evPerPro)) {
                    evPerPro = 0
                }
                var evPerArt = (parseFloat(projeto.vlrart)) * (parseFloat(cronograma.perArt) / 100)
                if (isNaN(evPerArt)) {
                    evPerArt = 0
                }
                var evPerAli = (parseFloat(projeto.totali)) * (parseFloat(cronograma.perAli) / 100)
                if (isNaN(evPerAli)) {
                    evPerAli = 0
                }
                var evPerDes = (parseFloat(projeto.totdes)) * (parseFloat(cronograma.perDes) / 100)
                if (isNaN(evPerDes)) {
                    evPerDes = 0
                }
                var evPerHtl = (parseFloat(projeto.tothtl)) * (parseFloat(cronograma.perHtl) / 100)
                if (isNaN(evPerHtl)) {
                    evPerHtl = 0
                }
                var evPerCmb = (parseFloat(projeto.totcmb)) * (parseFloat(cronograma.perCmb) / 100)
                if (isNaN(evPerCmb)) {
                    evPerCmb = 0
                }
                var evPerCer = (parseFloat(projeto.totcer)) * (parseFloat(cronograma.perCer) / 100)
                if (isNaN(evPerCer)) {
                    evPerCer = 0
                }
                var evPerCen = (parseFloat(projeto.totcen)) * (parseFloat(cronograma.perCen) / 100)
                if (isNaN(evPerCen)) {
                    evPerCen = 0
                }
                var evPerPos = (parseFloat(projeto.totpos)) * (parseFloat(cronograma.perPos) / 100)
                if (isNaN(evPerPos)) {
                    evPerPos = 0
                }
                var cpi
                var tcpi
                if (projeto.cpi < 1) {
                    cpi = false
                } else {
                    cpi = true
                }
                if (projeto.tcpi < 1) {
                    tcpi = true
                } else {
                    tcpi = false
                }

                var libRecursos = liberaRecursos(cronograma.dateplaini, cronograma.dateplafim, cronograma.dateprjini, cronograma.dateprjfim,
                    cronograma.dateateini, cronograma.dateatefim, cronograma.dateinvini, cronograma.dateinvfim,
                    cronograma.datestbini, cronograma.datestbfim, cronograma.dateestini, cronograma.dateestfim,
                    cronograma.datemodini, cronograma.datemodfim, cronograma.datevisini, cronograma.datevisfim)

                //console.log('libRecursos=>'+libRecursos)                                                
                res.render('projeto/gerenciamento/cronograma', {
                    projeto, cronograma, realizado, cpi, tcpi, libRecursos,
                    evPerGes, evPerKit, evPerIns, evPerPro, evPerArt, evPerAli, evPerDes, evPerHtl, evPerCmb, evPerCer, evPerCen, evPerPos
                })
            }).catch((err) => {
                req.flash('error_msg', 'Não foi possível encontrar o realizado.')
                res.redirect('/gerenciamento/gerenciamento/'+req.params.id)
            })
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível encontrar o cronograma.')
            res.redirect('/gerenciamento/gerenciamento/'+req.params.id)
        })   
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar o projeto.')
        res.redirect('/gerenciamento/gerenciamento/'+req.params.id)
    })
})

router.get('/cenarios/', ehAdmin, (req, res) => {
    res.render('projeto/gerenciamento/cenarios')
})

router.get('/agenda/', ehAdmin, (req, res) => {
    var dataini
    var dataini
    var hoje = new Date()
    var ano = hoje.getFullYear()
    var mes = parseFloat(hoje.getMonth()) + 1
    if (mes < 10) {
        mes = '0' + mes
    }
    dataini = ano + mes + '01'
    datafim = ano + mes + '31'

    var janeiro
    var fevereiro
    var marco
    var abril
    var maio
    var junho
    var julho
    var agosto
    var setembro
    var outubro
    var novembro
    var dezembro

    console.log('mes=>' + mes)

    switch (mes) {
        case '01': janeiro = 'selected'
            break;
        case '02': fevereiro = 'selected'
            break;
        case '03': marco = 'selected'
            break;
        case '04': abril = 'selected'
            break;
        case '05': maio = 'selected'
            break;
        case '06': junho = 'selected'
            break;
        case '07': julho = 'selected'
            break;
        case '08': agosto = 'selected'
            break;
        case '09': setembro = 'selected'
            break;
        case '10': outubro = 'selected'
            break;
        case '11': novembro = 'selected'
            break;
        case '12': dezembro = 'selected'
            break;
    }

    console.log('julho=>' + julho)

    res.render('projeto/gerenciamento/agenda', { ano, janeiro, fevereiro, marco, abril, maio, junho, julho, agosto, setembro, outubro, novembro, dezembro })
})

router.post('/aplicaAgenda/', ehAdmin, (req, res) => {
    const { _id } = req.user
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
    var tarefas01 = []
    var tarefas02 = []
    var tarefas03 = []
    var tarefas04 = []
    var tarefas05 = []
    var tarefas06 = []
    var tarefas07 = []
    var tarefas08 = []
    var tarefas09 = []
    var tarefas10 = []
    var tarefas11 = []
    var tarefas12 = []
    var tarefas13 = []
    var tarefas14 = []
    var tarefas15 = []
    var tarefas16 = []
    var tarefas17 = []
    var tarefas18 = []
    var tarefas19 = []
    var tarefas20 = []
    var tarefas21 = []
    var tarefas22 = []
    var tarefas23 = []
    var tarefas24 = []
    var tarefas25 = []
    var tarefas26 = []
    var tarefas27 = []
    var tarefas28 = []
    var tarefas29 = []
    var tarefas30 = []
    var tarefas31 = []

    var dia
    console.log('dataini=>' + dataini)
    console.log('datafim=>' + datafim)
    Cronograma.find({ 'agendaPlaFim': { $lte: datafim, $gte: dataini }, 'agendaPrjFim': { $lte: datafim, $gte: dataini }, user: _id }).lean().then((cronograma) => {
        cronograma.forEach(element => {
            console.log('entrou')
            const { dateplaini } = element

            const { dateprjini } = element
            const { dateateini } = element
            const { dateestini } = element
            const { datemodini } = element
            const { dateinvini } = element
            const { dateeaeini } = element
            const { datepnlini } = element
            const { datestbini } = element
            const { datevisini } = element
            const { datepla } = element
            const { dateprj } = element
            const { dateate } = element
            const { dateest } = element
            const { datemod } = element
            const { dateinv } = element
            const { dateeae } = element
            const { datestb } = element
            const { datepnl } = element
            const { datevis } = element

            const { nome } = element
            const { projeto } = element
            if ((dateplaini != '' && typeof dateplaini != 'undefined') && (datepla == '' || typeof datepla == 'undefined')) {
                dia = dateplaini.substring(8, 11)
                console.log('dia=>' + dia)
                if (dia == '01') {
                    tarefas01.push({ projeto: nome, id: projeto, tarefa: 'Planejamento' })
                }
                if (dia == '02') {
                    tarefas02.push({ projeto: nome, id: projeto, tarefa: 'Planejamento' })
                }
                if (dia == '03') {
                    tarefas03.push({ projeto: nome, id: projeto, tarefa: 'Planejamento' })
                }
                if (dia == '04') {
                    tarefas04.push({ projeto: nome, id: projeto, tarefa: 'Planejamento' })
                }
                if (dia == '05') {
                    tarefas05.push({ projeto: nome, id: projeto, tarefa: 'Planejamento' })
                }
                if (dia == '06') {
                    tarefas06.push({ projeto: nome, id: projeto, tarefa: 'Planejamento' })
                }
                if (dia == '07') {
                    tarefas07.push({ projeto: nome, id: projeto, tarefa: 'Planejamento' })
                }
                if (dia == '08') {
                    tarefas08.push({ projeto: nome, id: projeto, tarefa: 'Planejamento' })
                }
                if (dia == '09') {
                    tarefas09.push({ projeto: nome, id: projeto, tarefa: 'Planejamento' })
                }
                if (dia == '10') {
                    tarefas10.push({ projeto: nome, id: projeto, tarefa: 'Planejamento' })
                }
                if (dia == '11') {
                    tarefas11.push({ projeto: nome, id: projeto, tarefa: 'Planejamento' })
                }
                if (dia == '12') {
                    tarefas12.push({ projeto: nome, id: projeto, tarefa: 'Planejamento' })
                }
                if (dia == '13') {
                    tarefas13.push({ projeto: nome, id: projeto, tarefa: 'Planejamento' })
                }
                if (dia == '14') {
                    tarefas14.push({ projeto: nome, id: projeto, tarefa: 'Planejamento' })
                }
                if (dia == '15') {
                    tarefas15.push({ projeto: nome, id: projeto, tarefa: 'Planejamento' })
                }
                if (dia == '16') {
                    tarefas16.push({ projeto: nome, id: projeto, tarefa: 'Planejamento' })
                }
                if (dia == '17') {
                    tarefas17.push({ projeto: nome, id: projeto, tarefa: 'Planejamento' })
                }
                if (dia == '18') {
                    tarefas18.push({ projeto: nome, id: projeto, tarefa: 'Planejamento' })
                }
                if (dia == '19') {
                    tarefas19.push({ projeto: nome, id: projeto, tarefa: 'Planejamento' })
                }
                if (dia == '20') {
                    tarefas20.push({ projeto: nome, id: projeto, tarefa: 'Planejamento' })
                }
                if (dia == '21') {
                    tarefas21.push({ projeto: nome, id: projeto, tarefa: 'Planejamento' })
                }
                if (dia == '22') {
                    tarefas22.push({ projeto: nome, id: projeto, tarefa: 'Planejamento' })
                }
                if (dia == '23') {
                    tarefas23.push({ projeto: nome, id: projeto, tarefa: 'Planejamento' })
                }
                if (dia == '24') {
                    tarefas24.push({ projeto: nome, id: projeto, tarefa: 'Planejamento' })
                }
                if (dia == '25') {
                    tarefas25.push({ projeto: nome, id: projeto, tarefa: 'Planejamento' })
                }
                if (dia == '26') {
                    tarefas26.push({ projeto: nome, id: projeto, tarefa: 'Planejamento' })
                }
                if (dia == '27') {
                    tarefas27.push({ projeto: nome, id: projeto, tarefa: 'Planejamento' })
                }
                if (dia == '28') {
                    tarefas28.push({ projeto: nome, id: projeto, tarefa: 'Planejamento' })
                }
                if (dia == '29') {
                    tarefas29.push({ projeto: nome, id: projeto, tarefa: 'Planejamento' })
                }
                if (dia == '30') {
                    tarefas30.push({ projeto: nome, id: projeto, tarefa: 'Planejamento' })
                }
                if (dia == '31') {
                    tarefas31.push({ projeto: nome, id: projeto, tarefa: 'Planejamento' })
                }
            }

            if ((dateprjini != '' && typeof dateprjini != 'undefined') && (dateprj == '' || typeof dateprj == 'undefined')) {
                dia = dateprjini.substring(8, 11)
                console.log('dia=>' + dia)
                if (dia == '01') {
                    tarefas01.push({ projeto: nome, id: projeto, tarefa: 'Projetista' })
                }
                if (dia == '02') {
                    tarefas02.push({ projeto: nome, id: projeto, tarefa: 'Projetista' })
                }
                if (dia == '03') {
                    tarefas03.push({ projeto: nome, id: projeto, tarefa: 'Projetista' })
                }
                if (dia == '04') {
                    tarefas04.push({ projeto: nome, id: projeto, tarefa: 'Projetista' })
                }
                if (dia == '05') {
                    tarefas05.push({ projeto: nome, id: projeto, tarefa: 'Projetista' })
                }
                if (dia == '06') {
                    tarefas06.push({ projeto: nome, id: projeto, tarefa: 'Projetista' })
                }
                if (dia == '07') {
                    tarefas07.push({ projeto: nome, id: projeto, tarefa: 'Projetista' })
                }
                if (dia == '08') {
                    tarefas08.push({ projeto: nome, id: projeto, tarefa: 'Projetista' })
                }
                if (dia == '09') {
                    tarefas09.push({ projeto: nome, id: projeto, tarefa: 'Projetista' })
                }
                if (dia == '10') {
                    tarefas10.push({ projeto: nome, id: projeto, tarefa: 'Projetista' })
                }
                if (dia == '11') {
                    tarefas11.push({ projeto: nome, id: projeto, tarefa: 'Projetista' })
                }
                if (dia == '12') {
                    tarefas12.push({ projeto: nome, id: projeto, tarefa: 'Projetista' })
                }
                if (dia == '13') {
                    tarefas13.push({ projeto: nome, id: projeto, tarefa: 'Projetista' })
                }
                if (dia == '14') {
                    tarefas14.push({ projeto: nome, id: projeto, tarefa: 'Projetista' })
                }
                if (dia == '15') {
                    tarefas15.push({ projeto: nome, id: projeto, tarefa: 'Projetista' })
                }
                if (dia == '16') {
                    tarefas16.push({ projeto: nome, id: projeto, tarefa: 'Projetista' })
                }
                if (dia == '17') {
                    tarefas17.push({ projeto: nome, id: projeto, tarefa: 'Projetista' })
                }
                if (dia == '18') {
                    tarefas18.push({ projeto: nome, id: projeto, tarefa: 'Projetista' })
                }
                if (dia == '19') {
                    tarefas19.push({ projeto: nome, id: projeto, tarefa: 'Projetista' })
                }
                if (dia == '20') {
                    tarefas20.push({ projeto: nome, id: projeto, tarefa: 'Projetista' })
                }
                if (dia == '21') {
                    tarefas21.push({ projeto: nome, id: projeto, tarefa: 'Projetista' })
                }
                if (dia == '22') {
                    tarefas22.push({ projeto: nome, id: projeto, tarefa: 'Projetista' })
                }
                if (dia == '23') {
                    tarefas23.push({ projeto: nome, id: projeto, tarefa: 'Projetista' })
                }
                if (dia == '24') {
                    tarefas24.push({ projeto: nome, id: projeto, tarefa: 'Projetista' })
                }
                if (dia == '25') {
                    tarefas25.push({ projeto: nome, id: projeto, tarefa: 'Projetista' })
                }
                if (dia == '26') {
                    tarefas26.push({ projeto: nome, id: projeto, tarefa: 'Projetista' })
                }
                if (dia == '27') {
                    tarefas27.push({ projeto: nome, id: projeto, tarefa: 'Projetista' })
                }
                if (dia == '28') {
                    tarefas28.push({ projeto: nome, id: projeto, tarefa: 'Projetista' })
                }
                if (dia == '29') {
                    tarefas29.push({ projeto: nome, id: projeto, tarefa: 'Projetista' })
                }
                if (dia == '30') {
                    tarefas30.push({ projeto: nome, id: projeto, tarefa: 'Projetista' })
                }
                if (dia == '31') {
                    tarefas31.push({ projeto: nome, id: projeto, tarefa: 'Projetista' })
                }
            }

            if ((dateateini != '' && typeof dateateini != 'undefined') && (dateate == '' || typeof dateate == 'undefined')) {
                dia = dateateini.substring(8, 11)
                console.log('dia=>' + dia)
                if (dia == '01') {
                    tarefas01.push({ projeto: nome, id: projeto, tarefa: 'Aterramento' })
                }
                if (dia == '02') {
                    tarefas02.push({ projeto: nome, id: projeto, tarefa: 'Aterramento' })
                }
                if (dia == '03') {
                    tarefas03.push({ projeto: nome, id: projeto, tarefa: 'Aterramento' })
                }
                if (dia == '04') {
                    tarefas04.push({ projeto: nome, id: projeto, tarefa: 'Aterramento' })
                }
                if (dia == '05') {
                    tarefas05.push({ projeto: nome, id: projeto, tarefa: 'Aterramento' })
                }
                if (dia == '06') {
                    tarefas06.push({ projeto: nome, id: projeto, tarefa: 'Aterramento' })
                }
                if (dia == '07') {
                    tarefas07.push({ projeto: nome, id: projeto, tarefa: 'Aterramento' })
                }
                if (dia == '08') {
                    tarefas08.push({ projeto: nome, id: projeto, tarefa: 'Aterramento' })
                }
                if (dia == '09') {
                    tarefas09.push({ projeto: nome, id: projeto, tarefa: 'Aterramento' })
                }
                if (dia == '10') {
                    tarefas10.push({ projeto: nome, id: projeto, tarefa: 'Aterramento' })
                }
                if (dia == '11') {
                    tarefas11.push({ projeto: nome, id: projeto, tarefa: 'Aterramento' })
                }
                if (dia == '12') {
                    tarefas12.push({ projeto: nome, id: projeto, tarefa: 'Aterramento' })
                }
                if (dia == '13') {
                    tarefas13.push({ projeto: nome, id: projeto, tarefa: 'Aterramento' })
                }
                if (dia == '14') {
                    tarefas14.push({ projeto: nome, id: projeto, tarefa: 'Aterramento' })
                }
                if (dia == '15') {
                    tarefas15.push({ projeto: nome, id: projeto, tarefa: 'Aterramento' })
                }
                if (dia == '16') {
                    tarefas16.push({ projeto: nome, id: projeto, tarefa: 'Aterramento' })
                }
                if (dia == '17') {
                    tarefas17.push({ projeto: nome, id: projeto, tarefa: 'Aterramento' })
                }
                if (dia == '18') {
                    tarefas18.push({ projeto: nome, id: projeto, tarefa: 'Aterramento' })
                }
                if (dia == '19') {
                    tarefas19.push({ projeto: nome, id: projeto, tarefa: 'Aterramento' })
                }
                if (dia == '20') {
                    tarefas20.push({ projeto: nome, id: projeto, tarefa: 'Aterramento' })
                }
                if (dia == '21') {
                    tarefas21.push({ projeto: nome, id: projeto, tarefa: 'Aterramento' })
                }
                if (dia == '22') {
                    tarefas22.push({ projeto: nome, id: projeto, tarefa: 'Aterramento' })
                }
                if (dia == '23') {
                    tarefas23.push({ projeto: nome, id: projeto, tarefa: 'Aterramento' })
                }
                if (dia == '24') {
                    tarefas24.push({ projeto: nome, id: projeto, tarefa: 'Aterramento' })
                }
                if (dia == '25') {
                    tarefas25.push({ projeto: nome, id: projeto, tarefa: 'Aterramento' })
                }
                if (dia == '26') {
                    tarefas26.push({ projeto: nome, id: projeto, tarefa: 'Aterramento' })
                }
                if (dia == '27') {
                    tarefas27.push({ projeto: nome, id: projeto, tarefa: 'Aterramento' })
                }
                if (dia == '28') {
                    tarefas28.push({ projeto: nome, id: projeto, tarefa: 'Aterramento' })
                }
                if (dia == '29') {
                    tarefas29.push({ projeto: nome, id: projeto, tarefa: 'Aterramento' })
                }
                if (dia == '30') {
                    tarefas30.push({ projeto: nome, id: projeto, tarefa: 'Aterramento' })
                }
                if (dia == '31') {
                    tarefas31.push({ projeto: nome, id: projeto, tarefa: 'Aterramento' })
                }
            }

            if ((dateestini != '' && typeof dateestini != 'undefined') && (dateest == '' || typeof dateest == 'undefined')) {
                dia = dateestini.substring(8, 11)
                console.log('dia=>' + dia)
                if (dia == '01') {
                    tarefas01.push({ projeto: nome, id: projeto, tarefa: 'Estrutura' })
                }
                if (dia == '02') {
                    tarefas02.push({ projeto: nome, id: projeto, tarefa: 'Estrutura' })
                }
                if (dia == '03') {
                    tarefas03.push({ projeto: nome, id: projeto, tarefa: 'Estrutura' })
                }
                if (dia == '04') {
                    tarefas04.push({ projeto: nome, id: projeto, tarefa: 'Estrutura' })
                }
                if (dia == '05') {
                    tarefas05.push({ projeto: nome, id: projeto, tarefa: 'Estrutura' })
                }
                if (dia == '06') {
                    tarefas06.push({ projeto: nome, id: projeto, tarefa: 'Estrutura' })
                }
                if (dia == '07') {
                    tarefas07.push({ projeto: nome, id: projeto, tarefa: 'Estrutura' })
                }
                if (dia == '08') {
                    tarefas08.push({ projeto: nome, id: projeto, tarefa: 'Estrutura' })
                }
                if (dia == '09') {
                    tarefas09.push({ projeto: nome, id: projeto, tarefa: 'Estrutura' })
                }
                if (dia == '10') {
                    tarefas10.push({ projeto: nome, id: projeto, tarefa: 'Estrutura' })
                }
                if (dia == '11') {
                    tarefas11.push({ projeto: nome, id: projeto, tarefa: 'Estrutura' })
                }
                if (dia == '12') {
                    tarefas12.push({ projeto: nome, id: projeto, tarefa: 'Estrutura' })
                }
                if (dia == '13') {
                    tarefas13.push({ projeto: nome, id: projeto, tarefa: 'Estrutura' })
                }
                if (dia == '14') {
                    tarefas14.push({ projeto: nome, id: projeto, tarefa: 'Estrutura' })
                }
                if (dia == '15') {
                    tarefas15.push({ projeto: nome, id: projeto, tarefa: 'Estrutura' })
                }
                if (dia == '16') {
                    tarefas16.push({ projeto: nome, id: projeto, tarefa: 'Estrutura' })
                }
                if (dia == '17') {
                    tarefas17.push({ projeto: nome, id: projeto, tarefa: 'Estrutura' })
                }
                if (dia == '18') {
                    tarefas18.push({ projeto: nome, id: projeto, tarefa: 'Estrutura' })
                }
                if (dia == '19') {
                    tarefas19.push({ projeto: nome, id: projeto, tarefa: 'Estrutura' })
                }
                if (dia == '20') {
                    tarefas20.push({ projeto: nome, id: projeto, tarefa: 'Estrutura' })
                }
                if (dia == '21') {
                    tarefas21.push({ projeto: nome, id: projeto, tarefa: 'Estrutura' })
                }
                if (dia == '22') {
                    tarefas22.push({ projeto: nome, id: projeto, tarefa: 'Estrutura' })
                }
                if (dia == '23') {
                    tarefas23.push({ projeto: nome, id: projeto, tarefa: 'Estrutura' })
                }
                if (dia == '24') {
                    tarefas24.push({ projeto: nome, id: projeto, tarefa: 'Estrutura' })
                }
                if (dia == '25') {
                    tarefas25.push({ projeto: nome, id: projeto, tarefa: 'Estrutura' })
                }
                if (dia == '26') {
                    tarefas26.push({ projeto: nome, id: projeto, tarefa: 'Estrutura' })
                }
                if (dia == '27') {
                    tarefas27.push({ projeto: nome, id: projeto, tarefa: 'Estrutura' })
                }
                if (dia == '28') {
                    tarefas28.push({ projeto: nome, id: projeto, tarefa: 'Estrutura' })
                }
                if (dia == '29') {
                    tarefas29.push({ projeto: nome, id: projeto, tarefa: 'Estrutura' })
                }
                if (dia == '30') {
                    tarefas30.push({ projeto: nome, id: projeto, tarefa: 'Estrutura' })
                }
                if (dia == '31') {
                    tarefas31.push({ projeto: nome, id: projeto, tarefa: 'Estrutura' })
                }
            }
            if ((dateinvini != '' && typeof dateinvini != 'undefined') && (dateinv == '' || typeof dateinv == 'undefined')) {
                dia = dateinvini.substring(8, 11)
                console.log('dia=>' + dia)
                if (dia == '01') {
                    tarefas01.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '02') {
                    tarefas02.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '03') {
                    tarefas03.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '04') {
                    tarefas04.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '05') {
                    tarefas05.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '06') {
                    tarefas06.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '07') {
                    tarefas07.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '08') {
                    tarefas08.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '09') {
                    tarefas09.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '10') {
                    tarefas10.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '11') {
                    tarefas11.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '12') {
                    tarefas12.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '13') {
                    tarefas13.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '14') {
                    tarefas14.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '15') {
                    tarefas15.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '16') {
                    tarefas16.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '17') {
                    tarefas17.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '18') {
                    tarefas18.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '19') {
                    tarefas19.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '20') {
                    tarefas20.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '21') {
                    tarefas21.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '22') {
                    tarefas22.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '23') {
                    tarefas23.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '24') {
                    tarefas24.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '25') {
                    tarefas25.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '26') {
                    tarefas26.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '27') {
                    tarefas27.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '28') {
                    tarefas28.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '29') {
                    tarefas29.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '30') {
                    tarefas30.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '31') {
                    tarefas31.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
            }
            if ((dateeaeini != '' && typeof dateeaeini != 'undefined') && (dateeae == '' || typeof dateeae == 'undefined')) {
                dia = dateeaeini.substring(8, 11)
                console.log('dia=>' + dia)
                if (dia == '01') {
                    tarefas01.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '02') {
                    tarefas02.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '03') {
                    tarefas03.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '04') {
                    tarefas04.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '05') {
                    tarefas05.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '06') {
                    tarefas06.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '07') {
                    tarefas07.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '08') {
                    tarefas08.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '09') {
                    tarefas09.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '10') {
                    tarefas10.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '11') {
                    tarefas11.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '12') {
                    tarefas12.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '13') {
                    tarefas13.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '14') {
                    tarefas14.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '15') {
                    tarefas15.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '16') {
                    tarefas16.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '17') {
                    tarefas17.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '18') {
                    tarefas18.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '19') {
                    tarefas19.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '20') {
                    tarefas20.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '21') {
                    tarefas21.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '22') {
                    tarefas22.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '23') {
                    tarefas23.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '24') {
                    tarefas24.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '25') {
                    tarefas25.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '26') {
                    tarefas26.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '27') {
                    tarefas27.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '28') {
                    tarefas28.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '29') {
                    tarefas29.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '30') {
                    tarefas30.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
                if (dia == '31') {
                    tarefas31.push({ projeto: nome, id: projeto, tarefa: 'Inversor(es)' })
                }
            }
            if ((datestbini != '' && typeof datestbini != 'undefined') && (datestb == '' || typeof datestb == 'undefined')) {
                dia = datestbini.substring(8, 11)
                console.log('dia=>' + dia)
                if (dia == '01') {
                    tarefas01.push({ projeto: nome, id: projeto, tarefa: 'Stringbox' })
                }
                if (dia == '02') {
                    tarefas02.push({ projeto: nome, id: projeto, tarefa: 'Stringbox' })
                }
                if (dia == '03') {
                    tarefas03.push({ projeto: nome, id: projeto, tarefa: 'Stringbox' })
                }
                if (dia == '04') {
                    tarefas04.push({ projeto: nome, id: projeto, tarefa: 'Stringbox' })
                }
                if (dia == '05') {
                    tarefas05.push({ projeto: nome, id: projeto, tarefa: 'Stringbox' })
                }
                if (dia == '06') {
                    tarefas06.push({ projeto: nome, id: projeto, tarefa: 'Stringbox' })
                }
                if (dia == '07') {
                    tarefas07.push({ projeto: nome, id: projeto, tarefa: 'Stringbox' })
                }
                if (dia == '08') {
                    tarefas08.push({ projeto: nome, id: projeto, tarefa: 'Stringbox' })
                }
                if (dia == '09') {
                    tarefas09.push({ projeto: nome, id: projeto, tarefa: 'Stringbox' })
                }
                if (dia == '10') {
                    tarefas10.push({ projeto: nome, id: projeto, tarefa: 'Stringbox' })
                }
                if (dia == '11') {
                    tarefas11.push({ projeto: nome, id: projeto, tarefa: 'Stringbox' })
                }
                if (dia == '12') {
                    tarefas12.push({ projeto: nome, id: projeto, tarefa: 'Stringbox' })
                }
                if (dia == '13') {
                    tarefas13.push({ projeto: nome, id: projeto, tarefa: 'Stringbox' })
                }
                if (dia == '14') {
                    tarefas14.push({ projeto: nome, id: projeto, tarefa: 'Stringbox' })
                }
                if (dia == '15') {
                    tarefas15.push({ projeto: nome, id: projeto, tarefa: 'Stringbox' })
                }
                if (dia == '16') {
                    tarefas16.push({ projeto: nome, id: projeto, tarefa: 'Stringbox' })
                }
                if (dia == '17') {
                    tarefas17.push({ projeto: nome, id: projeto, tarefa: 'Stringbox' })
                }
                if (dia == '18') {
                    tarefas18.push({ projeto: nome, id: projeto, tarefa: 'Stringbox' })
                }
                if (dia == '19') {
                    tarefas19.push({ projeto: nome, id: projeto, tarefa: 'Stringbox' })
                }
                if (dia == '20') {
                    tarefas20.push({ projeto: nome, id: projeto, tarefa: 'Stringbox' })
                }
                if (dia == '21') {
                    tarefas21.push({ projeto: nome, id: projeto, tarefa: 'Stringbox' })
                }
                if (dia == '22') {
                    tarefas22.push({ projeto: nome, id: projeto, tarefa: 'Stringbox' })
                }
                if (dia == '23') {
                    tarefas23.push({ projeto: nome, id: projeto, tarefa: 'Stringbox' })
                }
                if (dia == '24') {
                    tarefas24.push({ projeto: nome, id: projeto, tarefa: 'Stringbox' })
                }
                if (dia == '25') {
                    tarefas25.push({ projeto: nome, id: projeto, tarefa: 'Stringbox' })
                }
                if (dia == '26') {
                    tarefas26.push({ projeto: nome, id: projeto, tarefa: 'Stringbox' })
                }
                if (dia == '27') {
                    tarefas27.push({ projeto: nome, id: projeto, tarefa: 'Stringbox' })
                }
                if (dia == '28') {
                    tarefas28.push({ projeto: nome, id: projeto, tarefa: 'Stringbox' })
                }
                if (dia == '29') {
                    tarefas29.push({ projeto: nome, id: projeto, tarefa: 'Stringbox' })
                }
                if (dia == '30') {
                    tarefas30.push({ projeto: nome, id: projeto, tarefa: 'Stringbox' })
                }
                if (dia == '31') {
                    tarefas31.push({ projeto: nome, id: projeto, tarefa: 'Stringbox' })
                }
            }
            if ((datemodini != '' && typeof datemodini != 'undefined') && (datemod == '' || typeof datemod == 'undefined')) {
                dia = datemodini.substring(8, 11)
                console.log('dia=>' + dia)
                if (dia == '01') {
                    tarefas01.push({ projeto: nome, id: projeto, tarefa: 'Módulos' })
                }
                if (dia == '02') {
                    tarefas02.push({ projeto: nome, id: projeto, tarefa: 'Módulos' })
                }
                if (dia == '03') {
                    tarefas03.push({ projeto: nome, id: projeto, tarefa: 'Módulos' })
                }
                if (dia == '04') {
                    tarefas04.push({ projeto: nome, id: projeto, tarefa: 'Módulos' })
                }
                if (dia == '05') {
                    tarefas05.push({ projeto: nome, id: projeto, tarefa: 'Módulos' })
                }
                if (dia == '06') {
                    tarefas06.push({ projeto: nome, id: projeto, tarefa: 'Módulos' })
                }
                if (dia == '07') {
                    tarefas07.push({ projeto: nome, id: projeto, tarefa: 'Módulos' })
                }
                if (dia == '08') {
                    tarefas08.push({ projeto: nome, id: projeto, tarefa: 'Módulos' })
                }
                if (dia == '09') {
                    tarefas09.push({ projeto: nome, id: projeto, tarefa: 'Módulos' })
                }
                if (dia == '10') {
                    tarefas10.push({ projeto: nome, id: projeto, tarefa: 'Módulos' })
                }
                if (dia == '11') {
                    tarefas11.push({ projeto: nome, id: projeto, tarefa: 'Módulos' })
                }
                if (dia == '12') {
                    tarefas12.push({ projeto: nome, id: projeto, tarefa: 'Módulos' })
                }
                if (dia == '13') {
                    tarefas13.push({ projeto: nome, id: projeto, tarefa: 'Módulos' })
                }
                if (dia == '14') {
                    tarefas14.push({ projeto: nome, id: projeto, tarefa: 'Módulos' })
                }
                if (dia == '15') {
                    tarefas15.push({ projeto: nome, id: projeto, tarefa: 'Módulos' })
                }
                if (dia == '16') {
                    tarefas16.push({ projeto: nome, id: projeto, tarefa: 'Módulos' })
                }
                if (dia == '17') {
                    tarefas17.push({ projeto: nome, id: projeto, tarefa: 'Módulos' })
                }
                if (dia == '18') {
                    tarefas18.push({ projeto: nome, id: projeto, tarefa: 'Módulos' })
                }
                if (dia == '19') {
                    tarefas19.push({ projeto: nome, id: projeto, tarefa: 'Módulos' })
                }
                if (dia == '20') {
                    tarefas20.push({ projeto: nome, id: projeto, tarefa: 'Módulos' })
                }
                if (dia == '21') {
                    tarefas21.push({ projeto: nome, id: projeto, tarefa: 'Módulos' })
                }
                if (dia == '22') {
                    tarefas22.push({ projeto: nome, id: projeto, tarefa: 'Módulos' })
                }
                if (dia == '23') {
                    tarefas23.push({ projeto: nome, id: projeto, tarefa: 'Módulos' })
                }
                if (dia == '24') {
                    tarefas24.push({ projeto: nome, id: projeto, tarefa: 'Módulos' })
                }
                if (dia == '25') {
                    tarefas25.push({ projeto: nome, id: projeto, tarefa: 'Módulos' })
                }
                if (dia == '26') {
                    tarefas26.push({ projeto: nome, id: projeto, tarefa: 'Módulos' })
                }
                if (dia == '27') {
                    tarefas27.push({ projeto: nome, id: projeto, tarefa: 'Módulos' })
                }
                if (dia == '28') {
                    tarefas28.push({ projeto: nome, id: projeto, tarefa: 'Módulos' })
                }
                if (dia == '29') {
                    tarefas29.push({ projeto: nome, id: projeto, tarefa: 'Módulos' })
                }
                if (dia == '30') {
                    tarefas30.push({ projeto: nome, id: projeto, tarefa: 'Módulos' })
                }
                if (dia == '31') {
                    tarefas31.push({ projeto: nome, id: projeto, tarefa: 'Módulos' })
                }
            }
            if ((datepnlini != '' && typeof datepnlini != 'undefined') && (datepnl == '' || typeof datepnl == 'undefined')) {
                dia = datepnlini.substring(8, 11)
                console.log('dia=>' + dia)
                if (dia == '01') {
                    tarefas01.push({ projeto: nome, id: projeto, tarefa: 'Painél Elétrico' })
                }
                if (dia == '02') {
                    tarefas02.push({ projeto: nome, id: projeto, tarefa: 'Painél Elétrico' })
                }
                if (dia == '03') {
                    tarefas03.push({ projeto: nome, id: projeto, tarefa: 'Painél Elétrico' })
                }
                if (dia == '04') {
                    tarefas04.push({ projeto: nome, id: projeto, tarefa: 'Painél Elétrico' })
                }
                if (dia == '05') {
                    tarefas05.push({ projeto: nome, id: projeto, tarefa: 'Painél Elétrico' })
                }
                if (dia == '06') {
                    tarefas06.push({ projeto: nome, id: projeto, tarefa: 'Painél Elétrico' })
                }
                if (dia == '07') {
                    tarefas07.push({ projeto: nome, id: projeto, tarefa: 'Painél Elétrico' })
                }
                if (dia == '08') {
                    tarefas08.push({ projeto: nome, id: projeto, tarefa: 'Painél Elétrico' })
                }
                if (dia == '09') {
                    tarefas09.push({ projeto: nome, id: projeto, tarefa: 'Painél Elétrico' })
                }
                if (dia == '10') {
                    tarefas10.push({ projeto: nome, id: projeto, tarefa: 'Painél Elétrico' })
                }
                if (dia == '11') {
                    tarefas11.push({ projeto: nome, id: projeto, tarefa: 'Painél Elétrico' })
                }
                if (dia == '12') {
                    tarefas12.push({ projeto: nome, id: projeto, tarefa: 'Painél Elétrico' })
                }
                if (dia == '13') {
                    tarefas13.push({ projeto: nome, id: projeto, tarefa: 'Painél Elétrico' })
                }
                if (dia == '14') {
                    tarefas14.push({ projeto: nome, id: projeto, tarefa: 'Painél Elétrico' })
                }
                if (dia == '15') {
                    tarefas15.push({ projeto: nome, id: projeto, tarefa: 'Painél Elétrico' })
                }
                if (dia == '16') {
                    tarefas16.push({ projeto: nome, id: projeto, tarefa: 'Painél Elétrico' })
                }
                if (dia == '17') {
                    tarefas17.push({ projeto: nome, id: projeto, tarefa: 'Painél Elétrico' })
                }
                if (dia == '18') {
                    tarefas18.push({ projeto: nome, id: projeto, tarefa: 'Painél Elétrico' })
                }
                if (dia == '19') {
                    tarefas19.push({ projeto: nome, id: projeto, tarefa: 'Painél Elétrico' })
                }
                if (dia == '20') {
                    tarefas20.push({ projeto: nome, id: projeto, tarefa: 'Painél Elétrico' })
                }
                if (dia == '21') {
                    tarefas21.push({ projeto: nome, id: projeto, tarefa: 'Painél Elétrico' })
                }
                if (dia == '22') {
                    tarefas22.push({ projeto: nome, id: projeto, tarefa: 'Painél Elétrico' })
                }
                if (dia == '23') {
                    tarefas23.push({ projeto: nome, id: projeto, tarefa: 'Painél Elétrico' })
                }
                if (dia == '24') {
                    tarefas24.push({ projeto: nome, id: projeto, tarefa: 'Painél Elétrico' })
                }
                if (dia == '25') {
                    tarefas25.push({ projeto: nome, id: projeto, tarefa: 'Painél Elétrico' })
                }
                if (dia == '26') {
                    tarefas26.push({ projeto: nome, id: projeto, tarefa: 'Painél Elétrico' })
                }
                if (dia == '27') {
                    tarefas27.push({ projeto: nome, id: projeto, tarefa: 'Painél Elétrico' })
                }
                if (dia == '28') {
                    tarefas28.push({ projeto: nome, id: projeto, tarefa: 'Painél Elétrico' })
                }
                if (dia == '29') {
                    tarefas29.push({ projeto: nome, id: projeto, tarefa: 'Painél Elétrico' })
                }
                if (dia == '30') {
                    tarefas30.push({ projeto: nome, id: projeto, tarefa: 'Painél Elétrico' })
                }
                if (dia == '31') {
                    tarefas31.push({ projeto: nome, id: projeto, tarefa: 'Painél Elétrico' })
                }
            }
            if ((datevisini != '' && typeof datevisini != 'undefined') && (datevis == '' || typeof datevis == 'undefined')) {
                dia = datevisini.substring(8, 11)
                console.log('dia=>' + dia)
                if (dia == '01') {
                    tarefas01.push({ projeto: nome, id: projeto, tarefa: 'Vistoria' })
                }
                if (dia == '02') {
                    tarefas02.push({ projeto: nome, id: projeto, tarefa: 'Vistoria' })
                }
                if (dia == '03') {
                    tarefas03.push({ projeto: nome, id: projeto, tarefa: 'Vistoria' })
                }
                if (dia == '04') {
                    tarefas04.push({ projeto: nome, id: projeto, tarefa: 'Vistoria' })
                }
                if (dia == '05') {
                    tarefas05.push({ projeto: nome, id: projeto, tarefa: 'Vistoria' })
                }
                if (dia == '06') {
                    tarefas06.push({ projeto: nome, id: projeto, tarefa: 'Vistoria' })
                }
                if (dia == '07') {
                    tarefas07.push({ projeto: nome, id: projeto, tarefa: 'Vistoria' })
                }
                if (dia == '08') {
                    tarefas08.push({ projeto: nome, id: projeto, tarefa: 'Vistoria' })
                }
                if (dia == '09') {
                    tarefas09.push({ projeto: nome, id: projeto, tarefa: 'Vistoria' })
                }
                if (dia == '10') {
                    tarefas10.push({ projeto: nome, id: projeto, tarefa: 'Vistoria' })
                }
                if (dia == '11') {
                    tarefas11.push({ projeto: nome, id: projeto, tarefa: 'Vistoria' })
                }
                if (dia == '12') {
                    tarefas12.push({ projeto: nome, id: projeto, tarefa: 'Vistoria' })
                }
                if (dia == '13') {
                    tarefas13.push({ projeto: nome, id: projeto, tarefa: 'Vistoria' })
                }
                if (dia == '14') {
                    tarefas14.push({ projeto: nome, id: projeto, tarefa: 'Vistoria' })
                }
                if (dia == '15') {
                    tarefas15.push({ projeto: nome, id: projeto, tarefa: 'Vistoria' })
                }
                if (dia == '16') {
                    tarefas16.push({ projeto: nome, id: projeto, tarefa: 'Vistoria' })
                }
                if (dia == '17') {
                    tarefas17.push({ projeto: nome, id: projeto, tarefa: 'Vistoria' })
                }
                if (dia == '18') {
                    tarefas18.push({ projeto: nome, id: projeto, tarefa: 'Vistoria' })
                }
                if (dia == '19') {
                    tarefas19.push({ projeto: nome, id: projeto, tarefa: 'Vistoria' })
                }
                if (dia == '20') {
                    tarefas20.push({ projeto: nome, id: projeto, tarefa: 'Vistoria' })
                }
                if (dia == '21') {
                    tarefas21.push({ projeto: nome, id: projeto, tarefa: 'Vistoria' })
                }
                if (dia == '22') {
                    tarefas22.push({ projeto: nome, id: projeto, tarefa: 'Vistoria' })
                }
                if (dia == '23') {
                    tarefas23.push({ projeto: nome, id: projeto, tarefa: 'Vistoria' })
                }
                if (dia == '24') {
                    tarefas24.push({ projeto: nome, id: projeto, tarefa: 'Vistoria' })
                }
                if (dia == '25') {
                    tarefas25.push({ projeto: nome, id: projeto, tarefa: 'Vistoria' })
                }
                if (dia == '26') {
                    tarefas26.push({ projeto: nome, id: projeto, tarefa: 'Vistoria' })
                }
                if (dia == '27') {
                    tarefas27.push({ projeto: nome, id: projeto, tarefa: 'Vistoria' })
                }
                if (dia == '28') {
                    tarefas28.push({ projeto: nome, id: projeto, tarefa: 'Vistoria' })
                }
                if (dia == '29') {
                    tarefas29.push({ projeto: nome, id: projeto, tarefa: 'Vistoria' })
                }
                if (dia == '30') {
                    tarefas30.push({ projeto: nome, id: projeto, tarefa: 'Vistoria' })
                }
                if (dia == '31') {
                    tarefas31.push({ projeto: nome, id: projeto, tarefa: 'Vistoria' })
                }
            }
        })
        console.log('tarefas11=>' + tarefas11)
        res.render('projeto/gerenciamento/agenda', {
            tarefas01, tarefas02, tarefas03, tarefas04, tarefas05, tarefas06, tarefas07,
            tarefas08, tarefas09, tarefas10, tarefas11, tarefas12, tarefas13, tarefas14,
            tarefas15, tarefas16, tarefas17, tarefas18, tarefas19, tarefas20, tarefas21,
            tarefas22, tarefas23, tarefas24, tarefas25, tarefas26, tarefas27, tarefas28,
            tarefas29, tarefas30, tarefas31,
            mes: req.body.messel, ano: req.body.mesano
        })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar as tarefas para a data de planejamento inicial.')
        res.redirect('/gerenciamento/agenda/')
    })
})

router.post('/aplicarcenario/', ehAdmin, (req, res) => {
    var modtam1 = 0
    var modtam2 = 0
    var modtam3 = 0
    var qtdmax1 = 0
    var qtdmax2 = 0
    var qtdmax3 = 0
    var kwpmax1 = 0
    var kwpmax2 = 0
    var kwpmax3 = 0
    var aviso1 = false
    var aviso2 = false
    var aviso3 = false
    var area = req.body.area

    modtam1 = parseFloat(req.body.modtmc1) * parseFloat(req.body.modtml1)
    modtam2 = parseFloat(req.body.modtmc2) * parseFloat(req.body.modtml2)
    modtam3 = parseFloat(req.body.modtmc3) * parseFloat(req.body.modtml3)
    qtdmax1 = Math.round(parseFloat(area) / parseFloat(modtam1))
    qtdmax2 = Math.round(parseFloat(area) / parseFloat(modtam2))
    qtdmax3 = Math.round(parseFloat(area) / parseFloat(modtam3))
    kwpmax1 = (parseFloat(qtdmax1) * parseFloat(req.body.modkwp1)) / parseFloat(1000)
    kwpmax2 = (parseFloat(qtdmax2) * parseFloat(req.body.modkwp2)) / parseFloat(1000)
    kwpmax3 = (parseFloat(qtdmax3) * parseFloat(req.body.modkwp3)) / parseFloat(1000)
    var texto1
    var texto2
    var texto3
    if (parseFloat(kwpmax1) < parseFloat(req.body.kwpsis)) {
        texto1 = 'A potência nominal do sistema é maior que a potência do cenário 1.'
    } else {
        texto1 = 'Cenário 1 compatível com o espaço disponível para a instalação da UFV.'
    }
    if (parseFloat(kwpmax2) < parseFloat(req.body.kwpsis)) {
        texto2 = 'A potência nominal do sistema é maior que a potência do cenário 2.'
    } else {
        texto2 = 'Cenário 2 compatível com o espaço disponível para a instalação da UFV.'
    }
    if (parseFloat(kwpmax3) < parseFloat(req.body.kwpsis)) {
        texto3 = 'A potência nominal do sistema é maior que a potência do cenário 3.'
    } else {
        texto3 = 'Cenário 3 compatível com o espaço disponível para a instalação da UFV.'
    }

    res.render('projeto/gerenciamento/cenarios', {
        modkwp1: req.body.modkwp1, modqtd1: req.body.modqtd1, modtmc1: req.body.modtmc1, modtml1: req.body.modtml1,
        modkwp2: req.body.modkwp2, modqtd2: req.body.modqtd2, modtmc2: req.body.modtmc2, modtml2: req.body.modtml2,
        modkwp3: req.body.modkwp3, modqtd3: req.body.modqtd3, modtmc3: req.body.modtmc3, modtml3: req.body.modtml3,
        kwpmax1, kwpmax2, kwpmax3, qtdmax1, qtdmax2, qtdmax3, kwpmax1, kwpmax2, kwpmax3, kwpsis: req.body.kwpsis,
        area, texto1, texto2, texto3
    })
})

router.post('/gerenciamento/', ehAdmin, (req, res) => {
    const { _id } = req.user
    var erros = ''
    var sucesso = ''

    //Valida campos já salvos
    Projeto.findOne({ _id: req.body.id }).then((projeto) => {
        if (parseFloat(projeto.trbint) == 0 || projeto.trbint == null) {
            erros = erros + 'Realizar ao menos um custo de instalação.'
        }
        if (parseFloat(projeto.trbpro) == 0 || projeto.trbpro == null) {
            erros = erros + 'Realizar ao menos um custo de projetista.'
        }
        if (parseFloat(projeto.trbges) == 0 || projeto.trbges == null) {
            erros = erros + 'Realizar ao menos um custos de gestão.'
        }
    })

    if (erros != '') {
        req.flash('error_msg', erros)
        res.redirect('/gerenciamento/gerenciamento/' + req.body.id)
    } else {
        Projeto.findOne({ _id: req.body.id }).then((projeto) => {
            Detalhado.findOne({ projeto: req.body.id }).then((detalhe) => {
                Empresa.findOne({ _id: projeto.empresa }).then((empresa) => {
                    Configuracao.findOne({ _id: projeto.configuracao }).then((config) => {
                        var medkmh
                        if (parseFloat(config.medkmh) > 0) {
                            medkmh = config.medkmh
                        } else {
                            medkmh = 10
                        }

                        //Definindo o número de dias de obras
                        var equipe = projeto.qtdins

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
                        var hrsprj = parseFloat(projeto.trbmod) + parseFloat(projeto.trbest) + parseFloat(projeto.trbpro) + parseFloat(projeto.trbges)
                        projeto.hrsprj = hrsprj

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
                            vlrcom = parseFloat(projeto.vlrNFS) * (parseFloat(projeto.percom) / 100)
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

                        //Definindo o imposto ISS
                        //console.log('regime_prj.alqNFS=>' + regime_prj.alqNFS)
                        var fatequ
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
                                impNFS = (parseFloat(vlrNFS) * (parseFloat(empresa.alqNFS) / 100)).toFixed(2)
                            }
                            vlrMarkup = (parseFloat(custoTotal) - parseFloat(reserva)) / (1 - (parseFloat(config.markup) / 100))
                            projeto.valor = parseFloat(vlrMarkup).toFixed(2)
                            projeto.markup = config.markup
                            prjValor = vlrMarkup
                        } else {
                            //console.log('custoTotal=>'+custoTotal)
                            //console.log('req.body.markup=>'+req.body.markup)
                            vlrMarkup = ((parseFloat(custoTotal) - parseFloat(reserva)) / (1 - (parseFloat(req.body.markup) / 100))).toFixed(2)
                            //console.log('vlrMarkup=>' + vlrMarkup)
                            if (req.body.checkFatura != null) {
                                fatequ = true
                                vlrNFS = parseFloat(vlrMarkup).toFixed(2)
                                impNFS = 0
                            } else {
                                fatequ = false
                                vlrNFS = (parseFloat(vlrMarkup) - parseFloat(projeto.vlrkit)).toFixed(2)
                                impNFS = (parseFloat(vlrNFS) * (parseFloat(empresa.alqNFS) / 100)).toFixed(2)
                            }
                            projeto.markup = req.body.markup
                            projeto.valor = vlrMarkup
                            prjValor = parseFloat(vlrMarkup).toFixed(2)
                        }
                        //console.log('vlrNFS=>' + vlrNFS)
                        //console.log('prjValor=>' + prjValor)
                        //kWp médio
                        projeto.vrskwp = (parseFloat(prjValor) / parseFloat(projeto.potencia)).toFixed(2)
                        projeto.fatequ = fatequ

                        var vlrcom = 0
                        //Validando a comissão
                        if (projeto.percom != null) {
                            vlrcom = parseFloat(vlrNFS) * (parseFloat(projeto.percom) / 100)
                            projeto.vlrcom = parseFloat(vlrcom).toFixed(2)
                        }

                        projeto.vlrNFS = parseFloat(vlrNFS).toFixed(2)
                        projeto.impNFS = parseFloat(impNFS).toFixed(2)

                        //console.log('impNFS=>' + impNFS)
                        //console.log('projeto.valor=>' + projeto.valor)
                        //Definindo o Lucro Bruto
                        var recLiquida = parseFloat(prjValor) - parseFloat(impNFS)
                        projeto.recLiquida = parseFloat(recLiquida).toFixed(2)

                        var lucroBruto = parseFloat(recLiquida) - parseFloat(projeto.vlrkit)
                        projeto.lucroBruto = parseFloat(lucroBruto).toFixed(2)

                        //console.log('lucroBruto=>' + lucroBruto)

                        var desAdm = 0
                        var lbaimp = 0
                        if (parseFloat(empresa.desadm) > 0) {
                            if (empresa.tipodesp == 'Percentual') {
                                desAdm = (parseFloat(empresa.desadm) * (parseFloat(empresa.perdes) / 100)).toFixed(2)
                            } else {
                                desAdm = ((parseFloat(empresa.desadm) / parseFloat(empresa.estkwp)) * parseFloat(projeto.potencia)).toFixed(2)
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
                        projeto.lbaimp = parseFloat(lbaimp).toFixed(2)
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

                        projeto.save().then(() => {
                            sucesso = 'Custo de gerenciamento aplicado com sucesso.'
                            req.flash('success_msg', sucesso)
                            res.redirect('/gerenciamento/gerenciamento/' + req.body.id)
                        }).catch((err) => {
                            req.flash('error_msg', 'Falha ao aplicar os custos do projeto.')
                            res.redirect('/projeto/consulta')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Houve um erro ao encontrar as configurações.')
                        res.redirect('/configuracao/consulta')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Falha ao encontrar o empresa.')
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
    var erros = ''
    var sucesso = ''

    //Valida total dos custos já salvos para aplicar as informações de gerenciamento
    Projeto.findOne({ _id: req.body.id }).then((projeto_valida) => {
        if (parseFloat(projeto_valida.trbint) == 0 || projeto_valida.trbint == null) {
            erros = erros + 'Realizar ao menos um custo de instalação.'
        }
        if (parseFloat(projeto_valida.trbpro) == 0 || projeto_valida.trbpro == null) {
            erros = erros + 'Realizar ao menos um custo de projetista.'
        }
        if (parseFloat(projeto_valida.trbges) == 0 || projeto_valida.trbges == null) {
            erros = erros + 'Realizar ao menos um custos de gestão.'
        }
    })

    if (erros != '') {

        req.flash('error_msg', erros)
        res.redirect('/gerenciamento/editar/gereciamento/' + req.body.id)

    } else {

        Projeto.findOne({ _id: req.body.id }).then((projeto) => {
            Detalhado.findOne({ projeto: req.body.id }).then((detalhe) => {
                Empresa.findOne({ _id: projeto.empresa }).then((empresa) => {
                    Equipe.findOne({ projeto: req.body.id }).then((equipe) => {
                        var medkmh
                        Configuracao.findOne({ _id: projeto.configuracao }).then((config) => {
                            if (parseFloat(config.medkmh) > 0) {
                                medkmh = config.medkmh
                            } else {
                                medkmh = 10
                            }
                            /*
                            var qtdins = projeto.qtdins
                            if (qtdins == '' || typeof qtdins == 'undefined'){
                                qtdins = 0
                            }
                            var qtdate = projeto.qtdate
                            if (qtdate == '' || typeof qtdate == 'undefined'){
                                qtdate = 0
                            }
                            var qtdinv = projeto.qtdinv
                            if (qtdinv == '' || typeof qtdinv == 'undefined'){
                                qtdinv = 0
                            }
                            var qtdeae = projeto.qtdate
                            if (qtdeae == '' || typeof qtdeae == 'undefined'){
                                qtdeae = 0
                            }
                            var qtdpnl = projeto.qtdpnl
                            if (qtdpnl == '' || typeof qtdpnl == 'undefined'){
                                qtdpnl = 0
                            }
                            */

                            //Definindo o número de dias de obras
                            var equipe = projeto.qtdins

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
                            var hrsprj = parseFloat(projeto.trbmod) + parseFloat(projeto.trbest) + parseFloat(projeto.trbpro) + parseFloat(projeto.trbges)
                            projeto.hrsprj = hrsprj

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
                            //console.log('projeto.totint=>' + projeto.totint)
                            //console.log('projeto.totpro=>' + projeto.totpro)
                            //console.log('projeto.totges=>' + projeto.totges)
                            //console.log('projeto.valorCer=>' + projeto.valorCer)
                            //console.log('projeto.valorPos=>' + projeto.valorPos)
                            //console.log('projeto.valorOcp=>' + projeto.valorOcp)

                            var valorCer
                            var valorPos
                            var valorCen
                            if (typeof projeto.valorCer == "undefined") {
                                valorCer = 0
                            }
                            if (typeof projeto.valorPos == "undefined") {
                                valorPos = 0
                            }
                            if (typeof projeto.valorCen == "undefined") {
                                valorCen = 0
                            }
                            //console.log('valorCer=>' + valorCer)
                            //console.log('valorPos=>' + valorPos)
                            //console.log('valorCen=>' + valorCen)

                            var custoFix = parseFloat(projeto.totint) + parseFloat(projeto.totpro) + parseFloat(projeto.vlrart) + parseFloat(projeto.totges)
                            //console.log('custoFix=>' + custoFix)
                            var custoVar = parseFloat(totdes)
                            //console.log('custoVar=>' + custoVar)
                            var custoEst = parseFloat(valorCer) + parseFloat(valorPos) + parseFloat(valorCen)
                            //console.log('custoEst=>' + custoEst)
                            var totcop = parseFloat(custoFix) + parseFloat(custoVar) + parseFloat(custoEst)

                            var vlrcom = 0
                            //Validando a comissão
                            if (projeto.percom != null) {
                                vlrcom = parseFloat(projeto.vlrNFS) * (parseFloat(projeto.percom) / 100)
                                projeto.vlrcom = vlrcom.toFixed(2)
                            }

                            projeto.custofix = custoFix.toFixed(2)
                            projeto.custovar = custoVar.toFixed(2)
                            projeto.custoest = custoEst.toFixed(2)
                            projeto.totcop = totcop.toFixed(2)
                            //console.log('totcop=>' + totcop)
                            var custoPlano = parseFloat(totcop) + parseFloat(reserva)
                            projeto.custoPlano = custoPlano.toFixed(2)
                            //console.log('custoPlano=>' + custoPlano)
                            var custoTotal = parseFloat(custoPlano) + parseFloat(projeto.vlrkit)
                            projeto.custoTotal = custoTotal.toFixed(2)
                            //console.log('custoTotal=>' + custoTotal)

                            //Definindo o imposto ISS
                            //console.log('regime_prj.alqNFS=>' + regime_prj.alqNFS)
                            var fatequ
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
                                    impNFS = (parseFloat(vlrNFS) * (parseFloat(empresa.alqNFS) / 100)).toFixed(2)
                                }
                                vlrMarkup = (parseFloat(custoTotal) - parseFloat(reserva)) / (1 - (parseFloat(config.markup) / 100))
                                projeto.valor = parseFloat(vlrMarkup).toFixed(2)
                                projeto.markup = config.markup
                                prjValor = vlrMarkup
                            } else {
                                //console.log('markup diferente de zero')
                                //console.log('custoTotal=>'+custoTotal)
                                //console.log('req.body.markup=>'+req.body.markup)
                                vlrMarkup = ((parseFloat(custoTotal) - parseFloat(reserva)) / (1 - (parseFloat(req.body.markup) / 100))).toFixed(2)
                                //console.log('vlrMarkup=>' + vlrMarkup)
                                if (req.body.checkFatura != null) {
                                    fatequ = true
                                    vlrNFS = parseFloat(vlrMarkup).toFixed(2)
                                    impNFS = 0
                                } else {
                                    fatequ = false
                                    vlrNFS = (parseFloat(vlrMarkup) - parseFloat(projeto.vlrkit)).toFixed(2)
                                    impNFS = (parseFloat(vlrNFS) * (parseFloat(empresa.alqNFS) / 100)).toFixed(2)
                                }
                                projeto.markup = req.body.markup
                                projeto.valor = vlrMarkup
                                prjValor = parseFloat(vlrMarkup).toFixed(2)
                            }
                            //console.log('vlrNFS=>' + vlrNFS)
                            //console.log('impNFS=>' + impNFS)
                            //console.log('prjValor=>' + prjValor)
                            //kWp médio
                            projeto.vrskwp = (parseFloat(prjValor) / parseFloat(projeto.potencia)).toFixed(2)
                            projeto.fatequ = fatequ

                            var vlrcom = 0
                            //Validando a comissão
                            if (projeto.percom != null) {
                                vlrcom = parseFloat(vlrNFS) * (parseFloat(projeto.percom) / 100)
                                projeto.vlrcom = parseFloat(vlrcom).toFixed(2)
                            }
                            //console.log('vlrcom=>'+vlrcom)

                            //Definindo o Lucro Bruto
                            var recLiquida = parseFloat(prjValor) - parseFloat(impNFS)
                            projeto.recLiquida = parseFloat(recLiquida).toFixed(2)

                            var lucroBruto = parseFloat(recLiquida) - parseFloat(projeto.vlrkit)
                            projeto.lucroBruto = parseFloat(lucroBruto).toFixed(2)

                            //console.log('lucroBruto=>' + lucroBruto)

                            var desAdm = 0
                            var lbaimp = 0
                            if (parseFloat(empresa.desadm) > 0) {
                                if (empresa.tipodesp == 'Percentual') {
                                    desAdm = (parseFloat(empresa.desadm) * (parseFloat(empresa.perdes) / 100)).toFixed(2)
                                } else {
                                    desAdm = ((parseFloat(empresa.desadm) / parseFloat(empresa.estkwp)) * parseFloat(projeto.potencia)).toFixed(2)
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

                            projeto.vlrNFS = parseFloat(vlrNFS).toFixed(2)
                            projeto.impNFS = parseFloat(impNFS).toFixed(2)

                            projeto.save().then(() => {

                                sucesso = 'Custo de gerenciamento aplicado com sucesso.'
                                req.flash('success_msg', sucesso)
                                res.redirect('/gerenciamento/editar/gerenciamento/' + req.body.id)

                            }).catch((err) => {
                                req.flash('error_msg', 'Falha ao aplicar os custos do projeto.')
                                res.redirect('/projeto/consulta')
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Houve um erro ao encontrar a equipe.')
                            res.redirect('/configuracao/consulta')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Houve um erro ao encontrar a empresa.')
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
        Empresa.findOne({ _id: projeto.empresa }).lean().then((empresa) => {

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

                res.render('projeto/gerenciamento/tributos', { projeto: projeto, empresa: empresa, erros: erros })

            } else {

                projeto_id = projeto._id

                var prjFat = empresa.prjFat
                var prjLR = empresa.prjLR
                var prjLP = empresa.prjLP
                //var vlrDAS = empresa.vlrDAS

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
                if (empresa.regime == 'Simples') {
                    //console.log('Empresa=>Simples')
                    var alqEfe = ((parseFloat(prjFat) * (parseFloat(empresa.alqDAS) / 100)) - (parseFloat(empresa.vlrred))) / parseFloat(prjFat)
                    var totalSimples = parseFloat(projeto.vlrNFS) * (parseFloat(alqEfe))
                    totalImposto = parseFloat(totalSimples).toFixed(2)
                    projeto.impostoSimples = parseFloat(totalImposto).toFixed(2)
                } else {
                    if (empresa.regime == 'Lucro Real') {
                        //console.log('lucro real')
                        if ((parseFloat(prjLR) / 12) > 20000) {
                            //console.log('prjLR=>' + prjLR)
                            fatadd = (parseFloat(prjLR) / 12) - 20000
                            //console.log('fatadd=>' + fatadd)
                            fataju = parseFloat(fatadd) * (parseFloat(empresa.alqIRPJAdd) / 100)
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

                        impostoIRPJ = parseFloat(projeto.lbaimp) * (parseFloat(empresa.alqIRPJ) / 100)
                        projeto.impostoIRPJ = impostoIRPJ.toFixed(2)
                        //console.log('impostoIRPJ=>' + impostoIRPJ)
                        impostoCSLL = parseFloat(projeto.lbaimp) * (parseFloat(empresa.alqCSLL) / 100)
                        projeto.impostoCSLL = impostoCSLL.toFixed(2)
                        //console.log('impostoCSLL=>' + impostoCSLL)
                        impostoPIS = parseFloat(projeto.vlrNFS) * 0.5 * (parseFloat(empresa.alqPIS) / 100)
                        projeto.impostoPIS = impostoPIS.toFixed(2)
                        //console.log('impostoPIS=>' + impostoPIS)
                        impostoCOFINS = parseFloat(projeto.vlrNFS) * 0.5 * (parseFloat(empresa.alqCOFINS) / 100)
                        projeto.impostoCOFINS = impostoCOFINS.toFixed(2)
                        //console.log('impostoCOFINS=>' + impostoCOFINS)
                        totalImposto = parseFloat(impostoIRPJ) + parseFloat(impostoIRPJAdd) + parseFloat(impostoCSLL) + parseFloat(impostoPIS) + parseFloat(impostoCOFINS)

                    } else {

                        if (((parseFloat(prjLP) * 0.32) / 3) > 20000) {
                            fatadd = ((parseFloat(prjLP) * 0.32) / 3) - 20000
                            fataju = parseFloat(fatadd) / 20000
                            impostoIRPJAdd = (parseFloat(projeto.vlrNFS) * 0.32) * parseFloat(fataju).toFixed(2) * (parseFloat(empresa.alqIRPJAdd) / 100)
                            projeto.impostoAdd = impostoIRPJAdd.toFixed(2)
                        } else {
                            impostoIRPJAdd = 0
                            projeto.impostoAdd = 0
                        }

                        impostoIRPJ = parseFloat(projeto.vlrNFS) * 0.32 * (parseFloat(empresa.alqIRPJ) / 100)
                        projeto.impostoIRPJ = impostoIRPJ.toFixed(2)
                        impostoCSLL = parseFloat(projeto.vlrNFS) * 0.32 * (parseFloat(empresa.alqCSLL) / 100)
                        projeto.impostoCSLL = impostoCSLL.toFixed(2)
                        impostoCOFINS = parseFloat(projeto.vlrNFS) * (parseFloat(empresa.alqCOFINS) / 100)
                        projeto.impostoCOFINS = impostoCOFINS.toFixed(2)
                        impostoPIS = parseFloat(projeto.vlrNFS) * (parseFloat(empresa.alqPIS) / 100)
                        projeto.impostoPIS = impostoPIS.toFixed(2)
                        totalImposto = parseFloat(impostoIRPJ) + parseFloat(impostoIRPJAdd) + parseFloat(impostoCSLL) + parseFloat(impostoPIS) + parseFloat(impostoCOFINS)
                    }
                }

                //console.log('impNFS=>' + impNFS)
                //console.log('impostoICMS=>' + impostoICMS)

                //Validar ICMS
                if (projeto.fatequ == true) {
                    if (empresa.alqICMS != null) {
                        impostoICMS = (parseFloat(projeto.vlrNFS)) * (parseFloat(empresa.alqICMS) / 100)
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
                var parISSVlr
                if (projeto.impNFS > 0) {
                    parISSVlr = parseFloat(projeto.impNFS) / parseFloat(projeto.valor) * 100
                } else {
                    parISSVlr = 0
                }
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
                var parISSNfs
                if (projeto.impNFS > 0) {
                    parISSNfs = parseFloat(projeto.impNFS) / parseFloat(projeto.vlrNFS) * 100
                } else {
                    parISSNfs = 0
                }

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

                        Empresa.findOne({ _id: projeto.empresa }).lean().then((empresa) => {
                            switch (empresa.regime) {
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
                                res.render('projeto/gerenciamento/tributos', { sucesso: sucesso, projeto: projeto, empresa: empresa, ehSimples: ehSimples, ehLP: ehLP, ehLR: ehLR, cliente: cliente })
                            }).catch((err) => {
                                req.flash('error_msg', 'Nenhum cliente encontrado.')
                                res.redirect('/cliente/consulta')
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Nenhum empresa encontrado.')
                            res.redirect('/gerencimento/consultaempresa')
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
            req.flash('error_msg', 'Não foi possível encontrar o empresa.')
            res.redirect('/configuracao/consultaempresa')
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
        Empresa.findOne({ _id: projeto.empresa }).then((empresa) => {

            projeto_id = projeto._id

            var prjFat = empresa.prjFat
            var prjLR = empresa.prjLR
            var prjLP = empresa.prjLP
            //var vlrDAS = empresa.vlrDAS
            //console.log('prjFat=>' + prjFat)
            //console.log('prjLR=>' + prjLR)
            //console.log('prjLP=>' + prjLP)

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

            if (empresa.regime == 'Simples') {
                //console.log('Empresa=>Simples')
                var alqEfe = ((parseFloat(prjFat) * (parseFloat(empresa.alqDAS) / 100)) - (parseFloat(empresa.vlrred))) / parseFloat(prjFat)
                //console.log('alqEfe=>' + alqEfe)
                var totalSimples = parseFloat(projeto.vlrNFS) * (parseFloat(alqEfe))
                //console.log('totalSimples=>' + totalSimples)
                totalImposto = parseFloat(totalSimples).toFixed(2)
                //console.log('totalImposto=>' + totalImposto)
                projeto.impostoSimples = parseFloat(totalImposto).toFixed(2)
                impostoIRPJAdd = 0
                projeto.impostoAdd = 0
                impostoIRPJ = 0
                projeto.impostoIRPJ = 0
                impostoCSLL = 0
                projeto.impostoCSLL = 0
                impostoCOFINS = 0
                projeto.impostoCOFINS = 0
                impostoPIS = 0
                projeto.impostoPIS = 0
            } else {
                if (empresa.regime == 'Lucro Real') {
                    if ((parseFloat(prjLR) / 12) > 20000) {
                        fatadd = (parseFloat(prjLR) / 12) - 20000
                        //console.log('fatadd=>' + fatadd)
                        fataju = parseFloat(fatadd) * (parseFloat(empresa.alqIRPJAdd) / 100)
                        //console.log('fataju=>' + fataju)
                        aux = parseFloat(fatadd) / parseFloat(projeto.lbaimp)
                        //console.log('aux=>' + aux)
                        impostoIRPJAdd = parseFloat(fataju) / parseFloat(aux)
                        projeto.impostoAdd = impostoIRPJAdd.toFixed(2)
                    } else {
                        impostoIRPJAdd = 0
                        projeto.impostoAdd = 0
                    }

                    impostoIRPJ = parseFloat(projeto.lbaimp) * (parseFloat(empresa.alqIRPJ) / 100)
                    projeto.impostoIRPJ = impostoIRPJ.toFixed(2)
                    impostoCSLL = parseFloat(projeto.lbaimp) * (parseFloat(empresa.alqCSLL) / 100)
                    projeto.impostoCSLL = impostoCSLL.toFixed(2)
                    impostoPIS = parseFloat(projeto.vlrNFS) * 0.5 * (parseFloat(empresa.alqPIS) / 100)
                    projeto.impostoPIS = impostoPIS.toFixed(2)
                    impostoCOFINS = parseFloat(projeto.vlrNFS) * 0.5 * (parseFloat(empresa.alqCOFINS) / 100)
                    projeto.impostoCOFINS = impostoCOFINS.toFixed(2)
                    totalImposto = parseFloat(impostoIRPJ) + parseFloat(impostoIRPJAdd) + parseFloat(impostoCSLL) + parseFloat(impostoPIS) + parseFloat(impostoCOFINS)
                } else {
                    //console.log('Empresa=>Lucro Presumido')
                    if (((parseFloat(prjLP) * 0.32) / 3) > 20000) {
                        fatadd = ((parseFloat(prjLP) * 0.32) / 3) - 20000
                        fataju = parseFloat(fatadd) / 20000
                        impostoIRPJAdd = (parseFloat(projeto.vlrNFS) * 0.32) * (parseFloat(fataju) / 100) * (parseFloat(empresa.alqIRPJAdd) / 100)
                        projeto.impostoAdd = impostoIRPJAdd.toFixed(2)
                    } else {
                        impostoIRPJAdd = 0
                        projeto.impostoAdd = 0
                    }
                    //console.log('impostoIRPJAdd=>' + impostoIRPJAdd)
                    impostoIRPJ = parseFloat(projeto.vlrNFS) * 0.32 * (parseFloat(empresa.alqIRPJ) / 100)
                    projeto.impostoIRPJ = impostoIRPJ.toFixed(2)
                    //console.log('impostoIRPJ=>' + impostoIRPJ)
                    impostoCSLL = parseFloat(projeto.vlrNFS) * 0.32 * (parseFloat(empresa.alqCSLL) / 100)
                    projeto.impostoCSLL = impostoCSLL.toFixed(2)
                    //console.log('impostoCSLL=>' + impostoCSLL)
                    impostoCOFINS = parseFloat(projeto.vlrNFS) * (parseFloat(empresa.alqCOFINS) / 100)
                    projeto.impostoCOFINS = impostoCOFINS.toFixed(2)
                    //console.log('impostoCOFINS=>' + impostoCOFINS)
                    impostoPIS = parseFloat(projeto.vlrNFS) * (parseFloat(empresa.alqPIS) / 100)
                    projeto.impostoPIS = impostoPIS.toFixed(2)
                    //console.log('impostoPIS=>' + impostoPIS)
                    totalImposto = parseFloat(impostoIRPJ) + parseFloat(impostoIRPJAdd) + parseFloat(impostoCSLL) + parseFloat(impostoPIS) + parseFloat(impostoCOFINS)
                    //console.log('totalImposto=>' + totalImposto)
                }
            }
            //Validar ICMS
            //console.log('projeto.fatequ=>' + projeto.fatequ)
            //console.log('empresa.alqICMS=>' + empresa.alqICMS)
            if (projeto.fatequ == true) {
                if (empresa.alqICMS != null) {
                    impostoICMS = (parseFloat(projeto.vlrNFS)) * (parseFloat(empresa.alqICMS) / 100)
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
            var parISSVlr
            if (projeto.impNFS > 0) {
                parISSVlr = parseFloat(projeto.impNFS) / parseFloat(projeto.valor) * 100
            } else {
                parISSVlr = 0
            }

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

                    Empresa.findOne({ _id: projeto.empresa }).lean().then((empresa) => {
                        switch (empresa.regime) {
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
                            res.render('projeto/gerenciamento/edittributos', { sucesso: sucesso, projeto: projeto, empresa: empresa, ehSimples: ehSimples, ehLP: ehLP, ehLR: ehLR, cliente: cliente })
                        }).catch((err) => {
                            req.flash('error_msg', 'Nenhum cliente encontrado.')
                            res.redirect('/cliente/consulta')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Nenhum empresa encontrado.')
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
            req.flash('error_msg', 'Não foi possível encontrar o empresa.')
            res.redirect('/configuracao/consultaempresa')
        })
    })
})

router.post('/salvacronograma/', ehAdmin, (req, res) => {

    var erros = ''
    var sucesso = ''
    const { _id } = req.user
    var dataentrega
    var ano
    var mes
    var dia
    var dataEntregaReal
    var atrasou = false

    var checkPla = 'unchecked'
    var checkAte = 'unchecked'
    var checkPrj = 'unchecked'
    var checkEst = 'unchecked'
    var checkMod = 'unchecked'
    var checkInv = 'unchecked'
    var checkEae = 'unchecked'
    var checkStb = 'unchecked'
    var checkPnl = 'unchecked'
    var checkVis = 'unchecked'

    if ((typeof req.body.datepla != 'undefined') && (req.body.datepla != '')) {
        checkPla = 'checked'
    }
    if ((typeof req.body.dateate != 'undefined') && (req.body.dateate != '')) {
        checkAte = 'checked'
    }
    if ((typeof req.body.dateprj != 'undefined') && (req.body.dateprj != '')) {
        checkPrj = 'checked'
    }
    if ((typeof req.body.dateest != 'undefined') && (req.body.dateest != '')) {
        checkEst = 'checked'
    }
    if ((typeof req.body.datemod != 'undefined') && (req.body.datemod != '')) {
        checkMod = 'checked'
    }
    if ((typeof req.body.dateinv != 'undefined') && (req.body.dateinv != '')) {
        checkInv = 'checked'
    }
    if ((typeof req.body.dateeae != 'undefined') && (req.body.dateeae != '')) {
        checkEae = 'checked'
    }
    if ((typeof req.body.datestb != 'undefined') && (req.body.datestb != '')) {
        checkStb = 'checked'
    }
    if ((typeof req.body.datepnl != 'undefined') && (req.body.datepnl != '')) {
        checkPnl = 'checked'
    }
    if ((typeof req.body.datevis != 'undefined') && (req.body.datevis != '')) {
        checkVis = 'checked'
    }

    Projeto.findOne({ _id: req.body.idprojeto }).then((prj_entrega) => {
        Cronograma.findOne({ projeto: req.body.idprojeto }).then((cronograma) => {
            Realizado.findOne({ projeto: req.body.idprojeto }).then((realizado) => {
                if (req.body.perges != '' && typeof req.body.perges != 'undefined' && req.body.perges != 0) {
                    var AC = 0
                    var ev = 0
                    var evPerGes = 0
                    var evPerKit = 0
                    var evPerIns = 0
                    var evPerPro = 0
                    var evPerAli = 0
                    var evPerDes = 0
                    var evPerHtl = 0
                    var evPerCmb = 0
                    var evPerCer = 0
                    var evPerCen = 0
                    var evPerPos = 0
                    var cpi = 0
                    var tcpi = 0
                    var spi = 0
                    var eac = 0
                    var etc = 0
                    var texto

                    var custoPlanoPrj = prj_entrega.custoPlano
                    var vlrKitPrj = prj_entrega.vlrkit
                    var desAdm = prj_entrega.desAdm
                    var vlrcom = prj_entrega.vlrcom
                    var totalTributos = prj_entrega.totalTributos
                    var margemLL = prj_entrega.valor * (parseFloat(prj_entrega.parLiqVlr) / 100)
                    var valorComReserva = parseFloat(custoPlanoPrj) + parseFloat(vlrKitPrj) + parseFloat(desAdm) + parseFloat(vlrcom) + parseFloat(totalTributos) + parseFloat(margemLL)

                    //Definição do erning value
                    evPerGes = (parseFloat(prj_entrega.totges)) * (parseFloat(req.body.perges) / 100)
                    if (isNaN(evPerGes)) {
                        evPerGes = 0
                    }
                    evPerKit = (parseFloat(prj_entrega.vlrkit)) * (parseFloat(req.body.perkit) / 100)
                    if (isNaN(evPerKit)) {
                        evPerKit = 0
                    }
                    evPerIns = (parseFloat(prj_entrega.totint)) * (parseFloat(req.body.perins) / 100)
                    if (isNaN(evPerIns)) {
                        evPerIns = 0
                    }
                    evPerPro = (parseFloat(prj_entrega.totpro)) * (parseFloat(req.body.perpro) / 100)
                    if (isNaN(evPerPro)) {
                        evPerPro = 0
                    }
                    evPerAli = (parseFloat(prj_entrega.totali)) * (parseFloat(req.body.perali) / 100)
                    if (isNaN(evPerAli)) {
                        evPerAli = 0
                    }
                    evPerDes = (parseFloat(prj_entrega.totdes)) * (parseFloat(req.body.perdes) / 100)
                    if (isNaN(evPerDes)) {
                        evPerDes = 0
                    }
                    evPerHtl = (parseFloat(prj_entrega.tothtl)) * (parseFloat(req.body.perhtl) / 100)
                    if (isNaN(evPerHtl)) {
                        evPerHtl = 0
                    }
                    evPerCmb = (parseFloat(prj_entrega.totcmb)) * (parseFloat(req.body.percmb) / 100)
                    if (isNaN(evPerCmb)) {
                        evPerCmb = 0
                    }
                    evPerCer = (parseFloat(prj_entrega.totcer)) * (parseFloat(req.body.percer) / 100)
                    if (isNaN(evPerCer)) {
                        evPerCer = 0
                    }
                    evPerCen = (parseFloat(prj_entrega.totcen)) * (parseFloat(req.body.percen) / 100)
                    if (isNaN(evPerCen)) {
                        evPerCen = 0
                    }
                    evPerPos = (parseFloat(prj_entrega.totpos)) * (parseFloat(req.body.perpos) / 100)
                    if (isNaN(evPerPos)) {
                        evPerPos = 0
                    }

                    if (prj_entrega.ehDireto == 'false') {
                        evPerDes = 0
                    } else {
                        evPerCmb = 0
                        evPerHtl = 0
                    }

                    //console.log('evPerGes=>' + evPerGes)
                    //console.log('evPerKit=>' + evPerKit)
                    //console.log('evPerIns=>' + evPerIns)
                    //console.log('evPerPro=>' + evPerPro)
                    //console.log('evPerDes=>' + evPerDes)
                    //console.log('evPerAli=>' + evPerAli)
                    //console.log('evPerHtl=>' + evPerHtl)
                    //console.log('evPerCmb=>' + evPerCmb)
                    //console.log('evPerCer=>' + evPerCer)
                    //console.log('evPerCen=>' + evPerCen)
                    //console.log('evPerPos=>' + evPerPos)

                    ev = (parseFloat(evPerGes) + parseFloat(evPerKit) + parseFloat(evPerIns) + parseFloat(evPerPro) + parseFloat(evPerAli) + parseFloat(evPerDes) + parseFloat(evPerHtl) + parseFloat(evPerCmb) + parseFloat(evPerCer) + parseFloat(evPerCen) + parseFloat(evPerPos)).toFixed(2)
                    //console.log('ev=>' + ev)

                    //console.log('vlrKitPrj=>' + vlrKitPrj)
                    //console.log('custoPlanoPrj=>' + custoPlanoPrj)
                    var perConclusao = parseFloat(ev) / (parseFloat(vlrKitPrj) + parseFloat(custoPlanoPrj))
                    if (perConclusao == 100) {
                        texto = 'Projeto Concluído'
                    }
                    //console.log('perConclusao=>' + perConclusao)
                    var custoPlanoRlz
                    var totges = req.body.totges
                    if (isNaN(totges) || totges == '' || totges == null) {
                        totges = 0
                    }

                    //console.log('totges=>' + totges)
                    var vlrKitRlz = req.body.vlrkit
                    if (isNaN(vlrKitRlz) || vlrKitRlz == '' || vlrKitRlz == null) {
                        vlrKitRlz = 0
                    }
                    //console.log('vlrKitRlz=>' + vlrKitRlz)
                    var totint = req.body.totint
                    if (isNaN(totint) || totint == '' || totint == null) {
                        totint = 0
                    }
                    //console.log('totint=>' + totint)
                    var totpro = req.body.totpro
                    if (isNaN(totpro) || totpro == '' || totpro == null) {
                        totpro = 0
                    }
                    //console.log('totpro=>' + totpro)
                    var totali = req.body.totali
                    if (isNaN(totali) || totali == '' || totali == null) {
                        totali = 0
                    }
                    //console.log('totali=>' + totali)
                    var tothtl = req.body.tothtl
                    if (isNaN(tothtl) || tothtl == '' || tothtl == null) {
                        tothtl = 0
                    }
                    //console.log('tothtl=>' + tothtl)
                    var totcmb = req.body.totcmb
                    if (isNaN(totcmb) || totcmb == '' || totcmb == null) {
                        totcmb = 0
                    }
                    //console.log('totcmb=>' + totcmb)
                    var totdes = req.body.totdes
                    if (isNaN(totdes) || totdes == '' || totdes == null) {
                        totdes = 0
                    }
                    //console.log('totdes=>' + totdes)
                    var cercamento = req.body.cercamento
                    if (isNaN(cercamento) || cercamento == '' || cercamento == null) {
                        cercamento = 0
                    }
                    //console.log('cercamento=>' + cercamento)
                    var central = req.body.central
                    if (isNaN(central) || central == '' || central == null) {
                        central = 0
                    }
                    //console.log('central=>' + central)
                    var postecond = req.body.postecond
                    if (isNaN(postecond) || postecond == '' || postecond == null) {
                        postecond = 0
                    }
                    //console.log('postecond=>' + postecond)
                    if (prj_entrega.ehDireto == 'false') {
                        custoPlanoRlz = parseFloat(totges) + parseFloat(vlrKitRlz) + parseFloat(totint) + parseFloat(totpro) + parseFloat(totali) + parseFloat(tothtl) + parseFloat(totcmb) + parseFloat(cercamento) + parseFloat(central) + parseFloat(postecond)
                    } else {
                        custoPlanoRlz = parseFloat(totges) + parseFloat(vlrKitRlz) + parseFloat(totint) + parseFloat(totpro) + parseFloat(totdes) + parseFloat(totali) + parseFloat(cercamento) + parseFloat(central) + parseFloat(postecond)
                    }
                    //Definição do actual cost

                    //console.log('custoPlanoRlz=>' + custoPlanoRlz)
                    /*
                    //console.log('vlrKitRlz=>' + vlrKitRlz)
                    //console.log('desAdm=>' + desAdm)
                    //console.log('vlrcom=>' + vlrcom)
                    //console.log('totalTributos=>' + totalTributos)
                    //console.log('margemLL=>' + margemLL)
                    */
                    AC = parseFloat(custoPlanoRlz).toFixed(2)
                    if (isNaN(AC)) {
                        AC = 0
                    }
                    //console.log('AC=>' + AC)
                    if (AC != '') {
                        ac = AC
                    } else {
                        ac = ev
                    }
                    cpi = parseFloat(ev) / parseFloat(AC)
                    //console.log('cpi=>' + cpi)
                    if (cpi == 'Infinity') {
                        cpi = 1
                    }
                    tcpi = (parseFloat(prj_entrega.valor) - parseFloat(ev)) / (parseFloat(prj_entrega.valor) - parseFloat(ac))
                    if (isNaN(tcpi)) {
                        tcpi = 1
                    }
                    eac = parseFloat(prj_entrega.custoTotal) / parseFloat(cpi)
                    if (cronograma.perPro == 100) {
                        etc = parseFloat(eac) - parseFloat(AC) - parseFloat(prj_entrega.vlrart)
                    } else {
                        etc = parseFloat(eac) - parseFloat(AC)
                    }
                    spi = parseFloat(prj_entrega.hrsprj) * (1 - (parseFloat(perConclusao)))
                    if (isNaN(spi)) {
                        spi = 0
                    }
                    prj_entrega.perConclusao = Math.round(perConclusao * 100)
                    prj_entrega.actualCost = parseFloat(AC).toFixed(2)
                    prj_entrega.cpi = parseFloat(cpi).toFixed(4)
                    prj_entrega.tcpi = parseFloat(tcpi).toFixed(4)
                    prj_entrega.etc = parseFloat(etc).toFixed(2)
                    prj_entrega.eac = parseFloat(eac).toFixed(2)
                    prj_entrega.spi = parseFloat(spi).toFixed(2)
                    prj_entrega.tspi = 1
                } else {
                    prj_entrega.perConclusao = 0
                    prj_entrega.etc = prj_entrega.valor
                    prj_entrega.actualCost = 0
                    prj_entrega.cpi = 1
                    prj_entrega.tcpi = 1
                    prj_entrega.spi = 1
                    prj_entrega.tspi = 1
                }

                if (req.body.executando == 'true') {
                    if (req.body.datepla != '' && typeof req.body.datepla != 'undefined') {
                        atrasou = comparaDatas(cronograma.dateplafim, req.body.datepla)
                    }
                    if (req.body.dateprj != '' && typeof req.body.dateprj != 'undefined') {
                        atrasou = comparaDatas(cronograma.dateprjfim, req.body.dateprj)
                    }

                    if (req.body.dateate != '' && typeof req.body.dateate != 'undefined') {
                        atrasou = comparaDatas(cronograma.dateatefim, req.body.dateate)
                    }

                    if (req.body.dateest != '' && typeof req.body.dateest != 'undefined') {
                        atrasou = comparaDatas(cronograma.dateestfim, req.body.dateest)
                    }

                    if (req.body.datemod != '' && typeof req.body.datemod != 'undefined') {
                        atrasou = comparaDatas(cronograma.datemodfim, req.body.datemod)
                    }

                    if (req.body.dateinv != '' && typeof req.body.dateinv != 'undefined') {
                        atrasou = comparaDatas(cronograma.dateinvfim, req.body.dateinv)
                    }

                    if (req.body.dateeae != '' && typeof req.body.dateeae != 'undefined') {
                        atrasou = comparaDatas(cronograma.dateeaefim, req.body.dateeae)
                    }

                    if (req.body.datestb != '' && typeof req.body.datestb != 'undefined') {
                        atrasou = comparaDatas(cronograma.datestbfim, req.body.datestb)
                    }

                    if (req.body.datepnl != '' && typeof req.body.datepnl != 'undefined') {
                        atrasou = comparaDatas(cronograma.datepnlfim, req.body.datepnl)
                    }

                    if (req.body.datevis != '' && typeof req.body.datevis != 'undefined') {
                        atrasou = comparaDatas(cronograma.datevisfim, req.body.datevis)
                    }

                    if (req.body.datevis != '' && typeof req.body.datevis != 'undefined') {
                        if (req.body.dateEntregaReal != '' && typeof req.body.dateEntregaReal != 'undifined') {
                            if (comparaDatas(req.body.dateEntregaReal, req.body.datevis)) {
                                erros = erros + 'Não foi possível salvar a nova data de entrega de finalização. '
                            } else {
                                dataEntregaReal = req.body.dateEntregaReal
                                ano = dataEntregaReal.substring(0, 4)
                                mes = dataEntregaReal.substring(5, 7)
                                dia = dataEntregaReal.substring(8, 11)
                                dataEntregaReal = dia + '/' + mes + '/' + ano
                                prj_entrega.datafim = dataEntregaReal
                                prj_entrega.valDataFim = req.body.dateEntregaReal
                                atrasou = comparaDatas(req.body.dateEntregaHidden, req.body.dateEntregaReal)
                            }
                        }
                    }
                }

                //console.log('atrasou=>' + atrasou)

                console.log('req.body.dateentrega=>' + req.body.dateentrega)
                console.log('req.body.datevisfim=>' + req.body.datevisfim)
                console.log('req.body.orcado=>' + req.body.orcado)

                if (req.body.orcado == 'true') {
                    //console.log('entrou orçado')
                    if (req.body.datevisfim == '' || typeof req.body.datevisfim == 'undefined') {
                        //console.log('prj_entrega.valDataPrev=>' + prj_entrega.valDataPrev)
                        //console.log('req.body.dateentrega=>' + req.body.dateentrega)
                        if (req.body.dateentrega != '' && typeof req.body.dateentrega != 'undefined' && (req.body.dateentrega != prj_entrega.valDataPrev)) {
                            erros = erros + 'A data de entrega poderá ser alterada quando data final da vistoria estiver preenchida.'
                            req.flash('error_msg', erros)
                            res.redirect('/gerenciamento/cronograma/' + req.body.idprojeto)
                        }
                    } else {
                        if (req.body.dateentrega != '' && typeof req.body.dateentrega != 'undefined' && comparaDatas(req.body.dateentrega, req.body.datevisfim) == false) {
                            dataentrega = req.body.dateentrega
                            ano = dataentrega.substring(0, 4)
                            mes = dataentrega.substring(5, 7)
                            dia = dataentrega.substring(8, 11)
                            dataentrega = dia + '/' + mes + '/' + ano
                            prj_entrega.dataprev = dataentrega
                            prj_entrega.dataord = ano + mes + dia
                            prj_entrega.valDataPrev = req.body.dateentrega
                        }
                    }
                }
                prj_entrega.atrasado = atrasou
                prj_entrega.save().then(() => {
                    //console.log('salvou o projeto')
                    if (req.body.executando == 'true') {
                        //---Validar as datas de realização com data estimada do fim da entrega--//
                        if (req.body.datepla != '' && typeof req.body.datepla != 'undefined') {
                            cronograma.atrasouPla = comparaDatas(cronograma.dateplafim, req.body.datepla)
                        } else {
                            cronograma.atrasouPla = false
                        }
                        if (req.body.dateprj != '' && typeof req.body.dateprj != 'undefined') {
                            cronograma.atrasouPrj = comparaDatas(cronograma.dateprjfim, req.body.dateprj)
                        } else {
                            cronograma.atrasouPrj = false
                        }
                        if (req.body.dateate != '' && typeof req.body.dateate != 'undefined') {
                            cronograma.atrasouAte = comparaDatas(cronograma.dateatefim, req.body.dateate)
                        } else {
                            cronograma.atrasouAte = false
                        }
                        if (req.body.dateest != '' && typeof req.body.dateest != 'undefined') {
                            cronograma.atrasouEst = comparaDatas(cronograma.dateestfim, req.body.dateest)
                        } else {
                            cronograma.atrasouEst = false
                        }
                        if (req.body.datemod != '' && typeof req.body.datemod != 'undefined') {
                            cronograma.atrasouMod = comparaDatas(cronograma.datemodfim, req.body.datemod)
                        } else {
                            cronograma.atrasouMod = false
                        }
                        if (req.body.dateinv != '' && typeof req.body.dateinv != 'undefined') {
                            cronograma.atrasouInv = comparaDatas(cronograma.dateinvfim, req.body.dateinv)
                        } else {
                            cronograma.atrasouInv = false
                        }
                        if (req.body.dateeae != '' && typeof req.body.dateeae != 'undefined') {
                            cronograma.atrasouEae = comparaDatas(cronograma.dateeaefim, req.body.dateeae)
                        } else {
                            cronograma.atrasouEae = false
                        }
                        if (req.body.datestb != '' && typeof req.body.datestb != 'undefined') {
                            cronograma.atrasouStb = comparaDatas(cronograma.datestbfim, req.body.datestb)
                        } else {
                            cronograma.atrasouStb = false
                        }
                        if (req.body.datepnl != '' && typeof req.body.datepnl != 'undefined') {
                            cronograma.atrasouPnl = comparaDatas(cronograma.datepnlfim, req.body.datepnl)
                        } else {
                            cronograma.atrasouPnl = false
                        }
                        if (req.body.datevis != '' && typeof req.body.datevis != 'undefined') {
                            cronograma.atrasouVis = comparaDatas(cronograma.datevisfim, req.body.datevis)
                        } else {
                            cronograma.atrasouVis = false
                        }
                    }
                    if (req.body.orcado == 'true') {
                        //console.log('entrou orçado')
                        cronograma.dateplaini = req.body.dateplaini
                        if (req.body.dateplaini != '' && typeof req.body.dateplaini != 'undefined') {
                            cronograma.agendaPlaIni = dataBusca(req.body.dateplaini)
                        }
                        cronograma.dateateini = req.body.dateateini
                        if (req.body.dateateini != '' && typeof req.body.dateateini != 'undefined') {
                            cronograma.agendaAteIni = dataBusca(req.body.dateateini)
                        }
                        cronograma.dateprjini = req.body.dateprjini
                        if (req.body.dateprjini != '' && typeof req.body.dateprjini != 'undefined') {
                            cronograma.agendaPrjIni = dataBusca(req.body.dateprjini)
                        }
                        cronograma.dateestini = req.body.dateestini
                        if (req.body.dateestini != '' && typeof req.body.dateestini != 'undefined') {
                            cronograma.agendaEstIni = dataBusca(req.body.dateestini)
                        }
                        cronograma.datemodini = req.body.datemodini
                        if (req.body.datemodini != '' && typeof req.body.datemodini != 'undefined') {
                            cronograma.agendaModIni = dataBusca(req.body.datemodini)
                        }
                        cronograma.dateinvini = req.body.dateinvini
                        if (req.body.dateinvini != '' && typeof req.body.dateinvini != 'undefined') {
                            cronograma.agendaInvIni = dataBusca(req.body.dateinvini)
                        }
                        cronograma.dateeaeini = req.body.dateeaeini
                        if (req.body.dateeaeini != '' && typeof req.body.dateeaeini != 'undefined') {
                            cronograma.agendaEaeIni = dataBusca(req.body.dateeaeini)
                        }
                        cronograma.datestbini = req.body.datestbini
                        if (req.body.datestbini != '' && typeof req.body.datestbini != 'undefined') {
                            cronograma.agendaEstIni = dataBusca(req.body.datestbini)
                        }
                        cronograma.datepnlini = req.body.datepnlini
                        if (req.body.datepnlini != '' && typeof req.body.datepnlini != 'undefined') {
                            cronograma.agendaPnlIni = dataBusca(req.body.datepnlini)
                        }
                        cronograma.datevisini = req.body.datevisini
                        if (req.body.datevisini != '' && typeof req.body.datevisini != 'undefined') {
                            cronograma.agendaVisIni = dataBusca(req.body.datevisini)
                        }

                        cronograma.dateplafim = req.body.dateplafim
                        if (req.body.dateplafim != '' && typeof req.body.dateplafim != 'undefined') {
                            cronograma.agendaPlaFim = dataBusca(req.body.dateplafim)
                        }
                        cronograma.dateatefim = req.body.dateatefim
                        if (req.body.dateatefim != '' && typeof req.body.dateatefim != 'undefined') {
                            cronograma.agendaAteFim = dataBusca(req.body.dateatefim)
                        }
                        cronograma.dateprjfim = req.body.dateprjfim
                        if (req.body.dateprjfim != '' && typeof req.body.dateprjfim != 'undefined') {
                            cronograma.agendaPrjFim = dataBusca(req.body.dateprjfim)
                        }
                        cronograma.dateestfim = req.body.dateestfim
                        if (req.body.dateestfim != '' && typeof req.body.dateestfim != 'undefined') {
                            cronograma.agendaEstFim = dataBusca(req.body.dateestfim)
                        }
                        cronograma.datemodfim = req.body.datemodfim
                        if (req.body.datemodfim != '' && typeof req.body.datemodfim != 'undefined') {
                            cronograma.agendaModFim = dataBusca(req.body.datemodfim)
                        }
                        cronograma.dateinvfim = req.body.dateinvfim
                        if (req.body.dateinvfim != '' && typeof req.body.dateinvfim != 'undefined') {
                            cronograma.agendaInvFim = dataBusca(req.body.dateinvfim)
                        }
                        cronograma.dateeaefim = req.body.dateeaefim
                        if (req.body.dateeaefim != '' && typeof req.body.dateeaefim != 'undefined') {
                            cronograma.agendaEaeFim = dataBusca(req.body.dateeaefim)
                        }
                        cronograma.datestbfim = req.body.datestbfim
                        if (req.body.datestbfim != '' && typeof req.body.datestbfim != 'undefined') {
                            cronograma.agendaStbFim = dataBusca(req.body.datestbfim)
                        }
                        cronograma.datepnlfim = req.body.datepnlfim
                        if (req.body.datepnlfim != '' && typeof req.body.datepnlfim != 'undefined') {
                            cronograma.agendaPnlFim = dataBusca(req.body.datepnlfim)
                        }
                        cronograma.datevisfim = req.body.datevisfim
                        if (req.body.datevisfim != '' && typeof req.body.datevisfim != 'undefined') {
                            cronograma.agendaVisFim = dataBusca(req.body.datevisfim)
                        }

                        if (req.body.datevisfim != '' && typeof req.body.datevisfim != 'undefined') {
                            if (req.body.dateentrega != '' && typeof req.body.dateentrega != 'undefined' && comparaDatas(req.body.dateentrega, req.body.datevisfim)) {
                                erros = 'A data de entrega deve ser maior ou igual a data final da vistoria.'
                                req.flash('error_msg', erros)
                                res.redirect('/gerenciamento/cronograma/' + req.body.idprojeto)
                            } else {
                                cronograma.dateentrega = req.body.dateentrega
                            }
                        }
                        cronograma.save().then(() => {
                            //console.log('cronograma salvo.')
                            sucesso = sucesso + 'Cronograma salvo com sucesso. '
                            req.flash('error_msg', erros)
                            req.flash('success_msg', sucesso)
                            res.redirect('/gerenciamento/cronograma/' + req.body.idprojeto)
                        }).catch((err) => {
                            req.flash('error_msg', 'Não foi possível salvar o cronograma.')
                            res.redirect('/gerenciamento/cronograma/' + req.body.idprojeto)
                        })

                    }
                    if (req.body.executando == 'true') {
                        //console.log('perges=>' + req.body.perges)
                        var perges = req.body.perges
                        var perkit = req.body.perkit
                        var perins = req.body.perins
                        var perpro = req.body.perpro
                        var perali = req.body.perali
                        var perdes = req.body.perdes
                        var perhtl = req.body.perhtl
                        var percmb = req.body.percmb
                        var percer = req.body.percer
                        var percen = req.body.percen
                        var perpos = req.body.perpos
                        if (perges == '') {
                            perges = 0
                        }
                        if (perkit == '') {
                            perkit = 0
                        }
                        if (perins == '') {
                            perins = 0
                        }
                        if (perpro == '') {
                            perpro = 0
                        }
                        if (perali == '') {
                            perali = 0
                        }
                        if (perdes == '') {
                            perdes = 0
                        }
                        if (perhtl == '') {
                            perhtl = 0
                        }
                        if (percmb == '') {
                            percmb = 0
                        }
                        if (percer == '') {
                            percer = 0
                        }
                        if (percen == '') {
                            percen = 0
                        }
                        if (perpos == '') {
                            perpos = 0
                        }
                        cronograma.perGes = perges
                        cronograma.perKit = perkit
                        cronograma.perIns = perins
                        cronograma.perPro = perpro
                        cronograma.perAli = perali
                        cronograma.perDes = perdes
                        cronograma.perHtl = perhtl
                        cronograma.perCmb = percmb
                        cronograma.perCer = percer
                        cronograma.perCen = percen
                        cronograma.perPos = perpos
                        cronograma.checkPla = checkPla
                        cronograma.checkAte = checkAte
                        cronograma.checkPrj = checkPrj
                        cronograma.checkEst = checkEst
                        cronograma.checkMod = checkMod
                        cronograma.checkInv = checkInv
                        cronograma.checkEae = checkEae
                        cronograma.checkStb = checkStb
                        cronograma.checkPnl = checkPnl
                        cronograma.checkVis = checkVis
                        cronograma.datepla = req.body.datepla
                        cronograma.dateate = req.body.dateate
                        cronograma.dateprj = req.body.dateprj
                        cronograma.dateest = req.body.dateest
                        cronograma.datemod = req.body.datemod
                        cronograma.dateinv = req.body.dateinv
                        cronograma.dateeae = req.body.dateeae
                        cronograma.datestb = req.body.datestb
                        cronograma.datepnl = req.body.datepnl
                        cronograma.datevis = req.body.datevis

                        if ((req.body.datevis != '' && typeof req.body.datevis != 'undefined') && (req.body.dateEntregaReal != '' && typeof req.body.dateEntregaReal != 'undifined')) {
                            if (comparaDatas(req.body.dateEntregaReal, req.body.datevis)) {
                                erros = erros + 'A data de entrega de finalização do projeto deve ser maior ou igual a data de finalização da vistoria.'
                            } else {
                                cronograma.dateEntregaReal = req.body.dateEntregaReal
                            }
                        } else {
                            if ((req.body.datevis == '' || typeof req.body.datevis == 'undefined') && (req.body.dateEntregaReal != '' && typeof req.body.dateEntregaReal != 'undifined')) {
                                erros = erros + 'A data de entrega de finalização somente será aceita após definir a data de finalização da vistoria.'
                            }
                        }

                        if (realizado != null) {
                            /*
                            //console.log('entrou realizado')
                            //console.log('totint=>' + totint)
                            //console.log('totges=>' + totges)
                            //console.log('totpro=>' + totpro)
                            //console.log('vlrart=>' + vlrart)
                            //console.log('totali=>' + totali)
                            //console.log('totdes=>' + totdes)
                            //console.log('tothtl=>' + tothtl)
                            //console.log('totcmb=>' + totcmb)
                            //console.log('cercamento=>' + cercamento)
                            //console.log('central=>' + central)
                            //console.log('postecond=>' + postecond)
                            */
                            realizado.vlrkit = vlrKitRlz
                            realizado.totint = totint
                            realizado.totges = totges
                            realizado.totpro = totpro
                            realizado.totali = totali
                            realizado.totdes = totdes
                            realizado.tothtl = tothtl
                            realizado.totcmb = totcmb
                            realizado.valorCer = cercamento
                            realizado.valorCen = central
                            realizado.valorPos = postecond
                            realizado.vlrart = 0
                            realizado.desAdm = 0
                            realizado.vlrcom = 0
                            realizado.valor = 0
                            realizado.vlrNFS = 0
                            realizado.custoPlano = 0
                            realizado.lucroLiquido = 0
                            realizado.custofix = 0
                            realizado.cutovar = 0
                            realizado.valorMod = 0
                            realizado.valorInv = 0
                            realizado.valorEst = 0
                            realizado.valorCab = 0
                            realizado.valorDis = 0
                            realizado.valorDPS = 0
                            realizado.valorSB = 0
                            realizado.valorOcp = 0
                            realizado.totalTributos = 0
                            realizado.custoPlano = 0

                            cronograma.save().then(() => {
                                //console.log('cronograma salvo.')
                                realizado.save().then(() => {
                                    sucesso = sucesso + 'Cronograma salvo com sucesso. '
                                    req.flash('error_msg', erros)
                                    req.flash('success_msg', sucesso)
                                    res.redirect('/gerenciamento/cronograma/' + req.body.idprojeto)
                                }).catch((err) => {
                                    req.flash('error_msg', 'Não foi possível salvar o projeto.')
                                    res.redirect('/gerenciamento/cronograma/' + req.body.idprojeto)
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Não foi possível salvar o cronograma.')
                                res.redirect('/gerenciamento/cronograma/' + req.body.idprojeto)
                            })

                        } else {
                            //console.log('novo realizado')
                            //console.log('req.boy.totint=>' + req.body.totint)
                            const realizado = {
                                user: _id,
                                projeto: req.body.idprojeto,
                                vlrkit: req.body.vlrKitRlz,
                                totint: req.body.totint,
                                totges: req.body.totges,
                                totpro: req.body.totpro,
                                totali: req.body.totali,
                                totdes: req.body.totdes,
                                tothtl: req.body.tothtl,
                                totcmb: req.body.totcmb,
                                valorCer: req.body.cercamento,
                                valorCen: req.body.central,
                                valorPos: req.body.postecond,
                                vlrart: 0,
                                desAdm: 0,
                                vlrcom: 0,
                                valor: 0,
                                vlrNFS: 0,
                                custoPlano: 0,
                                lucroLiquido: 0,
                                custofix: 0,
                                cutovar: 0,
                                valorMod: 0,
                                valorInv: 0,
                                valorEst: 0,
                                valorCab: 0,
                                valorDis: 0,
                                valorDPS: 0,
                                valorSB: 0,
                                valorOcp: 0,
                                totalTributos: 0,
                                custoPlano: 0
                            }

                            new Realizado(realizado).save().then(() => {
                                cronograma.save().then(() => {
                                    sucesso = sucesso + 'Cronograma salvo com sucesso. '
                                    req.flash('error_msg', erros)
                                    req.flash('success_msg', sucesso)
                                    res.redirect('/gerenciamento/cronograma/' + req.body.idprojeto)
                                }).catch((err) => {
                                    req.flash('error_msg', 'Não foi possível salvar o cronograma.')
                                    res.redirect('/gerenciamento/cronograma/' + req.body.idprojeto)
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Não foi posível realizar o projeto.')
                                res.redirect('/gerenciamento/cronograma/' + req.body.idprojeto)
                            })
                        }
                    }

                }).catch((err) => {
                    req.flash('error_msg', 'Não foi possível salvar o projeto.')
                    res.redirect('/gerenciamento/cronograma/' + req.body.idprojeto)
                })
            }).catch((err) => {
                req.flash('error_msg', 'Não foi possível encontrar o projeto realizado.')
                res.redirect('/gerenciamento/cronograma/' + req.body.idprojeto)
            })
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível encontrar o cronograma.')
            res.redirect('/gerenciamento/cronograma/' + req.body.idprojeto)
        })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar o projeto.')
        res.redirect('/gerenciamento/cronograma/' + req.body.idprojeto)
    })
})

module.exports = router