const mongoose = require('mongoose')
const Schema = mongoose.Schema


const CouponSchema = new Schema({
    coupon_name : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    discount_type : {
        type : String,
        enum: ["Percentage", "Amount"],
        required: true,
    },
    minimumPurchaseAmount: {
        type: Number,
        min: 0,
    },
    expaire_date : {
        type : Date,
        
    },
    coupon_done : {
        type : Boolean,
        default : false
    },
    discount_amount_or_percentage : {
        type : Number,
        required : true
    },
    code:{
        type:String,
        unique:true,
        required:true,
    },

})

CouponSchema.pre("save", function (next) {
    const currentDate = Date.now();
    const expaire_date = new Date(currentDate);
    expaire_date.setDate(expaire_date.getDate() + 7);
    this.expaire_date = expaire_date;
    next();
});

const coupon = mongoose.model(
     "coupon",
     CouponSchema
)

module.exports = coupon;