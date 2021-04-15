const express = require("express")
const router = express.Router()

const bcrypt = require("bcryptjs")

const mongoose = require('mongoose');

const Usuarios = mongoose.model('usuario')
const Projeto = mongoose.model('projeto')

const { ehMaster } = require('../helpers/ehMaster')

router.get('/', ehMaster, (req, res) => {
    Usuarios.find().sort({ data: 'desc' }).lean().then((usuarios) => {
        res.render('usuario/administrador', { usuarios: usuarios })
    })
})

router.get('/confirmaexclusao/:id', ehMaster, (req, res) => {
    Usuarios.findOne({ _id: req.params.id }).lean().then((usuario) => {
        res.render('usuario/confirmaexclusao', { usuario: usuario })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar o projeto')
        res.redirect('/projeto/consulta')
    })
})

router.get('/remover/:id', ehMaster, (req, res) => {
    var erros = []
    Projeto.findOne({ user: req.params.id }).lean().then((projeto_user) => {
        if (projeto_user != null) {
            erros.push({ texto: 'Não é possível excluir este usuário pois está vinculado a projetos.' })
        }
        if (erros.length > 0) {
            Usuarios.find().lean().then((usuarios) => {
                res.render('usuario/administrador', { erros: erros, usuarios: usuarios })
            }).catch((err) => {
                req.flash('error_msg', 'Não há nenhum usuário cadastrada')
                res.redirect('/menu')
            })
        } else {
            Usuarios.findOneAndDelete({ _id: req.params.id }).then(() => {
                req.flash('success_msg', 'Usuário excluido com sucesso')
                res.redirect('/administrador')
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao excluir o usuário.')
                res.redirect('/administrador')
            })
        }
    })

})

router.post("/registro", ehMaster, (req, res) => {
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
    if (!req.body.celular || typeof req.body.celular == undefined || req.body.celular == true) {
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
                var data = new Date()
                var ano = data.getFullYear()
                var mes = parseFloat(data.getMonth()) + 1
                var dia = data.getDate()
                const novoUsuario = new Usuario({
                    razao: req.body.razao,
                    fantasia: req.body.fantasia,
                    nome: req.body.nome,
                    cnpj: req.body.cnpj,
                    endereco: req.body.endereco,
                    cidade: req.body.cidade,
                    uf: req.body.uf,
                    telefone: req.body.celular,
                    usuario: req.body.usuario,
                    email: req.body.email,
                    senha: req.body.senha,
                    ehAdmin: 1,
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

router.post("/editregistro", ehMaster, (req, res) => {
    var erros = []
    var sucesso = []

    Usuarios.findOne({ usuario: req.body.usuario }).then((usuario_existe) => {
        if (usuario_existe == null) {
            console.log('Usuário não existe.')
            console.log('existe: usuario_existe=>'+usuario_existe)
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
            if (req.body.usuario == '' || req.body.usuario == null) {
                erros.push({ texto: 'É necessário ter um usuário.' })
            }
            if (req.body.nome == '' || req.body.nome == null) {
                erros.push({ texto: 'É necessário ter um nome.' })
            }
            if (erros.length > 0) {
                Usuarios.findOne({ _id: req.body.id }).lean().then((usuarios) => {
                    const { ehAdmin } = req.user
                    if (ehAdmin == 0) {
                        ehUserMaster = true
                    } else {
                        ehUserMaster = false
                    }
                    res.render("usuario/editregistro", { erros: erros, usuario: usuarios, ehUserMaster:ehUserMaster })
                })

            } else {
                Usuarios.findOne({ _id: req.body.id }).then((usuario) => {
                    var razao = 0
                    var fantasia = 0
                    var cnpj = 0
                    var endereco = 0
                    var cidade = 0
                    var uf = 0
                    var telefone = 0

                    if (req.body.razao == '') {
                        razao = 0
                    } else {
                        razao = req.body.razao
                    }
                    if (req.body.fantasia == '') {
                        fantasia = 0
                    } else {
                        fantasia = req.body.fantasia
                    }
                    if (req.body.cnpj == '') {
                        cnpj = 0
                    } else {
                        cnpj = req.body.cnpj
                    }
                    if (req.body.endereco == '') {
                        endereco = 0
                    } else {
                        endereco = req.body.endereco
                    }

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

                    if (req.body.telefone == '') {
                        telefone = 0
                    } else {
                        telefone = req.body.telefone
                    }

                    usuario.nome = req.body.nome
                    usuario.razao = razao
                    usuario.fantasia = fantasia
                    usuario.cnpj = cnpj
                    usuario.endereco = endereco
                    if (req.body.cidade != '') {
                        usuario.cidade = cidade
                    }
                    if (req.body.uf != '') {
                        usuario.uf = uf
                    }
                    usuario.telefone = telefone
                    usuario.usuario = req.body.usuario
                    usuario.ehAdmin = req.body.tipo

                    //console.log('req.body.nome=>'+req.body.nome)
                    //console.log('razao=>'+razao)
                    //console.log('fantasia=>'+fantasia)
                    //console.log('cnpj=>'+cnpj)
                    //console.log('endereco=>'+endereco)
                    //console.log('cidade=>'+cidade)
                    //console.log('uf=>'+uf)
                    //console.log('telefone=>'+telefone)
                    //console.log('req.body.usuario=>'+req.body.usuario)
                    //console.log('req.body.tipo=>'+req.body.tipo)


                    if (usuario.datalib == '' || usuario.datalib == null) {
                        var data = new Date()
                        var ano = data.getFullYear()
                        var mes = parseFloat(data.getMonth()) + 1
                        var dia = data.getDate()
                        usuario.datalib = ano + '' + mes + '' + dia

                        var dataexp = new Date()
                        dataexp.setDate(data.getDate() + 30)
                        var anoexp = dataexp.getFullYear()
                        var mesexp = parseFloat(dataexp.getMonth()) + 1
                        var diaexp = dataexp.getDate()
                        usuario.dataexp = anoexp + '' + mesexp + '' + diaexp
                    }

                    //console.log('senha=>' + req.body.senha)
                    if (req.body.senha != '') {
                        usuario.senha = req.body.senha

                        bcrypt.genSalt(10, (erro, salt) => {
                            bcrypt.hash(usuario.senha, salt, (erro, hash) => {
                                if (erro) {
                                    req.flash("error_msg", "Houve um erro durante o salvamento do usuário.")
                                    res.redirect("/administrador")
                                }
                                usuario.senha = hash
                                //console.log('hash=>' + hash)
                                usuario.save().then(() => {
                                    Usuarios.find().sort({ data: 'desc' }).lean().then((usuarios) => {
                                        sucesso.push({ texto: "Alterações do usuário realizadas com sucesso!" })
                                        res.render("usuario/administrador", { usuarios: usuarios, sucesso: sucesso })
                                    }).catch((err) => {
                                        req.flash("error_msg", "Ocorreu uma falha interna.")
                                        res.redirect("/administrador/")
                                    })
                                }).catch((err) => {
                                    req.flash("error_msg", "Não foi possível salvar o registro.")
                                    res.redirect("/administrador")
                                })
                            })
                        })

                    } else {
                        usuario.save().then(() => {
                            Usuarios.find().sort({ data: 'desc' }).lean().then((usuarios) => {
                                sucesso.push({ texto: "Alterações do usuário realizadas com sucesso!" })
                                res.render("usuario/administrador", { usuarios: usuarios, sucesso: sucesso })
                            }).catch((err) => {
                                req.flash("error_msg", "Ocorreu uma falha interna.")
                                res.redirect("/administrador/")
                            })
                        }).catch((err) => {
                            req.flash("error_msg", "Não foi possível salvar o registro.")
                            res.redirect("/administrador")
                        })
                    }
                }).catch((err) => {
                    req.flash("error_msg", "Houve uma falha ao encontrar o usuário.")
                    res.redirect("/administrador")
                })
            }
        } else {
            Usuarios.findOne({ _id: req.body.id }).lean().then((usuario_atual) => {
                console.log('Usuário existe.')
                console.log('atual: usuario_existe=>'+usuario_existe.usuario)
                console.log('usuario_atual=>'+usuario_atual.usuario)
                if (usuario_existe.usuario != usuario_atual.usuario) {
                    erros.push({ texto: 'Me desculpe, este nome de usuario já existe. Por favor tente outro.' })
                    const { ehAdmin } = req.user
                    if (ehAdmin == 0) {
                        ehUserMaster = true
                    } else {
                        ehUserMaster = false
                    }
                    res.render("usuario/editregistro", { erros: erros, usuario: usuario_atual, ehUserMaster:ehUserMaster })
                } else {
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
                    if (req.body.usuario == '' || req.body.usuario == null) {
                        erros.push({ texto: 'É necessário ter um usuário.' })
                    }
                    if (req.body.nome == '' || req.body.nome == null) {
                        erros.push({ texto: 'É necessário ter um nome.' })
                    }
                    if (erros.length > 0) {
                        Usuarios.findOne({ _id: req.body.id }).lean().then((usuarios) => {
                            const { ehAdmin } = req.user
                            if (ehAdmin == 0) {
                                ehUserMaster = true
                            } else {
                                ehUserMaster = false
                            }
                            res.render("usuario/editregistro", { erros: erros, usuario: usuarios, ehUserMaster:ehUserMaster })
                        })

                    } else {
                        Usuarios.findOne({ _id: req.body.id }).then((usuario) => {
                            var razao = 0
                            var fantasia = 0
                            var cnpj = 0
                            var endereco = 0
                            var cidade = 0
                            var uf = 0
                            var telefone = 0

                            if (req.body.razao == '') {
                                razao = 0
                            } else {
                                razao = req.body.razao
                            }
                            if (req.body.fantasia == '') {
                                fantasia = 0
                            } else {
                                fantasia = req.body.fantasia
                            }
                            if (req.body.cnpj == '') {
                                cnpj = 0
                            } else {
                                cnpj = req.body.cnpj
                            }
                            if (req.body.endereco == '') {
                                endereco = 0
                            } else {
                                endereco = req.body.endereco
                            }

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

                            if (req.body.telefone == '') {
                                telefone = 0
                            } else {
                                telefone = req.body.telefone
                            }

                            usuario.nome = req.body.nome
                            usuario.razao = razao
                            usuario.fantasia = fantasia
                            usuario.cnpj = cnpj
                            usuario.endereco = endereco
                            if (req.body.cidade != '') {
                                usuario.cidade = cidade
                            }
                            if (req.body.uf != '') {
                                usuario.uf = uf
                            }
                            usuario.telefone = telefone
                            usuario.usuario = req.body.usuario
                            usuario.ehAdmin = req.body.tipo

                            //console.log('req.body.nome=>'+req.body.nome)
                            //console.log('razao=>'+razao)
                            //console.log('fantasia=>'+fantasia)
                            //console.log('cnpj=>'+cnpj)
                            //console.log('endereco=>'+endereco)
                            //console.log('cidade=>'+cidade)
                            //console.log('uf=>'+uf)
                            //console.log('telefone=>'+telefone)
                            //console.log('req.body.usuario=>'+req.body.usuario)
                            //console.log('req.body.tipo=>'+req.body.tipo)


                            if (usuario.datalib == '' || usuario.datalib == null) {
                                var data = new Date()
                                var ano = data.getFullYear()
                                var mes = parseFloat(data.getMonth()) + 1
                                var dia = data.getDate()
                                usuario.datalib = ano + '' + mes + '' + dia

                                var dataexp = new Date()
                                dataexp.setDate(data.getDate() + 30)
                                var anoexp = dataexp.getFullYear()
                                var mesexp = parseFloat(dataexp.getMonth()) + 1
                                var diaexp = dataexp.getDate()
                                usuario.dataexp = anoexp + '' + mesexp + '' + diaexp
                            }

                            //console.log('senha=>' + req.body.senha)
                            if (req.body.senha != '') {
                                usuario.senha = req.body.senha

                                bcrypt.genSalt(10, (erro, salt) => {
                                    bcrypt.hash(usuario.senha, salt, (erro, hash) => {
                                        if (erro) {
                                            req.flash("error_msg", "Houve um erro durante o salvamento do usuário.")
                                            res.redirect("/administrador")
                                        }
                                        usuario.senha = hash
                                        //console.log('hash=>' + hash)
                                        usuario.save().then(() => {
                                            Usuarios.find().sort({ data: 'desc' }).lean().then((usuarios) => {
                                                sucesso.push({ texto: "Alterações do usuário realizadas com sucesso!" })
                                                res.render("usuario/administrador", { usuarios: usuarios, sucesso: sucesso })
                                            }).catch((err) => {
                                                req.flash("error_msg", "Ocorreu uma falha interna.")
                                                res.redirect("/administrador/")
                                            })
                                        }).catch((err) => {
                                            req.flash("error_msg", "Não foi possível salvar o registro.")
                                            res.redirect("/administrador")
                                        })
                                    })
                                })

                            } else {
                                usuario.save().then(() => {
                                    Usuarios.find().sort({ data: 'desc' }).lean().then((usuarios) => {
                                        sucesso.push({ texto: "Alterações do usuário realizadas com sucesso!" })
                                        res.render("usuario/administrador", { usuarios: usuarios, sucesso: sucesso })
                                    }).catch((err) => {
                                        req.flash("error_msg", "Ocorreu uma falha interna.")
                                        res.redirect("/administrador/")
                                    })
                                }).catch((err) => {
                                    req.flash("error_msg", "Não foi possível salvar o registro.")
                                    res.redirect("/administrador")
                                })
                            }
                        }).catch((err) => {
                            req.flash("error_msg", "Houve uma falha ao encontrar o usuário.")
                            res.redirect("/administrador")
                        })
                    }
                }

            }).catch((err) => {
                req.flash("error_msg", "Houve uma falha ao encontrar o usuário.")
                res.redirect("/administrador")
            })
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve uma falha ao encontrar o usuário.")
        res.redirect("/administrador")
    })
})
module.exports = router