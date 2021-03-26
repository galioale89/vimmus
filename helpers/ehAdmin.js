module.exports = {
  ehAdmin: function (req,res, next) {
         
    if (req.isAuthenticated() && req.user.ehAdmin == 1 ){
        return next()
    }
      req.flash("error_msg", "Você precisa ser um usuário administrador.")
      res.redirect("/")
  }   
} 