module.exports = {
    ehMaster: function (req,res, next) {
           
      if (req.isAuthenticated() && req.user.ehAdmin == 0 ){
          return next()
      }
        req.flash("error_msg", "Você precisa ser um usuário master.")
        req.logout();
        res.redirect("/")
    }   
  } 