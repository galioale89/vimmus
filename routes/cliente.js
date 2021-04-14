const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

require('../model/Cliente')
const Cliente = mongoose.model('cliente')

const {ehAdmin} = require('../helpers/ehAdmin')

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
    res.render('cliente/addcliente')
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
        res.render('cliente/addcliente', { erros: erros })
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
        if (req.body.checkSolar != null){
            sissolar = 'checked'
        }else{
            sissolar = 'unchecked'
        }
        if (req.body.checkPos != null){
            posvenda = 'checked'
        }else{
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
                res.render('cliente/editcliente', { sucesso: sucesso, cliente: cliente })
            }).catch((err) => {
                req.flash('error_msg', 'Não foi possível encontrar o cliente.')
                res.redirect('/cliente/novo')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Não foi possível cadastrar o cliente.')
            res.redirect('/Cliente/novo')
        })
    }
})

router.get('/edicao/:id', ehAdmin, (req, res) => {
    const { _id } = req.user
    Cliente.findOne({ user: _id, _id: req.params.id }).lean().then((cliente) => {
        res.render('cliente/editcliente', { cliente: cliente })
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
        if (req.body.checkSolar != null){
            sissolar = 'checked'
        }else{
            sissolar = 'unchecked'
        }
        if (req.body.checkPos != null){
            posvenda = 'checked'
        }else{
            posvenda = 'unchecked'
        }   
                
        Cliente.findOne({ user: _id, _id: req.body.id }).then((cliente) => {
            
            if (req.body.uf != '' && req.body.uf != cliente.uf){
                cliente.uf = req.body.uf
            }
            if (req.body.cidade != '' && req.body.uf != cliente.cidade){
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
                    res.render('cliente/editcliente', { cliente: cliente, sucesso: sucesso })
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

router.get('/confirmaexclusao/:id', ehAdmin, (req, res) => {
    const {_id} = req.user
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
            res.render('cliente/findclientes', { clientes: clientes, cidade: cidade, uf: uf, nome: nome})
        })
    } else {
        if (nome == '' && cidade == '' && uf == '') {
            Cliente.find({ user: _id }).lean().then((clientes) => {
                res.render('cliente/findclientes', { clientes: clientes, cidade: cidade, uf: uf, nome: nome})
            })
        } else {
            if (nome == '' && cidade == '') {
                Cliente.find({ uf: new RegExp(uf), user: _id }).lean().then((clientes) => {
                    res.render('cliente/findclientes', { clientes: clientes, cidade: cidade, uf: uf, nome: nome})
                })
            } else {
                if (nome == '' && uf == '') {
                    Cliente.find({ cidade: new RegExp(cidade), user: _id }).lean().then((clientes) => {
                        res.render('cliente/findclientes', { clientes: clientes, cidade: cidade, uf: uf, nome: nome})
                    })
                } else {
                    if (cidade == '' && uf == '') {
                        Cliente.find({ nome: new RegExp(nome), user: _id }).lean().then((clientes) => {
                            res.render('cliente/findclientes', { clientes: clientes, cidade: cidade, uf: uf, nome: nome})
                        })
                    } else {
                        if (cidade == '') {
                            Cliente.find({ nome: new RegExp(nome), uf: new RegExp(uf), user: _id }).lean().then((clientes) => {
                                res.render('cliente/findclientes', { clientes: clientes, cidade: cidade, uf: uf, nome: nome})
                            })
                        } else {
                            if (uf == '') {
                                Cliente.find({ nome: new RegExp(nome), cidade: new RegExp(cidade), user: _id }).lean().then((Clientes) => {
                                    res.render('cliente/findclientes', { clientes: clientes, cidade: cidade, uf: uf, nome: nome})
                                })
                            } else {
                                Cliente.find({ cidade: new RegExp(cidade), uf: new RegExp(uf), user: _id }).lean().then((clientes) => {
                                    res.render('cliente/findClientes', { clientes: clientes, cidade: cidade, uf: uf, nome: nome})
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