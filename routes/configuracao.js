const express = require('express')
const router = express.Router()

const mongoose = require('mongoose')

require('../model/Configuracao')
require('../model/Empresa')
require('../model/Proposta')

const Configuracao = mongoose.model('configuracao')
const Empresa = mongoose.model('empresa')
const Proposta = mongoose.model('proposta')
const naoVazio = require('../resources/naoVazio')

//Configurando pasta de imagens 
router.use(express.static('imagens'))

const { ehAdmin } = require('../helpers/ehAdmin')

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

        console.log('empresa.tipodesp=>'+empresa.tipodesp)
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
        console.log('empresa=>' + empresa)
        console.log('checkQtd=>' + checkQtd)
        console.log('checkKwp=>' + checkKwp)
        console.log('typeQtd=>' + typeQtd)
        console.log('alqIRPJ=>' + alqIRPJ)
        console.log('alqIRPJAdd=>' + alqIRPJAdd)
        console.log('alqPIS=>' + alqPIS)
        console.log('alqCOFINS=>' + alqCOFINS)
        console.log('alqCSLL=>' + alqCSLL)
        console.log('alqDAS=>' + alqDAS)
        console.log('dasMEI=>' + dasMEI)
        console.log('labelIRPJ=>' + labelIRPJ)
        console.log('labelIRPJAdd=>' + labelIRPJAdd)
        console.log('labelPIS=>' + labelPIS)
        console.log('labelCOFINS=>' + labelCOFINS)
        console.log('labelCSLL=>' + labelCSLL)
        console.log('labelDAS=>' + labelDAS)
        console.log('labelMEI=>' + labelMEI)
        console.log(empresa.regime)

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
    Proposta.find({ user: id, empresa: req.params.id }).then((proposta) => {
        if (naoVazio(proposta)) {
            req.flash('aviso_msg', 'Empresa vinculada a proposta(s). Impossível excluir.')
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
        req.flash('error_msg', 'Houve um erro ao encontrar a Proposta.')
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

router.post('/addempresa', ehAdmin, (req, res) => {
    const { _id } = req.user
    const { user } = req.user
    var id

    if (typeof user == 'undefined') {
        id = _id
    } else {
        id = user
    }

    var erros = []

    // if (req.body.alqNFS == '') {
    //     erros.push({ texto: 'É necessário preencher a aliquota do ISS.' })
    // }
    if (req.body.nome == '') {
        erros.push({ texto: 'É necessário preencher o nome.' })
    }
    if (req.body.cnpj == '') {
        erros.push({ texto: 'É necessário preencher o CNPJ.' })
    }
    // if (req.body.empresa == 'MEI') {
    //     if (req.body.vlrDAS == '') {
    //         erros.push({ texto: 'É necessário preencher o valor do DAS.' })
    //     }
    // }
    // if (req.body.empresa == 'Simples') {
    //     if (req.body.alqDAS == '') {
    //         erros.push({ texto: 'É necessário preencher a aliquota do DAS.' })
    //     }
    //     if (req.body.vlrred == '') {
    //         erros.push({ texto: 'É necessário preencher o valor de redução do calulo do Simples.' })
    //     }
    // }

    // if (req.body.empresa == 'Lucro Real' || req.body.empresa == 'Lucro Presumido') {

    //     if (req.body.alqPIS == '') {
    //         erros.push({ texto: 'É necessário preencher a aliquota do PIS.' })
    //     }
    //     if (req.body.alqCOFINS == '') {
    //         erros.push({ texto: 'É necessário preencher a aliquota do COFINS.' })
    //     }
    //     if (req.body.alqIRPJAdd == '') {
    //         erros.push({ texto: 'É necessário preencher a aliquota do IRPJ Adicional.' })
    //     }
    //     if (req.body.alqIRPJ == '') {
    //         erros.push({ texto: 'É necessário preencher a aliquota do IRPJ.' })
    //     }
    //     if (req.body.alqCSLL == '') {
    //         erros.push({ texto: 'É necessário preencher a aliquota do CSLL.' })
    //     }
    // }

    // if (req.body.empresa == 'Simples' && req.body.prjFat == '') {
    //     erros.push({ texto: 'É necessário preencher o valor de projeção de faturamento.' })
    // }

    // if (req.body.empresa == 'Lucro Real' && req.body.prjLR == '') {
    //     erros.push({ texto: 'É necessário preencher o valor de projeção do Lucro Real.' })
    // }

    // if (req.body.empresa == 'Lucro Presumido' && req.body.prjLP == '') {
    //     erros.push({ texto: 'É necessário preencher o valor de projeção de faturamento.' })
    // }

    if (erros.length > 0) {

        res.render('configuracao/empresa', { erros: erros })

    } else {

        var tipodesp
        //console.log('req.body.selecionado='+req.body.selecionado)
        if (req.body.selecionado == 'quantidade') {
            tipodesp = 'quantidade'
        } else {
            tipodesp = 'potencia'
        }
        const empresa = {
            user: id,
            nome: req.body.nome,
            cnpj: req.body.cnpj,
            endereco: req.body.endereco,
            telefone: req.body.telefone,
            empresa: req.body.empresa,
            regime: req.body.regime,
            tipo: req.body.tipo,
            alqDAS: req.body.alqDAS,
            alqICMS: req.body.alqICMS,
            alqIRPJ: req.body.alqIRPJ,
            alqIRPJAdd: req.body.alqIRPJAdd,
            alqCSLL: req.body.alqCSLL,
            alqPIS: req.body.alqPIS,
            alqCOFINS: req.body.alqCOFINS,
            alqNFS: req.body.alqNFS,
            vlrred: req.body.vlrred,
            prjLR: req.body.prjLR,
            prjFat: req.body.prjFat,
            prjLP: req.body.prjLP,
            alqINSS: req.body.alqINSS,
            vlrDAS: req.body.vlrDAS,
            tipodesp: tipodesp,
            desadm: req.body.desadm,
            perdes: req.body.perdes,
            estkwp: req.body.estkwp,
            markup: req.body.markup,
            seq: req.body.seq
        }

        new Empresa(empresa).save().then(() => {
            Empresa.findOne({ user: id }).sort({ field: 'asc', _id: -1 }).then((empresa) => {
                req.flash('success_msg', 'Configurações de tributos salvas com sucesso')
                res.redirect('/configuracao/editempresa/' + empresa._id)
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao encontrar a empresa.')
                res.redirect('/configuracao/empresa')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao salvar a empresa.')
            res.redirect('/configuracao/empresa')
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

router.post('/editempresa/', ehAdmin, (req, res) => {

    var erros = []

    // if (req.body.alqNFS == '') {
    //     erros.push({ texto: 'É necessário preencher a aliquota do ISS.' })
    // }
    if (req.body.nome == '') {
        erros.push({ texto: 'É necessário preencher o nome.' })
    }
    if (req.body.cnpj == '') {
        erros.push({ texto: 'É necessário preencher o CNPJ.' })
    }
    // if (req.body.regime == 'MEI') {
    //     if (req.body.vlrDAS == '') {
    //         erros.push({ texto: 'É necessário preencher o valor do DAS.' })
    //     }
    // }
    // if (req.body.regime == 'Simples') {
    //     if (req.body.alqDAS == '') {
    //         erros.push({ texto: 'É necessário preencher a aliquota do DAS.' })
    //     }
    //     if (req.body.vlrred == '') {
    //         erros.push({ texto: 'É necessário preencher o valor de redução do calulo do Simples.' })
    //     }
    // }

    // if (req.body.regime == 'Lucro Real' || req.body.regime == 'Lucro Presumido') {

    //     if (req.body.alqPIS == '') {
    //         erros.push({ texto: 'É necessário preencher a aliquota do PIS.' })
    //     }
    //     if (req.body.alqCOFINS == '') {
    //         erros.push({ texto: 'É necessário preencher a aliquota do COFINS.' })
    //     }
    //     if (req.body.alqIRPJAdd == '') {
    //         erros.push({ texto: 'É necessário preencher a aliquota do IRPJ Adicional.' })
    //     }
    //     if (req.body.alqIRPJ == '') {
    //         erros.push({ texto: 'É necessário preencher a aliquota do IRPJ.' })
    //     }
    //     if (req.body.alqCSLL == '') {
    //         erros.push({ texto: 'É necessário preencher a aliquota do CSLL.' })
    //     }
    // }

    // if (req.body.regime == 'Simples' && req.body.prjFat == '') {
    //     erros.push({ texto: 'É necessário preencher o valor de projeção de faturamento.' })
    // }

    // if (req.body.regime == 'Lucro Real' && req.body.prjLR == '') {
    //     erros.push({ texto: 'É necessário preencher o valor de projeção do Lucro Real.' })
    // }

    // if (req.body.regime == 'Lucro Presumido' && req.body.prjLP == '') {
    //     erros.push({ texto: 'É necessário preencher o valor de projeção de faturamento.' })
    // }

    if (erros.length > 0) {

        Empresa.findOne({ _id: req.body.id }).then((empresa) => {
            res.render('configuracao/empresa', { erros, empresa })
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao encontrar a empresa<erros edit>.')
            res.redirect('/configuracao/consultaempresa')
        })

    } else {
        Empresa.findOne({ _id: req.body.id }).then((empresa) => {

            empresa.nome = req.body.nome
            empresa.endereco = req.body.endereco
            empresa.telefone = req.body.telefone
            empresa.cnpj = req.body.cnpj
            if (naoVazio(req.body.regime)){
                empresa.regime = req.body.regime
            }
            if (naoVazio(req.body.tipo)){
                empresa.tipo = req.body.tipo
            }            
            empresa.seq = req.body.seq

            //console.log('req.body.alqDAS=>'+req.body.alqDAS)

            if (naoVazio(req.body.markup )){
                empresa.markup = req.body.markup
            }else{
                empresa.markup = 0
            }
            if (naoVazio(req.body.alqDAS )){
                empresa.alqDAS = req.body.alqDAS
            }else{
                empresa.alqDAS = 0
            }
            if (naoVazio(req.body.alqNFS )){
                empresa.alqNFS = req.body.alqNFS
            }else{
                empresa.alqNFS = 0
            }
            if (naoVazio(req.body.alqICMS )){
                empresa.alqICMS = req.body.alqICMS
            }else{
                empresa.alqICMS = 0
            }
            if (naoVazio(req.body.alqIRPJ )){
                empresa.alqIRPJ = req.body.alqIRPJ
            }else{
                empresa.alqIRPJ = 0
            }
            if (naoVazio(req.body.alqIRPJAdd )){
                empresa.alqIRPJAdd = req.body.alqIRPJAdd
            }else{
                empresa.alqIRPJAdd = 0
            }
            if (naoVazio(req.body.alqCSLL )){
                empresa.alqCSLL = req.body.alqCSLL
            }else{
                empresa.alqCSLL = 0
            }
            if (naoVazio(req.body.alqPIS )){
                empresa.alqPIS = req.body.alqPIS
            }else{
                empresa.alqPIS = 0
            }
            if (naoVazio(req.body.alqCOFINS )){
                empresa.alqCOFINS = req.body.alqCOFINS
            }else{
                empresa.alqCOFINS = 0
            }
            if (naoVazio(req.body.vlrred )){
                empresa.vlrred = req.body.vlrred
            }else{
                empresa.vlrred = 0
            }
            if (naoVazio(req.body.prjFat )){
                empresa.prjFat = req.body.prjFat
            }else{
                empresa.prjFat = 0
            }
            if (naoVazio(req.body.prjLR )){
                empresa.prjLR = req.body.prjLR
            }else{
                empresa.prjLR = 0
            }
            if (naoVazio(req.body.prjLP )){
                empresa.prjLP = req.body.prjLP
            }else{
                empresa.prjLP = 0
            }
            if (naoVazio(req.body.desadm )){
                empresa.desadm = req.body.desadm
            }else{
                empresa.desadm = 0
            }
            if (naoVazio(req.body.perdes )){
                empresa.perdes = req.body.perdes
            }else{
                empresa.perdes = 0
            }
            if (naoVazio(req.body.estkwp )){
                empresa.estkwp = req.body.estkwp
            }else{
                empresa.estkwp = 0
            }
            if (req.body.selecionado == 'quantidade') {
                empresa.tipodesp = 'quantidade'
            } else {
                empresa.tipodesp = 'potencia'
            }

            empresa.save().then(() => {
                req.flash('success_msg', 'Dados da Empresa salvas com sucesso.')
                console.log("empresa._id=>"+empresa._id)
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