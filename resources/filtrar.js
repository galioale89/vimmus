var filtrarProposta = function (f, id, stats, responsavel, empresa, cliente, enviado, ganho, assinado, encerrado) {
    var sql = []

    console.log('id=>' + id)
    console.log('responsavel=>' + responsavel)
    console.log('cliente=>' + cliente)
    console.log('empresa=>' + empresa)
    console.log('enviado=>' + enviado)
    console.log('ganho=>' + ganho)
    console.log('assinado=>' + assinado)
    console.log('encerrado=>' + encerrado)
    console.log('stats=>' + stats)

    if (f == 1) {
        if (cliente != 'Todos' && responsavel != 'Todos' && stats != 'Todos' && empresa != 'Todos') {
            // console.log('nt-nt-nt-nt')
            sql = { user: id, responsavel: responsavel, empresa: empresa, cliente: cliente, feito: enviado, ganho: ganho, assinado: assinado, encerrado: encerrado }
        } else {
            if (cliente == 'Todos' && responsavel == 'Todos' && stats != 'Todos' && empresa == 'Todos') {
                // console.log('t-t-nt-t')
                sql = { user: id, feito: enviado, ganho: ganho, assinado: assinado, encerrado: encerrado }
            } else {
                if (cliente != 'Todos' && responsavel == 'Todos' && stats == 'Todos' && empresa == 'Todos') {
                    // console.log('nt-t-t-t')
                    sql = { user: id, cliente: cliente }
                } else {
                    if (cliente == 'Todos' && responsavel != 'Todos' && stats != 'Todos' && empresa == 'Todos') {
                        // console.log('t-nt-nt-t')
                        sql = { user: id, responsavel: responsavel, feito: enviado, ganho: ganho, assinado: assinado, encerrado: encerrado }
                    } else {
                        if (cliente != 'Todos' && responsavel == 'Todos' && stats != 'Todos' && empresa == 'Todos') {
                            // console.log('nt-t-nt-t')
                            sql = { user: id, cliente: cliente, feito: enviado, ganho: ganho, assinado: assinado, encerrado: encerrado }
                        } else {
                            if (cliente == 'Todos' && responsavel != 'Todos' && stats == 'Todos' && empresa == 'Todos') {
                                // console.log('t-nt-t-t')
                                sql = { user: id, responsavel: responsavel }
                            } else {
                                if (cliente != 'Todos' && responsavel != 'Todos' && stats == 'Todos' && empresa == 'Todos') {
                                    // console.log('nt-nt-t-t')
                                    sql = { user: id, cliente: cliente, responsavel: responsavel }
                                } else {
                                    if (cliente != 'Todos' && responsavel != 'Todos' && stats != 'Todos' && empresa == 'Todos') {
                                        // console.log('nt-nt-nt-t')
                                        sql = { user: id, cliente: cliente, responsavel: responsavel, feito: enviado, ganho: ganho, assinado: assinado, encerrado: encerrado }
                                    } else {
                                        if (cliente == 'Todos' && responsavel != 'Todos' && stats != 'Todos' && empresa != 'Todos') {
                                            // console.log('t-nt-nt-nt')
                                            sql = { user: id, responsavel: responsavel, feito: enviado, ganho: ganho, assinado: assinado, encerrado: encerrado, empresa: empresa }
                                        } else {
                                            if (cliente != 'Todos' && responsavel == 'Todos' && stats != 'Todos' && empresa != 'Todos') {
                                                // console.log('nt-t-nt-nt')
                                                sql = { user: id, cliente: cliente, feito: enviado, ganho: ganho, assinado: assinado, encerrado: encerrado, empresa: empresa }
                                            } else {
                                                if (cliente == 'Todos' && responsavel != 'Todos' && stats == 'Todos' && empresa != 'Todos') {
                                                    // console.log('t-nt-t-nt')
                                                    sql = { user: id, responsavel: responsavel, empresa: empresa }
                                                } else {
                                                    if (cliente != 'Todos' && responsavel != 'Todos' && stats == 'Todos' && empresa != 'Todos') {
                                                        // console.log('nt-nt-t-nt')
                                                        sql = { user: id, cliente: cliente, responsavel: responsavel, empresa: empresa }
                                                    } else {
                                                        // console.log('t-t-t-nt')
                                                        sql = { user: id, empresa: empresa }
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
    } else {
        
            if (responsavel != 'Todos' && cliente == 'Todos') {
                sql = { user: id, responsavel: responsavel }
            } else {
                if (responsavel == 'Todos' && cliente != 'Todos') {
                    sql = { user: id, cliente: cliente }
                } else {
                    sql = { user: id }
                }
            }
        
    }

    return sql
}

module.exports = filtrarProposta
