const express = require('express')
const router = express.Router()
var multer = require('multer')
// const fs = require('fs')
// var json = require('../plano_direto.json')

require('../model/Empresa')
require('../model/Pessoa')
require('../model/Realizado')
require('../model/CustoDetalhado')
require('../model/Cliente')
require('../model/Equipe')
require('../model/Cronograma')
require('../model/Dimensionamento')
require('../model/Usina')
require('../model/Vistoria')
require('../model/Tarefas')
require('../model/Investimento')
require('../model/Proposta')
require('../model/Compra')
require('../model/Documento')
require('../model/Posvenda')

const storage = multer.diskStorage({
     destination: function (req, file, cb) {
          cb(null, 'public/arquivos/')
     },
     filename: (req, file, cb) => {
          cb(null, file.originalname)
     }
})

const mongoose = require('mongoose')
const Projeto = mongoose.model('projeto')
const Configuracao = mongoose.model('configuracao')
const Empresa = mongoose.model('empresa')
const Pessoa = mongoose.model('pessoa')
const Realizado = mongoose.model('realizado')
const Detalhado = mongoose.model('custoDetalhado')
const Cliente = mongoose.model('cliente')
const Equipe = mongoose.model('equipe')
const Cronograma = mongoose.model('cronograma')
const Dimensionamento = mongoose.model('dimensionamento')
const Usina = mongoose.model('usina')
const Vistoria = mongoose.model('vistoria')
const Tarefa = mongoose.model('tarefas')
const Investimento = mongoose.model('investimento')
const Proposta = mongoose.model('proposta')
const Compra = mongoose.model('compra')
const Documento = mongoose.model('documento')
const Posvenda = mongoose.model('posvenda')

// const validaCampos = require('../resources/validaCampos')
const dataBusca = require('../resources/dataBusca')
const comparaDatas = require('../resources/comparaDatas')
const validaCronograma = require('../resources/validaCronograma')
const liberaRecursos = require('../resources/liberaRecursos')
const setData = require('../resources/setData')
const dataMensagem = require('../resources/dataMensagem')
const dataHoje = require('../resources/dataHoje')
const { ehAdmin } = require('../helpers/ehAdmin')

var tipoEntrada = false
var ehVinculo = false
//global.projeto_id


//Configurando envio de SMS
/*
const Nexmo = require('nexmo')

const nexmo = new Nexmo({
     apiKey: "db9a4e8d",
     apiSecret: "JAONfDZDLw5t3Uqh"
})
*/
//const TextMessageService = require('comtele-sdk').TextMessageService
//const apiKey = "8dbd4fb5-79af-45d6-a0b7-583a3c2c7d30"


router.use(express.static('/public'))

router.get('/selectprojeto', ehAdmin, (req, res) => {
     res.render('projeto/selectprojeto')
})

router.get("/consulta", ehAdmin, (req, res) => {
     const { _id } = req.user
     const { user } = req.user
     var id

     if (typeof user == 'undefined') {
          id = _id
     } else {
          id = user
     }
     Projeto.find({ user: id }).sort({ dataord: 'asc' }).lean().then((projetos) => {
          Pessoa.find({ funges: 'checked', user: id }).lean().then((responsavel) => {
               res.render('projeto/findprojetos', { projetos: projetos, responsavel: responsavel, filDireto: 'Todos', filReal: 'Todos' })
          }).catch((err) => {
               req.flash('error_msg', 'Nenhum responsável encontrado')
               res.redirect('/projeto/consulta')
          })

     }).catch((err) => {
          req.flash('error_msg', 'Nenhum projeto encontrado')
          res.redirect('/projeto/consulta')
     })
})

router.get('/dimensiona/:id', ehAdmin, (req, res) => {
     var td2 = 'none'
     var td3 = 'none'
     var select1 = 'selected'
     var select2 = ''
     var select3 = ''
     //console.log('req.body.id_dime=>' + req.params.id)
     Dimensionamento.findOne({ _id: req.params.id }).lean().then((dimensionamento) => {
          Projeto.findOne({ dimensionamento: req.params.id }).lean().then((projeto) => {
               if (dimensionamento.qtduce == 2) {
                    td2 = ''
                    select2 = 'selected'
               }
               if (dimensionamento.qtduce == 3) {
                    td2 = ''
                    td3 = ''
                    select3 = 'selected'
               }
               var medkwhano = (parseFloat(dimensionamento.totfatura) / parseFloat(dimensionamento.totconsumo)).toFixed(2)
               res.render('projeto/dimensionamento', { dimensionamento, projeto, td2, td3, select1, select2, select3, medkwhano })
          }).catch((err) => {
               req.flash('error_msg', 'Huve um erro ao encontrar o dimensionamento.')
               res.redirect('/projeto/novo')
          })
     }).catch((err) => {
          req.flash('error_msg', 'Huve um erro ao encontrar o dimensionamento.')
          res.redirect('/projeto/novo')
     })
})

router.get('/dimensionamento/:tipo', ehAdmin, (req, res) => {
     var td2 = 'none'
     var td3 = 'none'
     res.render('projeto/dimensionamento', { td2, td3, tipo: req.params.tipo })
})

router.post('/dimensionar', ehAdmin, (req, res) => {
     const { _id } = req.user
     const { user } = req.user
     var id

     if (typeof user == 'undefined') {
          id = _id
     } else {
          id = user
     }
     const id_prj = req.body.id_prj
     var ehVinculo
     var dime1
     var dime2
     var consumo1
     var consumo2
     var consumo3
     var consumo4
     var consumo5
     var consumo6
     var consumo7
     var consumo8
     var consumo9
     var consumo10
     var consumo11
     var consumo12
     var totaluc1
     var totaluc2
     var totaluc3
     dime2 = {
          user: id,
          te: req.body.te,
          tusd: req.body.tusd,
          icms: req.body.icms,
          pis: req.body.pis,
          cofins: req.body.cofins,
          cosip: req.body.ilupub,
          inflacao: req.body.inflacao,
          tma: req.body.tma,
          ajuste: req.body.ajuste,
          qtduce: req.body.qtduce,
          uc11: req.body.uc11,
          uc12: req.body.uc12,
          uc13: req.body.uc13,
          uc14: req.body.uc14,
          uc15: req.body.uc15,
          uc16: req.body.uc16,
          uc17: req.body.uc17,
          uc18: req.body.uc18,
          uc19: req.body.uc19,
          uc110: req.body.uc110,
          uc111: req.body.uc111,
          uc112: req.body.uc112,
          uc21: req.body.uc21,
          uc22: req.body.uc22,
          uc23: req.body.uc23,
          uc24: req.body.uc24,
          uc25: req.body.uc25,
          uc26: req.body.uc26,
          uc27: req.body.uc27,
          uc28: req.body.uc28,
          uc29: req.body.uc29,
          uc210: req.body.uc210,
          uc211: req.body.uc211,
          uc212: req.body.uc212,
          uc31: req.body.uc31,
          uc32: req.body.uc32,
          uc33: req.body.uc33,
          uc34: req.body.uc34,
          uc35: req.body.uc35,
          uc36: req.body.uc36,
          uc37: req.body.uc37,
          uc38: req.body.uc38,
          uc39: req.body.uc39,
          uc310: req.body.uc310,
          uc311: req.body.uc311,
          uc312: req.body.uc312,
          add1: req.body.add1,
          add2: req.body.add2,
          add3: req.body.add3,
          add4: req.body.add4,
          add5: req.body.add5,
          add6: req.body.add6,
          add7: req.body.add7,
          add8: req.body.add8,
          add9: req.body.add9,
          add10: req.body.add10,
          add11: req.body.add11,
          add12: req.body.add12,
     }
     if (req.body.qtduce == 1) {

          consumo1 = parseFloat(req.body.uc11) + parseFloat(req.body.add1)
          consumo2 = parseFloat(req.body.uc12) + parseFloat(req.body.add2)
          consumo3 = parseFloat(req.body.uc13) + parseFloat(req.body.add3)
          consumo4 = parseFloat(req.body.uc14) + parseFloat(req.body.add4)
          consumo5 = parseFloat(req.body.uc15) + parseFloat(req.body.add5)
          consumo6 = parseFloat(req.body.uc16) + parseFloat(req.body.add6)
          consumo7 = parseFloat(req.body.uc17) + parseFloat(req.body.add7)
          consumo8 = parseFloat(req.body.uc18) + parseFloat(req.body.add8)
          consumo9 = parseFloat(req.body.uc19) + parseFloat(req.body.add9)
          consumo10 = parseFloat(req.body.uc110) + parseFloat(req.body.add10)
          consumo11 = parseFloat(req.body.uc111) + parseFloat(req.body.add11)
          consumo12 = parseFloat(req.body.uc112) + parseFloat(req.body.add12)
          totaluc1 = parseFloat(req.body.uc11) + parseFloat(req.body.uc12) + parseFloat(req.body.uc13) + parseFloat(req.body.uc14) + parseFloat(req.body.uc15) + parseFloat(req.body.uc16) + parseFloat(req.body.uc17) + parseFloat(req.body.uc18) + parseFloat(req.body.uc19) + parseFloat(req.body.uc110) + parseFloat(req.body.uc111) + parseFloat(req.body.uc112)
     } else {
          if (req.body.qtduce == 2) {
               consumo1 = parseFloat(req.body.uc11) + parseFloat(req.body.uc21) + parseFloat(req.body.add1)
               consumo2 = parseFloat(req.body.uc12) + parseFloat(req.body.uc22) + parseFloat(req.body.add2)
               consumo3 = parseFloat(req.body.uc13) + parseFloat(req.body.uc23) + parseFloat(req.body.add3)
               consumo4 = parseFloat(req.body.uc14) + parseFloat(req.body.uc24) + parseFloat(req.body.add4)
               consumo5 = parseFloat(req.body.uc15) + parseFloat(req.body.uc25) + parseFloat(req.body.add5)
               consumo6 = parseFloat(req.body.uc16) + parseFloat(req.body.uc26) + parseFloat(req.body.add6)
               consumo7 = parseFloat(req.body.uc17) + parseFloat(req.body.uc27) + parseFloat(req.body.add7)
               consumo8 = parseFloat(req.body.uc18) + parseFloat(req.body.uc28) + parseFloat(req.body.add8)
               consumo9 = parseFloat(req.body.uc19) + parseFloat(req.body.uc29) + parseFloat(req.body.add9)
               consumo10 = parseFloat(req.body.uc110) + parseFloat(req.body.uc210) + parseFloat(req.body.add10)
               consumo11 = parseFloat(req.body.uc111) + parseFloat(req.body.uc211) + parseFloat(req.body.add11)
               consumo12 = parseFloat(req.body.uc112) + parseFloat(req.body.uc212) + parseFloat(req.body.add12)
               totaluc1 = parseFloat(req.body.uc11) + parseFloat(req.body.uc12) + parseFloat(req.body.uc13) + parseFloat(req.body.uc14) + parseFloat(req.body.uc15) + parseFloat(req.body.uc16) + parseFloat(req.body.uc17) + parseFloat(req.body.uc18) + parseFloat(req.body.uc19) + parseFloat(req.body.uc110) + parseFloat(req.body.uc111) + parseFloat(req.body.uc112)
               totaluc2 = parseFloat(req.body.uc21) + parseFloat(req.body.uc22) + parseFloat(req.body.uc23) + parseFloat(req.body.uc24) + parseFloat(req.body.uc25) + parseFloat(req.body.uc26) + parseFloat(req.body.uc27) + parseFloat(req.body.uc28) + parseFloat(req.body.uc29) + parseFloat(req.body.uc210) + parseFloat(req.body.uc211) + parseFloat(req.body.uc212)
          } else {
               consumo1 = parseFloat(req.body.uc11) + parseFloat(req.body.uc21) + parseFloat(req.body.uc31) + parseFloat(req.body.add1)
               consumo2 = parseFloat(req.body.uc12) + parseFloat(req.body.uc22) + parseFloat(req.body.uc32) + parseFloat(req.body.add2)
               consumo3 = parseFloat(req.body.uc13) + parseFloat(req.body.uc23) + parseFloat(req.body.uc33) + parseFloat(req.body.add3)
               consumo4 = parseFloat(req.body.uc14) + parseFloat(req.body.uc24) + parseFloat(req.body.uc34) + parseFloat(req.body.add4)
               consumo5 = parseFloat(req.body.uc15) + parseFloat(req.body.uc25) + parseFloat(req.body.uc35) + parseFloat(req.body.add5)
               consumo6 = parseFloat(req.body.uc16) + parseFloat(req.body.uc26) + parseFloat(req.body.uc36) + parseFloat(req.body.add6)
               consumo7 = parseFloat(req.body.uc17) + parseFloat(req.body.uc27) + parseFloat(req.body.uc37) + parseFloat(req.body.add7)
               consumo8 = parseFloat(req.body.uc18) + parseFloat(req.body.uc28) + parseFloat(req.body.uc38) + parseFloat(req.body.add8)
               consumo9 = parseFloat(req.body.uc19) + parseFloat(req.body.uc29) + parseFloat(req.body.uc39) + parseFloat(req.body.add9)
               consumo10 = parseFloat(req.body.uc110) + parseFloat(req.body.uc210) + parseFloat(req.body.uc310) + parseFloat(req.body.add10)
               consumo11 = parseFloat(req.body.uc111) + parseFloat(req.body.uc211) + parseFloat(req.body.uc311) + parseFloat(req.body.add11)
               consumo12 = parseFloat(req.body.uc112) + parseFloat(req.body.uc212) + parseFloat(req.body.uc312) + parseFloat(req.body.add12)
               totaluc1 = parseFloat(req.body.uc11) + parseFloat(req.body.uc12) + parseFloat(req.body.uc13) + parseFloat(req.body.uc14) + parseFloat(req.body.uc15) + parseFloat(req.body.uc16) + parseFloat(req.body.uc17) + parseFloat(req.body.uc18) + parseFloat(req.body.uc19) + parseFloat(req.body.uc110) + parseFloat(req.body.uc111) + parseFloat(req.body.uc112)
               totaluc2 = parseFloat(req.body.uc21) + parseFloat(req.body.uc22) + parseFloat(req.body.uc23) + parseFloat(req.body.uc24) + parseFloat(req.body.uc25) + parseFloat(req.body.uc26) + parseFloat(req.body.uc27) + parseFloat(req.body.uc28) + parseFloat(req.body.uc29) + parseFloat(req.body.uc210) + parseFloat(req.body.uc211) + parseFloat(req.body.uc212)
               totaluc3 = parseFloat(req.body.uc31) + parseFloat(req.body.uc32) + parseFloat(req.body.uc33) + parseFloat(req.body.uc34) + parseFloat(req.body.uc35) + parseFloat(req.body.uc36) + parseFloat(req.body.uc37) + parseFloat(req.body.uc38) + parseFloat(req.body.uc39) + parseFloat(req.body.uc310) + parseFloat(req.body.uc311) + parseFloat(req.body.uc312)
          }
     }

     var ajuste = 1
     var totaladd = parseFloat(req.body.add1) + parseFloat(req.body.add2) + parseFloat(req.body.add3) + parseFloat(req.body.add4) + parseFloat(req.body.add5) + parseFloat(req.body.add6) + parseFloat(req.body.add7) + parseFloat(req.body.add8) + parseFloat(req.body.add9) + parseFloat(req.body.add10) + parseFloat(req.body.add11) + parseFloat(req.body.add12)
     var totconsumo = consumo1 + consumo2 + consumo3 + consumo4 + consumo5 + consumo6 + consumo7 + consumo8 + consumo9 + consumo10 + consumo11 + consumo12
     if (req.body.ajuste != '') {
          ajuste = req.body.ajuste
     }
     var total1 = (((parseFloat(consumo1) * (parseFloat(req.body.te) / (1 - ((parseFloat(req.body.icms) + parseFloat(req.body.pis) + parseFloat(req.body.cofins)) / 100)))) + (parseFloat(consumo1) * (parseFloat(req.body.tusd / (1 - (parseFloat(req.body.icms) + parseFloat(req.body.pis) + parseFloat(req.body.cofins)) / 100)))) + parseFloat(req.body.ilupub)) * (1 + (parseFloat(ajuste) / 100))).toFixed(2)
     var total2 = (((parseFloat(consumo2) * (parseFloat(req.body.te) / (1 - ((parseFloat(req.body.icms) + parseFloat(req.body.pis) + parseFloat(req.body.cofins)) / 100)))) + (parseFloat(consumo2) * (parseFloat(req.body.tusd / (1 - (parseFloat(req.body.icms) + parseFloat(req.body.pis) + parseFloat(req.body.cofins)) / 100)))) + parseFloat(req.body.ilupub)) * (1 + (parseFloat(ajuste) / 100))).toFixed(2)
     var total3 = (((parseFloat(consumo3) * (parseFloat(req.body.te) / (1 - ((parseFloat(req.body.icms) + parseFloat(req.body.pis) + parseFloat(req.body.cofins)) / 100)))) + (parseFloat(consumo3) * (parseFloat(req.body.tusd / (1 - (parseFloat(req.body.icms) + parseFloat(req.body.pis) + parseFloat(req.body.cofins)) / 100)))) + parseFloat(req.body.ilupub)) * (1 + (parseFloat(ajuste) / 100))).toFixed(2)
     var total4 = (((parseFloat(consumo4) * (parseFloat(req.body.te) / (1 - ((parseFloat(req.body.icms) + parseFloat(req.body.pis) + parseFloat(req.body.cofins)) / 100)))) + (parseFloat(consumo4) * (parseFloat(req.body.tusd / (1 - (parseFloat(req.body.icms) + parseFloat(req.body.pis) + parseFloat(req.body.cofins)) / 100)))) + parseFloat(req.body.ilupub)) * (1 + (parseFloat(ajuste) / 100))).toFixed(2)
     var total5 = (((parseFloat(consumo5) * (parseFloat(req.body.te) / (1 - ((parseFloat(req.body.icms) + parseFloat(req.body.pis) + parseFloat(req.body.cofins)) / 100)))) + (parseFloat(consumo5) * (parseFloat(req.body.tusd / (1 - (parseFloat(req.body.icms) + parseFloat(req.body.pis) + parseFloat(req.body.cofins)) / 100)))) + parseFloat(req.body.ilupub)) * (1 + (parseFloat(ajuste) / 100))).toFixed(2)
     var total6 = (((parseFloat(consumo6) * (parseFloat(req.body.te) / (1 - ((parseFloat(req.body.icms) + parseFloat(req.body.pis) + parseFloat(req.body.cofins)) / 100)))) + (parseFloat(consumo6) * (parseFloat(req.body.tusd / (1 - (parseFloat(req.body.icms) + parseFloat(req.body.pis) + parseFloat(req.body.cofins)) / 100)))) + parseFloat(req.body.ilupub)) * (1 + (parseFloat(ajuste) / 100))).toFixed(2)
     var total7 = (((parseFloat(consumo7) * (parseFloat(req.body.te) / (1 - ((parseFloat(req.body.icms) + parseFloat(req.body.pis) + parseFloat(req.body.cofins)) / 100)))) + (parseFloat(consumo7) * (parseFloat(req.body.tusd / (1 - (parseFloat(req.body.icms) + parseFloat(req.body.pis) + parseFloat(req.body.cofins)) / 100)))) + parseFloat(req.body.ilupub)) * (1 + (parseFloat(ajuste) / 100))).toFixed(2)
     var total8 = (((parseFloat(consumo8) * (parseFloat(req.body.te) / (1 - ((parseFloat(req.body.icms) + parseFloat(req.body.pis) + parseFloat(req.body.cofins)) / 100)))) + (parseFloat(consumo8) * (parseFloat(req.body.tusd / (1 - (parseFloat(req.body.icms) + parseFloat(req.body.pis) + parseFloat(req.body.cofins)) / 100)))) + parseFloat(req.body.ilupub)) * (1 + (parseFloat(ajuste) / 100))).toFixed(2)
     var total9 = (((parseFloat(consumo9) * (parseFloat(req.body.te) / (1 - ((parseFloat(req.body.icms) + parseFloat(req.body.pis) + parseFloat(req.body.cofins)) / 100)))) + (parseFloat(consumo9) * (parseFloat(req.body.tusd / (1 - (parseFloat(req.body.icms) + parseFloat(req.body.pis) + parseFloat(req.body.cofins)) / 100)))) + parseFloat(req.body.ilupub)) * (1 + (parseFloat(ajuste) / 100))).toFixed(2)
     var total10 = (((parseFloat(consumo10) * (parseFloat(req.body.te) / (1 - ((parseFloat(req.body.icms) + parseFloat(req.body.pis) + parseFloat(req.body.cofins)) / 100)))) + (parseFloat(consumo10) * (parseFloat(req.body.tusd / (1 - (parseFloat(req.body.icms) + parseFloat(req.body.pis) + parseFloat(req.body.cofins)) / 100)))) + parseFloat(req.body.ilupub)) * (1 + (parseFloat(ajuste) / 100))).toFixed(2)
     var total11 = (((parseFloat(consumo11) * (parseFloat(req.body.te) / (1 - ((parseFloat(req.body.icms) + parseFloat(req.body.pis) + parseFloat(req.body.cofins)) / 100)))) + (parseFloat(consumo11) * (parseFloat(req.body.tusd / (1 - (parseFloat(req.body.icms) + parseFloat(req.body.pis) + parseFloat(req.body.cofins)) / 100)))) + parseFloat(req.body.ilupub)) * (1 + (parseFloat(ajuste) / 100))).toFixed(2)
     var total12 = (((parseFloat(consumo12) * (parseFloat(req.body.te) / (1 - ((parseFloat(req.body.icms) + parseFloat(req.body.pis) + parseFloat(req.body.cofins)) / 100)))) + (parseFloat(consumo12) * (parseFloat(req.body.tusd / (1 - (parseFloat(req.body.icms) + parseFloat(req.body.pis) + parseFloat(req.body.cofins)) / 100)))) + parseFloat(req.body.ilupub)) * (1 + (parseFloat(ajuste) / 100))).toFixed(2)
     var totfatura = (parseFloat(total1) + parseFloat(total2) + parseFloat(total3) + parseFloat(total4) + parseFloat(total5) + parseFloat(total6) + parseFloat(total7) + parseFloat(total8) + parseFloat(total9) + parseFloat(total10) + parseFloat(total11) + parseFloat(total12)).toFixed(2)
     if (typeof totaluc2 == 'undefined') {
          totaluc2 = 0
     }
     if (typeof totaluc3 == 'undefined') {
          totaluc3 = 0
     }
     //console.log('totaladd=>' + totaladd)
     //console.log('totaluc1=>' + totaluc1)
     //console.log('totaluc2=>' + totaluc2)
     //console.log('totaluc3=>' + totaluc3)
     //console.log('totconsumo=>' + totconsumo)
     //console.log('total1=>' + total1)
     //console.log('total2=>' + total2)
     //console.log('total3=>' + total3)
     //console.log('total4=>' + total4)
     //console.log('total5=>' + total5)
     //console.log('total6=>' + total6)
     //console.log('total7=>' + total7)
     //console.log('total8=>' + total8)
     //console.log('total9=>' + total9)
     //console.log('total10=>' + total10)
     //console.log('total11=>' + total11)
     //console.log('total12=>' + total12)

     var kwhdiajan = 0
     var kwhdiafev = 0
     var kwhdiamar = 0
     var kwhdiaabr = 0
     var kwhdiamai = 0
     var kwhdiajun = 0
     var kwhdiajul = 0
     var kwhdiaago = 0
     var kwhdiaset = 0
     var kwhdiaout = 0
     var kwhdianov = 0
     var kwhdiadez = 0
     var diasjan = 31
     var diasfev = 29
     var diasmar = 31
     var diasabr = 30
     var diasmai = 31
     var diasjun = 30
     var diasjul = 31
     var diasago = 31
     var diasset = 30
     var diasout = 31
     var diasnov = 30
     var diasdez = 31

     var kwhdiajan = (parseFloat(consumo1) / parseFloat(diasjan) / 5) / (parseFloat(req.body.irradiacao) / 5)
     var kwhdiafev = (parseFloat(consumo2) / parseFloat(diasfev) / 5) / (parseFloat(req.body.irradiacao) / 5)
     var kwhdiamar = (parseFloat(consumo3) / parseFloat(diasmar) / 5) / (parseFloat(req.body.irradiacao) / 5)
     var kwhdiaabr = (parseFloat(consumo4) / parseFloat(diasabr) / 5) / (parseFloat(req.body.irradiacao) / 5)
     var kwhdiamai = (parseFloat(consumo5) / parseFloat(diasmai) / 5) / (parseFloat(req.body.irradiacao) / 5)
     var kwhdiaabr = (parseFloat(consumo6) / parseFloat(diasjun) / 5) / (parseFloat(req.body.irradiacao) / 5)
     var kwhdiamai = (parseFloat(consumo7) / parseFloat(diasjul) / 5) / (parseFloat(req.body.irradiacao) / 5)
     var kwhdiajun = (parseFloat(consumo8) / parseFloat(diasago) / 5) / (parseFloat(req.body.irradiacao) / 5)
     var kwhdiajul = (parseFloat(consumo9) / parseFloat(diasset) / 5) / (parseFloat(req.body.irradiacao) / 5)
     var kwhdiaago = (parseFloat(consumo10) / parseFloat(diasout) / 5) / (parseFloat(req.body.irradiacao) / 5)
     var kwhdiaset = (parseFloat(consumo11) / parseFloat(diasnov) / 5) / (parseFloat(req.body.irradiacao) / 5)
     var kwhdiadez = (parseFloat(consumo11) / parseFloat(diasdez) / 5) / (parseFloat(req.body.irradiacao) / 5)
     var totconkw = kwhdiajan + kwhdiafev + kwhdiamar + kwhdiaabr + kwhdiamai + kwhdiaabr + kwhdiamai + kwhdiajun + kwhdiajul + kwhdiaago + kwhdiaset + kwhdiadez
     var pondjan = kwhdiajan / totconkw
     var pondfev = kwhdiafev / totconkw
     var pondmar = kwhdiamar / totconkw
     var pondabr = kwhdiaabr / totconkw
     var pondmai = kwhdiamai / totconkw
     var pondjun = kwhdiaabr / totconkw
     var pondjul = kwhdiamai / totconkw
     var pondago = kwhdiajun / totconkw
     var pondset = kwhdiajul / totconkw
     var pondout = kwhdiaago / totconkw
     var pondnov = kwhdiaset / totconkw
     var ponddez = kwhdiadez / totconkw
     var pijan = parseFloat(kwhdiajan) * parseFloat(pondjan)
     var pifev = parseFloat(kwhdiafev) * parseFloat(pondfev)
     var pimar = parseFloat(kwhdiamar) * parseFloat(pondmar)
     var piabr = parseFloat(kwhdiaabr) * parseFloat(pondabr)
     var pimai = parseFloat(kwhdiamai) * parseFloat(pondmai)
     var pijun = parseFloat(kwhdiajun) * parseFloat(pondjun)
     var pijul = parseFloat(kwhdiajul) * parseFloat(pondjul)
     var piago = parseFloat(kwhdiaago) * parseFloat(pondago)
     var piset = parseFloat(kwhdiaset) * parseFloat(pondset)
     var piout = parseFloat(kwhdiaout) * parseFloat(pondout)
     var pinov = parseFloat(kwhdianov) * parseFloat(pondnov)
     var pidez = parseFloat(kwhdiadez) * parseFloat(ponddez)
     var potencia = (pijan + pifev + pimar + piabr + pimai + pijun + pijul + piago + piset + piout + pinov + pidez).toFixed(2)
     if (req.body.ajupot != '' && typeof req.body.ajupot != 'undefined') {
          potencia = (potencia * (1 + (parseFloat(req.body.ajupot / 100)))).toFixed(2)
     }
     if (req.body.tammod != '' && typeof req.body.tammod != 'undefined') {
          var tamqua = (parseFloat(req.body.tammod) * parseFloat(req.body.qtdmod))
          var pikwhm = ((parseFloat(req.body.qtdmod) * parseFloat(req.body.watmod)) / 1000) / tamqua
          var temperatura = 20
          var coeficiente = 0.0036
          var perdas = 0.1
          var gergeral = (pikwhm * (req.body.irradiacao - ((req.body.irradiacao * temperatura * coeficiente) + (req.body.irradiacao * perdas))))
          gergeral = gergeral * tamqua
          var geranual = gergeral * 365
          geranual = (geranual - (geranual * (perdas))).toFixed(2)
     }
     dime1 = {
          consumo1: consumo1,
          consumo2: consumo2,
          consumo3: consumo3,
          consumo4: consumo4,
          consumo5: consumo5,
          consumo6: consumo6,
          consumo7: consumo7,
          consumo8: consumo8,
          consumo9: consumo9,
          consumo10: consumo10,
          consumo11: consumo11,
          consumo12: consumo12,
          totaluc1: totaluc1,
          totaluc2: totaluc2,
          totaluc3: totaluc3,
          totaladd: totaladd,
          totconsumo: totconsumo,
          total1: total1,
          total2: total2,
          total3: total3,
          total4: total4,
          total5: total5,
          total6: total6,
          total7: total7,
          total8: total8,
          total9: total9,
          total10: total10,
          total11: total11,
          total12: total12,
          totfatura: totfatura,
          potencia: potencia,
          irradiacao: req.body.irradiacao,
          ajupot: req.body.ajupot,
          tammod: req.body.tammod,
          qtdmod: req.body.qtdmod,
          watmod: req.body.watmod,
          geranual: geranual
     }
     var dime = Object.assign(dime2, dime1)

     if (id_prj == '') {
          if (req.body.tipo == 1) {
               ehVinculo = false
          } else {
               ehVinculo = true
          }
          new Dimensionamento(dime).save().then(() => {
               Dimensionamento.findOne().sort({ field: 'asc', _id: -1 }).then((dimensionamento) => {
                    //console.log('novo projeto')
                    const novo_projeto = {
                         dimensionamento: dimensionamento._id,
                         cidade: req.body.cidade,
                         uf: req.body.uf,
                         potencia: potencia,
                         ehVinculo: ehVinculo,
                         user: id
                    }
                    new Projeto(novo_projeto).save().then(() => {
                         res.redirect('/projeto/dimensiona/' + dimensionamento._id)
                    })
               })
          })
     } else {
          Dimensionamento.deleteOne({ _id: req.body.id_dime }).then(() => {
               new Dimensionamento(dime).save().then(() => {
                    //console.log('dime=>' + dime)
                    Dimensionamento.findOne().sort({ field: 'asc', _id: -1 }).then((dimensionamento) => {
                         Projeto.findOne({ _id: id_prj }).then((projeto) => {
                              //console.log('projeto existente')
                              //console.log('id_prj=>' + id_prj)
                              if (req.body.cidade != '' && req.body.cidade != projeto.cidade) {
                                   projeto.cidade = req.body.cidade
                              }
                              if (req.body.uf != '' && req.body.uf != projeto.uf) {
                                   projeto.uf = req.body.uf
                              }
                              projeto.dimensionamento = dimensionamento._id
                              projeto.potencia = dimensionamento.potencia
                              //console.log('dimensionamento._id=>' + dimensionamento._id)
                              projeto.save().then(() => {
                                   //console.log('projeto salvo')
                                   res.redirect('/projeto/dimensiona/' + dimensionamento._id)
                              }).catch((err) => {
                                   req.flash('error_msg', 'Houve um erro ao salvar o projeto.')
                                   res.redirect('/configuracao/consultaempresa')
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Houve uma falha ao encontrar o projeto.')
                              res.redirect('/menu')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao encontrar o dimensionamento.')
                         res.redirect('/menu')
                    })
               })
          })
     }
})

router.get('/vermais/:id', ehAdmin, (req, res) => {
     var equipepla = 'Nenhuma pessoa alocada.'
     var equipepro = 'Nenhuma pessoa alocada.'
     var equipeate = 'Nenhuma pessoa alocada.'
     var equipeinv = 'Nenhuma pessoa alocada.'
     var equipeeae = 'Nenhuma pessoa alocada.'
     var equipepnl = 'Nenhuma pessoa alocada.'
     var equipeins = 'Nenhuma pessoa alocada.'
     var equipevis = 'Nenhuma pessoa alocada.'
     Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
          //console.log('encontrou projeto')
          Realizado.findOne({ projeto: projeto._id }).lean().then((realizado) => {
               //console.log('encontrou realizado')
               Pessoa.findOne({ _id: projeto.funres }).lean().then((responsavel) => {
                    //console.log('encontrou pessoa')
                    Cliente.findOne({ _id: projeto.cliente }).lean().then((cliente) => {
                         //console.log('encontrou cliente')
                         Empresa.findOne({ _id: projeto.empresa }).lean().then((empresa) => {
                              //console.log('encontrou empresa')
                              Cronograma.findOne({ projeto: projeto._id }).lean().then((cronograma) => {
                                   //console.log('encontrou cronograma')
                                   Equipe.findOne({ projeto: projeto._id }).lean().then((equipe) => {
                                        //console.log('equipe.pla0=>' + equipe.pla0)
                                        if (typeof equipe.pla0 != 'undefined') {
                                             equipepla = equipe.pla0 + '|' + equipe.pla1 + '|' + equipe.pla2 + '|' + equipe.pla3 + '|' + equipe.pla4 + '|' + equipe.pla5
                                        }
                                        if (typeof equipe.pro0 != 'undefined') {
                                             equipepro = equipe.pro0 + '|' + equipe.pro1 + '|' + equipe.pro2 + '|' + equipe.pro3 + '|' + equipe.pro4 + '|' + equipe.pro5
                                        }
                                        if (typeof equipe.ate0 != 'undefined') {
                                             equipeate = equipe.ate0 + '|' + equipe.ate1 + '|' + equipe.ate2 + '|' + equipe.ate3 + '|' + equipe.ate4 + '|' + equipe.ate5
                                        }
                                        if (typeof equipe.inv0 != 'undefined') {
                                             equipeinv = equipe.inv0 + '|' + equipe.inv1 + '|' + equipe.inv2 + '|' + equipe.inv3 + '|' + equipe.inv4 + '|' + equipe.inv5
                                        }
                                        if (typeof equipe.pnl0 != 'undefined') {
                                             equipepnl = equipe.pnl0 + '|' + equipe.pnl1 + '|' + equipe.pnl2 + '|' + equipe.pnl3 + '|' + equipe.pnl4 + '|' + equipe.pnl5
                                        }
                                        if (typeof equipe.eae0 != 'undefined') {
                                             equipeeae = equipe.eae0 + '|' + equipe.eae1 + '|' + equipe.eae2 + '|' + equipe.eae3 + '|' + equipe.eae4 + '|' + equipe.eae5
                                        }
                                        if (typeof equipe.ins0 != 'undefined') {
                                             equipeins = equipe.ins0 + '|' + equipe.ins1 + '|' + equipe.ins2 + '|' + equipe.ins3 + '|' + equipe.ins4 + '|' + equipe.ins5
                                        }
                                        if (typeof equipe.vis0 != 'undefined') {
                                             equipevis = equipe.vis0 + '|' + equipe.vis1 + '|' + equipe.vis2 + '|' + equipe.vis3 + '|' + equipe.vis4 + '|' + equipe.vis5
                                        }

                                        var plaini = dataMensagem(cronograma.dateplaini)
                                        var plafim = dataMensagem(cronograma.dateplafim)
                                        var prjini = dataMensagem(cronograma.dateprjini)
                                        var prjfim = dataMensagem(cronograma.dateprjfim)
                                        var ateini = dataMensagem(cronograma.dateateini)
                                        var atefim = dataMensagem(cronograma.dateatefim)
                                        var invini = dataMensagem(cronograma.dateinvini)
                                        var invfim = dataMensagem(cronograma.dateinvfim)
                                        var stbini = dataMensagem(cronograma.datestbini)
                                        var stbfim = dataMensagem(cronograma.datestbfim)
                                        var eaeini = ''
                                        var eaefim = ''
                                        var pnlini = ''
                                        var pnlfim = ''
                                        //console.log('temEAE=>'+projeto.temArmazenamento)
                                        if (projeto.temArmazenamento) {
                                             eaeini = dataMensagem(cronograma.dateeaeini)
                                             eaefim = dataMensagem(cronograma.dateeaefim)
                                        }
                                        if (projeto.temPainel) {
                                             pnlini = dataMensagem(cronograma.datepnlini)
                                             pnlfim = dataMensagem(cronograma.datepnlfim)
                                        }
                                        var estini = dataMensagem(cronograma.dateestini)
                                        var estfim = dataMensagem(cronograma.dateestfim)
                                        var modini = dataMensagem(cronograma.datemodini)
                                        var modfim = dataMensagem(cronograma.datemodfim)
                                        var visini = dataMensagem(cronograma.datevisini)
                                        var visfim = dataMensagem(cronograma.datevisfim)

                                        //console.log('equipepla=>' + equipepla)
                                        res.render('projeto/vermais', {
                                             projeto, responsavel, empresa, realizado, cliente, plaini, plafim, prjini, prjfim, ateini, atefim, invini, invfim,
                                             stbini, stbfim, eaeini, eaefim, pnlini, pnlfim, estini, estfim, modini, modfim, visini, visfim,
                                             equipepla, equipepro, equipeate, equipeinv, equipepnl, equipeeae, equipeins, equipevis
                                        })
                                   }).catch((err) => {
                                        req.flash('error_msg', 'Nenhuma equipe encontrada.')
                                        res.redirect('/projeto/consulta')
                                   })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Nenhum cronograma encontrado.')
                                   res.redirect('/projeto/consulta')
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Nenhum empresa encontrado.')
                              res.redirect('/projeto/consulta')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Nenhum cliente encontrado.')
                         res.redirect('/projeto/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Nenhum responsável encontrado.')
                    res.redirect('/projeto/consulta')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Projeto não realizado.')
               res.redirect('/projeto/consulta')
          })
     }).catch((err) => {
          req.flash('error_msg', 'Nenhum projeto encontrado.')
          res.redirect('/projeto/consulta')
     })
})

router.get('/realizar/:id', ehAdmin, (req, res) => {
     Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
          Realizado.findOne({ projeto: projeto._id }).lean().then((realizado) => {
               Detalhado.findOne({ projeto: projeto._id }).lean().then((detalhe) => {
                    var temCercamento
                    var temPosteCond
                    var temCentral
                    if (projeto.temCercamento == 'checked') {
                         temCercamento = true
                    } else {
                         temCercamento = false
                    }
                    if (projeto.temPosteCond == 'checked') {
                         temPosteCond = true
                    } else {
                         temPosteCond = false
                    }
                    if (projeto.temCentral == 'checked') {
                         temCentral = true
                    } else {
                         temCentral = false
                    }

                    //console.log('temCercamento=>' + temCercamento)
                    //console.log('temPosteCond=>' + temPosteCond)

                    if (realizado) {
                         var varCP = false
                         var varTI = false
                         var varLAI = false
                         var varLL = false
                         var varCustoPlano = (realizado.custoPlano - projeto.custoPlano).toFixed(2)
                         if (varCustoPlano > 1) {
                              varCP = false
                         } else {
                              varCP = true
                         }
                         var varTotalImposto = (parseFloat(realizado.totalImposto) - parseFloat(projeto.totalImposto)).toFixed(2)
                         if (varTotalImposto > 1) {
                              varTI = true
                         } else {
                              varTI = false
                         }
                         var varlbaimp = (realizado.lbaimp - projeto.lbaimp).toFixed(2)
                         if (varlbaimp > 1) {
                              varLAI = true
                         } else {
                              varLAI = false
                         }
                         var varLucroLiquido = (realizado.lucroLiquido - projeto.lucroLiquido).toFixed(2)
                         if (varLucroLiquido > 1) {
                              varLL = true
                         } else {
                              varLL = false
                         }
                         res.render('projeto/realizado', { projeto, realizado, detalhe, varCustoPlano, varlbaimp, varLucroLiquido, varCustoPlano, varlbaimp, varLucroLiquido, varTotalImposto, varTI, varLL, varLAI, varCP, temCercamento, temPosteCond, temCentral })
                    } else {
                         res.render('projeto/realizado', { projeto, detalhe, temCercamento, temPosteCond, temCentral })
                    }
               }).catch((err) => {
                    req.flash('error_msg', 'Falha interna.')
                    res.redirect('/projeto/consulta')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Falha interna.')
               res.redirect('/projeto/consulta')
          })
     }).catch((err) => {
          req.flash('error_msg', 'Não foi possível encontrar o projeto.')
          res.redirect('/projeto/consulta')
     })
})

router.get('/novo', ehAdmin, (req, res) => {
     const { _id } = req.user
     const { user } = req.user
     var id

     if (typeof user == 'undefined') {
          id = _id
     } else {
          id = user
     }
     Empresa.find({ user: id }).lean().then((empresa) => {
          Configuracao.find({ user: id }).lean().then((configuracao) => {
               Pessoa.find({ ehVendedor: true, user: id }).lean().then((vendedor) => {
                    Pessoa.find({ user: id, funges: 'checked' }).lean().then((responsavel) => {
                         Cliente.find({ user: id, sissolar: 'checked' }).lean().then((clientes) => {
                              res.render("projeto/addprojeto", { empresa, configuracao, responsavel, vendedor, clientes, troca_dim: 'checked' })
                         }).catch((err) => {
                              req.flash('error_msg', 'Houve um erro ao encontrar um cliente.')
                              res.redirect('/projeto/novo')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve um erro ao encontrar um responsável.')
                         res.redirect('/projeto/novo')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro ao encontrar um vendedor.')
                    res.redirect('/projeto/novo')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Houve um erro ao encontrar a configuração.')
               res.redirect('/projeto/novo')
          })
     }).catch((err) => {
          req.flash('error_msg', 'houve um erro ao encontrar a empresa.')
          res.redirect('/projeto/novo')
     })
})

router.get('/projetotarefa', ehAdmin, (req, res) => {
     const { _id } = req.user
     const { user } = req.user
     var id

     if (typeof user == 'undefined') {
          id = _id
     } else {
          id = user
     }
     Empresa.find({ user: id }).lean().then((empresa) => {
          Configuracao.find({ user: id }).lean().then((configuracao) => {
               Pessoa.find({ ehVendedor: true, user: id }).lean().then((vendedor) => {
                    Pessoa.find({ funges: 'checked', user: id }).lean().then((responsavel) => {
                         Cliente.find({ user: id, sissolar: 'checked' }).lean().then((cliente) => {
                              res.render("projeto/projetodia", { empresa, configuracao, vendedor, responsavel, cliente, troca_dim: 'checked' })
                         }).catch((err) => {
                              req.flash('error_msg', 'Houve um erro ao encontrar um cliente.')
                              res.redirect('/projeto/novo')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve um erro ao encontrar o responsável.')
                         res.redirect('/projeto/novo')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro ao encontrar um vendedor.')
                    res.redirect('/projeto/novo')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Houve um erro ao encontrar a configuração.')
               res.redirect('/projeto/novo')
          })
     }).catch((err) => {
          req.flash('error_msg', 'houve um erro ao encontrar a empresa.')
          res.redirect('/projeto/novo')
     })
})

router.get('/projetotarefa/:id', ehAdmin, (req, res) => {
     const { _id } = req.user
     const { user } = req.user
     var id

     if (typeof user == 'undefined') {
          id = _id
     } else {
          id = user
     }
     Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
          Dimensionamento.findOne({ _id: projeto.dimensionamento }).lean().then((dimensionamento) => {
               Empresa.find({ user: id }).lean().then((empresa) => {
                    Configuracao.find({ user: id }).lean().then((configuracao) => {
                         Pessoa.find({ ehVendedor: true, user: id }).lean().then((vendedor) => {
                              Pessoa.find({ funges: 'checked', user: id }).lean().then((responsavel) => {
                                   Cliente.find({ user: id, sissolar: 'checked' }).lean().then((cliente) => {
                                        res.render("projeto/projetodia", { projeto, dimensionamento, empresa, configuracao, vendedor, responsavel, cliente, troca_dim: 'checked' })
                                   }).catch((err) => {
                                        req.flash('error_msg', 'Houve um erro ao encontrar um cliente.')
                                        res.redirect('/projeto/novo')
                                   })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Houve um erro ao encontrar o responsável.')
                                   res.redirect('/projeto/novo')
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Houve um erro ao encontrar um vendedor.')
                              res.redirect('/projeto/novo')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve um erro ao encontrar a configuração.')
                         res.redirect('/projeto/novo')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'houve um erro ao encontrar a empresa.')
                    res.redirect('/projeto/novo')
               })
          }).catch((err) => {
               req.flash('error_msg', 'houve um erro ao encontrar o dimensionamento.')
               res.redirect('/projeto/novo')
          })
     }).catch((err) => {
          req.flash('error_msg', 'houve um erro ao encontrar o projeto.')
          res.redirect('/projeto/novo')
     })
})

router.get('/novo/:id', ehAdmin, (req, res) => {
     const { _id } = req.user
     const { user } = req.user
     var id

     if (typeof user == 'undefined') {
          id = _id
     } else {
          id = user
     }
     Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
          Dimensionamento.findOne({ _id: projeto.dimensionamento }).lean().then((dimensionamento) => {
               Empresa.find({ user: id }).lean().then((empresa) => {
                    Configuracao.find({ user: id }).lean().then((configuracao) => {
                         Pessoa.find({ ehVendedor: true, user: id }).lean().then((vendedor) => {
                              Pessoa.find({ user: id, funges: 'checked' }).lean().then((responsavel) => {
                                   Cliente.find({ user: id, sissolar: 'checked' }).lean().then((clientes) => {
                                        res.render("projeto/addprojeto", { projeto, dimensionamento, empresa, configuracao, responsavel, vendedor, clientes, troca_dim: 'checked' })
                                   }).catch((err) => {
                                        req.flash('error_msg', 'Houve um erro ao encontrar um cliente.')
                                        res.redirect('/projeto/novo')
                                   })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Houve um erro ao encontrar um responsável.')
                                   res.redirect('/projeto/novo')
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Houve um erro ao encontrar um vendedor.')
                              res.redirect('/projeto/novo')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve um erro ao encontrar a configuração.')
                         res.redirect('/projeto/novo')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'houve um erro ao encontrar a empresa.')
                    res.redirect('/projeto/novo')
               })
          }).catch((err) => {
               req.flash('error_msg', 'houve um erro ao encontrar o dimensionamento.')
               res.redirect('/projeto/novo')
          })
     }).catch((err) => {
          req.flash('error_msg', 'houve um erro ao encontrar o projeto.')
          res.redirect('/projeto/novo')
     })
})

router.get('/direto/:id', ehAdmin, (req, res) => {
     const { _id } = req.user
     const { user } = req.user
     var id

     if (typeof user == 'undefined') {
          id = _id
     } else {
          id = user
     }
     var ehSimples = false
     var ehLP = false
     var ehLR = false

     Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
          //console.log('encontrou projeto')
          Empresa.findOne({ _id: projeto.empresa }).lean().then((empresa) => {
               //console.log('empresa=>' + empresa)
               Cronograma.findOne({ projeto: req.params.id }).then((cronograma) => {
                    //console.log('encontrou cronograma')
                    //console.log('empresa.regime=>' + empresa.regime)
                    Configuracao.findOne({ _id: projeto.configuracao }).lean().then((config) => {
                         switch (empresa.regime) {
                              case "Simples": ehSimples = true
                                   break;
                              case "Lucro Presumido": ehLP = true
                                   break;
                              case "Lucro Real": ehLR = true
                                   break;
                         }
                         //console.log('ehSimples=>' + ehSimples)
                         //console.log('ehLP=>' + ehLP)
                         //console.log('ehLR=>' + ehLR)
                         //console.log('projeto.cliente=>' + projeto.cliente)
                         Cliente.findOne({ _id: projeto.cliente }).lean().then((cliente) => {
                              //console.log('encontrou cliente')
                              var fatura
                              var checkHora
                              if (projeto.fatequ == true) {
                                   fatura = 'checked'
                              } else {
                                   fatura = 'uncheked'
                              }
                              //console.log('tipoCustoIns=>'+projeto.tipoCustoIns)

                              if (projeto.tipoCustoIns == 'hora') {
                                   checkHora = 'checked'
                              } else {
                                   checkHora = 'unchecked'
                              }
                              var libRecursos = liberaRecursos(cronograma.dateplaini, cronograma.dateplafim, cronograma.dateprjini, cronograma.dateprjfim,
                                   cronograma.dateateini, cronograma.dateatefim, cronograma.dateinvini, cronograma.dateinvfim,
                                   cronograma.datestbini, cronograma.datestbfim, cronograma.dateestini, cronograma.dateestfim,
                                   cronograma.datemodini, cronograma.datemodfim, cronograma.datevisini, cronograma.datevisfim)
                              if (projeto.qtdins == '' || typeof projeto.qtdins == 'undefined' || projeto.qtdins == 0) {
                                   libRecursos = false
                              } else {
                                   libRecursos = true
                              }
                              res.render('projeto/custosdiretos', { projeto, cronograma, empresa, config, ehSimples, ehLP, ehLR, cliente, fatura, checkHora, libRecursos })
                         }).catch((err) => {
                              req.flash('error_msg', 'Houve um erro ao encontrar a configuração.')
                              if (projeto.ehVinculo == false) {
                                   res.redirect('/projeto/direto/' + req.body.id)
                              } else {
                                   res.redirect('/projeto/custos/' + req.body.id)
                              }
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve um erro ao encontrar um cliente.')
                         if (projeto.ehVinculo == false) {
                              res.redirect('/projeto/direto/' + req.body.id)
                         } else {
                              res.redirect('/projeto/custos/' + req.body.id)
                         }
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao encontrar o cronograma.')
                    if (projeto.ehVinculo == false) {
                         res.redirect('/projeto/direto/' + req.body.id)
                    } else {
                         res.redirect('/projeto/custos/' + req.body.id)
                    }
               })
          }).catch((err) => {
               req.flash('error_msg', 'Houve uma falha ao encontrar a empresa.')
               if (projeto.ehVinculo == false) {
                    res.redirect('/projeto/direto/' + req.body.id)
               } else {
                    res.redirect('/projeto/custos/' + req.body.id)
               }
          })
     }).catch((err) => {
          req.flash('error_msg', 'Nenhum projeto encontrado.')
          if (projeto.ehVinculo == false) {
               res.redirect('/projeto/direto/' + req.body.id)
          } else {
               res.redirect('/projeto/custos/' + req.body.id)
          }
     })
})

router.get('/edicao/:id', ehAdmin, (req, res) => {
     const { _id } = req.user
     const { user } = req.user
     var id

     if (typeof user == 'undefined') {
          id = _id
     } else {
          id = user
     }
     Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
          Detalhado.findOne({ projeto: projeto._id }).lean().then((detalhe) => {
               Empresa.findOne({ _id: projeto.empresa }).lean().then((rp) => {
                    Pessoa.findOne({ _id: projeto.vendedor }).lean().then((pv) => {
                         Cliente.findOne({ _id: projeto.cliente }).lean().then((cli) => {
                              Configuracao.findOne({ _id: projeto.configuracao }).lean().then((config) => {
                                   //console.log('config=>' + config)
                                   Pessoa.findOne({ _id: projeto.funres }).lean().then((pr) => {
                                        Pessoa.find({ funges: 'checked', user: id }).lean().then((responsavel) => {
                                             Pessoa.find({ ehVendedor: true, user: id }).lean().then((vendedor) => {
                                                  Empresa.find({ user: id }).lean().then((empresa) => {
                                                       Configuracao.find({ user: id }).lean().then((configuracao) => {
                                                            var pedido
                                                            if (projeto.pedido) {
                                                                 pedido = 'checked'
                                                            } else {
                                                                 pedido = 'unchecked'
                                                            }
                                                            if (projeto.ehVinculo) {

                                                                 res.render('projeto/projetodia', { projeto, detalhe, rp, pv, pr, cli, config, responsavel, vendedor, empresa, configuracao, pedido })

                                                            } else {
                                                                 // if (projeto.ehDireto == false) {
                                                                 //      res.render('projeto/editprojeto', { projeto, detalhe, rp, pv, pr, cli, config, responsavel, vendedor, empresa, configuracao })
                                                                 // } else {
                                                                 //      if (projeto.ehDireto == true) {
                                                                 //           res.render('projeto/editdiretoprincipal', { projeto, detalhe, rp, pv, pr, cli, config, responsavel, vendedor, empresa, configuracao })
                                                                 //      }
                                                                 // }
                                                                 //console.log('detalhe.unidadeMod=>'+detalhe.unidadeMod)
                                                                 res.render('projeto/editprojeto', { projeto, detalhe, rp, pv, cli, config, responsavel, vendedor, empresa, configuracao, pedido })
                                                            }
                                                       }).catch((err) => {
                                                            req.flash('error_msg', 'Houve uma falha ao encontrar a configuração.')
                                                            res.redirect('/configuracao/consulta')
                                                       })
                                                  }).catch((err) => {
                                                       req.flash('error_msg', 'Houve uma falha ao encontrar a empresa.')
                                                       res.redirect('/configuracao/consulta')
                                                  })
                                             }).catch((err) => {
                                                  req.flash('error_msg', 'Não foi possível encontrar o vendedor.')
                                                  res.redirect('/pessoa/consulta')
                                             })
                                        }).catch((err) => {
                                             req.flash('error_msg', 'Não foi possível encontrar o responsável.')
                                             res.redirect('/pessoa/consulta')
                                        })
                                   }).catch((err) => {
                                        req.flash('error_msg', 'Houve uma falha ao encontrar o responável.')
                                        res.redirect('/pessoa/consulta')
                                   })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Houve uma falha ao encontrar a configuração.')
                                   res.redirect('/configuracao/consulta')
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Houve uma falha ao encontrar o cliente.')
                              res.redirect('/configuracao/consulta')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao encontrar o vendedor.')
                         res.redirect('/pessoa/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao encontrar a empresa.')
                    res.redirect('/pessoa/consulta')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Não foi possível encontrar os detalhes do projeto')
               res.redirect('/projeto/consulta')
          })
     }).catch((err) => {
          req.flash('error_msg', 'Houve uma falha ao encontrar o projeto')
          res.redirect('/projeto/consulta')
     })

})

router.get('/confirmaexclusao/:id', ehAdmin, (req, res) => {
     Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
          res.render('projeto/confirmaexclusao', { projeto: projeto })
     }).catch((err) => {
          req.flash('error_msg', 'Não foi possível encontrar o projeto')
          res.redirect('/projeto/consulta')
     })
})

router.get('/remover/:id', ehAdmin, (req, res) => {
     var erros = []

     Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
          if (projeto.orcado == true) {
               Projeto.findOneAndRemove({ _id: req.params.id }).then(() => {
                    Detalhado.findOneAndRemove({ projeto: req.params.id }).then(() => {
                         Realizado.findOneAndRemove({ projeto: req.params.id }).then(() => {
                              Equipe.findOneAndRemove({ projeto: req.params.id }).then(() => {
                                   Cronograma.findOneAndRemove({ projeto: req.params.id }).then(() => {
                                        Dimensionamento.findOneAndRemove({ _id: projeto.dimensionamento }).then(() => {
                                             req.flash('success_msg', 'Projeto removido com sucesso.')
                                             res.redirect('/projeto/consulta')
                                        }).catch(() => {
                                             req.flash('error_msg', 'Não foi possível remover o dimensionamento do projeto.')
                                             res.redirect('/projeto/consulta')
                                        })
                                   }).catch(() => {
                                        req.flash('error_msg', 'Não foi possível remover o cronograma do projeto.')
                                        res.redirect('/projeto/consulta')
                                   })
                              }).catch(() => {
                                   req.flash('error_msg', 'Não foi possível remover o realizado projeto.')
                                   res.redirect('/projeto/consulta')
                              })
                         }).catch(() => {
                              req.flash('error_msg', 'Não foi possível remover o realizado projeto.')
                              res.redirect('/projeto/consulta')
                         })
                    }).catch(() => {
                         req.flash('error_msg', 'Não foi possível remover os detalhes deste projeto.')
                         res.redirect('/projeto/consulta')
                    })
               }).catch(() => {
                    req.flash('error_msg', 'Não foi possível remover este projeto.')
                    res.redirect('/projeto/consulta')
               })
          } else {
               req.flash('error_msg', 'O projeto não pode ser excluido porque já esta em execução')
               res.redirect('/projeto/consulta')
          }
     })
})

router.get('/alocacao/:id', ehAdmin, (req, res) => {
     const { _id } = req.user
     const { user } = req.user
     var id

     if (typeof user == 'undefined') {
          id = _id
     } else {
          id = user
     }
     var dentro_ins = []
     var fora_ins = []
     var dentro_ele = []
     var fora_ele = []
     var qi = 0
     var qe = 0
     var encontrou_ins = false
     var encontrou_ele = false
     var custoEle0 = 0
     var custoEle1 = 0
     Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
          Cliente.findOne({ _id: projeto.cliente }).lean().then((cliente) => {
               Cronograma.findOne({ projeto: projeto._id }).lean().then((cronograma) => {
                    // //console.log('projeto.equipe=>' + projeto.equipe)
                    if (typeof projeto.equipe != 'undefined' && projeto.equipe != '') {
                         //console.log('encontrou equipe no projeto')
                         Equipe.find({ user: id, nome: { $exists: true }, ehpadrao: true }).lean().then((equipes) => {
                              Equipe.findOne({ _id: projeto.equipe }).lean().then((lista_equipe) => {
                                   var lista_instaladores = [lista_equipe.ins0, lista_equipe.ins1, lista_equipe.ins2, lista_equipe.ins3, lista_equipe.ins4, lista_equipe.ins5]
                                   var lista_eletricistas = [lista_equipe.ele0, lista_equipe.ele1]
                                   Pessoa.find({ user: id, funins: 'checked' }).then((pessoas_ins) => {
                                        Pessoa.find({ user: id, funele: 'checked' }).then((pessoas_ele) => {
                                             pessoas_ins.forEach((element) => {
                                                  encontrou_ins = false
                                                  for (i = 0; i < lista_instaladores.length; i++) {
                                                       if (lista_instaladores[i] == element.nome) {
                                                            dentro_ins.push({ id: element._id, nome: element.nome, custo: element.custo })
                                                            encontrou_ins = true
                                                       }
                                                  }
                                                  if (encontrou_ins == false) {
                                                       fora_ins.push({ id: element._id, nome: element.nome })
                                                  }
                                                  qi++
                                             })
                                             var custoIns0 = 0
                                             var custoIns1 = 0
                                             var custoIns2 = 0
                                             var custoIns3 = 0
                                             var custoIns4 = 0
                                             var custoIns5 = 0
                                             for (i = 0; i < dentro_ins.length; i++) {
                                                  if (dentro_ins[i].custo != '' && typeof dentro_ins[i].custo != 'undefined') {
                                                       //console.log('i=>' + i)
                                                       if (i == 0) {
                                                            custoIns0 = dentro_ins[i].custo
                                                       }
                                                       if (i == 1) {
                                                            custoIns1 = dentro_ins[i].custo
                                                       }
                                                       if (i == 2) {
                                                            custoIns2 = dentro_ins[i].custo
                                                       }
                                                       if (i == 3) {
                                                            custoIns3 = dentro_ins[i].custo
                                                       }
                                                       if (i == 4) {
                                                            custoIns4 = dentro_ins[i].custo
                                                       }
                                                       if (i == 5) {
                                                            custoIns5 = dentro_ins[i].custo
                                                       }
                                                  }
                                             }

                                             custoIns = parseFloat(custoIns0) + parseFloat(custoIns1) + parseFloat(custoIns2) + parseFloat(custoIns3) + parseFloat(custoIns4) + parseFloat(custoIns5)
                                             //console.log('lista_equipe.custoins=>' + lista_equipe.custoins)
                                             if (lista_equipe.custoins != '') {
                                                  custoIns = lista_equipe.custoins
                                             }
                                             //console.log('lista_eletricistas[1]=>' + lista_eletricistas[1])

                                             pessoas_ele.forEach((element) => {
                                                  //console.log('eletricista=>' + element.nome)
                                                  encontrou_ele = false
                                                  for (i = 0; i < lista_eletricistas.length; i++) {
                                                       if (lista_eletricistas[i] == element.nome) {
                                                            dentro_ele.push({ id: element._id, nome: element.nome, custo: element.custo })
                                                            encontrou_ele = true
                                                       }
                                                  }
                                                  if (encontrou_ele == false) {
                                                       fora_ele.push({ id: element._id, nome: element.nome })
                                                  }
                                                  qe++
                                             })
                                             for (i = 0; i < dentro_ele.length; i++) {
                                                  if (dentro_ele[i].custo != '' && typeof dentro_ele[i].custo != 'undefined') {
                                                       //console.log('i=>' + i)
                                                       if (i == 0) {
                                                            custoEle0 = dentro_ele[i].custo
                                                       }
                                                       if (i == 1) {
                                                            custoEle1 = dentro_ele[i].custo
                                                       }
                                                       if (i == 2) {
                                                            custoEle2 = dentro_ele[i].custo
                                                       }
                                                       if (i == 3) {
                                                            custoEle3 = dentro_ele[i].custo
                                                       }
                                                       if (i == 4) {
                                                            custoEle4 = dentro_ele[i].custo
                                                       }
                                                       if (i == 5) {
                                                            custoEle5 = dentro_ele[i].custo
                                                       }
                                                  }
                                             }
                                             custoEle = parseFloat(custoEle0) + parseFloat(custoEle1)
                                             if (pessoas_ins.length == qi || pessoas_ele.length == qe) {
                                                  res.render('projeto/alocacao', { projeto, cliente, cronograma, equipes, dentro_ins, fora_ins, dentro_ele, fora_ele, lista_equipe, custoEle0, custoEle1, custoEle, custoIns0, custoIns1, custoIns2, custoIns3, custoIns4, custoIns5, custoIns })
                                             }
                                        })
                                   }).catch((err) => {
                                        req.flash('error_msg', 'Falha ao encontrar os eletricistas.')
                                        res.redirect('/projeto/edicao/' + req.params.id)
                                   })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Falha ao encontrar a equipe.')
                                   res.redirect('/projeto/edicao/' + req.params.id)
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Falha ao encontrar a equipe.')
                              res.redirect('/projeto/edicao/' + req.params.id)
                         })
                    } else {
                         //console.log('não encontrou equipe no projeto')
                         Equipe.find({ user: id, nome: { $exists: true } }).lean().then((equipes) => {
                              // //console.log('projeto.equipe=>' + projeto.equipe)
                              Pessoa.find({ user: id, funele: 'checked' }).then((pessoas_ele) => {
                                   // //console.log('pessoas_ele=>' + pessoas_ele)
                                   var t = 0
                                   pessoas_ele.forEach((element) => {
                                        fora_ele.push({ nome: element.nome })
                                        if (t == 0) {
                                             custoEle0 = element.custo
                                        }
                                        if (t == 1) {
                                             custoEle1 = element.custo
                                        }
                                        t++
                                        //console.log('t=>' + t)
                                        if (t == pessoas_ele.length) {
                                             //console.log('custoEle0=>' + custoEle0)
                                             //console.log('custoEle1=>' + custoEle1)
                                             res.render('projeto/alocacao', { projeto, equipes, cliente, cronograma, equipes, fora_ele, custoEle0, custoEle1 })
                                        }
                                   })

                              }).catch((err) => {
                                   req.flash('error_msg', 'Falha ao encontrar os eletricistas.')
                                   res.redirect('/projeto/edicao/' + req.params.id)
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Falha ao encontrar a equipe.')
                              res.redirect('/projeto/edicao/' + req.params.id)
                         })

                         // //console.log('busca eletricistas')
                         // Pessoa.find({ user: id, funele: 'checked' }).lean().then((pessoas_ele) => {
                         //      res.render('projeto/alocacao', { projeto, cliente, cronograma, pessoas_ele })
                         // }).catch((err) => {
                         //      req.flash('error_msg', 'Falha ao encontrar os eletricistas.')
                         //      res.redirect('/projeto/projetotarefa/')
                         // })
                    }
               }).catch((err) => {
                    req.flash('error_msg', 'Falha ao encontrar o cronograma.')
                    res.redirect('/projeto/edicao/' + req.params.id)
               })
          }).catch((err) => {
               req.flash('error_msg', 'Falha ao encontrar o cliente.')
               res.redirect('/projeto/edicao/' + req.params.id)
          })
     }).catch((err) => {
          req.flash('error_msg', 'Falha ao encontrar o projeto.')
          res.redirect('/projeto/edicao/' + req.params.id)
     })
})

router.get('/investimento/:id', ehAdmin, (req, res) => {
     var sac = []
     var fluxo25 = []
     var fluxoAno25 = []
     var numpar = 0
     var txjuros = 0
     var jurosmes = 0
     var valor = 0
     var amort = 0
     var ipca = 0
     var te = 0
     var tusd = 0
     var icms = 0
     var pis = 0
     var cofins = 0
     var cosip = 0
     var medcon = 0
     var trbte = 0
     var trbtusd = 0
     var trfte = 0
     var trftusd = 0
     var tarifa = 0
     var juros = 0
     var pmt = 0
     var saldo = 0
     var fatura = 0
     var fluxo = 0
     var fluxoacc = 0
     var minimo = 0
     var deste = 0
     var destusd = 0
     var ecomen = 0
     var totpmt = 0
     var totamort = 0
     var totjuros = 0
     var parmed = 0
     var fez1 = false
     var fez2 = false
     var fez3 = false
     var fez4 = false
     var fez5 = false
     var fez6 = false
     var fez7 = false
     var fez8 = false
     var fez9 = false
     var fez10 = false
     var fez11 = false
     var fez12 = false
     var fez13 = false
     var fez14 = false
     var fez15 = false
     var fez16 = false
     var fez17 = false
     var fez18 = false
     var fez19 = false
     var fez20 = false
     var fez21 = false
     var fez22 = false
     var fez23 = false
     var fez24 = false
     var fez25 = false
     var ano = 0
     var ano1 = 0
     var ano2 = 0
     var ano3 = 0
     var ano4 = 0
     var ano5 = 0
     var ano6 = 0
     var ano7 = 0
     var ano8 = 0
     var ano9 = 0
     var ano10 = 0
     var ano11 = 0
     var ano12 = 0
     var ano13 = 0
     var ano14 = 0
     var ano15 = 0
     var ano16 = 0
     var ano17 = 0
     var ano18 = 0
     var ano19 = 0
     var ano20 = 0
     var ano21 = 0
     var ano22 = 0
     var ano23 = 0
     var ano24 = 0
     var ano25 = 0
     var ajuste = 0

     Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
          Cliente.findOne({ _id: projeto.cliente }).lean().then((cliente) => {
               if (projeto.investimento != '' && typeof projeto.investimento != 'undefined') {
                    // //console.log('projeto.dimensionamento=>' + projeto.dimensionamento)
                    // //console.log('projeto.investimento=>' + projeto.investimento)
                    Investimento.findOne({ _id: projeto.investimento }).lean().then((investimento) => {
                         Investimento.findOne({ _id: projeto.investimento }).then((invest_ano) => {
                              Dimensionamento.findOne({ _id: projeto.dimensionamento }).lean().then((dimensionamento) => {
                                   //console.log('entrou')
                                   numpar = investimento.parcelas
                                   txjuros = investimento.txjuros
                                   jurosmes = Math.pow((1 + (txjuros / 100)), (1 / 12)) - 1
                                   valor = projeto.valor
                                   amort = (parseFloat(valor) / parseFloat(numpar)).toFixed(2)
                                   ipca = investimento.ipca
                                   te = dimensionamento.te
                                   tusd = dimensionamento.tusd
                                   icms = dimensionamento.icms
                                   pis = dimensionamento.pis
                                   cofins = dimensionamento.cofins
                                   cosip = dimensionamento.cosip
                                   if (dimensionamento.ajuste == '' || typeof dimensionamento.ajuste == 'undefined') {
                                        ajuste = 1
                                   } else {
                                        ajuste = 1 + (parseFloat(dimensionamento.ajuste) / 100)
                                   }
                                   // //console.log('dimensionamento.totconsumo=>' + dimensionamento.totconsumo)
                                   medcon = parseFloat(dimensionamento.totconsumo) / 12

                                   trbte = (parseFloat(icms) + parseFloat(cofins) + parseFloat(pis)) / 100
                                   trbtusd = (parseFloat(cofins) + parseFloat(pis)) / 100
                                   trfte = ((parseFloat(te) * ajuste) / (1 - trbte))
                                   trftusd = ((parseFloat(tusd) * ajuste) / (1 - trbtusd))
                                   tarifa = parseFloat(trfte) + parseFloat(trftusd)

                                   // //console.log('numpar=>' + numpar)
                                   for (i = 1; i <= numpar; i++) {
                                        //console.log('sac=>' + sac)

                                        if (i > 12 && fez1 == false) {
                                             te = dimensionamento.te * (1 + (ipca / 100))
                                             // //console.log('te1=>' + te)
                                             tusd = dimensionamento.tusd * (1 + (ipca / 100))
                                             // medcon = medcon * (Math.pow((1 - 0.00875), 1))
                                             fez1 = true
                                        } else {
                                             if (i > 24 && fez2 == false) {
                                                  te = te * (1 + (ipca / 100))
                                                  // //console.log('te2=>' + te)
                                                  tusd = tusd * (1 + (ipca / 100))
                                                  // medcon = medcon * (Math.pow((1 - 0.00875), 1))
                                                  fez2 = true
                                             } else {
                                                  if (i > 36 && fez3 == false) {
                                                       te = te * (1 + (ipca / 100))
                                                       // //console.log('te3=>' + te)
                                                       tusd = tusd * (1 + (ipca / 100))
                                                       // medcon = medcon * (Math.pow((1 - 0.00875), 1))
                                                       fez3 = true
                                                  } else {
                                                       if (i > 48 && fez4 == false) {
                                                            te = te * (1 + (ipca / 100))
                                                            // //console.log('te3=>' + te)
                                                            tusd = tusd * (1 + (ipca / 100))
                                                            // medcon = medcon * (Math.pow((1 - 0.00875), 1))
                                                            fez4 = true
                                                       } else {
                                                            if (i > 60 && fez5 == false) {
                                                                 te = te * (1 + (ipca / 100))
                                                                 // //console.log('te3=>' + te)
                                                                 tusd = tusd * (1 + (ipca / 100))
                                                                 // medcon = medcon * (Math.pow((1 - 0.00875), 1))
                                                                 fez5 = true
                                                            } else {
                                                                 if (i > 72 && fez6 == false) {
                                                                      te = te * (1 + (ipca / 100))
                                                                      // //console.log('te3=>' + te)
                                                                      tusd = tusd * (1 + (ipca / 100))
                                                                      // medcon = medcon * (Math.pow((1 - 0.00875), 1))
                                                                      fez6 = true
                                                                 } else {
                                                                      if (i > 84 && fez7 == false) {
                                                                           te = te * (1 + (ipca / 100))
                                                                           // //console.log('te3=>' + te)
                                                                           tusd = tusd * (1 + (ipca / 100))
                                                                           // medcon = medcon * (Math.pow((1 - 0.00875), 1))
                                                                           fez7 = true
                                                                      } else {
                                                                           if (i > 96 && fez8 == false) {
                                                                                te = te * (1 + (ipca / 100))
                                                                                // //console.log('te3=>' + te)
                                                                                tusd = tusd * (1 + (ipca / 100))
                                                                                // medcon = medcon * (Math.pow((1 - 0.00875), 1))
                                                                                fez8 = true
                                                                           } else {
                                                                                if (i > 108 && fez9 == false) {
                                                                                     te = te * (1 + (ipca / 100))
                                                                                     // //console.log('te3=>' + te)
                                                                                     tusd = tusd * (1 + (ipca / 100))
                                                                                     // medcon = medcon * (Math.pow((1 - 0.00875), 1))
                                                                                     fez9 = true
                                                                                } else {
                                                                                     if (i > 120 && fez10 == false) {
                                                                                          te = te * (1 + (ipca / 100))
                                                                                          // //console.log('te3=>' + te)
                                                                                          tusd = tusd * (1 + (ipca / 100))
                                                                                          // medcon = medcon * (Math.pow((1 - 0.00875), 1))
                                                                                          fez10 = true
                                                                                     }
                                                                                }
                                                                           }
                                                                      }
                                                                 }
                                                            }
                                                       }
                                                  }
                                             }
                                        }

                                        minimo = (((30 * (parseFloat(te) + parseFloat(tusd))) / (1 - trbte)) + parseFloat(cosip)).toFixed(2)
                                        // //console.log('i=>' + i)
                                        // if (i <= 12) {
                                        //      fatura = ((parseFloat(medcon) * (((parseFloat(te) + parseFloat(tusd)) * ajuste) / (1 - trbte))) + parseFloat(cosip)).toFixed(2)
                                        //      fatura1 = fatura
                                        // }
                                        // if (i > 12 && i <= 24) {
                                        //      //console.log('fatura1=>' + fatura1)
                                        //      //console.log('medcon=>' + medcon)
                                        //      //console.log('te=>' + te)
                                        //      //console.log('tusd=>' + tusd)
                                        //      //console.log('ajuste=>' + ajuste)
                                        //      //console.log('trbte=>' + trbte)
                                        //      //console.log('cosip=>' + cosip)
                                        //      fatura = (parseFlaot(fatura1) + (parseFloat(medcon) * (((parseFloat(te) + parseFloat(tusd)) * ajuste) / (1 - trbte))) + parseFloat(cosip)).toFixed(2)
                                        //      fatura2 = fatura
                                        // }
                                        // if (i > 24 && i <= 36) {
                                        //      //console.log('fatura2=>' + fatura2)
                                        //      fatura = (parseFloat(fatura2) + (parseFloat(medcon) * (((parseFloat(te) + parseFloat(tusd)) * ajuste) / (1 - trbte))) + parseFloat(cosip)).toFixed(2)
                                        // }

                                        if (sac != '' && typeof sac != 'undefined') {
                                             var ultimo = sac[sac.length - 1]
                                             juros = (parseFloat((parseFloat(ultimo.saldo) * parseFloat(jurosmes)))).toFixed(2)
                                             pmt = (parseFloat(amort) + parseFloat(juros)).toFixed(2)
                                             saldo = (parseFloat(ultimo.saldo) - parseFloat(amort)).toFixed(2)
                                        } else {
                                             juros = (parseFloat((parseFloat(valor) * parseFloat(jurosmes)))).toFixed(2)
                                             pmt = (parseFloat(amort) + parseFloat(juros)).toFixed(2)
                                             saldo = (parseFloat(valor) - parseFloat(amort)).toFixed(2)
                                        }

                                        fatura = ((parseFloat(medcon) * (((parseFloat(te) + parseFloat(tusd)) * ajuste) / (1 - trbte))) + parseFloat(cosip)).toFixed(2)
                                        fluxo = (parseFloat(fatura) - parseFloat(pmt) - parseFloat(minimo)).toFixed(2)
                                        fluxoacc = (parseFloat(fluxoacc) + parseFloat(fluxo)).toFixed(2)
                                        deste = parseFloat(medcon) * (parseFloat(te) / (1 - parseFloat(trbte)))
                                        destusd = parseFloat(medcon) * (parseFloat(tusd) / (1 - parseFloat(trbtusd)))
                                        ecomen = (parseFloat(fatura) - parseFloat(deste) - parseFloat(destusd) + parseFloat(minimo)).toFixed(2)

                                        sac.push({ mes: i, pmt, amort, juros, saldo, fluxo, ecomen, fatura, minimo, fluxo, fluxoacc })
                                   }


                                   for (t = 0; t < sac.length; t++) {

                                        totpmt = (parseFloat(totpmt) + parseFloat(sac[t].pmt)).toFixed(2)
                                        totamort = (parseFloat(totamort) + parseFloat(sac[t].amort)).toFixed(2)
                                        totjuros = (parseFloat(totjuros) + parseFloat(sac[t].juros)).toFixed(2)
                                   }

                                   parmed = (parseFloat(totpmt) / parseFloat(numpar)).toFixed(2)
                                   medcon = parseFloat(dimensionamento.totconsumo) / 12

                                   fez1 = false
                                   fez2 = false
                                   fez3 = false
                                   fez4 = false
                                   fez5 = false
                                   fez6 = false
                                   fez7 = false
                                   fez8 = false
                                   fez9 = false
                                   fez10 = false
                                   fez11 = false
                                   fez12 = false
                                   fez13 = false
                                   fez14 = false
                                   fez15 = false
                                   fez16 = false
                                   fez17 = false
                                   fez18 = false
                                   fez19 = false
                                   fez20 = false
                                   fez21 = false
                                   fez22 = false
                                   fez23 = false
                                   fez24 = false
                                   fluxoacc = 0
                                   te = dimensionamento.te
                                   tusd = dimensionamento.tusd

                                   // //console.log('ipca=>'+ipca)

                                   for (b = 1; b <= 301; b++) {
                                        if (b > 12 && fez1 == false) {
                                             te = dimensionamento.te * (1 + (ipca / 100))
                                             //  //console.log('te1=>' + te)
                                             tusd = dimensionamento.tusd * (1 + (ipca / 100))
                                             //  medcon = medcon * (Math.pow((1 - 0.00875), 1))
                                             fez1 = true
                                        } else {
                                             if (b > 24 && fez2 == false) {
                                                  te = te * (1 + (ipca / 100))
                                                  // //console.log('te2=>' + te)
                                                  tusd = tusd * (1 + (ipca / 100))
                                                  // medcon = medcon * (Math.pow((1 - 0.00875), 1))
                                                  fez2 = true
                                             } else {
                                                  if (b > 36 && fez3 == false) {
                                                       te = te * (1 + (ipca / 100))
                                                       // //console.log('te3=>' + te)
                                                       tusd = tusd * (1 + (ipca / 100))
                                                       // medcon = medcon * (Math.pow((1 - 0.00875), 1))
                                                       fez3 = true
                                                  } else {
                                                       if (b > 48 && fez4 == false) {
                                                            te = te * (1 + (ipca / 100))
                                                            // //console.log('te3=>' + te)
                                                            tusd = tusd * (1 + (ipca / 100))
                                                            // medcon = medcon * (Math.pow((1 - 0.00875), 1))
                                                            fez4 = true
                                                       } else {
                                                            if (b > 60 && fez5 == false) {
                                                                 te = te * (1 + (ipca / 100))
                                                                 // //console.log('te3=>' + te)
                                                                 tusd = tusd * (1 + (ipca / 100))
                                                                 // medcon = medcon * (Math.pow((1 - 0.00875), 1))
                                                                 fez5 = true
                                                            } else {
                                                                 if (b > 72 && fez6 == false) {
                                                                      te = te * (1 + (ipca / 100))
                                                                      // //console.log('te3=>' + te)
                                                                      tusd = tusd * (1 + (ipca / 100))
                                                                      // medcon = medcon * (Math.pow((1 - 0.00875), 1))
                                                                      fez6 = true
                                                                 } else {
                                                                      if (b > 84 && fez7 == false) {
                                                                           te = te * (1 + (ipca / 100))
                                                                           // //console.log('te3=>' + te)
                                                                           tusd = tusd * (1 + (ipca / 100))
                                                                           // medcon = medcon * (Math.pow((1 - 0.00875), 1))
                                                                           fez7 = true
                                                                      } else {
                                                                           if (b > 96 && fez8 == false) {
                                                                                te = te * (1 + (ipca / 100))
                                                                                // //console.log('te3=>' + te)
                                                                                tusd = tusd * (1 + (ipca / 100))
                                                                                // medcon = medcon * (Math.pow((1 - 0.00875), 1))
                                                                                fez8 = true
                                                                           } else {
                                                                                if (b > 108 && fez9 == false) {
                                                                                     te = te * (1 + (ipca / 100))
                                                                                     // //console.log('te3=>' + te)
                                                                                     tusd = tusd * (1 + (ipca / 100))
                                                                                     // medcon = medcon * (Math.pow((1 - 0.00875), 1))
                                                                                     fez9 = true
                                                                                } else {
                                                                                     if (b > 120 && fez10 == false) {
                                                                                          te = te * (1 + (ipca / 100))
                                                                                          // //console.log('te3=>' + te)
                                                                                          tusd = tusd * (1 + (ipca / 100))
                                                                                          // medcon = medcon * (Math.pow((1 - 0.00875), 1))
                                                                                          fez10 = true
                                                                                     } else {
                                                                                          if (b > 132 && fez11 == false) {
                                                                                               te = te * (1 + (ipca / 100))
                                                                                               // //console.log('te3=>' + te)
                                                                                               tusd = tusd * (1 + (ipca / 100))
                                                                                               // medcon = medcon * (Math.pow((1 - 0.00875), 1))
                                                                                               fez11 = true
                                                                                          } else {
                                                                                               if (b > 144 && fez12 == false) {
                                                                                                    te = te * (1 + (ipca / 100))
                                                                                                    // //console.log('te3=>' + te)
                                                                                                    tusd = tusd * (1 + (ipca / 100))
                                                                                                    // medcon = medcon * (Math.pow((1 - 0.00875), 1))
                                                                                                    fez12 = true
                                                                                               } else {
                                                                                                    if (b > 156 && fez13 == false) {
                                                                                                         te = te * (1 + (ipca / 100))
                                                                                                         // //console.log('te3=>' + te)
                                                                                                         tusd = tusd * (1 + (ipca / 100))
                                                                                                         // medcon = medcon * (Math.pow((1 - 0.00875), 1))
                                                                                                         fez13 = true
                                                                                                    } else {
                                                                                                         if (b > 168 && fez14 == false) {
                                                                                                              te = te * (1 + (ipca / 100))
                                                                                                              // //console.log('te3=>' + te)
                                                                                                              tusd = tusd * (1 + (ipca / 100))
                                                                                                              // medcon = medcon * (Math.pow((1 - 0.00875), 1))
                                                                                                              fez14 = true
                                                                                                         } else {
                                                                                                              if (b > 180 && fez15 == false) {
                                                                                                                   te = te * (1 + (ipca / 100))
                                                                                                                   // //console.log('te3=>' + te)
                                                                                                                   tusd = tusd * (1 + (ipca / 100))
                                                                                                                   // medcon = medcon * (Math.pow((1 - 0.00875), 1))
                                                                                                                   fez15 = true
                                                                                                              } else {
                                                                                                                   if (b > 192 && fez16 == false) {
                                                                                                                        te = te * (1 + (ipca / 100))
                                                                                                                        // //console.log('te3=>' + te)
                                                                                                                        tusd = tusd * (1 + (ipca / 100))
                                                                                                                        // medcon = medcon * (Math.pow((1 - 0.00875), 1))
                                                                                                                        fez16 = true
                                                                                                                   } else {
                                                                                                                        if (b > 204 && fez17 == false) {
                                                                                                                             te = te * (1 + (ipca / 100))
                                                                                                                             // //console.log('te3=>' + te)
                                                                                                                             tusd = tusd * (1 + (ipca / 100))
                                                                                                                             // medcon = medcon * (Math.pow((1 - 0.00875), 1))
                                                                                                                             fez17 = true
                                                                                                                        } else {
                                                                                                                             if (b > 216 && fez18 == false) {
                                                                                                                                  te = te * (1 + (ipca / 100))
                                                                                                                                  // //console.log('te3=>' + te)
                                                                                                                                  tusd = tusd * (1 + (ipca / 100))
                                                                                                                                  // medcon = medcon * (Math.pow((1 - 0.00875), 1))
                                                                                                                                  fez18 = true
                                                                                                                             } else {
                                                                                                                                  if (b > 228 && fez19 == false) {
                                                                                                                                       te = te * (1 + (ipca / 100))
                                                                                                                                       // //console.log('te3=>' + te)
                                                                                                                                       tusd = tusd * (1 + (ipca / 100))
                                                                                                                                       // medcon = medcon * (Math.pow((1 - 0.00875), 1))
                                                                                                                                       fez19 = true
                                                                                                                                  } else {
                                                                                                                                       if (b > 240 && fez20 == false) {
                                                                                                                                            te = te * (1 + (ipca / 100))
                                                                                                                                            // //console.log('te3=>' + te)
                                                                                                                                            tusd = tusd * (1 + (ipca / 100))
                                                                                                                                            // medcon = medcon * (Math.pow((1 - 0.00875), 1))
                                                                                                                                            fez20 = true
                                                                                                                                       } else {
                                                                                                                                            if (b > 252 && fez21 == false) {
                                                                                                                                                 te = te * (1 + (ipca / 100))
                                                                                                                                                 // //console.log('te3=>' + te)
                                                                                                                                                 tusd = tusd * (1 + (ipca / 100))
                                                                                                                                                 // medcon = medcon * (Math.pow((1 - 0.00875), 1))
                                                                                                                                                 fez21 = true
                                                                                                                                            } else {
                                                                                                                                                 if (b > 264 && fez22 == false) {
                                                                                                                                                      te = te * (1 + (ipca / 100))
                                                                                                                                                      // //console.log('te3=>' + te)
                                                                                                                                                      tusd = tusd * (1 + (ipca / 100))
                                                                                                                                                      // medcon = medcon * (Math.pow((1 - 0.00875), 1))
                                                                                                                                                      fez22 = true
                                                                                                                                                 } else {
                                                                                                                                                      if (b > 276 && fez23 == false) {
                                                                                                                                                           te = te * (1 + (ipca / 100))
                                                                                                                                                           // //console.log('te3=>' + te)
                                                                                                                                                           tusd = tusd * (1 + (ipca / 100))
                                                                                                                                                           // medcon = medcon * (Math.pow((1 - 0.00875), 1))
                                                                                                                                                           fez23 = true
                                                                                                                                                      } else {
                                                                                                                                                           if (b > 288 && fez24 == false) {
                                                                                                                                                                te = te * (1 + (ipca / 100))
                                                                                                                                                                // //console.log('te3=>' + te)
                                                                                                                                                                tusd = tusd * (1 + (ipca / 100))
                                                                                                                                                                // medcon = medcon * (Math.pow((1 - 0.00875), 1))
                                                                                                                                                                fez24 = true
                                                                                                                                                           }
                                                                                                                                                      }
                                                                                                                                                 }
                                                                                                                                            }
                                                                                                                                       }
                                                                                                                                  }
                                                                                                                             }
                                                                                                                        }
                                                                                                                   }
                                                                                                              }
                                                                                                         }
                                                                                                    }
                                                                                               }
                                                                                          }
                                                                                     }
                                                                                }

                                                                           }
                                                                      }
                                                                 }
                                                            }
                                                       }
                                                  }
                                             }
                                        }

                                        // //console.log('fluxo25.length=>'+fluxo25.length)
                                        // //console.log('te=>'+te)
                                        // //console.log('tusd=>'+tusd)
                                        // //console.log('trbte=>'+trbte)
                                        // //console.log('cosip=>'+cosip)
                                        minimo = (((30 * (parseFloat(te) + parseFloat(tusd))) / (1 - trbte)) + parseFloat(cosip)).toFixed(2)
                                        if (b <= numpar) {
                                             if (fluxo25 != '' && typeof fluxo25 != 'undefined') {
                                                  var ultimo = fluxo25[fluxo25.length - 1]
                                                  // //console.log('ultimo.saldo=>'+ultimo.saldo)
                                                  juros = (parseFloat((parseFloat(ultimo.saldo) * parseFloat(jurosmes)))).toFixed(2)
                                                  pmt = (parseFloat(amort) + parseFloat(juros)).toFixed(2)
                                                  saldo = (parseFloat(ultimo.saldo) - parseFloat(amort)).toFixed(2)
                                             } else {
                                                  juros = (parseFloat((parseFloat(valor) * parseFloat(jurosmes)))).toFixed(2)
                                                  pmt = (parseFloat(amort) + parseFloat(juros)).toFixed(2)
                                                  saldo = (parseFloat(valor) - parseFloat(amort)).toFixed(2)
                                             }
                                        } else {
                                             amort = 0
                                             juros = 0
                                             pmt = 0
                                             saldo = 0
                                        }

                                        fatura = ((parseFloat(medcon) * (((parseFloat(te) + parseFloat(tusd)) * ajuste) / (1 - trbte))) + parseFloat(cosip)).toFixed(2)
                                        // //console.log('fatura=>' + fatura)
                                        fluxo = (parseFloat(fatura) - parseFloat(pmt) - parseFloat(minimo)).toFixed(2)
                                        // //console.log('fluxo=>' + fluxo)
                                        fluxoacc = (parseFloat(fluxoacc) + parseFloat(fluxo)).toFixed(2)
                                        deste = parseFloat(medcon) * (parseFloat(te) / (1 - parseFloat(trbte)))
                                        destusd = parseFloat(medcon) * (parseFloat(tusd) / (1 - parseFloat(trbtusd)))
                                        ecomen = (parseFloat(fatura) - parseFloat(deste) - parseFloat(destusd) + parseFloat(minimo)).toFixed(2)

                                        fluxo25.push({ mes: b, pmt, amort, juros, saldo, fluxo, ecomen, fatura, minimo, fluxo, fluxoacc })

                                   }

                                   fatura = 0
                                   minimo = 0
                                   pmt = 0
                                   fez1 = false
                                   fez2 = false
                                   fez3 = false
                                   fez4 = false
                                   fez5 = false
                                   fez6 = false
                                   fez7 = false
                                   fez8 = false
                                   fez9 = false
                                   fez10 = false
                                   fez11 = false
                                   fez12 = false
                                   fez13 = false
                                   fez14 = false
                                   fez15 = false
                                   fez16 = false
                                   fez17 = false
                                   fez18 = false
                                   fez19 = false
                                   fez20 = false
                                   fez21 = false
                                   fez22 = false
                                   fez23 = false
                                   fez24 = false
                                   for (y = 1; y <= 25; y++) {
                                        for (x = 0; x <= 300; x++) {

                                             if (x >= 0 && x <= 11 && y == 1) {
                                                  ano1 = (parseFloat(ano1) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  pmt = (parseFloat(pmt) + parseFloat(fluxo25[x].pmt)).toFixed(2)
                                                  fatura = (parseFloat(fatura) + parseFloat(fluxo25[x].fatura)).toFixed(2)
                                                  minimo = (parseFloat(minimo) + parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  ano = (parseFloat(ano) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                             }
                                             if (x > 11 && x <= 23 && y == 2) {
                                                  if (fez1 == false) {
                                                       ano2 = ano1
                                                  }
                                                  ano2 = (parseFloat(ano2) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  pmt = (parseFloat(pmt) + parseFloat(fluxo25[x].pmt)).toFixed(2)
                                                  fatura = (parseFloat(fatura) + parseFloat(fluxo25[x].fatura)).toFixed(2)
                                                  minimo = (parseFloat(minimo) + parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  ano = (parseFloat(ano) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  fez1 = true
                                             }
                                             if (x > 23 && x <= 35 && y == 3) {
                                                  if (fez2 == false) {
                                                       ano3 = ano2
                                                  }
                                                  ano3 = (parseFloat(ano3) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  pmt = (parseFloat(pmt) + parseFloat(fluxo25[x].pmt)).toFixed(2)
                                                  fatura = (parseFloat(fatura) + parseFloat(fluxo25[x].fatura)).toFixed(2)
                                                  minimo = (parseFloat(minimo) + parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  ano = (parseFloat(ano) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  fez2 = true
                                             }
                                             if (x > 35 && x <= 47 && y == 4) {
                                                  if (fez3 == false) {
                                                       ano4 = ano3
                                                  }
                                                  //console.log(ano4)
                                                  //console.log(ano)
                                                  //console.log(fluxo25[x].fatura)
                                                  //console.log(fluxo25[x].pmt)
                                                  //console.log(fluxo25[x].minimo)
                                                  ano4 = (parseFloat(ano4) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  //console.log(ano4)
                                                  pmt = (parseFloat(pmt) + parseFloat(fluxo25[x].pmt)).toFixed(2)
                                                  fatura = (parseFloat(fatura) + parseFloat(fluxo25[x].fatura)).toFixed(2)
                                                  minimo = (parseFloat(minimo) + parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  ano = (parseFloat(ano) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  //console.log(ano)
                                                  fez3 = true
                                             }
                                             if (x > 47 && x <= 59 && y == 5) {
                                                  if (fez4 == false) {
                                                       ano5 = ano4
                                                  }
                                                  ano5 = (parseFloat(ano5) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  pmt = (parseFloat(pmt) + parseFloat(fluxo25[x].pmt)).toFixed(2)
                                                  fatura = (parseFloat(fatura) + parseFloat(fluxo25[x].fatura)).toFixed(2)
                                                  minimo = (parseFloat(minimo) + parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  ano = (parseFloat(ano) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  fez4 = true
                                             }
                                             if (x > 59 && x <= 71 && y == 6) {
                                                  if (fez5 == false) {
                                                       ano6 = ano5
                                                  }
                                                  ano6 = (parseFloat(ano6) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  pmt = (parseFloat(pmt) + parseFloat(fluxo25[x].pmt)).toFixed(2)
                                                  fatura = (parseFloat(fatura) + parseFloat(fluxo25[x].fatura)).toFixed(2)
                                                  minimo = (parseFloat(minimo) + parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  ano = (parseFloat(ano) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  fez5 = true
                                             }
                                             if (x > 71 && x <= 83 && y == 7) {
                                                  if (fez6 == false) {
                                                       ano7 = ano6
                                                  }
                                                  ano7 = (parseFloat(ano7) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  pmt = (parseFloat(pmt) + parseFloat(fluxo25[x].pmt)).toFixed(2)
                                                  fatura = (parseFloat(fatura) + parseFloat(fluxo25[x].fatura)).toFixed(2)
                                                  minimo = (parseFloat(minimo) + parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  ano = (parseFloat(ano) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  fez6 = true
                                             }
                                             if (x > 83 && x <= 95 && y == 8) {
                                                  if (fez7 == false) {
                                                       ano8 = ano7
                                                  }
                                                  ano8 = (parseFloat(ano8) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  pmt = (parseFloat(pmt) + parseFloat(fluxo25[x].pmt)).toFixed(2)
                                                  fatura = (parseFloat(fatura) + parseFloat(fluxo25[x].fatura)).toFixed(2)
                                                  minimo = (parseFloat(minimo) + parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  ano = (parseFloat(ano) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  fez7 = true
                                             }
                                             if (x > 95 && x <= 107 && y == 9) {
                                                  if (fez8 == false) {
                                                       ano9 = ano8
                                                  }
                                                  ano9 = (parseFloat(ano9) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  pmt = (parseFloat(pmt) + parseFloat(fluxo25[x].pmt)).toFixed(2)
                                                  fatura = (parseFloat(fatura) + parseFloat(fluxo25[x].fatura)).toFixed(2)
                                                  minimo = (parseFloat(minimo) + parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  ano = (parseFloat(ano) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  fez8 = true
                                             }
                                             if (x > 107 && x <= 119 && y == 10) {
                                                  if (fez9 == false) {
                                                       ano10 = ano9
                                                  }
                                                  ano10 = (parseFloat(ano10) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  pmt = (parseFloat(pmt) + parseFloat(fluxo25[x].pmt)).toFixed(2)
                                                  fatura = (parseFloat(fatura) + parseFloat(fluxo25[x].fatura)).toFixed(2)
                                                  minimo = (parseFloat(minimo) + parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  ano = (parseFloat(ano) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  fez9 = true
                                             }
                                             if (x > 119 && x <= 131 && y == 11) {
                                                  if (fez10 == false) {
                                                       ano11 = ano10
                                                  }
                                                  ano11 = (parseFloat(ano11) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  pmt = (parseFloat(pmt) + parseFloat(fluxo25[x].pmt)).toFixed(2)
                                                  fatura = (parseFloat(fatura) + parseFloat(fluxo25[x].fatura)).toFixed(2)
                                                  minimo = (parseFloat(minimo) + parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  ano = (parseFloat(ano) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  fez10 = true
                                             }
                                             if (x > 131 && x <= 143 && y == 12) {
                                                  if (fez11 == false) {
                                                       ano12 = ano11
                                                  }
                                                  ano12 = (parseFloat(ano12) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  pmt = (parseFloat(pmt) + parseFloat(fluxo25[x].pmt)).toFixed(2)
                                                  fatura = (parseFloat(fatura) + parseFloat(fluxo25[x].fatura)).toFixed(2)
                                                  minimo = (parseFloat(minimo) + parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  ano = (parseFloat(ano) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  fez11 = true
                                             }
                                             if (x > 143 && x <= 155 && y == 13) {
                                                  if (fez12 == false) {
                                                       ano13 = ano12
                                                  }
                                                  ano13 = (parseFloat(ano13) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  pmt = (parseFloat(pmt) + parseFloat(fluxo25[x].pmt)).toFixed(2)
                                                  fatura = (parseFloat(fatura) + parseFloat(fluxo25[x].fatura)).toFixed(2)
                                                  minimo = (parseFloat(minimo) + parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  ano = (parseFloat(ano) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  fez12 = true
                                             }
                                             if (x > 155 && x <= 167 && y == 14) {
                                                  if (fez13 == false) {
                                                       ano14 = ano13
                                                  }
                                                  ano14 = (parseFloat(ano14) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  pmt = (parseFloat(pmt) + parseFloat(fluxo25[x].pmt)).toFixed(2)
                                                  fatura = (parseFloat(fatura) + parseFloat(fluxo25[x].fatura)).toFixed(2)
                                                  minimo = (parseFloat(minimo) + parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  ano = (parseFloat(ano) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  fez13 = true
                                             }
                                             if (x > 167 && x <= 169 && y == 15) {
                                                  if (fez14 == false) {
                                                       ano15 = ano14
                                                  }
                                                  ano15 = (parseFloat(ano15) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  pmt = (parseFloat(pmt) + parseFloat(fluxo25[x].pmt)).toFixed(2)
                                                  fatura = (parseFloat(fatura) + parseFloat(fluxo25[x].fatura)).toFixed(2)
                                                  minimo = (parseFloat(minimo) + parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  ano = (parseFloat(ano) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  fez14 = true
                                             }
                                             if (x > 169 && x <= 181 && y == 16) {
                                                  if (fez15 == false) {
                                                       ano16 = ano15
                                                  }
                                                  ano16 = (parseFloat(ano16) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  pmt = (parseFloat(pmt) + parseFloat(fluxo25[x].pmt)).toFixed(2)
                                                  fatura = (parseFloat(fatura) + parseFloat(fluxo25[x].fatura)).toFixed(2)
                                                  minimo = (parseFloat(minimo) + parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  ano = (parseFloat(ano) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  fez15 = true
                                             }
                                             if (x > 181 && x <= 193 && y == 17) {
                                                  if (fez16 == false) {
                                                       ano17 = ano16
                                                  }
                                                  ano17 = (parseFloat(ano17) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  pmt = (parseFloat(pmt) + parseFloat(fluxo25[x].pmt)).toFixed(2)
                                                  fatura = (parseFloat(fatura) + parseFloat(fluxo25[x].fatura)).toFixed(2)
                                                  minimo = (parseFloat(minimo) + parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  ano = (parseFloat(ano) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  fez16 = true
                                             }
                                             if (x > 193 && x <= 215 && y == 18) {
                                                  if (fez17 == false) {
                                                       ano18 = ano17
                                                  }
                                                  ano18 = (parseFloat(ano18) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  pmt = (parseFloat(pmt) + parseFloat(fluxo25[x].pmt)).toFixed(2)
                                                  fatura = (parseFloat(fatura) + parseFloat(fluxo25[x].fatura)).toFixed(2)
                                                  minimo = (parseFloat(minimo) + parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  ano = (parseFloat(ano) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  fez17 = true
                                             }
                                             if (x > 205 && x <= 227 && y == 19) {
                                                  if (fez18 == false) {
                                                       ano19 = ano18
                                                  }
                                                  ano19 = (parseFloat(ano19) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  pmt = (parseFloat(pmt) + parseFloat(fluxo25[x].pmt)).toFixed(2)
                                                  fatura = (parseFloat(fatura) + parseFloat(fluxo25[x].fatura)).toFixed(2)
                                                  minimo = (parseFloat(minimo) + parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  ano = (parseFloat(ano) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  fez18 = true
                                             }
                                             if (x > 227 && x <= 239 && y == 20) {
                                                  if (fez19 == false) {
                                                       ano20 = ano19
                                                  }
                                                  ano20 = (parseFloat(ano20) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  pmt = (parseFloat(pmt) + parseFloat(fluxo25[x].pmt)).toFixed(2)
                                                  fatura = (parseFloat(fatura) + parseFloat(fluxo25[x].fatura)).toFixed(2)
                                                  minimo = (parseFloat(minimo) + parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  ano = (parseFloat(ano) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  fez19 = true
                                             }
                                             if (x > 239 && x <= 251 && y == 21) {
                                                  if (fez20 == false) {
                                                       ano21 = ano20
                                                  }
                                                  ano21 = (parseFloat(ano21) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  pmt = (parseFloat(pmt) + parseFloat(fluxo25[x].pmt)).toFixed(2)
                                                  fatura = (parseFloat(fatura) + parseFloat(fluxo25[x].fatura)).toFixed(2)
                                                  minimo = (parseFloat(minimo) + parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  ano = (parseFloat(ano) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  fez20 = true
                                             }
                                             if (x > 251 && x <= 263 && y == 22) {
                                                  if (fez21 == false) {
                                                       ano22 = ano21
                                                  }
                                                  ano22 = (parseFloat(ano22) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  pmt = (parseFloat(pmt) + parseFloat(fluxo25[x].pmt)).toFixed(2)
                                                  fatura = (parseFloat(fatura) + parseFloat(fluxo25[x].fatura)).toFixed(2)
                                                  minimo = (parseFloat(minimo) + parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  ano = (parseFloat(ano) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  fez21 = true
                                             }
                                             if (x > 263 && x <= 275 && y == 23) {
                                                  if (fez22 == false) {
                                                       ano23 = ano22
                                                  }
                                                  ano23 = (parseFloat(ano23) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  pmt = (parseFloat(pmt) + parseFloat(fluxo25[x].pmt)).toFixed(2)
                                                  fatura = (parseFloat(fatura) + parseFloat(fluxo25[x].fatura)).toFixed(2)
                                                  minimo = (parseFloat(minimo) + parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  ano = (parseFloat(ano) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  fez22 = true
                                             }
                                             if (x > 275 && x <= 287 && y == 24) {
                                                  if (fez23 == false) {
                                                       ano24 = ano23
                                                  }
                                                  ano24 = (parseFloat(ano24) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  pmt = (parseFloat(pmt) + parseFloat(fluxo25[x].pmt)).toFixed(2)
                                                  fatura = (parseFloat(fatura) + parseFloat(fluxo25[x].fatura)).toFixed(2)
                                                  minimo = (parseFloat(minimo) + parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  ano = (parseFloat(ano) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  fez23 = true
                                             }
                                             if (x > 287 && y == 25) {
                                                  if (fez24 == false) {
                                                       ano25 = ano24
                                                  }
                                                  ano25 = (parseFloat(ano25) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  pmt = (parseFloat(pmt) + parseFloat(fluxo25[x].pmt)).toFixed(2)
                                                  fatura = (parseFloat(fatura) + parseFloat(fluxo25[x].fatura)).toFixed(2)
                                                  minimo = (parseFloat(minimo) + parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  ano = (parseFloat(ano) + parseFloat(fluxo25[x].fatura) - parseFloat(fluxo25[x].pmt) - parseFloat(fluxo25[x].minimo)).toFixed(2)
                                                  fez24 = true
                                             }
                                        }
                                        fluxoAno25.push({ y, ano, fatura, minimo, pmt })
                                   }
                                   invest_ano.ano1 = ano1
                                   invest_ano.ano2 = ano2
                                   invest_ano.ano3 = ano3
                                   invest_ano.ano4 = ano4
                                   invest_ano.ano5 = ano5
                                   invest_ano.ano6 = ano6
                                   invest_ano.ano7 = ano7
                                   invest_ano.ano8 = ano8
                                   invest_ano.ano9 = ano9
                                   invest_ano.ano10 = ano10
                                   invest_ano.ano11 = ano11
                                   invest_ano.ano12 = ano12
                                   invest_ano.ano13 = ano13
                                   invest_ano.ano14 = ano14
                                   invest_ano.ano15 = ano15
                                   invest_ano.ano16 = ano16
                                   invest_ano.ano17 = ano17
                                   invest_ano.ano18 = ano18
                                   invest_ano.ano19 = ano19
                                   invest_ano.ano20 = ano20
                                   invest_ano.ano21 = ano21
                                   invest_ano.ano22 = ano22
                                   invest_ano.ano23 = ano23
                                   invest_ano.ano24 = ano24
                                   invest_ano.ano25 = ano25
                                   invest_ano.save().then(() => {

                                        res.render('projeto/investimento', { sac, fluxoAno25, fluxo25, cliente, projeto, investimento, dimensionamento, medcon, parmed, totpmt, totamort, totjuros })
                                   }).catch((err) => {
                                        req.flash('error_msg', 'Falha ao salvar o investimento.')
                                        res.redirect('/projeto/investimento/' + req.params.id)
                                   })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Falha ao encontrar o dimensionamento.')
                                   res.redirect('/projeto/investimento/' + req.params.id)
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Falha ao encontrar o investimento.')
                              res.redirect('/projeto/investimento/' + req.params.id)
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Falha ao encontrar o investimento.')
                         res.redirect('/projeto/investimento/' + req.params.id)
                    })
               } else {
                    Dimensionamento.findOne({ _id: projeto.dimensionamento }).lean().then((dimensionamento) => {
                         if (dimensionamento != null) {
                              //console.log('entrou')
                              te = dimensionamento.te
                              tusd = dimensionamento.tusd
                              icms = dimensionamento.icms
                              pis = dimensionamento.pis
                              cofins = dimensionamento.cofins
                              cosip = dimensionamento.cosip
                              if (dimensionamento.ajuste == '' || typeof dimensionamento.ajuste == 'undefined') {
                                   ajuste = 0
                              } else {
                                   ajuste = 1 + (parseFloat(dimensionamento.ajuste) / 100)
                              }
                              // //console.log('dimensionamento.totconsumo=>' + dimensionamento.totconsumo)
                              medcon = parseFloat(dimensionamento.totconsumo) / 12
                              res.render('projeto/investimento', { projeto, cliente, te, tusd, icms, pis, cofins, cosip, ajuste, medcon })
                         } else {
                              res.render('projeto/investimento', { projeto, cliente })
                         }
                    }).catch((err) => {
                         req.flash('error_msg', 'Falha ao encontrar o dimensionamento.')
                         res.redirect('/projeto/investimento/' + req.params.id)
                    })
               }
          }).catch((err) => {
               req.flash('error_msg', 'Falha ao encontrar o cliente.')
               res.redirect('/projeto/investimento/' + req.params.id)
          })
     }).catch((err) => {
          req.flash('error_msg', 'Falha ao encontrar o projeto.')
          res.redirect('/projeto/investimento/' + req.params.id)
     })
})

router.get('/custos/:id', ehAdmin, (req, res) => {
     const { _id } = req.user
     const { user } = req.user
     var id

     if (typeof user == 'undefined') {
          id = _id
     } else {
          id = user
     }
     var ehSimples = false
     var ehLP = false
     var ehLR = false

     Projeto.findOne({ _id: req.params.id }).lean().then((projeto) => {
          //console.log('encontrou projeto')
          Equipe.findOne({ projeto: req.params.id }).lean().then((equipe) => {
               Empresa.findOne({ _id: projeto.empresa }).lean().then((empresa) => {
                    //console.log('empresa=>' + empresa)
                    Cronograma.findOne({ projeto: req.params.id }).then((cronograma) => {
                         //console.log('encontrou cronograma')
                         //console.log('empresa.regime=>' + empresa.regime)
                         Configuracao.findOne({ _id: projeto.configuracao }).lean().then((config) => {
                              switch (empresa.regime) {
                                   case "Simples": ehSimples = true
                                        break;
                                   case "Lucro Presumido": ehLP = true
                                        break;
                                   case "Lucro Real": ehLR = true
                                        break;
                              }
                              //console.log('ehSimples=>' + ehSimples)
                              //console.log('ehLP=>' + ehLP)
                              //console.log('ehLR=>' + ehLR)
                              //console.log('projeto.cliente=>' + projeto.cliente)
                              Cliente.findOne({ _id: projeto.cliente }).lean().then((cliente) => {
                                   //console.log('encontrou cliente')
                                   var fatura
                                   var checkHora
                                   if (projeto.fatequ == true) {
                                        fatura = 'checked'
                                   } else {
                                        fatura = 'uncheked'
                                   }
                                   //console.log('tipoCustoIns=>'+projeto.tipoCustoIns)

                                   if (projeto.tipoCustoIns == 'hora') {
                                        checkHora = 'checked'
                                   } else {
                                        checkHora = 'unchecked'
                                   }

                                   dias = (parseFloat(cronograma.agendaModFim) - parseFloat(cronograma.agendaAteIni)) + 1
                                   totint = (parseFloat(equipe.custoins) + parseFloat(equipe.custoele)) * dias
                                   if (projeto.totint != totint) {
                                        projeto.totint = totint
                                   }
                                   var libRecursos = liberaRecursos(cronograma.dateplaini, cronograma.dateplafim, cronograma.dateprjini, cronograma.dateprjfim,
                                        cronograma.dateateini, cronograma.dateatefim, cronograma.dateinvini, cronograma.dateinvfim,
                                        cronograma.datestbini, cronograma.datestbfim, cronograma.dateestini, cronograma.dateestfim,
                                        cronograma.datemodini, cronograma.datemodfim, cronograma.datevisini, cronograma.datevisfim)
                                   if (projeto.qtdins == '' || typeof projeto.qtdins == 'undefined' || projeto.qtdins == 0) {
                                        libRecursos = false
                                   } else {
                                        libRecursos = true
                                   }
                                   res.render('projeto/custos', { projeto, empresa, config, ehSimples, ehLP, ehLR, cliente, fatura, checkHora, libRecursos })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Houve um erro ao encontrar a configuração.')
                                   res.redirect('/projeto/custos/' + req.params.id)
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Houve um erro ao encontrar um cliente.')
                              res.redirect('/projeto/custos/' + req.params.id)
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao encontrar o cronograma.')
                         res.redirect('/projeto/custos/' + req.params.id)
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao encontrar a empresa.')
                    res.redirect('/projeto/custos/' + req.params.id)
               })
          }).catch((err) => {
               req.flash('error_msg', 'Nenhuma equipe encontrada.')
               res.redirect('/projeto/custos/' + req.params.id)
          })
     }).catch((err) => {
          req.flash('error_msg', 'Nenhum projeto encontrado.')
          res.redirect('/projeto/custos/' + req.params.id)
     })
})

router.post('/investimento', ehAdmin, (req, res) => {

     const { _id } = req.user
     const { user } = req.user
     var id

     if (typeof user == 'undefined') {
          id = _id
     } else {
          id = user
     }

     Projeto.findOne({ _id: req.body.id }).then((projeto) => {

          if (req.body.ajuste == '' || typeof req.body.ajuste == 'undefined') {
               ajuste = 0
          } else {
               ajuste = parseFloat(req.body.ajuste)
          }

          if (projeto.investimento == '' || typeof projeto.investimento == 'undefined') {

               const invest = {
                    user: id,
                    parcelas: req.body.numpar,
                    txjuros: req.body.txjuros,
                    ipca: req.body.ipca,
               }
               const dime = {
                    user: id,
                    te: req.body.te,
                    tusd: req.body.tusd,
                    icms: req.body.icms,
                    pis: req.body.pis,
                    cofins: req.body.cofins,
                    cosip: req.body.cosip,
                    ajuste: ajuste,
                    consumo1: req.body.medcon,
                    consumo2: req.body.medcon,
                    consumo3: req.body.medcon,
                    consumo4: req.body.medcon,
                    consumo5: req.body.medcon,
                    consumo6: req.body.medcon,
                    consumo7: req.body.medcon,
                    consumo8: req.body.medcon,
                    consumo9: req.body.medcon,
                    consumo10: req.body.medcon,
                    consumo11: req.body.medcon,
                    consumo12: req.body.medcon,
                    totconsumo: req.body.medcon * 12
               }

               new Investimento(invest).save().then(() => {
                    new Dimensionamento(dime).save().then(() => {
                         Investimento.findOne().sort({ field: 'asc', _id: -1 }).then((investimento) => {
                              Dimensionamento.findOne().sort({ field: 'asc', _id: -1 }).then((dimensionamento) => {
                                   // //console.log('dimensionamento._id=>'+dimensionamento._id)
                                   // //console.log('investimento._id=>'+investimento._id)
                                   projeto.dimensionamento = dimensionamento._id
                                   projeto.investimento = investimento._id
                                   projeto.save().then(() => {
                                        //res.render('projeto/investimento', { sac, txjuros, numpar, valor, totpmt, totamort, totjuros, projeto, parmed, te, tusd, icms, pis, cofins, cosip, ipca, ajuste, medcon, dimensionamento, investimento })
                                        // //console.log('projeto salvo com sucesso.')
                                        res.redirect('/projeto/investimento/' + projeto._id)
                                   })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Falha ao encontrar o dimensionamento.')
                                   res.redirect('/projeto/investimento/' + projeto._id)
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Falha ao encontrar o investimento.')
                              res.redirect('/projeto/investimento/' + projeto._id)
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Falha ao salvar o dimensionamento.')
                         res.redirect('/projeto/investimento/' + projeto._id)
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Falha ao salvar o investimento.')
                    res.redirect('/projeto/investimento/' + projeto._id)
               })
          } else {
               // //console.log('encontrou')
               Investimento.findOne({ _id: projeto.investimento }).then((investimento) => {
                    Dimensionamento.findOne({ _id: projeto.dimensionamento }).then((dimensionamento) => {
                         investimento.parcelas = req.body.numpar
                         investimento.txjuros = req.body.txjuros
                         investimento.ipca = req.body.ipca
                         investimento.save().then(() => {
                              dimensionamento.te = req.body.te
                              dimensionamento.tusd = req.body.tusd
                              dimensionamento.icms = req.body.icms
                              dimensionamento.pis = req.body.pis
                              dimensionamento.cofins = req.body.cofins
                              dimensionamento.cosip = req.body.cosip
                              dimensionamento.ajuste = ajuste
                              dimensionamento.consumo1 = req.body.medcon
                              dimensionamento.consumo2 = req.body.medcon
                              dimensionamento.consumo3 = req.body.medcon
                              dimensionamento.consumo4 = req.body.medcon
                              dimensionamento.consumo5 = req.body.medcon
                              dimensionamento.consumo6 = req.body.medcon
                              dimensionamento.consumo7 = req.body.medcon
                              dimensionamento.consumo8 = req.body.medcon
                              dimensionamento.consumo9 = req.body.medcon
                              dimensionamento.consumo10 = req.body.medcon
                              dimensionamento.consumo11 = req.body.medcon
                              dimensionamento.consumo12 = req.body.medcon
                              dimensionamento.totconsumo = req.body.medcon * 12
                              dimensionamento.save().then(() => {
                                   // //console.log('salvou')
                                   //res.render('projeto/investimento', { sac, txjuros, numpar, valor, totpmt, totamort, totjuros, projeto, parmed, te, tusd, icms, pis, cofins, cosip, ipca, ajuste, medcon })
                                   res.redirect('/projeto/investimento/' + projeto._id)
                              }).catch((err) => {
                                   req.flash('error_msg', 'Falha ao salvar o dimensionamento.')
                                   res.redirect('/projeto/investimento/' + projeto._id)
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Falha ao salvar o investimento.')
                              res.redirect('/projeto/investimento/' + projeto._id)
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Falha ao encontrar o dimensionamento.')
                         res.redirect('/projeto/investimento/' + projeto._id)
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Falha ao encontrar o investimento.')
                    res.redirect('/projeto/investimento/' + projeto._id)
               })
          }
     }).catch((err) => {
          req.flash('error_msg', 'Falha ao encontrar o projeto.')
          res.redirect('/projeto/investimento/' + projeto._id)
     })

})

router.post('/salvarcustos/', ehAdmin, (req, res) => {
     var totint = 0
     var dias = 0
     Projeto.findOne({ _id: req.body.idprj }).then((projeto) => {
          Equipe.findOne({ projeto: req.body.idprj }).then((equipe) => {
               Cronograma.findOne({ projeto: req.body.idprj }).then((cronograma) => {
                    dias = (parseFloat(cronograma.agendaModFim) - parseFloat(cronograma.agendaAteIni)) + 1
                    //console.log('req.body.savecustoins=>' + req.body.savecustoins)
                    totint = (parseFloat(req.body.savecustoins) + parseFloat(req.body.savecustoele)) * dias
                    projeto.totint = totint
                    projeto.custoPlano = totint
                    projeto.diastr = dias
                    projeto.diasObra = dias
                    equipe.custoele = req.body.savecustoele
                    equipe.custoins = req.body.savecustoins
                    projeto.save().then(() => {
                         equipe.save().then(() => {
                              res.redirect('/projeto/alocacao/' + req.body.idprj)
                         }).catch((err) => {
                              req.flash('error_msg', 'Houve falha ao salvar a equipe.')
                              res.redirect('/projeto/alocacao/' + req.body.idprj)
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve falha ao salvar o projeto.')
                         res.redirect('/projeto/alocacao/' + req.body.idprj)
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve falha ao encontrar a equipe.')
                    res.redirect('/projeto/alocacao/' + req.body.idprj)
               })
          }).catch((err) => {
               req.flash('error_msg', 'Houve falha ao encontrar a equipe.')
               res.redirect('/projeto/alocacao/' + req.body.idprj)
          })
     }).catch((err) => {
          req.flash('error_msg', 'Houve falha ao encontrar o projeto.')
          res.redirect('/projeto/alocacao/' + req.body.idprj)
     })
})

router.post("/novo", ehAdmin, (req, res) => {
     const { _id } = req.user
     const { user } = req.user
     var id

     if (typeof user == 'undefined') {
          id = _id
     } else {
          id = user
     }
     var tipoprj = req.body.tipoprj
     var prj_id
     var typeGes = 'hidden'
     var checkHora = 'unchecked'
     var checkDia = 'unchecked'
     var typeHrg = 'hidden'
     var typeDrg = 'hidden'
     var displayHrs = 'none'
     var displayDia = 'none'
     var displayTda = 'none'
     var escopo = 'enabled'
     var cronograma = 'enabled'
     var comunicacao = 'enabled'
     var vistoria = 'enabled'
     var alocacao = 'enabled'
     var aquisicao = 'enabled'
     var mostraHora = false

     //Validação se o projeto já existe
     var nome = req.body.nome
     Projeto.findOne({ nome: nome, user: id }).then((projeto) => {
          prj_id = projeto._id

          if (!prj_id || typeof prj_id != undefined) {
               req.flash('error_msg', 'Projeto: ' + nome + ' já existe')
               res.redirect('/projeto/selectprojeto')
          }
     }).catch(() => {
          //console.log('projeto novo')
          var erros = []
          var erros_semdim = ''
          var sucesso = []
          var vlrequ = 0
          var vlrkit = 0

          var unidadeEqu = 0
          var unidadeMod = 0
          var unidadeInv = 0
          var unidadeEst = 0
          var unidadeCim = 0
          var unidadeCab = 0
          var unidadeEbt = 0
          var unidadeDisCC = 0
          var unidadeDPSCC = 0
          var unidadeDisCA = 0
          var unidadeDPSCA = 0
          var unidadeSB = 0
          var unidadeCCA = 0
          var unidadeOcp = 0
          var unidadeCer = 0
          var unidadeCen = 0
          var unidadePos = 0
          var vlrUniEqu = 0
          var vlrUniMod = 0
          var vlrUniInv = 0
          var vlrUniEst = 0
          var vlrUniCim = 0
          var vlrUniCab = 0
          var vlrUniEbt = 0
          var vlrUniDisCC = 0
          var vlrUniDPSCC = 0
          var vlrUniDisCA = 0
          var vlrUniDPSCA = 0
          var vlrUniSB = 0
          var vlrUniCCA = 0
          var vlrUniOcp = 0
          var vlrUniCer = 0
          var vlrUniCen = 0
          var vlrUniPos = 0
          var valorEqu = 0
          var valorMod = 0
          var valorInv = 0
          var valorEst = 0
          var valorCim = 0
          var valorCab = 0
          var valorEbt = 0
          var valorDisCC = 0
          var valorDPSCC = 0
          var valorDisCA = 0
          var valorDPSCA = 0
          var valorSB = 0
          var valorCCA = 0
          var valorOcp = 0
          var valorCer = 0
          var valorCen = 0
          var valorPos = 0

          var valorOcp = 0

          var checkUni = 'unckeched'

          //Valida valor Equipamento Detalhado
          if (req.body.valorEqu != '') {
               unidadeEqu = 0
               vlrUniEqu = 0
               valorEqu = req.body.valorEqu
          } else {
               if (req.body.unidadeEqu != '' && req.body.vlrUniEqu != '') {
                    unidadeEqu = req.body.unidadeEqu
                    vlrUniEqu = req.body.vlrUniEqu
                    valorEqu = parseFloat(unidadeEqu) * parseFloat(vlrUniEqu)
                    checkUni = 'checked'
               }
          }
          //Valida valor Módulo Detalhado
          //console.log('req.body.valorMod =>' + req.body.valorMod)
          if (req.body.valorMod != '') {
               unidadeMod = 0
               vlrUniMod = 0
               valorMod = req.body.valorMod
          } else {
               if (req.body.unidadeMod != '' && req.body.vlrUniMod != '') {
                    unidadeMod = req.body.unidadeMod
                    vlrUniMod = req.body.vlrUniMod
                    valorMod = parseFloat(unidadeMod) * parseFloat(vlrUniMod)
                    checkUni = 'checked'
               }
          }
          //console.log('unidadeMod=>' + unidadeMod)
          //console.log('vlrUniMod=>' + vlrUniMod)
          //console.log('valorMod=>' + valorMod)
          //Valida valor Inversor Detalhado
          if (req.body.valorInv != '') {
               unidadeInv = 0
               vlrUniInv = 0
               valorInv = req.body.valorInv
          } else {
               if (req.body.unidadeInv != '' && req.body.vlrUniInv != '') {
                    unidadeInv = req.body.unidadeInv
                    vlrUniInv = req.body.vlrUniInv
                    valorInv = parseFloat(unidadeInv) * parseFloat(vlrUniInv)
                    checkUni = 'checked'
               }
          }
          //Valida valor Estrutura Detalhado
          if (req.body.valorEst != '') {
               unidadeEst = 0
               vlrUniEst = 0
               valorEst = req.body.valorEst
          } else {
               if (req.body.unidadeEst != '' && req.body.vlrUniEst != '') {
                    unidadeEst = req.body.unidadeEst
                    vlrUniEst = req.body.vlrUniEst
                    valorEst = parseFloat(unidadeEst) * parseFloat(vlrUniEst)
                    checkUni = 'checked'
               }
          }
          //Valida valor Concretagem
          if (req.body.valorCim != '') {
               unidadeCim = 0
               vlrUniCim = 0
               valorCim = req.body.valorCim
          } else {
               if (req.body.unidadeCim != '' && req.body.vlrUniCim != '') {
                    unidadeCim = req.body.unidadeCim
                    vlrUniCim = req.body.vlrUniCim
                    valorCim = parseFloat(unidadeCim) * parseFloat(vlrUniCim)
                    checkUni = 'checked'
               }
          }
          //Valida valor Cabos Detalhado
          if (req.body.valorCab != '') {
               unidadeCab = 0
               vlrUniCab = 0
               valorCab = req.body.valorCab
          } else {
               if (req.body.unidadeCab != '' && req.body.vlrUniCab != '') {
                    unidadeCab = req.body.unidadeCab
                    vlrUniCab = req.body.vlrUniCab
                    valorCab = parseFloat(unidadeCab) * parseFloat(vlrUniCab)
                    checkUni = 'checked'
               }
          }
          //Valida valor Armazenagem Detalhado
          if (req.body.valorEbt != '') {
               unidadeEbt = 0
               vlrUniEbt = 0
               valorEbt = req.body.valorEbt
          } else {
               if (req.body.unidadeEbt != '' && req.body.vlrUniEbt != '') {
                    unidadeEbt = req.body.unidadeEbt
                    vlrUniEbt = req.body.vlrUniEbt
                    valorEbt = parseFloat(unidadeEbt) * parseFloat(vlrUniEbt)
                    checkEbt = 'checked'
               }
          }
          //Valida valor Disjuntores Detalhado
          if (req.body.valorDisCC != '') {
               unidadeDisCC = 0
               vlrUniDisCC = 0
               valorDisCC = req.body.valorDisCC
          } else {
               if (req.body.unidadeDisCC != '' && req.body.vlrUniDisCC != '') {
                    unidadeDisCC = req.body.unidadeDisCC
                    vlrUniDisCC = req.body.vlrUniDisCC
                    valorDisCC = parseFloat(unidadeDisCC) * parseFloat(vlrUniDisCC)
                    checkUni = 'checked'
               }
          }
          if (req.body.valorDisCA != '') {
               unidadeDisCA = 0
               vlrUniDisCA = 0
               valorDisCA = req.body.valorDisCA
          } else {
               if (req.body.unidadeDisCA != '' && req.body.vlrUniDisCA != '') {
                    unidadeDisCA = req.body.unidadeDisCA
                    vlrUniDisCA = req.body.vlrUniDisCA
                    valorDisCA = parseFloat(unidadeDisCA) * parseFloat(vlrUniDisCA)
                    checkUni = 'checked'
               }
          }
          //Valida valor DPS Detalhado
          if (req.body.valorDPSCC != '') {
               unidadeDPSCC = 0
               vlrUniDPSCC = 0
               valorDPSCC = req.body.valorDPSCC
          } else {
               if (req.body.unidadeDPSCC != '' && req.body.vlrUniDPSCC != '') {
                    unidadeDPSCC = req.body.unidadeDPSCC
                    vlrUniDPSCC = req.body.vlrUniDPSCC
                    valorDPSCC = parseFloat(unidadeDPSCC) * parseFloat(vlrUniDPSCC)
                    checkUni = 'checked'
               }
          }
          if (req.body.valorDPSCA != '') {
               unidadeDPSCA = 0
               vlrUniDPSCA = 0
               valorDPSCA = req.body.valorDPSCA
          } else {
               if (req.body.unidadeDPSCA != '' && req.body.vlrUniDPSCA != '') {
                    unidadeDPSCA = req.body.unidadeDPSCA
                    vlrUniDPSCA = req.body.vlrUniDPSCA
                    valorDPSCA = parseFloat(unidadeDPSCA) * parseFloat(vlrUniDPSCA)
                    checkUni = 'checked'
               }
          }
          //Valida valor StringBox Detalhado
          if (req.body.valorSB != '') {
               unidadeSB = 0
               vlrUniSB = 0
               valorSB = req.body.valorSB
          } else {
               if (req.body.unidadeSB != '' && req.body.vlrUniSB != '') {
                    unidadeSB = req.body.unidadeSB
                    vlrUniSB = req.body.vlrUniSB
                    valorSB = parseFloat(unidadeSB) * parseFloat(vlrUniSB)
                    checkUni = 'checked'
               }
          }
          //Valida valor Caixa Proteção CA Detalhado
          if (req.body.valorCCA != '') {
               unidadeCCA = 0
               vlrUniCCA = 0
               valorCCA = req.body.valorCCA
          } else {
               if (req.body.unidadeCCA != '' && req.body.vlrUniCCA != '') {
                    unidadeCCA = req.body.unidadeCCA
                    vlrUniCCA = req.body.vlrUniCCA
                    valorCCA = parseFloat(unidadeCCA) * parseFloat(vlrUniCCA)
                    checkUni = 'checked'
               }
          }
          //Valida valor Outros Componentes Detalhado
          if (req.body.valorOcp != '') {
               unidadeOcp = 0
               vlrUniOcp = 0
               valorOcp = req.body.valorOcp
          } else {
               if (req.body.unidadeOcp != '' && req.body.vlrUniOcp != '') {
                    unidadeOcp = req.body.unidadeOcp
                    vlrUniOcp = req.body.vlrUniOcp
                    valorOcp = parseFloat(unidadeOcp) * parseFloat(vlrUniOcp)
                    checkUni = 'checked'
               }
          }
          //Valida valor Cercamento Detalhado
          if (req.body.cercamento != null) {
               if (req.body.valorCer != '') {
                    unidadeCer = 0
                    vlrUniCer = 0
                    valorCer = req.body.valorCer
               } else {
                    if (req.body.unidadeCer != '' && req.body.vlrUniCer != '') {
                         unidadeCer = req.body.unidadeCer
                         vlrUniCer = req.body.vlrUniCer
                         valorCer = parseFloat(unidadeCer) * parseFloat(vlrUniCer)
                         checkUni = 'checked'
                    }
               }
          }
          //Valida valor Central Detalhado
          //console.log('req.body.unidadeCen=>'+req.body.unidadeCen)
          //console.log('req.body.vlrUniCen=>'+req.body.vlrUniCen)
          //console.log('req.body.valorCen=>'+req.body.valorCen)
          if (req.body.central != null) {
               if (req.body.valorCen != '') {
                    unidadeCen = 0
                    vlrUniCen = 0
                    valorCen = req.body.valorCen
               } else {
                    if (req.body.unidadeCen != '' && req.body.vlrUniCen != '') {
                         unidadeCen = req.body.unidadeCen
                         vlrUniCen = req.body.vlrUniCen
                         valorCen = parseFloat(unidadeCen) * parseFloat(vlrUniCen)
                         checkUni = 'checked'
                    }
               }
          }
          //console.log('unidadeCen=>'+unidadeCen)
          //console.log('vlrUniCen=>'+vlrUniCen)
          //console.log('valorCen=>'+valorCen)          
          //Valida valor Postes Detalhado
          if (req.body.poste != null) {
               if (req.body.valorPos != '') {
                    unidadePos = 0
                    vlrUniPos = 0
                    valorPos = req.body.valorPos
               } else {
                    if (req.body.unidadePos != '' && req.body.vlrUniPos != '') {
                         unidadePos = req.body.unidadePos
                         vlrUniPos = req.body.vlrUniPos
                         valorPos = parseFloat(unidadePos) * parseFloat(vlrUniPos)
                         checkUni = 'checked'
                    }
               }
          }

          //console.log('valorEqu=>'+valorEqu)
          //console.log('valorEst=>'+valorEst)
          //console.log('valorCim=>'+valorCim)
          //console.log('valorCer=>'+valorCer)
          //console.log('valorPos=>'+valorPos)
          //console.log('valorDisCC=>'+valorDisCC)
          //console.log('valorDPSCC=>'+valorDPSCC)
          //console.log('valorDisCA=>'+valorDisCA)
          //console.log('valorDPSCA=>'+valorDPSCA)          
          //console.log('valorCab=>'+valorCab)
          //console.log('valorOcp=>'+valorOcp)

          var vlrTotal = parseFloat(valorEqu) + parseFloat(valorMod) + parseFloat(valorInv) + parseFloat(valorEst) + parseFloat(valorCim) + parseFloat(valorCab) + parseFloat(valorEbt) + parseFloat(valorDisCC) + parseFloat(valorDPSCC) + parseFloat(valorDisCA) + parseFloat(valorDPSCA) + parseFloat(valorSB) + parseFloat(valorCCA) + parseFloat(valorOcp) + parseFloat(valorCer) + parseFloat(valorCen) + parseFloat(valorPos)

          //Valida valor do equipameento
          if (parseFloat(valorEqu) != 0 || parseFloat(valorMod) != 0) {
               vlrequ = vlrTotal
               vlrkit = parseFloat(valorEqu) + parseFloat(valorMod) + parseFloat(valorInv) + parseFloat(valorEst) + parseFloat(valorCim) + parseFloat(valorCab) + parseFloat(valorEbt) + parseFloat(valorDisCC) + parseFloat(valorDPSCC) + parseFloat(valorDisCA) + parseFloat(valorDPSCA) + parseFloat(valorSB) + parseFloat(valorCCA)
          } else {
               vlrequ = parseFloat(req.body.equipamento) + parseFloat(valorEst) + parseFloat(valorCim) + parseFloat(valorCab) + parseFloat(valorEbt) + parseFloat(valorDisCC) + parseFloat(valorDPSCC) + parseFloat(valorDisCA) + parseFloat(valorDPSCA) + parseFloat(valorSB) + parseFloat(valorCCA) + parseFloat(valorOcp) + parseFloat(valorCer) + parseFloat(valorCen) + parseFloat(valorPos)
               vlrkit = parseFloat(req.body.equipamento) + parseFloat(valorEst) + parseFloat(valorCim) + parseFloat(valorDisCC) + parseFloat(valorDPSCC) + parseFloat(valorDisCA) + parseFloat(valorDPSCA) + parseFloat(valorSB) + parseFloat(valorCCA) + parseFloat(valorCab) + parseFloat(valorEbt)
          }

          //console.log(vlrequ)
          /*
          valor = req.body.valor
          if (parseFloat(valor) == parseFloat(vlrequ) || parseFloat(valor) < parseFloat(vlrequ)) {
               erros.push({ texto: 'O valor do orçamento deve ser maior que o valor do equipamento.' })
          }
          */
          //console.log(req.body.dataini)
          //------------------------------------------------------------------
          if (req.body.dataprev == '') {
               erros.push({ texto: 'É necessário informar a data de previsão de entrega do projeto.' })
               erros_semdim = erros_semdim + 'É necessário informar a data de previsão de entrega do projeto.'
          }
          //console.log('req.body.id_dimensionamento=>' + req.body.id_dime)
          if (!req.body.id_dime) {
               // if ((req.body.potencia_dime == '' && validaCampos(req.body.potencia).length > 0) || validaCampos(req.body.nome).length > 0) {
                    if (req.body.potencia_dime == ''){
                    erros.push({ texto: 'O preenchimento dos campos de nome e potencia são obrigatórios.' })
                    erros_semdim = erros_semdim + 'O preenchimento dos campos de nome e potencia são obrigatórios.'
               }
          }
          //console.log('erros=>' + erros)
          //console.log('tipoprj=>' + tipoprj)
          if (erros.length > 0) {
               //console.log('encontrou erro')
               //console.log('id_prj=>' + req.body.id_prj)
               //console.log('id_dime=>' + req.body.id_dime)
               if (req.body.id_dime != '' && req.body.id_prj != '') {
                    //console.log('Já tem dimensionamento')
                    Projeto.findOne({ _id: req.body.id_prj }).lean().then((projeto) => {
                         //console.log('projeto=>' + projeto)
                         Dimensionamento.findOne({ _id: req.body.id_dime }).lean().then((dimensionamento) => {
                              //console.log('dimensionamento=>' + dimensionamento)
                              Empresa.find({ user: id }).lean().then((empresa) => {
                                   Configuracao.find({ user: id }).lean().then((configuracao) => {
                                        Pessoa.find({ ehVendedor: true, user: id }).lean().then((vendedor) => {
                                             Pessoa.find({ user: id, funges: 'checked' }).lean().then((responsavel) => {
                                                  Cliente.find({ user: id, sissolar: 'checked' }).lean().then((clientes) => {
                                                       res.render("projeto/addprojeto", { erros, empresa, projeto, dimensionamento, configuracao, responsavel, vendedor, clientes, troca_dim: 'checked' })
                                                  }).catch((err) => {
                                                       req.flash('error_msg', 'Houve um erro ao encontrar o cliente.')
                                                       res.redirect('/projeto/novo')
                                                  })
                                             }).catch((err) => {
                                                  req.flash('error_msg', 'Houve um erro ao encontrar um responsável.')
                                                  res.redirect('/projeto/novo')
                                             })
                                        }).catch((err) => {
                                             req.flash('error_msg', 'Houve um erro ao encontrar um vendedor.')
                                             res.redirect('/projeto/novo')
                                        })
                                   }).catch((err) => {
                                        req.flash('error_msg', 'Houve um erro ao encontrar a configuração.')
                                        res.redirect('/projeto/novo')
                                   })

                              }).catch((err) => {
                                   req.flash('error_msg', 'houve um erro ao encontrar a empresa.')
                                   res.redirect('/projeto/novo')
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Houve um erro interno<dimensionamento>.')
                              res.redirect('/projeto/novo')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve um erro interno<dimensionamento>.')
                         res.redirect('/projeto/novo')
                    })
               } else {
                    req.flash('error_msg', erros_semdim)
                    res.redirect('/projeto/novo')
               }

          } else {
               //Define variável booleana de acordo com o tipo do custo
               if (tipoprj == 1) {
                    ehVinculo = false

                    if (req.body.tipoEntrada == 'Terceirizado') {
                         tipoEntrada = true
                    } else {
                         tipoEntrada = false
                    }
               } else {
                    ehVinculo = true

               }
               //Validação de check box  
               var cercamento
               var central
               var poste
               var estsolo
               var armazenamento
               var painel

               if (req.body.cercamento != null) {
                    cercamento = 'checked'
               }
               if (req.body.central != null) {
                    central = 'checked'
               }
               if (req.body.poste != null) {
                    poste = 'checked'
               }
               if (req.body.estsolo != null) {
                    estsolo = 'checked'
               }
               if (req.body.armazenamento != null) {
                    armazenamento = 'checked'
               }
               if (req.body.painel != null) {
                    painel = 'checked'
               }
               //console.log('vlrNFS=>' + vlrNFS)
               var cidade = ''
               if (req.body.potencia != '' && req.body.potencia != 0) {
                    if (req.body.cidade != '') {
                         cidade = req.body.cidade
                    }
                    var uf = ''
                    if (req.body.uf != '') {
                         uf = req.body.uf
                    }
               }
               var percom
               Pessoa.findOne({ _id: req.body.vendedor }).then((vendedor) => {
                    percom = vendedor.percom
                    //console.log('percom=>' + percom)

                    var data = new Date()
                    var dia = data.getDate()
                    //console.log('dia=>' + dia)
                    if (dia < 10) {
                         dia = '0' + dia
                         //console.log('dia_novo=>' + dia)
                    }
                    var mes = parseFloat(data.getMonth()) + 1
                    //console.log('mes=>' + mes)
                    if (mes < 10) {
                         mes = '0' + mes
                         //console.log('mes_novo=>' + mes)
                    }
                    var ano = data.getFullYear()
                    var datareg = ano + mes + dia

                    //Definindo valor do projeto pelo markup
                    var valorProjeto = 0
                    var fatequ
                    var vlrNFS = 0
                    var tipoCustoGes
                    var tipoCustoPro
                    var tipoCustoIns
                    Empresa.findOne({ _id: req.body.empresa }).then((empresa) => {
                         Configuracao.findOne({ _id: req.body.configuracao }).then((config) => {
                              Cliente.findOne({ _id: req.body.cliente }).then((cliente) => {
                                   //console.log('config.id=>' + config._id)
                                   if (req.body.valor == '' || req.body.valor == 0 || req.body.valor == null) {
                                        //if (req.body.equipamento != '' || req.body.equipamento != 0) {
                                        //     valorProjeto = (parseFloat(req.body.equipamento) / (1 - (parseFloat(empresa.markup) / 100))).toFixed(2)
                                        //} else {
                                        valorProjeto = 0
                                        //}
                                   } else {
                                        valorProjeto = req.body.valor
                                   }
                                   //console.log('valorProjeto=>' + valorProjeto)
                                   if (req.body.checkFatura != null) {
                                        fatequ = true
                                        vlrNFS = valorProjeto
                                   } else {
                                        fatequ = false
                                        vlrNFS = parseFloat(valorProjeto) - parseFloat(vlrkit)
                                   }
                                   //console.log('cliente.nome=>' + cliente.nome)

                                   if (req.body.tipoCusto == 'hora') {
                                        tipoCustoGes = 'hora'
                                        tipoCustoPro = 'hora'
                                        tipoCustoIns = 'hora'
                                        checkHora = 'checked'
                                        displayHrs = 'inline'
                                        typeHrg = 'text'
                                        typeDrg = 'hidden'
                                        selecionado = 'hora'
                                   } else {
                                        tipoCustoGes = 'dia'
                                        tipoCustoPro = 'dia'
                                        tipoCustoIns = 'dia'
                                        checkDia = 'checked'
                                        typeGes = 'text'
                                        displayDia = 'inline'
                                        displayTda = 'inline'
                                        escopo = 'disabled'
                                        cronograma = 'disabled'
                                        comunicacao = 'disabled'
                                        vistoria = 'disabled'
                                        alocacao = 'disabled'
                                        aquisicao = 'disabled'
                                        mostraHora = false
                                        typeHrg = 'hidden'
                                        typeDrg = 'text'
                                        selecionado = 'dia'
                                   }

                                   var markup
                                   console.log('empresa.markup=>'+empresa.markup)
                                   if (req.body.valor != '') {
                                        markup = 0
                                   } else {
                                        markup = empresa.markup
                                   }

                                   var desc_escopo = ''
                                   if (tipoprj == 1) {
                                        desc_escopo = req.body.escopo
                                   } else {
                                        desc_escopo = ''
                                   }

                                   //console.log('desc_escopo=>' + desc_escopo)
                                   //console.log('req.body.id_dime=>' + req.body.id_dime)

                                   if (req.body.id_dime == '' || typeof req.body.id_dime == 'undefined') {
                                        //console.log('sem dimensionamento')
                                        var prj
                                        var corpo
                                        prj = {
                                             user: id,
                                             nome: req.body.nome,
                                             nomecliente: cliente.nome,
                                             endereco: req.body.endereco,
                                             configuracao: req.body.configuracao,
                                             markup: markup,
                                             grupoUsina: req.body.grupoUsina,
                                             tipoConexao: req.body.tipoConexao,
                                             classUsina: req.body.classUsina,
                                             tipoUsina: req.body.tipoUsina,
                                             tipoCustoGes: tipoCustoGes,
                                             tipoCustoPro: tipoCustoPro,
                                             tipoCustoIns: tipoCustoIns,
                                             cidade: req.body.cidade,
                                             uf: req.body.uf,
                                             valor: valorProjeto,
                                             vlrnormal: valorProjeto,
                                             data: dia + '/' + mes + '/' + ano,
                                             datareg: datareg,
                                             potencia: req.body.potencia,
                                             ehDireto: tipoEntrada,
                                             ehVinculo: ehVinculo,
                                             vlrequ: vlrequ,
                                             vlrkit: vlrkit,
                                             fatequ: fatequ,
                                             vlrNFS: vlrNFS,
                                             percom: percom,
                                             vendedor: req.body.vendedor,
                                             empresa: req.body.empresa,
                                             cliente: req.body.cliente,
                                             temCercamento: cercamento,
                                             temCentral: central,
                                             temPosteCond: poste,
                                             temEstSolo: estsolo,
                                             temArmazenamento: armazenamento,
                                             temPainel: painel,
                                             escopo: desc_escopo,
                                             vrskwp: (parseFloat(valorProjeto) / parseFloat(req.body.potencia)).toFixed(2),
                                             dataini: req.body.dataini,
                                             valDataIni: req.body.valDataIni,
                                             dataprev: req.body.dataprev,
                                             valDataPrev: req.body.valDataPrev,
                                             dataord: req.body.dataord,
                                             foiRealizado: false,
                                             executando: false,
                                             parado: false,
                                             orcado: true,
                                        }

                                        if (tipoprj == 2) {
                                             var funres
                                             funres = { funres: req.body.responsavel }
                                             corpo = Object.assign(prj, funres)
                                        } else {
                                             corpo = prj
                                        }

                                        //console.log(corpo)
                                        new Projeto(corpo).save().then(() => {
                                             //console.log('salvou projeto')
                                             Projeto.findOne({ user: id }).sort({ field: 'asc', _id: -1 }).lean().then((projeto) => {
                                                  // Projeto.find().limit(1).sort({$_id: -1}).lean().then((projeto) => {
                                                  //console.log('projeto=>' + projeto)
                                                  //console.log('projeto._id=>' + projeto._id)
                                                  Empresa.findOne({ _id: projeto.empresa }).lean().then((rp) => {
                                                       Pessoa.find({ vendedor: true, user: id }).lean().then((vendedor) => {
                                                            // //console.log('vlrTotal=>' + vlrequ)
                                                            // //console.log('checkUni=>' + checkUni)
                                                            // //console.log('unidadeEqu=>' + unidadeEqu)
                                                            // //console.log('unidadeMod=>' + unidadeMod)
                                                            // //console.log('unidadeInv=>' + unidadeInv)
                                                            // //console.log('unidadeEst=>' + unidadeEst)
                                                            // //console.log('unidadeCab=>' + unidadeCab)
                                                            // //console.log('unidadeDisCA=>' + unidadeDisCA)
                                                            // //console.log('unidadeDisCC=>' + unidadeDisCC)
                                                            // //console.log('unidadeDPSCA=>' + unidadeDPSCA)
                                                            // //console.log('unidadeDPSCC=>' + unidadeDPSCC)
                                                            // //console.log('unidadeSB=>' + unidadeSB)
                                                            // //console.log('unidadeCer=>' + unidadeCer)
                                                            // //console.log('unidadeCen=>' + unidadeCen)
                                                            // //console.log('unidadePos=>' + unidadePos)
                                                            // //console.log('unidadeOcp=>' + unidadeOcp)
                                                            // //console.log('vlrUniEqu=>' + vlrUniEqu)
                                                            // //console.log('vlrUniMod=>' + vlrUniMod)
                                                            // //console.log('vlrUniInv=>' + vlrUniInv)
                                                            // //console.log('vlrUniEst=>' + vlrUniEst)
                                                            // //console.log('vlrUniCab=>' + vlrUniCab)
                                                            // //console.log('vlrUniDisCA=>' + vlrUniDisCA)
                                                            // //console.log('vlrUniDisCC=>' + vlrUniDisCC)
                                                            // //console.log('vlrUniDPSCA=>' + vlrUniDPSCA)
                                                            // //console.log('vlrUniDPSCC=>' + vlrUniDPSCC)
                                                            // //console.log('vlrUniSB=>' + vlrUniSB)
                                                            // //console.log('vlrUniCer=>' + vlrUniCer)
                                                            // //console.log('vlrUniCen=>' + vlrUniCen)
                                                            // //console.log('vlrUniPos=>' + vlrUniPos)
                                                            // //console.log('vlrUniOcp=>' + vlrUniOcp)
                                                            // //console.log('valorEqu=>' + valorEqu)
                                                            // //console.log('valorMod=>' + valorMod)
                                                            // //console.log('valorInv=>' + valorInv)
                                                            // //console.log('valorEst=>' + valorEst)
                                                            // //console.log('valorCim=>' + valorCim)
                                                            // //console.log('valorCab=>' + valorCab)
                                                            // //console.log('valorDisCC=>' + valorDisCC)
                                                            // //console.log('valorDPSCC=>' + valorDPSCC)
                                                            // //console.log('valorDisCA=>' + valorDisCA)
                                                            // //console.log('valorDPSCA=>' + valorDPSCA)                                                       
                                                            // //console.log('valorSB=>' + valorSB)
                                                            // //console.log('valorCCA=>' + valorCCA)
                                                            // //console.log('valorCer=>' + valorCer)
                                                            // //console.log('valorCen=>' + valorCen)
                                                            // //console.log('valorPos=>' + valorPos)
                                                            // //console.log('valorOcp=>' + valorOcp)

                                                            const detalhado = {
                                                                 projeto: projeto._id,
                                                                 vlrTotal: vlrequ,
                                                                 checkUni: checkUni,
                                                                 unidadeEqu: unidadeEqu,
                                                                 unidadeMod: unidadeMod,
                                                                 unidadeInv: unidadeInv,
                                                                 unidadeEst: unidadeEst,
                                                                 unidadeCim: unidadeCim,
                                                                 unidadeCab: unidadeCab,
                                                                 unidadeEbt: unidadeEbt,
                                                                 unidadeDisCC: unidadeDisCC,
                                                                 unidadeDPSCC: unidadeDPSCC,
                                                                 unidadeDisCA: unidadeDisCA,
                                                                 unidadeDPSCA: unidadeDPSCA,
                                                                 unidadeSB: unidadeSB,
                                                                 unidadeCCA: unidadeCCA,
                                                                 unidadeCer: unidadeCer,
                                                                 unidadeCen: unidadeCen,
                                                                 unidadePos: unidadePos,
                                                                 unidadeOcp: unidadeOcp,
                                                                 vlrUniEqu: vlrUniEqu,
                                                                 vlrUniMod: vlrUniMod,
                                                                 vlrUniInv: vlrUniInv,
                                                                 vlrUniEst: vlrUniEst,
                                                                 vlrUniCim: vlrUniCim,
                                                                 vlrUniCab: vlrUniCab,
                                                                 vlrUniEbt: vlrUniEbt,
                                                                 vlrUniDisCC: vlrUniDisCC,
                                                                 vlrUniDPSCC: vlrUniDPSCC,
                                                                 vlrUniDisCA: vlrUniDisCA,
                                                                 vlrUniDPSCA: vlrUniDPSCA,
                                                                 vlrUniSB: vlrUniSB,
                                                                 vlrUniCCA: vlrUniCCA,
                                                                 vlrUniCer: vlrUniCer,
                                                                 vlrUniCen: vlrUniCen,
                                                                 vlrUniPos: vlrUniPos,
                                                                 vlrUniOcp: vlrUniOcp,
                                                                 valorEqu: valorEqu,
                                                                 valorMod: valorMod,
                                                                 valorInv: valorInv,
                                                                 valorEst: valorEst,
                                                                 valorCim: valorCim,
                                                                 valorCab: valorCab,
                                                                 valorEbt: valorEbt,
                                                                 valorDisCC: valorDisCC,
                                                                 valorDPSCC: valorDPSCC,
                                                                 valorDisCA: valorDisCA,
                                                                 valorDPSCA: valorDPSCA,
                                                                 valorSB: valorSB,
                                                                 valorCCA: valorCCA,
                                                                 valorCer: valorCer,
                                                                 valorCen: valorCen,
                                                                 valorPos: valorPos,
                                                                 valorOcp: valorOcp
                                                            }
                                                            new Detalhado(detalhado).save().then(() => {
                                                                 //console.log('salvou detalhado')

                                                                 var cronograma_novo = {
                                                                      user: id,
                                                                      projeto: projeto._id,
                                                                      nome: projeto.nome,
                                                                      dateplaini: req.body.valDataIni,
                                                                      dateentrega: req.body.valDataPrev,
                                                                 }
                                                                 new Cronograma(cronograma_novo).save().then(() => {
                                                                      //console.log('salvou cronograma')
                                                                      Configuracao.findOne({ _id: req.body.configuracao }).lean().then((configuracao) => {
                                                                           Cliente.findOne({ _id: req.body.cliente }).lean().then((cliente) => {
                                                                                Pessoa.findOne({ _id: req.body.gestor }).lean().then((gestao) => {
                                                                                     //console.log('salva pessoa')
                                                                                     sucesso.push({ texto: 'Projeto criado com sucesso.' })
                                                                                     var fatura
                                                                                     if (req.body.checkFatura != null) {
                                                                                          fatura = 'checked'
                                                                                     } else {
                                                                                          fatura = 'uncheked'
                                                                                     }
                                                                                     Detalhado.findOne().sort({ field: 'asc', _id: -1 }).then((detalhe) => {
                                                                                          var plaQtdMod = 0
                                                                                          var plaQtdInv = 0
                                                                                          var plaQtdEst = 0
                                                                                          if (detalhe.unidademod == '' || typeof detalhe.unidademod == 'undefined') {
                                                                                               plaQtdMod = 0
                                                                                          } else {
                                                                                               plaQtdMod = detalhe.unidademod
                                                                                          }
                                                                                          if (detalhe.unidadeinv == '' || typeof detalhe.unidadeinv == 'undefined') {
                                                                                               plaQtdInv = 0
                                                                                          } else {
                                                                                               plaQtdInv = detalhe.unidadeinv
                                                                                          }
                                                                                          if (detalhe.unidadeest == '' || typeof detalhe.unidadeest == 'undefined') {
                                                                                               plaQtdEst = 0
                                                                                          } else {
                                                                                               plaQtdEst = detalhe.unidadeest
                                                                                          }
                                                                                          const proposta1 = {
                                                                                               user: id,
                                                                                               cliente: req.body.cliente,
                                                                                               dtcadastro1: String(req.body.valDataIni),
                                                                                               dtvalidade1: setData(req.body.valDataIni, 14),
                                                                                               data: dataBusca(dataHoje()),
                                                                                               feito: true,
                                                                                               ganho: false,
                                                                                               assinado: false,
                                                                                               encerrado: false
                                                                                          }
                                                                                          new Proposta(proposta1).save().then(() => {
                                                                                               Proposta.findOne().sort({ field: 'asc', _id: -1 }).then((nova_proposta) => {
                                                                                                    //console.log('projeto._id=>' + projeto._id)
                                                                                                    Projeto.findOne({ _id: projeto._id }).then((prj_pro) => {
                                                                                                         //console.log('prj_pro._id=>' + prj_pro._id)
                                                                                                         //console.log('nova_proposta._id=>' + nova_proposta._id)
                                                                                                         prj_pro.proposta = nova_proposta._id
                                                                                                         prj_pro.save().then(() => {
                                                                                                              //console.log('prj_pro salvo')
                                                                                                              //console.log('nova_proposta.cliente=>' + nova_proposta.cliente)
                                                                                                              Cliente.findOne({ _id: nova_proposta.cliente }).then((cliente) => {
                                                                                                                   new Equipe({
                                                                                                                        user: id,
                                                                                                                        projeto: prj_pro._id,
                                                                                                                        user: id,
                                                                                                                        nome_projeto: cliente.nome,
                                                                                                                        dtinicio: '0000-00-00',
                                                                                                                        dtfim: '0000-00-00',
                                                                                                                        feito: false
                                                                                                                   }).save().then(() => {
                                                                                                                        //console.log('salvar equipe')
                                                                                                                        Equipe.findOne().sort({ field: 'asc', _id: -1 }).then((nova_equipe) => {
                                                                                                                             nova_proposta.equipe = nova_equipe._id
                                                                                                                             nova_proposta.save().then(() => {
                                                                                                                                  new Vistoria({
                                                                                                                                       user: id,
                                                                                                                                       projeto: prj_pro._id,
                                                                                                                                       plaQtdMod: plaQtdMod,
                                                                                                                                       plaQtdInv: plaQtdInv,
                                                                                                                                       plaQtdEst: plaQtdEst,
                                                                                                                                       plaWattMod: 0,
                                                                                                                                       plaKwpInv: 0,
                                                                                                                                       plaDimArea: 0,
                                                                                                                                       plaQtdString: 0,
                                                                                                                                       plaModString: 0,
                                                                                                                                       plaQtdEst: 0,
                                                                                                                                       proposta: nova_proposta._id,
                                                                                                                                       feito: false
                                                                                                                                  }).save().then(() => {
                                                                                                                                       //console.log('salvar vistoria')
                                                                                                                                       new Compra({
                                                                                                                                            user: id,
                                                                                                                                            proposta: nova_proposta._id,
                                                                                                                                            feitopedido: false,
                                                                                                                                            feitonota: false
                                                                                                                                       }).save().then(() => {
                                                                                                                                            //console.log('salvar compra')
                                                                                                                                            new Documento({
                                                                                                                                                 user: id,
                                                                                                                                                 proposta: nova_proposta._id,
                                                                                                                                                 feitotrt: false,
                                                                                                                                                 feitoprotocolado: false,
                                                                                                                                                 feitoaceite: false,
                                                                                                                                                 feitoalmox: false,
                                                                                                                                                 feitofaturado: false,
                                                                                                                                                 enviaalmox: false
                                                                                                                                            }).save(() => {
                                                                                                                                                 //console.log('salvar documento')
                                                                                                                                                 new Posvenda({
                                                                                                                                                      user: id,
                                                                                                                                                      proposta: nova_proposta._id,
                                                                                                                                                      feito: false
                                                                                                                                                 }).save(() => {
                                                                                                                                                      //console.log('projeto._id=>' + projeto._id)
                                                                                                                                                      //console.log('prj_pro._id=>' + prj_pro._id)
                                                                                                                                                      if (tipoprj == 1) {
                                                                                                                                                           if (req.body.tipoEntrada == 'Proprio') {
                                                                                                                                                                res.render("projeto/customdo/gestao", {
                                                                                                                                                                     projeto, sucesso, configuracao, gestao, cliente, checkHora,
                                                                                                                                                                     typeHrg, displayHrs, mostraHora, typeGes, checkDia, displayTda, escopo, cronograma, comunicacao,
                                                                                                                                                                     vistoria, alocacao, aquisicao, typeDrg, displayDia, selecionado
                                                                                                                                                                })
                                                                                                                                                           } else {
                                                                                                                                                                res.render('projeto/custosdiretos', {
                                                                                                                                                                     projeto, sucesso, configuracao, rp, vendedor, cliente, fatura, checkHora,
                                                                                                                                                                     typeHrg, displayHrs, mostraHora, typeGes, checkDia, displayTda, escopo, cronograma, comunicacao,
                                                                                                                                                                })
                                                                                                                                                           }
                                                                                                                                                      } else {
                                                                                                                                                           // //console.log('projeto.configuracao=>' + projeto.configuracao)
                                                                                                                                                           // //console.log('projeto.empresa=>' + projeto.empresa)
                                                                                                                                                           // //console.log('projeto.vendedor=>' + projeto.vendedor)
                                                                                                                                                           // //console.log('projeto.funres=>' + projeto.funres)
                                                                                                                                                           Configuracao.findOne({ _id: projeto.configuracao }).lean().then((config) => {
                                                                                                                                                                Empresa.findOne({ _id: projeto.empresa }).lean().then((rp) => {
                                                                                                                                                                     Pessoa.findOne({ _id: projeto.vendedor }).lean().then((pv) => {
                                                                                                                                                                          Pessoa.findOne({ _id: projeto.funres }).lean().then((pr) => {
                                                                                                                                                                               Cliente.findOne({ _id: projeto.cliente }).lean().then((cli) => {
                                                                                                                                                                                    //console.log('config=>' + config)
                                                                                                                                                                                    //console.log('rp=>' + rp)
                                                                                                                                                                                    //console.log('pv=>' + pv)
                                                                                                                                                                                    //console.log('pr=>' + pr)
                                                                                                                                                                                    //console.log('cli=>' + cli)
                                                                                                                                                                                    res.render('projeto/projetodia', {
                                                                                                                                                                                         projeto, sucesso, fatura, checkHora, config, rp, pv, pr, cli,
                                                                                                                                                                                         typeHrg, displayHrs, mostraHora, typeGes, checkDia, displayTda, escopo, cronograma, comunicacao
                                                                                                                                                                                    })
                                                                                                                                                                               }).catch((err) => {
                                                                                                                                                                                    req.flash('error_msg', 'Houve uma falha ao encontrar o cliente.')
                                                                                                                                                                                    res.redirect('/pessoa/consulta')
                                                                                                                                                                               })
                                                                                                                                                                          }).catch((err) => {
                                                                                                                                                                               req.flash('error_msg', 'Houve uma falha ao encontrar o responsável.')
                                                                                                                                                                               res.redirect('/pessoa/consulta')
                                                                                                                                                                          })
                                                                                                                                                                     }).catch((err) => {
                                                                                                                                                                          req.flash('error_msg', 'Houve uma falha ao encontrar o vendedor.')
                                                                                                                                                                          res.redirect('/pessoa/consulta')
                                                                                                                                                                     })
                                                                                                                                                                }).catch((err) => {
                                                                                                                                                                     req.flash('error_msg', 'Houve uma falha ao encontrar a empresa.')
                                                                                                                                                                     res.redirect('/configuracao/consulta')
                                                                                                                                                                })
                                                                                                                                                           }).catch((err) => {
                                                                                                                                                                req.flash('error_msg', 'Houve uma falha ao encontrar a configuração.')
                                                                                                                                                                res.redirect('/configuracao/consulta')
                                                                                                                                                           })
                                                                                                                                                      }
                                                                                                                                                 })
                                                                                                                                            })
                                                                                                                                       }).catch((err) => {
                                                                                                                                            req.flash('error_msg', 'Houve um erro ao salvar a compra.')
                                                                                                                                            res.redirect('/menu')
                                                                                                                                       })
                                                                                                                                  }).catch((err) => {
                                                                                                                                       req.flash('error_msg', 'Houve um erro ao salvar a vistoria.')
                                                                                                                                       res.redirect('/menu')
                                                                                                                                  })

                                                                                                                             }).catch((err) => {
                                                                                                                                  req.flash('error_msg', 'Houve um erro ao salvar a proposta.')
                                                                                                                                  res.redirect('/menu')
                                                                                                                             })
                                                                                                                        }).catch((err) => {
                                                                                                                             req.flash('error_msg', 'Houve um erro ao salvar a equipe.')
                                                                                                                             res.redirect('/menu')
                                                                                                                        })
                                                                                                                   }).catch((err) => {
                                                                                                                        req.flash('error_msg', 'Houve um erro ao salvar a equipe.')
                                                                                                                        res.redirect('/menu')
                                                                                                                   })
                                                                                                              }).catch((err) => {
                                                                                                                   req.flash('error_msg', 'Houve um erro ao encontrar o cliente.')
                                                                                                                   res.redirect('/menu')
                                                                                                              })
                                                                                                         }).catch((err) => {
                                                                                                              req.flash('error_msg', 'Houve um erro ao salvar o projeto.')
                                                                                                              res.redirect('/menu')
                                                                                                         })
                                                                                                    }).catch((err) => {
                                                                                                         req.flash('error_msg', 'Houve um erro ao encontrar o projeto.')
                                                                                                         res.redirect('/menu')
                                                                                                    })
                                                                                               }).catch((err) => {
                                                                                                    req.flash('error_msg', 'Houve um erro ao encontrar a proposta.')
                                                                                                    res.redirect('/menu')
                                                                                               })
                                                                                          }).catch((err) => {
                                                                                               req.flash('error_msg', 'Houve um erro ao salvar a proposta.')
                                                                                               res.redirect('/menu')
                                                                                          })
                                                                                     }).catch(() => {
                                                                                          req.flash('error_msg', 'Houve um erro ao encontrar os detalhes.')
                                                                                          res.redirect('/menu')
                                                                                     })
                                                                                     //console.log('fatura=>' + fatura)
                                                                                }).catch(() => {
                                                                                     req.flash('error_msg', 'Houve um erro ao encontrar o gestor.')
                                                                                     res.redirect('/menu')
                                                                                })
                                                                           }).catch(() => {
                                                                                req.flash('error_msg', 'Houve um erro ao encontrar o cliente.')
                                                                                res.redirect('/menu')
                                                                           })
                                                                      }).catch(() => {
                                                                           req.flash('error_msg', 'Houve um erro ao encontrar os detalhes de custos do projeto.')
                                                                           res.redirect('/menu')
                                                                      })
                                                                 }).catch(() => {
                                                                      req.flash('error_msg', 'Houve um erro ao salvar o cronograma.')
                                                                      res.redirect('/menu')
                                                                 })
                                                            }).catch(() => {
                                                                 req.flash('error_msg', 'Houve um erro ao salvar os detalhes de custos do projeto.')
                                                                 res.redirect('/menu')
                                                            })

                                                       }).catch((err) => {
                                                            req.flash('error_msg', 'Houve uma falha ao encontrar um vendedor<detalhe>.')
                                                            res.redirect('/pessoa/consulta')
                                                       })
                                                  }).catch((err) => {
                                                       req.flash('error_msg', 'Ocorreu um erro interno<Configuracao>.')
                                                       res.redirect('/menu')
                                                  })
                                             }).catch((err) => {
                                                  req.flash('error_msg', 'Nenhum projeto encontrado.')
                                                  res.redirect('/menu')
                                             })
                                        }).catch(() => {
                                             req.flash('error_msg', 'Houve um erro ao criar o projeto.')
                                             res.redirect('/menu')
                                        })
                                   } else {
                                        //console.log('req.body.id_prj=>' + req.body.id_prj)
                                        Projeto.findOne({ _id: req.body.id_prj }).then((projeto) => {
                                             //console.log('com dimensionamento')
                                             projeto.nome = req.body.nome
                                             //console.log('cliente.nome=>' + cliente.nome)
                                             projeto.nomecliente = cliente.nome
                                             projeto.configuracao = req.body.configuracao
                                             projeto.markup = empresa.markup
                                             projeto.grupoUsina = req.body.grupoUsina
                                             projeto.tipoConexao = req.body.tipoConexao
                                             projeto.classUsina = req.body.classUsina
                                             projeto.tipoUsina = req.body.tipoUsina
                                             //console.log('tipoCustoGes=>' + tipoCustoGes)
                                             projeto.tipoCustoGes = tipoCustoGes
                                             //console.log('tipoCustoPro=>' + tipoCustoPro)
                                             projeto.tipoCustoPro = tipoCustoPro
                                             //console.log('tipoCustoIns=>' + tipoCustoIns)
                                             projeto.tipoCustoIns = tipoCustoIns
                                             //console.log('valorProjeto=>' + valorProjeto)
                                             projeto.valor = valorProjeto
                                             projeto.vlrnormal = valorProjeto
                                             projeto.data = dia + '/' + mes + '/' + ano
                                             projeto.datareg = datareg
                                             projeto.ehDireto = tipoEntrada
                                             projeto.ehVinculo = ehVinculo
                                             projeto.vlrequ = vlrequ
                                             projeto.vlrkit = vlrkit
                                             projeto.fatequ = fatequ
                                             projeto.vlrNFS = vlrNFS
                                             projeto.percom = percom
                                             projeto.vendedor = req.body.vendedor
                                             projeto.empresa = req.body.empresa
                                             projeto.cliente = req.body.cliente
                                             projeto.temCercamento = cercamento
                                             projeto.temCentral = central
                                             projeto.temPosteCond = poste
                                             projeto.temEstSolo = estsolo
                                             projeto.temArmazenamento = armazenamento
                                             projeto.temPainel = painel
                                             projeto.escopo = req.body.escopo
                                             projeto.vrskwp = (parseFloat(valorProjeto) / parseFloat(projeto.potencia)).toFixed(2)
                                             projeto.dataini = req.body.dataini
                                             projeto.valDataIni = req.body.valDataIni
                                             projeto.dataprev = req.body.dataprev
                                             projeto.valDataPrev = req.body.valDataPrev
                                             projeto.dataord = req.body.dataord
                                             projeto.foiRealizado = false
                                             projeto.executando = false
                                             projeto.parado = false
                                             projeto.orcado = true
                                             projeto.save().then(() => {
                                                  Projeto.findOne().sort({ field: 'asc', _id: -1 }).lean().then((projeto) => {
                                                       Empresa.findOne({ _id: projeto.empresa }).lean().then((rp) => {
                                                            Pessoa.find({ vendedor: true, user: id }).lean().then((vendedor) => {
                                                                 const detalhado = {
                                                                      projeto: projeto._id,
                                                                      vlrTotal: vlrequ,
                                                                      checkUni: checkUni,
                                                                      unidadeEqu: unidadeEqu,
                                                                      unidadeMod: unidadeMod,
                                                                      unidadeInv: unidadeInv,
                                                                      unidadeEst: unidadeEst,
                                                                      unidadeCim: unidadeCim,
                                                                      unidadeCab: unidadeCab,
                                                                      unidadeEbt: unidadeEbt,
                                                                      unidadeDisCC: unidadeDisCC,
                                                                      unidadeDPSCC: unidadeDPSCC,
                                                                      unidadeDisCA: unidadeDisCA,
                                                                      unidadeDPSCA: unidadeDPSCA,
                                                                      unidadeSB: unidadeSB,
                                                                      unidadeCCA: unidadeCCA,
                                                                      unidadeCer: unidadeCer,
                                                                      unidadeCen: unidadeCen,
                                                                      unidadePos: unidadePos,
                                                                      unidadeOcp: unidadeOcp,
                                                                      vlrUniEqu: vlrUniEqu,
                                                                      vlrUniMod: vlrUniMod,
                                                                      vlrUniInv: vlrUniInv,
                                                                      vlrUniEst: vlrUniEst,
                                                                      vlrUniCim: vlrUniCim,
                                                                      vlrUniCab: vlrUniCab,
                                                                      vlrUniEbt: vlrUniEbt,
                                                                      vlrUniDisCC: vlrUniDisCC,
                                                                      vlrUniDPSCC: vlrUniDPSCC,
                                                                      vlrUniDisCA: vlrUniDisCA,
                                                                      vlrUniDPSCA: vlrUniDPSCA,
                                                                      vlrUniSB: vlrUniSB,
                                                                      vlrUniCCA: vlrUniCCA,
                                                                      vlrUniCer: vlrUniCer,
                                                                      vlrUniCen: vlrUniCen,
                                                                      vlrUniPos: vlrUniPos,
                                                                      vlrUniOcp: vlrUniOcp,
                                                                      valorEqu: valorEqu,
                                                                      valorMod: valorMod,
                                                                      valorInv: valorInv,
                                                                      valorEst: valorEst,
                                                                      valorCim: valorCim,
                                                                      valorCab: valorCab,
                                                                      valorEbt: valorEbt,
                                                                      valorDisCC: valorDisCC,
                                                                      valorDPSCC: valorDPSCC,
                                                                      valorDisCA: valorDisCA,
                                                                      valorDPSCA: valorDPSCA,
                                                                      valorSB: valorSB,
                                                                      valorCCA: valorCCA,
                                                                      valorCer: valorCer,
                                                                      valorCen: valorCen,
                                                                      valorPos: valorPos,
                                                                      valorOcp: valorOcp
                                                                 }
                                                                 new Detalhado(detalhado).save().then(() => {

                                                                      var cronograma_novo = {
                                                                           user: id,
                                                                           projeto: projeto._id,
                                                                           nome: projeto.nome,
                                                                           dateplaini: req.body.valDataIni,
                                                                           dateentrega: req.body.valDataPrev,
                                                                      }
                                                                      new Cronograma(cronograma_novo).save().then(() => {
                                                                           Configuracao.findOne({ _id: req.body.configuracao }).lean().then((configuracao) => {
                                                                                Cliente.findOne({ _id: req.body.cliente }).lean().then((cliente) => {
                                                                                     Pessoa.findOne({ _id: req.body.gestor }).lean().then((gestao) => {
                                                                                          //console.log('salva pessoa')
                                                                                          const proposta1 = {
                                                                                               user: id,
                                                                                               cliente: req.body.cliente,
                                                                                               dtcadastro1: String(req.body.valDataIni),
                                                                                               dtvalidade1: setData(req.body.valDataIni, 14),
                                                                                               data: dataBusca(dataHoje()),
                                                                                               feito: true,
                                                                                               ganho: false,
                                                                                               assinado: false,
                                                                                               encerrado: false
                                                                                          }
                                                                                          new Proposta(proposta1).save().then(() => {
                                                                                               Proposta.findOne().sort({ field: 'asc', _id: -1 }).then((nova_proposta) => {
                                                                                                    Projeto.findOne({ _id: projeto._id }).then((prj_pro) => {
                                                                                                         prj_pro.proposta = nova_proposta._id
                                                                                                         prj_pro.save().then(() => {
                                                                                                              Cliente.findOne({ _id: nova_proposta.cliente }).then((cliente) => {
                                                                                                                   new Equipe({
                                                                                                                        user: id,
                                                                                                                        projeto: projeto._id,
                                                                                                                        user: id,
                                                                                                                        nome_projeto: cliente.nome,
                                                                                                                        dtinicio: '0000-00-00',
                                                                                                                        dtfim: '0000-00-00',
                                                                                                                        feito: false
                                                                                                                   }).save().then(() => {
                                                                                                                        Equipe.findOne().sort({ field: 'asc', _id: -1 }).then((nova_equipe) => {
                                                                                                                             //console.log('nova_proposta._id=>' + nova_proposta._id)
                                                                                                                             //console.log('nova_equipe._id=>' + nova_equipe._id)
                                                                                                                             nova_proposta.equipe = nova_equipe._id
                                                                                                                             nova_proposta.save().then(() => {
                                                                                                                                  new Vistoria({
                                                                                                                                       user: id,
                                                                                                                                       projeto: projeto._id,
                                                                                                                                       plaQtdMod: plaQtdMod,
                                                                                                                                       plaQtdInv: plaQtdInv,
                                                                                                                                       plaQtdEst: plaQtdEst,
                                                                                                                                       plaWattMod: 0,
                                                                                                                                       plaKwpInv: 0,
                                                                                                                                       plaDimArea: 0,
                                                                                                                                       plaQtdString: 0,
                                                                                                                                       plaModString: 0,
                                                                                                                                       plaQtdEst: 0,
                                                                                                                                       proposta: nova_proposta._id,
                                                                                                                                       feito: false
                                                                                                                                  }).save().then(() => {
                                                                                                                                       new Compra({
                                                                                                                                            user: id,
                                                                                                                                            proposta: nova_proposta._id,
                                                                                                                                            feitopedido: false,
                                                                                                                                            feitonota: false
                                                                                                                                       }).save().then(() => {
                                                                                                                                            new Documento({
                                                                                                                                                 user: id,
                                                                                                                                                 proposta: nova_proposta._id,
                                                                                                                                                 feitotrt: false,
                                                                                                                                                 feitoprotocolado: false,
                                                                                                                                                 feitoaceite: false,
                                                                                                                                                 feitoalmox: false,
                                                                                                                                                 feitofaturado: false,
                                                                                                                                                 enviaalmox: false
                                                                                                                                            }).save(() => {
                                                                                                                                                 new Posvenda({
                                                                                                                                                      user: id,
                                                                                                                                                      proposta: nova_proposta._id,
                                                                                                                                                      feito: false
                                                                                                                                                 }).save(() => {
                                                                                                                                                      sucesso.push({ texto: 'Projeto criado com sucesso.' })
                                                                                                                                                      var fatura
                                                                                                                                                      if (req.body.checkFatura != null) {
                                                                                                                                                           fatura = 'checked'
                                                                                                                                                      } else {
                                                                                                                                                           fatura = 'uncheked'
                                                                                                                                                      }

                                                                                                                                                      if (req.body.tipoEntrada == 'Proprio') {
                                                                                                                                                           res.render("projeto/customdo/gestao", {
                                                                                                                                                                projeto, sucesso, configuracao, gestao, cliente, checkHora,
                                                                                                                                                                typeHrg, displayHrs, mostraHora, typeGes, checkDia, displayTda, escopo, cronograma, comunicacao,
                                                                                                                                                                vistoria, alocacao, aquisicao, typeDrg, displayDia
                                                                                                                                                           })
                                                                                                                                                      } else {
                                                                                                                                                           res.render('projeto/custosdiretos', {
                                                                                                                                                                projeto, sucesso, configuracao, rp, vendedor, cliente, fatura, checkHora,
                                                                                                                                                                typeHrg, displayHrs, mostraHora, typeGes, checkDia, displayTda, escopo, cronograma, comunicacao,
                                                                                                                                                                vistoria, alocacao, aquisicao
                                                                                                                                                           })
                                                                                                                                                      }
                                                                                                                                                      //console.log('fatura=>' + fatura)                                                                                                                                                      
                                                                                                                                                 })
                                                                                                                                            })
                                                                                                                                       }).catch((err) => {
                                                                                                                                            req.flash('error_msg', 'Houve um erro ao salvar a compra.')
                                                                                                                                            res.redirect('/menu')
                                                                                                                                       })
                                                                                                                                  }).catch((err) => {
                                                                                                                                       req.flash('error_msg', 'Houve um erro ao salvar a vistoria.')
                                                                                                                                       res.redirect('/menu')
                                                                                                                                  })

                                                                                                                             }).catch((err) => {
                                                                                                                                  req.flash('error_msg', 'Houve um erro ao salvar a proposta.')
                                                                                                                                  res.redirect('/menu')
                                                                                                                             })
                                                                                                                        }).catch((err) => {
                                                                                                                             req.flash('error_msg', 'Houve um erro ao encontrar a equipe.')
                                                                                                                             res.redirect('/menu')
                                                                                                                        })
                                                                                                                   }).catch((err) => {
                                                                                                                        req.flash('error_msg', 'Houve um erro ao salvar a equipe.')
                                                                                                                        res.redirect('/menu')
                                                                                                                   })
                                                                                                              }).catch((err) => {
                                                                                                                   req.flash('error_msg', 'Houve um erro ao encontrar o cliente.')
                                                                                                                   res.redirect('/menu')
                                                                                                              })
                                                                                                         }).catch((err) => {
                                                                                                              req.flash('error_msg', 'Houve um erro ao salvar o projeto.')
                                                                                                              res.redirect('/menu')
                                                                                                         })
                                                                                                    }).catch((err) => {
                                                                                                         req.flash('error_msg', 'Houve um erro ao encontrar o projeto.')
                                                                                                         res.redirect('/menu')
                                                                                                    })
                                                                                               }).catch((err) => {
                                                                                                    req.flash('error_msg', 'Houve um erro ao encontrar a proposta.')
                                                                                                    res.redirect('/menu')
                                                                                               })
                                                                                          }).catch((err) => {
                                                                                               req.flash('error_msg', 'Houve um erro ao salvar a proposta.')
                                                                                               res.redirect('/menu')
                                                                                          })

                                                                                     }).catch(() => {
                                                                                          req.flash('error_msg', 'Houve um erro ao encontrar o gestor.')
                                                                                          res.redirect('/menu')
                                                                                     })
                                                                                }).catch(() => {
                                                                                     req.flash('error_msg', 'Houve um erro ao encontrar o cliente.')
                                                                                     res.redirect('/menu')
                                                                                })
                                                                           }).catch(() => {
                                                                                req.flash('error_msg', 'Houve um erro ao encontrar os detalhes de custos do projeto.')
                                                                                res.redirect('/menu')
                                                                           })
                                                                      }).catch(() => {
                                                                           req.flash('error_msg', 'Houve um erro ao salvar o cronograma.')
                                                                           res.redirect('/menu')
                                                                      })
                                                                 }).catch(() => {
                                                                      req.flash('error_msg', 'Houve um erro ao salvar os detalhes de custos do projeto.')
                                                                      res.redirect('/menu')
                                                                 })

                                                            }).catch((err) => {
                                                                 req.flash('error_msg', 'Houve uma falha ao encontrar um vendedor<detalhe>.')
                                                                 res.redirect('/pessoa/consulta')
                                                            })
                                                       }).catch((err) => {
                                                            req.flash('error_msg', 'Ocorreu um erro interno<Configuracao>.')
                                                            res.redirect('/menu')
                                                       })
                                                  }).catch((err) => {
                                                       req.flash('error_msg', 'Ocorreu um erro interno<Projeto>.')
                                                       res.redirect('/menu')
                                                  })
                                             }).catch((err) => {
                                                  req.flash('error_msg', 'Houve um erro ao salvar o projeto.')
                                                  res.redirect('/menu')
                                             })
                                        }).catch((err) => {
                                             req.flash('error_msg', 'Não foi possível encontrar o projeto.')
                                             res.redirect('/menu')
                                        })
                                   }
                              }).catch((err) => {
                                   req.flash('error_msg', 'Houve um erro ao encontrar o cliente.')
                                   res.redirect('/menu')
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Houve um erro ao encontrar a configuração.')
                              res.redirect('/menu')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve um erro ao encontrar a empresa.')
                         res.redirect('/menu')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro ao encontrar o vendedor<projeto>.')
                    res.redirect('/menu')
               })
          }
     })
})

router.post("/salvarequipe", ehAdmin, (req, res) => {
     const { _id } = req.user
     const { user } = req.user
     var id

     if (typeof user == 'undefined') {
          id = _id
     } else {
          id = user
     }
     // //console.log('req.body.id=>' + req.body.id)
     Projeto.findOne({ _id: req.body.id }).then((projeto) => {
          Equipe.findOne({ _id: req.body.equipe }).then((equipe) => {
               // //console.log('projeto.equipe=>' + projeto.equipe)
               // if (typeof projeto.equipe == 'undefined' || projeto.equipe == '') {
               //      projeto.
               // Equipe.findOne({ projeto: req.body.id }).then((equipe) => {
               //      equipe.remove().then(() => {
               //      }).catch((err) => {
               //           req.flash('error_msg', 'Houve erro ao remover a equipe.')
               //           res.redirect('/projeto/alocacao/' + req.body.id)
               //      })
               //      //console.log('projeto removido')
               // new Equipe({
               //      projeto: projeto._id,
               //      nome: equipe.nome,
               //      nome_projeto: projeto.nome,
               //      custoins: req.body.custoIns,
               //      ins0: equipe.ins0,
               //      ins1: equipe.ins1,
               //      ins2: equipe.ins2,
               //      ins3: equipe.ins3,
               //      ins4: equipe.ins4,
               //      ins5: equipe.ins5,
               // }).save().then(() => {
               //      //console.log('salvou equipe')
               //      Equipe.findOne().sort({ field: 'asc', _id: -1 }).then((ult_equipe) => {
               //           //console.log('ult_equipe=>' + ult_equipe)
               //           projeto.equipe = ult_equipe._id
               //           projeto.save().then(() => {
               //                equipe.save().then(() => {
               //                     res.redirect('/projeto/alocacao/' + req.body.id)
               //                }).catch((err) => {
               //                     req.flash('error_msg', 'Houve erro ao salvar a equipe.')
               //                     res.redirect('/projeto/alocacao/' + req.body.id)
               //                })
               //           })
               //      }).catch((err) => {
               //           req.flash('error_msg', 'Houve erro ao encontrar a equipe.')
               //           res.redirect('/projeto/alocacao/' + req.body.id)
               //      })
               // }).catch((err) => {
               //      req.flash('error_msg', 'Houve erro ao salvar a equipe.')
               //      res.redirect('/projeto/alocacao/' + req.body.id)
               // })                                       
               // })
               Equipe.findOne({ projeto: req.body.id }).then((equipe_prj) => {
                    equipe_prj.nome_equipe = equipe.nome
                    equipe_prj.custoins = req.body.custoIns
                    equipe_prj.ins0 = equipe.ins0
                    equipe_prj.ins1 = equipe.ins1
                    equipe_prj.ins2 = equipe.ins2
                    equipe_prj.ins3 = equipe.ins3
                    equipe_prj.ins4 = equipe.ins4
                    equipe_prj.ins5 = equipe.ins5
                    // projeto.equipe = equipe_prj._id
                    equipe_prj.save().then(() => {
                         // projeto.save().then(() => {
                         res.redirect('/projeto/alocacao/' + req.body.id)
                         // }).catch((err) => {
                         //      req.flash('error_msg', 'Houve erro ao salvar o projeto.')
                         //      res.redirect('/projeto/alocacao/' + req.body.id)
                         // })
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve erro ao salvar a equipe.')
                         res.redirect('/projeto/alocacao/' + req.body.id)
                    })

               }).catch((err) => {
                    req.flash('error_msg', 'Houve erro ao encontrar a equipe<tem equipe>.')
                    res.redirect('/projeto/alocacao/' + req.body.id)
               })
          }).catch((err) => {
               req.flash('error_msg', 'Houve erro ao encontrar a equipe.')
               res.redirect('/projeto/alocacao/' + req.body.id)
          })
     }).catch((err) => {
          req.flash('error_msg', 'Houve erro ao encontrar o projeto.')
          res.redirect('/projeto/alocacao/' + req.body.id)
     })
})

router.post("/salvarins", ehAdmin, (req, res) => {
     const { _id } = req.user
     const { user } = req.user
     var id

     if (typeof user == 'undefined') {
          id = _id
     } else {
          id = user
     }
     var erros = ''
     var dias = 0

     if (req.body.dateEstIni == '' || typeof req.body.dateEstIni == 'undefined') {
          erros = erros + 'A data prevista de início da instalação da estrutura deve ser preenchida. '
     }
     if (req.body.dateEstFim == '' || typeof req.body.dateEstFim == 'undefined') {
          erros = erros + 'A data prevista de final da instalação da estrutura deve ser preenchida. '
     }
     if (req.body.dateModIni == '' || typeof req.body.dateModIni == 'undefined') {
          erros = erros + 'A data prevista de início da instalação dos módulos deve ser preenchida. '
     }
     if (req.body.dateModFim == '' || typeof req.body.dateModFim == 'undefined') {
          erros = erros + 'A data prevista de final da instalação dos módulos deve ser preenchida. '
     }
     if (erros != '') {
          req.flash('error_msg', erros)
          res.redirect('/projeto/alocacao/' + req.body.idins)
     } else {
          Projeto.findOne({ _id: req.body.idins }).then((projeto) => {
               Equipe.findOne({ projeto: projeto._id }).then((equipe) => {
                    equipe.custoins = req.body.custoIns
                    equipe.ins0 = req.body.ins0
                    equipe.ins1 = req.body.ins1
                    equipe.ins2 = req.body.ins2
                    equipe.ins3 = req.body.ins3
                    equipe.ins4 = req.body.ins4
                    equipe.ins5 = req.body.ins5
                    equipe.save().then(() => {
                         Cronograma.findOne({ projeto: req.body.idins }).then((cronograma) => {
                              cronograma.dateestini = req.body.dateEstIni
                              cronograma.dateestfim = req.body.dateEstFim
                              cronograma.datemodini = req.body.dateModIni
                              cronograma.datemodfim = req.body.dateModFim
                              cronograma.agendaEstIni = dataBusca(req.body.dateEstIni)
                              cronograma.agendaModIni = dataBusca(req.body.dateModIni)
                              cronograma.agendaEstFim = dataBusca(req.body.dateEstFim)
                              cronograma.agendaModFim = dataBusca(req.body.dateModFim)
                              cronograma.save().then(() => {
                                   //Contando quantidade de instaladores
                                   var qtdins = 0
                                   if (req.body.ins0 != '' && typeof req.body.ins0 != 'undefined') {
                                        qtdins = parseFloat(qtdins) + parseFloat(1)
                                   }
                                   if (req.body.ins1 != '' && typeof req.body.ins1 != 'undefined') {
                                        qtdins = parseFloat(qtdins) + parseFloat(1)
                                   }
                                   if (req.body.ins2 != '' && typeof req.body.ins2 != 'undefined') {
                                        qtdins = parseFloat(qtdins) + parseFloat(1)
                                   }
                                   if (req.body.ins3 != '' && typeof req.body.ins3 != 'undefined') {
                                        qtdins = parseFloat(qtdins) + parseFloat(1)
                                   }
                                   if (req.body.ins4 != '' && typeof req.body.ins4 != 'undefined') {
                                        qtdins = parseFloat(qtdins) + parseFloat(1)
                                   }
                                   if (req.body.ins5 != '' && typeof req.body.ins5 != 'undefined') {
                                        qtdins = parseFloat(qtdins) + parseFloat(1)
                                   }
                                   projeto.qtdins = qtdins
                                   if (equipe.custoele != '' && typeof equipe.custoele != 'undefined') {
                                        //console.log('req.body.custoIns=>' + req.body.custoIns)
                                        equipe.custoins = req.body.custoIns
                                        dias = (parseFloat(dataBusca(req.body.dateModFim)) - parseFloat(cronograma.agendaAteIni)) + 1
                                        //console.log('dias=>' + dias)
                                        totint = (parseFloat(req.body.custoIns) + parseFloat(equipe.custoele)) * dias
                                        if (projeto.totint != totint) {
                                             projeto.totint = totint
                                        }
                                   } else {
                                        totint = req.body.custoIns
                                        projeto.totint = req.body.custoIns
                                   }
                                   projeto.custoPlano = totint
                                   projeto.trbint = dias
                                   projeto.diastr = dias
                                   projeto.diasObra = dias
                                   projeto.diasIns = dias
                                   projeto.save().then(() => {
                                        res.redirect('/projeto/alocacao/' + req.body.idins)
                                   }).catch((err) => {
                                        req.flash('error_msg', 'Houve erro ao salvar o projeto.')
                                        res.redirect('/projeto/alocacao/' + req.body.idins)
                                   })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Houve erro ao salvar o cronograma.')
                                   res.redirect('/projeto/alocacao/' + req.body.idins)
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Houve erro ao encontrar o cronograma.')
                              res.redirect('/projeto/alocacao/' + req.body.idins)
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve erro ao salvar a equipe.')
                         res.redirect('/projeto/alocacao/' + req.body.idins)
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve erro ao encontrar a equipe.')
                    res.redirect('/projeto/alocacao/' + req.body.idins)
               })
          }).catch((err) => {
               req.flash('error_msg', 'Houve erro ao encontrar o projeto.')
               res.redirect('/projeto/alocacao/' + req.body.idins)
          })
     }
})

router.post("/salvarele", ehAdmin, (req, res) => {
     const { _id } = req.user
     const { user } = req.user
     var id

     if (typeof user == 'undefined') {
          id = _id
     } else {
          id = user
     }
     var erros = ''
     var dias = 0
     var totint = 0
     var custoEle = 0

     if (req.body.dateAteIni == '' || typeof req.body.dateAteIni == 'undefined') {
          erros = erros + 'A data prevista de início do aterramento. '
     }
     if (req.body.dateAteFim == '' || typeof req.body.dateAteFim == 'undefined') {
          erros = erros + 'A data prevista de final do aterramento. '
     }
     if (req.body.dateStbIni == '' || typeof req.body.dateStbIni == 'undefined') {
          erros = erros + 'A data prevista de início do da instalação string box. '
     }
     if (req.body.dateStbFim == '' || typeof req.body.dateStbFim == 'undefined') {
          erros = erros + 'A data prevista de final da instalação do stringbox. '
     }
     if (req.body.dateInvIni == '' || typeof req.body.dateInvIni == 'undefined') {
          erros = erros + 'A data prevista de início da instalação do inversor. '
     }
     if (req.body.dateInvFim == '' || typeof req.body.dateInvFim == 'undefined') {
          erros = erros + 'A data prevista de final da instalação do inversor. '
     }

     if (erros != '') {
          req.flash('error_msg', erros)
          res.redirect('/projeto/alocacao/' + req.body.idele)
     } else {
          Projeto.findOne({ _id: req.body.idele }).then((projeto) => {
               Equipe.findOne({ projeto: req.body.idele }).then((equipe) => {
                    Cronograma.findOne({ projeto: req.body.idele }).then((cronograma) => {
                         equipe.ele0 = req.body.ele0
                         equipe.ele1 = req.body.ele1
                         // projeto.equipe = equipe._id
                         //console.log('req.body.ele0=>' + req.body.ele0)
                         //console.log('req.body.ele1=>' + req.body.ele1)
                         //console.log('req.body.custoEle0=>' + req.body.custoEle0)
                         //console.log('req.body.custoEle1=>' + req.body.custoEle1)
                         //console.log('req.body.custoEle=>' + req.body.custoEle)
                         equipe.custoele = req.body.custoEle
                         if (cronograma.agendaModFim != '0' && typeof cronograma.agendaModFim != 'undefined') {
                              dias = (parseFloat(cronograma.agendaModFim) - parseFloat(dataBusca(req.body.dateAteIni))) + 1
                              //console.log('dias=>' + dias)
                              if (equipe.custoins != '' && typeof equipe.custoins != 'undefined') {
                                   totint = (parseFloat(equipe.custoins) + parseFloat(req.body.custoEle)) * dias
                                   if (projeto.totint != totint) {
                                        totint = totint
                                   }
                                   //console.log('totint=>' + totint)
                                   projeto.custoPlano = totint
                                   projeto.trbint = dias
                                   projeto.diastr = dias
                                   projeto.diasObra = dias
                                   projeto.diasIns = dias
                              } else {
                                   totint = req.body.custoEle
                              }
                         } else {
                              totint = req.body.custoEle
                         }
                         projeto.totint = totint
                         projeto.equipe = equipe._id
                         projeto.save().then(() => {
                              //console.log('salvou o projeto')
                              equipe.save().then(() => {
                                   //console.log('salvou a equipe')
                                   cronograma.dateateini = req.body.dateAteIni
                                   cronograma.dateatefim = req.body.dateAteFim
                                   cronograma.datestbini = req.body.dateStbIni
                                   cronograma.datestbfim = req.body.dateStbFim
                                   cronograma.dateinvini = req.body.dateInvIni
                                   cronograma.dateinvfim = req.body.dateInvFim
                                   cronograma.agendaAteIni = dataBusca(req.body.dateAteIni)
                                   cronograma.agendaStbIni = dataBusca(req.body.dateStbIni)
                                   cronograma.agendaInvIni = dataBusca(req.body.dateInvIni)
                                   cronograma.agendaAteFim = dataBusca(req.body.dateAteFim)
                                   cronograma.agendaStbFim = dataBusca(req.body.dateStbFim)
                                   cronograma.agendaInvFim = dataBusca(req.body.dateInvFim)
                                   cronograma.save().then(() => {
                                        res.redirect('/projeto/alocacao/' + req.body.idele)
                                   }).catch((err) => {
                                        req.flash('error_msg', 'Houve erro ao salvar o cronograma.')
                                        res.redirect('/projeto/alocacao/' + req.body.idele)
                                   })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Houve erro ao salvar a equipe.')
                                   res.redirect('/projeto/alocacao/' + req.body.idele)
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Houve erro ao salvar o projeto.')
                              res.redirect('/projeto/alocacao/' + req.body.idele)
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve erro ao econtrar o cronograma.')
                         res.redirect('/projeto/alocacao/' + req.body.idele)
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve erro ao encontrar a equipe.')
                    res.redirect('/projeto/alocacao/' + req.body.idele)
               })
          }).catch((err) => {
               req.flash('error_msg', 'Houve erro ao encontrar o projeto.')
               res.redirect('/projeto/alocacao/' + req.body.idele)
          })
     }
})

router.post('/salvarescopo', ehAdmin, (req, res) => {
     //console.log('req.body.id=>' + req.body.id)
     Projeto.findOne({ _id: req.body.id }).then((projeto) => {
          projeto.escopo = req.body.escopo
          projeto.save().then(() => {
               //console.log('salvou projeto')
               //console.log('req.body.id=>' + req.body.id)
               res.redirect('/projeto/vermais/' + req.body.id)
          }).catch((err) => {
               req.flash('error_msg', 'Nenhum empresa encontrado.')
               res.redirect('/configuracao/consultaempresa')
          })
     }).catch((err) => {
          req.flash('error_msg', 'Nenhum projeto encontrado.')
          res.redirect('/pessoa/consulta')
     })
})

router.post('/edicao', ehAdmin, (req, res) => {
     const { _id } = req.user
     const { user } = req.user
     var id

     if (typeof user == 'undefined') {
          id = _id
     } else {
          id = user
     }
     var erros = ''
     var redirect = '/projeto/edicao/' + req.body.id

     if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
          erros = erros + 'Nome do projeto deve ser preenchido.'
     }
     if (!req.body.equipamento || typeof req.body.equipamento == undefined || req.body.equipamento == null) {
          erros = erros + 'O valor do equipamento ser preenchido.'
     }

     if (erros != '') {
          req.flash('error_msg', erros)
          res.redirect(redirect)
     } else {
          Projeto.findOne({ _id: req.body.id }).then((projeto) => {
               //console.log('req.body.vendedor=>' + req.body.vendedor)
               Pessoa.findOne({ _id: req.body.vendedor }).then((prj_vendedor) => {
                    Detalhado.findOne({ projeto: projeto._id }).then((detalhe) => {
                         //console.log('projeto._id=>' + projeto._id)
                         Equipe.findOne({ projeto: projeto._id }).then((equipe) => {
                              Cronograma.findOne({ projeto: projeto._id }).then((cronograma) => {
                                   //console.log('encontrou cronograma')
                                   Configuracao.findOne({ _id: projeto.configuracao }).then((config) => {
                                        //console.log('encontrou cronograma')
                                        Empresa.findOne({ _id: projeto.empresa }).then((empresa) => {

                                             var sucesso = ''
                                             var aviso = ''
                                             var checkUni = 'unchecked'

                                             //Validação de check box  
                                             var cercamento
                                             var poste
                                             var estsolo
                                             var central
                                             var armazenamento
                                             var painel

                                             projeto.nome = req.body.nome

                                             if (req.body.cercamento != null) {
                                                  cercamento = 'checked'
                                             }
                                             if (req.body.poste != null) {
                                                  poste = 'checked'
                                             }
                                             if (req.body.estsolo != null) {
                                                  estsolo = 'checked'
                                             }
                                             if (req.body.central != null) {
                                                  central = 'checked'
                                             }
                                             if (req.body.armazenamento != null) {
                                                  armazenamento = 'checked'
                                             }
                                             if (req.body.painel != null) {
                                                  painel = 'checked'
                                             }
                                             //--Rotina do cadastro dos detalhes
                                             var unidadeEqu = 0
                                             var unidadeMod = 0
                                             var unidadeInv = 0
                                             var unidadeEst = 0
                                             var unidadeCim = 0
                                             var unidadeCab = 0
                                             var unidadeEbt = 0
                                             var unidadeDisCC = 0
                                             var unidadeDPSCC = 0
                                             var unidadeDisCA = 0
                                             var unidadeDPSCA = 0
                                             var unidadeSB = 0
                                             var unidadeCCA = 0
                                             var unidadeOcp = 0
                                             var unidadeCer = 0
                                             var unidadeCen = 0
                                             var unidadePos = 0
                                             var vlrUniEqu = 0
                                             var vlrUniMod = 0
                                             var vlrUniInv = 0
                                             var vlrUniEst = 0
                                             var vlrUniCim = 0
                                             var vlrUniCab = 0
                                             var vlrUniEbt = 0
                                             var vlrUniDisCC = 0
                                             var vlrUniDPSCC = 0
                                             var vlrUniDisCA = 0
                                             var vlrUniDPSCA = 0
                                             var vlrUniSB = 0
                                             var vlrUniCCA = 0
                                             var vlrUniOcp = 0
                                             var vlrUniCer = 0
                                             var vlrUniCen = 0
                                             var vlrUniPos = 0
                                             var valorEqu = 0
                                             var valorMod = 0
                                             var valorInv = 0
                                             var valorEst = 0
                                             var valorCim = 0
                                             var valorCab = 0
                                             var valorEbt = 0
                                             var valorDisCC = 0
                                             var valorDPSCC = 0
                                             var valorDisCA = 0
                                             var valorDPSCA = 0
                                             var valorSB = 0
                                             var valorCCA = 0
                                             var valorOcp = 0
                                             var valorCer = 0
                                             var valorCen = 0
                                             var valorPos = 0

                                             //Valida valor Equipamento Detalhado
                                             if (req.body.valorMod == 0) {
                                                  if (req.body.valorEqu != 0 && req.body.unidadeEqu == 0 && req.body.vlrUniEqu == 0) {
                                                       valorEqu = req.body.valorEqu
                                                  } else {
                                                       if (req.body.unidadeEqu != 0 && req.body.vlrUniEqu != 0) {
                                                            unidadeEqu = req.body.unidadeEqu
                                                            vlrUniEqu = req.body.vlrUniEqu
                                                            valorEqu = parseFloat(unidadeEqu) * parseFloat(vlrUniEqu)
                                                            checkUni = 'checked'
                                                       }
                                                  }
                                             }
                                             //Valida valor Módulo Detalhado
                                             if (req.body.valorMod != 0 && req.body.unidadeMod == 0 && req.body.vlrUniMod == 0) {
                                                  valorMod = req.body.valorMod
                                             } else {
                                                  if (req.body.unidadeMod != 0 && req.body.vlrUniMod != 0) {
                                                       unidadeMod = req.body.unidadeMod
                                                       vlrUniMod = req.body.vlrUniMod
                                                       valorMod = parseFloat(unidadeMod) * parseFloat(vlrUniMod)
                                                       checkUni = 'checked'
                                                  }
                                             }
                                             //Valida valor Inversor Detalhado
                                             if (req.body.valorInv != 0 && req.body.unidadeInv == 0 && req.body.vlrUniInv == 0) {
                                                  valorInv = req.body.valorInv
                                             } else {
                                                  if (req.body.unidadeInv != 0 && req.body.vlrUniInv != 0) {
                                                       unidadeInv = req.body.unidadeInv
                                                       vlrUniInv = req.body.vlrUniInv
                                                       valorInv = parseFloat(unidadeInv) * parseFloat(vlrUniInv)
                                                       checkUni = 'checked'
                                                  }
                                             }
                                             //Valida valor Estrutura Detalhado
                                             if (req.body.valorEst != 0 && req.body.unidadeEst == 0 && req.body.vlrUniEst == 0) {
                                                  valorEst = req.body.valorEst
                                             } else {
                                                  if (req.body.unidadeEst != 0 && req.body.vlrUniEst != 0) {
                                                       unidadeEst = req.body.unidadeEst
                                                       vlrUniEst = req.body.vlrUniEst
                                                       valorEst = parseFloat(unidadeEst) * parseFloat(vlrUniEst)
                                                       checkUni = 'checked'
                                                  }
                                             }
                                             //Valida valor Concretagem
                                             if (req.body.valorCim != 0 && req.body.unidadeCim == 0 && req.body.vlrUniCim == 0) {
                                                  unidadeCim = 0
                                                  vlrUniCim = 0
                                                  valorCim = req.body.valorCim
                                             } else {
                                                  if (req.body.unidadeCim != '' && req.body.vlrUniCim != '') {
                                                       unidadeCim = req.body.unidadeCim
                                                       vlrUniCim = req.body.vlrUniCim
                                                       valorCim = parseFloat(unidadeCim) * parseFloat(vlrUniCim)
                                                       checkUni = 'checked'
                                                  }
                                             }
                                             //Valida valor Cabos Detalhado
                                             if (req.body.valorCab != 0 && req.body.unidadeCab == 0 && req.body.vlrUniCab == 0) {
                                                  unidadeCab = 0
                                                  vlrUniCab = 0
                                                  valorCab = req.body.valorCab
                                             } else {
                                                  if (req.body.unidadeCab != '' && req.body.vlrUniCab != '') {
                                                       unidadeCab = req.body.unidadeCab
                                                       vlrUniCab = req.body.vlrUniCab
                                                       valorCab = parseFloat(unidadeCab) * parseFloat(vlrUniCab)
                                                       checkUni = 'checked'
                                                  }
                                             }
                                             //Valida valor Armazenagem Detalhado
                                             if (req.body.valorEbt != 0 && req.body.unidadeEbt == 0 && req.body.vlrUniEbt == 0) {
                                                  unidadeEbt = 0
                                                  vlrUniEbt = 0
                                                  valorEbt = req.body.valorEbt
                                             } else {
                                                  if (req.body.unidadeEbt != '' && req.body.vlrUniEbt != '') {
                                                       unidadeEbt = req.body.unidadeEbt
                                                       vlrUniEbt = req.body.vlrUniEbt
                                                       valorEbt = parseFloat(unidadeEbt) * parseFloat(vlrUniEbt)
                                                       checkUni = 'checked'
                                                  }
                                             }
                                             //Valida valor Disjuntores Detalhado
                                             if (req.body.valorDisCC != 0 && req.body.unidadeDisCC == 0 && req.body.vlrUniDisCC == 0) {
                                                  unidadeDisCC = 0
                                                  vlrUniDisCC = 0
                                                  valorDisCC = req.body.valorDisCC
                                             } else {
                                                  if (req.body.unidadeDisCC != '' && req.body.vlrUniDisCC != '') {
                                                       unidadeDisCC = req.body.unidadeDisCC
                                                       vlrUniDisCC = req.body.vlrUniDisCC
                                                       valorDisCC = parseFloat(unidadeDisCC) * parseFloat(vlrUniDisCC)
                                                       checkUni = 'checked'
                                                  }
                                             }
                                             if (req.body.valorDisCA != 0 && req.body.unidadeDisCA == 0 && req.body.vlrUniDisCA == 0) {
                                                  unidadeDisCA = 0
                                                  vlrUniDisCA = 0
                                                  valorDisCA = req.body.valorDisCA
                                             } else {
                                                  if (req.body.unidadeDisCA != '' && req.body.vlrUniDisCA != '') {
                                                       unidadeDisCA = req.body.unidadeDisCA
                                                       vlrUniDisCA = req.body.vlrUniDisCA
                                                       valorDisCA = parseFloat(unidadeDisCA) * parseFloat(vlrUniDisCA)
                                                       checkUni = 'checked'
                                                  }
                                             }
                                             //Valida valor DPS Detalhado
                                             if (req.body.valorDPSCC != 0 && req.body.unidadeDPSCC == 0 && req.body.vlrUniDPSCC == 0) {
                                                  unidadeDPSCC = 0
                                                  vlrUniDPSCC = 0
                                                  valorDPSCC = req.body.valorDPSCC
                                             } else {
                                                  if (req.body.unidadeDPSCC != '' && req.body.vlrUniDPSCC != '') {
                                                       unidadeDPSCC = req.body.unidadeDPSCC
                                                       vlrUniDPSCC = req.body.vlrUniDPSCC
                                                       valorDPSCC = parseFloat(unidadeDPSCC) * parseFloat(vlrUniDPSCC)
                                                       checkUni = 'checked'
                                                  }
                                             }
                                             if (req.body.valorDPSCA != 0 && req.body.unidadeDPSCA == 0 && req.body.vlrUniDPSCA == 0) {
                                                  unidadeDPSCA = 0
                                                  vlrUniDPSCA = 0
                                                  valorDPSCA = req.body.valorDPSCA
                                             } else {
                                                  if (req.body.unidadeDPSCA != '' && req.body.vlrUniDPSCA != '') {
                                                       unidadeDPSCA = req.body.unidadeDPSCA
                                                       vlrUniDPSCA = req.body.vlrUniDPSCA
                                                       valorDPSCA = parseFloat(unidadeDPSCA) * parseFloat(vlrUniDPSCA)
                                                       checkUni = 'checked'
                                                  }
                                             }
                                             //Valida valor StringBox Detalhado
                                             if (req.body.valorSB != 0 && req.body.unidadeSB == 0 && req.body.vlrUniSB == 0) {
                                                  unidadeSB = 0
                                                  vlrUniSB = 0
                                                  valorSB = req.body.valorSB
                                             } else {
                                                  if (req.body.unidadeSB != '' && req.body.vlrUniSB != '') {
                                                       unidadeSB = req.body.unidadeSB
                                                       vlrUniSB = req.body.vlrUniSB
                                                       valorSB = parseFloat(unidadeSB) * parseFloat(vlrUniSB)
                                                       checkUni = 'checked'
                                                  }
                                             }
                                             //Valida valor Caixa Proteção CA Detalhado
                                             if (req.body.valorCCA != 0 && req.body.unidadeCCA == 0 && req.body.vlrUniCCA == 0) {
                                                  unidadeCCA = 0
                                                  vlrUniCCA = 0
                                                  valorCCA = req.body.valorCCA
                                             } else {
                                                  if (req.body.unidadeCCA != '' && req.body.vlrUniCCA != '') {
                                                       unidadeCCA = req.body.unidadeCCA
                                                       vlrUniCCA = req.body.vlrUniCCA
                                                       valorCCA = parseFloat(unidadeCCA) * parseFloat(vlrUniCCA)
                                                       checkUni = 'checked'
                                                  }
                                             }
                                             //Valida valor Outros Componentes Detalhado
                                             if (req.body.valorOcp != 0 && req.body.unidadeOcp == 0 && req.body.vlrUniOcp == 0) {
                                                  valorOcp = req.body.valorOcp
                                             } else {
                                                  if (req.body.unidadeOcp != 0 && req.body.vlrUniOcp != 0) {
                                                       unidadeOcp = req.body.unidadeOcp
                                                       vlrUniOcp = req.body.vlrUniOcp
                                                       valorOcp = parseFloat(unidadeOcp) * parseFloat(vlrUniOcp)
                                                       checkUni = 'checked'
                                                  }
                                             }
                                             //Valida valor Cercamento Detalhado
                                             if (req.body.cercamento != null) {
                                                  if (req.body.valorCer != 0 && req.body.unidadeCer == 0 && req.body.vlrUniCer == 0) {
                                                       valorCer = req.body.valorCer
                                                  } else {
                                                       if (req.body.unidadeCer != 0 && req.body.vlrUniCer != 0) {
                                                            unidadeCer = req.body.unidadeCer
                                                            vlrUniCer = req.body.vlrUniCer
                                                            valorCer = parseFloat(unidadeCer) * parseFloat(vlrUniCer)
                                                            checkUni = 'checked'
                                                       }
                                                  }
                                             }
                                             //Valida valor Central Detalhado
                                             if (req.body.central != null) {
                                                  if (req.body.valorCen != 0 && req.body.unidadeCen == 0 && req.body.vlrUniCen == 0) {
                                                       valorCen = req.body.valorCen
                                                  } else {
                                                       if (req.body.unidadeCen != 0 && req.body.vlrUniCen != 0) {
                                                            unidadeCen = req.body.unidadeCen
                                                            vlrUniCen = req.body.vlrUniCen
                                                            valorCen = parseFloat(unidadeCen) * parseFloat(vlrUniCen)
                                                            checkUni = 'checked'
                                                       }
                                                  }
                                             }
                                             //Valida valor Postes Detalhado
                                             if (req.body.poste != null) {
                                                  if (req.body.valorPos != 0 && req.body.unidadePos == 0 && req.body.vlrUniPos == 0) {
                                                       valorPos = req.body.valorPos
                                                  } else {
                                                       if (req.body.unidadePos != 0 && req.body.vlrUniPos != 0) {
                                                            unidadePos = req.body.unidadePos
                                                            vlrUniPos = req.body.vlrUniPos
                                                            valorPos = parseFloat(unidadePos) * parseFloat(vlrUniPos)
                                                            checkUni = 'checked'
                                                       }
                                                  }
                                             }

                                             //console.log('checkUni=>' + checkUni)
                                             //console.log('unidadeEqu=>', +unidadeEqu)
                                             //console.log('unidadeMod=>', +unidadeMod)
                                             //console.log('unidadeInv=>', +unidadeInv)
                                             //console.log('unidadeEst=>', +unidadeEst)
                                             //console.log('unidadeCim=>', +unidadeCim)
                                             //console.log('unidadeCab=>', +unidadeCab)
                                             //console.log('unidadeDisCC=>', +unidadeDisCC)
                                             //console.log('unidadeDPSCC=>', +unidadeDPSCC)
                                             //console.log('unidadeDisCA=>', +unidadeDisCA)
                                             //console.log('unidadeDPSCA=>', +unidadeDPSCA)
                                             //console.log('unidadeSB=>', +unidadeSB)
                                             //console.log('unidadeCCA=>', +unidadeCCA)
                                             //console.log('unidadeOcp=>', +unidadeOcp)
                                             //console.log('unidadeCer=>', +unidadeCer)
                                             //console.log('unidadeCen=>', +unidadeCen)
                                             //console.log('unidadePos=>', +unidadePos)
                                             //console.log('vlrUniEqu=>', +vlrUniEqu)
                                             //console.log('vlrUniMod=>', +vlrUniMod)
                                             //console.log('vlrUniInv=>', +vlrUniInv)
                                             //console.log('vlrUniEst=>', +vlrUniEst)
                                             //console.log('vlrUniCim=>', +vlrUniCim)
                                             //console.log('vlrUniCab=>', +vlrUniCab)
                                             //console.log('vlrUniDisCC=>', +vlrUniDisCC)
                                             //console.log('vlrUniDPSCC=>', +vlrUniDPSCC)
                                             //console.log('vlrUniDisCA=>', +vlrUniDisCA)
                                             //console.log('vlrUniDPSCA=>', +vlrUniDPSCA)
                                             //console.log('vlrUniSB=>', +vlrUniSB)                         
                                             //console.log('vlrUniCCA=>', +vlrUniCCA)                         
                                             //console.log('vlrUniOcp=>', +vlrUniOcp)
                                             //console.log('vlrUniCer=>', +vlrUniCer)
                                             //console.log('vlrUniCen=>', +vlrUniCen)
                                             //console.log('vlrUniPos=>', +vlrUniPos)
                                             //console.log('valorEqu=>', +valorEqu)
                                             //console.log('valorMod=>', +valorMod)
                                             //console.log('valorInv=>', +valorInv)
                                             //console.log('valorEst=>', +valorEst)
                                             //console.log('valorCim=>', +valorCim)
                                             //console.log('valorCab=>', +valorCab)
                                             //console.log('valorDisCC=>', +valorDisCC)
                                             //console.log('valorDPSCC=>', +valorDPSCC)
                                             //console.log('valorDisCA=>', +valorDisCA)
                                             //console.log('valorDPSCA=>', +valorDPSCA)                         
                                             //console.log('valorSB=>', +valorSB)
                                             //console.log('valorCCA=>', +valorCCA)
                                             //console.log('valorOcp=>', +valorOcp)
                                             //console.log('valorCer=>', +valorCer)
                                             //console.log('valorCen=>', +valorCen)
                                             //console.log('valorPos=>', +valorPos)

                                             var validaequant = 0
                                             var validaequfut = 0
                                             var vlrequ = 0
                                             var vlrkit = 0

                                             var vlrTotal = parseFloat(valorEqu) + parseFloat(valorMod) + parseFloat(valorInv) + parseFloat(valorEst) + parseFloat(valorCim) + parseFloat(valorCab) + parseFloat(valorEbt) + parseFloat(valorDisCC) + parseFloat(valorDPSCC) + parseFloat(valorDisCA) + parseFloat(valorDPSCA) + parseFloat(valorSB) + parseFloat(valorCCA) + parseFloat(valorOcp) + parseFloat(valorCer) + parseFloat(valorCen) + parseFloat(valorPos)
                                             //console.log('vlrTotal=>' + vlrTotal)

                                             //Valida valor do equipameento
                                             if (parseFloat(valorEqu) != 0 || parseFloat(valorMod) != 0) {
                                                  //console.log('valorEqu != 0')
                                                  vlrequ = vlrTotal
                                                  vlrkit = parseFloat(valorEqu) + parseFloat(valorMod) + parseFloat(valorInv) + parseFloat(valorEst) + parseFloat(valorCim) + parseFloat(valorCab) + parseFloat(valorEbt) + parseFloat(valorDisCC) + parseFloat(valorDPSCC) + parseFloat(valorDisCA) + parseFloat(valorDPSCA) + parseFloat(valorSB) + parseFloat(valorCCA) + parseFloat(valorOcp)
                                             } else {
                                                  //console.log('não tem lançamento manual de kit.')
                                                  validaequant = parseFloat(projeto.vlrkit) - (parseFloat(detalhe.valorEst) + parseFloat(detalhe.valorCim) + parseFloat(detalhe.valorDisCC) + parseFloat(detalhe.valorDPSCC) + parseFloat(detalhe.valorDisCA) + parseFloat(detalhe.valorDPSCA) + parseFloat(detalhe.valorSB) + parseFloat(detalhe.valorCCA) + parseFloat(detalhe.valorCab) + parseFloat(detalhe.valorEbt))
                                                  //console.log('validaequant=>' + validaequant)
                                                  validaequfut = parseFloat(req.body.equipamento) - (parseFloat(valorEst) + parseFloat(valorCim) + parseFloat(valorDisCC) + parseFloat(valorDPSCC) + parseFloat(valorDisCA) + parseFloat(valorDPSCA) + parseFloat(valorSB) + parseFloat(valorCCA) + parseFloat(valorCab) + parseFloat(valorEbt))
                                                  //console.log('validaequfut=>' + validaequfut)
                                                  if (parseFloat(validaequant) != parseFloat(validaequfut)) {
                                                       //console.log('Os valores dos kits são difentes')
                                                       if (req.body.equipamento == projeto.vlrkit) {
                                                            vlrequ = parseFloat(validaequant) + parseFloat(valorEst) + parseFloat(valorCim) + parseFloat(valorCer) + parseFloat(valorPos) + parseFloat(valorCen) + parseFloat(valorDisCC) + parseFloat(valorDPSCC) + parseFloat(valorDisCA) + parseFloat(valorDPSCA) + parseFloat(valorCab) + parseFloat(valorEbt) + parseFloat(valorOcp)
                                                            vlrkit = parseFloat(validaequant) + parseFloat(valorEst) + parseFloat(valorCim) + parseFloat(valorDisCC) + parseFloat(valorDPSCC) + parseFloat(valorDisCA) + parseFloat(valorDPSCA) + parseFloat(valorCab) + parseFloat(valorEbt)
                                                       } else {
                                                            vlrequ = parseFloat(req.body.equipamento) + parseFloat(valorEst) + parseFloat(valorCim) + parseFloat(valorCer) + parseFloat(valorCen) + parseFloat(valorPos) + parseFloat(valorDisCC) + parseFloat(valorDPSCC) + parseFloat(valorDisCA) + parseFloat(valorDPSCA) + parseFloat(valorCab) + parseFloat(valorEbt) + parseFloat(valorOcp)
                                                            vlrkit = parseFloat(req.body.equipamento) + parseFloat(valorEst) + parseFloat(valorCim) + parseFloat(valorDisCC) + parseFloat(valorDPSCC) + parseFloat(valorDisCA) + parseFloat(valorDPSCA) + parseFloat(valorSB) + parseFloat(valorCCA) + parseFloat(valorCab) + parseFloat(valorEbt)
                                                       }
                                                  } else {
                                                       //console.log('Os valores dos kits são iguais')
                                                       vlrequ = projeto.vlrequ
                                                       vlrkit = projeto.vlrkit
                                                  }
                                             }
                                             //console.log('vlrequ=>' + vlrequ)
                                             //console.log('vlrkit=>' + vlrkit)

                                             //Definie os valores dos detalhes de custo dos equipamentos do projeto

                                             //console.log('req.body.unidadeMod=>' + req.body.unidadeMod)

                                             detalhe.vlrTotal = vlrequ
                                             detalhe.checkUni = checkUni
                                             detalhe.unidadeEqu = unidadeEqu
                                             detalhe.unidadeMod = unidadeMod
                                             detalhe.unidadeInv = unidadeInv
                                             detalhe.unidadeEst = unidadeEst
                                             detalhe.unidadeCim = unidadeCim
                                             detalhe.unidadeCab = unidadeCab
                                             detalhe.unidadeEbt = unidadeEbt
                                             detalhe.unidadeDisCC = unidadeDisCC
                                             detalhe.unidadeDPSCC = unidadeDPSCC
                                             detalhe.unidadeDisCA = unidadeDisCA
                                             detalhe.unidadeDPSCA = unidadeDPSCA
                                             detalhe.unidadeSB = unidadeSB
                                             detalhe.unidadeCCA = unidadeCCA
                                             detalhe.unidadeOcp = unidadeOcp
                                             detalhe.unidadeCer = unidadeCer
                                             detalhe.unidadeCen = unidadeCen
                                             detalhe.unidadePos = unidadePos
                                             detalhe.vlrUniEqu = vlrUniEqu
                                             detalhe.vlrUniMod = vlrUniMod
                                             detalhe.vlrUniInv = vlrUniInv
                                             detalhe.vlrUniEst = vlrUniEst
                                             detalhe.vlrUniCim = vlrUniCim
                                             detalhe.vlrUniCab = vlrUniCab
                                             detalhe.vlrUniEbt = vlrUniEbt
                                             detalhe.vlrUniDisCC = vlrUniDisCC
                                             detalhe.vlrUniDPSCC = vlrUniDPSCC
                                             detalhe.vlrUniDisCA = vlrUniDisCA
                                             detalhe.vlrUniDPSCA = vlrUniDPSCA
                                             detalhe.vlrUniSB = vlrUniSB
                                             detalhe.vlrUniCCA = vlrUniCCA
                                             detalhe.vlrUniOcp = vlrUniOcp
                                             detalhe.vlrUniCer = vlrUniCer
                                             detalhe.vlrUniCen = vlrUniCen
                                             detalhe.vlrUniPos = vlrUniPos
                                             detalhe.valorEqu = valorEqu
                                             detalhe.valorMod = valorMod
                                             detalhe.valorInv = valorInv
                                             detalhe.valorEst = valorEst
                                             detalhe.valorCim = valorCim
                                             detalhe.valorCab = valorCab
                                             detalhe.valorEbt = valorEbt
                                             detalhe.valorDisCC = valorDisCC
                                             detalhe.valorDPSCC = valorDPSCC
                                             detalhe.valorDisCA = valorDisCA
                                             detalhe.valorDPSCA = valorDPSCA
                                             detalhe.valorSB = valorSB
                                             detalhe.valorCCA = valorCCA
                                             detalhe.valorOcp = valorOcp
                                             detalhe.valorCer = valorCer
                                             detalhe.valorCen = valorCen
                                             detalhe.valorPos = valorPos

                                             detalhe.save().then(() => {
                                                  sucesso = 'Detalhes salvos com sucesso. '
                                             }).catch(() => {
                                                  req.flash('error_msg', 'Houve um erro ao salvar os detalhes do projeto')
                                                  res.redirect('/projeto/consulta')
                                             })

                                             //------------------------------------------------------------------
                                             //---------Validação da data de entrega do projeto----------------//
                                             var ano
                                             var mes
                                             var dia
                                             var datavis
                                             var dataprev
                                             if (projeto.valDataPrev != req.body.valDataPrev) {
                                                  //console.log('req.body.checkDatPrev=>' + req.body.checkDatPrev)
                                                  //console.log('req.body.motivo=>' + req.body.motivo)
                                                  if (typeof req.body.checkDatPrev == 'undefined') {
                                                       erros = 'Para alterar a data prevista de entrega do projeto deve-se marcar o checkbox ALTERAR. '
                                                  } else {
                                                       //console.log('req.body.motivo=>' + req.body.motivo)
                                                       if (req.body.motivo != '') {
                                                            //console.log('tem motivo')
                                                            //console.log('cronograma.datevis=>' + cronograma.datevis)
                                                            //---Validando datas para comparação----//
                                                            if (cronograma.datevis != '' && typeof cronograma.datevis != 'undefined') {
                                                                 datavis = cronograma.datevis
                                                                 ano = datavis.substring(0, 4)
                                                                 mes = datavis.substring(5, 7)
                                                                 dia = datavis.substring(8, 11)
                                                                 datavis = ano + mes + dia
                                                            } else {
                                                                 datavis = req.body.dataprev
                                                            }

                                                            dataprev = req.body.valDataPrev
                                                            ano = dataprev.substring(0, 4)
                                                            mes = dataprev.substring(5, 7)
                                                            dia = dataprev.substring(8, 11)
                                                            dataprev = ano + mes + dia
                                                            //console.log('dataprev=>' + dataprev)
                                                            //---Validando datas para comparação----//

                                                            if (parseFloat(datavis) <= parseFloat(dataprev) && req.body.dataprev != '') {
                                                                 //console.log('req.body.dataprev=>' + req.body.dataprev)
                                                                 projeto.motivo = req.body.motivo
                                                                 projeto.dataprev = req.body.dataprev
                                                                 projeto.valDataPrev = req.body.valDataPrev
                                                                 projeto.ultdat = projeto.dataprev
                                                                 projeto.dataord = dataprev
                                                                 cronograma.dateentrega = req.body.valDataPrev
                                                                 //console.log('A data de entrega foi alterada.')
                                                            } else {
                                                                 erros = erros + 'A data de entrega do projeto deve ser maior que a data de finalização da vistoria. '
                                                            }
                                                       } else {
                                                            erros = erros + 'Para alterar a data prevista de entrega do projeto deve-se discriminar um motivo. '
                                                       }

                                                  }

                                             }

                                             //---------Validação da data de entrega do projeto----------------//


                                             //Alterar data de Início da Instalação
                                             projeto.dataIns = req.body.datains
                                             projeto.valDataIns = req.body.valDataIns
                                             //Altera o vendedor                          
                                             // //console.log('req.body.vende=>' + req.body.vendedor)
                                             // //console.log('projeto.vendedor=>' + projeto.vendedor)
                                             if (req.body.vendedor != projeto.vendedor) {
                                                  projeto.vendedor = req.body.vendedor
                                                  projeto.percom = prj_vendedor.percom
                                             }
                                             // //console.log('vendedor=>'+vendedor)
                                             // //console.log('percom=>'+percom)

                                             // //console.log('req.body.empresa=>' + req.body.empresa)
                                             // //console.log('projeto.empresa=>' + projeto.empresa)
                                             //Altera a empresa 
                                             if (req.body.empresa != projeto.empresa) {
                                                  projeto.empresa = req.body.empresa
                                             }
                                             if (req.body.configuracao != projeto.configuracao) {
                                                  projeto.configuracao = req.body.configuracao
                                             }

                                             //console.log('req.body.uf=>' + req.body.uf)
                                             //console.log('req.body.cidade=>' + req.body.cidade)
                                             if (req.body.uf != '' && req.body.cidade != '' && typeof req.body.uf != 'undefined' && typeof req.body.cidade != 'undefined') {
                                                  if (req.body.uf != projeto.uf && req.body.uf != projeto.cidade) {
                                                       projeto.uf = req.body.uf
                                                       projeto.cidade = req.body.cidade
                                                  }
                                             }
                                             if (req.body.valor != projeto.valor || req.body.vlrequ != projeto.vlrequ) {
                                                  aviso = 'Aplique as alterações na aba de gerenciamento e de tributos para recalcular o valor da nota de serviço e valor dos tributos estimados.'
                                                  //Validando o markup
                                             }

                                             //console.log('req.body.valor=>' + req.body.valor)
                                             //console.log('projeto.valor=>' + projeto.valor)
                                             var valor = 0
                                             var markup = 0
                                             if (req.body.valor != projeto.valor && req.body.valor != '') {
                                                  //console.log('markup calculado')
                                                  markup = (((parseFloat(req.body.valor) - parseFloat(vlrkit) - parseFloat(projeto.custoPlano) - parseFloat(projeto.desAdm) + parseFloat(projeto.reserva)) / parseFloat(req.body.valor)) * 100).toFixed(2)
                                                  valor = req.body.valor
                                             } else {
                                                  //console.log('req.body.valor=>' + req.body.valor)
                                                  if (req.body.valor == '' || req.body.valor == 0) {
                                                       //console.log('markup configuração')
                                                       markup = empresa.markup
                                                       //console.log('projeto.custofix=>' + projeto.custofix)
                                                       //console.log('projeto.custovar=>' + projeto.custovar)
                                                       //console.log('projeto.desAdm=>' + projeto.desAdm)
                                                       valor = (((parseFloat(projeto.custofix) + parseFloat(projeto.custovar) + parseFloat(projeto.desAdm)) / (1 - (parseFloat(empresa.markup)) / 100)) + parseFloat(vlrkit)).toFixed(2)
                                                  } else {
                                                       valor = projeto.valor
                                                       markup = projeto.markup
                                                  }
                                             }

                                             var vlrNFS = 0
                                             if (projeto.fatequ == true) {
                                                  vlrNFS = (parseFloat(valor)).toFixed(2)
                                             } else {
                                                  vlrNFS = (parseFloat(valor) - parseFloat(vlrkit)).toFixed(2)
                                             }

                                             // if (req.body.valor == '' || typeof req.body.valor == 'undefined' || req.body.valor == null) {
                                             //      projeto.valor = (((parseFloat(custoFix) + parseFloat(custoVar) + parseFloat(desAdm)) / (1 - (parseFloat(empresa_prj.markup)) / 100)) + parseFloat(projeto.vlrkit)).toFixed(2)
                                             //      projeto.vlrnormal = (((parseFloat(custoFix) + parseFloat(custoVar) + parseFloat(desAdm)) / (1 - (parseFloat(empresa_prj.markup)) / 100)) + parseFloat(projeto.vlrkit)).toFixed(2)
                                             // } else {
                                             //      projeto.valor = req.body.valor
                                             //      projeto.vlrnormal = req.body.valor
                                             // }
                                             //Valida pedido realizado
                                             if (req.body.pedido != null) {
                                                  projeto.pedidoRealizado = 'checked'
                                                  projeto.dataPedido = req.body.dataPedido
                                             } else {
                                                  projeto.pedidoRealizado = 'unchecked'
                                                  projeto.dataPedido = ''
                                             }

                                             //console.log('valor=>' + valor)
                                             //console.log('markup=>' + markup)
                                             projeto.valor = valor
                                             projeto.vlrnormal = valor
                                             projeto.markup = markup
                                             //console.log('vlrequ=>' + vlrequ)
                                             projeto.vlrequ = vlrequ
                                             //console.log('vlrkit=>' + vlrkit)
                                             projeto.vlrkit = vlrkit
                                             //console.log('vlrNFS=>' + vlrNFS)
                                             projeto.vlrNFS = vlrNFS
                                             projeto.potencia = req.body.potencia
                                             //console.log('cercamento=>' + cercamento)
                                             projeto.temCercamento = cercamento
                                             //console.log('central=>' + central)
                                             projeto.temCentral = central
                                             //console.log('poste=>' + poste)
                                             projeto.temPosteCond = poste
                                             //console.log('estsolo=>' + estsolo)
                                             projeto.temEstSolo = estsolo
                                             //console.log('armazenamento=>' + armazenamento)
                                             projeto.temArmazenamento = armazenamento
                                             //console.log('painel=>' + painel)
                                             projeto.temPainel = painel
                                             projeto.endereco = req.body.endereco
                                             if (req.body.pedido != null) {
                                                  projeto.pedido = true
                                             } else {
                                                  projeto.pedido = false
                                             }

                                             //console.log('ehVinculo=>' + projeto.ehVinculo)
                                             if (projeto.ehVinculo) {
                                                  var responsavel = req.body.responsavel
                                                  if (projeto.funres != req.body.responsavel) {
                                                       projeto.funres = req.body.responsavel
                                                  }
                                             }

                                             projeto.save().then(() => {
                                                  //console.log('salvou projeto')
                                                  cronograma.save().then(() => {
                                                       //console.log('salvou cronograma')
                                                       if (projeto.ehVinculo) {
                                                            Pessoa.findOne({ _id: responsavel }).then((pessoa) => {
                                                                 equipe.pla0 = pessoa.nome
                                                                 equipe.save().then(() => {
                                                                      sucesso = sucesso + 'Projeto salvo com sucesso.'
                                                                      req.flash('error_msg', erros)
                                                                      req.flash('success_msg', sucesso)
                                                                      req.flash('aviso', aviso)
                                                                      res.redirect(redirect)
                                                                 }).catch(() => {
                                                                      req.flash('error_msg', 'Não foi possível salvar a equipe.')
                                                                      res.redirect('/menu')
                                                                 })
                                                            }).catch(() => {
                                                                 req.flash('error_msg', 'Não foi possível encontrar a pessoa.')
                                                                 res.redirect('/menu')
                                                            })
                                                       } else {
                                                            sucesso = sucesso + 'Projeto salvo com sucesso.'
                                                            req.flash('error_msg', erros)
                                                            req.flash('success_msg', sucesso)
                                                            req.flash('aviso', aviso)
                                                            res.redirect(redirect)
                                                       }

                                                  }).catch(() => {
                                                       req.flash('error_msg', 'Não foi possível salvar o cronorgrama.')
                                                       res.redirect('/menu')
                                                  })
                                             }).catch(() => {
                                                  req.flash('error_msg', 'Não foi possível salvar o projeto.')
                                                  res.redirect('/menu')
                                             })
                                        }).catch((err) => {
                                             req.flash('error_msg', 'Não foi possivel encontrar a empresa.')
                                             res.redirect('/menu')
                                        })
                                   }).catch((err) => {
                                        req.flash('error_msg', 'Não foi possivel encontrar a configuracação.')
                                        res.redirect('/menu')
                                   })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Houve uma falha ao encontrar o cronograma do projeto.')
                                   res.redirect('/configuracao/consulta')
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Houve uma falha ao encontrar a equipe do projeto.')
                              res.redirect('/configuracao/consulta')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao encontrar os detalhes do projeto.')
                         res.redirect('/configuracao/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Não foi possivel encontrar um vendedor.')
                    res.redirect('/menu')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Não foi possivel encontrar o projeto.')
               res.redirect('/menu')
          })
     }
})

router.post('/direto', ehAdmin, (req, res) => {
     const { _id } = req.user
     const { user } = req.user
     var id

     if (typeof user == 'undefined') {
          id = _id
     } else {
          id = user
     }
     var redirect
     var erros = ''
     var fatequ

     if (req.body.vlrart == '' || req.body.vlrart == 0) {
          erros = erros + 'Preencher valor de custo da ART. ' + '\n'
     }
     if (req.body.totint == '' || req.body.totint == 0) {
          erros = erros + 'Preencher valor de custo do instalador. ' + '\n'
     }
     if (req.body.totpro == '' || req.body.totpro == 0) {
          erros = erros + 'Preencher valor de custo do projetista. ' + '\n'
     }
     /*
     if (req.body.equipe == '' || req.body.equipe == 0) {
          erros = erros + 'Deve ter no mínimo 3 instaladores registrado para o projeto. '
     }
     */

     if (erros != '') {
          if (projeto.ehVinculo) {
               redirect = '/projeto/custos/' + req.body.id
          } else {
               redirect = '/projeto/direto/' + req.body.id
          }
          req.flash('error_msg', erros)
          res.redirect(redirect)
     } else {
          Projeto.findOne({ _id: req.body.id }).then((projeto) => {
               Cronograma.findOne({ projeto: projeto._id }).then((cronograma) => {
                    Detalhado.findOne({ projeto: req.body.id }).then((detalhe) => {
                         Cliente.findOne({ user: id, _id: projeto.cliente }).lean().then((cliente) => {
                              Empresa.findOne({ _id: projeto.empresa }).lean().then((empresa_prj) => {
                                   Configuracao.findOne({ _id: projeto.configuracao }).then((config) => {
                                        //console.log('entrou')
                                        //Valida informações para o cálculo dos impostos e lucros
                                        //--> cálculo automático dos dias de obra
                                        projeto.nomecliente = cliente.nome
                                        //projeto.qtdequipe = req.body.equipe
                                        /*
                                        if (req.body.diastr == '' || req.body.diastr == 0) {
                                             //console.log('dias de obra igual a zero')
                                             if (projeto.qtdequipe != '' && projeto.qtdequipe > 0) {
                                                  var hrsequ = (parseFloat(projeto.qtdequipe) - 1) * 6
                                                  if (req.body.trbint != '' && req.body.trbint > 0) {
                                                       //projeto.qtdequipe = req.body.equipe
                                                       var dias = Math.round(parseFloat(req.body.trbint) / parseFloat(hrsequ))
                                                       if (dias == 0) { dias = 1 }
                                                       //console.log('dias=>' + dis)
                                                       projeto.diastr = dias
                                                  }
                                             }
                                        } else {
                                             //console.log('dias de obra preenchido=>' + req.body.diastr)
                                             projeto.diastr = req.body.diastr
                                        }
                                        */
                                        //var vlrDAS = empresa.vlrDAS

                                        if (projeto.ehVinculo == 'false') {
                                             if (projeto.qtinds == '' || typeof projeto.qtinds == 'undefined' || isNaN(projeto.qtdins)) {
                                                  projeto.qtdins = 2
                                             }
                                        }

                                        //--> cálculo das horas totais trabalhadas a partir de lançamento manual
                                        var conhrs = 8
                                        var trbint = req.body.trbint
                                        if (trbint == '' || typeof trbint == 'undefined' || isNaN(trbint)) {
                                             trbint = 0
                                        }
                                        var trbpro = req.body.trbpro
                                        if (trbpro == '' || typeof trbpro == 'undefined' || isNaN(trbpro)) {
                                             trbpro = 0
                                        }
                                        var trbges = req.body.trbges
                                        if (trbint == '' || typeof trbint == 'undefined' || isNaN(trbint)) {
                                             trbges = 0
                                        }
                                        var tipoCustoIns
                                        var tempoTotal = parseFloat(trbint) + parseFloat(trbpro) + parseFloat(trbges)
                                        //console.log('tempoTotal=>' + tempoTotal)
                                        //console.log('req.body.lancaHora=>' + req.body.lancaHora)
                                        if (projeto.ehVinculo == false) {
                                             if (req.body.lancaHora != null) {
                                                  tipoCustoIns = 'hora'
                                                  projeto.diastr = Math.round(parseFloat(tempoTotal) / conhrs)
                                                  projeto.tothrs = Math.round(tempoTotal)
                                                  //console.log('config.hrstrb=>' + config.hrstrb)
                                                  projeto.diasObra = Math.round(parseFloat(trbint) / parseFloat(config.hrstrb))
                                                  projeto.diasGes = (parseFloat(trbges) / parseFloat(config.hrstrb))
                                                  projeto.diasPro = Math.round(parseFloat(trbpro) / parseFloat(config.hrstrb), -1)
                                                  projeto.diasGes = Math.round(parseFloat(trbges) / parseFloat(config.hrstrb), -1)
                                                  projeto.diasIns = Math.round(parseFloat(trbint) / parseFloat(config.hrstrb), -1)
                                             } else {
                                                  tipoCustoIns = 'dia'
                                                  projeto.diastr = tempoTotal
                                                  projeto.tothrs = Math.round(parseFloat(tempoTotal) * conhrs)
                                                  projeto.diasObra = trbint
                                                  projeto.diasGes = trbges
                                                  projeto.diasPro = trbpro
                                                  projeto.diasIns = trbint
                                             }
                                        }
                                        projeto.tipoCustoIns = tipoCustoIns
                                        projeto.trbges = trbges
                                        projeto.trbpro = trbpro
                                        projeto.trbint = trbint

                                        var plafim
                                        var prjfim
                                        var ateini
                                        var atefim
                                        var invini
                                        var invfim
                                        var stbini
                                        var stbfim
                                        var estini
                                        var estfim
                                        var eaeini
                                        var eaefim
                                        var pnlini
                                        var pnlfim
                                        var valplafim
                                        var valprjfim
                                        var aux
                                        if (tipoCustoIns == 'hora') {
                                             if (cronograma.dateplafim == '' || typeof cronograma.dateplafim == 'undefined' || isNaN(cronograma.dateplafim)) {
                                                  plafim = Math.trunc(trbges / conhrs)
                                                  valplafim = setData(projeto.valDataIni, plafim)
                                                  cronograma.dateplafim = valplafim
                                             }
                                             //console.log('plafim=>'+plafim)
                                             //console.log('valplafim=>'+valplafim)
                                             if (cronograma.dateprjini == '' || typeof cronograma.dateprjini == 'undefined' || isNaN(cronograma.dateprjini)) {
                                                  if ((parseFloat(trbges) + parseFloat(trbpro)) > 8) {
                                                       prjfim = Math.round((trbpro / conhrs), -1)
                                                  } else {
                                                       prjfim = Math.trunc(trbpro / conhrs)
                                                  }
                                                  //console.log('prjfim=>'+prjfim)
                                                  cronograma.dateprjini = valplafim
                                                  valprjfim = setData(valplafim, prjfim)
                                                  //console.log('valprjfim=>'+valprjfim)
                                                  if (cronograma.dateprjfim == '' || typeof cronograma.dateprjfim == 'undefined' || isNaN(cronograma.dateprjfim)) {
                                                       cronograma.dateprjfim = valprjfim
                                                  }
                                             }
                                        } else {
                                             if (cronograma.dateplafim == '' || typeof cronograma.dateplafim == 'undefined' || isNaN(cronograma.dateplafim)) {
                                                  if (trbges > 1) {
                                                       plafim = parseFloat(trbges) - 1
                                                  } else {
                                                       plafim = 0
                                                  }
                                                  //console.log('plafim=>'+plafim)
                                                  valplafim = setData(projeto.valDataIni, plafim)
                                                  cronograma.dateplafim = valplafim
                                             }
                                             if (cronograma.dateprjini == '' || typeof cronograma.dateprjini == 'undefined' || isNaN(cronograma.dateprjini)) {
                                                  if ((parseFloat(trbges) + parseFloat(trbpro)) > 1) {
                                                       aux = Math.trunc(parseFloat(trbges) + parseFloat(trbpro))
                                                       if ((parseFloat(trbges) + parseFloat(trbpro) >= aux)) {
                                                            prjfim = trbpro - 1
                                                       } else {
                                                            prjfim = trbpro
                                                       }
                                                  } else {
                                                       prjfim = 0
                                                  }
                                                  //console.log('prjfim=>'+prjfim)
                                                  cronograma.dateprjini = valplafim
                                                  valprjfim = setData(valplafim, prjfim)
                                                  if (cronograma.dateprjfim == '' || typeof cronograma.dateprjfim == 'undefined' || isNaN(cronograma.dateprjfim)) {
                                                       cronograma.dateprjfim = valprjfim
                                                  }
                                             }
                                        }
                                        //console.log('valplafim=>'+valplafim)
                                        //console.log('valprjfim=>'+valprjfim)
                                        if (cronograma.dateateini == '' || typeof cronograma.dateateini == 'undefined' || isNaN(cronograma.dateateini)) {
                                             ateini = setData(valprjfim, 1)
                                             cronograma.dateateini = ateini
                                             atefim = setData(ateini, 1)
                                             cronograma.dateatefim = atefim
                                             //console.log('atefim=>'+atefim)
                                        }
                                        if (cronograma.dateinvini == '' || typeof cronograma.dateinvini == 'undefined' || isNaN(cronograma.dateinvini)) {
                                             invini = setData(valprjfim, 1)
                                             cronograma.dateinvini = invini
                                             invfim = setData(invini, 1)
                                             cronograma.dateinvfim = invfim
                                             //console.log('invfim=>'+invfim)
                                        }
                                        if (cronograma.datestbini == '' || typeof cronograma.datestbini == 'undefined' || isNaN(cronograma.datestbini)) {
                                             stbini = setData(valprjfim, 1)
                                             cronograma.datestbini = stbini
                                             stbfim = setData(stbini, 1)
                                             cronograma.datestbfim = stbfim
                                             //console.log('stbfim=>'+stbfim)
                                        }
                                        if (projeto.temArmazenamento == 'checked' && ((cronograma.dateeaeini == '' || typeof cronograma.dateeaeini == 'undefined' || isNaN(cronograma.dateeaeini)))) {
                                             //console.log('tem armazenamento')
                                             eaeini = setData(valprjfim, 1)
                                             cronograma.dateeaeini = eaeini
                                             eaefim = setData(eaeini, 1)
                                             cronograma.dateeaefim = eaefim
                                             //console.log('eaefim=>'+eaefim)
                                        }
                                        if (projeto.temPainel == 'checked' && (cronograma.datepnlini == '' || typeof cronograma.dateini == 'undefined' || isNaN(cronograma.datepnlini))) {
                                             //console.log('tem painel')
                                             pnlini = setData(valprjfim, 1)
                                             cronograma.datepnlini = pnlini
                                             pnlfim = setData(eaeini, 1)
                                             cronograma.datepnlfim = pnlfim
                                             //console.log('pnlfim=>'+pnlfim)
                                        }
                                        if (cronograma.dateestini == '' || typeof cronograma.dateestini == 'undefined' || isNaN(cronograma.dateestini)) {
                                             estini = setData(valprjfim, 1)
                                             cronograma.dateestini = estini
                                             estfim = setData(estini, 1)
                                             cronograma.dateestfim = estfim
                                             //console.log('estfim=>'+estfim)
                                        }
                                        var diasIns = 0
                                        //console.log('cronograma.datemodini=>' + cronograma.datemodini)
                                        if (cronograma.datemodini == '' || typeof cronograma.datemodini == 'undefined' || isNaN(cronograma.datemodini)) {
                                             modini = estfim
                                             cronograma.datemodini = modini
                                             //console.log('projeto.diasIns=>' + projeto.diasIns)
                                             if (req.body.lancaHora != null) {
                                                  diasIns = Math.round(parseFloat(trbint) / parseFloat(config.hrstrb), -1)
                                             } else {
                                                  diasIns = trbint
                                             }
                                             //console.log('diasIns=>' + diasIns)
                                             modfim = setData(modini, parseFloat(diasIns))
                                             if (projeto.ehVinculo == false) {
                                                  //console.log('não é vinculo')
                                                  //console.log('modfim=>' + modfim)
                                                  cronograma.datemodfim = modfim
                                             }
                                             //console.log('modfim=>'+modfim)
                                        }

                                        //------------------------------
                                        /*
                                        //ALTERANDO AS FUNÇÕES DE RESPONSÁVEIS
                                        if (req.body.pinome == '') {
                                             projeto.funins = req.body.funins
                                        }
                                        if (req.body.checkIns != null) {
                                             projeto.funins = req.body.funins
                                        }
                                        //}
                                        if (req.body.ppnome == '') {
                                             projeto.funpro = req.body.funpro
                                        }
                                        if (req.body.checkPro != null) {
                                             projeto.funpro = req.body.funpro
                                        }
                                        //}
                                        */
                                        //-----------------------------------
                                        //--> validação das informações de custos e de reservas

                                        var conadd = req.body.conadd
                                        var impele = req.body.impele
                                        var seguro = req.body.seguro

                                        var outcer = req.body.outcer
                                        var outpos = req.body.outpos

                                        //console.log('req.body.totint=>' + req.body.totint)
                                        var totint = req.body.totint
                                        var toteng = req.body.toteng
                                        // var matate = req.body.matate
                                        // var vlremp = req.body.vlremp
                                        // var compon = req.body.compon
                                        var totpro = req.body.totpro
                                        var totges = req.body.totges
                                        var totali = req.body.totali
                                        var totdes = req.body.totdes
                                        //console.log('totint=>' + totint)

                                        //--> se for vazio salva zero(0)
                                        if (ehVinculo == false) {
                                             var resger = req.body.resger
                                             if (req.body.resger == '') {
                                                  resger = 0
                                             }
                                             if (req.body.conadd == '') {
                                                  conadd = 0
                                             }
                                             if (req.body.impele == '') {
                                                  impele = 0
                                             }
                                             if (req.body.seguro == '') {
                                                  seguro = 0
                                             }
                                             if (req.body.outcer == '') {
                                                  outcer = 0
                                             }
                                             if (req.body.outpos == '') {
                                                  outpos = 0
                                             }
                                             if (req.body.totali == '') {
                                                  totali = 0
                                             }
                                             if (req.body.totint == '') {
                                                  totint = 0
                                             }
                                             if (req.body.toteng == '') {
                                                  toteng = 0
                                             }
                                             // if (req.body.matate == '') {
                                             //      matate = 0
                                             // }
                                             // if (req.body.vlremp == '') {
                                             //      vlremp = 0
                                             // }
                                             // if (req.body.compon == '') {
                                             //      compon = 0
                                             // }                                                                                          
                                             if (req.body.totpro == '') {
                                                  totpro = 0
                                             }
                                             if (req.body.totges == '') {
                                                  totges = 0
                                             }
                                             if (req.body.totdes == '') {
                                                  totdes = 0
                                             }

                                             projeto.resger = resger
                                             projeto.conadd = conadd
                                             projeto.impele = impele
                                             projeto.seguro = seguro

                                             projeto.outcer = outcer
                                             projeto.outpos = outpos
                                        }

                                        projeto.rspmod = req.body.rspmod
                                        projeto.qtdmod = req.body.qtdmod
                                        projeto.totali = totali
                                        projeto.totint = totint
                                        projeto.toteng = toteng
                                        // projeto.matate = matate
                                        // projeto.vlremp = vlremp
                                        // projeto.compon = compon

                                        var vlrart
                                        vlrart = req.body.vlrart
                                        projeto.vlrart = vlrart
                                        projeto.totpro = parseFloat(totpro)

                                        projeto.totges = totges
                                        projeto.totdes = totdes

                                        var reserva = 0
                                        var matate = 0
                                        var vlremp = 0
                                        var compon = 0
                                        if (projeto.ehVinculo || projeto.ehDireto) {
                                             if (req.body.reserva != '' && typeof req.body.reserva != 'undefined' && req.body.reserva != 0) {
                                                  reserva = req.body.reserva
                                             } else {
                                                  reserva = 0
                                             }
                                             if (req.body.matate != '' && typeof req.body.matate != 'undefined' && req.body.matate != 0) {
                                                  matate = req.body.matate
                                             } else {
                                                  matate = 0
                                             }
                                             if (req.body.vlremp != '' && typeof req.body.vlremp != 'undefined' && req.body.vlremp != 0) {
                                                  vlremp = req.body.vlremp
                                             } else {
                                                  vlremp = 0
                                             }
                                             if (req.body.compon != '' && typeof req.body.compon != 'undefined' && req.body.compon != 0) {
                                                  compon = req.body.compon
                                             } else {
                                                  compon = 0
                                             }
                                        } else {
                                             var rescon = parseFloat(impele) + parseFloat(seguro) + parseFloat(outcer) + parseFloat(outpos)
                                             rescon = parseFloat(rescon) + parseFloat(conadd)
                                             projeto.rescon = rescon.toFixed(2)
                                             reserva = parseFloat(resger) + parseFloat(rescon)
                                        }

                                        //console.log('totint=>' + totint)
                                        //console.log('toteng=>' + toteng)
                                        //console.log('totpro=>' + totpro)
                                        //console.log('vlrart=>' + vlrart)
                                        //console.log('totges=>' + totges)

                                        //console.log('totdes=>' + totdes)
                                        //console.log('totali=>' + totali)
                                        //console.log('matate=>' + matate)
                                        //console.log('vlremp=>' + vlremp)

                                        //console.log('detalhe.valorOcp=>' + detalhe.valorOcp)
                                        //console.log('detalhe.valorCer=>' + detalhe.valorCer)
                                        //console.log('detalhe.valorPos=>' + detalhe.valorPos)
                                        var custoFix = parseFloat(totint) + parseFloat(toteng) + parseFloat(totpro) + parseFloat(vlrart) + parseFloat(totges)
                                        var custoVar = parseFloat(totdes) + parseFloat(totali) + parseFloat(matate) + parseFloat(vlremp) + parseFloat(compon)
                                        var custoEst = parseFloat(detalhe.valorCer) + parseFloat(detalhe.valorPos) + parseFloat(detalhe.valorCen)
                                        var totcop = parseFloat(custoFix) + parseFloat(custoVar) + parseFloat(custoEst)

                                        //console.log('reserva=>' + reserva)
                                        projeto.reserva = parseFloat(reserva)
                                        projeto.matate = parseFloat(matate)
                                        projeto.vlremp = parseFloat(vlremp)
                                        projeto.compon = parseFloat(compon)
                                        projeto.custofix = custoFix.toFixed(2)
                                        projeto.custovar = custoVar.toFixed(2)
                                        projeto.custoest = custoEst.toFixed(2)
                                        projeto.totcop = totcop.toFixed(2)

                                        var custoPlano = parseFloat(totcop) + parseFloat(reserva)
                                        projeto.custoPlano = custoPlano.toFixed(2)

                                        var custoTotal = parseFloat(custoPlano) + parseFloat(projeto.vlrkit)
                                        projeto.custoTotal = custoTotal.toFixed(2)

                                        var desAdm = 0
                                        if (parseFloat(empresa_prj.desadm) > 0) {
                                             if (empresa_prj.tipodesp == 'Percentual') {
                                                  desAdm = (parseFloat(empresa_prj.desadm) * (parseFloat(empresa_prj.perdes) / 100)).toFixed(2)
                                             } else {
                                                  desAdm = ((parseFloat(empresa_prj.desadm) / parseFloat(empresa_prj.estkwp)) * parseFloat(projeto.potencia)).toFixed(2)
                                             }
                                        }

                                        //console.log('custoTotal=>'+custoTotal)
                                        //Definindo o imposto ISS
                                        //console.log('empresa_prj.alqNFS=>' + empresa_prj.alqNFS)
                                        var vlrNFS = 0
                                        var impNFS = 0
                                        var vlrMarkup = 0
                                        var prjValor = 0
                                        if (req.body.markup == '' || req.body.markup == 0) {
                                             //console.log('markup igual a zero')
                                             //console.log('projeto.vlrnormal=>'+projeto.vlrnormal)
                                             if (req.body.checkFatura != null) {
                                                  fatequ = true
                                                  vlrNFS = parseFloat(projeto.vlrnormal).toFixed(2)
                                                  impNFS = 0
                                             } else {
                                                  fatequ = false
                                                  vlrNFS = (parseFloat(projeto.vlrnormal) - parseFloat(projeto.vlrkit)).toFixed(2)
                                                  impNFS = (parseFloat(vlrNFS) * (parseFloat(empresa_prj.alqNFS) / 100)).toFixed(2)
                                             }
                                             // vlrMarkup = (((parseFloat(custoTotal) + parseFloat(desAdm) - parseFloat(reserva) - parseFloat(projeto.vlrkit)) / (1 - (parseFloat(empresa_prj.markup)) / 100)) + parseFloat(projeto.vlrkit)).toFixed(2)
                                             vlrMarkup = (((parseFloat(custoFix) + parseFloat(custoVar) + parseFloat(desAdm)) / (1 - (parseFloat(empresa_prj.markup)) / 100)) + parseFloat(projeto.vlrkit)).toFixed(2)
                                             projeto.valor = parseFloat(vlrMarkup).toFixed(2)
                                             projeto.markup = empresa_prj.markup
                                             prjValor = vlrMarkup
                                        } else {
                                             //console.log('custoTotal=>' + custoTotal)
                                             //console.log('req.body.markup=>' + req.body.markup)
                                             // vlrMarkup = (((parseFloat(custoTotal) + parseFloat(desAdm) - parseFloat(reserva) - parseFloat(projeto.vlrkit)) / (1 - (parseFloat(req.body.markup)) / 100)) + parseFloat(projeto.vlrkit)).toFixed(2)
                                             vlrMarkup = (((parseFloat(custoFix) + parseFloat(custoVar) + parseFloat(desAdm)) / (1 - (parseFloat(req.body.markup)) / 100)) + parseFloat(projeto.vlrkit)).toFixed(2)
                                             //console.log('vlrMarkup=>' + vlrMarkup)
                                             if (req.body.checkFatura != null) {
                                                  fatequ = true
                                                  vlrNFS = parseFloat(vlrMarkup).toFixed(2)
                                                  impNFS = 0
                                             } else {
                                                  fatequ = false
                                                  vlrNFS = (parseFloat(vlrMarkup) - parseFloat(projeto.vlrkit)).toFixed(2)
                                                  impNFS = (parseFloat(vlrNFS) * (parseFloat(empresa_prj.alqNFS) / 100)).toFixed(2)
                                             }
                                             projeto.markup = req.body.markup
                                             projeto.valor = vlrMarkup
                                             prjValor = parseFloat(vlrMarkup).toFixed(2)
                                        }

                                        //kWp médio
                                        projeto.vrskwp = (parseFloat(prjValor) / parseFloat(projeto.potencia)).toFixed(2)
                                        projeto.fatequ = fatequ

                                        var vlrcom = 0
                                        //Validando a comissão
                                        //console.log('projeto.percom=>'+projeto.percom)
                                        if (projeto.percom != null) {
                                             vlrcom = parseFloat(vlrNFS) * (parseFloat(projeto.percom) / 100)
                                             projeto.vlrcom = vlrcom.toFixed(2)
                                        }

                                        //console.log('prjValor=>' + prjValor)
                                        //console.log('vlrcom=>' + vlrcom)
                                        //console.log('impNFS=>' + impNFS)
                                        //console.log('vlrNFS=>' + vlrNFS)
                                        //console.log('totcop=>' + totcop)
                                        //console.log('reserva=>' + reserva)
                                        //console.log('custoPlano=>' + custoPlano)
                                        //console.log('custoTotal=>' + custoTotal)
                                        //console.log('projeto.vlrkit=>' + projeto.vlrkit)

                                        projeto.vlrNFS = parseFloat(vlrNFS).toFixed(2)
                                        projeto.impNFS = parseFloat(impNFS).toFixed(2)
                                        //console.log('savlou imposto NFS')

                                        //Definindo o Lucro Bruto
                                        var recLiquida = 0
                                        var lucroBruto = 0
                                        recLiquida = parseFloat(prjValor) - parseFloat(impNFS)
                                        //console.log('recLiquida=>' + recLiquida)
                                        projeto.recLiquida = parseFloat(recLiquida).toFixed(2)
                                        lucroBruto = parseFloat(recLiquida) - parseFloat(projeto.vlrkit)
                                        projeto.lucroBruto = parseFloat(lucroBruto).toFixed(2)
                                        //console.log('lucroBruto=>' + lucroBruto)

                                        var lbaimp = 0
                                        if (parseFloat(empresa_prj.desadm) > 0) {
                                             lbaimp = parseFloat(lucroBruto) - parseFloat(custoPlano) - parseFloat(desAdm)
                                             projeto.desAdm = parseFloat(desAdm).toFixed(2)
                                        } else {
                                             lbaimp = parseFloat(lbaimp) - parseFloat(custoPlano)
                                             projeto.desAdm = 0
                                        }
                                        //Deduzindo as comissões do Lucro Antes dos Impostos
                                        if (vlrcom == 0 || vlrcom == '') {
                                             lbaimp = parseFloat(lbaimp)
                                        } else {
                                             lbaimp = parseFloat(lbaimp) - parseFloat(vlrcom)
                                        }
                                        projeto.lbaimp = parseFloat(lbaimp).toFixed(2)
                                        //console.log('lbaimp=>' + lbaimp)

                                        var fatadd
                                        var fataju
                                        var aux
                                        var prjLR = empresa_prj.prjLR
                                        var prjLP = empresa_prj.prjLP
                                        var prjFat = empresa_prj.prjFat

                                        var totalSimples
                                        var impostoIRPJ
                                        var impostoIRPJAdd
                                        var impostoPIS
                                        var impostoCOFINS
                                        var totalImposto

                                        if (empresa_prj.regime == 'Simples') {
                                             //console.log('entrou simples')
                                             var alqEfe = ((parseFloat(prjFat) * (parseFloat(empresa_prj.alqDAS) / 100)) - (parseFloat(empresa_prj.vlrred))) / parseFloat(prjFat)
                                             totalSimples = parseFloat(vlrNFS) * (parseFloat(alqEfe))
                                             //console.log('totalSimples=>' + totalSimples)
                                             totalImposto = parseFloat(totalSimples).toFixed(2)
                                             //console.log('totalImposto=>' + totalImposto)
                                             projeto.impostoSimples = parseFloat(totalImposto).toFixed(2)
                                        }

                                        else {
                                             if (empresa_prj.regime == 'Lucro Real') {
                                                  //Imposto Adicional de IRPJ
                                                  if ((parseFloat(prjLR) / 12) > 20000) {
                                                       fatadd = (parseFloat(prjLR) / 12) - 20000
                                                       //console.log('fatadd=>' + fatadd)
                                                       fataju = parseFloat(fatadd) * (parseFloat(empresa_prj.alqIRPJAdd) / 100)
                                                       //console.log('fataju=>' + fataju)
                                                       aux = parseFloat(fatadd) / parseFloat(lbaimp)
                                                       //console.log('aux=>' + aux)
                                                       impostoIRPJAdd = parseFloat(fataju) / parseFloat(aux)
                                                       //console.log('impostoIRPJAdd=>' + impostoIRPJAdd)
                                                       projeto.impostoAdd = impostoIRPJAdd.toFixed(2)
                                                  }

                                                  impostoIRPJ = parseFloat(lbaimp) * (parseFloat(empresa_prj.alqIRPJ) / 100)
                                                  projeto.impostoIRPJ = impostoIRPJ.toFixed(2)

                                                  impostoCSLL = parseFloat(lbaimp) * (parseFloat(empresa_prj.alqCSLL) / 100)
                                                  projeto.impostoCSLL = impostoCSLL.toFixed(2)
                                                  impostoPIS = parseFloat(vlrNFS) * 0.5 * (parseFloat(empresa_prj.alqPIS) / 100)
                                                  projeto.impostoPIS = impostoPIS.toFixed(2)
                                                  impostoCOFINS = parseFloat(vlrNFS) * 0.5 * (parseFloat(empresa_prj.alqCOFINS) / 100)
                                                  projeto.impostoCOFINS = impostoCOFINS.toFixed(2)
                                                  if (parseFloat(impostoIRPJAdd) > 0) {
                                                       totalImposto = parseFloat(impostoIRPJ) + parseFloat(impostoIRPJAdd) + parseFloat(impostoCSLL) + parseFloat(impostoPIS) + parseFloat(impostoCOFINS)
                                                  } else {
                                                       totalImposto = parseFloat(impostoIRPJ) + parseFloat(impostoCSLL) + parseFloat(impostoPIS) + parseFloat(impostoCOFINS)
                                                  }
                                                  //console.log('IRPJ=>' + impostoIRPJ)
                                                  //console.log('CSLL=>' + impostoCSLL)
                                                  //console.log('COFINS=>' + impostoCOFINS)
                                                  //console.log('PIS=>' + impostoPIS)

                                             } else {
                                                  //Imposto adicional de IRPJ
                                                  if (((parseFloat(prjLP) * 0.32) / 3) > 20000) {
                                                       fatadd = ((parseFloat(prjLP) * 0.32) / 3) - 20000
                                                       fataju = parseFloat(fatadd) / 20000
                                                       impostoIRPJAdd = (parseFloat(vlrNFS) * 0.32) * (parseFloat(fataju) / 100) * (parseFloat(empresa_prj.alqIRPJAdd) / 100)
                                                       projeto.impostoAdd = impostoIRPJAdd.toFixed(2)
                                                  }
                                                  //console.log('Lucro Presumido')

                                                  impostoIRPJ = parseFloat(vlrNFS) * 0.32 * (parseFloat(empresa_prj.alqIRPJ) / 100)
                                                  projeto.impostoIRPJ = impostoIRPJ.toFixed(2)
                                                  //console.log('IRPJ=>' + impostoIRPJ)
                                                  impostoCSLL = parseFloat(vlrNFS) * 0.32 * (parseFloat(empresa_prj.alqCSLL) / 100)
                                                  projeto.impostoCSLL = impostoCSLL.toFixed(2)
                                                  //console.log('CSLL=>' + impostoCSLL)
                                                  impostoCOFINS = parseFloat(vlrNFS) * (parseFloat(empresa_prj.alqCOFINS) / 100)
                                                  projeto.impostoCOFINS = impostoCOFINS.toFixed(2)
                                                  //console.log('COFINS=>' + impostoCOFINS)
                                                  impostoPIS = parseFloat(vlrNFS) * (parseFloat(empresa_prj.alqPIS) / 100)
                                                  projeto.impostoPIS = impostoPIS.toFixed(2)
                                                  //console.log('PIS=>' + impostoPIS)
                                                  if (parseFloat(impostoIRPJAdd) > 0) {
                                                       totalImposto = parseFloat(impostoIRPJ) + parseFloat(impostoIRPJAdd) + parseFloat(impostoCSLL) + parseFloat(impostoPIS) + parseFloat(impostoCOFINS)
                                                  } else {
                                                       totalImposto = parseFloat(impostoIRPJ) + parseFloat(impostoCSLL) + parseFloat(impostoPIS) + parseFloat(impostoCOFINS)
                                                  }
                                             }
                                        }

                                        //Validar ICMS
                                        var impostoICMS
                                        if (req.body.checkFatura != null) {
                                             if (empresa_prj.alqICMS != null) {
                                                  impostoICMS = (parseFloat(prjValor)) * (parseFloat(empresa_prj.alqICMS) / 100)
                                                  totalTributos = parseFloat(totalImposto) + parseFloat(impNFS) + parseFloat(impostoICMS)
                                                  totalImposto = parseFloat(totalImposto) + parseFloat(impostoICMS)
                                             }
                                        } else {
                                             impostoICMS = 0
                                             totalTributos = parseFloat(totalImposto) + parseFloat(impNFS)
                                        }
                                        projeto.impostoICMS = impostoICMS.toFixed(2)

                                        //console.log('totalImposto=>' + totalImposto)
                                        projeto.totalImposto = parseFloat(totalImposto).toFixed(2)
                                        //console.log('totalTributos=>' + totalTributos)
                                        projeto.totalTributos = parseFloat(totalTributos).toFixed(2)

                                        //Lucro Líquido descontados os impostos
                                        var lucroLiquido = 0
                                        lucroLiquido = parseFloat(lbaimp) - parseFloat(totalImposto)
                                        projeto.lucroLiquido = parseFloat(lucroLiquido).toFixed(2)
                                        //console.log('lucroLiquido=>' + lucroLiquido)

                                        //Dashboard              
                                        //Participação dos componentes
                                        //Kit
                                        var parKitEqu = parseFloat(detalhe.valorEqu) / parseFloat(detalhe.vlrTotal) * 100
                                        projeto.parKitEqu = parseFloat(parKitEqu).toFixed(2)
                                        //Módulos
                                        var parModEqu = parseFloat(detalhe.valorMod) / parseFloat(detalhe.vlrTotal) * 100
                                        projeto.parModEqu = parseFloat(parModEqu).toFixed(2)
                                        //Inversor
                                        var parInvEqu = parseFloat(detalhe.valorInv) / parseFloat(detalhe.vlrTotal) * 100
                                        projeto.parInvEqu = parseFloat(parInvEqu).toFixed(2)
                                        //Estrutura
                                        var parEstEqu = (parseFloat(detalhe.valorEst) + parseFloat(detalhe.valorCim)) / parseFloat(detalhe.vlrTotal) * 100
                                        projeto.parEstEqu = parseFloat(parEstEqu).toFixed(2)
                                        //Cabos
                                        var parCabEqu = parseFloat(detalhe.valorCab) / parseFloat(detalhe.vlrTotal) * 100
                                        projeto.parCabEqu = parseFloat(parCabEqu).toFixed(2)
                                        //Armazenagem
                                        var parEbtEqu = parseFloat(detalhe.valorEbt) / parseFloat(detalhe.vlrTotal) * 100
                                        projeto.parEbtEqu = parseFloat(parEbtEqu).toFixed(2)
                                        //DPS CC + CA
                                        var parDpsEqu = (parseFloat(detalhe.valorDPSCC) + parseFloat(detalhe.valorDPSCA)) / parseFloat(detalhe.vlrTotal) * 100
                                        projeto.parDpsEqu = parseFloat(parDpsEqu).toFixed(2)
                                        //Disjuntores CC + CA
                                        var parDisEqu = (parseFloat(detalhe.valorDisCC) + parseFloat(detalhe.valorDisCA)) / parseFloat(detalhe.vlrTotal) * 100
                                        projeto.parDisEqu = parseFloat(parDisEqu).toFixed(2)
                                        //StringBox
                                        var parSbxEqu = parseFloat(detalhe.valorSB) / parseFloat(detalhe.vlrTotal) * 100
                                        projeto.parSbxEqu = parseFloat(parSbxEqu).toFixed(2)
                                        //Cercamento
                                        var parCerEqu = parseFloat(detalhe.valorCer) / parseFloat(detalhe.vlrTotal) * 100
                                        projeto.parCerEqu = parseFloat(parCerEqu).toFixed(2)
                                        //Central
                                        var parCenEqu = parseFloat(detalhe.valorCen) / parseFloat(detalhe.vlrTotal) * 100
                                        projeto.parCenEqu = parseFloat(parCenEqu).toFixed(2)
                                        //Postes de Condução
                                        var parPosEqu = parseFloat(detalhe.valorPos) / parseFloat(detalhe.vlrTotal) * 100
                                        projeto.parPosEqu = parseFloat(parPosEqu).toFixed(2)

                                        //console.log('prjValor=>' + prjValor)
                                        //Participação sobre o valor total do projeto
                                        var parLiqVlr = parseFloat(lucroLiquido) / parseFloat(prjValor) * 100
                                        projeto.parLiqVlr = parseFloat(parLiqVlr).toFixed(2)
                                        var parKitVlr = parseFloat(projeto.vlrkit) / parseFloat(prjValor) * 100
                                        projeto.parKitVlr = parseFloat(parKitVlr).toFixed(2)
                                        //console.log('parKitVlr=>' + parKitVlr)
                                        var parIntVlr = parseFloat(totint) / parseFloat(prjValor) * 100
                                        projeto.parIntVlr = parseFloat(parIntVlr).toFixed(2)
                                        var parEngVlr = parseFloat(toteng) / parseFloat(prjValor) * 100
                                        projeto.parEngVlr = parseFloat(parEngVlr).toFixed(2)
                                        var parGesVlr = parseFloat(totges) / parseFloat(prjValor) * 100
                                        projeto.parGesVlr = parseFloat(parGesVlr).toFixed(2)
                                        var parProVlr = parseFloat(totpro) / parseFloat(prjValor) * 100
                                        projeto.parProVlr = parseFloat(parProVlr).toFixed(2)
                                        var parArtVlr = parseFloat(vlrart) / parseFloat(prjValor) * 100
                                        projeto.parArtVlr = parseFloat(parArtVlr).toFixed(2)
                                        var parDesVlr = parseFloat(totdes) / parseFloat(prjValor) * 100
                                        projeto.parDesVlr = parseFloat(parDesVlr).toFixed(2)
                                        var parAliVlr = parseFloat(totali) / parseFloat(prjValor) * 100
                                        projeto.parAliVlr = parseFloat(parAliVlr).toFixed(2)
                                        var parResVlr = parseFloat(reserva) / parseFloat(prjValor) * 100
                                        projeto.parResVlr = parseFloat(parResVlr).toFixed(2)
                                        var parDedVlr = parseFloat(custoPlano) / parseFloat(prjValor) * 100
                                        projeto.parDedVlr = parseFloat(parDedVlr).toFixed(2)
                                        var parISSVlr
                                        if (impNFS > 0) {
                                             parISSVlr = parseFloat(impNFS) / parseFloat(prjValor) * 100
                                        } else {
                                             parISSVlr = 0
                                        }
                                        projeto.parISSVlr = parseFloat(parISSVlr).toFixed(2)
                                        var parImpVlr = parseFloat(totalImposto) / parseFloat(prjValor) * 100
                                        projeto.parImpVlr = parseFloat(parImpVlr).toFixed(2)
                                        //console.log('parImpVlr=>' + parImpVlr)
                                        if (vlrcom > 0) {
                                             var parComVlr = parseFloat(vlrcom) / parseFloat(prjValor) * 100
                                             projeto.parComVlr = parseFloat(parComVlr).toFixed(2)
                                             //console.log('parComVlr=>' + parComVlr)
                                        }

                                        //Participação sobre o Faturamento  
                                        var parLiqNfs = parseFloat(lucroLiquido) / parseFloat(vlrNFS) * 100
                                        projeto.parLiqNfs = parseFloat(parLiqNfs).toFixed(2)
                                        //console.log('parLiqNfs=>' + parLiqNfs)
                                        //console.log('projeto.fatequ=>' + projeto.fatequ)
                                        var parKitNfs
                                        if (req.body.checkFatura != null) {
                                             parKitNfs = parseFloat(projeto.vlrkit) / parseFloat(vlrNFS) * 100
                                             //console.log('parKitNfs=>' + parKitNfs)
                                             projeto.parKitNfs = parseFloat(parKitNfs).toFixed(2)
                                        } else {
                                             parKitNfs = 0
                                             projeto.parKitNfs = 0
                                        }
                                        //console.log('parKitNfs=>' + parKitNfs)
                                        var parIntNfs = parseFloat(totint) / parseFloat(vlrNFS) * 100
                                        projeto.parIntNfs = parseFloat(parIntNfs).toFixed(2)
                                        //console.log('parIntNfs=>' + parIntNfs)
                                        var parEngNfs = parseFloat(toteng) / parseFloat(vlrNFS) * 100
                                        projeto.parEngNfs = parseFloat(parEngNfs).toFixed(2)
                                        //console.log('parEngNfs=>' + parEngNfs)
                                        var parGesNfs = parseFloat(totges) / parseFloat(vlrNFS) * 100
                                        projeto.parGesNfs = parseFloat(parGesNfs).toFixed(2)
                                        //console.log('parGesNfs=>' + parGesNfs)
                                        var parProNfs = parseFloat(totpro) / parseFloat(vlrNFS) * 100
                                        projeto.parProNfs = parseFloat(parProNfs).toFixed(2)
                                        //console.log('parProNfs=>' + parProNfs)
                                        var parArtNfs = parseFloat(vlrart) / parseFloat(vlrNFS) * 100
                                        projeto.parArtNfs = parseFloat(parArtNfs).toFixed(2)
                                        //console.log('parArtNfs=>' + parArtNfs)
                                        var parDesNfs = parseFloat(totdes) / parseFloat(vlrNFS) * 100
                                        projeto.parDesNfs = parseFloat(parDesNfs).toFixed(2)
                                        //console.log('parDesNfs=>' + parDesNfs)
                                        var parAliNfs = parseFloat(totali) / parseFloat(vlrNFS) * 100
                                        projeto.parAliNfs = parseFloat(parAliNfs).toFixed(2)
                                        //console.log('parAliNfs=>' + parAliNfs)
                                        var parResNfs = parseFloat(reserva) / parseFloat(vlrNFS) * 100
                                        projeto.parResNfs = parseFloat(parResNfs).toFixed(2)
                                        //console.log('parResNfs=>' + parResNfs)
                                        var parDedNfs = parseFloat(custoPlano) / parseFloat(vlrNFS) * 100
                                        projeto.parDedNfs = parseFloat(parDedNfs).toFixed(2)
                                        //console.log('parDedNfs=>' + parDedNfs)
                                        var parISSNfs
                                        if (impNFS > 0) {
                                             parISSNfs = parseFloat(impNFS) / parseFloat(vlrNFS) * 100
                                        } else {
                                             parISSNfs = 0
                                        }
                                        projeto.parISSNfs = parseFloat(parISSNfs).toFixed(2)
                                        //console.log('parISSNfs=>' + parISSNfs)
                                        var parImpNfs = (parseFloat(totalImposto) / parseFloat(vlrNFS)) * 100
                                        projeto.parImpNfs = parseFloat(parImpNfs).toFixed(2)
                                        //console.log('parImpNfs=>' + parImpNfs)
                                        if (vlrcom > 0) {
                                             var parComNfs = parseFloat(vlrcom) / parseFloat(vlrNFS) * 100
                                             projeto.parComNfs = parseFloat(parComNfs).toFixed(2)
                                             //console.log('parComNfs=>' + parComNfs)
                                        }
                                        var fatura
                                        if (req.body.checkFatura != null) {
                                             fatura = 'checked'
                                        } else {
                                             fatura = 'uncheked'
                                        }
                                        //console.log('fatura=>' + fatura)
                                        cronograma.save().then(() => {
                                             projeto.save().then(() => {
                                                  //console.log('salvou')
                                                  req.flash('success_msg', 'Projeto Salvo com sucesso.')
                                                  if (projeto.ehVinculo) {
                                                       res.redirect('/projeto/custos/' + req.body.id)
                                                  } else {
                                                       res.redirect('/projeto/direto/' + req.body.id)
                                                  }
                                             }).catch(() => {
                                                  req.flash('error_msg', 'Houve um erro ao salvar o cronograma.')
                                                  if (projeto.ehVinculo) {
                                                       res.redirect('/projeto/custos/' + req.body.id)
                                                  } else {
                                                       res.redirect('/projeto/direto/' + req.body.id)
                                                  }
                                             })
                                        }).catch(() => {
                                             req.flash('error_msg', 'Houve um erro ao salvar o projeto.')
                                             if (projeto.ehVinculo) {
                                                  res.redirect('/projeto/custos/' + req.body.id)
                                             } else {
                                                  res.redirect('/projeto/direto/' + req.body.id)
                                             }
                                        })
                                   }).catch((err) => {
                                        req.flash('error_msg', 'Não foi possível encontrar a configuração do projeto.')
                                        if (projeto.ehVinculo) {
                                             res.redirect('/projeto/custos/' + req.body.id)
                                        } else {
                                             res.redirect('/projeto/direto/' + req.body.id)
                                        }
                                   })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Não foi possível encontrar a empresa do projeto.')
                                   if (projeto.ehVinculo) {
                                        res.redirect('/projeto/custos/' + req.body.id)
                                   } else {
                                        res.redirect('/projeto/direto/' + req.body.id)
                                   }
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Houve um erro ao encontrar um cliente.')
                              if (projeto.ehVinculo) {
                                   res.redirect('/projeto/custos/' + req.body.id)
                              } else {
                                   res.redirect('/projeto/direto/' + req.body.id)
                              }
                         })
                    }).catch(() => {
                         req.flash('error_msg', 'Houve um erro ao encontrar os detalhes.')
                         if (projeto.ehVinculo) {
                              res.redirect('/projeto/custos/' + req.body.id)
                         } else {
                              res.redirect('/projeto/direto/' + req.body.id)
                         }
                    })
               }).catch(() => {
                    req.flash('error_msg', 'Houve um erro ao encontrar o cronograma.')
                    if (projeto.ehVinculo) {
                         res.redirect('/projeto/custos/' + req.body.id)
                    } else {
                         res.redirect('/projeto/direto/' + req.body.id)
                    }
               })
          }).catch(() => {
               req.flash('error_msg', 'Houve um erro ao encontrar o projeto.')
               if (projeto.ehVinculo) {
                    res.redirect('/projeto/custos/' + req.body.id)
               } else {
                    res.redirect('/projeto/direto/' + req.body.id)
               }
          })
     }
})

router.post('/realizar', ehAdmin, (req, res) => {
     const { _id } = req.user
     const { user } = req.user
     var id

     if (typeof user == 'undefined') {
          id = _id
     } else {
          id = user
     }
     var erros = ''
     var sucesso = ''

     if (parseFloat(req.body.orcCP) == 0) {
          erros = 'Para realizar o projeto é necessário que os custos orçados sejam maiores que zero.'
          //console.log(erros)
          req.flash('error_msg', erros)
          res.redirect('/projetos/realizar/' + req.body.id)

     } else {

          Projeto.findOne({ _id: req.body.id }).then((projeto) => {
               Detalhado.findOne({ projeto: req.body.id }).then((detalhe) => {
                    Empresa.findOne({ _id: projeto.empresa }).then((rp) => {
                         Cronograma.findOne({ projeto: projeto._id }).then((cronograma) => {
                              Realizado.findOne({ projeto: req.body.id }).then((realizado) => {
                                   var prj_id = projeto._id
                                   var prjCusto = projeto.custoPlano
                                   var prjValor = projeto.valor
                                   var projeto_totalImposto = projeto.totalImposto
                                   var projeto_lbaimp = projeto.lbaimp
                                   var projeto_lucroLiquido = projeto.lucroLiquido
                                   var totint
                                   var toteng
                                   var matate
                                   var vlremp
                                   var compon
                                   var totges
                                   var totpro
                                   var vlrart
                                   var totali
                                   var totdes
                                   var tothtl
                                   var totcmb
                                   var totalPlano
                                   if (req.body.totint != 0) {
                                        totint = req.body.totint
                                   } else {
                                        totint = projeto.totint
                                   }
                                   if (req.body.toteng != 0) {
                                        toteng = req.body.toteng
                                   } else {
                                        toteng = projeto.toteng
                                   }
                                   if (req.body.matate != 0) {
                                        matate = req.body.matate
                                   } else {
                                        matate = projeto.matate
                                   }
                                   if (req.body.vlremp != 0) {
                                        vlremp = req.body.vlremp
                                   } else {
                                        vlremp = projeto.vlremp
                                   }
                                   if (req.body.compon != 0) {
                                        compon = req.body.compon
                                   } else {
                                        compon = projeto.compon
                                   }
                                   //console.log('totint=>' + totint)
                                   if (req.body.totges != 0) {
                                        totges = req.body.totges
                                   } else {
                                        totges = projeto.totges
                                   }
                                   if (req.body.totpro != 0) {
                                        totpro = req.body.totpro
                                   } else {
                                        totpro = projeto.totpro
                                   }
                                   if (req.body.vlrart != 0) {
                                        vlrart = req.body.vlrart
                                   } else {
                                        vlrart = projeto.vlrart
                                   }
                                   if (req.body.totali != 0) {
                                        totali = req.body.totali
                                   } else {
                                        totali = projeto.totali
                                   }
                                   //console.log('projeto.ehDireto=>'+projeto.ehDireto)
                                   if (projeto.ehDireto == true) {
                                        tothtl = 0
                                        totcmb = 0
                                        if (req.body.totdes != 0) {
                                             totdes = req.body.totdes
                                        } else {
                                             totdes = projeto.totdes
                                        }
                                   } else {
                                        totdes = projeto.totdes

                                        tothtl = 0
                                        if (projeto.ehDireto == false && projeto.ehVinculo == false) {
                                             if (req.body.tothtl != 0) {
                                                  tothtl = req.body.tothtl
                                             } else {
                                                  tothtl = projeto.tothtl
                                             }
                                        }
                                        totcmb = projeto.totcmb
                                        if (projeto.ehDireto == false && projeto.ehVinculo == false) {
                                             if (req.body.totcmb != 0) {
                                                  totcmb = req.body.totcmb
                                             } else {
                                                  totcmb = projeto.totcmb
                                             }
                                        }
                                   }
                                   //console.log('totdes=>'+totdes)
                                   //Definir valores tatais de armazenagem e inslação de painéis elétricos
                                   var totpnl = 0
                                   var toteae = 0
                                   if (projeto.temPainel == 'checked') {
                                        totpnl = 0
                                        if (req.body.totpnl != 0) {
                                             totpnl = req.body.totpnl
                                        } else {
                                             totpnl = projeto.totpnl
                                        }

                                   }
                                   if (projeto.temArmazenamento == 'checked') {
                                        toteae = 0
                                        if (req.body.toteae != 0) {
                                             toteae = req.body.toteae
                                        } else {
                                             toteae = projeto.toteae
                                        }
                                   }

                                   var valorCer = 0
                                   var valorCen = 0
                                   var valorPos = 0
                                   if (projeto.temCercamento == 'checked') {
                                        if (req.body.cercamento != 0) {
                                             valorCer = req.body.cercamento
                                        }
                                   }
                                   if (projeto.temCentral == 'checked') {
                                        if (req.body.central != 0) {
                                             valorCen = req.body.central
                                        }
                                   }
                                   if (projeto.temPosteCond == 'checked') {
                                        if (req.body.postecond != 0) {
                                             valorPos = req.body.postecond
                                        }
                                   }

                                   if ((valorPos == 0 || valorPos == '') && detalhe.valorPos != 0) {
                                        valorPos = detalhe.valorPos
                                   }
                                   if ((valorCer == 0 || valorCer == '') && detalhe.valorCer != 0) {
                                        valorCer = detalhe.valorCer
                                   }
                                   if ((valorCen == 0 || valorCen == '') && detalhe.valorCen != 0) {
                                        valorCen = detalhe.valorCen
                                   }

                                   //console.log('totint=>' + totint)
                                   //console.log('toteng=>' + toteng)
                                   //console.log('matate=>' + matate)
                                   //console.log('vlremp=>' + toteng)
                                   //console.log('compon=>' + toteng)
                                   //console.log('totges=>' + totges)
                                   //console.log('totpro=>' + totpro)
                                   //console.log('vlrart=>' + vlrart)
                                   //console.log('toteae=>' + toteae)
                                   //console.log('totpnl=>' + totpnl)
                                   //console.log('totali=>' + totali)
                                   //console.log('totdes=>' + totdes)
                                   var custoFix = parseFloat(totint) + parseFloat(toteng) + parseFloat(totges) + parseFloat(totpro) + parseFloat(vlrart) + parseFloat(toteae) + parseFloat(totpnl)
                                   //console.log('custoFix=>' + custoFix)
                                   var custoVar

                                   if (projeto.ehDireto == true || projeto.ehVinculo == true) {
                                        custoVar = (parseFloat(totali) + parseFloat(totdes) + parseFloat(matate) + parseFloat(vlremp) + parseFloat(compon)).toFixed(2)
                                   } else {
                                        custoVar = (parseFloat(totali) + parseFloat(totcmb) + parseFloat(tothtl)).toFixed(2)
                                   }
                                   //console.log('custoVar=>' + custoVar)

                                   //console.log('valorCer=>' + valorCer)
                                   //console.log('valorPos=>' + valorPos)
                                   //console.log('valorCen=>' + valorCen)

                                   var custoEst = parseFloat(valorCer) + parseFloat(valorPos) + parseFloat(valorCen)
                                   totalPlano = parseFloat(custoFix) + parseFloat(custoVar) + parseFloat(custoEst)
                                   //console.log('totalPlano=>' + totalPlano)

                                   var vlrequ
                                   var impISSNfs
                                   var vlrPrjNFS

                                   if (req.body.vlrequ != 0) {
                                        vlrequ = req.body.vlrequ
                                        vlrkit = req.body.vlrequ
                                   } else {
                                        vlrequ = projeto.vlrequ
                                        vlrkit = projeto.vlrkit
                                   }

                                   if (projeto.fatequ == true) {
                                        vlrPrjNFS = parseFloat(projeto.valor).toFixed(2)
                                   } else {
                                        vlrPrjNFS = (parseFloat(projeto.valor) - parseFloat(vlrkit)).toFixed(2)
                                   }

                                   //console.log('vlrequ=>' + vlrequ)
                                   //console.log('vlrPrjNFS=>' + vlrPrjNFS)

                                   //-------------------------------------
                                   var impmanual
                                   var impISS
                                   var impostoICMS
                                   var impICMS
                                   var impSimples
                                   var impIRPJ
                                   var impIRPJAdd
                                   var impCSLL
                                   var impPIS
                                   var impCOFINS
                                   var totalImposto

                                   if (req.body.impmanual != null) {
                                        //LANÇAMENTO DIRETO/MANUAL DE IMPOSTOS
                                        impmanual = 'checked'
                                        if (req.body.impISS == '' || req.body.impISS == 0 || parseFloat(req.body.impISS) == null) {
                                             impISS = 0
                                        } else {
                                             impISS = req.body.impISS
                                        }
                                   } else {
                                        if (!impISSNfs) {
                                             if (!projeto.impNFS || projeto.impNFS != '') {
                                                  impISS = projeto.impNFS
                                             } else {
                                                  impISS = 0
                                             }
                                        } else {
                                             impISS = impISSNfs.toFixed(2)
                                        }
                                   }

                                   var prjrecLiquida = parseFloat(projeto.valor) - parseFloat(impISS)
                                   prjrecLiquida = parseFloat(prjrecLiquida).toFixed(2)

                                   var prjLucroBruto = parseFloat(prjrecLiquida) - parseFloat(vlrkit)
                                   prjLucroBruto = parseFloat(prjLucroBruto).toFixed(2)

                                   //Valida a comissão e calcula o lucroBruto
                                   var vlrcom
                                   if (req.body.vlrcom == '') {
                                        vlrcom = projeto.vlrcom
                                   } else {
                                        vlrcom = req.body.vlrcom
                                   }

                                   //console.log('prjLucroBruto=>' + prjLucroBruto)
                                   //console.log('totalPlano=>' + totalPlano)
                                   //console.log('projeto.desAdm=>' + projeto.desAdm)
                                   //console.log('vlrcom=>' + vlrcom)
                                   var lbaimp = 0
                                   if (parseFloat(projeto.desAdm) > 0) {
                                        lbaimp = (parseFloat(prjLucroBruto) - parseFloat(totalPlano) - parseFloat(projeto.desAdm) - parseFloat(vlrcom)).toFixed(2)
                                   } else {
                                        lbaimp = (parseFloat(prjLucroBruto) - parseFloat(totalPlano) - parseFloat(vlrcom)).toFixed(2)
                                   }
                                   lbaimp = parseFloat(lbaimp).toFixed(2)

                                   if (impmanual == 'checked') {
                                        //LANÇAMENTO DIRETO/MANUAL DE IMPOSTOS
                                        if (req.body.impICMS == '') {
                                             impICMS = 0
                                        } else {
                                             impICMS = req.body.impICMS
                                        }
                                        if (req.body.impSimples == '') {
                                             impSimples = 0
                                        } else {
                                             impSimples = req.body.impSimples
                                        }
                                        if (req.body.impIRPJ == '') {
                                             impIRPJ = 0
                                        } else {
                                             impIRPJ = req.body.impIRPJ
                                        }
                                        if (req.body.impIRPJAdd == '') {
                                             impIRPJAdd = 0
                                        } else {
                                             impIRPJAdd = req.body.impIRPJAdd
                                        }
                                        if (req.body.impCSLL == '') {
                                             impCSLL = 0
                                        } else {
                                             impCSLL = req.body.impCSLL
                                        }
                                        if (req.body.impPIS == '') {
                                             impPIS = 0
                                        } else {
                                             impPIS = req.body.impPIS
                                        }
                                        if (req.body.impCOFINS == '') {
                                             impCOFINS = 0
                                        } else {
                                             impCOFINS = req.body.impCOFINS
                                        }
                                        if (rp.regime = 'Simples') {
                                             totalImposto = parseFloat(impSimples).toFixed(2)
                                        } else {
                                             totalImposto = (parseFloat(impIRPJ) + parseFloat(impIRPJAdd) + parseFloat(impCSLL) + parseFloat(impPIS) + parseFloat(impCOFINS)).toFixed(2)
                                        }
                                        //---------------------
                                   } else {
                                        //CÁLCULO AUTOMÁTICO DOS IMPOSTOS
                                        if (projeto.fatequ == true) {
                                             if (rp.alqICMS == '' || rp.alqICMS == null) {
                                                  impICMS = 0
                                             } else {
                                                  impostoICMS = (parseFloat(vlrkit) / (1 - (parseFloat(rp.alqICMS) / 100))) * (parseFloat(rp.alqICMS) / 100)
                                                  impICMS = impostoICMS.toFixed(2)
                                             }
                                        } else {
                                             impICMS = 0
                                        }

                                        var fatadd
                                        var fataju
                                        var aux
                                        var prjLR = rp.prjLR
                                        var prjLP = rp.prjLP
                                        var prjFat = rp.prjFat

                                        if (rp.regime == 'Simples') {
                                             var alqEfe = ((parseFloat(prjFat) * (parseFloat(rp.alqDAS) / 100)) - (parseFloat(rp.vlrred))) / parseFloat(prjFat)
                                             impSimples = parseFloat(vlrPrjNFS) * (parseFloat(alqEfe)).toFixed(2)
                                             totalImposto = parseFloat(impSimples).toFixed(2)
                                             impIRPJ = 0
                                             impIRPJAdd = 0
                                             impCSLL = 0
                                             impPIS = 0
                                             impCOFINS = 0
                                        } else {
                                             if (rp.regime == 'Lucro Real') {
                                                  //Imposto Adicional de IRPJ
                                                  if ((parseFloat(prjLR) / 12) > 20000) {
                                                       fatadd = (parseFloat(prjLR) / 12) - 20000
                                                       fataju = parseFloat(fatadd) * (parseFloat(rp.alqIRPJAdd) / 100)
                                                       aux = Math.round(parseFloat(fatadd) / parseFloat(lbaimp))
                                                       impIRPJAdd = (parseFloat(fataju) / parseFloat(aux)).toFixed(2)

                                                  } else {
                                                       impIRPJAdd = 0
                                                  }
                                                  impIRPJ = parseFloat(lbaimp) * (parseFloat(rp.alqIRPJ) / 100)
                                                  impIRPJ = impIRPJ.toFixed(2)
                                                  impCSLL = parseFloat(lbaimp) * (parseFloat(rp.alqCSLL) / 100)
                                                  impCSLL = impCSLL.toFixed(2)
                                                  impPIS = parseFloat(vlrPrjNFS) * 0.5 * (parseFloat(rp.alqPIS) / 100)
                                                  impPIS = impPIS.toFixed(2)
                                                  impCOFINS = parseFloat(vlrPrjNFS) * 0.5 * (parseFloat(rp.alqCOFINS) / 100)
                                                  impCOFINS = impCOFINS.toFixed(2)
                                                  totalImposto = (parseFloat(impIRPJAdd) + parseFloat(impIRPJ) + parseFloat(impCSLL) + parseFloat(impCOFINS) + parseFloat(impPIS)).toFixed(2)

                                             } else {
                                                  //Imposto adicional de IRPJ
                                                  if (((parseFloat(prjLP) * 0.32) / 3) > 20000) {
                                                       fatadd = ((parseFloat(prjLP) * 0.32) / 3) - 20000
                                                       fataju = parseFloat(fatadd) / 20000
                                                       impIRPJAdd = (parseFloat(vlrPrjNFS) * 0.32) * parseFloat(fataju).toFixed(2) * (parseFloat(rp.alqIRPJAdd) / 100)
                                                       impIRPJAdd = impIRPJAdd.toFixed(2)
                                                  } else {
                                                       impIRPJAdd = 0
                                                  }

                                                  impIRPJ = parseFloat(vlrPrjNFS) * 0.32 * (parseFloat(rp.alqIRPJ) / 100)
                                                  impIRPJ = impIRPJ.toFixed(2)
                                                  impCSLL = parseFloat(vlrPrjNFS) * 0.32 * (parseFloat(rp.alqCSLL) / 100)
                                                  impCSLL = impCSLL.toFixed(2)

                                                  impCOFINS = parseFloat(vlrPrjNFS) * (parseFloat(rp.alqCOFINS) / 100)
                                                  impCOFINS = impCOFINS.toFixed(2)

                                                  impPIS = parseFloat(vlrPrjNFS) * (parseFloat(rp.alqPIS) / 100)
                                                  impPIS = impPIS.toFixed(2)

                                                  totalImposto = (parseFloat(impIRPJAdd) + parseFloat(impIRPJ) + parseFloat(impCSLL) + parseFloat(impCOFINS) + parseFloat(impPIS)).toFixed(2)
                                             }
                                        }
                                   }

                                   //----------------------------

                                   var totalTributos = 0
                                   if (parseFloat(impICMS) > 0) {
                                        totalTributos = (parseFloat(totalImposto) + parseFloat(impISS) + parseFloat(impICMS)).toFixed(2)
                                        totalImposto = (parseFloat(totalImposto) + parseFloat(impICMS)).toFixed(2)
                                   } else {
                                        totalTributos = (parseFloat(totalImposto) + parseFloat(impISS)).toFixed(2)
                                   }

                                   var lucroLiquido = (parseFloat(lbaimp) - parseFloat(totalImposto)).toFixed(2)

                                   //CÁLCULO DAS VARIAÇÕES
                                   var varCusto = - (((parseFloat(prjCusto) - parseFloat(totalPlano)) / parseFloat(prjCusto)) * 100)
                                   varCusto = varCusto.toFixed(2)
                                   var varTI = - (((parseFloat(projeto_totalImposto) - parseFloat(totalImposto)) / parseFloat(projeto_totalImposto)) * 100)
                                   varTI = varTI.toFixed(2)
                                   var varLAI = -(((parseFloat(projeto_lbaimp) - parseFloat(lbaimp)) / parseFloat(projeto_lbaimp)) * 100)
                                   varLAI = varLAI.toFixed(2)
                                   var varLL = -(((parseFloat(projeto_lucroLiquido) - parseFloat(lucroLiquido)) / parseFloat(projeto_lucroLiquido)) * 100)
                                   varLL = varLL.toFixed(2)

                                   //CÁLCULO DAS PARTES

                                   var parLiqVlr = (parseFloat(lucroLiquido) / parseFloat(prjValor)) * 100
                                   parLiqVlr = parLiqVlr.toFixed(2)
                                   var parKitVlr = (parseFloat(vlrkit) / parseFloat(prjValor)) * 100
                                   parKitVlr = parKitVlr.toFixed(2)
                                   var parIntVlr = (parseFloat(totint) / parseFloat(prjValor)) * 100
                                   parIntVlr = parIntVlr.toFixed(2)
                                   var parEngVlr = (parseFloat(toteng) / parseFloat(prjValor)) * 100
                                   parEngVlr = parEngVlr.toFixed(2)
                                   var parGesVlr = (parseFloat(totges) / parseFloat(prjValor)) * 100
                                   parGesVlr = parGesVlr.toFixed(2)
                                   var parProVlr = (parseFloat(totpro) / parseFloat(prjValor)) * 100
                                   parProVlr = parProVlr.toFixed(2)
                                   var parArtVlr = (parseFloat(vlrart) / parseFloat(prjValor)) * 100
                                   parArtVlr = parArtVlr.toFixed(2)
                                   var parDesVlr = (parseFloat(totdes) / parseFloat(prjValor)) * 100
                                   parDesVlr = parDesVlr.toFixed(2)
                                   var parCmbVlr
                                   if (projeto.ehDireto == false && projeto.ehVinculo == false) {
                                        parCmbVlr = (parseFloat(totcmb) / parseFloat(prjValor)) * 100
                                   } else {
                                        parCmbVlr = 0
                                   }
                                   parCmbVlr = parCmbVlr.toFixed(2)
                                   var parAliVlr = (parseFloat(totali) / parseFloat(prjValor)) * 100
                                   parAliVrl = parAliVlr.toFixed(2)
                                   var parEstVlr
                                   if (projeto.ehDireto == false && projeto.ehVinculo == false) {
                                        parEstVlr = (parseFloat(tothtl) / parseFloat(prjValor)) * 100
                                   } else {
                                        parEstVlr = 0
                                   }
                                   parEstVlr = parEstVlr.toFixed(2)
                                   var parDedVlr = (parseFloat(totalPlano) / parseFloat(prjValor)) * 100
                                   parDedVlr = parDedVlr.toFixed(2)
                                   var parISSVlr
                                   if (impISS > 0) {
                                        parISSVlr = (parseFloat(impISS) / parseFloat(prjValor)) * 100
                                   } else {
                                        parISSVlr = 0
                                   }

                                   parISSVlr = parISSVlr.toFixed(2)
                                   var parImpVlr = (parseFloat(totalImposto) / parseFloat(prjValor)) * 100
                                   parImpVlr = parImpVlr.toFixed(2)
                                   var parComVlr = (parseFloat(vlrcom) / parseFloat(projeto.valor)) * 100
                                   parComVlr = parComVlr.toFixed(2)

                                   var parLiqNfs = (parseFloat(lucroLiquido) / parseFloat(vlrPrjNFS)) * 100
                                   parLiqNfs = parLiqNfs.toFixed(2)
                                   if (projeto.fatequ == true) {
                                        var parKitNfs = (parseFloat(vlrkit) / parseFloat(vlrPrjNFS)) * 100
                                        parKitNfs = parKitNfs.toFixed(2)
                                   } else {
                                        parKitNfs = 0
                                   }
                                   var parIntNfs = (parseFloat(totint) / parseFloat(vlrPrjNFS)) * 100
                                   parIntNfs = parIntNfs.toFixed(2)
                                   var parEngNfs = (parseFloat(toteng) / parseFloat(vlrPrjNFS)) * 100
                                   parEngNfs = parEngNfs.toFixed(2)
                                   var parGesNfs = (parseFloat(totges) / parseFloat(vlrPrjNFS)) * 100
                                   parGesNfs = parGesNfs.toFixed(2)
                                   var parProNfs = (parseFloat(totpro) / parseFloat(vlrPrjNFS)) * 100
                                   parProNfs = parProNfs.toFixed(2)
                                   var parArtNfs = (parseFloat(vlrart) / parseFloat(vlrPrjNFS)) * 100
                                   parArtNfs = parArtNfs.toFixed(2)
                                   var parDesNfs = (parseFloat(totdes) / parseFloat(vlrPrjNFS)) * 100
                                   parDesNfs = parDesNfs.toFixed(2)
                                   var parCmbNfs
                                   if (projeto.ehDireto == false && projeto.ehVinculo == false) {
                                        parCmbNfs = (parseFloat(totcmb) / parseFloat(vlrPrjNFS)) * 100
                                   } else {
                                        parCmbNfs = 0
                                   }
                                   parCmbNfs = parCmbNfs.toFixed(2)
                                   var parAliNfs = (parseFloat(totali) / parseFloat(vlrPrjNFS)) * 100
                                   parAliNfs = parAliNfs.toFixed(2)
                                   var parEstNfs
                                   if (projeto.ehDireto == false && projeto.ehVinculo == false) {
                                        parEstNfs = (parseFloat(tothtl) / parseFloat(vlrPrjNFS)) * 100
                                   } else {
                                        parEstNfs = 0
                                   }
                                   parEstNfs = parEstNfs.toFixed(2)
                                   if (parseFloat(totalPlano) > 0) {
                                        var parDedNfs = (parseFloat(totalPlano) / parseFloat(vlrPrjNFS)) * 100
                                        parDedNfs = parseFloat(parDedNfs).toFixed(2)
                                   } else {
                                        parDedNfs = 0
                                   }
                                   var parISSNfs
                                   if (impISS > 0) {
                                        parISSNfs = (parseFloat(impISS) / parseFloat(vlrPrjNFS)) * 100
                                   } else {
                                        parISSNfs = 0
                                   }

                                   parISSNfs = parISSNfs.toFixed(2)
                                   var parImpNfs = (parseFloat(totalImposto) / parseFloat(projeto.vlrNFS)) * 100
                                   parImpNfs = parImpNfs.toFixed(2)
                                   var parComNfs = (parseFloat(vlrcom) / parseFloat(vlrPrjNFS)) * 100
                                   parComNfs = parComNfs.toFixed(2)

                                   //Define percentua do realizado foi maoir ou menor que do orçado
                                   var parVlrRlz
                                   var parNfsRlz
                                   var varLucRlz
                                   if (parLiqVlr > projeto.parLiqVlr) {
                                        parVlrRlz = true
                                   } else {
                                        parVlrRlz = false
                                   }
                                   if (parLiqNfs > projeto.parLiqNfs) {
                                        parNfsRlz = true
                                   } else {
                                        parNfsRlz = false
                                   }
                                   if (lucroLiquido > projeto.lucroLiquido) {
                                        varLucRlz = true
                                   } else {
                                        varLucRlz = false
                                   }

                                   //Define data atual
                                   var data = new Date()
                                   var dia = data.getDate()
                                   if (dia < 10) {
                                        dia = '0' + dia
                                   }
                                   var mes = parseFloat(data.getMonth()) + 1
                                   if (mes < 10) {
                                        mes = '0' + mes
                                   }
                                   var ano = data.getFullYear()

                                   //validar a data de entrega do projeto
                                   var datafim = 0
                                   var dataFimPrj
                                   var valDataFim
                                   var datavis = 0
                                   var ano
                                   var mes
                                   var dia
                                   if (req.body.valDataFim != '' && typeof req.body.valDataFim != 'undefined') {
                                        //console.log('data diferente de vazio')
                                        //console.log('req.body.valDataFim=>' + req.body.valDataFim)
                                        datafim = req.body.valDataFim
                                        ano = datafim.substring(0, 4)
                                        mes = datafim.substring(5, 7)
                                        dia = datafim.substring(8, 11)
                                        datafim = ano + mes + dia
                                        dataFimPrj = dia + '/' + mes + '/' + ano
                                        //console.log('datafim=>' + datafim)
                                        //console.log('dataFimPrj=>' + dataFimPrj)
                                        datavis = cronograma.datevis
                                        ano = datavis.substring(0, 4)
                                        mes = datavis.substring(5, 7)
                                        dia = datavis.substring(8, 11)
                                        datavis = ano + mes + dia
                                        //console.log('datavis=>' + datavis)
                                        if (parseFloat(datavis) <= parseFloat(datafim)) {
                                             //console.log('data final maior que data de vistoria')
                                             valDataFim = req.body.valDataFim
                                             projeto.datafim = dataFimPrj
                                             projeto.valDataFim = valDataFim
                                             cronograma.dateEntregaReal = valDataFim
                                             projeto.atrasado = comparaDatas(cronograma.dateentrega, req.body.valDataFim)

                                        } else {
                                             valDataFim = projeto.valDataFim
                                             dataFimPrj = projeto.datafim
                                             erros.push({ texto: 'A data de entrega do projeto deve ser maior ou igual a data de finalização da vistoria.' })
                                        }
                                   } else {
                                        dataFimPrj = 0
                                        valDataFim = 0
                                   }

                                   var datareg = ano + mes + dia
                                   if (realizado != null) {
                                        //console.log('lbaimp=>' + lbaimp)
                                        //console.log('lucroLiquido=>' + lucroLiquido)
                                        //console.log('varLL=>' + varLL)
                                        //console.log('parDesVlr=>' + parDesVlr)
                                        //console.log('parAliVlr=>' + parAliVlr)
                                        //console.log('parCmbVlr=>' + parCmbVlr)
                                        //console.log('parEstVlr=>' + parEstVlr)
                                        //console.log('parDedVlr=>' + parDedVlr)
                                        //console.log('parComVlr=>' + parComVlr)
                                        //console.log('parDesNfs=>' + parDesNfs)
                                        //console.log('parAliNfs=>' + parAliNfs)
                                        //console.log('parCmbNfs=>' + parCmbNfs)
                                        //console.log('parEstNfs=>' + parEstNfs)
                                        //console.log('parDedNfs=>' + parDedNfs)
                                        //console.log('parDesNfs=>' + parComNfs)

                                        realizado.foiRealizado = false
                                        realizado.nome = projeto.nome
                                        realizado.potencia = projeto.potencia
                                        realizado.cliente = projeto.nomecliente
                                        realizado.dataini = projeto.dataini
                                        realizado.datafim = dataFimPrj
                                        realizado.valDataFim = valDataFim
                                        realizado.valor = projeto.valor
                                        realizado.data = dia + '/' + mes + '/' + ano
                                        realizado.datareg = datareg
                                        realizado.totint = totint
                                        realizado.toteng = toteng
                                        realizado.matate = matate
                                        realizado.vlremp = vlremp
                                        realizado.compon = compon
                                        realizado.totges = totges
                                        realizado.totpro = totpro
                                        realizado.vlrart = vlrart
                                        realizado.totali = totali
                                        realizado.totdes = totdes
                                        realizado.tothtl = tothtl
                                        realizado.totpnl = totpnl
                                        realizado.toteae = toteae
                                        realizado.totcmb = totcmb
                                        realizado.valorCer = valorCer
                                        realizado.valorCen = valorCen
                                        realizado.valorPos = valorPos

                                        realizado.custofix = custoFix
                                        realizado.custovar = custoVar
                                        realizado.custoest = custoEst
                                        realizado.custoPlano = totalPlano
                                        realizado.fatequ = projeto.fatequ
                                        realizado.vlrequ = vlrequ
                                        realizado.vlrkit = vlrkit
                                        realizado.valorMod = detalhe.valorMod
                                        realizado.valorInv = detalhe.valorInv
                                        realizado.valorEst = detalhe.valorEst
                                        realizado.valorCim = detalhe.valorCim
                                        realizado.valorCab = detalhe.valorCab
                                        realizado.valorEbt = detalhe.valorEbt
                                        realizado.valorDisCC = detalhe.valorDisCC
                                        realizado.valorDPSCC = detalhe.valorDPSCC
                                        realizado.valorDisCA = detalhe.valorDisCA
                                        realizado.valorDPSCA = detalhe.valorDPSCA
                                        realizado.valorCCA = detalhe.valorCCA
                                        realizado.valorSB = detalhe.valorSB
                                        realizado.valorOcp = detalhe.valorOcp

                                        realizado.vlrNFS = vlrPrjNFS
                                        realizado.recLiquida = prjrecLiquida
                                        realizado.lucroBruto = prjLucroBruto
                                        realizado.vlrcom = vlrcom
                                        realizado.desAdm = projeto.desAdm
                                        realizado.lbaimp = lbaimp

                                        realizado.impmanual = impmanual
                                        realizado.impISS = impISS
                                        realizado.impICMS = impICMS
                                        realizado.impSimples = impSimples
                                        realizado.impIRPJ = impIRPJ
                                        realizado.impIRPJAdd = impIRPJAdd
                                        realizado.impCSLL = impCSLL
                                        realizado.impPIS = impPIS
                                        realizado.impCOFINS = impCOFINS

                                        realizado.totalImposto = totalImposto
                                        realizado.totalTributos = totalTributos
                                        realizado.lucroLiquido = lucroLiquido

                                        realizado.varCusto = varCusto
                                        realizado.varTI = varTI
                                        realizado.varLAI = varLAI
                                        realizado.varLL = varLL

                                        realizado.parLiqVlr = parLiqVlr
                                        realizado.parKitVlr = parKitVlr
                                        realizado.parIntVlr = parIntVlr
                                        realizado.parGesVlr = parGesVlr
                                        realizado.parProVlr = parProVlr
                                        realizado.parArtVlr = parArtVlr
                                        realizado.parDesVlr = parDesVlr
                                        realizado.parAliVlr = parAliVlr
                                        realizado.parCmbVlr = parCmbVlr
                                        realizado.parEstVlr = parEstVlr
                                        realizado.parDedVlr = parDedVlr
                                        realizado.parISSVlr = parISSVlr
                                        realizado.parImpVlr = parImpVlr
                                        realizado.parComVlr = parComVlr

                                        realizado.parLiqNfs = parLiqNfs
                                        realizado.parKitNfs = parKitNfs
                                        realizado.parIntNfs = parIntNfs
                                        realizado.parGesNfs = parGesNfs
                                        realizado.parProNfs = parProNfs
                                        realizado.parArtNfs = parArtNfs
                                        realizado.parDesNfs = parDesNfs
                                        realizado.parAliNfs = parAliNfs
                                        realizado.parEstNfs = parEstNfs
                                        realizado.parCmbNfs = parCmbNfs
                                        realizado.parDedNfs = parDedNfs
                                        realizado.parISSNfs = parISSNfs
                                        realizado.parImpNfs = parImpNfs
                                        realizado.parComNfs = parComNfs

                                        realizado.parNfsRlz = parNfsRlz
                                        realizado.parVlrRlz = parVlrRlz
                                        realizado.varLucRlz = varLucRlz

                                        realizado.save().then(() => {
                                             //console.log('realizou projeto')
                                             projeto.foiRealizado = true
                                             projeto.homologado = false
                                             projeto.save().then(() => {
                                                  sucesso = sucesso + 'Projeto realizado com sucesso.'
                                                  //console.log('sucesso=>' + sucesso)
                                                  //console.log('req.body.id=>' + req.body.id)
                                                  req.flash('success_msg', sucesso)
                                                  res.redirect('/projeto/realizar/' + req.body.id)
                                             }).catch((err) => {
                                                  req.flash('error_msg', 'Não foi possível salvar o projeto.')
                                                  res.redirect('/projeto/consulta')
                                             })
                                        }).catch((err) => {
                                             req.flash('error_msg', 'Não foi possível realizar o projeto.')
                                             res.redirect('/projeto/realizar/' + req.body.id)
                                        })
                                   } else {
                                        //console.lof('lbaimp=>' + lbaimp)
                                        const realizado = {
                                             user: id,
                                             projeto: prj_id,
                                             potencia: projeto.potencia,
                                             foiRealizado: false,
                                             nome: projeto.nome,
                                             cliente: projeto.nomecliente,
                                             dataini: projeto.dataini,
                                             datafim: dataFimPrj,
                                             valDataFim: valDataFim,
                                             valor: projeto.valor,
                                             data: dia + '/' + mes + '/' + ano,
                                             datareg: datareg,
                                             totint: totint,
                                             toteng: toteng,
                                             matate: matate,
                                             vlremp: vlremp,
                                             compon: compon,
                                             totges: totges,
                                             totpro: totpro,
                                             vlrart: vlrart,
                                             totali: totali,
                                             totdes: totdes,
                                             tothtl: tothtl,
                                             totcmb: totcmb,
                                             valorCer: valorCer,
                                             valorCen: valorCen,
                                             valorPos: valorPos,

                                             custofix: custoFix,
                                             custovar: custoVar,
                                             custoest: custoEst,
                                             custoPlano: totalPlano,
                                             fatequ: projeto.fatequ,
                                             vlrequ: vlrequ,
                                             vlrkit: vlrkit,
                                             valorMod: detalhe.valorMod,
                                             valorInv: detalhe.valorInv,
                                             valorEst: detalhe.valorEst,
                                             valorCim: detalhe.valorCim,
                                             valorCab: detalhe.valorCab,
                                             valorEbt: detalhe.valorEbt,
                                             valorDisCC: detalhe.valorDisCC,
                                             valorDPSCC: detalhe.valorDPSCC,
                                             valorDisCA: detalhe.valorDisCA,
                                             valorDPSCA: detalhe.valorDPSCA,
                                             valorCCA: detalhe.valorCCA,
                                             valorSB: detalhe.valorSB,
                                             valorOcp: detalhe.valorOcp,

                                             vlrNFS: vlrPrjNFS,
                                             recLiquida: prjrecLiquida,
                                             lucroBruto: prjLucroBruto,
                                             vlrcom: vlrcom,
                                             desAdm: projeto.desAdm,
                                             lbaimp: lbaimp,

                                             impmanual: impmanual,
                                             impISS: impISS,
                                             impICMS: impICMS,
                                             impSimples: impSimples,
                                             impIRPJ: impIRPJ,
                                             impIRPJAdd: impIRPJAdd,
                                             impCSLL: impCSLL,
                                             impPIS: impPIS,
                                             impCOFINS: impCOFINS,

                                             totalImposto: totalImposto,
                                             totalTributos: totalTributos,
                                             lucroLiquido: lucroLiquido,

                                             varCusto: varCusto,
                                             varTI: varTI,
                                             varLAI: varLAI,
                                             varLL: varLL,

                                             parLiqVlr: parLiqVlr,
                                             parKitVlr: parKitVlr,
                                             parIntVlr: parIntVlr,
                                             parGesVlr: parGesVlr,
                                             parProVlr: parProVlr,
                                             parArtVlr: parArtVlr,
                                             parDesVlr: parDesVlr,
                                             parAliVlr: parAliVlr,
                                             parCmbVlr: parCmbVlr,
                                             parEstVlr: parEstVlr,
                                             parDedVlr: parDedVlr,
                                             parISSVlr: parISSVlr,
                                             parImpVlr: parImpVlr,
                                             parComVlr: parComVlr,

                                             parLiqNfs: parLiqNfs,
                                             parKitNfs: parKitNfs,
                                             parIntNfs: parIntNfs,
                                             parGesNfs: parGesNfs,
                                             parProNfs: parProNfs,
                                             parArtNfs: parArtNfs,
                                             parDesNfs: parDesNfs,
                                             parAliNfs: parAliNfs,
                                             parEstNfs: parEstNfs,
                                             parCmbNfs: parCmbNfs,
                                             parDedNfs: parDedNfs,
                                             parISSNfs: parISSNfs,
                                             parImpNfs: parImpNfs,
                                             parComNfs: parComNfs,

                                             parNfsRlz: parNfsRlz,
                                             parVlrRlz: parVlrRlz,
                                             varLucRlz: varLucRlz,
                                        }

                                        new Realizado(realizado).save().then(() => {
                                             //console.log('foi realizado')
                                             projeto.foiRealizado = true
                                             projeto.homologado = false
                                             cronograma.save().then(() => {
                                                  projeto.save().then(() => {
                                                       //console.log('sucesso novo realizado=>' + sucesso)
                                                       req.flash('success_msg', sucesso)
                                                       res.redirect('/projeto/realizar/' + req.body.id)
                                                  }).catch((err) => {
                                                       req.flash('error_msg', 'Não foi possível salvar o projeto.')
                                                       res.redirect('/projeto/consulta')
                                                  })
                                             }).catch((err) => {
                                                  req.flash('error_msg', 'Não foi possível salvar o cronograma.')
                                                  res.redirect('/projeto/consulta')
                                             })
                                        }).catch((err) => {
                                             req.flash('error_msg', 'Não foi posível realizar o projeto.')
                                             res.redirect('/projeto/consulta')
                                        })
                                   }

                              }).catch((err) => {
                                   req.flash('error_msg', 'Realizado não encontrado')
                                   res.redirect('/projeto/consulta')
                              })


                              //Para verificar alguma falha quando salva o registro do realizado
                              //console.log('user=>' + _id)
                              //console.log('projeto=>' + prj_id)
                              //console.log('nome=>' + projeto.nome)
                              //console.log('cliente=>' + projeto.cliente)
                              //console.log('dataini=>' + projeto.dataini)
                              //console.log('datafim=>' + datafim)
                              //console.log('valor=>' + projeto.valor)
                              //console.log('data=>' + dia + '/' + mes + '/' + ano)
                              //console.log('datareg=>' + datareg)
                              //console.log('totint=>' + totint)
                              //console.log('totges=>' + totges)
                              //console.log('totpro=>' + totpro)
                              //console.log('totali=>' + totali)
                              //console.log('totdes=>' + totdes)
                              //console.log('tothtl=>' + tothtl)
                              //console.log('cercamento=>' + valorCer)
                              //console.log('central=>' + valorCen)
                              //console.log('postecond=>' + valorPos)
                              //console.log('custoPlano=>' + totalPlano)
                              //console.log('vlrequ=>' + vlrequ)
                              //console.log('vlrNFS=>' + vlrPrjNFS)
                              //console.log('lucroBruto=>' + prjLucroBruto)
                              //console.log('vlrcom=>' + vlrcom)
                              //console.log('lbaimp=>' + lbaimp)

                              //console.log('impmanual=>' + impmanual)
                              //console.log('impISS=>' + impISS)
                              //console.log('impICMS=>' + impICMS)
                              //console.log('impSimples=>' + impSimples)
                              //console.log('impIRPJ=>' + impIRPJ)
                              //console.log('impIRPJAdd=>' + impIRPJAdd)
                              //console.log('impCSLL=>' + impCSLL)
                              //console.log('impPIS=>' + impPIS)
                              //console.log('impCOFINS=>' + impCOFINS)

                              //console.log('totalImposto=>' + totalImposto)
                              //console.log('lucroLiquido=>' + lucroLiquido)

                              //console.log('varCusto=>' + varCusto)
                              //console.log('varTI=>' + varTI)
                              //console.log('varLAI=>' + varLAI)
                              //console.log('varLL=>' + varLL)

                              //console.log('parLiqVlr=>' + parLiqVlr)
                              //console.log('parIntVlr=>' + parIntVlr)
                              //console.log('parGesVlr=>' + parGesVlr)
                              //console.log('parProVlr=>' + parProVlr)
                              //console.log('parDesVlr=>' + parDesVlr)
                              //console.log('parAliVlr=>' + parAliVlr)

                              //console.log('parCmbVlr=>' + parCmbVlr)
                              //console.log('parEstVlr=>' + parEstVlr)
                              //console.log('parDedVlr=>' + parDedVlr)
                              //console.log('parISSVlr=>' + parISSVlr)
                              //console.log('parImpVlr=>' + parImpVlr)
                              //console.log('parComVlr=>' + parComVlr)

                              //console.log('parLiqNfs=>' + parLiqNfs)
                              //console.log('parIntNfs=>' + parIntNfs)
                              //console.log('parGesNfs=>' + parGesNfs)
                              //console.log('parProNfs=>' + parProNfs)
                              //console.log('parDesNfs=>' + parDesNfs)
                              //console.log('parAliNfs=>' + parAliNfs)
                              //console.log('parCmbNfs=>' + parEstNfs)
                              //console.log('parEstNfs=>' + parEstNfs)
                              //console.log('parDedNfs=>' + parDedNfs)
                              //console.log('parISSNfs=>' + parISSNfs)
                              //console.log('parImpNfs=>' + parImpNfs)
                              //console.log('parComNfs=>' + parComNfs)

                              //console.log('parNfsRlz=>' + parNfsRlz)
                              //console.log('parVlrRlz=>' + parVlrRlz)
                              //console.log('varLucRlz=>' + varLucRlz)
                         }).catch((err) => {
                              req.flash('error_msg', 'Cronograma não encontrado.')
                              res.redirect('/projeto/consulta')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Empresa não encontrado.')
                         res.redirect('/projeto/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Detalhe não encontrado.')
                    res.redirect('/menu')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Projeto não encontrado<2>.')
               res.redirect('/projeto/consulta')
          })
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
     var emaberto = false
     var emexecucao = false
     var parado = false
     var homologado = false
     var realizado = false
     var funres = req.body.funres
     var classificacao = req.body.classificacao
     var status = req.body.status

     //console.log('realizado=>' + realizado)
     //console.log('classificacao=>' + classificacao)
     //console.log('funres=>' + funres)
     if (status == 'Todos' && classificacao == 'Todos' && funres == 'Todos') {
          Projeto.find({ user: id }).lean().then((projetos) => {
               Pessoa.find({ funges: 'checked' }).lean().then((responsavel) => {
                    res.render('projeto/findprojetos', { projetos, responsavel, classificacao: 'Todos', filStatus: 'Todos' })
               }).catch((err) => {
                    req.flash('error_msg', 'Nenhum projeto encontrado.')
                    res.redirect('/projeto/consulta')
               })
          })
     } else {
          if (funres == 'Todos') {
               if (status == 'Todos') {
                    //console.log('classificacao=>' + classificacao)
                    Projeto.find({ classUsina: classificacao, user: id }).lean().then((projetos) => {
                         Pessoa.find({ funges: 'checked', user: id }).lean().then((responsavel) => {
                              res.render('projeto/findprojetos', { projetos, classificacao, responsavel, filStatus: status })
                         }).catch((err) => {
                              req.flash('error_msg', 'Nenhum projeto encontrado.')
                              res.redirect('/projeto/consulta')
                         })
                    })
               } else {
                    if (classificacao == 'Todos') {
                         switch (status) {
                              case 'Em Aberto': emaberto = true
                                   break;
                              case 'Em Execução': emexecucao = true
                                   break;
                              case 'Parado': parado = true
                                   break;
                              case 'Homologado': homologado = true
                                   break;
                              case 'Realizado': realizado = true
                                   break;
                         }
                         Projeto.find({ foiRealizado: realizado, orcado: emaberto, executando: emexecucao, parado: parado, user: id }).lean().then((projetos) => {
                              Pessoa.find({ funges: 'checked', user: id }).lean().then((responsavel) => {
                                   res.render('projeto/findprojetos', { projetos, responsavel, classificacao, filStatus: status })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Nenhum projeto encontrado.')
                                   res.redirect('/projeto/consulta')
                              })
                         })
                    } else {
                         switch (status) {
                              case 'Em Aberto': emaberto = true
                                   break;
                              case 'Em Execução': emexecucao = true
                                   break;
                              case 'Parado': parado = true
                                   break;
                              case 'Homologado': homologado = true
                                   break;
                              case 'Realizado': realizado = true
                                   break;
                         }
                         Projeto.find({ classUsina: classificacao, foiRealizado: foirealizado, orcado: emaberto, executando: emexecucao, parado: parado, user: id }).lean().then((projetos) => {
                              Pessoa.find({ funges: 'checked', user: id }).lean().then((responsavel) => {
                                   res.render('projeto/findprojetos', { projetos, responsavel, classificacao, filStatus: status })
                              }).catch((err) => {
                                   req.flash('error_msg', 'Nenhum projeto encontrado.')
                                   res.redirect('/projeto/consulta')
                              })
                         })
                    }
               }
          } else {
               if (funres != 'Todos') {
                    if (realizado == 'Todos' && classificacao == 'Todos') {
                         Pessoa.findOne({ nome: funres, user: id }).lean().then((pr) => {
                              Projeto.find({ funres: pr._id }).lean().then((projetos) => {
                                   Pessoa.find({ funges: 'checked', user: id }).lean().then((responsavel) => {
                                        res.render('projeto/findprojetos', { projetos, responsavel, pr, classificacao, filStatus: status })
                                   }).catch((err) => {
                                        req.flash('error_msg', 'Nenhum projeto encontrado.')
                                        res.redirect('/projeto/consulta')
                                   })

                              })
                         })
                    } else {
                         if (realizado == 'Todos') {
                              Pessoa.findOne({ nome: funres, user: id }).lean().then((pr) => {
                                   Projeto.find({ funres: pr._id, classUsina: classificacao, }).lean().then((projetos) => {
                                        Pessoa.find({ funges: 'checked', user: id }).lean().then((responsavel) => {
                                             res.render('projeto/findprojetos', { projetos, responsavel, pr, classificacao, filStatus: status })
                                        }).catch((err) => {
                                             req.flash('error_msg', 'Nenhum projeto encontrado.')
                                             res.redirect('/projeto/consulta')
                                        })
                                   })
                              })
                         } else {
                              if (classificacao == 'Todos') {
                                   switch (status) {
                                        case 'Em Aberto': emaberto = true
                                             break;
                                        case 'Em Execução': emexecucao = true
                                             break;
                                        case 'Parado': parado = true
                                             break;
                                        case 'Homologado': homologado = true
                                             break;
                                        case 'Realizado': realizado = true
                                             break;
                                   }
                                   Pessoa.findOne({ nome: funres, user: id }).lean().then((pr) => {
                                        Projeto.find({ funres: pr._id, foiRealizado: foirealizado, orcado: emaberto, executando: emexecucao, parado: parado }).lean().then((projetos) => {
                                             Pessoa.find({ funges: 'checked', user: id }).lean().then((responsavel) => {
                                                  res.render('projeto/findprojetos', { projetos, responsavel, pr, classificacao, filStatus: status })
                                             }).catch((err) => {
                                                  req.flash('error_msg', 'Nenhum projeto encontrado.')
                                                  res.redirect('/projeto/consulta')
                                             })
                                        })
                                   })
                              } else {
                                   switch (status) {
                                        case 'Em Aberto': emaberto = true
                                             break;
                                        case 'Em Execução': emexecucao = true
                                             break;
                                        case 'Parado': parado = true
                                             break;
                                        case 'Homologado': homologado = true
                                             break;
                                        case 'Realizado': realizado = true
                                             break;
                                   }
                                   Pessoa.findOne({ nome: funres, user: id }).lean().then((pr) => {
                                        Projeto.find({ funres: pr._id, classUsina: classificacao, foiRealizado: foirealizado, orcado: emaberto, executando: emexecucao, parado: parado }).lean().then((projetos) => {
                                             Pessoa.find({ funges: 'checked', user: id }).lean().then((responsavel) => {
                                                  res.render('projeto/findprojetos', { projetos, responsavel, pr, classificacao, filStatus: status })
                                             }).catch((err) => {
                                                  req.flash('error_msg', 'Nenhum projeto encontrado.')
                                                  res.redirect('/projeto/consulta')
                                             })
                                        })
                                   })
                              }
                         }
                    }
               }
          }
     }

})

router.post('/salvarProposta/', ehAdmin, (req, res) => {
     //console.log('req.body.id=>' + req.body.id)
     var upload = multer({ storage }).single('proposta')
     upload(req, res, function (err) {
          if (err) {
               return res.end("Error uploading file.");
          } else {
               Projeto.findOne({ _id: req.body.id }).then((projeto) => {
                    var proposta
                    if (req.file != null) {
                         proposta = req.file.filename
                    } else {
                         proposta = ''
                    }
                    //console.log('proposta=>' + proposta)
                    projeto.proposta = proposta
                    projeto.save().then(() => {
                         res.redirect('/projeto/edicao/' + req.body.id)
                    }).catch((err) => {
                         req.flash('error_msg', 'Houve uma falha ao salvar o projeto.')
                         res.redirect('/projeto/edicao/' + req.body.id)
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Houve uma falha ao encontrar o projeto.')
                    res.redirect('/projeto/edicao/' + req.body.id)
               })
          }
     })
})

router.get('/mostrarProposta/:id', ehAdmin, (req, res) => {
     Projeto.findOne({ _id: req.params.id }).then((projeto) => {
          var doc = projeto.proposta
          var path = __dirname
          //console.log(path)
          path = path.replace('routes', '')
          res.sendFile(path + '/public/arquivos/' + doc)
     })
})

router.get('/confirmafinalizar/:id', ehAdmin, (req, res) => {
     var erros = []
     Realizado.findOne({ _id: req.params.id }).lean().then((realizado) => {
          Projeto.findOne({ _id: realizado.projeto }).lean().then((projeto) => {
               if (realizado.datafim == '' || typeof realizado.datafim == 'undefined') {
                    erros.push({ texto: 'É necessário preenher a data de entrega para finalizaro projeto. Preencha a data de entrega, calcule o projeto e finalize.' })
                    var varCP = false
                    var varTI = false
                    var varLAI = false
                    var varLL = false
                    var varCustoPlano = (realizado.custoPlano - projeto.custoPlano).toFixed(2)
                    if (varCustoPlano > 1) {
                         varCP = false
                    } else {
                         varCP = true
                    }
                    var varTotalImposto = parseFloat(realizado.totalImposto) - parseFloat(projeto.totalImposto).toFixed(2)
                    if (varTotalImposto > 1) {
                         varTI = true
                    } else {
                         varTI = false
                    }
                    var varlbaimp = (realizado.lbaimp - projeto.lbaimp).toFixed(2)
                    if (varlbaimp > 1) {
                         varLAI = true
                    } else {
                         varLAI = false
                    }
                    var varLucroLiquido = (realizado.lucroLiquido - projeto.lucroLiquido).toFixed(2)
                    if (varLucroLiquido > 1) {
                         varLL = true
                    } else {
                         varLL = false
                    }
                    res.render('projeto/realizado', { erros, projeto, realizado, varCustoPlano, varlbaimp, varLucroLiquido, varTotalImposto, varTI, varLL, varLAI, varCP })
               } else {
                    res.render('projeto/confirmafinalizar', { realizado })
               }
          }).catch((err) => {
               req.flash('error_msg', 'Não foi possível encontrar o projeto<Projeto>.')
               res.redirect('/projeto/consulta')
          })
     }).catch((err) => {
          req.flash('error_msg', 'Não foi possível encontrar o projeto<Realizado>.')
          res.redirect('/projeto/consulta')
     })

})

router.get('/finalizar/:id', ehAdmin, (req, res) => {
     const { _id } = req.user
     const { user } = req.user
     var id

     if (typeof user == 'undefined') {
          id = _id
     } else {
          id = user
     }
     // var sucesso = []
     Realizado.findOne({ _id: req.params.id }).then((foiRealizado) => {
          foiRealizado.foiRealizado = true
          // const idRlz = foiRealizado._id
          var usina
          //console.log(idRlz)
          foiRealizado.save().then(() => {
               Realizado.findOne({ _id: req.params.id }).lean().then((realizado) => {
                    Projeto.findOne({ _id: realizado.projeto }).lean().then((projeto) => {
                         Vistoria.findOne({ projeto: realizado.projeto }).then((vistoria) => {
                              var cadastro = dataHoje()
                              var datalimp = dataMensagem(setData(dataHoje(), 182))
                              var buscalimp = dataBusca(setData(dataHoje(), 182))
                              var datarevi = dataMensagem(setData(dataHoje(), 30))
                              var buscarevi = dataBusca(setData(dataHoje(), 30))
                              if (vistoria != null && typeof vistoria != 'undefined' && vistoria != '') {
                                   usina = {
                                        user: id,
                                        nome: projeto.nome,
                                        endereco: projeto.endereco,
                                        cliente: projeto.cliente,
                                        classificacao: projeto.classUsina,
                                        tipo: projeto.tipoUsina,
                                        area: vistoria.plaArea,
                                        qtdmod: vistoria.plaQtdMod,
                                        cadastro: cadastro,
                                        datalimp: datalimp,
                                        buscalimp: buscalimp,
                                        datarevi: datarevi,
                                        buscarevi: buscarevi
                                   }
                              } else {
                                   usina = {
                                        user: id,
                                        nome: projeto.nome,
                                        endereco: projeto.endereco,
                                        cliente: projeto.cliente,
                                        classificacao: projeto.classUsina,
                                        tipo: projeto.tipoUsina,
                                        area: 0,
                                        qtdmod: 0,
                                        cadastro: cadastro,
                                        datalimp: datalimp,
                                        buscalimp: buscalimp,
                                        datarevi: datarevi,
                                        buscarevi: buscarevi,
                                        qtdmod: projeto.qtdmod
                                   }
                              }
                              new Usina(usina).save().then(() => {
                                   Usina.find().sort({ field: 'asc', _id: -1 }).then((novausina) => {
                                        var tarefa = {
                                             user: id,
                                             usina: novausina._id,
                                             servico: 'Limpeza de Painéis',
                                             dataini: setData(dataHoje(), 182),
                                             buscadataini: dataBusca(setData(dataHoje(), 182)),
                                             datafim: setData(dataHoje(), 182),
                                             buscadatafim: dataBusca(setData(dataHoje(), 182)),
                                             cadastro: dataHoje(),
                                             concluido: false
                                        }
                                        new Tarefa(tarefa).save().then(() => {
                                             req.flash('success_msg', 'Projeto finalizado com sucesso.')
                                             //console.log('projeto._id=>' + projeto._id)
                                             res.redirect('/projeto/realizar/' + projeto._id)
                                        }).catch((err) => {
                                             req.flash('error_msg', 'Erro ao salvar a tarefa.')
                                             res.redirect('/projeto/consulta')
                                        })
                                   }).catch((err) => {
                                        req.flash('error_msg', 'Erro ao encontrar a usina.')
                                        res.redirect('/projeto/consulta')
                                   })
                              })
                         }).catch((err) => {
                              req.flash('error_msg', 'Vistoria não encontrada.')
                              res.redirect('/projeto/consulta')
                         })
                    }).catch((err) => {
                         req.flash('error_msg', 'Nenhum projeto encontrado.')
                         res.redirect('/projeto/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Nenhum projeto encontrado.')
                    res.redirect('/projeto/consulta')
               })
          }).catch((err) => {
               req.flash('error_msg', 'Houve um problema ao finalizar o projeto.')
               res.redirect('/projeto/consulta')
          })
     }).catch((err) => {
          req.flash('error_msg', 'Houve um problema ao encontrar o projeto.')
          res.redirect('/projeto/consulta')
     })
})

router.get('/executar/:id', ehAdmin, (req, res) => {
     var aviso
     const { fantasia } = req.user
     var aux
     var msg
     var redirect = ''
     Projeto.findOne({ _id: req.params.id }).then((prj_sms) => {
          Cronograma.findOne({ projeto: req.params.id }).then((cronograma) => {
               redirect = '/projeto/edicao/' + req.params.id

               //---Valida se todas as datas de entrega das atividade principais foram preenchidas--//
               aux = 'plaini'
               msg = validaCronograma(cronograma.dateplaini, aux)
               aux = 'plafim'
               msg = msg + validaCronograma(cronograma.dateplafim, aux)
               aux = 'prjini'
               msg = msg + validaCronograma(cronograma.dateprjini, aux)
               aux = 'prjfim'
               msg = msg + validaCronograma(cronograma.dateprjfim, aux)
               aux = 'ateini'
               msg = msg + validaCronograma(cronograma.dateateini, aux)
               aux = 'atefim'
               msg = msg + validaCronograma(cronograma.dateatefim, aux)
               aux = 'estini'
               msg = msg + validaCronograma(cronograma.dateestini, aux)
               aux = 'estfim'
               msg = msg + validaCronograma(cronograma.dateestfim, aux)
               aux = 'modini'
               msg = msg + validaCronograma(cronograma.datemodini, aux)
               aux = 'modfim'
               msg = msg + validaCronograma(cronograma.datemodfim, aux)
               aux = 'invini'
               msg = msg + validaCronograma(cronograma.dateinvini, aux)
               aux = 'invfim'
               msg = msg + validaCronograma(cronograma.dateinvfim, aux)
               aux = 'stbini'
               msg = msg + validaCronograma(cronograma.datestbini, aux)
               aux = 'stbfim'
               msg = msg + validaCronograma(cronograma.datestbfim, aux)
               aux = 'visini'
               msg = msg + validaCronograma(cronograma.datevisfim, aux)
               aux = 'visfim'
               msg = msg + validaCronograma(cronograma.datevisfim, aux)
               aux = 'dataentrega'
               msg = msg + validaCronograma(cronograma.dateentrega, aux)
               /*
               if (comparaDatas(req.body.valDataIns, req.body.valDataIni) == true){
                    msg = msg + 'Data de inicio das instalações deve ser maior que a data de inicio do projeto.'
               }
               */
               //------------------------------------------------------//
               //console.log('msg=>' + msg)
               if (msg == '') {
                    if (parseFloat(prj_sms.totint) > 0) {
                         Cliente.findOne({ _id: prj_sms.cliente }).then((cliente) => {
                              //Parâmentros do SMS
                              //const from = "VIMMUS"
                              const to = cliente.celular
                              const mensagem = 'Ola tudo bem? Aqui e da: ' + fantasia + '. Seu projeto sera iniciado no dia: ' + prj_sms.dataini + '. Em breve entraremos em contato. Abraco e ate logo!'
                              //Enviando SMS                              
                              //var textMessageService = new TextMessageService(apiKey)
                              //textMessageService.send('Vimmus', mensagem, [to], result => {
                              //     //console.log(result)
                              //     if (result == false) {
                              //         req.flash('error_msg', 'Falha interna. Não foi possível enviar a mensagem.')
                              //          res.redirect(redirect)
                              //     } else {                                
                              prj_sms.executando = true
                              prj_sms.parado = false
                              prj_sms.orcado = false
                              prj_sms.save().then(() => {
                                   aviso = 'Projeto em execução!'
                                   //console.log(aviso)
                                   req.flash('success_msg', aviso)
                                   res.redirect(redirect)
                              }).catch((err) => {
                                   req.flash('error_msg', 'Não foi possível salvar o projeto.')
                                   res.redirect('/projeto/consulta')
                              })
                              //}
                              //})
                              /*
                              nexmo.message.sendSms(from, to, mensagem, (err, responseData) => {
                                   if (err) {
                                        //console.log(err);

                                   } else {
                                        if (responseData.messages[0]['status'] === "0") {
                                             //console.log("Message sent successfully.");
                                            
                                        } else {
                                             //console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
                                             req.flash('error_msg', 'Mensagem não enviada.')
                                             res.redirect(redirect)
                                        }
                                   }
                              })
                              */
                         }).catch((err) => {
                              req.flash('error_msg', 'Não foi possível encontrar o cliente.')
                              res.redirect('/projeto/consulta')
                         })
                    } else {
                         aviso = 'Os custos do projeto devem ser preenchidos para executar o projeto!'
                         res.redirect(redirect)
                    }
               } else {
                    req.flash('error_msg', msg)
                    res.redirect(redirect)
               }
          }).catch((err) => {
               req.flash('error_msg', 'Não foi possível encontrar o cronograma.')
               res.redirect(redirect)
          })
     }).catch((err) => {
          req.flash('error_msg', 'Não foi possível encontrar o projeto.')
          res.redirect('/projeto/consulta')
     })
})

router.get('/motivoParar/:id', ehAdmin, (req, res) => {
     const { _id } = req.user
     const { user } = req.user
     var id

     if (typeof user == 'undefined') {
          id = _id
     } else {
          id = user
     }
     Projeto.findOne({ _id: req.params.id, user: id }).lean().then((projeto) => {
          var currenTime = new Date()
          var hoje = currenTime.toLocaleDateString()
          res.render('projeto/motivoparar', { projeto: projeto, datahoje: hoje })
     }).catch((err) => {
          req.flash('error_msg', 'Não foi possível encontrar o projeto')
          res.redirect('/projeto/consulta')
     })
})

router.post('/parar', ehAdmin, (req, res) => {
     var aviso
     const { _id } = req.user
     const { user } = req.user
     var id

     if (typeof user == 'undefined') {
          id = _id
     } else {
          id = user
     }

     Projeto.findOne({ _id: req.body.id }).then((projeto_para) => {
          projeto_para.executando = false
          projeto_para.parado = true
          if (projeto_para.tipoParado == '') {
               projeto_para.tipoParado = req.body.tipoParado
               projeto_para.motivoParado = req.body.tipoParado + ': ' + req.body.motivoParado
          } else {
               if (req.body.cbTipo != null) {
                    var textoParado = req.body.tipoParado
                    projeto_para.tipoParado = req.body.tipoParado
                    projeto_para.motivoParado = textoParado + ': ' + req.body.motivoParado
               } else {
                    //console.log('checkbox desmarcado')
                    //console.log('tipo_para=>' + projeto_para.tipoParado)
                    //console.log('texto motivo parado=>' + req.body.motivoParado)
                    projeto_para.motivoParado = projeto_para.tipoParado + ': ' + req.body.motivoParado
               }
          }

          projeto_para.dataParado = req.body.dataParado
          projeto_para.save().then(() => {
               aviso = 'Projeto parado.'
               var redirect = '/projeto/edicao/' + req.body.id
               req.flash('error_msg', aviso)
               res.redirect(redirect)
          }).catch((err) => {
               req.flash('error_msg', 'Não foi possível salvar o projeto')
               res.redirect('/projeto/consulta')
          })
     }).catch((err) => {
          req.flash('error_msg', 'Não foi possível encontrar o projeto')
          res.redirect('/projeto/consulta')
     })
})

router.get('/homologar/:id', ehAdmin, (req, res) => {
     var aviso
     var texto
     //const { fantasia } = req.user
     var redirect = '/gerenciamento/cronograma/' + req.params.id
     Cronograma.findOne({ projeto: req.params.id }).then((cronograma) => {
          //console.log('cronograma.dateEntregaReal=>' + cronograma.dateEntregaReal)
          if (cronograma.dateEntregaReal != '' && typeof cronograma.dateEntregaReal != 'undefined') {
               Projeto.findOne({ _id: req.params.id }).then((projeto) => {
                    //console.log('')
                    Cliente.findOne({ _id: projeto.cliente }).then((cliente) => {
                         var date = new Date()
                         var dia = parseFloat(date.getDate())
                         if (dia < 10) {
                              dia = '0' + dia
                         }
                         var mes = parseFloat(date.getMonth()) + 1
                         if (mes < 10) {
                              mes = '0' + mes
                         }
                         var hoje = dia + '/' + mes + '/' + date.getFullYear()
                         //Parâmentros do SMS
                         //const to = '55' + cliente.celular
                         //const mensagem = 'Ola tudo bem? Aqui e da: ' + fantasia + '. Seu projeto entro em fase de homologacao no dia: ' + hoje + '. Em breve entraremos em contato. Abraco e ate logo!'
                         //Enviando SMS                              
                         //var textMessageService = new TextMessageService(apiKey)
                         //textMessageService.send('Vimmus', mensagem, [to], result => {
                         //     //console.log(result)
                         //     if (result == false) {
                         //         req.flash('error_msg', 'Falha interna. Não foi possível enviar a mensagem.')
                         //          res.redirect(redirect)
                         //     } else {
                         //console.log('hoje=>'+hoje)
                         var valida = new Date()
                         valida.setDate(date.getDate() + 7)
                         var validaano = valida.getFullYear()
                         var validames = valida.getMonth() + parseFloat(1)
                         if (validames < 10) {
                              validames = '0' + validames
                         }
                         var validadia = valida.getDate()
                         if (validadia < 10) {
                              validadia = '0' + validadia
                         }
                         var validaHoje = validaano + '-' + validames + '-' + validadia
                         //console.log('projeto.valDataFim=>' + projeto.valDataFim)
                         //console.log('validaHoje=>' + validaHoje)
                         if (comparaDatas(projeto.valDataFim, validaHoje)) {
                              var dataValida = validadia + '/' + validames + '/' + validaano
                              texto = 'Data de entrega de finalização deve ser maior ou igual que ' + dataValida + '.'
                         } else {
                              aviso = 'Projeto em homologação!'
                              redirect = '/projeto/edicao/' + req.params.id
                              projeto.dataVisto = hoje
                              projeto.executando = false
                              projeto.parado = false
                              projeto.orcado = false
                              projeto.homologado = true
                         }
                         //console.log('aviso=>' + aviso)
                         projeto.save().then(() => {
                              req.flash('success_msg', aviso)
                              req.flash('error_msg', texto)
                              //console.log('redirect=>' + redirect)
                              res.redirect(redirect)
                         }).catch((err) => {
                              req.flash('error_msg', 'Não foi possível salvar o projeto.')
                              res.redirect('/projeto/consulta')
                         })
                         //}
                         //})
                         //Enviando SMS
                         /*
                         nexmo.message.sendSms(from, to, mensagem, (err, responseData) => {
                              if (err) {
                                   //console.log(err);
                                   req.flash('error_msg', 'Falha interna. Não foi possível enviar a mensagem.')
                                   res.redirect(redirect)
                              } else {
                                   if (responseData.messages[0]['status'] === "0") {
                                        //console.log("Message sent successfully.");

                                   } else {
                                        //console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
                                        req.flash('error_msg', 'Mensagem não enviada.')
                                        res.redirect(redirect)
                                   }
                              }
                         })
                         */

                    }).catch((err) => {
                         req.flash('error_msg', 'Falha interna para encontrar o cliente.')
                         res.redirect('/pessoa/consulta')
                    })
               }).catch((err) => {
                    req.flash('error_msg', 'Falha interna para encontrar o projeto.')
                    res.redirect('/menu')
               })
          } else {
               //console.log('não encontrou data de finalização')
               req.flash('error_msg', 'Não foi encontrado a data de entrega da finalização do projeto.')
               res.redirect(redirect)
          }
     }).catch((err) => {
          req.flash('error_msg', 'Falha interna para encontrar o cronograma.')
          res.redirect('/menu')
     })

})

module.exports = router