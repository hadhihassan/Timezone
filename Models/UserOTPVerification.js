const mongoose = require('mongoose')
const Schema = mongoose.Schema


const UserOTPVerificationSChema = new Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Customer'
    },
    Email:{
        type:String,
        require:true,
    },
    otp:String,
    createdAt:Date,
    expireAt:Date,
})

const UserOTPVerification = mongoose.model(
     "UserOTPVerification",
      UserOTPVerificationSChema
)

module.exports = UserOTPVerification;