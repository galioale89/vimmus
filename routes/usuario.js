const { sum } = require('d3-array')
const { render } = require('ejs')

const express = require('express')
const router = express.Router()

const path = require("path")

require('../model/Usuario')
const mongoose = require('mongoose')
const Usuario = mongoose.model('usuario')

const bcrypt = require("bcryptjs")
const passport = require("passport")

router.use(express.static('imagens'))
const { ehAdmin } = require('../helpers/ehAdmin')

router.get('/editar/:id', ehAdmin, (req, res) => {
    Usuario.findOne({ _id: req.params.id }).lean().then((usuario) => {
        res.render('usuario/editregistro', { usuario: usuario })
    })
})

router.get('/registro', (req, res) => {
    res.render('usuario/registro')
})

router.post("/registro", (req, res) => {
    var erros = []

    if (!req.body.usuario || typeof req.body.usuario == undefined || req.body.usuario == true) {
        erros.push({ texto: "É necessário cadastrar um nome de usuário" })
    }
    if (!req.body.razao || typeof req.body.razao == undefined || req.body.razao == true) {
        erros.push({ texto: "É necessário cadastrar a Razão Social" })
    }
    if (!req.body.cnpj || typeof req.body.cnpj == undefined || req.body.cnpj == true) {
        erros.push({ texto: "É necessário cadastrar o CNPJ da empresa" })
    }
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == true) {
        erros.push({ texto: "É necessário cadastrar um e-mail da empresa" })
    }
    if (!req.body.telefone || typeof req.body.telefone == undefined || req.body.telefone == true) {
        erros.push({ texto: "É necessário cadastrar um telefone" })
    }
    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == true) {
        erros.push({ texto: "Senha Inválida" })
    }

    if (req.body.senha.length < 5) {
        erros.push({ texto: "A senha deve ter ao menos 6 caracteres." })
    }

    if (req.body.senha != req.body.senharep) {
        erros.push({ texto: "Senhas diferentes. Verificar." })
    }

    if (erros.length > 0) {
        res.render("usuario/registro", { erros: erros })
    } else {
        Usuario.findOne({ email: req.body.email }).then((usuario) => {
            if (usuario) {
                req.flash("error_msg", "Já existe uma conta com este e-mail.")
                res.redirect("/registro")
            } else {
                const novoUsuario = new Usuario({
                    razao: req.body.razao,
                    fantasia: req.body.fantasia,
                    cnpj: req.body.cnpj,
                    endereco: req.body.endereco,
                    cidade: req.body.cidade,
                    uf: req.body.uf,
                    telefone: req.body.telefone,
                    usuario: req.body.usuario,
                    email: req.body.email,
                    senha: req.body.senha,
                    ehAdmin: 1
                })

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if (erro) {
                            req.flash("error_msg", "Houve um erro durante o salvamento do usuário")
                            res.redirect("/")
                        }

                        novoUsuario.senha = hash

                        novoUsuario.save().then(() => {
                            req.flash("success_msg", "Usuário criado com sucesso!")
                            res.redirect("/")
                        }).catch((err) => {
                            req.flash("error_msg", "Ocorreu uma falha interna")
                            res.redirect("/usuario/registro")
                        })
                    })
                })
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao se registrar.")
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
        successRedirect: "/projeto/menu",
        failureRedirect: "/usuario/login",
        failureFlash: true
    })(req, res, next)
})

router.post("/editregistro", ehAdmin, (req, res) => {
    var erros = []
    var sucesso = []

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
        res.render("usuario/registro", { erros: erros })
    } else {

        Usuario.findOne({ _id: req.body.id }).then((usuario) => {
            usuario.razao = req.body.razao
            usuario.fantasia = req.body.fantasia
            usuario.cnpj = req.body.cnpj
            usuario.endereco = req.body.endereco
            usuario.endereco = req.body.cidade
            usuario.uf = req.body.uf
            usuario.telefone = req.body.telefone
            usuario.usuario = req.body.usuario

            if (req.body.senha != '' && req.body.senharep != '' ) {
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
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve uma falha ao encontrar o usuário.")
            res.redirect("/")
        })

    }

})

module.exports = router