const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Projeto = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'usuario',
        require: false,
    },
    nome: {
        type: String,
        require: true
    },
    cidade: {
        type: String,
        require: true
    },
    uf: {
        type: String,
        require: true
    },
    cliente: {
        type: String,
        require: false
    },
    nomecliente: {
        type: String,
        require: false
    },
    classUsina: {
        type: String,
        require: false
    },
    grupoUsina: {
        type: String,
        require: false
    },
    tipoUsina: {
        type: String,
        require: false
    },    
    valor: {
        type: Number,
        require: true
    },
    vlrequ: {
        type: Number,
        require: true
    },
    vlrkit: {
        type: Number,
        require: true
    },
    fatequ: {
        type: Boolean,
        require: true
    },
    vlrfat: {
        type: Number,
        require: true
    },
    potencia: {
        type: String,
        require: false
    },
    vrskwp: {
        type: Number,
        require: false
    },
    qtdequipe: {
        type: Number,
        require: false
    },
    equipe: {
        type: Schema.Types.ObjectId,
        ref: 'equipe',
        require: false
    },
    tothrs: {
        type: Number,
        require: false
    },
    diastr: {
        type: Number,
        require: false
    },
    trbatr: {
        type: Number,
        require: false
    },
    uniatr: {
        type: Number,
        require: false
    },
    totatr: {
        type: Number,
        require: false
    },
    trbest: {
        type: Number,
        require: false
    },
    uniest: {
        type: Number,
        require: false
    },
    totest: {
        type: Number,
        require: false
    },
    unimod: {
        type: Number,
        require: false
    },
    trbmod: {
        type: Number,
        require: false
    },
    totmod: {
        type: Number,
        require: false
    },
    trbinv: {
        type: Number,
        require: false
    },
    uniinv: {
        type: Number,
        require: false
    },
    totinv: {
        type: Number,
        require: false
    },
    vlrhri: {
        type: Number,
        require: false
    },
    trbint: {
        type: Number,
        require: false
    },
    totint: {
        type: Number,
        require: false
    },
    unisit: {
        type: Number,
        require: false
    },
    trbsit: {
        type: Number,
        require: false
    },
    totsit: {
        type: Number,
        require: false
    },
    uniuni: {
        type: Number,
        require: false
    },
    trbuni: {
        type: Number,
        require: false
    },
    totuni: {
        type: Number,
        require: false
    },
    unidis: {
        type: Number,
        require: false
    },
    trbdis: {
        type: Number,
        require: false
    },
    totdis: {
        type: Number,
        require: false
    },
    uniate: {
        type: Number,
        require: false
    },
    trbate: {
        type: Number,
        require: false
    },
    totate: {
        type: Number,
        require: false
    },
    unimem: {
        type: Number,
        require: false
    },
    trbmem: {
        type: Number,
        require: false
    },
    totmem: {
        type: Number,
        require: false
    },
    vlrart: {
        type: Number,
        require: false
    },
    uniart: {
        type: Number,
        require: false
    },
    trbart: {
        type: Number,
        require: false
    },
    totart: {
        type: Number,
        require: false
    },
    vlrhrp: {
        type: Number,
        require: false
    },
    trbpro: {
        type: Number,
        require: false
    },
    totpro: {
        type: Number,
        require: false
    },
    totpro_art: {
        type: Number,
        require: false
    },
    trbesc: {
        type: Number,
        require: false
    },
    totesc: {
        type: Number,
        require: false
    },
    trbvis: {
        type: Number,
        require: false
    },
    totvis: {
        type: Number,
        require: false
    },
    trbcom: {
        type: Number,
        require: false
    },
    totcom: {
        type: Number,
        require: false
    },
    trbcro: {
        type: Number,
        require: false
    },
    totcro: {
        type: Number,
        require: false
    },
    trbaqi: {
        type: Number,
        require: false
    },
    totaqi: {
        type: Number,
        require: false
    },
    trbrec: {
        type: Number,
        require: false
    },
    totrec: {
        type: Number,
        require: false
    },
    vlrhrg: {
        type: Number,
        require: false
    },
    trbges: {
        type: Number,
        require: false
    },
    totges: {
        type: Number,
        require: false
    },
    vlrdia: {
        type: Number,
        require: false
    },
    tothtl: {
        type: Number,
        require: false
    },
    discmb: {
        type: Number,
        require: false
    },
    ltocmb: {
        type: Number,
        require: false
    },
    totcmb: {
        type: Number,
        require: false
    },
    vlrali: {
        type: Number,
        require: false
    },
    totali: {
        type: Number,
        require: false
    },
    totdes: {
        type: Number,
        require: false
    },
    custofix: {
        type: Number,
        require: false
    },
    custovar: {
        type: Number,
        require: false
    },
    custoest: {
        type: Number,
        require: false
    },            
    totcop: {
        type: Number,
        require: false
    },
    reserva: {
        type: Number,
        require: false
    },
    rescon: {
        type: Number,
        require: false
    },
    resger: {
        type: Number,
        require: false
    },
    conadd: {
        type: Number,
        require: false
    },
    outcer: {
        type: Number,
        require: false
    },
    outpos: {
        type: Number,
        require: false
    },
    impele: {
        type: Number,
        require: false
    },
    recLiquida: {
        type: Number,
        require: true
    },
    seguro: {
        type: Number,
        require: false
    },
    percom: {
        type: Number,
        require: false
    },
    vlrcom: {
        type: Number,
        require: false
    },
    impostoSimples: {
        type: Number,
        require: false
    },
    impostoIRPJ: {
        type: Number,
        require: false
    },
    impostoAdd: {
        type: Number,
        require: false
    },
    impostoCSLL: {
        type: Number,
        require: false
    },
    impostoICMS: {
        type: Number,
        require: false
    },
    impostoPIS: {
        type: Number,
        require: false
    },
    impostoCOFINS: {
        type: Number,
        require: false
    },
    totalImposto: {
        type: Number,
        require: false
    },
    totalTributos: {
        type: Number,
        require: false
    },
    custoPlano: {
        type: Number,
        require: false
    },
    custoTotal: {
        type: Number,
        require: false
    },
    lbaimp: {
        type: Number,
        require: false
    },
    impNFS: {
        type: Number,
        require: false
    },
    vlrNFS: {
        type: Number,
        require: false
    },
    lucroBruto: {
        type: Number,
        require: false
    },
    desAdm: {
        type: Number,
        require: false
    },
    lucroLiquido: {
        type: Number,
        require: false
    },
    parLiqVlr: {
        type: Number,
        require: false
    },
    parKitVlr: {
        type: Number,
        require: false
    },
    parKitEqu: {
        type: Number,
        require: false
    },    
    parModEqu: {
        type: Number,
        require: false
    },
    parInvEqu: {
        type: Number,
        require: false
    },
    parEstEqu: {
        type: Number,
        require: false
    },
    parCabEqu: {
        type: Number,
        require: false
    },
    parDpsEqu: {
        type: Number,
        require: false
    },
    parDisEqu: {
        type: Number,
        require: false
    },
    parSbxEqu: {
        type: Number,
        require: false
    },
    parCerEqu: {
        type: Number,
        require: false
    },       
    parCenEqu: {
        type: Number,
        require: false
    },       
    parPosEqu: {
        type: Number,
        require: false
    },                                        
    parIntVlr: {
        type: Number,
        require: false
    },
    parGesVlr: {
        type: Number,
        require: false
    },
    parProVlr: {
        type: Number,
        require: false
    },
    parArtVlr: {
        type: Number,
        require: false
    },
    parDesVlr: {
        type: Number,
        require: false
    },
    parCmbVlr: {
        type: Number,
        require: false
    },
    parAliVlr: {
        type: Number,
        require: false
    },
    parEstVlr: {
        type: Number,
        require: false
    },
    parISSVlr: {
        type: Number,
        require: false
    },
    parImpVlr: {
        type: Number,
        require: false
    },
    parResVlr: {
        type: Number,
        require: false
    },
    parDedVlr: {
        type: Number,
        require: false
    },
    parComVlr: {
        type: Number,
        require: false
    },
    parLiqNfs: {
        type: Number,
        require: false
    },
    parKitNfs: {
        type: Number,
        require: false
    },
    parIntNfs: {
        type: Number,
        require: false
    },
    parGesNfs: {
        type: Number,
        require: false
    },
    parProNfs: {
        type: Number,
        require: false
    },
    parArtNfs: {
        type: Number,
        require: false
    },
    parDesNfs: {
        type: Number,
        require: false
    },
    parCmbNfs: {
        type: Number,
        require: false
    },
    parAliNfs: {
        type: Number,
        require: false
    },
    parEstNfs: {
        type: Number,
        require: false
    },
    parISSNfs: {
        type: Number,
        require: false
    },
    parImpNfs: {
        type: Number,
        require: false
    },
    parResNfs: {
        type: Number,
        require: false
    },
    parDedNfs: {
        type: Number,
        require: false
    },
    parComNfs: {
        type: Number,
        require: false
    },
    configuracao: {
        type: Schema.Types.ObjectId,
        ref: 'configuracao',
        require: false
    },
    regime: {
        type: Schema.Types.ObjectId,
        ref: 'regime',
        require: false
    },
    premissas: {
        type: String,
        require: false
    },
    requisitos: {
        type: String,
        require: false
    },
    vendedor: {
        type: Schema.Types.ObjectId,
        ref: 'pessoa',
        require: false
    },
    funres: {
        type: Schema.Types.ObjectId,
        ref: 'pessoa',
        require: false
    },
    funpro: {
        type: Schema.Types.ObjectId,
        ref: 'pessoa',
        require: false
    },
    funins: {
        type: Schema.Types.ObjectId,
        ref: 'pessoa',
        require: false
    },
    ehDireto: {
        type: Boolean,
        require: true
    },
    temCercamento: {
        type: String,
        require: false
    },
    temCentral: {
        type: String,
        require: false
    },    
    temEstSolo: {
        type: String,
        require: false
    },
    temPosteCond: {
        type: String,
        require: false
    },
    foiRealizado: {
        type: Boolean,
        require: true
    },
    dataIns: {
        type: String,
        require: true
    },
    valDataIns: {
        type: String,
        require: true
    },
    dataini: {
        type: String,
        require: true
    },
    dataprev: {
        type: String,
        require: true
    },
    valDataPrev: {
        type: String,
        require: true
    },
    dataord: {
        type: String,
        require: true
    },
    ultdata: {
        type: String,
        require: false
    },
    motivo: {
        type: String,
        require: false
    },
    motivoParado: {
        type: String,
        require: false
    },
    tipoParado: {
        type: String,
        require: false
    },
    dataParado: {
        type: String,
        require: false
    },
    atrasado: {
        type: Boolean,
        require: false
    },
    datafim: {
        type: String,
        require: false
    },
    valDataFim: {
        type: String,
        require: false
    },
    data: {
        type: String,
        require: false
    },
    datareg: {
        type: Number,
        require: false
    },
    datapadrao: {
        type: Date,
        default: Date.now()
    },
    executando: {
        type: Boolean,
        require: false
    },
    parado: {
        type: Boolean,
        require: false
    },
    orcado: {
        type: Boolean,
        require: false
    },
    homologado: {
        type: Boolean,
        require: false
    }
})

mongoose.model('projeto', Projeto)