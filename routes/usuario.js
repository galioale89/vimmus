const express = require('express')
const router = express.Router()

require('../model/Usuario')
require('../model/Pessoa')
require('../model/Acesso')

const mongoose = require('mongoose')
const Usuario = mongoose.model('usuario')
const Pessoa = mongoose.model('pessoa')
const Acesso = mongoose.model('acesso')

const nodemailer = require('nodemailer')
const bcrypt = require("bcryptjs")
const passport = require("passport")

//Configurando envio de e-mail
const transporter = nodemailer.createTransport({ // Configura os parâmetros de conexão com servidor.
    host: 'smtp.umbler.com',
    port: 587,
    secure: false,
    auth: {
        user: 'alexandre@vimmus.com.br',
        pass: '3rdn4x3L@'
    },
    tls: {
        rejectUnauthorized: false
    }
})

router.use(express.static('imagens'))
router.use(express.static('imagens/upload'))
const { ehAdmin } = require('../helpers/ehAdmin')

router.get('/novousuario', ehAdmin, (req, res) => {
    const { owner } = req.user
    res.render('usuario/novousuario', { owner })
})

router.get('/novousuario/:id', ehAdmin, (req, res) => {
    const { owner } = req.user
    Pessoa.findOne({ _id: req.params.id }).then((pessoa => {
        res.render('usuario/novousuario', { id: req.params.id, email: pessoa.email, nome: pessoa.nome, celular: pessoa.celular, owner })
    }))

})

router.get('/editar/:id', ehAdmin, (req, res) => {
    const { ehAdmin } = req.user
    Acesso.findOne({ _id: req.params.id }).lean().then((acesso) => {
        //console.log(acesso)
        if (acesso == null) {
            //console.log('usuario')
            Usuario.findOne({ _id: req.params.id }).lean().then((usuario) => {
                if (ehAdmin == 0) {
                    ehUserMaster = true
                } else {
                    ehUserMaster = false
                }
                res.render('usuario/editregistro', { usuario, ehUserMaster })
            })
        } else {
            //console.log('acesso')
            if (ehAdmin == 0) {
                ehUserMaster = true
            } else {
                ehUserMaster = false
            }
            res.render('usuario/editregistro', { usuario: acesso, ehUserMaster })
        }
    })
})

router.get('/registrar/:plano', (req, res) => {
    var tipoPlano
    var tipoTodos
    //console.log('plano=>' + req.params.plano)
    if (req.params.plano == 'planoPago') {
        tipoPlano = true
    } else {
        tipoPlano = false
    }
    if (req.params.plano == 'todos') {
        tipoTodos = true
    } else {
        tipoTodos = false
    }
    res.render('usuario/registro', { tipoPlano, tipoTodos })
})

router.post('/enviar', (req, res) => {
    const { _id } = req.user
    var email = req.body.email
    var email_mais = ''
    var nome = ''
    var usuario = ''
    var funges = ''
    var texto = ''
    var senha = ''
    var data = ''
    var ano = ''
    var mes = ''
    var dia = ''
    var comp = ''
    var erros = []

    console.log('id=>' + req.body.id)

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == true) {
        erros.push({ texto: "É necessário cadastrar o nome." })
    }
    if (!req.body.celular || typeof req.body.celular == undefined || req.body.celular == true) {
        erros.push({ texto: "É necessário cadastrar um número de celular." })
    }
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == true) {
        erros.push({ texto: "É necessário cadastrar um e-mail." })
    }

    if (req.body.pgto == '1') {

        if ((req.body.senha != '' && req.body.senharep == '') || (req.body.senha == '' && req.body.senharep != '')) {
            if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == true) {
                erros.push({ texto: "Senha Inválida" })
            }
            if (validaSenha.length < 5) {
                erros.push({ texto: "A senha deve ter ao menos 6 caracteres." })
            }

            if (req.body.senha != req.body.senharep) {
                erros.push({ texto: "Senhas diferentes. Verificar." })
            }
        }
    }

    if (erros.length > 0) {
        res.render('index', { erros })
    } else {
        email_mais = req.body.email + ', solucoes@vimmus.com.br'

        console.log('req.body.id=>'+req.body.id)

        if (req.body.id != '') {
            Pessoa.findOne({ _id: req.body.id }).then((pessoa) => {

                if (pessoa.funges == 'checked') {
                    funges = true
                } else {
                    funges = false
                }

                Acesso.find({ pessoa: req.body.id }).then((user_acesso) => {

                    console.log('user_acesso=>' + user_acesso.length)

                    if (user_acesso.length == 0) {

                        //Criar usuário para a pessoa
                        nome = req.body.nome
                        nome = nome.toLowerCase()
                        usuario = nome.split(' ')                                            
                        if (usuario[0].length == 0) {
                            usuario = nome
                        } else {
                            usuario = usuario[0]
                        }

                        comp = Math.floor(Math.random() * (999 - 1)) + 1
                        usuario = usuario + comp
                        senha = Math.floor(Math.random() * (999999 - 111111)) + 111111

                        texto = 'Olá ' + req.body.nome + ',' + '\n' + '\n' +
                            'Aqui está seu usuário e senha de acesso ao sistema da VIMMUS.' + '\n' +
                            'Usuário: ' + usuario + '\n' +
                            'Senha: ' + senha + '\n' +
                            'Agora você poderá gerenciar os processos de seus projetos de forma efetiva.' + '\n' + '\n' +
                            'Fique a vontade para alterar o nome de usuário (de acordo com a disponibilidade) e sua senha.' + '\n' +
                            'Lembre-se que ao realizar o login você concorda com o termo de usuário e a política de privacidade.' + '\n' + '\n' +
                            'Estamos a disposição para te ajudar com qualquer dúvida no e-mail solucoes@vimmus.com.br.' + '\n' + '\n' +
                            'Vamos te responder o mais rápido possível.' + '\n' + '\n' +
                            'Atenciosamente,' + '\n' + '\n' +
                            'Alexandre Galiotto' + '\n' +
                            'Tel.: (49) 99183-2978' + '\n' +
                            'Vimmus'

                        //Parâmetros do E-mail
                        const mailOptions = { // Define informações pertinentes ao E-mail que será enviado
                            from: '"VIMMUS Soluções" <alexandre@vimmus.com.br>',
                            to: email_mais,
                            subject: 'Solicitação de Senha',
                            //text: 'Nome: ' + req.body.nome + ';' + 'Celular: ' + req.body.celular + ';' + 'E-mail: '+ req.body.email
                            text: texto
                        }
                        //console.log('novo usuário')
                        data = new Date()
                        ano = data.getFullYear()
                        mes = parseFloat(data.getMonth()) + 1
                        dia = data.getDate()

                        console.log('usuario=>' + usuario)
                        console.log('senha=>' + senha)
                        const novoUsuario = new Acesso({
                            user: _id,
                            pessoa: req.body.id,
                            usuario: usuario,
                            senha: senha,
                            funges: funges,
                            data: ano + '-' + mes + '-' + dia
                        })
                        bcrypt.genSalt(10, (erro, salt) => {
                            bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                                if (erro) {
                                    req.flash("error_msg", "Houve um erro durante o salvamento do usuário")
                                    res.redirect("/pessoa/edicao/" + req.body.id)
                                }

                                novoUsuario.senha = hash

                                novoUsuario.save().then(() => {
                                    req.flash("success_msg", req.body.nome + ', sua senha será enviada por e-mail para: ' + req.body.email + ', e sua confirmação de acesso será feita em até 24 horas. Não esqueça de verificar suar caixa de spam!')
                                    //Enviando e-mail
                                    transporter.sendMail(mailOptions, (err, info) => { // Função que, efetivamente, envia o email.
                                        if (err) {
                                            return //console.log(err)
                                        }
                                        //console.log(info)
                                    })
                                    res.redirect("/pessoa/edicao/" + req.body.id)
                                }).catch((err) => {
                                    req.flash("error_msg", "Ocorreu uma falha interna")
                                    res.redirect("/pessoa/edicao/" + req.body.id)
                                })
                            })
                        })


                    } else {
                        req.flash('error_msg', 'Pessoa já possui um usuário criado.')
                        res.redirect("/pessoa/edicao/" + req.body.id)
                    }
                }).catch((err) => {
                    req.flash("error_msg", "Ocorreu uma falha interna")
                    res.redirect("/pessoa/edicao/" + req.body.id)
                })
            }).catch((err) => {
                req.flash("error_msg", "Ocorreu uma falha interna")
                res.redirect("/pessoa/edicao/" + req.body.id)
            })

        } else {

            if (req.body.pgto == '0') {
                nome = req.body.nome
                nome = nome.toLowerCase()
                usuario = nome.split(' ')
                if (usuario[0].length == 0) {
                    usuario = nome
                } else {
                    usuario = usuario[0]
                }
            } else {
                nome = req.body.nome
                usuario = req.body.usuario
            }

            //Testando se usuário já está cadastrado
            Usuario.find({ usuario: usuario }).then((user) => {

                if (user.length != 0) {
                    comp = Math.floor(Math.random() * (999 - 1)) + 1;
                    usuario = usuario + comp;
                }

                Usuario.find({ usuario: usuario }).then((user2) => {

                    senha
                    if (req.body.pgto == '0') {
                        senha = Math.floor(Math.random() * (999999 - 111111)) + 111111
                        if (user2.length != 0) {
                            comp = Math.floor(Math.random() * (999 - 1)) + 1
                            usuario = usuario + comp;
                        }
                    } else {
                        senha = req.body.senha
                    }

                    texto = 'Olá ' + req.body.nome + ',' + '\n' + '\n' +
                        'Aqui está seu usuário e senha de acesso ao sistema da VIMMUS.' + '\n' +
                        'Usuário: ' + usuario + '\n' +
                        'Senha: ' + senha + '\n' +
                        'Agora você poderá gerenciar os processos de seus projetos de forma efetiva.' + '\n' + '\n' +
                        'Fique a vontade para alterar o nome de usuário (de acordo com a disponibilidade) e sua senha.' + '\n' +
                        'Lembre-se que ao realizar o login você concorda com o termo de usuário e a política de privacidade.' + '\n' + '\n' +
                        'Estamos a disposição para te ajudar com qualquer dúvida no e-mail solucoes@vimmus.com.br.' + '\n' + '\n' +
                        'Vamos te responder o mais rápido possível.' + '\n' + '\n' +
                        'Atenciosamente,' + '\n' + '\n' +
                        'Alexandre Galiotto' + '\n' +
                        'Tel.: (49) 99183-2978' + '\n' +
                        'Vimmus'

                    //Parâmetros do E-mail
                    const mailOptions = { // Define informações pertinentes ao E-mail que será enviado
                        from: '"VIMMUS Soluções" <alexandre@vimmus.com.br>',
                        to: email_mais,
                        subject: 'Solicitação de Senha',
                        //text: 'Nome: ' + req.body.nome + ';' + 'Celular: ' + req.body.celular + ';' + 'E-mail: '+ req.body.email
                        text: texto
                    }

                    Usuario.findOne({ email: req.body.email }).then((usuario_email) => {
                        if (usuario_email) {
                            req.flash("error_msg", "Já existe uma conta com este e-mail: " + req.body.email + '.')
                            res.redirect("/")
                        } else {
                            //console.log('novo usuário')
                            data = new Date()
                            ano = data.getFullYear()
                            mes = parseFloat(data.getMonth()) + 1
                            dia = data.getDate()

                            var tipoContrato = 0
                            if (req.body.selecionado == 'free') {
                                tipoContrato = 4
                            } else {
                                tipoContrato = 3
                            }

                            if (req.body.pgto == '0') {
                                const novoUsuario = new Usuario({
                                    nome: req.body.nome,
                                    usuario: usuario,
                                    telefone: req.body.celular,
                                    email: email,
                                    ehAdmin: tipoContrato,
                                    senha: senha,
                                    data: ano + '' + mes + '' + dia
                                })
                                bcrypt.genSalt(10, (erro, salt) => {
                                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                                        if (erro) {
                                            req.flash("error_msg", "Houve um erro durante o salvamento do usuário")
                                            res.redirect("/")
                                        }

                                        novoUsuario.senha = hash

                                        novoUsuario.save().then(() => {
                                            req.flash("success_msg", req.body.nome + ', sua senha será enviada por e-mail para: ' + req.body.email + ', e sua confirmação de acesso será feita em até 24 horas. Não esqueça de verificar suar caixa de spam!')
                                            //Enviando e-mail
                                            transporter.sendMail(mailOptions, (err, info) => { // Função que, efetivamente, envia o email.
                                                if (err) {
                                                    return //console.log(err)
                                                }
                                                //console.log(info)
                                            })
                                            res.redirect("/menu")
                                        }).catch((err) => {
                                            req.flash("error_msg", "Ocorreu uma falha interna")
                                            res.redirect("/usuario/novousuario")
                                        })
                                    })
                                })
                            } else {
                                const novoUsuario = new Usuario({
                                    nome: req.body.nome,
                                    razao: req.body.razao,
                                    fantasia: req.body.fantasia,
                                    cnpj: req.body.cnpj,
                                    endereco: req.body.endereco,
                                    uf: req.body.estado,
                                    cidade: req.body.cidade,
                                    telefone: req.body.celular,
                                    usuario: usuario,
                                    email: email,
                                    senha: senha,
                                    ehAdmin: 3,
                                    data: ano + '' + mes + '' + dia,
                                    pgto: req.body.selecionado
                                })
                                bcrypt.genSalt(10, (erro, salt) => {
                                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                                        if (erro) {
                                            req.flash("error_msg", "Houve um erro durante o salvamento do usuário")
                                            res.redirect("/")
                                        }

                                        novoUsuario.senha = hash

                                        novoUsuario.save().then(() => {
                                            req.flash("success_msg", req.body.nome + ', sua senha será enviada por e-mail para: ' + req.body.email + ', e sua confirmação de acesso será feita em até 24 horas. Não esqueça de verificar suar caixa de spam!')
                                            //Enviando e-mail
                                            transporter.sendMail(mailOptions, (err, info) => { // Função que, efetivamente, envia o email.
                                                if (err) {
                                                    return //console.log(err)
                                                }
                                                //console.log(info)
                                            })
                                            res.render('index', { sucesso: 'Obrigado por escolher a Vimmus. Em breve entraremos em contato.' })

                                        }).catch((err) => {
                                            req.flash("error_msg", "Ocorreu uma falha interna")
                                            res.redirect("/usuario/novousuario")
                                        })
                                    })
                                })
                            }
                        }
                    }).catch((err) => {
                        req.flash("error_msg", "Houve um erro ao se registrar.")
                        res.redirect("/")
                    })
                }).catch((err) => {
                    req.flash("error_msg", "Ocorreu uma falha interna.")
                    res.redirect("/usuario/novousuario")
                })
            }).catch((err) => {
                req.flash("error_msg", "Ocorreu uma falha interna.")
                res.redirect("/usuario/novousuario")
            })
        }
    }
})

router.post('/salvacontato', (req, res) => {
    var sucesso = []
    var erros = []
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == true) {
        erros.push({ texto: "É necessário cadastrar o nome." })
    }
    if (!req.body.celular || typeof req.body.celular == undefined || req.body.celular == true) {
        erros.push({ texto: "É necessário cadastrar um número de celular." })
    }
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == true) {
        erros.push({ texto: "É necessário cadastrar um e-mail." })
    }
    if (erros.length > 0) {
        res.render('index', { erros: erros })
    } else {

        var email = req.body.email
        var nome = req.body.nome

        Usuario.findOne({ email: req.body.email }).then((usuario_email) => {
            if (usuario_email) {
                req.flash("aviso_msg", nome + ", em breve entraremos em contato com você.")
                res.redirect("/")
            } else {
                var data = new Date()
                var ano = data.getFullYear()
                var mes = parseFloat(data.getMonth()) + 1
                var dia = data.getDate()

                //console.log('motivo=>' + req.body.motivo)

                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    telefone: req.body.celular,
                    email: email,
                    ehAdmin: 3,
                    data: ano + '' + mes + '' + dia,
                    pricont: req.body.motivo
                })

                novoUsuario.save().then(() => {
                    sucesso.push({ texto: novoUsuario.nome + ', em breve entraremos em contato com você. Não esqueça de verificar sua caixa de spam!' })
                    res.render('index', { sucesso })
                }).catch((err) => {
                    req.flash("error_msg", "Ocorreu uma falha interna")
                    res.redirect("/usuario/registro")
                })
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao se registrar.")
            res.redirect("/")
        })
    }
})
//Autenticando usuario
router.get("/login", (req, res) => {
    res.render("usuario/login")
})

router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/menu",
        failureRedirect: "/usuario/login",
        failureFlash: true
    })(req, res, next)
})

module.exports = router