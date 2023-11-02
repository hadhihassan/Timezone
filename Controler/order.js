const express = require("express");
const Razorpay = require('razorpay');
const Order = require("../Models/orderModel");
const Customer = require('../Models/customerModel')
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env
const crypto = require("crypto")
const Product = require("../Models/productModel")
const Address = require("../Models/userAddress")
const mongoose = require("mongoose")


//RAZORPAY ORDER INSTANCE 
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_ID_KEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});
//RENDERE THE PAYMENT PAGE
const loadPaymentPage = async (req, res) => {
  try {
 
    const couponId = req.query.id || '0';
    const userId = req.session.user;
    let couponDiscount = parseInt(req.query.discount) || 0;
    
    const user = await Customer.findById(userId)
    const orderDetails = await Order.find({ user: userId });
    // Calculate the total order amount in paise
    let am = user.totalCartAmount
    let totalPayAmount = (am - couponDiscount)
    const razorpayOrder = await razorpay.orders.create({
      amount: (totalPayAmount * 100),
      currency: "INR",
      receipt: `${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}${Date.now()}`, // Provide a unique receipt ID
    });

    return res.render("User/payment", {
      order: razorpayOrder,
      key_id: process.env.RAZORPAY_ID_KEY,
      user: userId,
      couponId: couponId,
      secretKey : process.env.RAZORPAY_SECRET_KEY,
       couponDiscount
    });
  } catch (error) {
    res.render("User/404", { message: "An error occurred. Please try again later." });
  }
}
//CHECK THE RERAZORPAY SIGNATURE PAYMENT SUCCESS OR NOT 
const checkRazorpaySignature = async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, order_id, secret, amount, couponId,couponDiscount } = req.body;
  const userId = req.session.user;

  try {
    const generate_signature = crypto
      .createHmac("sha256", secret)
      .update(order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generate_signature == razorpay_signature) {
      const usedAddress = await Address.findOne({
        $and: [{ User: userId }, { in_use: true }],
      });

      const User = await Customer.findById(userId).populate("cart.product");
      const discount = couponDiscount ? parseInt(couponDiscount) : 0;
      const userOrder = new Order({
        user: userId,
        totalAmount: (amount / 100),
        paymentOption: "razorpay",
        deliveryAddress: usedAddress,
        payment_id : razorpay_payment_id,
        discountAmount : discount
      });

      for (const cartItem of User.cart) {
        const productItem = await Product.findById(cartItem.product);

        if (!productItem) {
          return res.status(404).json({ error: 'Product not found' });
        }
        if (cartItem.quantity > productItem.stock_count) {
          return res.status(400).json({ error: 'Not enough stock for some products' });
        }
        // Update stock count and save the product
        productItem.stock_count -= cartItem.quantity;
        // Add product to the order
        userOrder.products.push({
          product: cartItem.product,
          quantity: cartItem.quantity,
          total: cartItem.total,
        });
      }
      if (couponId !== " 0") {
        const customerId = req.session.user; // Assuming you have the customer's ID
        const stringid = couponId.trim()
        // Convert couponId to ObjectId
        const objectId = new mongoose.Types.ObjectId(stringid);
        // Push the new coupon ID into the earnedCoupons array
        await Customer.findByIdAndUpdate(customerId, {
          $push: { earnedCoupons: { coupon: objectId } }
        });
      }
      const orderSave = await userOrder.save();
      await Customer.findByIdAndUpdate(userId, { $unset: { cart: {} } });

      if (orderSave) {
        return res.redirect("/user/show-order-details/");
      } 
    }
  } catch (error) {
    res.render("User/404", { message: "An error occurred. Please try again later." });
  }
};

//RENDER THE USER ORDER INVOICE PAGE
const loadInvoice = async (req,res) => {
  try{
    const orderId = req.body.id
    if(orderId){
      const userOrder = await Order.findById(orderId).populate("user").populate("products.product").populate("deliveryAddress")
      return res.render("User/profile/invoice",{
        order : userOrder
      })
    }
  }catch (error){
    res.render("User/404", { message: "An error occurred. Please try again later." });
  }
}




module.exports = { 
  loadPaymentPage, checkRazorpaySignature, loadInvoice
};
