const Razorpay = require('razorpay');

var razorpay = new Razorpay({
  key_id : process.env.RAZORPAY_ID_KEY_,
  key_secret : process.env.RAZORPAY_SECRET_KEY_,
});
