const express = require('express')
const router = express.Router()
const app = express()
const multer = require('multer')
const multerS3 = require("multer-s3")
const aws = require("aws-sdk")

app.set('view engine', 'ejs')

var credentials = new aws.SharedIniFileCredentials({ profile: 'vimmusimg' })
aws.config.credentials = credentials

var s3 = new aws.S3()

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'quasatimg',
        key: function (req, file, cb) {
            //console.log(file)
            cb(null, file.originalname)
        }
    })
})

require('../model/Pessoa')
require('../model/Equipe')
require('../model/Vistoria')
require('../model/Projeto')
require('../model/Cliente')
require('../model/Acesso')
const mongoose = require('mongoose')

const Pessoa = mongoose.model('pessoa')
const Equipe = mongoose.model('equipe')
const Cliente = mongoose.model('cliente')
const Projeto = mongoose.model('projeto')
const Acesso = mongoose.model('acesso')

const { ehAdmin } = require('../helpers/ehAdmin')
const dataMensagem = require('../resources/dataMensagem')
const naoVazio = require('../resources/naoVazio')

router.use(express.static('public/'))
router.use(express.static('public/upload'))

router.get('/consultaequipepadrao', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }
    Equipe.find({ user: id, ativo: true }).lean().then((equipe) => {
        res.render('mdo/consultaequipepadrao', { equipe: equipe })
    })
})

router.get('/novaequipepadrao/', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }
    Pessoa.find({ funins: 'checked', user: id }).lean().then((instaladores) => {
        res.render('mdo/novaequipepadrao', { instaladores })
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar o instalador')
        res.redirect('/pessoa/consulta')
    })
})

router.get('/formaequipe/:id', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }

    Equipe.findOne({ projeto: req.params.id }).lean().then((equipe) => {
        Pessoa.find({ funins: 'checked', user: id }).lean().then((instaladores) => {
            if (equipe != null) {

                var ins_dentro = []
                var ins_fora = []
                const { ins0 } = equipe
                const { ins1 } = equipe
                const { ins2 } = equipe
                const { ins3 } = equipe
                const { ins4 } = equipe
                const { ins5 } = equipe

                //console.log(ins0, ins1, ins2, ins3, ins4, ins5)

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

                res.render('mdo/editformaequipe_first', { fora: ins_fora, dentro: ins_dentro })

            } else {
                Equipe.find({ user: id, ativo: true }).lean().then((equipe) => {
                    res.render('mdo/formaequipe_first', { instaladores: instaladores, equipe: equipe })
                })
            }
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao encontrar o instalador')
            res.redirect('/pessoa/consulta')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve uma falha ao encontrar a equipe')
        res.redirect('/pessoa/consulta')
    })
})

router.post('/criarequipe', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }
    var sucesso = []

    var ins_dentro = []
    var ins_fora = []


    Equipe.findOne({ projeto: req.body.id }).then((equipe_existe) => {
        if (equipe_existe != null) {
            equipe_existe.remove()
            ////console.log('removido')
        }
    }).catch((err) => {
        req.flash('error_msg', 'Houve uma falha ao encontrar a equipe.')
        res.redirect('/projeto/consulta')
    })

    if (req.body.id_equipe == 'Nenhuma equipe selecionada' || req.body.id_equipe == 'Nenhuma equipe padrão cadastrada') {
        //console.log('É manual')
        const equipe = {
            projeto: req.body.id,
            user: id,
            nome_projeto: projeto.nome,
            ins0: req.body.ins0,
            ins1: req.body.ins1,
            ins2: req.body.ins2,
            ins3: req.body.ins3,
            ins4: req.body.ins4,
            ins5: req.body.ins5,
            ehpadrao: true
        }


        new Equipe(equipe).save().then(() => {
            sucesso.push({ texto: 'Equipe registrada com suceso.' })
        }).catch((err) => {
            req.flash('error_msg', 'Houve uma falha ao salvar a equipe<NE>.')
            res.redirect('/projeto/consulta')
        })

        Pessoa.find({ funins: 'checked', user: id }).lean().then((instaladores) => {

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


            //////console.log(qtdins)
            sucesso.push({ texto: texto })
            res.render('mdo/editformaequipe_first', { sucesso, fora: ins_fora, dentro: ins_dentro })


        }).catch((err) => {
            req.flash('error_msg', 'Houve uma falha ao encontrar o instalador.')
            res.redirect('/projeto/consulta')
        })
    } else {
        Equipe.findOne({ _id: req.body.id_equipe }).lean().then((equipe) => {
            //console.log('equipe padrão')
            const equipe_nova = {
                projeto: req.body.id,
                user: id,
                nome_projeto: projeto.nome,
                ins0: equipe.ins0,
                ins1: equipe.ins1,
                ins2: equipe.ins2,
                ins3: equipe.ins3,
                ins4: equipe.ins4,
                ins5: equipe.ins5,
            }

            //console.log('id=>' + equipe._id)
            //console.log('ins0=>' + equipe.ins0)
            //console.log('ins1=>' + equipe.ins1)
            //console.log('ins2=>' + equipe.ins2)
            //console.log('ins3=>' + equipe.ins3)
            //console.log('ins4=>' + equipe.ins4)
            //console.log('ins5=>' + equipe.ins5)


            new Equipe(equipe_nova).save().then(() => {
                sucesso.push({ texto: 'Equipe registrada com suceso.' })
            }).catch((err) => {
                req.flash('error_msg', 'Houve uma falha ao salvar a equipe.')
                res.redirect('/projeto/consulta')
            })
            Pessoa.find({ funins: 'checked', user: id }).lean().then((instaladores) => {
                Equipe.findOne({ projeto: req.body.id }).then((equipe) => {
                    const { ins0 } = equipe
                    const { ins1 } = equipe
                    const { ins2 } = equipe
                    const { ins3 } = equipe
                    const { ins4 } = equipe
                    const { ins5 } = equipe
                    //console.log(ins0, ins1, ins2, ins3, ins4, ins5)

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
                    ////console.log(ins0, ins1, ins2)
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
                    //console.log(qtdins)
                    sucesso.push({ texto: texto })
                    res.render('mdo/editformaequipe_first', { sucesso: sucesso, projeto: projeto, fora: ins_fora, dentro: ins_dentro })

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
})

router.post('/salvarequipe/', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }
    var sucesso = []

    var ins_dentro = []
    var ins_fora = []

    Equipe.findOne({ projeto: req.body.id }).then((equipe_existe) => {
        if (equipe_existe != null) {
            equipe_existe.remove()
            ////console.log('removido')
        }
    }).catch((err) => {
        req.flash('error_msg', 'Houve uma falha ao encontrar a equipe.')
        res.redirect('/projeto/consulta')
    })
    const equipe_nova = {
        projeto: req.body.id,
        nome_projeto: projeto.nome,
        ins0: req.body.ins0,
        ins1: req.body.ins1,
        ins2: req.body.ins2,
        ins3: req.body.ins3,
        ins4: req.body.ins4,
        ins5: req.body.ins5
    }

    //////console.log(req.body.ins0, req.body.ins1, req.body.ins2)
    new Equipe(equipe_nova).save().then(() => {
        sucesso.push({ texto: 'Equipe registrada com suceso.' })
    }).catch((err) => {
        req.flash('error_msg', 'Houve uma falha ao salvar a equipe.')
        res.redirect('/projeto/consulta')
    })
    Pessoa.find({ funins: 'checked', user: id }).lean().then((instaladores) => {

        const { ins0 } = equipe_nova
        const { ins1 } = equipe_nova
        const { ins2 } = equipe_nova
        const { ins3 } = equipe_nova
        const { ins4 } = equipe_nova
        const { ins5 } = equipe_nova
        ////console.log(ins0, ins1, ins2)

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
        ////console.log(ins0, ins1, ins2)
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

        //////console.log(qtdins)
        sucesso.push({ texto: texto })
        res.render('mdo/editformaequipe_first', { sucesso: sucesso, projeto: projeto, fora: ins_fora, dentro: ins_dentro })
    }).catch((err) => {
        req.flash('error_msg', 'Houve uma falha ao encontrar o instalador.')
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
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }

    var custo = 0
    var idins = []

    Pessoa.find({ user: id }).then((pessoas) => {
        pessoas.forEach((element) => {
            //console.log('element.nome=>' + element.nome)
            //console.log('req.body.ins0=>' + req.body.ins0)
            if (element.custo != '' && typeof element.custo != 'undefined') {
                if (element.nome == req.body.ins0) {
                    custo = custo + element.custo
                }
                if (element.nome == req.body.ins1) {
                    custo = custo + element.custo
                }
                if (element.nome == req.body.ins2) {
                    custo = custo + element.custo
                }
                if (element.nome == req.body.ins3) {
                    custo = custo + element.custo
                }
                if (element.nome == req.body.ins4) {
                    custo = custo + element.custo
                }
                if (element.nome == req.body.ins5) {
                    custo = custo + element.custo
                }
            }
        })


        if (custo == '' || custo == 0) {
            custo = req.body.custo
        }

        if (req.body.idins0 != '') {
            idins = { idins0: req.body.idins0, }
        }
        if (req.body.idins1 != '') {
            idins = idins + { idins1: req.body.idins1, }
        }
        if (req.body.idins2 != '') {
            idins = idins + { idins2: req.body.idins2, }
        }
        if (req.body.idins3 != '') {
            idins = idins + { idins3: req.body.idins3, }
        }
        if (req.body.idins4 != '') {
            idins = idins + { idins4: req.body.idins4, }
        }
        if (req.body.idins5 != '') {
            idins = idins + { idins5: req.body.idins5, }
        }
        //console.log('idins=>' + idins)
        const corpo = {
            user: id,
            ativo: true,
            nome: req.body.nome,
            custoins: custo,
            ins0: req.body.ins0,
            ins1: req.body.ins1,
            ins2: req.body.ins2,
            ins3: req.body.ins3,
            ins4: req.body.ins4,
            ins5: req.body.ins5,
            ehpadrao: true,
        }
        var novaequipe = Object.assign(idins, corpo)
        //console.log('novaequipe=>' + novaequipe)
        new Equipe(novaequipe).save().then(() => {
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
    res.render('mdo/pessoas', { aviso: aviso })

})

router.get('/edicao/:id', ehAdmin, (req, res) => {
    var vendedor = false
    var checkCPF = 'unchecked'
    var checkCNPJ = 'unchecked'
    var ehcpf = ''
    var ehcnpj = ''

    Pessoa.findOne({ _id: req.params.id }).lean().then((pessoa) => {
        //console.log('foto=>'+pessoa.foto)
        if (pessoa.vendedor == 'checked') {
            vendedor = true
        }

        if (naoVazio(pessoa.cpf)){
            checkCPF = 'checked'
            ehcpf = ''
            ehcnpj = 'none'
        }

        if (naoVazio(pessoa.cnpj)){
            checkCNPJ = 'checked'
            ehcpf = 'none'
            ehcnpj = ''
        }
        console.log('pessoa.cnpj=>'+pessoa.cnpj)
        console.log('ehcpf=>'+ehcpf)
        console.log('ehcnpj=>'+ehcnpj)
        console.log('checkCNPJ=>'+checkCNPJ)
        console.log('checkCPF=>'+checkCPF)

        res.render('mdo/pessoas', { pessoa, vendedor, ehcpf, ehcnpj, checkCNPJ, checkCPF })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao encontrar a pessoa.')
        res.redirect('/pessoa/consulta')
    })
})

router.get('/confirmaexclusaoequipe/:id', ehAdmin, (req, res) => {
    Equipe.findOne({ _id: req.params.id }).lean().then((equipe) => {
        res.render('mdo/confirmaexclusaoequipe', { equipe: equipe })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar a equipe')
        res.redirect('/menu')
    })
})

router.get('/confirmaexclusao/:id', ehAdmin, (req, res) => {
    Pessoa.findOne({ _id: req.params.id }).lean().then((pessoa) => {
        res.render('mdo/confirmaexclusao', { pessoa: pessoa })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar o projeto')
        res.redirect('/menu')
    })
})

router.get('/remover/:id', ehAdmin, (req, res) => {
    //console.log('req.params.id=>' + req.params.id)
    Projeto.findOne({ vendedor: req.params.id }).then((prj_ven) => {
        //console.log('prj_ven=>' + prj_ven)
        if (naoVazio(prj_ven)) {
            req.flash('error_msg', 'Não é possível excluir este vendedor pois está vinculado a propostas.')
            res.redirect('/pessoa/consulta')
        } else {
            Projeto.findOne({ responsavel: req.params.id }).then((prj_res) => {
                //console.log('prj_res=>' + prj_res)
                if (naoVazio(prj_res)) {
                    req.flash('error_msg', 'Não é possível excluir este orcamentista pois está vinculado a propostas.')
                    res.redirect('/pessoa/consulta')
                } else {
                    Equipe.findOne({ insres: req.params.id }).then((equipe) => {
                        //console.log('equipe=>' + equipe)
                        if (naoVazio(equipe)) {
                            req.flash('error_msg', 'Não é possível excluir este instalador pois está vinculada a obras.')
                            res.redirect('/pessoa/consulta')
                        } else {
                            Pessoa.findOneAndDelete({ _id: req.params.id }).then(() => {
                                Acesso.findOneAndDelete({ pessoa: req.params.id }).then(() => {
                                    req.flash('success_msg', 'Pessoa excluida com sucesso')
                                    res.redirect('/pessoa/consulta')
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
                        res.redirect('/pessoa/consulta')
                    })
                }
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao encontrar o projeto.')
                res.redirect('/pessoa/consulta')
            })
        }
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao encontrar o projeto.')
        res.redirect('/pessoa/consulta')
    })
})

router.get('/removerequipe/:id', ehAdmin, (req, res) => {
    var erros = []
    Projeto.findOne({ equipe: req.params.id }).lean().then((projeto) => {
        if (projeto != null) {
            erros.push({ texto: 'Não é possível excluir esta equipe pois já vinculada a uma projeto. Você pode desativar a equipe voltando para a tela principal de formação de equipes.' })
            res.render('mdo/consultaequipepadrao', { erros })
        } else {
            Equipe.findOneAndDelete({ _id: req.params.id }).then(() => {
                req.flash('success_msg', 'Equipe excluida com sucesso')
                res.redirect('/pessoa/consultaequipepadrao')
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao excluir a pessoa.')
                res.redirect('/pessoa/consulta')
            })

        }
    })
})

router.get('/consulta', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }
    Pessoa.find({ user: id }).lean().then((pessoas) => {
        res.render('mdo/consulta', { pessoas: pessoas })
    }).catch((err) => {
        req.flash('error_msg', 'Não foram encontradas pessoas cadastradas')
        res.redirect('/pessoa')
    })
})

router.get('/vermais/:id', ehAdmin, (req, res) => {
    var projetos_ven = []
    var projetos_pla = []
    var projetos_pro = []
    var projetos_vis = []
    var projetos_ate = []
    var projetos_ins = []
    var projetos_eae = []
    var projetos_pnl = []
    var projetos_inv = []
    var dataord_ven
    var dataord_pla
    var dataord_vis
    var dataord_pro
    var dataord_ate
    var dataord_inv
    var dataord_pnl
    var dataord_eae
    var dataord_ins
    q = 0
    var datafim
    var dataini
    var nome_cliente
    var funcao
    var aviso = []

    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }
    Pessoa.find({ user: id }).lean().then((pessoas) => {
        Pessoa.findOne({ _id: req.params.id, user: id }).lean().then((pessoa) => {
            //console.log('pessoa.funins=>' + pessoa.funins)
            if (pessoa.vendedor == 'checked') {
                //console.log(pessoa.nome)
                //console.log('user=>' + _id)
                //console.log('pessoa.nome=>' + pessoa.nome)
                //BUSCA VENDEDOR
                Projeto.find({ vendedor: pessoa._id }).then((projeto) => {
                    projeto.forEach((e) => {
                        //console.log('encontrou vendedor')
                        if (e.cliente != '' && typeof e.cliente != 'undefined') {
                            Cliente.findOne({ _id: e.cliente }).then((cliente) => {
                                //console.log('encontrou cliente')
                                const { nome } = e
                                const { dataini } = e
                                const { datafim } = e
                                nome_cliente = cliente.nome
                                const { _id } = e
                                dataord_ven = dataMensagem(e.valDataIni)
                                q = q + 1
                                proposta_ven.push({ funcao: 'Vendedor', nome_cliente, id: _id, nome: nome, dataini: dataini, datafim: datafim, foiRealiado: element.foiRealizado, dataord_ven })

                                if (projeto.length == q) {
                                    proposta_ven.sort(function (a, b) {
                                        if (a.dataord_ven > b.dataord_ven) {
                                            return 1;
                                        }
                                        if (a.dataord_ven < b.dataord_ven) {
                                            return -1;
                                        }
                                        return 0;
                                    })
                                    //console.log('proposta_ven=>' + proposta_ven)
                                    res.render('mdo/vermais', { proposta_ven, total_ven: proposta_ven.length, pessoa: pessoa.nome })
                                }
                            }).catch((err) => {
                                req.flash('error_msg', 'Não foi encontrado o cliente.')
                                res.redirect('/pessoa/consulta')
                            })
                        } else {
                            aviso.push({ texto: 'Este vendedor esta livre! Não foi alocado em nenhum projeto.' })
                            res.render('mdo/consulta', { pessoas, aviso })
                        }
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Não foi encontrado o projeto.')
                    res.redirect('/pessoa/consulta')
                })
            }
        }).catch((err) => {
            req.flash('error_msg', 'Não foram encontradas pessoas.')
            res.redirect('/pessoa/consulta')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Não foram encontradas pessoas cadastradas')
        res.redirect('/pessoa')
    })
})

router.post('/salvar', upload.single('files'), ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }

    var funges
    var acessoGes
    var funins
    var acessoIns
    var funorc
    var acessoOrc
    var vendedor
    var acessoVendedor
    var erros = []
    var documento

    if (req.body.cnpj != '') {
        documento = req.body.cnpj
    } else {
        documento = req.body.cpf
    }

    if (req.body.nome == '' || req.body.endereco == '' || documento == '' ||
        req.body.celular == '' || req.body.email == '') {
        erros.push({ texto: 'Todos os campos de descrição são obrigatórios' })
    }

    if (req.body.iniati == null || req.body.iniati == '') {
        erros.push({ texto: 'Deve ser adicionada uma data de inicio das atividades' })
    }

    if (erros.length > 0) {
        res.render('mdo/pessoas', { erros: erros })
    } else {
        //Validando função gestor
        if (naoVazio(req.body.funges)) {
            funges = 'checked'
            acessoGes = true
        } else {
            funges = 'unchecked'
            acessoGes = false
        }
        //Validando função orçamentista
        if (naoVazio(req.body.funorc)) {
            funorc = 'checked'
            acessoOrc = true
        } else {
            funorc = 'unchecked'
            acessoOrc = false
        }
        //Validando função instalador
        if (naoVazio(req.body.funins)) {
            funins = 'checked'
            acessoIns = true
        } else {
            funins = 'unchecked'
            acessoIns = false
        }
        //Validando função vendedor
        if (naoVazio(req.body.vendedor)) {
            vendedor = 'checked'
            acessoVendedor = true
        } else {
            vendedor = 'unchecked'
            acessoVendedor = false
        }

        var cnpj
        var cpf
        if (req.body.cnpj != '') {
            cnpj = req.body.cnpj
        }
        if (req.body.cpf != '') {
            cpf = req.body.cpf
        }

        //console.log('req.file=>' + req.file)
        var foto
        if (naoVazio(req.file)) {
            foto = req.file.originalname
        } else {
            foto = ''
        }
        //console.log('foto=>' + foto)
        if (naoVazio(req.body.id)) {
            Pessoa.findOne({ _id: req.body.id }).then((pessoa) => {
                pessoa.nome = req.body.nome
                pessoa.endereco = req.body.endereco
                // console.log('req.body.uf=>'+req.body.uf)
                if (naoVazio(req.body.uf)) {
                    pessoa.uf = req.body.uf
                }
                // console.log('req.body.cidade=>'+req.body.cidade)
                if (naoVazio(req.body.cidade)) {
                    pessoa.cidade = req.body.cidade
                }
                pessoa.cnpj = cnpj
                pessoa.cpf = cpf
                pessoa.iniati = req.body.iniati
                pessoa.celular = req.body.celular
                pessoa.email = req.body.email
                pessoa.funges = funges
                pessoa.funorc = funorc
                pessoa.funins = funins
                pessoa.vendedor = vendedor
                if (naoVazio(foto)) {
                    pessoa.foto = foto
                } else {
                    pessoa.foto = pessoa.foto
                }
                if (pessoa.vendedor == 'checked') {
                    pessoa.seq = req.body.seq
                    pessoa.const = req.body.const
                }
                pessoa.save().then(() => {
                    Acesso.findOne({ pessoa: pessoa._id }).then((acesso) => {
                        console.log("acesso=>"+acesso)
                        if (naoVazio(acesso)) {
                            console.log('acessoGes=>'+acessoGes)
                            acesso.funges = acessoGes
                            console.log('acessoIns=>'+acessoIns)
                            acesso.instalador = acessoIns
                            console.log('acessoOrc=>'+acessoOrc)
                            acesso.orcamentista = acessoOrc
                            console.log('acessoVendedor=>'+acessoVendedor)
                            acesso.vendedor = acessoVendedor
                            acesso.save().then(() => {
                                req.flash('success_msg', 'Alterações salvas com sucesso')
                                res.redirect('/pessoa/edicao/' + req.body.id)
                            })
                        } else {
                            req.flash('success_msg', 'Alterações salvas com sucesso')
                            res.redirect('/pessoa/edicao/' + req.body.id)
                        }
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Não foi possível cadastrar a pessoa')
                    res.redirect('/pessoa/consulta')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Não foi possível encontrar a pessoa')
                res.redirect('/pessoa/consulta')
            })
        } else {
            const pessoa = {
                user: id,
                nome: req.body.nome,
                endereco: req.body.endereco,
                cidade: req.body.cidade,
                uf: req.body.uf,
                cnpj: cnpj,
                cpf: cpf,
                iniati: req.body.iniati,
                celular: req.body.celular,
                email: req.body.email,
                funges: funges,
                funins: funins,
                funorc: funorc,
                foto: foto,
                vendedor: vendedor,
                seq: req.body.seq
            }
            new Pessoa(pessoa).save().then(() => {
                Pessoa.findOne({ user: id }).sort({ field: 'asc', _id: -1 }).lean().then((pessoa) => {
                    if (vendedor == 'checked') {
                        req.flash('success_msg', 'Vendedor adicionado com sucesso')
                    } else {
                        req.flash('success_msg', 'Pessoa adicionada com sucesso')
                    }
                    res.redirect('/pessoa/edicao/' + pessoa._id)
                }).catch((err) => {
                    req.flash('error_msg', 'Não foi possível encontrar a pessoa')
                    res.redirect('/pessoa/novo')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Não foi possível cadastrar a pessoa')
                res.redirect('/pessoa/novo')
            })
        }
    }
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

    var sql = []
    var sqlAux = []
    var sqlFuncao = []

    var cidade = req.body.cidade
    var uf = req.body.uf
    var nome = req.body.nome
    var funins
    var funges
    var vendedor
    var funcao = req.body.funcao

    var sqlFuncao = { user: id, nome: new RegExp(nome), uf: new RegExp(uf), cidade: new RegExp(cidade) }

    switch (funcao) {
        case 'Instalador':
            sqlAux = { funins: 'checked' }
            sql = Object.assign(sqlAux, sqlFuncao)
            break;
        case 'Gestor':
            sqlAux = { funins: 'checked' }
            sql = Object.assign(sqlAux, sqlFuncao)
            break;
        case 'Vendedor':
            sqlAux = { vendedor: 'checked' }
            sql = Object.assign(sqlAux, sqlFuncao)
            break;
        case 'Orçamentista':
            sqlAux = { vendedor: 'checked' }
            sql = Object.assign(sqlAux, sqlFuncao)
            break;
    }

    if (nome != '' && uf != '' && cidade != '' && funcao != 'Todos') {
        Pessoa.find(sql).lean().then((pessoas) => {
            res.render('mdo/consulta', { pessoas: pessoas, cidade: cidade, uf: uf, nome: nome, funcao: funcao })
        })
    } else {
        if (nome == '' && cidade == '' && uf == '' && funcao == 'Todos') {
            Pessoa.find({ user: id }).lean().then((pessoas) => {
                res.render('mdo/consulta', { pessoas: pessoas, cidade: cidade, uf: uf, nome: nome, funcao: funcao })
            })
        } else {
            if (funcao == 'Todos') {
                //console.log('Todos')
                if (nome == '' && cidade == '') {
                    Pessoa.find({ uf: new RegExp(uf), user: id }).lean().then((pessoas) => {
                        res.render('mdo/consulta', { pessoas: pessoas, cidade: cidade, uf: uf, nome: nome, funcao: funcao })
                    })
                } else {
                    if (nome == '' && uf == '') {
                        Pessoa.find({ cidade: new RegExp(cidade), user: id }).lean().then((pessoas) => {
                            res.render('mdo/consulta', { pessoas: pessoas, cidade: cidade, uf: uf, nome: nome, funcao: funcao })
                        })
                    } else {
                        if (cidade == '' && uf == '') {
                            Pessoa.find({ nome: new RegExp(nome), user: id }).lean().then((pessoas) => {
                                res.render('mdo/consulta', { pessoas: pessoas, cidade: cidade, uf: uf, nome: nome, funcao: funcao })
                            })
                        } else {
                            if (cidade == '') {
                                Pessoa.find({ nome: new RegExp(nome), uf: new RegExp(uf), user: id }).lean().then((pessoas) => {
                                    res.render('mdo/consulta', { pessoas: pessoas, cidade: cidade, uf: uf, nome: nome, funcao: funcao })
                                })
                            } else {
                                if (uf == '') {
                                    Pessoa.find({ nome: new RegExp(nome), cidade: new RegExp(cidade), user: id }).lean().then((pessoas) => {
                                        res.render('mdo/consulta', { pessoas: pessoas, cidade: cidade, uf: uf, nome: nome, funcao: funcao })
                                    })
                                } else {
                                    Pessoa.find({ cidade: new RegExp(cidade), uf: new RegExp(uf), user: id }).lean().then((pessoas) => {
                                        res.render('mdo/consulta', { pessoas: pessoas, cidade: cidade, uf: uf, nome: nome, funcao: funcao })
                                    })
                                }
                            }
                        }
                    }
                }
            } else {
                //console.log('Filtro Função')
                if (nome == '' && cidade == '' && uf == '') {
                    //console.log('achou')
                    sqlAux = Object.assign(sqlAux, { user: id })
                    Pessoa.find(sqlAux).lean().then((pessoas) => {
                        res.render('mdo/consulta', { pessoas: pessoas, cidade: cidade, uf: uf, nome: nome, funcao: funcao })
                    })
                } else {
                    if (nome == '' && cidade == '') {
                        sqlAux = Object.assign(sqlAux, { uf: new RegExp(uf), user: id })
                        Pessoa.find(sqlAux).lean().then((pessoas) => {
                            res.render('mdo/consulta', { pessoas: pessoas, cidade: cidade, uf: uf, nome: nome, funcao: funcao })
                        })
                    } else {
                        if (nome == '' && uf == '') {
                            sqlAux = Object.assign(sqlAux, { uf: new RegExp(cidade), user: id })
                            Pessoa.find(sqlAux).lean().then((pessoas) => {
                                res.render('mdo/consulta', { pessoas: pessoas, cidade: cidade, uf: uf, nome: nome, funcao: funcao })
                            })
                        } else {
                            sqlAux = Object.assign(sqlAux, { nome: new RegExp(nome), user: id })
                            if (cidade == '' && uf == '') {
                                Pessoa.find(sqlAux).lean().then((pessoas) => {
                                    res.render('mdo/consulta', { pessoas: pessoas, cidade: cidade, uf: uf, nome: nome, funcao: funcao })
                                })
                            } else {
                                sqlAux = Object.assign(sqlAux, { uf: new RegExp(nome), uf: new RegExp(uf), user: id })
                                if (cidade == '') {
                                    Pessoa.find(sqlAux).lean().then((pessoas) => {
                                        res.render('mdo/consulta', { pessoas: pessoas, cidade: cidade, uf: uf, nome: nome, funcao: funcao })
                                    })
                                } else {
                                    if (uf == '') {
                                        sqlAux = Object.assign(sqlAux, { uf: new RegExp(nome), cidade: new RegExp(cidade), user: id })
                                        Pessoa.find(sqlAux).lean().then((pessoas) => {
                                            res.render('mdo/consulta', { pessoas: pessoas, cidade: cidade, uf: uf, nome: nome, funcao: funcao })
                                        })
                                    } else {
                                        Pessoa.find({ cidade: new RegExp(cidade), uf: new RegExp(uf), funins: funins, funges: funges, funeng: funeng, vendedor: vendedor, user: id }).lean().then((pessoas) => {
                                            res.render('mdo/consulta', { pessoas: pessoas, cidade: cidade, uf: uf, nome: nome, funcao: funcao })
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