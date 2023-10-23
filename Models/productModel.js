const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    product_name : {
        type:String,
        required:true
    },
    manufacturer_name : {
        type:String,
        required:true
    },
    brand_name : {
        type:String,
        required:true
    },
    idendification_no : {
        type:String,
        required:true,   
    },
    price:{
        type:Number,
        required:true
    },
    relese_date : {
        type:Date,
        require:true
    },
    stock_count : {
        type:Number,
        required:true
    },
    description : {
        type:String,
        require:true
    },
    category : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'productCategry'
    },
    product_tags : {
        type:String,
        
    },
    in_stock : {
        type:Boolean,
        required:true
    },
    images : [{
        data:Buffer,
        contentType:String
    }],
    color : {
        type:String,
        required:true
    },
    meterial : {
        type:String,
        required:true
    },
    is_delete : {
        type:Boolean,
        default:false
    },
    offer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer'
    },
    offerPrice: { 
        type: Number,
        default:0
    },
    categoryOfferPrice: {
        type:Number,
        default:0
    }
})

const product = mongoose.model(
    "product",
    productSchema
)

module.exports = product