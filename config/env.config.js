const dotenv = require('dotenv')
dotenv.config();

const env = {
    AUTH_EMAIL: process.env.AUTH_EMAIL,
    AUTH_PASS: process.env.AUTH_PASS,
    JWTSECRET: process.env.JWTSECRET,
    MONGODB_URL: process.env.MONGODB_URL,
    PORT: process.env.PORT || 4000,
    RAZORPAY_ID_KEY: process.env.RAZORPAY_ID_KEY,
    RAZORPAY_SECRET_KEY: process.env.RAZORPAY_SECRET_KEY,
    SESSION_SECRET: process.env.SESSION_SECRET,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
}

module.exports = env