const express = require('express')
const router = express.Router()

const mongoose = require('mongoose')

require('../model/Configuracao')
require('../model/Regime')

const Configuracao = mongoose.model('configuracao')
const Regime = mongoose.model('regime')

//Configurando pasta de imagens 
router.use(express.static('imagens'))

const { ehAdmin } = require('../helpers/ehAdmin')

router.get('/novo', ehAdmin, (req, res) => {
    res.render('configuracao/addconfiguracao')
})

router.get('/addregime', ehAdmin, (req, res) => {
    res.render('configuracao/addregime')
})

router.get('/consulta', ehAdmin, (req, res) => {
    const {_id} = req.user
    Configuracao.find({user: _id}).sort({ data: 'desc' }).lean().then((configuracoes) => {
        res.render('configuracao/findconfiguracao', { configuracoes: configuracoes })
    }).catch((err) => {
        req.flash('error_msg', 'Nenhum projeto encontrado')
        res.redirect('/orcamento')
    })
})

router.get('/consultaregime', ehAdmin, (req, res) => {
    const {_id} = req.user
    Regime.find({user: _id}).sort({ data: 'desc' }).lean().then((regime) => {
        res.render('configuracao/findregime', { regime: regime })
    }).catch((err) => {
        req.flash('error_msg', 'Nenhum regime encontrado')
        res.redirect('/configuracao')
    })
})

router.get('/editconfiguracao/:id', ehAdmin, (req, res) => {
    Configuracao.findOne({ _id: req.params.id }).lean().then((configuracoes) => {
        res.render('configuracao/editconfiguracao', { configuracoes: configuracoes })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao encontrar a configuração.')
        res.redirect('/consultar')
    })
})

router.get('/editregime/:id', ehAdmin, (req, res) => {
    Regime.findOne({ _id: req.params.id }).lean().then((regime) => {
        res.render('configuracao/editregime', { regime: regime })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao encontrar o regime.')
        res.redirect('/configuracao')
    })
})

router.get('/removeconfiguracao/:id', ehAdmin, (req, res) => {
    Configuracao.findOneAndRemove({ _id: req.params.id }).then(() => {
        req.flash('success_msg', 'Configuracao removida com sucesso')
        res.redirect('/configuracao/consultaregime')
    }).catch(() => {
        req.flash('error_msg', 'Não foi possível remover a configuração.')
        res.redirect('/configurcao/consultaregime')
    })
})

router.get('/removeregime/:id', ehAdmin, (req, res) => {
    Regime.findOneAndRemove({ _id: req.params.id }).then(() => {
        req.flash('success_msg', 'Regime removido com sucesso')
        res.redirect('/configuracao/consultaregime')
    }).catch(() => {
        req.flash('error_msg', 'Não foi possível remover o regime.')
        res.redirect('/configurcao/consultaregime')
    })
})

router.post('/addregime', ehAdmin, (req, res) => {
    const {_id} = req.user
    var proje

    var erros = []

    if (req.body.alqNFS == '') {
        erros.push({ texto: 'É necessário preencher a aliquota do ISS' })
    }
    if (req.body.nome == '') {
        erros.push({ texto: 'É necessário preencher o nome' })
    }
    if (req.body.regime == 'MEI') {
        if (req.body.vlrDAS == '') {
            erros.push({ texto: 'É necessário preencher o valor do DAS' })
        }
    }
    if (req.body.regime == 'Simples') {
        if (req.body.alqDAS == '') {
            erros.push({ texto: 'É necessário preencher a aliquota do DAS' })
        }
        if (req.body.vlrred == '') {
            erros.push({ texto: 'É necessário preencher o valor de redução do calulo do Simples' })
        }
    }

    if (req.body.regime == 'Lucro Real' || req.body.regime == 'Lucro Presumido') {

        if (req.body.alqPIS == '') {
            erros.push({ texto: 'É necessário preencher a aliquota do PIS' })
        }
        if (req.body.alqCOFINS == '') {
            erros.push({ texto: 'É necessário preencher a aliquota do COFINS' })
        }
        if (req.body.alqIRPJAdd == '') {
            erros.push({ texto: 'É necessário preencher a aliquota do IRPJ Adicional' })
        }
        if (req.body.alqIRPJ == '') {
            erros.push({ texto: 'É necessário preencher a aliquota do IRPJ' })
        }
        if (req.body.alqCSLL == '') {
            erros.push({ texto: 'É necessário preencher a aliquota do CSLL' })
        }
    }

    if (req.body.regime == 'Simples' && req.body.prjFat == '') {
        erros.push({ texto: 'É necessário preencher o valor de projeção de faturamento' })
    }

    if (req.body.regime == 'Lucro Real' && req.body.prjLR == '') {
        erros.push({ texto: 'É necessário preencher o valor de projeção do Lucro Real' })
    }

    if (req.body.regime == 'Lucro Presumido' && req.body.prjLP == '') {
        erros.push({ texto: 'É necessário preencher o valor de projeção de faturamento' })
    }

    if (erros.length > 0) {

        res.render('configuracao/addregime', { erros: erros })

    } else {
        const regime = {
            user: _id,
            nome: req.body.nome,
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
            tipodes: req.body.tipodes,
            desadm: req.body.desadm,
            perdesp: req.body.perdesp,
            estkwp: req.body.estkwp
        }

        new Regime(regime).save().then(() => {
            req.flash('success_msg', 'Configurações de tributos salvas com sucesso')
            res.redirect('/menu')
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao salvar as configurações de impostos.')
            res.redirect('/configuracao/addregime')
        })

    }
})

router.post('/novo', ehAdmin, (req, res) => {
    const {_id} = req.user
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
    const configuracao = {
        user: _id,
        slug: req.body.slug,
        potencia: req.body.potencia,
        minatr: req.body.minatr,
        minest: req.body.minest,
        minmod: req.body.minmod,
        mininv: req.body.mininv,
        hrstrb: req.body.hrstrb,
        /*
        minart: req.body.minart,
        minmem: req.body.minmem,
        minsit: req.body.minsit,
        minuni: req.body.minuni,
        mindis: req.body.mindis,
        minate: req.body.minate,
        */
        medkmh: req.body.medkmh
    }

    new Configuracao(configuracao).save().then(() => {
        req.flash('success_msg', 'Configurações salvas com sucesso')
        res.redirect('/menu')
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao salvar as configurações.')
        res.redirect('/configuracao/novo')
    })
})

router.post('/editconfiguracao/', ehAdmin, (req, res) => {
    
    Configuracao.findOne({ _id: req.body.id }).then((configuracao) => {
        configuracao.slug = req.body.slug
        configuracao.potencia = req.body.potencia
        configuracao.minatr = req.body.minatr
        configuracao.minest = req.body.minest
        configuracao.minmod = req.body.minmod
        configuracao.mininv = req.body.mininv
        configuracao.hrstrb = req.body.hrstrb
        configuracao.medkmh = req.body.medkmh

        configuracao.save().then(() => {
            req.flash('success_msg', 'Configuração salva com sucesso')
            res.redirect('/configuracao/consulta')
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao salvar a configuração.')
            res.redirect('/configuracao/consulta')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao encontrar a configuração.')
        res.redirect('/configuracao/consulta')
    })
})

router.post('/editregime/', ehAdmin, (req, res) => {
    
    var erros = []

    if (req.body.alqNFS == '') {
        erros.push({ texto: 'É necessário preencher a aliquota do ISS' })
    }
    if (req.body.nome == '') {
        erros.push({ texto: 'É necessário preencher o nome' })
    }
    if (req.body.regime == 'MEI') {
        if (req.body.vlrDAS == '') {
            erros.push({ texto: 'É necessário preencher o valor do DAS' })
        }
    }
    if (req.body.regime == 'Simples') {
        if (req.body.alqDAS == '') {
            erros.push({ texto: 'É necessário preencher a aliquota do DAS' })
        }
        if (req.body.vlrred == '') {
            erros.push({ texto: 'É necessário preencher o valor de redução do calulo do Simples' })
        }
    }

    if (req.body.regime == 'Lucro Real' || req.body.regime == 'Lucro Presumido') {

        if (req.body.alqPIS == '') {
            erros.push({ texto: 'É necessário preencher a aliquota do PIS' })
        }
        if (req.body.alqCOFINS == '') {
            erros.push({ texto: 'É necessário preencher a aliquota do COFINS' })
        }
        if (req.body.alqIRPJAdd == '') {
            erros.push({ texto: 'É necessário preencher a aliquota do IRPJ Adicional' })
        }
        if (req.body.alqIRPJ == '') {
            erros.push({ texto: 'É necessário preencher a aliquota do IRPJ' })
        }
        if (req.body.alqCSLL == '') {
            erros.push({ texto: 'É necessário preencher a aliquota do CSLL' })
        }
    }

    if (req.body.regime == 'Simples' && req.body.prjFat == '') {
        erros.push({ texto: 'É necessário preencher o valor de projeção de faturamento' })
    }

    if (req.body.regime == 'Lucro Real' && req.body.prjLR == '') {
        erros.push({ texto: 'É necessário preencher o valor de projeção do Lucro Real' })
    }

    if (req.body.regime == 'Lucro Presumido' && req.body.prjLP == '') {
        erros.push({ texto: 'É necessário preencher o valor de projeção de faturamento' })
    }

    if (erros.length > 0) {

        Regime.findOne({ _id: req.body.id }).then((regime) => {
            res.render('configuracao/editregime', { erros: erros, regime:regime})
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao encontrar o regime.')
            res.redirect('/configuracao/consultaregime')
        })

    } else {
        Regime.findOne({ _id: req.body.id }).then((regime) => {

            regime.nome = req.body.nome
            regime.regime = req.body.regime
            regime.tipo = req.body.tipo
            
            if (req.body.alqDAS == '' || parseFloat(req.body.alqDAS) == 0) {
                regime.alqDAS = 0
            } else {
                regime.alqDAS = req.body.alqDAS
            }

            if (req.body.alqNFS == '' || parseFloat(req.body.alqNFS) == 0) {
                regime.alqNFS = 0
            } else {
                regime.alqNFS = req.body.alqNFS
            }
            
            if (req.body.alqICMS == '' || parseFloat(req.body.alqICMS) == 0) {
                regime.alqICMS = 0
            } else {
                regime.alqICMS = req.body.alqICMS
            }

            if (req.body.alqIRPJ == '' || parseFloat(req.body.alqIRPJ) == 0) {
                regime.alqIRPJ = 0
            } else {
                regime.alqIRPJ = req.body.alqIRPJ
            }

            if (req.body.alqIRPJAdd == '' || parseFloat(req.body.alqIRPJAdd) == 0) {
                regime.alqIRPJAdd = 0
            } else {
                regime.alqIRPJAdd = req.body.alqIRPJAdd
            }
            
            if (req.body.alqCSLL == '' || parseFloat(req.body.alqCSLL) == 0) {
                regime.alqCSLL = 0
            } else {
                regime.alqCSLL = req.body.alqCSLL
            }

            if (req.body.alqPIS == '' || parseFloat(req.body.alqPIS) == 0) {
                regime.alqPIS = 0
            } else {
                regime.alqPIS = req.body.alqPIS
            }

            if (req.body.alqCOFINS == '' || parseFloat(req.body.alqCOFINS) == 0) {
                regime.alqCOFINS = 0
            } else {
                regime.alqCOFINS = req.body.alqCOFINS
            }
            
            if (req.body.vlrred == '' || parseFloat(req.body.vlrred) == 0) {
                regime.vlrred = 0
            } else {
                regime.vlrred = req.body.vlrred
            }
            
            if (req.body.prjFat == '' || parseFloat(req.body.prjFat) == 0) {
                regime.prjFat = 0
            } else {
                regime.prjFat = req.body.prjFat
            }
            
            if (req.body.prjLR == '' || parseFloat(req.body.prjLR) == 0) {
                regime.prjLR = 0
            } else {
                regime.prjLR = req.body.prjLR
            }
            
            if (req.body.prjLP == '' || parseFloat(req.body.prjLP) == 0) {
                regime.prjLP = 0
            } else {
                regime.prjLP = req.body.prjLP
            }
            
            regime.tipodesp = req.body.tipodesp

            if (req.body.desadm == '' || parseFloat(req.body.desadm) == 0) {
                regime.desadm = 0
            } else {
                regime.desadm = req.body.desadm
            }            
            
            if (req.body.perdes == '' || parseFloat(req.body.perdes) == 0) {
                regime.perdes = 0
            } else {
                regime.perdes = req.body.perdes
            }            
              
            if (req.body.estkwp == '' || parseFloat(req.body.estkwp) == 0) {
                regime.estkwp = 0
            } else {
                regime.estkwp = req.body.estkwp
            }             

            regime.save().then(() => {
                req.flash('success_msg', 'Regime alterado com sucesso')
                res.redirect('/configuracao/consultaregime')
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao salvar o regime.')
                res.redirect('/configuracao/consultaregime')
            })

        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao encontrar o regime.')
            res.redirect('/configuracao/consultaregime')
        })
    }
})

module.exports = router