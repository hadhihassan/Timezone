const session = require("express-session");
const jwt = require('jsonwebtoken');
const crypto = require("crypto")
require("dotenv").config();
const util = require("util")
//user authonticated or not
const userAuth = (req, res, next) => {
    try {
        if (!req.session.user) {

            next()
        } else {

            res.redirect("/")
        }
    } catch (error) {
        console.log(error.message);
    }
}

const logged = (req, res, next) => {
    try {
        if (req.session.user) {
            next()
        } else {
            res.redirect('/')
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

const authonticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        if (token == null) return res.sendStatus(401)

        jwt.verify(token, process.env.JWTSECRET, (err, user) => {
            if (err) return res.sendStatus(403)
            req.user = user
            next()
        })
    } catch (error) {

    }
}
module.exports = {
    userAuth, adminAuth, isAdmin, logged,authonticateToken
}