const Customer = require('../Models/customerModel')
const UserOTPVerification = require('../Models/UserOTPVerification')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const Product = require('../Models/productModel')
const Address = require('../Models/userAddress')
const Order = require("../Models/orderModel");
const product = require("../Models/productModel");
const jwt = require('jsonwebtoken');
const crypto = require("crypto")
require("dotenv").config();
const Coupon = require("../Models/couponModel")
const Category = require("../Models/productCategory")


//RENDER THE SIGNUP PAGE
const loadRegister = async (req, res, next) => {
    try {
        res.render("User/register", {
            user: "sad",
            success: req.flash("success"),
            error: req.flash("error"),
        })
    } catch (error) {
        ;
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//RENDER THE INDEX PAGE OR HOME PAGE
const loadhome = async (req, res) => {
    try {
        const newPro = await product.find({ is_delete: false }).sort({ _id: 1 }).limit(3);
        const pros = await product.find({ is_delete: false }).limit(6)
        res.render("User/index", {
            user: req.session.user, query: "", success: "",
            error: "",
            newPro,
            products: pros
        })
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//HASH THE USER PASSOWRD
const secrePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//USER SIGN UP AND ADD USER INTO DATABASE
const insertUser = async (req, res) => {
    const { name, mbn, gender, email, password, conformpassword, rafferalcode } = req.body
    try {
        const sPassword = await secrePassword(password)
        const user = new Customer({
            name,
            mobile: mbn,
            gender,
            email,
            password: sPassword,
        })
        const userExist = await Customer.findOne({ email })
        if (userExist) {
            res.render("User/register", { message: "This accound alredy existed", user: req.session.user })
        } else {
            const code = rafferalcode.trim()
            const refferedUser = await Customer.findOne({ referralCode: code });
            if (refferedUser) {
                const currDate = Date.now(); // Use Date.now() to get the current timestamp
                await Customer.findByIdAndUpdate(
                    refferedUser._id,
                    {
                        $inc: { wallet: 100 },
                        $push: {
                            walletHistory: {
                                date: currDate,
                                amount: 100,
                                message: "Inviting friend using the referral code",
                            },
                        },
                    }
                );
                // Update the new user's wallet and add an entry to walletHistory
                user.wallet = 20;
                user.referred = true
                user.walletHistory.push({
                    date: currDate,
                    amount: 20,
                    message: "Sign up with the referral code",
                });
            }
            const userData = await user.save()
            if (userData) {
                //send the verification email 
                sendOTPVerificationEmail(userData, res)
                const user_id = userData._id
                res.redirect(`/user/otpVerification?userId=${user_id}`);
            } else {
                console.log("ccount creation has been failed");
                res.render('User/register', { message: "Account creation has been failed", user: req.session.user, })
            }
        }
    } catch (error) {
        console.log(error);
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}

//EMAIL SENDER 
let transporter = nodemailer.createTransport({
    service: "Gmail",
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    }
});

// SEND EMAIL TO USER FOR VERFICATION 
const sendOTPVerificationEmail = async ({ _id, email }, res) => {
    try {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
        // Mail options
        const mailOption = {
            from: process.env.AUTH_EMAIL, // Use the correct environment variable
            to: email,
            subject: "Verify Your Email",
            html: `<p>Enter <b>${otp}</b> in the app to verify your email address and complete the verification</p>
                   <p>This code <b>expires in 1 minute</b>.</p>`
        };
        // Hash the OTP
        const saltRounds = 10;
        const hashedOTP = await bcrypt.hash(otp, saltRounds);
        const newOTPVerification = new UserOTPVerification({
            userId: _id,
            otp: hashedOTP,
            createdAt: Date.now(),
            expireAt: Date.now() + 60000,
        });

        // Save OTP record
        await UserOTPVerification.deleteMany({ userId: _id })
        await newOTPVerification.save();
        // Send email
        await transporter.sendMail(mailOption);
        // Send a single response at the end of the try block
    } catch (error) {
        // Handle errors and send an error response
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
};//RENDER THE OTP PAGE
const loadOTPpage = async (req, res) => {
    try {
        const userId = req.query.userId;
        console.log(userId); // Log the userId for debugging
        res.render('User/OTPverificationpage', {
            message: '', id: userId, user: "", success: req.flash("success"),
            error: req.flash("error"),
        });
    } catch (error) {
        ;
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//CHEKC THE OTP IS VALID
const checkOTPValid = async (req, res) => {
    try {
        const { OTP, ID } = req.body;
        if (OTP === '') {
            return res.render("User/OTPverificationpage", { message: "Empty data is not allowed", id: ID, user: "" });
        }
        const OTPRecord = await UserOTPVerification.findOne({ userId: ID });
        if (!OTPRecord) {
            return res.render("User/OTPverificationpage", { message: "Enter a valid OTP", id: ID, user: "" });
        }
        const { expireAt, userId, otp } = OTPRecord;
        if (expireAt < Date.now()) {
            await UserOTPVerification.deleteOne({ userId });
            return res.render("User/OTPverificationpage", { message: "The code has expired, please try again", id: ID, user: "" });
        }
        const isValid = await bcrypt.compare(OTP, otp);
        if (!isValid) {
            return res.render("User/OTPverificationpage", { message: "The entered OTP is invalid", id: ID, user: "" });
        }
        await Customer.updateOne({ _id: ID }, { $set: { is_varified: true } });
        await UserOTPVerification.deleteOne({ userId });
        return res.redirect('/user-Login');
    } catch (error) {
        res.render("User/404", { message: "Internal Server Error" });
    }
};
//RESEND OTP
const resedOtp = async (req, res) => {
    try {
        const { userId } = req.body
        const userDate = await Customer.findById(userId)
        await sendOTPVerificationEmail(userDate)
        if (userDate) {
            return res.redirect(`/user/otpVerification?userId=${userId}`)
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//RENDER THE LOGIN PAGE
const loadLogin = async (req, res) => {
    try {
        res.render("User/login", {
            user: req.session.user, success: req.flash("success"),
            error: req.flash("error"),
        })
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}
//CHECK THE USER IS VALID / LOGIN
const checkUserValid = async (req, res) => {

    const { email, password } = req.body
    try {
        if (!email || !password) {
            res.render('User/login', { message: 'Empty information are not possible..', user: req.session.user })

        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            res.render('User/login', { message: "Invalid Email..", user: req.session.user })
        } else {

            const verifiedUser = await Customer.findOne({ email })


            if (!verifiedUser) {

                res.render('User/login', { message: "Your not our user create a accound and login..", user: req.session.user })

            } else if (verifiedUser.is_block === true) {
                res.render('User/login', { message: "Sorry you are blocked ...", user: req.session.user })
            } else if (verifiedUser.is_varified === true) {

                const hashPassword = verifiedUser.password
                const isValid = await bcrypt.compare(password, hashPassword)

                if (!isValid) {
                    res.render('User/login', { message: "Password is incorrect try again..", user: req.session.user })
                } else {


                    const token = jwt.sign({ userId: verifiedUser.id }, process.env.JWTSECRET, { expiresIn: '30d' });
                    res.cookie('token', token, { httpOnly: true })
                    res.cookie.user = verifiedUser._id
                    req.session.user = verifiedUser._id
                    req.u = verifiedUser._id

                    return res.redirect('/')
                }
            } else {
                res.render('User/login', { message: "your not verfied try again..", user: req.session.user })
            }
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });

    }

}//RENDER THE FORGET PASSWORD PAGE

const loadForgetPage = (req, res) => {
    try {
        if (!req.session.user) {
            return res.render("User/ForgetPassword", {
                user: req.session.user, success: req.flash("success"),
                error: req.flash("error"),
            })
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//FORGETPASSWORD EMAIL VALID OR INVALID AND SEND OTP
const ForgetPasswordcheckingValid = async (req, res) => {
    try {
        const email = req.body.email;
        const user = await Customer.findOne({ email: email }); // Use findOne instead of find
        if (user) {
            const otpexist = await UserOTPVerification.deleteMany({ $or: [{ userId: user._id }, { Email: email }] });
            const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
            // Mail options
            const mailOption = {
                from: process.env.AUTH_EMAIL,
                to: email,
                subject: "Forget password",
                html: `<p>Enter <b>${otp}</b> in the app to verify your email address and complete the verification</p>
                      <p>This code <b>expires in 1 minute</b>.</p>`
            };
            const saltRounds = 10;
            const hashedOTP = await bcrypt.hash(otp, saltRounds);
            const newOTPVerification = new UserOTPVerification({
                userId: user._id,
                otp: hashedOTP,
                createdAt: Date.now(),
                expireAt: Date.now() + 60000,
            });
            const otp2 = await newOTPVerification.save();
            await transporter.sendMail(mailOption);
            res.redirect(`/user/set-new-password?id=${user._id}`);
        } else {
            req.flash('error', 'The email was not found. Please try again or sign up.');
            return res.render("User/ForgetPassword", { message: "The email was not found. Please try again or sign up.", user: req.session.user, success: "" });
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred while processing your request." });
    }
};//RENDER THE CHANGE PASSWORD PAGE
const loadChangePass = (req, res) => {
    const id = req.query.id
    try {
        res.render('User/setPAssword', {
            user: req.session.user, id, success: req.flash("success"),
            error: req.flash("error"),
        })
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//VALIDATE THE OTP 
const validOTPsetPass = async (req, res) => {
    const { OTP, newpassword, confirmpassword, id } = req.body;
    try {
        if (!OTP || !newpassword || !confirmpassword || !id) {
            // Check if all required fields are present
            return res.status(400).send("Missing fields in the request.");
        }
        const otpRecord = await UserOTPVerification.findOne({ userId: id });
        const { userId, otp, expireAt } = otpRecord;
        const checkOtpSame = await bcrypt.compare(OTP, otp);
        if (!otpRecord) {
            // No OTP record found for the provided user ID
            return res.status(400).send("No OTP record found for the email.");
        }
        if (expireAt < Date.now()) {
            return res.status(400).send("otp expaired")
        }
        if (checkOtpSame == "false" || checkOtpSame == false) {
            // Invalid OTP
            console.log(otpRecord)
            return res.status(400).send("Invalid OTP.");
        }
        if (confirmpassword !== newpassword) {
            // Passwords do not match
            return res.status(400).send("Passwords do not match.");
        }
        const hashedPassword = await secrePassword(newpassword); // Assuming secrePassword is a password hashing function
        if (!hashedPassword) {
            // Error hashing the new password
            return res.status(500).send("Error hashing the new password.");
        }
        const upuser = await Customer.updateOne({ _id: id }, { $set: { password: hashedPassword } });
        await UserOTPVerification.findOneAndDelete({ userId: id });
        if (!upuser) {
            // Error updating password
            return res.status(500).send("Error updating password.");
        }
        return res.redirect("/");
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
};//USER FORGETPASSWORD OTP RESEND 
const forgetPassResendOtp = async (req, res) => {
    try {
        const { id } = req.body
        const userData = await Customer.findById(id)
        await sendOTPVerificationEmail(userData)
        if (userData) {
            return res.redirect(`/user/set-new-password?id=${id}`)
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//USER LOG OUTING 
const userLogouting = (req, res, next) => {
    try {
        if (req.session.user) {
            req.session.destroy();
            return res.redirect("/")
        } else {
            return res.redirect('/')
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//RENDER THE SHOPPING PAGE
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
}//RENDER PRODUCT DETAILS PAGE INDIVIDULAY
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


// *USER PROFILE*


//RENDER THE USER PROFILE 
const loadProfile = async (req, res) => {
    try {
        const user = await Customer.findById(req.session.user)
        const address = await Address.find({ User: req.session.user })
        console.log(address);
        if (user) {

            res.render('User/profile/userprofile', {
                user, address, success: req.flash("success"),
                error: req.flash("error"),
            })
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//RENDER THE USER DETAILS PAGE
const loadEditPage = async (req, res) => {
    try {
        const id = req.body.id
        const user = await Customer.findById({ _id: id })
        if (user) {
            res.render("User/profile/editProfile", {
                user, success: req.flash("success"),
                error: req.flash("error"),
            })
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//EDITED DATA UPDATING
const updateUser = async (req, res) => {
    const { name, mbn, email, gender, id } = req.body
    try {
        if (name || mbn || email || gender || id) {
            const user = await Customer.findById({ _id: id })
            if (user) {
                const updated = await Customer.findByIdAndUpdate({ _id: id }, { $set: { name: name, mobile: mbn, email: email, gender: gender } })
                if (updated) {
                    return res.redirect("/user/profile")
                }
            }
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//ADD USER PROFILE IMAGE  
const addImageProfile = async (req, res) => {
    const id = req.body.id
    try {
        const customer = await Customer.findById(req.session.user);

        if (customer) {
            // Update the 'images' field
            customer.images = {
                data: req.file.buffer,
                contentType: req.file.mimetype
            };

            // Save the updated customer document
            await customer.save();
        }

        res.redirect('/user/profile')
    } catch (error) {
        console.log(error.message);
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//DELETE THE USER PROFILE IMAGE
const deleteUserProfile = async (req, res) => {
    try {
        const id = req.query.id
        if (id) {
            await Customer.findByIdAndUpdate(id, { $unset: { images: {} } })
            return res.redirect("/user/profile")
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//UPDATE USER PASSWORD
const userUpdatePassword = async (req, res) => {
    const { newpassword, oldpassword, confirmpassword, id } = req.body
    const user = await Customer.findById(id)
    try {
        if (newpassword || oldpassword || confirmpassword) {
            const validpassword = await bcrypt.compare(oldpassword, user.password)
            if (validpassword) {
                if (newpassword === confirmpassword) {
                    const hashedPassword = await secrePassword(newpassword)
                    if (hashedPassword) {
                        const passwordupdated = await Customer.findByIdAndUpdate(id, { $set: { password: hashedPassword } })
                        console.log("success flly updated");
                        res.redirect("/user/profile")
                    }
                } else {
                    return res.render('User/profile/editProfile', { user, messgae: "try again the confirm password is not matching ...." })
                }
            } else {
                return res.render("User/profile/editProfile", { user, message: "Password is miss match try again..." })
            }
        } else {
            return res.render("User/profile/editProfile", { user, message: "Fill the all field please.." })
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//RENDER THE ADD NEW ADDRESS PAGE
const loadAddAddressPage = (req, res) => {
    const id = req.body.id
    const back = req.body.back
    try {
        res.render("User/profile/addAddress", {
            id, back, success: req.flash("success"),
            error: req.flash("error"),
            user : req.session.user
        })
    } catch (error) {

    }
}//ADD NEW ADDRESS
const addUserAddress = async (req, res) => {
    console.log(req.body)
    const back = req.body.back
    try {
        const saveaddress = new Address({
            User: req.body.id,
            Name: req.body.name,
            Mobile: req.body.mbn,
            Email: req.body.email,
            HouseName: req.body.houseno,
            RoadArea: req.body.area,
            City: req.body.city,
            PinCode: req.body.pincode,
            Country: req.body.country
        })
        await saveaddress.save()
        if (saveaddress) {
            if (back == "true") {
                return res.redirect("/user/Checkout")
            }
            return res.redirect("/user/profile")
        }
    } catch (error) {

        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//RENDER THE EDIT ADDRESS PAGE
const editAddress = async (req, res) => {
    try {
        const address = await Address.findById(req.body.id)
        const bc = req.body.back
        if (address) {
            return res.render("User/profile/editAddress", { address, bc, user : req.session.user})
        }
    } catch (error) {

        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//EDITED ADDRESS UPDATING 
const updateAddress = async (req, res) => {
    try {
        const findAddress = await Address.findById(req.body.id)
        const back = req.body.back
        if (findAddress) {
            const updatedAddress = await Address.findByIdAndUpdate(req.body.id, {
                Name: req.body.name,
                Mobile: req.body.mbn,
                Email: req.body.email,
                HouseName: req.body.houseno,
                RoadArea: req.body.area,
                City: req.body.city,
                PinCode: req.body.pincode,
                Country: req.body.country
            });
            if (updatedAddress) {
                if (back != undefined) {
                    return res.redirect("/user/Checkout")
                }
                return res.redirect("/user/profile")
            }
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//DELETE USER ADDRESS
const deleteAddress = async (req, res) => {
    try {
        const deleteAddress = await Address.findByIdAndDelete(req.body.id)
        if (deleteAddress) {
            return res.redirect("/user/profile")
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}


// *CART*


//RENDER THE CART
const loadCart = async (req, res) => {
    try {
        const userId = req.session.user;
        let totalCart = 0
        const userWithCart = await Customer.findById(userId).populate('cart.product');
        if (!userWithCart) {
            return res.status(404).send('User not found');
        }
        const cartItems = userWithCart.cart;

        cartItems.forEach(async (item) => {
            if (item.product) {
                let regularPrice
                const offerPrice = item.product.offerPrice;
                const price = item.product.price;
                const categoryOfferPrice = item.product.categoryOfferPrice;


                if (offerPrice > 0 && (offerPrice < price || price <= 0) && (offerPrice < categoryOfferPrice || categoryOfferPrice <= 0)) {
                    regularPrice = offerPrice;
                }

                if (price > 0 && (price < offerPrice || offerPrice <= 0) && (price < categoryOfferPrice || categoryOfferPrice <= 0)) {
                    if (typeof regularPrice === 'undefined' || price < regularPrice) {
                        regularPrice = price;
                    }
                }

                if (categoryOfferPrice > 0 && (categoryOfferPrice < offerPrice || offerPrice <= 0) && (categoryOfferPrice < price || price <= 0)) {
                    if (typeof regularPrice === 'undefined' || categoryOfferPrice < regularPrice) {
                        regularPrice = categoryOfferPrice;
                    }
                }

                console.log(regularPrice + ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
                const productPrice = regularPrice;
                const quantity = item.quantity;
                item.total = quantity * productPrice;
                totalCart += item.total
                
                await Customer.updateOne(
                    { _id: userId, "cart._id": item._id },
                    { $set: { "cart.$.total": item.total } }
                );


            } else {
                console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>...");
            }
        });
        userWithCart.totalCartAmount = totalCart
        const udpdateCart = await userWithCart.save();

        if (udpdateCart) {
            return res.render('User/cart', {
                currentUser: userWithCart,
                user: userId,
                Products: cartItems,
                success: req.flash("success"),
                error: req.flash("error"),
            });
        }
    } catch (error) {
        res.render("User/404", { message: "Error loading cart" });
    }
}//PRODUCT ADD TO CART
const productAddToCart = async (req, res) => {
    try {
        const user = await Customer.findById(req.session.user)
        const quantity = 1
        const product = await Product.findById(req.query.productId)
        const checkthestock = product.stock_count
        const lowoOfferPrice = Math.max(product.offerPrice, product.categoryOfferPrice)
        let regularPrice
        if (lowoOfferPrice !== 0) {
            regularPrice = lowoOfferPrice
        } else {
            regularPrice = product.price
        }
        const total = quantity * regularPrice
        let totalCartAmount = 0;
        user.cart.forEach(item => {
            totalCartAmount += item.total;
        })
        const existingCartItemIndex = await user.cart.find(item => item.product.equals(product._id))

        const referer = req.headers.referer;
        const originalPage = referer || '/';

        if (existingCartItemIndex && existingCartItemIndex.quantity + 1 <= checkthestock) {
            existingCartItemIndex.quantity += quantity
            existingCartItemIndex.total += total
            user.totalCartAmount = (totalCartAmount + total)

            await user.save()
            req.flash('success', 'product added to cart successfully')
            res.redirect(originalPage)
        }
        else if (!existingCartItemIndex) {
            user.cart.push({ product: product._id, quantity, total })
            user.totalCartAmount = (totalCartAmount + total);
            await user.save()
            req.flash('success', 'product added to cart successfully')
            res.redirect(originalPage)
        } else {
            req.flash('success', 'stock was exeeded...')
            res.redirect(originalPage)
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//UPDATING THE CART PRODUCT QUANTITY
const updateCartQuantity = async (req, res) => {
    try {
        const user = await Customer.findById(req.session.user)

        const cartProductId = req.body.cartItemId
        const newQuantity = req.body.quantity

        const cartProduct = user.cart.find(item => item.product._id.equals(cartProductId));
        if (!cartProduct) {
            return res.status(404).json({ message: 'Cart item not found' });
        }
        const product = await Product.findById(cartProduct.product);

        if (newQuantity > product.stock_count) {
            return res.json({ stock: product.stock_count, error: "stock limit exceeded!" })
        }

        let regularPrice
        const offerPrice = product.offerPrice;
        const price = product.price;
        const categoryOfferPrice = product.categoryOfferPrice;

        if (offerPrice > 0 && (offerPrice < price || price <= 0) && (offerPrice < categoryOfferPrice || categoryOfferPrice <= 0)) {
            regularPrice = offerPrice;
        } else if (price > 0 && (price < offerPrice || offerPrice <= 0) && (price < categoryOfferPrice || categoryOfferPrice <= 0)) {
            regularPrice = price;
        } else if (categoryOfferPrice > 0 && (categoryOfferPrice < offerPrice || offerPrice <= 0) && (categoryOfferPrice < price || price <= 0)) {
            regularPrice = categoryOfferPrice;
        }



        // Calculate the new total for the cart product that is being updated.
        const newTotal = newQuantity * regularPrice;
        cartProduct.quantity = newQuantity;
        cartProduct.total = newTotal;
        let totalCartAmount = 0
        user.cart.forEach((item) => {
            totalCartAmount += item.total;
        });
        user.totalCartAmount = totalCartAmount;
        await user.save();
        res.json({ message: 'Cart item quantity updated successfully', totalCartAmount, total: newTotal });
    } catch (error) {
        console.log(error.messgae)
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//DELETE PRODUCT FROM THE CART
const deleteProductCart = async (req, res) => {
    try {
        const user = await Customer.findById(req.session.user)
        const cartItemId = req.query.id
        const cartIndex = user.cart.findIndex((item) => item._id.equals(cartItemId))

        if (cartIndex !== -1) {
            user.totalCartAmount = user.totalCartAmount - user.cart[cartIndex].total
            user.cart.splice(cartIndex, 1)
            await user.save()
            req.flash("success", "Item removed from the cart success fully....")
            return res.redirect('/user/cart')
        } else {
            req.flash("success", "Item not found in the cart... ")
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}


// *ORDER*


//RENDER THE CEHKOUT PAGE
const loadchekout = async (req, res) => {
    const user_id = req.session.user
    const mess = req.query.message || "";
    try {

        const User = await Customer.findById(req.session.user).populate('cart.product');
        const cartItems = User.cart;
        if (cartItems.length !== 0) {
            cartItems.forEach((item) => {

                const lowoOfferPrice = Math.max(item.product.offerPrice, item.product.categoryOfferPrice)
                let regularPrice
                if (lowoOfferPrice !== 0) {
                    regularPrice = lowoOfferPrice
                } else {
                    regularPrice = item.product.price
                }
                const productPrice = regularPrice
                const quantity = item.quantity; // Make sure 'quantity' is defined and accurate
                item.total = quantity * productPrice;
            });
            const userdCoupons = User.earnedCoupons.map(earnedCoupon => earnedCoupon.coupon);
            const notUserCoupons = await Coupon.find({
                _id: { $nin: userdCoupons },
                coupon_done: false
            });
            console.log(notUserCoupons);
            await User.save();
            const cart = User.cart
            const address = await Address.find({ User: user_id })
            const selectAddress = await Address.findOne({ in_use: true, User: user_id })
            res.render("User/checkout",
                {
                    User,
                    cart,
                    address,
                    user: req.session.user,
                    selectAddress,
                    message: mess,
                    notUserCoupons,
                    success: req.flash("success"),
                    error: req.flash("error"),
                })
        } else {
            return res.redirect("/user/cart")
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//SELECT ORDER ADDRESS
const selectAddress = async (req, res) => {
    const Id = req.session.user
    const addressId = req.body.addressId
    try {
        const existSelectAdd = await Address.updateMany({ User: Id }, { $unset: { in_use: '' } });
        const selectaddress = await Address.findByIdAndUpdate(addressId, { $set: { in_use: true } });
        if (selectaddress && existSelectAdd) {
            req.flash('success', 'Address selected successfully....');
            return res.redirect("/user/Checkout")
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//PLACING ORDER
const placeOrder = async (req, res) => {
    couponDiscount = parseInt(req.body.discountAmount) || 0;
    const couponId = req.body.codeID
    try {
        const paymentOption = req.body.PaymentOption;
        // Validate payment option
        if (!["COD", "wallet", "paypal"].includes(paymentOption)) {

            return res.redirect("/user/checkout?message=Invalid payment option")
        }
        const userId = req.session.user;
        const user = await Customer.findById(userId).populate('cart.product');
        if (!user) {
            return res.redirect("/user/checkout?message=User not found")
        }
        // Calculate the total cart amount correctly based on the user's cart
        let totalAmount = user.cart.reduce(
            (total, cartItem) => total + cartItem.total,
            0
        );
        totalAmount = totalAmount - couponDiscount
        const usedAddress = await Address.findOne({
            $and: [{ User: userId }, { in_use: true }],
        });

        if (!usedAddress) {
            return res.redirect("/user/checkout?message=Select any address or add address")
        }
        if (paymentOption === "COD") {
            const address = usedAddress._id;
            const order = new Order({
                user: userId,
                totalAmount, // Assign the correct total amount here
                paymentOption: paymentOption,
                deliveryAddress: address,
            });
            // Update product stock counts and add products to the order
            for (const cartItem of user.cart) {
                const productItem = await Product.findById(cartItem.product);
                if (!productItem) {
                    return res.redirect("/user/checkout?message=Product not found")

                }
                if (cartItem.quantity > productItem.stock_count) {
                    return res.redirect("/user/checkout?message=Not enough stock for some products")
                }
                // Update stock count and save the product
                productItem.stock_count -= cartItem.quantity;
                await productItem.save();
                // Add product to the order
                order.products.push({
                    product: cartItem.product,
                    quantity: cartItem.quantity,
                    total: cartItem.total,
                });
            }
            if (couponDiscount > 0) {
                await Customer.findByIdAndUpdate(req.session.user, {
                    $push: { "earnedCoupons": { coupon: couponId } }
                });
            }
            // Save the order and remove cart items
            const orderSave = await order.save();
            if (orderSave) {
                // Remove cart items from the user's cart
                const removeCart = await Customer.findByIdAndUpdate(req.session.user, { $unset: { cart: {} } });
                if (removeCart) {
                    return res.redirect('/user/show-order-details/');
                }
            }
        } else if (paymentOption === "wallet") {
            if (user.wallet < totalAmount) {
                return res.redirect("/user/checkout?message=Not enough amount in your wallet")
            }
            // Implement wallet payment logic here
            const address = usedAddress._id;
            const order = new Order({
                user: userId,
                totalAmount, // Assign the correct total amount here
                paymentOption: paymentOption,
                deliveryAddress: address,
            });
            // Update product stock counts and add products to the order
            for (const cartItem of user.cart) {
                const productItem = await Product.findById(cartItem.product);
                if (!productItem) {
                    return res.redirect("/user/checkout?message=Product not found")
                }
                if (cartItem.quantity > productItem.stock_count) {
                    return res.redirect("/user/checkout?message=Not enough stock for some products")
                }
                // Update stock count and save the product
                productItem.stock_count -= cartItem.quantity;
                await productItem.save();
                // Add product to the order
                order.products.push({
                    product: cartItem.product,
                    quantity: cartItem.quantity,
                    total: cartItem.total,
                });
            }
            if (couponDiscount > 0) {
                await Customer.findByIdAndUpdate(req.session.user, {
                    $push: { "earnedCoupons": { coupon: couponId } }
                })
            }
            // Save the order and remove cart items
            const orderSave = await order.save();
            if (orderSave) {
                // Remove cart items from the user's cart
                const removeCart = await Customer.findByIdAndUpdate(req.session.user, { $unset: { cart: {} } });

                if (removeCart) {
                    return res.redirect('/user/show-order-details/');
                }
            }
        } else if (paymentOption === "paypal") {

            return res.redirect(`/user/product/online-payment?discount=${couponDiscount}&id=${couponId}`);
        }

    } catch (error) {
        console.error(error.message);
        return res.render("User/404", { message: "An error occurred while placing the order" })
    }
}//RENDER THE ORDER PAGE
const loadOrder = async (req, res) => {
    try {
        const userId = req.session.user
        const userOrder = await Order.find({ user: userId })
            .populate("user")
            .populate("products.product")
            .populate("deliveryAddress")
            .sort({ createdAt: -1 })
            .exec();
        console.log(userOrder)
        return res.render("User/profile/showOrders", {
            userOrder, user: userId, success: req.flash("success"),
            error: req.flash("error"),
        })

    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//RENDER THE ORDERD PRODUCT DETAILS PAGE
const loadOrderProductDetails = async (req, res) => {
    const orderId = req.body.Products; // Assuming you pass orderId as a route parameter
    try {
        const order = await Order.findById(orderId).populate({ path : "products.product" , populate : { path : "category"}});
        if (!order) {
            return res.status(404).send("Order not found"); // Handle case where the order is not found
        }
        const products = order.products;
        return res.render("User/profile/showProductDetails", {
            user: req.session.user, products, success: req.flash("success"),
            error: req.flash("error"),
        });
    } catch (error) {
        console.error(error);
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//ORDER CANCELL
const cancelOrder = async (req, res) => {
    const orderId = req.body.orderId
    try {
        let reason = `Main reason: ${req.body.cancellReason}, Additional Comments: ${req.body.additionalComments}`;
        const cancel = await Order.findByIdAndUpdate(orderId, { $set: { orderCanceled: true, orderCancelReason: reason } })
        if (cancel.paymentOption == "razorpay") {
            const updateResult = await Customer.findByIdAndUpdate(
                cancel.user,
                {
                    $inc: { wallet: cancel.totalAmount },
                    $push: {
                        walletHistory: {
                            date: Date.now(),
                            amount: cancel.totalAmount,
                            message: "Order canceled and amount credited",
                        },
                    },
                },
                { new: true } // To get the updated customer document
            );
        }
        cancel.products.forEach(async (pro) => {
            const proUpdateQuantity = await product.findById(pro.product)
            proUpdateQuantity.stock_count += pro.quantity
            proUpdateQuantity.save()
        })
        return res.redirect("/user/show-order-details/")
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//PRODUCT RETURN REASON
const returnProductAction = async (req, res) => {
    try {
        let reason = `Main reason: ${req.body.returnReason}, Additional Comments: ${req.body.additionalComments}`;
        const returnOrder = await Order.findByIdAndUpdate(req.body.orderId, {
            $set: { is_returned: true, return_reason: reason }
        });
        if (returnOrder) {
            return res.redirect("/user/show-order-details/")
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//APPLAYING THE COUPON WHILE PLACE ORDER
const applayingCoupon = async (req, res) => {
    const code = req.body.couponCode;
    try {
        const findCode = await Coupon.findOne({ code });
        if (!findCode) {
            return res.json({ error: "Coupon not found, please try again..." });
        }
        const user = await Customer.findById(req.session.user);
        for (const earnedCoupon of user.earnedCoupons) {
            const couponId = earnedCoupon.coupon;
            const isUsed = earnedCoupon.isUsed;

            if (couponId.equals(findCode._id)) {
                return res.json({ error: "Sorry, you already used this coupon code..." });
            }
        }
        const currentDate = new Date();
        if (findCode.expaire_date < currentDate) {
            return res.json({ error: "This coupon has expired..." });
        }
        if (user.totalCartAmount > findCode.minimumPurchaseAmount) {
            if (findCode.discount_type === "Percentage") {
                const discountAmount = Math.floor((findCode.discount_amount_or_percentage / 100) * user.totalCartAmount);
                const newAmount = Math.floor(user.totalCartAmount - discountAmount);
                return res.json({ newAmount, discountAmount, id: findCode._id });
            } else {
                const discountAmount = findCode.discount_amount_or_percentage;
                const newAmount = Math.floor(user.totalCartAmount - discountAmount);
                return res.json({ newAmount, discountAmount, id: findCode._id });
            }
        } else {
            return res.json({ error: "The coupon valid at purchase above 500 rupees.." });
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}


//RENDER THE WALLET PAGE
const loadWallet = async (req, res) => {
    try {
        const user = await Customer.findById(req.session.user)
            .sort({ "walletHistory.date": -1 });

        return res.render("User/profile/wallet", {
            user, sessionUser: req.session.user, success: req.flash("success"),
            error: req.flash("error"),
        });

    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}//RENDER THE COUPONS PAGE
const loadCoupons = async (req, res) => {
    try {
        const Coupons = await Coupon.find({ coupon_done: false })
        res.render("User/profile/coupons", {
            user: req.session.user, Coupons, success: req.flash("success"),
            error: req.flash("error"),
        })
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }

}

// *WISHLIST*

//WISHLIST 
const loadWishlist = async (req, res) => {
    try {
        const user = await Customer.findById(req.session.user)
        .populate({ path: 'wishlist', populate: { path: 'category', },})
        .exec();
      const wishlistItems = user.wishlist; // Wishlist items with the "category" field populated
        if (wishlistItems) {
            return res.render("User/wishlist", {
                items: wishlistItems,
                user: req.session.user,
                success: req.flash("success"),
                error: req.flash("error"),
            });
        }
    } catch (error) {
        console.log(error.message);
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
};//ADD PRODUCT TO WISHLIST
const addProductInWishlist = async (req, res) => {
    const productId = req.query.id;
    try {

        const productExist = await Customer.findOne({
            _id: req.session.user,
            wishlist: productId
        });

        const referer = req.headers.referer;
        const originalPage = referer || '/';

        if (!productExist) {
            await Customer.findByIdAndUpdate(req.session.user, { $push: { wishlist: productId } });
            req.flash('success', 'Product added to your wishlist.');
            return res.redirect(originalPage)
        } else {
            req.flash('success', 'Product is already in your wishlist.');
            return res.redirect(originalPage)
        }
    } catch (error) {

        res.render("User/404", { message: "An error occurred while adding the product to your wishlist." });
    }
};//DELETE THE WISHLIST ITEM
const deleteItemInWishlist = async (req, res) => {
    try {
        const id = req.query.id;
        const userId = req.session.user;

        const deleteItem = await Customer.findByIdAndUpdate(
            userId,
            { $pull: { wishlist: id } }
        );

        const referer = req.headers.referer;
        const originalPage = referer || '/';

        if (deleteItem) {
            req.flash("success", "Product removed successfully");
        } else {
            req.flash("error", "Product not found");
        }

        return res.redirect(originalPage);
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
};


module.exports = {
    loadRegister, loadhome, insertUser, loadOTPpage, checkOTPValid, loadLogin, checkUserValid,
    userLogouting, loadShop, loadProfile, loadEditPage, updateUser, addImageProfile, deleteUserProfile,
    userUpdatePassword, loadAddAddressPage, addUserAddress, editAddress, updateAddress, deleteAddress, displayProduct,
    productAddToCart, loadCart, updateCartQuantity, deleteProductCart, loadForgetPage, ForgetPasswordcheckingValid,
    loadChangePass, validOTPsetPass, loadchekout, selectAddress, placeOrder, loadOrder, loadOrderProductDetails,
    cancelOrder, loadWallet, loadCoupons, applayingCoupon, returnProductAction, resedOtp, forgetPassResendOtp,
    loadWishlist, addProductInWishlist, deleteItemInWishlist
}