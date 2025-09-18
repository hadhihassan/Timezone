const transporter = require('../config/email');
const env = require('../config/env.config');
const UserOTPVerification = require('../Models/UserOTPVerification')
const { hashOTP, generateOTP } = require('./otpService');

// SEND EMAIL TO USER FOR VERFICATION 
const sendOTPVerificationEmail = async ({ _id, email }, res) => {
    try {
        const otp = generateOTP()
        // Mail options
        const mailOption = {
            from: env.AUTH_EMAIL, // Use the correct environment variable
            to: email,
            subject: "Verify Your Email",
            html: `<p>Enter <b>${otp}</b> in the app to verify your email address and complete the verification</p>
                   <p>This code <b>expires in 1 minute</b>.</p>`
        };
        // Hash the OTP
        const hashedOTP = await hashOTP(otp);
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
};

module.exports = {
    sendOTPVerificationEmail
}