module.exports = {
  ehAdmin: function (req,res, next) {

    // console.log(req.user)
         
    if (req.isAuthenticated() && (req.user.ehAdmin == 1 || req.user.ehAdmin == 0)){
        return next()
    }
      req.flash("error_msg", "Você precisa ser um usuário administrador.")
      req.logout();
      res.redirect("/")
  }   
} 