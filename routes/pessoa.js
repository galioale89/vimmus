require('../app')
const multer = require('multer')
const express = require('express')

const router = express.Router()

//const path = require('path')
const app = express()
app.set('view engine', 'ejs')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'imagens/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const uploadfoto = multer({ storage })
const { render } = require('ejs')
const { type } = require('jquery')
const { forEach } = require('async')

require('../model/Pessoa')
require('../model/Equipe')
const mongoose = require('mongoose')

const Pessoa = mongoose.model('pessoa')
const Projeto = mongoose.model('projeto')
const Equipe = mongoose.model('equipe')

const { ehAdmin } = require('../helpers/ehAdmin')
router.use(express.static('imagens'))

router.get('/formaequipe/:id', ehAdmin, (req, res) => {
    Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
        Equipe.findOne({ projeto: projeto._id }).lean().then((equipe) => {
            Pessoa.find({ funins: 'checked' }).lean().then((instaladores) => {
                if (equipe != null) {

                    var ins_dentro = []
                    var ins_fora = []
                    const { ins0 } = equipe
                    const { ins1 } = equipe
                    const { ins2 } = equipe

                    for (var i = 0; i < instaladores.length; i++) {
                        const { nome } = instaladores[i]
                        if (nome == ins0) {
                            ins_dentro.push({ ins: nome })
                        } else {
                            if (nome == ins1) {
                                ins_dentro.push({ ins: nome })
                            } else {
                                if (nome == ins2) {
                                    ins_dentro.push({ ins: nome })
                                } else {
                                    ins_fora.push({ ins: nome })
                                }
                            }
                        }
                    }

                    res.render('mdo/editformaequipe_first', { projeto: projeto, fora: ins_fora, dentro: ins_dentro })

                } else {

                    res.render('mdo/formaequipe_first', { instaladores: instaladores, projeto: projeto })

                }
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao encontrar o instalador')
                res.redirect('/projeto/consulta')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Houve uma falha ao encontrar a equipe')
            res.redirect('/projeto/consulta')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve uma falha ao encontrar o projeto')
        res.redirect('/projeto/consulta')
    })
})

router.get('/refazequipe/:id', ehAdmin, (req, res) => {
    Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
        Pessoa.find({ funins: 'checked' }).lean().then((instaladores) => {
            res.render('mdo/formaequipe_first', { projeto: projeto, instaladores: instaladores })
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao encontrar o instalador')
            res.redirect('/projeto/consulta')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve uma falha ao encontrar o projeto')
        res.redirect('/projeto/consulta')
    })
})

router.post('/criarequipe', ehAdmin, (req, res) => {

    var sucesso = []

    var ins_dentro = []
    var ins_fora = []

    Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {
        Equipe.findOne({ projeto: projeto._id }).then((equipe_existe) => {
            if (equipe_existe != null) {
                equipe_existe.remove()
            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve uma falha ao encontrar a equipe')
            res.redirect('/projeto/consulta')
        })

        const equipe_nova = {
            projeto: req.body.id,
            //nome: req.body.nome,
            ins0: req.body.ins0,
            ins1: req.body.ins1,
            ins2: req.body.ins2
        }

        new Equipe(equipe_nova).save().then(() => {
            sucesso.push({ texto: 'Equipe registrada com suceso' })
        }).catch((err) => {
            req.flash('error_msg', 'Houve uma falha ao salvar a equipe')
            res.redirect('/projeto/consulta')
        })

        Pessoa.find({ funins: 'checked' }).lean().then((instaladores) => {

            const { ins0 } = equipe_nova
            const { ins1 } = equipe_nova
            const { ins2 } = equipe_nova

            for (var i = 0; i < instaladores.length; i++) {
                const { nome } = instaladores[i]
                if (nome == ins0) {
                    ins_dentro.push({ ins: nome })
                } else {
                    if (nome == ins1) {
                        ins_dentro.push({ ins: nome })
                    } else {
                        if (nome == ins2) {
                            ins_dentro.push({ ins: nome })
                        } else {
                            ins_fora.push({ ins: nome })
                        }
                    }
                }
            }
            var qtdins
            switch (ins_dentro.length) {
                case 1: qtdins = 'Um instalador'
                    break
                case 2: qtdins = 'Dois instaladores'
                    break
                case 3: qtdins = 'Três instaladores'
                    break
            }
            Projeto.findOne({ _id: req.body.id }).then((projeto_salva) => {
                projeto_salva.equipe = ins_dentro.length
                projeto_salva.save().then(() => {
                    var texto = qtdins + ' registrados no projeto.'
                    sucesso.push({ texto: texto })
                    res.render('mdo/editformaequipe_first', { sucesso: sucesso, projeto: projeto, fora: ins_fora, dentro: ins_dentro })
                }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao salvar o projeto')
                    res.redirect('/projeto/consulta/')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Houve uma falha ao encontrar o projeto')
                res.redirect('/projeto/consulta/')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Houve uma falha ao encontrar o instalador')
            res.redirect('/projeto/consulta')
        })

    }).catch((err) => {
        req.flash('error_msg', 'Houve uma falha ao encontrar o projeto')
        res.redirect('/projeto/consulta')
    })


})

router.get('/novo', ehAdmin, (req, res) => {

    var aviso = []

    aviso.push({ texto: 'Obrigatório o preenchimento de todos os campos descritivos, da adição da foto e da escolha de uma função.' })
    res.render('mdo/addpessoas', { aviso: aviso })

})

router.get('/edicao/:id', ehAdmin, (req, res) => {
    Pessoa.findOne({ _id: req.params.id }).lean().then((pessoa) => {
        res.render('mdo/editpessoas', { pessoa: pessoa })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao encontrar a pessoa.')
        res.redirect('/consulta')
    })
})

router.get('/confirmaexclusao/:id', ehAdmin, (req, res) => {
    Pessoa.findOne({ _id: req.params.id }).lean().then((pessoa) => {
        res.render('mdo/confirmaexclusao', { pessoa: pessoa })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar o projeto')
        res.redirect('/projeto/consulta')
    })
})

router.get('/remover/:id', ehAdmin, (req, res) => {
    var erros = []
    var cont = 0
    var id = req.params.id
    Projeto.findOne({ funres: id }).lean().then((projeto_res) => {
        if (projeto_res != null) {
            erros.push({ texto: 'Não é possível excluir esta pessoa pois está vinculada como responsável de um projeto.' })
        }

        Projeto.findOne({ funpro: id }).lean().then((projeto_pro) => {
            if (projeto_pro != null) {
                erros.push({ texto: 'Não é possível excluir esta pessoa pois está vinculada como projetista de um projeto.' })
            }

            Projeto.findOne({ funins: id }).lean().then((projeto_ins) => {
                if (projeto_ins != null) {
                    erros.push({ texto: 'Não é possível excluir esta pessoa pois está vinculada como instalador de um projeto.' })
                }

                if (erros.length > 0) {
                    Pessoa.findOne({ _id: req.params.id }).lean().then((pessoa) => {
                        res.render('mdo/confirmaexclusao', { erros: erros, pessoa: pessoa })
                    }).catch((err) => {
                        req.flash('error_msg', 'Não há nenhum pessoa cadastrada')
                        res.redirect('/projeto/novo')
                    })

                } else {
                    Pessoa.findOneAndDelete({ _id: req.params.id }).then(() => {
                        req.flash('success_msg', 'Pessoa excluida com sucesso')
                        res.redirect('/pessoa/consulta')
                    }).catch((err) => {
                        req.flash('error_msg', 'Houve um erro ao excluir a pessoa.')
                        res.redirect('/consulta')
                    })
                }
            })
        })
    })

})

router.get('/consulta', ehAdmin, (req, res) => {
    Pessoa.find().lean().then((pessoas) => {
        res.render('mdo/findpessoas', { pessoas: pessoas })
    }).catch((err) => {
        req.flash('error_msg', 'Não foram encontradas pessoas cadastradas')
        res.redirect('/pessoa')
    })
})

router.get('/vermais/:id', (req, res) => {
    Pessoa.findOne({ _id: req.params.id }).lean().then((pessoa) => {
        Projeto.find({ funres: pessoa._id }).sort({dataord: 'asc'}).lean().then((prjres) => {
            Projeto.find({ funins: pessoa._id }).sort({dataord: 'desc'}).lean().then((prjins) => {
                Projeto.find({ funpro: pessoa._id }).sort({dataord: 'desc'}).lean().then((prjpro) => {
                    var qtdres = prjres.length
                    var qtdins = prjins.length
                    var qtdpro = prjpro.length
                    res.render('mdo/vermais', { pessoa: pessoa, prjres: prjres, prjins: prjins, prjpro: prjpro, qtdres:qtdres, qtdpro:qtdpro, qtdins:qtdins })
                }).catch((err) => {
                    req.flash('error_msg', 'Não foram encontradas projetos para esta pessoa')
                    res.redirect('/pessoa')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Não foram encontradas projetos para esta pessoa')
                res.redirect('/pessoa')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Não foram encontradas projetos para esta pessoa')
            res.redirect('/pessoa')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Não foram encontradas pessoas.')
        res.redirect('/pessoa')
    })

})

router.post('/novo', uploadfoto.single('foto'), ehAdmin, (req, res) => {

    var maninv
    var subcom
    var repequ
    var vistor
    var dlaudo
    var limmod
    var funges
    var funpro
    var funins
    var funcao = 0
    var erros = []
    var documento

    if (req.body.cnpj != '') {
        documento = req.body.cnpj
    } else {
        documento = req.body.cpf
    }

    if (req.body.nome == '' || req.body.endereco == '' || req.body.cidade == '' ||
        req.body.uf == '' || documento == '' || req.body.iniati == '' ||
        req.body.celular == '' || req.body.email == '') {
        erros.push({ texto: 'Todos os campos de descrição são obrigatórios' })
    }

    if (req.file == null) {
        erros.push({ texto: 'Deve ser adicionada uma foto' })
    }
    if (req.body.data == null || req.body.data == null) {

    }
    if (req.body.funges != null) {
        funcao = + 1
    }
    if (req.body.funpro != null) {
        funcao = + 1
    }
    if (req.body.funins != null) {
        funcao = + 1
    }

    if (funcao == 0) {
        erros.push({ texto: 'Ao menos uma função deve ser selecionada' })
    }

    if (erros.length > 0) {
        res.render('mdo/addpessoas', { erros: erros })
    } else {
        //Validando Manutenção de Inversores
        if (req.body.maninv != null) {
            maninv = 'checked'
        }
        //Validando Substituição de Componentes
        if (req.body.subcom != null) {
            subcom = 'checked'
        }
        //Validando Reposicionamento de Equipamento
        if (req.body.repequ != null) {
            repequ = 'checked'
        }
        //Validando Vistoria
        if (req.body.vistor != null) {
            vistor = 'checked'
        }
        //Validando Diagnóstico e Laudo
        if (req.body.dlaudo != null) {
            dlaudo = 'checked'
        }
        //Validando Limpeza de Módulos
        if (req.body.limmod != null) {
            limmod = 'checked'
        }

        //Validando função gestor
        if (req.body.funges != null) {
            funges = 'checked'
        }
        //Validando função 
        if (req.body.funpro != null) {
            funpro = 'checked'
        }
        //Validando Limpeza de Módulos
        if (req.body.funins != null) {
            funins = 'checked'
        }
        var cnpj
        var cpf
        if (req.body.cnpj != '') {
            cnpj = req.body.cnpj
        }
        if (req.body.cpf != '') {
            cpf = req.body.cpf
        }

        const pessoa = {
            nome: req.body.nome,
            endereco: req.body.endereco,
            cidade: req.body.cidade,
            uf: req.body.uf,
            cnpj: cnpj,
            cpf: cpf,
            iniati: req.body.iniati,
            celular: req.body.celular,
            email: req.body.email,
            maninv: maninv,
            subcom: subcom,
            repequ: repequ,
            vistor: vistor,
            dlaudo: dlaudo,
            limmod: limmod,
            funges: funges,
            funpro: funpro,
            funins: funins,
            foto: req.file.filename,
            certificado: req.file.filename
        }
        new Pessoa(pessoa).save().then(() => {
            var sucesso = []
            sucesso.push({ texto: 'Pessoa adicionada com sucesso' })
            Pessoa.findOne().sort({ field: 'asc', _id: -1 }).lean().then((pessoa) => {
                res.render('projeto/menu', { sucesso: sucesso, pessoa: pessoa })
            }).catch((err) => {
                req.flash('error_msg', 'Não foi possível encontrar a pessoa')
                res.redirect('/pessoa/novo')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível cadastrar a pessoa')
            res.redirect('/pessoa/novo')
        })
    }
})

router.post('/editar', uploadfoto.single('foto'), ehAdmin, (req, res) => {

    var maninv
    var subcom
    var repequ
    var vistor
    var dlaudo
    var limmod
    var funges
    var funpro
    var funins
    var funcao = 0
    var erros = []
    var documento

    if (req.body.cnpj != '') {
        documento = req.body.cnpj
    } else {
        documento = req.body.cpf
    }

    if (req.body.nome == '' || req.body.endereco == '' || req.body.cidade == '' ||
        req.body.uf == '' || documento == '' || req.body.iniati == '' ||
        req.body.celular == '' || req.body.email == '') {
        erros.push({ texto: 'Todo os campos de descrição são obrigatórios' })
    }

    if (req.body.funges != null) {
        funcao = + 1
    }
    if (req.body.funpro != null) {
        funcao = + 1
    }
    if (req.body.funins != null) {
        funcao = + 1
    }
    if (funcao == 0) {
        erros.push({ texto: 'Ao menos uma função deve ser selecionada' })
    }

    if (erros.length > 0) {
        Pessoa.findOne({ _id: req.body.id }).lean().then((pessoa) => {
            res.render('mdo/editpessoas', { pessoa: pessoa, erros: erros })
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível encontrar a pessoa')
            res.redirect('/pessoa/consulta')
        })
    } else {
        //Validando Manutenção de Inversores
        if (req.body.maninv != null) {
            maninv = 'checked'
        }
        //Validando Substituição de Componentes
        if (req.body.subcom != null) {
            subcom = 'checked'
        }
        //Validando Reposicionamento de Equipamento
        if (req.body.repequ != null) {
            repequ = 'checked'
        }
        //Validando Vistoria
        if (req.body.vistor != null) {
            vistor = 'checked'
        }
        //Validando Diagnóstico e Laudo
        if (req.body.dlaudo != null) {
            dlaudo = 'checked'
        }
        //Validando Limpeza de Módulos
        if (req.body.limmod != null) {
            limmod = 'checked'
        }

        //Validando função gestor
        if (req.body.funges != null) {
            funges = 'checked'
        }
        //Validando função 
        if (req.body.funpro != null) {
            funpro = 'checked'
        }
        //Validando Limpeza de Módulos
        if (req.body.funins != null) {
            funins = 'checked'
        }

        var cnpj
        var cpf
        if (req.body.cnpj != '') {
            cnpj = req.body.cnpj
        }
        if (req.body.cpf != '') {
            cpf = req.body.cpf
        }

        Pessoa.findOne({ _id: req.body.id }).then((pessoa) => {

            pessoa.nome = req.body.nome
            pessoa.endereco = req.body.endereco
            pessoa.cidade = req.body.cidade
            pessoa.uf = req.body.uf
            pessoa.cnpj = cnpj
            pessoa.cpf = cpf
            pessoa.iniati = req.body.iniati
            pessoa.celular = req.body.celular
            pessoa.email = req.body.email
            pessoa.maninv = maninv
            pessoa.subcom = subcom
            pessoa.repequ = repequ
            pessoa.vistor = vistor
            pessoa.dlaudo = dlaudo
            pessoa.limmod = limmod
            pessoa.funges = funges
            pessoa.funpro = funpro
            pessoa.funins = funins
            if (req.file != null) {
                pessoa.foto = req.file.filename
            } else {
                pessoa.foto = pessoa.foto
            }

            Pessoa(pessoa).save().then(() => {
                Pessoa.findOne({ _id: req.body.id }).lean().then((pessoa) => {
                    var sucesso = []
                    sucesso.push({ texto: 'Alterações salvas com sucesso' })
                    res.render('mdo/editpessoas', { pessoa: pessoa, sucesso: sucesso })
                }).catch((err) => {
                    req.flash('error_msg', 'Não foi possível encontrar a pessoa')
                    res.redirect('/pessoa/novo')
                })

            }).catch((err) => {
                req.flash('error_msg', 'Não foi possível cadastrar a pessoa')
                res.redirect('/pessoa/consulta')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível encontrar a pessoa')
            res.redirect('/pessoa/consulta')
        })
    }
})

router.post('/filtrar', ehAdmin, (req, res) => {
    var cidade = req.body.cidade
    var uf = req.body.uf
    var nome = req.body.nome
    if (nome != '' && uf != '' && cidade != '') {
        Pessoa.find({ nome: new RegExp(nome), uf: new RegExp(uf), cidade: new RegExp(cidade) }).lean().then((pessoas) => {
            res.render('mdo/findpessoas', { pessoas: pessoas })
        })
    } else {
        if (nome == '' && cidade == '' && uf == '') {
            Pessoa.find().lean().then((pessoas) => {
                res.render('mdo/findpessoas', { pessoas: pessoas })
            })
        } else {
            if (nome == '' && cidade == '') {
                Pessoa.find({ uf: new RegExp(uf) }).lean().then((pessoas) => {
                    res.render('mdo/findpessoas', { pessoas: pessoas })
                })
            } else {
                if (nome == '' && uf == '') {
                    Pessoa.find({ cidade: new RegExp(cidade) }).lean().then((pessoas) => {
                        res.render('mdo/findpessoas', { pessoas: pessoas })
                    })
                } else {
                    if (cidade == '' && uf == '') {
                        Pessoa.find({ nome: new RegExp(nome) }).lean().then((pessoas) => {
                            res.render('mdo/findpessoas', { pessoas: pessoas })
                        })
                    } else {
                        if (cidade == '') {
                            Pessoa.find({ nome: new RegExp(nome), uf: new RegExp(uf) }).lean().then((pessoas) => {
                                res.render('mdo/findpessoas', { pessoas: pessoas })
                            })
                        } else {
                            if (uf == '') {
                                Pessoa.find({ nome: new RegExp(nome), cidade: new RegExp(cidade) }).lean().then((pessoas) => {
                                    res.render('mdo/findpessoas', { pessoas: pessoas })
                                })
                            } else {
                                Pessoa.find({ cidade: new RegExp(cidade), uf: new RegExp(uf) }).lean().then((pessoas) => {
                                    res.render('mdo/findpessoas', { pessoas: pessoas })
                                })
                            }
                        }
                    }
                }
            }
        }
    }

})

module.exports = router