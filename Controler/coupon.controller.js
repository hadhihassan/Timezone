const Coupon = require('../Models/couponModel')
const Customer = require('../Models/customerModel')


//APPLAYING THE COUPON WHILE PLACE ORDER
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
            return res.json({ error: `The coupon valid at purchase above ${findCode.minimumPurchaseAmount} rupees..` });
        }
    } catch (error) {
        res.render("User/404", { message: "An error occurred. Please try again later." });
    }
}
//RENDER THE COUPONS PAGE
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

module.exports = {
    applayingCoupon,
    loadCoupons
}