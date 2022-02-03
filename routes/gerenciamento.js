const { TextEncoder, TextDecoder } = require("util");

// require('../app')
require('../model/Usuario')
require('../model/Proposta')
require('../model/Empresa')
require('../model/Cliente')
require('../model/CustoDetalhado')
require('../model/Cronograma')
require('../model/Tarefas')
require('../model/Vistoria')
require('../model/Plano')
require('../model/Componente')
require('../model/Documento')
require('../model/Compra')
require('../model/Posvenda')
require('../model/Fornecedor')
require('../model/AtvTelhado')
require('../model/AtvAterramento')
require('../model/AtvInversor')
require('../model/Servico')
require('../model/Obra')
require('../model/Tarefas')
require('../model/ImagensTarefas')

const { ehAdmin } = require('../helpers/ehAdmin')

const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
// const fs = require('fs')
const path = require('path')
const multer = require('multer')
const nodemailer = require('nodemailer')
// const PromiseFtp = require('promise-ftp')


const Usuario = mongoose.model('usuario')
const Projeto = mongoose.model('projeto')
const Configuracao = mongoose.model('configuracao')
const Empresa = mongoose.model('empresa')
const Realizado = mongoose.model('realizado')
const Cliente = mongoose.model('cliente')
const Usina = mongoose.model('usina')
const Detalhado = mongoose.model('custoDetalhado')
const Cronograma = mongoose.model('cronograma')
const Pessoa = mongoose.model('pessoa')
const Tarefas = mongoose.model('tarefas')
const Equipe = mongoose.model('equipe')
const Vistoria = mongoose.model('vistoria')
const Plano = mongoose.model('plano')
const Componente = mongoose.model('componente')
const Proposta = mongoose.model('proposta')
const Documento = mongoose.model('documento')
const Compra = mongoose.model('compra')
const Posvenda = mongoose.model('posvenda')
const Fornecedor = mongoose.model('fornecedor')
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

// var caminho = __dirname
// caminho = caminho.replace('routes', '')
//console.log('caminho=>'+caminho)
// caminho = caminho + 'public/arquivos/'
// router.use('/public/arquivos', express.static(caminho))
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/arquivos')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    },
})
const upload = multer({ storage: storage })

// router.use(express.static(path.join(__dirname, 'public')))


router.get('/confirmaexclusao/:id', ehAdmin, (req, res) => {
    Proposta.findOne({ _id: req.params.id }).lean().then((proposta) => {
        res.render('principal/confirmaexclusao', { proposta })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar a proposta')
        res.redirect('/gerenciamento/consulta')
    })
})

router.get('/remover/:id', ehAdmin, (req, res) => {
    var erros = []

    Proposta.findOne({ _id: req.params.id }).lean().then((proposta) => {
        if (proposta.ganho == false) {
            Proposta.findOneAndRemove({ _id: req.params.id }).then(() => {
                Documento.findOneAndRemove({ proposta: req.params.id }).then(() => {
                    Compra.findOneAndRemove({ proposta: req.params.id }).then(() => {
                        Posvenda.findOneAndRemove({ proposta: req.params.id }).then(() => {
                            Vistoria.findOneAndRemove({ proposta: req.params.id }).then(() => {
                                Equipe.findOneAndRemove({ _id: proposta.equipe }).then(() => {

                                    req.flash('success_msg', 'Proposta removida com sucesso.')
                                    res.redirect('/menu')

                                }).catch(() => {
                                    req.flash('error_msg', 'Não foi possível remover a equipe da proposta.')
                                    res.redirect('/proposta/consulta')
                                })
                            }).catch(() => {
                                req.flash('error_msg', 'Não foi possível remover a vistoria da proposta.')
                                res.redirect('/proposta/consulta')
                            })
                        }).catch(() => {
                            req.flash('error_msg', 'Não foi possível remover o pos venda da proposta.')
                            res.redirect('/projeto/consulta')
                        })
                    }).catch(() => {
                        req.flash('error_msg', 'Não foi possível remover as compras da proposta.')
                        res.redirect('/projeto/consulta')
                    })
                }).catch(() => {
                    req.flash('error_msg', 'Não foi possível remover os documntos da proposta.')
                    res.redirect('/projeto/consulta')
                })
            }).catch(() => {
                req.flash('error_msg', 'Não foi possível remover a proposta.')
                res.redirect('/projeto/consulta')
            })
        }
    })
})

router.get('/selecao', ehAdmin, (req, res) => {

    var id
    const { _id } = req.user
    const { user } = req.user

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }

    var enviado = []
    var negociando = []
    var baixado = []
    var ganho = []
    var hoje = dataHoje()
    var mes = hoje.substring(5, 7)
    var ano = hoje.substring(0, 4)
    var dataini = String(ano) + String(mes) + '01'
    var datafim = String(ano) + String(mes) + '31'
    var cliente
    var q = 0

    var trintaeum = false
    var bisexto = false
    var mestitulo
    var ano
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

    switch (String(mes)) {
        case '01':
            janeiro = 'active'
            mestitulo = 'Janeiro'
            trintaeum = true
            break;
        case '02':
            fevereiro = 'active'
            mestitulo = 'Fevereiro'
            bisexto = true
            break;
        case '03':
            marco = 'active'
            mestitulo = 'Março'
            trintaeum = true
            break;
        case '04':
            abril = 'active'
            mestitulo = 'Abril'
            break;
        case '05':
            maio = 'active'
            mestitulo = 'Maio'
            trintaeum = true
            break;
        case '06':
            junho = 'active'
            mestitulo = 'Junho'
            break;
        case '07':
            julho = 'active'
            mestitulo = 'Julho'
            trintaeum = true
            break;
        case '08':
            agosto = 'active'
            mestitulo = 'Agosto'
            trintaeum = true
            break;
        case '09':
            setembro = 'active'
            mestitulo = 'Setembro'
            break;
        case '10':
            outubro = 'active'
            mestitulo = 'Outubro'
            trintaeum = true
            break;
        case '11':
            novembro = 'active'
            mestitulo = 'Novembro'
            break;
        case '12':
            dezembro = 'active'
            mestitulo = 'Dezembro'
            trintaeum = true
            break;
    }

    Proposta.find({ user: id }).then((proposta) => {
        //
        if (naoVazio(proposta)) {
            proposta.forEach((e) => {
                //console.log('e._id=>' + e._id)
                //console.log('e.status=>' + e.status)
                //console.log('e.baixada=>' + e.baixada)
                //console.log('e.ganho=>' + e.ganho)
                //console.log('e.ganho=>' + e.ganho)
                Cliente.findOne({ _id: e.cliente }).then((cli) => {
                    q++
                    cliente = cli.nome
                    if (e.status == 'Enviado' && e.ganho == false && naoVazio(e.motivo) == false) {
                        enviado.push({ id: e._id, cliente, seq: e.seq, status: e.status })
                    }
                    if (e.data < datafim && e.data > dataini) {
                        if (e.ganho == true) {
                            ganho.push({ id: e._id, cliente, seq: e.seq, status: e.status })
                        } else {
                            if (e.baixada == true) {
                                baixado.push({ id: e._id, cliente, seq: e.seq, status: e.status, motivo: e.motivo })
                            } else {
                                if (e.status == 'Negociando' || e.status == 'Analisando Financiamento' || e.status == 'Comparando Propostas' || e.status == 'Aguardando redução de preço') {
                                    negociando.push({ id: e._id, cliente, seq: e.seq, status: e.status })
                                }

                            }
                        }
                    }

                    // console.log('enviado=>'+JSON.stringify(enviado))
                    // console.log('baixado=>'+JSON.stringify(baixado))
                    // console.log('negociando=>'+JSON.stringify(negociando))
                    // console.log('ganho=>'+JSON.stringify(ganho))

                    // console.log("q=>"+q)
                    // console.log("proposta.length=>"+proposta.length)
                    if (q == proposta.length) {
                        res.render('principal/selecao', {
                            enviado, negociando, ganho, baixado, mestitulo, ano,
                            janeiro, fevereiro, marco, abril, maio, junho, julho, agosto, setembro, outubro, novembro, dezembro
                        })
                    }
                }).catch((err) => {
                    req.flash('error_msg', 'Falha ao encontrar o cliente.')
                    res.redirect('/')
                })
            })
        } else {
            res.render('principal/selecao', {
                enviado, negociando, ganho, baixado, mestitulo, ano,
                janeiro, fevereiro, marco, abril, maio, junho, julho, agosto, setembro, outubro, novembro, dezembro
            })
        }
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar a proposta<gs>.')
        res.redirect('/')
    })
})

router.get('/consulta', ehAdmin, (req, res) => {
    var id
    var sql_pro
    var sql_pes
    const { _id } = req.user
    const { user } = req.user
    const { pessoa } = req.user
    if (naoVazio(user)) {
        id = user
        sql_pro = { user: id, responsvel: pessoa }
        sql_pes = { _id: pessoa }
    } else {
        id = _id
        sql_pro = { user: id }
        sql_pes = { user: id, funges: 'checked' }
    }

    var status = ''
    var lista = []
    var q = 0
    var dtcadastro = '00000000'
    var dtinicio = '0000-00-00'
    var dtfim = '0000-00-00'
    var responsavel
    var nome_insres


    Cliente.find({ user: id }).lean().then((todos_clientes) => {
        Pessoa.find(sql_pes).lean().then((todos_responsaveis) => {
            Empresa.find({ user: id }).lean().then((todas_empresas) => {
                Proposta.find(sql_pro).sort({ 'datacad': 'asc' }).then((proposta) => {
                    //console.log('proposta._id=>'+proposta._id)
                    if (proposta != '') {
                        proposta.forEach((e) => {
                            Cliente.findOne({ _id: e.cliente }).then((lista_cliente) => {
                                Equipe.findOne({ _id: e.equipe }).then((equipe) => {
                                    Pessoa.findOne({ _id: equipe.insres }).then((insres) => {
                                        Pessoa.findOne({ _id: e.responsavel }).then((lista_responsavel) => {
                                            Documento.findOne({ proposta: e._id }).then((documento) => {
                                                Compra.findOne({ proposta: e._id }).then((compra) => {
                                                    Vistoria.findOne({ proposta: e._id }).then((vistoria) => {
                                                        Posvenda.findOne({ proposta: e._id }).then((posvenda) => {
                                                            q++
                                                            //console.log('e.datacad=>' + e.datacad)
                                                            if (naoVazio(e.datacad)) {
                                                                dtcadastro = e.datacad
                                                            } else {
                                                                dtcadastro = '00000000'
                                                            }

                                                            if (e.ganho == true) {
                                                                if (e.encerrado == true) {
                                                                    status = 'Encerrado'
                                                                    dtinicio = equipe.dtinicio
                                                                    dtfim = equipe.dtfim
                                                                } else {
                                                                    if (posvenda.feito == true) {
                                                                        status = 'Pós-Venda'
                                                                        dtinicio = equipe.dtinicio
                                                                        dtfim = equipe.dtfim
                                                                    } else {
                                                                        if (documento.feitofaturado == true) {
                                                                            status = 'Faturado'
                                                                            dtinicio = equipe.dtinicio
                                                                            dtfim = equipe.dtfim
                                                                        } else {
                                                                            if (documento.feitoalmox == true) {
                                                                                status = 'Almoxarifado Fechado'
                                                                                dtinicio = equipe.dtinicio
                                                                                dtfim = equipe.dtfim
                                                                            } else {
                                                                                if (documento.enviaalmox == true) {
                                                                                    status = 'Almoxarifado Em Aberto'
                                                                                    dtinicio = equipe.dtinicio
                                                                                    dtfim = equipe.dtfim
                                                                                } else {
                                                                                    if (equipe.feito == true) {
                                                                                        status = 'Execução a Campo'
                                                                                        dtinicio = equipe.dtinicio
                                                                                        dtfim = equipe.dtfim
                                                                                    } else {
                                                                                        if (documento.protocolado == true) {
                                                                                            status = 'Protocolado'
                                                                                        } else {
                                                                                            if (documento.feitotrt == true) {
                                                                                                status = 'TRT'
                                                                                            } else {
                                                                                                if (compra.feitonota == true) {
                                                                                                    status = 'NF'
                                                                                                } else {
                                                                                                    if (compra.feitopedido == true) {
                                                                                                        status = 'Pedido'
                                                                                                    } else {
                                                                                                        if (e.assinado == true) {
                                                                                                            status = 'Contrato'
                                                                                                        } else {
                                                                                                            if (e.feito == true) {
                                                                                                                status = 'Visita'
                                                                                                            } else {
                                                                                                                status = 'Preparado para a Visita'
                                                                                                            }
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            } else {
                                                                if (e.baixada == false) {
                                                                    status = 'Proposta Enviada'
                                                                } else {
                                                                    status = 'Baixado'
                                                                }
                                                            }

                                                            if (typeof dtfim == 'undefined') {
                                                                dtfim = '0000-00-00'
                                                            }
                                                            if (typeof dtinicio == 'undefined') {
                                                                dtinicio = '0000-00-00'
                                                            }

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
                                                            //console.log('responsavel=>' + responsavel)
                                                            //console.log('q=>' + q)
                                                            //console.log('proposta.length=>' + proposta.length)

                                                            lista.push({ s: status, id: e._id, seq: e.seq, cliente: lista_cliente.nome, responsavel, nome_insres, cadastro: dataMsgNum(dtcadastro), inicio: dataMensagem(dtinicio), fim: dataMensagem(dtfim) })
                                                            if (q == proposta.length) {
                                                                res.render('principal/consulta', { lista, todos_clientes, todos_responsaveis, todas_empresas })
                                                            }
                                                        }).catch((err) => {
                                                            req.flash('error_msg', 'Nenhum pós venda encontrado.')
                                                            res.redirect('/gerenciamento/consulta')
                                                        })
                                                    }).catch((err) => {
                                                        req.flash('error_msg', 'Nenhuma vistoria encontrada.')
                                                        res.redirect('/gerenciamento/consulta')
                                                    })
                                                }).catch((err) => {
                                                    req.flash('error_msg', 'Nenhuma compra encontrada.')
                                                    res.redirect('/gerenciamento/consulta')
                                                })
                                            }).catch((err) => {
                                                req.flash('error_msg', 'Nenhum documento encontrado.')
                                                res.redirect('/gerenciamento/consulta')
                                            })
                                        }).catch((err) => {
                                            req.flash('error_msg', 'Nenhuma responsável pela gestão encontrado.')
                                            res.redirect('/gerenciamento/consulta')
                                        })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Nenhum técnico responsável encontrado.')
                                        res.redirect('/gerenciamento/consulta')
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Nenhuma equipe encontrada.')
                                    res.redirect('/gerenciamento/consulta')
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Nenhum cliente encontrado.')
                                res.redirect('/gerenciamento/consulta')
                            })
                        })
                    } else {
                        res.render('principal/consulta', { lista, todos_clientes, todos_responsaveis })
                    }
                }).catch((err) => {
                    req.flash('error_msg', 'Nenhuma proposta encontrada.')
                    res.redirect('/gerenciamento/consulta')
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
        req.flash('error_msg', 'Nenhum cliente encontrada.')
        res.redirect('/gerenciamento/consulta')
    })
})

router.get('/consulta/:tipo', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }

    var listaOrcado = []
    var listaAberto = []
    var listaEncerrado = []
    var listaBaixado = []
    var dtcadastro = '00000000'
    var responsavel = ''
    var nome_insres = ''
    var q = 0

    Cliente.find({ user: id }).lean().then((todos_clientes) => {
        Pessoa.find({ user: id, funges: 'checked' }).lean().then((todos_responsaveis) => {
            Empresa.find({ user: id }).lean().then((todas_empresas) => {
                Proposta.find({ user: id }).sort({ 'data': 'asc' }).then((proposta) => {
                    if (proposta != '') {
                        proposta.forEach((e) => {
                            Cliente.findOne({ _id: e.cliente }).then((lista_cliente) => {
                                Equipe.findOne({ _id: e.equipe }).then((equipe) => {
                                    Pessoa.findOne({ _id: e.responsavel }).then((lista_responsavel) => {
                                        Pessoa.findOne({ _id: equipe.insres }).then((insres) => {
                                            q++
                                            if (naoVazio(e.datacad)) {
                                                dtcadastro = e.datacad
                                            } else {
                                                dtcadastro = '00000000'
                                            }

                                            if (naoVazio(lista_responsavel)) {
                                                responsavel = lista_responsavel.nome
                                            } else {
                                                responsavel = ''
                                            }
                                            //console.log('resposanvel1=>' + responsavel)

                                            if (naoVazio(insres)) {
                                                nome_insres = insres.nome
                                            } else {
                                                nome_insres = ''
                                            }
                                            //console.log('nome_insres=>' + nome_insres)
                                            //console.log('resposanvel2=>' + responsavel)
                                            if (e.baixada == true) {
                                                listaBaixado.push({ id: e._id, seq: e.seq, motivo: e.motivo, dtbaixa: dataMensagem(e.dtbaixa), cliente: lista_cliente.nome, responsavel, cadastro: dataMsgNum(dtcadastro) })
                                            } else {
                                                if (e.feito == true && e.ganho == false && e.encerrado == false) {
                                                    listaOrcado.push({ id: e._id, seq: e.seq, cliente: lista_cliente.nome, responsavel, nome_insres, cadastro: dataMsgNum(dtcadastro), inicio: dataMensagem(equipe.dtinicio), fim: dataMensagem(equipe.dtfim) })
                                                } else {
                                                    if (e.feito == true && e.ganho == true && e.encerrado == false) {
                                                        listaAberto.push({ id: e._id, seq: e.seq, cliente: lista_cliente.nome, responsavel, nome_insres, cadastro: dataMsgNum(dtcadastro), inicio: dataMensagem(equipe.dtinicio), fim: dataMensagem(equipe.dtfim) })
                                                    } else {
                                                        listaEncerrado.push({ id: e._id, seq: e.seq, cliente: lista_cliente.nome, responsavel, nome_insres, cadastro: dataMsgNum(dtcadastro), inicio: dataMensagem(equipe.dtinicio), fim: dataMensagem(equipe.dtfim) })
                                                    }
                                                }
                                            }

                                            //console.log('q=>' + q)
                                            //console.log('req.params.tipo=>' + req.params.tipo)
                                            if (q == proposta.length) {
                                                if (req.params.tipo == 'baixado') {
                                                    res.render('principal/consulta', { listaBaixado, todos_clientes, todos_responsaveis, todas_empresas, tipo: 'baixado', titulo: ': Proposta Baixas' })
                                                } else {
                                                    if (req.params.tipo == 'orcado') {
                                                        res.render('principal/consulta', { listaOrcado, todos_clientes, todos_responsaveis, todas_empresas, tipo: 'orcado', titulo: ': Propostas Enviadas' })
                                                    } else {
                                                        if (req.params.tipo == 'aberto') {
                                                            res.render('principal/consulta', { listaAberto, todos_clientes, todos_responsaveis, todas_empresas, tipo: 'aberto', titulo: ': Em Aberto' })
                                                        } else {
                                                            res.render('principal/consulta', { listaEncerrado, todos_clientes, todos_responsaveis, todas_empresas, tipo: 'encerrado', titulo: ': Encerrado' })
                                                        }
                                                    }
                                                }
                                            }

                                        }).catch((err) => {
                                            req.flash('error_msg', 'Nenhum técnico responsável encontrado.')
                                            res.redirect('/gerenciamento/consulta')
                                        })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Nenhum gestor responsável encontrado.')
                                        res.redirect('/gerenciamento/consulta')
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Nenhumaa equipe encontrada.')
                                    res.redirect('/gerenciamento/consulta')
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Nenhuma cliente encontrado.')
                                res.redirect('/gerenciamento/consulta')
                            })
                        })
                    } else {
                        if (req.params.tipo == 'orcado') {
                            res.render('principal/consulta', { todos_clientes, todos_responsaveis, todas_empresas, tipo: 'orcado', titulo: ': Orçamentos Enviados' })
                        } else {
                            if (req.params.tipo == 'aberto') {
                                res.render('principal/consulta', { todos_clientes, todos_responsaveis, todas_empresas, tipo: 'aberto', titulo: ': Em Aberto' })
                            } else {
                                res.render('principal/consulta', { todos_clientes, todos_responsaveis, todas_empresas, tipo: 'encerrado', titulo: ': Encerrado' })
                            }
                        }
                    }
                }).catch((err) => {
                    req.flash('error_msg', 'Nenhuma proposta encontrado<todas>')
                    res.redirect('/gerenciamento/consulta')
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

router.get('/livro/:id', ehAdmin, (req, res) => {
    Proposta.findOne({ _id: req.params.id }).lean().then((proposta) => {
        //console.log('projeto=>' + projeto)
        Cliente.findOne({ _id: proposta.cliente }).lean().then((cliente_proposta) => {
            Empresa.findOne({ _id: proposta.empresa }).lean().then((emp_proposta) => {
                Pessoa.findOne({ _id: proposta.responsavel }).lean().then((res_proposta) => {
                    Vistoria.findOne({ proposta: req.params.id }).lean().then((vistoria) => {
                        Documento.findOne({ proposta: req.params.id }).lean().then((documento) => {
                            Compra.findOne({ proposta: req.params.id }).lean().then((compra) => {
                                Equipe.findOne({ _id: proposta.equipe }).lean().then((lista_equipe) => {
                                    Pessoa.findOne({ _id: lista_equipe.insres }).lean().then((tec_proposta) => {
                                        Posvenda.findOne({ proposta: proposta._id }).lean().then((posvenda) => {
                                            res.render('principal/livro', { proposta, cliente_proposta, emp_proposta, tec_proposta, res_proposta, vistoria, documento, compra, lista_equipe, posvenda })
                                        }).catch((err) => {
                                            req.flash('error_msg', 'Nenhum pós venda encontrado.')
                                            res.redirect('/gerenciamento/consulta')
                                        })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Nenhum técnico responsável encontrado.')
                                        res.redirect('/gerenciamento/consulta')
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Nenhuma equipe encontrada.')
                                    res.redirect('/gerenciamento/consulta')
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Nenhuma compra encontrada.')
                                res.redirect('/gerenciamento/consulta')
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Nenhum documento encontrado.')
                            res.redirect('/gerenciamento/consulta')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Nenhuma vistoria encontrada.')
                        res.redirect('/gerenciamento/consulta')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Nenhum gestor responsável encontrado.')
                    res.redirect('/gerenciamento/consulta')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Nenhuma equipe encontrada.')
                res.redirect('/gerenciamento/consulta')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Nenhuma vistoria encontrada.')
            res.redirect('/gerenciamento/consulta')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Nenhuma proposta encontrada.')
        res.redirect('/gerenciamento/consulta')
    })
})

router.get('/confirmabaixa/:id', ehAdmin, (req, res) => {
    Proposta.findOne({ _id: req.params.id }).lean().then((proposta) => {
        res.render('principal/confirmabaixa', { proposta })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar a proposta.')
        res.redirect('/menu')
    })
})

router.get('/confirmastatus/:id', ehAdmin, (req, res) => {
    Proposta.findOne({ _id: req.params.id }).lean().then((proposta) => {
        res.render('principal/confirmastatus', { proposta })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar a proposta.')
        res.redirect('/menu')
    })
})

router.get('/emandamento/:tipo', ehAdmin, (req, res) => {
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
    var mesinicio
    var diainicio
    var diainicio
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
    var meshoje = hoje.substring(5,)
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

    Cliente.find({ user: id }).lean().then((todos_clientes) => {
        Pessoa.find({ user: id, funges: 'checked' }).lean().then((todos_responsaveis) => {
            Empresa.find({ user: id }).lean().then((todas_empresas) => {
                Equipe.find({ user: id, feito: true, liberar: true, prjfeito: false, $and: [{ 'dtinicio': { $ne: '' } }, { 'dtinicio': { $ne: '0000-00-00' } }] }).then((conta_equipe) => {
                    if (naoVazio(conta_equipe)) {
                        conta_equipe.forEach((e) => {
                            //console.log('e._id=>'+e._id)
                            Proposta.findOne({ user: id, equipe: e._id, ganho: true, encerrado: false }).then((proposta) => {
                                //console.log('proposta.cliente=>' + proposta.cliente)
                                Cliente.findOne({ _id: proposta.cliente }).then((cliente) => {
                                    //console.log('proposta.responsavel=>' + proposta.responsavel)
                                    Pessoa.findOne({ _id: proposta.responsavel }).then((pessoa_res) => {
                                        //console.log('equipe._id=>'+equipe._id)
                                        //console.log('e.insres=>' + e.insres)
                                        Pessoa.findOne({ _id: e.insres }).then((insres) => {
                                            q++
                                            //console.log('proposta.datacad=>' + proposta.datacad)
                                            //console.log('e._id=>' + e._id)
                                            if (naoVazio(proposta.datacad)) {
                                                dtcadastro = proposta.datacad
                                            } else {
                                                dtcadastro = '00000000'
                                            }

                                            //console.log('pessoa_res=>' + pessoa_res)
                                            if (naoVazio(pessoa_res)) {
                                                responsavel = pessoa_res.nome
                                            } else {
                                                responsavel = ''
                                            }

                                            if (naoVazio(insres)) {
                                                nome_insres = insres.nome
                                            } else {
                                                nome_insres = ''
                                            }

                                            //console.log('e.dtinicio=>'+e.dtinicio)
                                            //console.log('e.dtfim=>'+e.dtfim)
                                            dtinicio = e.dtinicio
                                            dtfim = e.dtfim
                                            anoinicio = dtinicio.substring(0, 4)
                                            anofim = dtfim.substring(0, 4)
                                            mesinicio = dtinicio.substring(5,)
                                            mesfim = dtfim.substring(5,)
                                            diainicio = dtinicio.substring(8, 11)
                                            diafim = dtfim.substring(8, 11)
                                            //console.log('dif1=>' + dif1)
                                            // compara = mesfim - mesinicio
                                            //console.log('meshoje=>' + meshoje)
                                            //console.log('mesinicio=>' + mesinicio)
                                            //console.log('anotitulo=>' + anotitulo)
                                            //console.log('anoinicio=>' + anoinicio)
                                            //console.log('compara')                                          
                                            // if (compara > 0) {
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

                                            // } else {
                                            //console.log('menor que zero')
                                            //     dif = parseFloat(dif1)
                                            //     if (diainicio < 10) {
                                            //         dia = '0' + parseFloat(diainicio)
                                            //     } else {
                                            //         dia = parseFloat(diainicio)
                                            //     }
                                            //     mes = mesinicio
                                            // }


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

                                            //console.log('dif=>'+dif)

                                            for (i = 0; i < dif; i++) {
                                                //console.log('dia=>' + dia)
                                                //console.log('entrou laço')
                                                if (meshoje == mes) {
                                                    switch (String(dia)) {
                                                        case '01':
                                                            dia01.push({ id: proposta._id, cliente: cliente.nome, cor: color })
                                                            break;
                                                        case '02':
                                                            dia02.push({ id: proposta._id, cliente: cliente.nome, cor: color })
                                                            break;
                                                        case '03':
                                                            dia03.push({ id: proposta._id, cliente: cliente.nome, cor: color })
                                                            break;
                                                        case '04':
                                                            dia04.push({ id: proposta._id, cliente: cliente.nome, cor: color })
                                                            break;
                                                        case '05':
                                                            dia05.push({ id: proposta._id, cliente: cliente.nome, cor: color })
                                                            break;
                                                        case '06':
                                                            dia06.push({ id: proposta._id, cliente: cliente.nome, cor: color })
                                                            break;
                                                        case '07':
                                                            dia07.push({ id: proposta._id, cliente: cliente.nome, cor: color })
                                                            break;
                                                        case '08':
                                                            dia08.push({ id: proposta._id, cliente: cliente.nome, cor: color })
                                                            break;
                                                        case '09':
                                                            dia09.push({ id: proposta._id, cliente: cliente.nome, cor: color })
                                                            break;
                                                        case '10':
                                                            dia10.push({ id: proposta._id, cliente: cliente.nome, cor: color })
                                                            break;
                                                        case '11':
                                                            dia11.push({ id: proposta._id, cliente: cliente.nome, cor: color })
                                                            break;
                                                        case '12':
                                                            dia12.push({ id: proposta._id, cliente: cliente.nome, cor: color })
                                                            break;
                                                        case '13':
                                                            dia13.push({ id: proposta._id, cliente: cliente.nome, cor: color })
                                                            break;
                                                        case '14':
                                                            dia14.push({ id: proposta._id, cliente: cliente.nome, cor: color })
                                                            break;
                                                        case '15':
                                                            dia15.push({ id: proposta._id, cliente: cliente.nome, cor: color })
                                                            break;
                                                        case '16':
                                                            dia16.push({ id: proposta._id, cliente: cliente.nome, cor: color })
                                                            break;
                                                        case '17':
                                                            dia17.push({ id: proposta._id, cliente: cliente.nome, cor: color })
                                                            break;
                                                        case '18':
                                                            dia18.push({ id: proposta._id, cliente: cliente.nome, cor: color })
                                                            break;
                                                        case '19':
                                                            dia19.push({ id: proposta._id, cliente: cliente.nome, cor: color })
                                                            break;
                                                        case '20':
                                                            dia20.push({ id: proposta._id, cliente: cliente.nome, cor: color })
                                                            break;
                                                        case '21':
                                                            dia21.push({ id: proposta._id, cliente: cliente.nome, cor: color })
                                                            break;
                                                        case '22':
                                                            dia22.push({ id: proposta._id, cliente: cliente.nome, cor: color })
                                                            break;
                                                        case '23':
                                                            dia23.push({ id: proposta._id, cliente: cliente.nome, cor: color })
                                                            break;
                                                        case '24':
                                                            dia24.push({ id: proposta._id, cliente: cliente.nome, cor: color })
                                                            break;
                                                        case '25':
                                                            dia25.push({ id: proposta._id, cliente: cliente.nome, cor: color })
                                                            break;
                                                        case '26':
                                                            dia26.push({ id: proposta._id, cliente: cliente.nome, cor: color })
                                                            break;
                                                        case '27':
                                                            dia27.push({ id: proposta._id, cliente: cliente.nome, cor: color })
                                                            break;
                                                        case '28':
                                                            dia28.push({ id: proposta._id, cliente: cliente.nome, cor: color })
                                                            break;
                                                        case '29':
                                                            dia29.push({ id: proposta._id, cliente: cliente.nome, cor: color })
                                                            break;
                                                        case '30':
                                                            dia30.push({ id: proposta._id, cliente: cliente.nome, cor: color })
                                                            break;
                                                        case '31':
                                                            dia31.push({ id: proposta._id, cliente: cliente.nome, cor: color })
                                                            break;
                                                    }
                                                    dia++
                                                    if (dia < 10) {
                                                        dia = '0' + dia
                                                    }
                                                    //console.log('dia=>' + dia)
                                                }
                                            }


                                            listaAndamento.push({ id: proposta._id, seq: proposta.seq, cliente: cliente.nome, responsavel, nome_insres, cadastro: dataMsgNum(dtcadastro), dtinicio: dataMensagem(dtinicio), deadline: dataMensagem(dtfim) })

                                            //console.log('q=>' + q)
                                            //console.log('conta_equipe.length=>' + conta_equipe.length)
                                            if (q == conta_equipe.length) {
                                                if (req.params.tipo == 'lista') {
                                                    caminho = 'principal/emandamento'
                                                } else {
                                                    caminho = 'principal/vermais'
                                                }

                                                //console.log('caminho=>' + caminho)

                                                res.render(caminho, {
                                                    dia01, dia02, dia03, dia04, dia05, dia06, dia07, dia08, dia09, dia10,
                                                    dia11, dia12, dia13, dia14, dia15, dia16, dia17, dia18, dia19, dia20,
                                                    dia21, dia22, dia23, dia24, dia25, dia26, dia27, dia28, dia29, dia30, dia31,
                                                    mestitulo, anotitulo, trintaeum, bisexto, todasCores, listaAndamento,
                                                    janeiro, fevereiro, marco, abril, maio, junho, julho, agosto, setembro, outubro, novembro, dezembro,
                                                    todos_responsaveis, todos_clientes, todas_empresas, anotitulo
                                                })

                                            }
                                        }).catch((err) => {
                                            req.flash('error_msg', 'Falha ao encontrar o técnico responsável.')
                                            res.redirect('/menu')
                                        })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Falha ao encontrar o gestor responsável.')
                                        res.redirect('/menu')
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Falha ao encontrar o cliente.')
                                    res.redirect('/menu')
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Falha ao encontrar a proposta<gea>.')
                                res.redirect('/menu')
                            })
                        })
                    } else {
                        req.flash('error_msg', 'Não existem projetos com instalação em andamento.')
                        res.redirect('/menu')
                    }
                }).catch((err) => {
                    req.flash('error_msg', 'Falha ao encontrar a equipe.')
                    res.redirect('/menu')
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
    Proposta.findOne({ _id: req.params.id }).lean().then((proposta) => {
        if (naoVazio(proposta)) {
            Cliente.findOne({ _id: proposta.cliente }).lean().then((cliente) => {
                Equipe.findOne({ _id: proposta.equipe }).lean().then((equipe) => {
                    Pessoa.findOne({ _id: proposta.responsavel }).lean().then((responsavel) => {
                        Pessoa.findOne({ _id: equipe.insres }).lean().then((insres) => {
                            res.render('principal/mostraEquipe', { proposta, equipe, cliente, responsavel, insres })
                        }).catch((err) => {
                            req.flash('error_msg', 'Falha ao encontrar o instalador responsável.')
                            res.redirect('/menu')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Falha ao encontrar o responsável.')
                        res.redirect('/menu')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Falha ao encontrar a equipe.')
                    res.redirect('/menu')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao encontrar o cliente.')
                res.redirect('/menu')
            })
        } else {
            var realizar
            console.log('mostrar tarefa')
            Tarefa.findOne({ _id: req.params.id }).lean().then((tarefa) => {
                //console.log(tarefa)
                if (naoVazio(tarefa)) {
                    Cliente.findOne({ _id: tarefa.cliente }).lean().then((cliente) => {
                        Equipe.findOne({ _id: tarefa.equipe }).lean().then((equipe) => {
                            Pessoa.findOne({ _id: tarefa.responsavel }).lean().then((tecnico) => {
                                realizar = equipe.feito
                                Pessoa.findOne({ _id: tarefa.gestor }).lean().then((gestor) => {
                                    res.render('principal/mostraEquipe', { realizar, tarefa, equipe, cliente, tecnico, gestor })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Falha ao encontrar o gestor responsável.')
                                    res.redirect('/menu')
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Falha ao encontrar o tecnico responsável.')
                                res.redirect('/menu')
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Falha ao encontrar a equipe.')
                            res.redirect('/menu')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Falha ao encontrar o cliente.')
                        res.redirect('/menu')
                    })
                } else {
                    req.flash('error_msg', 'Equipe não formada.')
                    res.redirect('/menu')
                }
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao encontrar a tarefa.')
                res.redirect('/menu')
            })
        }
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar a proposta<me>.')
        res.redirect('/menu')
    })
})

router.get('/realizar/:id', ehAdmin, (req, res) => {
    Tarefa.findOne({ _id: req.params.id }).then((tarefa) => {
        Equipe.findOne({ _id: tarefa.equipe }).then((equipe) => {
            equipe.feito = true
            equipe.save().then(() => {
                tarefa.concluido = true
                tarefa.dataentrega = dataBusca(dataHoje())
                tarefa.save().then(() => {
                    res.redirect('/gerenciamento/mostraEquipe/' + tarefa._id)
                }).catch((err) => {
                    req.flash('error_msg', 'Falha ao salvar a tarefa.')
                    res.redirect('/menu')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao salvar a equipe.')
                res.redirect('/menu')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao encontrar a equipe.')
            res.redirect('/menu')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar a tarefa.')
        res.redirect('/menu')
    })
})

router.get('/atva/:id', ehAdmin, (req, res) => {
    var check = false
    var img = []
    var lista_imagens = []

    Proposta.findOne({ _id: req.params.id }).lean().then((proposta) => {
        //console.log('proposta=>' + proposta)
        AtvAterramento.findOne({ proposta: req.params.id }).lean().then((atva) => {
            img = atva.caminhoFoto
            img.forEach((e) => {
                lista_imagens.push({ imagem: e.desc, atv: 'aterramento', id: req.params.id, proposta: true, ehatv: false })
            })
            if (atva.aprova == true) {
                check = 'checked'
            }
            res.render('principal/mostrarFotos', { atva, check, lista_imagens, proposta, esconde: true })
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível encontrar a atividade de aterramento.')

            res.redirect('/gerenciamento/mostraEquipe/' + req.params.id)
        })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar a proposta.')
        res.redirect('/gerenciamento/mostraEquipe/' + req.body.id)
    })
})

router.get('/atvi/:id', ehAdmin, (req, res) => {
    var check = false
    var img = []
    var lista_imagens = []

    Proposta.findOne({ _id: req.params.id }).lean().then((proposta) => {
        //console.log('proposta=>' + proposta)
        AtvInversor.findOne({ proposta: req.params.id }).lean().then((atvi) => {
            img = atvi.caminhoFoto
            img.forEach((e) => {
                lista_imagens.push({ imagem: e.desc, atv: 'inversor', id: req.params.id, proposta: true, ehatv: false })
            })
            if (atvi.aprova == true) {
                check = 'checked'
            }
            res.render('principal/mostrarFotos', { atvi, check, lista_imagens, proposta, esconde: true })
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível encontrar a atividade de instalação do inversor.')

            res.redirect('/gerenciamento/mostraEquipe/' + req.params.id)
        })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar a proposta.')
        res.redirect('/gerenciamento/mostraEquipe/' + req.body.id)
    })
})

router.get('/atvt/:id', ehAdmin, (req, res) => {
    var check
    var img = []
    var lista_imagens = []

    Proposta.findOne({ _id: req.params.id }).lean().then((proposta) => {
        //console.log('proposta=>' + proposta)
        AtvTelhado.findOne({ proposta: req.params.id }).lean().then((atvt) => {
            img = atvt.caminhoFoto
            img.forEach((e) => {
                lista_imagens.push({ imagem: e.desc, atv: 'telhado', id: req.params.id, atv: 'telhado', proposta: true, ehatv: false })
            })
            console.log('aprova=>' + atvt.aprova)
            if (atvt.aprova == true) {
                check = 'checked'
            }
            res.render('principal/mostrarFotos', { atvt, check, lista_imagens, proposta, esconde: true })
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível encontrar a atividade de instalação das estrurturas e módulos no telhado.')

            res.redirect('/gerenciamento/mostraEquipe/' + req.params.id)
        })

    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar a proposta.')
        res.redirect('/gerenciamento/mostraEquipe/' + req.body.id)
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
                    res.redirect('/menu')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Não foi possível encontrar o responsável.')
                res.redirect('/menu')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível encontrar clientes cadastrados.')
            res.redirect('/menu')
        })
    } else {
        res.render('principal/proposta', { tipo: true })
    }
})

router.get('/proposta/:id', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id
    var mostraLabel = ''
    var mostraSelect = 'none'

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }
    Proposta.findOne({ _id: req.params.id }).lean().then((proposta) => {
        Projeto.findOne({ proposta: req.params.id }).lean().then((projeto) => {
            //console.log('projeto=>' + projeto)
            Cliente.find({ user: id }).lean().then((todos_clientes) => {
                Pessoa.find({ user: id, funges: 'checked' }).lean().then((todos_responsaveis) => {
                    Empresa.find({ user: id }).lean().then((todas_empresas) => {
                        Cliente.findOne({ _id: proposta.cliente }).lean().then((cliente_proposta) => {
                            Empresa.findOne({ _id: proposta.empresa }).lean().then((emp_proposta) => {
                                Pessoa.findOne({ _id: proposta.responsavel }).lean().then((res_proposta) => {
                                    Vistoria.findOne({ proposta: req.params.id }).lean().then((vistoria) => {
                                        Documento.findOne({ proposta: req.params.id }).lean().then((documento) => {
                                            Compra.findOne({ proposta: req.params.id }).lean().then((compra) => {
                                                Equipe.findOne({ _id: proposta.equipe }).lean().then((lista_equipe) => {
                                                    Posvenda.findOne({ proposta: proposta._id }).lean().then((posvenda) => {
                                                        res.render('principal/proposta', { todos_clientes, cliente_proposta, todas_empresas, todos_responsaveis, res_proposta, emp_proposta, proposta, vistoria, documento, compra, lista_equipe, posvenda, projeto, mostraLabel, mostraSelect, tipo: proposta.ref })
                                                    }).catch((err) => {
                                                        req.flash('error_msg', 'Não foi possível encontrar o pós venda.')
                                                        res.redirect('/menu')
                                                    })
                                                }).catch((err) => {
                                                    req.flash('error_msg', 'Não foi possível encontrar a equipe.')
                                                    res.redirect('/menu')
                                                })
                                            }).catch((err) => {
                                                req.flash('error_msg', 'Não foi possível encontrar a compra.')
                                                res.redirect('/menu')
                                            })
                                        }).catch((err) => {
                                            req.flash('error_msg', 'Não foi possível encontrar o documento.')
                                            res.redirect('/menu')
                                        })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Não foi possível encontrar a vistoria da proposta.')
                                        res.redirect('/menu')
                                    })

                                }).catch((err) => {
                                    req.flash('error_msg', 'Não foi possível encontrar o responsável da proposta.')
                                    res.redirect('/menu')
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Não foi possível encontrar a empresa da proposta.')
                                res.redirect('/menu')
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Não foi possível encontrar o cliente da prosposta.')
                            res.redirect('/menu')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Não foi possível encontrar a empresa da proposta.')
                        res.redirect('/menu')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Não foi possível encontrar o responsável.')
                    res.redirect('/menu')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Não foi possível encontrar clientes cadastrados.')
                res.redirect('/menu')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível encontrar o projeto.')
            res.redirect('/menu')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar a proposta.')
        res.redirect('/menu')
    })
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
                res.redirect('/menu')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível encontrar o responsável.')
            res.redirect('/menu')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar clientes cadastrados.')
        res.redirect('/menu')
    })
})

router.get('/obra/:id', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id
    var mostraLabel = ''
    var mostraSelect = 'none'
    var q = 0
    var nome
    var ins_fora = []

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }
    Obra.findOne({ _id: req.params.id }).lean().then((obra) => {
        Cliente.find({ user: id }).lean().then((todos_clientes) => {
                Empresa.find({ user: id }).lean().then((todas_empresas) => {
                    Cliente.findOne({ _id: obra.cliente }).lean().then((cliente) => {
                        Pessoa.findOne({ _id: obra.responsavel }).lean().then((responsavel) => {
                            Empresa.findOne({ _id: obra.responsavel }).lean().then((empresa) => {
                                Pessoa.find({ user: id, $or: [{ 'funins': 'checked' }, { 'funele': 'checked' }] }).sort({ 'nome': 'asc' }).lean().then((instalacao) => {
                                    if (naoVazio(instalacao)) {
                                        instalacao.forEach((pesins) => {
                                            q++
                                            nome = pesins.nome
                                            ins_fora.push({ id: pesins._id, nome })
                                            if (q == instalacao.length) {
                                                Pessoa.find({ user: id, 'funges': 'checked' }).sort({ 'nome': 'asc' }).lean().then((todos_responsaveis) => {
                                                    //console.log('gestor=>' + gestor)
                                                    res.render('principal/obra', { todos_clientes, todos_responsaveis, todas_empresas, instalacao, obra, cliente, responsavel, empresa, tipo: false, mostraLabel, mostraSelect })
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
                                
                            }).catch((err) => {
                                req.flash('error_msg', 'Não foi possível encontrar a empresa da obra.')
                                res.redirect('/menu')
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Não foi possível encontrar o responsável da obra.')
                            res.redirect('/menu')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Não foi possível encontrar o cliene da obra.')
                        res.redirect('/menu')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Não foi possível encontrar a empresa.')
                    res.redirect('/menu')
                })
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível encontrar clientes cadastrados.')
            res.redirect('/menu')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar a obra cadastrada.')
        res.redirect('/menu')
    })
})

router.get('/visita/:id', ehAdmin, (req, res) => {
    Proposta.findOne({ _id: req.params.id }).lean().then((proposta) => {
        Cliente.findOne({ _id: proposta.cliente }).lean().then((cliente_proposta) => {
            Vistoria.findOne({ proposta: req.params.id }).lean().then((vistoria) => {
                Documento.findOne({ proposta: req.params.id }).lean().then((documento) => {
                    Compra.findOne({ proposta: req.params.id }).lean().then((compra) => {
                        Equipe.findOne({ _id: proposta.equipe }).lean().then((lista_equipe) => {
                            Posvenda.findOne({ proposta: proposta._id }).lean().then((posvenda) => {
                                var qs = 0
                                var qe = 0
                                var qi = 0
                                var qa = 0
                                var imgsomb = ''
                                var imgarea = ''
                                var imginsi = ''
                                var imginsa = ''
                                var somb = vistoria.caminhoSomb
                                var area = vistoria.caminhoArea
                                var insi = vistoria.caminhoInsi
                                var insa = vistoria.caminhoInsa
                                if (naoVazio(somb)) {
                                    somb.forEach((e) => {
                                        imgsomb = imgsomb + e.desc + ' | '
                                        qs++
                                    })
                                }
                                if (naoVazio(area)) {
                                    area.forEach((e) => {
                                        imgarea = imgarea + e.desc + ' | '
                                        qe++
                                    })
                                }
                                if (naoVazio(insi)) {
                                    insi.forEach((e) => {
                                        imginsi = imginsi + e.desc + ' | '
                                        qi++
                                    })
                                }
                                if (naoVazio(insa)) {
                                    insa.forEach((e) => {
                                        imginsa = imginsa + e.desc + ' | '
                                        qa++
                                    })
                                }
                                var datasomb = '0000-00-00'
                                var dataarea = '0000-00-00'
                                var datainsa = '0000-00-00'
                                var datainsi = '0000-00-00'
                                if (naoVazio(somb)) {
                                    datasomb = somb[qs - 1].data
                                }
                                if (naoVazio(area)) {
                                    dataarea = area[qe - 1].data
                                }
                                if (naoVazio(insi)) {
                                    datainsi = insi[qi - 1].data
                                }
                                if (naoVazio(insa)) {
                                    datainsa = insa[qa - 1].data
                                }
                                res.render('principal/visita', { imgsomb, imgarea, imginsi, imginsa, datasomb, dataarea, datainsi, datainsa, vistoria, cliente_proposta, proposta, documento, compra, lista_equipe, posvenda })
                            }).catch((err) => {
                                req.flash('error_msg', 'Não foi possível encontrar o pós venda.')
                                res.redirect('/menu')
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Não foi possível encontrar a equipe.')
                            res.redirect('/menu')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Não foi possível encontrar a compra.')
                        res.redirect('/menu')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Não foi possível encontrar o documento.')
                    res.redirect('/menu')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Não foi possível encontrar a vistoria.')
                res.redirect('/menu')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível encontrar o cliente da prosposta.')
            res.redirect('/menu')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar a proposta.')
        res.redirect('/menu')
    })
})

router.get('/assinatura/:id', ehAdmin, (req, res) => {
    Proposta.findOne({ _id: req.params.id }).lean().then((proposta) => {
        Cliente.findOne({ _id: proposta.cliente }).lean().then((cliente_proposta) => {
            Vistoria.findOne({ proposta: req.params.id }).lean().then((vistoria) => {
                Documento.findOne({ proposta: req.params.id }).lean().then((documento) => {
                    Compra.findOne({ proposta: req.params.id }).lean().then((compra) => {
                        Equipe.findOne({ _id: proposta.equipe }).lean().then((lista_equipe) => {
                            Posvenda.findOne({ proposta: proposta._id }).lean().then((posvenda) => {
                                res.render('principal/assinatura', { cliente_proposta, proposta, documento, vistoria, compra, lista_equipe, posvenda })
                            }).catch((err) => {
                                req.flash('error_msg', 'Não foi possível encontrar o pós venda.')
                                res.redirect('/menu')
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Não foi possível encontrar a compra.')
                            res.redirect('/menu')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Não foi possível encontrar a compra.')
                        res.redirect('/menu')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Não foi possível encontrar o documento.')
                    res.redirect('/menu')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Não foi possível encontrar a vistoria.')
                res.redirect('/menu')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível encontrar clientes cadastrados.')
            res.redirect('/menu')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar a proposta.')
        res.redirect('/menu')
    })
})

router.get('/compra/:id', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id
    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }

    Proposta.findOne({ _id: req.params.id }).lean().then((proposta) => {
        Cliente.findOne({ _id: proposta.cliente }).lean().then((cliente_proposta) => {
            Compra.findOne({ proposta: req.params.id }).lean().then((compra) => {
                Vistoria.findOne({ proposta: req.params.id }).lean().then((vistoria) => {
                    Documento.findOne({ proposta: req.params.id }).lean().then((documento) => {
                        Equipe.findOne({ _id: proposta.equipe }).lean().then((lista_equipe) => {
                            Posvenda.findOne({ proposta: proposta._id }).lean().then((posvenda) => {
                                Fornecedor.findOne({ _id: compra.fornecedor }).lean().then((for_pro) => {
                                    Fornecedor.find({ user: id }).lean().then((fornecedores) => {
                                        res.render('principal/compra', { cliente_proposta, proposta, for_pro, compra, documento, vistoria, lista_equipe, posvenda, fornecedores })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Não foi possível encontrar o fornecedor.')
                                        res.redirect('/menu')
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Não foi possível encontrar o fornecedor.')
                                    res.redirect('/menu')
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Não foi possível encontrar o pós venda.')
                                res.redirect('/menu')
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Não foi possível encontrar a equipe.')
                            res.redirect('/menu')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Não foi possível encontrar o documento.')
                        res.redirect('/menu')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Não foi possível encontrar a vistoria.')
                    res.redirect('/menu')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Não foi possível encontrar os documentos de compra.')
                res.redirect('/menu')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível encontrar o responsável da proposta.')
            res.redirect('/menu')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar a proposta.')
        res.redirect('/menu')
    })
})

router.get('/trt/:id', ehAdmin, (req, res) => {
    const { _id } = req.user
    Proposta.findOne({ _id: req.params.id }).lean().then((proposta) => {
        Cliente.findOne({ _id: proposta.cliente }).lean().then((cliente_proposta) => {
            Documento.findOne({ proposta: req.params.id }).lean().then((documento) => {
                Compra.findOne({ proposta: req.params.id }).lean().then((compra) => {
                    Vistoria.findOne({ proposta: req.params.id }).lean().then((vistoria) => {
                        Equipe.findOne({ _id: proposta.equipe }).lean().then((lista_equipe) => {
                            Posvenda.findOne({ proposta: proposta._id }).lean().then((posvenda) => {
                                res.render('principal/trt', { cliente_proposta, proposta, documento, vistoria, compra, lista_equipe, posvenda })
                            }).catch((err) => {
                                req.flash('error_msg', 'Não foi possível encontrar o pós venda.')
                                res.redirect('/menu')
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Não foi possível encontrar a equipe.')
                            res.redirect('/menu')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Não foi possível encontrar a vistoria.')
                        res.redirect('/menu')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Não foi possível encontrar a compra.')
                    res.redirect('/menu')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Não foi possível encontrar o documento.')
                res.redirect('/menu')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível encontrar o cliente da proposta.')
            res.redirect('/menu')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar a prposta.')
        res.redirect('/menu')
    })
})

router.get('/execucao/:id', ehAdmin, (req, res) => {
    const { _id } = req.user
    var check = 'unchecked'
    var salva = 'none'
    Proposta.findOne({ _id: req.params.id }).lean().then((proposta) => {
        Cliente.findOne({ _id: proposta.cliente }).lean().then((cliente_proposta) => {
            Documento.findOne({ proposta: req.params.id }).lean().then((documento) => {
                Compra.findOne({ proposta: req.params.id }).lean().then((compra) => {
                    Vistoria.findOne({ proposta: req.params.id }).lean().then((vistoria) => {
                        Equipe.findOne({ _id: proposta.equipe }).lean().then((lista_equipe) => {
                            Posvenda.findOne({ proposta: proposta._id }).lean().then((posvenda) => {
                                //console.log('documento.protocolado=>' + documento.protocolado)
                                if (documento.protocolado) {
                                    check = 'checked'
                                    salva = 'inline'
                                }
                                res.render('principal/execucao', { cliente_proposta, documento, proposta, check, salva, compra, vistoria, lista_equipe, posvenda })
                            }).catch((err) => {
                                req.flash('error_msg', 'Não foi possível encontrar o pós venda.')
                                res.redirect('/menu')
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Não foi possível encontrar a equipe.')
                            res.redirect('/menu')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Não foi possível encontrar a vistoria.')
                        res.redirect('/menu')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Não foi possível encontrar a compra.')
                    res.redirect('/menu')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Não foi possível encontrar o documento.')
                res.redirect('/menu')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível encontrar o responsável da proposta.')
            res.redirect('/menu')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar o responsável.')
        res.redirect('/menu')
    })
})

router.get('/equipe/:id', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }
    var ins_dentro = []
    var ins_fora = []
    var instalador_alocado = []
    var lista_res = []
    var lista_placa = []
    var placa = []
    var custoins = 0
    var email = ''
    var qe = 0
    var q = 0
    var numprj = 0
    var validaLivre = 0
    var ins0 = ''
    var ins1 = ''
    var ins2 = ''
    var ins3 = ''
    var ins4 = ''
    var ins5 = ''
    var diferenca = 0
    var ins_dif = 0
    var n = ''
    var qx = false

    var dataini
    var datafim
    var dtini

    Proposta.findOne({ _id: req.params.id }).lean().then((proposta) => {
        Cliente.findOne({ _id: proposta.cliente }).lean().then((cliente) => {
            Documento.findOne({ proposta: req.params.id }).lean().then((documento) => {
                Compra.findOne({ proposta: req.params.id }).lean().then((compra) => {
                    Vistoria.findOne({ proposta: req.params.id }).lean().then((vistoria) => {
                        Posvenda.findOne({ proposta: req.params.id }).lean().then((posvenda) => {
                            // Equipe.find({ 'nome_projeto': { $exists: true }, $and: [{ 'dtinicio': { $ne: '0000-00-00' } }, { 'dtinicio': { $ne: '' } }] }).then((equipe) => {
                            //     if (naoVazio(equipe)) {
                            //equipe.forEach((e) => {
                            // //console.log('e._id=>' + e._id)
                            // dataini = e.dtinibusca
                            // q++
                            // diferenca = e.dtfimbusca - e.dtinibusca
                            //console.log('diferenca=>' + diferenca)
                            /*
                            if (isNaN(diferenca) == false) {
                                for (x = 0; x < diferenca + 1; x++) {
                                    var date = String(e.dtinibusca)
                                    var ano = date.substring(0, 4)
                                    var mes = date.substring(4, 6) - parseFloat(1)
                                    var dia = date.substring(6, 10)
                                    var data = new Date(ano, mes, dia)
                                    var nova_data = new Date()
                                    nova_data.setDate(data.getDate() + parseFloat(x))
                                    ano = nova_data.getFullYear()
                                    mes = (nova_data.getMonth() + parseFloat(1))
                                    if (mes < 10) {
                                        mes = '0' + mes
                                    }
                                    dia = nova_data.getDate()
                                    if (dia < 10) {
                                        dia = '0' + dia
                                    }
                                    nova_data = ano + '' + mes + '' + dia

                                    if (dataini < nova_data) {
                                        dtini = nova_data
                                    } else {
                                        dtini = dataini
                                    }

                                    //console.log('nova_data=>'+nova_data)
                                    //console.log('dtini=>'+dtini)
                                    //console.log('dataini=>'+dataini)
                                    //console.log('date=>'+date)

                                    if (nova_data == dtini && dataini >= dtini && parseFloat(date) <= dataini) {
                                        ins_dif = 1
                                        //console.log('entrou')
                                        Pessoa.find({ $or: [{ 'funins': 'checked' }, { 'funele': 'checked' }], user: id }).then((todos_instaladores) => {
                                            todos_instaladores.forEach((ins) => {
                                                numprj++
                                                //console.log('Recurso=>' + ins.nome)
                                                //console.log('proposta.equipe=>' + proposta.equipe)
                                                Equipe.findOne({ _id: e._id, $or: [{ 'ins0': ins.nome }, { 'ins1': ins.nome }, { 'ins2': ins.nome }, { 'ins3': ins.nome }, { 'ins4': ins.nome }, { 'ins5': ins.nome }] }).then((equipe_ins) => {
                                                    //console.log('equipe=>' + equipe)
                                                    qe++
                                                    if (equipe_ins != null) {
                                                        if (instalador_alocado.length == 0) {
                                                            instalador_alocado.push({ nome: ins.nome })
                                                            //console.log(ins.nome + ' está alocado.')
                                                        } else {
                                                            for (i = 0; i < instalador_alocado.length; i++) {
                                                                if (instalador_alocado[i].nome != ins.nome) {
                                                                    instalador_alocado.push({ nome: ins.nome })
                                                                    //console.log(ins.nome + ' está alocado.')
                                                                }
                                                            }
                                                        }
                                                    }
                                                    //console.log('numprj=>' + numprj)
                                                    //console.log('qe=>' + qe)
                                                    if (numprj == qe) {
                                                        //console.log('É o último!')
                                                        Equipe.findOne({ _id: proposta.equipe }).then((edit_equipe) => {

                                                            //console.log('edit_equipe.ins0=>' + edit_equipe.ins0)
                                                            //console.log('edit_equipe.ins1=>' + edit_equipe.ins1)
                                                            //console.log('edit_equipe.ins2=>' + edit_equipe.ins2)
                                                            //console.log('edit_equipe.ins3=>' + edit_equipe.ins3)
                                                            //console.log('edit_equipe.ins4=>' + edit_equipe.ins4)
                                                            //console.log('edit_equipe.ins5=>' + edit_equipe.ins5)

                                                            if (typeof edit_equipe.ins0 != 'undefined') {
                                                                ins0 = edit_equipe.ins0
                                                            }
                                                            if (typeof edit_equipe.ins1 != 'undefined') {
                                                                ins1 = edit_equipe.ins1
                                                            }
                                                            if (typeof edit_equipe.ins2 != 'undefined') {
                                                                ins2 = edit_equipe.ins2
                                                            }
                                                            if (typeof edit_equipe.ins3 != 'undefined') {
                                                                ins3 = edit_equipe.ins3
                                                            }
                                                            if (typeof edit_equipe.ins4 != 'undefined') {
                                                                ins4 = edit_equipe.ins4
                                                            }
                                                            if (typeof edit_equipe.ins5 != 'undefined') {
                                                                ins5 = edit_equipe.ins5
                                                            }
                                                            Pessoa.find({ $or: [{ 'funins': 'checked' }, { 'funele': 'checked' }], user: id }).sort({ 'nome': 'asc' }).then((instalacao) => {
                                                                //console.log('equ=>' + equ)
                                                                // if (equ == null || equ == '' && typeof equ == 'undefined') {
                                                                //     instaladores = instalacao
                                                                // }
                                                                //console.log('instaladores=>' + instaladores)
                                                                instalacao.forEach((pesins) => {
                                                                    //console.log('instalador_alocado.length=>' + instalador_alocado.length)
                                                                    //console.log('pesins.nome=>' + pesins.nome)
                                                                    if (instalador_alocado.length == '') {
                                                                        //console.log('não tem instalador alocado')
                                                                        var nome = pesins.nome
                                                                        var id = pesins._id

                                                                        if (naoVazio(pesins.custo)) {
                                                                            custoins = pesins.custo
                                                                        } else {
                                                                            custoins = 0
                                                                        }
                                                                        if (naoVazio(pesins.email)) {
                                                                            email = pesins.email
                                                                        } else {
                                                                            email = ''
                                                                        }

                                                                        if (nome == ins0) {
                                                                            ins_dentro.push({ id, nome, custo: custoins, email })
                                                                        } else {
                                                                            if (nome == ins1) {
                                                                                ins_dentro.push({ id, nome, custo: custoins, email })
                                                                            } else {
                                                                                if (nome == ins2) {
                                                                                    ins_dentro.push({ id, nome, custo: custoins, email })
                                                                                } else {
                                                                                    if (nome == ins3) {
                                                                                        ins_dentro.push({ id, nome, custo: custoins, email })
                                                                                    } else {
                                                                                        if (nome == ins4) {
                                                                                            ins_dentro.push({ id, nome, custo: custoins, email })
                                                                                        } else {
                                                                                            if (nome == ins5) {
                                                                                                ins_dentro.push({ id, nome, custo: custoins, email })
                                                                                            } else {
                                                                                                ins_fora.push({ id, nome, custo: custoins, email })
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    } else {
                                                                        const encontrou_ins = instalador_alocado.find((user) => user.nome === pesins.nome)
                                                                        //console.log('encontrou recurso alocado=>' + encontrou_ins)
                                                                        if (typeof encontrou_ins == 'undefined') {
                                                                            var nome = pesins.nome
                                                                            var id = pesins._id
                                                                            //console.log(nome + ' não está alocado.')
                                                                            if (nome == ins0) {
                                                                                ins_dentro.push({ id, nome, custo: custoins, email })
                                                                            } else {
                                                                                if (nome == ins1) {
                                                                                    ins_dentro.push({ id, nome, custo: custoins, email })
                                                                                } else {
                                                                                    if (nome == ins2) {
                                                                                        ins_dentro.push({ id, nome, custo: custoins, email })
                                                                                    } else {
                                                                                        if (nome == ins3) {
                                                                                            ins_dentro.push({ id, nome, custo: custoins, email })
                                                                                        } else {
                                                                                            if (nome == ins4) {
                                                                                                ins_dentro.push({ id, nome, custo: custoins, email })
                                                                                            } else {
                                                                                                if (nome == ins5) {
                                                                                                    ins_dentro.push({ id, nome, custo: custoins, email })
                                                                                                } else {
                                                                                                    ins_fora.push({ id, nome, custo: custoins, email })
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        } else {
                                                                            var nome = pesins.nome
                                                                            var id = pesins._id
                                                                            //console.log(nome + ' está alocado.')
                                                                            if (nome == ins0) {
                                                                                ins_dentro.push({ id, nome, custo: custoins, email })
                                                                            } else {
                                                                                if (nome == ins1) {
                                                                                    ins_dentro.push({ id, nome, custo: custoins, email })
                                                                                } else {
                                                                                    if (nome == ins2) {
                                                                                        ins_dentro.push({ id, nome, custo: custoins, email })
                                                                                    } else {
                                                                                        if (nome == ins3) {
                                                                                            ins_dentro.push({ id, nome, custo: custoins, email })
                                                                                        } else {
                                                                                            if (nome == ins4) {
                                                                                                ins_dentro.push({ id, nome, custo: custoins, email })
                                                                                            } else {
                                                                                                if (nome == ins5) {
                                                                                                    ins_dentro.push({ id, nome, custo: custoins, email })
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                })

                                                                //console.log('ins_dentro_ultimo=>' + ins_dentro)
                                                                //console.log('ins_fora_ultimo=>' + ins_fora)
                                                                Equipe.find({ user: id, nome: { $exists: true }, ehpadrao: true }).lean().then((equipes) => {
                                                                    //Verificando os responsáveis alocados na equipe
                                                                    //Verificando as pessoas em cada equipe
                                                                    Equipe.findOne({ _id: proposta.equipe }).then((nomes) => {
                                                                        //console.log('nomes=>' + nomes._id)
                                                                        if (nomes != '' && nomes != null && typeof nomes != 'undefined') {
                                                                            for (var x = 0; x < 6; x++) {
                                                                                if (x == 0) {
                                                                                    n = nomes.ins0
                                                                                } else {
                                                                                    if (x == 1) {
                                                                                        n = nomes.ins1
                                                                                    } else {
                                                                                        if (x == 2) {
                                                                                            n = nomes.ins2
                                                                                        } else {
                                                                                            if (x == 3) {
                                                                                                n = nomes.ins3
                                                                                            } else {
                                                                                                if (x == 4) {
                                                                                                    n = nomes.ins4
                                                                                                } else {
                                                                                                    qx = true
                                                                                                    n = nomes.ins5
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }

                                                                                //console.log('qx=>' + qx)
                                                                                //console.log('id=>' + id)
                                                                                Pessoa.findOne({ user: id, nome: n, insres: 'checked' }).then((p) => {
                                                                                    //console.log('p=>' + p)
                                                                                    if (naoVazio(p)) {
                                                                                        lista_res.push({ id: p._id, nome: p.nome })
                                                                                    }
                                                                                }).catch((err) => {
                                                                                    req.flash('error_msg', 'Falha ao encontrar a pessoa.')
                                                                                    res.redirect('/gerenciamento/equipe/' + req.params.id)
                                                                                })

                                                                                if (qx == true) {

                                                                                    Equipe.findOne({ _id: proposta.equipe }).lean().then((lista_equipe) => {
                                                                                        nome_equipe = lista_equipe.nome_equipe
                                                                                        //console.log('lista_equipe.insres=>' + lista_equipe.insres)
                                                                                        Pessoa.findOne({ _id: lista_equipe.insres }).lean().then((insres) => {
                                                                                            //console.log('insres.nome=>' + insres.nome)
                                                                                            //console.log('encontrou ')
                                                                                            placa = lista_equipe.placa
                                                                                            if (naoVazio(placa)) {
                                                                                                placa.forEach((p) => {
                                                                                                    lista_placa.push({ idp: proposta._id, ide: lista_equipe._id, id: p._id, desc: p.desc, dtdes: p.dtdes })
                                                                                                })
                                                                                            }
                                                                                            //console.log('proposta=>' + proposta)
                                                                                            //console.log('cliente=>' + cliente)
                                                                                            //console.log('documento=>' + documento)
                                                                                            //console.log('compra=>' + compra)
                                                                                            //console.log('vistoria=>' + vistoria)
                                                                                            //console.log('posvenda=>' + posvenda)
                                                                                            //console.log('equipes=>' + equipes)
                                                                                            //console.log('lista_equipe=>' + lista_equipe)
                                                                                            //console.log('ins_fora=>' + ins_fora)
                                                                                            //console.log('ins_dentro=>' + ins_dentro)
                                                                                            //console.log('nome_equipe=>' + nome_equipe)
                                                                                            //console.log('lista_res=>' + lista_res)
                                                                                            //console.log('insres=>' + insres)                         
                                                                                            //console.log('lista_placa=>' + lista_placa)                                                                             
                                                                                            res.render('principal/equipe', { proposta, cliente, documento, compra, vistoria, posvenda, equipes, lista_equipe, ins_fora, ins_dentro, nome_equipe, lista_res, insres })
                                                                                        }).catch((err) => {
                                                                                            req.flash('error_msg', 'Falha ao encontrar a pessoa<insres>.')
                                                                                            res.redirect('/gerenciamento/equipe/' + req.params.id)
                                                                                        })
                                                                                    }).catch((err) => {
                                                                                        req.flash('error_msg', 'Falha ao encontrar a equipe<lista_equipe>.')
                                                                                        res.redirect('/gerenciamento/equipe/' + req.params.id)
                                                                                    })

                                                                                }
                                                                            }
                                                                        }
                                                                    }).catch((err) => {
                                                                        req.flash('error_msg', 'Falha ao encontrar a euipe<nomes>.')
                                                                        res.redirect('/gerenciamento/equipe/' + req.params.id)
                                                                    })

                                                                }).catch((err) => {
                                                                    req.flash('error_msg', 'Falha ao encontrar as equipes<equipes>.')
                                                                    res.redirect('/gerenciamento/equipe/' + req.params.id)
                                                                })

                                                            }).catch((err) => {
                                                                req.flash('error_msg', 'Falha ao encontrar os instaladores.')
                                                                res.redirect('/gerenciamento/equipe/' + req.params.id)
                                                            })
                                                        }).catch((err) => {
                                                            req.flash('error_msg', 'Falha ao encontrar os instaladores na equipe<edit_equipe>.')
                                                            res.redirect('/gerenciamento/equipe/' + req.params.id)
                                                        })
                                                    }
                                                }).catch((err) => {
                                                    req.flash('error_msg', 'Falha ao encontrar as equipes<2>.')
                                                    res.redirect('/gerenciamento/equipe/' + req.params.id)
                                                })
                                            })
                                        }).catch((err) => {
                                            req.flash('error_msg', 'Falha ao encontrar os instaladores na equipe.')
                                            res.redirect('/gerenciamento/equipe/' + req.params.id)
                                        })
                                    }
                                }
                            }
                            */
                            //console.log('validaLivre=>'+validaLivre)
                            //console.log('ins_dif=>'+ins_dif)
                            //console.log('equipe.length=>'+equipe.length)
                            //console.log('q=>'+q)

                            // if (validaLivre == 0 && ins_dif == 0 && q == equipe.length) {
                            //     validaLivre = 1
                            Equipe.findOne({ _id: proposta.equipe }).lean().then((equipeins) => {
                                //console.log(equipeins)
                                if (naoVazio(equipeins)) {
                                    //console.log('entrou diferença')
                                    Pessoa.find({ $or: [{ 'funins': 'checked' }, { 'funele': 'checked' }], user: id }).then((instalacao) => {
                                        //console.log('equipeins.ins0=>' + equipeins.ins0)
                                        if (naoVazio(equipeins.ins0)) {
                                            ins0 = equipeins.ins0
                                        }
                                        if (naoVazio(equipeins.ins1)) {
                                            ins1 = equipeins.ins1
                                        }
                                        if (naoVazio(equipeins.ins2)) {
                                            ins2 = equipeins.ins2
                                        }
                                        if (naoVazio(equipeins.ins3)) {
                                            ins3 = equipeins.ins3
                                        }
                                        if (naoVazio(equipeins.ins4)) {
                                            ins4 = equipeins.ins4
                                        }
                                        if (naoVazio(equipeins.ins5)) {
                                            ins5 = equipeins.ins5
                                        }

                                        //console.log('ins0=>' + ins0)

                                        instalacao.forEach((pesins) => {

                                            var nome = pesins.nome
                                            var id = pesins._id

                                            //console.log('pesins.custo=>' + pesins.custo)
                                            if (naoVazio(pesins.custo)) {
                                                custoins = pesins.custo
                                            } else {
                                                custoins = 0
                                            }
                                            if (naoVazio(pesins.email)) {
                                                email = pesins.email
                                            } else {
                                                email = ''
                                            }


                                            if (nome == ins0) {
                                                ins_dentro.push({ id, nome, custo: custoins, email })
                                            } else {
                                                if (nome == ins1) {
                                                    ins_dentro.push({ id, nome, custo: custoins, email })
                                                } else {
                                                    if (nome == ins2) {
                                                        ins_dentro.push({ id, nome, custo: custoins, email })
                                                    } else {
                                                        if (nome == ins3) {
                                                            ins_dentro.push({ id, nome, custo: custoins, email })
                                                        } else {
                                                            if (nome == ins4) {
                                                                ins_dentro.push({ id, nome, custo: custoins, email })
                                                            } else {
                                                                if (nome == ins5) {
                                                                    ins_dentro.push({ id, nome, custo: custoins, email })
                                                                } else {
                                                                    ins_fora.push({ id, nome, custo: custoins, email })
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        })
                                        //console.log('ins_dentro_dif=>' + ins_dentro)
                                        //console.log('ins_fora_dif=>' + ins_fora)

                                        Equipe.find({ user: id, nome: { $exists: true }, ehpadrao: true }).lean().then((equipes) => {
                                            //Verificando os responsáveis alocados na equipe
                                            //Verificando as pessoas em cada equipe
                                            //console.log('qi=>' + qi)
                                            Equipe.findOne({ _id: proposta.equipe }).then((nomes) => {
                                                //console.log('nomes=>' + nomes)
                                                if (naoVazio(nomes)) {
                                                    for (var x = 0; x < 6; x++) {
                                                        if (x == 0) {
                                                            n = nomes.ins0
                                                        } else {
                                                            if (x == 1) {
                                                                n = nomes.ins1
                                                            } else {
                                                                if (x == 2) {
                                                                    n = nomes.ins2
                                                                } else {
                                                                    if (x == 3) {
                                                                        n = nomes.ins3
                                                                    } else {
                                                                        if (x == 4) {
                                                                            n = nomes.ins4
                                                                        } else {
                                                                            qx = true
                                                                            n = nomes.ins5
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }

                                                        //console.log('qx=>' + qx)
                                                        //console.log('id=>' + id)
                                                        Pessoa.findOne({ user: id, nome: n, insres: 'checked' }).then((p) => {
                                                            //console.log('p=>' + p)
                                                            if (naoVazio(p)) {
                                                                lista_res.push({ id: p._id, nome: p.nome })
                                                            }
                                                        }).catch((err) => {
                                                            req.flash('error_msg', 'Falha ao encontrar a pessoa.')
                                                            res.redirect('/gerenciamento/equipe/' + req.params.id)
                                                        })

                                                        //console.log('qx=>' + qx)
                                                        if (qx == true) {

                                                            Equipe.findOne({ _id: proposta.equipe }).lean().then((lista_equipe) => {
                                                                nome_equipe = lista_equipe.nome_equipe
                                                                //console.log('lista_equipe.insres=>' + lista_equipe.insres)
                                                                Pessoa.findOne({ _id: lista_equipe.insres }).lean().then((insres) => {
                                                                    placa = lista_equipe.placa
                                                                    if (naoVazio(placa)) {
                                                                        placa.forEach((p) => {
                                                                            lista_placa.push({ idp: proposta._id, ide: lista_equipe._id, id: p._id, desc: p.desc, dtdes: p.dtdes })
                                                                        })
                                                                    }
                                                                    //console.log('proposta=>' + proposta)
                                                                    //console.log('cliente=>' + cliente)
                                                                    //console.log('documento=>' + documento)
                                                                    //console.log('compra=>' + compra)
                                                                    //console.log('vistoria=>' + vistoria)
                                                                    //console.log('posvenda=>' + posvenda)
                                                                    //console.log('equipes=>' + equipes)
                                                                    //console.log('lista_equipe=>' + lista_equipe)
                                                                    //console.log('ins_fora=>' + ins_fora)
                                                                    //console.log('ins_dentro=>' + ins_dentro)
                                                                    //console.log('nome_equipe=>' + nome_equipe)
                                                                    //console.log('lista_res=>' + lista_res)
                                                                    //console.log('insres=>' + insres)
                                                                    res.render('principal/equipe', { proposta, cliente, documento, compra, vistoria, posvenda, equipes, lista_equipe, ins_fora, ins_dentro, lista_placa, nome_equipe, lista_res, insres })
                                                                }).catch((err) => {
                                                                    req.flash('error_msg', 'Falha ao encontrar a pessoa<insres>.')
                                                                    res.redirect('/gerenciamento/equipe/' + req.params.id)
                                                                })
                                                            }).catch((err) => {
                                                                req.flash('error_msg', 'Falha ao encontrar a equipe<lista_equipe>.')
                                                                res.redirect('/gerenciamento/equipe/' + req.params.id)
                                                            })

                                                        }
                                                    }
                                                }
                                            }).catch((err) => {
                                                req.flash('error_msg', 'Falha ao encontrar a euipe<nomes>.')
                                                res.redirect('/gerenciamento/equipe/' + req.params.id)
                                            })

                                        }).catch((err) => {
                                            req.flash('error_msg', 'Falha ao encontrar as equipes<equipes>.')
                                            res.redirect('/gerenciamento/equipe/' + req.params.id)
                                        })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Falha ao encontrar os instaladores.')
                                        res.redirect('/gerenciamento/equipe/' + req.params.id)
                                    })
                                } else {
                                    //console.lofg('não encontrou a equipe.')
                                    Pessoa.find({ $or: [{ 'funins': 'checked' }, { 'funele': 'checked' }], user: id }).then((instalacao) => {
                                        Equipe.find({ user: id, nome: { $exists: true }, ehpadrao: true }).lean().then((equipes) => {
                                            Pessoa.findOne({ user: id, nome: n, insres: 'checked' }).then((p) => {
                                                //console.log('p=>' + p)
                                                if (naoVazio(p)) {
                                                    lista_res.push({ id: p._id, nome: p.nome })
                                                }
                                            }).catch((err) => {
                                                req.flash('error_msg', 'Falha ao encontrar a pessoa.')
                                                res.redirect('/gerenciamento/equipe/' + req.params.id)
                                            })
                                            instalacao.forEach((e) => {
                                                q++
                                                ins_fora.push({ id: e._id, nome: e.nome })
                                                if (q == instalacao.length) {
                                                    res.render('principal/equipe', { proposta, cliente, documento, compra, vistoria, posvenda, equipes, ins_fora, ins_dentro, lista_res })
                                                }
                                            })

                                        }).catch((err) => {
                                            req.flash('error_msg', 'Falha ao encontrar as pessoas.')
                                            res.redirect('/gerenciamento/equipe/' + req.params.id)
                                        })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Falha ao encontrar a equipe.')
                                        res.redirect('/gerenciamento/equipe/' + req.params.id)
                                    })
                                }
                            }).catch((err) => {
                                req.flash('error_msg', 'Falha ao encontrar os instaladores na equipe.')
                                res.redirect('/gerenciamento/equipe/' + req.params.id)
                            })
                            //     }
                            // })
                            // }).catch((err) => {
                            //     req.flash('error_msg', 'Falha ao encontrar a equipe.')
                            //     res.redirect('/gerenciamento/equipe/' + req.params.id)
                            // })
                        }).catch((err) => {
                            req.flash('error_msg', 'Falha ao encontrar o pós venda.')
                            res.redirect('/gerenciamento/equipe/' + req.params.id)
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Falha ao encontrar a vistoria.')
                        res.redirect('/gerenciamento/equipe/' + req.params.id)
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Falha ao encontrar a compra.')
                    res.redirect('/gerenciamento/equipe/' + req.params.id)
                })
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao encontrar o documento.')
                res.redirect('/gerenciamento/equipe/' + req.params.id)
            })
        }).catch((err) => {
            req.flash('error_msg', 'Houve erro ao encontrar o cliente.')
            res.redirect('/gerenciamento/equipe/' + req.params.id)
        })
    }).catch((err) => {
        res.redirect('/gerenciamento/equipe/' + req.params.id)
    })
})

router.get('/aceite/:id', ehAdmin, (req, res) => {
    var checkAte = 'false'
    var checkInv = 'false'
    var checkMod = 'false'
    Proposta.findOne({ _id: req.params.id }).lean().then((proposta) => {
        Cliente.findOne({ _id: proposta.cliente }).lean().then((cliente_proposta) => {
            Documento.findOne({ proposta: req.params.id }).lean().then((documento) => {
                Compra.findOne({ proposta: req.params.id }).lean().then((compra) => {
                    Vistoria.findOne({ proposta: req.params.id }).lean().then((vistoria) => {
                        Equipe.findOne({ _id: proposta.equipe }).lean().then((lista_equipe) => {
                            Posvenda.findOne({ proposta: proposta._id }).lean().then((posvenda) => {
                                if (lista_equipe.liberar) {
                                    AtvAterramento.findOne({ proposta: proposta._id }).lean().then((atvate) => {
                                        AtvInversor.findOne({ proposta: proposta._id }).lean().then((atvinv) => {
                                            AtvTelhado.findOne({ proposta: proposta._id }).lean().then((atvtel) => {
                                                if (atvate.aprova == true) {
                                                    checkAte = 'checked'
                                                }
                                                if (atvinv.aprova == true) {
                                                    checkInv = 'checked'
                                                }
                                                if (atvtel.aprova == true) {
                                                    checkMod = 'checked'
                                                }
                                                var imgate = ''
                                                var imginv = ''
                                                var imgtel = ''
                                                var ate = atvate.caminhoFoto
                                                var inv = atvinv.caminhoFoto
                                                var tel = atvtel.caminhoFoto
                                                if (naoVazio(ate)) {
                                                    ate.forEach((e) => {
                                                        imgate = imgate + e.desc + ' | '
                                                    })
                                                }
                                                if (naoVazio(inv)) {
                                                    inv.forEach((e) => {
                                                        imginv = imginv + e.desc + ' | '
                                                    })
                                                }
                                                if (naoVazio(tel)) {
                                                    tel.forEach((e) => {
                                                        imgtel = imgtel + e.desc + ' | '
                                                    })
                                                }
                                                res.render('principal/aceite', { imgate, imginv, imgtel, cliente_proposta, documento, proposta, compra, vistoria, lista_equipe, posvenda, checkAte, checkInv, checkMod, atvate, atvinv, atvtel })
                                            }).catch((err) => {
                                                req.flash('error_msg', 'Não foi possível encontrar a atividade do telhado.')
                                                res.redirect('/menu')
                                            })
                                        }).catch((err) => {
                                            req.flash('error_msg', 'Não foi possível encontrar a atividade do inversor.')
                                            res.redirect('/menu')
                                        })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Não foi possível encontrar a atividade do aterramento.')
                                        res.redirect('/menu')
                                    })
                                } else {
                                    req.flash('aviso_msg', 'Será possível acessar a página de aceite após a liberação da equipe para o serviço.')
                                    res.redirect('/gerenciamento/proposta/' + proposta._id)
                                }
                            }).catch((err) => {
                                req.flash('error_msg', 'Não foi possível encontrar o pós venda.')
                                res.redirect('/menu')
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Não foi possível encontrar a equipe.')
                            res.redirect('/menu')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Não foi possível encontrar a vistoria.')
                        res.redirect('/menu')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Não foi possível encontrar a compra.')
                    res.redirect('/menu')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Não foi possível encontrar o documento.')
                res.redirect('/menu')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível encontrar o responsável da proposta.')
            res.redirect('/menu')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar o responsável.')
        res.redirect('/menu')
    })
})

router.get('/almoxarifado/:id', ehAdmin, (req, res) => {
    const { _id } = req.user
    //console.log('req.params.id=>' + req.params.id)
    Proposta.findOne({ _id: req.params.id }).lean().then((proposta) => {
        Cliente.findOne({ _id: proposta.cliente }).lean().then((cliente_proposta) => {
            Documento.findOne({ proposta: req.params.id }).lean().then((documento) => {
                Compra.findOne({ proposta: req.params.id }).lean().then((compra) => {
                    Vistoria.findOne({ proposta: req.params.id }).lean().then((vistoria) => {
                        Equipe.findOne({ _id: proposta.equipe }).lean().then((lista_equipe) => {
                            Posvenda.findOne({ proposta: proposta._id }).lean().then((posvenda) => {
                                //console.log('documento.protocolado=>' + documento.protocolado)
                                res.render('principal/almoxarifado', { cliente_proposta, documento, proposta, compra, vistoria, lista_equipe, posvenda })
                            }).catch((err) => {
                                req.flash('error_msg', 'Não foi possível encontrar o pós venda.')
                                res.redirect('/menu')
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Não foi possível encontrar a equipe.')
                            res.redirect('/menu')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Não foi possível encontrar a vistoria.')
                        res.redirect('/menu')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Não foi possível encontrar a compra.')
                    res.redirect('/menu')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Não foi possível encontrar o documento.')
                res.redirect('/menu')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível encontrar o cliente da proposta.')
            res.redirect('/menu')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar a proposta.')
        res.redirect('/menu')
    })
})

router.get('/financeiro/:id', ehAdmin, (req, res) => {
    const { _id } = req.user
    var lista = []
    var lista_faturados = []
    var lista_comprovantes = []
    Proposta.findOne({ _id: req.params.id }).lean().then((proposta) => {
        Cliente.findOne({ _id: proposta.cliente }).lean().then((cliente_proposta) => {
            Documento.findOne({ proposta: req.params.id }).lean().then((documento) => {
                Compra.findOne({ proposta: req.params.id }).lean().then((compra) => {
                    Vistoria.findOne({ proposta: req.params.id }).lean().then((vistoria) => {
                        Equipe.findOne({ _id: proposta.equipe }).lean().then((lista_equipe) => {
                            Posvenda.findOne({ proposta: proposta._id }).lean().then((posvenda) => {
                                //console.log('documento.protocolado=>' + documento.protocolado)

                                if (naoVazio(documento.faturado)) {
                                    lista = documento.faturado
                                    lista.forEach((e) => {
                                        lista_faturados.push({ doc: e })
                                    })
                                    //console.log('lista_faturados=>' + lista_faturados)
                                }

                                if (naoVazio(documento.comprovante)) {
                                    lista = documento.comprovante
                                    //console.log('lista comprovantes=>' + lista)
                                    lista.forEach((e) => {
                                        lista_comprovantes.push({ doc: e })
                                    })
                                    //console.log('lista_comprovantes=>' + lista_comprovantes)
                                }

                                res.render('principal/financeiro', { cliente_proposta, documento, lista_comprovantes, lista_faturados, proposta, compra, vistoria, lista_equipe, posvenda })
                            }).catch((err) => {
                                req.flash('error_msg', 'Não foi possível encontrar o pós venda.')
                                res.redirect('/menu')
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Não foi possível encontrar a equipe.')
                            res.redirect('/menu')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Não foi possível encontrar a vistoria.')
                        res.redirect('/menu')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Não foi possível encontrar a compra.')
                    res.redirect('/menu')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Não foi possível encontrar o documento.')
                res.redirect('/menu')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível encontrar o responsável da proposta.')
            res.redirect('/menu')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar o responsável.')
        res.redirect('/menu')
    })
})

router.get('/posvenda/:id', ehAdmin, (req, res) => {
    const { _id } = req.user
    Proposta.findOne({ _id: req.params.id }).lean().then((proposta) => {
        Cliente.findOne({ _id: proposta.cliente }).lean().then((cliente_proposta) => {
            Documento.findOne({ proposta: req.params.id }).lean().then((documento) => {
                Compra.findOne({ proposta: req.params.id }).lean().then((compra) => {
                    Vistoria.findOne({ proposta: req.params.id }).lean().then((vistoria) => {
                        Equipe.findOne({ _id: proposta.equipe }).lean().then((lista_equipe) => {
                            Posvenda.findOne({ proposta: proposta._id }).lean().then((posvenda) => {
                                //console.log('documento.protocolado=>' + documento.protocolado)
                                res.render('principal/posvenda', { cliente_proposta, documento, proposta, compra, vistoria, lista_equipe, posvenda })
                            }).catch((err) => {
                                req.flash('error_msg', 'Não foi possível encontrar o pós venda.')
                                res.redirect('/menu')
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Não foi possível encontrar a equipe.')
                            res.redirect('/menu')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Não foi possível encontrar a vistoria.')
                        res.redirect('/menu')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Não foi possível encontrar a compra.')
                    res.redirect('/menu')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Não foi possível encontrar o documento.')
                res.redirect('/menu')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível encontrar o responsável da proposta.')
            res.redirect('/menu')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar o responsável.')
        res.redirect('/menu')
    })
})

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
    var fatura
    Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
        Empresa.findOne({ _id: projeto.empresa }).lean().then((empresa) => {
            Cliente.findOne({ _id: projeto.cliente }).lean().then((cliente) => {
                Cronograma.findOne({ projeto: projeto._id }).then((cronograma) => {
                    if (projeto.fatequ == true) {
                        fatura = 'checked'
                    } else {
                        fatura = 'unchecked'
                    }
                    var libRecursos = liberaRecursos(cronograma.dateplaini, cronograma.dateplafim, cronograma.dateprjini, cronograma.dateprjfim,
                        cronograma.dateateini, cronograma.dateatefim, cronograma.dateinvini, cronograma.dateinvfim,
                        cronograma.datestbini, cronograma.datestbfim, cronograma.dateestini, cronograma.dateestfim,
                        cronograma.datemodini, cronograma.datemodfim, cronograma.datevisini, cronograma.datevisfim)
                    if (projeto.qtdins != '' && typeof projeto.qtdins != 'undefined' && projeto.qtdins != 0) {
                        libRecursos = true
                    }
                    res.render('projeto/gerenciamento/gerenciamento', { projeto, cliente, empresa, fatura, libRecursos })
                }).catch((err) => {
                    req.flash('error_msg', 'Nenhum cronograma encontrado.')
                    res.redirect('/gerenciamento/gerenciamento/' + req.params.id)
                })
            }).catch((err) => {
                req.flash('error_msg', 'Nenhum cliente encontrado.')
                res.redirect('/gerenciamento/gerenciamento/' + req.params.id)
            })
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve uma falha ao buscar o projeto.')
        res.redirect('/gerenciamento/gerenciamento/' + req.params.id)
    })
})

router.get('/custo/:id', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }
    var ehSimples = false
    var ehLP = false
    var ehLR = false
    Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {

        Empresa.findOne({ _id: projeto.empresa }).lean().then((empresa) => {
            switch (empresa.regime) {
                case "Simples": ehSimples = true
                    break;
                case "Lucro Presumido": ehLP = true
                    break;
                case "Lucro Real": ehLR = true
                    break;
            }
            Cliente.findOne({ user: id, _id: projeto.cliente }).lean().then((cliente) => {
                res.render('projeto/gerenciamento/custo', { projeto, empresa, cliente, ehSimples, ehLP, ehLR })
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
                res.redirect('/gerenciamento/gerenciamento/' + req.params.id)
            })
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível encontrar o cronograma.')
            res.redirect('/gerenciamento/gerenciamento/' + req.params.id)
        })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar o projeto.')
        res.redirect('/gerenciamento/gerenciamento/' + req.params.id)
    })
})

router.get('/documentos/:id', ehAdmin, (req, res) => {
    Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
        res.render('projeto/gerenciamento/documentos', { projeto })
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
    var meshoje = hoje.substring(5,)

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
                            mesinicio = dtinicio.substring(5,)
                            mesfim = dtfim.substring(5,)
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
                            //console.log('mes=>' + mes)
                            tarefa = ser.descricao
                            for (i = 0; i < dif; i++) {
                                //console.log('dia=>' + dia)
                                //console.log('entrou laço')
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
        res.redirect('/menu')
    })
})

router.get('/vermais/:id/', ehAdmin, (req, res) => {
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

    const cores = ['green', 'blue', 'tomato', 'teal', 'sienna', 'salmon', 'rebeccapurple', 'slateblue', 'yellowgreen', 'slategray', 'cadetblue', 'coral', 'cornflowerblue', 'crimson', 'darkblue', 'darkcyan', 'orange', 'hotpink']

    var q = 0
    var inicio
    var fim
    var anoinicio
    var anofim
    var mesinicio
    var mesfim
    var diainicio
    var diafim
    var mestitulo
    var trintaeum = false
    var bisexto = false
    var dia
    var mes
    var dif
    var color
    var x
    var y = -1
    var z = -1

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
    //console.log('hoje=>' + hoje)
    var meshoje = hoje.substring(5,)
    var anotitulo = hoje.substring(0, 4)

    //console.log('meshoje=>' + meshoje)

    switch (meshoje) {
        case '01':
            janeiro = 'active'
            mestitulo = 'Janeiro '
            trintaeum = true
            break;
        case '02':
            fevereiro = 'active'
            mestitulo = 'Fevereiro '
            bisexto = 'false'
            break;
        case '03':
            marco = 'active'
            mestitulo = 'Março '
            trintaeum = true
            break;
        case '04':
            abril = 'active'
            mestitulo = 'Abril '
            break;
        case '05':
            maio = 'active'
            mestitulo = 'Maio '
            trintaeum = true
            break;
        case '06':
            junho = 'active'
            mestitulo = 'Junho '
            break;
        case '07':
            julho = 'active'
            mestitulo = 'Julho '
            trintaeum = true
            break;
        case '08':
            agosto = 'active'
            mestitulo = 'Agosto '
            trintaeum = true
            break;
        case '09':
            setembro = 'active'
            mestitulo = 'Setembro '
            break;
        case '10':
            outubro = 'active'
            mestitulo = 'Outubro '
            trintaeum = true
            break;
        case '11':
            novembro = 'active'
            mestitulo = 'Novembro '
            break;
        case '12':
            dezembro = 'active'
            mestitulo = 'Dezembro '
            trintaeum = true
            break;
    }

    //console.log('mestitulo=>' + mestitulo)

    Pessoa.findOne({ user: id, _id: req.params.id }).lean().then((pessoa) => {
        Equipe.find({ user: id, prjfeito: false, nome_projeto: { $exists: true }, ins0: { $exists: true }, dtinicio: { $ne: '00/00/0000' }, $or: [{ ins0: pessoa.nome }, { ins1: pessoa.nome }, { ins2: pessoa.nome }, { ins3: pessoa.nome }, { ins4: pessoa.nome }, { ins5: pessoa.nome }] }).then((equipe) => {
            equipe.forEach((e) => {
                //console.log('e._id=>' + e._id)
                Proposta.findOne({ equipe: e._id, ganho: true, encerrado: false }).then((proposta) => {
                    //console.log('proposta=>' + proposta)
                    Cliente.findOne({ _id: proposta.cliente }).then((cliente) => {
                        q++
                        inicio = e.dtinicio
                        fim = e.dtfim
                        //console.log('cliente.nome=>' + cliente.nome)
                        //console.log('inicio=>' + inicio)
                        //console.log('fim=>' + fim)
                        //console.log('e=>' + e)
                        //console.log('inicio=>' + inicio)
                        anoinicio = inicio.substring(0, 4)
                        anofim = fim.substring(0, 4)
                        mesinicio = inicio.substring(5,)
                        mesfim = fim.substring(5,)
                        diainicio = inicio.substring(8, 11)
                        diafim = fim.substring(8, 11)
                        con1 = String(mesinicio) + String(diainicio)
                        con2 = String(mesfim) + String(diafim)
                        dif1 = parseFloat(con2) - parseFloat(con1) + 1
                        //console.log('mesfim=>'+mesfim)
                        //console.log('mesinicio=>'+mesinicio)
                        if (meshoje == mesinicio) {
                            mes = mesinicio
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

                        //console.log('dif=>' + dif)
                        //console.log('dia=>' + dia)
                        //console.log('mes=>' + mes)
                        x = Math.floor(Math.random() * 17)
                        if (z == x) {
                            x = Math.floor(Math.random() * 17)
                        } else {
                            if (y == x) {
                                x = Math.floor(Math.random() * 17)
                            }
                        }
                        z = x
                        y = x

                        color = cores[x]
                        //console.log('color=>' + color)
                        todasCores.push({ color })

                        for (i = 0; i < dif; i++) {
                            //console.log('meshoje=>' + meshoje)
                            //console.log('mes=>' + mes)
                            //console.log('dia=>' + dia)
                            if (meshoje == mes) {
                                switch (String(dia)) {
                                    case '01':
                                        dia01.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '02':
                                        dia02.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '03':
                                        dia03.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '04':
                                        dia04.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '05':
                                        dia05.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '06':
                                        dia06.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '07':
                                        dia07.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '08':
                                        dia08.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '09':
                                        dia09.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '10':
                                        dia10.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '11':
                                        dia11.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '12':
                                        dia12.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '13':
                                        dia13.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '14':
                                        dia14.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '15':
                                        dia15.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '16':
                                        dia16.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '17':
                                        dia17.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '18':
                                        dia18.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '19':
                                        dia19.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '20':
                                        dia20.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '21':
                                        dia21.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '22':
                                        dia22.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '23':
                                        dia23.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '24':
                                        dia24.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '25':
                                        dia25.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '26':
                                        dia26.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '27':
                                        dia27.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '28':
                                        dia28.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '29':
                                        dia29.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '30':
                                        dia30.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '31':
                                        dia31.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                }
                                dia++
                                if (dia < 10) {
                                    dia = '0' + dia
                                }
                                //console.log('diainicio=>' + diainicio)
                            }
                        }

                        if (q == equipe.length) {
                            res.render('principal/vermais', {
                                dia01, dia02, dia03, dia04, dia05, dia06, dia07, dia08, dia09, dia10,
                                dia11, dia12, dia13, dia14, dia15, dia16, dia17, dia18, dia19, dia20,
                                dia21, dia22, dia23, dia24, dia25, dia26, dia27, dia28, dia29, dia30, dia31,
                                janeiro, fevereiro, marco, abril, maio, junho, julho, agosto, setembro, outubro, novembro, dezembro,
                                mestitulo, anotitulo, trintaeum, pessoa, todasCores, bisexto
                            })
                        }
                    }).catch((err) => {
                        req.flash('error_msg', 'Falha ao encontra o cliente.')
                        res.redirect('/menu')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Falha ao encontra a proposta.')
                    res.redirect('/menu')
                })
            })
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao encontra a equipe.')
            res.redirect('/menu')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontra a pessoa.')
        res.redirect('/menu')
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
    var meshoje = hoje.substring(5,)

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
                                mesinicio = dtinicio.substring(5,)
                                mesfim = dtfim.substring(5,)
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
                        Tarefas.findOne({ _id: tarefa }).sort({ 'concluido': 'asc' }).then((tarefa) => {
                            Cliente.findOne({ _id: tarefa.cliente }).then((cliente) => {
                                Servico.findOne({ _id: tarefa.servico }).then((ser) => {
                                    Equipe.findOne({ _id: tarefa.equipe }).then((equipe) => {
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
                                        res.render('projeto/gerenciamento/vertarefas', { lista_tarefa, tarefa_concluida, tarefa_naoconcluida, dia })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Falha ao encontrar as equipe.')
                                        res.redirect('/gerenciamento/agenda')
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Falha ao encontrar o tipo de serviço.')
                                    res.redirect('/gerenciamento/agenda')
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Falha ao encontrar o cliente.')
                                res.redirect('/gerenciamento/agenda')
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Falha ao encontrar a tarefa.')
                            res.redirect('/gerenciamento/agenda')
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
        })
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar a todas tarefas.')
        res.redirect('/gerenciamento/agenda')
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
        res.redirect('/gerenciamento/agenda')
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

router.post('/trt', upload.single('trt'), ehAdmin, (req, res) => {
    const { _id } = req.user
    var trtfile
    //console.log('req.file=>' + req.file)
    if (req.file != null) {
        trtfile = req.file.originalname
    } else {
        trtfile = ''
    }

    Documento.findOne({ proposta: req.body.id }).then((documento) => {
        //console.log()
        if (documento != null) {
            if (trtfile != '') {
                documento.trt = trtfile
            }
            documento.dttrt = String(req.body.dttrt)
            documento.data = dataBusca(dataHoje()),
                documento.feitotrt = true
            documento.save().then(() => {
                req.flash('success_msg', 'TRT salvo com sucesso')
                res.redirect('/gerenciamento/trt/' + req.body.id)
            })
        } else {
            const trt = {
                user: id,
                proposta: req.body.id,
                trt: trtfile,
                dttrt: String(req.body.dttrt),
                data: dataBusca(dataHoje()),
                feitotrt: true
            }
            new Documento(trt).save().then(() => {
                req.flash('success_msg', 'TRT salvo com sucesso')
                res.redirect('/gerenciamento/trt/' + req.body.id)
            })
        }
    })
})

router.get('/mostrarTrt/:id', ehAdmin, (req, res) => {
    Documento.findOne({ proposta: req.params.id }).then((documento) => {
        var doc = documento.trt
        var path = __dirname
        //console.log(path)
        path = path.replace('routes', '')
        res.sendFile(path + '/public/arquivos/' + doc)
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
    console.log('req.body.id=>'+req.body.id)
    if (naoVazio(req.body.id) && req.body.id != ',') {
        Obra.findOne({ _id: req.body.id }).then((obra) => {
            if (naoVazio(req.body.cliente)) {
                obra.cliente = req.body.cliente
            }
            if (naoVazio(req.body.responsavel)) {
                obra.responsavel = req.body.responsavel
            }
            if (naoVazio(req.body.empresa)) {
                obra.empresa = req.body.empresa
            }

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
            obra.datacad = dataBusca(dataHoje())
            obra.save().then(() => {
                req.flash('success_msg', 'Proposta salva com sucesso.')
                res.redirect('/gerenciamento/obra/' + req.body.id)
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao salvar a proposta.')
                res.redirect('/gerenciamento/obra/' + req.body.id)
            })
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao encontrar a proposta.')
            res.redirect('/gerenciamento/obra/' + req.body.id)
        })
    } else {
        console.log('nova obra')
        var seq
            Obra.findOne({ user: id }).sort({ field: 'asc', _id: -1 }).then((obraseq) => {
                console.log('obraseq=>'+obraseq)
                if (naoVazio(obraseq)) {
                    seq = parseFloat(obraseq.seq) + 1
                } else {
                    seq = 1
                }
                const obra = {
                    user: id,
                    cliente: req.body.cliente,
                    responsavel: req.body.responsavel,
                    endereco: req.body.endereco,
                    empresa: req.body.empresa,
                    data: dataBusca(dataHoje()),
                    datacad: dataBusca(dataHoje()),
                    feito: false,
                    encerrado: false,
                    seq: seq,
                    status: 'Aguardando',
                }
                new Obra(obra).save().then(() => {
                    Obra.findOne({ user: id }).sort({ field: 'asc', _id: -1 }).then((nova_obra) => {
                        res.redirect('/gerenciamento/obra/' + nova_obra._id)
                    }).catch((err) => {
                        req.flash('error_msg', 'Houve um erro ao encontrar a proposta.')
                        res.redirect('/menu')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro ao salvar a proposta.')
                    res.redirect('/menu')
                })
            })
    }
})

router.post('/proposta/', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }
    //console.log(id)

    //console.log('req.body.id=>' + req.body.id)
    if (naoVazio(req.body.id)) {
        Proposta.findOne({ _id: req.body.id }).then((proposta) => {
            //console.log(proposta)
            //console.log(req.body.cliente)
            //console.log(req.body.responsavel)
            if (naoVazio(req.body.cliente)) {
                proposta.cliente = req.body.cliente
            }
            if (naoVazio(req.body.responsavel)) {
                proposta.responsavel = req.body.responsavel
            }
            if (naoVazio(req.body.empresa)) {
                proposta.empresa = req.body.empresa
            }

            proposta.endereco = req.body.endereco
            //console.log('req.body.cidade=>' + req.body.cidade)
            //console.log('req.body.cidadeh=>' + req.body.cidadeh)
            if (naoVazio(req.body.cidade)) {
                proposta.cidade = req.body.cidade
            } else {
                proposta.cidade = req.body.cidadeh
            }
            if (naoVazio(req.body.uf)) {
                proposta.uf = req.body.uf
            } else {
                proposta.uf = req.body.ufh
            }
            //console.log('datacad=>' + dataBusca(dataHoje()))
            proposta.data = dataBusca(dataHoje())
            proposta.datacad = dataBusca(dataHoje())
            proposta.save().then(() => {
                req.flash('success_msg', 'Proposta salva com sucesso.')
                res.redirect('/gerenciamento/proposta/' + req.body.id)
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao salvar a proposta.')
                res.redirect('/gerenciamento/proposta/' + req.body.id)
            })
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao encontrar a proposta.')
            res.redirect('/gerenciamento/proposta/' + req.body.id)
        })
    } else {
        //console.log('nova proposta')
        var seq
        var numpro
        //console.log('req.body.tipo=>' + req.body.tipo)
        if (req.body.tipo == 'false') {
            Pessoa.findOne({ _id: req.body.responsavel }).then((p) => {
                if (naoVazio(p.seq)) {
                    seq = parseFloat(p.seq) + 1
                    if (naoVazio(p.const)) {
                        numpro = p.const + (parseFloat(p.seq) + 1)
                    } else {
                        numpro = (parseFloat(p.seq) + 1)
                    }

                    //console.log('numpro=>' + numpro)
                    p.seq = seq
                } else {
                    if (naoVazio(p.const)) {
                        numpro = p.const + 1
                    } else {
                        numpro = 1
                    }
                    p.seq = 1
                }
                const proposta = {
                    user: id,
                    cliente: req.body.cliente,
                    responsavel: req.body.responsavel,
                    endereco: req.body.endereco,
                    empresa: req.body.empresa,
                    data: dataBusca(dataHoje()),
                    datacad: dataBusca(dataHoje()),
                    feito: true,
                    ganho: false,
                    assinado: false,
                    encerrado: false,
                    baixada: false,
                    seq: numpro,
                    status: 'Enviado',
                    ref: false,
                }
                new Proposta(proposta).save().then(() => {
                    Proposta.findOne({ user: id }).sort({ field: 'asc', _id: -1 }).then((nova_proposta) => {
                        Cliente.findOne({ _id: nova_proposta.cliente }).then((cliente) => {
                            new Equipe({
                                user: id,
                                nome_projeto: cliente.nome,
                                dtinicio: '0000-00-00',
                                dtfim: '0000-00-00',
                                feito: false,
                                liberar: false,
                                parado: false,
                                prjfeito: false
                            }).save().then(() => {
                                Equipe.findOne({ user: id }).sort({ field: 'asc', _id: -1 }).then((nova_equipe) => {
                                    //console.log('nova_proposta._id=>' + nova_proposta._id)
                                    //console.log('nova_equipe._id=>' + nova_equipe._id)
                                    nova_proposta.equipe = nova_equipe._id
                                    nova_proposta.save().then(() => {
                                        new Vistoria({
                                            user: id,
                                            proposta: nova_proposta._id,
                                            feito: false
                                        }).save().then(() => {
                                            new Compra({
                                                user: id,
                                                proposta: nova_proposta._id,
                                                feitopedido: false,
                                                feitonota: false,
                                                encerrado: false
                                            }).save().then(() => {
                                                new Documento({
                                                    user: id,
                                                    proposta: nova_proposta._id,
                                                    feitotrt: false,
                                                    protocolado: false,
                                                    feitoaceite: false,
                                                    feitoalmox: false,
                                                    feitofaturado: false,
                                                    enviaalmox: false
                                                }).save().then(() => {
                                                    new Posvenda({
                                                        user: id,
                                                        proposta: nova_proposta._id,
                                                        feito: false
                                                    }).save().then(() => {
                                                        p.save().then(() => {
                                                            Usuario.findOne({ _id: id }).then((usuario) => {
                                                                texto = 'Olá, ' + usuario.nome + ' tudo bem?' + '\n' + '\n' +
                                                                    'A proposta ' + nova_proposta.seq + ' para o cliente ' + cliente.nome + ' foi criada dia ' + dataMensagem(dataHoje()) + '. \n ' +
                                                                    'Por: ' + p.nome + '\n' + '\n' +
                                                                    'Acesse https://vimmus.com.br/usuario/login e acompanhe a proposta.'


                                                                //Parâmetros do E-mail
                                                                //console.log('email=>' + usuario.email)
                                                                var mailOptions = { // Define informações pertinentes ao E-mail que será enviado
                                                                    from: '"Nova Proposta"<proposta@vimmus.com.br>',
                                                                    to: usuario.email,
                                                                    subject: 'Criação de proposta',
                                                                    //text: 'Nome: ' + req.body.nome + ';' + 'Celular: ' + req.body.celular + ';' + 'E-mail: '+ req.body.email
                                                                    text: texto
                                                                }
                                                                transporter.sendMail(mailOptions, (err, info) => { // Função que, efetivamente, envia o email.
                                                                    if (err) {
                                                                        return  //console.log(err)
                                                                    } else {
                                                                        req.flash('success_msg', 'Proposta criada com sucesso.')
                                                                        res.redirect('/gerenciamento/proposta/' + nova_proposta._id)
                                                                    }
                                                                })
                                                            }).catch((err) => {
                                                                req.flash('error_msg', 'Houve um erro ao encontrar o usuário.')
                                                                res.redirect('/menu')
                                                            })
                                                        }).catch((err) => {
                                                            req.flash('error_msg', 'Houve um erro ao salvar a pessoa.')
                                                            res.redirect('/menu')
                                                        })
                                                    }).catch((err) => {
                                                        req.flash('error_msg', 'Houve um erro ao salvar o pós-venda.')
                                                        res.redirect('/menu')
                                                    })
                                                }).catch((err) => {
                                                    req.flash('error_msg', 'Houve um erro ao salvar o documento.')
                                                    res.redirect('/menu')
                                                })
                                            }).catch((err) => {
                                                req.flash('error_msg', 'Houve um erro ao salvar as compras.')
                                                res.redirect('/menu')
                                            })
                                        }).catch((err) => {
                                            req.flash('error_msg', 'Houve um erro ao salvar a vistoria.')
                                            res.redirect('/menu')
                                        })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Houve um erro ao salvar a proposta.')
                                        res.redirect('/menu')
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Houve um erro ao encontrar a equipe.')
                                    res.redirect('/menu')
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Houve um erro ao salvar a equipe.')
                                res.redirect('/menu')
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Houve um erro ao encontrar o cliente.')
                            res.redirect('/menu')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Houve um erro ao encontrar a proposta.')
                        res.redirect('/menu')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro ao salvar a proposta.')
                    res.redirect('/menu')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao encontrar a pessoa.')
                res.redirect('/menu')
            })
        } else {
            //console.log('endereco=>' + req.body.endereco)
            const proposta = {
                user: id,
                cliente: '61dc0e4be879aceb49640a34',
                responsavel: '61dc0d3ce879aceb49640a25',
                endereco: req.body.endereco,
                empresa: '610807d3dc2af801ec378569',
                cidade: req.body.cidade,
                uf: req.body.uf,
                data: dataBusca(dataHoje()),
                datacad: dataBusca(dataHoje()),
                feito: true,
                ganho: true,
                assinado: false,
                encerrado: false,
                baixada: false,
                seq: req.body.ref,
                status: 'Fechado',
                ref: true,
            }
            new Proposta(proposta).save().then(() => {
                Proposta.findOne({ user: id }).sort({ field: 'asc', _id: -1 }).then((nova_proposta) => {
                    new Equipe({
                        user: id,
                        nome_projeto: proposta.seq,
                        dtinicio: '0000-00-00',
                        dtfim: '0000-00-00',
                        feito: false,
                        liberar: false,
                        parado: false,
                        prjfeito: false
                    }).save().then(() => {
                        Equipe.findOne({ user: id }).sort({ field: 'asc', _id: -1 }).then((nova_equipe) => {
                            //console.log('nova_proposta._id=>' + nova_proposta._id)
                            //console.log('nova_equipe._id=>' + nova_equipe._id)
                            nova_proposta.equipe = nova_equipe._id
                            nova_proposta.save().then(() => {
                                new Vistoria({
                                    user: id,
                                    proposta: nova_proposta._id,
                                    feito: false
                                }).save().then(() => {
                                    new Compra({
                                        user: id,
                                        proposta: nova_proposta._id,
                                        feitopedido: false,
                                        feitonota: false,
                                        encerrado: false
                                    }).save().then(() => {
                                        new Documento({
                                            user: id,
                                            proposta: nova_proposta._id,
                                            feitotrt: false,
                                            protocolado: false,
                                            feitoaceite: false,
                                            feitoalmox: false,
                                            feitofaturado: false,
                                            enviaalmox: false
                                        }).save().then(() => {
                                            new Posvenda({
                                                user: id,
                                                proposta: nova_proposta._id,
                                                feito: false
                                            }).save().then(() => {
                                                Usuario.findOne({ _id: id }).then((usuario) => {
                                                    texto = 'Olá, ' + usuario.nome + ' tudo bem?' + '\n' + '\n' +
                                                        'A proposta ' + nova_proposta.seq + ' foi criada dia ' + dataMensagem(dataHoje()) + '. \n ' + '\n' +
                                                        'Acesse https://vimmus.com.br/usuario/login e acompanhe a proposta.'


                                                    //Parâmetros do E-mail
                                                    //console.log('email=>' + usuario.email)
                                                    var mailOptions = { // Define informações pertinentes ao E-mail que será enviado
                                                        from: '"Nova Proposta"<proposta@vimmus.com.br>',
                                                        to: usuario.email,
                                                        subject: 'Criação de proposta',
                                                        //text: 'Nome: ' + req.body.nome + ';' + 'Celular: ' + req.body.celular + ';' + 'E-mail: '+ req.body.email
                                                        text: texto
                                                    }
                                                    transporter.sendMail(mailOptions, (err, info) => { // Função que, efetivamente, envia o email.
                                                        if (err) {
                                                            return  //console.log(err)
                                                        } else {
                                                            req.flash('success_msg', 'Proposta criada com sucesso.')
                                                            res.redirect('/gerenciamento/proposta/' + nova_proposta._id)
                                                        }
                                                    })
                                                }).catch((err) => {
                                                    req.flash('error_msg', 'Houve um erro ao encontrar o usuário.')
                                                    res.redirect('/menu')
                                                })
                                            }).catch((err) => {
                                                req.flash('error_msg', 'Houve um erro ao salvar o pós-venda.')
                                                res.redirect('/menu')
                                            })
                                        }).catch((err) => {
                                            req.flash('error_msg', 'Houve um erro ao salvar o documento.')
                                            res.redirect('/menu')
                                        })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Houve um erro ao salvar as compras.')
                                        res.redirect('/menu')
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Houve um erro ao salvar a vistoria.')
                                    res.redirect('/menu')
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Houve um erro ao salvar a proposta.')
                                res.redirect('/menu')
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Houve um erro ao encontrar a equipe.')
                            res.redirect('/menu')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Houve um erro ao salvar a equipe.')
                        res.redirect('/menu')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro ao encontrar a nova proposta.')
                    res.redirect('/menu')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao salvar a proposta.')
                res.redirect('/menu')
            })
        }
    }
})

router.post('/proposta1', upload.single('proposta1'), ehAdmin, (req, res) => {
    var file
    //console.log('req.file=>' + req.file)
    if (req.file != null) {
        file = req.file.originalname
    } else {
        file = ''
    }
    //console.log('file=>' + file)
    Proposta.findOne({ _id: req.body.id }).then((proposta) => {
        if (naoVazio(file)) {
            proposta.proposta1 = file
        }
        proposta.dtcadastro1 = req.body.dtcadastro1
        proposta.dtvalidade1 = req.body.dtvalidade1
        proposta.datacad = dataBusca(dataHoje())
        proposta.save().then(() => {
            req.flash('success_msg', 'Proposta salva com sucesso')
            res.redirect('/gerenciamento/proposta/' + req.body.id)
        })
    })
})

router.get('/mostrarProposta1/:id', ehAdmin, (req, res) => {
    Proposta.findOne({ _id: req.params.id }).then((proposta) => {
        var doc = proposta.proposta1
        var path = __dirname
        //console.log(path)
        path = path.replace('routes', '')
        res.sendFile(path + '/public/arquivos/' + doc)
    })
})

router.post('/proposta2', upload.single('proposta2'), ehAdmin, (req, res) => {
    var file
    if (req.file != null) {
        file = req.file.originalname
    } else {
        file = ''
    }
    //console.log("req.body.id=>" + req.body.id)
    Proposta.findOne({ _id: req.body.id }).then((proposta) => {
        if (naoVazio(file)) {
            proposta.proposta2 = file
        }
        proposta.dtcadastro2 = String(req.body.dtcadastro2)
        proposta.dtvalidade2 = String(req.body.dtvalidade2)
        proposta.datacad = dataBusca(dataHoje())
        proposta.save().then(() => {
            req.flash('success_msg', 'Proposta salva com sucesso')
            res.redirect('/gerenciamento/proposta/' + req.body.id)
        })
    })
})

router.get('/mostrarProposta2/:id', ehAdmin, (req, res) => {
    Proposta.findOne({ _id: req.params.id }).then((proposta) => {
        var doc = proposta.proposta2
        var path = __dirname
        //console.log(path)
        path = path.replace('routes', '')
        res.sendFile(path + '/public/arquivos/' + doc)
    })
})

router.post('/proposta3', upload.single('proposta3'), ehAdmin, (req, res) => {
    var file
    if (req.file != null) {
        file = req.file.originalname
    } else {
        file = ''
    }
    Proposta.findOne({ _id: req.body.id }).then((proposta) => {
        if (naoVazio(file)) {
            proposta.proposta3 = file
        }
        proposta.dtcadastro3 = String(req.body.dtcadastro3)
        proposta.dtvalidade3 = String(req.body.dtvalidade3)
        proposta.datacad = dataBusca(dataHoje())
        proposta.save().then(() => {
            req.flash('success_msg', 'Proposta salva com sucesso')
            res.redirect('/gerenciamento/proposta/' + req.body.id)
        })
    })
})

router.get('/mostrarProposta3/:id', ehAdmin, (req, res) => {
    Proposta.findOne({ _id: req.params.id }).then((proposta) => {
        var doc = proposta.proposta3
        var path = __dirname
        //console.log(path)
        path = path.replace('routes', '')
        res.sendFile(path + '/public/arquivos/' + doc)
    })
})

router.post('/proposta4', upload.single('proposta4'), ehAdmin, (req, res) => {
    var file
    if (req.file != null) {
        file = req.file.originalname
    } else {
        file = ''
    }
    Proposta.findOne({ _id: req.body.id }).then((proposta) => {
        if (naoVazio(file)) {
            proposta.proposta4 = file
        }
        proposta.dtcadastro4 = String(req.body.dtcadastro4)
        proposta.dtvalidade4 = String(req.body.dtvalidade4)
        proposta.datacad = dataBusca(dataHoje())
        proposta.save().then(() => {
            req.flash('success_msg', 'Proposta salva com sucesso')
            res.redirect('/gerenciamento/proposta/' + req.body.id)
        })
    })
})

router.get('/mostrarProposta4/:id', ehAdmin, (req, res) => {
    Proposta.findOne({ _id: req.params.id }).then((proposta) => {
        var doc = proposta.proposta4
        var path = __dirname
        //console.log(path)
        path = path.replace('routes', '')
        res.sendFile(path + '/public/arquivos/' + doc)
    })
})

router.post('/proposta5', upload.single('proposta5'), ehAdmin, (req, res) => {
    var file

    if (req.file != null) {
        file = req.file.originalname
    } else {
        file = ''
    }
    Proposta.findOne({ _id: req.body.id }).then((proposta) => {
        if (naoVazio(file)) {
            proposta.proposta5 = file
        }
        proposta.dtcadastro5 = String(req.body.dtcadastro5)
        proposta.dtvalidade5 = String(req.body.dtvalidade5)
        proposta.datacad = dataBusca(dataHoje())
        proposta.save().then(() => {
            req.flash('success_msg', 'Proposta salva com sucesso')
            res.redirect('/gerenciamento/proposta/' + req.body.id)
        })
    })
})

router.get('/mostrarProposta5/:id', ehAdmin, (req, res) => {
    Proposta.findOne({ _id: req.params.id }).then((proposta) => {
        var doc = proposta.proposta5
        var path = __dirname
        //console.log(path)
        path = path.replace('routes', '')
        res.sendFile(path + '/public/arquivos/' + doc)
    })
})

router.post('/proposta6', upload.single('proposta6'), ehAdmin, (req, res) => {
    var file
    if (req.file != null) {
        file = req.file.originalname
    } else {
        file = ''
    }
    Proposta.findOne({ _id: req.body.id }).then((proposta) => {
        if (naoVazio(file)) {
            proposta.proposta6 = file
        }
        proposta.dtcadastro6 = String(req.body.dtcadastro6)
        proposta.dtvalidade6 = String(req.body.dtvalidade6)
        proposta.datacad = dataBusca(dataHoje())
        proposta.save().then(() => {
            req.flash('success_msg', 'Proposta salva com sucesso')
            res.redirect('/gerenciamento/proposta/' + req.body.id)
        })
    })
})

router.get('/mostrarProposta6/:id', ehAdmin, (req, res) => {
    Proposta.findOne({ _id: req.params.id }).then((proposta) => {
        var doc = proposta.proposta6
        var path = __dirname
        //console.log(path)
        path = path.replace('routes', '')
        res.sendFile(path + '/public/arquivos/' + doc)
    })
})

router.get('/mostrarProposta/:id', ehAdmin, (req, res) => {

    Proposta.findOne({ _id: req.params.id }).then((proposta) => {
        var doc = proposta.assinatura
        var path = __dirname
        path = path.replace('routes', '')
        res.sendFile(path + '/public/arquivos/' + doc)
    })
})

router.get('/mostrarContrato/:id', ehAdmin, (req, res) => {

    Proposta.findOne({ _id: req.params.id }).then((proposta) => {
        var doc = proposta.contrato
        var path = __dirname
        path = path.replace('routes', '')
        res.sendFile(path + '/public/arquivos/' + doc)
    })
})

router.post('/visita', ehAdmin, (req, res) => {

    const { _id } = req.user

    Vistoria.findOne({ proposta: req.body.id }).then((vistoria) => {
        //console.log('vistoria=>' + vistoria)
        if (vistoria != '' && typeof vistoria != 'undefined' && vistoria != null) {
            vistoria.plaQtdMod = req.body.plaQtdMod
            vistoria.plaWattMod = req.body.plaWattMod
            vistoria.plaQtdInv = req.body.plaQtdInv
            vistoria.plaKwpInv = req.body.plaKwpInv
            vistoria.plaDimArea = req.body.plaDimArea
            vistoria.plaQtdString = req.body.plaQtdString
            vistoria.plaModString = req.body.plaModString
            vistoria.plaQtdEst = req.body.plaQtdEst
            vistoria.save().then(() => {
                req.flash('success_msg', 'Vistoria salva com sucesso.')
                res.redirect('/gerenciamento/proposta/' + req.body.id)
            })
        } else {
            const vistoria = {
                user: id,
                proposta: req.body.id,
                plaQtdMod: req.body.plaQtdMod,
                plaWattMod: req.body.plaWattMod,
                plaQtdInv: req.body.plaQtdInv,
                plaKwpInv: req.body.plaKwpInv,
                plaDimArea: req.body.plaDimArea,
                plaQtdString: req.body.plaQtdString,
                plaModString: req.body.plaModString,
                plaQtdEst: req.body.plaQtdEst,
            }
            new Vistoria(vistoria).save().then(() => {

                req.flash('success_msg', 'Vistoria salva com sucesso.')
                res.redirect('/gerenciamento/proposta/' + req.body.id)

            }).catch(() => {
                req.flash('error_msg', 'Falha ao salvar a vistoria.')
                res.redirect('/gerenciamento/proposta/' + req.body.id)
            })
        }
    }).catch(() => {
        req.flash('error_msg', 'Falha ao encontrar a vistoria.')
        res.redirect('/gerenciamento/proposta/' + req.body.id)
    })
})

router.post('/assinatura', upload.single('assinado'), ehAdmin, (req, res) => {
    var file
    if (req.file != null) {
        file = req.file.originalname
    } else {
        file = ''
    }
    var previsao
    var prazo = req.body.prazo
    if (naoVazio(prazo)) {
        previsao = setData(req.body.dtassinatura, prazo)
    } else {
        prazo = 0
        previsao = 0
    }

    Proposta.findOne({ _id: req.body.id }).then((proposta) => {
        Documento.findOne({ proposta: req.body.id }).then((documento) => {
            //console.log('proposta.equipe=>'+proposta.equipe)
            Equipe.findOne({ _id: proposta.equipe }).then((equipe) => {
                if (file != '') {
                    documento.assinatura = file
                }
                documento.dtassinatura = String(req.body.dtassinatura)
                documento.prazo = prazo
                documento.deadline = dataBusca(previsao)
                proposta.assinado = true
                proposta.save().then(() => {
                    //console.log('proposta salva')
                    documento.save().then(() => {
                        equipe.dtfim = previsao
                        equipe.dtfimbusca = dataBusca(previsao)
                        equipe.save().then(() => {
                            req.flash('success_msg', 'Documento salvo com sucesso.')
                            res.redirect('/gerenciamento/assinatura/' + req.body.id)
                        })
                    }).catch(() => {
                        req.flash('error_msg', 'Falha ao salvar o documento.')
                        res.redirect('/gerenciamento/proposta/' + req.body.id)
                    })
                }).catch(() => {
                    req.flash('error_msg', 'Falha ao salvar a proposta.')
                    res.redirect('/gerenciamento/proposta/' + req.body.id)
                })
            }).catch(() => {
                req.flash('error_msg', 'Falha ao encontrar a equipe.')
                res.redirect('/gerenciamento/proposta/' + req.body.id)
            })
        }).catch(() => {
            req.flash('error_msg', 'Falha ao encontrar o documento.')
            res.redirect('/gerenciamento/proposta/' + req.body.id)
        })
    }).catch(() => {
        req.flash('error_msg', 'Falha ao encontrar a proposta<ass>.')
        res.redirect('/gerenciamento/proposta/' + req.body.id)
    })
})

router.post('/contrato', upload.single('contrato'), ehAdmin, (req, res) => {
    var contratofile
    if (req.file != null) {
        contratofile = req.file.originalname
    } else {
        contratofile = ''
    }
    Documento.findOne({ proposta: req.body.id }).then((documento) => {
        if (contratofile != '') {
            documento.contrato = contratofile
        }
        documento.dtcontrato = String(req.body.dtcontrato)
        documento.save().then(() => {
            req.flash('success_msg', 'Documento salvo com sucesso.')
            res.redirect('/gerenciamento/assinatura/' + req.body.id)
        })
    }).catch(() => {
        req.flash('error_msg', 'Falha ao encontrar o documento.')
        res.redirect('/gerenciamento/proposta/' + req.body.id)
    })
})

router.post('/pedido', upload.single('pedido'), ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }
    var file
    if (req.file != null) {
        file = req.file.originalname
    } else {
        file = ''
    }

    var prazo = req.body.prazo
    var previsao
    //console.log('prazo=>' + prazo)
    //console.log('req.body.dtcadastro=>' + req.body.dtcadastro)
    if (naoVazio(prazo)) {
        previsao = setData(req.body.dtcadastro, prazo)
    } else {
        prazo = 0
        previsao = 0
    }
    //console.log('previsao=>' + previsao)

    Compra.findOne({ proposta: req.body.id }).then((compra) => {
        //console.log('compra=>' + compra)
        if (compra == null) {
            const pedido = {
                user: id,
                fornecedor: req.body.fornecedor,
                proposta: req.body.id,
                pedido: file,
                dtcadastro: String(req.body.dtcadastro),
                feitopedido: true,
                data: dataBusca(dataHoje()),
                prazo: prazo,
                dtprevisao: dataBusca(previsao)
            }
            new Compra(pedido).save().then(() => {
                req.flash('success_msg', 'Pedido salvo com sucesso.')
                res.redirect('/gerenciamento/compra/' + req.body.id)
            }).catch(() => {
                req.flash('error_msg', 'Falha ao salvar o pedido.')
                res.redirect('/gerenciamento/compra/' + req.body.id)
            })
        } else {
            if (file != '') {
                compra.pedido = file
            }
            compra.fornecedor = req.body.fornecedor
            compra.feitopedido = true
            compra.data = dataBusca(dataHoje())
            compra.dtcadastro = String(req.body.dtcadastro)
            compra.feitopedido = true
            compra.prazo = prazo
            compra.dtprevisao = dataBusca(previsao)
            compra.save().then(() => {
                req.flash('success_msg', 'Documento salvo com sucesso.')
                res.redirect('/gerenciamento/compra/' + req.body.id)
            }).catch(() => {
                req.flash('error_msg', 'Falha ao salvar o pedido.')
                res.redirect('/gerenciamento/compra/' + req.body.id)
            })
        }
    }).catch(() => {
        req.flash('error_msg', 'Falha ao encontrar a compra')
        res.redirect('/gerenciamento/compra/' + req.body.id)
    })
})

router.get('/mostrarPedido/:id', ehAdmin, (req, res) => {
    Compra.findOne({ proposta: req.params.id }).then((compra) => {
        var doc = compra.pedido
        var path = __dirname
        //console.log(path)
        path = path.replace('routes', '')
        res.sendFile(path + '/public/arquivos/' + doc)
    }).catch(() => {
        req.flash('error_msg', 'Falha ao encontrar a compra.')
        res.redirect('/gerenciamento/compra/' + req.body.id)
    })
})

router.post('/nota', upload.single('nota'), ehAdmin, (req, res) => {
    var file
    if (req.file != null) {
        file = req.file.originalname
    } else {
        file = ''
    }
    Compra.findOne({ proposta: req.body.id }).then((compra) => {
        if (file != '') {
            compra.nota = file
        }
        compra.dtrecebimento = String(req.body.dtrecebimento)
        compra.feitonota = true
        compra.save().then(() => {
            req.flash('success_msg', 'Nota salva com sucesso.')
            res.redirect('/gerenciamento/compra/' + req.body.id)
        }).catch(() => {
            req.flash('error_msg', 'Falha ao salvar a nota.')
            res.redirect('/gerenciamento/compra/' + req.body.id)
        })
    }).catch(() => {
        req.flash('error_msg', 'Falha ao encontrar a compra.')
        res.redirect('/gerenciamento/compra/' + req.body.id)
    })
})

router.get('/mostrarNota/:id', ehAdmin, (req, res) => {
    Compra.findOne({ proposta: req.params.id }).then((compra) => {
        var doc = compra.nota
        var path = __dirname
        //console.log(path)
        path = path.replace('routes', '')
        res.sendFile(path + '/public/arquivos/' + doc)
    }).catch(() => {
        req.flash('error_msg', 'Falha ao encontrar a compra.')
        res.redirect('/gerenciamento/compra/' + req.body.id)
    })
})

router.post('/salvarpadrao', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }
    var ins_dentro = []
    var ins_fora = []
    var instalador_alocado = []
    var lista_res = []
    var qe = 0
    var qx = false
    var q = 0
    var custoins = 0
    var numprj = 0
    var validaLivre = 0
    var ins0 = ''
    var ins1 = ''
    var ins2 = ''
    var ins3 = ''
    var ins4 = ''
    var ins5 = ''
    var diferenca = 0
    var ins_dif = 0
    var n = ''
    var nome_equipe = ''

    var dataini = dataBusca(req.body.dtinicio)
    var datafim = dataBusca(req.body.dtfim)
    var dtini

    //console.log('req.body.id=>' + req.body.id)
    Proposta.findOne({ _id: req.body.id, encerrado: false, ganho: true }).lean().then((proposta) => {
        Cliente.findOne({ _id: proposta.cliente }).lean().then((cliente) => {
            //console.log('validação dos instaladores.')
            Documento.findOne({ proposta: req.body.id }).lean().then((documento) => {
                Compra.findOne({ proposta: req.body.id }).lean().then((compra) => {
                    Vistoria.findOne({ proposta: req.body.id }).lean().then((vistoria) => {
                        Posvenda.findOne({ proposta: req.body.id }).lean().then((posvenda) => {
                            Equipe.find({ user: id, nome: { $exists: true }, ehpadrao: true }).lean().then((equipes) => {
                                //Verificando as pessoas em cada equipe
                                //console.log('qi=>' + qi)
                                Equipe.findOne({ _id: proposta.equipe }).then((nomes) => {
                                    if (req.body.equipe != 'Todos') {
                                        Equipe.findOne({ nome: req.body.equipe }).then((padrao) => {
                                            nomes.dtinicio = req.body.dtinicio
                                            nomes.dtfim = req.body.dtfim
                                            nomes.dtinibusca = dataBusca(req.body.dtinicio)
                                            nomes.dtfimbusca = dataBusca(req.body.dtfim)
                                            nomes.ins0 = padrao.ins0
                                            nomes.ins1 = padrao.ins1
                                            nomes.ins2 = padrao.ins2
                                            nomes.ins3 = padrao.ins3
                                            nomes.ins4 = padrao.ins4
                                            nomes.ins5 = padrao.ins5
                                            nomes.nome_equipe = req.body.equipe
                                            //console.log('nome_equipe=>' + nome_equipe)
                                            nomes.save().then(() => {
                                                for (var x = 0; x < 6; x++) {
                                                    if (x == 0) {
                                                        n = padrao.ins0
                                                    } else {
                                                        if (x == 1) {
                                                            n = padrao.ins1
                                                        } else {
                                                            if (x == 2) {
                                                                n = padrao.ins2
                                                            } else {
                                                                if (x == 3) {
                                                                    n = padrao.ins3
                                                                } else {
                                                                    if (x == 4) {
                                                                        n = padrao.ins4
                                                                    } else {
                                                                        qx = true
                                                                        n = padrao.ins5
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }

                                                    Pessoa.findOne({ user: id, nome: n, insres: 'checked' }).then((p) => {
                                                        //console.log('p=>' + p)
                                                        if (naoVazio(p)) {
                                                            lista_res.push({ id: p._id, nome: p.nome })
                                                        }
                                                    }).catch((err) => {
                                                        req.flash('error_msg', 'Falha ao encontrar a pessoa.')
                                                        res.redirect('/gerenciamento/equipe/' + req.body.id)
                                                    })
                                                    if (qx == true) {
                                                        Equipe.find({ 'nome_projeto': { $exists: true }, $and: [{ 'dtinicio': { $ne: '0000-00-00' } }, { 'dtinicio': { $ne: '' } }] }).then((equipe) => {
                                                            equipe.forEach((e) => {
                                                                // Proposta.findOne({equipe: e.equipe, encerrado: false})
                                                                //console.log('e._id=>' + e._id)
                                                                q++
                                                                diferenca = e.dtfimbusca - e.dtinibusca
                                                                //console.log('diferenca=>' + diferenca)
                                                                if (isNaN(diferenca) == false) {
                                                                    for (x = 0; x < diferenca + 1; x++) {
                                                                        var date = String(e.dtinibusca)
                                                                        var ano = date.substring(0, 4)
                                                                        var mes = date.substring(4, 6) - parseFloat(1)
                                                                        var dia = date.substring(6, 10)
                                                                        var data = new Date(ano, mes, dia)
                                                                        var nova_data = new Date()
                                                                        nova_data.setDate(data.getDate() + parseFloat(x))
                                                                        ano = nova_data.getFullYear()
                                                                        mes = (nova_data.getMonth() + parseFloat(1))
                                                                        if (mes < 10) {
                                                                            mes = '0' + mes
                                                                        }
                                                                        dia = nova_data.getDate()
                                                                        if (dia < 10) {
                                                                            dia = '0' + dia
                                                                        }
                                                                        nova_data = ano + '' + mes + '' + dia

                                                                        if (dataini < nova_data) {
                                                                            dtini = nova_data
                                                                        } else {
                                                                            dtini = dataini
                                                                        }

                                                                        //console.log('nova_data=>'+nova_data)
                                                                        //console.log('dtini=>'+dtini)
                                                                        //console.log('dataini=>'+dataini)
                                                                        //console.log('date=>'+date)

                                                                        if (nova_data == dtini && dataini >= dtini && parseFloat(date) >= dataini) {
                                                                            ins_dif = 1
                                                                            //console.log('entrou')
                                                                            Pessoa.find({ $or: [{ 'funins': 'checked' }, { 'funele': 'checked' }], user: id }).then((todos_instaladores) => {
                                                                                //console.log('todos_instaladores=>'+todos_instaladores)                                
                                                                                //console.log('req.body.equipe=>' + req.body.equipe)
                                                                                //console.log('instaladores=>'+instaladores)
                                                                                todos_instaladores.forEach((ins) => {
                                                                                    numprj++
                                                                                    //console.log('Recurso=>' + ins.nome)
                                                                                    //console.log('proposta.equipe=>' + proposta.equipe)
                                                                                    Equipe.findOne({ _id: e._id, $or: [{ 'ins0': ins.nome }, { 'ins1': ins.nome }, { 'ins2': ins.nome }, { 'ins3': ins.nome }, { 'ins4': ins.nome }, { 'ins5': ins.nome }] }).then((equipe) => {
                                                                                        //console.log('equipe=>' + equipe)
                                                                                        qe++
                                                                                        if (equipe != null) {
                                                                                            if (instalador_alocado.length == 0) {
                                                                                                instalador_alocado.push({ nome: ins.nome })
                                                                                                //console.log(ins.nome + ' está alocado.')
                                                                                            } else {
                                                                                                for (i = 0; i < instalador_alocado.length; i++) {
                                                                                                    if (instalador_alocado[i].nome != ins.nome) {
                                                                                                        instalador_alocado.push({ nome: ins.nome })
                                                                                                        //console.log(ins.nome + ' está alocado.')
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                        //console.log('numprj=>' + numprj)
                                                                                        //console.log('qe=>' + qe)
                                                                                        if (numprj == qe) {
                                                                                            //console.log('É o último!')

                                                                                            //console.log('equipeins.ins0=>' + equipeins.ins0)
                                                                                            //console.log('equipeins.ins1=>' + equipeins.ins1)
                                                                                            //console.log('equipeins.ins2=>' + equipeins.ins2)
                                                                                            //console.log('equipeins.ins3=>' + equipeins.ins3)
                                                                                            //console.log('equipeins.ins4=>' + equipeins.ins4)
                                                                                            //console.log('equipeins.ins5=>' + equipeins.ins5)

                                                                                            if (typeof padrao.ins0 != 'undefined') {
                                                                                                ins0 = padrao.ins0
                                                                                            }
                                                                                            if (typeof padrao.ins1 != 'undefined') {
                                                                                                ins1 = padrao.ins1
                                                                                            }
                                                                                            if (typeof padrao.ins2 != 'undefined') {
                                                                                                ins2 = padrao.ins2
                                                                                            }
                                                                                            if (typeof padrao.ins3 != 'undefined') {
                                                                                                ins3 = padrao.ins3
                                                                                            }
                                                                                            if (typeof padrao.ins4 != 'undefined') {
                                                                                                ins4 = padrao.ins4
                                                                                            }
                                                                                            if (typeof padrao.ins5 != 'undefined') {
                                                                                                ins5 = padrao.ins5
                                                                                            }

                                                                                            Pessoa.find({ $or: [{ 'funins': 'checked' }, { 'funele': 'checked' }], user: id }).sort({ 'nome': 'asc' }).then((instalacao) => {
                                                                                                //console.log('equ=>' + equ)
                                                                                                //console.log('instaladores=>' + instaladores)
                                                                                                instalacao.forEach((pesins) => {
                                                                                                    //console.log('instalador_alocado.length=>' + instalador_alocado.length)
                                                                                                    //console.log('pesins.nome=>' + pesins.nome)
                                                                                                    if (instalador_alocado.length == '') {
                                                                                                        //console.log('não tem instalador alocado')
                                                                                                        if (pesins.custo == null || pesins.custo == '' || typeof pesins.custo == 'undefined') {
                                                                                                            custoins = 0
                                                                                                        } else {
                                                                                                            custoins = pesins.custo
                                                                                                        }
                                                                                                        var nome = pesins.nome
                                                                                                        var id = pesins._id
                                                                                                        if (nome == ins0) {
                                                                                                            ins_dentro.push({ id, nome, custo: custoins })
                                                                                                        } else {
                                                                                                            if (nome == ins1) {
                                                                                                                ins_dentro.push({ id, nome, custo: custoins })
                                                                                                            } else {
                                                                                                                if (nome == ins2) {
                                                                                                                    ins_dentro.push({ id, nome, custo: custoins })
                                                                                                                } else {
                                                                                                                    if (nome == ins3) {
                                                                                                                        ins_dentro.push({ id, nome, custo: custoins })
                                                                                                                    } else {
                                                                                                                        if (nome == ins4) {
                                                                                                                            ins_dentro.push({ id, nome, custo: custoins })
                                                                                                                        } else {
                                                                                                                            if (nome == ins5) {
                                                                                                                                ins_dentro.push({ id, nome, custo: custoins })
                                                                                                                            } else {
                                                                                                                                ins_fora.push({ id, nome, custo: custoins })
                                                                                                                            }
                                                                                                                        }
                                                                                                                    }
                                                                                                                }
                                                                                                            }
                                                                                                        }
                                                                                                    } else {
                                                                                                        const encontrou_ins = instalador_alocado.find((user) => user.nome === pesins.nome)
                                                                                                        //console.log('encontrou recurso alocado=>' + encontrou_ins)
                                                                                                        if (typeof encontrou_ins == 'undefined') {
                                                                                                            var nome = pesins.nome
                                                                                                            var id = pesins._id
                                                                                                            //console.log(nome + ' não está alocado.')
                                                                                                            if (nome == ins0) {
                                                                                                                ins_dentro.push({ id, nome, custo: custoins })
                                                                                                            } else {
                                                                                                                if (nome == ins1) {
                                                                                                                    ins_dentro.push({ id, nome, custo: custoins })
                                                                                                                } else {
                                                                                                                    if (nome == ins2) {
                                                                                                                        ins_dentro.push({ id, nome, custo: custoins })
                                                                                                                    } else {
                                                                                                                        if (nome == ins3) {
                                                                                                                            ins_dentro.push({ id, nome, custo: custoins })
                                                                                                                        } else {
                                                                                                                            if (nome == ins4) {
                                                                                                                                ins_dentro.push({ id, nome, custo: custoins })
                                                                                                                            } else {
                                                                                                                                if (nome == ins5) {
                                                                                                                                    ins_dentro.push({ id, nome, custo: custoins })
                                                                                                                                } else {
                                                                                                                                    ins_fora.push({ id, nome, custo: custoins })
                                                                                                                                }
                                                                                                                            }
                                                                                                                        }
                                                                                                                    }
                                                                                                                }
                                                                                                            }
                                                                                                        } else {
                                                                                                            var nome = pesins.nome
                                                                                                            var id = pesins._id
                                                                                                            //console.log(nome + ' está alocado.')
                                                                                                            if (nome == ins0) {
                                                                                                                ins_dentro.push({ id, nome, custo: custoins })
                                                                                                            } else {
                                                                                                                if (nome == ins1) {
                                                                                                                    ins_dentro.push({ id, nome, custo: custoins })
                                                                                                                } else {
                                                                                                                    if (nome == ins2) {
                                                                                                                        ins_dentro.push({ id, nome, custo: custoins })
                                                                                                                    } else {
                                                                                                                        if (nome == ins3) {
                                                                                                                            ins_dentro.push({ id, nome, custo: custoins })
                                                                                                                        } else {
                                                                                                                            if (nome == ins4) {
                                                                                                                                ins_dentro.push({ id, nome, custo: custoins })
                                                                                                                            } else {
                                                                                                                                if (nome == ins5) {
                                                                                                                                    ins_dentro.push({ id, nome, custo: custoins })
                                                                                                                                }
                                                                                                                            }
                                                                                                                        }
                                                                                                                    }
                                                                                                                }
                                                                                                            }
                                                                                                        }
                                                                                                    }
                                                                                                })

                                                                                                //console.log('ins_dentro_ultimo=>' + ins_dentro)
                                                                                                //console.log('ins_fora_ultimo=>' + ins_fora)
                                                                                                Equipe.findOne({ _id: proposta.equipe }).lean().then((lista_equipe) => {
                                                                                                    Pessoa.findOne({ _id: lista_equipe.insres }).lean().then((insres) => {
                                                                                                        //console.log('nome_equipe=>' + nome_equipe)
                                                                                                        //res.render('principal/equipe', { proposta, cliente, documento, compra, vistoria, posvenda, equipes, lista_equipe, ins_fora, ins_dentro, nome_equipe, lista_res, insres })]
                                                                                                        req.flash('success_msg', 'Equipe salva com sucesso.')
                                                                                                        res.redirect('/gerenciamento/equipe/' + req.body.id)
                                                                                                    }).catch((err) => {
                                                                                                        req.flash('error_msg', 'Falha ao encontrar o responsável.')
                                                                                                        res.redirect('/gerenciamento/equipe/' + req.body.id)
                                                                                                    })
                                                                                                }).catch((err) => {
                                                                                                    req.flash('error_msg', 'Falha ao encontrar a equipe<achou>.')
                                                                                                    res.redirect('/gerenciamento/equipe/' + req.body.id)
                                                                                                })
                                                                                            }).catch((err) => {
                                                                                                req.flash('error_msg', 'Falha ao encontrar os instaladores.')
                                                                                                res.redirect('/gerenciamento/equipe/' + req.body.id)
                                                                                            })
                                                                                        }
                                                                                    }).catch((err) => {
                                                                                        req.flash('error_msg', 'Falha ao encontrar as equipes<2>.')
                                                                                        res.redirect('/gerenciamento/equipe/' + req.body.id)
                                                                                    })
                                                                                })
                                                                            }).catch((err) => {
                                                                                req.flash('error_msg', 'Falha ao encontrar os instaladores na equipe.')
                                                                                res.redirect('/gerenciamento/equipe/' + req.body.id)
                                                                            })
                                                                        }
                                                                    }
                                                                }

                                                                if (validaLivre == 0 && ins_dif == 0 && q == equipe.length) {
                                                                    validaLivre = 1
                                                                    Equipe.findOne({ _id: proposta.equipe }).lean().then((equipeins) => {
                                                                        Pessoa.find({ $or: [{ 'funins': 'checked' }, { 'funele': 'checked' }], user: id }).then((instalacao) => {
                                                                            //console.log('entrou diferença')
                                                                            //console.log('equipeins.ins0=>' + equipeins.ins0)
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
                                                                                if (naoVazio(pesins.custo)) {
                                                                                    custoins = pesins.custo
                                                                                } else {
                                                                                    custoins = 0
                                                                                }
                                                                                var nome = pesins.nome
                                                                                var id = pesins._id
                                                                                if (nome == ins0) {
                                                                                    ins_dentro.push({ id, nome, custo: custoins })
                                                                                } else {
                                                                                    if (nome == ins1) {
                                                                                        ins_dentro.push({ id, nome, custo: custoins })
                                                                                    } else {
                                                                                        if (nome == ins2) {
                                                                                            ins_dentro.push({ id, nome, custo: custoins })
                                                                                        } else {
                                                                                            if (nome == ins3) {
                                                                                                ins_dentro.push({ id, nome, custo: custoins })
                                                                                            } else {
                                                                                                if (nome == ins4) {
                                                                                                    ins_dentro.push({ id, nome, custo: custoins })
                                                                                                } else {
                                                                                                    if (nome == ins5) {
                                                                                                        ins_dentro.push({ id, nome, custo: custoins })
                                                                                                    } else {
                                                                                                        ins_fora.push({ id, nome, custo: custoins })
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            })
                                                                            //console.log('ins_dentro_dif=>' + ins_dentro)
                                                                            //console.log('ins_fora_dif=>' + ins_fora)
                                                                            //Verificando os responsáveis alocados na equipe
                                                                            //Verificando as pessoas em cada equipe
                                                                            //console.log('qi=>' + qi)
                                                                            Equipe.findOne({ _id: proposta.equipe }).then((nomes) => {
                                                                                //console.log('nomes=>' + nomes)
                                                                                if (nomes != '' && nomes != null && typeof nomes != 'undefined') {
                                                                                    for (var x = 0; x < 6; x++) {
                                                                                        if (x == 0) {
                                                                                            n = nomes.ins0
                                                                                        } else {
                                                                                            if (x == 1) {
                                                                                                n = nomes.ins1
                                                                                            } else {
                                                                                                if (x == 2) {
                                                                                                    n = nomes.ins2
                                                                                                } else {
                                                                                                    if (x == 3) {
                                                                                                        n = nomes.ins3
                                                                                                    } else {
                                                                                                        if (x == 4) {
                                                                                                            n = nomes.ins4
                                                                                                        } else {
                                                                                                            qx = true
                                                                                                            n = nomes.ins5
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }

                                                                                        //console.log('qx=>' + qx)
                                                                                        //console.log('id=>' + id)
                                                                                        Pessoa.findOne({ user: id, nome: n, insres: 'checked' }).then((p) => {
                                                                                            //console.log('p=>' + p)
                                                                                            if (naoVazio(p)) {
                                                                                                lista_res.push({ id: p._id, nome: p.nome })
                                                                                            }
                                                                                        }).catch((err) => {
                                                                                            req.flash('error_msg', 'Falha ao encontrar a pessoa.')
                                                                                            res.redirect('/gerenciamento/equipe/' + req.body.id)
                                                                                        })
                                                                                        //console.log('qx=>' + qx)
                                                                                        if (qx == true) {
                                                                                            Equipe.findOne({ _id: proposta.equipe }).lean().then((lista_equipe) => {
                                                                                                Pessoa.findOne({ _id: lista_equipe.insres }).lean().then((insres) => {
                                                                                                    //console.log('lista_equipe.nome_equipe=>' + lista_equipe.nome_equipe)
                                                                                                    // if (naoVazio(lista_equipe.nome_equipe)) {
                                                                                                    //     nome_equipe = lista_equipe.nome_equipe
                                                                                                    // } else {
                                                                                                    //     nome_equipe = req.body.equipe
                                                                                                    // }
                                                                                                    // res.render('principal/equipe', { proposta, cliente, documento, compra, vistoria, posvenda, equipes, lista_equipe, ins_fora, ins_dentro, nome_equipe, lista_res, insres })
                                                                                                    req.flash('success_msg', 'Equipe salva com sucesso.')
                                                                                                    res.redirect('/gerenciamento/equipe/' + req.body.id)
                                                                                                }).catch((err) => {
                                                                                                    req.flash('error_msg', 'Falha ao encontrar o instalador responsável.')
                                                                                                    res.redirect('/gerenciamento/equipe/' + req.body.id)
                                                                                                })
                                                                                            }).catch((err) => {
                                                                                                req.flash('error_msg', 'Falha ao encontrar a equipe<lista_equipe> ')
                                                                                                res.redirect('/gerenciamento/equipe/' + req.body.id)
                                                                                            })
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }).catch((err) => {
                                                                                req.flash('error_msg', 'Falha ao encontrar a equipe<nomes>.')
                                                                                res.redirect('/gerenciamento/equipe/' + req.body.id)
                                                                            })
                                                                        }).catch((err) => {
                                                                            req.flash('error_msg', 'Falha ao encontrar os instaladores.')
                                                                            res.redirect('/gerenciamento/equipe/' + req.params.id)
                                                                        })
                                                                    }).catch((err) => {
                                                                        req.flash('error_msg', 'Falha ao encontrar os instaladores na equipe.')
                                                                        res.redirect('/gerenciamento/equipe/' + req.params.id)
                                                                    })
                                                                }
                                                            })
                                                        }).catch((err) => {
                                                            req.flash('error_msg', 'Falha ao encontrar a equipe<geral>.')
                                                            res.redirect('/gerenciamento/equipe/' + req.body.id)
                                                        })
                                                    }
                                                }
                                            }).catch((err) => {
                                                req.flash('error_msg', 'Falha ao salvar a equipe.')
                                                res.redirect('/gerenciamento/equipe/' + req.body.id)
                                            })
                                        }).catch((err) => {
                                            req.flash('error_msg', 'Falha ao encontrar a equipe padrão.')
                                            res.redirect('/gerenciamento/equipe/' + req.body.id)
                                        })
                                    } else {
                                        nomes.dtinicio = req.body.dtinicio
                                        nomes.dtfim = req.body.dtfim
                                        nomes.dtinibusca = dataBusca(req.body.dtinicio)
                                        nomes.dtfimbusca = dataBusca(req.body.dtfim)
                                        nomes.nome_equipe = req.body.equipe
                                        nomes.save().then(() => {
                                            req.flash('aviso_msg', 'Projeto sem equipe padrão. Selecione a equipe do projeto e clique em aplicar')
                                            res.redirect('/gerenciamento/equipe/' + req.body.id)
                                        })
                                    }
                                }).catch((err) => {
                                    req.flash('error_msg', 'Falha ao encontrar a euipe<nomes>.')
                                    res.redirect('/gerenciamento/equipe/' + req.body.id)
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Falha ao encontrar as equipes<equipes>.')
                                res.redirect('/gerenciamento/equipe/' + req.body.id)
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Falha ao encontrar o pós venda.')
                            res.redirect('/gerenciamento/equipe/' + req.body.id)
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Falha ao encontrar a vistoria.')
                        res.redirect('/gerenciamento/equipe/' + req.body.id)
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Falha ao encontrar a compra.')
                    res.redirect('/gerenciamento/equipe/' + req.body.id)
                })
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao encontrar o documento.')
                res.redirect('/gerenciamento/equipe/' + req.body.id)
            })

        }).catch((err) => {
            req.flash('error_msg', 'Houve erro ao encontrar o cliente.')
            res.redirect('/gerenciamento/equipe/' + req.body.id)
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve erro ao encontrar a proposta.')
        res.redirect('/gerenciamento/equipe/' + req.body.id)
    })
})

router.post("/salvarequipe", ehAdmin, (req, res) => {

    var custototal = 0
    var custoins = []
    var email = []
    var todos_emails = ''
    var arroba = []

    Proposta.findOne({ _id: req.body.id }).then((proposta) => {
        Equipe.findOne({ _id: proposta.equipe }).then((equipe) => {

            //Adicionar custo por instalador
            custoins = req.body.custo
            email = req.body.email
            //console.log('email=>' + email)
            if (naoVazio(custoins)) {
                for (i = 0; i < custoins.length; i++) {
                    //console.log('custoins[i]' + custoins[i])
                    custototal = parseFloat(custototal) + parseFloat(custoins[i])
                }
                //console.log('custototal=>' + custototal)
                equipe.custoins = custototal
            }
            if (naoVazio(email)) {
                //console.log('entrou')
                arroba = String(email).split('@')
                //console.log('arroba=>' + arroba)
                if (arroba.length > 2) {
                    for (i = 0; i < email.length; i++) {
                        todos_emails = todos_emails + email[i] + ';'
                    }
                    //console.log('todos_emails')
                    equipe.email = todos_emails
                } else {
                    equipe.email = email
                }
            }

            if (naoVazio(req.body.idins0)) {
                equipe.idins0 = req.body.idins0
                equipe.nome_equipe = req.body.nome_equipe
                if (naoVazio(req.body.insres)) {
                    equipe.insres = req.body.insres
                    equipe.feito = true
                } else {
                    req.flash('aviso_msg', 'Selecione um instalador responsável para continuar e clique novamente em aplicar.')
                }
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

            equipe.ins0 = req.body.ins0
            equipe.ins1 = req.body.ins1
            equipe.ins2 = req.body.ins2
            equipe.ins3 = req.body.ins3
            equipe.ins4 = req.body.ins4
            equipe.ins5 = req.body.ins5
            equipe.dtfim = req.body.datafim
            equipe.dtinicio = req.body.datainicio
            equipe.dtfimbusca = dataBusca(req.body.datafim)
            equipe.dtinibusca = dataBusca(req.body.datainicio)
            equipe.save().then(() => {
                req.flash('success_msg', 'Equipe salva com sucesso.')
                res.redirect('/gerenciamento/equipe/' + req.body.id)
            }).catch((err) => {
                req.flash('error_msg', 'Houve erro ao salvar a equipe.')
                res.redirect('/gerenciamento/equipe/' + req.body.id)
            })
        }).catch((err) => {
            req.flash('error_msg', 'Houve erro ao encontrar a equipe.')
            res.redirect('/gerenciamento/equipe/' + req.body.id)
        })

    }).catch((err) => {
        req.flash('error_msg', 'Houve erro ao encontrar a proposta.')
        res.redirect('/gerenciamento/equipe/' + req.body.id)
    })
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
                    //console.log('equipe.liberar=>' + equipe.liberar)
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
                                        transporter.sendMail(mailOptions, (err, info) => { // Função que, efetivamente, envia o email.
                                            if (err) {
                                                return //console.log(err)
                                            } else {
                                                req.flash(tipo, mensagem)
                                                res.redirect('/gerenciamento/equipe/' + req.params.id)
                                            }

                                        })
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
                                            transporter.sendMail(mailOptions, (err, info) => { // Função que, efetivamente, envia o email.
                                                if (err) {
                                                    return //console.log(err)
                                                } else {
                                                    req.flash(tipo, mensagem)
                                                    res.redirect('/gerenciamento/equipe/' + req.params.id)
                                                }

                                            })
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

                            var email
                            if (naoVazio(equipe.email)) {
                                email = equipe.email
                            } else {
                                email = ''
                            }
                            //console.log('email=>' + email)
                            Pessoa.findOne({ _id: equipe.insres }).then((insres) => {
                                //console.log('insres.nome=>' + insres.nome)
                                var mailOptions = { // Define informações pertinentes ao E-mail que será enviado
                                    from: '"Nova equipe" <equipe@vimmus.com.br>',
                                    to: email,
                                    subject: 'Atividades da equipe',
                                    text: 'Olá Instalador,' + '\n' +
                                        'Você esta alocado para a equipe do projeto: ' + tarefa.seq + '/' + equipe.nome_projeto + ', esta instalação está planejada para ser realizada entre os dias: ' + dataMensagem(equipe.dtinicio) + ' e ' + dataMensagem(equipe.dtfim) + '\n' +
                                        'O endereço para a instalação é: ' + tarefa.endereco + ' município de: ' + tarefa.cidade + '/' + tarefa.uf + '\n' +
                                        'O técnico responsável pelo serviço será: ' + insres.nome + '\n' +
                                        'Acesse seu aplicativo para acopanhar a evolução da obra.'
                                }
                                transporter.sendMail(mailOptions, (err, info) => { // Função que, efetivamente, envia o email.
                                    if (err) {
                                        return //console.log(err)
                                    } else {
                                        req.flash(tipo, mensagem)
                                        res.redirect('/gerenciamento/mostraEquipe/' + req.params.id)
                                    }
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Houve erro ao encontrar o instalador responsável.')
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

router.post('/aceite', upload.single('aceite'), ehAdmin, (req, res) => {
    var file
    if (req.file != null) {
        file = req.file.originalname
    } else {
        file = ''
    }
    Documento.findOne({ proposta: req.body.id }).then((documento) => {
        if (file != '') {
            documento.aceite = file
        }
        AtvAterramento.findOne({ proposta: req.body.id }).then((atva) => {
            AtvTelhado.findOne({ proposta: req.body.id }).then((atvt) => {
                AtvInversor.findOne({ proposta: req.body.id }).then((atvi) => {
                    if (atva.aprova == true && atvt.aprova == true && atvi.aprova == true) {
                        documento.feitoaceite = true
                    } else {
                        documento.feitoaceite = false
                    }
                    documento.dtaceite = String(req.body.dtaceite)
                    documento.save().then(() => {
                        req.flash('success_msg', 'Documento salvo com sucesso.')
                        res.redirect('/gerenciamento/aceite/' + req.body.id)
                    }).catch(() => {
                        req.flash('error_msg', 'Falha ao encontrar o documento.')
                        res.redirect('/gerenciamento/aceite/' + req.body.id)
                    })
                })
            })
        })
    }).catch(() => {
        req.flash('error_msg', 'Falha ao encontrar o documento.')
        res.redirect('/gerenciamento/aceite/' + req.body.id)
    })
})

router.post('/checklist', upload.single('clins'), ehAdmin, (req, res) => {
    var file
    if (req.file != null) {
        file = req.file.originalname
    } else {
        file = ''
    }
    Documento.findOne({ proposta: req.body.id }).then((documento) => {
        if (file != '') {
            documento.clins = file
        }
        documento.dtclins = String(req.body.dtclins)
        documento.save().then(() => {
            req.flash('success_msg', 'Documento salvo com sucesso.')
            res.redirect('/gerenciamento/aceite/' + req.body.id)
        }).catch(() => {
            req.flash('error_msg', 'Falha ao encontrar o documento.')
            res.redirect('/gerenciamento/aceite/' + req.body.id)
        })
    }).catch(() => {
        req.flash('error_msg', 'Falha ao encontrar o documento.')
        res.redirect('/gerenciamento/aceite/' + req.body.id)
    })
})

router.post('/salvarImagem', ehAdmin, upload.array('files', 10), (req, res) => {

    var arquivos = req.files
    var imagem
    var ativo

    var sql = []
    // console.log("tipo=>" + req.body.tipo)
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
                // console.log('imagem=>' + JSON.stringify(imagem))
                ImgTarefa.findOneAndUpdate(sql, { $push: { caminhoFoto: imagem } }).then((e) => {
                    req.flash('success_msg', 'Foto(s) do serviço salva(s) com sucesso.')
                })
            }
        })
    }
    // console.log('req.body.check=>' + req.body.check)
    if (req.body.check == 'on') {
        ativo = true
    } else {
        ativo = false
    }

    // console.log("caminho=>" + req.body.caminho)
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

    
    console.log('req.body.caminho=>' + req.body.caminho)
    console.log('req.body.id=>' + req.body.id)
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
                                console.log('entrou')
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

router.get('/mostrarGaleria/:id', ehAdmin, (req, res) => {
    var params
    params = req.params.id
    params = params.split('galeria-')
    var lista_imagens = []
    var img
    var q = 1
    console.log('id=>' + params[0])
    console.log('caminho=>' + params[1])
    Proposta.findOne({ _id: params[0] }).lean().then((proposta) => {
        if (naoVazio(proposta)) {
            Cliente.findOne({ _id: proposta.cliente }).lean().then((cliente_proposta) => {
                Documento.findOne({ proposta: params[0] }).lean().then((documento) => {
                    Compra.findOne({ proposta: params[0] }).lean().then((compra) => {
                        Vistoria.findOne({ proposta: params[0] }).lean().then((vistoria) => {
                            Equipe.findOne({ _id: proposta.equipe }).lean().then((lista_equipe) => {
                                Posvenda.findOne({ proposta: params[0] }).lean().then((posvenda) => {
                                    if (params[1] == 'aterramento') {
                                        AtvAterramento.findOne({ proposta: params[0] }).then((atv) => {
                                            //console.log('encontrou')
                                            img = atv.caminhoFoto
                                            //console.log('img=>' + img)
                                            img.forEach((e) => {
                                                lista_imagens.push({ seq: 'Foto' + q, imagem: e.desc, atv: 'aterramento', id: params[0], proposta: true, ehatv: false })
                                                q++
                                            })
                                            //console.log('lista_imagens=>' + lista_imagens)
                                            res.render('principal/mostrarFotos', { lista_imagens, proposta, cliente_proposta, documento, compra, vistoria, lista_equipe, posvenda, titulo: 'Aterramento', aceite: 'ativo' })
                                        }).catch(() => {
                                            req.flash('error_msg', 'Falha ao encontrar as imagens do aterramento.')
                                            res.redirect('/gerenciamento/aceite/' + params[0])
                                        })
                                    } else {
                                        if (params[1] == 'inversor') {
                                            AtvInversor.findOne({ proposta: params[0] }).then((atv) => {
                                                img = atv.caminhoFoto
                                                img.forEach((e) => {
                                                    lista_imagens.push({ seq: 'Foto' + q, imagem: e.desc, atv: 'inversor', id: params[0], proposta: true, ehatv: false })
                                                    q++
                                                })
                                                res.render('principal/mostrarFotos', { lista_imagens, proposta, cliente_proposta, documento, compra, vistoria, lista_equipe, posvenda, titulo: 'Inversor e String Box', aceite: 'ativo' })
                                            }).catch(() => {
                                                req.flash('error_msg', 'Falha ao encontrar as imagens do inversor.')
                                                res.redirect('/gerenciamento/aceite/' + params[0])
                                            })
                                        } else {
                                            if (params[1] == 'telhado') {
                                                console.log("telhado")
                                                AtvTelhado.findOne({ proposta: params[0] }).then((atv) => {
                                                    img = atv.caminhoFoto
                                                    img.forEach((e) => {
                                                        lista_imagens.push({ seq: 'Foto' + q, imagem: e.desc, atv: 'telhado', id: params[0], proposta: true, ehatv: false })
                                                        q++
                                                    })
                                                    res.render('principal/mostrarFotos', { lista_imagens, proposta, cliente_proposta, documento, compra, vistoria, lista_equipe, posvenda, titulo: 'Estruturas e Módulos', aceite: 'ativo' })
                                                }).catch(() => {
                                                    req.flash('error_msg', 'Falha ao encontrar as imagens do tellhado.')
                                                    res.redirect('/gerenciamento/aceite/' + params[0])
                                                })
                                            } else {

                                                if (params[1] == 'sombreamento' || params[1] == 'area' || params[1] == 'insi' || params[1] == 'insa') {
                                                    Vistoria.findOne({ proposta: params[0] }).then((atv) => {
                                                        var tipoatv
                                                        if (params[1] == 'sombreamento') {
                                                            img = atv.caminhoSomb
                                                            tipoatv = 'sombreamento'
                                                            titulo = 'Sombreamento'
                                                        } else {
                                                            if (params[1] == 'area') {
                                                                img = atv.caminhoArea
                                                                tipoatv = 'area'
                                                                titulo = 'Área Útil'
                                                            } else {
                                                                if (params[1] == 'insi') {
                                                                    img = atv.caminhoInsi
                                                                    tipoatv = 'insi'
                                                                    titulo = 'Local do Inversor'
                                                                } else {
                                                                    if (params[1] == 'insa') {
                                                                        img = atv.caminhoInsa
                                                                        tipoatv = 'insa'
                                                                        titulo = 'Local do Aterramento'
                                                                    }
                                                                }
                                                            }
                                                        }

                                                        img.forEach((e) => {
                                                            lista_imagens.push({ seq: 'Foto' + q, imagem: e.desc, atv: tipoatv, id: params[0], proposta: true, ehatv: true })
                                                            q++
                                                        })
                                                        res.render('principal/mostrarFotos', { lista_imagens, proposta, cliente_proposta, documento, compra, vistoria, lista_equipe, posvenda, titulo, visita: 'ativo' })
                                                    }).catch(() => {
                                                        req.flash('error_msg', 'Falha ao encontrar as imagens do sombreamento.')
                                                        res.redirect('/gerenciamento/aceite/' + params[0])
                                                    })
                                                }
                                            }

                                        }
                                    }
                                }).catch(() => {
                                    req.flash('error_msg', 'Falha ao encontrar o pós venda.')
                                    res.redirect('/gerenciamento/aceite/' + params[0])
                                })
                            }).catch(() => {
                                req.flash('error_msg', 'Falha ao encontrar a equipe.')
                                res.redirect('/gerenciamento/aceite/' + params[0])
                            })
                        }).catch(() => {
                            req.flash('error_msg', 'Falha ao encontrar a vistoria.')
                            res.redirect('/gerenciamento/aceite/' + params[0])
                        })
                    }).catch(() => {
                        req.flash('error_msg', 'Falha ao encontrar a compra.')
                        res.redirect('/gerenciamento/aceite/' + params[0])
                    })
                }).catch(() => {
                    req.flash('error_msg', 'Falha ao encontrar o documento.')
                    res.redirect('/gerenciamento/aceite/' + params[0])
                })
            }).catch(() => {
                req.flash('error_msg', 'Falha ao encontrar o cliente.')
                res.redirect('/gerenciamento/aceite/' + params[0])
            })
        } else {
            var check = 'unchecked'
            console.log('proposta vazio')
            if (params[1] == 'tarefa') {
                Tarefa.findOne({ _id: params[0] }).lean().then((tarefa) => {
                    ImgTarefa.findOne({ tarefa: params[0] }).lean().then((imgtarefa) => {
                        img = imgtarefa.caminhoFoto
                        img.forEach((e) => {
                            lista_imagens.push({ imagem: e.desc, id: params[0], atv: 'tarefa', proposta: false })
                        })
                        if (imgtarefa.aprova == true) {
                            check = 'checked'
                        }
                        console.log('lista_imagens=>' + lista_imagens)
                        res.render('principal/mostrarFotos', { imgtarefa, check, lista_imagens, tarefa, titulo: "Imagens do serviço", esconde: true, ehatv: false })
                    }).catch((err) => {
                        req.flash('error_msg', 'Não foi possível encontrar a atividade de instalação das estrurturas e módulos no telhado.')
                        res.redirect('/gerenciamento/mostraEquipe/' + req.params.id)
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Não foi possível encontrar a tarefa.')
                    res.redirect('/gerenciamento/mostraEquipe/' + req.body.id)
                })
            }
        }
    }).catch(() => {
        req.flash('error_msg', 'Falha ao encontrar a proposta<ate>.')
        res.redirect('/gerenciamento/aceite/' + params[0])
    })

})

router.get('/deletaImagem/:msg', ehAdmin, (req, res) => {
    var params = []
    params = req.params.msg
    params = params.split('delimg')
    //console.log(params[0])
    //console.log(params[1])
    //console.log(params[2])
    console.log('params[3]=>' + params[3])
    console.log('params[4]=>' + params[4])

    var sql = []
    console.log("params[3]=>" + params[3])
    if (params[3] == 'true') {
        sql = { proposta: params[1] }
    } else {
        sql = { tarefa: params[1] }
    }

    console.log('params[2]=>' + params[2])
    console.log('sql=>' + JSON.stringify(sql))
    if (params[2] == 'aterramento') {
        console.log('entrou')
        AtvAterramento.findOneAndUpdate(sql, { $pull: { 'caminhoFoto': { 'desc': params[0] } } }).then((e) => {
            req.flash('aviso_msg', 'Imagem removida com sucesso')
            console.log('params[3]=>' + params[3])
            if (params[4] == 'false') {
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
                if (params[4] == 'false') {
                    res.redirect('/gerenciamento/atvi/' + params[1])
                } else {
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
                    if (params[4] == 'false') {
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

router.get('/mostrarImagens/:foto', ehAdmin, (req, res) => {
    var path = __dirname
    path = path.replace('routes', '')
    res.sendFile('/public/arquivos/' + req.params.foto, { root: path })
})

router.get('/mostrarAceite/:id', ehAdmin, (req, res) => {
    Documento.findOne({ proposta: req.params.id }).then((documento) => {
        var doc = documento.aceite
        var path = __dirname
        //console.log(path)
        path = path.replace('routes', '')
        res.sendFile(path + '/public/arquivos/' + doc)
    }).catch(() => {
        req.flash('error_msg', 'Falha ao encontrar o documento.')
        res.redirect('/gerenciamento/aceite/' + req.body.id)
    })
})

router.get('/mostrarClins/:id', ehAdmin, (req, res) => {
    Documento.findOne({ proposta: req.params.id }).then((documento) => {
        var doc = documento.clins
        var path = __dirname
        //console.log(path)
        path = path.replace('routes', '')
        res.sendFile(path + '/public/arquivos/' + doc)
    }).catch(() => {
        req.flash('error_msg', 'Falha ao encontrar o documento.')
        res.redirect('/gerenciamento/aceite/' + req.body.id)
    })
})

router.post('/almoxarifado', upload.single('almoxarifado'), ehAdmin, (req, res) => {
    var file
    if (req.file != null) {
        file = req.file.originalname
    } else {
        file = ''
    }
    Documento.findOne({ proposta: req.body.id }).then((documento) => {
        if (file != '') {
            documento.almoxarifado = file
        }
        documento.dtalmoxarifado = String(req.body.dtalmoxarifado)
        documento.feitoalmox = true
        documento.save().then(() => {
            req.flash('success_msg', 'Documento salvo com sucesso.')
            res.redirect('/gerenciamento/almoxarifado/' + req.body.id)
        }).catch(() => {
            req.flash('error_msg', 'Falha ao salvar o documento.')
            res.redirect('/gerenciamento/almoxarifado/' + req.body.id)
        })
    }).catch(() => {
        req.flash('error_msg', 'Falha ao encontrar o documento.')
        res.redirect('/gerenciamento/almoxarifado/' + req.body.id)
    })
})

router.get('/enviaalmox/:id', ehAdmin, (req, res) => {
    Documento.findOne({ proposta: req.params.id }).then((documento) => {
        documento.enviaalmox = true
        documento.save().then(() => {
            req.flash('success_msg', 'Documento enviado para o almoxarifado.')
            res.redirect('/gerenciamento/almoxarifado/' + req.params.id)
        })
    }).catch(() => {
        req.flash('error_msg', 'Falha ao encontrar o documento')
        res.redirect('/gerenciamento/almoxarifado/' + req.params.id)
    })
})

router.get('/cancelaalmox/:id', ehAdmin, (req, res) => {
    Documento.findOne({ proposta: req.params.id }).then((documento) => {
        documento.enviaalmox = false
        documento.save().then(() => {
            req.flash('success_msg', 'Cancelado envio do documento para o almoxarifado.')
            res.redirect('/gerenciamento/almoxarifado/' + req.params.id)
        }).catch(() => {
            req.flash('error_msg', 'Falha ao cancelar o envio.')
            res.redirect('/gerenciamento/almoxarifado/' + req.params.id)
        })
    }).catch(() => {
        req.flash('error_msg', 'Falha ao encontrar o documento')
        res.redirect('/gerenciamento/almoxarifado/' + req.params.id)
    })
})

router.get('/mostrarAlmoxarifado/:id', ehAdmin, (req, res) => {
    Documento.findOne({ proposta: req.params.id }).then((documento) => {
        var doc = documento.almoxarifado
        var path = __dirname
        //console.log(path)
        path = path.replace('routes', '')
        res.sendFile(path + '/public/arquivos/' + doc)
    }).catch(() => {
        req.flash('error_msg', 'Falha ao encontrar o documento.')
        res.redirect('/gerenciamento/almoxarifado/' + req.body.id)
    })
})

router.post('/financeiro', upload.single('financeiro'), ehAdmin, (req, res) => {
    var financeirofile
    var q = 0
    if (req.file != null) {
        financeirofile = req.file.originalname
    } else {
        financeirofile = ''
    }
    var financeirofile = req.files
    if (naoVazio(financeirofile)) {
        unset = { proposta: req.body.id, $unset: { faturado: 1 } }
    } else {
        unset = { proposta: req.body.id }
    }
    Documento.findOneAndUpdate(unset).then(() => {
        Documento.findOne({ proposta: req.body.id }).then((documento) => {
            // if (financeirofile != '') {
            //     documento.faturado = financeirofile
            // }
            if (naoVazio(financeirofile)) {
                financeirofile.forEach((e) => {
                    //console.log(e.originalname)
                    documento.faturado[q] = e.originalname
                    q++
                })
            }
            documento.dtfaturado = String(req.body.dtfaturado)
            documento.feitofaturado = true
            documento.save().then(() => {
                req.flash('success_msg', 'Documento salvo com sucesso.')
                res.redirect('/gerenciamento/financeiro/' + req.body.id)
            }).catch(() => {
                req.flash('error_msg', 'Falha ao salvar o documento.')
                res.redirect('/gerenciamento/financeiro/' + req.body.id)
            })
        }).catch(() => {
            req.flash('error_msg', 'Falha ao encontrar o documento.')
            res.redirect('/gerenciamento/financeiro/' + req.body.id)
        })
    }).catch(() => {
        req.flash('error_msg', 'Falha ao excluir a nota fiscal.')
        res.redirect('/gerenciamento/financeiro/' + req.body.id)
    })
})

router.post('/comprovante', upload.single('comprovante'), ehAdmin, (req, res) => {
    var comprovantefile
    var q = 0
    if (req.file != null) {
        comprovantefile = req.file.originalname
    } else {
        comprovantefile = ''
    }
    var comprovantefile = req.files
    if (naoVazio(comprovantefile)) {
        unset = { proposta: req.body.id, $unset: { comprovante: 1 } }
    } else {
        unset = { proposta: req.body.id }
    }
    Documento.findOneAndUpdate(unset).then(() => {
        Documento.findOne({ proposta: req.body.id }).then((documento) => {
            // if (comprovantefile != '') {
            //     documento.comprovante = comprovantefile
            // }
            if (naoVazio(comprovantefile)) {
                comprovantefile.forEach((e) => {
                    documento.comprovante[q] = e.originalname
                    q++
                })
            }
            documento.dtcomprovante = String(req.body.dtcomprovante)
            documento.feitocomprovante = true
            documento.save().then(() => {
                req.flash('success_msg', 'Documento salvo com sucesso.')
                res.redirect('/gerenciamento/financeiro/' + req.body.id)
            }).catch(() => {
                req.flash('error_msg', 'Falha ao salvar o documento.')
                res.redirect('/gerenciamento/financeiro/' + req.body.id)
            })
        }).catch(() => {
            req.flash('error_msg', 'Falha ao encontrar o documento.')
            res.redirect('/gerenciamento/financeiro/' + req.body.id)
        })
    }).catch(() => {
        req.flash('error_msg', 'Falha ao excluir o comprovante.')
        res.redirect('/gerenciamento/financeiro/' + req.body.id)
    })
})

router.get('/mostrarDocumentos/:doc', ehAdmin, (req, res) => {
    var path = __dirname
    path = path.replace('routes', '')
    res.sendFile('/public/arquivos/' + req.params.doc, { root: path })
})

router.post('/posvenda', upload.single('posvenda'), ehAdmin, (req, res) => {
    var file

    if (req.file != null) {
        file = req.file.originalname
    } else {
        file = ''
    }
    Posvenda.findOne({ proposta: req.body.id }).then((posvenda) => {
        if (file != '') {
            posvenda.laudo = file
        }
        posvenda.data = String(req.body.data)
        posvenda.feito = true
        posvenda.save().then(() => {
            req.flash('success_msg', 'Documento salvo com sucesso.')
            res.redirect('/gerenciamento/posvenda/' + req.body.id)
        }).catch(() => {
            req.flash('error_msg', 'Falha ao encontrar o pós venda.')
            res.redirect('/gerenciamento/posvenda/' + req.body.id)
        })
    }).catch(() => {
        req.flash('error_msg', 'Falha ao encontrar o pós venda.')
        res.redirect('/gerenciamento/posvenda/' + req.body.id)
    })
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

    Proposta.findOne({ _id: req.params.id }).then((proposta) => {
        Compra.findOne({ proposta: req.params.id }).then((compra) => {
            Equipe.findOne({ _id: proposta.equipe }).then((equipe) => {
                Vistoria.findOne({ proposta: proposta._id }).then((vistoria) => {
                    //console.log(proposta.cliente)
                    Cliente.findOne({ _id: proposta.cliente }).then((cliente) => {
                        //console.log(cliente)
                        var cadastro = dataHoje()
                        var datalimp = dataMensagem(setData(dataHoje(), 182))
                        var buscalimp = dataBusca(setData(dataHoje(), 182))
                        var datarevi = dataMensagem(setData(dataHoje(), 30))
                        var buscarevi = dataBusca(setData(dataHoje(), 30))
                        //console.log(vistoria)
                        if (naoVazio(vistoria)) {
                            usina = {
                                user: id,
                                nome: cliente.nome,
                                cliente: proposta.cliente,
                                area: vistoria.plaArea,
                                qtdmod: vistoria.plaQtdMod,
                                cadastro: cadastro,
                                datalimp: datalimp,
                                buscalimp: buscalimp,
                                datarevi: datarevi,
                                buscarevi: buscarevi,
                            }
                        } else {
                            usina = {
                                user: id,
                                nome: cliente.nome,
                                cliente: proposta.cliente,
                                endereco: proposta.endereco,
                                area: 0,
                                qtdmod: 0,
                                cadastro: cadastro,
                                datalimp: datalimp,
                                buscalimp: buscalimp,
                                datarevi: datarevi,
                                buscarevi: buscarevi
                            }
                        }
                        new Usina(usina).save().then(() => {
                            //console.log('salvou usina')
                            Usina.findOne({ user: id }).sort({ field: 'asc', _id: -1 }).then((novausina) => {
                                var tarefa = {
                                    user: id,
                                    usina: novausina._id,
                                    dataini: setData(dataHoje(), 182),
                                    buscadataini: dataBusca(setData(dataHoje(), 182)),
                                    datafim: setData(dataHoje(), 182),
                                    buscadatafim: dataBusca(setData(dataHoje(), 182)),
                                    cadastro: dataHoje(),
                                    endereco: proposta.endereco,
                                    concluido: false,
                                    servico: '61b2565a9db7e22fd4472e40',
                                    equipe: null
                                }
                                new Tarefas(tarefa).save().then(() => {
                                    proposta.encerrado = true
                                    compra.encerrado = true
                                    proposta.save().then(() => {
                                        compra.save().then(() => {
                                            equipe.prjfeito = true
                                            equipe.save().then(() => {
                                                req.flash('success_msg', 'Projeto finalizado e usina gerada com sucesso.')
                                                //console.log('projeto._id=>' + projeto._id)
                                                res.redirect('/gerenciamento/proposta/' + req.params.id)
                                            }).catch((err) => {
                                                req.flash('error_msg', 'Erro ao salvar a equipe.')
                                                res.redirect('/gerenciamento/posvenda/' + req.params.id)
                                            })
                                        }).catch((err) => {
                                            req.flash('error_msg', 'Erro ao salvar a tarefa.')
                                            res.redirect('/gerenciamento/posvenda/' + req.params.id)
                                        })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Erro ao salvar a tarefa.')
                                        res.redirect('/gerenciamento/posvenda/' + req.params.id)
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Erro ao salvar a tarefa.')
                                    res.redirect('/gerenciamento/posvenda/' + req.params.id)
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Erro ao encontrar a usina.')
                                res.redirect('/gerenciamento/posvenda/' + req.params.id)
                            })
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Cliene não encontrado.')
                        res.redirect('/gerenciamento/posvenda/' + req.params.id)
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Vistoria não encontrada.')
                    res.redirect('/gerenciamento/posvenda/' + req.params.id)
                })
            }).catch((err) => {
                req.flash('error_msg', 'Equipe não encontrada.')
                res.redirect('/gerenciamento/posvenda/' + req.params.id)
            })
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao encontrar a compra.')
            res.redirect('/gerenciamento/posvenda/' + req.params.id)
        })
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar a proposta<entrega>.')
        res.redirect('/gerenciamento/posvenda/' + req.params.id)
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

router.get('/mostrarPosvenda/:id', ehAdmin, (req, res) => {
    Posvenda.findOne({ proposta: req.params.id }).then((posvenda) => {
        var doc = posvenda.laudo
        var path = __dirname
        //console.log(path)
        path = path.replace('routes', '')
        res.sendFile(path + '/public/arquivos/' + doc)
    }).catch(() => {
        req.flash('error_msg', 'Falha ao encontrar o pós venda.')
        res.redirect('/gerenciamento/posvenda/' + req.params.id)
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

router.get('/enviaMensagem/:id', ehAdmin, (req, res) => {

    Projeto.findOne({ _id: req.params.id }).then((projeto) => {
        Cliente.findOne({ _id: projeto.cliente }).then((cliente) => {
            Cronograma.findOne({ projeto: projeto._id }).then((cronograma) => {
                Empresa.findOne({ _id: projeto.empresa }).then((empresa) => {
                    var telefone = empresa.telefone
                    var ddd = telefone.substring(0, 2)
                    var primdig = telefone.substring(2, 6)
                    var segdig = telefone.substring(6, 12)
                    // telefone = '(' + ddd + ') ' + primdig + ' - ' + segdig
                    // //Enviando SMS                              
                    // var mensagem = 'Olá ' + cliente.nome + ', tudo bem?' + '\n' +
                    //     'Segue o cronograma para a instalação de sua usina solar: ' + '\n' +
                    //     'Planejamento: ' + dataMensagem(cronograma.dateplaini) + ' a ' + dataMensagem(cronograma.dateplafim) + '\n' +
                    //     'Projetista: ' + dataMensagem(cronograma.dateprjini) + ' a ' + dataMensagem(cronograma.dateprjfim) + '\n' +
                    //     'Aterramento: ' + dataMensagem(cronograma.dateateini) + ' a ' + dataMensagem(cronograma.dateatefim) + '\n' +
                    //     'Inversores e StringBox: ' + dataMensagem(cronograma.dateinvini) + ' a ' + dataMensagem(cronograma.datestbfim) + '\n' +
                    //     'Instalação da Estrutura: ' + dataMensagem(cronograma.dateestini) + ' a ' + dataMensagem(cronograma.dateestfim) + '\n' +
                    //     'Instalação dos Módulos: ' + dataMensagem(cronograma.datemodini) + ' a ' + dataMensagem(cronograma.datemodfim) + '\n' +
                    //     'Vistoria: ' + dataMensagem(cronograma.datevisini) + ' a ' + dataMensagem(cronograma.datevisfim) + '.' + '\n' +
                    //     'Para mais detalhes entre em contato com a gente pelo whatsapp:' + telefone

                    //console.log(mensagem)
                    // to = cliente.celular
                    //console.log(to)

                    //console.log('cliente.email=>' + cliente.email)

                    // var email = cliente.email

                    // const mailOptions = { // Define informações pertinentes ao E-mail que será enviado
                    //     from: '"VIMMUS Soluções" <alexandre@vimmus.com.br>',
                    //     to: email,
                    //     subject: 'Cronograma do Projeto de Instalação do Sistema Fotovoltaico',
                    //     //text: 'Nome: ' + req.body.nome + ';' + 'Celular: ' + req.body.celular + ';' + 'E-mail: '+ req.body.email
                    //     text: mensagem
                    // }

                    // var textMessageService = new TextMessageService(apiKey)
                    // textMessageService.send('Vimmus', mensagem, ['49991832978'], result => {
                    //console.log(result)
                    //     if (result == false) {
                    //         req.flash('error_msg', 'Falha interna. Não foi possível enviar a mensagem.')
                    //         res.redirect('/gerenciamento/cronograma/' + req.params.id)
                    //     } else {
                    //         projeto.mensagem = true
                    //         projeto.save().then(() => {
                    //             req.flash('success_msg', 'Mensagem enviada para: ' + cliente.nome + ' com sucesso.')
                    //             transporter.sendMail(mailOptions, (err, info) => { // Função que, efetivamente, envia o email.
                    //                 if (err) {
                    //                     return  //console.log(err)
                    //                 } else {
                    res.redirect('/gerenciamento/cronograma/' + req.params.id)
                    //                 }
                    //             })
                    //         }).catch((err) => {
                    //             req.flash('error_msg', 'Falha ao salvar o projeto.')
                    //             res.redirect('/gerenciamento/cronograma/' + req.params.id)
                    //         })
                    //     }
                    // })
                }).catch((err) => {
                    req.flash('error_msg', 'Falha ao encontrar a empresa.')
                    res.redirect('/gerenciamento/cronograma/' + req.params.id)
                })
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao encontrar o cronograma.')
                res.redirect('/gerenciamento/cronograma/' + req.params.id)
            })
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao encontrar o cliente.')
            res.redirect('/gerenciamento/cronograma/' + req.params.id)
        })
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar o projeto.')
        res.redirect('/gerenciamento/cronograma/' + req.params.id)
    })

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
                                    mesinicio = dtinicio.substring(5,)
                                    mesfim = dtfim.substring(5,)
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
                                    //console.log('q=>' + q)
                                    //console.log('tarefas.length=>' + tarefas.length)
                                    if (q == tarefas.length) {
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
                                mesinicio = dtinicio.substring(5,)
                                mesfim = dtfim.substring(5,)
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

                                const { dataini } = e
                                //console.log('dataini=>' + dataini)
                                //console.log('mes_busca=>' + mes_busca)
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
                                        julho, agosto, setembro, outubro, novembro, dezembro, ehManutencao: true, trintaeum, bisexto, toda_agenda: true
                                    })
                                }
                            })
                        })
                    })
                } else {
                    if (q == lista_tarefas.length) {
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
        //console.log('tarefa=>' + tarefa)
        trf_dataini = dataMensagem(tarefa.dataini)
        trf_datafim = dataMensagem(tarefa.datafim)
        Empresa.findOne({ _id: tarefa.empresa }).then((trfemp) => {
            //console.log('trfemp=>' + trfemp)
            trf_empresa = trfemp.nome
            trf_empid = trfemp._id
            Pessoa.findOne({ _id: tarefa.responsavel }).then((trfres) => {
                //console.log('trfres=>' + trfres)
                trf_gestor = trfres.nome
                trf_gesid = trfres._id
                Servico.findOne({ _id: tarefa.servico }).then((trfsrv) => {
                    //console.log('trfsrv=>' + trfsrv)
                    trf_servico = trfsrv.descricao
                    trf_srvid = trfsrv._id
                    Equipe.findOne({ _id: tarefa.equipe }).then((equipeins) => {
                        //console.log('equipeins=>' + equipeins)
                        Pessoa.findOne({ _id: equipeins.insres }).then((trftec) => {
                            //console.log('trftec=>' + trftec)
                            trf_tecnico = trftec.nome
                            trf_tecid = trftec._id
                            //console.log('equipeins=>' + equipeins)
                            if (naoVazio(equipeins)) {
                                Pessoa.find({ $or: [{ 'funins': 'checked' }, { 'funele': 'checked' }], user: id }).then((instalacao) => {
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
                                        Empresa.find({ user: id }).lean().then((empresa) => {
                                            Pessoa.find({ user: id, $or: [{ 'funins': 'checked' }, { 'funele': 'checked' }] }).sort({ 'nome': 'asc' }).lean().then((instalacao) => {
                                                Pessoa.find({ user: id, 'funges': 'checked' }).sort({ 'nome': 'asc' }).lean().then((gestor) => {
                                                    //console.log('req.body.cliente=>' + req.body.cliente)
                                                    Servico.find({ user: id }).lean().then((servicos) => {
                                                        //console.log('tarefa.cliente=>' + tarefa.cliente)
                                                        Usina.find({ cliente: tarefa.cliente }).lean().then((usina) => {
                                                            //console.log('ins_dentro=>' + ins_dentro)
                                                            //console.log('ins_fora=>>' + ins_fora)
                                                            //console.log('usina=>' + usina)
                                                            //console.log('instalacao=>' + instalacao)
                                                            //console.log('gestor=>' + gestor)
                                                            //console.log('tarefa=>' + tarefa)
                                                            //console.log('empresa=>' + empresa)
                                                            //console.log('servicos=>' + servicos)
                                                            if (naoVazio(usina)) {
                                                                res.render('projeto/gerenciamento/tarefas', { usina, trf_empresa, trf_empid, trf_gestor, trf_gesid, trf_servico, trf_srvid, tarefa, servicos, ins_fora, ins_dentro, instalacao, gestor, empresa })
                                                            } else {
                                                                res.render('projeto/gerenciamento/tarefas', { tarefa, trf_empresa, trf_empid, trf_gestor, trf_gesid, trf_servico, trf_srvid, servicos, ins_fora, ins_dentro, instalacao, gestor, empresa })
                                                            }
                                                        }).catch((err) => {
                                                            req.flash('error_msg', 'Nenhuma usina cadastrada.')
                                                            res.redirect('/gerenciamento/agenda')
                                                        })
                                                    }).catch((err) => {
                                                        req.flash('error_msg', 'Nehuma tipo de serviço cadastrado.')
                                                        res.redirect('/gerenciamento/agenda')
                                                    })
                                                }).catch((err) => {
                                                    req.flash('error_msg', 'Nehum técnico cadastrada.')
                                                    res.redirect('/confguracao/addempresa')
                                                })
                                            }).catch((err) => {
                                                req.flash('error_msg', 'Falha ao encontrar os gestores.')
                                                res.redirect('/gerenciamento/agenda')
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
                            }
                        }).catch((err) => {
                            req.flash('error_msg', 'Falha ao encontrar o técnico responsável.')
                            res.redirect('/gerenciamento/equipe/' + req.params.id)
                        })
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
        req.redirect('/agenda')
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
    //console.log('dia=>' + dia)
    data = (String(ano) + '-' + String(mes) + '-' + String(dia)).toString()
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
                            Pessoa.find({ user: id, $or: [{ 'funins': 'checked' }, { 'funele': 'checked' }] }).sort({ 'nome': 'asc' }).lean().then((instalacao) => {
                                if (naoVazio(instalacao)) {
                                    instalacao.forEach((pesins) => {
                                        q++
                                        nome = pesins.nome
                                        ins_fora.push({ id: pesins._id, nome })
                                        if (q == instalacao.length) {
                                            Pessoa.find({ user: id, 'funges': 'checked' }).sort({ 'nome': 'asc' }).lean().then((gestor) => {
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
                            console.log('sem usina')
                            Pessoa.find({ user: id, $or: [{ 'funins': 'checked' }, { 'funele': 'checked' }] }).sort({ 'nome': 'asc' }).lean().then((instalacao) => {
                                if (naoVazio(instalacao)) {
                                    instalacao.forEach((pesins) => {
                                        q++
                                        nome = pesins.nome
                                        ins_fora.push({ id: pesins._id, nome })
                                        if (q == instalacao.length) {
                                            console.log('id=>' + id)
                                            Pessoa.find({ user: id, 'funges': 'checked' }).sort({ 'nome': 'asc' }).lean().then((gestor) => {
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
    var dif
    var dias = []
    var cadastro = dataHoje()
    var corpo = []
    var email = []
    var todos_emails = ''
    var q = 0
    var email = ''

    if (naoVazio(req.body.idequipe)) {
        //console.log('equipe não vazio')
        Tarefa.findOne({ _id: req.body.id }).then((tarefa) => {
            Equipe.findOne({ _id: tarefa.equipe }).then((equipe) => {
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
                equipe.ins0 = req.body.ins0
                equipe.ins1 = req.body.ins1
                equipe.ins2 = req.body.ins2
                equipe.ins3 = req.body.ins3
                equipe.ins4 = req.body.ins4
                equipe.ins5 = req.body.ins5
                equipe.email = todos_emails
                // equipe.custoins = custototal
                // equipe.feito = true
                equipe.save().then(() => {
                    req.flash('success_msg', 'Equipe salva com sucesso.')
                    if (naoVazio(tarefa.programacao)) {
                        res.redirect('/cliente/programacao/' + req.body.idusina)
                    } else {
                        res.redirect('/gerenciamento/tarefas/' + tarefa._id)
                    }
                }).catch((err) => {
                    req.flash('error_msg', 'Houve erro ao salvar a equipe.')
                    res.redirect('/cliente/programacao/' + req.body.idusina)
                })
            }).catch((err) => {
                req.flash('error_msg', 'Houve erro ao encontrar a equipe.')
                res.redirect('/cliente/programacao/' + req.body.idusina)
            })
        }).catch((err) => {
            req.flash('error_msg', 'Houve erro ao encontrar a proposta.')
            res.redirect('/cliente/programacao/' + req.body.idusina)
        })
    } else {
        //console.log('equipe true')
        if (req.body.equipe == 'true') {
            dataini = req.body.tarefadtini
            datafim = req.body.tarefadtfim
        } else {
            dataini = req.body.dataini
            datafim = req.body.datafim
        }
        //console.log('email=>' + email)
        for (i = 0; i < email.length; i++) {
            //console.log('custoins[i]' + custoins[i])
            todos_emails = todos_emails + email[i] + ';'
        }
        corpo = {
            user: id,
            ins0: req.body.ins0,
            ins1: req.body.ins1,
            ins2: req.body.ins2,
            ins3: req.body.ins3,
            ins4: req.body.ins4,
            ins5: req.body.ins5,
            dtinicio: dataini,
            insres: req.body.responsavel,
            dtfim: datafim,
            dtinibusca: dataBusca(dataini),
            dtfimbusca: dataBusca(datafim),
            feito: false,
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
        if (naoVazio(idins)) {
            equipe = Object.assign(idins, corpo)
        } else {
            equipe = corpo
        }
        new Equipe(equipe).save().then(() => {
            Equipe.findOne({ user: id }).sort({ field: 'asc', _id: -1 }).then((novaequipe) => {
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
                        var data1 = new Date(dataini)
                        var data2 = new Date(datafim)
                        dif = Math.abs(data2.getTime() - data1.getTime())
                        days = Math.ceil(dif / (1000 * 60 * 60 * 24))
                        days = days + 1
                        //console.log('days=>' + days)
                        for (i = 1; i < days + 1; i++) {
                            dias.push({ dia: i, feito: false })
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
                            gestor: req.body.gestor,
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
                                            res.redirect('/menu')
                                        })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Houve erro ao salvar a atividade de instalação do telhado.')
                                        res.redirect('/menu')
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
                            req.flash('error_msg', 'Falha ao encontrar a tarefa.')
                            res.redirect('/gerenciamento/tarefas/' + tarefa._id)
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Falha ao salvar a manutenção.')
                        res.redirect('/gerenciamento/tarefas/' + tarefa._id)
                    })
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

router.post('/gerenciamento/', ehAdmin, (req, res) => {
    const { _id } = req.user
    var erros = ''
    var sucesso = ''
    var medkmh

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
        res.redirect('/gerenciamento/gereciamento/' + req.body.id)

    } else {

        Projeto.findOne({ _id: req.body.id }).then((projeto) => {
            Cronograma.findOne({ projeto: req.body.id }).then((cronograma) => {
                Detalhado.findOne({ projeto: req.body.id }).then((detalhe) => {
                    Empresa.findOne({ _id: projeto.empresa }).then((empresa) => {
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
                            var conhrs = config.hrstrb
                            var equipe = projeto.qtdins
                            var plafim
                            var prjfim
                            var atefim
                            var invfim
                            var stbfim
                            var estfim
                            var modfim
                            var invfim
                            var eaefim
                            var pnlfim
                            var valplafim
                            var valprjfim
                            var valateini
                            var valinvini
                            var valstbini
                            var valpnlini
                            var valeaeini
                            var valestini
                            var valmodini
                            var aux
                            var soma


                            if (projeto.tipoCustoGes == 'hora') {
                                plafim = Math.trunc((parseFloat(projeto.trbges) + parseFloat(projeto.desGes)) / conhrs)
                            } else {
                                //console.log('projeto.diasGes=>'+projeto.diasGes)
                                if ((parseFloat(projeto.diasGes) + parseFloat(projeto.desGes)) > 1) {
                                    //console.log('projeto.desGes=>'+projeto.desGes)
                                    plafim = (parseFloat(projeto.diasGes) + parseFloat(projeto.desGes) + parseFloat(projeto.desGes)) - 1
                                } else {
                                    plafim = 0
                                }
                            }
                            //console.log('plafim=>'+plafim)
                            if (projeto.tipoCustoPro == 'hora') {
                                if ((parseFloat(projeto.trbges) + parseFloat(projeto.desPro) + parseFloat(projeto.trbpro)) > 8) {
                                    prjfim = Math.round(((projeto.trbpro + parseFloat(projeto.desPro)) / conhrs), -1)
                                } else {
                                    prjfim = Math.trunc(projeto.trbpro / conhrs)
                                }
                            } else {
                                soma = (parseFloat(projeto.diasGes) + parseFloat(projeto.desPro) + parseFloat(projeto.diasPro)).toFixed(2)
                                if (soma > parseFloat(1)) {
                                    aux = Math.trunc(soma)
                                    if (soma >= aux) {
                                        prjfim = aux - 1
                                        if ((parseFloat(prjfim) < parseFloat(projeto.diasGes)) || (parseFloat(prjfim) < parseFloat(projeto.diasPro))) {
                                            prjfim = aux
                                        }
                                    } else {
                                        prjfim = aux
                                    }
                                } else {
                                    prjfim = 0
                                }
                            }
                            //console.log("projeto.tipoCustoIns=>" + projeto.tipoCustoIns)
                            if (projeto.tipoCustoIns == 'hora') {
                                if ((parseFloat(projeto.trbpro) + parseFloat(projeto.desIns) + parseFloat(projeto.trbate)) > 8) {
                                    atefim = Math.round(((projeto.trbate + parseFloat(projeto.desIns)) / conhrs), -1)
                                } else {
                                    atefim = Math.trunc((projeto.trbate + parseFloat(projeto.desIns)) / conhrs)
                                }
                                if ((parseFloat(projeto.trbpro) + parseFloat(projeto.trbinv)) > 8) {
                                    invfim = Math.round((projeto.trbinv / conhrs), -1)
                                } else {
                                    invfim = Math.trunc(projeto.trbinv / conhrs)
                                }
                                if ((parseFloat(projeto.trbpro) + parseFloat(projeto.trbstb)) > 8) {
                                    stbfim = Math.round((projeto.trbstb / conhrs), -1)
                                } else {
                                    stbfim = Math.trunc(projeto.trbstb / conhrs)
                                }
                                if ((parseFloat(projeto.trbpro) + parseFloat(projeto.trbest)) > 8) {
                                    estfim = Math.round((projeto.trbest / conhrs), -1) + 1
                                } else {
                                    estfim = Math.trunc(projeto.trbest / conhrs) + 1
                                }
                                if ((parseFloat(projeto.trbest) + parseFloat(projeto.trbmod)) > 8) {
                                    modfim = Math.round((projeto.trbmod / conhrs), -1)
                                } else {
                                    modfim = Math.trunc(projeto.trbmod / conhrs)
                                }
                                if (projeto.temArmazenamento == 'checked') {
                                    if ((parseFloat(projeto.trbpro) + parseFloat(projeto.trbeae)) > 8) {
                                        eaefim = Math.round((projeto.trbeae / conhrs), -1)
                                    } else {
                                        eaefim = Math.trunc(projeto.trbeae / conhrs)
                                    }
                                }
                                if (projeto.temPainel == 'checked') {
                                    if ((parseFloat(projeto.trbpro) + parseFloat(projeto.trbpnl)) > 8) {
                                        pnlfim = Math.round((projeto.trbpnl / conhrs), -1)
                                    } else {
                                        pnlfim = Math.trunc(projeto.trbpnl / conhrs)
                                    }
                                }
                            } else {
                                soma = (parseFloat(projeto.diasPro) + parseFloat(projeto.desIns) + parseFloat(projeto.diasAte)).toFixed(2)
                                if (soma > 1) {
                                    aux = Math.trunc(soma)
                                    if (soma >= aux) {
                                        atefim = parseFloat(projeto.diasAte) + parseFloat(projeto.desIns) - 1
                                        if ((parseFloat(atefim) < parseFloat(projeto.diasPro)) || (parseFloat(atefim) < parseFloat(projeto.diasAte))) {
                                            atefim = projeto.diasAte
                                        }
                                    } else {
                                        atefim = aux
                                    }
                                } else {
                                    atefim = 0
                                }
                                soma = (parseFloat(projeto.diasPro) + parseFloat(projeto.diasInv)).toFixed(2)
                                if (soma > 1) {
                                    aux = Math.trunc(soma)
                                    if (soma >= aux) {
                                        invfim = projeto.diasInv - 1
                                        if ((parseFloat(invfim) < parseFloat(projeto.diasPro)) || (parseFloat(invfim) < parseFloat(projeto.diasInv))) {
                                            invfim = projeto.diasInv
                                        }
                                    } else {
                                        invfim = aux
                                    }
                                } else {
                                    invfim = 0
                                }
                                soma = (parseFloat(projeto.diasPro) + parseFloat(projeto.diasStb)).toFixed(2)
                                if (soma > 1) {
                                    aux = Math.trunc(soma)
                                    if (soma >= aux) {
                                        stbfim = projeto.diasStb - 1
                                        if ((parseFloat(stbfim) < parseFloat(projeto.diasPro)) || (parseFloat(stbfim) < parseFloat(projeto.diasStb))) {
                                            stbfim = projeto.diasStb
                                        }
                                    } else {
                                        stbfim = aux
                                    }
                                } else {
                                    stbfim = 0
                                }
                                if (projeto.temArmazenamento == 'checked') {
                                    soma = (parseFloat(projeto.diasPro) + parseFloat(projeto.diasEae)).toFixed(2)
                                    if (soma > 1) {
                                        aux = Math.trunc(soma)
                                        if (soma >= aux) {
                                            eaefim = projeto.diasEae - 1
                                            if ((parseFloat(eaefim) < parseFloat(projeto.diasPro)) || (parseFloat(eaefim) < parseFloat(projeto.diasEae))) {
                                                eaefim = projeto.diasEae
                                            }
                                        } else {
                                            eaefim = aux
                                        }
                                    } else {
                                        eaefim = 0
                                    }
                                }
                                if (projeto.temPainel == 'checked') {
                                    soma = (parseFloat(projeto.diasPro) + parseFloat(projeto.diasPnl)).toFixed(2)
                                    if (soma > 1) {
                                        aux = Math.trunc(soma)
                                        if (soma >= aux) {
                                            pnlfim = projeto.diasPnl - 1
                                            if ((parseFloat(pnlfim) < parseFloat(projeto.diasPro)) || (parseFloat(pnlfim) < parseFloat(projeto.diasPnl))) {
                                                pnlfim = projeto.diasPnl
                                            }
                                        } else {
                                            pnlfim = aux
                                        }
                                    } else {
                                        pnlfim = 0
                                    }
                                }
                                soma = (parseFloat(projeto.diasPro) + parseFloat(projeto.diasEst)).toFixed(2)
                                if (soma > 1) {
                                    aux = Math.trunc(soma)
                                    if (soma >= aux) {
                                        estfim = projeto.diasEst - 1
                                        if ((parseFloat(estfim) < parseFloat(projeto.diasPro)) || (parseFloat(estfim) < parseFloat(projeto.diasEst))) {
                                            estfim = projeto.diasEst
                                        }
                                    } else {
                                        estfim = aux
                                    }
                                } else {
                                    estfim = 0
                                }
                                soma = (parseFloat(projeto.diasEst) + parseFloat(projeto.diasMod)).toFixed(2)
                                if (soma > 1) {
                                    aux = Math.trunc(soma)
                                    if (soma >= aux) {
                                        modfim = projeto.diasMod - 1
                                        if ((parseFloat(modfim) < parseFloat(projeto.diasEst)) || (parseFloat(modfim) < parseFloat(projeto.diasMod))) {
                                            modfim = projeto.diasMod
                                        }
                                    } else {
                                        modfim = aux
                                    }
                                } else {
                                    modfim = 0
                                }
                            }

                            //console.log('atefim=>' + atefim)
                            //console.log('stbfim=>' + stbfim)
                            //console.log('invfim=>' + invfim)
                            //console.log('pnlfim=>' + pnlfim)
                            //console.log('eaefim=>' + eaefim)
                            //console.log('estfim=>' + estfim)
                            //console.log('modfim=>' + modfim)
                            //console.log('plafim=>' + plafim)
                            //console.log('prjfim=>' + prjfim)
                            valplafim = setData(projeto.valDataIni, plafim)
                            valprjfim = setData(valplafim, prjfim)

                            if (cronograma.dateplafim == '' || typeof cronograma.dateplafim == 'undefined' || isNaN(cronograma.dateplaini)) {
                                cronograma.dateplafim = setData(projeto.valDataIni, plafim)
                            }

                            if (cronograma.dateprjini == '' || typeof cronograma.dateprjini == 'undefined' || isNaN(cronograma.dateprjini)) {
                                cronograma.dateprjini = valplafim
                                if (cronograma.dateprjfim == '' || typeof cronograma.dateprjfim == 'undefined' || isNaN(cronograma.dateprjfim)) {
                                    cronograma.dateprjfim = setData(valplafim, prjfim)
                                }
                            }

                            if (cronograma.dateateini == '' || typeof cronograma.dateateini == 'undefined' || isNaN(cronograma.dateateini)) {
                                valateini = setData(valprjfim, 1)
                                cronograma.dateateini = valateini
                                if (cronograma.dateatefim == '' || typeof cronograma.dateatefim == 'undefined' || isNaN(cronograma.dateatefim)) {
                                    cronograma.dateatefim = setData(valateini, atefim)
                                }
                            }
                            if (cronograma.dateinvini == '' || typeof cronograma.dateinvini == 'undefined' || isNaN(cronograma.dateinvini)) {
                                valinvini = setData(valprjfim, 1)
                                cronograma.dateinvini = valinvini
                                if (cronograma.dateinvfim == '' || typeof cronograma.dateinvfim == 'undefined' || isNaN(cronograma.dateinvfim)) {
                                    cronograma.dateinvfim = setData(valinvini, invfim)
                                }
                            }

                            if (cronograma.datestbini == '' || typeof cronograma.datestbini == 'undefined' || isNaN(cronograma.datestbini)) {
                                valstbini = setData(valprjfim, 1)
                                cronograma.datestbini = valstbini
                                if (cronograma.datestbfim == '' || typeof cronograma.datestbfim == 'undefined' || isNaN(cronograma.datestbfim)) {
                                    cronograma.datestbfim = setData(valstbini, stbfim)
                                }
                            }

                            if ((cronograma.datepnlini == '' || typeof cronograma.datepnlini == 'undefined' || isNaN(cronograma.datepnlini)) && projeto.temPainel == 'checked') {
                                //console.log('tem painel')
                                valpnlini = setData(valprjfim, 1)
                                cronograma.datepnlini = valpnlini
                                if (cronograma.datepnlfim == '' || typeof cronograma.datepnlfim == 'undefined' || isNaN(cronograma.datepnlfim)) {
                                    cronograma.datepnlfim = setData(valpnlini, pnlfim)
                                }
                            }

                            if ((cronograma.dateeaeini == '' || typeof cronograma.dateeaeini == 'undefined' || isNaN(cronograma.dateeaeini)) && projeto.temArmazenamento == 'checked') {
                                //console.log('tem armazenamento')
                                valeaeini = setData(valprjfim, 1)
                                cronograma.dateeaeini = valeaeini
                                if (cronograma.dateeaefim == '' || typeof cronograma.dateeaefim == 'undefined' || isNaN(cronograma.dateeaefim)) {
                                    cronograma.dateeaefim = setData(valeaeini, eaefim)
                                }
                            }

                            if (cronograma.dateestini == '' || typeof cronograma.dateestini == 'undefined' || isNaN(cronograma.dateestini)) {
                                valestini = setData(valprjfim, 1)
                                cronograma.dateestini = valestini
                                if (cronograma.dateestfim == '' || typeof cronograma.dateestfim == 'undefined' || isNaN(cronograma.dateestfim)) {
                                    valestfim = setData(valestini, estfim)
                                    cronograma.dateestfim = valestfim

                                }
                            }
                            //console.log("modfim=>" + modfim)
                            if (cronograma.datemodini == '' || typeof cronograma.datemodini == 'undefined' || isNaN(cronograma.datemodini)) {
                                cronograma.datemodini = valestfim
                                valmodini = valestfim
                                if (cronograma.datemodfim == '' || typeof cronograma.datemodfim == 'undefined' || isNaN(cronograma.datemodfim)) {
                                    //console.log('valmodini=>' + valmodini)
                                    //console.log('valmodini=>' + valmodini)
                                    cronograma.datemodfim = setData(valmodini, modfim)
                                    //console.log('modfim=>' + modfim)
                                    //console.log('setData(valmodini, modfim)=>' + setData(valmodini, modfim))
                                }
                            }
                            var diasObra
                            var diastr
                            if (projeto.tipoCustoIns == 'hora') {
                                diasObra = Math.round(parseFloat((projeto.trbmod) + parseFloat(projeto.trbest)) / parseFloat(config.hrstrb))
                                diastr = Math.round(parseFloat(projeto.tothrs) / parseFloat(config.hrstrb))
                            } else {
                                diasObra = projeto.diasIns
                                //console.log('projeto.diasIns=>' + projeto.diasGes)
                                //console.log('projeto.diasPro=>' + projeto.diasPro)
                                //console.log('projeto.diasPro=>' + projeto.diasPro)
                                //console.log('projeto.desPro=>' + projeto.desPro)
                                //console.log('projeto.desIns=>' + projeto.desIns)
                                diastr = parseFloat(projeto.diasGes) + parseFloat(projeto.diasPro) + parseFloat(projeto.diasIns) + parseFloat(projeto.desPro) + parseFloat(projeto.desIns)
                            }
                            projeto.diasObra = diasObra
                            //console.log('diasObra=>' + diasObra)
                            projeto.diastr = diastr
                            //console.log('diastr=>' + diastr)

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
                                tothtl = parseFloat(vlrdia) * parseFloat(diasObra) * parseFloat(equipe)
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

                            //console.log('totcmb=>' + totcmb)
                            //console.log('tothtl=>' + tothtl)
                            //console.log('totali=>' + totali)
                            //console.log('totdes=>' + totdes)


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
                            var custovar = parseFloat(totdes)
                            //console.log('custoVar=>' + custoVar)
                            var custoEst = parseFloat(valorCer) + parseFloat(valorPos) + parseFloat(valorCen)
                            //console.log('custoEst=>' + custoEst)
                            var totcop = parseFloat(custoFix) + parseFloat(custoVar) + parseFloat(custoEst)

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

                            var desAdm = 0
                            if (parseFloat(empresa.desadm) > 0) {
                                if (empresa.tipodesp == 'quantidade') {
                                    desAdm = (parseFloat(empresa.desadm) * (parseFloat(empresa.perdes) / 100)).toFixed(2)
                                } else {
                                    desAdm = ((parseFloat(empresa.desadm) / parseFloat(empresa.estkwp)) * parseFloat(projeto.potencia)).toFixed(2)
                                }
                            }

                            //console.log('desAdm=>' + desAdm)

                            //Definindo o imposto ISS
                            //console.log('regime_prj.alqiFS=>' + regime_prj.alqNFS)
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
                                vlrMarkup = (((parseFloat(custoTotal) + parseFloat(desAdm) - parseFloat(reserva) - parseFloat(projeto.vlrkit)) / (1 - (parseFloat(empresa.markup)) / 100)) + parseFloat(projeto.vlrkit)).toFixed(2)
                                projeto.valor = parseFloat(vlrMarkup).toFixed(2)
                                projeto.markup = empresa.markup
                                prjValor = vlrMarkup
                            } else {
                                //console.log('markup diferente de zero')
                                //console.log('custoTotal=>' + custoTotal)
                                //console.log('req.body.markup=>' + req.body.markup)
                                vlrMarkup = (((parseFloat(custoTotal) + parseFloat(desAdm) - parseFloat(reserva) - parseFloat(projeto.vlrkit)) / (1 - (parseFloat(req.body.markup)) / 100)) + parseFloat(projeto.vlrkit)).toFixed(2)
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
                            //console.log('vlrcom=>' + vlrcom)

                            //Definindo o Lucro Bruto
                            var recLiquida = parseFloat(prjValor) - parseFloat(impNFS)
                            projeto.recLiquida = parseFloat(recLiquida).toFixed(2)

                            //console.log('recLiquida=>' + recLiquida)
                            var lucroBruto = parseFloat(recLiquida) - parseFloat(projeto.vlrkit)
                            projeto.lucroBruto = parseFloat(lucroBruto).toFixed(2)

                            //console.log('lucroBruto=>' + lucroBruto)

                            var lbaimp = 0
                            if (parseFloat(empresa.desadm) > 0) {
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

                            projeto.dataIns = dataMensagem(valateini)
                            projeto.valDataIns = valateini

                            cronograma.save().then(() => {
                                //console.log('salvou cronograma')
                                projeto.save().then(() => {
                                    //console.log('salvou projeto')
                                    sucesso = 'Custo de gerenciamento aplicado com sucesso.'
                                    req.flash('success_msg', sucesso)
                                    res.redirect('/gerenciamento/gerenciamento/' + req.body.id)
                                }).catch((err) => {
                                    req.flash('error_msg', 'Falha ao aplicar o projeto.')
                                    res.redirect('/gerenciamento/gerenciamento/' + req.body.id)
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Falha ao aplicar o cronograma.')
                                res.redirect('/gerenciamento/gerenciamento/' + req.body.id)
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Houve um erro ao encontrar a empresa.')
                            res.redirect('/gerenciamento/gerenciamento/' + req.body.id)
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Houve um erro ao encontrar as configurações.')
                        res.redirect('/gerenciamento/gerenciamento/' + req.body.id)
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Falha ao encontrar os detalhes.')
                    res.redirect('/gerenciamento/gerenciamento/' + req.body.id)
                })
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao encontrar o cronograma.')
                res.redirect('/gerenciamento/gerenciamento/' + req.body.id)
            })
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao encontrar o projeto.')
            res.redirect('/gerenciamento/gerenciamento/' + req.body.id)
        })
    }
})

router.post('/custo/', ehAdmin, (req, res) => {
    const { _id } = req.user
    Projeto.findOne({ _id: req.body.id }).then((projeto) => {

        //Inserir calculo dos impostos
        Empresa.findOne({ _id: projeto.empresa }).then((empresa) => {

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
            //console.log('projeto.lbaimp=>'+projeto.lbaimp)
            //console.log('totalImposto=>'+totalImposto)
            lucroLiquido = parseFloat(projeto.lbaimp) - parseFloat(totalImposto)
            projeto.lucroLiquido = parseFloat(lucroLiquido).toFixed(2)
            //console.log('lucroLiquido=>'+lucroLiquido)

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
                sucesso = 'Projeto salvo com sucesso.'
                req.flash('success_msg', sucesso)
                res.redirect('/gerenciamento/custo/' + req.body.id)
            }).catch(() => {
                req.flash('error_msg', 'Houve um erro ao salvar o projeto.')
                res.redirect('/gerenciamento/custo/' + req.body.id)
            })
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível encontrar o empresa.')
            res.redirect('/gerenciamento/custo/' + req.body.id)
        })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar o projeto.')
        res.redirect('/gerenciamento/custo/' + req.body.id)
    })
})

router.post('/salvacronograma/', ehAdmin, (req, res) => {

    var erros = ''
    var sucesso = ''
    var id
    const { _id } = req.user
    const { user } = req.user
    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }

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
                //console.log('req.body.perges=>' + req.body.perges)
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

                    if (prj_entrega.ehDireto == false) {
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
                    var toteng = 0
                    var matate = 0
                    var vlremp = 0
                    var compon = 0
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
                    if (prj_entrega.ehDireto == false && prj_entrega.ehVinculo == false) {
                        custoPlanoRlz = parseFloat(totges) + parseFloat(vlrKitRlz) + parseFloat(totint) + parseFloat(toteng) + parseFloat(matate) + parseFloat(vlremp) + parseFloat(compon) + parseFloat(totpro) + parseFloat(totali) + parseFloat(tothtl) + parseFloat(totcmb) + parseFloat(cercamento) + parseFloat(central) + parseFloat(postecond)
                    } else {
                        custoPlanoRlz = parseFloat(totges) + parseFloat(vlrKitRlz) + parseFloat(totint) + parseFloat(toteng) + parseFloat(matate) + parseFloat(vlremp) + parseFloat(compon) + parseFloat(totpro) + parseFloat(totdes) + parseFloat(totali) + parseFloat(cercamento) + parseFloat(central) + parseFloat(postecond)
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

                    //Cálculo dos indicadores de conclusão do projeto
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
                    if (cpi == 'Infinity' || isNaN(cpi)) {
                        cpi = 1
                    }
                    tcpi = (parseFloat(prj_entrega.valor) - parseFloat(ev)) / (parseFloat(prj_entrega.valor) - parseFloat(ac))
                    if (isNaN(tcpi)) {
                        tcpi = 1
                    }
                    eac = parseFloat(prj_entrega.custoTotal) / parseFloat(cpi)
                    if (isNaN(eac)) {
                        eac = 0
                    }
                    if (cronograma.perPro == 100) {
                        etc = parseFloat(eac) - parseFloat(AC) - parseFloat(prj_entrega.vlrart)
                    } else {
                        etc = parseFloat(eac) - parseFloat(AC)
                    }
                    if (isNaN(etc)) {
                        etc = 0
                    }
                    spi = parseFloat(prj_entrega.hrsprj) * (1 - (parseFloat(perConclusao)))
                    if (isNaN(spi)) {
                        spi = 0
                    }
                    //console.log('Math.round(perConclusao * 100)=>' + Math.round(perConclusao * 100))
                    prj_entrega.perConclusao = Math.round(perConclusao * 100)
                    //console.log('AC=>' + AC)
                    prj_entrega.actualCost = parseFloat(AC).toFixed(2)
                    //console.log('cpi=>' + cpi)
                    prj_entrega.cpi = parseFloat(cpi).toFixed(4)
                    //console.log('tcpi=>' + tcpi)
                    prj_entrega.tcpi = parseFloat(tcpi).toFixed(4)
                    //console.log('etc=>' + etc)
                    prj_entrega.etc = parseFloat(etc).toFixed(2)
                    //console.log('eac=>' + eac)
                    prj_entrega.eac = parseFloat(eac).toFixed(2)
                    //console.log('spi=>' + spi)
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

                //console.log('req.body.executando=>' + req.body.executando)
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
                    //console.log('req.body.datevis=>' + req.body.datevis)
                    if (req.body.datevis != '' && typeof req.body.datevis != 'undefined') {
                        if (req.body.dateEntregaReal != '' && typeof req.body.dateEntregaReal != 'undifined') {
                            if (comparaDatas(req.body.dateEntregaReal, req.body.datevis)) {
                                erros = erros + 'Não foi possível salvar a nova data de entrega de finalização. '
                            } else {
                                dataEntregaReal = req.body.dateEntregaReal
                                ano = dataEntregaReal.substring(0, 4)
                                mes = dataEntregaReal.substring(5,)
                                dia = dataEntregaReal.substring(8, 11)
                                dataEntregaReal = dia + '/' + mes + '/' + ano
                                prj_entrega.datafim = dataEntregaReal
                                prj_entrega.valDataFim = req.body.dateEntregaReal
                                atrasou = comparaDatas(req.body.dateEntregaHidden, req.body.dateEntregaReal)
                            }
                        }
                    }
                    //console.log('req.body.dateEntregaReal=>' + req.body.dateEntregaReal)
                }

                //console.log('req.body.dateentrega=>' + req.body.dateentrega)
                //console.log('req.body.datevisfim=>' + req.body.datevisfim)
                //console.log('req.body.orcado=>' + req.body.orcado)

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
                            mes = dataentrega.substring(5,)
                            dia = dataentrega.substring(8, 11)
                            dataentrega = dia + '/' + mes + '/' + ano
                            prj_entrega.dataprev = dataentrega
                            prj_entrega.dataord = ano + mes + dia
                            prj_entrega.valDataPrev = req.body.dateentrega
                        }
                    }
                }

                prj_entrega.atrasado = atrasou
                //console.log('atrasou=>' + atrasou)
                //console.log('req.body.dateateini=>' + req.body.dateateini)
                prj_entrega.dataIns = dataMensagem(req.body.dateateini)
                //console.log('dataMensagem(req.body.dateateini)=>' + req.body.dateateini)
                prj_entrega.valDataIns = req.body.dateateini
                prj_entrega.checkAte = checkAte
                prj_entrega.checkInv = checkInv
                prj_entrega.checkMod = checkMod
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
                            cronograma.agendaStbIni = dataBusca(req.body.datestbini)
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

                        //console.log("realizado=>" + realizado)
                        if (realizado != null) {
                            //console.log('entrou realizado')
                            //console.log('totint=>' + totint)
                            //console.log('totges=>' + totges)
                            //console.log('totpro=>' + totpro)
                            //console.log('totali=>' + totali)
                            //console.log('totdes=>' + totdes)
                            //console.log('tothtl=>' + tothtl)
                            //console.log('totcmb=>' + totcmb)
                            //console.log('cercamento=>' + cercamento)
                            //console.log('central=>' + central)
                            //console.log('postecond=>' + postecond)

                            realizado.vlrkit = vlrKitRlz
                            realizado.totint = totint
                            realizado.toteng = toteng
                            realizado.matate = matate
                            realizado.vlremp = vlremp
                            realizado.compon = compon
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
                                user: id,
                                projeto: req.body.idprojeto,
                                vlrkit: req.body.vlrKitRlz,
                                totint: req.body.totint,
                                toteng: 0,
                                matate: 0,
                                vlrwmp: 0,
                                compon: 0,
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

router.post('/planejamento', ehAdmin, (req, res) => {
    var id
    const { _id } = req.user
    const { user } = req.user
    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }
    //console.log('req.body.id=>' + req.body.id)
    Projeto.findOne({ _id: req.body.id }).then((projeto) => {
        Vistoria.findOne({ projeto: req.body.id }).then((vistoria) => {
            //console.log('vistoria=>' + vistoria)
            if (vistoria != '' && typeof vistoria != 'undefined' && vistoria != null) {
                vistoria.plaQtdMod = req.body.plaQtdMod
                vistoria.plaWattMod = req.body.plaWattMod
                vistoria.plaQtdInv = req.body.plaQtdInv
                vistoria.plaKwpInv = req.body.plaKwpInv
                vistoria.plaDimArea = req.body.plaDimArea
                vistoria.plaQtdString = req.body.plaQtdString
                vistoria.plaModString = req.body.plaModString
                vistoria.plaQtdEst = req.body.plaQtdEst
                vistoria.save().then(() => {
                    projeto.qtdmod = req.body.plaQtdMod
                    projeto.totint = parseFloat(req.body.plaQtdMod) * parseFloat(projeto.rspmod)
                    projeto.save().then(() => {
                        Detalhado.findOne({ projeto: req.body.id }).then((detalhe) => {
                            if (detalhe != '' && typeof detalhe != 'undefined' && detalhe != null) {
                                detalhe.projeto = req.body.id
                                detalhe.unidadeMod = req.body.plaQtdMod
                                detalhe.save().then(() => {
                                    req.flash('success_msg', 'Vistoria salva com sucesso.')
                                    res.redirect('/gerenciamento/vistoriaPla/' + req.body.id)
                                })
                            } else {
                                const detalhe = {
                                    projeto: req.body.id,
                                    unidadeMod: req.body.plaQtdMod
                                }
                                new Detalhado(detalhe).save().then(() => {
                                    projeto.qtdmod = req.body.plaQtdMod
                                    projeto.totint = parseFloat(req.body.plaQtdMod) * parseFloat(projeto.rspmod)
                                    projeto.save().then(() => {
                                        req.flash('success_msg', 'Vistoria salva com sucesso.')
                                        res.redirect('/gerenciamento/vistoriaPla/' + req.body.id)
                                    })

                                })
                            }
                        })
                    })
                })
            } else {
                const vistoria = {
                    user: id,
                    projeto: req.body.id,
                    plaQtdMod: req.body.plaQtdMod,
                    plaWattMod: req.body.plaWattMod,
                    plaQtdInv: req.body.plaQtdInv,
                    plaKwpInv: req.body.plaKwpInv,
                    plaDimArea: req.body.plaDimArea,
                    plaQtdString: req.body.plaQtdString,
                    plaModString: req.body.plaModString,
                    plaQtdEst: req.body.plaQtdEst
                }
                new Vistoria(vistoria).save().then(() => {
                    Detalhado.findOne({ projeto: req.body.id }).then((detalhe) => {
                        if (detalhe._id != '' && typeof detalhe._id != 'undefined' && detalhe != null) {
                            detalhe.projeto = req.body.id
                            detalhe.unidadeMod = req.body.plaQtdMod
                            detalhe.save().then(() => {
                                projeto.qtdmod = req.body.plaQtdMod
                                projeto.totint = parseFloat(req.body.plaQtdMod) * parseFloat(projeto.rspmod)
                                projeto.save().then(() => {
                                    req.flash('success_msg', 'Vistoria salva com sucesso.')
                                    res.redirect('/gerenciamento/vistoriaPla/' + req.body.id)
                                })
                            })
                        } else {
                            const detalhe = {
                                projeto: req.body.id,
                                unidadeMod: req.body.plaQtdMod
                            }
                            new Detalhado(detalhe).save().then(() => {
                                projeto.qtdmod = req.body.plaQtdMod
                                projeto.totint = parseFloat(req.body.plaQtdMod) * parseFloat(projeto.rspmod)
                                projeto.save().then(() => {
                                    req.flash('success_msg', 'Vistoria salva com sucesso.')
                                    res.redirect('/gerenciamento/vistoriaPla/' + req.body.id)
                                })
                            })
                        }
                    })
                })
            }
        })
    })
})

router.post('/vermais/', ehAdmin, (req, res) => {
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

    const cores = req.body.cores

    var todasCores = []

    //console.log('cores=>' + cores)

    var q = 0
    var inicio
    var fim
    var anoinicio
    var mesinicio
    var anofim
    var mesfim
    var diainicio
    var diafim
    var meshoje
    var trintaeum = false
    var bisexto = false
    var mes = 0
    var dif = 0
    var dia = 0
    var anotitulo = 0
    var c = 0

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

    var mestitulo = req.body.mes
    var anotitulo = req.body.ano

    switch (mestitulo) {
        case 'Janeiro':
            janeiro = 'active'
            meshoje = '01'
            trintaeum = true
            break;
        case 'Fevereiro':
            fevereiro = 'active'
            meshoje = '02'
            bisexto = true
            break;
        case 'Março':
            marco = 'active'
            meshoje = '03'
            trintaeum = true
            break;
        case 'Abril':
            abril = 'active'
            meshoje = '04'
            break;
        case 'Maio':
            maio = 'active'
            meshoje = '05'
            trintaeum = true
            break;
        case 'Junho':
            junho = 'active'
            meshoje = '06'
            break;
        case 'Julho':
            julho = 'active'
            meshoje = '07'
            trintaeum = true
            break;
        case 'Agosto':
            agosto = 'active'
            meshoje = '08'
            trintaeum = true
            break;
        case 'Setembro':
            setembro = 'active'
            meshoje = '09'
            break;
        case 'Outubro':
            outubro = 'active'
            meshoje = '10'
            trintaeum = true
            break;
        case 'Novembro':
            novembro = 'active'
            meshoje = '11'
            break;
        case 'Dezembro':
            dezembro = 'active'
            meshoje = '12'
            trintaeum = true
            break;
    }

    // var datafim = parseFloat('31' + '12' + req.body.anofim)
    // var dataini = parseFloat('01' + '01' + req.body.anoinicio)

    Pessoa.findOne({ _id: req.body.id }).lean().then((pessoa) => {
        Equipe.find({ user: id, prjfeito: false, nome_projeto: { $exists: true }, ins0: { $exits: true }, dtinicio: { $ne: '00/00/0000' }, ins0: { $exists: true }, $or: [{ ins0: pessoa.nome }, { ins1: pessoa.nome }, { ins2: pessoa.nome }, { ins3: pessoa.nome }, { ins4: pessoa.nome }, { ins5: pessoa.nome }] }).then((equipe) => {
            //console.log(equipe)
            equipe.forEach((e) => {
                Proposta.findOne({ equipe: e._id, ganho: true, encerrado: false }).then((proposta) => {
                    Cliente.findOne({ _id: proposta.cliente }).then((cliente) => {
                        q++
                        inicio = e.dtinicio
                        fim = e.dtfim
                        //console.log('cliente.nome=>' + cliente.nome)
                        anoinicio = inicio.substring(0, 4)
                        anofim = fim.substring(0, 4)
                        mesinicio = inicio.substring(5,)
                        mesfim = fim.substring(5,)
                        diainicio = inicio.substring(8, 11)
                        diafim = fim.substring(8, 11)
                        con1 = String(mesinicio) + String(diainicio)
                        con2 = String(mesfim) + String(diafim)
                        dif1 = parseFloat(con2) - parseFloat(con1) + 1
                        if (meshoje == mesinicio) {
                            if (parseFloat(anotitulo) == parseFloat(anoinicio)) {
                                mes = meshoje
                                dia = diainicio
                                if (parseFloat(anofim) > parseFloat(anoinicio)) {
                                    //console.log('projeto ultrapassa anos')
                                    if (meshoje == 1 || meshoje == 3 || meshoje == 5 || meshoje == 7 || meshoje == 8 || meshoje == 10 || meshoje == 12) {
                                        dif = 31
                                    } else {
                                        dif = 30
                                    }
                                } else {
                                    dif = parseFloat(diafim) - parseFloat(diainicio) + 1
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

                        //console.log('cores.length=>' + cores.length)

                        color = cores[c]

                        //console.log('color=>' + color)
                        todasCores.push({ color })

                        //console.log("meshoje=>" + meshoje)
                        for (i = 0; i < dif; i++) {
                            if (meshoje == mes) {
                                //console.log('entrou no laço')
                                //console.log('dia=>' + dia)
                                switch (String(dia)) {
                                    case '01':
                                        dia01.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '02':
                                        dia02.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '03':
                                        dia03.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '04':
                                        dia04.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '05':
                                        dia05.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '06':
                                        dia06.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '07':
                                        dia07.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '08':
                                        dia08.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '09':
                                        dia09.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '10':
                                        dia10.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '11':
                                        dia11.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '12':
                                        dia12.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '13':
                                        dia13.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '14':
                                        dia14.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '15':
                                        dia15.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '16':
                                        dia16.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '17':
                                        dia17.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '18':
                                        dia18.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '19':
                                        dia19.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '20':
                                        dia20.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '21':
                                        dia21.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '22':
                                        dia22.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '23':
                                        dia23.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '24':
                                        dia24.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '25':
                                        dia25.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '26':
                                        dia26.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '27':
                                        dia27.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '28':
                                        dia28.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '29':
                                        dia29.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '30':
                                        dia30.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                    case '31':
                                        dia31.push({ id: e._id, cliente: cliente.nome, cor: color })
                                        break;
                                }
                                dia++
                                if (dia < 10) {
                                    dia = '0' + dia
                                }
                                //console.log('diainicio=>' + diainicio)
                            }
                        }
                        c++

                        if (q == equipe.length) {
                            //console.log('dia10=>' + dia10)
                            //console.log('anofim=>' + anofim)
                            //console.log('anoinicio=>' + anoinicio)
                            //console.log('mes=>' + mes)
                            //console.log('mesfim=>' + mesfim)

                            res.render('principal/vermais', {
                                dia01, dia02, dia03, dia04, dia05, dia06, dia07, dia08, dia09, dia10,
                                dia11, dia12, dia13, dia14, dia15, dia16, dia17, dia18, dia19, dia20,
                                dia21, dia22, dia23, dia24, dia25, dia26, dia27, dia28, dia29, dia30, dia31,
                                janeiro, fevereiro, marco, abril, maio, junho, julho, agosto, setembro, outubro, novembro, dezembro,
                                mestitulo, anotitulo, pessoa, trintaeum, bisexto, todasCores
                            })
                        }
                    }).catch((err) => {
                        req.flash('error_msg', 'Falha ao encontra o cliente.')
                        res.redirect('/gerenciamento/vermais/' + req.body.id)
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Falha ao encontra a proposta.')
                    res.redirect('/gerenciamento/vermais/' + req.body.id)
                })
            })
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao encontra a equipe.')
            res.redirect('/gerenciamento/vermais/' + req.body.id)
        })
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontra a pessoa.')
        res.redirect('/gerenciamento/vermais/' + req.body.id)
    })
})

router.post('/aplicaSelecao', ehAdmin, (req, res) => {
    var id
    const { _id } = req.user
    const { user } = req.user
    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }
    var enviado = []
    var negociando = []
    var baixado = []
    var ganho = []
    var dataini
    var datafim
    var ano = req.body.ano
    var mes = req.body.mes
    var cliente
    var q = 0

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

    var mestitulo = ''

    //console.log('mes=>' + mes)

    switch (String(mes)) {
        case 'Janeiro':
            janeiro = 'active'
            mestitulo = 'Janeiro'
            dataini = String(ano) + '01' + '01'
            datafim = String(ano) + '01' + '31'
            break;
        case 'Fevereiro':
            fevereiro = 'active'
            mestitulo = 'Fevereiro'
            dataini = String(ano) + '02' + '01'
            datafim = String(ano) + '02' + '28'
            break;
        case 'Março':
            marco = 'active'
            mestitulo = 'Março'
            dataini = String(ano) + '03' + '01'
            datafim = String(ano) + '03' + '31'
            break;
        case 'Abril':
            abril = 'active'
            mestitulo = 'Abril'
            dataini = String(ano) + '04' + '01'
            datafim = String(ano) + '04' + '30'
            break;
        case 'Maio':
            maio = 'active'
            mestitulo = 'Maio'
            dataini = String(ano) + '05' + '01'
            datafim = String(ano) + '05' + '31'
            break;
        case 'Junho':
            junho = 'active'
            mestitulo = 'Junho'
            dataini = String(ano) + '06' + '01'
            datafim = String(ano) + '06' + '30'
            break;
        case 'Julho':
            julho = 'active'
            mestitulo = 'Julho'
            dataini = String(ano) + '07' + '01'
            datafim = String(ano) + '07' + '31'
            break;
        case 'Agosto':
            agosto = 'active'
            mestitulo = 'Agosto'
            dataini = String(ano) + '08' + '01'
            datafim = String(ano) + '08' + '31'
            break;
        case 'Setembro':
            setembro = 'active'
            mestitulo = 'Setembro'
            dataini = String(ano) + '09' + '01'
            datafim = String(ano) + '09' + '30'
            break;
        case 'Outubro':
            outubro = 'active'
            mestitulo = 'Outubro'
            dataini = String(ano) + '10' + '01'
            datafim = String(ano) + '10' + '31'
            break;
        case 'Novembro':
            novembro = 'active'
            mestitulo = 'Novembro'
            dataini = String(ano) + '11' + '01'
            datafim = String(ano) + '11' + '30'
            break;
        case 'Dezembro':
            dezembro = 'active'
            mestitulo = 'Dezembro'
            dataini = String(ano) + '12' + '01'
            datafim = String(ano) + '12' + '31'
            break;
    }
    //console.log('dataini=>' + dataini)
    //console.log('datafim=>' + datafim)

    Proposta.find({ user: id }).then((proposta) => {
        if (naoVazio(proposta)) {
            proposta.forEach((e) => {
                //console.log('e._id=>' + e._id)
                //console.log('e.status=>' + e.status)
                //console.log('e.baixada=>' + e.baixada)
                //console.log('e.ganho=>' + e.ganho)
                Cliente.findOne({ _id: e.cliente }).then((cli) => {
                    q++
                    cliente = cli.nome

                    if (e.status == 'Enviado' && e.ganho == false && naoVazio(e.motivo) == false) {
                        enviado.push({ id: e._id, cliente, seq: e.seq, status: e.status })
                    }
                    if (e.data < datafim && e.data > dataini) {
                        if (e.ganho == true) {
                            ganho.push({ id: e._id, cliente, seq: e.seq, status: e.status })
                        } else {
                            if (e.baixada == true) {
                                baixado.push({ id: e._id, cliente, seq: e.seq, status: e.status, motivo: e.motivo })
                            } else {

                                if (e.status == 'Negociando' || e.status == 'Analisando Financiamento' || e.status == 'Comparando Propostas' || e.status == 'Aguardando redução de preço') {
                                    negociando.push({ id: e._id, cliente, seq: e.seq, status: e.status })
                                }

                            }
                        }

                    }

                    //console.log('q=>' + q)
                    //console.log('proposta.length=>' + proposta.length)
                    if (q == proposta.length) {
                        res.render('principal/selecao', {
                            enviado, negociando, ganho, baixado, mestitulo, ano,
                            janeiro, fevereiro, marco, abril, maio, junho, julho, agosto, setembro, outubro, novembro, dezembro,
                        })
                    }
                }).catch((err) => {
                    req.flash('error_msg', 'Falha ao encontrar o cliente.')
                    res.redirect('/')
                })
            })
        } else {
            res.render('principal/selecao', {
                enviado, negociando, ganho, baixado, mestitulo, ano,
                janeiro, fevereiro, marco, abril, maio, junho, julho, agosto, setembro, outubro, novembro, dezembro,
            })
        }
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar a proposta<ap.')
        res.redirect('/')
    })
})

router.post('/selecao', ehAdmin, (req, res) => {
    var idneg = []
    var idbax = []
    var idgan = []
    idneg = req.body.idneg
    idbax = req.body.idbax
    idgan = req.body.idgan

    //console.log("idgan=>" + idgan)

    if (naoVazio(idneg)) {
        if (idneg.length > 0) {
            for (i = 0; i < idneg.length; i++) {
                seq = idneg[i].split(' - ')
                Proposta.findOne({ seq: seq[0] }).then((pn) => {
                    pn.status = 'Negociando'
                    pn.save()
                }).catch((err) => {
                    req.flash('error_msg', 'Falha ao encontrar a proposta')
                    res.redirect('/')
                })
            }
        }
    }

    if (naoVazio(idbax)) {
        if (idbax.length > 0) {
            for (i = 0; i < idbax.length; i++) {
                seq = idbax[i].split(' - ')
                Proposta.findOne({ seq: seq[0] }).then((pb) => {
                    pb.baixada = true
                    if (naoVazio(pb.motivo) == false) {
                        pb.motivo = 'Sem motivo'
                    }
                    pb.dtbaixa = dataHoje()
                    pb.save()
                }).catch((err) => {
                    req.flash('error_msg', 'Falha ao encontrar a proposta<selecao>.')
                    res.redirect('/')
                })
            }
        }
    }
    //console.log('idgan.length=>' + idgan.length)
    if (naoVazio(idgan)) {
        if (idgan.length > 0) {
            for (i = 0; i < idgan.length; i++) {
                //console.log('idgan[i]=>' + idgan[i])
                seq = idgan[i].split(' - ')
                //console.log('seq=>' + seq[0])
                Proposta.findOne({ seq: seq[0] }).then((pg) => {
                    pg.ganho = true
                    pg.save()
                }).catch((err) => {
                    req.flash('error_msg', 'Falha ao encontrar a proposta')
                    res.redirect('/')
                })
            }
        }
    }

    res.redirect('/gerenciamento/selecao')
})

router.post('/baixar/', ehAdmin, (req, res) => {
    //console.log('req.body.id=>' + req.body.id)
    Proposta.findOne({ _id: req.body.id }).then((proposta) => {
        proposta.baixada = true
        proposta.motivo = req.body.motivo
        proposta.dtbaixa = dataHoje()
        proposta.descmot = req.body.descricao
        proposta.save().then(() => {
            req.flash('success_msg', 'Proposta baixada com sucesso.')
            res.redirect('/gerenciamento/selecao')
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível salvar a baixa da proposta.')
            res.redirect('/menu')
        })
    })
})

router.post('/aplicarstatus/', ehAdmin, (req, res) => {
    Proposta.findOne({ _id: req.body.id }).then((p) => {
        p.status = req.body.status
        p.descstatus = req.body.descricao
        p.datastatus = dataHoje()
        p.save().then(() => {
            req.flash('success_msg', 'Status da negociacão alterado.')
            res.redirect('/gerenciamento/selecao')
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao salvar a proposta.')
            res.redirect('/gerenciamento/tarefas/' + req.body.id)
        })
    })
})

router.post('/baixardia/', ehAdmin, (req, res) => {
    var mensagem = ''
    var dias = []
    var tamdias = 0
    var diaantes = 0
    var dia = 0
    var data2 = new Date(req.body.databaixa)
    Tarefa.findOne({ _id: req.body.id, $or: [{ dataini: req.body.databaixa }, { datafim: req.body.databaixa }, { 'buscadataini': { $lte: dataBusca(req.body.databaixa) } }, { 'buscadatafim': { $gte: dataBusca(req.body.databaixa) } }], $and: [{ 'buscadataini': { $lte: dataBusca(req.body.databaixa) } }, { 'buscadatafim': { $gte: dataBusca(req.body.databaixa) } }] }).then((t) => {
        if (naoVazio(t)) {

            var data1 = new Date(t.dataini)
            if (data2 > data1) {
                dif = Math.abs(data2.getTime() - data1.getTime())
                days = Math.ceil(dif / (1000 * 60 * 60 * 24))
                //console.log('days=>' + days)
                dia = days + 1
                //console.log('dia=>' + dia)
                Tarefa.findOneAndUpdate({ _id: req.body.id, 'dias.dia': dia }, { $set: { 'dias.$.feito': true } }).then(() => {
                    dias = t.dias
                    tamdias = dias.length
                    diaantes = dia - 2
                    diadepois = dia
                    mensagem = 'Dia baixado com sucesso.'
                    //console.log('tamdias=>' + tamdias)
                    //console.log('dia=>' + dia)
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
                    req.flash('success_msg', 'Dia baixado com sucesso.')
                    res.redirect('/gerenciamento/tarefas/' + req.body.id)
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

router.post('/filtrar', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }

    var enviado = false
    var ganho = false
    var encerrado = false
    var assinado = false
    var baixado = false
    var posvenda = false
    var vistoria = false
    var pedido = false
    var nota = false
    var trt = false
    var protocolo = false
    var execucao = false
    var almoxarifado = false
    var enviaalmoxarifado = false
    var faturado = false

    var lista = []
    var listaOrcado = []
    var listaAberto = []
    var listaEncerrado = []
    var listaAndamento = []
    var listaBaixado = []
    var nome_insres = ''
    var responsavel = ''
    var status = ''
    var idemp
    var idres
    var idcli
    // var equipe_insres 

    var dtcadastro = '0000-00-00'
    var dtinicio = '0000-00-00'
    var dtfim = '0000-00-00'
    var dataini = 0
    var datafim = 0
    var data = []
    var sql = []
    var tipo = []
    var busca_equipe = []
    var busca = []

    var respons
    var cliente
    var stats
    var empresa
    var motivo

    var q = 0

    //console.log('req.body.dataini=>' + req.body.dataini)
    //console.log('req.body.datafim=>' + req.body.datafim)

    if (req.body.dataini == '' || req.body.datafim == '' || (dataBusca(req.body.dataini) > dataBusca(req.body.datafim))) {
        req.flash('error_msg', 'Verificar as datas de busca escolhidas.')
        if (req.body.tipo != '') {
            res.redirect('/gerenciamento/consulta/' + req.body.tipo)
        } else {
            res.redirect('/gerenciamento/consulta/')
        }
    }

    Cliente.find({ user: id }).lean().then((todos_clientes) => {
        Pessoa.find({ user: id, funges: 'checked' }).lean().then((todos_responsaveis) => {
            Empresa.find({ user: id }).lean().then((todas_empresas) => {
                stats = req.body.stats
                empresa = req.body.empresa
                cliente = req.body.cliente
                respons = req.body.responsavel
                motivo = req.body.motivo
                if (typeof stats == 'undefined') {
                    stats = 'Todos'
                }

                dataini = dataBusca(req.body.dataini)
                datafim = dataBusca(req.body.datafim)

                if (req.body.tipo != '') {
                    Equipe.find({ feito: true, liberar: true, $and: [{ 'dtinicio': { $ne: '' } }, { 'dtinicio': { $ne: '0000-00-00' } }] }).then((equipe) => {
                        //console.log('req.body.tipo=>' + req.body.tipo)
                        var idequipe = []
                        equipe.forEach((e) => {
                            //console.log('e._id=>' + e._id)
                            idequipe = { equipe: e._id }
                            data = { 'datacad': { $lte: datafim, $gte: dataini } }

                            if (req.body.tipo == 'emandamento') {
                                sql = filtrarProposta(2, id, stats, motivo, respons, empresa, cliente, enviado, ganho, assinado, encerrado)
                                tipo = { ganho: true, encerrado: false }
                                busca = Object.assign(sql, data, tipo, idequipe)
                            } else {
                                if (req.body.tipo == 'baixado') {
                                    sql = filtrarProposta(3, id, stats, motivo, respons, empresa, cliente, enviado, ganho, assinado, encerrado)
                                    tipo = { baixada: true, motivo: { $exists: true } }
                                    busca = Object.assign(sql, data, tipo, idequipe)
                                } else {
                                    sql = filtrarProposta(2, id, stats, motivo, respons, empresa, cliente, enviado, ganho, assinado, encerrado)
                                    busca = Object.assign(sql, data, idequipe)
                                }
                            }
                            Proposta.findOne(busca).sort({ 'datacad': 'asc' }).then((proposta) => {
                                Cliente.findOne({ _id: proposta.cliente }).then((lista_cliente) => {
                                    //console.log('equipe=>'+equipe)
                                    Pessoa.findOne({ _id: proposta.responsavel }).then((lista_responsavel) => {
                                        //console.log('equipe.insres=>' + equipe.insres)
                                        //    if (typeof equipe.insres == 'undefined') {
                                        //         equipe_insres = '111111111111111111111111'
                                        //     }else{
                                        //         equipe_insres = equipe.insres
                                        //     }
                                        Pessoa.findOne({ _id: e.insres }).then((insres) => {
                                            //console.log('equipe=>' + equipe)
                                            //console.log('insres=>' + insres)
                                            q++
                                            if (naoVazio(proposta.datacad)) {
                                                dtcadastro = proposta.datacad
                                            } else {
                                                dtcadastro = '00000000'
                                            }

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

                                            if (naoVazio(e.dtinicio)) {
                                                dtinicio = e.dtinicio
                                            } else {
                                                dtinicio = '0000-00-00'
                                            }

                                            if (naoVazio(e.dtfim)) {
                                                dtfim = e.dtfim
                                            } else {
                                                dtfim = '0000-00-00'
                                            }

                                            //console.log('req.body.tipo=>' + req.body.tipo)
                                            if (req.body.tipo == 'baixado') {
                                                listaBaixado.push({ id: proposta._id, seq: proposta.seq, motivo: proposta.motivo, dtbaixa: dataMensagem(proposta.dtbaixa), cliente: lista_cliente.nome, responsavel, cadastro: dataMsgNum(dtcadastro) })
                                            } else {
                                                if (req.body.tipo == 'orcado' || req.body.tipo == 'aberto' || req.body.tipo == 'encerrado') {
                                                    if (e.feito == true && e.ganho == false && e.encerrado == false) {
                                                        listaOrcado.push({ id: proposta._id, seq: proposta.seq, cliente: lista_cliente.nome, responsavel, nome_insres, cadastro: dataMsgNum(dtcadastro), inicio: dataMensagem(dtinicio), fim: dataMensagem(dtfim) })
                                                    } else {
                                                        if (e.feito == true && e.ganho == true && e.encerrado == false) {
                                                            listaAberto.push({ id: proposta._id, seq: proposta.seq, cliente: lista_cliente.nome, responsavel, nome_insres, cadastro: dataMsgNum(dtcadastro), inicio: dataMensagem(dtinicio), fim: dataMensagem(dtfim) })
                                                        } else {
                                                            listaEncerrado.push({ id: proposta._id, seq: proposta.seq, cliente: lista_cliente.nome, responsavel, nome_insres, cadastro: dataMsgNum(dtcadastro), inicio: dataMensagem(dtinicio), fim: dataMensagem(dtfim) })
                                                        }
                                                    }
                                                } else {
                                                    //console.log('entrou')
                                                    //console.log("proposta.seq=>" + proposta.seq)
                                                    //console.log("dtfim=>" + dtfim)
                                                    //console.log("dtinicio=>" + dtinicio)
                                                    //console.log("dtcadastro=>" + dtcadastro)
                                                    //console.log("nome_insres=>" + nome_insres)
                                                    //console.log("responsavel=>" + responsavel)
                                                    //console.log("lista_cliente.nome=>" + lista_cliente.nome)
                                                    listaAndamento.push({ id: proposta._id, seq: proposta.seq, cliente: lista_cliente.nome, responsavel, nome_insres, cadastro: dataMsgNum(dtcadastro), dtinicio: dataMensagem(dtinicio), deadline: dataMensagem(dtfim) })
                                                }
                                            }

                                            //console.log('q=>' + q)
                                            //console.log('equipe.length=>' + equipe.length)
                                            //console.log('nome_insres=>' + nome_insres)

                                            if (q == equipe.length) {
                                                if (cliente == 'Todos') {
                                                    cliente = '111111111111111111111111'
                                                }
                                                if (respons == 'Todos') {
                                                    respons = '111111111111111111111111'
                                                }
                                                if (empresa == 'Todos') {
                                                    empresa = '111111111111111111111111'
                                                }
                                                Cliente.findOne({ _id: cliente }).then((nome_cli) => {
                                                    Pessoa.findOne({ _id: respons }).then((nome_res) => {
                                                        Empresa.findOne({ _id: empresa }).then((nome_emp) => {
                                                            //console.log('nome_cli=>' + nome_cli)
                                                            //console.log('nome_res=>' + nome_res)
                                                            //console.log('nome_emp=>' + nome_emp)
                                                            if (nome_cli == null) {
                                                                nomeCliente = 'Todos'
                                                                idcli = 'Todos'
                                                            } else {
                                                                nomeCliente = nome_cli.nome
                                                                idcli = nome_cli._id
                                                            }
                                                            if (nome_res == null) {
                                                                nomeResponsavel = 'Todos'
                                                                idres = 'Todos'
                                                            } else {
                                                                nomeResponsavel = nome_res.nome
                                                                idres = nome_res._id
                                                            }
                                                            if (nome_emp == null) {
                                                                nomeEmpresa = 'Todos'
                                                                idemp = 'Todos'
                                                            } else {
                                                                nomeEmpresa = nome_emp.nome
                                                                idemp = nome_emp._id
                                                            }

                                                            //console.log('listaBaixado=>' + listaBaixado)

                                                            if (req.body.tipo == 'baixado') {
                                                                res.render('principal/consulta', { listaBaixado, todos_clientes, todos_responsaveis, todas_empresas, tipo: 'orcado', titulo: ': Orçamentos Enviados', nomeCliente, nomeResponsavel, nomeEmpresa, dataini: req.body.dataini, datafim: req.body.datafim })
                                                            }
                                                            if (req.body.tipo == 'orcado') {
                                                                res.render('principal/consulta', { listaOrcado, todos_clientes, todos_responsaveis, todas_empresas, tipo: 'orcado', titulo: ': Orçamentos Enviados', nomeCliente, nomeResponsavel, nomeEmpresa, dataini: req.body.dataini, datafim: req.body.datafim })
                                                            }
                                                            if (req.body.tipo == 'aberto') {
                                                                //console.log('entrou')
                                                                res.render('principal/consulta', { listaAberto, todos_clientes, todos_responsaveis, todas_empresas, tipo: 'aberto', titulo: ': Em Aberto', nomeCliente, nomeResponsavel, nomeEmpresa, dataini: req.body.dataini, datafim: req.body.datafim })
                                                            }
                                                            if (req.body.tipo == 'encerrado') {
                                                                res.render('principal/consulta', { listaEncerrado, todos_clientes, todos_responsaveis, todas_empresas, tipo: 'encerrado', titulo: ': Encerrado', idcli, idres, idemp, nomeCliente, nomeResponsavel, nomeEmpresa, dataini: req.body.dataini, datafim: req.body.datafim })
                                                            }
                                                            if (req.body.tipo == 'emandamento') {
                                                                //console.log('entrou lista')
                                                                res.render('principal/emandamento', { listaAndamento, todos_clientes, todos_responsaveis, todas_empresas, dataini: req.body.dataini, datafim: req.body.datafim, nomeCliente, nomeResponsavel, nomeEmpresa })
                                                            }

                                                        }).catch((err) => {
                                                            req.flash('error_msg', 'Nenhuma empresa encontrada.')
                                                            res.redirect('/gerenciamento/consulta/' + req.body.tipo)
                                                        })
                                                    }).catch((err) => {
                                                        req.flash('error_msg', 'Nenhuma pessoa encontrada.')
                                                        res.redirect('/gerenciamento/consulta/' + req.body.tipo)
                                                    })
                                                }).catch((err) => {
                                                    req.flash('error_msg', 'Nenhum cliente encontrado.')
                                                    res.redirect('/gerenciamento/consulta/' + req.body.tipo)
                                                })
                                            }
                                        }).catch((err) => {
                                            req.flash('error_msg', 'Nenhum técnico responsável encontrado.')
                                            res.redirect('/gerenciamento/consulta/' + req.body.tipo)
                                        })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Nenhum gestor responsável encontrado.')
                                        res.redirect('/gerenciamento/consulta/' + req.body.tipo)
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Nenhuma cliente encontrado.')
                                    res.redirect('/gerenciamento/consulta/' + req.body.tipo)
                                })
                            }).catch((err) => {
                                //console.log('req.body.tipo=>' + req.body.tipo)
                                req.flash('error_msg', 'Nenhuma proposta encontrada.')
                                if (req.body.tipo == 'emandamento') {
                                    caminho = '/gerenciamento/emandamento/lista'
                                } else {
                                    caminho = '/gerenciamento/consulta/' + req.body.tipo
                                }
                                //console.log('emandamento')
                                res.redirect(caminho)

                            })
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Nenhuma equipe encontrada.')
                        res.redirect('/gerenciamento/consulta/' + req.body.tipo)
                    })
                } else {
                    //console.log('realizado=>' + realizado)
                    //console.log('classificacao=>' + classificacao)
                    //console.log('funres=>' + funres)
                    //console.log('cliente=>' + cliente)
                    //console.log('responsavel=>' + responsavel)
                    //console.log('status=>' + stats)

                    switch (stats) {
                        case 'Baixado': baixado = true, enviado = true
                            break;
                        case 'Proposta Enviada': enviado = true
                            break;
                        case 'Preparando para a Visita': ganho = true; enviado = true
                            break;
                        case 'Visita': vistoria = true; ganho = true; enviado = true
                            break;
                        case 'Contrato': assinado = true; ganho = true; vistoria = true; enviado = true
                            break;
                        case 'Pedido de Compra': pedido = true; assinado = true; ganho = true; vistoria = true; enviado = true
                            break;
                        case 'NF de Compra': nota = true; pedido = true; assinado = true; ganho = true; vistoria = true; enviado = true
                            break;
                        case 'TRT': trt = true; nota = true; pedido = true; assinado = true; ganho = true; vistoria = true; enviado = true
                            break;
                        case 'Protocolado': protocolo = true; trt = true; nota = true; pedido = true; assinado = true; ganho = true; vistoria = true; enviado = true
                            break;
                        case 'Execução a Campo': execucao = true; protocolo = true; trt = true; nota = true; pedido = true; assinado = true; ganho = true; vistoria = true; enviado = true
                            break;
                        case 'Almoxarifado Em Aberto': enviaalmoxarifado = true; execucao = true; protocolo = true; trt = true; nota = true; pedido = true; assinado = true; ganho = true; vistoria = true; enviado = true
                            break;
                        case 'Almoxarifado Fechado': almoxarifado = true; enviaalmoxarifado = true; execucao = true; protocolo = true; trt = true; nota = true; pedido = true; assinado = true; ganho = true; vistoria = true; pra = true; pedido = true; assinado = true; ganho = true; vistoria = true; enviado = true
                            break;
                        case 'Faturado': faturado = true; almoxarifado = true; enviaalmoxarifado = true; execucao = true; protocolo = true; trt = true; nota = true; pedido = true; assinado = true; ganho = true; vistoria = true; pra = true; pedido = true; assinado = true; ganho = true; vistoria = true; enviado = true
                            break;
                        case 'Pós-Venda': posvenda = true; faturado = true; almoxarifado = true; enviaalmoxarifado = true; execucao = true; protocolo = true; trt = true; nota = true; pedido = true; assinado = true; ganho = true; vistoria = true; pra = true; pedido = true; assinado = true; ganho = true; vistoria = true; enviado = true
                            break;
                        case 'Encerrado': encerrado = true; posvenda = true; faturado = true; almoxarifado = true; enviaalmoxarifado = true; execucao = true; protocolo = true; trt = true; nota = true; pedido = true; assinado = true; ganho = true; vistoria = true; pra = true; pedido = true; assinado = true; ganho = true; vistoria = true; enviado = true
                            break;
                    }

                    sql = filtrarProposta(1, id, stats, motivo, respons, empresa, cliente, enviado, ganho, assinado, encerrado, baixado)

                    //console.log('data=>'+data)   
                    busca = Object.assign(sql, data)

                    Proposta.find(busca).sort({ 'datacad': 'asc' }).then((p) => {
                        //console.log(p)
                        if (p != '') {
                            p.forEach((e) => {
                                Cliente.findOne({ _id: e.cliente }).then((lista_cliente) => {
                                    Pessoa.findOne({ _id: e.responsavel }).lean().then((lista_responsavel) => {
                                        Empresa.findOne({ _id: e.empresa }).then((lista_empresa) => {
                                            Vistoria.findOne({ proposta: e._id }).then((visto) => { //feito: vistoria
                                                Equipe.findOne({ _id: e.equipe }).then((equipe) => { //feito: execucao
                                                    Pessoa.findOne({ _id: equipe.insres }).then((insres) => {
                                                        Documento.findOne({ proposta: e._id }).then((documento) => { //, feitotrt: trt, protocolado: protocolo, feitoalmox: almoxarifado, enviaalmox: enviaalmoxarifado, feitofaturado: faturado
                                                            Compra.findOne({ proposta: e._id }).then((compra) => { //feitopedido: pedido, feitonota: nota 
                                                                Posvenda.findOne({ proposta: e._id }).then((posvenda) => { //, feito: posvenda
                                                                    q++
                                                                    //console.log('visto=>' + visto)
                                                                    //console.log('equipe=>' + equipe)
                                                                    //console.log('documento=>' + documento)
                                                                    //console.log('compra=>' + compra)
                                                                    //console.log('posvenda=>' + posvenda)
                                                                    if (visto == null || equipe == null || documento == null || compra == null) {
                                                                        req.flash('error_msg', 'Não foi possível encontrar projetos com os filtros selecionados.')
                                                                        res.redirect('/gerenciamento/consulta')
                                                                    }

                                                                    if (naoVazio(e.datacad)) {
                                                                        dtcadastro = e.datacad
                                                                    } else {
                                                                        dtcadastro = '00000000'
                                                                    }

                                                                    if (e.ganho == true) {
                                                                        if (e.encerrado == true) {
                                                                            status = 'Encerrado'
                                                                            dtinicio = equipe.dtinicio
                                                                            dtfim = equipe.dtfim
                                                                        } else {
                                                                            if (posvenda.feito == true) {
                                                                                status = 'Pós-Venda'
                                                                                dtinicio = equipe.dtinicio
                                                                                dtfim = equipe.dtfim
                                                                            } else {
                                                                                if (documento.feitofaturado == true) {
                                                                                    status = 'Faturado'
                                                                                    dtinicio = equipe.dtinicio
                                                                                    dtfim = equipe.dtfim
                                                                                } else {
                                                                                    if (documento.feitoalmox == true) {
                                                                                        status = 'Almoxarifado Fechado'
                                                                                        dtinicio = equipe.dtinicio
                                                                                        dtfim = equipe.dtfim
                                                                                    } else {
                                                                                        if (documento.enviaalmox == true) {
                                                                                            status = 'Almoxarifado Em Aberto'
                                                                                            dtinicio = equipe.dtinicio
                                                                                            dtfim = equipe.dtfim
                                                                                        } else {
                                                                                            if (equipe.feito == true) {
                                                                                                status = 'Execução a Campo'
                                                                                                dtinicio = equipe.dtinicio
                                                                                                dtfim = equipe.dtfim
                                                                                            } else {
                                                                                                if (documento.protocolado == true) {
                                                                                                    status = 'Protocolado'
                                                                                                } else {
                                                                                                    if (documento.feitotrt == true) {
                                                                                                        status = 'TRT'
                                                                                                    } else {
                                                                                                        if (compra.feitonota == true) {
                                                                                                            status = 'NF'
                                                                                                        } else {
                                                                                                            if (compra.feitopedido == true) {
                                                                                                                status = 'Pedido'
                                                                                                            } else {
                                                                                                                if (e.assinado == true) {
                                                                                                                    status = 'Contrato'
                                                                                                                } else {
                                                                                                                    if (visto.feito == true) {
                                                                                                                        status = 'Visita'
                                                                                                                    } else {
                                                                                                                        status = 'Preparado para a Visita'
                                                                                                                    }
                                                                                                                }
                                                                                                            }
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    } else {
                                                                        if (e.baixada == false) {
                                                                            status = 'Proposta Enviada'
                                                                        } else {
                                                                            status = 'Baixado'
                                                                        }
                                                                    }

                                                                    //console.log('status=>'+status)
                                                                    if (naoVazio(lista_responsavel)) {
                                                                        responsavel = lista_responsavel.nome
                                                                    } else {
                                                                        responsavel = ''
                                                                    }
                                                                    //console.log('responsavel=>'+responsavel)
                                                                    //console.log('responsavel=>' + responsavel)
                                                                    if (naoVazio(insres)) {
                                                                        nome_insres = insres.nome
                                                                    } else {
                                                                        nome_insres = ''
                                                                    }
                                                                    //console.log('nome_insres=>'+nome_insres)
                                                                    //console.log('nome_insres=>' + nome_insres)
                                                                    if (typeof equipe.dtinicio == 'undefined' || equipe.dtinicio == '' || equipe.dtinicio == null) {
                                                                        dtinicio = '0000-00-00'
                                                                    } else {
                                                                        dtinicio = equipe.dtinicio
                                                                    }
                                                                    //console.log('dtinicio=>'+dtinicio)
                                                                    //console.log('dtinicio=>' + dtinicio)
                                                                    if (typeof equipe.dtfim == 'undefined' || equipe.dtfim == '' || equipe.dtfim == null) {
                                                                        dtfim = '0000-00-00'
                                                                    } else {
                                                                        dtfim = equipe.dtfim
                                                                    }
                                                                    //console.log('dtfim=>'+dtfim)
                                                                    //console.log('dtfim=>' + dtfim)
                                                                    //console.log('status=>' + status)

                                                                    lista.push({ s: status, id: e._id, seq: e.seq, cliente: lista_cliente.nome, empresa: lista_empresa.nome, responsavel, nome_insres, cadastro: dataMsgNum(dtcadastro), inicio: dataMensagem(dtinicio), fim: dataMensagem(dtfim) })

                                                                    if (q == p.length) {
                                                                        if (cliente == 'Todos') {
                                                                            cliente = '111111111111111111111111'
                                                                        }
                                                                        if (respons == 'Todos') {
                                                                            respons = '111111111111111111111111'
                                                                        }
                                                                        if (empresa == 'Todos') {
                                                                            empresa = '111111111111111111111111'
                                                                        }
                                                                        Cliente.findOne({ _id: cliente }).then((nome_cli) => {
                                                                            Pessoa.findOne({ _id: respons }).then((nome_res) => {
                                                                                Empresa.findOne({ _id: empresa }).then((nome_emp) => {
                                                                                    //console.log('nome_cli=>' + nome_cli)
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
                                                                                    res.render('principal/consulta', { lista, todos_clientes, todos_responsaveis, todas_empresas, filtroStatus: stats, nomeCliente, nomeResponsavel, nomeEmpresa, dataini: req.body.dataini, datafim: req.body.datafim })
                                                                                }).catch((err) => {
                                                                                    req.flash('error_msg', 'Nenhuma empresa encontrada.')
                                                                                    res.redirect('/gerenciamento/consulta')
                                                                                })
                                                                            }).catch((err) => {
                                                                                req.flash('error_msg', 'Nenhuma pessoa encontrada.')
                                                                                res.redirect('/gerenciamento/consulta')
                                                                            })
                                                                        }).catch((err) => {
                                                                            req.flash('error_msg', 'Nenhum cliente encontrado.')
                                                                            res.redirect('/gerenciamento/consulta')
                                                                        })
                                                                    }
                                                                }).catch((err) => {
                                                                    req.flash('error_msg', 'Nenhum pós venda encontrado.')
                                                                    res.redirect('/gerenciamento/consulta')
                                                                })
                                                            }).catch((err) => {
                                                                req.flash('error_msg', 'Nenhuma compra encontrada.')
                                                                res.redirect('/gerenciamento/consulta')
                                                            })
                                                        }).catch((err) => {
                                                            req.flash('error_msg', 'Nenhum documento encontrado.')
                                                            res.redirect('/gerenciamento/consulta')
                                                        })
                                                    }).catch((err) => {
                                                        req.flash('error_msg', 'Nenhum técnico responsável encontrado.')
                                                        res.redirect('/gerenciamento/consulta')
                                                    })
                                                }).catch((err) => {
                                                    req.flash('error_msg', 'Nenhuma equipe encontrada.')
                                                    res.redirect('/gerenciamento/consulta')
                                                })
                                            }).catch((err) => {
                                                req.flash('error_msg', 'Nenhuma vistoria encontrada.')
                                                res.redirect('/gerenciamento/consulta')
                                            })
                                        }).catch((err) => {
                                            req.flash('error_msg', 'Nenhuma empresa encontrada.')
                                            res.redirect('/gerenciamento/consulta')
                                        })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Nenhuma pessoa encontrada.')
                                        res.redirect('/gerenciamento/consulta')
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Nenhuma cliente encontrado.')
                                    res.redirect('/gerenciamento/consulta')
                                })
                            })
                        } else {
                            req.flash('error_msg', 'Nenhuma proposta encontrada com os filtros para as datas entre ' + dataMensagem(req.body.ini) + ' e ' + dataMensagem(req.body.fim))
                            res.redirect('/gerenciamento/consulta')
                        }
                    }).catch((err) => {
                        req.flash('error_msg', 'Nenhuma proposta encontrada.')
                        res.redirect('/gerenciamento/consulta')
                    })
                }
            }).catch((err) => {
                req.flash('error_msg', 'Nenhuma empresas encontrada.')
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

router.post('/emandamento/', ehAdmin, (req, res) => {
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

    todasCores = []

    const cores = req.body.cores

    var q = 0
    var c = 0
    var inicio
    var fim
    var anoinicio
    var mesinicio
    var diainicio
    var con1
    var con2
    var dif1
    var hoje
    var meshoje
    var mestitulo
    var anotitulo
    var trintaeum = false
    var bisexto = false
    var dia
    var mes
    var dif
    var color

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
    var meshoje = hoje.substring(5,)
    var anotitulo = req.body.ano

    var mestitulo = req.body.mes

    var dataini
    var datafim

    switch (mestitulo) {
        case 'Janeiro':
            janeiro = 'active'
            meshoje = '01'
            trintaeum = true
            break;
        case 'Fevereiro':
            fevereiro = 'active'
            meshoje = '02'
            bisexto = true
            break;
        case 'Março':
            marco = 'active'
            meshoje = '03'
            trintaeum = true
            break;
        case 'Abril':
            abril = 'active'
            meshoje = '04'
            break;
        case 'Maio':
            maio = 'active'
            meshoje = '05'
            trintaeum = true
            break;
        case 'Junho':
            junho = 'active'
            meshoje = '06'
            break;
        case 'Julho':
            julho = 'active'
            meshoje = '07'
            trintaeum = true
            break;
        case 'Agosto':
            agosto = 'active'
            meshoje = '08'
            trintaeum = true
            break;
        case 'Setembro':
            setembro = 'active'
            meshoje = '09'
            break;
        case 'Outubro':
            outubro = 'active'
            meshoje = '10'
            trintaeum = true
            break;
        case 'Novembro':
            novembro = 'active'
            meshoje = '11'
            break;
        case 'Dezembro':
            dezembro = 'active'
            meshoje = '12'
            trintaeum = true
            break;
    }

    dataini = String(anotitulo) + '01' + '01'
    datafim = String(anotitulo) + '12' + '31'
    dataini = parseFloat(dataini)
    datafim = parseFloat(datafim)
    Proposta.find({ user: id, ganho: true, encerrado: false }).then((proposta) => {
        if (proposta != '') {
            proposta.forEach((e) => {
                Cliente.findOne({ _id: e.cliente }).then((cliente) => {
                    Equipe.findOne({ _id: e.equipe, feito: true, liberar: true, $or: [{ 'dtinibusca': { $lte: datafim, $gte: dataini } }, { 'dtfimbusca': { $lte: datafim, $gte: dataini } }] }).sort({ 'dtfimbusca': 'desc' }).then((equipe) => {
                        q++
                        //console.log('equipe=>' + equipe)
                        if (naoVazio(equipe)) {
                            inicio = equipe.dtinicio
                            fim = equipe.dtfim
                            anoinicio = inicio.substring(0, 4)
                            anofim = fim.substring(0, 4)
                            mesinicio = inicio.substring(5,)
                            mesfim = fim.substring(5,)
                            diainicio = inicio.substring(8, 11)
                            diafim = fim.substring(8, 11)
                            con1 = String(mesinicio) + String(diainicio)
                            con2 = String(mesfim) + String(diafim)
                            dif1 = parseFloat(con2) - parseFloat(con1) + 1
                            // compara = mesfim - mesinicio
                            //console.log("meshoje=>" + meshoje)
                            //console.log("mesinicio=>" + mesinicio)
                            //console.log("anotitulo=>" + anotitulo)
                            //console.log("anoinicio=>" + anoinicio)
                            //console.log("anofim=>" + anofim)
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

                            //console.log('dif=>' + dif)
                            //console.log('dia=>' + dia)
                            //console.log('mes=>' + mes)

                            color = cores[c]
                            todasCores.push({ color })

                            for (i = 0; i < dif; i++) {
                                //console.log('meshoje=>' + meshoje)
                                //console.log('mes=>' + mes)
                                //console.log('dia=>' + dia)
                                //console.log('entrou laço')
                                if (meshoje == mes) {
                                    switch (String(dia)) {
                                        case '01':
                                            dia01.push({ id: e._id, cliente: cliente.nome, cor: cores[c] })
                                            break;
                                        case '02':
                                            dia02.push({ id: e._id, cliente: cliente.nome, cor: cores[c] })
                                            break;
                                        case '03':
                                            dia03.push({ id: e._id, cliente: cliente.nome, cor: cores[c] })
                                            break;
                                        case '04':
                                            dia04.push({ id: e._id, cliente: cliente.nome, cor: cores[c] })
                                            break;
                                        case '05':
                                            dia05.push({ id: e._id, cliente: cliente.nome, cor: cores[c] })
                                            break;
                                        case '06':
                                            dia06.push({ id: e._id, cliente: cliente.nome, cor: cores[c] })
                                            break;
                                        case '07':
                                            dia07.push({ id: e._id, cliente: cliente.nome, cor: cores[c] })
                                            break;
                                        case '08':
                                            dia08.push({ id: e._id, cliente: cliente.nome, cor: cores[c] })
                                            break;
                                        case '09':
                                            dia09.push({ id: e._id, cliente: cliente.nome, cor: cores[c] })
                                            break;
                                        case '10':
                                            dia10.push({ id: e._id, cliente: cliente.nome, cor: cores[c] })
                                            break;
                                        case '11':
                                            dia11.push({ id: e._id, cliente: cliente.nome, cor: cores[c] })
                                            break;
                                        case '12':
                                            dia12.push({ id: e._id, cliente: cliente.nome, cor: cores[c] })
                                            break;
                                        case '13':
                                            dia13.push({ id: e._id, cliente: cliente.nome, cor: cores[c] })
                                            break;
                                        case '14':
                                            dia14.push({ id: e._id, cliente: cliente.nome, cor: cores[c] })
                                            break;
                                        case '15':
                                            dia15.push({ id: e._id, cliente: cliente.nome, cor: cores[c] })
                                            break;
                                        case '16':
                                            dia16.push({ id: e._id, cliente: cliente.nome, cor: cores[c] })
                                            break;
                                        case '17':
                                            dia17.push({ id: e._id, cliente: cliente.nome, cor: cores[c] })
                                            break;
                                        case '18':
                                            dia18.push({ id: e._id, cliente: cliente.nome, cor: cores[c] })
                                            break;
                                        case '19':
                                            dia19.push({ id: e._id, cliente: cliente.nome, cor: cores[c] })
                                            break;
                                        case '20':
                                            dia20.push({ id: e._id, cliente: cliente.nome, cor: cores[c] })
                                            break;
                                        case '21':
                                            dia21.push({ id: e._id, cliente: cliente.nome, cor: cores[c] })
                                            break;
                                        case '22':
                                            dia22.push({ id: e._id, cliente: cliente.nome, cor: cores[c] })
                                            break;
                                        case '23':
                                            dia23.push({ id: e._id, cliente: cliente.nome, cor: cores[c] })
                                            break;
                                        case '24':
                                            dia24.push({ id: e._id, cliente: cliente.nome, cor: cores[c] })
                                            break;
                                        case '25':
                                            dia25.push({ id: e._id, cliente: cliente.nome, cor: cores[c] })
                                            break;
                                        case '26':
                                            dia26.push({ id: e._id, cliente: cliente.nome, cor: cores[c] })
                                            break;
                                        case '27':
                                            dia27.push({ id: e._id, cliente: cliente.nome, cor: cores[c] })
                                            break;
                                        case '28':
                                            dia28.push({ id: e._id, cliente: cliente.nome, cor: cores[c] })
                                            break;
                                        case '29':
                                            dia29.push({ id: e._id, cliente: cliente.nome, cor: cores[c] })
                                            break;
                                        case '30':
                                            dia30.push({ id: e._id, cliente: cliente.nome, cor: cores[c] })
                                            break;
                                        case '31':
                                            dia31.push({ id: e._id, cliente: cliente.nome, cor: cores[c] })
                                            break;
                                    }
                                    dia++
                                    if (dia < 10) {
                                        dia = '0' + dia
                                    }
                                    //console.log('diainicio=>' + diainicio)
                                }
                            }
                            c++
                            //console.log('dia01_fora=>' + dia01)
                            if (q == proposta.length) {
                                //console.log('dia01_dentro=>' + dia01)
                                res.render('principal/vermais', {
                                    dia01, dia02, dia03, dia04, dia05, dia06, dia07, dia08, dia09, dia10,
                                    dia11, dia12, dia13, dia14, dia15, dia16, dia17, dia18, dia19, dia20,
                                    dia21, dia22, dia23, dia24, dia25, dia26, dia27, dia28, dia29, dia30, dia31,
                                    janeiro, fevereiro, marco, abril, maio, junho, julho, agosto, setembro, outubro, novembro, dezembro,
                                    mestitulo, anotitulo, trintaeum, bisexto, todasCores, listaAndamento: true, anotitulo
                                })
                            }
                        } else {
                            //console.log('dia01_fora_null=>' + dia01)
                            if (q == proposta.length) {
                                //console.log('dia01_dentro_null=>' + dia01)
                                res.render('principal/vermais', {
                                    dia01, dia02, dia03, dia04, dia05, dia06, dia07, dia08, dia09, dia10,
                                    dia11, dia12, dia13, dia14, dia15, dia16, dia17, dia18, dia19, dia20,
                                    dia21, dia22, dia23, dia24, dia25, dia26, dia27, dia28, dia29, dia30, dia31,
                                    janeiro, fevereiro, marco, abril, maio, junho, julho, agosto, setembro, outubro, novembro, dezembro,
                                    mestitulo, anotitulo, trintaeum, bisexto, todasCores, listaAndamento: true, anotitulo
                                })
                            }
                        }
                    }).catch((err) => {
                        req.flash('error_msg', 'Falha ao encontrar a equipe.')
                        res.redirect('/gerenciamento/emandamento/agenda')
                    })

                }).catch((err) => {
                    req.flash('error_msg', 'Falha ao encontrar o cliente.')
                    res.redirect('/gerenciamento/emandamento/agenda')
                })
            })
        } else {
            req.flash('error_msg', 'Não existem projetos com instalação em andamento.')
            res.redirect('/menu')
        }
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar a proposta<ea>.')
        res.redirect('/menu')
    })
})

router.post('/filtrodash', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    const { pessoa } = req.user
    const { nome } = req.user
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
        case 'Em execução': sqlstatus = { user: id, tarefa: { $exists: true }, feito: false, liberar: true, parado: false }
            break;
        case 'Aguardando': sqlstatus = { user: id, tarefa: { $exists: true }, feito: false, liberar: false, parado: false }
            break;
        case 'Parado': sqlstatus = { user: id, tarefa: { $exists: true }, feito: false, liberar: true, parado: true }
            break;
        case 'Realizado': sqlstatus = { user: id, tarefa: { $exists: true }, feito: true, liberar: true, parado: false }
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

    Empresa.find({ user: id }).lean().then((todas_empresas) => {
        Equipe.find(sqlstatus).sort({ dtinibusca: ordem }).then((equipe) => {
            //console.log('tarefas=>'+tarefas)
            if (naoVazio(equipe)) {
                equipe.forEach((e) => {
                    if (e.feito == false && e.parado == false && e.liberar == false) {
                        qtdagua++
                    } else {
                        if (e.feito == false && e.parado == false && e.liberar == true) {
                            qtdexec++
                        } else {
                            if (e.feito == false && e.parado == true && e.liberar == true) {
                                qtdpara++
                            } else {
                                if (e.feito == true && e.parado == false && e.liberar == true) {
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
                    //console.log('sql>' + JSON.stringify(sql))
                    Tarefa.findOne(sql).then((tarefas) => {
                        //console.log('tarefas=>' + tarefas._id)
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
                                            Pessoa.findOne({ _id: esta_pessoa }).lean().then((nome_pessoa) => {
                                                if (naoVazio(nome_pessoa)) {
                                                    nome_lista = nome_pessoa.nome
                                                } else {
                                                    nome_lista = nome
                                                }
                                                Empresa.findOne({ _id: req.body.empresa }).then((emp) => {
                                                    if (naoVazio(emp)) {
                                                        empselect = emp.nome
                                                    }
                                                    res.render('dashboard', { ano, mes: req.body.mes, numtrf, qtdagua, qtdexec, qtdpara, crm: false, lista_tarefas, nome_lista, saudacao, todos_clientes, todas_empresas, asc, desc, ordem, empselect })
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
                    Empresa.findOne({ _id: req.body.empresa }).then((emp) => {
                        if (naoVazio(emp)) {
                            empselect = emp.nome
                        }
                        res.render('dashboard', { ano, mes: req.body.mes, numtrf, qtdagua, qtdexec, qtdpara, crm: false, id: _id, owner: owner, saudacao, nome_lista, todas_empresas, asc, desc, ordem, empselect })
                    }).catch((err) => {
                        req.flash("error_msg", "Ocorreu uma falha interna para encontrar a empresa<s>.")
                        res.redirect("/")
                    })
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