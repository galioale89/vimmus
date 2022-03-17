const express = require('express')
const app = express()

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
mongoose.connect('mongodb://vimmus:64l10770@localhost:27017/vimmus?authSource=admin', {
//mongoose.connect('mongodb://vimmus01:64l10770@mongo71-farm10.kinghost.net/vimmus01', {
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
    var ano = hoje.substring(0, 4)
    var nome_lista

    //console.log(id)
    var q = 0
    var saudacao

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
        console.log('user_ativo.obra=>'+user_ativo.obra)
        if (user_ativo.obra == true) { 
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
                                            if (!e.concluido){
                                            lista_tarefas.push({ id: e._id, seq: e.seq, liberado: equipe.liberar, feito: e.concluido, nome_res: pessoa_res.nome, nome_cli: cliente.nome, servico: servico.descricao, id_equipe: equipe._id, dtini: dataMensagem(e.dataini), dtfim: dataMensagem(e.datafim)})
                                            }
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
                                                        res.render('dashboard', { id: _id, ehMaster, owner: owner, ano, numtrf, qtdagua, qtdexec, qtdpara, qtdreal, lista_tarefas, nome_lista, saudacao, todos_clientes, asc, desc, ordem, todas_empresas, busca: true })
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
                                res.render('dashboard', { ano, id: _id, ehMaster, owner: owner, saudacao, nome_lista, asc, desc, ordem, todas_empresas, todos_clientes, busca: true })
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
        }else{
            req.flash('aviso_msg','Sua conta não esta habilitada para o acesso')
            res.redirect('/')
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