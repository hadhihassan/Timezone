const session = require("express-session");



//user authonticated or not
const   userAuth = (req, res, next) => {
    try {
        if(!req.session.user){
            
            next()
        }else{
           
           res.redirect("/")
        }
    } catch (error) {
        console.log(error.message);
    }
}

const logged = (req,res,next) => {
    try{
        if(req.session.user){
            next()
        }else{
            res.redirect('/')
        }
    } catch (error){
        console.log(error.message)
    }
}

//admin authonticated or note

const adminAuth = (req,res,next) => {
    try {
        if(req.session.admin){
            
            next()
        }else{
            res.redirect("/admin/login")
        }
    } catch (error) {
        console.log(error.message);
    }
}
const isAdmin = (req,res,next) => {
    try {
       if(!req.session.admin){

        res.redirect('/admin/login')
       }else{

        next()
       }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    userAuth, adminAuth, isAdmin,logged,
}