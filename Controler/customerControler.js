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
const CatchAsync = require("../utils/CatchAsync")



const loadRegister = async (req, res, next) => {
    try {
        res.render("User/register", { user: "sad" })
    } catch (error) {
        console.log(error.message);
    }
}
const loadhome = async (req, res) => {
    try {
        res.render("User/index", { user: req.session.user })
    } catch (error) {
        console.log(error.message);
    }

}
const secrePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    } catch (error) {
        console.log(error.message);
    }
}
const insertUser = async (req, res) => {
    const { name, mbn, gender, email, password, conformpassword, rafferalcode } = req.body
    try {
        const sPassword = await secrePassword(password)

        if (conformpassword !== password) {

            res.render('User/register', { message: 'the password miss matched', user: req.session.user })

        } else if (mbn.length !== 10 || mbn.length !== 10 || !/^\d+$/.test(mbn)) {
            return res.render('User/register', { message: "Mobile number must be 10 digit", user: req.session.user })
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            return res.render('User/register', { message: "Email not valid ", user: req.session.user })
        }
        else {

            const user = new Customer({
                name,
                mobile: mbn,
                gender,
                email,
                password: sPassword,

            })
            //save the user into database 
            const userExist = await Customer.findOne({ email })
            console.log(userExist);
            if (userExist) {

                res.render("User/register", { message: "This accound alredy existed", user: req.session.user })
            } else {
                const refferedUser = await Customer.findOne({ referralCode: rafferalcode });

                if (refferedUser) {
                    const currDate = Date.now(); // Use Date.now() to get the current timestamp

                    // Update the referred user's wallet and add an entry to walletHistory
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
                        },
                        { upsert: true }
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
                console.log(userData);
                if (userData) {
                    //send the verification email 
                    sendOTPVerificationEmail(userData, res)
                    const user_id = userData._id




                    res.redirect(`/user/otpVerification?userId=${user_id}`);


                } else {
                    console.log("ccount creation has been failed");
                    res.render('User/register', { message: "Account creation has been failed", user: req.session.user })

                }

            }

        }
    } catch (error) {
        console.log(error);
    }
}
//send email models
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
// Send OTP verification email
const sendOTPVerificationEmail = async ({ _id, email }, res) => {
    try {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

        // Mail options
        const mailOption = {
            from: process.env.AUTH_EMAIL, // Use the correct environment variable
            to: email,
            subject: "Verify Your Email",
            html: `<p>Enter <b>${otp}</b> in the app to verify your email address and complete the verification</p>
                   <p>This code <b>expires in 1 hour</b>.</p>`
        };

        // Hash the OTP
        const saltRounds = 10;
        const hashedOTP = await bcrypt.hash(otp, saltRounds);
        const newOTPVerification = new UserOTPVerification({
            userId: _id,
            otp: hashedOTP,
            createdAt: Date.now(),
            expireAt: Date.now() + 3600000,
        });

        // Save OTP record
        await UserOTPVerification.deleteMany({ userId: _id })

        await newOTPVerification.save();

        // Send email
        await transporter.sendMail(mailOption);

        // Send a single response at the end of the try block

    } catch (error) {
        // Handle errors and send an error response
        console.error(error);
        res.status(500).json({
            status: "FAILED",
            message: error.message
        });
    }
};
const loadOTPpage = async (req, res) => {

    try {
        const userId = req.query.userId;
        console.log(userId); // Log the userId for debugging
        res.render('User/OTPverificationPage', { message: '', id: userId, user: "" });

    } catch (error) {
        console.log(error.message);
    }
}
const checkOTPValid = async (req, res) => {
    try {
        const { OTP, ID } = req.body;
        console.log("userId: " + ID);

        if (OTP === '') {
            return res.render("User/OTPverificationPage", { message: "Empty data is not allowed", id: ID, user: "" });
        }

        const OTPRecord = await UserOTPVerification.findOne({ userId: ID });

        if (!OTPRecord) {
            return res.render("User/OTPverificationPage", { message: "Enter a valid OTP", id: ID, user: "" });
        }

        const { expireAt, userId, otp } = OTPRecord;

        if (expireAt < Date.now()) {
            await UserOTPVerification.deleteOne({ userId });
            return res.render("User/OTPverificationPage", { message: "The code has expired, please try again", id: ID, user: "" });
        }

        const isValid = await bcrypt.compare(OTP, otp);

        if (!isValid) {
            return res.render("User/OTPverificationPage", { message: "The entered OTP is invalid", id: ID, user: "" });
        }

        console.log("userId: " + userId);
        console.log(ID, typeof ID);
        await Customer.updateOne({ _id: ID }, { $set: { is_varified: true } });
        await UserOTPVerification.deleteOne({ userId });
        console.log("Completed");
        return res.redirect('/user-Login');
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
};
const loadLogin = async (req, res) => {
    try {
        res.render("User/login", { user: req.session.user })
    } catch (error) {
        console.log(error.message)
    }
}
const checkUserValid = async (req, res) => {

    const { email, password } = req.body

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
}
//forget password
const loadForgetPage = (req, res) => {
    try {
        if (!req.session.user) {
            return res.render("User/ForgetPassword", { user: req.session.user, success: "" })
        }
    } catch (error) {
        console.log(error.message)
    }
}
const ForgetPasswordcheckingValid = async (req, res) => {
    try {
        const email = req.body.email;
        const user = await Customer.findOne({ email: email }); // Use findOne instead of find
        if (user) {


            // Delete existing OTPs for the user
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

            // Save the new OTP document
            const otp2 = await newOTPVerification.save();


            // Sending a mail to the user
            await transporter.sendMail(mailOption);

            res.redirect(`/user/set-new-password?id=${user._id}`);



        } else {
            req.flash('error', 'The email was not found. Please try again or sign up.');
            return res.render("User/ForgetPassword", { message: "The email was not found. Please try again or sign up.", user: req.session.user, success: "" });
        }
    } catch (error) {
        console.error(error.message);
        req.flash('error', 'An error occurred while processing your request.');
        res.redirect('/'); // Redirect to an appropriate page or handle the error as needed.
    }
};
const loadChangePass = (req, res) => {
    const id = req.query.id
    console.log("________________________" + id)
    try {
        res.render('User/setPAssword', { user: req.session.user, id })
    } catch (error) {
        console.log(error.message)
    }
}
const validOTPsetPass = async (req, res) => {
    console.log(req.body);
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

        console.log("Password updated successfully.");
        return res.redirect("/");
    } catch (error) {
        console.error(error.message);
        // Handle any errors here, such as rendering an error page or returning an error response.
        res.status(500).send("Internal Server Error");
    }
};
//session destrying User Logouting
const userLogouting = (req, res, next) => {
    try {
        if (req.session.user) {
            req.session.destroy();
            return res.redirect("/")
        } else {
            return res.redirect('/')
        }

    } catch (error) {
        console.log(error.message);
    }
}
const loadShop = async (req, res) => {
    let products
    const query = req.query.query
    const highTOLowPRice = req.query.HLPrice
    const min = parseInt(req.query.min) || 0
    const max = parseInt(req.query.max) || 1000000

    try {

        if (query) {
            const regex = new RegExp(query, 'i');
            products = await Product.find({ is_delete: false, in_stock: true, product_name: regex , price:{$gt:min,$lt:max}});
        } else {
            products = await Product.find({ is_delete: false, in_stock: true  , price:{$gt:min,$lt:max}})
        }
       

        let pipeline = [
            {
                $match: {
                    is_delete: false,
                    in_stock: true,
                }
            },
            {
                $group: {
                    _id: null,
                    colors: { $addToSet: "$color" },
                    categories: { $addToSet: "$category" },
                    brands: { $addToSet: "$brand_name" }
                }
            }, {
                $project: {
                    _id: 0
                }
            }
        ];

        const filter = await Product.aggregate(pipeline);
        console.log(filter)
        res.render('User/shop', { query: "", products, user: req.session.user, success: req.flash('success'), filter })
    } catch (error) {
        console.log(error.message);
    }
}
//user Profile 
const loadProfile = async (req, res) => {
    try {
        console.log("ADHHD --------------------------------------------" + req.session.user)
        const user = await Customer.findById(req.session.user)
        const address = await Address.find({ User: req.session.user })
        console.log(address);
        if (user) {

            res.render('User/profile/userprofile', { user, address })
        }
    } catch (error) {
        console.log(error.message)
    }
}
const loadEditPage = async (req, res) => {
    try {
        const id = req.body.id
        const user = await Customer.findById({ _id: id })
        if (user) {

            res.render("User/profile/editProfile", { user })
        }
    } catch (error) {
        console.log(error.message);
    }
}
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
        console.log("POTTI")

    } catch (error) {
        console.log(error.message);
    }
}
const addImageProfile = async (req, res) => {
    const id = req.body.id
    try {
        await Customer.findByIdAndUpdate(id, { $set: { 'image.data': req.file.buffer, 'image.contentType': req.file.mimetype } })

        res.redirect('/user/profile')

    } catch (error) {
        console.log(error.message)
    }
}
const deleteUserProfile = async (req, res) => {
    try {
        const id = req.query.id
        if (id) {
            await Customer.findByIdAndUpdate(id, { $unset: { image: {} } })


            return res.redirect("/user/profile")
        }
    } catch (error) {
        console.log(error.message);
    }
}
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
        console.log(error.message)
    }
}
const loadAddAddressPage = (req, res) => {
    console.log(req.body + "IAM HADHI__________________________________________________________________________");
    const id = req.body.id
    const back = req.body.back
    try {

        res.render("User/profile/addAddress", { id, back })
    } catch (error) {
        console.log(error.message)
    }
}
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
            Region: req.body.region,
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
        console.log(error.message)
    }
}
const editAddress = async (req, res) => {
    try {
        const address = await Address.findById(req.body.id)
        const bc = req.body.back
        if (address) {


            return res.render("User/profile/editAddress", { address, bc })


        }
    } catch (error) {
        console.log(error.message)
    }
}
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
                Region: req.body.region,
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
        console.log(error.message);
    }
}
const deleteAddress = async (req, res) => {
    try {
        const deleteAddress = await Address.findByIdAndDelete(req.body.id)
        if (deleteAddress) {
            return res.redirect("/user/profile")
        }

    } catch (error) {
        console.log(error.message);
    }
}
//display the product 
const displayProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.query.productId)

        const user = req.session.user
        if (product) {
            res.render("User/product_details", { product, user })
        }
    } catch (error) {
        console.log(error.message);
    }
}
//ADD TO CART DISPLAY AND EDIT DELETE
const loadCart = async (req, res) => {
    try {
        console.log(req.session.user)
        const currentUser = await Customer.findById(req.session.user).populate('cart.product');
        const Products = currentUser.cart
        console.log(Products)
        if (Products) {

            return res.render('User/cart', { currentUser, user: req.session.user, Products, success: '' })
        }
    } catch (error) {
        console.log(error.nessage)
    }
}
const productAddToCart = async (req, res) => {
    try {
        const user = await Customer.findById(req.session.user)
        const quantity = 1
        const product = await Product.findById(req.query.productId)
        const checkthestock = product.stock_count

        const total = quantity * product.price
        let totalCartAmount = 0;
        user.cart.forEach(item => {
            totalCartAmount += item.total;
        })
        const existingCartItemIndex = await user.cart.find(item => item.product.equals(product._id))

        if (existingCartItemIndex && existingCartItemIndex.quantity + 1 <= checkthestock) {
            existingCartItemIndex.quantity += quantity
            existingCartItemIndex.total += total
            user.totalCartAmount = (totalCartAmount + total)

            await user.save()
            req.flash('success', 'product added to cart successfully')
            const referer = req.headers.referer;
            const originalPage = referer || '/';
            res.redirect(originalPage)
        }
        else if (!existingCartItemIndex) {
            user.cart.push({ product: product._id, quantity, total })
            user.totalCartAmount = (totalCartAmount + total);

            await user.save()
            req.flash('success', 'product added to cart successfully')
            const referer = req.headers.referer;
            const originalPage = referer || '/';
            res.redirect(originalPage)
        } else {
            req.flash('success', 'stock was exeeded...')
            const referer = req.headers.referer;
            const originalPage = referer || '/';
            res.redirect(originalPage)
        }
    } catch (error) {
        console.log(error.message); // Corrected from "cosnole.log(error.message)"
    }
}
const updateCartQuantity = async (req, res) => {
    try {
        const user = await Customer.findById(req.session.user)

        //geting the data's through the ajax product id and the new quantity
        const cartProductId = req.body.cartItemId
        const newQuantity = req.body.quantity

        //find the cart product in the user cart list by the ID

        const cartProduct = user.cart.find(item => item.product._id.equals(cartProductId));
        if (!cartProduct) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        //find the Cart Product and the checking the stock and update it */* stock managment / inventory mangment 
        const product = await Product.findById(cartProduct.product);

        if (newQuantity > product.stock_count) {
            // Handle the case where newQuantity exceeds stock_count
            // req.flash('success', 'stock limit exceeded!')
            // console.log('Stock was exceeded');
            // You can return an success response here if needed
            // For example:
            // return res.render("/user/cart",{success: req.flash('success')})
            return res.json({ stock: product.stock_count, error: "stock limit exceeded!" })
        }


        //Calculating the new cart quantity and update 
        const newTotal = newQuantity * product.price
        cartProduct.quantity = newQuantity
        cartProduct.total = newTotal
        //caluculating the total cart amount
        let totalCartAmount = 0;
        user.cart.forEach((item) => {
            totalCartAmount += item.total;
        });

        user.totalCartAmount = totalCartAmount
        //*diplay the success message*// 
        await user.save();

        res.json({ message: 'Cart item quantity updated successfully', totalCartAmount, total: newTotal });
    } catch (error) {
        console.log(error.messgae)
    }
}
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
        console.log(error.message)
    }
}
//CHECKOUT PAGE
const loadchekout = async (req, res) => {
    const user_id = req.session.user
    const mess = req.query.message
    try {

        const User = await Customer.findById(req.session.user).populate('cart.product');

        const cart = User.cart
        const address = await Address.find({ User: user_id })

        const selectAddress = await Address.findOne({ in_use: true, User: user_id })

        res.render("User/checkout", { User, cart, address, user: req.session.user, selectAddress, message: mess })
    } catch (error) {
        console.log(error.message)
    }
}
const selectAddress = async (req, res) => {
    const Id = req.session.user
    const addressId = req.body.addressId
    console.log(addressId)
    try {
        const existSelectAdd = await Address.updateMany({ User: Id }, { $unset: { in_use: '' } });
        const selectaddress = await Address.findByIdAndUpdate(addressId, { $set: { in_use: true } });
        console.log(selectaddress)
        if (selectaddress && existSelectAdd) {
            req.flash('success', 'Address selected successfully....');
            return res.redirect("/user/Checkout")
        } else {
            console.log("hia")
        }
    } catch (error) {
        console.log(error.message)
    }
}
//ORDER
const placeOrder = async (req, res) => {

    couponDiscount = parseInt(req.body.discountAmount) || 0;
    const couponId = req.body.codeID
    console.log(couponId)
    try {
        const paymentOption = req.body.PaymentOption;
        // Validate payment option
        if (!["COD", "Wallet", "paypal"].includes(paymentOption)) {

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



        if (paymentOption == "COD") {
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
                } else {
                    console.log("Cannot find any cart items...");
                }
            } else {
                console.log("COD not working properly ");
            }

        } else if (paymentOption == "Wallet") {
            // Implement wallet payment logic here

        } else if (paymentOption == "paypal") {

            return res.redirect(`/user/product/online-payment?discount=${couponDiscount}&id=${couponId}`);

        }

    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ error: 'An error occurred while placing the order' });
    }
};


//display the order ditails
const loadOrder = async (req, res) => {
    try {
        const userId = req.session.user
        const userOrder = await Order.find({ user: userId })
            .populate("user")
            .populate("products.product")
            .populate("deliveryAddress")
            .exec();
        console.log(userOrder)
        return res.render("User/profile/showOrders", { userOrder, user: userId })

    } catch (error) {
        console.log(error.message)
    }
}
const loadOrderProductDetails = async (req, res) => {
    const orderId = req.body.Products; // Assuming you pass orderId as a route parameter
    console.log("____________________" + orderId)
    try {
        // Validate orderId here (e.g., check if it's a valid ObjectId)

        const order = await Order.findById(orderId).populate("products.product");

        if (!order) {
            return res.status(404).send("Order not found"); // Handle case where the order is not found
        }

        const products = order.products;

        // Render the view with product details
        return res.render("User/profile/showProductDetails", { user: req.session.user, products });
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error"); // Handle other errors
    }
};
const cancelOrder = async (req, res) => {
    const orderId = req.body.orderId
    try {
        const cancel = await Order.findByIdAndUpdate(orderId, { $set: { orderCanceled: true, } })
        cancel.products.forEach(async (pro) => {
            const proUpdateQuantity = await product.findById(pro.product)
            proUpdateQuantity.stock_count += pro.quantity
            proUpdateQuantity.save()
        })
        return res.redirect("/user/show-order-details/")
    } catch (error) {
        console.log(error.message)
    }
}


//wallet
const loadWallet = async (req, res) => {
    try {
        const user = await Customer.findById(req.session.user)
            .sort({ "walletHistory.date": -1 });

        return res.render("User/profile/wallet", { user, sessionUser: req.session.user });

    } catch (error) {
        console.log(error.message);
    }
}

const loadShopFilter = async (req,res) => {
    console.log(req.body)
    try {
        
    } catch (error) {
        console.log(error.message)
    }
}









module.exports = {
    loadRegister, loadhome, insertUser, loadOTPpage, checkOTPValid, loadLogin, checkUserValid,
    userLogouting, loadShop, loadShopFilter, loadProfile, loadEditPage, updateUser, addImageProfile, deleteUserProfile,
    userUpdatePassword, loadAddAddressPage, addUserAddress, editAddress, updateAddress, deleteAddress, displayProduct,
    productAddToCart, loadCart, updateCartQuantity, deleteProductCart, loadForgetPage, ForgetPasswordcheckingValid,
    loadChangePass, validOTPsetPass, loadchekout, selectAddress, placeOrder, loadOrder, loadOrderProductDetails,
    cancelOrder, loadWallet
}


