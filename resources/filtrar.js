var filtrarProposta = function (f, id, stats, vendedor, motivo, responsavel, empresa, cliente, enviado, ganho, assinado, encerrado, baixado) {
    var sql = []
    // console.log('id=>' + id)
    // console.log('responsavel=>' + responsavel)
    // console.log('cliente=>' + cliente)
    // console.log('empresa=>' + empresa)
    // console.log('enviado=>' + enviado)
    // console.log('ganho=>' + ganho)
    // console.log('assinado=>' + assinado)
    // console.log('encerrado=>' + encerrado)
    // console.log('stats=>' + stats)

    if (f == 1) {
        if (cliente == 'Todos' && responsavel == 'Todos' && stats == 'Todos' && empresa == 'Todos') {
            sql = { user: id }
        } else {
            if (cliente != 'Todos' && responsavel != 'Todos' && stats != 'Todos' && empresa != 'Todos') {
                // console.log('nt-nt-nt-nt')
                sql = { user: id, responsavel: responsavel, empresa: empresa, cliente: cliente, feito: enviado, ganho: ganho, assinado: assinado, encerrado: encerrado, baixada: baixado }
            } else {
                if (cliente == 'Todos' && responsavel == 'Todos' && stats != 'Todos' && empresa == 'Todos') {
                    // console.log('t-t-nt-t')
                    sql = { user: id, feito: enviado, ganho: ganho, assinado: assinado, encerrado: encerrado, baixada: baixado }
                } else {
                    if (cliente != 'Todos' && responsavel == 'Todos' && stats == 'Todos' && empresa == 'Todos') {
                        // console.log('nt-t-t-t')
                        sql = { user: id, cliente: cliente }
                    } else {
                        if (cliente == 'Todos' && responsavel != 'Todos' && stats != 'Todos' && empresa == 'Todos') {
                            // console.log('t-nt-nt-t')
                            sql = { user: id, responsavel: responsavel, feito: enviado, ganho: ganho, assinado: assinado, encerrado: encerrado, baixada: baixado }
                        } else {
                            if (cliente != 'Todos' && responsavel == 'Todos' && stats != 'Todos' && empresa == 'Todos') {
                                // console.log('nt-t-nt-t')
                                sql = { user: id, cliente: cliente, feito: enviado, ganho: ganho, assinado: assinado, encerrado: encerrado, baixada: baixado }
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
                                            sql = { user: id, cliente: cliente, responsavel: responsavel, feito: enviado, ganho: ganho, assinado: assinado, encerrado: encerrado, baixada: baixado }
                                        } else {
                                            if (cliente == 'Todos' && responsavel != 'Todos' && stats != 'Todos' && empresa != 'Todos') {
                                                // console.log('t-nt-nt-nt')
                                                sql = { user: id, responsavel: responsavel, feito: enviado, ganho: ganho, assinado: assinado, encerrado: encerrado, baixada: baixado, empresa: empresa }
                                            } else {
                                                if (cliente != 'Todos' && responsavel == 'Todos' && stats != 'Todos' && empresa != 'Todos') {
                                                    // console.log('nt-t-nt-nt')
                                                    sql = { user: id, cliente: cliente, feito: enviado, ganho: ganho, assinado: assinado, encerrado: encerrado, baixada: baixado, empresa: empresa }
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
        }
    } else {
        if (f == 2) {
            if (responsavel == 'Todos' && cliente == 'Todos' && empresa == 'Todos') {
                sql = { user: id }
            } else {
                if (responsavel != 'Todos' && cliente != 'Todos' && empresa != 'Todos') {
                    sql = { user: id, cliente: cliente, responsavel: responsavel, empresa: empresa }
                } else {
                    if (responsavel != 'Todos' && cliente != 'Todos' && empresa == 'Todos') {
                        sql = { user: id, cliente: cliente, responsavel: responsavel }
                    } else {
                        if (responsavel != 'Todos' && cliente == 'Todos' && empresa == 'Todos') {
                            sql = { user: id, responsavel: responsavel }
                        } else {
                            if (responsavel == 'Todos' && cliente != 'Todos' && empresa == 'Todos') {
                                sql = { user: id, cliente: cliente }
                            } else {
                                if (responsavel != 'Todos' && cliente == 'Todos' && empresa != 'Todos') {
                                    sql = { user: id, responsavel: responsavel }
                                } else {
                                    if (responsavel == 'Todos' && cliente != 'Todos' && empresa != 'Todos') {
                                        sql = { user: id, cliente: cliente }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } else {
            if (f == 3) {
                if (motivo == 'Todos' && cliente == 'Todos' && empresa == 'Todos' && responsavel == 'Todos') {
                    sql = { user: id }
                } else {
                    if (motivo != 'Todos' && cliente != 'Todos' && empresa != 'Todos' && responsavel == 'Todos') {
                        sql = { user: id, cliente: cliente, motivo: motivo, empresa: empresa }
                    } else {
                        if (motivo != 'Todos' && cliente != 'Todos' && empresa == 'Todos' && responsavel == 'Todos') {
                            sql = { user: id, cliente: cliente, motivo: motivo }
                        } else {
                            if (motivo != 'Todos' && cliente == 'Todos' && empresa == 'Todos' && responsavel == 'Todos') {
                                sql = { user: id, motivo: motivo }
                            } else {
                                if (motivo == 'Todos' && cliente != 'Todos' && empresa == 'Todos' && responsavel == 'Todos') {
                                    sql = { user: id, cliente: cliente }
                                } else {
                                    if (motivo != 'Todos' && cliente == 'Todos' && empresa != 'Todos' && responsavel == 'Todos') {
                                        sql = { user: id, motivo: motivo }
                                    } else {
                                        if (motivo == 'Todos' && cliente != 'Todos' && empresa != 'Todos' && responsavel == 'Todos') {
                                            sql = { user: id, empresa: empresa, responsavel: responsavel, cliente: cliente }
                                        } else {
                                            if (motivo == 'Todos' && cliente == 'Todos' && empresa == 'Todos' && responsavel != 'Todos') {
                                                sql = { user: id, responsavel: responsavel }
                                            } else {
                                                if (motivo != 'Todos' && cliente != 'Todos' && empresa != 'Todos' && responsavel != 'Todos') {
                                                    sql = { user: id, cliente: cliente, motivo: motivo, empresa: empresa, responsavel: responsavel }
                                                } else {
                                                    if (motivo != 'Todos' && cliente != 'Todos' && empresa == 'Todos' && responsavel != 'Todos') {
                                                        sql = { user: id, cliente: cliente, motivo: motivo, responsavel: responsavel }
                                                    } else {
                                                        if (motivo != 'Todos' && cliente == 'Todos' && empresa == 'Todos' && responsavel != 'Todos') {
                                                            sql = { user: id, motivo: motivo, responsavel: responsavel }
                                                        } else {
                                                            if (motivo == 'Todos' && cliente != 'Todos' && empresa == 'Todos' && responsavel != 'Todos') {
                                                                sql = { user: id, cliente: cliente, responsavel: responsavel }
                                                            } else {
                                                                if (motivo != 'Todos' && cliente == 'Todos' && empresa != 'Todos' && responsavel != 'Todos') {
                                                                    sql = { user: id, motivo: motivo, responsavel: responsavel }
                                                                } else {
                                                                    if (motivo == 'Todos' && cliente != 'Todos' && empresa != 'Todos' && responsavel != 'Todos') {
                                                                        sql = { user: id, cliente: cliente, empresa: empresa, responsavel: responsavel }
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
            } else {
                // if (vendedor == 'Todos' && cliente == 'Todos' && stats == 'Todos') {
                //     sql = { user: id }
                // } else {
                    if (vendedor != 'Todos' && cliente != 'Todos' && stats != 'Todos') {
                        sql = {cliente: cliente, vendedor: vendedor, status: stats }
                    } else {
                        if (vendedor != 'Todos' && cliente != 'Todos' && stats == 'Todos') {
                            sql = {cliente: cliente, vendedor: vendedor }
                        } else {
                            if (vendedor != 'Todos' && cliente == 'Todos' && stats == 'Todos') {
                                sql = {vendedor: vendedor }
                            } else {
                                if (vendedor == 'Todos' && cliente != 'Todos' && stats == 'Todos') {
                                    sql = {cliente: cliente }
                                } else {
                                    if (vendedor != 'Todos' && cliente == 'Todos' && stats != 'Todos') {
                                        sql = {vendedor: vendedor }
                                    } else {
                                        if (vendedor == 'Todos' && cliente != 'Todos' && stats != 'Todos') {
                                            sql = {cliente: cliente }
                                        }
                                    }
                                }
                            }
                        }
                    }
                //}
            }
        }
    }
    console.log('sql filtro=>'+JSON.stringify(sql))
    return sql
}

module.exports = filtrarProposta