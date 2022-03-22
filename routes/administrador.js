const express = require("express")
const router = express.Router()

const bcrypt = require("bcryptjs")

const mongoose = require('mongoose');

const Usuarios = mongoose.model('usuario')
const Acesso = mongoose.model('acesso')
const Pessoa = mongoose.model('pessoa')
const Projeto = mongoose.model('projeto')
const Equipe = mongoose.model('equipe')

const { ehMaster } = require('../helpers/ehMaster')
const { ehAdmin } = require('../helpers/ehAdmin')

const naoVazio = require('../resources/naoVazio')

router.get('/', ehMaster, (req, res) => {
    const { owner } = req.user
    Usuarios.find().sort({ data: 'desc' }).lean().then((usuarios) => {
        res.render('usuario/administrador', { usuarios, owner })
    })
})

router.get('/acesso', ehMaster, (req, res) => {
    const { _id } = req.user
    const { owner } = req.user
    var lista = []
    var q = 0
    Acesso.find({ user: _id }).sort({ data: 'desc' }).then((acesso) => {
        if (acesso.length > 0) {
            acesso.forEach((element) => {
                Pessoa.findOne({ _id: element.pessoa }).then((pessoa) => {
                    //console.log('funorc=>'+pessoa.funorc)
                    if (pessoa.funges == 'checked') {
                        funcao = 'Gestão'
                    } else {
                        if (pessoa.vendedor == 'checked') {
                            funcao = 'Vendedor'
                        } else {
                            if (pessoa.funorc == 'checked') {
                                funcao = 'Orçamentista'
                            } else {
                                funcao = 'Instalador'
                            }
                        }
                    }
                    lista.push({ id: element._id, usuario: element.usuario, nome: pessoa.nome, email: pessoa.email, celular: pessoa.celular, endereco: pessoa.endereco, cidade: pessoa.cidade, uf: pessoa.uf, ehAdmin: element.ehAdmin, funcao })
                    q++
                    if (q == acesso.length) {
                        res.render('usuario/administrador', { lista, owner })
                    }
                }).catch((err) => {
                    req.flash('error_msg', 'Não foi possível encontrar a pessoa.')
                    res.redirect('/menu')
                })
            })
        } else {
            res.render('usuario/administrador')
        }
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar o acesso.')
        res.redirect('/menu')
    })
})

router.get('/confirmaexclusao/:id', ehMaster, (req, res) => {
    Usuarios.findOne({ _id: req.params.id }).lean().then((usuario) => {
        if (naoVazio(usuario)) {
            res.render('usuario/confirmaexclusao', { usuario })
        } else {
            Acesso.findOne({ _id: req.params.id }).lean().then((acesso) => {
                res.render('usuario/confirmaexclusao', { acesso })
            }).catch((err) => {
                req.flash('error_msg', 'Não foi possível encontrar o usuário de acesso')
                res.redirect('/projeto/consulta')
            })
        }
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar o projeto')
        res.redirect('/projeto/consulta')
    })
})

router.get('/remover/:id', ehMaster, (req, res) => {
    var erros = []
    Acesso.findOne({ _id: req.params.id }).then((acesso) => {
        Pessoa.findOne({ _id: acesso.pessoa }).then((pessoa) => {
            Projeto.findOne({ vendedor: pessoa._id }).then((prj_ven) => {
                console.log('prj_ven=>' + prj_ven)
                if (naoVazio(prj_ven)) {
                    req.flash('error_msg', 'Não é possível excluir este vendedor pois está vinculado a propostas.')
                    res.redirect('/administrador/acesso')
                } else {
                    Projeto.findOne({ responsavel: pessoa._id }).then((prj_res) => {
                        console.log('prj_res=>' + prj_res)
                        if (naoVazio(prj_res)) {
                            req.flash('error_msg', 'Não é possível excluir este orcamentista pois está vinculado a propostas.')
                            res.redirect('/administrador/acesso')
                        } else {
                            Equipe.findOne({ insres: pessoa._id }).then((equipe) => {
                                console.log('equipe=>' + equipe)
                                if (naoVazio(equipe)) {
                                    req.flash('error_msg', 'Não é possível excluir este instalador pois está vinculada a obras.')
                                    res.redirect('/administrador/acesso')
                                } else {
                                    Pessoa.findOneAndDelete({ _id: pessoa._id }).then(() => {
                                        Acesso.findOneAndDelete({ pessoa: pessoa._id }).then(() => {
                                            req.flash('success_msg', 'Pessoa excluida com sucesso')
                                            res.redirect('/administrador/acesso')
                                        }).catch((err) => {
                                            req.flash('error_msg', 'Houve um erro ao excluir o acesso.')
                                            res.redirect('/pessoa//consulta')
                                        })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Houve um erro ao excluir a pessoa.')
                                        res.redirect('/pessoa//consulta')
                                    })
                                }
                            }).catch((err) => {
                                req.flash('error_msg', 'Houve um erro ao encontrar a equipe.')
                                res.redirect('/administrador/acesso')
                            })
                        }
                    }).catch((err) => {
                        req.flash('error_msg', 'Houve um erro ao encontrar o projeto.')
                        res.redirect('/administrador/acesso')
                    })
                }
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao encontrar o projeto.')
                res.redirect('/administrador/acesso')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao encontrar o projeto cadastrado.')
            res.redirect('/administrador/acesso')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar o usuário de acesso cadastrado.')
        res.redirect('/administrador/acesso')
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
        res.render("usuario/registro", { erros })
    } else {
        Usuarios.findOne({ email: req.body.email }).then((usuario) => {
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

router.post("/editregistro", ehAdmin, (req, res) => {
    var erros = ''
    var senha
    var sucesso = []
    var ehUserMaster
    var razao = 0
    var fantasia = 0
    var cnpj = 0
    var endereco = 0
    var cidade = 0
    var uf = 0
    var telefone = 0
    var email = 0
    var data
    var ano
    var mes
    var dia
    var dataexp
    var anoexp
    var mesexp
    var diaexp

    const { owner } = req.user
    const { ehAdmin } = req.user

    //console.log('req.body.usuario=>' + req.body.usuario)
    //console.log('req.body.id=>' + req.body.id)

    Usuarios.findOne({ usuario: req.body.usuario }).then((usuario_existe) => {
        if (usuario_existe != null) {
            Usuarios.findOne({ _id: req.body.id }).lean().then((usuario_atual) => {
                if (usuario_existe.usuario != usuario_atual.usuario) {
                    erros.push({ texto: 'Me desculpe, este nome de usuario já existe. Por favor tente outro.' })
                    if (ehAdmin == 0) {
                        ehUserMaster = true
                    } else {
                        ehUserMaster = false
                    }
                    res.render("usuario/editregistro", { erros, usuario: usuario_atual, ehUserMaster, owner })
                } else {
                    if ((req.body.senha != '' && req.body.senharep == '') || (req.body.senha == '' && req.body.senharep != '')) {
                        if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == true) {
                            erros = erros + " Senha Inválida."
                        }
                        if (validaSenha.length < 5) {
                            erros = erros + " A senha deve ter ao menos 6 caracteres."
                        }

                        if (req.body.senha != req.body.senharep) {
                            erros = erros + " Senhas diferentes. Verificar."
                        }
                    }
                    if (req.body.usuario == '' || req.body.usuario == null) {
                        erros = erros + ' É necessário ter um usuário.'
                    }
                    if (req.body.nome == '' || req.body.nome == null) {
                        erros = erros + ' É necessário ter um nome.'
                    }
                    if (erros != '') {

                        req.flash('error_msg', erros)
                        res.redirect('/usuario/editar/' + req.body.id)

                    } else {
                        //console.log('req.body.id=>' + req.body.id)
                        Usuarios.findOne({ _id: req.body.id }).then((usuario) => {
                            razao = 0
                            fantasia = 0
                            cnpj = 0
                            endereco = 0
                            cidade = 0
                            uf = 0
                            telefone = 0

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
                            console.log('email=>' + req.body.email)
                            if (naoVazio(req.body.email)) {
                                usuario.email = req.body.email
                            }
                            usuario.telefone = telefone
                            usuario.usuario = req.body.usuario
                            usuario.ehAdmin = req.body.tipo

                            if (usuario.datalib == '' || usuario.datalib == null) {
                                data = new Date()
                                ano = data.getFullYear()
                                mes = parseFloat(data.getMonth()) + 1
                                dia = data.getDate()
                                usuario.datalib = ano + '' + mes + '' + dia

                                dataexp = new Date()
                                dataexp.setDate(data.getDate() + 30)
                                anoexp = dataexp.getFullYear()
                                mesexp = parseFloat(dataexp.getMonth()) + 1
                                diaexp = dataexp.getDate()
                                usuario.dataexp = anoexp + '' + mesexp + '' + diaexp
                            }

                            // //console.log('senha=>' + req.body.senha)
                            if (naoVazio(req.body.senha)) {
                                senha = req.body.senha
                                bcrypt.genSalt(10, (erro, salt) => {
                                    bcrypt.hash(senha, salt, (erro, hash) => {
                                        if (erro) {
                                            req.flash("error_msg", "Houve um erro durante o salvamento do usuário.")
                                            res.redirect("/usuario/editar/" + req.body.id)
                                        }
                                        usuario.senha = hash
                                        //console.log('hash=>' + hash)
                                        usuario.save().then(() => {
                                            req.flash('success_msg', 'Senha alterada com sucesso.')
                                            res.redirect('/usuario/editar/' + req.body.id)
                                        }).catch((err) => {
                                            req.flash("error_msg", "Não foi possível salvar o registro.")
                                            res.redirect("/usuario/editar/" + req.body.id)
                                        })
                                    })
                                })

                            } else {
                                //console.log('sem senha')
                                usuario.save().then(() => {
                                    Usuarios.find().sort({ data: 'desc' }).lean().then((usuarios) => {
                                        if (owner) {
                                            req.flash('success_msg', "Alterações do usuário realizadas com sucesso!")
                                            res.redirect('/usuario/editar/' + req.body.id)
                                        } else {
                                            req.flash('success_msg', "Alterações do usuário realizadas com sucesso!")
                                            res.redirect('/menu')
                                        }
                                    }).catch((err) => {
                                        req.flash("error_msg", "Ocorreu uma falha interna.")
                                        res.redirect("/usuario/editar/" + req.body.id)
                                    })
                                }).catch((err) => {
                                    req.flash("error_msg", "Não foi possível salvar o registro.")
                                    res.redirect("/usuario/editar/" + req.body.id)
                                })
                            }
                        }).catch((err) => {
                            req.flash("error_msg", "Houve uma falha ao encontrar o usuário<usuário>.")
                            res.redirect("/usuario/editar/" + req.body.id)
                        })
                    }
                }
            }).catch((err) => {
                req.flash("error_msg", "Houve uma falha ao encontrar o usuário<usuário atual>.")
                res.redirect("/usuario/editar/" + req.body.id)
            })
        } else {
            Acesso.findOne({ _id: req.body.id }).then((acesso_existe) => {
                console.log('acesso_existe=>' + acesso_existe)
                if (acesso_existe == null) {
                    if ((req.body.senha != '' && req.body.senharep == '') || (req.body.senha == '' && req.body.senharep != '')) {
                        if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == true) {
                            erros = erros + " Senha Inválida."
                        }
                        if (validaSenha.length < 5) {
                            erros = erros + " A senha deve ter ao menos 6 caracteres."
                        }
                        if (req.body.senha != req.body.senharep) {
                            erros = erros + " Senhas diferentes. Verificar."
                        }
                    }
                    if (req.body.usuario == '' || req.body.usuario == null) {
                        erros = erros + ' É necessário ter um usuário.'
                    }
                    if (req.body.nome == '' || req.body.nome == null) {
                        erros = erros + ' É necessário ter um nome.'
                    }
                    if (erros != '') {
                        req.flash('error_msg', erros)
                        res.redirect('/usuario/editar/' + req.body.id)

                    } else {
                        Usuarios.findOne({ _id: req.body.id }).then((usuario) => {
                            razao = 0
                            fantasia = 0
                            cnpj = 0
                            endereco = 0
                            cidade = 0
                            uf = 0
                            telefone = 0

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
                            if (naoVazio(req.body.email)) {
                                usuario.email = req.body.email
                            }
                            if (req.body.cidade != '') {
                                usuario.cidade = cidade
                            }
                            if (req.body.uf != '') {
                                usuario.uf = uf
                            }
                            usuario.telefone = telefone
                            usuario.usuario = req.body.usuario
                            usuario.ehAdmin = req.body.tipo

                            if (usuario.datalib == '' || usuario.datalib == null) {
                                data = new Date()
                                ano = data.getFullYear()
                                mes = parseFloat(data.getMonth()) + 1
                                dia = data.getDate()
                                usuario.datalib = ano + '' + mes + '' + dia

                                dataexp = new Date()
                                dataexp.setDate(data.getDate() + 30)
                                anoexp = dataexp.getFullYear()
                                mesexp = parseFloat(dataexp.getMonth()) + 1
                                diaexp = dataexp.getDate()
                                usuario.dataexp = anoexp + '' + mesexp + '' + diaexp
                            }

                            console.log('senha=>' + req.body.senha)
                            if (naoVazio(req.body.senha)) {
                                senha = req.body.senha
                                bcrypt.genSalt(10, (erro, salt) => {
                                    bcrypt.hash(senha, salt, (erro, hash) => {
                                        if (erro) {
                                            req.flash("error_msg", "Houve um erro durante o salvamento do usuário.")
                                            res.redirect("/usuario/editar/" + req.body.id)
                                        }
                                        usuario.senha = hash
                                        //console.log('hash=>' + hash)
                                        usuario.save().then(() => {
                                            Usuarios.find().sort({ data: 'desc' }).lean().then((usuarios) => {
                                                sucesso.push({ texto: "Alterações do usuário realizadas com sucesso!" })
                                                res.render("usuario/administrador/", { usuarios, sucesso, owner })
                                            }).catch((err) => {
                                                req.flash("error_msg", "Ocorreu uma falha interna.")
                                                res.redirect("/usuario/editar/" + req.body.id)
                                            })
                                        }).catch((err) => {
                                            req.flash("error_msg", "Não foi possível salvar o registro.")
                                            res.redirect("/usuario/editar/" + req.body.id)
                                        })
                                    })
                                })

                            } else {
                                usuario.save().then(() => {
                                    Usuarios.find().sort({ data: 'desc' }).lean().then((usuarios) => {
                                        sucesso.push({ texto: "Alterações do usuário realizadas com sucesso!" })
                                        res.render("usuario/menu/", { usuarios, sucesso, owner })
                                    }).catch((err) => {
                                        req.flash("error_msg", "Ocorreu uma falha interna.")
                                        res.redirect("/usuario/editar/" + req.body.id)
                                    })
                                }).catch((err) => {
                                    req.flash("error_msg", "Não foi possível salvar o registro.")
                                    res.redirect("/usuario/editar/" + req.body.id)
                                })
                            }
                        }).catch((err) => {
                            req.flash("error_msg", "Houve uma falha ao encontrar o usuário<usuário>.")
                            res.redirect("/usuario/editar/" + req.body.id)
                        })
                    }
                } else {
                    //console.log('atual: acesso_existe=>' + acesso_existe.usuario)
                    Pessoa.findOne({ _id: acesso_existe.pessoa }).then((pessoa) => {
                        console.log('entrou acesso')
                        if (req.body.detalhes != 'true') {
                            console.log(req.body.nome)
                            if (naoVazio(req.body.nome)) {
                                console.log("tem nome")
                                pessoa.nome = req.body.nome
                            } else {
                                console.log("nome 0")
                                pessoa.nome = 0
                            }
                            if (naoVazio(req.body.cpf)) {
                                pessoa.cpf = req.body.cpf
                            } else {
                                pessoa.cpf = 0
                            }
                            if (naoVazio(req.body.cnpj)) {
                                pessoa.cnpj = req.body.cnpj
                            } else {
                                pessoa.cnpj = 0
                            }
                            if (naoVazio(req.body.endereco)) {
                                pessoa.endereco = req.body.endereco
                            } else {
                                pessoa.endereco = 0
                            }
                            if (naoVazio(req.body.cidade)) {
                                pessoa.cidade = req.body.cidade
                            }
                            if (naoVazio(req.body.uf)) {
                                pessoa.uf = req.body.uf
                            }
                        }
                        console.log('req.body.email=>' + req.body.email)
                        if (naoVazio(req.body.email)) {
                            pessoa.email = req.body.email
                        } else {
                            pessoa.email = pessoa.email
                        }
                        if (naoVazio(req.body.telefone)) {
                            pessoa.celular = req.body.telefone
                        } else {
                            pessoa.celular = pessoa.celular
                        }

                        pessoa.save().then(() => {
                            Acesso.findOne({ usuario: acesso_existe.usuario }).lean().then((acesso_atual) => {
                                //console.log('Acesso existe.')
                                //console.log('acesso_atual=>' + acesso_atual.usuario)
                                if (acesso_existe.usuario != acesso_atual.usuario) {
                                    erros.push({ texto: 'Me desculpe, este nome de usuario já existe. Por favor tente outro.' })
                                    if (ehAdmin == 0) {
                                        ehUserMaster = true
                                    } else {
                                        ehUserMaster = false
                                    }
                                    res.render("usuario/editregistro", { erros, usuario: usuario_atual, ehUserMaster, owner })
                                } else {

                                    var notpro
                                    var notvis
                                    var notobs
                                    var notorc
                                    var notins
                                    var notgan
                                    var notped

                                    if (naoVazio(req.body.notpro)) {
                                        notpro = 'checked'
                                    } else {
                                        notpro = 'unchecked'
                                    }
                                    if (naoVazio(req.body.notorc)) {
                                        notorc = 'checked'
                                    } else {
                                        notorc = 'unchecked'
                                    }
                                    if (naoVazio(req.body.notobs)) {
                                        notobs = 'checked'
                                    } else {
                                        notobs = 'unchecked'
                                    }
                                    if (naoVazio(req.body.notvis)) {
                                        notvis = 'checked'
                                    } else {
                                        notvis = 'unchecked'
                                    }
                                    if (naoVazio(req.body.notins)) {
                                        notins = 'checked'
                                    } else {
                                        notins = 'unchecked'
                                    }
                                    if (naoVazio(req.body.notgan)) {
                                        notgan = 'checked'
                                    } else {
                                        notgan = 'unchecked'
                                    }
                                    if (naoVazio(req.body.notped)) {
                                        notped = 'checked'
                                    } else {
                                        notped = 'unchecked'
                                    }

                                    if ((req.body.senha != '' && req.body.senharep == '') || (req.body.senha == '' && req.body.senharep != '')) {
                                        if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == true) {
                                            erros = erros + "Senha Inválida."
                                        }
                                        if (validaSenha.length < 5) {
                                            erros = erros + "A senha deve ter ao menos 6 caracteres."
                                        }

                                        if (req.body.senha != req.body.senharep) {
                                            erros = erros + "Senhas diferentes. Verificar."
                                        }
                                    }
                                    if (req.body.usuario == '' || req.body.usuario == null) {
                                        erros = erros + 'É necessário ter um usuário.'
                                    }

                                    if (erros != '') {
                                        req.flash('error_msg', erros)
                                        res.redirect('/usuario/editar/' + req.body.id)
                                    } else {
                                        // //console.log('atualizou')
                                        Acesso.findOne({ usuario: acesso_existe.usuario }).then((acesso) => {
                                            //console.log('req.body.usuario=>' + req.body.usuario)
                                            //console.log('req.body.tipo=>' + tipo)
                                            if (naoVazio(req.body.usuario)) {
                                                acesso.usuario = req.body.usuario
                                            }
                                            if (naoVazio(req.body.tipo)) {
                                                acesso.ehAdmin = req.body.tipo
                                            }

                                            acesso.notpro = notpro
                                            acesso.notorc = notorc
                                            acesso.notvis = notvis
                                            acesso.notobs = notobs
                                            acesso.notgan = notgan
                                            acesso.notins = notins
                                            acesso.notped = notped

                                            if (acesso.datalib == '' || acesso.datalib == null) {
                                                data = new Date()
                                                ano = data.getFullYear()
                                                mes = parseFloat(data.getMonth()) + 1
                                                dia = data.getDate()
                                                acesso.datalib = ano + '' + mes + '' + dia

                                                dataexp = new Date()
                                                dataexp.setDate(data.getDate() + 30)
                                                anoexp = dataexp.getFullYear()
                                                mesexp = parseFloat(dataexp.getMonth()) + 1
                                                diaexp = dataexp.getDate()
                                                acesso.dataexp = anoexp + '' + mesexp + '' + diaexp
                                            }

                                            console.log('senha=>' + req.body.senha)
                                            console.log('acesso.senha=>' + acesso.senha)
                                            if (naoVazio(req.body.senha)) {
                                                senha = req.body.senha
                                                bcrypt.genSalt(10, (erro, salt) => {
                                                    bcrypt.hash(senha, salt, (erro, hash) => {
                                                        if (erro) {
                                                            req.flash("error_msg", "Houve um erro durante o salvamento do usuário.")
                                                            res.redirect("/usuario/editar/" + req.body.id)
                                                        } else {
                                                            acesso.senha = hash
                                                            //console.log('hash=>' + hash)
                                                            acesso.save().then(() => {
                                                                //console.log('atualizou')
                                                                req.flash('success_msg', 'Alteração(ões) realizadas com sucesso.')
                                                                res.redirect("/usuario/editar/" + req.body.id)
                                                            }).catch((err) => {
                                                                req.flash("error_msg", "Não foi possível salvar o registro.")
                                                                res.redirect("/usuario/editar/" + req.body.id)
                                                            })
                                                        }
                                                    })
                                                })
                                            } else {
                                                acesso.save().then(() => {
                                                    console.log('atualizou')
                                                    req.flash('success_msg', 'Alteração(ões) realizadas com sucesso.')
                                                    res.redirect('/usuario/editar/' + req.body.id)
                                                }).catch((err) => {
                                                    req.flash("error_msg", "Não foi possível salvar o registro.")
                                                    res.redirect("/usuario/editar/" + req.body.id)
                                                })
                                            }

                                        }).catch((err) => {
                                            req.flash("error_msg", "Houve uma falha ao encontrar o usuário<acesso>.")
                                            res.redirect("/usuario/editar/" + req.body.id)
                                        })
                                    }
                                }
                            }).catch((err) => {
                                req.flash("error_msg", "Houve uma falha ao encontrar o usuário<acesso atual>.")
                                res.redirect("/usuario/editar/" + req.body.id)
                            })
                        }).catch((err) => {
                            req.flash("error_msg", "Houve uma falha ao salvar a pessoa")
                            res.redirect("/usuario/editar/" + req.body.id)
                        })
                    }).catch((err) => {
                        req.flash("error_msg", "Houve uma falha ao encontrar a pessoa.")
                        res.redirect("/usuario/editar/" + req.body.id)
                    })
                }
            })
            //console.log('Usuário não existe.')
            //console.log('existe: usuario_existe=>'+usuario_existe)            
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve uma falha ao encontrar o usuário<usuario existe.")
        res.redirect("/usuario/editar/" + req.body.id)
    })
})

module.exports = router