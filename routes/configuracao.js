const express = require('express')
const router = express.Router()
const multer = require('multer')
const multerS3 = require("multer-s3")
const aws = require("aws-sdk")

const mongoose = require('mongoose')

require('../model/Empresa')

const Empresa = mongoose.model('empresa')
const naoVazio = require('../resources/naoVazio')

const { ehAdmin } = require('../helpers/ehAdmin')

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

router.get('/novo', ehAdmin, (req, res) => {
    res.render('configuracao/configuracao')
})

router.get('/addempresa', ehAdmin, (req, res) => {
    res.render('configuracao/empresa')
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
    Configuracao.find({ user: id }).sort({ data: 'desc' }).lean().then((configuracoes) => {
        res.render('configuracao/findconfiguracao', { configuracoes: configuracoes })
    }).catch((err) => {
        req.flash('error_msg', 'Nenhum projeto encontrado')
        res.redirect('/orcamento')
    })
})

router.get('/consultaempresa', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }
    Empresa.find({ user: id }).sort({ data: 'desc' }).lean().then((empresa) => {
        res.render('configuracao/findempresa', { empresa })
    }).catch((err) => {
        req.flash('error_msg', 'Nenhum empresa encontrado')
        res.redirect('/configuracao')
    })
})

router.get('/editconfiguracao/:id', ehAdmin, (req, res) => {
    Configuracao.findOne({ _id: req.params.id }).lean().then((configuracoes) => {
        res.render('configuracao/configuracao', { configuracoes: configuracoes })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao encontrar a configuração.')
        res.redirect('/configuracao/editconfiguracao/' + req.params.id)
    })
})

router.get('/editempresa/:id', ehAdmin, (req, res) => {
    Empresa.findOne({ _id: req.params.id }).lean().then((empresa) => {
        var checkQtd = 'unchecked'
        var checkKwp = 'unchecked'
        var typeQtd = 'hidden'
        var typeKwp = 'hidden'
        var displayQtd = 'none'
        var displayKwp = 'none'

        var alqIRPJ
        var alqIRPJAdd
        var alqPIS
        var alqCOFINS
        var alqCSLL
        var alqDAS
        var dasMEI
        var labelIRPJ
        var labelIRPJAdd
        var labelPIS
        var labelCOFINS
        var labelCSLL
        var labelDAS
        var labelMEI

        //console.log('empresa.tipodesp=>' + empresa.tipodesp)
        if (empresa.tipodesp == 'potencia') {
            checkKwp = 'checked'
            typeKwp = 'text'
            displayKwp = ''

        } else {
            checkQtd = 'checked'
            typeQtd = 'text'
            displayQtd = ''
        }

        if (empresa.regime == 'Simples') {
            alqIRPJ = 'hidden'
            labelIRPJ = 'none'
            alqIRPJAdd = 'hidden'
            labelIRPJAdd = 'none'
            alqPIS = 'hidden'
            labelPIS = 'none'
            alqCOFINS = 'hidden'
            labelCOFINS = 'none'
            alqCSLL = 'hidden'
            labelCSLL = 'none'
            dasMEI = 'none'
            labelMEI = 'none'
            alqDAS = ''
            labelDAS = ''
        } else {
            if (empresa.regime == 'Lucro Real' || empresa.regime == 'Lucro Presumido') {
                alqIRPJ = 'text'
                labelIRPJ = ''
                alqIRPJAdd = 'text'
                labelIRPJAdd = ''
                alqPIS = 'text'
                labelPIS = ''
                alqCOFINS = 'text'
                labelCOFINS = ''
                alqCSLL = 'text'
                labelCSLL = ''
                dasMEI = 'none'
                labelMEI = 'none'
                alqDAS = 'none'
                labelDAS = 'none'
            } else {
                alqIRPJ = 'hidden'
                labelIRPJ = 'none'
                alqIRPJAdd = 'hidden'
                labelIRPJAdd = 'none'
                alqPIS = 'hidden'
                labelPIS = 'none'
                alqCOFINS = 'hidden'
                labelCOFINS = 'none'
                alqCSLL = 'hidden'
                labelCSLL = 'none'
                dasMEI = ''
                labelMEI = ''
                alqDAS = 'none'
                labelDAS = 'none'
            }
        }

        res.render('configuracao/empresa', {
            empresa, checkQtd, checkKwp, typeKwp, typeQtd, displayKwp, displayQtd,
            alqIRPJ, alqIRPJAdd, alqPIS, alqCOFINS, alqCSLL, alqDAS, dasMEI,
            labelIRPJ, labelIRPJAdd, labelPIS, labelCOFINS, labelCSLL, labelDAS, labelMEI
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao encontrar a empresa<get>.')
        res.redirect('/configuracao/consultaempresa/')
    })
})

router.get('/removeconfiguracao/:id', ehAdmin, (req, res) => {
    Configuracao.findOneAndRemove({ _id: req.params.id }).then(() => {
        req.flash('success_msg', 'Configuracao removida com sucesso')
        res.redirect('/configuracao/consulta')
    }).catch(() => {
        req.flash('error_msg', 'Não foi possível remover a configuração.')
        res.redirect('/configurcao/consultaempresa')
    })
})

router.get('/confirmaexclusao/:id', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }
    Projeto.find({ user: id, empresa: req.params.id }).then((projeto) => {
        if (naoVazio(projeto)) {
            req.flash('aviso_msg', 'Empresa vinculada a projeto(s). Impossível excluir.')
            res.redirect('/configuracao/consultaempresa')
        } else {
            Empresa.findOne({ user: id, _id: req.params.id }).lean().then((empresa) => {
                res.render('configuracao/confirmaexclusao', { empresa })
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao encontrar a Empresa.')
                res.redirect('/configuracao/consultaempresa')
            })
        }
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao encontrar a Projeto.')
        res.redirect('/menu')
    })
})

router.get('/removeempresa/:id', ehAdmin, (req, res) => {
    Empresa.findOneAndRemove({ _id: req.params.id }).then(() => {
        req.flash('success_msg', 'Empresa removido com sucesso')
        res.redirect('/configuracao/consultaempresa')
    }).catch(() => {
        req.flash('error_msg', 'Não foi possível remover o empresa.')
        res.redirect('/configurcao/consultaempresa')
    })
})

router.post('/addempresa', upload.single('files'), ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }

    var erros = []

    if (req.body.nome == '') {
        erros.push({ texto: 'É necessário preencher o nome.' })
    }
    if (req.body.cnpj == '') {
        erros.push({ texto: 'É necessário preencher o CNPJ.' })
    }

    if (erros.length > 0) {

        res.render('configuracao/empresa', { erros: erros })

    } else {

        var logo
        if (naoVazio(req.file)) {
            logo = req.file.originalname
        } else {
            logo = ''
        }

        const empresa = {
            user: id,
            nome: req.body.nome,
            razao: req.body.razao,
            cnpj: req.body.cnpj,
            endereco: req.body.endereco,
            cidade: req.body.cidade,
            uf: req.body.estado,
            telefone: req.body.telefone,
            celular: req.body.celular,
            website: req.body.website,
            vlrmdo: parseFloat(req.body.vlrmdo),
            valpro: parseFloat(req.body.valpro),
            seq: parseFloat(req.body.seq),
            perdaoeste: req.body.oeste,
            perdanorte: req.body.norte,
            perdaleste: req.body.leste,
            perdanordeste: req.body.nordeste,
            perdanoroeste: req.body.noroeste,
            log: logo
        }

        new Empresa(empresa).save().then(() => {
            Empresa.findOne({ user: id }).sort({ field: 'asc', _id: -1 }).then((empresa) => {
                req.flash('success_msg', 'Empresa cadastrada com sucesso.')
                res.redirect('/configuracao/editempresa/' + empresa._id)
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao encontrar a empresa.')
                res.redirect('/configuracao/consultaempresa')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao salvar a empresa.')
            res.redirect('/configuracao/consultaempresa')
        })

    }
})

router.post('/novo', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }

    if (req.body.hrstrb == '') {
        erros.push({ texto: 'É necessário preencher as horas trabalhadas dos instaladores.' })
    }
    if (req.body.slug == '') {
        erros.push({ texto: 'É necessário preencher o nome da configuração de tempo.' })
    }
    if (req.body.minatr == '') {
        erros.push({ texto: 'É necessário preencher os minutos para o aterramento.' })
    }
    if (req.body.minest == '') {
        erros.push({ texto: 'É necessário preencher os minutos para a instalação das estruturas.' })
    }
    if (req.body.minmod == '') {
        erros.push({ texto: 'É necessário preencher os minutos para a instalação dos módulos.' })
    }
    if (req.body.mininv == '') {
        erros.push({ texto: 'É necessário preencher os minutos para a instalação dos inversores.' })
    }
    if (req.body.minstb == '') {
        erros.push({ texto: 'É necessário preencher os minutos para a instalação do string box.' })
    }
    if (req.body.minpnl == '') {
        erros.push({ texto: 'É necessário preencher os minutos para a instalação do painél elétrico.' })
    }
    const configuracao = {
        user: id,
        slug: req.body.slug,
        minatr: req.body.minatr,
        minest: req.body.minest,
        minmod: req.body.minmod,
        mininv: req.body.mininv,
        minstb: req.body.minstb,
        minpnl: req.body.minpnl,
        mineae: req.body.mineae,
        vlrhrp: req.body.vlrhrp,
        vlrhrg: req.body.vlrhrg,
        vlrhri: req.body.vlrhri,
        vlrdrp: req.body.vlrdrp,
        vlrdrg: req.body.vlrdrg,
        vlrdri: req.body.vlrdri,
        hrstrb: req.body.hrstrb,
        medkmh: req.body.medkmh
    }

    new Configuracao(configuracao).save().then(() => {
        Configuracao.findOne({ user: id }).sort({ field: 'asc', _id: -1 }).then((config) => {
            req.flash('success_msg', 'Configurações salvas com sucesso')
            res.redirect('/configuracao/editconfiguracao/' + config._id)
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao encontrar as configurações.')
            res.redirect('/configuracao/novo/')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao salvar as configurações.')
        res.redirect('/configuracao/novo/')
    })
})

router.post('/editconfiguracao/', ehAdmin, (req, res) => {

    /*
    //console.log('_id=>'+req.body.id)
    //console.log('req.body.slug=>'+ req.body.slug)
    //console.log('req.body.minatr=>'+req.body.minatr)
    //console.log('req.body.minest=>'+req.body.minest)
    //console.log('req.body.minmod=>'+req.body.minmod)
    //console.log('req.body.mininv=>'+req.body.mininv)
    //console.log('req.body.minstb=>'+req.body.minstb)
    //console.log('req.body.minpnl=>'+req.body.minpnl)
    //console.log('req.body.vlrhrp=>'+req.body.vlrhrp)
    //console.log('req.body.vlrhrg=>'+req.body.vlrhrg)
    //console.log('req.body.vlrhri=>'+req.body.vlrhri)
    //console.log('req.body.hrstrb=>'+req.body.hrstrb)
    //console.log('req.body.medkmh=>'+req.body.medkmh)     
    */

    //console.log('req.body.id=>'+req.body.id)

    Configuracao.findOne({ _id: req.body.id }).then((configuracao) => {

        configuracao.slug = req.body.slug
        configuracao.minatr = req.body.minatr
        configuracao.minest = req.body.minest
        configuracao.minmod = req.body.minmod
        configuracao.mininv = req.body.mininv
        configuracao.minstb = req.body.minstb
        configuracao.minpnl = req.body.minpnl
        configuracao.mineae = req.body.mineae
        configuracao.vlrhrp = req.body.vlrhrp
        configuracao.vlrhrg = req.body.vlrhrg
        configuracao.vlrhri = req.body.vlrhri
        configuracao.vlrdrp = req.body.vlrdrp
        configuracao.vlrdrg = req.body.vlrdrg
        configuracao.vlrdri = req.body.vlrdri
        configuracao.hrstrb = req.body.hrstrb
        configuracao.medkmh = req.body.medkmh

        //console.log('req.body.id=>'+req.body.id)

        configuracao.save().then(() => {
            req.flash('success_msg', 'Configuração salva com sucesso.')
            res.redirect('/configuracao/editconfiguracao/' + req.body.id)
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao salvar a configuração.')
            res.redirect('/configuracao/editconfiguracao/' + req.body.id)
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao encontrar a configuração.')
        res.redirect('/configuracao/editconfiguracao/' + req.body.id)
    })
})

router.post('/editempresa/', upload.single('logo'), ehAdmin, (req, res) => {

    var erros = []

    if (req.body.nome == '') {
        erros.push({ texto: 'É necessário preencher o nome.' })
    }
    if (req.body.cnpj == '') {
        erros.push({ texto: 'É necessário preencher o CNPJ.' })
    }

    if (erros.length > 0) {

        Empresa.findOne({ _id: req.body.id }).then((empresa) => {
            res.render('configuracao/empresa', { erros, empresa })
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao encontrar a empresa<erros edit>.')
            res.redirect('/configuracao/consultaempresa')
        })

    } else {
        Empresa.findOne({ _id: req.body.id }).then((empresa) => {

            //console.log('file=>'+req.file)
            var logo
            if (naoVazio(req.file)) {
                logo = req.file.originalname
            } else {
                logo = ''
            }

            empresa.nome = req.body.nome
            empresa.razao = req.body.razao
            empresa.cpnj = req.body.cpnj
            empresa.endereco = req.body.endereco
            empresa.cidade = req.body.cidade
            empresa.uf = req.body.estado
            empresa.telefone = req.body.telefone
            empresa.celular = req.body.celular
            empresa.website = req.body.website
            empresa.vlrmdo = parseFloat(req.body.vlrmdo)
            empresa.valpro = parseFloat(req.body.valpro)
            empresa.seq = parseFloat(req.body.seq)
            empresa.perdaoeste = req.body.oeste
            empresa.perdanorte = req.body.norte
            empresa.perdaleste = req.body.leste
            empresa.perdanordeste = req.body.nordeste
            empresa.perdanoroeste = req.body.noroeste
            empresa.logo = logo

            empresa.save().then(() => {
                req.flash('success_msg', 'Dados da Empresa salvas com sucesso.')
                //console.log("empresa._id=>" + empresa._id)
                res.redirect('/configuracao/editempresa/' + empresa._id)
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao salvar a empresa.')
                res.redirect('/configuracao/consultaempresa')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao encontrar a empresa<post>.')
            res.redirect('/configuracao/consultaempresa')
        })
    }
})

module.exports = router