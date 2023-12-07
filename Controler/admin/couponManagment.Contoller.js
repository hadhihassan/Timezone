const Coupon = require("../../Models/couponModel")


//**COUPONS MANAGEMENT**//


//LIST ALL COUPONS
const loadCouponPage = async (req, res) => {
    try {
        let allCoupon = await Coupon.find();
        let search = req.query.search;
        if (search && search !== "") {
            allCoupon = await Coupon.find({
                coupon_name: { $regex: new RegExp(search, 'i') }
            });
        }
        return res.render("admin/Coupon/index", { allCoupon, search, a: "" });
    } catch (error) {
        console.log(error.message)
    }
}//RENDER THE CREATE COUPON PAGE
const loadAddCoupon = async (req, res) => {
    try {
        return res.render("admin/Coupon/add", { a: "" })
    } catch (error) {
        console.log(error.message);
    }
}//CREATE THE NEW COUPON 
const createCoupon = async (req, res) => {
    console.log(req.body)
    const { couponName, type, MinimumpurchaseAmount, amountOrPercentage, Description } = req.body;
    try {

        // Create a function to generate a unique coupon code
        function generateCouponCode() {
            const length = 6;
            const characters = '0123456789';
            let couponCode = '';

            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * characters.length);
                couponCode += characters.charAt(randomIndex);
            }

            return couponCode;
        }


        const code = generateCouponCode();
        const CouponCode = new Coupon({
            coupon_name: couponName,
            description: Description,
            discount_type: type,
            minimumPurchaseAmount: MinimumpurchaseAmount,
            discount_amount_or_percentage: amountOrPercentage,
            code: code, // Assign the generated code to the 'code' property
        });

        if (CouponCode) {
            await CouponCode.save();
            console.log("coupon saved");
            return res.redirect("/admin/coupon-management");
        } else {
            console.log("not working");
        }

        return res.render("admin/Coupon/add", { message: "Please fill in all fields...." });


    } catch (error) {
        // Handle the error appropriately
        console.error(error);
        // Return an error response if necessary
        return res.status(500).send("Error creating the coupon.");
    }
}//COUPON SOFT DELETE 
const deleteCoupon = async (req, res) => {
    const id = req.params.id
    try {
        const deleteCoupon = await Coupon.findByIdAndUpdate(id, { $set: { coupon_done: true } })
        return res.redirect("/admin/coupon-management")
    } catch (error) {
        console.log(error.message);
    }
}//ACTIVE THE COUPON
const ActiveCoupon = async (req, res) => {
    const id = req.params.id
    try {
        const ActiveCoupon = await Coupon.findByIdAndUpdate(id, { $set: { coupon_done: false } })
        return res.redirect("/admin/coupon-management")
    } catch (error) {
        console.log(error.message);
    }
}//RENDER THE COUPON EDIT PAGE
const loadCouponEdit = async (req, res) => {
    try {
        const couponId = req.params.id
        const findCoupon = await Coupon.findById(couponId)
        if (findCoupon) {
            res.render("admin/Coupon/edit", {
                findCoupon
            })
        }
    } catch (error) {
        console.log(error.message)
    }
}//ADD THE EDITED COUPON INTO DATABASE 
const addEditCoupon = async (req, res) => {
    try {
        const updateData = req.body;
        const findCouponUpdate = await Coupon.findById(req.body.id);

        if (!findCouponUpdate) {
            return res.status(404).json({ error: 'Coupon not found' });
        }
        console.log(req.body);
        findCouponUpdate.coupon_name = updateData.couponName;
        findCouponUpdate.minimumPurchaseAmount = updateData.MinimumpurchaseAmount;
        findCouponUpdate.discount_amount_or_percentage = updateData.amountOrPercentage;
        findCouponUpdate.description = updateData.Description;



        const updatedCoupon = await findCouponUpdate.save();
        if (updatedCoupon) {
            console.log(updatedCoupon);
            return res.redirect("/admin/coupon-management");
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: 'An error occurred while updating the coupon.' });
    }
};


module.exports = {
    loadCouponPage, createCoupon, deleteCoupon,
    ActiveCoupon, loadAddCoupon, loadCouponEdit, addEditCoupon,
}
