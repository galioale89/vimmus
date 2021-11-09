const Mongoose = require("mongoose")
const Schema = Mongoose.Schema

const Vistoria = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'usuario',
        require: false,
    },
    proposta: {
        type: Schema.Types.ObjectId,
        ref: 'proposta',
        require: false,
    },
    projeto: {
        type: Schema.Types.ObjectId,
        ref: 'projeto',
        require: false,
    },
    tecnico: {
        type: Schema.Types.ObjectId,
        ref: 'pessoa',
        require: false,
    },
    ateFuracao: {
        type: String,
        require: false
    },
    dtAteFuracao: {
        type: Date,
        require: false,
    },
    fotoAteFuracao: {
        type: Date,
        require: false,
    },
    ateDistancia: {
        type: String,
        require: false
    },
    dtAteDistancia: {
        type: Date,
        require: false,
    },
    fotoAteDistancia: {
        type: Date,
        require: false,
    },
    ateFixarHaste: {
        type: String,
        require: false
    },
    dtAteFixarHaste: {
        type: Date,
        require: false,
    },
    fotoAteFixarHaste: {
        type: Date,
        require: false,
    },
    ateConexao: {
        type: String,
        require: false
    },
    dtAteConexao: {
        type: Date,
        require: false,
    },
    fotoAteConexao: {
        type: Date,
        require: false,
    },
    stbDisjutores: {
        type: String,
        require: false
    },
    dtStbDisjutores: {
        type: Date,
        require: false,
    },
    stbEletrocalhas: {
        type: String,
        require: false
    },
    dtStbEletrocalhas: {
        type: Date,
        require: false,
    },
    dtStbEletrocalhas: {
        type: Date,
        require: false,
    },
    fotoStbEletrocalhas: {
        type: Date,
        require: false,
    },
    stbLigacaoAC: {
        type: String,
        require: false
    },
    dtStbLigacaoAC: {
        type: Date,
        require: false,
    },
    fotoStbLigacaoAC: {
        type: Date,
        require: false,
    },
    stbLigacaoDC: {
        type: String,
        require: false
    },
    dtStbLigacaoDC: {
        type: Date,
        require: false,
    },
    fotoStbLigacaoDC: {
        type: Date,
        require: false,
    },
    stbInstalDPS: {
        type: String,
        require: false
    },
    dtStbInstalDPS: {
        type: Date,
        require: false,
    },
    fotoStbInstalDPS: {
        type: Date,
        require: false,
    },
    stbInstalCaixa: {
        type: String,
        require: false
    },
    dtStbInstalCaixa: {
        type: Date,
        require: false,
    },
    fotoStbInstalCaixa: {
        type: Date,
        require: false,
    },
    invFixar: {
        type: String,
        require: false
    },
    dtInvFixar: {
        type: Date,
        require: false
    },
    fotoInvFixar: {
        type: Date,
        require: false
    },
    invCabos: {
        type: String,
        require: false
    },
    dtInvCabos: {
        type: Date,
        require: false
    },
    fotoInvCabos: {
        type: Date,
        require: false
    },
    invFrequencia: {
        type: String,
        require: false
    },
    dtInvFrequencia: {
        type: Date,
        require: false
    },
    fotoInvFrequencia: {
        type: Date,
        require: false
    },
    invTensao: {
        type: String,
        require: false
    },
    dtInvTensao: {
        type: Date,
        require: false
    },
    fotoInvTensao: {
        type: Date,
        require: false
    },
    invString: {
        type: String,
        require: false
    },
    dtInvString: {
        type: Date,
        require: false
    },
    fotoInvString: {
        type: Date,
        require: false
    },
    invCorrente: {
        type: String,
        require: false
    },
    dtInvCorrente: {
        type: Date,
        require: false
    },
    fotoInvCorrente: {
        type: Date,
        require: false
    },
    invPontoConexao: {
        type: String,
        require: false
    },
    dtInvPontoConexao: {
        type: Date,
        require: false
    },
    fotoInvPontoConexao: {
        type: Date,
        require: false
    },
    estFixar: {
        type: String,
        require: false
    },
    dtEstFixar: {
        type: Date,
        require: false
    },
    fotoEstFixar: {
        type: Date,
        require: false
    },
    estFuracao: {
        type: String,
        require: false
    },
    dtEstFuracao: {
        type: Date,
        require: false
    },
    fotoEstFuracao: {
        type: Date,
        require: false
    },
    estAnalise: {
        type: String,
        require: false
    },
    dtEstAnalise: {
        type: Date,
        require: false
    },
    fotoEstAnalise: {
        type: Date,
        require: false
    },
    estLinhaVida: {
        type: String,
        require: false
    },
    dtEstLinhaVida: {
        type: Date,
        require: false
    },
    fotoEstLinhaVida: {
        type: Date,
        require: false
    },
    estVerificacao: {
        type: String,
        require: false
    },
    dtEstVerificacao: {
        type: Date,
        require: false
    },
    fotoEstVerificacao: {
        type: Date,
        require: false
    },
    modFixar: {
        type: String,
        require: false
    },
    dtModFixar: {
        type: Date,
        require: false
    },
    fotoModFixar: {
        type: Date,
        require: false
    },
    modCabos: {
        type: String,
        require: false
    },
    dtModCabos: {
        type: Date,
        require: false
    },
    fotoModCabos: {
        type: Date,
        require: false
    },
    modConexao: {
        type: String,
        require: false
    },
    dtModConexao: {
        type: Date,
        require: false
    },
    fotoModConexao: {
        type: Date,
        require: false
    },
    modCanaletas: {
        type: String,
        require: false
    },
    dtModCanaletas: {
        type: Date,
        require: false
    },
    fotoModCanaletas: {
        type: Date,
        require: false
    },
    modAmarra: {
        type: String,
        require: false
    },
    dtModAmarra: {
        type: Date,
        require: false
    },
    fotoModAmarra: {
        type: Date,
        require: false
    },
    modConInv: {
        type: String,
        require: false
    },
    dtModConInv: {
        type: Date,
        require: false
    },
    fotoModConInv: {
        type: Date,
        require: false
    },
    plaSombra: {
        type: String,
        require: false
    },
    dtPlaSombra: {
        type: String,
        require: false
    },
    fotoPlaSombra: {
        type: String,
        require: false
    },
    plaAte: {
        type: String,
        require: false
    },
    dtPlaAte: {
        type: String,
        require: false
    },
    fotoPlaAte: {
        type: String,
        require: false
    },
    plaArea: {
        type: String,
        require: false
    },
    dtPlaArea: {
        type: String,
        require: false
    },
    fotoPlaArea: {
        type: String,
        require: false
    },
    plaInvStb: {
        type: String,
        require: false
    },
    dtPlaInvStb: {
        type: String,
        require: false
    },
    fotoPlaInvStb: {
        type: String,
        require: false
    },
    plaDimArea: {
        type: Number,
        require: false
    },
    plaQtdMod: {
        type: Number,
        require: false
    },
    plaWattMod: {
        type: Number,
        require: false
    },
    plaQtdInv: {
        type: Number,
        require: false
    },
    plaKwpInv: {
        type: Number,
        require: false
    },
    plaQtdString: {
        type: Number,
        require: false
    },
    plaModString: {
        type: Number,
        require: false
    },
    plaComponentes: {
        type: String,
        require: false
    },
    plaQtdComponentes: {
        type: Number,
        require: false
    },
    plaQtdEst: {
        type: Number,
        require: false
    },
    caminhoAte:{
        type: Array,
        require: false,
    },
    caminhoInv:{
        type: Array,
        require: false,
    },
    caminhoStb:{
        type: Array,
        require: false,
    },
    caminhoMod:{
        type: Array,
        require: false,
    },                      
    feito: {
        type: Boolean,
        require: false
    },    
})

Mongoose.model('vistoria', Vistoria)