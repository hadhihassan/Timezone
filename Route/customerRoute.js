const express = require('express')
const Customer_Route = express.Router()
const uplodaImg = require("../middleware/uploadimages")
const Auth = require("../middleware/Auth")

const { loadPaymentPage, checkRazorpaySignature } = require("../Controler/order")

const { loadRegister, loadhome, insertUser, loadOTPpage, checkOTPValid, loadLogin, checkUserValid,
    userLogouting, loadShop, loadProfile, loadEditPage, updateUser, addImageProfile, deleteUserProfile,
    userUpdatePassword, loadAddAddressPage, addUserAddress, editAddress, updateAddress, deleteAddress,
    displayProduct, productAddToCart, loadCart, updateCartQuantity, deleteProductCart, loadForgetPage,
    ForgetPasswordcheckingValid, loadChangePass, validOTPsetPass, loadchekout, selectAddress, placeOrder,
    loadOrder, loadOrderProductDetails, cancelOrder, authonticateToken
} = require('../Controler/customerControler')
const multer = require("multer")
const Customer = require('../Models/customerModel')

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })




//home page render
Customer_Route.get('/', loadhome)



//login and logout
Customer_Route.get('/user-Login', Auth.userAuth, loadLogin)
    .post('/user-Login', checkUserValid)
    .get('/user_LogOut', userLogouting)




//signup validation
Customer_Route.get("/register", Auth.userAuth, loadRegister)
Customer_Route.post("/register", insertUser,)




//otp verification 
Customer_Route.get('/user/otpVerification', Auth.userAuth, loadOTPpage)
    .post('/user/otpVerification', checkOTPValid)




//forget password
Customer_Route.get('/user/forget-password', loadForgetPage)
    .post('/user/forget-password', ForgetPasswordcheckingValid)
    .get('/user/set-new-password', loadChangePass)
    .post("/user/set-new-password-check-otp", validOTPsetPass)


//render the shoping page 
Customer_Route.get('/user/shop', loadShop)




//user profile 
Customer_Route.get("/user/profile", Auth.authonticateToken, Auth.logged, loadProfile)
    .post("/user/edit_profile", Auth.authonticateToken, Auth.logged, loadEditPage)
    .post("/user/Update-profile", Auth.authonticateToken, Auth.logged, updateUser)
    .post("/user/profile/addimg", upload.single('images'), addImageProfile)
    .get("/user/profile/image-remove", Auth.authonticateToken, Auth.logged, deleteUserProfile)
    .post("/user/profile/upadtePassword", Auth.authonticateToken, Auth.logged, userUpdatePassword)




//add address 
Customer_Route.post('/user/address/add-user', loadAddAddressPage)
    .post('/user/address/add', addUserAddress)
    .post("/user/address/edit", editAddress)
    .post("/user/address/edit-and-update", updateAddress)
    .post("/user/address/delete", deleteAddress)





// USER PROFILE ORDER DETALS
Customer_Route.get("/user/show-order-details/", loadOrder)
    .post("/user/profile/show-product-details/", loadOrderProductDetails)




// display product
Customer_Route.get("/user/displayProduct", displayProduct)




//CART ADD DELETE DIPSPLAY
Customer_Route.get("/user/cart",Auth.authonticateToken, Auth.logged, loadCart)
    .get("/user/product/addcart", Auth.logged, productAddToCart)
    .post("/update-cart-item-quantity", updateCartQuantity)
    .get('/user/remove-Cart-item', deleteProductCart)





//**CHECKOUT PAGES** 
Customer_Route.get('/user/Checkout', loadchekout)
    .post("/user/address/selsect", selectAddress)





//ORDER PLACE
//canel order
Customer_Route.post("/user/order/Cancel/", cancelOrder)
Customer_Route.post("/user/place-order", placeOrder)
              .get("/user/product/online-payment", loadPaymentPage)

// ONLINE PAYMENT AND ORDER SAVE 

Customer_Route.post("/online-payment-order-save", checkRazorpaySignature)







module.exports = Customer_Route