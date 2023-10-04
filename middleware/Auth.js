const session = require("express-session");
const jwt = require('jsonwebtoken');
const crypto = require("crypto")
require("dotenv").config();
const util = require("util")
//user authonticated or not
const userAuth = (req, res, next) => {
    try {
        if (!req.session.user || !req.cookie) {

            next()
        } else {

            res.redirect("/user-login")
        }
    } catch (error) {
        console.log(error.message);
    }
}

const logged = (req, res, next) => {
    try {
        if (req.session.user ||  req.cookie) {
            next()
        } else {
            res.redirect('/user-login')
        }
    } catch (error) {
        console.log(error.message)
    }
}

//admin authonticated or note

const adminAuth = (req, res, next) => {
    try {
        if (req.session.admin) {

            next()
        } else {
            res.redirect("/admin/login")
        }
    } catch (error) {
        console.log(error.message);
    }
}
const isAdmin = (req, res, next) => {
    try {
        if (!req.session.admin) {

            res.redirect('/admin/login')
        } else {

            next()
        }
    } catch (error) {
        console.log(error.message);
    }
}

const authonticateToken = async (req, res, next) => {
    
    let token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
  
    if(!token){
      return next();
    }
  
    const decoded = await promisify(jwt.verify)(token, process.env.JWTSECRET);
    const currentUser = await User.findById(decoded.id);
    if(!currentUser){
      return next();
    }
    req.user = currentUser;
    res.locals.user = req.user
    return next();
  }

module.exports = {
    userAuth, adminAuth, isAdmin, logged,authonticateToken
}