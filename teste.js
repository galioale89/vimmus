// App node de teste
 const express = require('express') //Rodar 'npm install express --prefix .'
 const app = express()
 const port = 21169
  
  //Rota principal da aplicacao, para acesso direto na porta
  app.get('/', (req, res) => { 
  res.send('Ola, esta aplicacao esta rodando em NodeJS versao ' + process.version);
  })

   //Conforme campo 'Caminho da Aplicação' criado no painel
   app.get('/teste', (req, res) => {
   res.send('Ola, esta aplicacao esta rodando em NodeJS versao ' + process.version);
   })
    
    app.listen(port, () => {
      console.log('App de exemplo rodando na porta ' + port)
      })
