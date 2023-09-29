const express = require("express")
const app = express()
const mongoose = require('mongoose')
const PORT = 3000
const session = require('express-session')
require("dotenv").config();
const adminRoute = require('./Route/adminRoute');
const customerRoute = require('./Route/customerRoute')
const flash = require('express-flash')
const cookieParser = require("cookie-parser")
const nocache = require("nocache")
const multer = require("multer")
const morgan = require('morgan')
// const razorpay = require("razorpay")
app.use(morgan('dev'));
app.use(flash())
app.use(nocache())
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(session({
    secret: '%$534j57rh47hdfgfd37284', // Change this to a strong, unique secret key
    resave: false,
    saveUninitialized: true,
   
}));

app.use("/", customerRoute)
app.use("/admin", adminRoute)

mongoose
    .connect('mongodb://127.0.0.1:27017/WATCH_SHOP_DATABASE')
    .then(() => console.log("DATABASE CONNECTED"))
    .catch((error) => console.log(error))


app.listen(PORT, () => console.log("Server Running"))

