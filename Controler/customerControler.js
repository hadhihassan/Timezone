const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const sharp = require('sharp');
const Customer = require('../Models/customerModel')
const UserOTPVerification = require('../Models/UserOTPVerification')
const Product = require('../Models/productModel')
const Address = require('../Models/userAddress')
const Order = require("../Models/orderModel");
const product = require("../Models/productModel");
const Coupon = require("../Models/couponModel")
const upload = require("../utils/upload")
require("dotenv").config();

//RENDER THE INDEX PAGE OR HOME PAGE
const loadhome = async (req, res) => {
    try {
        const newPro = await product.find({ is_delete: false }).sort({ _id: 1 }).limit(3);
        const pros = await product.find({ is_delete: false }).limit(6)
        res.render("User/index", {
            user: req.session.user, query: "", success: "",
            error: "",
            newPro,
            products: pros,
            userId: req.session.user
        })
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}
//RENDER THE SHOPPING PAGE
const loadShop = async (req, res) => {
    let page = req.query.page
    const pageSize = 9
    page = parseInt(req.query.page) || 1;
    const skip = ((page - 1) * pageSize);
    const currentPage = page

    let products
    const query = req.query.query
    const cate = req.query.category
    const brand = req.query.brand
    // const highTOLowPRice = req.query.HLPrice
    const min = parseInt(req.query.min) || 0
    const max = parseInt(req.query.max) || 1000000

    try {
        if (cate && brand) {
            const regex = new RegExp(query, 'i');
            products = await Product.find({ is_delete: false, in_stock: true, product_name: regex, price: { $gte: min, $lte: max }, category: cate, brand_name: brand }).skip(skip).limit(pageSize)
        } else if (brand && !cate) {
            const regex = new RegExp(query, 'i');
            products = await Product.find({ is_delete: false, in_stock: true, product_name: regex, price: { $gte: min, $lte: max }, brand_name: brand }).skip(skip).limit(pageSize)
        } else if (cate && !brand) {
            const regex = new RegExp(query, 'i');
            products = await Product.find({ is_delete: false, in_stock: true, product_name: regex, price: { $gte: min, $lte: max }, category: cate }).skip(skip).limit(pageSize)
        } else {
            const regex = new RegExp(query, 'i');
            products = await Product.find({ is_delete: false, in_stock: true, product_name: regex, price: { $gte: min, $lte: max } }).skip(skip).limit(pageSize)
        }

        const brandNames = await Product.aggregate([
            {
                $match: {
                    is_delete: false
                }
            },
            {
                $group: {
                    _id: '$brand_name', // Group by brand_name
                }
            },
            {
                $project: {
                    _id: 0,
                    brand_name: '$_id' // Rename the _id field to brand_name
                }
            }
        ]);
        const categories = await Product.find({ is_delete: false })
            .populate({
                path: 'category',
                model: 'productCategry', // Assuming this is the model name for the 'productCategry' collection
                select: 'categoryName' // Select the 'categoryName' field
            })
            .select('category')
            .exec();

        const uniqueCategories = new Set();
        const uniqueCategoryArray = categories.filter((item) => {
            if (item && item.category && item.category.categoryName) {
                if (!uniqueCategories.has(item.category.categoryName)) {
                    uniqueCategories.add(item.category.categoryName);
                    return true;
                }
            }
            return false;
        });
        const filter = await Product.find({ is_delete: false })
        res.render('User/shop', {
            query: "",
            products,
            user: req.session.user,
            success: req.flash("success"),
            error: req.flash("error"),
            brandNames,
            filter,
            uniqueCategoryArray,
            currentPage
        })
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}
//RENDER PRODUCT DETAILS PAGE INDIVIDULAY
const displayProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.query.productId).populate("category");
        const mess = req.flash('success');
        const user = req.session.user;
        if (product) {
            res.render("User/product_details", {
                product,
                user,
                success: req.flash("success"),
                error: req.flash("error"),
            });
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}


module.exports = {
    loadhome, loadShop, displayProduct,
}