const env = require("./env.config");
const nodemailer = require('nodemailer')

//EMAIL SENDER 
let transporter = nodemailer.createTransport({
    service: "Gmail",
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: env.AUTH_EMAIL,
        pass: env.AUTH_PASS,
    }
});

module.exports = transporter