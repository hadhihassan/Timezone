const express = require("express")
const admin_Route = express.Router()

const Auth = require('../middleware/Auth')

const imgResizing = require("../middleware/uploadimages")

const { loadAaminLogin, loginValidation, adminValid, adminLogout, displayCustomers, 
    UnblockTheUser, blockTheUser, addProductCategory, loadCategory, deleteCategory, loadAddCategory,
    loadProductCreate, createProduct,  loadProductPage , editProduct ,loadProductEditPage ,productDeactivate,productActivate,
    deleteImgDelete, loadOrder, updateOrderStatus, EditCategory, loadEditCategory, deleteCategoryImg, loadCouponPage, createCoupon
     } = require('../Controler/adminControler')

     const multer = require("multer")

const { loadDash } = require("../Controler/dasboard")

const { createOffer } = require("../Controler/OfferController")

const storage = multer.memoryStorage()
const upload = multer({storage:storage})










//HOME PAGE DASHBOARD  

 admin_Route.get("/dashboard", Auth.adminAuth, loadDash)

//login

 admin_Route.get("/login", loadAaminLogin)

            .post("/login",  loginValidation, adminValid)

            .get("/logout",adminLogout)

//Customer managment

 admin_Route.get("/Customers", displayCustomers)

            .get('/Customers/Unblock-theUser', UnblockTheUser)

            .get('/Customers/block-theUser', blockTheUser)

//CATEGORY MANGEMNT

 admin_Route.post('/product/add-category',upload.single('image'), addProductCategory)

            .get('/product/add-category', Auth.adminAuth, loadAddCategory)

            .get('/product/Category-management',Auth.adminAuth, loadCategory)

            .get("/Category/:id/Delete", Auth.adminAuth, deleteCategory)

            .get("/Category/:id/Edit-Category", Auth.adminAuth, loadEditCategory)

            .post("/Category/Edit-Category", Auth.adminAuth,upload.single('image'), EditCategory)
            .get("/category/:id/images-delete", deleteCategoryImg)
//PRODUCT MANGEMNT

 admin_Route.get('/product/create', loadProductCreate)

            .post('/product/create',upload.array('images', 3), createProduct)

            .get('/product',  loadProductPage)

            .get('/product/:id/Edit',  loadProductEditPage)

            .post('/product/Edit',upload.array('images',5),editProduct)

            .get('/product/:id/Deactive',productDeactivate)

            .get('/product/:id/Active',productActivate)

            .get("/product/:imageId/:id/deleteImg", deleteImgDelete)

//ORDER MANAGMENT 

 admin_Route.get("/orders",loadOrder)
            .get("/order/action-update", updateOrderStatus)



//COUPON MANGMENT 
 admin_Route.get("/product/coupon-management", loadCouponPage)            
            .post("/coupon/create", createCoupon)   
            
//OFFER MANAGMENT 
 admin_Route.post("/offer/create", createOffer)


module.exports = admin_Route