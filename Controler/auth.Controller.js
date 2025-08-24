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
const sharp = require('sharp');

//RENDER THE SIGNUP PAGE    
const loadRegister = async (req, res, next) => {
    let notUser
    try {
        if (req.session.notUser) {
            notUser = req.session.notUser
        }
        res.render("User/register", {
            user: "sad",
            success: req.flash("success"),
            error: req.flash("error"),
            notUser
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
            products: pros,
            userId: req.session.user
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
    let notUser
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
            res.render("User/register", { message: "This accound alredy existed", user: req.session.user, notUser })
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
            req.session.notUser = userData._id
            if (userData) {
                //send the verification email 
                sendOTPVerificationEmail(userData, res)
                const user_id = userData._id
                res.redirect(`/user/otpVerification?userId=${user_id}`);
            } else {
                console.log("ccount creation has been failed");
                res.render('User/register', { message: "Account creation has been failed", user: req.session.user, notUser })
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
            userId: req.session.user
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
                    req.session.notUser = verifiedUser._id
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
}