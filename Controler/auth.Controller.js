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
const { sendOTPVerificationEmail } = require('../services/emailService');
const { generateOTP, hashOTP } = require('../services/otpService');
const transporter  = require('../config/email');

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
}
//HASH THE USER PASSOWRD
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
//RENDER THE OTP PAGE
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
}
//FORGETPASSWORD EMAIL VALID OR INVALID AND SEND OTP
const ForgetPasswordcheckingValid = async (req, res) => {
    try {
        const email = req.body.email;
        const user = await Customer.findOne({ email: email }); // Use findOne instead of find
        if (user) {
            const otpexist = await UserOTPVerification.deleteMany({ $or: [{ userId: user._id }, { Email: email }] });
            const otp = generateOTP()
            // Mail options
            const mailOption = {
                from: process.env.AUTH_EMAIL,
                to: email,
                subject: "Forget password",
                html: `<p>Enter <b>${otp}</b> in the app to verify your email address and complete the verification</p>
                      <p>This code <b>expires in 1 minute</b>.</p>`
            };
        
            const hashedOTP = await hashOTP(otp);
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
        req.flash('error',"An error occurred while processing your request." );
    }
};
//RENDER THE CHANGE PASSWORD PAGE
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
}
//VALIDATE THE OTP 
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
};

//USER FORGETPASSWORD OTP RESEND 
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
}

module.exports = {
    loadRegister, insertUser, loadOTPpage, checkOTPValid, loadLogin, checkUserValid,
    userLogouting, loadForgetPage, ForgetPasswordcheckingValid,
    loadChangePass, validOTPsetPass, resedOtp, forgetPassResendOtp
}