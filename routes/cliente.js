const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

require('../model/Cliente')
require('../model/Projeto')
require('../model/Tarefas')
require('../model/Plano')
const Cliente = mongoose.model('cliente')
const Usina = mongoose.model('usina')
const Tarefa = mongoose.model('tarefas')
const Plano = mongoose.model('plano')


const validaCampos = require('../resources/validaCampos')
const dataBusca = require('../resources/dataBusca')
const comparaDatas = require('../resources/comparaDatas')
const validaCronograma = require('../resources/validaCronograma')
const liberaRecursos = require('../resources/liberaRecursos')
const setData = require('../resources/setData')
const dataMensagem = require('../resources/dataMensagem')
const dataHoje = require('../resources/dataHoje')
const { ehAdmin } = require('../helpers/ehAdmin')

router.get('/consulta', ehAdmin, (req, res) => {
    const { _id } = req.user
    Cliente.find({ user: _id }).lean().then((clientes) => {
        res.render('cliente/findclientes', { clientes: clientes })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar os clientes.')
        res.redirect('/Cliente/novo')
    })
})

router.get('/novo', ehAdmin, (req, res) => {
    res.render('cliente/cliente')
})

router.post('/novo', ehAdmin, (req, res) => {
    const { _id } = req.user
    var erros = []

    if (req.body.cnpj != '') {
        documento = req.body.cnpj
    } else {
        documento = req.body.cpf
    }
    if (req.body.nome == '' || req.body.endereco == '' || req.body.cidade == '' ||
        req.body.uf == '' || documento == '' ||
        req.body.celular == '' || req.body.email == '') {
        erros.push({ texto: 'Todos os campos de descrição são obrigatórios.' })
        res.render('cliente/cliente', { erros: erros })
    } else {
        var cnpj
        var cpf
        if (req.body.cnpj != '') {
            cnpj = req.body.cnpj
        }
        if (req.body.cpf != '') {
            cpf = req.body.cpf
        }

        var sissolar
        var posvenda
        if (req.body.checkSolar != null) {
            sissolar = 'checked'
        } else {
            sissolar = 'unchecked'
        }
        if (req.body.checkPos != null) {
            posvenda = 'checked'
        } else {
            posvenda = 'unchecked'
        }

        const cliente = {
            user: _id,
            nome: req.body.nome,
            endereco: req.body.endereco,
            cidade: req.body.cidade,
            uf: req.body.uf,
            cnpj: cnpj,
            cpf: cpf,
            celular: req.body.celular,
            email: req.body.email,
            sissolar: sissolar,
            posvenda: posvenda
        }

        new Cliente(cliente).save().then(() => {
            var sucesso = []
            sucesso.push({ texto: 'Cliente adicionado com sucesso' })
            Cliente.findOne({ user: _id }).sort({ field: 'asc', _id: -1 }).lean().then((cliente) => {
                res.render('cliente/cliente', { sucesso, cliente })
            }).catch((err) => {
                req.flash('error_msg', 'Não foi possível encontrar o cliente.')
                res.redirect('/cliente/novo')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível cadastrar o cliente.')
            res.redirect('/cliente/novo')
        })
    }
})

router.get('/edicao/:id', ehAdmin, (req, res) => {
    const { _id } = req.user
    Cliente.findOne({ user: _id, _id: req.params.id }).lean().then((cliente) => {
        res.render('cliente/cliente', { cliente })
    })
})

router.post('/edicao/', ehAdmin, (req, res) => {
    const { _id } = req.user
    var erros = []
    var documento

    if (req.body.cnpj != '') {
        documento = req.body.cnpj
    } else {
        documento = req.body.cpf
    }

    if (req.body.nome == '' || req.body.endereco == '' || documento == '' ||
        req.body.celular == '' || req.body.email == '') {
        erros.push({ texto: 'Todos os campos de descrição são obrigatórios.' })
        Cliente.findOne({ user: _id, _id: req.body.id }).lean().then((cliente) => {
            res.render('cliente/editcliente', { cliente: cliente, erros: erros })
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível encontrar o cliente.')
            res.redirect('/Cliente/novo')
        })

    } else {

        var sissolar
        var posvenda
        if (req.body.checkSolar != null) {
            sissolar = 'checked'
        } else {
            sissolar = 'unchecked'
        }
        if (req.body.checkPos != null) {
            posvenda = 'checked'
        } else {
            posvenda = 'unchecked'
        }

        Cliente.findOne({ user: _id, _id: req.body.id }).then((cliente) => {

            if (req.body.uf != '' && req.body.uf != cliente.uf) {
                cliente.uf = req.body.uf
            }
            if (req.body.cidade != '' && req.body.uf != cliente.cidade) {
                cliente.cidade = req.body.cidade
            }

            cliente.nome = req.body.nome
            cliente.endereco = req.body.endereco
            cliente.celular = req.body.celular
            cliente.email = req.body.email
            cliente.sissolar = sissolar
            cliente.posvenda = posvenda
            if (cliente.cnpj != '') {
                cliente.cnpj = req.body.cnpj
            } else {
                cliente.cpf = req.body.cpf
            }

            cliente.save().then(() => {
                var sucesso = []
                sucesso.push({ texto: 'Modificações salvas com sucesso.' })

                Cliente.findOne({ user: _id, _id: req.body.id }).lean().then((cliente) => {
                    res.render('cliente/editcliente', { cliente, sucesso })
                }).catch((err) => {
                    req.flash('error_msg', 'Não foi possível encontrar o cliente.')
                    res.redirect('/Cliente/novo')
                })

            }).catch((err) => {
                req.flash('error_msg', 'Não foi possível salvar as modificações.')
                res.redirect('/Cliente/novo')
            })

        })
    }
})

router.get('/usinas/:id', ehAdmin, (req, res) => {
    const { _id } = req.user
    var lista_usina = []
    var qu = 0
    Cliente.findOne({ _id: req.params.id }).lean().then((cliente) => {
        Usina.find({ cliente: req.params.id }).lean().then((usina) => {
            Plano.find({ user: _id }).lean().then((lista_plano) => {
                if (typeof usina != 'unedined' && usina != '') {
                    usina.forEach((element) => {
                        Plano.findOne({ _id: element.plano }).then((plano) => {
                            lista_usina.push({ _id: element._id, cliente: element.cliente, datalimp: element.datalimp, datarevi: element.datarevi, cadastro: element.cadastro, classificacao: element.classificacao, tipo: element.tipo, nome_plano: plano.nome, mensalidade: plano.mensalidade, nome: element.nome, endereco: element.endereco, area: element.area, qtdmod: element.qtdmod })
                            qu++
                            if (usina.length = qu) {
                                res.render('cliente/usina', { cliente, lista_usina, lista_plano })
                            }
                        }).catch((err) => {
                            req.flash('error_msg', 'Houve uma falha ao encontrar o plano.')
                            res.redirect('/cliente/usina/' + req.params.id)
                        })
                    })
                } else {
                    res.render('cliente/usina', { cliente, lista_plano })
                }
            }).catch((err) => {
                req.flash('error_msg', 'Houve uma falha ao encontrar o cliente.')
                res.redirect('/cliente/usina/' + req.params.id)
            })
        }).catch((err) => {
            req.flash('error_msg', 'Houve uma falha ao encontrar a usina.')
            res.redirect('/cliente/usina/' + req.params.id)
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve uma falha ao encontrar o plano.')
        res.redirect('/cliente/usina/' + req.params.id)
    })
})

router.get('/excluirusina/:id', (req, res) => {
    console.log('entrou')
    Usina.findOne({ _id: req.params.id }).then((usina_cliente) => {
        Usina.findOneAndDelete({ _id: req.params.id }).then(() => {
            console.log('id cliente=>' + usina_cliente.cliente)
            req.flash('success_msg', 'Usina removida com sucesso!')
            res.redirect('/cliente/usinas/' + usina_cliente.cliente)
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível excluir a usina.')
            res.redirect('/cliente/usinas/' + usina_cliente.cliente)
        })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar a usina.')
        res.redirect('/cliente/usinas/' + usina_cliente.cliente)
    })

})

router.post('/addusina/', ehAdmin, (req, res) => {
    const { _id } = req.user
    var cadastro = dataHoje()
    var datalimp = dataMensagem(setData(dataHoje(), 182))
    var buscalimp = dataBusca(setData(dataHoje(), 182))
    var datarevi = dataMensagem(setData(dataHoje(), 30))
    var buscarevi = dataBusca(setData(dataHoje(), 30))
    new Usina({
        user: _id,
        nome: req.body.nome,
        endereco: req.body.endereco,
        cliente: req.body.id,
        classificacao: req.body.classUsina,
        tipo: req.body.tipoUsina,
        area: req.body.area,
        qtdmod: req.body.qtdmod,
        cadastro: cadastro,
        datalimp: datalimp,
        buscalimp: buscalimp,
        datarevi: datarevi,
        buscarevi: buscarevi,
        plano: req.body.plano
    }).save().then(() => {
        req.flash('success_msg', 'Usina adcionada com sucesso.')
        res.redirect('/cliente/usinas/' + req.body.id)
    })
})

router.post('/editusina', (req, res) => {
    console.log('idusina=>' + req.body.idusina)
    console.log('req.body.plano=>' + req.body.plano)
    Usina.findOne({ _id: req.body.idusina }).then((usina) => {
        usina.nome = req.body.nome
        usina.endereco = req.body.endereco
        usina.cadastro = req.body.cadastro
        usina.area = req.body.area
        usina.qtdmod = req.body.qtdmod
        usina.classificacao = req.body.classUsina
        usina.tipo = req.body.tipoUsina
        usina.plano = req.body.plano
        usina.save().then(() => {
            req.flash('succes_msg', 'Usina salva com sucesso.')
            res.redirect('/cliente/usinas/' + req.body.idcliente)
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao salvar a usina.')
            res.redirect('/cliente/usinas/' + req.body.idcliente)
        })
    })
})

router.get('/historico/:id', (req, res) => {
    qu = 0
    emaberto = []
    concluido = []
    Cliente.findOne({ _id: req.params.id }).lean().then((cliente) => {
        Usina.find({ cliente: req.params.id }).then((usina) => {
            if (typeof usina != 'unedined' && usina != '') {
                usina.forEach((ele_usina) => {
                    qu++
                    Tarefa.find({ usina: ele_usina._id }).then((tarefas) => {
                        if (typeof tarefas != 'unedined' && tarefas != '') {
                            tarefas.forEach((ele_tarefa) => {
                                console.log('ele_tarefa.concluido=>' + ele_tarefa.concluido)
                                console.log('ele_usina.nome=>' + ele_usina.nome)
                                console.log('ele_tarefa.servico=>' + ele_tarefa.servico)
                                if (ele_tarefa.concluido == false) {
                                    emaberto.push({ _id: ele_tarefa._id, usina: ele_usina.nome, servico: ele_tarefa.servico, dataini: dataMensagem(ele_tarefa.dataini), datafim: dataMensagem(ele_tarefa.datafim), situacao: "Em aberto" })
                                } else {
                                    concluido.push({ _id: ele_tarefa._id, usina: ele_usina.nome, servico: ele_tarefa.servico, dataini: dataMensagem(ele_tarefa.dataini), datafim: dataMensagem(ele_tarefa.datafim), situacao: "Realizado" })
                                }
                                if (usina.length == qu) {
                                    res.render('cliente/historico', { emaberto, cliente })
                                }
                            })
                        } else {
                            res.render('cliente/historico', { cliente })
                        }
                    }).catch((err) => {
                        req.flash('error_msg', 'Não foi possível encontrar a tarefa.')
                        res.redirect('/cliente/edicao/' + req.params.id)
                    })
                })
            } else {
                res.render('cliente/historico', { cliente })
            }
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível encontrar a usina.')
            res.redirect('/cliente/edicao/' + req.params.id)
        })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar o cliente.')
        res.redirect('/cliente/edicao/' + req.params.id)
    })

})

router.get('/confirmaexclusao/:id', ehAdmin, (req, res) => {
    const { _id } = req.user
    Cliente.findOne({ user: _id, _id: req.params.id }).lean().then((cliente) => {
        res.render('cliente/confirmaexclusao', { cliente: cliente })
    })
})

router.get('/remover/:id', ehAdmin, (req, res) => {
    Cliente.findOneAndDelete({ _id: req.params.id }).then(() => {
        req.flash('success_msg', 'Cliente excluido com sucesso')
        res.redirect('/cliente/consulta')
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao excluir a Cliente.')
        res.redirect('/consulta')
    })
})

router.post('/filtrar', ehAdmin, (req, res) => {
    const { _id } = req.user
    var cidade = req.body.cidade
    var uf = req.body.uf
    var nome = req.body.nome

    if (nome != '' && uf != '' && cidade != '') {
        Cliente.find({ nome: new RegExp(nome), uf: new RegExp(uf), cidade: new RegExp(cidade), user: _id }).lean().then((clientes) => {
            res.render('cliente/findclientes', { clientes: clientes, cidade: cidade, uf: uf, nome: nome })
        })
    } else {
        if (nome == '' && cidade == '' && uf == '') {
            Cliente.find({ user: _id }).lean().then((clientes) => {
                res.render('cliente/findclientes', { clientes: clientes, cidade: cidade, uf: uf, nome: nome })
            })
        } else {
            if (nome == '' && cidade == '') {
                Cliente.find({ uf: new RegExp(uf), user: _id }).lean().then((clientes) => {
                    res.render('cliente/findclientes', { clientes: clientes, cidade: cidade, uf: uf, nome: nome })
                })
            } else {
                if (nome == '' && uf == '') {
                    Cliente.find({ cidade: new RegExp(cidade), user: _id }).lean().then((clientes) => {
                        res.render('cliente/findclientes', { clientes: clientes, cidade: cidade, uf: uf, nome: nome })
                    })
                } else {
                    if (cidade == '' && uf == '') {
                        Cliente.find({ nome: new RegExp(nome), user: _id }).lean().then((clientes) => {
                            res.render('cliente/findclientes', { clientes: clientes, cidade: cidade, uf: uf, nome: nome })
                        })
                    } else {
                        if (cidade == '') {
                            Cliente.find({ nome: new RegExp(nome), uf: new RegExp(uf), user: _id }).lean().then((clientes) => {
                                res.render('cliente/findclientes', { clientes: clientes, cidade: cidade, uf: uf, nome: nome })
                            })
                        } else {
                            if (uf == '') {
                                Cliente.find({ nome: new RegExp(nome), cidade: new RegExp(cidade), user: _id }).lean().then((Clientes) => {
                                    res.render('cliente/findclientes', { clientes: clientes, cidade: cidade, uf: uf, nome: nome })
                                })
                            } else {
                                Cliente.find({ cidade: new RegExp(cidade), uf: new RegExp(uf), user: _id }).lean().then((clientes) => {
                                    res.render('cliente/findClientes', { clientes: clientes, cidade: cidade, uf: uf, nome: nome })
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