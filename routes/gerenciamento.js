// require('../app')
require('../model/Usuario')
require('../model/Empresa')
require('../model/Cliente')
require('../model/Tarefas')
require('../model/Plano')
require('../model/AtvTelhado')
require('../model/AtvAterramento')
require('../model/AtvInversor')
require('../model/Servico')
require('../model/Obra')
require('../model/Tarefas')
require('../model/ImagensTarefas')
require('../model/Equipe')

const { ehAdmin } = require('../helpers/ehAdmin')

const express = require('express')
const router = express.Router()

const mongoose = require('mongoose')
const aws = require("aws-sdk");
const path = require('path')
const multer = require('multer')
const multerS3 = require("multer-s3")
const nodemailer = require('nodemailer')
const fs = require('fs').promises

const Empresa = mongoose.model('empresa')
const Cliente = mongoose.model('cliente')
const Pessoa = mongoose.model('pessoa')
const Tarefas = mongoose.model('tarefas')
const Equipe = mongoose.model('equipe')
const Plano = mongoose.model('plano')
const AtvTelhado = mongoose.model('atvTelhado')
const AtvInversor = mongoose.model('atvInversor')
const AtvAterramento = mongoose.model('atvAterramento')
const Servico = mongoose.model('servico')
const Tarefa = mongoose.model('tarefas')
const ImgTarefa = mongoose.model('imgTarefa')
const Obra = mongoose.model('obra')

const comparaDatas = require('../resources/comparaDatas')
const dataBusca = require('../resources/dataBusca')
const liberaRecursos = require('../resources/liberaRecursos')
const setData = require('../resources/setData')
const dataMensagem = require('../resources/dataMensagem')
const dataMsgNum = require('../resources/dataMsgNum')
const validaCronograma = require('../resources/validaCronograma')
const dataHoje = require('../resources/dataHoje')
const filtrarProposta = require('../resources/filtrar')
const naoVazio = require('../resources/naoVazio')
const { PutBucketTaggingRequest } = require('@aws-sdk/client-s3')

// const TextMessageService = require('comtele-sdk').TextMessageService
// const e = require('connect-flash')
// const apiKey = "8dbd4fb5-79af-45d6-a0b7-583a3c2c7d30"

//Configurando envio de e-mail
const transporter = nodemailer.createTransport({ // Configura os parâmetros de conexão com servidor.
    host: 'smtppro.zoho.com',
    port: 587,
    secure: false,
    auth: {
        user: 'alexandre.galiotto@vimmus.com.br',
        pass: '3rdn4x3L@'
    },
    tls: {
        rejectUnauthorized: false
    }
})

var credentials = new aws.SharedIniFileCredentials({ profile: 'vimmusimg' })
aws.config.credentials = credentials

var s3 = new aws.S3()

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'vimmusimg',
        key: function (req, file, cb) {
            //console.log(file)
            cb(null, file.originalname)
        }
    })
})

router.get('/consultaobra', ehAdmin, (req, res) => {
    var id
    var sql_obra
    var sql_pes
    const { _id } = req.user
    const { user } = req.user
    const { pessoa } = req.user
    if (naoVazio(user)) {
        id = user
        sql_pes = { _id: pessoa }
    } else {
        id = _id
        sql_pes = { user: id, funges: 'checked' }
    }

    var listaObra = []
    var q = 0
    var dtini
    var dtfim
    var nome_ges

    Cliente.find({ user: id }).lean().then((todos_clientes) => {
        Pessoa.find({ user: id, funges: 'checked' }).lean().then((todos_responsaveis) => {
            //console.log('todos_responsaveis=>'+todos_responsaveis)
            Empresa.find({ user: id }).lean().then((todas_empresas) => {
                Obra.find({ user: id }).sort({ 'datacad': 'asc' }).lean().then((obra) => {
                    if (naoVazio(obra)) {
                        obra.forEach((e) => {
                            console.log('e._id=>' + e._id)
                            Cliente.findOne({ _id: e.cliente }).then((cliente) => {
                                console.log('e.cliente=>' + e.cliente)
                                Pessoa.findOne({ _id: e.responsavel }).then((gestor) => {
                                    console.log('e.responsavel=>' + e.responsavel)
                                    q++
                                    console.log('e.dtini=>' + e.dtini)
                                    if (naoVazio(e.dtini)) {
                                        dtini = dataMensagem(e.dtini)
                                    } else {
                                        dtini = 'Aguardando Tarefas'
                                    }
                                    console.log('e.dtfim=>' + e.dtfim)
                                    if (naoVazio(e.dtfim)) {
                                        dtfim = dataMensagem(e.dtfim)
                                    } else {
                                        dtfim = 'Aguardando Tarefas'
                                    }

                                    if (naoVazio(gestor)) {
                                        nome_ges = gestor.nome
                                    } else {
                                        nome_ges = ''
                                    }
                                    console.log('nome_ges=>' + nome_ges)

                                    //console.log('dtini=>'+dtini)
                                    console.log('e.status=>' + e.status)
                                    console.log('e.seq=>' + e.seq)
                                    console.log('cliente.nome=>' + cliente.nome)

                                    listaObra.push({ s: e.status, id: e._id, dtini, dtfim, cadastro: dataMsgNum(e.datacad), cliente: cliente.nome, nome_ges, seq: e.seq })
                                    console.log('q=>' + q)
                                    console.log('obra.length=>' + obra.length)
                                    if (q == obra.length) {
                                        res.render('principal/consulta', { obra, listaObra, todos_clientes, todos_responsaveis, todas_empresas })
                                    }
                                }).catch((err) => {
                                    req.flash('error_msg', 'Nenhum responsável pela gestão encontrado.')
                                    res.redirect('/dashboard')
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Nenhum cliente encontrado.')
                                res.redirect('/gerenciamento/consulta')
                            })
                        })
                    } else {
                        res.render('principal/consulta', { obra, listaObra, todos_clientes, todos_responsaveis, todas_empresas })
                    }
                }).catch((err) => {
                    req.flash('error_msg', 'Nenhuma proposta encontrada.')
                    res.redirect('/dashboard')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Nenhuma empresa encontrada.')
                res.redirect('/dashboard')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Nenhum responsável encontrado.')
            res.redirect('/dashboard')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Nenhum cliente encontrada.')
        res.redirect('/dashboard')
    })
})

router.get('/emandamento/:tipo', ehAdmin, (req, res) => {
    var params = req.params.tipo
    params = params.split('tipo')
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }

    var dia01 = []
    var dia02 = []
    var dia03 = []
    var dia04 = []
    var dia05 = []
    var dia06 = []
    var dia07 = []
    var dia08 = []
    var dia09 = []
    var dia10 = []
    var dia11 = []
    var dia12 = []
    var dia13 = []
    var dia14 = []
    var dia15 = []
    var dia16 = []
    var dia17 = []
    var dia18 = []
    var dia19 = []
    var dia20 = []
    var dia21 = []
    var dia22 = []
    var dia23 = []
    var dia24 = []
    var dia25 = []
    var dia26 = []
    var dia27 = []
    var dia28 = []
    var dia29 = []
    var dia30 = []
    var dia31 = []
    var todasCores = []

    const cores = ['green', 'blue', 'tomato', 'teal', 'sienna', 'salmon', 'mediumpurple', 'rebeccapurple', 'yellowgreen', 'peru', 'cadetblue', 'coral', 'cornflowerblue', 'crimson', 'darkblue', 'darkcyan', 'orange', 'hotpink']

    var listaAndamento = []
    var dtcadastro = '00000000'
    var dtinicio = ''
    var dtfim = ''
    var responsavel = ''
    var nome_insres = ''
    var q = 0
    var anoinicio
    var mesinicio
    var anofim
    var mesfim
    var diainicio
    var diafim
    var hoje
    var meshoje
    var mestitulo
    var anotitulo
    var trintaeum = false
    var bisexto = false
    var dia
    var mes
    var dif
    var difmes
    var y = 0
    var x = -1
    var z = -1
    var caminho

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

    var hoje = dataHoje()
    var meshoje = hoje.substring(5, 7)
    var anotitulo = hoje.substring(0, 4)

    //console.log('meshoje=>' + meshoje)

    switch (meshoje) {
        case '01': janeiro = 'active'
            mestitulo = 'Janeiro '
            trintaeum = true
            break;
        case '02': fevereiro = 'active'
            mestitulo = 'Fevereiro '
            bisexto = true
            break;
        case '03': marco = 'active'
            mestitulo = 'Março '
            trintaeum = true
            break;
        case '04': abril = 'active'
            mestitulo = 'Abril '
            break;
        case '05': maio = 'active'
            mestitulo = 'Maio '
            trintaeum = true
            break;
        case '06': junho = 'active'
            mestitulo = 'Junho '
            break;
        case '07': julho = 'active'
            mestitulo = 'Julho '
            trintaeum = true
            break;
        case '08': agosto = 'active'
            mestitulo = 'Agosto '
            trintaeum = true
            break;
        case '09': setembro = 'active'
            mestitulo = 'Setembro '
            break;
        case '10': outubro = 'active'
            mestitulo = 'Outubro '
            trintaeum = true
            break;
        case '11': novembro = 'active'
            mestitulo = 'Novembro '
            break;
        case '12': dezembro = 'active'
            mestitulo = 'Dezembro '
            trintaeum = true
            break;
    }
    var dataini = anotitulo + '-' + meshoje + '-' + '01'
    var datafim = anotitulo + '-' + meshoje + '-' + '31'

    //console.log('params[1]=>' + params[1])
    var sql = []
    if (params[1] == 'obra') {
        sql = { user: id, feito: true, prjfeito: false, obra: { $exists: true }, $and: [{ 'dtinicio': { $ne: '' } }, { 'dtinicio': { $ne: '0000-00-00' } }] }
    } else {
        sql = { user: id, feito: true, liberar: true, prjfeito: false, nome_projeto: { $exists: true }, $and: [{ 'dtinicio': { $ne: '' } }, { 'dtinicio': { $ne: '0000-00-00' } }] }
    }

    //console.log('sql=>' + JSON.stringify(sql))
    Cliente.find({ user: id }).lean().then((todos_clientes) => {
        // //console.log('todos_clientes=>' + todos_clientes)
        Pessoa.find({ user: id, funges: 'checked' }).lean().then((todos_responsaveis) => {
            // //console.log('todos_responsaveis=>' + todos_responsaveis)
            Empresa.find({ user: id }).lean().then((todas_empresas) => {
                // //console.log('todos_responsaveis=>' + todas_empresas)
                Equipe.find(sql).then((conta_equipe) => {
                    console.log('conta_equipe=>'+conta_equipe)
                    if (naoVazio(conta_equipe)) {
                        conta_equipe.forEach((e) => {
                            console.log('params[1]=>' + params[1])
                            if (params[1] == 'obra') {
                                var tecnico
                                var gestor
                                //console.log('entrou obra')
                                console.log('e.tarefa=>' + e.tarefa)
                                Tarefa.findOne({ user: id, _id: e.tarefa }).then((tarefa) => {
                                    
                                    Obra.findOne({ _id: e.obra, "tarefa._idtarefa": tarefa._id }).then((obra) => {
                                        //console.log('obra._id=>' + obra._id)
                                        Cliente.findOne({ _id: obra.cliente }).then((cliente) => {
                                            //console.log('tarefa.responsavel=>' + tarefa.responsavel)
                                            Pessoa.findOne({ _id: tarefa.responsavel }).then((pessoa_tecnico) => {
                                                //console.log('e._id=>' + e._id)
                                                //console.log('e.insres=>' + e.insres)
                                                Pessoa.findOne({ _id: obra.responsavel }).then((pessoa_gestor) => {
                                                    q++
                                                    //console.log('e._id=>' + e._id)
                                                    if (naoVazio(pessoa_tecnico)) {
                                                        tecnico = pessoa_tecnico.nome
                                                    } else {
                                                        tecnico = ''
                                                    }

                                                    if (naoVazio(pessoa_gestor)) {
                                                        gestor = pessoa_gestor.nome
                                                    } else {
                                                        gestor = ''
                                                    }

                                                    //console.log('e.dtinicio=>' + e.dtinicio)
                                                    //console.log('e.dtfim=>' + e.dtfim)
                                                    dtinicio = e.dtinicio
                                                    dtfim = e.dtfim
                                                    anoinicio = dtinicio.substring(0, 4)
                                                    anofim = dtfim.substring(0, 4)
                                                    mesinicio = dtinicio.substring(5, 7)
                                                    mesfim = dtfim.substring(5, 7)
                                                    diainicio = dtinicio.substring(8, 11)
                                                    diafim = dtfim.substring(8, 11)
                                                    //console.log('dif1=>' + dif1)

                                                    //console.log('meshoje=>' + meshoje)
                                                    //console.log('mesinicio=>' + mesinicio)
                                                    //console.log('anotitulo=>' + anotitulo)
                                                    //console.log('anoinicio=>' + anoinicio)
                                                    //console.log('compara')

                                                    if (meshoje == mesinicio) {
                                                        if (parseFloat(anotitulo) == parseFloat(anoinicio)) {
                                                            mes = meshoje
                                                            if (parseFloat(anofim) > parseFloat(anoinicio)) {
                                                                //console.log('projeto ultrapassa anos')
                                                                dia = diainicio
                                                                if (meshoje == 1 || meshoje == 3 || meshoje == 5 || meshoje == 7 || meshoje == 8 || meshoje == 10 || meshoje == 12) {
                                                                    dif = 31
                                                                } else {
                                                                    dif = 30
                                                                }
                                                            } else {
                                                                dia = diainicio
                                                                dif = parseFloat(diafim) - parseFloat(diainicio) + 1
                                                                //console.log('dia=>'+dia)
                                                                //console.log('dif=>'+dif)
                                                            }
                                                        } else {
                                                            //console.log('anos diferente')
                                                            dia = 0
                                                            dif = 0
                                                        }
                                                    } else {
                                                        //console.log('diferente')
                                                        difmes = parseFloat(mesfim) - parseFloat(mesinicio) + 1
                                                        //console.log('difmes=>' + difmes)
                                                        if (difmes != 0) {
                                                            //console.log('difmes=>' + difmes)
                                                            if (difmes < 0) {
                                                                difmes = difmes + 12
                                                            }
                                                            //console.log('mesinicio=>' + mesinicio)
                                                            for (i = 0; i < difmes; i++) {
                                                                mes = parseFloat(mesinicio) + i
                                                                if (mes > 12) {
                                                                    mes = mes - 12
                                                                }
                                                                //console.log('mes=>' + mes)
                                                                //console.log('meshoje=>' + meshoje)
                                                                if (mes == meshoje) {
                                                                    if (mes < 10) {
                                                                        mes = '0' + mes
                                                                        dia = '01'
                                                                    }
                                                                    break;
                                                                }
                                                            }
                                                            if (anotitulo == anofim) {
                                                                if (mes == mesfim) {
                                                                    dif = parseFloat(diafim)
                                                                } else {
                                                                    if (meshoje == 1 || meshoje == 3 || meshoje == 5 || meshoje == 7 || meshoje == 8 || meshoje == 10 || meshoje == 12) {
                                                                        dif = 31
                                                                    } else {
                                                                        dif = 30
                                                                    }
                                                                }
                                                            } else {
                                                                dia = 0
                                                                dif = 0
                                                            }
                                                        } else {
                                                            dif = 0
                                                            dia = 0
                                                        }
                                                    }

                                                    y = Math.floor(Math.random() * 17)
                                                    x = y
                                                    z = y
                                                    if (y == x) {
                                                        y = Math.floor(Math.random() * 17)
                                                        if (y == z) {
                                                            y = Math.floor(Math.random() * 17)
                                                        }
                                                    }
                                                    var color = cores[y]
                                                    //console.log('color=>' + color)
                                                    todasCores.push({ color })

                                                    //console.log('dif=>' + dif)

                                                    for (i = 0; i < dif; i++) {
                                                        //console.log('dia=>' + dia)
                                                        //console.log('entrou laço')
                                                        if (meshoje == mes) {
                                                            switch (String(dia)) {
                                                                case '01':
                                                                    dia01.push({ id: obra._id, cliente: cliente.nome, cor: color })
                                                                    break;
                                                                case '02':
                                                                    dia02.push({ id: obra._id, cliente: cliente.nome, cor: color })
                                                                    break;
                                                                case '03':
                                                                    dia03.push({ id: obra._id, cliente: cliente.nome, cor: color })
                                                                    break;
                                                                case '04':
                                                                    dia04.push({ id: obra._id, cliente: cliente.nome, cor: color })
                                                                    break;
                                                                case '05':
                                                                    dia05.push({ id: obra._id, cliente: cliente.nome, cor: color })
                                                                    break;
                                                                case '06':
                                                                    dia06.push({ id: obra._id, cliente: cliente.nome, cor: color })
                                                                    break;
                                                                case '07':
                                                                    dia07.push({ id: obra._id, cliente: cliente.nome, cor: color })
                                                                    break;
                                                                case '08':
                                                                    dia08.push({ id: obra._id, cliente: cliente.nome, cor: color })
                                                                    break;
                                                                case '09':
                                                                    dia09.push({ id: obra._id, cliente: cliente.nome, cor: color })
                                                                    break;
                                                                case '10':
                                                                    dia10.push({ id: obra._id, cliente: cliente.nome, cor: color })
                                                                    break;
                                                                case '11':
                                                                    dia11.push({ id: obra._id, cliente: cliente.nome, cor: color })
                                                                    break;
                                                                case '12':
                                                                    dia12.push({ id: obra._id, cliente: cliente.nome, cor: color })
                                                                    break;
                                                                case '13':
                                                                    dia13.push({ id: obra._id, cliente: cliente.nome, cor: color })
                                                                    break;
                                                                case '14':
                                                                    dia14.push({ id: obra._id, cliente: cliente.nome, cor: color })
                                                                    break;
                                                                case '15':
                                                                    dia15.push({ id: obra._id, cliente: cliente.nome, cor: color })
                                                                    break;
                                                                case '16':
                                                                    dia16.push({ id: obra._id, cliente: cliente.nome, cor: color })
                                                                    break;
                                                                case '17':
                                                                    dia17.push({ id: obra._id, cliente: cliente.nome, cor: color })
                                                                    break;
                                                                case '18':
                                                                    dia18.push({ id: obra._id, cliente: cliente.nome, cor: color })
                                                                    break;
                                                                case '19':
                                                                    dia19.push({ id: obra._id, cliente: cliente.nome, cor: color })
                                                                    break;
                                                                case '20':
                                                                    dia20.push({ id: obra._id, cliente: cliente.nome, cor: color })
                                                                    break;
                                                                case '21':
                                                                    dia21.push({ id: obra._id, cliente: cliente.nome, cor: color })
                                                                    break;
                                                                case '22':
                                                                    dia22.push({ id: obra._id, cliente: cliente.nome, cor: color })
                                                                    break;
                                                                case '23':
                                                                    dia23.push({ id: obra._id, cliente: cliente.nome, cor: color })
                                                                    break;
                                                                case '24':
                                                                    dia24.push({ id: obra._id, cliente: cliente.nome, cor: color })
                                                                    break;
                                                                case '25':
                                                                    dia25.push({ id: obra._id, cliente: cliente.nome, cor: color })
                                                                    break;
                                                                case '26':
                                                                    dia26.push({ id: obra._id, cliente: cliente.nome, cor: color })
                                                                    break;
                                                                case '27':
                                                                    dia27.push({ id: obra._id, cliente: cliente.nome, cor: color })
                                                                    break;
                                                                case '28':
                                                                    dia28.push({ id: obra._id, cliente: cliente.nome, cor: color })
                                                                    break;
                                                                case '29':
                                                                    dia29.push({ id: obra._id, cliente: cliente.nome, cor: color })
                                                                    break;
                                                                case '30':
                                                                    dia30.push({ id: obra._id, cliente: cliente.nome, cor: color })
                                                                    break;
                                                                case '31':
                                                                    dia31.push({ id: obra._id, cliente: cliente.nome, cor: color })
                                                                    break;
                                                            }
                                                            dia++
                                                            if (dia < 10) {
                                                                dia = '0' + dia
                                                            }
                                                            //console.log('dia=>' + dia)
                                                        }
                                                    }

                                                    //console.log('tecnico=>' + tecnico)
                                                    //console.log('gestor=>' + gestor)
                                                    listaAndamento.push({ id: tarefa._id, seq: obra.seq, cliente: cliente.nome, tecnico, gestor, cadastro: dataMsgNum(obra.data), dtinicio: dataMensagem(dtinicio), deadline: dataMensagem(dtfim) })

                                                    //console.log('q=>' + q)
                                                    //console.log('conta_equipe.length=>' + conta_equipe.length)
                                                    if (q == conta_equipe.length) {
                                                        if (params[0] == 'lista') {
                                                            caminho = 'principal/emandamento'
                                                        } else {
                                                            caminho = 'principal/vermais'
                                                        }

                                                        //console.log('caminho=>' + caminho)

                                                        res.render(caminho, {
                                                            dia01, dia02, dia03, dia04, dia05, dia06, dia07, dia08, dia09, dia10,
                                                            dia11, dia12, dia13, dia14, dia15, dia16, dia17, dia18, dia19, dia20,
                                                            dia21, dia22, dia23, dia24, dia25, dia26, dia27, dia28, dia29, dia30, dia31,
                                                            mestitulo, anotitulo, trintaeum, bisexto, todasCores, listaAndamento, obra: true,
                                                            janeiro, fevereiro, marco, abril, maio, junho, julho, agosto, setembro, outubro, novembro, dezembro,
                                                            todos_responsaveis, todos_clientes, todas_empresas, anotitulo, dataini, datafim
                                                        })

                                                    }
                                                }).catch((err) => {
                                                    req.flash('error_msg', 'Falha ao encontrar o técnico responsável.')
                                                    res.redirect('/dashboard')
                                                })
                                            }).catch((err) => {
                                                req.flash('error_msg', 'Falha ao encontrar o gestor responsável.')
                                                res.redirect('/dashboard')
                                            })
                                        }).catch((err) => {
                                            req.flash('error_msg', 'Falha ao encontrar o cliente.')
                                            res.redirect('/dashboard')
                                        })
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Falha ao encontrar a tarefa<gea>.')
                                    res.redirect('/dashboard')
                                })
                            }
                        })
                    } else {
                        req.flash('error_msg', 'Não existem obras em andamento.')
                        res.redirect('/dashboard')
                    }
                }).catch((err) => {
                    req.flash('error_msg', 'Falha ao encontrar a equipe.')
                    res.redirect('/dashboard')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Nenhuma empresa encontrada.')
                res.redirect('/gerenciamento/consulta')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Nenhum responsável encontrado.')
            res.redirect('/gerenciamento/consulta')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Nenhum cliente encontrado.')
        res.redirect('/gerenciamento/consulta')
    })
})

router.get('/mostraEquipe/:id', ehAdmin, (req, res) => {
    var idobra
    
            console.log('mostrar tarefa')
            Tarefa.findOne({ _id: req.params.id }).lean().then((tarefa) => {
                if (naoVazio(tarefa)) {
                    Cliente.findOne({ _id: tarefa.cliente }).lean().then((cliente) => {
                        Equipe.findOne({ _id: tarefa.equipe }).lean().then((equipe) => {
                            Pessoa.findOne({ _id: tarefa.responsavel }).lean().then((tecnico) => {
                                console.log("req.params.id=>"+req.params.id)
                                Obra.findOne({ 'tarefa.idtarefa': req.params.id }).then((obra) => {
                                    console.log('obra.responsavel=>'+obra.responsavel)
                                    Pessoa.findOne({ _id: obra.responsavel }).lean().then((gestor) => {
                                        console.log(obra)
                                        if (naoVazio(obra)) {
                                            idobra = obra._id
                                        } else {
                                            idobra = false
                                        }
                                        res.render('principal/mostraEquipe', { tarefa, equipe, cliente, tecnico, gestor, idobra, realizada: tarefa.concluido })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Falha ao encontrar o responsável da obra.')
                                        res.redirect('/dashboard')
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Falha ao encontrar a obra<mostra_equipe.')
                                    res.redirect('/dashboard')
                                })

                            }).catch((err) => {
                                req.flash('error_msg', 'Falha ao encontrar o tecnico responsável.')
                                res.redirect('/dashboard')
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Falha ao encontrar a equipe.')
                            res.redirect('/dashboard')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Falha ao encontrar o cliente.')
                        res.redirect('/dashboard')
                    })
                } else {
                    req.flash('error_msg', 'Equipe não formada.')
                    res.redirect('/dashboard')
                }
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao encontrar a tarefa<mostrar equipe>.')
                res.redirect('/dashboard')
            })
        

})

router.get('/realizar/:id', ehAdmin, (req, res) => {
    Obra.findOne({ 'tarefa.idtarefa': req.params.id }).then((obra) => {
        Tarefa.findOne({ _id: req.params.id }).then((tarefa) => {
            Equipe.findOne({ _id: tarefa.equipe }).then((equipe) => {
                equipe.prjfeito = true
                equipe.save().then(() => {
                    tarefa.concluido = true
                    tarefa.dataentrega = dataBusca(dataHoje())
                    tarefa.save().then(() => {
                        res.redirect('/gerenciamento/mostraEquipe/' + tarefa._id)
                    }).catch((err) => {
                        req.flash('error_msg', 'Falha ao salvar a tarefa.')
                        res.redirect('/dashboard')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Falha ao salvar a equipe.')
                    res.redirect('/dashboard')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao encontrar a equipe.')
                res.redirect('/dashboard')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao encontrar a tarefa<realizar.')
            res.redirect('/dashboard')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar a obra<realizar.')
        res.redirect('/dashboard')
    })
})

router.get('/imgTarefa/:id', ehAdmin, (req, res) => {
    var check
    var img = []
    var lista_imagens = []

    //console.log('req.params.id=>' + req.params.id)

})

router.get('/proposta/selecao/:tipo', ehAdmin, (req, res) => {
    const { pessoa } = req.user
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }

    var sql = []
    if (naoVazio(pessoa)) {
        sql = { _id: pessoa }
    } else {
        sql = { user: id, funges: 'checked' }
    }
    //console.log(_id)
    if (req.params.tipo == 'com') {
        Cliente.find({ user: id }).lean().then((todos_clientes) => {
            //console.log(todos_clientes)
            Pessoa.find(sql).lean().then((todos_responsaveis) => {
                Empresa.find({ user: id }).lean().then((todas_empresas) => {
                    res.render('principal/proposta', { todos_clientes, todos_responsaveis, todas_empresas, mostraSelect: 'none', tipo: false })
                }).catch((err) => {
                    req.flash('error_msg', 'Não foi possível encontrar a empresa.')
                    res.redirect('/dashboard')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Não foi possível encontrar o responsável.')
                res.redirect('/dashboard')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível encontrar clientes cadastrados.')
            res.redirect('/dashboard')
        })
    } else {
        res.render('principal/proposta', { tipo: true })
    }
})

router.get('/obra', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }
    Cliente.find({ user: id }).lean().then((todos_clientes) => {
        Pessoa.find({ user: id, funges: 'checked' }).lean().then((todos_responsaveis) => {
            Empresa.find({ user: id }).lean().then((todas_empresas) => {
                res.render('principal/obra', { todos_clientes, todos_responsaveis, todas_empresas, mostraSelect: 'none', tipo: false })
            }).catch((err) => {
                req.flash('error_msg', 'Não foi possível encontrar a empresa.')
                res.redirect('/dashboard')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível encontrar o responsável.')
            res.redirect('/dashboard')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar clientes cadastrados.')
        res.redirect('/dashboard')
    })
})

router.get('/obra/:id', ehAdmin, (req, res) => {
    var params = req.params.id
    params = params.split('aba')
    const { _id } = req.user
    const { user } = req.user
    var id
    var mostraLabel = ''
    var mostraSelect = 'none'
    var q = 0
    var nome
    var ins_fora = []
    var lista_tarefas = []

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }
    //console.log('params[0]=>'+params[0])
    Obra.findOne({ _id: params[0] }).lean().then((obra) => {
        Cliente.find({ user: id }).lean().then((todos_clientes) => {
            Empresa.find({ user: id }).lean().then((todas_empresas) => {
                Servico.find({ user: id }).lean().then((servicos) => {
                    Cliente.findOne({ _id: obra.cliente }).lean().then((cliente) => {
                        Pessoa.findOne({ _id: obra.responsavel }).lean().then((responsavel) => {
                            Empresa.findOne({ _id: obra.empresa }).lean().then((empresa) => {
                                Pessoa.find({ user: id, funins: 'checked' }).sort({ 'nome': 'asc' }).lean().then((instalacao) => {
                                    if (naoVazio(instalacao)) {
                                        instalacao.forEach((pesins) => {
                                            q++
                                            nome = pesins.nome
                                            ins_fora.push({ id: pesins._id, nome })
                                            if (q == instalacao.length) {
                                                q = 0
                                                var custo_total = 0
                                                Pessoa.find({ user: id, funges: 'checked' }).sort({ 'nome': 'asc' }).lean().then((todos_responsaveis) => {
                                                    Equipe.find({ obra: params[0] }).lean().then((equipe) => {
                                                        //console.log('equipe=>' + equipe)
                                                        if (naoVazio(equipe)) {
                                                            equipe.forEach((e) => {
                                                                //console.log('e.tarefa=>' + e.tarefa)
                                                                Tarefa.findOne({ _id: e.tarefa }).then((tarefa) => {
                                                                    //console.log('tarefa._id=>' + tarefa._id)
                                                                    //console.log('tarefa.responsavel=>' + tarefa.responsavel)
                                                                    Pessoa.findOne({ _id: tarefa.responsavel }).then((tecnico) => {
                                                                        Servico.findOne({ _id: tarefa.servico }).then((trf_servico) => {
                                                                            //console.log('trf_servico.descricao=>' + trf_servico.descricao)
                                                                            q++
                                                                            if (naoVazio(tarefa.preco)) {
                                                                                custo_total = custo_total + tarefa.preco
                                                                            } else {
                                                                                custo_total = custo_total + 0
                                                                            }
                                                                            lista_tarefas.push({ liberado: e.liberar, feito: tarefa.concluido, idoferta: e.oferta, idtarefa: tarefa._id, desc: trf_servico.descricao, nome_tec: tecnico.nome, custo: tarefa.preco, dtini: dataMensagem(tarefa.dataini), dtfim: dataMensagem(tarefa.datafim) })
                                                                            //console.log('lista_tarefas=>' + lista_tarefas)
                                                                            if (q == equipe.length) {
                                                                                //console.log('ins_fora=>' + ins_fora)
                                                                                if (params[1] == 'adicionar') {
                                                                                    res.render('principal/obra', { lista_tarefas, ins_fora, custo_total, servicos, todos_clientes, todos_responsaveis, todas_empresas, instalacao, obra, cliente, responsavel, empresa, tipo: false, mostraLabel, mostraSelect })
                                                                                } else {
                                                                                    res.render('principal/obraTarefa', { lista_tarefas, ins_fora, custo_total, servicos, todos_clientes, todos_responsaveis, todas_empresas, instalacao, obra, cliente, responsavel, empresa, tipo: false, mostraLabel, mostraSelect })
                                                                                }
                                                                            }
                                                                        })
                                                                    })
                                                                })
                                                            })
                                                        } else {
                                                            if (params[1] == 'adicionar') {
                                                                res.render('principal/obra', { lista_tarefas, ins_fora, servicos, todos_clientes, todos_responsaveis, todas_empresas, instalacao, obra, cliente, responsavel, empresa, tipo: false, mostraLabel, mostraSelect })
                                                            } else {
                                                                res.render('principal/obraTarefa', { lista_tarefas, ins_fora, servicos, todos_clientes, todos_responsaveis, todas_empresas, instalacao, obra, cliente, responsavel, empresa, tipo: false, mostraLabel, mostraSelect })
                                                            }
                                                        }
                                                    })
                                                    //console.log('gestor=>' + gestor)                                                
                                                }).catch((err) => {
                                                    req.flash('error_msg', 'Falha ao encontrar os gestores.')
                                                    res.redirect('/dashboard')
                                                })
                                            }
                                        })
                                    } else {
                                        req.flash('error_msg', 'Não existem técnicos cadastrados.')
                                        res.redirect('/dashboard')
                                    }
                                }).catch((err) => {
                                    req.flash('error_msg', 'Falha ao encontrar os técnicos.')
                                    res.redirect('/dashboard')
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Não foi possível encontrar a empresa da obra.')
                                res.redirect('/dashboard')
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Não foi possível encontrar o responsável da obra.')
                            res.redirect('/dashboard')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Não foi possível encontrar os serviços.')
                        res.redirect('/dashboard')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Não foi possível encontrar o cliene da obra.')
                    res.redirect('/dashboard')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Não foi possível encontrar a empresa.')
                res.redirect('/dashboard')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível encontrar clientes cadastrados.')
            res.redirect('/dashboard')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar a obra cadastrada.')
        res.redirect('/dashboard')
    })
})

router.get('/cenarios/', ehAdmin, (req, res) => {
    res.render('projeto/gerenciamento/cenarios')
})

router.get('/agenda/', ehAdmin, (req, res) => {

    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }

    var trintaeum = false
    var bisexto = false
    var dia
    var hoje = dataHoje()
    var ano = hoje.substring(0, 4)
    var meshoje = hoje.substring(5, 7)

    if (meshoje < 10) {
        mes = '0' + meshoje
    }

    var mes
    var dif
    var difmes
    var dtinicio
    var dtfim
    var anoinicio
    var anofim
    var mesinicio
    var mesfim
    var diainicio
    var diafim

    var dataini = String(ano) + String(meshoje) + '01'
    var datafim = String(ano) + String(meshoje) + '31'

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

    var janeiro = ''
    var fevereiro = ' '
    var marco = ''
    var abril = ''
    var maio = ''
    var junho = ''
    var julho = ''
    var agosto = ''
    var setembro = ''
    var outubro = ''
    var novembro = ''
    var dezembro = ''
    var mestitulo = ''

    var q = 0

    //console.log('meshoje=>' + meshoje)

    switch (String(meshoje)) {
        case '01': janeiro = 'active'
            mestitulo = 'Janeiro'
            trintaeum = true
            break;
        case '02': fevereiro = 'active';
            mestitulo = 'Fevereiro'
            fevereiro = true
            break;
        case '03': marco = 'active';
            mestitulo = 'Março'
            trintaeum = true
            break;
        case '04': abril = 'active';
            mestitulo = 'Abril'
            break;
        case '05': maio = 'active';
            mestitulo = 'Maio'
            trintaeum = true
            break;
        case '06': junho = 'active';
            mestitulo = 'Junho'
            break;
        case '07': julho = 'active';
            mestitulo = 'Julho'
            trintaeum = true
            break;
        case '08': agosto = 'active';
            mestitulo = 'Agosto'
            trintaeum = true
            break;
        case '09': setembro = 'active';
            mestitulo = 'Setembro'
            break;
        case '10': outubro = 'active';
            mestitulo = 'Outubro'
            trintaeum = true
            break;
        case '11': novembro = 'active';
            mestitulo = 'Novembro'
            break;
        case '12': dezembro = 'active';
            mestitulo = 'Dezembro'
            trintaeum = true
            break;
    }

    //console.log('mestitulo=>' + mestitulo)
    // var nova_dataini = dataini
    Cliente.find({ user: id }).lean().then((todos_clientes) => {
        //console.log("dataini=>" + dataini)
        //console.log("datafim=>" + datafim)
        Tarefas.find({ user: id, 'buscadataini': { $lte: parseFloat(datafim), $gte: parseFloat(dataini) } }).then((lista_tarefas) => {
            //console.log('lista_tarefas=>' + lista_tarefas)
            if (naoVazio(lista_tarefas)) {
                lista_tarefas.forEach((e) => {
                    //console.log('e._id=>' + e._id)
                    //console.log('e.cliente=>'+e.cliente)
                    Cliente.findOne({ _id: e.cliente }).then((cliente) => {
                        //console.log('cliente=>' + cliente)
                        Servico.findOne({ _id: e.servico }).then((ser) => {
                            var dias = []
                            var feito = false
                            dias = e.dias
                            q++
                            dtinicio = e.dataini
                            dtfim = e.datafim
                            anoinicio = dtinicio.substring(0, 4)
                            anofim = dtfim.substring(0, 4)
                            mesinicio = dtinicio.substring(5, 7)
                            mesfim = dtfim.substring(5, 7)
                            diainicio = dtinicio.substring(8, 11)
                            diafim = dtfim.substring(8, 11)
                            //console.log("meshoje=>" + meshoje)
                            //console.log("mesinicio=>" + mesinicio)
                            if (naoVazio(e.programacao)) {
                                mes = mesinicio
                                dia = diainicio
                                dif = 1
                            } else {
                                if (meshoje == mesinicio) {
                                    mes = mesinicio
                                    if (anofim == anoinicio) {
                                        dia = diainicio
                                        dif = parseFloat(diafim) - parseFloat(diainicio) + 1
                                    } else {
                                        if (meshoje == 1 || meshoje == 3 || meshoje == 5 || meshoje == 7 || meshoje == 8 || meshoje == 10 || meshoje == 12) {
                                            dif = 31 - parseFloat(diainicio) + 1
                                        } else {
                                            dif = 30 - parseFloat(diainicio) + 1
                                        }
                                        if (diainicio < 10) {
                                            dia = '0' + parseFloat(diainicio)
                                        } else {
                                            dia = parseFloat(diainicio)
                                        }
                                    }
                                } else {
                                    //console.log('diferente')
                                    difmes = parseFloat(mesfim) - parseFloat(mesinicio)
                                    if (difmes != 0) {
                                        //console.log('difmes=>' + difmes)
                                        if (difmes < 0) {
                                            difmes = difmes + 12
                                        }
                                        //console.log('mesinicio=>' + mesinicio)
                                        for (i = 0; i < difmes; i++) {
                                            mes = parseFloat(mesinicio) + i
                                            if (mes > 12) {
                                                mes = mes - 12
                                            }
                                            //console.log('mes=>' + mes)
                                            //console.log('meshoje=>' + meshoje)
                                            if (mes == meshoje) {
                                                break;
                                            }
                                        }

                                        if (parseFloat(anofim) > parseFloat(anoinicio)) {
                                            dia = '01'
                                            if (meshoje == 1 || meshoje == 3 || meshoje == 5 || meshoje == 7 || meshoje == 8 || meshoje == 10 || meshoje == 12) {
                                                dif = 31
                                            } else {
                                                dif = 30
                                            }
                                        } else {
                                            dia = diainicio
                                            dif = parseFloat(diafim) - parseFloat(diainicio) + 1
                                        }
                                    }
                                }
                            }
                            const { dataini } = e
                            //console.log('dataini=>' + dataini)
                            //console.log('mes_busca=>' + mes_busca)
                            tarefa = ser.descricao
                            for (i = 0; i < dif; i++) {
                                //console.log('dia=>' + dia)
                                //console.log('entrou laço')
                                //console.log("meshoje=>" + meshoje)
                                //console.log("mes=>" + mes)
                                if (meshoje == mes) {
                                    //console.log("dias=>" + dias)
                                    if (naoVazio(dias)) {
                                        //console.log('d=>' + d)
                                        feito = dias[i].feito
                                        //console.log('feito=>' + feito)
                                    }

                                    if (dia == '01') {
                                        tarefas01.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                    }
                                    if (dia == '02') {
                                        tarefas02.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                    }
                                    if (dia == '03') {
                                        tarefas03.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                    }
                                    if (dia == '04') {
                                        tarefas04.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                    }
                                    if (dia == '05') {
                                        tarefas05.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                    }
                                    if (dia == '06') {
                                        tarefas06.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                    }
                                    if (dia == '07') {
                                        tarefas07.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                    }
                                    if (dia == '08') {
                                        tarefas08.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                    }
                                    if (dia == '09') {
                                        tarefas09.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                    }
                                    if (dia == '10') {
                                        tarefas10.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                    }
                                    if (dia == '11') {
                                        tarefas11.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                    }
                                    if (dia == '12') {
                                        tarefas12.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                    }
                                    if (dia == '13') {
                                        tarefas13.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                    }
                                    if (dia == '14') {
                                        tarefas14.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                    }
                                    if (dia == '15') {
                                        tarefas15.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                    }
                                    if (dia == '16') {
                                        tarefas16.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                    }
                                    if (dia == '17') {
                                        tarefas17.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                    }
                                    if (dia == '18') {
                                        tarefas18.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                    }
                                    if (dia == '19') {
                                        tarefas19.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                    }
                                    if (dia == '20') {
                                        tarefas20.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                    }
                                    if (dia == '21') {
                                        tarefas21.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                    }
                                    if (dia == '22') {
                                        tarefas22.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                    }
                                    if (dia == '23') {
                                        tarefas23.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                    }
                                    if (dia == '24') {
                                        tarefas24.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                    }
                                    if (dia == '25') {
                                        tarefas25.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                    }
                                    if (dia == '26') {
                                        tarefas26.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                    }
                                    if (dia == '27') {
                                        tarefas27.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                    }
                                    if (dia == '28') {
                                        tarefas28.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                    }
                                    if (dia == '29') {
                                        tarefas29.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                    }
                                    if (dia == '30') {
                                        tarefas30.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                    }
                                    if (dia == '31') {
                                        tarefas31.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                    }
                                }
                                dia++
                            }
                            //console.log('q=>' + q)
                            //console.log('lista_tarefas.length=>' + lista_tarefas.length)
                            if (q == lista_tarefas.length) {
                                res.render('projeto/gerenciamento/agenda', {
                                    tarefas01, tarefas02, tarefas03, tarefas04, tarefas05, tarefas06, tarefas07,
                                    tarefas08, tarefas09, tarefas10, tarefas11, tarefas12, tarefas13, tarefas14,
                                    tarefas15, tarefas16, tarefas17, tarefas18, tarefas19, tarefas20, tarefas21,
                                    tarefas22, tarefas23, tarefas24, tarefas25, tarefas26, tarefas27, tarefas28,
                                    tarefas29, tarefas30, tarefas31, checkTesk: 'checked', checkInst: 'unchecked',
                                    mes, ano, todos_clientes, mestitulo, janeiro, fevereiro, marco, abril, maio, junho,
                                    julho, agosto, setembro, outubro, novembro, dezembro, ehManutencao: true, trintaeum, fevereiro, toda_agenda: true
                                })
                            }
                        })
                    })
                })
            } else {
                //console.log("q=>" + q)
                //console.log("lista_tarefas.length=>" + lista_tarefas.length)
                if (q == lista_tarefas.length) {
                    res.render('projeto/gerenciamento/agenda', {
                        tarefas01, tarefas02, tarefas03, tarefas04, tarefas05, tarefas06, tarefas07,
                        tarefas08, tarefas09, tarefas10, tarefas11, tarefas12, tarefas13, tarefas14,
                        tarefas15, tarefas16, tarefas17, tarefas18, tarefas19, tarefas20, tarefas21,
                        tarefas22, tarefas23, tarefas24, tarefas25, tarefas26, tarefas27, tarefas28,
                        tarefas29, tarefas30, tarefas31, checkTesk: 'checked', checkInst: 'unchecked',
                        mes, ano, todos_clientes, mestitulo, janeiro, fevereiro, marco, abril, maio, junho,
                        julho, agosto, setembro, outubro, novembro, dezembro, ehManutencao: true, trintaeum, bisexto, toda_agenda: true
                    })
                }
            }
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível encontrar o cliente.')
            res.redirect('/gerenciamento/agenda/')
        })
    })
})

router.get('/servicos/', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }
    Servico.find({ user: id }).lean().then((servicos) => {
        res.render('projeto/gerenciamento/servicos', { servicos })
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar os serviços.')
        res.redirect('/dashboard')
    })
})

router.get('/vermaistarefas/:id', ehAdmin, (req, res) => {

    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }

    var trintaeum = false
    var bisexto = false
    var dia
    var hoje = dataHoje()
    var ano = hoje.substring(0, 4)
    var meshoje = hoje.substring(5, 7)

    if (meshoje < 10) {
        mes = '0' + meshoje
    }

    var mes
    var dif
    var difmes
    var dtinicio
    var dtfim
    var anoinicio
    var anofim
    var mesinicio
    var mesfim
    var diainicio
    var diafim

    var dataini = String(ano) + String(meshoje) + '01'
    var datafim = String(ano) + String(meshoje) + '31'

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

    var janeiro = ''
    var fevereiro = ' '
    var marco = ''
    var abril = ''
    var maio = ''
    var junho = ''
    var julho = ''
    var agosto = ''
    var setembro = ''
    var outubro = ''
    var novembro = ''
    var dezembro = ''
    var mestitulo = ''

    switch (String(meshoje)) {
        case '01':
            janeiro = 'active'
            mestitulo = 'Janeiro '
            messel = '01'
            trintaeum = true
            break;
        case '02':
            fevereiro = 'active'
            mestitulo = 'Fevereiro '
            messel = '02'
            bisexto = true
            break;
        case '03':
            marco = 'active'
            mestitulo = 'Março '
            messel = '03'
            trintaeum = true
            break;
        case '04':
            abril = 'active'
            mestitulo = 'Abril '
            messel = '04'
            break;
        case '05':
            maio = 'active'
            mestitulo = 'Maio '
            messel = '05'
            trintaeum = true
            break;
        case '06':
            junho = 'active'
            mestitulo = 'Junho '
            messel = '06'
            break;
        case '07':
            julho = 'active'
            mestitulo = 'Julho '
            messel = '07'
            trintaeum = true
            break;
        case '08':
            agosto = 'active'
            mestitulo = 'Agosto '
            messel = '08'
            trintaeum = true
            break;
        case '09':
            setembro = 'active'
            mestitulo = 'Setembro '
            messel = '09'
            break;
        case '10':
            outubro = 'active'
            mestitulo = 'Outubro '
            messel = '10'
            trintaeum = true
            break;
        case '11':
            novembro = 'active'
            mestitulo = 'Novembro '
            messel = '11'
            break;
        case '12':
            dezembro = 'active'
            mestitulo = 'Dezembro '
            messel = '12'
            trintaeum = true
            break;
    }

    var q = 0

    //console.log('req.parms.id=>' + req.params.id)
    Pessoa.findOne({ user: id, _id: req.params.id }).lean().then((pessoa) => {
        //console.log('pessoa=>' + pessoa)
        Tarefas.find({ user: id, equipe: { $exists: true }, 'buscadataini': { $lte: parseFloat(datafim), $gte: parseFloat(dataini) } }).then((tarefas) => {
            //console.log('tarefas=>' + tarefas)
            if (tarefas != '') {
                tarefas.forEach((e) => {
                    //console.log('e._id=>' + e._id)
                    Equipe.findOne({ user: id, id: e.equipe, ins0: { $exists: true }, dtinicio: { $ne: '00/00/0000' }, $or: [{ ins0: pessoa.nome }, { ins1: pessoa.nome }, { ins2: pessoa.nome }, { ins3: pessoa.nome }, { ins4: pessoa.nome }, { ins5: pessoa.nome }] }).then((equipe) => {
                        //console.log('e.usina=>' + e.usina)
                        //console.log('usi.cliente=>'+usi.cliente)
                        Cliente.findOne({ _id: e.cliente }).then((cliente) => {
                            //console.log('cli.nome=>'+cli.nome)
                            //console.log('e.servico=>'+e.servico)
                            Servico.findOne({ _id: e.servico }).then((ser) => {
                                //console.log('ser.descricao=>'+ser.descricao)
                                var dias = []
                                var feito = false
                                dias = e.dias
                                q++
                                dtinicio = e.dataini
                                dtfim = e.datafim
                                anoinicio = dtinicio.substring(0, 4)
                                anofim = dtfim.substring(0, 4)
                                mesinicio = dtinicio.substring(5, 7)
                                mesfim = dtfim.substring(5, 7)
                                diainicio = dtinicio.substring(8, 11)
                                diafim = dtfim.substring(8, 11)
                                //console.log("messel=>" + messel)
                                //console.log("mesinicio=>" + mesinicio)

                                if (meshoje == mesinicio) {
                                    mes = mesinicio
                                    if (parseFloat(anofim) == parseFloat(anoinicio)) {
                                        dia = diainicio
                                        if (parseFloat(anofim) > parseFloat(anoinicio)) {
                                            //console.log('projeto ultrapassa anos')
                                            if (meshoje == 1 || meshoje == 3 || meshoje == 5 || meshoje == 7 || meshoje == 8 || meshoje == 10 || meshoje == 12) {
                                                dif = 31
                                            } else {
                                                dif = 30
                                            }
                                        } else {
                                            if (naoVazio(e.programacao)) {
                                                dif = 1
                                            } else {
                                                dif = parseFloat(diafim) - parseFloat(diainicio) + 1
                                            }
                                        }
                                    } else {
                                        //console.log('mesmo mes outro ano')
                                        //console.log('diainicio=>' + diainicio)
                                        if (naoVazio(e.programacao)) {
                                            dia = diainicio
                                            dif = 1
                                        } else {
                                            dif =
                                                dia = 0
                                        }
                                    }
                                } else {
                                    //console.log('diferente')
                                    if (naoVazio(e.programacao)) {
                                        dia = diainicio
                                        dif = 1
                                    } else {
                                        difmes = parseFloat(mesfim) - parseFloat(mesinicio)
                                        if (difmes != 0) {
                                            //console.log('difmes=>' + difmes)
                                            if (difmes < 0) {
                                                difmes = difmes + 12
                                            }
                                            //console.log('mesinicio=>' + mesinicio)
                                            for (i = 0; i < difmes; i++) {
                                                mes = parseFloat(mesinicio) + i
                                                if (mes > 12) {
                                                    mes = mes - 12
                                                }
                                                //console.log('mes=>' + mes)
                                                //console.log('meshoje=>' + meshoje)
                                                if (mes == meshoje) {
                                                    break;
                                                }
                                            }
                                            if (parseFloat(anofim) > parseFloat(anoinicio)) {
                                                dia = '01'
                                                if (meshoje == 1 || meshoje == 3 || meshoje == 5 || meshoje == 7 || meshoje == 8 || meshoje == 10 || meshoje == 12) {
                                                    dif = 31
                                                } else {
                                                    dif = 30
                                                }

                                            } else {
                                                dia = diainicio
                                                if (naoVazio(e.programacao)) {
                                                    dif = 1
                                                } else {
                                                    dif = parseFloat(diafim) - parseFloat(diainicio) + 1
                                                }
                                            }
                                        }
                                    }
                                }

                                // const { dataini } = e
                                //console.log('dataini=>' + dataini)
                                //console.log('mes_busca=>' + mes_busca)
                                //console.log('mes=>' + mes)
                                tarefa = ser.descricao
                                for (i = 0; i < dif; i++) {
                                    //console.log('dia=>' + dia)
                                    //console.log('entrou laço')
                                    if (meshoje == mes) {
                                        if (naoVazio(dias)) {
                                            //console.log('d=>' + d)
                                            feito = dias[i].feito
                                            //console.log('feito=>' + feito)
                                        }
                                        if (dia == '01') {
                                            tarefas01.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '02') {
                                            tarefas02.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '03') {
                                            tarefas03.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '04') {
                                            tarefas04.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '05') {
                                            tarefas05.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '06') {
                                            tarefas06.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '07') {
                                            tarefas07.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '08') {
                                            tarefas08.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '09') {
                                            tarefas09.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '10') {
                                            tarefas10.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '11') {
                                            tarefas11.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '12') {
                                            tarefas12.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '13') {
                                            tarefas13.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '14') {
                                            tarefas14.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '15') {
                                            tarefas15.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '16') {
                                            tarefas16.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '17') {
                                            tarefas17.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '18') {
                                            tarefas18.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '19') {
                                            tarefas19.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '20') {
                                            tarefas20.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '21') {
                                            tarefas21.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '22') {
                                            tarefas22.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '23') {
                                            tarefas23.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '24') {
                                            tarefas24.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '25') {
                                            tarefas25.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '26') {
                                            tarefas26.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '27') {
                                            tarefas27.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '28') {
                                            tarefas28.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '29') {
                                            tarefas29.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '30') {
                                            tarefas30.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '31') {
                                            tarefas31.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                    }
                                    dia++
                                }
                                //console.log('q=>' + q)
                                //console.log('tarefas.length=>' + tarefas.length)
                                if (q == tarefas.length) {
                                    res.render('projeto/gerenciamento/agenda', {
                                        tarefas01, tarefas02, tarefas03, tarefas04, tarefas05, tarefas06, tarefas07,
                                        tarefas08, tarefas09, tarefas10, tarefas11, tarefas12, tarefas13, tarefas14,
                                        tarefas15, tarefas16, tarefas17, tarefas18, tarefas19, tarefas20, tarefas21,
                                        tarefas22, tarefas23, tarefas24, tarefas25, tarefas26, tarefas27, tarefas28,
                                        tarefas29, tarefas30, tarefas31, checkTesk: 'checked', checkInst: 'unchecked',
                                        mes, ano, todos_clientes, mestitulo, messel, janeiro, fevereiro, marco, abril, maio, junho, julho, agosto, setembro,
                                        outubro, novembro, dezembro, ehManutencao: true, trintaeum, bisexto, toda_agenda: false, pessoa
                                    })
                                }
                            }).catch((err) => {
                                req.flash('error_msg', 'Falha ao encontrar o tipos de serviço.')
                                res.redirect('/gerenciamento/agenda')
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Falha ao encontrar o cliente.')
                            res.redirect('/gerenciamento/agenda')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Falha ao encontrar a todas tarefas.')
                        res.redirect('/gerenciamento/agenda')
                    })
                })
            } else {
                var erro = []
                erro.push({ texto: 'Pessoa sem tarefas para este período.' })
                res.render('projeto/gerenciamento/agenda', {
                    mes, ano, mestitulo, messel, janeiro, fevereiro, marco, abril, maio, junho, julho, agosto, setembro, outubro,
                    novembro, dezembro, pessoa, trintaeum, bisexto, ehManutencao: true, toda_agenda: false, erro
                })
            }
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao encontrar a todas tarefas.')
            res.redirect('/gerenciamento/agenda')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar a pessoa.')
        res.redirect('/gerenciamento/agenda')
    })
})

router.get('/tarefas/:id', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }

    var dia
    var parametro = req.params.id
    var parametro = parametro.split('-')
    var tarefa = parametro[0]
    dia = parametro[1]

    //console.log('tarefa=>' + tarefa)
    //console.log('dia=>' + dia)

    var lista_tarefa = []
    var tarefa_concluida = []
    var tarefa_naoconcluida = []
    var q = 0

    var concluido

    Tarefas.find({ user: id }).sort({ 'concluido': 'asc' }).then((tarefas) => {
        tarefas.forEach((e) => {
            //console.log('e.usina=>' + e.usina)
            //console.log('usi.cliente=>'+usi.cliente)
            Cliente.findOne({ _id: e.cliente }).then((cli) => {
                //console.log('cli.nome=>'+cli.nome)
                //console.log('e.servico=>'+e.servico)
                Servico.findOne({ _id: e.servico }).then((ser) => {
                    //console.log('ser.descricao=>'+ser.descricao)
                    q++

                    //console.log('e.concluido=>' + e.concluido)
                    if (e.concluido == true) {
                        tarefa_concluida.push({ id: e._id, nome: cli.nome, servico: ser.descricao, dataini: dataMensagem(e.dataini), datafim: dataMensagem(e.datafim) })
                    } else {
                        tarefa_naoconcluida.push({ id: e._id, nome: cli.nome, servico: ser.descricao, dataini: dataMensagem(e.dataini), datafim: dataMensagem(e.datafim) })
                    }

                    //console.log("q=>" + q)
                    //console.log("tarefas.length=>"+tarefas.length)
                    if (q == tarefas.length) {
                        //console.log('req.params.id=>' + req.params.id)
                        Tarefas.findOne({ _id: tarefa }).sort({ 'concluido': 'asc' }).lean().then((tarefa) => {
                            Cliente.findOne({ _id: tarefa.cliente }).then((cliente) => {
                                Servico.findOne({ _id: tarefa.servico }).then((ser) => {
                                    Equipe.findOne({ _id: tarefa.equipe }).lean().then((equipe) => {
                                        var dataini = dataMensagem(tarefa.dataini)
                                        var datafim = dataMensagem(tarefa.datafim)

                                        if (tarefa.concluido == true) {
                                            concluido = 'Sim'
                                        } else {
                                            concluido = 'Não'
                                        }

                                        if (naoVazio(dia) == false) {
                                            dia = tarefa.dataini
                                            dia = dia.substring(8, 11)
                                        }

                                        if (naoVazio(equipe)) {
                                            lista_tarefa = { concluido, id: tarefa._id, nome: cliente.nome, servico: ser.descricao, dataini, datafim, ins0: equipe.ins0, ins1: equipe.ins1, ins2: equipe.ins2, ins3: equipe.ins3, ins4: equipe.ins4, ins5: equipe.ins5 }
                                        } else {
                                            lista_tarefa = { concluido, id: tarefa._id, nome: cliente.nome, servico: ser.descricao, dataini, datafim }
                                        }
                                        //console.log('lista_tarefa=>'+lista_tarefa)                                                
                                        res.render('projeto/gerenciamento/vertarefas', { lista_tarefa, tarefa_concluida, tarefa_naoconcluida, dia, equipe, tarefa })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Falha ao encontrar as equipe.')
                                        res.redirect('/dashboard')
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Falha ao encontrar o tipo de serviço.')
                                    res.redirect('/dashboard')
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Falha ao encontrar o cliente.')
                                res.redirect('/dashboard')
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Falha ao encontrar a tarefa<tarefas>.')
                            res.redirect('/dashboard')
                        })
                    }
                }).catch((err) => {
                    req.flash('error_msg', 'Falha ao encontrar o tipo de serviço.')
                    res.redirect('/dashboard')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao encontrar o cliente.')
                res.redirect('/dashboard')
            })
        })
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar a todas tarefas.')
        res.redirect('/dashboard')
    })

})

router.get('/plano', ehAdmin, (req, res) => {
    res.render('projeto/gerenciamento/planos')
})

router.get('/plano/:id', ehAdmin, (req, res) => {
    Plano.findOne({ _id: req.params.id }).lean().then((plano) => {
        res.render('projeto/gerenciamento/planos', { plano })
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar o plano.')
        res.redirect('/dashboard')
    })
})

router.get('/consultaplano', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }
    Plano.find({ user: id }).lean().then((planos) => {
        res.render('projeto/gerenciamento/consultaplano', { planos })
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar o plano.')
        res.redirect('/gerenciamento/plano')
    })
})

router.post('/obra', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }

    var idobra = req.body.id
    idobra = String(idobra).replace(',', '')
    //console.log('idobra=>' + idobra)
    if (naoVazio(idobra)) {
        Obra.findOne({ _id: idobra }).then((obra) => {
            //console.log('obra=>' + obra)
            if (naoVazio(req.body.cliente)) {
                obra.cliente = req.body.cliente
            }
            if (naoVazio(req.body.responsavel)) {
                obra.responsavel = req.body.responsavel
            }
            if (naoVazio(req.body.empresa)) {
                obra.empresa = req.body.empresa
            }
            console.log('req.body.endereco=>' + req.body.endereco)
            obra.endereco = req.body.endereco
            if (naoVazio(req.body.cidade)) {
                obra.cidade = req.body.cidade
            } else {
                obra.cidade = req.body.cidadeh
            }
            if (naoVazio(req.body.uf)) {
                obra.uf = req.body.uf
            } else {
                obra.uf = req.body.ufh
            }
            //console.log('datacad=>' + dataBusca(dataHoje()))
            obra.data = dataBusca(dataHoje())
            obra.save().then(() => {
                req.flash('success_msg', 'Obra salva com sucesso.')
                res.redirect('/gerenciamento/obra/' + idobra + 'abalista')
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao salvar a obra.')
                res.redirect('/gerenciamento/obra/' + req.body.id)
            })
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao encontrar a proposta.')
            res.redirect('/gerenciamento/obra/' + req.body.id)
        })
    } else {
        //console.log('nova obra')
        var seq
        Obra.findOne({ user: id }).sort({ field: 'asc', _id: -1 }).then((obraseq) => {
            //console.log('obraseq=>' + obraseq)
            if (naoVazio(obraseq)) {
                seq = parseFloat(obraseq.seq) + 1
            } else {
                seq = 1
            }
            const obra = {
                user: id,
                cliente: req.body.cliente,
                responsavel: req.body.responsavel,
                empresa: req.body.empresa,
                data: dataBusca(dataHoje()),
                datacad: dataBusca(dataHoje()),
                encerrado: false,
                seq: seq,
                status: 'Aguardando',
            }
            new Obra(obra).save().then(() => {
                Obra.findOne({ user: id }).sort({ field: 'asc', _id: -1 }).then((nova_obra) => {
                    req.flash("success_msg", 'Clique novamente na seta para salvar o local da obra.')
                    res.redirect('/gerenciamento/obra/' + nova_obra._id)
                }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro ao encontrar a proposta.')
                    res.redirect('/dashboard')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao salvar a proposta.')
                res.redirect('/dashboard')
            })
        })
    }
})

router.get('/enviarequipe/:id', ehAdmin, (req, res) => {
    const { user } = req.user
    const { _id } = req.user
    var id
    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }
    var liberar
    var mensagem
    var tipo
    Proposta.findOne({ _id: req.params.id }).then((proposta) => {
        if (naoVazio(proposta)) {
            Equipe.findOne({ _id: proposta.equipe }).then((equipe) => {
                if (naoVazio(equipe.insres)) {
                    const corpo = {
                        user: id,
                        proposta: req.params.id,
                        equipe: equipe,
                        data: dataHoje()
                    }
                    // //console.log('equipe.liberar=>' + equipe.liberar)
                    if (equipe.liberar == true) {
                        AtvTelhado.findOneAndDelete({ proposta: req.params.id }).then(() => {
                            AtvAterramento.findOneAndDelete({ proposta: req.params.id }).then(() => {
                                AtvInversor.findOneAndDelete({ proposta: req.params.id }).then(() => {
                                    liberar = false
                                    mensagem = 'Envio cancelado.'
                                    tipo = 'error_msg'
                                    equipe.liberar = liberar
                                    equipe.save().then(() => {
                                        var mailOptions = { // Define informações pertinentes ao E-mail que será enviado
                                            from: '"Instalação cancelada" <equipe@vimmus.com.br>',
                                            to: equipe.email,
                                            subject: 'Atividades da equipe',
                                            text: 'Olá Instalador,' + '\n' +
                                                'A intalação do projeto: ' + proposta.seq + '/' + equipe.nome_projeto + ', foi cancelada.' + '\n' +
                                                'Aguarde por mais informações do técnico responsável pela instalação.'
                                        }
                                        // transporter.sendMail(mailOptions, (err, info) => { // Função que, efetivamente, envia o email.
                                        //     if (err) {
                                        //         return //console.log(err)
                                        //     } else {
                                        //         req.flash(tipo, mensagem)
                                        //         res.redirect('/gerenciamento/equipe/' + req.params.id)
                                        //     }
                                        // })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Houve erro ao salvar a equipe.')
                                        res.redirect('/gerenciamento/equipe/' + req.params.id)
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Houve erro ao encontrar a atividade de instalação do inversor.')
                                    res.redirect('/gerenciamento/equipe/' + req.params.id)
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Houve erro ao encontrar a atividade de instalação do aterramento.')
                                res.redirect('/gerenciamento/equipe/' + req.params.id)
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Houve erro ao encontrar a atividade de instalação do telhado.')
                            res.redirect('/gerenciamento/equipe/' + req.params.id)
                        })
                    } else {
                        //console.log('novaatv=>' + novaatv)
                        new AtvTelhado(corpo).save().then(() => {
                            new AtvAterramento(corpo).save().then(() => {
                                new AtvInversor(corpo).save().then(() => {
                                    liberar = true
                                    mensagem = 'Equipe liberada para a obra.'
                                    tipo = 'success_msg'
                                    equipe.liberar = liberar
                                    equipe.save().then(() => {
                                        //console.log('equipe.email=>'+equipe.email)
                                        Pessoa.findOne({ _id: equipe.insres }).then((insres) => {
                                            var mailOptions = { // Define informações pertinentes ao E-mail que será enviado
                                                from: '"Nova equipe" <equipe@vimmus.com.br>',
                                                to: equipe.email,
                                                subject: 'Atividades da equipe',
                                                text: 'Olá Instalador,' + '\n' +
                                                    'Você esta alocado para a equipe do projeto: ' + proposta.seq + '/' + equipe.nome_projeto + ', esta instalação está planejada para ser realizada entre os dias: ' + dataMensagem(equipe.dtinicio) + ' e ' + dataMensagem(equipe.dtfim) + '\n' +
                                                    'O endereço para a instalação é: ' + proposta.endereco + ' município de: ' + proposta.cidade + '/' + proposta.uf + '\n' +
                                                    'O técnico responsável pela a obra será: ' + insres.nome + '\n' +
                                                    'Acesse seu aplicativo para acopanhar a evolução da obra.'
                                            }
                                            // transporter.sendMail(mailOptions, (err, info) => { // Função que, efetivamente, envia o email.
                                            //     if (err) {
                                            //         return //console.log(err)
                                            //     } else {
                                            //         req.flash(tipo, mensagem)
                                            //         res.redirect('/gerenciamento/equipe/' + req.params.id)
                                            //     }

                                            // })
                                        }).catch((err) => {
                                            req.flash('error_msg', 'Houve erro ao encontrar o instalador responsável.')
                                            res.redirect('/gerenciamento/equipe/' + req.params.id)
                                        })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Houve erro ao salvar a equipe.')
                                        res.redirect('/gerenciamento/equipe/' + req.params.id)
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Houve erro ao salvar a atividade de instalação do inversor.')
                                    res.redirect('/gerenciamento/equipe/' + req.params.id)
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Houve erro ao salvar a atividade de instalação do aterramento.')
                                res.redirect('/gerenciamento/equipe/' + req.params.id)
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Houve erro ao salvar a atividade de instalação do telhado.')
                            res.redirect('/gerenciamento/equipe/' + req.params.id)
                        })
                    }
                } else {
                    req.flash('aviso_msg', 'Só será possível libera a equipe para a obra após selecionar um técnico responsável.')
                    res.redirect('/gerenciamento/equipe/' + req.params.id)
                }
            }).catch((err) => {
                req.flash('error_msg', 'Houve erro ao encontrar a equipe.')
                res.redirect('/gerenciamento/equipe/' + req.params.id)
            })
        } else {
            Tarefa.findOne({ _id: req.params.id }).then((tarefa) => {
                Equipe.findOne({ _id: tarefa.equipe }).then((equipe) => {
                    if (naoVazio(equipe.insres)) {
                        mensagem = 'Equipe liberada para o serviço.'
                        tipo = 'success_msg'
                        equipe.liberar = true
                        equipe.save().then(() => {
                            Obra.findOne({ 'tarefa.idtarefa': req.params.id }).then((obra) => {
                                Cliente.findOne({ _id: obra.cliente }).then((cliente) => {
                                    Pessoa.findOne({ _id: equipe.insres }).then((insres) => {
                                        obra.status = 'Em execução'
                                        obra.save().then(() => {
                                            //console.log('insres.nome=>' + insres.nome)
                                            //console.log('insres.email=>' + insres.email)
                                            var mailOptions = { // Define informações pertinentes ao E-mail que será enviado
                                                from: '"Nova equipe" <equipe@vimmus.com.br>',
                                                to: insres.email,
                                                subject: 'Atividades da equipe',
                                                text: 'Olá Instalador,' + '\n' +
                                                    'Você esta alocado para a obra: ' + obra.seq + '/' + cliente.nome + ', esta instalação está planejada para ser realizada entre os dias: ' + dataMensagem(equipe.dtinicio) + ' e ' + dataMensagem(equipe.dtfim) + '\n' +
                                                    'O endereço para a instalação é: ' + tarefa.endereco + ' município de: ' + tarefa.cidade + '/' + tarefa.uf + '\n' +
                                                    //'O técnico responsável pelo serviço será: ' + insres.nome + '\n' +
                                                    'Acesse seu aplicativo para acopanhar a evolução da obra.'
                                            }
                                            // transporter.sendMail(mailOptions, (err, info) => { // Função que, efetivamente, envia o email.
                                            //     if (err) {
                                            //         return console.log(err)
                                            //     } else {
                                            //         req.flash(tipo, mensagem)
                                            //         res.redirect('/gerenciamento/mostraEquipe/' + req.params.id)
                                            //     }
                                            // })
                                        }).catch((err) => {
                                            req.flash('error_msg', 'Houve erro ao salvar a obra.')
                                            res.redirect('/gerenciamento/mostraEquipe/' + req.params.id)
                                        })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Houve erro ao encontrar o instalador responsável.')
                                        res.redirect('/gerenciamento/mostraEquipe/' + req.params.id)
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Houve erro ao encontrar o cliente.')
                                    res.redirect('/gerenciamento/mostraEquipe/' + req.params.id)
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Houve erro ao encontrar a obra.')
                                res.redirect('/gerenciamento/mostraEquipe/' + req.params.id)
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Houve erro ao salvar a equipe.')
                            res.redirect('/gerenciamento/mostraEquipe/' + req.params.id)
                        })
                    } else {
                        req.flash('aviso_msg', 'Só será possível libera a equipe para a obra após selecionar um técnico responsável.')
                        res.redirect('/gerenciamento/equipe/' + req.params.id)
                    }
                }).catch((err) => {
                    req.flash('error_msg', 'Houve erro ao encontrar a equipe.')
                    res.redirect('/gerenciamento/mostraEquipe/' + req.params.id)
                })
            }).catch((err) => {
                req.flash('error_msg', 'Houve erro ao encontrar a tarefa.')
                res.redirect('/gerenciamento/mostraEquipe/' + req.params.id)
            })
        }
    }).catch((err) => {
        req.flash('error_msg', 'Houve erro ao encontrar a proposta.')
        res.redirect('/gerenciamento/equipe/' + req.params.id)
    })
})

router.post('/addplaca', ehAdmin, (req, res) => {
    var placa = { "desc": req.body.desc, 'dtdes': dataMensagem(req.body.dtdes) }
    Equipe.findOneAndUpdate({ _id: req.body.id }, { $push: { placa: placa } }).then((e) => {
        req.flash('success_msg', 'Placa adicionada com sucesso.')
        res.redirect('/gerenciamento/equipe/' + req.body.idp)
    }).catch((err) => {
        req.flash('error_msg', 'Houve erro ao salvar a equipe.')
        res.redirect('/gerenciamento/equipe/' + req.body.idp)
    })
})

router.post('/removeplaca', ehAdmin, (req, res) => {
    Equipe.findOneAndUpdate({ _id: req.body.ide }, { $pull: { 'placa': { '_id': req.body.id } } }).then(() => {
        req.flash('success_msg', 'Placa removida com sucesso.')
        res.redirect('/gerenciamento/equipe/' + req.body.idp)
    }).catch((err) => {
        req.flash('error_msg', 'Houve erro ao excluir a equipe.')
        res.redirect('/gerenciamento/equipe/' + req.body.idp)
    })
})

router.post('/salvarImagem', ehAdmin, upload.array('files', 10), (req, res) => {

    var arquivos = req.files
    //console.log('req.files=>' + req.files)
    var imagem
    var ativo

    var sql = []
    //console.log("tipo=>" + req.body.tipo)
    if (req.body.tipo == 'proposta') {
        sql = { proposta: req.body.id }
    } else {
        sql = { tarefa: req.body.id }
    }

    if (naoVazio(arquivos)) {
        arquivos.forEach((e) => {
            if (req.body.tipo == 'proposta') {
                if (req.body.caminho == 'sombreamento' || req.body.caminho == 'area' || req.body.caminho == 'insi' || req.body.caminho == 'insa') {
                    imagem = { "desc": e.originalname, "data": req.body.data }
                } else {
                    imagem = { "desc": e.originalname }
                }

                //console.log("req.body.id=>" + req.body.id)
                if (req.body.caminho == 'aterramento') {
                    //console.log('sql=>' + JSON.stringify(sql))
                    AtvAterramento.findOneAndUpdate(sql, { $push: { caminhoFoto: imagem } }).then((e) => {
                        req.flash('success_msg', 'Foto(s) do aterramento salva(s) com sucesso.')
                    })
                } else {
                    if (req.body.caminho == 'inversor') {
                        AtvInversor.findOneAndUpdate(sql, { $push: { caminhoFoto: imagem } }).then((e) => {
                            req.flash('success_msg', 'Foto(s) do inversor salva(s) com sucesso.')
                        })
                    } else {
                        if (req.body.caminho == 'telhado') {
                            AtvTelhado.findOneAndUpdate(sql, { $push: { caminhoFoto: imagem } }).then((e) => {
                                req.flash('success_msg', 'Foto(s) das estruturar e módulos salva(s) com sucesso.')
                            })
                        } else {
                            if (req.body.caminho == 'area') {
                                Vistoria.findOneAndUpdate({ proposta: req.body.id }, { $push: { caminhoArea: imagem } }).then((e) => {
                                    req.flash('success_msg', 'Foto(s) da area de instalação salva(s) com sucesso.')
                                })

                            } else {
                                if (req.body.caminho == 'sombreamento') {
                                    Vistoria.findOneAndUpdate({ proposta: req.body.id }, { $push: { caminhoSomb: imagem } }).then((e) => {
                                        req.flash('success_msg', 'Foto(s) do sombreamento salvo(s) com sucesso.')
                                    })
                                } else {
                                    if (req.body.caminho == 'insi') {
                                        Vistoria.findOneAndUpdate({ proposta: req.body.id }, { $push: { caminhoInsi: imagem } }).then((e) => {
                                            req.flash('success_msg', 'Foto(s) do local do inveror salvo(s) com sucesso.')
                                        })
                                    } else {
                                        if (req.body.caminho == 'insa') {
                                            Vistoria.findOneAndUpdate({ proposta: req.body.id }, { $push: { caminhoInsa: imagem } }).then((e) => {
                                                req.flash('success_msg', 'Foto(s) do local do aterramento salvo(s) com sucesso.')
                                            })

                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                imagem = { "desc": e.originalname }
                //console.log('imagem=>' + JSON.stringify(imagem))
                ImgTarefa.findOneAndUpdate(sql, { $push: { caminhoFoto: imagem } }).then((e) => {
                    req.flash('success_msg', 'Foto(s) do serviço salva(s) com sucesso.')
                })
            }
        })
    }
    //console.log('req.body.check=>' + req.body.check)
    if (req.body.check == 'on') {
        ativo = true
    } else {
        ativo = false
    }

    //console.log("caminho=>" + req.body.caminho)
    if (req.body.caminho == 'aterramento') {
        AtvAterramento.findOneAndUpdate(sql, { aprova: ativo }).then((e) => {
            if (ativo == true) {
                req.flash('success_msg', 'Imagem(ns) do aterramento aprovada(s)')
            }
        })
    }
    if (req.body.caminho == 'inversor') {
        if (ativo == true) {
            AtvInversor.findOneAndUpdate(sql, { aprova: ativo }).then((e) => {
                req.flash('success_msg', 'Imagem(ns) do aterramento aprovada(s)')
            })
        }
    }
    if (req.body.caminho == 'telhado') {
        if (ativo == true) {
            AtvTelhado.findOneAndUpdate(sql, { aprova: ativo }).then((e) => {
                req.flash('success_msg', 'Imagem(ns) do aterramento aprovada(s)')
            })
        }
    }
    if (req.body.caminho == 'tarefa') {
        ImgTarefa.findOneAndUpdate(sql, { aprova: ativo }).then((e) => {
            if (ativo == true) {
                req.flash('success_msg', 'Imagem(ns) da(s) tarefa(s) aprovada(s)')
            }
        })
    }

    //console.log('req.body.caminho=>' + req.body.caminho)
    //console.log('req.body.id=>' + req.body.id)
    Vistoria.findOne({ proposta: req.body.id }).then((vistoria) => {
        if (naoVazio(vistoria)) {
            if (naoVazio(vistoria.caminhoSomb) && (naoVazio(vistoria.caminhoArea)) && (naoVazio(vistoria.caminhoInsa)) && (naoVazio(vistoria.caminhoInsi))) {
                vistoria.feito = true
            } else {
                vistoria.feito = false
            }
            vistoria.dtvisita = dataHoje()
            vistoria.save().then(() => {
                req.flash('success_msg', 'Documento salvo com sucesso.')
                if (naoVazio(req.body.aceite)) {
                    res.redirect('/gerenciamento/aceite/' + req.body.id)
                } else {
                    if (naoVazio(req.body.idi)) {
                        res.redirect('/gerenciamento/atvi/' + req.body.id)
                    } else {
                        if (naoVazio(req.body.ida)) {
                            res.redirect('/gerenciamento/atva/' + req.body.id)
                        } else {
                            if (naoVazio(req.body.idt)) {
                                res.redirect('/gerenciamento/atvt/' + req.body.id)
                            } else {
                                res.redirect('/gerenciamento/visita/' + req.body.id)
                            }
                        }
                    }
                }
            }).catch(() => {
                req.flash('error_msg', 'Falha ao encontrar o documento.')
                res.redirect('/gerenciamento/aceite/' + req.body.id)
            })
        } else {
            if (naoVazio(req.body.aceite)) {
                res.redirect('/gerenciamento/aceite/' + req.body.id)
            } else {
                if (naoVazio(req.body.idi)) {
                    res.redirect('/gerenciamento/atvi/' + req.body.id)
                } else {
                    if (naoVazio(req.body.ida)) {
                        res.redirect('/gerenciamento/atva/' + req.body.id)
                    } else {
                        if (naoVazio(req.body.idt)) {
                            res.redirect('/gerenciamento/atvt/' + req.body.id)
                        } else {
                            if (req.body.caminho == 'tarefa') {
                                //console.log('entrou')
                                res.redirect('/gerenciamento/mostrarGaleria/' + req.body.id + 'galeria-tarefa')
                            } else {
                                res.redirect('/gerenciamento/visita/' + req.body.id)
                            }
                        }
                    }
                }
            }
        }
    }).catch(() => {
        req.flash('error_msg', 'Falha ao encontrar a vistoria.')
        res.redirect('/gerenciamento/aceite/' + params[0])
    })

})

router.post('/salvarFotos', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }
    var img = []
    var imgblob = []
    var foto = []
    var ib
    var params
    var q = 0

    dirsave = "./upload/"

    img = req.body.imagem
    imgblob = req.body.imgblob

    if (img.length < 100) {

        (async () => {

            await img.forEach((i) => {
                //ib = imgblob[q].replace('blob:https://vimmus.com.br/', '')
                ib = imgblob[q].replace('blob:http://localhost:3000/', '')
                ib = ib + '.png'
                // console.log('ib=>' + ib)
                // strip off the data: url prefix to get just the base64-encoded bytes
                data = i.replace(/^data:image\/\w+;base64,/, "")
                buf = Buffer.from(data, "base64")

                foto.push({ "desc": ib, 'data': dataMensagem(dataHoje()) })

                fs.writeFile(dirsave + ib, buf)

                q++
            })

            // console.log('dirsave=>' + dirsave)
            // console.log('ib=>' + ib)
            console.log('q=>' + q)
            for (i = 0; i < q; i++) {

                //ib = imgblob[i].replace('blob:https://vimmus.com.br/', '')
                ib = imgblob[i].replace('blob:http://localhost:3000/', '')
                ib = ib + '.png'

                console.log('lendo diretório')
                await fs.readFile(dirsave + ib).then((rf) => {
                    // console.log('imagem=>' + String(rf.buffer))
                    params = {
                        Bucket: 'vimmusimg',
                        Key: ib,
                        Body: rf
                    }
                    s3.upload(params, function (err, data) {
                        if (err) {
                            throw err
                        }
                    })
                })

                await fs.unlink(dirsave + ib, (err) => {
                    if (err) {
                        console.log('Houve algum erro!', err);
                    } else {
                        console.log('Tudo certo! Arquivo removido.');
                    }
                })
            }

            ImgTarefa.findOneAndUpdate({ tarefa: req.body.id }, { $push: { caminhoFoto: foto } }).then(() => {
                req.flash('success_msg', 'Foto(s) adicionada(s) com sucesso.')
                res.redirect('/gerenciamento/mostrarGaleria/' + req.body.id + 'galeria-tarefa')
            }).catch((err) => {
                req.flash('error_msg', 'Houve erro ao salvar a imagem.')
                res.redirect('/gerenciamento/mostrarGaleria/' + req.body.id + 'galeria-tarefa')
            })
        })()

    } else {
        // console.log('lendo diretório')
        (async () => {

            ib = imgblob.replace('blob:http://localhost:3000/', '')
            ib = ib + '.png'
            console.log('ib=>' + ib)
            // strip off the data: url prefix to get just the base64-encoded bytes
            data = img.replace(/^data:image\/\w+;base64,/, "")
            buf = Buffer.from(data, "base64")

            foto.push({ "desc": ib, 'data': dataMensagem(dataHoje()) })

            await fs.writeFile(dirsave + ib, buf)

            console.log('dirsave=>' + dirsave)
            console.log('ib=>' + ib)
            await fs.readFile(dirsave + ib).then((rf) => {
                // console.log('imagem=>' + String(rf.buffer))
                params = {
                    Bucket: 'vimmusimg',
                    Key: ib,
                    Body: rf
                }

                s3.upload(params, function (err, data) {
                    if (err) {
                        throw err
                    }
                    console.log(`File uploaded successfully. ${data.Location}`)
                })
            })
            await fs.unlink(dirsave + ib, (err) => {
                if (err) {
                    console.log('Houve algum erro!', err);
                } else {
                    console.log('Tudo certo! Arquivo removido.');
                }
            })
            console.log('req.body.id =>' + req.body.id)

            ImgTarefa.findOneAndUpdate({ tarefa: req.body.id }, { $push: { caminhoFoto: foto } }).then(() => {
                req.flash('success_msg', 'Foto(s) adicionada(s) com sucesso.')
                res.redirect('/gerenciamento/mostrarGaleria/' + req.body.id + 'galeria-tarefa')
            }).catch((err) => {
                req.flash('error_msg', 'Houve erro ao salvar a imagem.')
                res.redirect('/gerenciamento/mostrarGaleria/' + req.body.id + 'galeria-tarefa')
            })
        })()
    }

})

router.get('/mostrarGaleria/:id', ehAdmin, (req, res) => {
    const {instalador} = req.user

    var params
    params = req.params.id
    params = params.split('galeria-')
    var lista_imagens = []
    var img
    var q = 1
    var funcaoIns = false
    //console.log('id=>' + params[0])
    //console.log('caminho=>' + params[1])

            var check = 'unchecked'
            //console.log('proposta vazio')
            if (params[1] == 'tarefa') {
                console.log('params[0] =>' + params[0])
                Tarefa.findOne({ _id: params[0] }).lean().then((tarefa) => {
                    ImgTarefa.findOne({ tarefa: params[0] }).lean().then((imgtarefa) => {
                        img = imgtarefa.caminhoFoto
                        console.log('img=>' + JSON.stringify(img))
                        img.forEach((e) => {
                            lista_imagens.push({ imagem: e.desc, id: params[0], atv: 'tarefa', proposta: false })
                        })
                        if (imgtarefa.aprova == true) {
                            check = 'checked'
                        }
                        if (instalador == true){
                            funcaoIns = true
                        }
                        //console.log('lista_imagens=>' + lista_imagens)
                        Servico.findOne({_id: tarefa.servico}).then((servico)=>{
                        res.render('principal/mostrarFotos', { imgtarefa, check, lista_imagens, tarefa, titulo: servico.descricao, esconde: true, ehatv: false, instalador: funcaoIns })
                    }).catch((err) => {
                        req.flash('error_msg', 'Não foi possível encontrar o seviço.')
                        res.redirect('/gerenciamento/mostraEquipe/' + req.params.id)
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Não foi possível encontrar a atividade de instalação das estrurturas e módulos no telhado.')
                    res.redirect('/gerenciamento/mostraEquipe/' + req.params.id)
                })
                }).catch((err) => {
                    req.flash('error_msg', 'Não foi possível encontrar a tarefa.')
                    res.redirect('/gerenciamento/mostraEquipe/' + req.body.id)
                })
            }


})

router.get('/deletaImagem/:msg', ehAdmin, (req, res) => {
    var params = []
    params = req.params.msg
    params = params.split('delimg')
    //console.log(params[0])
    //console.log(params[1])
    //console.log(params[2])
    //console.log('params[3]=>' + params[3])
    //console.log('params[4]=>' + params[4])

    var sql = []
    console.log("params[3]=>" + params[3])
    if (params[3] == 'true') {
        sql = { proposta: params[1] }
    } else {
        sql = { tarefa: params[1] }
    }
    //console.log('params[2]=>' + params[2])
    //console.log('sql=>' + JSON.stringify(sql))
    if (params[2] == 'aterramento') {
        //console.log('entrou')
        AtvAterramento.findOneAndUpdate(sql, { $pull: { 'caminhoFoto': { 'desc': params[0] } } }).then((e) => {
            req.flash('aviso_msg', 'Imagem removida com sucesso')
            //console.log('params[3]=>' + params[3])
            if (params[4] == 'true') {
                res.redirect('/gerenciamento/atva/' + params[1])
            } else {
                res.redirect('/gerenciamento/mostrarGaleria/' + params[1] + 'galeria-' + params[2])
            }
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao remover a imagem.')
            res.redirect('/gerenciamento/mostrarGaleria/' + params[1] + 'galeria-' + params[2])
        })
    } else {
        if (params[2] == 'inversor') {
            AtvInversor.findOneAndUpdate(sql, { $pull: { 'caminhoFoto': { 'desc': params[0] } } }).then((e) => {
                req.flash('aviso_msg', 'Imagem removida com sucesso')
                //console.log('params[4]=>' + params[4])
                if (params[4] == 'true') {
                    res.redirect('/gerenciamento/atvi/' + params[1])
                } else {
                    //console.log('mostrar galeria')
                    res.redirect('/gerenciamento/mostrarGaleria/' + params[1] + 'galeria-' + params[2])
                }
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao remover a imagem.')
                res.redirect('/gerenciamento/mostrarGaleria/' + params[1] + 'galeria-' + params[2])
            })
        } else {
            if (params[2] == 'telhado') {
                AtvTelhado.findOneAndUpdate(sql, { $pull: { 'caminhoFoto': { 'desc': params[0] } } }).then((e) => {
                    req.flash('aviso_msg', 'Imagem removida com sucesso')
                    if (params[4] == 'true') {
                        res.redirect('/gerenciamento/atvt/' + params[1])
                    } else {
                        res.redirect('/gerenciamento/mostrarGaleria/' + params[1] + 'galeria-' + params[2])
                    }
                }).catch((err) => {
                    req.flash('error_msg', 'Falha ao remover a imagem.')
                    res.redirect('/gerenciamento/mostrarGaleria/' + params[1] + 'galeria-' + params[2])
                })
            } else {
                if (params[2] == 'sombreamento') {
                    Vistoria.findOneAndUpdate({ proposta: params[1] }, { $pull: { 'caminhoSomb': { 'desc': params[0] } } }).then((e) => {
                        req.flash('aviso_msg', 'Imagem removida com sucesso')
                        res.redirect('/gerenciamento/mostrarGaleria/' + params[1] + 'galeria-' + params[2])
                    }).catch((err) => {
                        req.flash('error_msg', 'Falha ao remover a imagem.')
                        res.redirect('/gerenciamento/mostrarGaleria/' + params[1] + 'galeria-' + params[2])
                    })
                } else {
                    if (params[2] == 'area') {
                        Vistoria.findOneAndUpdate({ proposta: params[1] }, { $pull: { 'caminhoArea': { 'desc': params[0] } } }).then((e) => {
                            req.flash('aviso_msg', 'Imagem removida com sucesso')
                            res.redirect('/gerenciamento/mostrarGaleria/' + params[1] + 'galeria-' + params[2])
                        }).catch((err) => {
                            req.flash('error_msg', 'Falha ao remover a imagem.')
                            res.redirect('/gerenciamento/mostrarGaleria/' + params[1] + 'galeria-' + params[2])
                        })
                    } else {
                        if (params[2] == 'insi') {
                            Vistoria.findOneAndUpdate({ proposta: params[1] }, { $pull: { 'caminhoInsi': { 'desc': params[0] } } }).then((e) => {
                                req.flash('aviso_msg', 'Imagem removida com sucesso')
                                res.redirect('/gerenciamento/mostrarGaleria/' + params[1] + 'galeria-' + params[2])
                            }).catch((err) => {
                                req.flash('error_msg', 'Falha ao remover a imagem.')
                                res.redirect('/gerenciamento/mostrarGaleria/' + params[1] + 'galeria-' + params[2])
                            })
                        } else {
                            if (params[2] == 'insa') {
                                Vistoria.findOneAndUpdate({ proposta: params[1] }, { $pull: { 'caminhoInsa': { 'desc': params[0] } } }).then((e) => {
                                    req.flash('aviso_msg', 'Imagem removida com sucesso')
                                    res.redirect('/gerenciamento/mostrarGaleria/' + params[1] + 'galeria-' + params[2])
                                }).catch((err) => {
                                    req.flash('error_msg', 'Falha ao remover a imagem.')
                                    res.redirect('/gerenciamento/mostrarGaleria/' + params[1] + 'galeria-' + params[2])
                                })
                            }
                            else {
                                ImgTarefa.findOneAndUpdate({ tarefa: params[1] }, { $pull: { 'caminhoFoto': { 'desc': params[0] } } }).then((e) => {
                                    req.flash('aviso_msg', 'Imagem removida com sucesso')
                                    res.redirect('/gerenciamento/mostrarGaleria/' + params[1] + 'galeria-' + params[2])
                                }).catch((err) => {
                                    req.flash('error_msg', 'Falha ao remover a imagem.')
                                    res.redirect('/gerenciamento/mostrarGaleria/' + params[1] + 'galeria-' + params[2])
                                })
                            }
                        }
                    }
                }
            }
        }
    }
})

router.get('/mostrarBucket/:docimg', ehAdmin, (req, res) => {
    //console.log("req.params.docimg=>" + req.params.docimg)
    s3.getObject(
        { Bucket: "vimmusimg", Key: req.params.docimg },
        function (error, data) {
            if (error != null) {
                //console.log("Failed to retrieve an object: " + error);
            } else {
                //console.log(data.ContentLength)
                res.send(data.Body)
            }
        }
    )
})

router.get('/entrega/:id', ehAdmin, (req, res) => {
    var id
    var usina
    const { _id } = req.user
    const { user } = req.user
    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }

            Obra.findOne({ _id: req.params.id }).then((obra) => {
                var trfok = 0
                var tarefas = obra.tarefa
                tarefas.forEach((e) => {
                    if (e.concluido) {
                        trfok++
                    }
                })
                if (trfok == tarefas.length) {
                    obra.status = 'Finalizado'
                    obra.encerrado = true
                    obra.save().then(() => {
                        req.flash('success_msg', 'Obra entegue.')
                        res.redirect('/gerenciamento/obra/' + obra._id)
                    }).catch((err) => {
                        req.flash('error_msg', 'Falha ao salvar a obra.')
                        res.redirect('/gerenciamento/consultaobra')
                    })
                } else {
                    req.flash('error_msg', 'Todas as terefas precisam estar concluidas para fechar a obra.')
                    res.redirect('/gerenciamento/obra/' + obra._id)
                }
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao encontrar a obra<entrega>.')
                res.redirect('/gerenciamento/consultaobra')
            })

})

router.post('/checkposvenda', ehAdmin, (req, res) => {
    Posvenda.findOne({ _id: req.body.idpos }).then((posvenda) => {
        //console.log('entrou')
        //console.log('req.body.checkconfig=>' + req.body.checkconfig)
        //console.log('req.body.checkdemo=>' + req.body.checkdemo)
        //console.log('req.body.checkleitura=>' + req.body.checkleitura)

        if (req.body.checkalerta == 'on') {
            //console.log('checked')
            posvenda.alerta = 'checked'
        } else {
            posvenda.alerta = 'unchecked'
        }
        if (req.body.checkenergia == 'on') {
            //console.log('checked')
            posvenda.energia = 'checked'
        } else {
            posvenda.energia = 'unchecked'
        }
        if (req.body.checkmanut == 'on') {
            //console.log('checked')
            posvenda.manut = 'checked'
        } else {
            posvenda.manut = 'unchecked'
        }
        if (req.body.checksombra == 'on') {
            //console.log('checked')
            posvenda.sombra = 'checked'
        } else {
            posvenda.sombra = 'unchecked'
        }
        if (req.body.checkmonitora == 'on') {
            //console.log('checked')
            posvenda.monitora = 'checked'
        } else {
            posvenda.monitora = 'unchecked'
        }
        if (req.body.checkconexao == 'on') {
            //console.log('checked')
            posvenda.conexao = 'checked'
        } else {
            posvenda.conexao = 'unchecked'
        }
        if (req.body.checkgerador == 'on') {
            //console.log('checked')
            posvenda.gerador = 'checked'
        } else {
            posvenda.gerador = 'unchecked'
        }
        if (req.body.checkanalise == 'on') {
            //console.log('checked')
            posvenda.analise = 'checked'
        } else {
            posvenda.analise = 'unchecked'
        }

        posvenda.duvidas = req.body.duvidas

        posvenda.save().then(() => {
            req.flash('success_msg', 'Check List salvo com sucesso.')
            res.redirect('/gerenciamento/posvenda/' + req.body.id)
        }).catch(() => {
            req.flash('error_msg', 'Falha ao salvar o pós venda.')
            res.redirect('/gerenciamento/posvenda/' + req.body.id)
        })
    }).catch(() => {
        req.flash('error_msg', 'Falha ao encontrar o pós venda<checked>.')
        res.redirect('/gerenciamento/posvenda/' + req.body.id)
    })
})

router.post('/salvarDocumento', upload.single('files'), ehAdmin, (req, res) => {
    var files
    var tipo = req.body.tipo
    if (req.file != null) {
        files = req.file.originalname
    } else {
        files = ''
    }
    Documento.findOne({ proposta: req.body.id }).then((documento) => {
        if (tipo == 'memorial') {
            if (naoVazio(files)) {
                documento.memorial = files
            }
            documento.dtmemorial = req.body.dtmemorial
            req.flash('success_msg', 'Memorial descritivo salvo com sucesso.')
        }
        if (tipo == 'situacao') {
            if (naoVazio(files)) {
                documento.situacao = files
            }
            documento.dtsituacao = req.body.dtsituacao
            req.flash('success_msg', 'Planta de situação salva com sucesso.')
        }
        if (tipo == 'unifilar') {
            if (naoVazio(files)) {
                documento.unifilar = files
            }
            documento.dtunifilar = req.body.dtunifilar
            req.flash('success_msg', 'Projeto unifilar salvo com sucesso.')
        }
        if (tipo == 'trifilar') {
            if (naoVazio(files)) {
                documento.trifilar = files
            }
            documento.dttrifilar = req.body.dttrifilar
            req.flash('success_msg', 'Projeto trifilar salvo com sucesso.')
        }
        if (tipo == 'parecer') {
            if (naoVazio(files)) {
                documento.parecer = files
            }
            documento.dtparecer = req.body.dtparecer
            req.flash('success_msg', 'Parecer de acesso salvo com sucesso.')
        }
        documento.save().then(() => {
            res.redirect('/gerenciamento/execucao/' + req.body.id)
        }).catch(() => {
            req.flash('error_msg', 'Falha ao salvar o documento.')
            res.redirect('/gerenciamento/execucao/' + req.body.id)
        })
    }).catch(() => {
        req.flash('error_msg', 'Falha ao encontrar o documento.')
        res.redirect('/gerenciamento/execucao/' + req.body.id)
    })
})

router.post('/protocolar', ehAdmin, (req, res) => {
    Documento.findOne({ proposta: req.body.id }).then((documento) => {
        var novadata = new Date(req.body.dtprotocolo)
        var ajustadata = new Date(req.body.dtprotocolo)
        var date = new Date(req.body.dtprotocolo)
        ajustadata.setDate(date.getDate() + 1)
        //console.log('diainicio=>' + ajustadata.getDate())
        //console.log('ajustadata=>' + ajustadata)
        novadata.setDate(ajustadata.getDate() + 15)
        var ano = novadata.getFullYear()
        var mes = novadata.getMonth()
        var dia = novadata.getDate()
        //console.log('ano=>' + ano)
        //console.log('mes=>' + mes)
        //console.log('dia=>' + dia)
        documento.protocolado = true
        documento.dtprotocolo = req.body.dtprotocolo
        //console.log('novadata=>' + novadata)
        if (ajustadata.getDate() == 1) {
            mes = mes + 2
        } else {
            mes = mes + 1
        }
        if (mes < 10) {
            mes = '0' + mes
        }
        if (dia < 10) {
            dia = '0' + dia
        }
        var valida = dia + '/' + mes + '/' + ano
        documento.dtprotocolo = req.body.dtprotocolo
        documento.dtdeadline = valida
        documento.save().then(() => {
            req.flash('success_msg', 'Projeto homologado na concessionária.')
            res.redirect('/gerenciamento/execucao/' + req.body.id)
        }).catch(() => {
            req.flash('error_msg', 'Falha ao salvar o documento.')
            res.redirect('/gerenciamento/execucao/' + req.body.id)
        })
    }).catch(() => {
        req.flash('error_msg', 'Falha ao encontrar o documento.')
        res.redirect('/gerenciamento/execucao/' + req.body.id)
    })
})

router.post('/plano', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }
    var fidelidade
    if (req.body.fidelidade == '' || typeof req.body.fidelidade == 'undefined') {
        fidelidade = 0
    } else {
        fidelidade = req.body.fidelidade
    }
    //console.log('id=>' + req.body.id)
    //console.log('fidelidade=>' + req.body.fidelidade)
    if (req.body.id != '' && typeof req.body.id != 'undefined') {
        Plano.findOne({ _id: req.body.id }).then((existeplano) => {
            existeplano.nome = req.body.nome
            existeplano.qtdini = req.body.qtdini
            existeplano.qtdfim = req.body.qtdfim
            existeplano.mensalidade = req.body.mensalidade
            existeplano.fidelidade = fidelidade
            existeplano.save().then(() => {
                req.flash('success_msg', 'Plano salvo com sucesso.')
                res.redirect('/gerenciamento/plano/' + req.body.id)
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao salvar o plano.')
                res.redirect('/gerenciamento/plano')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao encontrar o plano.')
            res.redirect('/gerenciamento/plano')
        })
    } else {
        //console.log('novo plano')
        new Plano({
            user: id,
            nome: req.body.nome,
            qtdini: req.body.qtdini,
            qtdfim: req.body.qtdfim,
            mensalidade: req.body.mensalidade,
            fidelidade: fidelidade,
        }).save().then(() => {
            Plano.findOne({ user: id }).sort({ field: 'asc', _id: -1 }).lean().then((novoplano) => {
                req.flash('success_msg', 'Plano salvo com sucesso.')
                res.redirect('/gerenciamento/plano/' + novoplano._id)
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao encontrar o plano.')
                res.redirect('/gerenciamento/plano')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao salvar o plano.')
            res.redirect('/gerenciamento/plano')
        })
    }
})

router.post('/aplicaAgenda/', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }
    var trintaeum = false
    var bisexto = false
    var dia

    var mes
    var dif
    var difmes
    var dtinicio
    var dtfim
    var anoinicio
    var anofim
    var mesinicio
    var mesfim
    var diainicio
    var diafim

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

    var janeiro = ''
    var fevereiro = ''
    var marco = ''
    var abril = ''
    var maio = ''
    var junho = ''
    var julho = ''
    var agosto = ''
    var setembro = ''
    var outubro = ''
    var novembro = ''
    var dezembro = ''

    var dia
    var mestitulo
    var messel
    var mes
    var q = 0
    var ano = req.body.ano

    //console.log('req.body.messel=>'+req.body.messel)

    switch (String(req.body.messel)) {
        case 'Janeiro':
            janeiro = 'active'
            mestitulo = 'Janeiro '
            messel = '01'
            trintaeum = true
            break;
        case 'Fevereiro':
            fevereiro = 'active'
            mestitulo = 'Fevereiro '
            messel = '02'
            bisexto = true
            break;
        case 'Março':
            marco = 'active'
            mestitulo = 'Março '
            messel = '03'
            trintaeum = true
            break;
        case 'Abril':
            abril = 'active'
            mestitulo = 'Abril '
            messel = '04'
            break;
        case 'Maio':
            maio = 'active'
            mestitulo = 'Maio '
            messel = '05'
            trintaeum = true
            break;
        case 'Junho':
            junho = 'active'
            mestitulo = 'Junho '
            messel = '06'
            break;
        case 'Julho':
            julho = 'active'
            mestitulo = 'Julho '
            messel = '07'
            trintaeum = true
            break;
        case 'Agosto':
            agosto = 'active'
            mestitulo = 'Agosto '
            messel = '08'
            trintaeum = true
            break;
        case 'Setembro':
            setembro = 'active'
            mestitulo = 'Setembro '
            messel = '09'
            break;
        case 'Outubro':
            outubro = 'active'
            mestitulo = 'Outubro '
            messel = '10'
            trintaeum = true
            break;
        case 'Novembro':
            novembro = 'active'
            mestitulo = 'Novembro '
            messel = '11'
            break;
        case 'Dezembro':
            dezembro = 'active'
            mestitulo = 'Dezembro '
            messel = '12'
            trintaeum = true
            break;
    }
    //console.log('req.body.selecionado=>' + req.body.selecionado)
    dataini = ano + '01' + '01'
    datafim = ano + '12' + '31'
    //console.log('dataini=>' + dataini)
    //console.log('datafim=>' + datafim)
    //console.log('req.body.pessoa=>' + req.body.pessoa)
    if (naoVazio(req.body.pessoa)) {
        //console.log('entrou')
        Pessoa.findOne({ user: id, _id: req.body.pessoa }).lean().then((pessoa) => {
            //console.log('pessoa=>' + pessoa)
            Tarefas.find({ user: id, equipe: { $exists: true }, 'buscadataini': { $lte: parseFloat(datafim), $gte: parseFloat(dataini) } }).then((tarefas) => {
                //console.log('tarefas=>' + tarefas)
                if (naoVazio(tarefas)) {
                    tarefas.forEach((e) => {
                        //console.log('e._id=>' + e._id)
                        Equipe.findOne({ user: id, id: e.equipe, ins0: { $exists: true }, dtinicio: { $ne: '00/00/0000' }, $or: [{ ins0: pessoa.nome }, { ins1: pessoa.nome }, { ins2: pessoa.nome }, { ins3: pessoa.nome }, { ins4: pessoa.nome }, { ins5: pessoa.nome }] }).then((equipe) => {
                            //console.log('e._id=>' + e._id)
                            Cliente.findOne({ _id: e.cliente }).then((cliente) => {
                                //console.log('cliente.nome=>' + cliente.nome)
                                //console.log('e.servico=>'+e.servico)
                                Servico.findOne({ _id: e.servico }).then((ser) => {
                                    //console.log('ser.descricao=>' + ser.descricao)
                                    var dias = []
                                    var feito = false
                                    dias = e.dias
                                    q++
                                    dtinicio = e.dataini
                                    dtfim = e.datafim
                                    anoinicio = dtinicio.substring(0, 4)
                                    anofim = dtfim.substring(0, 4)
                                    mesinicio = dtinicio.substring(5, 7)
                                    mesfim = dtfim.substring(5, 7)
                                    diainicio = dtinicio.substring(8, 11)
                                    diafim = dtfim.substring(8, 11)
                                    //console.log("messel=>" + messel)
                                    //console.log("mesinicio=>" + mesinicio)
                                    if (messel == mesinicio) {
                                        mes = mesinicio
                                        if (parseFloat(anofim) == parseFloat(anoinicio)) {
                                            dia = diainicio
                                            if (parseFloat(anofim) > parseFloat(anoinicio)) {
                                                //console.log('projeto ultrapassa anos')
                                                if (messel == 1 || messel == 3 || messel == 5 || messel == 7 || messel == 8 || messel == 10 || messel == 12) {
                                                    dif = 31
                                                } else {
                                                    dif = 30
                                                }
                                            } else {
                                                if (naoVazio(e.programacao)) {
                                                    dif = 1
                                                } else {
                                                    dif = parseFloat(diafim) - parseFloat(diainicio) + 1
                                                }
                                            }
                                        } else {
                                            //console.log('mesmo mes outro ano')
                                            //console.log('diainicio=>' + diainicio)
                                            if (naoVazio(e.programacao)) {
                                                dia = diainicio
                                                dif = 1
                                            } else {
                                                dif =
                                                    dia = 0
                                            }
                                        }
                                    } else {
                                        //console.log('diferente')
                                        if (naoVazio(e.programacao)) {
                                            dia = diainicio
                                            dif = 1
                                        } else {
                                            difmes = parseFloat(mesfim) - parseFloat(mesinicio)
                                            if (difmes != 0) {
                                                //console.log('difmes=>' + difmes)
                                                if (difmes < 0) {
                                                    difmes = difmes + 12
                                                }
                                                //console.log('mesinicio=>' + mesinicio)
                                                for (i = 0; i < difmes; i++) {
                                                    mes = parseFloat(mesinicio) + i
                                                    if (mes > 12) {
                                                        mes = mes - 12
                                                    }
                                                    //console.log('mes=>' + mes)
                                                    //console.log('meshoje=>' + meshoje)
                                                    if (mes == messel) {
                                                        break;
                                                    }
                                                }
                                                if (parseFloat(anofim) > parseFloat(anoinicio)) {
                                                    dia = '01'
                                                    if (messel == 1 || messel == 3 || messel == 5 || messel == 7 || messel == 8 || messel == 10 || messel == 12) {
                                                        dif = 31
                                                    } else {
                                                        dif = 30
                                                    }

                                                } else {
                                                    dia = diainicio
                                                    if (naoVazio(e.programacao)) {
                                                        dif = 1
                                                    } else {
                                                        dif = parseFloat(diafim) - parseFloat(diainicio) + 1
                                                    }
                                                }
                                            }
                                        }
                                    }

                                    //console.log('dataini=>' + dataini)
                                    //console.log('mes=>' + mes)
                                    tarefa = ser.descricao
                                    for (i = 0; i < dif; i++) {
                                        //console.log('dia=>' + dia)
                                        //console.log('entrou laço')
                                        if (messel == mes) {
                                            if (naoVazio(dias)) {
                                                //console.log('d=>' + d)
                                                feito = dias[i].feito
                                                //console.log('feito=>' + feito)
                                            }
                                            if (dia == '01') {
                                                tarefas01.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                            }
                                            if (dia == '02') {
                                                tarefas02.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                            }
                                            if (dia == '03') {
                                                tarefas03.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                            }
                                            if (dia == '04') {
                                                tarefas04.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                            }
                                            if (dia == '05') {
                                                tarefas05.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                            }
                                            if (dia == '06') {
                                                tarefas06.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                            }
                                            if (dia == '07') {
                                                tarefas07.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                            }
                                            if (dia == '08') {
                                                tarefas08.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                            }
                                            if (dia == '09') {
                                                tarefas09.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                            }
                                            if (dia == '10') {
                                                tarefas10.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                            }
                                            if (dia == '11') {
                                                tarefas11.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                            }
                                            if (dia == '12') {
                                                tarefas12.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                            }
                                            if (dia == '13') {
                                                tarefas13.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                            }
                                            if (dia == '14') {
                                                tarefas14.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                            }
                                            if (dia == '15') {
                                                tarefas15.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                            }
                                            if (dia == '16') {
                                                tarefas16.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                            }
                                            if (dia == '17') {
                                                tarefas17.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                            }
                                            if (dia == '18') {
                                                tarefas18.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                            }
                                            if (dia == '19') {
                                                tarefas19.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                            }
                                            if (dia == '20') {
                                                tarefas20.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                            }
                                            if (dia == '21') {
                                                tarefas21.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                            }
                                            if (dia == '22') {
                                                tarefas22.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                            }
                                            if (dia == '23') {
                                                tarefas23.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                            }
                                            if (dia == '24') {
                                                tarefas24.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                            }
                                            if (dia == '25') {
                                                tarefas25.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                            }
                                            if (dia == '26') {
                                                tarefas26.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                            }
                                            if (dia == '27') {
                                                tarefas27.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                            }
                                            if (dia == '28') {
                                                tarefas28.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                            }
                                            if (dia == '29') {
                                                tarefas29.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                            }
                                            if (dia == '30') {
                                                tarefas30.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                            }
                                            if (dia == '31') {
                                                tarefas31.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                            }
                                        }
                                        dia++
                                    }
                                    //console.log('tarefas.length=>' + tarefas.length)
                                    if (q == tarefas.length) {
                                        //console.log('messel=>' + messel)
                                        //console.log('ano=>' + ano)
                                        //console.log('mestitulo=>' + mestitulo)                                        
                                        res.render('projeto/gerenciamento/agenda', {
                                            tarefas01, tarefas02, tarefas03, tarefas04, tarefas05, tarefas06, tarefas07,
                                            tarefas08, tarefas09, tarefas10, tarefas11, tarefas12, tarefas13, tarefas14,
                                            tarefas15, tarefas16, tarefas17, tarefas18, tarefas19, tarefas20, tarefas21,
                                            tarefas22, tarefas23, tarefas24, tarefas25, tarefas26, tarefas27, tarefas28,
                                            tarefas29, tarefas30, tarefas31,
                                            mes, ano, mestitulo, messel, janeiro, fevereiro, marco, abril, maio, junho, julho, agosto, setembro,
                                            outubro, novembro, dezembro, ehManutencao: true, trintaeum, bisexto, toda_agenda: false, pessoa
                                        })
                                    }
                                }).catch((err) => {
                                    req.flash('error_msg', 'Falha ao encontrar o tipo de serviço.')
                                    res.redirect('/gerenciamento/agenda')
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Falha ao encontrar o cliente.')
                                res.redirect('/gerenciamento/agenda')
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Falha ao encontrar a todas tarefas.')
                            res.redirect('/gerenciamento/agenda')
                        })
                    })
                } else {
                    var erro = []
                    erro.push({ texto: 'Pessoa sem tarefas para este período.' })
                    res.render('projeto/gerenciamento/agenda', {
                        mes, ano, mestitulo, messel, janeiro, fevereiro, marco, abril, maio, junho, julho, agosto, setembro, outubro,
                        novembro, dezembro, pessoa, trintaeum, bisexto, ehManutencao: true, toda_agenda: false, erro
                    })
                }
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao encontrar a todas tarefas.')
                res.redirect('/gerenciamento/agenda')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao encontrar a pessoa.')
            res.redirect('/gerenciamento/agenda')
        })
    } else {
        Cliente.find({ user: id }).lean().then((todos_clientes) => {
            //console.log("dataini=>" + dataini)
            //console.log("datafim=>" + datafim)
            Tarefas.find({ user: id, 'buscadataini': { $lte: parseFloat(datafim), $gte: parseFloat(dataini) } }).then((lista_tarefas) => {
                //console.log('lista_tarefas=>' + lista_tarefas)
                if (naoVazio(lista_tarefas)) {
                    lista_tarefas.forEach((e) => {
                        //console.log('e._id=>' + e._id)
                        //console.log('e.cliente=>'+e.cliente)
                        Cliente.findOne({ _id: e.cliente }).then((cliente) => {
                            //console.log('cliente=>' + cliente)
                            Servico.findOne({ _id: e.servico }).then((ser) => {
                                var dias = []
                                var feito = false
                                dias = e.dias
                                q++
                                dtinicio = e.dataini
                                dtfim = e.datafim
                                anoinicio = dtinicio.substring(0, 4)
                                anofim = dtfim.substring(0, 4)
                                mesinicio = dtinicio.substring(5, 7)
                                mesfim = dtfim.substring(5, 7)
                                diainicio = dtinicio.substring(8, 11)
                                diafim = dtfim.substring(8, 11)
                                //console.log('e._id=>' + e._id)
                                //console.log("messel=>" + messel)
                                //console.log("mesinicio=>" + mesinicio)

                                if (messel == mesinicio) {
                                    mes = mesinicio
                                    if (parseFloat(anofim) == parseFloat(anoinicio)) {
                                        dia = diainicio
                                        if (parseFloat(anofim) > parseFloat(anoinicio)) {
                                            //console.log('projeto ultrapassa anos')
                                            if (messel == 1 || messel == 3 || messel == 5 || messel == 7 || messel == 8 || messel == 10 || messel == 12) {
                                                dif = 31
                                            } else {
                                                dif = 30
                                            }
                                        } else {
                                            if (naoVazio(e.programacao)) {
                                                dif = 1
                                            } else {
                                                dif = parseFloat(diafim) - parseFloat(diainicio) + 1
                                            }
                                        }
                                    } else {
                                        //console.log('mesmo mes outro ano')
                                        //console.log('diainicio=>' + diainicio)
                                        if (naoVazio(e.programacao)) {
                                            dia = diainicio
                                            dif = 1
                                        } else {
                                            dif =
                                                dia = 0
                                        }
                                    }
                                } else {
                                    //console.log('diferente')
                                    mes = 0
                                    if (naoVazio(e.programacao)) {
                                        dia = diainicio
                                        dif = 1
                                    } else {
                                        difmes = parseFloat(mesfim) - parseFloat(mesinicio)
                                        //console.log('difmes=>' + difmes)
                                        if (difmes != 0) {
                                            if (difmes < 0) {
                                                difmes = difmes + 12
                                            }
                                            //console.log('mesinicio=>' + mesinicio)
                                            for (i = 0; i < difmes; i++) {
                                                mes = parseFloat(mesinicio) + i
                                                if (mes > 12) {
                                                    mes = mes - 12
                                                }
                                                //console.log('mes=>' + mes)
                                                //console.log('meshoje=>' + meshoje)
                                                if (mes == messel) {
                                                    break;
                                                }
                                            }
                                            if (parseFloat(anofim) > parseFloat(anoinicio)) {
                                                dia = '01'
                                                if (messel == 1 || messel == 3 || messel == 5 || messel == 7 || messel == 8 || messel == 10 || messel == 12) {
                                                    dif = 31
                                                } else {
                                                    dif = 30
                                                }
                                            } else {
                                                dia = diainicio
                                                if (naoVazio(e.programacao)) {
                                                    dif = 1
                                                } else {
                                                    dif = parseFloat(diafim) - parseFloat(diainicio) + 1
                                                }
                                            }
                                        }
                                    }
                                }

                                const { dataini } = e
                                //console.log('dataini=>' + dataini)
                                //console.log('mes=>' + mes)
                                tarefa = ser.descricao
                                for (i = 0; i < dif; i++) {
                                    //console.log('dia=>' + dia)
                                    //console.log('entrou laço')
                                    if (messel == mes) {
                                        if (naoVazio(dias)) {
                                            //console.log('d=>' + d)
                                            feito = dias[i].feito
                                            //console.log('feito=>' + feito)
                                        }
                                        if (dia == '01') {
                                            tarefas01.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '02') {
                                            tarefas02.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '03') {
                                            tarefas03.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '04') {
                                            tarefas04.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '05') {
                                            tarefas05.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '06') {
                                            tarefas06.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '07') {
                                            tarefas07.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '08') {
                                            tarefas08.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '09') {
                                            tarefas09.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '10') {
                                            tarefas10.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '11') {
                                            tarefas11.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '12') {
                                            tarefas12.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '13') {
                                            tarefas13.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '14') {
                                            tarefas14.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '15') {
                                            tarefas15.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '16') {
                                            tarefas16.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '17') {
                                            tarefas17.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '18') {
                                            tarefas18.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '19') {
                                            tarefas19.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '20') {
                                            tarefas20.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '21') {
                                            tarefas21.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '22') {
                                            tarefas22.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '23') {
                                            tarefas23.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '24') {
                                            tarefas24.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '25') {
                                            tarefas25.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '26') {
                                            tarefas26.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '27') {
                                            tarefas27.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '28') {
                                            tarefas28.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '29') {
                                            tarefas29.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '30') {
                                            tarefas30.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                        if (dia == '31') {
                                            tarefas31.push({ projeto: cliente.nome, ehManutencao: true, id: e._id, tarefa, feito })
                                        }
                                    }
                                    dia++
                                }
                                //console.log('lista_tarefas.length=>' + lista_tarefas.length)
                                if (q == lista_tarefas.length) {
                                    //console.log('messel=>' + messel)
                                    //console.log('ano=>' + ano)
                                    //console.log('mestitulo=>' + mestitulo)                                    
                                    res.render('projeto/gerenciamento/agenda', {
                                        tarefas01, tarefas02, tarefas03, tarefas04, tarefas05, tarefas06, tarefas07,
                                        tarefas08, tarefas09, tarefas10, tarefas11, tarefas12, tarefas13, tarefas14,
                                        tarefas15, tarefas16, tarefas17, tarefas18, tarefas19, tarefas20, tarefas21,
                                        tarefas22, tarefas23, tarefas24, tarefas25, tarefas26, tarefas27, tarefas28,
                                        tarefas29, tarefas30, tarefas31, checkTesk: 'checked', checkInst: 'unchecked',
                                        mes, messel, ano, todos_clientes, mestitulo, janeiro, fevereiro, marco, abril, maio, junho,
                                        julho, agosto, setembro, outubro, novembro, dezembro, ehManutencao: true, trintaeum, bisexto, toda_agenda: true
                                    })
                                }
                            })
                        })
                    })
                } else {
                    if (q == lista_tarefas.length) {
                        //console.log('mestitulo=>' + mestitulo)
                        res.render('projeto/gerenciamento/agenda', {
                            tarefas01, tarefas02, tarefas03, tarefas04, tarefas05, tarefas06, tarefas07,
                            tarefas08, tarefas09, tarefas10, tarefas11, tarefas12, tarefas13, tarefas14,
                            tarefas15, tarefas16, tarefas17, tarefas18, tarefas19, tarefas20, tarefas21,
                            tarefas22, tarefas23, tarefas24, tarefas25, tarefas26, tarefas27, tarefas28,
                            tarefas29, tarefas30, tarefas31, checkTesk: 'checked', checkInst: 'unchecked',
                            mes, ano, cliente, mestitulo, janeiro, fevereiro, marco, abril, maio, junho,
                            julho, agosto, setembro, outubro, novembro, dezembro, ehManutencao: true, trintaeum, bisexto, toda_agenda: true
                        })
                    }
                }

            }).catch((err) => {
                req.flash('error_msg', 'Não foi possível encontrar o tarefas cadastradas neste mês e ano.')
                res.redirect('/gerenciamento/agenda/')
            })
        })
    }
})

router.post('/salvarsrv', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }
    if (req.body.id == '') {
        new Servico({
            user: id,
            descricao: req.body.descricao,
            classe: req.body.classe,
            data: dataHoje()
        }).save().then(() => {
            req.flash('success_msg', 'Serviço criado com sucesso.')
            res.redirect('/gerenciamento/servicos')
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao salvar o tipo de serviço.')
        })
    } else {
        Servico.findOne({ _id: req.body.id }).then((servico) => {
            servico.descricao = req.body.descricao
            servico.classe = req.body.classe
            servico.save().then(() => {
                req.flash('success_msg', 'Serviço salvo com sucesso.')
                res.redirect('/gerenciamento/servicos')
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao salvar o tipo de serviço.')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao encontrar o tipo de serviço.')
        })

    }
})

router.get('/editarsrv/:id', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }
    Servico.find({ user: id }).lean().then((servicos) => {
        Servico.findOne({ _id: req.params.id }).lean().then((servico) => {
            //     //console.log(servico)
            res.render('projeto/gerenciamento/servicos', { servicos, servico })
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao encontrar o tipo de serviço.')
            res.redirect('/gerenciamento/servicos')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar todos os tipos de serviço.')
        res.redirect('/gerenciamento/servicos')
    })
})

router.get('/equipetarefa/:id', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id
    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }

    var ins_fora = []
    var ins_dentro = []
    var ins0
    var ins1
    var ins2
    var ins3
    var ins4
    var ins5

    var trf_empresa
    var trf_empid
    var trf_gestor
    var trf_gesid
    var trf_servico
    var trf_srvid
    var trf_dataini
    var trf_datafim
    var trf_tecnico
    var trf_tecid

    var custoins
    var q = 0

    //console.log('req.params.id=>' + req.params.id)
    Tarefa.findOne({ _id: req.params.id }).lean().then((tarefa) => {
        //console.log(usina)
        // //console.log('tarefa=>' + tarefa)
        trf_dataini = dataMensagem(tarefa.dataini)
        trf_datafim = dataMensagem(tarefa.datafim)
        Empresa.findOne({ _id: tarefa.empresa }).then((trfemp) => {
            // //console.log('trfemp=>' + trfemp)
            trf_empresa = trfemp.nome
            trf_empid = trfemp._id
            Pessoa.findOne({ _id: tarefa.responsavel }).then((trfres) => {
                // //console.log('trfres=>' + trfres)
                trf_gestor = trfres.nome
                trf_gesid = trfres._id
                Servico.findOne({ _id: tarefa.servico }).then((trfsrv) => {
                    // //console.log('trfsrv=>' + trfsrv)
                    trf_servico = trfsrv.descricao
                    trf_srvid = trfsrv._id
                    Equipe.findOne({ _id: tarefa.equipe }).then((equipeins) => {
                        //console.log('equipeins.insres=>' + equipeins.insres)
                        if (naoVazio(equipeins.insres)) {
                            //console.log('equipeins.insres=>' + equipeins.insres)
                            Pessoa.findOne({ _id: equipeins.insres }).then((trftec) => {
                                //console.log('trftec=>' + trftec)
                                trf_tecnico = trftec.nome
                                trf_tecid = trftec._id
                                //console.log('equipeins=>' + equipeins)
                                Pessoa.find({ funins: 'checked', user: id }).then((instalacao) => {
                                    //console.log('entrou')
                                    if (typeof equipeins.ins0 != 'undefined') {
                                        ins0 = equipeins.ins0
                                    }
                                    if (typeof equipeins.ins1 != 'undefined') {
                                        ins1 = equipeins.ins1
                                    }
                                    if (typeof equipeins.ins2 != 'undefined') {
                                        ins2 = equipeins.ins2
                                    }
                                    if (typeof equipeins.ins3 != 'undefined') {
                                        ins3 = equipeins.ins3
                                    }
                                    if (typeof equipeins.ins4 != 'undefined') {
                                        ins4 = equipeins.ins4
                                    }
                                    if (typeof equipeins.ins5 != 'undefined') {
                                        ins5 = equipeins.ins5
                                    }

                                    instalacao.forEach((pesins) => {
                                        q++
                                        var nome = pesins.nome
                                        var id = pesins._id

                                        if (naoVazio(pesins.email)) {
                                            email = pesins.email
                                        } else {
                                            email = ''
                                        }

                                        if (nome == ins0) {
                                            ins_dentro.push({ id, nome, email })
                                        } else {
                                            if (nome == ins1) {
                                                ins_dentro.push({ id, nome, email })
                                            } else {
                                                if (nome == ins2) {
                                                    ins_dentro.push({ id, nome, email })
                                                } else {
                                                    if (nome == ins3) {
                                                        ins_dentro.push({ id, nome, email })
                                                    } else {
                                                        if (nome == ins4) {
                                                            ins_dentro.push({ id, nome, email })
                                                        } else {
                                                            if (nome == ins5) {
                                                                ins_dentro.push({ id, nome, email })
                                                            } else {
                                                                ins_fora.push({ id, nome, email })
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    })
                                    //console.log('q=>' + q)
                                    if (q == instalacao.length) {
                                        var block = false
                                        Empresa.find({ user: id }).lean().then((empresa) => {
                                            Pessoa.find({ user: id, funins: 'checked' }).sort({ 'nome': 'asc' }).lean().then((instalacao) => {
                                                Pessoa.find({ user: id, funins: 'checked' }).sort({ 'nome': 'asc' }).lean().then((gestor) => {
                                                    //console.log('req.body.cliente=>' + req.body.cliente)
                                                    Servico.find({ user: id }).lean().then((servicos) => {
                                                        //console.log('tarefa.cliente=>' + tarefa.cliente)
                                                        Usina.find({ cliente: tarefa.cliente }).lean().then((usina) => {
                                                            Obra.findOne({ 'tarefa.idtarefa': tarefa._id }).lean().then((obra) => {
                                                                //console.log('ins_dentro=>' + ins_dentro)
                                                                //console.log('ins_fora=>>' + ins_fora)
                                                                //console.log('usina=>' + usina)
                                                                //console.log('instalacao=>' + instalacao)
                                                                //console.log('gestor=>' + gestor)  
                                                                //console.log('tarefa=>' + tarefa)
                                                                //console.log('empresa=>' + empresa)
                                                                //console.log('servicos=>' + servicos)
                                                                // if (naoVazio(usina)) {
                                                                //     res.render('projeto/gerenciamento/tarefas', { usina, trf_empresa, trf_empid, trf_gestor, trf_gesid, trf_servico, trf_srvid, tarefa, servicos, ins_fora, ins_dentro, instalacao, gestor, empresa, equipe: true })
                                                                // } else {
                                                                if (naoVazio(obra)) {
                                                                    block = true
                                                                }
                                                                res.render('projeto/gerenciamento/tarefas', { obra, block, tarefa, trf_empresa, trf_empid, trf_gestor, trf_gesid, trf_servico, trf_srvid, servicos, ins_fora, ins_dentro, instalacao, gestor, empresa, equipe: true })
                                                                // }
                                                            }).catch((err) => {
                                                                req.flash('error_msg', 'Nenhuma obra cadastrada.')
                                                                res.redirect('/dashboard')
                                                            })
                                                        }).catch((err) => {
                                                            req.flash('error_msg', 'Nenhuma usina cadastrada.')
                                                            res.redirect('/dashboard')
                                                        })
                                                    }).catch((err) => {
                                                        req.flash('error_msg', 'Nehuma tipo de serviço cadastrado.')
                                                        res.redirect('/dashboard')
                                                    })
                                                }).catch((err) => {
                                                    req.flash('error_msg', 'Nehum técnico cadastrada.')
                                                    res.redirect('/confguracao/addempresa')
                                                })
                                            }).catch((err) => {
                                                req.flash('error_msg', 'Falha ao encontrar os gestores.')
                                                res.redirect('/dashboard')
                                            })
                                        }).catch((err) => {
                                            req.flash('error_msg', 'Nehuam empresa cadastrada.')
                                            res.redirect('/confguracao/addempresa')
                                        })
                                    }
                                }).catch((err) => {
                                    req.flash('error_msg', 'Falha ao encontrar os técnicos instaladores.')
                                    res.redirect('/gerenciamento/equipe/' + req.params.id)
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Falha ao encontrar o técnico responsável.')
                                res.redirect('/gerenciamento/equipe/' + req.params.id)
                            })
                        } else {
                            req.flash("error_msg", 'Não foi encontrado instalador responsável pela obra.')
                            res.redirect('/gerenciamento/tarefa/' + req.params.id)
                        }

                    }).catch((err) => {
                        req.flash('error_msg', 'Falha ao encontrar o equipe.')
                        res.redirect('/gerenciamento/equipe/' + req.params.id)
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Nehum tipo de serviço encontrado.')
                    res.redirect('/cliente/consulta')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Nenhum gestor responsável encontrado.')
                res.redirect('/cliente/consulta')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Nenhuma empresa encontrada.')
            res.redirect('/cliente/consulta')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Nenhuma tarefa encontrada.')
        res.redirect('/cliente/consulta')
    })
})

router.post('/selecionacliente', ehAdmin, (req, res) => {
    const { _id } = req.user
    Cliente.find({ user: id }).lean().then((cliente) => {
        var ehSelecao = true
        res.render('projeto/gerenciamento/tarefas', { cliente, ehSelecao })
    }).catch(() => {
        res.flash('error_msg', 'Não há cliente cadastrado.')
        req.redirect('/dashboard')
    })
})

router.post('/addmanutencao', ehAdmin, (req, res) => {
    var id
    const { _id } = req.user
    const { user } = req.user
    if (naoVazio(user)) {
        id = user
    } else {
        id = _id
    }

    var data = ''
    var dia = ''
    var ano = ''
    var ins_fora = []
    var q = 0
    var ehSelecao = false
    var mes = ''

    var hoje = new Date()

    if (naoVazio(req.body.ano)) {
        ano = req.body.ano
    } else {
        ano = hoje.getFullYear()
    }
    var mes = parseFloat(hoje.getMonth()) + 1
    if (mes < 10) {
        mes = '0' + mes
    }

    if (naoVazio(req.body.dia) && dia != 0) {
        if (parseFloat(req.body.dia) < 10) {
            dia = '0' + req.body.dia
        } else {
            dia = req.body.dia
        }
    } else {
        dia = parseFloat(hoje.getDate())
        if (dia < 10) {
            dia = '0' + dia
        }
    }

    var nome
    var id
    var idcliente
    data = req.body.data
    //console.log('data=>' + data)
    Empresa.find({ user: id }).lean().then((empresa) => {
        if (naoVazio(empresa)) {
            //console.log('req.body.cliente=>' + req.body.cliente)
            Servico.find({ user: id }).lean().then((servicos) => {
                if (naoVazio(servicos)) {
                    //console.log('check=>' + req.body.check)
                    if (req.body.check != 'on') {
                        idcliente = '111111111111111111111111'
                    } else {
                        idcliente = req.body.cliente
                    }
                    //console.log('idcliente=>' + idcliente)
                    Usina.find({ cliente: idcliente }).lean().then((usina) => {
                        //console.log('usina=>' + usina)
                        if (naoVazio(usina)) {
                            //console.log(usina)
                            Pessoa.find({ user: id, funins: 'checked' }).sort({ 'nome': 'asc' }).lean().then((instalacao) => {
                                if (naoVazio(instalacao)) {
                                    instalacao.forEach((pesins) => {
                                        q++
                                        nome = pesins.nome
                                        ins_fora.push({ id: pesins._id, nome })
                                        if (q == instalacao.length) {
                                            Pessoa.find({ user: id, funges: 'checked' }).sort({ 'nome': 'asc' }).lean().then((gestor) => {
                                                //console.log('gestor=>' + gestor)
                                                res.render('projeto/gerenciamento/tarefas', { data, usina, ins_fora, servicos, cliente: idcliente, instalacao, gestor, empresa })
                                            }).catch((err) => {
                                                req.flash('error_msg', 'Falha ao encontrar os gestores.')
                                                res.redirect('/gerenciamento/agenda')
                                            })
                                        }
                                    })
                                } else {
                                    req.flash('error_msg', 'Não existem técnicos cadastrados.')
                                    res.redirect('/gerenciamento/agenda')
                                }
                            }).catch((err) => {
                                req.flash('error_msg', 'Falha ao encontrar os técnicos.')
                                res.redirect('/gerenciamento/agenda')
                            })
                        } else {
                            //console.log('sem usina')
                            Pessoa.find({ user: id, funins: 'checked' }).sort({ 'nome': 'asc' }).lean().then((instalacao) => {
                                if (naoVazio(instalacao)) {
                                    instalacao.forEach((pesins) => {
                                        q++
                                        nome = pesins.nome
                                        ins_fora.push({ id: pesins._id, nome })
                                        if (q == instalacao.length) {
                                            //console.log('id=>' + id)
                                            Pessoa.find({ user: id, funges: 'checked' }).sort({ 'nome': 'asc' }).lean().then((gestor) => {
                                                //console.log('gestor=>' + gestor)
                                                res.render('projeto/gerenciamento/tarefas', { data, ins_fora, servicos, cliente: req.body.cliente, instalacao, gestor, empresa })
                                            }).catch((err) => {
                                                req.flash('error_msg', 'Falha ao encontrar os gestores.')
                                                res.redirect('/gerenciamento/agenda')
                                            })
                                        }
                                    })
                                } else {
                                    req.flash('error_msg', 'Não existem técnicos cadastrados.')
                                    res.redirect('/gerenciamento/agenda')
                                }
                            }).catch((err) => {
                                req.flash('error_msg', 'Falha ao encontrar os técnicos.')
                                res.redirect('/gerenciamento/agenda')
                            })
                        }
                    }).catch((err) => {
                        req.flash('error_msg', 'Nenhuma usina cadastrada.')
                        res.redirect('/gerenciamento/agenda')
                    })
                } else {
                    req.flash('error_msg', 'Não existem serviços cadastradas.')
                    res.redirect('/gerenciamento/agenda')
                }
            }).catch((err) => {
                req.flash('error_msg', 'Nehuma tipo de serviço cadastrado.')
                res.redirect('/gerenciamento/agenda')
            })
        } else {
            req.flash('error_msg', 'Cadastre uma empresa para continuar.')
            res.redirect('/confguracao/addempresa')
        }
    }).catch((err) => {
        req.flash('error_msg', 'Nehuma empresa cadastrada.')
        res.redirect('/confguracao/addempresa')
    })
})

router.post('/addtarefa', ehAdmin, (req, res) => {
    var id
    const { _id } = req.user
    const { user } = req.user
    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }

    var adiciona
    var dataini
    var datafim
    var data1
    var data2
    var days
    var dif
    var dif
    var dias = []
    var cadastro = dataHoje()
    var corpo = []
    var email = []
    var todos_emails = ''
    var q = 0
    var email = ''
    var seq
    console.log('entrou')
    if (naoVazio(req.body.idequipe)) {
        //console.log('equipe não vazio')
        Tarefa.findOne({ _id: req.body.id }).then((tarefa) => {
            Equipe.findOne({ _id: tarefa.equipe }).then((equipe) => {
                console.log('req.body.idins0=>' + req.body.idins0)
                if (naoVazio(req.body.idins0)) {
                    equipe.idins0 = req.body.idins0
                    equipe.insres = req.body.insres
                    equipe.nome_equipe = req.body.nome_equipe
                } else {
                    equipe.idins0 = null
                    equipe.insres = null
                    equipe.nome_equipe = ''
                }
                if (naoVazio(req.body.idins1)) {
                    equipe.idins1 = req.body.idins1
                } else {
                    equipe.idins1 = null
                }
                if (naoVazio(req.body.idins2)) {
                    equipe.idins2 = req.body.idins2
                } else {
                    equipe.idins2 = null
                }
                if (naoVazio(req.body.idins3)) {
                    equipe.idins3 = req.body.idins3
                } else {
                    equipe.idins3 = null
                }
                if (naoVazio(req.body.idins4)) {
                    equipe.idins4 = req.body.idins4
                } else {
                    equipe.idins4 = null
                }
                if (naoVazio(req.body.idins5)) {
                    equipe.idins5 = req.body.idins5
                } else {
                    equipe.idins5 = null
                }
                //console.log('custototal=>' + custototal)
                for (i = 0; i < email.length; i++) {
                    //console.log('custoins[i]' + custoins[i])
                    todos_emails = todos_emails + email[i] + ';'
                }
                equipe.insres = req.body.responsavel
                console.log('req.body.ins0=>' + req.body.ins0)
                equipe.ins0 = req.body.ins0
                equipe.ins1 = req.body.ins1
                equipe.ins2 = req.body.ins2
                equipe.ins3 = req.body.ins3
                equipe.ins4 = req.body.ins4
                equipe.ins5 = req.body.ins5
                equipe.email = todos_emails
                equipe.dtinicio = req.body.dataini
                equipe.dtinibusca = dataBusca(req.body.dataini)
                equipe.dtfim = req.body.datafim
                equipe.dtfim = dataBusca(req.body.datafim)
                // equipe.custoins = custototal
                // equipe.feito = true
                equipe.save().then(() => {
                    console.log('equipe salva')
                    tarefa.responsavel = req.body.responsavel
                    tarefa.endereco = req.body.endereco
                    tarefa.servico = req.body.manutencao
                    tarefa.dataini = req.body.dataini
                    tarefa.buscadataini = dataBusca(req.body.dataini)
                    tarefa.datafim = req.body.datafim
                    tarefa.buscadatafim = dataBusca(req.body.datafim)
                    tarefa.preco = req.body.preco
                    tarefa.save().then(() => {
                        req.flash('success_msg', 'Tarefa salva com sucesso.')
                        if (naoVazio(tarefa.programacao)) {
                            res.redirect('/cliente/programacao/' + req.body.idusina)
                        } else {
                            Obra.findOne({ 'tarefa.idtarefa': tarefa._id }).then((obra) => {
                                if (naoVazio(obra)) {
                                    var ultimatarefa = obra.tarefa
                                    console.log('ultimatarefa=>' + ultimatarefa.length)
                                    if (ultimatarefa.length > 0) {
                                        if (ultimatarefa[ultimatarefa.length - 1].buscadatafim < dataBusca(req.body.datafim)) {
                                            obra.dtfim = req.body.datafim
                                        }
                                    } else {
                                        obra.dtini = req.body.dataini
                                        obra.dtfim = req.body.datafim
                                    }
                                    obra.save().then(() => {
                                        res.redirect('/gerenciamento/tarefas/' + tarefa._id)

                                    }).catch((err) => {
                                        req.flash('error_msg', 'Houve erro ao salvar a obra.')
                                        res.redirect('/gerenciamento/tarefas/' + tarefa._id)
                                    })
                                } else {
                                    res.redirect('/gerenciamento/tarefas/' + tarefa._id)
                                }
                            }).catch((err) => {
                                req.flash('error_msg', 'Houve erro ao encontrar a obra.')
                                res.redirect('/gerenciamento/tarefas/' + tarefa._id)
                            })
                        }
                    }).catch((err) => {
                        req.flash('error_msg', 'Houve erro ao salvar a tarefa.')
                        res.redirect('/gerenciamento/tarefas/' + tarefa._id)
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Houve erro ao salvar a equipe.')
                    res.redirect('/gerenciamento/tarefas/' + tarefa._id)
                })
            }).catch((err) => {
                req.flash('error_msg', 'Houve erro ao encontrar a equipe.')
                res.redirect('/gerenciamento/tarefas/' + tarefa._id)
            })
        }).catch((err) => {
            req.flash('error_msg', 'Houve erro ao encontrar a proposta.')
            res.redirect('/gerenciamento/tarefas/' + tarefa._id)
        })
    } else {
        if (req.body.equipe == 'true') {
            dataini = req.body.tarefadtini
            datafim = req.body.tarefadtfim
        } else {
            dataini = req.body.dataini
            datafim = req.body.datafim
        }
        //console.log       ('equipe true')
        //console.log('email=>' + email)
        for (i = 0; i < email.length; i++) {
            //console.log('custoins[i]' + custoins[i])
            todos_emails = todos_emails + email[i] + ';'
        }
        console.log('req.body.dataini=>' + req.body.dataini)
        corpo = {
            user: id,
            ins0: req.body.ins0,
            ins1: req.body.ins1,
            ins2: req.body.ins2,
            ins3: req.body.ins3,
            ins4: req.body.ins4,
            ins5: req.body.ins5,
            dtinicio: req.body.dataini,
            insres: req.body.responsavel,
            dtfim: req.body.datafim,
            dtinibusca: dataBusca(req.body.dataini),
            dtfimbusca: dataBusca(req.body.datafim),
            feito: true,
            prjfeito: false,
            liberar: false,
            parado: false,
            email: todos_emails
        }
        var idins = []
        var equipe = []
        if (naoVazio(req.body.idins0)) {
            idins = { idins0: req.body.idins0 }
            // equipe.insres = req.body.insres
        } else {
            idins = { idins0: null }
            // equipe.insres: null
        }
        if (naoVazio(req.body.idins1)) {
            idins = idins + { idins1: req.body.idins1 }
        } else {
            idins = idins + { idins1: null }
        }
        if (naoVazio(req.body.idins2)) {
            idins = idins + { idins2: req.body.idins2 }
        } else {
            idins = idins + { idins2: null }
        }
        if (naoVazio(req.body.idins3)) {
            idins = idins + { idins3: req.body.idins3 }
        } else {
            idins = idins + { idins3: null }
        }
        if (naoVazio(req.body.idins4)) {
            idins = idins + { idins4: req.body.idins4 }
        } else {
            idins = idins + { idins4: null }
        }
        if (naoVazio(req.body.idins5)) {
            idins = idins + { idins5: req.body.idins5 }
        } else {
            idins = idins + { idins5: null }
        }
        //console.log('idins=>' + JSON.stringify(idins))
        if (naoVazio(idins)) {
            Object.assign(equipe, idins, corpo)
        } else {
            equipe = corpo
        }
        new Equipe(equipe).save().then(() => {
            Equipe.findOne({ user: id }).sort({ field: 'asc', _id: -1 }).then((novaequipe) => {
                data1 = new Date(dataini)
                data2 = new Date(datafim)
                dif = Math.abs(data2.getTime() - data1.getTime())
                days = Math.ceil(dif / (1000 * 60 * 60 * 24))
                days = days + 1

                for (i = 1; i < days + 1; i++) {
                    dias.push({ dia: i, feito: false })
                }
                if (req.body.tipo == 'obra') {
                    var tarefas = []
                    Obra.findOne({ _id: req.body.id }).then((obra) => {
                        tarefas = obra.tarefa
                        if (naoVazio(tarefas)) {
                            seq = obra.seq + '-' + (tarefas.length + 1)
                            obra.dtfim = req.body.datafim
                        } else {
                            seq = obra.seq + '-1'
                            obra.dtini = req.body.dataini
                            obra.dtfim = req.body.datafim
                        }
                        console.log('seq=>' + seq)
                        //console.log('novaequipe=>' + novaequipe._id)
                        const tarefa = {
                            user: id,
                            equipe: novaequipe._id,
                            cliente: req.body.cliente,
                            obra: req.body.id,
                            responsavel: req.body.responsavel,
                            empresa: req.body.empresa,
                            seq: seq,
                            endereco: req.body.endereco,
                            cidade: req.body.cidade,
                            uf: req.body.uf,
                            servico: req.body.servico,
                            dataini: req.body.dataini,
                            buscadataini: dataBusca(req.body.dataini),
                            datafim: req.body.datafim,
                            buscadatafim: dataBusca(req.body.datafim),
                            cadastro: dataBusca(cadastro),
                            preco: req.body.preco,
                            concluido: false,
                            dias: dias,
                        }
                        Cliente.findOne({ _id: req.body.cliente }).then((cliente) => {
                            novaequipe.nome_projeto = cliente.nome
                            novaequipe.save().then(() => {
                                new Tarefas(tarefa).save().then(() => {
                                    Tarefas.findOne({ user: id }).sort({ field: 'asc', _id: -1 }).then((tarefa) => {
                                        corpo = {
                                            user: id,
                                            tarefa: tarefa._id,
                                            equipe: novaequipe._id,
                                            data: dataHoje()
                                        }
                                        new ImgTarefa(corpo).save().then(() => {
                                            //console.log('salvou tarefa')
                                            //console.log('req.body.id=>' + req.body.id)
                                            Equipe.find({ obra: req.body.id }).then((conta_obras) => {
                                                //console.log('conta_obras=>' + conta_obras)
                                                //if (conta_obras.length > 0) {
                                                    Obra.findOneAndUpdate({ _id: req.body.id }, { $push: { tarefa: { "idtarefa": tarefa._id } } }).then(() => {
                                                        Obra.findOneAndUpdate({ _id: req.body.id }, { $set: { 'dtini': tarefa.dataini, 'dtfim': tarefa.dtfim } }).then(() => {
                                                            //console.log('update')
                                                            novaequipe.tarefa = tarefa._id
                                                            novaequipe.obra = req.body.id
                                                            novaequipe.save().then(() => {
                                                                req.flash('success_msg', 'Tarefa da obra gerada com sucesso.')
                                                                res.redirect('/gerenciamento/obra/' + req.body.id + 'abalista')
                                                            })
                                                        })
                                                    })
                                                // } else {
                                                //     Obra.findOneAndUpdate({ _id: req.body.id }, { $push: { tarefa: { "idtarefa": tarefa._id } } }).then(() => {
                                                //         Obra.findOneAndUpdate({ _id: req.body.id }, { $set: { 'dtini': tarefa.dataini, 'dtfim': tarefa.datafim } }).then(() => {
                                                //             novaequipe.tarefa = tarefa._id
                                                //             novaequipe.obra = req.body.id
                                                //             novaequipe.save().then(() => {
                                                //                 req.flash('success_msg', 'Tarefa da obra gerada com sucesso.')
                                                //                 res.redirect('/gerenciamento/obra/' + req.body.id + 'abalista')
                                                //             })
                                                //         })
                                                //     })
                                                // }
                                            })
                                        })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Falha ao encontrar a tarefa.')
                                        res.redirect('/gerenciamento/obra/' + req.body.id)
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Falha ao salvar a tarefa.')
                                    res.redirect('/gerenciamento/tarefas/' + tarefa._id)
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Falha ao salvar a equipe.')
                                res.redirect('/gerenciamento/tarefas/' + tarefa._id)
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Falha ao encontrar o cliente.')
                            res.redirect('/gerenciamento/tarefas/' + tarefa._id)
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Falha ao encontrar a obra<add_tarefa>.')
                        res.redirect('/dashboard')
                    })
                } else {
                    if (req.body.equipe == 'true') {
                        //console.log('req.body.id=>' + req.body.id)
                        Tarefas.findOne({ _id: req.body.id }).then((tarefa) => {
                            tarefa.equipe = novaequipe._id
                            tarefa.save().then(() => {
                                req.flash('success_msg', 'Equipe alocada com sucesso.')
                                res.redirect('/cliente/programacao/' + req.body.idusina)
                            }).catch((err) => {
                                req.flash('error_msg', 'Falha ao salvar a tarefa.')
                                res.redirect('/cliente/programacao/' + req.body.idusina)
                            })
                        })
                    } else {
                        var seq
                        Empresa.findOne({ _id: req.body.empresa }).then((emp_tarefa) => {
                            if (naoVazio(emp_tarefa.seq)) {
                                seq = emp_tarefa.seq + 1
                                //console.log('numpro=>' + numpro)
                                emp_tarefa.seq = seq
                            } else {
                                seq = 1
                                emp_tarefa.seq = 1
                            }
                            //console.log("dias=>" + dias)
                            const tarefa = {
                                user: id,
                                equipe: novaequipe._id,
                                cliente: req.body.cliente,
                                responsavel: req.body.responsavel,
                                empresa: req.body.empresa,
                                seq: seq,
                                endereco: req.body.endereco,
                                cidade: req.body.cidade,
                                uf: req.body.uf,
                                servico: req.body.manutencao,
                                dataini: dataini,
                                buscadataini: dataBusca(dataini),
                                datafim: datafim,
                                buscadatafim: dataBusca(datafim),
                                cadastro: dataBusca(cadastro),
                                preco: req.body.preco,
                                concluido: false,
                                dias: dias,
                            }
                            if (naoVazio(req.body.usina)) {
                                var usina = { usina: req.body.usina }
                                adiciona = Object.assign(usina, tarefa)
                            } else {
                                adiciona = tarefa
                            }
                            //console.log('adiciona=>' + JSON.stringify(adiciona))
                            new Tarefas(adiciona).save().then(() => {
                                //console.log("salvou tarefa")
                                Tarefas.findOne({ user: id }).sort({ field: 'asc', _id: -1 }).then((tarefa) => {
                                    emp_tarefa.save().then(() => {
                                        //console.log('novaequipe._id=>' + novaequipe._id)
                                        corpo = {
                                            user: id,
                                            tarefa: tarefa._id,
                                            equipe: novaequipe._id,
                                            data: dataHoje()
                                        }
                                        new ImgTarefa(corpo).save().then(() => {
                                            //console.log('salvou atividades')
                                            Pessoa.find({ $or: [{ nome: req.body.ins0 }, { nome: req.body.ins1 }, { nome: req.body.ins2 }, { nome: req.body.ins3 }, { nome: req.body.ins4 }, { nome: req.body.ins5 }] }).then((pessoas) => {
                                                pessoas.forEach((p) => {
                                                    q++
                                                    //console.log('p.email=>' + p.email)
                                                    email = email + p.email
                                                    //console.log('q=>' + q)
                                                    //console.log('pessoas=>' + pessoas.length)
                                                    if (q == pessoas.length) {
                                                        novaequipe.tarefa = tarefa._id
                                                        novaequipe.save().then(() => {
                                                            req.flash('success_msg', 'Tarefa gerada com sucesso.')
                                                            res.redirect('/gerenciamento/tarefas/' + tarefa._id)
                                                        })
                                                    }
                                                })
                                            }).catch((err) => {
                                                req.flash('error_msg', 'Houve erro ao salvar a atividade de instalação do inversor.')
                                                res.redirect('/dashboard')
                                            })
                                        }).catch((err) => {
                                            req.flash('error_msg', 'Houve erro ao salvar a atividade de instalação do telhado.')
                                            res.redirect('/dashboard')
                                        })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Falha ao salvar a empresa.')
                                        res.redirect('/gerenciamento/tarefas/' + tarefa._id)
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Falha ao salvar a equipe.')
                                    res.redirect('/gerenciamento/tarefas/' + tarefa._id)
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Falha ao encontrar a tarefa<add tarefa>.')
                                res.redirect('/gerenciamento/tarefas/' + tarefa._id)
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Falha ao salvar a manutenção.')
                            res.redirect('/gerenciamento/tarefas/' + tarefa._id)
                        })
                    }
                }
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao encontrar a equipe.')
                res.redirect('/gerenciamento/tarefas/' + tarefa._id)
            })
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao salvar a equipe.')
            res.redirect('/gerenciamento/tarefas/' + tarefa._id)
        })
    }
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

router.post('/baixardia/', ehAdmin, (req, res) => {
    var mensagem = ''
    var dias = []
    var tamdias = 0
    var diaantes = 0
    var dia = 0
    var data2 = new Date(req.body.databaixa)
    console.log('data2=>' + data2)
    console.log('id=>' + req.body.id)
    Tarefa.findOne({ _id: req.body.id, $or: [{ dataini: req.body.databaixa }, { datafim: req.body.databaixa }, { 'buscadataini': { $lte: dataBusca(req.body.databaixa) } }, { 'buscadatafim': { $gte: dataBusca(req.body.databaixa) } }], $and: [{ 'buscadataini': { $lte: dataBusca(req.body.databaixa) } }, { 'buscadatafim': { $gte: dataBusca(req.body.databaixa) } }] }).then((t) => {
        console.log('t=>' + t)
        if (naoVazio(t)) {
            var data1 = new Date(t.dataini)
            console.log('data1=>' + data1)
            console.log('data2=>' + data2)
            if (data2 > data1) {
                dif = Math.abs(data2.getTime() - data1.getTime())
                days = Math.ceil(dif / (1000 * 60 * 60 * 24))
                //console.log('days=>' + days)
                dia = days + 1
                //console.log('dia=>' + dia)
                Tarefa.findOneAndUpdate({ _id: req.body.id, 'dias.dia': dia }, { $set: { 'dias.$.feito': true } }).then(() => {
                    //console.log('update')
                    dias = t.dias
                    tamdias = dias.length
                    diaantes = dia - 2
                    diadepois = dia
                    mensagem = 'Dia baixado com sucesso.'
                    //console.log('tamdias=>' + tamdias)
                    //console.log('dia=>' + dia)
                    //console.log('diaantes=>' + diaantes)
                    if ((tamdias == dia) && (dias[diaantes].feito == true)) {
                        t.concluido = true
                        t.databaixa = dataHoje()
                        t.save().then(() => {
                            mensagem = mensagem + ' Tarefa baixada com sucesso'
                            req.flash('success_msg', mensagem)
                            res.redirect('/gerenciamento/tarefas/' + req.body.id)
                        }).catch((err) => {
                            req.flash('error_msg', 'Houve um erro ao baixar o dia da tarefa.')
                            res.redirect('/gerenciamento/tarefas/' + req.body.id)
                        })
                    } else {
                        req.flash('success_msg', mensagem)
                        res.redirect('/gerenciamento/tarefas/' + req.body.id)
                    }
                    // diaantes = dias[days].feito
                    // diadepois = dias[dia].feito
                    //console.log('diaantes=>'+diaantes)
                    //console.log('diadepois=>'+diadepois)
                }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro ao baixar o dia da tarefa.')
                    res.redirect('/gerenciamento/tarefas/' + req.body.id)
                })
                // t.save().then(() => {
                //     req.flash('success_msg', 'Tarefa baixada.')
                //console.log('cliente._id=>' + cliente._id)
                //     res.redirect('/cliente/historico/' + cliente._id)
                // }).catch((err) => {
                //     req.flash('error_msg', 'Houve um erro ao salvar a tarefa.')
                //     res.redirect('/gerenciamento/tarefas/' + req.body.id)
                // })                    
            } else {
                //console.log('mesmo dia')
                Tarefa.findOneAndUpdate({ _id: req.body.id, 'dias.dia': 1 }, { $set: { 'dias.$.feito': true } }).then(() => {
                    //console.log('achou mesmo dia')
                    dias = t.dias
                    tamdias = dias.length
                    diaantes = dia - 2
                    console.log('tamdias=>' + tamdias)
                    console.log('dia=>' + dia)
                    console.log('diaantes=>' + diaantes)
                    if (tamdias == 1) {
                        t.concluido = true
                        t.databaixa = dataHoje()
                        t.save().then(() => {
                            mensagem = mensagem + ' Tarefa baixada com sucesso'
                            req.flash('success_msg', mensagem)
                            res.redirect('/gerenciamento/tarefas/' + req.body.id)
                        }).catch((err) => {
                            req.flash('error_msg', 'Houve um erro ao baixar o dia da tarefa.')
                            res.redirect('/gerenciamento/tarefas/' + req.body.id)
                        })
                    }
                }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro ao baixar o dia da tarefa.')
                    res.redirect('/gerenciamento/tarefas/' + req.body.id)
                })
            }
            // t.concluido = true
            // t.databaixa = req.body.databaixa
        } else {
            req.flash('aviso_msg', 'Não é possível baixar uma data fora do cronograma da tarefa.')
            res.redirect('/gerenciamento/tarefas/' + req.body.id)
        }
    })
})

router.post('/filtrodash', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    const { pessoa } = req.user
    const { nome } = req.user
    const { owner } = req.user
    var id

    var qtdexec = 0
    var qtdagua = 0
    var qtdreal = 0
    var qtdpara = 0
    var numtrf = 0

    var lista_tarefas = []
    var nome_lista
    var q = 0
    var saudacao
    var sqlstatus = []
    var sqlemp = []
    var sql = []
    var empselect = ''
    var ordem = ''
    var asc = ''
    var desc = ''

    var data = new Date()
    var hora = data.getHours()

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }

    var sqldata = []
    ano = req.body.ano
    switch (req.body.mes) {
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

    sqldata = { dtinibusca: { $lte: datafim, $gte: dataini } }

    if (hora >= 18 && hora <= 24) {
        saudacao = 'Boa Noite '
    }
    if (hora >= 12 && hora < 18) {
        saudacao = 'Boa tarde '
    }
    if (hora >= 0 && hora < 12) {
        saudacao = 'Bom dia '
    }

    switch (req.body.status) {
        case 'Em execução': sqlstatus = { user: id, tarefa: { $exists: true }, prjfeito: false, liberar: true, parado: false }
            break;
        case 'Aguardando': sqlstatus = { user: id, tarefa: { $exists: true }, prjfeito: false, liberar: false, parado: false }
            break;
        case 'Parado': sqlstatus = { user: id, tarefa: { $exists: true }, prjfeito: false, liberar: true, parado: true }
            break;
        case 'Finalizado': sqlstatus = { user: id, tarefa: { $exists: true }, prjfeito: true, liberar: true, parado: false }
            break;
        default: sqlstatus = { user: id, tarefa: { $exists: true } }
    }

    sql = Object.assign(sqlstatus, sqldata)

    var esta_pessoa = pessoa

    if (req.body.ordem == '1') {
        ordem = 1
        asc = 'checked'
        desc = 'unchecked'
    } else {
        ordem = -1
        asc = 'unchecked'
        desc = 'checked'
    }
    console.log('sqlstatus=>' + JSON.stringify(sqlstatus))
    Empresa.find({ user: id }).lean().then((todas_empresas) => {
        Equipe.find(sqlstatus).sort({ dtinibusca: ordem }).then((equipe) => {
            console.log('equipe=>' + equipe)
            if (naoVazio(equipe)) {
                equipe.forEach((e) => {
                    if (e.prjfeito == false && e.parado == false && e.liberar == false) {
                        qtdagua++
                    } else {
                        if (e.prjfeito == false && e.parado == false && e.liberar == true) {
                            qtdexec++
                        } else {
                            if (e.prjfeito == false && e.parado == true && e.liberar == true) {
                                qtdpara++
                            } else {
                                if (e.prjfeito == true && e.parado == false && e.liberar == true) {
                                    qtdreal++
                                }
                            }
                        }
                    }
                    sql = { user: id, _id: e.tarefa }
                    if (naoVazio(req.body.empresa) && req.body.empresa != '111111111111111111111111') {
                        sqlemp = { empresa: req.body.empresa }
                        sql = Object.assign(sql, sqlemp)
                    }
                    console.log('sql=>' + JSON.stringify(sql))
                    Tarefa.findOne(sql).then((tarefas) => {
                        console.log('tarefas=>' + tarefas._id)
                        Servico.findOne({ _id: tarefas.servico }).then((servico) => {
                            Cliente.findOne({ _id: tarefas.cliente }).then((cliente) => {
                                Pessoa.findOne({ _id: tarefas.responsavel }).then((pessoa_res) => {
                                    lista_tarefas.push({ id: tarefas._id, seq: tarefas.seq, liberado: e.liberar, feito: e.feito, nome_cli: cliente.nome, servico: servico.descricao, nome_res: pessoa_res.nome, id_equipe: e._id, dtini: dataMensagem(e.dtinicio), dtfim: dataMensagem(e.dtfim) })
                                    q++
                                    if (q == equipe.length) {
                                        numtrf = equipe.length
                                        Cliente.find({ user: id }).lean().then((todos_clientes) => {
                                            if (typeof pessoa == 'undefined') {
                                                esta_pessoa = '111111111111111111111111'
                                            }
                                            console.log('esta_pessoa=>' + esta_pessoa)
                                            Pessoa.findOne({ _id: esta_pessoa }).lean().then((nome_pessoa) => {
                                                if (naoVazio(nome_pessoa)) {
                                                    nome_lista = nome_pessoa.nome
                                                } else {
                                                    nome_lista = nome
                                                }
                                                console.log('nome_lista=>' + nome_lista)
                                                Empresa.findOne({ _id: req.body.empresa }).then((emp) => {
                                                    if (naoVazio(emp)) {
                                                        empselect = emp.nome
                                                    }
                                                    res.render('dashboard', { ano, mes: req.body.mes, numtrf, qtdagua, qtdexec, qtdpara, qtdreal, crm: false, lista_tarefas, nome_lista, saudacao, todos_clientes, todas_empresas, asc, desc, ordem, empselect, busca: true })
                                                }).catch((err) => {
                                                    req.flash("error_msg", "Ocorreu uma falha interna para encontrar a empresa<s>.")
                                                    res.redirect("/")
                                                })
                                            }).catch((err) => {
                                                req.flash("error_msg", "Ocorreu uma falha interna para encontrar a pessoa<nome_pessoa>.")
                                                res.redirect("/")
                                            })
                                        }).catch((err) => {
                                            req.flash("error_msg", "Ocorreu uma falha interna para encontrar os clientes<s>.")
                                            res.redirect("/")
                                        })
                                    }
                                }).catch((err) => {
                                    req.flash("error_msg", "Ocorreu uma falha interna para encontrar a pessoa<pessoa_res>.")
                                    res.redirect("/")
                                })
                            }).catch((err) => {
                                req.flash("error_msg", "Ocorreu uma falha interna para encontrar o cliente<s>.")
                                res.redirect("/")
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Não foi possível encontrar a tarefa.')
                            res.redirect("/")
                        })
                    }).catch((err) => {
                        req.flash("error_msg", "Ocorreu uma falha interna para encontrar a tarefa<s>.")
                        res.redirect("/")
                    })
                })
            } else {
                if (typeof pessoa == 'undefined') {
                    esta_pessoa = '111111111111111111111111'
                }
                Pessoa.findOne({ _id: pessoa }).lean().then((nome_pessoa) => {
                    if (naoVazio(nome_pessoa)) {
                        nome_lista = nome_pessoa.nome
                    } else {
                        nome_lista = nome
                    }
                    console.log('nome_lista=>' + nome_lista)
                    // Empresa.findOne({ _id: req.body.empresa }).then((emp) => {
                    //     if (naoVazio(emp)) {
                    //         empselect = emp.nome
                    //     }
                    res.render('dashboard', { ano, mes: req.body.mes, numtrf, qtdagua, qtdexec, qtdpara, crm: false, id: _id, owner: owner, saudacao, nome_lista, todas_empresas, asc, desc, ordem, busca: true })
                    // }).catch((err) => {
                    //     req.flash("error_msg", "Ocorreu uma falha interna para encontrar a empresa<s>.")
                    //     res.redirect("/")
                    // })
                })
            }
        }).catch((err) => {
            req.flash("error_msg", "Ocorreu uma falha interna para encontrar a equipe<s>.")
            res.redirect('/')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar as empresas.')
        res.redirect('/')
    })
})

module.exports = router