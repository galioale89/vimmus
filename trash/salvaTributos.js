var salvaTribtos = function(projeto, regime){

            var prjFat = regime.prjFat
            var prjLR = regime.prjLR
            var prjLP = regime.prjLP
            var vlrDAS = regime.vlrDAS
            
            var impostoIRPJ = 0
            var impostoIRPJAdd = 0
            var impostoCSLL = 0
            var impostoPIS = 0
            var impostoCOFINS = 0 
            var impostoICMS = 0
            var totalImposto = 0

            var fatadd
            var fataju

            var totalImpGrafico = 0

            //Validar calculos dos impostos
            var vlrNFS = parseFloat(projeto.valor) - parseFloat(projeto.vlrequ)
            var impNFS = parseFloat(vlrNFS) * (parseFloat(regime.alqNFS) / 100)
            projeto.vlrNFS = vlrNFS
            projeto.impNFS = impNFS

            var lucroBruto = parseFloat(projeto.valor) - parseFloat(projeto.custoTotal)
            projeto.lucroBruto = lucroBruto
  
            var lbaimp = parseFloat(lucroBruto) - parseFloat(projeto.vlrcom)
            projeto.lbaimp = lbaimp

            if (parseFloat(regime.alqICMS) > 0 || regime.alqICMS != null) {
                impostoICMS = parseFloat(projeto.vlrequ) * (parseFloat(regime.alqICMS) / 100)
                projeto.impostoICMS = impostoICMS
            }

            if (regime.regime == 'Simples') {
                var alqEfe = ((parseFloat(prjFat) * (parseFloat(regime.alqDAS) / 100)) - (parseFloat(regime.vlrred))) / parseFloat(prjFat)
                var totalSimples = parseFloat(vlrNFS) * (parseFloat(alqEfe))
                totalImpGrafico = totalSimples.toFixed(2)
                projeto.impostoSimples = totalImpGrafico.toFixed(2)
            }else {
                if (regime.regime == 'Lucro Real') {
                    projeto.impostoIRPJ = parseFloat(projeto.lbaimp) * parseFloat(regime.alqIRPJ)

                    if ((parseFloat(prjLR) / 12) > 20000) {    
                        fatadd = (parseFloat(prjLR) / 12) - 20000
                        fataju = parseFloat(fatadd) / 20000
                        impostoIRPJAdd = parseFloat(lbaimp) * parseFloat(fataju).toFixed(2) * (parseFloat(regime.alqIRPJAdd) / 100)
                        projeto.impostoAdd = impostoIRPJAdd.toFixed(2)
                   }
                   
                   impostoIRPJ = parseFloat(lbaimp) * (parseFloat(regime.alqIRPJ) / 100)
                   projeto.impostoIRPJ = impostoIRPJ

                   impostoCSLL = parseFloat(lbaimp) * (parseFloat(regime.alqCSLL) / 100)
                   projeto.impostoCSLL = impostoCSLL.toFixed(2)
                   impostoPIS = parseFloat(vlrNFS) * 0.5 * (parseFloat(regime.alqPIS) / 100)
                   projeto.impostoPIS = impostoPIS.toFixed(2)
                   impostoCOFINS = parseFloat(vlrNFS) * 0.5 * (parseFloat(regime.alqCOFINS) / 100)
                   projeto.impostoCOFINS = impostoCOFINS.toFixed(2)
                   totalImposto = parseFloat(impostoIRPJ) + parseFloat(impostoIRPJAdd) + parseFloat(impostoCSLL) + parseFloat(impostoPIS) + parseFloat(impostoCOFINS)
                   totalImpGrafico = totalImposto.toFixed(2)

                } else {

                    if (((prjLP * 0.32) / 3) > 20000) {
                        fatadd = ((parseFloat(prjLP) * 0.32) / 3) - 20000
                        fataju = parseFloat(fatadd) / 20000
                        impostoIRPJAdd = (parseFloat(vlrNFS) * 0.32) * parseFloat(fataju).toFixed(2) * (parseFloat(regime.alqIRPJAdd) / 100)
                        projeto.impostoAdd = impostoIRPJAdd
                    }

                    impostoIRPJ = parseFloat(vlrNFS) * 0.32 * (parseFloat(regime.alqIRPJ) / 100)
                    projeto.impostoIRPJ = impostoIRPJ.toFixed(2)
                    impostoCSLL = parseFloat(vlrNFS) * 0.32 * (parseFloat(regime.alqCSLL) / 100)
                    projeto.impostoCSLL = impostoCSLL.toFixed(2)
                    impostoCOFINS = parseFloat(vlrNFS) * (parseFloat(regime.alqCOFINS) / 100)
                    projeto.impostoCOFINS = parseFloat(impostoCOFINS)
                    impostoPIS = parseFloat(vlrNFS) * (parseFloat(regime.alqPIS) / 100)
                    projeto.impostoPIS = impostoPIS.toFixed(2)
                    totalImposto = parseFloat(impostoIRPJ) + parseFloat(impostoIRPJAdd) + parseFloat(impostoCSLL) + parseFloat(impostoPIS) + parseFloat(impostoCOFINS)
                    totalImpGrafico = totalImposto.toFixed(2)
                }
            }
            

            if (parseFloat(impostoICMS) > 0) {
                totalImposto = parseFloat(totalImpGrafico) + parseFloat(impNFS) + parseFloat(impostoICMS)
            } else {
                totalImposto = parseFloat(totalImpGrafico) + parseFloat(impNFS)
            }

            //projeto.totalImposto = totalImposto
            projeto.totalImposto = totalImposto.toFixed(2)

            var lucroLiquido = parseFloat(lbaimp)- parseFloat(totalImposto)
            projeto.lucroLiquido = lucroLiquido.toFixed(2)

            //Dashboard

            var parLiqVlr = parseFloat(lucroLiquido) / parseFloat(projeto.valor) * 100
            projeto.parLiqVlr = parLiqVlr.toFixed(2)
            var parLiqNfs = parseFloat(lucroLiquido) / parseFloat(vlrNFS) * 100
            projeto.parLiqNfs = parLiqNfs.toFixed(2)
            var parEquVlr = parseFloat(projeto.vlrequ) / parseFloat(projeto.valor) * 100
            projeto.parEquVlr = parEquVlr.toFixed(2)
            var parIntVlr = parseFloat(projeto.totint) / parseFloat(projeto.valor) * 100
            projeto.parIntVlr = parIntVlr.toFixed(2)
            var parGesVlr = parseFloat(projeto.totges) / parseFloat(projeto.valor) * 100
            projeto.parGesVlr = parGesVlr.toFixed(2)
            var parProVlr = parseFloat(projeto.totpro) / parseFloat(projeto.valor) * 100
            projeto.parProVlr = parProVlr.toFixed(2)

            var parDesVlr = parseFloat(projeto.totdes) / parseFloat(projeto.valor) * 100
            projeto.parDesVlr = parDesVlr.toFixed(2)
            var parISSVlr = parseFloat(impNFS) / parseFloat(projeto.valor) * 100
            projeto.parISSVlr = parISSVlr.toFixed(2)
            var parImpVlr = parseFloat(totalImpGrafico) / parseFloat(projeto.valor) * 100
            projeto.parImpVlr = parImpVlr.toFixed(2)
            var parAliVlr = parseFloat(projeto.totali) / parseFloat(projeto.valor) * 100
            projeto.parAliVlr = parAliVlr.toFixed(2)
            var parResVlr = parseFloat(projeto.resger) / parseFloat(projeto.valor) * 100
            projeto.parResVlr = parResVlr.toFixed(2)
            var parComVlr = parseFloat(projeto.vlrcom) / parseFloat(projeto.valor) * 100
            projeto.parComVlr = parComVlr.toFixed(2)
            var parDedVlr = parseFloat(projeto.custoPlano) / parseFloat(projeto.valor) * 100
            projeto.parDedVlr = parDedVlr.toFixed(2)

            projeto.save().then(() => {
                 
                return projeto._id
                
            }).catch(() => {
                req.flash('error_msg', 'Houve um erro ao criar o projeto')
                res.redirect('/')
            })
}