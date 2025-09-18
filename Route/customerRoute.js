const Customer_Route = require("express").Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const Auth = require("../middleware/Auth");

const {
  loadPaymentPage,
  checkRazorpaySignature,
  loadInvoice,
} = require("../Controler/paymentController");
const {
  loadShop,
  displayProduct,
  loadhome,
} = require("../Controler/customerControler");
const Customer = require("../Models/customerModel");
const {
  loadProfile,
  addImageProfile,
  deleteUserProfile,
  loadEditPage,
  updateUser,
  userUpdatePassword,
} = require("../Controler/customer/profile.controller");
const {
  loadAddAddressPage,
  addUserAddress,
  editAddress,
  updateAddress,
  deleteAddress,
  selectAddress,
} = require("../Controler/customer/address.controller");
const {
  loadCart,
  productAddToCart,
  updateCartQuantity,
  deleteProductCart,
} = require("../Controler/cart/cart.controller");
const {
  loadChekout,
  placeOrder,
  loadOrder,
  loadOrderProductDetails,
  cancelOrder,
  returnProductAction,
} = require("../Controler/order/order.controller");
const {
  loadWallet,
  addProductInWishlist,
  deleteItemInWishlist,
  loadWishlist,
} = require("../Controler/wishlist.controller");
const {
  loadCoupons,
  applayingCoupon,
} = require("../Controler/coupon.controller");
const {
  ForgetPasswordcheckingValid,
  checkOTPValid,
  checkUserValid,
  forgetPassResendOtp,
  insertUser,
  loadChangePass,
  loadForgetPage,
  loadLogin,
  loadOTPpage,
  loadRegister,
  resedOtp,
  userLogouting,
  validOTPsetPass,
} = require("../Controler/auth.Controller");

//home page render
Customer_Route.get("/", loadhome);

//login and logout
Customer_Route.get("/user-Login", Auth.userAuth, loadLogin)
  .post("/user-Login", checkUserValid)
  .get("/user_LogOut", userLogouting);

//signup validation
Customer_Route.get("/register", Auth.userAuth, loadRegister).post(
  "/register",
  insertUser
);

//otp verification
Customer_Route.get("/user/otpVerification", Auth.userAuth, loadOTPpage)
  .post("/user/otpVerification", checkOTPValid)
  .post("/resend-otp", resedOtp);

//forget password
Customer_Route.get("/user/forget-password", loadForgetPage)
  .post("/user/forget-password", ForgetPasswordcheckingValid)
  .get("/user/set-new-password", loadChangePass)
  .post("/user/set-new-password-check-otp", validOTPsetPass)
  .post("/forget-password-otp-resend", forgetPassResendOtp);

//render the shoping page
Customer_Route.get("/user/shop", loadShop);

//User Profile
Customer_Route.get("/user/profile", Auth.logged, loadProfile)
  .post("/user/edit_profile", Auth.logged, loadEditPage)
  .post("/user/Update-profile", Auth.logged, updateUser)
  .post("/user/profile/addimg", upload.single("images"), addImageProfile)
  .get("/user/profile/image-remove", Auth.logged, deleteUserProfile)
  .post("/user/profile/upadtePassword", Auth.logged, userUpdatePassword);

//User Address
Customer_Route.post("/user/address/add-user", Auth.logged, loadAddAddressPage)
  .post("/user/address/add", Auth.logged, addUserAddress)
  .post("/user/address/edit", Auth.logged, editAddress)
  .post("/user/address/edit-and-update", Auth.logged, updateAddress)
  .post("/user/address/delete", Auth.logged, deleteAddress);

// USER PROFILE ORDER DETALS
Customer_Route.get("/user/show-order-details/", Auth.logged, loadOrder).post(
  "/user/profile/show-product-details/",
  Auth.logged,
  loadOrderProductDetails
);

// display product
Customer_Route.get("/user/displayProduct", displayProduct);

//CART
Customer_Route.get("/user/cart", Auth.logged, loadCart)
  .get("/user/product/addcart", Auth.logged, productAddToCart)
  .post("/update-cart-item-quantity", updateCartQuantity)
  .get("/user/remove-Cart-item", deleteProductCart);

//**CHECKOUT PAGES**
Customer_Route.get("/user/Checkout", Auth.logged, loadChekout).post(
  "/user/address/selsect",
  selectAddress
);

//CANCEL ORDER --- ORDER PLACE
Customer_Route.post("/user/order/Cancel/", Auth.logged, cancelOrder)
  .post("/user/place-order", Auth.logged, placeOrder)
  .get("/user/product/online-payment", Auth.logged, loadPaymentPage)
  .post("/return-product", Auth.logged, returnProductAction)
  .post("/order/Invoice", loadInvoice);

// ONLINE PAYMENT AND ORDER SAVE
Customer_Route.post("/online-payment-order-save", checkRazorpaySignature);

//Coupon
Customer_Route.get("/coupon", Auth.logged, loadCoupons).post(
  "/applay-coupon-code",
  Auth.logged,
  applayingCoupon
);

//Wallet
Customer_Route.get("/Wallet", loadWallet);

//WISHLIST
Customer_Route.get("/whishlist", Auth.logged, loadWishlist)
  .get("/add-wishlist", Auth.logged, addProductInWishlist)
  .get("/delete-item-wishlist", Auth.logged, deleteItemInWishlist);

module.exports = Customer_Route;
