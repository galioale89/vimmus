require('../app')
const multer = require('multer')
const express = require('express')

const router = express.Router()

//const path = require('path')
const app = express()
app.set('view engine', 'ejs')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'imagens/upload/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const uploadfoto = multer({ storage })

require('../model/Pessoa')
require('../model/Equipe')
const mongoose = require('mongoose')

const Pessoa = mongoose.model('pessoa')
const Projeto = mongoose.model('projeto')
const Equipe = mongoose.model('equipe')

const { ehAdmin } = require('../helpers/ehAdmin')

router.use(express.static('imagens'))
router.use(express.static('imagens/upload'))

router.get('/vendedor', ehAdmin, (req, res) => {

    var aviso = []
    var ehVendedor = true
    aviso.push({ texto: 'Obrigatório o preenchimento de todos os campos descritivos, da adição da foto e da escolha de uma função.' })
    res.render('mdo/vendedor', { aviso: aviso, ehVendedor: ehVendedor })

})

router.get('/consultaequipepadrao', ehAdmin, (req, res) => {
    const { _id } = req.user
    Equipe.find({ user: _id, ativo: true }).lean().then((equipe) => {
        res.render('mdo/consultaequipepadrao', { equipe: equipe })
    })
})

router.get('/novaequipepadrao/', ehAdmin, (req, res) => {
    const { _id } = req.user
    Pessoa.find({ funins: 'checked', user: _id }).lean().then((instaladores) => {
        res.render('mdo/novaequipepadrao', { instaladores: instaladores })
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar o instalador')
        res.redirect('/projeto/consulta')
    })
})

router.get('/formaequipe/:id', ehAdmin, (req, res) => {
    const { _id } = req.user
    Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
        Equipe.findOne({ projeto: projeto._id }).lean().then((equipe) => {
            Pessoa.find({ funins: 'checked', user: _id }).lean().then((instaladores) => {
                if (equipe != null) {

                    var ins_dentro = []
                    var ins_fora = []
                    const { ins0 } = equipe
                    const { ins1 } = equipe
                    const { ins2 } = equipe
                    const { ins3 } = equipe
                    const { ins4 } = equipe
                    const { ins5 } = equipe

                    console.log(ins0,ins1,ins2,ins3,ins4,ins5)

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
                                    if (nome == ins3) {
                                        ins_dentro.push({ ins: nome })
                                    } else {
                                        if (nome == ins4) {
                                            ins_dentro.push({ ins: nome })
                                        } else {
                                            if (nome == ins5) {
                                                ins_dentro.push({ ins: nome })
                                            } else {
                                                ins_fora.push({ ins: nome })
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    res.render('mdo/editformaequipe_first', { projeto: projeto, fora: ins_fora, dentro: ins_dentro })

                } else {
                    Equipe.find({ user: _id, ativo: true }).lean().then((equipe) => {
                        res.render('mdo/formaequipe_first', { instaladores: instaladores, projeto: projeto, equipe: equipe })
                    })
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
    const { _id } = req.user
    Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
        Pessoa.find({ funins: 'checked', user: _id }).lean().then((instaladores) => {
            Equipe.find({ user: _id, ativo: true }).lean().then((equipe) => {
                res.render('mdo/formaequipe_first', { projeto: projeto, instaladores: instaladores, equipe: equipe })
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao encontrar a equipe')
                res.redirect('/projeto/consulta')
            })
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
    const { _id } = req.user
    var sucesso = []

    var ins_dentro = []
    var ins_fora = []

    Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {
        Equipe.findOne({ projeto: projeto._id }).then((equipe_existe) => {
            if (equipe_existe != null) {
                equipe_existe.remove()
                //console.log('removido')
            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve uma falha ao encontrar a equipe.')
            res.redirect('/projeto/consulta')
        })

        if (req.body.id_equipe == 'Nenhuma equipe selecionada') {
            console.log('É manual')

            const equipe = {
                projeto: req.body.id,
                ins0: req.body.ins0,
                ins1: req.body.ins1,
                ins2: req.body.ins2,
                ins3: req.body.ins3,
                ins4: req.body.ins4,
                ins5: req.body.ins5
            }


            new Equipe(equipe).save().then(() => {
                sucesso.push({ texto: 'Equipe registrada com suceso.' })
            }).catch((err) => {
                req.flash('error_msg', 'Houve uma falha ao salvar a equipe<NE>.')
                res.redirect('/projeto/consulta')
            })

            Pessoa.find({ funins: 'checked', user: _id }).lean().then((instaladores) => {

                const { ins0 } = equipe
                const { ins1 } = equipe
                const { ins2 } = equipe
                const { ins3 } = equipe
                const { ins4 } = equipe
                const { ins5 } = equipe

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
                                if (nome == ins3) {
                                    ins_dentro.push({ ins: nome })
                                } else {
                                    if (nome == ins4) {
                                        ins_dentro.push({ ins: nome })
                                    } else {
                                        if (nome == ins5) {
                                            ins_dentro.push({ ins: nome })
                                        } else {
                                            ins_fora.push({ ins: nome })
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                var qtdins
                switch (ins_dentro.length) {
                    case 1: qtdins = 'Um instalador registrado'
                        break
                    case 2: qtdins = 'Dois instaladores registrados'
                        break
                    case 3: qtdins = 'Três instaladores registrados'
                        break
                    case 4: qtdins = 'Quatro instaladores registrados'
                        break
                    case 5: qtdins = 'Cinco instaladores registrados'
                        break
                    case 6: qtdins = 'Seis instaladores registrados'
                        break
                }

                Projeto.findOne({ _id: req.body.id }).then((projeto_salva) => {
                    projeto_salva.qtdequipe = ins_dentro.length
                    projeto_salva.save().then(() => {
                        var texto = qtdins + ' no projeto.'
                        ////console.log(qtdins)
                        sucesso.push({ texto: texto })
                        res.render('mdo/editformaequipe_first', { sucesso: sucesso, projeto: projeto, fora: ins_fora, dentro: ins_dentro })
                    }).catch((err) => {
                        req.flash('error_msg', 'Houve uma falha ao salvar o projeto.')
                        res.redirect('/projeto/consulta/')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao encontrar o projeto<NS>.')
                    res.redirect('/projeto/consulta/')
                })

            }).catch((err) => {
                req.flash('error_msg', 'Houve uma falha ao encontrar o instalador.')
                res.redirect('/projeto/consulta')
            })
        } else {
            Equipe.findOne({ _id: req.body.id_equipe }).lean().then((equipe) => {
                const equipe_nova = {
                    projeto: req.body.id,
                    ins0: equipe.ins0,
                    ins1: equipe.ins1,
                    ins2: equipe.ins2,
                    ins3: equipe.ins3,
                    ins4: equipe.ins4,
                    ins5: equipe.ins5
                }

                console.log('id=>' + equipe._id)
                console.log('ins0=>' + equipe.ins0)
                console.log('ins1=>' + equipe.ins1)
                console.log('ins2=>' + equipe.ins2)
                console.log('ins3=>' + equipe.ins3)
                console.log('ins4=>' + equipe.ins4)
                console.log('ins5=>' + equipe.ins5)

                
                new Equipe(equipe_nova).save().then(() => {
                    sucesso.push({ texto: 'Equipe registrada com suceso.' })
                }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao salvar a equipe.')
                    res.redirect('/projeto/consulta')
                })
                Pessoa.find({ funins: 'checked', user: _id }).lean().then((instaladores) => {
                    Equipe.findOne({ projeto: req.body.id }).then((equipe) => {
                        const { ins0 } = equipe
                        const { ins1 } = equipe
                        const { ins2 } = equipe
                        const { ins3 } = equipe
                        const { ins4 } = equipe
                        const { ins5 } = equipe
                        //console.log(ins0, ins1, ins2)

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
                                        if (nome == ins3) {
                                            ins_dentro.push({ ins: nome })
                                        } else {
                                            if (nome == ins4) {
                                                ins_dentro.push({ ins: nome })
                                            } else {
                                                if (nome == ins5) {
                                                    ins_dentro.push({ ins: nome })
                                                } else {
                                                    ins_fora.push({ ins: nome })
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        //console.log(ins0, ins1, ins2)
                        var qtdins
                        switch (ins_dentro.length) {
                            case 1: qtdins = 'Um instalador registrado'
                                break
                            case 2: qtdins = 'Dois instaladores registrados'
                                break
                            case 3: qtdins = 'Três instaladores registrados'
                                break
                            case 4: qtdins = 'Quatro instaladores registrados'
                                break
                            case 5: qtdins = 'Cinco instaladores registrados'
                                break
                            case 6: qtdins = 'Seis instaladores registrados'
                                break
                        }

                        Projeto.findOne({ _id: req.body.id }).then((projeto_salva) => {
                            projeto_salva.qtdequipe = ins_dentro.length
                            projeto_salva.save().then(() => {
                                var texto = qtdins + ' no projeto.'
                                ////console.log(qtdins)
                                sucesso.push({ texto: texto })
                                res.render('mdo/editformaequipe_first', { sucesso: sucesso, projeto: projeto, fora: ins_fora, dentro: ins_dentro })
                            }).catch((err) => {
                                req.flash('error_msg', 'Houve uma falha ao salvar o projeto.')
                                res.redirect('/projeto/consulta/')
                            })
                        }).catch((err) => {
                            req.flash('error_msg', 'Houve uma falha ao encontrar o projeto<1>.')
                            res.redirect('/projeto/consulta/')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Houve uma falha ao encontrar a equipe.')
                        res.redirect('/projeto/consulta')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao encontrar o instalador.')
                    res.redirect('/projeto/consulta')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Houve uma falha ao encontrar a equipe.')
                res.redirect('/projeto/consulta')
            })
        }

    }).catch((err) => {
        req.flash('error_msg', 'Houve uma falha ao encontrar o projeto.')
        res.redirect('/projeto/consulta')
    })


})

router.post('/salvarequipe/', ehAdmin, (req, res) => {
    const { _id } = req.user
    var sucesso = []

    var ins_dentro = []
    var ins_fora = []
    Projeto.findOne({ _id: req.body.id }).lean().then((projeto) => {
        Equipe.findOne({ projeto: projeto._id }).then((equipe_existe) => {
            if (equipe_existe != null) {
                equipe_existe.remove()
                //console.log('removido')
            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve uma falha ao encontrar a equipe.')
            res.redirect('/projeto/consulta')
        })
        const equipe_nova = {
            projeto: req.body.id,
            ins0: req.body.ins0,
            ins1: req.body.ins1,
            ins2: req.body.ins2,
            ins3: req.body.ins3,
            ins4: req.body.ins4,
            ins5: req.body.ins5
        }

        ////console.log(req.body.ins0, req.body.ins1, req.body.ins2)
        new Equipe(equipe_nova).save().then(() => {
            sucesso.push({ texto: 'Equipe registrada com suceso.' })
        }).catch((err) => {
            req.flash('error_msg', 'Houve uma falha ao salvar a equipe.')
            res.redirect('/projeto/consulta')
        })
        Pessoa.find({ funins: 'checked', user: _id }).lean().then((instaladores) => {

            const { ins0 } = equipe_nova
            const { ins1 } = equipe_nova
            const { ins2 } = equipe_nova
            const { ins3 } = equipe_nova
            const { ins4 } = equipe_nova
            const { ins5 } = equipe_nova            
            //console.log(ins0, ins1, ins2)

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
                            if (nome == ins3) {
                                ins_dentro.push({ ins: nome })
                            } else {
                                if (nome == ins4) {
                                    ins_dentro.push({ ins: nome })
                                } else {
                                    if (nome == ins5) {
                                        ins_dentro.push({ ins: nome })
                                    } else {
                                        ins_fora.push({ ins: nome })
                                    }
                                }
                            }
                        }
                    }
                }
            }
            //console.log(ins0, ins1, ins2)
            var qtdins
            switch (ins_dentro.length) {
                case 1: qtdins = 'Um instalador registrado'
                    break
                case 2: qtdins = 'Dois instaladores registrados'
                    break
                case 3: qtdins = 'Três instaladores registrados'
                    break
                case 4: qtdins = 'Quatro instaladores registrados'
                    break
                case 5: qtdins = 'Cinco instaladores registrados'
                    break
                case 6: qtdins = 'Seis instaladores registrados'
                    break
            }

            Projeto.findOne({ _id: req.body.id }).then((projeto_salva) => {
                projeto_salva.qtdequipe = ins_dentro.length
                projeto_salva.save().then(() => {
                    var texto = qtdins + ' no projeto.'
                    ////console.log(qtdins)
                    sucesso.push({ texto: texto })
                    res.render('mdo/editformaequipe_first', { sucesso: sucesso, projeto: projeto, fora: ins_fora, dentro: ins_dentro })
                }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao salvar o projeto.')
                    res.redirect('/projeto/consulta/')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Houve uma falha ao encontrar o projeto.')
                res.redirect('/projeto/consulta/')
            })

        }).catch((err) => {
            req.flash('error_msg', 'Houve uma falha ao encontrar o instalador.')
            res.redirect('/projeto/consulta')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve uma falha ao encontrar o projeto.')
        res.redirect('/projeto/consulta')
    })

})

router.get('/confirmadesativarequipe/:id', ehAdmin, (req, res) => {
    Equipe.findOne({ _id: req.params.id }).lean().then((equipe) => {
        res.render('mdo/confirmadesativarequipe', { equipe: equipe })
    })
})

router.get('/desativarequipe/:id', ehAdmin, (req, res) => {
    Equipe.findOne({ _id: req.params.id }).then((equipe) => {
        equipe.ativo = false
        equipe.save().then(() => {
            req.flash('success_msg', 'Equipe desativada com sucesso.')
            res.redirect('/pessoa/consultaequipepadrao')
        })
    })
})

router.post('/criarequipepadrao', ehAdmin, (req, res) => {
    const { _id } = req.user
    var sucesso = []

    const novaequipe = new Equipe({
        user: _id,
        ativo: true,
        nome: req.body.nome,
        ins0: req.body.ins0,
        ins1: req.body.ins1,
        ins2: req.body.ins2,
        ins3: req.body.ins3,
        ins4: req.body.ins4,
        ins5: req.body.ins5
    })

    //console.log(req.body.ins0, req.body.ins1, req.body.ins2)
    novaequipe.save().then(() => {
        Equipe.find({ user: _id, ativo: true }).lean().then((equipe) => {
            req.flash('success_msg', 'Equipe padrão criada com suecesso.')
            res.redirect('/pessoa/consultaequipepadrao')
        }).catch((err) => {
            req.flash('error_msg', 'Houve uma falha ao encontrar a equipe.')
            res.redirect('/pessoa/consultaequipepadrao')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve uma falha ao salvar a equipe.')
        res.redirect('/pessoa/consultaequipepadrao')
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

router.get('/confirmaexclusaoequipe/:id', ehAdmin, (req, res) => {
    Equipe.findOne({ _id: req.params.id }).lean().then((equipe) => {
        res.render('mdo/confirmaexclusaoequipe', { equipe: equipe })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar a equipe')
        res.redirect('/projeto/consulta')
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
    const { _id } = req.user
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

router.get('/removerequipe/:id', ehAdmin, (req, res) => {
    var erros = []
    Projeto.findOne({ equipe: req.params.id }).lean().then((projeto) => {
        if (projeto != null) {
            erros.push({ texto: 'Não é possível excluir esta equipe pois já vinculada a um projeto. Você pode desativar a equipe voltando para a tela principal de formação de equipes.' })
            res.render('mdo/consultaequipepadrao', { erros: erros })
        } else {
            Equipe.findOneAndDelete({ _id: req.params.id }).then(() => {
                req.flash('success_msg', 'Equipe excluida com sucesso')
                res.redirect('/pessoa/consultaequipepadrao')
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao excluir a pessoa.')
                res.redirect('/consulta')
            })

        }
    })
})

router.get('/consulta', ehAdmin, (req, res) => {
    const { _id } = req.user
    Pessoa.find({ user: _id }).lean().then((pessoas) => {
        res.render('mdo/findpessoas', { pessoas: pessoas })
    }).catch((err) => {
        req.flash('error_msg', 'Não foram encontradas pessoas cadastradas')
        res.redirect('/pessoa')
    })
})

router.get('/vermais/:id', ehAdmin, (req, res) => {
    Pessoa.findOne({ _id: req.params.id }).lean().then((pessoa) => {
        Projeto.find({ funres: pessoa._id }).sort({ dataord: 'asc' }).lean().then((prjres) => {
            Projeto.find({ funins: pessoa._id }).sort({ dataord: 'desc' }).lean().then((prjins) => {
                Projeto.find({ funpro: pessoa._id }).sort({ dataord: 'desc' }).lean().then((prjpro) => {
                    var qtdres = prjres.length
                    var qtdins = prjins.length
                    var qtdpro = prjpro.length
                    res.render('mdo/vermais', { pessoa: pessoa, prjres: prjres, prjins: prjins, prjpro: prjpro, qtdres: qtdres, qtdpro: qtdpro, qtdins: qtdins })
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
    const { _id } = req.user
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

    /*Obrigatoriedade de adicionar foto
    if (req.file == null) {
        erros.push({ texto: 'Deve ser adicionada uma foto' })
    }
    */
    if (req.body.iniati == null || req.body.iniati == '') {
        erros.push({ texto: 'Deve ser adicionada uma data de inicio das atividades' })
    }

    if (req.body.ehVendedor != 'true') {
        ehVendedor = false
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
    } else {
        ehVendedor = true
    }

    if (erros.length > 0) {
        res.render('mdo/addpessoas', { erros: erros })
    } else {
        //Validando Manutenção de Inversores
        if (req.body.maninv != null) {
            maninv = 'checked'
        } else {
            maninv = 'unchecked'
        }
        //Validando Substituição de Componentes
        if (req.body.subcom != null) {
            subcom = 'checked'
        } else {
            subcom = 'unchecked'
        }
        //Validando Reposicionamento de Equipamento
        if (req.body.repequ != null) {
            repequ = 'checked'
        } else {
            repequ = 'unchecked'
        }
        //Validando Vistoria
        if (req.body.vistor != null) {
            vistor = 'checked'
        } else {
            vistor = 'unchecked'
        }
        //Validando Diagnóstico e Laudo
        if (req.body.dlaudo != null) {
            dlaudo = 'checked'
        } else {
            dlaudo = 'unchecked'
        }
        //Validando Limpeza de Módulos
        if (req.body.limmod != null) {
            limmod = 'checked'
        } else {
            limmod = 'unchecked'
        }

        //Validando função gestor
        if (req.body.funges != null) {
            funges = 'checked'
        } else {
            funges = 'unchecked'
        }
        //Validando função 
        if (req.body.funpro != null) {
            funpro = 'checked'
        } else {
            funpro = 'unchecked'
        }
        //Validando Limpeza de Módulos
        if (req.body.funins != null) {
            funins = 'checked'
        } else {
            funins = 'unchecked'
        }

        var cnpj
        var cpf
        if (req.body.cnpj != '') {
            cnpj = req.body.cnpj
        }
        if (req.body.cpf != '') {
            cpf = req.body.cpf
        }
        var percom
        if (ehVendedor == true) {
            percom = req.body.percom
        } else {
            percom = 0
        }

        var foto
        if (req.file != null) {
            foto = req.file.filename
        } else {
            foto = ''
        }

        const pessoa = {
            user: _id,
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
            foto: foto,
            ehVendedor: ehVendedor,
            percom: percom
            //certificado: req.file.filename
        }
        new Pessoa(pessoa).save().then(() => {
            var sucesso = []
            if (ehVendedor == true) {
                sucesso.push({ texto: 'Vendedor adicionado com sucesso' })
            } else {
                sucesso.push({ texto: 'Pessoa adicionada com sucesso' })
            }
            Pessoa.findOne({ user: _id }).sort({ field: 'asc', _id: -1 }).lean().then((pessoa) => {
                res.render('mdo/editpessoas', { sucesso: sucesso, pessoa: pessoa })
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

    var ehVendedor
    if (req.body.ehVendedor != 'true') {
        ehVendedor = false
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
    } else {
        ehVendedor = true
    }


    if (erros.length > 0) {
        Pessoa.findOne({ _id: req.body.id }).lean().then((pessoa) => {
            res.render('mdo/editpessoas', { pessoa: pessoa, erros: erros })
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível encontrar a pessoa')
            res.redirect('/pessoa/consulta')
        })
    } else {
        //Validando manuentção de inversores
        if (req.body.maninv != null) {
            maninv = 'checked'
        } else {
            maninv = 'unchecked'
        }
        //Validando Substituição de Componentes
        if (req.body.subcom != null) {
            subcom = 'checked'
        } else {
            subcom = 'unchecked'
        }
        //Validando Reposicionamento de Equipamento
        if (req.body.repequ != null) {
            repequ = 'checked'
        } else {
            repequ = 'unchecked'
        }
        //Validando Vistoria
        if (req.body.vistor != null) {
            vistor = 'checked'
        } else {
            vistor = 'unchecked'
        }
        //Validando Diagnóstico e Laudo
        if (req.body.dlaudo != null) {
            dlaudo = 'checked'
        } else {
            dlaudo = 'unchecked'
        }
        //Validando Limpeza de Módulos
        if (req.body.limmod != null) {
            limmod = 'checked'
        } else {
            limmod = 'unchecked'
        }

        //Validando função gestor
        if (req.body.funges != null) {
            funges = 'checked'
        } else {
            funges = 'unchecked'
        }
        //Validando função 
        if (req.body.funpro != null) {
            funpro = 'checked'
        } else {
            funpro = 'unchecked'
        }
        //Validando Limpeza de Módulos
        if (req.body.funins != null) {
            funins = 'checked'
        } else {
            funins = 'unchecked'
        }

        var cnpj
        var cpf
        if (req.body.cnpj != '') {
            cnpj = req.body.cnpj
        }
        if (req.body.cpf != '') {
            cpf = req.body.cpf
        }
        var percom
        if (ehVendedor == true) {
            percom = req.body.percom
        } else {
            percom = 0
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
            pessoa.percom = req.body.percom
            pessoa.ehVendedor = ehVendedor

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
    const { _id } = req.user
    var cidade = req.body.cidade
    var uf = req.body.uf
    var nome = req.body.nome
    var funins
    var funges
    var funpro
    var ehVendedor
    var funcao = req.body.funcao
    switch (funcao) {
        case 'Instalador': funins = 'checked', funges = 'unchecked', funpro = 'unchecked', ehVendedor = false;
            break;
        case 'Projetisa': funins = 'unchecked', funges = 'unchecked', funpro = 'checked', ehVendedor = false;
            break;
        case 'Gestor': funins = 'unchecked', funges = 'checked', funpro = 'unchecked', ehVendedor = false;
            break;
        case 'Vendedor': funins = 'unchecked', funges = 'unchecked', funpro = 'unchecked', ehVendedor = true;
            break;
    }
    //console.log('funcao=>' + funcao)
    //console.log('funins=>' + funins)
    //console.log('funges=>' + funges)
    //console.log('funpro=>' + funpro)
    //console.log('ehVendedor=>' + ehVendedor)

    if (nome != '' && uf != '' && cidade != '' && funcao != 'Todos') {
        Pessoa.find({ nome: new RegExp(nome), uf: new RegExp(uf), cidade: new RegExp(cidade), funins: funins, funges: funges, funpro: funpro, ehVendedor: ehVendedor, user: _id }).lean().then((pessoas) => {
            res.render('mdo/findpessoas', { pessoas: pessoas, cidade: cidade, uf: uf, nome: nome, funcao: funcao })
        })
    } else {
        if (nome == '' && cidade == '' && uf == '' && funcao == 'Todos') {
            Pessoa.find({ user: _id }).lean().then((pessoas) => {
                res.render('mdo/findpessoas', { pessoas: pessoas, cidade: cidade, uf: uf, nome: nome, funcao: funcao })
            })
        } else {

            if (funcao == 'Todos') {

                if (nome == '' && cidade == '') {
                    Pessoa.find({ uf: new RegExp(uf), user: _id }).lean().then((pessoas) => {
                        res.render('mdo/findpessoas', { pessoas: pessoas, cidade: cidade, uf: uf, nome: nome, funcao: funcao })
                    })
                } else {
                    if (nome == '' && uf == '') {
                        Pessoa.find({ cidade: new RegExp(cidade), user: _id }).lean().then((pessoas) => {
                            res.render('mdo/findpessoas', { pessoas: pessoas, cidade: cidade, uf: uf, nome: nome, funcao: funcao })
                        })
                    } else {
                        if (cidade == '' && uf == '') {
                            Pessoa.find({ nome: new RegExp(nome), user: _id }).lean().then((pessoas) => {
                                res.render('mdo/findpessoas', { pessoas: pessoas, cidade: cidade, uf: uf, nome: nome, funcao: funcao })
                            })
                        } else {
                            if (cidade == '') {
                                Pessoa.find({ nome: new RegExp(nome), uf: new RegExp(uf), user: _id }).lean().then((pessoas) => {
                                    res.render('mdo/findpessoas', { pessoas: pessoas, cidade: cidade, uf: uf, nome: nome, funcao: funcao })
                                })
                            } else {
                                if (uf == '') {
                                    Pessoa.find({ nome: new RegExp(nome), cidade: new RegExp(cidade), user: _id }).lean().then((pessoas) => {
                                        res.render('mdo/findpessoas', { pessoas: pessoas, cidade: cidade, uf: uf, nome: nome, funcao: funcao })
                                    })
                                } else {
                                    Pessoa.find({ cidade: new RegExp(cidade), uf: new RegExp(uf), user: _id }).lean().then((pessoas) => {
                                        res.render('mdo/findpessoas', { pessoas: pessoas, cidade: cidade, uf: uf, nome: nome, funcao: funcao })
                                    })
                                }
                            }
                        }
                    }
                }

            } else {
                if (nome == '' && cidade == '' && uf == '') {
                    Pessoa.find({ funins: funins, funges: funges, funpro: funpro, ehVendedor: ehVendedor, user: _id }).lean().then((pessoas) => {
                        res.render('mdo/findpessoas', { pessoas: pessoas, cidade: cidade, uf: uf, nome: nome, funcao: funcao })
                    })
                } else {
                    if (nome == '' && cidade == '') {
                        Pessoa.find({ uf: new RegExp(uf), funins: funins, funges: funges, funpro: funpro, ehVendedor: ehVendedor, user: _id }).lean().then((pessoas) => {
                            res.render('mdo/findpessoas', { pessoas: pessoas, cidade: cidade, uf: uf, nome: nome, funcao: funcao })
                        })
                    } else {
                        if (nome == '' && uf == '') {
                            Pessoa.find({ cidade: new RegExp(cidade), funins: funins, funges: funges, funpro: funpro, ehVendedor: ehVendedor, user: _id }).lean().then((pessoas) => {
                                res.render('mdo/findpessoas', { pessoas: pessoas, cidade: cidade, uf: uf, nome: nome, funcao: funcao })
                            })
                        } else {
                            if (cidade == '' && uf == '') {
                                Pessoa.find({ nome: new RegExp(nome), funins: funins, funges: funges, funpro: funpro, ehVendedor: ehVendedor, user: _id }).lean().then((pessoas) => {
                                    res.render('mdo/findpessoas', { pessoas: pessoas, cidade: cidade, uf: uf, nome: nome, funcao: funcao })
                                })
                            } else {
                                if (cidade == '') {
                                    Pessoa.find({ nome: new RegExp(nome), uf: new RegExp(uf), funins: funins, funges: funges, funpro: funpro, ehVendedor: ehVendedor, user: _id }).lean().then((pessoas) => {
                                        res.render('mdo/findpessoas', { pessoas: pessoas, cidade: cidade, uf: uf, nome: nome, funcao: funcao })
                                    })
                                } else {
                                    if (uf == '') {
                                        Pessoa.find({ nome: new RegExp(nome), cidade: new RegExp(cidade), funins: funins, funges: funges, funpro: funpro, ehVendedor: ehVendedor, user: _id }).lean().then((pessoas) => {
                                            res.render('mdo/findpessoas', { pessoas: pessoas, cidade: cidade, uf: uf, nome: nome, funcao: funcao })
                                        })
                                    } else {
                                        Pessoa.find({ cidade: new RegExp(cidade), uf: new RegExp(uf), funins: funins, funges: funges, funpro: funpro, ehVendedor: ehVendedor, user: _id }).lean().then((pessoas) => {
                                            res.render('mdo/findpessoas', { pessoas: pessoas, cidade: cidade, uf: uf, nome: nome, funcao: funcao })
                                        })
                                    }
                                }
                            }
                        }
                    }

                }
            }
        }

    }

})

module.exports = router