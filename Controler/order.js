const express= require("express")
const Razorpay = require('razorpay');

var razorpay = new Razorpay({
  key_id : process.env.RAZORPAY_ID_KEY_,
  key_secret : process.env.RAZORPAY_SECRET_KEY_,
});


const loadPaymentPage = (req,res) => {
    try{
        return res.render("User/payment")
    } catch(error){
        console.log(error.message)
    }
}

module.exports = {
    loadPaymentPage,
}