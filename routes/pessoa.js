require('../app')
const multer = require('multer')
const express = require('express')

const router = express.Router()

//const path = require('path')
const app = express()
app.set('view engine', 'ejs')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/upload/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const uploadfoto = multer({ storage })

require('../model/Pessoa')
require('../model/Equipe')
require('../model/Vistoria')
const mongoose = require('mongoose')

const Pessoa = mongoose.model('pessoa')
const Projeto = mongoose.model('projeto')
const Equipe = mongoose.model('equipe')
const Cronograma = mongoose.model('cronograma')
const Cliente = mongoose.model('cliente')
const Vistoria = mongoose.model('vistoria')

const { ehAdmin } = require('../helpers/ehAdmin')
const dataMensagem = require('../resources/dataMensagem')

router.use(express.static('public/'))
router.use(express.static('public/upload'))

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

router.get('/limpaPlanejamento/:id', ehAdmin, (req, res) => {
    Equipe.findOne({ projeto: req.params.id }).then((equipe) => {
        if (equipe.pla0 != '' && typeof equipe.pla0 != 'undefined') {
            equipe.pla0 = ''
            equipe.pla1 = ''
            equipe.pla2 = ''
            equipe.pla3 = ''
            equipe.pla4 = ''
            equipe.pla5 = ''
            equipe.save().then(() => {
                console.log('salvou equipe')
                req.flash('success_msg', 'Equipe de planejamento excluída.')
                res.redirect('/pessoa/recursosPlanejamento/' + req.params.id)
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao excluir a equipe.')
                res.redirect('/pessoa/recursosPlanejamento/' + req.params.id)
            })
        }
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar a equipe')
        res.redirect('/pessoa/recursosPlanejamento/' + req.params.id)
    })
})

router.get('/limpaProjetista/:id', ehAdmin, (req, res) => {
    Equipe.findOne({ projeto: req.params.id }).then((equipe) => {
        if (equipe.pro0 != '' && typeof equipe.pro0 != 'undefined') {
            equipe.pro0 = ''
            equipe.pro1 = ''
            equipe.pro2 = ''
            equipe.pro3 = ''
            equipe.pro4 = ''
            equipe.pro5 = ''
            equipe.save().then(() => {
                console.log('salvou equipe')
                req.flash('success_msg', 'Equipe de projetista excluída.')
                res.redirect('/pessoa/recursosProjetista/' + req.params.id)
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao excluir a equipe.')
                res.redirect('/pessoa/recursosProjetista/' + req.params.id)
            })
        }
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar a equipe')
        res.redirect('/pessoa/recursosProjetista/' + req.params.id)
    })
})

router.get('/limpaAterramento/:id', ehAdmin, (req, res) => {
    Equipe.findOne({ projeto: req.params.id }).then((equipe) => {
        if (equipe.ate0 != '' && typeof equipe.ate0 != 'undefined') {
            equipe.ate0 = ''
            equipe.ate1 = ''
            equipe.ate2 = ''
            equipe.ate3 = ''
            equipe.ate4 = ''
            equipe.ate5 = ''
            equipe.save().then(() => {
                req.flash('success_msg', 'Equipe de aterramento excluída.')
                res.redirect('/pessoa/recursosAterramento/' + req.params.id)
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao excluir a equipe.')
                res.redirect('/pessoa/recursosAterramento/' + req.params.id)
            })
        }
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar a equipe')
        res.redirect('/pessoa/recursosAterramento/' + req.params.id)
    })
})

router.get('/limpaInversor/:id', ehAdmin, (req, res) => {
    Equipe.findOne({ projeto: req.params.id }).then((equipe) => {
        if (equipe.inv0 != '' && typeof equipe.inv0 != 'undefined') {
            equipe.inv0 = ''
            equipe.inv1 = ''
            equipe.inv2 = ''
            equipe.inv3 = ''
            equipe.inv4 = ''
            equipe.inv5 = ''
            equipe.save().then(() => {
                req.flash('success_msg', 'Equipe de instalação de inversores excluída.')
                res.redirect('/pessoa/recursosInversores/' + req.params.id)
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao excluir a equipe.')
                res.redirect('/projeto/consulta')
            })
        }
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar a equipe')
        res.redirect('/projeto/consulta')
    })
})

router.get('/limpaInstaladores/:id', ehAdmin, (req, res) => {
    Equipe.findOne({ projeto: req.params.id }).then((equipe) => {
        if (equipe.ins0 != '' && typeof equipe.ins0 != 'undefined') {
            equipe.ins0 = ''
            equipe.ins1 = ''
            equipe.ins2 = ''
            equipe.ins3 = ''
            equipe.ins4 = ''
            equipe.ins5 = ''
            equipe.save().then(() => {
                req.flash('success_msg', 'Equipe de instalação excluída.')
                res.redirect('/pessoa/recursosInstalacao/' + req.params.id)
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao excluir a equipe.')
                res.redirect('/pessoa/recursosInstalacao/' + req.params.id)
            })
        }
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar a equipe')
        res.redirect('/pessoa/recursosInstalacao/' + req.params.id)
    })
})

router.get('/limpaArmazenamento/:id', ehAdmin, (req, res) => {
    Equipe.findOne({ projeto: req.params.id }).then((equipe) => {
        if (equipe.eae0 != '' && typeof equipe.eae0 != 'undefined') {
            equipe.eae0 = ''
            equipe.eae1 = ''
            equipe.eae2 = ''
            equipe.eae3 = ''
            equipe.eae4 = ''
            equipe.eae5 = ''
            equipe.save().then(() => {
                req.flash('success_msg', 'Equipe de instalação da estação de armazenamento excluída.')
                res.redirect('/pessoa/recursosArmazenamento/' + req.params.id)
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao excluir a equipe.')
                res.redirect('/pessoa/recursosArmazenamento/' + req.params.id)
            })
        }
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar a equipe')
        res.redirect('/pessoa/recursosArmazenamento/' + req.params.id)
    })
})

router.get('/limpaPainel/:id', ehAdmin, (req, res) => {
    Equipe.findOne({ projeto: req.params.id }).then((equipe) => {
        if (equipe.pnl0 != '' && typeof equipe.pnl0 != 'undefined') {
            equipe.pnl0 = ''
            equipe.pnl1 = ''
            equipe.pnl2 = ''
            equipe.pnl3 = ''
            equipe.pnl4 = ''
            equipe.pnl5 = ''
            equipe.save().then(() => {
                req.flash('success_msg', 'Equipe de instalação do painel elétrico excluída.')
                res.redirect('/pessoa/recursosPainel/' + req.params.id)
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao excluir a equipe.')
                res.redirect('/pessoa/recursosPainel/' + req.params.id)
            })
        }
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar a equipe')
        res.redirect('/pessoa/recursosPainel/' + req.params.id)
    })
})

router.get('/limpaVistoria/:id', ehAdmin, (req, res) => {
    Equipe.findOne({ projeto: req.params.id }).then((equipe) => {
        if (equipe.vis0 != '' && typeof equipe.vis0 != 'undefined') {
            equipe.vis0 = ''
            equipe.vis1 = ''
            equipe.vis2 = ''
            equipe.vis3 = ''
            equipe.vis4 = ''
            equipe.vis5 = ''
            equipe.save().then(() => {
                req.flash('success_msg', 'Equipe devistoria excluída.')
                res.redirect('/pessoa/recursosVistoria/' + req.params.id)
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao excluir a equipe.')
                res.redirect('/pessoa/recursosVistoria/' + req.params.id)
            })
        }
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar a equipe')
        res.redirect('/pessoa/recursosVistoria/' + req.params.id)
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
                user: _id,
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
                        //////console.log(qtdins)
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
                //console.log('equipe padrão')
                const equipe_nova = {
                    projeto: req.body.id,
                    user: _id,
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
                Pessoa.find({ funins: 'checked', user: _id }).lean().then((instaladores) => {
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
                                //console.log(qtdins)
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

router.get('/recursosPlanejamento/:id', ehAdmin, (req, res) => {
    const { _id } = req.user
    var ins_dentro = []
    var ins_fora = []
    var gestor_alocado = []
    var num_prj = 0
    var qtd_prj = 0
    var validaLivre = 0
    var q = 0
    var pla0 = ''
    var pla1 = ''
    var pla2 = ''
    var pla3 = ''
    var pla4 = ''
    var pla5 = ''
    var diferenca
    var ins_dif = 0
    var limpaPla = true

    Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
        Cronograma.findOne({ projeto: req.params.id }).lean().then((cronograma) => {
            var dateplaini = cronograma.agendaPlaIni
            var dateplafim = cronograma.agendaPlaFim
            var plaini
            Cronograma.find({ user: _id }).then((crono_date) => {
                if (crono_date != '') {
                    crono_date.forEach((elecro) => {
                        Projeto.findOne({ _id: elecro.projeto, orcado: true }).then((orcado) => {
                            qtd_prj = qtd_prj + 1
                            //console.log('orcado._id=>'+orcado._id)
                            if (orcado != null && orcado._id != req.params.id) {
                                diferenca = elecro.agendaPlaFim - elecro.agendaPlaIni
                                if (isNaN(diferenca) == false) {
                                    for (var x = 0; x < diferenca + 1; x++) {
                                        var date = elecro.dateplaini
                                        var ano = date.substring(0, 4)
                                        var mes = date.substring(5, 7) - parseFloat(1)
                                        var dia = date.substring(8, 11)
                                        var data = new Date(ano, mes, dia)
                                        var nova_data = new Date()
                                        nova_data.setDate(data.getDate() + parseFloat(x))
                                        ano = nova_data.getFullYear()
                                        mes = (nova_data.getMonth() + parseFloat(1))
                                        if (mes < 10) {
                                            mes = '0' + mes
                                        }
                                        dia = nova_data.getDate()
                                        if (dia < 10) {
                                            dia = '0' + dia
                                        }
                                        nova_data = ano + '' + mes + '' + dia

                                        if (dateplaini < nova_data) {
                                            plaini = nova_data
                                        } else {
                                            plaini = dateplaini
                                        }

                                        // console.log('orcado._id=>' + orcado._id)
                                        // console.log('elecro.date=>' + elecro.agendaPlaiIni)
                                        // console.log('cronograma.dateplaini=>' + dateplaini)
                                        // console.log('nova_data=>' + nova_data)
                                        // console.log('plaini=>' + plaini)
                                        if (nova_data == plaini && dateplaini >= plaini && date >= dateplaini) {
                                            //console.log('entrou')
                                            ins_dif = 1
                                            Pessoa.find({ funges: 'checked', user: _id }).then((gestores) => {
                                                gestores.forEach((eleges) => {
                                                    num_prj = num_prj + 1
                                                    //console.log('Recurso=>' + eleges.nome)
                                                    Equipe.findOne({ projeto: orcado._id, $or: [{ 'pla0': eleges.nome }, { 'pla1': eleges.nome }, { 'pla2': eleges.nome }, { 'pla3': eleges.nome }, { 'pla4': eleges.nome }, { 'pla5': eleges.nome }] }).then((equipe) => {
                                                        q = q + 1
                                                        if (equipe != null) {
                                                            if (gestor_alocado.length == 0) {
                                                                gestor_alocado.push({ nome: eleges.nome })
                                                                console.log(eleges.nome + ' está alocado.')
                                                            } else {
                                                                for (i = 0; i < gestor_alocado.length; i++) {
                                                                    if (gestor_alocado[i].nome != eleges.nome) {
                                                                        gestor_alocado.push({ nome: eleges.nome })
                                                                        console.log(eleges.nome + ' está alocado.')
                                                                    }
                                                                }
                                                            }
                                                            console.log('date=>' + date)
                                                            console.log('dateplaini=>' + dateplaini)
                                                            console.log('plaini=>' + plaini)
                                                        }
                                                        //console.log('num_prj=>' + num_prj)
                                                        //console.log('q=>' + q)
                                                        if (num_prj == q) {
                                                            //console.log('É o último!')
                                                            Equipe.findOne({ projeto: req.params.id }).then((equipepla) => {

                                                                //console.log('equipepla=>' + equipepla)

                                                                if (typeof equipepla.pla0 != 'undefined') {
                                                                    pla0 = equipepla.pla0
                                                                }
                                                                if (typeof equipepla.pla1 != 'undefined') {
                                                                    pla1 = equipepla.pla1
                                                                }
                                                                if (typeof equipepla.pla2 != 'undefined') {
                                                                    pla2 = equipepla.pla2
                                                                }
                                                                if (typeof equipepla.pla3 != 'undefined') {
                                                                    pla3 = equipepla.pla3
                                                                }
                                                                if (typeof equipepla.pla4 != 'undefined') {
                                                                    pla4 = equipepla.pla4
                                                                }
                                                                if (typeof equipepla.pla5 != 'undefined') {
                                                                    pla5 = equipepla.pla5
                                                                }
                                                                Pessoa.find({ funges: 'checked', user: _id }).sort({ nome: 'asc' }).then((planejamento) => {
                                                                    planejamento.forEach((elepla) => {
                                                                        //console.log('elepla.nome=>' + elepla.nome)
                                                                        if (gestor_alocado.length == '') {
                                                                            var nome = elepla.nome
                                                                            if (nome == pla0) {
                                                                                ins_dentro.push({ id: elepla._id, pla: nome })
                                                                            } else {
                                                                                if (nome == pla1) {
                                                                                    ins_dentro.push({ id: elepla._id, pla: nome })
                                                                                } else {
                                                                                    if (nome == pla2) {
                                                                                        ins_dentro.push({ id: elepla._id, pla: nome })
                                                                                    } else {
                                                                                        if (nome == pla3) {
                                                                                            ins_dentro.push({ id: elepla._id, pla: nome })
                                                                                        } else {
                                                                                            if (nome == pla4) {
                                                                                                ins_dentro.push({ id: elepla._id, pla: nome })
                                                                                            } else {
                                                                                                if (nome == pla5) {
                                                                                                    ins_dentro.push({ id: elepla._id, pla: nome })
                                                                                                } else {
                                                                                                    ins_fora.push({ id: elepla._id, pla: nome })
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        } else {
                                                                            //console.log('gestor_alocado.length=>' + gestor_alocado.length)
                                                                            const encontrou = gestor_alocado.find((user) => user.nome === elepla.nome)
                                                                            //console.log('encontrou recurso alocado=>' + encontrou)
                                                                            if (typeof encontrou == 'undefined') {
                                                                                //console.log(elepla.nome + ' não está alocado.')
                                                                                //console.log('pla0=>' + pla0)
                                                                                var nome = elepla.nome
                                                                                if (nome == pla0) {
                                                                                    ins_dentro.push({ id: elepla._id, pla: nome })
                                                                                } else {
                                                                                    if (nome == pla1) {
                                                                                        ins_dentro.push({ id: elepla._id, pla: nome })
                                                                                    } else {
                                                                                        if (nome == pla2) {
                                                                                            ins_dentro.push({ id: elepla._id, pla: nome })
                                                                                        } else {
                                                                                            if (nome == pla3) {
                                                                                                ins_dentro.push({ id: elepla._id, pla: nome })
                                                                                            } else {
                                                                                                if (nome == pla4) {
                                                                                                    ins_dentro.push({ id: elepla._id, pla: nome })
                                                                                                } else {
                                                                                                    if (nome == pla5) {
                                                                                                        ins_dentro.push({ id: elepla._id, pla: nome })
                                                                                                    } else {
                                                                                                        ins_fora.push({ id: elepla._id, pla: elepla.nome })
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            } else {
                                                                                //console.log('está alocado')
                                                                                var nome = elepla.nome
                                                                                if (nome == pla0) {
                                                                                    ins_dentro.push({ id: elepla._id, pla: nome })
                                                                                } else {
                                                                                    if (nome == pla1) {
                                                                                        ins_dentro.push({ id: elepla._id, pla: nome })
                                                                                    } else {
                                                                                        if (nome == pla2) {
                                                                                            ins_dentro.push({ id: elepla._id, pla: nome })
                                                                                        } else {
                                                                                            if (nome == pla3) {
                                                                                                ins_dentro.push({ id: elepla._id, pla: nome })
                                                                                            } else {
                                                                                                if (nome == pla4) {
                                                                                                    ins_dentro.push({ id: elepla._id, pla: nome })
                                                                                                } else {
                                                                                                    if (nome == pla5) {
                                                                                                        ins_dentro.push({ id: elepla._id, pla: nome })
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    })

                                                                    //console.log('ins_dentro_ultimo=>' + ins_dentro)
                                                                    //console.log('ins_fora_ultimo=>' + ins_fora)
                                                                    if (equipepla.pla0 == '' || typeof equipepla.pla0 == 'undefined') {
                                                                        limpaPla = false
                                                                    }
                                                                    res.render('projeto/gerenciamento/recursosPlanejamento', { projeto, cronograma, equipepla, fora: ins_fora, dentro: ins_dentro, limpaPla })

                                                                }).catch((err) => {
                                                                    req.flash('error_msg', 'Falha ao encontrar o gestor<último>.')
                                                                    res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                                                })
                                                            }).catch((err) => {
                                                                req.flash('error_msg', 'Falha ao encontrar a equipe<último>.')
                                                                res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                                            })
                                                        }
                                                    }).catch((err) => {
                                                        req.flash('error_msg', 'Falha ao encontrar as equipes.')
                                                        res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                                    })
                                                })

                                            }).catch((err) => {
                                                req.flash('error_msg', 'Falha ao encontrar os gestores.')
                                                res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                            })
                                        }
                                    }
                                }
                            }
                            if (validaLivre == 0 && ins_dif == 0 && qtd_prj == crono_date.length) {
                                validaLivre = 1
                                Equipe.findOne({ projeto: req.params.id }).lean().then((equipepla) => {
                                    Pessoa.find({ funges: 'checked', user: _id }).then((planejamento) => {
                                        //console.log('equipepla.pla0=>' + equipepla.pla0)
                                        if (typeof equipepla.pla0 != 'undefined') {
                                            pla0 = equipepla.pla0
                                        }
                                        if (typeof equipepla.pla1 != 'undefined') {
                                            pla1 = equipepla.pla1
                                        }
                                        if (typeof equipepla.pla2 != 'undefined') {
                                            pla2 = equipepla.pla2
                                        }
                                        if (typeof equipepla.pla3 != 'undefined') {
                                            pla3 = equipepla.pla3
                                        }
                                        if (typeof equipepla.pla4 != 'undefined') {
                                            pla4 = equipepla.pla4
                                        }
                                        if (typeof equipepla.pla5 != 'undefined') {
                                            pla5 = equipepla.pla5
                                        }

                                        planejamento.forEach((elepla) => {
                                            if (gestor_alocado.length == '') {
                                                var nome = elepla.nome

                                                if (nome == pla0) {
                                                    ins_dentro.push({ id: elepla._id, pla: nome })
                                                } else {
                                                    if (nome == pla1) {
                                                        ins_dentro.push({ id: elepla._id, pla: nome })
                                                    } else {
                                                        if (nome == pla2) {
                                                            ins_dentro.push({ id: elepla._id, pla: nome })
                                                        } else {
                                                            if (nome == pla3) {
                                                                ins_dentro.push({ id: elepla._id, pla: nome })
                                                            } else {
                                                                if (nome == pla4) {
                                                                    ins_dentro.push({ id: elepla._id, pla: nome })
                                                                } else {
                                                                    if (nome == pla5) {
                                                                        ins_dentro.push({ id: elepla._id, pla: nome })
                                                                    } else {
                                                                        ins_fora.push({ id: elepla._id, pla: nome })
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        })
                                        //console.log('ins_dentro_data=>' + ins_dentro)
                                        //console.log('ins_fora_data=>' + ins_fora)
                                        if (equipepla.pla0 == '' || typeof equipepla.pla0 == 'undefined') {
                                            limpaPla = false
                                        }
                                        res.render('projeto/gerenciamento/recursosPlanejamento', { projeto, cronograma, equipepla, fora: ins_fora, dentro: ins_dentro, limpaPla })

                                    }).catch((err) => {
                                        req.flash('error_msg', 'Falha ao encontrar o gestor<data>.')
                                        res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Falha ao encontrar a equipe<data>.')
                                    res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                })
                            }
                        }).catch((err) => {
                            req.flash('error_msg', 'Falha ao encontrar o projeto.')
                            res.redirect('/gerenciamento/cronograma/' + req.params.id)
                        })
                    })
                }
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao encontrar o cronograma.')
                res.redirect('/gerenciamento/cronograma/' + req.params.id)
            })
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao encontrar o cronograma.')
            res.redirect('/gerenciamento/cronograma/' + req.params.id)
        })
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar o projeto.')
        res.redirect('/gerenciamento/cronograma/' + req.params.id)
    })
})

router.get('/recursosProjetista/:id', ehAdmin, (req, res) => {
    const { _id } = req.user
    var ins_dentro = []
    var ins_fora = []
    var projetista_alocado = []
    var num_prj = 0
    var qtd_prj = 0
    var validaLivre = 0
    var q = 0
    var pro0 = ''
    var pro1 = ''
    var pro2 = ''
    var pro3 = ''
    var pro4 = ''
    var pro5 = ''
    var diferenca
    var ins_dif = 0
    var limpaPro = true

    Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
        Cronograma.findOne({ projeto: req.params.id }).lean().then((cronograma) => {
            var dateprjini = cronograma.agendaPrjIni
            var dateprjfim = cronograma.agendaPrjFim
            var proini
            Cronograma.find({ user: _id }).then((crono_date) => {
                if (crono_date != '') {
                    crono_date.forEach((elecro) => {
                        Projeto.findOne({ _id: elecro.projeto, orcado: true }).then((orcado) => {
                            qtd_prj = qtd_prj + 1
                            //console.log('orcado._id=>'+orcado._id)
                            if (orcado != null && orcado._id != req.params.id) {
                                diferenca = elecro.agendaPrjFim - elecro.agendaPrjIni
                                if (isNaN(diferenca) == false) {
                                    for (var x = 0; x < diferenca + 1; x++) {
                                        var date = elecro.dateprjini
                                        var ano = date.substring(0, 4)
                                        var mes = date.substring(5, 7) - parseFloat(1)
                                        var dia = date.substring(8, 11)
                                        var data = new Date(ano, mes, dia)
                                        var nova_data = new Date()
                                        nova_data.setDate(data.getDate() + parseFloat(x))
                                        ano = nova_data.getFullYear()
                                        mes = (nova_data.getMonth() + parseFloat(1))
                                        if (mes < 10) {
                                            mes = '0' + mes
                                        }
                                        dia = nova_data.getDate()
                                        if (dia < 10) {
                                            dia = '0' + dia
                                        }
                                        nova_data = ano + '' + mes + '' + dia

                                        if (dateprjini < nova_data) {
                                            proini = nova_data
                                        } else {
                                            proini = dateprjini
                                        }

                                        //console.log('orcado._id=>' + orcado._id)
                                        //console.log('elecro.date=>' + elecro.agendaPlaiIni)
                                        //console.log('cronograma.dateprjini=>' + dateprjini)
                                        //console.log('nova_data=>' + nova_data)
                                        //console.log('proini=>' + proini)

                                        if (nova_data == proini && dateprjini >= proini && date > dateprjini) {
                                            //console.log('entrou')
                                            ins_dif = 1
                                            Pessoa.find({ funpro: 'checked', user: _id }).then((proje) => {
                                                proje.forEach((eleprj) => {
                                                    num_prj = num_prj + 1
                                                    //console.log('Recurso=>' + eleprj.nome)
                                                    Equipe.findOne({ projeto: orcado._id, $or: [{ 'pro0': eleprj.nome }, { 'pro1': eleprj.nome }, { 'pro2': eleprj.nome }, { 'pro3': eleprj.nome }, { 'pro4': eleprj.nome }, { 'pro5': eleprj.nome }] }).then((equipe) => {
                                                        q = q + 1
                                                        if (equipe != null) {
                                                            if (projetista_alocado.length == 0) {
                                                                projetista_alocado.push({ nome: eleprj.nome })
                                                                //console.log(eleprj.nome + ' está alocado.')
                                                            } else {
                                                                for (i = 0; i < projetista_alocado.length; i++) {
                                                                    if (projetista_alocado[i].nome != eleprj.nome) {
                                                                        projetista_alocado.push({ nome: eleprj.nome })
                                                                        //console.log(eleprj.nome + ' está alocado.')
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        //console.log('num_prj=>' + num_prj)
                                                        //console.log('q=>' + q)
                                                        if (num_prj == q) {
                                                            //console.log('É o último!')
                                                            Equipe.findOne({ projeto: req.params.id }).lean().then((equipepro) => {

                                                                //console.log('equipepro.pro0=>' + equipepro.pro0)

                                                                if (typeof equipepro.pro0 != 'undefined') {
                                                                    pro0 = equipepro.pro0
                                                                }
                                                                if (typeof equipepro.pro1 != 'undefined') {
                                                                    pro1 = equipepro.pro1
                                                                }
                                                                if (typeof equipepro.pro2 != 'undefined') {
                                                                    pro2 = equipepro.pro2
                                                                }
                                                                if (typeof equipepro.pro3 != 'undefined') {
                                                                    pro3 = equipepro.pro3
                                                                }
                                                                if (typeof equipepro.pro4 != 'undefined') {
                                                                    pro4 = equipepro.pro4
                                                                }
                                                                if (typeof equipepro.pro5 != 'undefined') {
                                                                    pro5 = equipepro.pro5
                                                                }
                                                                Pessoa.find({ funpro: 'checked', user: _id }).sort({ nome: 'asc' }).then((projetista) => {
                                                                    projetista.forEach((elepro) => {
                                                                        //console.log('elepro.nome=>' + elepro.nome)
                                                                        if (projetista_alocado.length == '') {
                                                                            var nome = elepro.nome
                                                                            if (nome == pro0) {
                                                                                ins_dentro.push({ id: elepro._id, pro: nome })
                                                                            } else {
                                                                                if (nome == pro1) {
                                                                                    ins_dentro.push({ id: elepro._id, pro: nome })
                                                                                } else {
                                                                                    if (nome == pro2) {
                                                                                        ins_dentro.push({ id: elepro._id, pro: nome })
                                                                                    } else {
                                                                                        if (nome == pro3) {
                                                                                            ins_dentro.push({ id: elepro._id, pro: nome })
                                                                                        } else {
                                                                                            if (nome == pro4) {
                                                                                                ins_dentro.push({ id: elepro._id, pro: nome })
                                                                                            } else {
                                                                                                if (nome == pro5) {
                                                                                                    ins_dentro.push({ id: elepro._id, pro: nome })
                                                                                                } else {
                                                                                                    ins_fora.push({ id: elepro._id, pro: nome })
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        } else {
                                                                            //console.log('projetista_alocado.length=>' + projetista_alocado.length)
                                                                            const encontrou = projetista_alocado.find((user) => user.nome === elepro.nome)
                                                                            //console.log('encontrou recurso alocado=>' + encontrou)
                                                                            if (typeof encontrou == 'undefined') {
                                                                                //console.log(elepro.nome + ' não está alocado.')
                                                                                //console.log('pro0=>' + pro0)
                                                                                var nome = elepro.nome
                                                                                if (nome == pro0) {
                                                                                    ins_dentro.push({ id: elepro._id, pro: nome })
                                                                                } else {
                                                                                    if (nome == pro1) {
                                                                                        ins_dentro.push({ id: elepro._id, pro: nome })
                                                                                    } else {
                                                                                        if (nome == pro2) {
                                                                                            ins_dentro.push({ id: elepro._id, pro: nome })
                                                                                        } else {
                                                                                            if (nome == pro3) {
                                                                                                ins_dentro.push({ id: elepro._id, pro: nome })
                                                                                            } else {
                                                                                                if (nome == pro4) {
                                                                                                    ins_dentro.push({ id: elepro._id, pro: nome })
                                                                                                } else {
                                                                                                    if (nome == pro5) {
                                                                                                        ins_dentro.push({ id: elepro._id, pro: nome })
                                                                                                    } else {
                                                                                                        ins_fora.push({ id: elepro._id, pro: elepro.nome })
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            } else {
                                                                                var nome = elepro.nome
                                                                                if (nome == pro0) {
                                                                                    ins_dentro.push({ id: elepro._id, pro: nome })
                                                                                } else {
                                                                                    if (nome == pro1) {
                                                                                        ins_dentro.push({ id: elepro._id, pro: nome })
                                                                                    } else {
                                                                                        if (nome == pro2) {
                                                                                            ins_dentro.push({ id: elepro._id, pro: nome })
                                                                                        } else {
                                                                                            if (nome == pro3) {
                                                                                                ins_dentro.push({ id: elepro._id, pro: nome })
                                                                                            } else {
                                                                                                if (nome == pro4) {
                                                                                                    ins_dentro.push({ id: elepro._id, pro: nome })
                                                                                                } else {
                                                                                                    if (nome == pro5) {
                                                                                                        ins_dentro.push({ id: elepro._id, pro: nome })
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    })

                                                                    //console.log('ins_dentro=>' + ins_dentro)
                                                                    //console.log('ins_fora=>' + ins_fora)
                                                                    if (equipepro.pro0 == '' || typeof equipepro.pro0 == 'undefined') {
                                                                        limpaPro = false
                                                                    }
                                                                    res.render('projeto/gerenciamento/recursosProjeto', { projeto, cronograma, fora: ins_fora, dentro: ins_dentro, limpaPro })
                                                                }).catch((err) => {
                                                                    req.flash('error_msg', 'Falha ao encontrar o projetista.')
                                                                    res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                                                })
                                                            }).catch((err) => {
                                                                req.flash('error_msg', 'Falha ao encontrar a equipe.')
                                                                res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                                            })
                                                        }
                                                    }).catch((err) => {
                                                        req.flash('error_msg', 'Falha ao encontrar as equipes.')
                                                        res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                                    })
                                                })

                                            }).catch((err) => {
                                                req.flash('error_msg', 'Falha ao encontrar os projetistas.')
                                                res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                            })
                                        }
                                    }
                                }
                            }
                            if (validaLivre == 0 && ins_dif == 0 && qtd_prj == crono_date.length) {
                                validaLivre = 1
                                Equipe.findOne({ projeto: req.params.id }).lean().then((equipepro) => {
                                    Pessoa.find({ funpro: 'checked', user: _id }).then((projetista) => {
                                        //console.log('equipepro.pro0=>' + equipepro.pro0)

                                        if (typeof equipepro.pro0 != 'undefined') {
                                            pro0 = equipepro.pro0
                                        }
                                        if (typeof equipepro.pro1 != 'undefined') {
                                            pro1 = equipepro.pro1
                                        }
                                        if (typeof equipepro.pro2 != 'undefined') {
                                            pro2 = equipepro.pro2
                                        }
                                        if (typeof equipepro.pro3 != 'undefined') {
                                            pro3 = equipepro.pro3
                                        }
                                        if (typeof equipepro.pro4 != 'undefined') {
                                            pro4 = equipepro.pro4
                                        }
                                        if (typeof equipepro.pro5 != 'undefined') {
                                            pro5 = equipepro.pro5
                                        }

                                        projetista.forEach((elepro) => {
                                            if (projetista_alocado.length == '') {
                                                var nome = elepro.nome

                                                if (nome == pro0) {
                                                    ins_dentro.push({ id: elepro._id, pro: nome })
                                                } else {
                                                    if (nome == pro1) {
                                                        ins_dentro.push({ id: elepro._id, pro: nome })
                                                    } else {
                                                        if (nome == pro2) {
                                                            ins_dentro.push({ id: elepro._id, pro: nome })
                                                        } else {
                                                            if (nome == pro3) {
                                                                ins_dentro.push({ id: elepro._id, pro: nome })
                                                            } else {
                                                                if (nome == pro4) {
                                                                    ins_dentro.push({ id: elepro._id, pro: nome })
                                                                } else {
                                                                    if (nome == pro5) {
                                                                        ins_dentro.push({ id: elepro._id, pro: nome })
                                                                    } else {
                                                                        ins_fora.push({ id: elepro._id, pro: nome })
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        })
                                        //console.log('ins_dentro=>' + ins_dentro)
                                        //console.log('ins_fora=>' + ins_fora)
                                        if (equipepro.pro0 == '' || typeof equipepro.pro0 == 'undefined') {
                                            limpaPro = false
                                        }
                                        res.render('projeto/gerenciamento/recursosProjeto', { projeto, cronograma, fora: ins_fora, dentro: ins_dentro, limpaPro })

                                    }).catch((err) => {
                                        req.flash('error_msg', 'Falha ao encontrar o projetista.')
                                        res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Falha ao encontrar a equipe.')
                                    res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                })
                            }
                        }).catch((err) => {
                            req.flash('error_msg', 'Falha ao encontrar o projeto.')
                            res.redirect('/gerenciamento/cronograma/' + req.params.id)
                        })
                    })
                }
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao encontrar o cronograma.')
                res.redirect('/gerenciamento/cronograma/' + req.params.id)
            })
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao encontrar o cronograma.')
            res.redirect('/gerenciamento/cronograma/' + req.params.id)
        })
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar o projeto.')
        res.redirect('/gerenciamento/cronograma/' + req.params.id)
    })
})

router.get('/recursosAterramento/:id', ehAdmin, (req, res) => {
    const { _id } = req.user
    var ins_dentro = []
    var ins_fora = []
    var instalador_alocado = []
    var num_prj = 0
    var qtd_prj = 0
    var validaLivre = 0
    var q = 0
    var ate0 = ''
    var ate1 = ''
    var ate2 = ''
    var ate3 = ''
    var ate4 = ''
    var ate5 = ''
    var diferenca
    var ins_dif = 0
    var limpaAte = true

    Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
        //console.log('validação dos instaladores.')
        Cronograma.findOne({ projeto: req.params.id }).lean().then((cronograma) => {
            var dateateini = cronograma.agendaAteIni
            var estini
            //console.log('cronograma.agendaEstIni=>' + cronograma.agendaEstIni)
            //console.log('cronograma.agendaModFim=>' + cronograma.agendaModFim)
            Cronograma.find({ user: _id }).then((crono_date) => {
                if (crono_date != '') {
                    crono_date.forEach((elecro) => {
                        Projeto.findOne({ _id: elecro.projeto, orcado: true }).then((orcado) => {
                            qtd_prj = qtd_prj + 1
                            if (orcado != null && orcado._id != req.params.id) {
                                diferenca = elecro.agendaAteFim - elecro.agendaAteIni
                                //console.log('orcado._id=>' + orcado._id)                                
                                if (isNaN(diferenca) == false) {
                                    for (var x = 0; x < diferenca + 1; x++) {
                                        var date = elecro.dateateini
                                        var ano = date.substring(0, 4)
                                        var mes = date.substring(5, 7) - parseFloat(1)
                                        var dia = date.substring(8, 11)
                                        var data = new Date(ano, mes, dia)
                                        var nova_data = new Date()
                                        nova_data.setDate(data.getDate() + parseFloat(x))
                                        ano = nova_data.getFullYear()
                                        mes = (nova_data.getMonth() + parseFloat(1))
                                        if (mes < 10) {
                                            mes = '0' + mes
                                        }
                                        dia = nova_data.getDate()
                                        if (dia < 10) {
                                            dia = '0' + dia
                                        }
                                        nova_data = ano + '' + mes + '' + dia

                                        if (dateateini < nova_data) {
                                            estini = nova_data
                                        } else {
                                            estini = dateateini
                                        }

                                        //console.log('diferenca=>' + diferenca)
                                        //console.log('elecro.date=>' + elecro.agendaEstIni)
                                        //console.log('cronograma.dateestini=>' + dateestini)
                                        //console.log('nova_data=>' + nova_data)
                                        //console.log('estini=>' + estini)

                                        if (nova_data == estini && dateateini >= estini && date >= dateateini) {
                                            ins_dif = 1
                                            //console.log('entrou')
                                            Pessoa.find({ funins: 'checked', user: _id }).then((instaladores) => {
                                                instaladores.forEach((eleins) => {
                                                    num_prj = num_prj + 1
                                                    //console.log('Recurso=>' + eleins.nome)
                                                    Equipe.findOne({ projeto: orcado._id, $or: [{ 'ate0': eleins.nome }, { 'ate1': eleins.nome }, { 'ate2': eleins.nome }, { 'ate3': eleins.nome }, { 'ate4': eleins.nome }, { 'ate5': eleins.nome }] }).then((equipe) => {
                                                        //console.log('equipe=>' + equipe)
                                                        q = q + 1
                                                        if (equipe != null) {
                                                            if (instalador_alocado.length == 0) {
                                                                instalador_alocado.push({ nome: eleins.nome })
                                                                console.log(eleins.nome + ' está alocado.')
                                                            } else {
                                                                for (i = 0; i < instalador_alocado.length; i++) {
                                                                    if (instalador_alocado[i].nome != eleins.nome) {
                                                                        instalador_alocado.push({ nome: eleins.nome })
                                                                        console.log(eleins.nome + ' está alocado.')
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        //console.log('num_prj=>' + num_prj)
                                                        //console.log('q=>' + q)
                                                        if (num_prj == q) {
                                                            //console.log('É o último!')
                                                            Equipe.findOne({ projeto: req.params.id }).lean().then((equipeins) => {

                                                                //console.log('equipeins.ins0=>' + equipeins.ins0)
                                                                //console.log('equipeins.ins1=>' + equipeins.ins1)
                                                                //console.log('equipeins.ins2=>' + equipeins.ins2)
                                                                //console.log('equipeins.ins3=>' + equipeins.ins3)
                                                                //console.log('equipeins.ins4=>' + equipeins.ins4)
                                                                //console.log('equipeins.ins5=>' + equipeins.ins5)

                                                                if (typeof equipeins.ate0 != 'undefined') {
                                                                    ate0 = equipeins.ate0
                                                                }
                                                                if (typeof equipeins.ate1 != 'undefined') {
                                                                    ate1 = equipeins.ate1
                                                                }
                                                                if (typeof equipeins.ate2 != 'undefined') {
                                                                    ate2 = equipeins.ate2
                                                                }
                                                                if (typeof equipeins.ate3 != 'undefined') {
                                                                    ate3 = equipeins.ate3
                                                                }
                                                                if (typeof equipeins.ate4 != 'undefined') {
                                                                    ate4 = equipeins.ate4
                                                                }
                                                                if (typeof equipeins.ate5 != 'undefined') {
                                                                    ate5 = equipeins.ate5
                                                                }
                                                                console.log('orcado._id=>' + orcado._id)
                                                                Pessoa.find({ funins: 'checked', user: _id }).sort({ nome: 'asc' }).then((instalacao) => {
                                                                    instalacao.forEach((eleint) => {
                                                                        //console.log('instalador_alocado.length=>' + instalador_alocado.length)
                                                                        //console.log('eleint.nome=>' + eleint.nome)
                                                                        if (instalador_alocado.length == '') {
                                                                            //console.log('não tem instalador alocado')
                                                                            var nome = eleint.nome
                                                                            var id = eleint._id
                                                                            if (nome == ate0) {
                                                                                ins_dentro.push({ id: id, ins: nome })
                                                                            } else {
                                                                                if (nome == ate1) {
                                                                                    ins_dentro.push({ id: id, ins: nome })
                                                                                } else {
                                                                                    if (nome == ate2) {
                                                                                        ins_dentro.push({ id: id, ins: nome })
                                                                                    } else {
                                                                                        if (nome == ate3) {
                                                                                            ins_dentro.push({ id: id, ins: nome })
                                                                                        } else {
                                                                                            if (nome == ate4) {
                                                                                                ins_dentro.push({ id: id, ins: nome })
                                                                                            } else {
                                                                                                if (nome == ate5) {
                                                                                                    ins_dentro.push({ id: id, ins: nome })
                                                                                                } else {
                                                                                                    ins_fora.push({ id: id, ins: nome })
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        } else {
                                                                            const encontrou_ins = instalador_alocado.find((user) => user.nome === eleint.nome)
                                                                            console.log('encontrou recurso alocado=>' + encontrou_ins)
                                                                            if (typeof encontrou_ins == 'undefined') {
                                                                                var nome = eleint.nome
                                                                                var id = eleint._id
                                                                                console.log(nome + ' não está alocado.')
                                                                                if (nome == ate0) {
                                                                                    ins_dentro.push({ id: id, ins: nome })
                                                                                } else {
                                                                                    if (nome == ate1) {
                                                                                        ins_dentro.push({ id: id, ins: nome })
                                                                                    } else {
                                                                                        if (nome == ate2) {
                                                                                            ins_dentro.push({ id: id, ins: nome })
                                                                                        } else {
                                                                                            if (nome == ate3) {
                                                                                                ins_dentro.push({ id: id, ins: nome })
                                                                                            } else {
                                                                                                if (nome == ate4) {
                                                                                                    ins_dentro.push({ id: id, ins: nome })
                                                                                                } else {
                                                                                                    if (nome == ate5) {
                                                                                                        ins_dentro.push({ id: id, ins: nome })
                                                                                                    } else {
                                                                                                        ins_fora.push({ id: id, ins: nome })
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            } else {
                                                                                var nome = eleint.nome
                                                                                var id = eleint._id
                                                                                console.log(nome + ' está alocado.')
                                                                                if (nome == ate0) {
                                                                                    ins_dentro.push({ id: id, ins: nome })
                                                                                } else {
                                                                                    if (nome == ate1) {
                                                                                        ins_dentro.push({ id: id, ins: nome })
                                                                                    } else {
                                                                                        if (nome == ate2) {
                                                                                            ins_dentro.push({ id: id, ins: nome })
                                                                                        } else {
                                                                                            if (nome == ate3) {
                                                                                                ins_dentro.push({ id: id, ins: nome })
                                                                                            } else {
                                                                                                if (nome == ate4) {
                                                                                                    ins_dentro.push({ id: id, ins: nome })
                                                                                                } else {
                                                                                                    if (nome == ate5) {
                                                                                                        ins_dentro.push({ id: id, ins: nome })
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    })

                                                                    //console.log('ins_dentro_ultimo=>' + ins_dentro)
                                                                    //console.log('ins_fora_ultimo=>' + ins_fora)
                                                                    if (equipeins.ate0 == '' || typeof equipeins.ate0 == 'undefined') {
                                                                        limpaAte = false
                                                                    }
                                                                    res.render('projeto/gerenciamento/recursosAterramento', { projeto, cronograma, fora: ins_fora, dentro: ins_dentro, limpaAte })
                                                                }).catch((err) => {
                                                                    req.flash('error_msg', 'Falha ao encontrar os instaladores.')
                                                                    res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                                                })
                                                            }).catch((err) => {
                                                                req.flash('error_msg', 'Falha ao encontrar os instaladores na equipe.')
                                                                res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                                            })
                                                        }
                                                    }).catch((err) => {
                                                        req.flash('error_msg', 'Falha ao encontrar as equipes.')
                                                        res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                                    })
                                                })

                                            }).catch((err) => {
                                                req.flash('error_msg', 'Falha ao encontrar os instaladores na equipe.')
                                                res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                            })
                                        }
                                    }
                                }
                            }
                            if (validaLivre == 0 && ins_dif == 0 && qtd_prj == crono_date.length) {
                                validaLivre = 1
                                Equipe.findOne({ projeto: req.params.id }).lean().then((equipeins) => {
                                    Pessoa.find({ funins: 'checked', user: _id }).then((instalacao) => {
                                        //console.log('entrou diferença')
                                        //console.log('equipeins.ins0=>' + equipeins.ins0)
                                        if (typeof equipeins.ate0 != 'undefined') {
                                            ate0 = equipeins.ate0
                                        }
                                        if (typeof equipeins.ate1 != 'undefined') {
                                            ate1 = equipeins.ate1
                                        }
                                        if (typeof equipeins.ate2 != 'undefined') {
                                            ate2 = equipeins.ate2
                                        }
                                        if (typeof equipeins.ate3 != 'undefined') {
                                            ate3 = equipeins.ate3
                                        }
                                        if (typeof equipeins.ate4 != 'undefined') {
                                            ate4 = equipeins.ate4
                                        }
                                        if (typeof equipeins.ate5 != 'undefined') {
                                            ate5 = equipeins.ate5
                                        }

                                        instalacao.forEach((eleint) => {

                                            var nome = eleint.nome
                                            var id = eleint._id
                                            if (nome == ate0) {
                                                ins_dentro.push({ id: id, ins: nome })
                                            } else {
                                                if (nome == ate1) {
                                                    ins_dentro.push({ id: id, ins: nome })
                                                } else {
                                                    if (nome == ate2) {
                                                        ins_dentro.push({ id: id, ins: nome })
                                                    } else {
                                                        if (nome == ate3) {
                                                            ins_dentro.push({ id: id, ins: nome })
                                                        } else {
                                                            if (nome == ate4) {
                                                                ins_dentro.push({ id: id, ins: nome })
                                                            } else {
                                                                if (nome == ate5) {
                                                                    ins_dentro.push({ id: id, ins: nome })
                                                                } else {
                                                                    ins_fora.push({ id: id, ins: nome })
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        })
                                        //console.log('ins_dentro_dif=>' + ins_dentro)
                                        //console.log('ins_fora_dif=>' + ins_fora)
                                        if (equipeins.ate0 == '' || typeof equipeins.ate0 == 'undefined') {
                                            limpaAte = false
                                        }
                                        res.render('projeto/gerenciamento/recursosAterramento', { projeto, cronograma, fora: ins_fora, dentro: ins_dentro, limpaAte })

                                    }).catch((err) => {
                                        req.flash('error_msg', 'Falha ao encontrar os instaladores.')
                                        res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Falha ao encontrar os instaladores na equipe.')
                                    res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                })
                            }
                        }).catch((err) => {
                            req.flash('error_msg', 'Falha ao encontrar o projeto.')
                            res.redirect('/gerenciamento/cronograma/' + req.params.id)
                        })
                    })
                }
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao encontrar o cronograma.')
                res.redirect('/gerenciamento/cronograma/' + req.params.id)
            })
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao encontrar o cronograma.')
            res.redirect('/gerenciamento/cronograma/' + req.params.id)
        })
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar o projeto.')
        res.redirect('/gerenciamento/cronograma/' + req.params.id)
    })
})

router.get('/recursosInversores/:id', ehAdmin, (req, res) => {
    const { _id } = req.user
    var ins_dentro = []
    var ins_fora = []
    var instalador_alocado = []
    var num_prj = 0
    var qtd_prj = 0
    var validaLivre = 0
    var q = 0
    var inv0 = ''
    var inv1 = ''
    var inv2 = ''
    var inv3 = ''
    var inv4 = ''
    var inv5 = ''
    var diferenca
    var ins_dif = 0
    var limpaInv = true

    Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
        //console.log('validação dos instaladores.')
        Cronograma.findOne({ projeto: req.params.id }).lean().then((cronograma) => {
            var dateinvini = cronograma.agendaInvIni
            var estini
            //console.log('cronograma.agendaEstIni=>' + cronograma.agendaEstIni)
            //console.log('cronograma.agendaModFim=>' + cronograma.agendaModFim)
            Cronograma.find({ user: _id }).then((crono_date) => {
                if (crono_date != '') {
                    crono_date.forEach((elecro) => {
                        Projeto.findOne({ _id: elecro.projeto, orcado: true }).then((orcado) => {
                            qtd_prj = qtd_prj + 1
                            if (orcado != null && orcado._id != req.params.id) {
                                diferenca = elecro.agendaModFim - elecro.agendaEstIni
                                //console.log('orcado._id=>' + orcado._id)                                
                                if (isNaN(diferenca) == false) {
                                    for (var x = 0; x < diferenca + 1; x++) {
                                        var date = elecro.dateinvini
                                        var ano = date.substring(0, 4)
                                        var mes = date.substring(5, 7) - parseFloat(1)
                                        var dia = date.substring(8, 11)
                                        var data = new Date(ano, mes, dia)
                                        var nova_data = new Date()
                                        nova_data.setDate(data.getDate() + parseFloat(x))
                                        ano = nova_data.getFullYear()
                                        mes = (nova_data.getMonth() + parseFloat(1))
                                        if (mes < 10) {
                                            mes = '0' + mes
                                        }
                                        dia = nova_data.getDate()
                                        if (dia < 10) {
                                            dia = '0' + dia
                                        }
                                        nova_data = ano + '' + mes + '' + dia

                                        if (dateinvini < nova_data) {
                                            estini = nova_data
                                        } else {
                                            estini = dateinvini
                                        }

                                        //console.log('diferenca=>' + diferenca)
                                        //console.log('elecro.date=>' + elecro.agendaEstIni)
                                        //console.log('cronograma.dateinvini=>' + dateinvini)
                                        //console.log('nova_data=>' + nova_data)
                                        //console.log('estini=>' + estini)

                                        if (nova_data == estini && dateinvini >= estini && date >= dateinvini) {
                                            ins_dif = 1
                                            //console.log('entrou')
                                            Pessoa.find({ funins: 'checked', user: _id }).then((instaladores) => {
                                                instaladores.forEach((eleins) => {
                                                    num_prj = num_prj + 1
                                                    //console.log('Recurso=>' + eleins.nome)
                                                    Equipe.findOne({ projeto: orcado._id, $or: [{ 'inv0': eleins.nome }, { 'inv1': eleins.nome }, { 'inv2': eleins.nome }, { 'inv3': eleins.nome }, { 'inv4': eleins.nome }, { 'inv5': eleins.nome }] }).then((equipe) => {
                                                        //console.log('equipe=>' + equipe)
                                                        q = q + 1
                                                        if (equipe != null) {
                                                            if (instalador_alocado.length == 0) {
                                                                instalador_alocado.push({ nome: eleins.nome })
                                                                console.log(eleins.nome + ' está alocado.')
                                                            } else {
                                                                for (i = 0; i < instalador_alocado.length; i++) {
                                                                    if (instalador_alocado[i].nome != eleins.nome) {
                                                                        instalador_alocado.push({ nome: eleins.nome })
                                                                        console.log(eleins.nome + ' está alocado.')
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        //console.log('num_prj=>' + num_prj)
                                                        //console.log('q=>' + q)
                                                        if (num_prj == q) {
                                                            //console.log('É o último!')
                                                            Equipe.findOne({ projeto: req.params.id }).lean().then((equipeins) => {

                                                                //console.log('equipeins.ins0=>' + equipeins.ins0)
                                                                //console.log('equipeins.ins1=>' + equipeins.ins1)
                                                                //console.log('equipeins.ins2=>' + equipeins.ins2)
                                                                //console.log('equipeins.ins3=>' + equipeins.ins3)
                                                                //console.log('equipeins.ins4=>' + equipeins.ins4)
                                                                //console.log('equipeins.ins5=>' + equipeins.ins5)

                                                                if (typeof equipeins.inv0 != 'undefined') {
                                                                    inv0 = equipeins.inv0
                                                                }
                                                                if (typeof equipeins.inv1 != 'undefined') {
                                                                    inv1 = equipeins.inv1
                                                                }
                                                                if (typeof equipeins.inv2 != 'undefined') {
                                                                    inv2 = equipeins.inv2
                                                                }
                                                                if (typeof equipeins.inv3 != 'undefined') {
                                                                    inv3 = equipeins.inv3
                                                                }
                                                                if (typeof equipeins.inv4 != 'undefined') {
                                                                    inv4 = equipeins.inv4
                                                                }
                                                                if (typeof equipeins.inv5 != 'undefined') {
                                                                    inv5 = equipeins.inv5
                                                                }
                                                                console.log('orcado._id=>' + orcado._id)
                                                                Pessoa.find({ funins: 'checked', user: _id }).sort({ nome: 'asc' }).then((instalacao) => {
                                                                    instalacao.forEach((eleint) => {
                                                                        //console.log('instalador_alocado.length=>' + instalador_alocado.length)
                                                                        //console.log('eleint.nome=>' + eleint.nome)
                                                                        if (instalador_alocado.length == '') {
                                                                            //console.log('não tem instalador alocado')
                                                                            var nome = eleint.nome
                                                                            var id = eleint._id
                                                                            if (nome == inv0) {
                                                                                ins_dentro.push({ id: id, ins: nome })
                                                                            } else {
                                                                                if (nome == inv1) {
                                                                                    ins_dentro.push({ id: id, ins: nome })
                                                                                } else {
                                                                                    if (nome == inv2) {
                                                                                        ins_dentro.push({ id: id, ins: nome })
                                                                                    } else {
                                                                                        if (nome == inv3) {
                                                                                            ins_dentro.push({ id: id, ins: nome })
                                                                                        } else {
                                                                                            if (nome == inv4) {
                                                                                                ins_dentro.push({ id: id, ins: nome })
                                                                                            } else {
                                                                                                if (nome == inv5) {
                                                                                                    ins_dentro.push({ id: id, ins: nome })
                                                                                                } else {
                                                                                                    ins_fora.push({ id: id, ins: nome })
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        } else {
                                                                            const encontrou_ins = instalador_alocado.find((user) => user.nome === eleint.nome)
                                                                            console.log('encontrou recurso alocado=>' + encontrou_ins)
                                                                            if (typeof encontrou_ins == 'undefined') {
                                                                                var nome = eleint.nome
                                                                                var id = eleint._id
                                                                                console.log(nome + ' não está alocado.')
                                                                                if (nome == inv0) {
                                                                                    ins_dentro.push({ id: id, ins: nome })
                                                                                } else {
                                                                                    if (nome == inv1) {
                                                                                        ins_dentro.push({ id: id, ins: nome })
                                                                                    } else {
                                                                                        if (nome == inv2) {
                                                                                            ins_dentro.push({ id: id, ins: nome })
                                                                                        } else {
                                                                                            if (nome == inv3) {
                                                                                                ins_dentro.push({ id: id, ins: nome })
                                                                                            } else {
                                                                                                if (nome == inv4) {
                                                                                                    ins_dentro.push({ id: id, ins: nome })
                                                                                                } else {
                                                                                                    if (nome == inv5) {
                                                                                                        ins_dentro.push({ id: id, ins: nome })
                                                                                                    } else {
                                                                                                        ins_fora.push({ id: id, ins: nome })
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            } else {
                                                                                var nome = eleint.nome
                                                                                var id = eleint._id
                                                                                console.log(nome + ' está alocado.')
                                                                                if (nome == inv0) {
                                                                                    ins_dentro.push({ id: id, ins: nome })
                                                                                } else {
                                                                                    if (nome == inv1) {
                                                                                        ins_dentro.push({ id: id, ins: nome })
                                                                                    } else {
                                                                                        if (nome == inv2) {
                                                                                            ins_dentro.push({ id: id, ins: nome })
                                                                                        } else {
                                                                                            if (nome == inv3) {
                                                                                                ins_dentro.push({ id: id, ins: nome })
                                                                                            } else {
                                                                                                if (nome == inv4) {
                                                                                                    ins_dentro.push({ id: id, ins: nome })
                                                                                                } else {
                                                                                                    if (nome == inv5) {
                                                                                                        ins_dentro.push({ id: id, ins: nome })
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    })

                                                                    //console.log('ins_dentro_ultimo=>' + ins_dentro)
                                                                    //console.log('ins_fora_ultimo=>' + ins_fora)
                                                                    console.log('equipeins.inv0=>' + equipeins.inv0)
                                                                    if (equipeins.inv0 == '' || typeof equipeins.inv0 == 'undefined') {
                                                                        limpaInv = false
                                                                    }
                                                                    res.render('projeto/gerenciamento/recursosInversores', { projeto, cronograma, fora: ins_fora, dentro: ins_dentro, limpaInv })
                                                                }).catch((err) => {
                                                                    req.flash('error_msg', 'Falha ao encontrar os instaladores.')
                                                                    res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                                                })
                                                            }).catch((err) => {
                                                                req.flash('error_msg', 'Falha ao encontrar os instaladores na equipe.')
                                                                res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                                            })
                                                        }
                                                    }).catch((err) => {
                                                        req.flash('error_msg', 'Falha ao encontrar as equipes.')
                                                        res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                                    })
                                                })

                                            }).catch((err) => {
                                                req.flash('error_msg', 'Falha ao encontrar os instaladores na equipe.')
                                                res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                            })
                                        }
                                    }
                                }
                            }
                            if (validaLivre == 0 && ins_dif == 0 && qtd_prj == crono_date.length) {
                                validaLivre = 1
                                Equipe.findOne({ projeto: req.params.id }).lean().then((equipeins) => {
                                    Pessoa.find({ funins: 'checked', user: _id }).then((instalacao) => {
                                        //console.log('entrou diferença')
                                        //console.log('equipeins.ins0=>' + equipeins.ins0)
                                        if (typeof equipeins.inv0 != 'undefined') {
                                            inv0 = equipeins.inv0
                                        }
                                        if (typeof equipeins.inv1 != 'undefined') {
                                            inv1 = equipeins.inv1
                                        }
                                        if (typeof equipeins.inv2 != 'undefined') {
                                            inv2 = equipeins.inv2
                                        }
                                        if (typeof equipeins.inv3 != 'undefined') {
                                            inv3 = equipeins.inv3
                                        }
                                        if (typeof equipeins.inv4 != 'undefined') {
                                            inv4 = equipeins.inv4
                                        }
                                        if (typeof equipeins.inv5 != 'undefined') {
                                            inv5 = equipeins.inv5
                                        }

                                        instalacao.forEach((eleint) => {

                                            var nome = eleint.nome
                                            var id = eleint._id
                                            if (nome == inv0) {
                                                ins_dentro.push({ id: id, ins: nome })
                                            } else {
                                                if (nome == inv1) {
                                                    ins_dentro.push({ id: id, ins: nome })
                                                } else {
                                                    if (nome == inv2) {
                                                        ins_dentro.push({ id: id, ins: nome })
                                                    } else {
                                                        if (nome == inv3) {
                                                            ins_dentro.push({ id: id, ins: nome })
                                                        } else {
                                                            if (nome == inv4) {
                                                                ins_dentro.push({ id: id, ins: nome })
                                                            } else {
                                                                if (nome == inv5) {
                                                                    ins_dentro.push({ id: id, ins: nome })
                                                                } else {
                                                                    ins_fora.push({ id: id, ins: nome })
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        })
                                        //console.log('ins_dentro_dif=>' + ins_dentro)
                                        //console.log('ins_fora_dif=>' + ins_fora)
                                        console.log('equipeins.inv0=>' + equipeins.inv0)
                                        if (equipeins.inv0 == '' || typeof equipeins.inv0 == 'undefined') {
                                            limpaInv = false
                                        }
                                        res.render('projeto/gerenciamento/recursosInversores', { projeto, cronograma, fora: ins_fora, dentro: ins_dentro, limpaInv })

                                    }).catch((err) => {
                                        req.flash('error_msg', 'Falha ao encontrar os instaladores.')
                                        res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Falha ao encontrar os instaladores na equipe.')
                                    res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                })
                            }
                        }).catch((err) => {
                            req.flash('error_msg', 'Falha ao encontrar o projeto.')
                            res.redirect('/gerenciamento/cronograma/' + req.params.id)
                        })
                    })
                }
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao encontrar o cronograma.')
                res.redirect('/gerenciamento/cronograma/' + req.params.id)
            })
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao encontrar o cronograma.')
            res.redirect('/gerenciamento/cronograma/' + req.params.id)
        })
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar o projeto.')
        res.redirect('/gerenciamento/cronograma/' + req.params.id)
    })
})

router.get('/recursosInstalacao/:id', ehAdmin, (req, res) => {
    const { _id } = req.user
    var ins_dentro = []
    var ins_fora = []
    var instalador_alocado = []
    var num_prj = 0
    var qtd_prj = 0
    var validaLivre = 0
    var q = 0
    var ins0 = ''
    var ins1 = ''
    var ins2 = ''
    var ins3 = ''
    var ins4 = ''
    var ins5 = ''
    var diferenca
    var ins_dif = 0
    limpaIns = true

    Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
        //console.log('validação dos instaladores.')
        Cronograma.findOne({ projeto: req.params.id }).lean().then((cronograma) => {
            var dateestini = cronograma.agendaEstIni
            var datemodfim = cronograma.agendaModFim
            var estini
            //console.log('cronograma.agendaEstIni=>' + cronograma.agendaEstIni)
            //console.log('cronograma.agendaModFim=>' + cronograma.agendaModFim)
            Cronograma.find({ user: _id }).then((crono_date) => {
                if (crono_date != '') {
                    crono_date.forEach((elecro) => {
                        Projeto.findOne({ _id: elecro.projeto, orcado: true }).then((orcado) => {
                            qtd_prj = qtd_prj + 1
                            if (orcado != null && orcado._id != req.params.id) {
                                diferenca = elecro.agendaModFim - elecro.agendaEstIni
                                //console.log('orcado._id=>' + orcado._id)                                
                                if (isNaN(diferenca) == false) {
                                    for (var x = 0; x < diferenca + 1; x++) {
                                        var date = elecro.dateestini
                                        var ano = date.substring(0, 4)
                                        var mes = date.substring(5, 7) - parseFloat(1)
                                        var dia = date.substring(8, 11)
                                        var data = new Date(ano, mes, dia)
                                        var nova_data = new Date()
                                        nova_data.setDate(data.getDate() + parseFloat(x))
                                        ano = nova_data.getFullYear()
                                        mes = (nova_data.getMonth() + parseFloat(1))
                                        if (mes < 10) {
                                            mes = '0' + mes
                                        }
                                        dia = nova_data.getDate()
                                        if (dia < 10) {
                                            dia = '0' + dia
                                        }
                                        nova_data = ano + '' + mes + '' + dia

                                        if (dateestini < nova_data) {
                                            estini = nova_data
                                        } else {
                                            estini = dateestini
                                        }

                                        //console.log('diferenca=>' + diferenca)
                                        //console.log('elecro.date=>' + elecro.agendaEstIni)
                                        //console.log('cronograma.dateestini=>' + dateestini)
                                        //console.log('nova_data=>' + nova_data)
                                        //console.log('estini=>' + estini)

                                        if (nova_data == estini && dateestini >= estini && date >= dateestini) {
                                            ins_dif = 1
                                            //console.log('entrou')
                                            Pessoa.find({ funins: 'checked', user: _id }).then((instaladores) => {
                                                instaladores.forEach((eleins) => {
                                                    num_prj = num_prj + 1
                                                    //console.log('Recurso=>' + eleins.nome)
                                                    Equipe.findOne({ projeto: orcado._id, $or: [{ 'ins0': eleins.nome }, { 'ins1': eleins.nome }, { 'ins2': eleins.nome }, { 'ins3': eleins.nome }, { 'ins4': eleins.nome }, { 'ins5': eleins.nome }] }).then((equipe) => {
                                                        //console.log('equipe=>' + equipe)
                                                        q = q + 1
                                                        if (equipe != null) {
                                                            if (instalador_alocado.length == 0) {
                                                                instalador_alocado.push({ nome: eleins.nome })
                                                                console.log(eleins.nome + ' está alocado.')
                                                            } else {
                                                                for (i = 0; i < instalador_alocado.length; i++) {
                                                                    if (instalador_alocado[i].nome != eleins.nome) {
                                                                        instalador_alocado.push({ nome: eleins.nome })
                                                                        console.log(eleins.nome + ' está alocado.')
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        //console.log('num_prj=>' + num_prj)
                                                        //console.log('q=>' + q)
                                                        if (num_prj == q) {
                                                            //console.log('É o último!')
                                                            Equipe.findOne({ projeto: req.params.id }).lean().then((equipeins) => {

                                                                //console.log('equipeins.ins0=>' + equipeins.ins0)
                                                                //console.log('equipeins.ins1=>' + equipeins.ins1)
                                                                //console.log('equipeins.ins2=>' + equipeins.ins2)
                                                                //console.log('equipeins.ins3=>' + equipeins.ins3)
                                                                //console.log('equipeins.ins4=>' + equipeins.ins4)
                                                                //console.log('equipeins.ins5=>' + equipeins.ins5)

                                                                if (typeof equipeins.ins0 != 'undefined') {
                                                                    ins0 = equipeins.ins0
                                                                }
                                                                if (typeof equipeins.ins1 != 'undefined') {
                                                                    ins1 = equipeins.ins1
                                                                }
                                                                if (typeof equipeins.ins2 != 'undefined') {
                                                                    ins2 = equipeins.ins2
                                                                }
                                                                if (typeof equipeins.ins3 != 'undefined') {
                                                                    ins3 = equipeins.ins3
                                                                }
                                                                if (typeof equipeins.ins4 != 'undefined') {
                                                                    ins4 = equipeins.ins4
                                                                }
                                                                if (typeof equipeins.ins5 != 'undefined') {
                                                                    ins5 = equipeins.ins5
                                                                }
                                                                console.log('orcado._id=>' + orcado._id)
                                                                Pessoa.find({ funins: 'checked', user: _id }).sort({ nome: 'asc' }).then((instalacao) => {
                                                                    instalacao.forEach((eleint) => {
                                                                        //console.log('instalador_alocado.length=>' + instalador_alocado.length)
                                                                        //console.log('eleint.nome=>' + eleint.nome)
                                                                        if (instalador_alocado.length == '') {
                                                                            //console.log('não tem instalador alocado')
                                                                            var nome = eleint.nome
                                                                            var id = eleint._id
                                                                            if (nome == ins0) {
                                                                                ins_dentro.push({ id: id, ins: nome })
                                                                            } else {
                                                                                if (nome == ins1) {
                                                                                    ins_dentro.push({ id: id, ins: nome })
                                                                                } else {
                                                                                    if (nome == ins2) {
                                                                                        ins_dentro.push({ id: id, ins: nome })
                                                                                    } else {
                                                                                        if (nome == ins3) {
                                                                                            ins_dentro.push({ id: id, ins: nome })
                                                                                        } else {
                                                                                            if (nome == ins4) {
                                                                                                ins_dentro.push({ id: id, ins: nome })
                                                                                            } else {
                                                                                                if (nome == ins5) {
                                                                                                    ins_dentro.push({ id: id, ins: nome })
                                                                                                } else {
                                                                                                    ins_fora.push({ id: id, ins: nome })
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        } else {
                                                                            const encontrou_ins = instalador_alocado.find((user) => user.nome === eleint.nome)
                                                                            console.log('encontrou recurso alocado=>' + encontrou_ins)
                                                                            if (typeof encontrou_ins == 'undefined') {
                                                                                var nome = eleint.nome
                                                                                var id = eleint._id
                                                                                console.log(nome + ' não está alocado.')
                                                                                if (nome == ins0) {
                                                                                    ins_dentro.push({ id: id, ins: nome })
                                                                                } else {
                                                                                    if (nome == ins1) {
                                                                                        ins_dentro.push({ id: id, ins: nome })
                                                                                    } else {
                                                                                        if (nome == ins2) {
                                                                                            ins_dentro.push({ id: id, ins: nome })
                                                                                        } else {
                                                                                            if (nome == ins3) {
                                                                                                ins_dentro.push({ id: id, ins: nome })
                                                                                            } else {
                                                                                                if (nome == ins4) {
                                                                                                    ins_dentro.push({ id: id, ins: nome })
                                                                                                } else {
                                                                                                    if (nome == ins5) {
                                                                                                        ins_dentro.push({ id: id, ins: nome })
                                                                                                    } else {
                                                                                                        ins_fora.push({ id: id, ins: nome })
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            } else {
                                                                                var nome = eleint.nome
                                                                                var id = eleint._id
                                                                                console.log(nome + ' está alocado.')
                                                                                if (nome == ins0) {
                                                                                    ins_dentro.push({ id: id, ins: nome })
                                                                                } else {
                                                                                    if (nome == ins1) {
                                                                                        ins_dentro.push({ id: id, ins: nome })
                                                                                    } else {
                                                                                        if (nome == ins2) {
                                                                                            ins_dentro.push({ id: id, ins: nome })
                                                                                        } else {
                                                                                            if (nome == ins3) {
                                                                                                ins_dentro.push({ id: id, ins: nome })
                                                                                            } else {
                                                                                                if (nome == ins4) {
                                                                                                    ins_dentro.push({ id: id, ins: nome })
                                                                                                } else {
                                                                                                    if (nome == ins5) {
                                                                                                        ins_dentro.push({ id: id, ins: nome })
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    })

                                                                    //console.log('ins_dentro_ultimo=>' + ins_dentro)
                                                                    //console.log('ins_fora_ultimo=>' + ins_fora)
                                                                    if (equipeins.ins0 == '' || typeof equipeins.ins0 == 'undefined') {
                                                                        limpaIns = false
                                                                    }
                                                                    res.render('projeto/gerenciamento/recursosInstalacao', { projeto, cronograma, fora: ins_fora, dentro: ins_dentro, limpaIns })
                                                                }).catch((err) => {
                                                                    req.flash('error_msg', 'Falha ao encontrar os instaladores.')
                                                                    res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                                                })
                                                            }).catch((err) => {
                                                                req.flash('error_msg', 'Falha ao encontrar os instaladores na equipe.')
                                                                res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                                            })
                                                        }
                                                    }).catch((err) => {
                                                        req.flash('error_msg', 'Falha ao encontrar as equipes.')
                                                        res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                                    })
                                                })

                                            }).catch((err) => {
                                                req.flash('error_msg', 'Falha ao encontrar os instaladores na equipe.')
                                                res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                            })
                                        }
                                    }
                                }
                            }
                            if (validaLivre == 0 && ins_dif == 0 && qtd_prj == crono_date.length) {
                                validaLivre = 1
                                Equipe.findOne({ projeto: req.params.id }).lean().then((equipeins) => {
                                    Pessoa.find({ funins: 'checked', user: _id }).then((instalacao) => {
                                        //console.log('entrou diferença')
                                        //console.log('equipeins.ins0=>' + equipeins.ins0)
                                        if (typeof equipeins.ins0 != 'undefined') {
                                            ins0 = equipeins.ins0
                                        }
                                        if (typeof equipeins.ins1 != 'undefined') {
                                            ins1 = equipeins.ins1
                                        }
                                        if (typeof equipeins.ins2 != 'undefined') {
                                            ins2 = equipeins.ins2
                                        }
                                        if (typeof equipeins.ins3 != 'undefined') {
                                            ins3 = equipeins.ins3
                                        }
                                        if (typeof equipeins.ins4 != 'undefined') {
                                            ins4 = equipeins.ins4
                                        }
                                        if (typeof equipeins.ins5 != 'undefined') {
                                            ins5 = equipeins.ins5
                                        }

                                        instalacao.forEach((eleint) => {

                                            var nome = eleint.nome
                                            var id = eleint._id
                                            if (nome == ins0) {
                                                ins_dentro.push({ id: id, ins: nome })
                                            } else {
                                                if (nome == ins1) {
                                                    ins_dentro.push({ id: id, ins: nome })
                                                } else {
                                                    if (nome == ins2) {
                                                        ins_dentro.push({ id: id, ins: nome })
                                                    } else {
                                                        if (nome == ins3) {
                                                            ins_dentro.push({ id: id, ins: nome })
                                                        } else {
                                                            if (nome == ins4) {
                                                                ins_dentro.push({ id: id, ins: nome })
                                                            } else {
                                                                if (nome == ins5) {
                                                                    ins_dentro.push({ id: id, ins: nome })
                                                                } else {
                                                                    ins_fora.push({ id: id, ins: nome })
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        })
                                        //console.log('ins_dentro_dif=>' + ins_dentro)
                                        //console.log('ins_fora_dif=>' + ins_fora)
                                        if (equipeins.ins0 == '' || typeof equipeins.ins0 == 'undefined') {
                                            limpaIns = false
                                        }
                                        res.render('projeto/gerenciamento/recursosInstalacao', { projeto, cronograma, fora: ins_fora, dentro: ins_dentro, limpaIns })

                                    }).catch((err) => {
                                        req.flash('error_msg', 'Falha ao encontrar os instaladores.')
                                        res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Falha ao encontrar os instaladores na equipe.')
                                    res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                })
                            }
                        }).catch((err) => {
                            req.flash('error_msg', 'Falha ao encontrar o projeto.')
                            res.redirect('/gerenciamento/cronograma/' + req.params.id)
                        })
                    })
                }
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao encontrar o cronograma.')
                res.redirect('/gerenciamento/cronograma/' + req.params.id)
            })
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao encontrar o cronograma.')
            res.redirect('/gerenciamento/cronograma/' + req.params.id)
        })
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar o projeto.')
        res.redirect('/gerenciamento/cronograma/' + req.params.id)
    })
})

router.get('/recursosArmazenamento/:id', ehAdmin, (req, res) => {
    const { _id } = req.user
    var ins_dentro = []
    var ins_fora = []
    var instalador_alocado = []
    var num_prj = 0
    var qtd_prj = 0
    var validaLivre = 0
    var q = 0
    var eae0 = ''
    var eae1 = ''
    var eae2 = ''
    var eae3 = ''
    var eae4 = ''
    var eae5 = ''
    var diferenca
    var ins_dif = 0
    limpaEae = ''

    Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
        //console.log('validação dos instaladores.')
        Cronograma.findOne({ projeto: req.params.id }).lean().then((cronograma) => {
            var dateeaeini = cronograma.agendaEaeIni
            var estini
            //console.log('cronograma.agendaEstIni=>' + cronograma.agendaEstIni)
            //console.log('cronograma.agendaModFim=>' + cronograma.agendaModFim)
            Cronograma.find({ user: _id }).then((crono_date) => {
                if (crono_date != '') {
                    crono_date.forEach((elecro) => {
                        Projeto.findOne({ _id: elecro.projeto, orcado: true }).then((orcado) => {
                            qtd_prj = qtd_prj + 1
                            if (orcado != null && orcado._id != req.params.id) {
                                diferenca = elecro.agendaEaeFim - elecro.agendaEaeIni
                                //console.log('orcado._id=>' + orcado._id)                                
                                if (isNaN(diferenca) == false) {
                                    for (var x = 0; x < diferenca + 1; x++) {
                                        var date = elecro.dateeaeini
                                        var ano = date.substring(0, 4)
                                        var mes = date.substring(5, 7) - parseFloat(1)
                                        var dia = date.substring(8, 11)
                                        var data = new Date(ano, mes, dia)
                                        var nova_data = new Date()
                                        nova_data.setDate(data.getDate() + parseFloat(x))
                                        ano = nova_data.getFullYear()
                                        mes = (nova_data.getMonth() + parseFloat(1))
                                        if (mes < 10) {
                                            mes = '0' + mes
                                        }
                                        dia = nova_data.getDate()
                                        if (dia < 10) {
                                            dia = '0' + dia
                                        }
                                        nova_data = ano + '' + mes + '' + dia

                                        if (dateeaeini < nova_data) {
                                            estini = nova_data
                                        } else {
                                            estini = dateeaeini
                                        }

                                        //console.log('diferenca=>' + diferenca)
                                        //console.log('elecro.date=>' + elecro.agendaEstIni)
                                        //console.log('cronograma.dateeaeini=>' + dateeaeini)
                                        //console.log('nova_data=>' + nova_data)
                                        //console.log('estini=>' + estini)

                                        if (nova_data == estini && dateeaeini >= estini && date >= dateeaeini) {
                                            ins_dif = 1
                                            //console.log('entrou')
                                            Pessoa.find({ funins: 'checked', user: _id }).then((instaladores) => {
                                                instaladores.forEach((eleins) => {
                                                    num_prj = num_prj + 1
                                                    //console.log('Recurso=>' + eleins.nome)
                                                    Equipe.findOne({ projeto: orcado._id, $or: [{ 'ins0': eleins.nome }, { 'ins1': eleins.nome }, { 'ins2': eleins.nome }, { 'ins3': eleins.nome }, { 'ins4': eleins.nome }, { 'ins5': eleins.nome }] }).then((equipe) => {
                                                        //console.log('equipe=>' + equipe)
                                                        q = q + 1
                                                        if (equipe != null) {
                                                            if (instalador_alocado.length == 0) {
                                                                instalador_alocado.push({ nome: eleins.nome })
                                                                console.log(eleins.nome + ' está alocado.')
                                                            } else {
                                                                for (i = 0; i < instalador_alocado.length; i++) {
                                                                    if (instalador_alocado[i].nome != eleins.nome) {
                                                                        instalador_alocado.push({ nome: eleins.nome })
                                                                        console.log(eleins.nome + ' está alocado.')
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        //console.log('num_prj=>' + num_prj)
                                                        //console.log('q=>' + q)
                                                        if (num_prj == q) {
                                                            //console.log('É o último!')
                                                            Equipe.findOne({ projeto: req.params.id }).lean().then((equipeins) => {

                                                                //console.log('equipeins.ins0=>' + equipeins.ins0)
                                                                //console.log('equipeins.ins1=>' + equipeins.ins1)
                                                                //console.log('equipeins.ins2=>' + equipeins.ins2)
                                                                //console.log('equipeins.ins3=>' + equipeins.ins3)
                                                                //console.log('equipeins.ins4=>' + equipeins.ins4)
                                                                //console.log('equipeins.ins5=>' + equipeins.ins5)

                                                                if (typeof equipeins.eae0 != 'undefined') {
                                                                    eae0 = equipeins.eae0
                                                                }
                                                                if (typeof equipeins.eae1 != 'undefined') {
                                                                    eae1 = equipeins.eae1
                                                                }
                                                                if (typeof equipeins.eae2 != 'undefined') {
                                                                    eae2 = equipeins.eae2
                                                                }
                                                                if (typeof equipeins.eae3 != 'undefined') {
                                                                    eae3 = equipeins.eae3
                                                                }
                                                                if (typeof equipeins.eae4 != 'undefined') {
                                                                    eae4 = equipeins.eae4
                                                                }
                                                                if (typeof equipeins.eae5 != 'undefined') {
                                                                    eae5 = equipeins.eae5
                                                                }
                                                                console.log('orcado._id=>' + orcado._id)
                                                                Pessoa.find({ funins: 'checked', user: _id }).sort({ nome: 'asc' }).then((instalacao) => {
                                                                    instalacao.forEach((eleint) => {
                                                                        //console.log('instalador_alocado.length=>' + instalador_alocado.length)
                                                                        //console.log('eleint.nome=>' + eleint.nome)
                                                                        if (instalador_alocado.length == '') {
                                                                            //console.log('não tem instalador alocado')
                                                                            var nome = eleint.nome
                                                                            var id = eleint._id
                                                                            if (nome == eae0) {
                                                                                ins_dentro.push({ id: id, ins: nome })
                                                                            } else {
                                                                                if (nome == eae1) {
                                                                                    ins_dentro.push({ id: id, ins: nome })
                                                                                } else {
                                                                                    if (nome == eae2) {
                                                                                        ins_dentro.push({ id: id, ins: nome })
                                                                                    } else {
                                                                                        if (nome == eae3) {
                                                                                            ins_dentro.push({ id: id, ins: nome })
                                                                                        } else {
                                                                                            if (nome == eae4) {
                                                                                                ins_dentro.push({ id: id, ins: nome })
                                                                                            } else {
                                                                                                if (nome == eae5) {
                                                                                                    ins_dentro.push({ id: id, ins: nome })
                                                                                                } else {
                                                                                                    ins_fora.push({ id: id, ins: nome })
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        } else {
                                                                            const encontrou_ins = instalador_alocado.find((user) => user.nome === eleint.nome)
                                                                            console.log('encontrou recurso alocado=>' + encontrou_ins)
                                                                            if (typeof encontrou_ins == 'undefined') {
                                                                                var nome = eleint.nome
                                                                                var id = eleint._id
                                                                                console.log(nome + ' não está alocado.')
                                                                                if (nome == eae0) {
                                                                                    ins_dentro.push({ id: id, ins: nome })
                                                                                } else {
                                                                                    if (nome == eae1) {
                                                                                        ins_dentro.push({ id: id, ins: nome })
                                                                                    } else {
                                                                                        if (nome == eae2) {
                                                                                            ins_dentro.push({ id: id, ins: nome })
                                                                                        } else {
                                                                                            if (nome == eae3) {
                                                                                                ins_dentro.push({ id: id, ins: nome })
                                                                                            } else {
                                                                                                if (nome == eae4) {
                                                                                                    ins_dentro.push({ id: id, ins: nome })
                                                                                                } else {
                                                                                                    if (nome == eae5) {
                                                                                                        ins_dentro.push({ id: id, ins: nome })
                                                                                                    } else {
                                                                                                        ins_fora.push({ id: id, ins: nome })
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            } else {
                                                                                var nome = eleint.nome
                                                                                var id = eleint._id
                                                                                console.log(nome + ' está alocado.')
                                                                                if (nome == eae0) {
                                                                                    ins_dentro.push({ id: id, ins: nome })
                                                                                } else {
                                                                                    if (nome == eae1) {
                                                                                        ins_dentro.push({ id: id, ins: nome })
                                                                                    } else {
                                                                                        if (nome == eae2) {
                                                                                            ins_dentro.push({ id: id, ins: nome })
                                                                                        } else {
                                                                                            if (nome == eae3) {
                                                                                                ins_dentro.push({ id: id, ins: nome })
                                                                                            } else {
                                                                                                if (nome == eae4) {
                                                                                                    ins_dentro.push({ id: id, ins: nome })
                                                                                                } else {
                                                                                                    if (nome == eae5) {
                                                                                                        ins_dentro.push({ id: id, ins: nome })
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    })

                                                                    //console.log('ins_dentro_ultimo=>' + ins_dentro)
                                                                    //console.log('ins_fora_ultimo=>' + ins_fora)
                                                                    if (equipeins.eae0 == '' || typeof equipeins.eae0 == 'undefined') {
                                                                        limpaPEae = false
                                                                    }
                                                                    res.render('projeto/gerenciamento/recursosArmazenamento', { projeto, cronograma, fora: ins_fora, dentro: ins_dentro, limpaEae })
                                                                }).catch((err) => {
                                                                    req.flash('error_msg', 'Falha ao encontrar os instaladores.')
                                                                    res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                                                })
                                                            }).catch((err) => {
                                                                req.flash('error_msg', 'Falha ao encontrar os instaladores na equipe.')
                                                                res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                                            })
                                                        }
                                                    }).catch((err) => {
                                                        req.flash('error_msg', 'Falha ao encontrar as equipes.')
                                                        res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                                    })
                                                })

                                            }).catch((err) => {
                                                req.flash('error_msg', 'Falha ao encontrar os instaladores na equipe.')
                                                res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                            })
                                        }
                                    }
                                }
                            }
                            if (validaLivre == 0 && ins_dif == 0 && qtd_prj == crono_date.length) {
                                validaLivre = 1
                                Equipe.findOne({ projeto: req.params.id }).lean().then((equipeins) => {
                                    Pessoa.find({ funins: 'checked', user: _id }).then((instalacao) => {
                                        //console.log('entrou diferença')
                                        //console.log('equipeins.ins0=>' + equipeins.ins0)
                                        if (typeof equipeins.eae0 != 'undefined') {
                                            eae0 = equipeins.eae0
                                        }
                                        if (typeof equipeins.eae1 != 'undefined') {
                                            eae1 = equipeins.eae1
                                        }
                                        if (typeof equipeins.eae2 != 'undefined') {
                                            eae2 = equipeins.eae2
                                        }
                                        if (typeof equipeins.eae3 != 'undefined') {
                                            eae3 = equipeins.eae3
                                        }
                                        if (typeof equipeins.eae4 != 'undefined') {
                                            eae4 = equipeins.eae4
                                        }
                                        if (typeof equipeins.eae5 != 'undefined') {
                                            eae5 = equipeins.eae5
                                        }

                                        instalacao.forEach((eleint) => {

                                            var nome = eleint.nome
                                            var id = eleint._id
                                            if (nome == eae0) {
                                                ins_dentro.push({ id: id, ins: nome })
                                            } else {
                                                if (nome == eae1) {
                                                    ins_dentro.push({ id: id, ins: nome })
                                                } else {
                                                    if (nome == eae2) {
                                                        ins_dentro.push({ id: id, ins: nome })
                                                    } else {
                                                        if (nome == eae3) {
                                                            ins_dentro.push({ id: id, ins: nome })
                                                        } else {
                                                            if (nome == eae4) {
                                                                ins_dentro.push({ id: id, ins: nome })
                                                            } else {
                                                                if (nome == eae5) {
                                                                    ins_dentro.push({ id: id, ins: nome })
                                                                } else {
                                                                    ins_fora.push({ id: id, ins: nome })
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        })
                                        //console.log('ins_dentro_dif=>' + ins_dentro)
                                        //console.log('ins_fora_dif=>' + ins_fora)
                                        if (equipeins.eae0 == '' || typeof equipeins.eae0 == 'undefined') {
                                            limpaPEae = false
                                        }
                                        res.render('projeto/gerenciamento/recursosArmazenamento', { projeto, cronograma, fora: ins_fora, dentro: ins_dentro, limpaEae })

                                    }).catch((err) => {
                                        req.flash('error_msg', 'Falha ao encontrar os instaladores.')
                                        res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Falha ao encontrar os instaladores na equipe.')
                                    res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                })
                            }
                        }).catch((err) => {
                            req.flash('error_msg', 'Falha ao encontrar o projeto.')
                            res.redirect('/gerenciamento/cronograma/' + req.params.id)
                        })
                    })
                }
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao encontrar o cronograma.')
                res.redirect('/gerenciamento/cronograma/' + req.params.id)
            })
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao encontrar o cronograma.')
            res.redirect('/gerenciamento/cronograma/' + req.params.id)
        })
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar o projeto.')
        res.redirect('/gerenciamento/cronograma/' + req.params.id)
    })
})

router.get('/recursosPainel/:id', ehAdmin, (req, res) => {
    const { _id } = req.user
    var ins_dentro = []
    var ins_fora = []
    var instalador_alocado = []
    var num_prj = 0
    var qtd_prj = 0
    var validaLivre = 0
    var q = 0
    var pnl0 = ''
    var pnl1 = ''
    var pnl2 = ''
    var pnl3 = ''
    var pnl4 = ''
    var pnl5 = ''
    var diferenca
    var ins_dif = 0
    limpaPnl = true

    Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
        //console.log('validação dos instaladores.')
        Cronograma.findOne({ projeto: req.params.id }).lean().then((cronograma) => {
            var datepnlini = cronograma.agendaPnlIni
            var estini
            //console.log('cronograma.agendaEstIni=>' + cronograma.agendaEstIni)
            //console.log('cronograma.agendaModFim=>' + cronograma.agendaModFim)
            Cronograma.find({ user: _id }).then((crono_date) => {
                if (crono_date != '') {
                    crono_date.forEach((elecro) => {
                        Projeto.findOne({ _id: elecro.projeto, orcado: true }).then((orcado) => {
                            qtd_prj = qtd_prj + 1
                            if (orcado != null && orcado._id != req.params.id) {
                                diferenca = elecro.agendaPnlFim - elecro.agendaPnlIni
                                //console.log('orcado._id=>' + orcado._id)                                
                                if (isNaN(diferenca) == false) {
                                    for (var x = 0; x < diferenca + 1; x++) {
                                        var date = elecro.datepnlini
                                        var ano = date.substring(0, 4)
                                        var mes = date.substring(5, 7) - parseFloat(1)
                                        var dia = date.substring(8, 11)
                                        var data = new Date(ano, mes, dia)
                                        var nova_data = new Date()
                                        nova_data.setDate(data.getDate() + parseFloat(x))
                                        ano = nova_data.getFullYear()
                                        mes = (nova_data.getMonth() + parseFloat(1))
                                        if (mes < 10) {
                                            mes = '0' + mes
                                        }
                                        dia = nova_data.getDate()
                                        if (dia < 10) {
                                            dia = '0' + dia
                                        }
                                        nova_data = ano + '' + mes + '' + dia

                                        if (datepnlini < nova_data) {
                                            estini = nova_data
                                        } else {
                                            estini = datepnlini
                                        }

                                        //console.log('diferenca=>' + diferenca)
                                        //console.log('elecro.date=>' + elecro.agendaEstIni)
                                        //console.log('cronograma.datepnlini=>' + datepnlini)
                                        //console.log('nova_data=>' + nova_data)
                                        //console.log('estini=>' + estini)

                                        if (nova_data == estini && datepnlini >= estini && date >= datepnlini) {
                                            ins_dif = 1
                                            //console.log('entrou')
                                            Pessoa.find({ funins: 'checked', user: _id }).then((instaladores) => {
                                                instaladores.forEach((eleins) => {
                                                    num_prj = num_prj + 1
                                                    //console.log('Recurso=>' + eleins.nome)
                                                    Equipe.findOne({ projeto: orcado._id, $or: [{ 'ins0': eleins.nome }, { 'ins1': eleins.nome }, { 'ins2': eleins.nome }, { 'ins3': eleins.nome }, { 'ins4': eleins.nome }, { 'ins5': eleins.nome }] }).then((equipe) => {
                                                        //console.log('equipe=>' + equipe)
                                                        q = q + 1
                                                        if (equipe != null) {
                                                            if (instalador_alocado.length == 0) {
                                                                instalador_alocado.push({ nome: eleins.nome })
                                                                console.log(eleins.nome + ' está alocado.')
                                                            } else {
                                                                for (i = 0; i < instalador_alocado.length; i++) {
                                                                    if (instalador_alocado[i].nome != eleins.nome) {
                                                                        instalador_alocado.push({ nome: eleins.nome })
                                                                        console.log(eleins.nome + ' está alocado.')
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        //console.log('num_prj=>' + num_prj)
                                                        //console.log('q=>' + q)
                                                        if (num_prj == q) {
                                                            //console.log('É o último!')
                                                            Equipe.findOne({ projeto: req.params.id }).lean().then((equipeins) => {

                                                                //console.log('equipeins.ins0=>' + equipeins.ins0)
                                                                //console.log('equipeins.ins1=>' + equipeins.ins1)
                                                                //console.log('equipeins.ins2=>' + equipeins.ins2)
                                                                //console.log('equipeins.ins3=>' + equipeins.ins3)
                                                                //console.log('equipeins.ins4=>' + equipeins.ins4)
                                                                //console.log('equipeins.ins5=>' + equipeins.ins5)

                                                                if (typeof equipeins.pnl0 != 'undefined') {
                                                                    pnl0 = equipeins.pnl0
                                                                }
                                                                if (typeof equipeins.pnl1 != 'undefined') {
                                                                    pnl1 = equipeins.pnl1
                                                                }
                                                                if (typeof equipeins.pnl2 != 'undefined') {
                                                                    pnl2 = equipeins.pnl2
                                                                }
                                                                if (typeof equipeins.pnl3 != 'undefined') {
                                                                    pnl3 = equipeins.pnl3
                                                                }
                                                                if (typeof equipeins.pnl4 != 'undefined') {
                                                                    pnl4 = equipeins.pnl4
                                                                }
                                                                if (typeof equipeins.pnl5 != 'undefined') {
                                                                    pnl5 = equipeins.pnl5
                                                                }

                                                                console.log('orcado._id=>' + orcado._id)
                                                                Pessoa.find({ funins: 'checked', user: _id }).sort({ nome: 'asc' }).then((instalacao) => {
                                                                    instalacao.forEach((eleint) => {
                                                                        //console.log('instalador_alocado.length=>' + instalador_alocado.length)
                                                                        //console.log('eleint.nome=>' + eleint.nome)
                                                                        if (instalador_alocado.length == '') {
                                                                            //console.log('não tem instalador alocado')
                                                                            var nome = eleint.nome
                                                                            var id = eleint._id
                                                                            if (nome == pnl0) {
                                                                                ins_dentro.push({ id: id, ins: nome })
                                                                            } else {
                                                                                if (nome == pnl1) {
                                                                                    ins_dentro.push({ id: id, ins: nome })
                                                                                } else {
                                                                                    if (nome == pnl2) {
                                                                                        ins_dentro.push({ id: id, ins: nome })
                                                                                    } else {
                                                                                        if (nome == pnl3) {
                                                                                            ins_dentro.push({ id: id, ins: nome })
                                                                                        } else {
                                                                                            if (nome == pnl4) {
                                                                                                ins_dentro.push({ id: id, ins: nome })
                                                                                            } else {
                                                                                                if (nome == pnl5) {
                                                                                                    ins_dentro.push({ id: id, ins: nome })
                                                                                                } else {
                                                                                                    ins_fora.push({ id: id, ins: nome })
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        } else {
                                                                            const encontrou_ins = instalador_alocado.find((user) => user.nome === eleint.nome)
                                                                            console.log('encontrou recurso alocado=>' + encontrou_ins)
                                                                            if (typeof encontrou_ins == 'undefined') {
                                                                                var nome = eleint.nome
                                                                                var id = eleint._id
                                                                                console.log(nome + ' não está alocado.')
                                                                                if (nome == pnl0) {
                                                                                    ins_dentro.push({ id: id, ins: nome })
                                                                                } else {
                                                                                    if (nome == pnl1) {
                                                                                        ins_dentro.push({ id: id, ins: nome })
                                                                                    } else {
                                                                                        if (nome == pnl2) {
                                                                                            ins_dentro.push({ id: id, ins: nome })
                                                                                        } else {
                                                                                            if (nome == pnl3) {
                                                                                                ins_dentro.push({ id: id, ins: nome })
                                                                                            } else {
                                                                                                if (nome == pnl4) {
                                                                                                    ins_dentro.push({ id: id, ins: nome })
                                                                                                } else {
                                                                                                    if (nome == pnl5) {
                                                                                                        ins_dentro.push({ id: id, ins: nome })
                                                                                                    } else {
                                                                                                        ins_fora.push({ id: id, ins: nome })
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            } else {
                                                                                var nome = eleint.nome
                                                                                var id = eleint._id
                                                                                console.log(nome + ' está alocado.')
                                                                                if (nome == pnl0) {
                                                                                    ins_dentro.push({ id: id, ins: nome })
                                                                                } else {
                                                                                    if (nome == pnl1) {
                                                                                        ins_dentro.push({ id: id, ins: nome })
                                                                                    } else {
                                                                                        if (nome == pnl2) {
                                                                                            ins_dentro.push({ id: id, ins: nome })
                                                                                        } else {
                                                                                            if (nome == pnl3) {
                                                                                                ins_dentro.push({ id: id, ins: nome })
                                                                                            } else {
                                                                                                if (nome == pnl4) {
                                                                                                    ins_dentro.push({ id: id, ins: nome })
                                                                                                } else {
                                                                                                    if (nome == pnl5) {
                                                                                                        ins_dentro.push({ id: id, ins: nome })
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    })

                                                                    //console.log('ins_dentro_ultimo=>' + ins_dentro)
                                                                    //console.log('ins_fora_ultimo=>' + ins_fora)
                                                                    if (equipeins.pnl0 == '' || typeof equipeins.pnl0 == 'undefined') {
                                                                        limpaPanl = false
                                                                    }
                                                                    res.render('projeto/gerenciamento/recursosPainel', { projeto, cronograma, fora: ins_fora, dentro: ins_dentro, limpaPnl })
                                                                }).catch((err) => {
                                                                    req.flash('error_msg', 'Falha ao encontrar os instaladores.')
                                                                    res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                                                })
                                                            }).catch((err) => {
                                                                req.flash('error_msg', 'Falha ao encontrar os instaladores na equipe.')
                                                                res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                                            })
                                                        }
                                                    }).catch((err) => {
                                                        req.flash('error_msg', 'Falha ao encontrar as equipes.')
                                                        res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                                    })
                                                })

                                            }).catch((err) => {
                                                req.flash('error_msg', 'Falha ao encontrar os instaladores na equipe.')
                                                res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                            })
                                        }
                                    }
                                }
                            }
                            if (validaLivre == 0 && ins_dif == 0 && qtd_prj == crono_date.length) {
                                validaLivre = 1
                                Equipe.findOne({ projeto: req.params.id }).lean().then((equipeins) => {
                                    Pessoa.find({ funins: 'checked', user: _id }).then((instalacao) => {
                                        //console.log('entrou diferença')
                                        //console.log('equipeins.ins0=>' + equipeins.ins0)
                                        if (typeof equipeins.pnl0 != 'undefined') {
                                            pnl0 = equipeins.pnl0
                                        }
                                        if (typeof equipeins.pnl1 != 'undefined') {
                                            pnl1 = equipeins.pnl1
                                        }
                                        if (typeof equipeins.pnl2 != 'undefined') {
                                            pnl2 = equipeins.pnl2
                                        }
                                        if (typeof equipeins.pnl3 != 'undefined') {
                                            pnl3 = equipeins.pnl3
                                        }
                                        if (typeof equipeins.pnl4 != 'undefined') {
                                            pnl4 = equipeins.pnl4
                                        }
                                        if (typeof equipeins.pnl5 != 'undefined') {
                                            pnl5 = equipeins.pnl5
                                        }

                                        instalacao.forEach((eleint) => {

                                            var nome = eleint.nome
                                            var id = eleint._id
                                            if (nome == pnl0) {
                                                ins_dentro.push({ id: id, ins: nome })
                                            } else {
                                                if (nome == pnl1) {
                                                    ins_dentro.push({ id: id, ins: nome })
                                                } else {
                                                    if (nome == pnl2) {
                                                        ins_dentro.push({ id: id, ins: nome })
                                                    } else {
                                                        if (nome == pnl3) {
                                                            ins_dentro.push({ id: id, ins: nome })
                                                        } else {
                                                            if (nome == pnl4) {
                                                                ins_dentro.push({ id: id, ins: nome })
                                                            } else {
                                                                if (nome == pnl5) {
                                                                    ins_dentro.push({ id: id, ins: nome })
                                                                } else {
                                                                    ins_fora.push({ id: id, ins: nome })
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        })
                                        //console.log('ins_dentro_dif=>' + ins_dentro)
                                        //console.log('ins_fora_dif=>' + ins_fora)
                                        if (equipeins.pnl0 == '' || typeof equipeins.pnl0 == 'undefined') {
                                            limpaPanl = false
                                        }
                                        res.render('projeto/gerenciamento/recursosPainel', { projeto, cronograma, fora: ins_fora, dentro: ins_dentro, limpaPnl })

                                    }).catch((err) => {
                                        req.flash('error_msg', 'Falha ao encontrar os instaladores.')
                                        res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Falha ao encontrar os instaladores na equipe.')
                                    res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                })
                            }
                        }).catch((err) => {
                            req.flash('error_msg', 'Falha ao encontrar o projeto.')
                            res.redirect('/gerenciamento/cronograma/' + req.params.id)
                        })
                    })
                }
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao encontrar o cronograma.')
                res.redirect('/gerenciamento/cronograma/' + req.params.id)
            })
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao encontrar o cronograma.')
            res.redirect('/gerenciamento/cronograma/' + req.params.id)
        })
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar o projeto.')
        res.redirect('/gerenciamento/cronograma/' + req.params.id)
    })
})

router.get('/recursosVistoria/:id', ehAdmin, (req, res) => {
    const { _id } = req.user
    var ins_dentro = []
    var ins_fora = []
    var gestor_alocado = []
    var num_prj = 0
    var qtd_prj = 0
    var validaLivre = 0
    var q = 0
    var vis0 = ''
    var vis1 = ''
    var vis2 = ''
    var vis3 = ''
    var vis4 = ''
    var vis5 = ''
    var diferenca
    var ins_dif = 0
    limpaVis = true

    Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
        Cronograma.findOne({ projeto: req.params.id }).lean().then((cronograma) => {
            var datevisini = cronograma.agendaVisIni
            var plaini
            Cronograma.find({ user: _id }).then((crono_date) => {
                if (crono_date != '') {
                    crono_date.forEach((elecro) => {
                        Projeto.findOne({ _id: elecro.projeto, orcado: true }).then((orcado) => {
                            qtd_prj = qtd_prj + 1
                            //console.log('orcado._id=>'+orcado._id)
                            if (orcado != null && orcado._id != req.params.id) {
                                diferenca = elecro.agendaVisFim - elecro.agendaVisIni
                                if (isNaN(diferenca) == false) {
                                    for (var x = 0; x < diferenca + 1; x++) {
                                        var date = elecro.datevisini
                                        var ano = date.substring(0, 4)
                                        var mes = date.substring(5, 7) - parseFloat(1)
                                        var dia = date.substring(8, 11)
                                        var data = new Date(ano, mes, dia)
                                        var nova_data = new Date()
                                        nova_data.setDate(data.getDate() + parseFloat(x))
                                        ano = nova_data.getFullYear()
                                        mes = (nova_data.getMonth() + parseFloat(1))
                                        if (mes < 10) {
                                            mes = '0' + mes
                                        }
                                        dia = nova_data.getDate()
                                        if (dia < 10) {
                                            dia = '0' + dia
                                        }
                                        nova_data = ano + '' + mes + '' + dia

                                        if (datevisini < nova_data) {
                                            plaini = nova_data
                                        } else {
                                            plaini = datevisini
                                        }

                                        //console.log('orcado._id=>' + orcado._id)
                                        //console.log('elecro.date=>' + elecro.agendaPlaiIni)
                                        //console.log('cronograma.datevisini=>' + datevisini)
                                        //console.log('nova_data=>' + nova_data)
                                        //console.log('plaini=>' + plaini)
                                        if (nova_data == plaini && datevisini >= plaini && date >= datevisini) {
                                            //console.log('entrou')
                                            ins_dif = 1
                                            Pessoa.find({ funeng: 'checked', user: _id }).then((gestores) => {
                                                gestores.forEach((eleges) => {
                                                    num_prj = num_prj + 1
                                                    //console.log('Recurso=>' + eleges.nome)
                                                    Equipe.findOne({ projeto: orcado._id, $or: [{ 'pla0': eleges.nome }, { 'pla1': eleges.nome }, { 'pla2': eleges.nome }, { 'pla3': eleges.nome }, { 'pla4': eleges.nome }, { 'pla5': eleges.nome }] }).then((equipe) => {
                                                        q = q + 1
                                                        if (equipe != null) {
                                                            if (gestor_alocado.length == 0) {
                                                                gestor_alocado.push({ nome: eleges.nome })
                                                                //console.log(eleges.nome + ' está alocado.')
                                                            } else {
                                                                for (i = 0; i < gestor_alocado.length; i++) {
                                                                    if (gestor_alocado[i].nome != eleges.nome) {
                                                                        gestor_alocado.push({ nome: eleges.nome })
                                                                        //console.log(eleges.nome + ' está alocado.')
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        //console.log('num_prj=>' + num_prj)
                                                        //console.log('q=>' + q)
                                                        if (num_prj == q) {
                                                            //console.log('É o último!')
                                                            Equipe.findOne({ projeto: req.params.id }).then((equipepla) => {

                                                                //console.log('equipepla=>' + equipepla)

                                                                if (typeof equipepla.vis0 != 'undefined') {
                                                                    vis0 = equipepla.vis0
                                                                }
                                                                if (typeof equipepla.vis1 != 'undefined') {
                                                                    vis1 = equipepla.vis1
                                                                }
                                                                if (typeof equipepla.vis2 != 'undefined') {
                                                                    vis2 = equipepla.vis2
                                                                }
                                                                if (typeof equipepla.vis3 != 'undefined') {
                                                                    vis3 = equipepla.vis3
                                                                }
                                                                if (typeof equipepla.vis4 != 'undefined') {
                                                                    vis4 = equipepla.vis4
                                                                }
                                                                if (typeof equipepla.vis5 != 'undefined') {
                                                                    vis5 = equipepla.vis5
                                                                }
                                                                Pessoa.find({ funeng: 'checked', user: _id }).sort({ nome: 'asc' }).then((planejamento) => {
                                                                    planejamento.forEach((elepla) => {
                                                                        //console.log('elepla.nome=>' + elepla.nome)
                                                                        if (gestor_alocado.length == '') {
                                                                            var nome = elepla.nome
                                                                            if (nome == vis0) {
                                                                                ins_dentro.push({ id: elepla._id, ges: nome })
                                                                            } else {
                                                                                if (nome == vis1) {
                                                                                    ins_dentro.push({ id: elepla._id, ges: nome })
                                                                                } else {
                                                                                    if (nome == vis2) {
                                                                                        ins_dentro.push({ id: elepla._id, ges: nome })
                                                                                    } else {
                                                                                        if (nome == vis3) {
                                                                                            ins_dentro.push({ id: elepla._id, ges: nome })
                                                                                        } else {
                                                                                            if (nome == vis4) {
                                                                                                ins_dentro.push({ id: elepla._id, ges: nome })
                                                                                            } else {
                                                                                                if (nome == vis5) {
                                                                                                    ins_dentro.push({ id: elepla._id, ges: nome })
                                                                                                } else {
                                                                                                    ins_fora.push({ id: elepla._id, ges: nome })
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        } else {
                                                                            //console.log('gestor_alocado.length=>' + gestor_alocado.length)
                                                                            const encontrou = gestor_alocado.find((user) => user.nome === elepla.nome)
                                                                            //console.log('encontrou recurso alocado=>' + encontrou)
                                                                            if (typeof encontrou == 'undefined') {
                                                                                //console.log(elepla.nome + ' não está alocado.')
                                                                                //console.log('pla0=>' + pla0)
                                                                                var nome = elepla.nome
                                                                                if (nome == vis0) {
                                                                                    ins_dentro.push({ id: elepla._id, ges: nome })
                                                                                } else {
                                                                                    if (nome == vis1) {
                                                                                        ins_dentro.push({ id: elepla._id, ges: nome })
                                                                                    } else {
                                                                                        if (nome == vis2) {
                                                                                            ins_dentro.push({ id: elepla._id, ges: nome })
                                                                                        } else {
                                                                                            if (nome == vis3) {
                                                                                                ins_dentro.push({ id: elepla._id, ges: nome })
                                                                                            } else {
                                                                                                if (nome == vis4) {
                                                                                                    ins_dentro.push({ id: elepla._id, ges: nome })
                                                                                                } else {
                                                                                                    if (nome == vis5) {
                                                                                                        ins_dentro.push({ id: elepla._id, ges: nome })
                                                                                                    } else {
                                                                                                        ins_fora.push({ id: elepla._id, ges: elepla.nome })
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            } else {
                                                                                //console.log('está alocado')
                                                                                var nome = elepla.nome
                                                                                if (nome == vis0) {
                                                                                    ins_dentro.push({ id: elepla._id, ges: nome })
                                                                                } else {
                                                                                    if (nome == vis1) {
                                                                                        ins_dentro.push({ id: elepla._id, ges: nome })
                                                                                    } else {
                                                                                        if (nome == vis2) {
                                                                                            ins_dentro.push({ id: elepla._id, ges: nome })
                                                                                        } else {
                                                                                            if (nome == vis3) {
                                                                                                ins_dentro.push({ id: elepla._id, ges: nome })
                                                                                            } else {
                                                                                                if (nome == vis4) {
                                                                                                    ins_dentro.push({ id: elepla._id, ges: nome })
                                                                                                } else {
                                                                                                    if (nome == vis5) {
                                                                                                        ins_dentro.push({ id: elepla._id, ges: nome })
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    })

                                                                    //console.log('ins_dentro_ultimo=>' + ins_dentro)
                                                                    //console.log('ins_fora_ultimo=>' + ins_fora)
                                                                    if (equipepla.vis0 == '' || typeof equipepla.vis0 == 'undefined') {
                                                                        limpaVis = false
                                                                    }
                                                                    res.render('projeto/gerenciamento/recursosVistoria', { projeto, cronograma, equipepla, fora: ins_fora, dentro: ins_dentro, limpaVis })

                                                                }).catch((err) => {
                                                                    req.flash('error_msg', 'Falha ao encontrar o gestor<último>.')
                                                                    res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                                                })
                                                            }).catch((err) => {
                                                                req.flash('error_msg', 'Falha ao encontrar a equipe<último>.')
                                                                res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                                            })
                                                        }
                                                    }).catch((err) => {
                                                        req.flash('error_msg', 'Falha ao encontrar as equipes.')
                                                        res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                                    })
                                                })

                                            }).catch((err) => {
                                                req.flash('error_msg', 'Falha ao encontrar os gestores.')
                                                res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                            })
                                        }
                                    }
                                }
                            }
                            if (validaLivre == 0 && ins_dif == 0 && qtd_prj == crono_date.length) {
                                validaLivre = 1
                                Equipe.findOne({ projeto: req.params.id }).lean().then((equipepla) => {
                                    Pessoa.find({ funges: 'checked', user: _id }).then((planejamento) => {
                                        //console.log('equipepla.pla0=>' + equipepla.pla0)
                                        if (typeof equipepla.vis0 != 'undefined') {
                                            vis0 = equipepla.vis0
                                        }
                                        if (typeof equipepla.vis1 != 'undefined') {
                                            vis1 = equipepla.vis1
                                        }
                                        if (typeof equipepla.vis2 != 'undefined') {
                                            vis2 = equipepla.vis2
                                        }
                                        if (typeof equipepla.vis3 != 'undefined') {
                                            vis3 = equipepla.vis3
                                        }
                                        if (typeof equipepla.vis4 != 'undefined') {
                                            vis4 = equipepla.vis4
                                        }
                                        if (typeof equipepla.vis5 != 'undefined') {
                                            vis5 = equipepla.vis5
                                        }

                                        planejamento.forEach((elepla) => {
                                            if (gestor_alocado.length == '') {
                                                var nome = elepla.nome

                                                if (nome == vis0) {
                                                    ins_dentro.push({ id: elepla._id, ges: nome })
                                                } else {
                                                    if (nome == vis1) {
                                                        ins_dentro.push({ id: elepla._id, ges: nome })
                                                    } else {
                                                        if (nome == vis2) {
                                                            ins_dentro.push({ id: elepla._id, ges: nome })
                                                        } else {
                                                            if (nome == vis3) {
                                                                ins_dentro.push({ id: elepla._id, ges: nome })
                                                            } else {
                                                                if (nome == vis4) {
                                                                    ins_dentro.push({ id: elepla._id, ges: nome })
                                                                } else {
                                                                    if (nome == vis5) {
                                                                        ins_dentro.push({ id: elepla._id, ges: nome })
                                                                    } else {
                                                                        ins_fora.push({ id: elepla._id, ges: nome })
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        })
                                        //console.log('ins_dentro_data=>' + ins_dentro)
                                        //console.log('ins_fora_data=>' + ins_fora)
                                        if (equipepla.vis0 == '' || typeof equipepla.vis0 == 'undefined') {
                                            limpaVis = false
                                        }
                                        res.render('projeto/gerenciamento/recursosVistoria', { projeto, cronograma, equipepla, fora: ins_fora, dentro: ins_dentro, limpaVis })

                                    }).catch((err) => {
                                        req.flash('error_msg', 'Falha ao encontrar o gestor<data>.')
                                        res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Falha ao encontrar a equipe<data>.')
                                    res.redirect('/gerenciamento/cronograma/' + req.params.id)
                                })
                            }
                        }).catch((err) => {
                            req.flash('error_msg', 'Falha ao encontrar o projeto.')
                            res.redirect('/gerenciamento/cronograma/' + req.params.id)
                        })
                    })
                }
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao encontrar o cronograma.')
                res.redirect('/gerenciamento/cronograma/' + req.params.id)
            })
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao encontrar o cronograma.')
            res.redirect('/gerenciamento/cronograma/' + req.params.id)
        })
    }).catch((err) => {
        req.flash('error_msg', 'Falha ao encontrar o projeto.')
        res.redirect('/gerenciamento/cronograma/' + req.params.id)
    })
})

router.post('/salvarPlanejamento', ehAdmin, (req, res) => {
    const { _id } = req.user

    Projeto.findOne({ _id: req.body.id }).then((projeto) => {

        Equipe.findOne({ projeto: req.body.id }).then((equipe) => {

            equipe.pla0 = req.body.pla0
            equipe.pla1 = req.body.pla1
            equipe.pla2 = req.body.pla2
            equipe.pla3 = req.body.pla3
            equipe.pla4 = req.body.pla4
            equipe.pla5 = req.body.pla5

            if (req.body.pla0 != '' && typeof req.body.pla0 != 'undefined') {
                Pessoa.findOne({ nome: req.body.pla0 }).then((gestor) => {
                    projeto.funres = gestor._id
                    equipe.save().then(() => {
                        projeto.save().then(() => {
                            req.flash('success_msg', 'Gestor alocado!')
                            res.redirect('/pessoa/recursosPlanejamento/' + req.body.id)
                        }).catch((err) => {
                            req.flash('error_msg', 'Falha ao salvar o projeto.')
                            res.redirect('/pessoa/recursosPlanejamento/' + req.body.id)
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Houve uma falha ao salvar a equipe.')
                        res.redirect('/pessoa/recursosPlanejamento/' + req.body.id)
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao encontrar o gestor.')
                    res.redirect('/pessoa/recursosPlanejamento/' + req.body.id)
                })
            } else {
                equipe.save().then(() => {
                    projeto.save().then(() => {
                        Projeto.findOneAndUpdate({ _id: req.body.id }, { $unset: { funres: 1 } }).then(() => {
                            res.redirect('/pessoa/recursosPlanejamento/' + req.body.id)
                        }).catch((err) => {
                            req.flash('error_msg', 'Houve uma falha ao remover o responsável.')
                            res.redirect('/pessoa/recursosPlanejamento/' + req.body.id)
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Falha ao salvar o projeto.')
                        res.redirect('/pessoa/recursosPlanejamento/' + req.body.id)
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao salvar a equipe.')
                    res.redirect('/pessoa/recursosPlanejamento/' + req.body.id)
                })
            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve uma falha ao encontrar a equipe.')
            res.redirect('/pessoa/recursosPlanejamento/' + req.body.id)
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve uma falha ao encontrar o projeto.')
        res.redirect('/pessoa/recursosPlanejamento/' + req.body.id)
    })
})

router.post('/salvarProjetista', ehAdmin, (req, res) => {
    const { _id } = req.user

    Projeto.findOne({ _id: req.body.id }).then((projeto) => {

        Equipe.findOne({ projeto: req.body.id }).then((equipe) => {

            equipe.pro0 = req.body.pro0
            equipe.pro1 = req.body.pro1
            equipe.pro2 = req.body.pro2
            equipe.pro3 = req.body.pro3
            equipe.pro4 = req.body.pro4
            equipe.pro5 = req.body.pro5

            if (req.body.pro0 != '' && typeof req.body.pro0 != 'undefined') {
                Pessoa.findOne({ nome: req.body.pro0 }).then((projetista) => {
                    projeto.funpro = projetista._id
                    equipe.save().then(() => {
                        projeto.save().then(() => {
                            req.flash('success_msg', 'Projetista alocado!')
                            res.redirect('/pessoa/recursosProjetista/' + req.body.id)
                        }).catch((err) => {
                            req.flash('error_msg', 'Houve uma falha ao salvar o projeto.')
                            res.redirect('/pessoa/recursosProjetista/' + req.body.id)
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Houve uma falha ao salvar a equipe.')
                        res.redirect('/pessoa/recursosProjetista/' + req.body.id)
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao encontrar o projetista.')
                    res.redirect('/pessoa/recursosProjetista/' + req.body.id)
                })
            } else {
                equipe.save().then(() => {
                    projeto.save().then(() => {
                        Projeto.findOneAndUpdate({ _id: req.body.id }, { $unset: { funpro: 1 } }).then(() => {
                            res.redirect('/pessoa/recursosProjetista/' + req.body.id)
                        }).catch((err) => {
                            req.flash('error_msg', 'Houve uma falha ao remover o projetista.')
                            res.redirect('/pessoa/recursosProjetista/' + req.body.id)
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Houve uma falha ao salvar o projeto.')
                        res.redirect('/pessoa/recursosProjetista/' + req.body.id)
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao salvar a equipe.')
                    res.redirect('/pessoa/recursosProjetista/' + req.body.id)
                })
            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve uma falha ao encontrar o projeto.')
            res.redirect('/pessoa/recursosProjetista/' + req.body.id)
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve uma falha ao encontrar a equipe.')
        res.redirect('/pessoa/recursosProjetista/' + req.body.id)
    })
})

router.post('/salvarAterramento', ehAdmin, (req, res) => {
    const { _id } = req.user

    Equipe.findOne({ projeto: req.body.id }).then((equipe) => {

        equipe.ate0 = req.body.ate0
        equipe.ate1 = req.body.ate1
        equipe.ate2 = req.body.ate2
        equipe.ate3 = req.body.ate3
        equipe.ate4 = req.body.ate4
        equipe.ate5 = req.body.ate5

        equipe.save().then(() => {
            req.flash('success_msg', 'Aterradores alocados!')
            res.redirect('/pessoa/recursosAterramento/' + req.body.id)
        }).catch((err) => {
            req.flash('error_msg', 'Houve uma falha ao salvar a equipe.')
            res.redirect('/pessoa/recursosAterramento/' + req.body.id)
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve uma falha ao encontrar a equipe.')
        res.redirect('/pessoa/recursosAterramento/' + req.body.id)
    })
})

router.post('/salvarInversores', ehAdmin, (req, res) => {
    const { _id } = req.user

    Equipe.findOne({ projeto: req.body.id }).then((equipe) => {

        equipe.inv0 = req.body.inv0
        equipe.inv1 = req.body.inv1
        equipe.inv2 = req.body.inv2
        equipe.inv3 = req.body.inv3
        equipe.inv4 = req.body.inv4
        equipe.inv5 = req.body.inv5

        equipe.save().then(() => {
            req.flash('success_msg', 'Instaladores alocados!')
            res.redirect('/pessoa/recursosInversores/' + req.body.id)
        }).catch((err) => {
            req.flash('error_msg', 'Houve uma falha ao salvar a equipe.')
            res.redirect('/pessoa/recursosInversores/' + req.body.id)
        })

    }).catch((err) => {
        req.flash('error_msg', 'Houve uma falha ao encontrar a equipe.')
        res.redirect('/pessoa/recursosInversores/' + req.body.id)
    })
})

router.post('/salvarInstalacao', ehAdmin, (req, res) => {
    const { _id } = req.user

    Projeto.findOne({ _id: req.body.id }).then((projeto) => {

        Equipe.findOne({ projeto: req.body.id }).then((equipe) => {

            equipe.ins0 = req.body.ins0
            equipe.ins1 = req.body.ins1
            equipe.ins2 = req.body.ins2
            equipe.ins3 = req.body.ins3
            equipe.ins4 = req.body.ins4
            equipe.ins5 = req.body.ins5
            console.log('req.body.ins0=>' + req.body.ins0)
            console.log('req.body.ins1=>' + req.body.ins1)
            var qtdins
            if (req.body.ins5 != '' && typeof req.body.ins5 != 'undefined') {
                qtdins = 6
            } else {
                if (req.body.ins4 != '' && typeof req.body.ins4 != 'undefined') {
                    qtdins = 5
                } else {
                    if (req.body.ins3 != '' && typeof req.body.ins3 != 'undefined') {
                        qtdins = 4
                    } else {
                        if (req.body.ins2 != '' && typeof req.body.ins2 != 'undefined') {
                            qtdins = 3
                        } else {
                            if (req.body.ins1 != '' && typeof req.body.ins1 != 'undefined') {
                                qtdins = 2
                            } else {
                                qtdins = 1
                            }
                        }
                    }
                }
            }
            if (req.body.ins0 != '' || typeof req.body.pla0 != 'undefined') {
                Pessoa.findOne({ nome: req.body.ins0 }).then((instalador) => {
                    projeto.qtdins = qtdins
                    projeto.funins = instalador._id
                    equipe.save().then(() => {
                        //console.log('salvou equipe')
                        projeto.save().then(() => {
                            //console.log('salvou o projeto')
                            req.flash('success_msg', 'Instaladores alocados!')
                            res.redirect('/pessoa/recursosInstalacao/' + req.body.id)
                        }).catch((err) => {
                            req.flash('error_msg', 'Falha ao salvar a equipe.')
                            res.redirect('/pessoa/recursosInstalacao/' + req.body.id)
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Falha ao salvar o projeto.')
                        res.redirect('/pessoa/recursosInstalacao/' + req.body.id)
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao salvar a equipe.')
                    res.redirect('/pessoa/recursosInstalacao/' + req.body.id)
                })
            } else {
                equipe.save().then(() => {
                    projeto.save().then(() => {
                        Projeto.findOneAndUpdate({ _id: req.body.id }, { $unset: { funins: 1 } }).then(() => {
                            res.redirect('/pessoa/recursosInstalacao/' + req.body.id)
                        }).catch((err) => {
                            req.flash('error_msg', 'Houve uma falha ao remover o responsável.')
                            res.redirect('/pessoa/recursosInstalacao/' + req.body.id)
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Falha ao salvar o projeto.')
                        res.redirect('/pessoa/recursosInstalacao/' + req.body.id)
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao salvar a equipe.')
                    res.redirect('/pessoa/recursosInstalacao/' + req.body.id)
                })
            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve uma falha ao encontrar o instalador.')
            res.redirect('/pessoa/recursosInstalacao/' + req.body.id)
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve uma falha ao encontrar o projeto.')
        res.redirect('/pessoa/recursosInstalacao/' + req.body.id)
    })
})

router.post('/salvarArmazenamento', ehAdmin, (req, res) => {
    const { _id } = req.user

    Equipe.findOne({ projeto: req.body.id }).then((equipe) => {

        equipe.eae0 = req.body.eae0
        console.log('req.body.eae0=>' + req.body.eae0)
        equipe.eae1 = req.body.eae1
        equipe.eae2 = req.body.eae2
        equipe.eae3 = req.body.eae3
        equipe.eae4 = req.body.eae4
        equipe.eae5 = req.body.eae5
        equipe.save().then(() => {
            //console.log('salvou equipe')
            //console.log('salvou o projeto')
            req.flash('success_msg', 'Instaladores alocados!')
            res.redirect('/pessoa/recursosArmazenamento/' + req.body.id)
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao salvar a equipe.')
            res.redirect('/pessoa/recursosArmazenamento/' + req.body.id)
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve uma falha ao encontrar o instalador.')
        res.redirect('/pessoa/recursosArmazenamento/' + req.body.id)
    })
})

router.post('/salvarPainel', ehAdmin, (req, res) => {
    const { _id } = req.user

    Equipe.findOne({ projeto: req.body.id }).then((equipe) => {

        equipe.pnl0 = req.body.pnl0
        console.log('req.body.pnl0=>' + req.body.pnl0)
        equipe.pnl1 = req.body.pnl1
        equipe.pnl2 = req.body.pnl2
        equipe.pnl3 = req.body.pnl3
        equipe.pnl4 = req.body.pnl4
        equipe.pnl5 = req.body.pnl5
        equipe.save().then(() => {
            //console.log('salvou equipe')
            //console.log('salvou o projeto')
            req.flash('success_msg', 'Instaladores alocados!')
            res.redirect('/pessoa/recursosPainel/' + req.body.id)
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao salvar a equipe.')
            res.redirect('/pessoa/recursosPainel/' + req.body.id)
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve uma falha ao encontrar o instalador.')
        res.redirect('/pessoa/recursosPainel/' + req.body.id)
    })
})

router.post('/salvarVistoria', ehAdmin, (req, res) => {
    const { _id } = req.user
        Equipe.findOne({ projeto: req.body.id }).then((equipe) => {            
            equipe.vis0 = req.body.vis0
            equipe.vis1 = req.body.vis1
            equipe.vis2 = req.body.vis2
            equipe.vis3 = req.body.vis3
            equipe.vis4 = req.body.vis4
            equipe.vis5 = req.body.vis5
                equipe.save().then(() => {
                    req.flash('success_msg', 'Vistoriador alocado!')
                    res.redirect('/pessoa/recursosVistoria/' + req.body.id)
                }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao salvar a equipe.')
                    res.redirect('/pessoa/recursosVistoria/' + req.body.id)
                })
        }).catch((err) => {
            req.flash('error_msg', 'Houve uma falha ao encontrar a equipe.')
            res.redirect('/pessoa/recursosVistoria/' + req.body.id)
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
        Pessoa.find({ funins: 'checked', user: _id }).lean().then((instaladores) => {

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

            Projeto.findOne({ _id: req.body.id }).then((projeto_salva) => {
                projeto_salva.qtdequipe = ins_dentro.length
                projeto_salva.save().then(() => {
                    var texto = qtdins + ' no projeto.'
                    //////console.log(qtdins)
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

    var custo = 0


    Pessoa.find({ user: _id }).then((pessoas) => {
        pessoas.forEach((element) => {
            console.log('element.nome=>' + element.nome)
            console.log('req.body.ins0=>' + req.body.ins0)
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

        const novaequipe = new Equipe({
            user: _id,
            ativo: true,
            nome: req.body.nome,
            custoins: custo,
            ins0: req.body.ins0,
            ins1: req.body.ins1,
            ins2: req.body.ins2,
            ins3: req.body.ins3,
            ins4: req.body.ins4,
            ins5: req.body.ins5,
            ehpadrao: true
        })

        ////console.log(req.body.ins0, req.body.ins1, req.body.ins2)
        novaequipe.save().then(() => {
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
    Pessoa.find({ user: _id }).lean().then((pessoas) => {
        Pessoa.findOne({ _id: req.params.id, user: _id }).lean().then((pessoa) => {
            console.log('pessoa.funins=>'+pessoa.funins)
            if (pessoa.ehVendedor) {
                //console.log(pessoa.nome)
                //console.log('user=>' + _id)
                console.log('pessoa.nome=>' + pessoa.nome)
                //BUSCA VENDEDOR
                Projeto.find({ vendedor: pessoa._id }).then((projeto) => {
                    projeto.forEach((element) => {
                        console.log('encontrou vendedor')
                        if (element.cliente != '' && typeof element.cliente != 'undefined') {
                            Cliente.findOne({ _id: element.cliente }).then((cliente) => {
                                console.log('encontrou cliente')
                                const { nome } = element
                                const { dataini } = element
                                const { datafim } = element
                                nome_cliente = cliente.nome
                                const { _id } = element
                                dataord_ven = dataMensagem(element.valDataIni)
                                q = q + 1
                                projetos_ven.push({ funcao: 'Vendedor', nome_cliente, id: _id, nome: nome, dataini: dataini, datafim: datafim, foiRealiado: element.foiRealizado, dataord_ven })

                                if (projeto.length == q) {
                                    projetos_ven.sort(function (a, b) {
                                        if (a.dataord_ven > b.dataord_ven) {
                                            return 1;
                                        }
                                        if (a.dataord_ven < b.dataord_ven) {
                                            return -1;
                                        }
                                        return 0;
                                    })
                                    console.log('projetos_ven=>' + projetos_ven)
                                    res.render('mdo/vermais', { projetos_ven, total_ven: projetos_ven.length, pessoa: pessoa.nome })
                                }
                            }).catch((err) => {
                                req.flash('error_msg', 'Não foi encontrado o cliente.')
                                res.redirect('/pessoa/consulta')
                            })
                        } else {
                            aviso.push({ texto: 'Este vendedor esta livre! Não foi alocado em nenhum projeto.' })
                            res.render('mdo/findpessoas', { pessoas, aviso })
                        }
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Não foi encontrado o projeto.')
                    res.redirect('/pessoa/consulta')
                })
            } else {
                if (pessoa.funges == 'checked') {
                    //BUSCA PLANEJAMENTO
                    Equipe.find({
                        user: _id, $or: [{ pla0: pessoa.nome }, { pla1: pessoa.nome }, { pla2: pessoa.nome }, { pla3: pessoa.nome }, { pla4: pessoa.nome }, { pla5: pessoa.nome },
                        { vis0: pessoa.nome }, { vis1: pessoa.nome }, { vis2: pessoa.nome }, { vis3: pessoa.nome }, { vis4: pessoa.nome }, { vis5: pessoa.nome }], 'nome': { $exists: false }
                    }).lean().then((equipe) => {
                        if (equipe != '' && typeof equipe != 'undefined') {
                            console.log('entrou planejamento')
                            equipe.forEach(element => {
                                Cronograma.findOne({ projeto: element.projeto }).then((cronograma) => {
                                    Projeto.findOne({ _id: element.projeto }).then((projeto_pla) => {
                                        console.log('encontrou projeto')
                                        Cliente.findOne({ _id: projeto_pla.cliente }).then((cliente) => {
                                            console.log('encontrou cliente')
                                            const { nome_projeto } = element
                                            const { projeto } = element
                                            nome_cliente = cliente.nome
                                            if (element.pla0 == pessoa.nome ||
                                                element.pla1 == pessoa.nome ||
                                                element.pla2 == pessoa.nome ||
                                                element.pla3 == pessoa.nome ||
                                                element.pla4 == pessoa.nome ||
                                                element.pla5 == pessoa.nome) {
                                                dataini = dataMensagem(cronograma.dateplaini)
                                                datafim = dataMensagem(cronograma.dateplafim)
                                                funcao = 'Planejamento'
                                                dataord_pla = cronograma.agendaPlaIni
                                                projetos_pla.push({ funcao, nome_cliente, id: projeto, nome: nome_projeto, dataini, datafim, foiRealiado: projeto_pla.foiRealizado, dataord_pla })
                                            }
                                            if (element.vis0 == pessoa.nome ||
                                                element.vis1 == pessoa.nome ||
                                                element.vis2 == pessoa.nome ||
                                                element.vis3 == pessoa.nome ||
                                                element.vis4 == pessoa.nome ||
                                                element.vis5 == pessoa.nome) {
                                                dataini = dataMensagem(cronograma.datevisini)
                                                datafim = dataMensagem(cronograma.datevisfim)
                                                funcao = 'Instalador de Vistoria'
                                                dataord_vis = cronograma.agendaVisIni
                                                projetos_vis.push({ funcao, nome_cliente, id: projeto, nome: nome_projeto, dataini, datafim, foiRealizado: projeto_pla.foiRealizado, dataord_vis })
                                            }
                                            q = q + 1
                                            console.log('q=>' + q)
                                            if (equipe.length == q) {
                                                projetos_pla.sort(function (a, b) {
                                                    if (a.dataord_pla > b.dataord_pla) {
                                                        return 1;
                                                    }
                                                    if (a.dataord_pla < b.dataord_pla) {
                                                        return -1;
                                                    }
                                                    return 0;
                                                })
                                                projetos_vis.sort(function (a, b) {
                                                    if (a.dataord_vis > b.dataord_vis) {
                                                        return 1;
                                                    }
                                                    if (a.dataord_vis < b.dataord_vis) {
                                                        return -1;
                                                    }
                                                    return 0;
                                                })
                                                console.log('projetos_vis=>' + projetos_vis)
                                                console.log('projetos_pla=>' + projetos_pla)
                                                res.render('mdo/vermais', { projetos_vis, projetos_pla, total_vis: projetos_vis.length, total_pla: projetos_pla.length, pessoa: pessoa.nome })
                                            }
                                        }).catch((err) => {
                                            req.flash('error_msg', 'Não foi encontrado o cliente.')
                                            res.redirect('/pessoa/consulta')
                                        })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Não foi encontrado o projeto.')
                                        res.redirect('/pessoa/consulta')
                                    })
                                }).catch((err) => {
                                    req.flash('error_msg', 'Não foi encontrado o cronograma.')
                                    res.redirect('/pessoa/consulta')
                                })
                            })
                        } else {
                            aviso.push({ texto: 'Este gestor esta livre! Não foi alocado em nenhum projeto.' })
                            res.render('mdo/findpessoas', { aviso, pessoas })
                        }
                    }).catch((err) => {
                        req.flash('error_msg', 'Não foram encontradas pessoas na equipe.')
                        res.redirect('/pessoa/consulta')
                    })
                } else {
                    if (pessoa.funpro == 'checked') {
                        //BUSCA PROJETISTA
                        Equipe.find({ user: _id, $or: [{ pro0: pessoa.nome }, { pro1: pessoa.nome }, { pro2: pessoa.nome }, { pro3: pessoa.nome }, { pro4: pessoa.nome }, { pro5: pessoa.nome }], 'nome': { $exists: false } }).lean().then((equipe_pro) => {
                            if (equipe_pro != '' && typeof equipe_pro != 'undefined') {
                                equipe_pro.forEach(element => {
                                    console.log('entrou projetista')
                                    Cronograma.findOne({ projeto: element.projeto }).then((cronograma) => {
                                        Projeto.findOne({ _id: element.projeto }).then((projeto_pro) => {
                                            Cliente.findOne({ _id: projeto_pro.cliente }).then((cliente) => {
                                                const { nome_projeto } = element
                                                const { projeto } = element
                                                nome_cliente = cliente.nome
                                                console.log('nome_projeto=>' + nome_projeto)
                                                dataini = dataMensagem(cronograma.dateprjini)
                                                datafim = dataMensagem(cronograma.dateprjfim)
                                                console.log('dataini=>' + dataini)
                                                console.log('datafim=>' + datafim)
                                                dataord_pro = cronograma.agendaPrjIni
                                                console.log('dataord_pro=>' + dataord_pro)
                                                q = q + 1
                                                projetos_pro.push({ funcao: 'Projetista', nome_cliente, id: projeto, nome: nome_projeto, dataini, datafim, foiRealizado: projeto_pro.foiRealizado, dataord_pro })
                                                console.log('q=>' + q)
                                                console.log('equipe_pro.length=>' + equipe_pro.length)
                                                if (equipe_pro.length == q) {
                                                    projetos_pro.sort(function (a, b) {
                                                        if (a.dataord_pro > b.dataord_pro) {
                                                            return 1;
                                                        }
                                                        if (a.dataord_pro < b.dataord_pro) {
                                                            return -1;
                                                        }
                                                        return 0;
                                                    })
                                                    console.log('projetos_pro=>' + projetos_pro)
                                                    res.render('mdo/vermais', { projetos_pro, total_pro: projetos_pro.length, pessoa: pessoa.nome })
                                                }
                                            }).catch((err) => {
                                                req.flash('error_msg', 'Não foi encontrado o cliente.')
                                                res.redirect('/pessoa/consulta')
                                            })
                                        }).catch((err) => {
                                            req.flash('error_msg', 'Não foi encontrado o projeto.')
                                            res.redirect('/pessoa/consulta')
                                        })
                                    }).catch((err) => {
                                        req.flash('error_msg', 'Não foi encontrado o cronograma.')
                                        res.redirect('/pessoa/consulta')
                                    })
                                })
                            } else {
                                aviso.push({ texto: 'Este projetista esta livre! Não foi alocado em nenhum projeto.' })
                                res.render('mdo/findpessoas', { aviso, pessoas })
                            }
                        }).catch((err) => {
                            req.flash('error_msg', 'Não foram encontradas pessoas na equipe.')
                            res.redirect('/pessoa/consulta')
                        })
                    } else {
                        if (pessoa.funins == 'checked') {
                            //BUSCA INSTALADORES
                            Equipe.find({
                                user: _id, $or: [{ ate0: pessoa.nome }, { ate1: pessoa.nome }, { ate2: pessoa.nome }, { ate3: pessoa.nome }, { ate4: pessoa.nome }, { ate5: pessoa.nome },
                                { inv0: pessoa.nome }, { inv1: pessoa.nome }, { inv2: pessoa.nome }, { inv3: pessoa.nome }, { inv4: pessoa.nome }, { inv5: pessoa.nome },
                                { pnl0: pessoa.nome }, { pnl1: pessoa.nome }, { pnl2: pessoa.nome }, { pnl3: pessoa.nome }, { pnl4: pessoa.nome }, { pnl5: pessoa.nome },
                                { eae0: pessoa.nome }, { eae1: pessoa.nome }, { eae2: pessoa.nome }, { eae3: pessoa.nome }, { eae4: pessoa.nome }, { eae5: pessoa.nome },
                                { ins0: pessoa.nome }, { ins1: pessoa.nome }, { ins2: pessoa.nome }, { ins3: pessoa.nome }, { ins4: pessoa.nome }, { ins5: pessoa.nome }], 'nome': { $exists: false }
                            }).lean().then((equipe_ins) => {
                                if (equipe_ins != '' && typeof equipe_ins != 'undefined') {
                                    equipe_ins.forEach(element => {
                                        console.log('entrou INSTALADORES')
                                        Cronograma.findOne({ projeto: element.projeto }).then((cronograma) => {
                                            Projeto.findOne({ _id: element.projeto }).then((projeto_ins) => {
                                                Cliente.findOne({ _id: projeto_ins.cliente }).then((cliente) => {
                                                    const { nome_projeto } = element
                                                    const { projeto } = element
                                                    foiRealizado = projeto_ins.foiRealizado
                                                    nome_cliente = cliente.nome

                                                    if (element.ate0 == pessoa.nome ||
                                                        element.ate1 == pessoa.nome ||
                                                        element.ate2 == pessoa.nome ||
                                                        element.ate3 == pessoa.nome ||
                                                        element.ate4 == pessoa.nome ||
                                                        element.ate5 == pessoa.nome) {
                                                        dataini = dataMensagem(cronograma.dateateini)
                                                        datafim = dataMensagem(cronograma.dateatefim)
                                                        funcao = 'Instalador de Aterramento'
                                                        dataord_ate = cronograma.agendaAteIni
                                                        projetos_ate.push({ funcao, nome_cliente, id: projeto, nome: nome_projeto, dataini, datafim, foiRealizado, dataord_ate })
                                                    }

                                                    if (element.inv0 == pessoa.nome ||
                                                        element.inv1 == pessoa.nome ||
                                                        element.inv2 == pessoa.nome ||
                                                        element.inv3 == pessoa.nome ||
                                                        element.inv4 == pessoa.nome ||
                                                        element.inv5 == pessoa.nome) {
                                                        dataini = dataMensagem(cronograma.dateinvini)
                                                        datafim = dataMensagem(cronograma.dateinvfim)
                                                        funcao = 'Instalador de Inversores e StringBox'
                                                        dataord_inv = cronograma.agendaInvIni
                                                        projetos_inv.push({ funcao, nome_cliente, id: projeto, nome: nome_projeto, dataini, datafim, foiRealizado, dataord_inv })
                                                    }

                                                    if (element.pnl0 == pessoa.nome ||
                                                        element.pnl1 == pessoa.nome ||
                                                        element.pnl2 == pessoa.nome ||
                                                        element.pnl3 == pessoa.nome ||
                                                        element.pnl4 == pessoa.nome ||
                                                        element.pnl5 == pessoa.nome) {
                                                        dataini = dataMensagem(cronograma.datepnlini)
                                                        datafim = dataMensagem(cronograma.datepnlfim)
                                                        funcao = 'Instalador de Painel Elétrico'
                                                        dataord_pnl = cronograma.agendaPnlIni
                                                        projetos_pnl.push({ funcao, nome_cliente, id: projeto, nome: nome_projeto, dataini, datafim, foiRealizado, dataord_pnl })
                                                    }

                                                    if (element.eae0 == pessoa.nome ||
                                                        element.eae1 == pessoa.nome ||
                                                        element.eae2 == pessoa.nome ||
                                                        element.eae3 == pessoa.nome ||
                                                        element.eae4 == pessoa.nome ||
                                                        element.eae5 == pessoa.nome) {
                                                        dataini = dataMensagem(cronograma.dateeaeini)
                                                        datafim = dataMensagem(cronograma.dateeaefim)
                                                        funcao = 'Instalador de Estação de Armazenamento'
                                                        dataord_eae = cronograma.agendaEaeIni
                                                        projetos_eae.push({ funcao, nome_cliente, id: projeto, nome: nome_projeto, dataini, datafim, foiRealizado, dataord_eae })
                                                    }

                                                    if (element.ins0 == pessoa.nome ||
                                                        element.ins1 == pessoa.nome ||
                                                        element.ins2 == pessoa.nome ||
                                                        element.ins3 == pessoa.nome ||
                                                        element.ins4 == pessoa.nome ||
                                                        element.ins5 == pessoa.nome) {
                                                        dataini = dataMensagem(cronograma.dateestini)
                                                        datafim = dataMensagem(cronograma.datemodfim)
                                                        funcao = 'Instalador de Estruturas e Módulos'
                                                        dataord_ins = cronograma.agendaEstIni
                                                        projetos_ins.push({ funcao, nome_cliente, id: projeto, nome: nome_projeto, dataini, datafim, foiRealizado, dataord_ins })
                                                    }

                                                    q = q + 1
                                                    console.log('equipe_ins.length=>' + equipe_ins.length)
                                                    console.log('q=>' + q)
                                                    if (equipe_ins.length == q) {

                                                        projetos_ate.sort(function (a, b) {
                                                            if (a.dataord_ate > b.dataord_ate) {
                                                                return 1;
                                                            }
                                                            if (a.dataord_ate < b.dataord_ate) {
                                                                return -1;
                                                            }
                                                            return 0;
                                                        })

                                                        projetos_inv.sort(function (a, b) {
                                                            if (a.dataord_inv > b.dataord_inv) {
                                                                return 1;
                                                            }
                                                            if (a.dataord_inv < b.dataord_inv) {
                                                                return -1;
                                                            }
                                                            return 0;
                                                        })

                                                        projetos_ins.sort(function (a, b) {
                                                            if (a.dataord_ins > b.dataord_ins) {
                                                                return 1;
                                                            }
                                                            if (a.dataord_ins < b.dataord_ins) {
                                                                return -1;
                                                            }
                                                            return 0;
                                                        })

                                                        projetos_pnl.sort(function (a, b) {
                                                            if (a.dataord_pnl > b.dataord_pnl) {
                                                                return 1;
                                                            }
                                                            if (a.dataord_pnl < b.dataord_pnl) {
                                                                return -1;
                                                            }
                                                            return 0;
                                                        })
                                                        projetos_eae.sort(function (a, b) {
                                                            if (a.dataord_eae > b.dataord_eae) {
                                                                return 1;
                                                            }
                                                            if (a.dataord_eae < b.dataord_eae) {
                                                                return -1;
                                                            }
                                                            return 0;
                                                        })


                                                        res.render('mdo/vermais', {
                                                            projetos_ate, projetos_inv, projetos_ins, projetos_pnl, projetos_eae,
                                                            projetos_ven, projetos_pro, projetos_pla,
                                                            total_ate: projetos_ate.length, total_inv: projetos_inv.length,
                                                            total_ins: projetos_ins.length, total_pnl: projetos_pnl.length,
                                                            total_eae: projetos_eae.length, total_ven: projetos_ven.length,
                                                            total_pro: projetos_pro.length, total_pla: projetos_pla.length,
                                                            pessoa: pessoa.nome
                                                        })

                                                    }
                                                }).catch((err) => {
                                                    req.flash('error_msg', 'Não foi encontrado o cliente.')
                                                    res.redirect('/pessoa/consulta')
                                                })
                                            }).catch((err) => {
                                                req.flash('error_msg', 'Não foi encontrado o projeto.')
                                                res.redirect('/pessoa/consulta')
                                            })
                                        }).catch((err) => {
                                            req.flash('error_msg', 'Não foi encontrado o cronograma.')
                                            res.redirect('/pessoa/consulta')
                                        })
                                    })
                                } else {
                                    aviso.push({ texto: 'Este instalador esta livre! Não foi alocado em nenhum projeto.' })
                                    res.render('mdo/findpessoas', { aviso, pessoas })
                                }
                            }).catch((err) => {
                                req.flash('error_msg', 'Não foram encontradas pessoas na equipe.')
                                res.redirect('/pessoa/consulta')
                            })
                        }

                    }
                }
            }
        }).catch((err) => {
            req.flash('error_msg', 'Não foram encontradas pessoas.')
            res.redirect('/pessoa/consulta')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Não foram encontradas pessoas cadastradas')
        res.redirect('/pessoa')
    })
    /*
    //BUSCA INVERSOR
    Equipe.find({ user: _id, $or: [{ inv0: pessoa.nome }, { inv1: pessoa.nome }, { inv2: pessoa.nome }, { inv3: pessoa.nome }, { inv4: pessoa.nome }, { inv5: pessoa.nome }] }).lean().then((equipe) => {
        console.log('entrou inversor')
        console.log('equipe=>' + equipe)
        if (equipe != '' && typeof equipe != 'undefined') {
            equipe.forEach(element => {
                Cronograma.findOne({ projeto: element.projeto }).then((cronograma) => {
                    Projeto.findOne({ _id: element.projeto }).then((inv_pro) => {
                        Cliente.findOne({ _id: inv_pro.cliente }).then((cliente) => {
                            const { nome_projeto } = element
                            const { projeto } = element
                            nome_cliente = cliente.nome
                            dataini = dataMensagem(cronograma.dateinvini)
                            datafim = dataMensagem(cronograma.dateinvfim)
                            q = q + 1
                            projetos.push({ funcao: 'Instalador Inversor e String Box', nome_cliente, id: projeto, nome: nome_projeto, dataini, datafim, foiRealiado: inv_pro.foiRealizado, dataord: cronograma.agendainvini })
                            console.log('element.length=>' + element.length)
                            console.log('q=>' + q)
                            if (equipe.length == q) {
                                projetos.sort(function (a, b) {
                                    if (a.dataord > b.dataord) {
                                        return 1;
                                    }
                                    if (a.dataord < b.dataord) {
                                        return -1;
                                    }
                                    return 0;
                                })
                                console.log('projetos=>' + projetos)
                                res.render('mdo/vermais', { projetos, total: equipe.length, pessoa: pessoa.nome })
                            }
                        }).catch((err) => {
                            req.flash('error_msg', 'Não foi encontrado o cliente.')
                            res.redirect('/pessoa/consulta')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Não foi encontrado o projeto.')
                        res.redirect('/pessoa/consulta')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Não foi encontrado o cronograma.')
                    res.redirect('/pessoa/consulta')
                })
            })
        }else{
            req.flash('error_msg', 'Este instalador esta livre! Não foi alocado em nenhum projeto.')
            res.redirect('/pessoa/consulta')                
        }
    }).catch((err) => {
        req.flash('error_msg', 'Não foram encontradas pessoas na equipe.')
        res.redirect('/pessoa/consulta')
    })
    //BUSCA PAINEL
    Equipe.find({ user: _id, $or: [{ pnl0: pessoa.nome }, { pnl1: pessoa.nome }, { pnl2: pessoa.nome }, { pnl3: pessoa.nome }, { pnl4: pessoa.nome }, { pnl5: pessoa.nome }] }).lean().then((equipe) => {
        console.log('entrou painel')
        console.log('equipe=>' + equipe)
        if (equipe != '' && typeof equipe != 'undefined') {
            equipe.forEach(element => {
                Cronograma.findOne({ projeto: element.projeto }).then((cronograma) => {
                    Projeto.findOne({ _id: element.projeto }).then((pnl_pro) => {
                        Cliente.findOne({ _id: pnl_pro.cliente }).then((cliente) => {
                            const { nome_projeto } = element
                            const { projeto } = element
                            nome_cliente = cliente.nome
                            dataini = dataMensagem(cronograma.datepnlini)
                            datafim = dataMensagem(cronograma.datepnlfim)
                            q = q + 1
                            projetos.push({ funcao: 'Instalador Painél Elétrico', nome_cliente, id: projeto, nome: nome_projeto, dataini, datafim, foiRealiado: pnl_pro.foiRealizado, dataord: cronograma.agendapnlini })
                            console.log('element.length=>' + element.length)
                            console.log('q=>' + q)
                            if (equipe.length == q) {
                                projetos.sort(function (a, b) {
                                    if (a.dataord > b.dataord) {
                                        return 1;
                                    }
                                    if (a.dataord < b.dataord) {
                                        return -1;
                                    }
                                    return 0;
                                })
                                console.log('projetos=>' + projetos)
                                res.render('mdo/vermais', { projetos, total: equipe.length, pessoa: pessoa.nome })
                            }
                        }).catch((err) => {
                            req.flash('error_msg', 'Não foi encontrado o cliente.')
                            res.redirect('/pessoa/consulta')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Não foi encontrado o projeto.')
                        res.redirect('/pessoa/consulta')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Não foi encontrado o cronograma.')
                    res.redirect('/pessoa/consulta')
                })
            })
        }else{
            req.flash('error_msg', 'Este instalador esta livre! Não foi alocado em nenhum projeto.')
            res.redirect('/pessoa/consulta')                
        }
    }).catch((err) => {
        req.flash('error_msg', 'Não foram encontradas pessoas na equipe.')
        res.redirect('/pessoa/consulta')
    })
    //BUSCA ARMAZENAMENTO
    Equipe.find({ user: _id, $or: [{ eae0: pessoa.nome }, { eae1: pessoa.nome }, { eae2: pessoa.nome }, { eae3: pessoa.nome }, { eae4: pessoa.nome }, { eae5: pessoa.nome }] }).lean().then((equipe) => {
        console.log('entrou armazenagem')
        console.log('equipe=>' + equipe)
        if (equipe != '' && typeof equipe != 'undefined') {
            equipe.forEach(element => {
                Cronograma.findOne({ projeto: element.projeto }).then((cronograma) => {
                    Projeto.findOne({ _id: element.projeto }).then((eae_pro) => {
                        Cliente.findOne({ _id: eae_pro.cliente }).then((cliente) => {
                            const { nome_projeto } = element
                            const { projeto } = element
                            nome_cliente = cliente.nome
                            dataini = dataMensagem(cronograma.dateeaeini)
                            datafim = dataMensagem(cronograma.dateeaefim)
                            q = q + 1
                            projetos.push({ funcao: 'Instalador Da Estação de Armazenamento', nome_cliente, id: projeto, nome: nome_projeto, dataini, datafim, foiRealiado: eae_pro.foiRealizado, dataord: cronograma.agendaeaeini })
                            console.log('element.length=>' + element.length)
                            console.log('q=>' + q)
                            if (equipe.length == q) {
                                projetos.sort(function (a, b) {
                                    if (a.dataord > b.dataord) {
                                        return 1;
                                    }
                                    if (a.dataord < b.dataord) {
                                        return -1;
                                    }
                                    return 0;
                                })
                                console.log('projetos=>' + projetos)
                                res.render('mdo/vermais', { projetos, total: equipe.length, pessoa: pessoa.nome })
                            }
                        }).catch((err) => {
                            req.flash('error_msg', 'Não foi encontrado o cliente.')
                            res.redirect('/pessoa/consulta')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Não foi encontrado o projeto.')
                        res.redirect('/pessoa/consulta')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Não foi encontrado o cronograma.')
                    res.redirect('/pessoa/consulta')
                })
            })
        }else{
            req.flash('error_msg', 'Este instalador esta livre! Não foi alocado em nenhum projeto.')
            res.redirect('/pessoa/consulta')                
        }
    }).catch((err) => {
        req.flash('error_msg', 'Não foram encontradas pessoas na equipe.')
        res.redirect('/pessoa/consulta')
    })
    //BUSCA INSTALAÇÃO
    Equipe.find({ user: _id, $or: [{ ins0: pessoa.nome }, { ins1: pessoa.nome }, { ins2: pessoa.nome }, { ins3: pessoa.nome }, { ins4: pessoa.nome }, { ins5: pessoa.nome }] }).lean().then((equipe) => {
        console.log('entrou instalação')
        console.log('equipe=>' + equipe)
        if (equipe != '' && typeof equipe != 'undefined') {
            equipe.forEach(element => {
                Cronograma.findOne({ projeto: element.projeto }).then((cronograma) => {
                    Projeto.findOne({ _id: element.projeto }).then((ins_pro) => {
                        Cliente.findOne({ _id: ins_pro.cliente }).then((cliente) => {
                            const { nome_projeto } = element
                            const { projeto } = element
                            nome_cliente = cliente.nome
                            dataini = dataMensagem(cronograma.dateinsini)
                            datafim = dataMensagem(cronograma.dateinsfim)
                            q = q + 1
                            projetos.push({ funcao: 'Instalador das Estruturas e Módulos', nome_cliente, id: projeto, nome: nome_projeto, dataini, datafim, foiRealiado: ins_pro.foiRealizado, dataord: cronograma.agendainsini })
                            console.log('element.length=>' + element.length)
                            console.log('q=>' + q)
                            if (equipe.length == q) {
                                projetos.sort(function (a, b) {
                                    if (a.dataord > b.dataord) {
                                        return 1;
                                    }
                                    if (a.dataord < b.dataord) {
                                        return -1;
                                    }
                                    return 0;
                                })
                                console.log('projetos=>' + projetos)
                                res.render('mdo/vermais', { projetos, total: equipe.length, pessoa: pessoa.nome })
                            }
                        }).catch((err) => {
                            req.flash('error_msg', 'Não foi encontrado o cliente.')
                            res.redirect('/pessoa/consulta')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Não foi encontrado o projeto.')
                        res.redirect('/pessoa/consulta')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Não foi encontrado o cronograma.')
                    res.redirect('/pessoa/consulta')
                })
            })
        }else{
            req.flash('error_msg', 'Este instalador esta livre! Não foi alocado em nenhum projeto.')
            res.redirect('/pessoa/consulta')                
        }
    }).catch((err) => {
        req.flash('error_msg', 'Não foram encontradas pessoas na equipe.')
        res.redirect('/pessoa/consulta')
    })
    //BUSCA VISTORIA
    Equipe.find({ user: _id, $or: [{ vis0: pessoa.nome }, { vis1: pessoa.nome }, { vis2: pessoa.nome }, { vis3: pessoa.nome }, { vis4: pessoa.nome }, { vis5: pessoa.nome }] }).lean().then((equipe) => {
        console.log('entrou vistoria')
        console.log('equipe=>' + equipe)
        if (equipe != '' && typeof equipe != 'undefined') {
            equipe.forEach(element => {
                Cronograma.findOne({ projeto: element.projeto }).then((cronograma) => {
                    Projeto.findOne({ _id: element.projeto }).then((vis_pro) => {
                        Cliente.findOne({ _id: vis_pro.cliente }).then((cliente) => {
                            const { nome_projeto } = element
                            const { projeto } = element
                            nome_cliente = cliente.nome
                            dataini = dataMensagem(cronograma.datevisini)
                            datafim = dataMensagem(cronograma.datevisfim)
                            q = q + 1
                            projetos.push({ funcao: 'Instalador das Estruturas e Módulos', nome_cliente, id: projeto, nome: nome_projeto, dataini, datafim, foiRealiado: vis_pro.foiRealizado, dataord: cronograma.agendavisini })
                            console.log('element.length=>' + element.length)
                            console.log('q=>' + q)
                            if (equipe.length == q) {
                                projetos.sort(function (a, b) {
                                    if (a.dataord > b.dataord) {
                                        return 1;
                                    }
                                    if (a.dataord < b.dataord) {
                                        return -1;
                                    }
                                    return 0;
                                })
                                console.log('projetos=>' + projetos)
                                res.render('mdo/vermais', { projetos, total: equipe.length, pessoa: pessoa.nome })
                            }
                        }).catch((err) => {
                            req.flash('error_msg', 'Não foi encontrado o cliente.')
                            res.redirect('/pessoa/consulta')
                        })
                    }).catch((err) => {
                        req.flash('error_msg', 'Não foi encontrado o projeto.')
                        res.redirect('/pessoa/consulta')
                    })
                }).catch((err) => {
                    req.flash('error_msg', 'Não foi encontrado o cronograma.')
                    res.redirect('/pessoa/consulta')
                })
            })
        }else{
            req.flash('error_msg', 'Este instalador esta livre! Não foi alocado em nenhum projeto.')
            res.redirect('/pessoa/consulta')                
        }
    }).catch((err) => {
        req.flash('error_msg', 'Não foram encontradas pessoas na equipe.')
        res.redirect('/pessoa/consulta')
    })
    */
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
    var funeng
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
    //console.log('nome=>'+req.body.nome )
    //console.log('endereco=>'+req.body.endereco )
    //console.log('documento=>'+req.body.documento )
    //console.log('celular=>'+req.body.celular )
    //console.log('email=>'+req.body.email )

    if (req.body.nome == '' || req.body.endereco == '' || documento == '' ||
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
        if (req.body.funeng != null) {
            funcao = + 1
        }
        if (req.body.funpro != null) {
            funcao = + 1
        }
        if (req.body.funins != null) {
            funcao = + 1
        }
        if (req.body.funele != null) {
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
        //Validando função engenheiro
        if (req.body.funeng != null) {
            funeng = 'checked'
        } else {
            funeng = 'unchecked'
        }
        //Validando função projetista
        if (req.body.funpro != null) {
            funpro = 'checked'
        } else {
            funpro = 'unchecked'
        }
        //Validandofunção instalador
        if (req.body.funins != null) {
            funins = 'checked'
        } else {
            funins = 'unchecked'
        }
        //Validandofunção eletricista
        if (req.body.funele != null) {
            funele = 'checked'
        } else {
            funele = 'unchecked'
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

        //console.log('req.file=>' + req.file)
        var foto
        if (req.file != null) {
            foto = req.file.filename
        } else {
            foto = ''
        }
        var custo
        if (req.body.custo != '') {
            custo = req.body.custo
        } else {
            custo = 0
        }
        const pessoa = {
            user: _id,
            nome: req.body.nome,
            custo: custo,
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
            funges: funges, funeng: funeng,
            funeng: funeng,
            funpro: funpro,
            funins: funins,
            funele: funele,
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
    var funeng
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

    //console.log('nome=>'+req.body.nome )
    //console.log('endereco=>'+req.body.endereco )
    //console.log('documento=>'+req.body.documento )
    //console.log('celular=>'+req.body.celular )
    //console.log('email=>'+req.body.email )

    if (req.body.nome == '' || req.body.endereco == '' || documento == '' || req.body.iniati == '' ||
        req.body.celular == '' || req.body.email == '') {
        erros.push({ texto: 'Todo os campos de descrição são obrigatórios' })
    }

    var ehVendedor
    if (req.body.ehVendedor != 'true') {
        ehVendedor = false
        if (req.body.funges != null) {
            funcao = + 1
        }
        if (req.body.funeng != null) {
            funcao = + 1
        }
        if (req.body.funpro != null) {
            funcao = + 1
        }
        if (req.body.funins != null) {
            funcao = + 1
        }
        if (req.body.funele != null) {
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
        //Validando função engenheiro
        if (req.body.funeng != null) {
            funeng = 'checked'
        } else {
            funeng = 'unchecked'
        }
        //Validando função projetista
        if (req.body.funpro != null) {
            funpro = 'checked'
        } else {
            funpro = 'unchecked'
        }
        //Validando função instalador
        if (req.body.funins != null) {
            funins = 'checked'
        } else {
            funins = 'unchecked'
        }
        //Validando função eletricista
        if (req.body.funele != null) {
            funele = 'checked'
        } else {
            funele = 'unchecked'
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
            if (req.body.uf != '' && req.body.uf != pessoa.uf) {
                pessoa.uf = req.body.uf
            }
            if (req.body.cidade != '' && req.body.uf != pessoa.cidade) {
                pessoa.cidade = req.body.cidade
            }
            if (req.body.custo != '') {
                pessoa.custo = req.body.custo
            } else {
                pessoa.custo = 0
            }
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
            pessoa.funeng = funeng
            pessoa.funpro = funpro
            pessoa.funins = funins
            pessoa.funele = funele
            console.log('req.file=>' + req.file)
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
    var funeng
    var funpro
    var funele
    var ehVendedor
    var funcao = req.body.funcao
    switch (funcao) {
        case 'Instalador': funins = 'checked', funeng = 'unchecked', funges = 'unchecked', funpro = 'unchecked', funele = 'unchecked', ehVendedor = false;
            break;
        case 'Engenheiro': funins = 'unchecked', funeng = 'checked', funges = 'unchecked', funpro = 'unchecked', funele = 'unchecked', ehVendedor = false;
            break;
        case 'Projetista': funins = 'unchecked', funeng = 'unchecked', funges = 'unchecked', funpro = 'checked', funele = 'unchecked', ehVendedor = false;
            break;
        case 'Gestor': funins = 'unchecked', funeng = 'unchecked', funges = 'checked', funpro = 'unchecked', funele = 'unchecked', ehVendedor = false;
            break;
        case 'Vendedor': funins = 'unchecked', funeng = 'unchecked', funges = 'unchecked', funpro = 'unchecked', funele = 'unchecked', ehVendedor = true;
            break;
        case 'Eletricista': funins = 'unchecked', funeng = 'unchecked', funges = 'unchecked', funpro = 'unchecked', funele = 'checked', ehVendedor = false;
            break;
    }
    console.log('funcao=>' + funcao)
    console.log('funins=>' + funins)
    console.log('funeng=>' + funeng)
    console.log('funges=>' + funges)
    console.log('funpro=>' + funpro)
    console.log('funele=>' + funele)
    console.log('ehVendedor=>' + ehVendedor)
    console.log('nome=>' + nome)
    console.log('uf=>' + uf)
    console.log('cidade=>' + cidade)

    if (nome != '' && uf != '' && cidade != '' && funcao != 'Todos') {
        Pessoa.find({ nome: new RegExp(nome), uf: new RegExp(uf), cidade: new RegExp(cidade), funins: funins, funges: funges, funeng: funeng, funpro: funpro, ehVendedor: ehVendedor, user: _id }).lean().then((pessoas) => {
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
                    console.log('achou')
                    Pessoa.find({ funins: funins, funges: funges, funeng: funeng, funpro: funpro, funele: funele, ehVendedor: ehVendedor, user: _id }).lean().then((pessoas) => {
                        res.render('mdo/findpessoas', { pessoas: pessoas, cidade: cidade, uf: uf, nome: nome, funcao: funcao })
                    })
                } else {
                    if (nome == '' && cidade == '') {
                        Pessoa.find({ uf: new RegExp(uf), funins: funins, funges: funges, funeng: funeng, funpro: funpro, funele: funele, ehVendedor: ehVendedor, user: _id }).lean().then((pessoas) => {
                            res.render('mdo/findpessoas', { pessoas: pessoas, cidade: cidade, uf: uf, nome: nome, funcao: funcao })
                        })
                    } else {
                        if (nome == '' && uf == '') {
                            Pessoa.find({ cidade: new RegExp(cidade), funins: funins, funges: funges, funeng: funeng, funpro: funpro, funele: funele, ehVendedor: ehVendedor, user: _id }).lean().then((pessoas) => {
                                res.render('mdo/findpessoas', { pessoas: pessoas, cidade: cidade, uf: uf, nome: nome, funcao: funcao })
                            })
                        } else {
                            if (cidade == '' && uf == '') {
                                Pessoa.find({ nome: new RegExp(nome), funins: funins, funges: funges, funeng: funeng, funpro: funpro, funele: funele, ehVendedor: ehVendedor, user: _id }).lean().then((pessoas) => {
                                    res.render('mdo/findpessoas', { pessoas: pessoas, cidade: cidade, uf: uf, nome: nome, funcao: funcao })
                                })
                            } else {
                                if (cidade == '') {
                                    Pessoa.find({ nome: new RegExp(nome), uf: new RegExp(uf), funins: funins, funges: funges, funeng: funeng, funpro: funpro, funele: funele, ehVendedor: ehVendedor, user: _id }).lean().then((pessoas) => {
                                        res.render('mdo/findpessoas', { pessoas: pessoas, cidade: cidade, uf: uf, nome: nome, funcao: funcao })
                                    })
                                } else {
                                    if (uf == '') {
                                        Pessoa.find({ nome: new RegExp(nome), cidade: new RegExp(cidade), funins: funins, funges: funges, funeng: funeng, funpro: funpro, funele: funele, ehVendedor: ehVendedor, user: _id }).lean().then((pessoas) => {
                                            res.render('mdo/findpessoas', { pessoas: pessoas, cidade: cidade, uf: uf, nome: nome, funcao: funcao })
                                        })
                                    } else {
                                        Pessoa.find({ cidade: new RegExp(cidade), uf: new RegExp(uf), funins: funins, funges: funges, funeng: funeng, funpro: funpro, funele: funele, ehVendedor: ehVendedor, user: _id }).lean().then((pessoas) => {
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