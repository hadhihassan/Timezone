const mongoose = require('mongoose')



const CustomerSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    mobile: {
        type: String,
        require: true
    },
    gender: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    conformpassword: {
        type: String,
        require: true
    },
    is_Admin: {
        type: Boolean,
        default: false
    },
    image: {
        data: Buffer,
        contentType: String
    },
    is_varified: {
        type: Boolean,
        default: false
    },
    is_block: {
        type: Boolean,
        default: false
    },
    cart: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product',
        },
        quantity: {
            type: Number,
            default: 1
        },
        total: {
            type: Number,
            default: 0
        }
    }],
    totalCartAmount: {
        type: Number,
        default: 0
    },
    earnedCoupons: [{
        coupon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Coupon',
        },
        isUsed: {
            type: Boolean,
            default: false,
        },
    }],
    wallet: {
        type: Number,
        default: 0
    },
    walletHistory: [{
        date: {
            type: Date,
        },
        amount: {
            type: Number
        },
        message: {
            type: String
        }
    }],
    referralCode: {
        type: String,
    },
    referred: {
        type: Boolean,
        required: true,
        default : false,
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
    }

})


function generateRandomCode(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters.charAt(randomIndex);
    }
    return code;
}

CustomerSchema.pre('save', async function (next) {
    if (!this.referralCode) {
        let uniqueReferralCode;
        do {
            uniqueReferralCode = generateRandomCode(6); // You can customize the length of the referral code
        } while (await this.constructor.findOne({ referralCode: uniqueReferralCode }));

        this.referralCode = uniqueReferralCode;
    }
    next();
});


const Customer = mongoose.model(
    'Customer',
    CustomerSchema)

module.exports = Customer;
