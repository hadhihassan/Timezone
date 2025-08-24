const express = require("express")
const admin_Route = express.Router()
const multer = require("multer")
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const cron = require('node-cron')

const Auth = require('../middleware/Auth')
const {
    loadCouponPage,
    createCoupon,
    deleteCoupon,
    ActiveCoupon,
    loadAddCoupon,
    loadCouponEdit,
    addEditCoupon
} = require('../Controler/admin/couponManagment.Contoller')
const {
    addProductCategory,
    loadCategory,
    deleteCategory,
    loadEditCategory,
    EditCategory,
    loadAddCategory,
    deleteCategoryImg
} = require('../Controler/admin/categoryMangmentController')
const {
    loadAaminLogin,
    loginValidation,
    adminValid,
    adminLogout,
} = require('../Controler/admin/adminControler')
const {
    OfferCheckAndDeleteOffer
} = require("../utils/OfferExpaireyDateChecker")
const {
    createOffer,
    loadAddOfferPage,
    loadOffersPage,
    loadOfferEdit,
    saveEditOffer,
    deleteOffer,
    activeOffer,
} = require("../Controler/OfferController")
const {
    loadDash
} = require("../Controler/dasboard")
const {
    displayCustomers,
    UnblockTheUser,
    blockTheUser
} = require('../Controler/admin/userMangmentController')
const {
    loadProductCreate,
    createProduct,
    loadProductPage,
    editProduct,
    loadProductEditPage,
    productDeactivate,
    productActivate,
    deleteImgDelete,
} = require('../Controler/admin/productManagmentController')
const {
    loadOrder,
    updateOrderStatus,
    updateReturnRequest
} = require('../Controler/admin/orderManagmentController')
const {
    loadReportManagemnt,
    calculateReport,
    reportDownload,
    reportDownloadinExecle
} = require('../Controler/admin/reportManagmertContoller')

//HOME PAGE DASHBOARD  
admin_Route.get("/dashboard", Auth.adminAuth, loadDash)

//LOGIN
admin_Route.get("/login", loadAaminLogin)
    .post("/login", loginValidation, adminValid)
    .get("/logout", adminLogout)

//CUSTOMER MANAGEMENT
admin_Route.get("/Customers", Auth.adminAuth, displayCustomers)
    .get('/Customers/Unblock-theUser', Auth.adminAuth, UnblockTheUser)
    .get('/Customers/block-theUser', Auth.adminAuth, blockTheUser)

//CATEGORY MANGEMNT
admin_Route.post('/product/add-category', Auth.adminAuth, upload.single('image'), addProductCategory)
    .get('/product/add-category', Auth.adminAuth, loadAddCategory)
    .get('/product/Category-management', Auth.adminAuth, loadCategory)
    .get("/Category/:id/Delete", Auth.adminAuth, deleteCategory)
    .get("/Category/:id/Edit-Category", Auth.adminAuth, loadEditCategory)
    .post("/Category/Edit-Category", Auth.adminAuth, upload.single('image'), EditCategory)
    .get("/category/:id/images-delete", Auth.adminAuth, deleteCategoryImg)

//PRODUCT MANGEMNT
admin_Route.get('/product/create', Auth.adminAuth, loadProductCreate)
    .post('/product/create', Auth.adminAuth, upload.array('images', 10), createProduct)
    .get('/product', Auth.adminAuth, loadProductPage)
    .get('/product/:id/Edit', Auth.adminAuth, loadProductEditPage)
    .post('/product/Edit', Auth.adminAuth, upload.array('images', 10), editProduct)
    .get('/product/:id/Deactive', Auth.adminAuth, productDeactivate)
    .get('/product/:id/Active', Auth.adminAuth, productActivate)
    .get("/product/:imageId/:id/deleteImg", Auth.adminAuth, deleteImgDelete)

//ORDER MANAGMENT 
admin_Route.get("/orders", Auth.adminAuth, loadOrder)
    .get("/order/action-update", Auth.adminAuth, updateOrderStatus)
    .get("/order/return-product", Auth.adminAuth, updateReturnRequest)

//COUPON MANGMENT 
admin_Route.get("/coupon-management", Auth.adminAuth, loadCouponPage)
    .post("/coupon/create", createCoupon)
    .get("/coupon/add-coupon", Auth.adminAuth, loadAddCoupon)
    .get("/coupon/:id/Delete", Auth.adminAuth, deleteCoupon)
    .get("/coupon/:id/Active", Auth.adminAuth, ActiveCoupon)
    .get("/coupon/:id/Edit-coupon", Auth.adminAuth, loadCouponEdit)
    .post("/coupon/edited", Auth.adminAuth, addEditCoupon)

//OFFER MANAGMENT 
admin_Route.post("/offer/create/", Auth.adminAuth, createOffer)
    .get("/offer/create/", Auth.adminAuth, loadAddOfferPage)
    .get("/Offer/", Auth.adminAuth, loadOffersPage)
    .get("/offer/:id/Edit-offer/", Auth.adminAuth, loadOfferEdit)
    .post("/offer/edit-save/", Auth.adminAuth, saveEditOffer)
    .get("/offer/:id/Delete-offer/", Auth.adminAuth, deleteOffer)
    .get("/offer/:id/active-offer/", Auth.adminAuth, activeOffer)
//REPORT MANAGMENT
admin_Route.get("/Report-managment", Auth.adminAuth, loadReportManagemnt)
    .post('/Report-managment', Auth.adminAuth, calculateReport)
    .post('/Report-managment-download', Auth.adminAuth, reportDownload)
    .get('/reportDownload', Auth.adminAuth, reportDownloadinExecle)


//TRIGGER CHECK THE OFFER EXPIRY AND DELETE IT AT evey 12am and 12 pm
cron.schedule('0 */12 * * *', () => {
    OfferCheckAndDeleteOffer()
});





module.exports = admin_Route