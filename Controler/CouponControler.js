const Customer = require('../Models/customerModel')
const UserOTPVerification = require('../Models/UserOTPVerification')
const Product = require('../Models/productModel')
const Address = require('../Models/userAddress')
const Order = require("../Models/orderModel");
const product = require("../Models/productModel");
const Coupon = require("../Models/couponModel")



const loadCoupons = async (req, res) => {
    try {
        const Coupons = await Coupon.find()
        res.render("User/profile/coupons", { user: req.session.user, Coupons })
    } catch (error) {
        console.log(error.message);
    }

}

const applayingCoupon = async (req, res) => {
    const code = req.body.couponCode;
    console.log(code);
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
                console.log("totaCartAmount " + user.totalCartAmount)
                const discountAmount = Math.floor((findCode.discount_amount_or_percentage / 100) * user.totalCartAmount);
                const newAmount = Math.floor(user.totalCartAmount - discountAmount);
                console.log(newAmount, discountAmount + " (Percentage)");

                return res.json({ newAmount, discountAmount, id: findCode._id });
            } else {
                const discountAmount = findCode.discount_amount_or_percentage;
                const newAmount = Math.floor(user.totalCartAmount - discountAmount);
                console.log(newAmount, discountAmount + " (Fixed Amount)");
                return res.json({ newAmount, discountAmount, id: findCode._id });
            }
        } else {
            return res.json({ error: "The coupon valid at purchase above 500 rupees.." });
        }



    } catch (error) {
        // Handle any errors here
    }
};


module.exports = {
    loadCoupons, applayingCoupon
}