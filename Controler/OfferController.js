const express = require("express")
const bcrypt = require("bcrypt")
const Customer = require('../Models/customerModel')
const productCategry = require("../Models/productCategory")
const Product = require("../Models/productModel")
const Order = require("../Models/orderModel")
const Coupon = require("../Models/couponModel")
const Offer = require("../Models/offerModel")




const loadOffersPage = async (req,res) => {
    try {
        const Offers = await Offer.find().sort({is_deleted:-1})
        return res.render("admin/Offer/offer",{ Offers })
        
    } catch (error) {
        console.log(error.message)
    }
} 
const loadAddOfferPage = async (req,res) => {
    try {
        return res.render("admin/Offer/addOffer",{error:req.flash('error')})
    } catch (error) {
        console.log(error.message);
    }
}
const createOffer = async  (req,res) =>{
    const {name, discount, startingDate, expiryDate, status } = req.body
    try {

        const  existOffer = await Offer.findOne({name})
        console.log(existOffer);
        if(existOffer !== null && existOffer){
            req.flash('error','Name already exists..')
            return res.redirect("/admin/offer/create/")
        }
        const newOffer = new Offer({
            name,
            discount,
            startingDate,
            expiryDate,
            status
        })
        await newOffer.save()
        return res.redirect("/admin/offer/create/")

        
        
    } catch (error) {
        console.log(error.message)
    }
}


module.exports = {
    createOffer, loadAddOfferPage, loadOffersPage
}