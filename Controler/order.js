const express = require("express");
const Razorpay = require('razorpay');
const Order = require("../Models/orderModel");
const Customer = require('../Models/customerModel')
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env
const crypto = require("crypto")
const Product = require("../Models/productModel")
const Address = require("../Models/userAddress")
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_ID_KEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});




const loadPaymentPage = async (req, res) => {
  try {
    const userId = req.session.user;
    const user = await Customer.findById(userId)
    const orderDetails = await Order.find({ user: userId });
    // Calculate the total order amount in paise
    const totalPayAmount = user.totalCartAmount

    const razorpayOrder = await razorpay.orders.create({
      amount: (totalPayAmount * 100),
      currency: "INR",
      receipt: `${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}${Date.now()}`, // Provide a unique receipt ID
    });


    return res.render("User/payment", {
      order: razorpayOrder,
      key_id: process.env.RAZORPAY_ID_KEY,
      user: userId
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}



const checkRazorpaySignature = async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, order_id, secret } = req.body;
  console.log(req.body);
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

      const userOrder = new Order({
        user: userId,
        totalAmount: User.totalCartAmount,
        paymentOption: "razorpay",
        deliveryAddress: usedAddress,
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

      const orderSave = await userOrder.save();
      await Customer.findByIdAndUpdate(userId, { $unset: { cart: {} } });

      if (orderSave) {
        console.log("ONLINE PAYMENT AND ORDER SAVING SUCCESSFULLY........");
        return res.redirect("/user/show-order-details/");
      } else {
        console.log("ONLINE PAYMENT AND ORDER SAVING NOT WORKING");
      }
    } 
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
    loadPaymentPage, checkRazorpaySignature
  };
