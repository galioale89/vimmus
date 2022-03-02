const express = require('express')
const app = express()

//var AWS = require('aws-sdk');
//import AWS object without services
//var AWS = require('aws-sdk/global');
//import individual service
//var S3 = require('aws-sdk/clients/s3');

// // Enable CORS
// app.use(function(req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//   next();
// });

//const handlebars = require('express-handlebars')
const { engine } = require('express-handlebars')
const bodyParser = require('body-parser')
const path = require("path")
const mongoose = require('mongoose')

const session = require('express-session')
const flash = require('connect-flash')

const customdo = require("./routes/customdo")
const configuracao = require("./routes/configuracao")
const projeto = require('./routes/projeto')
const gerenciamento = require('./routes/gerenciamento')
const pessoa = require('./routes/pessoa')
const cliente = require('./routes/cliente')
const usuario = require('./routes/usuario')
const administrador = require('./routes/administrador')
const relatorios = require('./routes/relatorios')
const componente = require('./routes/componente')
const fornecedor = require('./routes/fornecedor')

const naoVazio = require('./resources/naoVazio')
const dataBusca = require('./resources/dataBusca')
const comparaDatas = require('./resources/comparaDatas')
const validaCronograma = require('./resources/validaCronograma')
const liberaRecursos = require('./resources/liberaRecursos')
const setData = require('./resources/setData')
const dataMensagem = require('./resources/dataMensagem')
const dataHoje = require('./resources/dataHoje')
const { ehAdmin } = require('./helpers/ehAdmin')
require('./model/Posvenda')

const Usuario = mongoose.model('usuario')
const Tarefa = mongoose.model('tarefas')
const Servico = mongoose.model('servico')
const Proposta = mongoose.model('proposta')
const Cliente = mongoose.model('cliente')
const Pessoa = mongoose.model('pessoa')
const Documento = mongoose.model('documento')
const Compra = mongoose.model('compra')
const Vistoria = mongoose.model('vistoria')
const Equipe = mongoose.model('equipe')
const Posvenda = mongoose.model('posvenda')
const Empresa = mongoose.model('empresa')

const MobileService = require('./apiService/manager')
const mobileService = new MobileService(mongoose, app);
mobileService.run();
//Chamando função de validação de autenticação do usuário pela função passport
const passport = require("passport")
require("./config/auth")(passport)
//Configuração
//Sessions
app.use(session({
    secret: "admin",
    resave: true,
    saveUninitialized: true
}))
//Inicializa passport - login
app.use(passport.initialize())
app.use(passport.session())

//Flash
app.use(flash())

//Middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.aviso_msg = req.flash('aviso_msg')
    res.locals.error = req.flash("error")
    res.locals.user = req.user || null
    next()
})

//Body-Parser
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({
    extended: true,
    limit: '100mb'
}))
//Handlebars
app.disable('x-powered-by')
app.engine('handlebars', engine({ defaultLayout: 'main' }))
//app.engine('handlebars', handlebars({ defaulLayout: "main" }))
app.set('view engine', 'handlebars')


// Essa linha faz o servidor disponibilizar o acesso às imagens via URL!
app.use(express.static('public/'))

//Mongoose DB
mongoose.Promise = global.Promise
// mongoose.connect('mongodb://vimmus:64l10770@localhost:27017/vimmus?authSource=admin', {
mongoose.connect('mongodb://vimmus01:64l10770@mongo71-farm10.kinghost.net/vimmus01', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Sucesso ao se conectar no Admin")
}).catch((errr) => {
    console.log("Falha ao se conectar no Mongo")
})

//Public para CSS do bootstrap
app.use(express.static(path.join(__dirname, 'public')))

//Função passport para logout
app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
})

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/politica', (req, res) => {
    res.render('politica')
})

app.get('/termo', (req, res) => {
    res.render('termo')
})

//Direcionando para página principal
app.get('/dashboard', ehAdmin, (req, res) => {
    console.log('entrou mongo admin')
    const { _id } = req.user
    const { user } = req.user
    const { ehAdmin } = req.user
    const { nome } = req.user
    const { owner } = req.user
    const { pessoa } = req.user
    const { funges } = req.user
    var id
    var sql = []

    //console.log('ehAdmin=>'+ehAdmin)
    //console.log('user=>'+user)
    //console.log('pessoa=>'+pessoa)

    if (naoVazio(user)) {
        id = user
        sql = { user: id, responsavel: pessoa }
    } else {
        id = _id
        sql = { user: id }
    }

    //console.log('id=>'+id)
    //console.log('sql=>'+JSON.stringify(sql))

    var hoje = dataHoje()
    var data1 = 0
    var data2 = 0
    var days = 0
    var dif = 0
    var ano = hoje.substring(0, 4)
    var nome_lista

    var numprj = 0

    //console.log(id)
    var q = 0
    var listaOrcado = []
    var listaAberto = []
    var listaEncerrado = []
    var notpro = []
    var atrasado = []
    var deadlineIns = []
    var status = ''
    var dtcadastro = ''
    var dtvalidade = ''
    var qtdorcado = 0
    var qtdaberto = 0
    var qtdencerrado = 0
    var qtdbaixado = 0

    var qtdfim = 0
    var qtdpos = 0
    var qtdfat = 0
    var qtdalx = 0
    var qtdass = 0
    var qtdequ = 0
    var qtdpcl = 0
    var qtdtrt = 0
    var qtdnot = 0
    var qtdped = 0
    var qtdvis = 0
    var qtdpro = 0
    var saudacao
    var responsavel

    if (ehAdmin == 0) {
        ehMaster = true
    } else {
        ehMaster = false
    }

    var data = new Date()
    var hora = data.getHours()

    if (hora >= 18 && hora <= 24) {
        saudacao = 'Boa Noite '
    }
    if (hora >= 12 && hora < 18) {
        saudacao = 'Boa tarde '
    }
    if (hora >= 0 && hora < 12) {
        saudacao = 'Bom dia '
    }

    Usuario.findOne({ _id: id }).then((user_ativo) => {
        var esta_pessoa = pessoa
        if (user_ativo.crm == true) {
            Proposta.find(sql).sort({ data: 'asc' }).then((todasPropostas) => {
                if (naoVazio(todasPropostas)) {
                    todasPropostas.forEach((e) => {
                        if (funges == 1 || ehAdmin == 0) {
                            Cliente.findOne({ _id: e.cliente }).then((cliente) => {
                                //console.log('e._id=>'+e._id)
                                Documento.findOne({ proposta: e._id }).then((documento) => {
                                    //console.log('documento=>'+documento)
                                    Compra.findOne({ proposta: e._id }).then((compra) => {
                                        Vistoria.findOne({ proposta: e._id }).then((vistoria) => {
                                            Equipe.findOne({ _id: e.equipe }).then((equipe) => {
                                                Posvenda.findOne({ proposta: e._id }).then((posvenda) => {
                                                    Pessoa.findOne({ _id: e.responsavel }).then((pessoa_res) => {
                                                        if (naoVazio(e.dtcadastro6)) {
                                                            dtcadastro = e.dtcadastro6
                                                            dtvalidade = e.dtvalidade6
                                                        } else {
                                                            if (naoVazio(e.dtcadastro5)) {
                                                                dtcadastro = e.dtcadastro5
                                                                dtvalidade = e.dtvalidade5
                                                            } else {
                                                                if (naoVazio(e.dtcadastro4)) {
                                                                    dtcadastro = e.dtcadastro4
                                                                    dtvalidade = e.dtvalidade4
                                                                } else {
                                                                    if (naoVazio(e.dtcadastro3)) {
                                                                        dtcadastro = e.dtcadastro3
                                                                        dtvalidade = e.dtvalidade3
                                                                    } else {
                                                                        if (naoVazio(e.dtcadastro2)) {
                                                                            dtcadastro = e.dtcadastro2
                                                                            dtvalidade = e.dtvalidade2
                                                                        } else {
                                                                            if (naoVazio(e.dtcadastro1)) {
                                                                                dtcadastro = e.dtcadastro1
                                                                                dtvalidade = e.dtvalidade1
                                                                            } else {
                                                                                dtcadastro = '0000-00-00'
                                                                                dtvalidade = '0000-00-00'
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        // //console.log('dtcadastro=>'+dtcadastro)
                                                        // //console.log('dtvalidade=>'+dtvalidade)
                                                        if (pessoa_res != null) {
                                                            responsavel = pessoa_res.nome
                                                        } else {
                                                            responsavel = ''
                                                        }
                                                        // //console.log('responsavel=>'+responsavel)
                                                        // //console.log('e.seq=>'+e.seq)
                                                        // //console.log('cliente.nome=>'+ cliente.nome)
                                                        // //console.log('cliente.celular=>'+ cliente.celular)
                                                        // //console.log('cliente.email=>'+ cliente.email)
                                                        // //console.log('e.ganho=>'+ e.ganho)
                                                        // //console.log('posvenda.feito=>'+ posvenda.feito)
                                                        // //console.log('documento.feitofaturado>'+ documento.feitofaturado)
                                                        // //console.log('documento.feitoalmox>'+ documento.feitoalmox)
                                                        // //console.log('documento.enviaalmox>'+ documento.enviaalmox)
                                                        // //console.log('equipe.feito=>'+ equipe.feito)
                                                        // //console.log('documento.protcolado>'+ documento.protocolado)
                                                        // //console.log('documento.feitotrt>'+ documento.feitotrt)
                                                        // //console.log('compra.feitonota=>'+ compra.feitonota)
                                                        // //console.log('compra.feitopedido=>'+ compra.feitopedido)
                                                        // //console.log('e.assinado=>'+ e.assinado)
                                                        // //console.log('vistoria.feito=>'+ vistoria.feito)

                                                        if (e.ganho == true) {
                                                            if (e.encerrado == true) {
                                                                status = 'Encerrado'
                                                                qtdfim++
                                                                qtdencerrado++
                                                                listaEncerrado.push({ proposta: e.seq, status, id: e._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                                            } else {
                                                                if (posvenda.feito == true) {
                                                                    status = 'Pós-Venda'
                                                                    qtdpos++
                                                                    qtdaberto++
                                                                    listaAberto.push({ proposta: e.seq, status, id: e._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                                                } else {
                                                                    if (documento.feitofaturado == true) {
                                                                        status = 'Faturado'
                                                                        qtdfat++
                                                                        qtdaberto++
                                                                        listaAberto.push({ proposta: e.seq, status, id: e._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                                                    } else {
                                                                        if (documento.feitoalmox == true) {
                                                                            status = 'Almoxarifado Fechado'
                                                                            qtdaberto++
                                                                            listaAberto.push({ proposta: e.seq, status, id: e._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                                                        } else {
                                                                            if (documento.enviaalmox == true) {
                                                                                status = 'Almoxarifado Em Aberto'
                                                                                qtdaberto++
                                                                                listaAberto.push({ proposta: e.seq, status, id: e._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                                                            } else {
                                                                                if (equipe.feito == true) {
                                                                                    status = 'Execução a Campo'
                                                                                    qtdequ++
                                                                                    qtdaberto++
                                                                                    listaAberto.push({ proposta: e.seq, status, id: e._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                                                                } else {
                                                                                    if (documento.protocolado == true) {
                                                                                        status = 'Protocolado'
                                                                                        qtdpcl++
                                                                                        qtdaberto++
                                                                                        listaAberto.push({ proposta: e.seq, status, id: e._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                                                                    } else {
                                                                                        if (documento.feitotrt == true) {
                                                                                            status = 'TRT'
                                                                                            qtdtrt++
                                                                                            qtdaberto++
                                                                                            listaAberto.push({ proposta: e.seq, status, id: e._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                                                                        } else {
                                                                                            if (compra.feitonota == true) {
                                                                                                status = 'NF'
                                                                                                qtdnot++
                                                                                                qtdaberto++
                                                                                                listaAberto.push({ proposta: e.seq, status, id: e._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                                                                            } else {
                                                                                                if (compra.feitopedido == true) {
                                                                                                    status = 'Pedido'
                                                                                                    qtdped++
                                                                                                    qtdaberto++
                                                                                                    listaAberto.push({ proposta: e.seq, status, id: e._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                                                                                } else {
                                                                                                    if (e.assinado == true) {
                                                                                                        status = 'Assinado'
                                                                                                        qtdass++
                                                                                                        qtdaberto++
                                                                                                        listaAberto.push({ proposta: e.seq, status, id: e._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                                                                                    } else {
                                                                                                        if (vistoria.feito == true) {
                                                                                                            status = 'Visita'
                                                                                                            qtdvis++
                                                                                                            qtdaberto++
                                                                                                            listaAberto.push({ proposta: e.seq, status, id: e._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                                                                                        } else {
                                                                                                            status = 'Preparado para a Visita'
                                                                                                            qtdpro++
                                                                                                            qtdaberto++
                                                                                                            listaAberto.push({ proposta: e.seq, status, id: e._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
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
                                                            //console.log('proposta enviada')
                                                            if (e.baixada == false) {
                                                                status = 'Proposta Enviada'
                                                                qtdpro++
                                                                qtdorcado++
                                                                listaOrcado.push({ proposta: e.seq, saudacao, status, id: e._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade) })
                                                            } else {
                                                                qtdbaixado++
                                                            }
                                                        }

                                                        // //console.log('e.ganho=>'+e.ganho)
                                                        // //console.log('e.baixada=>'+e.baixada)
                                                        // //console.log('dtvalidade=>'+dtvalidade)
                                                        if (e.ganho == false && e.baixada == false) {
                                                            if (dtvalidade != '0000-00-00') {
                                                                data1 = new Date(dtvalidade)
                                                                data2 = new Date(hoje)
                                                                dif = Math.abs(data1.getTime() - data2.getTime())
                                                                days = Math.ceil(dif / (1000 * 60 * 60 * 24))
                                                                if (data1.getTime() < data2.getTime()) {
                                                                    days = days * -1
                                                                }
                                                                //console.log('days=>'+days)
                                                                if (days == 1 || days == 0) {
                                                                    notpro.push({ id: e._id, proposta: e.seq, status: e.status, cliente: cliente.nome, telefone: cliente.celular, cadastro: dataMensagem(dtcadastro), validade: dataMensagem(dtvalidade) })
                                                                } else {
                                                                    if (days < 0) {
                                                                        atrasado.push({ id: e._id, proposta: e.seq, status: e.status, cliente: cliente.nome, telefone: cliente.celular, cadastro: dataMensagem(dtcadastro), validade: dataMensagem(dtvalidade) })
                                                                    }
                                                                }
                                                            }
                                                        } else {
                                                            //console.log('deadline')
                                                            if (e.ganho == true && e.encerrado == false) {
                                                                var dtassinatura
                                                                //console.log('documento.dtassinatura=>'+documento.dtassinatura)
                                                                if (naoVazio(documento.dtassinatura)) {
                                                                    dtassinatura = documento.dtassinatura
                                                                } else {
                                                                    dtassinatura = '0000-00-00'
                                                                }

                                                                //console.log('dtassinatura=>' + dtassinatura)
                                                                data2 = new Date(equipe.dtfim)
                                                                data1 = new Date(hoje)
                                                                //console.log('data1=>' + data1)
                                                                //console.log('data2=>' + data2)
                                                                dif = Math.abs(data2.getTime() - data1.getTime())
                                                                //console.log('dif=>'+dif)
                                                                days = Math.ceil(dif / (1000 * 60 * 60 * 24))
                                                                //console.log('days=>'+days)
                                                                //console.log('equipe.dtinicio=>'+equipe.dtinicio)
                                                                //console.log('equipe.dtfim=>'+equipe.dtfim)
                                                                if (days < 30) {
                                                                    deadlineIns.push({ id: e._id, proposta: e.seq, cliente: cliente.nome, cadastro: dataMensagem(dtcadastro), inicio: dataMensagem(equipe.dtinicio), dliins: dataMensagem(equipe.dtfim) })
                                                                }
                                                            }
                                                        }


                                                        q++
                                                        //console.log('q=>'+q)
                                                        //console.log('todasPropostas.length=>'+todasPropostas.length)
                                                        if (q == todasPropostas.length) {
                                                            numprj = todasPropostas.length
                                                            //console.log('pessoa=>'+pessoa)
                                                            if (typeof pessoa == 'undefined') {
                                                                esta_pessoa = '111111111111111111111111'
                                                            }
                                                            //console.log('esta_pessoa=>'+esta_pessoa)
                                                            Pessoa.findOne({ _id: esta_pessoa }).lean().then((nome_pessoa) => {
                                                                if (naoVazio(nome_pessoa)) {
                                                                    nome_lista = nome_pessoa.nome
                                                                } else {
                                                                    nome_lista = nome
                                                                }
                                                                //console.log(notpro)
                                                                res.render('dashboard', { crm: true, id: _id, owner: owner, saudacao, nome_lista, listaAberto, listaOrcado, listaEncerrado, ehMaster, numprj, qtdpro, qtdvis, qtdass, qtdped, qtdnot, qtdtrt, qtdpcl, qtdequ, qtdfim, qtdpos, qtdaberto, qtdencerrado, qtdorcado, qtdbaixado, notpro, atrasado, deadlineIns })
                                                            }).catch((err) => {
                                                                req.flash('error_msg', 'Houve um erro ao encontrar o nome do usuário.')
                                                                res.redirect('/')
                                                            })
                                                        }
                                                    }).catch((err) => {
                                                        req.flash('error_msg', 'Houve um erro ao encontrar as pessoas<2>.')
                                                        res.redirect('/')
                                                    })
                                                }).catch((err) => {
                                                    req.flash('error_msg', 'Houve um erro ao encontrar o pós venda.')
                                                    res.redirect('/')
                                                })
                                            }).catch((err) => {
                                                req.flash('error_msg', 'Houve um erro ao encontrar a equipe.')
                                                res.redirect('/')
                                            })
                                        }).catch((err) => {
                                            req.flash('error_msg', 'Houve um erro ao encontrar a vistoria.')
                                            res.redirect('/')
                                        })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Houve um erro ao encontrar a compra.')
                                        res.redirect('/')
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Houve um erro ao encontrar o documento.')
                                    res.redirect('/')
                                })
                            }).catch((err) => {
                                req.flash('error_msg', 'Houve um erro ao encontrar os clientes.')
                                res.redirect('/')
                            })
                        } else {
                            Equipe.findOne({ _id: e.equipe }).then((equipe) => {
                                Pessoa.findOne({ _id: pessoa }).then((usuario) => {
                                    //console.log('pessoa=>' + pessoa)
                                    //console.log('usuario.nome=>' + usuario.nome)
                                    //console.log('equipe.ins0=>' + equipe.ins0)
                                    //console.log('equipe.ins1=>' + equipe.ins1)
                                    //console.log('equipe.ins2=>' + equipe.ins2)
                                    //console.log('equipe.ins3=>' + equipe.ins3)
                                    //console.log('equipe.ins4=>' + equipe.ins4)
                                    //console.log('equipe.ins5=>' + equipe.ins5)
                                    instalador = ''
                                    if (equipe.ins0 == usuario.nome) {
                                        instalador = equipe.ins0
                                    }
                                    if (equipe.ins1 == usuario.nome) {
                                        instalador = equipe.ins1
                                    }
                                    if (equipe.ins2 == usuario.nome) {
                                        instalador = equipe.ins2
                                    }
                                    if (equipe.ins3 == usuario.nome) {
                                        instalador = equipe.ins3
                                    }
                                    if (equipe.ins4 == usuario.nome) {
                                        instalador = equipe.ins4
                                    }
                                    if (equipe.ins5 == usuario.nome) {
                                        instalador = equipe.ins5
                                    }
                                    //console.log('instalador=>' + instalador)
                                    if (instalador != '') {
                                        numprj++

                                        Cliente.findOne({ _id: e.cliente }).then((cliente) => {
                                            Documento.findOne({ proposta: e._id }).then((documento) => {
                                                Compra.findOne({ proposta: e._id }).then((compra) => {
                                                    Vistoria.findOne({ proposta: e._id }).then((vistoria) => {
                                                        Equipe.findOne({ _id: e.equipe }).then((equipe) => {
                                                            Posvenda.findOne({ proposta: e._id }).then((posvenda) => {
                                                                Pessoa.findOne({ _id: e.responsavel }).then((pessoa_res) => {
                                                                    //console.log('entrou')
                                                                    if (naoVazio(e.dtcadastro6)) {
                                                                        dtcadastro = e.dtcadastro6
                                                                        dtvalidade = e.dtvalidade6
                                                                    } else {
                                                                        if (naoVazio(e.dtcadastro5)) {
                                                                            dtcadastro = e.dtcadastro5
                                                                            dtvalidade = e.dtvalidade5
                                                                        } else {
                                                                            if (naoVazio(e.dtcadastro4)) {
                                                                                dtcadastro = e.dtcadastro4
                                                                                dtvalidade = e.dtvalidade4
                                                                            } else {
                                                                                if (naoVazio(e.dtcadastro3)) {
                                                                                    dtcadastro = e.dtcadastro3
                                                                                    dtvalidade = e.dtvalidade3
                                                                                } else {
                                                                                    if (naoVazio(e.dtcadastro2)) {
                                                                                        dtcadastro = e.dtcadastro2
                                                                                        dtvalidade = e.dtvalidade2
                                                                                    } else {
                                                                                        if (naoVazio(e.dtcadastro1)) {
                                                                                            dtcadastro = e.dtcadastro1
                                                                                            dtvalidade = e.dtvalidade1
                                                                                        } else {
                                                                                            dtcadastro = '0000-00-00'
                                                                                            dtvalidade = '0000-00-00'
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }


                                                                    if (pessoa_res != null) {
                                                                        responsavel = pessoa_res.nome
                                                                    } else {
                                                                        responsavel = ''
                                                                    }
                                                                    if (e.ganho == true) {
                                                                        if (e.encerrado == true) {
                                                                            status = 'Encerrado'
                                                                            qtdfim++
                                                                            qtdencerrado++
                                                                            listaEncerrado.push({ status, id: e._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade), block: true })
                                                                        } else {
                                                                            if (posvenda.feito == true) {
                                                                                status = 'Pós-Venda'
                                                                                qtdpos++
                                                                                qtdaberto++
                                                                                listaAberto.push({ status, id: e._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade), block: true })
                                                                            } else {
                                                                                if (documento.feitofaturado == true) {
                                                                                    status = 'Faturado'
                                                                                    qtdfat++
                                                                                    qtdaberto++
                                                                                    listaAberto.push({ status, id: e._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade), block: true })
                                                                                } else {
                                                                                    if (documento.feitofaturado == true) {
                                                                                        status = 'Almoxarifado Fechado'
                                                                                        qtdalx++
                                                                                        qtdaberto++
                                                                                        listaAberto.push({ status, id: e._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade), block: true })
                                                                                    } else {
                                                                                        if (documento.feitofaturado == true) {
                                                                                            status = 'Almoxarifado em Aberto'
                                                                                            qtdenv++
                                                                                            qtdaberto++
                                                                                            listaAberto.push({ status, id: e._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade), block: true })
                                                                                        } else {
                                                                                            if (equipe.feito == true) {
                                                                                                status = 'Execução a Campo'
                                                                                                qtdequ++
                                                                                                qtdaberto++
                                                                                                listaAberto.push({ status, id: e._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade), block: true })
                                                                                            } else {
                                                                                                if (documento.protocolado == true) {
                                                                                                    status = 'Protocolado'
                                                                                                    qtdpcl++
                                                                                                    qtdaberto++
                                                                                                    listaAberto.push({ status, id: e._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade), block: true })
                                                                                                } else {
                                                                                                    if (documento.feitotrt == true) {
                                                                                                        status = 'TRT'
                                                                                                        qtdtrt++
                                                                                                        qtdaberto++
                                                                                                        listaAberto.push({ status, id: e._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade), block: true })
                                                                                                    } else {
                                                                                                        if (compra.feitonota == true) {
                                                                                                            status = 'NF'
                                                                                                            qtdnot++
                                                                                                            qtdaberto++
                                                                                                            listaAberto.push({ status, id: e._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade), block: true })
                                                                                                        } else {
                                                                                                            if (compra.feitopedido == true) {
                                                                                                                status = 'Pedido'
                                                                                                                qtdped++
                                                                                                                qtdaberto++
                                                                                                                listaAberto.push({ status, id: e._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade), block: true })
                                                                                                            } else {
                                                                                                                if (e.assinado == true) {
                                                                                                                    status = 'Assinado'
                                                                                                                    qtdass++
                                                                                                                    qtdaberto++
                                                                                                                    listaAberto.push({ status, id: e._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade), block: true })
                                                                                                                } else {
                                                                                                                    if (vistoria.feito == true) {
                                                                                                                        status = 'Visita'
                                                                                                                        qtdvis++
                                                                                                                        qtdaberto++
                                                                                                                        listaAberto.push({ status, id: e._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade), block: true })
                                                                                                                    } else {
                                                                                                                        status = 'Preparado para a Visita'
                                                                                                                        qtdpro++
                                                                                                                        qtdorcado++
                                                                                                                        listaAberto.push({ status, id: e._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade), block: true })
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
                                                                            qtdpro++
                                                                            qtdorcado++
                                                                            listaOrcado.push({ status, saudacao, id: e._id, cliente: cliente.nome, email: cliente.email, telefone: cliente.celular, responsavel, dtcadastro: dataMensagem(dtcadastro), dtvalidade: dataMensagem(dtvalidade), block: true })
                                                                        } else {
                                                                            qtdbaixado++
                                                                        }
                                                                    }

                                                                    q++

                                                                    if (q == todasPropostas.length) {
                                                                        //console.log(listaAberto)
                                                                        numprj = numprj
                                                                        Pessoa.findOne({ _id: pessoa }).lean().then((nome_pessoa) => {
                                                                            res.render('dashboard', { user: true, id: _id, owner: owner, saucadacao, listaOrcado, listaAberto, listaEncerrado, ehMaster, numprj, qtdpro, qtdvis, qtdass, qtdped, qtdnot, qtdtrt, qtdpcl, qtdequ, qtdfim, qtdpos, qtdorcado, qtdaberto, qtdencerrado, qtdbaixado, block: true })
                                                                        })
                                                                    }
                                                                })
                                                            })
                                                        })
                                                    })
                                                })
                                            })
                                        })

                                    }
                                })
                            })
                        }
                    })
                } else {
                    if (typeof pessoa == 'undefined') {
                        esta_pessoa = '111111111111111111111111'
                    }
                    Pessoa.findOne({ _id: pessoa }).lean().then((nome_pessoa) => {
                        //console.log('nome_pessoa=>' + nome_pessoa)
                        if (naoVazio(nome_pessoa)) {
                            nome_lista = nome_pessoa.nome
                        } else {
                            nome_lista = nome
                        }
                        res.render('dashboard', { crm: true, id: _id, owner: owner, saudacao, nome_lista })
                    })
                }
            }).catch((err) => {
                if (typeof pessoa == 'undefined') {
                    esta_pessoa = '111111111111111111111111'
                }
                Pessoa.findOne({ _id: pessoa }).lean().then((nome_pessoa) => {
                    if (naoVazio(nome_pessoa)) {
                        nome_lista = nome_pessoa.nome
                    } else {
                        nome_lista = nome
                    }
                    res.render('dashboard', { crm: true, id: _id, owner: owner, saudacao, nome_lista })
                })
            })
        } else {
            var lista_tarefas = []
            var qtdexec = 0
            var qtdagua = 0
            var qtdreal = 0
            var qtdpara = 0
            var asc = 'unchecked'
            var desc = 'checked'
            var ordem = -1
            var numtrf = 0
            Empresa.find({ user: id }).lean().then((todas_empresas) => {
                Tarefa.find({ user: id }).sort({ buscadataini: ordem, parado: -1, liberar: -1 }).then((tarefas) => {
                    // console.log('tarefas=>' + tarefas)
                    if (naoVazio(tarefas)) {
                        tarefas.forEach((e) => {
                            // console.log('e.servico=>'+e._id)
                            // console.log('e.servico=>'+e.servico)
                            Servico.findOne({ _id: e.servico }).then((servico) => {
                                Equipe.findOne({ tarefa: e._id }).then((equipe) => {
                                    if (equipe.prjfeito == false && equipe.parado == false && equipe.liberar == false) {
                                        qtdagua++
                                    } else {
                                        if (equipe.prjfeito == false && equipe.parado == false && equipe.liberar == true) {
                                            qtdexec++
                                        } else {
                                            if (equipe.prjfeito == false && equipe.parado == true && equipe.liberar == true) {
                                                qtdpara++
                                            } else {
                                                if (equipe.prjfeito == true && equipe.parado == false && equipe.liberar == true) {
                                                    qtdreal++
                                                }
                                            }
                                        }
                                    }
                                    Cliente.findOne({ _id: e.cliente }).then((cliente) => {
                                        Pessoa.findOne({ _id: e.responsavel }).then((pessoa_res) => {
                                            lista_tarefas.push({ id: e._id, seq: e.seq, liberado: equipe.liberar, feito: e.concluido, nome_res: pessoa_res.nome, nome_cli: cliente.nome, servico: servico.descricao, id_equipe: equipe._id, dtini: dataMensagem(equipe.dtinicio), dtfim: dataMensagem(equipe.dtfim)})
                                            q++
                                            if (q == tarefas.length) {
                                                // console.log('lista_tarefas=>'+JSON.stringify(lista_tarefas))
                                                // console.log('entrou lista tarefas')
                                                numtrf = tarefas.length
                                                Cliente.find({ user: id }).lean().then((todos_clientes) => {
                                                    //console.log('todos_clientes=>' + todos_clientes)
                                                    Pessoa.findOne({ _id: esta_pessoa }).lean().then((nome_pessoa) => {
                                                        // console.log('nome_pessoa=>' + nome_pessoa)
                                                        if (naoVazio(nome_pessoa)) {
                                                            nome_lista = nome_pessoa.nome
                                                        } else {
                                                            nome_lista = nome
                                                        }
                                                        res.render('dashboard', { id: _id, ano, numtrf, qtdagua, qtdexec, qtdpara, qtdreal, crm: false, lista_tarefas, nome_lista, saudacao, todos_clientes, asc, desc, ordem, todas_empresas, busca: true })
                                                    }).catch((err) => {
                                                        req.flash("error_msg", "Ocorreu uma falha interna para encontrar esta pessoa<s>.")
                                                        res.redirect("/dashboard")
                                                    })
                                                }).catch((err) => {
                                                    req.flash("error_msg", "Ocorreu uma falha interna para encontrar os clientes<s>.")
                                                    res.redirect("/dashboard")
                                                })
                                            }
                                        }).catch((err) => {
                                            req.flash("error_msg", "Ocorreu uma falha interna para encontrar a pessoa responsável<s>.")
                                            res.redirect("/dashboard")
                                        })
                                    }).catch((err) => {
                                        req.flash("error_msg", "Ocorreu uma falha interna para encontrar o cliente<s>.")
                                        res.redirect("/dashboard")
                                    })
                                }).catch((err) => {
                                    req.flash("error_msg", "Ocorreu uma falha interna para encontrar a equipe<s>.")
                                    res.redirect("/dashboard")
                                })
                            }).catch((err) => {
                                req.flash("error_msg", "Ocorreu uma falha interna para encontrar o serviço<s>.")
                                res.redirect("/dashboard")
                            })
                        })
                    } else {
                        if (typeof pessoa == 'undefined') {
                            esta_pessoa = '111111111111111111111111'
                        }
                        Cliente.find({ user: id }).lean().then((todos_clientes) => {
                            Pessoa.findOne({ _id: pessoa }).lean().then((nome_pessoa) => {
                                if (naoVazio(nome_pessoa)) {
                                    nome_lista = nome_pessoa.nome
                                } else {
                                    nome_lista = nome
                                }
                                res.render('dashboard', { ano, crm: false, id: _id, owner: owner, saudacao, nome_lista, asc, desc, ordem, todas_empresas, todos_clientes, busca: true })
                            })
                        }).catch((err) => {
                            req.flash("error_msg", "Ocorreu uma falha interna para encontrar os clientes<s>.")
                            res.redirect("/")
                        })
                    }
                }).catch((err) => {
                    req.flash('error_msg', 'Não foi possível encontrar a tarefa.')
                    res.redirect('/')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Não foi possível encontrar as empresa.')
                res.redirect('/')
            })
        }
    })
})

//Rotas
app.use('/customdo', customdo)
app.use('/configuracao', configuracao)
app.use('/projeto', projeto)
app.use('/gerenciamento', gerenciamento)
app.use('/pessoa', pessoa)
app.use('/cliente', cliente)
app.use('/usuario', usuario)
app.use('/administrador', administrador)
app.use('/relatorios/', relatorios)
app.use('/componente/', componente)
app.use('/fornecedor/', fornecedor)

//Outros

const APP_PORT = process.env.APP_PORT || 3000

app.listen(APP_PORT, () => {
    console.log(`Running admin at port:${APP_PORT}`)
})