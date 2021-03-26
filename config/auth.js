const localStrategy = require("passport-local").Strategy
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

//Model Usuario
require("../model/Usuario") 
const Usuario = mongoose.model("usuario")

module.exports = function (passport) {

    passport.use(new localStrategy({usernameField: 'usuario', passwordField: 'senha'}, (usuario, senha, done) => {

        Usuario.findOne({usuario: usuario}).then((user) => {
            
            if (!user) {
                return done(null, false, { message: "Esta conta não existe" })
            }
        
        bcrypt.compare(senha, user.senha, (erro, batem)=>{

            if (batem){
                return done(null, user)
            }else{
                return done(null, false, {message: "Senha incorreta"})
            }

        })
       })

    }))

    passport.serializeUser((usuario, done)=>{
        done(null, usuario.id)
    })

    passport.deserializeUser((_id, done)=>{
           Usuario.findById(_id, (err, usuario)=>{
               done(err, usuario)
           })
    })
}

