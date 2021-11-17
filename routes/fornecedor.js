const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

require('../model/Fornecedor')
const Fornecedor = mongoose.model('fornecedor')

const validaCampos = require('../resources/validaCampos')
const dataBusca = require('../resources/dataBusca')
const comparaDatas = require('../resources/comparaDatas')
const validaCronograma = require('../resources/validaCronograma')
const liberaRecursos = require('../resources/liberaRecursos')
const setData = require('../resources/setData')
const dataMensagem = require('../resources/dataMensagem')
const dataHoje = require('../resources/dataHoje')
const { ehAdmin } = require('../helpers/ehAdmin')

router.get('/novo', ehAdmin, (req, res) => {
    res.render('fornecedor/cadastro')
})

router.get('/novo/:id', ehAdmin, (req, res) => {
    Fornecedor.findOne({ _id: req.params.id }).lean().then((fornecedor) => {
        res.render('fornecedor/cadastro', { fornecedor })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar o fornecedor.')
        res.redirect('/fornecedor/novo')
    })
})

router.get('/consulta/', ehAdmin, (req, res) => {
    Fornecedor.find().lean().then((fornecedor) => {
        res.render('fornecedor/consulta', { fornecedor })
    }).catch((err) => {
        req.flash('error_msg', 'Não foi possível encontrar o fornecedor.')
        res.redirect('/fornecedor/novo')
    })
})

router.post('/salvar', ehAdmin, (req, res) => {
    var erro = ''

    const {_id} = req.user
    const {user} = req.user
    var id
    if (typeof user =='undefined'){
        id = _id
    }else{
        id = user
    }

    if (req.body.nome == '') {
        erro = erro + 'É necessário incluir o nome do fornecedor. '
    }
    if (req.body.cnpj == '') {
        erro = erro + 'É necessário incluir o CNPJ do fornecedor. '
    }
    if (req.body.contato == '') {
        erro = erro + 'É necessário incluir o contato do fornecedor. '
    }
    if (req.body.telefone == '') {
        erro = erro + 'É necessário incluir o telefone do fornecedor. '
    }
    if (erro != '') {
        req.flash('error_msg', erro)
        res.redirect('/fornecedor/novo')
    } else {
        // console.log('req.body.id=>'+req.body.id)
        if (req.body.id != '') {
            console.log('entrou')
            Fornecedor.findOne({ _id: req.body.id }).then((fornecedor) => {
                fornecedor.nome = req.body.nome
                fornecedor.razao = req.body.razao
                fornecedor.cnpj = req.body.cnpj
                fornecedor.endereco = req.body.endereco
                fornecedor.cidade = req.body.cidade
                fornecedor.uf = req.body.uf
                fornecedor.cep = req.body.cep
                fornecedor.contato = req.body.contato
                fornecedor.telefone = req.body.telefone
                fornecedor.observacao = req.body.observacao
                fornecedor.save().then(() => {
                    res.redirect('/fornecedor/novo/' + req.body.id )
                }).catch((err) => {
                    req.flash('error_msg', 'Não foi possível salvar o fornecedor.')
                    res.redirect('/fornecedor/novo')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Não foi possível encontrar o fornecedor.')
                res.redirect('/fornecedor/novo')
            })
        } else {
            const comp = {
                user: id,
                nome: req.body.nome,
                razao: req.body.razao,
                cnpj: req.body.cnpj,
                endereco: req.body.endereco,
                cidade: req.body.cidade,
                uf: req.body.uf,
                cep: req.body.cep,
                contato: req.body.contato,
                telefone: req.body.telefone,
                observacao: req.body.observacao,
                data: dataHoje()
            }
            new Fornecedor(comp).save().then(() => {
                Fornecedor.findOne().sort({ field: 'asc', _id: -1 }).then((fornecedor) => {
                    req.flash('succes_msg', 'Fornecedor salvo com sucesso.')
                    res.redirect('/fornecedor/novo/' + fornecedor._id)
                }).catch((err) => {
                    req.flash('error_msg', 'Não foi possível encontrar o fornecedor.')
                    res.redirect('/fornecedor/novo')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Não foi possível salvar o fornecedor.')
                res.redirect('/fornecedor/novo')
            })
        }
    }
})

module.exports = router