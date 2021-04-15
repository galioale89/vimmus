const express = require('express')
const router = express.Router()

require('../model/Usuario')
const mongoose = require('mongoose')
const Usuario = mongoose.model('usuario')

const nodemailer = require('nodemailer')
const bcrypt = require("bcryptjs")
const passport = require("passport")

/*
//Configurando envio de SMS
const Vonage = require('@vonage/server-sdk')

const vonage = new Vonage({
  apiKey: "db9a4e8d",
  apiSecret: "JAONfDZDLw5t3Uqh"
})
*/

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

router.get('/editar/:id', ehAdmin, (req, res) => {
    const { ehAdmin } = req.user
    Usuario.findOne({ _id: req.params.id }).lean().then((usuario) => {
        if (ehAdmin == 0) {
            ehUserMaster = true
        } else {
            ehUserMaster = false
        }
        res.render('usuario/editregistro', { usuario: usuario, ehUserMaster: ehUserMaster })
    })
})

router.post('/enviar', (req, res) => {
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
        nome = nome.toLowerCase()

        var usuario = nome.split(' ')
        if (usuario[0].length == 0) {
            usuario = nome
        } else {
            usuario = usuario[0]
        }

        //Testando se usuário já está cadastrado
        Usuario.find({ usuario: usuario }).then((user) => {
            if (user.length != 0) {
                var comp = Math.floor(Math.random() * (999 - 1)) + 1;
                usuario = usuario + comp;
            }

            Usuario.find({ usuario: usuario }).then((user2) => {
                if (user2.length != 0) {
                    var comp = Math.floor(Math.random() * (999 - 1)) + 1;
                    usuario = usuario + comp;
                }

                var senha = Math.floor(Math.random() * (999999 - 111111)) + 111111;

                var texto = 'Olá ' + req.body.nome + ',' + '\n' + '\n' + 
                    'Aqui está seu usuário e senha para acessar o sistema da VIMMUS e começar a geranciar de forma eficáz seus projetos.' + '\n' +
                    'Usuário: ' + usuario + '\n' +
                    'Senha: ' + senha + '\n' +
                    'Fique a vontade par alterar o nome de usuário (de acordo com a disponibilidade) e sua senha.' + '\n' + '\n' +
                    'Lembres-se que ao realizar o login você concorda com nossos termo de usuário e nossa política de privacidade.' + '\n' +
                    'Mas não se preocupe, estamos a disposição para te ajudar com qualquer dúvida no e-mail solucoes@vimmus.com.br. Manda um e-mail que vamos te responder o mais rápido possível.' + '\n' + '\n' +
                    'Alexandre Galiotto' + '\n' +
                    'Vimmus Soluções' + '\n' +
                    'Celular/WhatApp: (49) 9 9183-2978'

                //Parâmetros do E-mail
                const mailOptions = { // Define informações pertinentes ao E-mail que será enviado
                    from: '"VIMMUS Soluções" <alexandre@vimmus.com.br>',
                    to: email,
                    subject: 'Solicitação de Senha',
                    //text: 'Nome: ' + req.body.nome + ';' + 'Celular: ' + req.body.celular + ';' + 'E-mail: '+ req.body.email
                    text: texto
                }
                /*
                //Parâmentros do SMS
                const from = "Vonage APIs"
                const to = "5549991832978"
                const text = texto
                */

                Usuario.findOne({ email: req.body.email }).then((usuario_email) => {
                    if (usuario_email) {
                        req.flash("error_msg", "Já existe uma conta com este e-mail.")
                        res.redirect("/")
                    } else {
                        var data = new Date()
                        var ano = data.getFullYear()
                        var mes = parseFloat(data.getMonth()) + 1
                        var dia = data.getDate()

                        const novoUsuario = new Usuario({
                            nome: req.body.nome,
                            usuario: usuario,
                            telefone: req.body.celular,
                            email: email,
                            ehAdmin: 3,
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
                                    req.flash("success_msg", novoUsuario.nome + ', sua senha será enviada por e-mail e sua confirmação de acesso será feita em instantes. Não esqueça de verificar suar caixa de spam!')
                                    //Enviando e-mail
                                    transporter.sendMail(mailOptions, (err, info) => { // Função que, efetivamente, envia o email.
                                        if (err) {
                                            return console.log(err)
                                        }
                                        //console.log(info)
                                    })
                                    res.redirect("/")
                                }).catch((err) => {
                                    req.flash("error_msg", "Ocorreu uma falha interna")
                                    res.redirect("/usuario/registro")
                                })
                            })
                        })

                        /*
                        //Enviando SMS
                        vonage.message.sendSms(from, to, text, (err, responseData) => {
                            if (err) {
                                //console.log(err);
                            } else {
                                if(responseData.messages[0]['status'] === "0") {
                                    //console.log("Message sent successfully.");
                                } else {
                                    //console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
                                }
                            }
                        })    
                        
                        */
                        res.render('index', { sucesso: sucesso })
                    }
                }).catch((err) => {
                    req.flash("error_msg", "Houve um erro ao se registrar.")
                    res.redirect("/")
                })


            }).catch((err) => {
                req.flash("error_msg", "Ocorreu uma falha interna")
                res.redirect("/usuario/registro")
            })
        }).catch((err) => {
            req.flash("error_msg", "Ocorreu uma falha interna")
            res.redirect("/usuario/registro")
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

router.post("/editregistro", ehAdmin, (req, res) => {
    var erros = []
    var sucesso = []

    Usuario.findOne({ usuario: req.body.usuario }).then((usuario_existe) => {

        if (usuario_existe == null) {
            console.log('Usuário não existe.')
            console.log('existe: usuario_existe=>' + usuario_existe)
            if (!req.body.usuario || typeof req.body.usuario == undefined || req.body.usuario == true) {
                erros.push({ texto: "É necessário cadastrar um nome de usuário" })
            }
            if (!req.body.razao || typeof req.body.razao == undefined || req.body.razao == true) {
                erros.push({ texto: "É necessário cadastrar a Razão Social" })
            }
            if (!req.body.cnpj || typeof req.body.cnpj == undefined || req.body.cnpj == true) {
                erros.push({ texto: "É necessário cadastrar o CNPJ da empresa" })
            }

            if (!req.body.telefone || typeof req.body.telefone == undefined || req.body.telefone == true) {
                erros.push({ texto: "É necessário cadastrar um telefone" })
            }

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
            if (erros.length > 0) {
                Usuario.findOne({ _id: req.body.id }).lean().then((usuarios) => {
                    res.render("usuario/editregistro", { erros: erros, usuario: usuarios })
                })
            } else {

                Usuario.findOne({ _id: req.body.id }).then((usuario) => {

                    //console.log('req.body.nome=>'+req.body.nome)
                    //console.log('razao=>'+req.body.razao)
                    //console.log('fantasia=>'+req.body.fantasia)
                    //console.log('cnpj=>'+req.body.cnpj)
                    //console.log('endereco=>'+req.body.endereco)
                    //console.log('cidade=>'+req.body.cidade)
                    //console.log('uf=>'+req.body.uf)
                    //console.log('telefone=>'+req.body.telefone)
                    //console.log('req.body.usuario=>'+req.body.usuario)
                    var cidade = 0
                    var uf = 0

                    if (req.body.cidade == '') {
                        cidade = 0
                    } else {
                        cidade = req.body.cidade
                    }
                    if (req.body.uf == '') {
                        uf = 0
                    } else {
                        uf = req.body.uf
                    }


                    usuario.nome = req.body.nome
                    usuario.razao = req.body.razao
                    usuario.fantasia = req.body.fantasia
                    usuario.cnpj = req.body.cnpj
                    usuario.endereco = req.body.endereco
                    if (req.body.cidade != '') {
                        usuario.cidade = cidade
                    }
                    if (req.body.uf != '') {
                        usuario.uf = uf
                    }
                    usuario.telefone = req.body.telefone
                    usuario.usuario = req.body.usuario

                    if (req.body.senha != '' && req.body.senharep != '') {
                        usuario.senha = req.body.senha

                        bcrypt.genSalt(10, (erro, salt) => {
                            bcrypt.hash(usuario.senha, salt, (erro, hash) => {
                                if (erro) {
                                    req.flash("error_msg", "Houve um erro durante o salvamento do usuário")
                                    res.redirect("/")
                                }

                                usuario.senha = hash

                                usuario.save().then(() => {
                                    sucesso.push({ texto: "Usuário salvo com sucesso!" })
                                    Usuario.findOne({ _id: req.body.id }).lean().then((usuario) => {
                                        res.render("usuario/editregistro", { usuario: usuario, sucesso: sucesso })
                                    }).catch((err) => {
                                        req.flash("error_msg", "Ocorreu uma falha interna")
                                        res.redirect("/")
                                    })
                                }).catch((err) => {
                                    req.flash("error_msg", "Não foi possível salvar o registro")
                                    res.redirect("/")
                                })
                            })
                        })
                    } else {
                        usuario.save().then(() => {
                            Usuario.findOne({ _id: req.body.id }).lean().then((usuario) => {
                                sucesso.push({ texto: "Alterações do usuário realizadas com sucesso!" })
                                res.render("usuario/editregistro", { usuario: usuario, sucesso: sucesso })
                            }).catch((err) => {
                                req.flash("error_msg", "Ocorreu uma falha interna.")
                                res.redirect("/menu")
                            })
                        }).catch((err) => {
                            req.flash("error_msg", "Não foi possível salvar o registro.")
                            res.redirect("/menu")
                        })
                    }

                }).catch((err) => {
                    req.flash("error_msg", "Houve uma falha ao encontrar o usuário.")
                    res.redirect("/")
                })

            }
        } else {
            console.log('Usuário existe')
            Usuario.findOne({ _id: req.body.id }).lean().then((usuario_atual) => {
                console.log('Usuário existe.')
                console.log('atual: usuario_existe=>' + usuario_existe.usuario)
                console.log('usuario_atual=>' + usuario_atual.usuario)
                if (usuario_existe.usuario != usuario_atual.usuario) {
                    erros.push({ texto: 'Me desculpe, este nome de usuario já existe. Por favor tente outro.' })
                    const { ehAdmin } = req.user
                    if (ehAdmin == 0) {
                        ehUserMaster = true
                    } else {
                        ehUserMaster = false
                    }
                    res.render("usuario/editregistro", { erros: erros, usuario: usuario_atual, ehUsermaster: ehUserMaster })
                } else {

                    Usuario.findOne({ _id: req.body.id }).then((usuario) => {

                        //console.log('req.body.nome=>'+req.body.nome)
                        //console.log('razao=>'+req.body.razao)
                        //console.log('fantasia=>'+req.body.fantasia)
                        //console.log('cnpj=>'+req.body.cnpj)
                        //console.log('endereco=>'+req.body.endereco)
                        //console.log('cidade=>'+req.body.cidade)
                        //console.log('uf=>'+req.body.uf)
                        //console.log('telefone=>'+req.body.telefone)
                        //console.log('req.body.usuario=>'+req.body.usuario)
                        var cidade = 0
                        var uf = 0

                        if (req.body.cidade == '') {
                            cidade = 0
                        } else {
                            cidade = req.body.cidade
                        }
                        if (req.body.uf == '') {
                            uf = 0
                        } else {
                            uf = req.body.uf
                        }

                        usuario.nome = req.body.nome
                        usuario.razao = req.body.razao
                        usuario.fantasia = req.body.fantasia
                        usuario.cnpj = req.body.cnpj
                        usuario.endereco = req.body.endereco
                        if (req.body.cidade != '') {
                            usuario.cidade = cidade
                        }
                        if (req.body.uf != '') {
                            usuario.uf = uf
                        }
                        usuario.telefone = req.body.telefone
                        usuario.usuario = req.body.usuario

                        if (req.body.senha != '' && req.body.senharep != '') {
                            usuario.senha = req.body.senha

                            bcrypt.genSalt(10, (erro, salt) => {
                                bcrypt.hash(usuario.senha, salt, (erro, hash) => {
                                    if (erro) {
                                        req.flash("error_msg", "Houve um erro durante o salvamento do usuário")
                                        res.redirect("/")
                                    }

                                    usuario.senha = hash

                                    usuario.save().then(() => {
                                        sucesso.push({ texto: "Usuário salvo com sucesso!" })
                                        Usuario.findOne({ _id: req.body.id }).lean().then((usuario) => {
                                            res.render("usuario/editregistro", { usuario: usuario, sucesso: sucesso })
                                        }).catch((err) => {
                                            req.flash("error_msg", "Ocorreu uma falha interna")
                                            res.redirect("/")
                                        })
                                    }).catch((err) => {
                                        req.flash("error_msg", "Não foi possível salvar o registro")
                                        res.redirect("/")
                                    })
                                })
                            })
                        } else {
                            usuario.save().then(() => {
                                Usuario.findOne({ _id: req.body.id }).lean().then((usuario) => {
                                    sucesso.push({ texto: "Alterações do usuário realizadas com sucesso!" })
                                    res.render("usuario/editregistro", { usuario: usuario, sucesso: sucesso })
                                }).catch((err) => {
                                    req.flash("error_msg", "Ocorreu uma falha interna.")
                                    res.redirect("/menu")
                                })
                            }).catch((err) => {
                                req.flash("error_msg", "Não foi possível salvar o registro.")
                                res.redirect("/menu")
                            })
                        }

                    }).catch((err) => {
                        req.flash("error_msg", "Houve uma falha ao encontrar o usuário.")
                        res.redirect("/")
                    })
                }

            }).catch((err) => {
                req.flash("error_msg", "Houve uma falha ao encontrar o usuário.")
                res.redirect("/administrador")
            })
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve uma falha ao encontrar o usuário.")
        res.redirect("/")
    })
})

module.exports = router